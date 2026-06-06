# Requirements — ObjectProperties

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-OP-001 — Tree hierarchy construction](#req-op-001--tree-hierarchy-construction)
- [REQ-OP-002 — Automatic ancestor expansion](#req-op-002--automatic-ancestor-expansion)
- [REQ-OP-003 — Child property creation](#req-op-003--child-property-creation)
- [REQ-OP-004 — Sibling property creation](#req-op-004--sibling-property-creation)
- [REQ-OP-005 — Automatic unique identifier generation](#req-op-005--automatic-unique-identifier-generation)
- [REQ-OP-006 — Property creation persistence via API](#req-op-006--property-creation-persistence-via-api)
- [REQ-OP-007 — Drag-and-drop movement in the tree](#req-op-007--drag-and-drop-movement-in-the-tree)
- [REQ-OP-008 — Cycle protection during drag-and-drop](#req-op-008--cycle-protection-during-drag-and-drop)
- [REQ-OP-009 — Property deletion with confirmation](#req-op-009--property-deletion-with-confirmation)
- [REQ-OP-010 — Domain class management](#req-op-010--domain-class-management)
- [REQ-OP-011 — Range class management](#req-op-011--range-class-management)
- [REQ-OP-012 — Inverse property definition](#req-op-012--inverse-property-definition)
- [REQ-OP-013 — Inverse property uniqueness](#req-op-013--inverse-property-uniqueness)
- [REQ-OP-014 — Inverse property removal](#req-op-014--inverse-property-removal)
- [REQ-OP-015 — Display of inferred inverse properties](#req-op-015--display-of-inferred-inverse-properties)
- [REQ-OP-016 — Super-property management (subPropertyOf)](#req-op-016--super-property-management-subpropertyof)
- [REQ-OP-017 — OWL property characteristics](#req-op-017--owl-property-characteristics)
- [REQ-OP-018 — Auto-save in edit mode](#req-op-018--auto-save-in-edit-mode)
- [REQ-OP-019 — Full save (create or update)](#req-op-019--full-save-create-or-update)
- [REQ-OP-020 — ObjectProperty creation from the Classes tab](#req-op-020--objectproperty-creation-from-the-classes-tab)

### Form
- [REQ-OP-021 — Object property tree display](#req-op-021--object-property-tree-display)
- [REQ-OP-022 — Tree node rendering with inverseOf tag](#req-op-022--tree-node-rendering-with-inverseof-tag)
- [REQ-OP-023 — Selection of owl:topObjectProperty](#req-op-023--selection-of-owltopobjectproperty)
- [REQ-OP-024 — Property selection in the tree](#req-op-024--property-selection-in-the-tree)
- [REQ-OP-025 — Contextual activation of tree buttons](#req-op-025--contextual-activation-of-tree-buttons)
- [REQ-OP-026 — Tree node expansion/collapse](#req-op-026--tree-node-expansioncollapse)
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

| **If** | the ontology is loaded and contains object properties in `APP.state.object_properties`, |
|---|---|
| **Then** | the system computes, for each property, the list of its children (`childrenOf`) and the list of root properties (`roots`) by retaining only `subPropertyOf` references pointing to existing IDs, and sorts all lists alphabetically (case-insensitive via `localeCompare`). |

**Source code:** `owl_editor.js` → `OPEditor.buildTree()`

---

### REQ-OP-002 — Automatic ancestor expansion

| **If** | a property is selected or created in the tree, |
|---|---|
| **Then** | the system recursively traverses the `subPropertyOf` chain of the property and adds each ancestor to `OPEditor._expanded`, so that the full path to the property is visible in the tree. |

**Source code:** `owl_editor.js` → `OPEditor._expandAncestors()`

---

### REQ-OP-003 — Child property creation

| **If** | the user triggers the creation of a child property with a property selected in the tree, |
|---|---|
| **Then** | the system determines the parent as the selected property (or no parent if the selection is `owl:topObjectProperty`), adds this parent to `_expanded` to open it in the tree, and delegates creation to `_createAndSelect([parent])`. |

**Source code:** `owl_editor.js` → `OPEditor.createChild()`

---

### REQ-OP-004 — Sibling property creation

| **If** | the user triggers the creation of a sibling property with a property selected in the tree, |
|---|---|
| **Then** | the system retrieves the list of direct parents of the selected property (field `subPropertyOf`), adds them all to `_expanded`, and delegates creation to `_createAndSelect(parents)` so that the new property shares the same parents. |

**Source code:** `owl_editor.js` → `OPEditor.createSibling()`

---

### REQ-OP-005 — Automatic unique identifier generation

| **If** | a new property must be created, |
|---|---|
| **Then** | the system generates an identifier of the form `NewObjectProperty`, `NewObjectProperty1`, `NewObjectProperty2`, etc. by incrementing the numeric suffix as long as the identifier is already present in `APP.state.object_properties`. |

**Source code:** `owl_editor.js` → `OPEditor._generatePropName()`

---

### REQ-OP-006 — Property creation persistence via API

| **If** | the creation of a new property is triggered with a list of super-properties (`subPropertyOf`), |
|---|---|
| **Then** | - the system builds a minimal property object (`domain: [], range: [], inverseOf: null, characteristics: {}, propertyChainAxiom: []`) and registers it via `API.createOP(prop)` ;<br>- on success, it sets `_selectedId` and `_editingId`, refreshes the global state via `APP.refresh()`, then re-renders the tab via `APP.renderSection('object-properties')` ;<br>- on error, it displays the message via `UI.error()`. |

**Source code:** `owl_editor.js` → `OPEditor._createAndSelect()`

---

### REQ-OP-007 — Drag-and-drop movement in the tree

| **If** | the user drops a property onto a target in the tree (including the root), |
|---|---|
| **Then** | the system rebuilds the property with `subPropertyOf: [targetId]` (or `[]` if dropped on the root), calls `API.updateOP(draggedId, updated)`, and on success displays `UI.success()`, refreshes the state via `APP.refresh()` and re-renders the tab. |

**Source code:** `owl_editor.js` → `OPEditor.onDrop()`

---

### REQ-OP-008 — Cycle protection during drag-and-drop

| **If** | the user attempts to drop a property onto one of its own descendants in the tree, |
|---|---|
| **Then** | the system blocks the drop and displays the message `UI.warn('Cannot drop on a descendant — would create a cycle')` ; the same check is performed in `onDragOver()` to disable the visual drop indicator. |

**Source code:** `owl_editor.js` → `OPEditor._isDescendant()` and `OPEditor.onDrop()`

---

### REQ-OP-009 — Property deletion with confirmation

| **If** | the user triggers the deletion of a property, |
|---|---|
| **Then** | the system displays a confirmation dialog with the message `Delete ObjectProperty <strong>${id}</strong>?` ; if the user confirms, it calls `API.deleteOP(id)`, resets `_selectedId` and `_editingId` to `null`, then refreshes the tab. |

**Source code:** `owl_editor.js` → `OPEditor.delete()`

---

### REQ-OP-010 — Domain class management

| **If** | the user adds a class to the domain of a property being edited, |
|---|---|
| **Then** | the system adds the class ID to the DOM list `#op-domain-list` via `_addListItem()`, closes the picker `op-domain-picker`, and triggers `autoSave()` ; if no domain is defined, the placeholder `owl:Thing` is displayed. |

| **If** | the user removes a class from the domain of a property being edited, |
|---|---|
| **Then** | the system removes the corresponding item from `#op-domain-list` via `_removeListItem()`, restores the placeholder `owl:Thing` if the list is empty, and triggers `autoSave()`. |

**Source code:** `owl_editor.js` → `OPEditor.addDomain()` | `OPEditor.removeDomain()`

---

### REQ-OP-011 — Range class management

| **If** | the user adds a class to the range of a property being edited, |
|---|---|
| **Then** | the system adds the class ID to `#op-range-list` via `_addListItem()` and triggers `autoSave()` ; if no range is defined, the placeholder `owl:Thing` is displayed. |

| **If** | the user removes a class from the range of a property being edited, |
|---|---|
| **Then** | the system removes the item from `#op-range-list` via `_removeListItem()`, restores the placeholder `owl:Thing` if the list is empty, and triggers `autoSave()`. |

**Source code:** `owl_editor.js` → `OPEditor.addRange()` | `OPEditor.removeRange()`

---

### REQ-OP-012 — Inverse property definition

| **If** | the user selects an inverse property via the picker, |
|---|---|
| **Then** | - the system updates the hidden field `#op-inverse-value` with the selected ID ;<br>- replaces in `#op-inverse-body` the placeholder "— none —" with an item containing a delete button ;<br>- hides the `+` button via `display:none` ;<br>- closes the picker `op-inverse-picker` ;<br>- triggers `autoSave()`. |

**Source code:** `owl_editor.js` → `OPEditor.setInverse()`

---

### REQ-OP-013 — Inverse property uniqueness

| **If** | the user attempts to open the inverse picker when an inverse property is already defined in `#op-inverse-value`, |
|---|---|
| **Then** | the system does not respond and the picker does not open, ensuring that only one inverse property can be defined at a time ; in addition, the picker excludes properties that already have an `inverseOf` defined (except towards the current property). |

**Source code:** `owl_editor.js` → `OPEditor.showPicker()`

---

### REQ-OP-014 — Inverse property removal

| **If** | the user removes the inverse property, |
|---|---|
| **Then** | the system clears the value of `#op-inverse-value`, redisplays the placeholder "— none —", and makes the `+` button visible to allow a new selection. |

**Source code:** `owl_editor.js` → `OPEditor.removeInverse()`

---

### REQ-OP-015 — Display of inferred inverse properties

| **If** | a property is selected in the tree **and** the inference engine returns `inferred_inverse_properties` results concerning this property, |
|---|---|
| **Then** | the system injects into `#op-inferred-inverse` a badge `⊢ inverse of <strong>${i.inverse_of}</strong>` for each inference, with the `title` attribute carrying the reason for the inference ; errors are silent. |

**Source code:** `owl_editor.js` → `OPEditor._loadInferredInverse()`

---

### REQ-OP-016 — Super-property management (subPropertyOf)

| **If** | the user adds a super-property to the property being edited, |
|---|---|
| **Then** | the system adds the selected property to `#op-sub-list` via `_addListItem()` and triggers `autoSave()`. |

| **If** | the user removes a super-property from the property being edited, |
|---|---|
| **Then** | the system removes the super-property from `#op-sub-list` via `_removeListItem()` and triggers `autoSave()`. |

**Source code:** `owl_editor.js` → `OPEditor.addSubProp()`, `OPEditor.removeSubProp()`

---

### REQ-OP-017 — OWL property characteristics

| **If** | the form of a property is displayed, |
|---|---|
| **Then** | the system presents a grid of 7 checkboxes (`functional`, `inverseFunctional`, `transitive`, `symmetric`, `asymmetric`, `reflexive`, `irreflexive`) pre-checked according to `prop.characteristics[k]`. |

| **If** | the user saves the property, |
|---|---|
| **Then** | the system reads the state of each checkbox via `document.getElementById('op-${k}')?.checked`, builds the `chars` object and includes it in the payload sent to `API.updateOP()` or `API.createOP()`. |

**Source code:** `owl_editor.js` → `OPEditor.renderForm()` and `OPEditor.save()`

---

### REQ-OP-018 — Auto-save in edit mode

| **If** | an existing property is being edited (`_editingId !== null`) **and** a form field triggers an `onchange` event, |
|---|---|
| **Then** | the system automatically calls `save(false)` without any further user interaction. |

**Source code:** `owl_editor.js` → `OPEditor.autoSave()`

---

### REQ-OP-019 — Full save (create or update)

| **If** | the user saves a property (new or existing), |
|---|---|
| **Then** | - the system collects the identifier (`op-id`), annotations, domain, range, super-properties, the inverse property and the 7 characteristics ;<br>- validates the identifier via `_validateId()` ;<br>- if the property is new, calls `API.createOP()` ; otherwise calls `API.updateOP(originalId, prop)` ;<br>- if the identifier has changed, displays a rename message ;<br>- in all cases, refreshes the tab after success. |

**Source code:** `owl_editor.js` → `OPEditor.save()`

---

### REQ-OP-020 — ObjectProperty creation from the Classes tab

| **If** | the user clicks "Create new ObjectProperty" from the Classes tab with a class selected, |
|---|---|
| **Then** | the system generates a name via `OPEditor._generatePropName()`, creates a property with `domain: [classId]` and the other fields empty, registers it via `API.createOP()`, sets `OPEditor._selectedId` and `OPEditor._editingId` to the new ID, then navigates to the `object-properties` tab via `APP.navigateTo()`. |

**Source code:** `owl_editor.js` → anonymous function in `CLSEditor` (line ~613), identified by the comment `Creates an ObjectProperty with domain = selected class`

---

## 2. Form — Presentation and UI

> Requirements relating to display: layout, visual components, interactions, navigation, styles.

### REQ-OP-021 — Object property tree display

| **If** | the object properties tab is rendered, |
|---|---|
| **Then** | - the system places as root a fixed node `owl:topObjectProperty` (clickable via `OPEditor.selectTopProp()`) ;<br>- recursively calls `_renderNode()` for each root property (those without a parent in `subPropertyOf`) ;<br>- if no property exists, displays the text "No ObjectProperty" instead. |

**Source code:** `owl_editor.js` → `OPEditor.renderTree()`

---

### REQ-OP-022 — Tree node rendering with inverseOf tag

| **If** | a node of the object property tree is rendered, |
|---|---|
| **Then** | - the node is `draggable="true"` and carries the handlers `ondragstart`, `ondragover`, `ondragleave`, `ondrop`, `ondragend` ;<br>- if the property has a non-null `inverseOf` field, a badge `↔ <id>` is displayed next to the label ;<br>- indentation is calculated according to depth (`depth * 16 + 6` px) ;<br>- children are rendered in a container `op-tcn-<id>` whose visibility is controlled by `OPEditor._expanded`. |

**Source code:** `owl_editor.js` → `OPEditor._renderNode()`

---

### REQ-OP-023 — Selection of owl:topObjectProperty

| **If** | the user clicks on the root node `owl:topObjectProperty`, |
|---|---|
| **Then** | - the system sets `_selectedId = null` and `_topPropSelected = true` ;<br>- applies the CSS class `selected` to the root node ;<br>- replaces the content of the detail panel with a welcome message containing a "＋ Create Object Property" button ;<br>- clears the "Super Properties" panel ;<br>- updates the state of the toolbar buttons via `_updateTreeButtons()`. |

**Source code:** `owl_editor.js` → `OPEditor.selectTopProp()`

---

### REQ-OP-024 — Property selection in the tree

| **If** | the user clicks on a node in the object property tree, |
|---|---|
| **Then** | - the system updates `_selectedId` and applies the `selected` class to the correct tree item ;<br>- replaces the detail panel with `renderForm(prop)` ;<br>- initialises the internal vertical resizers via `_initHResizers` ;<br>- refreshes the "Super Properties" panel via `_updateSuperPanel()` ;<br>- updates the buttons via `_updateTreeButtons()` ;<br>- triggers the loading of inverse inferences via `_loadInferredInverse()`. |

**Source code:** `owl_editor.js` → `OPEditor.selectProp()`

---

### REQ-OP-025 — Contextual activation of tree buttons

| **If** | `owl:topObjectProperty` is selected, |
|---|---|
| **Then** | only the "Child" button (`op-btn-child`) is active ; the "Sister" (`op-btn-sister`) and "Delete" (`op-btn-delete`) buttons are disabled. |

| **If** | an ordinary property is selected, |
|---|---|
| **Then** | all three buttons (`op-btn-child`, `op-btn-sister`, `op-btn-delete`) are active. |

| **If** | no property is selected, |
|---|---|
| **Then** | all buttons are disabled. |

**Source code:** `owl_editor.js` → `OPEditor._updateTreeButtons()`

---

### REQ-OP-026 — Tree node expansion/collapse

| **If** | the user clicks on the triangle of a tree node, |
|---|---|
| **Then** | the system toggles the visibility of the container `op-tcn-<id>` between `display:none` and `display:block`, updates `OPEditor._expanded` (adding or removing the ID), and rotates the triangle `▶` via the CSS class `open`. |

**Source code:** `owl_editor.js` → `OPEditor.toggleNode()`

---

### REQ-OP-027 — Context menu on right-click in the tree

| **If** | the user right-clicks on a node or on the root of the tree, |
|---|---|
| **Then** | - the system creates a DOM element `div#op-ctx-menu` positioned at the mouse coordinates ;<br>- it contains the actions "Add Child Property", "Add Sibling Property" (only if a non-root property is targeted), and "Delete" ;<br>- the menu closes automatically on the next outside click via a `click` listener in capture mode. |

**Source code:** `owl_editor.js` → `OPEditor.showContextMenu()`

---

### REQ-OP-028 — Object property edit form

| **If** | an object property is selected in the tree, |
|---|---|
| **Then** | the system generates an HTML form containing: a text field `op-id` (with `_sanitizeId()` on each keystroke), the full IRI computed from `APP.state.ontology.id`, the Annotations block, the Domain and Range blocks side by side, the "Inverse Of" block, the "Characteristics" block, and a "Where Used" frame via `_whereUsedFrame()`. |

| **If** | the property is new (`isNew = true`), |
|---|---|
| **Then** | saving is triggered on `onblur` ; for an existing property, it is triggered on `onchange`. |

**Source code:** `owl_editor.js` → `OPEditor.renderForm()`

---

### REQ-OP-029 — Annotation management (labels, comments, others)

| **If** | the user adds an annotation of type `label` or `comment`, |
|---|---|
| **Then** | the system adds a row to `#op-annotations-body` via `_makeAnnotRow()`. |

| **If** | the user adds an annotation of type `other` by selecting an annotation property, |
|---|---|
| **Then** | the system adds an `other`-type row with the specified property and closes the picker `op-anno-picker`. |

| **If** | the user deletes an annotation row, |
|---|---|
| **Then** | the system removes the parent `<tr>` row of the clicked button and triggers `autoSave()` if the property is in edit mode. |

**Source code:** `owl_editor.js` → `OPEditor.addAnnotRow()`, `OPEditor.addOtherAnnotRow()`, `OPEditor.removeAnnotRow()`

---

### REQ-OP-030 — "Super Properties" panel with ancestor chain

| **If** | a property is selected in the tree, |
|---|---|
| **Then** | - the system fills the panel `#op-sub-list` with the direct super-properties of the selected property ;<br>- for each direct super-property, it builds the complete ancestor chain up to `owl:topObjectProperty` and displays each link with increasing indentation ;<br>- direct super-properties have a delete button `✕` ;<br>- transitive ancestors are displayed in italics with reduced opacity (0.75) ;<br>- clicking on any ancestor navigates to that property via `APP.navigateTo()`. |

**Source code:** `owl_editor.js` → `OPEditor._updateSuperPanel()`

---

### REQ-OP-031 — Two-panel resizable layout

| **If** | the object properties tab is displayed, |
|---|---|
| **Then** | the system generates a two-column layout: a left panel (`op-tree-panel`) containing the tree and the "Super Properties" sub-panel separated by a horizontal resizer `h-resizer`, and a right detail panel (`op-detail`). |

| **If** | the user drags the vertical resize handle (`op-split-handle`), |
|---|---|
| **Then** | the system adjusts the width of the left panel between 160 px and 520 px and initialises the internal horizontal resizer via `_initHResizers('op-tree-panel')`. |

**Source code:** `owl_editor.js` → `OPEditor.renderSplit()` and `OPEditor._initSplitPane()`

---

### REQ-OP-032 — Selection restoration after re-render

| **If** | the object properties tab is re-rendered after an action, |
|---|---|
| **Then** | - the system calls `_initSplitPane()` ;<br>- if `_topPropSelected` is true, calls `selectTopProp()` again ;<br>- if an ID is stored in `_selectedId`, calls `selectProp(_selectedId)` again ;<br>- thereby ensuring that the current selection is maintained after each re-render. |

---

*Document generated by static analysis of the source code — claude-sonnet-4-6*

**Source code:** `owl_editor.js` → `OPEditor.restoreSelection()`
