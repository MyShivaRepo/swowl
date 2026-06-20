"""
triple_store.py — Triple store in-memory basé sur rdflib
Persistance via fichiers JSON à chemins arbitraires
Registre centralisé : ~/.swowl/registry.json (indépendant du répertoire projet)
"""
from __future__ import annotations
import os
import json
import threading
from pathlib import Path
from typing import Optional

from rdflib import Graph, Namespace, RDF, RDFS, OWL, XSD, Literal, URIRef, BNode
from rdflib.namespace import SKOS

from owl_model import (
    OWLOntology, OWLClass, OWLObjectProperty, OWLDatatypeProperty,
    OWLIndividual, ObjectPropertyAssertion, DataPropertyAssertion,
    OtherAnnotation,
    SomeValuesFrom, AllValuesFrom, HasValue,
    ExactCardinality, MinCardinality, MaxCardinality,
    UnionOf, IntersectionOf, ComplementOf,
    PropertyPresence,
)

# Types de données XSD reconnus (pour mapper les range de DatatypeProperty vers
# l'espace de noms XSD, qu'ils soient nus « string » ou préfixés « xsd:string »).
_XSD_DATATYPES = {
    "string", "boolean", "decimal", "integer", "float", "double",
    "date", "dateTime", "dateTimeStamp", "time", "duration",
    "anyURI", "base64Binary", "hexBinary", "language",
    "normalizedString", "token", "Name", "NCName", "anySimpleType",
    "long", "int", "short", "byte",
    "nonNegativeInteger", "positiveInteger", "negativeInteger", "nonPositiveInteger",
    "unsignedLong", "unsignedInt", "unsignedShort", "unsignedByte",
    "gYear", "gMonth", "gDay", "gYearMonth", "gMonthDay",
}

ANNO_PROP_MAP = {
    'rdfs:seeAlso':               RDFS.seeAlso,
    'rdfs:isDefinedBy':           RDFS.isDefinedBy,
    'owl:versionInfo':            OWL.versionInfo,
    'owl:deprecated':             OWL.deprecated,
    'owl:priorVersion':           OWL.priorVersion,
    'owl:backwardCompatibleWith': OWL.backwardCompatibleWith,
    'owl:incompatibleWith':       OWL.incompatibleWith,
    # SKOS annotation properties
    'skos:prefLabel':             SKOS.prefLabel,
    'skos:altLabel':              SKOS.altLabel,
    'skos:hiddenLabel':           SKOS.hiddenLabel,
    'skos:definition':            SKOS.definition,
    'skos:note':                  SKOS.note,
    'skos:scopeNote':             SKOS.scopeNote,
    'skos:example':               SKOS.example,
    'skos:editorialNote':         SKOS.editorialNote,
    'skos:historyNote':           SKOS.historyNote,
    'skos:changeNote':            SKOS.changeNote,
}

# Table inverse {predicate URIRef: id préfixé} — pour capturer les annotations « other » à l'import.
ANNO_PRED_TO_ID = {pred: pid for pid, pred in ANNO_PROP_MAP.items()}

# Répertoire de configuration utilisateur (persistant, indépendant du volume projet)
SWOWL_DIR = Path(os.environ.get("SWOWL_DIR", "/host/Users/bernard/.swowl"))
SWOWL_DIR.mkdir(parents=True, exist_ok=True)

REGISTRY_FILE = SWOWL_DIR / "registry.json"

