# Exigences — Classes

> Généré le 2026-06-06 | Dérivé strictement du code source | Aucune hallucination

## Table des matières

### Fond
- [REQ-CLS-001 — Construction de l'arbre hiérarchique des classes](#req-cls-001--construction-de-larbre-hiérarchique-des-classes)
- [REQ-CLS-006 — Expansion automatique des ancêtres d'une classe](#req-cls-006--expansion-automatique-des-ancêtres-dune-classe)
- [REQ-CLS-007 — Création d'une classe enfant (sous-classe)](#req-cls-007--création-dune-classe-enfant-sous-classe)
- [REQ-CLS-008 — Création d'une classe sœur (même niveau)](#req-cls-008--création-dune-classe-sœur-même-niveau)
- [REQ-CLS-009 — Suppression de la classe sélectionnée](#req-cls-009--suppression-de-la-classe-sélectionnée)
- [REQ-CLS-011 — Déplacement d'une classe par glisser-déposer](#req-cls-011--déplacement-dune-classe-par-glisser-déposer)
- [REQ-CLS-013 — Sauvegarde automatique lors de l'édition](#req-cls-013--sauvegarde-automatique-lors-de-lédition)
- [REQ-CLS-014 — Sauvegarde/création d'une classe](#req-cls-014--sauvegardecréation-dune-classe)
- [REQ-CLS-015 — Gestion des super-classes (ajout)](#req-cls-015--gestion-des-super-classes-ajout)
- [REQ-CLS-016 — Gestion des super-classes (suppression)](#req-cls-016--gestion-des-super-classes-suppression)
- [REQ-CLS-017 — Gestion des classes équivalentes (ajout)](#req-cls-017--gestion-des-classes-équivalentes-ajout)
- [REQ-CLS-018 — Gestion des classes équivalentes (suppression)](#req-cls-018--gestion-des-classes-équivalentes-suppression)
- [REQ-CLS-019 — Gestion des classes disjointes (ajout)](#req-cls-019--gestion-des-classes-disjointes-ajout)
- [REQ-CLS-020 — Gestion des classes disjointes (suppression)](#req-cls-020--gestion-des-classes-disjointes-suppression)
- [REQ-CLS-024 — Affichage des propriétés héritées (lecture seule)](#req-cls-024--affichage-des-propriétés-héritées-lecture-seule)
- [REQ-CLS-026 — Ajout d'une restriction sur une propriété](#req-cls-026--ajout-dune-restriction-sur-une-propriété)
- [REQ-CLS-027 — Changement de type de restriction](#req-cls-027--changement-de-type-de-restriction)
- [REQ-CLS-029 — Suppression d'une propriété du panneau de restrictions](#req-cls-029--suppression-dune-propriété-du-panneau-de-restrictions)
- [REQ-CLS-030 — Suppression d'une restriction enfant](#req-cls-030--suppression-dune-restriction-enfant)
- [REQ-CLS-031 — Collecte des restrictions pour la sauvegarde](#req-cls-031--collecte-des-restrictions-pour-la-sauvegarde)
- [REQ-CLS-032 — Création rapide d'une ObjectProperty depuis l'onglet Classes](#req-cls-032--création-rapide-dune-objectproperty-depuis-longlet-classes)
- [REQ-CLS-033 — Création rapide d'une DatatypeProperty depuis l'onglet Classes](#req-cls-033--création-rapide-dune-datatypeproperty-depuis-longlet-classes)

### Forme
- [REQ-CLS-002 — Rendu de l'arbre des classes avec nœud racine owl:Thing](#req-cls-002--rendu-de-larbre-des-classes-avec-nœud-racine-owlthing)
- [REQ-CLS-003 — Sélection d'une classe dans l'arbre](#req-cls-003--sélection-dune-classe-dans-larbre)
- [REQ-CLS-004 — Sélection du nœud racine owl:Thing](#req-cls-004--sélection-du-nœud-racine-owlthing)
- [REQ-CLS-005 — Expansion/réduction d'un nœud de l'arbre](#req-cls-005--expansionréduction-dun-nœud-de-larbre)
- [REQ-CLS-010 — Menu contextuel sur un nœud de l'arbre](#req-cls-010--menu-contextuel-sur-un-nœud-de-larbre)
- [REQ-CLS-012 — Formulaire d'édition d'une classe](#req-cls-012--formulaire-dédition-dune-classe)
- [REQ-CLS-021 — Gestion des annotations rdfs:label et rdfs:comment](#req-cls-021--gestion-des-annotations-rdfslabel-et-rdfscomment)
- [REQ-CLS-022 — Gestion des propriétés d'annotation personnalisées](#req-cls-022--gestion-des-propriétés-dannotation-personnalisées)
- [REQ-CLS-023 — Panneau de restrictions et propriétés assertées](#req-cls-023--panneau-de-restrictions-et-propriétés-assertées)
- [REQ-CLS-025 — Ajout d'une propriété dans le panneau de restrictions](#req-cls-025--ajout-dune-propriété-dans-le-panneau-de-restrictions)
- [REQ-CLS-028 — Sélection du filler (classe cible) d'une restriction](#req-cls-028--sélection-du-filler-classe-cible-dune-restriction)
- [REQ-CLS-034 — Affichage de l'IRI complète de la classe](#req-cls-034--affichage-de-liri-complète-de-la-classe)
- [REQ-CLS-035 — Panneau des super-classes avec hiérarchie ancêtres](#req-cls-035--panneau-des-super-classes-avec-hiérarchie-ancêtres)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles OWL, contraintes de données, comportements algorithmiques, validations, persistance.

### REQ-CLS-001 — Construction de l'arbre hiérarchique des classes
**Code source :** `owl_editor.js` → `ClassEditor.buildTree()`

La méthode parcourt le tableau `APP.state.classes`, analyse les relations `subClassOf` textuelles pour identifier les relations parent-enfant internes à l'ontologie. Elle distingue les classes racines locales (sans parent interne connu), les classes racines externes (dont le parent est une URI externe au namespace courant), et construit un dictionnaire `childrenOf` ainsi qu'une liste triée alphabétiquement de `roots` et `externalRoots`.

---

### REQ-CLS-006 — Expansion automatique des ancêtres d'une classe
**Code source :** `owl_editor.js` → `ClassEditor._expandAncestors()`

Lors d'une navigation programmatique vers une classe (par exemple via `APP.navigateTo()`), la méthode remonte récursivement la chaîne `subClassOf` de la classe cible et ajoute chaque ancêtre dans `_expanded`, de façon à ce que la classe soit visible dans l'arbre sans expansion manuelle.

---

### REQ-CLS-007 — Création d'une classe enfant (sous-classe)
**Code source :** `owl_editor.js` → `ClassEditor.createChild()`

Au clic sur le bouton "Child" ou le bouton "＋ Create Class", la méthode détermine le parent courant (classe sélectionnée ou `owl:Thing` si rien n'est sélectionné), puis appelle `_createAndSelect()` avec le tableau `subClassOf` initialisé à `[parentId]`. Si le parent est `owl:Thing` ou la racine personnalisée, `subClassOf` est laissé vide.

---

### REQ-CLS-008 — Création d'une classe sœur (même niveau)
**Code source :** `owl_editor.js` → `ClassEditor.createSibling()`

Au clic sur le bouton "Sister", la méthode récupère les parents textuels de la classe sélectionnée (filtre `subClassOf` sur les chaînes de caractères) et appelle `_createAndSelect()` en passant ce même tableau de parents, créant ainsi une nouvelle classe au même niveau hiérarchique.

---

### REQ-CLS-009 — Suppression de la classe sélectionnée
**Code source :** `owl_editor.js` → `ClassEditor.deleteSelected()`

Le bouton "Delete" déclenche la suppression de la classe courante (`_selectedId`). La méthode appelle `API.updateClass()` ou `API.createClass()` selon le contexte, met à jour `APP.state.classes`, et rafraîchit la section via `APP.renderSection('classes')`.

---

### REQ-CLS-011 — Déplacement d'une classe par glisser-déposer
**Code source :** `owl_editor.js` → `ClassEditor.onDragStart()`, `ClassEditor.onDrop()`

Chaque nœud de l'arbre est draggable. `onDragStart()` mémorise l'identifiant de la classe déplacée dans `_dragId`. `onDrop()` récupère cet identifiant, retire les anciens parents textuels de `subClassOf` (en conservant les restrictions objet), y injecte le nouvel identifiant parent (ou tableau vide si déposé sur `owl:Thing`), appelle `API.updateClass()`, et rafraîchit l'arbre. Le nouveau parent est automatiquement étendu dans `_expanded`.

---

### REQ-CLS-013 — Sauvegarde automatique lors de l'édition
**Code source :** `owl_editor.js` → `ClassEditor.autoSave()`

Lorsqu'une classe existante est en cours d'édition (`_editingId !== null`), tout changement dans les champs du formulaire (annotations, super-classes, équivalences, disjonctions, restrictions) déclenche automatiquement `autoSave()`, qui appelle immédiatement `save(false)` sans navigation ni rechargement.

---

### REQ-CLS-014 — Sauvegarde/création d'une classe
**Code source :** `owl_editor.js` → `ClassEditor.save()`

La méthode lit l'identifiant depuis `#cls-id`, collecte les super-classes textuelles (`.cls-list-item[data-id]` du panneau gauche), les classes équivalentes (`#cls-equivalents-list`), les disjonctions (`#cls-disjoints-list`), les annotations et les restrictions via `RestrictionEditor.collect()`. En mode création (`isNew = true`), elle appelle `API.createClass()` ; en mode édition, elle appelle `API.updateClass(originalId, cls)` et met à jour `APP.state.classes` en mémoire.

---

### REQ-CLS-015 — Gestion des super-classes (ajout)
**Code source :** `owl_editor.js` → `ClassEditor.addSuperClass()`

La méthode ajoute une super-classe sélectionnée via le picker (`cls-super-picker`) dans la liste des super-classes directes. Elle injecte un élément DOM `cls-list-item` avec un lien de navigation vers la classe parente et un bouton de suppression `✕`. Si la classe est en cours d'édition, `autoSave()` est appelé immédiatement.

---

### REQ-CLS-016 — Gestion des super-classes (suppression)
**Code source :** `owl_editor.js` → `ClassEditor.removeSuperClass()`

Au clic sur le bouton `✕` d'une super-classe, la méthode retire l'élément DOM `[data-id]` correspondant de la liste. Si la classe est en cours d'édition, `autoSave()` est appelé.

---

### REQ-CLS-017 — Gestion des classes équivalentes (ajout)
**Code source :** `owl_editor.js` → `ClassEditor.addEquivalent()`

La méthode ajoute une classe équivalente dans la liste `#cls-equivalents-list`. Elle crée un élément DOM incluant un lien de navigation cliquable vers la classe équivalente (via `APP.navigateTo('classes', id)`) et un bouton de suppression. Si la classe est en cours d'édition, `autoSave()` est appelé.

---

### REQ-CLS-018 — Gestion des classes équivalentes (suppression)
**Code source :** `owl_editor.js` → `ClassEditor.removeEquivalent()`

Au clic sur `✕`, la méthode supprime le nœud DOM `#cls-equivalents-list .cls-list-item[data-id="${id}"]` et déclenche `autoSave()` si la classe est en cours d'édition.

---

### REQ-CLS-019 — Gestion des classes disjointes (ajout)
**Code source :** `owl_editor.js` → `ClassEditor.addDisjoint()`

La méthode ajoute une classe disjointe dans la liste `#cls-disjoints-list`, en créant un élément DOM avec le label de la classe et un bouton de suppression. Elle déclenche `autoSave()` si la classe est en cours d'édition.

---

### REQ-CLS-020 — Gestion des classes disjointes (suppression)
**Code source :** `owl_editor.js` → `ClassEditor.removeDisjoint()`

Au clic sur `✕`, la méthode retire l'élément DOM correspondant de `#cls-disjoints-list` et déclenche `autoSave()` si la classe est en cours d'édition.

---

### REQ-CLS-024 — Affichage des propriétés héritées (lecture seule)
**Code source :** `owl_editor.js` → `RestrictionEditor._computeInherited()`, `RestrictionEditor._renderGroupReadOnly()`

`_computeInherited()` traverse récursivement la chaîne `subClassOf` de la classe courante pour collecter toutes les restrictions définies sur les classes ancêtres. `_renderGroupReadOnly()` affiche ces restrictions en lecture seule, avec indication de la classe source (tag "↑ NomClasse") et un lien de navigation vers la propriété.

---

### REQ-CLS-026 — Ajout d'une restriction sur une propriété
**Code source :** `owl_editor.js` → `RestrictionEditor.addRestriction()`, `RestrictionEditor.addRestrictionOfType()`

`addRestriction()` ajoute une restriction de type `someValuesFrom` par défaut sur la propriété sélectionnée. `addRestrictionOfType(type)` (appelée depuis le menu contextuel) permet de choisir parmi six types : `someValuesFrom`, `allValuesFrom`, `hasValue`, `exactCardinality`, `minCardinality`, `maxCardinality`. Les deux méthodes créent un élément DOM via `_renderChild()` et l'ajoutent aux `.restr-children` du groupe concerné.

---

### REQ-CLS-027 — Changement de type de restriction
**Code source :** `owl_editor.js` → `RestrictionEditor.onChildType()`

Lorsque l'utilisateur change le `<select>` de type d'une restriction (`restr-type-sel`), la méthode affiche ou masque le champ de saisie de cardinalité (`restr-card-inp`) et le sélecteur de classe filler selon que le nouveau type contient "Cardinality" ou non. Elle ferme aussi le dropdown filler si on bascule vers un type cardinalité.

---

### REQ-CLS-029 — Suppression d'une propriété du panneau de restrictions
**Code source :** `owl_editor.js` → `RestrictionEditor.deleteProp()`

Au clic sur `✕` au niveau d'un groupe de propriété, la méthode supprime le `.restr-prop-group` du DOM, réinitialise `_selectedProp`, remet la propriété dans le picker `#restr-prop-picker` en ordre alphabétique avec son icône (OP ou DP), et déclenche `autoSave()`.

---

### REQ-CLS-030 — Suppression d'une restriction enfant
**Code source :** `owl_editor.js` → `RestrictionEditor.deleteChild()`

Au clic sur `✕` au niveau d'une ligne de restriction (`restr-child-row`), la méthode retire l'élément DOM identifié par `restr-child-${gid}` et déclenche `autoSave()`.

---

### REQ-CLS-031 — Collecte des restrictions pour la sauvegarde
**Code source :** `owl_editor.js` → `RestrictionEditor.collect()`

La méthode parcourt tous les `.restr-prop-group` du DOM. Pour chaque groupe sans ligne enfant, elle génère un marqueur `{ type: '_marker', property: prop }` (persisté en JSON mais ignoré en RDF) pour conserver la présence de la propriété. Pour chaque ligne, elle lit le type, le filler (ou value pour `hasValue`) et la cardinalité, et retourne un tableau de restrictions structurées.

---

### REQ-CLS-032 — Création rapide d'une ObjectProperty depuis l'onglet Classes
**Code source :** `owl_editor.js` → `ClassEditor.createOPForClass()`

Depuis le bouton "OP" du panneau de restrictions, la méthode récupère l'identifiant de la classe sélectionnée, crée un objet ObjectProperty avec `domain: [classId]` et des tableaux vides pour `range` et `subPropertyOf`, appelle `API.createObjectProperty()`, puis navigue automatiquement vers l'onglet "object-properties" sur la nouvelle propriété.

---

### REQ-CLS-033 — Création rapide d'une DatatypeProperty depuis l'onglet Classes
**Code source :** `owl_editor.js` → `ClassEditor.createDTPForClass()`

Depuis le bouton "DT" du panneau de restrictions, la méthode crée une DatatypeProperty avec `domain: [classId]`, `functional: false`, et appelle `API.createDatatypeProperty()`, puis navigue vers l'onglet "datatype-properties".

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

### REQ-CLS-002 — Rendu de l'arbre des classes avec nœud racine owl:Thing
**Code source :** `owl_editor.js` → `ClassEditor.renderTree()`

La méthode génère le HTML de l'arbre complet. Elle affiche en tête un nœud racine représentant `owl:Thing` (ou le label personnalisé retourné par `APP.getOntologyRootLabels().classRoot`), puis appelle récursivement `_renderNode()` pour chaque classe racine. Si aucune classe locale n'existe, elle affiche un message "No classes".

---

### REQ-CLS-003 — Sélection d'une classe dans l'arbre
**Code source :** `owl_editor.js` → `ClassEditor.selectClass()`

Au clic sur un nœud de l'arbre, la méthode : désélectionne tous les nœuds existants, sélectionne visuellement le nœud dont le `.tree-label` correspond à l'identifiant demandé, charge l'objet classe depuis `APP.state.classes`, injecte le formulaire d'édition via `renderForm()`, met à jour le panneau des super-classes, et active les boutons d'action (Child, Sister, Delete).

---

### REQ-CLS-004 — Sélection du nœud racine owl:Thing
**Code source :** `owl_editor.js` → `ClassEditor.selectOwlThing()`

Au clic sur le nœud racine `owl:Thing`, la méthode sélectionne visuellement ce nœud, affiche dans le panneau de détail un message "Root of all classes" avec un bouton de création de classe, vide le panneau des super-classes, et désactive les boutons Sister et Delete (tout en laissant le bouton Child actif).

---

### REQ-CLS-005 — Expansion/réduction d'un nœud de l'arbre
**Code source :** `owl_editor.js` → `ClassEditor.toggleNode()`

Au clic sur la flèche `▶` d'un nœud, la méthode bascule l'état ouvert/fermé du nœud dans `_expanded` (un `Set`). Elle rafraîchit ensuite le rendu de l'arbre en appelant `buildTree()` sur `APP.state.classes`, puis redessine les nœuds enfants concernés.

---

### REQ-CLS-010 — Menu contextuel sur un nœud de l'arbre
**Code source :** `owl_editor.js` → `ClassEditor.showContextMenu()`

Un clic droit sur un nœud de l'arbre ouvre un menu contextuel positionné aux coordonnées de la souris. Ce menu propose : "Add child class", "Add sibling class" (uniquement si la cible est une classe, pas `owl:Thing`), et "Delete selected class" (en rouge). Un clic extérieur ferme le menu via `_closeContextMenu()`.

---

### REQ-CLS-012 — Formulaire d'édition d'une classe
**Code source :** `owl_editor.js` → `ClassEditor.renderForm()`

La méthode génère le HTML complet du panneau de détail d'une classe. Il contient : un champ texte pour l'identifiant (`cls-id`), le mention "(instance of owl:Class)", l'IRI complète si une base IRI est définie, un tableau d'annotations, le panneau de restrictions (via `RestrictionEditor.renderPanel()`), un bloc "Disjoints" et un bloc "Equivalent". En mode création (nouvelle classe), un bouton "✅ Create class" est affiché.

---

### REQ-CLS-021 — Gestion des annotations rdfs:label et rdfs:comment
**Code source :** `owl_editor.js` → `ClassEditor.addAnnotRow()`

Au clic sur les boutons "+label" ou "+comment", la méthode appelle `_makeAnnotRow(type, 'ClassEditor', ac)` pour créer une ligne de tableau avec un champ texte pour la valeur, un champ de langue (initialisé à `Settings.defaultLang`), et un bouton de suppression. La ligne est insérée dans `#cls-anno-table`. Si la classe est en cours d'édition, les changements déclenchent `autoSave()`.

---

### REQ-CLS-022 — Gestion des propriétés d'annotation personnalisées
**Code source :** `owl_editor.js` → `ClassEditor.addOtherAnnotRow()`

Au clic sur une propriété d'annotation dans le picker `cls-anno-picker`, la méthode appelle `_makeAnnotRow('other', 'ClassEditor', ac, prop)` pour créer une ligne d'annotation avec le nom de la propriété, un champ valeur et un champ langue. Elle est utilisée pour des propriétés telles que `rdfs:seeAlso` ou toute propriété d'annotation définie dans l'ontologie.

---

### REQ-CLS-023 — Panneau de restrictions et propriétés assertées
**Code source :** `owl_editor.js` → `RestrictionEditor.renderPanel()`

La méthode génère le HTML du panneau "Properties and Restrictions" intégré dans le formulaire de classe. Elle appelle `_group()` pour regrouper les restrictions par propriété, affiche deux sections repliables ("Inherited Properties" et "Asserted Properties") avec leur compteur respectif, et expose des boutons pour ajouter une propriété existante, créer une ObjectProperty ou une DatatypeProperty directement depuis ce panneau.

---

### REQ-CLS-025 — Ajout d'une propriété dans le panneau de restrictions
**Code source :** `owl_editor.js` → `RestrictionEditor.addProperty()`

Au clic sur une propriété dans le picker `#restr-prop-picker`, la méthode vérifie si un groupe pour cette propriété existe déjà (si oui, elle le sélectionne seulement), sinon crée un nouveau groupe vide via `_renderGroup()`, l'insère dans `#restr-tree` en ordre alphabétique, et sélectionne immédiatement la propriété. Elle retire la propriété du picker et déclenche `autoSave()`.

---

### REQ-CLS-028 — Sélection du filler (classe cible) d'une restriction
**Code source :** `owl_editor.js` → `RestrictionEditor.toggleFillerPicker()`, `RestrictionEditor.selectFiller()`

`toggleFillerPicker()` ouvre/ferme un dropdown positionné en `position:fixed` sous le bouton filler, en affichant la liste hiérarchique des classes via `_classHierarchyItems()`. `selectFiller()` met à jour la valeur du champ caché `restr-filler-val`, actualise le label affiché, remplace le point coloré (dot), marque l'item sélectionné et déclenche `autoSave()`.

---

### REQ-CLS-034 — Affichage de l'IRI complète de la classe
**Code source :** `owl_editor.js` → `ClassEditor.renderForm()`

Si une base IRI est définie dans les paramètres de l'ontologie (`baseIri`), le formulaire affiche sous le titre la ligne `For Class: <baseIri>#<classId>` en utilisant une balise `<code>`. Cette ligne n'est affichée que si la classe existe déjà (non en mode création pure) et que `baseIri` est non vide.

---

### REQ-CLS-035 — Panneau des super-classes avec hiérarchie ancêtres
**Code source :** `owl_editor.js` → `ClassEditor.renderSplit()` (section `_renderSupersPanel()` interne)

Le panneau gauche bas affiche la liste des super-classes directes avec un bouton de suppression `✕` pour chacune, suivi de leurs ancêtres indirects en italique et opacité réduite (0.75), jusqu'à `owl:Thing` affiché en dernier. Les ancêtres indirects sont cliquables via `APP.navigateTo('classes', id)` mais ne disposent pas de bouton de suppression.
