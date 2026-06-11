# 🦉 SWOWL — OWL/SWRL Editor

Web editor for **OWL 2 DL** ontologies: classes, properties, individuals,
**SWRL** rules, visual **SPARQL** queries, and a real-time inference engine.

Architecture: Nginx frontend (vanilla JS) + FastAPI backend + rdflib triple store,
all running in Docker.

## Getting started

### Prerequisites

- Docker Desktop (Docker Compose included)

### Installation

```bash
git clone https://github.com/MyShivaRepo/swowl.git
cd swowl
docker compose up --build
```

### Access

| Service        | URL                          |
|----------------|------------------------------|
| Interface      | http://localhost:12345       |
| API (Swagger)  | http://localhost:8001/docs   |

## Features

- **OWL 2** — classes (subClassOf, equivalent, disjoint, restrictions), object/datatype
  properties (domain, range, characteristics, hierarchies), individuals and assertions.
- **Imports** — `owl:imports`: imported entities appear read-only, dimmed,
  with their prefix.
- **SWRL** — visual rule editor with live preview.
- **SPARQL** — visual query builder (VizQ).
- **Real-time inference** — transitivity, restriction inheritance, types via
  domain/range, inverse, property chains, violation detection…
- **Import / Export** — OWL/XML, Turtle, JSON-LD, SWORD.

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
- **Inference** — in-house engine (forward chaining) on the backend, exposed to the interface in real time.

## Structure

```
backend/    FastAPI API, OWL models, triple store, inference/serialization engines
frontend/   index.html, js/ (editors, app, api), css/
exigences/  requirements (specs per tab)
```

## API

Interactive documentation: http://localhost:8001/docs
