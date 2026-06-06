"""
main.py — FastAPI application — OWL/SWORD Editor API
"""
from __future__ import annotations
import uuid
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel as PydanticModel

from owl_model import (
    OWLOntology, OWLClass, OWLObjectProperty, OWLDatatypeProperty,
    OWLAnnotationProperty,
    OWLIndividual, SWRLRule, InferenceResult, PropertyPresence,
    ObjectPropertyAssertion,
)
from triple_store import store
from inference_engine import InferenceEngine
from serializers import export_owl_xml, export_turtle, export_jsonld

logger = logging.getLogger("owl_editor")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Restaure automatiquement la dernière ontologie utilisée au démarrage."""
    onto = store.load_last()
    if onto:
        logger.info(f"✅ Auto-chargement de l'ontologie : {onto.id}")
    else:
        logger.info("ℹ️  Aucune ontologie précédente à restaurer.")
    yield


app = FastAPI(
    title="OWL/SWORD Editor API",
    description="API REST pour créer et éditer des ontologies OWL 2 avec règles SWORD",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers ──────────────────────────────────────────────────

def _collect_class_descendants(onto: OWLOntology, class_id: str) -> set:
    """Retourne l'ensemble des IDs de toutes les classes descendantes (récursivement)."""
    descendants: set = set()
    to_visit = {class_id}
    while to_visit:
        current = to_visit.pop()
        for cls in onto.classes:
            parents = [s for s in (cls.subClassOf or []) if isinstance(s, str)]
            if current in parents and cls.id not in descendants:
                descendants.add(cls.id)
                to_visit.add(cls.id)
    return descendants


def _rename_swrl_atom(atom, old_id: str, new_id: str, kind: str) -> None:
    """Propage un renommage dans un atome SWRL (récursif pour NAFBlock et Conditional)."""
    if kind == 'class' and getattr(atom, 'class_id', None) == old_id:
        atom.class_id = new_id
    if kind == 'property' and getattr(atom, 'property_id', None) == old_id:
        atom.property_id = new_id
    for a in getattr(atom, 'atoms', []):
        _rename_swrl_atom(a, old_id, new_id, kind)
    for a in getattr(atom, 'condition', []):
        _rename_swrl_atom(a, old_id, new_id, kind)
    for a in getattr(atom, 'consequent', []):
        _rename_swrl_atom(a, old_id, new_id, kind)


import re as _re

def _validate_ncname(id_str: str, label: str = "ID") -> None:
    """Raise 422 if id_str is not a valid OWL local name (XML NCName)."""
    if not id_str or not id_str.strip():
        raise HTTPException(422, f"{label} is required.")
    if _re.match(r'^[0-9]', id_str):
        raise HTTPException(422, f"{label} '{id_str}' cannot start with a digit (OWL NCName rule).")


def _cascade_rename_class(onto: OWLOntology, old_id: str, new_id: str) -> None:
    """Propage le renommage d'une classe à toutes ses références dans l'ontologie."""

    def rename_expr(expr):
        if isinstance(expr, str):
            return new_id if expr == old_id else expr
        # Restrictions avec filler (SomeValuesFrom, AllValuesFrom, cardinalités)
        if hasattr(expr, 'filler') and expr.filler == old_id:
            expr.filler = new_id
        # Expressions booléennes (UnionOf, IntersectionOf) avec opérands
        if hasattr(expr, 'operands'):
            expr.operands = [new_id if op == old_id else op for op in expr.operands]
        # ComplementOf
        if hasattr(expr, 'operand') and expr.operand == old_id:
            expr.operand = new_id
        return expr

    for cls in onto.classes:
        cls.subClassOf      = [rename_expr(e) for e in cls.subClassOf]
        cls.equivalentClass = [rename_expr(e) for e in cls.equivalentClass]
        cls.disjointWith    = [new_id if s == old_id else s for s in cls.disjointWith]

    for prop in onto.object_properties:
        prop.domain = [new_id if d == old_id else d for d in prop.domain]
        prop.range  = [new_id if r == old_id else r for r in prop.range]

    for prop in onto.datatype_properties:
        prop.domain = [new_id if d == old_id else d for d in prop.domain]

    for ind in onto.individuals:
        ind.types = [new_id if t == old_id else t for t in ind.types]

    for rule in onto.swrl_rules:
        for atom in list(rule.body) + list(rule.head):
            _rename_swrl_atom(atom, old_id, new_id, 'class')


def _cascade_rename_property(onto: OWLOntology, old_id: str, new_id: str) -> None:
    """Propage le renommage d'une propriété à toutes ses références."""

    # Restrictions dans les classes
    def rename_in_expr(expr):
        if hasattr(expr, 'property') and expr.property == old_id:
            expr.property = new_id
        return expr

    for cls in onto.classes:
        cls.subClassOf      = [rename_in_expr(e) for e in cls.subClassOf]
        cls.equivalentClass = [rename_in_expr(e) for e in cls.equivalentClass]

    for prop in onto.object_properties:
        prop.subPropertyOf = [new_id if s == old_id else s for s in prop.subPropertyOf]
        if prop.inverseOf == old_id:
            prop.inverseOf = new_id
        for chain in prop.propertyChainAxiom:
            chain.chain = [new_id if c == old_id else c for c in chain.chain]

    for prop in onto.datatype_properties:
        prop.subPropertyOf = [new_id if s == old_id else s for s in prop.subPropertyOf]

    for ind in onto.individuals:
        for a in ind.objectAssertions:
            if a.property == old_id:
                a.property = new_id
        for a in ind.dataAssertions:
            if a.property == old_id:
                a.property = new_id

    for rule in onto.swrl_rules:
        for atom in list(rule.body) + list(rule.head):
            _rename_swrl_atom(atom, old_id, new_id, 'property')


