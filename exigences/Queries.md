# Exigences — Queries

> Généré le 2026-06-06 | Dérivé strictement du code source | Aucune hallucination

## Table des matières

### Fond
- [REQ-QRY-001 — Persistance des requêtes par ontologie](#req-qry-001--persistance-des-requêtes-par-ontologie)
- [REQ-QRY-002 — Création d'une nouvelle requête](#req-qry-002--création-dune-nouvelle-requête)
- [REQ-QRY-003 — Sélection d'une requête existante](#req-qry-003--sélection-dune-requête-existante)
- [REQ-QRY-004 — Suppression d'une requête](#req-qry-004--suppression-dune-requête)
- [REQ-QRY-005 — Recherche/filtrage dans la liste des requêtes](#req-qry-005--recherchefiltrage-dans-la-liste-des-requêtes)
- [REQ-QRY-006 — Édition de l'identifiant d'une requête](#req-qry-006--édition-de-lidentifiant-dune-requête)
- [REQ-QRY-007 — Édition du libellé et du commentaire d'une requête](#req-qry-007--édition-du-libellé-et-du-commentaire-dune-requête)
- [REQ-QRY-008 — Ajout d'un patron triple](#req-qry-008--ajout-dun-patron-triple)
- [REQ-QRY-009 — Ajout d'un patron FILTER](#req-qry-009--ajout-dun-patron-filter)
- [REQ-QRY-010 — Ajout d'un bloc OPTIONAL](#req-qry-010--ajout-dun-bloc-optional)
- [REQ-QRY-011 — Ajout de patrons imbriqués dans un bloc OPTIONAL](#req-qry-011--ajout-de-patrons-imbriqués-dans-un-bloc-optional)
- [REQ-QRY-012 — Suppression d'un patron (racine ou imbriqué)](#req-qry-012--suppression-dun-patron-racine-ou-imbriqué)
- [REQ-QRY-015 — Réinitialisation de l'objet lors du changement de prédicat](#req-qry-015--réinitialisation-de-lobjet-lors-du-changement-de-prédicat)
- [REQ-QRY-016 — Autocomplétion des variables](#req-qry-016--autocomplétion-des-variables)
- [REQ-QRY-017 — Options de requête : DISTINCT, ORDER BY, LIMIT](#req-qry-017--options-de-requête--distinct-order-by-limit)
- [REQ-QRY-019 — Génération automatique des préfixes SPARQL](#req-qry-019--génération-automatique-des-préfixes-sparql)
- [REQ-QRY-020 — Gestion des littéraux non-variables avec FILTER(STR(...))](#req-qry-020--gestion-des-littéraux-non-variables-avec-filterstr)
- [REQ-QRY-021 — Exécution de la requête via l'API](#req-qry-021--exécution-de-la-requête-via-lapi)
- [REQ-QRY-026 — Restauration de la sélection courante](#req-qry-026--restauration-de-la-sélection-courante)

### Forme
- [REQ-QRY-013 — Sélection du prédicat via menu déroulant hiérarchique](#req-qry-013--sélection-du-prédicat-via-menu-déroulant-hiérarchique)
- [REQ-QRY-014 — Champ objet adaptatif selon le prédicat](#req-qry-014--champ-objet-adaptatif-selon-le-prédicat)
- [REQ-QRY-018 — Prévisualisation SPARQL générée](#req-qry-018--prévisualisation-sparql-générée)
- [REQ-QRY-022 — Affichage des résultats en tableau](#req-qry-022--affichage-des-résultats-en-tableau)
- [REQ-QRY-023 — Navigation vers une entité depuis les résultats](#req-qry-023--navigation-vers-une-entité-depuis-les-résultats)
- [REQ-QRY-024 — Lien externe pour les URIs non reconnues dans les résultats](#req-qry-024--lien-externe-pour-les-uris-non-reconnues-dans-les-résultats)
- [REQ-QRY-025 — Redimensionnement du panneau liste](#req-qry-025--redimensionnement-du-panneau-liste)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles OWL, contraintes de données, comportements algorithmiques, validations, persistance.


### REQ-QRY-001 — Persistance des requêtes par ontologie

| **Si** | l'application doit lire ou écrire les requêtes d'une ontologie donnée, |
|---|---|
| **Alors** | le système utilise le `localStorage` du navigateur avec une clé construite dynamiquement sous la forme `swowl_sparql_<ontologyId>`, garantissant l'isolation des requêtes par ontologie ; `_loadAll()` parse le JSON stocké (retourne `[]` en cas d'erreur de désérialisation) et `_saveAll()` sérialise et réécrit le tableau complet. |

---

**Code source :** `sparql_editor.js` → `_storeKey()`, `_loadAll()`, `_saveAll()`

### REQ-QRY-002 — Création d'une nouvelle requête

| **Si** | l'utilisateur déclenche la création d'une nouvelle requête, |
|---|---|
| **Alors** | le système :<br>- génère un identifiant unique de la forme `QueryN` (en incrémentant N jusqu'à l'absence de doublon),<br>- crée un objet requête vide via `_emptyQuery()` avec les champs `id`, `label`, `comment`, `distinct: false`, `patterns: []`, `order_by: ''`, `order_dir: 'ASC'`, `limit: 100`,<br>- l'ajoute au `localStorage`,<br>- puis sélectionne et affiche immédiatement cette nouvelle requête. |

---

**Code source :** `sparql_editor.js` → `newQuery()`, `_emptyQuery()`

### REQ-QRY-003 — Sélection d'une requête existante

| **Si** | l'utilisateur sélectionne une requête existante par son identifiant, |
|---|---|
| **Alors** | le système charge la requête correspondante depuis le `localStorage`, en effectue une copie profonde (via `JSON.parse/JSON.stringify`) dans `_editingQuery`, met à jour `_selectedId`, rafraîchit la liste (surlignage de l'élément sélectionné) et rend le panneau de détail. |

---

**Code source :** `sparql_editor.js` → `selectQuery()`

### REQ-QRY-004 — Suppression d'une requête

| **Si** | l'utilisateur supprime une requête identifiée par son `id`, |
|---|---|
| **Alors** | le système filtre le tableau de requêtes persistées pour exclure la requête ciblée, sauvegarde le tableau résultant, et, si la requête supprimée était la requête sélectionnée, réinitialise l'état courant (`_selectedId` et `_editingQuery` à `null`) et remplace le panneau de détail par un message vide. |

---

**Code source :** `sparql_editor.js` → `deleteQuery()`

### REQ-QRY-005 — Recherche/filtrage dans la liste des requêtes

| **Si** | l'utilisateur saisit un terme dans le champ de recherche, |
|---|---|
| **Alors** | le système mémorise le terme dans `_searchQuery` et reconstruit le contenu HTML de la liste en ne conservant que les requêtes dont la concaténation `id + label` contient le terme (insensible à la casse) ; si aucun résultat ne correspond, le message `'No matching query'` est affiché à la place de la liste. |

---

**Code source :** `sparql_editor.js` → `_onSearch()`, `renderList()`

### REQ-QRY-006 — Édition de l'identifiant d'une requête

| **Si** | l'utilisateur modifie la valeur du champ `sq-id` d'une requête sélectionnée **et** que la saisie contient des espaces, |
|---|---|
| **Alors** | le système normalise la valeur en remplaçant les espaces par des underscores, localise l'entrée correspondante dans le `localStorage` par l'ancien identifiant, remplace l'`id` dans l'entrée persistée, dans `_editingQuery` et dans `_selectedId`, sauvegarde, puis rafraîchit la liste. |

---

**Code source :** `sparql_editor.js` → `_onIdChange()`

### REQ-QRY-007 — Édition du libellé et du commentaire d'une requête

| **Si** | l'utilisateur modifie le champ `sq-label` (input texte) ou `sq-comment` (textarea) et quitte le champ, |
|---|---|
| **Alors** | le système lit les valeurs courantes de tous les champs du formulaire (`sq-id`, `sq-label`, `sq-comment`, `sq-distinct`, `sq-orderby`, `sq-orderdir`, `sq-limit`), les copie dans `_editingQuery` via `_sync()`, puis persiste l'état via `_saveEditing()`. |

---

**Code source :** `sparql_editor.js` → `_syncAndSave()`, `_sync()`

### REQ-QRY-008 — Ajout d'un patron triple

| **Si** | l'utilisateur déclenche l'ajout d'un patron de type `triple`, |
|---|---|
| **Alors** | le système synchronise d'abord le formulaire, puis pousse dans `_editingQuery.patterns` un objet `{ type: 'triple', subject: '?x', predicate: 'rdf:type', object: '' }` créé par `_newPat()`, sauvegarde l'état et re-rend le panneau de détail. |

---

**Code source :** `sparql_editor.js` → `addPattern()`, `_newPat()`

### REQ-QRY-009 — Ajout d'un patron FILTER

| **Si** | l'utilisateur déclenche l'ajout d'un patron de type `filter`, |
|---|---|
| **Alors** | le système ajoute un objet `{ type: 'filter', expr: '' }` à `_editingQuery.patterns` et le rend via `_renderPattern()` sous la forme `FILTER ( <expression> )` avec un champ de saisie libre pour l'expression. |

---

**Code source :** `sparql_editor.js` → `addPattern()`, `_newPat()`

### REQ-QRY-010 — Ajout d'un bloc OPTIONAL

| **Si** | l'utilisateur déclenche l'ajout d'un bloc de type `optional`, |
|---|---|
| **Alors** | le système ajoute un objet `{ type: 'optional', patterns: [] }` à `_editingQuery.patterns` et `_renderPattern()` affiche ce bloc avec son propre en-tête `OPTIONAL` et des boutons `+ Triple` / `+ Filter` pour ajouter des patrons internes. |

---

**Code source :** `sparql_editor.js` → `addPattern()`, `_newPat()`

### REQ-QRY-011 — Ajout de patrons imbriqués dans un bloc OPTIONAL

| **Si** | l'utilisateur ajoute un patron (triple ou filter) à l'intérieur d'un bloc OPTIONAL existant à l'index `outerIdx`, |
|---|---|
| **Alors** | le système vérifie que le patron à cet index est bien de type `optional`, lui ajoute le nouveau patron via `_newPat()`, et adresse ce patron imbriqué par un tableau `[outerIdx, innerIdx]` dans `_getPat()`. |

---

**Code source :** `sparql_editor.js` → `_addInner()`

### REQ-QRY-012 — Suppression d'un patron (racine ou imbriqué)

| **Si** | l'utilisateur supprime un patron identifié par un index simple (entier), |
|---|---|
| **Alors** | le système effectue un splice sur `q.patterns` pour retirer le patron racine, sauvegarde et re-rend le panneau. |

| **Si** | l'utilisateur supprime un patron identifié par un tableau `[oi, ii]`, |
|---|---|
| **Alors** | le système effectue un splice sur `q.patterns[oi].patterns` pour retirer le patron imbriqué dans le bloc OPTIONAL correspondant, sauvegarde et re-rend le panneau. |

---

**Code source :** `sparql_editor.js` → `deletePattern()`

### REQ-QRY-015 — Réinitialisation de l'objet lors du changement de prédicat

| **Si** | l'utilisateur change le prédicat d'un patron triple et que le nouveau prédicat est `rdf:type` alors que l'ancien ne l'était pas, |
|---|---|
| **Alors** | le système vide le champ `object` (`''`) et re-rend le panneau pour permuter le type de champ objet. |

| **Si** | l'utilisateur change le prédicat d'un patron triple et quitte `rdf:type` vers un autre prédicat, |
|---|---|
| **Alors** | le système réinitialise le champ `object` à `'?y'` et re-rend le panneau pour permuter le type de champ objet. |

---

**Code source :** `sparql_editor.js` → `_onPredicateChange()`

### REQ-QRY-016 — Autocomplétion des variables

| **Si** | l'ontologie est chargée et contient des patrons de requête (y compris dans des blocs OPTIONAL imbriqués), |
|---|---|
| **Alors** | le système parcourt récursivement tous les patrons, collecte dans un `Set` toutes les valeurs de `subject` et `object` commençant par `?`, et expose ces variables via un élément `<datalist id="sq-vars-list">` référencé par les champs `subject`, `object` et `order_by`. |

---

**Code source :** `sparql_editor.js` → `_collectVars()`, `_renderForm()`

### REQ-QRY-017 — Options de requête : DISTINCT, ORDER BY, LIMIT

| **Si** | l'utilisateur configure les options d'une requête (case `sq-distinct`, champ `sq-orderby` avec direction `sq-orderdir`, champ numérique `sq-limit`), |
|---|---|
| **Alors** | le système persiste ces valeurs dans le modèle et `_buildSparql()` les intègre respectivement en `SELECT DISTINCT`, `ORDER BY DIR(?var)` et `LIMIT N` dans la requête SPARQL générée (la valeur de `sq-limit` est un entier avec un défaut de 100 et un maximum de 100000). |

---

**Code source :** `sparql_editor.js` → `_sync()`, `_buildSparql()`

### REQ-QRY-019 — Génération automatique des préfixes SPARQL

| **Si** | une requête SPARQL est générée, |
|---|---|
| **Alors** | le système injecte systématiquement les préfixes `rdf:`, `rdfs:` et `owl:` ; si l'ontologie courante (`APP.state.ontology`) possède un `prefix` et un `id` (IRI de base), un quatrième préfixe `PREFIX <prefix>: <IRI#>` est ajouté (le séparateur `#` est omis si l'IRI se termine déjà par `#` ou `/`). |

---

**Code source :** `sparql_editor.js` → `_buildSparql()`

### REQ-QRY-020 — Gestion des littéraux non-variables avec FILTER(STR(...))

| **Si** | un patron triple porte un prédicat de type littéral (`rdfs:label`, `rdfs:comment`, ou une Datatype Property) **et** que la valeur de l'objet n'est ni une variable (`?`), ni déjà entre guillemets, |
|---|---|
| **Alors** | le système génère une variable intermédiaire `?_lvN` dans la clause triple et ajoute automatiquement une clause `FILTER ( STR(?_lvN) = "valeur" )` pour comparer la valeur indépendamment du tag de langue RDF. |

---

**Code source :** `sparql_editor.js` → `_buildSparql()` (fonction interne `patToLines`)

### REQ-QRY-021 — Exécution de la requête via l'API

| **Si** | l'utilisateur déclenche l'exécution de la requête courante, |
|---|---|
| **Alors** | le système :<br>- synchronise le formulaire et génère la requête SPARQL,<br>- affiche un statut `Exécution…` et expose automatiquement la prévisualisation SPARQL,<br>- envoie la requête en POST sur `/api/sparql` avec le content-type `application/x-www-form-urlencoded` (paramètre `query`),<br>- affiche le nombre de résultats (`bindings.length`) dans `sq-status` après succès,<br>- ou propage le texte d'erreur du serveur en cas de réponse non-OK. |

---

**Code source :** `sparql_editor.js` → `runQuery()`

### REQ-QRY-026 — Restauration de la sélection courante

| **Si** | l'utilisateur revient sur l'onglet des requêtes, |
|---|---|
| **Alors** | le système réinitialise la poignée de redimensionnement via `_initSplitHandle()` et, si `_selectedId` est défini, rappelle `selectQuery(_selectedId)` pour réafficher le panneau de détail de la dernière requête sélectionnée. |

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

**Code source :** `sparql_editor.js` → `restoreSelection()`

### REQ-QRY-013 — Sélection du prédicat via menu déroulant hiérarchique

| **Si** | l'utilisateur ouvre le sélecteur de prédicat d'un patron triple, |
|---|---|
| **Alors** | le système présente un menu déroulant personnalisé organisé en quatre groupes (`rdf:type` / Classes, Object Properties, Datatype Properties, Annotation Properties incluant `rdfs:label` et `rdfs:comment`), chaque groupe étant trié selon la hiérarchie `subPropertyOf` en DFS alphabétique avec gestion de la profondeur, et chaque entrée affichant une icône colorée par type de propriété. |

---

**Code source :** `sparql_editor.js` → `_predGroups()`, `_propTreeItems()`, `_ddBuild()`

### REQ-QRY-014 — Champ objet adaptatif selon le prédicat

| **Si** | le prédicat d'un patron triple est `rdf:type`, |
|---|---|
| **Alors** | le système affiche un menu déroulant d'arborescence de classes (`_buildClsDd()`). |

| **Si** | le prédicat est `rdfs:label`, `rdfs:comment` ou une Datatype Property, |
|---|---|
| **Alors** | le système affiche un champ texte pleine largeur avec le placeholder `?var ou valeur littérale`. |

| **Si** | le prédicat est une Object Property, une annotation property ou une valeur inconnue, |
|---|---|
| **Alors** | le système affiche un champ texte de 95px avec le placeholder `?var ou IRI`. |

---

**Code source :** `sparql_editor.js` → `_objectField()`

### REQ-QRY-018 — Prévisualisation SPARQL générée

| **Si** | l'utilisateur bascule la visibilité du panneau de prévisualisation SPARQL, |
|---|---|
| **Alors** | le système met à jour le libellé du bouton (`▼ Show` / `▲ Hide`), stocke l'état dans `_showSparql`, et affiche ou masque le contenu `<pre>` de la requête générée ; lors d'un rafraîchissement via `_refreshSparqlPreview()`, le système appelle `_sync()` puis `_buildSparql()` et injecte le texte dans `sq-sparql-preview` sans re-rendre l'intégralité du formulaire. |

---

**Code source :** `sparql_editor.js` → `_toggleSparql()`, `_refreshSparqlPreview()`

### REQ-QRY-022 — Affichage des résultats en tableau

| **Si** | une requête SPARQL retourne des résultats, |
|---|---|
| **Alors** | le système génère un tableau HTML avec :<br>- les noms de variables en en-têtes de colonnes,<br>- une ligne par binding avec mise en évidence au survol et alternance de fond sur les lignes paires/impaires,<br>- un tiret (`—`) dans les cellules sans valeur,<br>- le tag de langue affiché en exposant (ex. `@fr`) pour les valeurs littérales portant un attribut `xml:lang`. |

---

**Code source :** `sparql_editor.js` → `_renderResults()`

### REQ-QRY-023 — Navigation vers une entité depuis les résultats

| **Si** | une cellule de résultat contient une URI reconnue dans `APP.state` (parmi les classes, individus, object properties, datatype properties ou annotation properties), |
|---|---|
| **Alors** | le système rend la cellule comme un lien cliquable avec l'icône colorée de l'entité et son nom d'affichage ; au clic, `navigateToEntity(uri)` appelle `APP.navigate(section)` puis, après 150 ms, la fonction de sélection spécifique à l'éditeur concerné (`ClassEditor.selectClass`, `IndividualEditor.selectIndividual`, `OPEditor.selectProp`, `DPEditor.selectProp`, `APEditor.selectProp`). |

---

**Code source :** `sparql_editor.js` → `_resolveEntity()`, `navigateToEntity()`, `_renderResults()`

### REQ-QRY-024 — Lien externe pour les URIs non reconnues dans les résultats

| **Si** | une cellule de résultat est de type `uri` **et** que `_resolveEntity()` ne retourne aucune correspondance dans l'application, |
|---|---|
| **Alors** | le système génère une balise `<a href="..." target="_blank">` affichant la partie locale de l'URI, permettant d'ouvrir la ressource externe dans un nouvel onglet. |

---

**Code source :** `sparql_editor.js` → `_renderResults()`

### REQ-QRY-025 — Redimensionnement du panneau liste

| **Si** | l'utilisateur glisse la poignée `sparql-split-h` pour redimensionner le panneau liste, |
|---|---|
| **Alors** | le système contraint la largeur du panneau `sparql-list-panel` entre 120 px et 400 px, ajoute la classe CSS `resizing` au `body` pendant toute la durée du glissement, et supprime cette classe à la fin du glissement ; les écouteurs `mousedown`/`mousemove`/`mouseup` ne sont attachés qu'une seule fois (flag `_bound`). |

**Code source :** `sparql_editor.js` → `_initSplitHandle()`
