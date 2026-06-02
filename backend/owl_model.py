"""
owl_model.py — Modèles Pydantic pour les entités OWL 2
"""
from __future__ import annotations
from typing import Optional, List, Literal, Union
from pydantic import BaseModel, Field, field_validator


# ── Annotations ──────────────────────────────────────────────

class Annotation(BaseModel):
    lang: str = "fr"
    value: str


class OtherAnnotation(BaseModel):
    """Annotation OWL 2 autre que rdfs:label / rdfs:comment."""
    property: str   # ex: "rdfs:seeAlso", "owl:deprecated"
    value: str


class EntityAnnotations(BaseModel):
    labels: List[Annotation] = []
    comments: List[Annotation] = []
    other: List[OtherAnnotation] = []


# ── Restrictions OWL ─────────────────────────────────────────

class SomeValuesFrom(BaseModel):
    type: Literal["someValuesFrom"] = "someValuesFrom"
    property: str
    filler: Optional[str] = None  # None = restriction incomplète (en cours de définition)


class AllValuesFrom(BaseModel):
    type: Literal["allValuesFrom"] = "allValuesFrom"
    property: str
    filler: Optional[str] = None


class HasValue(BaseModel):
    type: Literal["hasValue"] = "hasValue"
    property: str
    value: Optional[str] = None  # None = restriction incomplète


class ExactCardinality(BaseModel):
    type: Literal["exactCardinality"] = "exactCardinality"
    property: str
    cardinality: int
    filler: Optional[str] = None


class MinCardinality(BaseModel):
    type: Literal["minCardinality"] = "minCardinality"
    property: str
    cardinality: int
    filler: Optional[str] = None


class MaxCardinality(BaseModel):
    type: Literal["maxCardinality"] = "maxCardinality"
    property: str
    cardinality: int
    filler: Optional[str] = None


class PropertyPresence(BaseModel):
    """Marqueur de présence : propriété ajoutée au panel sans restriction définie.
    Stocké en JSON, jamais sérialisé en RDF."""
    type: Literal["_marker"] = "_marker"
    property: str


Restriction = Union[
    SomeValuesFrom, AllValuesFrom, HasValue,
    ExactCardinality, MinCardinality, MaxCardinality,
    PropertyPresence
]


# ── Expressions de classe ─────────────────────────────────────

class UnionOf(BaseModel):
    type: Literal["unionOf"] = "unionOf"
    operands: List[str]  # IRIs de classes


class IntersectionOf(BaseModel):
    type: Literal["intersectionOf"] = "intersectionOf"
    operands: List[str]


class ComplementOf(BaseModel):
    type: Literal["complementOf"] = "complementOf"
    operand: str


ClassExpression = Union[str, UnionOf, IntersectionOf, ComplementOf, Restriction]


# ── Classe OWL ───────────────────────────────────────────────

class OWLClass(BaseModel):
    id: str                                    # IRI local (ex: "Person")
    annotations: EntityAnnotations = Field(default_factory=EntityAnnotations)
    subClassOf: List[ClassExpression] = []     # super-classes ou restrictions
    equivalentClass: List[ClassExpression] = []
    disjointWith: List[str] = []               # IRIs de classes disjointes


# ── Propriétés OWL ───────────────────────────────────────────

class ObjectPropertyCharacteristics(BaseModel):
    functional: bool = False
    inverseFunctional: bool = False
    transitive: bool = False
    symmetric: bool = False
    asymmetric: bool = False
    reflexive: bool = False
    irreflexive: bool = False


class PropertyChainAxiom(BaseModel):
    chain: List[str]  # liste ordonnée d'IRIs de propriétés


class OWLObjectProperty(BaseModel):
    id: str
    annotations: EntityAnnotations = Field(default_factory=EntityAnnotations)
    domain: List[str] = []                     # IRIs de classes
    range: List[str] = []                      # IRIs de classes
    subPropertyOf: List[str] = []
    inverseOf: Optional[str] = None
    characteristics: ObjectPropertyCharacteristics = Field(
        default_factory=ObjectPropertyCharacteristics
    )
    propertyChainAxiom: List[PropertyChainAxiom] = []


XSD_TYPES = [
    "xsd:string", "xsd:integer", "xsd:decimal", "xsd:float", "xsd:double",
    "xsd:boolean", "xsd:date", "xsd:dateTime", "xsd:duration",
    "xsd:anyURI", "xsd:nonNegativeInteger", "xsd:positiveInteger",
]


class OWLDatatypeProperty(BaseModel):
    id: str
    annotations: EntityAnnotations = Field(default_factory=EntityAnnotations)
    domain: List[str] = []
    range: List[str] = []                      # types XSD
    subPropertyOf: List[str] = []
    functional: bool = False