def _sync_domain_markers(onto: OWLOntology, prop_id: str,
                         old_domain: set, new_domain: set) -> None:
    """Synchronise les marqueurs PropertyPresence dans les classes
    lorsque le domain d'une propriété change.
    - classes retirées du domain → marqueur supprimé
    - classes ajoutées au domain → marqueur ajouté (s'il n'existe pas déjà)
    """
    for cls_id in old_domain - new_domain:
        cls_obj = next((c for c in onto.classes if c.id == cls_id), None)
        if cls_obj:
            cls_obj.subClassOf = [
                r for r in cls_obj.subClassOf
                if not (hasattr(r, 'type') and r.type == '_marker'
                        and getattr(r, 'property', None) == prop_id)
            ]
    for cls_id in new_domain - old_domain:
        cls_obj = next((c for c in onto.classes if c.id == cls_id), None)
        if cls_obj:
            already = any(
                hasattr(r, 'type') and r.type == '_marker'
                and getattr(r, 'property', None) == prop_id
                for r in cls_obj.subClassOf
            )
            if not already:
                cls_obj.subClassOf.append(PropertyPresence(property=prop_id))


def require_onto():
    onto = store.get()
    if not onto:
        raise HTTPException(404, "Aucune ontologie chargée. Créez ou importez une ontologie d'abord.")
    return onto


def run_inferences() -> InferenceResult:
    onto = require_onto()
    engine = InferenceEngine(onto)
    return engine.run()


# ════════════════════════════════════════════════════════════════
# REGISTRE D'ONTOLOGIES
# ════════════════════════════════════════════════════════════════

class RegisterRequest(PydanticModel):
    name: str
    path: str
    uri: str
    prefix: str = "onto"

class UpdateEntryRequest(PydanticModel):
    name: str
    path: str
    uri: str
    prefix: str = "onto"


@app.get("/api/ontologies", tags=["Ontologie"])
def list_ontologies():
    """Retourne toutes les ontologies du registre."""
    return store.list_registry()


@app.post("/api/ontologies/register", tags=["Ontologie"], status_code=201)
def register_ontology(req: RegisterRequest):
    """Enregistre une nouvelle ontologie (from scratch) dans le registre."""
    entries = store.list_registry()
    if any(e["name"] == req.name for e in entries):
        raise HTTPException(409, f"Une ontologie nommée '{req.name}' existe déjà.")
    entry = store.register(req.name, req.path, req.uri, req.prefix)
    return entry.to_dict()


@app.post("/api/ontologies/register-json", tags=["Ontologie"], status_code=201)
def register_json(path: str = Query(...), name: str = Query(None),
                  uri: str = Query(None), prefix: str = Query(None)):
    """Register an existing .json ontology file into the registry (Load workflow)."""
    from pathlib import Path as FP
    import json as _json
    container_path = host_to_container(path)
    p = FP(container_path)
    if not p.exists():
        raise HTTPException(404, f"File not found: {path}")
    try:
        data = _json.loads(p.read_text(encoding="utf-8"))
    except Exception as e:
        raise HTTPException(400, f"Cannot read JSON: {e}")
    resolved_name   = name   or data.get("name") or p.stem
    resolved_uri    = uri    or data.get("id", "")
    resolved_prefix = prefix or data.get("prefix", "onto")
    entries = store.list_registry()
    if any(e["name"] == resolved_name for e in entries):
        raise HTTPException(409, f"An ontology named '{resolved_name}' already exists in the registry.")
    entry = store.register(resolved_name, path, resolved_uri, resolved_prefix)
    return entry.to_dict()


@app.put("/api/ontologies/{name}", tags=["Ontologie"])
def update_ontology_entry(name: str, req: UpdateEntryRequest):
    """Modifie les métadonnées d'une entrée du registre."""
    entry = store.update_entry(name, req.name, req.path, req.uri, req.prefix)
    if not entry:
        raise HTTPException(404, f"Ontologie '{name}' introuvable dans le registre.")
    return entry.to_dict()


@app.delete("/api/ontologies/{name}", tags=["Ontologie"])
def unregister_ontology(name: str):
    """Retire une ontologie du registre (ne supprime pas le fichier)."""
    ok = store.unregister(name)
    if not ok:
        raise HTTPException(404, f"Ontologie '{name}' introuvable dans le registre.")
    return {"unregistered": name}


@app.post("/api/ontologies/{name}/connect", tags=["Ontologie"])
def connect_ontology(name: str):
    """Connecte une ontologie (la rend active)."""
    onto = store.connect(name)
    if onto is None:
        raise HTTPException(404, f"Ontologie '{name}' introuvable dans le registre.")
    return onto


@app.post("/api/ontologies/disconnect", tags=["Ontologie"])
def disconnect_ontology():
    """Déconnecte l'ontologie active."""
    store.disconnect()
    return {"status": "disconnected"}


@app.get("/api/ontologies/current", tags=["Ontologie"])
def get_current_ontology():
    return require_onto()


@app.put("/api/ontologies/current", tags=["Ontologie"])
def update_ontology_meta(onto: OWLOntology):
    store.set(onto)
    return onto


@app.put("/api/display-rules", tags=["Ontologie"])
def update_display_rules(rules: dict):
    onto = require_onto()
    onto.display_rules = rules
    store.save()
    return rules


# ── Peek (read prefix/URI without importing) ─────────────────

