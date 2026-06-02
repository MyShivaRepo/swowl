"""
triple_store.py — Triple store in-memory basé sur rdflib
Persistance via fichiers JSON à chemins arbitraires
Registre centralisé : DATA_DIR/registry.json
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

REGISTRY_FILE = DATA_DIR / "registry.json"

# Préfixe pour traduire les chemins hôte → container
HOST_PREFIX_CONTAINER = "/host/Users/bernard"
HOST_PREFIX_HOST       = "/Users/bernard"


def host_to_container(path: str) -> str:
    """Traduit un chemin hôte Mac en chemin container Docker."""
    if path.startswith(HOST_PREFIX_HOST):
        return HOST_PREFIX_CONTAINER + path[len(HOST_PREFIX_HOST):]
    return path


def container_to_host(path: str) -> str:
    """Traduit un chemin container Docker en chemin hôte Mac."""
    if path.startswith(HOST_PREFIX_CONTAINER):
        return HOST_PREFIX_HOST + path[len(HOST_PREFIX_CONTAINER):]
    return path


class RegistryEntry:
    def __init__(self, name: str, path: str, uri: str, prefix: str, connected: bool = False):
        self.name = name
        self.path = path        # chemin hôte (affiché à l'utilisateur)
        self.uri = uri
        self.prefix = prefix
        self.connected = connected

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "path": self.path,
            "uri": self.uri,
            "prefix": self.prefix,
            "connected": self.connected,
        }

    @staticmethod
    def from_dict(d: dict) -> "RegistryEntry":
        return RegistryEntry(
            name=d["name"],
            path=d["path"],
            uri=d["uri"],
            prefix=d.get("prefix", "onto"),
            connected=d.get("connected", False),
        )


class TripleStore:

    def __init__(self):
        self._ontology: Optional[OWLOntology] = None
        self._registry: dict[str, RegistryEntry] = {}
        self._load_registry()
        # Auto-connecter la première ontologie connectée trouvée dans le registre
        for entry in self._registry.values():
            if entry.connected:
                self._load_from_entry(entry)
                break

    # ── Registre ─────────────────────────────────────────────

    def _load_registry(self) -> None:
        if REGISTRY_FILE.exists():
            try:
                data = json.loads(REGISTRY_FILE.read_text(encoding="utf-8"))
                self._registry = {
                    e["name"]: RegistryEntry.from_dict(e)
                    for e in data.get("entries", [])
                }
            except Exception:
                self._registry = {}

    def _save_registry(self) -> None:
        data = {"entries": [e.to_dict() for e in self._registry.values()]}
        REGISTRY_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

    def list_registry(self) -> list[dict]:
        return [e.to_dict() for e in self._registry.values()]

    # ── CRUD registre ────────────────────────────────────────

    def register(self, name: str, path: str, uri: str, prefix: str) -> RegistryEntry:
        entry = RegistryEntry(name=name, path=path, uri=uri, prefix=prefix, connected=False)
        self._registry[name] = entry
        self._save_registry()
        return entry

    def unregister(self, name: str) -> bool:
        if name not in self._registry:
            return False
        entry = self._registry[name]
        if entry.connected:
            self._ontology = None
        del self._registry[name]
        self._save_registry()
        return True

    def update_entry(self, name: str, new_name: str, path: str, uri: str, prefix: str) -> Optional[RegistryEntry]:
        if name not in self._registry:
            return None
        was_connected = self._registry[name].connected
        del self._registry[name]
        entry = RegistryEntry(name=new_name, path=path, uri=uri, prefix=prefix, connected=was_connected)
        self._registry[new_name] = entry
        self._save_registry()
        return entry

    # ── Connexion / déconnexion ──────────────────────────────

    def connect(self, name: str) -> Optional[OWLOntology]:
        if name not in self._registry:
            return None
        # Déconnecter toute ontologie précédemment connectée
        for e in self._registry.values():
            e.connected = False
        entry = self._registry[name]
        entry.connected = True
        onto = self._load_from_entry(entry)
        self._save_registry()
        return onto

    def disconnect(self) -> None:
        for e in self._registry.values():
            e.connected = False
        self._ontology = None
        self._save_registry()

    def _load_from_entry(self, entry: RegistryEntry) -> Optional[OWLOntology]:
        container_path = host_to_container(entry.path)
        p = Path(container_path)
        if p.exists():
            try:
                data = json.loads(p.read_text(encoding="utf-8"))
                self._ontology = OWLOntology.model_validate(data)
                return self._ontology
            except Exception:
                pass
        # Fichier inexistant → créer ontologie vide
        onto = OWLOntology(id=entry.uri, name=entry.name, prefix=entry.prefix)
        self._ontology = onto
        self._save_onto(onto, entry.path)
        return onto

    # ── Persistance ontologie ────────────────────────────────

    def _save_onto(self, onto: OWLOntology, host_path: str) -> None:
        container_path = host_to_container(host_path)
        p = Path(container_path)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(onto.model_dump_json(indent=2), encoding="utf-8")

    def save(self) -> None:
        if not self._ontology:
            return
        # Trouver l'entrée connectée pour connaître le path
        for entry in self._registry.values():
            if entry.connected:
                self._save_onto(self._ontology, entry.path)
                return

    # ── Accès ontologie ──────────────────────────────────────

    def get(self) -> Optional[OWLOntology]:
        return self._ontology

    def set(self, onto: OWLOntology) -> None:
        self._ontology = onto
        self.save()

    # ── Import depuis RDF ────────────────────────────────────

    def import_from_rdf(self, content: bytes, fmt: str, name: str, host_path: str, uri: str, prefix: str = "onto") -> OWLOntology:
        g = Graph()
        g.parse(data=content, format=fmt)

        base = uri.rstrip("#/") + "#"
        NS = Namespace(base)

        onto = OWLOntology(id=uri, name=name, prefix=prefix)

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
        # Enregistrer dans le registre et sauver le fichier
        self.register(name, host_path, uri, prefix)
        self._save_onto(onto, host_path)
        # Connecter automatiquement
        self.connect(name)
        return onto

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

        for cls in onto.classes:
            uri_ = iri(cls.id)
            g.add((uri_, RDF.type, OWL.Class))
            add_anns(uri_, cls.annotations)
            for sup in cls.subClassOf:
                if isinstance(sup, PropertyPresence):
                    continue
                g.add((uri_, RDFS.subClassOf, class_expr_node(sup)))
            for eq in cls.equivalentClass:
                g.add((uri_, OWL.equivalentClass, class_expr_node(eq)))
            for dj in cls.disjointWith:
                g.add((uri_, OWL.disjointWith, iri(dj)))

        for prop in onto.object_properties:
            uri_ = iri(prop.id)
            g.add((uri_, RDF.type, OWL.ObjectProperty))
            add_anns(uri_, prop.annotations)
            for d in prop.domain:
                g.add((uri_, RDFS.domain, iri(d)))
            for r in prop.range:
                g.add((uri_, RDFS.range, iri(r)))
            for sp in prop.subPropertyOf:
                g.add((uri_, RDFS.subPropertyOf, iri(sp)))
            if prop.inverseOf:
                g.add((uri_, OWL.inverseOf, iri(prop.inverseOf)))
            ch = prop.characteristics
            if ch.functional:        g.add((uri_, RDF.type, OWL.FunctionalProperty))
            if ch.inverseFunctional: g.add((uri_, RDF.type, OWL.InverseFunctionalProperty))
            if ch.transitive:        g.add((uri_, RDF.type, OWL.TransitiveProperty))
            if ch.symmetric:         g.add((uri_, RDF.type, OWL.SymmetricProperty))
            if ch.asymmetric:        g.add((uri_, RDF.type, OWL.AsymmetricProperty))
            if ch.reflexive:         g.add((uri_, RDF.type, OWL.ReflexiveProperty))
            if ch.irreflexive:       g.add((uri_, RDF.type, OWL.IrreflexiveProperty))
            for chain in prop.propertyChainAxiom:
                lst = _rdf_list(g, [iri(p) for p in chain.chain])
                g.add((uri_, OWL.propertyChainAxiom, lst))

        for prop in onto.datatype_properties:
            uri_ = iri(prop.id)
            g.add((uri_, RDF.type, OWL.DatatypeProperty))
            add_anns(uri_, prop.annotations)
            for d in prop.domain:
                g.add((uri_, RDFS.domain, iri(d)))
            for r in prop.range:
                g.add((uri_, RDFS.range, iri(r)))
            for sp in prop.subPropertyOf:
                g.add((uri_, RDFS.subPropertyOf, iri(sp)))
            if prop.functional:
                g.add((uri_, RDF.type, OWL.FunctionalProperty))

        for ind in onto.individuals:
            uri_ = iri(ind.id)
            g.add((uri_, RDF.type, OWL.NamedIndividual))
            add_anns(uri_, ind.annotations)
            for t in ind.types:
                g.add((uri_, RDF.type, iri(t)))
            for oa in ind.objectAssertions:
                g.add((uri_, iri(oa.property), iri(oa.target)))
            for da in ind.dataAssertions:
                dt = iri(da.datatype) if da.datatype.startswith("xsd:") else XSD.string
                g.add((uri_, iri(da.property), Literal(da.value, datatype=dt)))
            for s in ind.sameAs:
                g.add((uri_, OWL.sameAs, iri(s)))
            for d in ind.differentFrom:
                g.add((uri_, OWL.differentFrom, iri(d)))

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

    # ── Méthodes conservées pour compatibilité ───────────────

    def load_last(self) -> Optional[OWLOntology]:
        return self._ontology


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
