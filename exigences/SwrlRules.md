# Exigences — Onglet « SwrlRules »

> Document généré par rétro-engineering du code source SWOWL · version 1.0 · 2026-06-06

---

## 1. Navigation et liste des règles

- **REQ-SWRL-001** — Affichage de la liste des règles SWRL dans un panneau gauche dédié avec titre 'SWRL Rules'
  - *Si* Si l'onglet SwrlRules est actif, Alors le panneau gauche affiche la liste de toutes les règles SWRL chargées en mémoire.

- **REQ-SWRL-002** — Chaque règle est affichée avec son label (ou son ID si pas de label) et, en sous-texte, son ID lorsque le label est renseigné
  - *Si* Si la règle possède un label, Alors le label est affiché en texte principal et l'ID en sous-texte de petite taille.

- **REQ-SWRL-003** — Les règles dont une entité référencée (classe ou propriété) a été supprimée sont affichées en rouge dans la liste
  - *Si* Si un atome de la règle référence une classe ou propriété absente de l'ontologie, Alors la règle est colorée en rouge dans la liste.

- **REQ-SWRL-004** — Cliquer sur une règle dans la liste la sélectionne et affiche son formulaire d'édition dans le panneau droit
  - *Si* Si l'utilisateur clique sur une règle de la liste, Alors la règle est mise en surbrillance et son détail est rendu dans le panneau droit.

- **REQ-SWRL-005** — La sélection courante est restaurée après un rechargement de l'onglet
  - *Si* Si l'onglet est réinitialisé, Alors la règle précédemment sélectionnée est automatiquement re-sélectionnée.

- **REQ-SWRL-006** — Le panneau de liste est redimensionnable horizontalement via une poignée de séparation glissable
  - *Si* Si l'utilisateur glisse la poignée de séparation, Alors la largeur du panneau gauche est ajustée dynamiquement entre 120 px et 400 px.

---

## 2. Recherche et filtrage

- **REQ-SWRL-007** — Un champ de recherche en bas du panneau gauche filtre les règles en temps réel
  - *Si* Si l'utilisateur saisit du texte dans le champ de recherche, Alors la liste est immédiatement filtrée sans rechargement.

- **REQ-SWRL-008** — La recherche porte sur l'ID, le label, le commentaire et les valeurs des atomes (class_id, property_id, var, subject, object, value)

- **REQ-SWRL-009** — Un bouton ✕ apparaît dans le champ de recherche pour effacer la saisie et réafficher toutes les règles
  - *Si* Si la requête de recherche est non vide, Alors un bouton ✕ apparaît ; si l'utilisateur clique dessus, Alors la liste complète est restaurée.

- **REQ-SWRL-010** — Lorsqu'aucune règle ne correspond à la recherche, un message 'No matching rule' est affiché
  - *Si* Si le filtre ne retourne aucun résultat, Alors la zone de liste affiche 'No matching rule'.

---

## 3. Création et suppression de règles

- **REQ-SWRL-011** — Un bouton ➕ dans l'en-tête du panneau liste permet de créer une nouvelle règle SWRL vide
  - *Si* Si l'utilisateur clique sur ➕, Alors une règle avec un ID auto-généré unique (NewRule, NewRule1, …) est créée via POST /api/swrl-rules et immédiatement sélectionnée.

- **REQ-SWRL-012** — L'ID auto-généré incrémente un suffixe numérique pour garantir l'unicité (NewRule, NewRule1, NewRule2, …)

- **REQ-SWRL-013** — Chaque ligne de la liste affiche un bouton poubelle qui supprime la règle après confirmation
  - *Si* Si l'utilisateur clique sur le bouton supprimer, Alors une boîte de dialogue de confirmation est affichée ; si confirmé, la règle est supprimée via DELETE /api/swrl-rules/{id}.

- **REQ-SWRL-014** — Une erreur 404 du backend lors de la suppression est silencieusement ignorée (idempotence)
  - *Si* Si le backend répond 404 lors d'un DELETE, Alors aucun message d'erreur n'est affiché et la règle est retirée de l'interface.

- **REQ-SWRL-015** — Après suppression, le panneau droit affiche un message vide invitant à sélectionner ou créer une règle

---

## 4. Édition des métadonnées de la règle

- **REQ-SWRL-016** — Le formulaire d'édition expose trois champs de métadonnées : ID (obligatoire), Label et Comment