# ── Individus OWL ────────────────────────────────────────────

class ObjectPropertyAssertion(BaseModel):
    property: str
    target: str   # IRI individu


class DataPropertyAssertion(BaseModel):
    property: str
    value: str
    datatype: str = "xsd:string"


class OWLIndividual(BaseModel):
    id: str
    annotations: EntityAnnotations = Field(default_factory=EntityAnnotations)
    types: List[str] = []                      # IRIs de classes
    objectAssertions: List[ObjectPropertyAssertion] = []
    dataAssertions: List[DataPropertyAssertion] = []
    sameAs: List[str] = []
    differentFrom: List[str] = []



# ── SWORD — SWRL + Negation As Failure ───────────────────────

class SWRLTypeAtom(BaseModel):
    """?var is a ClassName"""
    type: Literal["type_atom"] = "type_atom"
    var: str = ""
    class_id: str = ""


class SWRLPropertyAtom(BaseModel):
    """?subject property ?object  (?_ = wildcard/don't-care)"""
    type: Literal["property_atom"] = "property_atom"
    subject: str = ""
    property_id: str = ""
    object: str = "?_"


class SWRLEqualityAtom(BaseModel):
    """?var = value"""
    type: Literal["equality_atom"] = "equality_atom"
    var: str = ""
    value: str = ""


class SWRLNAFBlock(BaseModel):
    """NAF(atoms...)  — Negation As Failure block"""
    type: Literal["naf_block"] = "naf_block"
    atoms: List["SWRLBodyAtom"] = []


class SWRLConditional(BaseModel):
    """(if conditions then consequents)  — conditional consequent in head"""
    type: Literal["conditional"] = "conditional"
    condition:  List["SWRLBodyAtom"] = Field(default_factory=lambda: [SWRLEqualityAtom()])
    consequent: List["SWRLBodyAtom"] = Field(default_factory=lambda: [SWRLTypeAtom()])

    @field_validator('condition', 'consequent', mode='before')
    @classmethod
    def normalize_to_list(cls, v):
        if isinstance(v, dict):
            return [v]
        return v


SWRLBodyAtom = Union[
    SWRLTypeAtom, SWRLPropertyAtom, SWRLEqualityAtom, SWRLNAFBlock
]

SWRLHeadAtom = Union[
    SWRLTypeAtom, SWRLPropertyAtom, SWRLEqualityAtom,
    SWRLNAFBlock, SWRLConditional
]

SWRLNAFBlock.model_rebuild()
SWRLConditional.model_rebuild()


class SWRLRule(BaseModel):
    id: str
    label: str = ""
    comment: str = ""
    body: List[SWRLBodyAtom] = []
    head: List[SWRLHeadAtom] = []
    enabled: bool = True


# ── Ontologie complète ────────────────────────────────────────

class OWLOntology(BaseModel):
    id: str                    # IRI base ex: "https://example.org/my-ontology"
    name: str = ""             # Nom lisible choisi par l'utilisateur
    prefix: str = "onto"       # préfixe local
    annotations: EntityAnnotations = Field(default_factory=EntityAnnotations)
    classes: List[OWLClass] = []
    object_properties: List[OWLObjectProperty] = []
    datatype_properties: List[OWLDatatypeProperty] = []
    individuals: List[OWLIndividual] = []
    swrl_rules: List[SWRLRule] = []


# ── Résultats d'inférence ─────────────────────────────────────

class InheritedRestriction(BaseModel):
    class_id: str
    restriction: dict
    inherited_from: str


class InferredType(BaseModel):
    individual_id: str
    inferred_type: str
    reason: str


class OWLViolation(BaseModel):
    severity: Literal["error", "warning"]
    entity: str
    message: str



class InferredInverseProperty(BaseModel):
    property_id: str
    inverse_of: str
    reason: str


class InferredInverseRestriction(BaseModel):
    """
    Si C ⊑ ∃prop.D et prop inverseOf invProp,
    on infère : D ⊑ ∃invProp.C
    """
    class_id: str           # D — classe qui reçoit la restriction inférée
    restriction: dict       # { type, property: invProp, filler: C }
    source_class: str       # C — classe source de la restriction originale
    source_prop: str        # prop original
    inverse_prop: str       # invProp inféré
    reason: str


class InferenceResult(BaseModel):
    subclass_closure: dict              # class_id → [all ancestor class_ids]
    inherited_restrictions: List[InheritedRestriction]
    inferred_types: List[InferredType]
    symmetric_assertions: List[dict]
    transitive_assertions: List[dict]
    chain_assertions: List[dict]
    violations: List[OWLViolation]
    inferred_inverse_properties: List[InferredInverseProperty] = []
    inferred_inverse_restrictions: List[InferredInverseRestriction] = []
