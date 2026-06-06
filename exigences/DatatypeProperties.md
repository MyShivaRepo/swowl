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

| **Si** | l'`ontologiste` doit typer une `DatatypeProperty` avec un type de données littéral, |
|---|---|
| **Alors** | l'application propose exactement 12 types XSD reconnus : `xsd:string`, `xsd:integer`, `xsd:decimal`, `xsd:float`, `xsd:double`, `xsd:boolean`, `xsd:date`, `xsd:dateTime`, `xsd:duration`, `xsd:anyURI`, `xsd:nonNegativeInteger`, `xsd:positiveInteger` — aucun autre type de données n'est autorisé comme range d'une `DatatypeProperty`. |

---

**Code source :** `owl_editor.js` → `XSD_TYPES` (constante, lignes 167–171) — Tableau figé des 12 types XSD autorisés, utilisé comme référence unique pour alimenter les sélecteurs de range et valider les imports.

### REQ-DP-002 — Construction de l'arbre hiérarchique des propriétés

| **Si** | l'`ontologie` contient des `DatatypeProperties` organisées en hiérarchie de spécialisation, |
|---|---|
| **Alors** | l'arbre des `propriétés` reflète fidèlement ces relations de spécialisation, avec les `propriétés` les plus générales à la racine et les plus spécifiques en feuilles, chaque niveau trié alphabétiquement. |

---

