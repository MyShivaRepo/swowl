# Exigences — Views

> Généré le 2026-06-06 | Dérivé strictement du code source | Aucune hallucination

## Table des matières

### Fond
- [REQ-VW-003 — Construction de l'arbre hiérarchique des classes](#req-vw-003--construction-de-larbre-hiérarchique-des-classes)
- [REQ-VW-004 — Résolution du meilleur label de classe](#req-vw-004--résolution-du-meilleur-label-de-classe)
- [REQ-VW-005 — Placement hyperbolique sur disque de Poincaré (canvas)](#req-vw-005--placement-hyperbolique-sur-disque-de-poincaré-canvas)
- [REQ-VW-007 — Clic sur un nœud : recentrage animé par transformation de Möbius](#req-vw-007--clic-sur-un-nœud--recentrage-animé-par-transformation-de-möbius)
- [REQ-VW-008 — Double-clic sur un nœud : navigation vers l'éditeur de classes](#req-vw-008--double-clic-sur-un-nœud--navigation-vers-léditeur-de-classes)
- [REQ-VW-009 — Glisser pour déplacer le plan hyperbolique](#req-vw-009--glisser-pour-déplacer-le-plan-hyperbolique)
- [REQ-VW-010 — Survol d'un nœud : mise en évidence de la sous-branche](#req-vw-010--survol-dun-nœud--mise-en-évidence-de-la-sous-branche)
- [REQ-VW-030 — Construction de l'arbre Ontology pour les visualisations](#req-vw-030--construction-de-larbre-ontology-pour-les-visualisations)
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
- [REQ-VW-002 — Sous-onglet « Ontology (Hyperbolic) » : arbre hyperbolique sur canvas](#req-vw-002--sous-onglet-ontology-hyperbolic--arbre-hyperbolique-sur-canvas)
- [REQ-VW-006 — Rendu canvas : focus+context et arêtes courbes colorées par branche](#req-vw-006--rendu-canvas--focuscontext-et-arêtes-courbes-colorées-par-branche)
- [REQ-VW-011 — Compteur de classes affiché dans la barre d'outils](#req-vw-011--compteur-de-classes-affiché-dans-la-barre-doutils)
- [REQ-VW-012 — Sous-onglet « Knowledge Base » : graphe de force D3](#req-vw-012--sous-onglet-knowledge-base--graphe-de-force-d3)
- [REQ-VW-016 — Légende des classes dans le graphe Knowledge Base](#req-vw-016--légende-des-classes-dans-le-graphe-knowledge-base)
- [REQ-VW-017 — Arrowheads SVG sur les arêtes directionnelles](#req-vw-017--arrowheads-svg-sur-les-arêtes-directionnelles)
- [REQ-VW-018 — Zoom et pan sur le graphe Knowledge Base](#req-vw-018--zoom-et-pan-sur-le-graphe-knowledge-base)
- [REQ-VW-019 — Labels de propriétés sur les arêtes](#req-vw-019--labels-de-propriétés-sur-les-arêtes)
- [REQ-VW-021 — Survol d'un nœud : mise en évidence des connexions](#req-vw-021--survol-dun-nœud--mise-en-évidence-des-connexions)
- [REQ-VW-026 — Compteur d'individuals et de connexions](#req-vw-026--compteur-dindividuals-et-de-connexions)
- [REQ-VW-031 — Sous-onglet « Ontology (TreeMap) » : carte de proportions restylée](#req-vw-031--sous-onglet-ontology-treemap--carte-de-proportions-restylée)
- [REQ-VW-032 — Barre latérale Views redimensionnable](#req-vw-032--barre-latérale-views-redimensionnable)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles OWL, contraintes de données, comportements algorithmiques, validations, persistance.


### REQ-VW-003 — Construction de l'arbre hiérarchique des classes

| **Si** | l'`ontologie` est chargée et contient des `classes` organisées en hiérarchie, |
|---|---|
| **Alors** | l'arbre des `classes` reflète fidèlement les relations de spécialisation : chaque `classe` est positionnée sous son concept parent, les `classes` sans parent sont rattachées à la racine universelle `owl:Thing`, et la hiérarchie est construite récursivement en exposant pour chaque nœud son niveau de profondeur, son label et ses enfants. |

---

**Code source :** `app.js` → `APP._buildOntologyTreeData()` — Construit une carte `classMap` indexée par `id`, calcule les parents via `subClassOf`, élève les classes sans parent interne sous un nœud virtuel racine `owl:Thing`, et construit récursivement la hiérarchie, chaque nœud exposant son `id`, son `depth`, son `label` et ses `children`. Cet arbre alimente à la fois la visualisation hyperbolique et la visualisation TreeMap.

### REQ-VW-004 — Résolution du meilleur label de classe

| **Si** | l'ontologiste consulte l'arbre des `classes` et qu'une `classe` possède plusieurs annotations de label dans des langues différentes, |
|---|---|
| **Alors** | l'application affiche le label dans la langue préférée de l'utilisateur ; à défaut, le premier label disponible ; à défaut encore, l'identifiant technique de la `classe`. |

---

**Code source :** `app.js` → `APP._hypBestLabel(cls)` — Recherche dans `cls.annotations` une annotation `rdfs:label` ou `label` correspondant à `Settings.preferredLang`, prend la première annotation disponible en l'absence de correspondance, et retourne `cls.id` si aucune annotation n'existe.

### REQ-VW-005 — Placement hyperbolique sur disque de Poincaré (canvas)

| **Si** | l'ontologiste visualise l'arbre des `classes` dans le sous-onglet « Ontology (Hyperbolic) », |
|---|---|
| **Alors** | les `classes` sont disposées dans un espace hyperbolique de type disque de Poincaré : chaque niveau de hiérarchie est espacé de manière constante, les enfants d'un nœud sont distribués en secteurs angulaires égaux autour de leur parent, et les translations entre niveaux respectent la géométrie hyperbolique (transformations de Möbius). |

---

**Code source :** `app.js` → `APP._initOntology2()` — Construit l'arbre via `APP._buildOntologyTreeData()` (racine `owl:Thing`, hiérarchie issue de `subClassOf`), puis place récursivement chaque nœud dans le disque de Poincaré à l'aide de fonctions d'arithmétique complexe et de transformations de Möbius, en distribuant les enfants en secteurs angulaires égaux et en espaçant les niveaux de manière constante. Le rendu est effectué sur un élément `<canvas>` HTML5, sans bibliothèque externe (canvas pur).

### REQ-VW-007 — Clic sur un nœud : recentrage animé par transformation de Möbius

| **Si** | l'ontologiste clique sur une `classe` dans le graphe hyperbolique pour l'explorer, |
|---|---|
| **Alors** | la `classe` sélectionnée glisse vers le centre du disque via une animation fluide (« glide »), permettant de la mettre en focus et de visualiser ses voisins proches avec plus de détails. |

---

**Code source :** `app.js` → `APP._initOntology2()` — Au clic sur un nœud (relâchement `pointerup` avec `moved < 3`), appelle la fonction interne `glide(n)` qui recentre le nœud au centre du disque par translations de Möbius successives (`applyT`) animées via `requestAnimationFrame`, avec redessin du canvas à chaque image.

### REQ-VW-008 — Double-clic sur un nœud : navigation vers l'éditeur de classes

| **Si** | l'ontologiste double-clique sur une `classe` dans le graphe hyperbolique pour l'éditer, |
|---|---|
| **Alors** | l'application navigue automatiquement vers la fiche d'édition de cette `classe` (onglet Classes), sans manipulation supplémentaire. |

---

**Code source :** `app.js` → `APP._initOntology2()` — Sur l'événement `dblclick`, si le nœud visé possède un `id` distinct de la racine `owl:Thing`, appelle `APP.navigateTo('classes', n.id)` qui navigue vers l'onglet Classes et sélectionne la `classe` correspondante.

### REQ-VW-009 — Glisser pour déplacer le plan hyperbolique

| **Si** | l'ontologiste glisse (drag) dans le graphe hyperbolique, |
|---|---|
| **Alors** | l'ensemble du plan hyperbolique se déplace (pan) en suivant le mouvement du curseur, permettant d'explorer librement l'arbre sans recentrer sur un nœud particulier. |

---

**Code source :** `app.js` → `APP._initOntology2()` — Les gestionnaires de pointeur (`pointerdown` / `pointermove` / `pointerup`) suivent l'état `dragging` et appliquent au plan hyperbolique une translation (`applyT`) proportionnelle au déplacement du curseur, avec redessin du canvas pendant le glissement (curseur `grabbing`).

### REQ-VW-010 — Survol d'un nœud : mise en évidence de la sous-branche

| **Si** | l'ontologiste survole une `classe` dans le graphe hyperbolique, |
|---|---|
| **Alors** | la sous-branche issue de ce nœud (le nœud et ses descendants) est mise en évidence, tandis que les autres `classes` sont estompées, permettant de focaliser sur la portion concernée de la hiérarchie. |

| **Si** | l'ontologiste quitte le nœud, |
|---|---|
| **Alors** | toutes les `classes` retrouvent leur apparence normale. |

---

**Code source :** `app.js` → `APP._initOntology2()` — Sur l'événement `pointermove` sans glissement, détecte le nœud sous le curseur et constitue un ensemble `hoverSet` (nœud et descendants) ; lors du dessin, les éléments hors de `hoverSet` sont atténués (opacité réduite à ~0.18–0.22), puis le canvas est redessiné.

### REQ-VW-030 — Construction de l'arbre Ontology pour les visualisations

| **Si** | l'`ontologie` est chargée et contient des `classes` organisées via `subClassOf`, |
|---|---|
| **Alors** | un arbre hiérarchique unique est construit à partir de la racine universelle `owl:Thing` et partagé par les deux sous-onglets de visualisation de l'ontologie (Hyperbolic et TreeMap), garantissant une représentation cohérente de la hiérarchie. |

---

**Code source :** `app.js` → `APP._buildOntologyTreeData()` — Indexe les `classes` par `id`, déduit les parents via `subClassOf`, rattache les `classes` orphelines à la racine `owl:Thing`, et construit récursivement l'arbre `{ id, depth, label, children }` consommé par `APP._initOntology2()` (Hyperbolic) et par le rendu TreeMap.

### REQ-VW-013 — Construction des nœuds (individuals) et liens (assertions)

| **Si** | l'`ontologie` est chargée et contient des `individuals` reliés par des `ObjectProperty`, |
|---|---|
| **Alors** | chaque `individual` est représenté comme un nœud du graphe, et chaque assertion entre deux `individuals` existants est représentée comme un lien orienté entre les nœuds correspondants. |

---

**Code source :** `app.js` → `APP._initKnowledgeBase()` — Crée un nœud D3 `{ id, label, classId, ind, x, y }` par individual positionné aléatoirement autour du centre, parcourt `ind.objectAssertions` pour créer des liens `{ source, target, property, id }` pour chaque assertion dont la cible est un individual existant, et stocke l'ensemble dans `APP._kbData`.

### REQ-VW-014 — Palette de couleurs par classe

| **Si** | l'ontologiste visualise le graphe Knowledge Base contenant des `individuals` appartenant à différentes `classes`, |
|---|---|
| **Alors** | chaque `classe` est identifiée par une couleur distincte et cohérente tout au long de la session, permettant de distinguer visuellement les `individuals` selon leur type. |

| **Si** | la même `classe` est rencontrée à nouveau, |
|---|---|
| **Alors** | la même couleur lui est appliquée sans modification. |

---

**Code source :** `app.js` → `APP._kbClassColor(classId)` — Assigne à chaque `classId` rencontré pour la première fois la couleur suivante d'une palette de 15 couleurs hexadécimales prédéfinies, mémorisée dans `APP._kbColorMap` ; retourne la couleur précédemment assignée si le `classId` est déjà connu.

### REQ-VW-015 — Résolution du meilleur label d'individual

| **Si** | l'ontologiste consulte le graphe Knowledge Base et qu'un `individual` possède plusieurs labels dans des langues différentes, |
|---|---|
| **Alors** | l'application affiche le label dans la langue préférée de l'utilisateur ; à défaut, le premier label disponible ; à défaut encore, l'identifiant technique de l'`individual`. |

---

**Code source :** `app.js` → `APP._kbBestLabel(ind)` — Recherche dans `ind.annotations.labels` un label correspondant à `Settings.preferredLang`, prend le premier label disponible en l'absence de correspondance, et retourne `ind.id` si aucun label n'existe.

### REQ-VW-020 — Clic sur un nœud individual : navigation vers l'éditeur d'individuals

| **Si** | l'ontologiste clique sur un `individual` dans le graphe Knowledge Base pour consulter ou modifier ses `propriétés`, |
|---|---|
| **Alors** | l'application navigue automatiquement vers la fiche d'édition de cet `individual`, sans manipulation supplémentaire. |

---

**Code source :** `app.js` → `APP._initKnowledgeBase()` — Appelle `APP.navigate('individuals')`, puis après 120 ms positionne `IndividualEditor._selectedId = d.id` et appelle `IndividualEditor.restoreSelection()`.

### REQ-VW-022 — Glisser-déposer des nœuds dans le graphe Knowledge Base

| **Si** | l'ontologiste commence à déplacer un `individual` dans le graphe Knowledge Base, |
|---|---|
| **Alors** | la simulation s'anime et le nœud suit le mouvement du curseur. |

| **Si** | l'ontologiste déplace le curseur, |
|---|---|
| **Alors** | le nœud suit la position du curseur en temps réel. |

| **Si** | l'ontologiste relâche le nœud, |
|---|---|
| **Alors** | la simulation reprend son comportement naturel et le nœud est libéré pour se repositionner librement. |

---

**Code source :** `app.js` → `APP._initKnowledgeBase()` — Sur `dragstart` : `alphaTarget(0.3)` et fixation de `fx`/`fy` à la position courante. Sur `drag` : mise à jour de `fx`/`fy` selon la position du curseur. Sur `dragend` : `alphaTarget(0)` et remise à `null` de `fx`/`fy`.

### REQ-VW-023 — Simulation de force D3 avec paramètres configurés

| **Si** | l'ontologiste ouvre le graphe Knowledge Base contenant des `individuals` et des assertions, |
|---|---|
| **Alors** | les nœuds se positionnent automatiquement dans l'espace en appliquant des forces d'attraction entre `individuals` reliés, de répulsion entre tous les nœuds, d'attraction vers le centre, et d'évitement de chevauchement, afin de produire une disposition lisible et équilibrée. |

---

**Code source :** `app.js` → `APP._initKnowledgeBase()` — Crée une simulation `d3.forceSimulation(nodes)` avec : `forceLink` (distance 120, force 0.6), `forceManyBody` (intensité -350), `forceCenter` centré sur `(W/2, H/2)` (force 0.05), et `forceCollide` (rayon 28). Met à jour à chaque tick les positions des arêtes, labels d'arêtes et nœuds.

### REQ-VW-024 — Redémarrage de la simulation de force

| **Si** | l'ontologiste souhaite réorganiser le graphe Knowledge Base après avoir déplacé des nœuds ou modifié des données, |
|---|---|
| **Alors** | la simulation reprend depuis son état courant avec une énergie initiale élevée, permettant aux nœuds de trouver une nouvelle disposition équilibrée. |

---

**Code source :** `app.js` → `APP._kbRestart()` — Si `APP._kbSim` est défini, appelle `APP._kbSim.alpha(0.8).restart()`.

### REQ-VW-025 — Filtrage des individuals par texte dans le graphe Knowledge Base

| **Si** | l'ontologiste saisit un terme pour rechercher un `individual` ou un type de `classe` dans le graphe Knowledge Base, |
|---|---|
| **Alors** | les nœuds correspondant au terme restent pleinement visibles, tandis que les autres sont fortement estompés pour mettre en évidence les résultats pertinents. |

| **Si** | l'ontologiste efface le terme de recherche, |
|---|---|
| **Alors** | tous les nœuds et leurs labels retrouvent une visibilité complète. |

---

**Code source :** `app.js` → `APP._kbFilter(q)` — Les nœuds dont le `label` ou le `classId` contient la requête (insensible à la casse) conservent une opacité de 1 ; les autres passent à 0.1. Si la requête est vide, tous les nœuds et labels reviennent à une opacité de 1.

### REQ-VW-027 — Blocage de l'onglet Views si aucune ontologie n'est connectée

| **Si** | l'ontologiste tente d'accéder à la section `Views` sans avoir préalablement chargé une `ontologie`, |
|---|---|
| **Alors** | l'application affiche un message informatif invitant l'utilisateur à connecter une `ontologie`, avec un accès direct à la section de gestion des `ontologies`, et n'affiche pas les graphes. |

---

**Code source :** `app.js` → `APP.renderSection(section)` — Si `APP.state.ontology` est null, injecte dans `#main-content` le message retourné par `APP._noOntoMsg()` (contenant un bouton « Go to Ontologies ») et interrompt le rendu normal de la vue.

### REQ-VW-028 — Initialisation différée des graphes après rendu HTML

| **Si** | l'ontologiste navigue vers l'onglet `Views` et que le HTML vient d'être injecté dans la page, |
|---|---|
| **Alors** | le graphe correspondant au sous-onglet actif est initialisé après un court délai, garantissant que la zone d'affichage est disponible avant le début du rendu graphique. |

---

**Code source :** `app.js` → `APP.renderSection(section)` — Attend 80 ms via `setTimeout` avant d'appeler la fonction d'initialisation correspondant à l'onglet actif : `APP._initOntology2()` pour `'ontology2'` (Hyperbolic), `APP._initTreemap()` pour `'treemap'`, ou `APP._initKnowledgeBase()` pour `'knowledge-base'`. Ce délai garantit que le conteneur (canvas ou SVG) est présent dans le DOM avant l'initialisation.

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

**Code source :** `app.js` → `APP.renderSection(section)`

### REQ-VW-001 — Rendu de l'onglet Views avec sous-onglets

| **Si** | l'ontologiste navigue vers l'onglet `Views`, |
|---|---|
| **Alors** | l'application affiche trois sous-onglets de visualisation — « 🌐 Ontology (Hyperbolic) » et « 🌐 Ontology (TreeMap) » pour explorer la hiérarchie des `classes` selon deux représentations, et « 🧩 Knowledge Base » pour explorer les `individuals` et leurs relations — l'onglet actif étant mémorisé entre les navigations. Les deux sous-onglets ontologiques partagent la même icône globe 🌐. |

| **Si** | l'ontologiste sélectionne un sous-onglet, |
|---|---|
| **Alors** | la `vue` se rafraîchit pour afficher la visualisation correspondante. |

---

**Code source :** `app.js` → `APP.renderViews()` — Génère une barre latérale avec trois sous-onglets cliquables : `'ontology2'` (libellé « 🌐 Ontology (Hyperbolic) »), `'treemap'` (libellé « 🌐 Ontology (TreeMap) ») et `'knowledge-base'` (libellé « 🧩 Knowledge Base »), l'onglet actif étant mémorisé dans `APP._viewsTab` (initialisé à `'ontology2'`). Un clic met à jour `APP._viewsTab` et rappelle `APP.renderSection('views')`.

### REQ-VW-002 — Sous-onglet « Ontology (Hyperbolic) » : arbre hyperbolique sur canvas

| **Si** | l'ontologiste ouvre le sous-onglet « Ontology (Hyperbolic) », |
|---|---|
| **Alors** | l'application affiche un arbre hyperbolique interactif des `classes` sur un disque de Poincaré, rendu sur un `<canvas>` HTML5, accompagné d'une aide contextuelle sur les interactions disponibles (glisser, clic, double-clic, survol), d'un compteur de `classes` et de la zone de visualisation. |

---

**Code source :** `app.js` → `APP.renderViews()` et `APP._initOntology2()` — Génère un panneau contenant un conteneur canvas `#cy-ontology2`, un compteur `#cy-ontology2-count` et une aide textuelle, puis initialise la visualisation hyperbolique via `APP._initOntology2()`. L'ancien sous-onglet « Ontology » fondé sur un rendu D3/SVG manuel du disque de Poincaré a été supprimé et remplacé par ce rendu canvas.

### REQ-VW-006 — Rendu canvas : focus+context et arêtes courbes colorées par branche

| **Si** | l'arbre hyperbolique est affiché, |
|---|---|
| **Alors** | les `classes` proches du centre sont représentées par des nœuds plus grands et plus lisibles, tandis que les `classes` proches du bord du disque apparaissent plus petites (effet focus+context propre à la géométrie hyperbolique), les arêtes reliant les nœuds sont courbes et colorées selon leur branche de premier niveau, et tout changement de focus est animé de manière fluide. |

---

**Code source :** `app.js` → `APP._initOntology2()` — Dessine sur le `<canvas>` chaque nœud avec une taille décroissante du centre vers le bord du disque (focus+context hyperbolique), des arêtes courbes dont la couleur dépend de la branche de premier niveau du nœud, et anime les transitions de focus image par image. Aucune bibliothèque externe n'est utilisée (canvas pur).

### REQ-VW-011 — Compteur de classes affiché dans la barre d'outils

| **Si** | l'ontologiste consulte le graphe hyperbolique, |
|---|---|
| **Alors** | le nombre total de `classes` présentes dans l'`ontologie` est affiché dans la barre d'outils du graphe. |

---

**Code source :** `app.js` → `APP._initOntology2()` — Met à jour l'élément `#cy-ontology2-count` avec le texte `"N classes"`, le nombre `N` provenant du `count` retourné par `APP._buildOntologyTreeData()`.

### REQ-VW-012 — Sous-onglet « Knowledge Base » : graphe de force D3

| **Si** | l'ontologiste ouvre le sous-onglet « Knowledge Base », |
|---|---|
| **Alors** | l'application affiche un graphe de force interactif des `individuals` et de leurs relations, accompagné d'un bouton de relance de la simulation, d'un champ de recherche pour filtrer les `individuals`, d'une légende des types de `classes`, d'un compteur et de la zone de visualisation. |

---

**Code source :** `app.js` → `APP.renderViews()` et `APP._initKnowledgeBase()` — Génère un panneau avec : un bouton « ⟳ Restart » (appel `APP._kbRestart()`), un champ filtre relié à `APP._kbFilter(this.value)`, un conteneur de légende `#kb-legend`, un compteur `#kb-count`, et un conteneur SVG `#kb-graph`. Appelle `APP._initKnowledgeBase()` après 80 ms.

### REQ-VW-016 — Légende des classes dans le graphe Knowledge Base

| **Si** | l'ontologiste visualise le graphe Knowledge Base contenant des `individuals` de plusieurs types, |
|---|---|
| **Alors** | une légende affiche la correspondance entre chaque type de `classe` et sa couleur dans le graphe, permettant d'identifier visuellement les `individuals` selon leur appartenance. |

---

**Code source :** `app.js` → `APP._initKnowledgeBase()` — Collecte les `classId` uniques, les trie, pré-assigne leurs couleurs via `APP._kbClassColor()`, et injecte dans `#kb-legend` un badge coloré (carré de 8 px) suivi du nom de la classe pour chaque entrée.

### REQ-VW-017 — Arrowheads SVG sur les arêtes directionnelles

| **Si** | le graphe Knowledge Base affiche des assertions entre `individuals`, |
|---|---|
| **Alors** | chaque lien est orienté et porte une flèche à son extrémité, indiquant la direction de la relation ; les liens mis en évidence lors du survol utilisent une flèche de couleur distincte. |

---

**Code source :** `app.js` → `APP._initKnowledgeBase()` — Ajoute dans la section `<defs>` du SVG deux marqueurs via `mkArrow(id, color)` : `kb-arrow` (couleur `#3a4a62`) et `kb-arrow-hi` (couleur `#3b82f6`). Les arêtes utilisent `marker-end='url(#kb-arrow)'`.

### REQ-VW-018 — Zoom et pan sur le graphe Knowledge Base

| **Si** | l'ontologiste souhaite naviguer dans le graphe Knowledge Base pour explorer des zones denses ou s'éloigner pour une `vue` d'ensemble, |
|---|---|
| **Alors** | l'application permet de zoomer et de déplacer la `vue` librement, avec un facteur de zoom compris entre 0.1× et 4×. |

---

**Code source :** `app.js` → `APP._initKnowledgeBase()` — Applique `d3.zoom().scaleExtent([0.1, 4])` au SVG ; lors de chaque événement `zoom`, applique la transformation au groupe `zoomG` contenant tous les éléments graphiques.

### REQ-VW-019 — Labels de propriétés sur les arêtes

| **Si** | le graphe Knowledge Base affiche des assertions entre `individuals`, |
|---|---|
| **Alors** | le nom de la `ObjectProperty` est affiché au milieu de chaque lien, permettant à l'ontologiste d'identifier la nature de la relation sans avoir à cliquer sur l'arête. |

---

**Code source :** `app.js` → `APP._initKnowledgeBase()` — Pour chaque lien, crée un élément `<text>` contenant `d.property` dans le groupe `labelG`, positionné à `((source.x + target.x)/2, (source.y + target.y)/2 - 4)` et mis à jour à chaque tick de la simulation.

### REQ-VW-021 — Survol d'un nœud : mise en évidence des connexions

| **Si** | l'ontologiste survole un `individual` dans le graphe Knowledge Base, |
|---|---|
| **Alors** | seuls ce nœud et ses voisins directement connectés restent pleinement visibles ; les autres nœuds, arêtes et labels sont fortement estompés, permettant de se concentrer sur les relations immédiates de l'`individual`. |

| **Si** | l'ontologiste quitte le nœud, |
|---|---|
| **Alors** | tous les éléments du graphe retrouvent leur visibilité normale. |

---

**Code source :** `app.js` → `APP._initKnowledgeBase()` (handlers `mouseover` / `mouseout`) — Sur `mouseover` : opacité des nœuds non connectés à 0.2, opacité des arêtes et labels non impliqués à 0.05. Sur `mouseout` : remise de toutes les opacités à 1.

### REQ-VW-026 — Compteur d'individuals et de connexions

| **Si** | l'ontologiste consulte le graphe Knowledge Base, |
|---|---|
| **Alors** | le nombre total d'`individuals` et le nombre total de connexions entre eux sont affichés dans la barre d'outils du graphe. |

---

**Code source :** `app.js` → `APP._initKnowledgeBase()` — Met à jour l'élément `#kb-count` avec le texte `"N individual(s) · M connexion(s)"` (pluriel conditionnel pour chaque valeur).

### REQ-VW-031 — Sous-onglet « Ontology (TreeMap) » : carte de proportions restylée

| **Si** | l'ontologiste ouvre le sous-onglet « Ontology (TreeMap) », |
|---|---|
| **Alors** | l'application affiche la hiérarchie des `classes` sous forme de carte de proportions (treemap) au style enrichi : palette vibrante propre à chaque branche de premier niveau, ombrage modulé selon la profondeur, tuiles à coins arrondis, mise en évidence au survol, et en-têtes de branche affichant le nom de la `classe` avec, aligné à droite, le compte de ses enfants. |

| **Si** | l'ontologiste clique sur une tuile, double-clique, utilise le fil d'Ariane ou le bouton « Up », |
|---|---|
| **Alors** | les comportements de navigation restent inchangés : le clic effectue un « drill-down » (ou l'édition de la `classe` feuille), le double-clic ouvre l'éditeur de classes, et le fil d'Ariane comme le bouton « Up » permettent de remonter dans la hiérarchie. |

---

**Code source :** `app.js` → `APP._initTreemap()` (basé sur l'arbre de `APP._buildOntologyTreeData()`) — Applique une palette vibrante par branche de premier niveau et un ombrage par profondeur calculé via le helper `APP._tmMix(c, k)` (mélange de couleurs ; `fillOf` / `hoverOf` modulent la teinte selon `d.depth` et la présence d'enfants), dessine des tuiles à coins arrondis avec surbrillance au survol, et affiche pour chaque en-tête de branche le label de la `classe` suivi d'un compteur d'enfants aligné à droite. Les interactions (clic = drill-down / édition, double-clic = édition, fil d'Ariane, bouton « Up ») sont conservées.

### REQ-VW-032 — Barre latérale Views redimensionnable

| **Si** | l'ontologiste souhaite ajuster la largeur de la colonne des sous-onglets de l'onglet `Views`, |
|---|---|
| **Alors** | une poignée de glissement (curseur `col-resize`) située entre la colonne des sous-onglets et la zone de contenu permet de redimensionner la barre latérale, la largeur étant bornée entre 140 px et 440 px (valeur par défaut 210 px). |

| **Si** | l'ontologiste relâche la poignée, |
|---|---|
| **Alors** | la visualisation active est réajustée (« re-fit ») à la nouvelle largeur disponible. |

---

**Code source :** `app.js` → `APP._viewsSidebarDragStart` — Installe une poignée de glissement (`col-resize`) entre la barre latérale des sous-onglets et le contenu ; pendant le glissement, met à jour la largeur de la barre latérale en la bornant entre 140 px et 440 px (défaut 210 px), et au relâchement réajuste la visualisation active à la zone disponible.

---

*Document généré le 2026-06-06 — claude-sonnet-4-6*
