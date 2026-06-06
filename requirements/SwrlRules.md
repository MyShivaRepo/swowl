# Requirements — SwrlRules

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-SWR-005 — Search/filtering of rules](#req-swr-005--searchfiltering-of-rules)
- [REQ-SWR-007 — Selecting an existing rule](#req-swr-007--selecting-an-existing-rule)
- [REQ-SWR-008 — Creating a new rule](#req-swr-008--creating-a-new-rule)
- [REQ-SWR-009 — Automatic generation of a unique identifier](#req-swr-009--automatic-generation-of-a-unique-identifier)
- [REQ-SWR-011 — Synchronisation of metadata from the DOM](#req-swr-011--synchronisation-of-metadata-from-the-dom)
- [REQ-SWR-012 — Automatic save on metadata modification](#req-swr-012--automatic-save-on-metadata-modification)
- [REQ-SWR-013 — Saving a rule (creation or update)](#req-swr-013--saving-a-rule-creation-or-update)
- [REQ-SWR-014 — Renaming an existing rule](#req-swr-014--renaming-an-existing-rule)
- [REQ-SWR-015 — Deleting a rule](#req-swr-015--deleting-a-rule)
- [REQ-SWR-016 — Adding an atom to a section](#req-swr-016--adding-an-atom-to-a-section)
- [REQ-SWR-017 — Deleting an atom](#req-swr-017--deleting-an-atom)
- [REQ-SWR-018 — Modifying an atom field](#req-swr-018--modifying-an-atom-field)
- [REQ-SWR-025 — Selecting a class in the picker](#req-swr-025--selecting-a-class-in-the-picker)
- [REQ-SWR-027 — Selecting a property in the picker](#req-swr-027--selecting-a-property-in-the-picker)
- [REQ-SWR-029 — Filtering individuals by class in the picker](#req-swr-029--filtering-individuals-by-class-in-the-picker)
- [REQ-SWR-030 — Selecting an individual in the picker](#req-swr-030--selecting-an-individual-in-the-picker)
- [REQ-SWR-031 — Confirming the selection of an individual](#req-swr-031--confirming-the-selection-of-an-individual)
- [REQ-SWR-032 — Closing the individual picker](#req-swr-032--closing-the-individual-picker)
- [REQ-SWR-034 — Drag-and-drop to reorder atoms](#req-swr-034--drag-and-drop-to-reorder-atoms)

### Form
- [REQ-SWR-001 — Two-panel interface display](#req-swr-001--two-panel-interface-display)
- [REQ-SWR-002 — Resizing the list panel](#req-swr-002--resizing-the-list-panel)
- [REQ-SWR-003 — Displaying the SWRL rule list](#req-swr-003--displaying-the-swrl-rule-list)
- [REQ-SWR-004 — Visual indicator for broken references](#req-swr-004--visual-indicator-for-broken-references)
- [REQ-SWR-006 — Dynamic update of filtering](#req-swr-006--dynamic-update-of-filtering)
- [REQ-SWR-010 — Rule editing form](#req-swr-010--rule-editing-form)
- [REQ-SWR-019 — Rendering an atom of type `type_atom`](#req-swr-019--rendering-an-atom-of-type-type_atom)
- [REQ-SWR-020 — Rendering an atom of type `property_atom`](#req-swr-020--rendering-an-atom-of-type-property_atom)
- [REQ-SWR-021 — Rendering an atom of type `equality_atom`](#req-swr-021--rendering-an-atom-of-type-equality_atom)
- [REQ-SWR-022 — Rendering a NAF block](#req-swr-022--rendering-a-naf-block)
- [REQ-SWR-023 — Rendering a nested conditional atom](#req-swr-023--rendering-a-nested-conditional-atom)
- [REQ-SWR-024 — Class picker for `type_atom` atoms](#req-swr-024--class-picker-for-type_atom-atoms)
- [REQ-SWR-026 — Property picker for `property_atom` atoms](#req-swr-026--property-picker-for-property_atom-atoms)
- [REQ-SWR-028 — Two-panel individual picker (modal)](#req-swr-028--two-panel-individual-picker-modal)
- [REQ-SWR-033 — Dynamic positioning of dropdowns](#req-swr-033--dynamic-positioning-of-dropdowns)
- [REQ-SWR-035 — Navigation to a referenced entity from an atom](#req-swr-035--navigation-to-a-referenced-entity-from-an-atom)

---

## 1. Substance — Business logic

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviours, validations, persistence.


### REQ-SWR-005 — Search/filtering of rules

**If** the user types a text query in the search field (`#swrl-search`),

**Then** the system filters the rule list by performing a case-insensitive match on the `id`, `label` and `comment` fields of each rule, as well as on the `class_id`, `property_id`, `var`, `subject`, `object` and `value` fields of each atom in the body (`body`) and head (`head`).

---

**Source code:** `swrl_editor.js` → `_filterRules()`

### REQ-SWR-007 — Selecting an existing rule

**If** the user clicks on a rule in the list,

**Then**:
- the system retrieves the corresponding rule from `APP.state.swrl_rules` and performs a deep copy (`JSON.parse(JSON.stringify(rule))`)
- the copy is assigned to `_editingRule`
- the editing form is rendered in the right panel
- the CSS class `selected` is applied to the corresponding list element

---

**Source code:** `swrl_editor.js` → `selectRule()`

### REQ-SWR-008 — Creating a new rule

**If** the user clicks the ➕ button,

**Then**:
- the system generates a unique identifier
- an empty rule is created (`body: [], head: [], enabled: true`)
- the rule is sent via `API.createSWRLRule()`
- the application state is refreshed and the list is updated
- the editing form for the new rule is displayed and the rule is selected

---

**Source code:** `swrl_editor.js` → `newRule()`

### REQ-SWR-009 — Automatic generation of a unique identifier

**If** the system needs to generate an identifier for a new rule,

**Then** it starts from the value `NewRule`, then tries successively `NewRule1`, `NewRule2`, etc., until it finds an identifier absent from `APP.state.swrl_rules`.

---

**Source code:** `swrl_editor.js` → `_generateRuleName()`

### REQ-SWR-011 — Synchronisation of metadata from the DOM

**If** the system triggers a metadata synchronisation,

**Then** it reads the values of the `#swrl-id`, `#swrl-label` and `#swrl-comment` fields from the DOM, writes them into `_editingRule`, and replaces spaces in the identifier with `_`.

---

**Source code:** `swrl_editor.js` → `_syncFromDom()`

### REQ-SWR-012 — Automatic save on metadata modification

**If** the user triggers an `onchange` event on the `ID`, `Label` or `Comment` fields
**and** the rule currently being edited is not new,

**Then** the system synchronises the metadata from the DOM via `_syncFromDom()` and then automatically triggers a save via `save(false)`.

---

**Source code:** `swrl_editor.js` → `_syncAndSave()`

### REQ-SWR-013 — Saving a rule (creation or update)

**If** the system needs to save the rule currently being edited,

**Then**:
- if the rule is new, it calls `API.createSWRLRule()`
- otherwise, it calls `API.updateSWRLRule(originalId, rule)`
- after saving, the application state is refreshed and the list is updated
- in case of error, a message is displayed via `UI.error()`

---

**Source code:** `swrl_editor.js` → `save()`

### REQ-SWR-014 — Renaming an existing rule

**If** the system saves an update
**and** the current identifier of the rule (`rule.id`) differs from the original identifier (`_editingId`),

**Then** the system calls `API.updateSWRLRule(originalId, rule)` with the old identifier and displays a success message indicating the new name.

---

**Source code:** `swrl_editor.js` → `save()`

### REQ-SWR-015 — Deleting a rule

**If** the user requests the deletion of a rule
**and** confirms the request,

**Then**:
- the system calls `API.deleteSWRLRule(id)` (a 404 error is ignored)
- the selection and the rule currently being edited are reset
- the application state is refreshed and the list is updated
- the detail panel is cleared

---

**Source code:** `swrl_editor.js` → `delete()`

### REQ-SWR-016 — Adding an atom to a section

**If** the user adds an atom of a given type to a section (`body`, `head`, or a nested atom sub-path),

**Then**:
- the system creates a new atom via `_makeAtom()` and appends it to the list designated by the path
- the form is re-rendered
- if the rule is not new, an automatic save is triggered

---

**Source code:** `swrl_editor.js` → `addAtom()`

### REQ-SWR-017 — Deleting an atom

**If** the user deletes an atom designated by its path,

**Then**:
- the system resolves the path in `_editingRule` and removes the atom
- the form is re-rendered
- if the rule is not new, an automatic save is triggered

---

**Source code:** `swrl_editor.js` → `removeAtom()`

### REQ-SWR-018 — Modifying an atom field

**If** the user modifies the value of a field (`var`, `subject`, `object`, `value`, `operator`, etc.) of an atom designated by its path,

**Then** the system updates the corresponding value in `_editingRule` and triggers an automatic save if the rule is not new.

---

**Source code:** `swrl_editor.js` → `updateField()`

### REQ-SWR-025 — Selecting a class in the picker

**If** the user selects a class in the class picker,

**Then**:
- the system updates the `class_id` field of the atom designated by `_currentPickerPath`
- all open class pickers are closed
- the form is re-rendered
- an automatic save is triggered

---

**Source code:** `swrl_editor.js` → `onClassPickerSelect()`

### REQ-SWR-027 — Selecting a property in the picker

**If** the user selects a property in the property picker,

**Then**:
- the system updates the `property_id` field of the atom designated by `_currentPropPickerPath`
- all open property pickers are closed
- the form is re-rendered
- an automatic save is triggered

---

**Source code:** `swrl_editor.js` → `onPropPickerSelect()`

### REQ-SWR-029 — Filtering individuals by class in the picker

**If** the user selects a class in the left panel of the individual picker,

**Then**:
- if `owl:Thing` is selected, all individuals are displayed
- otherwise, only individuals whose `types` field includes the selected class or one of its subclasses are displayed
- the label of each individual is resolved via `IndividualEditor._labelForId()`

---

**Source code:** `swrl_editor.js` → `swrlIndPickerSelectClass()`

### REQ-SWR-030 — Selecting an individual in the picker

**If** the user clicks on an individual in the picker list,

**Then** the individual is marked as selected in `_swrlIndPicker.selectedInd` and the `OK` button is enabled.

**If** the user double-clicks on an individual,

**Then** the individual is selected and confirmation is triggered immediately.

---

**Source code:** `swrl_editor.js` → `swrlIndPickerSelectInd()`

### REQ-SWR-031 — Confirming the selection of an individual

**If** the user clicks the `OK` button or double-clicks on an individual in the picker,

**Then**:
- the system calls `onIndPickerSelect()` with the identifier of the selected individual
- the `value` field of the concerned `equality_atom` atom is updated
- the form is re-rendered and an automatic save is triggered
- the modal is closed

---

**Source code:** `swrl_editor.js` → `confirmIndPicker()`

### REQ-SWR-032 — Closing the individual picker

**If** the system closes the individual picker,

**Then**:
- the `#swrl-ind-picker-modal` element is removed from the DOM
- the internal state `_swrlIndPicker` is reset (atom path, selected class, selected individual)

---

**Source code:** `swrl_editor.js` → `closeIndPicker()`

### REQ-SWR-034 — Drag-and-drop to reorder atoms

**If** the user drags an atom via the `⠿` handle and drops it onto another atom in the same list (`listPath`),

**Then**:
- the atoms are reordered in `_editingRule` via `splice()`
- the form is re-rendered
- an automatic save is triggered

**If** the source list and the target list are different,

**Then** the drop is rejected.

---

## 2. Form — Presentation and UI

> Requirements relating to display: layout, visual components, interactions, navigation, styles.

**Source code:** `swrl_editor.js` → `onDragStart()`, `onDragOver()`, `onDragLeave()`, `onDrop()`, `onDragEnd()`

### REQ-SWR-001 — Two-panel interface display

**If** the SwrlRules tab is displayed,

**Then**:
- the system presents an interface divided into two panels: a left panel (`#swrl-list-panel`) containing the rule list and a search field, and a right panel (`#swrl-detail`) intended for the editing form
- if no rule is selected, the right panel displays a prompt message

---

**Source code:** `swrl_editor.js` → `renderSplit()`

### REQ-SWR-002 — Resizing the list panel

**If** the user drags the `#swrl-split-h` handle,

**Then** the system resizes the list panel horizontally with a minimum width of 120 px and a maximum width of 400 px.

---

**Source code:** `swrl_editor.js` → `_initSplitHandle()`

### REQ-SWR-003 — Displaying the SWRL rule list

**If** the SWRL rule list is displayed (filtered or complete),

**Then**:
- each entry presents the label (`label`) or identifier (`id`) of the rule, the identifier as subtext when a label exists, a ⚙️ icon and a delete button
- the selected rule is highlighted via the CSS class `selected`
- if no rule is present or matches the filter, an empty message is displayed

---

**Source code:** `swrl_editor.js` → `renderList()`

### REQ-SWR-004 — Visual indicator for broken references

**If** a rule references a class or property that no longer exists in `APP.state`,

**Then**:
- the rule entry in the list is coloured red (`var(--red,#ef4444)`)
- the affected atoms display a `⚠ deleted` badge in the editing form
- detection covers `type_atom` atoms (field `class_id`), `property_atom` atoms (field `property_id`), as well as atoms nested inside `naf_block` and `conditional` blocks

---

**Source code:** `swrl_editor.js` → `_ruleHasBrokenRefs()` and `renderList()`

### REQ-SWR-006 — Dynamic update of filtering

**If** the user types or modifies the query in the search field,

**Then**:
- the list displayed in `#swrl-list` is updated instantly
- a ✕ button is added dynamically to the field when the query is non-empty, and removed when it is cleared

**If** the user clicks the ✕ button,

**Then** the query is reset and filtering is re-triggered.

---

**Source code:** `swrl_editor.js` → `_applySearch()`

### REQ-SWR-010 — Rule editing form

**If** a rule is selected and the editing form is displayed,

**Then** the system presents:
- a mandatory `ID` field with automatic replacement of spaces by `_`
- a `Label` field
- a `Comment` text area
- an `if` section (body) and a `then` section (head), each with buttons to add atoms of type `type_atom`, `property_atom`, `equality_atom`
- the `body` section additionally offers the `naf_block` type; the `head` section offers the `conditional` type in place of `naf_block`

---

**Source code:** `swrl_editor.js` → `_renderForm()`

### REQ-SWR-019 — Rendering an atom of type `type_atom`

**If** an atom of type `type_atom` is rendered in the form,

**Then**:
- the system displays a variable field (`?var`) followed by the keyword `is a` and a class selector
- if the referenced class no longer exists in `APP.state.classes`, the selector displays `⚠ deleted` in red
- if the class exists, it is clickable and navigates to the `classes` view via `APP.navigateTo()`

---

**Source code:** `swrl_editor.js` → `_renderAtom()` (branch `case 'type_atom'`)

### REQ-SWR-020 — Rendering an atom of type `property_atom`

**If** an atom of type `property_atom` is rendered in the form,

**Then**:
- the system displays a subject field (`?subj`), a property selector (object property or datatype property, distinguished by their coloured dot) and an object field (`?obj / ?_`)
- if the property no longer exists, the selector displays `⚠ deleted`
- if it exists, it is clickable and navigates to `object-properties` or `datatype-properties` depending on its type

---

**Source code:** `swrl_editor.js` → `_renderAtom()` (branch `case 'property_atom'`)

### REQ-SWR-021 — Rendering an atom of type `equality_atom`

**If** an atom of type `equality_atom` is rendered in the form,

**Then**:
- the system displays a variable field (`?var`), an operator selector among `=`, `!=`, `>`, `>=`, `<`, `<=`, and a value field
- if the value corresponds to a known individual in `APP.state.individuals`, it is displayed as a navigable badge (click → `APP.navigateTo('individuals', ...)`)
- otherwise, a free text field is displayed
- a separate button allows opening the individual picker

---

**Source code:** `swrl_editor.js` → `_renderAtom()` (branch `case 'equality_atom'`)

### REQ-SWR-022 — Rendering a NAF block

**If** a NAF block is rendered in the form,

**Then** the system displays:
- a header labelled `NAF`
- buttons to add atoms of type `type_atom`, `property_atom` or `equality_atom` inside the block
- the recursive rendering of nested atoms via `_renderAtomList()`

---

**Source code:** `swrl_editor.js` → `_renderAtom()` (branch `case 'naf_block'`)

### REQ-SWR-023 — Rendering a nested conditional atom

**If** an atom of type `conditional` is rendered in the form,

**Then**:
- the system displays two nested `if` and `then` sub-sections, each with buttons to add atoms (`type_atom`, `property_atom`, `equality_atom`, `naf_block` in the condition; additionally `conditional` in the consequent)
- legacy formats (single object → list) are normalised at render time for the `condition` and `consequent` fields

---

**Source code:** `swrl_editor.js` → `_renderAtom()` (branch `case 'conditional'`)

### REQ-SWR-024 — Class picker for `type_atom` atoms

**If** the user opens the class picker,

**Then**:
- all other open class pickers are closed
- a dropdown is displayed at `position:fixed` below (or above if space is insufficient) the trigger button

**If** the user clicks outside the dropdown,

**Then** the dropdown closes automatically.

---

**Source code:** `swrl_editor.js` → `toggleClassPicker()`

### REQ-SWR-026 — Property picker for `property_atom` atoms

**If** the user opens the property picker,

**Then**:
- the system displays a dropdown at `position:fixed` whose content is built dynamically from `APP.state.object_properties` and `APP.state.datatype_properties`, sorted alphabetically, with a visual separator between the two groups
- object properties are distinguished by a coloured dot `op-prop-dot` and datatype properties by `dp-prop-dot`

---

**Source code:** `swrl_editor.js` → `togglePropPicker()`

### REQ-SWR-028 — Two-panel individual picker (modal)

**If** the user opens the individual picker,

**Then** the system displays a modal window (`#swrl-ind-picker-modal`) composed of:
- a left panel with a class tree (built via `ClassEditor.buildTree()`) including `owl:Thing` as the first entry with the total number of individuals; the number of individuals for each class takes the hierarchy into account (descendant classes included)
- a right panel with the list of individuals

---

**Source code:** `swrl_editor.js` → `openIndPicker()`

### REQ-SWR-033 — Dynamic positioning of dropdowns

**If** the system needs to position a dropdown at `position:fixed`,

**Then**:
- it calculates the available space below and above the trigger button
- if the space below the button is insufficient, the dropdown opens upwards
- the minimum width is that of the trigger button or the `width` value passed as a parameter (default 200 px)
- the maximum height is bounded to 260 px or the available space

---

**Source code:** `swrl_editor.js` → `_positionDropdown()`

### REQ-SWR-035 — Navigation to a referenced entity from an atom

**If** an entity referenced in an atom (class, property or individual) exists in the application state
**and** the user clicks on its displayed identifier,

**Then** the system calls `APP.navigateTo()` with the target tab (`classes`, `object-properties`, `datatype-properties`, `individuals`) and the entity identifier.

**If** the user hovers over the identifier,

**Then** an underline and an accent colour are applied.

**Source code:** `swrl_editor.js` → `_renderAtom()` (branches `type_atom`, `property_atom`, `equality_atom`)
