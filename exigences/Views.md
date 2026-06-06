# Exigences — Onglet « Views »

> Document généré par rétro-engineering du code source SWOWL · version 1.0 · 2026-06-06

---

## 1. Structure générale et navigation dans l'onglet

- **REQ-VIEW-001** — L'onglet Views est optionnel et peut être masqué depuis les Settings (GUI Tabs).
  - *Si* Si l'utilisateur décoche 'Views' dans Settings > GUI Tabs, alors l'onglet Views disparaît de la barre de navigation.

- **REQ-VIEW-002** — L'onglet Views présente une barre latérale gauche (sidebar) avec deux sous-onglets : 'Ontology' et 'Knowledge Base'.

- **REQ-VIEW-003** — Le sous-onglet actif est mis en évidence visuellement par un liseré coloré (accent), une police en gras et un fond différencié.
  - *Si* Si un sous-onglet est actif, alors son bord gauche est coloré avec la couleur d'accent et son fond est var(--bg3).

- **REQ-VIEW-004** — Un clic sur un sous-onglet de la sidebar met à jour l'état interne APP._viewsTab et re-rend la section Views.
  - *Si* Si l'utilisateur clique sur 'Ontology' ou 'Knowledge Base', alors APP._viewsTab est mis à jour et APP.renderSection('views') est appelé.

- **REQ-VIEW-005** — Le graphe correspondant au sous-onglet sélectionné est initialisé de manière asynchrone (setTimeout 80 ms) après le rendu HTML.
  - *Si* Si le sous-onglet actif est 'ontology', alors APP._initHyperbolicGraph() est appelé 80 ms après le rendu. Si c'est 'knowledge-base', alors APP._initKnowledgeBase() est appelé.

- **REQ-VIEW-006** — La valeur par défaut du sous-onglet est 'ontology' si aucune valeur n'a été mémorisée.

---

## 2. Sous-onglet Ontology — Arbre hyperbolique (Disque de Poincaré)

- **REQ-VIEW-007** — Le sous-onglet Ontology affiche un graphe en arbre hyperbolique (Disque de Poincaré) de toutes les classes de l'ontologie, en utilisant D3.js.

- **REQ-VIEW-008** — Si D3.js n'est pas chargé, un message d'erreur est affiché à la place du graphe.
  - *Si* Si typeof d3 === 'undefined', alors le conteneur affiche '⚠ D3.js not loaded — vérifiez la connexion réseau.'

- **REQ-VIEW-009** — Si l'ontologie ne contient aucune classe, un message informatif est affiché à la place du graphe.
  - *Si* Si APP.state.classes est vide, alors le message 'No classes in this ontology.' est affiché.

- **REQ-VIEW-010** — La racine virtuelle 'owl:Thing' est ajoutée automatiquement comme nœud racine de l'arbre ; les classes sans parent interne deviennent ses enfants directs.
  - *Si* Si une classe n'a aucun parent dans l'ensemble des classes de l'ontologie, alors elle est rattachée à owl:Thing.

- **REQ-VIEW-011** — La disposition des nœuds est calculée selon la géométrie hyperbolique de Poincaré via des transformations de Möbius.

- **REQ-VIEW-012** — L'apparence visuelle d'un nœud (rayon, opacité, taille de police, couleur) varie en fonction de sa distance au centre du disque.
  - *Si* Si un nœud est proche du centre (dist < 0.35), alors son cercle est plus grand, plus opaque et son libellé plus visible. Si un nœud est en périphérie (dist > 0.78), alors son libellé est masqué.

- **REQ-VIEW-013** — Le libellé d'un nœud est déterminé en priorité par l'annotation rdfs:label dans la langue préférée, puis par l'identifiant de la classe.
  - *Si* Si une classe a un rdfs:label dans la langue préférée, alors ce libellé est utilisé. Sinon, l'identifiant brut de la classe est affiché.

- **REQ-VIEW-014** — Un clic simple sur un nœud périphérique recentre ce nœud au centre du disque via une transformation de Möbius, avec une animation CSS de 0,42 s.
  - *Si* Si l'utilisateur clique sur un nœud dont dist >= 0.10, alors mobiusFocus est appliqué pour ramener ce nœud au centre et _hypDraw(true) est appelé.

- **REQ-VIEW-015** — Un clic sur un nœud déjà au centre (dist < 0.10, hors owl:Thing) navigue vers l'éditeur de classes et sélectionne cette classe.
  - *Si* Si un nœud est au centre (dist < 0.10) et n'est pas owl:Thing, alors APP.navigate('classes') est appelé et ClassEditor._selectedId est positionné sur l'identifiant de ce nœud.

- **REQ-VIEW-016** — Le bouton 'Reset' remet tous les nœuds à leur position initiale calculée par le layout, avec animation.
  - *Si* Si l'utilisateur clique sur '⟳ Reset', alors chaque nœud retrouve sa basePos et _hypDraw(true) est appelé.

