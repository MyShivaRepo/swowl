# Requirements — Settings

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-SET-001 — Persistence of user settings](#req-set-001--persistence-of-user-settings)
- [REQ-SET-002 — Loading settings on startup](#req-set-002--loading-settings-on-startup)
- [REQ-SET-005 — Hiding an optional tab](#req-set-005--hiding-an-optional-tab)
- [REQ-SET-006 — Showing a previously hidden optional tab](#req-set-006--showing-a-previously-hidden-optional-tab)
- [REQ-SET-007 — Toggling tab visibility](#req-set-007--toggling-tab-visibility)
- [REQ-SET-009 — Persisting tab visibility in localStorage](#req-set-009--persisting-tab-visibility-in-localstorage)
- [REQ-SET-010 — Setting the preferred language](#req-set-010--setting-the-preferred-language)
- [REQ-SET-011 — Enabling or disabling a language](#req-set-011--enabling-or-disabling-a-language)
- [REQ-SET-012 — Protecting the preferred language from being disabled](#req-set-012--protecting-the-preferred-language-from-being-disabled)
- [REQ-SET-013 — Catalogue of available European languages](#req-set-013--catalogue-of-available-european-languages)
- [REQ-SET-014 — Selecting the individual identifier format](#req-set-014--selecting-the-individual-identifier-format)
- [REQ-SET-015 — Automatic generation of an identifier for a new individual](#req-set-015--automatic-generation-of-an-identifier-for-a-new-individual)

### Form
- [REQ-SET-003 — Sub-tab navigation in the Settings page](#req-set-003--sub-tab-navigation-in-the-settings-page)
- [REQ-SET-004 — Displaying the list of configurable GUI tabs](#req-set-004--displaying-the-list-of-configurable-gui-tabs)
- [REQ-SET-008 — Immediate application of tab visibility in the DOM](#req-set-008--immediate-application-of-tab-visibility-in-the-dom)

---

## 1. Substance — Business logic and functional rules

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviours, validations, persistence.


### REQ-SET-001 — Persistence of user settings


The `Settings.save()` method serialises the three user settings (`preferredLang`, `activeLangs`, `namingFormat`) as JSON and stores them in `localStorage` under the key `swowl_settings`. It is called whenever a setting is modified.

---

**Source code:** `app.js` → `Settings.save()`

### REQ-SET-002 — Loading settings on startup


The `Settings.load()` method reads the `swowl_settings` entry from `localStorage` and rehydrates the fields `preferredLang`, `activeLangs` and `namingFormat`. If no value is stored, default values are applied: preferred language `fr`, active languages `['fr']`, identifier format `individual_counter`. It is invoked once at module initialisation (`Settings.load()` line 189).

---

**Source code:** `app.js` → `Settings.load()`

### REQ-SET-005 — Hiding an optional tab


The `TabVisibility.hide(tabId)` method first verifies that the tab is in the `_optional` list. If so, it adds its identifier to the internal `Set` `_hidden`, saves the state, applies visibility in the DOM, and redirects the user to the `ontologies` tab if the currently active tab is the one that was just hidden.

---

**Source code:** `app.js` → `TabVisibility.hide()`

### REQ-SET-006 — Showing a previously hidden optional tab


The `TabVisibility.show(tabId)` method removes the tab identifier from the `_hidden` `Set`, saves the state to `localStorage`, and calls `APP._applyTabVisibility()` to make the tab visible in the navigation bar.

---

**Source code:** `app.js` → `TabVisibility.show()`

### REQ-SET-007 — Toggling tab visibility


The `TabVisibility.toggle(tabId)` method calls `TabVisibility.show()` if the tab is currently hidden, or `TabVisibility.hide()` otherwise. It is invoked directly by the `onclick` handler of each tab row in `APP.renderGuiTabs()`.

---

**Source code:** `app.js` → `TabVisibility.toggle()`

### REQ-SET-009 — Persisting tab visibility in localStorage


The `TabVisibility.save()` method serialises the contents of the `_hidden` `Set` as a JSON array and stores it in `localStorage` under the key `swowl_hidden_tabs`. It is called by `TabVisibility.hide()` and `TabVisibility.show()`.

---

**Source code:** `app.js` → `TabVisibility.save()`

### REQ-SET-010 — Setting the preferred language


The `Settings.setPreferred(lang)` method sets `preferredLang` to the value of the supplied language code. If that language is not yet in `activeLangs`, it is added. It then calls `Settings.save()` and `APP.renderSection('settings')` to persist and refresh the interface.

---

**Source code:** `app.js` → `Settings.setPreferred()`

### REQ-SET-011 — Enabling or disabling a language


The `Settings.toggleActive(lang)` method adds the language code to `activeLangs` if it is not already present, or removes it otherwise. It calls `Settings.save()` and `APP.renderSection('settings')` after each modification.

---

**Source code:** `app.js` → `Settings.toggleActive()`

### REQ-SET-012 — Protecting the preferred language from being disabled


In the `Settings.toggleActive(lang)` method, a guard at the start of the function checks whether `lang === this.preferredLang`. If so, the function returns immediately without making any modification, thereby preventing the preferred language from being removed from the active list.

---

**Source code:** `app.js` → `Settings.toggleActive()`

### REQ-SET-013 — Catalogue of available European languages


The `Settings` object declares an `availableLangs` property containing an array of 25 entries. Each entry is an object `{ code, name, nameEn }` corresponding to an official or widely used European language (Bulgarian, Czech, Danish, German, Greek, English, Spanish, Estonian, Finnish, French, Irish, Croatian, Hungarian, Italian, Lithuanian, Latvian, Maltese, Dutch, Norwegian, Polish, Portuguese, Romanian, Slovak, Slovenian, Swedish).

---

**Source code:** `app.js` → `Settings.availableLangs` (static property initialised in the `Settings` object)

### REQ-SET-014 — Selecting the individual identifier format


The `Settings.setNamingFormat(fmt)` method assigns the received value to `this.namingFormat`, calls `Settings.save()` to persist it, then `APP.renderSection('settings')` to refresh the interface. It is triggered by the radio buttons in the `IDs Rules` sub-tab, which offers three values: `individual_counter`, `class_counter`, `alphanumeric`.

---

**Source code:** `app.js` → `Settings.setNamingFormat()`

### REQ-SET-015 — Automatic generation of an identifier for a new individual


The `Settings.generateIndividualId(classId)` method computes a default identifier for a new individual according to the format stored in `Settings.namingFormat`:

- **`individual_counter`**: returns `Individual_N` where `N` is the number of existing individuals in `APP.state.individuals` plus 1.
- **`class_counter`**: returns `<classId>_N` if a `classId` is provided, otherwise falls back to `Individual_N`.
- **`alphanumeric`**: generates a string of the form `xxxxx-xxxxx-xxxxx-xxxxx` composed of 4 segments of 5 random alphanumeric characters, the first character of the first segment being required to be a letter.

---

**Source code:** `app.js` → `Settings.generateIndividualId()`

---

## 2. Form — Presentation and user interface

> Requirements relating to display: layout, visual components, interactions, navigation, styles.

### REQ-SET-003 — Sub-tab navigation in the Settings page


The `APP.renderSettings()` function generates a two-column interface: a left sidebar with three clickable sub-tabs (`GUI Tabs`, `Languages`, `IDs Rules`), and a content area on the right whose rendering depends on the value of `APP._settingsTab`. Clicking a sub-tab updates `APP._settingsTab` and calls `APP.renderSection('settings')` to re-render the page.

---

**Source code:** `app.js` → `APP.renderSettings()`

### REQ-SET-004 — Displaying the list of configurable GUI tabs


The `APP.renderGuiTabs()` function displays the exhaustive list of the 11 application tabs (`Ontologies`, `Settings`, `Classes`, `ObjectProperties`, `DatatypeProperties`, `AnnotationProperties`, `Individuals`, `SWRL Rules`, `Views`, `Queries`, `Inferences`). Tabs marked `fixed: true` are displayed with a disabled checkbox and the label `required`. Optional tabs are displayed with an interactive checkbox reflecting their current visibility state.

---

**Source code:** `app.js` → `APP.renderGuiTabs()`

### REQ-SET-008 — Immediate application of tab visibility in the DOM


The `APP._applyTabVisibility()` function iterates over the `TabVisibility._optional` list and, for each identifier, selects the `.nav-item[data-section="<id>"]` element in the DOM. It sets `display:none` if the tab is in `_hidden`, or removes the inline style otherwise.

---

**Source code:** `app.js` → `APP._applyTabVisibility()`
