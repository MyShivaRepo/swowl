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
- [REQ-IND-040 — Sélection complète d'un individual lors d'une navigation inter-onglets](#req-ind-040--sélection-complète-dun-individual-lors-dune-navigation-inter-onglets)
- [REQ-IND-034 — Lien cliquable pour les valeurs de données de type URL](#req-ind-034--lien-cliquable-pour-les-valeurs-de-données-de-type-url)
- [REQ-IND-035 — Panneau "Where Used" dans le formulaire](#req-ind-035--panneau-where-used-dans-le-formulaire)
- [REQ-IND-036 — Redimensionnement des colonnes par glisser-déposer](#req-ind-036--redimensionnement-des-colonnes-par-glisser-déposer)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles OWL, contraintes de données, comportements algorithmiques, validations, persistance.


### REQ-IND-002 — Arbre de classes avec compteurs transitifs

| **Si** | l'`ontologie` est chargée et contient des `classes` organisées en hiérarchie, |
|---|---|
| **Alors** | l'arbre des `classes` reflète fidèlement les relations de spécialisation entre concepts : le nœud racine `owl:Thing` indique le nombre total d'`individuals`, chaque `classe` affiche le nombre d'`individuals` qu'elle contient en comptant également ceux de toutes ses sous-`classes`, et chaque nœud est une zone cible pour le glisser-déposer. |

---

**Code source :** `owl_editor.js` → `_renderClassTree()` — Appelle `ClassEditor.buildTree()` pour construire l'arbre hiérarchique à partir des relations `subClassOf`. Pour chaque nœud, calcule un compteur transitif via `allDescendants()` (BFS) qui remonte tous les descendants. L'indentation visuelle est proportionnelle à la profondeur du nœud (`depth * 16 + 6` px). Chaque nœud est rendu avec l'attribut `draggable` pour accepter les dépôts d'individuals.

### REQ-IND-003 — Liste des individuals filtrée et triée

| **Si** | l'ontologiste consulte la liste des `individuals`, éventuellement après avoir sélectionné une `classe` dans l'arbre, |
|---|---|
| **Alors** | seuls les `individuals` appartenant à cette `classe` ou à l'une de ses sous-`classes` sont affichés, triés alphabétiquement par leur nom d'affichage ; sans sélection de `classe`, tous les `individuals` sont listés ; chaque `individual` peut être déplacé par glisser-déposer. |

---

**Code source :** `owl_editor.js` → `_renderIndList()` — Filtre les individuals dont au moins un type appartient à la classe sélectionnée (`_selectedClassId`) ou à l'un de ses descendants (BFS transitif via `allDescendants()`). Trie la liste alphabétiquement par le label résolu via `_resolveDisplayLabel()`, ou par identifiant si aucun label n'est défini. Chaque item affiche le label principal et, si distinct, l'identifiant en sous-texte ; l'identifiant est préfixé par le préfixe de registre de l'ontologie connectée lorsqu'un préfixe est défini (comportement spécifié en détail dans `Ontologies.md`). Chaque item est rendu avec l'attribut `draggable`.

### REQ-IND-007 — Création d'un nouvel individual

| **Si** | l'ontologiste souhaite créer un nouvel `individual`, |
|---|---|
| **Alors** | un formulaire vierge s'ouvre immédiatement, pré-rempli avec un identifiant généré automatiquement, prêt à être saisi sans manipulation préalable. |

---

**Code source :** `owl_editor.js` → `newIndividual()` — Réinitialise la sélection courante, insère un placeholder fantôme `new individual…` en tête de la liste (colonne 2), affiche le formulaire vierge via `renderForm(null, selectedClassId)` dans la colonne 3. Après 30 ms, appelle `Settings.generateIndividualId()` pour pré-remplir le champ ID, lui donne le focus et sélectionne son contenu.

### REQ-IND-009 — Suppression d'un ou plusieurs individuals

| **Si** | l'ontologiste confirme la suppression d'un ou plusieurs `individuals` sélectionnés, |
|---|---|
| **Alors** | les `individuals` sont supprimés de l'`ontologie`, la liste est mise à jour et le formulaire affiche un état vide. |

---

**Code source :** `owl_editor.js` → `deleteSelected()` — Affiche une confirmation via `UI.confirm()` avec un message adapté au singulier ou au pluriel. Appelle `API.deleteIndividual()` en boucle pour chaque identifiant de `_selectedIndIds`. En cas de succès, réinitialise toute la sélection, rafraîchit l'état via `APP.refresh()`, régénère les colonnes 1 et 2, et affiche un état vide en colonne 3.

### REQ-IND-010 — Déplacement par glisser-déposer vers une classe

| **Si** | l'ontologiste dépose un `individual` sur une `classe` de l'arbre, |
|---|---|
| **Alors** | le type de l'`individual` est mis à jour pour refléter sa nouvelle appartenance : si l'`individual` avait déjà un type connu, ce type est remplacé par la `classe` cible ; sinon, la `classe` cible est ajoutée à ses types existants, sans doublon. |

---

**Code source :** `owl_editor.js` → `_onClassDrop()` — Applique l'une des trois logiques : (a) si la classe source est présente dans les types de l'individual, elle est remplacée par la classe cible ; (b) si l'individual n'a qu'un seul type, celui-ci est remplacé ; (c) sinon, la classe cible est ajoutée sans doublon. Envoie la modification via `API.updateIndividual()`, re-rend la section et maintient l'individual sélectionné.

### REQ-IND-015 — Gestion des types (rdf:type)

| **Si** | l'ontologiste ajoute un type à un `individual`, |
|---|---|
| **Alors** | le nouveau type apparaît dans la liste des types de l'`individual` et la sauvegarde est déclenchée automatiquement si l'`individual` est déjà enregistré. |

| **Si** | l'ontologiste supprime un type d'un `individual`, |
|---|---|
| **Alors** | le type est retiré de la liste ; si la liste devient vide, `owl:NamedIndividual` est automatiquement maintenu comme type minimal, et la sauvegarde est déclenchée. |

---

**Code source :** `owl_editor.js` → `addType()`, `removeType()` — `addType()` insère le type dans la liste `ind-types-list` via `_addListItem()` et déclenche `autoSave()` si `_editingId !== null`. `removeType()` retire le type via `_removeListItem()` ; si la liste devient vide, réinsère le placeholder `owl:NamedIndividual` ; déclenche `autoSave()` dans les deux cas.

### REQ-IND-018 — Gestion de la cardinalité fonctionnelle des propriétés

| **Si** | une `propriété` est fonctionnelle et qu'une valeur a déjà été assignée à un `individual`, |
|---|---|
| **Alors** | l'ontologiste ne peut pas ajouter une deuxième valeur pour cette `propriété` : le contrôle d'ajout est masqué et toute tentative d'insertion est bloquée. |

---

**Code source :** `owl_editor.js` → `_renderPropPanel()`, `_refreshAddBtn()`, `confirmPicker()` — Lors du rendu, si `opData?.characteristics?.functional` ou `dpData?.functional` est vrai et qu'une valeur existe, le bouton `+` est masqué (`addBtnHidden`). `_refreshAddBtn()` maintient cette visibilité à jour après chaque ajout ou suppression. `confirmPicker()` bloque l'insertion si le panneau est en mode `single` et contient déjà une valeur.

### REQ-IND-020 — Création d'un individual à la volée depuis le sélecteur

| **Si** | l'ontologiste souhaite créer un nouvel `individual` directement depuis le sélecteur d'une `propriété`, |
|---|---|
| **Alors** | un champ de saisie apparaît dans la liste du sélecteur avec un identifiant pré-généré ; il peut confirmer la création avec Entrée ou annuler avec Échap. |

| **Si** | l'ontologiste confirme la création depuis le sélecteur, |
|---|---|
| **Alors** | le nouvel `individual` est créé avec les types correspondant à la `classe` sélectionnée, la liste est rafraîchie et le nouvel `individual` est immédiatement disponible pour sélection. |

---

**Code source :** `owl_editor.js` → `pickerCreateNew()`, `_pickerConfirmNew()` — `pickerCreateNew()` insère un champ de saisie inline dans la liste (un seul à la fois), pré-remplit l'ID via `Settings.generateIndividualId()`, gère `keydown` pour Entrée (confirmation) et Échap (annulation). `_pickerConfirmNew()` appelle `API.createIndividual()` avec les types initiaux correspondant à la classe sélectionnée dans le picker, rafraîchit la liste et sélectionne le nouvel individual.

### REQ-IND-021 — Sauvegarde automatique (autoSave)

| **Si** | l'ontologiste modifie un champ du formulaire d'un `individual` déjà enregistré, |
|---|---|
| **Alors** | les modifications sont sauvegardées automatiquement sans action explicite de sa part. |

---

**Code source :** `owl_editor.js` → `autoSave()` — Déclenché via l'événement `onchange` de chaque champ du formulaire. Appelle `save(false)` uniquement si `_editingId !== null`, c'est-à-dire si un individual existant est en cours d'édition.

### REQ-IND-022 — Sauvegarde explicite : création et mise à jour

| **Si** | l'ontologiste déclenche une sauvegarde explicite d'un `individual`, |
|---|---|
| **Alors** | toutes les informations saisies sont collectées (identifiant, annotations, types, assertions de `ObjectProperty` et de données) et persistées dans l'`ontologie`. |

| **Si** | l'`individual` est nouveau, |
|---|---|
| **Alors** | il est créé dans l'`ontologie`, l'arbre et la liste sont mis à jour, et l'`individual` nouvellement créé est sélectionné dans l'interface. |

| **Si** | l'`individual` existe déjà, |
|---|---|
| **Alors** | il est mis à jour ; si son identifiant a changé, un message de confirmation de renommage est affiché ; l'`ontologie` est rafraîchie dans les deux cas. |

---

**Code source :** `owl_editor.js` → `save()` — Collecte l'ID (espaces remplacés par des underscores), les annotations via `_collectAnnotations()`, les types via `_collectList()`, les `objectAssertions` depuis les panneaux DOM `.ind-prop-panel[data-kind="op"]` et les `dataAssertions` depuis `.ind-prop-panel[data-kind="dp"]`. Si `isNew=true` : appelle `API.createIndividual()`, met à jour `_selectedIndId` et `_editingId`, re-rend les trois colonnes et appelle `APP.refresh()`. Si `isNew=false` : appelle `API.updateIndividual(originalId, ind)`, affiche un message si l'ID a changé, appelle `APP.refresh()`.

### REQ-IND-023 — Suppression unitaire d'un individual depuis le formulaire

| **Si** | l'ontologiste supprime un `individual` depuis son formulaire de détail, |
|---|---|
| **Alors** | l'`individual` est retiré de l'`ontologie`, la liste est mise à jour et le formulaire affiche un état vide si l'`individual` supprimé était celui en cours de consultation. |

---

**Code source :** `owl_editor.js` → `delete()` — Appelle `API.deleteIndividual()`. Si l'individual supprimé était sélectionné (`_selectedIndId === id`), réinitialise `_selectedIndId` et `_editingId` et affiche l'état vide en colonne 3. Régénère les colonnes 1 et 2.

### REQ-IND-024 — Préservation de sameAs et differentFrom lors de la sauvegarde

| **Si** | une sauvegarde est déclenchée pour un `individual`, |
|---|---|
| **Alors** | les relations d'identité (`sameAs`) et de différence (`differentFrom`) déjà définies sont conservées intégralement, même si elles ne sont pas éditables depuis le formulaire principal. |

---

**Code source :** `owl_editor.js` → `save()` — Récupère les valeurs existantes de `sameAs` et `differentFrom` depuis `APP.state.individuals` (via l'ID original ou le nouvel ID) et les inclut systématiquement dans l'objet envoyé à l'API, sans permettre leur modification via le formulaire principal.

### REQ-IND-025 — Collecte des assertions d'objet depuis les panneaux

| **Si** | une sauvegarde est déclenchée, |
|---|---|
| **Alors** | toutes les relations entre l'`individual` et d'autres `individuals` (assertions d'objet) saisies dans les panneaux de `propriétés` sont collectées et incluses dans la sauvegarde. |

---

**Code source :** `owl_editor.js` → `save()` — Interroge tous les éléments DOM `.ind-prop-panel[data-kind="op"]` : pour chaque `.ind-op-target` (input hidden ou select) dont la valeur est non vide, construit un objet `{ property, target }` à partir de `panel.dataset.prop` et l'ajoute au tableau `objectAssertions`.

### REQ-IND-026 — Collecte des assertions de données depuis les panneaux

| **Si** | une sauvegarde est déclenchée, |
|---|---|
| **Alors** | toutes les valeurs littérales saisies dans les panneaux de `DatatypeProperty` sont collectées avec leur type de données et incluses dans la sauvegarde. |

---

**Code source :** `owl_editor.js` → `save()` — Interroge tous les éléments DOM `.ind-prop-panel[data-kind="dp"]` : pour chaque `.ind-prop-row` contenant une valeur `.ind-dp-value` non vide, construit un objet `{ property, value, datatype }` — le datatype est lu depuis `dataset.dtype` de l'élément `.ind-dp-type`, avec `xsd:string` comme valeur par défaut.

### REQ-IND-027 — Règle d'affichage simple (propriété unique)

| **Si** | l'ontologiste souhaite définir comment les `individuals` d'une `classe` sont nommés dans l'interface, |
|---|---|
| **Alors** | il peut choisir une `propriété` dont la valeur sera utilisée comme label d'affichage, en voyant clairement quelles `propriétés` sont disponibles et lesquelles sont déjà héritées d'une `classe` parente. |

| **Si** | l'ontologiste sélectionne ou retire une `propriété` d'affichage, |
|---|---|
| **Alors** | la règle est enregistrée pour la `classe` concernée et propagée automatiquement aux sous-`classes` qui n'ont pas de règle propre. |

---

**Code source :** `owl_editor.js` → `setDisplayProp()`, `_openDisplayPropModal()`, `_getEffectiveDisplayProp()` — `_openDisplayPropModal()` liste toutes les propriétés disponibles pour la classe sélectionnée (annotations, propriétés héritées, directes et via domaine), avec un marquage `(inherited)` pour celles actives par héritage. `setDisplayProp()` enregistre (ou supprime si `null`) la règle dans `_displayProps[classId || '__root__']`. `_getEffectiveDisplayProp()` remonte récursivement la hiérarchie de classes pour déterminer la règle applicable à un individual donné.

### REQ-IND-028 — Règle d'affichage composite (multi-propriétés avec séparateur)

| **Si** | l'ontologiste souhaite composer le label d'affichage des `individuals` à partir de plusieurs `propriétés`, |
|---|---|
| **Alors** | il peut définir une règle composite associant plusieurs `propriétés` avec des séparateurs personnalisés, et ajouter autant de lignes que nécessaire. |

| **Si** | l'ontologiste confirme la règle composite, |
|---|---|
| **Alors** | la règle est enregistrée pour la `classe` concernée et propagée aux sous-`classes` sans règle propre, de la même façon que la règle simple. |

---

**Code source :** `owl_editor.js` → `_openDisplayPropsMultiModal()`, `_addDisplayMultiRow()`, `_confirmDisplayMulti()`, `setDisplayPropsMulti()`, `_getEffectiveDisplayMulti()` — `_openDisplayPropsMultiModal()` affiche un modal avec des lignes `{séparateur, propriété}` éditables. `_addDisplayMultiRow()` insère une ligne vide. `_confirmDisplayMulti()` appelle `setDisplayPropsMulti()` qui sauvegarde la règle dans `_displayPropsMulti[classId || '__root__']` (ou la supprime si `null`/vide). `_getEffectiveDisplayMulti()` remonte la hiérarchie de classes de manière analogue à `_getEffectiveDisplayProp()`.

### REQ-IND-029 — Résolution du label d'affichage par héritage de classe

| **Si** | l'application doit afficher le nom d'un `individual`, |
|---|---|
| **Alors** | elle recherche la règle d'affichage la plus pertinente selon la hiérarchie de `classes` : d'abord les types propres de l'`individual`, puis la `classe` de contexte sélectionnée, puis la règle racine globale ; la règle composite est prioritaire sur la règle simple. |

---

**Code source :** `owl_editor.js` → `_resolveDisplayLabel()` — Pour chaque classe candidate (types propres de l'individual, classe de contexte, `__root__`), vérifie d'abord la règle composite via `_getEffectiveDisplayMulti()` puis la règle simple via `_getEffectiveDisplayProp()`. Construit le label via `_buildMultiLabel()` ou `_getDisplayLabel()` selon le type de règle retenu.

### REQ-IND-030 — Résolution du label rdfs:label multilingue

| **Si** | l'application résout le label d'affichage d'un `individual` à partir de la `propriété` `rdfs:label`, |
|---|---|
| **Alors** | elle respecte les préférences linguistiques de l'ontologiste : la langue demandée est prioritaire, puis les autres langues actives dans l'ordre de préférence, puis n'importe quel label disponible en dernier recours. |

---

**Code source :** `owl_editor.js` → `_getDisplayLabel()` — Pour la forme `rdfs:label@{lang}` : cherche d'abord la langue exacte demandée, puis les autres langues actives (`Settings.activeLangs`) dans l'ordre, puis le premier label disponible. Pour la forme sans langue : utilise `Settings.preferredLang` en priorité, ou le premier label disponible. Supporte également `rdfs:comment`, annotations `other` (par propriété), `dataAssertions` et `objectAssertions` (retourne la cible).

### REQ-IND-031 — Persistance des règles d'affichage dans l'ontologie

| **Si** | les règles d'affichage sont modifiées, |
|---|---|
| **Alors** | elles sont sauvegardées dans l'`ontologie` et restituées à l'identique lors du prochain chargement. |

| **Si** | l'`ontologie` est chargée, |
|---|---|
| **Alors** | les règles d'affichage précédemment définies sont automatiquement restaurées. |

---

**Code source :** `owl_editor.js` → `_saveDisplayRules()`, `_loadDisplayRules()` — `_saveDisplayRules()` construit un objet `{ single: _displayProps, multi: _displayPropsMulti }`, l'envoie via `API.updateDisplayRules()` et met à jour `APP.state.ontology.display_rules` en mémoire. `_loadDisplayRules()` lit `APP.state.ontology?.display_rules` et initialise les deux maps internes `_displayProps` et `_displayPropsMulti`.

### REQ-IND-032 — Génération automatique de l'identifiant d'un nouvel individual

| **Si** | l'ontologiste initie la création d'un nouvel `individual`, que ce soit depuis le formulaire principal ou depuis le sélecteur d'une `propriété`, |
|---|---|
| **Alors** | un identifiant unique et cohérent avec les conventions de l'`ontologie` est proposé automatiquement, sans que l'ontologiste ait à le saisir manuellement. |

---

**Code source :** `owl_editor.js` → `newIndividual()`, `pickerCreateNew()` — Dans les deux cas, après 30 ms (délai permettant l'insertion du DOM), appelle `Settings.generateIndividualId(this._selectedClassId)` pour pré-remplir le champ ID correspondant avec un identifiant généré selon les conventions configurées.

### REQ-IND-037 — Profondeur hiérarchique des classes pour l'ordonnancement

| **Si** | l'application doit ordonner les `propriétés` d'un `individual` selon la hiérarchie de `classes`, |
|---|---|
| **Alors** | les `propriétés` héritées des `classes` les plus générales apparaissent en premier, suivies de celles des `classes` plus spécialisées. |

---

**Code source :** `owl_editor.js` → `_classDepth()` — Calcule la profondeur de chaque classe par BFS itératif en remontant les parents via les relations `subClassOf` (de type string uniquement), avec protection contre les cycles par marquage `visited`. Le résultat est utilisé dans `_getClassProperties()` pour trier les propriétés du plus haut au plus bas dans la hiérarchie.

### REQ-IND-038 — Collecte séparée des propriétés héritées et directes

| **Si** | l'ontologiste consulte le formulaire d'un `individual`, |
|---|---|
| **Alors** | les `propriétés` héritées des `classes` parentes sont distinguées visuellement des `propriétés` définies directement sur les types de l'`individual`, sans duplication. |

---

**Code source :** `owl_editor.js` → `_getClassProperties()` — Analyse les types de l'individual et retourne deux maps : `asserted` (restrictions des types directs, ordonnées par profondeur croissante puis alphabétiquement) et `inherited` (restrictions des ancêtres, sans doublon avec `asserted`). La nature de chaque propriété (`op` ou `dp`) est déterminée en cherchant dans `APP.state.object_properties`. Les panneaux hérités sont affichés avant les directs.

### REQ-IND-039 — Filtre des individuals candidats par range d'une OP

| **Si** | l'ontologiste doit sélectionner une valeur pour une `Object Property`, |
|---|---|
| **Alors** | seuls les `individuals` compatibles avec le domaine de valeurs de cette `propriété` lui sont proposés, à l'exclusion de l'`individual` en cours d'édition ; si aucune contrainte de domaine n'est définie, tous les `individuals` sont proposés. |

---

**Code source :** `owl_editor.js` → `_indsOfRange()` — Retourne la liste des individuals dont au moins un type appartient à l'ensemble calculé (descendants des classes du range inclus via `ClassEditor.buildTree()`), en excluant l'individual en cours d'édition (`_editingId`). Si `rangeClasses` est vide ou null, retourne tous les individuals sauf l'exclu.

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

### REQ-IND-001 — Rendu en trois colonnes

| **Si** | l'ontologiste ouvre l'onglet `Individuals`, |
|---|---|
| **Alors** | l'interface présente trois zones de travail côte à côte : la hiérarchie des `classes`, la liste des `individuals`, et le formulaire de détail ; par défaut, le formulaire invite à sélectionner ou créer un `individual`. |

---

**Code source :** `owl_editor.js` → `renderSplit()` — Génère une mise en page `section-split` à trois colonnes : colonne 1 `ind-tree-panel` (arbre des classes), colonne 2 `ind-list-panel` (liste des individuals), colonne 3 `ind-detail` (formulaire, état vide par défaut). Insère deux séparateurs redimensionnables `ind-split-h1` et `ind-split-h2` entre les colonnes.

### REQ-IND-004 — Sélection d'une classe dans l'arbre

| **Si** | l'ontologiste sélectionne une `classe` dans l'arbre, |
|---|---|
| **Alors** | la liste des `individuals` est filtrée pour n'afficher que ceux appartenant à cette `classe` ou ses sous-`classes`, et le formulaire affiche un état vide invitant à sélectionner ou créer un `individual` dans ce contexte. |

---

**Code source :** `owl_editor.js` → `selectClass()` — Met à jour `_selectedClassId`, réinitialise toutes les sélections d'individuals, actualise le surlignage en colonne 1, met à jour le titre de la colonne 2, régénère la liste filtrée via `_renderIndList()`, affiche un état vide en colonne 3 avec le message `owl:Thing` et un bouton de création.

### REQ-IND-005 — Sélection simple d'un individual

| **Si** | l'ontologiste clique sur un `individual` dans la liste, |
|---|---|
| **Alors** | le formulaire de détail de cet `individual` s'affiche et le bouton de suppression devient actif. |

---

**Code source :** `owl_editor.js` → `selectIndividual()` — Initialise `_selectedIndIds` avec le seul identifiant cliqué, positionne le point d'ancrage `_anchorIndId`, affiche le formulaire via `renderForm()` en colonne 3, active le bouton de suppression via `_setDelBtn()`.

### REQ-IND-006 — Sélection multiple par Shift+Clic

| **Si** | l'ontologiste clique sur un `individual` en maintenant la touche Maj et qu'un point d'ancrage existe, |
|---|---|
| **Alors** | tous les `individuals` compris entre l'ancre et l'item cliqué sont sélectionnés ; si la sélection compte plus d'un `individual`, le formulaire affiche un résumé indiquant le nombre d'`individuals` sélectionnés avec une option de suppression groupée. |

---

**Code source :** `owl_editor.js` → `selectIndividual()` — Calcule la plage d'indices entre `_anchorIndId` et l'item cliqué dans la liste DOM, sélectionne tous les items intermédiaires dans `_selectedIndIds`. Si la sélection dépasse un individual, affiche `N individuals selected` en colonne 3 avec un bouton de suppression groupée et met `_editingId` à `null`.

### REQ-IND-008 — Annulation du formulaire de création

| **Si** | l'ontologiste annule la création d'un nouvel `individual`, |
|---|---|
| **Alors** | le formulaire se ferme, la liste revient à son état précédent et l'interface retrouve son état de repos. |

---

**Code source :** `owl_editor.js` → `_cancelForm()` — Réinitialise toutes les variables de sélection et d'édition, supprime le placeholder fantôme de la liste, restaure l'état vide en colonne 3 avec le message de démarrage et le bouton de création.

### REQ-IND-011 — Formulaire de détail d'un individual

| **Si** | un `individual` est sélectionné ou en cours de création, |
|---|---|
| **Alors** | le formulaire affiche toutes ses informations éditables : identifiant, annotations, types, et panneaux de `propriétés` ; pour un `individual` existant, les entités qui le référencent sont également affichées en bas du formulaire. |

---

**Code source :** `owl_editor.js` → `renderForm()` — Génère le formulaire complet avec : champ ID (sanitisation en temps réel via `_sanitizeId()`), section Annotations, section Types (`rdf:type`), panneaux de propriétés dynamiques via `_getClassProperties()` et `_renderPropPanel()`. Pour un individual existant, insère `_whereUsedFrame()` en bas. Pour un nouvel individual, le champ ID déclenche `save(true)` au `blur`.

### REQ-IND-012 — Identifiant IRI affiché dans l'en-tête du formulaire

| **Si** | l'`ontologie` possède un IRI de base et que l'`individual` a un identifiant, |
|---|---|
| **Alors** | l'IRI complet de l'`individual` est affiché dans l'en-tête du formulaire pour permettre à l'ontologiste de l'identifier sans ambiguïté ; cette information n'est pas affichée pour les nouveaux `individuals` non encore enregistrés. |

---

**Code source :** `owl_editor.js` → `renderForm()` — Si `APP.state.ontology?.id` est défini et que l'individual a un identifiant, affiche `{baseIri}#{id}` dans l'élément `cls-editor-iri` de l'en-tête. La ligne n'est pas affichée pour les nouveaux individuals (IRI vide).

### REQ-IND-013 — Annotations : labels et commentaires

| **Si** | le formulaire est affiché, les annotations existantes sont présentées en lignes éditables. **Si** l'ontologiste ajoute une annotation, |
|---|---|
| **Alors** | une nouvelle ligne est insérée dynamiquement dans le tableau des annotations, avec sauvegarde automatique si l'`individual` est déjà enregistré. |

| **Si** | l'ontologiste supprime une annotation, |
|---|---|
| **Alors** | la ligne est retirée et la sauvegarde est déclenchée automatiquement. |

---

**Code source :** `owl_editor.js` → `renderForm()`, `addAnnotRow()`, `removeAnnotRow()` — Les annotations existantes (`labels`, `comments`, `other`) sont rendues via `_annoRow()`. `addAnnotRow()` insère une nouvelle ligne via `_makeAnnotRow()` dans `ind-annotations-body`, avec `onchange` activé pour l'autoSave si `_editingId !== null`. `removeAnnotRow()` supprime la ligne DOM et déclenche `autoSave()`.

### REQ-IND-014 — Annotations de propriétés personnalisées

| **Si** | l'ontologiste sélectionne une `AnnotationProperty` personnalisée dans le sélecteur dédié, |
|---|---|
| **Alors** | une ligne d'annotation pour cette `propriété` est ajoutée au formulaire et le sélecteur se referme. |

---

**Code source :** `owl_editor.js` → `addOtherAnnotRow()` — Ajoute une ligne d'annotation `other` dans le tableau des annotations en utilisant la propriété passée en paramètre (lue depuis `ind-anno-picker`), puis masque le sélecteur.

### REQ-IND-016 — Panneaux de propriétés dynamiques (Object Properties)

| **Si** | l'ontologiste consulte le formulaire d'un `individual` qui possède des `Object Properties`, |
|---|---|
| **Alors** | chaque `Object Property` est présentée dans un panneau dédié affichant les `individuals` cibles déjà assignés, avec la possibilité de naviguer vers chacun d'eux, d'ajouter de nouvelles relations ou d'en supprimer. |

---

**Code source :** `owl_editor.js` → `_renderPropPanel()`, `addPropValue()` — Pour chaque propriété `op`, génère un panneau listant les `objectAssertions` existantes avec le label de la cible via `_labelForId()`, un lien de navigation et un bouton de suppression. `addPropValue()` (pour `kind='op'`) construit un `<select>` peuplé par `_indsOfRange()` filtré sur le range effectif de la propriété.

### REQ-IND-017 — Panneaux de propriétés dynamiques (Datatype Properties)

| **Si** | l'ontologiste consulte le formulaire d'un `individual` qui possède des `Datatype Properties`, |
|---|---|
| **Alors** | chaque `Datatype Property` est présentée dans un panneau dédié affichant les valeurs déjà saisies avec leur type de données, avec la possibilité d'ajouter de nouvelles valeurs ou d'en supprimer ; les valeurs de type URL sont présentées comme des liens cliquables. |

---

**Code source :** `owl_editor.js` → `_renderPropPanel()`, `addPropValue()` — Pour chaque propriété `dp`, génère un panneau listant les `dataAssertions` existantes avec un champ texte éditable, le datatype (`xsd:string` par défaut ou premier range de la propriété) et un bouton de suppression. Si la valeur correspond à `/^https?:\/\//i`, insère un lien `🔗` cliquable. `addPropValue()` (pour `kind='dp'`) crée un champ texte vide avec le datatype par défaut.

### REQ-IND-019 — Ouverture du sélecteur d'individual pour une Object Property

| **Si** | l'ontologiste souhaite assigner un `individual` à une `Object Property`, |
|---|---|
| **Alors** | un sélecteur s'ouvre avec l'arbre des `classes` et la liste des `individuals` compatibles avec le domaine de valeurs de la `propriété`. |

| **Si** | l'ontologiste sélectionne une `classe` dans le sélecteur, |
|---|---|
| **Alors** | la liste des `individuals` est filtrée pour cette `classe` et ses sous-`classes`, en excluant l'`individual` en cours d'édition. |

| **Si** | l'ontologiste sélectionne un `individual` dans le sélecteur, |
|---|---|
| **Alors** | le bouton de confirmation devient actif. |

| **Si** | l'ontologiste confirme son choix, |
|---|---|
| **Alors** | l'`individual` sélectionné est ajouté comme valeur de la `propriété` dans le formulaire. |

| **Si** | l'ontologiste ferme le sélecteur sans confirmer, |
|---|---|
| **Alors** | le sélecteur disparaît sans modification. |

---

**Code source :** `owl_editor.js` → `openPicker()`, `pickerSelectClass()`, `pickerSelectInd()`, `confirmPicker()`, `closePicker()` — `openPicker()` affiche un modal overlay avec deux panneaux (arbre des classes filtrées selon `effectiveRange`, ou toutes les classes si aucun range ; liste des individuals). `pickerSelectClass()` filtre la liste par descendance transitive en excluant `_editingId`. `pickerSelectInd()` active le bouton OK. `confirmPicker()` insère l'individual choisi comme nouvelle ligne dans le panneau de la propriété (bloque si mode `single` et valeur déjà présente). `closePicker()` supprime l'overlay du DOM.

### REQ-IND-033 — Navigation vers un individual cible depuis une Object Property

| **Si** | un panneau d'`Object Property` affiche des `individuals` cibles, |
|---|---|
| **Alors** | chaque valeur est cliquable et permet de naviguer directement vers le formulaire de l'`individual` cible. |

---

**Code source :** `owl_editor.js` → `_renderPropPanel()` — Chaque valeur d'assertion d'objet est rendue avec un lien `onclick="APP.navigateTo('individuals','${a.target}')"` permettant la navigation directe. Ce lien est également généré après sélection via `confirmPicker()`.

### REQ-IND-040 — Sélection complète d'un individual lors d'une navigation inter-onglets

| **Si** | l'ontologiste navigue vers un `individual` depuis l'extérieur de l'onglet `Individuals` — clic sur un `individual` dans le tableau de résultats Queries, lien d'entité inter-onglets (`APP.navigateTo`), navigation arrière/avant de l'historique (`APP._restoreState`) ou restauration annuler/rétablir, |
|---|---|
| **Alors** | l'`individual` ciblé est sélectionné de bout en bout dans les trois colonnes : sa `classe` représentative est sélectionnée dans l'arbre (colonne 1), la liste filtrée des `individuals` est reconstruite (colonne 2), l'`individual` lui-même est surligné et son formulaire est affiché (colonne 3), et l'item est défilé pour être visible. |

---

**Code source :** `owl_editor.js` → `focusIndividual(id, _hist)` — (1) détermine la `classe` représentative de l'individual — son premier `rdf:type` réel (hors `owl:NamedIndividual`), ou « All Individuals » si aucun — et appelle `selectClass()` qui surligne la classe et reconstruit la liste filtrée (colonne 2) ; (2) appelle `selectIndividual()` pour surligner l'individual (colonne 2) et afficher son formulaire (colonne 3) ; (3) défile l'item pour le rendre visible dans la colonne 2. Auparavant, seul le formulaire de détail (colonne 3) était mis à jour : l'arbre des classes et la liste des individuals ne reflétaient pas la sélection. Le paramètre `_hist` évite de pousser deux fois dans l'historique de navigation lors des opérations de restauration.

### REQ-IND-034 — Lien cliquable pour les valeurs de données de type URL

| **Si** | la valeur d'une `DatatypeProperty` est une URL, |
|---|---|
| **Alors** | un lien cliquable est affiché à côté de la valeur pour l'ouvrir directement dans un nouvel onglet. |

---

**Code source :** `owl_editor.js` → `_renderPropPanel()` — Si la valeur correspond à l'expression régulière `/^https?:\/\//i`, insère un lien `<a>` avec l'icône `🔗` à droite du champ texte, avec l'attribut `target="_blank"`.

### REQ-IND-035 — Panneau "Where Used" dans le formulaire

| **Si** | l'ontologiste consulte le formulaire d'un `individual` existant, |
|---|---|
| **Alors** | une section en bas du formulaire liste les autres entités de l'`ontologie` qui référencent cet `individual`. |

---

**Code source :** `owl_editor.js` → `renderForm()` — Appelle `_whereUsedFrame(r => _ruleUsesIndividual(r, ind.id))` et insère le résultat en bas du formulaire, listant les règles SWRL ou autres entités qui référencent l'individual par son identifiant.

### REQ-IND-036 — Redimensionnement des colonnes par glisser-déposer

| **Si** | l'ontologiste fait glisser un séparateur entre deux colonnes, |
|---|---|
| **Alors** | la largeur des colonnes adjacentes s'ajuste en temps réel, dans des limites garantissant la lisibilité de chaque zone. |

---

*Document généré par analyse statique du code source de `owl_editor.js` — aucune fonctionnalité extrapolée.*

**Code source :** `owl_editor.js` → `_initHandle()`, `_initSplitPanes()` — `_initHandle()` gère les événements `mousedown`/`mousemove`/`mouseup` sur `document` pour ajuster en temps réel la largeur CSS du panneau adjacent. Limites : `ind-split-h1` / `ind-tree-panel` entre 120 et 520 px ; `ind-split-h2` / `ind-list-panel` entre 100 et 400 px.

---

*— claude-sonnet-4-6*
