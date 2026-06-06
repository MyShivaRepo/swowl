# Exigences — Onglet « Queries »

> Document généré par rétro-engineering du code source SWOWL · version 1.0 · 2026-06-06

---

## 1. Navigation et structure de l'onglet

- **REQ-QRY-001** — L'onglet Queries est divisé en deux sous-onglets accessibles via une barre de navigation verticale latérale.
  - *Si* Si l'utilisateur clique sur un onglet latéral, alors le contenu principal est rechargé avec le sous-onglet sélectionné.

- **REQ-QRY-002** — Le premier sous-onglet s'intitule 'Sparnatural' et affiche le composant visuel Sparnatural.

- **REQ-QRY-003** — Le second sous-onglet s'intitule 'SPARQL VizQ' et affiche l'éditeur visuel de requêtes SPARQL (SparqlEditor).

- **REQ-QRY-004** — L'onglet actif est mis en évidence avec un accent coloré sur la bordure gauche et une police en gras.
  - *Si* Si un onglet est actif, alors sa bordure gauche affiche la couleur d'accent et son texte est en gras.

- **REQ-QRY-005** — L'état du sous-onglet sélectionné est persisté dans la variable APP._queriesTab entre les rendus.
  - *Si* Si l'utilisateur change de sous-onglet et revient sur l'onglet Queries, alors le dernier sous-onglet visité est restauré.

---

## 2. Sous-onglet Sparnatural

- **REQ-QRY-006** — Le composant Sparnatural est chargé dynamiquement depuis un CDN externe (jsdelivr.net, version 9.1.6).
  - *Si* Si le custom element 'spar-natural' n'est pas enregistré dans les 5 secondes, alors un message d'erreur avec lien vers le CDN est affiché.

- **REQ-QRY-007** — Sparnatural est configuré via l'endpoint /api/sparnatural-config et exécute les requêtes sur /api/sparql.

- **REQ-QRY-008** — La langue du widget Sparnatural est configurée selon la préférence utilisateur définie dans Settings.preferredLang, avec 'en' comme valeur par défaut.

- **REQ-QRY-009** — Le widget Sparnatural est limité à 1000 résultats par requête.

- **REQ-QRY-010** — Les événements 'queryUpdated' et 'submit' émis par Sparnatural déclenchent automatiquement l'exécution de la requête SPARQL générée.
  - *Si* Si Sparnatural émet un événement queryUpdated ou submit avec une queryString non vide, alors la requête est envoyée au backend et les résultats sont affichés.