**Code source :** `owl_editor.js` → `DPEditor.buildTree()` — Analyse les relations `subPropertyOf` de chaque propriété, construit un dictionnaire `childrenOf` (map id → tableau d'ids enfants) et une liste `roots` (propriétés sans parent), les deux triés alphabétiquement. Les références vers des IDs inexistants sont ignorées pour éviter les cycles.

### REQ-DP-003 — Expansion automatique des ancêtres d'une propriété sélectionnée

| **Si** | l'`ontologiste` sélectionne une `DatatypeProperty` enfouie dans la hiérarchie, |
|---|---|
| **Alors** | l'arbre se déplie automatiquement pour révéler la `propriété` sélectionnée, sans que l'utilisateur ait à déplier manuellement chaque niveau intermédiaire. |

---

**Code source :** `owl_editor.js` → `DPEditor._expandAncestors()` — Remonte récursivement la chaîne `subPropertyOf` depuis la propriété sélectionnée et insère chaque ancêtre trouvé dans le Set `_expanded`, déclenchant ainsi leur affichage dans l'arbre.

### REQ-DP-004 — Création d'une propriété enfant (child)

| **Si** | l'`ontologiste` souhaite spécialiser une `DatatypeProperty` existante en créant une sous-`propriété`, |
|---|---|
| **Alors** | la nouvelle `propriété` est automatiquement positionnée sous la `propriété` actuellement sélectionnée dans la hiérarchie, et la `propriété` parente est dépliée pour la rendre visible. |

| **Si** | aucune `propriété` n'est sélectionnée au moment de la création, |
|---|---|
| **Alors** | la nouvelle `propriété` est créée à la racine de la hiérarchie, sans relation de spécialisation. |

---

**Code source :** `owl_editor.js` → `DPEditor.createChild()` — Si `_selectedId` est défini, passe cet id comme parent à `_createAndSelect([parentId])` et ajoute le parent à `_expanded`. Sinon appelle `_createAndSelect([])`.

### REQ-DP-005 — Création d'une propriété sœur (sibling)

| **Si** | l'`ontologiste` souhaite créer une `DatatypeProperty` au même niveau de spécialisation qu'une `propriété` existante, |
|---|---|
| **Alors** | la nouvelle `propriété` hérite des mêmes super-`propriétés` que la `propriété` de référence, se positionnant ainsi automatiquement au même rang dans la hiérarchie. |

---

**Code source :** `owl_editor.js` → `DPEditor.createSibling()` — Récupère le tableau `subPropertyOf` de la propriété référencée par `_selectedId`, le passe à `_createAndSelect()` et ajoute chaque parent à `_expanded`.

### REQ-DP-006 — Génération d'un nom unique pour une nouvelle propriété

| **Si** | l'`ontologiste` crée une nouvelle `DatatypeProperty`, |
|---|---|
| **Alors** | un nom provisoire lui est automatiquement attribué, garantissant l'absence de conflit d'identifiant avec les `propriétés` déjà présentes dans l'`ontologie`. |

---

**Code source :** `owl_editor.js` → `DPEditor._generatePropName()` — Génère le nom `'NewDatatypeProperty'` puis incrémente un compteur suffixé (`NewDatatypeProperty1`, `NewDatatypeProperty2`, …) jusqu'à obtenir un identifiant absent de `APP.state.datatype_properties`.

### REQ-DP-007 — Création effective et navigation vers la nouvelle propriété

| **Si** | l'`ontologiste` confirme la création d'une `DatatypeProperty`, |
|---|---|
| **Alors** | la nouvelle `propriété` est immédiatement accessible dans l'arbre et son formulaire d'édition s'ouvre automatiquement, prête à être complétée. |

---

**Code source :** `owl_editor.js` → `DPEditor._createAndSelect()` — Construit un objet propriété avec les valeurs par défaut (`annotations: {}`, `domain: []`, `range: []`, `functional: false`) et l'IRI issu de `_generatePropName()`. Appelle `API.createDP(prop)`, mémorise l'id dans `_selectedId` et `_editingId`, puis rafraîchit via `APP.refresh()` et `APP.renderSection('datatype-properties')`. Les erreurs sont signalées via `UI.error()`.

### REQ-DP-008 — Dépôt (drop) d'une propriété sur une nouvelle cible

| **Si** | l'`ontologiste` déplace une `DatatypeProperty` par glisser-déposer vers une autre `propriété` parente, |
|---|---|
| **Alors** | la relation de spécialisation est mise à jour pour refléter le nouveau positionnement dans la hiérarchie, et le changement est immédiatement persisté. |

| **Si** | l'`ontologiste` tente de déplacer une `DatatypeProperty` vers l'un de ses propres descendants, |
|---|---|
| **Alors** | l'opération est refusée afin d'éviter la création d'un cycle dans la hiérarchie, et un avertissement est affiché. |

| **Si** | l'`ontologiste` dépose une `DatatypeProperty` sur la racine ou en dehors de tout nœud, |
|---|---|
| **Alors** | la `propriété` devient une `propriété` racine, sans relation de spécialisation. |

---

**Code source :** `owl_editor.js` → `DPEditor.onDrop()` — Lit `_dragId` et `targetId`. Si `_isDescendant(targetId, _dragId)` retourne `true`, affiche `UI.warn('Cannot drop on a descendant — would create a cycle')` et abandonne. Sinon met à jour `subPropertyOf` de la propriété source à `[targetId]` ou `[]` selon que la cible est définie, appelle `API.updateDP()`, puis `UI.success()` et rafraîchit l'affichage.

### REQ-DP-009 — Vérification d'un lien ancêtre/descendant pour le drag & drop

| **Si** | l'`ontologiste` déplace une `DatatypeProperty` par glisser-déposer, |
|---|---|
| **Alors** | l'application vérifie en temps réel que la cible potentielle n'est pas un descendant de la `propriété` déplacée, afin d'empêcher toute création de cycle dans la hiérarchie. |

---

**Code source :** `owl_editor.js` → `DPEditor._isDescendant(targetId, sourceId)` — Effectue une traversée récursive en profondeur depuis `sourceId` via `buildTree().childrenOf`. Retourne `false` immédiatement si l'un des deux paramètres est `null` ou `undefined`.

### REQ-DP-010 — Contrôle de l'unicité du range avant ouverture du sélecteur

| **Si** | l'`ontologiste` tente d'ajouter un type de données comme range alors qu'un type est déjà défini, |
|---|---|
| **Alors** | le sélecteur de range ne s'ouvre pas, garantissant qu'une `DatatypeProperty` ne peut avoir qu'un seul type de données comme range. |

| **Si** | l'`ontologiste` ouvre tout autre sélecteur de valeur, |
|---|---|
| **Alors** | le sélecteur correspondant s'affiche normalement. |

---

**Code source :** `owl_editor.js` → `DPEditor.showPicker()` — Pour le sélecteur `dp-range-picker`, vérifie la présence d'un élément `.cls-list-item[data-id]` dans `dp-range-list` avant d'autoriser l'ouverture. Pour tous les autres sélecteurs, délègue à `_togglePicker(id)`.

### REQ-DP-011 — Gestion du domaine

| **Si** | l'`ontologiste` associe une `classe` comme domaine d'une `DatatypeProperty`, |
|---|---|
| **Alors** | la `classe` apparaît dans la liste des domaines de la `propriété` et la modification est automatiquement sauvegardée. |

| **Si** | l'`ontologiste` retire une `classe` du domaine, |
|---|---|
| **Alors** | la `classe` disparaît de la liste des domaines ; si la liste est vide, `owl:Thing` est affiché comme valeur implicite, et la modification est automatiquement sauvegardée. |

---

**Code source :** `owl_editor.js` → `DPEditor.addDomain()` — Insère la classe dans `dp-domain-list` via `_addListItem()` avec le style `cls-dot`, puis appelle `autoSave()`. `DPEditor.removeDomain()` — Retire l'entrée via `_removeListItem()`, affiche `owl:Thing` si la liste est vide, puis appelle `autoSave()`.

### REQ-DP-012 — Gestion du range (type XSD)

| **Si** | l'`ontologiste` associe un type de données XSD comme range d'une `DatatypeProperty`, |
|---|---|
| **Alors** | le type apparaît dans la liste des ranges et la possibilité d'en ajouter un second est désactivée afin de maintenir l'unicité du range ; la modification est automatiquement sauvegardée. |

| **Si** | l'`ontologiste` retire le type de données du range, |
|---|---|
| **Alors** | la liste des ranges redevient vide (affichage implicite `rdfs:Literal`), la possibilité d'ajouter un type est réactivée, et la modification est automatiquement sauvegardée. |

---

**Code source :** `owl_editor.js` → `DPEditor.addRange()` — Insère le type dans `dp-range-list` via `_addListItem()` avec le style `xsd-dot`, masque le bouton `dp-range-btn`, puis appelle `autoSave()` si `_editingId` est défini. `DPEditor.removeRange()` — Retire le type via `_removeListItem()`, réaffiche `dp-range-btn`, puis appelle `autoSave()`.

### REQ-DP-013 — Gestion d'une super-propriété

| **Si** | l'`ontologiste` déclare une super-`propriété` pour une `DatatypeProperty`, |
|---|---|
| **Alors** | la relation de spécialisation est enregistrée et visible dans la liste des super-`propriétés`, et la modification est automatiquement sauvegardée. |

| **Si** | l'`ontologiste` retire une super-`propriété`, |
|---|---|
| **Alors** | la relation de spécialisation est supprimée et la modification est automatiquement sauvegardée. |

---

**Code source :** `owl_editor.js` → `DPEditor.addSubProp()` — Insère la propriété dans `dp-sub-list` via `_addListItem()` avec navigation vers la section `'datatype-properties'` et style `dp-prop-dot`, puis appelle `autoSave()`. `DPEditor.removeSubProp()` — Retire l'entrée via `_removeListItem()`, puis appelle `autoSave()`.

### REQ-DP-014 — Sauvegarde automatique lors d'un changement de champ

| **Si** | l'`ontologiste` modifie une valeur dans le formulaire d'une `DatatypeProperty` existante, |
|---|---|
| **Alors** | la modification est sauvegardée automatiquement, sans que l'utilisateur ait à déclencher manuellement une action de sauvegarde. |

---

**Code source :** `owl_editor.js` → `DPEditor.autoSave()` — Vérifie que `_editingId !== null` avant d'appeler `save(false)`, évitant toute persistance intempestive lors du rendu du formulaire de création.

### REQ-DP-015 — Sauvegarde (création ou mise à jour) d'une DatatypeProperty

| **Si** | l'`ontologiste` valide les informations d'une nouvelle `DatatypeProperty`, |
|---|---|
| **Alors** | la `propriété` est créée dans l'`ontologie` avec l'ensemble des informations saisies (identifiant, annotations, domaine, range, super-`propriétés`, caractéristique fonctionnelle), et un message de confirmation est affiché. |

| **Si** | l'`ontologiste` modifie une `DatatypeProperty` existante et déclenche la sauvegarde, |
|---|---|
| **Alors** | toutes les modifications sont persistées ; si l'identifiant a changé, le renommage est signalé à l'utilisateur. |

---

**Code source :** `owl_editor.js` → `DPEditor.save()` — Collecte l'identifiant via `document.getElementById('dp-id').value` validé par `_validateId()`, les annotations via `_collectAnnotations('dp-annotations-body')`, le domaine via `_collectList('dp-domain-list')`, le range via `_collectList('dp-range-list')`, les super-propriétés via `_collectList('dp-sub-list')`, et la caractéristique fonctionnelle via la case à cocher `dp-functional`. En mode création (`isNew === true`) appelle `API.createDP(prop)` ; en mode mise à jour appelle `API.updateDP(originalId, prop)`. Dans les deux cas, `APP.refresh()` puis `APP.renderSection('datatype-properties')` sont appelés.

### REQ-DP-016 — Suppression d'une DatatypeProperty avec confirmation

| **Si** | l'`ontologiste` demande la suppression d'une `DatatypeProperty`, |
|---|---|
| **Alors** | une confirmation explicite lui est demandée avant toute action irréversible. |

| **Si** | l'`ontologiste` confirme la suppression, |
|---|---|
| **Alors** | la `propriété` est définitivement retirée de l'`ontologie`, la sélection courante est réinitialisée, et l'arbre est mis à jour en conséquence. |

---

**Code source :** `owl_editor.js` → `DPEditor.delete()` — Affiche une boîte de dialogue via `UI.confirm()`. En cas de confirmation, appelle `API.deleteDP(id)`, affiche `UI.success()`, réinitialise `_selectedId` et `_editingId` à `null`, puis rafraîchit via `APP.refresh()` et `APP.renderSection('datatype-properties')`.

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

### REQ-DP-017 — Génération d'options HTML pour les DatatypeProperties

| **Si** | un autre onglet de l'application présente une liste déroulante référençant des `DatatypeProperties`, |
|---|---|
| **Alors** | toutes les `DatatypeProperties` de l'`ontologie` y sont proposées comme options, avec présélection de la valeur courante le cas échéant. |

---

**Code source :** `owl_editor.js` → `dpOptions(selectedId)` — Itère sur `APP.state.datatype_properties` et produit une chaîne d'éléments `<option value="id">id</option>`, avec l'attribut `selected` positionné sur l'entrée dont l'id correspond à `selectedId`.

### REQ-DP-018 — Génération d'options HTML pour les types XSD

| **Si** | un sélecteur de type de données doit être affiché dans l'application, |
|---|---|
| **Alors** | tous les types XSD autorisés sont proposés comme options, avec `xsd:string` présélectionné par défaut si aucune valeur n'est spécifiée. |

---

**Code source :** `owl_editor.js` → `xsdOptions(selected)` — Itère sur `XSD_TYPES` et produit des éléments `<option>` HTML, avec `selected === undefined` traitant `xsd:string` comme valeur par défaut.

### REQ-DP-019 — Rendu d'un nœud de l'arbre avec gestion drag & drop

| **Si** | un nœud de l'arbre des `DatatypeProperties` est affiché, |
|---|---|
| **Alors** | il est visuellement indenté selon son rang dans la hiérarchie, accompagné d'un indicateur d'expansion s'il possède des sous-`propriétés`, et il est interactif pour la sélection, le menu contextuel et le réorganisation par glisser-déposer. |

---

**Code source :** `owl_editor.js` → `DPEditor._renderNode(id, depth)` — Génère le HTML du nœud avec une indentation calculée à `depth * 16 + 6` px. Inclut un triangle de déplié/replié si `childrenOf[id]` est non vide. Branche les handlers `onclick`, `oncontextmenu`, `ondragstart`, `ondragover`, `ondragleave`, `ondrop`, `ondragend` vers les méthodes correspondantes de `DPEditor`.

### REQ-DP-020 — Rendu de l'arbre complet avec racine owl:topDataProperty

| **Si** | l'onglet `DatatypeProperties` est affiché, |
|---|---|
| **Alors** | l'arbre est présenté avec `owl:topDataProperty` (ou son équivalent selon le profil OWL de l'`ontologie`) comme racine universelle, suivi de toutes les `propriétés` de l'`ontologie` organisées en hiérarchie ; si aucune `propriété` n'existe, un message informatif le signale. |

