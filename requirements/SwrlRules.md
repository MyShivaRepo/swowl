# Requirements — SwrlRules

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-SWR-005 — Search/filtering of rules](#req-swr-005--searchfiltering-of-rules)
- [REQ-SWR-007 — Selecting an existing rule](#req-swr-007--selecting-an-existing-rule)
- [REQ-SWR-008 — Creating a new rule](#req-swr-008--creating-a-new-rule)
- [REQ-SWR-009 — Automatic generation of a unique identifier](#req-swr-009--automatic-generation-of-a-unique-identifier)
- [REQ-SWR-011 — Synchronising metadata from the DOM](#req-swr-011--synchronising-metadata-from-the-dom)
- [REQ-SWR-012 — Auto-save on metadata change](#req-swr-012--auto-save-on-metadata-change)
- [REQ-SWR-013 — Saving a rule (create or update)](#req-swr-013--saving-a-rule-create-or-update)
- [REQ-SWR-014 — Renaming an existing rule](#req-swr-014--renaming-an-existing-rule)
- [REQ-SWR-015 — Deleting a rule](#req-swr-015--deleting-a-rule)
- [REQ-SWR-016 — Adding an atom to a section](#req-swr-016--adding-an-atom-to-a-section)
- [REQ-SWR-017 — Removing an atom](#req-swr-017--removing-an-atom)
- [REQ-SWR-018 — Editing an atom field](#req-swr-018--editing-an-atom-field)
- [REQ-SWR-025 — Selecting a class in the picker](#req-swr-025--selecting-a-class-in-the-picker)
- [REQ-SWR-027 — Selecting a property in the picker](#req-swr-027--selecting-a-property-in-the-picker)
- [REQ-SWR-029 — Filtering individuals by class in the picker](#req-swr-029--filtering-individuals-by-class-in-the-picker)
- [REQ-SWR-030 — Selecting an individual in the picker](#req-swr-030--selecting-an-individual-in-the-picker)
- [REQ-SWR-031 — Confirming individual selection](#req-swr-031--confirming-individual-selection)
- [REQ-SWR-032 — Closing the individual picker](#req-swr-032--closing-the-individual-picker)
- [REQ-SWR-034 — Drag-and-drop to reorder atoms](#req-swr-034--drag-and-drop-to-reorder-atoms)

### Form
- [REQ-SWR-001 — Two-panel interface display](#req-swr-001--two-panel-interface-display)
- [REQ-SWR-002 — Resizing the list panel](#req-swr-002--resizing-the-list-panel)
- [REQ-SWR-003 — Displaying the SWRL rule list](#req-swr-003--displaying-the-swrl-rule-list)
- [REQ-SWR-004 — Visual indicator for broken references](#req-swr-004--visual-indicator-for-broken-references)
- [REQ-SWR-006 — Dynamic filtering update](#req-swr-006--dynamic-filtering-update)
- [REQ-SWR-010 — Rule editing form](#req-swr-010--rule-editing-form)
- [REQ-SWR-019 — Rendering an atom of type `type_atom`](#req-swr-019--rendering-an-atom-of-type-type_atom)
- [REQ-SWR-020 — Rendering an atom of type `property_atom`](#req-swr-020--rendering-an-atom-of-type-property_atom)
- [REQ-SWR-021 — Rendering an atom of type `equality_atom`](#req-swr-021--rendering-an-atom-of-type-equality_atom)
- [REQ-SWR-022 — Rendering a NAF block](#req-swr-022--rendering-a-naf-block)
- [REQ-SWR-023 — Rendering a nested conditional atom](#req-swr-023--rendering-a-nested-conditional-atom)
- [REQ-SWR-024 — Class picker for `type_atom` atoms](#req-swr-024--class-picker-for-type_atom-atoms)
- [REQ-SWR-026 — Property picker for `property_atom` atoms](#req-swr-026--property-picker-for-property_atom-atoms)
- [REQ-SWR-028 — Two-panel individual picker (modal)](#req-swr-028--two-panel-individual-picker-modal)
- [REQ-SWR-033 — Dynamic dropdown positioning](#req-swr-033--dynamic-dropdown-positioning)
- [REQ-SWR-035 — Navigation to a referenced entity from an atom](#req-swr-035--navigation-to-a-referenced-entity-from-an-atom)

---

## 1. Substance — Business logic and functional rules

> Requirements independent of the UI: OWL rules, data constraints, algorithms, persistence.


### REQ-SWR-005 — Search/filtering of rules

The system filters the rule list according to a text query entered in the search field (`#swrl-search`). Matching is case-insensitive and covers the `id`, `label`, and `comment` fields of the rule, as well as the `class_id`, `property_id`, `var`, `subject`, `object`, and `value` fields of each atom in the body (`body`) and head (`head`).

---

**Source code:** `swrl_editor.js` → `_filterRules()`

### REQ-SWR-007 — Selecting an existing rule

When the user clicks on a rule in the list, the system retrieves the corresponding rule from `APP.state.swrl_rules`, performs a deep copy (`JSON.parse(JSON.stringify(rule))`), assigns it to `_editingRule`, and triggers the rendering of the editing form in the right panel. The `selected` class is applied to the corresponding list item.

---

**Source code:** `swrl_editor.js` → `selectRule()`

### REQ-SWR-008 — Creating a new rule

When the user clicks the ➕ button, the system generates a unique identifier, creates an empty rule (`body: [], head: [], enabled: true`), sends it via `API.createSWRLRule()`, refreshes the application state, updates the list, and displays the editing form for the newly selected rule.

---

**Source code:** `swrl_editor.js` → `newRule()`

### REQ-SWR-009 — Automatic generation of a unique identifier

The system automatically generates an identifier for a new rule starting from `NewRule`, then trying `NewRule1`, `NewRule2`, and so on, until it finds an identifier not already present in the existing list (`APP.state.swrl_rules`).

---

**Source code:** `swrl_editor.js` → `_generateRuleName()`

### REQ-SWR-011 — Synchronising metadata from the DOM

The system reads the values of the `#swrl-id`, `#swrl-label`, and `#swrl-comment` fields from the DOM and writes them into `_editingRule`. Spaces in the identifier are replaced with `_`.

---

**Source code:** `swrl_editor.js` → `_syncFromDom()`

### REQ-SWR-012 — Auto-save on metadata change

On each `onchange` event on the `ID`, `Label`, or `Comment` fields, the system synchronises metadata from the DOM via `_syncFromDom()` and then automatically triggers a save via `save(false)` if the rule is not new.

---

**Source code:** `swrl_editor.js` → `_syncAndSave()`

### REQ-SWR-013 — Saving a rule (create or update)

The system saves the rule currently being edited. If the rule is new, it calls `API.createSWRLRule()`; otherwise, it calls `API.updateSWRLRule(originalId, rule)`. After saving, the application state is refreshed and the list is updated. On error, a message is displayed via `UI.error()`.

---

**Source code:** `swrl_editor.js` → `save()`

### REQ-SWR-014 — Renaming an existing rule

During an update, if the current identifier of the rule (`rule.id`) differs from the original identifier (`_editingId`), the system calls `API.updateSWRLRule(originalId, rule)` with the old identifier and displays a success message indicating the new name.

---

**Source code:** `swrl_editor.js` → `save()`

### REQ-SWR-015 — Deleting a rule

The system displays a confirmation prompt before deleting a rule. Upon confirmation, it calls `API.deleteSWRLRule(id)`. If the returned error is a 404, it is ignored. After deletion, the selection and the rule being edited are reset, the application state is refreshed, the list is updated, and the detail panel is cleared.

---

**Source code:** `swrl_editor.js` → `delete()`

### REQ-SWR-016 — Adding an atom to a section

The system adds a new atom of the specified type (created by `_makeAtom()`) to the list designated by a path (`body`, `head`, or a nested atom sub-path). The form is re-rendered after the addition, and the rule is automatically saved if it is not new.

---

**Source code:** `swrl_editor.js` → `addAtom()`

### REQ-SWR-017 — Removing an atom

The system removes the atom designated by its path (resolved by navigating `_editingRule`), re-renders the form, and triggers an auto-save if the rule is not new.

---

**Source code:** `swrl_editor.js` → `removeAtom()`

### REQ-SWR-018 — Editing an atom field

The system updates the value of a field (`var`, `subject`, `object`, `value`, `operator`, etc.) of an atom designated by its path, then triggers an auto-save if the rule is not new.

---

**Source code:** `swrl_editor.js` → `updateField()`

### REQ-SWR-025 — Selecting a class in the picker

When the user selects a class in the picker, the system updates the `class_id` field of the atom designated by `_currentPickerPath`, closes all class pickers, re-renders the form, and triggers an auto-save.

---

**Source code:** `swrl_editor.js` → `onClassPickerSelect()`

### REQ-SWR-027 — Selecting a property in the picker

When the user selects a property, the system updates the `property_id` field of the atom designated by `_currentPropPickerPath`, closes all property pickers, re-renders the form, and triggers an auto-save.

---

**Source code:** `swrl_editor.js` → `onPropPickerSelect()`

### REQ-SWR-029 — Filtering individuals by class in the picker

When a class is selected in the left panel of the picker, the system filters the individuals displayed in the right panel. If `owl:Thing` is selected, all individuals are displayed. Otherwise, only individuals whose `types` field includes the selected class or one of its subclasses are displayed. The label of each individual is resolved via `IndividualEditor._labelForId()`.

---

**Source code:** `swrl_editor.js` → `swrlIndPickerSelectClass()`

### REQ-SWR-030 — Selecting an individual in the picker

When the user clicks on an individual in the picker list, the system marks it as selected in `_swrlIndPicker.selectedInd` and enables the `OK` button. A double-click on an individual selects it and immediately confirms the selection.

---

**Source code:** `swrl_editor.js` → `swrlIndPickerSelectInd()`

### REQ-SWR-031 — Confirming individual selection

Upon confirmation (via the `OK` button or a double-click), the system calls `onIndPickerSelect()` with the identifier of the selected individual, which updates the `value` field of the relevant `equality_atom`, re-renders the form, triggers an auto-save, and closes the modal.

---

**Source code:** `swrl_editor.js` → `confirmIndPicker()`

### REQ-SWR-032 — Closing the individual picker

The system removes the `#swrl-ind-picker-modal` element from the DOM and resets the internal state `_swrlIndPicker` (atom path, selected class, selected individual).

---

**Source code:** `swrl_editor.js` → `closeIndPicker()`

### REQ-SWR-034 — Drag-and-drop to reorder atoms

The system allows atoms to be reordered by drag-and-drop within the same list (same `listPath`). Only the `⠿` handle element is `draggable="true"` to avoid nesting conflicts. A drop is only accepted if the source and target lists are identical. After the drop, atoms are reordered in `_editingRule` via `splice()`, the form is re-rendered, and an auto-save is triggered.

---

## 2. Form — Presentation and user interface

> Requirements related to display: layout, visual components, interactions, navigation, styles.

**Source code:** `swrl_editor.js` → `onDragStart()`, `onDragOver()`, `onDragLeave()`, `onDrop()`, `onDragEnd()`

### REQ-SWR-001 — Two-panel interface display

The system displays the SwrlRules tab as an interface split into two panels: a left panel (`#swrl-list-panel`) containing the rule list and a search field, and a right panel (`#swrl-detail`) intended for displaying the editing form. The detail panel displays a prompt message when no rule is selected.

---

**Source code:** `swrl_editor.js` → `renderSplit()`

### REQ-SWR-002 — Resizing the list panel

The system allows the user to horizontally resize the list panel by dragging the handle (`#swrl-split-h`). The minimum width is 120 px and the maximum width is 400 px.

---

**Source code:** `swrl_editor.js` → `_initSplitHandle()`

### REQ-SWR-003 — Displaying the SWRL rule list

The system displays the filtered list of SWRL rules. Each entry shows the rule's label (`label`) or identifier (`id`), the identifier as sub-text when a label exists, a ⚙️ icon, and a delete button. The selected rule is highlighted via the `selected` CSS class. If no rule is present or matches the filter, an empty-state message is displayed.

---

**Source code:** `swrl_editor.js` → `renderList()`

### REQ-SWR-004 — Visual indicator for broken references

The system detects whether a rule references a class or property that no longer exists in the application state (`APP.state`). If so, the rule's entry in the list is coloured red (`var(--red,#ef4444)`), and the affected atoms display a `⚠ deleted` badge in the editing form. Detection covers `type_atom` atoms (field `class_id`), `property_atom` atoms (field `property_id`), as well as atoms nested inside `naf_block` and `conditional` blocks.

---

**Source code:** `swrl_editor.js` → `_ruleHasBrokenRefs()` and `renderList()`

### REQ-SWR-006 — Dynamic filtering update

The system instantly updates the list displayed in `#swrl-list` on every keystroke in the search field. A ✕ button is dynamically added to the search field when the query is non-empty, and removed when it is cleared. Clicking this button resets the query and re-triggers filtering.

---

**Source code:** `swrl_editor.js` → `_applySearch()`

### REQ-SWR-010 — Rule editing form

The system displays a form composed of: an `ID` field (required, with automatic replacement of spaces by `_`), a `Label` field, a `Comment` text area, an `if` section (rule body), and a `then` section (rule head). Each section has buttons to add atoms of type `type_atom`, `property_atom`, and `equality_atom`. The `body` section additionally offers the `naf_block` type; the `head` section offers the `conditional` type in place of `naf_block`.

---

**Source code:** `swrl_editor.js` → `_renderForm()`

### REQ-SWR-019 — Rendering an atom of type `type_atom`

The system displays a `type_atom` atom as a variable field (`?var`) followed by the keyword `is a` and a class selector. If the referenced class no longer exists in `APP.state.classes`, the selector displays `⚠ deleted` in red. If the class exists, it is clickable and navigates to the `classes` view via `APP.navigateTo()`.

---

**Source code:** `swrl_editor.js` → `_renderAtom()` (branch `case 'type_atom'`)

### REQ-SWR-020 — Rendering an atom of type `property_atom`

The system displays a `property_atom` atom as a subject field (`?subj`), a property selector (object property or datatype property, distinguished by their coloured dot), and an object field (`?obj / ?_`). If the property no longer exists, the selector displays `⚠ deleted`. If it exists, it is clickable and navigates to `object-properties` or `datatype-properties` depending on its type.

---

**Source code:** `swrl_editor.js` → `_renderAtom()` (branch `case 'property_atom'`)

### REQ-SWR-021 — Rendering an atom of type `equality_atom`

The system displays an `equality_atom` atom with a variable field (`?var`), an operator selector among `=`, `!=`, `>`, `>=`, `<`, `<=`, and a value field. If the value matches a known individual in `APP.state.individuals`, it is displayed as a navigable pill (click → `APP.navigateTo('individuals', ...)`). Otherwise, a free-text field is displayed. A separate button allows opening the individual picker.

---

**Source code:** `swrl_editor.js` → `_renderAtom()` (branch `case 'equality_atom'`)

### REQ-SWR-022 — Rendering a NAF block

The system displays a NAF (Negation As Failure) block with a header labelled `NAF`, buttons to add atoms of type `type_atom`, `property_atom`, or `equality_atom` inside the block, and recursive rendering of nested atoms via `_renderAtomList()`.

---

**Source code:** `swrl_editor.js` → `_renderAtom()` (branch `case 'naf_block'`)

### REQ-SWR-023 — Rendering a nested conditional atom

The system displays a `conditional` atom as two nested `if` and `then` sub-sections, each with buttons to add atoms (`type_atom`, `property_atom`, `equality_atom`, `naf_block` in the condition; additionally `conditional` in the consequent). The code normalises legacy formats at render time (single object → list) for the `condition` and `consequent` fields.

---

**Source code:** `swrl_editor.js` → `_renderAtom()` (branch `case 'conditional'`)

### REQ-SWR-024 — Class picker for `type_atom` atoms

The system opens or closes a class selection dropdown positioned with `position:fixed` below (or above) the trigger button. All other open class pickers are closed upon opening. The dropdown closes automatically on an outside click.

---

**Source code:** `swrl_editor.js` → `toggleClassPicker()`

### REQ-SWR-026 — Property picker for `property_atom` atoms

The system opens or closes a property selection dropdown positioned with `position:fixed`. The dropdown content is built dynamically from `APP.state.object_properties` and `APP.state.datatype_properties`, sorted alphabetically, with a visual separator between the two groups. Object properties are distinguished by an `op-prop-dot` coloured dot and datatype properties by a `dp-prop-dot` coloured dot.

---

**Source code:** `swrl_editor.js` → `togglePropPicker()`

### REQ-SWR-028 — Two-panel individual picker (modal)

The system opens a modal window (`#swrl-ind-picker-modal`) composed of two panels: a class tree on the left (including `owl:Thing` as the first entry with the total number of individuals) and an individual list on the right. The class tree is built via `ClassEditor.buildTree()` and the individual count for each class accounts for the hierarchy (descendant classes included).

---

**Source code:** `swrl_editor.js` → `openIndPicker()`

### REQ-SWR-033 — Dynamic dropdown positioning

The system calculates the optimal position of a `position:fixed` dropdown by taking into account the available space below and above the trigger button. If the space below the button is insufficient, the dropdown opens upward. The minimum width is that of the trigger button or the `width` value passed as a parameter (default 200 px); the maximum height is capped at 260 px or the available space.

---

**Source code:** `swrl_editor.js` → `_positionDropdown()`

### REQ-SWR-035 — Navigation to a referenced entity from an atom

The system makes class, property, and individual identifiers displayed in atoms clickable when the referenced entity exists. A click calls `APP.navigateTo()` with the target tab (`classes`, `object-properties`, `datatype-properties`, `individuals`) and the entity identifier. Hovering applies an underline and an accent colour.

**Source code:** `swrl_editor.js` → `_renderAtom()` (branches `type_atom`, `property_atom`, `equality_atom`)
