# Exigences — Onglet « ObjectProperties »

> Document généré par rétro-engineering du code source SWOWL · version 1.0 · 2026-06-06

---

## 1. Navigation et sélection dans l'arbre

- **REQ-OP-001** — Afficher les propriétés objet sous forme d'arbre hiérarchique dans le panneau gauche
  - *Si* Si l'onglet ObjectProperties est affiché, alors l'arbre est construit à partir des relations subPropertyOf présentes dans l'état applicatif

- **REQ-OP-002** — Trier les nœuds de l'arbre par ordre alphabétique insensible à la casse
  - *Si* Si plusieurs propriétés sont au même niveau, alors elles sont triées alphabétiquement (localeCompare, sensitivity base)

- **REQ-OP-003** — Afficher le nœud racine owl:topObjectProperty en tête de l'arbre, toujours ouvert
  - *Si* Si l'onglet est rendu, alors la racine affiche le label issu de APP.getOntologyRootLabels().propRoot

- **REQ-OP-004** — Sélectionner une propriété en cliquant sur son nœud dans l'arbre
  - *Si* Si l'utilisateur clique sur un nœud, alors ce nœud reçoit la classe CSS 'selected', le panneau de détail est mis à jour et le panneau Super Properties est rafraîchi

- **REQ-OP-005** — Sélectionner le nœud racine owl:topObjectProperty en cliquant dessus
  - *Si* Si l'utilisateur clique sur la racine, alors _topPropSelected passe à true, _selectedId à null, et le panneau de détail affiche un message d'invite avec le bouton de création

- **REQ-OP-006** — Conserver la sélection et l'état des nœuds ouverts après un rechargement de la section
  - *Si* Si la section est rechargée (restoreSelection), alors la propriété précédemment sélectionnée est re-sélectionnée et les ancêtres sont développés

- **REQ-OP-007** — Développer ou réduire un nœud ayant des enfants en cliquant sur le triangle toggle
  - *Si* Si le nœud est ouvert et que l'utilisateur clique sur ▶, alors le sous-arbre se masque et la classe 'open' est retirée du toggle ; et inversement

- **REQ-OP-008** — Afficher un indicateur feuille (◦) pour les nœuds sans enfants
  - *Si* Si un nœud n'a aucun enfant dans childrenOf, alors un symbole ◦ est affiché à la place du toggle

- **REQ-OP-009** — Naviguer vers une propriété depuis un autre onglet via APP.navigateTo
  - *Si* Si APP.navigateTo('object-properties', id) est appelé, alors la propriété cible est sélectionnée et ses ancêtres sont développés (_expandAncestors)

- **REQ-OP-010** — Afficher un tag ↔ sur le nœud si la propriété possède une inverse déclarée
  - *Si* Si prop.inverseOf est non nul, alors un badge 'op-inverse-tag' affichant '↔ {inverseOf}' est ajouté au label du nœud dans l'arbre

---

## 2. Création de propriétés

- **REQ-OP-011** — Créer une propriété enfant de la propriété sélectionnée via le bouton 'Child'
  - *Si* Si l'utilisateur clique sur 'Child', alors une nouvelle propriété est créée avec subPropertyOf contenant l'identifiant de la propriété sélectionnée (ou vide si la racine est sélectionnée)

- **REQ-OP-012** — Créer une propriété sœur au même niveau que la propriété sélectionnée via le bouton 'Sibling'
  - *Si* Si l'utilisateur clique sur 'Sibling', alors une nouvelle propriété est créée avec les mêmes parents (subPropertyOf) que la propriété sélectionnée

- **REQ-OP-013** — Générer automatiquement un identifiant unique de la forme 'NewObjectProperty' ou 'NewObjectPropertyN'
  - *Si* Si le nom 'NewObjectProperty' existe déjà, alors un suffixe entier incrémental est ajouté jusqu'à obtenir un identifiant libre

- **REQ-OP-014** — Appeler POST /api/object-properties pour persister la nouvelle propriété
  - *Si* Si la création échoue avec HTTP 409, alors une erreur est affichée indiquant que l'identifiant existe déjà

- **REQ-OP-015** — Valider que l'identifiant est un NCName valide avant la création ou la mise à jour
  - *Si* Si l'identifiant ne passe pas la validation NCName côté backend (_validate_ncname), alors une HTTPException 400 est levée

- **REQ-OP-016** — Ouvrir automatiquement le formulaire d'édition en mode 'nouveau' après la création
  - *Si* Si la propriété est créée avec succès, alors _editingId est positionné sur le nouvel identifiant et la section est rechargée avec la propriété sélectionnée