@app.get("/api/ontologies/peek", tags=["Ontologie"])
def peek_ontology(path: str = Query(..., description="Host path to .owl / .ttl / .json")):
    """Read name, prefix and base URI from an ontology file without modifying state."""
    from pathlib import Path as FP
    import json as _json
    container_path = host_to_container(path)
    p = FP(container_path)
    if not p.exists():
        raise HTTPException(404, f"File not found: {path}")
    name = p.stem  # filename without extension
    fname = p.name.lower()
    try:
        if fname.endswith(".json"):
            data = _json.loads(p.read_text(encoding="utf-8"))
            return {
                "name":   data.get("name") or name,
                "prefix": data.get("prefix", "onto"),
                "uri":    data.get("id", ""),
                "path":   path,
            }
        # OWL/XML or Turtle — parse with rdflib
        import rdflib
        from rdflib.namespace import OWL, RDF
        g = rdflib.Graph()
        fmt = "turtle" if fname.endswith(".ttl") else "xml"
        g.parse(data=p.read_bytes(), format=fmt)
        # Base URI: look for owl:Ontology declaration
        uri = ""
        for s in g.subjects(RDF.type, OWL.Ontology):
            uri = str(s)
            break
        # Prefix: look for declared namespace bindings (skip common ones)
        SKIP = {"owl","rdf","rdfs","xsd","xml","skos","dc","dcterms",""}
        prefix = "onto"
        for pfx, ns in g.namespaces():
            if pfx not in SKIP and str(pfx):
                prefix = str(pfx)
                break
        return {"name": name, "prefix": prefix, "uri": uri, "path": path}
    except Exception as e:
        raise HTTPException(400, f"Cannot read file: {e}")


# ── Import ───────────────────────────────────────────────────

@app.post("/api/ontologies/import", tags=["Ontologie"])
async def import_ontology(
    file: UploadFile = File(...),
    name: str = Query(..., description="Nom de l'ontologie"),
    path: str = Query(..., description="Chemin de sauvegarde (hôte)"),
    uri: str  = Query(..., description="IRI de base de l'ontologie"),
    prefix: str = Query("onto"),
):
    content = await file.read()
    fname = file.filename or ""
    if fname.endswith(".ttl"):
        fmt = "turtle"
    elif fname.endswith(".owl") or fname.endswith(".xml") or fname.endswith(".rdf"):
        fmt = "xml"
    elif fname.endswith(".jsonld") or fname.endswith(".json"):
        fmt = "json-ld"
    else:
        fmt = "xml"
    try:
        onto = store.import_from_rdf(content, fmt, name, path, uri, prefix)
        return onto
    except Exception as e:
        raise HTTPException(400, f"Erreur d'import : {e}")


# ── Import depuis chemin filesystem ─────────────────────────

class ImportFromPathRequest(PydanticModel):
    name: str
    owl_path: str   # chemin hôte du fichier OWL/RDF
    save_path: str  # chemin hôte de sauvegarde .json
    uri: str
    prefix: str = "onto"

@app.post("/api/ontologies/import-from-path", tags=["Ontologie"])
def import_from_path(req: ImportFromPathRequest):
    """Importe une ontologie OWL/RDF depuis un chemin filesystem (sans upload)."""
    from pathlib import Path as FP
    container_owl = host_to_container(req.owl_path)
    p = FP(container_owl)
    if not p.exists():
        raise HTTPException(404, f"Fichier introuvable : {req.owl_path}")
    content = p.read_bytes()
    name = p.name.lower()
    if name.endswith(".ttl"):
        fmt = "turtle"
    elif name.endswith(".jsonld") or name.endswith(".json"):
        fmt = "json-ld"
    else:
        fmt = "xml"
    try:
        onto = store.import_from_rdf(content, fmt, req.name, req.save_path, req.uri, req.prefix)
        return onto
    except Exception as e:
        raise HTTPException(400, f"Erreur d'import : {e}")


# ── Export ───────────────────────────────────────────────────

@app.get("/api/ontologies/{name}/export", tags=["Ontologie"])
def export_ontology_by_name(name: str, fmt: str = Query("owl", enum=["owl", "ttl", "jsonld", "swrl", "sword"])):
    """Exporte une ontologie enregistrée par son nom, sans modifier l'état connecté."""
    current = store.get()
    entry = store._registry.get(name)
    if not entry:
        raise HTTPException(404, f"Ontologie '{name}' introuvable dans le registre.")
    # Utiliser l'ontologie en mémoire si c'est celle connectée, sinon charger depuis le fichier
    if entry.connected and current:
        target = current
    else:
        target = store._load_from_entry(entry)
        if not target:
            raise HTTPException(404, f"Fichier introuvable pour '{name}'.")
    # Export SWRL JSON
    if fmt == "swrl":
        import json as _json
        rules = [r.model_dump() for r in (target.swrl_rules or [])]
        data  = _json.dumps(rules, indent=2, ensure_ascii=False).encode("utf-8")
        fname = f"{name}_rules.swrl.json"
        return Response(content=data, media_type="application/json",
                        headers={"Content-Disposition": f'attachment; filename="{fname}"'})
    # Export SWORD (format textuel)
    if fmt == "sword":
        from sword_serializer import export_sword
        data  = export_sword(target)
        fname = f"{name}_rules.sword"
        return Response(content=data, media_type="text/plain; charset=utf-8",
                        headers={"Content-Disposition": f'attachment; filename="{fname}"'})
    # Swap temporaire pour utiliser les serialiseurs existants
    store._ontology = target
    try:
        if fmt == "owl":
            data, media, ext = export_owl_xml(store), "application/rdf+xml", "owl"
        elif fmt == "ttl":
            data, media, ext = export_turtle(store), "text/turtle", "ttl"
        else:
            data, media, ext = export_jsonld(store), "application/ld+json", "jsonld"
    finally:
        store._ontology = current  # restaurer l'état
    fname = f"{name}.{ext}"
    return Response(content=data, media_type=media,
                    headers={"Content-Disposition": f'attachment; filename="{fname}"'})


@app.get("/api/ontologies/export", tags=["Ontologie"])
def export_ontology(fmt: str = Query("owl", enum=["owl", "ttl", "jsonld"])):
    require_onto()
    if fmt == "owl":
        data = export_owl_xml(store)
        media = "application/rdf+xml"
        ext = "owl"
    elif fmt == "ttl":
        data = export_turtle(store)
        media = "text/turtle"
        ext = "ttl"
    else:
        data = export_jsonld(store)
        media = "application/ld+json"
        ext = "jsonld"
    return Response(
        content=data, media_type=media,
        headers={"Content-Disposition": f'attachment; filename="ontology.{ext}"'}
    )


