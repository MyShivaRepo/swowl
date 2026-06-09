# Requirements — Hierarchy Tree Management

> Generated on 2026-06-09 | Strictly derived from source code | No hallucination

## Scope

This document describes the **tree management functions** common to the five hierarchical tabs of SWOWL:

| Tree | JS Editor | Entities |
|---|---|---|
| Classes | `ClassEditor` | OWL Classes (`owl:Class`) |
| ObjectProperties | `OPEditor` | Object properties (`owl:ObjectProperty`) |
| DatatypeProperties | `DPEditor` | Datatype properties (`owl:DatatypeProperty`) |
| AnnotationProperties | `APEditor` | Annotation properties (`owl:AnnotationProperty`) |
| Individuals | `IndividualEditor` | OWL Individuals (`owl:NamedIndividual`) |

> **Note:** Individuals form a flat (non-hierarchical) list — structural functions (expansion, drag-and-drop, cascade deletion) do not apply or apply in a reduced form. Differences are noted in each requirement.

---

## Table of Contents

### Selection
- [REQ-HM-001 — Single node selection](#req-hm-001--single-node-selection)
- [REQ-HM-002 — Multi-selection via Shift+Click (range)](#req-hm-002--multi-selection-via-shiftclick-range)
- [REQ-HM-003 — Deselection by clicking in empty space](#req-hm-003--deselection-by-clicking-in-empty-space)
- [REQ-HM-004 — Selection anchor persistence](#req-hm-004--selection-anchor-persistence)

### Drag & Drop
- [REQ-HM-005 — Moving a node by drag-and-drop (single)](#req-hm-005--moving-a-node-by-drag-and-drop-single)
- [REQ-HM-006 — Moving a multi-selection by drag-and-drop](#req-hm-006--moving-a-multi-selection-by-drag-and-drop)
- [REQ-HM-007 — Blocking drop on self or descendants](#req-hm-007--blocking-drop-on-self-or-descendants)
- [REQ-HM-008 — Restoring root level (drop outside any node)](#req-hm-008--restoring-root-level-drop-outside-any-node)

### Deletion
- [REQ-HM-009 — Deleting the current selection](#req-hm-009--deleting-the-current-selection)
- [REQ-HM-010 — Cascade deletion of descendants](#req-hm-010--cascade-deletion-of-descendants)
- [REQ-HM-011 — Confirmation before deletion](#req-hm-011--confirmation-before-deletion)

### Context Menu (right-click)
- [REQ-HM-012 — Opening the context menu on a node](#req-hm-012--opening-the-context-menu-on-a-node)
- [REQ-HM-013 — "Add Child" action from the context menu](#req-hm-013--add-child-action-from-the-context-menu)
- [REQ-HM-014 — "Add Sibling" action from the context menu](#req-hm-014--add-sibling-action-from-the-context-menu)
- [REQ-HM-015 — "Delete" action from the context menu](#req-hm-015--delete-action-from-the-context-menu)
- [REQ-HM-016 — Automatic repositioning of off-screen menu](#req-hm-016--automatic-repositioning-of-off-screen-menu)
- [REQ-HM-017 — Closing the context menu](#req-hm-017--closing-the-context-menu)

### Creation
- [REQ-HM-018 — Creating a child node](#req-hm-018--creating-a-child-node)
- [REQ-HM-019 — Creating a sibling node](#req-hm-019--creating-a-sibling-node)

### Toolbar buttons
- [REQ-HM-020 — Button enable/disable based on selection state](#req-hm-020--button-enabledisable-based-on-selection-state)

---

## 1. Selection

### REQ-HM-001 — Single node selection

| **If** | the ontologist clicks on a tree node without holding Shift, |
|---|---|
| **Then** | that node becomes the only selected node; any previously selected node is deselected. The clicked node becomes the anchor for subsequent Shift+Click selections. The navigation history is updated (except during programmatic navigation). |

**Applicability:** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓

**Source code:** `owl_editor.js`
- `ClassEditor.selectClass(id, evtOrHist)` — when `isShift` is `false`, resets `_selectedIds = new Set([id])` and `_anchorId = id`
- Same pattern in `OPEditor.selectOP()`, `DPEditor.selectDP()`, `APEditor.selectAP()`, `IndividualEditor.selectIndividual()`

---

### REQ-HM-002 — Multi-selection via Shift+Click (range)

| **If** | the ontologist clicks a node while holding Shift, and a selection anchor is already defined, |
|---|---|
| **Then** | all visible nodes in the tree between the anchor and the clicked node (inclusive, in DOM display order) are added to the current selection. The anchor remains unchanged. |

| **If** | no anchor is defined at the time of the Shift+Click, |
|---|---|
| **Then** | the clicked node is simply added to the selection (fallback behaviour). |

**Applicability:** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓

**Source code:** `owl_editor.js`
```javascript
// Common pattern (ClassEditor shown):
const isShift = evtOrHist?.shiftKey ?? false;
if (isShift && this._anchorId) {
    const items = [...document.querySelectorAll('#class-tree .tree-item[data-id]')];
    const ids   = items.map(el => el.dataset.id);
    const from  = ids.indexOf(this._anchorId);
    const to    = ids.indexOf(id);
    const [lo, hi] = from < to ? [from, to] : [to, from];
    this._selectedIds = new Set(ids.slice(lo, hi + 1));
}
```

---

### REQ-HM-003 — Deselection by clicking in empty space

| **If** | the ontologist clicks in the empty space of a tree panel (area with no node), outside any item, context menu, or button, |
|---|---|
| **Then** | the current selection is entirely cleared (`_selectedIds` empty, `_anchorId` set to `null`), and the visual highlight (`selected`) is removed from all nodes. |

**Applicability:** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓

**Source code:** `owl_editor.js` → `_installDeselectListener()` (present in each editor)
- `mousedown` listener installed in capture phase on `document`
- Early return (`return`) if the click touches `.tree-item[data-id]`, `.tree-root-item`, `.tree-toggle`, the context menu (`#*-ctx-menu`), or a button (`.btn-icon`, `.btn-sm`)
- In all other cases: clears `_selectedIds`, resets `_anchorId = null`, removes the `selected` CSS class from all nodes

---

### REQ-HM-004 — Selection anchor persistence

| **If** | the ontologist performs a single selection or a Shift+Click selection, |
|---|---|
| **Then** | the identifier of the first selected node (or the node targeted by the simple click) is stored as the anchor (`_anchorId`). This anchor serves as the starting point for any subsequent range selection via Shift+Click. The anchor is reset on deselection or single click. |

**Applicability:** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓

**Source code:** `owl_editor.js` — field `_anchorId` (or `_anchorIndId` for `IndividualEditor`) in each editor.

---

## 2. Drag & Drop

> **Individuals note:** The Individuals list is flat — drag-and-drop is not implemented for it.

### REQ-HM-005 — Moving a node by drag-and-drop (single)

| **If** | the ontologist starts dragging a node that does not belong to the current selection, |
|---|---|
| **Then** | the selection is reset to that single node, and only that node is moved. When the drag ends, the node is attached to the target node as a child (via `subClassOf` / `subPropertyOf`). |

**Applicability:** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✗

**Source code:** `owl_editor.js` → `ClassEditor.onDragStart(event, id)` / `OPEditor.onDragStart()` / `DPEditor.onDragStart()` / `APEditor.onDragStart()`

---

### REQ-HM-006 — Moving a multi-selection by drag-and-drop

| **If** | the ontologist starts dragging a node that is part of a multi-selection (`_selectedIds.size > 1`), |
|---|---|
| **Then** | all nodes in the selection are moved in a single operation to the target node. Each selected node receives the CSS class `dragging` during the drag. When the drop completes, the API is called sequentially for each moved node. |

**Applicability:** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✗

**Source code:** `owl_editor.js` → `onDrop(event, targetId)`
```javascript
const dragIds = this._selectedIds.size > 0 ? [...this._selectedIds] : [this._dragId];
for (const draggedId of dragIds) { await API.updateClass(draggedId, ...); }
```

---

### REQ-HM-007 — Blocking drop on self or descendants

| **If** | the ontologist hovers over a target node during a drag, and that node is part of the current drag selection **or** is a descendant of one of the dragged nodes, |
|---|---|
| **Then** | the drop is forbidden on that target node (no `dragover` visual effect, drop ignored). This prevents cycles from being introduced in the hierarchy. |

**Applicability:** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✗

**Source code:** `owl_editor.js` → `onDragOver(event, targetId)`
```javascript
if (this._selectedIds.has(targetId)) return;
if ([...this._selectedIds].some(sid => this._isDescendant(targetId, sid))) return;
```

---

### REQ-HM-008 — Restoring root level (drop outside any node)

| **If** | the ontologist drops one or more nodes onto the root area of the tree (outside any node — `targetId = null`), |
|---|---|
| **Then** | the moved nodes are attached to the ontology root (all `subClassOf` / `subPropertyOf` relationships are removed), making them top-level nodes. |

**Applicability:** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✗

**Source code:** `owl_editor.js` → `onDrop(event, null)` — `targetId` is `null` when the drop is triggered on the root container (`ondrop` of `.tree-root-item`).

---

## 3. Deletion

### REQ-HM-009 — Deleting the current selection

| **If** | the ontologist clicks the "Delete" button in the toolbar or chooses "Delete" from the context menu, |
|---|---|
| **Then** | all nodes in the current selection (`_selectedIds`) are deleted. If the selection is empty, the action has no effect. |

**Applicability:** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓

**Source code:** `owl_editor.js` → `ClassEditor.deleteSelected()` / `OPEditor.deleteSelected()` / `DPEditor.deleteSelected()` / `APEditor.deleteSelected()` / `IndividualEditor.deleteSelected()`

---

### REQ-HM-010 — Cascade deletion of descendants

| **If** | the ontologist deletes a node that has descendants (sub-classes or sub-properties), |
|---|---|
| **Then** | all direct and transitive descendants are also deleted. The complete list of deleted identifiers (parent node + descendants) is returned by the backend (`{"deleted": [...]}`) and used to update the client-side state. |

**Applicability:** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✗ *(flat list)*

**Source code:**
- **Backend** `main.py` → `_collect_prop_descendants(prop_list, prop_id)` — recursively traverses the `subPropertyOf` hierarchy via BFS, collecting all descendants into a `set`. Same approach for classes via `subClassOf`.
- **Frontend** → the `{"deleted": [...]}` response is used to clean `APP.state` in a single pass.

---

### REQ-HM-011 — Confirmation before deletion

| **If** | the ontologist requests the deletion of one or more nodes, |
|---|---|
| **Then** | a confirmation dialog is displayed before any deletion is performed. It indicates the number of nodes to be deleted and, if descendants are involved, their count. Deletion is only executed after explicit confirmation by the ontologist. |

**Applicability:** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓

**Source code:** `owl_editor.js` → in each `deleteSelected()`, a call to `APP.confirm(message)` precedes the API call. Example messages:
- *Multi-selection:* `"Delete <strong>N</strong> classes?"` / `"Delete <strong>N</strong> object properties?"`
- *Deletion with descendants:* `"Delete <strong>id</strong> and its N child class(es)?"`

---

## 4. Context Menu (right-click)

### REQ-HM-012 — Opening the context menu on a node

| **If** | the ontologist right-clicks (`contextmenu`) on a tree node, |
|---|---|
| **Then** | a context menu (`ctx-menu`) appears at the cursor position. If the right-clicked node does not belong to the current selection, the selection is reset to that single node before displaying the menu. |

**Applicability:** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓

**Source code:** `owl_editor.js` → `showContextMenu(event, id)` in each editor — dynamically creates a `<div class="ctx-menu">` inserted into `document.body`.

---

### REQ-HM-013 — "Add Child" action from the context menu

| **If** | the context menu is opened on a node or on the root area, |
|---|---|
| **Then** | the "Add Child Class / Property" option is available. It creates a new child node under the selected node (or a root-level node if no node is selected). |

**Applicability:** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✗ *(flat list — creation via dedicated button only)*

**Source code:** `owl_editor.js` — in the context menu HTML of each editor:
```html
<div class="ctx-item" onclick="ClassEditor._closeContextMenu();ClassEditor.createChild()">
    ＋ Add Child Class</div>
```

---

### REQ-HM-014 — "Add Sibling" action from the context menu

| **If** | the context menu is opened on a (non-root) node, |
|---|---|
| **Then** | the "Add Sibling Class / Property" option is available. It creates a new node at the same hierarchical level as the selected node. |

**Applicability:** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✗

**Source code:** `owl_editor.js` — in the context menu HTML of each editor:
```html
<div class="ctx-item" onclick="ClassEditor._closeContextMenu();ClassEditor.createSibling()">
    ＋ Add Sibling Class</div>
```

---

### REQ-HM-015 — "Delete" action from the context menu

| **If** | the context menu is opened on one or more selected nodes, |
|---|---|
| **Then** | the "Delete" option is available, displayed in red (`ctx-danger`). Its label indicates the number of nodes to be deleted when the selection is multiple (e.g. "Delete Classes (3)"). Triggering this action calls `deleteSelected()` with confirmation. |

**Applicability:** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓

**Source code:** `owl_editor.js` — dynamic label in `showContextMenu()`:
```javascript
const deleteLabel = n > 1 ? `Delete Classes <strong>(${n})</strong>` : `Delete Class`;
// ...
<div class="ctx-item ctx-danger" onclick="ClassEditor._closeContextMenu();ClassEditor.deleteSelected()">
    ${deleteLabel}</div>
```

---

### REQ-HM-016 — Automatic repositioning of off-screen menu

| **If** | the generated context menu overflows the right or bottom edge of the browser window, |
|---|---|
| **Then** | its position is automatically adjusted to remain fully visible within the window, by shifting `left` to the left or `top` upwards respectively. |

**Applicability:** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓

**Source code:** `owl_editor.js` → in each `showContextMenu()`, after DOM insertion:
```javascript
requestAnimationFrame(() => {
    const r = menu.getBoundingClientRect();
    if (r.right  > window.innerWidth)  menu.style.left = (event.clientX - r.width)  + 'px';
    if (r.bottom > window.innerHeight) menu.style.top  = (event.clientY - r.height) + 'px';
});
```

---

### REQ-HM-017 — Closing the context menu

| **If** | the ontologist clicks outside the open context menu, |
|---|---|
| **Then** | the menu is immediately removed from the DOM. The menu is also automatically closed when a menu action is executed or when a new context menu is requested. |

**Applicability:** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓

**Source code:** `owl_editor.js` → `_closeContextMenu()` in each editor — removes the `#*-ctx-menu` element from the DOM. A `click` listener on `document` (in capture mode) is installed when the menu opens to trigger closure on an outside click.

---

## 5. Node creation

### REQ-HM-018 — Creating a child node

| **If** | the ontologist clicks the "Add Child" button (toolbar or context menu), |
|---|---|
| **Then** | a new node is created as a direct child of the selected node (a `subClassOf` / `subPropertyOf` relationship pointing to the parent). If no node is selected or the root `owl:Thing` is selected, the node is created without a parent (top-level node). The new node is immediately selected and highlighted in the tree. |

**Applicability:** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✗ *(creation via "New Individual" button)*

**Source code:** `owl_editor.js` → `ClassEditor.createChild()` / `OPEditor.createChild()` / `DPEditor.createChild()` / `APEditor.createChild()`

---

### REQ-HM-019 — Creating a sibling node

| **If** | the ontologist clicks the "Add Sibling" button (toolbar or context menu) and a node is selected, |
|---|---|
| **Then** | a new node is created at the same hierarchical level as the selected node, inheriting the same parent(s) (`subClassOf` / `subPropertyOf`). The new node is immediately selected. |

**Applicability:** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✗

**Source code:** `owl_editor.js` → `ClassEditor.createSibling()` / `OPEditor.createSibling()` / `DPEditor.createSibling()` / `APEditor.createSibling()`

---

## 6. Toolbar buttons

### REQ-HM-020 — Button enable/disable based on selection state

| **If** | the selection in the tree changes (single selection, multi-selection, or deselection), |
|---|---|
| **Then** | the toolbar buttons are updated accordingly: |

| Selection state | "Add Child" button | "Add Sibling" button | "Delete" button |
|---|---|---|---|
| No node selected | Enabled (creates at root) | Disabled | Hidden (`visibility:hidden`) |
| 1 node selected | Enabled | Enabled | Enabled and visible |
| Multiple nodes selected | Disabled | Disabled | Enabled and visible |

**Applicability:** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓ *(adapted — no Child/Sibling buttons)*

**Source code:** `owl_editor.js` → `_updateButtons()` (or `_setDelBtn()` for `IndividualEditor`) in each editor, called after every selection change.

---

## Appendix — Applicability summary

| Feature | Classes | OPs | DPs | APs | Individuals |
|---|:---:|:---:|:---:|:---:|:---:|
| Single selection | ✓ | ✓ | ✓ | ✓ | ✓ |
| Shift+Click multi-selection | ✓ | ✓ | ✓ | ✓ | ✓ |
| Deselection on empty space | ✓ | ✓ | ✓ | ✓ | ✓ |
| Selection anchor | ✓ | ✓ | ✓ | ✓ | ✓ |
| Drag & drop (single) | ✓ | ✓ | ✓ | ✓ | — |
| Drag & drop (multi-selection) | ✓ | ✓ | ✓ | ✓ | — |
| Cycle prevention | ✓ | ✓ | ✓ | ✓ | — |
| Drop to root | ✓ | ✓ | ✓ | ✓ | — |
| Delete selection | ✓ | ✓ | ✓ | ✓ | ✓ |
| Cascade deletion | ✓ | ✓ | ✓ | ✓ | — |
| Confirmation before delete | ✓ | ✓ | ✓ | ✓ | ✓ |
| Context menu (right-click) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Ctx: Add Child | ✓ | ✓ | ✓ | ✓ | — |
| Ctx: Add Sibling | ✓ | ✓ | ✓ | ✓ | — |
| Ctx: Delete | ✓ | ✓ | ✓ | ✓ | ✓ |
| Off-screen menu repositioning | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create child node | ✓ | ✓ | ✓ | ✓ | — |
| Create sibling node | ✓ | ✓ | ✓ | ✓ | — |
| Adaptive toolbar buttons | ✓ | ✓ | ✓ | ✓ | ✓ |
