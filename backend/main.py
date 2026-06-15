"""
main.py — FastAPI application — OWL/SWRL Editor API
"""
from __future__ import annotations
import uuid
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, UploadFile, File, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel as PydanticModel

from owl_model import (
    OWLOntology, OWLClass, OWLObjectProperty, OWLDatatypeProperty,
    OWLAnnotationProperty,
    OWLIndividual, SWRLRule, SparqlQuery, InferenceResult, PropertyPresence,
    ObjectPropertyAssertion,
)
from triple_store import store
from inference_engine import InferenceEngine
from serializers import export_owl_xml, export_turtle, export_jsonld

logger = logging.getLogger("owl_editor")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Restaure automatiquement la dernière ontologie utilisée au démarrage."""
    onto = store.load_last()
    if onto:
        logger.info(f"✅ Auto-chargement de l'ontologie : {onto.id}")
    else:
        logger.info("ℹ️  Aucune ontologie précédente à restaurer.")
    yield


app = FastAPI(
    title="OWL/SWRL Editor API",
    description="API REST pour créer et éditer des ontologies OWL 2 avec règles SWRL",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers ──────────────────────────────────────────────────

def _collect_descendants(children_of: dict, root_id: str) -> set:
    """BFS sur un index parent → enfants pré-construit (O(n))."""
    descendants: set = set()
    to_visit = {root_id}
    while to_visit:
        current = to_visit.pop()
        for child in children_of.get(current, ()):
            if child not in descendants:
                descendants.add(child)
                to_visit.add(child)
    return descendants


def _collect_class_descendants(onto: OWLOntology, class_id: str) -> set:
    """Retourne l'ensemble des IDs de toutes les classes descendantes (récursivement)."""
    children_of: dict = {}
    for cls in onto.classes:
        for parent in (cls.subClassOf or []):
            if isinstance(parent, str):
                children_of.setdefault(parent, []).append(cls.id)
    return _collect_descendants(children_of, class_id)


def _collect_prop_descendants(prop_list: list, prop_id: str) -> set:
    """Retourne l'ensemble des IDs de toutes les sous-propriétés descendantes (récursivement)."""
    children_of: dict = {}
    for p in prop_list:
        for parent in (p.subPropertyOf or []):
            children_of.setdefault(parent, []).append(p.id)
    return _collect_descendants(children_of, prop_id)


def _rename_swrl_atom(atom, old_id: str, new_id: str, kind: str) -> None:
    """Propage un renommage dans un atome SWRL (récursif pour NAFBlock et Conditional)."""
    if kind == 'class' and getattr(atom, 'class_id', None) == old_id:
        atom.class_id = new_id
    if kind == 'property' and getattr(atom, 'property_id', None) == old_id:
        atom.property_id = new_id
    for a in getattr(atom, 'atoms', []):
        _rename_swrl_atom(a, old_id, new_id, kind)
    for a in getattr(atom, 'condition', []):
        _rename_swrl_atom(a, old_id, new_id, kind)
    for a in getattr(atom, 'consequent', []):
        _rename_swrl_atom(a, old_id, new_id, kind)


import re as _re

def _validate_ncname(id_str: str, label: str = "ID") -> None:
    """Raise 422 if id_str is not a valid OWL local name (XML NCName)."""
    if not id_str or not id_str.strip():
        raise HTTPException(422, f"{label} is required.")
    if _re.match(r'^[0-9]', id_str):
        raise HTTPException(422, f"{label} '{id_str}' cannot start with a digit (OWL NCName rule).")


def _cascade_rename_class(onto: OWLOntology, old_id: str, new_id: str) -> None:
    """Propage le renommage d'une classe à toutes ses références dans l'ontologie."""

    def rename_expr(expr):
        if isinstance(expr, str):
            return new_id if expr == old_id else expr
        # Restrictions avec filler (SomeValuesFrom, AllValuesFrom, cardinalités)
        if hasattr(expr, 'filler') and expr.filler == old_id:
            expr.filler = new_id
        # Expressions booléennes (UnionOf, IntersectionOf) avec opérands
        if hasattr(expr, 'operands'):
            expr.operands = [new_id if op == old_id else op for op in expr.operands]
        # ComplementOf
        if hasattr(expr, 'operand') and expr.operand == old_id:
            expr.operand = new_id
        return expr

    for cls in onto.classes:
        cls.subClassOf      = [rename_expr(e) for e in cls.subClassOf]
        cls.equivalentClass = [rename_expr(e) for e in cls.equivalentClass]
        cls.disjointWith    = [new_id if s == old_id else s for s in cls.disjointWith]

    for prop in onto.object_properties:
        prop.domain = [new_id if d == old_id else d for d in prop.domain]
        prop.range  = [new_id if r == old_id else r for r in prop.range]

    for prop in onto.datatype_properties:
        prop.domain = [new_id if d == old_id else d for d in prop.domain]

    for ind in onto.individuals:
        ind.types = [new_id if t == old_id else t for t in ind.types]

    for rule in onto.swrl_rules:
        for atom in list(rule.body) + list(rule.head):
            _rename_swrl_atom(atom, old_id, new_id, 'class')


def _cascade_rename_property(onto: OWLOntology, old_id: str, new_id: str) -> None:
    """Propage le renommage d'une propriété à toutes ses références."""

    # Restrictions dans les classes
    def rename_in_expr(expr):
        if hasattr(expr, 'property') and expr.property == old_id:
            expr.property = new_id
        return expr

    for cls in onto.classes:
        cls.subClassOf      = [rename_in_expr(e) for e in cls.subClassOf]
        cls.equivalentClass = [rename_in_expr(e) for e in cls.equivalentClass]

    for prop in onto.object_properties:
        prop.subPropertyOf = [new_id if s == old_id else s for s in prop.subPropertyOf]
        if prop.inverseOf == old_id:
            prop.inverseOf = new_id
        for chain in prop.propertyChainAxiom:
            chain.chain = [new_id if c == old_id else c for c in chain.chain]

    for prop in onto.datatype_properties:
        prop.subPropertyOf = [new_id if s == old_id else s for s in prop.subPropertyOf]

    for ind in onto.individuals:
        for a in ind.objectAssertions:
            if a.property == old_id:
                a.property = new_id
        for a in ind.dataAssertions:
            if a.property == old_id:
                a.property = new_id

    for rule in onto.swrl_rules:
        for atom in list(rule.body) + list(rule.head):
            _rename_swrl_atom(atom, old_id, new_id, 'property')


def _sync_domain_markers(onto: OWLOntology, prop_id: str,
                         old_domain: set, new_domain: set) -> None:
    """Synchronise les marqueurs PropertyPresence dans les classes
    lorsque le domain d'une propriété change.
    - classes retirées du domain → marqueur supprimé
    - classes ajoutées au domain → marqueur ajouté (s'il n'existe pas déjà)
    """
    for cls_id in old_domain - new_domain:
        cls_obj = next((c for c in onto.classes if c.id == cls_id), None)
        if cls_obj:
            cls_obj.subClassOf = [
                r for r in cls_obj.subClassOf
                if not (hasattr(r, 'type') and r.type == '_marker'
                        and getattr(r, 'property', None) == prop_id)
            ]
    for cls_id in new_domain - old_domain:
        cls_obj = next((c for c in onto.classes if c.id == cls_id), None)
        if cls_obj:
            already = any(
                hasattr(r, 'type') and r.type == '_marker'
                and getattr(r, 'property', None) == prop_id
                for r in cls_obj.subClassOf
            )
            if not already:
                cls_obj.subClassOf.append(PropertyPresence(property=prop_id))


def require_onto():
    onto = store.get()
    if not onto:
        raise HTTPException(404, "Aucune ontologie chargée. Créez ou importez une ontologie d'abord.")
    return onto


def run_inferences() -> InferenceResult:
    onto = require_onto()
    engine = InferenceEngine(onto)
    return engine.run()


# ════════════════════════════════════════════════════════════════
# REGISTRE D'ONTOLOGIES
# ════════════════════════════════════════════════════════════════

class RegisterRequest(PydanticModel):
    name: str
    path: str
    uri: str
    prefix: str = ""
    ns_prefixes: list = []   # [{prefix, namespace}] — namespaces référencés/importés

