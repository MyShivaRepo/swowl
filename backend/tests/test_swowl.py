"""
Suite de tests SWOWL (backend).

Isolation : lancer avec SWOWL_DIR pointant un dossier temporaire, p.ex.
    SWOWL_DIR=/tmp/swowl_test python -m pytest backend/tests -q
Ainsi le registre/les .json de test ne touchent JAMAIS le registre réel de
l'utilisateur (cf. mémoire « no docker-exec import tests »).
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from triple_store import store          # noqa: E402
from sword_serializer import export_sword  # noqa: E402
from sword_parser import parse_sword       # noqa: E402
from owl_model import OWLOntology, SWRLRule  # noqa: E402

TMP = os.environ.get("SWOWL_DIR", "/tmp/swowl_test")
_n = [0]


def _imp(rdf: str, ns_prefixes=None, uri="http://ex.org/o#", prefix="t"):
    """Importe un RDF/XML inline dans un store isolé, renvoie l'OWLOntology."""
    _n[0] += 1
    name = f"test_onto_{_n[0]}"
    path = os.path.join(TMP, f"{name}.json")
    return store.import_from_rdf(rdf.encode("utf-8"), "xml", name, path, uri, prefix,
                                 ns_prefixes=ns_prefixes)


# ── Import : individu typé par une classe utilisateur (style Protégé) ──────────
def test_individual_typed_by_user_class():
    rdf = '''<?xml version="1.0"?>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
      xmlns:owl="http://www.w3.org/2002/07/owl#"
      xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
      xmlns="http://ex.org/o#"
      xml:base="http://ex.org/o">
      <owl:Ontology rdf:about=""/>
      <owl:Class rdf:ID="Substance"/>
      <Substance rdf:ID="lead"/>
    </rdf:RDF>'''
    onto = _imp(rdf)
    ids = {i.id for i in onto.individuals}
    assert "lead" in ids, f"individu typé-classe non détecté: {ids}"
    lead = next(i for i in onto.individuals if i.id == "lead")
    assert "Substance" in lead.types


# ── Import : owl:equivalentClass (restriction anonyme) ─────────────────────────
def test_equivalent_class_restriction():
    rdf = '''<?xml version="1.0"?>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
      xmlns:owl="http://www.w3.org/2002/07/owl#"
      xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
      xml:base="http://ex.org/o">
      <owl:Ontology rdf:about=""/>
      <owl:Class rdf:ID="Part"/>
      <owl:Class rdf:ID="Assembly">
        <owl:equivalentClass>
          <owl:Restriction>
            <owl:onProperty><owl:ObjectProperty rdf:ID="hasPart"/></owl:onProperty>
            <owl:someValuesFrom rdf:resource="#Part"/>
          </owl:Restriction>
        </owl:equivalentClass>
      </owl:Class>
    </rdf:RDF>'''
    onto = _imp(rdf)
    asm = next(c for c in onto.classes if c.id == "Assembly")
    eqs = [e.model_dump() if hasattr(e, "model_dump") else e for e in asm.equivalentClass]
    assert any(isinstance(e, dict) and e.get("type") == "someValuesFrom"
               and e.get("property") == "hasPart" and e.get("filler") == "Part"
               for e in eqs), f"equivalentClass restriction perdue: {eqs}"


# ── Import : range owl:DataRange/oneOf anonyme ignoré (pas de blank node) ───────
def test_datarange_range_ignored():
    rdf = '''<?xml version="1.0"?>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
      xmlns:owl="http://www.w3.org/2002/07/owl#"
      xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
      xml:base="http://ex.org/o">
      <owl:Ontology rdf:about=""/>
      <owl:DatatypeProperty rdf:ID="status">
        <rdfs:range>
          <owl:DataRange>
            <owl:oneOf rdf:parseType="Resource">
              <rdf:first rdf:datatype="http://www.w3.org/2001/XMLSchema#string">a</rdf:first>
              <rdf:rest rdf:resource="http://www.w3.org/1999/02/22-rdf-syntax-ns#nil"/>
            </owl:oneOf>
          </owl:DataRange>
        </rdfs:range>
      </owl:DatatypeProperty>
    </rdf:RDF>'''
    onto = _imp(rdf)
    dp = next(p for p in onto.datatype_properties if p.id == "status")
    assert dp.range == [], f"range DataRange anonyme non ignoré: {dp.range}"


