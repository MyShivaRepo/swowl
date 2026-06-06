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
**Code source :** `swrl_editor.js` → `_filterRules()`

Le système filtre la liste des règles selon une requête textuelle saisie dans le champ de recherche (`#swrl-search`). La correspondance est insensible à la casse et porte sur les champs `id`, `label`, `comment` de la règle, ainsi que sur les champs `class_id`, `property_id`, `var`, `subject`, `object` et `value` de chaque atome du corps (`body`) et de la tête (`head`).

---

### REQ-SWR-007 — Sélection d'une règle existante
**Code source :** `swrl_editor.js` → `selectRule()`

Lorsque l'utilisateur clique sur une règle dans la liste, le système récupère la règle correspondante dans `APP.state.swrl_rules`, en effectue une copie profonde (`JSON.parse(JSON.stringify(rule))`), l'affecte à `_editingRule`, et déclenche le rendu du formulaire d'édition dans le panneau droit. La classe `selected` est appliquée à l'élément de liste correspondant.

---

### REQ-SWR-008 — Création d'une nouvelle règle
**Code source :** `swrl_editor.js` → `newRule()`

Lorsque l'utilisateur clique sur le bouton ➕, le système génère un identifiant unique, crée une règle vide (`body: [], head: [], enabled: true`), l'envoie via `API.createSWRLRule()`, rafraîchit l'état de l'application, met à jour la liste et affiche le formulaire d'édition de la nouvelle règle sélectionnée.

---

### REQ-SWR-009 — Génération automatique d'un identifiant unique
**Code source :** `swrl_editor.js` → `_generateRuleName()`

Le système génère automatiquement un identifiant pour une nouvelle règle en partant de `NewRule`, puis en essayant `NewRule1`, `NewRule2`, etc., jusqu'à trouver un identifiant absent de la liste existante (`APP.state.swrl_rules`).

---

### REQ-SWR-011 — Synchronisation des métadonnées depuis le DOM
**Code source :** `swrl_editor.js` → `_syncFromDom()`

Le système lit les valeurs des champs `#swrl-id`, `#swrl-label` et `#swrl-comment` depuis le DOM et les écrit dans `_editingRule`. Les espaces dans l'identifiant sont remplacés par `_`.

---

### REQ-SWR-012 — Sauvegarde automatique lors de la modification des métadonnées
**Code source :** `swrl_editor.js` → `_syncAndSave()`

Lors de chaque événement `onchange` sur les champs `ID`, `Label` ou `Comment`, le système synchronise les métadonnées depuis le DOM via `_syncFromDom()` puis déclenche automatiquement une sauvegarde via `save(false)` si la règle n'est pas nouvelle.

---

### REQ-SWR-013 — Sauvegarde d'une règle (création ou mise à jour)
**Code source :** `swrl_editor.js` → `save()`

Le système enregistre la règle en cours d'édition. Si la règle est nouvelle, il appelle `API.createSWRLRule()` ; sinon, il appelle `API.updateSWRLRule(originalId, rule)`. Après la sauvegarde, l'état de l'application est rafraîchi et la liste est mise à jour. En cas d'erreur, un message est affiché via `UI.error()`.

---

### REQ-SWR-014 — Renommage d'une règle existante
**Code source :** `swrl_editor.js` → `save()`

Lors d'une mise à jour, si l'identifiant courant de la règle (`rule.id`) diffère de l'identifiant original (`_editingId`), le système appelle `API.updateSWRLRule(originalId, rule)` avec l'ancien identifiant et affiche un message de succès indiquant le nouveau nom.

---

### REQ-SWR-015 — Suppression d'une règle
**Code source :** `swrl_editor.js` → `delete()`

Le système affiche une demande de confirmation avant de supprimer une règle. En cas de confirmation, il appelle `API.deleteSWRLRule(id)`. Si l'erreur retournée est une 404, elle est ignorée. Après suppression, la sélection et la règle en cours d'édition sont réinitialisées, l'état de l'application est rafraîchi, la liste est mise à jour et le panneau de détail est vidé.

---

### REQ-SWR-016 — Ajout d'un atome dans une section
**Code source :** `swrl_editor.js` → `addAtom()`

