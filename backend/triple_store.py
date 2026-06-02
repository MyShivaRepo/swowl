"""
triple_store.py — Triple store in-memory basé sur rdflib
Persistance via fichiers Turtle dans DATA_DIR
"""
from __future__ import annotations
import os
import json
from pathlib import Path
from typing import Optional

from rdflib import Graph, Namespace, RDF, RDFS, OWL, XSD, Literal, URIRef, BNode
from rdflib.namespace import SKOS

from owl_model import (
    OWLOntology, OWLClass, OWLObjectProperty, OWLDatatypeProperty,
    OWLIndividual, SWRLRule,
    SomeValuesFrom, AllValuesFrom, HasValue,
    ExactCardinality, MinCardinality, MaxCardinality,
    UnionOf, IntersectionOf, ComplementOf,
    SWRLClassAtom, SWRLObjectPropertyAtom, SWRLDataPropertyAtom, SWRLBuiltinAtom,
    PropertyPresence,
)

SWRL_NS  = Namespace("http://www.w3.org/2003/11/swrl#")
SWRLB_NS = Namespace("http://www.w3.org/2003/11/swrlb#")

# Correspondance préfixe → prédicat rdflib pour les annotations OWL 2
ANNO_PROP_MAP = {
    'rdfs:seeAlso':               RDFS.seeAlso,
    'rdfs:isDefinedBy':           RDFS.isDefinedBy,
    'owl:versionInfo':            OWL.versionInfo,
    'owl:deprecated':             OWL.deprecated,
    'owl:priorVersion':           OWL.priorVersion,
    'owl:backwardCompatibleWith': OWL.backwardCompatibleWith,
    'owl:incompatibleWith':       OWL.incompatibleWith,
}
DATA_DIR = Path(os.environ.get("DATA_DIR", "/app/data/ontologies"))
DATA_DIR.mkdir(parents=True, exist_ok=True)


def _onto_path(onto_id: str) -> Path:
    safe = onto_id.replace("https://", "").replace("http://", "").replace("/", "_")
    return DATA_DIR / f"{safe}.json"