class UpdateEntryRequest(PydanticModel):
    name: str
    path: str
    uri: str
    prefix: str = ""
    ns_prefixes: list = None   # [{prefix, namespace}] — None = ne pas toucher aux imports


@app.get("/api/ontologies", tags=["Ontologie"])
def list_ontologies():
    """Retourne toutes les ontologies du registre."""
    return store.list_registry()


@app.post("/api/ontologies/register", tags=["Ontologie"], status_code=201)
def register_ontology(req: RegisterRequest):
    """Enregistre une nouvelle ontologie (from scratch) dans le registre."""
    entries = store.list_registry()
    if any(e["name"] == req.name for e in entries):
        raise HTTPException(409, f"Une ontologie nommée '{req.name}' existe déjà.")
    entry = store.register(req.name, req.path, req.uri, req.prefix, ns_prefixes=req.ns_prefixes)
    return entry.to_dict()


class RegisterJsonRequest(PydanticModel):
    path: str
    name: str = None
    uri: str = None
    prefix: str = None
    ns_prefixes: list = None   # [{prefix, namespace}] — None = ne pas toucher aux imports

@app.post("/api/ontologies/register-json", tags=["Ontologie"], status_code=201)
def register_json(req: RegisterJsonRequest):
    """Register an existing .json ontology file into the registry (Load workflow)."""
    from pathlib import Path as FP
    import json as _json
    container_path = host_to_container(req.path)
    p = FP(container_path)
    if not p.exists():
        raise HTTPException(404, f"File not found: {req.path}")
    try:
        data = _json.loads(p.read_text(encoding="utf-8"))
    except Exception as e:
        raise HTTPException(400, f"Cannot read JSON: {e}")
    resolved_name   = req.name   or data.get("name") or p.stem
    resolved_uri    = req.uri    or data.get("id", "")
    resolved_prefix = req.prefix if req.prefix is not None else data.get("prefix", "")
    entries = store.list_registry()
    if any(e["name"] == resolved_name for e in entries):
        raise HTTPException(409, f"An ontology named '{resolved_name}' already exists in the registry.")
    entry = store.register(resolved_name, req.path, resolved_uri, resolved_prefix,
                           ns_prefixes=req.ns_prefixes)
    # Le fichier existe déjà → store.register ne le réécrit pas : on y reflète
    # imports/import_labels (+ ns_prefixes) si l'utilisateur les a fournis/édités.
    if req.ns_prefixes is not None:
        try:
            data["imports"]       = entry.imports
            data["import_labels"] = entry.import_labels
            data["ns_prefixes"]   = req.ns_prefixes
            p.write_text(_json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        except Exception:
            pass
    return entry.to_dict()


@app.put("/api/ontologies/{name}", tags=["Ontologie"])
def update_ontology_entry(name: str, req: UpdateEntryRequest):
    """Modifie les métadonnées d'une entrée du registre."""
    entry = store.update_entry(name, req.name, req.path, req.uri, req.prefix, ns_prefixes=req.ns_prefixes)
    if not entry:
        raise HTTPException(404, f"Ontologie '{name}' introuvable dans le registre.")
    return entry.to_dict()


@app.get("/api/ontologies/importable", tags=["Ontologie"])
def list_importable_ontologies(exclude: str = Query(default="", description="Name of the ontology to exclude (the import target itself)")):
    """Retourne les ontologies importables.
    Critères : non readonly, uri et prefix définis, différente de l'ontologie cible (exclude)."""
    return [
        e.to_dict() for e in store._registry.values()
        if not e.readonly and e.uri and e.prefix and e.name != exclude
    ]


class ImportsUpdateRequest(PydanticModel):
    imports: list[str] = []


@app.put("/api/ontologies/{name}/imports", tags=["Ontologie"])
def update_ontology_imports(name: str, req: ImportsUpdateRequest):
    """Met à jour la liste des URIs importées d'une entrée du registre."""
    entry = store._registry.get(name)
    if not entry:
        raise HTTPException(404, f"Ontologie '{name}' introuvable dans le registre.")
    entry.imports = req.imports

    # Instantané préfixe+nom de chaque URI importée, résolu depuis le registre
    # courant. Permet de réafficher "plm:RoHS_Ontology" même si l'ontologie
    # importée quitte le registre par la suite. Les anciens labels d'URIs encore
    # importées sont conservés ; ceux des URIs retirées sont oubliés.
    def _resolve_entry(uri: str):
        for e in store._registry.values():
            if e.uri == uri or e.uri.rstrip('#') == uri.rstrip('#'):
                return e
        return None

    labels: dict = {}
    for uri in req.imports:
        imp = _resolve_entry(uri)
        if imp is not None:
            labels[uri] = {"prefix": imp.prefix, "name": imp.name}
        elif uri in entry.import_labels:
            labels[uri] = entry.import_labels[uri]   # conserver l'instantané existant
    entry.import_labels = labels

    store._save_registry()
    # Persister aussi dans le fichier .json si c'est l'ontologie connectée,
    # afin que la déclaration d'import voyage avec le fichier (owl:imports).
    onto = store.get()
    if entry.connected and onto is not None:
        onto.imports = list(req.imports)
        onto.import_labels = dict(labels)
        store.save()
    return entry.to_dict()


@app.get("/api/ontologies/current/imported-entities", tags=["Ontologie"])
def get_imported_entities():
    """Retourne les entités de toutes les ontologies importées transitivement par l'ontologie
    courante (BFS sur l'arbre des imports). Les builtins readonly sont ignorés (owl, rdfs, rdf
    sont déjà gérés nativement par l'éditeur). Chaque entité est enrichie de _imported,
    _importPrefix et _importName."""
    import json as _json
    from pathlib import Path as FPath

    require_onto()
    # Chercher l'entrée connectée (le nom dans le JSON peut différer du nom du registre)
    root_entry = next((e for e in store._registry.values() if e.connected), None)
    result: dict = {
        "classes": [], "object_properties": [],
        "datatype_properties": [], "annotation_properties": [],
        "individuals": [], "swrl_rules": [], "queries": [],
        "display_rules": {"single": {}, "multi": {}},
    }
    if not root_entry:
        return result

    def _resolve(uri: str):
        """Retourne l'entrée de registry correspondant à un URI (normalisation du # final)."""
        for e in store._registry.values():
            if e.uri == uri or e.uri == uri.rstrip('#') or uri == e.uri.rstrip('#'):
                return e
        return None

    # BFS : on visite chaque URI importée une seule fois (cycle-safe)
    visited_uris: set = set()
    queue: list = list(root_entry.imports or [])

    while queue:
        uri = queue.pop(0)
        if uri in visited_uris:
            continue
        visited_uris.add(uri)

        imp_entry = _resolve(uri)
        if not imp_entry:
            continue
        # Les builtins W3C (readonly) sont gérés nativement — on continue le BFS
        # pour propager leurs imports déclarés, mais on ne charge pas leurs entités.
        if not imp_entry.readonly:
            container_path = host_to_container(imp_entry.path)
            p = FPath(container_path)
            if p.exists():
                try:
                    data = _json.loads(p.read_text(encoding="utf-8"))
                    # Préfixe contextuel (choisi dans le wizard de l'ontologie qui importe).
                    # - entrée de label présente → on respecte sa valeur (même vide → affichage par namespace) ;
                    # - aucune entrée → repli sur le préfixe propre de l'ontologie importée.
                    lab = root_entry.import_labels.get(uri)
                    ctx_prefix = lab.get("prefix", "") if isinstance(lab, dict) else imp_entry.prefix
                    tag = {"_imported": True, "_importPrefix": ctx_prefix,
                           "_importName": imp_entry.name, "_importNamespace": uri}
                    for key in ("classes", "object_properties", "datatype_properties",
                                "annotation_properties", "individuals", "swrl_rules", "queries"):
                        for entity in (data.get(key) or []):
                            result[key].append({**entity, **tag})
                    # Merge display_rules — first-visited (closest import) wins over deeper imports
                    imp_dr = data.get("display_rules") or {}
                    for dr_key in ("single", "multi"):
                        for cls_id, rule in (imp_dr.get(dr_key) or {}).items():
                            if cls_id not in result["display_rules"][dr_key]:
                                result["display_rules"][dr_key][cls_id] = rule
                except Exception:
                    pass

        # Enqueue les imports de cet ontologie (cascade)
        for child_uri in (imp_entry.imports or []):
            if child_uri not in visited_uris:
                queue.append(child_uri)

    return result


@app.delete("/api/ontologies/{name}", tags=["Ontologie"])
def unregister_ontology(name: str, delete_file: bool = Query(False, description="Supprime aussi le fichier .json du disque")):
    """Retire une ontologie du registre. Si delete_file=true, supprime aussi le fichier .json."""
    entry = store._registry.get(name)
    if not entry:
        raise HTTPException(404, f"Ontologie '{name}' introuvable dans le registre.")
    host_path = entry.path
    store.unregister(name)
    file_deleted = False
    if delete_file and host_path:
        from pathlib import Path as _P
        p = _P(host_to_container(host_path))
        try:
            if p.exists():
                p.unlink()
                file_deleted = True
        except Exception:
            pass  # suppression best-effort — l'entrée registre est déjà retirée
    return {"unregistered": name, "file_deleted": file_deleted}


@app.post("/api/ontologies/{name}/connect", tags=["Ontologie"])
def connect_ontology(name: str):
    """Connecte une ontologie (la rend active)."""
    onto = store.connect(name)
    if onto is None:
        raise HTTPException(404, f"Ontologie '{name}' introuvable dans le registre.")
    return onto


@app.post("/api/ontologies/disconnect", tags=["Ontologie"])
def disconnect_ontology():
    """Déconnecte l'ontologie active."""
    store.disconnect()
    return {"status": "disconnected"}


@app.get("/api/ontologies/current", tags=["Ontologie"])
def get_current_ontology():
    onto = require_onto()
    # Le préfixe du registre (édité par l'utilisateur, affiché dans l'onglet
    # Ontologies) est TOUJOURS autoritaire : défini → utilisé ; vide → aucun
    # préfixe (on écrase la valeur figée à l'import, ex. 'model_rohs').
    entry = next((e for e in store._registry.values() if e.connected), None)
    if entry is not None:
        onto.prefix = entry.prefix or ""
    return onto


@app.put("/api/ontologies/current", tags=["Ontologie"])
def update_ontology_meta(onto: OWLOntology):
    store.set(onto)
    return onto


@app.put("/api/display-rules", tags=["Ontologie"])
def update_display_rules(rules: dict):
    onto = require_onto()
    onto.display_rules = rules
    store.save()
    return rules


# ── Peek (read prefix/URI without importing) ─────────────────

@app.get("/api/ontologies/peek", tags=["Ontologie"])
def peek_ontology(path: str = Query(..., description="Host path to .owl / .ttl / .json")):
    """Read name, prefix and base URI from an ontology file without modifying state."""
    from pathlib import Path as FP
    import json as _json
    container_path = host_to_container(path)
    p = FP(container_path)
    if not p.exists():
        raise HTTPException(404, f"File not found: {path}")
    name = p.stem  # filename without extension
    fname = p.name.lower()
    try:
        if fname.endswith(".json"):
            data = _json.loads(p.read_text(encoding="utf-8"))
            # namespaces : owl:imports déclarés (import_labels) + ns_prefixes éventuels
            nsl, seen = [], set()
            for uri_i in (data.get("imports") or []):
                lab = (data.get("import_labels") or {}).get(uri_i) or {}
                pfx = lab.get("prefix") or (
                    uri_i.rstrip("#/").rsplit("/", 1)[-1].rsplit("#", 1)[-1][:12].lower() or "imp")
                if uri_i not in seen:
                    seen.add(uri_i); nsl.append({"prefix": pfx, "namespace": uri_i})
            for d in (data.get("ns_prefixes") or []):
                ns_d = d.get("namespace")
                if ns_d and ns_d not in seen:
                    seen.add(ns_d); nsl.append({"prefix": d.get("prefix", ""), "namespace": ns_d})
            return {
                "name":   data.get("name") or name,
                "prefix": data.get("prefix", "onto"),
                "uri":    data.get("id", ""),
                "path":   path,
                "namespaces": nsl,
            }
        # OWL/XML or Turtle — parse with rdflib
        import rdflib
        from rdflib.namespace import OWL, RDF
        # bind_namespaces="none" : ne pas injecter les namespaces par défaut de rdflib
        # (brick, csvw, foaf…) → ne lister que ceux réellement déclarés dans le fichier.
        try:
            g = rdflib.Graph(bind_namespaces="none")
        except TypeError:
            g = rdflib.Graph()   # rdflib ancien sans ce paramètre
        fmt = "turtle" if fname.endswith(".ttl") else "xml"
        g.parse(data=p.read_bytes(), format=fmt)
        # Base URI: look for owl:Ontology declaration
        uri = ""
        for s in g.subjects(RDF.type, OWL.Ontology):
            uri = str(s)
            break
        # Prefix: prefer the namespace binding whose URI matches the ontology base IRI,
        # then fall back to the filename stem, then first non-common binding.
        SKIP = {"owl","rdf","rdfs","xsd","xml","skos","dc","dcterms","schema","sh",""}
        prefix = "onto"
        base_norm = uri.rstrip("#/") if uri else ""

        # 1st pass — find namespace whose URI matches the ontology base IRI
        if base_norm:
            for pfx, ns in g.namespaces():
                if pfx not in SKIP and str(pfx) and str(ns).rstrip("#/") == base_norm:
                    prefix = str(pfx)
                    break
            else:
                # 2nd pass — derive from filename (stem must be a valid identifier)
                stem = FP(container_path).stem
                if stem and stem.replace("-","_").replace(".","_").isidentifier():
                    prefix = stem[:12].lower().replace("-","_")
                else:
                    # Last resort — first non-common binding
                    for pfx, ns in g.namespaces():
                        if pfx not in SKIP and str(pfx):
                            prefix = str(pfx)
                            break
        else:
            # No base IRI found — derive from filename or first binding
            stem = FP(container_path).stem
            if stem and stem.replace("-","_").replace(".","_").isidentifier():
                prefix = stem[:12].lower().replace("-","_")
            else:
                for pfx, ns in g.namespaces():
                    if pfx not in SKIP and str(pfx):
                        prefix = str(pfx)
                        break

        # Namespaces référencés dans le fichier (hors standards et hors base)
        SKIP_NS = {"owl", "rdf", "rdfs", "xsd", "xml"}
        namespaces = []
        seen_ns = set()
        for pfx, ns in g.namespaces():
            pfx_s, ns_s = str(pfx), str(ns)
            if not pfx_s or pfx_s in SKIP_NS:
                continue
            if base_norm and ns_s.rstrip("#/") == base_norm:
                continue  # c'est le namespace de base de l'ontologie elle-même
            if ns_s in seen_ns:
                continue
            seen_ns.add(ns_s)
            namespaces.append({"prefix": pfx_s, "namespace": ns_s})
        # owl:imports déclarés → à proposer dans la section "Imported namespaces"
        # (l'import est un triplet owl:imports, pas forcément un binding xmlns)
        import_uris = [str(o) for s in g.subjects(RDF.type, OWL.Ontology)
                                for o in g.objects(s, OWL.imports)]
        for iu in import_uris:
            if iu in seen_ns:
                continue
            seen_ns.add(iu)
            # Préfixe : binding xmlns correspondant > dernier segment de l'URI > 'imp'
            pfx_i = None
            for p2, ns2 in g.namespaces():
                if str(p2) and str(ns2).rstrip("#/") == iu.rstrip("#/"):
                    pfx_i = str(p2)
                    break
            if not pfx_i:
                seg = iu.rstrip("#/").rsplit("/", 1)[-1].rsplit("#", 1)[-1]
                pfx_i = ("".join(c for c in seg if c.isalnum() or c == "_")[:12].lower()) or "imp"
            namespaces.append({"prefix": pfx_i, "namespace": iu})
        return {"name": name, "prefix": prefix, "uri": uri, "path": path, "namespaces": namespaces}
    except Exception as e:
        raise HTTPException(400, f"Cannot read file: {e}")


# ── Import ───────────────────────────────────────────────────

@app.post("/api/ontologies/import", tags=["Ontologie"])
async def import_ontology(
    file: UploadFile = File(...),
    name: str = Query(..., description="Nom de l'ontologie"),
    path: str = Query(..., description="Chemin de sauvegarde (hôte)"),
    uri: str  = Query(..., description="IRI de base de l'ontologie"),
    prefix: str = Query(""),
):
    content = await file.read()
    fname = file.filename or ""
    if fname.endswith(".ttl"):
        fmt = "turtle"
    elif fname.endswith(".owl") or fname.endswith(".xml") or fname.endswith(".rdf"):
        fmt = "xml"
    elif fname.endswith(".jsonld") or fname.endswith(".json"):
        fmt = "json-ld"
    else:
        fmt = "xml"
    try:
        onto = store.import_from_rdf(content, fmt, name, path, uri, prefix)
        return onto
    except Exception as e:
        raise HTTPException(400, f"Erreur d'import : {e}")


# ── Import depuis chemin filesystem ─────────────────────────

class ImportFromPathRequest(PydanticModel):
    name: str
    owl_path: str   # chemin hôte du fichier OWL/RDF
    save_path: str  # chemin hôte de sauvegarde .json
    uri: str
    prefix: str = ""
    ns_prefixes: list = []   # [{prefix, namespace}] — préfixes des namespaces importés/référencés

@app.post("/api/ontologies/import-from-path", tags=["Ontologie"])
def import_from_path(req: ImportFromPathRequest):
    """Importe une ontologie OWL/RDF depuis un chemin filesystem (sans upload)."""
    from pathlib import Path as FP
    container_owl = host_to_container(req.owl_path)
    p = FP(container_owl)
    if not p.exists():
        raise HTTPException(404, f"Fichier introuvable : {req.owl_path}")
    content = p.read_bytes()
    name = p.name.lower()
    if name.endswith(".ttl"):
        fmt = "turtle"
    elif name.endswith(".jsonld") or name.endswith(".json"):
        fmt = "json-ld"
    else:
        fmt = "xml"
    try:
        onto = store.import_from_rdf(content, fmt, req.name, req.save_path, req.uri,
                                     req.prefix, ns_prefixes=req.ns_prefixes)
        return onto
    except Exception as e:
        raise HTTPException(400, f"Erreur d'import : {e}")


# ── Export ───────────────────────────────────────────────────

@app.get("/api/ontologies/{name}/export", tags=["Ontologie"])
def export_ontology_by_name(name: str, fmt: str = Query("owl", enum=["owl", "ttl", "jsonld", "swrl", "sword"])):
    """Exporte une ontologie enregistrée par son nom, sans modifier l'état connecté."""
    current = store.get()
    entry = store._registry.get(name)
    if not entry:
        raise HTTPException(404, f"Ontologie '{name}' introuvable dans le registre.")
    # Utiliser l'ontologie en mémoire si c'est celle connectée, sinon charger depuis le fichier
    if entry.connected and current:
        target = current
    else:
        target = store._load_from_entry(entry)
        # _load_from_entry a pour effet de bord d'écraser store._ontology : on restaure
        # immédiatement l'ontologie connectée pour ne pas désynchroniser l'état.
        store._ontology = current
        if not target:
            raise HTTPException(404, f"Fichier introuvable pour '{name}'.")
    # Export SWRL JSON
    if fmt == "swrl":
        import json as _json
        rules = [r.model_dump() for r in (target.swrl_rules or [])]
        data  = _json.dumps(rules, indent=2, ensure_ascii=False).encode("utf-8")
        fname = f"{name}_rules.swrl.json"
        return Response(content=data, media_type="application/json",
                        headers={"Content-Disposition": f'attachment; filename="{fname}"'})
    # Export SWORD (format textuel)
    if fmt == "sword":
        from sword_serializer import export_sword
        data  = export_sword(target)
        fname = f"{name}_rules.sword"
        return Response(content=data, media_type="text/plain; charset=utf-8",
                        headers={"Content-Disposition": f'attachment; filename="{fname}"'})
    # Swap temporaire pour utiliser les serialiseurs existants
    store._ontology = target
    try:
        if fmt == "owl":
            data, media, ext = export_owl_xml(store), "application/rdf+xml", "owl"
        elif fmt == "ttl":
            data, media, ext = export_turtle(store), "text/turtle", "ttl"
        else:
            data, media, ext = export_jsonld(store), "application/ld+json", "jsonld"
    finally:
        store._ontology = current  # restaurer l'état
    fname = f"{name}.{ext}"
    return Response(content=data, media_type=media,
                    headers={"Content-Disposition": f'attachment; filename="{fname}"'})


@app.get("/api/ontologies/export", tags=["Ontologie"])
def export_ontology(fmt: str = Query("owl", enum=["owl", "ttl", "jsonld"])):
    require_onto()
    if fmt == "owl":
        data = export_owl_xml(store)
        media = "application/rdf+xml"
        ext = "owl"
    elif fmt == "ttl":
        data = export_turtle(store)
        media = "text/turtle"
        ext = "ttl"
    else:
        data = export_jsonld(store)
        media = "application/ld+json"
        ext = "jsonld"
    return Response(
        content=data, media_type=media,
        headers={"Content-Disposition": f'attachment; filename="ontology.{ext}"'}
    )


# ════════════════════════════════════════════════════════════════
# UNDO / REDO — restore snapshot
# ════════════════════════════════════════════════════════════════

class OntologySnapshot(PydanticModel):
    classes:               list = []
    object_properties:     list = []
    datatype_properties:   list = []
    annotation_properties: list = []
    individuals:           list = []
    swrl_rules:            list = []
    queries:               list = []

@app.post("/api/snapshot/restore", tags=["Undo"])
def restore_snapshot(snap: OntologySnapshot):
    onto = require_onto()
    onto.classes               = [OWLClass(**c)                for c in snap.classes]
    onto.object_properties     = [OWLObjectProperty(**p)       for p in snap.object_properties]
    onto.datatype_properties   = [OWLDatatypeProperty(**p)     for p in snap.datatype_properties]
    onto.annotation_properties = [OWLAnnotationProperty(**p)   for p in snap.annotation_properties]
    onto.individuals           = [OWLIndividual(**i)            for i in snap.individuals]
    onto.swrl_rules            = [SWRLRule(**r)                 for r in snap.swrl_rules]
    onto.queries               = [SparqlQuery(**q)              for q in snap.queries]
    store.save()
    return {"ok": True}


# ════════════════════════════════════════════════════════════════
# CLASSES
# ════════════════════════════════════════════════════════════════

@app.get("/api/classes", tags=["Classes"])
def list_classes():
    return require_onto().classes


@app.post("/api/classes", tags=["Classes"], status_code=201)
def create_class(cls: OWLClass):
    onto = require_onto()
    _validate_ncname(cls.id, "Class ID")
    if any(c.id == cls.id for c in onto.classes):
        raise HTTPException(409, f"Classe '{cls.id}' already exists")
    onto.classes.append(cls)
    # Propager la symétrie disjointWith aux classes déjà existantes
    for other in onto.classes:
        if other.id != cls.id and other.id in cls.disjointWith:
            if cls.id not in other.disjointWith:
                other.disjointWith.append(cls.id)
    # Propager la symétrie equivalentClass aux classes déjà existantes
    for other in onto.classes:
        if other.id != cls.id and other.id in cls.equivalentClass:
            if cls.id not in other.equivalentClass:
                other.equivalentClass.append(cls.id)
    store.save()
    return cls


@app.get("/api/classes/{class_id}", tags=["Classes"])
def get_class(class_id: str):
    onto = require_onto()
    cls = next((c for c in onto.classes if c.id == class_id), None)
    if not cls:
        raise HTTPException(404, f"Classe '{class_id}' not found")
    return cls


@app.put("/api/classes/{class_id}", tags=["Classes"])
def update_class(class_id: str, cls: OWLClass):
    onto = require_onto()
    _validate_ncname(cls.id, "Class ID")
    idx = next((i for i, c in enumerate(onto.classes) if c.id == class_id), None)
    if idx is None:
        raise HTTPException(404, f"Classe '{class_id}' not found")
    if cls.id != class_id:
        # Renommage demandé — vérifier l'absence de conflit puis propager
        if any(c.id == cls.id for i2, c in enumerate(onto.classes) if i2 != idx):
            raise HTTPException(409, f"Classe '{cls.id}' already exists")
        _cascade_rename_class(onto, class_id, cls.id)
    # ── Sync _marker → domain des propriétés ────────────────────
    # Après le cascade-rename, les références utilisent déjà cls.id
    def _markers(subclassof):
        return {r.property for r in subclassof
                if hasattr(r, 'type') and r.type == '_marker'}
    old_markers = _markers(onto.classes[idx].subClassOf)
    new_markers = _markers(cls.subClassOf)
    all_props = onto.object_properties + onto.datatype_properties
    # Propriétés retirées des Asserted Properties → retirer cls.id de leur domain
    for prop_id in old_markers - new_markers:
        p = next((q for q in all_props if q.id == prop_id), None)
        if p and cls.id in p.domain:
            p.domain = [d for d in p.domain if d != cls.id]
    # Propriétés ajoutées aux Asserted Properties → ajouter cls.id à leur domain
    for prop_id in new_markers - old_markers:
        p = next((q for q in all_props if q.id == prop_id), None)
        if p and cls.id not in p.domain:
            p.domain.append(cls.id)
    # ── Sync symétrie equivalentClass ───────────────────────────
    old_equiv = set(e for e in onto.classes[idx].equivalentClass if isinstance(e, str))
    new_equiv = set(e for e in cls.equivalentClass if isinstance(e, str))
    eq_added   = new_equiv - old_equiv
    eq_removed = old_equiv - new_equiv
    for other in onto.classes:
        if other.id == cls.id:
            continue
        if other.id in eq_added and cls.id not in other.equivalentClass:
            other.equivalentClass.append(cls.id)
        if other.id in eq_removed and cls.id in other.equivalentClass:
            other.equivalentClass = [e for e in other.equivalentClass if e != cls.id]
    # ── Sync symétrie disjointWith ───────────────────────────────
    old_disj = set(onto.classes[idx].disjointWith)
    new_disj = set(cls.disjointWith)
    added   = new_disj - old_disj
    removed = old_disj - new_disj
    for other in onto.classes:
        if other.id == cls.id:
            continue
        if other.id in added and cls.id not in other.disjointWith:
            other.disjointWith.append(cls.id)
        if other.id in removed and cls.id in other.disjointWith:
            other.disjointWith = [d for d in other.disjointWith if d != cls.id]
    onto.classes[idx] = cls
    store.save()
    return cls


@app.delete("/api/classes/{class_id}", tags=["Classes"])
def delete_class(class_id: str):
    onto = require_onto()
    before = len(onto.classes)
    # Suppression en cascade : classe + tous ses descendants
    to_delete = _collect_class_descendants(onto, class_id)
    to_delete.add(class_id)
    # ── Bloquer si des individus appartiennent à ces classes ─────
    blocking = []
    for ind in onto.individuals:
        used = [c for c in to_delete if c in (ind.types or [])]
        if used:
            blocking.append(f"'{ind.id}' (type : {', '.join(used)})")
    if blocking:
        raise HTTPException(
            409,
            f"Cannot delete : {len(blocking)} individu(s) use this class — "
            + ", ".join(blocking[:3])
            + (" …" if len(blocking) > 3 else "")
        )
    # Retirer la classe des domains des propriétés
    for cls_id in to_delete:
        for p in onto.object_properties + onto.datatype_properties:
            if cls_id in p.domain:
                p.domain = [d for d in p.domain if d != cls_id]
    onto.classes = [c for c in onto.classes if c.id not in to_delete]
    if len(onto.classes) == before:
        raise HTTPException(404, f"Classe '{class_id}' not found")
    store.save()
    return {"deleted": sorted(to_delete)}


# ════════════════════════════════════════════════════════════════
# OBJECT PROPERTIES
# ════════════════════════════════════════════════════════════════

@app.get("/api/object-properties", tags=["Propriétés"])
def list_object_properties():
    return require_onto().object_properties


@app.post("/api/object-properties", tags=["Propriétés"], status_code=201)
def create_object_property(prop: OWLObjectProperty):
    onto = require_onto()
    _validate_ncname(prop.id, "Property ID")
    if any(p.id == prop.id for p in onto.object_properties):
        raise HTTPException(409, f"ObjectProperty '{prop.id}' already exists")
    onto.object_properties.append(prop)
    # ── Symétrie owl:inverseOf ───────────────────────────────────
    if prop.inverseOf:
        inv = next((p for p in onto.object_properties if p.id == prop.inverseOf), None)
        if inv:
            inv.inverseOf = prop.id
    # ── Marqueurs domain → classes ───────────────────────────────
    _sync_domain_markers(onto, prop.id, set(), set(prop.domain or []))
    store.save()
    return prop


@app.get("/api/object-properties/{prop_id}", tags=["Propriétés"])
def get_object_property(prop_id: str):
    onto = require_onto()
    prop = next((p for p in onto.object_properties if p.id == prop_id), None)
    if not prop:
        raise HTTPException(404, f"ObjectProperty '{prop_id}' not found")
    return prop


@app.put("/api/object-properties/{prop_id}", tags=["Propriétés"])
def update_object_property(prop_id: str, prop: OWLObjectProperty):
    onto = require_onto()
    _validate_ncname(prop.id, "Property ID")
    idx = next((i for i, p in enumerate(onto.object_properties) if p.id == prop_id), None)
    if idx is None:
        raise HTTPException(404, f"ObjectProperty '{prop_id}' not found")
    if prop.id != prop_id:
        if any(p.id == prop.id for i2, p in enumerate(onto.object_properties) if i2 != idx):
            raise HTTPException(409, f"ObjectProperty '{prop.id}' already exists")
        _cascade_rename_property(onto, prop_id, prop.id)
    # ── Symétrie owl:inverseOf ───────────────────────────────────
    old_inverse = onto.object_properties[idx].inverseOf
    new_inverse = prop.inverseOf
    if old_inverse and old_inverse != new_inverse:
        old_inv_prop = next((p for p in onto.object_properties if p.id == old_inverse), None)
        if old_inv_prop and old_inv_prop.inverseOf == prop.id:
            old_inv_prop.inverseOf = None
    if new_inverse:
        new_inv_prop = next((p for p in onto.object_properties if p.id == new_inverse), None)
        if new_inv_prop:
            new_inv_prop.inverseOf = prop.id
    # ── Marqueurs domain → classes ───────────────────────────────
    _sync_domain_markers(onto, prop.id,
                         set(onto.object_properties[idx].domain or []),
                         set(prop.domain or []))
    onto.object_properties[idx] = prop
    store.save()
    return prop


@app.delete("/api/object-properties/{prop_id}", tags=["Propriétés"])
def delete_object_property(prop_id: str):
    onto = require_onto()
    prop = next((p for p in onto.object_properties if p.id == prop_id), None)
    if not prop:
        raise HTTPException(404, f"ObjectProperty '{prop_id}' not found")
    # ── Cascade : collect all descendants ───────────────────────
    to_delete = _collect_prop_descendants(onto.object_properties, prop_id)
    to_delete.add(prop_id)
    for pid in to_delete:
        p = next((x for x in onto.object_properties if x.id == pid), None)
        if not p:
            continue
        # ── Symétrie owl:inverseOf ───────────────────────────────
        if p.inverseOf:
            inv = next((x for x in onto.object_properties if x.id == p.inverseOf), None)
            if inv and inv.inverseOf == pid:
                inv.inverseOf = None
        # ── Marqueurs domain → classes ───────────────────────────
        _sync_domain_markers(onto, pid, set(p.domain or []), set())
    onto.object_properties = [p for p in onto.object_properties if p.id not in to_delete]
    store.save()
    return {"deleted": sorted(to_delete)}


# ════════════════════════════════════════════════════════════════
# DATATYPE PROPERTIES
# ════════════════════════════════════════════════════════════════

@app.get("/api/datatype-properties", tags=["Propriétés"])
def list_datatype_properties():
    return require_onto().datatype_properties


@app.post("/api/datatype-properties", tags=["Propriétés"], status_code=201)
def create_datatype_property(prop: OWLDatatypeProperty):
    onto = require_onto()
    _validate_ncname(prop.id, "Property ID")
    if any(p.id == prop.id for p in onto.datatype_properties):
        raise HTTPException(409, f"DatatypeProperty '{prop.id}' already exists")
    onto.datatype_properties.append(prop)
    # ── Marqueurs domain → classes ───────────────────────────────
    _sync_domain_markers(onto, prop.id, set(), set(prop.domain or []))
    store.save()
    return prop


@app.get("/api/datatype-properties/{prop_id}", tags=["Propriétés"])
def get_datatype_property(prop_id: str):
    onto = require_onto()
    prop = next((p for p in onto.datatype_properties if p.id == prop_id), None)
    if not prop:
        raise HTTPException(404, f"DatatypeProperty '{prop_id}' not found")
    return prop


@app.put("/api/datatype-properties/{prop_id}", tags=["Propriétés"])
def update_datatype_property(prop_id: str, prop: OWLDatatypeProperty):
    onto = require_onto()
    _validate_ncname(prop.id, "Property ID")
    idx = next((i for i, p in enumerate(onto.datatype_properties) if p.id == prop_id), None)
    if idx is None:
        raise HTTPException(404, f"DatatypeProperty '{prop_id}' not found")
    if prop.id != prop_id:
        if any(p.id == prop.id for i2, p in enumerate(onto.datatype_properties) if i2 != idx):
            raise HTTPException(409, f"DatatypeProperty '{prop.id}' already exists")
        _cascade_rename_property(onto, prop_id, prop.id)
    # ── Marqueurs domain → classes ───────────────────────────────
    _sync_domain_markers(onto, prop.id,
                         set(onto.datatype_properties[idx].domain or []),
                         set(prop.domain or []))
    onto.datatype_properties[idx] = prop
    store.save()
    return prop


@app.delete("/api/datatype-properties/{prop_id}", tags=["Propriétés"])
def delete_datatype_property(prop_id: str):
    onto = require_onto()
    prop = next((p for p in onto.datatype_properties if p.id == prop_id), None)
    if not prop:
        raise HTTPException(404, f"DatatypeProperty '{prop_id}' not found")
    # ── Cascade : collect all descendants ───────────────────────
    to_delete = _collect_prop_descendants(onto.datatype_properties, prop_id)
    to_delete.add(prop_id)
    for pid in to_delete:
        p = next((x for x in onto.datatype_properties if x.id == pid), None)
        if p:
            _sync_domain_markers(onto, pid, set(p.domain or []), set())
    onto.datatype_properties = [p for p in onto.datatype_properties if p.id not in to_delete]
    store.save()
    return {"deleted": sorted(to_delete)}


# ════════════════════════════════════════════════════════════════
# ANNOTATION PROPERTIES
# ════════════════════════════════════════════════════════════════

@app.get("/api/annotation-properties", tags=["Propriétés"])
def list_annotation_properties():
    return require_onto().annotation_properties


@app.post("/api/annotation-properties", tags=["Propriétés"], status_code=201)
def create_annotation_property(prop: OWLAnnotationProperty):
    onto = require_onto()
    _validate_ncname(prop.id, "Property ID")
    if any(p.id == prop.id for p in onto.annotation_properties):
        raise HTTPException(409, f"AnnotationProperty '{prop.id}' already exists")
    onto.annotation_properties.append(prop)
    store.save()
    return prop


@app.get("/api/annotation-properties/{prop_id}", tags=["Propriétés"])
def get_annotation_property(prop_id: str):
    onto = require_onto()
    prop = next((p for p in onto.annotation_properties if p.id == prop_id), None)
    if not prop:
        raise HTTPException(404, f"AnnotationProperty '{prop_id}' not found")
    return prop


@app.put("/api/annotation-properties/{prop_id}", tags=["Propriétés"])
def update_annotation_property(prop_id: str, prop: OWLAnnotationProperty):
    onto = require_onto()
    _validate_ncname(prop.id, "Property ID")
    idx = next((i for i, p in enumerate(onto.annotation_properties) if p.id == prop_id), None)
    if idx is None:
        raise HTTPException(404, f"AnnotationProperty '{prop_id}' not found")
    if prop.id != prop_id:
        if any(p.id == prop.id for i2, p in enumerate(onto.annotation_properties) if i2 != idx):
            raise HTTPException(409, f"AnnotationProperty '{prop.id}' already exists")
        # Cascade rename in subPropertyOf references
        for p in onto.annotation_properties:
            if prop_id in p.subPropertyOf:
                p.subPropertyOf = [prop.id if s == prop_id else s for s in p.subPropertyOf]
    onto.annotation_properties[idx] = prop
    store.save()
    return prop


@app.delete("/api/annotation-properties/{prop_id}", tags=["Propriétés"])
def delete_annotation_property(prop_id: str):
    onto = require_onto()
    prop = next((p for p in onto.annotation_properties if p.id == prop_id), None)
    if not prop:
        raise HTTPException(404, f"AnnotationProperty '{prop_id}' not found")
    # ── Cascade : collect all descendants ───────────────────────
    to_delete = _collect_prop_descendants(onto.annotation_properties, prop_id)
    to_delete.add(prop_id)
    # Remove subPropertyOf references pointing to any deleted prop
    for p in onto.annotation_properties:
        if p.id not in to_delete:
            p.subPropertyOf = [s for s in (p.subPropertyOf or []) if s not in to_delete]
    onto.annotation_properties = [p for p in onto.annotation_properties if p.id not in to_delete]
    store.save()
    return {"deleted": sorted(to_delete)}


# ════════════════════════════════════════════════════════════════
# INDIVIDUS
# ════════════════════════════════════════════════════════════════

@app.get("/api/individuals", tags=["Individus"])
def list_individuals():
    return require_onto().individuals


def _sync_inverse_assertions(onto: OWLOntology, ind_id: str,
                             old_assertions: list, new_assertions: list) -> None:
    """Propage les assertions inverses (owl:inverseOf) quand les ObjectAssertions d'un individu changent.
    - old_assertions : ObjectPropertyAssertion avant la modification
    - new_assertions : ObjectPropertyAssertion après la modification
    """
    old_set = {(a.property, a.target) for a in old_assertions}
    new_set = {(a.property, a.target) for a in new_assertions}

    def _inverse_of(prop_id: str):
        p = next((x for x in onto.object_properties if x.id == prop_id), None)
        return p.inverseOf if p else None

    # Assertions retirées → supprimer l'assertion inverse sur l'individu cible
    for prop_id, target_id in old_set - new_set:
        inv = _inverse_of(prop_id)
        if not inv:
            continue
        target = next((i for i in onto.individuals if i.id == target_id), None)
        if target:
            target.objectAssertions = [
                a for a in target.objectAssertions
                if not (a.property == inv and a.target == ind_id)
            ]

    # Assertions ajoutées → ajouter l'assertion inverse sur l'individu cible
    for prop_id, target_id in new_set - old_set:
        inv = _inverse_of(prop_id)
        if not inv:
            continue
        target = next((i for i in onto.individuals if i.id == target_id), None)
        if target:
            already = any(a.property == inv and a.target == ind_id for a in target.objectAssertions)
            if not already:
                target.objectAssertions.append(ObjectPropertyAssertion(property=inv, target=ind_id))


@app.post("/api/individuals", tags=["Individus"], status_code=201)
def create_individual(ind: OWLIndividual):
    onto = require_onto()
    _validate_ncname(ind.id, "Individual ID")
    ind.id = ind.id.strip().replace(' ', '_')   # espace → underscore
    if any(i.id == ind.id for i in onto.individuals):
        raise HTTPException(409, f"Individual '{ind.id}' already exists")
    onto.individuals.append(ind)
    # Propager les assertions inverses (pas d'état précédent → old = [])
    _sync_inverse_assertions(onto, ind.id, [], ind.objectAssertions)
    store.save()
    return ind


@app.get("/api/individuals/{ind_id}", tags=["Individus"])
def get_individual(ind_id: str):
    onto = require_onto()
    ind = next((i for i in onto.individuals if i.id == ind_id), None)
    if not ind:
        raise HTTPException(404, f"Individual '{ind_id}' not found")
    return ind


@app.put("/api/individuals/{ind_id}", tags=["Individus"])
def update_individual(ind_id: str, ind: OWLIndividual):
    onto = require_onto()
    _validate_ncname(ind.id, "Individual ID")
    idx = next((i for i, x in enumerate(onto.individuals) if x.id == ind_id), None)
    if idx is None:
        raise HTTPException(404, f"Individual '{ind_id}' not found")
    old_assertions = onto.individuals[idx].objectAssertions
    new_id = ind.id.strip().replace(' ', '_') if ind.id else ind_id
    if not new_id:
        raise HTTPException(422, "Individual ID cannot be empty")
    ind.id = new_id
    # Si l'ID change, mettre à jour toutes les références dans les autres individus
    if new_id != ind_id:
        for other in onto.individuals:
            if other.id == ind_id:
                continue
            other.objectAssertions = [
                a if a.target != ind_id else a.model_copy(update={"target": new_id})
                for a in other.objectAssertions
            ]
            other.sameAs = [x if x != ind_id else new_id for x in (other.sameAs or [])]
            other.differentFrom = [x if x != ind_id else new_id for x in (other.differentFrom or [])]
    _sync_inverse_assertions(onto, ind_id, old_assertions, ind.objectAssertions)
    onto.individuals[idx] = ind
    store.save()
    return ind


@app.delete("/api/individuals/{ind_id}", tags=["Individus"])
def delete_individual(ind_id: str):
    onto = require_onto()
    ind = next((i for i in onto.individuals if i.id == ind_id), None)
    if not ind:
        raise HTTPException(404, f"Individual '{ind_id}' not found")
    # Retirer toutes les assertions inverses pointant vers cet individu
    _sync_inverse_assertions(onto, ind_id, ind.objectAssertions, [])
    onto.individuals = [i for i in onto.individuals if i.id != ind_id]
    store.save()
    return {"deleted": ind_id}



# ════════════════════════════════════════════════════════════════
# INFÉRENCES
# ════════════════════════════════════════════════════════════════

@app.get("/api/inferences", tags=["Inférences"], response_model=InferenceResult)
def get_inferences():
    """Calcule et retourne toutes les inférences en temps réel."""
    return run_inferences()


@app.get("/api/inferences/violations", tags=["Inférences"])
def get_violations():
    """Retourne uniquement les violations de cohérence."""
    result = run_inferences()
    return result.violations


@app.get("/api/inferences/subclass-closure", tags=["Inférences"])
def get_subclass_closure():
    """Retourne la fermeture transitive de subClassOf pour toutes les classes."""
    onto = require_onto()
    engine = InferenceEngine(onto)
    return engine.compute_subclass_closure()


# ════════════════════════════════════════════════════════════════
# SWRL RULES
# ════════════════════════════════════════════════════════════════

@app.get("/api/swrl-rules", tags=["SWRL"])
def list_swrl_rules():
    return require_onto().swrl_rules


class SwordImportRequest(PydanticModel):
    text: str

@app.post("/api/swrl-rules/parse-sword", tags=["SWRL"])
def parse_sword_rules(req: SwordImportRequest):
    """Parse un fichier SWORD et renvoie les règles SANS les sauvegarder.
    Le frontend décide quoi créer/remplacer (gestion des collisions d'id)."""
    from sword_parser import parse_sword
    try:
        rules = parse_sword(req.text)
    except Exception as e:
        raise HTTPException(400, f"SWORD parse error: {e}")
    return {"rules": [r.model_dump() for r in rules]}


@app.post("/api/swrl-rules", tags=["SWRL"], status_code=201)
def create_sword_rule(rule: SWRLRule):
    onto = require_onto()
    if any(r.id == rule.id for r in onto.swrl_rules):
        raise HTTPException(409, f"SWRL rule '{rule.id}' already exists")
    onto.swrl_rules.append(rule)
    store.save()
    return rule


@app.get("/api/swrl-rules/{rule_id}", tags=["SWRL"])
def get_sword_rule(rule_id: str):
    onto = require_onto()
    rule = next((r for r in onto.swrl_rules if r.id == rule_id), None)
    if not rule:
        raise HTTPException(404, f"SWRL rule '{rule_id}' not found")
    return rule


@app.put("/api/swrl-rules/{rule_id}", tags=["SWRL"])
def update_sword_rule(rule_id: str, rule: SWRLRule):
    onto = require_onto()
    idx = next((i for i, r in enumerate(onto.swrl_rules) if r.id == rule_id), None)
    if idx is None:
        raise HTTPException(404, f"SWRL rule '{rule_id}' not found")
    if rule.id != rule_id:
        if any(r.id == rule.id for i2, r in enumerate(onto.swrl_rules) if i2 != idx):
            raise HTTPException(409, f"SWRL rule '{rule.id}' already exists")
    onto.swrl_rules[idx] = rule
    store.save()
    return rule


@app.delete("/api/swrl-rules/{rule_id}", tags=["SWRL"])
def delete_sword_rule(rule_id: str):
    onto = require_onto()
    before = len(onto.swrl_rules)
    onto.swrl_rules = [r for r in onto.swrl_rules if r.id != rule_id]
    if len(onto.swrl_rules) == before:
        raise HTTPException(404, f"SWRL rule '{rule_id}' not found")
    store.save()
    return {"deleted": rule_id}


# ════════════════════════════════════════════════════════════════
# SPARQL QUERIES
# ════════════════════════════════════════════════════════════════

@app.get("/api/queries", tags=["Queries"])
def list_queries():
    return require_onto().queries


@app.post("/api/queries", tags=["Queries"], status_code=201)
def create_query(query: SparqlQuery):
    onto = require_onto()
    if any(q.id == query.id for q in onto.queries):
        raise HTTPException(409, f"Query '{query.id}' already exists")
    onto.queries.append(query)
    store.save()
    return query


@app.get("/api/queries/{query_id}", tags=["Queries"])
def get_query(query_id: str):
    onto = require_onto()
    q = next((q for q in onto.queries if q.id == query_id), None)
    if not q:
        raise HTTPException(404, f"Query '{query_id}' not found")
    return q


@app.put("/api/queries/{query_id}", tags=["Queries"])
def update_query(query_id: str, query: SparqlQuery):
    onto = require_onto()
    idx = next((i for i, q in enumerate(onto.queries) if q.id == query_id), None)
    if idx is None:
        raise HTTPException(404, f"Query '{query_id}' not found")
    if query.id != query_id:
        if any(q.id == query.id for i2, q in enumerate(onto.queries) if i2 != idx):
            raise HTTPException(409, f"Query '{query.id}' already exists")
    onto.queries[idx] = query
    store.save()
    return query


@app.delete("/api/queries/{query_id}", tags=["Queries"])
def delete_query(query_id: str):
    onto = require_onto()
    before = len(onto.queries)
    onto.queries = [q for q in onto.queries if q.id != query_id]
    if len(onto.queries) == before:
        raise HTTPException(404, f"Query '{query_id}' not found")
    store.save()
    return {"deleted": query_id}


# ════════════════════════════════════════════════════════════════
# FILESYSTEM BROWSER
# ════════════════════════════════════════════════════════════════

from pathlib import Path as FSPath
from triple_store import host_to_container, container_to_host

@app.get("/api/fs/browse", tags=["Système"])
def fs_browse(path: str = Query("/Users/bernard"),
              ext: str = Query(".json", description="Extensions séparées par virgule")):
    """Liste le contenu d'un répertoire (traduit chemin hôte → container)."""
    container_path = host_to_container(path)
    p = FSPath(container_path)
    if not p.exists() or not p.is_dir():
        raise HTTPException(404, f"Répertoire introuvable : {path}")
    dirs, files = [], []
    try:
        raw_entries = list(p.iterdir())
    except PermissionError:
        # macOS sandbox : listing du répertoire racine refusé
        # → os.listdir peut réussir là où iterdir échoue
        import os as _os
        raw_entries = []
        try:
            names = _os.listdir(container_path)
        except PermissionError:
            names = []
        for name in names:
            try:
                child = p / name
                child.stat()          # vérifie l'accès
                raw_entries.append(child)
            except (PermissionError, OSError):
                continue

    def _sort_key(e):
        try:
            return (not e.is_dir(), e.name.lower())
        except (PermissionError, OSError):
            return (True, e.name.lower())

    entries = sorted(raw_entries, key=_sort_key)
    for entry in entries:
        if entry.name.startswith('.'):
            continue
        try:
            host_entry = container_to_host(str(entry))
            allowed_ext = {e.strip() for e in ext.split(',') if e.strip()}
            if entry.is_dir():
                dirs.append({"name": entry.name, "path": host_entry})
            elif entry.suffix.lower() in allowed_ext:
                files.append({"name": entry.name, "path": host_entry})
        except PermissionError:
            continue
    parent = str(FSPath(path).parent) if str(FSPath(path).parent) != path else None
    return {"current": path, "parent": parent, "dirs": dirs, "files": files}



@app.post("/api/builtins/fetch", tags=["Système"])
def fetch_builtins():
    """Download the 3 core W3C ontologies (RDF, RDFS, OWL) and register them as read-only.
    Uses rdflib to fetch & parse (handles redirects and content negotiation automatically).
    Files are cached as Turtle in the data directory."""
    import rdflib
    from triple_store import DATA_DIR, container_to_host, store

    BUILTINS = [
        {
            "name":   "rdf",
            "prefix": "rdf",
            "uri":    "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "url":    "http://www.w3.org/1999/02/22-rdf-syntax-ns",
            "file":   "rdf.ttl",
        },
        {
            "name":   "rdfs",
            "prefix": "rdfs",
            "uri":    "http://www.w3.org/2000/01/rdf-schema#",
            "url":    "http://www.w3.org/2000/01/rdf-schema",
            "file":   "rdfs.ttl",
            # RDFS uses RDF but doesn't formally declare owl:imports in its W3C file
            "forced_imports": ["http://www.w3.org/1999/02/22-rdf-syntax-ns"],
        },
        {
            "name":   "owl",
            "prefix": "owl",
            "uri":    "http://www.w3.org/2002/07/owl#",
            "url":    "http://www.w3.org/2002/07/owl",
            "file":   "owl.ttl",
        },
        {
            "name":   "skos",
            "prefix": "skos",
            "uri":    "http://www.w3.org/2004/02/skos/core#",
            "url":    "http://www.w3.org/2004/02/skos/core",
            "file":   "skos.ttl",
            # SKOS s'appuie sur OWL (qui chaîne vers RDFS → RDF) — pas d'owl:imports formel dans le fichier W3C
            "forced_imports": ["http://www.w3.org/2002/07/owl"],
        },
    ]

    # Store builtins in ~/.swowl/builtins/ — correctly mapped via container_to_host()
    from triple_store import SWOWL_DIR
    builtin_dir = SWOWL_DIR / "builtins"
    builtin_dir.mkdir(parents=True, exist_ok=True)

    results = []
    for b in BUILTINS:
        # Skip if already registered
        if any(e["name"] == b["name"] for e in store.list_registry()):
            results.append({"name": b["name"], "status": "already registered"})
            continue

        # Download via rdflib (handles redirects + content negotiation)
        ttl_path  = builtin_dir / b["file"]           # cached Turtle
        json_path = builtin_dir / f"{b['name']}.json" # SWOWL JSON
        if not ttl_path.exists():
            try:
                g = rdflib.Graph()
                g.parse(b["url"])
                ttl_path.write_text(g.serialize(format="turtle"), encoding="utf-8")
            except Exception as e:
                results.append({"name": b["name"], "status": f"download failed: {e}"})
                continue

        # host path for the registry (container /host/Users/bernard/... → /Users/bernard/...)
        # Extract owl:imports declarations from the TTL
        imported_uris = list(b.get("forced_imports", []))
        try:
            g2 = rdflib.Graph()
            g2.parse(data=ttl_path.read_bytes(), format="turtle")
            for s, p, o2 in g2.triples((None, rdflib.OWL.imports, None)):
                uri_str = str(o2)
                if uri_str not in imported_uris:
                    imported_uris.append(uri_str)
        except Exception:
            pass

        host_json = container_to_host(str(json_path))
        try:
            store.import_from_rdf(
                ttl_path.read_bytes(), "turtle",
                b["name"], host_json, b["uri"], b["prefix"]
            )
            store.disconnect()
            entry = store._registry.get(b["name"])
            if entry:
                entry.readonly = True
                entry.imports  = imported_uris
                store._save_registry()
            results.append({"name": b["name"], "status": "fetched and registered",
                             "imports": imported_uris})
        except Exception as e:
            results.append({"name": b["name"], "status": f"import failed: {e}"})

    return {"results": results}


@app.post("/api/reveal", tags=["Système"])
def reveal_in_finder(path: str = Query(..., description="Host path to reveal in Finder")):
    """Ask the macOS host agent to open Finder at the given path."""
    import urllib.request as _req
    import urllib.parse as _parse
    host_path = path  # already a host path (not container path)
    url = f"http://host.docker.internal:8002/reveal?path={_parse.quote(host_path)}"
    try:
        req = _req.Request(url, method="POST")
        with _req.urlopen(req, timeout=3) as r:
            return {"status": "ok", "revealed": host_path}
    except Exception as e:
        raise HTTPException(503, f"Host agent not reachable — start host_agent.py first. ({e})")


# ── SPARQL 1.1 — endpoint d'exécution (SPARQL VizQ) ───────────

@app.get("/api/sparql", tags=["Queries"])
@app.post("/api/sparql", tags=["Queries"])
async def sparql_endpoint(
    request: Request,
    query: str = Query(default=None, description="SPARQL query (GET)"),
):
    """Endpoint SPARQL 1.1 — exécute une requête sur l'ontologie courante."""
    onto = store.get()
    if not onto:
        raise HTTPException(400, "Aucune ontologie connectée")

    # Récupérer la query depuis le body si POST
    sparql_query = query
    if sparql_query is None:
        content_type = request.headers.get("content-type", "")
        body = await request.body()
        if "application/sparql-query" in content_type:
            sparql_query = body.decode("utf-8")
        elif "application/x-www-form-urlencoded" in content_type:
            from urllib.parse import parse_qs
            parsed = parse_qs(body.decode("utf-8"))
            sparql_query = (parsed.get("query") or [None])[0]

    if not sparql_query:
        raise HTTPException(400, "Paramètre 'query' manquant")

    try:
        # Construire le graphe RDF depuis l'ontologie
        g = store.to_rdf_graph()
        result = g.query(sparql_query)

        # Sérialiser en SPARQL JSON (W3C)
        import json
        vars_list = [str(v) for v in result.vars] if result.vars else []
        bindings = []
        for row in result:
            binding = {}
            for v in result.vars:
                val = row[v]
                if val is None:
                    continue
                import rdflib
                if isinstance(val, rdflib.URIRef):
                    binding[str(v)] = {"type": "uri", "value": str(val)}
                elif isinstance(val, rdflib.Literal):
                    b = {"type": "literal", "value": str(val)}
                    if val.language:
                        b["xml:lang"] = val.language
                    if val.datatype:
                        b["datatype"] = str(val.datatype)
                    binding[str(v)] = b
                elif isinstance(val, rdflib.BNode):
                    binding[str(v)] = {"type": "bnode", "value": str(val)}
            bindings.append(binding)

        sparql_json = {
            "head": {"vars": vars_list},
            "results": {"bindings": bindings}
        }
        from fastapi.responses import JSONResponse
        return JSONResponse(
            content=sparql_json,
            headers={"Access-Control-Allow-Origin": "*"}
        )
    except Exception as e:
        raise HTTPException(400, f"Erreur SPARQL : {e}")


@app.get("/api/health", tags=["Système"])
def health():
    onto = store.get()
    return {
        "status": "ok",
        "ontology_loaded": onto is not None,
        "ontology_id": onto.id if onto else None,
    }
