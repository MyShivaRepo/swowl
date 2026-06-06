# Exigences — Onglet « Individuals »

> Document généré par rétro-engineering du code source SWOWL · version 1.0 · 2026-06-06

---

## 1. Disposition et navigation (3 colonnes)

- **REQ-IND-001** — L'onglet affiche une disposition en 3 colonnes redimensionnables : arbre des classes (col. 1), liste des individus (col. 2), formulaire de détail (col. 3).
  - *Si* Si l'onglet Individuals est ouvert Alors les 3 panneaux sont rendus simultanément dans un conteneur section-split.

- **REQ-IND-002** — Les deux séparateurs de colonnes sont déplaçables à la souris pour ajuster la largeur de chaque panneau.
  - *Si* Si l'utilisateur fait glisser un séparateur Alors la largeur du panneau adjacent est recalculée entre un minimum et un maximum définis (120–520 px pour col. 1, 100–400 px pour col. 2).

- **REQ-IND-003** — La colonne 1 affiche l'arborescence des classes OWL avec owl:Thing comme racine universelle et un compteur d'individus par nœud.
  - *Si* Si une classe possède des individus (directs ou hérités) Alors son compteur s'affiche à droite de son étiquette.

- **REQ-IND-004** — Le compteur d'individus d'un nœud de classe est transitif : il inclut les individus de toutes les sous-classes.

- **REQ-IND-005** — La sélection d'une classe filtre la liste d'individus (col. 2) de façon transitive et met à jour le titre de la colonne 2.
  - *Si* Si l'utilisateur clique sur une classe Alors la liste affiche uniquement les individus dont le type appartient à cette classe ou à l'une de ses sous-classes.

- **REQ-IND-006** — La sélection de owl:Thing affiche tous les individus sans filtrage.
  - *Si* Si owl:Thing est sélectionné Alors tous les individus de l'ontologie sont listés.

- **REQ-IND-007** — La liste des individus (col. 2) est triée alphabétiquement selon le label d'affichage résolu, ou par ID si aucun label.

- **REQ-IND-008** — La sélection et la classe choisies sont restaurées après un rafraîchissement de l'application.
  - *Si* Si APP.refresh() est appelé Alors IndividualEditor.restoreSelection() rétablit le surlignage de la classe et de l'individu sélectionnés.

---

## 2. Création d'un individu

- **REQ-IND-009** — Un bouton ➕ dans l'en-tête de la colonne 2 ouvre un formulaire vierge de création d'individu en colonne 3.
  - *Si* Si l'utilisateur clique sur ➕ Alors un placeholder ghost est inséré en tête de liste et le formulaire vierge s'affiche en col. 3.

- **REQ-IND-010** — À l'ouverture du formulaire de création, un identifiant est pré-généré selon la règle Settings.generateIndividualId et le champ est automatiquement focalisé et sélectionné.
  - *Si* Si le formulaire de création s'affiche Alors l'input ind-id est focalisé et son contenu sélectionné dans les 30 ms.

- **REQ-IND-011** — La sauvegarde d'un nouvel individu est déclenchée automatiquement lors de la perte de focus du champ ID, si le champ n'est pas vide.
  - *Si* Si l'utilisateur quitte le champ ind-id (onblur) et que la valeur n'est pas vide Alors IndividualEditor.save(true) est appelé.

- **REQ-IND-012** — L'identifiant est validé côté client (règle NCName) avant envoi ; les espaces sont convertis en underscores côté frontend et backend.
  - *Si* Si l'ID contient des espaces Alors ils sont remplacés par '_' avant la requête POST/PUT.

- **REQ-IND-013** — Si un individu du même ID existe déjà, le backend retourne HTTP 409 et un message d'erreur est affiché.
  - *Si* Si POST /api/individuals reçoit un ID déjà existant Alors HTTP 409 est retourné avec un message explicite.

- **REQ-IND-014** — Un bouton Cancel sur le formulaire de création annule la saisie et réinitialise col. 3 à l'état vide.
  - *Si* Si l'utilisateur clique Cancel Alors le placeholder ghost est supprimé, la sélection est effacée et col. 3 affiche l'écran d'accueil.

- **REQ-IND-015** — Si une classe est sélectionnée au moment de la création, elle est pré-remplie dans le champ Types du formulaire.
  - *Si* Si _selectedClassId est non nul lors de l'appel à newIndividual() Alors types: [selectedClassId] est inclus dans l'objet de création.

