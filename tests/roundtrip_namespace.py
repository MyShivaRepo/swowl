#!/usr/bin/env python3
"""Non-régression #11 : une ontologie à séparateur « / » doit ressortir avec
exactement les mêmes IRI après un aller-retour import → export.

Usage (instance SWOWL lancée) : python tests/roundtrip_namespace.py [http://localhost:8001]
"""
import json, sys, urllib.request, urllib.error
from pathlib import Path
from rdflib import Graph, URIRef
from rdflib.namespace import OWL, RDF

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8001").rstrip("/")
ROOT = Path(__file__).resolve().parent
SRC = ROOT / "fixtures" / "slash-ns.owl"
OUT = ROOT.parent / "data" / "tests"; OUT.mkdir(parents=True, exist_ok=True)
STD = (str(OWL), str(RDF), "http://www.w3.org/2000/01/rdf-schema#",
       "http://www.w3.org/2001/XMLSchema#")

def call(method, path, payload=None, raw=False):
    req = urllib.request.Request(BASE + path, method=method,
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        b = r.read(); return b if raw else json.loads(b or b"{}")

def iris(g):
    return {str(t) for tr in g for t in tr
            if isinstance(t, URIRef) and not str(t).startswith(STD)}

def main():
    before = next((e["name"] for e in call("GET", "/api/ontologies") if e.get("connected")), None)
    try:
        call("POST", "/api/ontologies/import-from-path", {
            "name": "slash_ns", "owl_path": str(SRC), "save_path": str(OUT / "slash_ns.json"),
            "uri": "https://example.org/slash", "prefix": "sl"})
        call("POST", "/api/ontologies/slash_ns/connect")
        out = Graph(); out.parse(data=call("GET", "/api/ontologies/slash_ns/export?fmt=owl", raw=True), format="xml")
        src = Graph(); src.parse(SRC, format="xml")
        a, b = iris(src), iris(out)
        ok = a == b
        print(("✅" if ok else "❌"), "IRI identiques après aller-retour  [#11]")
        if not ok:
            print("   perdues :", sorted(a - b)); print("   ajoutées:", sorted(b - a))
        return 0 if ok else 1
    finally:
        try: call("DELETE", "/api/ontologies/slash_ns")
        except urllib.error.HTTPError: pass
        if before:
            try: call("POST", f"/api/ontologies/{before}/connect")
            except urllib.error.HTTPError: pass

if __name__ == "__main__":
    sys.exit(main())