# ════════════════════════════════════════════════════════════════
# UNDO / REDO — restore snapshot
# ════════════════════════════════════════════════════════════════

class OntologySnapshot(PydanticModel):
    classes:               list = []
    object_properties:     list = []
    datatype_properties:   list = []
    individuals:           list = []
    swrl_rules:            list = []

@app.post("/api/snapshot/restore", tags=["Undo"])
def restore_snapshot(snap: OntologySnapshot):
    onto = require_onto()
    onto.classes             = [OWLClass(**c)             for c in snap.classes]
    onto.object_properties   = [OWLObjectProperty(**p)   for p in snap.object_properties]
    onto.datatype_properties = [OWLDatatypeProperty(**p) for p in snap.datatype_properties]
    onto.individuals         = [OWLIndividual(**i)        for i in snap.individuals]
    onto.swrl_rules          = [SWRLRule(**r)             for r in snap.swrl_rules]
    store.save()
    return {"ok": True}


# ════════════════════════════════════════════════════════════════
# CLASSES
# ════════════════════════════════════════════════════════════════

@app.get("/api/classes", tags=["Classes"])
def list_classes():
    return require_onto().classes


@app.post("/api/classes", tags=["Classes"], status_code=201)
def create_class(cls: OWLClass):
    onto = require_onto()
    _validate_ncname(cls.id, "Class ID")
    if any(c.id == cls.id for c in onto.classes):
        raise HTTPException(409, f"Classe '{cls.id}' already exists")
    onto.classes.append(cls)
    # Propager la symétrie disjointWith aux classes déjà existantes
    for other in onto.classes:
        if other.id != cls.id and other.id in cls.disjointWith:
            if cls.id not in other.disjointWith:
                other.disjointWith.append(cls.id)
    # Propager la symétrie equivalentClass aux classes déjà existantes
    for other in onto.classes:
        if other.id != cls.id and other.id in cls.equivalentClass:
            if cls.id not in other.equivalentClass:
                other.equivalentClass.append(cls.id)
    store.save()
    return cls


@app.get("/api/classes/{class_id}", tags=["Classes"])
def get_class(class_id: str):
    onto = require_onto()
    cls = next((c for c in onto.classes if c.id == class_id), None)
    if not cls:
        raise HTTPException(404, f"Classe '{class_id}' not found")
    return cls


@app.put("/api/classes/{class_id}", tags=["Classes"])
def update_class(class_id: str, cls: OWLClass):
    onto = require_onto()
    _validate_ncname(cls.id, "Class ID")
    idx = next((i for i, c in enumerate(onto.classes) if c.id == class_id), None)
    if idx is None:
        raise HTTPException(404, f"Classe '{class_id}' not found")
    if cls.id != class_id:
        # Renommage demandé — vérifier l'absence de conflit puis propager
        if any(c.id == cls.id for i2, c in enumerate(onto.classes) if i2 != idx):
            raise HTTPException(409, f"Classe '{cls.id}' already exists")
        _cascade_rename_class(onto, class_id, cls.id)
    # ── Sync _marker → domain des propriétés ────────────────────
    # Après le cascade-rename, les références utilisent déjà cls.id
    def _markers(subclassof):
        return {r.property for r in subclassof
                if hasattr(r, 'type') and r.type == '_marker'}
    old_markers = _markers(onto.classes[idx].subClassOf)
    new_markers = _markers(cls.subClassOf)
    all_props = onto.object_properties + onto.datatype_properties
    # Propriétés retirées des Asserted Properties → retirer cls.id de leur domain
    for prop_id in old_markers - new_markers:
        p = next((q for q in all_props if q.id == prop_id), None)
        if p and cls.id in p.domain:
            p.domain = [d for d in p.domain if d != cls.id]
    # Propriétés ajoutées aux Asserted Properties → ajouter cls.id à leur domain
    for prop_id in new_markers - old_markers:
        p = next((q for q in all_props if q.id == prop_id), None)
        if p and cls.id not in p.domain:
            p.domain.append(cls.id)
    # ── Sync symétrie equivalentClass ───────────────────────────
    old_equiv = set(e for e in onto.classes[idx].equivalentClass if isinstance(e, str))
    new_equiv = set(e for e in cls.equivalentClass if isinstance(e, str))
    eq_added   = new_equiv - old_equiv
    eq_removed = old_equiv - new_equiv
    for other in onto.classes:
        if other.id == cls.id:
            continue
        if other.id in eq_added and cls.id not in other.equivalentClass:
            other.equivalentClass.append(cls.id)
        if other.id in eq_removed and cls.id in other.equivalentClass:
            other.equivalentClass = [e for e in other.equivalentClass if e != cls.id]
    # ── Sync symétrie disjointWith ───────────────────────────────
    old_disj = set(onto.classes[idx].disjointWith)
    new_disj = set(cls.disjointWith)
    added   = new_disj - old_disj
    removed = old_disj - new_disj
    for other in onto.classes:
        if other.id == cls.id:
            continue
        if other.id in added and cls.id not in other.disjointWith:
            other.disjointWith.append(cls.id)
        if other.id in removed and cls.id in other.disjointWith:
            other.disjointWith = [d for d in other.disjointWith if d != cls.id]
    onto.classes[idx] = cls
    store.save()
    return cls


