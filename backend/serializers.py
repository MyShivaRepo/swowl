"""
serializers.py — Export OWL/XML, Turtle, JSON-LD
OWL/XML : sérialiseur custom pour compatibilité Protégé 5 (OWLAPI 4)
"""
from __future__ import annotations
from xml.sax.saxutils import escape
from triple_store import TripleStore
from owl_model import (
    OWLOntology,
    SomeValuesFrom, AllValuesFrom, HasValue,
    ExactCardinality, MinCardinality, MaxCardinality,
    UnionOf, IntersectionOf, ComplementOf,
    PropertyPresence,
)

OWL  = "http://www.w3.org/2002/07/owl#"
RDF  = "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
RDFS = "http://www.w3.org/2000/01/rdf-schema#"
XSD  = "http://www.w3.org/2001/XMLSchema#"


def _iri(onto: OWLOntology, local: str) -> str:
    if local.startswith("http"):
        return local
    if ":" in local:
        return local.replace("xsd:", XSD).replace("owl:", OWL).replace("rdfs:", RDFS)
    base = onto.id.rstrip("#/")
    return f"{base}#{local}"


def _about(onto: OWLOntology, local: str) -> str:
    return f' rdf:about="{escape(_iri(onto, local))}"'


def _class_expr(onto: OWLOntology, expr, lines: list, indent: int) -> str:
    pad = "  " * indent
    if isinstance(expr, str):
        return f'<owl:Class rdf:about="{escape(_iri(onto, expr))}"/>'
    if isinstance(expr, UnionOf):
        items = "\n".join(
            f'{pad}  <rdf:rest rdf:parseType="Collection">\n'
            + "\n".join(f'{pad}    {_class_expr(onto, o, lines, indent+2)}' for o in expr.operands)
            + f'\n{pad}  </rdf:rest>'
        )
        return (f'<owl:Class>\n{pad}  <owl:unionOf rdf:parseType="Collection">\n'
                + "\n".join(f'{pad}    {_class_expr(onto, o, lines, indent+2)}' for o in expr.operands)
                + f'\n{pad}  </owl:unionOf>\n{pad}</owl:Class>')
    if isinstance(expr, IntersectionOf):
        return (f'<owl:Class>\n{pad}  <owl:intersectionOf rdf:parseType="Collection">\n'
                + "\n".join(f'{pad}    {_class_expr(onto, o, lines, indent+2)}' for o in expr.operands)
                + f'\n{pad}  </owl:intersectionOf>\n{pad}</owl:Class>')
    if isinstance(expr, ComplementOf):
        return (f'<owl:Class>\n{pad}  <owl:complementOf>\n'
                f'{pad}    {_class_expr(onto, expr.operand, lines, indent+2)}\n'
                f'{pad}  </owl:complementOf>\n{pad}</owl:Class>')
    # Restrictions
    prop_iri = escape(_iri(onto, expr.property))
    r = f'<owl:Restriction>\n{pad}  <owl:onProperty rdf:resource="{prop_iri}"/>\n'
    if isinstance(expr, SomeValuesFrom) and expr.filler:
        r += f'{pad}  <owl:someValuesFrom rdf:resource="{escape(_iri(onto, expr.filler))}"/>\n'
    elif isinstance(expr, AllValuesFrom) and expr.filler:
        r += f'{pad}  <owl:allValuesFrom rdf:resource="{escape(_iri(onto, expr.filler))}"/>\n'
    elif isinstance(expr, HasValue) and expr.value:
        r += f'{pad}  <owl:hasValue rdf:resource="{escape(_iri(onto, expr.value))}"/>\n'
    elif isinstance(expr, ExactCardinality):
        r += f'{pad}  <owl:cardinality rdf:datatype="{XSD}nonNegativeInteger">{expr.cardinality}</owl:cardinality>\n'
    elif isinstance(expr, MinCardinality):
        r += f'{pad}  <owl:minCardinality rdf:datatype="{XSD}nonNegativeInteger">{expr.cardinality}</owl:minCardinality>\n'
    elif isinstance(expr, MaxCardinality):
        r += f'{pad}  <owl:maxCardinality rdf:datatype="{XSD}nonNegativeInteger">{expr.cardinality}</owl:maxCardinality>\n'
    r += f'{pad}</owl:Restriction>'
    return r


