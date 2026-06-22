# Requirements — Ontologies

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-ONT-001 — Sorting ontologies in the registry](#req-ont-001--sorting-ontologies-in-the-registry)
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
- [REQ-ONT-028 — Entity display prefix driven by the registry prefix](#req-ont-028--entity-display-prefix-driven-by-the-registry-prefix)
- [REQ-ONT-031 — Contextual prefix authoritative for imported entities](#req-ont-031--contextual-prefix-authoritative-for-imported-entities)
- [REQ-ONT-032 — Reading referenced namespaces and imports from a file](#req-ont-032--reading-referenced-namespaces-and-imports-from-a-file)
- [REQ-ONT-033 — Emitting owl:imports on RDF export](#req-ont-033--emitting-owlimports-on-rdf-export)
- [REQ-ONT-034 — Persisting imported namespaces and deriving imports](#req-ont-034--persisting-imported-namespaces-and-deriving-imports)
- [REQ-ONT-038 — Editing the ontology URI reflected in entity IRIs](#req-ont-038--editing-the-ontology-uri-reflected-in-entity-iris)

### Form
- [REQ-ONT-036 — Active ontology selector in the title bar](#req-ont-036--active-ontology-selector-in-the-title-bar)
- [REQ-ONT-017 — Displaying the Ontologies tab](#req-ont-017--displaying-the-ontologies-tab)
- [REQ-ONT-018 — Loading and displaying the registry](#req-ont-018--loading-and-displaying-the-registry)
- [REQ-ONT-019 — Selecting a registry row](#req-ont-019--selecting-a-registry-row)
- [REQ-ONT-020 — Displaying the ontology counter](#req-ont-020--displaying-the-ontology-counter)
- [REQ-ONT-021 — Editing the attributes of an existing ontology](#req-ont-021--editing-the-attributes-of-an-existing-ontology)
- [REQ-ONT-022 — Export format selection dropdown](#req-ont-022--export-format-selection-dropdown)
- [REQ-ONT-023 — Displaying the import tree with expand/collapse](#req-ont-023--displaying-the-import-tree-with-expandcollapse)
- [REQ-ONT-024 — Navigating to a registry entry from the import tree](#req-ont-024--navigating-to-a-registry-entry-from-the-import-tree)
- [REQ-ONT-025 — Opening the directory in Finder](#req-ont-025--opening-the-directory-in-finder)
- [REQ-ONT-026 — Toggleable wizard panel (open/close)](#req-ont-026--toggleable-wizard-panel-openclose)
- [REQ-ONT-027 — Splitting the registry into User and System sections](#req-ont-027--splitting-the-registry-into-user-and-system-sections)
- [REQ-ONT-029 — Exporting rules in SWORD format (.swd)](#req-ont-029--exporting-rules-in-sword-format-swd)
- [REQ-ONT-030 — Editable "Imported namespaces" section in the wizards](#req-ont-030--editable-imported-namespaces-section-in-the-wizards)
- [REQ-ONT-035 — Opening the ontology namespace from the registry](#req-ont-035--opening-the-ontology-namespace-from-the-registry)
- [REQ-ONT-037 — Exporting an ontology as a standalone navigable HTML page](#req-ont-037--exporting-an-ontology-as-a-standalone-navigable-html-page)

---

## 1. Substance — Business logic

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviors, validations, persistence.


### REQ-ONT-001 — Sorting ontologies in the registry

| **If** | the `ontology` registry is consulted, |
|---|---|
| **Then** | the user's `ontologies` appear first, sorted alphabetically, followed by the read-only W3C `ontologies`, which are also sorted alphabetically (`owl`, `rdf`, `rdfs`, `skos`). |

---

**Source code:** `app.js` → `_refreshOntoTable()` — Sorts user ontologies alphabetically (`localeCompare`), then concatenates the `readonly` W3C ontologies sorted alphabetically (`owl` → `rdf` → `rdfs` → `skos`).

### REQ-ONT-002 — Auto-selection of the connected ontology

| **If** | the ontologist opens the `Ontologies` tab without having made a manual selection beforehand, |
|---|---|
| **Then** | the currently connected `ontology` is automatically highlighted in the registry, without any further action from the user. |

---

**Source code:** `app.js` → `renderOntologies()` — If `_selectedOntoName` is null, iterates over the ontology list to find the one whose `connected` flag is true and assigns it to `_selectedOntoName`, triggering visual highlighting of the corresponding row.

### REQ-ONT-003 — Creating a new ontology

| **If** | the ontologist wishes to create a new `ontology` and fills in its name, storage directory, prefix, and `namespace` URI, |
|---|---|
| **Then** | the `ontology` is registered in the system; if the ontologist requests it, it is immediately connected; if any required field is missing, an error message is displayed and no registration is performed. |

---

**Source code:** `app.js` → `_doNew()` — Composes the path `<dir>/<name>.json`, calls `API.registerOntology({ name, path, uri, prefix })` for registration; if the "Connect immediately" checkbox is checked, chains with `API.connectOntology(name)`; aborts processing if `name`, `dir`, or `uri` is missing.

### REQ-ONT-004 — Importing an OWL/TTL ontology

| **If** | the ontologist wishes to import an existing `ontology` from a source file (OWL, Turtle, or RDF format) and fills in the target name, destination directory, prefix, and URI, |
|---|---|
| **Then** | the file is converted and registered in the system; if the ontologist does not request immediate connection, the `ontology` remains disconnected; if any of the five required fields is missing, the import is cancelled. |

---

**Source code:** `app.js` → `_doImport()` — Composes the save path `<dir>/<name>.json`, calls `API.importFromPath({ name, owl_path, save_path, uri, prefix })`; if the "Connect immediately" checkbox is not checked, additionally calls `API.disconnectOntology()`; aborts if any of the five fields is missing.

### REQ-ONT-005 — Automatic reading of prefix and URI from a source file

| **If** | the ontologist selects a source file during an import and requests automatic reading of its metadata, |
|---|---|
| **Then** | the prefix and `namespace` URI are extracted from the file and injected into the form; the `ontology` name is also suggested if the field is still empty; the "Imported namespaces" section is pre-filled with the namespaces referenced and the imports declared in the file (see REQ-ONT-032). |

---

**Source code:** `app.js` → `_wizardImportPeek()` — Calls `API.peekOntology(src)` and unconditionally injects `info.prefix` and `info.uri` into the form fields; `info.name` is injected into `wiz-import-name` only if that field is currently empty; for each entry of `info.namespaces`, calls `_wizImpAddNs(prefix, namespace)` to pre-fill the "Imported namespaces" section.

### REQ-ONT-006 — Loading a JSON ontology

| **If** | the ontologist wishes to register in the system an `ontology` already serialized in JSON format and fills in the source file, name, prefix, and URI, |
|---|---|
| **Then** | the `ontology` is registered in the registry; if the ontologist requests it, it is immediately connected; if the source file or name is missing, the loading is cancelled. |

---

**Source code:** `app.js` → `_doLoad()` — Calls `API.registerJson(src, name, uri, prefix)`; if the "Connect immediately" checkbox is checked, chains with `API.connectOntology(name)`; aborts processing if `src` or `name` is missing.

### REQ-ONT-007 — Automatic reading of metadata from a JSON file

| **If** | the ontologist selects a JSON file during loading and requests automatic reading of its metadata, |
|---|---|
| **Then** | the name, prefix, and `namespace` URI are extracted from the file and injected into the form fields, replacing any previously entered values. |

---

**Source code:** `app.js` → `_wizardLoadPeek()` — Calls `API.peekOntology(src)` and injects `info.name`, `info.prefix`, and `info.uri` into fields `wiz-load-name`, `wiz-load-prefix`, and `wiz-load-uri`, overwriting existing values; for each entry of `info.namespaces`, calls `_wizImpAddNs(prefix, namespace, 'wiz-load-ns-list')` to pre-fill the "Imported namespaces" section (see REQ-ONT-032).

### REQ-ONT-008 — Saving changes to an ontology

| **If** | the ontologist modifies the attributes of an already registered `ontology` (name, directory, prefix, or `namespace` URI) and confirms the changes, |
|---|---|
| **Then** | the registry is updated with the new values; if any required field is missing, the save is cancelled. |

---

**Source code:** `app.js` → `doSaveEdit()` — Composes the new path `<dir>/<name>.json` and calls `API.updateOntologyEntry(origName, { name, path, uri, prefix })`; aborts if `name`, `dir`, or `uri` is missing.

### REQ-ONT-009 — Connecting and disconnecting an ontology

| **If** | the ontologist requests connection of an `ontology`, |
|---|---|
| **Then** | that `ontology` becomes the active working `ontology`, clearly identified in the registry, and the editing tabs become accessible. |

| **If** | the ontologist requests disconnection of the current `ontology`, |
|---|---|
| **Then** | no `ontology` is active and the editing tabs become inaccessible until a new connection is made. |

---

**Source code:** `app.js` → `doConnect()` — Calls `API.connectOntology(name)`, displays a success message, calls `this.refresh()` then `renderOntologies()`; the row receives the CSS class `onto-current-row` and its indicator changes to the green `●` symbol. `doDisconnect()` — Calls `API.disconnectOntology()`, displays a success message, calls `this.refresh()` then `renderSection(this.currentSection)`.

### REQ-ONT-010 — Unregistering an ontology

| **If** | the ontologist wishes to remove an `ontology` from the registry and confirms the operation, |
|---|---|
| **Then** | the `ontology` disappears from the registry; a "delete file" checkbox lets the ontologist additionally request deletion of the underlying `.json` file on disk; if that checkbox is left unchecked, the physical file is preserved. |

---

**Source code:** `app.js` → `doUnregister()` — Displays a confirmation dialog containing a "delete file" checkbox; calls `API.unregisterOntology(name)` to remove the entry from the registry and, if the checkbox is checked, requests deletion of the underlying `.json` file on disk.

### REQ-ONT-011 — Downloading built-in W3C ontologies

| **If** | the ontologist wishes to have the W3C reference `ontologies` (RDF, RDFS, OWL, and SKOS) available in the local registry, |
|---|---|
| **Then** | the system downloads and registers these `ontologies` from the official sources (`w3.org`) and informs the ontologist of the number of `ontologies` actually retrieved. The SKOS `ontology` (prefix `skos`, URI `http://www.w3.org/2004/02/skos/core#`) imports the reference OWL `ontology`. |

---

**Source code:** `app.js` → `_fetchBuiltins()` — Disables the button during the operation, calls `API.fetchBuiltins()`, counts the entries whose status contains `'fetched'` to build the result message, and re-enables the button in the `finally` block. The "Fetch W3C Ontologies" button downloads RDF, RDFS, OWL, and SKOS from `w3.org`; SKOS forces an import of OWL.

### REQ-ONT-012 — Exporting an ontology by name (OWL/TTL/SWRL/SWORD)

| **If** | the ontologist selects an `ontology` from the registry and chooses an export format from the available semantic formats, |
|---|---|
| **Then** | the corresponding file is generated and offered for download with a filename reflecting the `ontology` name and the chosen format. |

---

**Source code:** `app.js` → `exportOntologyByName()` — Calls `API.exportOntologyByName(name, fmt)` and triggers the download of the blob with the name `<name>.<ext>`; the extension is determined by the mapping: `owl` → `.owl`, `ttl` → `.ttl`, `swrl` → `.json`, `sword` → `.swd`.

### REQ-ONT-013 — Exporting the currently connected ontology

| **If** | the ontologist wishes to export the `ontology` they are currently working on by choosing a format, |
|---|---|
| **Then** | the file is generated and offered for download under a generic name associated with the chosen format. |

---

**Source code:** `app.js` → `exportOntology()` — Calls `API.exportOntology(fmt)` without an explicit name and triggers the download with the generic name `ontology.<ext>` (`.owl`, `.ttl`, or `.jsonld` depending on the format).

### REQ-ONT-014 — Blocking editing tabs when no ontology is connected

| **If** | the ontologist attempts to access an editing tab while no `ontology` is connected, |
|---|---|
| **Then** | access is denied and a message guides the ontologist to the `Ontologies` tab to connect one. |

---

**Source code:** `app.js` → `renderSection()` — Checks that `this.state.ontology` is not null; if it is, injects a warning message into `#main-content` with a button calling `APP.navigate('ontologies')`.

### REQ-ONT-015 — Computing virtual roots based on the ontology prefix

| **If** | the ontologist is working on a low-level `ontology` (RDF or RDFS), |
|---|---|
| **Then** | the class and `property` trees are rooted at `rdfs:Resource` and `rdf:Property` respectively, in accordance with the semantics of those vocabularies. |

| **If** | the ontologist is working on any other `ontology` (or no `ontology` is connected), |
|---|---|
| **Then** | the class and `property` trees are rooted at `owl:Thing` and `owl:topObjectProperty` respectively, in accordance with OWL conventions. |

---

**Source code:** `app.js` → `getOntologyRootLabels()` — Tests the prefix of the connected ontology: if `'rdf'` or `'rdfs'`, returns `{ classRoot: 'rdfs:Resource', propRoot: 'rdf:Property' }`; otherwise returns `{ classRoot: 'owl:Thing', propRoot: 'owl:topObjectProperty' }`.

### REQ-ONT-016 — Implicit OWL import for user ontologies

| **If** | a user `ontology` declares no explicit imports, |
|---|---|
| **Then** | the import tree automatically assigns it the reference OWL `ontology` (`http://www.w3.org/2002/07/owl#`), reflecting the implicit import inherent to any OWL `ontology`. |

---

**Source code:** `app.js` → `_refreshOntoTable()` — For any ontology whose `readonly` flag is false and whose `imports` array is empty, substitutes `['http://www.w3.org/2002/07/owl#']` as the import list for tree rendering.

### REQ-ONT-028 — Entity display prefix driven by the registry prefix

| **If** | an `ontology` is connected and its prefix is defined in the registry (e.g. `rohs`), |
|---|---|
| **Then** | its entities (`classes`, `ObjectProperties`, `DatatypeProperties`, `AnnotationProperties`, and `individuals`) are displayed prefixed by the registry prefix of the connected `ontology` (the one shown or edited in the `Ontologies` tab), e.g. `rohs:Part`, `rohs:chromium`. |

| **If** | the registry prefix of the connected `ontology` is empty, |
|---|---|
| **Then** | its entities are displayed without any prefix (bare local id). |

| **If** | an id is already namespaced (`owl:Thing`, `xsd:decimal`, `rdfs:label`) or corresponds to an imported entity (shown with its own import prefix — see REQ-ONT-031), |
|---|---|
| **Then** | its display is unaffected by the registry prefix. |

The prefix is purely a display concern: the editable `id` field and the internal `data-id` attribute keep the bare local id.

---

**Source code:** `owl_editor.js` → `_displayId(entity)` — Reads `APP.state.ontology.prefix` to prefix the displayed local id of non-namespaced, non-imported entities; if the prefix is empty, returns the bare local id; already-namespaced ids and imported entities are left unchanged. `main.py` → `get_current_ontology` — Makes the registry entry's prefix authoritative (`onto.prefix = entry.prefix or ""`), overriding the value frozen at import time (which could differ, e.g. `model_rohs`).

### REQ-ONT-031 — Contextual prefix authoritative for imported entities

| **If** | an `ontology` imports another `ontology`, assigning it a contextual prefix via the "Imported namespaces" section (see REQ-ONT-030), |
|---|---|
| **Then** | the entities coming from the imported `ontology` (`classes`, `ObjectProperties`, `DatatypeProperties`, `individuals`, `SWRL rules`) are displayed with that contextual prefix, which takes precedence over the imported `ontology`'s own prefix in the registry. |

| **If** | no contextual prefix has been defined for the imported `ontology`, |
|---|---|
| **Then** | the imported entities are displayed with the prefix of the imported `ontology`'s registry entry. |

The contextual prefix is stored in the importing entry's `import_labels` (registry and `.json` file) and feeds the real import mechanism (`owl:imports`). The registry's import sub-rows also show this contextual prefix.

---

**Source code:** `main.py` → `get_imported_entities` — For each imported URI, the display prefix is `_importPrefix = import_labels[uri].prefix` (contextual prefix) when defined, otherwise the `prefix` of the imported `ontology`'s registry entry (`imp_entry.prefix`). `triple_store.py` → `_imports_from_ns()` derives `imports` and `import_labels` from the `ns_prefixes` entered in the wizard.

### REQ-ONT-032 — Reading referenced namespaces and imports from a file

| **If** | the ontologist requests reading a file's metadata (`peek`) during an import or a load, |
|---|---|
| **Then** | the system returns, in addition to the name, prefix, and base URI, a `namespaces` list = the referenced `xmlns` bindings (excluding the standards `owl`, `rdf`, `rdfs`, `xsd` and the base URI) together with the declared `owl:imports`, each with a prefix. |

For a declared import, the suggested prefix is derived from a matching `xmlns` binding, otherwise from the URI's last segment.

---

**Source code:** `main.py` → `peek_ontology()` — For `.owl`/`.ttl`, parses the RDF graph with `bind_namespaces="none"` (no rdflib default namespaces injected), collects the non-standard `xmlns` bindings and the `owl:imports`. For `.json`, reads `imports`, `import_labels`, and `ns_prefixes`. The result is exposed under the `namespaces` key.

### REQ-ONT-033 — Emitting owl:imports on RDF export

| **If** | the ontologist exports an `ontology` in RDF format (`.owl` or `.ttl`) and that `ontology` declares imports, |
|---|---|
| **Then** | the exported file contains an `<owl:imports rdf:resource="…"/>` declaration for each imported `ontology`, together with a prefix binding for readability. |

---

**Source code:** `triple_store.py` → `to_rdf_graph()` — For each URI in `onto.imports`, adds the triple `(onto_uri, OWL.imports, URIRef(imp_uri))` and binds the corresponding prefix (from `import_labels`) to the graph.

### REQ-ONT-034 — Persisting imported namespaces and deriving imports

| **If** | an `ontology` is registered, loaded from JSON, or updated with a list of imported namespaces (`ns_prefixes`), |
|---|---|
| **Then** | this list is persisted in the `ontology`'s `ns_prefixes` field, and the `imports` and `import_labels` are derived from it (each namespace becomes an `owl:imports` carrying its contextual prefix). |

---

**Source code:** `owl_model.py` → `OWLOntology.ns_prefixes` (persisted field, `[{prefix, namespace}]`). `triple_store.py` → `register()`, `register_json` (via `update_entry`/`register`), and `update_entry()` accept `ns_prefixes` and call `_imports_from_ns()` to derive `imports`/`import_labels`. `main.py` → `register_json()` now receives a JSON body (`RegisterJsonRequest`) instead of query parameters.

### REQ-ONT-038 — Editing the ontology URI reflected in entity IRIs

| **If** | the ontologist edits the URI of an `ontology` via the editor (the pencil button in the `Ontologies` tab) and confirms, |
|---|---|
| **Then** | the new URI becomes the `ontology`'s `id` (base IRI): it is updated on the connected `ontology` in memory and persisted in its `.json` file (`data["id"]`, `data["prefix"]`), so that it is reflected in the displayed IRIs of **all** entities (`classes`, `ObjectProperties`, `DatatypeProperties`, `AnnotationProperties`, `individuals`) and on RDF export. |

| **If** | a connected `ontology` is read from its registry entry, |
|---|---|
| **Then** | the registry's URI is authoritative for `onto.id` (as was already the case for the `prefix`), overriding the value frozen in the `.json` file. |

| **If** | the base IRI is displayed in front of an entity local id, |
|---|---|
| **Then** | it is normalized by stripping trailing `#`/`/` (`replace(/[#/]+$/, '')`), consistent with the export normalization (`rstrip("#/")`) — never `…/#Entity`. |

---

**Source code:** `triple_store.py` → `update_entry()` — When the registry entry is updated, persists `data["id"] = uri` and `data["prefix"] = prefix` into the `.json` file, and reflects `self._ontology.id = uri` / `self._ontology.prefix = prefix` on the connected ontology in memory. `main.py` → `update_ontology_entry` (calls `store.update_entry(...)`) and `get_current_ontology` (makes the registry URI authoritative for `onto.id` at read time, alongside the prefix). `owl_editor.js` → the base IRI is computed as `baseIri = (APP.state.ontology?.id || '').replace(/[#/]+$/, '')`, matching the export normalization in `to_rdf_graph()` (`onto.id.rstrip("#/")`).

---

## 2. Form — Presentation and UI

> Requirements relating to display: layout, visual components, interactions, navigation, styles.

### REQ-ONT-036 — Active ontology selector in the title bar

| **If** | a user `ontology` is connected, |
|---|---|
| **Then** | its name (or `prefix:name` if a prefix is defined) is displayed in the application title bar as a widget composed of two distinct clickable zones. |

| **If** | the ontologist clicks on the **label** (ontology name), |
|---|---|
| **Then** | the application navigates to the `Ontologies` tab and highlights the connected ontology's row in the registry. |

| **If** | the ontologist clicks on the **▾ button** (dropdown arrow) to the right of the label, |
|---|---|
| **Then** | a dropdown menu displays the list of user `ontologies` only (system ontologies `rdf`, `rdfs`, `owl`, `skos` are excluded), sorted alphabetically, with a `●` indicator next to the currently connected `ontology`; selecting an ontology from this menu connects it immediately **without changing the active tab**, enabling content comparison between multiple `ontologies`. |

| **If** | no `ontology` is connected, |
|---|---|
| **Then** | the widget is hidden. |

---

**Source code:** `app.js` → `_updateTopbarOntology()` — Updates the label and widget visibility; `_topbarOntoNavigate()` — Navigates to the `Ontologies` tab and scrolls to the connected ontology's row; `_topbarOntoDropdown()` — Builds and displays the dropdown from `!readonly` ontologies sorted by `localeCompare`, then calls `API.connectOntology(name)` and `renderSection(this.currentSection)` without modifying `currentSection`. `index.html` — HTML widget: `#topbar-onto-label` (clickable) + `#topbar-onto-arrow` (▾) + `#topbar-onto-dropdown` (menu). `style.css` — Classes `.topbar-onto-wrap`, `.topbar-onto-label`, `.topbar-onto-arrow`, `.topbar-onto-dropdown`, `.topbar-onto-dropdown-item`.

### REQ-ONT-017 — Displaying the Ontologies tab

| **If** | the ontologist navigates to the `Ontologies` tab, |
|---|---|
| **Then** | the page displays a header, the available actions (create, import, load, download W3C `ontologies`), an initially hidden assisted input panel, and the registry table with columns Name, Directory, Prefix, and `Namespace`. |

---

**Source code:** `app.js` → `renderOntologies()` — Injects into `#main-content` the complete HTML structure via `_renderOntologiesShell()` (header, four action buttons, hidden `#onto-wizard` panel, table with columns Name / Directory / Prefix / Namespace), then triggers asynchronous loading of the registry.

### REQ-ONT-018 — Loading and displaying the registry

| **If** | the `Ontologies` tab is displayed, |
|---|---|
| **Then** | the list of all registered `ontologies` is loaded and displayed in the table; if loading fails, an error message is displayed in place of the table. |

---

**Source code:** `app.js` → `renderOntologies()` and `_refreshOntoTable()` — Calls `API.listOntologies()` to obtain the list, generates HTML rows via `_refreshOntoTable()`; if an API error occurs, displays "Unable to load the registry." in the table body.

### REQ-ONT-019 — Selecting a registry row

| **If** | the ontologist clicks on an `ontology` in the registry table, |
|---|---|
| **Then** | the selected row is visually highlighted and any previous selection is cleared. |

---

**Source code:** `app.js` → `selectOntoRow()` — Stores the name in `_selectedOntoName`, removes the CSS class `onto-selected-row` from all rows and applies it to the row corresponding to the selected name.

### REQ-ONT-020 — Displaying the ontology counter

| **If** | the registry is loaded, |
|---|---|
| **Then** | the total number of registered `ontologies` is displayed, with a label correctly inflected in the singular or plural. |

---

**Source code:** `app.js` → `_refreshOntoTable()` — Updates the content of `#onto-registry-count` with the text "N ontology" or "N ontologies" based on the number of entries returned by `API.listOntologies()`.

### REQ-ONT-021 — Editing the attributes of an existing ontology

| **If** | the ontologist wishes to modify the attributes of an already registered `ontology`, |
|---|---|
| **Then** | a form pre-filled with the current values (name, directory, prefix, URI) opens to allow them to make changes, and the directory can be selected via a file browser. |

---

**Source code:** `app.js` → `doEditOntology()` — Calls `API.listOntologies()` to retrieve the entry, opens the wizard panel in `'edit'` mode, injects a form pre-filled with the current values, stores the original name in the hidden field `wiz-edit-orig`, and initializes `FsBrowser` for directory selection.

### REQ-ONT-022 — Export format selection dropdown

| **If** | the ontologist wishes to export an `ontology` or a set of rules and clicks the export button, |
|---|---|
| **Then** | a context menu presents the available formats depending on the type of content to export (OWL and Turtle formats for an `ontology`; SWRL and SWORD formats for rules); clicking outside the menu closes it. |

---

**Source code:** `app.js` → `_ontoExportDropdown()` — Dynamically builds and positions a context menu in `position:fixed` anchored below the button; the options depend on the `kind` parameter: `'onto'` → OWL (`.owl`) and Turtle (`.ttl`); `'rules'` → SWRL (`.json`) and SWORD (`.swd`); a `click` listener on `document` closes the menu when clicking outside.

### REQ-ONT-023 — Displaying the import tree with expand/collapse

| **If** | the registry is displayed and an `ontology` declares imports, |
|---|---|
| **Then** | the imported `ontologies` are displayed as indented sub-rows; if an import itself has sub-imports, the ontologist can expand or collapse that tree node; import cycles are detected and do not cause an infinite loop. |

---

**Source code:** `app.js` → `_refreshOntoTable()` (inner function `renderImportRows()`) and `toggleImportRow()` — Imports are rendered recursively with a `visited` parameter for cycle detection; the expansion state is stored in the `Set` `_ontoImportExpanded`; `toggleImportRow(path)` adds or removes the path from the `Set` then calls `_refreshOntoTable()` again.

### REQ-ONT-024 — Navigating to a registry entry from the import tree

| **If** | in an `ontology`'s import tree, the ontologist clicks on the **prefix** of an imported `ontology`, |
|---|---|
| **Then** | the corresponding row in the registry table is selected, visually highlighted, and scrolled into `view`, so the ontologist can locate it easily. |

| **If** | in an `ontology`'s import tree, the ontologist clicks on the **URI** of an imported `ontology`, |
|---|---|
| **Then** | the corresponding web page is opened in a new browser tab. |

---

**Source code:** `app.js` → `_scrollToRegistryRow()` — Each import-tree link is split into two clickable parts: the **prefix** calls `_scrollToRegistryRow()`, which locates the matching `tr[data-name]` row, selects it, calls `scrollIntoView()` and applies a `var(--accent)` colored outline to it for 1.5 seconds; the **URI** opens the corresponding web page in a new tab (`target="_blank"`).

### REQ-ONT-025 — Opening the directory in Finder

| **If** | the ontologist clicks on the directory of an `ontology` in the table, |
|---|---|
| **Then** | the storage directory of that `ontology` is opened in the system file manager; if this action fails, a warning message is displayed. |

---

**Source code:** `app.js` → `_refreshOntoTable()` (`onclick` attribute of the Directory cell) — Calls `API.revealInFinder(path)`; if it fails (in particular if `host_agent.py` is not running), displays a warning via `UI.warn()`.

### REQ-ONT-026 — Toggleable wizard panel (open/close)

| **If** | the ontologist clicks an action button and the assisted input panel is already showing the form corresponding to that action, |
|---|---|
| **Then** | the panel closes (toggle behavior). |

| **If** | the ontologist clicks an action button and the panel is showing a different form or is closed, |
|---|---|
| **Then** | the panel opens and displays the form corresponding to the requested action (create, import, or load an `ontology`). |

---

**Source code:** `app.js` → `_openWizard()` and `_closeWizard()` — `_openWizard()` compares the requested type with `panel.dataset.type`: if identical, calls `_closeWizard()`; otherwise, sets `panel.dataset.type`, makes the panel visible, and injects the form HTML via `_wizardNew()`, `_wizardImport()`, or `_wizardLoad()`. `_closeWizard()` hides the panel and resets `panel.dataset.type`.

### REQ-ONT-027 — Splitting the registry into User and System sections

| **If** | the `ontology` registry is displayed, |
|---|---|
| **Then** | it is divided into two sections: a "USER REGISTRY" section grouping the `ontologies` loaded or created by the user, and a "SYSTEM REGISTRY" section grouping the built-in W3C `ontologies` (`rdf`, `rdfs`, `owl`, `skos`). |

| **If** | the ontologist clicks the "SYSTEM REGISTRY" section header, |
|---|---|
| **Then** | that section folds or unfolds (toggle behavior), with a caret indicating its state; a counter shows the number of system `ontologies` it contains. |

---

**Source code:** `app.js` → `_refreshOntoTable()` — Splits the rows into two distinct sections: "USER REGISTRY" for ontologies whose `readonly` flag is false, "SYSTEM REGISTRY" for the `readonly` W3C ontologies. The system section header is collapsible via a caret and displays a count of the number of system entries.

### REQ-ONT-029 — Exporting rules in SWORD format (.swd)

| **If** | the ontologist opens the "Rules" export menu in the `Ontologies` tab, |
|---|---|
| **Then** | the menu offers the `↓ SWORD (.swd)` option and the exported file uses the `.swd` extension. |

The internal export format identifier (`fmt: 'sword'`) is unchanged; only the menu label and the generated file extension change from `.sword` to `.swd`.

---

**Source code:** `app.js` → export dropdown (`_ontoExportDropdown()`) and `exportOntologyByName()` — The rules option now reads `↓ SWORD (.swd)` and the download uses the `.swd` extension; the internal format passed to the API (`fmt: 'sword'`) is preserved.

### REQ-ONT-030 — Editable "Imported namespaces" section in the wizards

| **If** | the ontologist opens any of the `ontology` wizards (New, Import, Edit, or Load), |
|---|---|
| **Then** | an editable "Imported namespaces" section is presented as a table of rows (prefix → namespace), with a `+ namespace` button to add a row and a `✕` control to remove it; each row declares an imported `ontology` (`owl:imports`) together with a contextual prefix chosen by the ontologist. |

| **If** | the ontologist uses an Import or Load wizard and clicks "Read prefix, URI &amp; imports from file", |
|---|---|
| **Then** | the "Imported namespaces" section is pre-filled from the namespaces read in the file (see REQ-ONT-032). |

The Import and Load wizards are homogenised (same sections, same labels, same button presentation).

---

**Source code:** `app.js` → `_wizImpAddNs()`, `_wizImpCollectNs()`, and the wizard renderers (`_wizardNew()`, `_wizardImport()`, `_wizardLoad()`, the edit form in `doEditOntology()`) — Each wizard contains a list of `prefix → namespace` rows (`wiz-new-ns-list`, the `wiz-import` default, `wiz-load-ns-list`, `wiz-edit-ns-list`) with `+ namespace` / `✕` buttons; `_wizImpCollectNs()` collects the valid rows into `ns_prefixes` passed to `registerOntology` / `importFromPath` / `registerJson` / `updateOntologyEntry`.

### REQ-ONT-035 — Opening the ontology namespace from the registry

| **If** | the ontologist clicks the namespace (URI, 4th column) of an `ontology` in the registry table, |
|---|---|
| **Then** | the namespace URI is opened in a new browser tab. |

| **If** | the `ontology`'s namespace URI is empty, |
|---|---|
| **Then** | the cell displays a dash `—` and is not clickable. |

---

**Source code:** `app.js` → `_refreshOntoTable()` (`renderRow` function) — The Namespace cell is rendered as a clickable `<code class="onto-ns-link">` whose `onclick` calls `window.open(uri, '_blank', 'noopener')` (with `event.stopPropagation()` so the row is not selected); if the URI is empty, displays `—`.

### REQ-ONT-037 — Exporting an ontology as a standalone navigable HTML page

| **If** | the ontologist clicks the `↓ HTML` action on a registry row (the export targets the currently connected `ontology`; if a different `ontology` is connected, a warning asks to connect the right one first), |
|---|---|
| **Then** | a single self-contained HTML page is generated and downloaded; the page reproduces the SWOWL look &amp; feel (dark theme, tabbed navigation, hierarchical trees, and entity cards rendered like the SWOWL editor — boxed frames with type icons: copper circle for classes, blue rectangle for object properties, green rectangle for datatype properties, yellow rectangle for annotation properties, purple diamond for individuals, gear for rules). |

| **If** | the ontology contains classes, object properties, datatype properties, annotation properties, individuals, or SWRL rules, |
|---|---|
| **Then** | the page presents one tab per non-empty category (each with a count badge); classes / object properties / datatype properties / annotation properties show a navigation tree plus a "Super …" panel and a detail pane, individuals show a three-column layout (classes tree → individuals list → detail), and rules show a tree plus detail. |

| **If** | the ontologist opens the detail card of an entity, |
|---|---|
| **Then** | the card shows the same cross-reference frames as SWOWL, only when non-empty: for classes — "Annotation(s)", "Properties and Restrictions", "Where Used in Range", "Disjoints", "Equivalent", "SubClassOf", "Individuals", "Where Used in Rules"; for object properties — "Domain(s)", "Range(s)", "SubPropertyOf", "Inverse Of", "Characteristics", "Where Used in Rules"; for datatype properties — "Domain(s)", "Range", "SubPropertyOf", "Characteristics"; for individuals — "Types (rdf:type)", "Object assertions", "Data assertions", "sameAs", "differentFrom", "Where Used in Rules"; for rules — "if" / "then". Each frame carries a count badge and clickable references that navigate to the referenced entity (external/namespaced ids such as `owl:Thing` or `xsd:*` are shown as plain text). |

| **If** | the ontologist opens the "Ontology (Network)" tab, |
|---|---|
| **Then** | a D3.js force-directed graph (D3 loaded from a CDN) displays nodes for classes, object properties, datatype properties, and individuals, connected by directed edges for `subClassOf`, `domain`, `range`, `type`, and object assertions; the panel offers a hover tooltip, a "Fit" button, and a colour legend for node and edge kinds. |

| **If** | the ontologist types in the search box in the page header, |
|---|---|
| **Then** | entities are filtered by their id, display label, annotations, and referenced content, and selecting a result navigates to the matching entity. |

---

**Source code:** `app.js` → `exportHtmlSite()` — Builds a single HTML document (inline CSS reproducing the SWOWL editor styling and icons) from `APP.state`: refuses to run if no ontology is connected or warns if a different ontology is connected; renders boxed frames via `frame()` / `xrefFrame()` with the exact labels listed above ("Properties and Restrictions", "Where Used in Range", "Disjoints", "Equivalent", "SubClassOf", "Individuals", "Where Used in Rules", etc.); builds a per-category tab/panel layout (`tabs`, `panels`, `treeRows()`), an "Ontology (Network)" tab (`networkTab` / `networkPanel`) rendering a D3.js force-directed graph from `gNodes` / `gEdges` (D3 from a CDN), and a header search box filtering on each card's `data-s` text.
