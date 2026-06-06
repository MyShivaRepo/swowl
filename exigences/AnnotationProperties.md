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

| **Si** | l'ontologiste exploite des propriétés d'annotation OWL 2 standard dans son ontologie, |
|---|---|
| **Alors** | l'application reconnaît nativement deux groupes de propriétés d'annotation prédéfinies en lecture seule :<br>- le groupe `rdfs:` : `rdfs:label`, `rdfs:comment`, `rdfs:seeAlso`, `rdfs:isDefinedBy`<br>- le groupe `owl:` : `owl:versionInfo`, `owl:deprecated`, `owl:priorVersion`, `owl:backwardCompatibleWith`, `owl:incompatibleWith`<br>chacune accompagnée d'une description en anglais accessible à l'utilisateur. |

---

**Code source :** `owl_editor.js` → `AP_BUILTINS` (constante objet) — Définit deux tableaux indexés par namespace (`'rdfs:'` et `'owl:'`), chaque entrée portant un champ `id` (IRI courte) et un champ `comment` (description textuelle). Utilisée comme référence dans `_isBuiltin()`, `_renderBuiltinNode()`, `_renderRootDetail()`, `_renderBuiltinDetail()` et `_annoPickerItems()`.

### REQ-AP-002 — Détection des propriétés built-in vs. utilisateur

| **Si** | l'application doit distinguer une propriété d'annotation standard OWL 2 d'une propriété définie par l'ontologiste, |
|---|---|
| **Alors** | elle identifie correctement toute propriété appartenant aux groupes `rdfs:` ou `owl:` comme étant une propriété intégrée, et traite les autres comme des propriétés utilisateur éditables. |

---

**Code source :** `owl_editor.js` → `APEditor._isBuiltin(id)` — Vérifie la présence de `id` dans `AP_BUILTINS['rdfs:']` et `AP_BUILTINS['owl:']` via `Array.some()`, retourne `true` si trouvé dans l'un ou l'autre groupe.

### REQ-AP-003 — Construction de l'arbre hiérarchique des propriétés

| **Si** | l'ontologie contient des propriétés d'annotation organisées en hiérarchie de sous-propriétés, |
|---|---|
| **Alors** | l'arbre des propriétés d'annotation reflète fidèlement les relations de spécialisation entre propriétés, en distinguant les propriétés racines, les propriétés attachées à un parent intégré et celles attachées à un parent utilisateur. |

---

**Code source :** `owl_editor.js` → `APEditor._buildUserTree()` — Construit trois structures : `childrenOf` (map `id → [enfants utilisateur]`), `builtinChildrenOf` (map `builtinId → [enfants utilisateur dont le parent est un built-in]`), et `roots` (propriétés sans `subPropertyOf`, triées alphabétiquement). Itère sur `APP.state.annotation_properties`.

### REQ-AP-004 — Génération automatique d'un identifiant unique

| **Si** | l'ontologiste crée une nouvelle propriété d'annotation sans en préciser l'identifiant, |
|---|---|
| **Alors** | l'application lui propose automatiquement un identifiant unique, sans conflit avec les propriétés déjà présentes dans l'ontologie. |

---

**Code source :** `owl_editor.js` → `APEditor._generatePropName()` — Part de la chaîne `'NewAnnotationProperty'`, incrémente un suffixe numérique (`NewAnnotationProperty1`, `NewAnnotationProperty2`, …) jusqu'à obtenir un identifiant absent de `APP.state.annotation_properties`.

### REQ-AP-005 — Création d'une propriété enfant (sub-property)

| **Si** | l'ontologiste souhaite spécialiser une propriété d'annotation existante en créant une sous-propriété directement positionnée sous celle-ci, |
|---|---|
| **Alors** | la nouvelle propriété est automatiquement rattachée au parent sélectionné, le parent est déplié dans l'arbre, et la nouvelle propriété est immédiatement sélectionnée pour édition. |

---

**Code source :** `owl_editor.js` → `APEditor.createChild()` — Si la propriété sélectionnée n'est pas une racine de namespace, initialise `subPropertyOf: [selectedId]` sur la nouvelle propriété, ajoute `selectedId` à `APEditor._expanded`, appelle `API.createAP(prop)` puis sélectionne la nouvelle propriété via `selectProp()`.

### REQ-AP-006 — Création d'une propriété sœur (même niveau)

