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

| **Si** | l'`ontologie` est chargée et contient des `classes` organisées en hiérarchie via des relations de spécialisation, |
|---|---|
| **Alors** | l'arbre des `classes` reflète fidèlement ces relations : les `classes` racines (sans super-`classe` interne) apparaissent en tête, les `classes` dont le parent appartient à un espace de nommage externe sont distinguées, et l'ensemble est trié alphabétiquement à chaque niveau. |

**Code source :** `owl_editor.js` → `ClassEditor.buildTree()` — Analyse les relations `subClassOf`, construit un dictionnaire `childrenOf` et une liste `externalRoots` pour les classes dont le parent est hors namespace, puis produit les listes `roots` et `externalRoots` triées alphabétiquement pour le rendu de l'arbre.

---

### REQ-CLS-002 — Expansion automatique des ancêtres d'une classe

| **Si** | l'application navigue vers une `classe` spécifique (par exemple suite à une création ou un lien interne), |
|---|---|
| **Alors** | tous les nœuds ancêtres de cette `classe` sont automatiquement dépliés dans l'arbre, rendant la `classe` immédiatement visible sans que l'`ontologiste` ait à développer manuellement chaque niveau. |

**Code source :** `owl_editor.js` → `ClassEditor._expandAncestors()` — Remonte récursivement la chaîne `subClassOf` de la classe cible et ajoute chaque ancêtre dans le `Set` `_expanded`, déclenchant un re-rendu de l'arbre.

---

### REQ-CLS-003 — Création d'une classe enfant (sous-classe)

| **Si** | l'`ontologiste` souhaite spécialiser un concept existant en créant une sous-`classe`, |
|---|---|
| **Alors** | la nouvelle `classe` est automatiquement positionnée sous le concept parent sélectionné dans la hiérarchie, sans manipulation supplémentaire. Si aucune `classe` n'est sélectionnée (ou si la racine est sélectionnée), la `classe` est créée sans super-`classe`. Dans tous les cas, la nouvelle `classe` est immédiatement sélectionnée et prête à être éditée. |

**Code source :** `owl_editor.js` → `ClassEditor.createChild()` — Crée une entrée OWL avec `subClassOf: [parentId]` si une classe est sélectionnée (tableau vide si la sélection est `owl:Thing` ou la racine personnalisée), l'insère dans `APP.state.classes` et déclenche la navigation vers la nouvelle classe.

---

### REQ-CLS-004 — Création d'une classe sœur (même niveau)

| **Si** | l'`ontologiste` souhaite créer un concept parallèle à un concept existant, au même niveau de spécialisation, |
|---|---|
| **Alors** | la nouvelle `classe` hérite des mêmes super-`classes` que la `classe` de référence, la plaçant automatiquement au même niveau dans la hiérarchie sans que l'`ontologiste` ait à reconfigurer les relations de spécialisation. |

**Code source :** `owl_editor.js` → `ClassEditor.createSibling()` — Lit le tableau `subClassOf` de la classe sélectionnée et crée une nouvelle classe avec ce même tableau de parents, puis navigue vers la nouvelle entrée.

---

### REQ-CLS-005 — Suppression de la classe sélectionnée

| **Si** | l'`ontologiste` souhaite supprimer le concept actuellement sélectionné dans l'arbre, |
|---|---|
| **Alors** | la `classe` est supprimée de l'`ontologie` et l'arbre est mis à jour pour refléter cet état sans rechargement de la page. |

**Code source :** `owl_editor.js` → `ClassEditor.deleteSelected()` — Supprime la classe identifiée par `_selectedId` via `API.deleteClass()`, met à jour `APP.state.classes` en mémoire et rafraîchit la section via `APP.renderSection('classes')`.

---

### REQ-CLS-006 — Déplacement d'une classe par glisser-déposer

| **Si** | l'`ontologiste` réorganise la hiérarchie en faisant glisser une `classe` vers un nouveau nœud parent, |
|---|---|
| **Alors** | la `classe` déplacée est rattachée au nouveau parent, ses anciens liens de spécialisation sont remplacés par ce nouveau lien (les `restrictions` de `propriétés` objet définies sur la `classe` sont préservées), et le nouveau nœud parent est automatiquement déplié pour rendre la `classe` déplacée visible. |

