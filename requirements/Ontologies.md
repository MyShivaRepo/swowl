# Requirements — Ontologies

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-ONT-001 — Ontology sorting in the registry](#req-ont-001--ontology-sorting-in-the-registry)
- [REQ-ONT-002 — Auto-selection of the connected ontology](#req-ont-002--auto-selection-of-the-connected-ontology)
- [REQ-ONT-003 — Creating a new ontology](#req-ont-003--creating-a-new-ontology)
- [REQ-ONT-004 — Importing an OWL/TTL ontology](#req-ont-004--importing-an-owlttl-ontology)
- [REQ-ONT-005 — Automatic reading of prefix and URI from a source file](#req-ont-005--automatic-reading-of-prefix-and-uri-from-a-source-file)
- [REQ-ONT-006 — Loading a JSON ontology](#req-ont-006--loading-a-json-ontology)
- [REQ-ONT-007 — Automatic reading of metadata from a JSON file](#req-ont-007--automatic-reading-of-metadata-from-a-json-file)
- [REQ-ONT-008 — Saving changes to an ontology](#req-ont-008--saving-changes-to-an-ontology)
- [REQ-ONT-009 — Connecting and disconnecting an ontology](#req-ont-009--connecting-and-disconnecting-an-ontology)
- [REQ-ONT-010 — Unregistering an ontology](#req-ont-010--unregistering-an-ontology)
- [REQ-ONT-011 — Downloading built-in W3C ontologies](#req-ont-011--downloading-built-in-w3c-ontologies)
- [REQ-ONT-012 — Exporting an ontology by name (OWL/TTL/SWRL/SWORD)](#req-ont-012--exporting-an-ontology-by-name-owlttlswrlsword)
- [REQ-ONT-013 — Exporting the currently connected ontology](#req-ont-013--exporting-the-currently-connected-ontology)
- [REQ-ONT-014 — Blocking editing tabs when no ontology is connected](#req-ont-014--blocking-editing-tabs-when-no-ontology-is-connected)
- [REQ-ONT-015 — Computing virtual roots based on the ontology prefix](#req-ont-015--computing-virtual-roots-based-on-the-ontology-prefix)
- [REQ-ONT-016 — Implicit OWL import for user ontologies](#req-ont-016--implicit-owl-import-for-user-ontologies)

### Form
- [REQ-ONT-017 — Displaying the Ontologies tab](#req-ont-017--displaying-the-ontologies-tab)
- [REQ-ONT-018 — Loading and displaying the registry](#req-ont-018--loading-and-displaying-the-registry)
- [REQ-ONT-019 — Selecting a registry row](#req-ont-019--selecting-a-registry-row)
- [REQ-ONT-020 — Displaying the ontology counter](#req-ont-020--displaying-the-ontology-counter)
- [REQ-ONT-021 — Editing the attributes of an existing ontology](#req-ont-021--editing-the-attributes-of-an-existing-ontology)
- [REQ-ONT-022 — Export format selection dropdown menu](#req-ont-022--export-format-selection-dropdown-menu)
- [REQ-ONT-023 — Displaying the import tree with expand/collapse](#req-ont-023--displaying-the-import-tree-with-expandcollapse)
- [REQ-ONT-024 — Navigating to a registry entry from the import tree](#req-ont-024--navigating-to-a-registry-entry-from-the-import-tree)
- [REQ-ONT-025 — Opening the directory in Finder](#req-ont-025--opening-the-directory-in-finder)
- [REQ-ONT-026 — Togglable wizard panel (open/close)](#req-ont-026--togglable-wizard-panel-openclose)

---

## 1. Substance — Business logic

> UI-independent requirements: OWL rules, data constraints, algorithmic behaviors, validations, persistence.


### REQ-ONT-001 — Ontology sorting in the registry

| **If** | the ontology registry is displayed, |
|---|---|
| **Then** | - user ontologies appear first, sorted alphabetically (`localeCompare`);<br>- read-only W3C ontologies appear last, in a fixed dependency order (`owl` → `rdfs` → `rdf`) encoded in the `BUILTIN_ORDER` constant. |

---

**Source code:** `app.js` → `_refreshOntoTable()`

### REQ-ONT-002 — Auto-selection of the connected ontology

| **If** | the Ontologies tab is loaded **and** no manual selection is active (`_selectedOntoName` is null), |
|---|---|
| **Then** | the system searches the list for the entry whose `connected` field is true and automatically assigns it to `_selectedOntoName`, so that the connected ontology is visually highlighted. |

---

**Source code:** `app.js` → `renderOntologies()`

### REQ-ONT-003 — Creating a new ontology

| **If** | the user fills in the wizard form (name, directory, prefix, namespace URI) and submits the creation, |
|---|---|
| **Then** | - the system composes the file path (`<dir>/<name>.json`) and calls `API.registerOntology({ name, path, uri, prefix })` to register it;<br>- if the "Connect immediately" checkbox is checked, `API.connectOntology(name)` is called in addition;<br>- if any required field (`name`, `dir`, `uri`) is missing, an error message is displayed and processing is halted. |

---

**Source code:** `app.js` → `_doNew()`

### REQ-ONT-004 — Importing an OWL/TTL ontology

| **If** | the user fills in the import form (source file `.owl`/`.ttl`/`.rdf`, name, destination directory, prefix, URI) and starts the import, |
|---|---|
| **Then** | - the system composes the save path (`<dir>/<name>.json`) and calls `API.importFromPath({ name, owl_path, save_path, uri, prefix })`;<br>- if the "Connect immediately" checkbox is not checked, `API.disconnectOntology()` is called afterwards;<br>- if any of the five required fields is missing, processing is halted. |

---

**Source code:** `app.js` → `_doImport()`

### REQ-ONT-005 — Automatic reading of prefix and URI from a source file

| **If** | the user clicks "Read prefix & URI from file" with a source file selected, |
|---|---|
| **Then** | the system calls `API.peekOntology(src)` and injects the returned values (`info.name`, `info.prefix`, `info.uri`) into the form fields: the `name` field is filled only if it is empty, while `prefix` and `uri` are replaced unconditionally. |

---

**Source code:** `app.js` → `_wizardImportPeek()`

### REQ-ONT-006 — Loading a JSON ontology

| **If** | the user fills in the load form (`.json` file, name, prefix, URI) and confirms, |
|---|---|
| **Then** | - the system calls `API.registerJson(src, name, uri, prefix)`;<br>- if the "Connect immediately" checkbox is checked, `API.connectOntology(name)` is called afterwards;<br>- if the required fields `src` or `name` are missing, processing is halted. |

---

**Source code:** `app.js` → `_doLoad()`

### REQ-ONT-007 — Automatic reading of metadata from a JSON file

| **If** | the user clicks "Read information from file" with a `.json` file selected, |
|---|---|
| **Then** | the system calls `API.peekOntology(src)` and injects the returned values (`info.name`, `info.prefix`, `info.uri`) into the fields `wiz-load-name`, `wiz-load-prefix` and `wiz-load-uri`, replacing any existing value. |

---

**Source code:** `app.js` → `_wizardLoadPeek()`

### REQ-ONT-008 — Saving changes to an ontology

| **If** | the user modifies the attributes of an existing ontology (name, directory, prefix, URI) and confirms the save, |
|---|---|
| **Then** | the system composes the new path (`<dir>/<name>.json`) and calls `API.updateOntologyEntry(origName, { name, path, uri, prefix })`. If any required field (`name`, `dir`, `uri`) is missing, processing is halted. |

---

**Source code:** `app.js` → `doSaveEdit()`

### REQ-ONT-009 — Connecting and disconnecting an ontology

| **If** | the user requests connecting an ontology, |
|---|---|
| **Then** | - the system calls `API.connectOntology(name)`, displays a success message, calls `this.refresh()` then refreshes the tab via `renderOntologies()`;<br>- the connected ontology's row receives the CSS class `onto-current-row` and its indicator switches to the green `●` symbol. |

| **If** | the user requests disconnecting the current ontology, |
|---|---|
| **Then** | - the system calls `API.disconnectOntology()`, displays a success message, calls `this.refresh()` then re-renders the current section via `renderSection(this.currentSection)`;<br>- editing tabs become inaccessible (see REQ-ONT-014). |

---

**Source code:** `app.js` → `doConnect()` | `doDisconnect()`

### REQ-ONT-010 — Unregistering an ontology

| **If** | the user requests unregistering an ontology and confirms the dialog (whose message explicitly states that the file on disk will not be deleted), |
|---|---|
| **Then** | the system calls `API.unregisterOntology(name)` to remove the entry from the registry, without touching the physical file. |

---

**Source code:** `app.js` → `doUnregister()`

### REQ-ONT-011 — Downloading built-in W3C ontologies

| **If** | the user clicks the "Fetch W3C Ontologies" button, |
|---|---|
| **Then** | - the button is disabled during the operation;<br>- the system calls `API.fetchBuiltins()` and counts entries whose status contains the string `'fetched'` to display the number of ontologies actually downloaded and registered (RDF, RDFS, OWL from `w3.org`);<br>- the button is re-enabled in the `finally` block. |

---

**Source code:** `app.js` → `_fetchBuiltins()`

### REQ-ONT-012 — Exporting an ontology by name (OWL/TTL/SWRL/SWORD)

| **If** | the user selects an export format and starts the export of an ontology identified by its name, |
|---|---|
| **Then** | the system calls `API.exportOntologyByName(name, fmt)` and triggers the download of the resulting blob with the filename `<name>.<ext>`, the extension being determined by the format: `owl` → `.owl`, `ttl` → `.ttl`, `swrl` → `.json`, `sword` → `.sword`. |

---

**Source code:** `app.js` → `exportOntologyByName()`

### REQ-ONT-013 — Exporting the currently connected ontology

| **If** | the user starts the export of the currently connected ontology by selecting a format, |
|---|---|
| **Then** | the system calls `API.exportOntology(fmt)` (without an explicit name) and triggers the download with the generic filename `ontology.<ext>` (`.owl`, `.ttl` or `.jsonld` depending on the format). |

---

**Source code:** `app.js` → `exportOntology()`

### REQ-ONT-014 — Blocking editing tabs when no ontology is connected

| **If** | the user attempts to navigate to an editing tab **and** no ontology is connected (`this.state.ontology` is null), |
|---|---|
| **Then** | navigation is blocked and a message is displayed in `#main-content` with a button redirecting to the Ontologies tab (`APP.navigate('ontologies')`). |

---

**Source code:** `app.js` → `renderSection()`

### REQ-ONT-015 — Computing virtual roots based on the ontology prefix

| **If** | the connected ontology has the prefix `'rdf'` or `'rdfs'`, |
|---|---|
| **Then** | the system returns `{ classRoot: 'rdfs:Resource', propRoot: 'rdf:Property' }` as virtual roots. |

| **If** | the connected ontology has any other prefix (or no ontology is connected), |
|---|---|
| **Then** | the system returns `{ classRoot: 'owl:Thing', propRoot: 'owl:topObjectProperty' }` as virtual roots, used in the application's tree views. |

---

**Source code:** `app.js` → `getOntologyRootLabels()`

### REQ-ONT-016 — Implicit OWL import for user ontologies

| **If** | a user ontology (non-`readonly`) is displayed in the table **and** it declares no explicit import (empty `imports` array), |
|---|---|
| **Then** | the system automatically substitutes the list `['http://www.w3.org/2002/07/owl#']` for it when rendering the import tree, reflecting the implicit OWL import. |

---

**Source code:** `app.js` → `_refreshOntoTable()`

---

## 2. Form — Presentation and UI

> Display-related requirements: layout, visual components, interactions, navigation, styles.

### REQ-ONT-017 — Displaying the Ontologies tab

| **If** | the user navigates to the Ontologies tab, |
|---|---|
| **Then** | the system injects into `#main-content` the complete HTML structure (header, four action buttons, wizard panel hidden by default, registry table with columns Name / Directory / Prefix / Namespace) via `_renderOntologiesShell()`, then triggers asynchronous loading of the registry. |

---

**Source code:** `app.js` → `renderOntologies()`

### REQ-ONT-018 — Loading and displaying the registry

| **If** | the Ontologies tab is displayed, |
|---|---|
| **Then** | the system calls `API.listOntologies()` to obtain the list of registered ontologies and passes the result to `_refreshOntoTable()` which generates the HTML rows of the table. In the event of an API error, the table body displays the message "Unable to load the registry.". |

---

**Source code:** `app.js` → `renderOntologies()` and `_refreshOntoTable()`

### REQ-ONT-019 — Selecting a registry row

| **If** | the user clicks on a row in the registry table, |
|---|---|
| **Then** | the system stores the name in `_selectedOntoName` and toggles the CSS class `onto-selected-row` on the corresponding row, removing that class from all other rows. |

---

**Source code:** `app.js` → `selectOntoRow()`

### REQ-ONT-020 — Displaying the ontology counter

| **If** | the registry is loaded, |
|---|---|
| **Then** | the `#onto-registry-count` element displays a text of the form "N ontology" or "N ontologies" (conditional plural) reflecting the number of entries returned by `API.listOntologies()`. |

---

**Source code:** `app.js` → `_refreshOntoTable()`

### REQ-ONT-021 — Editing the attributes of an existing ontology

| **If** | the user requests editing an existing ontology, |
|---|---|
| **Then** | the system calls `API.listOntologies()` to retrieve the corresponding entry, opens the wizard panel in "edit" mode and injects a pre-filled form with the current values (name, directory, prefix, URI). The original name is preserved in a hidden field `wiz-edit-orig` and the directory is selectable via `FsBrowser`. |

---

**Source code:** `app.js` → `doEditOntology()`

### REQ-ONT-022 — Export format selection dropdown menu

| **If** | the user clicks the export button, |
|---|---|
| **Then** | the system dynamically builds and positions a context menu (`position:fixed`) anchored below the button. The options offered depend on the `kind` parameter: for `'onto'` the formats are OWL (`.owl`) and Turtle (`.ttl`); for `'rules'` the formats are SWRL (`.json`) and SWORD (`.sword`). A click outside the menu closes it automatically via a `click` listener on `document`. |

---

**Source code:** `app.js` → `_ontoExportDropdown()`

### REQ-ONT-023 — Displaying the import tree with expand/collapse

| **If** | the registry is displayed and an ontology has declared imports (`imports` field), |
|---|---|
| **Then** | - imports are rendered as indented sub-rows;<br>- if an import itself has imports, a `▶`/`▼` button allows expanding/collapsing the tree, with the expansion state stored in the `Set` `_ontoImportExpanded`;<br>- cycle detection is handled by a `visited` parameter passed recursively;<br>- `toggleImportRow(path)` adds or removes the path from the `Set` then calls `_refreshOntoTable()` again. |

---

**Source code:** `app.js` → `_refreshOntoTable()` (inner function `renderImportRows()`) and `toggleImportRow()`

### REQ-ONT-024 — Navigating to a registry entry from the import tree

| **If** | the user clicks on the name of a node in the import tree corresponding to a known ontology in the registry, |
|---|---|
| **Then** | the system locates the corresponding `tr[data-name]` row, scrolls it into view (`scrollIntoView`) and applies a `var(--accent)` color outline to it for 1.5 seconds to draw visual attention. |

---

**Source code:** `app.js` → `_scrollToRegistryRow()`

### REQ-ONT-025 — Opening the directory in Finder

| **If** | the user clicks on the "Directory" cell of a registry row, |
|---|---|
| **Then** | the system calls `API.revealInFinder(path)`. In case of failure (in particular if `host_agent.py` is not running), a warning message is displayed via `UI.warn()`. |

---

**Source code:** `app.js` → `_refreshOntoTable()` (onclick attribute of the Directory cell)

### REQ-ONT-026 — Togglable wizard panel (open/close)

| **If** | the user clicks a wizard action button **and** the `#onto-wizard` panel already displays the same wizard type, |
|---|---|
| **Then** | the panel is hidden (toggle behavior). |

| **If** | the user clicks a wizard action button **and** the panel displays a different type or is closed, |
|---|---|
| **Then** | the system sets `panel.dataset.type`, makes the panel visible and injects the HTML of the corresponding form (`_wizardNew()`, `_wizardImport()` or `_wizardLoad()`). `_closeWizard()` hides the panel and resets `panel.dataset.type`. |

---

**Source code:** `app.js` → `_openWizard()` and `_closeWizard()`
