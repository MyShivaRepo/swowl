# Requirements — AnnotationProperties

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-AP-001 — Definition of built-in annotation properties](#req-ap-001--definition-of-built-in-annotation-properties)
- [REQ-AP-002 — Detection of built-in vs. user-defined properties](#req-ap-002--detection-of-built-in-vs-user-defined-properties)
- [REQ-AP-003 — Construction of the property hierarchy tree](#req-ap-003--construction-of-the-property-hierarchy-tree)
- [REQ-AP-004 — Automatic generation of a unique identifier](#req-ap-004--automatic-generation-of-a-unique-identifier)
- [REQ-AP-005 — Creation of a child property (sub-property)](#req-ap-005--creation-of-a-child-property-sub-property)
- [REQ-AP-006 — Creation of a sibling property (same level)](#req-ap-006--creation-of-a-sibling-property-same-level)
- [REQ-AP-007 — Collection of form data](#req-ap-007--collection-of-form-data)
- [REQ-AP-008 — Automatic save on every modification](#req-ap-008--automatic-save-on-every-modification)
- [REQ-AP-009 — Explicit manual save](#req-ap-009--explicit-manual-save)
- [REQ-AP-010 — Drag-and-drop to reorganize the hierarchy](#req-ap-010--drag-and-drop-to-reorganize-the-hierarchy)
- [REQ-AP-011 — Cycle prevention during drag-and-drop](#req-ap-011--cycle-prevention-during-drag-and-drop)
- [REQ-AP-012 — Deletion of a user property with confirmation](#req-ap-012--deletion-of-a-user-property-with-confirmation)
- [REQ-AP-013 — Collection of annotations (labels, comments, others)](#req-ap-013--collection-of-annotations-labels-comments-others)
- [REQ-AP-014 — Annotation property selection picker](#req-ap-014--annotation-property-selection-picker)

### Form
- [REQ-AP-015 — Rendering of built-in nodes in the tree](#req-ap-015--rendering-of-built-in-nodes-in-the-tree)
- [REQ-AP-016 — Rendering of user nodes in the tree](#req-ap-016--rendering-of-user-nodes-in-the-tree)
- [REQ-AP-017 — Full tree rendering with namespace roots](#req-ap-017--full-tree-rendering-with-namespace-roots)
- [REQ-AP-018 — Split pane layout](#req-ap-018--split-pane-layout)
- [REQ-AP-019 — Left panel resizing by drag-and-drop](#req-ap-019--left-panel-resizing-by-drag-and-drop)
- [REQ-AP-020 — Expanding/collapsing tree nodes](#req-ap-020--expandingcollapsing-tree-nodes)
- [REQ-AP-021 — Selection of a property in the tree](#req-ap-021--selection-of-a-property-in-the-tree)
- [REQ-AP-022 — Action button state management based on selection](#req-ap-022--action-button-state-management-based-on-selection)
- [REQ-AP-023 — Detail display of a namespace root](#req-ap-023--detail-display-of-a-namespace-root)
- [REQ-AP-024 — Detail display of a built-in property (read-only)](#req-ap-024--detail-display-of-a-built-in-property-read-only)
- [REQ-AP-025 — Edit form for a user-defined property](#req-ap-025--edit-form-for-a-user-defined-property)
- [REQ-AP-026 — Adding an annotation row in the form](#req-ap-026--adding-an-annotation-row-in-the-form)
- [REQ-AP-027 — Super-properties panel with inheritance chain](#req-ap-027--super-properties-panel-with-inheritance-chain)

---

## 1. Substance — Business logic and functional rules

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviors, validations, persistence.


### REQ-AP-001 — Definition of built-in annotation properties

| **If** | the ontologist uses standard OWL 2 annotation properties in their ontology, |
|---|---|
| **Then** | the application natively recognizes two groups of predefined read-only annotation properties:<br>- the `rdfs:` group: `rdfs:label`, `rdfs:comment`, `rdfs:seeAlso`, `rdfs:isDefinedBy`<br>- the `owl:` group: `owl:versionInfo`, `owl:deprecated`, `owl:priorVersion`, `owl:backwardCompatibleWith`, `owl:incompatibleWith`<br>each accompanied by an English description accessible to the user. |

---

**Source code:** `owl_editor.js` → `AP_BUILTINS` (object constant) — Defines two arrays indexed by namespace (`'rdfs:'` and `'owl:'`), each entry carrying an `id` field (short IRI) and a `comment` field (textual description). Used as a reference in `_isBuiltin()`, `_renderBuiltinNode()`, `_renderRootDetail()`, `_renderBuiltinDetail()` and `_annoPickerItems()`.

### REQ-AP-002 — Detection of built-in vs. user-defined properties

| **If** | the application must distinguish a standard OWL 2 annotation property from a property defined by the ontologist, |
|---|---|
| **Then** | it correctly identifies any property belonging to the `rdfs:` or `owl:` groups as a built-in property, and treats all others as editable user properties. |

---

**Source code:** `owl_editor.js` → `APEditor._isBuiltin(id)` — Checks for the presence of `id` in `AP_BUILTINS['rdfs:']` and `AP_BUILTINS['owl:']` via `Array.some()`, returns `true` if found in either group.

### REQ-AP-003 — Construction of the property hierarchy tree

| **If** | the ontology contains annotation properties organized in a subproperty hierarchy, |
|---|---|
| **Then** | the annotation property tree faithfully reflects the specialization relationships between properties, distinguishing root properties, properties attached to a built-in parent, and those attached to a user-defined parent. |

---

**Source code:** `owl_editor.js` → `APEditor._buildUserTree()` — Builds three structures: `childrenOf` (map `id → [user children]`), `builtinChildrenOf` (map `builtinId → [user children whose parent is a built-in]`), and `roots` (properties without `subPropertyOf`, sorted alphabetically). Iterates over `APP.state.annotation_properties`.

### REQ-AP-004 — Automatic generation of a unique identifier

| **If** | the ontologist creates a new annotation property without specifying its identifier, |
|---|---|
| **Then** | the application automatically proposes a unique identifier, with no conflict with the properties already present in the ontology. |

---

**Source code:** `owl_editor.js` → `APEditor._generatePropName()` — Starts from the string `'NewAnnotationProperty'`, increments a numeric suffix (`NewAnnotationProperty1`, `NewAnnotationProperty2`, …) until an identifier absent from `APP.state.annotation_properties` is found.

### REQ-AP-005 — Creation of a child property (sub-property)

| **If** | the ontologist wishes to specialize an existing annotation property by creating a subproperty directly positioned beneath it, |
|---|---|
| **Then** | the new property is automatically attached to the selected parent, the parent is expanded in the tree, and the new property is immediately selected for editing. |

---

**Source code:** `owl_editor.js` → `APEditor.createChild()` — If the selected property is not a namespace root, initializes `subPropertyOf: [selectedId]` on the new property, adds `selectedId` to `APEditor._expanded`, calls `API.createAP(prop)` then selects the new property via `selectProp()`.

### REQ-AP-006 — Creation of a sibling property (same level)

| **If** | the ontologist wishes to create a new annotation property at the same hierarchical level as an existing property, |
|---|---|
| **Then** | the new property inherits the same parents as the reference property, and its parents are expanded in the tree to make the new property immediately visible. |

---

**Source code:** `owl_editor.js` → `APEditor.createSibling()` — Retrieves `subPropertyOf` from the selected property in `APP.state.annotation_properties`, assigns it to the new property, adds each parent to `APEditor._expanded`, then delegates to `_createAndSelect()`.

### REQ-AP-007 — Collection of form data

| **If** | the ontologist has filled in the fields of a user annotation property and the application must persist this information, |
|---|---|
| **Then** | the application consolidates the entered identifier, the existing subproperty relationships, and all annotations (labels, comments, others) into a coherent representation ready to be saved. |

---

**Source code:** `owl_editor.js` → `APEditor._collectForm()` — Reads the identifier from the `ap-id` field normalizing spaces to `_`, preserves the existing `subPropertyOf` from `APP.state.annotation_properties` (not exposed in the form), collects annotations via `_collectAnnotations('ap-annotations-body')`.

### REQ-AP-008 — Automatic save on every modification

| **If** | the ontologist modifies a field in the form of a user annotation property, |
|---|---|
| **Then** | modifications are persisted immediately and automatically, without any additional action from the user, and the display remains synchronized with the saved state. |

---

**Source code:** `owl_editor.js` → `APEditor._autoSave()` — Collects data via `_collectForm()`, calls `API.updateAP(id, data)`, detects a possible rename (`data.id !== id`), refreshes state via `APP.refresh()` and restores selection via `APEditor.restoreSelection()`.

### REQ-AP-009 — Explicit manual save

| **If** | the ontologist explicitly triggers the save of a user annotation property, |
|---|---|
| **Then** | the application validates the identifier, persists the modifications, updates the current selection to reflect a possible rename, and refreshes the tree display. |

---

**Source code:** `owl_editor.js` → `APEditor.save()` — Collects data via `_collectForm()`, validates the identifier via `_validateId()`, calls `API.updateAP()` with `_editingId` or the new identifier, updates `_editingId` and `_selectedId`, adds the identifier to `_expanded`, then calls `APP.refresh()`.

### REQ-AP-010 — Drag-and-drop to reorganize the hierarchy

| **If** | the ontologist wishes to move a user annotation property within the hierarchy by dragging it to another location in the tree, |
|---|---|
| **Then** | the moved property is attached to the new target parent, or promoted to root property if dropped onto a namespace root, and this change is immediately persisted. |

---

**Source code:** `owl_editor.js` → `APEditor.onDragStart()` | `APEditor.onDragOver()` | `APEditor.onDrop()` — `onDragStart` stores the source identifier in `dataTransfer`. `onDrop` reads the target: if namespace root, `subPropertyOf = []`; otherwise `subPropertyOf = [targetId]`. The update is persisted via `API.updateAP()`.

### REQ-AP-011 — Cycle prevention during drag-and-drop

| **If** | the ontologist attempts to move an annotation property onto one of its own descendants in the hierarchy, |
|---|---|
| **Then** | the application rejects this move in order to preserve the acyclic consistency of the subproperty hierarchy. |

---

**Source code:** `owl_editor.js` → `APEditor._isDescendant(ancestorId, candidateId)` | `APEditor.onDragOver()` — `_isDescendant` recursively traverses `subPropertyOf` to detect whether `ancestorId` is an ancestor of `candidateId`. If true, `onDragOver` does not call `event.preventDefault()`, preventing the drop.

### REQ-AP-012 — Deletion of a user property with confirmation

| **If** | the ontologist wishes to permanently delete a user annotation property, |
|---|---|
| **Then** | the application requests explicit confirmation before any deletion, then removes the property from the ontology, resets the selection and refreshes the tree. |

---

**Source code:** `owl_editor.js` → `APEditor.deleteSelected()` — Calls `UI.confirm()`; upon validation: calls `API.deleteAP(id)`, resets `_selectedId` to `null`, calls `APP.refresh()`, resets the detail panel with the prompt message, and redraws the tree.

### REQ-AP-013 — Collection of annotations (labels, comments, others)

| **If** | the ontologist has entered textual annotations (labels, comments, or custom annotations) on an annotation property, |
|---|---|
| **Then** | the application groups these annotations by category (labels, comments, other annotation properties), preserving for each one the value, the language, and, for custom annotations, the annotation property used. |

---

**Source code:** `owl_editor.js` → `_collectAnnotations(tbodyId)` — Iterates over `.anno-row` CSS rows of the table identified by `tbodyId`, reads `.anno-value` and `.anno-lang-inp` for each non-empty row, classifies into `labels`, `comments` or `other` according to `row.dataset.type`, and for `'other'` reads the target property from `row.dataset.prop`.

### REQ-AP-014 — Annotation property selection picker

| **If** | the ontologist wishes to add an annotation using a specific annotation property, |
|---|---|
| **Then** | the application offers a visual selector listing all available annotation properties — built-in and user-defined — organized hierarchically and navigable by a simple click. |

---

**Source code:** `owl_editor.js` → `_annoPickerItems(editorName)` — Generates a clickable HTML tree composed of `AP_BUILTINS` properties and user properties from `APEditor._buildUserTree()`. A click on an item triggers `<editorName>.addOtherAnnotRow(id)`.

## 2. Form — Presentation and UI

> Requirements relating to display: layout, visual components, interactions, navigation, styles.

### REQ-AP-015 — Rendering of built-in nodes in the tree

| **If** | the annotation property tree displays an OWL 2 built-in property, |
|---|---|
| **Then** | this property is presented with a visual indication of its non-editable status, an expansion control if it has user subproperties, and its eventual subproperties are displayed beneath it. It can receive dragged properties but cannot itself be moved. |

---

**Source code:** `owl_editor.js` → `APEditor._renderBuiltinNode(prop, depth)` — Generates a node with a `built-in` badge, a conditional expansion indicator (`APEditor.builtinChildrenOf[prop.id]` non-empty), `ondragover` and `ondrop` handlers, and recursively calls `_renderUserNode()` for each user child. The `draggable` attribute is not set.

### REQ-AP-016 — Rendering of user nodes in the tree

| **If** | the annotation property tree displays a property defined by the ontologist, |
|---|---|
| **Then** | this property is visually indented according to its depth in the hierarchy, can be dragged to another location, and its subproperties are displayed beneath it when it is expanded. |

---

**Source code:** `owl_editor.js` → `APEditor._renderUserNode(id, depth)` — Generates a `draggable="true"` node with `padding-left: ${depth * 16 + 6}px`, exposes `ondragstart`, `ondragover`, `ondragleave`, `ondrop`, `ondragend` handlers, reads expansion state from `APEditor._expanded`, and calls itself recursively for children via `childrenOf[id]`.

### REQ-AP-017 — Full tree rendering with namespace roots

| **If** | the annotation properties tab is displayed for a standard OWL ontology, |
|---|---|
| **Then** | the tree presents two namespace roots (`rdfs:` and `owl:`) grouping the corresponding built-in properties, followed by user properties organized in a subtree. User properties with no known namespace attachment are displayed at the root of the tree. |

---

**Source code:** `owl_editor.js` → `APEditor._renderTree()` — Conditioned by `APP.getOntologyRootLabels().classRoot === 'owl:Thing'`. Composes the HTML of the two namespace roots (clickable, expandable, with `ondragover` and `ondrop`), then appends "orphan" user properties (absent from `childrenOf` and `builtinChildrenOf`) at the end of the tree.

### REQ-AP-018 — Split pane layout

| **If** | the ontologist opens the annotation properties tab, |
|---|---|
| **Then** | the interface presents a left panel containing the property tree and available actions, and a right panel displaying the detail of the selected property or an invitation to create a new one. Creation actions are disabled as long as no property is selected. |

---

**Source code:** `owl_editor.js` → `APEditor.renderSplit()` — Generates the left panel `ap-tree-panel` with "Child", "Sibling", "Delete" buttons (`disabled` by default), the `ap-tree` container, the `ap-super-list` panel, the `ap-split-handle` handle, and the right panel `ap-detail` with a prompt message and a "＋ Create Annotation Property" button.

### REQ-AP-019 — Left panel resizing by drag-and-drop

| **If** | the ontologist wishes to adjust the width of the navigation panel relative to the detail panel, |
|---|---|
| **Then** | they can drag the divider between the two panels to freely resize the left panel, within the minimum and maximum limits defined by the interface. |

---

**Source code:** `owl_editor.js` → `APEditor._initSplitPane()` — Listens for `mousedown` events on `ap-split-handle`, recalculates the width of `ap-tree-panel` in pixels during `mousemove` with a minimum of 160 px and a maximum of 520 px, and initializes the internal vertical resizing via `_initHResizers('ap-tree-panel')`.

### REQ-AP-020 — Expanding/collapsing tree nodes

| **If** | the ontologist clicks the expansion indicator of a tree node, |
|---|---|
| **Then** | the node toggles between expanded and collapsed states, and the tree redraws immediately to reflect this change. The `rdfs:` and `owl:` namespace roots are expanded by default when the tab is opened. |

---

**Source code:** `owl_editor.js` → `APEditor.toggleNode(id)` — Adds or removes `id` from the internal `Set` `APEditor._expanded` (via `add` or `delete`), then calls `_renderTree()` followed by `_highlightSelected()`. The identifiers `'rdfs:'` and `'owl:'` are pre-inserted into `_expanded` at initialization.

### REQ-AP-021 — Selection of a property in the tree

| **If** | the ontologist clicks on a property in the annotation property tree, |
|---|---|
| **Then** | the property is highlighted visually, the available actions are updated according to its type, and the detail panel displays the corresponding information: description for a namespace root, read-only view for a built-in property, edit form for a user-defined property. |

---

**Source code:** `owl_editor.js` → `APEditor.selectProp(id)` — Updates `_selectedId`, calls `_highlightSelected()` and `_updateButtons()`, then loads the detail panel via `_renderRootDetail()`, `_renderBuiltinDetail()` or `_renderForm()` depending on the type of `id`. In all cases, calls `_updateSuperPanel()`.

### REQ-AP-022 — Action button state management based on selection

| **If** | the selection in the annotation property tree changes, |
|---|---|
| **Then** | the proposed actions adapt to the type of the selected element: a namespace root offers no action, a built-in property only allows creating a subproperty, and a user-defined property allows creating a subproperty, creating a sibling property, and deletion. |

---

**Source code:** `owl_editor.js` → `APEditor._updateButtons()` — Selects the `ap-btn-child`, `ap-btn-sibling`, `ap-btn-delete` buttons and shows or hides them (`style.display`) depending on whether `_selectedId` corresponds to a namespace root, a built-in property (`_isBuiltin()`) or a user-defined property.

### REQ-AP-023 — Detail display of a namespace root

| **If** | the ontologist selects a namespace root in the tree, |
|---|---|
| **Then** | the detail panel presents in read-only mode all the built-in annotation properties belonging to that namespace, with their identifier and description, and clearly indicates that the namespace root is not itself an annotation property. |

---

**Source code:** `owl_editor.js` → `APEditor._renderRootDetail(ns)` — Displays a panel listing all entries of `AP_BUILTINS[ns]` with their `id` and `comment`, accompanied by a "Namespace root — not an AnnotationProperty" badge. No edit form is generated.

### REQ-AP-024 — Detail display of a built-in property (read-only)

| **If** | the ontologist selects an OWL 2 built-in annotation property in the tree, |
|---|---|
| **Then** | the detail panel presents its identifier and normative description in read-only mode, explicitly indicating that it cannot be modified. |

---

**Source code:** `owl_editor.js` → `APEditor._renderBuiltinDetail(id)` — Retrieves the corresponding entry in `AP_BUILTINS`, displays `id` and `comment`, and adds the mention "Built-in OWL 2 annotation property — read-only." No editable field is rendered.

### REQ-AP-025 — Edit form for a user-defined property

| **If** | the ontologist selects an annotation property they have defined, |
|---|---|
| **Then** | the detail panel displays a form allowing modification of the local identifier of the property, consultation of its full IRI in the ontology, and management of its annotations (labels, comments, custom annotations). |

---

**Source code:** `owl_editor.js` → `APEditor._renderForm(id)` — Generates a text field `ap-id` with `oninput="_sanitizeId(this)"` and `onchange="APEditor._autoSave()"`, displays the full IRI built from `APP.state.ontology.id`, the label `(instance of owl:AnnotationProperty)`, and pre-fills existing annotation rows via `_annoRow()`.

### REQ-AP-026 — Adding an annotation row in the form

| **If** | the ontologist wishes to add an annotation (label, comment, or custom annotation) to a user-defined annotation property, |
|---|---|
| **Then** | a new empty row is inserted in the form to enter the value, the language, and, for custom annotations, the annotation property to use. |

---

**Source code:** `owl_editor.js` → `APEditor.addAnnotRow(type, ac)` — Inserts a new row into the `ap-annotations-body` table via `_makeAnnotRow(type, 'APEditor', ac)`. The `type` parameter can be `'label'`, `'comment'` or `'other'`. Each generated row triggers `APEditor._autoSave()` on any value change.

### REQ-AP-027 — Super-properties panel with inheritance chain

| **If** | the ontologist selects an annotation property in the tree, |
|---|---|
| **Then** | the super-properties panel displays, for each direct parent, the complete inheritance chain up to the namespace root, each ancestor being presented with increasing indentation and constituting a navigation link to that ancestor. |

---

**Source code:** `owl_editor.js` → `APEditor._updateSuperPanel()` — Updates the `ap-super-list` container. For each direct parent, calls `buildChain(id)` which recursively traverses `subPropertyOf` up to the root, appends the namespace root (`'rdfs:'` or `'owl:'`) at the end of the chain, and renders each ancestor with increasing `padding-left` and an `onclick="APP.navigateTo()"` link.
