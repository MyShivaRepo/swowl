# Requirements — Views

> Generated on 2026-06-06 | Strictly derived from source code | No hallucination

## Table of contents

### Substance
- [REQ-VW-003 — Building the class hierarchy tree](#req-vw-003--building-the-class-hierarchy-tree)
- [REQ-VW-004 — Resolving the best class label](#req-vw-004--resolving-the-best-class-label)
- [REQ-VW-005 — Hyperbolic layout on a Poincaré disk (canvas)](#req-vw-005--hyperbolic-layout-on-a-poincaré-disk-canvas)
- [REQ-VW-007 — Click on a node: animated re-centering via Möbius transformation](#req-vw-007--click-on-a-node-animated-re-centering-via-möbius-transformation)
- [REQ-VW-008 — Double-click on a node: navigation to the class editor](#req-vw-008--double-click-on-a-node-navigation-to-the-class-editor)
- [REQ-VW-009 — Drag to pan the hyperbolic plane](#req-vw-009--drag-to-pan-the-hyperbolic-plane)
- [REQ-VW-010 — Node hover: highlighting the sub-branch](#req-vw-010--node-hover-highlighting-the-sub-branch)
- [REQ-VW-030 — Building the Ontology tree for the visualizations](#req-vw-030--building-the-ontology-tree-for-the-visualizations)
- [REQ-VW-013 — Building nodes (individuals) and links (assertions)](#req-vw-013--building-nodes-individuals-and-links-assertions)
- [REQ-VW-014 — Color palette by class](#req-vw-014--color-palette-by-class)
- [REQ-VW-015 — Resolving the best individual label](#req-vw-015--resolving-the-best-individual-label)
- [REQ-VW-020 — Click on an individual node: navigation to the individual editor](#req-vw-020--click-on-an-individual-node-navigation-to-the-individual-editor)
- [REQ-VW-022 — Drag and drop of nodes in the Knowledge Base graph](#req-vw-022--drag-and-drop-of-nodes-in-the-knowledge-base-graph)
- [REQ-VW-023 — D3 force simulation with configured parameters](#req-vw-023--d3-force-simulation-with-configured-parameters)
- [REQ-VW-024 — Restarting the force simulation](#req-vw-024--restarting-the-force-simulation)
- [REQ-VW-025 — Filtering individuals by text in the Knowledge Base graph](#req-vw-025--filtering-individuals-by-text-in-the-knowledge-base-graph)
- [REQ-VW-027 — Blocking the Views tab when no ontology is connected](#req-vw-027--blocking-the-views-tab-when-no-ontology-is-connected)
- [REQ-VW-028 — Deferred graph initialization after HTML rendering](#req-vw-028--deferred-graph-initialization-after-html-rendering)

### Form
- [REQ-VW-001 — Rendering the Views tab with sub-tabs](#req-vw-001--rendering-the-views-tab-with-sub-tabs)
- [REQ-VW-002 — "Ontology (Hyperbolic)" sub-tab: canvas hyperbolic tree](#req-vw-002--ontology-hyperbolic-sub-tab-canvas-hyperbolic-tree)
- [REQ-VW-006 — Canvas rendering: focus+context and curved edges colored by branch](#req-vw-006--canvas-rendering-focuscontext-and-curved-edges-colored-by-branch)
- [REQ-VW-011 — Class counter displayed in the toolbar](#req-vw-011--class-counter-displayed-in-the-toolbar)
- [REQ-VW-012 — "Knowledge Base" sub-tab: D3 force graph](#req-vw-012--knowledge-base-sub-tab-d3-force-graph)
- [REQ-VW-016 — Class legend in the Knowledge Base graph](#req-vw-016--class-legend-in-the-knowledge-base-graph)
- [REQ-VW-017 — SVG arrowheads on directional edges](#req-vw-017--svg-arrowheads-on-directional-edges)
- [REQ-VW-018 — Zoom and pan on the Knowledge Base graph](#req-vw-018--zoom-and-pan-on-the-knowledge-base-graph)
- [REQ-VW-019 — Property labels on edges](#req-vw-019--property-labels-on-edges)
- [REQ-VW-021 — Node hover: connection highlighting](#req-vw-021--node-hover-connection-highlighting)
- [REQ-VW-026 — Individual and connection counter](#req-vw-026--individual-and-connection-counter)
- [REQ-VW-031 — "Ontology (TreeMap)" sub-tab: restyled proportional map](#req-vw-031--ontology-treemap-sub-tab-restyled-proportional-map)
- [REQ-VW-032 — Resizable Views sidebar](#req-vw-032--resizable-views-sidebar)

---

## 1. Substance — Business logic and functional rules

> Requirements independent of the UI: OWL rules, data constraints, algorithmic behaviors, validations, persistence.


### REQ-VW-003 — Building the class hierarchy tree

| **If** | the `ontology` is loaded and contains `classes` organized in a hierarchy, |
|---|---|
| **Then** | the class tree faithfully reflects the specialization relationships: each class is positioned under its parent concept, `classes` with no parent are attached to the universal root `owl:Thing`, and the hierarchy is built recursively by exposing for each node its depth level, its label, and its children. |

---

**Source code:** `app.js` → `APP._buildOntologyTreeData()` — Builds a `classMap` indexed by `id`, computes parents via `subClassOf`, elevates classes with no internal parent under a virtual root node `owl:Thing`, and recursively builds the hierarchy, each node exposing its `id`, its `depth`, its `label`, and its `children`. This tree feeds both the hyperbolic visualization and the TreeMap visualization.

### REQ-VW-004 — Resolving the best class label

| **If** | the ontologist browses the class tree and a class has multiple label annotations in different languages, |
|---|---|
| **Then** | the application displays the label in the user's preferred language; failing that, the first available label; failing that, the technical identifier of the class. |

---

**Source code:** `app.js` → `APP._hypBestLabel(cls)` — Searches in `cls.annotations` for an `rdfs:label` or `label` annotation matching `Settings.preferredLang`, takes the first available annotation if no match is found, and returns `cls.id` if no annotation exists.

### REQ-VW-005 — Hyperbolic layout on a Poincaré disk (canvas)

| **If** | the ontologist visualizes the class tree in the "Ontology (Hyperbolic)" sub-tab, |
|---|---|
| **Then** | `classes` are arranged in a hyperbolic space of the Poincaré disk type: each hierarchy level is evenly spaced, the children of a node are distributed in equal angular sectors around their parent, and translations between levels respect hyperbolic geometry (Möbius transformations). |

---

**Source code:** `app.js` → `APP._initOntology2()` — Builds the tree via `APP._buildOntologyTreeData()` (root `owl:Thing`, hierarchy derived from `subClassOf`), then recursively places each node on the Poincaré disk using complex arithmetic and Möbius transformations, distributing children in equal angular sectors and evenly spacing the levels. Rendering is performed on an HTML5 `<canvas>` element, with no external library (pure canvas).

### REQ-VW-007 — Click on a node: animated re-centering via Möbius transformation

| **If** | the ontologist clicks on a class in the hyperbolic graph to explore it, |
|---|---|
| **Then** | the selected class glides to the center of the disk via a smooth animation, allowing it to be brought into focus and its nearby neighbors to be visualized with more detail. |

---

**Source code:** `app.js` → `APP._initOntology2()` — On a node click (a `pointerup` with `moved < 3`), calls the internal `glide(n)` function, which re-centers the node at the center of the disk through successive Möbius translations (`applyT`) animated via `requestAnimationFrame`, redrawing the canvas on each frame.

### REQ-VW-008 — Double-click on a node: navigation to the class editor

| **If** | the ontologist double-clicks on a class in the hyperbolic graph to edit it, |
|---|---|
| **Then** | the application automatically navigates to the editing form of that class (Classes tab), without any additional interaction. |

---

**Source code:** `app.js` → `APP._initOntology2()` — On the `dblclick` event, if the targeted node has an `id` distinct from the `owl:Thing` root, calls `APP.navigateTo('classes', n.id)`, which navigates to the Classes tab and selects the corresponding class.

### REQ-VW-009 — Drag to pan the hyperbolic plane

| **If** | the ontologist drags within the hyperbolic graph, |
|---|---|
| **Then** | the entire hyperbolic plane is panned to follow the cursor movement, allowing free exploration of the tree without re-centering on a particular node. |

---

**Source code:** `app.js` → `APP._initOntology2()` — The pointer handlers (`pointerdown` / `pointermove` / `pointerup`) track a `dragging` state and apply to the hyperbolic plane a translation (`applyT`) proportional to the cursor displacement, redrawing the canvas during the drag (`grabbing` cursor).

### REQ-VW-010 — Node hover: highlighting the sub-branch

| **If** | the ontologist hovers over a class in the hyperbolic graph, |
|---|---|
| **Then** | the sub-branch rooted at that node (the node and its descendants) is highlighted, while the other `classes` are dimmed, allowing focus on the relevant portion of the hierarchy. |

| **If** | the ontologist leaves the node, |
|---|---|
| **Then** | all `classes` return to their normal appearance. |

---

**Source code:** `app.js` → `APP._initOntology2()` — On a `pointermove` event without dragging, detects the node under the cursor and builds a `hoverSet` (node and descendants); during drawing, elements outside `hoverSet` are dimmed (opacity reduced to ~0.18–0.22), then the canvas is redrawn.

### REQ-VW-030 — Building the Ontology tree for the visualizations

| **If** | the `ontology` is loaded and contains `classes` organized via `subClassOf`, |
|---|---|
| **Then** | a single hierarchy tree is built from the universal root `owl:Thing` and shared by both ontology visualization sub-tabs (Hyperbolic and TreeMap), ensuring a consistent representation of the hierarchy. |

---

**Source code:** `app.js` → `APP._buildOntologyTreeData()` — Indexes `classes` by `id`, infers parents via `subClassOf`, attaches orphan `classes` to the `owl:Thing` root, and recursively builds the `{ id, depth, label, children }` tree consumed by `APP._initOntology2()` (Hyperbolic) and by the TreeMap rendering.

### REQ-VW-013 — Building nodes (individuals) and links (assertions)

| **If** | the `ontology` is loaded and contains `individuals` linked by `object properties`, |
|---|---|
| **Then** | each `individual` is represented as a graph node, and each assertion between two existing `individuals` is represented as a directed link between the corresponding nodes. |

---

**Source code:** `app.js` → `APP._initKnowledgeBase()` — Creates one D3 node `{ id, label, classId, ind, x, y }` per individual randomly positioned around the center, iterates over `ind.objectAssertions` to create links `{ source, target, property, id }` for each assertion whose target is an existing individual, and stores everything in `APP._kbData`.

### REQ-VW-014 — Color palette by class

| **If** | the ontologist visualizes the Knowledge Base graph containing `individuals` belonging to different `classes`, |
|---|---|
| **Then** | each class is identified by a distinct and consistent color throughout the session, making it possible to visually distinguish `individuals` by their type. |

| **If** | the same class is encountered again, |
|---|---|
| **Then** | the same color is applied to it without modification. |

---

**Source code:** `app.js` → `APP._kbClassColor(classId)` — Assigns to each `classId` encountered for the first time the next color from a palette of 15 predefined hexadecimal colors, stored in `APP._kbColorMap`; returns the previously assigned color if the `classId` is already known.

### REQ-VW-015 — Resolving the best individual label

| **If** | the ontologist browses the Knowledge Base graph and an `individual` has multiple labels in different languages, |
|---|---|
| **Then** | the application displays the label in the user's preferred language; failing that, the first available label; failing that, the technical identifier of the `individual`. |

---

**Source code:** `app.js` → `APP._kbBestLabel(ind)` — Searches in `ind.annotations.labels` for a label matching `Settings.preferredLang`, takes the first available label if no match is found, and returns `ind.id` if no label exists.

### REQ-VW-020 — Click on an individual node: navigation to the individual editor

| **If** | the ontologist clicks on an `individual` in the Knowledge Base graph to `view` or modify its `properties`, |
|---|---|
| **Then** | the application automatically navigates to the editing form of that `individual`, without any additional interaction. |

---

**Source code:** `app.js` → `APP._initKnowledgeBase()` — Calls `APP.navigate('individuals')`, then after 120 ms sets `IndividualEditor._selectedId = d.id` and calls `IndividualEditor.restoreSelection()`.

### REQ-VW-022 — Drag and drop of nodes in the Knowledge Base graph

| **If** | the ontologist starts dragging an `individual` in the Knowledge Base graph, |
|---|---|
| **Then** | the simulation activates and the node follows the cursor movement. |

| **If** | the ontologist moves the cursor, |
|---|---|
| **Then** | the node follows the cursor position in real time. |

| **If** | the ontologist releases the node, |
|---|---|
| **Then** | the simulation resumes its natural behavior and the node is freed to reposition itself. |

---

**Source code:** `app.js` → `APP._initKnowledgeBase()` — On `dragstart`: `alphaTarget(0.3)` and pinning `fx`/`fy` to the current position. On `drag`: updating `fx`/`fy` according to the cursor position. On `dragend`: `alphaTarget(0)` and setting `fx`/`fy` back to `null`.

### REQ-VW-023 — D3 force simulation with configured parameters

| **If** | the ontologist opens the Knowledge Base graph containing `individuals` and assertions, |
|---|---|
| **Then** | nodes automatically position themselves in the space by applying attraction forces between linked `individuals`, repulsion forces between all nodes, attraction toward the center, and collision avoidance, in order to produce a readable and balanced layout. |

---

**Source code:** `app.js` → `APP._initKnowledgeBase()` — Creates a `d3.forceSimulation(nodes)` simulation with: `forceLink` (distance 120, strength 0.6), `forceManyBody` (strength -350), `forceCenter` centered on `(W/2, H/2)` (strength 0.05), and `forceCollide` (radius 28). Updates edge, edge label, and node positions at each tick.

### REQ-VW-024 — Restarting the force simulation

| **If** | the ontologist wishes to reorganize the Knowledge Base graph after moving nodes or modifying data, |
|---|---|
| **Then** | the simulation resumes from its current state with a high initial energy, allowing nodes to find a new balanced layout. |

---

**Source code:** `app.js` → `APP._kbRestart()` — If `APP._kbSim` is defined, calls `APP._kbSim.alpha(0.8).restart()`.

### REQ-VW-025 — Filtering individuals by text in the Knowledge Base graph

| **If** | the ontologist types a term to search for an `individual` or a class type in the Knowledge Base graph, |
|---|---|
| **Then** | nodes matching the term remain fully visible, while the others are strongly faded to highlight the relevant results. |

| **If** | the ontologist clears the search term, |
|---|---|
| **Then** | all nodes and their labels return to full visibility. |

---

**Source code:** `app.js` → `APP._kbFilter(q)` — Nodes whose `label` or `classId` contains the query (case-insensitive) keep an opacity of 1; others drop to 0.1. If the query is empty, all nodes and labels return to an opacity of 1.

### REQ-VW-027 — Blocking the Views tab when no ontology is connected

| **If** | the ontologist attempts to access the `Views` section without having previously loaded an `ontology`, |
|---|---|
| **Then** | the application displays an informational message inviting the user to connect an `ontology`, with a direct link to the `ontology` management section, and does not display the graphs. |

---

**Source code:** `app.js` → `APP.renderSection(section)` — If `APP.state.ontology` is null, injects into `#main-content` the message returned by `APP._noOntoMsg()` (containing a "Go to Ontologies" button) and interrupts the normal rendering of the view.

### REQ-VW-028 — Deferred graph initialization after HTML rendering

| **If** | the ontologist navigates to the `Views` tab and the HTML has just been injected into the page, |
|---|---|
| **Then** | the graph corresponding to the active sub-tab is initialized after a short delay, ensuring that the display area is available before graphical rendering begins. |

---

**Source code:** `app.js` → `APP.renderSection(section)` — Waits 80 ms via `setTimeout` before calling the initialization function matching the active tab: `APP._initOntology2()` for `'ontology2'` (Hyperbolic), `APP._initTreemap()` for `'treemap'`, or `APP._initKnowledgeBase()` for `'knowledge-base'`. This delay ensures that the container (canvas or SVG) is present in the DOM before initialization.

---

## 2. Form — Presentation and UI

> Requirements related to display: layout, visual components, interactions, navigation, styles.

**Source code:** `app.js` → `APP.renderSection(section)`

### REQ-VW-001 — Rendering the Views tab with sub-tabs

| **If** | the ontologist navigates to the `Views` tab, |
|---|---|
| **Then** | the application displays three visualization sub-tabs — "🌐 Ontology (Hyperbolic)" and "🌐 Ontology (TreeMap)" for exploring the class hierarchy through two representations, and "🧩 Knowledge Base" for exploring `individuals` and their relationships — the active tab being remembered between navigations. The two ontology sub-tabs share the same 🌐 globe icon. |

| **If** | the ontologist selects a sub-tab, |
|---|---|
| **Then** | the `view` refreshes to display the corresponding visualization. |

---

**Source code:** `app.js` → `APP.renderViews()` — Generates a sidebar with three clickable sub-tabs: `'ontology2'` (label "🌐 Ontology (Hyperbolic)"), `'treemap'` (label "🌐 Ontology (TreeMap)"), and `'knowledge-base'` (label "🧩 Knowledge Base"), the active tab being stored in `APP._viewsTab` (initialized to `'ontology2'`). A click updates `APP._viewsTab` and calls `APP.renderSection('views')` again.

### REQ-VW-002 — "Ontology (Hyperbolic)" sub-tab: canvas hyperbolic tree

| **If** | the ontologist opens the "Ontology (Hyperbolic)" sub-tab, |
|---|---|
| **Then** | the application displays an interactive hyperbolic tree of the `classes` on a Poincaré disk, rendered on an HTML5 `<canvas>`, along with contextual help on the available interactions (drag, click, double-click, hover), a class counter, and the visualization area. |

---

**Source code:** `app.js` → `APP.renderViews()` and `APP._initOntology2()` — Generates a panel containing a `#cy-ontology2` canvas container, a `#cy-ontology2-count` counter, and textual help, then initializes the hyperbolic visualization via `APP._initOntology2()`. The old "Ontology" sub-tab based on a hand-rolled D3/SVG rendering of the Poincaré disk has been removed and replaced by this canvas rendering.

### REQ-VW-006 — Canvas rendering: focus+context and curved edges colored by branch

| **If** | the hyperbolic tree is displayed, |
|---|---|
| **Then** | `classes` close to the center are represented by larger, more readable nodes, while `classes` near the rim of the disk appear smaller (true focus+context inherent to hyperbolic geometry), the edges linking the nodes are curved and colored according to their top-level branch, and any focus change is smoothly animated. |

---

**Source code:** `app.js` → `APP._initOntology2()` — Draws on the `<canvas>` each node with a size decreasing from the center toward the rim of the disk (hyperbolic focus+context), curved edges whose color depends on the node's top-level branch, and animates focus transitions frame by frame. No external library is used (pure canvas).

### REQ-VW-011 — Class counter displayed in the toolbar

| **If** | the ontologist browses the hyperbolic graph, |
|---|---|
| **Then** | the total number of `classes` present in the `ontology` is displayed in the graph toolbar. |

---

**Source code:** `app.js` → `APP._initOntology2()` — Updates the `#cy-ontology2-count` element with the text `"N classes"`, where `N` comes from the `count` returned by `APP._buildOntologyTreeData()`.

### REQ-VW-012 — "Knowledge Base" sub-tab: D3 force graph

| **If** | the ontologist opens the "Knowledge Base" sub-tab, |
|---|---|
| **Then** | the application displays an interactive force graph of `individuals` and their relationships, along with a simulation restart button, a search field for filtering `individuals`, a class type legend, a counter, and the visualization area. |

---

**Source code:** `app.js` → `APP.renderViews()` and `APP._initKnowledgeBase()` — Generates a panel with: a "⟳ Restart" button (calling `APP._kbRestart()`), a filter field bound to `APP._kbFilter(this.value)`, a `#kb-legend` legend container, a `#kb-count` counter, and an SVG container `#kb-graph`. Calls `APP._initKnowledgeBase()` after 80 ms.

### REQ-VW-016 — Class legend in the Knowledge Base graph

| **If** | the ontologist visualizes the Knowledge Base graph containing `individuals` of several types, |
|---|---|
| **Then** | a legend displays the correspondence between each class type and its color in the graph, making it possible to visually identify `individuals` according to their membership. |

---

**Source code:** `app.js` → `APP._initKnowledgeBase()` — Collects unique `classId` values, sorts them, pre-assigns their colors via `APP._kbClassColor()`, and injects into `#kb-legend` a colored badge (8 px square) followed by the class name for each entry.

### REQ-VW-017 — SVG arrowheads on directional edges

| **If** | the Knowledge Base graph displays assertions between `individuals`, |
|---|---|
| **Then** | each link is directed and carries an arrowhead at its end, indicating the direction of the relationship; links highlighted on hover use a distinct-colored arrowhead. |

---

**Source code:** `app.js` → `APP._initKnowledgeBase()` — Adds two markers to the `<defs>` section of the SVG via `mkArrow(id, color)`: `kb-arrow` (color `#3a4a62`) and `kb-arrow-hi` (color `#3b82f6`). Edges use `marker-end='url(#kb-arrow)'`.

### REQ-VW-018 — Zoom and pan on the Knowledge Base graph

| **If** | the ontologist wishes to navigate in the Knowledge Base graph to explore dense areas or zoom out for an overview, |
|---|---|
| **Then** | the application allows zooming and panning freely, with a zoom factor between 0.1× and 4×. |

---

**Source code:** `app.js` → `APP._initKnowledgeBase()` — Applies `d3.zoom().scaleExtent([0.1, 4])` to the SVG; on each `zoom` event, applies the transformation to the `zoomG` group containing all graphical elements.

### REQ-VW-019 — Property labels on edges

| **If** | the Knowledge Base graph displays assertions between `individuals`, |
|---|---|
| **Then** | the name of the `object property` is displayed at the midpoint of each link, allowing the ontologist to identify the nature of the relationship without clicking on the edge. |

---

**Source code:** `app.js` → `APP._initKnowledgeBase()` — For each link, creates a `<text>` element containing `d.property` in the `labelG` group, positioned at `((source.x + target.x)/2, (source.y + target.y)/2 - 4)` and updated at each simulation tick.

### REQ-VW-021 — Node hover: connection highlighting

| **If** | the ontologist hovers over an `individual` in the Knowledge Base graph, |
|---|---|
| **Then** | only that node and its directly connected neighbors remain fully visible; all other nodes, edges, and labels are strongly faded, allowing focus on the immediate relationships of the `individual`. |

| **If** | the ontologist leaves the node, |
|---|---|
| **Then** | all graph elements return to their normal visibility. |

---

**Source code:** `app.js` → `APP._initKnowledgeBase()` (`mouseover` / `mouseout` handlers) — On `mouseover`: opacity of nodes not connected to 0.2, opacity of uninvolved edges and labels to 0.05. On `mouseout`: all opacities restored to 1.

### REQ-VW-026 — Individual and connection counter

| **If** | the ontologist browses the Knowledge Base graph, |
|---|---|
| **Then** | the total number of `individuals` and the total number of connections between them are displayed in the graph toolbar. |

---

**Source code:** `app.js` → `APP._initKnowledgeBase()` — Updates the `#kb-count` element with the text `"N individual(s) · M connection(s)"` (conditional plural for each value).

### REQ-VW-031 — "Ontology (TreeMap)" sub-tab: restyled proportional map

| **If** | the ontologist opens the "Ontology (TreeMap)" sub-tab, |
|---|---|
| **Then** | the application displays the class hierarchy as a proportional map (treemap) with an enriched style: a vibrant per-branch palette, depth-based shading, rounded tiles, hover highlighting, and branch headers showing the class name with a right-aligned child count. |

| **If** | the ontologist clicks on a tile, double-clicks, uses the breadcrumb or the "Up" button, |
|---|---|
| **Then** | the navigation behaviors remain unchanged: a click performs a drill-down (or edits the leaf class), a double-click opens the class editor, and both the breadcrumb and the "Up" button allow moving back up the hierarchy. |

---

**Source code:** `app.js` → `APP._initTreemap()` (based on the tree from `APP._buildOntologyTreeData()`) — Applies a vibrant per-branch palette and depth-based shading computed via the `APP._tmMix(c, k)` helper (color mixing; `fillOf` / `hoverOf` modulate the hue according to `d.depth` and whether the node has children), draws rounded tiles with hover highlighting, and shows for each branch header the class label followed by a right-aligned child count. Interactions (click = drill-down / edit, double-click = edit, breadcrumb, "Up" button) are preserved.

### REQ-VW-032 — Resizable Views sidebar

| **If** | the ontologist wishes to adjust the width of the sub-tab column of the `Views` tab, |
|---|---|
| **Then** | a drag handle (`col-resize` cursor) located between the sub-tab column and the content area lets the user resize the sidebar, the width being clamped between 140 px and 440 px (default 210 px). |

| **If** | the ontologist releases the drag handle, |
|---|---|
| **Then** | the active visualization re-fits to the newly available width. |

---

**Source code:** `app.js` → `APP._viewsSidebarDragStart` — Installs a drag handle (`col-resize`) between the sub-tab sidebar and the content; during the drag, updates the sidebar width clamping it between 140 px and 440 px (default 210 px), and on release re-fits the active visualization to the available area.

---

*Document generated on 2026-06-06 — claude-sonnet-4-6*
