# Exigences — Onglet « Classes »

> Document généré par rétro-engineering du code source SWOWL · version 1.0 · 2026-06-06

---

## 1. Navigation et sélection dans l'arbre

- **REQ-CLS-001** — Sélection d'une classe
  - *Si* l'utilisateur clique sur un nœud de l'arbre, *Alors* la classe est mise en surbrillance, le panneau droit affiche son formulaire, et le panneau « Super Classes » est mis à jour.

- **REQ-CLS-002** — Sélection de la racine `owl:Thing`
  - *Si* l'utilisateur clique sur le nœud racine, *Alors* le panneau droit affiche un message d'accueil avec le bouton « Create Class », et le panneau « Super Classes » est vidé.

- **REQ-CLS-003** — Sauvegarde silencieuse lors du changement de sélection
  - *Si* une classe est en cours d'édition et que l'utilisateur sélectionne une autre classe, *Alors* la classe courante est sauvegardée silencieusement avant le changement.

- **REQ-CLS-004** — Restauration de la sélection après re-rendu
  - *Si* la section est re-rendue (ex. après sauvegarde), *Alors* la sélection précédente est restaurée.

- **REQ-CLS-005** — Activation contextuelle des boutons de la barre d'outils
  - *Si* `owl:Thing` est sélectionné, *Alors* seul le bouton « Child » est actif.
  - *Si* une classe est sélectionnée, *Alors* les boutons « Child », « Sibling » et « Delete » sont tous actifs.
  - *Si* rien n'est sélectionné, *Alors* tous les boutons sont désactivés.

---

## 2. Construction et affichage de l'arbre hiérarchique

- **REQ-CLS-010** — Calcul de la hiérarchie
  - *Si* des classes ont un `subClassOf` pointant vers d'autres classes de l'ontologie, *Alors* elles sont affichées comme enfants (tri alphabétique).
  - *Si* une classe n'a aucun parent interne, *Alors* elle est placée sous `owl:Thing`.
  - *Si* une classe a uniquement des parents externes préfixés (ex. `skos:Concept`), *Alors* elle est affichée comme racine indépendante.

- **REQ-CLS-011** — Nœuds expansibles / repliables
  - *Si* une classe a des enfants, *Alors* un triangle ▶ est affiché ; le clic bascule l'état ouvert/fermé du sous-arbre.

- **REQ-CLS-012** — Expansion automatique des ancêtres
  - *Si* une classe est sélectionnée par navigation externe, *Alors* tous ses ancêtres sont expandés automatiquement pour la rendre visible.

- **REQ-CLS-013** — Message d'état vide
  - *Si* aucune classe n'existe dans l'ontologie, *Alors* un message « No classes » est affiché dans le panneau arbre.

- **REQ-CLS-014** — Identifiant visuel
  - Chaque classe est représentée par un point marron (`.cls-dot`). La racine `owl:Thing` a un style visuel distinct.

---

## 3. Création de classe

- **REQ-CLS-020** — Création d'une classe enfant
  - *Si* l'utilisateur clique sur « Child » (barre d'outils ou menu contextuel), *Alors* une nouvelle classe est créée avec `subClassOf = [id_du_parent_sélectionné]`, et le parent est expandé dans l'arbre.

- **REQ-CLS-021** — Création d'une classe sœur
  - *Si* l'utilisateur clique sur « Sibling », *Alors* une nouvelle classe est créée avec les mêmes parents que la classe courante.

- **REQ-CLS-022** — Génération automatique du nom initial
  - *Si* une nouvelle classe est créée, *Alors* son ID est `NewClass`, `NewClass1`, `NewClass2`… (premier nom disponible non déjà utilisé).

- **REQ-CLS-023** — Structure initiale
  - Toute nouvelle classe est créée avec : `id`, `annotations.labels=[]`, `annotations.comments=[]`, `subClassOf`, `equivalentClass=[]`, `disjointWith=[]`.

- **REQ-CLS-024** — Appel API à la création
  - *Si* la classe est créée, *Alors* `POST /api/classes` est appelé. Si l'ID existe déjà, le backend retourne HTTP 409.

- **REQ-CLS-025** — Unicité de l'ID (backend)
  - *Si* l'ID soumis existe déjà, *Alors* le backend lève une erreur `HTTP 409 "Classe 'X' already exists"`.

