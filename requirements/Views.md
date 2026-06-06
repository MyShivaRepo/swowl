# Requirements — Views

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-VW-003 — Building the hierarchical class tree](#req-vw-003--building-the-hierarchical-class-tree)
- [REQ-VW-004 — Resolving the best class label](#req-vw-004--resolving-the-best-class-label)
- [REQ-VW-005 — Hyperbolic placement algorithm (Poincaré disk)](#req-vw-005--hyperbolic-placement-algorithm-poincaré-disk)
- [REQ-VW-007 — Node click: centering via Möbius transformation](#req-vw-007--node-click-centering-via-möbius-transformation)
- [REQ-VW-008 — Double-click (second click at center): navigation to the class editor](#req-vw-008--double-click-second-click-at-center-navigation-to-the-class-editor)
- [REQ-VW-009 — Resetting focus to the root](#req-vw-009--resetting-focus-to-the-root)
- [REQ-VW-010 — Filtering classes by text in the hyperbolic graph](#req-vw-010--filtering-classes-by-text-in-the-hyperbolic-graph)
- [REQ-VW-013 — Building nodes (individuals) and links (assertions)](#req-vw-013--building-nodes-individuals-and-links-assertions)
- [REQ-VW-014 — Color palette by class](#req-vw-014--color-palette-by-class)
- [REQ-VW-015 — Resolving the best individual label](#req-vw-015--resolving-the-best-individual-label)
- [REQ-VW-020 — Individual node click: navigation to the individual editor](#req-vw-020--individual-node-click-navigation-to-the-individual-editor)
- [REQ-VW-022 — Drag and drop of nodes in the Knowledge Base graph](#req-vw-022--drag-and-drop-of-nodes-in-the-knowledge-base-graph)
- [REQ-VW-023 — D3 force simulation with configured parameters](#req-vw-023--d3-force-simulation-with-configured-parameters)
- [REQ-VW-024 — Restarting the force simulation](#req-vw-024--restarting-the-force-simulation)
- [REQ-VW-025 — Filtering individuals by text in the Knowledge Base graph](#req-vw-025--filtering-individuals-by-text-in-the-knowledge-base-graph)
- [REQ-VW-027 — Blocking the Views tab if no ontology is connected](#req-vw-027--blocking-the-views-tab-if-no-ontology-is-connected)
- [REQ-VW-028 — Deferred graph initialization after HTML rendering](#req-vw-028--deferred-graph-initialization-after-html-rendering)

### Form
- [REQ-VW-001 — Rendering the Views tab with sub-tabs](#req-vw-001--rendering-the-views-tab-with-sub-tabs)
- [REQ-VW-002 — "Ontology" sub-tab: D3 hyperbolic tree](#req-vw-002--ontology-sub-tab-d3-hyperbolic-tree)
- [REQ-VW-006 — SVG drawing of nodes and edges with proportional opacity and size](#req-vw-006--svg-drawing-of-nodes-and-edges-with-proportional-opacity-and-size)
- [REQ-VW-011 — Class counter displayed in the toolbar](#req-vw-011--class-counter-displayed-in-the-toolbar)
- [REQ-VW-012 — "Knowledge Base" sub-tab: D3 force graph](#req-vw-012--knowledge-base-sub-tab-d3-force-graph)
- [REQ-VW-016 — Class legend in the Knowledge Base graph](#req-vw-016--class-legend-in-the-knowledge-base-graph)
- [REQ-VW-017 — SVG arrowheads on directional edges](#req-vw-017--svg-arrowheads-on-directional-edges)
- [REQ-VW-018 — Zoom and pan on the Knowledge Base graph](#req-vw-018--zoom-and-pan-on-the-knowledge-base-graph)
- [REQ-VW-019 — Property labels on edges](#req-vw-019--property-labels-on-edges)
- [REQ-VW-021 — Node hover: connection highlighting](#req-vw-021--node-hover-connection-highlighting)
- [REQ-VW-026 — Individual and connection counter](#req-vw-026--individual-and-connection-counter)

---

## 1. Substance — Business logic and functional rules

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviors, validations, persistence.


### REQ-VW-003 — Building the hierarchical class tree

**If** the ontology is loaded and contains classes in `APP.state.classes`,

**Then** the system:
- builds a `classMap` indexed by `id` for each class
- computes for each class its parents via `subClassOf`
- promotes classes with no internal parent to root rank under a virtual node `owl:Thing`
- recursively builds the hierarchy via `buildNode(id, depth)`, each node exposing the properties `{ id, depth, label, hpos, basePos, children }`

---

**Source code:** `app.js` → `APP._initHyperbolicGraph()`

### REQ-VW-004 — Resolving the best class label

**If** the system must display the label of a class,

**Then**:
- it searches in `cls.annotations` for an annotation `rdfs:label` or `label` matching `Settings.preferredLang`
- if no match is found, it takes the first available `rdfs:label` annotation
- if no annotation exists, it returns `cls.id`

---

**Source code:** `app.js` → `APP._hypBestLabel(cls)`

### REQ-VW-005 — Hyperbolic placement algorithm (Poincaré disk)

**If** the hierarchical class tree is built and must be rendered in the Poincaré disk,

**Then** the system:
- uses the constant `STEP_R = Math.tanh(0.4)` to define the spacing between levels
- distributes the children of each node into equal angular sectors via `layoutNode(node, pos, angle, wedge)`
- performs hyperbolic translations via `mobiusTranslate(z, a)` (Möbius transformation)
- exposes the complex helpers (`cadd`, `csub`, `cmul`, `cconj`, `cdiv`, `polar`) in `APP._hypMath`

---

**Source code:** `app.js` → `APP._initHyperbolicGraph()` (internal functions `layoutNode`, `cadd`, `csub`, `cmul`, `cconj`, `cabs`, `cdiv`, `polar`, `mobiusFocus`, `mobiusTranslate`)

### REQ-VW-007 — Node click: centering via Möbius transformation

**If** the user clicks on a node in the hyperbolic graph
**and** the distance of that node from the center is greater than 0.02,

**Then** the system:
- computes `mobiusFocus(n.hpos, a)` for each node in the tree in order to bring the clicked node toward the center of the disk
- calls `APP._hypDraw(true)` to animate the transition

---

**Source code:** `app.js` → `APP._hypClick(node)`

### REQ-VW-008 — Double-click (second click at center): navigation to the class editor

**If** the user clicks on a node whose distance from the center is less than 0.10
**and** the `id` of that node is not `'owl:Thing'`,

**Then** the system:
- calls `APP.navigate('classes')`
- after 80 ms, sets `ClassEditor._selectedId = node.id` and calls `ClassEditor.restoreSelection()` to directly open the edit form for the corresponding class

---

**Source code:** `app.js` → `APP._hypClick(node)`

### REQ-VW-009 — Resetting focus to the root

**If** the user triggers a reset of the hyperbolic graph,

**Then** the system copies `basePos` into `hpos` for all nodes in `APP._hypNodes`, restoring the initial layout positions, then calls `APP._hypDraw(true)` to animate the return.

---

**Source code:** `app.js` → `APP._hypReset()`

### REQ-VW-010 — Filtering classes by text in the hyperbolic graph

**If** the user types a filter query in the dedicated field of the hyperbolic graph,

**Then**:
- each node whose `label` or `id` contains the query (case-insensitive) receives a green stroke (`#10b981`) and a label colored `#6ee7b7`
- non-matching nodes have their highlight attributes removed

**If** the query is empty,

**Then** all highlight attributes are removed and `APP._hypDraw(false)` is called.

---

**Source code:** `app.js` → `APP._hypFilter(q)`

### REQ-VW-013 — Building nodes (individuals) and links (assertions)

**If** the ontology is loaded and contains individuals in `APP.state.individuals`,

**Then** the system:
- creates one D3 node `{ id, label, classId, ind, x, y }` per individual, positioned randomly around the center
- iterates over `ind.objectAssertions` for each individual and creates a link `{ source, target, property, id }` for each assertion whose `target` is an existing individual
- stores all nodes and links in `APP._kbData`

---

**Source code:** `app.js` → `APP._initKnowledgeBase()`

### REQ-VW-014 — Color palette by class

**If** a `classId` is encountered for the first time during the construction of the Knowledge Base graph,

**Then** the system assigns it the next color from a predefined palette of 15 hexadecimal colors, stored in `APP._kbColorMap`.

**If** the `classId` has already been encountered,

**Then** the system returns the previously assigned color without modifying the palette.

---

**Source code:** `app.js` → `APP._kbClassColor(classId)`

### REQ-VW-015 — Resolving the best individual label

**If** the system must display the label of an individual,

**Then**:
- it searches in `ind.annotations.labels` for a label matching `Settings.preferredLang`
- if no match is found, it takes the first available label
- if no label exists, it returns `ind.id`

---

**Source code:** `app.js` → `APP._kbBestLabel(ind)`

### REQ-VW-020 — Individual node click: navigation to the individual editor

**If** the user clicks on an individual node in the Knowledge Base graph,

**Then** the system:
- calls `APP.navigate('individuals')`
- after 120 ms, sets `IndividualEditor._selectedId = d.id` and calls `IndividualEditor.restoreSelection()` to display the form for the clicked individual

---

**Source code:** `app.js` → `APP._initKnowledgeBase()`

### REQ-VW-022 — Drag and drop of nodes in the Knowledge Base graph

**If** the user starts dragging a node (`dragstart`),

**Then** the simulation is restarted with `alphaTarget(0.3)` and the node's `fx`/`fy` coordinates are fixed to the current position.

**If** the user moves the node (`drag`),

**Then** the `fx`/`fy` coordinates follow the cursor.

**If** the user releases the node (`dragend`),

**Then** `alphaTarget(0)` cools the simulation and `fx`/`fy` are set to `null` to release the node.

---

**Source code:** `app.js` → `APP._initKnowledgeBase()`

### REQ-VW-023 — D3 force simulation with configured parameters

**If** the Knowledge Base graph is initialized with nodes and links,

**Then** the system creates a `d3.forceSimulation(nodes)` simulation with the following forces:
- `forceLink`: target distance 120, strength 0.6
- `forceManyBody`: intensity -350 (repulsion)
- `forceCenter`: centered on `(W/2, H/2)`, strength 0.05
- `forceCollide`: radius 28

**and** updates at each tick the positions of edges, edge labels and nodes.

---

**Source code:** `app.js` → `APP._initKnowledgeBase()`

### REQ-VW-024 — Restarting the force simulation

**If** the user triggers a restart of the simulation
**and** `APP._kbSim` is defined,

**Then** the system calls `APP._kbSim.alpha(0.8).restart()`, warming up the simulation and restarting it from its current state.

---

**Source code:** `app.js` → `APP._kbRestart()`

### REQ-VW-025 — Filtering individuals by text in the Knowledge Base graph

**If** the user types a filter query in the dedicated field of the Knowledge Base graph,

**Then**:
- nodes whose `label` or `classId` contains the query (case-insensitive) retain an opacity of 1
- other nodes are set to an opacity of 0.1

**If** the query is empty,

**Then** all nodes and labels return to an opacity of 1.

---

**Source code:** `app.js` → `APP._kbFilter(q)`

### REQ-VW-027 — Blocking the Views tab if no ontology is connected

**If** the user attempts to access the `'views'` section
**and** `APP.state.ontology` is null,

**Then** the system injects into `#main-content` the message returned by `APP._noOntoMsg()` (containing a "Go to Ontologies" button) and interrupts the normal rendering of the view.

---

**Source code:** `app.js` → `APP.renderSection(section)`

### REQ-VW-028 — Deferred graph initialization after HTML rendering

**If** the HTML from `APP.renderViews()` has just been injected into the DOM,

**Then** the system waits 80 ms via `setTimeout` before initializing the graph corresponding to `APP._viewsTab`:
- `APP._initHyperbolicGraph()` if the active tab is `'ontology'`
- `APP._initKnowledgeBase()` if the active tab is `'knowledge-base'`

This delay ensures that the SVG container is present in the DOM before D3 initialization.

---

## 2. Form — Presentation and UI

> Requirements relating to display: layout, visual components, interactions, navigation, styles.

**Source code:** `app.js` → `APP.renderSection(section)`

### REQ-VW-001 — Rendering the Views tab with sub-tabs

**If** the user navigates to the Views tab,

**Then** the system generates a sidebar with two clickable sub-tabs: `'ontology'` (label "🗂 Ontology") and `'knowledge-base'` (label "🧩 Knowledge Base"), the active tab being stored in `APP._viewsTab` (initialized to `'ontology'`).

**If** the user clicks on a sub-tab,

**Then** `APP._viewsTab` is updated and `APP.renderSection('views')` is called again to refresh the view.

---

**Source code:** `app.js` → `APP.renderViews()`

### REQ-VW-002 — "Ontology" sub-tab: D3 hyperbolic tree

**If** `APP._viewsTab === 'ontology'`,

**Then** the system generates a panel containing:
- a "⟳ Reset" button (calls `APP._hypReset()`)
- a filter input field bound to `APP._hypFilter(this.value)`
- a text hint "Click → focus · Double-click → edit"
- a counter (`#cy-node-count`)
- an SVG container `#cy-ontology`

---

**Source code:** `app.js` → `APP.renderViews()`

### REQ-VW-006 — SVG drawing of nodes and edges with proportional opacity and size

**If** the hyperbolic graph must be drawn,

**Then** for each node, the system computes its distance from the center (`cabs(node.hpos)`) and derives:
- the circle radius: `Math.max(3.5, 10 * (1 - dist*0.65))`
- the opacity: `Math.max(0.12, 1 - dist*0.55)`
- the font size: `Math.max(8, 13 * (1 - dist*0.82))`
- the fill color and text color
- hiding the label if `dist >= 0.78`

**If** `animated === true`,

**Then** a CSS transition `transform 0.42s cubic-bezier(0.33,1,0.68,1)` is applied to each node.

Each edge is rendered as a `<line>` element connecting the node to its parent.

---

**Source code:** `app.js` → `APP._hypDraw(animated)`

### REQ-VW-011 — Class counter displayed in the toolbar

**If** the hyperbolic graph is initialized,

**Then** the system updates the element `#cy-node-count` with the text `"N class(es)"` (plural if N > 1).

---

**Source code:** `app.js` → `APP._initHyperbolicGraph()`

### REQ-VW-012 — "Knowledge Base" sub-tab: D3 force graph

**If** `APP._viewsTab === 'knowledge-base'`,

**Then** the system generates a panel containing:
- a "⟳ Restart" button (calls `APP._kbRestart()`)
- a filter field bound to `APP._kbFilter(this.value)`
- a legend container `#kb-legend`
- a counter `#kb-count`
- an SVG container `#kb-graph`

**and** calls `APP._initKnowledgeBase()` after a delay of 80 ms.

---

**Source code:** `app.js` → `APP.renderViews()` and `APP._initKnowledgeBase()`

### REQ-VW-016 — Class legend in the Knowledge Base graph

**If** the Knowledge Base graph is initialized and contains nodes,

**Then** the system collects unique `classId` values, sorts them, pre-assigns their colors via `APP._kbClassColor()`, then injects into `#kb-legend` a colored badge (8 px square) followed by the class name for each entry.

---

**Source code:** `app.js` → `APP._initKnowledgeBase()`

### REQ-VW-017 — SVG arrowheads on directional edges

**If** the Knowledge Base graph is initialized,

**Then** the system adds into the `<defs>` section of the SVG two markers via `mkArrow(id, color)`:
- `kb-arrow` (color `#3a4a62`, normal arrow)
- `kb-arrow-hi` (color `#3b82f6`, highlighted arrow)

Edges use `marker-end='url(#kb-arrow)'`.

---

**Source code:** `app.js` → `APP._initKnowledgeBase()`

### REQ-VW-018 — Zoom and pan on the Knowledge Base graph

**If** the Knowledge Base graph is displayed,

**Then** the system applies `d3.zoom().scaleExtent([0.1, 4])` to the SVG and, on each `zoom` event, applies the transformation to the `zoomG` group containing all graphical elements, enabling a zoom factor from 0.1× to 4×.

---

**Source code:** `app.js` → `APP._initKnowledgeBase()`

### REQ-VW-019 — Property labels on edges

**If** the Knowledge Base graph is initialized with links,

**Then** for each link, a `<text>` element containing the value `d.property` is created in the `labelG` group and positioned at the midpoint of the edge (`(source.x + target.x)/2, (source.y + target.y)/2 - 4`), updated at each simulation tick.

---

**Source code:** `app.js` → `APP._initKnowledgeBase()`

### REQ-VW-021 — Node hover: connection highlighting

**If** the user hovers over a node (`mouseover`),

**Then** the system:
- reduces the opacity of non-connected nodes to 0.2
- reduces the opacity of uninvolved edges and labels to 0.05

**If** the user leaves the node (`mouseout`),

**Then** all opacities are restored to 1.

---

**Source code:** `app.js` → `APP._initKnowledgeBase()` (handlers `mouseover` / `mouseout`)

### REQ-VW-026 — Individual and connection counter

**If** the Knowledge Base graph is initialized,

**Then** the system updates the element `#kb-count` with the text `"N individual(s) · M connection(s)"` (conditional plural for each value).

---

*Document generated on 2026-06-06 — claude-sonnet-4-6*

**Source code:** `app.js` → `APP._initKnowledgeBase()`
