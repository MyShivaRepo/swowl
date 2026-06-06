# Exigences dérivées du code source — Onglet **Views**

**Application :** SWOWL
**Date :** 2026-06-06
**Note :** Exigences dérivées strictement du code source. Chaque exigence cite la fonction JavaScript qui l'implémente. Aucune fonctionnalité non présente dans le code n'est décrite.

---

## Table des matières

1. [REQ-VW-001 — Rendu de l'onglet Views avec sous-onglets](#req-vw-001-rendu-de-longlet-views-avec-sous-onglets)
2. [REQ-VW-002 — Sous-onglet « Ontology » : arbre hyperbolique D3](#req-vw-002-sous-onglet-ontology-arbre-hyperbolique-d3)
3. [REQ-VW-003 — Construction de l'arbre hiérarchique des classes](#req-vw-003-construction-de-larbre-hiérarchique-des-classes)
4. [REQ-VW-004 — Résolution du meilleur label de classe](#req-vw-004-résolution-du-meilleur-label-de-classe)
5. [REQ-VW-005 — Algorithme de placement hyperbolique (disque de Poincaré)](#req-vw-005-algorithme-de-placement-hyperbolique-disque-de-poincaré)
6. [REQ-VW-006 — Dessin SVG des nœuds et arêtes avec opacité et taille proportionnelles](#req-vw-006-dessin-svg-des-nœuds-et-arêtes-avec-opacité-et-taille-proportionnelles)
7. [REQ-VW-007 — Clic sur un nœud : centrage par transformation de Möbius](#req-vw-007-clic-sur-un-nœud-centrage-par-transformation-de-möbius)
8. [REQ-VW-008 — Double-clic (second clic au centre) : navigation vers l'éditeur de classes](#req-vw-008-double-clic-second-clic-au-centre-navigation-vers-léditeur-de-classes)
9. [REQ-VW-009 — Réinitialisation du focus vers la racine](#req-vw-009-réinitialisation-du-focus-vers-la-racine)
10. [REQ-VW-010 — Filtrage des classes par texte dans le graphe hyperbolique](#req-vw-010-filtrage-des-classes-par-texte-dans-le-graphe-hyperbolique)
11. [REQ-VW-011 — Compteur de classes affiché dans la barre d'outils](#req-vw-011-compteur-de-classes-affiché-dans-la-barre-doutils)
12. [REQ-VW-012 — Sous-onglet « Knowledge Base » : graphe de force D3](#req-vw-012-sous-onglet-knowledge-base-graphe-de-force-d3)
13. [REQ-VW-013 — Construction des nœuds (individuals) et liens (assertions)](#req-vw-013-construction-des-nœuds-individuals-et-liens-assertions)
14. [REQ-VW-014 — Palette de couleurs par classe](#req-vw-014-palette-de-couleurs-par-classe)
15. [REQ-VW-015 — Résolution du meilleur label d'individual](#req-vw-015-résolution-du-meilleur-label-dindividual)
16. [REQ-VW-016 — Légende des classes dans le graphe Knowledge Base](#req-vw-016-légende-des-classes-dans-le-graphe-knowledge-base)
17. [REQ-VW-017 — Arrowheads SVG sur les arêtes directionnelles](#req-vw-017-arrowheads-svg-sur-les-arêtes-directionnelles)
18. [REQ-VW-018 — Zoom et pan sur le graphe Knowledge Base](#req-vw-018-zoom-et-pan-sur-le-graphe-knowledge-base)
19. [REQ-VW-019 — Labels de propriétés sur les arêtes](#req-vw-019-labels-de-propriétés-sur-les-arêtes)
20. [REQ-VW-020 — Clic sur un nœud individual : navigation vers l'éditeur d'individuals](#req-vw-020-clic-sur-un-nœud-individual-navigation-vers-léditeur-dindividuals)
21. [REQ-VW-021 — Survol d'un nœud : mise en évidence des connexions](#req-vw-021-survol-dun-nœud-mise-en-évidence-des-connexions)
22. [REQ-VW-022 — Glisser-déposer des nœuds dans le graphe Knowledge Base](#req-vw-022-glisser-déposer-des-nœuds-dans-le-graphe-knowledge-base)
23. [REQ-VW-023 — Simulation de force D3 avec paramètres configurés](#req-vw-023-simulation-de-force-d3-avec-paramètres-configurés)
24. [REQ-VW-024 — Redémarrage de la simulation de force](#req-vw-024-redémarrage-de-la-simulation-de-force)
25. [REQ-VW-025 — Filtrage des individuals par texte dans le graphe Knowledge Base](#req-vw-025-filtrage-des-individuals-par-texte-dans-le-graphe-knowledge-base)
26. [REQ-VW-026 — Compteur d'individuals et de connexions](#req-vw-026-compteur-dindividuals-et-de-connexions)
27. [REQ-VW-027 — Blocage de l'onglet Views si aucune ontologie n'est connectée](#req-vw-027-blocage-de-longlet-views-si-aucune-ontologie-nest-connectée)
28. [REQ-VW-028 — Initialisation différée des graphes après rendu HTML](#req-vw-028-initialisation-différée-des-graphes-après-rendu-html)

---

### REQ-VW-001 — Rendu de l'onglet Views avec sous-onglets

**Code source :** `app.js` → `APP.renderViews()`

La fonction génère le HTML de l'onglet Views. Elle produit une barre latérale avec deux sous-onglets cliquables : `'ontology'` (libellé « 🗂 Ontology ») et `'knowledge-base'` (libellé « 🧩 Knowledge Base »). L'onglet actif est mémorisé dans `APP._viewsTab` (initialisé à `'ontology'`). Un clic sur un sous-onglet met à jour `APP._viewsTab` et rappelle `APP.renderSection('views')`.

---

### REQ-VW-002 — Sous-onglet « Ontology » : arbre hyperbolique D3

**Code source :** `app.js` → `APP.renderViews()`

Quand `APP._viewsTab === 'ontology'`, la fonction génère un panneau contenant : un bouton « ⟳ Reset » (appel `APP._hypReset()`), un champ de saisie de filtre relié à `APP._hypFilter(this.value)`, une aide textuelle « Clic → focus · Double-clic → éditer », un compteur (`#cy-node-count`) et un conteneur SVG `#cy-ontology`.

---

### REQ-VW-003 — Construction de l'arbre hiérarchique des classes

**Code source :** `app.js` → `APP._initHyperbolicGraph()`

La fonction lit `APP.state.classes`, construit une carte `classMap` indexée par `id`, puis calcule pour chaque classe ses parents via `subClassOf`. Les classes sans parent interne deviennent les racines d'un nœud virtuel `owl:Thing`. La hiérarchie est récursivement construite par la fonction interne `buildNode(id, depth)` qui retourne un objet `{ id, depth, label, hpos, basePos, children }`.

---

### REQ-VW-004 — Résolution du meilleur label de classe

**Code source :** `app.js` → `APP._hypBestLabel(cls)`

Pour chaque classe, la fonction cherche dans `cls.annotations` une annotation dont la propriété est `rdfs:label` ou `label` correspondant à la langue préférée (`Settings.preferredLang`). En l'absence de correspondance, elle prend la première annotation `rdfs:label` disponible. Si aucune n'existe, elle retourne `cls.id`.

---

### REQ-VW-005 — Algorithme de placement hyperbolique (disque de Poincaré)

**Code source :** `app.js` → `APP._initHyperbolicGraph()` (fonctions internes `layoutNode`, `cadd`, `csub`, `cmul`, `cconj`, `cabs`, `cdiv`, `polar`, `mobiusFocus`, `mobiusTranslate`)

Le placement utilise la géométrie hyperbolique du disque de Poincaré. La constante `STEP_R = Math.tanh(0.4)` définit l'espacement entre niveaux. La fonction `layoutNode(node, pos, angle, wedge)` distribue les enfants en secteurs angulaires égaux. La translation hyperbolique est réalisée par `mobiusTranslate(z, a)` qui implémente une transformation de Möbius. Les helpers complexes (`cadd`, `csub`, `cmul`, `cconj`, `cdiv`, `polar`) sont stockés dans `APP._hypMath`.

---

### REQ-VW-006 — Dessin SVG des nœuds et arêtes avec opacité et taille proportionnelles

**Code source :** `app.js` → `APP._hypDraw(animated)`

Pour chaque nœud, la fonction calcule sa distance au centre (`cabs(node.hpos)`), puis en déduit : le rayon du cercle (`Math.max(3.5, 10 * (1 - dist*0.65))`), l'opacité (`Math.max(0.12, 1 - dist*0.55)`), la taille de police (`Math.max(8, 13 * (1 - dist*0.82))`), la couleur de remplissage et la couleur du texte. Le label est masqué si `dist >= 0.78`. Si `animated === true`, une transition CSS `transform 0.42s cubic-bezier(0.33,1,0.68,1)` est appliquée. Chaque arête est un élément `<line>` reliant le nœud à son parent.

---

### REQ-VW-007 — Clic sur un nœud : centrage par transformation de Möbius

**Code source :** `app.js` → `APP._hypClick(node)`

Lors d'un clic sur un nœud dont la distance au centre est supérieure à 0.02, la fonction calcule `mobiusFocus(n.hpos, a)` pour chaque nœud de l'arbre afin de ramener le nœud cliqué vers le centre du disque. Elle appelle ensuite `APP._hypDraw(true)` pour animer la transition.

---

### REQ-VW-008 — Double-clic (second clic au centre) : navigation vers l'éditeur de classes

**Code source :** `app.js` → `APP._hypClick(node)`

Si le nœud cliqué a une distance au centre inférieure à 0.10 et que son `id` n'est pas `'owl:Thing'`, la fonction appelle `APP.navigate('classes')` puis, après 80 ms, positionne `ClassEditor._selectedId = node.id` et appelle `ClassEditor.restoreSelection()` pour ouvrir directement la fiche d'édition de la classe correspondante.

---

### REQ-VW-009 — Réinitialisation du focus vers la racine

**Code source :** `app.js` → `APP._hypReset()`

La fonction recopie `basePos` dans `hpos` pour tous les nœuds de `APP._hypNodes`, restaurant ainsi les positions de layout initial, puis appelle `APP._hypDraw(true)` pour animer le retour.

---

### REQ-VW-010 — Filtrage des classes par texte dans le graphe hyperbolique

**Code source :** `app.js` → `APP._hypFilter(q)`

La fonction parcourt `APP._hypNodeEls`. Pour chaque nœud dont le `label` ou l'`id` contient la requête (insensible à la casse), elle applique un stroke vert (`#10b981`) et change la couleur du label en `#6ee7b7`. Pour les nœuds non correspondants ou quand la requête est vide, elle supprime les attributs de surbrillance et rappelle `APP._hypDraw(false)`.

---

### REQ-VW-011 — Compteur de classes affiché dans la barre d'outils

**Code source :** `app.js` → `APP._initHyperbolicGraph()`

Après le rendu du graphe, la fonction met à jour l'élément `#cy-node-count` avec le texte `"N classe(s)"` (pluriel si N > 1).

---

### REQ-VW-012 — Sous-onglet « Knowledge Base » : graphe de force D3

**Code source :** `app.js` → `APP.renderViews()` et `APP._initKnowledgeBase()`

Quand `APP._viewsTab === 'knowledge-base'`, le HTML généré contient : un bouton « ⟳ Restart » (appel `APP._kbRestart()`), un champ filtre relié à `APP._kbFilter(this.value)`, un conteneur de légende `#kb-legend`, un compteur `#kb-count` et un conteneur SVG `#kb-graph`. `APP._initKnowledgeBase()` est appelée après un délai de 80 ms.

---

### REQ-VW-013 — Construction des nœuds (individuals) et liens (assertions)

**Code source :** `app.js` → `APP._initKnowledgeBase()`

La fonction lit `APP.state.individuals`. Chaque individual devient un nœud D3 avec les propriétés `{ id, label, classId, ind, x, y }`, positionné aléatoirement autour du centre. Les arêtes sont construites en parcourant `ind.objectAssertions` : pour chaque assertion dont la `target` est un individual existant, un lien `{ source, target, property, id }` est créé. L'ensemble est stocké dans `APP._kbData`.

---

### REQ-VW-014 — Palette de couleurs par classe

**Code source :** `app.js` → `APP._kbClassColor(classId)`

La fonction maintient un dictionnaire `APP._kbColorMap` et un index `APP._kbColorIndex`. La première fois qu'un `classId` est rencontré, la couleur suivante d'une palette de 15 couleurs hexadécimales prédéfinies lui est assignée. Les appels ultérieurs retournent la même couleur.

---

### REQ-VW-015 — Résolution du meilleur label d'individual

**Code source :** `app.js` → `APP._kbBestLabel(ind)`

La fonction cherche dans `ind.annotations.labels` un label correspondant à `Settings.preferredLang`. En l'absence de correspondance, elle prend le premier label disponible. Si aucun label n'existe, elle retourne `ind.id`.

---

### REQ-VW-016 — Légende des classes dans le graphe Knowledge Base

**Code source :** `app.js` → `APP._initKnowledgeBase()`

La fonction collecte l'ensemble des `classId` uniques parmi les nœuds, les trie, pré-assigne leurs couleurs via `APP._kbClassColor()`, puis injecte dans `#kb-legend` un badge coloré (carré de 8 px) suivi du nom de la classe pour chaque entrée.

---

### REQ-VW-017 — Arrowheads SVG sur les arêtes directionnelles

**Code source :** `app.js` → `APP._initKnowledgeBase()`

La fonction ajoute dans la section `<defs>` du SVG deux marqueurs `<marker>` via la fonction interne `mkArrow(id, color)` : `kb-arrow` (couleur `#3a4a62`, flèche normale) et `kb-arrow-hi` (couleur `#3b82f6`, flèche mise en évidence). Les arêtes utilisent `marker-end='url(#kb-arrow)'`.

---

### REQ-VW-018 — Zoom et pan sur le graphe Knowledge Base

**Code source :** `app.js` → `APP._initKnowledgeBase()`

La fonction applique `d3.zoom().scaleExtent([0.1, 4])` au SVG. Lors de l'événement `zoom`, la transformation est appliquée à un groupe `zoomG` contenant tous les éléments graphiques, permettant ainsi un zoom de facteur 0.1× à 4×.

---

### REQ-VW-019 — Labels de propriétés sur les arêtes

**Code source :** `app.js` → `APP._initKnowledgeBase()`

Pour chaque lien, un élément `<text>` est créé dans le groupe `labelG`. Son contenu est la valeur `d.property` du lien. Il est positionné au milieu de l'arête `((source.x + target.x)/2, (source.y + target.y)/2 - 4)` et mis à jour à chaque tick de la simulation.

---

### REQ-VW-020 — Clic sur un nœud individual : navigation vers l'éditeur d'individuals

**Code source :** `app.js` → `APP._initKnowledgeBase()`

L'événement `click` sur un nœud appelle `APP.navigate('individuals')`. Après 120 ms, il positionne `IndividualEditor._selectedId = d.id` et appelle `IndividualEditor.restoreSelection()` pour afficher la fiche de l'individual cliqué.

---

### REQ-VW-021 — Survol d'un nœud : mise en évidence des connexions

**Code source :** `app.js` → `APP._initKnowledgeBase()` (handlers `mouseover` / `mouseout`)

Sur l'événement `mouseover`, la fonction calcule l'ensemble des identifiants de nœuds connectés au nœud survolé. Elle réduit l'opacité des nœuds non connectés à 0.2 et celle des arêtes et labels non impliqués à 0.05. Sur `mouseout`, toutes les opacités sont remises à 1.

---

### REQ-VW-022 — Glisser-déposer des nœuds dans le graphe Knowledge Base

**Code source :** `app.js` → `APP._initKnowledgeBase()`

La fonction applique `d3.drag()` à chaque nœud. Sur `dragstart`, la simulation est relancée avec `alphaTarget(0.3)` et les coordonnées `fx`/`fy` du nœud sont fixées. Sur `drag`, les coordonnées suivent le curseur. Sur `dragend`, `alphaTarget(0)` refroidit la simulation et `fx`/`fy` sont mis à `null` pour libérer le nœud.

---

### REQ-VW-023 — Simulation de force D3 avec paramètres configurés

**Code source :** `app.js` → `APP._initKnowledgeBase()`

La simulation est créée avec `d3.forceSimulation(nodes)` et les forces suivantes :
- `forceLink` : distance cible 120, force 0.6
- `forceManyBody` : intensité -350 (répulsion)
- `forceCenter` : centré sur `(W/2, H/2)`, force 0.05
- `forceCollide` : rayon 28

À chaque tick, les positions des arêtes, labels d'arêtes et nœuds sont mises à jour.

---

### REQ-VW-024 — Redémarrage de la simulation de force

**Code source :** `app.js` → `APP._kbRestart()`

Si `APP._kbSim` est défini, la fonction appelle `APP._kbSim.alpha(0.8).restart()`, ce qui réchauffe la simulation et la relance depuis son état courant.

---

### REQ-VW-025 — Filtrage des individuals par texte dans le graphe Knowledge Base

**Code source :** `app.js` → `APP._kbFilter(q)`

La fonction modifie l'attribut `opacity` des cercles et des labels de nœuds via `APP._kbNodeEls`. Un nœud dont le `label` ou le `classId` contient la requête (insensible à la casse) conserve l'opacité 1 ; les autres passent à 0.1. Si la requête est vide, tous les éléments reviennent à l'opacité 1.

---

### REQ-VW-026 — Compteur d'individuals et de connexions

**Code source :** `app.js` → `APP._initKnowledgeBase()`

Après la construction des nœuds et des liens, la fonction met à jour l'élément `#kb-count` avec le texte `"N individual(s) · M connexion(s)"` (pluriel conditionnel pour chaque valeur).

---

### REQ-VW-027 — Blocage de l'onglet Views si aucune ontologie n'est connectée

**Code source :** `app.js` → `APP.renderSection(section)`

Dans `renderSection()`, la liste `editSections` inclut `'views'`. Si `APP.state.ontology` est null et que la section demandée fait partie de cette liste, la fonction injecte dans `#main-content` le message retourné par `APP._noOntoMsg()` (contenant un bouton « Go to Ontologies ») et interrompt le rendu normal.

---

### REQ-VW-028 — Initialisation différée des graphes après rendu HTML

**Code source :** `app.js` → `APP.renderSection(section)`

Après avoir injecté le HTML de `APP.renderViews()`, la fonction vérifie `APP._viewsTab` et appelle le graphe correspondant avec un délai de 80 ms via `setTimeout` : `APP._initHyperbolicGraph()` si l'onglet actif est `'ontology'`, ou `APP._initKnowledgeBase()` si l'onglet actif est `'knowledge-base'`. Ce délai garantit que le conteneur SVG est présent dans le DOM avant l'initialisation D3.

---

*Document généré le 2026-06-06 — claude-sonnet-4-6*