class TripleStore:
    """
    Wrapper autour d'un rdflib.Graph.
    Sérialise l'ontologie en JSON pour la persistance,
    et construit le graphe RDF à la demande pour l'export.
    """

    _LAST_FILE = DATA_DIR / ".last_ontology"

    def __init__(self):
        self._ontology: Optional[OWLOntology] = None

    # ── Persistance JSON ─────────────────────────────────────

    def _write_last(self, onto_id: str) -> None:
        """Mémorise l'ID de la dernière ontologie active."""
        self._LAST_FILE.write_text(onto_id, encoding="utf-8")

    def load_last(self) -> Optional[OWLOntology]:
        """Recharge la dernière ontologie utilisée (appelé au démarrage)."""
        if not self._LAST_FILE.exists():
            # Aucune trace — on tente avec la seule ontologie disponible
            ontos = self.list_ontologies()
            if len(ontos) == 1:
                return self.load(ontos[0]["id"])
            return None
        onto_id = self._LAST_FILE.read_text(encoding="utf-8").strip()
        return self.load(onto_id)

    def save(self) -> None:
        if not self._ontology:
            return
        path = _onto_path(self._ontology.id)
        path.write_text(self._ontology.model_dump_json(indent=2), encoding="utf-8")

    def load(self, onto_id: str) -> Optional[OWLOntology]:
        path = _onto_path(onto_id)
        if not path.exists():
            return None
        data = json.loads(path.read_text(encoding="utf-8"))
        self._ontology = OWLOntology.model_validate(data)
        self._write_last(onto_id)
        return self._ontology

    def list_ontologies(self) -> list[dict]:
        result = []
        for f in DATA_DIR.glob("*.json"):
            try:
                data = json.loads(f.read_text(encoding="utf-8"))
                result.append({"id": data.get("id"), "prefix": data.get("prefix"),
                                "version": data.get("version")})
            except Exception:
                pass
        return result

    def delete(self, onto_id: str) -> bool:
        path = _onto_path(onto_id)
        if path.exists():
            path.unlink()
            return True
        return False

    # ── Accès ontologie ──────────────────────────────────────

    def get(self) -> Optional[OWLOntology]:
        return self._ontology

    def set(self, onto: OWLOntology) -> None:
        self._ontology = onto
        self.save()
        self._write_last(onto.id)

    # ── Construction graphe RDF ───────────────────────────────

    def to_rdf_graph(self) -> Graph:
        onto = self._ontology
        if not onto:
            raise ValueError("No ontology loaded")

        base = onto.id.rstrip("#/") + "#"
        NS = Namespace(base)
        g = Graph()
        g.bind(onto.prefix, NS)
        g.bind("owl", OWL)
        g.bind("rdf", RDF)
        g.bind("rdfs", RDFS)
        g.bind("xsd", XSD)
        g.bind("swrl",  SWRL_NS)
        g.bind("swrlb", SWRLB_NS)

        onto_uri = URIRef(onto.id)
        g.add((onto_uri, RDF.type, OWL.Ontology))
        for ann in onto.annotations.labels:
            g.add((onto_uri, RDFS.label, Literal(ann.value, lang=ann.lang)))
        for ann in onto.annotations.comments:
            g.add((onto_uri, RDFS.comment, Literal(ann.value, lang=ann.lang)))

        def iri(local_id: str) -> URIRef:
            if local_id.startswith("http"):
                return URIRef(local_id)
            if ":" in local_id and not local_id.startswith(onto.prefix):
                # ex: xsd:string, owl:Thing
                return URIRef(local_id.replace("xsd:", str(XSD))
                              .replace("owl:", str(OWL))
                              .replace("rdfs:", str(RDFS)))
            return NS[local_id]

        def add_anns(subject: URIRef, anns) -> None:
            for a in anns.labels:
                g.add((subject, RDFS.label, Literal(a.value, lang=a.lang)))
            for a in anns.comments:
                g.add((subject, RDFS.comment, Literal(a.value, lang=a.lang)))
            for a in (anns.other if hasattr(anns, 'other') else []):
                pred = ANNO_PROP_MAP.get(a.property)
                if pred is not None and a.value:
                    g.add((subject, pred, Literal(a.value)))

        def class_expr_node(expr) -> URIRef | BNode:
            if isinstance(expr, str):
                return iri(expr)
            if isinstance(expr, UnionOf):
                bn = BNode()
                g.add((bn, RDF.type, OWL.Class))
                lst = _rdf_list(g, [class_expr_node(o) for o in expr.operands])
                g.add((bn, OWL.unionOf, lst))
                return bn
            if isinstance(expr, IntersectionOf):
                bn = BNode()
                g.add((bn, RDF.type, OWL.Class))
                lst = _rdf_list(g, [class_expr_node(o) for o in expr.operands])
                g.add((bn, OWL.intersectionOf, lst))
                return bn
            if isinstance(expr, ComplementOf):
                bn = BNode()
                g.add((bn, RDF.type, OWL.Class))
                g.add((bn, OWL.complementOf, class_expr_node(expr.operand)))
                return bn
            # Restrictions
            bn = BNode()
            g.add((bn, RDF.type, OWL.Restriction))
            g.add((bn, OWL.onProperty, iri(expr.property)))
            if isinstance(expr, SomeValuesFrom):
                if expr.filler:
                    g.add((bn, OWL.someValuesFrom, iri(expr.filler)))
            elif isinstance(expr, AllValuesFrom):
                if expr.filler:
                    g.add((bn, OWL.allValuesFrom, iri(expr.filler)))
            elif isinstance(expr, HasValue):
                if expr.value:
                    g.add((bn, OWL.hasValue, iri(expr.value)))
            elif isinstance(expr, ExactCardinality):
                g.add((bn, OWL.cardinality, Literal(expr.cardinality, datatype=XSD.nonNegativeInteger)))
                if expr.filler:
                    g.add((bn, OWL.onClass, iri(expr.filler)))
            elif isinstance(expr, MinCardinality):
                g.add((bn, OWL.minCardinality, Literal(expr.cardinality, datatype=XSD.nonNegativeInteger)))
                if expr.filler:
                    g.add((bn, OWL.onClass, iri(expr.filler)))
            elif isinstance(expr, MaxCardinality):
                g.add((bn, OWL.maxCardinality, Literal(expr.cardinality, datatype=XSD.nonNegativeInteger)))
                if expr.filler:
                    g.add((bn, OWL.onClass, iri(expr.filler)))
            return bn

        # ── Classes ──────────────────────────────────────────
        for cls in onto.classes:
            uri = iri(cls.id)
            g.add((uri, RDF.type, OWL.Class))
            add_anns(uri, cls.annotations)
            for sup in cls.subClassOf:
                if isinstance(sup, PropertyPresence):
                    continue   # marqueur UI uniquement — jamais sérialisé
                g.add((uri, RDFS.subClassOf, class_expr_node(sup)))
            for eq in cls.equivalentClass:
                g.add((uri, OWL.equivalentClass, class_expr_node(eq)))
            for dj in cls.disjointWith:
                g.add((uri, OWL.disjointWith, iri(dj)))

        # ── ObjectProperties ─────────────────────────────────
        for prop in onto.object_properties:
            uri = iri(prop.id)
            g.add((uri, RDF.type, OWL.ObjectProperty))
            add_anns(uri, prop.annotations)
            for d in prop.domain:
                g.add((uri, RDFS.domain, iri(d)))
            for r in prop.range:
                g.add((uri, RDFS.range, iri(r)))
            for sp in prop.subPropertyOf:
                g.add((uri, RDFS.subPropertyOf, iri(sp)))
            if prop.inverseOf:
                g.add((uri, OWL.inverseOf, iri(prop.inverseOf)))
            ch = prop.characteristics
            if ch.functional:        g.add((uri, RDF.type, OWL.FunctionalProperty))
            if ch.inverseFunctional: g.add((uri, RDF.type, OWL.InverseFunctionalProperty))
            if ch.transitive:        g.add((uri, RDF.type, OWL.TransitiveProperty))
            if ch.symmetric:         g.add((uri, RDF.type, OWL.SymmetricProperty))
            if ch.asymmetric:        g.add((uri, RDF.type, OWL.AsymmetricProperty))
            if ch.reflexive:         g.add((uri, RDF.type, OWL.ReflexiveProperty))
            if ch.irreflexive:       g.add((uri, RDF.type, OWL.IrreflexiveProperty))
            for chain in prop.propertyChainAxiom:
                lst = _rdf_list(g, [iri(p) for p in chain.chain])
                g.add((uri, OWL.propertyChainAxiom, lst))

        # ── DatatypeProperties ───────────────────────────────
        for prop in onto.datatype_properties:
            uri = iri(prop.id)
            g.add((uri, RDF.type, OWL.DatatypeProperty))
            add_anns(uri, prop.annotations)
            for d in prop.domain:
                g.add((uri, RDFS.domain, iri(d)))
            for r in prop.range:
                g.add((uri, RDFS.range, iri(r)))
            for sp in prop.subPropertyOf:
                g.add((uri, RDFS.subPropertyOf, iri(sp)))
            if prop.functional:
                g.add((uri, RDF.type, OWL.FunctionalProperty))

        # ── Individus ────────────────────────────────────────
        for ind in onto.individuals:
            uri = iri(ind.id)
            g.add((uri, RDF.type, OWL.NamedIndividual))
            add_anns(uri, ind.annotations)
            for t in ind.types:
                g.add((uri, RDF.type, iri(t)))
            for oa in ind.objectAssertions:
                g.add((uri, iri(oa.property), iri(oa.target)))
            for da in ind.dataAssertions:
                dt = iri(da.datatype) if da.datatype.startswith("xsd:") else XSD.string
                g.add((uri, iri(da.property), Literal(da.value, datatype=dt)))
            for s in ind.sameAs:
                g.add((uri, OWL.sameAs, iri(s)))
            for d in ind.differentFrom:
                g.add((uri, OWL.differentFrom, iri(d)))

        # ── Règles SWRL ──────────────────────────────────────
        for rule in onto.swrl_rules:
            if not rule.enabled:
                continue
            rule_uri = iri(f"rule_{rule.id}")
            g.add((rule_uri, RDF.type, SWRL_NS.Imp))
            if rule.label:
                g.add((rule_uri, RDFS.label, Literal(rule.label, lang="fr")))
            if rule.comment:
                g.add((rule_uri, RDFS.comment, Literal(rule.comment, lang="fr")))
            g.add((rule_uri, SWRL_NS.body, _swrl_atom_list(g, rule.body, iri)))
            g.add((rule_uri, SWRL_NS.head, _swrl_atom_list(g, rule.head, iri)))

        return g

    # ── Import depuis RDF ────────────────────────────────────

    def import_from_rdf(self, content: bytes, fmt: str, onto_id: str, prefix: str = "onto") -> OWLOntology:
        g = Graph()
        g.parse(data=content, format=fmt)

        base = onto_id.rstrip("#/") + "#"
        NS = Namespace(base)

        onto = OWLOntology(id=onto_id, prefix=prefix)

        # Extraire les classes
        for cls_uri in g.subjects(RDF.type, OWL.Class):
            if isinstance(cls_uri, URIRef):
                local = str(cls_uri).replace(base, "")
                if not local or "/" in local:
                    continue
                owl_cls = OWLClass(id=local)
                for label in g.objects(cls_uri, RDFS.label):
                    owl_cls.annotations.labels.append(
                        {"lang": label.language or "fr", "value": str(label)}
                    )
                for sup in g.objects(cls_uri, RDFS.subClassOf):
                    if isinstance(sup, URIRef):
                        sup_local = str(sup).replace(base, "")
                        if sup_local:
                            owl_cls.subClassOf.append(sup_local)
                onto.classes.append(owl_cls)

        # Extraire les ObjectProperties
        for prop_uri in g.subjects(RDF.type, OWL.ObjectProperty):
            if isinstance(prop_uri, URIRef):
                local = str(prop_uri).replace(base, "")
                if not local:
                    continue
                prop = OWLObjectProperty(id=local)
                for d in g.objects(prop_uri, RDFS.domain):
                    if isinstance(d, URIRef):
                        prop.domain.append(str(d).replace(base, ""))
                for r in g.objects(prop_uri, RDFS.range):
                    if isinstance(r, URIRef):
                        prop.range.append(str(r).replace(base, ""))
                onto.object_properties.append(prop)

        # Extraire les DatatypeProperties
        for prop_uri in g.subjects(RDF.type, OWL.DatatypeProperty):
            if isinstance(prop_uri, URIRef):
                local = str(prop_uri).replace(base, "")
                if not local:
                    continue
                prop = OWLDatatypeProperty(id=local)
                for d in g.objects(prop_uri, RDFS.domain):
                    if isinstance(d, URIRef):
                        prop.domain.append(str(d).replace(base, ""))
                for r in g.objects(prop_uri, RDFS.range):
                    prop.range.append(str(r).replace(base, "").replace(str(XSD), "xsd:"))
                onto.datatype_properties.append(prop)

        self._ontology = onto
        self.save()
        return onto


