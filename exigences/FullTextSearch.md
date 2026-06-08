# Exigences — Full Text Search

> Généré le 2026-06-08 | Dérivé strictement du code source | Aucune hallucination

## Table des matières

### Fond
- [REQ-FTS-001 — Recherche dans les `rdfs:label` (partie A.1)](#req-fts-001--recherche-dans-les-rdfslabel-partie-a1)
- [REQ-FTS-002 — Recherche dans les Display Names des `Individual` (partie A.2)](#req-fts-002--recherche-dans-les-display-names-des-individual-partie-a2)
- [REQ-FTS-003 — Recherche dans les labels des SWRL Rules (partie A.3)](#req-fts-003--recherche-dans-les-labels-des-swrl-rules-partie-a3)
- [REQ-FTS-004 — Recherche dans les labels des SPARQL VizQ (partie A.4)](#req-fts-004--recherche-dans-les-labels-des-sparql-vizq-partie-a4)
- [REQ-FTS-005 — Recherche dans les IDs système — `Class`, `ObjectProperty`, `DatatypeProperty`, `AnnotationProperty`, `Individual` (partie B)](#req-fts-005--recherche-dans-les-ids-système--class-objectproperty-datatypeproperty-annotationproperty-individual-partie-b)
- [REQ-FTS-006 — Recherche dans les IDs système — SWRL Rule, SPARQL VizQ (partie B)](#req-fts-006--recherche-dans-les-ids-système--swrl-rule-sparql-vizq-partie-b)
- [REQ-FTS-007 — Coexistence des résultats Partie A et Partie B](#req-fts-007--coexistence-des-résultats-partie-a-et-partie-b)
- [REQ-FTS-008 — Navigation vers l'entité depuis un résultat](#req-fts-008--navigation-vers-lentité-depuis-un-résultat)

### Forme
- [REQ-FTS-009 — Ordre et regroupement des résultats](#req-fts-009--ordre-et-regroupement-des-résultats)
- [REQ-FTS-010 — Rendu des résultats de la Partie A (User Labels)](#req-fts-010--rendu-des-résultats-de-la-partie-a-user-labels)
- [REQ-FTS-011 — Rendu des résultats de la Partie B (System IDs)](#req-fts-011--rendu-des-résultats-de-la-partie-b-system-ids)
- [REQ-FTS-012 — Navigation clavier dans les résultats](#req-fts-012--navigation-clavier-dans-les-résultats)
- [REQ-FTS-013 — Effacement de la recherche](#req-fts-013--effacement-de-la-recherche)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles de matching, priorités, comportements algorithmiques.

---

### REQ-FTS-001 — Recherche dans les `rdfs:label` (partie A.1)

| **Si** | l'utilisateur saisit une chaîne de caractères dans le champ de recherche, |
|---|---|
| **Alors** | le système parcourt l'ensemble des `rdfs:label` (toutes langues confondues) de toutes les entités de l'`ontologie` (`Class`, `ObjectProperty`, `DatatypeProperty`, `AnnotationProperty`, `Individual`) et retient toute valeur de label contenant cette chaîne (insensible à la casse). |

**Code source :** `app.js` → `GlobalSearch._search()` — Construit la liste fusionnée de toutes les entités (`classes`, `object_properties`, `datatype_properties`, `annotation_properties`, `individuals`) et pour chacune filtre `entity.annotations.labels[].value` avec `.toLowerCase().includes(lq)`. Chaque correspondance produit un item `{ section: 'rdfs-labels', id: entity.id, label: l.value, kind: entitySection }`.

---

### REQ-FTS-002 — Recherche dans les Display Names des `Individual` (partie A.2)

| **Si** | l'utilisateur saisit une chaîne de caractères dans le champ de recherche, |
|---|---|
| **Alors** | le système examine le Display Name de chaque `Individual` (nom calculé à partir des annotations prioritaires) et retient tout `Individual` dont le Display Name contient cette chaîne, à condition que ce Display Name soit différent de l'ID système de l'`Individual` (pour éviter les doublons avec la Partie B). |

**Code source :** `app.js` → `GlobalSearch._search()` — Pour chaque `Individual`, appelle `IndividualEditor._resolveDisplayLabel(i, null)` pour obtenir le Display Name ; si `dn && dn !== i.id && dn.toLowerCase().includes(lq)`, produit un item `{ section: 'individual-names', id: i.id, label: dn }`.

---

### REQ-FTS-003 — Recherche dans les labels des SWRL Rules (partie A.3)

| **Si** | l'utilisateur saisit une chaîne de caractères dans le champ de recherche, |
|---|---|
| **Alors** | le système examine le label de chaque SWRL Rule et retient toute règle dont le label (différent de son ID) contient cette chaîne. |

**Code source :** `app.js` → `GlobalSearch._search()` — Pour chaque règle de `APP.state.swrl_rules`, vérifie `rule.label && rule.label !== rule.id && rule.label.toLowerCase().includes(lq)` ; produit un item `{ section: 'swrl-labels', id: rule.id, label: rule.label }`.

---

### REQ-FTS-004 — Recherche dans les labels des SPARQL VizQ (partie A.4)

| **Si** | l'utilisateur saisit une chaîne de caractères dans le champ de recherche, |
|---|---|
| **Alors** | le système examine le label de chaque requête SPARQL VizQ sauvegardée et retient toute requête dont le label (différent de son ID) contient cette chaîne. |

**Code source :** `app.js` → `GlobalSearch._search()` — Charge les requêtes via `SparqlEditor._loadAll()` (localStorage) ; pour chaque requête, vérifie `query.label && query.label !== query.id && query.label.toLowerCase().includes(lq)` ; produit un item `{ section: 'sparql-labels', id: query.id, label: query.label }`.

---

### REQ-FTS-005 — Recherche dans les IDs système — `Class`, `ObjectProperty`, `DatatypeProperty`, `AnnotationProperty`, `Individual` (partie B)

| **Si** | l'utilisateur saisit une chaîne de caractères dans le champ de recherche, |
|---|---|
| **Alors** | le système parcourt les IDs de toutes les `Class`, `ObjectProperty`, `DatatypeProperty`, `AnnotationProperty` et `Individual` et retient toute entité dont l'ID contient cette chaîne (insensible à la casse). |

**Code source :** `app.js` → `GlobalSearch._search()` — Pour chaque collection (`classes`, `object_properties`, `datatype_properties`, `annotation_properties`, `individuals`), teste `entity.id.toLowerCase().includes(lq)` ; si vrai, produit un item `{ section: '<section>', id: entity.id, label: entity.id }`.

---

### REQ-FTS-006 — Recherche dans les IDs système — SWRL Rule, SPARQL VizQ (partie B)

| **Si** | l'utilisateur saisit une chaîne de caractères dans le champ de recherche, |
|---|---|
| **Alors** | le système parcourt les IDs de toutes les SWRL Rules et requêtes SPARQL VizQ et retient toute entité dont l'ID contient cette chaîne (insensible à la casse). |

**Code source :** `app.js` → `GlobalSearch._search()` — Pour `swrl_rules`, teste `entity.id.toLowerCase().includes(lq)`. Pour les SPARQL VizQ, itère sur `SparqlEditor._loadAll()` et teste `query.id.toLowerCase().includes(lq)` ; chaque correspondance produit un item `{ section: 'swrl-rules' | 'sparql-vizq', id: entity.id, label: entity.id }`.

---

### REQ-FTS-007 — Coexistence des résultats Partie A et Partie B

| **Si** | une entité possède à la fois un ID qui contient la chaîne recherchée ET un `rdfs:label` (ou Display Name) qui contient cette même chaîne, |
|---|---|
| **Alors** | cette entité apparaît dans les **deux** sections : une fois en Partie A (avec le label correspondant) et une fois en Partie B (avec son ID), permettant à l'utilisateur de voir à la fois pourquoi le label matche et d'accéder directement à l'entité par son ID. |

**Code source :** `app.js` → `GlobalSearch._search()` — Les boucles Partie A et Partie B sont indépendantes et s'exécutent toutes les deux sans condition d'exclusion mutuelle. Un même `entity.id` peut donc apparaître dans `results` sous deux sections différentes.

---

### REQ-FTS-008 — Navigation vers l'entité depuis un résultat

| **Si** | l'utilisateur clique sur un résultat de recherche (ou appuie sur Entrée après l'avoir sélectionné au clavier), |
|---|---|
| **Alors** | le système navigue vers la section et l'entité correspondantes : les résultats Partie A redirigent vers l'entité parente (ex. un résultat `rdfs:label` navigue vers la `Class` ou `ObjectProperty` qui porte ce label) ; les résultats SPARQL VizQ activent l'onglet VizQ et sélectionnent la requête correspondante. |

**Code source :** `app.js` → `GlobalSearch._navigate()` — Applique la table de mapping `{ 'rdfs-labels': item.kind, 'swrl-labels': 'swrl-rules', 'sparql-labels': 'sparql-vizq', 'individual-names': 'individuals' }` pour déterminer la section cible ; pour `sparql-vizq`, positionne `APP._queriesTab = 'vizq'`, appelle `SparqlEditor.selectQuery(item.id)` puis `APP.renderSection('queries')` ; pour tous les autres cas, appelle `APP.navigateTo(navSection, item.id)`.

---

## 2. Forme — Règles d'interface et de présentation

> Exigences portant sur l'affichage, les icônes, l'ordre visuel et les interactions IHM.

---

### REQ-FTS-009 — Ordre et regroupement des résultats

| **Si** | la recherche produit des résultats, |
|---|---|
| **Alors** | les résultats sont regroupés en sections ordonnées : **d'abord la Partie A** (labels utilisateur) dans l'ordre `rdfs:label` → `Individual Display Name` → `SWRL Labels` → `SPARQL Labels`, **puis la Partie B** (IDs système) dans l'ordre `Classes` → `Object Properties` → `Datatype Properties` → `Annotation Properties` → `Individuals` → `SWRL Rules` → `SPARQL VizQ`. Seules les sections contenant au moins un résultat sont affichées. |

**Code source :** `app.js` → `GlobalSearch._render()` — Déclare `groups` comme un objet ordonné avec les clés dans cet ordre exact ; itère avec `Object.entries(groups).filter(([, arr]) => arr.length)` pour n'afficher que les sections non vides. Les `this._items` sont reconstruits dans l'ordre d'affichage pour garantir la cohérence des index `data-idx`.

---

### REQ-FTS-010 — Rendu des résultats de la Partie A (User Labels)

| **Si** | un résultat appartient à la Partie A (label utilisateur), |
|---|---|
| **Alors** | chaque ligne affiche : (1) une icône caractéristique du type de label (`rectangle jaune` pour `rdfs:label`, `losange violet` pour Individual Display Name, `⚙️` pour SWRL Labels, `🎯` pour SPARQL Labels), (2) le texte du label qui a matché, (3) l'icône de l'entité parente (`rond marron` pour `Class`, `rectangle bleu` pour `ObjectProperty`, `rectangle vert` pour `DatatypeProperty`, etc.), (4) l'ID de l'entité parente en texte secondaire. |

**Code source :** `app.js` → `GlobalSearch._render()` — Le `switch(sec)` gère chaque section Partie A : `rdfs-labels` utilise `<span class="lbl-dot">` + `this._dot(r.kind)` + `<span class="gs-item-sub">${r.id}</span>` ; `individual-names` utilise `<span class="xsd-dot">` ; `swrl-labels` utilise l'emoji `⚙️` ; `sparql-labels` utilise l'emoji `🎯`. Le CSS `.lbl-dot` définit un rectangle de 14×9px avec `background: #FACC15` (jaune).

---

### REQ-FTS-011 — Rendu des résultats de la Partie B (System IDs)

| **Si** | un résultat appartient à la Partie B (ID système), |
|---|---|
| **Alors** | chaque ligne affiche uniquement l'icône caractéristique du type d'entité suivie de son ID, sans texte secondaire. |

**Code source :** `app.js` → `GlobalSearch._render()` — La branche `default` du `switch(sec)` rend `${this._dot(sec)}<span class="gs-item-label">${r.label}</span>` sans `gs-item-sub`. `GlobalSearch._dot()` retourne le span CSS correspondant : `cls-dot` (Classes), `op-prop-dot` (ObjectProperties), `dp-prop-dot` (DatatypeProperties), `anno-prop-dot` (AnnotationProperties), `xsd-dot` (Individuals), emoji `⚙️` (SWRL Rules), emoji `🎯` (SPARQL VizQ).

---

### REQ-FTS-012 — Navigation clavier dans les résultats

| **Si** | le menu de résultats est ouvert, |
|---|---|
| **Alors** | l'utilisateur peut naviguer dans les résultats avec les touches `↑` / `↓`, confirmer la sélection avec `Entrée`, et fermer le menu avec `Échap`. Si un seul résultat est présent, `Entrée` le sélectionne directement sans navigation préalable. |

**Code source :** `app.js` → `GlobalSearch.onKey()` — `ArrowDown` incrémente `_focusIdx` jusqu'à `_items.length - 1` ; `ArrowUp` le décrémente jusqu'à `0` ; `Enter` appelle `_navigate(_focusIdx)` si un item est focalisé, ou `_navigate(0)` si un seul résultat ; `Escape` appelle `clear()`. `_refreshFocus()` synchronise la classe CSS `focused` et scrolle l'item dans la vue.

---

### REQ-FTS-013 — Effacement de la recherche

| **Si** | le champ de recherche est vide ou que l'utilisateur clique sur le bouton d'effacement `✕`, |
|---|---|
| **Alors** | le menu de résultats se ferme et la saisie est réinitialisée. |

**Code source :** `app.js` → `GlobalSearch.onInput()` — Si `!val.trim()`, masque le dropdown (`drop.style.display = 'none'`). Le bouton `#global-search-clear` est affiché/masqué selon la présence de texte ; un clic sur ce bouton vide l'input et déclenche `onInput('')`. `GlobalSearch.clear()` remet `_query`, `_focusIdx` et `_items` à leur état initial.

---
