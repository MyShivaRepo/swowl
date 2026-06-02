# 🦉 OWL/SWRL Editor

Éditeur d'ontologies OWL 2 DL avec règles SWRL et moteur d'inférence basique.
Application Docker — frontend Nginx + backend FastAPI + triple store rdflib.

## Prérequis

- Docker Desktop (ou OrbStack)
- Docker Compose

## Lancement

```bash
# Cloner / dézipper le projet
cd owl-editor

# Builder et lancer
docker compose up --build

# L'application est disponible sur :
# http://localhost        ← Interface utilisateur
# http://localhost:8000   ← API FastAPI (Swagger : /docs)
```

## Structure du projet

```
owl-editor/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py              ← API FastAPI (27 endpoints)
│   ├── owl_model.py         ← Modèles Pydantic OWL 2
│   ├── triple_store.py      ← Triple store in-memory (rdflib)
│   ├── inference_engine.py  ← Moteur d'inférence (10 types)
│   ├── swrl_engine.py       ← Moteur SWRL (forward chaining)
│   └── serializers.py       ← Export OWL/XML, Turtle, JSON-LD
├── frontend/
│   ├── index.html
│   ├── nginx.conf
│   ├── js/
│   │   ├── api.js           ← Client HTTP
│   │   ├── owl_editor.js    ← Formulaires Classes/Propriétés/Individus
│   │   ├── swrl_editor.js   ← Formulaire règles SWRL
│   │   ├── inference_ui.js  ← Panneau inférences temps réel
│   │   └── app.js           ← Application principale
│   └── css/
│       └── style.css
└── data/
    └── ontologies/          ← Persistance JSON (volume Docker)
```

## Fonctionnalités

### OWL 2 complet
- **Classes** : subClassOf, equivalentClass, disjointWith, unionOf, intersectionOf, complementOf
- **Restrictions** : someValuesFrom, allValuesFrom, hasValue, exactCardinality, minCardinality, maxCardinality
- **ObjectProperty** : domain, range, subPropertyOf, inverseOf, propertyChainAxiom
  - Caractéristiques : Functional, InverseFunctional, Transitive, Symmetric, Asymmetric, Reflexive, Irreflexive
- **DatatypeProperty** : domain, range XSD, subPropertyOf, Functional
- **Individus** : rdf:type, assertions objet/données, sameAs, differentFrom

### Règles SWRL
- Atomes : ClassAtom, ObjectPropertyAtom, DataPropertyAtom, BuiltinAtom
- Builtins : comparaisons numériques, dates, strings
- Éditeur visuel avec prévisualisation syntaxique

### Moteur d'inférence (temps réel)
1. Fermeture transitive de subClassOf
2. Héritage de restrictions par sous-classes
3. Inférence de types via domain/range
4. Propriétés transitives
5. Propriétés symétriques
6. Propriétés réflexives
7. Chaînes de propriétés (propertyChainAxiom)
8. Inversion de propriétés (inverseOf)
9. Détection de violations (disjonction, cardinalité, asymétrie, irréflexivité)
10. Forward chaining SWRL sur individus nommés

### Import / Export
- Import : OWL/XML (.owl), Turtle (.ttl)
- Export : OWL/XML, Turtle, JSON-LD

## API

Documentation Swagger disponible sur `http://localhost:8000/docs`

Endpoints principaux :
- `POST /api/ontologies` — Créer une ontologie
- `POST /api/ontologies/import` — Importer un fichier
- `GET  /api/ontologies/export?fmt=owl|ttl|jsonld` — Exporter
- `GET  /api/inferences` — Calculer toutes les inférences
- `GET  /api/inferences/violations` — Violations uniquement
- CRUD complet sur `/api/classes`, `/api/object-properties`, `/api/datatype-properties`, `/api/individuals`, `/api/swrl-rules`

## Persistance

Les ontologies sont sauvegardées en JSON dans `./data/ontologies/`.
Ce répertoire est un volume Docker — les données persistent entre redémarrages.

## Importer l'ontologie RoHS

Si tu as le fichier `RoHS_Ontologie.owl` :
1. Ouvrir l'application sur http://localhost
2. Cliquer "📂 Importer .owl / .ttl"
3. Sélectionner `RoHS_Ontologie.owl`
4. IRI de base : `https://ontologies.example.org/rohs`
5. Préfixe : `rohs`
