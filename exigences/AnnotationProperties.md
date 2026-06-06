# Exigences — Onglet « AnnotationProperties »

> Document généré par rétro-engineering du code source SWOWL · version 1.0 · 2026-06-06

---

## 1. Affichage général et mise en page

- **REQ-AP-001** — L'onglet affiche un panneau divisé en deux colonnes redimensionnables par un séparateur vertical draggable.
  - *Si* Si l'utilisateur fait glisser le séparateur vertical, alors la largeur du panneau arbre est recalculée entre 160 px et 520 px.

- **REQ-AP-002** — Le panneau gauche est lui-même divisé en deux zones verticales redimensionnables : la zone arbre (haut) et la zone Super Properties (bas).
  - *Si* Si l'utilisateur fait glisser le séparateur horizontal interne, alors les hauteurs relatives des deux zones du panneau gauche sont ajustées.

- **REQ-AP-003** — Lorsqu'aucune propriété n'est sélectionnée, le panneau de détail affiche un message d'invite et un bouton '＋ Create Annotation Property'.

- **REQ-AP-004** — Les propriétés built-in sont affichées uniquement si l'ontologie est de type OWL (racine owl:Thing).
  - *Si* Si la racine de l'ontologie n'est pas owl:Thing, alors les nœuds de namespace rdfs: et owl: et leurs propriétés built-in ne sont pas affichés.

---

## 2. Arbre de navigation des propriétés

- **REQ-AP-005** — L'arbre affiche deux nœuds racines de namespace (rdfs: et owl:) représentant les espaces de noms des propriétés built-in.

- **REQ-AP-006** — Sous chaque nœud de namespace, les propriétés built-in sont listées en lecture seule avec leur identifiant en police monospace et le badge 'built-in'.

- **REQ-AP-007** — Les propriétés utilisateur sans parent et sans préfixe de namespace connu sont affichées comme nœuds orphelins à la racine de l'arbre.

- **REQ-AP-008** — Les nœuds de l'arbre sont triés alphabétiquement (insensible à la casse) à chaque niveau.

- **REQ-AP-009** — Un nœud ayant des enfants affiche un chevron (▶) cliquable pour plier/déplier ses enfants ; un nœud feuille affiche un marqueur (◦).
  - *Si* Si l'utilisateur clique sur le chevron d'un nœud, alors l'état expanded/collapsed de ce nœud est basculé et l'arbre est re-rendu.

- **REQ-AP-010** — Les nœuds rdfs: et owl: sont développés par défaut au chargement de l'onglet.

- **REQ-AP-011** — Le nœud sélectionné est mis en évidence visuellement par la classe CSS 'selected'.

- **REQ-AP-012** — L'indentation des nœuds dans l'arbre est proportionnelle à leur profondeur (depth × 16 + 6 px).

---

## 3. Sélection et panneau de détail

- **REQ-AP-013** — Cliquer sur un nœud de namespace racine (rdfs: ou owl:) affiche dans le panneau de détail la liste de toutes ses propriétés built-in avec leur commentaire.

- **REQ-AP-014** — Cliquer sur une propriété built-in affiche son identifiant, son commentaire et la mention 'Built-in OWL 2 annotation property — read-only.' ; aucun champ n'est éditable.

- **REQ-AP-015** — Cliquer sur une propriété utilisateur affiche le formulaire d'édition avec le champ ID, l'IRI complète calculée, et le tableau des annotations.

- **REQ-AP-016** — L'IRI complète de la propriété est affichée sous la forme '{baseIRI}#{id}' et n'est pas éditable.
  - *Si* Si l'IRI de base de l'ontologie est vide, alors l'affichage de l'IRI complète est omis.

---

## 4. Création de propriétés

- **REQ-AP-017** — Le bouton 'Child' crée une nouvelle sous-propriété de la propriété actuellement sélectionnée.
  - *Si* Si une propriété utilisateur ou built-in est sélectionnée, alors la nouvelle propriété est créée avec subPropertyOf = [selectedId] ; si un nœud racine est sélectionné, alors subPropertyOf est vide.

