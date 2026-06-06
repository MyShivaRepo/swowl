# Requirements for the Classes Tab — SWOWL Application

**Date:** 2026-06-06
**Note:** Requirements derived strictly from source code — no extrapolation

---

## Table of Contents

1. [REQ-CLS-001 — Building the hierarchical class tree](#req-cls-001)
2. [REQ-CLS-002 — Rendering the class tree with owl:Thing root node](#req-cls-002)
3. [REQ-CLS-003 — Selecting a class in the tree](#req-cls-003)
4. [REQ-CLS-004 — Selecting the owl:Thing root node](#req-cls-004)
5. [REQ-CLS-005 — Expanding/collapsing a tree node](#req-cls-005)
6. [REQ-CLS-006 — Automatic expansion of a class's ancestors](#req-cls-006)
7. [REQ-CLS-007 — Creating a child class (subclass)](#req-cls-007)
8. [REQ-CLS-008 — Creating a sibling class (same level)](#req-cls-008)
9. [REQ-CLS-009 — Deleting the selected class](#req-cls-009)
10. [REQ-CLS-010 — Context menu on a tree node](#req-cls-010)
11. [REQ-CLS-011 — Moving a class by drag and drop](#req-cls-011)
12. [REQ-CLS-012 — Class editing form](#req-cls-012)
13. [REQ-CLS-013 — Auto-save during editing](#req-cls-013)
14. [REQ-CLS-014 — Saving/creating a class](#req-cls-014)
15. [REQ-CLS-015 — Managing superclasses (adding)](#req-cls-015)
16. [REQ-CLS-016 — Managing superclasses (removing)](#req-cls-016)
17. [REQ-CLS-017 — Managing equivalent classes (adding)](#req-cls-017)
18. [REQ-CLS-018 — Managing equivalent classes (removing)](#req-cls-018)
19. [REQ-CLS-019 — Managing disjoint classes (adding)](#req-cls-019)
20. [REQ-CLS-020 — Managing disjoint classes (removing)](#req-cls-020)
21. [REQ-CLS-021 — Managing rdfs:label and rdfs:comment annotations](#req-cls-021)
22. [REQ-CLS-022 — Managing custom annotation properties](#req-cls-022)
23. [REQ-CLS-023 — Restrictions and asserted properties panel](#req-cls-023)
24. [REQ-CLS-024 — Displaying inherited properties (read-only)](#req-cls-024)
25. [REQ-CLS-025 — Adding a property in the restrictions panel](#req-cls-025)
26. [REQ-CLS-026 — Adding a restriction on a property](#req-cls-026)
27. [REQ-CLS-027 — Changing restriction type](#req-cls-027)
28. [REQ-CLS-028 — Selecting the filler (target class) of a restriction](#req-cls-028)
29. [REQ-CLS-029 — Removing a property from the restrictions panel](#req-cls-029)
30. [REQ-CLS-030 — Removing a child restriction](#req-cls-030)
31. [REQ-CLS-031 — Collecting restrictions for saving](#req-cls-031)
32. [REQ-CLS-032 — Quick creation of an ObjectProperty from the Classes tab](#req-cls-032)
33. [REQ-CLS-033 — Quick creation of a DatatypeProperty from the Classes tab](#req-cls-033)
34. [REQ-CLS-034 — Displaying the full IRI of the class](#req-cls-034)
35. [REQ-CLS-035 — Superclasses panel with ancestor hierarchy](#req-cls-035)

---

### REQ-CLS-001 — Building the hierarchical class tree

**Source code:** `owl_editor.js` → `ClassEditor.buildTree()`

The method iterates over the `APP.state.classes` array, parses textual `subClassOf` relationships to identify parent-child relationships internal to the ontology. It distinguishes local root classes (with no known internal parent), external root classes (whose parent is a URI outside the current namespace), and builds a `childrenOf` dictionary as well as an alphabetically sorted list of `roots` and `externalRoots`.

---

### REQ-CLS-002 — Rendering the class tree with owl:Thing root node

**Source code:** `owl_editor.js` → `ClassEditor.renderTree()`

The method generates the HTML for the full tree. It displays a root node representing `owl:Thing` (or the custom label returned by `APP.getOntologyRootLabels().classRoot`) at the top, then recursively calls `_renderNode()` for each root class. If no local classes exist, it displays a "No classes" message.

---

### REQ-CLS-003 — Selecting a class in the tree

**Source code:** `owl_editor.js` → `ClassEditor.selectClass()`

On click of a tree node, the method: deselects all existing nodes, visually selects the node whose `.tree-label` matches the requested identifier, loads the class object from `APP.state.classes`, injects the editing form via `renderForm()`, updates the superclasses panel, and enables the action buttons (Child, Sister, Delete).

---

### REQ-CLS-004 — Selecting the owl:Thing root node

**Source code:** `owl_editor.js` → `ClassEditor.selectOwlThing()`

On click of the `owl:Thing` root node, the method visually selects that node, displays a "Root of all classes" message with a class creation button in the detail panel, clears the superclasses panel, and disables the Sister and Delete buttons (while keeping the Child button active).

---

### REQ-CLS-005 — Expanding/collapsing a tree node

**Source code:** `owl_editor.js` → `ClassEditor.toggleNode()`

On click of the `▶` arrow of a node, the method toggles the open/closed state of the node in `_expanded` (a `Set`). It then refreshes the tree rendering by calling `buildTree()` on `APP.state.classes`, and redraws the affected child nodes.

---

### REQ-CLS-006 — Automatic expansion of a class's ancestors

**Source code:** `owl_editor.js` → `ClassEditor._expandAncestors()`

During programmatic navigation to a class (for example via `APP.navigateTo()`), the method recursively traverses the `subClassOf` chain of the target class and adds each ancestor to `_expanded`, so that the class is visible in the tree without manual expansion.

---

### REQ-CLS-007 — Creating a child class (subclass)

**Source code:** `owl_editor.js` → `ClassEditor.createChild()`

On click of the "Child" button or the "+ Create Class" button, the method determines the current parent (selected class or `owl:Thing` if nothing is selected), then calls `_createAndSelect()` with the `subClassOf` array initialized to `[parentId]`. If the parent is `owl:Thing` or the custom root, `subClassOf` is left empty.

---

### REQ-CLS-008 — Creating a sibling class (same level)

**Source code:** `owl_editor.js` → `ClassEditor.createSibling()`

On click of the "Sister" button, the method retrieves the textual parents of the selected class (filters `subClassOf` on strings) and calls `_createAndSelect()` passing that same array of parents, thus creating a new class at the same hierarchical level.

---

### REQ-CLS-009 — Deleting the selected class

**Source code:** `owl_editor.js` → `ClassEditor.deleteSelected()`

The "Delete" button triggers deletion of the current class (`_selectedId`). The method calls `API.updateClass()` or `API.createClass()` depending on context, updates `APP.state.classes`, and refreshes the section via `APP.renderSection('classes')`.

---

### REQ-CLS-010 — Context menu on a tree node

**Source code:** `owl_editor.js` → `ClassEditor.showContextMenu()`

A right-click on a tree node opens a context menu positioned at the mouse coordinates. This menu offers: "Add child class", "Add sibling class" (only if the target is a class, not `owl:Thing`), and "Delete selected class" (in red). A click outside closes the menu via `_closeContextMenu()`.

---

### REQ-CLS-011 — Moving a class by drag and drop

**Source code:** `owl_editor.js` → `ClassEditor.onDragStart()`, `ClassEditor.onDrop()`

Each tree node is draggable. `onDragStart()` stores the identifier of the dragged class in `_dragId`. `onDrop()` retrieves that identifier, removes the old textual parents from `subClassOf` (while preserving object restrictions), injects the new parent identifier (or an empty array if dropped onto `owl:Thing`), calls `API.updateClass()`, and refreshes the tree. The new parent is automatically expanded in `_expanded`.

---

### REQ-CLS-012 — Class editing form

**Source code:** `owl_editor.js` → `ClassEditor.renderForm()`

The method generates the full HTML for the class detail panel. It contains: a text field for the identifier (`cls-id`), the mention "(instance of owl:Class)", the full IRI if a base IRI is defined, an annotations table, the restrictions panel (via `RestrictionEditor.renderPanel()`), a "Disjoints" block and an "Equivalent" block. In creation mode (new class), a "✅ Create class" button is displayed.

---

### REQ-CLS-013 — Auto-save during editing

**Source code:** `owl_editor.js` → `ClassEditor.autoSave()`

When an existing class is being edited (`_editingId !== null`), any change in the form fields (annotations, superclasses, equivalences, disjunctions, restrictions) automatically triggers `autoSave()`, which immediately calls `save(false)` without navigation or reload.

---

### REQ-CLS-014 — Saving/creating a class

**Source code:** `owl_editor.js` → `ClassEditor.save()`

The method reads the identifier from `#cls-id`, collects the textual superclasses (`.cls-list-item[data-id]` from the left panel), equivalent classes (`#cls-equivalents-list`), disjunctions (`#cls-disjoints-list`), annotations and restrictions via `RestrictionEditor.collect()`. In creation mode (`isNew = true`), it calls `API.createClass()`; in edit mode, it calls `API.updateClass(originalId, cls)` and updates `APP.state.classes` in memory.

---

### REQ-CLS-015 — Managing superclasses (adding)

**Source code:** `owl_editor.js` → `ClassEditor.addSuperClass()`

The method adds a superclass selected via the picker (`cls-super-picker`) to the list of direct superclasses. It injects a DOM element `cls-list-item` with a navigation link to the parent class and a `✕` remove button. If the class is being edited, `autoSave()` is called immediately.

---

### REQ-CLS-016 — Managing superclasses (removing)

**Source code:** `owl_editor.js` → `ClassEditor.removeSuperClass()`

On click of the `✕` button of a superclass, the method removes the corresponding `[data-id]` DOM element from the list. If the class is being edited, `autoSave()` is called.

---

### REQ-CLS-017 — Managing equivalent classes (adding)

**Source code:** `owl_editor.js` → `ClassEditor.addEquivalent()`

The method adds an equivalent class to the `#cls-equivalents-list` list. It creates a DOM element including a clickable navigation link to the equivalent class (via `APP.navigateTo('classes', id)`) and a remove button. If the class is being edited, `autoSave()` is called.

---

### REQ-CLS-018 — Managing equivalent classes (removing)

**Source code:** `owl_editor.js` → `ClassEditor.removeEquivalent()`

On click of `✕`, the method removes the DOM node `#cls-equivalents-list .cls-list-item[data-id="${id}"]` and triggers `autoSave()` if the class is being edited.

---

### REQ-CLS-019 — Managing disjoint classes (adding)

**Source code:** `owl_editor.js` → `ClassEditor.addDisjoint()`

The method adds a disjoint class to the `#cls-disjoints-list` list, creating a DOM element with the class label and a remove button. It triggers `autoSave()` if the class is being edited.

---

### REQ-CLS-020 — Managing disjoint classes (removing)

**Source code:** `owl_editor.js` → `ClassEditor.removeDisjoint()`

On click of `✕`, the method removes the corresponding DOM element from `#cls-disjoints-list` and triggers `autoSave()` if the class is being edited.

---

### REQ-CLS-021 — Managing rdfs:label and rdfs:comment annotations

**Source code:** `owl_editor.js` → `ClassEditor.addAnnotRow()`

On click of the "+label" or "+comment" buttons, the method calls `_makeAnnotRow(type, 'ClassEditor', ac)` to create a table row with a text field for the value, a language field (initialized to `Settings.defaultLang`), and a remove button. The row is inserted into `#cls-anno-table`. If the class is being edited, changes trigger `autoSave()`.

---

### REQ-CLS-022 — Managing custom annotation properties

**Source code:** `owl_editor.js` → `ClassEditor.addOtherAnnotRow()`

On click of an annotation property in the `cls-anno-picker` picker, the method calls `_makeAnnotRow('other', 'ClassEditor', ac, prop)` to create an annotation row with the property name, a value field and a language field. It is used for properties such as `rdfs:seeAlso` or any annotation property defined in the ontology.

---

### REQ-CLS-023 — Restrictions and asserted properties panel

**Source code:** `owl_editor.js` → `RestrictionEditor.renderPanel()`

The method generates the HTML for the "Properties and Restrictions" panel embedded in the class form. It calls `_group()` to group restrictions by property, displays two collapsible sections ("Inherited Properties" and "Asserted Properties") with their respective counts, and exposes buttons to add an existing property, create an ObjectProperty or a DatatypeProperty directly from this panel.

---

### REQ-CLS-024 — Displaying inherited properties (read-only)

**Source code:** `owl_editor.js` → `RestrictionEditor._computeInherited()`, `RestrictionEditor._renderGroupReadOnly()`

`_computeInherited()` recursively traverses the `subClassOf` chain of the current class to collect all restrictions defined on ancestor classes. `_renderGroupReadOnly()` displays these restrictions as read-only, with an indication of the source class (tag "↑ ClassName") and a navigation link to the property.

---

### REQ-CLS-025 — Adding a property in the restrictions panel

**Source code:** `owl_editor.js` → `RestrictionEditor.addProperty()`

On click of a property in the `#restr-prop-picker` picker, the method checks whether a group for that property already exists (if so, it only selects it), otherwise creates a new empty group via `_renderGroup()`, inserts it into `#restr-tree` in alphabetical order, and immediately selects the property. It removes the property from the picker and triggers `autoSave()`.

---

### REQ-CLS-026 — Adding a restriction on a property

**Source code:** `owl_editor.js` → `RestrictionEditor.addRestriction()`, `RestrictionEditor.addRestrictionOfType()`

`addRestriction()` adds a restriction of type `someValuesFrom` by default on the selected property. `addRestrictionOfType(type)` (called from the context menu) allows choosing among six types: `someValuesFrom`, `allValuesFrom`, `hasValue`, `exactCardinality`, `minCardinality`, `maxCardinality`. Both methods create a DOM element via `_renderChild()` and append it to the `.restr-children` of the relevant group.

---

### REQ-CLS-027 — Changing restriction type

**Source code:** `owl_editor.js` → `RestrictionEditor.onChildType()`

When the user changes the `<select>` type of a restriction (`restr-type-sel`), the method shows or hides the cardinality input field (`restr-card-inp`) and the filler class selector depending on whether the new type contains "Cardinality" or not. It also closes the filler dropdown if switching to a cardinality type.

---

### REQ-CLS-028 — Selecting the filler (target class) of a restriction

**Source code:** `owl_editor.js` → `RestrictionEditor.toggleFillerPicker()`, `RestrictionEditor.selectFiller()`

`toggleFillerPicker()` opens/closes a dropdown positioned at `position:fixed` below the filler button, displaying the hierarchical list of classes via `_classHierarchyItems()`. `selectFiller()` updates the value of the hidden field `restr-filler-val`, updates the displayed label, replaces the colored dot, marks the selected item and triggers `autoSave()`.

---

### REQ-CLS-029 — Removing a property from the restrictions panel

**Source code:** `owl_editor.js` → `RestrictionEditor.deleteProp()`

On click of `✕` at a property group level, the method removes the `.restr-prop-group` from the DOM, resets `_selectedProp`, puts the property back into the `#restr-prop-picker` picker in alphabetical order with its icon (OP or DP), and triggers `autoSave()`.

---

### REQ-CLS-030 — Removing a child restriction

**Source code:** `owl_editor.js` → `RestrictionEditor.deleteChild()`

On click of `✕` at a restriction row level (`restr-child-row`), the method removes the DOM element identified by `restr-child-${gid}` and triggers `autoSave()`.

---

### REQ-CLS-031 — Collecting restrictions for saving

**Source code:** `owl_editor.js` → `RestrictionEditor.collect()`

The method iterates over all `.restr-prop-group` elements in the DOM. For each group with no child rows, it generates a `{ type: '_marker', property: prop }` marker (persisted in JSON but ignored in RDF) to preserve the presence of the property. For each row, it reads the type, the filler (or value for `hasValue`) and the cardinality, and returns an array of structured restrictions.

---

### REQ-CLS-032 — Quick creation of an ObjectProperty from the Classes tab

**Source code:** `owl_editor.js` → `ClassEditor.createOPForClass()`

From the "OP" button in the restrictions panel, the method retrieves the identifier of the selected class, creates an ObjectProperty object with `domain: [classId]` and empty arrays for `range` and `subPropertyOf`, calls `API.createObjectProperty()`, then automatically navigates to the "object-properties" tab on the new property.

---

### REQ-CLS-033 — Quick creation of a DatatypeProperty from the Classes tab

**Source code:** `owl_editor.js` → `ClassEditor.createDTPForClass()`

From the "DT" button in the restrictions panel, the method creates a DatatypeProperty with `domain: [classId]`, `functional: false`, and calls `API.createDatatypeProperty()`, then navigates to the "datatype-properties" tab.

---

### REQ-CLS-034 — Displaying the full IRI of the class

**Source code:** `owl_editor.js` → `ClassEditor.renderForm()`

If a base IRI is defined in the ontology settings (`baseIri`), the form displays the line `For Class: <baseIri>#<classId>` using a `<code>` tag below the title. This line is only displayed if the class already exists (not in pure creation mode) and `baseIri` is non-empty.

---

### REQ-CLS-035 — Superclasses panel with ancestor hierarchy

**Source code:** `owl_editor.js` → `ClassEditor.renderSplit()` (internal `_renderSupersPanel()` section)

The lower left panel displays the list of direct superclasses with a `✕` remove button for each, followed by their indirect ancestors in italics and reduced opacity (0.75), up to `owl:Thing` displayed last. Indirect ancestors are clickable via `APP.navigateTo('classes', id)` but have no remove button.

---

— claude-sonnet-4-6