@app.delete("/api/classes/{class_id}", tags=["Classes"])
def delete_class(class_id: str):
    onto = require_onto()
    before = len(onto.classes)
    # Suppression en cascade : classe + tous ses descendants
    to_delete = _collect_class_descendants(onto, class_id)
    to_delete.add(class_id)
    # ── Bloquer si des individus appartiennent à ces classes ─────
    blocking = []
    for ind in onto.individuals:
        used = [c for c in to_delete if c in (ind.types or [])]
        if used:
            blocking.append(f"'{ind.id}' (type : {', '.join(used)})")
    if blocking:
        raise HTTPException(
            409,
            f"Cannot delete : {len(blocking)} individu(s) use this class — "
            + ", ".join(blocking[:3])
            + (" …" if len(blocking) > 3 else "")
        )
    # Retirer la classe des domains des propriétés
    for cls_id in to_delete:
        for p in onto.object_properties + onto.datatype_properties:
            if cls_id in p.domain:
                p.domain = [d for d in p.domain if d != cls_id]
    onto.classes = [c for c in onto.classes if c.id not in to_delete]
    if len(onto.classes) == before:
        raise HTTPException(404, f"Classe '{class_id}' not found")
    store.save()
    return {"deleted": sorted(to_delete)}


# ════════════════════════════════════════════════════════════════
# OBJECT PROPERTIES
# ════════════════════════════════════════════════════════════════

@app.get("/api/object-properties", tags=["Propriétés"])
def list_object_properties():
    return require_onto().object_properties


@app.post("/api/object-properties", tags=["Propriétés"], status_code=201)
def create_object_property(prop: OWLObjectProperty):
    onto = require_onto()
    _validate_ncname(prop.id, "Property ID")
    if any(p.id == prop.id for p in onto.object_properties):
        raise HTTPException(409, f"ObjectProperty '{prop.id}' already exists")
    onto.object_properties.append(prop)
    # ── Symétrie owl:inverseOf ───────────────────────────────────
    if prop.inverseOf:
        inv = next((p for p in onto.object_properties if p.id == prop.inverseOf), None)
        if inv:
            inv.inverseOf = prop.id
    # ── Marqueurs domain → classes ───────────────────────────────
    _sync_domain_markers(onto, prop.id, set(), set(prop.domain or []))
    store.save()
    return prop


@app.get("/api/object-properties/{prop_id}", tags=["Propriétés"])
def get_object_property(prop_id: str):
    onto = require_onto()
    prop = next((p for p in onto.object_properties if p.id == prop_id), None)
    if not prop:
        raise HTTPException(404, f"ObjectProperty '{prop_id}' not found")
    return prop


@app.put("/api/object-properties/{prop_id}", tags=["Propriétés"])
def update_object_property(prop_id: str, prop: OWLObjectProperty):
    onto = require_onto()
    _validate_ncname(prop.id, "Property ID")
    idx = next((i for i, p in enumerate(onto.object_properties) if p.id == prop_id), None)
    if idx is None:
        raise HTTPException(404, f"ObjectProperty '{prop_id}' not found")
    if prop.id != prop_id:
        if any(p.id == prop.id for i2, p in enumerate(onto.object_properties) if i2 != idx):
            raise HTTPException(409, f"ObjectProperty '{prop.id}' already exists")
        _cascade_rename_property(onto, prop_id, prop.id)
    # ── Symétrie owl:inverseOf ───────────────────────────────────
    old_inverse = onto.object_properties[idx].inverseOf
    new_inverse = prop.inverseOf
    if old_inverse and old_inverse != new_inverse:
        old_inv_prop = next((p for p in onto.object_properties if p.id == old_inverse), None)
        if old_inv_prop and old_inv_prop.inverseOf == prop.id:
            old_inv_prop.inverseOf = None
    if new_inverse:
        new_inv_prop = next((p for p in onto.object_properties if p.id == new_inverse), None)
        if new_inv_prop:
            new_inv_prop.inverseOf = prop.id
    # ── Marqueurs domain → classes ───────────────────────────────
    _sync_domain_markers(onto, prop.id,
                         set(onto.object_properties[idx].domain or []),
                         set(prop.domain or []))
    onto.object_properties[idx] = prop
    store.save()
    return prop


@app.delete("/api/object-properties/{prop_id}", tags=["Propriétés"])
def delete_object_property(prop_id: str):
    onto = require_onto()
    prop = next((p for p in onto.object_properties if p.id == prop_id), None)
    if not prop:
        raise HTTPException(404, f"ObjectProperty '{prop_id}' not found")
    # ── Symétrie owl:inverseOf ───────────────────────────────────
    if prop.inverseOf:
        inv = next((p for p in onto.object_properties if p.id == prop.inverseOf), None)
        if inv and inv.inverseOf == prop_id:
            inv.inverseOf = None
    # ── Marqueurs domain → classes ───────────────────────────────
    _sync_domain_markers(onto, prop_id, set(prop.domain or []), set())
    onto.object_properties = [p for p in onto.object_properties if p.id != prop_id]
    store.save()
    return {"deleted": prop_id}


# ════════════════════════════════════════════════════════════════
# DATATYPE PROPERTIES
# ════════════════════════════════════════════════════════════════

@app.get("/api/datatype-properties", tags=["Propriétés"])
def list_datatype_properties():
    return require_onto().datatype_properties


@app.post("/api/datatype-properties", tags=["Propriétés"], status_code=201)
def create_datatype_property(prop: OWLDatatypeProperty):
    onto = require_onto()
    _validate_ncname(prop.id, "Property ID")
    if any(p.id == prop.id for p in onto.datatype_properties):
        raise HTTPException(409, f"DatatypeProperty '{prop.id}' already exists")
    onto.datatype_properties.append(prop)
    # ── Marqueurs domain → classes ───────────────────────────────
    _sync_domain_markers(onto, prop.id, set(), set(prop.domain or []))
    store.save()
    return prop


@app.get("/api/datatype-properties/{prop_id}", tags=["Propriétés"])
def get_datatype_property(prop_id: str):
    onto = require_onto()
    prop = next((p for p in onto.datatype_properties if p.id == prop_id), None)
    if not prop:
        raise HTTPException(404, f"DatatypeProperty '{prop_id}' not found")
    return prop


