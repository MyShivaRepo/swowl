# Requirements — Inferences

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-INF-001 — Inference retrieval via the API](#req-inf-001--inference-retrieval-via-the-api)
- [REQ-INF-002 — Automatic panel refresh](#req-inf-002--automatic-panel-refresh)
- [REQ-INF-003 — Stopping automatic refresh](#req-inf-003--stopping-automatic-refresh)
- [REQ-INF-016 — Error handling during inference retrieval](#req-inf-016--error-handling-during-inference-retrieval)

### Form
- [REQ-INF-004 — Displaying ontology consistency status](#req-inf-004--displaying-ontology-consistency-status)
- [REQ-INF-005 — Displaying consistency violations](#req-inf-005--displaying-consistency-violations)
- [REQ-INF-006 — Displaying the transitive closure of the class hierarchy](#req-inf-006--displaying-the-transitive-closure-of-the-class-hierarchy)
- [REQ-INF-007 — Displaying restrictions inherited through class inheritance](#req-inf-007--displaying-restrictions-inherited-through-class-inheritance)
- [REQ-INF-008 — Displaying types inferred via property domain/range](#req-inf-008--displaying-types-inferred-via-property-domainrange)
- [REQ-INF-009 — Displaying inferred symmetric assertions](#req-inf-009--displaying-inferred-symmetric-assertions)
- [REQ-INF-010 — Displaying inferred transitive assertions](#req-inf-010--displaying-inferred-transitive-assertions)
- [REQ-INF-011 — Displaying assertions inferred by property chains and inverses](#req-inf-011--displaying-assertions-inferred-by-property-chains-and-inverses)
- [REQ-INF-012 — Displaying inferred inverse restrictions on classes](#req-inf-012--displaying-inferred-inverse-restrictions-on-classes)
- [REQ-INF-013 — Displaying inverse properties inferred by owl:inverseOf](#req-inf-013--displaying-inverse-properties-inferred-by-owlinverseof)
- [REQ-INF-014 — Manual inference recalculation button](#req-inf-014--manual-inference-recalculation-button)
- [REQ-INF-015 — Collapsible sections for inference results](#req-inf-015--collapsible-sections-for-inference-results)

---

## 1. Substance — Business logic

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviours, validations, persistence.


### REQ-INF-001 — Inference retrieval via the API

| **If** | the application needs to retrieve inference data computed by the backend, |
|---|---|
| **Then** | it performs an HTTP GET call to the `/api/inferences` endpoint and processes the JSON response containing the fields `violations`, `subclass_closure`, `inherited_restrictions`, `inferred_inverse_restrictions`, `inferred_types`, `symmetric_assertions`, `transitive_assertions`, `chain_assertions` and `inferred_inverse_properties`. |

---

**Source code:** `api.js` → `getInferences()`

### REQ-INF-002 — Automatic panel refresh

| **If** | the "Inferences" tab is active (`APP.currentSection === 'inferences'`), |
|---|---|
| **Then** | - the panel refreshes automatically every 3000 ms via `setInterval()` triggering `InferenceUI.refresh()` at each cycle<br>- any existing refresh interval is first stopped via `stopAutoRefresh()` before the new cycle is created |

---

**Source code:** `inference_ui.js` → `startAutoRefresh()`

### REQ-INF-003 — Stopping automatic refresh

| **If** | the automatic refresh stop function is called, |
|---|---|
| **Then** | the current interval is cancelled via `clearInterval()` on the `_autoRefresh` reference and that reference is reset to `null`, ensuring no residual cycle remains before a new cycle starts. |

---

**Source code:** `inference_ui.js` → `stopAutoRefresh()`

### REQ-INF-016 — Error handling during inference retrieval

| **If** | the call to `API.getInferences()` fails, |
|---|---|
| **Then** | - the exception is caught by a `catch` block<br>- the content of the HTML element `#inference-panel` is replaced by a paragraph with CSS class `error` displaying the error message (`e.message`)<br>- no partial data is retained |

---

## 2. Form — Presentation and UI

> Requirements related to display: layout, visual components, interactions, navigation, styles.

**Source code:** `inference_ui.js` → `refresh()`

### REQ-INF-004 — Displaying ontology consistency status

| **If** | the ontology is loaded and the inference panel is displayed, |
|---|---|
| **Then** | - if violations of severity `'error'` exist, a badge "🔴 N error(s)" with CSS class `badge-error` is displayed in the header<br>- if no errors are present, a badge "🟢 Consistent" with CSS class `badge-ok` is displayed<br>- if warnings of severity `'warning'` exist, an additional badge "⚠️ N warning(s)" with class `badge-warn` is displayed |

---

**Source code:** `inference_ui.js` → `render()`

### REQ-INF-005 — Displaying consistency violations

| **If** | the inference panel is rendered and violations have been returned by the backend, |
|---|---|
| **Then** | the "Violations" section lists each violation with a severity icon (🔴 for `'error'`, 🟡 for `'warning'`), the identifier of the concerned entity (`v.entity`) formatted as `<code>`, and the descriptive message (`v.message`); **and** if no violations are present, the message "No violations detected." is displayed instead. |

---

**Source code:** `inference_ui.js` → `_renderViolations()`

### REQ-INF-006 — Displaying the transitive closure of the class hierarchy

| **If** | the ontology is loaded and contains classes linked by `subClassOf` relations, |
|---|---|
| **Then** | the "Resolved hierarchy" section displays a table of the transitive closure of those relations, showing for each class that has at least one ancestor the source class and all its ancestors at every level (each ancestor formatted with CSS class `tag-class`), entries without ancestors being filtered out before rendering. |

---

**Source code:** `inference_ui.js` → `_renderSubclassClosure()`

### REQ-INF-007 — Displaying restrictions inherited through class inheritance

| **If** | the ontology is loaded and OWL restrictions have been propagated through the class hierarchy, |
|---|---|
| **Then** | the "Inherited restrictions" section displays a table showing for each entry: the inheriting class (`r.class_id`), the parent class from which the restriction is inherited (`r.inherited_from`), and the textual description of the restriction built from the fields `restr.type`, `restr.property`, `restr.filler` and `restr.cardinality`. |

---

**Source code:** `inference_ui.js` → `_renderInheritedRestrictions()`

### REQ-INF-008 — Displaying types inferred via property domain/range

| **If** | the ontology is loaded and types have been inferred for individuals from the domains and ranges (`domain`/`range`) of properties, |
|---|---|
| **Then** | the "Inferred types" section displays a table showing for each individual: its label resolved via `IndividualEditor._labelForId()` (with the full IRI in the `title` attribute if the label differs), the inferred type (`t.inferred_type`), and the textual justification (`t.reason`). |

---

**Source code:** `inference_ui.js` → `_renderInferredTypes()`

### REQ-INF-009 — Displaying inferred symmetric assertions

| **If** | the ontology is loaded and assertions have been inferred by applying the `owl:SymmetricProperty` characteristic **and** the resulting list is non-empty, |
|---|---|
| **Then** | the "Inferred symmetric assertions" section displays a table showing for each assertion: the source individual (label resolved via `IndividualEditor._labelForId()`), the property (`a.property`), the target individual (label resolved in the same way), and the justification (`a.reason`). |

---

**Source code:** `inference_ui.js` → `_renderAssertions()`

### REQ-INF-010 — Displaying inferred transitive assertions

| **If** | the ontology is loaded and assertions have been inferred by applying the `owl:TransitiveProperty` characteristic **and** the resulting list is non-empty, |
|---|---|
| **Then** | the "Inferred transitive assertions" section displays a table in the same format as REQ-INF-009, with the `transitive_assertions` list as the data source. |

---

**Source code:** `inference_ui.js` → `_renderAssertions()`

### REQ-INF-011 — Displaying assertions inferred by property chains and inverses

| **If** | the ontology is loaded and assertions have been inferred by applying property chains (`owl:propertyChainAxiom`) and inverse properties **and** the resulting list is non-empty, |
|---|---|
| **Then** | the "Assertions (chains + inverses)" section displays a table in the same format as REQ-INF-009 and REQ-INF-010, with the `chain_assertions` list as the data source. |

---

**Source code:** `inference_ui.js` → `_renderAssertions()`

### REQ-INF-012 — Displaying inferred inverse restrictions on classes

| **If** | the ontology is loaded and existential restrictions have been inferred on classes by property inversion **and** the resulting list is non-empty, |
|---|---|
| **Then** | the "Inferred inverse restrictions" section displays a table showing for each restriction: the concerned class (`i.class_id`), the restriction description in the form `∃<property>.<filler>` built from the fields `r.property` and `r.filler`, and the justification (`i.reason`). |

---

**Source code:** `inference_ui.js` → `_renderInverseClassRestrictions()`

### REQ-INF-013 — Displaying inverse properties inferred by owl:inverseOf

| **If** | the ontology is loaded and OWL properties have been inferred by symmetry of the `owl:inverseOf` relation, |
|---|---|
| **Then** | - the "Inferred inverse properties" section displays a table showing for each entry: the inferred property (`i.property_id`), the property of which it is the inverse (`i.inverse_of`), and the justification (`i.reason`)<br>- if no inverse property is inferred, the message "No inverse inferred by owl:inverseOf symmetry." is displayed instead |

---

**Source code:** `inference_ui.js` → `_renderInferredInverseProperties()`

### REQ-INF-014 — Manual inference recalculation button

| **If** | the user clicks the "↻" button displayed in the inference panel header, |
|---|---|
| **Then** | `InferenceUI.refresh()` is called immediately, triggering a full recalculation and reload of inferences from the backend, independently of the automatic refresh cycle. |

---

**Source code:** `inference_ui.js` → `render()`

### REQ-INF-015 — Collapsible sections for inference results

| **If** | an inference results section contains at least one element **and** the user clicks on its title, |
|---|---|
| **Then** | - the section toggles between collapsed and expanded states via `this.parentElement.classList.toggle('open')`<br>- the section is rendered with the CSS class `collapsible`<br>- a visual indicator `▶` (CSS class `caret`) is displayed in the title |

---

**Source code:** `inference_ui.js` → `_renderSubclassClosure()`, `_renderInheritedRestrictions()`, `_renderInferredTypes()`, `_renderAssertions()`, `_renderInverseClassRestrictions()`, `_renderInferredInverseProperties()`
