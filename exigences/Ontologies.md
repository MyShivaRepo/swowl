# Exigences — Onglet « Ontologies »

> Document généré par rétro-engineering du code source SWOWL · version 1.0 · 2026-06-06

---

## 1. Navigation et affichage de l'onglet

- **REQ-ONT-001** — L'onglet Ontologies est le premier onglet ouvert par défaut au démarrage de l'application.
  - *Si* Si aucune ontologie n'est connectée au lancement, alors l'onglet Ontologies est affiché.

- **REQ-ONT-002** — Le passage à l'onglet Ontologies est enregistré dans l'historique de navigation (boutons ◀ ►).
  - *Si* Si l'utilisateur navigue vers l'onglet Ontologies, alors l'état précédent est empilé dans l'historique et les boutons ◀ ► sont mis à jour.

- **REQ-ONT-003** — Si un onglet optionnel masqué est l'onglet actif, la navigation est redirigée automatiquement vers l'onglet Ontologies.
  - *Si* Si un onglet est masqué alors qu'il est actif, alors l'application navigue automatiquement vers l'onglet Ontologies.

- **REQ-ONT-004** — L'onglet Ontologies affiche un en-tête de section intitulé « Ontologies ».

- **REQ-ONT-005** — Lorsque l'onglet Ontologies est rendu, les données de la table du registre sont chargées de manière asynchrone depuis le backend.
  - *Si* Si le chargement échoue, alors la ligne de la table affiche « Unable to load the registry. ».

- **REQ-ONT-006** — Le compteur d'ontologies dans la barre du registre affiche le nombre total d'ontologies présentes.
  - *Si* Si la liste contient N ontologies, alors le texte affiché est « N ontology » (singulier) ou « N ontologies » (pluriel).

---

## 2. Table du registre

- **REQ-ONT-007** — La table du registre affiche les colonnes : indicateur de connexion, nom, répertoire, préfixe, espace de nommage (URI), et actions.

- **REQ-ONT-008** — Les ontologies sont triées dans la table : les ontologies utilisateur en premier (ordre alphabétique), puis les ontologies W3C intégrées (OWL, RDFS, RDF) en dernier.
  - *Si* Si une ontologie est marquée readonly, alors elle est affichée après toutes les ontologies utilisateur, dans l'ordre OWL > RDFS > RDF.

- **REQ-ONT-009** — L'ontologie actuellement connectée est mise en évidence visuellement dans la table (classe CSS onto-current-row) et son indicateur affiche un point vert ●.
  - *Si* Si une ontologie est connectée, alors son indicateur est ● vert ; sinon il est ○ gris.

- **REQ-ONT-010** — Un clic sur une ligne de la table sélectionne l'ontologie correspondante (mise en surbrillance via la classe onto-selected-row).
  - *Si* Si l'utilisateur clique sur une ligne, alors la ligne précédemment sélectionnée perd sa surbrillance et la nouvelle ligne est mise en surbrillance.

- **REQ-ONT-011** — La cellule « Répertoire » est cliquable et déclenche la révélation du fichier dans le Finder (via host_agent.py).
  - *Si* Si host_agent.py n'est pas démarré, alors un avertissement « Start host_agent.py to enable Finder reveal. » est affiché.

- **REQ-ONT-012** — Les ontologies W3C (readonly) affichent une étiquette « W3C » et une icône de verrou 🔒 à la place des boutons d'édition et de suppression.
  - *Si* Si une ontologie est marquée readonly, alors seul le bouton Connect/Disconnect est affiché (pas de bouton ✏️, ni ✕, ni export).

- **REQ-ONT-013** — Si la table ne contient aucune ontologie, un message d'invitation est affiché à la place des lignes.
  - *Si* Si la liste du registre est vide, alors le message « No ontologies yet — use a button above to get started. » est affiché.