Le système ajoute un nouvel atome du type spécifié (créé par `_makeAtom()`) à la liste désignée par un chemin (`body`, `head`, ou un sous-chemin d'atome imbriqué). Le formulaire est re-rendu après l'ajout, et la règle est sauvegardée automatiquement si elle n'est pas nouvelle.

---

### REQ-SWR-017 — Suppression d'un atome
**Code source :** `swrl_editor.js` → `removeAtom()`

Le système supprime l'atome désigné par son chemin (résolu par navigation dans `_editingRule`), re-rend le formulaire et déclenche une sauvegarde automatique si la règle n'est pas nouvelle.

---

### REQ-SWR-018 — Modification d'un champ d'atome
**Code source :** `swrl_editor.js` → `updateField()`

Le système met à jour la valeur d'un champ (`var`, `subject`, `object`, `value`, `operator`, etc.) d'un atome désigné par son chemin, puis déclenche une sauvegarde automatique si la règle n'est pas nouvelle.

---

### REQ-SWR-025 — Sélection d'une classe dans le picker
**Code source :** `swrl_editor.js` → `onClassPickerSelect()`

Lorsque l'utilisateur sélectionne une classe dans le picker, le système met à jour le champ `class_id` de l'atome désigné par `_currentPickerPath`, ferme tous les pickers de classe, re-rend le formulaire et déclenche une sauvegarde automatique.

---

### REQ-SWR-027 — Sélection d'une propriété dans le picker
**Code source :** `swrl_editor.js` → `onPropPickerSelect()`

Lorsque l'utilisateur sélectionne une propriété, le système met à jour le champ `property_id` de l'atome désigné par `_currentPropPickerPath`, ferme tous les pickers de propriété, re-rend le formulaire et déclenche une sauvegarde automatique.

---

### REQ-SWR-029 — Filtrage des individus par classe dans le picker
**Code source :** `swrl_editor.js` → `swrlIndPickerSelectClass()`

Lors de la sélection d'une classe dans le panneau gauche du picker, le système filtre les individus affichés dans le panneau droit. Si `owl:Thing` est sélectionné, tous les individus sont affichés. Sinon, seuls les individus dont le champ `types` inclut la classe sélectionnée ou une de ses sous-classes sont affichés. Le libellé de chaque individu est résolu via `IndividualEditor._labelForId()`.

---

### REQ-SWR-030 — Sélection d'un individu dans le picker
**Code source :** `swrl_editor.js` → `swrlIndPickerSelectInd()`

Lors du clic sur un individu dans la liste du picker, le système le marque comme sélectionné dans `_swrlIndPicker.selectedInd` et active le bouton `OK`. Un double-clic sur un individu le sélectionne et confirme immédiatement la sélection.

---

### REQ-SWR-031 — Confirmation de la sélection d'un individu
**Code source :** `swrl_editor.js` → `confirmIndPicker()`

Lors de la confirmation (bouton `OK` ou double-clic), le système appelle `onIndPickerSelect()` avec l'identifiant de l'individu sélectionné, qui met à jour le champ `value` de l'atome `equality_atom` concerné, re-rend le formulaire, déclenche une sauvegarde automatique, puis ferme la modale.

---

### REQ-SWR-032 — Fermeture du picker d'individu
**Code source :** `swrl_editor.js` → `closeIndPicker()`

Le système supprime l'élément `#swrl-ind-picker-modal` du DOM et réinitialise l'état interne `_swrlIndPicker` (chemin d'atome, classe sélectionnée, individu sélectionné).

---

### REQ-SWR-034 — Glisser-déposer pour réordonner les atomes
**Code source :** `swrl_editor.js` → `onDragStart()`, `onDragOver()`, `onDragLeave()`, `onDrop()`, `onDragEnd()`

Le système permet de réordonner les atomes par glisser-déposer au sein d'une même liste (même `listPath`). Seul l'élément `⠿` (handle) est `draggable="true"` pour éviter les conflits de niveaux. Le drop n'est accepté que si la liste source et la liste cible sont identiques. Après le dépôt, les atomes sont réordonnés dans `_editingRule` via `splice()`, le formulaire est re-rendu et une sauvegarde automatique est déclenchée.

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

### REQ-SWR-001 — Affichage de l'interface en deux panneaux
**Code source :** `swrl_editor.js` → `renderSplit()`

Le système affiche l'onglet SwrlRules sous forme d'une interface divisée en deux panneaux : un panneau gauche (`#swrl-list-panel`) contenant la liste des règles et un champ de recherche, et un panneau droit (`#swrl-detail`) destiné à l'affichage du formulaire d'édition. Le panneau de détail affiche un message d'invite lorsqu'aucune règle n'est sélectionnée.

---

### REQ-SWR-002 — Redimensionnement du panneau liste
**Code source :** `swrl_editor.js` → `_initSplitHandle()`

Le système permet à l'utilisateur de redimensionner horizontalement le panneau liste en faisant glisser la poignée (`#swrl-split-h`). La largeur minimale est de 120 px et la largeur maximale est de 400 px.

---

### REQ-SWR-003 — Affichage de la liste des règles SWRL
**Code source :** `swrl_editor.js` → `renderList()`

Le système affiche la liste filtrée des règles SWRL. Chaque entrée présente le libellé (`label`) ou l'identifiant (`id`) de la règle, l'identifiant en sous-texte lorsqu'un libellé existe, une icône ⚙️, et un bouton de suppression. La règle sélectionnée est mise en surbrillance via la classe CSS `selected`. Si aucune règle n'est présente ou ne correspond au filtre, un message vide est affiché.

---

### REQ-SWR-004 — Indicateur visuel de références cassées
**Code source :** `swrl_editor.js` → `_ruleHasBrokenRefs()` et `renderList()`

Le système détecte si une règle référence une classe ou une propriété qui n'existe plus dans l'état de l'application (`APP.state`). Si c'est le cas, l'entrée de la règle dans la liste est colorée en rouge (`var(--red,#ef4444)`), et les atomes concernés affichent un badge `⚠ deleted` dans le formulaire d'édition. La détection porte sur les atomes `type_atom` (champ `class_id`), `property_atom` (champ `property_id`), ainsi que sur les atomes imbriqués dans les blocs `naf_block` et `conditional`.

---

### REQ-SWR-006 — Mise à jour dynamique du filtrage
**Code source :** `swrl_editor.js` → `_applySearch()`

Le système met à jour instantanément la liste affichée dans `#swrl-list` à chaque saisie dans le champ de recherche. Un bouton ✕ est ajouté dynamiquement au champ de recherche lorsque la requête est non vide, et supprimé lorsqu'elle est effacée. Un clic sur ce bouton réinitialise la requête et relance le filtrage.

---

### REQ-SWR-010 — Formulaire d'édition d'une règle
**Code source :** `swrl_editor.js` → `_renderForm()`

Le système affiche un formulaire composé de : un champ `ID` (obligatoire, avec remplacement automatique des espaces par `_`), un champ `Label`, une zone de texte `Comment`, une section `if` (corps de la règle) et une section `then` (tête de la règle). Chaque section dispose de boutons pour ajouter des atomes de type `type_atom`, `property_atom`, `equality_atom`. La section `body` propose en plus le type `naf_block` ; la section `head` propose le type `conditional` à la place de `naf_block`.

---

### REQ-SWR-019 — Rendu d'un atome de type `type_atom`
**Code source :** `swrl_editor.js` → `_renderAtom()` (branche `case 'type_atom'`)

Le système affiche un atome `type_atom` sous la forme d'un champ variable (`?var`) suivi du mot-clé `is a` et d'un sélecteur de classe. Si la classe référencée n'existe plus dans `APP.state.classes`, le sélecteur affiche `⚠ deleted` en rouge. Si la classe existe, elle est cliquable et navigue vers la vue `classes` via `APP.navigateTo()`.

---

### REQ-SWR-020 — Rendu d'un atome de type `property_atom`
**Code source :** `swrl_editor.js` → `_renderAtom()` (branche `case 'property_atom'`)

Le système affiche un atome `property_atom` sous la forme d'un champ sujet (`?subj`), d'un sélecteur de propriété (object property ou datatype property, distinguées par leur point coloré) et d'un champ objet (`?obj / ?_`). Si la propriété n'existe plus, le sélecteur affiche `⚠ deleted`. Si elle existe, elle est cliquable et navigue vers `object-properties` ou `datatype-properties` selon son type.

---

### REQ-SWR-021 — Rendu d'un atome de type `equality_atom`
**Code source :** `swrl_editor.js` → `_renderAtom()` (branche `case 'equality_atom'`)

Le système affiche un atome `equality_atom` avec un champ variable (`?var`), un sélecteur d'opérateur parmi `=`, `!=`, `>`, `>=`, `<`, `<=`, et un champ valeur. Si la valeur correspond à un individu connu dans `APP.state.individuals`, elle est affichée sous forme de pastille navigable (clic → `APP.navigateTo('individuals', ...)`). Sinon, un champ texte libre est affiché. Un bouton distinct permet d'ouvrir le picker d'individu.

---

### REQ-SWR-022 — Rendu d'un bloc NAF
**Code source :** `swrl_editor.js` → `_renderAtom()` (branche `case 'naf_block'`)

Le système affiche un bloc NAF (Negation As Failure) avec un en-tête étiqueté `NAF`, des boutons pour ajouter des atomes de type `type_atom`, `property_atom` ou `equality_atom` à l'intérieur du bloc, et le rendu récursif des atomes imbriqués via `_renderAtomList()`.

---

### REQ-SWR-023 — Rendu d'un atome conditionnel imbriqué
**Code source :** `swrl_editor.js` → `_renderAtom()` (branche `case 'conditional'`)

Le système affiche un atome `conditional` sous la forme de deux sous-sections `if` et `then` imbriquées, chacune disposant de boutons pour ajouter des atomes (`type_atom`, `property_atom`, `equality_atom`, `naf_block` dans la condition ; `conditional` supplémentaire dans le conséquent). Le code normalise au rendu les formats anciens (objet unique → liste) pour les champs `condition` et `consequent`.

---

### REQ-SWR-024 — Picker de classe pour les atomes `type_atom`
**Code source :** `swrl_editor.js` → `toggleClassPicker()`

Le système ouvre ou ferme un dropdown de sélection de classe positionné en `position:fixed` sous (ou au-dessus) du bouton déclencheur. Tous les autres pickers de classe ouverts sont fermés lors de l'ouverture. Le dropdown se ferme automatiquement lors d'un clic en dehors.

---

### REQ-SWR-026 — Picker de propriété pour les atomes `property_atom`
**Code source :** `swrl_editor.js` → `togglePropPicker()`

Le système ouvre ou ferme un dropdown de sélection de propriété positionné en `position:fixed`. Le contenu du dropdown est construit dynamiquement à partir de `APP.state.object_properties` et `APP.state.datatype_properties`, triés alphabétiquement, avec un séparateur visuel entre les deux groupes. Les object properties sont distinguées par un point de couleur `op-prop-dot` et les datatype properties par `dp-prop-dot`.

---

### REQ-SWR-028 — Picker d'individu bi-panneau (modal)
**Code source :** `swrl_editor.js` → `openIndPicker()`

Le système ouvre une fenêtre modale (`#swrl-ind-picker-modal`) composée de deux panneaux : un arbre de classes à gauche (incluant `owl:Thing` en première entrée avec le nombre total d'individus) et une liste d'individus à droite. L'arbre de classes est construit via `ClassEditor.buildTree()` et le nombre d'individus de chaque classe tient compte de la hiérarchie (classes descendantes incluses).

---

### REQ-SWR-033 — Positionnement dynamique des dropdowns
**Code source :** `swrl_editor.js` → `_positionDropdown()`

Le système calcule la position optimale d'un dropdown en `position:fixed` en tenant compte de l'espace disponible sous et au-dessus du bouton déclencheur. Si l'espace sous le bouton est insuffisant, le dropdown s'ouvre vers le haut. La largeur minimale est celle du bouton déclencheur ou la valeur `width` passée en paramètre (défaut 200 px) ; la hauteur maximale est bornée à 260 px ou l'espace disponible.

---

### REQ-SWR-035 — Navigation vers une entité référencée depuis un atome
**Code source :** `swrl_editor.js` → `_renderAtom()` (branches `type_atom`, `property_atom`, `equality_atom`)

Le système rend cliquables les identifiants de classe, de propriété et d'individu affichés dans les atomes lorsque l'entité référencée existe. Un clic appelle `APP.navigateTo()` avec l'onglet cible (`classes`, `object-properties`, `datatype-properties`, `individuals`) et l'identifiant de l'entité. Un survol applique un soulignement et une couleur d'accentuation.