- **REQ-AP-018** — Le bouton 'Sibling' crée une nouvelle propriété au même niveau que la propriété sélectionnée, héritant des mêmes parents.
  - *Si* Si aucune propriété utilisateur n'est sélectionnée (racine ou built-in), alors le bouton Sibling est masqué.

- **REQ-AP-019** — Le nom de la nouvelle propriété est généré automatiquement comme 'NewAnnotationProperty', puis 'NewAnnotationProperty1', etc., pour éviter les doublons.
  - *Si* Si 'NewAnnotationProperty' existe déjà, alors un suffixe numérique croissant est ajouté jusqu'à obtenir un identifiant unique.

- **REQ-AP-020** — Après la création, le nœud parent est automatiquement déplié et la nouvelle propriété est sélectionnée dans l'arbre.

- **REQ-AP-021** — La création d'une propriété appelle l'endpoint POST /api/annotation-properties avec le payload JSON de la nouvelle propriété.
  - *Si* Si l'identifiant existe déjà côté serveur (HTTP 409), alors une erreur est affichée et la création est annulée.

---

## 5. Édition et sauvegarde

- **REQ-AP-022** — L'identifiant de la propriété est éditable via un champ texte ; la saisie est sanitisée en temps réel (espaces convertis en '_', chiffres supprimés en tête).
  - *Si* Si l'utilisateur saisit un espace ou un chiffre en tête d'identifiant, alors le champ est corrigé automatiquement sans notification.

- **REQ-AP-023** — La sauvegarde est déclenchée automatiquement (auto-save) à chaque changement dans le formulaire (événement onchange).
  - *Si* Si le champ ID est vide, alors l'auto-save est annulée sans appel réseau.

- **REQ-AP-024** — Si l'identifiant est modifié, l'auto-save renomme la propriété via PUT /api/annotation-properties/{ancien_id} et affiche un message de succès 'Renamed → ...'.
  - *Si* Si le renommage génère un conflit (HTTP 409), alors un message d'erreur est affiché et la sélection courante est préservée.

- **REQ-AP-025** — Après chaque sauvegarde réussie, l'état applicatif est rafraîchi (APP.refresh) et la sélection courante est restaurée dans l'arbre.

- **REQ-AP-026** — La relation subPropertyOf est préservée lors de la sauvegarde depuis l'état courant du store ; elle n'est pas modifiable via le formulaire d'édition.

- **REQ-AP-027** — Le formulaire permet d'ajouter des annotations de type 'label', 'comment' et 'other' via un tableau de lignes dynamiques.
  - *Si* Si l'utilisateur modifie une valeur dans le tableau d'annotations, alors l'auto-save est déclenchée.

- **REQ-AP-028** — La validation de l'identifiant refuse un ID vide ou commençant par un chiffre (règle NCName OWL) avant la sauvegarde manuelle.
  - *Si* Si l'ID est invalide lors d'un save() explicite, alors un avertissement est affiché et la sauvegarde est bloquée.

---

## 6. Suppression de propriétés

- **REQ-AP-029** — Le bouton 'Delete' (icône poubelle, style danger) supprime la propriété utilisateur sélectionnée après confirmation.
  - *Si* Si l'utilisateur annule la boîte de confirmation, alors aucune suppression n'est effectuée.

- **REQ-AP-030** — Le bouton Delete est masqué si un nœud de namespace racine ou une propriété built-in est sélectionnée.
  - *Si* Si la sélection est une propriété built-in ou un nœud racine, alors le bouton Delete est masqué (display:none).

- **REQ-AP-031** — Après suppression réussie, la sélection est réinitialisée, le panneau de détail revient à l'état vide et l'arbre est re-rendu.

- **REQ-AP-032** — La suppression appelle l'endpoint DELETE /api/annotation-properties/{prop_id}.
  - *Si* Si la propriété n'existe pas côté serveur (HTTP 404), alors un message d'erreur est affiché.

---

