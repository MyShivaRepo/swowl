# Changelog

All notable changes to **SWOWL** are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

> 🇫🇷 Une version française de ce fichier est disponible : [CHANGELOG.fr.md](CHANGELOG.fr.md).

## [1.2.2] — 2026-10-23

### Fixed
- **Qualified cardinalities** (#18): a cardinality restriction with a filler is exported
  with `owl:qualifiedCardinality` / `owl:minQualifiedCardinality` /
  `owl:maxQualifiedCardinality` + `owl:onClass` — or `owl:onDataRange` for a
  DatatypeProperty — instead of `owl:cardinality` + `owl:onClass`, which is not valid
  OWL 2. Without a filler, the plain predicate is kept. Import now also reads
  `owl:onDataRange`. Regression cases F, G, H.

## [1.2.1] — 2026-10-23

### Fixed
- **"/" namespaces** (#11): the namespace separator actually used by the entities
  (`…/onto#Pair` or `…/onto/Pair`) is detected at import and kept — together with the
  exact `owl:Ontology` IRI — instead of forcing `#`, which rewrote every IRI after a
  round-trip. Export, references to imported entities and the *Full IRI* shown in the
  editors follow it. Ontologies imported before 1.2.1 with "/" IRIs must be re-imported.
- **Property chains in `/api/inferences`** (#13): chains are evaluated over a saturated
  fact base (inverse, symmetric, sub-property, transitive and chain inferences, to a
  fixed point), so a chain can go through an inferred fact — e.g. the inverse of an
  asserted property — as the individual form already did. Asserted facts are no longer
  reported as inferred.

### Added
- Tests `tests/roundtrip_namespace.py` (slash namespace) and
  `tests/test_inference_chains.py` (in-memory, no server needed).

## [1.2.0] — 2026-10-23

### Fixed
- **Union domains and ranges** (#10): an `owl:unionOf` domain is kept as a union and
  exported as a single `rdfs:domain [ owl:unionOf … ]`. 1.1.1 flattened it into several
  `rdfs:domain` triples, which OWL reads as an **intersection** — the meaning was inverted.
  Several plain domain classes still mean intersection (OWL default); a **∩ / ∪ selector**
  in the property editor lets you choose.
- **Restriction contents that are class expressions** (#15): `∀ relatesTo.(Alpha ⊔ Beta)`
  is no longer emptied into a restriction that holds for anything.
- **Equivalences built from expressions** (#9): `Artefact ≡ Pair ⊓ ∃outputOf.Activity` is
  imported, displayed and exported; a named class defined directly by `owl:unionOf`
  becomes an equivalence.
- **Axioms on imported classes** (#14): kept under their real IRI, including the
  `<rdf:Description>` form produced by Protégé.
- **Class editor**: complex expressions are shown read-only and **preserved on save**
  (autosave used to wipe expressions and imported equivalence restrictions).
- **Inference**: no type is inferred from a union domain; a domain violation is raised
  only when the individual matches none of the union members.

### Added
- **Import warnings**: constructs that cannot be represented are reported (API field
  `import_warnings`, shown after import) instead of being rewritten or dropped silently.
- Regression case E (equivalence with an intersection containing a restriction).

## [1.1.2] — 2026-10-23

### Security
- **CORS restricted to local origins** (`localhost`, `127.0.0.1`, `[::1]`): the API
  exposes `/api/fs/browse`, which any web page open in the browser could previously
  query to list the local file system (#17).

### Fixed
- **Installation on Python 3.13 / 3.14**: dependencies moved to modern lower bounds
  capped at major versions (pydantic ≥ 2.12 ships wheels up to 3.14); `Query(enum=…)`,
  removed in FastAPI 0.155, replaced by `Literal[…]` (#16).
- **Export of prefixed identifiers**: references to imported or external vocabularies
  (`mi:Unit`, `dcterms:isPartOf`) are expanded back to their real IRI instead of being
  glued to the ontology namespace (`…#mi:Unit`) (#12).

### Added
- `tests/`: minimal round-trip fixtures (contributed by Cyril) and a regression script
  `tests/roundtrip_cyril.py` covering cases A–D.

### Known issues
- Union domains / ranges are still written as several `rdfs:domain` triples, which OWL
  reads as an **intersection** (#10); restriction fillers that are class expressions are
  emptied (#15); axioms on imported classes may be lost (#14). Planned for **1.2.0**.

## [1.1.1] — 2026-10-22

### Added
- **Property chains** for object properties: editor UI, `owl:propertyChainAxiom`
  RDF round-trip, and inference materialization.
- **Native Python (venv) run mode** — the whole app runs in a single FastAPI
  process (serving the API and the static frontend); no Docker or nginx required.
- **owl:Ontology** annotations tab in Settings, kept in sync with the System Registry.
- **Unified annotation value type** — language / datatype / IRI selector (issues #6 & #8).
- **Corpus analysis (Interfaced Agent)**: per-section chunking, enriched entities
  carrying their relations, and SWRL rules merged in a single pass.
- **Analysis tab**: mouse-resizable columns (persisted), reflowed *Text extract*
  filling the full column width and row height, auto-scroll to the first highlight,
  and an always-available *Reload from backend*.
- **Centralized version**: single source of truth in `backend/version.py`,
  exposed via `GET /api/version`; the app badge reads the API and the README
  badge reads the latest git tag; `scripts/release.sh` bumps and tags in one command.

### Fixed
- **Import**: `owl:unionOf` / `owl:intersectionOf` class expressions in a property
  `domain` / `range` are now expanded — union-domain properties were previously
  dropped (empty domain) and vanished from the class trees.
- **Analysis**: correct chunk `ref` shape (`doc` / `chapter`); labels and comments
  no longer lost on agent merge; full chunk text cached so highlighting covers the
  whole section; robust re-merge (non-hashable restriction markers).
- **Topbar**: system ontologies show their name only; the ontology switcher lists
  User + System registries and no longer fails when there is no user ontology.
- **Portability**: user-agnostic home paths, non-root container; native-mode URL
  documented as `127.0.0.1:8000`.

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
