Voici le fichier reformulé au format Si/Alors :

# Exigences — Ontologies

> Généré le 2026-06-06 | Dérivé strictement du code source | Aucune hallucination

## Table des matières

### Fond
- [REQ-ONT-001 — Tri des ontologies dans le registre](#req-ont-001--tri-des-ontologies-dans-le-registre)
- [REQ-ONT-002 — Auto-sélection de l'ontologie connectée](#req-ont-002--auto-sélection-de-lontologie-connectée)
- [REQ-ONT-003 — Création d'une nouvelle ontologie](#req-ont-003--création-dune-nouvelle-ontologie)
- [REQ-ONT-004 — Import d'une ontologie OWL/TTL](#req-ont-004--import-dune-ontologie-owlttl)
- [REQ-ONT-005 — Lecture automatique du préfixe et de l'URI depuis un fichier source](#req-ont-005--lecture-automatique-du-préfixe-et-de-luri-depuis-un-fichier-source)
- [REQ-ONT-006 — Chargement d'une ontologie JSON](#req-ont-006--chargement-dune-ontologie-json)
- [REQ-ONT-007 — Lecture automatique des métadonnées depuis un fichier JSON](#req-ont-007--lecture-automatique-des-métadonnées-depuis-un-fichier-json)
- [REQ-ONT-008 — Sauvegarde des modifications d'une ontologie](#req-ont-008--sauvegarde-des-modifications-dune-ontologie)
- [REQ-ONT-009 — Connexion et déconnexion d'une ontologie](#req-ont-009--connexion-et-déconnexion-dune-ontologie)
- [REQ-ONT-010 — Désenregistrement d'une ontologie](#req-ont-010--désenregistrement-dune-ontologie)
- [REQ-ONT-011 — Téléchargement des ontologies W3C intégrées](#req-ont-011--téléchargement-des-ontologies-w3c-intégrées)
- [REQ-ONT-012 — Export d'une ontologie par nom (OWL/TTL/SWRL/SWORD)](#req-ont-012--export-dune-ontologie-par-nom-owlttlswrlsword)
- [REQ-ONT-013 — Export de l'ontologie couramment connectée](#req-ont-013--export-de-lontologie-couramment-connectée)
- [REQ-ONT-014 — Blocage des onglets d'édition en l'absence d'ontologie connectée](#req-ont-014--blocage-des-onglets-dédition-en-labsence-dontologie-connectée)
- [REQ-ONT-015 — Calcul des racines virtuelles selon le préfixe de l'ontologie](#req-ont-015--calcul-des-racines-virtuelles-selon-le-préfixe-de-lontologie)
- [REQ-ONT-016 — Import implicite de OWL pour les ontologies utilisateur](#req-ont-016--import-implicite-de-owl-pour-les-ontologies-utilisateur)

### Forme
- [REQ-ONT-017 — Affichage de l'onglet Ontologies](#req-ont-017--affichage-de-longlet-ontologies)
- [REQ-ONT-018 — Chargement et affichage du registre](#req-ont-018--chargement-et-affichage-du-registre)
- [REQ-ONT-019 — Sélection d'une ligne du registre](#req-ont-019--sélection-dune-ligne-du-registre)
- [REQ-ONT-020 — Affichage du compteur d'ontologies](#req-ont-020--affichage-du-compteur-dontologies)
- [REQ-ONT-021 — Édition des attributs d'une ontologie existante](#req-ont-021--édition-des-attributs-dune-ontologie-existante)
- [REQ-ONT-022 — Menu déroulant de sélection du format d'export](#req-ont-022--menu-déroulant-de-sélection-du-format-dexport)
- [REQ-ONT-023 — Affichage de l'arbre des imports avec expansion/repli](#req-ont-023--affichage-de-larbre-des-imports-avec-expansionrepli)
- [REQ-ONT-024 — Navigation vers une entrée du registre depuis l'arbre des imports](#req-ont-024--navigation-vers-une-entrée-du-registre-depuis-larbre-des-imports)
- [REQ-ONT-025 — Ouverture du répertoire dans le Finder](#req-ont-025--ouverture-du-répertoire-dans-le-finder)
- [REQ-ONT-026 — Panneau wizard commutable (ouverture/fermeture)](#req-ont-026--panneau-wizard-commutable-ouverturefermeture)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles OWL, contraintes de données, comportements algorithmiques, validations, persistance.


### REQ-ONT-001 — Tri des ontologies dans le registre

**Si** le registre des ontologies est affiché,

**Alors** :
- les ontologies utilisateur apparaissent en premier, triées par ordre alphabétique (`localeCompare`) ;
- les ontologies W3C en lecture seule apparaissent en dernier, selon un ordre de dépendance fixe (`owl` → `rdfs` → `rdf`) codé dans la constante `BUILTIN_ORDER`.

---

**Code source :** `app.js` → `_refreshOntoTable()`

### REQ-ONT-002 — Auto-sélection de l'ontologie connectée

**Si** l'onglet Ontologies est chargé
**et** qu'aucune sélection manuelle n'est active (`_selectedOntoName` est nul),

**Alors** le système recherche dans la liste l'entrée dont le champ `connected` est vrai et lui affecte automatiquement `_selectedOntoName`, de sorte que l'ontologie connectée soit visuellement mise en évidence.

---

**Code source :** `app.js` → `renderOntologies()`

### REQ-ONT-003 — Création d'une nouvelle ontologie

**Si** l'utilisateur remplit le formulaire wizard (nom, répertoire, préfixe, URI de namespace) et soumet la création,

**Alors** :
- le système compose le chemin du fichier (`<dir>/<name>.json`) et appelle `API.registerOntology({ name, path, uri, prefix })` pour l'enregistrer ;
- si la case « Connect immediately » est cochée, `API.connectOntology(name)` est appelée en complément ;
- si l'un des champs obligatoires (`name`, `dir`, `uri`) est absent, un message d'erreur est affiché et le traitement est interrompu.

---

**Code source :** `app.js` → `_doNew()`

### REQ-ONT-004 — Import d'une ontologie OWL/TTL

**Si** l'utilisateur remplit le formulaire d'import (fichier source `.owl`/`.ttl`/`.rdf`, nom, répertoire de destination, préfixe, URI) et lance l'import,

**Alors** :
- le système compose le chemin de sauvegarde (`<dir>/<name>.json`) et appelle `API.importFromPath({ name, owl_path, save_path, uri, prefix })` ;
- si la case « Connect immediately » n'est pas cochée, `API.disconnectOntology()` est appelée ensuite ;
- si l'un des cinq champs obligatoires est absent, le traitement est interrompu.

---

**Code source :** `app.js` → `_doImport()`

### REQ-ONT-005 — Lecture automatique du préfixe et de l'URI depuis un fichier source

**Si** l'utilisateur clique sur « Lire le préfixe & URI depuis le fichier » avec un fichier source sélectionné,

**Alors** le système appelle `API.peekOntology(src)` et injecte les valeurs retournées (`info.name`, `info.prefix`, `info.uri`) dans les champs du formulaire : le champ `name` n'est rempli que s'il est vide, tandis que `prefix` et `uri` sont remplacés inconditionnellement.

---

**Code source :** `app.js` → `_wizardImportPeek()`

### REQ-ONT-006 — Chargement d'une ontologie JSON

**Si** l'utilisateur remplit le formulaire de chargement (fichier `.json`, nom, préfixe, URI) et confirme,

**Alors** :
- le système appelle `API.registerJson(src, name, uri, prefix)` ;
- si la case « Connect immediately » est cochée, `API.connectOntology(name)` est appelée ensuite ;
- si les champs obligatoires `src` ou `name` sont absents, le traitement est interrompu.

---

**Code source :** `app.js` → `_doLoad()`

### REQ-ONT-007 — Lecture automatique des métadonnées depuis un fichier JSON

**Si** l'utilisateur clique sur « Lire les informations depuis le fichier » avec un fichier `.json` sélectionné,

**Alors** le système appelle `API.peekOntology(src)` et injecte les valeurs retournées (`info.name`, `info.prefix`, `info.uri`) dans les champs `wiz-load-name`, `wiz-load-prefix` et `wiz-load-uri`, en remplaçant toute valeur existante.

---

**Code source :** `app.js` → `_wizardLoadPeek()`

### REQ-ONT-008 — Sauvegarde des modifications d'une ontologie

**Si** l'utilisateur modifie les attributs d'une ontologie existante (nom, répertoire, préfixe, URI) et confirme la sauvegarde,

**Alors** le système compose le nouveau chemin (`<dir>/<name>.json`) et appelle `API.updateOntologyEntry(origName, { name, path, uri, prefix })`. Si l'un des champs obligatoires (`name`, `dir`, `uri`) est absent, le traitement est interrompu.

---

**Code source :** `app.js` → `doSaveEdit()`

### REQ-ONT-009 — Connexion et déconnexion d'une ontologie

**Si** l'utilisateur demande la connexion d'une ontologie,

**Alors** :
- le système appelle `API.connectOntology(name)`, affiche un message de succès, appelle `this.refresh()` puis rafraîchit l'onglet via `renderOntologies()` ;
- la ligne de l'ontologie connectée reçoit la classe CSS `onto-current-row` et son indicateur passe au symbole `●` vert.

**Si** l'utilisateur demande la déconnexion de l'ontologie courante,

**Alors** :
- le système appelle `API.disconnectOntology()`, affiche un message de succès, appelle `this.refresh()` puis réaffiche la section courante via `renderSection(this.currentSection)` ;
- les onglets d'édition deviennent inaccessibles (voir REQ-ONT-014).

---

**Code source :** `app.js` → `doConnect()` | `doDisconnect()`

### REQ-ONT-010 — Désenregistrement d'une ontologie

**Si** l'utilisateur demande le désenregistrement d'une ontologie et confirme la boîte de dialogue (dont le message précise explicitement que le fichier sur disque ne sera pas supprimé),

**Alors** le système appelle `API.unregisterOntology(name)` pour retirer l'entrée du registre, sans toucher au fichier physique.

---

**Code source :** `app.js` → `doUnregister()`

### REQ-ONT-011 — Téléchargement des ontologies W3C intégrées

**Si** l'utilisateur clique sur le bouton « Fetch W3C Ontologies »,

**Alors** :
- le bouton est désactivé pendant l'opération ;
- le système appelle `API.fetchBuiltins()` et comptabilise les entrées dont le statut contient la chaîne `'fetched'` pour afficher le nombre d'ontologies effectivement téléchargées et enregistrées (RDF, RDFS, OWL depuis `w3.org`) ;
- le bouton est réactivé dans le bloc `finally`.

---

**Code source :** `app.js` → `_fetchBuiltins()`

### REQ-ONT-012 — Export d'une ontologie par nom (OWL/TTL/SWRL/SWORD)

**Si** l'utilisateur sélectionne un format d'export et lance l'export d'une ontologie identifiée par son nom,

**Alors** le système appelle `API.exportOntologyByName(name, fmt)` et déclenche le téléchargement du blob résultant avec le nom de fichier `<name>.<ext>`, l'extension étant déterminée selon le format : `owl` → `.owl`, `ttl` → `.ttl`, `swrl` → `.json`, `sword` → `.sword`.

---

**Code source :** `app.js` → `exportOntologyByName()`

### REQ-ONT-013 — Export de l'ontologie couramment connectée

**Si** l'utilisateur lance l'export de l'ontologie couramment connectée en sélectionnant un format,

**Alors** le système appelle `API.exportOntology(fmt)` (sans nom explicite) et déclenche le téléchargement avec le nom générique `ontology.<ext>` (`.owl`, `.ttl` ou `.jsonld` selon le format).

---

**Code source :** `app.js` → `exportOntology()`

### REQ-ONT-014 — Blocage des onglets d'édition en l'absence d'ontologie connectée

**Si** l'utilisateur tente de naviguer vers un onglet d'édition
**et** qu'aucune ontologie n'est connectée (`this.state.ontology` est nul),

**Alors** la navigation est bloquée et un message est affiché dans `#main-content` avec un bouton de renvoi vers l'onglet Ontologies (`APP.navigate('ontologies')`).

---

**Code source :** `app.js` → `renderSection()`

### REQ-ONT-015 — Calcul des racines virtuelles selon le préfixe de l'ontologie

**Si** l'ontologie connectée a pour préfixe `'rdf'` ou `'rdfs'`,

**Alors** le système retourne `{ classRoot: 'rdfs:Resource', propRoot: 'rdf:Property' }` comme racines virtuelles.

**Si** l'ontologie connectée a tout autre préfixe (ou qu'aucune ontologie n'est connectée),

**Alors** le système retourne `{ classRoot: 'owl:Thing', propRoot: 'owl:topObjectProperty' }` comme racines virtuelles, utilisées dans les arborescences de l'application.

---

**Code source :** `app.js` → `getOntologyRootLabels()`

### REQ-ONT-016 — Import implicite de OWL pour les ontologies utilisateur

**Si** une ontologie utilisateur (non `readonly`) est affichée dans le tableau
**et** qu'elle ne déclare aucun import explicite (tableau `imports` vide),

**Alors** le système lui substitue automatiquement la liste `['http://www.w3.org/2002/07/owl#']` pour le rendu de l'arbre des imports, reflétant l'import implicite de OWL.

---

**Code source :** `app.js` → `_refreshOntoTable()`

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

### REQ-ONT-017 — Affichage de l'onglet Ontologies

**Si** l'utilisateur navigue vers l'onglet Ontologies,

**Alors** le système injecte dans `#main-content` la structure HTML complète (en-tête, quatre boutons d'action, panneau wizard masqué par défaut, tableau de registre avec les colonnes Name / Directory / Prefix / Namespace) via `_renderOntologiesShell()`, puis déclenche le chargement asynchrone du registre.

---

**Code source :** `app.js` → `renderOntologies()`

### REQ-ONT-018 — Chargement et affichage du registre

**Si** l'onglet Ontologies est affiché,

**Alors** le système appelle `API.listOntologies()` pour obtenir la liste des ontologies enregistrées et passe le résultat à `_refreshOntoTable()` qui génère les lignes HTML du tableau. En cas d'erreur API, le corps du tableau affiche le message « Unable to load the registry. ».

---

**Code source :** `app.js` → `renderOntologies()` et `_refreshOntoTable()`

### REQ-ONT-019 — Sélection d'une ligne du registre

**Si** l'utilisateur clique sur une ligne du tableau du registre,

**Alors** le système mémorise le nom dans `_selectedOntoName` et bascule la classe CSS `onto-selected-row` sur la ligne correspondante, en retirant cette classe de toutes les autres lignes.

---

**Code source :** `app.js` → `selectOntoRow()`

### REQ-ONT-020 — Affichage du compteur d'ontologies

**Si** le registre est chargé,

**Alors** l'élément `#onto-registry-count` affiche un texte du type « N ontology » ou « N ontologies » (pluriel conditionnel) reflétant le nombre d'entrées retournées par `API.listOntologies()`.

---

**Code source :** `app.js` → `_refreshOntoTable()`

### REQ-ONT-021 — Édition des attributs d'une ontologie existante

**Si** l'utilisateur demande l'édition d'une ontologie existante,

**Alors** le système appelle `API.listOntologies()` pour retrouver l'entrée correspondante, ouvre le panneau wizard en mode « edit » et y injecte un formulaire pré-rempli avec les valeurs actuelles (nom, répertoire, préfixe, URI). Le nom original est conservé dans un champ caché `wiz-edit-orig` et le répertoire est sélectionnable via `FsBrowser`.

---

**Code source :** `app.js` → `doEditOntology()`

### REQ-ONT-022 — Menu déroulant de sélection du format d'export

**Si** l'utilisateur clique sur le bouton d'export,

**Alors** le système construit et positionne dynamiquement un menu contextuel (`position:fixed`) ancré sous le bouton. Les options proposées dépendent du paramètre `kind` : pour `'onto'` les formats sont OWL (`.owl`) et Turtle (`.ttl`) ; pour `'rules'` les formats sont SWRL (`.json`) et SWORD (`.sword`). Un clic extérieur au menu le ferme automatiquement via un listener `click` sur `document`.

---

**Code source :** `app.js` → `_ontoExportDropdown()`

### REQ-ONT-023 — Affichage de l'arbre des imports avec expansion/repli

**Si** le registre est affiché et qu'une ontologie possède des imports déclarés (champ `imports`),

**Alors** :
- les imports sont rendus en sous-lignes indentées ;
- si un import possède lui-même des imports, un bouton `▶`/`▼` permet d'expand/réduire l'arbre, l'état d'expansion étant mémorisé dans le `Set` `_ontoImportExpanded` ;
- la détection de cycles est gérée par un paramètre `visited` passé récursivement ;
- `toggleImportRow(path)` ajoute ou retire le chemin du `Set` puis rappelle `_refreshOntoTable()`.

---

**Code source :** `app.js` → `_refreshOntoTable()` (fonction interne `renderImportRows()`) et `toggleImportRow()`

### REQ-ONT-024 — Navigation vers une entrée du registre depuis l'arbre des imports

**Si** l'utilisateur clique sur le nom d'un nœud de l'arbre des imports correspondant à une ontologie connue du registre,

**Alors** le système localise la ligne `tr[data-name]` correspondante, la fait défiler en vue (`scrollIntoView`) et lui applique pendant 1,5 seconde un contour de couleur `var(--accent)` pour attirer l'attention visuelle.

---

**Code source :** `app.js` → `_scrollToRegistryRow()`

### REQ-ONT-025 — Ouverture du répertoire dans le Finder

**Si** l'utilisateur clique sur la cellule « Directory » d'une ligne du registre,

**Alors** le système appelle `API.revealInFinder(path)`. En cas d'échec (notamment si `host_agent.py` n'est pas démarré), un message d'avertissement est affiché via `UI.warn()`.

---

**Code source :** `app.js` → `_refreshOntoTable()` (attribut `onclick` de la cellule Directory)

### REQ-ONT-026 — Panneau wizard commutable (ouverture/fermeture)

**Si** l'utilisateur clique sur un bouton d'action du wizard,
**et** que le panneau `#onto-wizard` affiche déjà le même type de wizard,

**Alors** le panneau est masqué (comportement bascule).

**Si** l'utilisateur clique sur un bouton d'action du wizard
**et** que le panneau affiche un type différent ou est fermé,

**Alors** le système définit `panel.dataset.type`, rend le panneau visible et injecte le HTML du formulaire correspondant (`_wizardNew()`, `_wizardImport()` ou `_wizardLoad()`). `_closeWizard()` masque le panneau et réinitialise `panel.dataset.type`.

---

**Code source :** `app.js` → `_openWizard()` et `_closeWizard()`
