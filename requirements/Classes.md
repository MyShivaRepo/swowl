# Requirements — Classes

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-CLS-001 — Building the class hierarchy tree](#req-cls-001--building-the-class-hierarchy-tree)
- [REQ-CLS-002 — Automatic ancestor expansion for a class](#req-cls-002--automatic-ancestor-expansion-for-a-class)
- [REQ-CLS-003 — Creating a child class (subclass)](#req-cls-003--creating-a-child-class-subclass)
- [REQ-CLS-004 — Creating a sibling class (same level)](#req-cls-004--creating-a-sibling-class-same-level)
- [REQ-CLS-005 — Deleting the selected class](#req-cls-005--deleting-the-selected-class)
- [REQ-CLS-006 — Moving a class by drag and drop](#req-cls-006--moving-a-class-by-drag-and-drop)
- [REQ-CLS-007 — Auto-save on edit](#req-cls-007--auto-save-on-edit)
- [REQ-CLS-008 — Saving/creating a class](#req-cls-008--savingcreating-a-class)
- [REQ-CLS-009 — Managing superclasses](#req-cls-009--managing-superclasses)
- [REQ-CLS-010 — Managing equivalent classes](#req-cls-010--managing-equivalent-classes)
- [REQ-CLS-011 — Managing disjoint classes](#req-cls-011--managing-disjoint-classes)
- [REQ-CLS-012 — Displaying inherited properties (read-only)](#req-cls-012--displaying-inherited-properties-read-only)
- [REQ-CLS-013 — Adding a restriction on a property](#req-cls-013--adding-a-restriction-on-a-property)
- [REQ-CLS-014 — Changing restriction type](#req-cls-014--changing-restriction-type)
- [REQ-CLS-015 — Removing a property from the restrictions panel](#req-cls-015--removing-a-property-from-the-restrictions-panel)
- [REQ-CLS-016 — Deleting a child restriction](#req-cls-016--deleting-a-child-restriction)
- [REQ-CLS-017 — Collecting restrictions for saving](#req-cls-017--collecting-restrictions-for-saving)
- [REQ-CLS-018 — Quick creation of an ObjectProperty from the Classes tab](#req-cls-018--quick-creation-of-an-objectproperty-from-the-classes-tab)
- [REQ-CLS-019 — Quick creation of a DatatypeProperty from the Classes tab](#req-cls-019--quick-creation-of-a-datatypeproperty-from-the-classes-tab)
- [REQ-CLS-035 — Attaching an existing property to the class via "+ Property"](#req-cls-035--attaching-an-existing-property-to-the-class-via--property)
- [REQ-CLS-036 — Adding a restriction on an inherited property (inherited → asserted)](#req-cls-036--adding-a-restriction-on-an-inherited-property-inherited--asserted)
- [REQ-CLS-038 — Normalising domain markers and cleaning references on deletion (backend)](#req-cls-038--normalising-domain-markers-and-cleaning-references-on-deletion-backend)

### Form
- [REQ-CLS-020 — Rendering the class tree with owl:Thing root node](#req-cls-020--rendering-the-class-tree-with-owlthing-root-node)
- [REQ-CLS-021 — Selecting a class in the tree](#req-cls-021--selecting-a-class-in-the-tree)
- [REQ-CLS-022 — Selecting the owl:Thing root node](#req-cls-022--selecting-the-owlthing-root-node)
- [REQ-CLS-023 — Expanding/collapsing a tree node](#req-cls-023--expandingcollapsing-a-tree-node)
- [REQ-CLS-024 — Context menu on a tree node](#req-cls-024--context-menu-on-a-tree-node)
- [REQ-CLS-025 — Class editing form](#req-cls-025--class-editing-form)
- [REQ-CLS-026 — Managing rdfs:label and rdfs:comment annotations](#req-cls-026--managing-rdfslabel-and-rdfscomment-annotations)
- [REQ-CLS-027 — Managing custom annotation properties](#req-cls-027--managing-custom-annotation-properties)
- [REQ-CLS-028 — Restrictions and asserted properties panel](#req-cls-028--restrictions-and-asserted-properties-panel)
- [REQ-CLS-029 — Adding a property to the restrictions panel](#req-cls-029--adding-a-property-to-the-restrictions-panel)
- [REQ-CLS-030 — Selecting the filler (target class) of a restriction](#req-cls-030--selecting-the-filler-target-class-of-a-restriction)
- [REQ-CLS-031 — Displaying the full IRI of the class](#req-cls-031--displaying-the-full-iri-of-the-class)
- [REQ-CLS-032 — Superclass panel with ancestor hierarchy](#req-cls-032--superclass-panel-with-ancestor-hierarchy)
- [REQ-CLS-033 — "WHERE USED IN RANGE" panel of properties targeting the class](#req-cls-033--where-used-in-range-panel-of-properties-targeting-the-class)
- [REQ-CLS-034 — Homogeneous (filter + tree) asserted-properties picker](#req-cls-034--homogeneous-filter--tree-asserted-properties-picker)
- [REQ-CLS-037 — Displaying the range and provenance of a property in the panel](#req-cls-037--displaying-the-range-and-provenance-of-a-property-in-the-panel)

---

## 1. Substance — Business logic and functional rules

> UI-independent requirements: OWL rules, data constraints, algorithmic behaviours, validations, persistence.


### REQ-CLS-001 — Building the class hierarchy tree

| **If** | the `ontology` is loaded and contains `classes` organised in a hierarchy via subclass relations, |
|---|---|
| **Then** | the class tree faithfully reflects those relations: root `classes` (with no internal superclass) appear at the top, `classes` whose parent belongs to an external `namespace` are distinguished, and the whole set is sorted alphabetically at each level. |

**Source code:** `owl_editor.js` → `ClassEditor.buildTree()` — Analyses `subClassOf` relations, builds a `childrenOf` dictionary and an `externalRoots` list for classes whose parent is outside the namespace, then produces alphabetically sorted `roots` and `externalRoots` lists for tree rendering.

---

### REQ-CLS-002 — Automatic ancestor expansion for a class

| **If** | the application navigates to a specific class (for example after a creation or an internal link), |
|---|---|
| **Then** | all ancestor nodes of that class are automatically expanded in the tree, making the class immediately visible without the ontologist having to manually expand each level. |

**Source code:** `owl_editor.js` → `ClassEditor._expandAncestors()` — Recursively walks up the `subClassOf` chain of the target class and adds each ancestor to the `_expanded` `Set`, triggering a re-render of the tree.

---

### REQ-CLS-003 — Creating a child class (subclass)

| **If** | the ontologist wants to specialise an existing concept by creating a subclass, |
|---|---|
| **Then** | the new class is automatically positioned under the selected parent concept in the hierarchy, without any additional manipulation. If no class is selected (or if the root is selected), the class is created without a superclass. In all cases, the new class is immediately selected and ready to be edited. |

**Source code:** `owl_editor.js` → `ClassEditor.createChild()` — Creates an OWL entry with `subClassOf: [parentId]` if a class is selected (empty array if the selection is `owl:Thing` or the custom root), inserts it into `APP.state.classes` and triggers navigation to the new class.

---

### REQ-CLS-004 — Creating a sibling class (same level)

| **If** | the ontologist wants to create a concept parallel to an existing concept at the same level of specialisation, |
|---|---|
| **Then** | the new class inherits the same superclasses as the reference class, automatically placing it at the same level in the hierarchy without the ontologist having to reconfigure the subclass relations. |

**Source code:** `owl_editor.js` → `ClassEditor.createSibling()` — Reads the `subClassOf` array of the selected class and creates a new class with that same parent array, then navigates to the new entry.

---

### REQ-CLS-005 — Deleting the selected class

| **If** | the ontologist wants to delete the concept currently selected in the tree, |
|---|---|
| **Then** | the class is removed from the `ontology` and the tree is updated to reflect that state without a page reload. |

**Source code:** `owl_editor.js` → `ClassEditor.deleteSelected()` — Deletes the class identified by `_selectedId` via `API.deleteClass()`, updates `APP.state.classes` in memory and refreshes the section via `APP.renderSection('classes')`.

---

### REQ-CLS-006 — Moving a class by drag and drop

| **If** | the ontologist reorganises the hierarchy by dragging a class to a new parent node, |
|---|---|
| **Then** | the moved class is attached to the new parent, its former subclass links are replaced by this new link (`object property` `restrictions` defined on the class are preserved), and the new parent node is automatically expanded to make the moved class visible. |

**Source code:** `owl_editor.js` → `ClassEditor.onDragStart()` | `ClassEditor.onDrop()` — `onDragStart` stores the identifier in `_dragId`; `onDrop` filters the old textual parents from `subClassOf` (preserving object restrictions), injects the new parent identifier (empty array if dropped onto `owl:Thing`), calls `API.updateClass()` and adds the parent to `_expanded`.

---

### REQ-CLS-007 — Auto-save on edit

| **If** | the ontologist modifies any field of an already existing class (annotations, superclasses, equivalences, disjointnesses, `restrictions`), |
|---|---|
| **Then** | the changes are saved immediately and silently, without the ontologist having to explicitly confirm each change. |

**Source code:** `owl_editor.js` → `ClassEditor.autoSave()` — Checks that `_editingId !== null` then calls `save(false)` in silent mode (without navigation or view reload).

---

### REQ-CLS-008 — Saving/creating a class

| **If** | the ontologist submits the form of a class (new or existing), |
|---|---|
| **Then** | all entered information (identifier, superclasses, equivalent `classes`, disjointnesses, annotations, `restrictions`) is consolidated and persisted in the `ontology`, whether creating or updating an existing concept. |

**Source code:** `owl_editor.js` → `ClassEditor.save()` — Reads the identifier from `#cls-id`, collects textual superclasses, equivalent classes, disjointnesses, annotations and restrictions via `RestrictionEditor.collect()`, then calls `API.createClass()` (creation mode, `isNew = true`) or `API.updateClass(originalId, cls)` (edit mode) and updates `APP.state.classes` in memory.

---

### REQ-CLS-009 — Managing superclasses

| **If** | the ontologist adds a superclass to a concept, |
|---|---|
| **Then** | the subclass relation is materialised in the dedicated panel with a navigation link to the parent class and the ability to remove it. |

| **If** | the ontologist removes a superclass from a concept, |
|---|---|
| **Then** | the corresponding subclass relation is removed from the panel. |

In both cases, if the class is being edited, the change is saved automatically.

**Source code:** `owl_editor.js` → `ClassEditor.addSuperClass()` — Injects a `cls-list-item` DOM element into the direct superclasses list with an `APP.navigateTo` link and a `✕` button; triggers `autoSave()`. | `ClassEditor.removeSuperClass()` — Removes the corresponding `[data-id]` DOM node and triggers `autoSave()`.

---

### REQ-CLS-010 — Managing equivalent classes

| **If** | the ontologist declares two `classes` as equivalent, |
|---|---|
| **Then** | the equivalent class appears in the dedicated panel with a clickable navigation link to it and the ability to remove the equivalence. |

| **If** | the ontologist removes an equivalence between two `classes`, |
|---|---|
| **Then** | the equivalence relation is removed from the panel. |

In both cases, the change is saved automatically if the class is being edited.

**Source code:** `owl_editor.js` → `ClassEditor.addEquivalent()` — Creates a DOM element in `#cls-equivalents-list` with an `APP.navigateTo('classes', id)` link and a `✕` button; triggers `autoSave()`. | `ClassEditor.removeEquivalent()` — Removes the node `#cls-equivalents-list .cls-list-item[data-id="${id}"]` and triggers `autoSave()`.

---

### REQ-CLS-011 — Managing disjoint classes

| **If** | the ontologist declares two `classes` as disjoint, |
|---|---|
| **Then** | the disjoint class appears in the dedicated panel with the ability to remove the disjointness. |

| **If** | the ontologist removes a disjointness between two `classes`, |
|---|---|
| **Then** | the disjointness relation is removed from the panel. |

In both cases, the change is saved automatically if the class is being edited.

**Source code:** `owl_editor.js` → `ClassEditor.addDisjoint()` — Creates a DOM element in `#cls-disjoints-list` with the class label and a `✕` button; triggers `autoSave()`. | `ClassEditor.removeDisjoint()` — Removes the corresponding DOM element from `#cls-disjoints-list` and triggers `autoSave()`.

---

### REQ-CLS-012 — Displaying inherited properties (read-only)

| **If** | the selected class has ancestors that define `restrictions` on `properties`, |
|---|---|
| **Then** | those inherited `restrictions` are displayed read-only in the current class panel, with an indication of the ancestor class that defines them and a navigation link to the relevant `property`, allowing the ontologist to understand the complete profile of the concept without modifying the inherited definitions. |

**Source code:** `owl_editor.js` → `RestrictionEditor._computeInherited()` — Recursively traverses the `subClassOf` chain of the current class and collects all ancestor restrictions. | `RestrictionEditor._renderGroupReadOnly()` — Displays each inherited group read-only with an "↑ ClassName" tag and a navigation link to the property.

---

### REQ-CLS-013 — Adding a restriction on a property

| **If** | the ontologist wants to constrain the use of a `property` for a class, |
|---|---|
| **Then** | they can add a `restriction` by choosing from six semantic types (some values from, all values from, has value, exact cardinality, minimum cardinality or maximum cardinality), or use the default type (some values from) with a single click. |

**Source code:** `owl_editor.js` → `RestrictionEditor.addRestriction()` — Creates a `someValuesFrom` restriction by default and inserts it via `_renderChild()` into the `.restr-children` of the property group. | `RestrictionEditor.addRestrictionOfType()` — Same behaviour for `allValuesFrom`, `hasValue`, `exactCardinality`, `minCardinality`, `maxCardinality` types selected from the context menu.

---

### REQ-CLS-014 — Changing restriction type

| **If** | the ontologist changes the type of an existing `restriction` on a `property`, |
|---|---|
| **Then** | the input form adapts immediately: the cardinality field appears for cardinal types and disappears for others, and the target class selector (filler) is automatically hidden when a cardinal type is chosen. |

**Source code:** `owl_editor.js` → `RestrictionEditor.onChildType()` — Reads the value from the `restr-type-sel` `<select>`, shows/hides `restr-card-inp` and the filler selector depending on whether the type contains "Cardinality", and closes the filler dropdown if applicable.

---

### REQ-CLS-015 — Removing a property from the restrictions panel

| **If** | the ontologist wants to entirely remove a `property` from the `restrictions` panel of a class, |
|---|---|
| **Then** | the `property` and all its associated `restrictions` are removed from the panel, the `property` becomes available again in the list of `properties` to add (sorted alphabetically with its type), and the change is saved automatically. |

**Source code:** `owl_editor.js` → `RestrictionEditor.deleteProp()` — Removes the `.restr-prop-group` from the DOM, resets `_selectedProp`, re-inserts the property into the `#restr-prop-picker` in alphabetical order with its icon (OP or DP), and triggers `autoSave()`.

---

### REQ-CLS-016 — Deleting a child restriction

| **If** | the ontologist wants to delete an `individual` `restriction` within a `property` group, |
|---|---|
| **Then** | only that `restriction` is removed, the other `restrictions` on the same `property` remaining intact, and the change is saved automatically. |

**Source code:** `owl_editor.js` → `RestrictionEditor.deleteChild()` — Removes the DOM element identified by `restr-child-${gid}` and triggers `autoSave()`.

---

### REQ-CLS-017 — Collecting restrictions for saving

| **If** | a class save is triggered and the `restrictions` panel contains declared `properties`, |
|---|---|
| **Then** | all entered `restrictions` are consolidated for persistence: `properties` without an explicit `restriction` are kept as presence markers, and each `restriction` is recorded with its type, its target class or value, and its cardinality where applicable. |

**Source code:** `owl_editor.js` → `RestrictionEditor.collect()` — For each group with no child row, generates a marker `{ type: '_marker', property: prop }` (persisted in JSON but ignored in RDF). For each row, reads the type from `restr-type-sel`, the filler from `restr-filler-val` (or the value for `hasValue`) and the cardinality from `restr-card-inp`. Returns a structured array of all restrictions.

---

### REQ-CLS-018 — Quick creation of an ObjectProperty from the Classes tab

| **If** | the ontologist wants to create an `object property` directly associated with the class being edited, |
|---|---|
| **Then** | a new `object property` is created with the current class declared as its domain, and the application automatically navigates to that `property` so the ontologist can complete it without losing context. |

**Source code:** `owl_editor.js` → `ClassEditor.createOPForClass()` — Creates an ObjectProperty with `domain: [classId]`, `range: []` and `subPropertyOf: []` via `API.createObjectProperty()`, then navigates to the "object-properties" tab on the new property.

---

### REQ-CLS-019 — Quick creation of a DatatypeProperty from the Classes tab

| **If** | the ontologist wants to create a data `property` directly associated with the class being edited, |
|---|---|
| **Then** | a new data `property` is created with the current class declared as its domain, and the application automatically navigates to the `datatype properties` tab to allow the ontologist to complete it. |

**Source code:** `owl_editor.js` → `ClassEditor.createDTPForClass()` — Creates a DatatypeProperty with `domain: [classId]` and `functional: false` via `API.createDatatypeProperty()`, then navigates to the "datatype-properties" tab.

---

### REQ-CLS-035 — Attaching an existing property to the class via "+ Property"

| **If** | the ontologist clicks the "+ Property" button of the *Asserted Properties* section and selects an existing `object property` or data `property`, |
|---|---|
| **Then** | the current class is added to that `property`'s `domain`, so the `property` becomes attached to the class and appears in the *Asserted Properties* section, without having to declare an explicit `restriction`. The picker is presented as a filterable floating overlay. |

**Source code:** `owl_editor.js` → `ClassEditor.showDomainPropPicker()` — Toggles the `#domain-prop-picker` overlay, decorates it with a `Filter` field (`_decoratePickerWithFilter`), floats it below the "+ Property" button (`_floatPickerBelow`) and closes it on outside click. | `ClassEditor.addDomainProperty(propId)` — Looks up the selected property among `object_properties`/`datatype_properties`, appends the current class to its `domain` (no-op if already present) via `API.updateOP()` / `API.updateDP()`, then refreshes and re-renders the Classes section. The picker content is built by `_assertedPropPickerItems(_domainExclude, 'ClassEditor.addDomainProperty')`.

---

### REQ-CLS-036 — Adding a restriction on an inherited property (inherited → asserted)

| **If** | the ontologist right-clicks an entry in the *Inherited Properties* section and chooses "Add restriction" with one of the six semantic types (some values from, all values from, has value, exact / minimum / maximum cardinality), |
|---|---|
| **Then** | the chosen `restriction` is created on the **current** class for that `property`, and the `property` therefore **moves** from *Inherited Properties* to *Asserted Properties* (Protégé-style behaviour). |

| **If** | the ontologist deletes the last `restriction` of a `property` that is purely inherited (not in the current class's `domain`), |
|---|---|
| **Then** | the whole group is removed and the `property` **returns** to *Inherited Properties*, with no residual presence marker left behind. |

**Source code:** `owl_editor.js` → `RestrictionEditor.showInheritedContextMenu(event, prop)` — Builds a context menu of the six restriction types (header "Add restriction (inherited → asserted)"), each entry calling `addInheritedRestriction(prop, type)`. | `RestrictionEditor.addInheritedRestriction(prop, type)` — Removes any local `_marker` for that property from `subClassOf`, pushes the new restriction (`filler`/`value`/`cardinality` depending on the type) and persists via `API.updateClass()`. | `RestrictionEditor.deleteChild(gid)` — When the group becomes empty, removes the whole group (so the property reverts to *Inherited*) only if the property is **not** in the current class's `domain` (`inDomain` test); otherwise an empty group is kept (serialised as a `_marker`, staying asserted).

---

### REQ-CLS-038 — Normalising domain markers and cleaning references on deletion (backend)

| **If** | an `ontology` is loaded/connected, whatever the origin of the data (UI editing or corpus analysis), |
|---|---|
| **Then** | a presence marker is guaranteed for every (property, domain class) pair, so the *Inherited* / *Asserted* rendering is consistent regardless of how the data was produced. |

| **If** | a class (and its descendants) is deleted, |
|---|---|
| **Then** | the class is removed from every `property` `domain` and all references to the deleted classes are cleaned from the remaining classes (`subClassOf`, `equivalentClass`, `disjointWith`), so no dangling superclass reappears on export/import. |

**Source code:** `main.py` → `_backfill_domain_markers(onto)` — For each object/datatype property, calls `_sync_domain_markers()` to ensure a `_marker` exists in each class listed in the property's `domain`; invoked on connection (and after import). | `delete_class(class_id)` — Collects the class and its descendants, removes them from every property `domain`, deletes the classes, then filters out any reference to the deleted ids from the remaining classes' `subClassOf`, `equivalentClass` and `disjointWith` lists.

---

## 2. Form — Presentation and UI

> Display-related requirements: layout, visual components, interactions, navigation, styles.

### REQ-CLS-020 — Rendering the class tree with owl:Thing root node

| **If** | the ontologist opens the `Classes` tab of a loaded `ontology`, |
|---|---|
| **Then** | the tree displays the universal root concept (`owl:Thing` or the `ontology`'s custom label) at the top, followed by all `classes` organised in a hierarchy. If the `ontology` contains no local `classes`, an absence message is displayed. |

**Source code:** `owl_editor.js` → `ClassEditor.renderTree()` — Generates the tree HTML by displaying an `owl:Thing` node at the top (label from `APP.getOntologyRootLabels().classRoot`), then recursively calls `_renderNode()` for each root class. Displays "No classes" if the list is empty.

---

### REQ-CLS-021 — Selecting a class in the tree

| **If** | the ontologist selects a class in the tree, |
|---|---|
| **Then** | the class is highlighted, its full editing form is displayed in the detail panel, the hierarchy of its superclasses is visible in the side panel, and the available actions (create a subclass, create a sibling class, delete) are enabled. |

**Source code:** `owl_editor.js` → `ClassEditor.selectClass()` — Deselects all nodes, visually selects the `.tree-label` corresponding to the identifier, loads the object from `APP.state.classes`, injects the form via `renderForm()`, updates the superclass panel via `renderSplit()`, and enables the Child, Sister and Delete buttons.

---

### REQ-CLS-022 — Selecting the owl:Thing root node

| **If** | the ontologist selects the `owl:Thing` root node in the tree, |
|---|---|
| **Then** | the detail panel displays a message indicating that this concept is the root of all `classes`, with a button to create a new class. The "create sibling class" and "delete" actions are disabled; only subclass creation remains available. |

**Source code:** `owl_editor.js` → `ClassEditor.selectOwlThing()` — Visually selects the root node, injects a "Root of all classes" message with a creation button into the detail panel, clears the superclass panel, and disables the Sister and Delete buttons (the Child button remains active).

---

### REQ-CLS-023 — Expanding/collapsing a tree node

| **If** | the ontologist clicks the expansion indicator of a tree node, |
|---|---|
| **Then** | the node toggles between the expanded state (subclasses visible) and the collapsed state (subclasses hidden), and this state is remembered for the duration of the session. |

**Source code:** `owl_editor.js` → `ClassEditor.toggleNode()` — Toggles the presence of the identifier in the `_expanded` `Set`, calls `buildTree()` on `APP.state.classes` and redraws the affected child nodes.

---

### REQ-CLS-024 — Context menu on a tree node

| **If** | the ontologist right-clicks on a tree node, |
|---|---|
| **Then** | a context menu appears at the cursor position, offering to create a subclass, create a sibling class (only for `classes`, not for `owl:Thing`), or delete the class (highlighted action). |

| **If** | the ontologist clicks outside the context menu, |
|---|---|
| **Then** | the menu closes. |

**Source code:** `owl_editor.js` → `ClassEditor.showContextMenu()` — Positions the menu at the mouse event coordinates, displays the entries "Add child class", "Add sibling class" (hidden if the target is `owl:Thing`) and "Delete selected class" (in red). Closing is handled by `_closeContextMenu()` on outside click.

---

### REQ-CLS-025 — Class editing form

| **If** | a class is selected in the tree or a new class is being created, |
|---|---|
| **Then** | the detail panel presents a complete form allowing the concept identifier, its annotations, its `property` `restrictions`, its disjoint `classes` and its equivalent `classes` to be defined. In creation mode, an explicit submit button is displayed. |

**Source code:** `owl_editor.js` → `ClassEditor.renderForm()` — Generates the detail panel HTML with: a `#cls-id` field for the identifier (with the mention "instance of owl:Class"), the full IRI if `baseIri` is defined, an annotations table, the restrictions panel via `RestrictionEditor.renderPanel()`, a "Disjoints" block, an "Equivalent" block, and the "✅ Create class" button in creation mode only.

---

### REQ-CLS-026 — Managing rdfs:label and rdfs:comment annotations

| **If** | the ontologist wants to add a label or comment to a concept, |
|---|---|
| **Then** | a new annotation row is added to the annotations table, with a value field, a language indicator (initialised to the application's default language) and a delete button. Any subsequent modification of this row is saved automatically. |

**Source code:** `owl_editor.js` → `ClassEditor.addAnnotRow()` — Creates a row via `_makeAnnotRow(type, 'ClassEditor', ac)` with a text field, a language field initialised to `Settings.defaultLang` and a `✕` button, inserts the row into `#cls-anno-table` and binds `autoSave()` to change events if the class is being edited.

---

### REQ-CLS-027 — Managing custom annotation properties

| **If** | the ontologist wants to add an annotation via a custom `annotation property` (such as `rdfs:seeAlso` or any `annotation property` defined in the `ontology`), |
|---|---|
| **Then** | an annotation row is added to the table, displaying the name of the selected `property`, a value field and a language field. |

**Source code:** `owl_editor.js` → `ClassEditor.addOtherAnnotRow()` — Creates a row via `_makeAnnotRow('other', 'ClassEditor', ac, prop)` displaying the annotation property name, a value field and a language field, for `rdfs:seeAlso` or any ontology annotation property selected in `cls-anno-picker`.

---

### REQ-CLS-028 — Restrictions and asserted properties panel

| **If** | the form of a class is displayed, |
|---|---|
| **Then** | the "`Properties` and `Restrictions`" panel presents two distinct sections: inherited `restrictions` from ancestors (read-only, with their count) and `restrictions` defined directly on the class (editable, with their count), as well as shortcuts for adding an existing `property` or creating a new one directly from this panel. |

**Source code:** `owl_editor.js` → `RestrictionEditor.renderPanel()` — Calls `_group()` to group restrictions by property, generates two collapsible sections "Inherited Properties" and "Asserted Properties" with counts, and exposes buttons to add a property from the picker, create an ObjectProperty or a DatatypeProperty.

---

### REQ-CLS-029 — Adding a property to the restrictions panel

| **If** | the ontologist selects a `property` from the list of available `properties`, |
|---|---|
| **Then** | a group dedicated to that `property` appears in the `restrictions` panel (or is highlighted if it already existed), the `property` disappears from the list of available `properties`, and the change is saved automatically. |

**Source code:** `owl_editor.js` → `RestrictionEditor.addProperty()` — Checks whether a group for the property already exists in `#restr-tree` (if so, selects it); otherwise creates a group via `_renderGroup()` inserted in alphabetical order, selects the property, removes it from the `#restr-prop-picker`, and triggers `autoSave()`.

---

### REQ-CLS-030 — Selecting the filler (target class) of a restriction

| **If** | the ontologist wants to designate the target class of a `property` `restriction`, |
|---|---|
| **Then** | a dropdown menu presenting the complete class hierarchy of the `ontology` opens under the selection button. |

| **If** | the ontologist selects a class from this menu, |
|---|---|
| **Then** | the chosen class is displayed as the `restriction` target, the visual indicator is updated, and the change is saved automatically. |

**Source code:** `owl_editor.js` → `RestrictionEditor.toggleFillerPicker()` — Opens/closes a `position:fixed` dropdown under the filler button, populated via `_classHierarchyItems()`. | `RestrictionEditor.selectFiller()` — Updates `restr-filler-val`, refreshes the displayed label, replaces the colour dot, marks the selected item and triggers `autoSave()`.

---

### REQ-CLS-031 — Displaying the full IRI of the class

| **If** | a base IRI is defined in the `ontology` settings and the selected class already exists, |
|---|---|
| **Then** | the full and unambiguous IRI of the concept is displayed in the form, allowing the ontologist to verify the global identifier of the concept within the `ontology` `namespace`. |

**Source code:** `owl_editor.js` → `ClassEditor.renderForm()` — Displays the line `For Class: <baseIri>#<classId>` in a `<code>` tag below the title, only if `baseIri` is defined in the settings and the class is not in pure creation mode.

---

### REQ-CLS-032 — Superclass panel with ancestor hierarchy

| **If** | the selected class has superclasses, |
|---|---|
| **Then** | the side panel displays the complete specialisation chain: direct superclasses (with the ability to remove them), then indirect ancestors up to `owl:Thing` (displayed with attenuated styling to distinguish them, and clickable to navigate to them). Indirect ancestors cannot be deleted from this panel. |

**Source code:** `owl_editor.js` → `ClassEditor.renderSplit()` (internal `_renderSupersPanel()` section) — Displays direct superclasses with a `✕` button, then indirect ancestors in italics at opacity 0.75 up to `owl:Thing`, each clickable via `APP.navigateTo('classes', id)` with no delete button.

---

### REQ-CLS-033 — "WHERE USED IN RANGE" panel of properties targeting the class

| **If** | a class is selected in the tree, |
|---|---|
| **Then** | a "`WHERE USED IN RANGE`" panel, placed below the "`Properties` and `Restrictions`" (asserted properties) panel, lists all `object properties` whose `Range` includes the current class, complementing the domain-oriented views by showing where the class is used as a target (range). Each listed `property` has a remove control to take the current class out of that `property`'s `Range`. |

| **If** | the ontologist uses the panel's `+` button, |
|---|---|
| **Then** | they can add an existing `object property`, whose `Range` is then extended with the current class. |

| **If** | the ontologist uses the panel's `OP` button, |
|---|---|
| **Then** | a brand-new `object property` is created on the fly with its `Range` pre-set to the current class. |

In all cases, the change is saved automatically.

**Source code:** `owl_editor.js` → `ClassEditor._renderRangeUsagePanel()` ("WHERE USED IN RANGE" panel) — Iterates over `APP.state.object_properties` to collect those whose `range` contains the current class identifier. The remove button calls `removeRangeUsage()`, which removes the class from the `range` via `API.updateOP()`. The `+` button opens a picker (items generated by `_opTreePickerItems()`) whose selection calls `addRangeUsage()` (adding the class to an existing OP's `range` via `API.updateOP()`). The `OP` button calls `createOPForClassRange()`, which creates a new ObjectProperty with `range: [classId]` via `API.createOP()`.

---

### REQ-CLS-034 — Homogeneous (filter + tree) asserted-properties picker

| **If** | the ontologist opens the `property` picker (the "property" button) to add a `property` to the `restrictions` / asserted-properties panel, |
|---|---|
| **Then** | the picker presents a `Filter` field at the top and displays the `properties` in tree mode, organised into two successive sections — first an `ObjectProperties` section, then a `DatatypeProperties` section — each respecting the `subPropertyOf` hierarchy, consistent with the homogeneous (filter + tree) pickers used throughout the application. |

**Source code:** `owl_editor.js` → `_assertedPropPickerItems()` (content of the `#restr-prop-picker` picker) + `RestrictionEditor.showPropPicker()` — `_assertedPropPickerItems()` generates two tree sections "ObjectProperties" then "DatatypeProperties" (each built by `_propTreeLines()` following the `subPropertyOf` hierarchy); on open, `showPropPicker()` adds the `Filter` field at the top via `_decoratePickerWithFilter()`.

---

### REQ-CLS-037 — Displaying the range and provenance of a property in the panel

| **If** | a `property` is displayed in the *Inherited* or *Asserted Properties* section, |
|---|---|
| **Then** | its `range` is shown in parentheses right after the name with a `→` arrow and the target icon: a brown dot (●) with a navigable link (`APP.navigateTo('classes', …)`) for a target class, or a small green marker for an `xsd:` datatype (non navigable). The same `(→ …)` rendering — including the navigable class link — is used in **both** the *Inherited* and the *Asserted* sections. |

| **If** | a `property` with a non-empty `range` is displayed in either section, |
|---|---|
| **Then** | the **multiplicity** is shown inside the range parentheses just before the target, as `single` or `multiple` (e.g. `(→ multiple ● Class)`), derived from the property's `functional` characteristic: `functional` ⇒ `single`, otherwise `multiple`. |

| **If** | the displayed `property` is inherited, |
|---|---|
| **Then** | its **provenance** class is also shown, in parentheses with a `↑` arrow and the brown (navigable) class dot, immediately after the property. |

**Source code:** `owl_editor.js` → `renderPanel()` internal helper `_renderDomainPropRow({ p, kind }, showFrom)` — Builds the `(→ <mult> …)` range tag (italic `single`/`multiple` from `p.characteristics?.functional`/`p.functional`; brown `cls-dot` + `APP.navigateTo('classes', …)` link for a class, small `dp-prop-dot` marker for a datatype) and, when `showFrom` is true (inherited property), the `(↑ …)` provenance tag from the property's `domain`. | `RestrictionEditor._renderGroupReadOnly(prop, restrictions)` (*Inherited* section) — Renders the same `(→ <mult> …)` range tag (multiplicity from the property's `functional` characteristic; class link carries class `restr-from-nav` so it stays clickable despite the read-only row being `pointer-events:none`) and a `(↑ …)` provenance tag derived from each restriction's `_fromClass`. | `RestrictionEditor._renderGroup(prop, restrictions)` (*Asserted* section) — Builds the same `(→ <mult> ● Class)` range chip via the internal `_mkRangeTag(ranges, mult)` helper (multiplicity from `opData.characteristics?.functional` / `dpData.functional`), replacing the former non-navigable “(multiple X)” summary text with the navigable class link.
