# SWOWL — Software Requirements Specification

> Reverse-engineered from source code — version 1.0.0 — 2026-06-02

---

## 1. Présentation générale

**SWOWL** (SWRL + OWL) est un éditeur web d'ontologies OWL 2 DL avec support natif des règles SWRL et d'un moteur d'inférence en temps réel. L'application est entièrement containerisée (Docker Compose) et ne requiert aucune dépendance externe de type triplestore.

### 1.1 Objectifs

- Permettre la création, l'édition et la gestion d'ontologies OWL 2 via une interface web intuitive.
- Offrir un moteur d'inférence embarqué sans raisonneur externe (Pellet, HermiT, etc.).
- Supporter les règles SWRL (Semantic Web Rule Language) et SWORD (SWRL + Negation As Failure).
- Permettre l'import/export vers les formats standards RDF (OWL/XML, Turtle, JSON-LD).

### 1.2 Utilisateurs cibles

Ontologistes, ingénieurs de la connaissance, chercheurs en Web Sémantique.

---

## 2. Architecture technique

### 2.1 Vue d'ensemble

```
Navigateur
    │
    ▼
owl-editor-frontend  (Nginx · port 12345)
    │  reverse-proxy /api/*
    ▼
owl-editor-backend   (FastAPI/Python · port 8001 interne → 8000 container)
    │
    ▼
Système de fichiers  (./data/ontologies/*.json)
```

### 2.2 Stack technique

| Composant | Technologie |
|---|---|
| Frontend | HTML5 / CSS3 / JavaScript vanilla (SPA) |
| Serveur web | Nginx Alpine |
| Backend API | Python 3.11 · FastAPI · Pydantic v2 |
| Sérialisation RDF | rdflib |
| Persistance | Fichiers JSON (pas de base de données) |
| Containerisation | Docker Compose |

### 2.3 Ports

| Container | Port hôte | Port interne |
|---|---|---|
| `owl-editor-frontend` | 12345 | 80 |
| `owl-editor-backend` | 8001 | 8000 |

---

## 3. Modèle de données (OWL 2 DL)

### 3.1 Ontologie (`OWLOntology`)

| Champ | Type | Description |
|---|---|---|
| `id` | string | IRI de base (ex: `https://example.org/my-ontology`) |
| `prefix` | string | Préfixe local (défaut: `onto`) |
| `version` | string | Numéro de version (défaut: `1.0.0`) |
| `annotations` | EntityAnnotations | Labels, commentaires, annotations OWL 2 |
| `classes` | OWLClass[] | Liste des classes |
| `object_properties` | OWLObjectProperty[] | Propriétés objet |
| `datatype_properties` | OWLDatatypeProperty[] | Propriétés de données |
| `individuals` | OWLIndividual[] | Individus nommés |
| `swrl_rules` | SWRLRule[] | Règles SWRL |
| `sword_rules` | SWORDRule[] | Règles SWORD |

### 3.2 Classe OWL (`OWLClass`)

- `id` : IRI local
- `subClassOf` : liste d'expressions de classe (IRI, restrictions, expressions booléennes)
- `equivalentClass` : équivalences de classe
- `disjointWith` : disjonctions
- `annotations` : rdfs:label, rdfs:comment, autres

**Restrictions supportées :**
`someValuesFrom` · `allValuesFrom` · `hasValue` · `exactCardinality` · `minCardinality` · `maxCardinality`

**Expressions booléennes :**
`unionOf` · `intersectionOf` · `complementOf`

### 3.3 Propriété objet (`OWLObjectProperty`)

- `domain` / `range` : IRIs de classes
- `subPropertyOf` : hiérarchie de propriétés
- `inverseOf` : propriété inverse (synchronisation bidirectionnelle automatique)
- `characteristics` : `functional` · `inverseFunctional` · `transitive` · `symmetric` · `asymmetric` · `reflexive` · `irreflexive`
- `propertyChainAxiom` : chaînes de composition de propriétés

