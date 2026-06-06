# Requirements — Ontologies

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-ONT-003 — Sorting ontologies in the registry](#req-ont-003--sorting-ontologies-in-the-registry)
- [REQ-ONT-005 — Auto-selection of the connected ontology](#req-ont-005--auto-selection-of-the-connected-ontology)
- [REQ-ONT-007 — Creating a new ontology](#req-ont-007--creating-a-new-ontology)
- [REQ-ONT-008 — Importing an OWL/TTL ontology](#req-ont-008--importing-an-owlttl-ontology)
- [REQ-ONT-009 — Automatic reading of prefix and URI from a source file](#req-ont-009--automatic-reading-of-prefix-and-uri-from-a-source-file)
- [REQ-ONT-010 — Loading a JSON ontology](#req-ont-010--loading-a-json-ontology)
- [REQ-ONT-011 — Automatic reading of metadata from a JSON file](#req-ont-011--automatic-reading-of-metadata-from-a-json-file)
- [REQ-ONT-013 — Saving changes to an ontology](#req-ont-013--saving-changes-to-an-ontology)
- [REQ-ONT-014 — Connecting an ontology](#req-ont-014--connecting-an-ontology)
- [REQ-ONT-015 — Disconnecting the active ontology](#req-ont-015--disconnecting-the-active-ontology)
- [REQ-ONT-016 — Unregistering an ontology](#req-ont-016--unregistering-an-ontology)
- [REQ-ONT-017 — Downloading built-in W3C ontologies](#req-ont-017--downloading-built-in-w3c-ontologies)
- [REQ-ONT-018 — Exporting an ontology by name (OWL/TTL/SWRL/SWORD)](#req-ont-018--exporting-an-ontology-by-name-owlttlswrlsword)
- [REQ-ONT-020 — Exporting the currently connected ontology](#req-ont-020--exporting-the-currently-connected-ontology)
- [REQ-ONT-024 — Blocking editing tabs when no ontology is connected](#req-ont-024--blocking-editing-tabs-when-no-ontology-is-connected)
- [REQ-ONT-025 — Computing virtual roots based on the ontology prefix](#req-ont-025--computing-virtual-roots-based-on-the-ontology-prefix)
- [REQ-ONT-027 — Implicit OWL import for user ontologies](#req-ont-027--implicit-owl-import-for-user-ontologies)

### Form
- [REQ-ONT-001 — Displaying the Ontologies tab](#req-ont-001--displaying-the-ontologies-tab)
- [REQ-ONT-002 — Loading and displaying the registry](#req-ont-002--loading-and-displaying-the-registry)
- [REQ-ONT-004 — Selecting a row in the registry](#req-ont-004--selecting-a-row-in-the-registry)
- [REQ-ONT-006 — Displaying the ontology counter](#req-ont-006--displaying-the-ontology-counter)
- [REQ-ONT-012 — Editing the attributes of an existing ontology](#req-ont-012--editing-the-attributes-of-an-existing-ontology)
- [REQ-ONT-019 — Export format selection dropdown menu](#req-ont-019--export-format-selection-dropdown-menu)
- [REQ-ONT-021 — Displaying the import tree with expand/collapse](#req-ont-021--displaying-the-import-tree-with-expandcollapse)
- [REQ-ONT-022 — Navigating to a registry entry from the import tree](#req-ont-022--navigating-to-a-registry-entry-from-the-import-tree)
- [REQ-ONT-023 — Opening the directory in Finder](#req-ont-023--opening-the-directory-in-finder)
- [REQ-ONT-026 — Toggleable wizard panel (open/close)](#req-ont-026--toggleable-wizard-panel-openclose)

---

## 1. Substance — Business logic and functional rules

> Requirements independent of the UI: OWL rules, data constraints, algorithms, persistence.


### REQ-ONT-003 — Sorting ontologies in the registry

The table is sorted as follows: user ontologies appear first in alphabetical order (`localeCompare`), then read-only W3C ontologies appear last according to a fixed dependency order (`owl` → `rdfs` → `rdf`, encoded in the `BUILTIN_ORDER` constant).

---

**Source code:** `app.js` → `_refreshOntoTable()`

### REQ-ONT-005 — Auto-selection of the connected ontology

If no manual selection is active (`_selectedOntoName` is null), the function searches the list for the entry whose `connected` field is true and automatically assigns it to `_selectedOntoName`, so that the connected ontology is visually highlighted when the tab loads.

---

**Source code:** `app.js` → `renderOntologies()`

### REQ-ONT-007 — Creating a new ontology

The function reads the wizard form fields (name, directory, prefix, namespace URI), composes the file path (`<dir>/<name>.json`), calls `API.registerOntology({ name, path, uri, prefix })` to register it, then if the "Connect immediately" checkbox is checked, calls `API.connectOntology(name)`. The `name`, `dir`, and `uri` fields are mandatory; their absence triggers an error message and halts processing.

---

**Source code:** `app.js` → `_doNew()`

### REQ-ONT-008 — Importing an OWL/TTL ontology

The function reads the import form fields (source file `.owl`/`.ttl`/`.rdf`, name, destination directory, prefix, URI). It composes the save path (`<dir>/<name>.json`) and calls `API.importFromPath({ name, owl_path, save_path, uri, prefix })`. If the "Connect immediately" checkbox is not checked, it subsequently calls `API.disconnectOntology()`. All five fields are mandatory.

---

**Source code:** `app.js` → `_doImport()`

### REQ-ONT-009 — Automatic reading of prefix and URI from a source file

When the user clicks "Read prefix & URI from file", the function calls `API.peekOntology(src)` with the path of the selected file. The returned values (`info.name`, `info.prefix`, `info.uri`) are automatically injected into the form fields only if those fields are empty (for `name`) or unconditionally (for `prefix` and `uri`).

---

**Source code:** `app.js` → `_wizardImportPeek()`

### REQ-ONT-010 — Loading a JSON ontology

The function reads the load form fields (`.json` file, name, prefix, URI) and calls `API.registerJson(src, name, uri, prefix)`. If the "Connect immediately" checkbox is checked, it subsequently calls `API.connectOntology(name)`. The `src` and `name` fields are mandatory.

---

**Source code:** `app.js` → `_doLoad()`

### REQ-ONT-011 — Automatic reading of metadata from a JSON file

When the user clicks "Read information from file", the function calls `API.peekOntology(src)` and injects the returned values (`info.name`, `info.prefix`, `info.uri`) into the fields `wiz-load-name`, `wiz-load-prefix`, and `wiz-load-uri`, replacing any existing value.

---

**Source code:** `app.js` → `_wizardLoadPeek()`

### REQ-ONT-013 — Saving changes to an ontology

The function reads the edit form fields (original name, new name, directory, prefix, URI), composes the new path (`<dir>/<name>.json`) and calls `API.updateOntologyEntry(origName, { name, path, uri, prefix })`. The `name`, `dir`, and `uri` fields are mandatory.

---

**Source code:** `app.js` → `doSaveEdit()`

### REQ-ONT-014 — Connecting an ontology

The function calls `API.connectOntology(name)`, displays a success message, calls `this.refresh()` to update the global application state, then refreshes the tab display via `renderOntologies()`. The connected ontology row receives the CSS class `onto-current-row` and its indicator changes to a green `●` symbol.

---

**Source code:** `app.js` → `doConnect()`

### REQ-ONT-015 — Disconnecting the active ontology

The function calls `API.disconnectOntology()`, displays a success message, calls `this.refresh()` then re-renders the current section via `renderSection(this.currentSection)`. After disconnection, the editing tabs become inaccessible (see REQ-ONT-024).

---

**Source code:** `app.js` → `doDisconnect()`

### REQ-ONT-016 — Unregistering an ontology

The function requests confirmation via `UI.confirm()` (the message explicitly states that the file on disk will not be deleted). If confirmed, it calls `API.unregisterOntology(name)` to remove the entry from the registry, without touching the physical file.

---

**Source code:** `app.js` → `doUnregister()`

### REQ-ONT-017 — Downloading built-in W3C ontologies

The function disables the "Fetch W3C Ontologies" button during the operation, calls `API.fetchBuiltins()`, and counts in the result the entries whose status contains the string `'fetched'` to display the number of ontologies actually downloaded and registered (RDF, RDFS, OWL from `w3.org`). The button is re-enabled in the `finally` block.

---

**Source code:** `app.js` → `_fetchBuiltins()`

### REQ-ONT-018 — Exporting an ontology by name (OWL/TTL/SWRL/SWORD)

The function calls `API.exportOntologyByName(name, fmt)` and triggers the download of the resulting blob with the filename `<name>.<ext>`. The extension is determined by format: `owl` → `.owl`, `ttl` → `.ttl`, `swrl` → `.json`, `sword` → `.sword`.

---

**Source code:** `app.js` → `exportOntologyByName()`

### REQ-ONT-020 — Exporting the currently connected ontology

The function calls `API.exportOntology(fmt)` (without a name, therefore for the connected ontology) and triggers the download with the generic filename `ontology.<ext>` (`.owl`, `.ttl`, or `.jsonld` depending on the format).

---

**Source code:** `app.js` → `exportOntology()`

### REQ-ONT-024 — Blocking editing tabs when no ontology is connected

Before rendering a section belonging to the list of editing tabs, the function checks `this.state.ontology`. If no ontology is connected, navigation to these tabs is blocked and a message is displayed in `#main-content` with a redirect button to the Ontologies tab (`APP.navigate('ontologies')`).

---

**Source code:** `app.js` → `renderSection()`

### REQ-ONT-025 — Computing virtual roots based on the ontology prefix

The function reads `this.state.ontology?.prefix`. If the prefix is `'rdf'` or `'rdfs'`, it returns `{ classRoot: 'rdfs:Resource', propRoot: 'rdf:Property' }`. In all other cases, it returns `{ classRoot: 'owl:Thing', propRoot: 'owl:topObjectProperty' }`. These labels are used as virtual roots in the application's tree views.

---

**Source code:** `app.js` → `getOntologyRootLabels()`

### REQ-ONT-027 — Implicit OWL import for user ontologies

During table rendering, if a user ontology (non-`readonly`) declares no explicit imports (empty `imports` array), the function automatically substitutes the list `['http://www.w3.org/2002/07/owl#']` for the import tree rendering, reflecting the implicit OWL import.

---

## 2. Form — Presentation and user interface

> Requirements related to display: layout, visual components, interactions, navigation, styles.

**Source code:** `app.js` → `_refreshOntoTable()`

### REQ-ONT-001 — Displaying the Ontologies tab

The function injects into `#main-content` the complete HTML structure of the tab (header, four action buttons, wizard panel hidden by default, registry table with column headers Name / Directory / Prefix / Namespace) by calling `_renderOntologiesShell()`, then triggers the asynchronous loading of the registry.

---

**Source code:** `app.js` → `renderOntologies()`

### REQ-ONT-002 — Loading and displaying the registry

`renderOntologies()` calls `API.listOntologies()` to retrieve the list of registered ontologies, then passes the result to `_refreshOntoTable()` which generates the HTML rows of the table. In the event of an API error, the table body displays the message "Unable to load the registry."

---

**Source code:** `app.js` → `renderOntologies()` and `_refreshOntoTable()`

### REQ-ONT-004 — Selecting a row in the registry

A click on a table row calls `selectOntoRow(name)`, which stores the name in `_selectedOntoName` and toggles the CSS class `onto-selected-row` on the corresponding row, removing this class from all other rows.

---

**Source code:** `app.js` → `selectOntoRow()`

### REQ-ONT-006 — Displaying the ontology counter

The element `#onto-registry-count` receives a text of the form "N ontology" or "N ontologies" (conditional plural) reflecting the number of entries returned by `API.listOntologies()`.

---

**Source code:** `app.js` → `_refreshOntoTable()`

### REQ-ONT-012 — Editing the attributes of an existing ontology

The function calls `API.listOntologies()` to retrieve the entry matching the passed `name`, then opens the wizard panel in "edit" mode and injects a pre-filled form with the current values (name, directory, prefix, URI). The original name is preserved in a hidden field `wiz-edit-orig`. The directory is selectable via `FsBrowser`.

---

**Source code:** `app.js` → `doEditOntology()`

### REQ-ONT-019 — Export format selection dropdown menu

The function dynamically builds and positions a context menu (`position:fixed`) anchored below the clicked button. The options offered depend on the `kind` parameter: for `'onto'` the formats are OWL (`.owl`) and Turtle (`.ttl`); for `'rules'` the formats are SWRL (`.json`) and SWORD (`.sword`). A click outside the menu closes it automatically via a `click` listener on `document`.

---

**Source code:** `app.js` → `_ontoExportDropdown()`

### REQ-ONT-021 — Displaying the import tree with expand/collapse

For each ontology in the registry, its declared imports (`imports` field) are rendered as indented sub-rows. If an import itself has imports, a `▶`/`▼` button allows expanding/collapsing the tree. The expansion state is stored in the `Set` `_ontoImportExpanded`. Cycle detection is handled by a `visited` parameter passed recursively. `toggleImportRow(path)` adds or removes the path from the `Set` then calls `_refreshOntoTable()` again.

---

**Source code:** `app.js` → `_refreshOntoTable()` (inner function `renderImportRows()`) and `toggleImportRow()`

### REQ-ONT-022 — Navigating to a registry entry from the import tree

When a node in the import tree corresponds to a known ontology in the registry, a click on its name calls `_scrollToRegistryRow(name)`. This function locates the corresponding `tr[data-name]` row, scrolls it into view (`scrollIntoView`) and applies a `var(--accent)` colored outline to it for 1.5 seconds to draw visual attention.

---

**Source code:** `app.js` → `_scrollToRegistryRow()`

### REQ-ONT-023 — Opening the directory in Finder

The "Directory" cell of each row is rendered as clickable and calls `API.revealInFinder(path)` on click. In the event of failure (notably if `host_agent.py` is not running), a warning message is displayed via `UI.warn()`.

---

**Source code:** `app.js` → `_refreshOntoTable()` (Directory cell `onclick` attribute)

### REQ-ONT-026 — Toggleable wizard panel (open/close)

`_openWizard(type)` checks whether the `#onto-wizard` panel is already displaying the same wizard type: if so, it hides it (toggle behavior). Otherwise, it sets `panel.dataset.type`, makes the panel visible, and injects the corresponding form HTML (`_wizardNew()`, `_wizardImport()`, or `_wizardLoad()`). `_closeWizard()` hides the panel and resets `panel.dataset.type`.

---

— claude-sonnet-4-6

**Source code:** `app.js` → `_openWizard()` and `_closeWizard()`
