# Exigences de l'onglet Queries — SWOWL

**Date :** 2026-06-06
**Note :** Exigences dérivées strictement du code source (`sparql_editor.js`)

---

## Table des matières

1. [REQ-QRY-001 — Persistance des requêtes par ontologie](#req-qry-001-persistance-des-requêtes-par-ontologie)
2. [REQ-QRY-002 — Création d'une nouvelle requête](#req-qry-002-création-dune-nouvelle-requête)
3. [REQ-QRY-003 — Sélection d'une requête existante](#req-qry-003-sélection-dune-requête-existante)
4. [REQ-QRY-004 — Suppression d'une requête](#req-qry-004-suppression-dune-requête)
5. [REQ-QRY-005 — Recherche/filtrage dans la liste des requêtes](#req-qry-005-recherchefiltrage-dans-la-liste-des-requêtes)
6. [REQ-QRY-006 — Édition de l'identifiant d'une requête](#req-qry-006-édition-de-lidentifiant-dune-requête)
7. [REQ-QRY-007 — Édition du libellé et du commentaire d'une requête](#req-qry-007-édition-du-libellé-et-du-commentaire-dune-requête)
8. [REQ-QRY-008 — Ajout d'un patron triple](#req-qry-008-ajout-dun-patron-triple)
9. [REQ-QRY-009 — Ajout d'un patron FILTER](#req-qry-009-ajout-dun-patron-filter)
10. [REQ-QRY-010 — Ajout d'un bloc OPTIONAL](#req-qry-010-ajout-dun-bloc-optional)
11. [REQ-QRY-011 — Ajout de patrons imbriqués dans un bloc OPTIONAL](#req-qry-011-ajout-de-patrons-imbriqués-dans-un-bloc-optional)
12. [REQ-QRY-012 — Suppression d'un patron (racine ou imbriqué)](#req-qry-012-suppression-dun-patron-racine-ou-imbriqué)
13. [REQ-QRY-013 — Sélection du prédicat via menu déroulant hiérarchique](#req-qry-013-sélection-du-prédicat-via-menu-déroulant-hiérarchique)
14. [REQ-QRY-014 — Champ objet adaptatif selon le prédicat](#req-qry-014-champ-objet-adaptatif-selon-le-prédicat)
15. [REQ-QRY-015 — Réinitialisation de l'objet lors du changement de prédicat](#req-qry-015-réinitialisation-de-lobjet-lors-du-changement-de-prédicat)
16. [REQ-QRY-016 — Autocomplétion des variables](#req-qry-016-autocomplétion-des-variables)
17. [REQ-QRY-017 — Options de requête : DISTINCT, ORDER BY, LIMIT](#req-qry-017-options-de-requête-distinct-order-by-limit)
18. [REQ-QRY-018 — Prévisualisation SPARQL générée](#req-qry-018-prévisualisation-sparql-générée)
19. [REQ-QRY-019 — Génération automatique des préfixes SPARQL](#req-qry-019-génération-automatique-des-préfixes-sparql)
20. [REQ-QRY-020 — Gestion des littéraux non-variables avec FILTER(STR(...))](#req-qry-020-gestion-des-littéraux-non-variables-avec-filterstr)
21. [REQ-QRY-021 — Exécution de la requête via l'API](#req-qry-021-exécution-de-la-requête-via-lapi)
22. [REQ-QRY-022 — Affichage des résultats en tableau](#req-qry-022-affichage-des-résultats-en-tableau)
23. [REQ-QRY-023 — Navigation vers une entité depuis les résultats](#req-qry-023-navigation-vers-une-entité-depuis-les-résultats)
24. [REQ-QRY-024 — Lien externe pour les URIs non reconnues dans les résultats](#req-qry-024-lien-externe-pour-les-uris-non-reconnues-dans-les-résultats)
25. [REQ-QRY-025 — Redimensionnement du panneau liste](#req-qry-025-redimensionnement-du-panneau-liste)
26. [REQ-QRY-026 — Restauration de la sélection courante](#req-qry-026-restauration-de-la-sélection-courante)

---

### REQ-QRY-001 — Persistance des requêtes par ontologie

**Code source :** `sparql_editor.js` → `_storeKey()`, `_loadAll()`, `_saveAll()`

Les requêtes sont persistées dans le `localStorage` du navigateur. La clé de stockage est construite dynamiquement sous la forme `swowl_sparql_<ontologyId>`, ce qui isole les requêtes de chaque ontologie. `_loadAll()` parse le JSON stocké (retourne `[]` en cas d'erreur), `_saveAll()` sérialise et réécrit le tableau complet.

---

### REQ-QRY-002 — Création d'une nouvelle requête

**Code source :** `sparql_editor.js` → `newQuery()`, `_emptyQuery()`

`newQuery()` génère un identifiant unique de la forme `QueryN` (en incrémentant N jusqu'à ne pas trouver de doublon), crée un objet requête vide via `_emptyQuery()` avec les champs `id`, `label`, `comment`, `distinct: false`, `patterns: []`, `order_by: ''`, `order_dir: 'ASC'`, `limit: 100`, l'ajoute au `localStorage`, puis sélectionne et affiche immédiatement cette nouvelle requête.

---

### REQ-QRY-003 — Sélection d'une requête existante

**Code source :** `sparql_editor.js` → `selectQuery()`

`selectQuery(id)` charge la requête correspondante depuis le `localStorage`, en effectue une copie profonde (via `JSON.parse/JSON.stringify`) dans `_editingQuery`, met à jour `_selectedId`, rafraîchit la liste (surlignage) et rend le panneau de détail.

---

### REQ-QRY-004 — Suppression d'une requête

**Code source :** `sparql_editor.js` → `deleteQuery()`

`deleteQuery(id)` filtre le tableau de requêtes persistées pour exclure la requête ciblée, sauvegarde le tableau résultant, et, si la requête supprimée était sélectionnée, réinitialise l'état courant (`_selectedId`, `_editingQuery` à `null`) et remplace le panneau de détail par un message vide.

---

### REQ-QRY-005 — Recherche/filtrage dans la liste des requêtes

**Code source :** `sparql_editor.js` → `_onSearch()`, `renderList()`

`_onSearch(val)` mémorise le terme saisi dans `_searchQuery` et reconstruit le contenu HTML de la liste. `renderList()` filtre les requêtes dont la concaténation `id + label` contient le terme (insensible à la casse). Si aucun résultat n'est trouvé, un message `'No matching query'` est affiché.

---

### REQ-QRY-006 — Édition de l'identifiant d'une requête

**Code source :** `sparql_editor.js` → `_onIdChange()`

`_onIdChange(val)` intercepte le changement de l'input `sq-id`. Elle localise l'entrée correspondante dans le `localStorage` par l'ancien identifiant, remplace l'`id` de l'entrée persistée, de `_editingQuery` et de `_selectedId`, sauvegarde, puis rafraîchit la liste. Le champ `oninput` normalise la valeur en remplaçant les espaces par des underscores.

---

### REQ-QRY-007 — Édition du libellé et du commentaire d'une requête

**Code source :** `sparql_editor.js` → `_syncAndSave()`, `_sync()`

Les champs `sq-label` (input texte) et `sq-comment` (textarea) déclenchent `_syncAndSave()` à leur événement `onchange`. `_sync()` lit les valeurs courantes de tous les champs du formulaire (`sq-id`, `sq-label`, `sq-comment`, `sq-distinct`, `sq-orderby`, `sq-orderdir`, `sq-limit`) et les copie dans `_editingQuery`, puis `_saveEditing()` persiste l'état.

---

### REQ-QRY-008 — Ajout d'un patron triple

**Code source :** `sparql_editor.js` → `addPattern()`, `_newPat()`

`addPattern('triple')` synchronise d'abord le formulaire, puis pousse dans `_editingQuery.patterns` un objet `{ type: 'triple', subject: '?x', predicate: 'rdf:type', object: '' }` créé par `_newPat()`, sauvegarde et re-rend le panneau de détail.

---

### REQ-QRY-009 — Ajout d'un patron FILTER

**Code source :** `sparql_editor.js` → `addPattern()`, `_newPat()`

`addPattern('filter')` ajoute un objet `{ type: 'filter', expr: '' }` à `_editingQuery.patterns`. Le patron est rendu par `_renderPattern()` sous la forme `FILTER ( <expression> )` avec un champ de saisie libre pour l'expression.

---

### REQ-QRY-010 — Ajout d'un bloc OPTIONAL

**Code source :** `sparql_editor.js` → `addPattern()`, `_newPat()`

`addPattern('optional')` ajoute un objet `{ type: 'optional', patterns: [] }` à `_editingQuery.patterns`. `_renderPattern()` affiche ce bloc avec son propre en-tête `OPTIONAL` et des boutons `＋ Triple` / `＋ Filter` pour ajouter des patrons internes.

---

### REQ-QRY-011 — Ajout de patrons imbriqués dans un bloc OPTIONAL

**Code source :** `sparql_editor.js` → `_addInner()`

`_addInner(outerIdx, type)` vérifie que le patron à l'index `outerIdx` est bien de type `optional`, puis lui ajoute un nouveau patron (triple ou filter) via `_newPat()`. L'adressage imbriqué utilise un tableau `[outerIdx, innerIdx]` pour identifier les patrons dans `_getPat()`.

---

### REQ-QRY-012 — Suppression d'un patron (racine ou imbriqué)

**Code source :** `sparql_editor.js` → `deletePattern()`

`deletePattern(idx)` accepte un index simple (entier) pour un patron racine (splice sur `q.patterns`) ou un tableau `[oi, ii]` pour un patron imbriqué dans un OPTIONAL (splice sur `q.patterns[oi].patterns`). La sauvegarde et le re-rendu du panneau sont effectués après chaque suppression.

---

### REQ-QRY-013 — Sélection du prédicat via menu déroulant hiérarchique

**Code source :** `sparql_editor.js` → `_predGroups()`, `_propTreeItems()`, `_ddBuild()`

`_predGroups()` construit quatre groupes de prédicats : `rdf:type` (Classes), Object Properties, Datatype Properties, Annotation Properties (incluant `rdfs:label` et `rdfs:comment`). `_propTreeItems()` ordonne chaque groupe selon la hiérarchie `subPropertyOf` en DFS alphabétique avec gestion de la profondeur. `_ddBuild()` génère le HTML du composant menu déroulant personnalisé avec icônes colorées par type de propriété.

---

### REQ-QRY-014 — Champ objet adaptatif selon le prédicat

**Code source :** `sparql_editor.js` → `_objectField()`

`_objectField(p, idx)` sélectionne le type de champ objet selon la valeur du prédicat :
- `rdf:type` → menu déroulant d'arborescence de classes (`_buildClsDd()`)
- `rdfs:label`, `rdfs:comment`, ou une Datatype Property → champ texte pleine largeur avec placeholder `?var ou valeur littérale`
- Autre (Object Property, annotation, inconnu) → champ texte 95px avec placeholder `?var ou IRI`

---

### REQ-QRY-015 — Réinitialisation de l'objet lors du changement de prédicat

**Code source :** `sparql_editor.js` → `_onPredicateChange()`

`_onPredicateChange(idx, val)` met à jour le prédicat du patron et applique deux règles de réinitialisation : si le nouveau prédicat est `rdf:type` et l'ancien ne l'était pas, `object` est vidé (`''`) ; si l'on quitte `rdf:type`, `object` est réinitialisé à `'?y'`. Le panneau est entièrement re-rendu pour permuter le type de champ objet.

---

### REQ-QRY-016 — Autocomplétion des variables

**Code source :** `sparql_editor.js` → `_collectVars()`, `_renderForm()`

`_collectVars(patterns)` parcourt récursivement tous les patrons (y compris ceux imbriqués dans les OPTIONAL) et collecte dans un `Set` toutes les valeurs de `subject` et `object` commençant par `?`. Ces variables sont exposées via un élément `<datalist id="sq-vars-list">` référencé par les champs `subject`, `object` et `order_by`.

---

### REQ-QRY-017 — Options de requête : DISTINCT, ORDER BY, LIMIT

**Code source :** `sparql_editor.js` → `_sync()`, `_buildSparql()`

Le formulaire expose trois options persistées dans le modèle : une case à cocher `sq-distinct` (booléen), un champ texte `sq-orderby` avec autocomplétion de variables et un sélecteur `sq-orderdir` (`ASC`/`DESC`), un champ numérique `sq-limit` (entier, défaut 100, max 100000). `_buildSparql()` les intègre respectivement en `SELECT DISTINCT`, `ORDER BY DIR(?var)` et `LIMIT N`.

---

### REQ-QRY-018 — Prévisualisation SPARQL générée

**Code source :** `sparql_editor.js` → `_toggleSparql()`, `_refreshSparqlPreview()`

Un panneau `SPARQL` repliable (état stocké dans `_showSparql`) affiche la requête générée dans un élément `<pre>`. `_toggleSparql()` bascule la visibilité et met à jour le libellé `▼ Show` / `▲ Hide`. `_refreshSparqlPreview()` appelle `_sync()` puis `_buildSparql()` et injecte le texte dans `sq-sparql-preview` sans re-rendre l'intégralité du formulaire.

---

### REQ-QRY-019 — Génération automatique des préfixes SPARQL

**Code source :** `sparql_editor.js` → `_buildSparql()`

`_buildSparql()` injecte systématiquement les préfixes `rdf:`, `rdfs:` et `owl:`. Si l'ontologie courante (`APP.state.ontology`) possède un `prefix` et un `id` (IRI de base), un quatrième préfixe `PREFIX <prefix>: <IRI#>` est ajouté (le séparateur `#` est omis si l'IRI se termine déjà par `#` ou `/`).

---

### REQ-QRY-020 — Gestion des littéraux non-variables avec FILTER(STR(...))

**Code source :** `sparql_editor.js` → `_buildSparql()` (fonction interne `patToLines`)

Lorsqu'un patron triple porte un prédicat de type littéral (`rdfs:label`, `rdfs:comment`, ou une Datatype Property) et que la valeur de l'objet n'est pas une variable (`?`), ni déjà entre guillemets, `_buildSparql()` génère une variable intermédiaire `?_lvN` et ajoute automatiquement une clause `FILTER ( STR(?_lvN) = "valeur" )` pour comparer indépendamment du tag de langue RDF.

---

### REQ-QRY-021 — Exécution de la requête via l'API

**Code source :** `sparql_editor.js` → `runQuery()`

`runQuery()` synchronise le formulaire, génère la requête SPARQL, affiche un statut `Exécution…`, expose automatiquement la prévisualisation SPARQL, puis envoie la requête en POST sur `/api/sparql` avec le content-type `application/x-www-form-urlencoded` (paramètre `query`). En cas de réponse non-OK, le texte d'erreur du serveur est propagé. Le nombre de résultats (`bindings.length`) est affiché dans `sq-status` après succès.

---

### REQ-QRY-022 — Affichage des résultats en tableau

**Code source :** `sparql_editor.js` → `_renderResults()`

`_renderResults(vars, bindings)` génère un tableau HTML avec : les noms de variables en en-têtes de colonnes, une ligne par binding avec mise en évidence au survol et alternance de fond sur les lignes paires/impaires. Les cellules sans valeur affichent un tiret (`—`). Les valeurs littérales avec tag de langue (`xml:lang`) affichent le tag en exposant (ex. `@fr`).

---

### REQ-QRY-023 — Navigation vers une entité depuis les résultats

**Code source :** `sparql_editor.js` → `_resolveEntity()`, `navigateToEntity()`, `_renderResults()`

`_resolveEntity(uri)` extrait la partie locale de l'URI (après `#` ou `/`) et cherche une correspondance dans `APP.state` parmi les classes, individus, object properties, datatype properties et annotation properties. Si une correspondance est trouvée, `_renderResults()` rend la cellule comme un lien cliquable avec l'icône colorée de l'entité et son nom d'affichage. `navigateToEntity(uri)` appelle `APP.navigate(section)` puis, après 150 ms, la fonction de sélection spécifique à l'éditeur concerné (`ClassEditor.selectClass`, `IndividualEditor.selectIndividual`, `OPEditor.selectProp`, `DPEditor.selectProp`, `APEditor.selectProp`).

---

### REQ-QRY-024 — Lien externe pour les URIs non reconnues dans les résultats

**Code source :** `sparql_editor.js` → `_renderResults()`

Pour les cellules de type `uri` dont `_resolveEntity()` ne retourne aucune correspondance dans l'application, `_renderResults()` génère une balise `<a href="..." target="_blank">` affichant la partie locale de l'URI, permettant d'ouvrir la ressource externe dans un nouvel onglet.

---

### REQ-QRY-025 — Redimensionnement du panneau liste

**Code source :** `sparql_editor.js` → `_initSplitHandle()`

`_initSplitHandle()` attache une fois (flag `_bound`) des écouteurs `mousedown`/`mousemove`/`mouseup` sur la poignée `sparql-split-h`. Lors du glissement, la largeur du panneau `sparql-list-panel` est contrainte entre 120 px et 400 px. La classe CSS `resizing` est ajoutée au `body` pendant le glissement.

---

### REQ-QRY-026 — Restauration de la sélection courante

**Code source :** `sparql_editor.js` → `restoreSelection()`

`restoreSelection()` est appelée lors du retour sur l'onglet. Elle réinitialise la poignée de redimensionnement via `_initSplitHandle()` et, si `_selectedId` est défini, rappelle `selectQuery(_selectedId)` pour réafficher le panneau de détail de la dernière requête sélectionnée.

---

*— Document généré par claude-sonnet-4-6*
