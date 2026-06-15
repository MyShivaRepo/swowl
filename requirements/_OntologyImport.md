# Requirements — Ontology import

> Generated on 2026-06-10 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-IMP-001 — Declaring imports in the current ontology](#req-imp-001--declaring-imports-in-the-current-ontology)
- [REQ-IMP-002 — Merging imported entities into the application state](#req-imp-002--merging-imported-entities-into-the-application-state)
- [REQ-IMP-003 — Inheriting naming rules (display_rules)](#req-imp-003--inheriting-naming-rules-display_rules)
- [REQ-IMP-004 — Persistence: imported entities are not saved locally](#req-imp-004--persistence-imported-entities-are-not-saved-locally)
- [REQ-IMP-005 — Read-only: editing and deletion are impossible](#req-imp-005--read-only-editing-and-deletion-are-impossible)
- [REQ-IMP-011 — Importing SKOS annotations and other annotation properties](#req-imp-011--importing-skos-annotations-and-other-annotation-properties)
- [REQ-IMP-012 — Detecting Individuals typed by a user-defined class (OWL 1 / Protégé style)](#req-imp-012--detecting-individuals-typed-by-a-user-defined-class-owl-1--protégé-style)
- [REQ-IMP-013 — Reading owl:equivalentClass on import](#req-imp-013--reading-owlequivalentclass-on-import)
- [REQ-IMP-014 — Ignoring anonymous DataRange ranges on DatatypeProperties](#req-imp-014--ignoring-anonymous-datarange-ranges-on-datatypeproperties)
- [REQ-IMP-015 — Contextual prefixing of entities from imported namespaces](#req-imp-015--contextual-prefixing-of-entities-from-imported-namespaces)
- [REQ-IMP-016 — Ontology base takes priority over user namespaces](#req-imp-016--ontology-base-takes-priority-over-user-namespaces)
- [REQ-IMP-017 — Converting wizard namespaces into owl:imports](#req-imp-017--converting-wizard-namespaces-into-owlimports)

### Form
- [REQ-IMP-006 — Dimmed visual style in lists and trees](#req-imp-006--dimmed-visual-style-in-lists-and-trees)
- [REQ-IMP-007 — Tree root nodes: same visual style as imported entities](#req-imp-007--tree-root-nodes-same-visual-style-as-imported-entities)
- [REQ-IMP-008 — Detail panel: locked banner and read-only form](#req-imp-008--detail-panel-locked-banner-and-read-only-form)
- [REQ-IMP-009 — References to imported entities in local detail panels](#req-imp-009--references-to-imported-entities-in-local-detail-panels)
- [REQ-IMP-010 — Context menu of imported entities](#req-imp-010--context-menu-of-imported-entities)

---

## 1. Substance — Business rules and functional logic

> Requirements independent of the UI: loading rules, priorities, algorithmic behaviors, persistence.


### REQ-IMP-001 — Declaring imports in the current ontology

| **If** | the current ontology declares one or more imports through its `imports` field, |
|---|---|
| **Then** | each import is identified by a **prefix** (e.g. `plm`) and an **ontology name** (e.g. `RoHS_Ontology`). These imports are listed in the **Ontologies** tab in read-only mode. |

**Source code:** `backend/main.py` → `GET /api/imported-entities` — reads the `imports` field of the current ontology, loads each referenced ontology and extracts its entities. `frontend/js/app.js` → `loadState()` — calls `API.getImportedEntities()` after the current ontology has been loaded.

---

### REQ-IMP-002 — Merging imported entities into the application state

| **If** | the current ontology declares imports, |
|---|---|
| **Then** | on load, the system merges into `APP.state` the 7 entity types coming from the imported ontologies: `classes`, `object_properties`, `datatype_properties`, `annotation_properties`, `individuals`, `swrl_rules` and `queries`. Each imported entity is tagged `_imported: true`, `_importPrefix` (prefix) and `_importName` (name of the source ontology). |

**Source code:** `backend/main.py` → `get_imported_entities()` — iterates over the 7 entity types and adds `{ "_imported": True, "_importPrefix": prefix, "_importName": name }` to each entity. `frontend/js/app.js` → `loadState()` — merges each collection: `this.state.classes = [...this.state.classes, ...(imp.classes || [])]` (same for the 6 other types).

---

### REQ-IMP-003 — Inheriting naming rules (display_rules)

| **If** | an imported ontology defines naming rules (`display_rules`), |
|---|---|
| **Then** | these rules are copied into the state of the current ontology in order to correctly display the names of the `Individual`s of the imported ontology. In case of a conflict on the same class, **local rules take priority** over imported rules. |

**Source code:** `backend/main.py` → `get_imported_entities()` — builds `result["display_rules"]` by merging (first occurrence wins). `frontend/js/app.js` → `loadState()` — merges with `{ single: { ...(impDr.single), ...(local.single) }, multi: { ...(impDr.multi), ...(local.multi) } }`: local keys override imported ones.

---

### REQ-IMP-004 — Persistence: imported entities are not saved locally

| **If** | a save, undo or redo operation is performed, |
|---|---|
| **Then** | imported entities are **not stored** in the current ontology file. They are reloaded dynamically from the backend on each opening. Undo/redo snapshots contain only local entities. |

**Source code:** `backend/main.py` → `PUT /api/ontology` — saves only the data of the current ontology, without the imported entities. `frontend/js/app.js` → `UndoRedo._snap()` — saves only the local collections; imported entities are reloaded via `loadState()` on each `APP.refresh()`.

---

### REQ-IMP-005 — Read-only: editing and deletion are impossible

| **If** | the user attempts to edit or delete an imported entity (form, delete button or context menu), |
|---|---|
| **Then** | the action is blocked: the form fields are disabled, the delete button is hidden in the list, and any programmatic deletion attempt displays an error message. |

**Source code:** `owl_editor.js` → `_applyReadOnly(detail)` — disables all `input, select, textarea, button` of the detail panel. `SWRLEditor.delete()` and `SparqlEditor.deleteQuery()` — check `entity._imported` and call `UI.error()` if true. `renderList()` of each editor — hides the delete button if `isImported`.

---

### REQ-IMP-011 — Importing SKOS annotations and other annotation properties

| **If** | an ontology is imported (e.g. a Turtle/`.ttl` file) and its entities carry annotation-property assertions beyond `rdfs:label` and `rdfs:comment`, |
|---|---|
| **Then** | SWOWL also imports these additional annotations and attaches them to each entity concerned. Recognized in particular are: **SKOS** annotations (`skos:prefLabel`, `skos:altLabel`, `skos:hiddenLabel`, `skos:definition`, `skos:note`, `skos:scopeNote`, `skos:example`, `skos:editorialNote`, `skos:historyNote`, `skos:changeNote`), as well as `rdfs:seeAlso` (and the other recognized annotation predicates). These annotations are collected per entity — `classes`, `object_properties`, `datatype_properties`, `annotation_properties`, `individuals` — into the entity's **"other annotations"** field (`annotations.other`), each as a `{property, value}` pair, and are displayed in the "annotations" section of the entity form. **Multi-valued** annotations (e.g. several `skos:altLabel`) are all preserved. |

**Note:** as an example, importing the "capital" ontology now surfaces **53** "other" annotations that were previously dropped.

---

### REQ-IMP-012 — Detecting Individuals typed by a user-defined class (OWL 1 / Protégé style)

| **If** | an imported ontology declares individuals in the OWL 1 / Protégé style, i.e. `<MyClass rdf:ID="x"/>` (i.e. `x rdf:type :MyClass`), **without** `owl:NamedIndividual` and **without** `owl:Thing`, |
|---|---|
| **Then** | these subjects are now recognized as `Individual`s. In addition to `owl:NamedIndividual` and `owl:Thing` subjects, the importer collects every URI subject whose `rdf:type` is a user-defined class (a subject of `owl:Class` / `rdfs:Class`), excluding subjects that are themselves structural OWL entities (classes, properties, etc.). The individual is imported with its type and its data assertions. |

**Note:** as an example, importing the RoHS ontology now surfaces its **7** `Substance` instances (chromium, mercury, lead…) with their type and data assertions (`toleratesMaximumPercentage`).

**Source code:** `backend/triple_store.py` → `import_from_rdf` — in addition to `owl:NamedIndividual` and `owl:Thing` subjects, collects every URI subject whose `rdf:type` is a subject of `owl:Class` / `rdfs:Class`, excluding subjects that are themselves structural OWL entities (classes, properties, etc.).

---

### REQ-IMP-013 — Reading owl:equivalentClass on import

| **If** | a class of an imported ontology declares one or more `owl:equivalentClass` assertions, |
|---|---|
| **Then** | the importer now reads `owl:equivalentClass` for each class (previously `equivalentClass` was only written on export and never read back). A named class becomes an id; an anonymous `owl:Restriction` becomes a restriction object (e.g. `Assembly ≡ ∃ hasPart . Part` → a `someValuesFrom` restriction in the class's `equivalentClass` list), parsed the same way as `subClassOf` restrictions. |

**Source code:** `backend/triple_store.py` → `import_from_rdf` — reads `owl:equivalentClass` for each class: a named class is added as an id, an anonymous `owl:Restriction` is parsed into a restriction object (same logic as `subClassOf`) and added to the class's `equivalentClass` list.

---

### REQ-IMP-014 — Ignoring anonymous DataRange ranges on DatatypeProperties

| **If** | a `DatatypeProperty` of an imported ontology declares an `rdfs:range` that is an anonymous `owl:DataRange` / `owl:oneOf` (enumerated datatype, e.g. `{compliant, suspect, failed}`), |
|---|---|
| **Then** | the importer now keeps only `URIRef` ranges (datatype URIs) and **ignores** anonymous `DataRange` nodes (previously a meaningless blank-node id appeared in the range). The enumerated datatype itself is not modelled in SWOWL's range, which holds datatype URIs only. |

**Source code:** `backend/triple_store.py` → `import_from_rdf` — keeps only `URIRef` `rdfs:range` values and ignores anonymous `owl:DataRange` / `owl:oneOf` nodes.

---

### REQ-IMP-015 — Contextual prefixing of entities from imported namespaces

| **If** | the user has filled in a wizard's **"Imported namespaces"** table (`prefix → namespace` pairs, e.g. `plm → http://examples.org/plm`) and an ontology is imported, |
|---|---|
| **Then** | this table is passed to the import (parameter `ns_prefixes`) and every entity whose URI belongs to a mapped namespace receives a **local identifier prefixed** with the chosen contextual prefix (e.g. the class `http://examples.org/plm#Foo` becomes `plm:Foo`). The displayed prefix thus comes from the user-entered table, not from an arbitrary prefix of the source file. |

**Source code:** `backend/triple_store.py` → `import_from_rdf(..., ns_prefixes=...)` receives the `prefix → namespace` table; the inner `_lid` function prefixes an entity's local identifier with the contextual prefix when its URI belongs to a mapped namespace (e.g. `plm:Foo`).

---

### REQ-IMP-016 — Ontology base takes priority over user namespaces

| **If** | an imported entity could belong to both the **ontology base** and a declared **user namespace** (where the base is a superset of an imported namespace, e.g. base `http://examples.org/plm/data#` vs import `http://examples.org/plm`), |
|---|---|
| **Then** | `_lid` tests whether the URI belongs to the **ontology base BEFORE** the user-declared namespaces. Native base entities therefore remain **bare local identifiers** (e.g. `MyClass`) and are not wrongly prefixed (e.g. the erroneous `plm:/data#MyClass` is avoided). |

**Source code:** `backend/triple_store.py` → `import_from_rdf` / `_lid` — base membership is tested before user namespaces; base entities yield a bare local id, mapped-namespace entities a prefixed id.

---

### REQ-IMP-017 — Converting wizard namespaces into owl:imports

| **If** | the user declares namespaces through a wizard's **"Imported namespaces"** table, |
|---|---|
| **Then** | these namespaces are also converted into `owl:imports` together with their `import_labels` (contextual prefix), both on the registry entry and in the ontology's `.json` file, so that the import is actually **resolved** and the imported entities are shown read-only (see REQ-IMP-001 to REQ-IMP-005). |

**Source code:** `backend/triple_store.py` → helper `store._imports_from_ns` — converts the `ns_prefixes` table into `owl:imports` + `import_labels` (contextual prefix) entries on the registry entry and the `.json`.

---

## 2. Form — Interface and presentation rules

> Requirements concerning display, icons, visual ordering and UI interactions.

---

### REQ-IMP-006 — Dimmed visual style in lists and trees

| **If** | an imported entity appears in the list or tree of a tab, |
|---|---|
| **Then** | it is displayed with: (1) a **dimmed opacity** (`opacity: 0.5`), (2) **italic** text, (3) its identifier prefixed with the **import prefix** (e.g. `plm:Article`), (4) the **delete button hidden**. |

**Source code:** `style.css` → `.imported-entity { font-style: italic; opacity: 0.5; }` — CSS rule applied to all imported items. `owl_editor.js` → `ClassEditor._renderNode()`, `OPEditor._renderNode()`, `DPEditor._renderNode()`, `APEditor._renderUserNode()` — apply the `imported-entity` CSS class and the prefix if `entity._imported === true`. `swrl_editor.js` → `SWRLEditor.renderList()` and `sparql_editor.js` → `SparqlEditor.renderList()` — same logic for the SWRL Rules and Queries tabs.

---

### REQ-IMP-007 — Tree root nodes: same visual style as imported entities

| **If** | the tree of `Classes`, `ObjectProperties` or `DatatypeProperties` is displayed, |
|---|---|
| **Then** | the root node (`owl:Thing`, `owl:topObjectProperty`, `owl:topDataProperty`) adopts the **same visual style** as imported entities: same opacity (`0.5`), same text color (`var(--text)`) and same dot color as regular child items. |

**Source code:** `style.css` → `.tree-root-item { color: var(--text); opacity: 0.5; }` — aligns the color and opacity of the root node with the child items. `.tree-thing-dot { background: #b87333 }` — identical to `.cls-dot`. `.tree-op-top-dot { background: var(--accent) }` — identical to `.op-prop-dot`. `.tree-dp-top-dot { background: var(--accent2) }` — identical to `.dp-prop-dot`.

---

### REQ-IMP-008 — Detail panel: locked banner and read-only form

| **If** | the user selects an imported entity in a tab, |
|---|---|
| **Then** | the detail panel displays: (1) a **🔒 banner** at the top showing the name of the source ontology (e.g. `🔒 Imported from RoHS_Ontology (plm:)`), (2) the form content with a **dimmed opacity** (`0.55`), (3) all fields and buttons **disabled**. |

**Source code:** `owl_editor.js` → `_importedBannerHtml(entity)` — generates the HTML of the 🔒 banner. `_applyImportedView(detail, entity, html)` — if `entity._imported`, injects the banner + the HTML, adds the `is-imported-view` CSS class and calls `_applyReadOnly(detail)`. `style.css` → `.is-imported-view > *:not(.imported-detail-banner) { opacity: 0.55; }` — dims the form content without affecting the banner.

---

### REQ-IMP-009 — References to imported entities in local detail panels

| **If** | the detail panel of a **local** entity displays references to imported entities (object-property value, class member, inferred property, referenced SWRL rule), |
|---|---|
| **Then** | each reference pointing to an imported entity is displayed with the dimmed style (`opacity: 0.5`, italic). This applies to object-property assertions on `Individual`s, to inferred properties, and to the **"Where Used In Rules"** sections of the `Classes`, `ObjectProperties`, `DatatypeProperties` and `Individuals` tabs. |

**Source code:** `owl_editor.js` → `_markImportedRefs(container)` — builds a `Set` of all imported IDs and adds the `imported-entity` CSS class to every matching `[data-id]` in the panel. OP assertions on `Individual` include `data-id="${target}"` and `_renderInferredPanel()` adds `data-id="${value}"` on `op`-type rows to enable detection. `_whereUsedFrame()` — directly adds the `imported-entity` class and the prefix on imported SWRL rule items.

---

### REQ-IMP-010 — Context menu of imported entities

| **If** | the user opens the context menu (right-click) on an imported entity, |
|---|---|
| **Then** | the menu displays a 🔒 icon followed by the name of the source ontology (e.g. `🔒 Imported from RoHS_Ontology (plm:)`), without offering any editing or deletion actions. |

**Source code:** `owl_editor.js` → `ClassEditor.showContextMenu()`, `OPEditor.showContextMenu()`, `DPEditor.showContextMenu()` — check `isImported` and replace the action items with `<div>🔒 Imported from ${entity._importName}</div>`. `swrl_editor.js` → `SWRLEditor.showContextMenu()` and `sparql_editor.js` → `SparqlEditor.showContextMenu()` — same logic on `rule._imported` / `query._imported`.

---
