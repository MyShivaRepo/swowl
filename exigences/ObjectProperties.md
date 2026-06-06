# Exigences — ObjectProperties

> Généré le 2026-06-06 | Dérivé strictement du code source | Aucune hallucination

## Table des matières

### Fond
- [REQ-OP-001 — Construction de la hiérarchie de l'arbre](#req-op-001--construction-de-la-hiérarchie-de-larbre)
- [REQ-OP-002 — Expansion automatique des ancêtres](#req-op-002--expansion-automatique-des-ancêtres)
- [REQ-OP-003 — Création d'une propriété enfant](#req-op-003--création-dune-propriété-enfant)
- [REQ-OP-004 — Création d'une propriété sœur](#req-op-004--création-dune-propriété-sœur)
- [REQ-OP-005 — Génération automatique d'un identifiant unique](#req-op-005--génération-automatique-dun-identifiant-unique)
- [REQ-OP-006 — Persistance de la création d'une propriété via l'API](#req-op-006--persistance-de-la-création-dune-propriété-via-lapi)
- [REQ-OP-007 — Déplacement par glisser-déposer dans l'arbre](#req-op-007--déplacement-par-glisser-déposer-dans-larbre)
- [REQ-OP-008 — Protection contre les cycles lors du glisser-déposer](#req-op-008--protection-contre-les-cycles-lors-du-glisser-déposer)
- [REQ-OP-009 — Suppression d'une propriété avec confirmation](#req-op-009--suppression-dune-propriété-avec-confirmation)
- [REQ-OP-010 — Gestion des classes du domaine](#req-op-010--gestion-des-classes-du-domaine)
- [REQ-OP-011 — Gestion des classes du range](#req-op-011--gestion-des-classes-du-range)
- [REQ-OP-012 — Définition de la propriété inverse](#req-op-012--définition-de-la-propriété-inverse)
- [REQ-OP-013 — Unicité de la propriété inverse](#req-op-013--unicité-de-la-propriété-inverse)
- [REQ-OP-014 — Suppression de la propriété inverse](#req-op-014--suppression-de-la-propriété-inverse)
- [REQ-OP-015 — Affichage des propriétés inverses inférées](#req-op-015--affichage-des-propriétés-inverses-inférées)
- [REQ-OP-016 — Gestion des super-propriétés (subPropertyOf)](#req-op-016--gestion-des-super-propriétés-subpropertyof)
- [REQ-OP-017 — Caractéristiques OWL de la propriété](#req-op-017--caractéristiques-owl-de-la-propriété)
- [REQ-OP-018 — Sauvegarde automatique en mode édition](#req-op-018--sauvegarde-automatique-en-mode-édition)
- [REQ-OP-019 — Sauvegarde complète (création ou mise à jour)](#req-op-019--sauvegarde-complète-création-ou-mise-à-jour)
- [REQ-OP-020 — Création d'une ObjectProperty depuis l'onglet Classes](#req-op-020--création-dune-objectproperty-depuis-longlet-classes)

### Forme
- [REQ-OP-021 — Affichage de l'arbre des propriétés d'objet](#req-op-021--affichage-de-larbre-des-propriétés-dobjet)
- [REQ-OP-022 — Rendu d'un nœud de l'arbre avec tag inverseOf](#req-op-022--rendu-dun-nœud-de-larbre-avec-tag-inverseof)
- [REQ-OP-023 — Sélection de owl:topObjectProperty](#req-op-023--sélection-de-owltopobjectproperty)
- [REQ-OP-024 — Sélection d'une propriété dans l'arbre](#req-op-024--sélection-dune-propriété-dans-larbre)
- [REQ-OP-025 — Activation contextuelle des boutons de l'arbre](#req-op-025--activation-contextuelle-des-boutons-de-larbre)
- [REQ-OP-026 — Expansion/réduction d'un nœud de l'arbre](#req-op-026--expansionréduction-dun-nœud-de-larbre)
- [REQ-OP-027 — Menu contextuel au clic droit sur l'arbre](#req-op-027--menu-contextuel-au-clic-droit-sur-larbre)
- [REQ-OP-028 — Formulaire d'édition d'une propriété d'objet](#req-op-028--formulaire-dédition-dune-propriété-dobjet)
- [REQ-OP-029 — Gestion des annotations (labels, comments, autres)](#req-op-029--gestion-des-annotations-labels-comments-autres)
- [REQ-OP-030 — Panneau "Super Properties" avec chaîne d'ancêtres](#req-op-030--panneau-super-properties-avec-chaîne-dancêtres)
- [REQ-OP-031 — Mise en page en deux panneaux redimensionnables](#req-op-031--mise-en-page-en-deux-panneaux-redimensionnables)
- [REQ-OP-032 — Restauration de la sélection après re-rendu](#req-op-032--restauration-de-la-sélection-après-re-rendu)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles OWL, contraintes de données, comportements algorithmiques, validations, persistance.


### REQ-OP-001 — Construction de la hiérarchie de l'arbre

| **Si** | l'ontologie est chargée et contient des propriétés d'objet dans `APP.state.object_properties`, |
|---|---|
| **Alors** | le système calcule, pour chaque propriété, la liste de ses enfants (`childrenOf`) et la liste des propriétés racines (`roots`) en ne retenant que les références `subPropertyOf` pointant vers des IDs existants, et trie toutes les listes alphabétiquement (insensible à la casse via `localeCompare`). |

**Code source :** `owl_editor.js` → `OPEditor.buildTree()`

---

### REQ-OP-002 — Expansion automatique des ancêtres

| **Si** | une propriété est sélectionnée ou créée dans l'arbre, |
|---|---|
| **Alors** | le système parcourt récursivement la chaîne `subPropertyOf` de la propriété et ajoute chaque ancêtre dans `OPEditor._expanded`, de sorte que le chemin complet jusqu'à la propriété soit visible dans l'arbre. |

**Code source :** `owl_editor.js` → `OPEditor._expandAncestors()`

---

### REQ-OP-003 — Création d'une propriété enfant

| **Si** | l'utilisateur déclenche la création d'une propriété enfant avec une propriété sélectionnée dans l'arbre, |
|---|---|
| **Alors** | le système détermine le parent comme étant la propriété sélectionnée (ou aucun parent si la sélection est `owl:topObjectProperty`), ajoute ce parent dans `_expanded` pour l'ouvrir dans l'arbre, et délègue la création à `_createAndSelect([parent])`. |

**Code source :** `owl_editor.js` → `OPEditor.createChild()`

---

### REQ-OP-004 — Création d'une propriété sœur

| **Si** | l'utilisateur déclenche la création d'une propriété sœur avec une propriété sélectionnée dans l'arbre, |
|---|---|
| **Alors** | le système récupère la liste des parents directs de la propriété sélectionnée (champ `subPropertyOf`), les ajoute tous dans `_expanded`, et délègue la création à `_createAndSelect(parents)` afin que la nouvelle propriété partage les mêmes parents. |

**Code source :** `owl_editor.js` → `OPEditor.createSibling()`

---

### REQ-OP-005 — Génération automatique d'un identifiant unique

| **Si** | une nouvelle propriété doit être créée, |
|---|---|
| **Alors** | le système génère un identifiant de la forme `NewObjectProperty`, `NewObjectProperty1`, `NewObjectProperty2`, etc. en incrémentant le suffixe numérique tant que l'identifiant est déjà présent dans `APP.state.object_properties`. |

**Code source :** `owl_editor.js` → `OPEditor._generatePropName()`

---

### REQ-OP-006 — Persistance de la création d'une propriété via l'API

| **Si** | la création d'une nouvelle propriété est déclenchée avec une liste de super-propriétés (`subPropertyOf`), |
|---|---|
| **Alors** | - le système construit un objet propriété minimal (`domain: [], range: [], inverseOf: null, characteristics: {}, propertyChainAxiom: []`) et l'enregistre via `API.createOP(prop)` ;<br>- en cas de succès, il positionne `_selectedId` et `_editingId`, rafraîchit l'état global via `APP.refresh()`, puis re-rend l'onglet via `APP.renderSection('object-properties')` ;<br>- en cas d'erreur, il affiche le message via `UI.error()`. |

**Code source :** `owl_editor.js` → `OPEditor._createAndSelect()`

---

### REQ-OP-007 — Déplacement par glisser-déposer dans l'arbre

| **Si** | l'utilisateur dépose une propriété sur une cible dans l'arbre (y compris la racine), |
|---|---|
| **Alors** | le système reconstruit la propriété avec `subPropertyOf: [targetId]` (ou `[]` si dépôt sur la racine), appelle `API.updateOP(draggedId, updated)`, et en cas de succès affiche `UI.success()`, rafraîchit l'état via `APP.refresh()` et re-rend l'onglet. |

**Code source :** `owl_editor.js` → `OPEditor.onDrop()`

---

### REQ-OP-008 — Protection contre les cycles lors du glisser-déposer

| **Si** | l'utilisateur tente de déposer une propriété sur l'un de ses propres descendants dans l'arbre, |
|---|---|
| **Alors** | le système bloque le dépôt et affiche le message `UI.warn('Cannot drop on a descendant — would create a cycle')` ; la même vérification est effectuée dans `onDragOver()` pour désactiver l'indicateur visuel de dépôt. |

**Code source :** `owl_editor.js` → `OPEditor._isDescendant()` et `OPEditor.onDrop()`

---

### REQ-OP-009 — Suppression d'une propriété avec confirmation

| **Si** | l'utilisateur déclenche la suppression d'une propriété, |
|---|---|
| **Alors** | le système affiche une boîte de dialogue de confirmation avec le message `Delete ObjectProperty <strong>${id}</strong>?` ; si l'utilisateur confirme, il appelle `API.deleteOP(id)`, réinitialise `_selectedId` et `_editingId` à `null`, puis rafraîchit l'onglet. |

**Code source :** `owl_editor.js` → `OPEditor.delete()`

---

### REQ-OP-010 — Gestion des classes du domaine

| **Si** | l'utilisateur ajoute une classe au domaine d'une propriété en cours d'édition, |
|---|---|
| **Alors** | le système ajoute l'ID de classe dans la liste DOM `#op-domain-list` via `_addListItem()`, ferme le picker `op-domain-picker`, et déclenche `autoSave()` ; si aucun domaine n'est défini, le placeholder `owl:Thing` est affiché. |

| **Si** | l'utilisateur supprime une classe du domaine d'une propriété en cours d'édition, |
|---|---|
| **Alors** | le système supprime l'item correspondant de `#op-domain-list` via `_removeListItem()`, restaure le placeholder `owl:Thing` si la liste est vide, et déclenche `autoSave()`. |

**Code source :** `owl_editor.js` → `OPEditor.addDomain()` | `OPEditor.removeDomain()`

---

### REQ-OP-011 — Gestion des classes du range

| **Si** | l'utilisateur ajoute une classe au range d'une propriété en cours d'édition, |
|---|---|
| **Alors** | le système ajoute l'ID de classe dans `#op-range-list` via `_addListItem()` et déclenche `autoSave()` ; si aucun range n'est défini, le placeholder `owl:Thing` est affiché. |

| **Si** | l'utilisateur supprime une classe du range d'une propriété en cours d'édition, |
|---|---|
| **Alors** | le système supprime l'item de `#op-range-list` via `_removeListItem()`, restaure le placeholder `owl:Thing` si la liste est vide, et déclenche `autoSave()`. |

**Code source :** `owl_editor.js` → `OPEditor.addRange()` | `OPEditor.removeRange()`

---

### REQ-OP-012 — Définition de la propriété inverse

| **Si** | l'utilisateur sélectionne une propriété inverse via le picker, |
|---|---|
| **Alors** | - le système met à jour le champ caché `#op-inverse-value` avec l'ID sélectionné ;<br>- remplace dans `#op-inverse-body` le placeholder "— none —" par un item avec un bouton de suppression ;<br>- masque le bouton `+` via `display:none` ;<br>- ferme le picker `op-inverse-picker` ;<br>- déclenche `autoSave()`. |

**Code source :** `owl_editor.js` → `OPEditor.setInverse()`

---

### REQ-OP-013 — Unicité de la propriété inverse

| **Si** | l'utilisateur tente d'ouvrir le picker d'inverse alors qu'une propriété inverse est déjà définie dans `#op-inverse-value`, |
|---|---|
| **Alors** | le système ne répond pas et le picker ne s'ouvre pas, garantissant qu'une seule propriété inverse peut être définie à la fois ; de plus, le picker exclut les propriétés ayant déjà un `inverseOf` défini (sauf vers la propriété courante). |

**Code source :** `owl_editor.js` → `OPEditor.showPicker()`

---

### REQ-OP-014 — Suppression de la propriété inverse

| **Si** | l'utilisateur supprime la propriété inverse, |
|---|---|
| **Alors** | le système efface la valeur de `#op-inverse-value`, réaffiche le placeholder "— none —", et rend visible le bouton `+` pour permettre une nouvelle sélection. |

**Code source :** `owl_editor.js` → `OPEditor.removeInverse()`

---

### REQ-OP-015 — Affichage des propriétés inverses inférées

| **Si** | une propriété est sélectionnée dans l'arbre **et** que le moteur d'inférence retourne des résultats `inferred_inverse_properties` concernant cette propriété, |
|---|---|
| **Alors** | le système injecte dans `#op-inferred-inverse` un badge `⊢ inverse of <strong>${i.inverse_of}</strong>` pour chaque inférence, avec l'attribut `title` portant la raison de l'inférence ; les erreurs sont silencieuses. |

**Code source :** `owl_editor.js` → `OPEditor._loadInferredInverse()`

---

### REQ-OP-016 — Gestion des super-propriétés (subPropertyOf)

| **Si** | l'utilisateur ajoute une super-propriété à la propriété en cours d'édition, |
|---|---|
| **Alors** | le système ajoute la propriété sélectionnée dans `#op-sub-list` via `_addListItem()` et déclenche `autoSave()`. |

| **Si** | l'utilisateur supprime une super-propriété de la propriété en cours d'édition, |
|---|---|
| **Alors** | le système supprime la super-propriété de `#op-sub-list` via `_removeListItem()` et déclenche `autoSave()`. |

**Code source :** `owl_editor.js` → `OPEditor.addSubProp()`, `OPEditor.removeSubProp()`

---

### REQ-OP-017 — Caractéristiques OWL de la propriété

| **Si** | le formulaire d'une propriété est affiché, |
|---|---|
| **Alors** | le système présente une grille de 7 cases à cocher (`functional`, `inverseFunctional`, `transitive`, `symmetric`, `asymmetric`, `reflexive`, `irreflexive`) pré-cochées selon `prop.characteristics[k]`. |

| **Si** | l'utilisateur sauvegarde la propriété, |
|---|---|
| **Alors** | le système lit l'état de chaque case via `document.getElementById('op-${k}')?.checked`, constitue l'objet `chars` et l'inclut dans le payload envoyé à `API.updateOP()` ou `API.createOP()`. |

**Code source :** `owl_editor.js` → `OPEditor.renderForm()` et `OPEditor.save()`

---

### REQ-OP-018 — Sauvegarde automatique en mode édition

| **Si** | une propriété existante est en cours d'édition (`_editingId !== null`) **et** qu'un champ du formulaire déclenche un événement `onchange`, |
|---|---|
| **Alors** | le système appelle automatiquement `save(false)` sans intervention supplémentaire de l'utilisateur. |

**Code source :** `owl_editor.js` → `OPEditor.autoSave()`

---

### REQ-OP-019 — Sauvegarde complète (création ou mise à jour)

| **Si** | l'utilisateur sauvegarde une propriété (nouvelle ou existante), |
|---|---|
| **Alors** | - le système collecte l'identifiant (`op-id`), les annotations, le domaine, le range, les super-propriétés, la propriété inverse et les 7 caractéristiques ;<br>- valide l'identifiant via `_validateId()` ;<br>- si la propriété est nouvelle, appelle `API.createOP()` ; sinon appelle `API.updateOP(originalId, prop)` ;<br>- si l'identifiant a changé, affiche un message de renommage ;<br>- dans tous les cas, rafraîchit l'onglet après succès. |

**Code source :** `owl_editor.js` → `OPEditor.save()`

---

### REQ-OP-020 — Création d'une ObjectProperty depuis l'onglet Classes

| **Si** | l'utilisateur clique sur "Create new ObjectProperty" depuis l'onglet Classes avec une classe sélectionnée, |
|---|---|
| **Alors** | le système génère un nom via `OPEditor._generatePropName()`, crée une propriété avec `domain: [classId]` et les autres champs vides, l'enregistre via `API.createOP()`, positionne `OPEditor._selectedId` et `OPEditor._editingId` sur le nouvel ID, puis navigue vers l'onglet `object-properties` via `APP.navigateTo()`. |

**Code source :** `owl_editor.js` → fonction anonyme dans `CLSEditor` (ligne ~613), identifiée par le commentaire `Creates an ObjectProperty with domain = selected class`

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

### REQ-OP-021 — Affichage de l'arbre des propriétés d'objet

| **Si** | l'onglet des propriétés d'objet est rendu, |
|---|---|
| **Alors** | - le système place en racine un nœud fixe `owl:topObjectProperty` (cliquable via `OPEditor.selectTopProp()`) ;<br>- appelle récursivement `_renderNode()` pour chaque propriété racine (celles sans parent dans `subPropertyOf`) ;<br>- si aucune propriété n'existe, affiche le texte "No ObjectProperty" à la place. |

**Code source :** `owl_editor.js` → `OPEditor.renderTree()`

---

### REQ-OP-022 — Rendu d'un nœud de l'arbre avec tag inverseOf

| **Si** | un nœud de l'arbre des propriétés d'objet est rendu, |
|---|---|
| **Alors** | - le nœud est `draggable="true"` et porte les handlers `ondragstart`, `ondragover`, `ondragleave`, `ondrop`, `ondragend` ;<br>- si la propriété possède un champ `inverseOf` non nul, un badge `↔ <id>` est affiché à côté du label ;<br>- l'indentation est calculée selon la profondeur (`depth * 16 + 6` px) ;<br>- les enfants sont rendus dans un conteneur `op-tcn-<id>` dont la visibilité est pilotée par `OPEditor._expanded`. |

**Code source :** `owl_editor.js` → `OPEditor._renderNode()`

---

### REQ-OP-023 — Sélection de owl:topObjectProperty

| **Si** | l'utilisateur clique sur le nœud racine `owl:topObjectProperty`, |
|---|---|
| **Alors** | - le système positionne `_selectedId = null` et `_topPropSelected = true` ;<br>- applique la classe CSS `selected` sur le nœud racine ;<br>- remplace le contenu du panneau de détail par un message d'accueil avec un bouton "＋ Create Object Property" ;<br>- vide le panneau "Super Properties" ;<br>- met à jour l'état des boutons de la barre d'outils via `_updateTreeButtons()`. |

**Code source :** `owl_editor.js` → `OPEditor.selectTopProp()`

---

### REQ-OP-024 — Sélection d'une propriété dans l'arbre

| **Si** | l'utilisateur clique sur un nœud de l'arbre des propriétés d'objet, |
|---|---|
| **Alors** | - le système met à jour `_selectedId` et applique la classe `selected` au bon item de l'arbre ;<br>- remplace le panneau de détail par `renderForm(prop)` ;<br>- initialise les redimensionneurs verticaux internes via `_initHResizers` ;<br>- rafraîchit le panneau "Super Properties" via `_updateSuperPanel()` ;<br>- met à jour les boutons via `_updateTreeButtons()` ;<br>- déclenche le chargement des inférences d'inverse via `_loadInferredInverse()`. |

**Code source :** `owl_editor.js` → `OPEditor.selectProp()`

---

### REQ-OP-025 — Activation contextuelle des boutons de l'arbre

| **Si** | `owl:topObjectProperty` est sélectionné, |
|---|---|
| **Alors** | seul le bouton "Child" (`op-btn-child`) est actif ; les boutons "Sister" (`op-btn-sister`) et "Delete" (`op-btn-delete`) sont désactivés. |

| **Si** | une propriété ordinaire est sélectionnée, |
|---|---|
| **Alors** | les trois boutons (`op-btn-child`, `op-btn-sister`, `op-btn-delete`) sont actifs. |

| **Si** | aucune propriété n'est sélectionnée, |
|---|---|
| **Alors** | tous les boutons sont désactivés. |

**Code source :** `owl_editor.js` → `OPEditor._updateTreeButtons()`

---

### REQ-OP-026 — Expansion/réduction d'un nœud de l'arbre

| **Si** | l'utilisateur clique sur le triangle d'un nœud de l'arbre, |
|---|---|
| **Alors** | le système bascule la visibilité du conteneur `op-tcn-<id>` entre `display:none` et `display:block`, met à jour `OPEditor._expanded` (ajout ou suppression de l'ID), et fait pivoter le triangle `▶` via la classe CSS `open`. |

**Code source :** `owl_editor.js` → `OPEditor.toggleNode()`

---

### REQ-OP-027 — Menu contextuel au clic droit sur l'arbre

| **Si** | l'utilisateur effectue un clic droit sur un nœud ou sur la racine de l'arbre, |
|---|---|
| **Alors** | - le système crée un élément DOM `div#op-ctx-menu` positionné aux coordonnées de la souris ;<br>- il contient les actions "Add Child Property", "Add Sibling Property" (uniquement si une propriété non-racine est ciblée), et "Delete" ;<br>- le menu se ferme automatiquement au prochain clic extérieur via un listener `click` en capture. |

**Code source :** `owl_editor.js` → `OPEditor.showContextMenu()`

---

### REQ-OP-028 — Formulaire d'édition d'une propriété d'objet

| **Si** | une propriété d'objet est sélectionnée dans l'arbre, |
|---|---|
| **Alors** | le système génère un formulaire HTML contenant : un champ texte `op-id` (avec `_sanitizeId()` à chaque frappe), l'IRI complet calculé depuis `APP.state.ontology.id`, le bloc Annotations, les blocs Domain et Range côte-à-côte, le bloc "Inverse Of", le bloc "Characteristics", et un cadre "Where Used" via `_whereUsedFrame()`. |

| **Si** | la propriété est nouvelle (`isNew = true`), |
|---|---|
| **Alors** | la sauvegarde est déclenchée au `onblur` ; pour une propriété existante, elle est déclenchée au `onchange`. |

**Code source :** `owl_editor.js` → `OPEditor.renderForm()`

---

### REQ-OP-029 — Gestion des annotations (labels, comments, autres)

| **Si** | l'utilisateur ajoute une annotation de type `label` ou `comment`, |
|---|---|
| **Alors** | le système ajoute une ligne dans `#op-annotations-body` via `_makeAnnotRow()`. |

| **Si** | l'utilisateur ajoute une annotation de type `other` en sélectionnant une propriété d'annotation, |
|---|---|
| **Alors** | le système ajoute une ligne de type `other` avec la propriété spécifiée et referme le picker `op-anno-picker`. |

| **Si** | l'utilisateur supprime une ligne d'annotation, |
|---|---|
| **Alors** | le système supprime la ligne `<tr>` parente du bouton cliqué et déclenche `autoSave()` si la propriété est en mode édition. |

**Code source :** `owl_editor.js` → `OPEditor.addAnnotRow()`, `OPEditor.addOtherAnnotRow()`, `OPEditor.removeAnnotRow()`

---

### REQ-OP-030 — Panneau "Super Properties" avec chaîne d'ancêtres

| **Si** | une propriété est sélectionnée dans l'arbre, |
|---|---|
| **Alors** | - le système remplit le panneau `#op-sub-list` avec les super-propriétés directes de la propriété sélectionnée ;<br>- pour chaque super-propriété directe, il construit la chaîne complète d'ancêtres jusqu'à `owl:topObjectProperty` et affiche chaque maillon avec une indentation croissante ;<br>- les super-propriétés directes ont un bouton de suppression `✕` ;<br>- les ancêtres transitifs sont affichés en italique et opacité réduite (0.75) ;<br>- un clic sur n'importe quel ancêtre navigue vers cette propriété via `APP.navigateTo()`. |

**Code source :** `owl_editor.js` → `OPEditor._updateSuperPanel()`

---

### REQ-OP-031 — Mise en page en deux panneaux redimensionnables

| **Si** | l'onglet des propriétés d'objet est affiché, |
|---|---|
| **Alors** | le système génère une mise en page à deux colonnes : un panneau gauche (`op-tree-panel`) contenant l'arbre et le sous-panneau "Super Properties" séparés par un redimensionneur horizontal `h-resizer`, et un panneau de détail droit (`op-detail`). |

| **Si** | l'utilisateur fait glisser la poignée de redimensionnement verticale (`op-split-handle`), |
|---|---|
| **Alors** | le système ajuste la largeur du panneau gauche entre 160 px et 520 px et initialise le redimensionneur interne horizontal via `_initHResizers('op-tree-panel')`. |

**Code source :** `owl_editor.js` → `OPEditor.renderSplit()` et `OPEditor._initSplitPane()`

---

### REQ-OP-032 — Restauration de la sélection après re-rendu

| **Si** | l'onglet des propriétés d'objet est re-rendu après une action, |
|---|---|
| **Alors** | - le système appelle `_initSplitPane()` ;<br>- si `_topPropSelected` est vrai, rappelle `selectTopProp()` ;<br>- si un ID est mémorisé dans `_selectedId`, rappelle `selectProp(_selectedId)` ;<br>- garantissant ainsi que la sélection courante est maintenue après chaque re-rendu. |

---

*Document généré par analyse statique du code source — claude-sonnet-4-6*

**Code source :** `owl_editor.js` → `OPEditor.restoreSelection()`