---

**Code source :** `owl_editor.js` → `DPEditor.renderTree()` — Appelle `buildTree()` puis `_renderNode()` pour chaque élément de `roots`. Affiche en tête un nœud racine dont le label est fourni par `APP.getOntologyRootLabels()`. Si `APP.state.datatype_properties` est vide, injecte le message `"No DatatypeProperty"`.

### REQ-DP-021 — Rendu de la mise en page en deux panneaux (split)

| **Si** | l'onglet `DatatypeProperties` est initialisé, |
|---|---|
| **Alors** | l'interface est divisée en un panneau de navigation hiérarchique à gauche et un panneau de détail à droite, séparés par une barre de redimensionnement, avec les actions de création disponibles dès l'ouverture. |

---

**Code source :** `owl_editor.js` → `DPEditor.renderSplit()` — Génère la structure HTML complète : panneau gauche avec l'arbre et le sous-panneau "Super Properties", séparateur `split-handle`, panneau droit `detail-panel` vide. Les boutons "Child", "Sibling" et "Delete" sont générés avec l'attribut `disabled`.

### REQ-DP-022 — Restauration de la sélection après re-rendu

| **Si** | l'onglet `DatatypeProperties` est re-rendu suite à une modification, |
|---|---|
| **Alors** | la `propriété` précédemment sélectionnée reste active et visible dans l'arbre, préservant le contexte de travail de l'`ontologiste`. |

