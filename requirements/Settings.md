# Requirements — Settings

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-SET-001 — User settings persistence](#req-set-001--user-settings-persistence)
- [REQ-SET-002 — Settings loading at startup](#req-set-002--settings-loading-at-startup)
- [REQ-SET-005 — Hiding an optional tab](#req-set-005--hiding-an-optional-tab)
- [REQ-SET-006 — Showing a previously hidden optional tab](#req-set-006--showing-a-previously-hidden-optional-tab)
- [REQ-SET-007 — Tab visibility toggle](#req-set-007--tab-visibility-toggle)
- [REQ-SET-009 — Tab visibility persistence in localStorage](#req-set-009--tab-visibility-persistence-in-localstorage)
- [REQ-SET-010 — Setting the preferred language](#req-set-010--setting-the-preferred-language)
- [REQ-SET-011 — Enabling or disabling a language](#req-set-011--enabling-or-disabling-a-language)
- [REQ-SET-012 — Protection of the preferred language against deactivation](#req-set-012--protection-of-the-preferred-language-against-deactivation)
- [REQ-SET-013 — Catalogue of available European languages](#req-set-013--catalogue-of-available-european-languages)
- [REQ-SET-014 — Selection of the individual identifier format](#req-set-014--selection-of-the-individual-identifier-format)
- [REQ-SET-015 — Automatic generation of an identifier for a new individual](#req-set-015--automatic-generation-of-an-identifier-for-a-new-individual)

### Form
- [REQ-SET-003 — Sub-tab navigation in the Settings page](#req-set-003--sub-tab-navigation-in-the-settings-page)
- [REQ-SET-004 — Display of the list of configurable GUI tabs](#req-set-004--display-of-the-list-of-configurable-gui-tabs)
- [REQ-SET-008 — Immediate application of tab visibility in the DOM](#req-set-008--immediate-application-of-tab-visibility-in-the-dom)

---

## 1. Substance — Business logic and functional rules

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviours, validations, persistence.


### REQ-SET-001 — User settings persistence

**If** a user setting (`preferredLang`, `activeLangs` or `namingFormat`) is modified,

**Then** the system serialises the three settings as JSON and stores them in `localStorage` under the key `swowl_settings`.

**Source code:** `app.js` → `Settings.save()`

### REQ-SET-002 — Settings loading at startup

**If** the module is initialised,

**Then**:
- the system reads the `swowl_settings` entry from `localStorage` and rehydrates the fields `preferredLang`, `activeLangs` and `namingFormat`;
- if no value is stored, the default values are applied: preferred language `fr`, active languages `['fr']`, identifier format `individual_counter`.

**Source code:** `app.js` → `Settings.load()`

### REQ-SET-005 — Hiding an optional tab

**If** the method `TabVisibility.hide(tabId)` is called
**and** the provided identifier is present in the `_optional` list,

**Then**:
- the identifier is added to the internal `Set` `_hidden`;
- the state is saved and the visibility is applied in the DOM;
- if the currently active tab is the one that has just been hidden, the user is redirected to the `ontologies` tab.

**Source code:** `app.js` → `TabVisibility.hide()`

### REQ-SET-006 — Showing a previously hidden optional tab

**If** the method `TabVisibility.show(tabId)` is called,

**Then**:
- the tab identifier is removed from the `Set` `_hidden`;
- the state is saved in `localStorage`;
- `APP._applyTabVisibility()` is called to make the tab visible in the navigation bar.

**Source code:** `app.js` → `TabVisibility.show()`

### REQ-SET-007 — Tab visibility toggle

**If** the user interacts with the checkbox of an optional tab in the `GUI Tabs` list,

**Then**:
- if the tab is currently hidden, `TabVisibility.show()` is called;
- otherwise, `TabVisibility.hide()` is called.

**Source code:** `app.js` → `TabVisibility.toggle()`

### REQ-SET-009 — Tab visibility persistence in localStorage

**If** an optional tab is hidden or shown (via `TabVisibility.hide()` or `TabVisibility.show()`),

**Then** the system serialises the contents of the `Set` `_hidden` as a JSON array and stores it in `localStorage` under the key `swowl_hidden_tabs`.

**Source code:** `app.js` → `TabVisibility.save()`

### REQ-SET-010 — Setting the preferred language

**If** the user selects a language as the preferred language,

**Then**:
- `preferredLang` is set to the value of the provided language code;
- if this language is not yet in `activeLangs`, it is added;
- the settings are persisted and the interface is refreshed.

**Source code:** `app.js` → `Settings.setPreferred()`

### REQ-SET-011 — Enabling or disabling a language

**If** the user enables or disables a language in the list of available languages,

**Then**:
- if the language code is not in `activeLangs`, it is added;
- otherwise, it is removed;
- the settings are persisted and the interface is refreshed.

**Source code:** `app.js` → `Settings.toggleActive()`

### REQ-SET-012 — Protection of the preferred language against deactivation

**If** the user attempts to disable the language currently set as the preferred language (`lang === preferredLang`),

**Then** the system ignores the action and makes no modification to `activeLangs`.

**Source code:** `app.js` → `Settings.toggleActive()`

### REQ-SET-013 — Catalogue of available European languages

**If** the application is loaded,

**Then** the system exposes a static list of 25 European languages (`availableLangs`), each entry being an object `{ code, name, nameEn }` covering: Bulgarian, Czech, Danish, German, Greek, English, Spanish, Estonian, Finnish, French, Irish, Croatian, Hungarian, Italian, Lithuanian, Latvian, Maltese, Dutch, Norwegian, Polish, Portuguese, Romanian, Slovak, Slovenian and Swedish.

**Source code:** `app.js` → `Settings.availableLangs` (static property initialised in the `Settings` object)

### REQ-SET-014 — Selection of the individual identifier format

**If** the user selects a radio button in the `IDs Rules` sub-tab (`individual_counter`, `class_counter` or `alphanumeric`),

**Then** the system assigns the chosen value to `namingFormat`, persists the settings and refreshes the interface.

**Source code:** `app.js` → `Settings.setNamingFormat()`

### REQ-SET-015 — Automatic generation of an identifier for a new individual

**If** a new individual is created and a default identifier must be computed,

**Then** the system generates that identifier according to the current `namingFormat`:
- **`individual_counter`**: returns `Individual_N` where `N` is the number of existing individuals in `APP.state.individuals` plus 1;
- **`class_counter`**: returns `<classId>_N` if a `classId` is provided, otherwise falls back to `Individual_N`;
- **`alphanumeric`**: generates a string of the form `xxxxx-xxxxx-xxxxx-xxxxx` composed of 4 segments of 5 random alphanumeric characters, the first character of the first segment being mandatory a letter.

**Source code:** `app.js` → `Settings.generateIndividualId()`

---

## 2. Form — Presentation and UI

> Requirements relating to display: layout, visual components, interactions, navigation, styles.

### REQ-SET-003 — Sub-tab navigation in the Settings page

**If** the user accesses the `Settings` page
**and** clicks on one of the sub-tabs (`GUI Tabs`, `Languages`, `IDs Rules`),

**Then**:
- `APP._settingsTab` is updated with the value of the selected sub-tab;
- the content area on the right is re-rendered accordingly.

**Source code:** `app.js` → `APP.renderSettings()`

### REQ-SET-004 — Display of the list of configurable GUI tabs

**If** the user opens the `GUI Tabs` sub-tab of the `Settings` page,

**Then** the system displays the exhaustive list of the 11 application tabs (`Ontologies`, `Settings`, `Classes`, `ObjectProperties`, `DatatypeProperties`, `AnnotationProperties`, `Individuals`, `SWRL Rules`, `Views`, `Queries`, `Inferences`) with:
- a disabled checkbox and the label `required` for tabs marked `fixed: true`;
- an interactive checkbox reflecting the current visibility state for optional tabs.

**Source code:** `app.js` → `APP.renderGuiTabs()`

### REQ-SET-008 — Immediate application of tab visibility in the DOM

**If** the visibility state of an optional tab is modified,

**Then** the system iterates over `TabVisibility._optional` and, for each identifier, selects the element `.nav-item[data-section="<id>"]` in the DOM and assigns it `display:none` if it is in `_hidden`, or removes the inline style otherwise.

**Source code:** `app.js` → `APP._applyTabVisibility()`