**Code source :** `owl_editor.js` → `ClassEditor.onDragStart()` | `ClassEditor.onDrop()` — `onDragStart` mémorise l'identifiant dans `_dragId` ; `onDrop` filtre les anciens parents textuels de `subClassOf` (en conservant les restrictions objet), injecte le nouvel identifiant parent (tableau vide si dépôt sur `owl:Thing`), appelle `API.updateClass()` et ajoute le parent dans `_expanded`.

---

### REQ-CLS-007 — Sauvegarde automatique lors de l'édition

| **Si** | l'`ontologiste` modifie n'importe quel champ d'une `classe` déjà existante (annotations, super-`classes`, équivalences, disjonctions, `restrictions`), |
|---|---|
| **Alors** | les modifications sont sauvegardées immédiatement et silencieusement, sans que l'`ontologiste` ait à confirmer explicitement chaque changement. |

**Code source :** `owl_editor.js` → `ClassEditor.autoSave()` — Vérifie que `_editingId !== null` puis appelle `save(false)` en mode silencieux (sans navigation ni rechargement de la vue).

---

### REQ-CLS-008 — Sauvegarde/création d'une classe

| **Si** | l'`ontologiste` valide le formulaire d'une `classe` (nouvelle ou existante), |
|---|---|
| **Alors** | toutes les informations saisies (identifiant, super-`classes`, `classes` équivalentes, disjonctions, annotations, `restrictions`) sont consolidées et persistées dans l'`ontologie`, que ce soit en création ou en mise à jour d'un concept existant. |

**Code source :** `owl_editor.js` → `ClassEditor.save()` — Lit l'identifiant depuis `#cls-id`, collecte les super-classes textuelles, les classes équivalentes, les disjonctions, les annotations et les restrictions via `RestrictionEditor.collect()`, puis appelle `API.createClass()` (mode création, `isNew = true`) ou `API.updateClass(originalId, cls)` (mode édition) et met à jour `APP.state.classes` en mémoire.

---

### REQ-CLS-009 — Gestion des super-classes

| **Si** | l'`ontologiste` ajoute une super-`classe` à un concept, |
|---|---|
| **Alors** | la relation de spécialisation est matérialisée dans le panneau dédié avec un lien de navigation vers la `classe` parente et la possibilité de la retirer. |

| **Si** | l'`ontologiste` retire une super-`classe` d'un concept, |
|---|---|
| **Alors** | la relation de spécialisation correspondante est supprimée du panneau. |

Dans les deux cas, si la classe est en cours d'édition, la modification est sauvegardée automatiquement.

**Code source :** `owl_editor.js` → `ClassEditor.addSuperClass()` — Injecte un élément DOM `cls-list-item` dans la liste des super-classes directes avec un lien `APP.navigateTo` et un bouton `✕` ; déclenche `autoSave()`. | `ClassEditor.removeSuperClass()` — Retire le nœud DOM `[data-id]` correspondant et déclenche `autoSave()`.

---

### REQ-CLS-010 — Gestion des classes équivalentes

| **Si** | l'`ontologiste` déclare deux `classes` comme équivalentes, |
|---|---|
| **Alors** | la `classe` équivalente apparaît dans le panneau dédié avec un lien de navigation cliquable vers celle-ci et la possibilité de retirer l'équivalence. |

| **Si** | l'`ontologiste` retire une équivalence entre deux `classes`, |
|---|---|
| **Alors** | la relation d'équivalence est supprimée du panneau. |

Dans les deux cas, la modification est sauvegardée automatiquement si la classe est en cours d'édition.

**Code source :** `owl_editor.js` → `ClassEditor.addEquivalent()` — Crée un élément DOM dans `#cls-equivalents-list` avec un lien `APP.navigateTo('classes', id)` et un bouton `✕` ; déclenche `autoSave()`. | `ClassEditor.removeEquivalent()` — Supprime le nœud `#cls-equivalents-list .cls-list-item[data-id="${id}"]` et déclenche `autoSave()`.

---

### REQ-CLS-011 — Gestion des classes disjointes

| **Si** | l'`ontologiste` déclare deux `classes` comme disjointes, |
|---|---|
| **Alors** | la `classe` disjointe apparaît dans le panneau dédié avec la possibilité de retirer la disjonction. |

| **Si** | l'`ontologiste` retire une disjonction entre deux `classes`, |
|---|---|
| **Alors** | la relation de disjonction est supprimée du panneau. |

Dans les deux cas, la modification est sauvegardée automatiquement si la classe est en cours d'édition.

