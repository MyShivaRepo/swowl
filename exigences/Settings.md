# Exigences — Settings

> Généré le 2026-06-06 | Dérivé strictement du code source | Aucune hallucination

## Table des matières

### Fond
- [REQ-SET-001 — Persistance des paramètres utilisateur](#req-set-001--persistance-des-paramètres-utilisateur)
- [REQ-SET-002 — Chargement des paramètres au démarrage](#req-set-002--chargement-des-paramètres-au-démarrage)
- [REQ-SET-005 — Masquage d'un onglet optionnel](#req-set-005--masquage-dun-onglet-optionnel)
- [REQ-SET-006 — Affichage d'un onglet optionnel précédemment masqué](#req-set-006--affichage-dun-onglet-optionnel-précédemment-masqué)
- [REQ-SET-007 — Basculement de visibilité d'un onglet (toggle)](#req-set-007--basculement-de-visibilité-dun-onglet-toggle)
- [REQ-SET-009 — Persistance de la visibilité des onglets dans le localStorage](#req-set-009--persistance-de-la-visibilité-des-onglets-dans-le-localstorage)
- [REQ-SET-010 — Définition de la langue préférée](#req-set-010--définition-de-la-langue-préférée)
- [REQ-SET-011 — Activation ou désactivation d'une langue](#req-set-011--activation-ou-désactivation-dune-langue)
- [REQ-SET-012 — Protection de la langue préférée contre la désactivation](#req-set-012--protection-de-la-langue-préférée-contre-la-désactivation)
- [REQ-SET-013 — Catalogue des langues européennes disponibles](#req-set-013--catalogue-des-langues-européennes-disponibles)
- [REQ-SET-014 — Sélection du format d'identifiant des individus](#req-set-014--sélection-du-format-didentifiant-des-individus)
- [REQ-SET-015 — Génération automatique d'un identifiant pour un nouvel individu](#req-set-015--génération-automatique-dun-identifiant-pour-un-nouvel-individu)

### Forme
- [REQ-SET-003 — Navigation par sous-onglets dans la page Settings](#req-set-003--navigation-par-sous-onglets-dans-la-page-settings)
- [REQ-SET-004 — Affichage de la liste des onglets GUI configurables](#req-set-004--affichage-de-la-liste-des-onglets-gui-configurables)
- [REQ-SET-008 — Application immédiate de la visibilité des onglets dans le DOM](#req-set-008--application-immédiate-de-la-visibilité-des-onglets-dans-le-dom)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles OWL, contraintes de données, comportements algorithmiques, validations, persistance.


### REQ-SET-001 — Persistance des paramètres utilisateur

**Si** un paramètre utilisateur (`preferredLang`, `activeLangs` ou `namingFormat`) est modifié,

**Alors** le système sérialise en JSON les trois paramètres et les stocke dans le `localStorage` sous la clé `swowl_settings`.

**Code source :** `app.js` → `Settings.save()`

### REQ-SET-002 — Chargement des paramètres au démarrage

**Si** le module est initialisé,

**Alors** :
- le système lit l'entrée `swowl_settings` du `localStorage` et réhydrate les champs `preferredLang`, `activeLangs` et `namingFormat` ;
- si aucune valeur n'est stockée, les valeurs par défaut sont appliquées : langue préférée `fr`, langues actives `['fr']`, format d'identifiant `individual_counter`.

**Code source :** `app.js` → `Settings.load()`

### REQ-SET-003 — Masquage et affichage d'un onglet optionnel

**Si** la méthode `TabVisibility.hide(tabId)` est appelée
**et** que l'identifiant fourni est présent dans la liste `_optional`,

**Alors** :
- l'identifiant est ajouté au `Set` interne `_hidden` ;
- l'état est sauvegardé et la visibilité est appliquée dans le DOM ;
- si l'onglet actuellement actif est celui qui vient d'être masqué, l'utilisateur est redirigé vers l'onglet `ontologies`.

**Si** la méthode `TabVisibility.show(tabId)` est appelée,

**Alors** :
- l'identifiant de l'onglet est supprimé du `Set` `_hidden` ;
- l'état est sauvegardé dans le `localStorage` ;
- `APP._applyTabVisibility()` est appelée pour rendre l'onglet visible dans la barre de navigation.

**Code source :** `app.js` → `TabVisibility.hide()` | `TabVisibility.show()`

### REQ-SET-004 — Basculement de visibilité d'un onglet (toggle)

**Si** l'utilisateur interagit avec la case à cocher d'un onglet optionnel dans la liste `GUI Tabs`,

**Alors** :
- si l'onglet est actuellement masqué, `TabVisibility.show()` est appelée ;
- sinon, `TabVisibility.hide()` est appelée.

**Code source :** `app.js` → `TabVisibility.toggle()`

### REQ-SET-005 — Persistance de la visibilité des onglets dans le localStorage

**Si** un onglet optionnel est masqué ou affiché (via `TabVisibility.hide()` ou `TabVisibility.show()`),

**Alors** le système sérialise le contenu du `Set` `_hidden` en tableau JSON et le stocke dans le `localStorage` sous la clé `swowl_hidden_tabs`.

**Code source :** `app.js` → `TabVisibility.save()`

### REQ-SET-006 — Définition de la langue préférée

**Si** l'utilisateur sélectionne une langue comme langue préférée,

**Alors** :
- `preferredLang` est défini à la valeur du code de langue fourni ;
- si cette langue n'est pas encore dans `activeLangs`, elle y est ajoutée ;
- les paramètres sont persistés et l'interface est rafraîchie.

**Code source :** `app.js` → `Settings.setPreferred()`

### REQ-SET-007 — Activation ou désactivation d'une langue

**Si** l'utilisateur active ou désactive une langue dans la liste des langues disponibles,

**Alors** :
- si le code de langue n'est pas dans `activeLangs`, il y est ajouté ;
- sinon, il en est retiré ;
- les paramètres sont persistés et l'interface est rafraîchie.

**Code source :** `app.js` → `Settings.toggleActive()`

### REQ-SET-008 — Protection de la langue préférée contre la désactivation

**Si** l'utilisateur tente de désactiver la langue actuellement définie comme langue préférée (`lang === preferredLang`),

**Alors** le système ignore l'action et n'effectue aucune modification de `activeLangs`.

**Code source :** `app.js` → `Settings.toggleActive()`

### REQ-SET-009 — Catalogue des langues européennes disponibles

**Si** l'application est chargée,

**Alors** le système expose une liste statique de 25 langues européennes (`availableLangs`), chaque entrée étant un objet `{ code, name, nameEn }` couvrant : bulgare, tchèque, danois, allemand, grec, anglais, espagnol, estonien, finnois, français, irlandais, croate, hongrois, italien, lituanien, letton, maltais, néerlandais, norvégien, polonais, portugais, roumain, slovaque, slovène et suédois.

**Code source :** `app.js` → `Settings.availableLangs` (propriété statique initialisée dans l'objet `Settings`)

### REQ-SET-010 — Sélection du format d'identifiant des individus

**Si** l'utilisateur sélectionne un bouton radio dans le sous-onglet `IDs Rules` (`individual_counter`, `class_counter` ou `alphanumeric`),

**Alors** le système affecte la valeur choisie à `namingFormat`, persiste les paramètres et rafraîchit l'interface.

**Code source :** `app.js` → `Settings.setNamingFormat()`

### REQ-SET-011 — Génération automatique d'un identifiant pour un nouvel individu

**Si** un nouvel individu est créé et qu'un identifiant par défaut doit être calculé,

**Alors** le système génère cet identifiant selon le format actuel de `namingFormat` :
- **`individual_counter`** : retourne `Individual_N` où `N` est le nombre d'individus existants dans `APP.state.individuals` plus 1 ;
- **`class_counter`** : retourne `<classId>_N` si un `classId` est fourni, sinon se rabat sur `Individual_N` ;
- **`alphanumeric`** : génère une chaîne de la forme `xxxxx-xxxxx-xxxxx-xxxxx` composée de 4 segments de 5 caractères alphanumériques aléatoires, le premier caractère du premier segment étant obligatoirement une lettre.

**Code source :** `app.js` → `Settings.generateIndividualId()`

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

### REQ-SET-012 — Navigation par sous-onglets dans la page Settings

**Si** l'utilisateur accède à la page `Settings`
**et** clique sur l'un des sous-onglets (`GUI Tabs`, `Languages`, `IDs Rules`),

**Alors** :
- `APP._settingsTab` est mis à jour avec la valeur du sous-onglet sélectionné ;
- la zone de contenu à droite est réaffichée en conséquence.

**Code source :** `app.js` → `APP.renderSettings()`

### REQ-SET-013 — Affichage de la liste des onglets GUI configurables

**Si** l'utilisateur ouvre le sous-onglet `GUI Tabs` de la page `Settings`,

**Alors** le système affiche la liste exhaustive des 11 onglets de l'application (`Ontologies`, `Settings`, `Classes`, `ObjectProperties`, `DatatypeProperties`, `AnnotationProperties`, `Individuals`, `SWRL Rules`, `Views`, `Queries`, `Inferences`) avec :
- une case à cocher désactivée et le label `required` pour les onglets marqués `fixed: true` ;
- une case à cocher interactive reflétant l'état de visibilité courant pour les onglets optionnels.

**Code source :** `app.js` → `APP.renderGuiTabs()`

### REQ-SET-014 — Application immédiate de la visibilité des onglets dans le DOM

**Si** l'état de visibilité d'un onglet optionnel est modifié,

**Alors** le système parcourt `TabVisibility._optional` et, pour chaque identifiant, sélectionne l'élément `.nav-item[data-section="<id>"]` dans le DOM et lui affecte `display:none` s'il est dans `_hidden`, ou supprime le style inline sinon.

**Code source :** `app.js` → `APP._applyTabVisibility()`