---

## 4. Renommage de classe

- **REQ-CLS-030** — Renommage via le champ ID
  - *Si* l'utilisateur modifie le champ ID et sauvegarde, *Alors* `PUT /api/classes/{ancien_id}` est appelé avec le nouvel ID, et un message de confirmation est affiché.

- **REQ-CLS-031** — Propagation en cascade du renommage (backend)
  - *Si* une classe est renommée, *Alors* le backend propage le changement dans : `subClassOf` / `equivalentClass` / `disjointWith` de toutes les classes, `domain` / `range` des ObjectProperties, `domain` des DatatypeProperties, `types` des Individuals, et atomes des règles SWRL.

- **REQ-CLS-032** — Unicité du nouvel ID (backend)
  - *Si* le nouvel ID est déjà utilisé par une autre classe, *Alors* le backend lève `HTTP 409`.

---

## 5. Suppression de classe

- **REQ-CLS-040** — Confirmation avant suppression
  - *Si* l'utilisateur clique « Delete », *Alors* une fenêtre de confirmation est affichée. Si des classes descendantes existent, leur nombre et leurs IDs sont listés dans la confirmation.

- **REQ-CLS-041** — Blocage si des individus utilisent la classe
  - *Si* des individus ont comme `type` la classe à supprimer ou l'un de ses descendants, *Alors* la suppression est bloquée (frontend et backend) avec un message listant les individus concernés (max 3 affichés).

- **REQ-CLS-042** — Suppression en cascade des descendants (backend)
  - *Si* une classe est supprimée, *Alors* toutes ses classes descendantes (récursivement) sont également supprimées, et ces classes sont retirées des `domain` de toutes les propriétés.

- **REQ-CLS-043** — Réinitialisation de la sélection après suppression
  - Après suppression réussie, la sélection est vidée et l'arbre est rafraîchi.

---

## 6. Glisser-Déposer (Drag & Drop)

- **REQ-CLS-050** — Démarrage du drag
  - *Si* l'utilisateur commence à glisser un nœud, *Alors* l'ID de la classe est mémorisé, et la classe glissée reçoit un style `dragging` (opacité réduite).

- **REQ-CLS-051** — Indicateur visuel sur la cible
  - *Si* la souris passe sur un nœud valide pendant le drag, *Alors* la cible reçoit un style `drag-over`.

- **REQ-CLS-052** — Interdiction de drop sur un descendant
  - *Si* la cible de drop est un descendant de la classe glissée, *Alors* le drop est refusé avec un message « Cannot drop on a descendant — would create a cycle ».

- **REQ-CLS-053** — Déplacement par drop
  - *Si* un drop est effectué sur une cible valide, *Alors* les parents de la classe glissée sont remplacés par `[targetId]` (ou `[]` si drop sur `owl:Thing`). Les restrictions objet dans `subClassOf` sont conservées. `PUT /api/classes/{id}` est appelé et un message « Moved » est affiché.

- **REQ-CLS-054** — Nettoyage après fin de drag
  - Après fin du drag, les styles `dragging` et `drag-over` sont retirés de tous les éléments.

---

## 7. Menu contextuel (clic droit)

- **REQ-CLS-060** — Affichage du menu contextuel
  - *Si* l'utilisateur fait un clic droit sur un nœud de l'arbre, *Alors* un menu flottant est affiché à la position du curseur.

- **REQ-CLS-061** — Contenu du menu selon la cible
  - *Si* le clic droit est sur `owl:Thing`, *Alors* le menu contient uniquement « Add Child Class ».
  - *Si* le clic droit est sur une classe, *Alors* le menu contient « Add Child Class », « Add Sibling Class », et « Delete » (en rouge).

- **REQ-CLS-062** — Positionnement adaptatif
  - *Si* le menu déborde du bord de l'écran, *Alors* il est repositionné pour rester visible.

- **REQ-CLS-063** — Fermeture automatique
  - *Si* l'utilisateur clique en dehors du menu, *Alors* le menu est fermé.

---

## 8. Panneau « Super Classes »

- **REQ-CLS-070** — Affichage des super-classes avec chaîne ancestrale
  - *Si* une classe est sélectionnée, *Alors* le panneau affiche chaque parent direct avec sa chaîne d'ancêtres complète jusqu'à `owl:Thing` (ancêtres indirects en opacité réduite).