---

**Code source :** `owl_editor.js` → `DPEditor.restoreSelection()` — Appelle `_initSplitPane()` pour ré-attacher les listeners de redimensionnement, puis sélectionne la racine via `selectTopProp()` si `_selectedId` est `null`, ou la propriété mémorisée via `selectProp(_selectedId)` sinon.

### REQ-DP-023 — Redimensionnement horizontal du panneau gauche

| **Si** | l'`ontologiste` ajuste la largeur du panneau de navigation en faisant glisser le séparateur, |
|---|---|
| **Alors** | le panneau se redimensionne en temps réel entre une largeur minimale et maximale, et le séparateur vertical entre l'arbre et le sous-panneau "Super `Properties`" reste fonctionnel. |

---

**Code source :** `owl_editor.js` → `DPEditor._initSplitPane()` — Écoute les événements `mousedown/mousemove/mouseup` sur `dp-split-handle` et contraint la largeur du panneau gauche entre 160 px et 520 px. Appelle ensuite `_initHResizers('dp-tree-panel')` pour initialiser le redimensionnement vertical interne.

### REQ-DP-024 — Mise à jour du panneau "Super Properties"

| **Si** | aucune `DatatypeProperty` n'est sélectionnée, |
|---|---|
| **Alors** | le panneau inférieur gauche affiche un message invitant l'`ontologiste` à sélectionner une `propriété`. |

