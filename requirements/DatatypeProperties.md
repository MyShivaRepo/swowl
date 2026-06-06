# Requirements — DatatypeProperties

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-DP-001 — Initialization of the available XSD types list](#req-dp-001--initialization-of-the-available-xsd-types-list)
- [REQ-DP-002 — Construction of the property hierarchical tree](#req-dp-002--construction-of-the-property-hierarchical-tree)
- [REQ-DP-003 — Automatic expansion of a selected property's ancestors](#req-dp-003--automatic-expansion-of-a-selected-propertys-ancestors)
- [REQ-DP-004 — Creation of a child property](#req-dp-004--creation-of-a-child-property)
- [REQ-DP-005 — Creation of a sibling property](#req-dp-005--creation-of-a-sibling-property)
- [REQ-DP-006 — Unique name generation for a new property](#req-dp-006--unique-name-generation-for-a-new-property)
- [REQ-DP-007 — Effective creation and navigation to the new property](#req-dp-007--effective-creation-and-navigation-to-the-new-property)
- [REQ-DP-008 — Drop of a property onto a new target](#req-dp-008--drop-of-a-property-onto-a-new-target)
- [REQ-DP-009 — Ancestor/descendant link check for drag & drop](#req-dp-009--ancestordescendant-link-check-for-drag--drop)
- [REQ-DP-010 — Range uniqueness check before opening the picker](#req-dp-010--range-uniqueness-check-before-opening-the-picker)
- [REQ-DP-011 — Domain management](#req-dp-011--domain-management)
- [REQ-DP-012 — Range management (XSD type)](#req-dp-012--range-management-xsd-type)
- [REQ-DP-013 — Super-property management](#req-dp-013--super-property-management)
- [REQ-DP-014 — Automatic save on field change](#req-dp-014--automatic-save-on-field-change)
- [REQ-DP-015 — Save (create or update) of a DatatypeProperty](#req-dp-015--save-create-or-update-of-a-datatypeproperty)
- [REQ-DP-016 — Deletion of a DatatypeProperty with confirmation](#req-dp-016--deletion-of-a-datatypeproperty-with-confirmation)

### Form
- [REQ-DP-017 — HTML option generation for DatatypeProperties](#req-dp-017--html-option-generation-for-datatypeproperties)
- [REQ-DP-018 — HTML option generation for XSD types](#req-dp-018--html-option-generation-for-xsd-types)
- [REQ-DP-019 — Rendering of a tree node with drag & drop handling](#req-dp-019--rendering-of-a-tree-node-with-drag--drop-handling)
- [REQ-DP-020 — Rendering of the full tree with owl:topDataProperty root](#req-dp-020--rendering-of-the-full-tree-with-owltopdataproperty-root)
- [REQ-DP-021 — Rendering of the two-panel (split) layout](#req-dp-021--rendering-of-the-two-panel-split-layout)
- [REQ-DP-022 — Selection restoration after re-render](#req-dp-022--selection-restoration-after-re-render)
- [REQ-DP-023 — Horizontal resizing of the left panel](#req-dp-023--horizontal-resizing-of-the-left-panel)
- [REQ-DP-024 — Update of the "Super Properties" panel](#req-dp-024--update-of-the-super-properties-panel)
- [REQ-DP-025 — Selection of the owl:topDataProperty root](#req-dp-025--selection-of-the-owltopdataproperty-root)
- [REQ-DP-026 — Selection of a DatatypeProperty in the tree](#req-dp-026--selection-of-a-datatypeproperty-in-the-tree)
- [REQ-DP-027 — Toolbar button state management](#req-dp-027--toolbar-button-state-management)
- [REQ-DP-028 — Expansion / collapse of a tree node](#req-dp-028--expansion--collapse-of-a-tree-node)
- [REQ-DP-029 — Display of the context menu (right-click)](#req-dp-029--display-of-the-context-menu-right-click)
- [REQ-DP-030 — Context menu dismissal](#req-dp-030--context-menu-dismissal)
- [REQ-DP-031 — Start of a property drag](#req-dp-031--start-of-a-property-drag)
- [REQ-DP-032 — Hovering over a target during drag](#req-dp-032--hovering-over-a-target-during-drag)
- [REQ-DP-033 — Rendering of the DatatypeProperty edit form](#req-dp-033--rendering-of-the-datatypeproperty-edit-form)
- [REQ-DP-034 — Adding / removing an annotation row (label / comment)](#req-dp-034--adding--removing-an-annotation-row-label--comment)
- [REQ-DP-035 — Adding an "other property" annotation](#req-dp-035--adding-an-other-property-annotation)

---

## 1. Substance — Business logic

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviors, validations, persistence.


### REQ-DP-001 — Initialization of the available XSD types list

| **If** | the ontologist needs to type a `DatatypeProperty` with a literal data type, |
|---|---|
| **Then** | the application offers exactly 12 recognized XSD types: `xsd:string`, `xsd:integer`, `xsd:decimal`, `xsd:float`, `xsd:double`, `xsd:boolean`, `xsd:date`, `xsd:dateTime`, `xsd:duration`, `xsd:anyURI`, `xsd:nonNegativeInteger`, `xsd:positiveInteger` — no other data type is allowed as the range of a `DatatypeProperty`. |

---

**Source code:** `owl_editor.js` → `XSD_TYPES` (constant, lines 167–171) — Frozen array of the 12 authorized XSD types, used as the single reference to populate range pickers and validate imports.

### REQ-DP-002 — Construction of the property hierarchical tree

| **If** | the ontology contains `DatatypeProperties` organized in a specialization hierarchy, |
|---|---|
| **Then** | the property tree faithfully reflects these specialization relationships, with the most general properties at the root and the most specific ones as leaves, each level sorted alphabetically. |

---

**Source code:** `owl_editor.js` → `DPEditor.buildTree()` — Analyzes the `subPropertyOf` relationships of each property, builds a `childrenOf` dictionary (map id → array of child ids) and a `roots` list (properties with no parent), both sorted alphabetically. References to non-existent IDs are ignored to avoid cycles.

### REQ-DP-003 — Automatic expansion of a selected property's ancestors

| **If** | the ontologist selects a `DatatypeProperty` buried in the hierarchy, |
|---|---|
| **Then** | the tree automatically unfolds to reveal the selected property, without the user having to manually expand each intermediate level. |

---

**Source code:** `owl_editor.js` → `DPEditor._expandAncestors()` — Recursively walks up the `subPropertyOf` chain from the selected property and inserts each found ancestor into the `_expanded` Set, thereby triggering their display in the tree.

### REQ-DP-004 — Creation of a child property

| **If** | the ontologist wishes to specialize an existing `DatatypeProperty` by creating a subproperty, |
|---|---|
| **Then** | the new property is automatically positioned under the currently selected property in the hierarchy, and the parent property is expanded to make it visible. |

| **If** | no property is selected at the time of creation, |
|---|---|
| **Then** | the new property is created at the root of the hierarchy, with no specialization relationship. |

---

**Source code:** `owl_editor.js` → `DPEditor.createChild()` — If `_selectedId` is defined, passes that id as parent to `_createAndSelect([parentId])` and adds the parent to `_expanded`. Otherwise calls `_createAndSelect([])`.

### REQ-DP-005 — Creation of a sibling property

| **If** | the ontologist wishes to create a `DatatypeProperty` at the same specialization level as an existing property, |
|---|---|
| **Then** | the new property inherits the same super-properties as the reference property, thus automatically positioning itself at the same rank in the hierarchy. |

---

**Source code:** `owl_editor.js` → `DPEditor.createSibling()` — Retrieves the `subPropertyOf` array of the property referenced by `_selectedId`, passes it to `_createAndSelect()` and adds each parent to `_expanded`.

### REQ-DP-006 — Unique name generation for a new property

| **If** | the ontologist creates a new `DatatypeProperty`, |
|---|---|
| **Then** | a provisional name is automatically assigned to it, guaranteeing the absence of identifier conflict with the properties already present in the ontology. |

---

**Source code:** `owl_editor.js` → `DPEditor._generatePropName()` — Generates the name `'NewDatatypeProperty'` then increments a suffixed counter (`NewDatatypeProperty1`, `NewDatatypeProperty2`, …) until an identifier absent from `APP.state.datatype_properties` is obtained.

### REQ-DP-007 — Effective creation and navigation to the new property

| **If** | the ontologist confirms the creation of a `DatatypeProperty`, |
|---|---|
| **Then** | the new property is immediately accessible in the tree and its edit form opens automatically, ready to be filled in. |

---

**Source code:** `owl_editor.js` → `DPEditor._createAndSelect()` — Builds a property object with default values (`annotations: {}`, `domain: []`, `range: []`, `functional: false`) and the IRI derived from `_generatePropName()`. Calls `API.createDP(prop)`, stores the id in `_selectedId` and `_editingId`, then refreshes via `APP.refresh()` and `APP.renderSection('datatype-properties')`. Errors are reported via `UI.error()`.

### REQ-DP-008 — Drop of a property onto a new target

| **If** | the ontologist moves a `DatatypeProperty` by drag & drop to another parent property, |
|---|---|
| **Then** | the specialization relationship is updated to reflect the new position in the hierarchy, and the change is immediately persisted. |

| **If** | the ontologist attempts to move a `DatatypeProperty` onto one of its own descendants, |
|---|---|
| **Then** | the operation is rejected in order to prevent the creation of a cycle in the hierarchy, and a warning is displayed. |

| **If** | the ontologist drops a `DatatypeProperty` onto the root or outside any node, |
|---|---|
| **Then** | the property becomes a root property, with no specialization relationship. |

---

**Source code:** `owl_editor.js` → `DPEditor.onDrop()` — Reads `_dragId` and `targetId`. If `_isDescendant(targetId, _dragId)` returns `true`, displays `UI.warn('Cannot drop on a descendant — would create a cycle')` and aborts. Otherwise updates the `subPropertyOf` of the source property to `[targetId]` or `[]` depending on whether the target is defined, calls `API.updateDP()`, then `UI.success()` and refreshes the display.

### REQ-DP-009 — Ancestor/descendant link check for drag & drop

| **If** | the ontologist moves a `DatatypeProperty` by drag & drop, |
|---|---|
| **Then** | the application checks in real time that the potential target is not a descendant of the property being moved, in order to prevent any cycle creation in the hierarchy. |

---

**Source code:** `owl_editor.js` → `DPEditor._isDescendant(targetId, sourceId)` — Performs a recursive depth-first traversal from `sourceId` via `buildTree().childrenOf`. Returns `false` immediately if either parameter is `null` or `undefined`.

### REQ-DP-010 — Range uniqueness check before opening the picker

| **If** | the ontologist attempts to add a data type as range when a type is already defined, |
|---|---|
| **Then** | the range picker does not open, ensuring that a `DatatypeProperty` can have only one data type as its range. |

| **If** | the ontologist opens any other value picker, |
|---|---|
| **Then** | the corresponding picker is displayed normally. |

---

**Source code:** `owl_editor.js` → `DPEditor.showPicker()` — For the `dp-range-picker` picker, checks for the presence of a `.cls-list-item[data-id]` element in `dp-range-list` before allowing opening. For all other pickers, delegates to `_togglePicker(id)`.

### REQ-DP-011 — Domain management

| **If** | the ontologist associates a class as the domain of a `DatatypeProperty`, |
|---|---|
| **Then** | the class appears in the property's domain list and the change is automatically saved. |

| **If** | the ontologist removes a class from the domain, |
|---|---|
| **Then** | the class disappears from the domain list; if the list is empty, `owl:Thing` is displayed as the implicit value, and the change is automatically saved. |

---

**Source code:** `owl_editor.js` → `DPEditor.addDomain()` — Inserts the class into `dp-domain-list` via `_addListItem()` with the `cls-dot` style, then calls `autoSave()`. `DPEditor.removeDomain()` — Removes the entry via `_removeListItem()`, displays `owl:Thing` if the list is empty, then calls `autoSave()`.

### REQ-DP-012 — Range management (XSD type)

| **If** | the ontologist associates an XSD data type as the range of a `DatatypeProperty`, |
|---|---|
| **Then** | the type appears in the range list and the ability to add a second one is disabled in order to maintain range uniqueness; the change is automatically saved. |

| **If** | the ontologist removes the data type from the range, |
|---|---|
| **Then** | the range list becomes empty again (implicit display `rdfs:Literal`), the ability to add a type is re-enabled, and the change is automatically saved. |

---

**Source code:** `owl_editor.js` → `DPEditor.addRange()` — Inserts the type into `dp-range-list` via `_addListItem()` with the `xsd-dot` style, hides the `dp-range-btn` button, then calls `autoSave()` if `_editingId` is defined. `DPEditor.removeRange()` — Removes the type via `_removeListItem()`, re-displays `dp-range-btn`, then calls `autoSave()`.

### REQ-DP-013 — Super-property management

| **If** | the ontologist declares a super-property for a `DatatypeProperty`, |
|---|---|
| **Then** | the specialization relationship is recorded and visible in the super-properties list, and the change is automatically saved. |

| **If** | the ontologist removes a super-property, |
|---|---|
| **Then** | the specialization relationship is deleted and the change is automatically saved. |

---

**Source code:** `owl_editor.js` → `DPEditor.addSubProp()` — Inserts the property into `dp-sub-list` via `_addListItem()` with navigation to the `'datatype-properties'` section and `dp-prop-dot` style, then calls `autoSave()`. `DPEditor.removeSubProp()` — Removes the entry via `_removeListItem()`, then calls `autoSave()`.

### REQ-DP-014 — Automatic save on field change

| **If** | the ontologist modifies a value in the form of an existing `DatatypeProperty`, |
|---|---|
| **Then** | the change is saved automatically, without the user having to manually trigger a save action. |

---

**Source code:** `owl_editor.js` → `DPEditor.autoSave()` — Checks that `_editingId !== null` before calling `save(false)`, preventing any unintentional persistence during the rendering of a creation form.

### REQ-DP-015 — Save (create or update) of a DatatypeProperty

| **If** | the ontologist validates the information for a new `DatatypeProperty`, |
|---|---|
| **Then** | the property is created in the ontology with all the entered information (identifier, annotations, domain, range, super-properties, functional characteristic), and a confirmation message is displayed. |

| **If** | the ontologist modifies an existing `DatatypeProperty` and triggers the save, |
|---|---|
| **Then** | all changes are persisted; if the identifier has changed, the rename is reported to the user. |

---

**Source code:** `owl_editor.js` → `DPEditor.save()` — Collects the identifier via `document.getElementById('dp-id').value` validated by `_validateId()`, annotations via `_collectAnnotations('dp-annotations-body')`, domain via `_collectList('dp-domain-list')`, range via `_collectList('dp-range-list')`, super-properties via `_collectList('dp-sub-list')`, and the functional characteristic via the `dp-functional` checkbox. In creation mode (`isNew === true`) calls `API.createDP(prop)`; in update mode calls `API.updateDP(originalId, prop)`. In both cases, `APP.refresh()` then `APP.renderSection('datatype-properties')` are called.

### REQ-DP-016 — Deletion of a DatatypeProperty with confirmation

| **If** | the ontologist requests the deletion of a `DatatypeProperty`, |
|---|---|
| **Then** | explicit confirmation is requested before any irreversible action. |

| **If** | the ontologist confirms the deletion, |
|---|---|
| **Then** | the property is permanently removed from the ontology, the current selection is reset, and the tree is updated accordingly. |

---

**Source code:** `owl_editor.js` → `DPEditor.delete()` — Displays a dialog via `UI.confirm()`. Upon confirmation, calls `API.deleteDP(id)`, displays `UI.success()`, resets `_selectedId` and `_editingId` to `null`, then refreshes via `APP.refresh()` and `APP.renderSection('datatype-properties')`.

---

## 2. Form — Presentation and UI

> Requirements relating to display: layout, visual components, interactions, navigation, styles.

### REQ-DP-017 — HTML option generation for DatatypeProperties

| **If** | another tab of the application presents a dropdown list referencing `DatatypeProperties`, |
|---|---|
| **Then** | all `DatatypeProperties` in the ontology are offered as options, with the current value pre-selected where applicable. |

---

**Source code:** `owl_editor.js` → `dpOptions(selectedId)` — Iterates over `APP.state.datatype_properties` and produces a string of `<option value="id">id</option>` elements, with the `selected` attribute set on the entry whose id matches `selectedId`.

### REQ-DP-018 — HTML option generation for XSD types

| **If** | a data type picker must be displayed in the application, |
|---|---|
| **Then** | all authorized XSD types are offered as options, with `xsd:string` pre-selected by default if no value is specified. |

---

**Source code:** `owl_editor.js` → `xsdOptions(selected)` — Iterates over `XSD_TYPES` and produces HTML `<option>` elements, with `selected === undefined` treating `xsd:string` as the default value.

### REQ-DP-019 — Rendering of a tree node with drag & drop handling

| **If** | a node of the `DatatypeProperties` tree is displayed, |
|---|---|
| **Then** | it is visually indented according to its rank in the hierarchy, accompanied by an expansion indicator if it has subproperties, and it is interactive for selection, context menu, and reorganization by drag & drop. |

---

**Source code:** `owl_editor.js` → `DPEditor._renderNode(id, depth)` — Generates the node HTML with indentation calculated at `depth * 16 + 6` px. Includes an expand/collapse triangle if `childrenOf[id]` is non-empty. Binds the `onclick`, `oncontextmenu`, `ondragstart`, `ondragover`, `ondragleave`, `ondrop`, `ondragend` handlers to the corresponding methods of `DPEditor`.

### REQ-DP-020 — Rendering of the full tree with owl:topDataProperty root

| **If** | the `DatatypeProperties` tab is displayed, |
|---|---|
| **Then** | the tree is presented with `owl:topDataProperty` (or its equivalent according to the OWL profile of the ontology) as the universal root, followed by all the ontology's properties organized in a hierarchy; if no property exists, an informative message indicates this. |

---

**Source code:** `owl_editor.js` → `DPEditor.renderTree()` — Calls `buildTree()` then `_renderNode()` for each element of `roots`. Displays at the head a root node whose label is provided by `APP.getOntologyRootLabels()`. If `APP.state.datatype_properties` is empty, injects the message `"No DatatypeProperty"`.

### REQ-DP-021 — Rendering of the two-panel (split) layout

| **If** | the `DatatypeProperties` tab is initialized, |
|---|---|
| **Then** | the interface is divided into a hierarchical navigation panel on the left and a detail panel on the right, separated by a resize handle, with creation actions available from the moment it opens. |

---

**Source code:** `owl_editor.js` → `DPEditor.renderSplit()` — Generates the complete HTML structure: left panel with the tree and the "Super Properties" sub-panel, `split-handle` separator, empty `detail-panel` right panel. The "Child", "Sibling" and "Delete" buttons are generated with the `disabled` attribute.

### REQ-DP-022 — Selection restoration after re-render

| **If** | the `DatatypeProperties` tab is re-rendered following a change, |
|---|---|
| **Then** | the previously selected property remains active and visible in the tree, preserving the ontologist's working context. |

---

**Source code:** `owl_editor.js` → `DPEditor.restoreSelection()` — Calls `_initSplitPane()` to re-attach the resize listeners, then selects the root via `selectTopProp()` if `_selectedId` is `null`, or the memorized property via `selectProp(_selectedId)` otherwise.

### REQ-DP-023 — Horizontal resizing of the left panel

| **If** | the ontologist adjusts the width of the navigation panel by dragging the separator, |
|---|---|
| **Then** | the panel resizes in real time between a minimum and maximum width, and the vertical separator between the tree and the "Super Properties" sub-panel remains functional. |

---

**Source code:** `owl_editor.js` → `DPEditor._initSplitPane()` — Listens to `mousedown/mousemove/mouseup` events on `dp-split-handle` and constrains the left panel width between 160 px and 520 px. Then calls `_initHResizers('dp-tree-panel')` to initialize the internal vertical resizing.

### REQ-DP-024 — Update of the "Super Properties" panel

| **If** | no `DatatypeProperty` is selected, |
|---|---|
| **Then** | the lower-left panel displays a message inviting the ontologist to select a property. |

| **If** | a `DatatypeProperty` is selected, |
|---|---|
| **Then** | the panel displays the complete specialization chain from the selected property up to `owl:topDatatypeProperty`, with direct super-properties equipped with a delete button, and a picker allowing a new super-property to be added from those available. |

---

**Source code:** `owl_editor.js` → `DPEditor._updateSuperPanel()` — If `_selectedId` is `null`, injects the message "— select a property —" into the panel. Otherwise, computes the ancestor chain via `buildChain()`, generates the HTML with increasing indentation and a ✕ button on direct ancestors, then builds a `<select>` filtering out properties already used as super-properties.

### REQ-DP-025 — Selection of the owl:topDataProperty root

| **If** | the ontologist selects the universal root `owl:topDataProperty` in the tree, |
|---|---|
| **Then** | no concrete property is selected, the detail panel displays a welcome screen with the ability to create a new property, and the action buttons are updated accordingly. |

---

**Source code:** `owl_editor.js` → `DPEditor.selectTopProp()` — Sets `_selectedId` to `null` and `_topPropSelected` to `true`, updates the highlighting in the tree, injects a welcome screen with the root and a creation button into the right panel, then calls `_updateSuperPanel(null)` and `_updateTreeButtons()`.

### REQ-DP-026 — Selection of a DatatypeProperty in the tree

| **If** | the ontologist selects a `DatatypeProperty` in the tree, |
|---|---|
| **Then** | the property is highlighted, its complete edit form is displayed in the detail panel, and the "Super Properties" panel as well as the action buttons are updated to reflect the context of this property. |

---

**Source code:** `owl_editor.js` → `DPEditor.selectProp(id)` — Stores `id` in `_selectedId`, updates the visual highlighting, retrieves the property object from `APP.state.datatype_properties`, injects the form via `renderForm()`, initializes the vertical resizers of the right panel, then calls `_updateSuperPanel()` and `_updateTreeButtons()`.

### REQ-DP-027 — Toolbar button state management

| **If** | the `owl:topDataProperty` root is selected, |
|---|---|
| **Then** | only the child property creation action is available; the sibling creation and deletion actions are hidden as they are not applicable to the root. |

| **If** | a concrete `DatatypeProperty` is selected, |
|---|---|
| **Then** | the child creation, sibling creation, and deletion actions are all available. |

| **If** | no selection is active, |
|---|---|
| **Then** | all actions are disabled. |

---

**Source code:** `owl_editor.js` → `DPEditor._updateTreeButtons()` — Accesses the button elements by their IDs in the DOM and sets the `disabled` / `style.display` attributes according to the state of `_topPropSelected` and `_selectedId`.

### REQ-DP-028 — Expansion / collapse of a tree node

| **If** | the ontologist clicks on the expansion indicator of a tree node, |
|---|---|
| **Then** | the node toggles between expanded (subproperties visible) and collapsed (subproperties hidden), and the visual indicator immediately reflects the current state. |

---

**Source code:** `owl_editor.js` → `DPEditor.toggleNode(id)` — Toggles the visibility of the child container `dp-tcn-${id}`, adds or removes `id` from the `_expanded` Set, and rotates the `.tree-toggle` arrow of the corresponding element.

### REQ-DP-029 — Display of the context menu (right-click)

| **If** | the ontologist right-clicks on a tree node, |
|---|---|
| **Then** | a context menu appears at the cursor position, offering the actions applicable to the concerned node: child property creation always available, sibling property creation and deletion available only on a concrete property (not on the root). |

---

**Source code:** `owl_editor.js` → `DPEditor.showContextMenu(event, id)` — Removes any existing context menu, selects the property or the root according to `id`, creates a `div.ctx-menu` element inserted into the `body` at the cursor coordinates. Always adds "Add Child Property"; adds "Add Sibling Property" and "Delete" only if `id` is defined. Attaches a `click` listener on `document` for automatic dismissal.

### REQ-DP-030 — Context menu dismissal

| **If** | the ontologist clicks outside the context menu or triggers an action, |
|---|---|
| **Then** | the context menu is removed from the interface. |

---

**Source code:** `owl_editor.js` → `DPEditor._closeContextMenu()` — Searches for the element bearing the ID `dp-ctx-menu` in the DOM and removes it if it exists.

### REQ-DP-031 — Start of a property drag

| **If** | the ontologist begins dragging a `DatatypeProperty` in the tree to reposition it, |
|---|---|
| **Then** | the dragged property is visually distinguished from the other nodes, clearly signaling that a move operation is in progress. |

---

**Source code:** `owl_editor.js` → `DPEditor.onDragStart(event, id)` — Stores `id` in `_dragId`, sets `event.dataTransfer.effectAllowed` to `'move'` and stores the id in `dataTransfer`. Adds the CSS class `'dragging'` to the source element after a `setTimeout(0)` to work around the browser's rendering constraint on the drag image.

### REQ-DP-032 — Hovering over a target during drag

| **If** | the ontologist hovers over a target node during a drag & drop **and** the drop is valid (target different from source and not a descendant), |
|---|---|
| **Then** | the hovered node is highlighted, indicating that it is a valid target for the drop. |

---

**Source code:** `owl_editor.js` → `DPEditor.onDragOver(event, targetId)` — Checks that `_dragId` is defined, that `targetId !== _dragId`, and that `_isDescendant(targetId, _dragId)` returns `false`. If all conditions are met, calls `event.preventDefault()` and applies the CSS class `'drag-over'` to the hovered element.

### REQ-DP-033 — Rendering of the DatatypeProperty edit form

| **If** | the ontologist selects or creates a `DatatypeProperty`, |
|---|---|
| **Then** | a complete form is displayed in the detail panel, presenting all the editable characteristics of the property: identifier, full IRI, annotations (labels, comments, others), domain classes, range data type, super-properties, functional characteristic, and usages in the ontology's rules. |

| **If** | the form corresponds to a new property being created, |
|---|---|
| **Then** | an explicit validation button is displayed to confirm the creation. |

| **If** | the form corresponds to an existing property, |
|---|---|
| **Then** | any field modification triggers an automatic save. |

---

**Source code:** `owl_editor.js` → `DPEditor.renderForm(prop, isNew)` — Generates the complete HTML of the right panel: `dp-id` field with value sanitized by `_sanitizeId()`, IRI calculated from `APP.state.ontology.id`, annotation table via `_annoRow()` for `labels`/`comments`/`other`, domain and range lists via `_listRows()` with implicit values `owl:Thing` and `rdfs:Literal`, `dp-functional` checkbox, "Where Used" section via `_whereUsedFrame()`. In creation mode, generates a "✅ Create" button; in edit mode, binds `onchange` to `autoSave()`.

### REQ-DP-034 — Adding / removing an annotation row (label / comment)

| **If** | the ontologist adds a label or comment annotation to a `DatatypeProperty`, |
|---|---|
| **Then** | a new input row appears in the annotation table, and the change is automatically saved if a property is currently being edited. |

| **If** | the ontologist removes an annotation row, |
|---|---|
| **Then** | the row is removed from the table and the change is automatically saved if a property is currently being edited. |

---

**Source code:** `owl_editor.js` → `DPEditor.addAnnotRow(type, ac)` — Calls `_makeAnnotRow(type, 'DPEditor', ac)` and inserts the returned row into the `tbody` identified `dp-annotations-body`, then calls `autoSave()` if `_editingId !== null`. `DPEditor.removeAnnotRow(btn)` — Removes the parent `<tr>` row via `btn.closest('tr')?.remove()`, then calls `autoSave()` if `_editingId !== null`.

### REQ-DP-035 — Adding an "other property" annotation

| **If** | the ontologist selects an "other property" annotation type via the dedicated picker, |
|---|---|
| **Then** | a corresponding new row is added to the annotation table and the picker is automatically hidden so as not to clutter the interface. |

---

**Source code:** `owl_editor.js` → `DPEditor.addOtherAnnotRow(ac, prop)` — Calls `_makeAnnotRow('other', 'DPEditor', ac, prop)`, inserts the row into `dp-annotations-body`, then forces `dp-anno-picker.style.display` to `'none'`.
