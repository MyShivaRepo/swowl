# Requirements Derived from Source Code — Individuals Tab

**Date:** 2026-06-06
**Application:** SWOWL — OWL ontology editor
**Note:** Requirements derived **strictly** from source code. Each requirement cites the JavaScript function that implements it. No extrapolation.

---

## Table of Contents

1. [REQ-IND-001 — Three-column layout](#req-ind-001-three-column-layout)
2. [REQ-IND-002 — Class tree with transitive counters](#req-ind-002-class-tree-with-transitive-counters)
3. [REQ-IND-003 — Filtered and sorted individuals list](#req-ind-003-filtered-and-sorted-individuals-list)
4. [REQ-IND-004 — Class selection in the tree](#req-ind-004-class-selection-in-the-tree)
5. [REQ-IND-005 — Simple individual selection](#req-ind-005-simple-individual-selection)
6. [REQ-IND-006 — Multiple selection via Shift+Click](#req-ind-006-multiple-selection-via-shiftclick)
7. [REQ-IND-007 — Creating a new individual](#req-ind-007-creating-a-new-individual)
8. [REQ-IND-008 — Cancelling the creation form](#req-ind-008-cancelling-the-creation-form)
9. [REQ-IND-009 — Deleting one or more individuals](#req-ind-009-deleting-one-or-more-individuals)
10. [REQ-IND-010 — Moving by drag-and-drop to a class](#req-ind-010-moving-by-drag-and-drop-to-a-class)
11. [REQ-IND-011 — Individual detail form](#req-ind-011-individual-detail-form)
12. [REQ-IND-012 — IRI identifier displayed in the form header](#req-ind-012-iri-identifier-displayed-in-the-form-header)
13. [REQ-IND-013 — Annotations: labels and comments](#req-ind-013-annotations-labels-and-comments)
14. [REQ-IND-014 — Custom property annotations](#req-ind-014-custom-property-annotations)
15. [REQ-IND-015 — Type management (rdf:type)](#req-ind-015-type-management-rdftype)
16. [REQ-IND-016 — Dynamic property panels (Object Properties)](#req-ind-016-dynamic-property-panels-object-properties)
17. [REQ-IND-017 — Dynamic property panels (Datatype Properties)](#req-ind-017-dynamic-property-panels-datatype-properties)
18. [REQ-IND-018 — Functional cardinality management for properties](#req-ind-018-functional-cardinality-management-for-properties)
19. [REQ-IND-019 — Opening the individual picker for an Object Property](#req-ind-019-opening-the-individual-picker-for-an-object-property)
20. [REQ-IND-020 — Creating an individual on the fly from the picker](#req-ind-020-creating-an-individual-on-the-fly-from-the-picker)
21. [REQ-IND-021 — Auto-save (autoSave)](#req-ind-021-auto-save-autosave)
22. [REQ-IND-022 — Explicit save: creation and update](#req-ind-022-explicit-save-creation-and-update)
23. [REQ-IND-023 — Deleting a single individual from the form](#req-ind-023-deleting-a-single-individual-from-the-form)
24. [REQ-IND-024 — Preservation of sameAs and differentFrom during save](#req-ind-024-preservation-of-sameas-and-differentfrom-during-save)
25. [REQ-IND-025 — Collecting object assertions from panels](#req-ind-025-collecting-object-assertions-from-panels)
26. [REQ-IND-026 — Collecting data assertions from panels](#req-ind-026-collecting-data-assertions-from-panels)
27. [REQ-IND-027 — Simple display rule (single property)](#req-ind-027-simple-display-rule-single-property)
28. [REQ-IND-028 — Composite display rule (multi-property with separator)](#req-ind-028-composite-display-rule-multi-property-with-separator)
29. [REQ-IND-029 — Display label resolution by class inheritance](#req-ind-029-display-label-resolution-by-class-inheritance)
30. [REQ-IND-030 — Multilingual rdfs:label resolution](#req-ind-030-multilingual-rdfslabel-resolution)
31. [REQ-IND-031 — Persistence of display rules in the ontology](#req-ind-031-persistence-of-display-rules-in-the-ontology)
32. [REQ-IND-032 — Automatic identifier generation for a new individual](#req-ind-032-automatic-identifier-generation-for-a-new-individual)
33. [REQ-IND-033 — Navigation to a target individual from an Object Property](#req-ind-033-navigation-to-a-target-individual-from-an-object-property)
34. [REQ-IND-034 — Clickable link for URL-typed data values](#req-ind-034-clickable-link-for-url-typed-data-values)
35. [REQ-IND-035 — "Where Used" panel in the form](#req-ind-035-where-used-panel-in-the-form)
36. [REQ-IND-036 — Column resizing by drag-and-drop](#req-ind-036-column-resizing-by-drag-and-drop)
37. [REQ-IND-037 — Hierarchical class depth for ordering](#req-ind-037-hierarchical-class-depth-for-ordering)
38. [REQ-IND-038 — Separate collection of inherited and direct properties](#req-ind-038-separate-collection-of-inherited-and-direct-properties)
39. [REQ-IND-039 — Filtering candidate individuals by an OP's range](#req-ind-039-filtering-candidate-individuals-by-an-ops-range)

---

### REQ-IND-001 — Three-column layout

**Source code:** `owl_editor.js` → `renderSplit()`

The method generates the complete HTML of the tab as a `section-split` three-column layout: (1) class tree (`ind-tree-panel`), (2) individuals list (`ind-list-panel`), (3) detail/form panel (`ind-detail`). The two resizable separators (`ind-split-h1`, `ind-split-h2`) are inserted between columns. Column (3) displays an empty state by default, prompting the user to select or create an individual.

---

### REQ-IND-002 — Class tree with transitive counters

**Source code:** `owl_editor.js` → `_renderClassTree()`

The method builds the OWL class tree via `ClassEditor.buildTree()`. It displays the `owl:Thing` node at the top with the total number of individuals. For each class, it computes a **transitive** counter: the number of individuals whose at least one type belongs to the set of descendants of that class (computed by BFS via `allDescendants()`). Indentation is proportional to depth (`depth * 16 + 6` px). Each node is a drop zone target for drag-and-drop.

---

### REQ-IND-003 — Filtered and sorted individuals list

**Source code:** `owl_editor.js` → `_renderIndList()`

The method filters individuals according to the selected class (`_selectedClassId`). If no class is selected, all individuals are displayed. If a class is selected, the filter is **transitive**: it includes individuals whose type belongs to the class or one of its subclasses (BFS). The list is sorted alphabetically by the resolved display label (`_resolveDisplayLabel()`), or by identifier if no label is defined. Each item displays the primary label and, if distinct, the identifier as subtext. Each item is draggable.

---

### REQ-IND-004 — Class selection in the tree

**Source code:** `owl_editor.js` → `selectClass()`

On clicking a class, the method updates `_selectedClassId`, resets all individual selections, refreshes the highlighting in column 1, updates the column 2 title, and regenerates the filtered list (`_renderIndList()`). Column 3 displays an empty state with the `owl:Thing` message and a creation button.

---

### REQ-IND-005 — Simple individual selection

**Source code:** `owl_editor.js` → `selectIndividual()`

On a simple click on an individual (without Shift), the method initialises `_selectedIndIds` with the single clicked identifier, sets the anchor point (`_anchorIndId`), and displays the individual's form via `renderForm()` in column 3. It enables the delete button (`_setDelBtn()`).

---

### REQ-IND-006 — Multiple selection via Shift+Click

**Source code:** `owl_editor.js` → `selectIndividual()`

When `isShift === true` and an anchor point exists, the method computes the index range between the anchor and the clicked item in the DOM list, and selects all intermediate items. If the selection exceeds one individual, column 3 displays a summary `N individuals selected` with a bulk delete button, and `_editingId` is set to `null` (no autoSave).

---

### REQ-IND-007 — Creating a new individual

**Source code:** `owl_editor.js` → `newIndividual()`

The method clears the current selection, inserts a ghost placeholder `new individual…` at the top of the list (column 2), and displays the blank form in column 3 via `renderForm(null, selectedClassId)`. A `setTimeout` of 30 ms calls `Settings.generateIndividualId()` to pre-fill the ID field, then focuses that field and selects its content.

---

### REQ-IND-008 — Cancelling the creation form

**Source code:** `owl_editor.js` → `_cancelForm()`

The method resets all selection and editing variables, removes the ghost placeholder from the list, and restores the empty state in column 3 with the startup message and creation button.

---

### REQ-IND-009 — Deleting one or more individuals

**Source code:** `owl_editor.js` → `deleteSelected()`

The method retrieves the set of selected IDs (`_selectedIndIds`), displays a confirmation via `UI.confirm()` (singular or plural message), then calls `API.deleteIndividual()` in a loop for each ID. On success, it resets all selection, refreshes state via `APP.refresh()`, and regenerates columns 1 and 2. Column 3 displays an empty state.

---

### REQ-IND-010 — Moving by drag-and-drop to a class

**Source code:** `owl_editor.js` → `_onClassDrop()`

When dropping an individual onto a class node, the method applies one of three logics: (a) if the source class is known and present in the individual's types, it **replaces** that type with the target class; (b) if the individual has only one type, it is replaced; (c) otherwise, the target class is **added** to the existing types (no duplicates). The modification is sent via `API.updateIndividual()`, then the section is re-rendered and the individual remains selected.

---

### REQ-IND-011 — Individual detail form

**Source code:** `owl_editor.js` → `renderForm()`

The method generates the complete form for an individual (existing or new). It builds the following blocks: (1) ID field with real-time sanitisation (`_sanitizeId()`), (2) Annotations section, (3) Types section (`rdf:type`), (4) dynamic property panels via `_getClassProperties()` and `_renderPropPanel()`. For an existing individual, a `_whereUsedFrame()` block is added at the bottom. For a new individual, the ID field triggers `save(true)` on `blur`.

---

### REQ-IND-012 — IRI identifier displayed in the form header

**Source code:** `owl_editor.js` → `renderForm()`

If the ontology has a base IRI (`APP.state.ontology?.id`) and the individual has an identifier, the form displays the full IRI in the form `{baseIri}#{id}` inside a `cls-editor-iri` element. This line is not displayed for new individuals (empty IRI).

---

### REQ-IND-013 — Annotations: labels and comments

**Source code:** `owl_editor.js` → `renderForm()`, `addAnnotRow()`, `removeAnnotRow()`

`renderForm()` displays existing annotations (`labels`, `comments`, `other`) via `_annoRow()`. `addAnnotRow()` dynamically adds a new row to `ind-annotations-body` via `_makeAnnotRow()`, enabling `onchange` for autoSave if an individual is being edited. `removeAnnotRow()` removes the DOM row and triggers autoSave.

---

### REQ-IND-014 — Custom property annotations

**Source code:** `owl_editor.js` → `addOtherAnnotRow()`

The method adds an `other` annotation row to the annotations table, using the property passed as parameter, then hides the `ind-anno-picker` selector.

---

### REQ-IND-015 — Type management (rdf:type)

**Source code:** `owl_editor.js` → `addType()`, `removeType()`

`addType()` calls `_addListItem()` to insert a type into the `ind-types-list` and triggers autoSave if an individual is being edited. `removeType()` calls `_removeListItem()` to remove the type; if the list becomes empty, the `owl:NamedIndividual` placeholder is re-inserted. AutoSave is triggered in both cases.

---

### REQ-IND-016 — Dynamic property panels (Object Properties)

**Source code:** `owl_editor.js` → `_renderPropPanel()`, `addPropValue()`

`_renderPropPanel()` generates one panel per property of type `op`. For each existing `objectAssertion`, it renders a row with the target's label (via `_labelForId()`), a navigation link to the target individual, and a delete button. `addPropValue()` (for `kind='op'`) builds a `<select>` populated by `_indsOfRange()` filtered on the property's effective range.

---

### REQ-IND-017 — Dynamic property panels (Datatype Properties)

**Source code:** `owl_editor.js` → `_renderPropPanel()`, `addPropValue()`

`_renderPropPanel()` generates one panel per property of type `dp`. For each existing `dataAssertion`, it renders an editable text field with the value, the datatype (`xsd:string` by default or the first range of the property), and a delete button. If the value is a URL (`/^https?:\/\//i`), a clickable `🔗` link is displayed. `addPropValue()` (for `kind='dp'`) creates an empty text field with the default datatype.

---

### REQ-IND-018 — Functional cardinality management for properties

**Source code:** `owl_editor.js` → `_renderPropPanel()`, `_refreshAddBtn()`, `confirmPicker()`

`_renderPropPanel()` determines multiplicity (`single`/`multiple`) according to `opData?.characteristics?.functional` or `dpData?.functional`. If `single=true` and a value already exists, the `+` button is hidden (`addBtnHidden`). `_refreshAddBtn()` updates button visibility after each addition/removal. `confirmPicker()` blocks insertion if the panel is `single` and already contains a value.

---

### REQ-IND-019 — Opening the individual picker for an Object Property

**Source code:** `owl_editor.js` → `openPicker()`, `pickerSelectClass()`, `pickerSelectInd()`, `confirmPicker()`, `closePicker()`

`openPicker()` opens a modal overlay with two panels: class tree filtered by the property's `effectiveRange` (or all classes if no range) and an individuals list. `pickerSelectClass()` updates the individuals list for the selected class (transitive filtering), excluding the individual currently being edited. `pickerSelectInd()` enables the OK button. `confirmPicker()` inserts the chosen individual as a new row in the property panel. `closePicker()` removes the overlay from the DOM.

---

### REQ-IND-020 — Creating an individual on the fly from the picker

**Source code:** `owl_editor.js` → `pickerCreateNew()`, `_pickerConfirmNew()`

`pickerCreateNew()` inserts an inline input field into the picker list (one field at a time). It pre-fills the ID via `Settings.generateIndividualId()`, handles `Enter` (confirm) and `Escape` (cancel) keys. `_pickerConfirmNew()` creates the individual via `API.createIndividual()` with initial types matching the class selected in the picker, then refreshes the list and selects the new individual.

---

### REQ-IND-021 — Auto-save (autoSave)

**Source code:** `owl_editor.js` → `autoSave()`

The method calls `save(false)` only if `_editingId !== null`, i.e. only when an existing individual is being edited. It is triggered via `onchange` on all fields of an existing individual's form.

---

### REQ-IND-022 — Explicit save: creation and update

**Source code:** `owl_editor.js` → `save()`

The method collects the ID (with spaces replaced by underscores), annotations via `_collectAnnotations()`, types via `_collectList()`, `objectAssertions` and `dataAssertions` from DOM panels. If `isNew=true`, it calls `API.createIndividual()`, updates `_selectedIndId` and `_editingId`, and re-renders all three columns. If `isNew=false`, it calls `API.updateIndividual(originalId, ind)` — if the ID has changed, a rename message is displayed. In both cases, `APP.refresh()` is called to synchronise state.

---

### REQ-IND-023 — Deleting a single individual from the form

**Source code:** `owl_editor.js` → `delete()`

The method displays a `UI.confirm()` confirmation, calls `API.deleteIndividual()`, then, if the deleted individual was selected (`_selectedIndId === id`), resets `_selectedIndId` and `_editingId` and restores the empty state of column 3. It then regenerates columns 1 and 2.

---

### REQ-IND-024 — Preservation of sameAs and differentFrom during save

**Source code:** `owl_editor.js` → `save()`

The `save()` method retrieves the existing values of `sameAs` and `differentFrom` from `APP.state.individuals` (via the original or new ID) and systematically includes them in the object sent to the API. These two fields are not editable through the main form interface: they are only preserved.

---

### REQ-IND-025 — Collecting object assertions from panels

**Source code:** `owl_editor.js` → `save()`

The method queries all DOM elements `.ind-prop-panel[data-kind="op"]`, reads `panel.dataset.prop` as the property identifier, and for each `.ind-op-target` (hidden input or select) with a non-empty value, constructs an object `{ property, target }` that is added to the `objectAssertions` array.

---

### REQ-IND-026 — Collecting data assertions from panels

**Source code:** `owl_editor.js` → `save()`

The method queries all DOM elements `.ind-prop-panel[data-kind="dp"]`, reads `panel.dataset.prop`, and for each `.ind-prop-row` containing a non-empty `.ind-dp-value`, constructs an object `{ property, value, datatype }` — the datatype is read from `dataset.dtype` of the `.ind-dp-type` element, with `xsd:string` as the default value.

---

### REQ-IND-027 — Simple display rule (single property)

**Source code:** `owl_editor.js` → `setDisplayProp()`, `_openDisplayPropModal()`, `_getEffectiveDisplayProp()`

`_openDisplayPropModal()` opens a modal listing all available properties for the selected class (annotations, inherited properties, direct properties, properties via domain). Properties already active through inheritance are flagged `(inherited)`. `setDisplayProp()` saves (or removes if `null`) the rule in `_displayProps[classId || '__root__']`. `_getEffectiveDisplayProp()` recursively walks up the class hierarchy to find the applicable rule.

---

### REQ-IND-028 — Composite display rule (multi-property with separator)

**Source code:** `owl_editor.js` → `_openDisplayPropsMultiModal()`, `_addDisplayMultiRow()`, `_confirmDisplayMulti()`, `setDisplayPropsMulti()`, `_getEffectiveDisplayMulti()`

`_openDisplayPropsMultiModal()` opens a modal with editable `{separator, property}` rows. `_addDisplayMultiRow()` adds an empty row to the modal. `_confirmDisplayMulti()` reads all rows and calls `setDisplayPropsMulti()`. `setDisplayPropsMulti()` saves the composite rule in `_displayPropsMulti[classId || '__root__']` (or removes it if `null`/empty). `_getEffectiveDisplayMulti()` walks up the class hierarchy analogously to `_getEffectiveDisplayProp()`.

---

### REQ-IND-029 — Display label resolution by class inheritance

**Source code:** `owl_editor.js` → `_resolveDisplayLabel()`

The method looks for an applicable display rule according to the following priority: (1) the individual's own types, (2) the context class (class selected in the tree or picker class), (3) root rule (`__root__`). For each candidate class, it first checks the composite rule (`_getEffectiveDisplayMulti()`) then the simple rule (`_getEffectiveDisplayProp()`). The label is built via `_buildMultiLabel()` or `_getDisplayLabel()` depending on the rule type.

---

### REQ-IND-030 — Multilingual rdfs:label resolution

**Source code:** `owl_editor.js` → `_getDisplayLabel()`

The method supports both `rdfs:label` (without language) and `rdfs:label@{lang}` forms. For the language-tagged form, it first searches for the exact requested language, then other active languages (`Settings.activeLangs`) in order, then the first available label regardless of language. For the language-untagged form, it uses `Settings.preferredLang` as priority, or the first available label. It also supports `rdfs:comment`, `other` annotations (by property), `dataAssertions`, and `objectAssertions` (returns the target).

---

### REQ-IND-031 — Persistence of display rules in the ontology

**Source code:** `owl_editor.js` → `_saveDisplayRules()`, `_loadDisplayRules()`

`_saveDisplayRules()` builds an object `{ single: _displayProps, multi: _displayPropsMulti }` and sends it via `API.updateDisplayRules()`. It also updates `APP.state.ontology.display_rules` in memory. `_loadDisplayRules()` reads `APP.state.ontology?.display_rules` and initialises both internal maps `_displayProps` and `_displayPropsMulti`.

---

### REQ-IND-032 — Automatic identifier generation for a new individual

**Source code:** `owl_editor.js` → `newIndividual()`, `pickerCreateNew()`

In `newIndividual()`, after displaying the blank form, a `setTimeout` of 30 ms calls `Settings.generateIndividualId(this._selectedClassId)` to pre-fill the `ind-id` field. In `pickerCreateNew()`, the same method is called to pre-fill the inline input field of the picker.

---

### REQ-IND-033 — Navigation to a target individual from an Object Property

**Source code:** `owl_editor.js` → `_renderPropPanel()`

For panels of type `op`, each displayed value includes an `onclick="APP.navigateTo('individuals','${a.target}')"` on the text label, allowing direct navigation to the target individual in the Individuals tab. The same link is generated in `confirmPicker()` after selection via the picker.

---

### REQ-IND-034 — Clickable link for URL-typed data values

**Source code:** `owl_editor.js` → `_renderPropPanel()`

For panels of type `dp`, if the value of a `dataAssertion` matches the regular expression `/^https?:\/\//i`, an `<a>` link with the `🔗` icon is inserted to the right of the text field, opening the URL in a new tab (`target="_blank"`).

---

### REQ-IND-035 — "Where Used" panel in the form

**Source code:** `owl_editor.js` → `renderForm()`

For an existing individual (`ind` non-null), the form calls `_whereUsedFrame(r => _ruleUsesIndividual(r, ind.id))` and inserts the result at the bottom of the form. This block lists the SWRL rules or other entities that reference the individual.

---

### REQ-IND-036 — Column resizing by drag-and-drop

**Source code:** `owl_editor.js` → `_initHandle()`, `_initSplitPanes()`

`_initSplitPanes()` calls `_initHandle()` twice: for `ind-split-h1` / `ind-tree-panel` (width between 120 and 520 px) and for `ind-split-h2` / `ind-list-panel` (width between 100 and 400 px). `_initHandle()` attaches `mousedown`/`mousemove`/`mouseup` listeners on `document` and adjusts the panel's CSS width in real time.

---

### REQ-IND-037 — Hierarchical class depth for ordering

**Source code:** `owl_editor.js` → `_classDepth()`

The method computes the depth of a class in the hierarchy by iterative BFS traversal going up through parents (`subClassOf` of string type only). It is robust to cycles (visited marking). The result is used in `_getClassProperties()` to order the individual's class properties from highest to lowest in the hierarchy.

---

### REQ-IND-038 — Separate collection of inherited and direct properties

**Source code:** `owl_editor.js` → `_getClassProperties()`

The method analyses the individual's types and returns two maps: `asserted` (restrictions defined on the individual's direct types, ordered by ascending depth then alphabetically) and `inherited` (restrictions defined on ancestors, without duplicates from `asserted`). It determines whether each property is an `op` or `dp` by searching in `APP.state.object_properties`. This separation is used in `renderForm()` to display inherited panels before direct ones.

---

### REQ-IND-039 — Filtering candidate individuals by an OP's range

**Source code:** `owl_editor.js` → `_indsOfRange()`

The method returns the list of individuals compatible with the range of an Object Property, excluding the individual currently being edited. If `rangeClasses` is empty or null, all individuals (except the excluded one) are returned. Otherwise, the filter is **transitive**: descendants of the range classes are included via `ClassEditor.buildTree()`. Only individuals whose at least one type is in the computed set are returned.

---

*Document generated by static analysis of the `owl_editor.js` source code — no functionality extrapolated.*

---

**claude-sonnet-4-6**
