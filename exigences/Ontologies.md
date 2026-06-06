# Exigences — Onglet Ontologies (SWOWL)

**Date :** 2026-06-06
**Note :** Exigences dérivées strictement du code source (`frontend/js/app.js`). Chaque exigence cite la fonction JavaScript qui l'implémente. Aucune fonctionnalité n'est extrapolée.

---

## Table des matières

1. [REQ-ONT-001 — Affichage de l'onglet Ontologies](#req-ont-001)
2. [REQ-ONT-002 — Chargement et affichage du registre](#req-ont-002)
3. [REQ-ONT-003 — Tri des ontologies dans le registre](#req-ont-003)
4. [REQ-ONT-004 — Sélection d'une ligne du registre](#req-ont-004)
5. [REQ-ONT-005 — Auto-sélection de l'ontologie connectée](#req-ont-005)
6. [REQ-ONT-006 — Affichage du compteur d'ontologies](#req-ont-006)
7. [REQ-ONT-007 — Création d'une nouvelle ontologie](#req-ont-007)
8. [REQ-ONT-008 — Import d'une ontologie OWL/TTL](#req-ont-008)
9. [REQ-ONT-009 — Lecture automatique du préfixe et de l'URI depuis un fichier source](#req-ont-009)
10. [REQ-ONT-010 — Chargement d'une ontologie JSON](#req-ont-010)
11. [REQ-ONT-011 — Lecture automatique des métadonnées depuis un fichier JSON](#req-ont-011)
12. [REQ-ONT-012 — Édition des attributs d'une ontologie existante](#req-ont-012)
13. [REQ-ONT-013 — Sauvegarde des modifications d'une ontologie](#req-ont-013)
14. [REQ-ONT-014 — Connexion d'une ontologie](#req-ont-014)
15. [REQ-ONT-015 — Déconnexion de l'ontologie active](#req-ont-015)
16. [REQ-ONT-016 — Désenregistrement d'une ontologie](#req-ont-016)
17. [REQ-ONT-017 — Téléchargement des ontologies W3C intégrées](#req-ont-017)
18. [REQ-ONT-018 — Export d'une ontologie par nom (OWL/TTL/SWRL/SWORD)](#req-ont-018)
19. [REQ-ONT-019 — Menu déroulant de sélection du format d'export](#req-ont-019)
20. [REQ-ONT-020 — Export de l'ontologie couramment connectée](#req-ont-020)
21. [REQ-ONT-021 — Affichage de l'arbre des imports avec expansion/repli](#req-ont-021)
22. [REQ-ONT-022 — Navigation vers une entrée du registre depuis l'arbre des imports](#req-ont-022)
23. [REQ-ONT-023 — Ouverture du répertoire dans le Finder](#req-ont-023)
24. [REQ-ONT-024 — Blocage des onglets d'édition en l'absence d'ontologie connectée](#req-ont-024)
25. [REQ-ONT-025 — Calcul des racines virtuelles selon le préfixe de l'ontologie](#req-ont-025)
26. [REQ-ONT-026 — Panneau wizard commutable (ouverture/fermeture)](#req-ont-026)
27. [REQ-ONT-027 — Import implicite de OWL pour les ontologies utilisateur](#req-ont-027)

---

### REQ-ONT-001 — Affichage de l'onglet Ontologies {#req-ont-001}

**Code source :** `app.js` → `renderOntologies()`

La fonction injecte dans `#main-content` la structure HTML complète de l'onglet (en-tête, quatre boutons d'action, panneau wizard masqué par défaut, tableau de registre avec en-têtes colonnes Name / Directory / Prefix / Namespace) en appelant `_renderOntologiesShell()`, puis déclenche le chargement asynchrone du registre.

---

### REQ-ONT-002 — Chargement et affichage du registre {#req-ont-002}

**Code source :** `app.js` → `renderOntologies()` et `_refreshOntoTable()`

`renderOntologies()` appelle `API.listOntologies()` pour obtenir la liste des ontologies enregistrées, puis passe le résultat à `_refreshOntoTable()` qui génère les lignes HTML du tableau. En cas d'erreur API, le corps du tableau affiche le message « Unable to load the registry. ».

---

### REQ-ONT-003 — Tri des ontologies dans le registre {#req-ont-003}

**Code source :** `app.js` → `_refreshOntoTable()`

Le tableau est trié de la façon suivante : les ontologies utilisateur apparaissent en premier par ordre alphabétique (`localeCompare`), puis les ontologies W3C en lecture seule apparaissent en dernier selon un ordre de dépendance fixe (`owl` → `rdfs` → `rdf`, codé dans la constante `BUILTIN_ORDER`).

---

### REQ-ONT-004 — Sélection d'une ligne du registre {#req-ont-004}

**Code source :** `app.js` → `selectOntoRow()`

Un clic sur une ligne du tableau appelle `selectOntoRow(name)`, qui mémorise le nom dans `_selectedOntoName` et bascule la classe CSS `onto-selected-row` sur la ligne correspondante, retirant cette classe de toutes les autres lignes.

---

### REQ-ONT-005 — Auto-sélection de l'ontologie connectée {#req-ont-005}

**Code source :** `app.js` → `renderOntologies()`

Si aucune sélection manuelle n'est active (`_selectedOntoName` est nul), la fonction recherche dans la liste l'entrée dont le champ `connected` est vrai et lui affecte automatiquement `_selectedOntoName`, de sorte que l'ontologie connectée soit visuellement mise en évidence au chargement de l'onglet.

---

### REQ-ONT-006 — Affichage du compteur d'ontologies {#req-ont-006}

**Code source :** `app.js` → `_refreshOntoTable()`

L'élément `#onto-registry-count` reçoit un texte du type « N ontology » ou « N ontologies » (pluriel conditionnel) reflétant le nombre d'entrées retournées par `API.listOntologies()`.

---

### REQ-ONT-007 — Création d'une nouvelle ontologie {#req-ont-007}

**Code source :** `app.js` → `_doNew()`

La fonction lit les champs du formulaire wizard (nom, répertoire, préfixe, URI de namespace), compose le chemin du fichier (`<dir>/<name>.json`), appelle `API.registerOntology({ name, path, uri, prefix })` pour l'enregistrer, puis si la case « Connect immediately » est cochée, appelle `API.connectOntology(name)`. Les champs `name`, `dir` et `uri` sont obligatoires ; leur absence provoque un message d'erreur et interrompt le traitement.

---

### REQ-ONT-008 — Import d'une ontologie OWL/TTL {#req-ont-008}

**Code source :** `app.js` → `_doImport()`

La fonction lit les champs du formulaire import (fichier source `.owl`/`.ttl`/`.rdf`, nom, répertoire de destination, préfixe, URI). Elle compose le chemin de sauvegarde (`<dir>/<name>.json`) et appelle `API.importFromPath({ name, owl_path, save_path, uri, prefix })`. Si la case « Connect immediately » n'est pas cochée, elle appelle ensuite `API.disconnectOntology()`. Les cinq champs sont obligatoires.

---

### REQ-ONT-009 — Lecture automatique du préfixe et de l'URI depuis un fichier source {#req-ont-009}

**Code source :** `app.js` → `_wizardImportPeek()`

Lorsque l'utilisateur clique sur « Lire le préfixe & URI depuis le fichier », la fonction appelle `API.peekOntology(src)` avec le chemin du fichier sélectionné. Les valeurs retournées (`info.name`, `info.prefix`, `info.uri`) sont automatiquement injectées dans les champs du formulaire uniquement si ceux-ci sont vides (pour `name`) ou inconditionnellement (pour `prefix` et `uri`).

---

### REQ-ONT-010 — Chargement d'une ontologie JSON {#req-ont-010}

**Code source :** `app.js` → `_doLoad()`

La fonction lit les champs du formulaire load (fichier `.json`, nom, préfixe, URI) et appelle `API.registerJson(src, name, uri, prefix)`. Si la case « Connect immediately » est cochée, elle appelle ensuite `API.connectOntology(name)`. Les champs `src` et `name` sont obligatoires.

---

### REQ-ONT-011 — Lecture automatique des métadonnées depuis un fichier JSON {#req-ont-011}

**Code source :** `app.js` → `_wizardLoadPeek()`

Lorsque l'utilisateur clique sur « Lire les informations depuis le fichier », la fonction appelle `API.peekOntology(src)` et injecte les valeurs retournées (`info.name`, `info.prefix`, `info.uri`) dans les champs `wiz-load-name`, `wiz-load-prefix` et `wiz-load-uri`, en remplaçant toute valeur existante.

---

### REQ-ONT-012 — Édition des attributs d'une ontologie existante {#req-ont-012}

**Code source :** `app.js` → `doEditOntology()`

La fonction appelle `API.listOntologies()` pour retrouver l'entrée correspondant au `name` passé, puis ouvre le panneau wizard en mode « edit » et y injecte un formulaire pré-rempli avec les valeurs actuelles (nom, répertoire, préfixe, URI). Le nom original est conservé dans un champ caché `wiz-edit-orig`. Le répertoire est sélectionnable via `FsBrowser`.

---

### REQ-ONT-013 — Sauvegarde des modifications d'une ontologie {#req-ont-013}

**Code source :** `app.js` → `doSaveEdit()`

La fonction lit les champs du formulaire d'édition (nom original, nouveau nom, répertoire, préfixe, URI), compose le nouveau chemin (`<dir>/<name>.json`) et appelle `API.updateOntologyEntry(origName, { name, path, uri, prefix })`. Les champs `name`, `dir` et `uri` sont obligatoires.

---

### REQ-ONT-014 — Connexion d'une ontologie {#req-ont-014}

**Code source :** `app.js` → `doConnect()`

La fonction appelle `API.connectOntology(name)`, affiche un message de succès, appelle `this.refresh()` pour mettre à jour l'état global de l'application, puis raffraîchit l'affichage de l'onglet via `renderOntologies()`. La ligne de l'ontologie connectée reçoit la classe CSS `onto-current-row` et son indicateur passe au symbole `●` vert.

---

### REQ-ONT-015 — Déconnexion de l'ontologie active {#req-ont-015}

**Code source :** `app.js` → `doDisconnect()`

La fonction appelle `API.disconnectOntology()`, affiche un message de succès, appelle `this.refresh()` puis réaffiche la section courante via `renderSection(this.currentSection)`. Après déconnexion, les onglets d'édition deviennent inaccessibles (voir REQ-ONT-024).

---

### REQ-ONT-016 — Désenregistrement d'une ontologie {#req-ont-016}

**Code source :** `app.js` → `doUnregister()`

La fonction demande une confirmation via `UI.confirm()` (le message précise explicitement que le fichier sur disque ne sera pas supprimé). Si confirmé, elle appelle `API.unregisterOntology(name)` pour retirer l'entrée du registre, sans toucher au fichier physique.

---

### REQ-ONT-017 — Téléchargement des ontologies W3C intégrées {#req-ont-017}

**Code source :** `app.js` → `_fetchBuiltins()`

La fonction désactive le bouton « Fetch W3C Ontologies » pendant l'opération, appelle `API.fetchBuiltins()` et comptabilise dans le résultat les entrées dont le statut contient la chaîne `'fetched'` pour afficher le nombre d'ontologies effectivement téléchargées et enregistrées (RDF, RDFS, OWL depuis `w3.org`). Le bouton est réactivé dans le bloc `finally`.

---

### REQ-ONT-018 — Export d'une ontologie par nom (OWL/TTL/SWRL/SWORD) {#req-ont-018}

**Code source :** `app.js` → `exportOntologyByName()`

La fonction appelle `API.exportOntologyByName(name, fmt)` et déclenche le téléchargement du blob résultant avec le nom de fichier `<name>.<ext>`. L'extension est déterminée selon le format : `owl` → `.owl`, `ttl` → `.ttl`, `swrl` → `.json`, `sword` → `.sword`.

---

### REQ-ONT-019 — Menu déroulant de sélection du format d'export {#req-ont-019}

**Code source :** `app.js` → `_ontoExportDropdown()`

La fonction construit et positionne dynamiquement un menu contextuel (`position:fixed`) ancré sous le bouton cliqué. Les options proposées dépendent du paramètre `kind` : pour `'onto'` les formats sont OWL (`.owl`) et Turtle (`.ttl`) ; pour `'rules'` les formats sont SWRL (`.json`) et SWORD (`.sword`). Un clic extérieur au menu le ferme automatiquement via un listener `click` sur `document`.

---

### REQ-ONT-020 — Export de l'ontologie couramment connectée {#req-ont-020}

**Code source :** `app.js` → `exportOntology()`

La fonction appelle `API.exportOntology(fmt)` (sans nom, donc pour l'ontologie connectée) et déclenche le téléchargement avec le nom générique `ontology.<ext>` (`.owl`, `.ttl`, ou `.jsonld` selon le format).

---

### REQ-ONT-021 — Affichage de l'arbre des imports avec expansion/repli {#req-ont-021}

**Code source :** `app.js` → `_refreshOntoTable()` (fonction interne `renderImportRows()`) et `toggleImportRow()`

Pour chaque ontologie du registre, ses imports déclarés (champ `imports`) sont rendus en sous-lignes indentées. Si un import possède lui-même des imports, un bouton `▶`/`▼` permet d'expand/réduire l'arbre. L'état d'expansion est mémorisé dans le `Set` `_ontoImportExpanded`. La détection de cycles est gérée par un paramètre `visited` passé récursivement. `toggleImportRow(path)` ajoute ou retire le chemin du `Set` puis rappelle `_refreshOntoTable()`.

---

### REQ-ONT-022 — Navigation vers une entrée du registre depuis l'arbre des imports {#req-ont-022}

**Code source :** `app.js` → `_scrollToRegistryRow()`

Lorsqu'un nœud de l'arbre des imports correspond à une ontologie connue du registre, un clic sur son nom appelle `_scrollToRegistryRow(name)`. Cette fonction localise la ligne `tr[data-name]` correspondante, la fait défiler en vue (`scrollIntoView`) et lui applique pendant 1,5 seconde un contour de couleur `var(--accent)` pour attirer l'attention visuelle.

---

### REQ-ONT-023 — Ouverture du répertoire dans le Finder {#req-ont-023}

**Code source :** `app.js` → `_refreshOntoTable()` (attribut `onclick` de la cellule Directory)

La cellule « Directory » de chaque ligne est rendue cliquable et appelle `API.revealInFinder(path)` au clic. En cas d'échec (notamment si `host_agent.py` n'est pas démarré), un message d'avertissement est affiché via `UI.warn()`.

---

### REQ-ONT-024 — Blocage des onglets d'édition en l'absence d'ontologie connectée {#req-ont-024}

**Code source :** `app.js` → `renderSection()`

Avant de rendre une section appartenant à la liste des onglets d'édition, la fonction vérifie `this.state.ontology`. Si aucune ontologie n'est connectée, la navigation vers ces onglets est bloquée et un message est affiché dans `#main-content` avec un bouton de renvoi vers l'onglet Ontologies (`APP.navigate('ontologies')`).

---

### REQ-ONT-025 — Calcul des racines virtuelles selon le préfixe de l'ontologie {#req-ont-025}

**Code source :** `app.js` → `getOntologyRootLabels()`

La fonction lit `this.state.ontology?.prefix`. Si le préfixe est `'rdf'` ou `'rdfs'`, elle retourne `{ classRoot: 'rdfs:Resource', propRoot: 'rdf:Property' }`. Dans tous les autres cas, elle retourne `{ classRoot: 'owl:Thing', propRoot: 'owl:topObjectProperty' }`. Ces labels sont utilisés comme racines virtuelles dans les arborescences de l'application.

---

### REQ-ONT-026 — Panneau wizard commutable (ouverture/fermeture) {#req-ont-026}

**Code source :** `app.js` → `_openWizard()` et `_closeWizard()`

`_openWizard(type)` vérifie si le panneau `#onto-wizard` affiche déjà le même type de wizard : si oui, il le masque (comportement bascule). Sinon, il définit `panel.dataset.type`, rend le panneau visible et injecte le HTML du formulaire correspondant (`_wizardNew()`, `_wizardImport()` ou `_wizardLoad()`). `_closeWizard()` masque le panneau et réinitialise `panel.dataset.type`.

---

### REQ-ONT-027 — Import implicite de OWL pour les ontologies utilisateur {#req-ont-027}

**Code source :** `app.js` → `_refreshOntoTable()`

Lors du rendu du tableau, si une ontologie utilisateur (non `readonly`) ne déclare aucun import explicite (tableau `imports` vide), la fonction lui substitue automatiquement la liste `['http://www.w3.org/2002/07/owl#']` pour le rendu de l'arbre des imports, reflétant l'import implicite de OWL.

---

*— claude-sonnet-4-6*
