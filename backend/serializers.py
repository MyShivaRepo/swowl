"""
serializers.py — Export OWL/XML (RDF/XML), Turtle, JSON-LD
"""
from triple_store import TripleStore


def export_owl_xml(store: TripleStore) -> bytes:
    g = store.to_rdf_graph()
    # « xml » (RDF/XML plat, standard) plutôt que « pretty-xml » (déprécié : imbrique
    # les individus, génère des rdf:nodeID, et déroute certains parseurs comme Protégé).
    return g.serialize(format="xml").encode("utf-8")


def export_turtle(store: TripleStore) -> bytes:
    g = store.to_rdf_graph()
    return g.serialize(format="turtle").encode("utf-8")


def export_jsonld(store: TripleStore) -> bytes:
    g = store.to_rdf_graph()
    return g.serialize(format="json-ld").encode("utf-8")
