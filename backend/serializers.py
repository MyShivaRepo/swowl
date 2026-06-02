"""
serializers.py — Export OWL 2 XML, Turtle, JSON-LD
OWL/XML : format OWL 2 XML Serialization (W3C) natif OWLAPI 4 / Protégé 5
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

OWL_NS  = "http://www.w3.org/2002/07/owl#"
RDF_NS  = "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
RDFS_NS = "http://www.w3.org/2000/01/rdf-schema#"
XSD_NS  = "http://www.w3.org/2001/XMLSchema#"


def _full_iri(onto: OWLOntology, local: str) -> str:
    if local.startswith("http"):
        return local
    if ":" in local:
        return (local
                .replace("xsd:", XSD_NS)
                .replace("owl:", OWL_NS)
                .replace("rdfs:", RDFS_NS))
    base = onto.id.rstrip("#/")
    return f"{base}#{local}"


def _iri_attr(onto: OWLOntology, local: str) -> str:
    """Retourne IRI="#local" si même base, sinon IRI="http://..." """
    base = onto.id.rstrip("#/")
    full = _full_iri(onto, local)
    if full.startswith(base + "#"):
        return f'IRI="#{full[len(base)+1:]}"'
    return f'IRI="{escape(full)}"'


def _class_expr_owlxml(onto: OWLOntology, expr, pad: str) -> list[str]:
    sub = pad + "    "
    if isinstance(expr, str):
        return [f'{pad}<Class {_iri_attr(onto, expr)}/>']
    if isinstance(expr, UnionOf):
        lines = [f'{pad}<ObjectUnionOf>']
        for o in expr.operands:
            lines += _class_expr_owlxml(onto, o, sub)
        lines.append(f'{pad}</ObjectUnionOf>')
        return lines
    if isinstance(expr, IntersectionOf):
        lines = [f'{pad}<ObjectIntersectionOf>']
        for o in expr.operands:
            lines += _class_expr_owlxml(onto, o, sub)
        lines.append(f'{pad}</ObjectIntersectionOf>')
        return lines
    if isinstance(expr, ComplementOf):
        lines = [f'{pad}<ObjectComplementOf>']
        lines += _class_expr_owlxml(onto, expr.operand, sub)
        lines.append(f'{pad}</ObjectComplementOf>')
        return lines
    # Restrictions
    prop_attr = _iri_attr(onto, expr.property)
    if isinstance(expr, SomeValuesFrom) and expr.filler:
        return [f'{pad}<ObjectSomeValuesFrom>',
                f'{sub}<ObjectProperty {prop_attr}/>',
                f'{sub}<Class {_iri_attr(onto, expr.filler)}/>',
                f'{pad}</ObjectSomeValuesFrom>']
    if isinstance(expr, AllValuesFrom) and expr.filler:
        return [f'{pad}<ObjectAllValuesFrom>',
                f'{sub}<ObjectProperty {prop_attr}/>',
                f'{sub}<Class {_iri_attr(onto, expr.filler)}/>',
                f'{pad}</ObjectAllValuesFrom>']
    if isinstance(expr, HasValue) and expr.value:
        return [f'{pad}<ObjectHasValue>',
                f'{sub}<ObjectProperty {prop_attr}/>',
                f'{sub}<NamedIndividual {_iri_attr(onto, expr.value)}/>',
                f'{pad}</ObjectHasValue>']
    if isinstance(expr, ExactCardinality):
        inner = [f'{sub}<ObjectProperty {prop_attr}/>']
        if expr.filler: inner += _class_expr_owlxml(onto, expr.filler, sub)
        return [f'{pad}<ObjectExactCardinality cardinality="{expr.cardinality}">'] + inner + [f'{pad}</ObjectExactCardinality>']
    if isinstance(expr, MinCardinality):
        inner = [f'{sub}<ObjectProperty {prop_attr}/>']
        if expr.filler: inner += _class_expr_owlxml(onto, expr.filler, sub)
        return [f'{pad}<ObjectMinCardinality cardinality="{expr.cardinality}">'] + inner + [f'{pad}</ObjectMinCardinality>']
    if isinstance(expr, MaxCardinality):
        inner = [f'{sub}<ObjectProperty {prop_attr}/>']
        if expr.filler: inner += _class_expr_owlxml(onto, expr.filler, sub)
        return [f'{pad}<ObjectMaxCardinality cardinality="{expr.cardinality}">'] + inner + [f'{pad}</ObjectMaxCardinality>']
    return []


def export_owl_xml(store: TripleStore) -> bytes:
    onto = store.get()
    if not onto:
        raise ValueError("No ontology loaded")

    base = onto.id.rstrip("#/")
    lines = [
        '<?xml version="1.0"?>',
        f'<Ontology xmlns="{OWL_NS}"',
        f'     xml:base="{base}"',
        f'     xmlns:rdf="{RDF_NS}"',
        f'     xmlns:xml="http://www.w3.org/XML/1998/namespace"',
        f'     xmlns:xsd="{XSD_NS}"',
        f'     xmlns:rdfs="{RDFS_NS}"',
        f'     ontologyIRI="{base}">',
        # Préfixes requis par OWLAPI 4 pour résoudre les IRIs relatifs (#local)
        f'    <Prefix name="" IRI="{base}#"/>',
        f'    <Prefix name="owl" IRI="{OWL_NS}"/>',
        f'    <Prefix name="rdf" IRI="{RDF_NS}"/>',
        f'    <Prefix name="xml" IRI="http://www.w3.org/XML/1998/namespace"/>',
        f'    <Prefix name="xsd" IRI="{XSD_NS}"/>',
        f'    <Prefix name="{onto.prefix}" IRI="{base}#"/>',
        f'    <Prefix name="rdfs" IRI="{RDFS_NS}"/>',
        '',
    ]

    # Annotations de l'ontologie
    for ann in onto.annotations.labels:
        lines += [
            '    <Annotation>',
            f'        <AnnotationProperty abbreviatedIRI="rdfs:label"/>',
            f'        <Literal xml:lang="{ann.lang}">{escape(ann.value)}</Literal>',
            '    </Annotation>',
        ]
    for ann in onto.annotations.comments:
        lines += [
            '    <Annotation>',
            f'        <AnnotationProperty abbreviatedIRI="rdfs:comment"/>',
            f'        <Literal xml:lang="{ann.lang}">{escape(ann.value)}</Literal>',
            '    </Annotation>',
        ]
    if onto.annotations.labels or onto.annotations.comments:
        lines.append('')

    # ── Declarations ─────────────────────────────────────────
    for cls in onto.classes:
        lines.append(f'    <Declaration><Class {_iri_attr(onto, cls.id)}/></Declaration>')
    for prop in onto.object_properties:
        lines.append(f'    <Declaration><ObjectProperty {_iri_attr(onto, prop.id)}/></Declaration>')
    for prop in onto.datatype_properties:
        lines.append(f'    <Declaration><DataProperty {_iri_attr(onto, prop.id)}/></Declaration>')
    for ind in onto.individuals:
        lines.append(f'    <Declaration><NamedIndividual {_iri_attr(onto, ind.id)}/></Declaration>')
    if onto.classes or onto.object_properties or onto.datatype_properties or onto.individuals:
        lines.append('')

    # ── Class Axioms ─────────────────────────────────────────
    for cls in onto.classes:
        cls_attr = _iri_attr(onto, cls.id)
        for ann in cls.annotations.labels:
            lines += [f'    <AnnotationAssertion>',
                      f'        <AnnotationProperty abbreviatedIRI="rdfs:label"/>',
                      f'        <IRI>{escape(_full_iri(onto, cls.id))}</IRI>',
                      f'        <Literal xml:lang="{ann.lang}">{escape(ann.value)}</Literal>',
                      f'    </AnnotationAssertion>']
        for sup in cls.subClassOf:
            if isinstance(sup, PropertyPresence):
                continue
            lines.append(f'    <SubClassOf>')
            lines.append(f'        <Class {cls_attr}/>')
            lines += _class_expr_owlxml(onto, sup, '        ')
            lines.append(f'    </SubClassOf>')
        for eq in cls.equivalentClass:
            lines.append(f'    <EquivalentClasses>')
            lines.append(f'        <Class {cls_attr}/>')
            lines += _class_expr_owlxml(onto, eq, '        ')
            lines.append(f'    </EquivalentClasses>')
        for dj in cls.disjointWith:
            lines += [f'    <DisjointClasses>',
                      f'        <Class {cls_attr}/>',
                      f'        <Class {_iri_attr(onto, dj)}/>',
                      f'    </DisjointClasses>']

    # ── Object Property Axioms ───────────────────────────────
    for prop in onto.object_properties:
        p_attr = _iri_attr(onto, prop.id)
        for d in prop.domain:
            lines += [f'    <ObjectPropertyDomain>',
                      f'        <ObjectProperty {p_attr}/>',
                      f'        <Class {_iri_attr(onto, d)}/>',
                      f'    </ObjectPropertyDomain>']
        for r in prop.range:
            lines += [f'    <ObjectPropertyRange>',
                      f'        <ObjectProperty {p_attr}/>',
                      f'        <Class {_iri_attr(onto, r)}/>',
                      f'    </ObjectPropertyRange>']
        for sp in prop.subPropertyOf:
            lines += [f'    <SubObjectPropertyOf>',
                      f'        <ObjectProperty {p_attr}/>',
                      f'        <ObjectProperty {_iri_attr(onto, sp)}/>',
                      f'    </SubObjectPropertyOf>']
        if prop.inverseOf:
            lines += [f'    <InverseObjectProperties>',
                      f'        <ObjectProperty {p_attr}/>',
                      f'        <ObjectProperty {_iri_attr(onto, prop.inverseOf)}/>',
                      f'    </InverseObjectProperties>']
        ch = prop.characteristics
        char_map = [
            (ch.functional,        'FunctionalObjectProperty'),
            (ch.inverseFunctional, 'InverseFunctionalObjectProperty'),
            (ch.transitive,        'TransitiveObjectProperty'),
            (ch.symmetric,         'SymmetricObjectProperty'),
            (ch.asymmetric,        'AsymmetricObjectProperty'),
            (ch.reflexive,         'ReflexiveObjectProperty'),
            (ch.irreflexive,       'IrreflexiveObjectProperty'),
        ]
        for flag, tag in char_map:
            if flag:
                lines += [f'    <{tag}>', f'        <ObjectProperty {p_attr}/>', f'    </{tag}>']

    # ── Data Property Axioms ─────────────────────────────────
    for prop in onto.datatype_properties:
        p_attr = _iri_attr(onto, prop.id)
        for d in prop.domain:
            lines += [f'    <DataPropertyDomain>',
                      f'        <DataProperty {p_attr}/>',
                      f'        <Class {_iri_attr(onto, d)}/>',
                      f'    </DataPropertyDomain>']
        for r in prop.range:
            dt_iri = _full_iri(onto, r)
            lines += [f'    <DataPropertyRange>',
                      f'        <DataProperty {p_attr}/>',
                      f'        <Datatype IRI="{escape(dt_iri)}"/>',
                      f'    </DataPropertyRange>']
        if prop.functional:
            lines += [f'    <FunctionalDataProperty>',
                      f'        <DataProperty {p_attr}/>',
                      f'    </FunctionalDataProperty>']

    # ── Individual Assertions ────────────────────────────────
    for ind in onto.individuals:
        i_attr = _iri_attr(onto, ind.id)
        for t in ind.types:
            lines += [f'    <ClassAssertion>',
                      f'        <Class {_iri_attr(onto, t)}/>',
                      f'        <NamedIndividual {i_attr}/>',
                      f'    </ClassAssertion>']
        for oa in ind.objectAssertions:
            lines += [f'    <ObjectPropertyAssertion>',
                      f'        <ObjectProperty {_iri_attr(onto, oa.property)}/>',
                      f'        <NamedIndividual {i_attr}/>',
                      f'        <NamedIndividual {_iri_attr(onto, oa.target)}/>',
                      f'    </ObjectPropertyAssertion>']
        for da in ind.dataAssertions:
            dt = _full_iri(onto, da.datatype) if da.datatype else f"{XSD_NS}string"
            lines += [f'    <DataPropertyAssertion>',
                      f'        <DataProperty {_iri_attr(onto, da.property)}/>',
                      f'        <NamedIndividual {i_attr}/>',
                      f'        <Literal datatypeIRI="{escape(dt)}">{escape(da.value)}</Literal>',
                      f'    </DataPropertyAssertion>']
        for s in ind.sameAs:
            lines += [f'    <SameIndividual>',
                      f'        <NamedIndividual {i_attr}/>',
                      f'        <NamedIndividual {_iri_attr(onto, s)}/>',
                      f'    </SameIndividual>']
        for d in ind.differentFrom:
            lines += [f'    <DifferentIndividuals>',
                      f'        <NamedIndividual {i_attr}/>',
                      f'        <NamedIndividual {_iri_attr(onto, d)}/>',
                      f'    </DifferentIndividuals>']

    lines.append('')
    lines.append('</Ontology>')
    return "\n".join(lines).encode("utf-8")


def export_turtle(store: TripleStore) -> bytes:
    g = store.to_rdf_graph()
    return g.serialize(format="turtle").encode("utf-8")


def export_jsonld(store: TripleStore) -> bytes:
    g = store.to_rdf_graph()
    return g.serialize(format="json-ld").encode("utf-8")
