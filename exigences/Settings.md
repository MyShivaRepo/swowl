# Exigences — Onglet « Settings »

> Document généré par rétro-engineering du code source SWOWL · version 1.0 · 2026-06-06

---

## 1. Navigation et structure de l'onglet Settings

- **REQ-SET-001** — L'onglet Settings est accessible depuis la barre de navigation principale via un élément de menu dédié.
  - *Si* Si l'utilisateur clique sur l'élément 'Settings' dans la barre de navigation, alors le contenu principal affiche le panneau Settings.

- **REQ-SET-002** — L'onglet Settings est un onglet fixe (requis) : il ne peut pas être masqué depuis la gestion des onglets GUI.
  - *Si* Si un onglet est marqué comme 'fixed', alors sa case à cocher est désactivée et il affiche le badge 'required'.

- **REQ-SET-003** — Le panneau Settings s'organise en deux zones : une barre latérale de navigation verticale et une zone de contenu principale.

- **REQ-SET-004** — La barre latérale contient trois sous-onglets : 'GUI Tabs', 'Languages' et 'IDs Rules'.

- **REQ-SET-005** — Le sous-onglet actif est mis en évidence visuellement : bordure gauche accentuée, texte en gras coloré, fond distinct.
  - *Si* Si un sous-onglet est actif, alors sa bordure gauche est de couleur accent, son texte est en font-weight 600 et de couleur accent, et son fond est 'bg3'.

- **REQ-SET-006** — Le clic sur un sous-onglet de la barre latérale met à jour l'état interne '_settingsTab' et re-rend la section Settings.
  - *Si* Si l'utilisateur clique sur un sous-onglet, alors APP._settingsTab est mis à jour et APP.renderSection('settings') est appelé.

- **REQ-SET-007** — Le dernier sous-onglet actif est mémorisé dans la variable d'état '_settingsTab' (valeur par défaut : 'gui-tabs').
  - *Si* Si aucun sous-onglet n'a été sélectionné, alors 'gui-tabs' est affiché par défaut.

---

## 2. Gestion de la visibilité des onglets GUI (sous-onglet 'GUI Tabs')

- **REQ-SET-008** — Le sous-onglet 'GUI Tabs' affiche la liste complète des onglets de l'application avec leur icône et leur libellé.

- **REQ-SET-009** — Les onglets optionnels sont : AnnotationProperties, Individuals, SWRL Rules, Views, Queries, Inferences. Ils peuvent être masqués ou affichés.

- **REQ-SET-010** — Les onglets requis (Ontologies, Settings, Classes, ObjectProperties, DatatypeProperties) sont affichés avec une opacité réduite et ne sont pas cliquables.
  - *Si* Si un onglet est 'fixed', alors sa case à cocher est désactivée (disabled), le curseur est 'default' et l'opacité est 0.55.

- **REQ-SET-011** — Cliquer sur un onglet optionnel dans la liste bascule sa visibilité (toggle) dans la barre de navigation.
  - *Si* Si l'utilisateur clique sur une ligne d'onglet optionnel, alors TabVisibility.toggle() est appelé pour cet onglet.

- **REQ-SET-012** — L'état de visibilité de chaque onglet optionnel est persisté dans le localStorage sous la clé 'swowl_hidden_tabs'.
  - *Si* Si la visibilité d'un onglet change, alors le tableau des onglets masqués est sérialisé et sauvegardé dans localStorage.

- **REQ-SET-013** — Masquer un onglet sur lequel l'utilisateur est actuellement positionné redirige vers l'onglet 'Ontologies'.
  - *Si* Si l'onglet masqué est la section courante (APP.currentSection), alors l'application navigue vers 'ontologies'.

- **REQ-SET-014** — La modification de visibilité d'un onglet met immédiatement à jour l'affichage de la barre de navigation (sans rechargement de page).
  - *Si* Si la visibilité d'un onglet change, alors APP._applyTabVisibility() est appelé pour mettre à jour le DOM de la barre de navigation.

- **REQ-SET-015** — Lorsque la visibilité d'un onglet change depuis le sous-onglet 'GUI Tabs', le contenu de Settings est immédiatement re-rendu pour refléter l'état des cases à cocher.
  - *Si* Si APP._settingsTab === 'gui-tabs' et qu'un onglet change de visibilité, alors APP.renderSection('settings') est appelé.

- **REQ-SET-016** — Les lignes d'onglets optionnels ont un effet de survol (hover) qui change leur couleur de fond.
  - *Si* Si l'utilisateur survole une ligne d'onglet optionnel, alors le fond passe à 'var(--bg3)' ; au départ du curseur, il revient à 'var(--bg2)'.

