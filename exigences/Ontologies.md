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
- [REQ-ONT-028 — Préfixe d'affichage des entités piloté par le préfixe du registre](#req-ont-028--préfixe-daffichage-des-entités-piloté-par-le-préfixe-du-registre)
- [REQ-ONT-031 — Préfixe contextuel faisant autorité pour les entités importées](#req-ont-031--préfixe-contextuel-faisant-autorité-pour-les-entités-importées)
- [REQ-ONT-032 — Lecture des namespaces référencés et des imports depuis un fichier](#req-ont-032--lecture-des-namespaces-référencés-et-des-imports-depuis-un-fichier)
- [REQ-ONT-033 — Déclaration des owl:imports à l'export RDF](#req-ont-033--déclaration-des-owlimports-à-lexport-rdf)
- [REQ-ONT-034 — Persistance des namespaces importés et dérivation des imports](#req-ont-034--persistance-des-namespaces-importés-et-dérivation-des-imports)

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
- [REQ-ONT-027 — Découpage du registre en sections Utilisateur et Système](#req-ont-027--découpage-du-registre-en-sections-utilisateur-et-système)
- [REQ-ONT-029 — Export des règles au format SWORD (.swd)](#req-ont-029--export-des-règles-au-format-sword-swd)
- [REQ-ONT-030 — Section « Imported namespaces » éditable dans les wizards](#req-ont-030--section--imported-namespaces--éditable-dans-les-wizards)
- [REQ-ONT-035 — Ouverture du namespace de l'ontologie depuis le registre](#req-ont-035--ouverture-du-namespace-de-lontologie-depuis-le-registre)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles OWL, contraintes de données, comportements algorithmiques, validations, persistance.


### REQ-ONT-001 — Tri des ontologies dans le registre

| **Si** | le registre des `ontologies` est consulté, |
|---|---|
| **Alors** | les `ontologies` de l'utilisateur apparaissent en premier, triées alphabétiquement, suivies des `ontologies` W3C en lecture seule, elles aussi triées par ordre alphabétique (`owl`, `rdf`, `rdfs`, `skos`). |

---

**Code source :** `app.js` → `_refreshOntoTable()` — Trie les ontologies utilisateur par ordre alphabétique (`localeCompare`), puis concatène les ontologies W3C `readonly` triées alphabétiquement (`owl` → `rdf` → `rdfs` → `skos`).

### REQ-ONT-002 — Auto-sélection de l'ontologie connectée

| **Si** | l'ontologiste ouvre l'onglet `Ontologies` sans avoir effectué de sélection manuelle au préalable, |
|---|---|
| **Alors** | l'`ontologie` actuellement connectée est automatiquement mise en évidence dans le registre, sans action supplémentaire de l'utilisateur. |

---

**Code source :** `app.js` → `renderOntologies()` — Si `_selectedOntoName` est nul, parcourt la liste des ontologies pour trouver celle dont `connected` est vrai et lui affecte `_selectedOntoName`, provoquant la mise en surbrillance visuelle de la ligne correspondante.

### REQ-ONT-003 — Création d'une nouvelle ontologie

| **Si** | l'ontologiste souhaite créer une nouvelle `ontologie` et renseigne son nom, son répertoire de stockage, son préfixe et l'URI de son espace de nommage, |
|---|---|
| **Alors** | l'`ontologie` est enregistrée dans le système ; si l'ontologiste le demande, elle est immédiatement connectée ; si l'un des champs obligatoires est absent, un message d'erreur est affiché et aucun enregistrement n'est effectué. |

---

**Code source :** `app.js` → `_doNew()` — Compose le chemin `<dir>/<name>.json`, appelle `API.registerOntology({ name, path, uri, prefix })` pour l'enregistrement ; si la case « Connect immediately » est cochée, enchaîne avec `API.connectOntology(name)` ; interrompt le traitement si `name`, `dir` ou `uri` est absent.

### REQ-ONT-004 — Import d'une ontologie OWL/TTL

| **Si** | l'ontologiste souhaite importer une `ontologie` existante depuis un fichier source (format OWL, Turtle ou RDF) et renseigne le nom cible, le répertoire de destination, le préfixe et l'URI, |
|---|---|
| **Alors** | le fichier est converti et enregistré dans le système ; si l'ontologiste ne demande pas de connexion immédiate, l'`ontologie` reste déconnectée ; si l'un des cinq champs obligatoires est absent, l'import est annulé. |

---

**Code source :** `app.js` → `_doImport()` — Compose le chemin de sauvegarde `<dir>/<name>.json`, appelle `API.importFromPath({ name, owl_path, save_path, uri, prefix })` ; si la case « Connect immediately » n'est pas cochée, appelle `API.disconnectOntology()` en complément ; interrompt si l'un des cinq champs est manquant.

### REQ-ONT-005 — Lecture automatique du préfixe et de l'URI depuis un fichier source

| **Si** | l'ontologiste sélectionne un fichier source lors d'un import et demande la lecture automatique de ses métadonnées, |
|---|---|
| **Alors** | le préfixe et l'URI de l'espace de nommage sont extraits du fichier et injectés dans le formulaire ; le nom de l'`ontologie` est également proposé si le champ est encore vide ; la section « Imported namespaces » est pré-remplie avec les namespaces référencés et les imports déclarés dans le fichier (voir REQ-ONT-032). |

---

**Code source :** `app.js` → `_wizardImportPeek()` — Appelle `API.peekOntology(src)` et injecte `info.prefix` et `info.uri` inconditionnellement dans les champs du formulaire ; `info.name` n'est injecté dans `wiz-import-name` que si ce champ est actuellement vide ; pour chaque entrée de `info.namespaces`, appelle `_wizImpAddNs(prefix, namespace)` pour pré-remplir la section « Imported namespaces ».

### REQ-ONT-006 — Chargement d'une ontologie JSON

| **Si** | l'ontologiste souhaite enregistrer dans le système une `ontologie` déjà sérialisée au format JSON et renseigne le fichier source, le nom, le préfixe et l'URI, |
|---|---|
| **Alors** | l'`ontologie` est enregistrée dans le registre ; si l'ontologiste le demande, elle est immédiatement connectée ; si le fichier source ou le nom est absent, le chargement est annulé. |

---

**Code source :** `app.js` → `_doLoad()` — Appelle `API.registerJson(src, name, uri, prefix)` ; si la case « Connect immediately » est cochée, enchaîne avec `API.connectOntology(name)` ; interrompt le traitement si `src` ou `name` est absent.

### REQ-ONT-007 — Lecture automatique des métadonnées depuis un fichier JSON

| **Si** | l'ontologiste sélectionne un fichier JSON lors du chargement et demande la lecture automatique de ses métadonnées, |
|---|---|
| **Alors** | le nom, le préfixe et l'URI de l'espace de nommage sont extraits du fichier et injectés dans les champs du formulaire, en remplaçant toute valeur précédemment saisie. |

---

**Code source :** `app.js` → `_wizardLoadPeek()` — Appelle `API.peekOntology(src)` et injecte `info.name`, `info.prefix` et `info.uri` dans les champs `wiz-load-name`, `wiz-load-prefix` et `wiz-load-uri`, en écrasant les valeurs existantes ; pour chaque entrée de `info.namespaces`, appelle `_wizImpAddNs(prefix, namespace, 'wiz-load-ns-list')` pour pré-remplir la section « Imported namespaces » (voir REQ-ONT-032).

### REQ-ONT-008 — Sauvegarde des modifications d'une ontologie

| **Si** | l'ontologiste modifie les attributs d'une `ontologie` déjà enregistrée (nom, répertoire, préfixe ou URI de l'espace de nommage) et confirme les changements, |
|---|---|
| **Alors** | le registre est mis à jour avec les nouvelles valeurs ; si l'un des champs obligatoires est absent, la sauvegarde est annulée. |

---

**Code source :** `app.js` → `doSaveEdit()` — Compose le nouveau chemin `<dir>/<name>.json` et appelle `API.updateOntologyEntry(origName, { name, path, uri, prefix })` ; interrompt si `name`, `dir` ou `uri` est absent.

### REQ-ONT-009 — Connexion et déconnexion d'une ontologie

| **Si** | l'ontologiste demande la connexion d'une `ontologie`, |
|---|---|
| **Alors** | cette `ontologie` devient l'`ontologie` de travail active, clairement identifiée dans le registre, et les onglets d'édition deviennent accessibles. |

| **Si** | l'ontologiste demande la déconnexion de l'`ontologie` courante, |
|---|---|
| **Alors** | aucune `ontologie` n'est plus active et les onglets d'édition deviennent inaccessibles jusqu'à une nouvelle connexion. |

---

**Code source :** `app.js` → `doConnect()` — Appelle `API.connectOntology(name)`, affiche un message de succès, appelle `this.refresh()` puis `renderOntologies()` ; la ligne reçoit la classe CSS `onto-current-row` et son indicateur passe au symbole `●` vert. `doDisconnect()` — Appelle `API.disconnectOntology()`, affiche un message de succès, appelle `this.refresh()` puis `renderSection(this.currentSection)`.

### REQ-ONT-010 — Désenregistrement d'une ontologie

| **Si** | l'ontologiste souhaite retirer une `ontologie` du registre et confirme l'opération, |
|---|---|
| **Alors** | l'`ontologie` disparaît du registre ; une case à cocher « supprimer le fichier » permet à l'ontologiste de demander en outre la suppression du fichier `.json` sous-jacent sur le disque ; si cette case n'est pas cochée, le fichier physique est conservé. |

---

**Code source :** `app.js` → `doUnregister()` — Affiche une boîte de dialogue de confirmation comportant une case à cocher « delete file » ; appelle `API.unregisterOntology(name)` pour retirer l'entrée du registre, et, si la case est cochée, demande la suppression du fichier `.json` sous-jacent sur le disque.

### REQ-ONT-011 — Téléchargement des ontologies W3C intégrées

| **Si** | l'ontologiste souhaite disposer des `ontologies` de référence W3C (RDF, RDFS, OWL et SKOS) dans le registre local, |
|---|---|
| **Alors** | le système télécharge et enregistre ces `ontologies` depuis les sources officielles (`w3.org`) et informe l'ontologiste du nombre d'`ontologies` effectivement récupérées. L'`ontologie` SKOS (préfixe `skos`, URI `http://www.w3.org/2004/02/skos/core#`) importe l'`ontologie` OWL de référence. |

---

**Code source :** `app.js` → `_fetchBuiltins()` — Désactive le bouton pendant l'opération, appelle `API.fetchBuiltins()`, compte les entrées dont le statut contient `'fetched'` pour construire le message de résultat, et réactive le bouton dans le bloc `finally`. Le bouton « Fetch W3C Ontologies » télécharge RDF, RDFS, OWL et SKOS depuis `w3.org` ; SKOS force un import de OWL.

### REQ-ONT-012 — Export d'une ontologie par nom (OWL/TTL/SWRL/SWORD)

| **Si** | l'ontologiste sélectionne une `ontologie` du registre et choisit un format d'export parmi les formats sémantiques disponibles, |
|---|---|
| **Alors** | le fichier correspondant est généré et proposé au téléchargement avec un nom de fichier reflétant le nom de l'`ontologie` et le format choisi. |

---

**Code source :** `app.js` → `exportOntologyByName()` — Appelle `API.exportOntologyByName(name, fmt)` et déclenche le téléchargement du blob avec le nom `<name>.<ext>` ; l'extension est déterminée par la correspondance : `owl` → `.owl`, `ttl` → `.ttl`, `swrl` → `.json`, `sword` → `.swd`.

### REQ-ONT-013 — Export de l'ontologie couramment connectée

| **Si** | l'ontologiste souhaite exporter l'`ontologie` sur laquelle il travaille actuellement en choisissant un format, |
|---|---|
| **Alors** | le fichier est généré et proposé au téléchargement sous un nom générique associé au format choisi. |

---

**Code source :** `app.js` → `exportOntology()` — Appelle `API.exportOntology(fmt)` sans nom explicite et déclenche le téléchargement avec le nom générique `ontology.<ext>` (`.owl`, `.ttl` ou `.jsonld` selon le format).

### REQ-ONT-014 — Blocage des onglets d'édition en l'absence d'ontologie connectée

| **Si** | l'ontologiste tente d'accéder à un onglet d'édition alors qu'aucune `ontologie` n'est connectée, |
|---|---|
| **Alors** | l'accès est refusé et un message guide l'ontologiste vers l'onglet `Ontologies` pour en connecter une. |

---

**Code source :** `app.js` → `renderSection()` — Vérifie que `this.state.ontology` n'est pas nul ; si c'est le cas, injecte dans `#main-content` un message d'avertissement avec un bouton appelant `APP.navigate('ontologies')`.

### REQ-ONT-015 — Calcul des racines virtuelles selon le préfixe de l'ontologie

| **Si** | l'ontologiste travaille sur une `ontologie` de bas niveau (RDF ou RDFS), |
|---|---|
| **Alors** | les arborescences de `classes` et de `propriétés` sont ancrées respectivement sur `rdfs:Resource` et `rdf:Property`, conformément à la sémantique de ces vocabulaires. |

| **Si** | l'ontologiste travaille sur toute autre `ontologie` (ou qu'aucune `ontologie` n'est connectée), |
|---|---|
| **Alors** | les arborescences de `classes` et de `propriétés` sont ancrées respectivement sur `owl:Thing` et `owl:topObjectProperty`, conformément aux conventions OWL. |

---

**Code source :** `app.js` → `getOntologyRootLabels()` — Teste le préfixe de l'ontologie connectée : si `'rdf'` ou `'rdfs'`, retourne `{ classRoot: 'rdfs:Resource', propRoot: 'rdf:Property' }` ; sinon retourne `{ classRoot: 'owl:Thing', propRoot: 'owl:topObjectProperty' }`.

### REQ-ONT-016 — Import implicite de OWL pour les ontologies utilisateur

| **Si** | une `ontologie` de l'utilisateur ne déclare aucun import explicite, |
|---|---|
| **Alors** | l'arbre des imports lui attribue automatiquement l'`ontologie` OWL de référence (`http://www.w3.org/2002/07/owl#`), reflétant l'import implicite inhérent à toute `ontologie` OWL. |

---

**Code source :** `app.js` → `_refreshOntoTable()` — Pour toute ontologie dont `readonly` est faux et dont le tableau `imports` est vide, substitue `['http://www.w3.org/2002/07/owl#']` comme liste d'imports pour le rendu de l'arbre.

### REQ-ONT-028 — Préfixe d'affichage des entités piloté par le préfixe du registre

| **Si** | une `ontologie` est connectée et que son préfixe est défini dans le registre (par exemple `rohs`), |
|---|---|
| **Alors** | ses entités (`classes`, `propriétés d'objet`, `propriétés de données`, `propriétés d'annotation` et `individus`) sont affichées préfixées par le préfixe du registre de l'`ontologie` connectée (celle affichée ou éditée dans l'onglet `Ontologies`), par exemple `rohs:Part`, `rohs:chromium`. |

| **Si** | le préfixe de registre de l'`ontologie` connectée est vide, |
|---|---|
| **Alors** | ses entités sont affichées sans aucun préfixe (identifiant local nu). |

| **Si** | un identifiant est déjà qualifié par un espace de nommage (`owl:Thing`, `xsd:decimal`, `rdfs:label`) ou correspond à une entité importée (affichée avec son propre préfixe d'import — voir REQ-ONT-031), |
|---|---|
| **Alors** | son affichage n'est pas affecté par le préfixe du registre. |

Le préfixe est purement une préoccupation d'affichage : le champ `id` éditable et l'attribut interne `data-id` conservent l'identifiant local nu.

---

**Code source :** `owl_editor.js` → `_displayId(entity)` — Lit `APP.state.ontology.prefix` pour préfixer l'identifiant local affiché des entités non qualifiées et non importées ; si le préfixe est vide, retourne l'identifiant local nu ; les identifiants déjà namespacés et les entités importées sont laissés inchangés. `main.py` → `get_current_ontology` — Rend le préfixe de l'entrée du registre faisant autorité (`onto.prefix = entry.prefix or ""`), écrasant la valeur figée au moment de l'import (qui pouvait différer, par exemple `model_rohs`).

### REQ-ONT-031 — Préfixe contextuel faisant autorité pour les entités importées

| **Si** | une `ontologie` importe une autre `ontologie` en lui attribuant un préfixe contextuel via la section « Imported namespaces » (voir REQ-ONT-030), |
|---|---|
| **Alors** | les entités issues de l'`ontologie` importée (`classes`, `propriétés d'objet`, `propriétés de données`, `individus`, `règles SWRL`) sont affichées avec ce préfixe contextuel, celui-ci primant sur le préfixe propre de l'`ontologie` importée dans le registre. |

| **Si** | aucun préfixe contextuel n'a été défini pour l'`ontologie` importée, |
|---|---|
| **Alors** | les entités importées sont affichées avec le préfixe de l'entrée de l'`ontologie` importée dans le registre. |

Le préfixe contextuel est mémorisé dans `import_labels` de l'entrée importatrice (registre et fichier `.json`) et alimente le mécanisme réel d'import (`owl:imports`). Les sous-lignes d'import du registre affichent également ce préfixe contextuel.

---

**Code source :** `main.py` → `get_imported_entities` — Pour chaque URI importée, le préfixe d'affichage est `_importPrefix = import_labels[uri].prefix` (préfixe contextuel) s'il est défini, sinon le `prefix` de l'entrée du registre de l'`ontologie` importée (`imp_entry.prefix`). `triple_store.py` → `_imports_from_ns()` dérive `imports` et `import_labels` à partir des `ns_prefixes` saisis dans le wizard.

### REQ-ONT-032 — Lecture des namespaces référencés et des imports depuis un fichier

| **Si** | l'ontologiste demande la lecture des métadonnées d'un fichier (`peek`) lors d'un import ou d'un chargement, |
|---|---|
| **Alors** | le système retourne, en plus du nom, du préfixe et de l'URI de base, la liste des `namespaces` = les bindings `xmlns` référencés (hors standards `owl`, `rdf`, `rdfs`, `xsd` et hors URI de base) ainsi que les `owl:imports` déclarés, chacun assorti d'un préfixe. |

Pour un import déclaré, le préfixe proposé est dérivé d'un binding `xmlns` correspondant, à défaut du dernier segment de l'URI.

---

**Code source :** `main.py` → `peek_ontology()` — Pour `.owl`/`.ttl`, parse le graphe RDF avec `bind_namespaces="none"` (aucun namespace par défaut de rdflib injecté), collecte les bindings `xmlns` non standards et les `owl:imports`. Pour `.json`, lit `imports`, `import_labels` et `ns_prefixes`. Le résultat est exposé sous la clé `namespaces`.

### REQ-ONT-033 — Déclaration des owl:imports à l'export RDF

| **Si** | l'ontologiste exporte une `ontologie` au format RDF (`.owl` ou `.ttl`) et que cette `ontologie` déclare des imports, |
|---|---|
| **Alors** | le fichier exporté contient une déclaration `<owl:imports rdf:resource="…"/>` pour chaque `ontologie` importée, accompagnée d'un binding de préfixe pour la lisibilité. |

---

**Code source :** `triple_store.py` → `to_rdf_graph()` — Pour chaque URI dans `onto.imports`, ajoute le triplet `(onto_uri, OWL.imports, URIRef(imp_uri))` et lie le préfixe correspondant (issu de `import_labels`) au graphe.

### REQ-ONT-034 — Persistance des namespaces importés et dérivation des imports

| **Si** | une `ontologie` est enregistrée, chargée depuis un JSON ou mise à jour avec une liste de namespaces importés (`ns_prefixes`), |
|---|---|
| **Alors** | cette liste est persistée dans le champ `ns_prefixes` de l'`ontologie`, et les `imports` ainsi que les `import_labels` en sont dérivés (chaque namespace devient un `owl:imports` portant son préfixe contextuel). |

---

**Code source :** `owl_model.py` → `OWLOntology.ns_prefixes` (champ persisté, `[{prefix, namespace}]`). `triple_store.py` → `register()`, `register_json` (via `update_entry`/`register`) et `update_entry()` acceptent `ns_prefixes` et appellent `_imports_from_ns()` pour dériver `imports`/`import_labels`. `main.py` → `register_json()` reçoit désormais un corps JSON (`RegisterJsonRequest`) au lieu de paramètres de requête.

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

### REQ-ONT-017 — Affichage de l'onglet Ontologies

| **Si** | l'ontologiste navigue vers l'onglet `Ontologies`, |
|---|---|
| **Alors** | la page affiche un en-tête, les actions disponibles (créer, importer, charger, télécharger les `ontologies` W3C), un panneau de saisie assistée initialement masqué, et le tableau du registre avec les colonnes Nom, Répertoire, Préfixe et Espace de nommage. |

---

**Code source :** `app.js` → `renderOntologies()` — Injecte dans `#main-content` la structure HTML complète via `_renderOntologiesShell()` (en-tête, quatre boutons d'action, panneau `#onto-wizard` masqué, tableau avec colonnes Name / Directory / Prefix / Namespace), puis déclenche le chargement asynchrone du registre.

### REQ-ONT-018 — Chargement et affichage du registre

| **Si** | l'onglet `Ontologies` est affiché, |
|---|---|
| **Alors** | la liste de toutes les `ontologies` enregistrées est chargée et affichée dans le tableau ; si le chargement échoue, un message d'erreur est affiché à la place du tableau. |

---

**Code source :** `app.js` → `renderOntologies()` et `_refreshOntoTable()` — Appelle `API.listOntologies()` pour obtenir la liste, génère les lignes HTML via `_refreshOntoTable()` ; en cas d'erreur API, affiche « Unable to load the registry. » dans le corps du tableau.

### REQ-ONT-019 — Sélection d'une ligne du registre

| **Si** | l'ontologiste clique sur une `ontologie` dans le tableau du registre, |
|---|---|
| **Alors** | la ligne sélectionnée est visuellement mise en évidence et toute sélection précédente est annulée. |

---

**Code source :** `app.js` → `selectOntoRow()` — Mémorise le nom dans `_selectedOntoName`, retire la classe CSS `onto-selected-row` de toutes les lignes et l'applique à la ligne correspondante au nom sélectionné.

### REQ-ONT-020 — Affichage du compteur d'ontologies

| **Si** | le registre est chargé, |
|---|---|
| **Alors** | le nombre total d'`ontologies` enregistrées est affiché, avec un libellé correctement accordé au singulier ou au pluriel. |

---

**Code source :** `app.js` → `_refreshOntoTable()` — Met à jour le contenu de `#onto-registry-count` avec le texte « N ontology » ou « N ontologies » en fonction du nombre d'entrées retournées par `API.listOntologies()`.

### REQ-ONT-021 — Édition des attributs d'une ontologie existante

| **Si** | l'ontologiste souhaite modifier les attributs d'une `ontologie` déjà enregistrée, |
|---|---|
| **Alors** | un formulaire pré-rempli avec les valeurs actuelles (nom, répertoire, préfixe, URI) s'ouvre pour lui permettre d'effectuer ses modifications, et le répertoire peut être sélectionné via un navigateur de fichiers. |

---

**Code source :** `app.js` → `doEditOntology()` — Appelle `API.listOntologies()` pour retrouver l'entrée, ouvre le panneau wizard en mode `'edit'`, injecte un formulaire pré-rempli avec les valeurs actuelles, conserve le nom original dans le champ caché `wiz-edit-orig` et initialise `FsBrowser` pour la sélection du répertoire.

### REQ-ONT-022 — Menu déroulant de sélection du format d'export

| **Si** | l'ontologiste souhaite exporter une `ontologie` ou un ensemble de règles et clique sur le bouton d'export, |
|---|---|
| **Alors** | un menu contextuel présente les formats disponibles selon le type de contenu à exporter (formats OWL et Turtle pour une `ontologie` ; formats SWRL et SWORD pour des règles) ; un clic en dehors du menu le referme. |

---

**Code source :** `app.js` → `_ontoExportDropdown()` — Construit et positionne dynamiquement un menu contextuel en `position:fixed` ancré sous le bouton ; les options dépendent du paramètre `kind` : `'onto'` → OWL (`.owl`) et Turtle (`.ttl`) ; `'rules'` → SWRL (`.json`) et SWORD (`.swd`) ; un listener `click` sur `document` ferme le menu lors d'un clic extérieur.

### REQ-ONT-023 — Affichage de l'arbre des imports avec expansion/repli

| **Si** | le registre est affiché et qu'une `ontologie` déclare des imports, |
|---|---|
| **Alors** | les `ontologies` importées sont affichées en sous-lignes indentées ; si un import possède lui-même des sous-imports, l'ontologiste peut développer ou réduire ce nœud de l'arbre ; les cycles d'import sont détectés et ne provoquent pas de boucle infinie. |

---

**Code source :** `app.js` → `_refreshOntoTable()` (fonction interne `renderImportRows()`) et `toggleImportRow()` — Les imports sont rendus récursivement avec un paramètre `visited` pour la détection de cycles ; l'état d'expansion est mémorisé dans le `Set` `_ontoImportExpanded` ; `toggleImportRow(path)` ajoute ou retire le chemin du `Set` puis rappelle `_refreshOntoTable()`.

### REQ-ONT-024 — Navigation vers une entrée du registre depuis l'arbre des imports

| **Si** | dans l'arbre des imports d'une `ontologie`, l'ontologiste clique sur le **préfixe** d'une `ontologie` importée, |
|---|---|
| **Alors** | la ligne correspondante dans le tableau du registre est sélectionnée, mise en évidence visuellement et défilée en `vue`, afin que l'ontologiste puisse la retrouver facilement. |

| **Si** | dans l'arbre des imports d'une `ontologie`, l'ontologiste clique sur l'**URI** d'une `ontologie` importée, |
|---|---|
| **Alors** | la page web correspondante est ouverte dans un nouvel onglet du navigateur. |

---

**Code source :** `app.js` → `_scrollToRegistryRow()` — Chaque lien de l'arbre des imports est scindé en deux parties cliquables : le **préfixe** appelle `_scrollToRegistryRow()`, qui localise la ligne `tr[data-name]` correspondante, la sélectionne, appelle `scrollIntoView()` et lui applique pendant 1,5 seconde un contour de couleur `var(--accent)` ; l'**URI** ouvre la page web correspondante dans un nouvel onglet (`target="_blank"`).

### REQ-ONT-025 — Ouverture du répertoire dans le Finder

| **Si** | l'ontologiste clique sur le répertoire d'une `ontologie` dans le tableau, |
|---|---|
| **Alors** | le répertoire de stockage de cette `ontologie` est ouvert dans le gestionnaire de fichiers du système ; si cette action échoue, un message d'avertissement est affiché. |

---

**Code source :** `app.js` → `_refreshOntoTable()` (attribut `onclick` de la cellule Directory) — Appelle `API.revealInFinder(path)` ; en cas d'échec (notamment si `host_agent.py` n'est pas démarré), affiche un avertissement via `UI.warn()`.

### REQ-ONT-026 — Panneau wizard commutable (ouverture/fermeture)

| **Si** | l'ontologiste clique sur un bouton d'action et que le panneau de saisie assistée affiche déjà le formulaire correspondant à cette action, |
|---|---|
| **Alors** | le panneau se referme (comportement bascule). |

| **Si** | l'ontologiste clique sur un bouton d'action et que le panneau affiche un formulaire différent ou est fermé, |
|---|---|
| **Alors** | le panneau s'ouvre et affiche le formulaire correspondant à l'action demandée (créer, importer ou charger une `ontologie`). |

---

**Code source :** `app.js` → `_openWizard()` et `_closeWizard()` — `_openWizard()` compare le type demandé avec `panel.dataset.type` : si identique, appelle `_closeWizard()` ; sinon, définit `panel.dataset.type`, rend le panneau visible et injecte le HTML du formulaire via `_wizardNew()`, `_wizardImport()` ou `_wizardLoad()`. `_closeWizard()` masque le panneau et réinitialise `panel.dataset.type`.

### REQ-ONT-027 — Découpage du registre en sections Utilisateur et Système

| **Si** | le registre des `ontologies` est affiché, |
|---|---|
| **Alors** | il est divisé en deux sections : une section « USER REGISTRY » regroupant les `ontologies` chargées ou créées par l'utilisateur, et une section « SYSTEM REGISTRY » regroupant les `ontologies` W3C intégrées (`rdf`, `rdfs`, `owl`, `skos`). |

| **Si** | l'ontologiste clique sur l'en-tête de la section « SYSTEM REGISTRY », |
|---|---|
| **Alors** | cette section se replie ou se déploie (comportement bascule), un chevron indiquant son état ; un compteur affiche le nombre d'`ontologies` système qu'elle contient. |

---

**Code source :** `app.js` → `_refreshOntoTable()` — Répartit les lignes en deux sections distinctes : « USER REGISTRY » pour les ontologies dont `readonly` est faux, « SYSTEM REGISTRY » pour les ontologies W3C `readonly`. L'en-tête de la section système est repliable via un chevron et affiche un compteur du nombre d'entrées système.

### REQ-ONT-029 — Export des règles au format SWORD (.swd)

| **Si** | l'ontologiste ouvre le menu d'export « Rules » dans l'onglet `Ontologies`, |
|---|---|
| **Alors** | le menu propose l'option `↓ SWORD (.swd)` et le fichier exporté utilise l'extension `.swd`. |

L'identifiant interne du format d'export (`fmt: 'sword'`) reste inchangé ; seules l'étiquette du menu et l'extension du fichier généré passent de `.sword` à `.swd`.

---

**Code source :** `app.js` → menu déroulant d'export (`_ontoExportDropdown()`) et `exportOntologyByName()` — L'option de règles affiche désormais `↓ SWORD (.swd)` et le téléchargement utilise l'extension `.swd` ; le format interne transmis à l'API (`fmt: 'sword'`) est conservé.

### REQ-ONT-030 — Section « Imported namespaces » éditable dans les wizards

| **Si** | l'ontologiste ouvre l'un des wizards d'`ontologie` (Nouveau, Import, Édition ou Chargement), |
|---|---|
| **Alors** | une section « Imported namespaces » éditable est présentée sous forme d'un tableau de lignes (préfixe → namespace), avec un bouton `+ namespace` pour ajouter une ligne et un contrôle `✕` pour la retirer ; chaque ligne déclare une `ontologie` importée (`owl:imports`) assortie d'un préfixe contextuel choisi par l'ontologiste. |

| **Si** | l'ontologiste utilise un wizard d'Import ou de Chargement et clique sur « Read prefix, URI &amp; imports from file », |
|---|---|
| **Alors** | la section « Imported namespaces » est pré-remplie à partir des namespaces lus dans le fichier (voir REQ-ONT-032). |

Les wizards d'Import et de Chargement sont homogénéisés (mêmes sections, mêmes libellés, même présentation des boutons).

---

**Code source :** `app.js` → `_wizImpAddNs()`, `_wizImpCollectNs()` et les rendus de wizard (`_wizardNew()`, `_wizardImport()`, `_wizardLoad()`, formulaire d'édition de `doEditOntology()`) — Chaque wizard contient une liste de lignes `prefix → namespace` (`wiz-new-ns-list`, `wiz-import` par défaut, `wiz-load-ns-list`, `wiz-edit-ns-list`) avec boutons `+ namespace` / `✕` ; `_wizImpCollectNs()` collecte les lignes valides en `ns_prefixes` transmis à `registerOntology` / `importFromPath` / `registerJson` / `updateOntologyEntry`.

### REQ-ONT-035 — Ouverture du namespace de l'ontologie depuis le registre

| **Si** | l'ontologiste clique sur l'espace de nommage (URI, 4ᵉ colonne) d'une `ontologie` dans le tableau du registre, |
|---|---|
| **Alors** | l'URI du namespace est ouverte dans un nouvel onglet du navigateur. |

| **Si** | l'URI de l'espace de nommage de l'`ontologie` est vide, |
|---|---|
| **Alors** | la cellule affiche un tiret `—` et n'est pas cliquable. |

---

**Code source :** `app.js` → `_refreshOntoTable()` (fonction `renderRow`) — La cellule Namespace est rendue comme un `<code class="onto-ns-link">` cliquable dont le `onclick` appelle `window.open(uri, '_blank', 'noopener')` (avec `event.stopPropagation()` pour ne pas sélectionner la ligne) ; si l'URI est vide, affiche `—`.