| **Si** | une `DatatypeProperty` est sélectionnée, |
|---|---|
| **Alors** | le panneau affiche la chaîne complète de spécialisation depuis la `propriété` sélectionnée jusqu'à `owl:topDatatypeProperty`, avec les super-`propriétés` directes munies d'un bouton de suppression, et un sélecteur permettant d'ajouter une nouvelle super-`propriété` parmi celles disponibles. |

---

**Code source :** `owl_editor.js` → `DPEditor._updateSuperPanel()` — Si `_selectedId` est `null`, injecte le message "— select a property —" dans le panneau. Sinon, calcule la chaîne d'ancêtres via `buildChain()`, génère le HTML avec indentation croissante et un bouton ✕ sur les ancêtres directs, puis construit un `<select>` filtrant les propriétés déjà utilisées comme super-propriétés.

### REQ-DP-025 — Sélection de la racine owl:topDataProperty

| **Si** | l'`ontologiste` sélectionne la racine universelle `owl:topDataProperty` dans l'arbre, |
|---|---|
| **Alors** | aucune `propriété` concrète n'est sélectionnée, le panneau de détail affiche un écran d'accueil avec la possibilité de créer une nouvelle `propriété`, et les boutons d'action sont mis à jour en conséquence. |

---

**Code source :** `owl_editor.js` → `DPEditor.selectTopProp()` — Positionne `_selectedId` à `null` et `_topPropSelected` à `true`, met à jour le surlignage dans l'arbre, injecte dans le panneau droit un écran d'accueil avec la racine et un bouton de création, puis appelle `_updateSuperPanel(null)` et `_updateTreeButtons()`.

### REQ-DP-026 — Sélection d'une DatatypeProperty dans l'arbre

