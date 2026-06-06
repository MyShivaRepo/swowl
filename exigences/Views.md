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

| **Si** | l'`ontologie` est chargée et contient des `classes` organisées en hiérarchie, |
|---|---|
| **Alors** | l'arbre des `classes` reflète fidèlement les relations de spécialisation : chaque `classe` est positionnée sous son concept parent, les `classes` sans parent sont rattachées à la racine universelle `owl:Thing`, et la hiérarchie est construite récursivement en exposant pour chaque nœud son niveau de profondeur, son label et ses enfants. |

---

**Code source :** `app.js` → `APP._initHyperbolicGraph()` — Construit une carte `classMap` indexée par `id`, calcule les parents via `subClassOf`, élève les classes sans parent interne sous un nœud virtuel `owl:Thing`, et construit récursivement la hiérarchie via `buildNode(id, depth)`, chaque nœud exposant `{ id, depth, label, hpos, basePos, children }`.

### REQ-VW-004 — Résolution du meilleur label de classe

| **Si** | l'ontologiste consulte l'arbre des `classes` et qu'une `classe` possède plusieurs annotations de label dans des langues différentes, |
|---|---|
| **Alors** | l'application affiche le label dans la langue préférée de l'utilisateur ; à défaut, le premier label disponible ; à défaut encore, l'identifiant technique de la `classe`. |

---

**Code source :** `app.js` → `APP._hypBestLabel(cls)` — Recherche dans `cls.annotations` une annotation `rdfs:label` ou `label` correspondant à `Settings.preferredLang`, prend la première annotation disponible en l'absence de correspondance, et retourne `cls.id` si aucune annotation n'existe.

### REQ-VW-005 — Algorithme de placement hyperbolique (disque de Poincaré)

| **Si** | l'ontologiste visualise l'arbre des `classes` dans le graphe hyperbolique, |
|---|---|
| **Alors** | les `classes` sont disposées dans un espace hyperbolique de type disque de Poincaré : chaque niveau de hiérarchie est espacé de manière constante, les enfants d'un nœud sont distribués en secteurs angulaires égaux autour de leur parent, et les translations entre niveaux respectent la géométrie hyperbolique. |

---

**Code source :** `app.js` → `APP._initHyperbolicGraph()` (fonctions internes `layoutNode`, `cadd`, `csub`, `cmul`, `cconj`, `cabs`, `cdiv`, `polar`, `mobiusFocus`, `mobiusTranslate`) — Utilise `STEP_R = Math.tanh(0.4)` pour l'espacement entre niveaux, distribue les enfants via `layoutNode(node, pos, angle, wedge)`, et réalise les translations hyperboliques via `mobiusTranslate(z, a)`.

### REQ-VW-007 — Clic sur un nœud : centrage par transformation de Möbius

| **Si** | l'ontologiste clique sur une `classe` dans le graphe hyperbolique pour l'explorer, |
|---|---|
| **Alors** | la `classe` sélectionnée se déplace vers le centre du disque, permettant de la mettre en focus et de visualiser ses voisins proches avec plus de détails. |

---

**Code source :** `app.js` → `APP._hypClick(node)` — Si la distance du nœud au centre est supérieure à 0.02, calcule `mobiusFocus(n.hpos, a)` pour chaque nœud afin de recentrer le nœud cliqué, puis appelle `APP._hypDraw(true)` pour animer la transition.

### REQ-VW-008 — Double-clic (second clic au centre) : navigation vers l'éditeur de classes

| **Si** | l'ontologiste double-clique sur une `classe` au centre du graphe hyperbolique pour l'éditer, |
|---|---|
| **Alors** | l'application navigue automatiquement vers la fiche d'édition de cette `classe`, sans manipulation supplémentaire. |

---

**Code source :** `app.js` → `APP._hypClick(node)` — Si la distance du nœud au centre est inférieure à 0.10 et que l'`id` n'est pas `'owl:Thing'`, appelle `APP.navigate('classes')`, puis après 80 ms positionne `ClassEditor._selectedId = node.id` et appelle `ClassEditor.restoreSelection()`.

### REQ-VW-009 — Réinitialisation du focus vers la racine

| **Si** | l'ontologiste souhaite revenir à la `vue` d'ensemble de l'`ontologie` après avoir navigué dans le graphe hyperbolique, |
|---|---|
| **Alors** | le graphe retrouve sa disposition initiale, avec toutes les `classes` repositionnées à leur emplacement de départ, accompagné d'une animation de retour. |

---

**Code source :** `app.js` → `APP._hypReset()` — Recopie `basePos` dans `hpos` pour tous les nœuds de `APP._hypNodes`, puis appelle `APP._hypDraw(true)` pour animer le retour.

### REQ-VW-010 — Filtrage des classes par texte dans le graphe hyperbolique

| **Si** | l'ontologiste saisit un terme pour rechercher une `classe` dans le graphe hyperbolique, |
|---|---|
| **Alors** | les `classes` dont le nom ou l'identifiant correspond au terme saisi sont mises en évidence visuellement, tandis que les autres `classes` restent visibles mais sans surbrillance. |

| **Si** | l'ontologiste efface le terme de recherche, |
|---|---|
| **Alors** | toutes les `classes` retrouvent leur apparence normale et le graphe est redessiné sans surbrillance. |