---

## 3. Edition du formulaire de détail

- **REQ-OP-017** — Afficher le formulaire Protégé-style dans le panneau droit lors de la sélection d'une propriété
  - *Si* Si une propriété est sélectionnée, alors le panneau de détail affiche l'ID, l'IRI complète, les annotations, le domaine, la portée, l'inverse et les caractéristiques

- **REQ-OP-018** — Afficher l'IRI complète de la propriété en en-tête du formulaire (baseIRI#localId)
  - *Si* Si la propriété possède un identifiant et que l'ontologie possède un IRI de base, alors l'IRI complète est affichée sous la forme baseIRI#localId

- **REQ-OP-019** — Sanitiser les caractères invalides dans le champ ID en temps réel (oninput)
  - *Si* Si l'utilisateur saisit un caractère non autorisé dans le champ ID, alors _sanitizeId est appelé pour le remplacer

- **REQ-OP-020** — Sauvegarder automatiquement le formulaire à chaque modification d'un champ (autoSave / onchange)
  - *Si* Si _editingId est non nul et qu'un champ change, alors OPEditor.autoSave() appelle save(false) et PUT /api/object-properties/{id}

- **REQ-OP-021** — Sauvegarder une nouvelle propriété lors de la perte de focus sur le champ ID (onblur)
  - *Si* Si la propriété est nouvelle (isNew=true) et que le champ ID perd le focus avec une valeur non vide, alors save(true) est appelé et POST /api/object-properties est émis

- **REQ-OP-022** — Renommer la propriété lors d'une modification de l'identifiant et cascader le renommage
  - *Si* Si l'ID soumis diffère de l'ID original, alors le backend exécute _cascade_rename_property pour mettre à jour toutes les références (subPropertyOf, inverseOf, etc.)

- **REQ-OP-023** — Gérer les annotations rdfs:label, rdfs:comment et les annotations personnalisées
  - *Si* Si l'utilisateur clique sur '+ label' ou '+ comment', alors une nouvelle ligne est ajoutée dans la table des annotations avec valeur et langue par défaut

- **REQ-OP-024** — Ajouter des annotations personnalisées via un sélecteur de propriétés d'annotation (picker)
  - *Si* Si l'utilisateur clique sur '+ Annotation Property', alors un picker listant les annotation properties disponibles est affiché/masqué

- **REQ-OP-025** — Supprimer une ligne d'annotation via le bouton ✕ de la ligne
  - *Si* Si l'utilisateur clique sur ✕ d'une annotation, alors la ligne est supprimée du DOM et autoSave est déclenché

- **REQ-OP-026** — Gérer le domaine de la propriété : ajouter et supprimer des classes OWL via un picker d'arbre de classes
  - *Si* Si aucun domaine n'est défini, alors 'owl:Thing' est affiché comme valeur implicite ; si l'utilisateur ajoute une classe, elle est ajoutée à la liste et autoSave est déclenché

- **REQ-OP-027** — Gérer la portée (range) de la propriété : ajouter et supprimer des classes OWL via un picker d'arbre de classes
  - *Si* Si aucune portée n'est définie, alors 'owl:Thing' est affiché comme valeur implicite ; si l'utilisateur ajoute une classe, elle est ajoutée à la liste et autoSave est déclenché

- **REQ-OP-028** — Synchroniser les marqueurs de domaine sur les classes OWL lors de la création, mise à jour et suppression
  - *Si* Si le domaine d'une propriété est modifié, alors _sync_domain_markers est appelé côté backend pour mettre à jour les classes ajoutées et retirées

---

## 4. Gestion de la relation inverse (inverseOf)

- **REQ-OP-029** — Définir la propriété inverse via un picker filtrant les propriétés déjà inverses d'une autre
  - *Si* Si l'utilisateur ouvre le picker inverse, alors les propriétés qui ont déjà une relation inverseOf vers une propriété tierce sont exclues de la liste proposée

- **REQ-OP-030** — Autoriser une seule propriété inverse (unicité) : le bouton + est masqué une fois l'inverse défini
  - *Si* Si op-inverse-value contient une valeur non vide, alors le bouton d'ajout d'inverse est masqué et le picker ne s'ouvre pas

- **REQ-OP-031** — Maintenir la symétrie owl:inverseOf côté backend lors de la création, mise à jour et suppression
  - *Si* Si la propriété A déclare inverseOf = B, alors le backend positionne automatiquement B.inverseOf = A ; et si A est supprimée, B.inverseOf est remis à None

