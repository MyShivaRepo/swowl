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
- [REQ-SWR-036 — Import de règles depuis un fichier `.swd`](#req-swr-036--import-de-règles-depuis-un-fichier-swd)
- [REQ-SWR-037 — Résolution d'une collision d'identifiant à l'import](#req-swr-037--résolution-dune-collision-didentifiant-à-limport)

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
- [REQ-SWR-038 — Bouton d'import dans le panneau liste des règles](#req-swr-038--bouton-dimport-dans-le-panneau-liste-des-règles)
- [REQ-SWR-039 — Pickers de classe et de propriété homogènes](#req-swr-039--pickers-de-classe-et-de-propriété-homogènes)
- [REQ-SWR-040 — Préfixage de l'identifiant des règles dans la liste](#req-swr-040--préfixage-de-lidentifiant-des-règles-dans-la-liste)
- [REQ-SWR-041 — Préfixage des éléments référencés dans les atomes](#req-swr-041--préfixage-des-éléments-référencés-dans-les-atomes)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles OWL, contraintes de données, comportements algorithmiques, validations, persistance.


### REQ-SWR-005 — Recherche/filtrage des règles

| **Si** | l'ontologiste souhaite retrouver une `règle SWRL` en saisissant un terme dans le champ de recherche, |
|---|---|
| **Alors** | seules les règles dont l'identifiant, le libellé, le commentaire ou les termes des atomes (`classes`, `propriétés`, variables, sujets, objets, valeurs) correspondent au terme saisi — sans distinction de casse — sont présentées. |

---

**Code source :** `swrl_editor.js` → `_filterRules()` — Parcourt `APP.state.swrl_rules` et teste, insensiblement à la casse, les champs `id`, `label`, `comment` de chaque règle ainsi que les champs `class_id`, `property_id`, `var`, `subject`, `object` et `value` de chaque atome des listes `body` et `head`.

### REQ-SWR-007 — Sélection d'une règle existante

| **Si** | l'ontologiste sélectionne une règle dans la liste, |
|---|---|
| **Alors** | le contenu de la règle est chargé dans le formulaire d'édition, prêt à être modifié, sans affecter les données persistées tant qu'aucune sauvegarde n'est déclenchée. |

---

**Code source :** `swrl_editor.js` → `selectRule()` — Récupère la règle dans `APP.state.swrl_rules`, en effectue une copie profonde via `JSON.parse(JSON.stringify(rule))`, l'affecte à `_editingRule`, rend le formulaire dans le panneau droit et applique la classe CSS `selected` à l'entrée de liste correspondante.

### REQ-SWR-008 — Création d'une nouvelle règle

| **Si** | l'ontologiste souhaite créer une nouvelle `règle SWRL`, |
|---|---|
| **Alors** | une règle vide est immédiatement créée avec un identifiant unique, persistée dans l'`ontologie`, et son formulaire d'édition est ouvert pour permettre la saisie sans délai. |

---

**Code source :** `swrl_editor.js` → `newRule()` — Génère un identifiant via `_generateRuleName()`, crée un objet `{body: [], head: [], enabled: true}`, appelle `API.createSWRLRule()`, rafraîchit `APP.state`, met à jour la liste et sélectionne la nouvelle règle via `selectRule()`.

### REQ-SWR-009 — Génération automatique d'un identifiant unique

| **Si** | le système doit attribuer un identifiant à une nouvelle `règle SWRL`, |
|---|---|
| **Alors** | l'identifiant généré est garanti unique parmi toutes les règles existantes de l'`ontologie`. |

---

**Code source :** `swrl_editor.js` → `_generateRuleName()` — Part de la valeur `NewRule`, puis tente successivement `NewRule1`, `NewRule2`, etc., jusqu'à trouver une valeur absente de `APP.state.swrl_rules`.

### REQ-SWR-011 — Synchronisation des métadonnées depuis le DOM

| **Si** | le système collecte les métadonnées saisies par l'ontologiste avant une sauvegarde, |
|---|---|
| **Alors** | l'identifiant, le libellé et le commentaire de la règle sont lus depuis les champs de saisie et mis à jour dans la règle en cours d'édition ; les espaces dans l'identifiant sont automatiquement remplacés par des tirets bas. |

---

**Code source :** `swrl_editor.js` → `_syncFromDom()` — Lit les valeurs des champs `#swrl-id`, `#swrl-label` et `#swrl-comment` depuis le DOM, les écrit dans `_editingRule`, et remplace les espaces dans l'identifiant par `_`.

### REQ-SWR-012 — Sauvegarde automatique lors de la modification des métadonnées

| **Si** | l'ontologiste modifie l'identifiant, le libellé ou le commentaire d'une règle déjà existante et quitte le champ, |
|---|---|
| **Alors** | les modifications sont automatiquement persistées sans action supplémentaire de sa part. |

---

**Code source :** `swrl_editor.js` → `_syncAndSave()` — Déclenché par l'événement `onchange` sur les champs ID, Label ou Comment ; appelle `_syncFromDom()` puis `save(false)` uniquement si la règle n'est pas nouvelle.

### REQ-SWR-013 — Sauvegarde d'une règle (création ou mise à jour)

| **Si** | le système doit persister la règle en cours d'édition, |
|---|---|
| **Alors** | la règle est créée ou mise à jour dans l'`ontologie` selon qu'elle est nouvelle ou existante ; en cas d'échec, l'ontologiste est informé par un message d'erreur explicite. |

---

**Code source :** `swrl_editor.js` → `save()` — Appelle `API.createSWRLRule()` pour une nouvelle règle ou `API.updateSWRLRule(originalId, rule)` pour une règle existante ; rafraîchit `APP.state` et la liste après succès ; affiche une erreur via `UI.error()` en cas d'échec.

### REQ-SWR-014 — Renommage d'une règle existante

| **Si** | l'ontologiste modifie l'identifiant d'une règle existante et sauvegarde, |
|---|---|
| **Alors** | la règle est renommée dans l'`ontologie` et l'ontologiste reçoit une confirmation indiquant le nouveau nom. |

---

**Code source :** `swrl_editor.js` → `save()` — Détecte que `rule.id` diffère de `_editingId` et appelle `API.updateSWRLRule(originalId, rule)` avec l'ancien identifiant, puis affiche un message de succès mentionnant le nouveau nom.

### REQ-SWR-015 — Suppression d'une règle

| **Si** | l'ontologiste demande la suppression d'une règle et confirme son intention, |
|---|---|
| **Alors** | la règle est définitivement retirée de l'`ontologie`, la sélection est réinitialisée et le panneau d'édition est vidé. |

---

**Code source :** `swrl_editor.js` → `delete()` — Appelle `API.deleteSWRLRule(id)` (une erreur 404 est ignorée), réinitialise `_editingRule` et `_editingId`, rafraîchit `APP.state`, met à jour la liste et vide le panneau de détail.

### REQ-SWR-016 — Ajout d'un atome dans une section

| **Si** | l'ontologiste souhaite ajouter un atome dans la prémisse ou la conclusion d'une règle, |
|---|---|
| **Alors** | un atome du type choisi est inséré dans la section concernée, le formulaire est immédiatement mis à jour et la règle est automatiquement sauvegardée si elle existe déjà. |

---

**Code source :** `swrl_editor.js` → `addAtom()` — Crée un atome via `_makeAtom()`, l'insère dans la liste désignée par le chemin (sous-chemin de `_editingRule` correspondant à `body`, `head` ou un atome imbriqué), re-rend le formulaire et déclenche `save(false)` si la règle n'est pas nouvelle.

### REQ-SWR-017 — Suppression d'un atome

| **Si** | l'ontologiste supprime un atome d'une règle, |
|---|---|
| **Alors** | l'atome est retiré de la section concernée, le formulaire est mis à jour et la règle est automatiquement sauvegardée si elle existe déjà. |

---

**Code source :** `swrl_editor.js` → `removeAtom()` — Résout le chemin de l'atome dans `_editingRule` via la notation pointée, supprime l'élément par `splice()`, re-rend le formulaire et déclenche `save(false)` si la règle n'est pas nouvelle.

### REQ-SWR-018 — Modification d'un champ d'atome

| **Si** | l'ontologiste modifie la valeur d'un champ d'un atome (variable, sujet, objet, valeur littérale, opérateur, etc.), |
|---|---|
| **Alors** | la modification est prise en compte dans la règle et automatiquement sauvegardée si la règle existe déjà. |

---

**Code source :** `swrl_editor.js` → `updateField()` — Résout le chemin du champ dans `_editingRule`, met à jour la valeur, puis appelle `save(false)` si la règle n'est pas nouvelle.

### REQ-SWR-025 — Sélection d'une classe dans le picker

| **Si** | l'ontologiste choisit une `classe` dans le sélecteur de `classe` d'un atome, |
|---|---|
| **Alors** | la `classe` sélectionnée est associée à l'atome concerné, le sélecteur se ferme, le formulaire est mis à jour et la règle est automatiquement sauvegardée. |

---

**Code source :** `swrl_editor.js` → `onClassPickerSelect()` — Met à jour le champ `class_id` de l'atome désigné par `_currentPickerPath`, ferme tous les pickers de classe ouverts via `querySelectorAll`, re-rend le formulaire et appelle `save(false)`.

### REQ-SWR-027 — Sélection d'une propriété dans le picker

| **Si** | l'ontologiste choisit une `propriété` dans le sélecteur de `propriété` d'un atome, |
|---|---|
| **Alors** | la `propriété` sélectionnée est associée à l'atome concerné, le sélecteur se ferme, le formulaire est mis à jour et la règle est automatiquement sauvegardée. |

---

**Code source :** `swrl_editor.js` → `onPropPickerSelect()` — Met à jour le champ `property_id` de l'atome désigné par `_currentPropPickerPath`, ferme tous les pickers de propriété ouverts, re-rend le formulaire et appelle `save(false)`.

### REQ-SWR-029 — Filtrage des individus par classe dans le picker

| **Si** | l'ontologiste sélectionne une `classe` dans le panneau de filtrage du sélecteur d'`individus`, |
|---|---|
| **Alors** | seuls les `individus` appartenant à cette `classe` ou à l'une de ses sous-`classes` sont présentés ; si la `classe` racine est choisie, tous les `individus` sont affichés. |

---

**Code source :** `swrl_editor.js` → `swrlIndPickerSelectClass()` — Si `owl:Thing` est sélectionné, affiche tous les individus de `APP.state.individuals` ; sinon filtre par `types` incluant la classe ou ses descendants (calculés via la hiérarchie `subClassOf`) ; résout le libellé de chaque individu via `IndividualEditor._labelForId()`.

### REQ-SWR-030 — Sélection d'un individu dans le picker

| **Si** | l'ontologiste clique sur un `individu` dans la liste du sélecteur, |
|---|---|
| **Alors** | l'`individu` est mis en surbrillance et le bouton de confirmation est activé. |

| **Si** | l'ontologiste double-clique sur un `individu`, |
|---|---|
| **Alors** | l'`individu` est sélectionné et la confirmation est déclenchée immédiatement. |

---

**Code source :** `swrl_editor.js` → `swrlIndPickerSelectInd()` — Au simple clic, affecte l'identifiant à `_swrlIndPicker.selectedInd` et active le bouton OK ; au double-clic, appelle en plus `confirmIndPicker()` directement.

### REQ-SWR-031 — Confirmation de la sélection d'un individu

| **Si** | l'ontologiste confirme le choix d'un `individu` dans le sélecteur, |
|---|---|
| **Alors** | l'`individu` sélectionné est associé à l'atome d'égalité concerné, le sélecteur se ferme, le formulaire est mis à jour et la règle est automatiquement sauvegardée. |

---

**Code source :** `swrl_editor.js` → `confirmIndPicker()` — Appelle `onIndPickerSelect()` avec l'identifiant de `_swrlIndPicker.selectedInd`, met à jour le champ `value` de l'atome `equality_atom` désigné par `_swrlIndPicker.atomPath`, re-rend le formulaire, appelle `save(false)` puis `closeIndPicker()`.

### REQ-SWR-032 — Fermeture du picker d'individu

| **Si** | le sélecteur d'`individu` se ferme (confirmation ou annulation), |
|---|---|
| **Alors** | la fenêtre modale disparaît et l'état interne du sélecteur est entièrement réinitialisé. |

---

**Code source :** `swrl_editor.js` → `closeIndPicker()` — Supprime l'élément `#swrl-ind-picker-modal` du DOM et réinitialise `_swrlIndPicker` (champs `atomPath`, `selectedClass`, `selectedInd` remis à `null`).

### REQ-SWR-034 — Glisser-déposer pour réordonner les atomes

| **Si** | l'ontologiste réordonne les atomes d'une section par glisser-déposer, |
|---|---|
| **Alors** | l'ordre des atomes est mis à jour dans la règle, le formulaire reflète le nouvel ordre et la règle est automatiquement sauvegardée. |

| **Si** | l'ontologiste tente de déplacer un atome vers une section différente de celle d'origine, |
|---|---|
| **Alors** | le déplacement est refusé et aucune modification n'est apportée. |

---

**Code source :** `swrl_editor.js` → `onDragStart()`, `onDragOver()`, `onDragLeave()`, `onDrop()`, `onDragEnd()` — `onDragStart()` mémorise l'index source et le `listPath` ; `onDragOver()` autorise le drop uniquement si le `listPath` cible est identique ; `onDrop()` réordonne les atomes via `splice()` dans `_editingRule`, re-rend le formulaire et appelle `save(false)`.

### REQ-SWR-036 — Import de règles depuis un fichier `.swd`

| **Si** | l'ontologiste importe des `règles SWRL` depuis un fichier au format **SWORD** (format de règle lisible du projet, exporté avec l'extension `.swd`), |
|---|---|
| **Alors** | les règles contenues dans le fichier sont ajoutées à l'`ontologie` telles quelles — même lorsqu'un atome référence une `classe` vide ou indéfinie — et l'ontologiste reçoit un récapitulatif indiquant le nombre de règles ajoutées, remplacées ou conservées. |

L'import est l'exact inverse de l'export `.swd` : un aller-retour préserve la négation NAF, les sous-règles conditionnelles, les atomes d'égalité et les atomes à `classe` vide. Le sélecteur de fichier n'impose aucune restriction d'extension : n'importe quel fichier peut être choisi (y compris les anciens fichiers `.sword`), son contenu étant validé par l'analyseur SWORD du backend quelle que soit son extension.

---

**Code source :** `swrl_editor.js` → `importRules()` — Ouvre un sélecteur de fichier sans filtre d'extension (l'attribut `accept` a été retiré, afin que les fichiers `.swd` ne soient plus grisés et restent sélectionnables sous macOS/WebKit), lit le texte du fichier, le parse via `API.parseSwordRules(text)`, puis itère sur les règles retournées ; chaque règle est persistée via `API.createSWRLRule()` (nouvel identifiant) ou `API.updateSWRLRule()` (collision résolue en `replace`) ; aucune validation n'est effectuée contre `APP.state.classes`, si bien que les atomes référençant des `classes` absentes sont conservés ; rafraîchit `APP.state`, re-rend la section et rapporte les décomptes via `UI.success()`.

### REQ-SWR-037 — Résolution d'une collision d'identifiant à l'import

| **Si** | une règle importée porte un identifiant déjà présent dans l'`ontologie`, |
|---|---|
| **Alors** | une boîte de dialogue invite l'ontologiste à choisir entre **Importer la nouvelle** (remplacer la règle existante), **Conserver l'existante** (ignorer la règle importée) ou **Annuler** (interrompre tout l'import), et l'action choisie est appliquée. |

---

**Code source :** `swrl_editor.js` → `importRules()` et `_askRuleCollision()` — Lorsque l'`id` de la règle est présent dans l'ensemble des identifiants existants, `_askRuleCollision()` affiche une modale renvoyant `replace`, `keep` ou `cancel` ; `replace` appelle `API.updateSWRLRule(rule.id, rule)`, `keep` ignore la règle, `cancel` interrompt la boucle d'import.

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

### REQ-SWR-001 — Affichage de l'interface en deux panneaux

| **Si** | l'onglet SwrlRules est affiché, |
|---|---|
| **Alors** | l'interface présente un panneau gauche listant les règles avec un champ de recherche, et un panneau droit dédié à l'édition ; si aucune règle n'est sélectionnée, le panneau droit affiche un message invitant à sélectionner ou créer une règle. |

---

**Code source :** `swrl_editor.js` → `renderSplit()` — Génère le squelette HTML avec `#swrl-list-panel` à gauche et `#swrl-detail` à droite ; affiche le message d'invite si `_editingRule` est null.

### REQ-SWR-002 — Redimensionnement du panneau liste

| **Si** | l'ontologiste redimensionne le panneau liste en faisant glisser la séparation entre les deux panneaux, |
|---|---|
| **Alors** | la largeur du panneau liste s'ajuste librement entre une largeur minimale et une largeur maximale, sans débordement sur le panneau d'édition. |

---

**Code source :** `swrl_editor.js` → `_initSplitHandle()` — Écoute les événements `mousedown` sur la poignée `#swrl-split-h` et ajuste la propriété CSS `width` du panneau liste lors du `mousemove`, avec un minimum de 120 px et un maximum de 400 px.

### REQ-SWR-003 — Affichage de la liste des règles SWRL

| **Si** | la liste des `règles SWRL` est affichée, filtrée ou complète, |
|---|---|
| **Alors** | chaque règle est présentée avec son libellé ou son identifiant, son identifiant en sous-texte lorsqu'un libellé distinct existe, et un bouton de suppression ; la règle en cours d'édition est visuellement mise en surbrillance ; si aucune règle n'est disponible, un message vide est affiché. |

---

**Code source :** `swrl_editor.js` → `renderList()` — Itère sur le tableau filtré de règles, génère un `<li>` par règle avec le libellé (`label` ou `id`), l'identifiant en `<small>` si libellé distinct, une icône ⚙️, un bouton de suppression et la classe CSS `selected` si la règle correspond à `_editingId`.

### REQ-SWR-004 — Indicateur visuel de références cassées

| **Si** | une règle référence une `classe` ou une `propriété` qui a été supprimée de l'`ontologie`, |
|---|---|
| **Alors** | la règle est signalée visuellement dans la liste, et les atomes concernés affichent un avertissement dans le formulaire d'édition. |

---

**Code source :** `swrl_editor.js` → `_ruleHasBrokenRefs()` et `renderList()` — `_ruleHasBrokenRefs()` vérifie les champs `class_id` des atomes `type_atom` et `property_id` des atomes `property_atom`, y compris dans les blocs `naf_block` et `conditional` imbriqués, en contrôlant leur présence dans `APP.state.classes` et `APP.state.object_properties` / `APP.state.datatype_properties` ; `renderList()` applique `color: var(--red,#ef4444)` à l'entrée concernée ; `_renderAtom()` affiche un badge `⚠ deleted` sur les atomes en défaut.

### REQ-SWR-006 — Mise à jour dynamique du filtrage

| **Si** | l'ontologiste saisit ou modifie un terme dans le champ de recherche, |
|---|---|
| **Alors** | la liste des règles est filtrée instantanément et un bouton d'effacement apparaît tant que le champ contient du texte. |

| **Si** | l'ontologiste clique sur le bouton d'effacement, |
|---|---|
| **Alors** | le champ de recherche est vidé et toutes les règles sont de nouveau affichées. |

---

**Code source :** `swrl_editor.js` → `_applySearch()` — Écoute l'événement `input` sur `#swrl-search`, appelle `_filterRules()` puis `renderList()` ; insère ou supprime dynamiquement un bouton ✕ dans le champ selon que la valeur est non vide ou non.

### REQ-SWR-010 — Formulaire d'édition d'une règle

| **Si** | une règle est sélectionnée et que le formulaire d'édition est affiché, |
|---|---|
| **Alors** | l'ontologiste dispose de champs pour saisir l'identifiant (avec normalisation automatique des espaces), le libellé et le commentaire de la règle, ainsi que de deux sections distinctes pour la prémisse (corps) et la conclusion (tête), chacune permettant l'ajout d'atomes des types pertinents selon la section. |

---

**Code source :** `swrl_editor.js` → `_renderForm()` — Génère les champs `#swrl-id`, `#swrl-label`, `#swrl-comment` avec leurs gestionnaires `onchange` ; génère les sections `body` (avec boutons `type_atom`, `property_atom`, `equality_atom`, `naf_block`) et `head` (avec boutons `type_atom`, `property_atom`, `equality_atom`, `conditional`) via `_renderAtomList()`.

### REQ-SWR-019 — Rendu d'un atome de type `type_atom`

| **Si** | un atome d'appartenance à une `classe` est affiché dans le formulaire, |
|---|---|
| **Alors** | l'ontologiste voit la variable concernée, le mot-clé sémantique `is a` et la `classe` associée ; si la `classe` a été supprimée de l'`ontologie`, un avertissement est affiché à la place ; si elle existe, son identifiant est cliquable pour naviguer directement vers la `vue` des `classes`. |

---

**Code source :** `swrl_editor.js` → `_renderAtom()` (branche `case 'type_atom'`) — Affiche un champ `?var`, le libellé `is a` et un sélecteur de classe ; si `class_id` est absent de `APP.state.classes`, affiche `⚠ deleted` en rouge ; sinon rend un lien déclenchant `APP.navigateTo('classes', class_id)`.

### REQ-SWR-020 — Rendu d'un atome de type `property_atom`

| **Si** | un atome de `propriété` est affiché dans le formulaire, |
|---|---|
| **Alors** | l'ontologiste voit le sujet, la `propriété` et l'objet de la relation ; le type de `propriété` (objet ou donnée) est distingué visuellement ; si la `propriété` a été supprimée, un avertissement est affiché ; si elle existe, son identifiant est cliquable pour naviguer vers la `vue` de `propriétés` correspondante. |

---

**Code source :** `swrl_editor.js` → `_renderAtom()` (branche `case 'property_atom'`) — Affiche les champs `?subj` et `?obj / ?_`, un sélecteur de propriété avec un point coloré `op-prop-dot` pour les object properties et `dp-prop-dot` pour les datatype properties ; si `property_id` est absent de `APP.state`, affiche `⚠ deleted` ; sinon rend un lien vers `APP.navigateTo('object-properties' | 'datatype-properties', property_id)`.

### REQ-SWR-021 — Rendu d'un atome de type `equality_atom`

| **Si** | un atome de comparaison est affiché dans le formulaire, |
|---|---|
| **Alors** | l'ontologiste voit la variable, l'opérateur de comparaison et la valeur ; si la valeur correspond à un `individu` connu de l'`ontologie`, cet `individu` est affiché sous forme de pastille navigable ; sinon un champ de saisie libre est proposé ; un bouton distinct permet d'ouvrir le sélecteur d'`individus`. |

---

**Code source :** `swrl_editor.js` → `_renderAtom()` (branche `case 'equality_atom'`) — Affiche un champ `?var`, un sélecteur d'opérateur (`=`, `!=`, `>`, `>=`, `<`, `<=`) et, si `value` correspond à une clé de `APP.state.individuals`, une pastille avec lien `APP.navigateTo('individuals', value)` ; sinon un champ texte libre ; ajoute un bouton ouvrant `openIndPicker()`.

### REQ-SWR-022 — Rendu d'un bloc NAF

| **Si** | un bloc de négation (NAF) est affiché dans le formulaire, |
|---|---|
| **Alors** | l'ontologiste voit un conteneur clairement étiqueté `NAF`, dans lequel il peut ajouter et visualiser des atomes imbriqués. |

---

**Code source :** `swrl_editor.js` → `_renderAtom()` (branche `case 'naf_block'`) — Génère un conteneur avec en-tête `NAF`, des boutons d'ajout d'atomes (`type_atom`, `property_atom`, `equality_atom`) et appelle récursivement `_renderAtomList()` sur `atom.atoms`.

### REQ-SWR-023 — Rendu d'un atome conditionnel imbriqué

| **Si** | un atome conditionnel est affiché dans la conclusion d'une règle, |
|---|---|
| **Alors** | l'ontologiste voit deux sous-sections `if` et `then` imbriquées, chacune permettant l'ajout d'atomes du type approprié, avec normalisation automatique des formats anciens. |

---

**Code source :** `swrl_editor.js` → `_renderAtom()` (branche `case 'conditional'`) — Génère deux sous-sections `condition` et `consequent` avec leurs boutons d'ajout respectifs (`type_atom`, `property_atom`, `equality_atom`, `naf_block` dans la condition ; `conditional` supplémentaire dans le conséquent) ; normalise les champs `condition` et `consequent` d'objet unique en tableau si nécessaire.

### REQ-SWR-024 — Picker de classe pour les atomes `type_atom`

| **Si** | l'ontologiste ouvre le sélecteur de `classe` d'un atome, |
|---|---|
| **Alors** | un menu déroulant listant les `classes` de l'`ontologie` apparaît positionné près du déclencheur, et tout sélecteur de `classe` déjà ouvert se ferme automatiquement. |

| **Si** | l'ontologiste clique en dehors du menu déroulant, |
|---|---|
| **Alors** | le menu se ferme automatiquement. |

---

**Code source :** `swrl_editor.js` → `toggleClassPicker()` — Ferme tous les éléments `.swrl-class-picker-dropdown` ouverts, crée un `<div>` positionné en `position:fixed` via `_positionDropdown()`, peuple la liste depuis `APP.state.classes` triées alphabétiquement, et pose un écouteur `mousedown` sur `document` pour fermer au clic extérieur.

### REQ-SWR-026 — Picker de propriété pour les atomes `property_atom`

| **Si** | l'ontologiste ouvre le sélecteur de `propriété` d'un atome, |
|---|---|
| **Alors** | un menu déroulant présente les `propriétés` objet et les `DatatypeProperty` de l'`ontologie`, visuellement distinguées, triées alphabétiquement au sein de chaque groupe. |

---

**Code source :** `swrl_editor.js` → `togglePropPicker()` — Génère un `<div>` en `position:fixed` via `_positionDropdown()` ; peuple la liste depuis `APP.state.object_properties` (point `op-prop-dot`) et `APP.state.datatype_properties` (point `dp-prop-dot`), chaque groupe trié alphabétiquement, séparés par un `<hr>`.

### REQ-SWR-028 — Picker d'individu bi-panneau (modal)

| **Si** | l'ontologiste ouvre le sélecteur d'`individus`, |
|---|---|
| **Alors** | une fenêtre modale s'affiche avec, à gauche, l'arbre hiérarchique des `classes` de l'`ontologie` (incluant la `classe` racine avec le nombre total d'`individus`) et, à droite, la liste des `individus` filtrables par `classe`. |

---

**Code source :** `swrl_editor.js` → `openIndPicker()` — Insère `#swrl-ind-picker-modal` dans le DOM ; construit l'arbre des classes via `ClassEditor.buildTree()` en ajoutant `owl:Thing` en première entrée avec le décompte total ; le décompte par classe tient compte des sous-classes via la hiérarchie `subClassOf` ; appelle `swrlIndPickerSelectClass('owl:Thing')` pour initialiser la liste des individus.

### REQ-SWR-033 — Positionnement dynamique des dropdowns

| **Si** | le système doit afficher un menu déroulant à proximité d'un élément déclencheur, |
|---|---|
| **Alors** | le menu s'ouvre vers le bas si l'espace disponible le permet, sinon vers le haut, avec une largeur au moins égale à celle du déclencheur et une hauteur bornée pour éviter tout débordement hors de la fenêtre. |

---

**Code source :** `swrl_editor.js` → `_positionDropdown()` — Calcule via `getBoundingClientRect()` l'espace disponible sous et au-dessus du déclencheur ; positionne le dropdown en `position:fixed` vers le haut si l'espace inférieur est insuffisant ; applique `min-width` égale à la largeur du déclencheur ou au paramètre `width` (défaut 200 px) ; borne `max-height` à 260 px ou à l'espace disponible.

### REQ-SWR-035 — Navigation vers une entité référencée depuis un atome

| **Si** | une `classe`, une `propriété` ou un `individu` référencé dans un atome existe dans l'`ontologie` et que l'ontologiste clique sur son identifiant affiché dans le formulaire, |
|---|---|
| **Alors** | l'application navigue directement vers la `vue` de gestion correspondante et positionne l'entité cliquée en focus. |

| **Si** | l'ontologiste survole l'identifiant d'une entité référencée, |
|---|---|
| **Alors** | un soulignement et une couleur d'accentuation indiquent visuellement que l'élément est navigable. |

---

**Code source :** `swrl_editor.js` → `_renderAtom()` (branches `type_atom`, `property_atom`, `equality_atom`) — Génère un élément cliquable avec gestionnaire `onclick` appelant `APP.navigateTo(tab, id)` où `tab` vaut `'classes'`, `'object-properties'`, `'datatype-properties'` ou `'individuals'` selon le type d'entité ; applique les styles `text-decoration: underline` et `color: var(--accent)` au survol via CSS.

### REQ-SWR-038 — Bouton d'import dans le panneau liste des règles

| **Si** | le panneau liste des règles SWRL est affiché, |
|---|---|
| **Alors** | un bouton **Importer des règles** est présenté à gauche du bouton **+** (ajout de règle) dans l'en-tête du panneau, permettant à l'ontologiste d'importer des `règles SWRL` depuis un fichier au format SWORD (`.swd`). |

---

**Code source :** `swrl_editor.js` → `renderSplit()` — Rend, dans le `tree-panel-header`, un bouton d'import (`📥`, `title="Import rules from a .swd file"`) appelant `SWRLEditor.importRules()` immédiatement avant le bouton de création (`➕`) appelant `SWRLEditor.newRule()`.

### REQ-SWR-039 — Pickers de classe et de propriété homogènes

| **Si** | l'ontologiste ouvre le sélecteur de `classe` (`type_atom`) ou le sélecteur de `propriété` (`property_atom`, colonne centrale) d'un atome, |
|---|---|
| **Alors** | le sélecteur adopte la même présentation que le reste de l'application — un champ **Filtre** en haut et un affichage en **mode arbre** ; le sélecteur de `propriété` présente deux sections arborescentes, d'abord `ObjectProperties`, puis `DatatypeProperties`. |

---

**Code source :** `swrl_editor.js` → `toggleClassPicker()` et `togglePropPicker()` — Les deux construisent un menu déroulant en mode arbre décoré par `_decoratePickerWithFilter()`, qui ajoute un champ de filtre et une liste scrollable cohérents avec les autres onglets ; `toggleClassPicker()` peuple l'arbre via `_classTreePickerItems()` ; `togglePropPicker()` rend une section `ObjectProperties` (point `op-prop-dot`) suivie d'une section `DatatypeProperties` (point `dp-prop-dot`).

### REQ-SWR-040 — Préfixage de l'identifiant des règles dans la liste

| **Si** | une `règle SWRL` est affichée dans la liste du panneau de gauche, |
|---|---|
| **Alors** | son identifiant est présenté préfixé : une règle native reçoit le préfixe de l'`ontologie` courante (aucun préfixe si celui-ci est vide), tandis qu'une règle importée reçoit son préfixe contextuel d'import ; le préfixe s'applique uniquement à l'**identifiant** et jamais au **libellé** — lorsqu'un libellé existe, il reste affiché tel quel et l'identifiant préfixé apparaît en sous-texte. |

---

**Code source :** `swrl_editor.js` → `renderList()` et `_displayId(rule)` — Pour chaque règle, `_displayId()` calcule l'identifiant à afficher : pour une règle importée il applique le préfixe contextuel d'import issu de `import_labels`, pour une règle native il applique le préfixe de l'`ontologie` courante (ou aucun s'il est vide) ; `renderList()` n'applique ce préfixe qu'à l'identifiant, en conservant le `label` inchangé et en affichant l'identifiant préfixé en `<small>`.

### REQ-SWR-041 — Préfixage des éléments référencés dans les atomes

| **Si** | un atome référence une entité de l'`ontologie` — une `classe` (atome « is a »), une `ObjectProperty` ou une `DatatypeProperty` (atome de propriété), ou un `individu` (atome d'égalité), |
|---|---|
| **Alors** | l'entité référencée est affichée avec son préfixe : préfixe d'import pour une entité importée, préfixe de l'`ontologie` courante pour une entité native, et identifiant inchangé si celui-ci est déjà préfixé (namespacé) ou si l'entité est introuvable. |

---

**Code source :** `swrl_editor.js` → `SWRLEditor._dispRef(id, kinds)` — Résout l'entité d'identifiant `id` parmi les types indiqués (`kinds`) dans `APP.state`, puis applique `_displayId` pour produire l'affichage préfixé (préfixe d'import pour les entités importées, préfixe de l'`ontologie` courante pour les entités natives, valeur inchangée si déjà namespacée ou non trouvée) ; `_renderAtom()` utilise `_dispRef()` pour les `classes` des atomes `type_atom`, les propriétés des atomes `property_atom` et les `individus` des atomes `equality_atom`.
