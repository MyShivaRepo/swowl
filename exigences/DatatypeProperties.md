# Exigences — DatatypeProperties

> Généré le 2026-06-06 | Dérivé strictement du code source | Aucune hallucination

## Table des matières

### Fond
- [REQ-DP-001 — Initialisation de la liste des types XSD disponibles](#req-dp-001--initialisation-de-la-liste-des-types-xsd-disponibles)
- [REQ-DP-002 — Construction de l'arbre hiérarchique des propriétés](#req-dp-002--construction-de-larbre-hiérarchique-des-propriétés)
- [REQ-DP-003 — Expansion automatique des ancêtres d'une propriété sélectionnée](#req-dp-003--expansion-automatique-des-ancêtres-dune-propriété-sélectionnée)
- [REQ-DP-004 — Création d'une propriété enfant (child)](#req-dp-004--création-dune-propriété-enfant-child)
- [REQ-DP-005 — Création d'une propriété sœur (sibling)](#req-dp-005--création-dune-propriété-sœur-sibling)
- [REQ-DP-006 — Génération d'un nom unique pour une nouvelle propriété](#req-dp-006--génération-dun-nom-unique-pour-une-nouvelle-propriété)
- [REQ-DP-007 — Création effective et navigation vers la nouvelle propriété](#req-dp-007--création-effective-et-navigation-vers-la-nouvelle-propriété)
- [REQ-DP-008 — Dépôt (drop) d'une propriété sur une nouvelle cible](#req-dp-008--dépôt-drop-dune-propriété-sur-une-nouvelle-cible)
- [REQ-DP-009 — Vérification d'un lien ancêtre/descendant pour le drag & drop](#req-dp-009--vérification-dun-lien-ancêtredescendant-pour-le-drag--drop)
- [REQ-DP-010 — Contrôle de l'unicité du range avant ouverture du sélecteur](#req-dp-010--contrôle-de-lunicité-du-range-avant-ouverture-du-sélecteur)
- [REQ-DP-011 — Gestion du domaine](#req-dp-011--gestion-du-domaine)
- [REQ-DP-012 — Gestion du range (type XSD)](#req-dp-012--gestion-du-range-type-xsd)
- [REQ-DP-013 — Gestion d'une super-propriété](#req-dp-013--gestion-dune-super-propriété)
- [REQ-DP-014 — Sauvegarde automatique lors d'un changement de champ](#req-dp-014--sauvegarde-automatique-lors-dun-changement-de-champ)
- [REQ-DP-015 — Sauvegarde (création ou mise à jour) d'une DatatypeProperty](#req-dp-015--sauvegarde-création-ou-mise-à-jour-dune-datatypeproperty)
- [REQ-DP-016 — Suppression d'une DatatypeProperty avec confirmation](#req-dp-016--suppression-dune-datatypeproperty-avec-confirmation)

### Forme
- [REQ-DP-017 — Génération d'options HTML pour les DatatypeProperties](#req-dp-017--génération-doptions-html-pour-les-datatypeproperties)
- [REQ-DP-018 — Génération d'options HTML pour les types XSD](#req-dp-018--génération-doptions-html-pour-les-types-xsd)
- [REQ-DP-019 — Rendu d'un nœud de l'arbre avec gestion drag & drop](#req-dp-019--rendu-dun-nœud-de-larbre-avec-gestion-drag--drop)
- [REQ-DP-020 — Rendu de l'arbre complet avec racine owl:topDataProperty](#req-dp-020--rendu-de-larbre-complet-avec-racine-owltopdataproperty)
- [REQ-DP-021 — Rendu de la mise en page en deux panneaux (split)](#req-dp-021--rendu-de-la-mise-en-page-en-deux-panneaux-split)
- [REQ-DP-022 — Restauration de la sélection après re-rendu](#req-dp-022--restauration-de-la-sélection-après-re-rendu)
- [REQ-DP-023 — Redimensionnement horizontal du panneau gauche](#req-dp-023--redimensionnement-horizontal-du-panneau-gauche)
- [REQ-DP-024 — Mise à jour du panneau "Super Properties"](#req-dp-024--mise-à-jour-du-panneau-super-properties)
- [REQ-DP-025 — Sélection de la racine owl:topDataProperty](#req-dp-025--sélection-de-la-racine-owltopdataproperty)
- [REQ-DP-026 — Sélection d'une DatatypeProperty dans l'arbre](#req-dp-026--sélection-dune-datatypeproperty-dans-larbre)
- [REQ-DP-027 — Gestion de l'état des boutons de la barre d'outils](#req-dp-027--gestion-de-létat-des-boutons-de-la-barre-doutils)
- [REQ-DP-028 — Expansion / réduction d'un nœud de l'arbre](#req-dp-028--expansion--réduction-dun-nœud-de-larbre)
- [REQ-DP-029 — Affichage du menu contextuel (clic droit)](#req-dp-029--affichage-du-menu-contextuel-clic-droit)
- [REQ-DP-030 — Fermeture du menu contextuel](#req-dp-030--fermeture-du-menu-contextuel)
- [REQ-DP-031 — Démarrage du drag d'une propriété](#req-dp-031--démarrage-du-drag-dune-propriété)
- [REQ-DP-032 — Survol d'une cible lors du drag](#req-dp-032--survol-dune-cible-lors-du-drag)
- [REQ-DP-033 — Rendu du formulaire d'édition d'une DatatypeProperty](#req-dp-033--rendu-du-formulaire-dédition-dune-datatypeproperty)
- [REQ-DP-034 — Ajout / suppression d'une ligne d'annotation (label / comment)](#req-dp-034--ajout--suppression-dune-ligne-dannotation-label--comment)
- [REQ-DP-035 — Ajout d'une annotation "autre propriété"](#req-dp-035--ajout-dune-annotation-autre-propriété)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles OWL, contraintes de données, comportements algorithmiques, validations, persistance.


### REQ-DP-001 — Initialisation de la liste des types XSD disponibles

| **Si** | l'application est chargée et que des DatatypeProperties peuvent être définies, |
|---|---|
| **Alors** | le système dispose d'une liste constante de 12 types XSD autorisés comme range : `xsd:string`, `xsd:integer`, `xsd:decimal`, `xsd:float`, `xsd:double`, `xsd:boolean`, `xsd:date`, `xsd:dateTime`, `xsd:duration`, `xsd:anyURI`, `xsd:nonNegativeInteger`, `xsd:positiveInteger` — cette liste constitue la seule référence pour les types de données autorisés dans l'application. |

---

**Code source :** `owl_editor.js` → `XSD_TYPES` (constante, lignes 167–171)

### REQ-DP-002 — Construction de l'arbre hiérarchique des propriétés

| **Si** | l'ontologie est chargée et contient des DatatypeProperties reliées par des relations `subPropertyOf`, |
|---|---|
| **Alors** | le système construit un objet `{ roots, childrenOf }` où `roots` est la liste triée alphabétiquement des propriétés sans parent, et `childrenOf` est une map de chaque propriété vers ses enfants triés alphabétiquement — les cycles sont évités en ne prenant en compte que les références vers des IDs existants. |

---

**Code source :** `owl_editor.js` → `DPEditor.buildTree()`

### REQ-DP-003 — Expansion automatique des ancêtres d'une propriété sélectionnée

| **Si** | une propriété est sélectionnée dans l'arbre **et** qu'elle possède un ou plusieurs ancêtres via `subPropertyOf`, |
|---|---|
| **Alors** | le système parcourt récursivement tous ses ancêtres et les ajoute dans l'ensemble `_expanded`, de sorte que le chemin depuis la racine jusqu'à la propriété sélectionnée soit entièrement déplié à l'affichage. |

---

**Code source :** `owl_editor.js` → `DPEditor._expandAncestors()`

### REQ-DP-004 — Création d'une propriété enfant (child)

| **Si** | l'utilisateur déclenche la création d'une propriété enfant, |
|---|---|
| **Alors** | - si une propriété est sélectionnée, elle devient le parent unique de la nouvelle propriété et est ajoutée à `_expanded` pour garantir sa visibilité ;<br>- si aucune propriété n'est sélectionnée, la nouvelle propriété est créée à la racine sans parent ;<br>- dans les deux cas, la création est déléguée à `_createAndSelect([parent])`. |

---

**Code source :** `owl_editor.js` → `DPEditor.createChild()`

### REQ-DP-005 — Création d'une propriété sœur (sibling)

| **Si** | l'utilisateur déclenche la création d'une propriété sœur **et** qu'une propriété est actuellement sélectionnée (`_selectedId` défini), |
|---|---|
| **Alors** | le système récupère les parents (`subPropertyOf`) de la propriété sélectionnée, les passe à `_createAndSelect()` et ajoute chacun d'eux à `_expanded`, produisant ainsi une nouvelle propriété au même niveau hiérarchique. |

---

**Code source :** `owl_editor.js` → `DPEditor.createSibling()`

### REQ-DP-006 — Génération d'un nom unique pour une nouvelle propriété

| **Si** | une nouvelle DatatypeProperty doit être créée, |
|---|---|
| **Alors** | le système génère un nom en partant de `'NewDatatypeProperty'` et en incrémentant un compteur (`NewDatatypeProperty1`, `NewDatatypeProperty2`, …) jusqu'à trouver un nom absent de la liste des IDs existants dans `APP.state.datatype_properties`. |

---

**Code source :** `owl_editor.js` → `DPEditor._generatePropName()`

### REQ-DP-007 — Création effective et navigation vers la nouvelle propriété

| **Si** | la création d'une DatatypeProperty est confirmée avec les parents ciblés, |
|---|---|
| **Alors** | - le système construit un objet propriété avec les valeurs par défaut (`annotations` vides, `domain` vide, `range` vide, `functional: false`) et l'IRI généré par `_generatePropName()` ;<br>- il appelle `API.createDP(prop)`, mémorise l'ID dans `_selectedId` et `_editingId` ;<br>- il rafraîchit l'état applicatif via `APP.refresh()` et `APP.renderSection('datatype-properties')` ;<br>- en cas d'erreur, celle-ci est affichée via `UI.error()`. |

---

**Code source :** `owl_editor.js` → `DPEditor._createAndSelect()`

### REQ-DP-008 — Dépôt (drop) d'une propriété sur une nouvelle cible

| **Si** | l'utilisateur dépose une propriété sur une cible valide lors d'un drag & drop **et** que la cible n'est pas un descendant de la source, |
|---|---|
| **Alors** | - si `targetId` est défini, `subPropertyOf` de la propriété déplacée est mis à jour à `[targetId]` ;<br>- si `targetId` est indéfini, la propriété devient racine (`subPropertyOf` vide) ;<br>- `API.updateDP()` est appelé pour persister le changement, un message de succès est affiché via `UI.success()`, et l'affichage est rafraîchi. |

| **Si** | la cible est un descendant de la source, |
|---|---|
| **Alors** | l'opération est annulée et un avertissement `UI.warn('Cannot drop on a descendant — would create a cycle')` est affiché. |

---

**Code source :** `owl_editor.js` → `DPEditor.onDrop()`

### REQ-DP-009 — Vérification d'un lien ancêtre/descendant pour le drag & drop

| **Si** | le système doit déterminer si une propriété cible est un descendant d'une propriété source lors d'un drag & drop, |
|---|---|
| **Alors** | il effectue une traversée récursive en profondeur de l'arbre (via `buildTree()`) depuis la propriété source pour vérifier si la cible en est un descendant — retourne `false` si l'un des deux paramètres est null ou undefined. |

---

**Code source :** `owl_editor.js` → `DPEditor._isDescendant()`

### REQ-DP-010 — Contrôle de l'unicité du range avant ouverture du sélecteur

| **Si** | l'utilisateur tente d'ouvrir le sélecteur de range (`dp-range-picker`) **et** que la liste `dp-range-list` contient déjà un élément `.cls-list-item[data-id]`, |
|---|---|
| **Alors** | le système interdit l'ouverture du sélecteur, garantissant qu'une seule valeur XSD peut être définie comme range. |

| **Si** | l'utilisateur ouvre tout autre sélecteur, |
|---|---|
| **Alors** | le système délègue l'ouverture à `_togglePicker(id)`. |

---

**Code source :** `owl_editor.js` → `DPEditor.showPicker()`

### REQ-DP-011 — Gestion du domaine

| **Si** | l'utilisateur ajoute une classe comme domaine d'une DatatypeProperty, |
|---|---|
| **Alors** | le système insère la classe dans `dp-domain-list` via `_addListItem()` avec le style `cls-dot`, puis déclenche `autoSave()`. |

| **Si** | l'utilisateur supprime une classe du domaine, |
|---|---|
| **Alors** | le système retire l'entrée de `dp-domain-list` via `_removeListItem()`, affiche `owl:Thing` comme valeur par défaut si la liste devient vide, puis déclenche `autoSave()`. |

---

**Code source :** `owl_editor.js` → `DPEditor.addDomain()` | `DPEditor.removeDomain()`

### REQ-DP-012 — Gestion du range (type XSD)

| **Si** | l'utilisateur ajoute un type XSD comme range d'une DatatypeProperty, |
|---|---|
| **Alors** | le système insère le type dans `dp-range-list` via `_addListItem()` avec le style `xsd-dot`, masque le bouton `dp-range-btn` pour empêcher l'ajout d'un second type, puis déclenche `autoSave()` si une propriété est en cours d'édition. |

| **Si** | l'utilisateur supprime le type XSD du range, |
|---|---|
| **Alors** | le système retire le type de `dp-range-list` via `_removeListItem()` (la valeur par défaut affichée redevient `rdfs:Literal`), réaffiche le bouton `dp-range-btn` pour permettre la sélection d'un nouveau type, puis déclenche `autoSave()`. |

---

**Code source :** `owl_editor.js` → `DPEditor.addRange()` | `DPEditor.removeRange()`

### REQ-DP-013 — Gestion d'une super-propriété

| **Si** | l'utilisateur ajoute une super-propriété à une DatatypeProperty, |
|---|---|
| **Alors** | le système insère la propriété choisie dans `dp-sub-list` via `_addListItem()` avec navigation vers la section `'datatype-properties'` et style `dp-prop-dot`, puis déclenche `autoSave()`. |

| **Si** | l'utilisateur supprime une super-propriété, |
|---|---|
| **Alors** | le système retire l'entrée de `dp-sub-list` via `_removeListItem()`, puis déclenche `autoSave()`. |

---

**Code source :** `owl_editor.js` → `DPEditor.addSubProp()` | `DPEditor.removeSubProp()`

### REQ-DP-014 — Sauvegarde automatique lors d'un changement de champ

| **Si** | l'utilisateur modifie un champ du formulaire d'édition **et** qu'une propriété existante est en cours d'édition (`_editingId !== null`), |
|---|---|
| **Alors** | le système déclenche automatiquement `save(false)` pour persister les modifications sans action explicite de l'utilisateur. |

---

**Code source :** `owl_editor.js` → `DPEditor.autoSave()`

### REQ-DP-015 — Sauvegarde (création ou mise à jour) d'une DatatypeProperty

| **Si** | l'utilisateur sauvegarde une DatatypeProperty (nouvelle ou existante), |
|---|---|
| **Alors** | le système collecte toutes les valeurs du formulaire :<br>- ID via `document.getElementById('dp-id').value`, validé par `_validateId()` ;<br>- Annotations (labels, comments, other) via `_collectAnnotations('dp-annotations-body')` ;<br>- Domain via `_collectList('dp-domain-list')` ;<br>- Range via `_collectList('dp-range-list')` ;<br>- SubPropertyOf via `_collectList('dp-sub-list')` ;<br>- Functional via l'état de la case à cocher `dp-functional`. |

| **Si** | le mode est création (`isNew === true`), |
|---|---|
| **Alors** | le système appelle `API.createDP(prop)` et affiche un message de succès. |

| **Si** | le mode est mise à jour, |
|---|---|
| **Alors** | le système appelle `API.updateDP(originalId, prop)` et signale un renommage si l'ID a changé. |

Dans les deux cas, `APP.refresh()` puis `APP.renderSection('datatype-properties')` sont appelés.

---

**Code source :** `owl_editor.js` → `DPEditor.save()`

### REQ-DP-016 — Suppression d'une DatatypeProperty avec confirmation

| **Si** | l'utilisateur déclenche la suppression d'une DatatypeProperty, |
|---|---|
| **Alors** | le système affiche une boîte de dialogue de confirmation via `UI.confirm()`. |

| **Si** | l'utilisateur confirme la suppression, |
|---|---|
| **Alors** | - `API.deleteDP(id)` est appelé ;<br>- un message de succès est affiché via `UI.success()` ;<br>- `_selectedId` et `_editingId` sont réinitialisés à `null` ;<br>- l'affichage est rafraîchi via `APP.refresh()` et `APP.renderSection('datatype-properties')`. |

---

**Code source :** `owl_editor.js` → `DPEditor.delete()`

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

### REQ-DP-017 — Génération d'options HTML pour les DatatypeProperties

| **Si** | un composant d'un autre onglet nécessite une liste déroulante référençant des DatatypeProperties, |
|---|---|
| **Alors** | le système parcourt `APP.state.datatype_properties` et produit une chaîne d'éléments `<option>` pour chaque propriété, avec sélection de la valeur correspondant à `selectedId`. |

---

**Code source :** `owl_editor.js` → `dpOptions()`

### REQ-DP-018 — Génération d'options HTML pour les types XSD

| **Si** | un sélecteur XSD doit être affiché (notamment dans l'onglet Individuals), |
|---|---|
| **Alors** | le système itère sur `XSD_TYPES` et produit des éléments `<option>` HTML, avec `xsd:string` comme valeur sélectionnée par défaut si aucune valeur n'est précisée. |

---

**Code source :** `owl_editor.js` → `xsdOptions()`

### REQ-DP-019 — Rendu d'un nœud de l'arbre avec gestion drag & drop

| **Si** | un nœud de l'arbre des DatatypeProperties doit être affiché, |
|---|---|
| **Alors** | le système génère le HTML du nœud avec :<br>- une indentation proportionnelle à la profondeur (`depth * 16 + 6` px) ;<br>- un triangle de déplacement si le nœud a des enfants ;<br>- les handlers `onclick`, `oncontextmenu`, `ondragstart`, `ondragover`, `ondragleave`, `ondrop`, `ondragend` branchés vers les méthodes correspondantes de `DPEditor`. |

---

**Code source :** `owl_editor.js` → `DPEditor._renderNode()`

### REQ-DP-020 — Rendu de l'arbre complet avec racine owl:topDataProperty

| **Si** | l'onglet DatatypeProperties est affiché, |
|---|---|
| **Alors** | - le système appelle `buildTree()` puis `_renderNode()` pour chaque racine ;<br>- il affiche en tête un élément représentant la racine (`owl:topDataProperty` ou `rdf:Property` selon `APP.getOntologyRootLabels()`) ;<br>- si la liste de propriétés est vide, il affiche le message `"No DatatypeProperty"`. |

---

**Code source :** `owl_editor.js` → `DPEditor.renderTree()`

### REQ-DP-021 — Rendu de la mise en page en deux panneaux (split)

| **Si** | l'onglet DatatypeProperties est initialisé, |
|---|---|
| **Alors** | le système génère la structure HTML complète avec :<br>- un panneau gauche contenant l'arbre et le sous-panneau "Super Properties" ;<br>- un séparateur redimensionnable horizontal (`split-handle`) ;<br>- un panneau droit (`detail-panel`) vide avec un bouton de création ;<br>- les boutons "Child", "Sibling" et "Delete" rendus désactivés par défaut. |

---

**Code source :** `owl_editor.js` → `DPEditor.renderSplit()`

### REQ-DP-022 — Restauration de la sélection après re-rendu

| **Si** | la section DatatypeProperties est re-rendue, |
|---|---|
| **Alors** | le système :<br>- appelle `_initSplitPane()` pour ré-attacher les listeners de redimensionnement ;<br>- re-sélectionne soit la racine (`selectTopProp()`), soit la propriété mémorisée dans `_selectedId` (`selectProp()`), préservant ainsi l'état de l'interface. |

---

**Code source :** `owl_editor.js` → `DPEditor.restoreSelection()`

### REQ-DP-023 — Redimensionnement horizontal du panneau gauche

| **Si** | l'utilisateur effectue un glisser-déposer sur l'élément `dp-split-handle`, |
|---|---|
| **Alors** | le système redimensionne le panneau gauche en contraignant sa largeur entre 160 et 520 px, et appelle `_initHResizers('dp-tree-panel')` pour gérer le redimensionnement vertical entre l'arbre et le sous-panneau "Super Properties". |

---

**Code source :** `owl_editor.js` → `DPEditor._initSplitPane()`

### REQ-DP-024 — Mise à jour du panneau "Super Properties"

| **Si** | aucune propriété n'est sélectionnée, |
|---|---|
| **Alors** | le panneau gauche inférieur (`dp-sub-list`) affiche le message "— select a property —". |

| **Si** | une propriété est sélectionnée, |
|---|---|
| **Alors** | - le système calcule la chaîne complète d'ancêtres via `buildChain()` et affiche chaque ancêtre avec indentation croissante, terminant par `owl:topDatatypeProperty` ;<br>- les ancêtres directs comportent un bouton de suppression (✕) ;<br>- un sélecteur HTML propose les propriétés non encore utilisées comme super-propriétés. |

---

**Code source :** `owl_editor.js` → `DPEditor._updateSuperPanel()`

### REQ-DP-025 — Sélection de la racine owl:topDataProperty

| **Si** | l'utilisateur sélectionne la racine `owl:topDataProperty`, |
|---|---|
| **Alors** | - `_selectedId` est positionné à `null` et `_topPropSelected` à `true` ;<br>- le surlignage dans l'arbre est mis à jour ;<br>- le panneau de détail affiche un écran d'accueil avec la racine et un bouton de création ;<br>- `_updateSuperPanel(null)` et `_updateTreeButtons()` sont appelés. |

---

**Code source :** `owl_editor.js` → `DPEditor.selectTopProp()`

### REQ-DP-026 — Sélection d'une DatatypeProperty dans l'arbre

| **Si** | l'utilisateur sélectionne une DatatypeProperty dans l'arbre, |
|---|---|
| **Alors** | - `id` est mémorisé dans `_selectedId` ;<br>- le surlignage visuel dans l'arbre est mis à jour ;<br>- l'objet propriété est retrouvé dans `APP.state.datatype_properties` ;<br>- le formulaire de détail est injecté via `renderForm()` ;<br>- les redimensionneurs verticaux du panneau droit sont initialisés ;<br>- le panneau "Super Properties" et les boutons de la barre d'outils sont mis à jour. |

---

**Code source :** `owl_editor.js` → `DPEditor.selectProp()`

### REQ-DP-027 — Gestion de l'état des boutons de la barre d'outils

| **Si** | la racine est sélectionnée, |
|---|---|
| **Alors** | seul le bouton "Child" est activé ; "Sibling" et "Delete" sont masqués. |

| **Si** | une propriété est sélectionnée, |
|---|---|
| **Alors** | les trois boutons "Child", "Sibling" et "Delete" sont actifs. |

| **Si** | aucune sélection n'est active, |
|---|---|
| **Alors** | tous les boutons sont désactivés. |

---

**Code source :** `owl_editor.js` → `DPEditor._updateTreeButtons()`

### REQ-DP-028 — Expansion / réduction d'un nœud de l'arbre

| **Si** | l'utilisateur clique sur le triangle d'un nœud de l'arbre, |
|---|---|
| **Alors** | le système bascule la visibilité du conteneur enfant `dp-tcn-${id}`, met à jour le Set `_expanded` (ajout ou suppression de `id`), et fait pivoter la flèche de déplié/replié de l'élément `.tree-toggle`. |

---

**Code source :** `owl_editor.js` → `DPEditor.toggleNode()`

### REQ-DP-029 — Affichage du menu contextuel (clic droit)

| **Si** | l'utilisateur effectue un clic droit sur un nœud de l'arbre, |
|---|---|
| **Alors** | - tout menu contextuel existant est supprimé ;<br>- la propriété ou la racine est sélectionnée selon la valeur de `id` ;<br>- un élément `div.ctx-menu` est créé et inséré dans le `body` à la position du curseur ;<br>- le menu contient toujours l'item "Add Child Property" ; si `id` est défini (propriété réelle), "Add Sibling Property" et "Delete" sont également ajoutés ;<br>- le menu se ferme automatiquement au clic en dehors via un listener `click` sur `document`. |

---

**Code source :** `owl_editor.js` → `DPEditor.showContextMenu()`

### REQ-DP-030 — Fermeture du menu contextuel

| **Si** | le menu contextuel est ouvert et qu'une action de fermeture est déclenchée, |
|---|---|
| **Alors** | le système supprime du DOM l'élément portant l'ID `dp-ctx-menu`, s'il existe. |

---

**Code source :** `owl_editor.js` → `DPEditor._closeContextMenu()`

### REQ-DP-031 — Démarrage du drag d'une propriété

| **Si** | l'utilisateur commence à glisser une propriété dans l'arbre, |
|---|---|
| **Alors** | - l'ID de la propriété glissée est mémorisé dans `_dragId` ;<br>- `effectAllowed` est positionné à `'move'` et l'ID est stocké dans `dataTransfer` ;<br>- la classe CSS `'dragging'` est ajoutée à l'élément source après un délai de 0 ms (via `setTimeout`). |

---

**Code source :** `owl_editor.js` → `DPEditor.onDragStart()`

### REQ-DP-032 — Survol d'une cible lors du drag

| **Si** | l'utilisateur survole une cible pendant un drag **et** qu'un drag est en cours (`_dragId` défini), **et** que la cible est différente de la source, **et** que la cible n'est pas un descendant de la source (vérifié via `_isDescendant()`), |
|---|---|
| **Alors** | le système autorise le dépôt (`event.preventDefault()`) et applique la classe `'drag-over'` à l'élément survolé. |

---

**Code source :** `owl_editor.js` → `DPEditor.onDragOver()`

### REQ-DP-033 — Rendu du formulaire d'édition d'une DatatypeProperty

| **Si** | l'utilisateur sélectionne une DatatypeProperty ou crée une nouvelle propriété, |
|---|---|
| **Alors** | le système génère le HTML complet du panneau droit avec les sections suivantes :<br>- **En-tête** : champ de saisie de l'ID (avec `_sanitizeId()`), mention `(instance of owl:DatatypeProperty)`, IRI complète calculée à partir de `APP.state.ontology.id` ;<br>- **Annotations** : table avec colonnes Property / Value / Lang, peuplée via `_annoRow()` pour `labels`, `comments` et `other` ;<br>- **Domain(s)** : liste des classes domaine via `_listRows()`, sélecteur parmi les classes disponibles (`APP.state.classes`), valeur par défaut affichée `owl:Thing` ;<br>- **Range** : liste des types XSD via `_listRows()`, sélecteur parmi les types non encore utilisés tirés de `XSD_TYPES`, valeur par défaut affichée `rdfs:Literal` ;<br>- **Characteristics** : case à cocher unique "Functional" liée à `p.functional` ;<br>- **Where Used** : section générée par `_whereUsedFrame()` listant les règles qui utilisent cette propriété. |

| **Si** | le mode est création (`prop === null`), |
|---|---|
| **Alors** | un bouton "✅ Create" est affiché à la place de la sauvegarde automatique. |

| **Si** | le mode est édition, |
|---|---|
| **Alors** | toutes les modifications de champ déclenchent `autoSave()` via `onchange`. |

---

**Code source :** `owl_editor.js` → `DPEditor.renderForm()`

### REQ-DP-034 — Ajout / suppression d'une ligne d'annotation (label / comment)

| **Si** | l'utilisateur ajoute une ligne d'annotation de type label ou comment, |
|---|---|
| **Alors** | le système appelle `_makeAnnotRow(type, 'DPEditor', ac)` et insère la ligne retournée dans le `tbody` identifié `dp-annotations-body` — `autoSave()` est activé si une propriété est en cours d'édition (`_editingId !== null`). |

| **Si** | l'utilisateur supprime une ligne d'annotation, |
|---|---|
| **Alors** | le système supprime du DOM la ligne `<tr>` parente du bouton cliqué (`btn.closest('tr')?.remove()`), puis déclenche `autoSave()` si une propriété est en cours d'édition. |

---

**Code source :** `owl_editor.js` → `DPEditor.addAnnotRow()` | `DPEditor.removeAnnotRow()`

### REQ-DP-035 — Ajout d'une annotation "autre propriété"

| **Si** | l'utilisateur sélectionne une annotation de type "autre propriété" via le sélecteur dédié, |
|---|---|
| **Alors** | le système appelle `_makeAnnotRow('other', 'DPEditor', ac, prop)`, insère la ligne dans `dp-annotations-body`, puis masque le sélecteur d'annotation `dp-anno-picker` en forçant son `style.display` à `'none'`. |

---

**Code source :** `owl_editor.js` → `DPEditor.addOtherAnnotRow()`