- **REQ-OP-032** — Afficher les inverses inférées par le moteur d'inférence sous la section Inverse Of
  - *Si* Si le moteur d'inférence retourne des inferred_inverse_properties pour la propriété sélectionnée, alors des badges '⊢ inverse of X' sont affichés avec le motif d'inférence en tooltip

- **REQ-OP-033** — Permettre la navigation vers la propriété inverse en cliquant sur son label dans le formulaire
  - *Si* Si l'utilisateur clique sur le label de la propriété inverse dans le panneau de détail, alors APP.navigateTo('object-properties', inverseId) est appelé

---

## 5. Caractéristiques OWL de la propriété

- **REQ-OP-034** — Afficher et éditer les 7 caractéristiques OWL via des cases à cocher : Functional, InverseFunctional, Transitive, Symmetric, Asymmetric, Reflexive, Irreflexive
  - *Si* Si l'utilisateur coche ou décoche une caractéristique, alors autoSave est déclenché et la propriété est mise à jour via PUT /api/object-properties/{id}

- **REQ-OP-035** — Persister les caractéristiques dans le champ 'characteristics' (objet clé/booléen) de OWLObjectProperty

---

## 6. Super Properties (panneau gauche bas)

- **REQ-OP-036** — Afficher le panneau 'Super Properties' dans la colonne gauche basse, lié à la propriété sélectionnée
  - *Si* Si aucune propriété n'est sélectionnée, alors le panneau affiche '— select a property —' ; sinon il liste les super-propriétés de la sélection

- **REQ-OP-037** — Afficher la chaîne d'ascendance complète de chaque super-propriété jusqu'à owl:topObjectProperty
  - *Si* Si la super-propriété P1 a elle-même un parent P2, alors P2 est affiché en dessous de P1 avec une indentation croissante et une opacité réduite

- **REQ-OP-038** — Ajouter une super-propriété via un picker arborescent dans le panneau Super Properties
  - *Si* Si l'utilisateur sélectionne une propriété dans le picker, alors elle est ajoutée à subPropertyOf et autoSave est déclenché

- **REQ-OP-039** — Supprimer une super-propriété directe via le bouton ✕ sur sa ligne dans le panneau
  - *Si* Si l'utilisateur clique sur ✕ d'une super-propriété directe, alors celle-ci est retirée de subPropertyOf et autoSave est déclenché

- **REQ-OP-040** — Naviguer vers une super-propriété en cliquant sur son label dans le panneau
  - *Si* Si l'utilisateur clique sur le label d'une super-propriété (directe ou ancêtre), alors APP.navigateTo('object-properties', id) est appelé

- **REQ-OP-041** — Naviguer vers owl:topObjectProperty en cliquant sur son entrée dans le panneau Super Properties
  - *Si* Si l'utilisateur clique sur l'entrée owl:topObjectProperty dans le panneau, alors OPEditor.selectTopProp() est appelé

---

## 7. Drag & Drop pour réorganiser la hiérarchie

- **REQ-OP-042** — Permettre le déplacement d'une propriété par glisser-déposer vers un autre nœud de l'arbre
  - *Si* Si l'utilisateur dépose la propriété A sur la propriété B, alors subPropertyOf de A est remplacé par [B] et PUT /api/object-properties/A est appelé

- **REQ-OP-043** — Permettre le déplacement vers la racine owl:topObjectProperty (subPropertyOf vide)
  - *Si* Si l'utilisateur dépose une propriété sur le nœud racine, alors subPropertyOf de la propriété est réinitialisé à []

- **REQ-OP-044** — Interdire le dépôt sur un descendant pour éviter les cycles
  - *Si* Si la cible du drop est un descendant de la propriété déplacée, alors l'opération est annulée et un avertissement 'Cannot drop on a descendant' est affiché

- **REQ-OP-045** — Appliquer les styles visuels de retour pendant le drag (classe 'dragging' sur la source, 'drag-over' sur la cible)
  - *Si* Si le drag commence, alors la classe 'dragging' est ajoutée à la source ; si le curseur survole une cible valide, 'drag-over' est ajoutée à la cible et retirée au départ

---

## 8. Suppression de propriété

- **REQ-OP-046** — Supprimer la propriété sélectionnée via le bouton Delete de la barre d'actions
  - *Si* Si l'utilisateur clique sur Delete et confirme la boîte de dialogue modale, alors DELETE /api/object-properties/{id} est appelé et la sélection est réinitialisée