**Code source :** `owl_editor.js` → `ClassEditor.addDisjoint()` — Crée un élément DOM dans `#cls-disjoints-list` avec le label de la classe et un bouton `✕` ; déclenche `autoSave()`. | `ClassEditor.removeDisjoint()` — Retire l'élément DOM correspondant de `#cls-disjoints-list` et déclenche `autoSave()`.

---

### REQ-CLS-012 — Affichage des propriétés héritées (lecture seule)

| **Si** | la `classe` sélectionnée possède des ancêtres qui définissent des `restrictions` sur des `propriétés`, |
|---|---|
| **Alors** | ces `restrictions` héritées sont affichées en lecture seule dans le panneau de la `classe` courante, avec indication de la `classe` ancêtre qui les définit et un lien de navigation vers la `propriété` concernée, permettant à l'`ontologiste` de comprendre le profil complet du concept sans modifier les définitions héritées. |

**Code source :** `owl_editor.js` → `RestrictionEditor._computeInherited()` — Traverse récursivement la chaîne `subClassOf` de la classe courante et collecte toutes les restrictions des ancêtres. | `RestrictionEditor._renderGroupReadOnly()` — Affiche chaque groupe hérité en lecture seule avec un tag "↑ NomClasse" et un lien de navigation vers la propriété.

---

### REQ-CLS-013 — Ajout d'une restriction sur une propriété

| **Si** | l'`ontologiste` souhaite contraindre l'usage d'une `propriété` pour une `classe`, |
|---|---|
| **Alors** | il peut ajouter une `restriction` en choisissant parmi six types sémantiques (existence, universalité, valeur individuelle, cardinalité exacte, minimale ou maximale), ou utiliser le type par défaut (existence) d'un simple clic. |

**Code source :** `owl_editor.js` → `RestrictionEditor.addRestriction()` — Crée une restriction de type `someValuesFrom` par défaut et l'insère via `_renderChild()` dans les `.restr-children` du groupe de la propriété. | `RestrictionEditor.addRestrictionOfType()` — Même comportement pour les types `allValuesFrom`, `hasValue`, `exactCardinality`, `minCardinality`, `maxCardinality` sélectionnés depuis le menu contextuel.

---

### REQ-CLS-014 — Changement de type de restriction

| **Si** | l'`ontologiste` change le type d'une `restriction` existante sur une `propriété`, |
|---|---|
| **Alors** | le formulaire de saisie s'adapte immédiatement : le champ de cardinalité apparaît pour les types cardinaux et disparaît pour les autres, et le sélecteur de `classe` cible (filler) se masque automatiquement lorsqu'un type cardinal est choisi. |

**Code source :** `owl_editor.js` → `RestrictionEditor.onChildType()` — Lit la valeur du `<select>` `restr-type-sel`, affiche/masque `restr-card-inp` et le sélecteur filler selon que le type contient "Cardinality", et ferme le dropdown filler le cas échéant.

---

### REQ-CLS-015 — Suppression d'une propriété du panneau de restrictions

| **Si** | l'`ontologiste` souhaite retirer entièrement une `propriété` du panneau de `restrictions` d'une `classe`, |
|---|---|
| **Alors** | la `propriété` et toutes ses `restrictions` associées sont supprimées du panneau, la `propriété` redevient disponible dans la liste des `propriétés` à ajouter (triée alphabétiquement avec son type), et la modification est sauvegardée automatiquement. |

**Code source :** `owl_editor.js` → `RestrictionEditor.deleteProp()` — Supprime le `.restr-prop-group` du DOM, réinitialise `_selectedProp`, réinsère la propriété dans le picker `#restr-prop-picker` en ordre alphabétique avec son icône (OP ou DP), et déclenche `autoSave()`.

---

### REQ-CLS-016 — Suppression d'une restriction enfant

| **Si** | l'`ontologiste` souhaite supprimer une `restriction` individuelle au sein d'un groupe de `propriété`, |
|---|---|
| **Alors** | seule cette `restriction` est retirée, les autres `restrictions` de la même `propriété` restant intactes, et la modification est sauvegardée automatiquement. |

**Code source :** `owl_editor.js` → `RestrictionEditor.deleteChild()` — Retire l'élément DOM identifié par `restr-child-${gid}` et déclenche `autoSave()`.

---

### REQ-CLS-017 — Collecte des restrictions pour la sauvegarde

| **Si** | une sauvegarde de `classe` est déclenchée et que le panneau de `restrictions` contient des `propriétés` déclarées, |
|---|---|
| **Alors** | toutes les `restrictions` saisies sont consolidées pour la persistance : les `propriétés` sans `restriction` explicite sont conservées comme marqueurs de présence, et chaque `restriction` est enregistrée avec son type, sa `classe` cible ou valeur, et sa cardinalité le cas échéant. |

