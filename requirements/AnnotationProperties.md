# Requirements for the AnnotationProperties Tab — SWOWL

**Date:** 2026-06-06
**Source:** Requirements strictly derived from the source code of `owl_editor.js`
**Note:** Each requirement cites the exact JavaScript function that implements it.

---

## Table of Contents

1. [REQ-AP-001 — Definition of built-in annotation properties](#req-ap-001)
2. [REQ-AP-002 — Detection of built-in vs. user-defined properties](#req-ap-002)
3. [REQ-AP-003 — Building the hierarchical property tree](#req-ap-003)
4. [REQ-AP-004 — Rendering built-in nodes in the tree](#req-ap-004)
5. [REQ-AP-005 — Rendering user-defined nodes in the tree](#req-ap-005)
6. [REQ-AP-006 — Full tree rendering with namespace roots](#req-ap-006)
7. [REQ-AP-007 — Split pane layout](#req-ap-007)
8. [REQ-AP-008 — Left panel resizing by drag-and-drop](#req-ap-008)
9. [REQ-AP-009 — Expanding/collapsing tree nodes](#req-ap-009)
10. [REQ-AP-010 — Selecting a property in the tree](#req-ap-010)
11. [REQ-AP-011 — Managing action button states based on selection](#req-ap-011)
12. [REQ-AP-012 — Displaying the detail view for a namespace root](#req-ap-012)
13. [REQ-AP-013 — Displaying the detail view for a built-in property (read-only)](#req-ap-013)
14. [REQ-AP-014 — Edit form for a user-defined property](#req-ap-014)
15. [REQ-AP-015 — Adding an annotation row in the form](#req-ap-015)
16. [REQ-AP-016 — Automatic generation of a unique identifier](#req-ap-016)
17. [REQ-AP-017 — Creating a child property (sub-property)](#req-ap-017)
18. [REQ-AP-018 — Creating a sibling property (same level)](#req-ap-018)
19. [REQ-AP-019 — Collecting form data](#req-ap-019)
20. [REQ-AP-020 — Automatic save on every change](#req-ap-020)
21. [REQ-AP-021 — Explicit manual save](#req-ap-021)
22. [REQ-AP-022 — Super-properties panel with inheritance chain](#req-ap-022)
23. [REQ-AP-023 — Drag-and-drop to reorganize the hierarchy](#req-ap-023)
24. [REQ-AP-024 — Cycle prevention during drag-and-drop](#req-ap-024)
25. [REQ-AP-025 — Deleting a user-defined property with confirmation](#req-ap-025)
26. [REQ-AP-026 — Collecting annotations (labels, comments, others)](#req-ap-026)
27. [REQ-AP-027 — Annotation property selection picker](#req-ap-027)

---

### REQ-AP-001 — Definition of built-in annotation properties

**Source code:** `owl_editor.js` → `AP_BUILTINS` (object constant)

The `AP_BUILTINS` constant defines two groups of read-only OWL 2 annotation properties: the `rdfs:` group containing `rdfs:label`, `rdfs:comment`, `rdfs:seeAlso`, `rdfs:isDefinedBy`, and the `owl:` group containing `owl:versionInfo`, `owl:deprecated`, `owl:priorVersion`, `owl:backwardCompatibleWith`, `owl:incompatibleWith`. Each entry carries an identifier and a descriptive comment in English.

---

### REQ-AP-002 — Detection of built-in vs. user-defined properties

**Source code:** `owl_editor.js` → `APEditor._isBuiltin()`

The `_isBuiltin(id)` method determines whether a given identifier corresponds to a built-in property by checking its presence in the `AP_BUILTINS['rdfs:']` and `AP_BUILTINS['owl:']` arrays. It returns `true` if the identifier is found in either group.

---

### REQ-AP-003 — Building the hierarchical property tree

**Source code:** `owl_editor.js` → `APEditor._buildUserTree()`

The `_buildUserTree(props)` method builds parent-child relationship maps from the user property array. It produces: `childrenOf` (user→[user children] map), `builtinChildrenOf` (builtin→[user children] map), and `roots` (properties with no parent, sorted alphabetically). Properties whose direct parent is a built-in identifier are placed in `builtinChildrenOf`.

---

### REQ-AP-004 — Rendering built-in nodes in the tree

**Source code:** `owl_editor.js` → `APEditor._renderBuiltinNode()`

The `_renderBuiltinNode(p, childrenOf, builtinChildrenOf, props)` method generates the HTML for a built-in node in the tree. It displays the property identifier, a `built-in` text badge, an expansion indicator if the property has user-defined children, and recursively renders user children via `_renderUserNode()`. The node accepts `ondragover` and `ondrop` events but is not itself `draggable`.

---

### REQ-AP-005 — Rendering user-defined nodes in the tree

**Source code:** `owl_editor.js` → `APEditor._renderUserNode()`

The `_renderUserNode(id, childrenOf, depth, props)` method generates the HTML for a user-defined property node with indentation calculated from the depth (`depth * 16 + 6` pixels). The node is `draggable="true"` and exposes the `ondragstart`, `ondragover`, `ondragleave`, `ondrop`, and `ondragend` handlers. It renders recursively for all children. Expansion state is read from `APEditor._expanded`.

---

### REQ-AP-006 — Full tree rendering with namespace roots

**Source code:** `owl_editor.js` → `APEditor._renderTree()`

The `_renderTree(props)` method composes the full tree: two namespace roots `rdfs:` and `owl:` (displayed only if `APP.getOntologyRootLabels().classRoot === 'owl:Thing'`), and user-defined properties with no known namespace ("orphans") rendered at the root level. Each namespace root is clickable, expandable, and receives drag-over and drop events.

---

### REQ-AP-007 — Split pane layout

**Source code:** `owl_editor.js` → `APEditor.renderSplit()`

The `renderSplit(props)` method generates the full layout of the tab: a left panel (`ap-tree-panel`) containing the tree and the super-properties panel, a resize handle (`ap-split-handle`), and a right detail panel (`ap-detail`). The left panel presents three action buttons: "Child", "Sibling", and "Delete", initially disabled. A prompt message and a "＋ Create Annotation Property" button are displayed in the empty detail panel.

---

### REQ-AP-008 — Left panel resizing by drag-and-drop

**Source code:** `owl_editor.js` → `APEditor._initSplitPane()`

The `_initSplitPane()` method attaches a `mousedown` listener to the `ap-split-handle` handle. During dragging, the width of the `ap-tree-panel` is recalculated in pixels with a minimum of 160 px and a maximum of 520 px. The method also calls `_initHResizers('ap-tree-panel')` for internal horizontal resizing.

---

### REQ-AP-009 — Expanding/collapsing tree nodes

**Source code:** `owl_editor.js` → `APEditor.toggleNode()`

The `toggleNode(id)` method adds or removes the identifier from the internal `Set` `APEditor._expanded`, then triggers a full re-render of the tree via `_renderTree()` and `_highlightSelected()`. The `rdfs:` and `owl:` nodes are pre-expanded at initialization.

---

### REQ-AP-010 — Selecting a property in the tree

**Source code:** `owl_editor.js` → `APEditor.selectProp()`

The `selectProp(id)` method updates `APEditor._selectedId`, refreshes the visual highlight and buttons, then loads the appropriate detail panel: `_renderRootDetail()` for a namespace root, `_renderBuiltinDetail()` for a built-in property, `_renderForm()` for a user-defined property. In all cases, `_updateSuperPanel()` is called to update the super-properties panel.

---

### REQ-AP-011 — Managing action button states based on selection

**Source code:** `owl_editor.js` → `APEditor._updateButtons()`

The `_updateButtons()` method enables or hides the "Child", "Sibling", and "Delete" buttons based on the type of the selected element: if the selection is a namespace root, all buttons are hidden; if it is a built-in property, only "Child" is visible; if it is a user-defined property, "Child", "Sibling", and "Delete" are all visible and enabled.

---

### REQ-AP-012 — Displaying the detail view for a namespace root

**Source code:** `owl_editor.js` → `APEditor._renderRootDetail()`

The `_renderRootDetail(ns)` method generates a read-only detail panel for a namespace root (`rdfs:` or `owl:`). It lists all built-in properties of the namespace with their identifier and descriptive comment. A badge indicates "Namespace root — not an AnnotationProperty".

---

### REQ-AP-013 — Displaying the detail view for a built-in property (read-only)

**Source code:** `owl_editor.js` → `APEditor._renderBuiltinDetail()`

The `_renderBuiltinDetail(id)` method generates a read-only detail panel for a built-in OWL 2 property. It displays the identifier, the descriptive comment from `AP_BUILTINS`, and the italic note "Built-in OWL 2 annotation property — read-only." No edit form is provided.

---

### REQ-AP-014 — Edit form for a user-defined property

**Source code:** `owl_editor.js` → `APEditor._renderForm()`

The `_renderForm(prop)` method generates the edit form for a user-defined property. It contains a text field `ap-id` for the local identifier (with `oninput="_sanitizeId(this)"` and `onchange="APEditor._autoSave()"`), the full IRI of the property built from `APP.state.ontology.id`, and the label `(instance of owl:AnnotationProperty)`. Existing annotation rows (`rdfs:label`, `rdfs:comment`, others) are pre-filled via `_annoRow()`.

---

### REQ-AP-015 — Adding an annotation row in the form

**Source code:** `owl_editor.js` → `APEditor.addAnnotRow()`

The `addAnnotRow(type)` method adds a new empty row to the `ap-annotations-body` table by calling `_makeAnnotRow(type, 'APEditor', ac)`. The `type` parameter can be `'label'`, `'comment'`, or `'other'`. Each created row triggers `APEditor._autoSave()` on every change.

---

### REQ-AP-016 — Automatic generation of a unique identifier

**Source code:** `owl_editor.js` → `APEditor._generatePropName()`

The `_generatePropName()` method generates a unique identifier for a new property. It starts from the string `'NewAnnotationProperty'` and increments a numeric suffix (`NewAnnotationProperty1`, `NewAnnotationProperty2`, ...) until it finds an identifier absent from `APP.state.annotation_properties`.

---

### REQ-AP-017 — Creating a child property (sub-property)

**Source code:** `owl_editor.js` → `APEditor.createChild()`

The `createChild()` method determines the parent from `APEditor._selectedId`. If the selected element is not a namespace root, it is placed in the `subPropertyOf` array of the new property. The parent node is expanded in `APEditor._expanded`. Creation is delegated to `_createAndSelect()`, which calls `API.createAP(prop)` and then refreshes the display.

---

### REQ-AP-018 — Creating a sibling property (same level)

**Source code:** `owl_editor.js` → `APEditor.createSibling()`

The `createSibling()` method retrieves the parents (`subPropertyOf`) of the currently selected property from `APP.state.annotation_properties`, sets them as the parents of the new property, and expands those parents in `APEditor._expanded`. Creation is then delegated to `_createAndSelect()`.

---

### REQ-AP-019 — Collecting form data

**Source code:** `owl_editor.js` → `APEditor._collectForm()`

The `_collectForm()` method reads the identifier from the `ap-id` field (with spaces normalized to `_`), retrieves the existing `subPropertyOf` from `APP.state.annotation_properties` to preserve it (the form does not expose it directly), then calls `_collectAnnotations('ap-annotations-body')` to collect labels, comments, and other annotations.

---

### REQ-AP-020 — Automatic save on every change

**Source code:** `owl_editor.js` → `APEditor._autoSave()`

The `_autoSave()` method is triggered by `onchange` on all form fields. It verifies that the current selection is a user-defined property (not a root, not a built-in), collects data via `_collectForm()`, calls `API.updateAP(id, data)`, detects a potential rename (if `data.id !== id`), then refreshes state and restores the selection via `APP.refresh()` and `APEditor.restoreSelection()`.

---

### REQ-AP-021 — Explicit manual save

**Source code:** `owl_editor.js` → `APEditor.save()`

The `save()` method collects data via `_collectForm()`, validates the identifier via `_validateId()`, calls `API.updateAP()` with the original editing identifier (`_editingId`) or the new identifier, updates `_editingId` and `_selectedId`, expands the saved node, then refreshes the display.

---

### REQ-AP-022 — Super-properties panel with inheritance chain

**Source code:** `owl_editor.js` → `APEditor._updateSuperPanel()`

The `_updateSuperPanel(selectedId)` method updates the `ap-super-list` panel. For each direct parent of the selected property, it rebuilds the full inheritance chain (internal `buildChain()` function) by recursively traversing up to the root, appending the namespace root (`rdfs:` or `owl:`) at the end of the chain. Each ancestor is displayed with increasing indentation and a clickable navigation link via `APP.navigateTo()`.

---

### REQ-AP-023 — Drag-and-drop to reorganize the hierarchy

**Source code:** `owl_editor.js` → `APEditor.onDragStart()`, `APEditor.onDragOver()`, `APEditor.onDrop()`

`onDragStart(event, id)` initializes the drag by storing the identifier in `APEditor._dragId` and using `event.dataTransfer`. `onDragOver(event, targetId)` allows dropping onto valid targets. `onDrop(event, targetId)` recalculates the new `subPropertyOf`: if the target is a namespace root, `subPropertyOf` becomes `[]`; otherwise, `subPropertyOf = [targetId]`. The update is persisted via `API.updateAP()`.

---

### REQ-AP-024 — Cycle prevention during drag-and-drop

**Source code:** `owl_editor.js` → `APEditor._isDescendant()`, `APEditor.onDragOver()`

The `_isDescendant(potentialDesc, ancestorId)` method recursively traverses the `childrenOf` tree to determine whether `potentialDesc` is a descendant of `ancestorId`. In `onDragOver()`, if the target is a descendant of the dragged property, the drop is refused (`event.preventDefault()` is not called).

---

### REQ-AP-025 — Deleting a user-defined property with confirmation

**Source code:** `owl_editor.js` → `APEditor.deleteSelected()`

The `deleteSelected()` method blocks deletion if the selection is a root or a built-in property. It displays a confirmation dialog via `UI.confirm()` with the message `"Delete annotation property <strong>${id}</strong>?"`. Upon confirmation, it calls `API.deleteAP(id)`, resets `_selectedId` to `null`, refreshes state via `APP.refresh()`, resets the detail panel with the empty prompt message, and redraws the tree.

---

### REQ-AP-026 — Collecting annotations (labels, comments, others)

**Source code:** `owl_editor.js` → `_collectAnnotations()`

The global `_collectAnnotations(tbodyId)` function iterates over all `.anno-row` CSS rows in the table identified by `tbodyId`. For each non-empty row, it reads the value (`.anno-value`) and the language (`.anno-lang-inp`), then classifies the entry into `labels`, `comments`, or `other` based on `row.dataset.type`. For `'other'` rows, the target property is read from `row.dataset.prop`.

---

### REQ-AP-027 — Annotation property selection picker

**Source code:** `owl_editor.js` → `_annoPickerItems()`

The global `_annoPickerItems(editorName)` function generates the HTML for the annotation property selector (picker) available in the forms of all editors (including `APEditor`). It calls `APEditor._buildUserTree()` to obtain the user-defined property hierarchy, then renders a clickable tree composed of built-ins (`AP_BUILTINS`) and user-defined properties. Clicking an item calls `<editorName>.addOtherAnnotRow(id)`.

---

*Document generated by claude-sonnet-4-6*
