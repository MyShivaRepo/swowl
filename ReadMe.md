# 🦉 SWOWL — OWL/SWRL Editor

![version](https://img.shields.io/badge/version-1.1.0-blue)

Web editor for **OWL** ontologies : classes, properties, individuals & **SWRL** rules.
GUI for visual **SPARQL** queries.

> **Current version: 1.1.0** — see the [CHANGELOG](CHANGELOG.md) for the full feature list.

## Getting started

### Prerequisites

- **Option A** — Docker Desktop (Docker Compose included), **or**
- **Option B** — Python 3.11+ (no Docker needed)

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

#### Option B — Native (Python venv, no Docker)

Runs the whole app in a single Python process — FastAPI serves both the API and the
static frontend, so **nginx and Docker are not required** (handy where Docker Desktop
is not allowed).

```bash
git clone https://github.com/MyShivaRepo/swowl.git
cd swowl
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
cd backend
uvicorn main:app --host 127.0.0.1 --port 8000
```

| Service        | URL                          |
|----------------|------------------------------|
| Interface      | http://127.0.0.1:8000        |
| API (Swagger)  | http://127.0.0.1:8000/docs   |

In native mode the app reads/writes your **real filesystem** directly; its config and
registry live under `~/.swowl`. Override with the `SWOWL_DIR` environment variable if
needed.

### First steps

New to SWOWL? The **[How to start](HowToStart.md)** guide walks you step by step
through the two ontology wizards:

- **New Ontology** — start from scratch with an empty ontology.
- **Import Ontology** — bring in an existing `.owl` / `.ttl` / `.rdf` file to
  visualise and edit.

## Features

- **OWL 2** — classes (subClassOf, equivalent, disjoint, restrictions), object/datatype
  properties (domain, range, characteristics, hierarchies), individuals and assertions.
- **Imports** — `owl:imports`: imported entities appear read-only, dimmed,
  with their prefix.
- **SWRL** — visual rule editor with live preview.
- **SPARQL** — visual query builder.
- **SKOS** — `skos:` annotations (prefLabel, altLabel, definition…) imported and editable.
- **Inference engine** — transitivity, restriction inheritance, types via
  domain/range, inverse, property chains, violation detection… (backend engine,
  available via the REST API `/api/inferences`).
- **Import / Export** — OWL/XML, Turtle, JSON-LD, SWORD (rules import/export).
- **Consistent UX** — homogeneous filter+tree pickers everywhere, global search,
  undo/redo, USER/SYSTEM ontology registry.

## Persistence

Complete ontologies (OWL + SWRL) are stored as **JSON** files referenced in `~/.swowl/registry.json`.
They are reloaded on each startup and remain on the host (outside the container).

## Technical architecture

Two Docker containers orchestrated by Compose:

| Layer     | Stack                                                                                      |
|-----------|--------------------------------------------------------------------------------------------|
| Frontend  | Nginx — **vanilla** HTML/CSS/JS (no framework, no build)                                    |
| Backend   | Python 3.11 — **FastAPI** + Uvicorn, **rdflib** (RDF parsing/serialization), **Pydantic** (OWL 2 models) |

- **Communication** — REST API; Nginx serves the static files and proxies `/api/` to the backend (Uvicorn, port 8000).
- **Model** — OWL 2 and SWRL entities are typed with Pydantic models; an rdflib triple store handles RDF import/export.
- **Inference** — in-house engine (forward chaining) on the backend, available via the REST API (`/api/inferences`); no dedicated UI tab.

## Structure

```
backend/    FastAPI API, OWL models, triple store, inference/serialization engines
frontend/   index.html, js/ (editors, app, api), css/
exigences/  requirements (specs per tab)
```
