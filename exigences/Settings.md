# Exigences fonctionnelles — Onglet Settings (SWOWL)

**Date :** 2026-06-06
**Note :** Exigences dérivées strictement du code source (`app.js`). Aucune fonctionnalité n'a été extrapolée — chaque exigence cite la fonction JavaScript qui l'implémente.

---

## Table des matières

1. [REQ-SET-001 — Persistance des paramètres utilisateur](#req-set-001-persistance-des-paramètres-utilisateur)
2. [REQ-SET-002 — Chargement des paramètres au démarrage](#req-set-002-chargement-des-paramètres-au-démarrage)
3. [REQ-SET-003 — Navigation par sous-onglets dans la page Settings](#req-set-003-navigation-par-sous-onglets-dans-la-page-settings)
4. [REQ-SET-004 — Affichage de la liste des onglets GUI configurables](#req-set-004-affichage-de-la-liste-des-onglets-gui-configurables)
5. [REQ-SET-005 — Masquage d'un onglet optionnel](#req-set-005-masquage-dun-onglet-optionnel)
6. [REQ-SET-006 — Affichage d'un onglet optionnel précédemment masqué](#req-set-006-affichage-dun-onglet-optionnel-précédemment-masqué)
7. [REQ-SET-007 — Basculement de visibilité d'un onglet (toggle)](#req-set-007-basculement-de-visibilité-dun-onglet-toggle)
8. [REQ-SET-008 — Application immédiate de la visibilité des onglets dans le DOM](#req-set-008-application-immédiate-de-la-visibilité-des-onglets-dans-le-dom)
9. [REQ-SET-009 — Persistance de la visibilité des onglets dans le localStorage](#req-set-009-persistance-de-la-visibilité-des-onglets-dans-le-localstorage)
10. [REQ-SET-010 — Définition de la langue préférée](#req-set-010-définition-de-la-langue-préférée)
11. [REQ-SET-011 — Activation ou désactivation d'une langue](#req-set-011-activation-ou-désactivation-dune-langue)
12. [REQ-SET-012 — Protection de la langue préférée contre la désactivation](#req-set-012-protection-de-la-langue-préférée-contre-la-désactivation)
13. [REQ-SET-013 — Catalogue des langues européennes disponibles](#req-set-013-catalogue-des-langues-européennes-disponibles)
14. [REQ-SET-014 — Sélection du format d'identifiant des individus](#req-set-014-sélection-du-format-didentifiant-des-individus)
15. [REQ-SET-015 — Génération automatique d'un identifiant pour un nouvel individu](#req-set-015-génération-automatique-dun-identifiant-pour-un-nouvel-individu)

---

### REQ-SET-001 — Persistance des paramètres utilisateur

**Code source :** `app.js` → `Settings.save()`

La méthode `Settings.save()` sérialise en JSON les trois paramètres utilisateur (`preferredLang`, `activeLangs`, `namingFormat`) et les stocke dans le `localStorage` sous la clé `swowl_settings`. Elle est appelée à chaque modification d'un paramètre.

---

### REQ-SET-002 — Chargement des paramètres au démarrage

**Code source :** `app.js` → `Settings.load()`

La méthode `Settings.load()` lit l'entrée `swowl_settings` du `localStorage` et réhydrate les champs `preferredLang`, `activeLangs` et `namingFormat`. Si aucune valeur n'est stockée, les valeurs par défaut sont appliquées : langue préférée `fr`, langues actives `['fr']`, format d'identifiant `individual_counter`. Elle est invoquée une seule fois à l'initialisation du module (`Settings.load()` ligne 189).

---

### REQ-SET-003 — Navigation par sous-onglets dans la page Settings

**Code source :** `app.js` → `APP.renderSettings()`

La fonction `APP.renderSettings()` génère une interface à deux colonnes : une barre latérale gauche avec trois sous-onglets cliquables (`GUI Tabs`, `Languages`, `IDs Rules`), et une zone de contenu à droite dont le rendu dépend de la valeur de `APP._settingsTab`. Un clic sur un sous-onglet met à jour `APP._settingsTab` et rappelle `APP.renderSection('settings')` pour réafficher la page.

---

### REQ-SET-004 — Affichage de la liste des onglets GUI configurables

**Code source :** `app.js` → `APP.renderGuiTabs()`

La fonction `APP.renderGuiTabs()` affiche la liste exhaustive des 11 onglets de l'application (`Ontologies`, `Settings`, `Classes`, `ObjectProperties`, `DatatypeProperties`, `AnnotationProperties`, `Individuals`, `SWRL Rules`, `Views`, `Queries`, `Inferences`). Les onglets marqués `fixed: true` sont affichés avec une case à cocher désactivée et le label `required`. Les onglets optionnels sont affichés avec une case à cocher interactive reflétant leur état de visibilité courant.

---

### REQ-SET-005 — Masquage d'un onglet optionnel

**Code source :** `app.js` → `TabVisibility.hide()`

La méthode `TabVisibility.hide(tabId)` vérifie d'abord que l'onglet est bien dans la liste `_optional`. Si c'est le cas, elle ajoute son identifiant au `Set` interne `_hidden`, sauvegarde l'état, applique la visibilité dans le DOM, et redirige l'utilisateur vers l'onglet `ontologies` si l'onglet actuellement actif est celui qui vient d'être masqué.

---

### REQ-SET-006 — Affichage d'un onglet optionnel précédemment masqué

**Code source :** `app.js` → `TabVisibility.show()`

La méthode `TabVisibility.show(tabId)` supprime l'identifiant de l'onglet du `Set` `_hidden`, sauvegarde l'état dans le `localStorage`, et rappelle `APP._applyTabVisibility()` pour rendre l'onglet visible dans la barre de navigation.

---

### REQ-SET-007 — Basculement de visibilité d'un onglet (toggle)

**Code source :** `app.js` → `TabVisibility.toggle()`

La méthode `TabVisibility.toggle(tabId)` appelle `TabVisibility.show()` si l'onglet est actuellement masqué, ou `TabVisibility.hide()` dans le cas contraire. Elle est invoquée directement par le gestionnaire `onclick` de chaque ligne d'onglet dans `APP.renderGuiTabs()`.

---

### REQ-SET-008 — Application immédiate de la visibilité des onglets dans le DOM

**Code source :** `app.js` → `APP._applyTabVisibility()`

La fonction `APP._applyTabVisibility()` parcourt la liste `TabVisibility._optional` et, pour chaque identifiant, sélectionne l'élément `.nav-item[data-section="<id>"]` dans le DOM. Elle affecte `display:none` si l'onglet est dans `_hidden`, ou supprime le style inline sinon.

---

### REQ-SET-009 — Persistance de la visibilité des onglets dans le localStorage

**Code source :** `app.js` → `TabVisibility.save()`

La méthode `TabVisibility.save()` sérialise le contenu du `Set` `_hidden` en tableau JSON et le stocke dans le `localStorage` sous la clé `swowl_hidden_tabs`. Elle est appelée par `TabVisibility.hide()` et `TabVisibility.show()`.

---

### REQ-SET-010 — Définition de la langue préférée

**Code source :** `app.js` → `Settings.setPreferred()`

La méthode `Settings.setPreferred(lang)` définit `preferredLang` à la valeur du code de langue fourni. Si cette langue n'est pas encore dans `activeLangs`, elle l'y ajoute. Elle appelle ensuite `Settings.save()` et `APP.renderSection('settings')` pour persister et rafraîchir l'interface.

---

### REQ-SET-011 — Activation ou désactivation d'une langue

**Code source :** `app.js` → `Settings.toggleActive()`

La méthode `Settings.toggleActive(lang)` ajoute le code de langue à `activeLangs` s'il n'y est pas déjà, ou le retire sinon. Elle appelle `Settings.save()` et `APP.renderSection('settings')` après chaque modification.

---

### REQ-SET-012 — Protection de la langue préférée contre la désactivation

**Code source :** `app.js` → `Settings.toggleActive()`

Dans la méthode `Settings.toggleActive(lang)`, un garde en début de fonction vérifie si `lang === this.preferredLang`. Si c'est le cas, la fonction retourne immédiatement sans effectuer aucune modification, empêchant ainsi la suppression de la langue préférée de la liste active.

---

### REQ-SET-013 — Catalogue des langues européennes disponibles

**Code source :** `app.js` → `Settings.availableLangs` (propriété statique initialisée dans l'objet `Settings`)

L'objet `Settings` déclare une propriété `availableLangs` contenant un tableau de 25 entrées. Chaque entrée est un objet `{ code, name, nameEn }` correspondant à une langue officielle ou courante en Europe (bulgare, tchèque, danois, allemand, grec, anglais, espagnol, estonien, finnois, français, irlandais, croate, hongrois, italien, lituanien, letton, maltais, néerlandais, norvégien, polonais, portugais, roumain, slovaque, slovène, suédois).

---

### REQ-SET-014 — Sélection du format d'identifiant des individus

**Code source :** `app.js` → `Settings.setNamingFormat()`

La méthode `Settings.setNamingFormat(fmt)` affecte la valeur reçue à `this.namingFormat`, appelle `Settings.save()` pour persister, puis `APP.renderSection('settings')` pour rafraîchir l'interface. Elle est déclenchée par les boutons radio du sous-onglet `IDs Rules`, qui propose trois valeurs : `individual_counter`, `class_counter`, `alphanumeric`.

---

### REQ-SET-015 — Génération automatique d'un identifiant pour un nouvel individu

**Code source :** `app.js` → `Settings.generateIndividualId()`

La méthode `Settings.generateIndividualId(classId)` calcule un identifiant par défaut pour un nouvel individu selon le format stocké dans `Settings.namingFormat` :

- **`individual_counter`** : retourne `Individual_N` où `N` est le nombre d'individus existants dans `APP.state.individuals` plus 1.
- **`class_counter`** : retourne `<classId>_N` si un `classId` est fourni, sinon se rabat sur `Individual_N`.
- **`alphanumeric`** : génère une chaîne de la forme `xxxxx-xxxxx-xxxxx-xxxxx` composée de 4 segments de 5 caractères alphanumériques aléatoires, le premier caractère du premier segment étant obligatoirement une lettre.

---

*— claude-sonnet-4-6*