---

## 3. Édition et auto-sauvegarde

- **REQ-IND-016** — La sélection d'un individu existant charge son formulaire de détail en col. 3 avec toutes ses données.

- **REQ-IND-017** — Toute modification d'un champ du formulaire déclenche une auto-sauvegarde immédiate (onchange → autoSave → PUT /api/individuals/{id}).
  - *Si* Si _editingId est non nul et qu'un champ change Alors autoSave() appelle save(false) sans confirmation de l'utilisateur.

- **REQ-IND-018** — Le renommage d'un individu (modification de l'ID) met à jour toutes les références dans les autres individus (objectAssertions, sameAs, differentFrom) côté backend.
  - *Si* Si l'ID d'un individu change via PUT /api/individuals/{ind_id} Alors toutes les occurrences de l'ancien ID dans les autres individus sont remplacées par le nouvel ID.

- **REQ-IND-019** — Le formulaire d'édition affiche l'IRI complète de l'individu (baseIri#localId) à titre informatif.
  - *Si* Si l'ontologie possède un ID de base Alors l'IRI complète est affichée sous l'en-tête du formulaire.

- **REQ-IND-020** — L'utilisateur peut ajouter, modifier ou supprimer des annotations rdfs:label, rdfs:comment et des propriétés d'annotation personnalisées.
  - *Si* Si une ligne d'annotation est ajoutée ou supprimée sur un individu existant Alors autoSave() est déclenché.

- **REQ-IND-021** — L'utilisateur peut ajouter ou retirer des types (rdf:type) depuis un sélecteur de classes intégré au formulaire.
  - *Si* Si un type est ajouté ou retiré sur un individu existant Alors autoSave() est déclenché.

- **REQ-IND-022** — Le formulaire affiche dynamiquement des panneaux de propriétés (ObjectProperty et DatatypeProperty) dérivés des types de l'individu, séparés en propriétés héritées et propriétés directes.
  - *Si* Si l'individu possède des types Alors les propriétés sont collectées via _getClassProperties et rendues dans l'ordre : héritées d'abord (par profondeur croissante puis alpha), directes ensuite.

- **REQ-IND-023** — Pour une propriété fonctionnelle (functional), le bouton ➕ d'ajout de valeur est masqué dès qu'une valeur est présente.
  - *Si* Si data-single='true' et qu'au moins une ligne ind-prop-row existe Alors le bouton ind-prop-add-{safeId} est masqué.

- **REQ-IND-024** — Pour les valeurs de DataProperty, si la valeur commence par http:// ou https://, un bouton de lien cliquable est affiché à côté du champ.
  - *Si* Si la valeur d'un DataProperty est une URL HTTP(S) Alors une icône 🔗 avec target='_blank' est affichée.

- **REQ-IND-025** — Les panneaux de propriétés dans le formulaire sont redimensionnables verticalement via des séparateurs h-resizer.

- **REQ-IND-026** — Le formulaire affiche un bloc 'Où est utilisé' (whereUsed) montrant les règles SWRL qui référencent cet individu.
  - *Si* Si l'individu est référencé dans des règles SWRL Alors _whereUsedFrame() retourne un panneau listant ces règles.

---

## 4. Suppression

- **REQ-IND-027** — La suppression d'un individu nécessite une confirmation via une boîte de dialogue avant d'envoyer DELETE /api/individuals/{id}.
  - *Si* Si l'utilisateur clique sur le bouton de suppression Alors UI.confirm() est affiché ; la suppression n'a lieu que si confirmée.

- **REQ-IND-028** — La suppression d'un individu supprime automatiquement les assertions inverses (owl:inverseOf) qui pointaient vers lui dans les autres individus.
  - *Si* Si DELETE /api/individuals/{id} est appelé Alors _sync_inverse_assertions() retire toutes les ObjectPropertyAssertions inverses liées à cet individu.

- **REQ-IND-029** — La suppression multi-sélection supprime séquentiellement tous les individus sélectionnés en une seule confirmation.
  - *Si* Si N individus sont sélectionnés et que l'utilisateur confirme Alors chaque individu est supprimé via API.deleteIndividual() dans une boucle for…of.

- **REQ-IND-030** — Après suppression, les colonnes 1, 2 et 3 sont actualisées et le bouton de suppression est désactivé.

---