| **Si** | l'ontologiste souhaite créer une nouvelle propriété d'annotation au même niveau hiérarchique qu'une propriété existante, |
|---|---|
| **Alors** | la nouvelle propriété hérite des mêmes parents que la propriété de référence, et ses parents sont dépliés dans l'arbre pour rendre la nouvelle propriété immédiatement visible. |

---

**Code source :** `owl_editor.js` → `APEditor.createSibling()` — Récupère `subPropertyOf` de la propriété sélectionnée depuis `APP.state.annotation_properties`, l'affecte à la nouvelle propriété, ajoute chaque parent à `APEditor._expanded`, puis délègue à `_createAndSelect()`.

### REQ-AP-007 — Collecte des données du formulaire

| **Si** | l'ontologiste a renseigné les champs d'une propriété d'annotation utilisateur et que l'application doit persister ces informations, |
|---|---|
| **Alors** | l'application consolide l'identifiant saisi, les relations de sous-propriété existantes et l'ensemble des annotations (labels, commentaires, autres) en une représentation cohérente prête à être sauvegardée. |

---

**Code source :** `owl_editor.js` → `APEditor._collectForm()` — Lit l'identifiant depuis le champ `ap-id` en normalisant les espaces en `_`, conserve le `subPropertyOf` existant depuis `APP.state.annotation_properties` (non exposé dans le formulaire), collecte les annotations via `_collectAnnotations('ap-annotations-body')`.

### REQ-AP-008 — Sauvegarde automatique à chaque modification

| **Si** | l'ontologiste modifie un champ du formulaire d'une propriété d'annotation utilisateur, |
|---|---|
| **Alors** | les modifications sont persistées immédiatement et automatiquement, sans action supplémentaire de l'utilisateur, et l'affichage reste synchronisé avec l'état sauvegardé. |

---

**Code source :** `owl_editor.js` → `APEditor._autoSave()` — Collecte les données via `_collectForm()`, appelle `API.updateAP(id, data)`, détecte un éventuel renommage (`data.id !== id`), rafraîchit l'état via `APP.refresh()` et restaure la sélection via `APEditor.restoreSelection()`.

### REQ-AP-009 — Sauvegarde manuelle explicite

| **Si** | l'ontologiste déclenche explicitement la sauvegarde d'une propriété d'annotation utilisateur, |
|---|---|
| **Alors** | l'application valide l'identifiant, persiste les modifications, met à jour la sélection courante pour refléter un éventuel renommage, et rafraîchit l'affichage de l'arbre. |

---

**Code source :** `owl_editor.js` → `APEditor.save()` — Collecte les données via `_collectForm()`, valide l'identifiant via `_validateId()`, appelle `API.updateAP()` avec `_editingId` ou le nouvel identifiant, met à jour `_editingId` et `_selectedId`, ajoute l'identifiant à `_expanded`, puis appelle `APP.refresh()`.

### REQ-AP-010 — Glisser-déposer pour réorganiser la hiérarchie

| **Si** | l'ontologiste souhaite déplacer une propriété d'annotation utilisateur dans la hiérarchie en la faisant glisser vers un autre emplacement de l'arbre, |
|---|---|
| **Alors** | la propriété déplacée est rattachée au nouveau parent cible, ou promue au rang de propriété racine si elle est déposée sur une racine de namespace, et ce changement est immédiatement persisté. |

---

**Code source :** `owl_editor.js` → `APEditor.onDragStart()` | `APEditor.onDragOver()` | `APEditor.onDrop()` — `onDragStart` stocke l'identifiant source dans `dataTransfer`. `onDrop` lit la cible : si racine de namespace, `subPropertyOf = []` ; sinon `subPropertyOf = [targetId]`. La mise à jour est persistée via `API.updateAP()`.

### REQ-AP-011 — Prévention des cycles lors du glisser-déposer

| **Si** | l'ontologiste tente de déplacer une propriété d'annotation vers l'un de ses propres descendants dans la hiérarchie, |
|---|---|
| **Alors** | l'application refuse ce déplacement afin de préserver la cohérence acyclique de la hiérarchie des sous-propriétés. |

---

**Code source :** `owl_editor.js` → `APEditor._isDescendant(ancestorId, candidateId)` | `APEditor.onDragOver()` — `_isDescendant` remonte récursivement les `subPropertyOf` pour détecter si `ancestorId` est un ancêtre de `candidateId`. Si vrai, `onDragOver` n'appelle pas `event.preventDefault()`, interdisant le dépôt.

