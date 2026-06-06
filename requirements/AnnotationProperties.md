# Requirements — AnnotationProperties

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-AP-001 — Definition of built-in annotation properties](#req-ap-001--definition-of-built-in-annotation-properties)
- [REQ-AP-002 — Detection of built-in vs. user properties](#req-ap-002--detection-of-built-in-vs-user-properties)
- [REQ-AP-003 — Building the hierarchical property tree](#req-ap-003--building-the-hierarchical-property-tree)
- [REQ-AP-004 — Automatic generation of a unique identifier](#req-ap-004--automatic-generation-of-a-unique-identifier)
- [REQ-AP-005 — Creating a child property (sub-property)](#req-ap-005--creating-a-child-property-sub-property)
- [REQ-AP-006 — Creating a sibling property (same level)](#req-ap-006--creating-a-sibling-property-same-level)
- [REQ-AP-007 — Collecting form data](#req-ap-007--collecting-form-data)
- [REQ-AP-008 — Automatic save on every change](#req-ap-008--automatic-save-on-every-change)
- [REQ-AP-009 — Explicit manual save](#req-ap-009--explicit-manual-save)
- [REQ-AP-010 — Drag-and-drop to reorganize the hierarchy](#req-ap-010--drag-and-drop-to-reorganize-the-hierarchy)
- [REQ-AP-011 — Cycle prevention during drag-and-drop](#req-ap-011--cycle-prevention-during-drag-and-drop)
- [REQ-AP-012 — Deleting a user property with confirmation](#req-ap-012--deleting-a-user-property-with-confirmation)
- [REQ-AP-013 — Collecting annotations (labels, comments, others)](#req-ap-013--collecting-annotations-labels-comments-others)
- [REQ-AP-014 — Annotation property selection picker](#req-ap-014--annotation-property-selection-picker)

### Form
- [REQ-AP-015 — Rendering built-in nodes in the tree](#req-ap-015--rendering-built-in-nodes-in-the-tree)
- [REQ-AP-016 — Rendering user nodes in the tree](#req-ap-016--rendering-user-nodes-in-the-tree)
- [REQ-AP-017 — Full tree rendering with namespace roots](#req-ap-017--full-tree-rendering-with-namespace-roots)
- [REQ-AP-018 — Split pane layout](#req-ap-018--split-pane-layout)
- [REQ-AP-019 — Left panel resizing by drag-and-drop](#req-ap-019--left-panel-resizing-by-drag-and-drop)
- [REQ-AP-020 — Expanding/collapsing tree nodes](#req-ap-020--expandingcollapsing-tree-nodes)
- [REQ-AP-021 — Selecting a property in the tree](#req-ap-021--selecting-a-property-in-the-tree)
- [REQ-AP-022 — Managing action button states based on selection](#req-ap-022--managing-action-button-states-based-on-selection)
- [REQ-AP-023 — Displaying the detail of a namespace root](#req-ap-023--displaying-the-detail-of-a-namespace-root)
- [REQ-AP-024 — Displaying the detail of a built-in property (read-only)](#req-ap-024--displaying-the-detail-of-a-built-in-property-read-only)
- [REQ-AP-025 — Edit form for a user property](#req-ap-025--edit-form-for-a-user-property)
- [REQ-AP-026 — Adding an annotation row in the form](#req-ap-026--adding-an-annotation-row-in-the-form)
- [REQ-AP-027 — Super-properties panel with inheritance chain](#req-ap-027--super-properties-panel-with-inheritance-chain)

---

## 1. Substance — Business logic

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviors, validations, persistence.


### REQ-AP-001 — Definition of built-in annotation properties

**If** the ontology is loaded and uses standard OWL 2 annotation properties,

**Then** the system provides a constant `AP_BUILTINS` defining two groups of read-only properties:
- the `rdfs:` group containing `rdfs:label`, `rdfs:comment`, `rdfs:seeAlso`, `rdfs:isDefinedBy`
- the `owl:` group containing `owl:versionInfo`, `owl:deprecated`, `owl:priorVersion`, `owl:backwardCompatibleWith`, `owl:incompatibleWith`

each entry carrying an identifier and a descriptive comment in English.

---

**Source code:** `owl_editor.js` → `AP_BUILTINS` (object constant)

### REQ-AP-002 — Detection of built-in vs. user properties

**If** the system evaluates an annotation property identifier,

**Then** it determines whether that identifier is a built-in property by checking its presence in the `AP_BUILTINS['rdfs:']` and `AP_BUILTINS['owl:']` arrays, and returns `true` if the identifier is found in either group.

---

**Source code:** `owl_editor.js` → `APEditor._isBuiltin()`

### REQ-AP-003 — Building the hierarchical property tree

**If** the ontology is loaded and contains user annotation properties,

**Then** the system builds parent-child relationship maps and produces:
- `childrenOf` (map user → [user children])
- `builtinChildrenOf` (map builtin → [user children])
- `roots` (properties without a parent, sorted alphabetically)

properties whose direct parent is a built-in identifier being placed in `builtinChildrenOf`.

---

**Source code:** `owl_editor.js` → `APEditor._buildUserTree()`

### REQ-AP-004 — Automatic generation of a unique identifier

**If** the user requests the creation of a new annotation property,

**Then** the system generates a unique identifier starting from the string `'NewAnnotationProperty'` and incrementing a numeric suffix (`NewAnnotationProperty1`, `NewAnnotationProperty2`, …) until an identifier not present in `APP.state.annotation_properties` is found.

---

**Source code:** `owl_editor.js` → `APEditor._generatePropName()`

### REQ-AP-005 — Creating a child property (sub-property)

**If** the user clicks the "Child" button with a property selected in the tree,

**Then**:
- If the selected property is not a namespace root, it is placed in the `subPropertyOf` array of the new property
- the parent node is expanded in `APEditor._expanded`
- the new property is created via `API.createAP(prop)` and immediately selected

---

**Source code:** `owl_editor.js` → `APEditor.createChild()`

### REQ-AP-006 — Creating a sibling property (same level)

**If** the user clicks the "Sibling" button with a property selected in the tree,

**Then** the parents (`subPropertyOf`) of the selected property are retrieved from `APP.state.annotation_properties`, placed as parents of the new property, these parents are expanded in `APEditor._expanded`, and creation is delegated to `_createAndSelect()`.

---

**Source code:** `owl_editor.js` → `APEditor.createSibling()`

### REQ-AP-007 — Collecting form data

**If** the system collects data entered in a user annotation property form,

**Then**:
- the identifier is read from the `ap-id` field with spaces normalized to `_`
- the existing `subPropertyOf` is preserved from `APP.state.annotation_properties` (the form does not expose it directly)
- labels, comments and other annotations are collected via `_collectAnnotations('ap-annotations-body')`

---

**Source code:** `owl_editor.js` → `APEditor._collectForm()`

### REQ-AP-008 — Automatic save on every change

**If** the user modifies a field in a user property form (non-root, non-built-in),

**Then** the system collects data via `_collectForm()`, calls `API.updateAP(id, data)`, detects a possible rename (if `data.id !== id`), then refreshes state and restores selection via `APP.refresh()` and `APEditor.restoreSelection()`.

---

**Source code:** `owl_editor.js` → `APEditor._autoSave()`

### REQ-AP-009 — Explicit manual save

**If** the user triggers a manual save on a user property,

**Then** the system collects data via `_collectForm()`, validates the identifier via `_validateId()`, calls `API.updateAP()` with the original editing identifier (`_editingId`) or the new identifier, updates `_editingId` and `_selectedId`, expands the saved node, then refreshes the display.

---

**Source code:** `owl_editor.js` → `APEditor.save()`

### REQ-AP-010 — Drag-and-drop to reorganize the hierarchy

**If** the user drags a user property and drops it onto a valid target in the tree,

**Then**:
- If the target is a namespace root, `subPropertyOf` becomes `[]`
- otherwise, `subPropertyOf = [targetId]`
- the update is persisted via `API.updateAP()`

---

**Source code:** `owl_editor.js` → `APEditor.onDragStart()` | `APEditor.onDragOver()` | `APEditor.onDrop()`

### REQ-AP-011 — Cycle prevention during drag-and-drop

**If** the user attempts to drop a property onto one of its own descendants in the tree,

**Then** the drop is refused in order to prevent the formation of a hierarchical cycle, by not calling `event.preventDefault()` in `onDragOver()`.

---

**Source code:** `owl_editor.js` → `APEditor._isDescendant()` | `APEditor.onDragOver()`

### REQ-AP-012 — Deleting a user property with confirmation

**If** the user clicks "Delete" with a user property selected (non-root, non-built-in)
**and** confirms the deletion in the `UI.confirm()` dialog,

**Then**:
- `API.deleteAP(id)` is called
- `_selectedId` is reset to `null`
- state is refreshed via `APP.refresh()`
- the detail panel is reset with an empty prompt message
- the tree is redrawn

---

**Source code:** `owl_editor.js` → `APEditor.deleteSelected()`

### REQ-AP-013 — Collecting annotations (labels, comments, others)

**If** the system collects annotations from a form identified by `tbodyId`,

**Then** it iterates over all CSS `.anno-row` rows of the table, and for each non-empty row:
- reads the value (`.anno-value`) and the language (`.anno-lang-inp`)
- classifies the entry into `labels`, `comments` or `other` according to `row.dataset.type`
- for `'other'` rows, reads the target property from `row.dataset.prop`

---

**Source code:** `owl_editor.js` → `_collectAnnotations()`

### REQ-AP-014 — Annotation property selection picker

**If** an editor form displays the annotation property picker,

**Then** the system generates a clickable tree composed of built-in properties (`AP_BUILTINS`) and user properties from `APEditor._buildUserTree()`, a click on an item triggering `<editorName>.addOtherAnnotRow(id)`.

---

**Source code:** `owl_editor.js` → `_annoPickerItems()`

## 2. Form — Presentation and UI

> Requirements relating to display: layout, visual components, interactions, navigation, styles.

### REQ-AP-015 — Rendering built-in nodes in the tree

**If** the annotation property tree must display a built-in property,

**Then** the system generates a node showing the property identifier, a `built-in` text badge, an expansion indicator if the property has user children, and recursively renders user children via `_renderUserNode()`. The node accepts `ondragover` and `ondrop` events but is not itself `draggable`.

---

**Source code:** `owl_editor.js` → `APEditor._renderBuiltinNode()`

### REQ-AP-016 — Rendering user nodes in the tree

**If** the annotation property tree must display a user property,

**Then** the system generates a `draggable="true"` node with indentation calculated according to depth (`depth * 16 + 6` pixels), exposing the `ondragstart`, `ondragover`, `ondragleave`, `ondrop`, `ondragend` handlers, and rendering itself recursively for all its children. The expansion state is read from `APEditor._expanded`.

---

**Source code:** `owl_editor.js` → `APEditor._renderUserNode()`

### REQ-AP-017 — Full tree rendering with namespace roots

**If** the annotation properties tab is displayed and `APP.getOntologyRootLabels().classRoot === 'owl:Thing'`,

**Then** the system composes the full tree with two namespace roots `rdfs:` and `owl:`, user properties with no known namespace ("orphans") rendered at the root. Each namespace root is clickable, expandable, and receives drag-over and drop events.

---

**Source code:** `owl_editor.js` → `APEditor._renderTree()`

### REQ-AP-018 — Split pane layout

**If** the annotation properties tab is rendered,

**Then** the system generates a complete layout composed of:
- a left panel (`ap-tree-panel`) containing the tree and the super-properties panel, with three action buttons "Child", "Sibling" and "Delete" initially disabled
- a resize handle (`ap-split-handle`)
- a right detail panel (`ap-detail`) displaying a prompt message and a "＋ Create Annotation Property" button when no property is selected

---

**Source code:** `owl_editor.js` → `APEditor.renderSplit()`

### REQ-AP-019 — Left panel resizing by drag-and-drop

**If** the user drags the `ap-split-handle` handle,

**Then** the width of the `ap-tree-panel` panel is recalculated in pixels with a minimum of 160 px and a maximum of 520 px, and internal horizontal resizing is initialized via `_initHResizers('ap-tree-panel')`.

---

**Source code:** `owl_editor.js` → `APEditor._initSplitPane()`

### REQ-AP-020 — Expanding/collapsing tree nodes

**If** the user clicks the expansion indicator of a tree node,

**Then** the system adds or removes the identifier from the internal `Set` `APEditor._expanded`, then triggers a full tree render via `_renderTree()` and `_highlightSelected()`. The `rdfs:` and `owl:` nodes are pre-expanded on initialization.

---

**Source code:** `owl_editor.js` → `APEditor.toggleNode()`

### REQ-AP-021 — Selecting a property in the tree

**If** the user clicks a node in the annotation property tree,

**Then** the system updates `APEditor._selectedId`, refreshes the visual highlighting and buttons, and loads the appropriate detail panel:
- `_renderRootDetail()` for a namespace root
- `_renderBuiltinDetail()` for a built-in property
- `_renderForm()` for a user property

in all cases, `_updateSuperPanel()` is called to update the super-properties panel.

---

**Source code:** `owl_editor.js` → `APEditor.selectProp()`

### REQ-AP-022 — Managing action button states based on selection

**If** the selection in the tree changes,

**Then** the system enables or hides the "Child", "Sibling" and "Delete" buttons according to the type of the selected item:
- namespace root: all buttons are hidden
- built-in property: only "Child" is visible
- user property: "Child", "Sibling" and "Delete" are all visible and enabled

---

**Source code:** `owl_editor.js` → `APEditor._updateButtons()`

### REQ-AP-023 — Displaying the detail of a namespace root

**If** the user selects a namespace root (`rdfs:` or `owl:`) in the tree,

**Then** the system displays a read-only detail panel listing all built-in properties of the namespace with their identifier and descriptive comment, accompanied by a "Namespace root — not an AnnotationProperty" badge.

---

**Source code:** `owl_editor.js` → `APEditor._renderRootDetail()`

### REQ-AP-024 — Displaying the detail of a built-in property (read-only)

**If** the user selects a built-in OWL 2 property in the tree,

**Then** the system displays a read-only detail panel presenting the identifier, the descriptive comment from `AP_BUILTINS`, and the mention "Built-in OWL 2 annotation property — read-only." No edit form is provided.

---

**Source code:** `owl_editor.js` → `APEditor._renderBuiltinDetail()`

### REQ-AP-025 — Edit form for a user property

**If** the user selects a user annotation property in the tree,

**Then** the system displays an edit form containing:
- a text field `ap-id` for the local identifier (with `oninput="_sanitizeId(this)"` and `onchange="APEditor._autoSave()"`)
- the full IRI of the property built from `APP.state.ontology.id`
- the label `(instance of owl:AnnotationProperty)`
- existing annotation rows (`rdfs:label`, `rdfs:comment`, others) pre-filled via `_annoRow()`

---

**Source code:** `owl_editor.js` → `APEditor._renderForm()`

### REQ-AP-026 — Adding an annotation row in the form

**If** the user requests the addition of an annotation in a user property form,

**Then** the system adds a new empty row in the `ap-annotations-body` table via `_makeAnnotRow(type, 'APEditor', ac)`, the `type` parameter being `'label'`, `'comment'` or `'other'`, each row triggering `APEditor._autoSave()` on every change.

---

**Source code:** `owl_editor.js` → `APEditor.addAnnotRow()`

### REQ-AP-027 — Super-properties panel with inheritance chain

**If** an annotation property is selected in the tree,

**Then** the system updates the `ap-super-list` panel by reconstructing for each direct parent the complete inheritance chain (via `buildChain()`) recursively up to the root, appending the namespace root (`rdfs:` or `owl:`) at the end of the chain. Each ancestor is displayed with increasing indentation and a clickable navigation link via `APP.navigateTo()`.

---

**Source code:** `owl_editor.js` → `APEditor._updateSuperPanel()`
