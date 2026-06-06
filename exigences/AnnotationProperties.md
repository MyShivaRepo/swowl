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

**Si** l'ontologie est chargée et exploite des propriétés d'annotation OWL 2 standard,

**Alors** le système dispose d'une constante `AP_BUILTINS` définissant deux groupes de propriétés en lecture seule :
- le groupe `rdfs:` contenant `rdfs:label`, `rdfs:comment`, `rdfs:seeAlso`, `rdfs:isDefinedBy`
- le groupe `owl:` contenant `owl:versionInfo`, `owl:deprecated`, `owl:priorVersion`, `owl:backwardCompatibleWith`, `owl:incompatibleWith`

chaque entrée portant un identifiant et un commentaire descriptif en anglais.

---

**Code source :** `owl_editor.js` → `AP_BUILTINS` (constante objet)

### REQ-AP-002 — Détection des propriétés built-in vs. utilisateur

**Si** le système évalue un identifiant de propriété d'annotation,

**Alors** il détermine si cet identifiant est une propriété built-in en vérifiant sa présence dans les tableaux `AP_BUILTINS['rdfs:']` et `AP_BUILTINS['owl:']`, et retourne `true` si l'identifiant est trouvé dans l'un ou l'autre groupe.

---

**Code source :** `owl_editor.js` → `APEditor._isBuiltin()`

### REQ-AP-003 — Construction de l'arbre hiérarchique des propriétés

**Si** l'ontologie est chargée et contient des propriétés d'annotation utilisateur,

**Alors** le système construit les maps de relations parent-enfant et produit :
- `childrenOf` (map user → [enfants user])
- `builtinChildrenOf` (map builtin → [enfants user])
- `roots` (propriétés sans parent, triées alphabétiquement)

les propriétés dont le parent direct est un identifiant built-in étant placées dans `builtinChildrenOf`.

---

**Code source :** `owl_editor.js` → `APEditor._buildUserTree()`

### REQ-AP-004 — Génération automatique d'un identifiant unique

**Si** l'utilisateur demande la création d'une nouvelle propriété d'annotation,

**Alors** le système génère un identifiant unique en partant de la chaîne `'NewAnnotationProperty'` et en incrémentant un suffixe numérique (`NewAnnotationProperty1`, `NewAnnotationProperty2`, …) jusqu'à trouver un identifiant absent de `APP.state.annotation_properties`.

---

**Code source :** `owl_editor.js` → `APEditor._generatePropName()`

### REQ-AP-005 — Création d'une propriété enfant (sub-property)

**Si** l'utilisateur clique sur le bouton "Child" avec une propriété sélectionnée dans l'arbre,

**Alors** :
- si la propriété sélectionnée n'est pas une racine de namespace, elle est placée dans le tableau `subPropertyOf` de la nouvelle propriété
- le nœud parent est expansé dans `APEditor._expanded`
- la nouvelle propriété est créée via `API.createAP(prop)` et immédiatement sélectionnée

---

**Code source :** `owl_editor.js` → `APEditor.createChild()`

### REQ-AP-006 — Création d'une propriété sœur (même niveau)

**Si** l'utilisateur clique sur le bouton "Sibling" avec une propriété sélectionnée dans l'arbre,

**Alors** les parents (`subPropertyOf`) de la propriété sélectionnée sont récupérés depuis `APP.state.annotation_properties`, placés comme parents de la nouvelle propriété, ces parents sont expansés dans `APEditor._expanded`, et la création est déléguée à `_createAndSelect()`.

---

**Code source :** `owl_editor.js` → `APEditor.createSibling()`

### REQ-AP-007 — Collecte des données du formulaire

**Si** le système collecte les données saisies dans le formulaire d'une propriété d'annotation utilisateur,