| **Si** | l'`ontologiste` sélectionne une `DatatypeProperty` dans l'arbre, |
|---|---|
| **Alors** | la `propriété` est mise en surbrillance, son formulaire d'édition complet s'affiche dans le panneau de détail, et le panneau "Super `Properties`" ainsi que les boutons d'action sont mis à jour pour refléter le contexte de cette `propriété`. |

---

**Code source :** `owl_editor.js` → `DPEditor.selectProp(id)` — Mémorise `id` dans `_selectedId`, met à jour le surlignage visuel, retrouve l'objet propriété dans `APP.state.datatype_properties`, injecte le formulaire via `renderForm()`, initialise les redimensionneurs verticaux du panneau droit, puis appelle `_updateSuperPanel()` et `_updateTreeButtons()`.

### REQ-DP-027 — Gestion de l'état des boutons de la barre d'outils

| **Si** | la racine `owl:topDataProperty` est sélectionnée, |
|---|---|
| **Alors** | seule l'action de création d'une `propriété` enfant est disponible ; les actions de création sœur et de suppression sont masquées car inapplicables à la racine. |

| **Si** | une `DatatypeProperty` concrète est sélectionnée, |
|---|---|
| **Alors** | les actions de création enfant, création sœur et suppression sont toutes disponibles. |

| **Si** | aucune sélection n'est active, |
|---|---|
| **Alors** | toutes les actions sont désactivées. |

---

**Code source :** `owl_editor.js` → `DPEditor._updateTreeButtons()` — Accède aux éléments boutons par leurs IDs dans le DOM et positionne les attributs `disabled` / `style.display` selon l'état de `_topPropSelected` et `_selectedId`.

### REQ-DP-028 — Expansion / réduction d'un nœud de l'arbre

| **Si** | l'`ontologiste` clique sur l'indicateur d'expansion d'un nœud de l'arbre, |
|---|---|
| **Alors** | le nœud bascule entre déplié (sous-`propriétés` visibles) et replié (sous-`propriétés` masquées), et l'indicateur visuel reflète immédiatement l'état courant. |

---

**Code source :** `owl_editor.js` → `DPEditor.toggleNode(id)` — Bascule la visibilité du conteneur enfant `dp-tcn-${id}`, ajoute ou retire `id` du Set `_expanded`, et fait pivoter la flèche `.tree-toggle` de l'élément correspondant.

### REQ-DP-029 — Affichage du menu contextuel (clic droit)

| **Si** | l'`ontologiste` effectue un clic droit sur un nœud de l'arbre, |
|---|---|
| **Alors** | un menu contextuel apparaît à la position du curseur, proposant les actions applicables au nœud concerné : création d'une `propriété` enfant toujours disponible, création d'une `propriété` sœur et suppression disponibles uniquement sur une `propriété` concrète (pas sur la racine). |

---

**Code source :** `owl_editor.js` → `DPEditor.showContextMenu(event, id)` — Supprime tout menu contextuel existant, sélectionne la propriété ou la racine selon `id`, crée un élément `div.ctx-menu` inséré dans le `body` aux coordonnées du curseur. Ajoute toujours "Add Child Property" ; ajoute "Add Sibling Property" et "Delete" uniquement si `id` est défini. Attache un listener `click` sur `document` pour fermeture automatique.

### REQ-DP-030 — Fermeture du menu contextuel

| **Si** | l'`ontologiste` clique en dehors du menu contextuel ou déclenche une action, |
|---|---|
| **Alors** | le menu contextuel est retiré de l'interface. |

---

**Code source :** `owl_editor.js` → `DPEditor._closeContextMenu()` — Recherche l'élément portant l'ID `dp-ctx-menu` dans le DOM et le supprime s'il existe.

### REQ-DP-031 — Démarrage du drag d'une propriété

| **Si** | l'`ontologiste` commence à glisser une `DatatypeProperty` dans l'arbre pour la repositionner, |
|---|---|
| **Alors** | la `propriété` glissée est visuellement distinguée des autres nœuds, signalant clairement qu'une opération de déplacement est en cours. |

---