- **REQ-QRY-011** — Les résultats Sparnatural affichent les URIs abrégées (fragment local après # ou /) avec l'URI complète en infobulle.

- **REQ-QRY-012** — En cas d'erreur d'exécution dans Sparnatural, un message d'erreur en rouge est affiché dans la zone de résultats.
  - *Si* Si la requête Sparnatural retourne une erreur HTTP ou réseau, alors le message d'erreur est affiché en rouge.

---

## 3. Gestion des requêtes SPARQL VizQ (CRUD)

- **REQ-QRY-013** — Les requêtes SPARQL VizQ sont persistées dans le localStorage du navigateur, séparément par ontologie.
  - *Si* Si l'ontologie active change, alors la liste des requêtes affichée correspond au localStorage de cette ontologie.

- **REQ-QRY-014** — L'utilisateur peut créer une nouvelle requête via le bouton ➕ dans l'en-tête du panneau de liste.
  - *Si* Si l'utilisateur clique sur ➕, alors une nouvelle requête avec un identifiant auto-incrémenté (Query1, Query2…) est créée, sélectionnée et sauvegardée.

- **REQ-QRY-015** — L'identifiant auto-généré d'une nouvelle requête évite les doublons en incrémentant jusqu'à trouver un ID libre.

- **REQ-QRY-016** — L'utilisateur peut sélectionner une requête existante en cliquant sur son entrée dans la liste.
  - *Si* Si l'utilisateur clique sur une requête dans la liste, alors son formulaire d'édition s'affiche dans le panneau de détail à droite.

- **REQ-QRY-017** — L'utilisateur peut supprimer une requête via le bouton corbeille affiché sur chaque entrée de la liste.
  - *Si* Si l'utilisateur clique sur le bouton supprimer d'une requête sélectionnée, alors la requête est retirée du localStorage et le panneau de détail affiche l'état vide.

- **REQ-QRY-018** — La suppression d'une requête non sélectionnée ne modifie pas la sélection courante.

- **REQ-QRY-019** — L'utilisateur peut modifier l'identifiant d'une requête via le champ ID dans l'en-tête du formulaire. Les espaces sont automatiquement remplacés par des underscores.
  - *Si* Si l'utilisateur saisit un espace dans le champ ID, alors il est immédiatement converti en underscore.

- **REQ-QRY-020** — Le changement d'identifiant d'une requête met à jour la clé dans le localStorage et rafraîchit la liste.

- **REQ-QRY-021** — L'utilisateur peut définir un libellé (label) et un commentaire (comment) pour chaque requête.
  - *Si* Si une requête a un label, alors le label est affiché comme texte principal dans la liste et l'ID apparaît en sous-texte.

---

## 4. Editeur de patterns WHERE (triplets, filtres, optionnels)

- **REQ-QRY-022** — L'utilisateur peut ajouter trois types de patterns dans la clause WHERE : Triple, Filter, Optional.

- **REQ-QRY-023** — Un pattern Triple se compose d'un champ sujet, d'un sélecteur de prédicat et d'un champ objet adaptatif.
  - *Si* Si aucun triplet n'est défini, alors un message d'invitation est affiché à la place de la liste de patterns.

- **REQ-QRY-024** — Le champ sujet d'un triplet propose l'autocomplétion parmi les variables déjà utilisées dans la requête (datalist).

- **REQ-QRY-025** — Le sélecteur de prédicat est un menu déroulant personnalisé (icon-dropdown) organisé en groupes : Classes (rdf:type), Object Properties, Datatype Properties, Annotation Properties.

- **REQ-QRY-026** — Les propriétés dans le sélecteur de prédicat respectent la hiérarchie subPropertyOf et sont affichées avec indentation.

- **REQ-QRY-027** — Lorsque le prédicat est rdf:type, le champ objet devient un menu déroulant d'arbre de classes (owl:Thing + hiérarchie).
  - *Si* Si le prédicat change vers rdf:type, alors l'objet est réinitialisé à vide et remplacé par un sélecteur d'arbre de classes.

- **REQ-QRY-028** — Lorsque le prédicat est rdfs:label, rdfs:comment ou une Datatype Property, le champ objet devient un champ texte pleine largeur acceptant une variable ou une valeur littérale.

- **REQ-QRY-029** — Pour les autres prédicats (Object Properties, inconnus), le champ objet est un champ texte court acceptant une variable ou une IRI.

- **REQ-QRY-030** — Lorsque le prédicat change de rdf:type vers un autre type, l'objet est réinitialisé à '?y'.

- **REQ-QRY-031** — Un pattern Filter affiche un champ texte monospace pour saisir une expression FILTER libre.

- **REQ-QRY-032** — Un pattern Optional contient ses propres sous-patterns (Triple et Filter) ajoutables via des boutons internes.
  - *Si* Si un bloc OPTIONAL est vide, alors un message 'OPTIONAL block vide' est affiché à l'intérieur.

- **REQ-QRY-033** — Chaque pattern (triplet, filtre, optionnel) peut être supprimé individuellement via son bouton corbeille.
  - *Si* Si l'utilisateur supprime un pattern, alors la requête est immédiatement sauvegardée et le formulaire est rechargé.

- **REQ-QRY-034** — Toute modification d'un champ de pattern (sujet, objet, expression filtre) déclenche une sauvegarde immédiate et rafraîchit l'aperçu SPARQL.

---

## 5. Options de requête (DISTINCT, ORDER BY, LIMIT)

- **REQ-QRY-035** — L'utilisateur peut activer l'option DISTINCT via une case à cocher.
  - *Si* Si DISTINCT est coché, alors le mot-clé DISTINCT est inséré dans la clause SELECT générée.

- **REQ-QRY-036** — L'utilisateur peut définir une variable de tri via le champ ORDER BY, avec autocomplétion parmi les variables de la requête.

- **REQ-QRY-037** — L'utilisateur peut choisir la direction de tri ASC ou DESC via un sélecteur déroulant.

- **REQ-QRY-038** — L'utilisateur peut définir le nombre maximum de résultats via le champ LIMIT (valeur par défaut : 100, min : 1, max : 100000).
  - *Si* Si la valeur LIMIT est invalide, alors la valeur par défaut 100 est utilisée.

---

## 6. Génération et aperçu SPARQL

- **REQ-QRY-039** — Un aperçu de la requête SPARQL générée est accessible via un panneau escamotable 'SPARQL' en bas du formulaire.
  - *Si* Si l'aperçu est masqué et que l'utilisateur clique sur l'en-tête SPARQL, alors le panneau s'affiche et le contenu est rafraîchi.

- **REQ-QRY-040** — La requête SPARQL générée inclut automatiquement les préfixes rdf, rdfs, owl et le préfixe de l'ontologie courante.

- **REQ-QRY-041** — La clause SELECT contient toutes les variables (commençant par ?) trouvées dans les sujets et objets des triplets. Si aucune variable n'est détectée, SELECT * est utilisé.

- **REQ-QRY-042** — Pour un triplet avec prédicat littéral et objet non-variable non-quoté, la génération SPARQL produit une variable intermédiaire et un FILTER(STR(?_lv) = "valeur") pour gérer les langues.

- **REQ-QRY-043** — Les triplets sans prédicat sont ignorés lors de la génération SPARQL.

- **REQ-QRY-044** — L'aperçu SPARQL est automatiquement affiché et rafraîchi lors du lancement d'une requête si l'aperçu était masqué.
  - *Si* Si l'utilisateur clique sur Run et que l'aperçu SPARQL est fermé, alors il s'ouvre automatiquement.

---

## 7. Exécution des requêtes et affichage des résultats

- **REQ-QRY-045** — L'utilisateur peut exécuter la requête en cliquant sur le bouton '▶ Run'.

- **REQ-QRY-046** — Pendant l'exécution, un indicateur de statut 'Exécution…' est affiché.

- **REQ-QRY-047** — La requête est envoyée en POST sur /api/sparql avec le SPARQL encodé dans le corps (Content-Type: application/x-www-form-urlencoded).

- **REQ-QRY-048** — Après exécution, le nombre de résultats est affiché dans la zone de statut.
  - *Si* Si la requête retourne N bindings, alors le statut affiche 'N résultat(s)'.

- **REQ-QRY-049** — Les résultats sont affichés dans un tableau HTML avec alternance de couleurs de lignes (zebra striping).

- **REQ-QRY-050** — Les cellules de type URI correspondant à une entité interne (classe, individu, propriété) sont rendues cliquables avec une icône colorée et le nom d'affichage de l'entité.
  - *Si* Si une URI de résultat correspond à une entité interne connue, alors un lien de navigation est affiché avec l'icône et le label de l'entité.

- **REQ-QRY-051** — Un clic sur une entité interne dans les résultats navigue vers la section correspondante de l'application et sélectionne l'entité.
  - *Si* Si l'utilisateur clique sur une URI interne dans les résultats, alors APP.navigate est appelé vers la section de l'entité et celle-ci est sélectionnée après 150ms.

- **REQ-QRY-052** — Les URIs externes (non reconnues comme entités internes) sont affichées comme liens hypertextes ouvrant un nouvel onglet.

- **REQ-QRY-053** — Les valeurs littérales avec balise de langue (@fr, @en…) affichent la langue en exposant.

- **REQ-QRY-054** — En cas d'erreur d'exécution, un message d'erreur rouge est affiché dans la zone de résultats du panneau de détail.
  - *Si* Si la requête retourne une erreur HTTP ou une exception réseau, alors le message d'erreur est affiché en rouge et le statut est vidé.

---

## 8. Recherche, liste et panneau redimensionnable

- **REQ-QRY-055** — Un champ de recherche en bas du panneau liste permet de filtrer les requêtes par ID ou label.
  - *Si* Si l'utilisateur saisit un texte dans la recherche, alors seules les requêtes dont l'ID ou le label contient ce texte (insensible à la casse) sont affichées.

- **REQ-QRY-056** — Si aucune requête ne correspond à la recherche, un message 'No matching query' est affiché.

- **REQ-QRY-057** — Si aucune requête n'est sauvegardée, un message 'No saved query' est affiché dans la liste.

- **REQ-QRY-058** — La largeur du panneau liste est redimensionnable par glisser-déposer via une poignée (split handle) entre le panneau liste et le panneau de détail.
  - *Si* Si l'utilisateur fait glisser la poignée, alors la largeur du panneau liste est ajustée entre 120px et 400px.

- **REQ-QRY-059** — Lors du redimensionnement, la classe CSS 'resizing' est ajoutée au body pour désactiver la sélection de texte.

- **REQ-QRY-060** — La requête sélectionnée est mise en évidence dans la liste avec la classe CSS 'selected'.

- **REQ-QRY-061** — Lorsque l'onglet SPARQL VizQ est rechargé, la sélection précédente est restaurée (restoreSelection).
  - *Si* Si _selectedId est défini au rechargement de l'onglet, alors la requête correspondante est re-sélectionnée et son formulaire ré-affiché.
