# Journal des modifications

Toutes les modifications notables de **SWOWL** sont documentées dans ce fichier.
Le format s'appuie sur [Keep a Changelog](https://keepachangelog.com/),
et le projet suit le [versionnage sémantique](https://semver.org/).

> 🇬🇧 An English version of this file is available: [CHANGELOG.md](CHANGELOG.md).

## [1.2.1] — 2026-10-23

### Corrigé
- **Espaces de noms en « / »** (#11) : le séparateur réellement utilisé par les entités
  (`…/onto#Pair` ou `…/onto/Pair`) est détecté à l'import et conservé — avec l'IRI exacte
  de `owl:Ontology` — au lieu d'imposer `#`, ce qui réécrivait tous les IRI après un
  aller-retour. L'export, les références aux entités importées et l'*IRI complète*
  affichée dans les éditeurs en tiennent compte. Les ontologies à IRI en « / » importées
  avant la 1.2.1 doivent être ré-importées.
- **Chaînes de propriétés dans `/api/inferences`** (#13) : les chaînes sont évaluées sur
  une base de faits saturée (inverses, symétrie, sous-propriétés, transitivité et
  chaînes, jusqu'au point fixe) ; une chaîne peut donc passer par un fait inféré — par
  exemple l'inverse d'une propriété assertée — comme le faisait déjà la fiche individu.
  Les faits assertés ne sont plus rapportés comme inférés.

### Ajouté
- Tests `tests/roundtrip_namespace.py` (espace de noms en « / ») et
  `tests/test_inference_chains.py` (en mémoire, sans serveur).

## [1.2.0] — 2026-10-23

### Corrigé
- **Domaines et portées en union** (#10) : un domaine `owl:unionOf` est conservé comme
  union et exporté en un seul `rdfs:domain [ owl:unionOf … ]`. La 1.1.1 le dépliait en
  plusieurs triplets `rdfs:domain`, qu'OWL lit comme une **intersection** — le sens était
  inversé. Plusieurs classes simples gardent le sens d'intersection (défaut OWL) ; un
  **sélecteur ∩ / ∪** dans l'éditeur de propriété permet de choisir.
- **Contenus de restriction qui sont des expressions** (#15) : `∀ relatesTo.(Alpha ⊔ Beta)`
  n'est plus vidé en une restriction vraie pour n'importe quoi.
- **Équivalences construites par expression** (#9) : `Artefact ≡ Pair ⊓ ∃outputOf.Activity`
  est importée, affichée et exportée ; une classe nommée définie directement par
  `owl:unionOf` devient une équivalence.
- **Axiomes posés sur une classe importée** (#14) : conservés sous leur vrai IRI, y compris
  sous la forme `<rdf:Description>` produite par Protégé.
- **Éditeur de classe** : les expressions complexes sont affichées en lecture seule et
  **conservées à la sauvegarde** (l'autosave effaçait les expressions et les restrictions
  d'équivalence importées).
- **Inférence** : aucun type n'est inféré d'un domaine en union ; une violation de domaine
  n'est levée que si l'individu ne relève d'aucune classe de l'union.

### Ajouté
- **Avertissements d'import** : les constructions non représentables sont signalées
  (champ `import_warnings` de l'API, affiché après l'import) au lieu d'être réécrites ou
  ignorées en silence.
- Cas de non-régression E (équivalence par intersection contenant une restriction).

## [1.1.2] — 2026-10-23

### Sécurité
- **CORS limité aux origines locales** (`localhost`, `127.0.0.1`, `[::1]`) : l'API expose
  `/api/fs/browse`, qu'une page web quelconque ouverte dans le navigateur pouvait jusque-là
  interroger pour lister le disque (#17).

### Corrigé
- **Installation sous Python 3.13 / 3.14** : dépendances passées à des bornes basses
  récentes, plafonnées à la version majeure (pydantic ≥ 2.12 fournit des roues jusqu'à 3.14) ;
  `Query(enum=…)`, retiré de FastAPI 0.155, remplacé par `Literal[…]` (#16).
- **Export des identifiants préfixés** : les références vers des vocabulaires importés ou
  externes (`mi:Unit`, `dcterms:isPartOf`) sont re-développées vers leur vrai IRI au lieu
  d'être collées à l'espace de noms de l'ontologie (`…#mi:Unit`) (#12).

### Ajouté
- `tests/` : fixtures minimales d'aller-retour (fournies par Cyril) et script de
  non-régression `tests/roundtrip_cyril.py` couvrant les cas A à D.

### Problèmes connus
- Les domaines / portées en union sont encore écrits en plusieurs triplets `rdfs:domain`,
  qu'OWL lit comme une **intersection** (#10) ; les contenus de restriction qui sont des
  expressions de classe sont vidés (#15) ; les axiomes posés sur une classe importée peuvent
  être perdus (#14). Prévu pour la **1.2.0**.

## [1.1.1] — 2026-10-22

### Ajouté
- **Chaînes de propriétés** pour les object properties : éditeur, aller-retour RDF
  `owl:propertyChainAxiom`, et matérialisation par inférence.
- **Mode natif Python (venv)** — toute l'application tourne dans un seul processus
  FastAPI (API + frontend statique) ; ni Docker ni nginx requis.
- Onglet d'annotations **owl:Ontology** dans Settings, synchronisé avec le registre système.
- **Type de valeur d'annotation unifié** — sélecteur langue / datatype / IRI (issues #6 & #8).
- **Analyse de corpus (Agent interfacé)** : découpage par section, entités enrichies
  portant leurs relations, et règles SWRL fusionnées en une seule passe.
- **Onglet Analysis** : colonnes redimensionnables à la souris (mémorisées), *Text
  extract* refluant sur toute la largeur et toute la hauteur de ligne, auto-scroll
  vers le premier surlignage, et bouton *Reload from backend* toujours disponible.
- **Version centralisée** : source unique dans `backend/version.py`, exposée via
  `GET /api/version` ; le badge de l'app lit l'API et le badge README lit le
  dernier tag git ; `scripts/release.sh` incrémente et tague en une commande.

### Corrigé
- **Import** : les expressions `owl:unionOf` / `owl:intersectionOf` dans le `domain`
  / `range` d'une propriété sont désormais dépliées — les propriétés à domaine-union
  étaient auparavant perdues (domaine vide) et disparaissaient des arbres de classes.
- **Analysis** : forme correcte du `ref` de chunk (`doc` / `chapter`) ; labels et
  commentaires n'étaient plus perdus au merge agent ; texte complet du chunk mis en
  cache pour un surlignage sur toute la section ; re-merge robuste (marqueurs de
  restriction non hashables).
- **Barre du haut** : les ontologies système n'affichent que leur nom ; le sélecteur
  liste les registres User + System et ne plante plus sans ontologie utilisateur.
- **Portabilité** : chemins home indépendants de l'utilisateur, conteneur non-root ;
  URL du mode natif documentée en `127.0.0.1:8000`.

## [1.1.0] — 2026-06-19

### Sources (nouvel onglet, amovible)
- Nouvel onglet **Sources** (à droite de Settings, masquable via GUI Tabs) avec
  trois sous-onglets : **LLMs**, **Corpus**, **Analysis**.
- **LLMs** : configuration d'un fournisseur (**Anthropic**, **OpenAI**, **Meta**),
  saisie d'une **clé API** par fournisseur (stockée en `localStorage`, masquable)
  et **test** de la clé via un proxy backend `POST /api/llm/test` (évite le CORS ;
  la clé n'est ni stockée ni journalisée côté serveur).
- **Corpus** (par ontologie) : liste de documents **Name / Location** (chemin
  local via le **FsBrowser** → chemin absolu, ou URL Web), ajout / édition /
  suppression. Bouton **🔬 Analyse Corpus**.
- **Analyse Corpus → ontologie candidate** : `POST /api/corpus/analyse` parse chaque
  document (PDF, TXT/MD, HTML/URL, DOCX) section par section et extrait via **Claude**
  un modèle **OWL + règles SWRL** fusionnés dans l'ontologie connectée (marqués
  `swowl:candidate`). L'onglet **Analysis** affiche la **traçabilité** : chaque
  élément (ID navigable) et les **sections sources** (document — chapitre / page).

### Export
- **Export HTML** (bouton « ↓ HTML » dans l'onglet Ontologies) : génère une **page
  HTML autonome** (1 fichier) de l'ontologie connectée — Classes, ObjectProperties,
  DatatypeProperties, AnnotationProperties, Individuals, SWRL Rules — entièrement
  **navigable** (liens internes + sommaire) avec **recherche full-text**.
- L'export HTML reprend désormais le **look & feel de SWOWL** (onglets, fiches,
  panneaux), ajoute un onglet **Ontology (Network)** (graphe **D3.js** force-directed)
  et reproduit fidèlement les panneaux de **références croisées** des fiches
  (mêmes libellés que l'éditeur : *Properties and Restrictions*, *Where Used in
  Range*, *Disjoints*, *Equivalent*, *SubClassOf*…).

### Portée contextuelle des onglets
- Seul l'onglet **Ontologies** reste **global**. Les réglages des onglets
  **GUI Tabs**, **Languages**, **IDs Rules** et **LLMs** sont désormais
  **contextuels (par ontologie)** : clés `localStorage` suffixées par
  `::{nom_ontologie}` (repli sur la clé de base si aucune ontologie connectée).
- Le sélecteur d'ontologie de la barre supérieure redirige vers **Ontologies**
  si l'onglet actif est masqué dans l'ontologie cible.

### Suppressions & UI
- Suppression de l'onglet **Inferences** (nav + ligne dans GUI Tabs).
- Suppression de la sous-barre **SPARQL VizQ** : les requêtes s'affichent
  directement dans l'onglet **Queries** ; icône des requêtes : 🎯 → **🔎**.
- Barres d'outils homogénéisées via une classe CSS unique **`btn-tool`**
  (boutons carrés identiques, corbeille rouge) dans **SWRL Rules**, **Queries**
  et **Individuals** ; suppression désormais via un **bouton unique** dans la
  barre d'outils (plus de corbeille par ligne).
- Onglet **Analysis** : les puces des éléments extraits affichent l'**ID seul**.

### Robustesse
- **OpenAI** : nouvelle logique de **retry avec backoff** sur les erreurs HTTP
  **429** (lecture de l'en-tête `Retry-After`, repli exponentiel).

[1.1.0]: https://github.com/MyShivaRepo/swowl/releases/tag/v1.1.0

## [1.0.0] — 2026-06-15

Première version stable. Un éditeur web complet pour les ontologies **OWL 2 DL**
avec règles **SWRL**, requêtes **SPARQL** visuelles et moteur d'inférence temps réel.

### Édition OWL 2
- Classes — `subClassOf`, équivalence, disjonction, restrictions (someValuesFrom,
  allValuesFrom, hasValue, cardinalités), hiérarchie en arbre avec glisser-déposer.
- ObjectProperties / DatatypeProperties — domaine, portée (range), caractéristiques,
  hiérarchies `subPropertyOf`, inverse, chaînes de propriétés.
- Individus — assertions de type, valeurs de propriétés, sameAs / differentFrom.
- AnnotationProperties — sections d'espaces de noms `rdfs:`, `owl:` et **`skos:`**.
- Panneau **WHERE USED IN RANGE** — liste les ObjectProperties dont la portée est
  la classe sélectionnée, avec des contrôles pour rattacher une OP existante ou en
  créer une à la volée.

### SWRL
- Éditeur visuel de règles avec prévisualisation en direct et réordonnancement des
  atomes (poignée de glissement).
- **Import / export `.swd`** (format de règles lisible SWORD), avec préservation
  aller-retour de la négation NAF, des sous-règles conditionnelles, des atomes
  d'égalité et à classe vide ; dialogue de collision d'ID à l'import (remplacer /
  conserver / annuler). Le sélecteur de fichier d'import accepte n'importe quel
  fichier (contenu validé par l'analyseur).
- Les IDs de règles et les entités référencées dans les atomes (classes, OPs, DPs,
  individus) sont affichés avec leur préfixe — préfixe d'import contextuel pour les
  éléments importés, préfixe d'ontologie pour les natifs (préfixe sur l'ID, jamais
  sur le label).

### SPARQL (VizQ)
- Constructeur de requêtes visuel ; suppression de triplet via un `✕` rouge et
  réordonnancement par poignée des motifs (liste racine et blocs OPTIONAL).
- Le clic sur un individu dans les résultats le sélectionne complètement (arbre de
  classes + liste d'individus + formulaire).

### Views
- **Ontology (Hyperbolic)** — arbre hyperbolique animé sur disque de Poincaré en
  canvas (transformations de Möbius) : glisser pour déplacer, clic pour recentrer,
  double-clic pour éditer, survol pour mettre en évidence une sous-branche.
- **Ontology (TreeMap)** — treemap restylée : palette vive par branche, ombrage par
  profondeur, tuiles arrondies, survol, descente progressive (drill-down).
- **Ontology (Network)** — graphe force-directed : classes reliées par `subClassOf`,
  ObjectProperties en nœuds reliés à leurs classes via `rdfs:domain`/`rdfs:range`.
- **Knowledge Base** — graphe force-directed des individus.
- Barre latérale des sous-onglets redimensionnable.

### Import / Export
- OWL/XML, Turtle, JSON-LD, SWORD.
- Import des **annotations SKOS** (prefLabel, altLabel, definition, note…) et de
  `rdfs:seeAlso` dans les annotations de chaque entité.
- Import robuste : individus typés par une classe utilisateur (Protégé
  `<Class rdf:ID>`), `owl:equivalentClass` (nommé ou restriction), portées
  `owl:DataRange` anonymes ignorées.
- **owl:imports** émis à l'export RDF ; `peek` (« Lire préfixe, URI & imports depuis
  le fichier ») détecte les `owl:imports` déclarés et les espaces de noms référencés.
- Ontologies natives du W3C (RDF, RDFS, OWL, **SKOS**) récupérables depuis w3.org.

### Ontologies importées & espaces de noms
- **Section « Imported namespaces »** dans les assistants New / Import / Edit / Load
  (homogénéisée) : déclare chaque ontologie importée comme `owl:imports` avec un
  **préfixe contextuel** (préfixe → espace de noms), éditable, prérempli par `peek`.
- Le préfixe contextuel fait **autorité** pour l'affichage des entités importées
  (classes, OPs, DPs, individus, règles SWRL) — il prime sur le préfixe de registre
  propre à l'ontologie importée. L'espace de noms de base prime sur ceux importés
  lors de la résolution des ids natifs.
- Les sous-lignes d'import du registre affichent le préfixe contextuel ; la colonne
  espace de noms (URI) est cliquable (ouvre l'URI dans un nouvel onglet).

### Registre des ontologies
- Scindé en **USER REGISTRY** et un **SYSTEM REGISTRY** repliable (natifs W3C, triés
  alphabétiquement).
- Liens d'import scindés : clic sur le préfixe pour sélectionner l'ontologie, clic
  sur l'URI pour ouvrir sa page web.
- Désinscription avec suppression optionnelle du fichier sur disque.

### Inférence
- Moteur maison à chaînage avant : transitivité, héritage de restrictions, types via
  domaine/portée, inverse, chaînes de propriétés, détection de violations.

### UX
- Sélecteurs homogènes dans toute l'application — un champ **Filter** en haut et une
  présentation **en arbre** partout.
- Contrôles de suppression `✕` rouges cohérents, placés juste après l'élément qu'ils
  retirent.
- Préfixe d'affichage des entités piloté par le préfixe du registre (défini →
  `rohs:Part` ; vide → id local nu).
- Recherche globale, annuler/rétablir, historique de navigation, onglets masquables.

### Technique
- Frontend : Nginx + HTML/CSS/JS vanilla (sans framework, sans build).
- Backend : Python 3.11, FastAPI + Uvicorn, rdflib, Pydantic.
- Spécifications utilisateur bilingues sous `exigences/` (FR) et `requirements/` (EN).
- Suite de tests backend (`backend/tests`, pytest) — registre isolé : aller-retour
  import/export, préfixage `_lid` & priorité de base, aller-retour SWORD, individus
  typés par classe, equivalentClass, DataRange, export owl:imports.

[1.0.0]: https://github.com/MyShivaRepo/swowl/releases/tag/v1.0.0