## 5. Sélection et multi-sélection

- **REQ-IND-031** — Un clic simple sur un individu le sélectionne, charge son formulaire en col. 3 et définit l'ancre Shift+Click.

- **REQ-IND-032** — Un Shift+Click sélectionne une plage d'individus entre l'ancre et l'élément cliqué.
  - *Si* Si isShift=true et qu'une ancre existe Alors tous les items entre l'ancre et la cible sont ajoutés à _selectedIndIds.

- **REQ-IND-033** — Lorsque plusieurs individus sont sélectionnés, col. 3 affiche un résumé avec le nombre d'éléments sélectionnés et un bouton 'Delete all selected'.
  - *Si* Si _selectedIndIds.size > 1 Alors le panneau de détail affiche un résumé multi-sélection au lieu du formulaire.

- **REQ-IND-034** — Le bouton de suppression (icône poubelle) dans l'en-tête col. 2 est activé uniquement quand au moins un individu est sélectionné.
  - *Si* Si _selectedIndIds est vide Alors ind-del-btn est disabled ; sinon il est enabled.

---

## 6. Drag & Drop

- **REQ-IND-035** — Chaque individu de la liste est draggable vers un nœud de classe dans la col. 1 pour changer son type.
  - *Si* Si l'utilisateur dépose un individu sur une classe Alors son type est mis à jour via PUT /api/individuals/{id}.

- **REQ-IND-036** — Pendant le glisser, l'opacité de l'élément source est réduite à 0.5 ; la cible de dépôt est surlignée avec un fond bleu et un contour.
  - *Si* Si ondragover est déclenché sur une classe Alors background et outline de la cible sont appliqués ; ils sont retirés sur ondragleave.

- **REQ-IND-037** — Lors du dépôt, si l'individu avait un type correspondant à la classe source (filtre actif), ce type est remplacé par la classe cible ; s'il n'avait qu'un seul type, ce type est remplacé ; sinon la classe cible est ajoutée.
  - *Si* Si srcClass et (ind.types inclut srcClass) Alors types = types.map(t => t===srcClass ? targetClassId : t) ; sinon si types.length===1 Alors types=[targetClassId] ; sinon types=union(types, [targetClassId]).