---

**Code source :** `app.js` → `APP._hypFilter(q)` — Les nœuds correspondants (label ou id, insensible à la casse) reçoivent un stroke vert `#10b981` et un label coloré en `#6ee7b7` ; les nœuds non correspondants voient leurs attributs de surbrillance supprimés. Si la requête est vide, tous les attributs sont supprimés et `APP._hypDraw(false)` est appelé.

### REQ-VW-013 — Construction des nœuds (individuals) et liens (assertions)

| **Si** | l'`ontologie` est chargée et contient des `individuals` reliés par des `propriétés d'objet`, |
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

**Code source :** `app.js` → `APP.renderSection(section)` — Attend 80 ms via `setTimeout` avant d'appeler `APP._initHyperbolicGraph()` si l'onglet actif est `'ontology'`, ou `APP._initKnowledgeBase()` si l'onglet actif est `'knowledge-base'`. Ce délai garantit que le conteneur SVG est présent dans le DOM avant l'initialisation D3.

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

**Code source :** `app.js` → `APP.renderSection(section)`

### REQ-VW-001 — Rendu de l'onglet Views avec sous-onglets

| **Si** | l'ontologiste navigue vers l'onglet `Views`, |
|---|---|
| **Alors** | l'application affiche deux sous-onglets de visualisation — « `Ontology` » pour explorer la hiérarchie des `classes`, et « Knowledge Base » pour explorer les `individuals` et leurs relations — l'onglet actif étant mémorisé entre les navigations. |

| **Si** | l'ontologiste sélectionne un sous-onglet, |
|---|---|
| **Alors** | la `vue` se rafraîchit pour afficher le graphe correspondant. |

---

**Code source :** `app.js` → `APP.renderViews()` — Génère une barre latérale avec deux sous-onglets cliquables : `'ontology'` (libellé « 🗂 Ontology ») et `'knowledge-base'` (libellé « 🧩 Knowledge Base »), l'onglet actif étant mémorisé dans `APP._viewsTab` (initialisé à `'ontology'`). Un clic met à jour `APP._viewsTab` et rappelle `APP.renderSection('views')`.

### REQ-VW-002 — Sous-onglet « Ontology » : arbre hyperbolique D3

| **Si** | l'ontologiste ouvre le sous-onglet « `Ontology` », |
|---|---|
| **Alors** | l'application affiche un graphe hyperbolique interactif de l'arbre des `classes`, accompagné d'un bouton de réinitialisation de la `vue`, d'un champ de recherche pour filtrer les `classes`, d'une aide contextuelle sur les interactions disponibles, d'un compteur de `classes` et de la zone de visualisation. |

---

**Code source :** `app.js` → `APP.renderViews()` — Génère un panneau contenant : un bouton « ⟳ Reset » (appel `APP._hypReset()`), un champ de saisie relié à `APP._hypFilter(this.value)`, une aide textuelle « Clic → focus · Double-clic → éditer », un compteur `#cy-node-count`, et un conteneur SVG `#cy-ontology`.

### REQ-VW-006 — Dessin SVG des nœuds et arêtes avec opacité et taille proportionnelles

| **Si** | le graphe hyperbolique est affiché, |
|---|---|
| **Alors** | les `classes` proches du centre sont représentées par des nœuds plus grands, plus opaques et avec des labels plus lisibles, tandis que les `classes` éloignées du centre apparaissent plus petites et plus transparentes, leurs labels étant masqués au-delà d'un certain seuil d'éloignement. |

| **Si** | une animation est déclenchée lors d'un changement de focus, |
|---|---|
| **Alors** | les nœuds se déplacent avec une transition fluide. |

---

**Code source :** `app.js` → `APP._hypDraw(animated)` — Pour chaque nœud, calcule `dist = cabs(node.hpos)` et en déduit : rayon `Math.max(3.5, 10 * (1 - dist*0.65))`, opacité `Math.max(0.12, 1 - dist*0.55)`, taille de police `Math.max(8, 13 * (1 - dist*0.82))`, masquage du label si `dist >= 0.78`. Si `animated === true`, applique une transition CSS `transform 0.42s cubic-bezier(0.33,1,0.68,1)`. Les arêtes sont rendues en éléments `<line>`.

### REQ-VW-011 — Compteur de classes affiché dans la barre d'outils

| **Si** | l'ontologiste consulte le graphe hyperbolique, |
|---|---|
| **Alors** | le nombre total de `classes` présentes dans l'`ontologie` est affiché dans la barre d'outils du graphe. |

---

**Code source :** `app.js` → `APP._initHyperbolicGraph()` — Met à jour l'élément `#cy-node-count` avec le texte `"N classe(s)"` (pluriel si N > 1).

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
| **Alors** | le nom de la `propriété d'objet` est affiché au milieu de chaque lien, permettant à l'ontologiste d'identifier la nature de la relation sans avoir à cliquer sur l'arête. |

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

*Document généré le 2026-06-06 — claude-sonnet-4-6*

**Code source :** `app.js` → `APP._initKnowledgeBase()` — Met à jour l'élément `#kb-count` avec le texte `"N individual(s) · M connexion(s)"` (pluriel conditionnel pour chaque valeur).
