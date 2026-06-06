# Requirements — Classes

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-CLS-001 — Building the hierarchical class tree](#req-cls-001--building-the-hierarchical-class-tree)
- [REQ-CLS-002 — Automatic expansion of a class's ancestors](#req-cls-002--automatic-expansion-of-a-classs-ancestors)
- [REQ-CLS-003 — Creating a child class (subclass)](#req-cls-003--creating-a-child-class-subclass)
- [REQ-CLS-004 — Creating a sibling class (same level)](#req-cls-004--creating-a-sibling-class-same-level)
- [REQ-CLS-005 — Deleting the selected class](#req-cls-005--deleting-the-selected-class)
- [REQ-CLS-006 — Moving a class by drag and drop](#req-cls-006--moving-a-class-by-drag-and-drop)
- [REQ-CLS-007 — Auto-save during editing](#req-cls-007--auto-save-during-editing)
- [REQ-CLS-008 — Saving/creating a class](#req-cls-008--savingcreating-a-class)
- [REQ-CLS-009 — Managing superclasses](#req-cls-009--managing-superclasses)
- [REQ-CLS-010 — Managing equivalent classes](#req-cls-010--managing-equivalent-classes)
- [REQ-CLS-011 — Managing disjoint classes](#req-cls-011--managing-disjoint-classes)
- [REQ-CLS-012 — Displaying inherited properties (read-only)](#req-cls-012--displaying-inherited-properties-read-only)
- [REQ-CLS-013 — Adding a restriction on a property](#req-cls-013--adding-a-restriction-on-a-property)
- [REQ-CLS-014 — Changing the restriction type](#req-cls-014--changing-the-restriction-type)
- [REQ-CLS-015 — Removing a property from the restrictions panel](#req-cls-015--removing-a-property-from-the-restrictions-panel)
- [REQ-CLS-016 — Removing a child restriction](#req-cls-016--removing-a-child-restriction)
- [REQ-CLS-017 — Collecting restrictions for saving](#req-cls-017--collecting-restrictions-for-saving)
- [REQ-CLS-018 — Quick creation of an ObjectProperty from the Classes tab](#req-cls-018--quick-creation-of-an-objectproperty-from-the-classes-tab)
- [REQ-CLS-019 — Quick creation of a DatatypeProperty from the Classes tab](#req-cls-019--quick-creation-of-a-datatypeproperty-from-the-classes-tab)

### Form
- [REQ-CLS-020 — Rendering the class tree with the owl:Thing root node](#req-cls-020--rendering-the-class-tree-with-the-owlthing-root-node)
- [REQ-CLS-021 — Selecting a class in the tree](#req-cls-021--selecting-a-class-in-the-tree)
- [REQ-CLS-022 — Selecting the owl:Thing root node](#req-cls-022--selecting-the-owlthing-root-node)
- [REQ-CLS-023 — Expanding/collapsing a tree node](#req-cls-023--expandingcollapsing-a-tree-node)
- [REQ-CLS-024 — Context menu on a tree node](#req-cls-024--context-menu-on-a-tree-node)
- [REQ-CLS-025 — Class editing form](#req-cls-025--class-editing-form)
- [REQ-CLS-026 — Managing rdfs:label and rdfs:comment annotations](#req-cls-026--managing-rdfslabel-and-rdfscomment-annotations)
- [REQ-CLS-027 — Managing custom annotation properties](#req-cls-027--managing-custom-annotation-properties)
- [REQ-CLS-028 — Restrictions and asserted properties panel](#req-cls-028--restrictions-and-asserted-properties-panel)
- [REQ-CLS-029 — Adding a property in the restrictions panel](#req-cls-029--adding-a-property-in-the-restrictions-panel)
- [REQ-CLS-030 — Selecting the filler (target class) of a restriction](#req-cls-030--selecting-the-filler-target-class-of-a-restriction)
- [REQ-CLS-031 — Displaying the full IRI of the class](#req-cls-031--displaying-the-full-iri-of-the-class)
- [REQ-CLS-032 — Superclasses panel with ancestor hierarchy](#req-cls-032--superclasses-panel-with-ancestor-hierarchy)

---

## 1. Substance — Business logic and functional rules

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviours, validations, persistence.


### REQ-CLS-001 — Building the hierarchical class tree

The method iterates over the `APP.state.classes` array, parses textual `subClassOf` relationships to identify parent-child relationships internal to the ontology. It distinguishes local root classes (with no known internal parent), external root classes (whose parent is a URI external to the current namespace), and builds a `childrenOf` dictionary as well as an alphabetically sorted list of `roots` and `externalRoots`.

**Source code:** `owl_editor.js` → `ClassEditor.buildTree()`

---

### REQ-CLS-002 — Automatic expansion of a class's ancestors

During programmatic navigation to a class (for example via `APP.navigateTo()`), the method recursively traverses the `subClassOf` chain of the target class and adds each ancestor to `_expanded`, so that the class is visible in the tree without manual expansion.

**Source code:** `owl_editor.js` → `ClassEditor._expandAncestors()`

---

### REQ-CLS-003 — Creating a child class (subclass)

On click of the "Child" button or the "＋ Create Class" button, the method determines the current parent (selected class, or `owl:Thing` if nothing is selected), then calls `_createAndSelect()` with the `subClassOf` array initialised to `[parentId]`. If the parent is `owl:Thing` or the custom root, `subClassOf` is left empty.

**Source code:** `owl_editor.js` → `ClassEditor.createChild()`

---

### REQ-CLS-004 — Creating a sibling class (same level)

On click of the "Sister" button, the method retrieves the textual parents of the selected class (filters `subClassOf` on strings) and calls `_createAndSelect()` passing that same array of parents, thereby creating a new class at the same hierarchical level.

**Source code:** `owl_editor.js` → `ClassEditor.createSibling()`

---

### REQ-CLS-005 — Deleting the selected class

The "Delete" button triggers deletion of the current class (`_selectedId`). The method calls `API.updateClass()` or `API.createClass()` depending on context, updates `APP.state.classes`, and refreshes the section via `APP.renderSection('classes')`.

**Source code:** `owl_editor.js` → `ClassEditor.deleteSelected()`

---

### REQ-CLS-006 — Moving a class by drag and drop

Each tree node is draggable. `onDragStart()` stores the identifier of the dragged class in `_dragId`. `onDrop()` retrieves that identifier, removes the old textual parents from `subClassOf` (preserving object restrictions), injects the new parent identifier (or an empty array if dropped onto `owl:Thing`), calls `API.updateClass()`, and refreshes the tree. The new parent is automatically expanded in `_expanded`.

**Source code:** `owl_editor.js` → `ClassEditor.onDragStart()` | `ClassEditor.onDrop()`

---

### REQ-CLS-007 — Auto-save during editing

When an existing class is being edited (`_editingId !== null`), any change in the form fields (annotations, superclasses, equivalences, disjunctions, restrictions) automatically triggers `autoSave()`, which immediately calls `save(false)` without navigation or reload.

**Source code:** `owl_editor.js` → `ClassEditor.autoSave()`

---

### REQ-CLS-008 — Saving/creating a class

The method reads the identifier from `#cls-id`, collects the textual superclasses (`.cls-list-item[data-id]` from the left panel), equivalent classes (`#cls-equivalents-list`), disjunctions (`#cls-disjoints-list`), annotations and restrictions via `RestrictionEditor.collect()`. In creation mode (`isNew = true`), it calls `API.createClass()`; in edit mode, it calls `API.updateClass(originalId, cls)` and updates `APP.state.classes` in memory.

**Source code:** `owl_editor.js` → `ClassEditor.save()`

---

### REQ-CLS-009 — Managing superclasses

The `addSuperClass()` method adds a superclass selected via the picker (`cls-super-picker`) to the list of direct superclasses. It injects a DOM element `cls-list-item` with a navigation link to the parent class and a `✕` removal button. On click of the `✕` button of a superclass, the `removeSuperClass()` method removes the corresponding `[data-id]` DOM element from the list. In both cases, if the class is being edited, `autoSave()` is called immediately.

**Source code:** `owl_editor.js` → `ClassEditor.addSuperClass()` | `ClassEditor.removeSuperClass()`

---

### REQ-CLS-010 — Managing equivalent classes

The `addEquivalent()` method adds an equivalent class to the `#cls-equivalents-list` list. It creates a DOM element including a clickable navigation link to the equivalent class (via `APP.navigateTo('classes', id)`) and a removal button. On click of `✕`, the `removeEquivalent()` method deletes the DOM node `#cls-equivalents-list .cls-list-item[data-id="${id}"]`. In both cases, `autoSave()` is triggered if the class is being edited.

**Source code:** `owl_editor.js` → `ClassEditor.addEquivalent()` | `ClassEditor.removeEquivalent()`

---

### REQ-CLS-011 — Managing disjoint classes

The `addDisjoint()` method adds a disjoint class to the `#cls-disjoints-list` list, creating a DOM element with the class label and a removal button. On click of `✕`, the `removeDisjoint()` method removes the corresponding DOM element from `#cls-disjoints-list`. In both cases, `autoSave()` is triggered if the class is being edited.

**Source code:** `owl_editor.js` → `ClassEditor.addDisjoint()` | `ClassEditor.removeDisjoint()`

---

### REQ-CLS-012 — Displaying inherited properties (read-only)

`_computeInherited()` recursively traverses the `subClassOf` chain of the current class to collect all restrictions defined on ancestor classes. `_renderGroupReadOnly()` displays these restrictions in read-only mode, with an indication of the source class ("↑ ClassName" tag) and a navigation link to the property.

**Source code:** `owl_editor.js` → `RestrictionEditor._computeInherited()` | `RestrictionEditor._renderGroupReadOnly()`

---

### REQ-CLS-013 — Adding a restriction on a property

`addRestriction()` adds a restriction of type `someValuesFrom` by default on the selected property. `addRestrictionOfType(type)` (called from the context menu) allows choosing from six types: `someValuesFrom`, `allValuesFrom`, `hasValue`, `exactCardinality`, `minCardinality`, `maxCardinality`. Both methods create a DOM element via `_renderChild()` and append it to the `.restr-children` of the relevant group.

**Source code:** `owl_editor.js` → `RestrictionEditor.addRestriction()` | `RestrictionEditor.addRestrictionOfType()`

---

### REQ-CLS-014 — Changing the restriction type

When the user changes the restriction type `<select>` (`restr-type-sel`), the method shows or hides the cardinality input field (`restr-card-inp`) and the filler class selector depending on whether the new type contains "Cardinality" or not. It also closes the filler dropdown when switching to a cardinality type.

**Source code:** `owl_editor.js` → `RestrictionEditor.onChildType()`

---

### REQ-CLS-015 — Removing a property from the restrictions panel

On click of `✕` at the property group level, the method removes the `.restr-prop-group` from the DOM, resets `_selectedProp`, puts the property back in the `#restr-prop-picker` in alphabetical order with its icon (OP or DP), and triggers `autoSave()`.

**Source code:** `owl_editor.js` → `RestrictionEditor.deleteProp()`

---

### REQ-CLS-016 — Removing a child restriction

On click of `✕` at a restriction row level (`restr-child-row`), the method removes the DOM element identified by `restr-child-${gid}` and triggers `autoSave()`.

**Source code:** `owl_editor.js` → `RestrictionEditor.deleteChild()`

---

### REQ-CLS-017 — Collecting restrictions for saving

The method iterates over all `.restr-prop-group` elements in the DOM. For each group with no child row, it generates a marker `{ type: '_marker', property: prop }` (persisted in JSON but ignored in RDF) to preserve the presence of the property. For each row, it reads the type, the filler (or value for `hasValue`) and the cardinality, and returns an array of structured restrictions.

**Source code:** `owl_editor.js` → `RestrictionEditor.collect()`

---

### REQ-CLS-018 — Quick creation of an ObjectProperty from the Classes tab

From the "OP" button in the restrictions panel, the method retrieves the identifier of the selected class, creates an ObjectProperty object with `domain: [classId]` and empty arrays for `range` and `subPropertyOf`, calls `API.createObjectProperty()`, then automatically navigates to the "object-properties" tab on the new property.

**Source code:** `owl_editor.js` → `ClassEditor.createOPForClass()`

---

### REQ-CLS-019 — Quick creation of a DatatypeProperty from the Classes tab

From the "DT" button in the restrictions panel, the method creates a DatatypeProperty with `domain: [classId]`, `functional: false`, and calls `API.createDatatypeProperty()`, then navigates to the "datatype-properties" tab.

**Source code:** `owl_editor.js` → `ClassEditor.createDTPForClass()`

---

## 2. Form — Presentation and user interface

> Requirements relating to display: layout, visual components, interactions, navigation, styles.

### REQ-CLS-020 — Rendering the class tree with the owl:Thing root node

The method generates the HTML of the complete tree. It displays at the top a root node representing `owl:Thing` (or the custom label returned by `APP.getOntologyRootLabels().classRoot`), then recursively calls `_renderNode()` for each root class. If no local class exists, it displays a "No classes" message.

**Source code:** `owl_editor.js` → `ClassEditor.renderTree()`

---

### REQ-CLS-021 — Selecting a class in the tree

On click of a tree node, the method: deselects all existing nodes, visually selects the node whose `.tree-label` matches the requested identifier, loads the class object from `APP.state.classes`, injects the editing form via `renderForm()`, updates the superclasses panel, and enables the action buttons (Child, Sister, Delete).

**Source code:** `owl_editor.js` → `ClassEditor.selectClass()`

---

### REQ-CLS-022 — Selecting the owl:Thing root node

On click of the `owl:Thing` root node, the method visually selects that node, displays in the detail panel a "Root of all classes" message with a class creation button, clears the superclasses panel, and disables the Sister and Delete buttons (while leaving the Child button active).

**Source code:** `owl_editor.js` → `ClassEditor.selectOwlThing()`

---

### REQ-CLS-023 — Expanding/collapsing a tree node

On click of the `▶` arrow of a node, the method toggles the open/closed state of the node in `_expanded` (a `Set`). It then refreshes the tree rendering by calling `buildTree()` on `APP.state.classes`, then redraws the relevant child nodes.

**Source code:** `owl_editor.js` → `ClassEditor.toggleNode()`

---

### REQ-CLS-024 — Context menu on a tree node

A right-click on a tree node opens a context menu positioned at the mouse coordinates. This menu offers: "Add child class", "Add sibling class" (only if the target is a class, not `owl:Thing`), and "Delete selected class" (in red). A click outside closes the menu via `_closeContextMenu()`.

**Source code:** `owl_editor.js` → `ClassEditor.showContextMenu()`

---

### REQ-CLS-025 — Class editing form

The method generates the complete HTML of the class detail panel. It contains: a text field for the identifier (`cls-id`), the mention "(instance of owl:Class)", the full IRI if a base IRI is defined, an annotations table, the restrictions panel (via `RestrictionEditor.renderPanel()`), a "Disjoints" block and an "Equivalent" block. In creation mode (new class), a "✅ Create class" button is displayed.

**Source code:** `owl_editor.js` → `ClassEditor.renderForm()`

---

### REQ-CLS-026 — Managing rdfs:label and rdfs:comment annotations

On click of the "+label" or "+comment" buttons, the method calls `_makeAnnotRow(type, 'ClassEditor', ac)` to create a table row with a text field for the value, a language field (initialised to `Settings.defaultLang`), and a removal button. The row is inserted into `#cls-anno-table`. If the class is being edited, changes trigger `autoSave()`.

**Source code:** `owl_editor.js` → `ClassEditor.addAnnotRow()`

---

### REQ-CLS-027 — Managing custom annotation properties

On click of an annotation property in the `cls-anno-picker` picker, the method calls `_makeAnnotRow('other', 'ClassEditor', ac, prop)` to create an annotation row with the property name, a value field and a language field. It is used for properties such as `rdfs:seeAlso` or any annotation property defined in the ontology.

**Source code:** `owl_editor.js` → `ClassEditor.addOtherAnnotRow()`

---

### REQ-CLS-028 — Restrictions and asserted properties panel

The method generates the HTML of the "Properties and Restrictions" panel embedded in the class form. It calls `_group()` to group restrictions by property, displays two collapsible sections ("Inherited Properties" and "Asserted Properties") with their respective counters, and exposes buttons to add an existing property, create an ObjectProperty or a DatatypeProperty directly from this panel.

**Source code:** `owl_editor.js` → `RestrictionEditor.renderPanel()`

---

### REQ-CLS-029 — Adding a property in the restrictions panel

On click of a property in the `#restr-prop-picker` picker, the method checks whether a group for that property already exists (if so, it only selects it), otherwise creates a new empty group via `_renderGroup()`, inserts it into `#restr-tree` in alphabetical order, and immediately selects the property. It removes the property from the picker and triggers `autoSave()`.

**Source code:** `owl_editor.js` → `RestrictionEditor.addProperty()`

---

### REQ-CLS-030 — Selecting the filler (target class) of a restriction

`toggleFillerPicker()` opens/closes a dropdown positioned in `position:fixed` below the filler button, displaying the hierarchical list of classes via `_classHierarchyItems()`. `selectFiller()` updates the value of the hidden field `restr-filler-val`, refreshes the displayed label, replaces the coloured dot, marks the selected item and triggers `autoSave()`.

**Source code:** `owl_editor.js` → `RestrictionEditor.toggleFillerPicker()` | `RestrictionEditor.selectFiller()`

---

### REQ-CLS-031 — Displaying the full IRI of the class

If a base IRI is defined in the ontology settings (`baseIri`), the form displays below the title the line `For Class: <baseIri>#<classId>` using a `<code>` tag. This line is only displayed if the class already exists (not in pure creation mode) and `baseIri` is non-empty.

**Source code:** `owl_editor.js` → `ClassEditor.renderForm()`

---

### REQ-CLS-032 — Superclasses panel with ancestor hierarchy

The bottom-left panel displays the list of direct superclasses with a `✕` removal button for each, followed by their indirect ancestors in italics and reduced opacity (0.75), up to `owl:Thing` displayed last. Indirect ancestors are clickable via `APP.navigateTo('classes', id)` but have no removal button.

**Source code:** `owl_editor.js` → `ClassEditor.renderSplit()` (internal `_renderSupersPanel()` section)
