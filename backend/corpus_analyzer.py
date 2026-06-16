"""
corpus_analyzer.py — Analyse d'un corpus documentaire → ontologie candidate.

Pour chaque document (chemin local traduit hôte→conteneur, ou URL Web) :
  1. extraction du texte par sections (page PDF, titres HTML/MD, paragraphes DOCX) ;
  2. découpage en chunks porteurs de leur référence {doc, chapter, page} ;
  3. extraction d'éléments OWL + atomes SWRL via l'API Anthropic (Claude).

Le module renvoie une liste de résultats { "ref": {...}, "elements": {...} } ;
la fusion dans l'ontologie connectée + la table de provenance sont faites côté main.py.
"""
from __future__ import annotations

import json
import re
import urllib.request
import urllib.error
from html.parser import HTMLParser
from pathlib import Path

from triple_store import host_to_container

MAX_CHUNK_CHARS = 6000      # taille max d'un chunk envoyé au LLM
MAX_CHUNKS = 40             # garde-fou coût/temps (chunks analysés au total)
ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
DEFAULT_MODEL = "claude-sonnet-4-6"

SYSTEM_PROMPT = (
    "You are an ontology-extraction assistant. From the given document excerpt, extract a "
    "CANDIDATE OWL ontology fragment AND SWRL rules that are explicitly supported by the text. "
    "Return ONLY valid minified JSON (no markdown, no commentary) with EXACTLY this shape:\n"
    '{"classes":[{"id":"","label":"","comment":"","subClassOf":[]}],'
    '"object_properties":[{"id":"","label":"","domain":[],"range":[]}],'
    '"datatype_properties":[{"id":"","label":"","domain":[],"range":[]}],'
    '"individuals":[{"id":"","label":"","types":[]}],'
    '"swrl_rules":[{"id":"","label":"","comment":"","body":[],"head":[]}]}\n'
    "Rules: ids are CamelCase local names, NO spaces, NO prefixes. domain/range/types/subClassOf "
    "reference class or property ids. SWRL atoms use ONLY these shapes: "
    '{"type":"type_atom","var":"?x","class_id":"Foo"} ; '
    '{"type":"property_atom","subject":"?x","property_id":"hasBar","object":"?y"} ; '
    '{"type":"equality_atom","var":"?x","operator":">","value":"0"}. '
    "If nothing relevant is present, return empty arrays. Never invent content absent from the text."
)


# ── Extraction de texte par format ──────────────────────────────────────────

class _HTMLToSections(HTMLParser):
    """Découpe un HTML en sections {chapter, text} d'après les titres h1..h4."""
    def __init__(self):
        super().__init__()
        self.sections = [{"chapter": "", "text": ""}]
        self._in_title = False
        self._title_buf = ""
        self._skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"):
            self._skip += 1
        if tag in ("h1", "h2", "h3", "h4"):
            self._in_title = True
            self._title_buf = ""

    def handle_endtag(self, tag):
        if tag in ("script", "style") and self._skip:
            self._skip -= 1
        if tag in ("h1", "h2", "h3", "h4"):
            self._in_title = False
            self.sections.append({"chapter": self._title_buf.strip(), "text": ""})

    def handle_data(self, data):
        if self._skip:
            return
        if self._in_title:
            self._title_buf += data
        else:
            self.sections[-1]["text"] += data


def _sections_from_html(html: str):
    p = _HTMLToSections()
    p.feed(html)
    out = []
    for s in p.sections:
        txt = re.sub(r"[ \t]*\n[ \t]*", "\n", s["text"]).strip()
        txt = re.sub(r"\n{3,}", "\n\n", txt)
        if txt:
            out.append({"chapter": s["chapter"], "page": None, "text": txt})
    return out


def _sections_from_text(text: str):
    """TXT / Markdown : découpe sur les titres Markdown (#…) ou numérotés (1.2 …)."""
    lines = text.splitlines()
    sections, cur = [], {"chapter": "", "page": None, "text": ""}
    head_re = re.compile(r"^(#{1,6}\s+.+|(\d+(\.\d+)*)\s+\S.+)$")
    for ln in lines:
        if head_re.match(ln.strip()) and cur["text"].strip():
            sections.append(cur)
            cur = {"chapter": ln.strip().lstrip("# ").strip(), "page": None, "text": ""}
        elif head_re.match(ln.strip()):
            cur["chapter"] = ln.strip().lstrip("# ").strip()
        else:
            cur["text"] += ln + "\n"
    if cur["text"].strip():
        sections.append(cur)
    return [s for s in sections if s["text"].strip()] or [{"chapter": "", "page": None, "text": text}]


def _sections_from_pdf(data: bytes):
    from pypdf import PdfReader
    import io
    reader = PdfReader(io.BytesIO(data))
    out = []
    for i, page in enumerate(reader.pages):
        try:
            txt = (page.extract_text() or "").strip()
        except Exception:
            txt = ""
        if txt:
            out.append({"chapter": "", "page": i + 1, "text": txt})
    return out