- **REQ-VIEW-017** — Un champ de filtre texte permet de rechercher des classes par libellé ou par identifiant ; les nœuds correspondants sont mis en surbrillance en vert.
  - *Si* Si l'utilisateur saisit un texte dans 'Filtrer les classes…', alors les nœuds dont le libellé ou l'identifiant contient ce texte (insensible à la casse) voient leur cercle passer en stroke '#10b981' et leur libellé en '#6ee7b7'. Les autres nœuds reprennent leur apparence normale.

- **REQ-VIEW-018** — Un compteur affiche le nombre total de classes présentes dans l'ontologie dans la barre d'outils du graphe.

- **REQ-VIEW-019** — Le fond du disque hyperbolique est un cercle SVG sombre avec des anneaux guides concentriques à 33 %, 60 % et 82 % du rayon.

- **REQ-VIEW-020** — Les arêtes entre nœuds parent et enfant sont représentées par des lignes SVG dont la couleur et l'opacité s'animent comme les nœuds.

- **REQ-VIEW-021** — La taille du canvas SVG est adaptée dynamiquement à la taille du conteneur ; si la hauteur est insuffisante, elle est calculée à partir de window.innerHeight.
  - *Si* Si container.offsetHeight < 20, alors la hauteur est fixée à window.innerHeight - 170.

- **REQ-VIEW-022** — Un texte d'aide 'Clic → focus · Double-clic → éditer' est affiché dans la barre d'outils pour guider l'utilisateur.

---

## 3. Sous-onglet Knowledge Base — Graphe de force (Individuals)

- **REQ-VIEW-023** — Le sous-onglet 'Knowledge Base' affiche un graphe de force D3 représentant tous les individuals de l'ontologie et leurs relations via des object property assertions.

- **REQ-VIEW-024** — Si aucun individual n'est présent dans l'ontologie, un message informatif est affiché.
  - *Si* Si APP.state.individuals est vide, alors 'Aucun individual dans cette ontologie.' est affiché.

- **REQ-VIEW-025** — Chaque individual est représenté par un nœud coloré selon sa classe (class_id ou premier type), avec un libellé au-dessus et le nom de la classe en dessous.

- **REQ-VIEW-026** — Les couleurs des classes sont assignées automatiquement depuis une palette de 15 couleurs prédéfinies, mémorisées dans APP._kbColorMap.
  - *Si* Si une classe n'a pas encore de couleur assignée, alors la prochaine couleur disponible dans la palette est attribuée de manière cyclique.

- **REQ-VIEW-027** — Les arêtes représentent les object property assertions entre individuals ; elles portent une étiquette indiquant le nom de la propriété.
  - *Si* Si un individual a des objectAssertions dont la cible est un autre individual connu, alors une arête est créée entre les deux nœuds.

- **REQ-VIEW-028** — Les arêtes sont directionnelles et affichent une pointe de flèche (arrowhead marker SVG) à leur extrémité cible.

- **REQ-VIEW-029** — La simulation de force utilise des forces de répulsion entre nœuds, d'attraction par lien, de centrage et de collision pour éviter les chevauchements.

- **REQ-VIEW-030** — L'utilisateur peut déplacer librement un nœud par drag-and-drop ; la simulation se relance brièvement lors du déplacement.
  - *Si* Si l'utilisateur commence à faire glisser un nœud, alors alphaTarget est mis à 0.3 et la simulation redémarre. Quand le drag se termine, alphaTarget revient à 0 et les contraintes fx/fy sont libérées.

- **REQ-VIEW-031** — Au survol d'un nœud (mouseover), les nœuds et arêtes non connectés sont atténués (opacité réduite à 0.05–0.2) pour mettre en valeur le voisinage immédiat.
  - *Si* Si l'utilisateur survole un nœud, alors les nœuds non voisins passent à opacité 0.2 et les arêtes non connectées passent à opacité 0.05. Au mouseout, tout revient à opacité 1.

- **REQ-VIEW-032** — Un clic sur un nœud individual navigue vers l'éditeur d'individuals et sélectionne cet individual.
  - *Si* Si l'utilisateur clique sur un nœud du graphe KB, alors APP.navigate('individuals') est appelé et IndividualEditor._selectedId est positionné sur l'identifiant de cet individual.

- **REQ-VIEW-033** — Le bouton '⟳ Restart' relance la simulation de force avec un alpha de 0.8 pour redistribuer les nœuds.
  - *Si* Si l'utilisateur clique sur '⟳ Restart' et qu'une simulation est active, alors APP._kbSim.alpha(0.8).restart() est appelé.

- **REQ-VIEW-034** — Lors de la ré-initialisation du graphe KB, la simulation précédente est arrêtée et les mappings de couleurs sont réinitialisés.
  - *Si* Si APP._initKnowledgeBase() est appelé alors qu'une simulation existe, alors APP._kbSim.stop() est appelé, APP._kbColorMap et APP._kbColorIndex sont réinitialisés.

