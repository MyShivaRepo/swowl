# Requirements — DatatypeProperties

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-DP-001 — Initialization of the available XSD type list](#req-dp-001--initialization-of-the-available-xsd-type-list)
- [REQ-DP-002 — Building the hierarchical property tree](#req-dp-002--building-the-hierarchical-property-tree)
- [REQ-DP-003 — Automatic expansion of ancestors of a selected property](#req-dp-003--automatic-expansion-of-ancestors-of-a-selected-property)
- [REQ-DP-004 — Creating a child property](#req-dp-004--creating-a-child-property)
- [REQ-DP-005 — Creating a sibling property](#req-dp-005--creating-a-sibling-property)
- [REQ-DP-006 — Generating a unique name for a new property](#req-dp-006--generating-a-unique-name-for-a-new-property)
- [REQ-DP-007 — Effective creation and navigation to the new property](#req-dp-007--effective-creation-and-navigation-to-the-new-property)
- [REQ-DP-008 — Dropping a property onto a new target](#req-dp-008--dropping-a-property-onto-a-new-target)
- [REQ-DP-009 — Checking an ancestor/descendant relationship for drag & drop](#req-dp-009--checking-an-ancestordescendant-relationship-for-drag--drop)
- [REQ-DP-010 — Checking range uniqueness before opening the picker](#req-dp-010--checking-range-uniqueness-before-opening-the-picker)
- [REQ-DP-011 — Domain management](#req-dp-011--domain-management)
- [REQ-DP-012 — Range management (XSD type)](#req-dp-012--range-management-xsd-type)
- [REQ-DP-013 — Super-property management](#req-dp-013--super-property-management)
- [REQ-DP-014 — Auto-save on field change](#req-dp-014--auto-save-on-field-change)
- [REQ-DP-015 — Saving (creating or updating) a DatatypeProperty](#req-dp-015--saving-creating-or-updating-a-datatypeproperty)
- [REQ-DP-016 — Deleting a DatatypeProperty with confirmation](#req-dp-016--deleting-a-datatypeproperty-with-confirmation)

### Form
- [REQ-DP-017 — Generating HTML options for DatatypeProperties](#req-dp-017--generating-html-options-for-datatypeproperties)
- [REQ-DP-018 — Generating HTML options for XSD types](#req-dp-018--generating-html-options-for-xsd-types)
- [REQ-DP-019 — Rendering a tree node with drag & drop handling](#req-dp-019--rendering-a-tree-node-with-drag--drop-handling)
- [REQ-DP-020 — Rendering the full tree with owl:topDataProperty root](#req-dp-020--rendering-the-full-tree-with-owltopdataproperty-root)
- [REQ-DP-021 — Rendering the two-panel (split) layout](#req-dp-021--rendering-the-two-panel-split-layout)
- [REQ-DP-022 — Restoring selection after re-render](#req-dp-022--restoring-selection-after-re-render)
- [REQ-DP-023 — Horizontal resizing of the left panel](#req-dp-023--horizontal-resizing-of-the-left-panel)
- [REQ-DP-024 — Updating the "Super Properties" panel](#req-dp-024--updating-the-super-properties-panel)
- [REQ-DP-025 — Selecting the owl:topDataProperty root](#req-dp-025--selecting-the-owltopdataproperty-root)
- [REQ-DP-026 — Selecting a DatatypeProperty in the tree](#req-dp-026--selecting-a-datatypeproperty-in-the-tree)
- [REQ-DP-027 — Managing toolbar button states](#req-dp-027--managing-toolbar-button-states)
- [REQ-DP-028 — Expanding / collapsing a tree node](#req-dp-028--expanding--collapsing-a-tree-node)
- [REQ-DP-029 — Displaying the context menu (right-click)](#req-dp-029--displaying-the-context-menu-right-click)
- [REQ-DP-030 — Closing the context menu](#req-dp-030--closing-the-context-menu)
- [REQ-DP-031 — Starting the drag of a property](#req-dp-031--starting-the-drag-of-a-property)
- [REQ-DP-032 — Hovering over a target during drag](#req-dp-032--hovering-over-a-target-during-drag)
- [REQ-DP-033 — Rendering the DatatypeProperty edit form](#req-dp-033--rendering-the-datatypeproperty-edit-form)
- [REQ-DP-034 — Adding / removing an annotation row (label / comment)](#req-dp-034--adding--removing-an-annotation-row-label--comment)
- [REQ-DP-035 — Adding an "other property" annotation](#req-dp-035--adding-an-other-property-annotation)

---

## 1. Substance — Business logic

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviors, validations, persistence.


### REQ-DP-001 — Initialization of the available XSD type list

**If** the application is loaded and DatatypeProperties can be defined,

**Then** the system holds a constant list of 12 allowed XSD types as range: `xsd:string`, `xsd:integer`, `xsd:decimal`, `xsd:float`, `xsd:double`, `xsd:boolean`, `xsd:date`, `xsd:dateTime`, `xsd:duration`, `xsd:anyURI`, `xsd:nonNegativeInteger`, `xsd:positiveInteger` — this list is the sole reference for allowed data types in the application.

---

**Source code:** `owl_editor.js` → `XSD_TYPES` (constant, lines 167–171)

### REQ-DP-002 — Building the hierarchical property tree

**If** the ontology is loaded and contains DatatypeProperties linked by `subPropertyOf` relations,

**Then** the system builds an object `{ roots, childrenOf }` where `roots` is the alphabetically sorted list of properties with no parent, and `childrenOf` is a map of each property to its alphabetically sorted children — cycles are avoided by only taking into account references to existing IDs.

---

**Source code:** `owl_editor.js` → `DPEditor.buildTree()`

### REQ-DP-003 — Automatic expansion of ancestors of a selected property

**If** a property is selected in the tree
**and** it has one or more ancestors via `subPropertyOf`,

**Then** the system recursively traverses all its ancestors and adds them to the `_expanded` set, so that the path from the root to the selected property is fully expanded in the display.

---

**Source code:** `owl_editor.js` → `DPEditor._expandAncestors()`

### REQ-DP-004 — Creating a child property

**If** the user triggers the creation of a child property,

**Then** :
- if a property is selected, it becomes the sole parent of the new property and is added to `_expanded` to guarantee its visibility;
- if no property is selected, the new property is created at the root with no parent;
- in both cases, creation is delegated to `_createAndSelect([parent])`.

---

**Source code:** `owl_editor.js` → `DPEditor.createChild()`

### REQ-DP-005 — Creating a sibling property

**If** the user triggers the creation of a sibling property
**and** a property is currently selected (`_selectedId` defined),

**Then** the system retrieves the parents (`subPropertyOf`) of the selected property, passes them to `_createAndSelect()` and adds each of them to `_expanded`, thereby producing a new property at the same hierarchical level.

---

**Source code:** `owl_editor.js` → `DPEditor.createSibling()`

### REQ-DP-006 — Generating a unique name for a new property

**If** a new DatatypeProperty must be created,

**Then** the system generates a name starting from `'NewDatatypeProperty'` and incrementing a counter (`NewDatatypeProperty1`, `NewDatatypeProperty2`, …) until a name is found that is absent from the list of existing IDs in `APP.state.datatype_properties`.

---

**Source code:** `owl_editor.js` → `DPEditor._generatePropName()`

### REQ-DP-007 — Effective creation and navigation to the new property

**If** the creation of a DatatypeProperty is confirmed with the targeted parents,

**Then** :
- the system builds a property object with default values (empty `annotations`, empty `domain`, empty `range`, `functional: false`) and the IRI generated by `_generatePropName()`;
- it calls `API.createDP(prop)`, stores the ID in `_selectedId` and `_editingId`;
- it refreshes the application state via `APP.refresh()` and `APP.renderSection('datatype-properties')`;
- in case of error, it is displayed via `UI.error()`.

---

**Source code:** `owl_editor.js` → `DPEditor._createAndSelect()`

### REQ-DP-008 — Dropping a property onto a new target

**If** the user drops a property onto a valid target during drag & drop
**and** the target is not a descendant of the source,

**Then** :
- if `targetId` is defined, the `subPropertyOf` of the moved property is updated to `[targetId]`;
- if `targetId` is undefined, the property becomes a root (`subPropertyOf` empty);
- `API.updateDP()` is called to persist the change, a success message is displayed via `UI.success()`, and the display is refreshed.

**If** the target is a descendant of the source,

**Then** the operation is cancelled and a warning `UI.warn('Cannot drop on a descendant — would create a cycle')` is displayed.

---

**Source code:** `owl_editor.js` → `DPEditor.onDrop()`

### REQ-DP-009 — Checking an ancestor/descendant relationship for drag & drop

**If** the system must determine whether a target property is a descendant of a source property during drag & drop,

**Then** it performs a recursive depth-first traversal of the tree (via `buildTree()`) from the source property to check whether the target is a descendant of it — returns `false` if either parameter is null or undefined.

---

**Source code:** `owl_editor.js` → `DPEditor._isDescendant()`

### REQ-DP-010 — Checking range uniqueness before opening the picker

**If** the user attempts to open the range picker (`dp-range-picker`)
**and** the `dp-range-list` already contains a `.cls-list-item[data-id]` element,

**Then** the system prevents the picker from opening, ensuring that only one XSD value can be defined as range.

**If** the user opens any other picker,

**Then** the system delegates opening to `_togglePicker(id)`.

---

**Source code:** `owl_editor.js` → `DPEditor.showPicker()`

### REQ-DP-011 — Domain management

**If** the user adds a class as the domain of a DatatypeProperty,

**Then** the system inserts the class into `dp-domain-list` via `_addListItem()` with the `cls-dot` style, then triggers `autoSave()`.

**If** the user removes a class from the domain,

**Then** the system removes the entry from `dp-domain-list` via `_removeListItem()`, displays `owl:Thing` as the default value if the list becomes empty, then triggers `autoSave()`.

---

**Source code:** `owl_editor.js` → `DPEditor.addDomain()` | `DPEditor.removeDomain()`

### REQ-DP-012 — Range management (XSD type)

**If** the user adds an XSD type as the range of a DatatypeProperty,

**Then** the system inserts the type into `dp-range-list` via `_addListItem()` with the `xsd-dot` style, hides the `dp-range-btn` button to prevent adding a second type, then triggers `autoSave()` if a property is being edited.

**If** the user removes the XSD type from the range,

**Then** the system removes the type from `dp-range-list` via `_removeListItem()` (the displayed default value reverts to `rdfs:Literal`), shows the `dp-range-btn` button again to allow selecting a new type, then triggers `autoSave()`.

---

**Source code:** `owl_editor.js` → `DPEditor.addRange()` | `DPEditor.removeRange()`

### REQ-DP-013 — Super-property management

**If** the user adds a super-property to a DatatypeProperty,

**Then** the system inserts the chosen property into `dp-sub-list` via `_addListItem()` with navigation to the `'datatype-properties'` section and the `dp-prop-dot` style, then triggers `autoSave()`.

**If** the user removes a super-property,

**Then** the system removes the entry from `dp-sub-list` via `_removeListItem()`, then triggers `autoSave()`.

---

**Source code:** `owl_editor.js` → `DPEditor.addSubProp()` | `DPEditor.removeSubProp()`

### REQ-DP-014 — Auto-save on field change

**If** the user modifies a field in the edit form
**and** an existing property is being edited (`_editingId !== null`),

**Then** the system automatically triggers `save(false)` to persist the changes without any explicit action from the user.

---

**Source code:** `owl_editor.js` → `DPEditor.autoSave()`

### REQ-DP-015 — Saving (creating or updating) a DatatypeProperty

**If** the user saves a DatatypeProperty (new or existing),

**Then** the system collects all form values:
- ID via `document.getElementById('dp-id').value`, validated by `_validateId()`;
- Annotations (labels, comments, other) via `_collectAnnotations('dp-annotations-body')`;
- Domain via `_collectList('dp-domain-list')`;
- Range via `_collectList('dp-range-list')`;
- SubPropertyOf via `_collectList('dp-sub-list')`;
- Functional via the state of the `dp-functional` checkbox.

**If** the mode is creation (`isNew === true`),

**Then** the system calls `API.createDP(prop)` and displays a success message.

**If** the mode is update,

**Then** the system calls `API.updateDP(originalId, prop)` and signals a rename if the ID has changed.

In both cases, `APP.refresh()` then `APP.renderSection('datatype-properties')` are called.

---

**Source code:** `owl_editor.js` → `DPEditor.save()`

### REQ-DP-016 — Deleting a DatatypeProperty with confirmation

**If** the user triggers the deletion of a DatatypeProperty,

**Then** the system displays a confirmation dialog via `UI.confirm()`.

**If** the user confirms the deletion,

**Then** :
- `API.deleteDP(id)` is called;
- a success message is displayed via `UI.success()`;
- `_selectedId` and `_editingId` are reset to `null`;
- the display is refreshed via `APP.refresh()` and `APP.renderSection('datatype-properties')`.

---

**Source code:** `owl_editor.js` → `DPEditor.delete()`

---

## 2. Form — Presentation and UI

> Requirements related to display: layout, visual components, interactions, navigation, styles.

### REQ-DP-017 — Generating HTML options for DatatypeProperties

**If** a component from another tab requires a dropdown list referencing DatatypeProperties,

**Then** the system iterates over `APP.state.datatype_properties` and produces a string of `<option>` elements for each property, with selection of the value corresponding to `selectedId`.

---

**Source code:** `owl_editor.js` → `dpOptions()`

### REQ-DP-018 — Generating HTML options for XSD types

**If** an XSD selector must be displayed (notably in the Individuals tab),

**Then** the system iterates over `XSD_TYPES` and produces HTML `<option>` elements, with `xsd:string` as the default selected value if no value is specified.

---

**Source code:** `owl_editor.js` → `xsdOptions()`

### REQ-DP-019 — Rendering a tree node with drag & drop handling

**If** a node of the DatatypeProperties tree must be displayed,

**Then** the system generates the node's HTML with:
- indentation proportional to depth (`depth * 16 + 6` px);
- a toggle triangle if the node has children;
- the `onclick`, `oncontextmenu`, `ondragstart`, `ondragover`, `ondragleave`, `ondrop`, `ondragend` handlers wired to the corresponding methods of `DPEditor`.

---

**Source code:** `owl_editor.js` → `DPEditor._renderNode()`

### REQ-DP-020 — Rendering the full tree with owl:topDataProperty root

**If** the DatatypeProperties tab is displayed,

**Then** :
- the system calls `buildTree()` then `_renderNode()` for each root;
- it displays at the top an element representing the root (`owl:topDataProperty` or `rdf:Property` depending on `APP.getOntologyRootLabels()`);
- if the property list is empty, it displays the message `"No DatatypeProperty"`.

---

**Source code:** `owl_editor.js` → `DPEditor.renderTree()`

### REQ-DP-021 — Rendering the two-panel (split) layout

**If** the DatatypeProperties tab is initialized,

**Then** the system generates the complete HTML structure with:
- a left panel containing the tree and the "Super Properties" sub-panel;
- a horizontal resizable separator (`split-handle`);
- an empty right panel (`detail-panel`) with a create button;
- the "Child", "Sibling" and "Delete" buttons rendered as disabled by default.

---

**Source code:** `owl_editor.js` → `DPEditor.renderSplit()`

### REQ-DP-022 — Restoring selection after re-render

**If** the DatatypeProperties section is re-rendered,

**Then** the system:
- calls `_initSplitPane()` to re-attach resize listeners;
- re-selects either the root (`selectTopProp()`), or the property stored in `_selectedId` (`selectProp()`), thereby preserving the interface state.

---

**Source code:** `owl_editor.js` → `DPEditor.restoreSelection()`

### REQ-DP-023 — Horizontal resizing of the left panel

**If** the user drags the `dp-split-handle` element,

**Then** the system resizes the left panel by constraining its width between 160 and 520 px, and calls `_initHResizers('dp-tree-panel')` to manage the vertical resizing between the tree and the "Super Properties" sub-panel.

---

**Source code:** `owl_editor.js` → `DPEditor._initSplitPane()`

### REQ-DP-024 — Updating the "Super Properties" panel

**If** no property is selected,

**Then** the lower left panel (`dp-sub-list`) displays the message "— select a property —".

**If** a property is selected,

**Then** :
- the system computes the full ancestor chain via `buildChain()` and displays each ancestor with increasing indentation, ending with `owl:topDatatypeProperty`;
- direct ancestors have a delete button (✕);
- an HTML selector offers properties not yet used as super-properties.

---

**Source code:** `owl_editor.js` → `DPEditor._updateSuperPanel()`

### REQ-DP-025 — Selecting the owl:topDataProperty root

**If** the user selects the `owl:topDataProperty` root,

**Then** :
- `_selectedId` is set to `null` and `_topPropSelected` to `true`;
- the highlighting in the tree is updated;
- the detail panel displays a welcome screen with the root and a create button;
- `_updateSuperPanel(null)` and `_updateTreeButtons()` are called.

---

**Source code:** `owl_editor.js` → `DPEditor.selectTopProp()`

### REQ-DP-026 — Selecting a DatatypeProperty in the tree

**If** the user selects a DatatypeProperty in the tree,

**Then** :
- `id` is stored in `_selectedId`;
- the visual highlighting in the tree is updated;
- the property object is retrieved from `APP.state.datatype_properties`;
- the detail form is injected via `renderForm()`;
- the vertical resizers of the right panel are initialized;
- the "Super Properties" panel and toolbar buttons are updated.

---

**Source code:** `owl_editor.js` → `DPEditor.selectProp()`

### REQ-DP-027 — Managing toolbar button states

**If** the root is selected,

**Then** only the "Child" button is enabled; "Sibling" and "Delete" are hidden.

**If** a property is selected,

**Then** all three buttons "Child", "Sibling" and "Delete" are active.

**If** no selection is active,

**Then** all buttons are disabled.

---

**Source code:** `owl_editor.js` → `DPEditor._updateTreeButtons()`

### REQ-DP-028 — Expanding / collapsing a tree node

**If** the user clicks on the toggle triangle of a tree node,

**Then** the system toggles the visibility of the child container `dp-tcn-${id}`, updates the `_expanded` Set (adding or removing `id`), and rotates the arrow of the `.tree-toggle` element to reflect the expanded/collapsed state.

---

**Source code:** `owl_editor.js` → `DPEditor.toggleNode()`

### REQ-DP-029 — Displaying the context menu (right-click)

**If** the user right-clicks on a tree node,

**Then** :
- any existing context menu is removed;
- the property or root is selected according to the value of `id`;
- a `div.ctx-menu` element is created and inserted into the `body` at the cursor position;
- the menu always contains the item "Add Child Property"; if `id` is defined (real property), "Add Sibling Property" and "Delete" are also added;
- the menu closes automatically on an outside click via a `click` listener on `document`.

---

**Source code:** `owl_editor.js` → `DPEditor.showContextMenu()`

### REQ-DP-030 — Closing the context menu

**If** the context menu is open and a close action is triggered,

**Then** the system removes from the DOM the element bearing the ID `dp-ctx-menu`, if it exists.

---

**Source code:** `owl_editor.js` → `DPEditor._closeContextMenu()`

### REQ-DP-031 — Starting the drag of a property

**If** the user begins dragging a property in the tree,

**Then** :
- the ID of the dragged property is stored in `_dragId`;
- `effectAllowed` is set to `'move'` and the ID is stored in `dataTransfer`;
- the CSS class `'dragging'` is added to the source element after a 0 ms delay (via `setTimeout`).

---

**Source code:** `owl_editor.js` → `DPEditor.onDragStart()`

### REQ-DP-032 — Hovering over a target during drag

**If** the user hovers over a target during a drag
**and** a drag is in progress (`_dragId` defined),
**and** the target is different from the source,
**and** the target is not a descendant of the source (checked via `_isDescendant()`),

**Then** the system allows the drop (`event.preventDefault()`) and applies the `'drag-over'` class to the hovered element.

---

**Source code:** `owl_editor.js` → `DPEditor.onDragOver()`

### REQ-DP-033 — Rendering the DatatypeProperty edit form

**If** the user selects a DatatypeProperty or creates a new property,

**Then** the system generates the complete HTML of the right panel with the following sections:
- **Header**: ID input field (with `_sanitizeId()`), mention `(instance of owl:DatatypeProperty)`, full IRI computed from `APP.state.ontology.id`;
- **Annotations**: table with Property / Value / Lang columns, populated via `_annoRow()` for `labels`, `comments` and `other`;
- **Domain(s)**: list of domain classes via `_listRows()`, selector among available classes (`APP.state.classes`), default displayed value `owl:Thing`;
- **Range**: list of XSD types via `_listRows()`, selector among unused types drawn from `XSD_TYPES`, default displayed value `rdfs:Literal`;
- **Characteristics**: single checkbox "Functional" bound to `p.functional`;
- **Where Used**: section generated by `_whereUsedFrame()` listing the rules that use this property.

**If** the mode is creation (`prop === null`),

**Then** a "✅ Create" button is displayed instead of auto-save.

**If** the mode is editing,

**Then** all field modifications trigger `autoSave()` via `onchange`.

---

**Source code:** `owl_editor.js` → `DPEditor.renderForm()`

### REQ-DP-034 — Adding / removing an annotation row (label / comment)

**If** the user adds an annotation row of type label or comment,

**Then** the system calls `_makeAnnotRow(type, 'DPEditor', ac)` and inserts the returned row into the `tbody` identified as `dp-annotations-body` — `autoSave()` is triggered if a property is being edited (`_editingId !== null`).

**If** the user removes an annotation row,

**Then** the system removes from the DOM the parent `<tr>` row of the clicked button (`btn.closest('tr')?.remove()`), then triggers `autoSave()` if a property is being edited.

---

**Source code:** `owl_editor.js` → `DPEditor.addAnnotRow()` | `DPEditor.removeAnnotRow()`

### REQ-DP-035 — Adding an "other property" annotation

**If** the user selects an "other property" annotation via the dedicated selector,

**Then** the system calls `_makeAnnotRow('other', 'DPEditor', ac, prop)`, inserts the row into `dp-annotations-body`, then hides the annotation picker `dp-anno-picker` by forcing its `style.display` to `'none'`.

---

**Source code:** `owl_editor.js` → `DPEditor.addOtherAnnotRow()`