**Code source :** `owl_editor.js` → `RestrictionEditor.collect()` — Pour chaque groupe sans ligne enfant, génère un marqueur `{ type: '_marker', property: prop }` (persisté en JSON mais ignoré en RDF). Pour chaque ligne, lit le type depuis `restr-type-sel`, le filler depuis `restr-filler-val` (ou la valeur pour `hasValue`) et la cardinalité depuis `restr-card-inp`. Retourne un tableau structuré de toutes les restrictions.

---

### REQ-CLS-018 — Création rapide d'une ObjectProperty depuis l'onglet Classes

| **Si** | l'`ontologiste` souhaite créer une `propriété` objet directement associée à la `classe` qu'il est en train d'éditer, |
|---|---|
| **Alors** | une nouvelle `propriété` objet est créée avec la `classe` courante déclarée comme domaine, et l'application navigue automatiquement vers cette `propriété` pour que l'`ontologiste` puisse la compléter sans perdre le contexte. |

**Code source :** `owl_editor.js` → `ClassEditor.createOPForClass()` — Crée une ObjectProperty avec `domain: [classId]`, `range: []` et `subPropertyOf: []` via `API.createObjectProperty()`, puis navigue vers l'onglet "object-properties" sur la nouvelle propriété.

---

### REQ-CLS-019 — Création rapide d'une DatatypeProperty depuis l'onglet Classes

| **Si** | l'`ontologiste` souhaite créer une `propriété de données` directement associée à la `classe` qu'il est en train d'éditer, |
|---|---|
| **Alors** | une nouvelle `propriété de données` est créée avec la `classe` courante déclarée comme domaine, et l'application navigue automatiquement vers l'onglet des `propriétés de données` pour permettre à l'`ontologiste` de la compléter. |

**Code source :** `owl_editor.js` → `ClassEditor.createDTPForClass()` — Crée une DatatypeProperty avec `domain: [classId]` et `functional: false` via `API.createDatatypeProperty()`, puis navigue vers l'onglet "datatype-properties".

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

### REQ-CLS-020 — Rendu de l'arbre des classes avec nœud racine owl:Thing

| **Si** | l'`ontologiste` ouvre l'onglet `Classes` d'une `ontologie` chargée, |
|---|---|
| **Alors** | l'arbre affiche en tête le concept racine universel (`owl:Thing` ou le label personnalisé de l'`ontologie`), suivi de l'ensemble des `classes` organisées en hiérarchie. Si l'`ontologie` ne contient aucune `classe` locale, un message d'absence est affiché. |

**Code source :** `owl_editor.js` → `ClassEditor.renderTree()` — Génère le HTML de l'arbre en affichant en tête un nœud `owl:Thing` (label issu de `APP.getOntologyRootLabels().classRoot`), puis appelle récursivement `_renderNode()` pour chaque classe racine. Affiche "No classes" si la liste est vide.

---

### REQ-CLS-021 — Sélection d'une classe dans l'arbre

| **Si** | l'`ontologiste` sélectionne une `classe` dans l'arbre, |
|---|---|
| **Alors** | la `classe` est mise en surbrillance, son formulaire d'édition complet est affiché dans le panneau de détail, la hiérarchie de ses super-`classes` est visible dans le panneau latéral, et les actions disponibles (créer une sous-`classe`, créer une `classe` sœur, supprimer) sont activées. |

**Code source :** `owl_editor.js` → `ClassEditor.selectClass()` — Désélectionne tous les nœuds, sélectionne visuellement le `.tree-label` correspondant à l'identifiant, charge l'objet depuis `APP.state.classes`, injecte le formulaire via `renderForm()`, met à jour le panneau des super-classes via `renderSplit()`, et active les boutons Child, Sister, Delete.

---

### REQ-CLS-022 — Sélection du nœud racine owl:Thing

| **Si** | l'`ontologiste` sélectionne le nœud racine `owl:Thing` dans l'arbre, |
|---|---|
| **Alors** | le panneau de détail affiche un message indiquant que ce concept est la racine de toutes les `classes`, avec un bouton permettant de créer une nouvelle `classe`. Les actions "créer une `classe` sœur" et "supprimer" sont désactivées, seule la création d'une sous-`classe` reste disponible. |

