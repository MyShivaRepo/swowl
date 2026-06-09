# Exigences — Gestion des arbres hiérarchiques (Hierarchy Management)

> Généré le 2026-06-09 | Dérivé strictement du code source | Aucune hallucination

## Périmètre

Ce document décrit les fonctions de **gestion des arbres** communes aux cinq onglets hiérarchiques de SWOWL :

| Arbre | Éditeur JS | Entités |
|---|---|---|
| Classes | `ClassEditor` | Classes OWL (`owl:Class`) |
| ObjectProperties | `OPEditor` | Propriétés objet (`owl:ObjectProperty`) |
| DatatypeProperties | `DPEditor` | Propriétés de type de données (`owl:DatatypeProperty`) |
| AnnotationProperties | `APEditor` | Propriétés d'annotation (`owl:AnnotationProperty`) |
| Individuals | `IndividualEditor` | Individus OWL (`owl:NamedIndividual`) |

> **Note :** Les Individuals forment une liste plate (non hiérarchique) — les fonctions de structure (expansion, drag-and-drop, cascade) ne s'y appliquent pas ou s'appliquent de façon réduite. Les différences sont précisées dans chaque exigence.

---

## Table des matières

### Sélection
- [REQ-HM-001 — Sélection simple d'un nœud](#req-hm-001--sélection-simple-dun-nœud)
- [REQ-HM-002 — Sélection multiple par Shift+Click (plage)](#req-hm-002--sélection-multiple-par-shiftclick-plage)
- [REQ-HM-003 — Désélection par clic dans l'espace vide](#req-hm-003--désélection-par-clic-dans-lespace-vide)
- [REQ-HM-004 — Persistance de l'ancre de sélection](#req-hm-004--persistance-de-lancre-de-sélection)

### Glisser-Déposer (Drag & Drop)
- [REQ-HM-005 — Déplacement d'un nœud par glisser-déposer (simple)](#req-hm-005--déplacement-dun-nœud-par-glisser-déposer-simple)
- [REQ-HM-006 — Déplacement d'une sélection multiple par glisser-déposer](#req-hm-006--déplacement-dune-sélection-multiple-par-glisser-déposer)
- [REQ-HM-007 — Blocage du dépôt sur soi-même ou sur ses descendants](#req-hm-007--blocage-du-dépôt-sur-soi-même-ou-sur-ses-descendants)
- [REQ-HM-008 — Rétablissement de la racine (dépôt hors nœud)](#req-hm-008--rétablissement-de-la-racine-dépôt-hors-nœud)

### Suppression
- [REQ-HM-009 — Suppression de la sélection courante](#req-hm-009--suppression-de-la-sélection-courante)
- [REQ-HM-010 — Suppression en cascade des descendants](#req-hm-010--suppression-en-cascade-des-descendants)
- [REQ-HM-011 — Confirmation avant suppression](#req-hm-011--confirmation-avant-suppression)

### Menu contextuel (clic droit)
- [REQ-HM-012 — Ouverture du menu contextuel sur un nœud](#req-hm-012--ouverture-du-menu-contextuel-sur-un-nœud)
- [REQ-HM-013 — Action "Add Child" depuis le menu contextuel](#req-hm-013--action-add-child-depuis-le-menu-contextuel)
- [REQ-HM-014 — Action "Add Sibling" depuis le menu contextuel](#req-hm-014--action-add-sibling-depuis-le-menu-contextuel)
- [REQ-HM-015 — Action "Delete" depuis le menu contextuel](#req-hm-015--action-delete-depuis-le-menu-contextuel)
- [REQ-HM-016 — Repositionnement automatique du menu hors-écran](#req-hm-016--repositionnement-automatique-du-menu-hors-écran)
- [REQ-HM-017 — Fermeture du menu contextuel](#req-hm-017--fermeture-du-menu-contextuel)

### Création
- [REQ-HM-018 — Création d'un nœud enfant](#req-hm-018--création-dun-nœud-enfant)
- [REQ-HM-019 — Création d'un nœud sœur](#req-hm-019--création-dun-nœud-sœur)

### Boutons de la barre d'outils
- [REQ-HM-020 — Activation/désactivation des boutons selon la sélection](#req-hm-020--activationdésactivation-des-boutons-selon-la-sélection)

---

## 1. Sélection

### REQ-HM-001 — Sélection simple d'un nœud

| **Si** | l'ontologiste clique sur un nœud de l'arbre sans maintenir Shift, |
|---|---|
| **Alors** | ce nœud devient le seul nœud sélectionné ; tout autre nœud précédemment sélectionné est désélectionné. Le nœud cliqué devient l'ancre pour les prochaines sélections Shift+Click. L'historique de navigation est mis à jour (sauf lors d'une navigation programmatique). |

**Applicabilité :** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓

**Code source :** `owl_editor.js`
- `ClassEditor.selectClass(id, evtOrHist)` — lorsque `isShift` est `false`, réinitialise `_selectedIds = new Set([id])` et `_anchorId = id`
- Même pattern dans `OPEditor.selectOP()`, `DPEditor.selectDP()`, `APEditor.selectAP()`, `IndividualEditor.selectIndividual()`

---

### REQ-HM-002 — Sélection multiple par Shift+Click (plage)

| **Si** | l'ontologiste clique sur un nœud en maintenant la touche Shift, et qu'une ancre de sélection est déjà définie, |
|---|---|
| **Alors** | tous les nœuds visibles dans l'arbre compris entre l'ancre et le nœud cliqué (inclus, dans l'ordre d'affichage DOM) sont ajoutés à la sélection courante. L'ancre reste inchangée. |

| **Si** | aucune ancre n'est définie au moment du Shift+Click, |
|---|---|
| **Alors** | le nœud cliqué est simplement ajouté à la sélection (comportement de repli). |

**Applicabilité :** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓

**Code source :** `owl_editor.js`
```
// Pattern commun (ClassEditor illustré) :
const isShift = evtOrHist?.shiftKey ?? false;
if (isShift && this._anchorId) {
    const items = [...document.querySelectorAll('#class-tree .tree-item[data-id]')];
    const ids   = items.map(el => el.dataset.id);
    const from  = ids.indexOf(this._anchorId);
    const to    = ids.indexOf(id);
    const [lo, hi] = from < to ? [from, to] : [to, from];
    this._selectedIds = new Set(ids.slice(lo, hi + 1));
}
```

---

### REQ-HM-003 — Désélection par clic dans l'espace vide

| **Si** | l'ontologiste clique dans l'espace vide du panneau d'un arbre (zone sans nœud), en dehors de tout item, menu contextuel ou bouton, |
|---|---|
| **Alors** | la sélection courante est entièrement effacée (`_selectedIds` vide, `_anchorId` à `null`), et la mise en évidence visuelle (`selected`) est retirée de tous les nœuds. |

**Applicabilité :** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓

**Code source :** `owl_editor.js` → `_installDeselectListener()` (présent dans chaque éditeur)
- Listener `mousedown` installé en phase de capture sur `document`
- Retour anticipé (`return`) si le clic touche `.tree-item[data-id]`, `.tree-root-item`, `.tree-toggle`, le menu contextuel (`#*-ctx-menu`), ou un bouton (`.btn-icon`, `.btn-sm`)
- Dans tous les autres cas : vide `_selectedIds`, remet `_anchorId = null`, retire la classe CSS `selected` de tous les nœuds

---

### REQ-HM-004 — Persistance de l'ancre de sélection

| **Si** | l'ontologiste effectue une sélection simple ou une sélection Shift+Click, |
|---|---|
| **Alors** | l'identifiant du premier nœud sélectionné (ou du nœud ciblé par le clic simple) est mémorisé en tant qu'ancre (`_anchorId`). Cet ancre sert de point de départ pour toute sélection de plage ultérieure par Shift+Click. L'ancre est réinitialisée lors d'une désélection ou d'un clic simple. |

**Applicabilité :** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓

**Code source :** `owl_editor.js` — champ `_anchorId` (ou `_anchorIndId` pour `IndividualEditor`) dans chaque éditeur.

---

## 2. Glisser-Déposer (Drag & Drop)

> **Note Individuals :** La liste des Individuals est plate — le drag-and-drop n'y est pas implémenté.

### REQ-HM-005 — Déplacement d'un nœud par glisser-déposer (simple)

| **Si** | l'ontologiste commence à glisser un nœud qui n'appartient pas à la sélection courante, |
|---|---|
| **Alors** | la sélection est réinitialisée à ce seul nœud, et le déplacement ne concerne que lui. À la fin du glisser, le nœud est rattaché au nœud cible comme enfant (relation `subClassOf` / `subPropertyOf`). |

**Applicabilité :** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✗

**Code source :** `owl_editor.js` → `ClassEditor.onDragStart(event, id)` / `OPEditor.onDragStart()` / `DPEditor.onDragStart()` / `APEditor.onDragStart()`

---

### REQ-HM-006 — Déplacement d'une sélection multiple par glisser-déposer

| **Si** | l'ontologiste commence à glisser un nœud qui fait partie d'une sélection multiple (`_selectedIds.size > 1`), |
|---|---|
| **Alors** | tous les nœuds de la sélection sont déplacés en une seule opération vers le nœud cible. Chaque nœud de la sélection reçoit une classe CSS `dragging` pendant le glisser. À la fin du drop, l'API est appelée en séquence pour chacun des nœuds déplacés. |

**Applicabilité :** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✗

**Code source :** `owl_editor.js` → `onDrop(event, targetId)`
```javascript
const dragIds = this._selectedIds.size > 0 ? [...this._selectedIds] : [this._dragId];
for (const draggedId of dragIds) { await API.updateClass(draggedId, ...); }
```

---

### REQ-HM-007 — Blocage du dépôt sur soi-même ou sur ses descendants

| **Si** | l'ontologiste survole un nœud cible pendant un glisser, et que ce nœud fait partie de la sélection en cours de glisser **ou** est un descendant de l'un des nœuds glissés, |
|---|---|
| **Alors** | le dépôt est interdit sur ce nœud cible (pas d'effet visuel `dragover`, drop ignoré). Ceci évite de créer des cycles dans la hiérarchie. |

**Applicabilité :** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✗

**Code source :** `owl_editor.js` → `onDragOver(event, targetId)`
```javascript
if (this._selectedIds.has(targetId)) return;
if ([...this._selectedIds].some(sid => this._isDescendant(targetId, sid))) return;
```

---

### REQ-HM-008 — Rétablissement de la racine (dépôt hors nœud)

| **Si** | l'ontologiste dépose un ou plusieurs nœuds sur la zone racine de l'arbre (hors de tout nœud — `targetId = null`), |
|---|---|
| **Alors** | les nœuds déplacés sont rattachés à la racine de l'ontologie (suppression de toute relation `subClassOf` / `subPropertyOf`), devenant ainsi des nœuds de premier niveau. |

**Applicabilité :** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✗

**Code source :** `owl_editor.js` → `onDrop(event, null)` — `targetId` vaut `null` lorsque le drop est déclenché sur le conteneur racine (`ondrop` du `.tree-root-item`).

---

## 3. Suppression

### REQ-HM-009 — Suppression de la sélection courante

| **Si** | l'ontologiste clique sur le bouton "Delete" de la barre d'outils ou choisit "Delete" dans le menu contextuel, |
|---|---|
| **Alors** | tous les nœuds de la sélection courante (`_selectedIds`) sont supprimés. Si la sélection est vide, l'action est sans effet. |

**Applicabilité :** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓

**Code source :** `owl_editor.js` → `ClassEditor.deleteSelected()` / `OPEditor.deleteSelected()` / `DPEditor.deleteSelected()` / `APEditor.deleteSelected()` / `IndividualEditor.deleteSelected()`

---

### REQ-HM-010 — Suppression en cascade des descendants

| **Si** | l'ontologiste supprime un nœud qui possède des descendants (sous-classes ou sous-propriétés), |
|---|---|
| **Alors** | tous les descendants directs et transitifs sont également supprimés. La liste complète des identifiants supprimés (nœud parent + descendants) est retournée par le backend (`{"deleted": [...]}`) et utilisée pour mettre à jour l'état côté client. |

**Applicabilité :** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✗ *(liste plate)*

**Code source :**
- **Backend** `main.py` → `_collect_prop_descendants(prop_list, prop_id)` — remonte récursivement la hiérarchie `subPropertyOf` par BFS, collecte tous les descendants dans un `set`. Idem pour les classes via `subClassOf`.
- **Frontend** → la réponse `{"deleted": [...]}` est utilisée pour nettoyer `APP.state` en une seule passe.

---

### REQ-HM-011 — Confirmation avant suppression

| **Si** | l'ontologiste demande la suppression d'un ou plusieurs nœuds, |
|---|---|
| **Alors** | une boîte de dialogue de confirmation est affichée avant toute suppression effective. Elle indique le nombre de nœuds à supprimer et, si des descendants sont concernés, leur nombre. La suppression n'est exécutée qu'après confirmation explicite de l'ontologiste. |

**Applicabilité :** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓

**Code source :** `owl_editor.js` → dans chaque `deleteSelected()`, appel à `APP.confirm(message)` avant l'appel API. Exemples de messages :
- *Sélection multiple :* `"Delete <strong>N</strong> classes?"` / `"Delete <strong>N</strong> object properties?"`
- *Suppression avec descendants :* `"Delete <strong>id</strong> and its N child class(es)?"`

---

## 4. Menu contextuel (clic droit)

### REQ-HM-012 — Ouverture du menu contextuel sur un nœud

| **Si** | l'ontologiste effectue un clic droit (`contextmenu`) sur un nœud de l'arbre, |
|---|---|
| **Alors** | un menu contextuel (`ctx-menu`) apparaît à la position du curseur. Si le nœud cliqué n'appartient pas à la sélection courante, la sélection est réinitialisée à ce seul nœud avant d'afficher le menu. |

**Applicabilité :** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓

**Code source :** `owl_editor.js` → `showContextMenu(event, id)` dans chaque éditeur — crée dynamiquement un `<div class="ctx-menu">` inséré dans `document.body`.

---

### REQ-HM-013 — Action "Add Child" depuis le menu contextuel

| **Si** | le menu contextuel est ouvert sur un nœud ou sur la zone racine, |
|---|---|
| **Alors** | l'option "Add Child Class / Property" est disponible. Elle crée un nouveau nœud enfant du nœud sélectionné (ou un nœud racine si aucun nœud n'est sélectionné). |

**Applicabilité :** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✗ *(liste plate — création via bouton dédié uniquement)*

**Code source :** `owl_editor.js` — dans le HTML du menu contextuel de chaque éditeur :
```html
<div class="ctx-item" onclick="ClassEditor._closeContextMenu();ClassEditor.createChild()">
    ＋ Add Child Class</div>
```

---

### REQ-HM-014 — Action "Add Sibling" depuis le menu contextuel

| **Si** | le menu contextuel est ouvert sur un nœud (non-racine), |
|---|---|
| **Alors** | l'option "Add Sibling Class / Property" est disponible. Elle crée un nouveau nœud au même niveau hiérarchique que le nœud sélectionné. |

**Applicabilité :** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✗

**Code source :** `owl_editor.js` — dans le HTML du menu contextuel de chaque éditeur :
```html
<div class="ctx-item" onclick="ClassEditor._closeContextMenu();ClassEditor.createSibling()">
    ＋ Add Sibling Class</div>
```

---

### REQ-HM-015 — Action "Delete" depuis le menu contextuel

| **Si** | le menu contextuel est ouvert sur un ou plusieurs nœuds sélectionnés, |
|---|---|
| **Alors** | l'option "Delete" est disponible, affichée en rouge (`ctx-danger`). Son libellé indique le nombre de nœuds à supprimer si la sélection est multiple (ex. "Delete Classes (3)"). Le déclenchement de cette action appelle `deleteSelected()` avec confirmation. |

**Applicabilité :** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓

**Code source :** `owl_editor.js` — libellé dynamique dans `showContextMenu()` :
```javascript
const deleteLabel = n > 1 ? `Delete Classes <strong>(${n})</strong>` : `Delete Class`;
// ...
<div class="ctx-item ctx-danger" onclick="ClassEditor._closeContextMenu();ClassEditor.deleteSelected()">
    ${deleteLabel}</div>
```

---

### REQ-HM-016 — Repositionnement automatique du menu hors-écran

| **Si** | le menu contextuel généré déborde du bord droit ou du bord bas de la fenêtre du navigateur, |
|---|---|
| **Alors** | sa position est automatiquement ajustée pour rester entièrement visible à l'intérieur de la fenêtre, en décalant respectivement `left` vers la gauche ou `top` vers le haut. |

**Applicabilité :** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓

**Code source :** `owl_editor.js` → dans chaque `showContextMenu()`, après insertion dans le DOM :
```javascript
requestAnimationFrame(() => {
    const r = menu.getBoundingClientRect();
    if (r.right  > window.innerWidth)  menu.style.left = (event.clientX - r.width)  + 'px';
    if (r.bottom > window.innerHeight) menu.style.top  = (event.clientY - r.height) + 'px';
});
```

---

### REQ-HM-017 — Fermeture du menu contextuel

| **Si** | l'ontologiste clique en dehors du menu contextuel ouvert, |
|---|---|
| **Alors** | le menu est immédiatement retiré du DOM. Le menu est également fermé automatiquement lorsqu'une action du menu est exécutée ou lorsqu'un nouveau menu contextuel est demandé. |

**Applicabilité :** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓

**Code source :** `owl_editor.js` → `_closeContextMenu()` dans chaque éditeur — supprime l'élément `#*-ctx-menu` du DOM. Un listener `click` sur `document` (en mode capture) est installé au moment de l'ouverture du menu pour déclencher la fermeture sur clic extérieur.

---

## 5. Création de nœuds

### REQ-HM-018 — Création d'un nœud enfant

| **Si** | l'ontologiste clique sur le bouton "Add Child" (barre d'outils ou menu contextuel), |
|---|---|
| **Alors** | un nouveau nœud est créé comme enfant direct du nœud sélectionné (relation `subClassOf` / `subPropertyOf` pointant vers le parent). Si aucun nœud n'est sélectionné ou si la racine `owl:Thing` est sélectionnée, le nœud est créé sans parent (nœud de premier niveau). Le nouveau nœud est immédiatement sélectionné et mis en évidence dans l'arbre. |

**Applicabilité :** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✗ *(création via bouton "New Individual")*

**Code source :** `owl_editor.js` → `ClassEditor.createChild()` / `OPEditor.createChild()` / `DPEditor.createChild()` / `APEditor.createChild()`

---

### REQ-HM-019 — Création d'un nœud sœur

| **Si** | l'ontologiste clique sur le bouton "Add Sibling" (barre d'outils ou menu contextuel) et qu'un nœud est sélectionné, |
|---|---|
| **Alors** | un nouveau nœud est créé au même niveau hiérarchique que le nœud sélectionné, héritant du ou des mêmes parents (`subClassOf` / `subPropertyOf`). Le nouveau nœud est immédiatement sélectionné. |

**Applicabilité :** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✗

**Code source :** `owl_editor.js` → `ClassEditor.createSibling()` / `OPEditor.createSibling()` / `DPEditor.createSibling()` / `APEditor.createSibling()`

---

## 6. Boutons de la barre d'outils

### REQ-HM-020 — Activation/désactivation des boutons selon la sélection

| **Si** | la sélection dans l'arbre change (sélection simple, sélection multiple, ou désélection), |
|---|---|
| **Alors** | les boutons de la barre d'outils sont mis à jour en conséquence : |

| État de la sélection | Bouton "Add Child" | Bouton "Add Sibling" | Bouton "Delete" |
|---|---|---|---|
| Aucun nœud sélectionné | Activé (crée à la racine) | Désactivé | Masqué (`visibility:hidden`) |
| 1 nœud sélectionné | Activé | Activé | Activé et visible |
| Plusieurs nœuds sélectionnés | Désactivé | Désactivé | Activé et visible |

**Applicabilité :** Classes ✓ · OPs ✓ · DPs ✓ · APs ✓ · Individuals ✓ *(avec adaptation — pas de boutons Child/Sibling)*

**Code source :** `owl_editor.js` → `_updateButtons()` (ou `_setDelBtn()` pour `IndividualEditor`) dans chaque éditeur, appelé après chaque changement de sélection.

---

## Annexe — Récapitulatif d'applicabilité

| Fonction | Classes | OPs | DPs | APs | Individuals |
|---|:---:|:---:|:---:|:---:|:---:|
| Sélection simple | ✓ | ✓ | ✓ | ✓ | ✓ |
| Sélection multiple Shift+Click | ✓ | ✓ | ✓ | ✓ | ✓ |
| Désélection espace vide | ✓ | ✓ | ✓ | ✓ | ✓ |
| Ancre de sélection | ✓ | ✓ | ✓ | ✓ | ✓ |
| Drag & drop simple | ✓ | ✓ | ✓ | ✓ | — |
| Drag & drop multi-sélection | ✓ | ✓ | ✓ | ✓ | — |
| Blocage cycle hiérarchique | ✓ | ✓ | ✓ | ✓ | — |
| Dépôt à la racine | ✓ | ✓ | ✓ | ✓ | — |
| Suppression de la sélection | ✓ | ✓ | ✓ | ✓ | ✓ |
| Suppression en cascade | ✓ | ✓ | ✓ | ✓ | — |
| Confirmation avant suppression | ✓ | ✓ | ✓ | ✓ | ✓ |
| Menu contextuel (clic droit) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Ctx : Add Child | ✓ | ✓ | ✓ | ✓ | — |
| Ctx : Add Sibling | ✓ | ✓ | ✓ | ✓ | — |
| Ctx : Delete | ✓ | ✓ | ✓ | ✓ | ✓ |
| Repositionnement menu hors-écran | ✓ | ✓ | ✓ | ✓ | ✓ |
| Création nœud enfant | ✓ | ✓ | ✓ | ✓ | — |
| Création nœud sœur | ✓ | ✓ | ✓ | ✓ | — |
| Boutons barre d'outils adaptatifs | ✓ | ✓ | ✓ | ✓ | ✓ |
