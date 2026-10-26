#!/usr/bin/env python3
"""Test générique « aucune perte » : pour chaque fixture, chaque triplet du fichier
source qui ne contient pas de nœud anonyme doit se retrouver dans l'export.
On compare les triplets, pas leur nombre : un ajout légitime (ex. owl:inverseOf
symétrique, rdf:type owl:Class sur une classe importée) est toléré, une perte non.
Les structures anonymes (unions, restrictions) sont couvertes par roundtrip_cyril.py.

Usage (instance SWOWL lancée) : python tests/roundtrip_lossless.py [http://localhost:8001]
"""
import json, sys, urllib.request, urllib.error
from pathlib import Path
from rdflib import Graph, BNode
from rdflib.namespace import OWL, RDF

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8001").rstrip("/")
ROOT = Path(__file__).resolve().parent
FIX = ROOT / "fixtures"
OUT = ROOT.parent / "data" / "tests"; OUT.mkdir(parents=True, exist_ok=True)

# (nom, fichier, uri, préfixe, ns_prefixes) — dans l'ordre d'import (dépendances d'abord)
CASES = [
    ("mini_imported",   "mini-imported.owl",   "http://example.org/mini-imported",   "mi", []),
    ("mini_main",       "mini-main.owl",       "http://example.org/mini-main",       "mm",
        [{"prefix": "mi", "namespace": "http://example.org/mini-imported"}]),
    ("slash_ns",        "slash-ns.owl",        "https://example.org/slash",          "sl", []),
    ("mini_functional", "mini-functional.owl", "http://example.org/mini-functional", "mf", []),
]

def call(method, path, payload=None, raw=False):
    req = urllib.request.Request(BASE + path, method=method,
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        b = r.read(); return b if raw else json.loads(b or b"{}")

def ground(g):
    return {t for t in g if not any(isinstance(x, BNode) for x in t)}

def accepted(t, out):
    """Écart volontaire (export, cf. triple_store.py) : `rdf:type owl:NamedIndividual`
    n'est écrit que si l'individu n'a aucune classe — il est alors déjà déclaré par
    son rdf:type de classe (évite une « classe » owl:NamedIndividual dans Protégé)."""
    s, p, o = t
    return (p == RDF.type and o == OWL.NamedIndividual
            and any(c != OWL.NamedIndividual for c in out.objects(s, RDF.type)))

def short(t):
    return " ".join(str(x).rsplit("#", 1)[-1].rsplit("/", 1)[-1] for x in t)

def main():
    before = next((e["name"] for e in call("GET", "/api/ontologies") if e.get("connected")), None)
    failures = 0
    try:
        for name, fn, uri, pfx, ns in CASES:
            call("POST", "/api/ontologies/import-from-path", {
                "name": name, "owl_path": str(FIX / fn), "save_path": str(OUT / f"{name}.json"),
                "uri": uri, "prefix": pfx, "ns_prefixes": ns})
        for name, fn, *_ in CASES:
            call("POST", f"/api/ontologies/{name}/connect")
            out = Graph(); out.parse(data=call("GET", f"/api/ontologies/{name}/export?fmt=owl", raw=True), format="xml")
            src = Graph(); src.parse(FIX / fn, format="xml")
            lost = {t for t in ground(src) - ground(out) if not accepted(t, out)}
            ok = not lost
            failures += not ok
            print(("✅" if ok else "❌"), f"{fn:22} {len(ground(src))} triplets sans nœud anonyme, perdus : {len(lost)}")
            for t in sorted(lost, key=str):
                print("      −", short(t))
        return 1 if failures else 0
    finally:
        for name, *_ in reversed(CASES):
            try: call("DELETE", f"/api/ontologies/{name}")
            except urllib.error.HTTPError: pass
        if before:
            try: call("POST", f"/api/ontologies/{before}/connect")
            except urllib.error.HTTPError: pass

if __name__ == "__main__":
    sys.exit(main())