**Code source :** `owl_editor.js` → `ClassEditor.selectOwlThing()` — Sélectionne visuellement le nœud racine, injecte dans le panneau de détail un message "Root of all classes" avec un bouton de création, vide le panneau des super-classes, et désactive les boutons Sister et Delete (le bouton Child reste actif).

---

### REQ-CLS-023 — Expansion/réduction d'un nœud de l'arbre

| **Si** | l'`ontologiste` clique sur l'indicateur d'expansion d'un nœud de l'arbre, |
|---|---|
| **Alors** | le nœud bascule entre l'état déplié (sous-`classes` visibles) et l'état replié (sous-`classes` masquées), et cet état est mémorisé pour la durée de la session. |

**Code source :** `owl_editor.js` → `ClassEditor.toggleNode()` — Bascule la présence de l'identifiant dans le `Set` `_expanded`, appelle `buildTree()` sur `APP.state.classes` et redessine les nœuds enfants concernés.

---

### REQ-CLS-024 — Menu contextuel sur un nœud de l'arbre

| **Si** | l'`ontologiste` effectue un clic droit sur un nœud de l'arbre, |
|---|---|
| **Alors** | un menu contextuel apparaît à l'emplacement du curseur, proposant de créer une sous-`classe`, de créer une `classe` sœur (uniquement pour les `classes`, pas pour `owl:Thing`), ou de supprimer la `classe` (action mise en évidence). |

| **Si** | l'`ontologiste` clique en dehors du menu contextuel, |
|---|---|
| **Alors** | le menu se ferme. |

**Code source :** `owl_editor.js` → `ClassEditor.showContextMenu()` — Positionne le menu aux coordonnées de l'événement souris, affiche les entrées "Add child class", "Add sibling class" (masquée si cible `owl:Thing`) et "Delete selected class" (en rouge). La fermeture est gérée par `_closeContextMenu()` sur clic extérieur.

---

### REQ-CLS-025 — Formulaire d'édition d'une classe

| **Si** | une `classe` est sélectionnée dans l'arbre ou qu'une nouvelle `classe` est en cours de création, |
|---|---|
| **Alors** | le panneau de détail présente un formulaire complet permettant de définir l'identifiant du concept, ses annotations, ses `restrictions` de `propriétés`, ses `classes` disjointes et ses `classes` équivalentes. En mode création, un bouton de validation explicite est affiché. |

**Code source :** `owl_editor.js` → `ClassEditor.renderForm()` — Génère le HTML du panneau de détail avec : champ `#cls-id` pour l'identifiant (avec mention "instance of owl:Class"), l'IRI complète si `baseIri` est défini, un tableau d'annotations, le panneau de restrictions via `RestrictionEditor.renderPanel()`, un bloc "Disjoints", un bloc "Equivalent", et le bouton "✅ Create class" en mode création uniquement.

---

### REQ-CLS-026 — Gestion des annotations rdfs:label et rdfs:comment

| **Si** | l'`ontologiste` souhaite ajouter un libellé ou un commentaire à un concept, |
|---|---|
| **Alors** | une nouvelle ligne d'annotation est ajoutée au tableau des annotations, avec un champ de valeur, un indicateur de langue (initialisé à la langue par défaut de l'application) et un bouton de suppression. Toute modification ultérieure de cette ligne est sauvegardée automatiquement. |

**Code source :** `owl_editor.js` → `ClassEditor.addAnnotRow()` — Crée une ligne via `_makeAnnotRow(type, 'ClassEditor', ac)` avec un champ texte, un champ langue initialisé à `Settings.defaultLang` et un bouton `✕`, insère la ligne dans `#cls-anno-table` et branche `autoSave()` sur les événements de modification si la classe est en cours d'édition.

---

### REQ-CLS-027 — Gestion des propriétés d'annotation personnalisées

| **Si** | l'`ontologiste` souhaite ajouter une annotation via une `propriété d'annotation` personnalisée (telle que `rdfs:seeAlso` ou toute `propriété d'annotation` définie dans l'`ontologie`), |
|---|---|
| **Alors** | une ligne d'annotation est ajoutée au tableau, affichant le nom de la `propriété` sélectionnée, un champ de valeur et un champ de langue. |

**Code source :** `owl_editor.js` → `ClassEditor.addOtherAnnotRow()` — Crée une ligne via `_makeAnnotRow('other', 'ClassEditor', ac, prop)` affichant le nom de la propriété d'annotation, un champ valeur et un champ langue, pour `rdfs:seeAlso` ou toute propriété d'annotation de l'ontologie sélectionnée dans `cls-anno-picker`.