### REQ-AP-012 — Suppression d'une propriété utilisateur avec confirmation

| **Si** | l'ontologiste souhaite supprimer définitivement une propriété d'annotation utilisateur, |
|---|---|
| **Alors** | l'application demande une confirmation explicite avant toute suppression, puis retire la propriété de l'ontologie, réinitialise la sélection et rafraîchit l'arbre. |

---

**Code source :** `owl_editor.js` → `APEditor.deleteSelected()` — Appelle `UI.confirm()` ; en cas de validation : appelle `API.deleteAP(id)`, remet `_selectedId` à `null`, appelle `APP.refresh()`, réinitialise le panneau de détail avec le message d'invite, et redessine l'arbre.

### REQ-AP-013 — Collecte des annotations (labels, commentaires, autres)

| **Si** | l'ontologiste a renseigné des annotations textuelles (labels, commentaires, ou annotations personnalisées) sur une propriété d'annotation, |
|---|---|
| **Alors** | l'application regroupe ces annotations par catégorie (labels, commentaires, autres propriétés d'annotation), en conservant pour chacune la valeur, la langue et, pour les annotations personnalisées, la propriété d'annotation utilisée. |

---

**Code source :** `owl_editor.js` → `_collectAnnotations(tbodyId)` — Parcourt les lignes CSS `.anno-row` du tableau identifié par `tbodyId`, lit `.anno-value` et `.anno-lang-inp` pour chaque ligne non vide, classe dans `labels`, `comments` ou `other` selon `row.dataset.type`, et pour `'other'` lit la propriété cible dans `row.dataset.prop`.

### REQ-AP-014 — Picker de sélection de propriété d'annotation

| **Si** | l'ontologiste souhaite ajouter une annotation à l'aide d'une propriété d'annotation spécifique, |
|---|---|
| **Alors** | l'application lui propose un sélecteur visuel listant toutes les propriétés d'annotation disponibles — intégrées et définies par l'utilisateur — organisées de manière hiérarchique et navigables par un simple clic. |

---

**Code source :** `owl_editor.js` → `_annoPickerItems(editorName)` — Génère un arbre HTML cliquable composé des propriétés `AP_BUILTINS` et des propriétés utilisateur issues de `APEditor._buildUserTree()`. Un clic sur un élément déclenche `<editorName>.addOtherAnnotRow(id)`.

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

### REQ-AP-015 — Rendu des nœuds built-in dans l'arbre

| **Si** | l'arbre des propriétés d'annotation affiche une propriété intégrée OWL 2, |
|---|---|
| **Alors** | cette propriété est présentée avec une indication visuelle de son statut non éditable, un contrôle d'expansion si elle possède des sous-propriétés utilisateur, et ses sous-propriétés éventuelles sont affichées en dessous. Elle peut recevoir des propriétés glissées mais ne peut pas elle-même être déplacée. |

---

**Code source :** `owl_editor.js` → `APEditor._renderBuiltinNode(prop, depth)` — Génère un nœud avec badge `built-in`, indicateur d'expansion conditionnel (`APEditor.builtinChildrenOf[prop.id]` non vide), gestionnaires `ondragover` et `ondrop`, et appelle récursivement `_renderUserNode()` pour chaque enfant utilisateur. L'attribut `draggable` n'est pas positionné.

### REQ-AP-016 — Rendu des nœuds utilisateur dans l'arbre

| **Si** | l'arbre des propriétés d'annotation affiche une propriété définie par l'ontologiste, |
|---|---|
| **Alors** | cette propriété est visuellement indentée selon sa profondeur dans la hiérarchie, peut être glissée vers un autre emplacement, et ses sous-propriétés sont affichées en dessous lorsqu'elle est dépliée. |

---

**Code source :** `owl_editor.js` → `APEditor._renderUserNode(id, depth)` — Génère un nœud `draggable="true"` avec `padding-left: ${depth * 16 + 6}px`, expose les gestionnaires `ondragstart`, `ondragover`, `ondragleave`, `ondrop`, `ondragend`, lit l'état d'expansion depuis `APEditor._expanded`, et s'appelle récursivement pour les enfants via `childrenOf[id]`.

### REQ-AP-017 — Rendu complet de l'arbre avec racines de namespace