- **REQ-CLS-071** — Navigation vers un ancêtre
  - *Si* l'utilisateur clique sur le nom d'un ancêtre dans le panneau, *Alors* cette classe est sélectionnée dans l'arbre.

- **REQ-CLS-072** — Navigation vers `owl:Thing`
  - *Si* l'utilisateur clique sur `owl:Thing` dans le panneau, *Alors* la racine est sélectionnée.

- **REQ-CLS-073** — Suppression d'un parent direct
  - *Si* l'utilisateur clique sur ✕ d'un parent direct, *Alors* ce parent est retiré et la classe est sauvegardée automatiquement.

- **REQ-CLS-074** — Ajout d'une super-classe
  - *Si* l'utilisateur clique sur ＋ dans le panneau, *Alors* un sélecteur déroulant affiche les classes disponibles (excluant la classe courante et les parents déjà listés). La sélection déclenche une sauvegarde automatique.

- **REQ-CLS-075** — Placeholder `owl:Thing`
  - *Si* une classe n'a aucun parent, *Alors* `owl:Thing` est affiché en italique comme unique ancêtre dans le panneau.

---

## 9. Annotations

- **REQ-CLS-080** — Affichage des annotations existantes
  - *Si* une classe possède des annotations (`rdfs:label`, `rdfs:comment`, autres), *Alors* celles-ci sont affichées dans un tableau avec colonnes : Propriété / Valeur / Langue.

- **REQ-CLS-081** — Ajout d'un `rdfs:label`
  - *Si* l'utilisateur clique sur « + label », *Alors* une nouvelle ligne est ajoutée avec la propriété `rdfs:label` et la langue par défaut.

- **REQ-CLS-082** — Ajout d'un `rdfs:comment`
  - *Si* l'utilisateur clique sur « + comment », *Alors* une nouvelle ligne est ajoutée avec `rdfs:comment`.

- **REQ-CLS-083** — Ajout d'une annotation property arbitraire
  - *Si* l'utilisateur clique sur « + Annotation Property », *Alors* un picker liste les propriétés built-in OWL 2 et les annotation properties de l'utilisateur. La sélection ajoute une ligne dans le tableau.

- **REQ-CLS-084** — Suppression d'une annotation
  - *Si* l'utilisateur clique sur ✕ d'une ligne d'annotation, *Alors* la ligne est supprimée et une sauvegarde automatique est déclenchée.

- **REQ-CLS-085** — Champ de langue par annotation
  - Chaque annotation possède un champ langue (texte libre) avec un bouton ▼ ouvrant un sélecteur de langue.

- **REQ-CLS-086** — Navigation vers la propriété d'annotation
  - *Si* l'utilisateur clique sur le nom d'une propriété d'annotation, *Alors* l'application navigue vers cette propriété dans l'onglet AnnotationProperties.

- **REQ-CLS-087** — Collecte des annotations à la sauvegarde
  - Seules les annotations avec une valeur non vide sont persistées. Format : `{value, lang}` pour labels/comments, `{property, value}` pour les autres.

---

## 10. Restrictions et propriétés (Asserted / Inherited)

- **REQ-CLS-090** — Section « Asserted Properties »
  - *Si* une classe possède des restrictions dans `subClassOf`, *Alors* elles sont groupées par propriété avec un chip de range/multiplicité si la propriété a un `range` défini.

- **REQ-CLS-091** — Section « Inherited Properties »
  - *Si* une classe a des super-classes possédant des restrictions, *Alors* celles-ci sont affichées en lecture seule avec l'indication de la classe d'origine (↑ NomClasse). La section est rétractable.

- **REQ-CLS-092** — Ajout d'une propriété existante
  - *Si* l'utilisateur clique sur « + property », *Alors* un picker liste les ObjectProperties et DatatypeProperties non encore assertées. La sélection ajoute la propriété comme groupe vide.

- **REQ-CLS-093** — Création d'une ObjectProperty avec domaine = classe courante
  - *Si* l'utilisateur clique sur le bouton « OP », *Alors* une nouvelle ObjectProperty est créée avec `domain = [id_classe_courante]`, et l'application navigue vers l'onglet ObjectProperties.

