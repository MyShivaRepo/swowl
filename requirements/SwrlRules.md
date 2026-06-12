# Requirements — SwrlRules

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-SWR-005 — Rule search/filtering](#req-swr-005--rule-searchfiltering)
- [REQ-SWR-007 — Selecting an existing rule](#req-swr-007--selecting-an-existing-rule)
- [REQ-SWR-008 — Creating a new rule](#req-swr-008--creating-a-new-rule)
- [REQ-SWR-009 — Automatic generation of a unique identifier](#req-swr-009--automatic-generation-of-a-unique-identifier)
- [REQ-SWR-011 — Synchronising metadata from the DOM](#req-swr-011--synchronising-metadata-from-the-dom)
- [REQ-SWR-012 — Automatic save on metadata change](#req-swr-012--automatic-save-on-metadata-change)
- [REQ-SWR-013 — Saving a rule (creation or update)](#req-swr-013--saving-a-rule-creation-or-update)
- [REQ-SWR-014 — Renaming an existing rule](#req-swr-014--renaming-an-existing-rule)
- [REQ-SWR-015 — Deleting a rule](#req-swr-015--deleting-a-rule)
- [REQ-SWR-016 — Adding an atom to a section](#req-swr-016--adding-an-atom-to-a-section)
- [REQ-SWR-017 — Deleting an atom](#req-swr-017--deleting-an-atom)
- [REQ-SWR-018 — Editing an atom field](#req-swr-018--editing-an-atom-field)
- [REQ-SWR-025 — Selecting a class in the picker](#req-swr-025--selecting-a-class-in-the-picker)
- [REQ-SWR-027 — Selecting a property in the picker](#req-swr-027--selecting-a-property-in-the-picker)
- [REQ-SWR-029 — Filtering individuals by class in the picker](#req-swr-029--filtering-individuals-by-class-in-the-picker)
- [REQ-SWR-030 — Selecting an individual in the picker](#req-swr-030--selecting-an-individual-in-the-picker)
- [REQ-SWR-031 — Confirming the selection of an individual](#req-swr-031--confirming-the-selection-of-an-individual)
- [REQ-SWR-032 — Closing the individual picker](#req-swr-032--closing-the-individual-picker)
- [REQ-SWR-034 — Drag-and-drop to reorder atoms](#req-swr-034--drag-and-drop-to-reorder-atoms)
- [REQ-SWR-036 — Importing rules from a `.sword` file](#req-swr-036--importing-rules-from-a-sword-file)
- [REQ-SWR-037 — Resolving an identifier collision on import](#req-swr-037--resolving-an-identifier-collision-on-import)

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
- [REQ-SWR-035 — Navigating to a referenced entity from an atom](#req-swr-035--navigating-to-a-referenced-entity-from-an-atom)
- [REQ-SWR-038 — Import button in the rule list panel](#req-swr-038--import-button-in-the-rule-list-panel)
- [REQ-SWR-039 — Homogeneous class and property pickers](#req-swr-039--homogeneous-class-and-property-pickers)

---

## 1. Substance — Business logic and functional behaviour

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviours, validations, persistence.


### REQ-SWR-005 — Rule search/filtering

| **If** | the ontologist wants to find a `SWRL rule` by typing a term in the search field, |
|---|---|
| **Then** | only rules whose identifier, label, comment or atom terms (`classes`, `properties`, variables, subjects, objects, values) match the entered term — case-insensitively — are displayed. |

---

**Source code:** `swrl_editor.js` → `_filterRules()` — Iterates over `APP.state.swrl_rules` and tests, case-insensitively, the `id`, `label`, `comment` fields of each rule as well as the `class_id`, `property_id`, `var`, `subject`, `object` and `value` fields of each atom in the `body` and `head` lists.

### REQ-SWR-007 — Selecting an existing rule

| **If** | the ontologist selects a rule from the list, |
|---|---|
| **Then** | the rule content is loaded into the editing form, ready to be modified, without affecting persisted data until a save is triggered. |

---

**Source code:** `swrl_editor.js` → `selectRule()` — Retrieves the rule from `APP.state.swrl_rules`, performs a deep copy via `JSON.parse(JSON.stringify(rule))`, assigns it to `_editingRule`, renders the form in the right panel and applies the CSS class `selected` to the corresponding list entry.

### REQ-SWR-008 — Creating a new rule

| **If** | the ontologist wants to create a new `SWRL rule`, |
|---|---|
| **Then** | an empty rule is immediately created with a unique identifier, persisted in the `ontology`, and its editing form is opened to allow input without delay. |

---

**Source code:** `swrl_editor.js` → `newRule()` — Generates an identifier via `_generateRuleName()`, creates an object `{body: [], head: [], enabled: true}`, calls `API.createSWRLRule()`, refreshes `APP.state`, updates the list and selects the new rule via `selectRule()`.

### REQ-SWR-009 — Automatic generation of a unique identifier

| **If** | the system must assign an identifier to a new `SWRL rule`, |
|---|---|
| **Then** | the generated identifier is guaranteed to be unique among all existing rules in the `ontology`. |

---

**Source code:** `swrl_editor.js` → `_generateRuleName()` — Starts from the value `NewRule`, then tries successively `NewRule1`, `NewRule2`, etc., until a value not present in `APP.state.swrl_rules` is found.

### REQ-SWR-011 — Synchronising metadata from the DOM

| **If** | the system collects metadata entered by the ontologist before a save, |
|---|---|
| **Then** | the identifier, label and comment of the rule are read from the input fields and updated in the rule being edited; spaces in the identifier are automatically replaced by underscores. |

---

**Source code:** `swrl_editor.js` → `_syncFromDom()` — Reads the values of the `#swrl-id`, `#swrl-label` and `#swrl-comment` fields from the DOM, writes them into `_editingRule`, and replaces spaces in the identifier with `_`.

### REQ-SWR-012 — Automatic save on metadata change

| **If** | the ontologist modifies the identifier, label or comment of an already existing rule and leaves the field, |
|---|---|
| **Then** | the changes are automatically persisted without any further action on their part. |

---

**Source code:** `swrl_editor.js` → `_syncAndSave()` — Triggered by the `onchange` event on the ID, Label or Comment fields; calls `_syncFromDom()` then `save(false)` only if the rule is not new.

### REQ-SWR-013 — Saving a rule (creation or update)

| **If** | the system must persist the rule being edited, |
|---|---|
| **Then** | the rule is created or updated in the `ontology` depending on whether it is new or existing; in case of failure, the ontologist is informed by an explicit error message. |

---

**Source code:** `swrl_editor.js` → `save()` — Calls `API.createSWRLRule()` for a new rule or `API.updateSWRLRule(originalId, rule)` for an existing rule; refreshes `APP.state` and the list after success; displays an error via `UI.error()` on failure.

### REQ-SWR-014 — Renaming an existing rule

| **If** | the ontologist modifies the identifier of an existing rule and saves, |
|---|---|
| **Then** | the rule is renamed in the `ontology` and the ontologist receives a confirmation indicating the new name. |

---

**Source code:** `swrl_editor.js` → `save()` — Detects that `rule.id` differs from `_editingId` and calls `API.updateSWRLRule(originalId, rule)` with the old identifier, then displays a success message mentioning the new name.

### REQ-SWR-015 — Deleting a rule

| **If** | the ontologist requests the deletion of a rule and confirms their intention, |
|---|---|
| **Then** | the rule is permanently removed from the `ontology`, the selection is reset and the editing panel is cleared. |

---

**Source code:** `swrl_editor.js` → `delete()` — Calls `API.deleteSWRLRule(id)` (a 404 error is ignored), resets `_editingRule` and `_editingId`, refreshes `APP.state`, updates the list and clears the detail panel.

### REQ-SWR-016 — Adding an atom to a section

| **If** | the ontologist wants to add an atom to the premise or conclusion of a rule, |
|---|---|
| **Then** | an atom of the chosen type is inserted into the relevant section, the form is immediately updated and the rule is automatically saved if it already exists. |

---

**Source code:** `swrl_editor.js` → `addAtom()` — Creates an atom via `_makeAtom()`, inserts it into the list designated by the path (subpath of `_editingRule` corresponding to `body`, `head` or a nested atom), re-renders the form and triggers `save(false)` if the rule is not new.

### REQ-SWR-017 — Deleting an atom

| **If** | the ontologist deletes an atom from a rule, |
|---|---|
| **Then** | the atom is removed from the relevant section, the form is updated and the rule is automatically saved if it already exists. |

---

**Source code:** `swrl_editor.js` → `removeAtom()` — Resolves the atom path in `_editingRule` via dot notation, removes the element via `splice()`, re-renders the form and triggers `save(false)` if the rule is not new.

### REQ-SWR-018 — Editing an atom field

| **If** | the ontologist modifies the value of an atom field (variable, subject, object, literal value, operator, etc.), |
|---|---|
| **Then** | the change is applied to the rule and automatically saved if the rule already exists. |

---

**Source code:** `swrl_editor.js` → `updateField()` — Resolves the field path in `_editingRule`, updates the value, then calls `save(false)` if the rule is not new.

### REQ-SWR-025 — Selecting a class in the picker

| **If** | the ontologist chooses a class in the class picker of an atom, |
|---|---|
| **Then** | the selected class is associated with the relevant atom, the picker closes, the form is updated and the rule is automatically saved. |

---

**Source code:** `swrl_editor.js` → `onClassPickerSelect()` — Updates the `class_id` field of the atom designated by `_currentPickerPath`, closes all open class pickers via `querySelectorAll`, re-renders the form and calls `save(false)`.

### REQ-SWR-027 — Selecting a property in the picker

| **If** | the ontologist chooses a `property` in the `property` picker of an atom, |
|---|---|
| **Then** | the selected `property` is associated with the relevant atom, the picker closes, the form is updated and the rule is automatically saved. |

---

**Source code:** `swrl_editor.js` → `onPropPickerSelect()` — Updates the `property_id` field of the atom designated by `_currentPropPickerPath`, closes all open property pickers, re-renders the form and calls `save(false)`.

### REQ-SWR-029 — Filtering individuals by class in the picker

| **If** | the ontologist selects a class in the filter panel of the `individual` picker, |
|---|---|
| **Then** | only `individuals` belonging to that class or one of its subclasses are displayed; if the root class is selected, all `individuals` are shown. |

---

**Source code:** `swrl_editor.js` → `swrlIndPickerSelectClass()` — If `owl:Thing` is selected, displays all individuals from `APP.state.individuals`; otherwise filters by `types` including the class or its descendants (computed via the `subClassOf` hierarchy); resolves the label of each individual via `IndividualEditor._labelForId()`.

### REQ-SWR-030 — Selecting an individual in the picker

| **If** | the ontologist clicks on an `individual` in the picker list, |
|---|---|
| **Then** | the `individual` is highlighted and the confirm button is enabled. |

| **If** | the ontologist double-clicks on an `individual`, |
|---|---|
| **Then** | the `individual` is selected and confirmation is triggered immediately. |

---

**Source code:** `swrl_editor.js` → `swrlIndPickerSelectInd()` — On single click, assigns the identifier to `_swrlIndPicker.selectedInd` and enables the OK button; on double-click, additionally calls `confirmIndPicker()` directly.

### REQ-SWR-031 — Confirming the selection of an individual

| **If** | the ontologist confirms the choice of an `individual` in the picker, |
|---|---|
| **Then** | the selected `individual` is associated with the relevant equality atom, the picker closes, the form is updated and the rule is automatically saved. |

---

**Source code:** `swrl_editor.js` → `confirmIndPicker()` — Calls `onIndPickerSelect()` with the identifier from `_swrlIndPicker.selectedInd`, updates the `value` field of the `equality_atom` designated by `_swrlIndPicker.atomPath`, re-renders the form, calls `save(false)` then `closeIndPicker()`.

### REQ-SWR-032 — Closing the individual picker

| **If** | the `individual` picker closes (confirmation or cancellation), |
|---|---|
| **Then** | the modal window disappears and the internal state of the picker is fully reset. |

---

**Source code:** `swrl_editor.js` → `closeIndPicker()` — Removes the `#swrl-ind-picker-modal` element from the DOM and resets `_swrlIndPicker` (fields `atomPath`, `selectedClass`, `selectedInd` set back to `null`).

### REQ-SWR-034 — Drag-and-drop to reorder atoms

| **If** | the ontologist reorders atoms in a section via drag-and-drop, |
|---|---|
| **Then** | the atom order is updated in the rule, the form reflects the new order and the rule is automatically saved. |

| **If** | the ontologist attempts to move an atom to a different section from its origin, |
|---|---|
| **Then** | the move is rejected and no change is made. |

---

**Source code:** `swrl_editor.js` → `onDragStart()`, `onDragOver()`, `onDragLeave()`, `onDrop()`, `onDragEnd()` — `onDragStart()` stores the source index and `listPath`; `onDragOver()` allows the drop only if the target `listPath` is identical; `onDrop()` reorders atoms via `splice()` in `_editingRule`, re-renders the form and calls `save(false)`.

### REQ-SWR-036 — Importing rules from a `.sword` file

| **If** | the ontologist imports `SWRL rules` from a `.sword` file (the project's human-readable rule format), |
|---|---|
| **Then** | the rules contained in the file are added to the `ontology` as-is — even when an atom references an empty or undefined class — and the ontologist receives a summary indicating how many rules were added, replaced or kept. |

The import is the exact inverse of the `.sword` export: a round-trip preserves NAF negation, conditional sub-rules, equality atoms and empty-class atoms.

---

**Source code:** `swrl_editor.js` → `importRules()` — Opens a file input restricted to `.sword`/`text/plain`, reads the file text, parses it via `API.parseSwordRules(text)`, then iterates over the returned rules; each rule is persisted via `API.createSWRLRule()` (new id) or `API.updateSWRLRule()` (collision resolved as `replace`); no validation is performed against `APP.state.classes`, so atoms referencing missing classes are kept; refreshes `APP.state`, re-renders the section and reports the counts via `UI.success()`.

### REQ-SWR-037 — Resolving an identifier collision on import

| **If** | an imported rule has an identifier that already exists in the `ontology`, |
|---|---|
| **Then** | a dialog asks the ontologist to choose between **Import new** (replace the existing rule), **Keep existing** (skip the imported rule) or **Cancel** (stop the whole import), and the chosen action is applied. |

---

**Source code:** `swrl_editor.js` → `importRules()` and `_askRuleCollision()` — When the rule `id` is present in the set of existing rule ids, `_askRuleCollision()` displays a modal returning `replace`, `keep` or `cancel`; `replace` calls `API.updateSWRLRule(rule.id, rule)`, `keep` skips the rule, `cancel` breaks out of the import loop.

---

## 2. Form — Presentation and UI

> Requirements relating to display: layout, visual components, interactions, navigation, styles.

### REQ-SWR-001 — Two-panel interface display

| **If** | the SwrlRules tab is displayed, |
|---|---|
| **Then** | the interface presents a left panel listing rules with a search field, and a right panel dedicated to editing; if no rule is selected, the right panel displays a message inviting the user to select or create a rule. |

---

**Source code:** `swrl_editor.js` → `renderSplit()` — Generates the HTML skeleton with `#swrl-list-panel` on the left and `#swrl-detail` on the right; displays the invite message if `_editingRule` is null.

### REQ-SWR-002 — Resizing the list panel

| **If** | the ontologist resizes the list panel by dragging the divider between the two panels, |
|---|---|
| **Then** | the width of the list panel adjusts freely between a minimum and a maximum width, without overflowing onto the editing panel. |

---

**Source code:** `swrl_editor.js` → `_initSplitHandle()` — Listens for `mousedown` events on the `#swrl-split-h` handle and adjusts the CSS `width` property of the list panel on `mousemove`, with a minimum of 120 px and a maximum of 400 px.

### REQ-SWR-003 — Displaying the SWRL rule list

| **If** | the `SWRL rule` list is displayed, filtered or in full, |
|---|---|
| **Then** | each rule is presented with its label or identifier, its identifier as subtext when a distinct label exists, and a delete button; the rule currently being edited is visually highlighted; if no rule is available, an empty message is displayed. |

---

**Source code:** `swrl_editor.js` → `renderList()` — Iterates over the filtered rule array, generates a `<li>` per rule with the label (`label` or `id`), the identifier in `<small>` if a distinct label exists, a ⚙️ icon, a delete button and the CSS class `selected` if the rule matches `_editingId`.

### REQ-SWR-004 — Visual indicator for broken references

| **If** | a rule references a class or `property` that has been deleted from the `ontology`, |
|---|---|
| **Then** | the rule is visually flagged in the list, and the affected atoms display a warning in the editing form. |

---

**Source code:** `swrl_editor.js` → `_ruleHasBrokenRefs()` and `renderList()` — `_ruleHasBrokenRefs()` checks the `class_id` fields of `type_atom` atoms and `property_id` fields of `property_atom` atoms, including within nested `naf_block` and `conditional` blocks, by verifying their presence in `APP.state.classes` and `APP.state.object_properties` / `APP.state.datatype_properties`; `renderList()` applies `color: var(--red,#ef4444)` to the affected entry; `_renderAtom()` displays a `⚠ deleted` badge on faulty atoms.

### REQ-SWR-006 — Dynamic filtering update

| **If** | the ontologist types or modifies a term in the search field, |
|---|---|
| **Then** | the rule list is filtered instantly and a clear button appears as long as the field contains text. |

| **If** | the ontologist clicks the clear button, |
|---|---|
| **Then** | the search field is cleared and all rules are displayed again. |

---

**Source code:** `swrl_editor.js` → `_applySearch()` — Listens for the `input` event on `#swrl-search`, calls `_filterRules()` then `renderList()`; dynamically inserts or removes a ✕ button in the field depending on whether the value is non-empty or not.

### REQ-SWR-010 — Rule editing form

| **If** | a rule is selected and the editing form is displayed, |
|---|---|
| **Then** | the ontologist has fields to enter the identifier (with automatic normalisation of spaces), the label and the comment of the rule, as well as two distinct sections for the premise (body) and the conclusion (head), each allowing atoms of the relevant types to be added depending on the section. |

---

**Source code:** `swrl_editor.js` → `_renderForm()` — Generates the `#swrl-id`, `#swrl-label`, `#swrl-comment` fields with their `onchange` handlers; generates the `body` section (with buttons `type_atom`, `property_atom`, `equality_atom`, `naf_block`) and `head` section (with buttons `type_atom`, `property_atom`, `equality_atom`, `conditional`) via `_renderAtomList()`.

### REQ-SWR-019 — Rendering an atom of type `type_atom`

| **If** | a class membership atom is displayed in the form, |
|---|---|
| **Then** | the ontologist sees the relevant variable, the semantic keyword `is a` and the associated class; if the class has been deleted from the `ontology`, a warning is displayed instead; if it exists, its identifier is clickable to navigate directly to the `classes` `view`. |

---

**Source code:** `swrl_editor.js` → `_renderAtom()` (branch `case 'type_atom'`) — Displays a `?var` field, the label `is a` and a class picker; if `class_id` is absent from `APP.state.classes`, displays `⚠ deleted` in red; otherwise renders a link triggering `APP.navigateTo('classes', class_id)`.

### REQ-SWR-020 — Rendering an atom of type `property_atom`

| **If** | a `property` atom is displayed in the form, |
|---|---|
| **Then** | the ontologist sees the subject, the `property` and the object of the relation; the `property` type (object or datatype) is visually distinguished; if the `property` has been deleted, a warning is displayed; if it exists, its identifier is clickable to navigate to the corresponding `properties` `view`. |

---

**Source code:** `swrl_editor.js` → `_renderAtom()` (branch `case 'property_atom'`) — Displays the `?subj` and `?obj / ?_` fields, a property picker with a coloured dot `op-prop-dot` for object properties and `dp-prop-dot` for datatype properties; if `property_id` is absent from `APP.state`, displays `⚠ deleted`; otherwise renders a link to `APP.navigateTo('object-properties' | 'datatype-properties', property_id)`.

### REQ-SWR-021 — Rendering an atom of type `equality_atom`

| **If** | a comparison atom is displayed in the form, |
|---|---|
| **Then** | the ontologist sees the variable, the comparison operator and the value; if the value corresponds to a known `individual` in the `ontology`, that `individual` is displayed as a navigable chip; otherwise a free-text input is provided; a separate button allows the `individual` picker to be opened. |

---

**Source code:** `swrl_editor.js` → `_renderAtom()` (branch `case 'equality_atom'`) — Displays a `?var` field, an operator selector (`=`, `!=`, `>`, `>=`, `<`, `<=`) and, if `value` corresponds to a key in `APP.state.individuals`, a chip with a link `APP.navigateTo('individuals', value)`; otherwise a free text field; adds a button opening `openIndPicker()`.

### REQ-SWR-022 — Rendering a NAF block

| **If** | a negation (NAF) block is displayed in the form, |
|---|---|
| **Then** | the ontologist sees a clearly labelled `NAF` container in which nested atoms can be added and viewed. |

---

**Source code:** `swrl_editor.js` → `_renderAtom()` (branch `case 'naf_block'`) — Generates a container with a `NAF` header, atom-add buttons (`type_atom`, `property_atom`, `equality_atom`) and recursively calls `_renderAtomList()` on `atom.atoms`.

### REQ-SWR-023 — Rendering a nested conditional atom

| **If** | a conditional atom is displayed in the conclusion of a rule, |
|---|---|
| **Then** | the ontologist sees two nested `if` and `then` subsections, each allowing atoms of the appropriate type to be added, with automatic normalisation of legacy formats. |

---

**Source code:** `swrl_editor.js` → `_renderAtom()` (branch `case 'conditional'`) — Generates two subsections `condition` and `consequent` with their respective add buttons (`type_atom`, `property_atom`, `equality_atom`, `naf_block` in the condition; additionally `conditional` in the consequent); normalises single-object `condition` and `consequent` fields to arrays where necessary.

### REQ-SWR-024 — Class picker for `type_atom` atoms

| **If** | the ontologist opens the class picker of an atom, |
|---|---|
| **Then** | a dropdown menu listing the `classes` of the `ontology` appears positioned near the trigger, and any already open class picker closes automatically. |

| **If** | the ontologist clicks outside the dropdown menu, |
|---|---|
| **Then** | the menu closes automatically. |

---

**Source code:** `swrl_editor.js` → `toggleClassPicker()` — Closes all open `.swrl-class-picker-dropdown` elements, creates a `<div>` positioned with `position:fixed` via `_positionDropdown()`, populates the list from `APP.state.classes` sorted alphabetically, and attaches a `mousedown` listener on `document` to close on outside click.

### REQ-SWR-026 — Property picker for `property_atom` atoms

| **If** | the ontologist opens the `property` picker of an atom, |
|---|---|
| **Then** | a dropdown menu presents the `object properties` and `datatype properties` of the `ontology`, visually distinguished, sorted alphabetically within each group. |

---

**Source code:** `swrl_editor.js` → `togglePropPicker()` — Generates a `<div>` with `position:fixed` via `_positionDropdown()`; populates the list from `APP.state.object_properties` (dot `op-prop-dot`) and `APP.state.datatype_properties` (dot `dp-prop-dot`), each group sorted alphabetically, separated by an `<hr>`.

### REQ-SWR-028 — Two-panel individual picker (modal)

| **If** | the ontologist opens the `individual` picker, |
|---|---|
| **Then** | a modal window is displayed with, on the left, the hierarchical class tree of the `ontology` (including the root class with the total number of `individuals`) and, on the right, the list of `individuals` filterable by class. |

---

**Source code:** `swrl_editor.js` → `openIndPicker()` — Inserts `#swrl-ind-picker-modal` into the DOM; builds the class tree via `ClassEditor.buildTree()` adding `owl:Thing` as the first entry with the total count; the per-class count accounts for subclasses via the `subClassOf` hierarchy; calls `swrlIndPickerSelectClass('owl:Thing')` to initialise the individual list.

### REQ-SWR-033 — Dynamic dropdown positioning

| **If** | the system must display a dropdown menu near a trigger element, |
|---|---|
| **Then** | the menu opens downward if the available space allows, otherwise upward, with a width at least equal to that of the trigger and a bounded height to prevent any overflow outside the window. |

---

**Source code:** `swrl_editor.js` → `_positionDropdown()` — Computes via `getBoundingClientRect()` the available space below and above the trigger; positions the dropdown with `position:fixed` upward if the space below is insufficient; applies `min-width` equal to the trigger width or the `width` parameter (default 200 px); bounds `max-height` to 260 px or the available space.

### REQ-SWR-035 — Navigating to a referenced entity from an atom

| **If** | a class, `property` or `individual` referenced in an atom exists in the `ontology` and the ontologist clicks on its identifier displayed in the form, |
|---|---|
| **Then** | the application navigates directly to the corresponding management `view` and focuses the clicked entity. |

| **If** | the ontologist hovers over the identifier of a referenced entity, |
|---|---|
| **Then** | an underline and an accent colour visually indicate that the element is navigable. |

---

**Source code:** `swrl_editor.js` → `_renderAtom()` (branches `type_atom`, `property_atom`, `equality_atom`) — Generates a clickable element with an `onclick` handler calling `APP.navigateTo(tab, id)` where `tab` is `'classes'`, `'object-properties'`, `'datatype-properties'` or `'individuals'` depending on the entity type; applies the styles `text-decoration: underline` and `color: var(--accent)` on hover via CSS.

### REQ-SWR-038 — Import button in the rule list panel

| **If** | the SWRL Rules list panel is displayed, |
|---|---|
| **Then** | an **Import rules** button is shown to the left of the **+** (add rule) button in the panel header, allowing the ontologist to import `SWRL rules` from a `.sword` file. |

---

**Source code:** `swrl_editor.js` → `renderSplit()` — Renders, in the `tree-panel-header`, an import button (`📥`, `title="Import rules from a .sword file"`) calling `SWRLEditor.importRules()` immediately before the new-rule button (`➕`) calling `SWRLEditor.newRule()`.

### REQ-SWR-039 — Homogeneous class and property pickers

| **If** | the ontologist opens the class picker (`type_atom`) or the property picker (`property_atom`, middle column) of an atom, |
|---|---|
| **Then** | the picker uses the same presentation as the rest of the application — a **Filter** field at the top and a **tree-mode** display; the property picker shows two tree sections, first `ObjectProperties`, then `DatatypeProperties`. |

---

**Source code:** `swrl_editor.js` → `toggleClassPicker()` and `togglePropPicker()` — Both build a tree-mode dropdown decorated by `_decoratePickerWithFilter()`, which adds a filter field and a scrollable list consistent with the other tabs; `toggleClassPicker()` populates the tree via `_classTreePickerItems()`; `togglePropPicker()` renders an `ObjectProperties` section (dot `op-prop-dot`) followed by a `DatatypeProperties` section (dot `dp-prop-dot`).