| **Si** | l'onglet des propriétés d'annotation est affiché pour une ontologie OWL standard, |
|---|---|
| **Alors** | l'arbre présente deux racines de namespace (`rdfs:` et `owl:`) regroupant les propriétés intégrées correspondantes, suivies des propriétés utilisateur organisées en sous-arbre. Les propriétés utilisateur sans rattachement connu à un namespace sont affichées à la racine de l'arbre. |

---

**Code source :** `owl_editor.js` → `APEditor._renderTree()` — Conditionné par `APP.getOntologyRootLabels().classRoot === 'owl:Thing'`. Compose le HTML des deux racines de namespace (cliquables, expansibles, avec `ondragover` et `ondrop`), puis ajoute les propriétés utilisateur "orphelines" (absentes de `childrenOf` et `builtinChildrenOf`) en fin d'arbre.

### REQ-AP-018 — Mise en page en panneau divisé (split pane)

| **Si** | l'ontologiste ouvre l'onglet des propriétés d'annotation, |
|---|---|
| **Alors** | l'interface présente un panneau gauche contenant l'arbre des propriétés et les actions disponibles, et un panneau droit affichant le détail de la propriété sélectionnée ou une invitation à en créer une nouvelle. Les actions de création sont désactivées tant qu'aucune propriété n'est sélectionnée. |

---

**Code source :** `owl_editor.js` → `APEditor.renderSplit()` — Génère le panneau gauche `ap-tree-panel` avec les boutons "Child", "Sibling", "Delete" (`disabled` par défaut), le conteneur `ap-tree`, le panneau `ap-super-list`, la poignée `ap-split-handle`, et le panneau droit `ap-detail` avec message d'invite et bouton "＋ Create Annotation Property".

### REQ-AP-019 — Redimensionnement du panneau gauche par glisser-déposer

| **Si** | l'ontologiste souhaite ajuster la largeur du panneau de navigation par rapport au panneau de détail, |
|---|---|
| **Alors** | il peut glisser la séparation entre les deux panneaux pour redimensionner librement le panneau gauche, dans les limites minimale et maximale prévues par l'interface. |

---

**Code source :** `owl_editor.js` → `APEditor._initSplitPane()` — Écoute les événements `mousedown` sur `ap-split-handle`, recalcule la largeur de `ap-tree-panel` en pixels lors du `mousemove` avec un minimum de 160 px et un maximum de 520 px, et initialise le redimensionnement vertical interne via `_initHResizers('ap-tree-panel')`.

### REQ-AP-020 — Déplier/replier les nœuds de l'arbre

| **Si** | l'ontologiste clique sur l'indicateur d'expansion d'un nœud de l'arbre, |
|---|---|
| **Alors** | le nœud bascule entre les états déplié et replié, et l'arbre se redessine immédiatement pour refléter ce changement. Les racines de namespace `rdfs:` et `owl:` sont dépliées par défaut à l'ouverture de l'onglet. |

---

**Code source :** `owl_editor.js` → `APEditor.toggleNode(id)` — Ajoute ou retire `id` du `Set` interne `APEditor._expanded` (via `add` ou `delete`), puis appelle `_renderTree()` suivi de `_highlightSelected()`. Les identifiants `'rdfs:'` et `'owl:'` sont pré-insérés dans `_expanded` à l'initialisation.

### REQ-AP-021 — Sélection d'une propriété dans l'arbre

| **Si** | l'ontologiste clique sur une propriété dans l'arbre des propriétés d'annotation, |
|---|---|
| **Alors** | la propriété est mise en évidence visuellement, les actions disponibles sont mises à jour selon son type, et le panneau de détail affiche les informations correspondantes : description pour une racine de namespace, vue en lecture seule pour une propriété intégrée, formulaire d'édition pour une propriété utilisateur. |

---

**Code source :** `owl_editor.js` → `APEditor.selectProp(id)` — Met à jour `_selectedId`, appelle `_highlightSelected()` et `_updateButtons()`, puis charge le panneau de détail via `_renderRootDetail()`, `_renderBuiltinDetail()` ou `_renderForm()` selon le type de `id`. Dans tous les cas, appelle `_updateSuperPanel()`.

### REQ-AP-022 — Gestion de l'état des boutons d'action selon la sélection

| **Si** | la sélection dans l'arbre des propriétés d'annotation change, |
|---|---|
| **Alors** | les actions proposées s'adaptent au type de l'élément sélectionné : une racine de namespace ne propose aucune action, une propriété intégrée permet uniquement de créer une sous-propriété, et une propriété utilisateur autorise la création de sous-propriété, la création de propriété sœur et la suppression. |

