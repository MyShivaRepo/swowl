# Changelog

All notable changes to **SWOWL** are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] — 2026-06-12

First stable release. A complete web editor for **OWL 2 DL** ontologies with
**SWRL** rules, visual **SPARQL** queries, and a real-time inference engine.

### OWL 2 editing
- Classes — `subClassOf`, equivalent, disjoint, restrictions (someValuesFrom,
  allValuesFrom, hasValue, cardinalities), tree hierarchy with drag-and-drop.
- ObjectProperties / DatatypeProperties — domain, range, characteristics,
  `subPropertyOf` hierarchies, inverse, property chains.
- Individuals — type assertions, property values, sameAs / differentFrom.
- AnnotationProperties — `rdfs:`, `owl:` and **`skos:`** namespace sections.
- **WHERE USED IN RANGE** panel — lists the ObjectProperties whose range is the
  selected class, with controls to attach an existing OP or create one on the fly.

### SWRL
- Visual rule editor with live preview and atom reordering (drag handle).
- **Import / export `.swd`** (SWORD human-readable rule format), with round-trip
  preservation of NAF negation, conditional sub-rules, equality and empty-class
  atoms; ID-collision dialog on import (replace / keep / cancel). The import file
  picker accepts any file (content validated by the parser).

### SPARQL (VizQ)
- Visual query builder; triple deletion via a red `✕` and drag-handle reordering
  of patterns (root list and OPTIONAL blocks).
- Clicking an individual in the results selects it completely (class tree +
  individual list + form).

### Views
- **Ontology (Hyperbolic)** — animated Poincaré-disk hyperbolic tree on canvas
  (Möbius transforms): drag to pan, click to re-centre, double-click to edit,
  hover to highlight a sub-branch.
- **Ontology (TreeMap)** — restyled treemap: vibrant per-branch palette, depth
  shading, rounded tiles, hover highlight, drill-down.
- **Knowledge Base** — force-directed individuals graph.
- Resizable sub-tab sidebar.

### Import / Export
- OWL/XML, Turtle, JSON-LD, SWORD.
- Import of **SKOS annotations** (prefLabel, altLabel, definition, note…) and
  `rdfs:seeAlso` into each entity's annotations.
- Robust import: individuals typed by a user class (Protégé `<Class rdf:ID>`),
  `owl:equivalentClass` (named or restriction), anonymous `owl:DataRange` ranges
  ignored.
- W3C built-in ontologies (RDF, RDFS, OWL, **SKOS**) fetchable from w3.org.

### Ontologies registry
- Split into **USER REGISTRY** and a collapsible **SYSTEM REGISTRY** (W3C built-ins,
  sorted alphabetically).
- Import links split: click the prefix to select the ontology, click the URI to
  open its web page.
- Unregister with optional on-disk file deletion.

### Inference
- In-house forward-chaining engine: transitivity, restriction inheritance, types
  via domain/range, inverse, property chains, violation detection.

### UX
- Homogeneous pickers across the whole app — a **Filter** field on top and a
  **tree-mode** presentation everywhere.
- Consistent red `✕` delete controls, positioned right after the element they remove.
- Entity display prefix driven by the registry prefix (defined → `rohs:Part`;
  empty → bare local id).
- Global search, undo/redo, navigation history, hideable tabs.

### Tech
- Frontend: Nginx + vanilla HTML/CSS/JS (no framework, no build).
- Backend: Python 3.11, FastAPI + Uvicorn, rdflib, Pydantic.
- Bilingual user specifications under `exigences/` (FR) and `requirements/` (EN).

[1.0.0]: https://github.com/MyShivaRepo/swowl/releases/tag/v1.0.0