### 3.4 Propriété de données (`OWLDatatypeProperty`)

- `domain` / `range` : types XSD supportés (`xsd:string`, `xsd:integer`, `xsd:decimal`, `xsd:float`, `xsd:double`, `xsd:boolean`, `xsd:date`, `xsd:dateTime`, `xsd:duration`, `xsd:anyURI`, `xsd:nonNegativeInteger`, `xsd:positiveInteger`)
- `functional` : booléen

### 3.5 Individu (`OWLIndividual`)

- `types` : classes d'appartenance
- `objectAssertions` : assertions de propriétés objet
- `dataAssertions` : assertions de propriétés de données (avec datatype XSD)
- `sameAs` / `differentFrom` : identité entre individus

---

## 4. Fonctionnalités applicatives

### 4.1 Gestion des ontologies

| Fonctionnalité | Description |
|---|---|
| Création | Création d'une nouvelle ontologie (IRI, préfixe, version, label, description) |
| Import | Import de fichiers `.owl` (OWL/XML), `.ttl` (Turtle), `.rdf`, `.jsonld` |
| Export | Export vers OWL/XML, Turtle, JSON-LD |
| Triple Store | Gestion de plusieurs ontologies en parallèle dans le store |
| Chargement | Bascule entre ontologies stockées |
| Suppression | Suppression d'une ontologie du store |
| Persistance | Restauration automatique de la dernière ontologie active au démarrage |

### 4.2 Éditeur de classes