- **REQ-CLS-094** — Création d'une DatatypeProperty avec domaine = classe courante
  - *Si* l'utilisateur clique sur le bouton « DT », *Alors* une nouvelle DatatypeProperty est créée avec `domain = [id_classe_courante]`, et l'application navigue vers l'onglet DatatypeProperties.

- **REQ-CLS-095** — Ajout d'une restriction à une propriété
  - *Si* l'utilisateur fait un clic droit sur une propriété assertée, *Alors* un menu propose les 6 types de restrictions : `∃ someValuesFrom`, `∀ allValuesFrom`, `∋ hasValue`, `= exactCardinality`, `≥ minCardinality`, `≤ maxCardinality`.

- **REQ-CLS-096** — Bascule filler / cardinalité
  - *Si* le type de restriction contient « Cardinality », *Alors* le champ filler est masqué et un champ numérique est affiché. Sinon, le sélecteur de classe filler est affiché.

- **REQ-CLS-097** — Sélection de la classe filler
  - *Si* l'utilisateur clique sur le bouton filler, *Alors* un dropdown affiche la hiérarchie complète des classes (incluant `owl:Thing`).

- **REQ-CLS-098** — Navigation depuis une restriction héritée
  - *Si* le filler d'une restriction héritée est une classe de l'ontologie, *Alors* son nom est cliquable et navigue vers cette classe.

- **REQ-CLS-099** — Suppression d'une restriction enfant
  - *Si* l'utilisateur clique sur ✕ d'un enfant de restriction, *Alors* le nœud est supprimé et une sauvegarde automatique est déclenchée.

- **REQ-CLS-100** — Suppression d'une propriété entière
  - *Si* l'utilisateur clique sur ✕ du groupe de propriété, *Alors* la propriété et toutes ses restrictions sont retirées, et une sauvegarde automatique est déclenchée.

- **REQ-CLS-101** — Marqueur de présence (`_marker`)
  - *Si* une propriété est ajoutée sans aucune restriction enfant, *Alors* elle est persistée via un marqueur `{type: '_marker', property: propId}` pour maintenir le lien `domain ↔ classe`.

- **REQ-CLS-102** — Chip de multiplicité
  - *Si* une propriété assertée a un `range` défini, *Alors* un chip `(single NomRange)` ou `(multiple NomRange)` est affiché selon que la propriété est fonctionnelle ou non.

- **REQ-CLS-103** — Navigation vers la propriété
  - *Si* l'utilisateur clique sur le nom d'une propriété (assertée ou héritée), *Alors* l'application navigue vers l'onglet correspondant (ObjectProperties ou DatatypeProperties).

- **REQ-CLS-104** — Synchronisation `_marker` ↔ domaine (backend)
  - *Si* une classe est mise à jour, *Alors* le backend synchronise les `domain` des propriétés selon les marqueurs `_marker` ajoutés ou retirés.

---

## 11. Classes équivalentes

- **REQ-CLS-110** — Affichage
  - Les classes équivalentes de type `string` sont affichées dans la frame « Equivalent » du formulaire.

- **REQ-CLS-111** — Ajout d'une classe équivalente
  - *Si* l'utilisateur clique sur ＋ dans la frame « Equivalent », *Alors* un picker arborescent s'affiche (excluant la classe courante et les équivalentes déjà listées). La sélection déclenche une sauvegarde automatique.

- **REQ-CLS-112** — Navigation vers une classe équivalente
  - *Si* l'utilisateur clique sur le nom d'une classe équivalente, *Alors* l'application navigue vers cette classe.

- **REQ-CLS-113** — Suppression d'une équivalence
  - *Si* l'utilisateur clique sur ✕ d'une équivalence, *Alors* l'item est retiré et une sauvegarde automatique est déclenchée.

- **REQ-CLS-114** — Symétrie automatique (backend)
  - *Si* la classe A est définie comme équivalente à B, *Alors* le backend ajoute automatiquement B comme équivalente à A. Si l'équivalence est retirée, la symétrie est supprimée.

---

## 12. Classes disjointes

- **REQ-CLS-120** — Affichage
  - Les classes disjointes sont affichées dans la frame « Disjoints » du formulaire.