- **REQ-OP-047** — Demander une confirmation explicite avant toute suppression
  - *Si* Si l'utilisateur déclenche la suppression, alors UI.confirm affiche 'Delete ObjectProperty <strong>{id}</strong>?' ; si l'utilisateur annule, aucune action n'est effectuée

- **REQ-OP-048** — Supprimer la symétrie inverseOf côté backend lors de la suppression d'une propriété ayant un inverse
  - *Si* Si la propriété supprimée possède inverseOf = B et que B.inverseOf = A, alors B.inverseOf est mis à None avant la suppression de A

---

## 9. Menu contextuel et boutons d'action

- **REQ-OP-049** — Afficher un menu contextuel au clic droit sur un nœud de l'arbre
  - *Si* Si l'utilisateur fait un clic droit sur un nœud, alors un menu contextuel apparaît avec les options 'Add Child Property', 'Add Sibling Property' et 'Delete' (les deux dernières absentes pour la racine)

- **REQ-OP-050** — Positionner le menu contextuel en évitant le dépassement des bords de la fenêtre
  - *Si* Si le menu dépasse le bord droit ou bas de la fenêtre, alors ses coordonnées sont ajustées pour rester dans la zone visible

- **REQ-OP-051** — Fermer le menu contextuel au clic en dehors de celui-ci
  - *Si* Si un clic est détecté hors du menu contextuel, alors celui-ci est supprimé du DOM

- **REQ-OP-052** — Activer/désactiver les boutons 'Child', 'Sibling' et 'Delete' selon le contexte de sélection
  - *Si* Si la racine est sélectionnée, alors seul 'Child' est actif ; si une propriété est sélectionnée, les trois boutons sont actifs ; si rien n'est sélectionné, tous sont désactivés

---

## 10. Mise en page et redimensionnement

- **REQ-OP-053** — Permettre le redimensionnement horizontal du panneau gauche via un séparateur glissable (split handle)
  - *Si* Si l'utilisateur fait glisser le séparateur vertical, alors la largeur du panneau gauche est ajustée entre 160 px et 520 px

- **REQ-OP-054** — Permettre le redimensionnement vertical de la zone arbre / Super Properties dans la colonne gauche
  - *Si* Si l'utilisateur fait glisser le séparateur horizontal interne (h-resizer), alors la hauteur relative des deux sous-panneaux est modifiée

- **REQ-OP-055** — Permettre le redimensionnement vertical des sections du formulaire de détail via des séparateurs internes
  - *Si* Si la propriété est sélectionnée et que le formulaire est affiché, alors _initHResizers('op-detail') est appelé pour activer les séparateurs verticaux du panneau droit

- **REQ-OP-056** — Afficher un état vide avec un bouton de création lorsqu'aucune propriété n'est sélectionnée
  - *Si* Si ni la racine ni une propriété n'est sélectionnée, alors le panneau droit affiche 'Select an existing Object Property or create a new one' avec un bouton '＋ Create Object Property'

---

## 11. Interactions backend (API REST)

- **REQ-OP-057** — Lister toutes les propriétés objet via GET /api/object-properties au chargement de l'onglet

- **REQ-OP-058** — Retourner HTTP 404 si une propriété inexistante est accédée, mise à jour ou supprimée
  - *Si* Si prop_id ne correspond à aucune propriété dans onto.object_properties, alors HTTPException 404 est levée

- **REQ-OP-059** — Retourner HTTP 409 si un identifiant en doublon est soumis lors de la création ou du renommage
  - *Si* Si prop.id existe déjà pour un autre enregistrement, alors HTTPException 409 est levée

- **REQ-OP-060** — Persister l'état de l'ontologie sur disque après chaque opération de création, mise à jour ou suppression
  - *Si* Si une opération d'écriture réussit, alors store.save() est appelé côté backend

- **REQ-OP-061** — Afficher un message de succès (UI.success) ou d'erreur (UI.error) selon le résultat des appels API
  - *Si* Si l'API retourne une erreur, alors UI.error(e.message) est appelé ; si l'opération réussit, un toast de succès est affiché

---

## 12. Utilisation dans les règles SWRL (Where Used)

- **REQ-OP-062** — Afficher un cadre 'Where Used' en bas du formulaire listant les règles SWRL qui référencent la propriété
  - *Si* Si des règles SWRL utilisent la propriété sélectionnée (_ruleUsesProperty), alors elles sont listées dans le cadre _whereUsedFrame