---

**Code source :** `owl_editor.js` → `APEditor._updateButtons()` — Sélectionne les boutons `ap-btn-child`, `ap-btn-sibling`, `ap-btn-delete` et les affiche ou masque (`style.display`) selon que `_selectedId` correspond à une racine de namespace, une propriété built-in (`_isBuiltin()`) ou une propriété utilisateur.

### REQ-AP-023 — Affichage du détail d'une racine de namespace

| **Si** | l'ontologiste sélectionne une racine de namespace dans l'arbre, |
|---|---|
| **Alors** | le panneau de détail présente en lecture seule l'ensemble des propriétés d'annotation intégrées appartenant à ce namespace, avec leur identifiant et leur description, et indique clairement que la racine de namespace n'est pas elle-même une propriété d'annotation. |

---

**Code source :** `owl_editor.js` → `APEditor._renderRootDetail(ns)` — Affiche un panneau listant toutes les entrées de `AP_BUILTINS[ns]` avec leur `id` et `comment`, accompagné d'un badge "Namespace root — not an AnnotationProperty". Aucun formulaire d'édition n'est généré.

### REQ-AP-024 — Affichage du détail d'une propriété built-in (lecture seule)

| **Si** | l'ontologiste sélectionne une propriété d'annotation intégrée OWL 2 dans l'arbre, |
|---|---|
| **Alors** | le panneau de détail présente son identifiant et sa description normative en lecture seule, en indiquant explicitement qu'elle ne peut pas être modifiée. |

---

**Code source :** `owl_editor.js` → `APEditor._renderBuiltinDetail(id)` — Récupère l'entrée correspondante dans `AP_BUILTINS`, affiche `id` et `comment`, et ajoute la mention "Built-in OWL 2 annotation property — read-only." Aucun champ éditable n'est rendu.

### REQ-AP-025 — Formulaire d'édition d'une propriété utilisateur

| **Si** | l'ontologiste sélectionne une propriété d'annotation qu'il a définie, |
|---|---|
| **Alors** | le panneau de détail affiche un formulaire permettant de modifier l'identifiant local de la propriété, de consulter son IRI complète dans l'ontologie, et de gérer ses annotations (labels, commentaires, annotations personnalisées). |

---

**Code source :** `owl_editor.js` → `APEditor._renderForm(id)` — Génère un champ texte `ap-id` avec `oninput="_sanitizeId(this)"` et `onchange="APEditor._autoSave()"`, affiche l'IRI complète construite depuis `APP.state.ontology.id`, le libellé `(instance of owl:AnnotationProperty)`, et pré-remplit les lignes d'annotation existantes via `_annoRow()`.

### REQ-AP-026 — Ajout d'une ligne d'annotation dans le formulaire

| **Si** | l'ontologiste souhaite ajouter une annotation (label, commentaire, ou annotation personnalisée) à une propriété d'annotation utilisateur, |
|---|---|
| **Alors** | une nouvelle ligne vide est insérée dans le formulaire pour saisir la valeur, la langue et, pour les annotations personnalisées, la propriété d'annotation à utiliser. |

---

**Code source :** `owl_editor.js` → `APEditor.addAnnotRow(type, ac)` — Insère une nouvelle ligne dans le tableau `ap-annotations-body` via `_makeAnnotRow(type, 'APEditor', ac)`. Le paramètre `type` peut valoir `'label'`, `'comment'` ou `'other'`. Chaque ligne générée déclenche `APEditor._autoSave()` sur tout changement de valeur.

### REQ-AP-027 — Panneau des super-propriétés avec chaîne d'héritage

| **Si** | l'ontologiste sélectionne une propriété d'annotation dans l'arbre, |
|---|---|
| **Alors** | le panneau des super-propriétés affiche, pour chaque parent direct, la chaîne complète d'héritage jusqu'à la racine de namespace, chaque ancêtre étant présenté avec une indentation croissante et constituant un lien de navigation vers cet ancêtre. |

---

**Code source :** `owl_editor.js` → `APEditor._updateSuperPanel()` — Met à jour le conteneur `ap-super-list`. Pour chaque parent direct, appelle `buildChain(id)` qui remonte récursivement les `subPropertyOf` jusqu'à la racine, ajoute la racine de namespace (`'rdfs:'` ou `'owl:'`) en fin de chaîne, et rend chaque ancêtre avec `padding-left` croissant et un lien `onclick="APP.navigateTo()"`.
