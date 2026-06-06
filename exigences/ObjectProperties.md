# Exigences de l'onglet ObjectProperties — SWOWL

**Date :** 2026-06-06
**Note :** Exigences dérivées STRICTEMENT du code source. Chaque exigence cite la fonction JavaScript qui l'implémente. Aucune fonctionnalité n'est extrapolée.

---

## Table des matières

1. [REQ-OP-001 — Affichage de l'arbre des propriétés d'objet](#req-op-001-affichage-de-larbre-des-propriétés-dobjet-req-op-001)
2. [REQ-OP-002 — Construction de la hiérarchie de l'arbre](#req-op-002-construction-de-la-hiérarchie-de-larbre-req-op-002)
3. [REQ-OP-003 — Expansion automatique des ancêtres](#req-op-003-expansion-automatique-des-ancêtres-req-op-003)
4. [REQ-OP-004 — Rendu d'un nœud de l'arbre avec tag inversOf](#req-op-004-rendu-dun-nœud-de-larbre-avec-tag-inverseof-req-op-004)
5. [REQ-OP-005 — Sélection de owl:topObjectProperty](#req-op-005-sélection-de-owltopobjectproperty-req-op-005)
6. [REQ-OP-006 — Sélection d'une propriété dans l'arbre](#req-op-006-sélection-dune-propriété-dans-larbre-req-op-006)
7. [REQ-OP-007 — Activation contextuelle des boutons de l'arbre](#req-op-007-activation-contextuelle-des-boutons-de-la-barre-doutils-req-op-007)
8. [REQ-OP-008 — Expansion/réduction d'un nœud de l'arbre](#req-op-008-expansionréduction-dun-nœud-de-larbre-req-op-008)
9. [REQ-OP-009 — Création d'une propriété enfant](#req-op-009-création-dune-propriété-enfant-req-op-009)
10. [REQ-OP-010 — Création d'une propriété sœur](#req-op-010-création-dune-propriété-sœur-req-op-010)
11. [REQ-OP-011 — Génération automatique d'un identifiant unique](#req-op-011-génération-automatique-dun-identifiant-unique-req-op-011)
12. [REQ-OP-012 — Persistance de la création d'une propriété via l'API](#req-op-012-persistance-de-la-création-dune-propriété-via-lapi-req-op-012)
13. [REQ-OP-013 — Menu contextuel au clic droit sur l'arbre](#req-op-013-menu-contextuel-au-clic-droit-sur-larbre-req-op-013)
14. [REQ-OP-014 — Déplacement par glisser-déposer dans l'arbre](#req-op-014-déplacement-par-glisser-déposer-dans-larbre-req-op-014)
15. [REQ-OP-015 — Protection contre les cycles lors du glisser-déposer](#req-op-015-protection-contre-les-cycles-lors-du-glisser-déposer-req-op-015)
16. [REQ-OP-016 — Suppression d'une propriété avec confirmation](#req-op-016-suppression-dune-propriété-avec-confirmation-req-op-016)
17. [REQ-OP-017 — Formulaire d'édition d'une propriété d'objet](#req-op-017-formulaire-dédition-dune-propriété-dobjet-req-op-017)
18. [REQ-OP-018 — Gestion des annotations (labels, comments, autres)](#req-op-018-gestion-des-annotations-labels-comments-autres-req-op-018)
19. [REQ-OP-019 — Ajout d'une classe dans le domaine](#req-op-019-ajout-dune-classe-dans-le-domaine-req-op-019)
20. [REQ-OP-020 — Suppression d'une classe du domaine](#req-op-020-suppression-dune-classe-du-domaine-req-op-020)
21. [REQ-OP-021 — Ajout d'une classe dans le range](#req-op-021-ajout-dune-classe-dans-le-range-req-op-021)
22. [REQ-OP-022 — Suppression d'une classe du range](#req-op-022-suppression-dune-classe-du-range-req-op-022)
23. [REQ-OP-023 — Définition de la propriété inverse](#req-op-023-définition-de-la-propriété-inverse-req-op-023)
24. [REQ-OP-024 — Unicité de la propriété inverse](#req-op-024-unicité-de-la-propriété-inverse-req-op-024)
25. [REQ-OP-025 — Suppression de la propriété inverse](#req-op-025-suppression-de-la-propriété-inverse-req-op-025)
26. [REQ-OP-026 — Affichage des propriétés inverses inférées](#req-op-026-affichage-des-propriétés-inverses-inférées-req-op-026)
27. [REQ-OP-027 — Gestion des super-propriétés (subPropertyOf)](#req-op-027-gestion-des-super-propriétés-subpropertyof-req-op-027)
28. [REQ-OP-028 — Panneau "Super Properties" avec chaîne d'ancêtres](#req-op-028-panneau-super-properties-avec-chaîne-dancêtres-req-op-028)
29. [REQ-OP-029 — Caractéristiques OWL de la propriété](#req-op-029-caractéristiques-owl-de-la-propriété-req-op-029)
30. [REQ-OP-030 — Sauvegarde automatique en mode édition](#req-op-030-sauvegarde-automatique-en-mode-édition-req-op-030)
31. [REQ-OP-031 — Sauvegarde complète (création ou mise à jour)](#req-op-031-sauvegarde-complète-création-ou-mise-à-jour-req-op-031)
32. [REQ-OP-032 — Mise en page en deux panneaux redimensionnables](#req-op-032-mise-en-page-en-deux-panneaux-redimensionnables-req-op-032)
33. [REQ-OP-033 — Restauration de la sélection après re-rendu](#req-op-033-restauration-de-la-sélection-après-re-rendu-req-op-033)
34. [REQ-OP-034 — Création d'une ObjectProperty depuis l'onglet Classes](#req-op-034-création-dune-objectproperty-depuis-longlet-classes-req-op-034)

---

### REQ-OP-001 — Affichage de l'arbre des propriétés d'objet {#req-op-001}

**Code source :** `owl_editor.js` → `OPEditor.renderTree()`

La fonction `renderTree()` génère le HTML de l'arbre complet des ObjectProperties. Elle place en racine un nœud fixe `owl:topObjectProperty` (cliquable via `OPEditor.selectTopProp()`), puis appelle récursivement `_renderNode()` pour chaque propriété racine (celles sans parent dans `subPropertyOf`). Si aucune propriété n'existe, un texte "No ObjectProperty" est affiché à la place.

---

### REQ-OP-002 — Construction de la hiérarchie de l'arbre {#req-op-002}

**Code source :** `owl_editor.js` → `OPEditor.buildTree()`

La fonction `buildTree()` calcule, à partir du tableau `APP.state.object_properties`, la liste des enfants de chaque nœud (`childrenOf`) et la liste des nœuds racines (`roots`). Seules les références `subPropertyOf` pointant vers des IDs existants dans le tableau sont prises en compte. Les listes sont triées alphabétiquement (insensible à la casse via `localeCompare`).

---

### REQ-OP-003 — Expansion automatique des ancêtres {#req-op-003}

**Code source :** `owl_editor.js` → `OPEditor._expandAncestors()`

Quand une propriété est sélectionnée ou créée, `_expandAncestors()` parcourt récursivement la chaîne `subPropertyOf` de la propriété et ajoute chaque ancêtre dans `OPEditor._expanded` afin que le chemin jusqu'à la propriété soit visible dans l'arbre.

---

### REQ-OP-004 — Rendu d'un nœud de l'arbre avec tag inverseOf {#req-op-004}

**Code source :** `owl_editor.js` → `OPEditor._renderNode()`

La fonction `_renderNode()` génère le HTML d'un nœud de l'arbre. Chaque nœud est `draggable="true"` et porte les handlers `ondragstart`, `ondragover`, `ondragleave`, `ondrop`, `ondragend`. Si la propriété possède un champ `inverseOf` non nul, un badge `↔ <id>` est affiché à côté du label. L'indentation est calculée en fonction de la profondeur (`depth * 16 + 6` px). Les enfants sont rendus dans un conteneur `op-tcn-<id>` dont la visibilité est pilotée par `OPEditor._expanded`.

---

### REQ-OP-005 — Sélection de owl:topObjectProperty {#req-op-005}

**Code source :** `owl_editor.js` → `OPEditor.selectTopProp()`

Au clic sur le nœud racine `owl:topObjectProperty`, `selectTopProp()` positionne `_selectedId = null` et `_topPropSelected = true`, applique la classe CSS `selected` sur le nœud racine, remplace le contenu du panneau de détail par un message d'accueil avec un bouton "＋ Create Object Property", vide le panneau "Super Properties", et met à jour l'état des boutons de la barre d'outils via `_updateTreeButtons()`.

---

### REQ-OP-006 — Sélection d'une propriété dans l'arbre {#req-op-006}

**Code source :** `owl_editor.js` → `OPEditor.selectProp()`

Au clic sur un nœud, `selectProp(id)` met à jour `_selectedId`, applique la classe `selected` au bon item de l'arbre, remplace le panneau de détail par `renderForm(prop)`, initialise les redimensionneurs verticaux internes (`_initHResizers`), rafraîchit le panneau "Super Properties" via `_updateSuperPanel()`, met à jour les boutons via `_updateTreeButtons()`, et déclenche le chargement des inférences d'inverse via `_loadInferredInverse()`.

---

### REQ-OP-007 — Activation contextuelle des boutons de la barre d'outils {#req-op-007}

**Code source :** `owl_editor.js` → `OPEditor._updateTreeButtons()`

`_updateTreeButtons()` active ou désactive les trois boutons de la barre (`op-btn-child`, `op-btn-sister`, `op-btn-delete`) selon la sélection courante : si `owl:topObjectProperty` est sélectionné, seul le bouton "Child" est actif ; si une propriété est sélectionnée, les trois boutons sont actifs ; sinon, tous sont désactivés.

---

### REQ-OP-008 — Expansion/réduction d'un nœud de l'arbre {#req-op-008}

**Code source :** `owl_editor.js` → `OPEditor.toggleNode()`

`toggleNode(id)` bascule la visibilité du conteneur `op-tcn-<id>` entre `display:none` et `display:block`, met à jour `OPEditor._expanded` (ajout ou suppression de l'ID), et fait pivoter le triangle `▶` via la classe CSS `open`.

---

### REQ-OP-009 — Création d'une propriété enfant {#req-op-009}

**Code source :** `owl_editor.js` → `OPEditor.createChild()`

`createChild()` détermine le parent comme étant `_selectedId` (ou aucun parent si c'est `owl:topObjectProperty`), ajoute le parent dans `_expanded` pour qu'il soit ouvert dans l'arbre, puis délègue à `_createAndSelect([parent])`.

---

### REQ-OP-010 — Création d'une propriété sœur {#req-op-010}

**Code source :** `owl_editor.js` → `OPEditor.createSibling()`

`createSibling()` récupère la liste des parents directs de la propriété sélectionnée (champ `subPropertyOf`), les ajoute tous dans `_expanded`, puis délègue à `_createAndSelect(parents)` pour créer une nouvelle propriété avec les mêmes parents.

---

### REQ-OP-011 — Génération automatique d'un identifiant unique {#req-op-011}

**Code source :** `owl_editor.js` → `OPEditor._generatePropName()`

`_generatePropName()` génère un identifiant de la forme `NewObjectProperty`, `NewObjectProperty1`, `NewObjectProperty2`, etc. en incrémentant un suffixe numérique tant que l'ID est déjà présent dans `APP.state.object_properties`.

---

### REQ-OP-012 — Persistance de la création d'une propriété via l'API {#req-op-012}

**Code source :** `owl_editor.js` → `OPEditor._createAndSelect()`

`_createAndSelect(subPropertyOf)` construit un objet propriété minimal (avec `domain: [], range: [], inverseOf: null, characteristics: {}, propertyChainAxiom: []`) et appelle `API.createOP(prop)`. En cas de succès, il positionne `_selectedId` et `_editingId`, appelle `APP.refresh()` pour recharger l'état global, puis `APP.renderSection('object-properties')` pour re-rendre l'onglet. Les erreurs sont affichées via `UI.error()`.

---

### REQ-OP-013 — Menu contextuel au clic droit sur l'arbre {#req-op-013}

**Code source :** `owl_editor.js` → `OPEditor.showContextMenu()`

`showContextMenu(event, id)` intercepte le clic droit sur un nœud ou sur la racine. Il crée un élément DOM `div#op-ctx-menu` positionné aux coordonnées de la souris, contenant les actions "Add Child Property", "Add Sibling Property" (uniquement si une propriété non-racine est ciblée), et "Delete". Le menu se ferme automatiquement au prochain clic extérieur via un listener `click` en capture.

---

### REQ-OP-014 — Déplacement par glisser-déposer dans l'arbre {#req-op-014}

**Code source :** `owl_editor.js` → `OPEditor.onDrop()`

`onDrop(event, targetId)` reçoit l'ID de la propriété déposée (depuis `_dragId`) et l'ID de la cible. Il reconstruit la propriété avec `subPropertyOf: [targetId]` (ou `[]` si dépôt sur la racine) et appelle `API.updateOP(draggedId, updated)`. En cas de succès, il affiche `UI.success()`, rafraîchit l'état via `APP.refresh()` et re-rend l'onglet.

---

### REQ-OP-015 — Protection contre les cycles lors du glisser-déposer {#req-op-015}

**Code source :** `owl_editor.js` → `OPEditor._isDescendant()` et `OPEditor.onDrop()`

Avant d'autoriser le dépôt, `onDrop()` appelle `_isDescendant(targetId, draggedId)`. Cette fonction parcourt récursivement `childrenOf` (obtenu via `buildTree()`) pour vérifier si `targetId` est un descendant de la propriété déplacée. Si c'est le cas, le dépôt est bloqué avec le message `UI.warn('Cannot drop on a descendant — would create a cycle')`. La même vérification est faite dans `onDragOver()` pour désactiver l'indicateur visuel de dépôt.

---

### REQ-OP-016 — Suppression d'une propriété avec confirmation {#req-op-016}

**Code source :** `owl_editor.js` → `OPEditor.delete()`

`delete(id)` affiche une boîte de dialogue de confirmation via `UI.confirm()` avec le message `Delete ObjectProperty <strong>${id}</strong>?`. Si confirmé, il appelle `API.deleteOP(id)`, réinitialise `_selectedId` et `_editingId` à `null`, puis rafraîchit l'onglet. `deleteSelected()` est un raccourci qui appelle `delete(this._selectedId)` si une propriété est sélectionnée.

---

### REQ-OP-017 — Formulaire d'édition d'une propriété d'objet {#req-op-017}

**Code source :** `owl_editor.js` → `OPEditor.renderForm()`

`renderForm(prop)` génère le formulaire HTML complet d'une propriété. Il contient : un champ texte `op-id` pour l'identifiant local (avec `_sanitizeId()` à chaque frappe), l'IRI complet calculé depuis `APP.state.ontology.id`, le bloc Annotations, les blocs Domain et Range côte-à-côte, le bloc "Inverse Of", le bloc "Characteristics", et un cadre "Where Used" via `_whereUsedFrame()`. Pour une nouvelle propriété (`isNew = true`), la sauvegarde est déclenchée au `onblur`; pour une propriété existante, au `onchange`.

---

### REQ-OP-018 — Gestion des annotations (labels, comments, autres) {#req-op-018}

**Code source :** `owl_editor.js` → `OPEditor.addAnnotRow()`, `OPEditor.addOtherAnnotRow()`, `OPEditor.removeAnnotRow()`

- `addAnnotRow(type)` ajoute une ligne dans `#op-annotations-body` via `_makeAnnotRow()` pour les types `label` ou `comment`.
- `addOtherAnnotRow(prop)` ajoute une ligne de type `other` avec la propriété d'annotation spécifiée, puis referme le picker `op-anno-picker`.
- `removeAnnotRow(btn)` supprime la ligne `<tr>` parente du bouton cliqué et déclenche `autoSave()` si en mode édition.

---

### REQ-OP-019 — Ajout d'une classe dans le domaine {#req-op-019}

**Code source :** `owl_editor.js` → `OPEditor.addDomain()`

`addDomain(id)` ajoute l'ID de classe sélectionné dans la liste DOM `#op-domain-list` via `_addListItem()` (avec fermeture du picker `op-domain-picker`) et déclenche `autoSave()` si une propriété est en cours d'édition. Si aucun domain n'est défini, le placeholder `owl:Thing` est affiché.

---

### REQ-OP-020 — Suppression d'une classe du domaine {#req-op-020}

**Code source :** `owl_editor.js` → `OPEditor.removeDomain()`

`removeDomain(id)` supprime l'item correspondant de `#op-domain-list` via `_removeListItem()` (avec restauration du placeholder `owl:Thing` si la liste est vide) et déclenche `autoSave()` si en mode édition.

---

### REQ-OP-021 — Ajout d'une classe dans le range {#req-op-021}

**Code source :** `owl_editor.js` → `OPEditor.addRange()`

`addRange(id)` ajoute l'ID de classe dans `#op-range-list` via `_addListItem()` et déclenche `autoSave()`. Si aucun range n'est défini, le placeholder `owl:Thing` est affiché.

---

### REQ-OP-022 — Suppression d'une classe du range {#req-op-022}

**Code source :** `owl_editor.js` → `OPEditor.removeRange()`

`removeRange(id)` supprime l'item de `#op-range-list` via `_removeListItem()` (avec restauration du placeholder `owl:Thing`) et déclenche `autoSave()`.

---

### REQ-OP-023 — Définition de la propriété inverse {#req-op-023}

**Code source :** `owl_editor.js` → `OPEditor.setInverse()`

`setInverse(id)` met à jour le champ caché `#op-inverse-value` avec l'ID sélectionné, remplace dans `#op-inverse-body` le placeholder "— none —" par un item avec un bouton de suppression, masque le bouton `+` via `display:none`, ferme le picker `op-inverse-picker`, et déclenche `autoSave()`. La navigation vers la propriété inverse est possible via `APP.navigateTo()` depuis le label de l'item.

---

### REQ-OP-024 — Unicité de la propriété inverse {#req-op-024}

**Code source :** `owl_editor.js` → `OPEditor.showPicker()`

`showPicker('op-inverse-picker')` vérifie si `#op-inverse-value` contient déjà une valeur : si c'est le cas, il retourne immédiatement sans ouvrir le picker, garantissant qu'une seule propriété inverse peut être définie à la fois. De plus, le picker d'inverse exclut les propriétés qui ont déjà un `inverseOf` défini (sauf vers la propriété courante).

---

### REQ-OP-025 — Suppression de la propriété inverse {#req-op-025}

**Code source :** `owl_editor.js` → `OPEditor.removeInverse()`

`removeInverse()` est un alias de `setInverse('')` : elle efface la valeur de `#op-inverse-value`, réaffiche le placeholder "— none —", et rend visible le bouton `+` pour permettre une nouvelle sélection.

---

### REQ-OP-026 — Affichage des propriétés inverses inférées {#req-op-026}

**Code source :** `owl_editor.js` → `OPEditor._loadInferredInverse()`

À chaque sélection d'une propriété, `_loadInferredInverse(id)` appelle `API.getInferences()` et filtre les résultats sur `inferred_inverse_properties` pour ne retenir que les inférences concernant la propriété courante. Pour chaque inférence trouvée, un badge `⊢ inverse of <strong>${i.inverse_of}</strong>` est injecté dans `#op-inferred-inverse`, avec l'attribut `title` portant la raison de l'inférence. Les erreurs sont silencieuses.

---

### REQ-OP-027 — Gestion des super-propriétés (subPropertyOf) {#req-op-027}

**Code source :** `owl_editor.js` → `OPEditor.addSubProp()`, `OPEditor.removeSubProp()`

- `addSubProp(id)` ajoute la propriété sélectionnée dans `#op-sub-list` via `_addListItem()` et déclenche `autoSave()`.
- `removeSubProp(id)` supprime la super-propriété de `#op-sub-list` via `_removeListItem()` et déclenche `autoSave()`.

---

### REQ-OP-028 — Panneau "Super Properties" avec chaîne d'ancêtres {#req-op-028}

**Code source :** `owl_editor.js` → `OPEditor._updateSuperPanel()`

`_updateSuperPanel(prop)` remplit le panneau gauche `#op-sub-list` avec la liste des super-propriétés directes de `prop`. Pour chaque super-propriété directe, elle construit la chaîne complète d'ancêtres jusqu'à `owl:topObjectProperty` (via une boucle `buildChain()`) et affiche chaque maillon avec une indentation croissante. Les super-propriétés directes ont un bouton de suppression `✕`; les ancêtres transitifs sont affichés en italique et opacité réduite (0.75). Un clic sur n'importe quel ancêtre navigue vers cette propriété via `APP.navigateTo()`.

---

### REQ-OP-029 — Caractéristiques OWL de la propriété {#req-op-029}

**Code source :** `owl_editor.js` → `OPEditor.renderForm()` et `OPEditor.save()`

Le formulaire généré par `renderForm()` contient une grille de 7 cases à cocher correspondant aux caractéristiques OWL : `functional`, `inverseFunctional`, `transitive`, `symmetric`, `asymmetric`, `reflexive`, `irreflexive`. Chaque case est pré-cochée selon `prop.characteristics[k]`. Lors de la sauvegarde, `save()` lit chaque case via `document.getElementById('op-${k}')?.checked` et constitue l'objet `chars` qui est inclus dans le payload envoyé à `API.updateOP()` ou `API.createOP()`.

---

### REQ-OP-030 — Sauvegarde automatique en mode édition {#req-op-030}

**Code source :** `owl_editor.js` → `OPEditor.autoSave()`

`autoSave()` vérifie que `_editingId !== null` (c'est-à-dire qu'une propriété existante est en cours d'édition) avant d'appeler `save(false)`. Elle est déclenchée sur les événements `onchange` de tous les champs du formulaire lorsque la propriété est en mode édition (par opposition au mode création où la sauvegarde est sur `onblur`).

---

### REQ-OP-031 — Sauvegarde complète (création ou mise à jour) {#req-op-031}

**Code source :** `owl_editor.js` → `OPEditor.save()`

`save(isNew)` collecte l'ensemble des données du formulaire : l'identifiant (`op-id`), les annotations (`_collectAnnotations('op-annotations-body')`), le domaine (`_collectList('op-domain-list')`), le range (`_collectList('op-range-list')`), les super-propriétés (`_collectList('op-sub-list')`), la propriété inverse (`#op-inverse-value`), et les 7 caractéristiques. L'identifiant est validé via `_validateId()`. Si `isNew`, appelle `API.createOP()`; sinon `API.updateOP(originalId, prop)`. Si l'ID a changé, affiche un message de renommage. Dans les deux cas, rafraîchit l'onglet après succès.

---

### REQ-OP-032 — Mise en page en deux panneaux redimensionnables {#req-op-032}

**Code source :** `owl_editor.js` → `OPEditor.renderSplit()` et `OPEditor._initSplitPane()`

`renderSplit()` génère une mise en page à deux colonnes : un panneau gauche (`op-tree-panel`) contenant l'arbre et le sous-panneau "Super Properties" séparés par un redimensionneur horizontal `h-resizer`, et un panneau de détail droit (`op-detail`). `_initSplitPane()` initialise le redimensionneur vertical entre les deux colonnes (`op-split-handle`) via un listener `mousedown` qui ajuste la largeur du panneau gauche entre 160 px et 520 px, et appelle `_initHResizers('op-tree-panel')` pour le redimensionneur interne horizontal.

---

### REQ-OP-033 — Restauration de la sélection après re-rendu {#req-op-033}

**Code source :** `owl_editor.js` → `OPEditor.restoreSelection()`

`restoreSelection()` appelle `_initSplitPane()` puis, selon l'état mémorisé, rappelle `selectTopProp()` si `_topPropSelected` est vrai, ou `selectProp(_selectedId)` si un ID est mémorisé. Cette fonction est appelée après chaque re-rendu de la section pour que la sélection courante soit maintenue.

---

### REQ-OP-034 — Création d'une ObjectProperty depuis l'onglet Classes {#req-op-034}

**Code source :** `owl_editor.js` → fonction anonyme dans `CLSEditor` (ligne ~613), identifiée par le commentaire `Creates an ObjectProperty with domain = selected class`

Depuis l'onglet Classes, un bouton "Create new ObjectProperty" appelle une fonction qui génère un nom via `OPEditor._generatePropName()`, crée une propriété avec `domain: [classId]` et les autres champs vides, l'enregistre via `API.createOP()`, positionne `OPEditor._selectedId` et `OPEditor._editingId` sur le nouvel ID, puis navigue vers l'onglet `object-properties` via `APP.navigateTo()`.

---

*Document généré par analyse statique du code source — claude-sonnet-4-6*
