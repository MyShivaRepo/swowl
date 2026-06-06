# Requirements — ObjectProperties

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-OP-002 — Tree hierarchy construction](#req-op-002--tree-hierarchy-construction)
- [REQ-OP-003 — Automatic ancestor expansion](#req-op-003--automatic-ancestor-expansion)
- [REQ-OP-009 — Child property creation](#req-op-009--child-property-creation)
- [REQ-OP-010 — Sibling property creation](#req-op-010--sibling-property-creation)
- [REQ-OP-011 — Automatic unique identifier generation](#req-op-011--automatic-unique-identifier-generation)
- [REQ-OP-012 — Property creation persistence via API](#req-op-012--property-creation-persistence-via-api)
- [REQ-OP-014 — Drag-and-drop move in the tree](#req-op-014--drag-and-drop-move-in-the-tree)
- [REQ-OP-015 — Cycle protection during drag-and-drop](#req-op-015--cycle-protection-during-drag-and-drop)
- [REQ-OP-016 — Property deletion with confirmation](#req-op-016--property-deletion-with-confirmation)
- [REQ-OP-019 — Adding a class to the domain](#req-op-019--adding-a-class-to-the-domain)
- [REQ-OP-020 — Removing a class from the domain](#req-op-020--removing-a-class-from-the-domain)
- [REQ-OP-021 — Adding a class to the range](#req-op-021--adding-a-class-to-the-range)
- [REQ-OP-022 — Removing a class from the range](#req-op-022--removing-a-class-from-the-range)
- [REQ-OP-023 — Inverse property definition](#req-op-023--inverse-property-definition)
- [REQ-OP-024 — Inverse property uniqueness](#req-op-024--inverse-property-uniqueness)
- [REQ-OP-025 — Inverse property removal](#req-op-025--inverse-property-removal)
- [REQ-OP-026 — Display of inferred inverse properties](#req-op-026--display-of-inferred-inverse-properties)
- [REQ-OP-027 — Super-properties management (subPropertyOf)](#req-op-027--super-properties-management-subpropertyof)
- [REQ-OP-029 — OWL property characteristics](#req-op-029--owl-property-characteristics)
- [REQ-OP-030 — Auto-save in edit mode](#req-op-030--auto-save-in-edit-mode)
- [REQ-OP-031 — Full save (create or update)](#req-op-031--full-save-create-or-update)
- [REQ-OP-034 — ObjectProperty creation from the Classes tab](#req-op-034--objectproperty-creation-from-the-classes-tab)

### Form
- [REQ-OP-001 — Object property tree display](#req-op-001--object-property-tree-display)
- [REQ-OP-004 — Tree node rendering with inverseOf tag](#req-op-004--tree-node-rendering-with-inverseof-tag)
- [REQ-OP-005 — Selection of owl:topObjectProperty](#req-op-005--selection-of-owltopobjectproperty)
- [REQ-OP-006 — Property selection in the tree](#req-op-006--property-selection-in-the-tree)
- [REQ-OP-007 — Contextual activation of tree buttons](#req-op-007--contextual-activation-of-tree-buttons)
- [REQ-OP-008 — Tree node expand/collapse](#req-op-008--tree-node-expandcollapse)
- [REQ-OP-013 — Context menu on right-click in the tree](#req-op-013--context-menu-on-right-click-in-the-tree)
- [REQ-OP-017 — Object property edit form](#req-op-017--object-property-edit-form)
- [REQ-OP-018 — Annotation management (labels, comments, others)](#req-op-018--annotation-management-labels-comments-others)
- [REQ-OP-028 — "Super Properties" panel with ancestor chain](#req-op-028--super-properties-panel-with-ancestor-chain)
- [REQ-OP-032 — Two-panel resizable layout](#req-op-032--two-panel-resizable-layout)
- [REQ-OP-033 — Selection restoration after re-render](#req-op-033--selection-restoration-after-re-render)

---

## 1. Substance — Business logic and functional rules

> Requirements independent of the UI: OWL rules, data constraints, algorithms, persistence.


### REQ-OP-002 — Tree hierarchy construction

The `buildTree()` function computes, from the `APP.state.object_properties` array, the list of children for each node (`childrenOf`) and the list of root nodes (`roots`). Only `subPropertyOf` references pointing to IDs that exist in the array are taken into account. Lists are sorted alphabetically (case-insensitive via `localeCompare`).

---

**Source code:** `owl_editor.js` → `OPEditor.buildTree()`

### REQ-OP-003 — Automatic ancestor expansion

When a property is selected or created, `_expandAncestors()` recursively traverses the property's `subPropertyOf` chain and adds each ancestor to `OPEditor._expanded` so that the path to the property is visible in the tree.

---

**Source code:** `owl_editor.js` → `OPEditor._expandAncestors()`

### REQ-OP-009 — Child property creation

`createChild()` determines the parent as `_selectedId` (or no parent if it is `owl:topObjectProperty`), adds the parent to `_expanded` so that it is open in the tree, then delegates to `_createAndSelect([parent])`.

---

**Source code:** `owl_editor.js` → `OPEditor.createChild()`

### REQ-OP-010 — Sibling property creation

`createSibling()` retrieves the list of direct parents of the selected property (field `subPropertyOf`), adds them all to `_expanded`, then delegates to `_createAndSelect(parents)` to create a new property with the same parents.

---

**Source code:** `owl_editor.js` → `OPEditor.createSibling()`

### REQ-OP-011 — Automatic unique identifier generation

`_generatePropName()` generates an identifier of the form `NewObjectProperty`, `NewObjectProperty1`, `NewObjectProperty2`, etc., incrementing a numeric suffix as long as the ID is already present in `APP.state.object_properties`.

---

**Source code:** `owl_editor.js` → `OPEditor._generatePropName()`

### REQ-OP-012 — Property creation persistence via API

`_createAndSelect(subPropertyOf)` builds a minimal property object (with `domain: [], range: [], inverseOf: null, characteristics: {}, propertyChainAxiom: []`) and calls `API.createOP(prop)`. On success, it sets `_selectedId` and `_editingId`, calls `APP.refresh()` to reload the global state, then `APP.renderSection('object-properties')` to re-render the tab. Errors are displayed via `UI.error()`.

---

**Source code:** `owl_editor.js` → `OPEditor._createAndSelect()`

### REQ-OP-014 — Drag-and-drop move in the tree

`onDrop(event, targetId)` receives the ID of the dropped property (from `_dragId`) and the target ID. It rebuilds the property with `subPropertyOf: [targetId]` (or `[]` if dropped onto the root) and calls `API.updateOP(draggedId, updated)`. On success, it displays `UI.success()`, refreshes the state via `APP.refresh()`, and re-renders the tab.

---

**Source code:** `owl_editor.js` → `OPEditor.onDrop()`

### REQ-OP-015 — Cycle protection during drag-and-drop

Before allowing a drop, `onDrop()` calls `_isDescendant(targetId, draggedId)`. This function recursively traverses `childrenOf` (obtained via `buildTree()`) to check whether `targetId` is a descendant of the dragged property. If so, the drop is blocked with the message `UI.warn('Cannot drop on a descendant — would create a cycle')`. The same check is performed in `onDragOver()` to disable the visual drop indicator.

---

**Source code:** `owl_editor.js` → `OPEditor._isDescendant()` and `OPEditor.onDrop()`

### REQ-OP-016 — Property deletion with confirmation

`delete(id)` displays a confirmation dialog via `UI.confirm()` with the message `Delete ObjectProperty <strong>${id}</strong>?`. If confirmed, it calls `API.deleteOP(id)`, resets `_selectedId` and `_editingId` to `null`, then refreshes the tab. `deleteSelected()` is a shortcut that calls `delete(this._selectedId)` if a property is selected.

---

**Source code:** `owl_editor.js` → `OPEditor.delete()`

### REQ-OP-019 — Adding a class to the domain

`addDomain(id)` adds the selected class ID to the DOM list `#op-domain-list` via `_addListItem()` (closing the `op-domain-picker`) and triggers `autoSave()` if a property is being edited. If no domain is defined, the placeholder `owl:Thing` is displayed.

---

**Source code:** `owl_editor.js` → `OPEditor.addDomain()`

### REQ-OP-020 — Removing a class from the domain

`removeDomain(id)` removes the corresponding item from `#op-domain-list` via `_removeListItem()` (restoring the `owl:Thing` placeholder if the list is empty) and triggers `autoSave()` if in edit mode.

---

**Source code:** `owl_editor.js` → `OPEditor.removeDomain()`

### REQ-OP-021 — Adding a class to the range

`addRange(id)` adds the class ID to `#op-range-list` via `_addListItem()` and triggers `autoSave()`. If no range is defined, the placeholder `owl:Thing` is displayed.

---

**Source code:** `owl_editor.js` → `OPEditor.addRange()`

### REQ-OP-022 — Removing a class from the range

`removeRange(id)` removes the item from `#op-range-list` via `_removeListItem()` (restoring the `owl:Thing` placeholder) and triggers `autoSave()`.

---

**Source code:** `owl_editor.js` → `OPEditor.removeRange()`

### REQ-OP-023 — Inverse property definition

`setInverse(id)` updates the hidden field `#op-inverse-value` with the selected ID, replaces the "— none —" placeholder in `#op-inverse-body` with an item containing a delete button, hides the `+` button via `display:none`, closes the `op-inverse-picker`, and triggers `autoSave()`. Navigation to the inverse property is possible via `APP.navigateTo()` from the item label.

---

**Source code:** `owl_editor.js` → `OPEditor.setInverse()`

### REQ-OP-024 — Inverse property uniqueness

`showPicker('op-inverse-picker')` checks whether `#op-inverse-value` already contains a value: if so, it returns immediately without opening the picker, ensuring that only one inverse property can be defined at a time. Furthermore, the inverse picker excludes properties that already have an `inverseOf` defined (except towards the current property).

---

**Source code:** `owl_editor.js` → `OPEditor.showPicker()`

### REQ-OP-025 — Inverse property removal

`removeInverse()` is an alias for `setInverse('')`: it clears the value of `#op-inverse-value`, redisplays the "— none —" placeholder, and makes the `+` button visible again to allow a new selection.

---

**Source code:** `owl_editor.js` → `OPEditor.removeInverse()`

### REQ-OP-026 — Display of inferred inverse properties

On each property selection, `_loadInferredInverse(id)` calls `API.getInferences()` and filters the results on `inferred_inverse_properties` to retain only inferences concerning the current property. For each inference found, a badge `⊢ inverse of <strong>${i.inverse_of}</strong>` is injected into `#op-inferred-inverse`, with the `title` attribute carrying the reason for the inference. Errors are silent.

---

**Source code:** `owl_editor.js` → `OPEditor._loadInferredInverse()`

### REQ-OP-027 — Super-properties management (subPropertyOf)

- `addSubProp(id)` adds the selected property to `#op-sub-list` via `_addListItem()` and triggers `autoSave()`.
- `removeSubProp(id)` removes the super-property from `#op-sub-list` via `_removeListItem()` and triggers `autoSave()`.

---

**Source code:** `owl_editor.js` → `OPEditor.addSubProp()`, `OPEditor.removeSubProp()`

### REQ-OP-029 — OWL property characteristics

The form generated by `renderForm()` contains a grid of 7 checkboxes corresponding to OWL characteristics: `functional`, `inverseFunctional`, `transitive`, `symmetric`, `asymmetric`, `reflexive`, `irreflexive`. Each checkbox is pre-checked according to `prop.characteristics[k]`. During save, `save()` reads each checkbox via `document.getElementById('op-${k}')?.checked` and builds the `chars` object that is included in the payload sent to `API.updateOP()` or `API.createOP()`.

---

**Source code:** `owl_editor.js` → `OPEditor.renderForm()` and `OPEditor.save()`

### REQ-OP-030 — Auto-save in edit mode

`autoSave()` verifies that `_editingId !== null` (i.e., an existing property is being edited) before calling `save(false)`. It is triggered on the `onchange` events of all form fields when the property is in edit mode (as opposed to creation mode where saving is triggered on `onblur`).

---

**Source code:** `owl_editor.js` → `OPEditor.autoSave()`

### REQ-OP-031 — Full save (create or update)

`save(isNew)` collects all form data: the identifier (`op-id`), annotations (`_collectAnnotations('op-annotations-body')`), domain (`_collectList('op-domain-list')`), range (`_collectList('op-range-list')`), super-properties (`_collectList('op-sub-list')`), inverse property (`#op-inverse-value`), and the 7 characteristics. The identifier is validated via `_validateId()`. If `isNew`, calls `API.createOP()`; otherwise `API.updateOP(originalId, prop)`. If the ID has changed, a rename message is displayed. In both cases, the tab is refreshed after success.

---

**Source code:** `owl_editor.js` → `OPEditor.save()`

### REQ-OP-034 — ObjectProperty creation from the Classes tab

From the Classes tab, a "Create new ObjectProperty" button calls a function that generates a name via `OPEditor._generatePropName()`, creates a property with `domain: [classId]` and other fields empty, saves it via `API.createOP()`, sets `OPEditor._selectedId` and `OPEditor._editingId` to the new ID, then navigates to the `object-properties` tab via `APP.navigateTo()`.

---

## 2. Form — Presentation and user interface

> Requirements related to display: layout, visual components, interactions, navigation, styles.

**Source code:** `owl_editor.js` → anonymous function in `CLSEditor` (line ~613), identified by the comment `Creates an ObjectProperty with domain = selected class`

### REQ-OP-001 — Object property tree display

The `renderTree()` function generates the HTML for the complete ObjectProperties tree. It places at the root a fixed `owl:topObjectProperty` node (clickable via `OPEditor.selectTopProp()`), then recursively calls `_renderNode()` for each root property (those with no parent in `subPropertyOf`). If no property exists, a "No ObjectProperty" text is displayed instead.

---

**Source code:** `owl_editor.js` → `OPEditor.renderTree()`

### REQ-OP-004 — Tree node rendering with inverseOf tag

The `_renderNode()` function generates the HTML for a tree node. Each node is `draggable="true"` and carries the handlers `ondragstart`, `ondragover`, `ondragleave`, `ondrop`, `ondragend`. If the property has a non-null `inverseOf` field, a badge `↔ <id>` is displayed next to the label. Indentation is calculated based on depth (`depth * 16 + 6` px). Children are rendered in a container `op-tcn-<id>` whose visibility is controlled by `OPEditor._expanded`.

---

**Source code:** `owl_editor.js` → `OPEditor._renderNode()`

### REQ-OP-005 — Selection of owl:topObjectProperty

On click on the `owl:topObjectProperty` root node, `selectTopProp()` sets `_selectedId = null` and `_topPropSelected = true`, applies the CSS class `selected` to the root node, replaces the detail panel content with a welcome message and a "＋ Create Object Property" button, clears the "Super Properties" panel, and updates the toolbar button states via `_updateTreeButtons()`.

---

**Source code:** `owl_editor.js` → `OPEditor.selectTopProp()`

### REQ-OP-006 — Property selection in the tree

On click on a node, `selectProp(id)` updates `_selectedId`, applies the `selected` class to the correct tree item, replaces the detail panel with `renderForm(prop)`, initialises internal vertical resizers (`_initHResizers`), refreshes the "Super Properties" panel via `_updateSuperPanel()`, updates the buttons via `_updateTreeButtons()`, and triggers the loading of inverse inferences via `_loadInferredInverse()`.

---

**Source code:** `owl_editor.js` → `OPEditor.selectProp()`

### REQ-OP-007 — Contextual activation of tree buttons

`_updateTreeButtons()` enables or disables the three toolbar buttons (`op-btn-child`, `op-btn-sister`, `op-btn-delete`) according to the current selection: if `owl:topObjectProperty` is selected, only the "Child" button is active; if a property is selected, all three buttons are active; otherwise, all are disabled.

---

**Source code:** `owl_editor.js` → `OPEditor._updateTreeButtons()`

### REQ-OP-008 — Tree node expand/collapse

`toggleNode(id)` toggles the visibility of the container `op-tcn-<id>` between `display:none` and `display:block`, updates `OPEditor._expanded` (adding or removing the ID), and rotates the `▶` triangle via the CSS class `open`.

---

**Source code:** `owl_editor.js` → `OPEditor.toggleNode()`

### REQ-OP-013 — Context menu on right-click in the tree

`showContextMenu(event, id)` intercepts a right-click on a node or on the root. It creates a DOM element `div#op-ctx-menu` positioned at the mouse coordinates, containing the actions "Add Child Property", "Add Sibling Property" (only if a non-root property is targeted), and "Delete". The menu closes automatically on the next outside click via a `click` listener in capture mode.

---

**Source code:** `owl_editor.js` → `OPEditor.showContextMenu()`

### REQ-OP-017 — Object property edit form

`renderForm(prop)` generates the complete HTML form for a property. It contains: a text field `op-id` for the local identifier (with `_sanitizeId()` on each keystroke), the full IRI computed from `APP.state.ontology.id`, the Annotations block, the Domain and Range blocks side by side, the "Inverse Of" block, the "Characteristics" block, and a "Where Used" frame via `_whereUsedFrame()`. For a new property (`isNew = true`), saving is triggered on `onblur`; for an existing property, on `onchange`.

---

**Source code:** `owl_editor.js` → `OPEditor.renderForm()`

### REQ-OP-018 — Annotation management (labels, comments, others)

- `addAnnotRow(type)` adds a row to `#op-annotations-body` via `_makeAnnotRow()` for types `label` or `comment`.
- `addOtherAnnotRow(prop)` adds a row of type `other` with the specified annotation property, then closes the `op-anno-picker`.
- `removeAnnotRow(btn)` removes the parent `<tr>` row of the clicked button and triggers `autoSave()` if in edit mode.

---

**Source code:** `owl_editor.js` → `OPEditor.addAnnotRow()`, `OPEditor.addOtherAnnotRow()`, `OPEditor.removeAnnotRow()`

### REQ-OP-028 — "Super Properties" panel with ancestor chain

`_updateSuperPanel(prop)` fills the left panel `#op-sub-list` with the list of direct super-properties of `prop`. For each direct super-property, it builds the complete ancestor chain up to `owl:topObjectProperty` (via a `buildChain()` loop) and displays each link with increasing indentation. Direct super-properties have a delete button `✕`; transitive ancestors are displayed in italics with reduced opacity (0.75). A click on any ancestor navigates to that property via `APP.navigateTo()`.

---

**Source code:** `owl_editor.js` → `OPEditor._updateSuperPanel()`

### REQ-OP-032 — Two-panel resizable layout

`renderSplit()` generates a two-column layout: a left panel (`op-tree-panel`) containing the tree and the "Super Properties" sub-panel separated by a horizontal resizer `h-resizer`, and a right detail panel (`op-detail`). `_initSplitPane()` initialises the vertical resizer between the two columns (`op-split-handle`) via a `mousedown` listener that adjusts the left panel width between 160 px and 520 px, and calls `_initHResizers('op-tree-panel')` for the internal horizontal resizer.

---

**Source code:** `owl_editor.js` → `OPEditor.renderSplit()` and `OPEditor._initSplitPane()`

### REQ-OP-033 — Selection restoration after re-render

`restoreSelection()` calls `_initSplitPane()` then, depending on the memorised state, calls `selectTopProp()` if `_topPropSelected` is true, or `selectProp(_selectedId)` if an ID is memorised. This function is called after each re-render of the section so that the current selection is maintained.

---

*Document generated by static analysis of the source code — claude-sonnet-4-6*

**Source code:** `owl_editor.js` → `OPEditor.restoreSelection()`
