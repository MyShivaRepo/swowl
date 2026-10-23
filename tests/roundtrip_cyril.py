#!/usr/bin/env python3
"""Test de non-régression aller-retour import → export (cas A à D de Cyril).

Usage (instance SWOWL lancée) :
    python tests/roundtrip_cyril.py [http://localhost:8001]

Importe les deux fixtures dans des ontologies temporaires via l'API, exporte,
vérifie chaque cas, puis supprime les ontologies de test et reconnecte
l'ontologie qui était active. Nécessite rdflib (backend/requirements.txt).
"""
import json, sys, urllib.request, urllib.error
from pathlib import Path
from rdflib import Graph, URIRef, BNode
from rdflib.collection import Collection
from rdflib.namespace import OWL, RDFS, RDF

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8001").rstrip("/")
ROOT = Path(__file__).resolve().parent
FIX = ROOT / "fixtures"
OUT = ROOT.parent / "data" / "tests"          # data/ est ignoré par git
OUT.mkdir(parents=True, exist_ok=True)
MI = "http://example.org/mini-imported#"
MM = "http://example.org/mini-main#"

def call(method, path, payload=None, raw=False):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        body = r.read()
        return body if raw else json.loads(body or b"{}")

def members(g, node, pred):
    head = g.value(node, pred)
    return set(Collection(g, head)) if head is not None else set()

def main():
    before = next((e["name"] for e in call("GET", "/api/ontologies")
                   if e.get("connected")), None)
    try:
        call("POST", "/api/ontologies/import-from-path", {
            "name": "mini_imported", "owl_path": str(FIX / "mini-imported.owl"),
            "save_path": str(OUT / "mini_imported.json"),
            "uri": "http://example.org/mini-imported", "prefix": "mi"})
        call("POST", "/api/ontologies/import-from-path", {
            "name": "mini_main", "owl_path": str(FIX / "mini-main.owl"),
            "save_path": str(OUT / "mini_main.json"),
            "uri": "http://example.org/mini-main", "prefix": "mm",
            "ns_prefixes": [{"prefix": "mi", "namespace": "http://example.org/mini-imported"}]})
        call("POST", "/api/ontologies/mini_main/connect")
        owl = call("GET", "/api/ontologies/mini_main/export?fmt=owl", raw=True)
        g = Graph(); g.parse(data=owl, format="xml")

        def restriction(subject, prop):
            for sup in g.objects(subject, RDFS.subClassOf):
                if (sup, OWL.onProperty, prop) in g:
                    return sup
            return None

        checks = []
        # A — domaine en union (#10)
        doms = list(g.objects(URIRef(MM + "hasPart"), RDFS.domain))
        okA = (len(doms) == 1 and isinstance(doms[0], BNode)
               and members(g, doms[0], OWL.unionOf) == {URIRef(MM + "Alpha"), URIRef(MM + "Beta")})
        checks.append(("A  domaine union(Alpha, Beta)  [#10]", okA, doms))
        # B — référence vers la classe importée (#12)
        rB = restriction(URIRef(MM + "Alpha"), URIRef(MM + "measuredIn"))
        fB = g.value(rB, OWL.allValuesFrom) if rB is not None else None
        checks.append(("B  allValuesFrom = mini-imported#Unit  [#12]", fB == URIRef(MI + "Unit"), fB))
        # C — axiome posé sur la classe importée (#14)
        rC = restriction(URIRef(MI + "Quantity"), URIRef(MI + "quantityOf"))
        fC = g.value(rC, OWL.allValuesFrom) if rC is not None else None
        checks.append(("C  axiome sur mini-imported#Quantity  [#14]",
                       fC == URIRef(MI + "QuantitativeCharacteristic"), fC))
        # D — contenu de restriction en union (#15)
        rD = restriction(URIRef(MM + "Beta"), URIRef(MM + "relatesTo"))
        fD = g.value(rD, OWL.allValuesFrom) if rD is not None else None
        okD = (isinstance(fD, BNode) and members(g, fD, OWL.unionOf)
               == {URIRef(MM + "Alpha"), URIRef(MM + "Beta")})
        checks.append(("D  allValuesFrom union(Alpha, Beta)  [#15]", okD, fD))
        # Aucun IRI à préfixe concaténé (#12)
        bad = sorted({str(t) for tr in g for t in tr if isinstance(t, URIRef) and "#mi:" in str(t)})
        checks.append(("   aucun IRI « …#mi:… »  [#12]", not bad, bad))

        print(f"Export : {len(g)} triplets\n")
        for label, ok, detail in checks:
            print(("✅" if ok else "❌"), label, "" if ok else f"→ obtenu : {detail}")
        return 0 if all(ok for _, ok, _ in checks) else 1
    finally:
        for n in ("mini_main", "mini_imported"):
            try: call("DELETE", f"/api/ontologies/{n}")
            except urllib.error.HTTPError: pass
        if before:
            try: call("POST", f"/api/ontologies/{before}/connect")
            except urllib.error.HTTPError: pass

if __name__ == "__main__":
    sys.exit(main())
