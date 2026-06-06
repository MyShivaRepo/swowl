# Exigences — Onglet « DatatypeProperties »

> Document généré par rétro-engineering du code source SWOWL · version 1.0 · 2026-06-06

---

## 1. Navigation et sélection

- **REQ-DP-001** — Afficher l'onglet en disposition deux colonnes (arbre à gauche, détail à droite) séparées par un diviseur redimensionnable horizontalement
  - *Si* Si l'utilisateur fait glisser le diviseur vertical, alors la largeur du panneau gauche est ajustée entre 160 px et 520 px

- **REQ-DP-002** — Afficher la racine de la hiérarchie (owl:topDataProperty ou rdf:Property selon l'ontologie) en tête de l'arbre, toujours visible et non supprimable
  - *Si* Si la racine ontologique est rdf:Property, alors le nœud racine affiché est 'rdf:Property', sinon c'est 'owl:topDataProperty'

- **REQ-DP-003** — Sélectionner une propriété dans l'arbre en cliquant sur son nœud : la ligne est surlignée et le formulaire de détail s'affiche dans le panneau droit
  - *Si* Si l'utilisateur clique sur un nœud de l'arbre, alors ce nœud reçoit la classe CSS 'selected' et le formulaire correspondant est rendu dans #dp-detail

- **REQ-DP-004** — Sélectionner le nœud racine (owl:topDataProperty) affiche un panneau de détail vide avec un bouton de création de propriété
  - *Si* Si l'utilisateur clique sur le nœud racine, alors le panneau droit affiche le libellé de la racine, un sous-titre 'Root of all Datatype Properties' et le bouton '＋ Create Datatype Property'

- **REQ-DP-005** — Restaurer la sélection précédente à chaque re-rendu de la section (après une sauvegarde ou un rafraîchissement)
  - *Si* Si _topPropSelected est vrai, alors selectTopProp() est rappelé ; sinon si _selectedId est défini, alors selectProp(_selectedId) est rappelé

- **REQ-DP-006** — Afficher un message 'No DatatypeProperty' dans l'arbre lorsque l'ontologie ne contient aucune propriété de données
  - *Si* Si la liste des datatype properties est vide, alors afficher le texte 'No DatatypeProperty' à la place des nœuds

- **REQ-DP-007** — Naviguer directement vers une propriété de données depuis un autre onglet via APP.navigateTo('datatype-properties', id)
  - *Si* Si APP.navigateTo est appelé avec la section 'datatype-properties' et un identifiant, alors les ancêtres sont expansés et la propriété est sélectionnée automatiquement

---

## 2. Arbre hiérarchique

- **REQ-DP-008** — Construire et afficher l'arbre des propriétés en respectant les relations subPropertyOf : les propriétés sans parent sont des racines, les autres sont des enfants
  - *Si* Si une propriété A a subPropertyOf = [B], alors A est affichée comme enfant de B dans l'arbre

- **REQ-DP-009** — Trier les nœuds à chaque niveau de l'arbre par ordre alphabétique insensible à la casse

- **REQ-DP-010** — Afficher un triangle ▶ cliquable pour les nœuds ayant des enfants, et un point ◦ pour les nœuds feuilles
  - *Si* Si un nœud a au moins un enfant, alors afficher le contrôle 'tree-toggle' ; sinon afficher 'tree-leaf'

- **REQ-DP-011** — Plier/déplier les sous-arbres en cliquant sur le triangle ▶ d'un nœud parent (sans changer la sélection courante)
  - *Si* Si le triangle d'un nœud est cliqué, alors l'état expanded du nœud est inversé et l'affichage du conteneur enfant est mis à jour

- **REQ-DP-012** — Indenter visuellement chaque niveau de l'arbre par pas de 16 px

---

## 3. Création et suppression

- **REQ-DP-013** — Créer une propriété enfant de la propriété sélectionnée via le bouton 'Child' de la barre d'outils ou le menu contextuel
  - *Si* Si createChild() est appelé avec une propriété sélectionnée, alors la nouvelle propriété a subPropertyOf = [selectedId] et le parent est expansé dans l'arbre

- **REQ-DP-014** — Créer une propriété sœur (même niveau que la propriété sélectionnée) via le bouton 'Sibling' de la barre d'outils ou le menu contextuel
  - *Si* Si createSibling() est appelé, alors la nouvelle propriété hérite des mêmes parents que la propriété sélectionnée

- **REQ-DP-015** — Générer automatiquement un identifiant unique de la forme 'NewDatatypeProperty', 'NewDatatypeProperty1', etc. lors de la création
  - *Si* Si 'NewDatatypeProperty' existe déjà, alors incrémenter le suffixe numérique jusqu'à trouver un identifiant libre

- **REQ-DP-016** — Désactiver les boutons 'Sibling' et 'Delete' lorsque le nœud racine est sélectionné ; activer uniquement le bouton 'Child'
  - *Si* Si _topPropSelected est vrai, alors btnSister et btnDelete sont disabled et masqués, et btnChild est activé

- **REQ-DP-017** — Demander une confirmation avant de supprimer une propriété, avec affichage de son identifiant dans le message
  - *Si* Si deleteSelected() est appelé, alors afficher UI.confirm('Delete DatatypeProperty <strong>id</strong>?') et n'exécuter la suppression qu'en cas de validation

- **REQ-DP-018** — Après suppression, réinitialiser la sélection (_selectedId = null) et rafraîchir l'affichage complet de la section

- **REQ-DP-019** — Refuser la création si un identifiant identique existe déjà (code HTTP 409 retourné par le backend)
  - *Si* Si POST /api/datatype-properties reçoit un id déjà présent, alors retourner HTTP 409 avec le message 'DatatypeProperty id already exists'

---

## 4. Formulaire de détail (édition)

- **REQ-DP-020** — Afficher et permettre l'édition de l'identifiant local (IRI) de la propriété dans un champ texte avec assainissement en temps réel
  - *Si* Si l'utilisateur modifie le champ #dp-id, alors _sanitizeId() est appelé à chaque frappe pour nettoyer les caractères invalides

- **REQ-DP-021** — Afficher l'IRI complète de la propriété (baseIRI#localName) en lecture seule sous le champ d'identifiant
  - *Si* Si la propriété a un identifiant et que l'ontologie a un IRI de base, alors afficher 'For Property: baseIRI#localName'

- **REQ-DP-022** — Valider l'identifiant côté client : rejeter une valeur vide ou commençant par un chiffre (règle OWL NCName)
  - *Si* Si l'identifiant est vide ou commence par un chiffre, alors afficher une erreur et annuler la sauvegarde

- **REQ-DP-023** — Sauvegarder automatiquement les modifications du formulaire (auto-save) dès qu'un champ change, sans action explicite de l'utilisateur
  - *Si* Si _editingId n'est pas null et qu'un champ du formulaire déclenche onchange, alors autoSave() appelle save(false) immédiatement

- **REQ-DP-024** — Renommer une propriété : si l'identifiant est modifié, propager le changement en cascade dans toutes les références de l'ontologie (subPropertyOf, assertions, règles SWRL)
  - *Si* Si PUT /api/datatype-properties/{old_id} reçoit un nouvel id différent, alors _cascade_rename_property() est appelé pour mettre à jour toutes les références

- **REQ-DP-025** — Gérer les annotations rdfs:label et rdfs:comment : ajout de lignes, édition de la valeur et de la langue, suppression individuelle
  - *Si* Si l'utilisateur clique '+ label' ou '+ comment', alors une nouvelle ligne est ajoutée dans le tableau d'annotations avec la langue par défaut

- **REQ-DP-026** — Permettre l'ajout d'annotations personnalisées (Annotation Property) via un picker dédié affichant les propriétés d'annotation disponibles
  - *Si* Si l'utilisateur clique '+ Annotation Property', alors le picker #dp-anno-picker est affiché/masqué

- **REQ-DP-027** — Gérer le(s) domaine(s) de la propriété : sélectionner une ou plusieurs classes OWL via un menu déroulant, supprimer individuellement chaque entrée
  - *Si* Si aucun domaine n'est défini, alors afficher 'owl:Thing' comme valeur par défaut ; si un domaine est ajouté, alors le marqueur de présence est synchronisé dans les classes concernées

- **REQ-DP-028** — Gérer le type XSD (range) de la propriété : sélectionner un seul type parmi les 12 types XSD supportés via un picker
  - *Si* Si aucun range n'est défini, alors afficher 'rdfs:Literal' comme valeur par défaut ; le bouton '+' du range est masqué dès qu'un type est sélectionné

- **REQ-DP-029** — Afficher le bouton '+' du range à nouveau après suppression du type XSD sélectionné
  - *Si* Si removeRange() est appelé, alors le bouton #dp-range-btn est rendu visible

- **REQ-DP-030** — Gérer la caractéristique 'Functional' via une case à cocher : une propriété fonctionnelle ne peut avoir qu'une seule valeur par individu
  - *Si* Si la case 'Functional' est cochée/décochée, alors le champ functional est mis à jour et auto-save est déclenché

- **REQ-DP-031** — Afficher un encart 'Where Used in Rules' listant toutes les règles SWRL qui référencent la propriété, avec lien de navigation vers chaque règle
  - *Si* Si au moins une règle SWRL référence la propriété dans ses atomes body ou head, alors le cadre 'Where Used in Rules' est affiché avec le nombre de règles et des liens cliquables

---

## 5. Panneau Super Properties

- **REQ-DP-032** — Afficher le panneau 'Super Properties' dans la colonne gauche (en-dessous de l'arbre), séparé par un diviseur vertical redimensionnable
  - *Si* Si l'utilisateur fait glisser le diviseur horizontal entre l'arbre et le panneau Super Properties, alors les hauteurs relatives des deux zones sont ajustées

- **REQ-DP-033** — Afficher la chaîne d'héritage complète jusqu'à owl:topDatatypeProperty pour chaque super-propriété directe, avec indentation progressive
  - *Si* Si la propriété A a pour super-propriété B, et B a pour super-propriété C, alors la liste affiche A (direct), puis B (ancêtre, opacité 0.75), puis owl:topDatatypeProperty (racine, italique, opacité 0.55)

- **REQ-DP-034** — Ajouter une super-propriété via le bouton '+' du panneau Super Properties : ouvre un picker listant les propriétés disponibles (en excluant la propriété elle-même et celles déjà sélectionnées)
  - *Si* Si une super-propriété est sélectionnée dans le picker, alors addSubProp(id) est appelé et auto-save est déclenché

- **REQ-DP-035** — Supprimer une super-propriété directe via le bouton ✕ affiché à côté de son nom dans le panneau
  - *Si* Si le bouton ✕ d'une super-propriété est cliqué, alors removeSubProp(id) est appelé et auto-save est déclenché

- **REQ-DP-036** — Permettre la navigation vers une super-propriété ancêtre en cliquant sur son libellé dans le panneau
  - *Si* Si l'utilisateur clique sur le libellé d'un ancêtre, alors APP.navigateTo('datatype-properties', id) est appelé

- **REQ-DP-037** — Afficher 'select a property' dans le panneau Super Properties lorsqu'aucune propriété n'est sélectionnée

---

## 6. Drag & Drop

- **REQ-DP-038** — Permettre le déplacement d'une propriété dans la hiérarchie par glisser-déposer sur un nœud cible de l'arbre
  - *Si* Si une propriété est déposée sur un nœud cible, alors sa liste subPropertyOf est remplacée par [targetId] et la modification est sauvegardée via PUT /api/datatype-properties/{id}

- **REQ-DP-039** — Empêcher le dépôt d'une propriété sur l'un de ses propres descendants pour éviter les cycles dans la hiérarchie
  - *Si* Si la cible du dépôt est un descendant de la propriété glissée, alors afficher UI.warn('Cannot drop on a descendant — would create a cycle') et annuler l'opération

- **REQ-DP-040** — Empêcher le dépôt d'une propriété sur elle-même
  - *Si* Si dragId === targetId, alors l'opération de dépôt est ignorée

- **REQ-DP-041** — Déposer une propriété sur le nœud racine la déplace au niveau racine (supprime tous ses parents)
  - *Si* Si la propriété est déposée sur owl:topDataProperty (targetId = null), alors subPropertyOf est mis à []

- **REQ-DP-042** — Appliquer des styles visuels pendant le drag : classe 'dragging' sur l'élément glissé, classe 'drag-over' sur la cible survolée
  - *Si* Si le drag commence, alors 'dragging' est ajouté avec un setTimeout(0) ; si le curseur survole une cible valide, alors 'drag-over' est ajouté à cette cible

- **REQ-DP-043** — Nettoyer tous les styles de drag à la fin de l'opération (onDragEnd)
  - *Si* Si l'événement dragend se produit, alors la classe 'dragging' est retirée de l'élément source et 'drag-over' est retiré de tous les éléments

---

## 7. Menu contextuel

- **REQ-DP-044** — Afficher un menu contextuel au clic droit sur un nœud de l'arbre avec les actions : 'Add Child Property', 'Add Sibling Property', 'Delete'
  - *Si* Si le clic droit cible un nœud de propriété (non racine), alors le menu contextuel contient les trois options ; si la cible est le nœud racine, alors seule 'Add Child Property' est disponible

- **REQ-DP-045** — Positionner le menu contextuel à la position du curseur en l'ajustant automatiquement pour ne pas déborder de la fenêtre
  - *Si* Si le menu dépasse le bord droit ou bas de la fenêtre, alors sa position est recalculée pour le maintenir visible

- **REQ-DP-046** — Fermer le menu contextuel automatiquement lors d'un clic en dehors de celui-ci
  - *Si* Si un clic se produit en dehors du menu #dp-ctx-menu, alors _closeContextMenu() est appelé et l'écouteur d'événement est supprimé

---

## 8. Interactions backend (API REST)

- **REQ-DP-047** — Lister toutes les propriétés de données via GET /api/datatype-properties au chargement de l'onglet

- **REQ-DP-048** — Créer une propriété de données via POST /api/datatype-properties avec le modèle complet (id, annotations, domain, range, subPropertyOf, functional)
  - *Si* Si la création réussit (HTTP 201), alors UI.success affiche 'DatatypeProperty id created' et la section est rafraîchie

- **REQ-DP-049** — Mettre à jour une propriété de données via PUT /api/datatype-properties/{prop_id} avec le modèle complet mis à jour
  - *Si* Si l'id a changé lors de la mise à jour, alors UI.success affiche 'Property renamed → newId'

- **REQ-DP-050** — Supprimer une propriété de données via DELETE /api/datatype-properties/{prop_id}
  - *Si* Si la suppression réussit, alors UI.success affiche 'DatatypeProperty id deleted'

- **REQ-DP-051** — Synchroniser les marqueurs de présence de propriété dans les classes (PropertyPresence) lors de tout changement de domaine (création, mise à jour, suppression)
  - *Si* Si le domaine d'une propriété change, alors _sync_domain_markers() ajoute ou retire les marqueurs dans les classes concernées

- **REQ-DP-052** — Valider l'identifiant côté backend (règle OWL NCName) : rejeter tout id vide ou commençant par un chiffre avec HTTP 422
  - *Si* Si _validate_ncname() détecte un id invalide, alors HTTP 422 est retourné avec un message explicatif

- **REQ-DP-053** — Afficher un message d'erreur via UI.error() si une opération backend échoue (réseau, 409, 422, 404)
  - *Si* Si l'appel API lève une exception, alors UI.error(e.message) est appelé et aucune mise à jour d'état local n'est effectuée

---

## 9. Types XSD supportés

- **REQ-DP-054** — Proposer exactement 12 types XSD dans le picker de range : xsd:string, xsd:integer, xsd:decimal, xsd:float, xsd:double, xsd:boolean, xsd:date, xsd:dateTime, xsd:duration, xsd:anyURI, xsd:nonNegativeInteger, xsd:positiveInteger
  - *Si* Si un type est déjà sélectionné comme range, alors il n'apparaît plus dans le picker

- **REQ-DP-055** — Limiter le range à une seule valeur XSD : le bouton '+' est masqué après sélection d'un premier type
  - *Si* Si #dp-range-list contient déjà un item avec data-id, alors showPicker('dp-range-picker') ne fait rien

---

## 10. Intégration avec d'autres onglets

- **REQ-DP-056** — Permettre la création rapide d'une propriété de données avec un domaine pré-rempli depuis l'onglet Classes (bouton dédié sur une classe)
  - *Si* Si l'utilisateur clique sur 'Create DatatypeProperty with domain = className' depuis l'onglet Classes, alors DPEditor._selectedId et _editingId sont pré-initialisés et la section datatype-properties est rendue

- **REQ-DP-057** — Permettre la navigation depuis la vue Classes vers une propriété de données existante en cliquant sur son nom dans la liste des propriétés de la classe
  - *Si* Si une propriété dans la vue Classes est une DatatypeProperty (identifiée par APP.state.datatype_properties), alors le clic navigue vers l'onglet 'datatype-properties' et sélectionne la propriété

- **REQ-DP-058** — Permettre la navigation depuis le panneau Super Properties vers une propriété ancêtre en cliquant sur son libellé, sans quitter l'onglet DatatypeProperties
  - *Si* Si l'utilisateur clique sur un libellé d'ancêtre dans le panneau Super Properties, alors APP.navigateTo('datatype-properties', id) est appelé