- **REQ-CLS-121** — Ajout d'une classe disjointe
  - *Si* l'utilisateur clique sur ＋ dans la frame « Disjoints », *Alors* un picker arborescent s'affiche (excluant la classe courante et les disjoints déjà listés). La sélection déclenche une sauvegarde automatique.

- **REQ-CLS-122** — Suppression d'un disjoint
  - *Si* l'utilisateur clique sur ✕ d'un disjoint, *Alors* l'item est retiré et une sauvegarde automatique est déclenchée.

- **REQ-CLS-123** — Symétrie automatique (backend)
  - *Si* la classe A est déclarée disjointe de B, *Alors* le backend ajoute automatiquement A dans les disjoints de B, et retire la symétrie si la disjonction est supprimée.

---

## 13. Validation des identifiants OWL (NCName)

- **REQ-CLS-130** — Sanitisation en temps réel (frontend)
  - *Si* l'utilisateur saisit dans le champ ID, *Alors* les espaces sont remplacés par `_` et les chiffres en début de saisie sont supprimés.

- **REQ-CLS-131** — Validation avant sauvegarde (frontend)
  - *Si* l'ID est vide, *Alors* un message « ID is required. » est affiché.
  - *Si* l'ID commence par un chiffre, *Alors* un message « Identifier cannot start with a digit (OWL NCName rule). » est affiché.

- **REQ-CLS-132** — Validation côté backend
  - *Si* l'ID reçu est vide ou commence par un chiffre, *Alors* le backend lève `HTTP 422`.

---

## 14. Sauvegarde automatique (AutoSave)

- **REQ-CLS-140** — Déclenchement de l'AutoSave
  - *Si* une classe est en cours d'édition et que l'utilisateur modifie un champ (annotation, super-classe, équivalent, disjoint, restriction), *Alors* `autoSave()` est déclenché automatiquement.

- **REQ-CLS-141** — Sauvegarde silencieuse
  - *Si* l'utilisateur change de classe sans avoir déclenché de sauvegarde explicite, *Alors* l'état courant est persisté via `PUT /api/classes/{id}` sans re-rendu ni message affiché.

- **REQ-CLS-142** — Collecte complète à la sauvegarde
  - La sauvegarde collecte depuis le DOM : ID, annotations, super-classes, équivalences, disjoints, et restrictions.

---

## 15. Navigation croisée

- **REQ-CLS-150** — IRI complète affichée
  - *Si* l'ontologie a un ID de base, *Alors* l'IRI complète de la classe est affichée sous la forme `{baseIri}#{classId}`.

- **REQ-CLS-151** — Navigation vers une entité référencée
  - *Si* l'utilisateur clique sur une super-classe, une classe équivalente, ou un filler de restriction, *Alors* l'application navigue vers cette classe.

- **REQ-CLS-152** — Frame « Where Used in Rules »
  - *Si* la classe est référencée dans au moins une règle SWRL, *Alors* une frame « Where Used in Rules » est affichée en bas du formulaire, avec les règles concernées cliquables vers l'onglet SWRL Rules.

---

## 16. Interface API REST (backend)

| Opération | Méthode | Endpoint |
|---|---|---|
| Lister les classes | GET | `/api/classes` |
| Créer une classe | POST | `/api/classes` |
| Récupérer une classe | GET | `/api/classes/{id}` |
| Mettre à jour / renommer | PUT | `/api/classes/{id}` |
| Supprimer | DELETE | `/api/classes/{id}` |

- **REQ-CLS-160** — Persistance immédiate
  - Toute modification (création, mise à jour, suppression) déclenche une sauvegarde sur disque côté backend.

---

## 17. Mise en page redimensionnable

- **REQ-CLS-170** — Redimensionnement horizontal arbre / formulaire
  - Un séparateur vertical permet de redimensionner la largeur du panneau arbre (entre 160 px et 520 px) par drag horizontal.

- **REQ-CLS-171** — Redimensionnement vertical arbre ↕ Super Classes
  - Un séparateur horizontal permet de redimensionner la hauteur entre le sous-panneau « Asserted Hierarchy » et le sous-panneau « Super Classes ».

- **REQ-CLS-172** — Redimensionnement des sections du formulaire
  - Des séparateurs horizontaux permettent de redimensionner les sections Annotations / Restrictions / Disjoints-Equivalents dans le panneau formulaire.