**Code source :** `owl_editor.js` → `DPEditor.onDragStart(event, id)` — Mémorise `id` dans `_dragId`, positionne `event.dataTransfer.effectAllowed` à `'move'` et stocke l'id dans `dataTransfer`. Ajoute la classe CSS `'dragging'` à l'élément source après un `setTimeout(0)` pour contourner la contrainte de rendu du navigateur sur l'image de drag.

### REQ-DP-032 — Survol d'une cible lors du drag

| **Si** | l'`ontologiste` survole un nœud cible pendant un glisser-déposer **et** que le dépôt est licite (cible différente de la source et non descendante), |
|---|---|
| **Alors** | le nœud survolé est mis en évidence, indiquant qu'il est une cible valide pour le dépôt. |

---

**Code source :** `owl_editor.js` → `DPEditor.onDragOver(event, targetId)` — Vérifie que `_dragId` est défini, que `targetId !== _dragId`, et que `_isDescendant(targetId, _dragId)` retourne `false`. Si toutes les conditions sont réunies, appelle `event.preventDefault()` et applique la classe CSS `'drag-over'` à l'élément survolé.

### REQ-DP-033 — Rendu du formulaire d'édition d'une DatatypeProperty

| **Si** | l'`ontologiste` sélectionne ou crée une `DatatypeProperty`, |
|---|---|
| **Alors** | un formulaire complet s'affiche dans le panneau de détail, présentant toutes les caractéristiques éditables de la `propriété` : identifiant, IRI complète, annotations (labels, commentaires, autres), `classes` domaine, type de données range, super-`propriétés`, caractéristique fonctionnelle, et usages dans les règles de l'`ontologie`. |

| **Si** | le formulaire correspond à une nouvelle `propriété` en cours de création, |
|---|---|
| **Alors** | un bouton de validation explicite est affiché pour confirmer la création. |

| **Si** | le formulaire correspond à une `propriété` existante, |
|---|---|
| **Alors** | toute modification de champ déclenche une sauvegarde automatique. |

---

**Code source :** `owl_editor.js` → `DPEditor.renderForm(prop, isNew)` — Génère le HTML complet du panneau droit : champ `dp-id` avec valeur sanitisée par `_sanitizeId()`, IRI calculée depuis `APP.state.ontology.id`, tableau d'annotations via `_annoRow()` pour `labels`/`comments`/`other`, listes domaine et range via `_listRows()` avec valeurs implicites `owl:Thing` et `rdfs:Literal`, case à cocher `dp-functional`, section "Where Used" via `_whereUsedFrame()`. En mode création, génère un bouton "✅ Create" ; en mode édition, branche `onchange` sur `autoSave()`.

### REQ-DP-034 — Ajout / suppression d'une ligne d'annotation (label / comment)

| **Si** | l'`ontologiste` ajoute une annotation de type label ou commentaire à une `DatatypeProperty`, |
|---|---|
| **Alors** | une nouvelle ligne de saisie apparaît dans la table des annotations, et la modification est automatiquement sauvegardée si une `propriété` est en cours d'édition. |

| **Si** | l'`ontologiste` supprime une ligne d'annotation, |
|---|---|
| **Alors** | la ligne est retirée du tableau et la modification est automatiquement sauvegardée si une `propriété` est en cours d'édition. |

---

**Code source :** `owl_editor.js` → `DPEditor.addAnnotRow(type, ac)` — Appelle `_makeAnnotRow(type, 'DPEditor', ac)` et insère la ligne retournée dans le `tbody` identifié `dp-annotations-body`, puis appelle `autoSave()` si `_editingId !== null`. `DPEditor.removeAnnotRow(btn)` — Supprime la ligne `<tr>` parente via `btn.closest('tr')?.remove()`, puis appelle `autoSave()` si `_editingId !== null`.

### REQ-DP-035 — Ajout d'une annotation "autre propriété"

| **Si** | l'`ontologiste` sélectionne une annotation de type "autre `propriété`" via le sélecteur dédié, |
|---|---|
| **Alors** | une nouvelle ligne correspondante est ajoutée dans la table des annotations et le sélecteur est automatiquement masqué pour ne pas encombrer l'interface. |

---

**Code source :** `owl_editor.js` → `DPEditor.addOtherAnnotRow(ac, prop)` — Appelle `_makeAnnotRow('other', 'DPEditor', ac, prop)`, insère la ligne dans `dp-annotations-body`, puis force `dp-anno-picker.style.display` à `'none'`.
