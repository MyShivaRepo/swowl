# Requirements of the ObjectProperties Tab — SWOWL

**Date:** 2026-06-06
**Note:** Requirements derived STRICTLY from the source code. Each requirement cites the JavaScript function that implements it. No functionality is extrapolated.

---

## Table of Contents

1. [REQ-OP-001 — Display of the object property tree](#req-op-001)
2. [REQ-OP-002 — Building the tree hierarchy](#req-op-002)
3. [REQ-OP-003 — Automatic expansion of ancestors](#req-op-003)
4. [REQ-OP-004 — Rendering a tree node with the inverseOf tag](#req-op-004)
5. [REQ-OP-005 — Selection of owl:topObjectProperty](#req-op-005)
6. [REQ-OP-006 — Selection of a property in the tree](#req-op-006)
7. [REQ-OP-007 — Context-sensitive activation of tree toolbar buttons](#req-op-007)
8. [REQ-OP-008 — Expansion/collapse of a tree node](#req-op-008)
9. [REQ-OP-009 — Creation of a child property](#req-op-009)
10. [REQ-OP-010 — Creation of a sibling property](#req-op-010)
11. [REQ-OP-011 — Automatic generation of a unique identifier](#req-op-011)
12. [REQ-OP-012 — Persistence of property creation via the API](#req-op-012)
13. [REQ-OP-013 — Context menu on right-click on the tree](#req-op-013)
14. [REQ-OP-014 — Drag-and-drop reordering in the tree](#req-op-014)
15. [REQ-OP-015 — Cycle protection during drag-and-drop](#req-op-015)
16. [REQ-OP-016 — Deletion of a property with confirmation](#req-op-016)
17. [REQ-OP-017 — Edit form for an object property](#req-op-017)
18. [REQ-OP-018 — Annotation management (labels, comments, others)](#req-op-018)
19. [REQ-OP-019 — Adding a class to the domain](#req-op-019)
20. [REQ-OP-020 — Removing a class from the domain](#req-op-020)
21. [REQ-OP-021 — Adding a class to the range](#req-op-021)
22. [REQ-OP-022 — Removing a class from the range](#req-op-022)
23. [REQ-OP-023 — Defining the inverse property](#req-op-023)
24. [REQ-OP-024 — Uniqueness of the inverse property](#req-op-024)
25. [REQ-OP-025 — Removing the inverse property](#req-op-025)
26. [REQ-OP-026 — Display of inferred inverse properties](#req-op-026)
27. [REQ-OP-027 — Super-property management (subPropertyOf)](#req-op-027)
28. [REQ-OP-028 — "Super Properties" panel with ancestor chain](#req-op-028)
29. [REQ-OP-029 — OWL characteristics of the property](#req-op-029)
30. [REQ-OP-030 — Auto-save in edit mode](#req-op-030)
31. [REQ-OP-031 — Full save (creation or update)](#req-op-031)
32. [REQ-OP-032 — Two-panel resizable layout](#req-op-032)
33. [REQ-OP-033 — Restoring selection after re-rendering](#req-op-033)
34. [REQ-OP-034 — Creation of an ObjectProperty from the Classes tab](#req-op-034)

---

### REQ-OP-001 — Display of the object property tree {#req-op-001}

**Source code:** `owl_editor.js` → `OPEditor.renderTree()`

The `renderTree()` function generates the full HTML of the ObjectProperties tree. It places a fixed root node `owl:topObjectProperty` (clickable via `OPEditor.selectTopProp()`) at the top, then recursively calls `_renderNode()` for each root property (those without a parent in `subPropertyOf`). If no property exists, a "No ObjectProperty" message is displayed instead.

---

### REQ-OP-002 — Building the tree hierarchy {#req-op-002}

**Source code:** `owl_editor.js` → `OPEditor.buildTree()`

The `buildTree()` function computes, from the `APP.state.object_properties` array, the list of children for each node (`childrenOf`) and the list of root nodes (`roots`). Only `subPropertyOf` references pointing to existing IDs in the array are taken into account. The lists are sorted alphabetically (case-insensitive via `localeCompare`).

---

### REQ-OP-003 — Automatic expansion of ancestors {#req-op-003}

**Source code:** `owl_editor.js` → `OPEditor._expandAncestors()`

When a property is selected or created, `_expandAncestors()` recursively traverses the `subPropertyOf` chain of the property and adds each ancestor to `OPEditor._expanded` so that the path to the property is visible in the tree.

---

### REQ-OP-004 — Rendering a tree node with the inverseOf tag {#req-op-004}

**Source code:** `owl_editor.js` → `OPEditor._renderNode()`

The `_renderNode()` function generates the HTML for a tree node. Each node is `draggable="true"` and carries the handlers `ondragstart`, `ondragover`, `ondragleave`, `ondrop`, `ondragend`. If the property has a non-null `inverseOf` field, a badge `↔ <id>` is displayed next to the label. Indentation is computed based on depth (`depth * 16 + 6` px). Children are rendered in a container `op-tcn-<id>` whose visibility is controlled by `OPEditor._expanded`.

---

### REQ-OP-005 — Selection of owl:topObjectProperty {#req-op-005}

**Source code:** `owl_editor.js` → `OPEditor.selectTopProp()`

On click on the root node `owl:topObjectProperty`, `selectTopProp()` sets `_selectedId = null` and `_topPropSelected = true`, applies the CSS class `selected` to the root node, replaces the detail panel content with a welcome message containing a "＋ Create Object Property" button, clears the "Super Properties" panel, and updates the toolbar button states via `_updateTreeButtons()`.

---

### REQ-OP-006 — Selection of a property in the tree {#req-op-006}

**Source code:** `owl_editor.js` → `OPEditor.selectProp()`

On click on a node, `selectProp(id)` updates `_selectedId`, applies the `selected` class to the correct tree item, replaces the detail panel with `renderForm(prop)`, initialises internal vertical resizers (`_initHResizers`), refreshes the "Super Properties" panel via `_updateSuperPanel()`, updates the buttons via `_updateTreeButtons()`, and triggers the loading of inverse inferences via `_loadInferredInverse()`.

---

### REQ-OP-007 — Context-sensitive activation of tree toolbar buttons {#req-op-007}

**Source code:** `owl_editor.js` → `OPEditor._updateTreeButtons()`

`_updateTreeButtons()` enables or disables the three toolbar buttons (`op-btn-child`, `op-btn-sister`, `op-btn-delete`) based on the current selection: if `owl:topObjectProperty` is selected, only the "Child" button is active; if a property is selected, all three buttons are active; otherwise, all are disabled.

---

### REQ-OP-008 — Expansion/collapse of a tree node {#req-op-008}

**Source code:** `owl_editor.js` → `OPEditor.toggleNode()`

`toggleNode(id)` toggles the visibility of the container `op-tcn-<id>` between `display:none` and `display:block`, updates `OPEditor._expanded` (adding or removing the ID), and rotates the triangle `▶` via the CSS class `open`.

---

### REQ-OP-009 — Creation of a child property {#req-op-009}

**Source code:** `owl_editor.js` → `OPEditor.createChild()`

`createChild()` determines the parent as `_selectedId` (or no parent if `owl:topObjectProperty`), adds the parent to `_expanded` so it is open in the tree, then delegates to `_createAndSelect([parent])`.

---

### REQ-OP-010 — Creation of a sibling property {#req-op-010}

**Source code:** `owl_editor.js` → `OPEditor.createSibling()`

`createSibling()` retrieves the list of direct parents of the selected property (field `subPropertyOf`), adds all of them to `_expanded`, then delegates to `_createAndSelect(parents)` to create a new property with the same parents.

---

### REQ-OP-011 — Automatic generation of a unique identifier {#req-op-011}

**Source code:** `owl_editor.js` → `OPEditor._generatePropName()`

`_generatePropName()` generates an identifier of the form `NewObjectProperty`, `NewObjectProperty1`, `NewObjectProperty2`, etc., incrementing a numeric suffix as long as the ID is already present in `APP.state.object_properties`.

---

### REQ-OP-012 — Persistence of property creation via the API {#req-op-012}

**Source code:** `owl_editor.js` → `OPEditor._createAndSelect()`

`_createAndSelect(subPropertyOf)` builds a minimal property object (with `domain: [], range: [], inverseOf: null, characteristics: {}, propertyChainAxiom: []`) and calls `API.createOP(prop)`. On success, it sets `_selectedId` and `_editingId`, calls `APP.refresh()` to reload the global state, then `APP.renderSection('object-properties')` to re-render the tab. Errors are displayed via `UI.error()`.

---

### REQ-OP-013 — Context menu on right-click on the tree {#req-op-013}

**Source code:** `owl_editor.js` → `OPEditor.showContextMenu()`

`showContextMenu(event, id)` intercepts the right-click on a node or on the root. It creates a DOM element `div#op-ctx-menu` positioned at the mouse coordinates, containing the actions "Add Child Property", "Add Sibling Property" (only if a non-root property is targeted), and "Delete". The menu closes automatically on the next outside click via a `click` listener in capture mode.

---

### REQ-OP-014 — Drag-and-drop reordering in the tree {#req-op-014}

**Source code:** `owl_editor.js` → `OPEditor.onDrop()`

`onDrop(event, targetId)` receives the ID of the dropped property (from `_dragId`) and the target ID. It rebuilds the property with `subPropertyOf: [targetId]` (or `[]` if dropped on the root) and calls `API.updateOP(draggedId, updated)`. On success, it displays `UI.success()`, refreshes the state via `APP.refresh()`, and re-renders the tab.

---

### REQ-OP-015 — Cycle protection during drag-and-drop {#req-op-015}

**Source code:** `owl_editor.js` → `OPEditor._isDescendant()` and `OPEditor.onDrop()`

Before allowing the drop, `onDrop()` calls `_isDescendant(targetId, draggedId)`. This function recursively traverses `childrenOf` (obtained via `buildTree()`) to check whether `targetId` is a descendant of the dragged property. If so, the drop is blocked with the message `UI.warn('Cannot drop on a descendant — would create a cycle')`. The same check is performed in `onDragOver()` to disable the visual drop indicator.

---

### REQ-OP-016 — Deletion of a property with confirmation {#req-op-016}

**Source code:** `owl_editor.js` → `OPEditor.delete()`

`delete(id)` displays a confirmation dialog via `UI.confirm()` with the message `Delete ObjectProperty <strong>${id}</strong>?`. If confirmed, it calls `API.deleteOP(id)`, resets `_selectedId` and `_editingId` to `null`, then refreshes the tab. `deleteSelected()` is a shortcut that calls `delete(this._selectedId)` if a property is selected.

---

### REQ-OP-017 — Edit form for an object property {#req-op-017}

**Source code:** `owl_editor.js` → `OPEditor.renderForm()`

`renderForm(prop)` generates the full HTML form for a property. It contains: a text field `op-id` for the local identifier (with `_sanitizeId()` called on each keystroke), the full IRI computed from `APP.state.ontology.id`, the Annotations block, the Domain and Range blocks side by side, the "Inverse Of" block, the "Characteristics" block, and a "Where Used" frame via `_whereUsedFrame()`. For a new property (`isNew = true`), saving is triggered on `onblur`; for an existing property, on `onchange`.

---

### REQ-OP-018 — Annotation management (labels, comments, others) {#req-op-018}

**Source code:** `owl_editor.js` → `OPEditor.addAnnotRow()`, `OPEditor.addOtherAnnotRow()`, `OPEditor.removeAnnotRow()`

- `addAnnotRow(type)` adds a row in `#op-annotations-body` via `_makeAnnotRow()` for types `label` or `comment`.
- `addOtherAnnotRow(prop)` adds a row of type `other` with the specified annotation property, then closes the picker `op-anno-picker`.
- `removeAnnotRow(btn)` removes the parent `<tr>` row of the clicked button and triggers `autoSave()` if in edit mode.

---

### REQ-OP-019 — Adding a class to the domain {#req-op-019}

**Source code:** `owl_editor.js` → `OPEditor.addDomain()`

`addDomain(id)` adds the selected class ID to the DOM list `#op-domain-list` via `_addListItem()` (closing the picker `op-domain-picker`) and triggers `autoSave()` if a property is being edited. If no domain is defined, the placeholder `owl:Thing` is displayed.

---

### REQ-OP-020 — Removing a class from the domain {#req-op-020}

**Source code:** `owl_editor.js` → `OPEditor.removeDomain()`

`removeDomain(id)` removes the corresponding item from `#op-domain-list` via `_removeListItem()` (restoring the placeholder `owl:Thing` if the list is empty) and triggers `autoSave()` if in edit mode.

---

### REQ-OP-021 — Adding a class to the range {#req-op-021}

**Source code:** `owl_editor.js` → `OPEditor.addRange()`

`addRange(id)` adds the class ID to `#op-range-list` via `_addListItem()` and triggers `autoSave()`. If no range is defined, the placeholder `owl:Thing` is displayed.

---

### REQ-OP-022 — Removing a class from the range {#req-op-022}

**Source code:** `owl_editor.js` → `OPEditor.removeRange()`

`removeRange(id)` removes the item from `#op-range-list` via `_removeListItem()` (restoring the placeholder `owl:Thing`) and triggers `autoSave()`.

---

### REQ-OP-023 — Defining the inverse property {#req-op-023}

**Source code:** `owl_editor.js` → `OPEditor.setInverse()`

`setInverse(id)` updates the hidden field `#op-inverse-value` with the selected ID, replaces the placeholder "— none —" in `#op-inverse-body` with an item containing a delete button, hides the `+` button via `display:none`, closes the picker `op-inverse-picker`, and triggers `autoSave()`. Navigation to the inverse property is possible via `APP.navigateTo()` from the item label.

---

### REQ-OP-024 — Uniqueness of the inverse property {#req-op-024}

**Source code:** `owl_editor.js` → `OPEditor.showPicker()`

`showPicker('op-inverse-picker')` checks whether `#op-inverse-value` already contains a value: if so, it returns immediately without opening the picker, ensuring that only one inverse property can be defined at a time. Additionally, the inverse picker excludes properties that already have an `inverseOf` defined (except toward the current property).

---

### REQ-OP-025 — Removing the inverse property {#req-op-025}

**Source code:** `owl_editor.js` → `OPEditor.removeInverse()`

`removeInverse()` is an alias for `setInverse('')`: it clears the value of `#op-inverse-value`, re-displays the placeholder "— none —", and makes the `+` button visible again to allow a new selection.

---

### REQ-OP-026 — Display of inferred inverse properties {#req-op-026}

**Source code:** `owl_editor.js` → `OPEditor._loadInferredInverse()`

On each property selection, `_loadInferredInverse(id)` calls `API.getInferences()` and filters the results on `inferred_inverse_properties` to retain only inferences concerning the current property. For each inference found, a badge `⊢ inverse of <strong>${i.inverse_of}</strong>` is injected into `#op-inferred-inverse`, with the `title` attribute carrying the reason for the inference. Errors are silently ignored.

---

### REQ-OP-027 — Super-property management (subPropertyOf) {#req-op-027}

**Source code:** `owl_editor.js` → `OPEditor.addSubProp()`, `OPEditor.removeSubProp()`

- `addSubProp(id)` adds the selected property to `#op-sub-list` via `_addListItem()` and triggers `autoSave()`.
- `removeSubProp(id)` removes the super-property from `#op-sub-list` via `_removeListItem()` and triggers `autoSave()`.

---

### REQ-OP-028 — "Super Properties" panel with ancestor chain {#req-op-028}

**Source code:** `owl_editor.js` → `OPEditor._updateSuperPanel()`

`_updateSuperPanel(prop)` fills the left panel `#op-sub-list` with the list of direct super-properties of `prop`. For each direct super-property, it builds the full ancestor chain up to `owl:topObjectProperty` (via a `buildChain()` loop) and displays each link with increasing indentation. Direct super-properties have a delete button `✕`; transitive ancestors are displayed in italics with reduced opacity (0.75). A click on any ancestor navigates to that property via `APP.navigateTo()`.

---

### REQ-OP-029 — OWL characteristics of the property {#req-op-029}

**Source code:** `owl_editor.js` → `OPEditor.renderForm()` and `OPEditor.save()`

The form generated by `renderForm()` contains a grid of 7 checkboxes corresponding to OWL characteristics: `functional`, `inverseFunctional`, `transitive`, `symmetric`, `asymmetric`, `reflexive`, `irreflexive`. Each checkbox is pre-checked according to `prop.characteristics[k]`. During save, `save()` reads each checkbox via `document.getElementById('op-${k}')?.checked` and builds the `chars` object that is included in the payload sent to `API.updateOP()` or `API.createOP()`.

---

### REQ-OP-030 — Auto-save in edit mode {#req-op-030}

**Source code:** `owl_editor.js` → `OPEditor.autoSave()`

`autoSave()` checks that `_editingId !== null` (i.e. an existing property is being edited) before calling `save(false)`. It is triggered on the `onchange` events of all form fields when the property is in edit mode (as opposed to creation mode, where saving occurs on `onblur`).

---

### REQ-OP-031 — Full save (creation or update) {#req-op-031}

**Source code:** `owl_editor.js` → `OPEditor.save()`

`save(isNew)` collects all form data: the identifier (`op-id`), annotations (`_collectAnnotations('op-annotations-body')`), domain (`_collectList('op-domain-list')`), range (`_collectList('op-range-list')`), super-properties (`_collectList('op-sub-list')`), inverse property (`#op-inverse-value`), and the 7 characteristics. The identifier is validated via `_validateId()`. If `isNew`, calls `API.createOP()`; otherwise `API.updateOP(originalId, prop)`. If the ID has changed, a rename message is displayed. In both cases, the tab is refreshed after success.

---

### REQ-OP-032 — Two-panel resizable layout {#req-op-032}

**Source code:** `owl_editor.js` → `OPEditor.renderSplit()` and `OPEditor._initSplitPane()`

`renderSplit()` generates a two-column layout: a left panel (`op-tree-panel`) containing the tree and the "Super Properties" sub-panel separated by a horizontal resizer `h-resizer`, and a right detail panel (`op-detail`). `_initSplitPane()` initialises the vertical resizer between the two columns (`op-split-handle`) via a `mousedown` listener that adjusts the width of the left panel between 160 px and 520 px, and calls `_initHResizers('op-tree-panel')` for the internal horizontal resizer.

---

### REQ-OP-033 — Restoring selection after re-rendering {#req-op-033}

**Source code:** `owl_editor.js` → `OPEditor.restoreSelection()`

`restoreSelection()` calls `_initSplitPane()` then, based on the memorised state, calls `selectTopProp()` if `_topPropSelected` is true, or `selectProp(_selectedId)` if an ID is memorised. This function is called after each re-rendering of the section to maintain the current selection.

---

### REQ-OP-034 — Creation of an ObjectProperty from the Classes tab {#req-op-034}

**Source code:** `owl_editor.js` → anonymous function in `CLSEditor` (line ~613), identified by the comment `Creates an ObjectProperty with domain = selected class`

From the Classes tab, a "Create new ObjectProperty" button calls a function that generates a name via `OPEditor._generatePropName()`, creates a property with `domain: [classId]` and all other fields empty, saves it via `API.createOP()`, sets `OPEditor._selectedId` and `OPEditor._editingId` to the new ID, then navigates to the `object-properties` tab via `APP.navigateTo()`.

---

*Document generated by static analysis of the source code — claude-sonnet-4-6*