---

## 3. Gestion des langues (sous-onglet 'Languages')

- **REQ-SET-017** — Le sous-onglet 'Languages' présente trois sections distinctes : langue préférée, langues actives, langues disponibles.

- **REQ-SET-018** — La liste des langues disponibles couvre 25 langues européennes (de bg/Bulgare à sv/Suédois).

- **REQ-SET-019** — La langue préférée est celle appliquée par défaut aux nouveaux rdfs:label et rdfs:comment. Elle doit appartenir aux langues actives.
  - *Si* Si une langue est définie comme préférée, alors elle est automatiquement ajoutée aux langues actives si elle n'y figure pas déjà.

- **REQ-SET-020** — La section 'Preferred language' affiche un bouton par langue active ; la langue préférée est mise en évidence avec une étoile pleine (★) et un style 'primary'.
  - *Si* Si une langue est la langue préférée, alors son bouton utilise le style 'btn-primary' et affiche '★' ; sinon il utilise 'btn-secondary' et affiche '☆'.

- **REQ-SET-021** — Cliquer sur un bouton de langue dans la section 'Preferred language' définit cette langue comme préférée et re-rend le panneau Settings.
  - *Si* Si l'utilisateur clique sur un bouton de langue préférée, alors Settings.setPreferred(code) est appelé, l'état est sauvegardé et la section est re-rendue.

- **REQ-SET-022** — La section 'Active languages' affiche les langues actives sous forme de badges avec code de langue et bouton de suppression (✕), sauf pour la langue préférée.
  - *Si* Si une langue active n'est pas la langue préférée, alors elle affiche un bouton ✕ permettant sa suppression.

- **REQ-SET-023** — La langue préférée ne peut pas être supprimée des langues actives.
  - *Si* Si l'utilisateur tente de désactiver la langue préférée via toggleActive(), alors l'action est ignorée (return immédiat).

- **REQ-SET-024** — La section 'Available languages' affiche toutes les 25 langues européennes sous forme de boutons ; les langues actives sont mises en évidence avec le style 'primary'.
  - *Si* Si une langue est dans la liste des langues actives, alors son bouton utilise le style 'btn-primary' ; sinon 'btn-secondary'.

- **REQ-SET-025** — Cliquer sur un bouton de langue disponible bascule son statut actif/inactif (toggle) et re-rend le panneau Settings.
  - *Si* Si la langue est déjà active, alors elle est retirée des langues actives ; sinon elle y est ajoutée.

- **REQ-SET-026** — Les paramètres de langue (langue préférée et langues actives) sont persistés dans le localStorage sous la clé 'swowl_settings'.
  - *Si* Si les paramètres de langue sont modifiés, alors Settings.save() sérialise preferredLang, activeLangs et namingFormat dans localStorage.

- **REQ-SET-027** — Au chargement de l'application, si la langue préférée n'est pas dans les langues actives, elle y est automatiquement ajoutée en tête de liste.
  - *Si* Si lors du chargement activeLangs ne contient pas preferredLang, alors preferredLang est inséré en position 0 de activeLangs.

- **REQ-SET-028** — La langue préférée sert de langue par défaut pour le sélecteur de langue (dropdown LANG) dans les formulaires d'édition des autres onglets.
  - *Si* Si Settings.preferredLang est défini, alors il est utilisé comme valeur initiale de l'attribut 'language' des composants rdfs:label et rdfs:comment.

---

## 4. Règles de nommage des Individuals (sous-onglet 'IDs Rules')

- **REQ-SET-029** — Le sous-onglet 'IDs Rules' permet de configurer le format d'identifiant généré automatiquement lors de la création d'un nouvel Individual.

- **REQ-SET-030** — Trois formats de nommage sont proposés : 'Individual_Counter', 'ClassName_Counter', et 'Alphanumeric string'.

- **REQ-SET-031** — Le format 'Individual_Counter' génère un identifiant de la forme 'Individual_N' où N est le nombre d'individuals existants + 1.
  - *Si* Si le format est 'individual_counter', alors l'ID généré est 'Individual_' suivi du nombre total d'individuals existants + 1.

- **REQ-SET-032** — Le format 'ClassName_Counter' génère un identifiant de la forme '{ClassId}_N' où ClassId est l'ID de la classe sélectionnée et N le compteur.
  - *Si* Si le format est 'class_counter' et qu'une classe est sélectionnée, alors l'ID est '{classId}_{counter}' ; sinon, il se rabat sur 'Individual_N'.

