# Requirements — Individuals

> Generated on 2026-06-06 | Strictly derived from source code | No hallucinations

## Table of contents

### Substance
- [REQ-IND-002 — Class tree with transitive counters](#req-ind-002--class-tree-with-transitive-counters)
- [REQ-IND-003 — Filtered and sorted individual list](#req-ind-003--filtered-and-sorted-individual-list)
- [REQ-IND-007 — Creation of a new individual](#req-ind-007--creation-of-a-new-individual)
- [REQ-IND-009 — Deletion of one or more individuals](#req-ind-009--deletion-of-one-or-more-individuals)
- [REQ-IND-010 — Drag-and-drop move to a class](#req-ind-010--drag-and-drop-move-to-a-class)
- [REQ-IND-015 — Type management (rdf:type)](#req-ind-015--type-management-rdftype)
- [REQ-IND-018 — Functional cardinality management for properties](#req-ind-018--functional-cardinality-management-for-properties)
- [REQ-IND-020 — On-the-fly individual creation from the picker](#req-ind-020--on-the-fly-individual-creation-from-the-picker)
- [REQ-IND-021 — Auto-save (autoSave)](#req-ind-021--auto-save-autosave)
- [REQ-IND-022 — Explicit save: creation and update](#req-ind-022--explicit-save-creation-and-update)
- [REQ-IND-023 — Single individual deletion from the form](#req-ind-023--single-individual-deletion-from-the-form)
- [REQ-IND-024 — Preservation of sameAs and differentFrom on save](#req-ind-024--preservation-of-sameas-and-differentfrom-on-save)
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
- [REQ-IND-039 — Filtering of candidate individuals by an OP's range](#req-ind-039--filtering-of-candidate-individuals-by-an-ops-range)
- [REQ-IND-041 — Materialisation of inferred assertions (subPropertyOf / inverseOf)](#req-ind-041--materialisation-of-inferred-assertions-subpropertyof--inverseof)

### Form
- [REQ-IND-001 — Three-column layout](#req-ind-001--three-column-layout)
- [REQ-IND-004 — Class selection in the tree](#req-ind-004--class-selection-in-the-tree)
- [REQ-IND-005 — Simple individual selection](#req-ind-005--simple-individual-selection)
- [REQ-IND-006 — Multiple selection via Shift+Click](#req-ind-006--multiple-selection-via-shiftclick)
- [REQ-IND-008 — Cancel creation form](#req-ind-008--cancel-creation-form)
- [REQ-IND-011 — Individual detail form](#req-ind-011--individual-detail-form)
- [REQ-IND-012 — IRI identifier displayed in the form header](#req-ind-012--iri-identifier-displayed-in-the-form-header)
- [REQ-IND-013 — Annotations: labels and comments](#req-ind-013--annotations-labels-and-comments)
- [REQ-IND-014 — Custom property annotations](#req-ind-014--custom-property-annotations)
- [REQ-IND-016 — Dynamic property panels (Object Properties)](#req-ind-016--dynamic-property-panels-object-properties)
- [REQ-IND-017 — Dynamic property panels (Datatype Properties)](#req-ind-017--dynamic-property-panels-datatype-properties)
- [REQ-IND-019 — Opening the individual picker for an Object Property](#req-ind-019--opening-the-individual-picker-for-an-object-property)
- [REQ-IND-033 — Navigation to a target individual from an Object Property](#req-ind-033--navigation-to-a-target-individual-from-an-object-property)
- [REQ-IND-040 — Complete individual selection on cross-tab navigation](#req-ind-040--complete-individual-selection-on-cross-tab-navigation)
- [REQ-IND-034 — Clickable link for URL-type data values](#req-ind-034--clickable-link-for-url-type-data-values)
- [REQ-IND-035 — "Where Used" panel in the form](#req-ind-035--where-used-panel-in-the-form)
- [REQ-IND-036 — Column resizing by drag-and-drop](#req-ind-036--column-resizing-by-drag-and-drop)
- [REQ-IND-042 — Inferred entailments shown as materialised assertions](#req-ind-042--inferred-entailments-shown-as-materialised-assertions)
- [REQ-IND-043 — Panels for every actually-asserted property](#req-ind-043--panels-for-every-actually-asserted-property)

---

## 1. Substance — Business logic and functional rules

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviours, validations, persistence.


### REQ-IND-002 — Class tree with transitive counters

| **If** | the `ontology` is loaded and contains `classes` organised in a hierarchy, |
|---|---|
| **Then** | the class tree faithfully reflects the specialisation relationships between concepts: the root node `owl:Thing` shows the total number of `individuals`, each class displays the number of `individuals` it contains by also counting those of all its subclasses, and each node is a drop target for drag-and-drop. |

---

**Source code:** `owl_editor.js` → `_renderClassTree()` — Calls `ClassEditor.buildTree()` to build the hierarchical tree from `subClassOf` relationships. For each node, computes a transitive counter via `allDescendants()` (BFS) that traverses all descendants. Visual indentation is proportional to node depth (`depth * 16 + 6` px). Each node is rendered with the `draggable` attribute to accept individual drops.

### REQ-IND-003 — Filtered and sorted individual list

| **If** | the ontologist browses the `individual` list, possibly after selecting a class in the tree, |
|---|---|
| **Then** | only `individuals` belonging to that class or one of its subclasses are displayed, sorted alphabetically by their display name; with no class selected, all `individuals` are listed; each `individual` can be moved by drag-and-drop. |

---

**Source code:** `owl_editor.js` → `_renderIndList()` — Filters individuals whose at least one type belongs to the selected class (`_selectedClassId`) or one of its descendants (transitive BFS via `allDescendants()`). Sorts the list alphabetically by the label resolved via `_resolveDisplayLabel()`, or by identifier if no label is defined. Each item displays the primary label and, if distinct, the identifier as sub-text; the identifier is prefixed with the connected ontology's registry prefix when one is defined (this prefix behaviour is specified in detail in `Ontologies.md`). Each item is rendered with the `draggable` attribute.

### REQ-IND-007 — Creation of a new individual

| **If** | the ontologist wishes to create a new `individual`, |
|---|---|
| **Then** | a blank form opens immediately, pre-filled with an automatically generated identifier, ready for input without any prior manipulation. |

---

**Source code:** `owl_editor.js` → `newIndividual()` — Resets the current selection, inserts a ghost placeholder `new individual…` at the top of the list (column 2), displays the blank form via `renderForm(null, selectedClassId)` in column 3. After 30 ms, calls `Settings.generateIndividualId()` to pre-fill the ID field, gives it focus and selects its content.

### REQ-IND-009 — Deletion of one or more individuals

| **If** | the ontologist confirms the deletion of one or more selected `individuals`, |
|---|---|
| **Then** | the `individuals` are removed from the `ontology`, the list is updated and the form displays an empty state. |

---

**Source code:** `owl_editor.js` → `deleteSelected()` — Displays a confirmation via `UI.confirm()` with a message adapted to singular or plural. Calls `API.deleteIndividual()` in a loop for each identifier in `_selectedIndIds`. On success, resets the entire selection, refreshes state via `APP.refresh()`, regenerates columns 1 and 2, and displays an empty state in column 3.

### REQ-IND-010 — Drag-and-drop move to a class

| **If** | the ontologist drops an `individual` onto a class in the tree, |
|---|---|
| **Then** | the `individual`'s type is updated to reflect its new membership: if the `individual` already had a known type, that type is replaced by the target class; otherwise, the target class is added to its existing types, without duplication. |

---

**Source code:** `owl_editor.js` → `_onClassDrop()` — Applies one of three logics: (a) if the source class is present in the individual's types, it is replaced by the target class; (b) if the individual has only one type, that type is replaced; (c) otherwise, the target class is added without duplication. Sends the modification via `API.updateIndividual()`, re-renders the section and keeps the individual selected.

### REQ-IND-015 — Type management (rdf:type)

| **If** | the ontologist adds a type to an `individual`, |
|---|---|
| **Then** | the new type appears in the `individual`'s type list and saving is triggered automatically if the `individual` is already registered. |

| **If** | the ontologist removes a type from an `individual`, |
|---|---|
| **Then** | the type is removed from the list; if the list becomes empty, `owl:NamedIndividual` is automatically maintained as the minimal type, and saving is triggered. |

---

**Source code:** `owl_editor.js` → `addType()`, `removeType()` — `addType()` inserts the type into the `ind-types-list` list via `_addListItem()` and triggers `autoSave()` if `_editingId !== null`. `removeType()` removes the type via `_removeListItem()`; if the list becomes empty, re-inserts the `owl:NamedIndividual` placeholder; triggers `autoSave()` in both cases.

### REQ-IND-018 — Functional cardinality management for properties

| **If** | a `property` is functional and a value has already been assigned to an `individual`, |
|---|---|
| **Then** | the ontologist cannot add a second value for that `property`: the add control is hidden and any insertion attempt is blocked. |

---

**Source code:** `owl_editor.js` → `_renderPropPanel()`, `_refreshAddBtn()`, `confirmPicker()` — At render time, if `opData?.characteristics?.functional` or `dpData?.functional` is true and a value exists, the `+` button is hidden (`addBtnHidden`). `_refreshAddBtn()` keeps this visibility up to date after each addition or deletion. `confirmPicker()` blocks insertion if the panel is in `single` mode and already contains a value.

### REQ-IND-020 — On-the-fly individual creation from the picker

| **If** | the ontologist wishes to create a new `individual` directly from a `property`'s picker, |
|---|---|
| **Then** | an input field appears in the picker list with a pre-generated identifier; they can confirm creation with Enter or cancel with Escape. |

| **If** | the ontologist confirms creation from the picker, |
|---|---|
| **Then** | the new `individual` is created with the types corresponding to the selected class, the list is refreshed and the new `individual` is immediately available for selection. |

---

**Source code:** `owl_editor.js` → `pickerCreateNew()`, `_pickerConfirmNew()` — `pickerCreateNew()` inserts an inline input field into the list (one at a time), pre-fills the ID via `Settings.generateIndividualId()`, handles `keydown` for Enter (confirmation) and Escape (cancellation). `_pickerConfirmNew()` calls `API.createIndividual()` with the initial types corresponding to the class selected in the picker, refreshes the list and selects the new individual.

### REQ-IND-021 — Auto-save (autoSave)

| **If** | the ontologist modifies a field in the form of an already-registered `individual`, |
|---|---|
| **Then** | the changes are saved automatically without any explicit action on their part. |

---

**Source code:** `owl_editor.js` → `autoSave()` — Triggered via the `onchange` event of each form field. Calls `save(false)` only if `_editingId !== null`, i.e. if an existing individual is being edited.

### REQ-IND-022 — Explicit save: creation and update

| **If** | the ontologist triggers an explicit save of an `individual`, |
|---|---|
| **Then** | all entered information is collected (identifier, annotations, types, object and data `property` assertions) and persisted in the `ontology`. |

| **If** | the `individual` is new, |
|---|---|
| **Then** | it is created in the `ontology`, the tree and the list are updated, and the newly created `individual` is selected in the interface. |

| **If** | the `individual` already exists, |
|---|---|
| **Then** | it is updated; if its identifier has changed, a rename confirmation message is displayed; the `ontology` is refreshed in both cases. |

---

**Source code:** `owl_editor.js` → `save()` — Collects the ID (spaces replaced by underscores), annotations via `_collectAnnotations()`, types via `_collectList()`, `objectAssertions` from DOM panels `.ind-prop-panel[data-kind="op"]` and `dataAssertions` from `.ind-prop-panel[data-kind="dp"]`. If `isNew=true`: calls `API.createIndividual()`, updates `_selectedIndId` and `_editingId`, re-renders all three columns and calls `APP.refresh()`. If `isNew=false`: calls `API.updateIndividual(originalId, ind)`, displays a message if the ID changed, calls `APP.refresh()`.

### REQ-IND-023 — Single individual deletion from the form

| **If** | the ontologist deletes an `individual` from its detail form, |
|---|---|
| **Then** | the `individual` is removed from the `ontology`, the list is updated and the form displays an empty state if the deleted `individual` was the one currently being viewed. |

---

**Source code:** `owl_editor.js` → `delete()` — Calls `API.deleteIndividual()`. If the deleted individual was selected (`_selectedIndId === id`), resets `_selectedIndId` and `_editingId` and displays the empty state in column 3. Regenerates columns 1 and 2.

### REQ-IND-024 — Preservation of sameAs and differentFrom on save

| **If** | a save is triggered for an `individual`, |
|---|---|
| **Then** | the identity (`sameAs`) and difference (`differentFrom`) relationships already defined are preserved in full, even though they are not editable from the main form. |

---

**Source code:** `owl_editor.js` → `save()` — Retrieves existing values of `sameAs` and `differentFrom` from `APP.state.individuals` (via the original ID or the new ID) and systematically includes them in the object sent to the API, without allowing their modification through the main form.

### REQ-IND-025 — Collection of object assertions from panels

| **If** | a save is triggered, |
|---|---|
| **Then** | all relationships between the `individual` and other `individuals` (object assertions) entered in the `property` panels are collected and included in the save. |

---

**Source code:** `owl_editor.js` → `save()` — Queries all DOM elements `.ind-prop-panel[data-kind="op"]`: for each `.ind-op-target` (hidden input or select) whose value is non-empty, builds an object `{ property, target }` from `panel.dataset.prop` and adds it to the `objectAssertions` array.

### REQ-IND-026 — Collection of data assertions from panels

| **If** | a save is triggered, |
|---|---|
| **Then** | all literal values entered in the data `property` panels are collected with their datatype and included in the save. |

---

**Source code:** `owl_editor.js` → `save()` — Queries all DOM elements `.ind-prop-panel[data-kind="dp"]`: for each `.ind-prop-row` containing a non-empty `.ind-dp-value`, builds an object `{ property, value, datatype }` — the datatype is read from `dataset.dtype` of the `.ind-dp-type` element, with `xsd:string` as the default value.

### REQ-IND-027 — Simple display rule (single property)

| **If** | the ontologist wishes to define how `individuals` of a class are named in the interface, |
|---|---|
| **Then** | they can choose a `property` whose value will be used as the display label, clearly seeing which `properties` are available and which are already inherited from a parent class. |

| **If** | the ontologist selects or removes a display `property`, |
|---|---|
| **Then** | the rule is saved for the relevant class and automatically propagated to subclasses that have no rule of their own. |

---

**Source code:** `owl_editor.js` → `setDisplayProp()`, `_openDisplayPropModal()`, `_getEffectiveDisplayProp()` — `_openDisplayPropModal()` lists all properties available for the selected class (annotations, inherited properties, direct properties and via domain), with an `(inherited)` marker for those active through inheritance. `setDisplayProp()` saves (or removes if `null`) the rule in `_displayProps[classId || '__root__']`. `_getEffectiveDisplayProp()` recursively traverses the class hierarchy to determine the rule applicable to a given individual.

### REQ-IND-028 — Composite display rule (multi-property with separator)

| **If** | the ontologist wishes to compose the display label of `individuals` from multiple `properties`, |
|---|---|
| **Then** | they can define a composite rule associating multiple `properties` with custom separators, and add as many rows as needed. |

| **If** | the ontologist confirms the composite rule, |
|---|---|
| **Then** | the rule is saved for the relevant class and propagated to subclasses without their own rule, in the same way as the simple rule. |

---

**Source code:** `owl_editor.js` → `_openDisplayPropsMultiModal()`, `_addDisplayMultiRow()`, `_confirmDisplayMulti()`, `setDisplayPropsMulti()`, `_getEffectiveDisplayMulti()` — `_openDisplayPropsMultiModal()` displays a modal with editable `{separator, property}` rows. `_addDisplayMultiRow()` inserts a blank row. `_confirmDisplayMulti()` calls `setDisplayPropsMulti()` which saves the rule in `_displayPropsMulti[classId || '__root__']` (or removes it if `null`/empty). `_getEffectiveDisplayMulti()` traverses the class hierarchy analogously to `_getEffectiveDisplayProp()`.

### REQ-IND-029 — Display label resolution by class inheritance

| **If** | the application needs to display the name of an `individual`, |
|---|---|
| **Then** | it looks up the most relevant display rule according to the class hierarchy: first the `individual`'s own types, then the selected context class, then the global root rule; the composite rule takes priority over the simple rule. |

---

**Source code:** `owl_editor.js` → `_resolveDisplayLabel()` — For each candidate class (the individual's own types, context class, `__root__`), first checks the composite rule via `_getEffectiveDisplayMulti()` then the simple rule via `_getEffectiveDisplayProp()`. Builds the label via `_buildMultiLabel()` or `_getDisplayLabel()` depending on the type of rule selected.

### REQ-IND-030 — Multilingual rdfs:label resolution

| **If** | the application resolves the display label of an `individual` from the `rdfs:label` `property`, |
|---|---|
| **Then** | it respects the ontologist's language preferences: the requested language takes priority, then the other active languages in order of preference, then any available label as a last resort. |

---

**Source code:** `owl_editor.js` → `_getDisplayLabel()` — For the `rdfs:label@{lang}` form: first looks for the exact requested language, then the other active languages (`Settings.activeLangs`) in order, then the first available label. For the form without language: uses `Settings.preferredLang` as priority, or the first available label. Also supports `rdfs:comment`, `other` annotations (by property), `dataAssertions` and `objectAssertions` (returns the target).

### REQ-IND-031 — Persistence of display rules in the ontology

| **If** | display rules are modified, |
|---|---|
| **Then** | they are saved in the `ontology` and restored identically on the next load. |

| **If** | the `ontology` is loaded, |
|---|---|
| **Then** | previously defined display rules are automatically restored. |

---

**Source code:** `owl_editor.js` → `_saveDisplayRules()`, `_loadDisplayRules()` — `_saveDisplayRules()` builds an object `{ single: _displayProps, multi: _displayPropsMulti }`, sends it via `API.updateDisplayRules()` and updates `APP.state.ontology.display_rules` in memory. `_loadDisplayRules()` reads `APP.state.ontology?.display_rules` and initialises the two internal maps `_displayProps` and `_displayPropsMulti`.

### REQ-IND-032 — Automatic identifier generation for a new individual

| **If** | the ontologist initiates the creation of a new `individual`, whether from the main form or from a `property`'s picker, |
|---|---|
| **Then** | a unique identifier consistent with the `ontology`'s conventions is automatically proposed, without the ontologist having to enter it manually. |

---

**Source code:** `owl_editor.js` → `newIndividual()`, `pickerCreateNew()` — In both cases, after 30 ms (a delay allowing DOM insertion), calls `Settings.generateIndividualId(this._selectedClassId)` to pre-fill the corresponding ID field with an identifier generated according to the configured conventions.

### REQ-IND-037 — Hierarchical class depth for ordering

| **If** | the application needs to order an `individual`'s `properties` according to the class hierarchy, |
|---|---|
| **Then** | `properties` inherited from the most general `classes` appear first, followed by those from more specialised `classes`. |

---

**Source code:** `owl_editor.js` → `_classDepth()` — Computes the depth of each class by iterative BFS, traversing parents via `subClassOf` relationships (string type only), with cycle protection via `visited` marking. The result is used in `_getClassProperties()` to sort properties from highest to lowest in the hierarchy.

### REQ-IND-038 — Separate collection of inherited and direct properties

| **If** | the ontologist `views` the form of an `individual`, |
|---|---|
| **Then** | `properties` inherited from parent `classes` are visually distinguished from `properties` defined directly on the `individual`'s types, without duplication. |

---

**Source code:** `owl_editor.js` → `_getClassProperties()` — Analyses the individual's types and returns two maps: `asserted` (restrictions of direct types, ordered by increasing depth then alphabetically) and `inherited` (restrictions of ancestors, without duplication with `asserted`). The nature of each property (`op` or `dp`) is determined by searching in `APP.state.object_properties`. Inherited panels are displayed before direct ones.

### REQ-IND-039 — Filtering of candidate individuals by an OP's range

| **If** | the ontologist needs to select a value for an `Object Property`, |
|---|---|
| **Then** | only `individuals` compatible with the range of that `property` are proposed, excluding the `individual` currently being edited; if no range constraint is defined, all `individuals` are proposed. |

---

**Source code:** `owl_editor.js` → `_indsOfRange()` — Returns the list of individuals whose at least one type belongs to the computed set (descendants of range classes included via `ClassEditor.buildTree()`), excluding the individual currently being edited (`_editingId`). If `rangeClasses` is empty or null, returns all individuals except the excluded one.

### REQ-IND-041 — Materialisation of inferred assertions (subPropertyOf / inverseOf)

| **If** | an `individual` carries object or data `property` assertions, |
|---|---|
| **Then** | the backend materialises the deductive closure of those assertions under `rdfs:subPropertyOf` (transitive) and `owl:inverseOf` — including their combinations, computed up to a fixed point — by storing the entailed assertions as additional assertions flagged `derived=true`, so that an entailed relationship (e.g. a super-property of an asserted one, or the reciprocal of an `inverseOf` pair on the target `individual`) is persisted explicitly alongside the base assertions. |

| **If** | any `individual` is created, updated or deleted, or an `Object Property` / `Datatype Property` (its `subPropertyOf` / `inverseOf`) is modified, |
|---|---|
| **Then** | all previously materialised `derived` assertions are purged and recomputed from scratch from the base assertions only (those entered by the ontologist, `derived=false`), guaranteeing the closure stays consistent with the current axioms. |

| **If** | the form returns an `individual`'s assertions without the `derived` flag (the front sends every visible assertion back, base and entailed alike), |
|---|---|
| **Then** | the backend preserves the base/derived distinction by re-flagging as `derived` exactly the incoming assertions that were already derived in the stored individual, so that only genuinely new user assertions remain as base assertions before the closure is recomputed. |

---

**Source code:** `main.py` → `_materialize_inferences()`, `_transitive_supers()`, `_reclassify_base()`; `owl_model.py` → `ObjectPropertyAssertion.derived` / `DataPropertyAssertion.derived`. `_materialize_inferences()` (1) drops every assertion with `derived=True` from all individuals, (2) builds the transitive super-property maps via `_transitive_supers()` and a bidirectional `inverseOf` map, then (3) iterates to a fixed point (`while changed`, guard 100): for each base/derived assertion it appends the super-property assertions on the same individual and, for `inverseOf`, the reciprocal assertion on the target individual, all flagged `derived=True`. It is invoked from `create_individual()`, `update_individual()`, `delete_individual()` (after stripping references to the removed individual) and from the Object/Datatype Property update endpoints. `_reclassify_base()` is called by `update_individual()` before replacing the stored individual: it marks each incoming assertion `derived` iff `(property, target)` (object) or `(property, value, datatype)` (data) matched a previously derived assertion, since the front returns all assertions without the flag. The `derived: bool = False` field on `ObjectPropertyAssertion` / `DataPropertyAssertion` carries this distinction in the model.

---

## 2. Form — Presentation and user interface

> Requirements relating to display: layout, visual components, interactions, navigation, styles.

### REQ-IND-001 — Three-column layout

| **If** | the ontologist opens the `Individuals` tab, |
|---|---|
| **Then** | the interface presents three side-by-side work areas: the class hierarchy, the `individual` list, and the detail form; by default, the form invites the user to select or create an `individual`. |

---

**Source code:** `owl_editor.js` → `renderSplit()` — Generates a `section-split` three-column layout: column 1 `ind-tree-panel` (class tree), column 2 `ind-list-panel` (individual list), column 3 `ind-detail` (form, empty state by default). Inserts two resizable separators `ind-split-h1` and `ind-split-h2` between the columns.

### REQ-IND-004 — Class selection in the tree

| **If** | the ontologist selects a class in the tree, |
|---|---|
| **Then** | the `individual` list is filtered to display only those belonging to that class or its subclasses, and the form displays an empty state inviting the user to select or create an `individual` in that context. |

---

**Source code:** `owl_editor.js` → `selectClass()` — Updates `_selectedClassId`, resets all individual selections, refreshes the highlight in column 1, updates the column 2 title, regenerates the filtered list via `_renderIndList()`, displays an empty state in column 3 with the `owl:Thing` message and a create button.

### REQ-IND-005 — Simple individual selection

| **If** | the ontologist clicks on an `individual` in the list, |
|---|---|
| **Then** | the detail form for that `individual` is displayed and the delete button becomes active. |

---

**Source code:** `owl_editor.js` → `selectIndividual()` — Initialises `_selectedIndIds` with the single clicked identifier, sets the anchor point `_anchorIndId`, displays the form via `renderForm()` in column 3, activates the delete button via `_setDelBtn()`.

### REQ-IND-006 — Multiple selection via Shift+Click

| **If** | the ontologist clicks on an `individual` while holding the Shift key and an anchor point exists, |
|---|---|
| **Then** | all `individuals` between the anchor and the clicked item are selected; if the selection contains more than one `individual`, the form displays a summary indicating the number of selected `individuals` with a bulk delete option. |

---

**Source code:** `owl_editor.js` → `selectIndividual()` — Computes the index range between `_anchorIndId` and the clicked item in the DOM list, selects all intermediate items in `_selectedIndIds`. If the selection exceeds one individual, displays `N individuals selected` in column 3 with a bulk delete button and sets `_editingId` to `null`.

### REQ-IND-008 — Cancel creation form

| **If** | the ontologist cancels the creation of a new `individual`, |
|---|---|
| **Then** | the form closes, the list reverts to its previous state and the interface returns to its resting state. |

---

**Source code:** `owl_editor.js` → `_cancelForm()` — Resets all selection and editing variables, removes the ghost placeholder from the list, restores the empty state in column 3 with the start message and the create button.

### REQ-IND-011 — Individual detail form

| **If** | an `individual` is selected or being created, |
|---|---|
| **Then** | the form displays all its editable information: identifier, annotations, types, and `property` panels; for an existing `individual`, the entities that reference it are also displayed at the bottom of the form. |

---

**Source code:** `owl_editor.js` → `renderForm()` — Generates the complete form with: ID field (real-time sanitisation via `_sanitizeId()`), Annotations section, Types section (`rdf:type`), dynamic property panels via `_getClassProperties()` and `_renderPropPanel()`. For an existing individual, inserts `_whereUsedFrame()` at the bottom. For a new individual, the ID field triggers `save(true)` on `blur`.

### REQ-IND-012 — IRI identifier displayed in the form header

| **If** | the `ontology` has a base IRI and the `individual` has an identifier, |
|---|---|
| **Then** | the `individual`'s full IRI is displayed in the form header to allow the ontologist to identify it unambiguously; this information is not displayed for new `individuals` not yet registered. |

---

**Source code:** `owl_editor.js` → `renderForm()` — If `APP.state.ontology?.id` is defined and the individual has an identifier, displays `{baseIri}#{id}` in the `cls-editor-iri` element of the header. The line is not displayed for new individuals (empty IRI).

### REQ-IND-013 — Annotations: labels and comments

| **If** | the form is displayed, existing annotations are presented as editable rows. **If** the ontologist adds an annotation, |
|---|---|
| **Then** | a new row is dynamically inserted into the annotations table, with auto-save if the `individual` is already registered. |

| **If** | the ontologist deletes an annotation, |
|---|---|
| **Then** | the row is removed and saving is triggered automatically. |

---

**Source code:** `owl_editor.js` → `renderForm()`, `addAnnotRow()`, `removeAnnotRow()` — Existing annotations (`labels`, `comments`, `other`) are rendered via `_annoRow()`. `addAnnotRow()` inserts a new row via `_makeAnnotRow()` into `ind-annotations-body`, with `onchange` enabled for autoSave if `_editingId !== null`. `removeAnnotRow()` removes the DOM row and triggers `autoSave()`.

### REQ-IND-014 — Custom property annotations

| **If** | the ontologist selects a custom `annotation property` in the dedicated picker, |
|---|---|
| **Then** | an annotation row for that `property` is added to the form and the picker closes. |

---

**Source code:** `owl_editor.js` → `addOtherAnnotRow()` — Adds an `other` annotation row to the annotations table using the property passed as parameter (read from `ind-anno-picker`), then hides the picker.

### REQ-IND-016 — Dynamic property panels (Object Properties)

| **If** | the ontologist `views` the form of an `individual` that has `Object Properties`, |
|---|---|
| **Then** | each `Object Property` is presented in a dedicated panel displaying the already-assigned target `individuals`, with the ability to navigate to each of them, add new relationships or remove existing ones. |

---

**Source code:** `owl_editor.js` → `_renderPropPanel()`, `addPropValue()` — For each `op` property, generates a panel listing existing `objectAssertions` with the target's label via `_labelForId()`, a navigation link and a delete button. `addPropValue()` (for `kind='op'`) builds a `<select>` populated by `_indsOfRange()` filtered on the property's effective range.

### REQ-IND-017 — Dynamic property panels (Datatype Properties)

| **If** | the ontologist `views` the form of an `individual` that has `Datatype Properties`, |
|---|---|
| **Then** | each `Datatype Property` is presented in a dedicated panel displaying the already-entered values with their datatype, with the ability to add new values or remove existing ones; URL-type values are presented as clickable links. |

---

**Source code:** `owl_editor.js` → `_renderPropPanel()`, `addPropValue()` — For each `dp` property, generates a panel listing existing `dataAssertions` with an editable text field, the datatype (`xsd:string` by default or the first range of the property) and a delete button. If the value matches `/^https?:\/\//i`, inserts a clickable `🔗` link. `addPropValue()` (for `kind='dp'`) creates an empty text field with the default datatype.

### REQ-IND-019 — Opening the individual picker for an Object Property

| **If** | the ontologist wishes to assign an `individual` to an `Object Property`, |
|---|---|
| **Then** | a picker opens with the class tree and the list of `individuals` compatible with the `property`'s range. |

| **If** | the ontologist selects a class in the picker, |
|---|---|
| **Then** | the `individual` list is filtered for that class and its subclasses, excluding the `individual` currently being edited. |

| **If** | the ontologist selects an `individual` in the picker, |
|---|---|
| **Then** | the confirm button becomes active. |

| **If** | the ontologist confirms their choice, |
|---|---|
| **Then** | the selected `individual` is added as a value of the `property` in the form. |

| **If** | the ontologist closes the picker without confirming, |
|---|---|
| **Then** | the picker disappears without any modification. |

---

**Source code:** `owl_editor.js` → `openPicker()`, `pickerSelectClass()`, `pickerSelectInd()`, `confirmPicker()`, `closePicker()` — `openPicker()` displays a modal overlay with two panels (class tree filtered according to `effectiveRange`, or all classes if no range; individual list). `pickerSelectClass()` filters the list by transitive descendancy excluding `_editingId`. `pickerSelectInd()` activates the OK button. `confirmPicker()` inserts the chosen individual as a new row in the property panel (blocks if `single` mode and a value is already present). `closePicker()` removes the overlay from the DOM.

### REQ-IND-033 — Navigation to a target individual from an Object Property

| **If** | an `Object Property` panel displays target `individuals`, |
|---|---|
| **Then** | each value is clickable and allows direct navigation to the target `individual`'s form. |

---

**Source code:** `owl_editor.js` → `_renderPropPanel()` — Each object assertion value is rendered with a link `onclick="APP.navigateTo('individuals','${a.target}')"` enabling direct navigation. This link is also generated after selection via `confirmPicker()`.

### REQ-IND-040 — Complete individual selection on cross-tab navigation

| **If** | the ontologist navigates to an `individual` from outside the `Individuals` tab — clicking an `individual` in the Queries results table, a cross-tab entity link (`APP.navigateTo`), Back/Forward history navigation (`APP._restoreState`) or undo/redo restore, |
|---|---|
| **Then** | the target `individual` is selected end-to-end across all three columns: its representative class is selected in the tree (column 1), the filtered `individual` list is rebuilt (column 2), the `individual` itself is highlighted and its form is displayed (column 3), and the item is scrolled into view. |

---

**Source code:** `owl_editor.js` → `focusIndividual(id, _hist)` — (1) determines the individual's representative class — its first real `rdf:type` (excluding `owl:NamedIndividual`), or "All Individuals" if none — and calls `selectClass()`, which highlights the class and rebuilds the filtered list (column 2); (2) calls `selectIndividual()` to highlight the individual (column 2) and display its form (column 3); (3) scrolls the item into view in column 2. Previously, only the detail form (column 3) was updated: the class tree and individual list did not reflect the selection. The `_hist` parameter avoids double-pushing into the navigation history during restore operations.

### REQ-IND-034 — Clickable link for URL-type data values

| **If** | the value of a data `property` is a URL, |
|---|---|
| **Then** | a clickable link is displayed next to the value to open it directly in a new tab. |

---

**Source code:** `owl_editor.js` → `_renderPropPanel()` — If the value matches the regular expression `/^https?:\/\//i`, inserts an `<a>` link with the `🔗` icon to the right of the text field, with the `target="_blank"` attribute.

### REQ-IND-035 — "Where Used" panel in the form

| **If** | the ontologist `views` the form of an existing `individual`, |
|---|---|
| **Then** | a section at the bottom of the form lists the other entities in the `ontology` that reference that `individual`. |

---

**Source code:** `owl_editor.js` → `renderForm()` — Calls `_whereUsedFrame(r => _ruleUsesIndividual(r, ind.id))` and inserts the result at the bottom of the form, listing the SWRL rules or other entities that reference the individual by its identifier.

### REQ-IND-036 — Column resizing by drag-and-drop

| **If** | the ontologist drags a separator between two columns, |
|---|---|
| **Then** | the width of the adjacent columns adjusts in real time, within limits that guarantee the readability of each area. |

---

*Document generated by static analysis of the `owl_editor.js` source code — no extrapolated functionality.*

**Source code:** `owl_editor.js` → `_initHandle()`, `_initSplitPanes()` — `_initHandle()` handles `mousedown`/`mousemove`/`mouseup` events on `document` to adjust the CSS width of the adjacent panel in real time. Limits: `ind-split-h1` / `ind-tree-panel` between 120 and 520 px; `ind-split-h2` / `ind-list-panel` between 100 and 400 px.

### REQ-IND-042 — Inferred entailments shown as materialised assertions

| **If** | an `individual` carries entailed relationships derived from `rdfs:subPropertyOf` or `owl:inverseOf`, |
|---|---|
| **Then** | these entailments appear as ordinary assertions inside the relevant `property` panels, exactly like base assertions, because the backend has materialised them as `derived=true` assertions; the form no longer presents a separate dedicated section for inferences. |

| **If** | the ontologist views the detail form of an `individual`, |
|---|---|
| **Then** | the former "🧠 Inferred Properties" section is no longer rendered: it has been removed, and inferred entailments are surfaced solely through the standard property panels. |

---

**Source code:** `owl_editor.js` → `renderForm()` — The previous block building a dedicated inferred-properties section has been removed; an inline comment notes that entailments (`subPropertyOf` / `inverseOf`) are now materialised on the backend as `derived=True` assertions. The materialised assertions are therefore listed by `_renderPropPanel()` together with the base ones in the standard panels. `propPanelsHtml` is assembled only from `inhHtml`, `assHtml` and `domHtml` (inherited, asserted/used, and by-domain), with no inferred section.

### REQ-IND-043 — Panels for every actually-asserted property

| **If** | an `individual` actually asserts a `property` that is not covered by any restriction on its types, nor applicable through a domain (for example a `property` with an empty domain), |
|---|---|
| **Then** | the form still renders a panel for that `property`, so that the existing assertion remains visible and editable instead of being silently dropped. |

---

**Source code:** `owl_editor.js` → `renderForm()` — After computing the inherited (`inhProps`), asserted (`assProps`) and by-domain (`domProps`) maps, the form gathers the `property` identifiers actually present in the individual's `objectAssertions` / `dataAssertions` that are not already covered (`_coveredPanels`), resolves each one's kind (`op` / `dp`) against `APP.state.object_properties` / `APP.state.datatype_properties`, and builds extra panels (`usedProps`) merged into `assHtml`. These panels are also counted in `hasProps`, ensuring a property with, e.g., an empty domain is still shown.

---

*— claude-opus-4-8*
