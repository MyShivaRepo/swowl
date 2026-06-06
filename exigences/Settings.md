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

| **Si** | l'utilisateur modifie l'un de ses paramètres de configuration (langue préférée, langues actives ou format d'identifiant), |
|---|---|
| **Alors** | l'application mémorise automatiquement ces préférences pour les retrouver lors des sessions ultérieures. |

**Code source :** `app.js` → `Settings.save()` — Sérialise en JSON les trois paramètres `preferredLang`, `activeLangs` et `namingFormat`, puis les stocke dans le `localStorage` sous la clé `swowl_settings`.

### REQ-SET-002 — Chargement des paramètres au démarrage

| **Si** | l'utilisateur ouvre l'application, |
|---|---|
| **Alors** | ses préférences précédemment enregistrées sont automatiquement restaurées ; si aucune préférence n'a jamais été sauvegardée, l'application s'initialise avec des valeurs par défaut : le français comme langue préférée et unique langue active, et le format de comptage simple pour les identifiants d'individus. |

**Code source :** `app.js` → `Settings.load()` — Lit l'entrée `swowl_settings` du `localStorage` et réhydrate les champs `preferredLang`, `activeLangs` et `namingFormat` ; applique les valeurs par défaut (`preferredLang: 'fr'`, `activeLangs: ['fr']`, `namingFormat: 'individual_counter'`) si aucune valeur n'est stockée.

### REQ-SET-005 — Masquage d'un onglet optionnel

| **Si** | l'utilisateur choisit de masquer un onglet optionnel de l'interface, |
|---|---|
| **Alors** | l'onglet disparaît immédiatement de la barre de navigation et ce choix est mémorisé ; si l'onglet masqué était celui actif, l'utilisateur est automatiquement redirigé vers l'onglet **`Ontologies`**. |

**Code source :** `app.js` → `TabVisibility.hide(tabId)` — Vérifie que `tabId` est présent dans `_optional`, l'ajoute au `Set` interne `_hidden`, sauvegarde l'état dans le `localStorage`, applique la visibilité dans le DOM via `APP._applyTabVisibility()`, puis redirige vers `'ontologies'` si l'onglet actif correspond à celui masqué.

### REQ-SET-006 — Affichage d'un onglet optionnel précédemment masqué

| **Si** | l'utilisateur choisit de réafficher un onglet optionnel précédemment masqué, |
|---|---|
| **Alors** | l'onglet réapparaît immédiatement dans la barre de navigation et ce choix est mémorisé. |

**Code source :** `app.js` → `TabVisibility.show(tabId)` — Supprime `tabId` du `Set` `_hidden`, persiste l'état dans le `localStorage` via `TabVisibility.save()`, puis appelle `APP._applyTabVisibility()` pour rendre l'onglet visible dans le DOM.

### REQ-SET-007 — Basculement de visibilité d'un onglet (toggle)

| **Si** | l'utilisateur active ou désactive la visibilité d'un onglet optionnel, |
|---|---|
| **Alors** | l'onglet change d'état : il est masqué s'il était visible, ou réaffiché s'il était masqué. |

**Code source :** `app.js` → `TabVisibility.toggle(tabId)` — Appelle `TabVisibility.show()` si `tabId` est dans `_hidden`, sinon appelle `TabVisibility.hide()`.

### REQ-SET-009 — Persistance de la visibilité des onglets dans le localStorage

| **Si** | l'utilisateur modifie la visibilité d'un onglet optionnel, |
|---|---|
| **Alors** | la configuration de visibilité de tous les onglets optionnels est sauvegardée pour être restaurée à la prochaine session. |

**Code source :** `app.js` → `TabVisibility.save()` — Sérialise le contenu du `Set` `_hidden` en tableau JSON et le stocke dans le `localStorage` sous la clé `swowl_hidden_tabs`.

### REQ-SET-010 — Définition de la langue préférée

| **Si** | l'utilisateur désigne une langue comme sa langue préférée, |
|---|---|
| **Alors** | cette langue devient la langue principale de travail ; si elle n'était pas encore activée, elle est automatiquement ajoutée aux langues actives, et le choix est mémorisé. |

**Code source :** `app.js` → `Settings.setPreferred(lang)` — Affecte `lang` à `preferredLang`, ajoute `lang` à `activeLangs` si absent, puis appelle `Settings.save()` et rafraîchit l'interface.

### REQ-SET-011 — Activation ou désactivation d'une langue

| **Si** | l'utilisateur active ou désactive une langue dans la liste des langues disponibles, |
|---|---|
| **Alors** | la langue est ajoutée ou retirée de l'ensemble des langues actives, et le choix est mémorisé. |

**Code source :** `app.js` → `Settings.toggleActive(lang)` — Ajoute `lang` à `activeLangs` s'il est absent, le retire sinon (sauf si `lang === preferredLang`), puis appelle `Settings.save()` et rafraîchit l'interface.

### REQ-SET-012 — Protection de la langue préférée contre la désactivation

| **Si** | l'utilisateur tente de désactiver la langue qu'il a définie comme langue préférée, |
|---|---|
| **Alors** | l'application refuse silencieusement cette action : la langue préférée reste active. |

**Code source :** `app.js` → `Settings.toggleActive(lang)` — Interrompt l'exécution sans modification si `lang === preferredLang`.

### REQ-SET-013 — Catalogue des langues européennes disponibles

| **Si** | l'utilisateur consulte la liste des langues disponibles, |
|---|---|
| **Alors** | il accède à un catalogue de 25 langues européennes, chacune identifiée par son code, son nom dans sa langue d'origine et son nom en anglais. |

**Code source :** `app.js` → `Settings.availableLangs` — Propriété statique contenant 25 entrées de la forme `{ code, name, nameEn }`, couvrant : bulgare, tchèque, danois, allemand, grec, anglais, espagnol, estonien, finnois, français, irlandais, croate, hongrois, italien, lituanien, letton, maltais, néerlandais, norvégien, polonais, portugais, roumain, slovaque, slovène et suédois.

### REQ-SET-014 — Sélection du format d'identifiant des individus

| **Si** | l'utilisateur choisit la convention de nommage pour les nouveaux individus, |
|---|---|
| **Alors** | l'application adopte immédiatement ce format pour la génération des identifiants des prochains individus créés, et ce choix est mémorisé. |

**Code source :** `app.js` → `Settings.setNamingFormat(format)` — Affecte la valeur choisie (`individual_counter`, `class_counter` ou `alphanumeric`) à `namingFormat`, puis appelle `Settings.save()` et rafraîchit l'interface.

### REQ-SET-015 — Génération automatique d'un identifiant pour un nouvel individu

| **Si** | l'utilisateur crée un nouvel individu, |
|---|---|
| **Alors** | l'application lui propose automatiquement un identifiant conforme à la convention de nommage choisie : un compteur global si le format est par nombre d'individus, un compteur par classe si le format est par classe, ou une chaîne aléatoire unique si le format alphanumérique est sélectionné. |

**Code source :** `app.js` → `Settings.generateIndividualId(classId)` — Selon la valeur de `namingFormat` : **`individual_counter`** retourne `Individual_N` où `N` est `APP.state.individuals.length + 1` ; **`class_counter`** retourne `<classId>_N` si `classId` est fourni, sinon `Individual_N` ; **`alphanumeric`** génère une chaîne `xxxxx-xxxxx-xxxxx-xxxxx` composée de 4 segments de 5 caractères alphanumériques aléatoires, le premier caractère du premier segment étant obligatoirement une lettre.

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

### REQ-SET-003 — Navigation par sous-onglets dans la page Settings

| **Si** | l'utilisateur accède à la page **Settings** et sélectionne l'un des sous-onglets disponibles, |
|---|---|
| **Alors** | le contenu affiché à droite correspond au sous-onglet sélectionné et le sous-onglet actif est visuellement mis en évidence. |

**Code source :** `app.js` → `APP.renderSettings()` — Met à jour `APP._settingsTab` avec la valeur du sous-onglet sélectionné (`'gui-tabs'`, `'languages'` ou `'ids-rules'`), puis redessine la zone de contenu en conséquence.

### REQ-SET-004 — Affichage de la liste des onglets GUI configurables

| **Si** | l'utilisateur ouvre le sous-onglet **GUI Tabs** de la page **Settings**, |
|---|---|
| **Alors** | il voit la liste de tous les onglets de l'application, avec une indication claire pour chaque onglet : ceux qui sont obligatoires (non modifiables) sont signalés comme tels, tandis que les onglets optionnels affichent leur état de visibilité actuel et peuvent être activés ou désactivés. |

**Code source :** `app.js` → `APP.renderGuiTabs()` — Affiche les 11 onglets (`Ontologies`, `Settings`, `Classes`, `ObjectProperties`, `DatatypeProperties`, `AnnotationProperties`, `Individuals`, `SWRL Rules`, `Views`, `Queries`, `Inferences`) ; pour les onglets `fixed: true`, génère une case à cocher désactivée avec le label `required` ; pour les onglets optionnels, génère une case à cocher interactive dont l'état reflète la présence ou l'absence dans `TabVisibility._hidden`.

### REQ-SET-008 — Application immédiate de la visibilité des onglets dans le DOM

| **Si** | la configuration de visibilité d'un ou plusieurs onglets optionnels est mise à jour, |
|---|---|
| **Alors** | la barre de navigation reflète instantanément ces changements, sans rechargement de la page. |

**Code source :** `app.js` → `APP._applyTabVisibility()` — Parcourt `TabVisibility._optional` et, pour chaque identifiant, sélectionne `.nav-item[data-section="<id>"]` dans le DOM et lui affecte `display:none` s'il est présent dans `_hidden`, ou supprime le style inline dans le cas contraire.

---

*claude-sonnet-4-6*
