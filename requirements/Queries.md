# Requirements for the Queries Tab — SWOWL

**Date:** 2026-06-06
**Note:** Requirements derived strictly from the source code (`sparql_editor.js`)

---

## Table of Contents

1. [REQ-QRY-001 — Query persistence per ontology](#req-qry-001-query-persistence-per-ontology)
2. [REQ-QRY-002 — Creating a new query](#req-qry-002-creating-a-new-query)
3. [REQ-QRY-003 — Selecting an existing query](#req-qry-003-selecting-an-existing-query)
4. [REQ-QRY-004 — Deleting a query](#req-qry-004-deleting-a-query)
5. [REQ-QRY-005 — Search/filtering in the query list](#req-qry-005-searchfiltering-in-the-query-list)
6. [REQ-QRY-006 — Editing a query identifier](#req-qry-006-editing-a-query-identifier)
7. [REQ-QRY-007 — Editing a query label and comment](#req-qry-007-editing-a-query-label-and-comment)
8. [REQ-QRY-008 — Adding a triple pattern](#req-qry-008-adding-a-triple-pattern)
9. [REQ-QRY-009 — Adding a FILTER pattern](#req-qry-009-adding-a-filter-pattern)
10. [REQ-QRY-010 — Adding an OPTIONAL block](#req-qry-010-adding-an-optional-block)
11. [REQ-QRY-011 — Adding nested patterns inside an OPTIONAL block](#req-qry-011-adding-nested-patterns-inside-an-optional-block)
12. [REQ-QRY-012 — Deleting a pattern (root or nested)](#req-qry-012-deleting-a-pattern-root-or-nested)
13. [REQ-QRY-013 — Predicate selection via hierarchical dropdown menu](#req-qry-013-predicate-selection-via-hierarchical-dropdown-menu)
14. [REQ-QRY-014 — Adaptive object field based on predicate](#req-qry-014-adaptive-object-field-based-on-predicate)
15. [REQ-QRY-015 — Object reset on predicate change](#req-qry-015-object-reset-on-predicate-change)
16. [REQ-QRY-016 — Variable autocomplete](#req-qry-016-variable-autocomplete)
17. [REQ-QRY-017 — Query options: DISTINCT, ORDER BY, LIMIT](#req-qry-017-query-options-distinct-order-by-limit)
18. [REQ-QRY-018 — Generated SPARQL preview](#req-qry-018-generated-sparql-preview)
19. [REQ-QRY-019 — Automatic SPARQL prefix generation](#req-qry-019-automatic-sparql-prefix-generation)
20. [REQ-QRY-020 — Handling non-variable literals with FILTER(STR(...))](#req-qry-020-handling-non-variable-literals-with-filterstr)
21. [REQ-QRY-021 — Query execution via the API](#req-qry-021-query-execution-via-the-api)
22. [REQ-QRY-022 — Displaying results in a table](#req-qry-022-displaying-results-in-a-table)
23. [REQ-QRY-023 — Navigating to an entity from the results](#req-qry-023-navigating-to-an-entity-from-the-results)
24. [REQ-QRY-024 — External link for unrecognised URIs in the results](#req-qry-024-external-link-for-unrecognised-uris-in-the-results)
25. [REQ-QRY-025 — List panel resizing](#req-qry-025-list-panel-resizing)
26. [REQ-QRY-026 — Restoring the current selection](#req-qry-026-restoring-the-current-selection)

---

### REQ-QRY-001 — Query persistence per ontology

**Source code:** `sparql_editor.js` → `_storeKey()`, `_loadAll()`, `_saveAll()`

Queries are persisted in the browser's `localStorage`. The storage key is built dynamically in the form `swowl_sparql_<ontologyId>`, which isolates each ontology's queries. `_loadAll()` parses the stored JSON (returns `[]` on error), `_saveAll()` serialises and rewrites the full array.

---

### REQ-QRY-002 — Creating a new query

**Source code:** `sparql_editor.js` → `newQuery()`, `_emptyQuery()`

`newQuery()` generates a unique identifier of the form `QueryN` (incrementing N until no duplicate is found), creates an empty query object via `_emptyQuery()` with the fields `id`, `label`, `comment`, `distinct: false`, `patterns: []`, `order_by: ''`, `order_dir: 'ASC'`, `limit: 100`, adds it to `localStorage`, then immediately selects and displays this new query.

---

### REQ-QRY-003 — Selecting an existing query

**Source code:** `sparql_editor.js` → `selectQuery()`

`selectQuery(id)` loads the corresponding query from `localStorage`, makes a deep copy (via `JSON.parse/JSON.stringify`) into `_editingQuery`, updates `_selectedId`, refreshes the list (highlighting) and renders the detail panel.

---

### REQ-QRY-004 — Deleting a query

**Source code:** `sparql_editor.js` → `deleteQuery()`

`deleteQuery(id)` filters the persisted query array to exclude the target query, saves the resulting array, and, if the deleted query was selected, resets the current state (`_selectedId`, `_editingQuery` to `null`) and replaces the detail panel with an empty message.

---

### REQ-QRY-005 — Search/filtering in the query list

**Source code:** `sparql_editor.js` → `_onSearch()`, `renderList()`

`_onSearch(val)` stores the entered term in `_searchQuery` and rebuilds the list's HTML content. `renderList()` filters queries whose concatenated `id + label` contains the term (case-insensitive). If no results are found, a `'No matching query'` message is displayed.

---

### REQ-QRY-006 — Editing a query identifier

**Source code:** `sparql_editor.js` → `_onIdChange()`

`_onIdChange(val)` intercepts changes to the `sq-id` input. It locates the corresponding entry in `localStorage` by the old identifier, replaces the `id` of the persisted entry, of `_editingQuery` and of `_selectedId`, saves, then refreshes the list. The `oninput` field normalises the value by replacing spaces with underscores.

---

### REQ-QRY-007 — Editing a query label and comment

**Source code:** `sparql_editor.js` → `_syncAndSave()`, `_sync()`

The `sq-label` (text input) and `sq-comment` (textarea) fields trigger `_syncAndSave()` on their `onchange` event. `_sync()` reads the current values of all form fields (`sq-id`, `sq-label`, `sq-comment`, `sq-distinct`, `sq-orderby`, `sq-orderdir`, `sq-limit`) and copies them into `_editingQuery`, then `_saveEditing()` persists the state.

---

### REQ-QRY-008 — Adding a triple pattern

**Source code:** `sparql_editor.js` → `addPattern()`, `_newPat()`

`addPattern('triple')` first synchronises the form, then pushes into `_editingQuery.patterns` an object `{ type: 'triple', subject: '?x', predicate: 'rdf:type', object: '' }` created by `_newPat()`, saves and re-renders the detail panel.

---

### REQ-QRY-009 — Adding a FILTER pattern

**Source code:** `sparql_editor.js` → `addPattern()`, `_newPat()`

`addPattern('filter')` adds an object `{ type: 'filter', expr: '' }` to `_editingQuery.patterns`. The pattern is rendered by `_renderPattern()` as `FILTER ( <expression> )` with a free-form input field for the expression.

---

### REQ-QRY-010 — Adding an OPTIONAL block

**Source code:** `sparql_editor.js` → `addPattern()`, `_newPat()`

`addPattern('optional')` adds an object `{ type: 'optional', patterns: [] }` to `_editingQuery.patterns`. `_renderPattern()` displays this block with its own `OPTIONAL` header and `+ Triple` / `+ Filter` buttons for adding inner patterns.

---

### REQ-QRY-011 — Adding nested patterns inside an OPTIONAL block

**Source code:** `sparql_editor.js` → `_addInner()`

`_addInner(outerIdx, type)` verifies that the pattern at index `outerIdx` is of type `optional`, then adds a new pattern (triple or filter) to it via `_newPat()`. Nested addressing uses an array `[outerIdx, innerIdx]` to identify patterns within `_getPat()`.

---

### REQ-QRY-012 — Deleting a pattern (root or nested)

**Source code:** `sparql_editor.js` → `deletePattern()`

`deletePattern(idx)` accepts a simple index (integer) for a root pattern (splice on `q.patterns`) or an array `[oi, ii]` for a pattern nested inside an OPTIONAL (splice on `q.patterns[oi].patterns`). Saving and re-rendering the panel are performed after each deletion.

---

### REQ-QRY-013 — Predicate selection via hierarchical dropdown menu

**Source code:** `sparql_editor.js` → `_predGroups()`, `_propTreeItems()`, `_ddBuild()`

`_predGroups()` builds four predicate groups: `rdf:type` (Classes), Object Properties, Datatype Properties, Annotation Properties (including `rdfs:label` and `rdfs:comment`). `_propTreeItems()` orders each group according to the `subPropertyOf` hierarchy in alphabetical DFS with depth handling. `_ddBuild()` generates the HTML of the custom dropdown component with icons colour-coded by property type.

---

### REQ-QRY-014 — Adaptive object field based on predicate

**Source code:** `sparql_editor.js` → `_objectField()`

`_objectField(p, idx)` selects the object field type based on the predicate value:
- `rdf:type` → class tree dropdown (`_buildClsDd()`)
- `rdfs:label`, `rdfs:comment`, or a Datatype Property → full-width text field with placeholder `?var or literal value`
- Other (Object Property, annotation, unknown) → 95px text field with placeholder `?var or IRI`

---

### REQ-QRY-015 — Object reset on predicate change

**Source code:** `sparql_editor.js` → `_onPredicateChange()`

`_onPredicateChange(idx, val)` updates the pattern's predicate and applies two reset rules: if the new predicate is `rdf:type` and the previous one was not, `object` is cleared (`''`); if leaving `rdf:type`, `object` is reset to `'?y'`. The panel is fully re-rendered to swap the object field type.

---

### REQ-QRY-016 — Variable autocomplete

**Source code:** `sparql_editor.js` → `_collectVars()`, `_renderForm()`

`_collectVars(patterns)` recursively traverses all patterns (including those nested inside OPTIONALs) and collects into a `Set` all `subject` and `object` values beginning with `?`. These variables are exposed via a `<datalist id="sq-vars-list">` element referenced by the `subject`, `object` and `order_by` fields.

---

### REQ-QRY-017 — Query options: DISTINCT, ORDER BY, LIMIT

**Source code:** `sparql_editor.js` → `_sync()`, `_buildSparql()`

The form exposes three options persisted in the model: a `sq-distinct` checkbox (boolean), a `sq-orderby` text field with variable autocomplete and a `sq-orderdir` selector (`ASC`/`DESC`), a `sq-limit` numeric field (integer, default 100, max 100000). `_buildSparql()` integrates them respectively as `SELECT DISTINCT`, `ORDER BY DIR(?var)` and `LIMIT N`.

---

### REQ-QRY-018 — Generated SPARQL preview

**Source code:** `sparql_editor.js` → `_toggleSparql()`, `_refreshSparqlPreview()`

A collapsible `SPARQL` panel (state stored in `_showSparql`) displays the generated query in a `<pre>` element. `_toggleSparql()` toggles visibility and updates the label `▼ Show` / `▲ Hide`. `_refreshSparqlPreview()` calls `_sync()` then `_buildSparql()` and injects the text into `sq-sparql-preview` without re-rendering the entire form.

---

### REQ-QRY-019 — Automatic SPARQL prefix generation

**Source code:** `sparql_editor.js` → `_buildSparql()`

`_buildSparql()` systematically injects the `rdf:`, `rdfs:` and `owl:` prefixes. If the current ontology (`APP.state.ontology`) has a `prefix` and an `id` (base IRI), a fourth prefix `PREFIX <prefix>: <IRI#>` is added (the `#` separator is omitted if the IRI already ends with `#` or `/`).

---

### REQ-QRY-020 — Handling non-variable literals with FILTER(STR(...))

**Source code:** `sparql_editor.js` → `_buildSparql()` (inner function `patToLines`)

When a triple pattern carries a literal-type predicate (`rdfs:label`, `rdfs:comment`, or a Datatype Property) and the object value is neither a variable (`?`) nor already quoted, `_buildSparql()` generates an intermediate variable `?_lvN` and automatically adds a `FILTER ( STR(?_lvN) = "value" )` clause to compare independently of the RDF language tag.

---

### REQ-QRY-021 — Query execution via the API

**Source code:** `sparql_editor.js` → `runQuery()`

`runQuery()` synchronises the form, generates the SPARQL query, displays a `Running…` status, automatically exposes the SPARQL preview, then sends the query as a POST to `/api/sparql` with content-type `application/x-www-form-urlencoded` (parameter `query`). On a non-OK response, the server error text is propagated. The number of results (`bindings.length`) is displayed in `sq-status` on success.

---

### REQ-QRY-022 — Displaying results in a table

**Source code:** `sparql_editor.js` → `_renderResults()`

`_renderResults(vars, bindings)` generates an HTML table with: variable names as column headers, one row per binding with hover highlighting and alternating background on even/odd rows. Cells with no value display a dash (`—`). Literal values with a language tag (`xml:lang`) display the tag as a superscript (e.g. `@fr`).

---

### REQ-QRY-023 — Navigating to an entity from the results

**Source code:** `sparql_editor.js` → `_resolveEntity()`, `navigateToEntity()`, `_renderResults()`

`_resolveEntity(uri)` extracts the local part of the URI (after `#` or `/`) and searches for a match in `APP.state` among classes, individuals, object properties, datatype properties and annotation properties. If a match is found, `_renderResults()` renders the cell as a clickable link with the entity's colour-coded icon and display name. `navigateToEntity(uri)` calls `APP.navigate(section)` then, after 150 ms, the selection function specific to the relevant editor (`ClassEditor.selectClass`, `IndividualEditor.selectIndividual`, `OPEditor.selectProp`, `DPEditor.selectProp`, `APEditor.selectProp`).

---

### REQ-QRY-024 — External link for unrecognised URIs in the results

**Source code:** `sparql_editor.js` → `_renderResults()`

For cells of type `uri` for which `_resolveEntity()` returns no match in the application, `_renderResults()` generates an `<a href="..." target="_blank">` tag displaying the local part of the URI, allowing the external resource to be opened in a new tab.

---

### REQ-QRY-025 — List panel resizing

**Source code:** `sparql_editor.js` → `_initSplitHandle()`

`_initSplitHandle()` attaches once (flag `_bound`) `mousedown`/`mousemove`/`mouseup` listeners to the `sparql-split-h` handle. During dragging, the width of the `sparql-list-panel` panel is constrained between 120 px and 400 px. The CSS class `resizing` is added to the `body` during dragging.

---

### REQ-QRY-026 — Restoring the current selection

**Source code:** `sparql_editor.js` → `restoreSelection()`

`restoreSelection()` is called when returning to the tab. It reinitialises the resize handle via `_initSplitHandle()` and, if `_selectedId` is defined, calls `selectQuery(_selectedId)` again to redisplay the detail panel of the last selected query.

---

*— Document generated by claude-sonnet-4-6*