@app.put("/api/datatype-properties/{prop_id}", tags=["Propriétés"])
def update_datatype_property(prop_id: str, prop: OWLDatatypeProperty):
    onto = require_onto()
    _validate_ncname(prop.id, "Property ID")
    idx = next((i for i, p in enumerate(onto.datatype_properties) if p.id == prop_id), None)
    if idx is None:
        raise HTTPException(404, f"DatatypeProperty '{prop_id}' not found")
    if prop.id != prop_id:
        if any(p.id == prop.id for i2, p in enumerate(onto.datatype_properties) if i2 != idx):
            raise HTTPException(409, f"DatatypeProperty '{prop.id}' already exists")
        _cascade_rename_property(onto, prop_id, prop.id)
    # ── Marqueurs domain → classes ───────────────────────────────
    _sync_domain_markers(onto, prop.id,
                         set(onto.datatype_properties[idx].domain or []),
                         set(prop.domain or []))
    onto.datatype_properties[idx] = prop
    store.save()
    return prop


@app.delete("/api/datatype-properties/{prop_id}", tags=["Propriétés"])
def delete_datatype_property(prop_id: str):
    onto = require_onto()
    prop = next((p for p in onto.datatype_properties if p.id == prop_id), None)
    if not prop:
        raise HTTPException(404, f"DatatypeProperty '{prop_id}' not found")
    # ── Marqueurs domain → classes ───────────────────────────────
    _sync_domain_markers(onto, prop_id, set(prop.domain or []), set())
    onto.datatype_properties = [p for p in onto.datatype_properties if p.id != prop_id]
    store.save()
    return {"deleted": prop_id}


# ════════════════════════════════════════════════════════════════
# ANNOTATION PROPERTIES
# ════════════════════════════════════════════════════════════════

@app.get("/api/annotation-properties", tags=["Propriétés"])
def list_annotation_properties():
    return require_onto().annotation_properties


@app.post("/api/annotation-properties", tags=["Propriétés"], status_code=201)
def create_annotation_property(prop: OWLAnnotationProperty):
    onto = require_onto()
    _validate_ncname(prop.id, "Property ID")
    if any(p.id == prop.id for p in onto.annotation_properties):
        raise HTTPException(409, f"AnnotationProperty '{prop.id}' already exists")
    onto.annotation_properties.append(prop)
    store.save()
    return prop


@app.get("/api/annotation-properties/{prop_id}", tags=["Propriétés"])
def get_annotation_property(prop_id: str):
    onto = require_onto()
    prop = next((p for p in onto.annotation_properties if p.id == prop_id), None)
    if not prop:
        raise HTTPException(404, f"AnnotationProperty '{prop_id}' not found")
    return prop


@app.put("/api/annotation-properties/{prop_id}", tags=["Propriétés"])
def update_annotation_property(prop_id: str, prop: OWLAnnotationProperty):
    onto = require_onto()
    _validate_ncname(prop.id, "Property ID")
    idx = next((i for i, p in enumerate(onto.annotation_properties) if p.id == prop_id), None)
    if idx is None:
        raise HTTPException(404, f"AnnotationProperty '{prop_id}' not found")
    if prop.id != prop_id:
        if any(p.id == prop.id for i2, p in enumerate(onto.annotation_properties) if i2 != idx):
            raise HTTPException(409, f"AnnotationProperty '{prop.id}' already exists")
        # Cascade rename in subPropertyOf references
        for p in onto.annotation_properties:
            if prop_id in p.subPropertyOf:
                p.subPropertyOf = [prop.id if s == prop_id else s for s in p.subPropertyOf]
    onto.annotation_properties[idx] = prop
    store.save()
    return prop


@app.delete("/api/annotation-properties/{prop_id}", tags=["Propriétés"])
def delete_annotation_property(prop_id: str):
    onto = require_onto()
    prop = next((p for p in onto.annotation_properties if p.id == prop_id), None)
    if not prop:
        raise HTTPException(404, f"AnnotationProperty '{prop_id}' not found")
    # Remove subPropertyOf references
    for p in onto.annotation_properties:
        if prop_id in p.subPropertyOf:
            p.subPropertyOf = [s for s in p.subPropertyOf if s != prop_id]
    onto.annotation_properties = [p for p in onto.annotation_properties if p.id != prop_id]
    store.save()
    return {"deleted": prop_id}


# ════════════════════════════════════════════════════════════════
# INDIVIDUS
# ════════════════════════════════════════════════════════════════

@app.get("/api/individuals", tags=["Individus"])
def list_individuals():
    return require_onto().individuals


def _sync_inverse_assertions(onto: OWLOntology, ind_id: str,
                             old_assertions: list, new_assertions: list) -> None:
    """Propage les assertions inverses (owl:inverseOf) quand les ObjectAssertions d'un individu changent.
    - old_assertions : ObjectPropertyAssertion avant la modification
    - new_assertions : ObjectPropertyAssertion après la modification
    """
    old_set = {(a.property, a.target) for a in old_assertions}
    new_set = {(a.property, a.target) for a in new_assertions}

    def _inverse_of(prop_id: str):
        p = next((x for x in onto.object_properties if x.id == prop_id), None)
        return p.inverseOf if p else None

    # Assertions retirées → supprimer l'assertion inverse sur l'individu cible
    for prop_id, target_id in old_set - new_set:
        inv = _inverse_of(prop_id)
        if not inv:
            continue
        target = next((i for i in onto.individuals if i.id == target_id), None)
        if target:
            target.objectAssertions = [
                a for a in target.objectAssertions
                if not (a.property == inv and a.target == ind_id)
            ]

    # Assertions ajoutées → ajouter l'assertion inverse sur l'individu cible
    for prop_id, target_id in new_set - old_set:
        inv = _inverse_of(prop_id)
        if not inv:
            continue
        target = next((i for i in onto.individuals if i.id == target_id), None)
        if target:
            already = any(a.property == inv and a.target == ind_id for a in target.objectAssertions)
            if not already:
                target.objectAssertions.append(ObjectPropertyAssertion(property=inv, target=ind_id))