def _sections_from_docx(data: bytes):
    import docx
    import io
    doc = docx.Document(io.BytesIO(data))
    sections, cur = [], {"chapter": "", "page": None, "text": ""}
    for para in doc.paragraphs:
        style = (para.style.name or "").lower() if para.style else ""
        if style.startswith("heading") and para.text.strip():
            if cur["text"].strip():
                sections.append(cur)
            cur = {"chapter": para.text.strip(), "page": None, "text": ""}
        elif para.text.strip():
            cur["text"] += para.text + "\n"
    if cur["text"].strip():
        sections.append(cur)
    return sections or [{"chapter": "", "page": None, "text": "\n".join(p.text for p in doc.paragraphs)}]


def _fetch_bytes(location: str) -> tuple[bytes, str]:
    """Renvoie (contenu, ext) pour une URL ou un chemin local."""
    if re.match(r"^https?://", location, re.I):
        req = urllib.request.Request(location, headers={"User-Agent": "SWOWL/1.1"})
        with urllib.request.urlopen(req, timeout=20) as r:
            data = r.read()
            ctype = r.headers.get("Content-Type", "")
        ext = Path(location.split("?")[0]).suffix.lower()
        if not ext:
            ext = ".html" if "html" in ctype else (".pdf" if "pdf" in ctype else ".txt")
        return data, ext
    # chemin local → traduction hôte → conteneur
    p = Path(host_to_container(location))
    if not p.exists() or not p.is_file():
        raise FileNotFoundError(f"File not found: {location}")
    return p.read_bytes(), p.suffix.lower()


def extract_sections(location: str):
    """Renvoie une liste de sections {chapter, page, text} pour un document."""
    data, ext = _fetch_bytes(location)
    if ext == ".pdf":
        return _sections_from_pdf(data)
    if ext == ".docx":
        return _sections_from_docx(data)
    text = data.decode("utf-8", "replace")
    if ext in (".html", ".htm"):
        return _sections_from_html(text)
    return _sections_from_text(text)


def _chunks(sections, doc_name):
    """Aplati les sections en chunks (taille bornée) porteurs de leur référence."""
    out = []
    for s in sections:
        text = s["text"].strip()
        ref_base = {"doc": doc_name, "chapter": s.get("chapter", ""), "page": s.get("page")}
        if len(text) <= MAX_CHUNK_CHARS:
            out.append({"ref": ref_base, "text": text})
        else:
            for i in range(0, len(text), MAX_CHUNK_CHARS):
                out.append({"ref": ref_base, "text": text[i:i + MAX_CHUNK_CHARS]})
    return out


# ── Appel LLM (Anthropic) ────────────────────────────────────────────────────

def _call_anthropic(api_key: str, model: str, user_text: str, system: str = "") -> str:
    body = json.dumps({
        "model": model or DEFAULT_MODEL,
        "max_tokens": 4096,
        "system": system or SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": user_text}],
    }).encode("utf-8")
    req = urllib.request.Request(
        ANTHROPIC_URL, data=body, method="POST",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=90) as r:
        data = json.loads(r.read().decode("utf-8", "replace"))
    parts = data.get("content", [])
    return "".join(p.get("text", "") for p in parts if p.get("type") == "text")


def _parse_json(text: str) -> dict:
    """Extrait le 1er objet JSON d'une réponse (tolère les fences ```json)."""
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```[a-zA-Z]*\n?|\n?```$", "", text).strip()
    start = text.find("{")
    if start < 0:
        return {}
    depth, end = 0, -1
    for i in range(start, len(text)):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    try:
        return json.loads(text[start:end]) if end > 0 else {}
    except Exception:
        return {}


def analyse(documents, api_key: str, model: str = DEFAULT_MODEL, system_prompt: str = ""):
    """Analyse les documents et renvoie (results, errors).

    results : [{ "ref": {doc, chapter, page}, "elements": {...} }]
    errors  : [{ "doc": name, "error": str }]
    """
    results, errors = [], []
    all_chunks = []
    for d in documents:
        name = (d.get("name") or "").strip() or (d.get("location") or "?")
        location = (d.get("location") or "").strip()
        if not location:
            continue
        try:
            sections = extract_sections(location)
            all_chunks.extend(_chunks(sections, name))
        except Exception as e:  # noqa: BLE001
            errors.append({"doc": name, "error": f"{type(e).__name__}: {e}"})

    truncated = len(all_chunks) > MAX_CHUNKS
    for chunk in all_chunks[:MAX_CHUNKS]:
        if not chunk["text"].strip():
            continue
        try:
            raw = _call_anthropic(api_key, model, chunk["text"], system_prompt)
            elements = _parse_json(raw)
            if elements:
                results.append({"ref": chunk["ref"], "elements": elements})
        except urllib.error.HTTPError as e:
            detail = ""
            try:
                err = json.loads(e.read().decode("utf-8", "replace"))
                detail = (err.get("error") or {}).get("message", "")
            except Exception:
                pass
            errors.append({"doc": chunk["ref"]["doc"], "error": f"LLM HTTP {e.code} {detail}"})
            if e.code in (401, 403):
                break  # clé invalide → inutile de continuer
        except Exception as e:  # noqa: BLE001
            errors.append({"doc": chunk["ref"]["doc"], "error": f"{type(e).__name__}: {e}"})

    if truncated:
        errors.append({"doc": "*", "error": f"Corpus truncated to {MAX_CHUNKS} chunks for this run."})
    return results, errors
