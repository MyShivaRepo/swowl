# Changelog

All notable changes to **SWOWL** are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

> 🇫🇷 Une version française de ce fichier est disponible : [CHANGELOG.fr.md](CHANGELOG.fr.md).

## [1.1.0] — 2026-06-19

### Sources (new, hideable tab)
- New **Sources** tab (right of Settings, hideable via GUI Tabs) with three
  sub-tabs: **LLMs**, **Corpus**, **Analysis**.
- **LLMs**: configure a provider (**Anthropic**, **OpenAI**, **Meta**), enter an
  **API key** per provider (stored in `localStorage`, maskable) and **test** the
  key through a backend proxy `POST /api/llm/test` (avoids CORS; the key is
  neither stored nor logged server-side).
- **Corpus** (per ontology): list of **Name / Location** documents (local path
  via the **FsBrowser** → absolute path, or web URL), add / edit / delete.
  **🔬 Analyse Corpus** button.
- **Corpus analysis → candidate ontology**: `POST /api/corpus/analyse` parses each
  document (PDF, TXT/MD, HTML/URL, DOCX) section by section and extracts, via
  **Claude**, an **OWL + SWRL rules** model merged into the connected ontology
  (flagged `swowl:candidate`). The **Analysis** tab shows the **traceability**:
  each element (navigable ID) and the **source sections** (document — chapter / page).

### Export
- **HTML export** (« ↓ HTML » button in the Ontologies tab): generates a
  **standalone HTML page** (single file) of the connected ontology — Classes,
  ObjectProperties, DatatypeProperties, AnnotationProperties, Individuals,
  SWRL Rules — fully **navigable** (internal links + table of contents) with
  **full-text search**.
- The HTML export now reproduces the **SWOWL look & feel** (tabs, cards, panels),
  adds an **Ontology (Network)** tab (force-directed **D3.js** graph) and
  faithfully reproduces the card **cross-reference** panels (same labels as the
  editor: *Properties and Restrictions*, *Where Used in Range*, *Disjoints*,
  *Equivalent*, *SubClassOf*…).

### Contextual (per-ontology) tab scope
- Only the **Ontologies** tab remains **global**. The settings of the
  **GUI Tabs**, **Languages**, **IDs Rules** and **LLMs** tabs are now
  **contextual (per ontology)**: `localStorage` keys are suffixed with
  `::{ontology_name}` (falling back to the base key when no ontology is connected).
- The top-bar ontology switcher redirects to **Ontologies** if the active tab is
  hidden in the target ontology.

### Removals & UI
- Removed the **Inferences** tab (nav item + GUI Tabs row).
- Removed the **SPARQL VizQ** sub-bar: queries are now displayed directly in the
  **Queries** tab; query icon: 🎯 → **🔎**.
- Toolbars homogenised through a single CSS class **`btn-tool`** (identical square
  buttons, red trash) in **SWRL Rules**, **Queries** and **Individuals**;
  deletion is now done via a **single button** in the toolbar (no more per-row
  trash).
- **Analysis** tab: extracted-element chips show the **ID only**.

### Robustness
- **OpenAI**: new **retry-with-backoff** logic on HTTP **429** errors (reads the
  `Retry-After` header, exponential fallback).

[1.1.0]: https://github.com/MyShivaRepo/swowl/releases/tag/v1.1.0

## [1.0.0] — 2026-06-15

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
- Rule IDs and the entities referenced in atoms (classes, OPs, DPs, individuals)
  are displayed with their prefix — contextual import prefix for imported items,
  ontology prefix for native ones (prefix on the ID, never the label).

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
- **Ontology (Network)** — force-directed graph: classes linked by `subClassOf`,
  ObjectProperties as nodes linked to their classes via `rdfs:domain`/`rdfs:range`.
- **Knowledge Base** — force-directed individuals graph.
- Resizable sub-tab sidebar.

### Import / Export
- OWL/XML, Turtle, JSON-LD, SWORD.
- Import of **SKOS annotations** (prefLabel, altLabel, definition, note…) and
  `rdfs:seeAlso` into each entity's annotations.
- Robust import: individuals typed by a user class (Protégé `<Class rdf:ID>`),
  `owl:equivalentClass` (named or restriction), anonymous `owl:DataRange` ranges
  ignored.
- **owl:imports** emitted on RDF export; `peek` ("Read prefix, URI & imports from
  file") detects declared `owl:imports` and referenced namespaces.
- W3C built-in ontologies (RDF, RDFS, OWL, **SKOS**) fetchable from w3.org.

### Imported ontologies & namespaces
- **"Imported namespaces" section** in the New / Import / Edit / Load wizards
  (homogenised): declare each imported ontology as `owl:imports` with a
  **contextual prefix** (prefix → namespace), editable, pre-filled by `peek`.
- The contextual prefix is **authoritative** for displaying imported entities
  (classes, OPs, DPs, individuals, SWRL rules) — it overrides the imported
  ontology's own registry prefix. The base namespace takes priority over imported
  ones when resolving native ids.
- Registry import sub-rows show the contextual prefix; the namespace (URI) column
  is clickable (opens the URI in a new tab).

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
- Backend test suite (`backend/tests`, pytest) — isolated registry: import/export
  round-trip, `_lid` prefixing & base priority, SWORD round-trip, typed-by-class
  individuals, equivalentClass, DataRange, owl:imports export.

[1.0.0]: https://github.com/MyShivaRepo/swowl/releases/tag/v1.0.0