- **REQ-SET-033** — Le format 'Alphanumeric string' génère un identifiant aléatoire de 4 groupes de 5 caractères alphanumériques séparés par des tirets.
  - *Si* Si le format est 'alphanumeric', alors l'ID est généré avec le pattern '{seg1}-{seg2}-{seg3}-{seg4}' où chaque segment commence par une lettre et contient 4 caractères alphanumériques supplémentaires.

- **REQ-SET-034** — Chaque option de format est affichée avec son libellé, une description et un exemple concret de l'identifiant généré.

- **REQ-SET-035** — Le format sélectionné est mis en évidence visuellement : bordure accentuée et fond 'bg3'.
  - *Si* Si une option de format est sélectionnée, alors sa bordure est 'var(--accent)' et son fond est 'var(--bg3)' ; sinon la bordure est 'var(--border)' et le fond 'var(--bg2)'.

- **REQ-SET-036** — La sélection d'un format via le bouton radio déclenche Settings.setNamingFormat() qui sauvegarde et re-rend le panneau Settings.
  - *Si* Si l'utilisateur change le format de nommage, alors Settings.namingFormat est mis à jour, Settings.save() est appelé et APP.renderSection('settings') est exécuté.

- **REQ-SET-037** — Le format de nommage est persisté dans le localStorage et rechargé au démarrage de l'application (valeur par défaut : 'individual_counter').
  - *Si* Si aucun format n'est trouvé dans localStorage, alors la valeur 'individual_counter' est utilisée par défaut.

- **REQ-SET-038** — L'ID généré automatiquement peut être modifié manuellement par l'utilisateur avant confirmation de la création de l'Individual.

---

## 5. Persistance et chargement des paramètres

- **REQ-SET-039** — Tous les paramètres utilisateur (langue préférée, langues actives, format de nommage) sont stockés dans un unique objet JSON dans le localStorage.
  - *Si* Si Settings.save() est appelé, alors l'objet {preferredLang, activeLangs, namingFormat} est sérialisé sous la clé 'swowl_settings' dans localStorage.

- **REQ-SET-040** — Les paramètres sont chargés depuis le localStorage au démarrage de l'application, avant le premier rendu.
  - *Si* Si Settings.load() est exécuté, alors les valeurs de localStorage remplacent les valeurs par défaut de l'objet Settings.

- **REQ-SET-041** — Si le localStorage contient des données corrompues ou invalides, les paramètres reviennent silencieusement aux valeurs par défaut.
  - *Si* Si JSON.parse() lève une exception lors du chargement, alors les valeurs par défaut sont conservées sans message d'erreur.

- **REQ-SET-042** — La visibilité des onglets optionnels est gérée dans un objet de persistance séparé (clé 'swowl_hidden_tabs') distinct des paramètres généraux.

---

## 6. Comportements visuels et interactions générales

- **REQ-SET-043** — Le panneau Settings affiche un titre '🛠️ Settings' dans une barre d'en-tête séparée par une bordure du contenu.

- **REQ-SET-044** — Le dropdown de sélection de langue (LANG) dans les autres onglets se positionne sous le bouton déclencheur et liste les langues actives.
  - *Si* Si Settings.showLangDropdown() est appelé, alors un menu flottant en position fixe est affiché sous le bouton, listant les langues actives.

- **REQ-SET-045** — La langue sélectionnée dans le dropdown LANG est mise en évidence visuellement (fond accent, texte blanc).
  - *Si* Si un item du dropdown correspond à la valeur courante de l'input, alors son fond est 'var(--accent)' et son texte est blanc.

- **REQ-SET-046** — Le dropdown LANG se ferme automatiquement lorsque l'utilisateur clique en dehors de celui-ci.
  - *Si* Si un clic est détecté en dehors du dropdown et du bouton déclencheur, alors le dropdown est supprimé du DOM.

- **REQ-SET-047** — La sélection d'une langue dans le dropdown LANG met à jour la valeur de l'input associé et déclenche un événement 'change'.
  - *Si* Si l'utilisateur clique sur un item du dropdown LANG, alors inp.value est mis à jour et un événement 'change' avec bubbles:true est dispatché.

- **REQ-SET-048** — Un seul dropdown LANG peut être ouvert à la fois : l'ouverture d'un nouveau dropdown ferme l'éventuel dropdown existant.
  - *Si* Si Settings.showLangDropdown() est appelé, alors document.getElementById('lang-dropdown')?.remove() est exécuté en premier.