- **REQ-ONT-014** — L'auto-sélection de la ligne est effectuée lors du chargement : si aucune sélection manuelle n'existe, l'ontologie connectée est automatiquement sélectionnée.
  - *Si* Si aucune ontologie n'est manuellement sélectionnée et qu'une ontologie est connectée, alors cette ontologie est pré-sélectionnée dans la table.

---

## 3. Arbre des imports (sous-lignes)

- **REQ-ONT-015** — Chaque ontologie utilisateur affiche ses imports OWL sous forme de sous-lignes imbriquées dans la table.
  - *Si* Si une ontologie ne déclare aucun import explicite, alors l'import implicite http://www.w3.org/2002/07/owl# est affiché.

- **REQ-ONT-016** — Les sous-lignes d'import affichent un toggle ▶/▼ si l'import possède lui-même des sous-imports, ou une flèche ↳ sinon.
  - *Si* Si l'utilisateur clique sur le toggle ▶, alors les sous-imports de cet import sont affichés et le toggle passe à ▼.

- **REQ-ONT-017** — L'état d'expansion des sous-lignes d'import est mémorisé dans la session (ensemble _ontoImportExpanded).
  - *Si* Si l'utilisateur a développé un nœud d'import, alors ce nœud reste développé lors du rechargement de la table (sans appel API supplémentaire).

- **REQ-ONT-018** — Un clic sur le nom d'un import résolu (présent dans le registre) fait défiler et met en surbrillance la ligne principale correspondante dans la table.
  - *Si* Si l'import cliqué est résolu dans le registre, alors la ligne est scrollée en vue et un contour accent de 1,5 seconde s'affiche.

- **REQ-ONT-019** — Les cycles d'imports sont détectés et interrompus pour éviter une récursion infinie dans le rendu des sous-lignes.
  - *Si* Si un URI d'import est déjà présent dans la chaîne d'ancêtres visitée, alors il n'est pas rendu à nouveau.

---

## 4. Boutons d'action du registre (par ontologie)

- **REQ-ONT-020** — Le bouton « ▶ Connect » connecte l'ontologie sélectionnée et la rend active pour tous les autres onglets.
  - *Si* Si la connexion réussit, alors un toast de succès est affiché, l'état global est rechargé et la table est mise à jour.

- **REQ-ONT-021** — Le bouton « ⏏ Disconnect » déconnecte l'ontologie active.
  - *Si* Si la déconnexion réussit, alors les onglets d'édition affichent le message « No ontology connected » avec un lien vers l'onglet Ontologies.

- **REQ-ONT-022** — Le bouton « ✏️ » ouvre le panneau wizard en mode édition pré-rempli avec les métadonnées de l'ontologie (nom, répertoire, préfixe, URI).
  - *Si* Si le wizard du même type est déjà ouvert, alors un nouveau clic sur ce bouton remplace son contenu par le formulaire d'édition.

- **REQ-ONT-023** — Le bouton « ↓ Ontology » ouvre un menu déroulant permettant d'exporter l'ontologie au format OWL (.owl) ou Turtle (.ttl).
  - *Si* Si l'utilisateur sélectionne un format d'export, alors le fichier est téléchargé directement dans le navigateur sous le nom {name}.owl ou {name}.ttl.

- **REQ-ONT-024** — Le bouton « ↓ Rules » ouvre un menu déroulant permettant d'exporter les règles SWRL au format JSON (.json) ou SWORD (.sword).
  - *Si* Si l'utilisateur sélectionne SWRL JSON, alors les règles de l'ontologie sont sérialisées et téléchargées sous {name}_rules.swrl.json.

- **REQ-ONT-025** — Le bouton « ✕ » supprime l'ontologie du registre après confirmation de l'utilisateur, sans supprimer le fichier sur disque.
  - *Si* Si l'utilisateur annule la boîte de confirmation, alors l'ontologie reste dans le registre.

- **REQ-ONT-026** — Les menus déroulants d'export se ferment automatiquement si l'utilisateur clique en dehors de ceux-ci.

---

## 5. Wizards de création / import / chargement

