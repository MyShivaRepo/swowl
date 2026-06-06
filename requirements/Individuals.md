# Requirements — Individuals

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-IND-002 — Class tree with transitive counters](#req-ind-002--class-tree-with-transitive-counters)
- [REQ-IND-003 — Filtered and sorted individuals list](#req-ind-003--filtered-and-sorted-individuals-list)
- [REQ-IND-007 — Creation of a new individual](#req-ind-007--creation-of-a-new-individual)
- [REQ-IND-009 — Deletion of one or more individuals](#req-ind-009--deletion-of-one-or-more-individuals)
- [REQ-IND-010 — Drag-and-drop move to a class](#req-ind-010--drag-and-drop-move-to-a-class)
- [REQ-IND-015 — Type management (rdf:type)](#req-ind-015--type-management-rdftype)
- [REQ-IND-018 — Functional cardinality management for properties](#req-ind-018--functional-cardinality-management-for-properties)
- [REQ-IND-020 — On-the-fly creation of an individual from the picker](#req-ind-020--on-the-fly-creation-of-an-individual-from-the-picker)
- [REQ-IND-021 — Automatic save (autoSave)](#req-ind-021--automatic-save-autosave)
- [REQ-IND-022 — Explicit save: creation and update](#req-ind-022--explicit-save-creation-and-update)
- [REQ-IND-023 — Single individual deletion from the form](#req-ind-023--single-individual-deletion-from-the-form)
- [REQ-IND-024 — Preservation of sameAs and differentFrom during save](#req-ind-024--preservation-of-sameas-and-differentfrom-during-save)
- [REQ-IND-025 — Collection of object assertions from panels](#req-ind-025--collection-of-object-assertions-from-panels)
- [REQ-IND-026 — Collection of data assertions from panels](#req-ind-026--collection-of-data-assertions-from-panels)
- [REQ-IND-027 — Simple display rule (single property)](#req-ind-027--simple-display-rule-single-property)
- [REQ-IND-028 — Composite display rule (multi-property with separator)](#req-ind-028--composite-display-rule-multi-property-with-separator)
- [REQ-IND-029 — Display label resolution by class inheritance](#req-ind-029--display-label-resolution-by-class-inheritance)
- [REQ-IND-030 — Multilingual rdfs:label resolution](#req-ind-030--multilingual-rdfslabel-resolution)
- [REQ-IND-031 — Persistence of display rules in the ontology](#req-ind-031--persistence-of-display-rules-in-the-ontology)
- [REQ-IND-032 — Automatic identifier generation for a new individual](#req-ind-032--automatic-identifier-generation-for-a-new-individual)
- [REQ-IND-037 — Hierarchical class depth for ordering](#req-ind-037--hierarchical-class-depth-for-ordering)
- [REQ-IND-038 — Separate collection of inherited and direct properties](#req-ind-038--separate-collection-of-inherited-and-direct-properties)
- [REQ-IND-039 — Filtering of candidate individuals by OP range](#req-ind-039--filtering-of-candidate-individuals-by-op-range)

### Form
- [REQ-IND-001 — Three-column layout](#req-ind-001--three-column-layout)
- [REQ-IND-004 — Class selection in the tree](#req-ind-004--class-selection-in-the-tree)
- [REQ-IND-005 — Simple individual selection](#req-ind-005--simple-individual-selection)
- [REQ-IND-006 — Multiple selection via Shift+Click](#req-ind-006--multiple-selection-via-shiftclick)
- [REQ-IND-008 — Cancellation of the creation form](#req-ind-008--cancellation-of-the-creation-form)
- [REQ-IND-011 — Individual detail form](#req-ind-011--individual-detail-form)
- [REQ-IND-012 — IRI identifier displayed in the form header](#req-ind-012--iri-identifier-displayed-in-the-form-header)
- [REQ-IND-013 — Annotations: labels and comments](#req-ind-013--annotations-labels-and-comments)
- [REQ-IND-014 — Custom property annotations](#req-ind-014--custom-property-annotations)
- [REQ-IND-016 — Dynamic property panels (Object Properties)](#req-ind-016--dynamic-property-panels-object-properties)
- [REQ-IND-017 — Dynamic property panels (Datatype Properties)](#req-ind-017--dynamic-property-panels-datatype-properties)
- [REQ-IND-019 — Opening the individual picker for an Object Property](#req-ind-019--opening-the-individual-picker-for-an-object-property)
- [REQ-IND-033 — Navigation to a target individual from an Object Property](#req-ind-033--navigation-to-a-target-individual-from-an-object-property)
- [REQ-IND-034 — Clickable link for URL-typed data values](#req-ind-034--clickable-link-for-url-typed-data-values)
- [REQ-IND-035 — "Where Used" panel in the form](#req-ind-035--where-used-panel-in-the-form)
- [REQ-IND-036 — Column resizing by drag-and-drop](#req-ind-036--column-resizing-by-drag-and-drop)

---

## 1. Substance — Business logic

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviors, validations, persistence.


### REQ-IND-002 — Class tree with transitive counters

| **If** | the ontology is loaded and contains OWL classes linked by `subClassOf` relations, |
|---|---|
| **Then** | the system builds and displays a class tree via `ClassEditor.buildTree()`:<br>- the root node `owl:Thing` shows the total number of individuals,<br>- each class displays a **transitive** counter of the number of individuals whose at least one type belongs to the set of its descendants (computed by BFS via `allDescendants()`),<br>- the indentation of each node is proportional to its depth (`depth * 16 + 6` px),<br>- each node is a drop target for drag-and-drop. |

---

**Source code:** `owl_editor.js` → `_renderClassTree()`

### REQ-IND-003 — Filtered and sorted individuals list

| **If** | the Individuals tab is displayed, **and** a class is optionally selected in the tree (`_selectedClassId`), |
|---|---|
| **Then** | - if no class is selected, all individuals are listed,<br>- if a class is selected, only individuals whose at least one type belongs to that class or one of its subclasses (transitive filtering by BFS) are displayed,<br>- the list is sorted alphabetically by the resolved display label (`_resolveDisplayLabel()`), or by identifier if no label is defined,<br>- each item displays the main label and, if distinct, the identifier as subtext,<br>- each item is draggable. |

---

**Source code:** `owl_editor.js` → `_renderIndList()`

### REQ-IND-007 — Creation of a new individual

| **If** | the user triggers the creation of a new individual, |
|---|---|
| **Then** | - the current selection is cleared,<br>- a ghost placeholder `new individual…` is inserted at the top of the list (column 2),<br>- the blank form is displayed in column 3 via `renderForm(null, selectedClassId)`,<br>- after 30 ms, `Settings.generateIndividualId()` pre-fills the ID field, which is given focus and its content is selected. |

---

**Source code:** `owl_editor.js` → `newIndividual()`

### REQ-IND-009 — Deletion of one or more individuals

| **If** | the user confirms the deletion of one or more selected individuals (`_selectedIndIds`), |
|---|---|
| **Then** | - a `UI.confirm()` prompt is displayed (message adapted to singular or plural),<br>- `API.deleteIndividual()` is called in a loop for each ID,<br>- on success, the entire selection is reset, the state is refreshed via `APP.refresh()`, columns 1 and 2 are regenerated, and column 3 displays an empty state. |

---

**Source code:** `owl_editor.js` → `deleteSelected()`

### REQ-IND-010 — Drag-and-drop move to a class

| **If** | the user drops an individual onto a class node in the tree, |
|---|---|
| **Then** | the system applies one of the following three logics:<br>- (a) if the source class is known and present in the individual's types, it is **replaced** by the target class,<br>- (b) if the individual has only one type, it is replaced by the target class,<br>- (c) otherwise, the target class is **added** to the existing types without duplicates, |

then the change is sent via `API.updateIndividual()`, the section is re-rendered and the individual remains selected.

---

**Source code:** `owl_editor.js` → `_onClassDrop()`

### REQ-IND-015 — Type management (rdf:type)

| **If** | the user adds a type to an individual, |
|---|---|
| **Then** | `addType()` inserts the type into the `ind-types-list` list via `_addListItem()` and triggers autoSave if the individual is being edited. |

| **If** | the user removes a type from an individual, |
|---|---|
| **Then** | `removeType()` removes the type via `_removeListItem()`; if the list becomes empty, the `owl:NamedIndividual` placeholder is re-inserted; autoSave is triggered in both cases. |

---

**Source code:** `owl_editor.js` → `addType()`, `removeType()`

### REQ-IND-018 — Functional cardinality management for properties

| **If** | a property is marked as functional (`opData?.characteristics?.functional` or `dpData?.functional`) and a value already exists, |
|---|---|
| **Then** | - the `+` add-value button is hidden (`addBtnHidden`) when rendering the panel,<br>- `_refreshAddBtn()` keeps this visibility up to date after each addition or deletion,<br>- `confirmPicker()` blocks the insertion of a new value if the panel is in `single` mode and already contains a value. |

---

**Source code:** `owl_editor.js` → `_renderPropPanel()`, `_refreshAddBtn()`, `confirmPicker()`

### REQ-IND-020 — On-the-fly creation of an individual from the picker

| **If** | the user requests the creation of a new individual from the picker (`pickerCreateNew()`), |
|---|---|
| **Then** | - an inline input field is inserted into the picker list (one field at a time),<br>- the ID is pre-filled via `Settings.generateIndividualId()`,<br>- the `Enter` key confirms creation, the `Escape` key cancels. |

| **If** | the user confirms creation (`_pickerConfirmNew()`), |
|---|---|
| **Then** | the individual is created via `API.createIndividual()` with initial types corresponding to the class selected in the picker, the list is refreshed and the new individual is selected. |

---

**Source code:** `owl_editor.js` → `pickerCreateNew()`, `_pickerConfirmNew()`

### REQ-IND-021 — Automatic save (autoSave)

| **If** | a form field is modified via `onchange` **and** an existing individual is being edited (`_editingId !== null`), |
|---|---|
| **Then** | `save(false)` is called automatically to persist the changes. |

---

**Source code:** `owl_editor.js` → `autoSave()`

### REQ-IND-022 — Explicit save: creation and update

| **If** | the user triggers an explicit save, |
|---|---|
| **Then** | the system collects:<br>- the ID (spaces replaced by underscores),<br>- annotations via `_collectAnnotations()`,<br>- types via `_collectList()`,<br>- `objectAssertions` and `dataAssertions` from the DOM panels. |

| **If** | `isNew=true`, |
|---|---|
| **Then** | `API.createIndividual()` is called, `_selectedIndId` and `_editingId` are updated, all three columns are re-rendered and `APP.refresh()` is called. |

| **If** | `isNew=false`, |
|---|---|
| **Then** | `API.updateIndividual(originalId, ind)` is called; if the ID has changed, a rename message is displayed; `APP.refresh()` is called in both cases. |

---

**Source code:** `owl_editor.js` → `save()`

### REQ-IND-023 — Single individual deletion from the form

| **If** | the user confirms the deletion of an individual from the form (`UI.confirm()`), |
|---|---|
| **Then** | - `API.deleteIndividual()` is called,<br>- if the deleted individual was selected (`_selectedIndId === id`), `_selectedIndId` and `_editingId` are reset and column 3 displays the empty state,<br>- columns 1 and 2 are regenerated. |

---

**Source code:** `owl_editor.js` → `delete()`

### REQ-IND-024 — Preservation of sameAs and differentFrom during save

| **If** | a save is triggered for an individual, |
|---|---|
| **Then** | the existing values of `sameAs` and `differentFrom` are retrieved from `APP.state.individuals` (via the original ID or the new ID) and are systematically included in the object sent to the API, with no possibility of modification via the main form. |

---

**Source code:** `owl_editor.js` → `save()`

### REQ-IND-025 — Collection of object assertions from panels

| **If** | a save is triggered, |
|---|---|
| **Then** | the system queries all DOM elements `.ind-prop-panel[data-kind="op"]`: for each `.ind-op-target` (hidden input or select) whose value is non-empty, an object `{ property, target }` is built from `panel.dataset.prop` and added to the `objectAssertions` array. |

---

**Source code:** `owl_editor.js` → `save()`

### REQ-IND-026 — Collection of data assertions from panels

| **If** | a save is triggered, |
|---|---|
| **Then** | the system queries all DOM elements `.ind-prop-panel[data-kind="dp"]`: for each `.ind-prop-row` containing a non-empty `.ind-dp-value` value, an object `{ property, value, datatype }` is built — the datatype is read from `dataset.dtype` of the `.ind-dp-type` element, with `xsd:string` as the default value. |

---

**Source code:** `owl_editor.js` → `save()`

### REQ-IND-027 — Simple display rule (single property)

| **If** | the user opens the display rule modal via `_openDisplayPropModal()`, |
|---|---|
| **Then** | all available properties for the selected class are listed (annotations, inherited properties, direct properties and via domain), with an `(inherited)` marker for those already active by inheritance. |

| **If** | the user selects or removes a property via `setDisplayProp()`, |
|---|---|
| **Then** | the rule is saved (or deleted if `null`) in `_displayProps[classId \|\| '__root__']`; `_getEffectiveDisplayProp()` recursively traverses the class hierarchy to determine the rule applicable to a given individual. |

---

**Source code:** `owl_editor.js` → `setDisplayProp()`, `_openDisplayPropModal()`, `_getEffectiveDisplayProp()`

### REQ-IND-028 — Composite display rule (multi-property with separator)

| **If** | the user opens the composite display rule modal via `_openDisplayPropsMultiModal()`, |
|---|---|
| **Then** | a modal with editable `{separator, property}` rows is displayed; `_addDisplayMultiRow()` allows adding an empty row. |

| **If** | the user confirms via `_confirmDisplayMulti()`, |
|---|---|
| **Then** | `setDisplayPropsMulti()` saves the composite rule in `_displayPropsMulti[classId \|\| '__root__']` (or deletes it if `null`/empty); `_getEffectiveDisplayMulti()` traverses the class hierarchy analogously to `_getEffectiveDisplayProp()`. |

---

**Source code:** `owl_editor.js` → `_openDisplayPropsMultiModal()`, `_addDisplayMultiRow()`, `_confirmDisplayMulti()`, `setDisplayPropsMulti()`, `_getEffectiveDisplayMulti()`

### REQ-IND-029 — Display label resolution by class inheritance

| **If** | the system must display the label of an individual, |
|---|---|
| **Then** | it looks for an applicable display rule according to the following priority: 1. the individual's own types, 2. the context class (class selected in the tree or picker class), 3. the root rule (`__root__`), |

checking for each candidate class first the composite rule (`_getEffectiveDisplayMulti()`) then the simple rule (`_getEffectiveDisplayProp()`); the label is built via `_buildMultiLabel()` or `_getDisplayLabel()` depending on the rule type.

---

**Source code:** `owl_editor.js` → `_resolveDisplayLabel()`

### REQ-IND-030 — Multilingual rdfs:label resolution

| **If** | the system resolves the display label of an individual from an `rdfs:label` property, |
|---|---|
| **Then** | - for the form `rdfs:label@{lang}`, it first looks for the exact requested language, then the other active languages (`Settings.activeLangs`) in order, then the first available label regardless of language,<br>- for the form without language, it uses `Settings.preferredLang` as priority, or the first available label,<br>- the forms `rdfs:comment`, `other` annotations (by property), `dataAssertions` and `objectAssertions` (returns the target) are also supported. |

---

**Source code:** `owl_editor.js` → `_getDisplayLabel()`

### REQ-IND-031 — Persistence of display rules in the ontology

| **If** | display rules are modified, |
|---|---|
| **Then** | `_saveDisplayRules()` builds an object `{ single: _displayProps, multi: _displayPropsMulti }`, sends it via `API.updateDisplayRules()` and updates `APP.state.ontology.display_rules` in memory. |

| **If** | the ontology is loaded, |
|---|---|
| **Then** | `_loadDisplayRules()` reads `APP.state.ontology?.display_rules` and initializes the two internal maps `_displayProps` and `_displayPropsMulti`. |

---

**Source code:** `owl_editor.js` → `_saveDisplayRules()`, `_loadDisplayRules()`

### REQ-IND-032 — Automatic identifier generation for a new individual

| **If** | the creation form for a new individual is displayed (`newIndividual()`) **or** an inline input field is inserted into the picker (`pickerCreateNew()`), |
|---|---|
| **Then** | after 30 ms, `Settings.generateIndividualId(this._selectedClassId)` is called to pre-fill the corresponding ID field. |

---

**Source code:** `owl_editor.js` → `newIndividual()`, `pickerCreateNew()`

### REQ-IND-037 — Hierarchical class depth for ordering

| **If** | the system must order the properties of an individual by hierarchical depth, |
|---|---|
| **Then** | `_classDepth()` computes the depth of each class by iterative BFS traversing up the parents (`subClassOf` of string type only), with protection against cycles (via `visited` marking); the result is used in `_getClassProperties()` to order properties from highest to lowest in the hierarchy. |

---

**Source code:** `owl_editor.js` → `_classDepth()`

### REQ-IND-038 — Separate collection of inherited and direct properties

| **If** | the form of an individual is rendered, |
|---|---|
| **Then** | `_getClassProperties()` analyzes the individual's types and returns two maps:<br>- `asserted`: restrictions defined on the direct types, ordered by ascending depth then alphabetically,<br>- `inherited`: restrictions defined on ancestors, without duplicates with `asserted`, |

the nature of each property (`op` or `dp`) being determined by looking in `APP.state.object_properties`; inherited panels are displayed before direct ones.

---

**Source code:** `owl_editor.js` → `_getClassProperties()`

### REQ-IND-039 — Filtering of candidate individuals by OP range

| **If** | the system must propose individuals compatible with the range of an Object Property, |
|---|---|
| **Then** | `_indsOfRange()` returns the list of individuals whose at least one type belongs to the computed set (descendants of the range classes included via `ClassEditor.buildTree()`), excluding the individual currently being edited; if `rangeClasses` is empty or null, all individuals (except the excluded one) are returned. |

---

## 2. Form — Presentation and user interface

> Requirements relating to display: layout, visual components, interactions, navigation, styles.

**Source code:** `owl_editor.js` → `_indsOfRange()`

### REQ-IND-001 — Three-column layout

| **If** | the Individuals tab is loaded, |
|---|---|
| **Then** | the system generates a `section-split` layout with three columns:<br>- column 1: class tree (`ind-tree-panel`),<br>- column 2: individuals list (`ind-list-panel`),<br>- column 3: detail/form panel (`ind-detail`), displaying by default an empty state inviting the user to select or create an individual, |

with two resizable separators (`ind-split-h1`, `ind-split-h2`) inserted between the columns.

---

**Source code:** `owl_editor.js` → `renderSplit()`

### REQ-IND-004 — Class selection in the tree

| **If** | the user clicks on a class in the tree, |
|---|---|
| **Then** | - `_selectedClassId` is updated,<br>- all individual selections are reset,<br>- the column 1 highlight is refreshed,<br>- the column 2 title is updated,<br>- the filtered list is regenerated via `_renderIndList()`,<br>- column 3 displays an empty state with the `owl:Thing` message and a creation button. |

---

**Source code:** `owl_editor.js` → `selectClass()`

### REQ-IND-005 — Simple individual selection

| **If** | the user clicks on an individual without holding the Shift key, |
|---|---|
| **Then** | - `_selectedIndIds` is initialized with the single clicked identifier,<br>- the anchor point `_anchorIndId` is set,<br>- the individual's form is displayed via `renderForm()` in column 3,<br>- the delete button is activated via `_setDelBtn()`. |

---

**Source code:** `owl_editor.js` → `selectIndividual()`

### REQ-IND-006 — Multiple selection via Shift+Click

| **If** | the user clicks on an individual with the Shift key (`isShift === true`) **and** an anchor point exists, |
|---|---|
| **Then** | the range of indices between the anchor and the clicked item in the DOM list is computed and all intermediate items are selected; if the selection exceeds one individual, column 3 displays a summary `N individuals selected` with a bulk delete button and `_editingId` is set to `null`. |

---

**Source code:** `owl_editor.js` → `selectIndividual()`

### REQ-IND-008 — Cancellation of the creation form

| **If** | the user cancels the creation form, |
|---|---|
| **Then** | - all selection and editing variables are reset,<br>- the ghost placeholder is removed from the list,<br>- column 3 restores the empty state with the start message and the creation button. |

---

**Source code:** `owl_editor.js` → `_cancelForm()`

### REQ-IND-011 — Individual detail form

| **If** | an individual is selected or being created, |
|---|---|
| **Then** | `renderForm()` generates the complete form with the following blocks:<br>- ID field with real-time sanitization (`_sanitizeId()`),<br>- Annotations section,<br>- Types section (`rdf:type`),<br>- dynamic property panels via `_getClassProperties()` and `_renderPropPanel()`,<br>- for an existing individual, a `_whereUsedFrame()` block at the bottom of the form,<br>- for a new individual, the ID field triggers `save(true)` on `blur`. |

---

**Source code:** `owl_editor.js` → `renderForm()`

### REQ-IND-012 — IRI identifier displayed in the form header

| **If** | the ontology has a base IRI (`APP.state.ontology?.id`) **and** the individual has an identifier, |
|---|---|
| **Then** | the full IRI in the form `{baseIri}#{id}` is displayed in the `cls-editor-iri` element of the form header; this line is not displayed for new individuals (empty IRI). |

---

**Source code:** `owl_editor.js` → `renderForm()`

### REQ-IND-013 — Annotations: labels and comments

| **If** | the form is displayed, existing annotations (`labels`, `comments`, `other`) are rendered via `_annoRow()`.  **If** the user adds an annotation row via `addAnnotRow()`, |
|---|---|
| **Then** | a new row is dynamically inserted into `ind-annotations-body` via `_makeAnnotRow()`, with `onchange` enabled for autoSave if the individual is being edited. |

| **If** | the user removes a row via `removeAnnotRow()`, |
|---|---|
| **Then** | the DOM row is deleted and autoSave is triggered. |

---

**Source code:** `owl_editor.js` → `renderForm()`, `addAnnotRow()`, `removeAnnotRow()`

### REQ-IND-014 — Custom property annotations

| **If** | the user selects a property in the `ind-anno-picker` selector, |
|---|---|
| **Then** | `addOtherAnnotRow()` adds an `other` annotation row in the annotations table using the property passed as parameter, then hides the selector. |

---

**Source code:** `owl_editor.js` → `addOtherAnnotRow()`

### REQ-IND-016 — Dynamic property panels (Object Properties)

| **If** | the form of an individual is rendered and Object Properties are associated with its types, |
|---|---|
| **Then** | `_renderPropPanel()` generates one panel per `op` property: each existing `objectAssertion` is displayed with the target's label (via `_labelForId()`), a navigation link to the target individual and a delete button; `addPropValue()` (for `kind='op'`) builds a `<select>` populated by `_indsOfRange()` filtered on the effective range of the property. |

---

**Source code:** `owl_editor.js` → `_renderPropPanel()`, `addPropValue()`

### REQ-IND-017 — Dynamic property panels (Datatype Properties)

| **If** | the form of an individual is rendered and Datatype Properties are associated with its types, |
|---|---|
| **Then** | `_renderPropPanel()` generates one panel per `dp` property: each existing `dataAssertion` is displayed with an editable text field, the datatype (`xsd:string` by default or the first range of the property) and a delete button; if the value is a URL (`/^https?:\/\//i`), a clickable `🔗` link is displayed; `addPropValue()` (for `kind='dp'`) creates an empty text field with the default datatype. |

---

**Source code:** `owl_editor.js` → `_renderPropPanel()`, `addPropValue()`

### REQ-IND-019 — Opening the individual picker for an Object Property

| **If** | the user opens the picker for an Object Property via `openPicker()`, |
|---|---|
| **Then** | a modal overlay is displayed with two panels: a tree of allowed classes (filtered according to the `effectiveRange` of the property, or all classes if no range) and a list of individuals. |

| **If** | the user selects a class in the picker via `pickerSelectClass()`, |
|---|---|
| **Then** | the individuals list is updated (transitive filtering) excluding the individual currently being edited. |

| **If** | the user selects an individual via `pickerSelectInd()`, |
|---|---|
| **Then** | the OK button is activated. |

| **If** | the user confirms via `confirmPicker()`, |
|---|---|
| **Then** | the chosen individual is inserted as a new row in the property panel. |

| **If** | the user closes the picker via `closePicker()`, |
|---|---|
| **Then** | the overlay is removed from the DOM. |

---

**Source code:** `owl_editor.js` → `openPicker()`, `pickerSelectClass()`, `pickerSelectInd()`, `confirmPicker()`, `closePicker()`

### REQ-IND-033 — Navigation to a target individual from an Object Property

| **If** | an `op` panel displays values, |
|---|---|
| **Then** | each value includes a link `onclick="APP.navigateTo('individuals','${a.target}')"` allowing direct navigation to the target individual in the Individuals tab; this same link is generated after selection via `confirmPicker()`. |

---

**Source code:** `owl_editor.js` → `_renderPropPanel()`

### REQ-IND-034 — Clickable link for URL-typed data values

| **If** | the value of a `dataAssertion` in a `dp` panel matches the regular expression `/^https?:\/\//i`, |
|---|---|
| **Then** | an `<a>` link with the `🔗` icon is inserted to the right of the text field, opening the URL in a new tab (`target="_blank"`). |

---

**Source code:** `owl_editor.js` → `_renderPropPanel()`

### REQ-IND-035 — "Where Used" panel in the form

| **If** | the form displays an existing individual (`ind` non-null), |
|---|---|
| **Then** | `_whereUsedFrame(r => _ruleUsesIndividual(r, ind.id))` is called and its result is inserted at the bottom of the form, listing the SWRL rules or other entities that reference the individual. |

---

**Source code:** `owl_editor.js` → `renderForm()`

### REQ-IND-036 — Column resizing by drag-and-drop

| **If** | the user drags a column separator (`ind-split-h1` or `ind-split-h2`), |
|---|---|
| **Then** | `_initHandle()` adjusts in real time the CSS width of the adjacent panel via `mousedown`/`mousemove`/`mouseup` listeners on `document`, within the following limits:<br>- `ind-split-h1` / `ind-tree-panel`: between 120 and 520 px,<br>- `ind-split-h2` / `ind-list-panel`: between 100 and 400 px. |

---

*Document generated by static analysis of the `owl_editor.js` source code — no extrapolated functionality.*

**Source code:** `owl_editor.js` → `_initHandle()`, `_initSplitPanes()`
