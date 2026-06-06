# Exigences — Classes

> Généré le 2026-06-06 | Dérivé strictement du code source | Aucune hallucination

## Table des matières

### Fond
- [REQ-CLS-001 — Construction de l'arbre hiérarchique des classes](#req-cls-001--construction-de-larbre-hiérarchique-des-classes)
- [REQ-CLS-002 — Expansion automatique des ancêtres d'une classe](#req-cls-002--expansion-automatique-des-ancêtres-dune-classe)
- [REQ-CLS-003 — Création d'une classe enfant (sous-classe)](#req-cls-003--création-dune-classe-enfant-sous-classe)
- [REQ-CLS-004 — Création d'une classe sœur (même niveau)](#req-cls-004--création-dune-classe-sœur-même-niveau)
- [REQ-CLS-005 — Suppression de la classe sélectionnée](#req-cls-005--suppression-de-la-classe-sélectionnée)
- [REQ-CLS-006 — Déplacement d'une classe par glisser-déposer](#req-cls-006--déplacement-dune-classe-par-glisser-déposer)
- [REQ-CLS-007 — Sauvegarde automatique lors de l'édition](#req-cls-007--sauvegarde-automatique-lors-de-lédition)
- [REQ-CLS-008 — Sauvegarde/création d'une classe](#req-cls-008--sauvegardecréation-dune-classe)
- [REQ-CLS-009 — Gestion des super-classes](#req-cls-009--gestion-des-super-classes)
- [REQ-CLS-010 — Gestion des classes équivalentes](#req-cls-010--gestion-des-classes-équivalentes)
- [REQ-CLS-011 — Gestion des classes disjointes](#req-cls-011--gestion-des-classes-disjointes)
- [REQ-CLS-012 — Affichage des propriétés héritées (lecture seule)](#req-cls-012--affichage-des-propriétés-héritées-lecture-seule)
- [REQ-CLS-013 — Ajout d'une restriction sur une propriété](#req-cls-013--ajout-dune-restriction-sur-une-propriété)
- [REQ-CLS-014 — Changement de type de restriction](#req-cls-014--changement-de-type-de-restriction)
- [REQ-CLS-015 — Suppression d'une propriété du panneau de restrictions](#req-cls-015--suppression-dune-propriété-du-panneau-de-restrictions)
- [REQ-CLS-016 — Suppression d'une restriction enfant](#req-cls-016--suppression-dune-restriction-enfant)
- [REQ-CLS-017 — Collecte des restrictions pour la sauvegarde](#req-cls-017--collecte-des-restrictions-pour-la-sauvegarde)
- [REQ-CLS-018 — Création rapide d'une ObjectProperty depuis l'onglet Classes](#req-cls-018--création-rapide-dune-objectproperty-depuis-longlet-classes)
- [REQ-CLS-019 — Création rapide d'une DatatypeProperty depuis l'onglet Classes](#req-cls-019--création-rapide-dune-datatypeproperty-depuis-longlet-classes)

### Forme
- [REQ-CLS-020 — Rendu de l'arbre des classes avec nœud racine owl:Thing](#req-cls-020--rendu-de-larbre-des-classes-avec-nœud-racine-owlthing)
- [REQ-CLS-021 — Sélection d'une classe dans l'arbre](#req-cls-021--sélection-dune-classe-dans-larbre)
- [REQ-CLS-022 — Sélection du nœud racine owl:Thing](#req-cls-022--sélection-du-nœud-racine-owlthing)
- [REQ-CLS-023 — Expansion/réduction d'un nœud de l'arbre](#req-cls-023--expansionréduction-dun-nœud-de-larbre)
- [REQ-CLS-024 — Menu contextuel sur un nœud de l'arbre](#req-cls-024--menu-contextuel-sur-un-nœud-de-larbre)
- [REQ-CLS-025 — Formulaire d'édition d'une classe](#req-cls-025--formulaire-dédition-dune-classe)
- [REQ-CLS-026 — Gestion des annotations rdfs:label et rdfs:comment](#req-cls-026--gestion-des-annotations-rdfslabel-et-rdfscomment)
- [REQ-CLS-027 — Gestion des propriétés d'annotation personnalisées](#req-cls-027--gestion-des-propriétés-dannotation-personnalisées)
- [REQ-CLS-028 — Panneau de restrictions et propriétés assertées](#req-cls-028--panneau-de-restrictions-et-propriétés-assertées)
- [REQ-CLS-029 — Ajout d'une propriété dans le panneau de restrictions](#req-cls-029--ajout-dune-propriété-dans-le-panneau-de-restrictions)
- [REQ-CLS-030 — Sélection du filler (classe cible) d'une restriction](#req-cls-030--sélection-du-filler-classe-cible-dune-restriction)
- [REQ-CLS-031 — Affichage de l'IRI complète de la classe](#req-cls-031--affichage-de-liri-complète-de-la-classe)
- [REQ-CLS-032 — Panneau des super-classes avec hiérarchie ancêtres](#req-cls-032--panneau-des-super-classes-avec-hiérarchie-ancêtres)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles OWL, contraintes de données, comportements algorithmiques, validations, persistance.


### REQ-CLS-001 — Construction de l'arbre hiérarchique des classes

**Si** l'ontologie est chargée et contient des classes dans `APP.state.classes` reliées par des relations `subClassOf`,

**Alors** le système :
- construit un dictionnaire hiérarchique (`childrenOf`) en analysant les relations parent-enfant internes,
- distingue les classes racines locales (sans parent interne connu) des classes racines externes (dont le parent est une URI hors namespace courant),
- produit une liste `roots` et une liste `externalRoots` triées alphabétiquement, utilisées pour afficher l'arbre des classes.

**Code source :** `owl_editor.js` → `ClassEditor.buildTree()`

---

### REQ-CLS-002 — Expansion automatique des ancêtres d'une classe

**Si** une navigation programmatique vers une classe est déclenchée (par exemple via `APP.navigateTo()`),

**Alors** le système remonte récursivement la chaîne `subClassOf` de la classe cible et ajoute chaque ancêtre dans `_expanded`, de façon à ce que la classe soit visible dans l'arbre sans expansion manuelle de la part de l'utilisateur.

**Code source :** `owl_editor.js` → `ClassEditor._expandAncestors()`

---

### REQ-CLS-003 — Création d'une classe enfant (sous-classe)

**Si** l'utilisateur clique sur le bouton "Child" ou le bouton "＋ Create Class"
**et** qu'une classe est sélectionnée dans l'arbre (ou qu'aucune sélection n'est active),

**Alors** :
- si une classe est sélectionnée, une nouvelle sous-classe est créée avec `subClassOf` initialisé à `[parentId]`,
- si la sélection est `owl:Thing` ou la racine personnalisée, `subClassOf` est laissé vide,
- la nouvelle classe est immédiatement sélectionnée dans l'arbre.

**Code source :** `owl_editor.js` → `ClassEditor.createChild()`

---

### REQ-CLS-004 — Création d'une classe sœur (même niveau)

**Si** l'utilisateur clique sur le bouton "Sister"
**et** qu'une classe est sélectionnée dans l'arbre,

**Alors** le système récupère les parents textuels de la classe sélectionnée (issus de `subClassOf`) et crée une nouvelle classe avec ce même tableau de parents, la positionnant ainsi au même niveau hiérarchique que la classe d'origine.

**Code source :** `owl_editor.js` → `ClassEditor.createSibling()`

---

### REQ-CLS-005 — Suppression de la classe sélectionnée

**Si** l'utilisateur clique sur le bouton "Delete"
**et** qu'une classe est sélectionnée (`_selectedId`),

**Alors** le système supprime la classe courante, met à jour `APP.state.classes` en mémoire, et rafraîchit la section via `APP.renderSection('classes')`.

**Code source :** `owl_editor.js` → `ClassEditor.deleteSelected()`

---

### REQ-CLS-006 — Déplacement d'une classe par glisser-déposer

**Si** l'utilisateur fait glisser un nœud de l'arbre (`onDragStart`) puis le dépose sur un nœud cible (`onDrop`),

**Alors** :
- l'identifiant de la classe déplacée est mémorisé dans `_dragId` au début du glisser,
- lors du dépôt, les anciens parents textuels de `subClassOf` sont retirés (les restrictions objet sont conservées),
- le nouvel identifiant parent est injecté dans `subClassOf` (ou un tableau vide si déposé sur `owl:Thing`),
- `API.updateClass()` est appelé et l'arbre est rafraîchi,
- le nouveau parent est automatiquement étendu dans `_expanded`.

**Code source :** `owl_editor.js` → `ClassEditor.onDragStart()` | `ClassEditor.onDrop()`

---

### REQ-CLS-007 — Sauvegarde automatique lors de l'édition

**Si** une classe existante est en cours d'édition (`_editingId !== null`)
**et** que l'utilisateur modifie un champ du formulaire (annotations, super-classes, équivalences, disjonctions, restrictions),

**Alors** le système déclenche automatiquement `autoSave()`, qui appelle `save(false)` immédiatement, sans navigation ni rechargement de la vue.

**Code source :** `owl_editor.js` → `ClassEditor.autoSave()`

---

### REQ-CLS-008 — Sauvegarde/création d'une classe

**Si** l'utilisateur valide le formulaire d'une classe (nouvelle ou existante),

**Alors** le système :
- lit l'identifiant depuis `#cls-id`,
- collecte les super-classes textuelles, les classes équivalentes, les disjonctions, les annotations et les restrictions via `RestrictionEditor.collect()`,
- appelle `API.createClass()` en mode création (`isNew = true`) ou `API.updateClass(originalId, cls)` en mode édition,
- met à jour `APP.state.classes` en mémoire.

**Code source :** `owl_editor.js` → `ClassEditor.save()`

---

### REQ-CLS-009 — Gestion des super-classes

**Si** l'utilisateur sélectionne une super-classe via le picker `cls-super-picker` et clique sur "Ajouter",

**Alors** le système injecte un élément DOM `cls-list-item` dans la liste des super-classes directes, avec un lien de navigation vers la classe parente et un bouton de suppression `✕`.

**Si** l'utilisateur clique sur le bouton `✕` d'une super-classe,

**Alors** le système retire l'élément DOM `[data-id]` correspondant de la liste.

Dans les deux cas, si la classe est en cours d'édition, `autoSave()` est appelé immédiatement.

**Code source :** `owl_editor.js` → `ClassEditor.addSuperClass()` | `ClassEditor.removeSuperClass()`

---

### REQ-CLS-010 — Gestion des classes équivalentes

**Si** l'utilisateur ajoute une classe équivalente via le picker dédié,

**Alors** le système crée un élément DOM dans `#cls-equivalents-list` incluant un lien de navigation cliquable vers la classe équivalente (via `APP.navigateTo('classes', id)`) et un bouton de suppression `✕`.

**Si** l'utilisateur clique sur le bouton `✕` d'une classe équivalente,

**Alors** le système supprime le nœud DOM `#cls-equivalents-list .cls-list-item[data-id="${id}"]`.

Dans les deux cas, `autoSave()` est déclenché si la classe est en cours d'édition.

**Code source :** `owl_editor.js` → `ClassEditor.addEquivalent()` | `ClassEditor.removeEquivalent()`

---

### REQ-CLS-011 — Gestion des classes disjointes

**Si** l'utilisateur ajoute une classe disjointe via le picker dédié,

**Alors** le système crée un élément DOM dans `#cls-disjoints-list` avec le label de la classe et un bouton de suppression `✕`.

**Si** l'utilisateur clique sur le bouton `✕` d'une classe disjointe,

**Alors** le système retire l'élément DOM correspondant de `#cls-disjoints-list`.

Dans les deux cas, `autoSave()` est déclenché si la classe est en cours d'édition.

**Code source :** `owl_editor.js` → `ClassEditor.addDisjoint()` | `ClassEditor.removeDisjoint()`

---

### REQ-CLS-012 — Affichage des propriétés héritées (lecture seule)

**Si** l'ontologie est chargée et que la classe courante possède des classes ancêtres définissant des restrictions,

**Alors** le système traverse récursivement la chaîne `subClassOf` de la classe courante, collecte toutes les restrictions définies sur les ancêtres, et les affiche en lecture seule avec l'indication de la classe source (tag "↑ NomClasse") et un lien de navigation vers la propriété concernée.

**Code source :** `owl_editor.js` → `RestrictionEditor._computeInherited()` | `RestrictionEditor._renderGroupReadOnly()`

---

### REQ-CLS-013 — Ajout d'une restriction sur une propriété

**Si** l'utilisateur ajoute une restriction depuis le panneau de restrictions (bouton par défaut ou menu contextuel),

**Alors** :
- le bouton par défaut crée une restriction de type `someValuesFrom`,
- le menu contextuel permet de choisir parmi six types : `someValuesFrom`, `allValuesFrom`, `hasValue`, `exactCardinality`, `minCardinality`, `maxCardinality`,
- dans les deux cas, un élément DOM est créé via `_renderChild()` et ajouté aux `.restr-children` du groupe de la propriété concernée.

**Code source :** `owl_editor.js` → `RestrictionEditor.addRestriction()` | `RestrictionEditor.addRestrictionOfType()`

---

### REQ-CLS-014 — Changement de type de restriction

**Si** l'utilisateur change la valeur du `<select>` de type d'une restriction (`restr-type-sel`),

**Alors** le système :
- affiche le champ de saisie de cardinalité (`restr-card-inp`) si le nouveau type contient "Cardinality", et le masque sinon,
- affiche ou masque le sélecteur de classe filler selon le même critère,
- ferme le dropdown filler si on bascule vers un type cardinalité.

**Code source :** `owl_editor.js` → `RestrictionEditor.onChildType()`

---

### REQ-CLS-015 — Suppression d'une propriété du panneau de restrictions

**Si** l'utilisateur clique sur le bouton `✕` au niveau d'un groupe de propriété dans le panneau de restrictions,

**Alors** le système :
- supprime le `.restr-prop-group` correspondant du DOM,
- réinitialise `_selectedProp`,
- remet la propriété dans le picker `#restr-prop-picker` en ordre alphabétique avec son icône (OP ou DP),
- déclenche `autoSave()`.

**Code source :** `owl_editor.js` → `RestrictionEditor.deleteProp()`

---

### REQ-CLS-016 — Suppression d'une restriction enfant

**Si** l'utilisateur clique sur le bouton `✕` au niveau d'une ligne de restriction (`restr-child-row`),

**Alors** le système retire l'élément DOM identifié par `restr-child-${gid}` et déclenche `autoSave()`.

**Code source :** `owl_editor.js` → `RestrictionEditor.deleteChild()`

---

### REQ-CLS-017 — Collecte des restrictions pour la sauvegarde

**Si** une sauvegarde de classe est déclenchée et que le panneau de restrictions contient des groupes de propriétés,

**Alors** le système :
- pour chaque groupe sans ligne enfant, génère un marqueur `{ type: '_marker', property: prop }` (persisté en JSON mais ignoré en RDF) afin de conserver la présence de la propriété,
- pour chaque ligne de restriction, lit le type, le filler (ou la valeur pour `hasValue`) et la cardinalité,
- retourne un tableau structuré de toutes les restrictions collectées.

**Code source :** `owl_editor.js` → `RestrictionEditor.collect()`

---

### REQ-CLS-018 — Création rapide d'une ObjectProperty depuis l'onglet Classes

**Si** l'utilisateur clique sur le bouton "OP" du panneau de restrictions
**et** qu'une classe est sélectionnée,

**Alors** le système crée une ObjectProperty avec `domain: [classId]` et des tableaux vides pour `range` et `subPropertyOf` via `API.createObjectProperty()`, puis navigue automatiquement vers l'onglet "object-properties" sur la nouvelle propriété.

**Code source :** `owl_editor.js` → `ClassEditor.createOPForClass()`

---

### REQ-CLS-019 — Création rapide d'une DatatypeProperty depuis l'onglet Classes

**Si** l'utilisateur clique sur le bouton "DT" du panneau de restrictions
**et** qu'une classe est sélectionnée,

**Alors** le système crée une DatatypeProperty avec `domain: [classId]` et `functional: false` via `API.createDatatypeProperty()`, puis navigue automatiquement vers l'onglet "datatype-properties".

**Code source :** `owl_editor.js` → `ClassEditor.createDTPForClass()`

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

### REQ-CLS-020 — Rendu de l'arbre des classes avec nœud racine owl:Thing

**Si** l'ontologie est chargée et que l'onglet Classes est affiché,

**Alors** le système génère le HTML de l'arbre complet en affichant en tête un nœud racine représentant `owl:Thing` (ou le label personnalisé retourné par `APP.getOntologyRootLabels().classRoot`), puis appelle récursivement `_renderNode()` pour chaque classe racine. Si aucune classe locale n'existe, un message "No classes" est affiché.

**Code source :** `owl_editor.js` → `ClassEditor.renderTree()`

---

### REQ-CLS-021 — Sélection d'une classe dans l'arbre

**Si** l'utilisateur clique sur un nœud de l'arbre des classes,

**Alors** le système :
- désélectionne tous les nœuds existants,
- sélectionne visuellement le nœud dont le `.tree-label` correspond à l'identifiant demandé,
- charge l'objet classe depuis `APP.state.classes`,
- injecte le formulaire d'édition via `renderForm()`,
- met à jour le panneau des super-classes,
- active les boutons d'action (Child, Sister, Delete).

**Code source :** `owl_editor.js` → `ClassEditor.selectClass()`

---

### REQ-CLS-022 — Sélection du nœud racine owl:Thing

**Si** l'utilisateur clique sur le nœud racine `owl:Thing` dans l'arbre,

**Alors** le système :
- sélectionne visuellement ce nœud,
- affiche dans le panneau de détail un message "Root of all classes" avec un bouton de création de classe,
- vide le panneau des super-classes,
- désactive les boutons Sister et Delete (tout en laissant le bouton Child actif).

**Code source :** `owl_editor.js` → `ClassEditor.selectOwlThing()`

---

### REQ-CLS-023 — Expansion/réduction d'un nœud de l'arbre

**Si** l'utilisateur clique sur la flèche `▶` d'un nœud de l'arbre,

**Alors** le système bascule l'état ouvert/fermé du nœud dans `_expanded` (un `Set`), rafraîchit le rendu de l'arbre en appelant `buildTree()` sur `APP.state.classes`, puis redessine les nœuds enfants concernés.

**Code source :** `owl_editor.js` → `ClassEditor.toggleNode()`

---

### REQ-CLS-024 — Menu contextuel sur un nœud de l'arbre

**Si** l'utilisateur effectue un clic droit sur un nœud de l'arbre,

**Alors** le système ouvre un menu contextuel positionné aux coordonnées de la souris, proposant :
- "Add child class",
- "Add sibling class" (uniquement si la cible est une classe, pas `owl:Thing`),
- "Delete selected class" (en rouge).

**Si** l'utilisateur clique en dehors du menu,

**Alors** le menu est fermé via `_closeContextMenu()`.

**Code source :** `owl_editor.js` → `ClassEditor.showContextMenu()`

---

### REQ-CLS-025 — Formulaire d'édition d'une classe

**Si** une classe est sélectionnée dans l'arbre ou qu'une nouvelle classe est en cours de création,

**Alors** le système génère le HTML complet du panneau de détail contenant :
- un champ texte pour l'identifiant (`cls-id`) avec la mention "(instance of owl:Class)",
- l'IRI complète si une base IRI est définie,
- un tableau d'annotations,
- le panneau de restrictions (via `RestrictionEditor.renderPanel()`),
- un bloc "Disjoints" et un bloc "Equivalent",
- en mode création uniquement, un bouton "✅ Create class".

**Code source :** `owl_editor.js` → `ClassEditor.renderForm()`

---

### REQ-CLS-026 — Gestion des annotations rdfs:label et rdfs:comment

**Si** l'utilisateur clique sur le bouton "+label" ou "+comment" dans le formulaire de classe,

**Alors** le système crée une ligne de tableau via `_makeAnnotRow(type, 'ClassEditor', ac)` contenant un champ texte pour la valeur, un champ de langue (initialisé à `Settings.defaultLang`) et un bouton de suppression, puis insère cette ligne dans `#cls-anno-table`. Si la classe est en cours d'édition, tout changement dans cette ligne déclenche `autoSave()`.

**Code source :** `owl_editor.js` → `ClassEditor.addAnnotRow()`

---

### REQ-CLS-027 — Gestion des propriétés d'annotation personnalisées

**Si** l'utilisateur sélectionne une propriété d'annotation dans le picker `cls-anno-picker`,

**Alors** le système crée une ligne d'annotation via `_makeAnnotRow('other', 'ClassEditor', ac, prop)` affichant le nom de la propriété, un champ valeur et un champ langue, pour des propriétés telles que `rdfs:seeAlso` ou toute propriété d'annotation définie dans l'ontologie.

**Code source :** `owl_editor.js` → `ClassEditor.addOtherAnnotRow()`

---

### REQ-CLS-028 — Panneau de restrictions et propriétés assertées

**Si** le formulaire d'une classe est affiché,

**Alors** le système génère le HTML du panneau "Properties and Restrictions" en :
- appelant `_group()` pour regrouper les restrictions par propriété,
- affichant deux sections repliables ("Inherited Properties" et "Asserted Properties") avec leur compteur respectif,
- exposant des boutons pour ajouter une propriété existante, créer une ObjectProperty ou une DatatypeProperty directement depuis ce panneau.

**Code source :** `owl_editor.js` → `RestrictionEditor.renderPanel()`

---

### REQ-CLS-029 — Ajout d'une propriété dans le panneau de restrictions

**Si** l'utilisateur clique sur une propriété dans le picker `#restr-prop-picker`,

**Alors** le système :
- vérifie si un groupe pour cette propriété existe déjà dans `#restr-tree` (si oui, le sélectionne seulement),
- sinon, crée un nouveau groupe vide via `_renderGroup()` et l'insère en ordre alphabétique,
- sélectionne immédiatement la propriété,
- retire la propriété du picker,
- déclenche `autoSave()`.

**Code source :** `owl_editor.js` → `RestrictionEditor.addProperty()`

---

### REQ-CLS-030 — Sélection du filler (classe cible) d'une restriction

**Si** l'utilisateur clique sur le bouton filler d'une restriction,

**Alors** le système ouvre ou ferme un dropdown positionné en `position:fixed` sous le bouton, affichant la liste hiérarchique des classes via `_classHierarchyItems()`.

**Si** l'utilisateur sélectionne une classe dans ce dropdown,

**Alors** le système met à jour la valeur du champ caché `restr-filler-val`, actualise le label affiché, remplace le point coloré (dot), marque l'item sélectionné et déclenche `autoSave()`.

**Code source :** `owl_editor.js` → `RestrictionEditor.toggleFillerPicker()` | `RestrictionEditor.selectFiller()`

---

### REQ-CLS-031 — Affichage de l'IRI complète de la classe

**Si** une base IRI est définie dans les paramètres de l'ontologie (`baseIri`)
**et** que la classe existe déjà (non en mode création pure),

**Alors** le formulaire affiche sous le titre la ligne `For Class: <baseIri>#<classId>` au sein d'une balise `<code>`.

**Code source :** `owl_editor.js` → `ClassEditor.renderForm()`

---

### REQ-CLS-032 — Panneau des super-classes avec hiérarchie ancêtres

**Si** une classe possédant des super-classes est sélectionnée dans l'arbre,

**Alors** le panneau gauche bas affiche :
- la liste des super-classes directes avec un bouton de suppression `✕` pour chacune,
- leurs ancêtres indirects en italique et opacité réduite (0.75), jusqu'à `owl:Thing` affiché en dernier,
- les ancêtres indirects sont cliquables via `APP.navigateTo('classes', id)` mais ne disposent pas de bouton de suppression.

**Code source :** `owl_editor.js` → `ClassEditor.renderSplit()` (section `_renderSupersPanel()` interne)
