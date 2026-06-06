# Exigences — DatatypeProperties

> Généré le 2026-06-06 | Dérivé strictement du code source | Aucune hallucination

## Table des matières

### Fond
- [REQ-DP-001 — Initialisation de la liste des types XSD disponibles](#req-dp-001--initialisation-de-la-liste-des-types-xsd-disponibles)
- [REQ-DP-004 — Construction de l'arbre hiérarchique des propriétés](#req-dp-004--construction-de-larbre-hiérarchique-des-propriétés)
- [REQ-DP-005 — Expansion automatique des ancêtres d'une propriété sélectionnée](#req-dp-005--expansion-automatique-des-ancêtres-dune-propriété-sélectionnée)
- [REQ-DP-016 — Création d'une propriété enfant (child)](#req-dp-016--création-dune-propriété-enfant-child)
- [REQ-DP-017 — Création d'une propriété sœur (sibling)](#req-dp-017--création-dune-propriété-sœur-sibling)
- [REQ-DP-018 — Génération d'un nom unique pour une nouvelle propriété](#req-dp-018--génération-dun-nom-unique-pour-une-nouvelle-propriété)
- [REQ-DP-019 — Création effective et navigation vers la nouvelle propriété](#req-dp-019--création-effective-et-navigation-vers-la-nouvelle-propriété)
- [REQ-DP-024 — Dépôt (drop) d'une propriété sur une nouvelle cible](#req-dp-024--dépôt-drop-dune-propriété-sur-une-nouvelle-cible)
- [REQ-DP-025 — Vérification d'un lien ancêtre/descendant pour le drag & drop](#req-dp-025--vérification-dun-lien-ancêtredescendant-pour-le-drag--drop)
- [REQ-DP-030 — Contrôle de l'unicité du range avant ouverture du sélecteur](#req-dp-030--contrôle-de-lunicité-du-range-avant-ouverture-du-sélecteur)
- [REQ-DP-031 — Ajout / suppression d'un domaine](#req-dp-031--ajout--suppression-dun-domaine)
- [REQ-DP-032 — Ajout d'un type XSD comme range (avec unicité)](#req-dp-032--ajout-dun-type-xsd-comme-range-avec-unicité)
- [REQ-DP-033 — Suppression du type XSD du range](#req-dp-033--suppression-du-type-xsd-du-range)
- [REQ-DP-034 — Ajout / suppression d'une super-propriété](#req-dp-034--ajout--suppression-dune-super-propriété)
- [REQ-DP-035 — Sauvegarde automatique lors d'un changement de champ](#req-dp-035--sauvegarde-automatique-lors-dun-changement-de-champ)
- [REQ-DP-036 — Sauvegarde (création ou mise à jour) d'une DatatypeProperty](#req-dp-036--sauvegarde-création-ou-mise-à-jour-dune-datatypeproperty)
- [REQ-DP-037 — Suppression d'une DatatypeProperty avec confirmation](#req-dp-037--suppression-dune-datatypeproperty-avec-confirmation)

### Forme
- [REQ-DP-002 — Génération d'options HTML pour les DatatypeProperties](#req-dp-002--génération-doptions-html-pour-les-datatypeproperties)
- [REQ-DP-003 — Génération d'options HTML pour les types XSD](#req-dp-003--génération-doptions-html-pour-les-types-xsd)
- [REQ-DP-006 — Rendu d'un nœud de l'arbre avec gestion drag & drop](#req-dp-006--rendu-dun-nœud-de-larbre-avec-gestion-drag--drop)
- [REQ-DP-007 — Rendu de l'arbre complet avec racine owl:topDataProperty](#req-dp-007--rendu-de-larbre-complet-avec-racine-owltopdataproperty)
- [REQ-DP-008 — Rendu de la mise en page en deux panneaux (split)](#req-dp-008--rendu-de-la-mise-en-page-en-deux-panneaux-split)
- [REQ-DP-009 — Restauration de la sélection après re-rendu](#req-dp-009--restauration-de-la-sélection-après-re-rendu)
- [REQ-DP-010 — Redimensionnement horizontal du panneau gauche](#req-dp-010--redimensionnement-horizontal-du-panneau-gauche)
- [REQ-DP-011 — Mise à jour du panneau "Super Properties"](#req-dp-011--mise-à-jour-du-panneau-super-properties)
- [REQ-DP-012 — Sélection de la racine owl:topDataProperty](#req-dp-012--sélection-de-la-racine-owltopdataproperty)
- [REQ-DP-013 — Sélection d'une DatatypeProperty dans l'arbre](#req-dp-013--sélection-dune-datatypeproperty-dans-larbre)
- [REQ-DP-014 — Gestion de l'état des boutons de la barre d'outils](#req-dp-014--gestion-de-létat-des-boutons-de-la-barre-doutils)
- [REQ-DP-015 — Expansion / réduction d'un nœud de l'arbre](#req-dp-015--expansion--réduction-dun-nœud-de-larbre)
- [REQ-DP-020 — Affichage du menu contextuel (clic droit)](#req-dp-020--affichage-du-menu-contextuel-clic-droit)
- [REQ-DP-021 — Fermeture du menu contextuel](#req-dp-021--fermeture-du-menu-contextuel)
- [REQ-DP-022 — Démarrage du drag d'une propriété](#req-dp-022--démarrage-du-drag-dune-propriété)
- [REQ-DP-023 — Survol d'une cible lors du drag](#req-dp-023--survol-dune-cible-lors-du-drag)
- [REQ-DP-026 — Rendu du formulaire d'édition d'une DatatypeProperty](#req-dp-026--rendu-du-formulaire-dédition-dune-datatypeproperty)
- [REQ-DP-027 — Ajout d'une ligne d'annotation (label / comment)](#req-dp-027--ajout-dune-ligne-dannotation-label--comment)
- [REQ-DP-028 — Ajout d'une annotation "autre propriété"](#req-dp-028--ajout-dune-annotation-autre-propriété)
- [REQ-DP-029 — Suppression d'une ligne d'annotation](#req-dp-029--suppression-dune-ligne-dannotation)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles OWL, contraintes de données, comportements algorithmiques, validations, persistance.


### REQ-DP-001 — Initialisation de la liste des types XSD disponibles


Le code définit un tableau constant `XSD_TYPES` contenant exactement 12 types XSD utilisables comme range : `xsd:string`, `xsd:integer`, `xsd:decimal`, `xsd:float`, `xsd:double`, `xsd:boolean`, `xsd:date`, `xsd:dateTime`, `xsd:duration`, `xsd:anyURI`, `xsd:nonNegativeInteger`, `xsd:positiveInteger`. Cette liste est la seule référence pour les types de données autorisés dans l'application.

---

**Code source :** `owl_editor.js` → `XSD_TYPES` (constante, lignes 167–171)

### REQ-DP-004 — Construction de l'arbre hiérarchique des propriétés


La méthode `buildTree(props)` calcule la structure parent/enfant à partir du champ `subPropertyOf` de chaque propriété. Elle retourne un objet `{ roots, childrenOf }` où `roots` est la liste triée alphabétiquement des propriétés sans parent, et `childrenOf` est une map de chaque propriété vers ses enfants triés alphabétiquement. Les cycles sont évités : seules les références vers des IDs existants sont prises en compte.

---

**Code source :** `owl_editor.js` → `DPEditor.buildTree()`

### REQ-DP-005 — Expansion automatique des ancêtres d'une propriété sélectionnée


La méthode `_expandAncestors(propId)` parcourt récursivement les parents d'une propriété (via `subPropertyOf`) et ajoute chacun d'eux dans `this._expanded` (Set), de sorte que le chemin depuis la racine jusqu'à la propriété soit entièrement déplié à l'affichage.

---

**Code source :** `owl_editor.js` → `DPEditor._expandAncestors()`

### REQ-DP-016 — Création d'une propriété enfant (child)


La méthode `createChild()` lit `_selectedId` pour déterminer le parent éventuel : si une propriété est sélectionnée, elle devient le parent unique ; sinon la nouvelle propriété est créée à la racine. Elle ajoute le parent au Set `_expanded` pour garantir sa visibilité, puis délègue à `_createAndSelect([parent])`.

---

**Code source :** `owl_editor.js` → `DPEditor.createChild()`

### REQ-DP-017 — Création d'une propriété sœur (sibling)


La méthode `createSibling()` ne s'exécute que si `_selectedId` est défini. Elle récupère les parents (`subPropertyOf`) de la propriété sélectionnée et les passe à `_createAndSelect()`, produisant une nouvelle propriété au même niveau hiérarchique. Chaque parent est ajouté à `_expanded`.

---

**Code source :** `owl_editor.js` → `DPEditor.createSibling()`

### REQ-DP-018 — Génération d'un nom unique pour une nouvelle propriété


La méthode `_generatePropName()` construit un nom en partant de `'NewDatatypeProperty'` et en incrémentant un compteur (`NewDatatypeProperty1`, `NewDatatypeProperty2`, …) jusqu'à trouver un nom absent de la liste des IDs existants dans `APP.state.datatype_properties`.

---

**Code source :** `owl_editor.js` → `DPEditor._generatePropName()`

### REQ-DP-019 — Création effective et navigation vers la nouvelle propriété


La méthode `_createAndSelect(subPropertyOf)` construit un objet propriété avec les valeurs par défaut (`annotations` vides, `domain` vide, `range` vide, `functional: false`) et l'IRI généré par `_generatePropName()`. Elle appelle `API.createDP(prop)`, mémorise l'ID dans `_selectedId` et `_editingId`, puis rafraîchit l'état applicatif via `APP.refresh()` et `APP.renderSection('datatype-properties')`. Les erreurs sont affichées via `UI.error()`.

---

**Code source :** `owl_editor.js` → `DPEditor._createAndSelect()`

### REQ-DP-024 — Dépôt (drop) d'une propriété sur une nouvelle cible


La méthode `onDrop(event, targetId)` déplace une propriété dans la hiérarchie en modifiant son champ `subPropertyOf` : si `targetId` est défini, la nouvelle liste de parents vaut `[targetId]` ; sinon elle est vide (propriété racine). Elle appelle `API.updateDP()` pour persister le changement, affiche un message de succès via `UI.success()`, puis rafraîchit l'affichage. Si la cible est un descendant de la source, l'opération est annulée avec un avertissement `UI.warn('Cannot drop on a descendant — would create a cycle')`.

---

**Code source :** `owl_editor.js` → `DPEditor.onDrop()`

### REQ-DP-025 — Vérification d'un lien ancêtre/descendant pour le drag & drop


La méthode `_isDescendant(potentialDesc, ancestorId)` effectue une traversée récursive en profondeur de l'arbre (via `buildTree()`) depuis `ancestorId` pour déterminer si `potentialDesc` est l'un de ses descendants. Retourne `false` si l'un des deux paramètres est null/undefined.

---

**Code source :** `owl_editor.js` → `DPEditor._isDescendant()`

### REQ-DP-030 — Contrôle de l'unicité du range avant ouverture du sélecteur


La méthode `showPicker(id)` interdit l'ouverture du sélecteur de range (`dp-range-picker`) si la liste `dp-range-list` contient déjà un élément `.cls-list-item[data-id]`, garantissant ainsi qu'une seule valeur XSD peut être définie comme range. Pour les autres sélecteurs, elle délègue à `_togglePicker(id)`.

---

**Code source :** `owl_editor.js` → `DPEditor.showPicker()`

### REQ-DP-031 — Ajout / suppression d'un domaine


`addDomain(id)` appelle `_addListItem()` pour insérer la classe dans `dp-domain-list`, en utilisant le style `cls-dot`, puis déclenche `autoSave()`.
`removeDomain(id)` appelle `_removeListItem()` qui retire l'entrée de `dp-domain-list` et affiche `owl:Thing` comme valeur par défaut si la liste devient vide, puis déclenche `autoSave()`.

---

**Code source :** `owl_editor.js` → `DPEditor.addDomain()` et `DPEditor.removeDomain()`

### REQ-DP-032 — Ajout d'un type XSD comme range (avec unicité)


La méthode `addRange(id)` appelle `_addListItem()` pour insérer le type XSD dans `dp-range-list` avec le style `xsd-dot`, puis masque le bouton `dp-range-btn` pour empêcher l'ajout d'un second type. Elle déclenche ensuite `autoSave()` si une propriété est en cours d'édition.

---

**Code source :** `owl_editor.js` → `DPEditor.addRange()`

### REQ-DP-033 — Suppression du type XSD du range


La méthode `removeRange(id)` appelle `_removeListItem()` pour supprimer le type de `dp-range-list` (la valeur par défaut affichée redevient `rdfs:Literal`), puis réaffiche le bouton `dp-range-btn` pour permettre la sélection d'un nouveau type. Elle déclenche ensuite `autoSave()`.

---

**Code source :** `owl_editor.js` → `DPEditor.removeRange()`

### REQ-DP-034 — Ajout / suppression d'une super-propriété


`addSubProp(id)` insère la propriété choisie dans `dp-sub-list` via `_addListItem()`, avec navigation vers la section `'datatype-properties'` et style `dp-prop-dot`, puis déclenche `autoSave()`.
`removeSubProp(id)` retire l'entrée de `dp-sub-list` via `_removeListItem()`, puis déclenche `autoSave()`.

---

**Code source :** `owl_editor.js` → `DPEditor.addSubProp()` et `DPEditor.removeSubProp()`

### REQ-DP-035 — Sauvegarde automatique lors d'un changement de champ


La méthode `autoSave()` appelle `save(false)` uniquement si `_editingId !== null`, c'est-à-dire si une propriété existante est en cours d'édition. Elle est branchée sur l'événement `onchange` de tous les champs du formulaire lorsqu'une propriété existante est sélectionnée.

---

**Code source :** `owl_editor.js` → `DPEditor.autoSave()`

### REQ-DP-036 — Sauvegarde (création ou mise à jour) d'une DatatypeProperty


La méthode `save(isNew)` collecte toutes les valeurs du formulaire :
- ID via `document.getElementById('dp-id').value`, validé par `_validateId()`.
- Annotations (labels, comments, other) via `_collectAnnotations('dp-annotations-body')`.
- Domain via `_collectList('dp-domain-list')`.
- Range via `_collectList('dp-range-list')`.
- SubPropertyOf via `_collectList('dp-sub-list')`.
- Functional via l'état de la case à cocher `dp-functional`.

En mode création (`isNew === true`), elle appelle `API.createDP(prop)` et affiche un message de succès. En mode mise à jour, elle appelle `API.updateDP(originalId, prop)` et signale un renommage si l'ID a changé. Dans les deux cas, `APP.refresh()` puis `APP.renderSection('datatype-properties')` sont appelés.

---

**Code source :** `owl_editor.js` → `DPEditor.save()`

### REQ-DP-037 — Suppression d'une DatatypeProperty avec confirmation


La méthode `delete(id)` affiche une boîte de dialogue de confirmation via `UI.confirm()`. Si l'utilisateur confirme, elle appelle `API.deleteDP(id)`, affiche un message de succès via `UI.success()`, réinitialise `_selectedId` et `_editingId` à `null`, puis rafraîchit l'affichage via `APP.refresh()` et `APP.renderSection('datatype-properties')`. La méthode publique `deleteSelected()` délègue à `delete(this._selectedId)` si une propriété est sélectionnée.

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

**Code source :** `owl_editor.js` → `DPEditor.delete()`

### REQ-DP-002 — Génération d'options HTML pour les DatatypeProperties


La fonction `dpOptions(selectedId)` parcourt `APP.state.datatype_properties` et produit une chaîne d'éléments `<option>` pour chaque propriété, avec sélection de la valeur correspondant à `selectedId`. Ce résultat est utilisé dans les listes déroulantes d'autres onglets qui référencent une DatatypeProperty.

---

**Code source :** `owl_editor.js` → `dpOptions()`

### REQ-DP-003 — Génération d'options HTML pour les types XSD


La fonction `xsdOptions(selected)` itère sur `XSD_TYPES` et produit des éléments `<option>` HTML. La valeur par défaut du paramètre `selected` est `'xsd:string'`. Cette fonction alimente les sélecteurs XSD dans l'onglet Individuals.

---

**Code source :** `owl_editor.js` → `xsdOptions()`

### REQ-DP-006 — Rendu d'un nœud de l'arbre avec gestion drag & drop


La méthode `_renderNode(id, childrenOf, depth)` génère le HTML d'un nœud de l'arbre. Elle applique un indentation proportionnelle à la profondeur (`depth * 16 + 6` px), affiche un triangle de déplacement si le nœud a des enfants, et branche les handlers `onclick`, `oncontextmenu`, `ondragstart`, `ondragover`, `ondragleave`, `ondrop`, `ondragend` vers les méthodes correspondantes de `DPEditor`.

---

**Code source :** `owl_editor.js` → `DPEditor._renderNode()`

### REQ-DP-007 — Rendu de l'arbre complet avec racine owl:topDataProperty


La méthode `renderTree(props)` appelle `buildTree()` puis `_renderNode()` pour chaque racine. Elle affiche en tête un élément représentant la racine (`owl:topDataProperty` ou `rdf:Property` selon `APP.getOntologyRootLabels()`). Si la liste de propriétés est vide, elle affiche le message `"No DatatypeProperty"`.

---

**Code source :** `owl_editor.js` → `DPEditor.renderTree()`

### REQ-DP-008 — Rendu de la mise en page en deux panneaux (split)


La méthode `renderSplit(props)` génère la structure HTML complète de l'onglet : panneau gauche contenant l'arbre et le sous-panneau "Super Properties", séparateur redimensionnable horizontal (`split-handle`), et panneau droit (`detail-panel`) vide avec un bouton de création. Les boutons "Child", "Sibling" et "Delete" sont rendus désactivés par défaut.

---

**Code source :** `owl_editor.js` → `DPEditor.renderSplit()`

### REQ-DP-009 — Restauration de la sélection après re-rendu


La méthode `restoreSelection()` appelle d'abord `_initSplitPane()` pour ré-attacher les listeners de redimensionnement, puis re-sélectionne soit la racine (`selectTopProp()`), soit la propriété mémorisée dans `_selectedId` (`selectProp()`), préservant ainsi l'état de l'interface après un re-rendu complet de la section.

---

**Code source :** `owl_editor.js` → `DPEditor.restoreSelection()`

### REQ-DP-010 — Redimensionnement horizontal du panneau gauche


La méthode `_initSplitPane()` attache un listener `mousedown` sur l'élément `dp-split-handle` pour permettre à l'utilisateur de redimensionner le panneau gauche par glisser-déposer. La largeur est contrainte entre 160 et 520 px. Elle appelle également `_initHResizers('dp-tree-panel')` pour le redimensionnement vertical entre l'arbre et le sous-panneau "Super Properties".

---

**Code source :** `owl_editor.js` → `DPEditor._initSplitPane()`

### REQ-DP-011 — Mise à jour du panneau "Super Properties"


La méthode `_updateSuperPanel(prop)` met à jour le contenu du panneau gauche inférieur (`dp-sub-list`). Si aucune propriété n'est passée, elle affiche un message "— select a property —". Si une propriété est passée, elle calcule la chaîne complète d'ancêtres via la fonction interne `buildChain()`, affiche chaque ancêtre avec indentation croissante, et termine la chaîne par `owl:topDatatypeProperty`. Les ancêtres directs comportent un bouton de suppression (✕). Un sélecteur HTML propose les propriétés non encore utilisées comme super-propriétés.

---

**Code source :** `owl_editor.js` → `DPEditor._updateSuperPanel()`

### REQ-DP-012 — Sélection de la racine owl:topDataProperty


La méthode `selectTopProp()` positionne `_selectedId` à `null` et `_topPropSelected` à `true`. Elle met à jour la surlignage dans l'arbre, remplace le contenu du panneau de détail par un écran d'accueil affichant la racine et un bouton de création, puis appelle `_updateSuperPanel(null)` et `_updateTreeButtons()`.

---

**Code source :** `owl_editor.js` → `DPEditor.selectTopProp()`

### REQ-DP-013 — Sélection d'une DatatypeProperty dans l'arbre


La méthode `selectProp(id)` mémorise `id` dans `_selectedId`, met à jour le surlignage visuel dans l'arbre, retrouve l'objet propriété dans `APP.state.datatype_properties`, injecte le formulaire de détail via `renderForm()`, initialise les redimensionneurs verticaux du panneau droit, met à jour le panneau "Super Properties" et les boutons de la barre d'outils.

---

**Code source :** `owl_editor.js` → `DPEditor.selectProp()`

### REQ-DP-014 — Gestion de l'état des boutons de la barre d'outils


La méthode `_updateTreeButtons()` active ou désactive les boutons `dp-btn-child`, `dp-btn-sister` et `dp-btn-delete` selon l'état courant : si la racine est sélectionnée, seul "Child" est activé et "Sibling" / "Delete" sont masqués ; si une propriété est sélectionnée, les trois boutons sont actifs ; sinon, tous sont désactivés.

---

**Code source :** `owl_editor.js` → `DPEditor._updateTreeButtons()`

### REQ-DP-015 — Expansion / réduction d'un nœud de l'arbre


La méthode `toggleNode(id)` bascule la visibilité du conteneur enfant `dp-tcn-${id}`. Elle met à jour le Set `_expanded` (ajout ou suppression de `id`) et fait pivoter la flèche de déplié/replié de l'élément `.tree-toggle`.

---

**Code source :** `owl_editor.js` → `DPEditor.toggleNode()`

### REQ-DP-020 — Affichage du menu contextuel (clic droit)


La méthode `showContextMenu(event, id)` supprime tout menu existant, sélectionne la propriété ou la racine selon la valeur de `id`, crée un élément `div.ctx-menu` et l'insère dans le `body` à la position du curseur. Le menu contient toujours l'item "Add Child Property" ; si `id` est défini (propriété réelle), il ajoute également "Add Sibling Property" et "Delete". Le menu se ferme automatiquement au clic en dehors via un listener `click` sur `document`.

---

**Code source :** `owl_editor.js` → `DPEditor.showContextMenu()`

### REQ-DP-021 — Fermeture du menu contextuel


La méthode `_closeContextMenu()` supprime du DOM l'élément portant l'ID `dp-ctx-menu`, s'il existe.

---

**Code source :** `owl_editor.js` → `DPEditor._closeContextMenu()`

### REQ-DP-022 — Démarrage du drag d'une propriété


La méthode `onDragStart(event, id)` mémorise l'ID de la propriété glissée dans `_dragId`, positionne `effectAllowed` à `'move'`, stocke l'ID dans `dataTransfer`, et ajoute la classe CSS `'dragging'` à l'élément source après un délai de 0 ms (via `setTimeout`).

---

**Code source :** `owl_editor.js` → `DPEditor.onDragStart()`

### REQ-DP-023 — Survol d'une cible lors du drag


La méthode `onDragOver(event, targetId)` autorise le dépôt (`event.preventDefault()`) uniquement si : un drag est en cours (`_dragId` défini), la cible est différente de la source, et la cible n'est pas un descendant de la source (vérifié via `_isDescendant()`). Elle applique la classe `'drag-over'` à l'élément survolé.

---

**Code source :** `owl_editor.js` → `DPEditor.onDragOver()`

### REQ-DP-026 — Rendu du formulaire d'édition d'une DatatypeProperty


La méthode `renderForm(prop)` génère le HTML complet du panneau droit. En mode création (`prop === null`), un bouton "✅ Create" est affiché. En mode édition, toutes les modifications de champ déclenchent `autoSave()` via `onchange`. Le formulaire comporte les sections suivantes, toutes générées par cette méthode :
- **En-tête** : champ de saisie de l'ID (avec `_sanitizeId()`), mention `(instance of owl:DatatypeProperty)`, IRI complète calculée à partir de `APP.state.ontology.id`.
- **Annotations** : table avec colonnes Property / Value / Lang, peuplée via `_annoRow()` pour `labels`, `comments` et `other`.
- **Domain(s)** : liste des classes domaine via `_listRows()`, sélecteur parmi les classes disponibles (`APP.state.classes`), valeur par défaut affichée `owl:Thing`.
- **Range** : liste des types XSD via `_listRows()`, sélecteur parmi les types non encore utilisés tirés de `XSD_TYPES`, valeur par défaut affichée `rdfs:Literal`.
- **Characteristics** : case à cocher unique "Functional" liée à `p.functional`.
- **Where Used** : section générée par `_whereUsedFrame()` listant les règles qui utilisent cette propriété.

---

**Code source :** `owl_editor.js` → `DPEditor.renderForm()`

### REQ-DP-027 — Ajout d'une ligne d'annotation (label / comment)


La méthode `addAnnotRow(type)` appelle `_makeAnnotRow(type, 'DPEditor', ac)` et insère la ligne retournée dans le `tbody` identifié `dp-annotations-body`. L'attribut `ac` active `autoSave()` si une propriété est en cours d'édition (`_editingId !== null`).

---

**Code source :** `owl_editor.js` → `DPEditor.addAnnotRow()`

### REQ-DP-028 — Ajout d'une annotation "autre propriété"


La méthode `addOtherAnnotRow(prop)` appelle `_makeAnnotRow('other', 'DPEditor', ac, prop)`, insère la ligne dans `dp-annotations-body`, puis masque le sélecteur d'annotation `dp-anno-picker` en forçant son `style.display` à `'none'`.

---

**Code source :** `owl_editor.js` → `DPEditor.addOtherAnnotRow()`

### REQ-DP-029 — Suppression d'une ligne d'annotation


La méthode `removeAnnotRow(btn)` supprime du DOM la ligne `<tr>` parente du bouton passé en paramètre (`btn.closest('tr')?.remove()`), puis déclenche `autoSave()` si une propriété est en cours d'édition.

**Code source :** `owl_editor.js` → `DPEditor.removeAnnotRow()`