# Répertoire par défaut pour les nouvelles ontologies (optionnel)
DATA_DIR = Path(os.environ.get("DATA_DIR", str(SWOWL_DIR / "ontologies")))
try:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    pass  # non critique — l'utilisateur peut spécifier n'importe quel chemin

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
    def __init__(self, name: str, path: str, uri: str, prefix: str,
                 connected: bool = False, readonly: bool = False,
                 imports: list = None, import_labels: dict = None):
        self.name = name
        self.path = path        # chemin hôte (affiché à l'utilisateur)
        self.uri = uri
        self.prefix = prefix
        self.connected = connected
        self.readonly = readonly   # True for built-in W3C ontologies
        self.imports = imports or []  # list of imported ontology URIs
        # Instantané {uri: {"prefix", "name"}} capturé à la déclaration de l'import,
        # pour réafficher préfixe:nom même si l'ontologie importée quitte le registre.
        self.import_labels = import_labels or {}

    def to_dict(self) -> dict:
        return {
            "name":          self.name,
            "path":          self.path,
            "uri":           self.uri,
            "prefix":        self.prefix,
            "connected":     self.connected,
            "readonly":      self.readonly,
            "imports":       self.imports,
            "import_labels": self.import_labels,
        }

    @staticmethod
    def from_dict(d: dict) -> "RegistryEntry":
        return RegistryEntry(
            name=d["name"],
            path=d["path"],
            uri=d["uri"],
            prefix=d.get("prefix", "onto"),
            connected=d.get("connected", False),
            readonly=d.get("readonly", False),
            imports=d.get("imports", []),
            import_labels=d.get("import_labels", {}),
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

    def _imports_from_ns(self, ns_prefixes):
        """À partir de la table [{prefix, namespace}] du wizard, construit
        (imports, import_labels) : déclare chaque namespace comme owl:imports et
        retient le préfixe CONTEXTUEL choisi par l'utilisateur (prioritaire à
        l'affichage). Le nom est résolu contre le registre courant si possible."""
        imports, labels = [], {}
        for d in (ns_prefixes or []):
            if not isinstance(d, dict):
                continue
            ns  = (d.get("namespace") or "").strip()
            pfx = (d.get("prefix") or "").strip()
            if not ns:
                continue   # préfixe optionnel : vide → affichage par namespace complet
            if ns not in imports:
                imports.append(ns)
            name = ""
            for e in self._registry.values():
                if e.uri == ns or e.uri.rstrip("#/") == ns.rstrip("#/"):
                    name = e.name
                    break
            labels[ns] = {"prefix": pfx, "name": name}
        return imports, labels

    def register(self, name: str, path: str, uri: str, prefix: str, ns_prefixes=None) -> RegistryEntry:
        imports, labels = self._imports_from_ns(ns_prefixes)
        entry = RegistryEntry(name=name, path=path, uri=uri, prefix=prefix, connected=False,
                              imports=imports, import_labels=labels)
        self._registry[name] = entry
        self._save_registry()
        # Create the .json file immediately if it doesn't exist yet
        container_path = host_to_container(path)
        p = Path(container_path)
        if not p.exists():
            onto = OWLOntology(id=uri, name=name, prefix=prefix, ns_prefixes=ns_prefixes or [],
                               imports=imports, import_labels=labels)
            self._save_onto(onto, path)
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

    def update_entry(self, name: str, new_name: str, path: str, uri: str, prefix: str,
                     ns_prefixes=None) -> Optional[RegistryEntry]:
        if name not in self._registry:
            return None
        old = self._registry[name]
        was_connected = old.connected
        # ns_prefixes fourni → recalcule imports/import_labels (préfixe contextuel) ;
        # sinon on conserve les imports existants tels quels.
        if ns_prefixes is not None:
            imports, labels = self._imports_from_ns(ns_prefixes)
        else:
            imports, labels = old.imports, old.import_labels
        del self._registry[name]
        entry = RegistryEntry(name=new_name, path=path, uri=uri, prefix=prefix,
                              connected=was_connected, imports=imports, import_labels=labels)
        self._registry[new_name] = entry
        self._save_registry()
        # Persiste imports/import_labels (+ ns_prefixes) dans le .json pour qu'ils voyagent
        try:
            p = Path(host_to_container(path))
            if p.exists():
                data = json.loads(p.read_text(encoding="utf-8"))
                data["imports"] = imports
                data["import_labels"] = labels
                if ns_prefixes is not None:
                    data["ns_prefixes"] = ns_prefixes
                p.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        except Exception:
            pass
        # Reflète sur l'ontologie connectée en mémoire
        if was_connected and self._ontology is not None:
            self._ontology.imports = imports
            self._ontology.import_labels = labels
            if ns_prefixes is not None:
                self._ontology.ns_prefixes = ns_prefixes
        return entry

    def update_imports(self, name: str, import_uris: list) -> Optional[RegistryEntry]:
        """Met à jour la liste des imports déclarés pour une entrée du registre."""
        if name not in self._registry:
            return None
        self._registry[name].imports = import_uris
        self._save_registry()
        return self._registry[name]

    def load_imported_entities(self, name: str) -> list:
        """Charge les entités des ontologies importées par `name`.
        Retourne une liste de dicts {prefix, uri, classes, object_properties,
        datatype_properties, individuals}."""
        entry = self._registry.get(name)
        if not entry or not entry.imports:
            return []
        results = []
        for imp_uri in entry.imports:
            # Trouver l'entrée du registre correspondant à cet URI
            imp_entry = next(
                (e for e in self._registry.values()
                 if e.uri == imp_uri or e.uri == imp_uri + '#'
                 or imp_uri == e.uri + '#'),
                None
            )
            if not imp_entry:
                continue
            container_path = host_to_container(imp_entry.path)
            p = Path(container_path)
            if not p.exists():
                continue
            try:
                data = json.loads(p.read_text(encoding="utf-8"))
                results.append({
                    "name":                 imp_entry.name,
                    "prefix":               imp_entry.prefix,
                    "uri":                  imp_entry.uri,
                    "classes":              data.get("classes", []),
                    "object_properties":    data.get("object_properties", []),
                    "datatype_properties":  data.get("datatype_properties", []),
                    "individuals":          data.get("individuals", []),
                })
            except Exception:
                continue
        return results

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
                # Restauration : si le fichier déclare des imports mais que l'entrée
                # registre est vide (fichier déplacé, registre réinitialisé), on
                # repeuple le registre depuis le fichier (source de vérité portable).
                if self._ontology.imports and not entry.imports:
                    entry.imports = list(self._ontology.imports)
                    if self._ontology.import_labels and not entry.import_labels:
                        entry.import_labels = dict(self._ontology.import_labels)
                    self._save_registry()
                return self._ontology
            except Exception:
                pass
        # Fichier inexistant → créer ontologie vide
        onto = OWLOntology(id=entry.uri, name=entry.name, prefix=entry.prefix)
        self._ontology = onto
        self._save_onto(onto, entry.path)
        return onto

    # ── Persistance ontologie ────────────────────────────────
    # Verrou d'écriture : le frontend peut émettre des mutations en parallèle
    # (multi-drag → Promise.all) ; chaque endpoint tourne dans un thread du
    # pool FastAPI. Le lock sérialise les écritures fichier pour éviter deux
    # write_text entrelacés sur le même chemin.

    _save_lock = threading.Lock()

    def _save_onto(self, onto: OWLOntology, host_path: str) -> None:
        container_path = host_to_container(host_path)
        p = Path(container_path)
        with self._save_lock:
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(onto.model_dump_json(indent=2), encoding="utf-8")

    def save(self) -> None:
        if not self._ontology:
            return
        # Trouver l'entrée connectée pour connaître le path
        for entry in self._registry.values():
            if entry.connected:
                # Le registre est la source de vérité des imports pendant l'édition :
                # on le recopie dans l'ontologie pour qu'il soit écrit dans le .json.
                self._ontology.imports = list(entry.imports)
                self._ontology.import_labels = dict(entry.import_labels)
                self._save_onto(self._ontology, entry.path)
                return

    # ── Accès ontologie ──────────────────────────────────────

    def get(self) -> Optional[OWLOntology]:
        return self._ontology

    def set(self, onto: OWLOntology) -> None:
        self._ontology = onto
        self.save()

    # ── Import depuis RDF ────────────────────────────────────

    @staticmethod
    def _detect_base(g: "Graph", user_uri: str) -> str:
        """Détecte la base IRI réelle de l'ontologie depuis le graphe RDF.
        Essaie d'abord le namespace déclaré dans owl:Ontology, puis cherche
        le préfixe commun aux entités, et retombe sur l'URI fournie par l'utilisateur."""
        from rdflib import OWL as _OWL, RDF as _RDF, URIRef as _URIRef
        # 1. Chercher owl:Ontology rdf:about
        for s in g.subjects(_RDF.type, _OWL.Ontology):
            if isinstance(s, _URIRef) and str(s).startswith("http"):
                return str(s).rstrip("#/") + "#"
        # 2. Chercher le préfixe commun des classes/propriétés
        iris = [str(s) for s in g.subjects(_RDF.type, _OWL.Class)
                if isinstance(s, _URIRef)]
        iris += [str(s) for s in g.subjects(_RDF.type, _OWL.ObjectProperty)
                 if isinstance(s, _URIRef)]
        if iris and "#" in iris[0]:
            return iris[0].rsplit("#", 1)[0] + "#"
        # 3. Retomber sur l'URI fournie
        return user_uri.rstrip("#/") + "#"

    @staticmethod
    def _local_name(uri_str: str, base: str) -> str:
        """Extrait le nom local en retirant la base ; si échec, utilise le fragment ou le dernier segment."""
        local = uri_str.replace(base, "")
        if local and "/" not in local and "#" not in local:
            return local
        # Essai fragment (#)
        if "#" in uri_str:
            fragment = uri_str.split("#")[-1]
            if fragment:
                return fragment
        # Essai dernier segment (/)
        segment = uri_str.rstrip("/").split("/")[-1]
        return segment if segment else ""

    def import_from_rdf(self, content: bytes, fmt: str, name: str, host_path: str, uri: str, prefix: str = "onto", ns_prefixes=None) -> OWLOntology:
        g = Graph()
        g.parse(data=content, format=fmt)

        base = self._detect_base(g, uri)
        # Préfixes des namespaces référencés/importés, fournis par le wizard
        # → [(namespace_uri, prefix)] triés par longueur de namespace décroissante
        # (le plus spécifique d'abord) pour le préfixage dans _lid.
        _user_ns = sorted(
            [(d["namespace"], d["prefix"]) for d in (ns_prefixes or [])
             if isinstance(d, dict) and d.get("namespace") and d.get("prefix")],
            key=lambda t: len(t[0]), reverse=True,
        )
        onto_id = base.rstrip("#/")

        onto = OWLOntology(id=onto_id, name=name, prefix=prefix, ns_prefixes=ns_prefixes or [])

        # ── Helper: collect labels & comments for any URI ───────
        def _collect_labels(uri_ref):
            labels, comments = [], []
            for lbl in g.objects(uri_ref, RDFS.label):
                labels.append({"lang": lbl.language or "en", "value": str(lbl)})
            for cmt in g.objects(uri_ref, RDFS.comment):
                comments.append({"lang": cmt.language or "en", "value": str(cmt)})
            return labels, comments

        # ── Helper: collect "other" annotations (rdfs:seeAlso, skos:*, owl:*…) ───
        def _collect_other(uri_ref):
            other = []
            for pred, pid in ANNO_PRED_TO_ID.items():
                for obj in g.objects(uri_ref, pred):
                    other.append(OtherAnnotation(property=pid, value=str(obj)))
            return other

        # ── Helper: extract local name with prefix fallback ──────
        def _lid(uri_str_val):
            """Return a prefixed local id — e.g. 'rdf:type', 'rdfs:label', or bare 'MyClass'."""
            # 1. Known external namespaces — check FIRST so rdfs:Resource beats bare 'Resource'
            for ns_uri, ns_prefix in [
                (str(XSD),  "xsd"),
                (str(OWL),  "owl"),
                (str(RDFS), "rdfs"),
                (str(RDF),  "rdf"),
            ]:
                if uri_str_val.startswith(ns_uri) and ns_uri != base:
                    return ns_prefix + ":" + uri_str_val[len(ns_uri):]
            # 2. Appartient à la base de l'ontologie courante → nom local nu.
            #    PRIORITAIRE sur les namespaces utilisateur : la base peut être un
            #    sur-ensemble d'un namespace importé (ex. base .../plm/data# vs
            #    import .../plm) — sinon 'MyClass' deviendrait 'plm:/data#MyClass'.
            if base and uri_str_val.startswith(base):
                return self._local_name(uri_str_val, base)
            # 3. Namespaces référencés définis par l'utilisateur (wizard d'import).
            #    On retire un éventuel séparateur '#'/'/' en tête du reste : le
            #    namespace déclaré peut ne pas inclure le '#' final (ex. ns
            #    'http://ex.org/plm' vs entité 'http://ex.org/plm#Article').
            for ns_uri, ns_prefix in _user_ns:
                if ns_uri != base and uri_str_val.startswith(ns_uri):
                    return ns_prefix + ":" + uri_str_val[len(ns_uri):].lstrip("#/")
            # 4. Repli : extraction du nom local
            return self._local_name(uri_str_val, base)

        # ── Helper: parse an owl:Restriction BNode → Restriction object ──
        def _parse_restriction(node):
            """Parse a BNode that is an owl:Restriction into a Restriction model object.
            Returns None if the node is not a recognisable restriction."""
            if not isinstance(node, BNode):
                return None
            # Must be typed as owl:Restriction (or inferred via onProperty)
            on_prop = next(g.objects(node, OWL.onProperty), None)
            if on_prop is None:
                return None
            prop_id = _lid(str(on_prop)) if isinstance(on_prop, URIRef) else None
            if not prop_id:
                return None

            def _filler(rdf_node):
                """Resolve a filler node to a local id string (URIRef only)."""
                if isinstance(rdf_node, URIRef):
                    return _lid(str(rdf_node))
                return None

            # someValuesFrom
            sv = next(g.objects(node, OWL.someValuesFrom), None)
            if sv is not None:
                return SomeValuesFrom(property=prop_id, filler=_filler(sv))

            # allValuesFrom
            av = next(g.objects(node, OWL.allValuesFrom), None)
            if av is not None:
                return AllValuesFrom(property=prop_id, filler=_filler(av))

            # hasValue
            hv = next(g.objects(node, OWL.hasValue), None)
            if hv is not None:
                val = _lid(str(hv)) if isinstance(hv, URIRef) else str(hv)
                return HasValue(property=prop_id, value=val)

            # exactCardinality (owl:cardinality or owl:qualifiedCardinality)
            for card_pred in (OWL.cardinality, OWL.qualifiedCardinality):
                cv = next(g.objects(node, card_pred), None)
                if cv is not None:
                    filler_node = next(g.objects(node, OWL.onClass), None)
                    return ExactCardinality(property=prop_id, cardinality=int(cv),
                                           filler=_filler(filler_node))

            # minCardinality
            for card_pred in (OWL.minCardinality, OWL.minQualifiedCardinality):
                cv = next(g.objects(node, card_pred), None)
                if cv is not None:
                    filler_node = next(g.objects(node, OWL.onClass), None)
                    return MinCardinality(property=prop_id, cardinality=int(cv),
                                         filler=_filler(filler_node))

            # maxCardinality
            for card_pred in (OWL.maxCardinality, OWL.maxQualifiedCardinality):
                cv = next(g.objects(node, card_pred), None)
                if cv is not None:
                    filler_node = next(g.objects(node, OWL.onClass), None)
                    return MaxCardinality(property=prop_id, cardinality=int(cv),
                                         filler=_filler(filler_node))

            return None

        # ── Classes: owl:Class + rdfs:Class ─────────────────────
        seen_cls = set()
        for cls_type in (OWL.Class, RDFS.Class):
            for cls_uri in g.subjects(RDF.type, cls_type):
                if not isinstance(cls_uri, URIRef) or str(cls_uri) in seen_cls:
                    continue
                local = _lid(str(cls_uri))
                if not local:
                    continue
                seen_cls.add(str(cls_uri))
                labels, comments = _collect_labels(cls_uri)
                owl_cls = OWLClass(id=local)
                owl_cls.annotations.labels   = labels
                owl_cls.annotations.comments = comments
                owl_cls.annotations.other    = _collect_other(cls_uri)
                for sup in g.objects(cls_uri, RDFS.subClassOf):
                    if isinstance(sup, URIRef):
                        sup_local = _lid(str(sup))
                        if sup_local:
                            owl_cls.subClassOf.append(sup_local)
                    elif isinstance(sup, BNode):
                        restr = _parse_restriction(sup)
                        if restr is not None:
                            owl_cls.subClassOf.append(restr)
                for dj in g.objects(cls_uri, OWL.disjointWith):
                    if isinstance(dj, URIRef):
                        dj_local = _lid(str(dj))
                        if dj_local:
                            owl_cls.disjointWith.append(dj_local)
                # equivalentClass : classe nommée OU restriction anonyme (ex. ≡ ∃hasPart.Part)
                for eq in g.objects(cls_uri, OWL.equivalentClass):
                    if isinstance(eq, URIRef):
                        eq_local = _lid(str(eq))
                        if eq_local:
                            owl_cls.equivalentClass.append(eq_local)
                    elif isinstance(eq, BNode):
                        restr = _parse_restriction(eq)
                        if restr is not None:
                            owl_cls.equivalentClass.append(restr)
                onto.classes.append(owl_cls)

        # ── Object Properties: owl:ObjectProperty ───────────────
        seen_op = set()
        for prop_uri in g.subjects(RDF.type, OWL.ObjectProperty):
            if not isinstance(prop_uri, URIRef) or str(prop_uri) in seen_op:
                continue
            local = _lid(str(prop_uri))
            if not local:
                continue
            seen_op.add(str(prop_uri))
            labels, comments = _collect_labels(prop_uri)
            prop = OWLObjectProperty(id=local)
            prop.annotations.labels   = labels
            prop.annotations.comments = comments
            prop.annotations.other    = _collect_other(prop_uri)
            for d in g.objects(prop_uri, RDFS.domain):
                if isinstance(d, URIRef):
                    dl = _lid(str(d))
                    if dl: prop.domain.append(dl)
            for r in g.objects(prop_uri, RDFS.range):
                if isinstance(r, URIRef):
                    rl = _lid(str(r))
                    if rl: prop.range.append(rl)
            for sp in g.objects(prop_uri, RDFS.subPropertyOf):
                if isinstance(sp, URIRef):
                    sl = _lid(str(sp))
                    if sl: prop.subPropertyOf.append(sl)
            for inv in g.objects(prop_uri, OWL.inverseOf):
                if isinstance(inv, URIRef):
                    il = _lid(str(inv))
                    if il:
                        prop.inverseOf = il
                        break
            # Caractéristiques OWL
            prop_types = set(g.objects(prop_uri, RDF.type))
            prop.characteristics.functional        = OWL.FunctionalProperty        in prop_types
            prop.characteristics.inverseFunctional = OWL.InverseFunctionalProperty in prop_types
            prop.characteristics.transitive        = OWL.TransitiveProperty        in prop_types
            prop.characteristics.symmetric         = OWL.SymmetricProperty         in prop_types
            prop.characteristics.asymmetric        = OWL.AsymmetricProperty        in prop_types
            prop.characteristics.reflexive         = OWL.ReflexiveProperty         in prop_types
            prop.characteristics.irreflexive       = OWL.IrreflexiveProperty       in prop_types
            onto.object_properties.append(prop)

        # ── Datatype Properties: owl:DatatypeProperty ────────────
        seen_dp = set()
        for prop_uri in g.subjects(RDF.type, OWL.DatatypeProperty):
            if not isinstance(prop_uri, URIRef) or str(prop_uri) in seen_dp:
                continue
            local = _lid(str(prop_uri))
            if not local:
                continue
            seen_dp.add(str(prop_uri))
            labels, comments = _collect_labels(prop_uri)
            prop = OWLDatatypeProperty(id=local)
            prop.annotations.labels   = labels
            prop.annotations.comments = comments
            prop.annotations.other    = _collect_other(prop_uri)
            for d in g.objects(prop_uri, RDFS.domain):
                if isinstance(d, URIRef):
                    dl = _lid(str(d))
                    if dl: prop.domain.append(dl)
            for r in g.objects(prop_uri, RDFS.range):
                if isinstance(r, URIRef):
                    rl = _lid(str(r))
                    if rl: prop.range.append(rl)
                # else : owl:DataRange/oneOf (datatype énuméré) — non modélisé,
                #        on ignore le nœud anonyme (évitait un id illisible 'Nxxxx')
            for sp in g.objects(prop_uri, RDFS.subPropertyOf):
                if isinstance(sp, URIRef):
                    sl = _lid(str(sp))
                    if sl: prop.subPropertyOf.append(sl)
            onto.datatype_properties.append(prop)

        # ── rdf:Property → OP or DP depending on range ──────────
        seen_rp = seen_op | seen_dp
        for prop_uri in g.subjects(RDF.type, RDF.Property):
            if not isinstance(prop_uri, URIRef) or str(prop_uri) in seen_rp:
                continue
            local = _lid(str(prop_uri))
            if not local:
                continue
            seen_rp.add(str(prop_uri))
            labels, comments = _collect_labels(prop_uri)
            # Detect range type: xsd: → DatatypeProperty, else ObjectProperty
            ranges = list(g.objects(prop_uri, RDFS.range))
            is_datatype = any(str(r).startswith(str(XSD)) for r in ranges if isinstance(r, URIRef))
            if is_datatype:
                prop = OWLDatatypeProperty(id=local)
                prop.annotations.labels   = labels
                prop.annotations.comments = comments
                prop.annotations.other    = _collect_other(prop_uri)
                for d in g.objects(prop_uri, RDFS.domain):
                    if isinstance(d, URIRef):
                        dl = _lid(str(d))
                        if dl: prop.domain.append(dl)
                for r in ranges:
                    rl = str(r).replace(str(XSD), "xsd:") if isinstance(r, URIRef) else ""
                    if rl: prop.range.append(rl)
                for sp in g.objects(prop_uri, RDFS.subPropertyOf):
                    if isinstance(sp, URIRef):
                        sl = _lid(str(sp))
                        if sl: prop.subPropertyOf.append(sl)
                onto.datatype_properties.append(prop)
            else:
                prop = OWLObjectProperty(id=local)
                prop.annotations.labels   = labels
                prop.annotations.comments = comments
                prop.annotations.other    = _collect_other(prop_uri)
                for d in g.objects(prop_uri, RDFS.domain):
                    if isinstance(d, URIRef):
                        dl = _lid(str(d))
                        if dl: prop.domain.append(dl)
                for r in ranges:
                    if isinstance(r, URIRef):
                        rl = _lid(str(r))
                        if rl: prop.range.append(rl)
                for sp in g.objects(prop_uri, RDFS.subPropertyOf):
                    if isinstance(sp, URIRef):
                        sl = _lid(str(sp))
                        if sl: prop.subPropertyOf.append(sl)
                for inv in g.objects(prop_uri, OWL.inverseOf):
                    if isinstance(inv, URIRef):
                        il = _lid(str(inv))
                        if il:
                            prop.inverseOf = il
                            break
                prop_types = set(g.objects(prop_uri, RDF.type))
                prop.characteristics.functional        = OWL.FunctionalProperty        in prop_types
                prop.characteristics.inverseFunctional = OWL.InverseFunctionalProperty in prop_types
                prop.characteristics.transitive        = OWL.TransitiveProperty        in prop_types
                prop.characteristics.symmetric         = OWL.SymmetricProperty         in prop_types
                prop.characteristics.asymmetric        = OWL.AsymmetricProperty        in prop_types
                prop.characteristics.reflexive         = OWL.ReflexiveProperty         in prop_types
                prop.characteristics.irreflexive       = OWL.IrreflexiveProperty       in prop_types
                onto.object_properties.append(prop)

        # Passe de symétrie inverseOf : si A.inverseOf = B alors B.inverseOf = A
        op_by_id = {p.id: p for p in onto.object_properties}
        for p in list(onto.object_properties):
            if p.inverseOf:
                inv_prop = op_by_id.get(p.inverseOf)
                if inv_prop and not inv_prop.inverseOf:
                    inv_prop.inverseOf = p.id

        # Synchroniser les domaines de propriétés → marqueurs PropertyPresence dans les classes
        # (nécessaire pour que le panel "Asserted Properties" soit rempli)
        cls_map = {c.id: c for c in onto.classes}
        for prop in onto.object_properties + onto.datatype_properties:
            for domain_id in prop.domain:
                cls = cls_map.get(domain_id)
                if cls is None:
                    continue
                already = any(
                    getattr(r, 'type', None) == '_marker' and getattr(r, 'property', None) == prop.id
                    for r in cls.subClassOf
                )
                if not already:
                    cls.subClassOf.append(PropertyPresence(property=prop.id))

        # ── Named Individuals: owl:NamedIndividual + owl:Thing (OWL 1) ──
        # Build a set of all known OP ids for assertion detection
        op_ids = {p.id for p in onto.object_properties}
        dp_ids = {p.id for p in onto.datatype_properties}
        # OWL structural types that must NOT be treated as individuals
        _owl_structural = {
            OWL.Class, OWL.ObjectProperty, OWL.DatatypeProperty,
            OWL.AnnotationProperty, OWL.OntologyProperty,
            OWL.Ontology, OWL.FunctionalProperty, OWL.InverseFunctionalProperty,
            OWL.TransitiveProperty, OWL.SymmetricProperty, OWL.AsymmetricProperty,
            OWL.ReflexiveProperty, OWL.IrreflexiveProperty,
            RDFS.Class, RDF.Property,
        }
        # Collect candidate individual URIs: owl:NamedIndividual (OWL 2)
        # + owl:Thing subjects that have no structural OWL type (OWL 1 style)
        ind_candidates = set()
        for ind_uri in g.subjects(RDF.type, OWL.NamedIndividual):
            if isinstance(ind_uri, URIRef):
                ind_candidates.add(ind_uri)
        for ind_uri in g.subjects(RDF.type, OWL.Thing):
            if not isinstance(ind_uri, URIRef):
                continue
            types_of = set(g.objects(ind_uri, RDF.type))
            if not (types_of & _owl_structural):
                ind_candidates.add(ind_uri)
        # + Individus typés par une classe utilisateur (style OWL 1 / Protégé :
        #   <MyClass rdf:ID="x"/>  →  x rdf:type :MyClass, sans owl:NamedIndividual)
        class_uris = set(g.subjects(RDF.type, OWL.Class)) | set(g.subjects(RDF.type, RDFS.Class))
        for cls_uri in class_uris:
            if not isinstance(cls_uri, URIRef):
                continue
            for subj in g.subjects(RDF.type, cls_uri):
                if not isinstance(subj, URIRef):
                    continue
                types_of = set(g.objects(subj, RDF.type))
                # Exclure ce qui est lui-même une entité structurelle (classe, propriété…)
                if types_of & _owl_structural:
                    continue
                ind_candidates.add(subj)
        seen_ind = set()
        for ind_uri in ind_candidates:
            if not isinstance(ind_uri, URIRef) or str(ind_uri) in seen_ind:
                continue
            local = _lid(str(ind_uri))
            if not local:
                continue
            seen_ind.add(str(ind_uri))
            labels, comments = _collect_labels(ind_uri)
            ind = OWLIndividual(id=local)
            ind.annotations.labels   = labels
            ind.annotations.comments = comments
            ind.annotations.other    = _collect_other(ind_uri)
            # rdf:type assertions (class memberships, skip owl:NamedIndividual itself)
            for t in g.objects(ind_uri, RDF.type):
                if isinstance(t, URIRef) and t != OWL.NamedIndividual:
                    tl = _lid(str(t))
                    if tl:
                        ind.types.append(tl)
            # Object property assertions
            for pred, obj in g.predicate_objects(ind_uri):
                if not isinstance(pred, URIRef) or not isinstance(obj, URIRef):
                    continue
                pred_l = _lid(str(pred))
                if pred_l in op_ids:
                    obj_l = _lid(str(obj))
                    if obj_l:
                        ind.objectAssertions.append(
                            ObjectPropertyAssertion(property=pred_l, target=obj_l))
            # Data property assertions
            for pred, obj in g.predicate_objects(ind_uri):
                if not isinstance(pred, URIRef) or not isinstance(obj, Literal):
                    continue
                pred_l = _lid(str(pred))
                if pred_l in dp_ids:
                    dt = _lid(str(obj.datatype)) if obj.datatype else "xsd:string"
                    ind.dataAssertions.append(
                        DataPropertyAssertion(property=pred_l, value=str(obj), datatype=dt))
            # sameAs / differentFrom
            for sa in g.objects(ind_uri, OWL.sameAs):
                if isinstance(sa, URIRef):
                    sl = _lid(str(sa))
                    if sl:
                        ind.sameAs.append(sl)
            for df in g.objects(ind_uri, OWL.differentFrom):
                if isinstance(df, URIRef):
                    dl = _lid(str(df))
                    if dl:
                        ind.differentFrom.append(dl)
            onto.individuals.append(ind)

        # ── Extraction des owl:imports déclarés dans le RDF ──────
        imp_uris: list = []
        for onto_subj in g.subjects(RDF.type, OWL.Ontology):
            for imp in g.objects(onto_subj, OWL.imports):
                u = str(imp)
                if u not in imp_uris:
                    imp_uris.append(u)
        onto.imports = imp_uris

        self._ontology = onto
        # Enregistrer dans le registre et sauver le fichier
        self.register(name, host_path, uri, prefix)
        # Recopier les imports dans l'entrée de registre + instantané préfixe/nom
        entry = self._registry.get(name)
        if entry is not None:
            labels: dict = {}
            for u in imp_uris:
                for e in self._registry.values():
                    if e.uri == u or e.uri.rstrip("#/") == u.rstrip("#/"):
                        labels[u] = {"prefix": e.prefix, "name": e.name}
                        break
            # Fusionner les namespaces déclarés dans le wizard (préfixe contextuel prioritaire)
            ns_imports, ns_labels = self._imports_from_ns(ns_prefixes)
            merged = list(imp_uris) + [u for u in ns_imports if u not in imp_uris]
            labels.update(ns_labels)   # le préfixe choisi par l'utilisateur prime
            entry.imports = merged
            entry.import_labels = labels
            onto.imports = merged
            onto.import_labels = labels
            self._save_registry()
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

        onto_uri = URIRef(onto.id)
        g.add((onto_uri, RDF.type, OWL.Ontology))
        # owl:imports — ontologies importées (avec binding de préfixe pour la lisibilité)
        for imp_uri in (onto.imports or []):
            g.add((onto_uri, OWL.imports, URIRef(imp_uri)))
            lab = (onto.import_labels or {}).get(imp_uri) or {}
            pfx = lab.get("prefix")
            if pfx:
                g.bind(pfx, Namespace(imp_uri.rstrip("#/") + "#"))
        for ann in onto.annotations.labels:
            g.add((onto_uri, RDFS.label, Literal(ann.value, lang=ann.lang)))
        for ann in onto.annotations.comments:
            g.add((onto_uri, RDFS.comment, Literal(ann.value, lang=ann.lang)))

        _EXT_PREFIX_NS = {"xsd:": XSD, "owl:": OWL, "rdfs:": RDFS, "rdf:": RDF, "skos:": SKOS}

        def iri(local_id: str) -> URIRef:
            if local_id.startswith("http"):
                return URIRef(local_id)
            # Préfixes externes connus → leur espace de noms (indépendant du préfixe
            # de l'ontologie, qui peut être vide → l'ancien test startswith cassait).
            for pfx, ns in _EXT_PREFIX_NS.items():
                if local_id.startswith(pfx):
                    return ns[local_id[len(pfx):]]
            return NS[local_id]

        def dt_iri(r: str) -> URIRef:
            """Range d'une DatatypeProperty → toujours un type de données.
            Mappe les noms XSD (nus « string » ou préfixés « xsd:string ») vers
            l'espace de noms XSD pour éviter qu'ils deviennent des classes #string."""
            if r.startswith("http"):
                return URIRef(r)
            name = r.split(":", 1)[1] if r.startswith("xsd:") else r
            if name in _XSD_DATATYPES:
                return XSD[name]
            return iri(r)

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
                g.add((uri_, RDFS.range, dt_iri(r)))
            for sp in prop.subPropertyOf:
                g.add((uri_, RDFS.subPropertyOf, iri(sp)))
            if prop.functional:
                g.add((uri_, RDF.type, OWL.FunctionalProperty))

        for ind in onto.individuals:
            uri_ = iri(ind.id)
            # rdf:type des classes de l'individu
            real_types = [t for t in ind.types if t and t != 'owl:NamedIndividual']
            for t in real_types:
                g.add((uri_, RDF.type, iri(t)))
            # owl:NamedIndividual seulement si AUCUNE classe (sinon l'individu est déjà
            # déclaré via sa classe ; éviter ce triplet supprime l'affichage fantôme
            # « owl:NamedIndividual » comme classe dans Protégé).
            if not real_types:
                g.add((uri_, RDF.type, OWL.NamedIndividual))
            add_anns(uri_, ind.annotations)
            for oa in ind.objectAssertions:
                g.add((uri_, iri(oa.property), iri(oa.target)))
            for da in ind.dataAssertions:
                dt = dt_iri(da.datatype) if da.datatype else XSD.string
                g.add((uri_, iri(da.property), Literal(da.value, datatype=dt)))
            for s in ind.sameAs:
                g.add((uri_, OWL.sameAs, iri(s)))
            for d in ind.differentFrom:
                g.add((uri_, OWL.differentFrom, iri(d)))

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



# Singleton global
store = TripleStore()
