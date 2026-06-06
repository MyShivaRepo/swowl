# Requirements — Inferences

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-INF-001 — Inference retrieval via the API](#req-inf-001--inference-retrieval-via-the-api)
- [REQ-INF-002 — Automatic panel refresh](#req-inf-002--automatic-panel-refresh)
- [REQ-INF-003 — Stopping automatic refresh](#req-inf-003--stopping-automatic-refresh)
- [REQ-INF-016 — Error handling during inference retrieval](#req-inf-016--error-handling-during-inference-retrieval)

### Form
- [REQ-INF-004 — Displaying the ontology consistency status](#req-inf-004--displaying-the-ontology-consistency-status)
- [REQ-INF-005 — Displaying consistency violations](#req-inf-005--displaying-consistency-violations)
- [REQ-INF-006 — Displaying the transitive closure of the class hierarchy](#req-inf-006--displaying-the-transitive-closure-of-the-class-hierarchy)
- [REQ-INF-007 — Displaying restrictions inherited through class inheritance](#req-inf-007--displaying-restrictions-inherited-through-class-inheritance)
- [REQ-INF-008 — Displaying types inferred via property domain/range](#req-inf-008--displaying-types-inferred-via-property-domainrange)
- [REQ-INF-009 — Displaying inferred symmetric assertions](#req-inf-009--displaying-inferred-symmetric-assertions)
- [REQ-INF-010 — Displaying inferred transitive assertions](#req-inf-010--displaying-inferred-transitive-assertions)
- [REQ-INF-011 — Displaying assertions inferred via property chains and inverses](#req-inf-011--displaying-assertions-inferred-via-property-chains-and-inverses)
- [REQ-INF-012 — Displaying inferred inverse restrictions on classes](#req-inf-012--displaying-inferred-inverse-restrictions-on-classes)
- [REQ-INF-013 — Displaying inverse properties inferred by owl:inverseOf](#req-inf-013--displaying-inverse-properties-inferred-by-owlinverseof)
- [REQ-INF-014 — Manual inference recalculation button](#req-inf-014--manual-inference-recalculation-button)
- [REQ-INF-015 — Collapsible sections for inference results](#req-inf-015--collapsible-sections-for-inference-results)

---

## 1. Substance — Business logic

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviors, validations, persistence.


### REQ-INF-001 — Inference retrieval via the API

| **If** | the ontologist opens the `inference` panel, |
|---|---|
| **Then** | the application retrieves from the reasoner the full set of computed results: consistency violations, hierarchy closure, inherited `restrictions`, inferred inverse `restrictions`, inferred types, symmetric assertions, transitive assertions, `property` chain assertions, and inverse `properties`. |

---

**Source code:** `api.js` → `getInferences()` — Performs an HTTP GET call to the `/api/inferences` endpoint and processes the JSON response containing the fields `violations`, `subclass_closure`, `inherited_restrictions`, `inferred_inverse_restrictions`, `inferred_types`, `symmetric_assertions`, `transitive_assertions`, `chain_assertions`, and `inferred_inverse_properties`.

### REQ-INF-002 — Automatic panel refresh

| **If** | the ontologist navigates to the `inferences` tab, |
|---|---|
| **Then** | the panel updates automatically on a regular basis, without any user intervention, so as to permanently reflect the current state of reasoning over the `ontology`. |

---

**Source code:** `inference_ui.js` → `startAutoRefresh()` — Stops any existing interval via `stopAutoRefresh()`, then starts a new `setInterval()` cycle of 3,000 ms calling `InferenceUI.refresh()` on each tick.

### REQ-INF-003 — Stopping automatic refresh

| **If** | the ontologist leaves the `inferences` tab or a new refresh cycle is about to start, |
|---|---|
| **Then** | any ongoing automatic update is immediately stopped, leaving no residual active cycle running in the background. |

---

**Source code:** `inference_ui.js` → `stopAutoRefresh()` — Calls `clearInterval()` on the internal reference `_autoRefresh` and resets that reference to `null`.

### REQ-INF-016 — Error handling during inference retrieval

| **If** | retrieving `inferences` from the reasoner fails, |
|---|---|
| **Then** | the ontologist is informed of the failure by an explicit error message displayed in the panel, and no partial or stale data is retained on screen. |

---

**Source code:** `inference_ui.js` → `refresh()` — The `catch` block intercepts the exception, replaces the content of the `#inference-panel` element with a paragraph of CSS class `error` displaying `e.message`, without retaining any partial data.

---

## 2. Form — Presentation and UI

> Requirements related to display: layout, visual components, interactions, navigation, styles.

**Source code:** `inference_ui.js` → `refresh()`

### REQ-INF-004 — Displaying the ontology consistency status

| **If** | the ontologist opens the `inference` panel, |
|---|---|
| **Then** | the panel header clearly indicates whether the `ontology` is consistent, in error, or carrying warnings, with a distinct visual indicator for each severity level. |

---

**Source code:** `inference_ui.js` → `render()` — Generates a CSS badge `badge-error` "🔴 N error(s)" if violations of severity `'error'` exist, a badge `badge-ok` "🟢 Consistent" when no errors are present, and an additional badge `badge-warn` "⚠️ N warning(s)" if warnings of severity `'warning'` are present.

### REQ-INF-005 — Displaying consistency violations

| **If** | the reasoner has detected violations in the `ontology`, |
|---|---|
| **Then** | the "Violations" section lists all of them, visually distinguishing errors from warnings and identifying for each one the concept or entity concerned along with a description of the problem; if no violation is detected, a message explicitly confirms this. |

---

**Source code:** `inference_ui.js` → `_renderViolations()` — For each violation, displays a severity icon (🔴 for `'error'`, 🟡 for `'warning'`), the identifier `v.entity` formatted as `<code>`, and the message `v.message`; displays "No violations detected." if the list is empty.

### REQ-INF-006 — Displaying the transitive closure of the class hierarchy

| **If** | the `ontology` contains `classes` organised in a hierarchy, |
|---|---|
| **Then** | the "Resolved hierarchy" section presents for each class the full set of its ancestors at every level, allowing the ontologist to visualise at a glance the entire specialisation chain without having to traverse the relations one by one manually. |

---

**Source code:** `inference_ui.js` → `_renderSubclassClosure()` — Iterates over the `subclass_closure` field, filters out entries with no ancestors, and displays for each class its ancestors formatted with the CSS class `tag-class` in a table; empty entries are ignored before rendering.

### REQ-INF-007 — Displaying restrictions inherited through class inheritance

| **If** | OWL `restrictions` have been defined on parent `classes` and propagated to their subclasses through the hierarchy, |
|---|---|
| **Then** | the "Inherited `restrictions`" section indicates for each subclass which `restrictions` it inherits, from which parent class they originate, and what they consist of, so that the ontologist understands the transitive impact of the hierarchy on `individual` constraints. |

---

**Source code:** `inference_ui.js` → `_renderInheritedRestrictions()` — For each entry in the `inherited_restrictions` field, displays `r.class_id`, `r.inherited_from`, and a description built from the fields `restr.type`, `restr.property`, `restr.filler`, and `restr.cardinality`.

### REQ-INF-008 — Displaying types inferred via property domain/range

| **If** | `individuals` participate in `property` assertions whose domain or range is declared, |
|---|---|
| **Then** | the "Inferred types" section lists the types the reasoner has assigned to those `individuals` by applying domain and range axioms, specifying for each one the justification that led to the `inference`. |

---

**Source code:** `inference_ui.js` → `_renderInferredTypes()` — For each entry in the `inferred_types` field, displays the individual label resolved via `IndividualEditor._labelForId()` (with the full IRI as a `title` attribute if the label differs), the inferred type `t.inferred_type`, and the justification `t.reason`.

### REQ-INF-009 — Displaying inferred symmetric assertions

| **If** | the `ontology` declares symmetric `properties` and assertions exist on those `properties`, |
|---|---|
| **Then** | the "Inferred symmetric assertions" section presents the reciprocal assertions the reasoner has deduced, indicating the two `individuals` involved, the symmetric `property` implied, and the justification for the `inference`. |

---

**Source code:** `inference_ui.js` → `_renderAssertions()` — For each entry in `symmetric_assertions`, displays the source label resolved via `IndividualEditor._labelForId()`, the property `a.property`, the target label resolved in the same way, and the justification `a.reason`; the section is only rendered if the list is non-empty.

### REQ-INF-010 — Displaying inferred transitive assertions

| **If** | the `ontology` declares transitive `properties` and chains of direct assertions exist between `individuals`, |
|---|---|
| **Then** | the "Inferred transitive assertions" section presents the indirect relations the reasoner has deduced by transitivity, with the same level of detail as for symmetric assertions. |

---

**Source code:** `inference_ui.js` → `_renderAssertions()` — Identical to REQ-INF-009, with the `transitive_assertions` field as the data source.

### REQ-INF-011 — Displaying assertions inferred via property chains and inverses

| **If** | the `ontology` defines `property` chains or inverse `properties` and the conditions for their application are met, |
|---|---|
| **Then** | the "Assertions (chains + inverses)" section presents the assertions the reasoner has deduced by `property` composition or inversion, with the same level of detail as for the preceding assertions. |

---

**Source code:** `inference_ui.js` → `_renderAssertions()` — Identical to REQ-INF-009 and REQ-INF-010, with the `chain_assertions` field as the data source.

### REQ-INF-012 — Displaying inferred inverse restrictions on classes

| **If** | inverse `properties` have allowed the reasoner to deduce existential `restrictions` on `classes` that did not explicitly declare them, |
|---|---|
| **Then** | the "Inferred inverse `restrictions`" section lists those deduced `restrictions`, identifying the class concerned, the nature of the `restriction`, and the justification that allowed it to be inferred. |

---

**Source code:** `inference_ui.js` → `_renderInverseClassRestrictions()` — For each entry in `inferred_inverse_restrictions`, displays `i.class_id`, the restriction in the form `∃<r.property>.<r.filler>`, and the justification `i.reason`; the section is only rendered if the list is non-empty.

### REQ-INF-013 — Displaying inverse properties inferred by owl:inverseOf

| **If** | the `ontology` declares `owl:inverseOf` relations between `properties`, |
|---|---|
| **Then** | the "Inferred inverse `properties`" section lists the `properties` the reasoner has deduced by symmetry of that relation, specifying for each one which `property` it is the inverse of and why the `inference` is valid; if no inverse `property` is inferred, a message explicitly confirms this. |

---

**Source code:** `inference_ui.js` → `_renderInferredInverseProperties()` — For each entry in `inferred_inverse_properties`, displays `i.property_id`, `i.inverse_of`, and `i.reason`; displays "No inverse inferred by owl:inverseOf symmetry." if the list is empty.

### REQ-INF-014 — Manual inference recalculation button

| **If** | the ontologist wishes to force an immediate update of the `inference` results without waiting for the next automatic cycle, |
|---|---|
| **Then** | they can trigger a full recalculation on demand, and the panel updates instantly with the latest results from the reasoner. |

---

**Source code:** `inference_ui.js` → `render()` — The "↻" button displayed in the panel header calls `InferenceUI.refresh()` on click, triggering a full reload of inferences from the backend, independently of the `setInterval` cycle.

### REQ-INF-015 — Collapsible sections for inference results

| **If** | the ontologist wants to focus on a particular category of `inferences`, |
|---|---|
| **Then** | they can collapse or expand each results section individually by clicking on its title, and a visual indicator signals the current state (collapsed or expanded) of each section. |

---

**Source code:** `inference_ui.js` → `_renderSubclassClosure()`, `_renderInheritedRestrictions()`, `_renderInferredTypes()`, `_renderAssertions()`, `_renderInverseClassRestrictions()`, `_renderInferredInverseProperties()` — Each section is rendered with the CSS class `collapsible` and a `<span class="caret">▶</span>` in the title; clicking toggles the CSS class `open` on the parent element via `this.parentElement.classList.toggle('open')`.
