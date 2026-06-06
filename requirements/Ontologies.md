# Requirements — Ontologies Tab (SWOWL)

**Date:** 2026-06-06
**Note:** Requirements strictly derived from the source code (`frontend/js/app.js`). Each requirement cites the JavaScript function that implements it. No functionality is extrapolated.

---

## Table of Contents

1. [REQ-ONT-001 — Display of the Ontologies Tab](#req-ont-001)
2. [REQ-ONT-002 — Loading and Displaying the Registry](#req-ont-002)
3. [REQ-ONT-003 — Sorting Ontologies in the Registry](#req-ont-003)
4. [REQ-ONT-004 — Selecting a Registry Row](#req-ont-004)
5. [REQ-ONT-005 — Auto-selection of the Connected Ontology](#req-ont-005)
6. [REQ-ONT-006 — Displaying the Ontology Counter](#req-ont-006)
7. [REQ-ONT-007 — Creating a New Ontology](#req-ont-007)
8. [REQ-ONT-008 — Importing an OWL/TTL Ontology](#req-ont-008)
9. [REQ-ONT-009 — Auto-reading Prefix and URI from a Source File](#req-ont-009)
10. [REQ-ONT-010 — Loading a JSON Ontology](#req-ont-010)
11. [REQ-ONT-011 — Auto-reading Metadata from a JSON File](#req-ont-011)
12. [REQ-ONT-012 — Editing Attributes of an Existing Ontology](#req-ont-012)
13. [REQ-ONT-013 — Saving Ontology Modifications](#req-ont-013)
14. [REQ-ONT-014 — Connecting an Ontology](#req-ont-014)
15. [REQ-ONT-015 — Disconnecting the Active Ontology](#req-ont-015)
16. [REQ-ONT-016 — Unregistering an Ontology](#req-ont-016)
17. [REQ-ONT-017 — Downloading Built-in W3C Ontologies](#req-ont-017)
18. [REQ-ONT-018 — Exporting an Ontology by Name (OWL/TTL/SWRL/SWORD)](#req-ont-018)
19. [REQ-ONT-019 — Export Format Selection Dropdown](#req-ont-019)
20. [REQ-ONT-020 — Exporting the Currently Connected Ontology](#req-ont-020)
21. [REQ-ONT-021 — Displaying the Import Tree with Expand/Collapse](#req-ont-021)
22. [REQ-ONT-022 — Navigating to a Registry Entry from the Import Tree](#req-ont-022)
23. [REQ-ONT-023 — Opening the Directory in Finder](#req-ont-023)
24. [REQ-ONT-024 — Blocking Editing Tabs When No Ontology is Connected](#req-ont-024)
25. [REQ-ONT-025 — Computing Virtual Roots Based on the Ontology Prefix](#req-ont-025)
26. [REQ-ONT-026 — Toggleable Wizard Panel (Open/Close)](#req-ont-026)
27. [REQ-ONT-027 — Implicit OWL Import for User Ontologies](#req-ont-027)

---

### REQ-ONT-001 — Display of the Ontologies Tab {#req-ont-001}

**Source code:** `app.js` → `renderOntologies()`

The function injects into `#main-content` the complete HTML structure of the tab (header, four action buttons, wizard panel hidden by default, registry table with column headers Name / Directory / Prefix / Namespace) by calling `_renderOntologiesShell()`, then triggers the asynchronous loading of the registry.

---

### REQ-ONT-002 — Loading and Displaying the Registry {#req-ont-002}

**Source code:** `app.js` → `renderOntologies()` and `_refreshOntoTable()`

`renderOntologies()` calls `API.listOntologies()` to retrieve the list of registered ontologies, then passes the result to `_refreshOntoTable()` which generates the HTML rows of the table. In case of an API error, the table body displays the message "Unable to load the registry.".

---

### REQ-ONT-003 — Sorting Ontologies in the Registry {#req-ont-003}

**Source code:** `app.js` → `_refreshOntoTable()`

The table is sorted as follows: user ontologies appear first in alphabetical order (`localeCompare`), then read-only W3C ontologies appear last according to a fixed dependency order (`owl` → `rdfs` → `rdf`, encoded in the `BUILTIN_ORDER` constant).

---

### REQ-ONT-004 — Selecting a Registry Row {#req-ont-004}

**Source code:** `app.js` → `selectOntoRow()`

A click on a table row calls `selectOntoRow(name)`, which stores the name in `_selectedOntoName` and toggles the CSS class `onto-selected-row` on the corresponding row, removing that class from all other rows.

---

### REQ-ONT-005 — Auto-selection of the Connected Ontology {#req-ont-005}

**Source code:** `app.js` → `renderOntologies()`

If no manual selection is active (`_selectedOntoName` is null), the function searches the list for the entry whose `connected` field is true and automatically assigns it to `_selectedOntoName`, so that the connected ontology is visually highlighted when the tab loads.

---

### REQ-ONT-006 — Displaying the Ontology Counter {#req-ont-006}

**Source code:** `app.js` → `_refreshOntoTable()`

The element `#onto-registry-count` receives a text of the form "N ontology" or "N ontologies" (conditional plural) reflecting the number of entries returned by `API.listOntologies()`.

---

### REQ-ONT-007 — Creating a New Ontology {#req-ont-007}

**Source code:** `app.js` → `_doNew()`

The function reads the wizard form fields (name, directory, prefix, namespace URI), composes the file path (`<dir>/<name>.json`), calls `API.registerOntology({ name, path, uri, prefix })` to register it, then if the "Connect immediately" checkbox is checked, calls `API.connectOntology(name)`. The `name`, `dir`, and `uri` fields are mandatory; their absence triggers an error message and halts processing.

---

### REQ-ONT-008 — Importing an OWL/TTL Ontology {#req-ont-008}

**Source code:** `app.js` → `_doImport()`

The function reads the import form fields (source file `.owl`/`.ttl`/`.rdf`, name, destination directory, prefix, URI). It composes the save path (`<dir>/<name>.json`) and calls `API.importFromPath({ name, owl_path, save_path, uri, prefix })`. If the "Connect immediately" checkbox is not checked, it then calls `API.disconnectOntology()`. All five fields are mandatory.

---

### REQ-ONT-009 — Auto-reading Prefix and URI from a Source File {#req-ont-009}

**Source code:** `app.js` → `_wizardImportPeek()`

When the user clicks "Read prefix & URI from file", the function calls `API.peekOntology(src)` with the path of the selected file. The returned values (`info.name`, `info.prefix`, `info.uri`) are automatically injected into the form fields only if they are empty (for `name`) or unconditionally (for `prefix` and `uri`).

---

### REQ-ONT-010 — Loading a JSON Ontology {#req-ont-010}

**Source code:** `app.js` → `_doLoad()`

The function reads the load form fields (`.json` file, name, prefix, URI) and calls `API.registerJson(src, name, uri, prefix)`. If the "Connect immediately" checkbox is checked, it then calls `API.connectOntology(name)`. The `src` and `name` fields are mandatory.

---

### REQ-ONT-011 — Auto-reading Metadata from a JSON File {#req-ont-011}

**Source code:** `app.js` → `_wizardLoadPeek()`

When the user clicks "Read information from file", the function calls `API.peekOntology(src)` and injects the returned values (`info.name`, `info.prefix`, `info.uri`) into the fields `wiz-load-name`, `wiz-load-prefix`, and `wiz-load-uri`, overwriting any existing value.

---

### REQ-ONT-012 — Editing Attributes of an Existing Ontology {#req-ont-012}

**Source code:** `app.js` → `doEditOntology()`

The function calls `API.listOntologies()` to find the entry matching the provided `name`, then opens the wizard panel in "edit" mode and injects a pre-filled form with the current values (name, directory, prefix, URI). The original name is stored in a hidden field `wiz-edit-orig`. The directory can be selected via `FsBrowser`.

---

### REQ-ONT-013 — Saving Ontology Modifications {#req-ont-013}

**Source code:** `app.js` → `doSaveEdit()`

The function reads the edit form fields (original name, new name, directory, prefix, URI), composes the new path (`<dir>/<name>.json`) and calls `API.updateOntologyEntry(origName, { name, path, uri, prefix })`. The `name`, `dir`, and `uri` fields are mandatory.

---

### REQ-ONT-014 — Connecting an Ontology {#req-ont-014}

**Source code:** `app.js` → `doConnect()`

The function calls `API.connectOntology(name)`, displays a success message, calls `this.refresh()` to update the global application state, then refreshes the tab display via `renderOntologies()`. The connected ontology row receives the CSS class `onto-current-row` and its indicator switches to the green `●` symbol.

---

### REQ-ONT-015 — Disconnecting the Active Ontology {#req-ont-015}

**Source code:** `app.js` → `doDisconnect()`

The function calls `API.disconnectOntology()`, displays a success message, calls `this.refresh()` then re-renders the current section via `renderSection(this.currentSection)`. After disconnection, editing tabs become inaccessible (see REQ-ONT-024).

---

### REQ-ONT-016 — Unregistering an Ontology {#req-ont-016}

**Source code:** `app.js` → `doUnregister()`

The function requests confirmation via `UI.confirm()` (the message explicitly states that the file on disk will not be deleted). If confirmed, it calls `API.unregisterOntology(name)` to remove the entry from the registry, without touching the physical file.

---

### REQ-ONT-017 — Downloading Built-in W3C Ontologies {#req-ont-017}

**Source code:** `app.js` → `_fetchBuiltins()`

The function disables the "Fetch W3C Ontologies" button during the operation, calls `API.fetchBuiltins()`, and counts in the result the entries whose status contains the string `'fetched'` to display the number of ontologies actually downloaded and registered (RDF, RDFS, OWL from `w3.org`). The button is re-enabled in the `finally` block.

---

### REQ-ONT-018 — Exporting an Ontology by Name (OWL/TTL/SWRL/SWORD) {#req-ont-018}

**Source code:** `app.js` → `exportOntologyByName()`

The function calls `API.exportOntologyByName(name, fmt)` and triggers the download of the resulting blob with the filename `<name>.<ext>`. The extension is determined by the format: `owl` → `.owl`, `ttl` → `.ttl`, `swrl` → `.json`, `sword` → `.sword`.

---

### REQ-ONT-019 — Export Format Selection Dropdown {#req-ont-019}

**Source code:** `app.js` → `_ontoExportDropdown()`

The function dynamically builds and positions a context menu (`position:fixed`) anchored below the clicked button. The options offered depend on the `kind` parameter: for `'onto'` the formats are OWL (`.owl`) and Turtle (`.ttl`); for `'rules'` the formats are SWRL (`.json`) and SWORD (`.sword`). A click outside the menu closes it automatically via a `click` listener on `document`.

---

### REQ-ONT-020 — Exporting the Currently Connected Ontology {#req-ont-020}

**Source code:** `app.js` → `exportOntology()`

The function calls `API.exportOntology(fmt)` (without a name, thus for the connected ontology) and triggers the download with the generic filename `ontology.<ext>` (`.owl`, `.ttl`, or `.jsonld` depending on the format).

---

### REQ-ONT-021 — Displaying the Import Tree with Expand/Collapse {#req-ont-021}

**Source code:** `app.js` → `_refreshOntoTable()` (inner function `renderImportRows()`) and `toggleImportRow()`

For each ontology in the registry, its declared imports (`imports` field) are rendered as indented sub-rows. If an import itself has imports, a `▶`/`▼` button allows expanding/collapsing the tree. The expansion state is stored in the `Set` `_ontoImportExpanded`. Cycle detection is handled by a `visited` parameter passed recursively. `toggleImportRow(path)` adds or removes the path from the `Set` then calls `_refreshOntoTable()` again.

---

### REQ-ONT-022 — Navigating to a Registry Entry from the Import Tree {#req-ont-022}

**Source code:** `app.js` → `_scrollToRegistryRow()`

When a node in the import tree corresponds to a known ontology in the registry, clicking its name calls `_scrollToRegistryRow(name)`. This function locates the corresponding `tr[data-name]` row, scrolls it into view (`scrollIntoView`) and applies a highlight outline in color `var(--accent)` for 1.5 seconds to draw visual attention.

---

### REQ-ONT-023 — Opening the Directory in Finder {#req-ont-023}

**Source code:** `app.js` → `_refreshOntoTable()` (inline `onclick` attribute of the Directory cell)

The "Directory" cell of each row is rendered as clickable and calls `API.revealInFinder(path)` on click. In case of failure (notably if `host_agent.py` is not running), a warning message is displayed via `UI.warn()`.

---

### REQ-ONT-024 — Blocking Editing Tabs When No Ontology is Connected {#req-ont-024}

**Source code:** `app.js` → `renderSection()`

Before rendering a section belonging to the list of editing tabs, the function checks `this.state.ontology`. If no ontology is connected, navigation to these tabs is blocked and a message is displayed in `#main-content` with a redirect button to the Ontologies tab (`APP.navigate('ontologies')`).

---

### REQ-ONT-025 — Computing Virtual Roots Based on the Ontology Prefix {#req-ont-025}

**Source code:** `app.js` → `getOntologyRootLabels()`

The function reads `this.state.ontology?.prefix`. If the prefix is `'rdf'` or `'rdfs'`, it returns `{ classRoot: 'rdfs:Resource', propRoot: 'rdf:Property' }`. In all other cases, it returns `{ classRoot: 'owl:Thing', propRoot: 'owl:topObjectProperty' }`. These labels are used as virtual roots in the application's tree views.

---

### REQ-ONT-026 — Toggleable Wizard Panel (Open/Close) {#req-ont-026}

**Source code:** `app.js` → `_openWizard()` and `_closeWizard()`

`_openWizard(type)` checks whether the `#onto-wizard` panel already displays the same wizard type: if so, it hides it (toggle behavior). Otherwise, it sets `panel.dataset.type`, makes the panel visible, and injects the HTML of the corresponding form (`_wizardNew()`, `_wizardImport()`, or `_wizardLoad()`). `_closeWizard()` hides the panel and resets `panel.dataset.type`.

---

### REQ-ONT-027 — Implicit OWL Import for User Ontologies {#req-ont-027}

**Source code:** `app.js` → `_refreshOntoTable()`

When rendering the table, if a user ontology (non-`readonly`) declares no explicit imports (empty `imports` array), the function automatically substitutes the list `['http://www.w3.org/2002/07/owl#']` for the import tree rendering, reflecting the implicit import of OWL.

---

*— claude-sonnet-4-6*