---

### REQ-CLS-028 — Panneau de restrictions et propriétés assertées

| **Si** | le formulaire d'une `classe` est affiché, |
|---|---|
| **Alors** | le panneau "`Properties` and `Restrictions`" présente deux sections distinctes : les `restrictions` héritées des ancêtres (en lecture seule, avec leur compteur) et les `restrictions` définies directement sur la `classe` (éditables, avec leur compteur), ainsi que des raccourcis pour ajouter une `propriété` existante ou en créer une nouvelle directement depuis ce panneau. |

**Code source :** `owl_editor.js` → `RestrictionEditor.renderPanel()` — Appelle `_group()` pour regrouper les restrictions par propriété, génère deux sections repliables "Inherited Properties" et "Asserted Properties" avec compteurs, et expose les boutons pour ajouter une propriété depuis le picker, créer une ObjectProperty ou une DatatypeProperty.

---

### REQ-CLS-029 — Ajout d'une propriété dans le panneau de restrictions

| **Si** | l'`ontologiste` sélectionne une `propriété` dans la liste des `propriétés` disponibles, |
|---|---|
| **Alors** | un groupe dédié à cette `propriété` apparaît dans le panneau de `restrictions` (ou est mis en surbrillance s'il existait déjà), la `propriété` disparaît de la liste des `propriétés` disponibles, et la modification est sauvegardée automatiquement. |

**Code source :** `owl_editor.js` → `RestrictionEditor.addProperty()` — Vérifie si un groupe pour la propriété existe déjà dans `#restr-tree` (si oui, le sélectionne) ; sinon crée un groupe via `_renderGroup()` inséré en ordre alphabétique, sélectionne la propriété, la retire du picker `#restr-prop-picker`, et déclenche `autoSave()`.

---

### REQ-CLS-030 — Sélection du filler (classe cible) d'une restriction

| **Si** | l'`ontologiste` souhaite désigner la `classe` cible d'une `restriction` de `propriété`, |
|---|---|
| **Alors** | un menu déroulant présentant la hiérarchie complète des `classes` de l'`ontologie` s'ouvre sous le bouton de sélection. |

| **Si** | l'`ontologiste` sélectionne une `classe` dans ce menu, |
|---|---|
| **Alors** | la `classe` choisie est affichée comme cible de la `restriction`, l'indicateur visuel est mis à jour, et la modification est sauvegardée automatiquement. |

**Code source :** `owl_editor.js` → `RestrictionEditor.toggleFillerPicker()` — Ouvre/ferme un dropdown en `position:fixed` sous le bouton filler, peuplé via `_classHierarchyItems()`. | `RestrictionEditor.selectFiller()` — Met à jour `restr-filler-val`, actualise le label affiché, remplace le dot coloré, marque l'item sélectionné et déclenche `autoSave()`.

---

### REQ-CLS-031 — Affichage de l'IRI complète de la classe

| **Si** | une base IRI est définie dans les paramètres de l'`ontologie` et que la `classe` sélectionnée existe déjà, |
|---|---|
| **Alors** | l'IRI complète et non ambiguë du concept est affichée dans le formulaire, permettant à l'`ontologiste` de vérifier l'identifiant global du concept dans l'espace de nommage de l'`ontologie`. |

**Code source :** `owl_editor.js` → `ClassEditor.renderForm()` — Affiche la ligne `For Class: <baseIri>#<classId>` dans une balise `<code>` sous le titre, uniquement si `baseIri` est défini dans les paramètres et que la classe n'est pas en mode création pure.

---

### REQ-CLS-032 — Panneau des super-classes avec hiérarchie ancêtres

| **Si** | la `classe` sélectionnée possède des super-`classes`, |
|---|---|
| **Alors** | le panneau latéral affiche l'intégralité de la chaîne de spécialisation : les super-`classes` directes (avec possibilité de les retirer), puis les ancêtres indirects jusqu'à `owl:Thing` (affichés avec une mise en forme atténuée pour les distinguer, et cliquables pour naviguer vers eux). Les ancêtres indirects ne peuvent pas être supprimés depuis ce panneau. |

**Code source :** `owl_editor.js` → `ClassEditor.renderSplit()` (section `_renderSupersPanel()` interne) — Affiche les super-classes directes avec bouton `✕`, puis les ancêtres indirects en italique et opacité 0.75 jusqu'à `owl:Thing`, chacun cliquable via `APP.navigateTo('classes', id)` sans bouton de suppression.