@app.post("/api/individuals", tags=["Individus"], status_code=201)
def create_individual(ind: OWLIndividual):
    onto = require_onto()
    _validate_ncname(ind.id, "Individual ID")
    ind.id = ind.id.strip().replace(' ', '_')   # espace → underscore
    if any(i.id == ind.id for i in onto.individuals):
        raise HTTPException(409, f"Individual '{ind.id}' already exists")
    onto.individuals.append(ind)
    # Propager les assertions inverses (pas d'état précédent → old = [])
    _sync_inverse_assertions(onto, ind.id, [], ind.objectAssertions)
    store.save()
    return ind


@app.get("/api/individuals/{ind_id}", tags=["Individus"])
def get_individual(ind_id: str):
    onto = require_onto()
    ind = next((i for i in onto.individuals if i.id == ind_id), None)
    if not ind:
        raise HTTPException(404, f"Individual '{ind_id}' not found")
    return ind


@app.put("/api/individuals/{ind_id}", tags=["Individus"])
def update_individual(ind_id: str, ind: OWLIndividual):
    onto = require_onto()
    _validate_ncname(ind.id, "Individual ID")
    idx = next((i for i, x in enumerate(onto.individuals) if x.id == ind_id), None)
    if idx is None:
        raise HTTPException(404, f"Individual '{ind_id}' not found")
    old_assertions = onto.individuals[idx].objectAssertions
    new_id = ind.id.strip().replace(' ', '_') if ind.id else ind_id
    if not new_id:
        raise HTTPException(422, "Individual ID cannot be empty")
    ind.id = new_id
    # Si l'ID change, mettre à jour toutes les références dans les autres individus
    if new_id != ind_id:
        for other in onto.individuals:
            if other.id == ind_id:
                continue
            other.objectAssertions = [
                a if a.target != ind_id else a.model_copy(update={"target": new_id})
                for a in other.objectAssertions
            ]
            other.sameAs = [x if x != ind_id else new_id for x in (other.sameAs or [])]
            other.differentFrom = [x if x != ind_id else new_id for x in (other.differentFrom or [])]
    _sync_inverse_assertions(onto, ind_id, old_assertions, ind.objectAssertions)
    onto.individuals[idx] = ind
    store.save()
    return ind


@app.delete("/api/individuals/{ind_id}", tags=["Individus"])
def delete_individual(ind_id: str):
    onto = require_onto()
    ind = next((i for i in onto.individuals if i.id == ind_id), None)
    if not ind:
        raise HTTPException(404, f"Individual '{ind_id}' not found")
    # Retirer toutes les assertions inverses pointant vers cet individu
    _sync_inverse_assertions(onto, ind_id, ind.objectAssertions, [])
    onto.individuals = [i for i in onto.individuals if i.id != ind_id]
    store.save()
    return {"deleted": ind_id}



# ════════════════════════════════════════════════════════════════
# INFÉRENCES
# ════════════════════════════════════════════════════════════════

@app.get("/api/inferences", tags=["Inférences"], response_model=InferenceResult)
def get_inferences():
    """Calcule et retourne toutes les inférences en temps réel."""
    return run_inferences()


@app.get("/api/inferences/violations", tags=["Inférences"])
def get_violations():
    """Retourne uniquement les violations de cohérence."""
    result = run_inferences()
    return result.violations


@app.get("/api/inferences/subclass-closure", tags=["Inférences"])
def get_subclass_closure():
    """Retourne la fermeture transitive de subClassOf pour toutes les classes."""
    onto = require_onto()
    engine = InferenceEngine(onto)
    return engine.compute_subclass_closure()


# ════════════════════════════════════════════════════════════════
# SWRL RULES
# ════════════════════════════════════════════════════════════════

@app.get("/api/swrl-rules", tags=["SWRL"])
def list_swrl_rules():
    return require_onto().swrl_rules


@app.post("/api/swrl-rules", tags=["SWRL"], status_code=201)
def create_sword_rule(rule: SWRLRule):
    onto = require_onto()
    if any(r.id == rule.id for r in onto.swrl_rules):
        raise HTTPException(409, f"SWRL rule '{rule.id}' already exists")
    onto.swrl_rules.append(rule)
    store.save()
    return rule


@app.get("/api/swrl-rules/{rule_id}", tags=["SWRL"])
def get_sword_rule(rule_id: str):
    onto = require_onto()
    rule = next((r for r in onto.swrl_rules if r.id == rule_id), None)
    if not rule:
        raise HTTPException(404, f"SWRL rule '{rule_id}' not found")
    return rule


@app.put("/api/swrl-rules/{rule_id}", tags=["SWRL"])
def update_sword_rule(rule_id: str, rule: SWRLRule):
    onto = require_onto()
    idx = next((i for i, r in enumerate(onto.swrl_rules) if r.id == rule_id), None)
    if idx is None:
        raise HTTPException(404, f"SWRL rule '{rule_id}' not found")
    if rule.id != rule_id:
        if any(r.id == rule.id for i2, r in enumerate(onto.swrl_rules) if i2 != idx):
            raise HTTPException(409, f"SWRL rule '{rule.id}' already exists")
    onto.swrl_rules[idx] = rule
    store.save()
    return rule


@app.delete("/api/swrl-rules/{rule_id}", tags=["SWRL"])
def delete_sword_rule(rule_id: str):
    onto = require_onto()
    before = len(onto.swrl_rules)
    onto.swrl_rules = [r for r in onto.swrl_rules if r.id != rule_id]
    if len(onto.swrl_rules) == before:
        raise HTTPException(404, f"SWRL rule '{rule_id}' not found")
    store.save()
    return {"deleted": rule_id}


# ════════════════════════════════════════════════════════════════
# FILESYSTEM BROWSER
# ════════════════════════════════════════════════════════════════

from pathlib import Path as FSPath
from triple_store import host_to_container, container_to_host

