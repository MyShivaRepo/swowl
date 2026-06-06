# Requirements — Inferences

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-INF-001 — Fetching inferences via the API](#req-inf-001--fetching-inferences-via-the-api)
- [REQ-INF-002 — Automatic panel refresh](#req-inf-002--automatic-panel-refresh)
- [REQ-INF-003 — Stopping automatic refresh](#req-inf-003--stopping-automatic-refresh)
- [REQ-INF-016 — Error handling when fetching inferences](#req-inf-016--error-handling-when-fetching-inferences)

### Form
- [REQ-INF-004 — Displaying the ontology consistency status](#req-inf-004--displaying-the-ontology-consistency-status)
- [REQ-INF-005 — Displaying consistency violations](#req-inf-005--displaying-consistency-violations)
- [REQ-INF-006 — Displaying the transitive closure of the class hierarchy](#req-inf-006--displaying-the-transitive-closure-of-the-class-hierarchy)
- [REQ-INF-007 — Displaying restrictions inherited via class inheritance](#req-inf-007--displaying-restrictions-inherited-via-class-inheritance)
- [REQ-INF-008 — Displaying types inferred via property domain/range](#req-inf-008--displaying-types-inferred-via-property-domainrange)
- [REQ-INF-009 — Displaying inferred symmetric assertions](#req-inf-009--displaying-inferred-symmetric-assertions)
- [REQ-INF-010 — Displaying inferred transitive assertions](#req-inf-010--displaying-inferred-transitive-assertions)
- [REQ-INF-011 — Displaying assertions inferred via property chains and inverses](#req-inf-011--displaying-assertions-inferred-via-property-chains-and-inverses)
- [REQ-INF-012 — Displaying inferred inverse restrictions on classes](#req-inf-012--displaying-inferred-inverse-restrictions-on-classes)
- [REQ-INF-013 — Displaying inverse properties inferred by owl:inverseOf](#req-inf-013--displaying-inverse-properties-inferred-by-owlinverseof)
- [REQ-INF-014 — Manual inference recalculation button](#req-inf-014--manual-inference-recalculation-button)
- [REQ-INF-015 — Collapsible sections for inference results](#req-inf-015--collapsible-sections-for-inference-results)

---

## 1. Substance — Business logic and functional rules

> Requirements independent of the UI: OWL rules, data constraints, algorithms, persistence.


### REQ-INF-001 — Fetching inferences via the API

The application performs an HTTP GET request to the `/api/inferences` endpoint to retrieve the full set of inference data computed by the backend. The response is a JSON object containing the fields `violations`, `subclass_closure`, `inherited_restrictions`, `inferred_inverse_restrictions`, `inferred_types`, `symmetric_assertions`, `transitive_assertions`, `chain_assertions` and `inferred_inverse_properties`.

---

**Source code:** `api.js` → `getInferences()`

### REQ-INF-002 — Automatic panel refresh

When the "Inferences" tab is active (`APP.currentSection === 'inferences'`), the panel refreshes automatically at a regular interval. The default interval is 3000 ms. The function calls `setInterval()`, which triggers `InferenceUI.refresh()` at each cycle, and first stops any existing interval via `stopAutoRefresh()` before creating a new one.

---

**Source code:** `inference_ui.js` → `startAutoRefresh()`

### REQ-INF-003 — Stopping automatic refresh

The function stops the automatic refresh interval by calling `clearInterval()` on the `_autoRefresh` reference and resetting it to `null`. This function is systematically called before starting any new refresh cycle.

---

**Source code:** `inference_ui.js` → `stopAutoRefresh()`

### REQ-INF-016 — Error handling when fetching inferences

If the call to `API.getInferences()` fails, the exception is caught by a `catch` block. The content of the HTML element `#inference-panel` is replaced by a paragraph with the CSS class `error` displaying the error message (`e.message`). No partial data is retained in case of error.

---

## 2. Form — Presentation and user interface

> Requirements related to display: layout, visual components, interactions, navigation, styles.

**Source code:** `inference_ui.js` → `refresh()`

### REQ-INF-004 — Displaying the ontology consistency status

The panel header displays a status badge computed from violations whose severity is `'error'`. If errors exist, the badge displays "🔴 N error(s)" with the CSS class `badge-error`. If no errors are present, the badge displays "🟢 Consistent" with the CSS class `badge-ok`. Warnings (`severity === 'warning'`) generate an additional badge "⚠️ N warning(s)" with the class `badge-warn`.

---

**Source code:** `inference_ui.js` → `render()`

### REQ-INF-005 — Displaying consistency violations

The "Violations" section lists all violations returned by the backend. Each violation is displayed with: an icon based on severity (🔴 for `'error'`, 🟡 for `'warning'`), the identifier of the affected entity (`v.entity`) formatted as `<code>`, and the descriptive message (`v.message`). If no violations are present, the message "No violations detected." is displayed.

---

**Source code:** `inference_ui.js` → `_renderViolations()`

### REQ-INF-006 — Displaying the transitive closure of the class hierarchy

The "Resolved hierarchy" section displays, as a table, the transitive closure of the ontology's `subClassOf` relations. For each class with at least one ancestor, the table shows the source class and the full set of its ancestors at all levels, each ancestor formatted with the CSS class `tag-class`. Entries without ancestors are filtered before rendering (`ancs.length > 0`).

---

**Source code:** `inference_ui.js` → `_renderSubclassClosure()`

### REQ-INF-007 — Displaying restrictions inherited via class inheritance

The "Inherited restrictions" section displays a table of OWL restrictions inherited through class hierarchy propagation. For each entry, the table shows: the inheriting class (`r.class_id`), the parent class from which the restriction is inherited (`r.inherited_from`), and the textual description of the restriction built from the fields `restr.type`, `restr.property`, `restr.filler` and `restr.cardinality`.

---

**Source code:** `inference_ui.js` → `_renderInheritedRestrictions()`

### REQ-INF-008 — Displaying types inferred via property domain/range

The "Inferred types" section displays a table of OWL types inferred for individuals from the domains and ranges (`domain`/`range`) of properties. For each individual, the table shows: the individual's label resolved via `IndividualEditor._labelForId()` (with the full IRI as a `title` attribute if the label differs), the inferred type (`t.inferred_type`), and the textual justification (`t.reason`).

---

**Source code:** `inference_ui.js` → `_renderInferredTypes()`

### REQ-INF-009 — Displaying inferred symmetric assertions

The "Inferred symmetric assertions" section lists individual assertions inferred by applying the `owl:SymmetricProperty` characteristic. Each table row shows: the source individual (label resolved via `IndividualEditor._labelForId()`), the property (`a.property`), the target individual (label resolved in the same way), and the justification (`a.reason`). The section is not rendered if the list is empty.

---

**Source code:** `inference_ui.js` → `_renderAssertions()`

### REQ-INF-010 — Displaying inferred transitive assertions

The "Inferred transitive assertions" section lists individual assertions inferred by applying the `owl:TransitiveProperty` characteristic. The rendering is identical to REQ-INF-009 (same `_renderAssertions()` function called with a different title and the `transitive_assertions` list). The section is not rendered if the list is empty.

---

**Source code:** `inference_ui.js` → `_renderAssertions()`

### REQ-INF-011 — Displaying assertions inferred via property chains and inverses

The "Assertions (chains + inverses)" section lists individual assertions inferred by applying property chains (`owl:propertyChainAxiom`) and inverse properties. The rendering is identical to REQ-INF-009 and REQ-INF-010 (same `_renderAssertions()` function called with the `chain_assertions` list). The section is not rendered if the list is empty.

---

**Source code:** `inference_ui.js` → `_renderAssertions()`

### REQ-INF-012 — Displaying inferred inverse restrictions on classes

The "Inferred inverse restrictions" section displays a table of existential restrictions inferred on classes through property inversion. The description of each restriction is built in the form `∃<property>.<filler>` from the fields `r.property` and `r.filler`. The table also shows the affected class (`i.class_id`) and the justification (`i.reason`). The section is not rendered if the list is empty.

---

**Source code:** `inference_ui.js` → `_renderInverseClassRestrictions()`

### REQ-INF-013 — Displaying inverse properties inferred by owl:inverseOf

The "Inferred inverse properties" section displays a table of OWL properties inferred by symmetry of the `owl:inverseOf` relation. For each entry, the table shows: the inferred property (`i.property_id`), the property of which it is the inverse (`i.inverse_of`), and the justification (`i.reason`). If no inverse property is inferred, the message "No inverse inferred by owl:inverseOf symmetry." is displayed.

---

**Source code:** `inference_ui.js` → `_renderInferredInverseProperties()`

### REQ-INF-014 — Manual inference recalculation button

The panel header contains a "↻" button whose `onclick` event handler directly calls `InferenceUI.refresh()`. This button allows the user to manually trigger a recalculation and reload of inferences from the backend, independently of the automatic refresh cycle.

---

**Source code:** `inference_ui.js` → `render()`

### REQ-INF-015 — Collapsible sections for inference results

All result sections containing at least one element are rendered with the CSS class `collapsible`. An `onclick` handler on the title element calls `this.parentElement.classList.toggle('open')`, allowing the user to collapse or expand each section individually. A visual indicator `▶` (CSS class `caret`) is displayed in the title.

---

— claude-sonnet-4-6

**Source code:** `inference_ui.js` → `_renderSubclassClosure()`, `_renderInheritedRestrictions()`, `_renderInferredTypes()`, `_renderAssertions()`, `_renderInverseClassRestrictions()`, `_renderInferredInverseProperties()`
