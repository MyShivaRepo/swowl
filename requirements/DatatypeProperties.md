# Requirements — DatatypeProperties

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-DP-001 — Initialisation of the available XSD types list](#req-dp-001--initialisation-of-the-available-xsd-types-list)
- [REQ-DP-004 — Building the hierarchical property tree](#req-dp-004--building-the-hierarchical-property-tree)
- [REQ-DP-005 — Automatic expansion of a selected property's ancestors](#req-dp-005--automatic-expansion-of-a-selected-propertys-ancestors)
- [REQ-DP-016 — Creating a child property](#req-dp-016--creating-a-child-property)
- [REQ-DP-017 — Creating a sibling property](#req-dp-017--creating-a-sibling-property)
- [REQ-DP-018 — Generating a unique name for a new property](#req-dp-018--generating-a-unique-name-for-a-new-property)
- [REQ-DP-019 — Effective creation and navigation to the new property](#req-dp-019--effective-creation-and-navigation-to-the-new-property)
- [REQ-DP-024 — Dropping a property onto a new target](#req-dp-024--dropping-a-property-onto-a-new-target)
- [REQ-DP-025 — Checking an ancestor/descendant link for drag & drop](#req-dp-025--checking-an-ancestordescendant-link-for-drag--drop)
- [REQ-DP-030 — Uniqueness check on range before opening the picker](#req-dp-030--uniqueness-check-on-range-before-opening-the-picker)
- [REQ-DP-031 — Adding / removing a domain](#req-dp-031--adding--removing-a-domain)
- [REQ-DP-032 — Adding an XSD type as range (with uniqueness)](#req-dp-032--adding-an-xsd-type-as-range-with-uniqueness)
- [REQ-DP-033 — Removing the XSD type from the range](#req-dp-033--removing-the-xsd-type-from-the-range)
- [REQ-DP-034 — Adding / removing a super-property](#req-dp-034--adding--removing-a-super-property)
- [REQ-DP-035 — Automatic save on field change](#req-dp-035--automatic-save-on-field-change)
- [REQ-DP-036 — Saving (creating or updating) a DatatypeProperty](#req-dp-036--saving-creating-or-updating-a-datatypeproperty)
- [REQ-DP-037 — Deleting a DatatypeProperty with confirmation](#req-dp-037--deleting-a-datatypeproperty-with-confirmation)

### Form
- [REQ-DP-002 — Generating HTML options for DatatypeProperties](#req-dp-002--generating-html-options-for-datatypeproperties)
- [REQ-DP-003 — Generating HTML options for XSD types](#req-dp-003--generating-html-options-for-xsd-types)
- [REQ-DP-006 — Rendering a tree node with drag & drop handling](#req-dp-006--rendering-a-tree-node-with-drag--drop-handling)
- [REQ-DP-007 — Rendering the full tree with owl:topDataProperty root](#req-dp-007--rendering-the-full-tree-with-owltopdataproperty-root)
- [REQ-DP-008 — Rendering the two-panel split layout](#req-dp-008--rendering-the-two-panel-split-layout)
- [REQ-DP-009 — Restoring the selection after re-rendering](#req-dp-009--restoring-the-selection-after-re-rendering)
- [REQ-DP-010 — Horizontal resizing of the left panel](#req-dp-010--horizontal-resizing-of-the-left-panel)
- [REQ-DP-011 — Updating the "Super Properties" panel](#req-dp-011--updating-the-super-properties-panel)
- [REQ-DP-012 — Selecting the owl:topDataProperty root](#req-dp-012--selecting-the-owltopdataproperty-root)
- [REQ-DP-013 — Selecting a DatatypeProperty in the tree](#req-dp-013--selecting-a-datatypeproperty-in-the-tree)
- [REQ-DP-014 — Managing toolbar button states](#req-dp-014--managing-toolbar-button-states)
- [REQ-DP-015 — Expanding / collapsing a tree node](#req-dp-015--expanding--collapsing-a-tree-node)
- [REQ-DP-020 — Displaying the context menu (right-click)](#req-dp-020--displaying-the-context-menu-right-click)
- [REQ-DP-021 — Closing the context menu](#req-dp-021--closing-the-context-menu)
- [REQ-DP-022 — Starting the drag of a property](#req-dp-022--starting-the-drag-of-a-property)
- [REQ-DP-023 — Hovering over a target during drag](#req-dp-023--hovering-over-a-target-during-drag)
- [REQ-DP-026 — Rendering the DatatypeProperty edit form](#req-dp-026--rendering-the-datatypeproperty-edit-form)
- [REQ-DP-027 — Adding an annotation row (label / comment)](#req-dp-027--adding-an-annotation-row-label--comment)
- [REQ-DP-028 — Adding an "other property" annotation](#req-dp-028--adding-an-other-property-annotation)
- [REQ-DP-029 — Removing an annotation row](#req-dp-029--removing-an-annotation-row)

---

## 1. Substance — Business logic and functional rules

> Requirements independent of the UI: OWL rules, data constraints, algorithms, persistence.


### REQ-DP-001 — Initialisation of the available XSD types list


The code defines a constant array `XSD_TYPES` containing exactly 12 XSD types usable as range: `xsd:string`, `xsd:integer`, `xsd:decimal`, `xsd:float`, `xsd:double`, `xsd:boolean`, `xsd:date`, `xsd:dateTime`, `xsd:duration`, `xsd:anyURI`, `xsd:nonNegativeInteger`, `xsd:positiveInteger`. This list is the sole reference for the data types allowed in the application.

---

**Source code:** `owl_editor.js` → `XSD_TYPES` (constant, lines 167–171)

### REQ-DP-004 — Building the hierarchical property tree


The method `buildTree(props)` computes the parent/child structure from the `subPropertyOf` field of each property. It returns an object `{ roots, childrenOf }` where `roots` is the alphabetically sorted list of properties without a parent, and `childrenOf` is a map of each property to its alphabetically sorted children. Cycles are avoided: only references to existing IDs are taken into account.

---

**Source code:** `owl_editor.js` → `DPEditor.buildTree()`

### REQ-DP-005 — Automatic expansion of a selected property's ancestors


The method `_expandAncestors(propId)` recursively traverses the parents of a property (via `subPropertyOf`) and adds each of them to `this._expanded` (Set), so that the path from the root to the property is fully expanded in the display.

---

**Source code:** `owl_editor.js` → `DPEditor._expandAncestors()`

### REQ-DP-016 — Creating a child property


The method `createChild()` reads `_selectedId` to determine the potential parent: if a property is selected, it becomes the sole parent; otherwise the new property is created at the root. It adds the parent to the `_expanded` Set to guarantee its visibility, then delegates to `_createAndSelect([parent])`.

---

**Source code:** `owl_editor.js` → `DPEditor.createChild()`

### REQ-DP-017 — Creating a sibling property


The method `createSibling()` only executes if `_selectedId` is defined. It retrieves the parents (`subPropertyOf`) of the selected property and passes them to `_createAndSelect()`, producing a new property at the same hierarchical level. Each parent is added to `_expanded`.

---

**Source code:** `owl_editor.js` → `DPEditor.createSibling()`

### REQ-DP-018 — Generating a unique name for a new property


The method `_generatePropName()` builds a name starting from `'NewDatatypeProperty'` and incrementing a counter (`NewDatatypeProperty1`, `NewDatatypeProperty2`, …) until it finds a name absent from the list of existing IDs in `APP.state.datatype_properties`.

---

**Source code:** `owl_editor.js` → `DPEditor._generatePropName()`

### REQ-DP-019 — Effective creation and navigation to the new property


The method `_createAndSelect(subPropertyOf)` constructs a property object with default values (empty `annotations`, empty `domain`, empty `range`, `functional: false`) and the IRI generated by `_generatePropName()`. It calls `API.createDP(prop)`, stores the ID in `_selectedId` and `_editingId`, then refreshes the application state via `APP.refresh()` and `APP.renderSection('datatype-properties')`. Errors are displayed via `UI.error()`.

---

**Source code:** `owl_editor.js` → `DPEditor._createAndSelect()`

### REQ-DP-024 — Dropping a property onto a new target


The method `onDrop(event, targetId)` moves a property in the hierarchy by modifying its `subPropertyOf` field: if `targetId` is defined, the new parent list equals `[targetId]`; otherwise it is empty (root property). It calls `API.updateDP()` to persist the change, displays a success message via `UI.success()`, then refreshes the display. If the target is a descendant of the source, the operation is cancelled with a warning `UI.warn('Cannot drop on a descendant — would create a cycle')`.

---

**Source code:** `owl_editor.js` → `DPEditor.onDrop()`

### REQ-DP-025 — Checking an ancestor/descendant link for drag & drop


The method `_isDescendant(potentialDesc, ancestorId)` performs a recursive depth-first traversal of the tree (via `buildTree()`) from `ancestorId` to determine whether `potentialDesc` is one of its descendants. Returns `false` if either parameter is null/undefined.

---

**Source code:** `owl_editor.js` → `DPEditor._isDescendant()`

### REQ-DP-030 — Uniqueness check on range before opening the picker


The method `showPicker(id)` prevents the range picker (`dp-range-picker`) from opening if the `dp-range-list` already contains an element `.cls-list-item[data-id]`, thereby ensuring that only one XSD value can be defined as range. For other pickers, it delegates to `_togglePicker(id)`.

---

**Source code:** `owl_editor.js` → `DPEditor.showPicker()`

### REQ-DP-031 — Adding / removing a domain


`addDomain(id)` calls `_addListItem()` to insert the class into `dp-domain-list`, using the `cls-dot` style, then triggers `autoSave()`.
`removeDomain(id)` calls `_removeListItem()` which removes the entry from `dp-domain-list` and displays `owl:Thing` as the default value if the list becomes empty, then triggers `autoSave()`.

---

**Source code:** `owl_editor.js` → `DPEditor.addDomain()` and `DPEditor.removeDomain()`

### REQ-DP-032 — Adding an XSD type as range (with uniqueness)


The method `addRange(id)` calls `_addListItem()` to insert the XSD type into `dp-range-list` with the `xsd-dot` style, then hides the `dp-range-btn` button to prevent adding a second type. It then triggers `autoSave()` if a property is being edited.

---

**Source code:** `owl_editor.js` → `DPEditor.addRange()`

### REQ-DP-033 — Removing the XSD type from the range


The method `removeRange(id)` calls `_removeListItem()` to remove the type from `dp-range-list` (the displayed default value reverts to `rdfs:Literal`), then shows the `dp-range-btn` button again to allow selecting a new type. It then triggers `autoSave()`.

---

**Source code:** `owl_editor.js` → `DPEditor.removeRange()`

### REQ-DP-034 — Adding / removing a super-property


`addSubProp(id)` inserts the chosen property into `dp-sub-list` via `_addListItem()`, with navigation to the `'datatype-properties'` section and `dp-prop-dot` style, then triggers `autoSave()`.
`removeSubProp(id)` removes the entry from `dp-sub-list` via `_removeListItem()`, then triggers `autoSave()`.

---

**Source code:** `owl_editor.js` → `DPEditor.addSubProp()` and `DPEditor.removeSubProp()`

### REQ-DP-035 — Automatic save on field change


The method `autoSave()` calls `save(false)` only if `_editingId !== null`, i.e. if an existing property is being edited. It is bound to the `onchange` event of all form fields when an existing property is selected.

---

**Source code:** `owl_editor.js` → `DPEditor.autoSave()`

### REQ-DP-036 — Saving (creating or updating) a DatatypeProperty


The method `save(isNew)` collects all form values:
- ID via `document.getElementById('dp-id').value`, validated by `_validateId()`.
- Annotations (labels, comments, other) via `_collectAnnotations('dp-annotations-body')`.
- Domain via `_collectList('dp-domain-list')`.
- Range via `_collectList('dp-range-list')`.
- SubPropertyOf via `_collectList('dp-sub-list')`.
- Functional via the state of the `dp-functional` checkbox.

In creation mode (`isNew === true`), it calls `API.createDP(prop)` and displays a success message. In update mode, it calls `API.updateDP(originalId, prop)` and signals a rename if the ID has changed. In both cases, `APP.refresh()` then `APP.renderSection('datatype-properties')` are called.

---

**Source code:** `owl_editor.js` → `DPEditor.save()`

### REQ-DP-037 — Deleting a DatatypeProperty with confirmation


The method `delete(id)` displays a confirmation dialog via `UI.confirm()`. If the user confirms, it calls `API.deleteDP(id)`, displays a success message via `UI.success()`, resets `_selectedId` and `_editingId` to `null`, then refreshes the display via `APP.refresh()` and `APP.renderSection('datatype-properties')`. The public method `deleteSelected()` delegates to `delete(this._selectedId)` if a property is selected.

---

## 2. Form — Presentation and user interface

> Requirements related to display: layout, visual components, interactions, navigation, styles.

**Source code:** `owl_editor.js` → `DPEditor.delete()`

### REQ-DP-002 — Generating HTML options for DatatypeProperties


The function `dpOptions(selectedId)` iterates over `APP.state.datatype_properties` and produces a string of `<option>` elements for each property, with the value corresponding to `selectedId` selected. This result is used in the dropdown lists of other tabs that reference a DatatypeProperty.

---

**Source code:** `owl_editor.js` → `dpOptions()`

### REQ-DP-003 — Generating HTML options for XSD types


The function `xsdOptions(selected)` iterates over `XSD_TYPES` and produces HTML `<option>` elements. The default value of the `selected` parameter is `'xsd:string'`. This function feeds the XSD selectors in the Individuals tab.

---

**Source code:** `owl_editor.js` → `xsdOptions()`

### REQ-DP-006 — Rendering a tree node with drag & drop handling


The method `_renderNode(id, childrenOf, depth)` generates the HTML for a tree node. It applies indentation proportional to the depth (`depth * 16 + 6` px), displays a toggle triangle if the node has children, and binds the `onclick`, `oncontextmenu`, `ondragstart`, `ondragover`, `ondragleave`, `ondrop`, `ondragend` handlers to the corresponding methods of `DPEditor`.

---

**Source code:** `owl_editor.js` → `DPEditor._renderNode()`

### REQ-DP-007 — Rendering the full tree with owl:topDataProperty root


The method `renderTree(props)` calls `buildTree()` then `_renderNode()` for each root. It displays at the top an element representing the root (`owl:topDataProperty` or `rdf:Property` depending on `APP.getOntologyRootLabels()`). If the property list is empty, it displays the message `"No DatatypeProperty"`.

---

**Source code:** `owl_editor.js` → `DPEditor.renderTree()`

### REQ-DP-008 — Rendering the two-panel split layout


The method `renderSplit(props)` generates the complete HTML structure of the tab: left panel containing the tree and the "Super Properties" sub-panel, horizontal resizable separator (`split-handle`), and right panel (`detail-panel`) empty with a creation button. The "Child", "Sibling" and "Delete" buttons are rendered disabled by default.

---

**Source code:** `owl_editor.js` → `DPEditor.renderSplit()`

### REQ-DP-009 — Restoring the selection after re-rendering


The method `restoreSelection()` first calls `_initSplitPane()` to re-attach the resize listeners, then re-selects either the root (`selectTopProp()`) or the property stored in `_selectedId` (`selectProp()`), thereby preserving the interface state after a full re-render of the section.

---

**Source code:** `owl_editor.js` → `DPEditor.restoreSelection()`

### REQ-DP-010 — Horizontal resizing of the left panel


The method `_initSplitPane()` attaches a `mousedown` listener on the `dp-split-handle` element to allow the user to resize the left panel by dragging. The width is constrained between 160 and 520 px. It also calls `_initHResizers('dp-tree-panel')` for vertical resizing between the tree and the "Super Properties" sub-panel.

---

**Source code:** `owl_editor.js` → `DPEditor._initSplitPane()`

### REQ-DP-011 — Updating the "Super Properties" panel


The method `_updateSuperPanel(prop)` updates the content of the lower left panel (`dp-sub-list`). If no property is passed, it displays a message "— select a property —". If a property is passed, it computes the full ancestor chain via the internal function `buildChain()`, displays each ancestor with increasing indentation, and ends the chain with `owl:topDatatypeProperty`. Direct ancestors include a delete button (✕). An HTML selector lists the properties not yet used as super-properties.

---

**Source code:** `owl_editor.js` → `DPEditor._updateSuperPanel()`

### REQ-DP-012 — Selecting the owl:topDataProperty root


The method `selectTopProp()` sets `_selectedId` to `null` and `_topPropSelected` to `true`. It updates the highlighting in the tree, replaces the detail panel content with a welcome screen displaying the root and a creation button, then calls `_updateSuperPanel(null)` and `_updateTreeButtons()`.

---

**Source code:** `owl_editor.js` → `DPEditor.selectTopProp()`

### REQ-DP-013 — Selecting a DatatypeProperty in the tree


The method `selectProp(id)` stores `id` in `_selectedId`, updates the visual highlighting in the tree, retrieves the property object from `APP.state.datatype_properties`, injects the detail form via `renderForm()`, initialises the vertical resizers of the right panel, updates the "Super Properties" panel and the toolbar buttons.

---

**Source code:** `owl_editor.js` → `DPEditor.selectProp()`

### REQ-DP-014 — Managing toolbar button states


The method `_updateTreeButtons()` enables or disables the `dp-btn-child`, `dp-btn-sister` and `dp-btn-delete` buttons according to the current state: if the root is selected, only "Child" is enabled and "Sibling" / "Delete" are hidden; if a property is selected, all three buttons are active; otherwise all are disabled.

---

**Source code:** `owl_editor.js` → `DPEditor._updateTreeButtons()`

### REQ-DP-015 — Expanding / collapsing a tree node


The method `toggleNode(id)` toggles the visibility of the child container `dp-tcn-${id}`. It updates the `_expanded` Set (adding or removing `id`) and rotates the expand/collapse arrow of the `.tree-toggle` element.

---

**Source code:** `owl_editor.js` → `DPEditor.toggleNode()`

### REQ-DP-020 — Displaying the context menu (right-click)


The method `showContextMenu(event, id)` removes any existing menu, selects the property or the root depending on the value of `id`, creates a `div.ctx-menu` element and inserts it into the `body` at the cursor position. The menu always contains the item "Add Child Property"; if `id` is defined (real property), it also adds "Add Sibling Property" and "Delete". The menu closes automatically on an outside click via a `click` listener on `document`.

---

**Source code:** `owl_editor.js` → `DPEditor.showContextMenu()`

### REQ-DP-021 — Closing the context menu


The method `_closeContextMenu()` removes from the DOM the element bearing the ID `dp-ctx-menu`, if it exists.

---

**Source code:** `owl_editor.js` → `DPEditor._closeContextMenu()`

### REQ-DP-022 — Starting the drag of a property


The method `onDragStart(event, id)` stores the ID of the dragged property in `_dragId`, sets `effectAllowed` to `'move'`, stores the ID in `dataTransfer`, and adds the CSS class `'dragging'` to the source element after a 0 ms delay (via `setTimeout`).

---

**Source code:** `owl_editor.js` → `DPEditor.onDragStart()`

### REQ-DP-023 — Hovering over a target during drag


The method `onDragOver(event, targetId)` allows the drop (`event.preventDefault()`) only if: a drag is in progress (`_dragId` defined), the target differs from the source, and the target is not a descendant of the source (checked via `_isDescendant()`). It applies the class `'drag-over'` to the hovered element.

---

**Source code:** `owl_editor.js` → `DPEditor.onDragOver()`

### REQ-DP-026 — Rendering the DatatypeProperty edit form


The method `renderForm(prop)` generates the complete HTML of the right panel. In creation mode (`prop === null`), a "✅ Create" button is displayed. In edit mode, all field changes trigger `autoSave()` via `onchange`. The form contains the following sections, all generated by this method:
- **Header**: ID input field (with `_sanitizeId()`), mention `(instance of owl:DatatypeProperty)`, full IRI computed from `APP.state.ontology.id`.
- **Annotations**: table with columns Property / Value / Lang, populated via `_annoRow()` for `labels`, `comments` and `other`.
- **Domain(s)**: list of domain classes via `_listRows()`, selector among available classes (`APP.state.classes`), default value displayed `owl:Thing`.
- **Range**: list of XSD types via `_listRows()`, selector among unused types drawn from `XSD_TYPES`, default value displayed `rdfs:Literal`.
- **Characteristics**: single checkbox "Functional" bound to `p.functional`.
- **Where Used**: section generated by `_whereUsedFrame()` listing the rules that use this property.

---

**Source code:** `owl_editor.js` → `DPEditor.renderForm()`

### REQ-DP-027 — Adding an annotation row (label / comment)


The method `addAnnotRow(type)` calls `_makeAnnotRow(type, 'DPEditor', ac)` and inserts the returned row into the `tbody` identified as `dp-annotations-body`. The `ac` attribute enables `autoSave()` if a property is being edited (`_editingId !== null`).

---

**Source code:** `owl_editor.js` → `DPEditor.addAnnotRow()`

### REQ-DP-028 — Adding an "other property" annotation


The method `addOtherAnnotRow(prop)` calls `_makeAnnotRow('other', 'DPEditor', ac, prop)`, inserts the row into `dp-annotations-body`, then hides the annotation picker `dp-anno-picker` by forcing its `style.display` to `'none'`.

---

**Source code:** `owl_editor.js` → `DPEditor.addOtherAnnotRow()`

### REQ-DP-029 — Removing an annotation row


The method `removeAnnotRow(btn)` removes from the DOM the parent `<tr>` row of the button passed as parameter (`btn.closest('tr')?.remove()`), then triggers `autoSave()` if a property is being edited.

---

— claude-sonnet-4-6

**Source code:** `owl_editor.js` → `DPEditor.removeAnnotRow()`
