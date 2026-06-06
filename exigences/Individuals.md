J'ai maintenant suffisamment de données pour produire le document d'exigences. Voici le document Markdown complet :

---

# Exigences dérivées du code source — Onglet Individuals

**Date :** 2026-06-06
**Application :** SWOWL — éditeur d'ontologies OWL
**Note :** Exigences dérivées **strictement** du code source. Chaque exigence cite la fonction JavaScript qui l'implémente. Aucune extrapolation.

---

## Table des matières

1. [REQ-IND-001 — Rendu en trois colonnes](#req-ind-001-rendu-en-trois-colonnes)
2. [REQ-IND-002 — Arbre de classes avec compteurs transitifs](#req-ind-002-arbre-de-classes-avec-compteurs-transitifs)
3. [REQ-IND-003 — Liste des individuals filtrée et triée](#req-ind-003-liste-des-individuals-filtrée-et-triée)
4. [REQ-IND-004 — Sélection d'une classe dans l'arbre](#req-ind-004-sélection-dune-classe-dans-larbre)
5. [REQ-IND-005 — Sélection simple d'un individual](#req-ind-005-sélection-simple-dun-individual)
6. [REQ-IND-006 — Sélection multiple par Shift+Clic](#req-ind-006-sélection-multiple-par-shiftclic)
7. [REQ-IND-007 — Création d'un nouvel individual](#req-ind-007-création-dun-nouvel-individual)
8. [REQ-IND-008 — Annulation du formulaire de création](#req-ind-008-annulation-du-formulaire-de-création)
9. [REQ-IND-009 — Suppression d'un ou plusieurs individuals](#req-ind-009-suppression-dun-ou-plusieurs-individuals)
10. [REQ-IND-010 — Déplacement par glisser-déposer vers une classe](#req-ind-010-déplacement-par-glisser-déposer-vers-une-classe)
11. [REQ-IND-011 — Formulaire de détail d'un individual](#req-ind-011-formulaire-de-détail-dun-individual)
12. [REQ-IND-012 — Identifiant IRI affiché dans l'en-tête du formulaire](#req-ind-012-identifiant-iri-affiché-dans-len-tête-du-formulaire)
13. [REQ-IND-013 — Annotations : labels et commentaires](#req-ind-013-annotations-labels-et-commentaires)
14. [REQ-IND-014 — Annotations de propriétés personnalisées](#req-ind-014-annotations-de-propriétés-personnalisées)
15. [REQ-IND-015 — Gestion des types (rdf:type)](#req-ind-015-gestion-des-types-rdftype)
16. [REQ-IND-016 — Panneaux de propriétés dynamiques (Object Properties)](#req-ind-016-panneaux-de-propriétés-dynamiques-object-properties)
17. [REQ-IND-017 — Panneaux de propriétés dynamiques (Datatype Properties)](#req-ind-017-panneaux-de-propriétés-dynamiques-datatype-properties)
18. [REQ-IND-018 — Gestion de la cardinalité fonctionnelle des propriétés](#req-ind-018-gestion-de-la-cardinalité-fonctionnelle-des-propriétés)
19. [REQ-IND-019 — Ouverture du sélecteur d'individual pour une Object Property](#req-ind-019-ouverture-du-sélecteur-dindividual-pour-une-object-property)
20. [REQ-IND-020 — Création d'un individual à la volée depuis le sélecteur](#req-ind-020-création-dun-individual-à-la-volée-depuis-le-sélecteur)
21. [REQ-IND-021 — Sauvegarde automatique (autoSave)](#req-ind-021-sauvegarde-automatique-autosave)
22. [REQ-IND-022 — Sauvegarde explicite : création et mise à jour](#req-ind-022-sauvegarde-explicite-création-et-mise-à-jour)
23. [REQ-IND-023 — Suppression unitaire d'un individual depuis le formulaire](#req-ind-023-suppression-unitaire-dun-individual-depuis-le-formulaire)
24. [REQ-IND-024 — Préservation de sameAs et differentFrom lors de la sauvegarde](#req-ind-024-préservation-de-sameas-et-differentfrom-lors-de-la-sauvegarde)
25. [REQ-IND-025 — Collecte des assertions d'objet depuis les panneaux](#req-ind-025-collecte-des-assertions-dobjet-depuis-les-panneaux)
26. [REQ-IND-026 — Collecte des assertions de données depuis les panneaux](#req-ind-026-collecte-des-assertions-de-données-depuis-les-panneaux)
27. [REQ-IND-027 — Règle d'affichage simple (propriété unique)](#req-ind-027-règle-daffichage-simple-propriété-unique)
28. [REQ-IND-028 — Règle d'affichage composite (multi-propriétés avec séparateur)](#req-ind-028-règle-daffichage-composite-multi-propriétés-avec-séparateur)
29. [REQ-IND-029 — Résolution du label d'affichage par héritage de classe](#req-ind-029-résolution-du-label-daffichage-par-héritage-de-classe)
30. [REQ-IND-030 — Résolution du label rdfs:label multilingue](#req-ind-030-résolution-du-label-rdfslabel-multilingue)
31. [REQ-IND-031 — Persistance des règles d'affichage dans l'ontologie](#req-ind-031-persistance-des-règles-daffichage-dans-lontologie)
32. [REQ-IND-032 — Génération automatique de l'identifiant d'un nouvel individual](#req-ind-032-génération-automatique-de-lidentifiant-dun-nouvel-individual)
33. [REQ-IND-033 — Navigation vers un individual cible depuis une Object Property](#req-ind-033-navigation-vers-un-individual-cible-depuis-une-object-property)
34. [REQ-IND-034 — Lien cliquable pour les valeurs de données de type URL](#req-ind-034-lien-cliquable-pour-les-valeurs-de-données-de-type-url)
35. [REQ-IND-035 — Panneau "Where Used" dans le formulaire](#req-ind-035-panneau-where-used-dans-le-formulaire)
36. [REQ-IND-036 — Redimensionnement des colonnes par glisser-déposer](#req-ind-036-redimensionnement-des-colonnes-par-glisser-déposer)
37. [REQ-IND-037 — Profondeur hiérarchique des classes pour l'ordonnancement](#req-ind-037-profondeur-hiérarchique-des-classes-pour-lordonnancement)
38. [REQ-IND-038 — Collecte séparée des propriétés héritées et directes](#req-ind-038-collecte-séparée-des-propriétés-héritées-et-directes)
39. [REQ-IND-039 — Filtre des individuals candidats par range d'une OP](#req-ind-039-filtre-des-individuals-candidats-par-range-dune-op)

---

### REQ-IND-001 — Rendu en trois colonnes

**Code source :** `owl_editor.js` → `renderSplit()`

La méthode génère le HTML complet de l'onglet sous forme d'une mise en page `section-split` à trois colonnes : (1) arbre des classes (`ind-tree-panel`), (2) liste des individuals (`ind-list-panel`), (3) panneau de détail/formulaire (`ind-detail`). Les deux séparateurs redimensionnables (`ind-split-h1`, `ind-split-h2`) sont insérés entre les colonnes. La colonne (3) affiche par défaut un état vide invitant à sélectionner ou créer un individual.

---

### REQ-IND-002 — Arbre de classes avec compteurs transitifs

**Code source :** `owl_editor.js` → `_renderClassTree()`

La méthode construit l'arbre des classes OWL via `ClassEditor.buildTree()`. Elle affiche en tête le nœud `owl:Thing` avec le nombre total d'individuals. Pour chaque classe, elle calcule un compteur **transitif** : le nombre d'individuals dont au moins un type appartient à l'ensemble des descendants de cette classe (calculé par BFS via `allDescendants()`). L'indentation est proportionnelle à la profondeur (`depth * 16 + 6` px). Chaque nœud est cible d'un drop zone pour le glisser-déposer.

---

### REQ-IND-003 — Liste des individuals filtrée et triée

**Code source :** `owl_editor.js` → `_renderIndList()`

La méthode filtre les individuals selon la classe sélectionnée (`_selectedClassId`). Si aucune classe n'est sélectionnée, tous les individuals sont affichés. Si une classe est sélectionnée, le filtre est **transitif** : il inclut les individuals dont un type appartient à la classe ou à l'une de ses sous-classes (BFS). La liste est triée alphabétiquement par le label d'affichage résolu (`_resolveDisplayLabel()`), ou par l'identifiant si aucun label n'est défini. Chaque item affiche le label principal et, si distinct, l'identifiant en sous-texte. Chaque item est draggable.

---

### REQ-IND-004 — Sélection d'une classe dans l'arbre

**Code source :** `owl_editor.js` → `selectClass()`

Au clic sur une classe, la méthode met à jour `_selectedClassId`, réinitialise toutes les sélections d'individuals, actualise le surlignage dans la colonne 1, met à jour le titre de la colonne 2 et regénère la liste filtrée (`_renderIndList()`). La colonne 3 affiche un état vide avec le message `owl:Thing` et un bouton de création.

---

### REQ-IND-005 — Sélection simple d'un individual

**Code source :** `owl_editor.js` → `selectIndividual()`

Au clic simple sur un individual (sans Shift), la méthode initialise `_selectedIndIds` avec l'unique identifiant cliqué, positionne le point d'ancrage (`_anchorIndId`), et affiche le formulaire de l'individual via `renderForm()` dans la colonne 3. Elle active le bouton de suppression (`_setDelBtn()`).

---

### REQ-IND-006 — Sélection multiple par Shift+Clic

**Code source :** `owl_editor.js` → `selectIndividual()`

Lorsque `isShift === true` et qu'un point d'ancrage existe, la méthode calcule la plage d'indices entre l'ancre et l'item cliqué dans la liste DOM, et sélectionne tous les items intermédiaires. Si la sélection dépasse un individual, la colonne 3 affiche un résumé `N individuals selected` avec un bouton de suppression groupée, et `_editingId` est mis à `null` (pas d'autoSave).

---

### REQ-IND-007 — Création d'un nouvel individual

**Code source :** `owl_editor.js` → `newIndividual()`

La méthode vide la sélection courante, insère un placeholder fantôme `new individual…` en tête de la liste (colonne 2), et affiche dans la colonne 3 le formulaire vierge via `renderForm(null, selectedClassId)`. Un `setTimeout` de 30 ms appelle `Settings.generateIndividualId()` pour pré-remplir le champ ID, puis donne le focus à ce champ et sélectionne son contenu.

---

### REQ-IND-008 — Annulation du formulaire de création

**Code source :** `owl_editor.js` → `_cancelForm()`

La méthode réinitialise toutes les variables de sélection et d'édition, supprime le placeholder fantôme de la liste, et restaure dans la colonne 3 l'état vide avec le message de démarrage et le bouton de création.

---

### REQ-IND-009 — Suppression d'un ou plusieurs individuals

**Code source :** `owl_editor.js` → `deleteSelected()`

La méthode récupère l'ensemble des IDs sélectionnés (`_selectedIndIds`), affiche une confirmation via `UI.confirm()` (message au singulier ou au pluriel), puis appelle `API.deleteIndividual()` en boucle pour chaque ID. En cas de succès, elle réinitialise toute la sélection, rafraîchit l'état via `APP.refresh()`, et regénère les colonnes 1 et 2. La colonne 3 affiche un état vide.

---

### REQ-IND-010 — Déplacement par glisser-déposer vers une classe

**Code source :** `owl_editor.js` → `_onClassDrop()`

Lors du dépôt d'un individual sur un nœud de classe, la méthode applique l'une des trois logiques suivantes : (a) si la classe source est connue et présente dans les types de l'individual, elle **remplace** ce type par la classe cible ; (b) si l'individual n'a qu'un seul type, celui-ci est remplacé ; (c) sinon, la classe cible est **ajoutée** aux types existants (sans doublon). La modification est envoyée via `API.updateIndividual()`, puis la section est re-rendue et l'individual reste sélectionné.

---

### REQ-IND-011 — Formulaire de détail d'un individual

**Code source :** `owl_editor.js` → `renderForm()`

La méthode génère le formulaire complet d'un individual (existant ou nouveau). Elle construit les blocs : (1) champ ID avec sanitisation en temps réel (`_sanitizeId()`), (2) section Annotations, (3) section Types (`rdf:type`), (4) panneaux de propriétés dynamiques via `_getClassProperties()` et `_renderPropPanel()`. Pour un individual existant, un bloc `_whereUsedFrame()` est ajouté en bas. Pour un nouvel individual, le champ ID déclenche `save(true)` au `blur`.

---

### REQ-IND-012 — Identifiant IRI affiché dans l'en-tête du formulaire

**Code source :** `owl_editor.js` → `renderForm()`

Si l'ontologie possède un IRI de base (`APP.state.ontology?.id`) et que l'individual a un identifiant, le formulaire affiche l'IRI complet sous la forme `{baseIri}#{id}` dans un élément `cls-editor-iri`. Cette ligne n'est pas affichée pour les nouveaux individuals (IRI vide).

---

### REQ-IND-013 — Annotations : labels et commentaires

**Code source :** `owl_editor.js` → `renderForm()`, `addAnnotRow()`, `removeAnnotRow()`

`renderForm()` affiche les annotations existantes (`labels`, `comments`, `other`) via `_annoRow()`. `addAnnotRow()` ajoute dynamiquement une nouvelle ligne dans `ind-annotations-body` via `_makeAnnotRow()`, en activant l'`onchange` pour l'autoSave si l'individual est en cours d'édition. `removeAnnotRow()` supprime la ligne DOM et déclenche l'autoSave.

---

### REQ-IND-014 — Annotations de propriétés personnalisées

**Code source :** `owl_editor.js` → `addOtherAnnotRow()`

La méthode ajoute une ligne d'annotation `other` dans le tableau des annotations, en utilisant la propriété passée en paramètre, puis masque le sélecteur `ind-anno-picker`.

---

### REQ-IND-015 — Gestion des types (rdf:type)

**Code source :** `owl_editor.js` → `addType()`, `removeType()`

`addType()` appelle `_addListItem()` pour insérer un type dans la liste `ind-types-list` et déclenche l'autoSave si l'individual est en cours d'édition. `removeType()` appelle `_removeListItem()` pour retirer le type ; si la liste devient vide, le placeholder `owl:NamedIndividual` est réinséré. L'autoSave est déclenché dans les deux cas.

---

### REQ-IND-016 — Panneaux de propriétés dynamiques (Object Properties)

**Code source :** `owl_editor.js` → `_renderPropPanel()`, `addPropValue()`

`_renderPropPanel()` génère un panneau par propriété de type `op`. Pour chaque `objectAssertion` existante, il rend une ligne avec le label de la cible (via `_labelForId()`), un lien de navigation vers l'individual cible, et un bouton de suppression. `addPropValue()` (pour `kind='op'`) construit un `<select>` peuplé par `_indsOfRange()` filtré sur le range effectif de la propriété.

---

### REQ-IND-017 — Panneaux de propriétés dynamiques (Datatype Properties)

**Code source :** `owl_editor.js` → `_renderPropPanel()`, `addPropValue()`

`_renderPropPanel()` génère un panneau par propriété de type `dp`. Pour chaque `dataAssertion` existante, il rend un champ texte éditable avec la valeur, le datatype (`xsd:string` par défaut ou le premier range de la propriété), et un bouton de suppression. Si la valeur est une URL (`/^https?:\/\//i`), un lien `🔗` cliquable est affiché. `addPropValue()` (pour `kind='dp'`) crée un champ texte vide avec le datatype par défaut.

---

### REQ-IND-018 — Gestion de la cardinalité fonctionnelle des propriétés

**Code source :** `owl_editor.js` → `_renderPropPanel()`, `_refreshAddBtn()`, `confirmPicker()`

`_renderPropPanel()` détermine la multiplicité (`single`/`multiple`) selon `opData?.characteristics?.functional` ou `dpData?.functional`. Si `single=true` et qu'une valeur existe déjà, le bouton `+` est masqué (`addBtnHidden`). `_refreshAddBtn()` actualise la visibilité du bouton après chaque ajout/suppression. `confirmPicker()` bloque l'insertion si le panneau est `single` et contient déjà une valeur.

---

### REQ-IND-019 — Ouverture du sélecteur d'individual pour une Object Property

**Code source :** `owl_editor.js` → `openPicker()`, `pickerSelectClass()`, `pickerSelectInd()`, `confirmPicker()`, `closePicker()`

`openPicker()` ouvre un modal overlay avec deux panneaux : arbre des classes autorisées (filtrées selon le `effectiveRange` de la propriété, ou toutes les classes si aucun range) et liste des individuals. `pickerSelectClass()` met à jour la liste des individuals de la classe sélectionnée (filtrage transitif), exclut l'individual en cours d'édition. `pickerSelectInd()` active le bouton OK. `confirmPicker()` insère l'individual choisi comme nouvelle ligne dans le panneau de la propriété. `closePicker()` supprime l'overlay du DOM.

---

### REQ-IND-020 — Création d'un individual à la volée depuis le sélecteur

**Code source :** `owl_editor.js` → `pickerCreateNew()`, `_pickerConfirmNew()`

`pickerCreateNew()` insère un champ de saisie inline dans la liste du sélecteur (un seul champ à la fois). Il pré-remplit l'ID via `Settings.generateIndividualId()`, gère les touches `Enter` (confirmation) et `Escape` (annulation). `_pickerConfirmNew()` crée l'individual via `API.createIndividual()` avec les types initiaux correspondant à la classe sélectionnée dans le picker, puis rafraîchit la liste et sélectionne le nouvel individual.

---

### REQ-IND-021 — Sauvegarde automatique (autoSave)

**Code source :** `owl_editor.js` → `autoSave()`

La méthode appelle `save(false)` uniquement si `_editingId !== null`, c'est-à-dire uniquement lorsqu'un individual existant est en cours d'édition. Elle est déclenchée via `onchange` sur tous les champs du formulaire d'un individual existant.

---

### REQ-IND-022 — Sauvegarde explicite : création et mise à jour

**Code source :** `owl_editor.js` → `save()`

La méthode collecte l'ID (avec remplacement des espaces par des underscores), les annotations via `_collectAnnotations()`, les types via `_collectList()`, les `objectAssertions` et `dataAssertions` depuis les panneaux DOM. Si `isNew=true`, elle appelle `API.createIndividual()`, met à jour `_selectedIndId` et `_editingId`, et re-rend les trois colonnes. Si `isNew=false`, elle appelle `API.updateIndividual(originalId, ind)` — si l'ID a changé, un message de renommage est affiché. Dans les deux cas, `APP.refresh()` est appelé pour synchroniser l'état.

---

### REQ-IND-023 — Suppression unitaire d'un individual depuis le formulaire

**Code source :** `owl_editor.js` → `delete()`

La méthode affiche une confirmation `UI.confirm()`, appelle `API.deleteIndividual()`, puis, si l'individual supprimé était sélectionné (`_selectedIndId === id`), réinitialise `_selectedIndId` et `_editingId` et restaure l'état vide de la colonne 3. Elle regénère ensuite les colonnes 1 et 2.

---

### REQ-IND-024 — Préservation de sameAs et differentFrom lors de la sauvegarde

**Code source :** `owl_editor.js` → `save()`

La méthode `save()` récupère les valeurs existantes de `sameAs` et `differentFrom` depuis `APP.state.individuals` (via l'ID original ou le nouvel ID) et les inclut systématiquement dans l'objet envoyé à l'API. Ces deux champs ne sont pas éditables via l'interface du formulaire principal : ils sont seulement conservés.

---

### REQ-IND-025 — Collecte des assertions d'objet depuis les panneaux

**Code source :** `owl_editor.js` → `save()`

La méthode interroge tous les éléments DOM `.ind-prop-panel[data-kind="op"]`, lit `panel.dataset.prop` comme identifiant de propriété, et pour chaque `.ind-op-target` (input hidden ou select) dont la valeur est non vide, construit un objet `{ property, target }` qui est ajouté au tableau `objectAssertions`.

---

### REQ-IND-026 — Collecte des assertions de données depuis les panneaux

**Code source :** `owl_editor.js` → `save()`

La méthode interroge tous les éléments DOM `.ind-prop-panel[data-kind="dp"]`, lit `panel.dataset.prop`, et pour chaque `.ind-prop-row` contenant une valeur `.ind-dp-value` non vide, construit un objet `{ property, value, datatype }` — le datatype est lu depuis `dataset.dtype` de l'élément `.ind-dp-type`, avec `xsd:string` comme valeur par défaut.

---

### REQ-IND-027 — Règle d'affichage simple (propriété unique)

**Code source :** `owl_editor.js` → `setDisplayProp()`, `_openDisplayPropModal()`, `_getEffectiveDisplayProp()`

`_openDisplayPropModal()` ouvre un modal listant toutes les propriétés disponibles pour la classe sélectionnée (annotations, propriétés héritées, propriétés directes, propriétés via domaine). Les propriétés déjà actives par héritage sont signalées `(inherited)`. `setDisplayProp()` enregistre (ou supprime si `null`) la règle dans `_displayProps[classId || '__root__']`. `_getEffectiveDisplayProp()` remonte récursivement la hiérarchie de classes pour trouver la règle applicable.

---

### REQ-IND-028 — Règle d'affichage composite (multi-propriétés avec séparateur)

**Code source :** `owl_editor.js` → `_openDisplayPropsMultiModal()`, `_addDisplayMultiRow()`, `_confirmDisplayMulti()`, `setDisplayPropsMulti()`, `_getEffectiveDisplayMulti()`

`_openDisplayPropsMultiModal()` ouvre un modal avec des lignes `{séparateur, propriété}` éditables. `_addDisplayMultiRow()` ajoute une ligne vide dans le modal. `_confirmDisplayMulti()` lit toutes les lignes et appelle `setDisplayPropsMulti()`. `setDisplayPropsMulti()` sauvegarde la règle composite dans `_displayPropsMulti[classId || '__root__']` (ou la supprime si `null`/vide). `_getEffectiveDisplayMulti()` remonte la hiérarchie de classes de manière analogue à `_getEffectiveDisplayProp()`.

---

### REQ-IND-029 — Résolution du label d'affichage par héritage de classe

**Code source :** `owl_editor.js` → `_resolveDisplayLabel()`

La méthode cherche une règle d'affichage applicable selon la priorité suivante : (1) types propres de l'individual, (2) classe de contexte (classe sélectionnée dans l'arbre ou classe du picker), (3) règle racine (`__root__`). Pour chaque classe candidate, elle vérifie d'abord la règle composite (`_getEffectiveDisplayMulti()`) puis la règle simple (`_getEffectiveDisplayProp()`). Le label est construit via `_buildMultiLabel()` ou `_getDisplayLabel()` selon le type de règle.

---

### REQ-IND-030 — Résolution du label rdfs:label multilingue

**Code source :** `owl_editor.js` → `_getDisplayLabel()`

La méthode supporte les formes `rdfs:label` (sans langue) et `rdfs:label@{lang}`. Pour la forme avec langue, elle cherche d'abord la langue exacte demandée, puis les autres langues actives (`Settings.activeLangs`) dans l'ordre, puis le premier label disponible quelle que soit la langue. Pour la forme sans langue, elle utilise `Settings.preferredLang` en priorité, ou le premier label disponible. Elle supporte aussi `rdfs:comment`, les annotations `other` (par propriété), les `dataAssertions` et les `objectAssertions` (retourne la cible).

---

### REQ-IND-031 — Persistance des règles d'affichage dans l'ontologie

**Code source :** `owl_editor.js` → `_saveDisplayRules()`, `_loadDisplayRules()`

`_saveDisplayRules()` construit un objet `{ single: _displayProps, multi: _displayPropsMulti }` et l'envoie via `API.updateDisplayRules()`. Il met aussi à jour `APP.state.ontology.display_rules` en mémoire. `_loadDisplayRules()` lit `APP.state.ontology?.display_rules` et initialise les deux maps internes `_displayProps` et `_displayPropsMulti`.

---

### REQ-IND-032 — Génération automatique de l'identifiant d'un nouvel individual

**Code source :** `owl_editor.js` → `newIndividual()`, `pickerCreateNew()`

Dans `newIndividual()`, après affichage du formulaire vierge, un `setTimeout` de 30 ms appelle `Settings.generateIndividualId(this._selectedClassId)` pour pré-remplir le champ `ind-id`. Dans `pickerCreateNew()`, la même méthode est appelée pour pré-remplir le champ de saisie inline du sélecteur.

---

### REQ-IND-033 — Navigation vers un individual cible depuis une Object Property

**Code source :** `owl_editor.js` → `_renderPropPanel()`

Pour les panneaux de type `op`, chaque valeur affichée comporte un `onclick="APP.navigateTo('individuals','${a.target}')"` sur le label du texte, permettant de naviguer directement vers l'individual cible dans l'onglet Individuals. Le même lien est généré dans `confirmPicker()` après sélection via le sélecteur.

---

### REQ-IND-034 — Lien cliquable pour les valeurs de données de type URL

**Code source :** `owl_editor.js` → `_renderPropPanel()`

Pour les panneaux de type `dp`, si la valeur d'une `dataAssertion` correspond à l'expression régulière `/^https?:\/\//i`, un lien `<a>` avec l'icône `🔗` est inséré à droite du champ texte, ouvrant l'URL dans un nouvel onglet (`target="_blank"`).

---

### REQ-IND-035 — Panneau "Where Used" dans le formulaire

**Code source :** `owl_editor.js` → `renderForm()`

Pour un individual existant (`ind` non null), le formulaire appelle `_whereUsedFrame(r => _ruleUsesIndividual(r, ind.id))` et insère le résultat en bas du formulaire. Ce bloc liste les règles SWRL ou autres entités qui référencent l'individual.

---

### REQ-IND-036 — Redimensionnement des colonnes par glisser-déposer

**Code source :** `owl_editor.js` → `_initHandle()`, `_initSplitPanes()`

`_initSplitPanes()` appelle `_initHandle()` deux fois : pour `ind-split-h1` / `ind-tree-panel` (largeur entre 120 et 520 px) et pour `ind-split-h2` / `ind-list-panel` (largeur entre 100 et 400 px). `_initHandle()` attache les écouteurs `mousedown`/`mousemove`/`mouseup` sur `document` et ajuste la largeur CSS du panneau en temps réel.

---

### REQ-IND-037 — Profondeur hiérarchique des classes pour l'ordonnancement

**Code source :** `owl_editor.js` → `_classDepth()`

La méthode calcule la profondeur d'une classe dans la hiérarchie par BFS itératif en remontant les parents (`subClassOf` de type string uniquement). Elle est robuste aux cycles (marquage `visited`). Le résultat est utilisé dans `_getClassProperties()` pour ordonner les propriétés des classes de l'individual du plus haut au plus bas dans la hiérarchie.

---

### REQ-IND-038 — Collecte séparée des propriétés héritées et directes

**Code source :** `owl_editor.js` → `_getClassProperties()`

La méthode analyse les types de l'individual et retourne deux maps : `asserted` (restrictions définies sur les types directs de l'individual, ordonnées par profondeur croissante puis alphabétiquement) et `inherited` (restrictions définies sur les ancêtres, sans doublon avec `asserted`). Elle détermine si chaque propriété est une `op` ou `dp` en cherchant dans `APP.state.object_properties`. Cette séparation est utilisée dans `renderForm()` pour afficher les panneaux hérités avant les directs.

---

### REQ-IND-039 — Filtre des individuals candidats par range d'une OP

**Code source :** `owl_editor.js` → `_indsOfRange()`

La méthode retourne la liste des individuals compatibles avec le range d'une Object Property, en excluant l'individual en cours d'édition. Si `rangeClasses` est vide ou null, tous les individuals (sauf l'exclu) sont retournés. Sinon, le filtre est **transitif** : les descendants des classes du range sont inclus via `ClassEditor.buildTree()`. Seuls les individuals dont au moins un type est dans l'ensemble calculé sont retenus.

---

*Document généré par analyse statique du code source de `owl_editor.js` — aucune fonctionnalité extrapolée.*

---

**claude-sonnet-4-6**
