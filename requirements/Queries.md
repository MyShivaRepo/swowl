# Requirements — Queries

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-QRY-001 — Query persistence per ontology](#req-qry-001--query-persistence-per-ontology)
- [REQ-QRY-002 — Creating a new query](#req-qry-002--creating-a-new-query)
- [REQ-QRY-003 — Selecting an existing query](#req-qry-003--selecting-an-existing-query)
- [REQ-QRY-004 — Deleting a query](#req-qry-004--deleting-a-query)
- [REQ-QRY-005 — Search/filtering in the query list](#req-qry-005--searchfiltering-in-the-query-list)
- [REQ-QRY-006 — Editing a query identifier](#req-qry-006--editing-a-query-identifier)
- [REQ-QRY-007 — Editing a query label and comment](#req-qry-007--editing-a-query-label-and-comment)
- [REQ-QRY-008 — Adding a triple pattern](#req-qry-008--adding-a-triple-pattern)
- [REQ-QRY-009 — Adding a FILTER pattern](#req-qry-009--adding-a-filter-pattern)
- [REQ-QRY-010 — Adding an OPTIONAL block](#req-qry-010--adding-an-optional-block)
- [REQ-QRY-011 — Adding nested patterns inside an OPTIONAL block](#req-qry-011--adding-nested-patterns-inside-an-optional-block)
- [REQ-QRY-012 — Deleting a pattern (root or nested)](#req-qry-012--deleting-a-pattern-root-or-nested)
- [REQ-QRY-015 — Object reset on predicate change](#req-qry-015--object-reset-on-predicate-change)
- [REQ-QRY-016 — Variable autocompletion](#req-qry-016--variable-autocompletion)
- [REQ-QRY-017 — Query options: DISTINCT, ORDER BY, LIMIT](#req-qry-017--query-options-distinct-order-by-limit)
- [REQ-QRY-019 — Automatic generation of SPARQL prefixes](#req-qry-019--automatic-generation-of-sparql-prefixes)
- [REQ-QRY-020 — Handling non-variable literals with FILTER(STR(...))](#req-qry-020--handling-non-variable-literals-with-filterstr)
- [REQ-QRY-021 — Query execution via the API](#req-qry-021--query-execution-via-the-api)
- [REQ-QRY-026 — Restoring the current selection](#req-qry-026--restoring-the-current-selection)

### Form
- [REQ-QRY-013 — Predicate selection via hierarchical dropdown](#req-qry-013--predicate-selection-via-hierarchical-dropdown)
- [REQ-QRY-014 — Adaptive object field based on predicate](#req-qry-014--adaptive-object-field-based-on-predicate)
- [REQ-QRY-018 — Generated SPARQL preview](#req-qry-018--generated-sparql-preview)
- [REQ-QRY-022 — Displaying results in a table](#req-qry-022--displaying-results-in-a-table)
- [REQ-QRY-023 — Navigating to an entity from results](#req-qry-023--navigating-to-an-entity-from-results)
- [REQ-QRY-024 — External link for unrecognized URIs in results](#req-qry-024--external-link-for-unrecognized-uris-in-results)
- [REQ-QRY-025 — List panel resizing](#req-qry-025--list-panel-resizing)

---

## 1. Substance — Business logic

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviors, validations, persistence.


### REQ-QRY-001 — Query persistence per ontology

| **If** | the application needs to read or write queries for a given ontology, |
|---|---|
| **Then** | the system uses the browser's `localStorage` with a dynamically built key of the form `swowl_sparql_<ontologyId>`, ensuring query isolation per ontology; `_loadAll()` parses the stored JSON (returns `[]` on deserialization error) and `_saveAll()` serializes and rewrites the full array. |

---

**Source code:** `sparql_editor.js` → `_storeKey()`, `_loadAll()`, `_saveAll()`

### REQ-QRY-002 — Creating a new query

| **If** | the user triggers the creation of a new query, |
|---|---|
| **Then** | the system:<br>- generates a unique identifier of the form `QueryN` (incrementing N until no duplicate exists),<br>- creates an empty query object via `_emptyQuery()` with the fields `id`, `label`, `comment`, `distinct: false`, `patterns: []`, `order_by: ''`, `order_dir: 'ASC'`, `limit: 100`,<br>- adds it to `localStorage`,<br>- then immediately selects and displays this new query. |

---

**Source code:** `sparql_editor.js` → `newQuery()`, `_emptyQuery()`

### REQ-QRY-003 — Selecting an existing query

| **If** | the user selects an existing query by its identifier, |
|---|---|
| **Then** | the system loads the corresponding query from `localStorage`, performs a deep copy (via `JSON.parse/JSON.stringify`) into `_editingQuery`, updates `_selectedId`, refreshes the list (highlighting the selected item) and renders the detail panel. |

---

**Source code:** `sparql_editor.js` → `selectQuery()`

### REQ-QRY-004 — Deleting a query

| **If** | the user deletes a query identified by its `id`, |
|---|---|
| **Then** | the system filters the persisted query array to exclude the targeted query, saves the resulting array, and, if the deleted query was the currently selected query, resets the current state (`_selectedId` and `_editingQuery` to `null`) and replaces the detail panel with an empty message. |

---

**Source code:** `sparql_editor.js` → `deleteQuery()`

### REQ-QRY-005 — Search/filtering in the query list

| **If** | the user types a term in the search field, |
|---|---|
| **Then** | the system stores the term in `_searchQuery` and rebuilds the HTML content of the list, keeping only the queries whose concatenation `id + label` contains the term (case-insensitive); if no result matches, the message `'No matching query'` is displayed in place of the list. |

---

**Source code:** `sparql_editor.js` → `_onSearch()`, `renderList()`

### REQ-QRY-006 — Editing a query identifier

| **If** | the user modifies the value of the `sq-id` field of a selected query **and** the input contains spaces, |
|---|---|
| **Then** | the system normalizes the value by replacing spaces with underscores, locates the corresponding entry in `localStorage` by the old identifier, replaces the `id` in the persisted entry, in `_editingQuery` and in `_selectedId`, saves, then refreshes the list. |

---

**Source code:** `sparql_editor.js` → `_onIdChange()`

### REQ-QRY-007 — Editing a query label and comment

| **If** | the user modifies the `sq-label` field (text input) or `sq-comment` field (textarea) and leaves the field, |
|---|---|
| **Then** | the system reads the current values of all form fields (`sq-id`, `sq-label`, `sq-comment`, `sq-distinct`, `sq-orderby`, `sq-orderdir`, `sq-limit`), copies them into `_editingQuery` via `_sync()`, then persists the state via `_saveEditing()`. |

---

**Source code:** `sparql_editor.js` → `_syncAndSave()`, `_sync()`

### REQ-QRY-008 — Adding a triple pattern

| **If** | the user triggers the addition of a pattern of type `triple`, |
|---|---|
| **Then** | the system first synchronizes the form, then pushes into `_editingQuery.patterns` an object `{ type: 'triple', subject: '?x', predicate: 'rdf:type', object: '' }` created by `_newPat()`, saves the state and re-renders the detail panel. |

---

**Source code:** `sparql_editor.js` → `addPattern()`, `_newPat()`

### REQ-QRY-009 — Adding a FILTER pattern

| **If** | the user triggers the addition of a pattern of type `filter`, |
|---|---|
| **Then** | the system adds an object `{ type: 'filter', expr: '' }` to `_editingQuery.patterns` and renders it via `_renderPattern()` as `FILTER ( <expression> )` with a free-text input field for the expression. |

---

**Source code:** `sparql_editor.js` → `addPattern()`, `_newPat()`

### REQ-QRY-010 — Adding an OPTIONAL block

| **If** | the user triggers the addition of a block of type `optional`, |
|---|---|
| **Then** | the system adds an object `{ type: 'optional', patterns: [] }` to `_editingQuery.patterns` and `_renderPattern()` displays this block with its own `OPTIONAL` header and `+ Triple` / `+ Filter` buttons to add internal patterns. |

---

**Source code:** `sparql_editor.js` → `addPattern()`, `_newPat()`

### REQ-QRY-011 — Adding nested patterns inside an OPTIONAL block

| **If** | the user adds a pattern (triple or filter) inside an existing OPTIONAL block at index `outerIdx`, |
|---|---|
| **Then** | the system verifies that the pattern at that index is of type `optional`, adds the new pattern to it via `_newPat()`, and addresses this nested pattern by an array `[outerIdx, innerIdx]` in `_getPat()`. |

---

**Source code:** `sparql_editor.js` → `_addInner()`

### REQ-QRY-012 — Deleting a pattern (root or nested)

| **If** | the user deletes a pattern identified by a simple index (integer), |
|---|---|
| **Then** | the system performs a splice on `q.patterns` to remove the root pattern, saves and re-renders the panel. |

| **If** | the user deletes a pattern identified by an array `[oi, ii]`, |
|---|---|
| **Then** | the system performs a splice on `q.patterns[oi].patterns` to remove the nested pattern from the corresponding OPTIONAL block, saves and re-renders the panel. |

---

**Source code:** `sparql_editor.js` → `deletePattern()`

### REQ-QRY-015 — Object reset on predicate change

| **If** | the user changes the predicate of a triple pattern and the new predicate is `rdf:type` while the old one was not, |
|---|---|
| **Then** | the system clears the `object` field (`''`) and re-renders the panel to switch the object field type. |

| **If** | the user changes the predicate of a triple pattern and moves away from `rdf:type` to another predicate, |
|---|---|
| **Then** | the system resets the `object` field to `'?y'` and re-renders the panel to switch the object field type. |

---

**Source code:** `sparql_editor.js` → `_onPredicateChange()`

### REQ-QRY-016 — Variable autocompletion

| **If** | the ontology is loaded and contains query patterns (including inside nested OPTIONAL blocks), |
|---|---|
| **Then** | the system recursively traverses all patterns, collects into a `Set` all `subject` and `object` values starting with `?`, and exposes these variables via a `<datalist id="sq-vars-list">` element referenced by the `subject`, `object` and `order_by` fields. |

---

**Source code:** `sparql_editor.js` → `_collectVars()`, `_renderForm()`

### REQ-QRY-017 — Query options: DISTINCT, ORDER BY, LIMIT

| **If** | the user configures the query options (checkbox `sq-distinct`, field `sq-orderby` with direction `sq-orderdir`, numeric field `sq-limit`), |
|---|---|
| **Then** | the system persists these values in the model and `_buildSparql()` integrates them respectively as `SELECT DISTINCT`, `ORDER BY DIR(?var)` and `LIMIT N` in the generated SPARQL query (the `sq-limit` value is an integer with a default of 100 and a maximum of 100000). |

---

**Source code:** `sparql_editor.js` → `_sync()`, `_buildSparql()`

### REQ-QRY-019 — Automatic generation of SPARQL prefixes

| **If** | a SPARQL query is generated, |
|---|---|
| **Then** | the system systematically injects the prefixes `rdf:`, `rdfs:` and `owl:`; if the current ontology (`APP.state.ontology`) has a `prefix` and an `id` (base IRI), a fourth prefix `PREFIX <prefix>: <IRI#>` is added (the `#` separator is omitted if the IRI already ends with `#` or `/`). |

---

**Source code:** `sparql_editor.js` → `_buildSparql()`

### REQ-QRY-020 — Handling non-variable literals with FILTER(STR(...))

| **If** | a triple pattern carries a literal-type predicate (`rdfs:label`, `rdfs:comment`, or a Datatype Property) **and** the object value is neither a variable (`?`), nor already quoted, |
|---|---|
| **Then** | the system generates an intermediate variable `?_lvN` in the triple clause and automatically adds a `FILTER ( STR(?_lvN) = "value" )` clause to compare the value independently of the RDF language tag. |

---

**Source code:** `sparql_editor.js` → `_buildSparql()` (internal function `patToLines`)

### REQ-QRY-021 — Query execution via the API

| **If** | the user triggers the execution of the current query, |
|---|---|
| **Then** | the system:<br>- synchronizes the form and generates the SPARQL query,<br>- displays a status `Running…` and automatically exposes the SPARQL preview,<br>- sends the query as POST to `/api/sparql` with content-type `application/x-www-form-urlencoded` (parameter `query`),<br>- displays the number of results (`bindings.length`) in `sq-status` on success,<br>- or propagates the server error text in case of a non-OK response. |

---

**Source code:** `sparql_editor.js` → `runQuery()`

### REQ-QRY-026 — Restoring the current selection

| **If** | the user returns to the queries tab, |
|---|---|
| **Then** | the system reinitializes the resize handle via `_initSplitHandle()` and, if `_selectedId` is defined, calls `selectQuery(_selectedId)` again to redisplay the detail panel of the last selected query. |

---

## 2. Form — Presentation and UI

> Requirements related to display: layout, visual components, interactions, navigation, styles.

**Source code:** `sparql_editor.js` → `restoreSelection()`

### REQ-QRY-013 — Predicate selection via hierarchical dropdown

| **If** | the user opens the predicate selector of a triple pattern, |
|---|---|
| **Then** | the system presents a custom dropdown organized into four groups (`rdf:type` / Classes, Object Properties, Datatype Properties, Annotation Properties including `rdfs:label` and `rdfs:comment`), each group sorted according to the `subPropertyOf` hierarchy in alphabetical DFS with depth management, and each entry displaying a color-coded icon by property type. |

---

**Source code:** `sparql_editor.js` → `_predGroups()`, `_propTreeItems()`, `_ddBuild()`

### REQ-QRY-014 — Adaptive object field based on predicate

| **If** | the predicate of a triple pattern is `rdf:type`, |
|---|---|
| **Then** | the system displays a class tree dropdown (`_buildClsDd()`). |

| **If** | the predicate is `rdfs:label`, `rdfs:comment` or a Datatype Property, |
|---|---|
| **Then** | the system displays a full-width text field with the placeholder `?var or literal value`. |

| **If** | the predicate is an Object Property, an annotation property or an unknown value, |
|---|---|
| **Then** | the system displays a 95px text field with the placeholder `?var or IRI`. |

---

**Source code:** `sparql_editor.js` → `_objectField()`

### REQ-QRY-018 — Generated SPARQL preview

| **If** | the user toggles the visibility of the SPARQL preview panel, |
|---|---|
| **Then** | the system updates the button label (`▼ Show` / `▲ Hide`), stores the state in `_showSparql`, and shows or hides the `<pre>` content of the generated query; on refresh via `_refreshSparqlPreview()`, the system calls `_sync()` then `_buildSparql()` and injects the text into `sq-sparql-preview` without re-rendering the entire form. |

---

**Source code:** `sparql_editor.js` → `_toggleSparql()`, `_refreshSparqlPreview()`

### REQ-QRY-022 — Displaying results in a table

| **If** | a SPARQL query returns results, |
|---|---|
| **Then** | the system generates an HTML table with:<br>- variable names as column headers,<br>- one row per binding with hover highlighting and alternating background on even/odd rows,<br>- a dash (`—`) in cells with no value,<br>- the language tag displayed as superscript (e.g. `@fr`) for literal values carrying an `xml:lang` attribute. |

---

**Source code:** `sparql_editor.js` → `_renderResults()`

### REQ-QRY-023 — Navigating to an entity from results

| **If** | a result cell contains a URI recognized in `APP.state` (among classes, individuals, object properties, datatype properties or annotation properties), |
|---|---|
| **Then** | the system renders the cell as a clickable link with the entity's color-coded icon and display name; on click, `navigateToEntity(uri)` calls `APP.navigate(section)` then, after 150 ms, the selection function specific to the relevant editor (`ClassEditor.selectClass`, `IndividualEditor.selectIndividual`, `OPEditor.selectProp`, `DPEditor.selectProp`, `APEditor.selectProp`). |

---

**Source code:** `sparql_editor.js` → `_resolveEntity()`, `navigateToEntity()`, `_renderResults()`

### REQ-QRY-024 — External link for unrecognized URIs in results

| **If** | a result cell is of type `uri` **and** `_resolveEntity()` returns no match in the application, |
|---|---|
| **Then** | the system generates an `<a href="..." target="_blank">` tag displaying the local part of the URI, allowing the external resource to be opened in a new tab. |

---

**Source code:** `sparql_editor.js` → `_renderResults()`

### REQ-QRY-025 — List panel resizing

| **If** | the user drags the `sparql-split-h` handle to resize the list panel, |
|---|---|
| **Then** | the system constrains the width of the `sparql-list-panel` panel between 120 px and 400 px, adds the CSS class `resizing` to the `body` for the entire duration of the drag, and removes this class at the end of the drag; the `mousedown`/`mousemove`/`mouseup` listeners are attached only once (flag `_bound`). |

**Source code:** `sparql_editor.js` → `_initSplitHandle()`
