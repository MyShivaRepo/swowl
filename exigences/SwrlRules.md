# Exigences — SwrlRules

> Généré le 2026-06-06 | Dérivé strictement du code source | Aucune hallucination

## Table des matières

### Fond
- [REQ-SWR-005 — Recherche/filtrage des règles](#req-swr-005--recherchefiltrage-des-règles)
- [REQ-SWR-007 — Sélection d'une règle existante](#req-swr-007--sélection-dune-règle-existante)
- [REQ-SWR-008 — Création d'une nouvelle règle](#req-swr-008--création-dune-nouvelle-règle)
- [REQ-SWR-009 — Génération automatique d'un identifiant unique](#req-swr-009--génération-automatique-dun-identifiant-unique)
- [REQ-SWR-011 — Synchronisation des métadonnées depuis le DOM](#req-swr-011--synchronisation-des-métadonnées-depuis-le-dom)
- [REQ-SWR-012 — Sauvegarde automatique lors de la modification des métadonnées](#req-swr-012--sauvegarde-automatique-lors-de-la-modification-des-métadonnées)
- [REQ-SWR-013 — Sauvegarde d'une règle (création ou mise à jour)](#req-swr-013--sauvegarde-dune-règle-création-ou-mise-à-jour)
- [REQ-SWR-014 — Renommage d'une règle existante](#req-swr-014--renommage-dune-règle-existante)
- [REQ-SWR-015 — Suppression d'une règle](#req-swr-015--suppression-dune-règle)
- [REQ-SWR-016 — Ajout d'un atome dans une section](#req-swr-016--ajout-dun-atome-dans-une-section)
- [REQ-SWR-017 — Suppression d'un atome](#req-swr-017--suppression-dun-atome)
- [REQ-SWR-018 — Modification d'un champ d'atome](#req-swr-018--modification-dun-champ-datome)
- [REQ-SWR-025 — Sélection d'une classe dans le picker](#req-swr-025--sélection-dune-classe-dans-le-picker)
- [REQ-SWR-027 — Sélection d'une propriété dans le picker](#req-swr-027--sélection-dune-propriété-dans-le-picker)
- [REQ-SWR-029 — Filtrage des individus par classe dans le picker](#req-swr-029--filtrage-des-individus-par-classe-dans-le-picker)
- [REQ-SWR-030 — Sélection d'un individu dans le picker](#req-swr-030--sélection-dun-individu-dans-le-picker)
- [REQ-SWR-031 — Confirmation de la sélection d'un individu](#req-swr-031--confirmation-de-la-sélection-dun-individu)
- [REQ-SWR-032 — Fermeture du picker d'individu](#req-swr-032--fermeture-du-picker-dindividu)
- [REQ-SWR-034 — Glisser-déposer pour réordonner les atomes](#req-swr-034--glisser-déposer-pour-réordonner-les-atomes)

### Forme
- [REQ-SWR-001 — Affichage de l'interface en deux panneaux](#req-swr-001--affichage-de-linterface-en-deux-panneaux)
- [REQ-SWR-002 — Redimensionnement du panneau liste](#req-swr-002--redimensionnement-du-panneau-liste)
- [REQ-SWR-003 — Affichage de la liste des règles SWRL](#req-swr-003--affichage-de-la-liste-des-règles-swrl)
- [REQ-SWR-004 — Indicateur visuel de références cassées](#req-swr-004--indicateur-visuel-de-références-cassées)
- [REQ-SWR-006 — Mise à jour dynamique du filtrage](#req-swr-006--mise-à-jour-dynamique-du-filtrage)
- [REQ-SWR-010 — Formulaire d'édition d'une règle](#req-swr-010--formulaire-dédition-dune-règle)
- [REQ-SWR-019 — Rendu d'un atome de type `type_atom`](#req-swr-019--rendu-dun-atome-de-type-type_atom)
- [REQ-SWR-020 — Rendu d'un atome de type `property_atom`](#req-swr-020--rendu-dun-atome-de-type-property_atom)
- [REQ-SWR-021 — Rendu d'un atome de type `equality_atom`](#req-swr-021--rendu-dun-atome-de-type-equality_atom)
- [REQ-SWR-022 — Rendu d'un bloc NAF](#req-swr-022--rendu-dun-bloc-naf)
- [REQ-SWR-023 — Rendu d'un atome conditionnel imbriqué](#req-swr-023--rendu-dun-atome-conditionnel-imbriqué)
- [REQ-SWR-024 — Picker de classe pour les atomes `type_atom`](#req-swr-024--picker-de-classe-pour-les-atomes-type_atom)
- [REQ-SWR-026 — Picker de propriété pour les atomes `property_atom`](#req-swr-026--picker-de-propriété-pour-les-atomes-property_atom)
- [REQ-SWR-028 — Picker d'individu bi-panneau (modal)](#req-swr-028--picker-dindividu-bi-panneau-modal)
- [REQ-SWR-033 — Positionnement dynamique des dropdowns](#req-swr-033--positionnement-dynamique-des-dropdowns)
- [REQ-SWR-035 — Navigation vers une entité référencée depuis un atome](#req-swr-035--navigation-vers-une-entité-référencée-depuis-un-atome)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles OWL, contraintes de données, comportements algorithmiques, validations, persistance.


### REQ-SWR-005 — Recherche/filtrage des règles

**Si** l'utilisateur saisit une requête textuelle dans le champ de recherche (`#swrl-search`),

**Alors** le système filtre la liste des règles en effectuant une correspondance insensible à la casse sur les champs `id`, `label` et `comment` de chaque règle, ainsi que sur les champs `class_id`, `property_id`, `var`, `subject`, `object` et `value` de chaque atome du corps (`body`) et de la tête (`head`).

---

**Code source :** `swrl_editor.js` → `_filterRules()`

### REQ-SWR-007 — Sélection d'une règle existante

**Si** l'utilisateur clique sur une règle dans la liste,

**Alors** :
- le système récupère la règle correspondante dans `APP.state.swrl_rules` et en effectue une copie profonde (`JSON.parse(JSON.stringify(rule))`)
- la copie est affectée à `_editingRule`
- le formulaire d'édition est rendu dans le panneau droit
- la classe CSS `selected` est appliquée à l'élément de liste correspondant

---

**Code source :** `swrl_editor.js` → `selectRule()`

### REQ-SWR-008 — Création d'une nouvelle règle

**Si** l'utilisateur clique sur le bouton ➕,

**Alors** :
- le système génère un identifiant unique
- une règle vide est créée (`body: [], head: [], enabled: true`)
- la règle est envoyée via `API.createSWRLRule()`
- l'état de l'application est rafraîchi et la liste est mise à jour
- le formulaire d'édition de la nouvelle règle est affiché et la règle est sélectionnée

---

**Code source :** `swrl_editor.js` → `newRule()`

### REQ-SWR-009 — Génération automatique d'un identifiant unique

**Si** le système doit générer un identifiant pour une nouvelle règle,

**Alors** il part de la valeur `NewRule`, puis tente successivement `NewRule1`, `NewRule2`, etc., jusqu'à trouver un identifiant absent de `APP.state.swrl_rules`.

---

**Code source :** `swrl_editor.js` → `_generateRuleName()`

### REQ-SWR-011 — Synchronisation des métadonnées depuis le DOM

**Si** le système déclenche une synchronisation des métadonnées,

**Alors** il lit les valeurs des champs `#swrl-id`, `#swrl-label` et `#swrl-comment` depuis le DOM, les écrit dans `_editingRule`, et remplace les espaces dans l'identifiant par `_`.

---

**Code source :** `swrl_editor.js` → `_syncFromDom()`

### REQ-SWR-012 — Sauvegarde automatique lors de la modification des métadonnées

**Si** l'utilisateur déclenche un événement `onchange` sur les champs `ID`, `Label` ou `Comment`
**et** que la règle en cours d'édition n'est pas nouvelle,

**Alors** le système synchronise les métadonnées depuis le DOM via `_syncFromDom()` puis déclenche automatiquement une sauvegarde via `save(false)`.

---

**Code source :** `swrl_editor.js` → `_syncAndSave()`

### REQ-SWR-013 — Sauvegarde d'une règle (création ou mise à jour)

**Si** le système doit enregistrer la règle en cours d'édition,

**Alors** :
- si la règle est nouvelle, il appelle `API.createSWRLRule()`
- sinon, il appelle `API.updateSWRLRule(originalId, rule)`
- après la sauvegarde, l'état de l'application est rafraîchi et la liste est mise à jour
- en cas d'erreur, un message est affiché via `UI.error()`

---

**Code source :** `swrl_editor.js` → `save()`

### REQ-SWR-014 — Renommage d'une règle existante

**Si** le système enregistre une mise à jour
**et** que l'identifiant courant de la règle (`rule.id`) diffère de l'identifiant original (`_editingId`),

**Alors** le système appelle `API.updateSWRLRule(originalId, rule)` avec l'ancien identifiant et affiche un message de succès indiquant le nouveau nom.

---

**Code source :** `swrl_editor.js` → `save()`

### REQ-SWR-015 — Suppression d'une règle

**Si** l'utilisateur demande la suppression d'une règle
**et** qu'il confirme la demande,

**Alors** :
- le système appelle `API.deleteSWRLRule(id)` (une erreur 404 est ignorée)
- la sélection et la règle en cours d'édition sont réinitialisées
- l'état de l'application est rafraîchi et la liste est mise à jour
- le panneau de détail est vidé

---

**Code source :** `swrl_editor.js` → `delete()`

### REQ-SWR-016 — Ajout d'un atome dans une section

**Si** l'utilisateur ajoute un atome d'un type donné dans une section (`body`, `head`, ou un sous-chemin d'atome imbriqué),

**Alors** :
- le système crée un nouvel atome via `_makeAtom()` et l'ajoute à la liste désignée par le chemin
- le formulaire est re-rendu
- si la règle n'est pas nouvelle, une sauvegarde automatique est déclenchée

---

**Code source :** `swrl_editor.js` → `addAtom()`

### REQ-SWR-017 — Suppression d'un atome

**Si** l'utilisateur supprime un atome désigné par son chemin,

**Alors** :
- le système résout le chemin dans `_editingRule` et supprime l'atome
- le formulaire est re-rendu
- si la règle n'est pas nouvelle, une sauvegarde automatique est déclenchée

---

**Code source :** `swrl_editor.js` → `removeAtom()`

### REQ-SWR-018 — Modification d'un champ d'atome

**Si** l'utilisateur modifie la valeur d'un champ (`var`, `subject`, `object`, `value`, `operator`, etc.) d'un atome désigné par son chemin,

**Alors** le système met à jour la valeur correspondante dans `_editingRule` et déclenche une sauvegarde automatique si la règle n'est pas nouvelle.

---

**Code source :** `swrl_editor.js` → `updateField()`

### REQ-SWR-025 — Sélection d'une classe dans le picker

**Si** l'utilisateur sélectionne une classe dans le picker de classe,

**Alors** :
- le système met à jour le champ `class_id` de l'atome désigné par `_currentPickerPath`
- tous les pickers de classe ouverts sont fermés
- le formulaire est re-rendu
- une sauvegarde automatique est déclenchée

---

**Code source :** `swrl_editor.js` → `onClassPickerSelect()`

### REQ-SWR-027 — Sélection d'une propriété dans le picker

**Si** l'utilisateur sélectionne une propriété dans le picker de propriété,

**Alors** :
- le système met à jour le champ `property_id` de l'atome désigné par `_currentPropPickerPath`
- tous les pickers de propriété ouverts sont fermés
- le formulaire est re-rendu
- une sauvegarde automatique est déclenchée

---

**Code source :** `swrl_editor.js` → `onPropPickerSelect()`

### REQ-SWR-029 — Filtrage des individus par classe dans le picker

**Si** l'utilisateur sélectionne une classe dans le panneau gauche du picker d'individus,

**Alors** :
- si `owl:Thing` est sélectionné, tous les individus sont affichés
- sinon, seuls les individus dont le champ `types` inclut la classe sélectionnée ou une de ses sous-classes sont affichés
- le libellé de chaque individu est résolu via `IndividualEditor._labelForId()`

---

**Code source :** `swrl_editor.js` → `swrlIndPickerSelectClass()`

### REQ-SWR-030 — Sélection d'un individu dans le picker

**Si** l'utilisateur clique sur un individu dans la liste du picker,

**Alors** l'individu est marqué comme sélectionné dans `_swrlIndPicker.selectedInd` et le bouton `OK` est activé.

**Si** l'utilisateur double-clique sur un individu,

**Alors** l'individu est sélectionné et la confirmation est déclenchée immédiatement.

---

**Code source :** `swrl_editor.js` → `swrlIndPickerSelectInd()`

### REQ-SWR-031 — Confirmation de la sélection d'un individu

**Si** l'utilisateur clique sur le bouton `OK` ou double-clique sur un individu dans le picker,

**Alors** :
- le système appelle `onIndPickerSelect()` avec l'identifiant de l'individu sélectionné
- le champ `value` de l'atome `equality_atom` concerné est mis à jour
- le formulaire est re-rendu et une sauvegarde automatique est déclenchée
- la modale est fermée

---

**Code source :** `swrl_editor.js` → `confirmIndPicker()`

### REQ-SWR-032 — Fermeture du picker d'individu

**Si** le système ferme le picker d'individu,

**Alors** :
- l'élément `#swrl-ind-picker-modal` est supprimé du DOM
- l'état interne `_swrlIndPicker` est réinitialisé (chemin d'atome, classe sélectionnée, individu sélectionné)

---

**Code source :** `swrl_editor.js` → `closeIndPicker()`

### REQ-SWR-034 — Glisser-déposer pour réordonner les atomes

**Si** l'utilisateur fait glisser un atome via la poignée `⠿` et le dépose sur un autre atome de la même liste (`listPath`),

**Alors** :
- les atomes sont réordonnés dans `_editingRule` via `splice()`
- le formulaire est re-rendu
- une sauvegarde automatique est déclenchée

**Si** la liste source et la liste cible sont différentes,

**Alors** le dépôt est refusé.

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

**Code source :** `swrl_editor.js` → `onDragStart()`, `onDragOver()`, `onDragLeave()`, `onDrop()`, `onDragEnd()`

### REQ-SWR-001 — Affichage de l'interface en deux panneaux

**Si** l'onglet SwrlRules est affiché,

**Alors** :
- le système présente une interface divisée en deux panneaux : un panneau gauche (`#swrl-list-panel`) contenant la liste des règles et un champ de recherche, et un panneau droit (`#swrl-detail`) destiné au formulaire d'édition
- si aucune règle n'est sélectionnée, le panneau droit affiche un message d'invite

---

**Code source :** `swrl_editor.js` → `renderSplit()`

### REQ-SWR-002 — Redimensionnement du panneau liste

**Si** l'utilisateur fait glisser la poignée `#swrl-split-h`,

**Alors** le système redimensionne horizontalement le panneau liste avec une largeur minimale de 120 px et une largeur maximale de 400 px.

---

**Code source :** `swrl_editor.js` → `_initSplitHandle()`

### REQ-SWR-003 — Affichage de la liste des règles SWRL

**Si** la liste des règles SWRL est affichée (filtrée ou complète),

**Alors** :
- chaque entrée présente le libellé (`label`) ou l'identifiant (`id`) de la règle, l'identifiant en sous-texte lorsqu'un libellé existe, une icône ⚙️ et un bouton de suppression
- la règle sélectionnée est mise en surbrillance via la classe CSS `selected`
- si aucune règle n'est présente ou ne correspond au filtre, un message vide est affiché

---

**Code source :** `swrl_editor.js` → `renderList()`

### REQ-SWR-004 — Indicateur visuel de références cassées

**Si** une règle référence une classe ou une propriété qui n'existe plus dans `APP.state`,

**Alors** :
- l'entrée de la règle dans la liste est colorée en rouge (`var(--red,#ef4444)`)
- les atomes concernés affichent un badge `⚠ deleted` dans le formulaire d'édition
- la détection porte sur les atomes `type_atom` (champ `class_id`), `property_atom` (champ `property_id`), ainsi que sur les atomes imbriqués dans les blocs `naf_block` et `conditional`

---

**Code source :** `swrl_editor.js` → `_ruleHasBrokenRefs()` et `renderList()`

### REQ-SWR-006 — Mise à jour dynamique du filtrage

**Si** l'utilisateur saisit ou modifie la requête dans le champ de recherche,

**Alors** :
- la liste affichée dans `#swrl-list` est mise à jour instantanément
- un bouton ✕ est ajouté dynamiquement au champ lorsque la requête est non vide, et supprimé lorsqu'elle est effacée

**Si** l'utilisateur clique sur le bouton ✕,

**Alors** la requête est réinitialisée et le filtrage est relancé.

---

**Code source :** `swrl_editor.js` → `_applySearch()`

### REQ-SWR-010 — Formulaire d'édition d'une règle

**Si** une règle est sélectionnée et que le formulaire d'édition est affiché,

**Alors** le système présente :
- un champ `ID` obligatoire avec remplacement automatique des espaces par `_`
- un champ `Label`
- une zone de texte `Comment`
- une section `if` (corps) et une section `then` (tête), chacune avec des boutons pour ajouter des atomes de type `type_atom`, `property_atom`, `equality_atom`
- la section `body` propose en plus le type `naf_block` ; la section `head` propose le type `conditional` à la place de `naf_block`

---

**Code source :** `swrl_editor.js` → `_renderForm()`

### REQ-SWR-019 — Rendu d'un atome de type `type_atom`

**Si** un atome de type `type_atom` est rendu dans le formulaire,

**Alors** :
- le système affiche un champ variable (`?var`) suivi du mot-clé `is a` et d'un sélecteur de classe
- si la classe référencée n'existe plus dans `APP.state.classes`, le sélecteur affiche `⚠ deleted` en rouge
- si la classe existe, elle est cliquable et navigue vers la vue `classes` via `APP.navigateTo()`

---

**Code source :** `swrl_editor.js` → `_renderAtom()` (branche `case 'type_atom'`)

### REQ-SWR-020 — Rendu d'un atome de type `property_atom`

**Si** un atome de type `property_atom` est rendu dans le formulaire,

**Alors** :
- le système affiche un champ sujet (`?subj`), un sélecteur de propriété (object property ou datatype property, distinguées par leur point coloré) et un champ objet (`?obj / ?_`)
- si la propriété n'existe plus, le sélecteur affiche `⚠ deleted`
- si elle existe, elle est cliquable et navigue vers `object-properties` ou `datatype-properties` selon son type

---

**Code source :** `swrl_editor.js` → `_renderAtom()` (branche `case 'property_atom'`)

### REQ-SWR-021 — Rendu d'un atome de type `equality_atom`

**Si** un atome de type `equality_atom` est rendu dans le formulaire,

**Alors** :
- le système affiche un champ variable (`?var`), un sélecteur d'opérateur parmi `=`, `!=`, `>`, `>=`, `<`, `<=`, et un champ valeur
- si la valeur correspond à un individu connu dans `APP.state.individuals`, elle est affichée sous forme de pastille navigable (clic → `APP.navigateTo('individuals', ...)`)
- sinon, un champ texte libre est affiché
- un bouton distinct permet d'ouvrir le picker d'individu

---

**Code source :** `swrl_editor.js` → `_renderAtom()` (branche `case 'equality_atom'`)

### REQ-SWR-022 — Rendu d'un bloc NAF

**Si** un bloc NAF est rendu dans le formulaire,

**Alors** le système affiche :
- un en-tête étiqueté `NAF`
- des boutons pour ajouter des atomes de type `type_atom`, `property_atom` ou `equality_atom` à l'intérieur du bloc
- le rendu récursif des atomes imbriqués via `_renderAtomList()`

---

**Code source :** `swrl_editor.js` → `_renderAtom()` (branche `case 'naf_block'`)

### REQ-SWR-023 — Rendu d'un atome conditionnel imbriqué

**Si** un atome de type `conditional` est rendu dans le formulaire,

**Alors** :
- le système affiche deux sous-sections `if` et `then` imbriquées, chacune avec des boutons pour ajouter des atomes (`type_atom`, `property_atom`, `equality_atom`, `naf_block` dans la condition ; `conditional` supplémentaire dans le conséquent)
- les formats anciens (objet unique → liste) sont normalisés au rendu pour les champs `condition` et `consequent`

---

**Code source :** `swrl_editor.js` → `_renderAtom()` (branche `case 'conditional'`)

### REQ-SWR-024 — Picker de classe pour les atomes `type_atom`

**Si** l'utilisateur ouvre le picker de classe,

**Alors** :
- tous les autres pickers de classe ouverts sont fermés
- un dropdown est affiché en `position:fixed` sous (ou au-dessus si l'espace est insuffisant) du bouton déclencheur

**Si** l'utilisateur clique en dehors du dropdown,

**Alors** le dropdown se ferme automatiquement.

---

**Code source :** `swrl_editor.js` → `toggleClassPicker()`

### REQ-SWR-026 — Picker de propriété pour les atomes `property_atom`

**Si** l'utilisateur ouvre le picker de propriété,

**Alors** :
- le système affiche un dropdown en `position:fixed` dont le contenu est construit dynamiquement à partir de `APP.state.object_properties` et `APP.state.datatype_properties`, triés alphabétiquement, avec un séparateur visuel entre les deux groupes
- les object properties sont distinguées par un point de couleur `op-prop-dot` et les datatype properties par `dp-prop-dot`

---

**Code source :** `swrl_editor.js` → `togglePropPicker()`

### REQ-SWR-028 — Picker d'individu bi-panneau (modal)

**Si** l'utilisateur ouvre le picker d'individu,

**Alors** le système affiche une fenêtre modale (`#swrl-ind-picker-modal`) composée de :
- un panneau gauche avec un arbre de classes (construit via `ClassEditor.buildTree()`) incluant `owl:Thing` en première entrée avec le nombre total d'individus ; le nombre d'individus de chaque classe tient compte de la hiérarchie (classes descendantes incluses)
- un panneau droit avec la liste des individus

---

**Code source :** `swrl_editor.js` → `openIndPicker()`

### REQ-SWR-033 — Positionnement dynamique des dropdowns

**Si** le système doit positionner un dropdown en `position:fixed`,

**Alors** :
- il calcule l'espace disponible sous et au-dessus du bouton déclencheur
- si l'espace sous le bouton est insuffisant, le dropdown s'ouvre vers le haut
- la largeur minimale est celle du bouton déclencheur ou la valeur `width` passée en paramètre (défaut 200 px)
- la hauteur maximale est bornée à 260 px ou l'espace disponible

---

**Code source :** `swrl_editor.js` → `_positionDropdown()`

### REQ-SWR-035 — Navigation vers une entité référencée depuis un atome

**Si** une entité référencée dans un atome (classe, propriété ou individu) existe dans l'état de l'application
**et** que l'utilisateur clique sur son identifiant affiché,

**Alors** le système appelle `APP.navigateTo()` avec l'onglet cible (`classes`, `object-properties`, `datatype-properties`, `individuals`) et l'identifiant de l'entité.

**Si** l'utilisateur survole l'identifiant,

**Alors** un soulignement et une couleur d'accentuation sont appliqués.

**Code source :** `swrl_editor.js` → `_renderAtom()` (branches `type_atom`, `property_atom`, `equality_atom`)
