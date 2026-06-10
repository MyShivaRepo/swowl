# Exigences — Import d'ontologies

> Généré le 2026-06-10 | Dérivé strictement du code source | Aucune hallucination

## Table des matières

### Fond
- [REQ-IMP-001 — Déclaration d'imports dans l'ontologie courante](#req-imp-001--déclaration-dimports-dans-lontologie-courante)
- [REQ-IMP-002 — Fusion des entités importées dans l'état de l'application](#req-imp-002--fusion-des-entités-importées-dans-létat-de-lapplication)
- [REQ-IMP-003 — Héritage des règles de nommage (display_rules)](#req-imp-003--héritage-des-règles-de-nommage-display_rules)
- [REQ-IMP-004 — Persistance : les entités importées ne sont pas sauvegardées localement](#req-imp-004--persistance--les-entités-importées-ne-sont-pas-sauvegardées-localement)
- [REQ-IMP-005 — Lecture seule : modification et suppression impossibles](#req-imp-005--lecture-seule--modification-et-suppression-impossibles)

### Forme
- [REQ-IMP-006 — Style visuel atténué dans les listes et arbres](#req-imp-006--style-visuel-atténué-dans-les-listes-et-arbres)
- [REQ-IMP-007 — Nœuds racines des arbres : même style visuel que les entités importées](#req-imp-007--nœuds-racines-des-arbres--même-style-visuel-que-les-entités-importées)
- [REQ-IMP-008 — Panneau détail : bannière verrouillée et formulaire en lecture seule](#req-imp-008--panneau-détail--bannière-verrouillée-et-formulaire-en-lecture-seule)
- [REQ-IMP-009 — Références aux entités importées dans les panneaux de détail locaux](#req-imp-009--références-aux-entités-importées-dans-les-panneaux-de-détail-locaux)
- [REQ-IMP-010 — Menu contextuel des entités importées](#req-imp-010--menu-contextuel-des-entités-importées)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles de chargement, priorités, comportements algorithmiques, persistance.


### REQ-IMP-001 — Déclaration d'imports dans l'ontologie courante

| **Si** | l'ontologie courante déclare un ou plusieurs imports via son champ `imports`, |
|---|---|
| **Alors** | chaque import est identifié par un **préfixe** (ex. `plm`) et un **nom d'ontologie** (ex. `RoHS_Ontology`). Ces imports sont listés dans l'onglet **Ontologies** en lecture seule. |

**Code source :** `backend/main.py` → `GET /api/imported-entities` — lit le champ `imports` de l'ontologie courante, charge chaque ontologie référencée et en extrait les entités. `frontend/js/app.js` → `loadState()` — appelle `API.getImportedEntities()` après le chargement de l'ontologie courante.

---

### REQ-IMP-002 — Fusion des entités importées dans l'état de l'application

| **Si** | l'ontologie courante déclare des imports, |
|---|---|
| **Alors** | au chargement, le système fusionne dans `APP.state` les 7 types d'entités issus des ontologies importées : `classes`, `object_properties`, `datatype_properties`, `annotation_properties`, `individuals`, `swrl_rules` et `queries`. Chaque entité importée est taguée `_imported: true`, `_importPrefix` (préfixe) et `_importName` (nom de l'ontologie source). |

**Code source :** `backend/main.py` → `get_imported_entities()` — itère sur les 7 types d'entités et ajoute `{ "_imported": True, "_importPrefix": prefix, "_importName": name }` à chaque entité. `frontend/js/app.js` → `loadState()` — fusionne chaque collection : `this.state.classes = [...this.state.classes, ...(imp.classes || [])]` (idem pour les 6 autres types).

---

### REQ-IMP-003 — Héritage des règles de nommage (display_rules)

| **Si** | une ontologie importée définit des règles de nommage (`display_rules`), |
|---|---|
| **Alors** | ces règles sont copiées dans l'état de l'ontologie courante afin d'afficher correctement les noms des `Individual` de l'ontologie importée. En cas de conflit sur la même classe, les règles **locales ont la priorité** sur les règles importées. |

**Code source :** `backend/main.py` → `get_imported_entities()` — construit `result["display_rules"]` par fusion (première occurrence gagne). `frontend/js/app.js` → `loadState()` — fusionne avec `{ single: { ...(impDr.single), ...(local.single) }, multi: { ...(impDr.multi), ...(local.multi) } }` : les clés locales écrasent les importées.

---

### REQ-IMP-004 — Persistance : les entités importées ne sont pas sauvegardées localement

| **Si** | une opération de sauvegarde, d'annulation (undo) ou de rétablissement (redo) est effectuée, |
|---|---|
| **Alors** | les entités importées ne sont **pas stockées** dans le fichier de l'ontologie courante. Elles sont rechargées dynamiquement depuis le backend à chaque ouverture. Les snapshots undo/redo ne contiennent que les entités locales. |

**Code source :** `backend/main.py` → `PUT /api/ontology` — sauvegarde uniquement les données de l'ontologie courante, sans les entités importées. `frontend/js/app.js` → `UndoRedo._snap()` — sauvegarde uniquement les collections locales ; les entités importées sont rechargées via `loadState()` à chaque `APP.refresh()`.

---

### REQ-IMP-005 — Lecture seule : modification et suppression impossibles

| **Si** | l'utilisateur tente de modifier ou de supprimer une entité importée (formulaire, bouton de suppression ou menu contextuel), |
|---|---|
| **Alors** | l'action est bloquée : les champs du formulaire sont désactivés, le bouton de suppression est masqué dans la liste, et toute tentative programmatique de suppression affiche un message d'erreur. |

**Code source :** `owl_editor.js` → `_applyReadOnly(detail)` — désactive tous les `input, select, textarea, button` du panneau de détail. `SWRLEditor.delete()` et `SparqlEditor.deleteQuery()` — vérifient `entity._imported` et appellent `UI.error()` si vrai. `renderList()` de chaque éditeur — masque le bouton de suppression si `isImported`.

---

## 2. Forme — Règles d'interface et de présentation

> Exigences portant sur l'affichage, les icônes, l'ordre visuel et les interactions IHM.

---

### REQ-IMP-006 — Style visuel atténué dans les listes et arbres

| **Si** | une entité importée apparaît dans la liste ou l'arbre d'un onglet, |
|---|---|
| **Alors** | elle est affichée avec : (1) une **opacité atténuée** (`opacity: 0.5`), (2) un texte en **italique**, (3) son identifiant précédé du **préfixe d'import** (ex. `plm:Article`), (4) le **bouton de suppression masqué**. |

**Code source :** `style.css` → `.imported-entity { font-style: italic; opacity: 0.5; }` — règle CSS appliquée à tous les items importés. `owl_editor.js` → `ClassEditor._renderNode()`, `OPEditor._renderNode()`, `DPEditor._renderNode()`, `APEditor._renderUserNode()` — appliquent la classe CSS `imported-entity` et le préfixe si `entity._imported === true`. `swrl_editor.js` → `SWRLEditor.renderList()` et `sparql_editor.js` → `SparqlEditor.renderList()` — même logique pour les onglets SWRL Rules et Queries.

---

### REQ-IMP-007 — Nœuds racines des arbres : même style visuel que les entités importées

| **Si** | l'arbre des `Classes`, `ObjectProperties` ou `DatatypeProperties` est affiché, |
|---|---|
| **Alors** | le nœud racine (`owl:Thing`, `owl:topObjectProperty`, `owl:topDataProperty`) adopte le **même style visuel** que les entités importées : même opacité (`0.5`), même couleur de texte (`var(--text)`) et même couleur de dot que les items enfants réguliers. |

**Code source :** `style.css` → `.tree-root-item { color: var(--text); opacity: 0.5; }` — aligne la couleur et l'opacité du nœud racine sur les items enfants. `.tree-thing-dot { background: #b87333 }` — identique à `.cls-dot`. `.tree-op-top-dot { background: var(--accent) }` — identique à `.op-prop-dot`. `.tree-dp-top-dot { background: var(--accent2) }` — identique à `.dp-prop-dot`.

---

### REQ-IMP-008 — Panneau détail : bannière verrouillée et formulaire en lecture seule

| **Si** | l'utilisateur sélectionne une entité importée dans un onglet, |
|---|---|
| **Alors** | le panneau de détail affiche : (1) une **bannière 🔒** en haut indiquant le nom de l'ontologie source (ex. `🔒 Imported from RoHS_Ontology (plm:)`), (2) le contenu du formulaire avec une **opacité atténuée** (`0.55`), (3) tous les champs et boutons **désactivés**. |

**Code source :** `owl_editor.js` → `_importedBannerHtml(entity)` — génère le HTML de la bannière 🔒. `_applyImportedView(detail, entity, html)` — si `entity._imported`, injecte la bannière + le HTML, ajoute la classe CSS `is-imported-view` et appelle `_applyReadOnly(detail)`. `style.css` → `.is-imported-view > *:not(.imported-detail-banner) { opacity: 0.55; }` — atténue le contenu du formulaire sans affecter la bannière.

---

### REQ-IMP-009 — Références aux entités importées dans les panneaux de détail locaux

| **Si** | un panneau de détail d'une entité **locale** affiche des références vers des entités importées (valeur de propriété d'objet, membre de classe, propriété inférée, règle SWRL référencée), |
|---|---|
| **Alors** | chaque référence pointant vers une entité importée est affichée avec le style atténué (`opacity: 0.5`, italique). Ceci s'applique aux assertions de propriétés d'objet sur les `Individual`, aux propriétés inférées, et aux sections **"Where Used In Rules"** des onglets `Classes`, `ObjectProperties`, `DatatypeProperties` et `Individuals`. |

**Code source :** `owl_editor.js` → `_markImportedRefs(container)` — construit un `Set` de tous les IDs importés et ajoute la classe CSS `imported-entity` à tout `[data-id]` correspondant dans le panneau. Les assertions OP sur `Individual` incluent `data-id="${target}"` et `_renderInferredPanel()` ajoute `data-id="${value}"` sur les lignes de type `op` pour permettre la détection. `_whereUsedFrame()` — ajoute directement la classe `imported-entity` et le préfixe sur les items de règles SWRL importées.

---

### REQ-IMP-010 — Menu contextuel des entités importées

| **Si** | l'utilisateur ouvre le menu contextuel (clic droit) sur une entité importée, |
|---|---|
| **Alors** | le menu affiche une icône 🔒 suivie du nom de l'ontologie source (ex. `🔒 Imported from RoHS_Ontology (plm:)`), sans proposer d'actions de modification ni de suppression. |

**Code source :** `owl_editor.js` → `ClassEditor.showContextMenu()`, `OPEditor.showContextMenu()`, `DPEditor.showContextMenu()` — vérifient `isImported` et remplacent les items d'action par `<div>🔒 Imported from ${entity._importName}</div>`. `swrl_editor.js` → `SWRLEditor.showContextMenu()` et `sparql_editor.js` → `SparqlEditor.showContextMenu()` — même logique sur `rule._imported` / `query._imported`.

---