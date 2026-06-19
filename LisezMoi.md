# 🦉 SWOWL — OWL/SWRL Editor

![version](https://img.shields.io/badge/version-1.1.0-blue)

Éditeur web d'ontologies **OWL 2 DL** : classes, propriétés, individus,
règles **SWRL**, requêtes **SPARQL** visuelles et moteur d'inférence backend.

> **Version actuelle : 1.1.0** — voir le [CHANGELOG](CHANGELOG.md) pour la liste complète des fonctionnalités.

Architecture : frontend Nginx (JS vanilla) + backend FastAPI + triple store rdflib,
le tout en Docker.

## Démarrage

### Pré-requis

- Docker Desktop (Docker Compose inclus)

### Installation

```bash
git clone https://github.com/MyShivaRepo/swowl.git
cd swowl
docker compose up --build
```

### Connexion

| Service        | URL                          |
|----------------|------------------------------|
| Interface      | http://localhost:12345       |
| API (Swagger)  | http://localhost:8001/docs   |

## Fonctionnalités

- **OWL 2** — classes (subClassOf, equivalent, disjoint, restrictions), object/datatype
  properties (domain, range, caractéristiques, hiérarchies), individus et assertions.
- **Imports** — `owl:imports` : les entités importées apparaissent en lecture seule,
  atténuées, avec leur préfixe.
- **SWRL** — éditeur visuel de règles avec prévisualisation.
- **SPARQL** — constructeur de requêtes visuel.
- **SKOS** — annotations `skos:` (prefLabel, altLabel, definition…) importées et éditables.
- **Moteur d'inférence** — transitivité, héritage de restrictions, types via
  domain/range, inverse, chaînes de propriétés, détection de violations…
  (moteur backend, accessible via l'API REST `/api/inferences`).
- **Import / Export** — OWL/XML, Turtle, JSON-LD, SWORD (import/export de règles).
- **UX cohérente** — sélecteurs filtre+arbre homogènes partout, recherche globale,
  undo/redo, registre d'ontologies USER/SYSTEM.

## Persistance

Les ontologies complètes (OWL + SWRL) sont stockées dans des fichiers **JSON** référencés dans `~/.swowl/registry.json`.
Elles sont relues à chaque démarrage et restent sur l'hôte (hors conteneur).

## Architecture technique

Deux conteneurs Docker orchestrés par Compose :

| Couche    | Stack                                                                                      |
|-----------|--------------------------------------------------------------------------------------------|
| Frontend  | Nginx — HTML/CSS/JS **vanilla** (sans framework ni build)                                   |
| Backend   | Python 3.11 — **FastAPI** + Uvicorn, **rdflib** (parsing/sérialisation RDF), **Pydantic** (modèles OWL 2) |

- **Communication** — API REST ; Nginx sert les fichiers statiques et relaie `/api/` vers le backend (Uvicorn, port 8000).
- **Modèle** — entités OWL 2 et SWRL typées via des modèles Pydantic ; un triple store rdflib gère l'import/export RDF.
- **Inférence** — moteur maison (forward chaining) côté backend, accessible via l'API REST (`/api/inferences`) ; plus d'onglet UI dédié.

## Structure

```
backend/    API FastAPI, modèles OWL, triple store, moteurs inférence/sérialisation
frontend/   index.html, js/ (éditeurs, app, api), css/
exigences/  expression du besoin (specs par onglet)
```

## API

Documentation interactive : http://localhost:8001/docs
