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
- [REQ-CLS-016 — Deleting a child restriction](#req-cls-016--deleting-a-child-restriction)
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
- [REQ-CLS-032 — Superclass panel with ancestor hierarchy](#req-cls-032--superclass-panel-with-ancestor-hierarchy)

---

## 1. Substance — Business logic

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviors, validations, persistence.


### REQ-CLS-001 — Building the hierarchical class tree

| **If** | the ontology is loaded and contains classes in `APP.state.classes` linked by `subClassOf` relations, |
|---|---|
| **Then** | the system:<br>- builds a hierarchical dictionary (`childrenOf`) by analyzing internal parent-child relations,<br>- distinguishes local root classes (with no known internal parent) from external root classes (whose parent is a URI outside the current namespace),<br>- produces a `roots` list and an `externalRoots` list sorted alphabetically, used to display the class tree. |

**Source code:** `owl_editor.js` → `ClassEditor.buildTree()`

---

### REQ-CLS-002 — Automatic expansion of a class's ancestors

| **If** | a programmatic navigation to a class is triggered (for example via `APP.navigateTo()`), |
|---|---|
| **Then** | the system recursively traverses the `subClassOf` chain of the target class and adds each ancestor to `_expanded`, so that the class is visible in the tree without manual expansion by the user. |

**Source code:** `owl_editor.js` → `ClassEditor._expandAncestors()`

---

### REQ-CLS-003 — Creating a child class (subclass)

| **If** | the user clicks the "Child" button or the "＋ Create Class" button **and** a class is selected in the tree (or no selection is active), |
|---|---|
| **Then** | - if a class is selected, a new subclass is created with `subClassOf` initialized to `[parentId]`,<br>- if the selection is `owl:Thing` or the custom root, `subClassOf` is left empty,<br>- the new class is immediately selected in the tree. |

**Source code:** `owl_editor.js` → `ClassEditor.createChild()`

---

### REQ-CLS-004 — Creating a sibling class (same level)

| **If** | the user clicks the "Sister" button **and** a class is selected in the tree, |
|---|---|
| **Then** | the system retrieves the textual parents of the selected class (from `subClassOf`) and creates a new class with that same parent array, placing it at the same hierarchical level as the original class. |

**Source code:** `owl_editor.js` → `ClassEditor.createSibling()`

---

### REQ-CLS-005 — Deleting the selected class

| **If** | the user clicks the "Delete" button **and** a class is selected (`_selectedId`), |
|---|---|
| **Then** | the system deletes the current class, updates `APP.state.classes` in memory, and refreshes the section via `APP.renderSection('classes')`. |

**Source code:** `owl_editor.js` → `ClassEditor.deleteSelected()`

---

### REQ-CLS-006 — Moving a class by drag and drop

| **If** | the user drags a tree node (`onDragStart`) and drops it onto a target node (`onDrop`), |
|---|---|
| **Then** | - the identifier of the dragged class is stored in `_dragId` at the start of the drag,<br>- upon drop, the old textual parents from `subClassOf` are removed (object restrictions are preserved),<br>- the new parent identifier is injected into `subClassOf` (or an empty array if dropped onto `owl:Thing`),<br>- `API.updateClass()` is called and the tree is refreshed,<br>- the new parent is automatically expanded in `_expanded`. |

**Source code:** `owl_editor.js` → `ClassEditor.onDragStart()` | `ClassEditor.onDrop()`

---

### REQ-CLS-007 — Auto-save during editing

| **If** | an existing class is being edited (`_editingId !== null`) **and** the user modifies a form field (annotations, superclasses, equivalences, disjunctions, restrictions), |
|---|---|
| **Then** | the system automatically triggers `autoSave()`, which calls `save(false)` immediately, without navigation or view reload. |

**Source code:** `owl_editor.js` → `ClassEditor.autoSave()`

---

### REQ-CLS-008 — Saving/creating a class

| **If** | the user submits the form for a class (new or existing), |
|---|---|
| **Then** | the system:<br>- reads the identifier from `#cls-id`,<br>- collects textual superclasses, equivalent classes, disjunctions, annotations and restrictions via `RestrictionEditor.collect()`,<br>- calls `API.createClass()` in creation mode (`isNew = true`) or `API.updateClass(originalId, cls)` in edit mode,<br>- updates `APP.state.classes` in memory. |

**Source code:** `owl_editor.js` → `ClassEditor.save()`

---

### REQ-CLS-009 — Managing superclasses

| **If** | the user selects a superclass via the `cls-super-picker` picker and clicks "Add", |
|---|---|
| **Then** | the system injects a `cls-list-item` DOM element into the direct superclasses list, with a navigation link to the parent class and a `✕` removal button. |

| **If** | the user clicks the `✕` button of a superclass, |
|---|---|
| **Then** | the system removes the corresponding `[data-id]` DOM element from the list. |

In both cases, if the class is being edited, `autoSave()` is called immediately.

**Source code:** `owl_editor.js` → `ClassEditor.addSuperClass()` | `ClassEditor.removeSuperClass()`

---

### REQ-CLS-010 — Managing equivalent classes

| **If** | the user adds an equivalent class via the dedicated picker, |
|---|---|
| **Then** | the system creates a DOM element in `#cls-equivalents-list` including a clickable navigation link to the equivalent class (via `APP.navigateTo('classes', id)`) and a `✕` removal button. |

| **If** | the user clicks the `✕` button of an equivalent class, |
|---|---|
| **Then** | the system removes the DOM node `#cls-equivalents-list .cls-list-item[data-id="${id}"]`. |

In both cases, `autoSave()` is triggered if the class is being edited.

**Source code:** `owl_editor.js` → `ClassEditor.addEquivalent()` | `ClassEditor.removeEquivalent()`

---

### REQ-CLS-011 — Managing disjoint classes

| **If** | the user adds a disjoint class via the dedicated picker, |
|---|---|
| **Then** | the system creates a DOM element in `#cls-disjoints-list` with the class label and a `✕` removal button. |

| **If** | the user clicks the `✕` button of a disjoint class, |
|---|---|
| **Then** | the system removes the corresponding DOM element from `#cls-disjoints-list`. |

In both cases, `autoSave()` is triggered if the class is being edited.

**Source code:** `owl_editor.js` → `ClassEditor.addDisjoint()` | `ClassEditor.removeDisjoint()`

---

### REQ-CLS-012 — Displaying inherited properties (read-only)

| **If** | the ontology is loaded and the current class has ancestor classes defining restrictions, |
|---|---|
| **Then** | the system recursively traverses the `subClassOf` chain of the current class, collects all restrictions defined on ancestors, and displays them in read-only mode with an indication of the source class (tag "↑ ClassName") and a navigation link to the relevant property. |

**Source code:** `owl_editor.js` → `RestrictionEditor._computeInherited()` | `RestrictionEditor._renderGroupReadOnly()`

---

### REQ-CLS-013 — Adding a restriction on a property

| **If** | the user adds a restriction from the restrictions panel (default button or context menu), |
|---|---|
| **Then** | - the default button creates a restriction of type `someValuesFrom`,<br>- the context menu allows choosing from six types: `someValuesFrom`, `allValuesFrom`, `hasValue`, `exactCardinality`, `minCardinality`, `maxCardinality`,<br>- in both cases, a DOM element is created via `_renderChild()` and added to the `.restr-children` of the relevant property group. |

**Source code:** `owl_editor.js` → `RestrictionEditor.addRestriction()` | `RestrictionEditor.addRestrictionOfType()`

---

### REQ-CLS-014 — Changing the restriction type

| **If** | the user changes the value of a restriction type `<select>` (`restr-type-sel`), |
|---|---|
| **Then** | the system:<br>- displays the cardinality input field (`restr-card-inp`) if the new type contains "Cardinality", and hides it otherwise,<br>- shows or hides the filler class selector according to the same criterion,<br>- closes the filler dropdown if switching to a cardinality type. |

**Source code:** `owl_editor.js` → `RestrictionEditor.onChildType()`

---

### REQ-CLS-015 — Removing a property from the restrictions panel

| **If** | the user clicks the `✕` button at the level of a property group in the restrictions panel, |
|---|---|
| **Then** | the system:<br>- removes the corresponding `.restr-prop-group` from the DOM,<br>- resets `_selectedProp`,<br>- puts the property back into the `#restr-prop-picker` picker in alphabetical order with its icon (OP or DP),<br>- triggers `autoSave()`. |

**Source code:** `owl_editor.js` → `RestrictionEditor.deleteProp()`

---

### REQ-CLS-016 — Deleting a child restriction

| **If** | the user clicks the `✕` button at the level of a restriction row (`restr-child-row`), |
|---|---|
| **Then** | the system removes the DOM element identified by `restr-child-${gid}` and triggers `autoSave()`. |

**Source code:** `owl_editor.js` → `RestrictionEditor.deleteChild()`

---

### REQ-CLS-017 — Collecting restrictions for saving

| **If** | a class save is triggered and the restrictions panel contains property groups, |
|---|---|
| **Then** | the system:<br>- for each group with no child row, generates a marker `{ type: '_marker', property: prop }` (persisted in JSON but ignored in RDF) in order to preserve the property's presence,<br>- for each restriction row, reads the type, the filler (or the value for `hasValue`) and the cardinality,<br>- returns a structured array of all collected restrictions. |

**Source code:** `owl_editor.js` → `RestrictionEditor.collect()`

---

### REQ-CLS-018 — Quick creation of an ObjectProperty from the Classes tab

| **If** | the user clicks the "OP" button in the restrictions panel **and** a class is selected, |
|---|---|
| **Then** | the system creates an ObjectProperty with `domain: [classId]` and empty arrays for `range` and `subPropertyOf` via `API.createObjectProperty()`, then automatically navigates to the "object-properties" tab on the new property. |

**Source code:** `owl_editor.js` → `ClassEditor.createOPForClass()`

---

### REQ-CLS-019 — Quick creation of a DatatypeProperty from the Classes tab

| **If** | the user clicks the "DT" button in the restrictions panel **and** a class is selected, |
|---|---|
| **Then** | the system creates a DatatypeProperty with `domain: [classId]` and `functional: false` via `API.createDatatypeProperty()`, then automatically navigates to the "datatype-properties" tab. |

**Source code:** `owl_editor.js` → `ClassEditor.createDTPForClass()`

---

## 2. Form — Presentation and UI

> Requirements related to display: layout, visual components, interactions, navigation, styles.

### REQ-CLS-020 — Rendering the class tree with the owl:Thing root node

| **If** | the ontology is loaded and the Classes tab is displayed, |
|---|---|
| **Then** | the system generates the HTML of the complete tree by displaying at the top a root node representing `owl:Thing` (or the custom label returned by `APP.getOntologyRootLabels().classRoot`), then recursively calls `_renderNode()` for each root class. If no local class exists, a "No classes" message is displayed. |

**Source code:** `owl_editor.js` → `ClassEditor.renderTree()`

---

### REQ-CLS-021 — Selecting a class in the tree

| **If** | the user clicks on a node in the class tree, |
|---|---|
| **Then** | the system:<br>- deselects all existing nodes,<br>- visually selects the node whose `.tree-label` matches the requested identifier,<br>- loads the class object from `APP.state.classes`,<br>- injects the editing form via `renderForm()`,<br>- updates the superclass panel,<br>- enables the action buttons (Child, Sister, Delete). |

**Source code:** `owl_editor.js` → `ClassEditor.selectClass()`

---

### REQ-CLS-022 — Selecting the owl:Thing root node

| **If** | the user clicks on the `owl:Thing` root node in the tree, |
|---|---|
| **Then** | the system:<br>- visually selects this node,<br>- displays in the detail panel a "Root of all classes" message with a class creation button,<br>- clears the superclass panel,<br>- disables the Sister and Delete buttons (while leaving the Child button active). |

**Source code:** `owl_editor.js` → `ClassEditor.selectOwlThing()`

---

### REQ-CLS-023 — Expanding/collapsing a tree node

| **If** | the user clicks the `▶` arrow of a tree node, |
|---|---|
| **Then** | the system toggles the open/closed state of the node in `_expanded` (a `Set`), refreshes the tree rendering by calling `buildTree()` on `APP.state.classes`, then redraws the relevant child nodes. |

**Source code:** `owl_editor.js` → `ClassEditor.toggleNode()`

---

### REQ-CLS-024 — Context menu on a tree node

| **If** | the user right-clicks on a tree node, |
|---|---|
| **Then** | the system opens a context menu positioned at the mouse coordinates, offering:<br>- "Add child class",<br>- "Add sibling class" (only if the target is a class, not `owl:Thing`),<br>- "Delete selected class" (in red). |

| **If** | the user clicks outside the menu, |
|---|---|
| **Then** | the menu is closed via `_closeContextMenu()`. |

**Source code:** `owl_editor.js` → `ClassEditor.showContextMenu()`

---

### REQ-CLS-025 — Class editing form

| **If** | a class is selected in the tree or a new class is being created, |
|---|---|
| **Then** | the system generates the complete HTML of the detail panel containing:<br>- a text field for the identifier (`cls-id`) with the mention "(instance of owl:Class)",<br>- the full IRI if a base IRI is defined,<br>- an annotations table,<br>- the restrictions panel (via `RestrictionEditor.renderPanel()`),<br>- a "Disjoints" block and an "Equivalent" block,<br>- in creation mode only, a "✅ Create class" button. |

**Source code:** `owl_editor.js` → `ClassEditor.renderForm()`

---

### REQ-CLS-026 — Managing rdfs:label and rdfs:comment annotations

| **If** | the user clicks the "+label" or "+comment" button in the class form, |
|---|---|
| **Then** | the system creates a table row via `_makeAnnotRow(type, 'ClassEditor', ac)` containing a text field for the value, a language field (initialized to `Settings.defaultLang`) and a removal button, then inserts this row into `#cls-anno-table`. If the class is being edited, any change in this row triggers `autoSave()`. |

**Source code:** `owl_editor.js` → `ClassEditor.addAnnotRow()`

---

### REQ-CLS-027 — Managing custom annotation properties

| **If** | the user selects an annotation property in the `cls-anno-picker` picker, |
|---|---|
| **Then** | the system creates an annotation row via `_makeAnnotRow('other', 'ClassEditor', ac, prop)` displaying the property name, a value field and a language field, for properties such as `rdfs:seeAlso` or any annotation property defined in the ontology. |

**Source code:** `owl_editor.js` → `ClassEditor.addOtherAnnotRow()`

---

### REQ-CLS-028 — Restrictions and asserted properties panel

| **If** | the form of a class is displayed, |
|---|---|
| **Then** | the system generates the HTML of the "Properties and Restrictions" panel by:<br>- calling `_group()` to group restrictions by property,<br>- displaying two collapsible sections ("Inherited Properties" and "Asserted Properties") with their respective counters,<br>- exposing buttons to add an existing property, create an ObjectProperty or a DatatypeProperty directly from this panel. |

**Source code:** `owl_editor.js` → `RestrictionEditor.renderPanel()`

---

### REQ-CLS-029 — Adding a property in the restrictions panel

| **If** | the user clicks on a property in the `#restr-prop-picker` picker, |
|---|---|
| **Then** | the system:<br>- checks if a group for this property already exists in `#restr-tree` (if so, only selects it),<br>- otherwise, creates a new empty group via `_renderGroup()` and inserts it in alphabetical order,<br>- immediately selects the property,<br>- removes the property from the picker,<br>- triggers `autoSave()`. |

**Source code:** `owl_editor.js` → `RestrictionEditor.addProperty()`

---

### REQ-CLS-030 — Selecting the filler (target class) of a restriction

| **If** | the user clicks on the filler button of a restriction, |
|---|---|
| **Then** | the system opens or closes a dropdown positioned at `position:fixed` below the button, displaying the hierarchical list of classes via `_classHierarchyItems()`. |

| **If** | the user selects a class in this dropdown, |
|---|---|
| **Then** | the system updates the value of the hidden field `restr-filler-val`, refreshes the displayed label, replaces the colored dot, marks the selected item and triggers `autoSave()`. |

**Source code:** `owl_editor.js` → `RestrictionEditor.toggleFillerPicker()` | `RestrictionEditor.selectFiller()`

---

### REQ-CLS-031 — Displaying the full IRI of the class

| **If** | a base IRI is defined in the ontology settings (`baseIri`) **and** the class already exists (not in pure creation mode), |
|---|---|
| **Then** | the form displays below the title the line `For Class: <baseIri>#<classId>` within a `<code>` tag. |

**Source code:** `owl_editor.js` → `ClassEditor.renderForm()`

---

### REQ-CLS-032 — Superclass panel with ancestor hierarchy

| **If** | a class with superclasses is selected in the tree, |
|---|---|
| **Then** | the left-bottom panel displays:<br>- the list of direct superclasses with a `✕` removal button for each,<br>- their indirect ancestors in italic and reduced opacity (0.75), up to `owl:Thing` displayed last,<br>- indirect ancestors are clickable via `APP.navigateTo('classes', id)` but have no removal button. |

**Source code:** `owl_editor.js` → `ClassEditor.renderSplit()` (internal `_renderSupersPanel()` section)
