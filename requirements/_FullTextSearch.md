# Requirements — Full Text Search

> Generated on 2026-06-09 | Strictly derived from source code | No hallucination

## Table of Contents

### Logic
- [REQ-FTS-001 — Search in `rdfs:label` values (Part A.1)](#req-fts-001--search-in-rdfslabel-values-part-a1)
- [REQ-FTS-002 — Search in Individual Display Names (Part A.2)](#req-fts-002--search-in-individual-display-names-part-a2)
- [REQ-FTS-003 — Search in SWRL Rule labels (Part A.3)](#req-fts-003--search-in-swrl-rule-labels-part-a3)
- [REQ-FTS-004 — Search in SPARQL VizQ labels (Part A.4)](#req-fts-004--search-in-sparql-vizq-labels-part-a4)
- [REQ-FTS-005 — Search in system IDs — `Class`, `ObjectProperty`, `DatatypeProperty`, `AnnotationProperty`, `Individual` (Part B)](#req-fts-005--search-in-system-ids--class-objectproperty-datatypeproperty-annotationproperty-individual-part-b)
- [REQ-FTS-006 — Search in system IDs — SWRL Rule, SPARQL VizQ (Part B)](#req-fts-006--search-in-system-ids--swrl-rule-sparql-vizq-part-b)
- [REQ-FTS-007 — Coexistence of Part A and Part B results](#req-fts-007--coexistence-of-part-a-and-part-b-results)
- [REQ-FTS-008 — Navigate to entity from a result](#req-fts-008--navigate-to-entity-from-a-result)

### Presentation
- [REQ-FTS-009 — Result ordering and grouping](#req-fts-009--result-ordering-and-grouping)
- [REQ-FTS-010 — Rendering of Part A results (User Labels)](#req-fts-010--rendering-of-part-a-results-user-labels)
- [REQ-FTS-011 — Rendering of Part B results (System IDs)](#req-fts-011--rendering-of-part-b-results-system-ids)
- [REQ-FTS-012 — Keyboard navigation in results](#req-fts-012--keyboard-navigation-in-results)
- [REQ-FTS-013 — Clearing the search](#req-fts-013--clearing-the-search)

---

## 1. Logic — Business rules and functional behaviour

> Requirements independent of the UI: matching rules, priorities, algorithmic behaviours.

---

### REQ-FTS-001 — Search in `rdfs:label` values (Part A.1)

| **If** | the user types a string in the search field, |
|---|---|
| **Then** | the system scans all `rdfs:label` values (all languages) of every entity in the ontology (`Class`, `ObjectProperty`, `DatatypeProperty`, `AnnotationProperty`, `Individual`) and retains any label value that contains the string (case-insensitive). Each match is displayed in the results alongside its language tag in parentheses — e.g. **PPB (en)**, **PPB (fr)** — when a language tag is defined. |

**Source code:** `app.js` → `GlobalSearch._search()` — Builds a merged list of all entities and filters `entity.annotations.labels[].value` with `.toLowerCase().includes(lq)`. Each match produces an item `{ section: 'rdfs-labels', id: entity.id, label: l.value, lang: l.lang || '', kind: entitySection }`.

**Source code:** `app.js` → `GlobalSearch._render()` — In the `rdfs-labels` case, renders the language tag as `<span class="gs-lang-tag">(${r.lang})</span>` appended to the label when `r.lang` is non-empty.

---

### REQ-FTS-002 — Search in Individual Display Names (Part A.2)

| **If** | the user types a string in the search field, |
|---|---|
| **Then** | the system examines the Display Name of each `Individual` (the name computed from priority annotations) and retains any `Individual` whose Display Name contains the string, provided that Display Name differs from the `Individual`'s system ID (to avoid duplicates with Part B). |

**Source code:** `app.js` → `GlobalSearch._search()` — For each `Individual`, calls `IndividualEditor._resolveDisplayLabel(i, null)`; if `dn && dn !== i.id && dn.toLowerCase().includes(lq)`, produces an item `{ section: 'individual-names', id: i.id, label: dn }`.

---

### REQ-FTS-003 — Search in SWRL Rule labels (Part A.3)

| **If** | the user types a string in the search field, |
|---|---|
| **Then** | the system examines the label of each SWRL Rule and retains any rule whose label (different from its ID) contains the string. |

**Source code:** `app.js` → `GlobalSearch._search()` — For each rule in `APP.state.swrl_rules`, checks `rule.label && rule.label !== rule.id && rule.label.toLowerCase().includes(lq)`; produces an item `{ section: 'swrl-labels', id: rule.id, label: rule.label }`.

---

### REQ-FTS-004 — Search in SPARQL VizQ labels (Part A.4)

| **If** | the user types a string in the search field, |
|---|---|
| **Then** | the system examines the label of each saved SPARQL VizQ query and retains any query whose label (different from its ID) contains the string. |

**Source code:** `app.js` → `GlobalSearch._search()` — Loads queries via `SparqlEditor._loadAll()` (localStorage); for each query, checks `query.label && query.label !== query.id && query.label.toLowerCase().includes(lq)`; produces an item `{ section: 'sparql-labels', id: query.id, label: query.label }`.

---

### REQ-FTS-005 — Search in system IDs — `Class`, `ObjectProperty`, `DatatypeProperty`, `AnnotationProperty`, `Individual` (Part B)

| **If** | the user types a string in the search field, |
|---|---|
| **Then** | the system scans the IDs of all `Class`, `ObjectProperty`, `DatatypeProperty`, `AnnotationProperty` and `Individual` entities and retains any entity whose ID contains the string (case-insensitive). |

**Source code:** `app.js` → `GlobalSearch._search()` — For each collection (`classes`, `object_properties`, `datatype_properties`, `annotation_properties`, `individuals`), tests `entity.id.toLowerCase().includes(lq)`; if true, produces an item `{ section: '<section>', id: entity.id, label: entity.id }`.

---

### REQ-FTS-006 — Search in system IDs — SWRL Rule, SPARQL VizQ (Part B)

| **If** | the user types a string in the search field, |
|---|---|
| **Then** | the system scans the IDs of all SWRL Rules and SPARQL VizQ queries and retains any entity whose ID contains the string (case-insensitive). |

**Source code:** `app.js` → `GlobalSearch._search()` — For `swrl_rules`, tests `entity.id.toLowerCase().includes(lq)`. For SPARQL VizQ, iterates over `SparqlEditor._loadAll()` and tests `query.id.toLowerCase().includes(lq)`; each match produces an item `{ section: 'swrl-rules' | 'sparql-vizq', id: entity.id, label: entity.id }`.

---

### REQ-FTS-007 — Coexistence of Part A and Part B results

| **If** | an entity has both an ID that contains the searched string AND a `rdfs:label` (or Display Name) that also contains it, |
|---|---|
| **Then** | the entity appears in **both** sections: once in Part A (with the matching label) and once in Part B (with its ID), allowing the user to see both why the label matches and to navigate directly to the entity by its ID. |

**Source code:** `app.js` → `GlobalSearch._search()` — Part A and Part B loops are independent and both execute without mutual exclusion. The same `entity.id` may therefore appear in `results` under two different sections.

---

### REQ-FTS-008 — Navigate to entity from a result

| **If** | the user clicks a search result (or presses Enter after selecting one with the keyboard), |
|---|---|
| **Then** | the system navigates to the corresponding section and entity: Part A results redirect to the parent entity (e.g. an `rdfs:label` result navigates to the `Class` or `ObjectProperty` carrying that label); SPARQL VizQ results activate the VizQ tab and select the corresponding query. |

**Source code:** `app.js` → `GlobalSearch._navigate()` — Applies the mapping `{ 'rdfs-labels': item.kind, 'swrl-labels': 'swrl-rules', 'sparql-labels': 'sparql-vizq', 'individual-names': 'individuals' }` to determine the target section; for `sparql-vizq`, sets `APP._queriesTab = 'vizq'`, calls `SparqlEditor.selectQuery(item.id)` then `APP.renderSection('queries')`; for all other cases, calls `APP.navigateTo(navSection, item.id)`.

---

## 2. Presentation — UI and display rules

> Requirements relating to layout, icons, visual ordering and UI interactions.

---

### REQ-FTS-009 — Result ordering and grouping

| **If** | the search produces results, |
|---|---|
| **Then** | results are grouped into ordered sections: **Part A first** (user labels) in the order `rdfs:label` → `Individual Display Name` → `SWRL Labels` → `SPARQL Labels`, **then Part B** (system IDs) in the order `Classes` → `Object Properties` → `Datatype Properties` → `Annotation Properties` → `Individuals` → `SWRL Rules` → `SPARQL VizQ`. Only sections containing at least one result are displayed. |

**Source code:** `app.js` → `GlobalSearch._render()` — Declares `groups` as an ordered object with keys in this exact order; iterates with `Object.entries(groups).filter(([, arr]) => arr.length)` to show only non-empty sections. `this._items` is rebuilt in display order to guarantee consistent `data-idx` indices.

---

### REQ-FTS-010 — Rendering of Part A results (User Labels)

| **If** | a result belongs to Part A (user label), |
|---|---|
| **Then** | each row displays: (1) a characteristic icon for the label type (`yellow rectangle` for `rdfs:label`, `purple diamond` for Individual Display Name, `⚙️` for SWRL Labels, `🎯` for SPARQL Labels), (2) the matching label text followed by the language tag in parentheses if defined — e.g. **PPB (en)** — styled in a muted colour, (3) the parent entity icon (`brown dot` for `Class`, `blue rectangle` for `ObjectProperty`, `green rectangle` for `DatatypeProperty`, etc.), (4) the parent entity ID as secondary text. |

**Source code:** `app.js` → `GlobalSearch._render()` — The `switch(sec)` handles each Part A section: `rdfs-labels` uses `<span class="lbl-dot">` + `<span class="gs-lang-tag">(${r.lang})</span>` + `this._dot(r.kind)` + `<span class="gs-item-sub">${r.id}</span>`; `individual-names` uses `<span class="xsd-dot">`; `swrl-labels` uses emoji `⚙️`; `sparql-labels` uses emoji `🎯`. CSS `.lbl-dot` defines a 14×9 px rectangle with `background: #FACC15` (yellow). CSS `.gs-lang-tag` renders in 10 px muted text (`--text-faint`).

---

### REQ-FTS-011 — Rendering of Part B results (System IDs)

| **If** | a result belongs to Part B (system ID), |
|---|---|
| **Then** | each row displays only the characteristic icon of the entity type followed by its ID, with no secondary text. |

**Source code:** `app.js` → `GlobalSearch._render()` — The `default` branch of `switch(sec)` renders `${this._dot(sec)}<span class="gs-item-label">${r.label}</span>` without `gs-item-sub`. `GlobalSearch._dot()` returns the corresponding CSS span: `cls-dot` (Classes), `op-prop-dot` (ObjectProperties), `dp-prop-dot` (DatatypeProperties), `anno-prop-dot` (AnnotationProperties), `xsd-dot` (Individuals), emoji `⚙️` (SWRL Rules), emoji `🎯` (SPARQL VizQ).

---

### REQ-FTS-012 — Keyboard navigation in results

| **If** | the results dropdown is open, |
|---|---|
| **Then** | the user can navigate results with `↑` / `↓` arrow keys, confirm the selection with `Enter`, and close the dropdown with `Escape`. If only one result is present, `Enter` selects it directly without prior navigation. |

**Source code:** `app.js` → `GlobalSearch.onKey()` — `ArrowDown` increments `_focusIdx` up to `_items.length - 1`; `ArrowUp` decrements it down to `0`; `Enter` calls `_navigate(_focusIdx)` if an item is focused, or `_navigate(0)` if there is only one result; `Escape` calls `clear()`. `_refreshFocus()` synchronises the `focused` CSS class and scrolls the item into view.

---

### REQ-FTS-013 — Clearing the search

| **If** | the search field is empty or the user clicks the clear button `✕`, |
|---|---|
| **Then** | the results dropdown closes and the input is reset. |

**Source code:** `app.js` → `GlobalSearch.onInput()` — If `!val.trim()`, hides the dropdown (`drop.style.display = 'none'`). The `#global-search-clear` button is shown/hidden based on text presence; clicking it empties the input and triggers `onInput('')`. `GlobalSearch.clear()` resets `_query`, `_focusIdx` and `_items` to their initial state.

---