- **REQ-SWRL-017** — La saisie dans le champ ID remplace automatiquement les espaces par des underscores
  - *Si* Si l'utilisateur saisit un espace dans le champ ID, Alors le caractère est immédiatement remplacé par '_'.

- **REQ-SWRL-018** — Toute modification de l'ID, du label ou du commentaire déclenche une sauvegarde automatique via PUT /api/swrl-rules/{id}
  - *Si* Si l'utilisateur quitte un champ de métadonnées (événement onchange), Alors la règle est sauvegardée automatiquement sans action explicite.

- **REQ-SWRL-019** — Le renommage d'une règle (changement d'ID) est propagé : l'ancien ID est utilisé comme clé PUT et le nouvel ID est persisté
  - *Si* Si l'ID de la règle est modifié, Alors l'appel PUT utilise l'ancien ID comme identifiant d'URL et transmet le nouveau ID dans le corps.

- **REQ-SWRL-020** — Le champ ID reçoit le focus automatiquement à l'ouverture du formulaire d'édition d'une règle existante

- **REQ-SWRL-021** — Le champ Comment est un textarea redimensionnable verticalement

---

## 5. Structure des règles : atomes Body (if) et Head (then)

- **REQ-SWRL-022** — La règle est divisée en deux sections : 'if' (antécédents / body) et 'then' (conséquents / head)

- **REQ-SWRL-023** — La section 'if' accepte quatre types d'atomes : type_atom (Class), property_atom (Property), equality_atom (≟), naf_block (NAF)

- **REQ-SWRL-024** — La section 'then' accepte quatre types d'atomes : type_atom, property_atom, equality_atom et conditional (If … Then)

- **REQ-SWRL-025** — Un bouton par type d'atome est affiché dans la barre de chaque section pour ajouter un atome de ce type
  - *Si* Si l'utilisateur clique sur un bouton d'ajout, Alors un nouvel atome du type correspondant est ajouté à la liste et la règle est sauvegardée.

- **REQ-SWRL-026** — Un type_atom (Class) contient un champ variable (?var) et un sélecteur de classe avec la syntaxe '?var is a [Classe]'

- **REQ-SWRL-027** — Un property_atom contient un champ sujet (?subj), un sélecteur de propriété et un champ objet (?obj)

- **REQ-SWRL-028** — Un equality_atom contient un champ variable, un sélecteur d'opérateur de comparaison (=, !=, >, >=, <, <=) et un champ valeur

- **REQ-SWRL-029** — Un naf_block (Negation As Failure) est un bloc imbriqué qui peut contenir des atomes type_atom, property_atom et equality_atom

- **REQ-SWRL-030** — Un conditional (If … Then) dans la section head est un bloc imbriqué contenant une liste condition et une liste consequent, chacune pouvant être enrichie d'atomes

