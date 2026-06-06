# Exigences — AnnotationProperties

> Généré le 2026-06-06 | Dérivé strictement du code source | Aucune hallucination

## Table des matières

### Fond
- [REQ-AP-001 — Définition des propriétés d'annotation intégrées (built-ins)](#req-ap-001--définition-des-propriétés-dannotation-intégrées-built-ins)
- [REQ-AP-002 — Détection des propriétés built-in vs. utilisateur](#req-ap-002--détection-des-propriétés-built-in-vs-utilisateur)
- [REQ-AP-003 — Construction de l'arbre hiérarchique des propriétés](#req-ap-003--construction-de-larbre-hiérarchique-des-propriétés)
- [REQ-AP-004 — Génération automatique d'un identifiant unique](#req-ap-004--génération-automatique-dun-identifiant-unique)
- [REQ-AP-005 — Création d'une propriété enfant (sub-property)](#req-ap-005--création-dune-propriété-enfant-sub-property)
- [REQ-AP-006 — Création d'une propriété sœur (même niveau)](#req-ap-006--création-dune-propriété-sœur-même-niveau)
- [REQ-AP-007 — Collecte des données du formulaire](#req-ap-007--collecte-des-données-du-formulaire)
- [REQ-AP-008 — Sauvegarde automatique à chaque modification](#req-ap-008--sauvegarde-automatique-à-chaque-modification)
- [REQ-AP-009 — Sauvegarde manuelle explicite](#req-ap-009--sauvegarde-manuelle-explicite)
- [REQ-AP-010 — Glisser-déposer pour réorganiser la hiérarchie](#req-ap-010--glisser-déposer-pour-réorganiser-la-hiérarchie)
- [REQ-AP-011 — Prévention des cycles lors du glisser-déposer](#req-ap-011--prévention-des-cycles-lors-du-glisser-déposer)
- [REQ-AP-012 — Suppression d'une propriété utilisateur avec confirmation](#req-ap-012--suppression-dune-propriété-utilisateur-avec-confirmation)
- [REQ-AP-013 — Collecte des annotations (labels, commentaires, autres)](#req-ap-013--collecte-des-annotations-labels-commentaires-autres)
- [REQ-AP-014 — Picker de sélection de propriété d'annotation](#req-ap-014--picker-de-sélection-de-propriété-dannotation)

### Forme
- [REQ-AP-015 — Rendu des nœuds built-in dans l'arbre](#req-ap-015--rendu-des-nœuds-built-in-dans-larbre)
- [REQ-AP-016 — Rendu des nœuds utilisateur dans l'arbre](#req-ap-016--rendu-des-nœuds-utilisateur-dans-larbre)
- [REQ-AP-017 — Rendu complet de l'arbre avec racines de namespace](#req-ap-017--rendu-complet-de-larbre-avec-racines-de-namespace)
- [REQ-AP-018 — Mise en page en panneau divisé (split pane)](#req-ap-018--mise-en-page-en-panneau-divisé-split-pane)
- [REQ-AP-019 — Redimensionnement du panneau gauche par glisser-déposer](#req-ap-019--redimensionnement-du-panneau-gauche-par-glisser-déposer)
- [REQ-AP-020 — Déplier/replier les nœuds de l'arbre](#req-ap-020--déplierreplier-les-nœuds-de-larbre)
- [REQ-AP-021 — Sélection d'une propriété dans l'arbre](#req-ap-021--sélection-dune-propriété-dans-larbre)
- [REQ-AP-022 — Gestion de l'état des boutons d'action selon la sélection](#req-ap-022--gestion-de-létat-des-boutons-daction-selon-la-sélection)
- [REQ-AP-023 — Affichage du détail d'une racine de namespace](#req-ap-023--affichage-du-détail-dune-racine-de-namespace)
- [REQ-AP-024 — Affichage du détail d'une propriété built-in (lecture seule)](#req-ap-024--affichage-du-détail-dune-propriété-built-in-lecture-seule)
- [REQ-AP-025 — Formulaire d'édition d'une propriété utilisateur](#req-ap-025--formulaire-dédition-dune-propriété-utilisateur)
- [REQ-AP-026 — Ajout d'une ligne d'annotation dans le formulaire](#req-ap-026--ajout-dune-ligne-dannotation-dans-le-formulaire)
- [REQ-AP-027 — Panneau des super-propriétés avec chaîne d'héritage](#req-ap-027--panneau-des-super-propriétés-avec-chaîne-dhéritage)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles OWL, contraintes de données, comportements algorithmiques, validations, persistance.


### REQ-AP-001 — Définition des propriétés d'annotation intégrées (built-ins)
La constante `AP_BUILTINS` définit deux groupes de propriétés d'annotation OWL 2 en lecture seule : le groupe `rdfs:` contenant `rdfs:label`, `rdfs:comment`, `rdfs:seeAlso`, `rdfs:isDefinedBy`, et le groupe `owl:` contenant `owl:versionInfo`, `owl:deprecated`, `owl:priorVersion`, `owl:backwardCompatibleWith`, `owl:incompatibleWith`. Chaque entrée porte un identifiant et un commentaire descriptif en anglais.

---

**Code source :** `owl_editor.js` → `AP_BUILTINS` (constante objet)

### REQ-AP-002 — Détection des propriétés built-in vs. utilisateur
La méthode `_isBuiltin(id)` détermine si un identifiant donné correspond à une propriété built-in en vérifiant sa présence dans les tableaux `AP_BUILTINS['rdfs:']` et `AP_BUILTINS['owl:']`. Elle retourne `true` si l'identifiant est trouvé dans l'un ou l'autre groupe.

---

**Code source :** `owl_editor.js` → `APEditor._isBuiltin()`

### REQ-AP-003 — Construction de l'arbre hiérarchique des propriétés
La méthode `_buildUserTree(props)` construit les maps de relations parent-enfant à partir du tableau des propriétés utilisateur. Elle produit : `childrenOf` (map user→[enfants user]), `builtinChildrenOf` (map builtin→[enfants user]) et `roots` (propriétés sans parent, triées alphabétiquement). Les propriétés dont le parent direct est un identifiant built-in sont placées dans `builtinChildrenOf`.

---

**Code source :** `owl_editor.js` → `APEditor._buildUserTree()`

### REQ-AP-004 — Génération automatique d'un identifiant unique
La méthode `_generatePropName()` génère un identifiant unique pour une nouvelle propriété. Elle part de la chaîne `'NewAnnotationProperty'` et incrémente un suffixe numérique (`NewAnnotationProperty1`, `NewAnnotationProperty2`, …) jusqu'à trouver un identifiant absent de `APP.state.annotation_properties`.

---

**Code source :** `owl_editor.js` → `APEditor._generatePropName()`

### REQ-AP-005 — Création d'une propriété enfant (sub-property)
La méthode `createChild()` détermine le parent depuis `APEditor._selectedId`. Si le sélectionné n'est pas une racine de namespace, il est placé dans le tableau `subPropertyOf` de la nouvelle propriété. Le nœud parent est expansé dans `APEditor._expanded`. La création est déléguée à `_createAndSelect()` qui appelle `API.createAP(prop)` puis rafraîchit l'affichage.

---

**Code source :** `owl_editor.js` → `APEditor.createChild()`

### REQ-AP-006 — Création d'une propriété sœur (même niveau)
La méthode `createSibling()` récupère les parents (`subPropertyOf`) de la propriété actuellement sélectionnée depuis `APP.state.annotation_properties`, les place comme parents de la nouvelle propriété, et expande ces parents dans `APEditor._expanded`. La création est ensuite déléguée à `_createAndSelect()`.

---

**Code source :** `owl_editor.js` → `APEditor.createSibling()`

### REQ-AP-007 — Collecte des données du formulaire
La méthode `_collectForm()` lit l'identifiant depuis le champ `ap-id` (avec normalisation des espaces en `_`), récupère le `subPropertyOf` existant depuis `APP.state.annotation_properties` pour le conserver (le formulaire ne l'expose pas directement), puis appelle `_collectAnnotations('ap-annotations-body')` pour collecter labels, commentaires et autres annotations.

---

**Code source :** `owl_editor.js` → `APEditor._collectForm()`

### REQ-AP-008 — Sauvegarde automatique à chaque modification
La méthode `_autoSave()` est déclenchée par `onchange` sur tous les champs du formulaire. Elle vérifie que la sélection courante est une propriété utilisateur (non racine, non built-in), collecte les données via `_collectForm()`, appelle `API.updateAP(id, data)`, détecte un éventuel renommage (si `data.id !== id`), puis rafraîchit l'état et restaure la sélection via `APP.refresh()` et `APEditor.restoreSelection()`.

---

**Code source :** `owl_editor.js` → `APEditor._autoSave()`

### REQ-AP-009 — Sauvegarde manuelle explicite
La méthode `save()` collecte les données via `_collectForm()`, valide l'identifiant via `_validateId()`, appelle `API.updateAP()` avec l'identifiant d'édition original (`_editingId`) ou le nouvel identifiant, met à jour `_editingId` et `_selectedId`, expande le nœud sauvegardé, puis rafraîchit l'affichage.

---

**Code source :** `owl_editor.js` → `APEditor.save()`

### REQ-AP-010 — Glisser-déposer pour réorganiser la hiérarchie
`onDragStart(event, id)` initialise le glisser en stockant l'identifiant dans `APEditor._dragId` et en utilisant `event.dataTransfer`. `onDragOver(event, targetId)` autorise le dépôt sur des cibles valides. `onDrop(event, targetId)` recalcule le nouveau `subPropertyOf` : si la cible est une racine de namespace, `subPropertyOf` devient `[]` ; sinon, `subPropertyOf = [targetId]`. La mise à jour est persistée via `API.updateAP()`.

---

**Code source :** `owl_editor.js` → `APEditor.onDragStart()` | `APEditor.onDragOver()` | `APEditor.onDrop()`

### REQ-AP-011 — Prévention des cycles lors du glisser-déposer
La méthode `_isDescendant(potentialDesc, ancestorId)` parcourt récursivement l'arbre `childrenOf` pour déterminer si `potentialDesc` est un descendant de `ancestorId`. Dans `onDragOver()`, si la cible est un descendant de la propriété glissée, le drop est refusé (`event.preventDefault()` n'est pas appelé).

---

**Code source :** `owl_editor.js` → `APEditor._isDescendant()` | `APEditor.onDragOver()`

### REQ-AP-012 — Suppression d'une propriété utilisateur avec confirmation
La méthode `deleteSelected()` bloque la suppression si la sélection est une racine ou une propriété built-in. Elle affiche une boîte de confirmation via `UI.confirm()` avec le message `"Delete annotation property <strong>${id}</strong>?"`. En cas de confirmation, elle appelle `API.deleteAP(id)`, remet `_selectedId` à `null`, rafraîchit l'état via `APP.refresh()`, réinitialise le panneau de détail avec le message d'invite vide, et redessine l'arbre.

---

**Code source :** `owl_editor.js` → `APEditor.deleteSelected()`

### REQ-AP-013 — Collecte des annotations (labels, commentaires, autres)
La fonction globale `_collectAnnotations(tbodyId)` parcourt toutes les lignes CSS `.anno-row` du tableau identifié par `tbodyId`. Pour chaque ligne non vide, elle lit la valeur (`.anno-value`) et la langue (`.anno-lang-inp`), puis classe l'entrée dans `labels`, `comments` ou `other` selon `row.dataset.type`. Pour les lignes `'other'`, la propriété cible est lue dans `row.dataset.prop`.

---

**Code source :** `owl_editor.js` → `_collectAnnotations()`

### REQ-AP-014 — Picker de sélection de propriété d'annotation
La fonction globale `_annoPickerItems(editorName)` génère le HTML du sélecteur (picker) de propriétés d'annotation disponible dans les formulaires de tous les éditeurs (dont `APEditor`). Elle appelle `APEditor._buildUserTree()` pour obtenir la hiérarchie des propriétés utilisateur, puis rend un arbre cliquable composé des built-ins (`AP_BUILTINS`) et des propriétés utilisateur. Un clic sur un élément appelle `<editorName>.addOtherAnnotRow(id)`.

---

**Code source :** `owl_editor.js` → `_annoPickerItems()`

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

### REQ-AP-015 — Rendu des nœuds built-in dans l'arbre
La méthode `_renderBuiltinNode(p, childrenOf, builtinChildrenOf, props)` génère le HTML d'un nœud built-in dans l'arbre. Elle affiche l'identifiant de la propriété, un badge textuel `built-in`, un indicateur d'expansion si la propriété a des enfants utilisateur, et rend récursivement les enfants utilisateur via `_renderUserNode()`. Le nœud accepte les événements `ondragover` et `ondrop` mais n'est pas lui-même `draggable`.

---

**Code source :** `owl_editor.js` → `APEditor._renderBuiltinNode()`

### REQ-AP-016 — Rendu des nœuds utilisateur dans l'arbre
La méthode `_renderUserNode(id, childrenOf, depth, props)` génère le HTML d'un nœud propriété utilisateur avec indentation calculée selon la profondeur (`depth * 16 + 6` pixels). Le nœud est `draggable="true"` et expose les gestionnaires `ondragstart`, `ondragover`, `ondragleave`, `ondrop`, `ondragend`. Il se rend récursivement pour tous les enfants. L'état d'expansion est lu depuis `APEditor._expanded`.

---

**Code source :** `owl_editor.js` → `APEditor._renderUserNode()`

### REQ-AP-017 — Rendu complet de l'arbre avec racines de namespace
La méthode `_renderTree(props)` compose l'arbre complet : deux racines de namespace `rdfs:` et `owl:` (affichées uniquement si `APP.getOntologyRootLabels().classRoot === 'owl:Thing'`), les propriétés utilisateur sans namespace connu ("orphans") rendues à la racine. Chaque racine de namespace est cliquable, expansible, et reçoit les events de drag-over et drop.

---

**Code source :** `owl_editor.js` → `APEditor._renderTree()`

### REQ-AP-018 — Mise en page en panneau divisé (split pane)
La méthode `renderSplit(props)` génère la mise en page complète de l'onglet : un panneau gauche (`ap-tree-panel`) contenant l'arbre et le panneau des super-propriétés, une poignée de redimensionnement (`ap-split-handle`), et un panneau de détail droit (`ap-detail`). Le panneau gauche présente trois boutons d'action : "Child", "Sibling" et "Delete", initialement désactivés. Un message d'invite et un bouton "＋ Create Annotation Property" s'affichent dans le panneau de détail vide.

---

**Code source :** `owl_editor.js` → `APEditor.renderSplit()`

### REQ-AP-019 — Redimensionnement du panneau gauche par glisser-déposer
La méthode `_initSplitPane()` attache un listener `mousedown` sur la poignée `ap-split-handle`. Lors du glisser, la largeur du panneau `ap-tree-panel` est recalculée en pixels avec un minimum de 160 px et un maximum de 520 px. La méthode appelle aussi `_initHResizers('ap-tree-panel')` pour le redimensionnement horizontal interne.

---

**Code source :** `owl_editor.js` → `APEditor._initSplitPane()`

### REQ-AP-020 — Déplier/replier les nœuds de l'arbre
La méthode `toggleNode(id)` ajoute ou retire l'identifiant du `Set` interne `APEditor._expanded`, puis redéclenche un rendu complet de l'arbre via `_renderTree()` et `_highlightSelected()`. Les nœuds `rdfs:` et `owl:` sont pré-expandus à l'initialisation.

---

**Code source :** `owl_editor.js` → `APEditor.toggleNode()`

### REQ-AP-021 — Sélection d'une propriété dans l'arbre
La méthode `selectProp(id)` met à jour `APEditor._selectedId`, rafraîchit la mise en évidence visuelle et les boutons, puis charge le panneau de détail approprié : `_renderRootDetail()` pour une racine de namespace, `_renderBuiltinDetail()` pour une propriété built-in, `_renderForm()` pour une propriété utilisateur. Dans tous les cas, `_updateSuperPanel()` est appelé pour mettre à jour le panneau des super-propriétés.

---

**Code source :** `owl_editor.js` → `APEditor.selectProp()`

### REQ-AP-022 — Gestion de l'état des boutons d'action selon la sélection
La méthode `_updateButtons()` active ou masque les boutons "Child", "Sibling" et "Delete" selon le type de l'élément sélectionné : si la sélection est une racine de namespace, tous les boutons sont masqués ; si c'est une propriété built-in, seul "Child" est visible ; si c'est une propriété utilisateur, "Child", "Sibling" et "Delete" sont tous visibles et activés.

---

**Code source :** `owl_editor.js` → `APEditor._updateButtons()`

### REQ-AP-023 — Affichage du détail d'une racine de namespace
La méthode `_renderRootDetail(ns)` génère un panneau de détail en lecture seule pour une racine de namespace (`rdfs:` ou `owl:`). Elle liste toutes les propriétés built-in du namespace avec leur identifiant et leur commentaire descriptif. Un badge indique "Namespace root — not an AnnotationProperty".

---

**Code source :** `owl_editor.js` → `APEditor._renderRootDetail()`

### REQ-AP-024 — Affichage du détail d'une propriété built-in (lecture seule)
La méthode `_renderBuiltinDetail(id)` génère un panneau de détail en lecture seule pour une propriété OWL 2 built-in. Elle affiche l'identifiant, le commentaire descriptif de `AP_BUILTINS`, et la mention en italique "Built-in OWL 2 annotation property — read-only." Aucun formulaire d'édition n'est fourni.

---

**Code source :** `owl_editor.js` → `APEditor._renderBuiltinDetail()`

### REQ-AP-025 — Formulaire d'édition d'une propriété utilisateur
La méthode `_renderForm(prop)` génère le formulaire d'édition d'une propriété utilisateur. Il contient un champ texte `ap-id` pour l'identifiant local (avec `oninput="_sanitizeId(this)"` et `onchange="APEditor._autoSave()"`), l'IRI complète de la propriété construite depuis `APP.state.ontology.id`, et le libellé `(instance of owl:AnnotationProperty)`. Les lignes d'annotation existantes (`rdfs:label`, `rdfs:comment`, autres) sont pré-remplies via `_annoRow()`.

---

**Code source :** `owl_editor.js` → `APEditor._renderForm()`

### REQ-AP-026 — Ajout d'une ligne d'annotation dans le formulaire
La méthode `addAnnotRow(type)` ajoute une nouvelle ligne vide dans le tableau `ap-annotations-body` en appelant `_makeAnnotRow(type, 'APEditor', ac)`. Le paramètre `type` peut être `'label'`, `'comment'` ou `'other'`. Chaque ligne créée déclenche `APEditor._autoSave()` à chaque modification.

---

**Code source :** `owl_editor.js` → `APEditor.addAnnotRow()`

### REQ-AP-027 — Panneau des super-propriétés avec chaîne d'héritage
La méthode `_updateSuperPanel(selectedId)` met à jour le panneau `ap-super-list`. Pour chaque parent direct de la propriété sélectionnée, elle reconstruit la chaîne complète d'héritage (fonction interne `buildChain()`) en remontant récursivement jusqu'à la racine, en ajoutant la racine de namespace (`rdfs:` ou `owl:`) en fin de chaîne. Chaque ancêtre est affiché avec une indentation croissante et un lien de navigation cliquable via `APP.navigateTo()`.

---

**Code source :** `owl_editor.js` → `APEditor._updateSuperPanel()`