**Alors** :
- l'identifiant est lu depuis le champ `ap-id` avec normalisation des espaces en `_`
- le `subPropertyOf` existant est conservé depuis `APP.state.annotation_properties` (le formulaire ne l'expose pas directement)
- les labels, commentaires et autres annotations sont collectés via `_collectAnnotations('ap-annotations-body')`

---

**Code source :** `owl_editor.js` → `APEditor._collectForm()`

### REQ-AP-008 — Sauvegarde automatique à chaque modification

**Si** l'utilisateur modifie un champ du formulaire d'une propriété utilisateur (non racine, non built-in),

**Alors** le système collecte les données via `_collectForm()`, appelle `API.updateAP(id, data)`, détecte un éventuel renommage (si `data.id !== id`), puis rafraîchit l'état et restaure la sélection via `APP.refresh()` et `APEditor.restoreSelection()`.

---

**Code source :** `owl_editor.js` → `APEditor._autoSave()`

### REQ-AP-009 — Sauvegarde manuelle explicite

**Si** l'utilisateur déclenche une sauvegarde manuelle sur une propriété utilisateur,

**Alors** le système collecte les données via `_collectForm()`, valide l'identifiant via `_validateId()`, appelle `API.updateAP()` avec l'identifiant d'édition original (`_editingId`) ou le nouvel identifiant, met à jour `_editingId` et `_selectedId`, expande le nœud sauvegardé, puis rafraîchit l'affichage.

---

**Code source :** `owl_editor.js` → `APEditor.save()`

### REQ-AP-010 — Glisser-déposer pour réorganiser la hiérarchie

**Si** l'utilisateur glisse une propriété utilisateur et la dépose sur une cible valide dans l'arbre,

**Alors** :
- si la cible est une racine de namespace, `subPropertyOf` devient `[]`
- sinon, `subPropertyOf = [targetId]`
- la mise à jour est persistée via `API.updateAP()`

---

**Code source :** `owl_editor.js` → `APEditor.onDragStart()` | `APEditor.onDragOver()` | `APEditor.onDrop()`

### REQ-AP-011 — Prévention des cycles lors du glisser-déposer

**Si** l'utilisateur tente de déposer une propriété sur l'un de ses propres descendants dans l'arbre,

**Alors** le dépôt est refusé afin de prévenir la formation d'un cycle hiérarchique, en ne déclenchant pas `event.preventDefault()` dans `onDragOver()`.

---

**Code source :** `owl_editor.js` → `APEditor._isDescendant()` | `APEditor.onDragOver()`

### REQ-AP-012 — Suppression d'une propriété utilisateur avec confirmation

**Si** l'utilisateur clique sur "Delete" avec une propriété utilisateur sélectionnée (non racine, non built-in)
**et** confirme la suppression dans la boîte de dialogue `UI.confirm()`,

**Alors** :
- `API.deleteAP(id)` est appelé
- `_selectedId` est remis à `null`
- l'état est rafraîchi via `APP.refresh()`
- le panneau de détail est réinitialisé avec le message d'invite vide
- l'arbre est redessiné

---

**Code source :** `owl_editor.js` → `APEditor.deleteSelected()`

### REQ-AP-013 — Collecte des annotations (labels, commentaires, autres)

**Si** le système collecte les annotations d'un formulaire identifié par `tbodyId`,

**Alors** il parcourt toutes les lignes CSS `.anno-row` du tableau, et pour chaque ligne non vide :
- lit la valeur (`.anno-value`) et la langue (`.anno-lang-inp`)
- classe l'entrée dans `labels`, `comments` ou `other` selon `row.dataset.type`
- pour les lignes `'other'`, lit la propriété cible dans `row.dataset.prop`

---

**Code source :** `owl_editor.js` → `_collectAnnotations()`

### REQ-AP-014 — Picker de sélection de propriété d'annotation

**Si** un formulaire d'éditeur affiche le sélecteur (picker) de propriétés d'annotation,

**Alors** le système génère un arbre cliquable composé des propriétés built-in (`AP_BUILTINS`) et des propriétés utilisateur issues de `APEditor._buildUserTree()`, un clic sur un élément déclenchant `<editorName>.addOtherAnnotRow(id)`.

---

**Code source :** `owl_editor.js` → `_annoPickerItems()`

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

### REQ-AP-015 — Rendu des nœuds built-in dans l'arbre

**Si** l'arbre des propriétés d'annotation doit afficher une propriété built-in,

**Alors** le système génère un nœud affichant l'identifiant de la propriété, un badge textuel `built-in`, un indicateur d'expansion si la propriété a des enfants utilisateur, et rend récursivement les enfants utilisateur via `_renderUserNode()`. Le nœud accepte les événements `ondragover` et `ondrop` mais n'est pas lui-même `draggable`.

---

**Code source :** `owl_editor.js` → `APEditor._renderBuiltinNode()`

### REQ-AP-016 — Rendu des nœuds utilisateur dans l'arbre

**Si** l'arbre des propriétés d'annotation doit afficher une propriété utilisateur,

**Alors** le système génère un nœud `draggable="true"` avec une indentation calculée selon la profondeur (`depth * 16 + 6` pixels), exposant les gestionnaires `ondragstart`, `ondragover`, `ondragleave`, `ondrop`, `ondragend`, et se rendant récursivement pour tous ses enfants. L'état d'expansion est lu depuis `APEditor._expanded`.

---

**Code source :** `owl_editor.js` → `APEditor._renderUserNode()`

### REQ-AP-017 — Rendu complet de l'arbre avec racines de namespace

**Si** l'onglet des propriétés d'annotation est affiché et que `APP.getOntologyRootLabels().classRoot === 'owl:Thing'`,

**Alors** le système compose l'arbre complet avec deux racines de namespace `rdfs:` et `owl:`, les propriétés utilisateur sans namespace connu ("orphans") rendues à la racine. Chaque racine de namespace est cliquable, expansible, et reçoit les événements de drag-over et drop.

---

**Code source :** `owl_editor.js` → `APEditor._renderTree()`

### REQ-AP-018 — Mise en page en panneau divisé (split pane)

**Si** l'onglet des propriétés d'annotation est rendu,

**Alors** le système génère une mise en page complète composée de :
- un panneau gauche (`ap-tree-panel`) contenant l'arbre et le panneau des super-propriétés, avec trois boutons d'action "Child", "Sibling" et "Delete" initialement désactivés
- une poignée de redimensionnement (`ap-split-handle`)
- un panneau de détail droit (`ap-detail`) affichant un message d'invite et un bouton "＋ Create Annotation Property" lorsqu'aucune propriété n'est sélectionnée

---

**Code source :** `owl_editor.js` → `APEditor.renderSplit()`

### REQ-AP-019 — Redimensionnement du panneau gauche par glisser-déposer

**Si** l'utilisateur glisse la poignée `ap-split-handle`,

**Alors** la largeur du panneau `ap-tree-panel` est recalculée en pixels avec un minimum de 160 px et un maximum de 520 px, et le redimensionnement horizontal interne est initialisé via `_initHResizers('ap-tree-panel')`.

---

**Code source :** `owl_editor.js` → `APEditor._initSplitPane()`

### REQ-AP-020 — Déplier/replier les nœuds de l'arbre

**Si** l'utilisateur clique sur l'indicateur d'expansion d'un nœud de l'arbre,

**Alors** le système ajoute ou retire l'identifiant du `Set` interne `APEditor._expanded`, puis redéclenche un rendu complet de l'arbre via `_renderTree()` et `_highlightSelected()`. Les nœuds `rdfs:` et `owl:` sont pré-expansés à l'initialisation.

---

**Code source :** `owl_editor.js` → `APEditor.toggleNode()`

### REQ-AP-021 — Sélection d'une propriété dans l'arbre

**Si** l'utilisateur clique sur un nœud de l'arbre des propriétés d'annotation,

**Alors** le système met à jour `APEditor._selectedId`, rafraîchit la mise en évidence visuelle et les boutons, et charge le panneau de détail approprié :
- `_renderRootDetail()` pour une racine de namespace
- `_renderBuiltinDetail()` pour une propriété built-in
- `_renderForm()` pour une propriété utilisateur

dans tous les cas, `_updateSuperPanel()` est appelé pour mettre à jour le panneau des super-propriétés.

---

**Code source :** `owl_editor.js` → `APEditor.selectProp()`

### REQ-AP-022 — Gestion de l'état des boutons d'action selon la sélection

**Si** la sélection dans l'arbre change,

**Alors** le système active ou masque les boutons "Child", "Sibling" et "Delete" selon le type de l'élément sélectionné :
- racine de namespace : tous les boutons sont masqués
- propriété built-in : seul "Child" est visible
- propriété utilisateur : "Child", "Sibling" et "Delete" sont tous visibles et activés

---

**Code source :** `owl_editor.js` → `APEditor._updateButtons()`

### REQ-AP-023 — Affichage du détail d'une racine de namespace

**Si** l'utilisateur sélectionne une racine de namespace (`rdfs:` ou `owl:`) dans l'arbre,

**Alors** le système affiche un panneau de détail en lecture seule listant toutes les propriétés built-in du namespace avec leur identifiant et leur commentaire descriptif, accompagné d'un badge "Namespace root — not an AnnotationProperty".

---

**Code source :** `owl_editor.js` → `APEditor._renderRootDetail()`

### REQ-AP-024 — Affichage du détail d'une propriété built-in (lecture seule)

**Si** l'utilisateur sélectionne une propriété OWL 2 built-in dans l'arbre,

**Alors** le système affiche un panneau de détail en lecture seule présentant l'identifiant, le commentaire descriptif issu de `AP_BUILTINS`, et la mention "Built-in OWL 2 annotation property — read-only." Aucun formulaire d'édition n'est fourni.

---

**Code source :** `owl_editor.js` → `APEditor._renderBuiltinDetail()`

### REQ-AP-025 — Formulaire d'édition d'une propriété utilisateur

**Si** l'utilisateur sélectionne une propriété d'annotation utilisateur dans l'arbre,

**Alors** le système affiche un formulaire d'édition contenant :
- un champ texte `ap-id` pour l'identifiant local (avec `oninput="_sanitizeId(this)"` et `onchange="APEditor._autoSave()"`)
- l'IRI complète de la propriété construite depuis `APP.state.ontology.id`
- le libellé `(instance of owl:AnnotationProperty)`
- les lignes d'annotation existantes (`rdfs:label`, `rdfs:comment`, autres) pré-remplies via `_annoRow()`

---

**Code source :** `owl_editor.js` → `APEditor._renderForm()`

### REQ-AP-026 — Ajout d'une ligne d'annotation dans le formulaire

**Si** l'utilisateur demande l'ajout d'une annotation dans le formulaire d'une propriété utilisateur,

**Alors** le système ajoute une nouvelle ligne vide dans le tableau `ap-annotations-body` via `_makeAnnotRow(type, 'APEditor', ac)`, le paramètre `type` pouvant être `'label'`, `'comment'` ou `'other'`, chaque ligne déclenchant `APEditor._autoSave()` à chaque modification.

---

**Code source :** `owl_editor.js` → `APEditor.addAnnotRow()`

### REQ-AP-027 — Panneau des super-propriétés avec chaîne d'héritage

**Si** une propriété d'annotation est sélectionnée dans l'arbre,

**Alors** le système met à jour le panneau `ap-super-list` en reconstruisant pour chaque parent direct la chaîne complète d'héritage (via `buildChain()`) en remontant récursivement jusqu'à la racine, en ajoutant la racine de namespace (`rdfs:` ou `owl:`) en fin de chaîne. Chaque ancêtre est affiché avec une indentation croissante et un lien de navigation cliquable via `APP.navigateTo()`.

---

**Code source :** `owl_editor.js` → `APEditor._updateSuperPanel()`
