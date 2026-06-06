# Requirements — ObjectProperties

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-OP-001 — Tree hierarchy construction](#req-op-001--tree-hierarchy-construction)
- [REQ-OP-002 — Automatic ancestor expansion](#req-op-002--automatic-ancestor-expansion)
- [REQ-OP-003 — Creating a child property](#req-op-003--creating-a-child-property)
- [REQ-OP-004 — Creating a sibling property](#req-op-004--creating-a-sibling-property)
- [REQ-OP-005 — Automatic generation of a unique identifier](#req-op-005--automatic-generation-of-a-unique-identifier)
- [REQ-OP-006 — Persistence of property creation via the API](#req-op-006--persistence-of-property-creation-via-the-api)
- [REQ-OP-007 — Drag-and-drop movement in the tree](#req-op-007--drag-and-drop-movement-in-the-tree)
- [REQ-OP-008 — Cycle protection during drag-and-drop](#req-op-008--cycle-protection-during-drag-and-drop)
- [REQ-OP-009 — Property deletion with confirmation](#req-op-009--property-deletion-with-confirmation)
- [REQ-OP-010 — Domain class management](#req-op-010--domain-class-management)
- [REQ-OP-011 — Range class management](#req-op-011--range-class-management)
- [REQ-OP-012 — Inverse property definition](#req-op-012--inverse-property-definition)
- [REQ-OP-013 — Uniqueness of the inverse property](#req-op-013--uniqueness-of-the-inverse-property)
- [REQ-OP-014 — Removal of the inverse property](#req-op-014--removal-of-the-inverse-property)
- [REQ-OP-015 — Display of inferred inverse properties](#req-op-015--display-of-inferred-inverse-properties)
- [REQ-OP-016 — Super-property management (subPropertyOf)](#req-op-016--super-property-management-subpropertyof)
- [REQ-OP-017 — OWL characteristics of the property](#req-op-017--owl-characteristics-of-the-property)
- [REQ-OP-018 — Auto-save in edit mode](#req-op-018--auto-save-in-edit-mode)
- [REQ-OP-019 — Full save (create or update)](#req-op-019--full-save-create-or-update)
- [REQ-OP-020 — Creating an ObjectProperty from the Classes tab](#req-op-020--creating-an-objectproperty-from-the-classes-tab)

### Form
- [REQ-OP-021 — Object property tree display](#req-op-021--object-property-tree-display)
- [REQ-OP-022 — Tree node rendering with inverseOf tag](#req-op-022--tree-node-rendering-with-inverseof-tag)
- [REQ-OP-023 — Selection of owl:topObjectProperty](#req-op-023--selection-of-owltopobjectproperty)
- [REQ-OP-024 — Selecting a property in the tree](#req-op-024--selecting-a-property-in-the-tree)
- [REQ-OP-025 — Contextual activation of tree buttons](#req-op-025--contextual-activation-of-tree-buttons)
- [REQ-OP-026 — Expanding/collapsing a tree node](#req-op-026--expandingcollapsing-a-tree-node)
- [REQ-OP-027 — Context menu on right-click in the tree](#req-op-027--context-menu-on-right-click-in-the-tree)
- [REQ-OP-028 — Object property edit form](#req-op-028--object-property-edit-form)
- [REQ-OP-029 — Annotation management (labels, comments, others)](#req-op-029--annotation-management-labels-comments-others)
- [REQ-OP-030 — "Super Properties" panel with ancestor chain](#req-op-030--super-properties-panel-with-ancestor-chain)
- [REQ-OP-031 — Two-panel resizable layout](#req-op-031--two-panel-resizable-layout)
- [REQ-OP-032 — Selection restoration after re-render](#req-op-032--selection-restoration-after-re-render)

---

## 1. Substance — Business logic and functional rules

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviours, validations, persistence.


### REQ-OP-001 — Tree hierarchy construction

The `buildTree()` function computes, from the `APP.state.object_properties` array, the list of children for each node (`childrenOf`) and the list of root nodes (`roots`). Only `subPropertyOf` references pointing to IDs that exist in the array are taken into account. Lists are sorted alphabetically (case-insensitive via `localeCompare`).

---

**Source code:** `owl_editor.js` → `OPEditor.buildTree()`

### REQ-OP-002 — Automatic ancestor expansion

When a property is selected or created, `_expandAncestors()` recursively traverses the `subPropertyOf` chain of the property and adds each ancestor to `OPEditor._expanded` so that the path to the property is visible in the tree.

---

**Source code:** `owl_editor.js` → `OPEditor._expandAncestors()`

### REQ-OP-003 — Creating a child property

`createChild()` determines the parent as `_selectedId` (or no parent if it is `owl:topObjectProperty`), adds the parent to `_expanded` so that it is open in the tree, then delegates to `_createAndSelect([parent])`.

---

**Source code:** `owl_editor.js` → `OPEditor.createChild()`

### REQ-OP-004 — Creating a sibling property

`createSibling()` retrieves the list of direct parents of the selected property (the `subPropertyOf` field), adds them all to `_expanded`, then delegates to `_createAndSelect(parents)` to create a new property with the same parents.

---

**Source code:** `owl_editor.js` → `OPEditor.createSibling()`

### REQ-OP-005 — Automatic generation of a unique identifier

`_generatePropName()` generates an identifier of the form `NewObjectProperty`, `NewObjectProperty1`, `NewObjectProperty2`, etc., incrementing a numeric suffix as long as the ID is already present in `APP.state.object_properties`.

---

**Source code:** `owl_editor.js` → `OPEditor._generatePropName()`

### REQ-OP-006 — Persistence of property creation via the API

`_createAndSelect(subPropertyOf)` builds a minimal property object (with `domain: [], range: [], inverseOf: null, characteristics: {}, propertyChainAxiom: []`) and calls `API.createOP(prop)`. On success, it sets `_selectedId` and `_editingId`, calls `APP.refresh()` to reload the global state, then `APP.renderSection('object-properties')` to re-render the tab. Errors are displayed via `UI.error()`.

---

**Source code:** `owl_editor.js` → `OPEditor._createAndSelect()`

### REQ-OP-007 — Drag-and-drop movement in the tree

`onDrop(event, targetId)` receives the ID of the dropped property (from `_dragId`) and the target ID. It rebuilds the property with `subPropertyOf: [targetId]` (or `[]` if dropped on the root) and calls `API.updateOP(draggedId, updated)`. On success, it displays `UI.success()`, refreshes the state via `APP.refresh()`, and re-renders the tab.

---

**Source code:** `owl_editor.js` → `OPEditor.onDrop()`

### REQ-OP-008 — Cycle protection during drag-and-drop

Before allowing the drop, `onDrop()` calls `_isDescendant(targetId, draggedId)`. This function recursively traverses `childrenOf` (obtained via `buildTree()`) to check whether `targetId` is a descendant of the dragged property. If so, the drop is blocked with the message `UI.warn('Cannot drop on a descendant — would create a cycle')`. The same check is performed in `onDragOver()` to disable the visual drop indicator.

---

**Source code:** `owl_editor.js` → `OPEditor._isDescendant()` and `OPEditor.onDrop()`

### REQ-OP-009 — Property deletion with confirmation

`delete(id)` displays a confirmation dialog via `UI.confirm()` with the message `Delete ObjectProperty <strong>${id}</strong>?`. If confirmed, it calls `API.deleteOP(id)`, resets `_selectedId` and `_editingId` to `null`, then refreshes the tab. `deleteSelected()` is a shortcut that calls `delete(this._selectedId)` if a property is selected.

---

**Source code:** `owl_editor.js` → `OPEditor.delete()`

### REQ-OP-010 — Domain class management

Adding and removing classes from a property's domain are handled by two separate functions. `addDomain(id)` adds the selected class ID to the `#op-domain-list` DOM list via `_addListItem()` (closing the `op-domain-picker` picker) and triggers `autoSave()` if a property is being edited; if no domain is defined, the `owl:Thing` placeholder is displayed. `removeDomain(id)` removes the corresponding item from `#op-domain-list` via `_removeListItem()` (restoring the `owl:Thing` placeholder if the list is empty) and triggers `autoSave()` if in edit mode.

---

**Source code:** `owl_editor.js` → `OPEditor.addDomain()` | `OPEditor.removeDomain()`

### REQ-OP-011 — Range class management

Adding and removing classes from a property's range are handled by two separate functions. `addRange(id)` adds the class ID to `#op-range-list` via `_addListItem()` and triggers `autoSave()`; if no range is defined, the `owl:Thing` placeholder is displayed. `removeRange(id)` removes the item from `#op-range-list` via `_removeListItem()` (restoring the `owl:Thing` placeholder) and triggers `autoSave()`.

---

**Source code:** `owl_editor.js` → `OPEditor.addRange()` | `OPEditor.removeRange()`

### REQ-OP-012 — Inverse property definition

`setInverse(id)` updates the hidden field `#op-inverse-value` with the selected ID, replaces the "— none —" placeholder in `#op-inverse-body` with an item containing a delete button, hides the `+` button via `display:none`, closes the `op-inverse-picker` picker, and triggers `autoSave()`. Navigation to the inverse property is possible via `APP.navigateTo()` from the item label.

---

**Source code:** `owl_editor.js` → `OPEditor.setInverse()`

### REQ-OP-013 — Uniqueness of the inverse property

`showPicker('op-inverse-picker')` checks whether `#op-inverse-value` already contains a value: if so, it returns immediately without opening the picker, ensuring that only one inverse property can be defined at a time. Additionally, the inverse picker excludes properties that already have an `inverseOf` defined (except towards the current property).

---

**Source code:** `owl_editor.js` → `OPEditor.showPicker()`

### REQ-OP-014 — Removal of the inverse property

`removeInverse()` is an alias of `setInverse('')`: it clears the value of `#op-inverse-value`, re-displays the "— none —" placeholder, and makes the `+` button visible again to allow a new selection.

---

**Source code:** `owl_editor.js` → `OPEditor.removeInverse()`

### REQ-OP-015 — Display of inferred inverse properties

On each property selection, `_loadInferredInverse(id)` calls `API.getInferences()` and filters the results on `inferred_inverse_properties` to retain only the inferences concerning the current property. For each inference found, a badge `⊢ inverse of <strong>${i.inverse_of}</strong>` is injected into `#op-inferred-inverse`, with the `title` attribute carrying the reason for the inference. Errors are silent.

---

**Source code:** `owl_editor.js` → `OPEditor._loadInferredInverse()`

### REQ-OP-016 — Super-property management (subPropertyOf)

- `addSubProp(id)` adds the selected property to `#op-sub-list` via `_addListItem()` and triggers `autoSave()`.
- `removeSubProp(id)` removes the super-property from `#op-sub-list` via `_removeListItem()` and triggers `autoSave()`.

---

**Source code:** `owl_editor.js` → `OPEditor.addSubProp()`, `OPEditor.removeSubProp()`

### REQ-OP-017 — OWL characteristics of the property

The form generated by `renderForm()` contains a grid of 7 checkboxes corresponding to OWL characteristics: `functional`, `inverseFunctional`, `transitive`, `symmetric`, `asymmetric`, `reflexive`, `irreflexive`. Each checkbox is pre-checked according to `prop.characteristics[k]`. During save, `save()` reads each checkbox via `document.getElementById('op-${k}')?.checked` and builds the `chars` object that is included in the payload sent to `API.updateOP()` or `API.createOP()`.

---

**Source code:** `owl_editor.js` → `OPEditor.renderForm()` and `OPEditor.save()`

### REQ-OP-018 — Auto-save in edit mode

`autoSave()` checks that `_editingId !== null` (i.e. that an existing property is being edited) before calling `save(false)`. It is triggered on the `onchange` events of all form fields when the property is in edit mode (as opposed to creation mode where save is triggered on `onblur`).

---

**Source code:** `owl_editor.js` → `OPEditor.autoSave()`

### REQ-OP-019 — Full save (create or update)

`save(isNew)` collects all form data: the identifier (`op-id`), annotations (`_collectAnnotations('op-annotations-body')`), domain (`_collectList('op-domain-list')`), range (`_collectList('op-range-list')`), super-properties (`_collectList('op-sub-list')`), the inverse property (`#op-inverse-value`), and the 7 characteristics. The identifier is validated via `_validateId()`. If `isNew`, calls `API.createOP()`; otherwise `API.updateOP(originalId, prop)`. If the ID has changed, a rename message is displayed. In both cases, the tab is refreshed after success.

---

**Source code:** `owl_editor.js` → `OPEditor.save()`

### REQ-OP-020 — Creating an ObjectProperty from the Classes tab

From the Classes tab, a "Create new ObjectProperty" button calls a function that generates a name via `OPEditor._generatePropName()`, creates a property with `domain: [classId]` and the other fields empty, saves it via `API.createOP()`, sets `OPEditor._selectedId` and `OPEditor._editingId` to the new ID, then navigates to the `object-properties` tab via `APP.navigateTo()`.

---

**Source code:** `owl_editor.js` → anonymous function in `CLSEditor` (line ~613), identified by the comment `Creates an ObjectProperty with domain = selected class`

---

## 2. Form — Presentation and user interface

> Requirements relating to display: layout, visual components, interactions, navigation, styles.

### REQ-OP-021 — Object property tree display

The `renderTree()` function generates the full HTML of the ObjectProperties tree. It places a fixed root node `owl:topObjectProperty` (clickable via `OPEditor.selectTopProp()`) at the top, then recursively calls `_renderNode()` for each root property (those with no parent in `subPropertyOf`). If no property exists, a "No ObjectProperty" text is displayed instead.

---

**Source code:** `owl_editor.js` → `OPEditor.renderTree()`

### REQ-OP-022 — Tree node rendering with inverseOf tag

The `_renderNode()` function generates the HTML for a tree node. Each node is `draggable="true"` and carries the `ondragstart`, `ondragover`, `ondragleave`, `ondrop`, `ondragend` handlers. If the property has a non-null `inverseOf` field, a badge `↔ <id>` is displayed next to the label. Indentation is calculated based on depth (`depth * 16 + 6` px). Children are rendered in an `op-tcn-<id>` container whose visibility is controlled by `OPEditor._expanded`.

---

**Source code:** `owl_editor.js` → `OPEditor._renderNode()`

### REQ-OP-023 — Selection of owl:topObjectProperty

On clicking the root node `owl:topObjectProperty`, `selectTopProp()` sets `_selectedId = null` and `_topPropSelected = true`, applies the CSS class `selected` to the root node, replaces the detail panel content with a welcome message containing a "＋ Create Object Property" button, clears the "Super Properties" panel, and updates the toolbar button state via `_updateTreeButtons()`.

---

**Source code:** `owl_editor.js` → `OPEditor.selectTopProp()`

### REQ-OP-024 — Selecting a property in the tree

On clicking a node, `selectProp(id)` updates `_selectedId`, applies the `selected` class to the correct tree item, replaces the detail panel with `renderForm(prop)`, initialises internal vertical resizers (`_initHResizers`), refreshes the "Super Properties" panel via `_updateSuperPanel()`, updates the buttons via `_updateTreeButtons()`, and triggers the loading of inverse inferences via `_loadInferredInverse()`.

---

**Source code:** `owl_editor.js` → `OPEditor.selectProp()`

### REQ-OP-025 — Contextual activation of tree buttons

`_updateTreeButtons()` enables or disables the three toolbar buttons (`op-btn-child`, `op-btn-sister`, `op-btn-delete`) according to the current selection: if `owl:topObjectProperty` is selected, only the "Child" button is active; if a property is selected, all three buttons are active; otherwise all are disabled.

---

**Source code:** `owl_editor.js` → `OPEditor._updateTreeButtons()`

### REQ-OP-026 — Expanding/collapsing a tree node

`toggleNode(id)` toggles the visibility of the `op-tcn-<id>` container between `display:none` and `display:block`, updates `OPEditor._expanded` (adding or removing the ID), and rotates the `▶` triangle via the CSS class `open`.

---

**Source code:** `owl_editor.js` → `OPEditor.toggleNode()`

### REQ-OP-027 — Context menu on right-click in the tree

`showContextMenu(event, id)` intercepts the right-click on a node or the root. It creates a DOM element `div#op-ctx-menu` positioned at the mouse coordinates, containing the actions "Add Child Property", "Add Sibling Property" (only if a non-root property is targeted), and "Delete". The menu closes automatically on the next outside click via a `click` listener in capture mode.

---

**Source code:** `owl_editor.js` → `OPEditor.showContextMenu()`

### REQ-OP-028 — Object property edit form

`renderForm(prop)` generates the complete HTML form for a property. It contains: a text field `op-id` for the local identifier (with `_sanitizeId()` on each keystroke), the full IRI computed from `APP.state.ontology.id`, the Annotations block, the Domain and Range blocks side by side, the "Inverse Of" block, the "Characteristics" block, and a "Where Used" frame via `_whereUsedFrame()`. For a new property (`isNew = true`), save is triggered on `onblur`; for an existing property, on `onchange`.

---

**Source code:** `owl_editor.js` → `OPEditor.renderForm()`

### REQ-OP-029 — Annotation management (labels, comments, others)

- `addAnnotRow(type)` adds a row to `#op-annotations-body` via `_makeAnnotRow()` for the `label` or `comment` types.
- `addOtherAnnotRow(prop)` adds a row of type `other` with the specified annotation property, then closes the `op-anno-picker` picker.
- `removeAnnotRow(btn)` removes the parent `<tr>` row of the clicked button and triggers `autoSave()` if in edit mode.

---

**Source code:** `owl_editor.js` → `OPEditor.addAnnotRow()`, `OPEditor.addOtherAnnotRow()`, `OPEditor.removeAnnotRow()`

### REQ-OP-030 — "Super Properties" panel with ancestor chain

`_updateSuperPanel(prop)` fills the left panel `#op-sub-list` with the list of direct super-properties of `prop`. For each direct super-property, it builds the complete ancestor chain up to `owl:topObjectProperty` (via a `buildChain()` loop) and displays each link with increasing indentation. Direct super-properties have a delete button `✕`; transitive ancestors are displayed in italics with reduced opacity (0.75). A click on any ancestor navigates to that property via `APP.navigateTo()`.

---

**Source code:** `owl_editor.js` → `OPEditor._updateSuperPanel()`

### REQ-OP-031 — Two-panel resizable layout

`renderSplit()` generates a two-column layout: a left panel (`op-tree-panel`) containing the tree and the "Super Properties" sub-panel separated by a horizontal resizer `h-resizer`, and a right detail panel (`op-detail`). `_initSplitPane()` initialises the vertical resizer between the two columns (`op-split-handle`) via a `mousedown` listener that adjusts the width of the left panel between 160 px and 520 px, and calls `_initHResizers('op-tree-panel')` for the internal horizontal resizer.

---

**Source code:** `owl_editor.js` → `OPEditor.renderSplit()` and `OPEditor._initSplitPane()`

### REQ-OP-032 — Selection restoration after re-render

`restoreSelection()` calls `_initSplitPane()` then, depending on the memorised state, calls `selectTopProp()` if `_topPropSelected` is true, or `selectProp(_selectedId)` if an ID is memorised. This function is called after each re-render of the section so that the current selection is maintained.

---

*Document generated by static analysis of the source code — claude-sonnet-4-6*

**Source code:** `owl_editor.js` → `OPEditor.restoreSelection()`