# ── Import : la base prime sur les namespaces utilisateur dans _lid ────────────
def test_lid_base_priority_over_imported_ns():
    rdf = '''<?xml version="1.0"?>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
      xmlns:owl="http://www.w3.org/2002/07/owl#"
      xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
      xml:base="http://ex.org/plm/data">
      <owl:Ontology rdf:about=""/>
      <owl:Class rdf:about="http://ex.org/plm/data#MyClass">
        <rdfs:subClassOf rdf:resource="http://ex.org/plm#Article"/>
      </owl:Class>
      <owl:Class rdf:about="http://ex.org/plm#Article"/>
    </rdf:RDF>'''
    onto = _imp(rdf, ns_prefixes=[{"prefix": "plm", "namespace": "http://ex.org/plm"}],
                uri="http://ex.org/plm/data#")
    ids = sorted(c.id for c in onto.classes)
    # base .../plm/data# est un sur-ensemble de l'import .../plm
    assert "MyClass" in ids, f"entité native mal préfixée: {ids}"
    assert "plm:Article" in ids, f"entité externe non préfixée: {ids}"


# ── Import : ns_prefixes → owl:imports + import_labels (préfixe contextuel) ─────
def test_ns_prefixes_become_imports():
    rdf = '''<?xml version="1.0"?>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
      xmlns:owl="http://www.w3.org/2002/07/owl#"
      xml:base="http://ex.org/plm/data">
      <owl:Ontology rdf:about=""/>
    </rdf:RDF>'''
    onto = _imp(rdf, ns_prefixes=[{"prefix": "plm", "namespace": "http://ex.org/plm"}],
                uri="http://ex.org/plm/data#")
    assert "http://ex.org/plm" in onto.imports
    assert onto.import_labels.get("http://ex.org/plm", {}).get("prefix") == "plm"


# ── Import : préfixe vide accepté (l'import est tout de même déclaré) ───────────
def test_empty_prefix_import_still_declared():
    rdf = '''<?xml version="1.0"?>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
      xmlns:owl="http://www.w3.org/2002/07/owl#"
      xml:base="http://ex.org/plm/data">
      <owl:Ontology rdf:about=""/>
    </rdf:RDF>'''
    onto = _imp(rdf, ns_prefixes=[{"prefix": "", "namespace": "http://ex.org/plm"}],
                uri="http://ex.org/plm/data#")
    assert "http://ex.org/plm" in onto.imports, "import à préfixe vide non déclaré"
    assert onto.import_labels.get("http://ex.org/plm", {}).get("prefix") == ""


# ── Export : owl:imports émis dans le graphe RDF ───────────────────────────────
def test_export_emits_owl_imports():
    rdf = '''<?xml version="1.0"?>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
      xmlns:owl="http://www.w3.org/2002/07/owl#"
      xml:base="http://ex.org/plm/data">
      <owl:Ontology rdf:about=""/>
    </rdf:RDF>'''
    _imp(rdf, ns_prefixes=[{"prefix": "plm", "namespace": "http://ex.org/plm"}],
         uri="http://ex.org/plm/data#")
    g = store.to_rdf_graph()
    ttl = g.serialize(format="turtle")
    assert "imports" in ttl and "http://ex.org/plm" in ttl, "owl:imports absent de l'export"


# ── SWORD : round-trip export → parse stable ───────────────────────────────────
def test_sword_roundtrip():
    onto = OWLOntology(id="http://ex.org/o", name="x", prefix="t")
    onto.swrl_rules = [SWRLRule(
        id="R1", label="rule one",
        body=[{"type": "type_atom", "var": "?x", "class_id": "Part"}],
        head=[{"type": "type_atom", "var": "?x", "class_id": "Assembly"}],
    )]
    text = export_sword(onto).decode("utf-8")
    rules = parse_sword(text)
    assert len(rules) == 1
    assert rules[0].id == "R1"
