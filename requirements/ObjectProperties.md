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
- [REQ-OP-007 — Drag-and-drop move in the tree](#req-op-007--drag-and-drop-move-in-the-tree)
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
- [REQ-OP-019 — Full save (creation or update)](#req-op-019--full-save-creation-or-update)
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

## 1. Substance — Business logic

> UI-independent requirements: OWL rules, data constraints, algorithmic behaviours, validations, persistence.


### REQ-OP-001 — Tree hierarchy construction

| **If** | the ontology contains object properties organised in a hierarchy, |
|---|---|
| **Then** | the property tree faithfully reflects the specialisation relationships between properties, distinguishing root properties from those that depend on them, and presenting them in alphabetical order. |

**Source code:** `owl_editor.js` → `OPEditor.buildTree()` — Analyses the `subPropertyOf` relations of each property in `APP.state.object_properties`, builds a `childrenOf` dictionary and a `roots` list by retaining only references pointing to existing IDs, then sorts all lists alphabetically via `localeCompare`.

---

### REQ-OP-002 — Automatic ancestor expansion

| **If** | the ontologist selects or creates a property in the tree, |
|---|---|
| **Then** | the complete path from the root to that property is automatically expanded, without the user having to manually open each intermediate level. |

**Source code:** `owl_editor.js` → `OPEditor._expandAncestors()` — Recursively traverses the `subPropertyOf` chain of the property and adds each ancestor to `OPEditor._expanded`, ensuring the full path is visible in the tree.

---

### REQ-OP-003 — Child property creation

| **If** | the ontologist wants to specialise an existing property by creating a subproperty directly positioned beneath it, |
|---|---|
| **Then** | the new property is created as a child of the selected property, and the parent property is automatically expanded in the tree to make the new entry visible. |

**Source code:** `owl_editor.js` → `OPEditor.createChild()` — Determines the parent as the selected property (or no parent if the selection is `owl:topObjectProperty`), adds that parent to `_expanded`, and delegates creation to `_createAndSelect([parent])`.

---

### REQ-OP-004 — Sibling property creation

| **If** | the ontologist wants to create a new property at the same hierarchical level as an existing property, |
|---|---|
| **Then** | the new property is positioned under the same parents as the reference property, without requiring any additional configuration of hierarchical relationships. |

**Source code:** `owl_editor.js` → `OPEditor.createSibling()` — Retrieves the list of direct parents of the selected property (field `subPropertyOf`), adds them to `_expanded`, and delegates creation to `_createAndSelect(parents)`.

---

### REQ-OP-005 — Automatic unique identifier generation

| **If** | the ontologist creates a new object property, |
|---|---|
| **Then** | a unique identifier is automatically assigned to it, with no risk of collision with existing properties in the ontology. |

**Source code:** `owl_editor.js` → `OPEditor._generatePropName()` — Generates an identifier of the form `NewObjectProperty`, `NewObjectProperty1`, `NewObjectProperty2`, etc., incrementing the numeric suffix as long as the identifier is already present in `APP.state.object_properties`.

---

### REQ-OP-006 — Property creation persistence via API

| **If** | the ontologist confirms the creation of a new object property, |
|---|---|
| **Then** | the property is saved in the ontology with its hierarchical relationships, and the tree is updated to immediately reflect this new entry. |

**Source code:** `owl_editor.js` → `OPEditor._createAndSelect()` — Builds a minimal property object (`domain: [], range: [], inverseOf: null, characteristics: {}, propertyChainAxiom: []`) and saves it via `API.createOP(prop)`; on success, sets `_selectedId` and `_editingId`, refreshes global state via `APP.refresh()` and re-renders the tab via `APP.renderSection('object-properties')`; on error, displays the message via `UI.error()`.

---

### REQ-OP-007 — Drag-and-drop move in the tree

| **If** | the ontologist moves a property in the tree by drag-and-drop to change its hierarchical position, |
|---|---|
| **Then** | the property is attached to its new parent (or placed at the root if dropped onto the root node), and the ontology is updated accordingly. |

**Source code:** `owl_editor.js` → `OPEditor.onDrop()` — Rebuilds the property with `subPropertyOf: [targetId]` (or `[]` if dropped onto the root), calls `API.updateOP(draggedId, updated)`, and on success displays `UI.success()`, refreshes state via `APP.refresh()` and re-renders the tab.

---

### REQ-OP-008 — Cycle protection during drag-and-drop

| **If** | the ontologist attempts to move a property onto one of its own descendants in the tree, |
|---|---|
| **Then** | the operation is blocked and a warning is displayed, as this would create a circular hierarchy incompatible with OWL. |

**Source code:** `owl_editor.js` → `OPEditor._isDescendant()` and `OPEditor.onDrop()` — Recursively checks whether the target is a descendant of the dragged property; blocks the drop and displays `UI.warn('Cannot drop on a descendant — would create a cycle')`; the same check is performed in `onDragOver()` to disable the visual drop indicator.

---

### REQ-OP-009 — Property deletion with confirmation

| **If** | the ontologist wishes to delete an object property from the ontology, |
|---|---|
| **Then** | explicit confirmation is requested before any permanent deletion, to prevent accidental removals. |

**Source code:** `owl_editor.js` → `OPEditor.delete()` — Displays a confirmation dialog with the message `Delete ObjectProperty <strong>${id}</strong>?`; if confirmed, calls `API.deleteOP(id)`, resets `_selectedId` and `_editingId` to `null`, then refreshes the tab.

---

### REQ-OP-010 — Domain class management

| **If** | the ontologist adds a class to the domain of an object property, |
|---|---|
| **Then** | the class is associated with the property as a domain constraint, and the property is automatically saved; if no domain is defined, `owl:Thing` is implicitly indicated. |

| **If** | the ontologist removes a class from the domain of an object property, |
|---|---|
| **Then** | the domain constraint is deleted, the property is automatically saved, and `owl:Thing` is displayed again if the domain becomes empty. |

**Source code:** `owl_editor.js` → `OPEditor.addDomain()` — Adds the class ID to the DOM list `#op-domain-list` via `_addListItem()`, closes the `op-domain-picker` picker, and triggers `autoSave()`. `OPEditor.removeDomain()` — Removes the corresponding item from `#op-domain-list` via `_removeListItem()`, restores the `owl:Thing` placeholder if the list is empty, and triggers `autoSave()`.

---

### REQ-OP-011 — Range class management

| **If** | the ontologist adds a class to the range of an object property, |
|---|---|
| **Then** | the class is associated with the property as a range constraint, and the property is automatically saved; if no range is defined, `owl:Thing` is implicitly indicated. |

| **If** | the ontologist removes a class from the range of an object property, |
|---|---|
| **Then** | the range constraint is deleted, the property is automatically saved, and `owl:Thing` is displayed again if the range becomes empty. |

**Source code:** `owl_editor.js` → `OPEditor.addRange()` — Adds the class ID to `#op-range-list` via `_addListItem()` and triggers `autoSave()`. `OPEditor.removeRange()` — Removes the item from `#op-range-list` via `_removeListItem()`, restores the `owl:Thing` placeholder if the list is empty, and triggers `autoSave()`.

---

### REQ-OP-012 — Inverse property definition

| **If** | the ontologist associates an inverse property with the property being edited, |
|---|---|
| **Then** | the inverse relationship is saved and the property is automatically saved. |

**Source code:** `owl_editor.js` → `OPEditor.setInverse()` — Updates the hidden field `#op-inverse-value` with the selected ID, replaces the "— none —" placeholder in `#op-inverse-body` with an item containing a delete button, hides the `+` button via `display:none`, closes the `op-inverse-picker` picker, and triggers `autoSave()`.

---

### REQ-OP-013 — Inverse property uniqueness

| **If** | an inverse property is already defined for the property being edited, |
|---|---|
| **Then** | it is not possible to add a second one; furthermore, properties that already have an inverse defined (pointing to another property) are not offered in the selection list. |

**Source code:** `owl_editor.js` → `OPEditor.showPicker()` — Checks for the presence of a value in `#op-inverse-value` before opening the picker; filters out properties that already have an `inverseOf` defined except towards the current property.

---

### REQ-OP-014 — Inverse property removal

| **If** | the ontologist wishes to remove the inverse relationship from a property, |
|---|---|
| **Then** | the inverse property is dissociated and the ability to define a new one is immediately restored. |

**Source code:** `owl_editor.js` → `OPEditor.removeInverse()` — Clears the value of `#op-inverse-value`, re-displays the "— none —" placeholder, and makes the `+` button visible again.

---

### REQ-OP-015 — Display of inferred inverse properties

| **If** | a property is selected and the reasoner detects implicit inverse relationships involving it, |
|---|---|
| **Then** | these inferred inversions are displayed distinctly in the form, with the justification for each inference, without any action required from the ontologist. |

**Source code:** `owl_editor.js` → `OPEditor._loadInferredInverse()` — Queries the inference engine and injects into `#op-inferred-inverse` a badge `⊢ inverse of <strong>${i.inverse_of}</strong>` for each result in `inferred_inverse_properties`, with the `title` attribute carrying the reason for the inference; errors are silent.

---

### REQ-OP-016 — Super-property management (subPropertyOf)

| **If** | the ontologist attaches an object property to a super-property, |
|---|---|
| **Then** | the hierarchical relationship is saved and the property is automatically saved. |

| **If** | the ontologist removes the attachment to a super-property, |
|---|---|
| **Then** | the hierarchical relationship is deleted and the property is automatically saved. |

**Source code:** `owl_editor.js` → `OPEditor.addSubProp()` — Adds the selected property to `#op-sub-list` via `_addListItem()` and triggers `autoSave()`. `OPEditor.removeSubProp()` — Removes the super-property from `#op-sub-list` via `_removeListItem()` and triggers `autoSave()`.

---

### REQ-OP-017 — OWL property characteristics

| **If** | the ontologist views the form of an object property, |
|---|---|
| **Then** | the seven OWL characteristics (`functional`, `inverseFunctional`, `transitive`, `symmetric`, `asymmetric`, `reflexive`, `irreflexive`) are presented with their current state, each independently modifiable. |

| **If** | the ontologist saves the property, |
|---|---|
| **Then** | the state of each characteristic is included in the persisted data of the property. |

**Source code:** `owl_editor.js` → `OPEditor.renderForm()` — Displays a grid of 7 checkboxes pre-checked according to `prop.characteristics[k]`. `OPEditor.save()` — Reads the state of each checkbox via `document.getElementById('op-${k}')?.checked`, builds the `chars` object and includes it in the payload sent to `API.updateOP()` or `API.createOP()`.

---

### REQ-OP-018 — Auto-save in edit mode

| **If** | the ontologist modifies a field in the form of an already existing property, |
|---|---|
| **Then** | the changes are automatically saved, without requiring explicit validation. |

**Source code:** `owl_editor.js` → `OPEditor.autoSave()` — Checks that `_editingId !== null` and calls `save(false)` on triggering of an `onchange` event in the form.

---

### REQ-OP-019 — Full save (creation or update)

| **If** | the ontologist saves an object property (new or existing), |
|---|---|
| **Then** | all entered information is persisted in the ontology — identifier, annotations, domain, range, super-properties, inverse property and characteristics — and the tree is updated to reflect the changes, including any renaming. |

**Source code:** `owl_editor.js` → `OPEditor.save()` — Collects the identifier (`op-id`), annotations, domain, range, super-properties, inverse property and the 7 characteristics; validates the identifier via `_validateId()`; calls `API.createOP()` for a new property or `API.updateOP(originalId, prop)` for an update; displays a rename message if the identifier has changed; refreshes the tab after success.

---

### REQ-OP-020 — ObjectProperty creation from the Classes tab

| **If** | the ontologist wishes to create an object property directly from a class record, using that class as domain, |
|---|---|
| **Then** | a new object property is created with the current class as domain, and the application automatically navigates to the object properties tab to allow further editing. |

**Source code:** `owl_editor.js` → Anonymous function in `CLSEditor` (line ~613, comment `Creates an ObjectProperty with domain = selected class`) — Generates a name via `OPEditor._generatePropName()`, creates a property with `domain: [classId]` and the other fields empty, saves it via `API.createOP()`, sets `OPEditor._selectedId` and `OPEditor._editingId` to the new ID, then navigates to the `object-properties` tab via `APP.navigateTo()`.

---

## 2. Form — Presentation and UI

> Display-related requirements: layout, visual components, interactions, navigation, styles.

### REQ-OP-021 — Object property tree display

| **If** | the ontologist opens the object properties tab, |
|---|---|
| **Then** | the tree presents first the root property `owl:topObjectProperty`, followed by all ontology properties organised according to their hierarchical relationships; if the ontology contains no object property, a message explicitly indicates this. |

**Source code:** `owl_editor.js` → `OPEditor.renderTree()` — Places as root a fixed clickable `owl:topObjectProperty` node via `OPEditor.selectTopProp()`, recursively calls `_renderNode()` for each root property (with no parent in `subPropertyOf`), and displays the text "No ObjectProperty" if no property exists.

---

### REQ-OP-022 — Tree node rendering with inverseOf tag

| **If** | a node in the object property tree is displayed, |
|---|---|
| **Then** | if the property has a declared inverse property, it is visually indicated alongside the property name; indentation reflects the hierarchical level; child properties are shown or hidden according to the node's expansion state; the node can be moved by drag-and-drop. |

**Source code:** `owl_editor.js` → `OPEditor._renderNode()` — Renders the node with `draggable="true"` and the handlers `ondragstart`, `ondragover`, `ondragleave`, `ondrop`, `ondragend`; displays a badge `↔ <id>` if `inverseOf` is non-null; calculates indentation according to `depth * 16 + 6` px; renders children in a container `op-tcn-<id>` whose visibility is controlled by `OPEditor._expanded`.

---

### REQ-OP-023 — Selection of owl:topObjectProperty

| **If** | the ontologist clicks on the root node `owl:topObjectProperty`, |
|---|---|
| **Then** | the detail panel offers to create a new object property, no existing property is selected, and the tree actions are updated accordingly. |

**Source code:** `owl_editor.js` → `OPEditor.selectTopProp()` — Sets `_selectedId = null` and `_topPropSelected = true`; applies the CSS class `selected` to the root node; replaces the content of the detail panel with a welcome message containing a "＋ Create Object Property" button; clears the "Super Properties" panel; updates button states via `_updateTreeButtons()`.

---

### REQ-OP-024 — Property selection in the tree

| **If** | the ontologist selects a property in the tree, |
|---|---|
| **Then** | the edit form for that property is displayed in the detail panel, the super-property chain is updated, and inferred inverse properties are loaded. |

**Source code:** `owl_editor.js` → `OPEditor.selectProp()` — Updates `_selectedId` and applies the `selected` class; replaces the detail panel with `renderForm(prop)`; initialises internal vertical resizers via `_initHResizers`; refreshes the "Super Properties" panel via `_updateSuperPanel()`; updates buttons via `_updateTreeButtons()`; triggers loading of inverse inferences via `_loadInferredInverse()`.

---

### REQ-OP-025 — Contextual activation of tree buttons

| **If** | `owl:topObjectProperty` is selected, |
|---|---|
| **Then** | only the child property creation action is available; the sibling property creation and deletion actions are disabled. |

| **If** | an ordinary property is selected, |
|---|---|
| **Then** | all three actions (create child property, create sibling property, delete) are available. |

| **If** | no property is selected in the tree, |
|---|---|
| **Then** | all tree actions are disabled. |

**Source code:** `owl_editor.js` → `OPEditor._updateTreeButtons()` — Enables or disables buttons `op-btn-child`, `op-btn-sister` and `op-btn-delete` according to the state of `_selectedId` and `_topPropSelected`.

---

### REQ-OP-026 — Tree node expansion/collapse

| **If** | the ontologist clicks on the expansion triangle of a tree node, |
|---|---|
| **Then** | the child properties of that node are shown or hidden, and the visual indicator reflects the current state (expanded or collapsed). |

**Source code:** `owl_editor.js` → `OPEditor.toggleNode()` — Toggles the visibility of the container `op-tcn-<id>` between `display:none` and `display:block`, updates `OPEditor._expanded` (adding or removing the ID), and rotates the triangle `▶` via the CSS class `open`.

---

### REQ-OP-027 — Context menu on right-click in the tree

| **If** | the ontologist right-clicks on a tree node, |
|---|---|
| **Then** | a context menu is displayed at the cursor coordinates, offering relevant actions according to the targeted node (create child property, create sibling property, delete); the menu closes automatically as soon as a click is made outside it. |

**Source code:** `owl_editor.js` → `OPEditor.showContextMenu()` — Creates a DOM element `div#op-ctx-menu` positioned at the mouse coordinates; includes the actions "Add Child Property", "Add Sibling Property" (only if a non-root property is targeted), and "Delete"; installs a capturing `click` listener for automatic closing.

---

### REQ-OP-028 — Object property edit form

| **If** | the ontologist selects an object property in the tree, |
|---|---|
| **Then** | a complete form is displayed with the property identifier, its computed IRI, its annotations, domain and range constraints, the inverse property, OWL characteristics, and the property's usages in the ontology. |

| **If** | the property is new, |
|---|---|
| **Then** | saving is triggered on blur of the identifier field; for an existing property, it is triggered on each field modification. |

**Source code:** `owl_editor.js` → `OPEditor.renderForm()` — Generates an HTML form with the `op-id` field (with `_sanitizeId()` on each keystroke), the full IRI computed from `APP.state.ontology.id`, the Annotations block, the Domain and Range blocks side by side, the "Inverse Of" block, the "Characteristics" block, and a "Where Used" frame via `_whereUsedFrame()`; saving is triggered on `onblur` for a new property, on `onchange` for an existing property.

---

### REQ-OP-029 — Annotation management (labels, comments, others)

| **If** | the ontologist adds a `label` or `comment` type annotation to the property, |
|---|---|
| **Then** | a new annotation row is added in the Annotations section of the form. |

| **If** | the ontologist adds an annotation of another type by selecting an annotation property, |
|---|---|
| **Then** | an annotation row of type `other` is created with the specified property. |

| **If** | the ontologist deletes an annotation row, |
|---|---|
| **Then** | the row is removed from the form and the property is automatically saved if it is in edit mode. |

**Source code:** `owl_editor.js` → `OPEditor.addAnnotRow()` — Adds a row to `#op-annotations-body` via `_makeAnnotRow()`. `OPEditor.addOtherAnnotRow()` — Adds a row of type `other` and closes the `op-anno-picker` picker. `OPEditor.removeAnnotRow()` — Removes the parent `<tr>` row of the clicked button and triggers `autoSave()` if in edit mode.

---

### REQ-OP-030 — "Super Properties" panel with ancestor chain

| **If** | the ontologist selects a property in the tree, |
|---|---|
| **Then** | the "Super Properties" panel displays the complete hierarchical chain going up to `owl:topObjectProperty`: direct super-properties are editable (deletable), while transitive ancestors are presented visually as such; clicking on any ancestor navigates to its record. |

**Source code:** `owl_editor.js` → `OPEditor._updateSuperPanel()` — Fills `#op-sub-list` with direct super-properties; for each one, builds the complete ancestor chain up to `owl:topObjectProperty` with increasing indentation; direct super-properties carry a `✕` delete button; transitive ancestors are displayed in italics with opacity 0.75; each ancestor is clickable via `APP.navigateTo()`.

---

### REQ-OP-031 — Two-panel resizable layout

| **If** | the ontologist consults the object properties tab, |
|---|---|
| **Then** | the interface is divided into a left panel displaying the tree and the super-property chain, and a right panel displaying the edit form; each panel is resizable by dragging a separator handle. |

| **If** | the ontologist drags the vertical separator handle between the two panels, |
|---|---|
| **Then** | the width of the left panel is adjusted within acceptable limits, and the internal horizontal resizer is recalculated accordingly. |

**Source code:** `owl_editor.js` → `OPEditor.renderSplit()` — Generates the two-column layout with the `op-tree-panel` panel (tree + "Super Properties" sub-panel separated by an `h-resizer`) and the `op-detail` panel. `OPEditor._initSplitPane()` — Handles dragging of the `op-split-handle` handle, constrains the width between 160 px and 520 px, and calls `_initHResizers('op-tree-panel')`.

---

### REQ-OP-032 — Selection restoration after re-render

| **If** | the object properties tab is reloaded following an action (creation, modification, deletion), |
|---|---|
| **Then** | the property that was selected before the reload is automatically re-selected, preserving the ontologist's working context. |

---

*Document generated by static source code analysis — claude-sonnet-4-6*

**Source code:** `owl_editor.js` → `OPEditor.restoreSelection()` — Calls `_initSplitPane()`; if `_topPropSelected` is true, calls `selectTopProp()` again; if an ID is stored in `_selectedId`, calls `selectProp(_selectedId)` again.
