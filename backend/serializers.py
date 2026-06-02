"""
serializers.py — Export OWL/XML et Turtle via rdflib
"""
import re
from triple_store import TripleStore


def export_owl_xml(store: TripleStore) -> bytes:
    onto = store.get()
    g = store.to_rdf_graph()
    xml_str = g.serialize(format="pretty-xml")

    # Protégé 5 (OWLAPI 4) requiert xml:base, xmlns par défaut et tous les namespaces OWL 2
    base = onto.id.rstrip("#/")
    header = (
        f'<rdf:RDF\n'
        f'     xmlns="{base}#"\n'
        f'     xml:base="{base}"\n'
        f'     xmlns:owl="http://www.w3.org/2002/07/owl#"\n'
        f'     xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n'
        f'     xmlns:xml="http://www.w3.org/XML/1998/namespace"\n'
        f'     xmlns:xsd="http://www.w3.org/2001/XMLSchema#"\n'
        f'     xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">'
    )
    xml_str = re.sub(r'<rdf:RDF[^>]*>', header, xml_str, count=1, flags=re.DOTALL)
    return xml_str.encode("utf-8")


def export_turtle(store: TripleStore) -> bytes:
    g = store.to_rdf_graph()
    return g.serialize(format="turtle").encode("utf-8")


def export_jsonld(store: TripleStore) -> bytes:
    g = store.to_rdf_graph()
    return g.serialize(format="json-ld").encode("utf-8")
