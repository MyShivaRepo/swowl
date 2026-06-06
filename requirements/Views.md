# Requirements — Views

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-VW-003 — Building the hierarchical class tree](#req-vw-003--building-the-hierarchical-class-tree)
- [REQ-VW-004 — Resolving the best class label](#req-vw-004--resolving-the-best-class-label)
- [REQ-VW-005 — Hyperbolic layout algorithm (Poincaré disk)](#req-vw-005--hyperbolic-layout-algorithm-poincaré-disk)
- [REQ-VW-007 — Node click: centering via Möbius transformation](#req-vw-007--node-click-centering-via-möbius-transformation)
- [REQ-VW-008 — Double-click (second click at center): navigation to the class editor](#req-vw-008--double-click-second-click-at-center-navigation-to-the-class-editor)
- [REQ-VW-009 — Resetting focus to the root](#req-vw-009--resetting-focus-to-the-root)
- [REQ-VW-010 — Filtering classes by text in the hyperbolic graph](#req-vw-010--filtering-classes-by-text-in-the-hyperbolic-graph)
- [REQ-VW-013 — Building nodes (individuals) and links (assertions)](#req-vw-013--building-nodes-individuals-and-links-assertions)
- [REQ-VW-014 — Color palette per class](#req-vw-014--color-palette-per-class)
- [REQ-VW-015 — Resolving the best individual label](#req-vw-015--resolving-the-best-individual-label)
- [REQ-VW-020 — Individual node click: navigation to the individual editor](#req-vw-020--individual-node-click-navigation-to-the-individual-editor)
- [REQ-VW-022 — Drag and drop of nodes in the Knowledge Base graph](#req-vw-022--drag-and-drop-of-nodes-in-the-knowledge-base-graph)
- [REQ-VW-023 — D3 force simulation with configured parameters](#req-vw-023--d3-force-simulation-with-configured-parameters)
- [REQ-VW-024 — Restarting the force simulation](#req-vw-024--restarting-the-force-simulation)
- [REQ-VW-025 — Filtering individuals by text in the Knowledge Base graph](#req-vw-025--filtering-individuals-by-text-in-the-knowledge-base-graph)
- [REQ-VW-027 — Blocking the Views tab when no ontology is connected](#req-vw-027--blocking-the-views-tab-when-no-ontology-is-connected)
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
- [REQ-VW-021 — Node hover: highlighting connections](#req-vw-021--node-hover-highlighting-connections)
- [REQ-VW-026 — Individual and connection counter](#req-vw-026--individual-and-connection-counter)

---

## 1. Substance — Business logic and functional rules

> Requirements independent of the UI: OWL rules, data constraints, algorithms, persistence.

### REQ-VW-003 — Building the hierarchical class tree
**Source code:** `app.js` → `APP._initHyperbolicGraph()`

The function reads `APP.state.classes`, builds a `classMap` indexed by `id`, then computes for each class its parents via `subClassOf`. Classes with no internal parent become the roots of a virtual `owl:Thing` node. The hierarchy is recursively built by the internal function `buildNode(id, depth)`, which returns an object `{ id, depth, label, hpos, basePos, children }`.

---

### REQ-VW-004 — Resolving the best class label
**Source code:** `app.js` → `APP._hypBestLabel(cls)`

For each class, the function searches `cls.annotations` for an annotation whose property is `rdfs:label` or `label` matching the preferred language (`Settings.preferredLang`). If no match is found, it takes the first available `rdfs:label` annotation. If none exists, it returns `cls.id`.

---

### REQ-VW-005 — Hyperbolic layout algorithm (Poincaré disk)
**Source code:** `app.js` → `APP._initHyperbolicGraph()` (internal functions `layoutNode`, `cadd`, `csub`, `cmul`, `cconj`, `cabs`, `cdiv`, `polar`, `mobiusFocus`, `mobiusTranslate`)

The layout uses the hyperbolic geometry of the Poincaré disk. The constant `STEP_R = Math.tanh(0.4)` defines the spacing between levels. The function `layoutNode(node, pos, angle, wedge)` distributes children into equal angular sectors. The hyperbolic translation is performed by `mobiusTranslate(z, a)`, which implements a Möbius transformation. The complex helpers (`cadd`, `csub`, `cmul`, `cconj`, `cdiv`, `polar`) are stored in `APP._hypMath`.

---

### REQ-VW-007 — Node click: centering via Möbius transformation
**Source code:** `app.js` → `APP._hypClick(node)`

When a node whose distance from the center is greater than 0.02 is clicked, the function computes `mobiusFocus(n.hpos, a)` for every node in the tree in order to bring the clicked node toward the center of the disk. It then calls `APP._hypDraw(true)` to animate the transition.

---

### REQ-VW-008 — Double-click (second click at center): navigation to the class editor
**Source code:** `app.js` → `APP._hypClick(node)`

If the clicked node has a distance from the center less than 0.10 and its `id` is not `'owl:Thing'`, the function calls `APP.navigate('classes')` and then, after 80 ms, sets `ClassEditor._selectedId = node.id` and calls `ClassEditor.restoreSelection()` to directly open the editing form for the corresponding class.

---

### REQ-VW-009 — Resetting focus to the root
**Source code:** `app.js` → `APP._hypReset()`

The function copies `basePos` into `hpos` for all nodes in `APP._hypNodes`, thereby restoring the initial layout positions, then calls `APP._hypDraw(true)` to animate the return.

---

### REQ-VW-010 — Filtering classes by text in the hyperbolic graph
**Source code:** `app.js` → `APP._hypFilter(q)`

The function iterates over `APP._hypNodeEls`. For each node whose `label` or `id` contains the query (case-insensitive), it applies a green stroke (`#10b981`) and changes the label color to `#6ee7b7`. For non-matching nodes or when the query is empty, it removes the highlight attributes and calls `APP._hypDraw(false)`.

---

### REQ-VW-013 — Building nodes (individuals) and links (assertions)
**Source code:** `app.js` → `APP._initKnowledgeBase()`

The function reads `APP.state.individuals`. Each individual becomes a D3 node with properties `{ id, label, classId, ind, x, y }`, randomly positioned around the center. Edges are built by iterating over `ind.objectAssertions`: for each assertion whose `target` is an existing individual, a link `{ source, target, property, id }` is created. The whole dataset is stored in `APP._kbData`.

---

### REQ-VW-014 — Color palette per class
**Source code:** `app.js` → `APP._kbClassColor(classId)`

The function maintains a dictionary `APP._kbColorMap` and an index `APP._kbColorIndex`. The first time a `classId` is encountered, the next color from a predefined palette of 15 hexadecimal colors is assigned to it. Subsequent calls return the same color.

---

### REQ-VW-015 — Resolving the best individual label
**Source code:** `app.js` → `APP._kbBestLabel(ind)`

The function searches `ind.annotations.labels` for a label matching `Settings.preferredLang`. If no match is found, it takes the first available label. If no label exists, it returns `ind.id`.

---

### REQ-VW-020 — Individual node click: navigation to the individual editor
**Source code:** `app.js` → `APP._initKnowledgeBase()`

The `click` event on a node calls `APP.navigate('individuals')`. After 120 ms, it sets `IndividualEditor._selectedId = d.id` and calls `IndividualEditor.restoreSelection()` to display the form for the clicked individual.

---

### REQ-VW-022 — Drag and drop of nodes in the Knowledge Base graph
**Source code:** `app.js` → `APP._initKnowledgeBase()`

The function applies `d3.drag()` to each node. On `dragstart`, the simulation is restarted with `alphaTarget(0.3)` and the node's `fx`/`fy` coordinates are fixed. On `drag`, the coordinates follow the cursor. On `dragend`, `alphaTarget(0)` cools the simulation and `fx`/`fy` are set to `null` to release the node.

---

### REQ-VW-023 — D3 force simulation with configured parameters
**Source code:** `app.js` → `APP._initKnowledgeBase()`

The simulation is created with `d3.forceSimulation(nodes)` and the following forces:
- `forceLink`: target distance 120, strength 0.6
- `forceManyBody`: intensity -350 (repulsion)
- `forceCenter`: centered on `(W/2, H/2)`, strength 0.05
- `forceCollide`: radius 28

On each tick, the positions of edges, edge labels and nodes are updated.

---

### REQ-VW-024 — Restarting the force simulation
**Source code:** `app.js` → `APP._kbRestart()`

If `APP._kbSim` is defined, the function calls `APP._kbSim.alpha(0.8).restart()`, which reheats the simulation and restarts it from its current state.

---

### REQ-VW-025 — Filtering individuals by text in the Knowledge Base graph
**Source code:** `app.js` → `APP._kbFilter(q)`

The function modifies the `opacity` attribute of node circles and labels via `APP._kbNodeEls`. A node whose `label` or `classId` contains the query (case-insensitive) keeps opacity 1; all others are set to 0.1. If the query is empty, all elements return to opacity 1.

---

### REQ-VW-027 — Blocking the Views tab when no ontology is connected
**Source code:** `app.js` → `APP.renderSection(section)`

In `renderSection()`, the `editSections` list includes `'views'`. If `APP.state.ontology` is null and the requested section is part of this list, the function injects into `#main-content` the message returned by `APP._noOntoMsg()` (containing a "Go to Ontologies" button) and interrupts normal rendering.

---

### REQ-VW-028 — Deferred graph initialization after HTML rendering
**Source code:** `app.js` → `APP.renderSection(section)`

After injecting the HTML from `APP.renderViews()`, the function checks `APP._viewsTab` and calls the corresponding graph with an 80 ms delay via `setTimeout`: `APP._initHyperbolicGraph()` if the active tab is `'ontology'`, or `APP._initKnowledgeBase()` if the active tab is `'knowledge-base'`. This delay ensures that the SVG container is present in the DOM before D3 initialization.

---

## 2. Form — Presentation and user interface

> Requirements related to display: layout, visual components, interactions, navigation, styles.

### REQ-VW-001 — Rendering the Views tab with sub-tabs
**Source code:** `app.js` → `APP.renderViews()`

The function generates the HTML for the Views tab. It produces a sidebar with two clickable sub-tabs: `'ontology'` (label "🗂 Ontology") and `'knowledge-base'` (label "🧩 Knowledge Base"). The active tab is stored in `APP._viewsTab` (initialized to `'ontology'`). Clicking a sub-tab updates `APP._viewsTab` and calls `APP.renderSection('views')`.

---

### REQ-VW-002 — "Ontology" sub-tab: D3 hyperbolic tree
**Source code:** `app.js` → `APP.renderViews()`

When `APP._viewsTab === 'ontology'`, the function generates a panel containing: a "⟳ Reset" button (calling `APP._hypReset()`), a filter input field bound to `APP._hypFilter(this.value)`, a textual hint "Click → focus · Double-click → edit", a counter (`#cy-node-count`) and an SVG container `#cy-ontology`.

---

### REQ-VW-006 — SVG drawing of nodes and edges with proportional opacity and size
**Source code:** `app.js` → `APP._hypDraw(animated)`

For each node, the function computes its distance from the center (`cabs(node.hpos)`), then derives: the circle radius (`Math.max(3.5, 10 * (1 - dist*0.65))`), the opacity (`Math.max(0.12, 1 - dist*0.55)`), the font size (`Math.max(8, 13 * (1 - dist*0.82))`), the fill color and the text color. The label is hidden if `dist >= 0.78`. If `animated === true`, a CSS transition `transform 0.42s cubic-bezier(0.33,1,0.68,1)` is applied. Each edge is a `<line>` element connecting the node to its parent.

---

### REQ-VW-011 — Class counter displayed in the toolbar
**Source code:** `app.js` → `APP._initHyperbolicGraph()`

After rendering the graph, the function updates the `#cy-node-count` element with the text `"N class(es)"` (plural if N > 1).

---

### REQ-VW-012 — "Knowledge Base" sub-tab: D3 force graph
**Source code:** `app.js` → `APP.renderViews()` and `APP._initKnowledgeBase()`

When `APP._viewsTab === 'knowledge-base'`, the generated HTML contains: a "⟳ Restart" button (calling `APP._kbRestart()`), a filter input field bound to `APP._kbFilter(this.value)`, a legend container `#kb-legend`, a counter `#kb-count` and an SVG container `#kb-graph`. `APP._initKnowledgeBase()` is called after an 80 ms delay.

---

### REQ-VW-016 — Class legend in the Knowledge Base graph
**Source code:** `app.js` → `APP._initKnowledgeBase()`

The function collects the set of unique `classId` values among the nodes, sorts them, pre-assigns their colors via `APP._kbClassColor()`, then injects into `#kb-legend` a colored badge (8 px square) followed by the class name for each entry.

---

### REQ-VW-017 — SVG arrowheads on directional edges
**Source code:** `app.js` → `APP._initKnowledgeBase()`

The function adds two `<marker>` markers into the `<defs>` section of the SVG via the internal function `mkArrow(id, color)`: `kb-arrow` (color `#3a4a62`, normal arrow) and `kb-arrow-hi` (color `#3b82f6`, highlighted arrow). Edges use `marker-end='url(#kb-arrow)'`.

---

### REQ-VW-018 — Zoom and pan on the Knowledge Base graph
**Source code:** `app.js` → `APP._initKnowledgeBase()`

The function applies `d3.zoom().scaleExtent([0.1, 4])` to the SVG. On the `zoom` event, the transformation is applied to a `zoomG` group containing all graphical elements, enabling zoom from 0.1× to 4×.

---

### REQ-VW-019 — Property labels on edges
**Source code:** `app.js` → `APP._initKnowledgeBase()`

For each link, a `<text>` element is created in the `labelG` group. Its content is the link's `d.property` value. It is positioned at the midpoint of the edge `((source.x + target.x)/2, (source.y + target.y)/2 - 4)` and updated on each tick of the simulation.

---

### REQ-VW-021 — Node hover: highlighting connections
**Source code:** `app.js` → `APP._initKnowledgeBase()` (handlers `mouseover` / `mouseout`)

On the `mouseover` event, the function computes the set of identifiers of nodes connected to the hovered node. It reduces the opacity of non-connected nodes to 0.2 and that of uninvolved edges and labels to 0.05. On `mouseout`, all opacities are reset to 1.

---

### REQ-VW-026 — Individual and connection counter
**Source code:** `app.js` → `APP._initKnowledgeBase()`

After building the nodes and links, the function updates the `#kb-count` element with the text `"N individual(s) · M connection(s)"` (conditional plural for each value).

---

*Document generated on 2026-06-06 — claude-sonnet-4-6*