- **REQ-ONT-027** — L'onglet Ontologies affiche quatre boutons d'action principaux : « ✨ New Ontology », « 📥 Import Ontology », « 📂 Load Ontology » et « W3C Fetch W3C Ontologies ».

- **REQ-ONT-028** — Un clic sur un bouton d'action ouvre le panneau wizard correspondant ; un second clic sur le même bouton ferme le panneau (comportement bascule).
  - *Si* Si le panneau wizard est déjà ouvert avec le même type, alors il se ferme. Sinon il s'ouvre avec le contenu correspondant.

- **REQ-ONT-029** — Le wizard « New Ontology » collecte : nom (requis), répertoire (requis, sélectionnable via navigateur de fichiers), préfixe (défaut : onto), et URI de namespace (requis).
  - *Si* Si l'un des champs requis est vide, alors un message d'erreur toast est affiché et la création est annulée.

- **REQ-ONT-030** — Le wizard « New Ontology » propose une case à cocher « Connect immediately » cochée par défaut pour connecter l'ontologie juste après sa création.
  - *Si* Si la case est cochée, alors l'ontologie est connectée immédiatement après son enregistrement dans le registre.

- **REQ-ONT-031** — Le wizard « Import Ontology » accepte les fichiers source aux formats .owl, .ttl, .rdf et .xml.
  - *Si* Si le fichier sélectionné est au format Turtle (.ttl), alors le backend le parse avec le format « turtle » ; sinon le format « xml » est utilisé.

- **REQ-ONT-032** — Le bouton « 🔍 Read Prefix & URI from file » du wizard Import analyse le fichier source et pré-remplit automatiquement les champs préfixe et URI.
  - *Si* Si les champs préfixe et URI sont déjà remplis, alors seul le champ vide est mis à jour par l'auto-détection.

- **REQ-ONT-033** — Le wizard « Load Ontology » accepte uniquement des fichiers .json (format interne SWOWL).
  - *Si* Si le bouton 🔍 est cliqué sans fichier sélectionné, alors un avertissement toast est affiché.

- **REQ-ONT-034** — Le wizard « Load Ontology » propose le bouton « 🔍 Read info from file » qui pré-remplit automatiquement le nom, le préfixe et l'URI depuis le fichier JSON.

- **REQ-ONT-035** — Tous les wizards proposent un bouton « Cancel » qui ferme le panneau sans modifier le registre.

- **REQ-ONT-036** — Après chaque opération réussie dans un wizard (création, import, chargement, édition), le wizard est fermé, l'état global est rechargé et la table du registre est rafraîchie.

---

## 6. Navigateur de fichiers (FsBrowser)

- **REQ-ONT-037** — Les champs de sélection de fichier ou de répertoire dans les wizards ouvrent un navigateur de fichiers modal intégré à l'application.
  - *Si* Si l'utilisateur clique sur le champ readonly, alors la modale FsBrowser s'ouvre sur le répertoire courant mémorisé ou /Users/bernard par défaut.

- **REQ-ONT-038** — Le navigateur de fichiers affiche un fil d'Ariane cliquable permettant de naviguer rapidement vers un répertoire parent.
  - *Si* Si l'utilisateur clique sur un segment du fil d'Ariane, alors le contenu de la liste est rechargé pour ce répertoire.

- **REQ-ONT-039** — Le navigateur de fichiers fonctionne en deux modes : sélection de fichier (extensions filtrées) et sélection de répertoire.
  - *Si* En mode fichier, le bouton « Select this file » est désactivé tant qu'aucun fichier n'est cliqué. En mode répertoire, le bouton « Select this folder » est toujours actif.

- **REQ-ONT-040** — Un double-clic sur un fichier dans le navigateur le sélectionne et ferme immédiatement la modale en confirmant la sélection.

- **REQ-ONT-041** — La modale du navigateur de fichiers se ferme si l'utilisateur clique en dehors de la fenêtre modale.

