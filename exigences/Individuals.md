# Exigences — Individuals

> Généré le 2026-06-06 | Dérivé strictement du code source | Aucune hallucination

## Table des matières

### Fond
- [REQ-IND-002 — Arbre de classes avec compteurs transitifs](#req-ind-002--arbre-de-classes-avec-compteurs-transitifs)
- [REQ-IND-003 — Liste des individuals filtrée et triée](#req-ind-003--liste-des-individuals-filtrée-et-triée)
- [REQ-IND-007 — Création d'un nouvel individual](#req-ind-007--création-dun-nouvel-individual)
- [REQ-IND-009 — Suppression d'un ou plusieurs individuals](#req-ind-009--suppression-dun-ou-plusieurs-individuals)
- [REQ-IND-010 — Déplacement par glisser-déposer vers une classe](#req-ind-010--déplacement-par-glisser-déposer-vers-une-classe)
- [REQ-IND-015 — Gestion des types (rdf:type)](#req-ind-015--gestion-des-types-rdftype)
- [REQ-IND-018 — Gestion de la cardinalité fonctionnelle des propriétés](#req-ind-018--gestion-de-la-cardinalité-fonctionnelle-des-propriétés)
- [REQ-IND-020 — Création d'un individual à la volée depuis le sélecteur](#req-ind-020--création-dun-individual-à-la-volée-depuis-le-sélecteur)
- [REQ-IND-021 — Sauvegarde automatique (autoSave)](#req-ind-021--sauvegarde-automatique-autosave)
- [REQ-IND-022 — Sauvegarde explicite : création et mise à jour](#req-ind-022--sauvegarde-explicite--création-et-mise-à-jour)
- [REQ-IND-023 — Suppression unitaire d'un individual depuis le formulaire](#req-ind-023--suppression-unitaire-dun-individual-depuis-le-formulaire)
- [REQ-IND-024 — Préservation de sameAs et differentFrom lors de la sauvegarde](#req-ind-024--préservation-de-sameas-et-differentfrom-lors-de-la-sauvegarde)
- [REQ-IND-025 — Collecte des assertions d'objet depuis les panneaux](#req-ind-025--collecte-des-assertions-dobjet-depuis-les-panneaux)
- [REQ-IND-026 — Collecte des assertions de données depuis les panneaux](#req-ind-026--collecte-des-assertions-de-données-depuis-les-panneaux)
- [REQ-IND-027 — Règle d'affichage simple (propriété unique)](#req-ind-027--règle-daffichage-simple-propriété-unique)
- [REQ-IND-028 — Règle d'affichage composite (multi-propriétés avec séparateur)](#req-ind-028--règle-daffichage-composite-multi-propriétés-avec-séparateur)
- [REQ-IND-029 — Résolution du label d'affichage par héritage de classe](#req-ind-029--résolution-du-label-daffichage-par-héritage-de-classe)
- [REQ-IND-030 — Résolution du label rdfs:label multilingue](#req-ind-030--résolution-du-label-rdfslabel-multilingue)
- [REQ-IND-031 — Persistance des règles d'affichage dans l'ontologie](#req-ind-031--persistance-des-règles-daffichage-dans-lontologie)
- [REQ-IND-032 — Génération automatique de l'identifiant d'un nouvel individual](#req-ind-032--génération-automatique-de-lidentifiant-dun-nouvel-individual)
- [REQ-IND-037 — Profondeur hiérarchique des classes pour l'ordonnancement](#req-ind-037--profondeur-hiérarchique-des-classes-pour-lordonnancement)
- [REQ-IND-038 — Collecte séparée des propriétés héritées et directes](#req-ind-038--collecte-séparée-des-propriétés-héritées-et-directes)
- [REQ-IND-039 — Filtre des individuals candidats par range d'une OP](#req-ind-039--filtre-des-individuals-candidats-par-range-dune-op)

### Forme
- [REQ-IND-001 — Rendu en trois colonnes](#req-ind-001--rendu-en-trois-colonnes)
- [REQ-IND-004 — Sélection d'une classe dans l'arbre](#req-ind-004--sélection-dune-classe-dans-larbre)
- [REQ-IND-005 — Sélection simple d'un individual](#req-ind-005--sélection-simple-dun-individual)
- [REQ-IND-006 — Sélection multiple par Shift+Clic](#req-ind-006--sélection-multiple-par-shiftclic)
- [REQ-IND-008 — Annulation du formulaire de création](#req-ind-008--annulation-du-formulaire-de-création)
- [REQ-IND-011 — Formulaire de détail d'un individual](#req-ind-011--formulaire-de-détail-dun-individual)
- [REQ-IND-012 — Identifiant IRI affiché dans l'en-tête du formulaire](#req-ind-012--identifiant-iri-affiché-dans-len-tête-du-formulaire)
- [REQ-IND-013 — Annotations : labels et commentaires](#req-ind-013--annotations--labels-et-commentaires)
- [REQ-IND-014 — Annotations de propriétés personnalisées](#req-ind-014--annotations-de-propriétés-personnalisées)
- [REQ-IND-016 — Panneaux de propriétés dynamiques (Object Properties)](#req-ind-016--panneaux-de-propriétés-dynamiques-object-properties)
- [REQ-IND-017 — Panneaux de propriétés dynamiques (Datatype Properties)](#req-ind-017--panneaux-de-propriétés-dynamiques-datatype-properties)
- [REQ-IND-019 — Ouverture du sélecteur d'individual pour une Object Property](#req-ind-019--ouverture-du-sélecteur-dindividual-pour-une-object-property)
- [REQ-IND-033 — Navigation vers un individual cible depuis une Object Property](#req-ind-033--navigation-vers-un-individual-cible-depuis-une-object-property)
- [REQ-IND-034 — Lien cliquable pour les valeurs de données de type URL](#req-ind-034--lien-cliquable-pour-les-valeurs-de-données-de-type-url)
- [REQ-IND-035 — Panneau "Where Used" dans le formulaire](#req-ind-035--panneau-where-used-dans-le-formulaire)
- [REQ-IND-036 — Redimensionnement des colonnes par glisser-déposer](#req-ind-036--redimensionnement-des-colonnes-par-glisser-déposer)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles OWL, contraintes de données, comportements algorithmiques, validations, persistance.


### REQ-IND-002 — Arbre de classes avec compteurs transitifs

| **Si** | l'ontologie est chargée et contient des classes OWL reliées par des relations `subClassOf`, |
|---|---|
| **Alors** | le système construit et affiche un arbre des classes via `ClassEditor.buildTree()` :<br>- le nœud racine `owl:Thing` indique le nombre total d'individuals,<br>- chaque classe affiche un compteur **transitif** du nombre d'individuals dont au moins un type appartient à l'ensemble de ses descendants (calculé par BFS via `allDescendants()`),<br>- l'indentation de chaque nœud est proportionnelle à sa profondeur (`depth * 16 + 6` px),<br>- chaque nœud est une zone cible pour le glisser-déposer. |

---

**Code source :** `owl_editor.js` → `_renderClassTree()`

### REQ-IND-003 — Liste des individuals filtrée et triée

| **Si** | l'onglet Individuals est affiché, **et** qu'une classe est éventuellement sélectionnée dans l'arbre (`_selectedClassId`), |
|---|---|
| **Alors** | - si aucune classe n'est sélectionnée, tous les individuals sont listés,<br>- si une classe est sélectionnée, seuls les individuals dont au moins un type appartient à cette classe ou à l'une de ses sous-classes (filtrage transitif par BFS) sont affichés,<br>- la liste est triée alphabétiquement par le label d'affichage résolu (`_resolveDisplayLabel()`), ou par identifiant si aucun label n'est défini,<br>- chaque item affiche le label principal et, si distinct, l'identifiant en sous-texte,<br>- chaque item est draggable. |

---

**Code source :** `owl_editor.js` → `_renderIndList()`

### REQ-IND-007 — Création d'un nouvel individual

| **Si** | l'utilisateur déclenche la création d'un nouvel individual, |
|---|---|
| **Alors** | - la sélection courante est vidée,<br>- un placeholder fantôme `new individual…` est inséré en tête de la liste (colonne 2),<br>- le formulaire vierge est affiché dans la colonne 3 via `renderForm(null, selectedClassId)`,<br>- après 30 ms, `Settings.generateIndividualId()` pré-remplit le champ ID, le focus lui est donné et son contenu est sélectionné. |

---

**Code source :** `owl_editor.js` → `newIndividual()`

### REQ-IND-009 — Suppression d'un ou plusieurs individuals

| **Si** | l'utilisateur confirme la suppression d'un ou plusieurs individuals sélectionnés (`_selectedIndIds`), |
|---|---|
| **Alors** | - une confirmation `UI.confirm()` est affichée (message adapté au singulier ou au pluriel),<br>- `API.deleteIndividual()` est appelé en boucle pour chaque ID,<br>- en cas de succès, toute la sélection est réinitialisée, l'état est rafraîchi via `APP.refresh()`, les colonnes 1 et 2 sont regénérées, et la colonne 3 affiche un état vide. |

---

**Code source :** `owl_editor.js` → `deleteSelected()`

### REQ-IND-010 — Déplacement par glisser-déposer vers une classe

| **Si** | l'utilisateur dépose un individual sur un nœud de classe dans l'arbre, |
|---|---|
| **Alors** | le système applique l'une des trois logiques suivantes :<br>- (a) si la classe source est connue et présente dans les types de l'individual, elle est **remplacée** par la classe cible,<br>- (b) si l'individual n'a qu'un seul type, celui-ci est remplacé par la classe cible,<br>- (c) sinon, la classe cible est **ajoutée** aux types existants sans doublon, |

puis la modification est envoyée via `API.updateIndividual()`, la section est re-rendue et l'individual reste sélectionné.

---

**Code source :** `owl_editor.js` → `_onClassDrop()`

### REQ-IND-015 — Gestion des types (rdf:type)

| **Si** | l'utilisateur ajoute un type à un individual, |
|---|---|
| **Alors** | `addType()` insère le type dans la liste `ind-types-list` via `_addListItem()` et déclenche l'autoSave si l'individual est en cours d'édition. |

| **Si** | l'utilisateur supprime un type d'un individual, |
|---|---|
| **Alors** | `removeType()` retire le type via `_removeListItem()` ; si la liste devient vide, le placeholder `owl:NamedIndividual` est réinséré ; l'autoSave est déclenché dans les deux cas. |

---

**Code source :** `owl_editor.js` → `addType()`, `removeType()`

### REQ-IND-018 — Gestion de la cardinalité fonctionnelle des propriétés

| **Si** | une propriété est marquée comme fonctionnelle (`opData?.characteristics?.functional` ou `dpData?.functional`) et qu'une valeur existe déjà, |
|---|---|
| **Alors** | - le bouton `+` d'ajout de valeur est masqué (`addBtnHidden`) lors du rendu du panneau,<br>- `_refreshAddBtn()` maintient cette visibilité à jour après chaque ajout ou suppression,<br>- `confirmPicker()` bloque l'insertion d'une nouvelle valeur si le panneau est en mode `single` et contient déjà une valeur. |

---

**Code source :** `owl_editor.js` → `_renderPropPanel()`, `_refreshAddBtn()`, `confirmPicker()`

### REQ-IND-020 — Création d'un individual à la volée depuis le sélecteur

| **Si** | l'utilisateur demande la création d'un nouvel individual depuis le sélecteur (`pickerCreateNew()`), |
|---|---|
| **Alors** | - un champ de saisie inline est inséré dans la liste du sélecteur (un seul champ à la fois),<br>- l'ID est pré-rempli via `Settings.generateIndividualId()`,<br>- la touche `Enter` confirme la création, la touche `Escape` annule. |

| **Si** | l'utilisateur confirme la création (`_pickerConfirmNew()`), |
|---|---|
| **Alors** | l'individual est créé via `API.createIndividual()` avec les types initiaux correspondant à la classe sélectionnée dans le picker, la liste est rafraîchie et le nouvel individual est sélectionné. |

---

**Code source :** `owl_editor.js` → `pickerCreateNew()`, `_pickerConfirmNew()`

### REQ-IND-021 — Sauvegarde automatique (autoSave)

| **Si** | un champ du formulaire est modifié via `onchange` **et** qu'un individual existant est en cours d'édition (`_editingId !== null`), |
|---|---|
| **Alors** | `save(false)` est appelé automatiquement pour persister les modifications. |

---

**Code source :** `owl_editor.js` → `autoSave()`

### REQ-IND-022 — Sauvegarde explicite : création et mise à jour

| **Si** | l'utilisateur déclenche une sauvegarde explicite, |
|---|---|
| **Alors** | le système collecte :<br>- l'ID (espaces remplacés par des underscores),<br>- les annotations via `_collectAnnotations()`,<br>- les types via `_collectList()`,<br>- les `objectAssertions` et `dataAssertions` depuis les panneaux DOM. |

| **Si** | `isNew=true`, |
|---|---|
| **Alors** | `API.createIndividual()` est appelé, `_selectedIndId` et `_editingId` sont mis à jour, les trois colonnes sont re-rendues et `APP.refresh()` est appelé. |

| **Si** | `isNew=false`, |
|---|---|
| **Alors** | `API.updateIndividual(originalId, ind)` est appelé ; si l'ID a changé, un message de renommage est affiché ; `APP.refresh()` est appelé dans les deux cas. |

---

**Code source :** `owl_editor.js` → `save()`

### REQ-IND-023 — Suppression unitaire d'un individual depuis le formulaire

| **Si** | l'utilisateur confirme la suppression d'un individual depuis le formulaire (`UI.confirm()`), |
|---|---|
| **Alors** | - `API.deleteIndividual()` est appelé,<br>- si l'individual supprimé était sélectionné (`_selectedIndId === id`), `_selectedIndId` et `_editingId` sont réinitialisés et la colonne 3 affiche l'état vide,<br>- les colonnes 1 et 2 sont regénérées. |

---

**Code source :** `owl_editor.js` → `delete()`

### REQ-IND-024 — Préservation de sameAs et differentFrom lors de la sauvegarde

| **Si** | une sauvegarde est déclenchée pour un individual, |
|---|---|
| **Alors** | les valeurs existantes de `sameAs` et `differentFrom` sont récupérées depuis `APP.state.individuals` (via l'ID original ou le nouvel ID) et incluses systématiquement dans l'objet envoyé à l'API, sans possibilité de modification via le formulaire principal. |

---

**Code source :** `owl_editor.js` → `save()`

### REQ-IND-025 — Collecte des assertions d'objet depuis les panneaux

| **Si** | une sauvegarde est déclenchée, |
|---|---|
| **Alors** | le système interroge tous les éléments DOM `.ind-prop-panel[data-kind="op"]` : pour chaque `.ind-op-target` (input hidden ou select) dont la valeur est non vide, un objet `{ property, target }` est construit à partir de `panel.dataset.prop` et ajouté au tableau `objectAssertions`. |

---

**Code source :** `owl_editor.js` → `save()`

### REQ-IND-026 — Collecte des assertions de données depuis les panneaux

| **Si** | une sauvegarde est déclenchée, |
|---|---|
| **Alors** | le système interroge tous les éléments DOM `.ind-prop-panel[data-kind="dp"]` : pour chaque `.ind-prop-row` contenant une valeur `.ind-dp-value` non vide, un objet `{ property, value, datatype }` est construit — le datatype est lu depuis `dataset.dtype` de l'élément `.ind-dp-type`, avec `xsd:string` comme valeur par défaut. |

---

**Code source :** `owl_editor.js` → `save()`

### REQ-IND-027 — Règle d'affichage simple (propriété unique)

| **Si** | l'utilisateur ouvre le modal de règle d'affichage via `_openDisplayPropModal()`, |
|---|---|
| **Alors** | toutes les propriétés disponibles pour la classe sélectionnée sont listées (annotations, propriétés héritées, directes et via domaine), avec un marquage `(inherited)` pour celles déjà actives par héritage. |

| **Si** | l'utilisateur sélectionne ou supprime une propriété via `setDisplayProp()`, |
|---|---|
| **Alors** | la règle est enregistrée (ou supprimée si `null`) dans `_displayProps[classId \|\| '__root__']` ; `_getEffectiveDisplayProp()` remonte récursivement la hiérarchie de classes pour déterminer la règle applicable à un individual donné. |

---

**Code source :** `owl_editor.js` → `setDisplayProp()`, `_openDisplayPropModal()`, `_getEffectiveDisplayProp()`

### REQ-IND-028 — Règle d'affichage composite (multi-propriétés avec séparateur)

| **Si** | l'utilisateur ouvre le modal de règle d'affichage composite via `_openDisplayPropsMultiModal()`, |
|---|---|
| **Alors** | un modal avec des lignes `{séparateur, propriété}` éditables est affiché ; `_addDisplayMultiRow()` permet d'ajouter une ligne vide. |

| **Si** | l'utilisateur confirme via `_confirmDisplayMulti()`, |
|---|---|
| **Alors** | `setDisplayPropsMulti()` sauvegarde la règle composite dans `_displayPropsMulti[classId \|\| '__root__']` (ou la supprime si `null`/vide) ; `_getEffectiveDisplayMulti()` remonte la hiérarchie de classes de manière analogue à `_getEffectiveDisplayProp()`. |

---

**Code source :** `owl_editor.js` → `_openDisplayPropsMultiModal()`, `_addDisplayMultiRow()`, `_confirmDisplayMulti()`, `setDisplayPropsMulti()`, `_getEffectiveDisplayMulti()`

### REQ-IND-029 — Résolution du label d'affichage par héritage de classe

| **Si** | le système doit afficher le label d'un individual, |
|---|---|
| **Alors** | il cherche une règle d'affichage applicable selon la priorité suivante : 1. types propres de l'individual, 2. classe de contexte (classe sélectionnée dans l'arbre ou classe du picker), 3. règle racine (`__root__`), |

en vérifiant pour chaque classe candidate d'abord la règle composite (`_getEffectiveDisplayMulti()`) puis la règle simple (`_getEffectiveDisplayProp()`) ; le label est construit via `_buildMultiLabel()` ou `_getDisplayLabel()` selon le type de règle.

---

**Code source :** `owl_editor.js` → `_resolveDisplayLabel()`

### REQ-IND-030 — Résolution du label rdfs:label multilingue

| **Si** | le système résout le label d'affichage d'un individual à partir d'une propriété `rdfs:label`, |
|---|---|
| **Alors** | - pour la forme `rdfs:label@{lang}`, il cherche d'abord la langue exacte demandée, puis les autres langues actives (`Settings.activeLangs`) dans l'ordre, puis le premier label disponible quelle que soit la langue,<br>- pour la forme sans langue, il utilise `Settings.preferredLang` en priorité, ou le premier label disponible,<br>- les formes `rdfs:comment`, annotations `other` (par propriété), `dataAssertions` et `objectAssertions` (retourne la cible) sont également supportées. |

---

**Code source :** `owl_editor.js` → `_getDisplayLabel()`

### REQ-IND-031 — Persistance des règles d'affichage dans l'ontologie

| **Si** | les règles d'affichage sont modifiées, |
|---|---|
| **Alors** | `_saveDisplayRules()` construit un objet `{ single: _displayProps, multi: _displayPropsMulti }`, l'envoie via `API.updateDisplayRules()` et met à jour `APP.state.ontology.display_rules` en mémoire. |

| **Si** | l'ontologie est chargée, |
|---|---|
| **Alors** | `_loadDisplayRules()` lit `APP.state.ontology?.display_rules` et initialise les deux maps internes `_displayProps` et `_displayPropsMulti`. |

---

**Code source :** `owl_editor.js` → `_saveDisplayRules()`, `_loadDisplayRules()`

### REQ-IND-032 — Génération automatique de l'identifiant d'un nouvel individual

| **Si** | le formulaire de création d'un nouvel individual est affiché (`newIndividual()`) **ou** qu'un champ de saisie inline est inséré dans le sélecteur (`pickerCreateNew()`), |
|---|---|
| **Alors** | après 30 ms, `Settings.generateIndividualId(this._selectedClassId)` est appelé pour pré-remplir le champ ID correspondant. |

---

**Code source :** `owl_editor.js` → `newIndividual()`, `pickerCreateNew()`

### REQ-IND-037 — Profondeur hiérarchique des classes pour l'ordonnancement

| **Si** | le système doit ordonner les propriétés d'un individual par profondeur hiérarchique, |
|---|---|
| **Alors** | `_classDepth()` calcule la profondeur de chaque classe par BFS itératif en remontant les parents (`subClassOf` de type string uniquement), avec protection contre les cycles (marquage `visited`) ; le résultat est utilisé dans `_getClassProperties()` pour ordonner les propriétés du plus haut au plus bas dans la hiérarchie. |

---

**Code source :** `owl_editor.js` → `_classDepth()`

### REQ-IND-038 — Collecte séparée des propriétés héritées et directes

| **Si** | le formulaire d'un individual est rendu, |
|---|---|
| **Alors** | `_getClassProperties()` analyse les types de l'individual et retourne deux maps :<br>- `asserted` : restrictions définies sur les types directs, ordonnées par profondeur croissante puis alphabétiquement,<br>- `inherited` : restrictions définies sur les ancêtres, sans doublon avec `asserted`, |

la nature de chaque propriété (`op` ou `dp`) étant déterminée en cherchant dans `APP.state.object_properties` ; les panneaux hérités sont affichés avant les directs.

---

**Code source :** `owl_editor.js` → `_getClassProperties()`

### REQ-IND-039 — Filtre des individuals candidats par range d'une OP

| **Si** | le système doit proposer les individuals compatibles avec le range d'une Object Property, |
|---|---|
| **Alors** | `_indsOfRange()` retourne la liste des individuals dont au moins un type appartient à l'ensemble calculé (descendants des classes du range inclus via `ClassEditor.buildTree()`), en excluant l'individual en cours d'édition ; si `rangeClasses` est vide ou null, tous les individuals (sauf l'exclu) sont retournés. |

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

**Code source :** `owl_editor.js` → `_indsOfRange()`

### REQ-IND-001 — Rendu en trois colonnes

| **Si** | l'onglet Individuals est chargé, |
|---|---|
| **Alors** | le système génère une mise en page `section-split` à trois colonnes :<br>- colonne 1 : arbre des classes (`ind-tree-panel`),<br>- colonne 2 : liste des individuals (`ind-list-panel`),<br>- colonne 3 : panneau de détail/formulaire (`ind-detail`), affichant par défaut un état vide invitant à sélectionner ou créer un individual, |

avec deux séparateurs redimensionnables (`ind-split-h1`, `ind-split-h2`) insérés entre les colonnes.

---

**Code source :** `owl_editor.js` → `renderSplit()`

### REQ-IND-004 — Sélection d'une classe dans l'arbre

| **Si** | l'utilisateur clique sur une classe dans l'arbre, |
|---|---|
| **Alors** | - `_selectedClassId` est mis à jour,<br>- toutes les sélections d'individuals sont réinitialisées,<br>- le surlignage de la colonne 1 est actualisé,<br>- le titre de la colonne 2 est mis à jour,<br>- la liste filtrée est regénérée via `_renderIndList()`,<br>- la colonne 3 affiche un état vide avec le message `owl:Thing` et un bouton de création. |

---

**Code source :** `owl_editor.js` → `selectClass()`

### REQ-IND-005 — Sélection simple d'un individual

| **Si** | l'utilisateur clique sur un individual sans maintenir la touche Shift, |
|---|---|
| **Alors** | - `_selectedIndIds` est initialisé avec le seul identifiant cliqué,<br>- le point d'ancrage `_anchorIndId` est positionné,<br>- le formulaire de l'individual est affiché via `renderForm()` dans la colonne 3,<br>- le bouton de suppression est activé via `_setDelBtn()`. |

---

**Code source :** `owl_editor.js` → `selectIndividual()`

### REQ-IND-006 — Sélection multiple par Shift+Clic

| **Si** | l'utilisateur clique sur un individual avec la touche Shift (`isShift === true`) **et** qu'un point d'ancrage existe, |
|---|---|
| **Alors** | la plage d'indices entre l'ancre et l'item cliqué dans la liste DOM est calculée et tous les items intermédiaires sont sélectionnés ; si la sélection dépasse un individual, la colonne 3 affiche un résumé `N individuals selected` avec un bouton de suppression groupée et `_editingId` est mis à `null`. |

---

**Code source :** `owl_editor.js` → `selectIndividual()`

### REQ-IND-008 — Annulation du formulaire de création

| **Si** | l'utilisateur annule le formulaire de création, |
|---|---|
| **Alors** | - toutes les variables de sélection et d'édition sont réinitialisées,<br>- le placeholder fantôme est supprimé de la liste,<br>- la colonne 3 restaure l'état vide avec le message de démarrage et le bouton de création. |

---

**Code source :** `owl_editor.js` → `_cancelForm()`

### REQ-IND-011 — Formulaire de détail d'un individual

| **Si** | un individual est sélectionné ou en cours de création, |
|---|---|
| **Alors** | `renderForm()` génère le formulaire complet avec les blocs suivants :<br>- champ ID avec sanitisation en temps réel (`_sanitizeId()`),<br>- section Annotations,<br>- section Types (`rdf:type`),<br>- panneaux de propriétés dynamiques via `_getClassProperties()` et `_renderPropPanel()`,<br>- pour un individual existant, un bloc `_whereUsedFrame()` en bas du formulaire,<br>- pour un nouvel individual, le champ ID déclenche `save(true)` au `blur`. |

---

**Code source :** `owl_editor.js` → `renderForm()`

### REQ-IND-012 — Identifiant IRI affiché dans l'en-tête du formulaire

| **Si** | l'ontologie possède un IRI de base (`APP.state.ontology?.id`) **et** que l'individual a un identifiant, |
|---|---|
| **Alors** | l'IRI complet sous la forme `{baseIri}#{id}` est affiché dans l'élément `cls-editor-iri` de l'en-tête du formulaire ; cette ligne n'est pas affichée pour les nouveaux individuals (IRI vide). |

---

**Code source :** `owl_editor.js` → `renderForm()`

### REQ-IND-013 — Annotations : labels et commentaires

| **Si** | le formulaire est affiché, les annotations existantes (`labels`, `comments`, `other`) sont rendues via `_annoRow()`.  **Si** l'utilisateur ajoute une ligne d'annotation via `addAnnotRow()`, |
|---|---|
| **Alors** | une nouvelle ligne est insérée dynamiquement dans `ind-annotations-body` via `_makeAnnotRow()`, avec `onchange` activé pour l'autoSave si l'individual est en cours d'édition. |

| **Si** | l'utilisateur supprime une ligne via `removeAnnotRow()`, |
|---|---|
| **Alors** | la ligne DOM est supprimée et l'autoSave est déclenché. |

---

**Code source :** `owl_editor.js` → `renderForm()`, `addAnnotRow()`, `removeAnnotRow()`

### REQ-IND-014 — Annotations de propriétés personnalisées

| **Si** | l'utilisateur sélectionne une propriété dans le sélecteur `ind-anno-picker`, |
|---|---|
| **Alors** | `addOtherAnnotRow()` ajoute une ligne d'annotation `other` dans le tableau des annotations en utilisant la propriété passée en paramètre, puis masque le sélecteur. |

---

**Code source :** `owl_editor.js` → `addOtherAnnotRow()`

### REQ-IND-016 — Panneaux de propriétés dynamiques (Object Properties)

| **Si** | le formulaire d'un individual est rendu et que des Object Properties sont associées à ses types, |
|---|---|
| **Alors** | `_renderPropPanel()` génère un panneau par propriété `op` : chaque `objectAssertion` existante est affichée avec le label de la cible (via `_labelForId()`), un lien de navigation vers l'individual cible et un bouton de suppression ; `addPropValue()` (pour `kind='op'`) construit un `<select>` peuplé par `_indsOfRange()` filtré sur le range effectif de la propriété. |

---

**Code source :** `owl_editor.js` → `_renderPropPanel()`, `addPropValue()`

### REQ-IND-017 — Panneaux de propriétés dynamiques (Datatype Properties)

| **Si** | le formulaire d'un individual est rendu et que des Datatype Properties sont associées à ses types, |
|---|---|
| **Alors** | `_renderPropPanel()` génère un panneau par propriété `dp` : chaque `dataAssertion` existante est affichée avec un champ texte éditable, le datatype (`xsd:string` par défaut ou premier range de la propriété) et un bouton de suppression ; si la valeur est une URL (`/^https?:\/\//i`), un lien `🔗` cliquable est affiché ; `addPropValue()` (pour `kind='dp'`) crée un champ texte vide avec le datatype par défaut. |

---

**Code source :** `owl_editor.js` → `_renderPropPanel()`, `addPropValue()`

### REQ-IND-019 — Ouverture du sélecteur d'individual pour une Object Property

| **Si** | l'utilisateur ouvre le sélecteur pour une Object Property via `openPicker()`, |
|---|---|
| **Alors** | un modal overlay est affiché avec deux panneaux : arbre des classes autorisées (filtrées selon le `effectiveRange` de la propriété, ou toutes les classes si aucun range) et liste des individuals. |

| **Si** | l'utilisateur sélectionne une classe dans le picker via `pickerSelectClass()`, |
|---|---|
| **Alors** | la liste des individuals est mise à jour (filtrage transitif) en excluant l'individual en cours d'édition. |

| **Si** | l'utilisateur sélectionne un individual via `pickerSelectInd()`, |
|---|---|
| **Alors** | le bouton OK est activé. |

| **Si** | l'utilisateur confirme via `confirmPicker()`, |
|---|---|
| **Alors** | l'individual choisi est inséré comme nouvelle ligne dans le panneau de la propriété. |

| **Si** | l'utilisateur ferme le picker via `closePicker()`, |
|---|---|
| **Alors** | l'overlay est supprimé du DOM. |

---

**Code source :** `owl_editor.js` → `openPicker()`, `pickerSelectClass()`, `pickerSelectInd()`, `confirmPicker()`, `closePicker()`

### REQ-IND-033 — Navigation vers un individual cible depuis une Object Property

| **Si** | un panneau de type `op` affiche des valeurs, |
|---|---|
| **Alors** | chaque valeur comporte un lien `onclick="APP.navigateTo('individuals','${a.target}')"` permettant de naviguer directement vers l'individual cible dans l'onglet Individuals ; ce même lien est généré après sélection via `confirmPicker()`. |

---

**Code source :** `owl_editor.js` → `_renderPropPanel()`

### REQ-IND-034 — Lien cliquable pour les valeurs de données de type URL

| **Si** | la valeur d'une `dataAssertion` dans un panneau `dp` correspond à l'expression régulière `/^https?:\/\//i`, |
|---|---|
| **Alors** | un lien `<a>` avec l'icône `🔗` est inséré à droite du champ texte, ouvrant l'URL dans un nouvel onglet (`target="_blank"`). |

---

**Code source :** `owl_editor.js` → `_renderPropPanel()`

### REQ-IND-035 — Panneau "Where Used" dans le formulaire

| **Si** | le formulaire affiche un individual existant (`ind` non null), |
|---|---|
| **Alors** | `_whereUsedFrame(r => _ruleUsesIndividual(r, ind.id))` est appelé et son résultat est inséré en bas du formulaire, listant les règles SWRL ou autres entités qui référencent l'individual. |

---

**Code source :** `owl_editor.js` → `renderForm()`

### REQ-IND-036 — Redimensionnement des colonnes par glisser-déposer

| **Si** | l'utilisateur fait glisser un séparateur de colonne (`ind-split-h1` ou `ind-split-h2`), |
|---|---|
| **Alors** | `_initHandle()` ajuste en temps réel la largeur CSS du panneau adjacent via les écouteurs `mousedown`/`mousemove`/`mouseup` sur `document`, dans les limites suivantes :<br>- `ind-split-h1` / `ind-tree-panel` : entre 120 et 520 px,<br>- `ind-split-h2` / `ind-list-panel` : entre 100 et 400 px. |

---

*Document généré par analyse statique du code source de `owl_editor.js` — aucune fonctionnalité extrapolée.*

**Code source :** `owl_editor.js` → `_initHandle()`, `_initSplitPanes()`