- **REQ-SWRL-031** — Les conditionals peuvent être imbriqués récursivement (conditional dans un consequent d'un conditional)

- **REQ-SWRL-032** — Chaque atome dispose d'un bouton ✕ pour le supprimer de sa liste, avec sauvegarde automatique
  - *Si* Si l'utilisateur clique sur ✕ d'un atome, Alors l'atome est retiré de la liste et la règle est sauvegardée immédiatement.

- **REQ-SWRL-033** — Lorsqu'une section est vide, un message d'invite est affiché en italique ('— add antecedents —' ou '— add consequents —')

---

## 6. Sélecteurs de classe, propriété et individu

- **REQ-SWRL-034** — Un sélecteur de classe s'ouvre en popup positionné (fixed) sous ou au-dessus du bouton selon l'espace disponible
  - *Si* Si l'espace sous le bouton est insuffisant, Alors le popup s'ouvre au-dessus.

- **REQ-SWRL-035** — Le sélecteur de classe affiche l'arborescence des classes de l'ontologie ; un clic sélectionne la classe et sauvegarde la règle

- **REQ-SWRL-036** — Sur un type_atom avec une classe déjà sélectionnée, le clic gauche navigue vers cette classe dans l'onglet Classes, le clic droit rouvre le sélecteur
  - *Si* Si l'utilisateur fait un clic droit sur le pill de classe, Alors le menu contextuel est annulé et le sélecteur de classe s'ouvre.

- **REQ-SWRL-037** — Si la classe référencée par un atome a été supprimée, le pill affiche '⚠ deleted' en rouge

- **REQ-SWRL-038** — Le sélecteur de propriété liste les object properties (rond bleu) et les datatype properties (rond vert) triées alphabétiquement avec séparateur

- **REQ-SWRL-039** — Sur un property_atom avec une propriété déjà sélectionnée, le clic gauche navigue vers la propriété dans son onglet dédié, le clic droit rouvre le sélecteur

- **REQ-SWRL-040** — L'equality_atom propose un bouton lorange pour ouvrir un sélecteur d'individu en modal bi-panneau
  - *Si* Si l'utilisateur clique sur le bouton de sélection d'individu, Alors une modale s'affiche avec la liste des classes à gauche et les individus filtrés à droite.

- **REQ-SWRL-041** — Le sélecteur d'individu propose 'owl:Thing' pour voir tous les individus, et chaque classe avec le nombre d'individus correspondants

- **REQ-SWRL-042** — Dans le sélecteur d'individu, un double-clic sur un individu confirme immédiatement la sélection
  - *Si* Si l'utilisateur double-clique sur un individu, Alors la sélection est confirmée et la modale se ferme sans cliquer sur OK.

- **REQ-SWRL-043** — Si l'individu sélectionné dans un equality_atom existe dans l'ontologie, il s'affiche comme un pill navigable ; sinon comme un champ texte libre

- **REQ-SWRL-044** — Tous les pickers (classe, propriété) se ferment automatiquement si l'utilisateur clique en dehors
  - *Si* Si l'utilisateur clique hors du popup, Alors le picker est masqué et l'écouteur de clic est supprimé.

---

## 7. Glisser-déposer (drag-and-drop)

- **REQ-SWRL-045** — Chaque atome d'une liste (body, head, atoms, condition, consequent) possède une poignée ⠿ permettant de le réordonner par glisser-déposer

- **REQ-SWRL-046** — Le glisser-déposer est limité à la même liste parente ; un atome ne peut pas être déplacé dans une liste différente
  - *Si* Si l'utilisateur fait glisser un atome au-dessus d'un atome d'une liste différente, Alors l'événement dragOver est ignoré (pas de dropEffect).

- **REQ-SWRL-047** — Pendant le glisser, l'atome cible est mis en évidence via la classe CSS 'swrl-drag-target'

- **REQ-SWRL-048** — Après le dépôt, les atomes sont réordonnés en mémoire, le formulaire est re-rendu et la règle est sauvegardée automatiquement
  - *Si* Si un atome est déposé à une nouvelle position, Alors la liste est mise à jour et un PUT /api/swrl-rules/{id} est déclenché.

---

## 8. Interactions backend (API REST)

- **REQ-SWRL-049** — GET /api/swrl-rules retourne la liste de toutes les règles SWRL de l'ontologie courante

- **REQ-SWRL-050** — POST /api/swrl-rules crée une nouvelle règle et retourne 201 ; une règle avec un ID déjà existant provoque une erreur 409
  - *Si* Si l'ID soumis existe déjà, Alors le backend répond 409 Conflict.

- **REQ-SWRL-051** — PUT /api/swrl-rules/{rule_id} met à jour une règle existante ; si l'ID change, l'unicité du nouvel ID est vérifiée
  - *Si* Si le nouvel ID est déjà attribué à une autre règle, Alors le backend répond 409 Conflict.

- **REQ-SWRL-052** — DELETE /api/swrl-rules/{rule_id} supprime la règle ; si elle n'existe pas, le backend retourne 404

- **REQ-SWRL-053** — Le renommage d'une classe dans l'ontologie propage automatiquement le changement dans les class_id de tous les atomes SWRL
  - *Si* Si une classe est renommée, Alors tous les atomes type_atom référençant cet ID sont mis à jour en cascade côté backend.

- **REQ-SWRL-054** — Le renommage d'une propriété dans l'ontologie propage automatiquement le changement dans les property_id de tous les atomes SWRL
  - *Si* Si une propriété est renommée, Alors tous les property_atom la référençant sont mis à jour en cascade côté backend.

- **REQ-SWRL-055** — Les règles SWRL sont exportables au format JSON via le endpoint GET /api/export/{name}?fmt=swrl
  - *Si* Si le format d'export 'swrl' est demandé, Alors un fichier JSON contenant toutes les règles est retourné avec l'extension _rules.swrl.json.

- **REQ-SWRL-056** — Toute erreur backend est affichée à l'utilisateur via la notification UI.error
  - *Si* Si une requête API échoue, Alors un message d'erreur est affiché et aucune donnée locale n'est modifiée.
