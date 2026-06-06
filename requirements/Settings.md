# Requirements — Settings

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-SET-001 — User settings persistence](#req-set-001--user-settings-persistence)
- [REQ-SET-002 — Settings loading at startup](#req-set-002--settings-loading-at-startup)
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


### REQ-SET-001 — User settings persistence

| **If** | the user modifies one of their configuration settings (preferred language, active languages, or identifier format), |
|---|---|
| **Then** | the application automatically saves these preferences so they can be restored in subsequent sessions. |

**Source code:** `app.js` → `Settings.save()` — Serialises the three parameters `preferredLang`, `activeLangs` and `namingFormat` as JSON, then stores them in `localStorage` under the key `swowl_settings`.

### REQ-SET-002 — Settings loading at startup

| **If** | the user opens the application, |
|---|---|
| **Then** | their previously saved preferences are automatically restored; if no preference has ever been saved, the application initialises with default values: French as the preferred and sole active language, and the simple counter format for individual identifiers. |

**Source code:** `app.js` → `Settings.load()` — Reads the `swowl_settings` entry from `localStorage` and rehydrates the fields `preferredLang`, `activeLangs` and `namingFormat`; applies default values (`preferredLang: 'fr'`, `activeLangs: ['fr']`, `namingFormat: 'individual_counter'`) if no value is stored.

### REQ-SET-005 — Hiding an optional tab

| **If** | the user chooses to hide an optional tab from the interface, |
|---|---|
| **Then** | the tab immediately disappears from the navigation bar and this choice is saved; if the hidden tab was the active one, the user is automatically redirected to the **`Ontologies`** tab. |

**Source code:** `app.js` → `TabVisibility.hide(tabId)` — Verifies that `tabId` is present in `_optional`, adds it to the internal `Set` `_hidden`, saves the state to `localStorage`, applies the visibility in the DOM via `APP._applyTabVisibility()`, then redirects to `'ontologies'` if the active tab matches the one being hidden.

### REQ-SET-006 — Showing a previously hidden optional tab

| **If** | the user chooses to show a previously hidden optional tab, |
|---|---|
| **Then** | the tab immediately reappears in the navigation bar and this choice is saved. |

**Source code:** `app.js` → `TabVisibility.show(tabId)` — Removes `tabId` from the `Set` `_hidden`, persists the state to `localStorage` via `TabVisibility.save()`, then calls `APP._applyTabVisibility()` to make the tab visible in the DOM.

### REQ-SET-007 — Toggling tab visibility

| **If** | the user enables or disables the visibility of an optional tab, |
|---|---|
| **Then** | the tab changes state: it is hidden if it was visible, or shown again if it was hidden. |

**Source code:** `app.js` → `TabVisibility.toggle(tabId)` — Calls `TabVisibility.show()` if `tabId` is in `_hidden`, otherwise calls `TabVisibility.hide()`.

### REQ-SET-009 — Persisting tab visibility in localStorage

| **If** | the user changes the visibility of an optional tab, |
|---|---|
| **Then** | the visibility configuration of all optional tabs is saved to be restored in the next session. |

**Source code:** `app.js` → `TabVisibility.save()` — Serialises the contents of the `Set` `_hidden` as a JSON array and stores it in `localStorage` under the key `swowl_hidden_tabs`.

### REQ-SET-010 — Setting the preferred language

| **If** | the user designates a language as their preferred language, |
|---|---|
| **Then** | that language becomes the primary working language; if it was not yet active, it is automatically added to the active languages, and the choice is saved. |

**Source code:** `app.js` → `Settings.setPreferred(lang)` — Assigns `lang` to `preferredLang`, adds `lang` to `activeLangs` if absent, then calls `Settings.save()` and refreshes the interface.

### REQ-SET-011 — Enabling or disabling a language

| **If** | the user enables or disables a language in the list of available languages, |
|---|---|
| **Then** | the language is added to or removed from the set of active languages, and the choice is saved. |

**Source code:** `app.js` → `Settings.toggleActive(lang)` — Adds `lang` to `activeLangs` if absent, removes it otherwise (unless `lang === preferredLang`), then calls `Settings.save()` and refreshes the interface.

### REQ-SET-012 — Protecting the preferred language from being disabled

| **If** | the user attempts to disable the language they have set as their preferred language, |
|---|---|
| **Then** | the application silently refuses this action: the preferred language remains active. |

**Source code:** `app.js` → `Settings.toggleActive(lang)` — Aborts execution without any modification if `lang === preferredLang`.

### REQ-SET-013 — Catalogue of available European languages

| **If** | the user consults the list of available languages, |
|---|---|
| **Then** | they access a catalogue of 25 European languages, each identified by its code, its name in its own language, and its name in English. |

**Source code:** `app.js` → `Settings.availableLangs` — Static property containing 25 entries of the form `{ code, name, nameEn }`, covering: Bulgarian, Czech, Danish, German, Greek, English, Spanish, Estonian, Finnish, French, Irish, Croatian, Hungarian, Italian, Lithuanian, Latvian, Maltese, Dutch, Norwegian, Polish, Portuguese, Romanian, Slovak, Slovenian and Swedish.

### REQ-SET-014 — Selecting the individual identifier format

| **If** | the user chooses the naming convention for new individuals, |
|---|---|
| **Then** | the application immediately adopts this format for generating identifiers for the next individuals created, and the choice is saved. |

**Source code:** `app.js` → `Settings.setNamingFormat(format)` — Assigns the chosen value (`individual_counter`, `class_counter` or `alphanumeric`) to `namingFormat`, then calls `Settings.save()` and refreshes the interface.

### REQ-SET-015 — Automatic generation of an identifier for a new individual

| **If** | the user creates a new individual, |
|---|---|
| **Then** | the application automatically suggests an identifier conforming to the chosen naming convention: a global counter if the format is by individual count, a per-class counter if the format is by class, or a unique random string if the alphanumeric format is selected. |

**Source code:** `app.js` → `Settings.generateIndividualId(classId)` — Depending on the value of `namingFormat`: **`individual_counter`** returns `Individual_N` where `N` is `APP.state.individuals.length + 1`; **`class_counter`** returns `<classId>_N` if `classId` is provided, otherwise `Individual_N`; **`alphanumeric`** generates a string `xxxxx-xxxxx-xxxxx-xxxxx` composed of 4 segments of 5 random alphanumeric characters, with the first character of the first segment being mandatorily a letter.

---

## 2. Form — Presentation and UI

> Requirements relating to display: layout, visual components, interactions, navigation, styles.

### REQ-SET-003 — Sub-tab navigation in the Settings page

| **If** | the user accesses the **Settings** page and selects one of the available sub-tabs, |
|---|---|
| **Then** | the content displayed on the right corresponds to the selected sub-tab and the active sub-tab is visually highlighted. |

**Source code:** `app.js` → `APP.renderSettings()` — Updates `APP._settingsTab` with the value of the selected sub-tab (`'gui-tabs'`, `'languages'` or `'ids-rules'`), then redraws the content area accordingly.

### REQ-SET-004 — Displaying the list of configurable GUI tabs

| **If** | the user opens the **GUI Tabs** sub-tab of the **Settings** page, |
|---|---|
| **Then** | they see the list of all application tabs, with a clear indication for each tab: those that are mandatory (non-editable) are flagged as such, while optional tabs display their current visibility state and can be enabled or disabled. |

**Source code:** `app.js` → `APP.renderGuiTabs()` — Displays the 11 tabs (`Ontologies`, `Settings`, `Classes`, `ObjectProperties`, `DatatypeProperties`, `AnnotationProperties`, `Individuals`, `SWRL Rules`, `Views`, `Queries`, `Inferences`); for tabs with `fixed: true`, generates a disabled checkbox with the label `required`; for optional tabs, generates an interactive checkbox whose state reflects the presence or absence of the tab in `TabVisibility._hidden`.

### REQ-SET-008 — Immediate application of tab visibility in the DOM

| **If** | the visibility configuration of one or more optional tabs is updated, |
|---|---|
| **Then** | the navigation bar instantly reflects these changes, without any page reload. |

**Source code:** `app.js` → `APP._applyTabVisibility()` — Iterates over `TabVisibility._optional` and, for each identifier, selects `.nav-item[data-section="<id>"]` in the DOM and sets `display:none` on it if it is present in `_hidden`, or removes the inline style otherwise.

---

*claude-sonnet-4-6*
