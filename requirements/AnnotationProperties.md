# Requirements — AnnotationProperties

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-AP-001 — Definition of built-in annotation properties](#req-ap-001--definition-of-built-in-annotation-properties)
- [REQ-AP-002 — Detection of built-in vs. user-defined properties](#req-ap-002--detection-of-built-in-vs-user-defined-properties)
- [REQ-AP-003 — Construction of the hierarchical property tree](#req-ap-003--construction-of-the-hierarchical-property-tree)
- [REQ-AP-004 — Automatic generation of a unique identifier](#req-ap-004--automatic-generation-of-a-unique-identifier)
- [REQ-AP-005 — Creation of a child property (sub-property)](#req-ap-005--creation-of-a-child-property-sub-property)
- [REQ-AP-006 — Creation of a sibling property (same level)](#req-ap-006--creation-of-a-sibling-property-same-level)
- [REQ-AP-007 — Form data collection](#req-ap-007--form-data-collection)
- [REQ-AP-008 — Automatic save on every change](#req-ap-008--automatic-save-on-every-change)
- [REQ-AP-009 — Explicit manual save](#req-ap-009--explicit-manual-save)
- [REQ-AP-010 — Drag-and-drop to reorganize the hierarchy](#req-ap-010--drag-and-drop-to-reorganize-the-hierarchy)
- [REQ-AP-011 — Cycle prevention during drag-and-drop](#req-ap-011--cycle-prevention-during-drag-and-drop)
- [REQ-AP-012 — Deletion of a user-defined property with confirmation](#req-ap-012--deletion-of-a-user-defined-property-with-confirmation)
- [REQ-AP-013 — Collection of annotations (labels, comments, others)](#req-ap-013--collection-of-annotations-labels-comments-others)
- [REQ-AP-014 — Annotation property selection picker](#req-ap-014--annotation-property-selection-picker)

### Form
- [REQ-AP-015 — Rendering of built-in nodes in the tree](#req-ap-015--rendering-of-built-in-nodes-in-the-tree)
- [REQ-AP-016 — Rendering of user-defined nodes in the tree](#req-ap-016--rendering-of-user-defined-nodes-in-the-tree)
- [REQ-AP-017 — Full tree rendering with namespace roots](#req-ap-017--full-tree-rendering-with-namespace-roots)
- [REQ-AP-018 — Split pane layout](#req-ap-018--split-pane-layout)
- [REQ-AP-019 — Left panel resizing by drag-and-drop](#req-ap-019--left-panel-resizing-by-drag-and-drop)
- [REQ-AP-020 — Expanding/collapsing tree nodes](#req-ap-020--expandingcollapsing-tree-nodes)
- [REQ-AP-021 — Selecting a property in the tree](#req-ap-021--selecting-a-property-in-the-tree)
- [REQ-AP-022 — Action button state management based on selection](#req-ap-022--action-button-state-management-based-on-selection)
- [REQ-AP-023 — Detail view of a namespace root](#req-ap-023--detail-view-of-a-namespace-root)
- [REQ-AP-024 — Detail view of a built-in property (read-only)](#req-ap-024--detail-view-of-a-built-in-property-read-only)
- [REQ-AP-025 — Edit form for a user-defined property](#req-ap-025--edit-form-for-a-user-defined-property)
- [REQ-AP-026 — Adding an annotation row in the form](#req-ap-026--adding-an-annotation-row-in-the-form)
- [REQ-AP-027 — Super-properties panel with inheritance chain](#req-ap-027--super-properties-panel-with-inheritance-chain)

---

## 1. Substance — Business logic and functional rules

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviors, validations, persistence.


### REQ-AP-001 — Definition of built-in annotation properties
The `AP_BUILTINS` constant defines two groups of read-only OWL 2 annotation properties: the `rdfs:` group containing `rdfs:label`, `rdfs:comment`, `rdfs:seeAlso`, `rdfs:isDefinedBy`, and the `owl:` group containing `owl:versionInfo`, `owl:deprecated`, `owl:priorVersion`, `owl:backwardCompatibleWith`, `owl:incompatibleWith`. Each entry carries an identifier and a descriptive comment in English.

---

**Source code:** `owl_editor.js` → `AP_BUILTINS` (object constant)

### REQ-AP-002 — Detection of built-in vs. user-defined properties
The `_isBuiltin(id)` method determines whether a given identifier corresponds to a built-in property by checking its presence in the `AP_BUILTINS['rdfs:']` and `AP_BUILTINS['owl:']` arrays. It returns `true` if the identifier is found in either group.

---

**Source code:** `owl_editor.js` → `APEditor._isBuiltin()`

### REQ-AP-003 — Construction of the hierarchical property tree
The `_buildUserTree(props)` method builds parent-child relationship maps from the user property array. It produces: `childrenOf` (map user→[user children]), `builtinChildrenOf` (map builtin→[user children]) and `roots` (properties with no parent, sorted alphabetically). Properties whose direct parent is a built-in identifier are placed in `builtinChildrenOf`.

---

**Source code:** `owl_editor.js` → `APEditor._buildUserTree()`

### REQ-AP-004 — Automatic generation of a unique identifier
The `_generatePropName()` method generates a unique identifier for a new property. It starts from the string `'NewAnnotationProperty'` and increments a numeric suffix (`NewAnnotationProperty1`, `NewAnnotationProperty2`, …) until it finds an identifier absent from `APP.state.annotation_properties`.

---

**Source code:** `owl_editor.js` → `APEditor._generatePropName()`

### REQ-AP-005 — Creation of a child property (sub-property)
The `createChild()` method determines the parent from `APEditor._selectedId`. If the selected node is not a namespace root, it is placed in the `subPropertyOf` array of the new property. The parent node is expanded in `APEditor._expanded`. Creation is delegated to `_createAndSelect()`, which calls `API.createAP(prop)` and then refreshes the display.

---

**Source code:** `owl_editor.js` → `APEditor.createChild()`

### REQ-AP-006 — Creation of a sibling property (same level)
The `createSibling()` method retrieves the parents (`subPropertyOf`) of the currently selected property from `APP.state.annotation_properties`, sets them as parents of the new property, and expands those parents in `APEditor._expanded`. Creation is then delegated to `_createAndSelect()`.

---

**Source code:** `owl_editor.js` → `APEditor.createSibling()`

### REQ-AP-007 — Form data collection
The `_collectForm()` method reads the identifier from the `ap-id` field (with space-to-`_` normalisation), retrieves the existing `subPropertyOf` from `APP.state.annotation_properties` to preserve it (the form does not expose it directly), then calls `_collectAnnotations('ap-annotations-body')` to collect labels, comments and other annotations.

---

**Source code:** `owl_editor.js` → `APEditor._collectForm()`

### REQ-AP-008 — Automatic save on every change
The `_autoSave()` method is triggered by `onchange` on all form fields. It verifies that the current selection is a user-defined property (not a root, not a built-in), collects data via `_collectForm()`, calls `API.updateAP(id, data)`, detects a possible rename (if `data.id !== id`), then refreshes state and restores selection via `APP.refresh()` and `APEditor.restoreSelection()`.

---

**Source code:** `owl_editor.js` → `APEditor._autoSave()`

### REQ-AP-009 — Explicit manual save
The `save()` method collects data via `_collectForm()`, validates the identifier via `_validateId()`, calls `API.updateAP()` with the original editing identifier (`_editingId`) or the new identifier, updates `_editingId` and `_selectedId`, expands the saved node, then refreshes the display.

---

**Source code:** `owl_editor.js` → `APEditor.save()`

### REQ-AP-010 — Drag-and-drop to reorganize the hierarchy
`onDragStart(event, id)` initialises the drag by storing the identifier in `APEditor._dragId` and using `event.dataTransfer`. `onDragOver(event, targetId)` allows dropping onto valid targets. `onDrop(event, targetId)` recalculates the new `subPropertyOf`: if the target is a namespace root, `subPropertyOf` becomes `[]`; otherwise, `subPropertyOf = [targetId]`. The update is persisted via `API.updateAP()`.

---

**Source code:** `owl_editor.js` → `APEditor.onDragStart()` | `APEditor.onDragOver()` | `APEditor.onDrop()`

### REQ-AP-011 — Cycle prevention during drag-and-drop
The `_isDescendant(potentialDesc, ancestorId)` method recursively traverses the `childrenOf` tree to determine whether `potentialDesc` is a descendant of `ancestorId`. In `onDragOver()`, if the target is a descendant of the dragged property, the drop is refused (`event.preventDefault()` is not called).

---

**Source code:** `owl_editor.js` → `APEditor._isDescendant()` | `APEditor.onDragOver()`

### REQ-AP-012 — Deletion of a user-defined property with confirmation
The `deleteSelected()` method blocks deletion if the selection is a root or a built-in property. It displays a confirmation dialog via `UI.confirm()` with the message `"Delete annotation property <strong>${id}</strong>?"`. Upon confirmation, it calls `API.deleteAP(id)`, resets `_selectedId` to `null`, refreshes state via `APP.refresh()`, reinitialises the detail panel with the empty prompt message, and redraws the tree.

---

**Source code:** `owl_editor.js` → `APEditor.deleteSelected()`

### REQ-AP-013 — Collection of annotations (labels, comments, others)
The global function `_collectAnnotations(tbodyId)` iterates over all CSS `.anno-row` rows of the table identified by `tbodyId`. For each non-empty row, it reads the value (`.anno-value`) and the language (`.anno-lang-inp`), then classifies the entry into `labels`, `comments` or `other` based on `row.dataset.type`. For `'other'` rows, the target property is read from `row.dataset.prop`.

---

**Source code:** `owl_editor.js` → `_collectAnnotations()`

### REQ-AP-014 — Annotation property selection picker
The global function `_annoPickerItems(editorName)` generates the HTML for the annotation property picker available in the forms of all editors (including `APEditor`). It calls `APEditor._buildUserTree()` to obtain the user property hierarchy, then renders a clickable tree composed of built-ins (`AP_BUILTINS`) and user-defined properties. Clicking an item calls `<editorName>.addOtherAnnotRow(id)`.

---

**Source code:** `owl_editor.js` → `_annoPickerItems()`

## 2. Form — Presentation and user interface

> Requirements related to display: layout, visual components, interactions, navigation, styles.

### REQ-AP-015 — Rendering of built-in nodes in the tree
The `_renderBuiltinNode(p, childrenOf, builtinChildrenOf, props)` method generates the HTML for a built-in node in the tree. It displays the property identifier, a `built-in` text badge, an expansion indicator if the property has user children, and recursively renders user children via `_renderUserNode()`. The node accepts `ondragover` and `ondrop` events but is not itself `draggable`.

---

**Source code:** `owl_editor.js` → `APEditor._renderBuiltinNode()`

### REQ-AP-016 — Rendering of user-defined nodes in the tree
The `_renderUserNode(id, childrenOf, depth, props)` method generates the HTML for a user-defined property node with indentation calculated from depth (`depth * 16 + 6` pixels). The node is `draggable="true"` and exposes the `ondragstart`, `ondragover`, `ondragleave`, `ondrop`, `ondragend` handlers. It renders recursively for all children. Expansion state is read from `APEditor._expanded`.

---

**Source code:** `owl_editor.js` → `APEditor._renderUserNode()`

### REQ-AP-017 — Full tree rendering with namespace roots
The `_renderTree(props)` method composes the full tree: two namespace roots `rdfs:` and `owl:` (displayed only when `APP.getOntologyRootLabels().classRoot === 'owl:Thing'`), user properties with no known namespace ("orphans") rendered at the root level. Each namespace root is clickable, expandable, and receives drag-over and drop events.

---

**Source code:** `owl_editor.js` → `APEditor._renderTree()`

### REQ-AP-018 — Split pane layout
The `renderSplit(props)` method generates the complete tab layout: a left panel (`ap-tree-panel`) containing the tree and the super-properties panel, a resize handle (`ap-split-handle`), and a right detail panel (`ap-detail`). The left panel presents three action buttons: "Child", "Sibling" and "Delete", initially disabled. A prompt message and a "＋ Create Annotation Property" button are displayed in the empty detail panel.

---

**Source code:** `owl_editor.js` → `APEditor.renderSplit()`

### REQ-AP-019 — Left panel resizing by drag-and-drop
The `_initSplitPane()` method attaches a `mousedown` listener on the `ap-split-handle` handle. During dragging, the width of the `ap-tree-panel` panel is recalculated in pixels with a minimum of 160 px and a maximum of 520 px. The method also calls `_initHResizers('ap-tree-panel')` for internal horizontal resizing.

---

**Source code:** `owl_editor.js` → `APEditor._initSplitPane()`

### REQ-AP-020 — Expanding/collapsing tree nodes
The `toggleNode(id)` method adds or removes the identifier from the internal `Set` `APEditor._expanded`, then triggers a full redraw of the tree via `_renderTree()` and `_highlightSelected()`. The `rdfs:` and `owl:` nodes are pre-expanded at initialisation.

---

**Source code:** `owl_editor.js` → `APEditor.toggleNode()`

### REQ-AP-021 — Selecting a property in the tree
The `selectProp(id)` method updates `APEditor._selectedId`, refreshes the visual highlight and the buttons, then loads the appropriate detail panel: `_renderRootDetail()` for a namespace root, `_renderBuiltinDetail()` for a built-in property, `_renderForm()` for a user-defined property. In all cases, `_updateSuperPanel()` is called to update the super-properties panel.

---

**Source code:** `owl_editor.js` → `APEditor.selectProp()`

### REQ-AP-022 — Action button state management based on selection
The `_updateButtons()` method enables or hides the "Child", "Sibling" and "Delete" buttons according to the type of the selected element: if the selection is a namespace root, all buttons are hidden; if it is a built-in property, only "Child" is visible; if it is a user-defined property, "Child", "Sibling" and "Delete" are all visible and enabled.

---

**Source code:** `owl_editor.js` → `APEditor._updateButtons()`

### REQ-AP-023 — Detail view of a namespace root
The `_renderRootDetail(ns)` method generates a read-only detail panel for a namespace root (`rdfs:` or `owl:`). It lists all built-in properties of the namespace with their identifier and descriptive comment. A badge indicates "Namespace root — not an AnnotationProperty".

---

**Source code:** `owl_editor.js` → `APEditor._renderRootDetail()`

### REQ-AP-024 — Detail view of a built-in property (read-only)
The `_renderBuiltinDetail(id)` method generates a read-only detail panel for an OWL 2 built-in property. It displays the identifier, the descriptive comment from `AP_BUILTINS`, and the italic mention "Built-in OWL 2 annotation property — read-only." No edit form is provided.

---

**Source code:** `owl_editor.js` → `APEditor._renderBuiltinDetail()`

### REQ-AP-025 — Edit form for a user-defined property
The `_renderForm(prop)` method generates the edit form for a user-defined property. It contains a text field `ap-id` for the local identifier (with `oninput="_sanitizeId(this)"` and `onchange="APEditor._autoSave()"`), the full IRI of the property built from `APP.state.ontology.id`, and the label `(instance of owl:AnnotationProperty)`. Existing annotation rows (`rdfs:label`, `rdfs:comment`, others) are pre-filled via `_annoRow()`.

---

**Source code:** `owl_editor.js` → `APEditor._renderForm()`

### REQ-AP-026 — Adding an annotation row in the form
The `addAnnotRow(type)` method adds a new empty row to the `ap-annotations-body` table by calling `_makeAnnotRow(type, 'APEditor', ac)`. The `type` parameter can be `'label'`, `'comment'` or `'other'`. Each created row triggers `APEditor._autoSave()` on every change.

---

**Source code:** `owl_editor.js` → `APEditor.addAnnotRow()`

### REQ-AP-027 — Super-properties panel with inheritance chain
The `_updateSuperPanel(selectedId)` method updates the `ap-super-list` panel. For each direct parent of the selected property, it reconstructs the full inheritance chain (internal function `buildChain()`) by recursively traversing up to the root, appending the namespace root (`rdfs:` or `owl:`) at the end of the chain. Each ancestor is displayed with increasing indentation and a clickable navigation link via `APP.navigateTo()`.

---

**Source code:** `owl_editor.js` → `APEditor._updateSuperPanel()`