def export_owl_xml(store: TripleStore) -> bytes:
    onto = store.get()
    if not onto:
        raise ValueError("No ontology loaded")

    base = onto.id.rstrip("#/")
    lines = [
        '<?xml version="1.0"?>',
        f'<rdf:RDF xmlns="{base}#"',
        f'     xml:base="{base}"',
        f'     xmlns:owl="{OWL}"',
        f'     xmlns:rdf="{RDF}"',
        f'     xmlns:xml="http://www.w3.org/XML/1998/namespace"',
        f'     xmlns:xsd="{XSD}"',
        f'     xmlns:rdfs="{RDFS}">',
        '',
        f'    <!-- Ontology: {base} -->',
        f'    <owl:Ontology rdf:about="{base}">',
    ]
    for ann in onto.annotations.labels:
        lines.append(f'        <rdfs:label xml:lang="{ann.lang}">{escape(ann.value)}</rdfs:label>')
    for ann in onto.annotations.comments:
        lines.append(f'        <rdfs:comment xml:lang="{ann.lang}">{escape(ann.value)}</rdfs:comment>')
    lines += ['    </owl:Ontology>', '']

    # ── Classes ──────────────────────────────────────────────
    if onto.classes:
        lines.append('    <!-- Classes -->')
        lines.append('')
    for cls in onto.classes:
        cls_iri = escape(_iri(onto, cls.id))
        lines.append(f'    <owl:Class rdf:about="{cls_iri}">')
        for ann in cls.annotations.labels:
            lines.append(f'        <rdfs:label xml:lang="{ann.lang}">{escape(ann.value)}</rdfs:label>')
        for ann in cls.annotations.comments:
            lines.append(f'        <rdfs:comment xml:lang="{ann.lang}">{escape(ann.value)}</rdfs:comment>')
        for sup in cls.subClassOf:
            if isinstance(sup, PropertyPresence):
                continue
            if isinstance(sup, str):
                lines.append(f'        <rdfs:subClassOf rdf:resource="{escape(_iri(onto, sup))}"/>')
            else:
                expr_xml = _class_expr(onto, sup, lines, 4)
                lines.append(f'        <rdfs:subClassOf>')
                lines.append(f'            {expr_xml}')
                lines.append(f'        </rdfs:subClassOf>')
        for eq in cls.equivalentClass:
            if isinstance(eq, str):
                lines.append(f'        <owl:equivalentClass rdf:resource="{escape(_iri(onto, eq))}"/>')
            else:
                lines.append(f'        <owl:equivalentClass>')
                lines.append(f'            {_class_expr(onto, eq, lines, 4)}')
                lines.append(f'        </owl:equivalentClass>')
        for dj in cls.disjointWith:
            lines.append(f'        <owl:disjointWith rdf:resource="{escape(_iri(onto, dj))}"/>')
        lines.append(f'    </owl:Class>')
        lines.append('')

    # ── Object Properties ────────────────────────────────────
    if onto.object_properties:
        lines.append('    <!-- Object Properties -->')
        lines.append('')
    for prop in onto.object_properties:
        p_iri = escape(_iri(onto, prop.id))
        lines.append(f'    <owl:ObjectProperty rdf:about="{p_iri}">')
        for ann in prop.annotations.labels:
            lines.append(f'        <rdfs:label xml:lang="{ann.lang}">{escape(ann.value)}</rdfs:label>')
        for d in prop.domain:
            lines.append(f'        <rdfs:domain rdf:resource="{escape(_iri(onto, d))}"/>')
        for r in prop.range:
            lines.append(f'        <rdfs:range rdf:resource="{escape(_iri(onto, r))}"/>')
        for sp in prop.subPropertyOf:
            lines.append(f'        <rdfs:subPropertyOf rdf:resource="{escape(_iri(onto, sp))}"/>')
        if prop.inverseOf:
            lines.append(f'        <owl:inverseOf rdf:resource="{escape(_iri(onto, prop.inverseOf))}"/>')
        ch = prop.characteristics
        if ch.functional:        lines.append(f'        <rdf:type rdf:resource="{OWL}FunctionalProperty"/>')
        if ch.inverseFunctional: lines.append(f'        <rdf:type rdf:resource="{OWL}InverseFunctionalProperty"/>')
        if ch.transitive:        lines.append(f'        <rdf:type rdf:resource="{OWL}TransitiveProperty"/>')
        if ch.symmetric:         lines.append(f'        <rdf:type rdf:resource="{OWL}SymmetricProperty"/>')
        if ch.asymmetric:        lines.append(f'        <rdf:type rdf:resource="{OWL}AsymmetricProperty"/>')
        if ch.reflexive:         lines.append(f'        <rdf:type rdf:resource="{OWL}ReflexiveProperty"/>')
        if ch.irreflexive:       lines.append(f'        <rdf:type rdf:resource="{OWL}IrreflexiveProperty"/>')
        lines.append(f'    </owl:ObjectProperty>')
        lines.append('')

    # ── Datatype Properties ──────────────────────────────────
    if onto.datatype_properties:
        lines.append('    <!-- Datatype Properties -->')
        lines.append('')
    for prop in onto.datatype_properties:
        p_iri = escape(_iri(onto, prop.id))
        lines.append(f'    <owl:DatatypeProperty rdf:about="{p_iri}">')
        for d in prop.domain:
            lines.append(f'        <rdfs:domain rdf:resource="{escape(_iri(onto, d))}"/>')
        for r in prop.range:
            lines.append(f'        <rdfs:range rdf:resource="{escape(_iri(onto, r))}"/>')
        if prop.functional:
            lines.append(f'        <rdf:type rdf:resource="{OWL}FunctionalProperty"/>')
        lines.append(f'    </owl:DatatypeProperty>')
        lines.append('')

    # ── Individuals ──────────────────────────────────────────
    if onto.individuals:
        lines.append('    <!-- Individuals -->')
        lines.append('')
    for ind in onto.individuals:
        i_iri = escape(_iri(onto, ind.id))
        lines.append(f'    <owl:NamedIndividual rdf:about="{i_iri}">')
        for t in ind.types:
            lines.append(f'        <rdf:type rdf:resource="{escape(_iri(onto, t))}"/>')
        for oa in ind.objectAssertions:
            lines.append(f'        <{escape(oa.property)} rdf:resource="{escape(_iri(onto, oa.target))}"/>')
        for da in ind.dataAssertions:
            dt = _iri(onto, da.datatype) if da.datatype else f"{XSD}string"
            lines.append(f'        <{escape(da.property)} rdf:datatype="{escape(dt)}">{escape(da.value)}</{escape(da.property)}>')
        for s in ind.sameAs:
            lines.append(f'        <owl:sameAs rdf:resource="{escape(_iri(onto, s))}"/>')
        for d in ind.differentFrom:
            lines.append(f'        <owl:differentFrom rdf:resource="{escape(_iri(onto, d))}"/>')
        lines.append(f'    </owl:NamedIndividual>')
        lines.append('')

    lines.append('</rdf:RDF>')
    return "\n".join(lines).encode("utf-8")


def export_turtle(store: TripleStore) -> bytes:
    g = store.to_rdf_graph()
    return g.serialize(format="turtle").encode("utf-8")


def export_jsonld(store: TripleStore) -> bytes:
    g = store.to_rdf_graph()
    return g.serialize(format="json-ld").encode("utf-8")