@app.get("/api/fs/browse", tags=["Système"])
def fs_browse(path: str = Query("/Users/bernard"),
              ext: str = Query(".json", description="Extensions séparées par virgule")):
    """Liste le contenu d'un répertoire (traduit chemin hôte → container)."""
    container_path = host_to_container(path)
    p = FSPath(container_path)
    if not p.exists() or not p.is_dir():
        raise HTTPException(404, f"Répertoire introuvable : {path}")
    dirs, files = [], []
    try:
        raw_entries = list(p.iterdir())
    except PermissionError:
        # macOS sandbox : listing du répertoire racine refusé
        # → os.listdir peut réussir là où iterdir échoue
        import os as _os
        raw_entries = []
        try:
            names = _os.listdir(container_path)
        except PermissionError:
            names = []
        for name in names:
            try:
                child = p / name
                child.stat()          # vérifie l'accès
                raw_entries.append(child)
            except (PermissionError, OSError):
                continue

    def _sort_key(e):
        try:
            return (not e.is_dir(), e.name.lower())
        except (PermissionError, OSError):
            return (True, e.name.lower())

    entries = sorted(raw_entries, key=_sort_key)
    for entry in entries:
        if entry.name.startswith('.'):
            continue
        try:
            host_entry = container_to_host(str(entry))
            allowed_ext = {e.strip() for e in ext.split(',') if e.strip()}
            if entry.is_dir():
                dirs.append({"name": entry.name, "path": host_entry})
            elif entry.suffix.lower() in allowed_ext:
                files.append({"name": entry.name, "path": host_entry})
        except PermissionError:
            continue
    parent = str(FSPath(path).parent) if str(FSPath(path).parent) != path else None
    return {"current": path, "parent": parent, "dirs": dirs, "files": files}



@app.post("/api/builtins/fetch", tags=["Système"])
def fetch_builtins():
    """Download the 3 core W3C ontologies (RDF, RDFS, OWL) and register them as read-only.
    Uses rdflib to fetch & parse (handles redirects and content negotiation automatically).
    Files are cached as Turtle in the data directory."""
    import rdflib
    from triple_store import DATA_DIR, container_to_host, store

    BUILTINS = [
        {
            "name":   "rdf",
            "prefix": "rdf",
            "uri":    "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "url":    "http://www.w3.org/1999/02/22-rdf-syntax-ns",
            "file":   "rdf.ttl",
        },
        {
            "name":   "rdfs",
            "prefix": "rdfs",
            "uri":    "http://www.w3.org/2000/01/rdf-schema#",
            "url":    "http://www.w3.org/2000/01/rdf-schema",
            "file":   "rdfs.ttl",
            # RDFS uses RDF but doesn't formally declare owl:imports in its W3C file
            "forced_imports": ["http://www.w3.org/1999/02/22-rdf-syntax-ns"],
        },
        {
            "name":   "owl",
            "prefix": "owl",
            "uri":    "http://www.w3.org/2002/07/owl#",
            "url":    "http://www.w3.org/2002/07/owl",
            "file":   "owl.ttl",
        },
    ]

    # Store builtins in ~/.swowl/builtins/ — correctly mapped via container_to_host()
    from triple_store import SWOWL_DIR
    builtin_dir = SWOWL_DIR / "builtins"
    builtin_dir.mkdir(parents=True, exist_ok=True)

    results = []
    for b in BUILTINS:
        # Skip if already registered
        if any(e["name"] == b["name"] for e in store.list_registry()):
            results.append({"name": b["name"], "status": "already registered"})
            continue

        # Download via rdflib (handles redirects + content negotiation)
        ttl_path  = builtin_dir / b["file"]           # cached Turtle
        json_path = builtin_dir / f"{b['name']}.json" # SWOWL JSON
        if not ttl_path.exists():
            try:
                g = rdflib.Graph()
                g.parse(b["url"])
                ttl_path.write_text(g.serialize(format="turtle"), encoding="utf-8")
            except Exception as e:
                results.append({"name": b["name"], "status": f"download failed: {e}"})
                continue

        # host path for the registry (container /host/Users/bernard/... → /Users/bernard/...)
        # Extract owl:imports declarations from the TTL
        imported_uris = list(b.get("forced_imports", []))
        try:
            g2 = rdflib.Graph()
            g2.parse(data=ttl_path.read_bytes(), format="turtle")
            for s, p, o2 in g2.triples((None, rdflib.OWL.imports, None)):
                uri_str = str(o2)
                if uri_str not in imported_uris:
                    imported_uris.append(uri_str)
        except Exception:
            pass

        host_json = container_to_host(str(json_path))
        try:
            store.import_from_rdf(
                ttl_path.read_bytes(), "turtle",
                b["name"], host_json, b["uri"], b["prefix"]
            )
            store.disconnect()
            entry = store._registry.get(b["name"])
            if entry:
                entry.readonly = True
                entry.imports  = imported_uris
                store._save_registry()
            results.append({"name": b["name"], "status": "fetched and registered",
                             "imports": imported_uris})
        except Exception as e:
            results.append({"name": b["name"], "status": f"import failed: {e}"})

    return {"results": results}


@app.post("/api/reveal", tags=["Système"])
def reveal_in_finder(path: str = Query(..., description="Host path to reveal in Finder")):
    """Ask the macOS host agent to open Finder at the given path."""
    import urllib.request as _req
    import urllib.parse as _parse
    host_path = path  # already a host path (not container path)
    url = f"http://host.docker.internal:8002/reveal?path={_parse.quote(host_path)}"
    try:
        req = _req.Request(url, method="POST")
        with _req.urlopen(req, timeout=3) as r:
            return {"status": "ok", "revealed": host_path}
    except Exception as e:
        raise HTTPException(503, f"Host agent not reachable — start host_agent.py first. ({e})")


@app.get("/api/health", tags=["Système"])
def health():
    onto = store.get()
    return {
        "status": "ok",
        "ontology_loaded": onto is not None,
        "ontology_id": onto.id if onto else None,
    }
