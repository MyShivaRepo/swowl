# Requirements for the SwrlRules Tab — SWOWL Application

**Date:** 2026-06-06
**Note:** Requirements strictly derived from the source code (`frontend/js/swrl_editor.js`)

---

## Table of Contents

1. [REQ-SWR-001 — Two-panel interface layout](#req-swr-001-two-panel-interface-layout)
2. [REQ-SWR-002 — List panel resizing](#req-swr-002-list-panel-resizing)
3. [REQ-SWR-003 — Display of the SWRL rules list](#req-swr-003-display-of-the-swrl-rules-list)
4. [REQ-SWR-004 — Visual indicator for broken references](#req-swr-004-visual-indicator-for-broken-references)
5. [REQ-SWR-005 — Rule search/filtering](#req-swr-005-rule-searchfiltering)
6. [REQ-SWR-006 — Dynamic filter update](#req-swr-006-dynamic-filter-update)
7. [REQ-SWR-007 — Selecting an existing rule](#req-swr-007-selecting-an-existing-rule)
8. [REQ-SWR-008 — Creating a new rule](#req-swr-008-creating-a-new-rule)
9. [REQ-SWR-009 — Automatic generation of a unique identifier](#req-swr-009-automatic-generation-of-a-unique-identifier)
10. [REQ-SWR-010 — Rule editing form](#req-swr-010-rule-editing-form)
11. [REQ-SWR-011 — Metadata synchronization from the DOM](#req-swr-011-metadata-synchronization-from-the-dom)
12. [REQ-SWR-012 — Auto-save on metadata change](#req-swr-012-auto-save-on-metadata-change)
13. [REQ-SWR-013 — Saving a rule (create or update)](#req-swr-013-saving-a-rule-create-or-update)
14. [REQ-SWR-014 — Renaming an existing rule](#req-swr-014-renaming-an-existing-rule)
15. [REQ-SWR-015 — Deleting a rule](#req-swr-015-deleting-a-rule)
16. [REQ-SWR-016 — Adding an atom to a section](#req-swr-016-adding-an-atom-to-a-section)
17. [REQ-SWR-017 — Removing an atom](#req-swr-017-removing-an-atom)
18. [REQ-SWR-018 — Editing an atom field](#req-swr-018-editing-an-atom-field)
19. [REQ-SWR-019 — Rendering a `type_atom` atom](#req-swr-019-rendering-a-typeatom-atom)
20. [REQ-SWR-020 — Rendering a `property_atom` atom](#req-swr-020-rendering-a-propertyatom-atom)
21. [REQ-SWR-021 — Rendering an `equality_atom` atom](#req-swr-021-rendering-an-equalityatom-atom)
22. [REQ-SWR-022 — Rendering a NAF block](#req-swr-022-rendering-a-naf-block)
23. [REQ-SWR-023 — Rendering a nested conditional atom](#req-swr-023-rendering-a-nested-conditional-atom)
24. [REQ-SWR-024 — Class picker for `type_atom` atoms](#req-swr-024-class-picker-for-typeatom-atoms)
25. [REQ-SWR-025 — Selecting a class in the picker](#req-swr-025-selecting-a-class-in-the-picker)
26. [REQ-SWR-026 — Property picker for `property_atom` atoms](#req-swr-026-property-picker-for-propertyatom-atoms)
27. [REQ-SWR-027 — Selecting a property in the picker](#req-swr-027-selecting-a-property-in-the-picker)
28. [REQ-SWR-028 — Two-panel individual picker (modal)](#req-swr-028-two-panel-individual-picker-modal)
29. [REQ-SWR-029 — Filtering individuals by class in the picker](#req-swr-029-filtering-individuals-by-class-in-the-picker)
30. [REQ-SWR-030 — Selecting an individual in the picker](#req-swr-030-selecting-an-individual-in-the-picker)
31. [REQ-SWR-031 — Confirming individual selection](#req-swr-031-confirming-individual-selection)
32. [REQ-SWR-032 — Closing the individual picker](#req-swr-032-closing-the-individual-picker)
33. [REQ-SWR-033 — Dynamic dropdown positioning](#req-swr-033-dynamic-dropdown-positioning)
34. [REQ-SWR-034 — Drag-and-drop to reorder atoms](#req-swr-034-drag-and-drop-to-reorder-atoms)
35. [REQ-SWR-035 — Navigating to a referenced entity from an atom](#req-swr-035-navigating-to-a-referenced-entity-from-an-atom)

---

### REQ-SWR-001 — Two-panel interface layout

**Source code:** `swrl_editor.js` → `renderSplit()`

The system displays the SwrlRules tab as a split interface consisting of two panels: a left panel (`#swrl-list-panel`) containing the rules list and a search field, and a right panel (`#swrl-detail`) intended to display the editing form. The detail panel displays a prompt message when no rule is selected.

---

### REQ-SWR-002 — List panel resizing

**Source code:** `swrl_editor.js` → `_initSplitHandle()`

The system allows the user to horizontally resize the list panel by dragging the handle (`#swrl-split-h`). The minimum width is 120 px and the maximum width is 400 px.

---

### REQ-SWR-003 — Display of the SWRL rules list

**Source code:** `swrl_editor.js` → `renderList()`

The system displays the filtered list of SWRL rules. Each entry shows the rule's label (`label`) or identifier (`id`), the identifier as subtext when a label exists, a ⚙️ icon, and a delete button. The selected rule is highlighted via the `selected` CSS class. If no rule is present or matches the filter, an empty message is displayed.

---

### REQ-SWR-004 — Visual indicator for broken references

**Source code:** `swrl_editor.js` → `_ruleHasBrokenRefs()` and `renderList()`

The system detects whether a rule references a class or property that no longer exists in the application state (`APP.state`). If so, the rule entry in the list is colored red (`var(--red,#ef4444)`), and the affected atoms display a `⚠ deleted` badge in the editing form. Detection covers `type_atom` atoms (field `class_id`), `property_atom` atoms (field `property_id`), as well as atoms nested inside `naf_block` and `conditional` blocks.

---

### REQ-SWR-005 — Rule search/filtering

**Source code:** `swrl_editor.js` → `_filterRules()`

The system filters the rules list according to a text query entered in the search field (`#swrl-search`). Matching is case-insensitive and applies to the `id`, `label`, and `comment` fields of the rule, as well as the `class_id`, `property_id`, `var`, `subject`, `object`, and `value` fields of each atom in the body (`body`) and head (`head`).

---

### REQ-SWR-006 — Dynamic filter update

**Source code:** `swrl_editor.js` → `_applySearch()`

The system instantly updates the list displayed in `#swrl-list` on each keystroke in the search field. A ✕ button is dynamically added to the search field when the query is non-empty, and removed when it is cleared. Clicking this button resets the query and re-triggers filtering.

---

### REQ-SWR-007 — Selecting an existing rule

**Source code:** `swrl_editor.js` → `selectRule()`

When the user clicks on a rule in the list, the system retrieves the corresponding rule from `APP.state.swrl_rules`, performs a deep copy (`JSON.parse(JSON.stringify(rule))`), assigns it to `_editingRule`, and triggers rendering of the editing form in the right panel. The `selected` class is applied to the corresponding list element.

---

### REQ-SWR-008 — Creating a new rule

**Source code:** `swrl_editor.js` → `newRule()`

When the user clicks the ➕ button, the system generates a unique identifier, creates an empty rule (`body: [], head: [], enabled: true`), sends it via `API.createSWRLRule()`, refreshes the application state, updates the list, and displays the editing form for the newly selected rule.

---

### REQ-SWR-009 — Automatic generation of a unique identifier

**Source code:** `swrl_editor.js` → `_generateRuleName()`

The system automatically generates an identifier for a new rule starting from `NewRule`, then trying `NewRule1`, `NewRule2`, etc., until an identifier not already present in the existing list (`APP.state.swrl_rules`) is found.

---

### REQ-SWR-010 — Rule editing form

**Source code:** `swrl_editor.js` → `_renderForm()`

The system displays a form consisting of: an `ID` field (required, with automatic replacement of spaces by `_`), a `Label` field, a `Comment` textarea, an `if` section (rule body) and a `then` section (rule head). Each section has buttons to add atoms of type `type_atom`, `property_atom`, `equality_atom`. The `body` section additionally offers the `naf_block` type; the `head` section offers the `conditional` type instead of `naf_block`.

---

### REQ-SWR-011 — Metadata synchronization from the DOM

**Source code:** `swrl_editor.js` → `_syncFromDom()`

The system reads the values of the `#swrl-id`, `#swrl-label`, and `#swrl-comment` fields from the DOM and writes them into `_editingRule`. Spaces in the identifier are replaced by `_`.

---

### REQ-SWR-012 — Auto-save on metadata change

**Source code:** `swrl_editor.js` → `_syncAndSave()`

On each `onchange` event on the `ID`, `Label`, or `Comment` fields, the system synchronizes the metadata from the DOM via `_syncFromDom()` and then automatically triggers a save via `save(false)` if the rule is not new.

---

### REQ-SWR-013 — Saving a rule (create or update)

**Source code:** `swrl_editor.js` → `save()`

The system saves the rule currently being edited. If the rule is new, it calls `API.createSWRLRule()`; otherwise, it calls `API.updateSWRLRule(originalId, rule)`. After saving, the application state is refreshed and the list is updated. In case of error, a message is displayed via `UI.error()`.

---

### REQ-SWR-014 — Renaming an existing rule

**Source code:** `swrl_editor.js` → `save()`

During an update, if the current rule identifier (`rule.id`) differs from the original identifier (`_editingId`), the system calls `API.updateSWRLRule(originalId, rule)` with the old identifier and displays a success message indicating the new name.

---

### REQ-SWR-015 — Deleting a rule

**Source code:** `swrl_editor.js` → `delete()`

The system displays a confirmation prompt before deleting a rule. Upon confirmation, it calls `API.deleteSWRLRule(id)`. If the returned error is a 404, it is ignored. After deletion, the selection and the rule being edited are reset, the application state is refreshed, the list is updated, and the detail panel is cleared.

---

### REQ-SWR-016 — Adding an atom to a section

**Source code:** `swrl_editor.js` → `addAtom()`

The system adds a new atom of the specified type (created by `_makeAtom()`) to the list designated by a path (`body`, `head`, or a nested atom sub-path). The form is re-rendered after the addition, and the rule is automatically saved if it is not new.

---

### REQ-SWR-017 — Removing an atom

**Source code:** `swrl_editor.js` → `removeAtom()`

The system removes the atom designated by its path (resolved by navigating through `_editingRule`), re-renders the form, and triggers an auto-save if the rule is not new.

---

### REQ-SWR-018 — Editing an atom field

**Source code:** `swrl_editor.js` → `updateField()`

The system updates the value of a field (`var`, `subject`, `object`, `value`, `operator`, etc.) of an atom designated by its path, then triggers an auto-save if the rule is not new.

---

### REQ-SWR-019 — Rendering a `type_atom` atom

**Source code:** `swrl_editor.js` → `_renderAtom()` (branch `case 'type_atom'`)

The system displays a `type_atom` atom as a variable field (`?var`) followed by the keyword `is a` and a class selector. If the referenced class no longer exists in `APP.state.classes`, the selector displays `⚠ deleted` in red. If the class exists, it is clickable and navigates to the `classes` view via `APP.navigateTo()`.

---

### REQ-SWR-020 — Rendering a `property_atom` atom

**Source code:** `swrl_editor.js` → `_renderAtom()` (branch `case 'property_atom'`)

The system displays a `property_atom` atom as a subject field (`?subj`), a property selector (object property or datatype property, distinguished by their colored dot), and an object field (`?obj / ?_`). If the property no longer exists, the selector displays `⚠ deleted`. If it exists, it is clickable and navigates to `object-properties` or `datatype-properties` depending on its type.

---

### REQ-SWR-021 — Rendering an `equality_atom` atom

**Source code:** `swrl_editor.js` → `_renderAtom()` (branch `case 'equality_atom'`)

The system displays an `equality_atom` atom with a variable field (`?var`), an operator selector among `=`, `!=`, `>`, `>=`, `<`, `<=`, and a value field. If the value matches a known individual in `APP.state.individuals`, it is displayed as a navigable badge (click → `APP.navigateTo('individuals', ...)`). Otherwise, a free text field is displayed. A separate button allows opening the individual picker.

---

### REQ-SWR-022 — Rendering a NAF block

**Source code:** `swrl_editor.js` → `_renderAtom()` (branch `case 'naf_block'`)

The system displays a NAF (Negation As Failure) block with a header labeled `NAF`, buttons to add atoms of type `type_atom`, `property_atom`, or `equality_atom` inside the block, and the recursive rendering of nested atoms via `_renderAtomList()`.

---

### REQ-SWR-023 — Rendering a nested conditional atom

**Source code:** `swrl_editor.js` → `_renderAtom()` (branch `case 'conditional'`)

The system displays a `conditional` atom as two nested `if` and `then` sub-sections, each with buttons to add atoms (`type_atom`, `property_atom`, `equality_atom`, `naf_block` in the condition; an additional `conditional` in the consequent). The code normalizes legacy formats (single object → list) for the `condition` and `consequent` fields at render time.

---

### REQ-SWR-024 — Class picker for `type_atom` atoms

**Source code:** `swrl_editor.js` → `toggleClassPicker()`

The system opens or closes a class selection dropdown positioned in `position:fixed` below (or above) the trigger button. All other open class pickers are closed upon opening. The dropdown closes automatically when a click occurs outside of it.

---

### REQ-SWR-025 — Selecting a class in the picker

**Source code:** `swrl_editor.js` → `onClassPickerSelect()`

When the user selects a class in the picker, the system updates the `class_id` field of the atom designated by `_currentPickerPath`, closes all class pickers, re-renders the form, and triggers an auto-save.

---

### REQ-SWR-026 — Property picker for `property_atom` atoms

**Source code:** `swrl_editor.js` → `togglePropPicker()`

The system opens or closes a property selection dropdown positioned in `position:fixed`. The dropdown content is built dynamically from `APP.state.object_properties` and `APP.state.datatype_properties`, sorted alphabetically, with a visual separator between the two groups. Object properties are distinguished by an `op-prop-dot` colored dot and datatype properties by a `dp-prop-dot` dot.

---

### REQ-SWR-027 — Selecting a property in the picker

**Source code:** `swrl_editor.js` → `onPropPickerSelect()`

When the user selects a property, the system updates the `property_id` field of the atom designated by `_currentPropPickerPath`, closes all property pickers, re-renders the form, and triggers an auto-save.

---

### REQ-SWR-028 — Two-panel individual picker (modal)

**Source code:** `swrl_editor.js` → `openIndPicker()`

The system opens a modal window (`#swrl-ind-picker-modal`) composed of two panels: a class tree on the left (including `owl:Thing` as the first entry with the total number of individuals) and an individuals list on the right. The class tree is built via `ClassEditor.buildTree()` and the individual count for each class accounts for the hierarchy (descendant classes included).

---

### REQ-SWR-029 — Filtering individuals by class in the picker

**Source code:** `swrl_editor.js` → `swrlIndPickerSelectClass()`

When a class is selected in the left panel of the picker, the system filters the individuals displayed in the right panel. If `owl:Thing` is selected, all individuals are displayed. Otherwise, only individuals whose `types` field includes the selected class or one of its subclasses are displayed. Each individual's label is resolved via `IndividualEditor._labelForId()`.

---

### REQ-SWR-030 — Selecting an individual in the picker

**Source code:** `swrl_editor.js` → `swrlIndPickerSelectInd()`

When the user clicks on an individual in the picker list, the system marks it as selected in `_swrlIndPicker.selectedInd` and enables the `OK` button. A double-click on an individual selects it and immediately confirms the selection.

---

### REQ-SWR-031 — Confirming individual selection

**Source code:** `swrl_editor.js` → `confirmIndPicker()`

Upon confirmation (via the `OK` button or double-click), the system calls `onIndPickerSelect()` with the identifier of the selected individual, which updates the `value` field of the concerned `equality_atom`, re-renders the form, triggers an auto-save, and then closes the modal.

---

### REQ-SWR-032 — Closing the individual picker

**Source code:** `swrl_editor.js` → `closeIndPicker()`

The system removes the `#swrl-ind-picker-modal` element from the DOM and resets the internal state `_swrlIndPicker` (atom path, selected class, selected individual).

---

### REQ-SWR-033 — Dynamic dropdown positioning

**Source code:** `swrl_editor.js` → `_positionDropdown()`

The system calculates the optimal position of a `position:fixed` dropdown by accounting for the available space below and above the trigger button. If the space below the button is insufficient, the dropdown opens upward. The minimum width is that of the trigger button or the `width` value passed as a parameter (default 200 px); the maximum height is bounded to 260 px or the available space.

---

### REQ-SWR-034 — Drag-and-drop to reorder atoms

**Source code:** `swrl_editor.js` → `onDragStart()`, `onDragOver()`, `onDragLeave()`, `onDrop()`, `onDragEnd()`

The system allows reordering atoms by drag-and-drop within the same list (same `listPath`). Only the `⠿` element (handle) is `draggable="true"` to avoid nesting conflicts. The drop is accepted only if the source list and the target list are identical. After dropping, atoms are reordered in `_editingRule` via `splice()`, the form is re-rendered, and an auto-save is triggered.

---

### REQ-SWR-035 — Navigating to a referenced entity from an atom

**Source code:** `swrl_editor.js` → `_renderAtom()` (branches `type_atom`, `property_atom`, `equality_atom`)

The system renders class, property, and individual identifiers displayed in atoms as clickable when the referenced entity exists. A click calls `APP.navigateTo()` with the target tab (`classes`, `object-properties`, `datatype-properties`, `individuals`) and the entity identifier. Hovering applies an underline and an accent color.

---

*— Claude Sonnet 4.6*