# ── Helpers RDF ──────────────────────────────────────────────

def _rdf_list(g: Graph, items: list) -> URIRef | BNode:
    if not items:
        return RDF.nil
    head = BNode()
    g.add((head, RDF.first, items[0]))
    g.add((head, RDF.rest, _rdf_list(g, items[1:])))
    return head


def _swrl_var(g: Graph, name: str) -> URIRef:
    v = URIRef(f"urn:swrl:var#{name}")
    g.add((v, RDF.type, SWRL_NS.Variable))
    return v


def _swrl_arg(g: Graph, arg: str, iri_fn) -> URIRef | Literal:
    if arg.startswith("?"):
        return _swrl_var(g, arg[1:])
    if arg.startswith('"') or arg.startswith("'"):
        return Literal(arg.strip("\"'"))
    if arg.replace(".", "").replace("-", "").isdigit():
        return Literal(float(arg), datatype=XSD.decimal)
    return iri_fn(arg)


def _swrl_atom_list(g: Graph, atoms: list, iri_fn) -> URIRef | BNode:
    if not atoms:
        return RDF.nil
    atom = atoms[0]
    a = BNode()
    g.add((a, RDF.type, SWRL_NS.AtomList))

    node = BNode()
    if isinstance(atom, SWRLClassAtom):
        g.add((node, RDF.type, SWRL_NS.ClassAtom))
        g.add((node, SWRL_NS.classPredicate, iri_fn(atom.class_iri)))
        g.add((node, SWRL_NS.argument1, _swrl_var(g, atom.variable)))
    elif isinstance(atom, SWRLObjectPropertyAtom):
        g.add((node, RDF.type, SWRL_NS.IndividualPropertyAtom))
        g.add((node, SWRL_NS.propertyPredicate, iri_fn(atom.property_iri)))
        g.add((node, SWRL_NS.argument1, _swrl_arg(g, atom.arg1, iri_fn)))
        g.add((node, SWRL_NS.argument2, _swrl_arg(g, atom.arg2, iri_fn)))
    elif isinstance(atom, SWRLDataPropertyAtom):
        g.add((node, RDF.type, SWRL_NS.DatavaluedPropertyAtom))
        g.add((node, SWRL_NS.propertyPredicate, iri_fn(atom.property_iri)))
        g.add((node, SWRL_NS.argument1, _swrl_arg(g, atom.arg1, iri_fn)))
        g.add((node, SWRL_NS.argument2, _swrl_arg(g, atom.arg2, iri_fn)))
    elif isinstance(atom, SWRLBuiltinAtom):
        g.add((node, RDF.type, SWRL_NS.BuiltinAtom))
        g.add((node, SWRL_NS.builtin, URIRef(atom.builtin.replace("swrlb:", str(SWRLB_NS)))))
        arg_nodes = [_swrl_arg(g, a, iri_fn) for a in atom.args]
        g.add((node, SWRL_NS.arguments, _rdf_list(g, arg_nodes)))

    g.add((a, RDF.first, node))
    g.add((a, RDF.rest, _swrl_atom_list(g, atoms[1:], iri_fn)))
    return a


# Singleton global
store = TripleStore()