- **REQ-IND-038** — Le drag & drop est désactivé vers owl:Thing (pas d'attributs ondragover/ondrop sur ce nœud).
  - *Si* Si la cible est owl:Thing Alors dropAttrs() retourne une chaîne vide et aucun dépôt n'est traité.

---

## 7. Picker de ressource (ObjectProperty)

- **REQ-IND-039** — L'ajout d'une valeur pour une ObjectProperty ouvre une modale 'Select Resource' à 2 colonnes (arbre de classes / liste d'individus).
  - *Si* Si l'utilisateur clique ➕ sur un panneau ObjectProperty Alors IndividualEditor.openPicker() est appelé et la modale est injectée dans le DOM.

- **REQ-IND-040** — Le picker filtre les classes affichées selon le range effectif de la propriété (range déclaré + fillers de restrictions) ; si aucun range, toutes les classes sont affichées.
  - *Si* Si effectiveRange est vide Alors toutes les classes de l'ontologie sont accessibles dans le picker.

- **REQ-IND-041** — Si le range ne comprend qu'une seule classe, cette classe est pré-sélectionnée automatiquement dans le picker.
  - *Si* Si effectiveRange.length === 1 Alors pickerSelectClass(effectiveRange[0]) est appelé à l'ouverture.

- **REQ-IND-042** — Un double-clic sur un individu dans le picker confirme directement la sélection (équivalent OK).
  - *Si* Si ondblclick est déclenché sur un item du picker Alors pickerSelectInd() puis confirmPicker() sont appelés en séquence.

- **REQ-IND-043** — Le picker propose un bouton '＋ New' pour créer un nouvel individu directement dans la modale sans la fermer.
  - *Si* Si l'utilisateur clique '＋ New' dans le picker Alors un champ inline apparaît en tête de liste ; la confirmation (✓ ou Enter) crée l'individu via POST et l'auto-sélectionne.

- **REQ-IND-044** — Dans le picker de création rapide, la touche Escape annule la saisie et la touche Enter confirme.
  - *Si* Si key==='Escape' Alors la ligne ind-picker-new-row est supprimée ; si key==='Enter' Alors _pickerConfirmNew() est appelé.

- **REQ-IND-045** — Un clic sur l'étiquette d'une ObjectProperty existante dans le formulaire navigue vers la fiche de l'individu cible (APP.navigateTo).
  - *Si* Si l'utilisateur clique sur ind-op-label Alors APP.navigateTo('individuals', target) est appelé.

- **REQ-IND-046** — Un clic sur le nom d'une propriété (ObjectProperty ou DatatypeProperty) dans l'en-tête du panneau navigue vers la définition de cette propriété.
  - *Si* Si l'utilisateur clique sur cls-frame-tag Alors APP.navigateTo('object-properties' ou 'datatype-properties', propId) est appelé.

---

## 8. Propagation des assertions inverses (backend)

- **REQ-IND-047** — Lors de la création ou mise à jour d'un individu, les assertions ObjectProperty sont synchronisées : si la propriété possède une inverseOf, l'assertion inverse est automatiquement ajoutée sur l'individu cible.
  - *Si* Si une nouvelle assertion (property, target) est ajoutée et que property possède inverseOf=inv Alors target.objectAssertions reçoit (inv, ind_id) s'il ne l'a pas déjà.

- **REQ-IND-048** — Lors de la suppression d'une assertion ou de l'individu lui-même, les assertions inverses correspondantes sont retirées des individus cibles.
  - *Si* Si une assertion (property, target) est retirée et que property possède inverseOf=inv Alors l'assertion (inv, ind_id) est supprimée de target.objectAssertions.

---

## 9. Règles d'affichage (Display Rules)

- **REQ-IND-049** — Un menu déroulant ▾ dans l'en-tête col. 1 permet d'accéder aux options 'Set Display Property' (règle simple) et 'Set Display Properties' (règle composite).
  - *Si* Si l'utilisateur clique ▾ Alors le menu ctx-menu apparaît ; il se ferme automatiquement au prochain clic hors du menu.

- **REQ-IND-050** — La règle d'affichage simple associe une propriété (rdfs:label, rdfs:comment ou une DP/OP) à une classe pour déterminer le libellé affiché dans la liste.
  - *Si* Si une règle simple est définie pour une classe Alors _resolveDisplayLabel() retourne la valeur de cette propriété pour chaque individu de cette classe.

- **REQ-IND-051** — La règle d'affichage composite permet de concaténer plusieurs propriétés avec des séparateurs personnalisables pour former le libellé affiché.
  - *Si* Si des lignes {sep, propId} sont définies Alors _buildMultiLabel() construit le label en concaténant sep+valeur pour chaque ligne non vide.

- **REQ-IND-052** — Les règles d'affichage sont héritées hiérarchiquement : si aucune règle n'est définie sur une classe, on remonte vers les classes parentes jusqu'à __root__ (owl:Thing).
  - *Si* Si aucune règle n'est trouvée pour classId Alors _getEffectiveDisplayProp() remonte les subClassOf jusqu'à trouver une règle ou atteindre __root__.

- **REQ-IND-053** — Dans la modale de règle simple, les règles héritées sont signalées par une mention '(inherited)' et la règle propre à la classe est marquée d'un ✓.

- **REQ-IND-054** — Un bouton 'Clear (use inherited)' dans la modale supprime la règle propre à la classe et revient à la règle héritée.
  - *Si* Si hasOwn est vrai Alors le bouton Clear est affiché ; un clic appelle setDisplayProp(null) qui supprime _displayProps[key].

- **REQ-IND-055** — Les règles d'affichage sont persistées dans l'ontologie backend via PUT /api/display-rules et rechargées depuis APP.state.ontology.display_rules.
  - *Si* Si setDisplayProp() ou setDisplayPropsMulti() est appelé Alors _saveDisplayRules() envoie la mise à jour au backend.

- **REQ-IND-056** — Pour rdfs:label, la résolution du libellé respecte l'ordre : langue demandée → autres langues actives (Settings.activeLangs) → premier label disponible.
  - *Si* Si une règle rdfs:label@xx est active Alors _getDisplayLabel() cherche d'abord la langue xx, puis les langues actives, puis le premier label.

- **REQ-IND-057** — Dans la liste des individus, si un label d'affichage est résolu, l'ID de l'individu est affiché en sous-texte de plus petite taille.
  - *Si* Si dispLabel est non nul Alors mainText=dispLabel et subText=ind.id ; sinon mainText=ind.id et subText=''.