## 7. Drag & Drop

- **REQ-AP-033** — Les propriétés utilisateur sont draggables dans l'arbre pour modifier leur relation de parenté par glisser-déposer.
  - *Si* Si une propriété est draggée, alors elle reçoit la classe CSS 'dragging' et l'élément cible reçoit la classe 'drag-over' au survol.

- **REQ-AP-034** — Un nœud ne peut pas être déposé sur lui-même ni sur l'un de ses propres descendants (protection contre les cycles).
  - *Si* Si la cible du drop est un descendant du nœud dragué, alors l'événement drop est ignoré (preventDefault non appelé).

- **REQ-AP-035** — Déposer une propriété sur un nœud de namespace racine (rdfs: ou owl:) la place sans parent (orpheline sous ce namespace).
  - *Si* Si la cible du drop est rdfs: ou owl:, alors subPropertyOf est réinitialisé à [] pour la propriété draguée.

- **REQ-AP-036** — Déposer une propriété sur une autre propriété (utilisateur ou built-in) la définit comme sous-propriété de la cible (subPropertyOf = [targetId]).
  - *Si* Si le drop réussit, alors un message de succès '{id} moved' est affiché et l'arbre est re-rendu.

- **REQ-AP-037** — À la fin du drag (dragend), les classes CSS 'dragging' et 'drag-over' sont retirées de tous les éléments concernés.

- **REQ-AP-038** — Un déplacement par drag & drop appelle l'endpoint PUT /api/annotation-properties/{prop_id} avec la nouvelle valeur de subPropertyOf.

---

## 8. Panneau Super Properties

- **REQ-AP-039** — Le panneau 'Super Properties' affiche la chaîne complète des ancêtres de la propriété sélectionnée, du parent direct jusqu'au nœud de namespace racine.
  - *Si* Si la propriété n'a aucun parent, alors le panneau affiche le message '— no super-property —'.

- **REQ-AP-040** — Chaque élément de la chaîne d'ancêtres est cliquable et navigue vers la propriété correspondante dans l'arbre.
  - *Si* Si l'utilisateur clique sur un ancêtre dans le panneau Super Properties, alors APP.navigateTo('annotation-properties', id) est appelé.

- **REQ-AP-041** — Les ancêtres sont affichés avec une indentation croissante et une opacité décroissante pour les niveaux plus éloignés.

- **REQ-AP-042** — Lorsqu'un nœud de namespace racine est sélectionné, le panneau Super Properties affiche le message '— select a property —'.

---

## 9. Interactions backend (API REST)

- **REQ-AP-043** — L'onglet charge la liste des propriétés via GET /api/annotation-properties au moment du rafraîchissement de l'état applicatif.

- **REQ-AP-044** — Le modèle de données d'une propriété d'annotation comprend : id (str), subPropertyOf (list[str]), comment (str), annotations (labels, comments, other).

- **REQ-AP-045** — Le backend rejette la création ou le renommage si l'identifiant existe déjà (HTTP 409 Conflict).

- **REQ-AP-046** — Le backend retourne HTTP 404 si une propriété introuvable est demandée (GET, PUT, DELETE).

---

## 10. Navigation croisée et intégration

- **REQ-AP-047** — Des liens de navigation (nav-link) depuis d'autres onglets (Classes, ObjectProperties, DatatypeProperties, Individuals) permettent de naviguer directement vers une annotation property spécifique.
  - *Si* Si APP.navigateTo('annotation-properties', id) est appelé, alors l'onglet Annotation Properties est activé et la propriété id est sélectionnée.

- **REQ-AP-048** — Les propriétés built-in (rdfs:label, rdfs:comment, etc.) et les propriétés utilisateur sont disponibles dans les pickers d'annotations des autres onglets.

- **REQ-AP-049** — La sélection courante dans l'arbre est restaurée après chaque re-rendu de la section (restoreSelection).
  - *Si* Si _selectedId est non nul lors du re-rendu, alors selectProp(_selectedId) est appelé automatiquement.
