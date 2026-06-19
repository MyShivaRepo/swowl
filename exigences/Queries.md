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
- [REQ-QRY-027 — Suppression d'un patron via une croix rouge](#req-qry-027--suppression-dun-patron-via-une-croix-rouge)
- [REQ-QRY-028 — Réordonnancement des patrons par glisser-déposer](#req-qry-028--réordonnancement-des-patrons-par-glisser-déposer)
- [REQ-QRY-029 — Sélecteur de classe homogène pour les objets `rdf:type`](#req-qry-029--sélecteur-de-classe-homogène-pour-les-objets-rdftype)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles OWL, contraintes de données, comportements algorithmiques, validations, persistance.


### REQ-QRY-001 — Persistance des requêtes par ontologie

| **Si** | l'utilisateur travaille sur plusieurs `ontologies` distinctes, |
|---|---|
| **Alors** | les `requêtes` de chaque `ontologie` sont isolées les unes des autres et persistent entre les sessions, sans risque de mélange ni de perte lors d'un rechargement de l'application. |

---

**Code source :** `sparql_editor.js` → `_storeKey()`, `_loadAll()`, `_saveAll()` — Utilise le `localStorage` du navigateur avec une clé construite dynamiquement sous la forme `swowl_sparql_<ontologyId>` pour isoler les requêtes par ontologie ; `_loadAll()` parse le JSON stocké (retourne `[]` en cas d'erreur de désérialisation) et `_saveAll()` sérialise et réécrit le tableau complet.

### REQ-QRY-002 — Création d'une nouvelle requête

| **Si** | l'utilisateur souhaite formuler une nouvelle `requête` sur l'`ontologie` courante, |
|---|---|
| **Alors** | il peut créer une `requête` vierge avec un identifiant unique, prête à être configurée et exécutée, sans avoir à saisir manuellement un identifiant ni à remplir les champs optionnels. |

---

**Code source :** `sparql_editor.js` → `newQuery()`, `_emptyQuery()` — Génère un identifiant unique de la forme `QueryN` (en incrémentant N jusqu'à l'absence de doublon), crée un objet requête vide via `_emptyQuery()` avec les champs `id`, `label`, `comment`, `distinct: false`, `patterns: []`, `order_by: ''`, `order_dir: 'ASC'`, `limit: 100`, l'ajoute au `localStorage`, puis sélectionne et affiche immédiatement cette nouvelle requête.

### REQ-QRY-003 — Sélection d'une requête existante

| **Si** | l'utilisateur choisit une `requête` dans la liste des `requêtes` sauvegardées, |
|---|---|
| **Alors** | le détail complet de cette `requête` s'affiche dans le panneau d'édition, reflétant exactement l'état persisté, sans altérer les autres `requêtes`. |

---

**Code source :** `app.js` → `APP.renderQueries()`, `sparql_editor.js` → `renderSplit()`, `renderList()`, `selectQuery()` — Les requêtes sauvegardées s'affichent directement dans l'onglet « Queries » : `APP.renderQueries()` rend simplement `SparqlEditor.renderSplit()` sans aucune sous-barre verticale propre (l'ancienne sous-barre « SPARQL VizQ » interne à l'onglet a été supprimée ; le stockage persistant est inchangé). Chaque requête de `renderList()` est affichée avec une icône loupe 🔎. À la sélection, `selectQuery()` charge la requête depuis le `localStorage`, en effectue une copie profonde (via `JSON.parse/JSON.stringify`) dans `_editingQuery`, met à jour `_selectedId`, rafraîchit la liste (surlignage de l'élément sélectionné) et rend le panneau de détail.

### REQ-QRY-004 — Suppression d'une requête

| **Si** | l'utilisateur supprime une `requête` de la liste, |
|---|---|
| **Alors** | la `requête` est définitivement retirée de la liste persistée, et si c'était la `requête` en cours d'édition, le panneau de détail est vidé. |

---

**Code source :** `sparql_editor.js` → `deleteSelected()`, `deleteQuery()` — La suppression est déclenchée depuis un bouton corbeille rouge placé dans la barre d'outils du panneau (à droite du bouton « + »), qui agit sur la (les) requête(s) sélectionnée(s) via `deleteSelected()` (ce n'est plus un contrôle par ligne en face de chaque requête). La logique sous-jacente filtre le tableau de requêtes persistées pour exclure la requête ciblée, sauvegarde le tableau résultant, et, si la requête supprimée était sélectionnée, réinitialise `_selectedId` et `_editingQuery` à `null` et remplace le panneau de détail par un message vide.

### REQ-QRY-005 — Recherche/filtrage dans la liste des requêtes

| **Si** | l'utilisateur saisit un terme dans le champ de recherche de la liste des `requêtes`, |
|---|---|
| **Alors** | seules les `requêtes` dont l'identifiant ou le libellé contient ce terme sont affichées ; si aucune `requête` ne correspond, un message explicite l'indique. |

---

**Code source :** `sparql_editor.js` → `_onSearch()`, `renderList()` — Mémorise le terme dans `_searchQuery` et reconstruit le contenu HTML de la liste en ne conservant que les requêtes dont la concaténation `id + label` contient le terme (insensible à la casse) ; si aucun résultat ne correspond, affiche le message `'No matching query'`.

### REQ-QRY-006 — Édition de l'identifiant d'une requête

| **Si** | l'utilisateur modifie l'identifiant d'une `requête` et que la saisie contient des espaces, |
|---|---|
| **Alors** | les espaces sont automatiquement remplacés par des underscores afin de garantir la validité de l'identifiant, et la liste est mise à jour en conséquence. |

---

**Code source :** `sparql_editor.js` → `_onIdChange()` — Normalise la valeur en remplaçant les espaces par des underscores, localise l'entrée correspondante dans le `localStorage` par l'ancien identifiant, remplace l'`id` dans l'entrée persistée, dans `_editingQuery` et dans `_selectedId`, sauvegarde, puis rafraîchit la liste.

### REQ-QRY-007 — Édition du libellé et du commentaire d'une requête

| **Si** | l'utilisateur modifie le libellé ou le commentaire d'une `requête` et quitte le champ, |
|---|---|
| **Alors** | les modifications sont automatiquement sauvegardées sans action supplémentaire de l'utilisateur. |

---

**Code source :** `sparql_editor.js` → `_syncAndSave()`, `_sync()` — Lit les valeurs courantes de tous les champs du formulaire (`sq-id`, `sq-label`, `sq-comment`, `sq-distinct`, `sq-orderby`, `sq-orderdir`, `sq-limit`), les copie dans `_editingQuery` via `_sync()`, puis persiste l'état via `_saveEditing()`.

### REQ-QRY-008 — Ajout d'un patron triple

| **Si** | l'utilisateur souhaite ajouter une condition de type sujet-prédicat-objet à la `requête` courante, |
|---|---|
| **Alors** | un nouveau patron triple est ajouté à la `requête` avec des valeurs par défaut permettant de commencer la saisie immédiatement. |

---

**Code source :** `sparql_editor.js` → `addPattern()`, `_newPat()` — Synchronise d'abord le formulaire, puis pousse dans `_editingQuery.patterns` un objet `{ type: 'triple', subject: '?x', predicate: 'rdf:type', object: '' }`, sauvegarde l'état et re-rend le panneau de détail.

### REQ-QRY-009 — Ajout d'un patron FILTER

| **Si** | l'utilisateur souhaite ajouter une condition de filtrage à la `requête` courante, |
|---|---|
| **Alors** | un nouveau patron FILTER est ajouté à la `requête` avec un champ de saisie libre pour exprimer la condition. |

---

**Code source :** `sparql_editor.js` → `addPattern()`, `_newPat()` — Ajoute un objet `{ type: 'filter', expr: '' }` à `_editingQuery.patterns` et le rend via `_renderPattern()` sous la forme `FILTER ( <expression> )`.

### REQ-QRY-010 — Ajout d'un bloc OPTIONAL

| **Si** | l'utilisateur souhaite exprimer des conditions facultatives dans la `requête` courante, |
|---|---|
| **Alors** | un bloc OPTIONAL vide est ajouté à la `requête`, dans lequel il peut ensuite ajouter des patrons triple ou FILTER de manière autonome. |

---

**Code source :** `sparql_editor.js` → `addPattern()`, `_newPat()` — Ajoute un objet `{ type: 'optional', patterns: [] }` à `_editingQuery.patterns` et `_renderPattern()` affiche ce bloc avec son en-tête `OPTIONAL` et des boutons `+ Triple` / `+ Filter` pour ajouter des patrons internes.

### REQ-QRY-011 — Ajout de patrons imbriqués dans un bloc OPTIONAL

| **Si** | l'utilisateur ajoute un patron triple ou FILTER à l'intérieur d'un bloc OPTIONAL existant, |
|---|---|
| **Alors** | le nouveau patron est bien rattaché au bloc OPTIONAL concerné et non à la racine de la `requête`. |

---

**Code source :** `sparql_editor.js` → `_addInner()` — Vérifie que le patron à l'index `outerIdx` est bien de type `optional`, lui ajoute le nouveau patron via `_newPat()`, et adresse ce patron imbriqué par un tableau `[outerIdx, innerIdx]` dans `_getPat()`.

### REQ-QRY-012 — Suppression d'un patron (racine ou imbriqué)

| **Si** | l'utilisateur supprime un patron situé directement dans la `requête` (niveau racine), |
|---|---|
| **Alors** | ce patron est retiré de la `requête` et le panneau est mis à jour. |

| **Si** | l'utilisateur supprime un patron situé à l'intérieur d'un bloc OPTIONAL, |
|---|---|
| **Alors** | seul ce patron imbriqué est retiré du bloc OPTIONAL qui le contient, sans affecter les autres patrons. |

---

**Code source :** `sparql_editor.js` → `deletePattern()` — Pour un index simple (entier) : effectue un splice sur `q.patterns` pour retirer le patron racine. Pour un index tableau `[oi, ii]` : effectue un splice sur `q.patterns[oi].patterns` pour retirer le patron imbriqué dans le bloc OPTIONAL correspondant. Dans les deux cas, sauvegarde et re-rend le panneau.

### REQ-QRY-015 — Réinitialisation de l'objet lors du changement de prédicat

| **Si** | l'utilisateur change le prédicat d'un patron triple pour le définir à `rdf:type`, |
|---|---|
| **Alors** | le champ objet est vidé afin d'inviter l'utilisateur à sélectionner une `classe` plutôt qu'une variable. |

| **Si** | l'utilisateur change le prédicat d'un patron triple depuis `rdf:type` vers un autre prédicat, |
|---|---|
| **Alors** | le champ objet est réinitialisé à une variable par défaut afin de proposer un point de départ cohérent avec le nouveau prédicat. |

---

**Code source :** `sparql_editor.js` → `_onPredicateChange()` — Si le nouveau prédicat est `rdf:type` et que l'ancien ne l'était pas : vide le champ `object` (`''`) et re-rend le panneau. Si l'utilisateur quitte `rdf:type` vers un autre prédicat : réinitialise le champ `object` à `'?y'` et re-rend le panneau.

### REQ-QRY-016 — Autocomplétion des variables

| **Si** | l'`ontologie` est chargée et que la `requête` courante contient des variables définies dans des patrons (y compris imbriqués dans des blocs OPTIONAL), |
|---|---|
| **Alors** | ces variables sont proposées en autocomplétion dans les champs sujet, objet et tri, facilitant la cohérence de la `requête`. |

---

**Code source :** `sparql_editor.js` → `_collectVars()`, `_renderForm()` — Parcourt récursivement tous les patrons, collecte dans un `Set` toutes les valeurs de `subject` et `object` commençant par `?`, et expose ces variables via un élément `<datalist id="sq-vars-list">` référencé par les champs `subject`, `object` et `order_by`.

### REQ-QRY-017 — Options de requête : DISTINCT, ORDER BY, LIMIT

| **Si** | l'utilisateur configure des options de mise en forme des résultats (élimination des doublons, tri, limitation du nombre de résultats), |
|---|---|
| **Alors** | ces options sont intégrées dans la `requête` SPARQL générée et persistent avec la `requête`. |

---

**Code source :** `sparql_editor.js` → `_sync()`, `_buildSparql()` — Persiste les valeurs `distinct`, `order_by`, `order_dir` et `limit` dans le modèle ; `_buildSparql()` les intègre respectivement en `SELECT DISTINCT`, `ORDER BY DIR(?var)` et `LIMIT N` (la valeur de `sq-limit` est un entier avec un défaut de 100 et un maximum de 100000).

### REQ-QRY-019 — Génération automatique des préfixes SPARQL

| **Si** | une `requête` SPARQL est générée pour une `ontologie` disposant d'un préfixe déclaré, |
|---|---|
| **Alors** | les préfixes standards (`rdf:`, `rdfs:`, `owl:`) ainsi que le préfixe propre à l'`ontologie` sont automatiquement inclus dans la `requête`, sans que l'utilisateur ait à les saisir manuellement. |

---

**Code source :** `sparql_editor.js` → `_buildSparql()` — Injecte systématiquement les préfixes `rdf:`, `rdfs:` et `owl:` ; si l'ontologie courante (`APP.state.ontology`) possède un `prefix` et un `id` (IRI de base), ajoute un quatrième préfixe `PREFIX <prefix>: <IRI#>` (le séparateur `#` est omis si l'IRI se termine déjà par `#` ou `/`).

### REQ-QRY-020 — Gestion des littéraux non-variables avec FILTER(STR(...))

| **Si** | l'utilisateur saisit une valeur littérale (non-variable) dans le champ objet d'un patron portant un prédicat de type annotation ou `DatatypeProperty`, |
|---|---|
| **Alors** | la comparaison s'effectue indépendamment du tag de langue RDF, évitant les faux négatifs liés aux littéraux étiquetés. |

---

**Code source :** `sparql_editor.js` → `_buildSparql()` (fonction interne `patToLines`) — Pour un prédicat de type littéral (`rdfs:label`, `rdfs:comment`, ou une Datatype Property) dont la valeur de l'objet n'est ni une variable (`?`), ni déjà entre guillemets : génère une variable intermédiaire `?_lvN` dans la clause triple et ajoute automatiquement une clause `FILTER ( STR(?_lvN) = "valeur" )`.

### REQ-QRY-021 — Exécution de la requête via l'API

| **Si** | l'utilisateur lance l'exécution de la `requête` courante, |
|---|---|
| **Alors** | la `requête` est envoyée au point d'accès SPARQL, un indicateur de progression est affiché pendant l'exécution, puis le nombre de résultats obtenus est indiqué en cas de succès, ou le message d'erreur du serveur est affiché en cas d'échec. |

---

**Code source :** `sparql_editor.js` → `runQuery()` — Synchronise le formulaire et génère la requête SPARQL, affiche un statut `Exécution…` et expose automatiquement la prévisualisation SPARQL, envoie la requête en POST sur `/api/sparql` avec le content-type `application/x-www-form-urlencoded` (paramètre `query`), affiche `bindings.length` dans `sq-status` après succès, ou propage le texte d'erreur du serveur en cas de réponse non-OK.

### REQ-QRY-026 — Restauration de la sélection courante

| **Si** | l'utilisateur revient sur l'onglet des `requêtes` après avoir navigué ailleurs dans l'application, |
|---|---|
| **Alors** | la dernière `requête` qu'il consultait est automatiquement réaffichée dans le panneau de détail, sans qu'il ait à la rechercher et la sélectionner à nouveau. |

---

**Code source :** `sparql_editor.js` → `restoreSelection()` — Réinitialise la poignée de redimensionnement via `_initSplitHandle()` et, si `_selectedId` est défini, rappelle `selectQuery(_selectedId)` pour réafficher le panneau de détail de la dernière requête sélectionnée.

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

### REQ-QRY-013 — Sélection du prédicat via menu déroulant hiérarchique

| **Si** | l'utilisateur ouvre le sélecteur de prédicat d'un patron triple, |
|---|---|
| **Alors** | les prédicats disponibles sont présentés organisés par catégorie (type de `classe`, `ObjectProperty`, `DatatypeProperty`, `AnnotationProperty`), en respectant la hiérarchie de l'`ontologie`, avec une icône distinctive par type de `propriété`. |

---

**Code source :** `sparql_editor.js` → `_predGroups()`, `_propTreeItems()`, `_ddBuild()` — Présente un menu déroulant personnalisé organisé en quatre groupes (`rdf:type` / Classes, Object Properties, Datatype Properties, Annotation Properties incluant `rdfs:label` et `rdfs:comment`), chaque groupe trié selon la hiérarchie `subPropertyOf` en DFS alphabétique avec gestion de la profondeur, chaque entrée affichant une icône colorée par type de propriété.

### REQ-QRY-014 — Champ objet adaptatif selon le prédicat

| **Si** | le prédicat d'un patron triple est `rdf:type`, |
|---|---|
| **Alors** | le champ objet présente un sélecteur d'arborescence de `classes` de l'`ontologie`. |

| **Si** | le prédicat est une `AnnotationProperty` ou une `DatatypeProperty`, |
|---|---|
| **Alors** | le champ objet présente un champ texte large permettant de saisir une variable ou une valeur littérale. |

| **Si** | le prédicat est une `ObjectProperty` ou une valeur non reconnue, |
|---|---|
| **Alors** | le champ objet présente un champ texte court permettant de saisir une variable ou un IRI. |

---

**Code source :** `sparql_editor.js` → `_objectField()` — Pour `rdf:type` : affiche un « chip » cliquable ouvrant un picker `.cls-tree-picker` (arborescence de classes + filtre) via `_toggleClsPicker()` / `_pickType()`. Pour `rdfs:label`, `rdfs:comment` ou une Datatype Property : affiche un champ texte pleine largeur avec le placeholder `?var ou valeur littérale`. Pour les Object Properties, annotation properties ou valeurs inconnues : affiche un champ texte de 95px avec le placeholder `?var ou IRI`.

### REQ-QRY-018 — Prévisualisation SPARQL générée

| **Si** | l'utilisateur souhaite visualiser la `requête` SPARQL correspondant aux patrons qu'il a définis, |
|---|---|
| **Alors** | il peut afficher ou masquer un panneau de prévisualisation affichant la `requête` SPARQL générée en temps réel, sans quitter le formulaire d'édition. |

---

**Code source :** `sparql_editor.js` → `_toggleSparql()`, `_refreshSparqlPreview()` — Met à jour le libellé du bouton (`▼ Show` / `▲ Hide`), stocke l'état dans `_showSparql`, et affiche ou masque le contenu `<pre>` de la requête générée ; lors d'un rafraîchissement via `_refreshSparqlPreview()`, appelle `_sync()` puis `_buildSparql()` et injecte le texte dans `sq-sparql-preview` sans re-rendre l'intégralité du formulaire.

### REQ-QRY-022 — Affichage des résultats en tableau

| **Si** | une `requête` SPARQL retourne des résultats, |
|---|---|
| **Alors** | les résultats sont affichés dans un tableau lisible avec les variables en en-têtes de colonnes, une ligne par résultat, et une indication claire pour les cellules sans valeur ; les tags de langue des littéraux sont visibles en exposant. |

---

**Code source :** `sparql_editor.js` → `_renderResults()` — Génère un tableau HTML avec les noms de variables en en-têtes de colonnes, une ligne par binding avec mise en évidence au survol et alternance de fond sur les lignes paires/impaires, un tiret (`—`) dans les cellules sans valeur, et le tag de langue affiché en exposant (ex. `@fr`) pour les valeurs littérales portant un attribut `xml:lang`.

### REQ-QRY-023 — Navigation vers une entité depuis les résultats

| **Si** | un résultat de `requête` correspond à une entité connue de l'`ontologie` (`classe`, `individu`, `propriété`), |
|---|---|
| **Alors** | l'utilisateur peut cliquer sur ce résultat pour naviguer directement vers la fiche de l'entité dans l'onglet correspondant de l'application. |

---

**Code source :** `sparql_editor.js` → `_resolveEntity()`, `navigateToEntity()`, `_renderResults()` — Rend la cellule comme un lien cliquable avec l'icône colorée de l'entité et son nom d'affichage si l'URI est reconnue dans `APP.state` (parmi les classes, individus, object properties, datatype properties ou annotation properties) ; au clic, `navigateToEntity(uri)` appelle `APP.navigate(section)` puis, après 150 ms, la fonction de sélection spécifique à l'éditeur concerné (`ClassEditor.selectClass`, `IndividualEditor.selectIndividual`, `OPEditor.selectProp`, `DPEditor.selectProp`, `APEditor.selectProp`).

### REQ-QRY-024 — Lien externe pour les URIs non reconnues dans les résultats

| **Si** | un résultat de `requête` est une URI ne correspondant à aucune entité de l'`ontologie` courante, |
|---|---|
| **Alors** | l'utilisateur peut ouvrir cette ressource externe dans un nouvel onglet en cliquant dessus. |

---

**Code source :** `sparql_editor.js` → `_renderResults()` — Pour toute cellule de type `uri` dont `_resolveEntity()` ne retourne aucune correspondance dans l'application : génère une balise `<a href="..." target="_blank">` affichant la partie locale de l'URI.

### REQ-QRY-025 — Redimensionnement du panneau liste

| **Si** | l'utilisateur souhaite ajuster la largeur du panneau listant les `requêtes`, |
|---|---|
| **Alors** | il peut le redimensionner librement par glisser-déposer, dans des limites raisonnables assurant l'utilisabilité de l'interface. |

---

**Code source :** `sparql_editor.js` → `_initSplitHandle()` — Contraint la largeur du panneau `sparql-list-panel` entre 120 px et 400 px, ajoute la classe CSS `resizing` au `body` pendant toute la durée du glissement et la supprime à la fin ; les écouteurs `mousedown`/`mousemove`/`mouseup` ne sont attachés qu'une seule fois (flag `_bound`).

### REQ-QRY-027 — Suppression d'un patron via une croix rouge

| **Si** | l'utilisateur souhaite supprimer un patron triple, FILTER ou OPTIONAL (racine ou imbriqué), |
|---|---|
| **Alors** | il dispose d'un contrôle de suppression sous la forme d'une **croix rouge ✕**, positionné juste après l'élément qu'il supprime ; ce contrôle remplace l'ancienne icône de corbeille et est homogène avec le reste de l'application. |

---

**Code source :** `sparql_editor.js` → `_renderPattern()`, `deletePattern()` — Chaque ligne de patron affiche un bouton de suppression en croix rouge `✕` placé après l'élément qu'il supprime, déclenchant `deletePattern()` sur l'index correspondant (entier pour un patron racine, tableau `[oi, ii]` pour un patron imbriqué dans un bloc OPTIONAL). Le style croix rouge est partagé à l'échelle de l'application.

### REQ-QRY-028 — Réordonnancement des patrons par glisser-déposer

| **Si** | l'utilisateur souhaite modifier l'ordre des patrons d'une `requête`, |
|---|---|
| **Alors** | chaque ligne de patron présente une **poignée de glissement « ⠿ »** sur son côté gauche, lui permettant de réordonner les patrons vers le haut ou le bas par glisser-déposer, exactement comme le réordonnancement des atomes dans les règles SWRL ; le réordonnancement fonctionne au sein de la liste de patrons racine comme à l'intérieur des blocs OPTIONAL. |

---

**Code source :** `sparql_editor.js` → `_renderPattern()` — Chaque ligne de patron est dotée d'une poignée de glissement `⠿` à gauche activant le glisser-déposer ; le déplacement réordonne les patrons au sein de la liste racine (`_editingQuery.patterns`) ou au sein du tableau `patterns` d'un bloc OPTIONAL, puis sauvegarde et re-rend le panneau. Le mécanisme est identique à celui du réordonnancement des atomes des règles SWRL.

### REQ-QRY-029 — Sélecteur de classe homogène pour les objets `rdf:type`

| **Si** | l'utilisateur sélectionne une `classe` comme objet d'un patron dont le prédicat est `rdf:type`, |
|---|---|
| **Alors** | le sélecteur de classe présente, en haut, un champ **Filtre** ainsi qu'une liste de `classes` en **mode arborescence**, de façon homogène avec les autres sélecteurs de classe de l'application. |

---

**Code source :** `sparql_editor.js` → `_objectField()` (branche `rdf:type`) — Affiche un « chip » cliquable suivi d'un picker `.cls-tree-picker` dont les items sont générés par `_classTreePickerItems('SparqlEditor._pickType')`. `_toggleClsPicker()` ouvre le picker et lui ajoute le champ `Filter` en tête via `_decoratePickerWithFilter()` (liste de classes en mode arborescence) ; `_pickType()` applique la classe choisie à l'objet du patron. Composant cohérent avec le reste de l'application.
