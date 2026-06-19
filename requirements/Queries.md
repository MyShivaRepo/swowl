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
- [REQ-QRY-015 — Resetting the object when the predicate changes](#req-qry-015--resetting-the-object-when-the-predicate-changes)
- [REQ-QRY-016 — Variable autocompletion](#req-qry-016--variable-autocompletion)
- [REQ-QRY-017 — Query options: DISTINCT, ORDER BY, LIMIT](#req-qry-017--query-options-distinct-order-by-limit)
- [REQ-QRY-019 — Automatic generation of SPARQL prefixes](#req-qry-019--automatic-generation-of-sparql-prefixes)
- [REQ-QRY-020 — Handling non-variable literals with FILTER(STR(...))](#req-qry-020--handling-non-variable-literals-with-filterstr)
- [REQ-QRY-021 — Executing the query via the API](#req-qry-021--executing-the-query-via-the-api)
- [REQ-QRY-026 — Restoring the current selection](#req-qry-026--restoring-the-current-selection)

### Form
- [REQ-QRY-013 — Predicate selection via hierarchical dropdown](#req-qry-013--predicate-selection-via-hierarchical-dropdown)
- [REQ-QRY-014 — Adaptive object field based on the predicate](#req-qry-014--adaptive-object-field-based-on-the-predicate)
- [REQ-QRY-018 — Generated SPARQL preview](#req-qry-018--generated-sparql-preview)
- [REQ-QRY-022 — Displaying results in a table](#req-qry-022--displaying-results-in-a-table)
- [REQ-QRY-023 — Navigating to an entity from the results](#req-qry-023--navigating-to-an-entity-from-the-results)
- [REQ-QRY-024 — External link for unrecognized URIs in results](#req-qry-024--external-link-for-unrecognized-uris-in-results)
- [REQ-QRY-025 — Resizing the list panel](#req-qry-025--resizing-the-list-panel)
- [REQ-QRY-027 — Deleting a pattern via a red cross](#req-qry-027--deleting-a-pattern-via-a-red-cross)
- [REQ-QRY-028 — Reordering patterns by drag-and-drop](#req-qry-028--reordering-patterns-by-drag-and-drop)
- [REQ-QRY-029 — Homogeneous class picker for `rdf:type` objects](#req-qry-029--homogeneous-class-picker-for-rdftype-objects)

---

## 1. Substance — Business logic and functional rules

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviors, validations, persistence.


### REQ-QRY-001 — Query persistence per ontology

| **If** | the user works on several distinct `ontologies`, |
|---|---|
| **Then** | the `queries` of each `ontology` are isolated from one another and persist between sessions, with no risk of mixing or loss upon application reload. |

---

**Source code:** `sparql_editor.js` → `_storeKey()`, `_loadAll()`, `_saveAll()` — Uses the browser's `localStorage` with a dynamically constructed key of the form `swowl_sparql_<ontologyId>` to isolate queries per ontology; `_loadAll()` parses the stored JSON (returns `[]` on deserialization error) and `_saveAll()` serializes and rewrites the full array.

### REQ-QRY-002 — Creating a new query

| **If** | the user wishes to formulate a new `query` on the current `ontology`, |
|---|---|
| **Then** | they can create a blank `query` with a unique identifier, ready to be configured and executed, without having to manually enter an identifier or fill in optional fields. |

---

**Source code:** `sparql_editor.js` → `newQuery()`, `_emptyQuery()` — Generates a unique identifier of the form `QueryN` (incrementing N until no duplicate exists), creates an empty query object via `_emptyQuery()` with fields `id`, `label`, `comment`, `distinct: false`, `patterns: []`, `order_by: ''`, `order_dir: 'ASC'`, `limit: 100`, adds it to `localStorage`, then immediately selects and displays this new query.

### REQ-QRY-003 — Selecting an existing query

| **If** | the user selects a `query` from the list of saved `queries`, |
|---|---|
| **Then** | the full detail of that `query` is displayed in the editing panel, reflecting exactly the persisted state, without altering other `queries`. |

---

**Source code:** `app.js` → `APP.renderQueries()`, `sparql_editor.js` → `renderSplit()`, `renderList()`, `selectQuery()` — The saved queries are displayed directly in the "Queries" tab: `APP.renderQueries()` simply renders `SparqlEditor.renderSplit()` with no vertical sidebar of its own (the former "SPARQL VizQ" sub-bar internal to the tab has been removed; persistent storage is unchanged). Each query in `renderList()` is shown with a magnifying-glass icon 🔎. On selection, `selectQuery()` loads the query from `localStorage`, performs a deep copy (via `JSON.parse/JSON.stringify`) into `_editingQuery`, updates `_selectedId`, refreshes the list (highlighting the selected item) and renders the detail panel.

### REQ-QRY-004 — Deleting a query

| **If** | the user deletes a `query` from the list, |
|---|---|
| **Then** | the `query` is permanently removed from the persisted list, and if it was the `query` currently being edited, the detail panel is cleared. |

---

**Source code:** `sparql_editor.js` → `deleteSelected()`, `deleteQuery()` — Deletion is triggered from a red trash-can button placed in the panel toolbar (to the right of the "+" button), which acts on the selected quer(y/ies) via `deleteSelected()` (it is no longer a per-row control facing each query). The underlying logic filters the persisted query array to exclude the targeted query, saves the resulting array, and, if the deleted query was selected, resets `_selectedId` and `_editingQuery` to `null` and replaces the detail panel with an empty message.

### REQ-QRY-005 — Search/filtering in the query list

| **If** | the user types a term in the `query` list search field, |
|---|---|
| **Then** | only `queries` whose identifier or label contains that term are displayed; if no `query` matches, an explicit message indicates this. |

---

**Source code:** `sparql_editor.js` → `_onSearch()`, `renderList()` — Stores the term in `_searchQuery` and rebuilds the HTML content of the list keeping only queries whose concatenation `id + label` contains the term (case-insensitive); if no result matches, displays the message `'No matching query'`.

### REQ-QRY-006 — Editing a query identifier

| **If** | the user modifies the identifier of a `query` and the input contains spaces, |
|---|---|
| **Then** | spaces are automatically replaced by underscores to ensure identifier validity, and the list is updated accordingly. |

---

**Source code:** `sparql_editor.js` → `_onIdChange()` — Normalizes the value by replacing spaces with underscores, locates the corresponding entry in `localStorage` by the old identifier, replaces the `id` in the persisted entry, in `_editingQuery` and in `_selectedId`, saves, then refreshes the list.

### REQ-QRY-007 — Editing a query label and comment

| **If** | the user modifies the label or comment of a `query` and leaves the field, |
|---|---|
| **Then** | the changes are automatically saved without any additional action from the user. |

---

**Source code:** `sparql_editor.js` → `_syncAndSave()`, `_sync()` — Reads the current values of all form fields (`sq-id`, `sq-label`, `sq-comment`, `sq-distinct`, `sq-orderby`, `sq-orderdir`, `sq-limit`), copies them into `_editingQuery` via `_sync()`, then persists the state via `_saveEditing()`.

### REQ-QRY-008 — Adding a triple pattern

| **If** | the user wishes to add a subject-predicate-object condition to the current `query`, |
|---|---|
| **Then** | a new triple pattern is added to the `query` with default values allowing input to begin immediately. |

---

**Source code:** `sparql_editor.js` → `addPattern()`, `_newPat()` — First synchronizes the form, then pushes into `_editingQuery.patterns` an object `{ type: 'triple', subject: '?x', predicate: 'rdf:type', object: '' }`, saves the state and re-renders the detail panel.

### REQ-QRY-009 — Adding a FILTER pattern

| **If** | the user wishes to add a filtering condition to the current `query`, |
|---|---|
| **Then** | a new FILTER pattern is added to the `query` with a free-text input field to express the condition. |

---

**Source code:** `sparql_editor.js` → `addPattern()`, `_newPat()` — Adds an object `{ type: 'filter', expr: '' }` to `_editingQuery.patterns` and renders it via `_renderPattern()` in the form `FILTER ( <expression> )`.

### REQ-QRY-010 — Adding an OPTIONAL block

| **If** | the user wishes to express optional conditions in the current `query`, |
|---|---|
| **Then** | an empty OPTIONAL block is added to the `query`, inside which they can then add triple or FILTER patterns independently. |

---

**Source code:** `sparql_editor.js` → `addPattern()`, `_newPat()` — Adds an object `{ type: 'optional', patterns: [] }` to `_editingQuery.patterns` and `_renderPattern()` displays this block with its `OPTIONAL` header and `+ Triple` / `+ Filter` buttons to add inner patterns.

### REQ-QRY-011 — Adding nested patterns inside an OPTIONAL block

| **If** | the user adds a triple or FILTER pattern inside an existing OPTIONAL block, |
|---|---|
| **Then** | the new pattern is properly attached to the concerned OPTIONAL block and not to the root of the `query`. |

---

**Source code:** `sparql_editor.js` → `_addInner()` — Verifies that the pattern at index `outerIdx` is of type `optional`, adds the new pattern to it via `_newPat()`, and addresses this nested pattern by an array `[outerIdx, innerIdx]` in `_getPat()`.

### REQ-QRY-012 — Deleting a pattern (root or nested)

| **If** | the user deletes a pattern located directly in the `query` (root level), |
|---|---|
| **Then** | that pattern is removed from the `query` and the panel is updated. |

| **If** | the user deletes a pattern located inside an OPTIONAL block, |
|---|---|
| **Then** | only that nested pattern is removed from the OPTIONAL block that contains it, without affecting other patterns. |

---

**Source code:** `sparql_editor.js` → `deletePattern()` — For a simple index (integer): performs a splice on `q.patterns` to remove the root pattern. For an array index `[oi, ii]`: performs a splice on `q.patterns[oi].patterns` to remove the pattern nested in the corresponding OPTIONAL block. In both cases, saves and re-renders the panel.

### REQ-QRY-015 — Resetting the object when the predicate changes

| **If** | the user changes the predicate of a triple pattern to set it to `rdf:type`, |
|---|---|
| **Then** | the object field is cleared in order to invite the user to select a class rather than a variable. |

| **If** | the user changes the predicate of a triple pattern from `rdf:type` to another predicate, |
|---|---|
| **Then** | the object field is reset to a default variable in order to provide a starting point consistent with the new predicate. |

---

**Source code:** `sparql_editor.js` → `_onPredicateChange()` — If the new predicate is `rdf:type` and the old one was not: clears the `object` field (`''`) and re-renders the panel. If the user moves away from `rdf:type` to another predicate: resets the `object` field to `'?y'` and re-renders the panel.

### REQ-QRY-016 — Variable autocompletion

| **If** | the `ontology` is loaded and the current `query` contains variables defined in patterns (including those nested in OPTIONAL blocks), |
|---|---|
| **Then** | these variables are offered as autocompletion suggestions in the subject, object and sort fields, facilitating `query` consistency. |

---

**Source code:** `sparql_editor.js` → `_collectVars()`, `_renderForm()` — Recursively traverses all patterns, collects into a `Set` all `subject` and `object` values starting with `?`, and exposes these variables via a `<datalist id="sq-vars-list">` element referenced by the `subject`, `object` and `order_by` fields.

### REQ-QRY-017 — Query options: DISTINCT, ORDER BY, LIMIT

| **If** | the user configures result formatting options (duplicate elimination, sorting, result count limitation), |
|---|---|
| **Then** | these options are integrated into the generated SPARQL `query` and persist with the `query`. |

---

**Source code:** `sparql_editor.js` → `_sync()`, `_buildSparql()` — Persists the values `distinct`, `order_by`, `order_dir` and `limit` in the model; `_buildSparql()` integrates them respectively as `SELECT DISTINCT`, `ORDER BY DIR(?var)` and `LIMIT N` (the `sq-limit` value is an integer with a default of 100 and a maximum of 100000).

### REQ-QRY-019 — Automatic generation of SPARQL prefixes

| **If** | a SPARQL `query` is generated for an `ontology` that has a declared prefix, |
|---|---|
| **Then** | the standard prefixes (`rdf:`, `rdfs:`, `owl:`) as well as the prefix specific to the `ontology` are automatically included in the `query`, without the user having to enter them manually. |

---

**Source code:** `sparql_editor.js` → `_buildSparql()` — Systematically injects the prefixes `rdf:`, `rdfs:` and `owl:`; if the current ontology (`APP.state.ontology`) has a `prefix` and an `id` (base IRI), adds a fourth prefix `PREFIX <prefix>: <IRI#>` (the `#` separator is omitted if the IRI already ends with `#` or `/`).

### REQ-QRY-020 — Handling non-variable literals with FILTER(STR(...))

| **If** | the user enters a literal value (non-variable) in the object field of a pattern bearing an `annotation property` or `datatype property` predicate, |
|---|---|
| **Then** | the comparison is performed independently of the RDF language tag, avoiding false negatives caused by tagged literals. |

---

**Source code:** `sparql_editor.js` → `_buildSparql()` (internal function `patToLines`) — For a literal-type predicate (`rdfs:label`, `rdfs:comment`, or a Datatype Property) whose object value is neither a variable (`?`) nor already enclosed in quotes: generates an intermediate variable `?_lvN` in the triple clause and automatically adds a `FILTER ( STR(?_lvN) = "value" )` clause.

### REQ-QRY-021 — Executing the query via the API

| **If** | the user launches the execution of the current `query`, |
|---|---|
| **Then** | the `query` is sent to the SPARQL endpoint, a progress indicator is displayed during execution, then the number of results obtained is shown on success, or the server error message is displayed on failure. |

---

**Source code:** `sparql_editor.js` → `runQuery()` — Synchronizes the form and generates the SPARQL query, displays a status of `Running…` and automatically exposes the SPARQL preview, sends the query via POST to `/api/sparql` with content-type `application/x-www-form-urlencoded` (parameter `query`), displays `bindings.length` in `sq-status` after success, or propagates the server error text in case of a non-OK response.

### REQ-QRY-026 — Restoring the current selection

| **If** | the user returns to the `queries` tab after having navigated elsewhere in the application, |
|---|---|
| **Then** | the last `query` they were viewing is automatically redisplayed in the detail panel, without them having to search for and select it again. |

---

**Source code:** `sparql_editor.js` → `restoreSelection()` — Reinitializes the resize handle via `_initSplitHandle()` and, if `_selectedId` is defined, calls `selectQuery(_selectedId)` again to redisplay the detail panel of the last selected query.

---

## 2. Form — Presentation and user interface

> Requirements relating to display: layout, visual components, interactions, navigation, styles.

### REQ-QRY-013 — Predicate selection via hierarchical dropdown

| **If** | the user opens the predicate selector of a triple pattern, |
|---|---|
| **Then** | the available predicates are presented organized by category (class type, `object properties`, `datatype properties`, `annotation properties`), respecting the `ontology` hierarchy, with a distinctive icon per `property` type. |

---

**Source code:** `sparql_editor.js` → `_predGroups()`, `_propTreeItems()`, `_ddBuild()` — Presents a custom dropdown organized into four groups (`rdf:type` / Classes, Object Properties, Datatype Properties, Annotation Properties including `rdfs:label` and `rdfs:comment`), each group sorted according to the `subPropertyOf` hierarchy in alphabetical DFS with depth management, each entry displaying a color-coded icon by property type.

### REQ-QRY-014 — Adaptive object field based on the predicate

| **If** | the predicate of a triple pattern is `rdf:type`, |
|---|---|
| **Then** | the object field presents a class tree selector from the `ontology`. |

| **If** | the predicate is an `annotation property` or a `datatype property`, |
|---|---|
| **Then** | the object field presents a wide text field allowing a variable or literal value to be entered. |

| **If** | the predicate is an `object property` or an unrecognized value, |
|---|---|
| **Then** | the object field presents a short text field allowing a variable or IRI to be entered. |

---

**Source code:** `sparql_editor.js` → `_objectField()` — For `rdf:type`: displays a clickable chip opening a `.cls-tree-picker` (class tree + filter) via `_toggleClsPicker()` / `_pickType()`. For `rdfs:label`, `rdfs:comment` or a Datatype Property: displays a full-width text field with the placeholder `?var or literal value`. For Object Properties, annotation properties or unknown values: displays a 95px text field with the placeholder `?var or IRI`.

### REQ-QRY-018 — Generated SPARQL preview

| **If** | the user wishes to `view` the SPARQL `query` corresponding to the patterns they have defined, |
|---|---|
| **Then** | they can show or hide a preview panel displaying the generated SPARQL `query` in real time, without leaving the editing form. |

---

**Source code:** `sparql_editor.js` → `_toggleSparql()`, `_refreshSparqlPreview()` — Updates the button label (`▼ Show` / `▲ Hide`), stores the state in `_showSparql`, and shows or hides the `<pre>` content of the generated query; upon refresh via `_refreshSparqlPreview()`, calls `_sync()` then `_buildSparql()` and injects the text into `sq-sparql-preview` without re-rendering the entire form.

### REQ-QRY-022 — Displaying results in a table

| **If** | a SPARQL `query` returns results, |
|---|---|
| **Then** | the results are displayed in a readable table with variables as column headers, one row per result, and a clear indication for cells without a value; language tags of literals are visible as superscript. |

---

**Source code:** `sparql_editor.js` → `_renderResults()` — Generates an HTML table with variable names as column headers, one row per binding with hover highlighting and alternating background on even/odd rows, a dash (`—`) in cells without a value, and the language tag displayed as superscript (e.g. `@fr`) for literal values carrying an `xml:lang` attribute.

### REQ-QRY-023 — Navigating to an entity from the results

| **If** | a `query` result corresponds to a known entity in the `ontology` (class, `individual`, `property`), |
|---|---|
| **Then** | the user can click on that result to navigate directly to the entity's detail `view` in the corresponding tab of the application. |

---

**Source code:** `sparql_editor.js` → `_resolveEntity()`, `navigateToEntity()`, `_renderResults()` — Renders the cell as a clickable link with the entity's color-coded icon and display name if the URI is recognized in `APP.state` (among classes, individuals, object properties, datatype properties or annotation properties); on click, `navigateToEntity(uri)` calls `APP.navigate(section)` then, after 150 ms, the selection function specific to the relevant editor (`ClassEditor.selectClass`, `IndividualEditor.selectIndividual`, `OPEditor.selectProp`, `DPEditor.selectProp`, `APEditor.selectProp`).

### REQ-QRY-024 — External link for unrecognized URIs in results

| **If** | a `query` result is a URI that does not correspond to any entity in the current `ontology`, |
|---|---|
| **Then** | the user can open that external resource in a new tab by clicking on it. |

---

**Source code:** `sparql_editor.js` → `_renderResults()` — For any cell of type `uri` for which `_resolveEntity()` returns no match in the application: generates an `<a href="..." target="_blank">` tag displaying the local part of the URI.

### REQ-QRY-025 — Resizing the list panel

| **If** | the user wishes to adjust the width of the `query` list panel, |
|---|---|
| **Then** | they can freely resize it by drag-and-drop, within reasonable limits ensuring interface usability. |

---

**Source code:** `sparql_editor.js` → `_initSplitHandle()` — Constrains the width of the `sparql-list-panel` panel between 120 px and 400 px, adds the CSS class `resizing` to the `body` for the entire duration of the drag and removes it at the end; the `mousedown`/`mousemove`/`mouseup` listeners are attached only once (flag `_bound`).

### REQ-QRY-027 — Deleting a pattern via a red cross

| **If** | the user wishes to delete a triple, FILTER or OPTIONAL pattern (root or nested), |
|---|---|
| **Then** | they are provided with a delete control in the form of a **red cross ✕**, positioned right after the element it deletes; this control replaces the former trash-can icon and is consistent with the rest of the application. |

---

**Source code:** `sparql_editor.js` → `_renderPattern()`, `deletePattern()` — Each pattern row displays a red-cross `✕` delete button placed after the element it deletes, triggering `deletePattern()` on the corresponding index (integer for a root pattern, array `[oi, ii]` for a pattern nested in an OPTIONAL block). The red-cross style is shared app-wide.

### REQ-QRY-028 — Reordering patterns by drag-and-drop

| **If** | the user wishes to change the order of the patterns of a `query`, |
|---|---|
| **Then** | each pattern row presents a **drag handle "⠿"** on its left side, allowing them to reorder patterns up or down by drag-and-drop, exactly like reordering atoms in SWRL rules; reordering works both within the root pattern list and inside OPTIONAL blocks. |

---

**Source code:** `sparql_editor.js` → `_renderPattern()` — Each pattern row is equipped with a `⠿` drag handle on the left enabling drag-and-drop; dragging reorders patterns within the root list (`_editingQuery.patterns`) or within an OPTIONAL block's `patterns` array, then saves and re-renders the panel. The mechanism is identical to that used for reordering SWRL rule atoms.

### REQ-QRY-029 — Homogeneous class picker for `rdf:type` objects

| **If** | the user selects a class as the object of a pattern whose predicate is `rdf:type`, |
|---|---|
| **Then** | the class picker presents, at the top, a **Filter** field as well as a class list in **tree mode**, consistently with the other class pickers of the application. |

---

**Source code:** `sparql_editor.js` → `_objectField()` (`rdf:type` branch) — Displays a clickable chip followed by a `.cls-tree-picker` whose items are generated by `_classTreePickerItems('SparqlEditor._pickType')`. `_toggleClsPicker()` opens the picker and adds the `Filter` field at the top via `_decoratePickerWithFilter()` (tree-mode class list); `_pickType()` applies the chosen class to the pattern's object. Consistent with the rest of the application.