- **REQ-VIEW-035** — Un champ de filtre texte permet de rechercher des individuals par libellé ou par identifiant de classe ; les nœuds non correspondants sont atténués à opacité 0.1.
  - *Si* Si l'utilisateur saisit un texte dans 'Filtrer les individuals…', alors les nœuds dont le libellé ou le classId contient ce texte restent à opacité 1 ; les autres passent à 0.1.

- **REQ-VIEW-036** — Une légende colorée liste les classes représentées dans le graphe, avec une pastille de couleur et le nom de chaque classe.

- **REQ-VIEW-037** — Un compteur affiche le nombre d'individuals et le nombre de connexions (arêtes) dans la barre d'outils du graphe KB.

- **REQ-VIEW-038** — Le graphe KB supporte le zoom et le panoramique (pan) via d3.zoom, avec une échelle comprise entre 0.1× et 4×.

- **REQ-VIEW-039** — Le libellé d'un individual dans le graphe KB est déterminé en priorité par l'annotation labels dans la langue préférée, puis par son identifiant.
  - *Si* Si un individual a une annotation labels avec la langue préférée, alors ce libellé est utilisé. Sinon, l'identifiant brut est affiché.

- **REQ-VIEW-040** — Les nœuds sont initialisés avec des positions aléatoires autour du centre du canvas pour éviter une superposition initiale.

---

## 4. Comportements visuels et retours d'interface

- **REQ-VIEW-041** — Les transitions d'animation du graphe hyperbolique utilisent une courbe cubic-bezier (0.33, 1, 0.68, 1) sur 0.42 s.
  - *Si* Si animated=true est passé à _hypDraw, alors les transitions CSS sont activées. Si animated=false, aucune transition n'est appliquée.

- **REQ-VIEW-042** — Le nœud racine owl:Thing est rendu avec un style distinctif : rayon 11 px, remplissage '#1e3a5f' et contour bleu '#3b82f6'.
  - *Si* Si un nœud a l'identifiant 'owl:Thing', alors il est affiché avec un rayon de 11 px, fill '#1e3a5f' et stroke '#3b82f6'.

- **REQ-VIEW-043** — Les libellés des nœuds hyperboliques sont affichés en gras pour les nœuds très proches du centre (dist < 0.15).
  - *Si* Si dist < 0.15, alors font-weight est '600'. Sinon, font-weight est '400'.

- **REQ-VIEW-044** — Dans le graphe KB, les arêtes affichent deux marqueurs de flèche : un normal (gris) et un surligné (bleu), utilisés selon l'état de hover.

- **REQ-VIEW-045** — Le fond du graphe Ontology est '#12161f' et celui du graphe KB est '#0e1219', créant une distinction visuelle entre les deux vues.

---

## 5. Intégration et navigation inter-onglets

- **REQ-VIEW-046** — Un clic sur un nœud de classe centré dans le graphe Ontology navigue directement vers l'onglet Classes et sélectionne la classe concernée dans l'éditeur.
  - *Si* Si le nœud est au centre (dist < 0.10) et n'est pas owl:Thing, alors APP.navigate('classes') est appelé et ClassEditor._selectedId est défini avec 80 ms de délai.

- **REQ-VIEW-047** — Un clic sur un nœud individual dans le graphe KB navigue vers l'onglet Individuals et sélectionne l'individual concerné dans l'éditeur.
  - *Si* Si l'utilisateur clique sur un nœud KB, alors APP.navigate('individuals') est appelé et IndividualEditor._selectedId est défini avec 120 ms de délai.

- **REQ-VIEW-048** — La fonction _whereUsedFrame dans owl_editor.js affiche, dans les panneaux des éditeurs (classes, propriétés, individuals), les règles SWRL qui utilisent l'entité éditée.
  - *Si* Si une entité (classe, propriété ou individual) est référencée dans au moins une règle SWRL, alors un encart 'Where Used in Rules' est affiché avec la liste de ces règles.

- **REQ-VIEW-049** — Dans l'encart 'Where Used in Rules', un clic sur une règle navigue vers l'onglet SWRL Rules et sélectionne cette règle via APP.navigateTo('swrl-rules', id).
  - *Si* Si l'utilisateur clique sur une règle dans le panneau 'Where Used', alors APP.navigateTo('swrl-rules', r.id) est appelé.

- **REQ-VIEW-050** — Dans l'encart 'Where Used in Rules', le libellé de la règle est affiché en priorité, avec l'identifiant technique en sous-texte si un libellé existe.
  - *Si* Si r.label est défini, alors mainText = r.label et subText = r.id. Sinon, mainText = r.id et subText est vide.

- **REQ-VIEW-051** — Dans l'encart 'Where Used in Rules', le libellé de la règle est souligné et change de couleur (accent) au survol de la souris.
  - *Si* Si l'utilisateur survole le libellé d'une règle dans 'Where Used', alors text-decoration passe à 'underline' et color à 'var(--accent)'.
