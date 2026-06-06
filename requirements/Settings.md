# Functional Requirements — Settings Tab (SWOWL)

**Date:** 2026-06-06
**Note:** Requirements derived strictly from the source code (`app.js`). No functionality has been extrapolated — each requirement cites the JavaScript function that implements it.

---

## Table of Contents

1. [REQ-SET-001 — User settings persistence](#req-set-001)
2. [REQ-SET-002 — Settings loading at startup](#req-set-002)
3. [REQ-SET-003 — Sub-tab navigation in the Settings page](#req-set-003)
4. [REQ-SET-004 — Display of the configurable GUI tabs list](#req-set-004)
5. [REQ-SET-005 — Hiding an optional tab](#req-set-005)
6. [REQ-SET-006 — Showing a previously hidden optional tab](#req-set-006)
7. [REQ-SET-007 — Tab visibility toggle](#req-set-007)
8. [REQ-SET-008 — Immediate application of tab visibility in the DOM](#req-set-008)
9. [REQ-SET-009 — Tab visibility persistence in localStorage](#req-set-009)
10. [REQ-SET-010 — Preferred language definition](#req-set-010)
11. [REQ-SET-011 — Enabling or disabling a language](#req-set-011)
12. [REQ-SET-012 — Protection of the preferred language against deactivation](#req-set-012)
13. [REQ-SET-013 — Catalogue of available European languages](#req-set-013)
14. [REQ-SET-014 — Individual identifier format selection](#req-set-014)
15. [REQ-SET-015 — Automatic identifier generation for a new individual](#req-set-015)

---

### REQ-SET-001 — User settings persistence

**Source code:** `app.js` → `Settings.save()`

The `Settings.save()` method serializes the three user settings (`preferredLang`, `activeLangs`, `namingFormat`) as JSON and stores them in `localStorage` under the key `swowl_settings`. It is called upon every modification of a setting.

---

### REQ-SET-002 — Settings loading at startup

**Source code:** `app.js` → `Settings.load()`

The `Settings.load()` method reads the `swowl_settings` entry from `localStorage` and rehydrates the fields `preferredLang`, `activeLangs`, and `namingFormat`. If no value is stored, default values are applied: preferred language `fr`, active languages `['fr']`, identifier format `individual_counter`. It is invoked once at module initialization (`Settings.load()` line 189).

---

### REQ-SET-003 — Sub-tab navigation in the Settings page

**Source code:** `app.js` → `APP.renderSettings()`

The `APP.renderSettings()` function generates a two-column interface: a left sidebar with three clickable sub-tabs (`GUI Tabs`, `Languages`, `IDs Rules`), and a right content area whose rendering depends on the value of `APP._settingsTab`. Clicking a sub-tab updates `APP._settingsTab` and calls `APP.renderSection('settings')` to re-render the page.

---

### REQ-SET-004 — Display of the configurable GUI tabs list

**Source code:** `app.js` → `APP.renderGuiTabs()`

The `APP.renderGuiTabs()` function displays the exhaustive list of the 11 application tabs (`Ontologies`, `Settings`, `Classes`, `ObjectProperties`, `DatatypeProperties`, `AnnotationProperties`, `Individuals`, `SWRL Rules`, `Views`, `Queries`, `Inferences`). Tabs marked `fixed: true` are displayed with a disabled checkbox and the label `required`. Optional tabs are displayed with an interactive checkbox reflecting their current visibility state.

---

### REQ-SET-005 — Hiding an optional tab

**Source code:** `app.js` → `TabVisibility.hide()`

The `TabVisibility.hide(tabId)` method first verifies that the tab is in the `_optional` list. If so, it adds its identifier to the internal `Set` `_hidden`, saves the state, applies the visibility in the DOM, and redirects the user to the `ontologies` tab if the currently active tab is the one that was just hidden.

---

### REQ-SET-006 — Showing a previously hidden optional tab

**Source code:** `app.js` → `TabVisibility.show()`

The `TabVisibility.show(tabId)` method removes the tab identifier from the `Set` `_hidden`, saves the state in `localStorage`, and calls `APP._applyTabVisibility()` to make the tab visible in the navigation bar.

---

### REQ-SET-007 — Tab visibility toggle

**Source code:** `app.js` → `TabVisibility.toggle()`

The `TabVisibility.toggle(tabId)` method calls `TabVisibility.show()` if the tab is currently hidden, or `TabVisibility.hide()` otherwise. It is invoked directly by the `onclick` handler of each tab row in `APP.renderGuiTabs()`.

---

### REQ-SET-008 — Immediate application of tab visibility in the DOM

**Source code:** `app.js` → `APP._applyTabVisibility()`

The `APP._applyTabVisibility()` function iterates over the `TabVisibility._optional` list and, for each identifier, selects the `.nav-item[data-section="<id>"]` element in the DOM. It sets `display:none` if the tab is in `_hidden`, or removes the inline style otherwise.

---

### REQ-SET-009 — Tab visibility persistence in localStorage

**Source code:** `app.js` → `TabVisibility.save()`

The `TabVisibility.save()` method serializes the contents of the `Set` `_hidden` as a JSON array and stores it in `localStorage` under the key `swowl_hidden_tabs`. It is called by `TabVisibility.hide()` and `TabVisibility.show()`.

---

### REQ-SET-010 — Preferred language definition

**Source code:** `app.js` → `Settings.setPreferred()`

The `Settings.setPreferred(lang)` method sets `preferredLang` to the value of the provided language code. If that language is not yet in `activeLangs`, it adds it. It then calls `Settings.save()` and `APP.renderSection('settings')` to persist and refresh the interface.

---

### REQ-SET-011 — Enabling or disabling a language

**Source code:** `app.js` → `Settings.toggleActive()`

The `Settings.toggleActive(lang)` method adds the language code to `activeLangs` if it is not already present, or removes it otherwise. It calls `Settings.save()` and `APP.renderSection('settings')` after each modification.

---

### REQ-SET-012 — Protection of the preferred language against deactivation

**Source code:** `app.js` → `Settings.toggleActive()`

Within the `Settings.toggleActive(lang)` method, a guard at the beginning of the function checks whether `lang === this.preferredLang`. If so, the function returns immediately without making any modification, thereby preventing the removal of the preferred language from the active list.

---

### REQ-SET-013 — Catalogue of available European languages

**Source code:** `app.js` → `Settings.availableLangs` (static property initialized in the `Settings` object)

The `Settings` object declares an `availableLangs` property containing an array of 25 entries. Each entry is an object `{ code, name, nameEn }` corresponding to an official or commonly used language in Europe (Bulgarian, Czech, Danish, German, Greek, English, Spanish, Estonian, Finnish, French, Irish, Croatian, Hungarian, Italian, Lithuanian, Latvian, Maltese, Dutch, Norwegian, Polish, Portuguese, Romanian, Slovak, Slovenian, Swedish).

---

### REQ-SET-014 — Individual identifier format selection

**Source code:** `app.js` → `Settings.setNamingFormat()`

The `Settings.setNamingFormat(fmt)` method assigns the received value to `this.namingFormat`, calls `Settings.save()` to persist, then `APP.renderSection('settings')` to refresh the interface. It is triggered by the radio buttons in the `IDs Rules` sub-tab, which offers three values: `individual_counter`, `class_counter`, `alphanumeric`.

---

### REQ-SET-015 — Automatic identifier generation for a new individual

**Source code:** `app.js` → `Settings.generateIndividualId()`

The `Settings.generateIndividualId(classId)` method computes a default identifier for a new individual according to the format stored in `Settings.namingFormat`:

- **`individual_counter`**: returns `Individual_N` where `N` is the number of existing individuals in `APP.state.individuals` plus 1.
- **`class_counter`**: returns `<classId>_N` if a `classId` is provided, otherwise falls back to `Individual_N`.
- **`alphanumeric`**: generates a string of the form `xxxxx-xxxxx-xxxxx-xxxxx` composed of 4 segments of 5 random alphanumeric characters, with the first character of the first segment being mandatorily a letter.

---

*— claude-sonnet-4-6*
