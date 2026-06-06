# Exigences — Views

> Généré le 2026-06-06 | Dérivé strictement du code source | Aucune hallucination

## Table des matières

### Fond
- [REQ-VW-003 — Construction de l'arbre hiérarchique des classes](#req-vw-003--construction-de-larbre-hiérarchique-des-classes)
- [REQ-VW-004 — Résolution du meilleur label de classe](#req-vw-004--résolution-du-meilleur-label-de-classe)
- [REQ-VW-005 — Algorithme de placement hyperbolique (disque de Poincaré)](#req-vw-005--algorithme-de-placement-hyperbolique-disque-de-poincaré)
- [REQ-VW-007 — Clic sur un nœud : centrage par transformation de Möbius](#req-vw-007--clic-sur-un-nœud--centrage-par-transformation-de-möbius)
- [REQ-VW-008 — Double-clic (second clic au centre) : navigation vers l'éditeur de classes](#req-vw-008--double-clic-second-clic-au-centre--navigation-vers-léditeur-de-classes)
- [REQ-VW-009 — Réinitialisation du focus vers la racine](#req-vw-009--réinitialisation-du-focus-vers-la-racine)
- [REQ-VW-010 — Filtrage des classes par texte dans le graphe hyperbolique](#req-vw-010--filtrage-des-classes-par-texte-dans-le-graphe-hyperbolique)
- [REQ-VW-013 — Construction des nœuds (individuals) et liens (assertions)](#req-vw-013--construction-des-nœuds-individuals-et-liens-assertions)
- [REQ-VW-014 — Palette de couleurs par classe](#req-vw-014--palette-de-couleurs-par-classe)
- [REQ-VW-015 — Résolution du meilleur label d'individual](#req-vw-015--résolution-du-meilleur-label-dindividual)
- [REQ-VW-020 — Clic sur un nœud individual : navigation vers l'éditeur d'individuals](#req-vw-020--clic-sur-un-nœud-individual--navigation-vers-léditeur-dindividuals)
- [REQ-VW-022 — Glisser-déposer des nœuds dans le graphe Knowledge Base](#req-vw-022--glisser-déposer-des-nœuds-dans-le-graphe-knowledge-base)
- [REQ-VW-023 — Simulation de force D3 avec paramètres configurés](#req-vw-023--simulation-de-force-d3-avec-paramètres-configurés)
- [REQ-VW-024 — Redémarrage de la simulation de force](#req-vw-024--redémarrage-de-la-simulation-de-force)
- [REQ-VW-025 — Filtrage des individuals par texte dans le graphe Knowledge Base](#req-vw-025--filtrage-des-individuals-par-texte-dans-le-graphe-knowledge-base)
- [REQ-VW-027 — Blocage de l'onglet Views si aucune ontologie n'est connectée](#req-vw-027--blocage-de-longlet-views-si-aucune-ontologie-nest-connectée)
- [REQ-VW-028 — Initialisation différée des graphes après rendu HTML](#req-vw-028--initialisation-différée-des-graphes-après-rendu-html)

### Forme
- [REQ-VW-001 — Rendu de l'onglet Views avec sous-onglets](#req-vw-001--rendu-de-longlet-views-avec-sous-onglets)
- [REQ-VW-002 — Sous-onglet « Ontology » : arbre hyperbolique D3](#req-vw-002--sous-onglet-ontology--arbre-hyperbolique-d3)
- [REQ-VW-006 — Dessin SVG des nœuds et arêtes avec opacité et taille proportionnelles](#req-vw-006--dessin-svg-des-nœuds-et-arêtes-avec-opacité-et-taille-proportionnelles)
- [REQ-VW-011 — Compteur de classes affiché dans la barre d'outils](#req-vw-011--compteur-de-classes-affiché-dans-la-barre-doutils)
- [REQ-VW-012 — Sous-onglet « Knowledge Base » : graphe de force D3](#req-vw-012--sous-onglet-knowledge-base--graphe-de-force-d3)
- [REQ-VW-016 — Légende des classes dans le graphe Knowledge Base](#req-vw-016--légende-des-classes-dans-le-graphe-knowledge-base)
- [REQ-VW-017 — Arrowheads SVG sur les arêtes directionnelles](#req-vw-017--arrowheads-svg-sur-les-arêtes-directionnelles)
- [REQ-VW-018 — Zoom et pan sur le graphe Knowledge Base](#req-vw-018--zoom-et-pan-sur-le-graphe-knowledge-base)
- [REQ-VW-019 — Labels de propriétés sur les arêtes](#req-vw-019--labels-de-propriétés-sur-les-arêtes)
- [REQ-VW-021 — Survol d'un nœud : mise en évidence des connexions](#req-vw-021--survol-dun-nœud--mise-en-évidence-des-connexions)
- [REQ-VW-026 — Compteur d'individuals et de connexions](#req-vw-026--compteur-dindividuals-et-de-connexions)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles OWL, contraintes de données, comportements algorithmiques, validations, persistance.


### REQ-VW-003 — Construction de l'arbre hiérarchique des classes

| **Si** | l'ontologie est chargée et contient des classes dans `APP.state.classes`, |
|---|---|
| **Alors** | le système :<br>- construit une carte `classMap` indexée par `id` pour chaque classe<br>- calcule pour chaque classe ses parents via `subClassOf`<br>- élève les classes sans parent interne au rang de racines sous un nœud virtuel `owl:Thing`<br>- construit récursivement la hiérarchie via `buildNode(id, depth)`, chaque nœud exposant les propriétés `{ id, depth, label, hpos, basePos, children }` |

---

**Code source :** `app.js` → `APP._initHyperbolicGraph()`

### REQ-VW-004 — Résolution du meilleur label de classe

| **Si** | le système doit afficher le label d'une classe, |
|---|---|
| **Alors** | - il recherche dans `cls.annotations` une annotation `rdfs:label` ou `label` correspondant à `Settings.preferredLang`<br>- en l'absence de correspondance, il prend la première annotation `rdfs:label` disponible<br>- si aucune annotation n'existe, il retourne `cls.id` |

---

**Code source :** `app.js` → `APP._hypBestLabel(cls)`

### REQ-VW-005 — Algorithme de placement hyperbolique (disque de Poincaré)

| **Si** | l'arbre hiérarchique des classes est construit et doit être rendu dans le disque de Poincaré, |
|---|---|
| **Alors** | le système :<br>- utilise la constante `STEP_R = Math.tanh(0.4)` pour définir l'espacement entre niveaux<br>- distribue les enfants de chaque nœud en secteurs angulaires égaux via `layoutNode(node, pos, angle, wedge)`<br>- réalise les translations hyperboliques via `mobiusTranslate(z, a)` (transformation de Möbius)<br>- expose les helpers complexes (`cadd`, `csub`, `cmul`, `cconj`, `cdiv`, `polar`) dans `APP._hypMath` |

---

**Code source :** `app.js` → `APP._initHyperbolicGraph()` (fonctions internes `layoutNode`, `cadd`, `csub`, `cmul`, `cconj`, `cabs`, `cdiv`, `polar`, `mobiusFocus`, `mobiusTranslate`)

### REQ-VW-007 — Clic sur un nœud : centrage par transformation de Möbius

| **Si** | l'utilisateur clique sur un nœud du graphe hyperbolique **et** que la distance de ce nœud au centre est supérieure à 0.02, |
|---|---|
| **Alors** | le système :<br>- calcule `mobiusFocus(n.hpos, a)` pour chaque nœud de l'arbre afin de ramener le nœud cliqué vers le centre du disque<br>- appelle `APP._hypDraw(true)` pour animer la transition |

---

**Code source :** `app.js` → `APP._hypClick(node)`

### REQ-VW-008 — Double-clic (second clic au centre) : navigation vers l'éditeur de classes

| **Si** | l'utilisateur clique sur un nœud dont la distance au centre est inférieure à 0.10 **et** que l'`id` de ce nœud n'est pas `'owl:Thing'`, |
|---|---|
| **Alors** | le système :<br>- appelle `APP.navigate('classes')`<br>- après 80 ms, positionne `ClassEditor._selectedId = node.id` et appelle `ClassEditor.restoreSelection()` pour ouvrir directement la fiche d'édition de la classe correspondante |

---

**Code source :** `app.js` → `APP._hypClick(node)`

### REQ-VW-009 — Réinitialisation du focus vers la racine

| **Si** | l'utilisateur déclenche une réinitialisation du graphe hyperbolique, |
|---|---|
| **Alors** | le système recopie `basePos` dans `hpos` pour tous les nœuds de `APP._hypNodes`, restaurant les positions de layout initial, puis appelle `APP._hypDraw(true)` pour animer le retour. |

---

**Code source :** `app.js` → `APP._hypReset()`

### REQ-VW-010 — Filtrage des classes par texte dans le graphe hyperbolique

| **Si** | l'utilisateur saisit une requête de filtrage dans le champ dédié du graphe hyperbolique, |
|---|---|
| **Alors** | - chaque nœud dont le `label` ou l'`id` contient la requête (insensible à la casse) reçoit un stroke vert (`#10b981`) et un label coloré en `#6ee7b7`<br>- les nœuds non correspondants voient leurs attributs de surbrillance supprimés |

| **Si** | la requête est vide, |
|---|---|
| **Alors** | tous les attributs de surbrillance sont supprimés et `APP._hypDraw(false)` est appelé. |

---

**Code source :** `app.js` → `APP._hypFilter(q)`

### REQ-VW-013 — Construction des nœuds (individuals) et liens (assertions)

| **Si** | l'ontologie est chargée et contient des individuals dans `APP.state.individuals`, |
|---|---|
| **Alors** | le système :<br>- crée un nœud D3 `{ id, label, classId, ind, x, y }` par individual, positionné aléatoirement autour du centre<br>- parcourt `ind.objectAssertions` pour chaque individual et crée un lien `{ source, target, property, id }` pour chaque assertion dont la `target` est un individual existant<br>- stocke l'ensemble des nœuds et liens dans `APP._kbData` |

---

**Code source :** `app.js` → `APP._initKnowledgeBase()`

### REQ-VW-014 — Palette de couleurs par classe

| **Si** | un `classId` est rencontré pour la première fois lors de la construction du graphe Knowledge Base, |
|---|---|
| **Alors** | le système lui assigne la couleur suivante d'une palette de 15 couleurs hexadécimales prédéfinies, mémorisée dans `APP._kbColorMap`. |

| **Si** | le `classId` a déjà été rencontré, |
|---|---|
| **Alors** | le système retourne la couleur précédemment assignée sans modifier la palette. |

---

**Code source :** `app.js` → `APP._kbClassColor(classId)`

### REQ-VW-015 — Résolution du meilleur label d'individual

| **Si** | le système doit afficher le label d'un individual, |
|---|---|
| **Alors** | - il recherche dans `ind.annotations.labels` un label correspondant à `Settings.preferredLang`<br>- en l'absence de correspondance, il prend le premier label disponible<br>- si aucun label n'existe, il retourne `ind.id` |

---

**Code source :** `app.js` → `APP._kbBestLabel(ind)`

### REQ-VW-020 — Clic sur un nœud individual : navigation vers l'éditeur d'individuals

| **Si** | l'utilisateur clique sur un nœud individual dans le graphe Knowledge Base, |
|---|---|
| **Alors** | le système :<br>- appelle `APP.navigate('individuals')`<br>- après 120 ms, positionne `IndividualEditor._selectedId = d.id` et appelle `IndividualEditor.restoreSelection()` pour afficher la fiche de l'individual cliqué |

---

**Code source :** `app.js` → `APP._initKnowledgeBase()`

### REQ-VW-022 — Glisser-déposer des nœuds dans le graphe Knowledge Base

| **Si** | l'utilisateur commence à faire glisser un nœud (`dragstart`), |
|---|---|
| **Alors** | la simulation est relancée avec `alphaTarget(0.3)` et les coordonnées `fx`/`fy` du nœud sont fixées à la position courante. |

| **Si** | l'utilisateur déplace le nœud (`drag`), |
|---|---|
| **Alors** | les coordonnées `fx`/`fy` suivent le curseur. |

| **Si** | l'utilisateur relâche le nœud (`dragend`), |
|---|---|
| **Alors** | `alphaTarget(0)` refroidit la simulation et `fx`/`fy` sont mis à `null` pour libérer le nœud. |

---

**Code source :** `app.js` → `APP._initKnowledgeBase()`

### REQ-VW-023 — Simulation de force D3 avec paramètres configurés

| **Si** | le graphe Knowledge Base est initialisé avec des nœuds et des liens, |
|---|---|
| **Alors** | le système crée une simulation `d3.forceSimulation(nodes)` avec les forces suivantes :<br>- `forceLink` : distance cible 120, force 0.6<br>- `forceManyBody` : intensité -350 (répulsion)<br>- `forceCenter` : centré sur `(W/2, H/2)`, force 0.05<br>- `forceCollide` : rayon 28 |

**et** met à jour à chaque tick les positions des arêtes, labels d'arêtes et nœuds.

---

**Code source :** `app.js` → `APP._initKnowledgeBase()`

### REQ-VW-024 — Redémarrage de la simulation de force

| **Si** | l'utilisateur déclenche un redémarrage de la simulation **et** que `APP._kbSim` est défini, |
|---|---|
| **Alors** | le système appelle `APP._kbSim.alpha(0.8).restart()`, réchauffant la simulation et la relançant depuis son état courant. |

---

**Code source :** `app.js` → `APP._kbRestart()`

### REQ-VW-025 — Filtrage des individuals par texte dans le graphe Knowledge Base

| **Si** | l'utilisateur saisit une requête de filtrage dans le champ dédié du graphe Knowledge Base, |
|---|---|
| **Alors** | - les nœuds dont le `label` ou le `classId` contient la requête (insensible à la casse) conservent une opacité de 1<br>- les autres nœuds passent à une opacité de 0.1 |

| **Si** | la requête est vide, |
|---|---|
| **Alors** | tous les nœuds et labels reviennent à une opacité de 1. |

---

**Code source :** `app.js` → `APP._kbFilter(q)`

### REQ-VW-027 — Blocage de l'onglet Views si aucune ontologie n'est connectée

| **Si** | l'utilisateur tente d'accéder à la section `'views'` **et** que `APP.state.ontology` est null, |
|---|---|
| **Alors** | le système injecte dans `#main-content` le message retourné par `APP._noOntoMsg()` (contenant un bouton « Go to Ontologies ») et interrompt le rendu normal de la vue. |

---

**Code source :** `app.js` → `APP.renderSection(section)`

### REQ-VW-028 — Initialisation différée des graphes après rendu HTML

| **Si** | le HTML de `APP.renderViews()` vient d'être injecté dans le DOM, |
|---|---|
| **Alors** | le système attend 80 ms via `setTimeout` avant d'initialiser le graphe correspondant à `APP._viewsTab` :<br>- `APP._initHyperbolicGraph()` si l'onglet actif est `'ontology'`<br>- `APP._initKnowledgeBase()` si l'onglet actif est `'knowledge-base'` |

Ce délai garantit que le conteneur SVG est présent dans le DOM avant l'initialisation D3.

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

**Code source :** `app.js` → `APP.renderSection(section)`

### REQ-VW-001 — Rendu de l'onglet Views avec sous-onglets

| **Si** | l'utilisateur navigue vers l'onglet Views, |
|---|---|
| **Alors** | le système génère une barre latérale avec deux sous-onglets cliquables : `'ontology'` (libellé « 🗂 Ontology ») et `'knowledge-base'` (libellé « 🧩 Knowledge Base »), l'onglet actif étant mémorisé dans `APP._viewsTab` (initialisé à `'ontology'`). |

| **Si** | l'utilisateur clique sur un sous-onglet, |
|---|---|
| **Alors** | `APP._viewsTab` est mis à jour et `APP.renderSection('views')` est rappelé pour rafraîchir la vue. |

---

**Code source :** `app.js` → `APP.renderViews()`

### REQ-VW-002 — Sous-onglet « Ontology » : arbre hyperbolique D3

| **Si** | `APP._viewsTab === 'ontology'`, |
|---|---|
| **Alors** | le système génère un panneau contenant :<br>- un bouton « ⟳ Reset » (appel `APP._hypReset()`)<br>- un champ de saisie de filtre relié à `APP._hypFilter(this.value)`<br>- une aide textuelle « Clic → focus · Double-clic → éditer »<br>- un compteur (`#cy-node-count`)<br>- un conteneur SVG `#cy-ontology` |

---

**Code source :** `app.js` → `APP.renderViews()`

### REQ-VW-006 — Dessin SVG des nœuds et arêtes avec opacité et taille proportionnelles

| **Si** | le graphe hyperbolique doit être dessiné, |
|---|---|
| **Alors** | pour chaque nœud, le système calcule sa distance au centre (`cabs(node.hpos)`) et en déduit :<br>- le rayon du cercle : `Math.max(3.5, 10 * (1 - dist*0.65))`<br>- l'opacité : `Math.max(0.12, 1 - dist*0.55)`<br>- la taille de police : `Math.max(8, 13 * (1 - dist*0.82))`<br>- la couleur de remplissage et la couleur du texte<br>- le masquage du label si `dist >= 0.78` |

| **Si** | `animated === true`, |
|---|---|
| **Alors** | une transition CSS `transform 0.42s cubic-bezier(0.33,1,0.68,1)` est appliquée à chaque nœud. |

Chaque arête est rendue sous forme d'élément `<line>` reliant le nœud à son parent.

---

**Code source :** `app.js` → `APP._hypDraw(animated)`

### REQ-VW-011 — Compteur de classes affiché dans la barre d'outils

| **Si** | le graphe hyperbolique est initialisé, |
|---|---|
| **Alors** | le système met à jour l'élément `#cy-node-count` avec le texte `"N classe(s)"` (pluriel si N > 1). |

---

**Code source :** `app.js` → `APP._initHyperbolicGraph()`

### REQ-VW-012 — Sous-onglet « Knowledge Base » : graphe de force D3

| **Si** | `APP._viewsTab === 'knowledge-base'`, |
|---|---|
| **Alors** | le système génère un panneau contenant :<br>- un bouton « ⟳ Restart » (appel `APP._kbRestart()`)<br>- un champ filtre relié à `APP._kbFilter(this.value)`<br>- un conteneur de légende `#kb-legend`<br>- un compteur `#kb-count`<br>- un conteneur SVG `#kb-graph` |

**et** appelle `APP._initKnowledgeBase()` après un délai de 80 ms.

---

**Code source :** `app.js` → `APP.renderViews()` et `APP._initKnowledgeBase()`

### REQ-VW-016 — Légende des classes dans le graphe Knowledge Base

| **Si** | le graphe Knowledge Base est initialisé et contient des nœuds, |
|---|---|
| **Alors** | le système collecte les `classId` uniques, les trie, pré-assigne leurs couleurs via `APP._kbClassColor()`, puis injecte dans `#kb-legend` un badge coloré (carré de 8 px) suivi du nom de la classe pour chaque entrée. |

---

**Code source :** `app.js` → `APP._initKnowledgeBase()`

### REQ-VW-017 — Arrowheads SVG sur les arêtes directionnelles

| **Si** | le graphe Knowledge Base est initialisé, |
|---|---|
| **Alors** | le système ajoute dans la section `<defs>` du SVG deux marqueurs via `mkArrow(id, color)` :<br>- `kb-arrow` (couleur `#3a4a62`, flèche normale)<br>- `kb-arrow-hi` (couleur `#3b82f6`, flèche mise en évidence) |

Les arêtes utilisent `marker-end='url(#kb-arrow)'`.

---

**Code source :** `app.js` → `APP._initKnowledgeBase()`

### REQ-VW-018 — Zoom et pan sur le graphe Knowledge Base

| **Si** | le graphe Knowledge Base est affiché, |
|---|---|
| **Alors** | le système applique `d3.zoom().scaleExtent([0.1, 4])` au SVG et, lors de chaque événement `zoom`, applique la transformation au groupe `zoomG` contenant tous les éléments graphiques, permettant un zoom de facteur 0.1× à 4×. |

---

**Code source :** `app.js` → `APP._initKnowledgeBase()`

### REQ-VW-019 — Labels de propriétés sur les arêtes

| **Si** | le graphe Knowledge Base est initialisé avec des liens, |
|---|---|
| **Alors** | pour chaque lien, un élément `<text>` contenant la valeur `d.property` est créé dans le groupe `labelG` et positionné au milieu de l'arête (`(source.x + target.x)/2, (source.y + target.y)/2 - 4`), mis à jour à chaque tick de la simulation. |

---

**Code source :** `app.js` → `APP._initKnowledgeBase()`

### REQ-VW-021 — Survol d'un nœud : mise en évidence des connexions

| **Si** | l'utilisateur survole un nœud (`mouseover`), |
|---|---|
| **Alors** | le système :<br>- réduit l'opacité des nœuds non connectés à 0.2<br>- réduit l'opacité des arêtes et labels non impliqués à 0.05 |

| **Si** | l'utilisateur quitte le nœud (`mouseout`), |
|---|---|
| **Alors** | toutes les opacités sont remises à 1. |

---

**Code source :** `app.js` → `APP._initKnowledgeBase()` (handlers `mouseover` / `mouseout`)

### REQ-VW-026 — Compteur d'individuals et de connexions

| **Si** | le graphe Knowledge Base est initialisé, |
|---|---|
| **Alors** | le système met à jour l'élément `#kb-count` avec le texte `"N individual(s) · M connexion(s)"` (pluriel conditionnel pour chaque valeur). |

---

*Document généré le 2026-06-06 — claude-sonnet-4-6*

**Code source :** `app.js` → `APP._initKnowledgeBase()`
