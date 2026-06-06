# Requirements — Individuals

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of Contents

### Substance
- [REQ-IND-001 — Class tree with transitive counters](#req-ind-001--class-tree-with-transitive-counters)
- [REQ-IND-002 — Filtered and sorted individuals list](#req-ind-002--filtered-and-sorted-individuals-list)
- [REQ-IND-003 — Creating a new individual](#req-ind-003--creating-a-new-individual)
- [REQ-IND-004 — Deleting one or more individuals](#req-ind-004--deleting-one-or-more-individuals)
- [REQ-IND-005 — Moving by drag-and-drop to a class](#req-ind-005--moving-by-drag-and-drop-to-a-class)
- [REQ-IND-006 — Type management (rdf:type)](#req-ind-006--type-management-rdftype)
- [REQ-IND-007 — Functional cardinality management for properties](#req-ind-007--functional-cardinality-management-for-properties)
- [REQ-IND-008 — On-the-fly individual creation from the picker](#req-ind-008--on-the-fly-individual-creation-from-the-picker)
- [REQ-IND-009 — Automatic save (autoSave)](#req-ind-009--automatic-save-autosave)
- [REQ-IND-010 — Explicit save: creation and update](#req-ind-010--explicit-save-creation-and-update)
- [REQ-IND-011 — Single individual deletion from the form](#req-ind-011--single-individual-deletion-from-the-form)
- [REQ-IND-012 — Preservation of sameAs and differentFrom during save](#req-ind-012--preservation-of-sameas-and-differentfrom-during-save)
- [REQ-IND-013 — Collecting object assertions from panels](#req-ind-013--collecting-object-assertions-from-panels)
- [REQ-IND-014 — Collecting data assertions from panels](#req-ind-014--collecting-data-assertions-from-panels)
- [REQ-IND-015 — Simple display rule (single property)](#req-ind-015--simple-display-rule-single-property)
- [REQ-IND-016 — Composite display rule (multi-properties with separator)](#req-ind-016--composite-display-rule-multi-properties-with-separator)
- [REQ-IND-017 — Display label resolution by class inheritance](#req-ind-017--display-label-resolution-by-class-inheritance)
- [REQ-IND-018 — Multilingual rdfs:label resolution](#req-ind-018--multilingual-rdfslabel-resolution)
- [REQ-IND-019 — Persistence of display rules in the ontology](#req-ind-019--persistence-of-display-rules-in-the-ontology)
- [REQ-IND-020 — Automatic identifier generation for a new individual](#req-ind-020--automatic-identifier-generation-for-a-new-individual)
- [REQ-IND-021 — Hierarchical class depth for ordering](#req-ind-021--hierarchical-class-depth-for-ordering)
- [REQ-IND-022 — Separate collection of inherited and direct properties](#req-ind-022--separate-collection-of-inherited-and-direct-properties)
- [REQ-IND-023 — Filtering candidate individuals by OP range](#req-ind-023--filtering-candidate-individuals-by-op-range)

### Form
- [REQ-IND-024 — Three-column layout](#req-ind-024--three-column-layout)
- [REQ-IND-025 — Selecting a class in the tree](#req-ind-025--selecting-a-class-in-the-tree)
- [REQ-IND-026 — Single individual selection](#req-ind-026--single-individual-selection)
- [REQ-IND-027 — Multiple selection via Shift+Click](#req-ind-027--multiple-selection-via-shiftclick)
- [REQ-IND-028 — Cancelling the creation form](#req-ind-028--cancelling-the-creation-form)
- [REQ-IND-029 — Individual detail form](#req-ind-029--individual-detail-form)
- [REQ-IND-030 — IRI identifier displayed in the form header](#req-ind-030--iri-identifier-displayed-in-the-form-header)
- [REQ-IND-031 — Annotations: labels and comments](#req-ind-031--annotations-labels-and-comments)
- [REQ-IND-032 — Custom property annotations](#req-ind-032--custom-property-annotations)
- [REQ-IND-033 — Dynamic property panels (Object Properties)](#req-ind-033--dynamic-property-panels-object-properties)
- [REQ-IND-034 — Dynamic property panels (Datatype Properties)](#req-ind-034--dynamic-property-panels-datatype-properties)
- [REQ-IND-035 — Opening the individual picker for an Object Property](#req-ind-035--opening-the-individual-picker-for-an-object-property)
- [REQ-IND-036 — Navigating to a target individual from an Object Property](#req-ind-036--navigating-to-a-target-individual-from-an-object-property)
- [REQ-IND-037 — Clickable link for URL-type data values](#req-ind-037--clickable-link-for-url-type-data-values)
- [REQ-IND-038 — "Where Used" panel in the form](#req-ind-038--where-used-panel-in-the-form)
- [REQ-IND-039 — Column resizing by drag-and-drop](#req-ind-039--column-resizing-by-drag-and-drop)

---

## 1. Substance — Business logic and functional rules

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviours, validations, persistence.


### REQ-IND-001 — Class tree with transitive counters

The method builds the OWL class tree via `ClassEditor.buildTree()`. It displays the `owl:Thing` node at the top with the total number of individuals. For each class, it computes a **transitive** counter: the number of individuals whose at least one type belongs to the set of descendants of that class (computed by BFS via `allDescendants()`). Indentation is proportional to depth (`depth * 16 + 6` px). Each node is a drop zone target for drag-and-drop.

---

**Source code:** `owl_editor.js` → `_renderClassTree()`

### REQ-IND-002 — Filtered and sorted individuals list

The method filters individuals according to the selected class (`_selectedClassId`). If no class is selected, all individuals are displayed. If a class is selected, the filter is **transitive**: it includes individuals whose type belongs to the class or to one of its subclasses (BFS). The list is sorted alphabetically by the resolved display label (`_resolveDisplayLabel()`), or by identifier if no label is defined. Each item displays the primary label and, if distinct, the identifier as subtext. Each item is draggable.

---

**Source code:** `owl_editor.js` → `_renderIndList()`

### REQ-IND-003 — Creating a new individual

The method clears the current selection, inserts a ghost placeholder `new individual…` at the top of the list (column 2), and displays the blank form in column 3 via `renderForm(null, selectedClassId)`. A `setTimeout` of 30 ms calls `Settings.generateIndividualId()` to pre-fill the ID field, then sets focus to that field and selects its content.

---

**Source code:** `owl_editor.js` → `newIndividual()`

### REQ-IND-004 — Deleting one or more individuals

The method retrieves the set of selected IDs (`_selectedIndIds`), displays a confirmation via `UI.confirm()` (singular or plural message), then calls `API.deleteIndividual()` in a loop for each ID. On success, it resets the entire selection, refreshes state via `APP.refresh()`, and regenerates columns 1 and 2. Column 3 displays an empty state.

---

**Source code:** `owl_editor.js` → `deleteSelected()`

### REQ-IND-005 — Moving by drag-and-drop to a class

When an individual is dropped onto a class node, the method applies one of the following three logics: (a) if the source class is known and present in the individual's types, it **replaces** that type with the target class; (b) if the individual has only one type, that type is replaced; (c) otherwise, the target class is **added** to the existing types (without duplicates). The modification is sent via `API.updateIndividual()`, then the section is re-rendered and the individual remains selected.

---

**Source code:** `owl_editor.js` → `_onClassDrop()`

### REQ-IND-006 — Type management (rdf:type)

`addType()` calls `_addListItem()` to insert a type into the `ind-types-list` list and triggers autoSave if the individual is being edited. `removeType()` calls `_removeListItem()` to remove the type; if the list becomes empty, the `owl:NamedIndividual` placeholder is reinserted. AutoSave is triggered in both cases.

---

**Source code:** `owl_editor.js` → `addType()`, `removeType()`

### REQ-IND-007 — Functional cardinality management for properties

`_renderPropPanel()` determines multiplicity (`single`/`multiple`) based on `opData?.characteristics?.functional` or `dpData?.functional`. If `single=true` and a value already exists, the `+` button is hidden (`addBtnHidden`). `_refreshAddBtn()` updates button visibility after each addition/removal. `confirmPicker()` blocks insertion if the panel is `single` and already contains a value.

---

**Source code:** `owl_editor.js` → `_renderPropPanel()`, `_refreshAddBtn()`, `confirmPicker()`

### REQ-IND-008 — On-the-fly individual creation from the picker

`pickerCreateNew()` inserts an inline input field into the picker list (one field at a time). It pre-fills the ID via `Settings.generateIndividualId()`, handles the `Enter` (confirm) and `Escape` (cancel) keys. `_pickerConfirmNew()` creates the individual via `API.createIndividual()` with initial types corresponding to the class selected in the picker, then refreshes the list and selects the new individual.

---

**Source code:** `owl_editor.js` → `pickerCreateNew()`, `_pickerConfirmNew()`

### REQ-IND-009 — Automatic save (autoSave)

The method calls `save(false)` only if `_editingId !== null`, i.e. only when an existing individual is being edited. It is triggered via `onchange` on all fields of an existing individual's form.

---

**Source code:** `owl_editor.js` → `autoSave()`

### REQ-IND-010 — Explicit save: creation and update

The method collects the ID (with spaces replaced by underscores), annotations via `_collectAnnotations()`, types via `_collectList()`, `objectAssertions` and `dataAssertions` from the DOM panels. If `isNew=true`, it calls `API.createIndividual()`, updates `_selectedIndId` and `_editingId`, and re-renders all three columns. If `isNew=false`, it calls `API.updateIndividual(originalId, ind)` — if the ID has changed, a rename message is displayed. In both cases, `APP.refresh()` is called to synchronise state.

---

**Source code:** `owl_editor.js` → `save()`

### REQ-IND-011 — Single individual deletion from the form

The method displays a `UI.confirm()` confirmation, calls `API.deleteIndividual()`, then, if the deleted individual was selected (`_selectedIndId === id`), resets `_selectedIndId` and `_editingId` and restores the empty state of column 3. It then regenerates columns 1 and 2.

---

**Source code:** `owl_editor.js` → `delete()`

### REQ-IND-012 — Preservation of sameAs and differentFrom during save

The `save()` method retrieves the existing values of `sameAs` and `differentFrom` from `APP.state.individuals` (via the original ID or the new ID) and includes them systematically in the object sent to the API. These two fields are not editable via the main form interface: they are only preserved.

---

**Source code:** `owl_editor.js` → `save()`

### REQ-IND-013 — Collecting object assertions from panels

The method queries all DOM elements `.ind-prop-panel[data-kind="op"]`, reads `panel.dataset.prop` as the property identifier, and for each `.ind-op-target` (hidden input or select) whose value is non-empty, builds an object `{ property, target }` that is added to the `objectAssertions` array.

---

**Source code:** `owl_editor.js` → `save()`

### REQ-IND-014 — Collecting data assertions from panels

The method queries all DOM elements `.ind-prop-panel[data-kind="dp"]`, reads `panel.dataset.prop`, and for each `.ind-prop-row` containing a non-empty `.ind-dp-value` value, builds an object `{ property, value, datatype }` — the datatype is read from `dataset.dtype` of the `.ind-dp-type` element, with `xsd:string` as the default value.

---

**Source code:** `owl_editor.js` → `save()`

### REQ-IND-015 — Simple display rule (single property)

`_openDisplayPropModal()` opens a modal listing all available properties for the selected class (annotations, inherited properties, direct properties, properties via domain). Properties already active through inheritance are flagged `(inherited)`. `setDisplayProp()` saves (or removes if `null`) the rule in `_displayProps[classId || '__root__']`. `_getEffectiveDisplayProp()` recursively traverses the class hierarchy to find the applicable rule.

---

**Source code:** `owl_editor.js` → `setDisplayProp()`, `_openDisplayPropModal()`, `_getEffectiveDisplayProp()`

### REQ-IND-016 — Composite display rule (multi-properties with separator)

`_openDisplayPropsMultiModal()` opens a modal with editable `{separator, property}` rows. `_addDisplayMultiRow()` adds an empty row in the modal. `_confirmDisplayMulti()` reads all rows and calls `setDisplayPropsMulti()`. `setDisplayPropsMulti()` saves the composite rule in `_displayPropsMulti[classId || '__root__']` (or removes it if `null`/empty). `_getEffectiveDisplayMulti()` traverses the class hierarchy analogously to `_getEffectiveDisplayProp()`.

---

**Source code:** `owl_editor.js` → `_openDisplayPropsMultiModal()`, `_addDisplayMultiRow()`, `_confirmDisplayMulti()`, `setDisplayPropsMulti()`, `_getEffectiveDisplayMulti()`

### REQ-IND-017 — Display label resolution by class inheritance

The method looks for an applicable display rule according to the following priority: (1) the individual's own types, (2) context class (class selected in the tree or picker class), (3) root rule (`__root__`). For each candidate class, it first checks the composite rule (`_getEffectiveDisplayMulti()`) then the simple rule (`_getEffectiveDisplayProp()`). The label is built via `_buildMultiLabel()` or `_getDisplayLabel()` depending on the rule type.

---

**Source code:** `owl_editor.js` → `_resolveDisplayLabel()`

### REQ-IND-018 — Multilingual rdfs:label resolution

The method supports the forms `rdfs:label` (without language) and `rdfs:label@{lang}`. For the form with language, it first searches for the exact requested language, then other active languages (`Settings.activeLangs`) in order, then the first available label regardless of language. For the form without language, it uses `Settings.preferredLang` as priority, or the first available label. It also supports `rdfs:comment`, `other` annotations (by property), `dataAssertions` and `objectAssertions` (returns the target).

---

**Source code:** `owl_editor.js` → `_getDisplayLabel()`

### REQ-IND-019 — Persistence of display rules in the ontology

`_saveDisplayRules()` builds an object `{ single: _displayProps, multi: _displayPropsMulti }` and sends it via `API.updateDisplayRules()`. It also updates `APP.state.ontology.display_rules` in memory. `_loadDisplayRules()` reads `APP.state.ontology?.display_rules` and initialises the two internal maps `_displayProps` and `_displayPropsMulti`.

---

**Source code:** `owl_editor.js` → `_saveDisplayRules()`, `_loadDisplayRules()`

### REQ-IND-020 — Automatic identifier generation for a new individual

In `newIndividual()`, after displaying the blank form, a `setTimeout` of 30 ms calls `Settings.generateIndividualId(this._selectedClassId)` to pre-fill the `ind-id` field. In `pickerCreateNew()`, the same method is called to pre-fill the inline input field of the picker.

---

**Source code:** `owl_editor.js` → `newIndividual()`, `pickerCreateNew()`

### REQ-IND-021 — Hierarchical class depth for ordering

The method computes the depth of a class in the hierarchy by iterative BFS traversing parents upwards (`subClassOf` of string type only). It is robust to cycles (via `visited` marking). The result is used in `_getClassProperties()` to order properties of the individual's classes from highest to lowest in the hierarchy.

---

**Source code:** `owl_editor.js` → `_classDepth()`

### REQ-IND-022 — Separate collection of inherited and direct properties

The method analyses the individual's types and returns two maps: `asserted` (restrictions defined on the individual's direct types, ordered by ascending depth then alphabetically) and `inherited` (restrictions defined on ancestors, without duplicates with `asserted`). It determines whether each property is an `op` or `dp` by looking up `APP.state.object_properties`. This separation is used in `renderForm()` to display inherited panels before direct ones.

---

**Source code:** `owl_editor.js` → `_getClassProperties()`

### REQ-IND-023 — Filtering candidate individuals by OP range

The method returns the list of individuals compatible with the range of an Object Property, excluding the individual currently being edited. If `rangeClasses` is empty or null, all individuals (except the excluded one) are returned. Otherwise, the filter is **transitive**: descendants of range classes are included via `ClassEditor.buildTree()`. Only individuals whose at least one type is in the computed set are retained.

---

**Source code:** `owl_editor.js` → `_indsOfRange()`

## 2. Form — Presentation and user interface

> Requirements relating to display: layout, visual components, interactions, navigation, styles.

### REQ-IND-024 — Three-column layout

The method generates the complete HTML of the tab as a `section-split` layout with three columns: (1) class tree (`ind-tree-panel`), (2) individuals list (`ind-list-panel`), (3) detail/form panel (`ind-detail`). The two resizable separators (`ind-split-h1`, `ind-split-h2`) are inserted between the columns. Column (3) displays by default an empty state inviting the user to select or create an individual.

---

**Source code:** `owl_editor.js` → `renderSplit()`

### REQ-IND-025 — Selecting a class in the tree

On click on a class, the method updates `_selectedClassId`, resets all individual selections, updates the highlighting in column 1, updates the column 2 title and regenerates the filtered list (`_renderIndList()`). Column 3 displays an empty state with the `owl:Thing` message and a creation button.

---

**Source code:** `owl_editor.js` → `selectClass()`

### REQ-IND-026 — Single individual selection

On a simple click on an individual (without Shift), the method initialises `_selectedIndIds` with the single clicked identifier, sets the anchor point (`_anchorIndId`), and displays the individual's form via `renderForm()` in column 3. It enables the delete button (`_setDelBtn()`).

---

**Source code:** `owl_editor.js` → `selectIndividual()`

### REQ-IND-027 — Multiple selection via Shift+Click

When `isShift === true` and an anchor point exists, the method computes the range of indices between the anchor and the clicked item in the DOM list, and selects all intermediate items. If the selection exceeds one individual, column 3 displays a summary `N individuals selected` with a bulk delete button, and `_editingId` is set to `null` (no autoSave).

---

**Source code:** `owl_editor.js` → `selectIndividual()`

### REQ-IND-028 — Cancelling the creation form

The method resets all selection and editing variables, removes the ghost placeholder from the list, and restores in column 3 the empty state with the start message and the creation button.

---

**Source code:** `owl_editor.js` → `_cancelForm()`

### REQ-IND-029 — Individual detail form

The method generates the complete form for an individual (existing or new). It builds the following blocks: (1) ID field with real-time sanitisation (`_sanitizeId()`), (2) Annotations section, (3) Types section (`rdf:type`), (4) dynamic property panels via `_getClassProperties()` and `_renderPropPanel()`. For an existing individual, a `_whereUsedFrame()` block is added at the bottom. For a new individual, the ID field triggers `save(true)` on `blur`.

---

**Source code:** `owl_editor.js` → `renderForm()`

### REQ-IND-030 — IRI identifier displayed in the form header

If the ontology has a base IRI (`APP.state.ontology?.id`) and the individual has an identifier, the form displays the full IRI in the form `{baseIri}#{id}` in a `cls-editor-iri` element. This line is not displayed for new individuals (empty IRI).

---

**Source code:** `owl_editor.js` → `renderForm()`

### REQ-IND-031 — Annotations: labels and comments

`renderForm()` displays existing annotations (`labels`, `comments`, `other`) via `_annoRow()`. `addAnnotRow()` dynamically adds a new row to `ind-annotations-body` via `_makeAnnotRow()`, enabling `onchange` for autoSave if the individual is being edited. `removeAnnotRow()` removes the DOM row and triggers autoSave.

---

**Source code:** `owl_editor.js` → `renderForm()`, `addAnnotRow()`, `removeAnnotRow()`

### REQ-IND-032 — Custom property annotations

The method adds an `other` annotation row to the annotations table, using the property passed as parameter, then hides the `ind-anno-picker` selector.

---

**Source code:** `owl_editor.js` → `addOtherAnnotRow()`

### REQ-IND-033 — Dynamic property panels (Object Properties)

`_renderPropPanel()` generates one panel per property of type `op`. For each existing `objectAssertion`, it renders a row with the target's label (via `_labelForId()`), a navigation link to the target individual, and a delete button. `addPropValue()` (for `kind='op'`) builds a `<select>` populated by `_indsOfRange()` filtered on the effective range of the property.

---

**Source code:** `owl_editor.js` → `_renderPropPanel()`, `addPropValue()`

### REQ-IND-034 — Dynamic property panels (Datatype Properties)

`_renderPropPanel()` generates one panel per property of type `dp`. For each existing `dataAssertion`, it renders an editable text field with the value, the datatype (`xsd:string` by default or the first range of the property), and a delete button. If the value is a URL (`/^https?:\/\//i`), a clickable `🔗` link is displayed. `addPropValue()` (for `kind='dp'`) creates an empty text field with the default datatype.

---

**Source code:** `owl_editor.js` → `_renderPropPanel()`, `addPropValue()`

### REQ-IND-035 — Opening the individual picker for an Object Property

`openPicker()` opens a modal overlay with two panels: a tree of allowed classes (filtered according to the `effectiveRange` of the property, or all classes if no range) and a list of individuals. `pickerSelectClass()` updates the list of individuals of the selected class (transitive filtering), excluding the individual being edited. `pickerSelectInd()` enables the OK button. `confirmPicker()` inserts the chosen individual as a new row in the property panel. `closePicker()` removes the overlay from the DOM.

---

**Source code:** `owl_editor.js` → `openPicker()`, `pickerSelectClass()`, `pickerSelectInd()`, `confirmPicker()`, `closePicker()`

### REQ-IND-036 — Navigating to a target individual from an Object Property

For panels of type `op`, each displayed value includes an `onclick="APP.navigateTo('individuals','${a.target}')"` on the text label, allowing direct navigation to the target individual in the Individuals tab. The same link is generated in `confirmPicker()` after selection via the picker.

---

**Source code:** `owl_editor.js` → `_renderPropPanel()`

### REQ-IND-037 — Clickable link for URL-type data values

For panels of type `dp`, if the value of a `dataAssertion` matches the regular expression `/^https?:\/\//i`, an `<a>` link with the `🔗` icon is inserted to the right of the text field, opening the URL in a new tab (`target="_blank"`).

---

**Source code:** `owl_editor.js` → `_renderPropPanel()`

### REQ-IND-038 — "Where Used" panel in the form

For an existing individual (`ind` non-null), the form calls `_whereUsedFrame(r => _ruleUsesIndividual(r, ind.id))` and inserts the result at the bottom of the form. This block lists the SWRL rules or other entities that reference the individual.

---

**Source code:** `owl_editor.js` → `renderForm()`

### REQ-IND-039 — Column resizing by drag-and-drop

`_initSplitPanes()` calls `_initHandle()` twice: for `ind-split-h1` / `ind-tree-panel` (width between 120 and 520 px) and for `ind-split-h2` / `ind-list-panel` (width between 100 and 400 px). `_initHandle()` attaches `mousedown`/`mousemove`/`mouseup` listeners on `document` and adjusts the CSS width of the panel in real time.

---

*Document generated by static analysis of the source code of `owl_editor.js` — no functionality extrapolated.*

**Source code:** `owl_editor.js` → `_initHandle()`, `_initSplitPanes()`
