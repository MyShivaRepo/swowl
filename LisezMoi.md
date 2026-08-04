# 🦉 SWOWL — OWL/SWRL Editor

![version](https://img.shields.io/badge/version-1.1.0-blue)

Éditeur web d'ontologies **OWL** : classes, propriétés, individus & règles **SWRL**.
IHM pour les requêtes **SPARQL** visuelles.

> **Version actuelle : 1.1.0** — voir le [CHANGELOG](CHANGELOG.fr.md) pour la liste complète des fonctionnalités.

## Démarrage

### Pré-requis

- **Option A** — Docker Desktop (Docker Compose inclus), **ou**
- **Option B** — Python 3.11+ (sans Docker)

### Installation

#### Option A — Docker

```bash
git clone https://github.com/MyShivaRepo/swowl.git
cd swowl
docker compose up --build
```

| Service        | URL                          |
|----------------|------------------------------|
| Interface      | http://localhost:12345       |
| API (Swagger)  | http://localhost:8001/docs   |

#### Option B — Natif (venv Python, sans Docker)

Lance toute l'application dans un seul processus Python — FastAPI sert à la fois l'API
et le frontend statique, donc **ni nginx ni Docker ne sont requis** (pratique là où
Docker Desktop est interdit).

```bash
git clone https://github.com/MyShivaRepo/swowl.git
cd swowl
python3 -m venv .venv
source .venv/bin/activate          # Windows : .venv\Scripts\activate
pip install -r backend/requirements.txt
cd backend
uvicorn main:app --host 127.0.0.1 --port 8000
```

| Service        | URL                          |
|----------------|------------------------------|
| Interface      | http://127.0.0.1:8000        |
| API (Swagger)  | http://127.0.0.1:8000/docs   |

En mode natif, l'application lit/écrit directement votre **vrai système de fichiers** ;
sa configuration et son registre sont stockés sous `~/.swowl`. Surchargez ce dossier
via la variable d'environnement `SWOWL_DIR` si besoin.

### Premiers pas

Vous débutez avec SWOWL ? Le guide **[Comment démarrer](HowToStart.fr.md)** vous
accompagne pas à pas dans les deux assistants d'ontologie :

- **New Ontology** — partir de zéro avec une ontologie vide.
- **Import Ontology** — importer un fichier `.owl` / `.ttl` / `.rdf` existant
  pour le visualiser et l'éditer.

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