- **REQ-ONT-042** — Si un répertoire n'est pas accessible (permissions Docker), le navigateur affiche un message d'erreur explicatif.
  - *Si* Si l'erreur contient « 403 » ou « Permission », alors le message « Permission denied — this folder is not accessible from Docker. » est affiché.

---

## 7. Fetch des ontologies W3C intégrées

- **REQ-ONT-043** — Le bouton « W3C Fetch W3C Ontologies » télécharge les trois ontologies fondamentales W3C (RDF, RDFS, OWL) depuis w3.org et les enregistre en lecture seule dans le registre.
  - *Si* Si le téléchargement réussit, alors le nombre d'ontologies récupérées est affiché dans un toast de succès et la table est rafraîchie.

- **REQ-ONT-044** — Le bouton « W3C Fetch W3C Ontologies » est désactivé pendant le téléchargement pour éviter les doubles soumissions.
  - *Si* Si le téléchargement est en cours, alors le bouton est désactivé (disabled=true) et est réactivé à la fin (succès ou erreur).

- **REQ-ONT-045** — Les ontologies W3C téléchargées sont stockées dans ~/.swowl/builtins/ et enregistrées en lecture seule dans le registre.

---

## 8. Édition des métadonnées d'une ontologie

- **REQ-ONT-046** — Le formulaire d'édition d'une ontologie permet de modifier son nom, son répertoire, son préfixe et son URI de namespace.
  - *Si* Si le nom ou le répertoire ou l'URI est vide lors de la sauvegarde, alors un toast d'erreur est affiché et la sauvegarde est annulée.

- **REQ-ONT-047** — La modification du nom ou du répertoire d'une ontologie recalcule automatiquement le chemin de fichier (.json) à partir du répertoire et du nom saisis.
  - *Si* Lors de la sauvegarde, le chemin est construit comme dir + '/' + name + '.json' en supprimant le '/' final du répertoire si présent.

- **REQ-ONT-048** — Le backend vérifie l'unicité du nom d'ontologie dans le registre lors de la création et retourne une erreur HTTP 409 si le nom existe déjà.
  - *Si* Si un nom en doublon est soumis, alors le backend retourne 409 et le frontend affiche le message d'erreur correspondant.

---

## 9. Gestion de l'état de connexion et impact sur les autres onglets

- **REQ-ONT-049** — Lorsqu'aucune ontologie n'est connectée, les onglets d'édition (Classes, Propriétés, Individus, SWRL, Vues, Requêtes, Inférences) affichent un message de blocage avec un lien vers l'onglet Ontologies.
  - *Si* Si APP.state.ontology est null et que la section demandée est un onglet d'édition, alors le contenu est remplacé par le message « No ontology connected ».

- **REQ-ONT-050** — Après connexion ou déconnexion d'une ontologie, l'état global de l'application (classes, propriétés, individus, règles) est rechargé depuis le backend.

- **REQ-ONT-051** — Le préfixe de l'ontologie connectée détermine les labels des racines virtuelles affichés dans les éditeurs (owl:Thing / rdfs:Resource, owl:topObjectProperty / rdf:Property).
  - *Si* Si le préfixe de l'ontologie est « rdf » ou « rdfs », alors les racines sont rdfs:Resource et rdf:Property ; sinon elles sont owl:Thing et owl:topObjectProperty.

---

## 10. Notifications et retours utilisateur

- **REQ-ONT-052** — Toutes les opérations du registre (création, import, chargement, édition, connexion, déconnexion, suppression) donnent lieu à un toast de succès ou d'erreur affiché 3,5 secondes.

- **REQ-ONT-053** — La suppression d'une ontologie du registre est précédée d'une boîte de dialogue de confirmation modale.
  - *Si* Si l'utilisateur clique en dehors de la modale de confirmation, alors l'action est annulée.

- **REQ-ONT-054** — La boîte de dialogue de confirmation de suppression précise que le fichier sur disque ne sera pas supprimé.