- Création / renommage / suppression de classes
- Renommage en cascade : propagation automatique dans toutes les références (subClassOf, restrictions, domaines de propriétés, types d'individus, règles SWRL)
- Suppression en cascade : suppression de toute la descendance
- Blocage de suppression si des individus utilisent la classe
- Définition de la hiérarchie (`subClassOf`), équivalences, disjonctions
- Ajout de restrictions OWL sur les propriétés
- Gestion des annotations (rdfs:label, rdfs:comment, owl:deprecated, etc.)

### 4.3 Éditeur de propriétés objet

- CRUD sur les Object Properties
- Gestion des caractéristiques logiques (7 caractéristiques OWL 2)
- Synchronisation automatique bidirectionnelle de `owl:inverseOf`
- Synchronisation domaine ↔ marqueurs UI dans les classes (`PropertyPresence`)
- Chaînes de propriétés (`owl:propertyChainAxiom`)

### 4.4 Éditeur de propriétés de données

- CRUD sur les Datatype Properties
- Sélection du type XSD pour le range
- Propagation du renommage en cascade

### 4.5 Éditeur d'individus

- Création avec normalisation automatique (espaces → underscores)
- Assertions de propriétés objet avec synchronisation inverse automatique
- Assertions de propriétés de données avec typage XSD
- Déclarations `sameAs` / `differentFrom`

### 4.6 Éditeur de règles SWRL

Règles de la forme **Corps → Tête** composées d'atomes :

| Type d'atome | Description |
|---|---|
| `ClassAtom` | `?x rdf:type ClassName` |
| `ObjectPropertyAtom` | `property(?x, ?y)` |
| `DataPropertyAtom` | `property(?x, ?val)` |
| `BuiltinAtom` | Fonctions `swrlb:*` |

**Builtins supportés :** `equal` · `notEqual` · `greaterThan` · `greaterThanOrEqual` · `lessThan` · `lessThanOrEqual` · `add` · `subtract` · `multiply` · `divide` · `abs` · `floor` · `ceiling` · `round` · `before` · `after` · `stringConcat` · `stringLength` · `matches` · `contains` · `upperCase` · `lowerCase`

### 4.7 Éditeur de règles SWORD

Extension de SWRL avec **Negation As Failure (NAF)** :

| Élément | Description |
|---|---|
| `SWORDTypeAtom` | `?var is a ClassName` |
| `SWORDPropertyAtom` | `?subject property ?object` (wildcard `?_`) |
| `SWORDEqualityAtom` | `?var = value` |
| `SWORDNAFBlock` | `NAF(atoms...)` — négation par échec |
| `SWORDConditional` | `if conditions then consequents` dans la tête |

### 4.8 Annotation Properties

Référence en lecture seule des propriétés d'annotation OWL 2 standard :
- `rdfs:label` · `rdfs:comment` · `rdfs:seeAlso` · `rdfs:isDefinedBy`
- `owl:versionInfo` · `owl:deprecated` · `owl:priorVersion` · `owl:backwardCompatibleWith` · `owl:incompatibleWith`

---

## 5. Moteur d'inférence

Le moteur d'inférence est embarqué (aucun raisonneur externe). Il s'exécute en temps réel à chaque requête sur `/api/inferences`.

### 5.1 Inférences implémentées

| # | Inférence | Description |
|---|---|---|
| 1 | **Fermeture transitive subClassOf** | Calcul de tous les ancêtres de chaque classe |
| 2 | **Héritage de restrictions** | Propagation des restrictions des super-classes vers les sous-classes |
| 3 | **Inférence de types** | Déduction du type d'un individu depuis le domaine/range d'une propriété utilisée |
| 4 | **Symétrie** | `prop(A,B)` → `prop(B,A)` si `owl:SymmetricProperty` |
| 5 | **Transitivité** | Fermeture transitive des assertions pour les `owl:TransitiveProperty` |
| 6 | **Réflexivité** | `prop(X,X)` pour tout individu si `owl:ReflexiveProperty` |
| 7 | **Chaînes de propriétés** | `p1(A,B) ∧ p2(B,C)` → `p(A,C)` via `owl:propertyChainAxiom` |
| 8 | **Inversion** | `prop(A,B)` → `invProp(B,A)` via `owl:inverseOf` |
| 9 | **Équivalence de classes** | `A ≡ B` → double `subClassOf` |
| 10 | **Restrictions inverses** | `C ⊑ ∃prop.D` + `prop inverseOf invProp` → `D ⊑ ∃invProp.C` |
| 11 | **Symétrie owl:inverseOf** | Si `A inverseOf B` déclaré, infère `B inverseOf A` |

### 5.2 Détection de violations

| Violation | Sévérité | Condition |
|---|---|---|
| Disjonction | `error` | Individu instance de deux classes déclarées disjointes |
| Domaine incohérent | `warning` | Individu utilise une propriété dont il ne satisfait pas le domaine |
| Propriété fonctionnelle | `error` | Individu avec plusieurs valeurs pour une propriété fonctionnelle |
| Propriété asymétrique | `error` | `prop(A,B)` et `prop(B,A)` coexistent pour une propriété asymétrique |
| Irréflexivité | `error` | `prop(X,X)` pour une propriété irréflexive |
| Cardinalité exacte | `warning` | Nombre de valeurs ≠ cardinalité attendue |
| sameAs + differentFrom | `error` | Contradiction `X sameAs Y` et `X differentFrom Y` simultanément |

### 5.3 Moteur SWRL (forward chaining)

- Évaluation par forward chaining sur les individus nommés
- Liaison de variables (`?x`, `?y`, etc.) par résolution d'atomes séquentielle
- Génération de descriptions textuelles des conséquences (mode explicatif)

---

## 6. API REST

Base URL : `http://localhost:8001/api`

### 6.1 Endpoints

| Méthode | Route | Description |
|---|---|---|
| GET | `/ontologies` | Lister les ontologies du store |
| POST | `/ontologies` | Créer une ontologie |
| GET | `/ontologies/current` | Obtenir l'ontologie active |
| PUT | `/ontologies/current` | Modifier les métadonnées de l'ontologie active |
| POST | `/ontologies/load/{iri}` | Charger une ontologie du store |
| DELETE | `/ontologies/{iri}` | Supprimer une ontologie |
| POST | `/ontologies/import` | Importer depuis un fichier RDF |
| GET | `/ontologies/export?fmt=owl\|ttl\|jsonld` | Exporter l'ontologie active |
| GET/POST/PUT/DELETE | `/classes[/{id}]` | CRUD Classes |
| GET/POST/PUT/DELETE | `/object-properties[/{id}]` | CRUD Object Properties |
| GET/POST/PUT/DELETE | `/datatype-properties[/{id}]` | CRUD Datatype Properties |
| GET/POST/PUT/DELETE | `/individuals[/{id}]` | CRUD Individus |
| GET/POST/PUT/DELETE | `/swrl-rules[/{id}]` | CRUD Règles SWRL |
| GET/POST/PUT/DELETE | `/sword-rules[/{id}]` | CRUD Règles SWORD |
| GET | `/inferences` | Calculer toutes les inférences |
| GET | `/inferences/violations` | Obtenir les violations |
| GET | `/inferences/subclass-closure` | Fermeture transitive subClassOf |
| GET | `/health` | Statut de l'application |

### 6.2 Documentation interactive

Disponible sur `http://localhost:8001/docs` (Swagger UI auto-généré par FastAPI).

---

## 7. Interface utilisateur

### 7.1 Structure de l'UI

L'interface est une **Single Page Application** (SPA) organisée en onglets :

```
[Ontologies] | [Classes] [ObjectProperties] [DatatypeProperties] [AnnotationProperties] [Individuals] | [SWRL Rules] [Inferences]
```

- **Topbar** : logo, boutons de navigation ◀ ▶, statistiques globales
- **Tab Nav** : navigation entre sections avec compteurs d'entités
- **Main content** : zone d'édition principale (vue divisée liste + détail)
- **Inference Sidebar** : panneau latéral d'inférences en temps réel (refresh automatique toutes les 4s)

### 7.2 Patterns d'UI récurrents

- **Vue divisée** (split view) : liste hiérarchique à gauche, formulaire de détail à droite
- **Navigation croisée** : liens cliquables entre entités (classe → propriété, individu → classe, etc.)
- **Historique de navigation** : boutons ◀ ▶ avec pile de 50 états max
- **Toast notifications** : messages de succès/erreur/avertissement (disparition après 3,5s)
- **Confirmation modale** : avant chaque suppression

---

## 8. Persistance des données

- Format de stockage : **JSON** (sérialisation Pydantic)
- Répertoire : `/app/data/ontologies/` (volume Docker monté sur `./data/ontologies/`)
- Nommage des fichiers : IRI encodée (ex: `example.org_my-ontology.json`)
- Fichier sentinelle `.last_ontology` : mémorise l'IRI de la dernière ontologie active
- Restauration automatique au démarrage du backend

---

## 9. Contraintes et comportements garantis

| Contrainte | Description |
|---|---|
| Unicité | Pas de doublon d'IRI pour classes, propriétés, individus, règles |
| Renommage cascade | Tout renommage d'entité est propagé à toutes ses références dans l'ontologie |
| Suppression cascade | Supprimer une classe supprime toute sa descendance |
| Blocage de suppression | Une classe utilisée par un individu ne peut pas être supprimée |
| Synchronisation inverseOf | La relation `owl:inverseOf` est toujours maintenue de façon bidirectionnelle |
| Synchronisation domain | L'ajout/retrait d'une classe du domaine d'une propriété est reflété dans les marqueurs UI de la classe |
| Espace → underscore | Les IRI d'individus sont normalisées (espaces remplacés par `_`) |
| Assertions inverses | La création/suppression d'une `ObjectPropertyAssertion` met à jour automatiquement l'assertion inverse |

---

## 10. Déploiement

### 10.1 Prérequis

- Docker Desktop ou Docker Engine + Docker Compose

### 10.2 Lancement

```bash
docker compose up --build -d
```

### 10.3 Accès

- Application : [http://localhost:12345](http://localhost:12345)
- API REST : [http://localhost:8001/api](http://localhost:8001/api)
- Documentation API : [http://localhost:8001/docs](http://localhost:8001/docs)

---

*Document généré par reverse engineering du code source — SWOWL v1.0.0*
