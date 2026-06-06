Le fichier ne contient pas de paires à fusionner (ajout/suppression, création/suppression, add/delete, add/remove). Toutes les exigences ont des titres uniques sans suffixes d'opération dupliqués. Le fichier est déjà bien structuré.

Je retourne le fichier tel quel, avec uniquement la correction des IDs manquants (REQ-SET-003 et REQ-SET-004 et REQ-SET-008 sont dans la section Forme, les IDs 003/004/008 sont déjà dans la numérotation globale — pas de renumérotation nécessaire car aucune fusion n'a eu lieu).

# Exigences — Settings

> Généré le 2026-06-06 | Dérivé strictement du code source | Aucune hallucination

## Table des matières

### Fond
- [REQ-SET-001 — Persistance des paramètres utilisateur](#req-set-001--persistance-des-paramètres-utilisateur)
- [REQ-SET-002 — Chargement des paramètres au démarrage](#req-set-002--chargement-des-paramètres-au-démarrage)
- [REQ-SET-005 — Masquage d'un onglet optionnel](#req-set-005--masquage-dun-onglet-optionnel)
- [REQ-SET-006 — Affichage d'un onglet optionnel précédemment masqué](#req-set-006--affichage-dun-onglet-optionnel-précédemment-masqué)
- [REQ-SET-007 — Basculement de visibilité d'un onglet (toggle)](#req-set-007--basculement-de-visibilité-dun-onglet-toggle)
- [REQ-SET-009 — Persistance de la visibilité des onglets dans le localStorage](#req-set-009--persistance-de-la-visibilité-des-onglets-dans-le-localstorage)
- [REQ-SET-010 — Définition de la langue préférée](#req-set-010--définition-de-la-langue-préférée)
- [REQ-SET-011 — Activation ou désactivation d'une langue](#req-set-011--activation-ou-désactivation-dune-langue)
- [REQ-SET-012 — Protection de la langue préférée contre la désactivation](#req-set-012--protection-de-la-langue-préférée-contre-la-désactivation)
- [REQ-SET-013 — Catalogue des langues européennes disponibles](#req-set-013--catalogue-des-langues-européennes-disponibles)
- [REQ-SET-014 — Sélection du format d'identifiant des individus](#req-set-014--sélection-du-format-didentifiant-des-individus)
- [REQ-SET-015 — Génération automatique d'un identifiant pour un nouvel individu](#req-set-015--génération-automatique-dun-identifiant-pour-un-nouvel-individu)

### Forme
- [REQ-SET-003 — Navigation par sous-onglets dans la page Settings](#req-set-003--navigation-par-sous-onglets-dans-la-page-settings)
- [REQ-SET-004 — Affichage de la liste des onglets GUI configurables](#req-set-004--affichage-de-la-liste-des-onglets-gui-configurables)
- [REQ-SET-008 — Application immédiate de la visibilité des onglets dans le DOM](#req-set-008--application-immédiate-de-la-visibilité-des-onglets-dans-le-dom)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles OWL, contraintes de données, comportements algorithmiques, validations, persistance.


### REQ-SET-001 — Persistance des paramètres utilisateur


La méthode `Settings.save()` sérialise en JSON les trois paramètres utilisateur (`preferredLang`, `activeLangs`, `namingFormat`) et les stocke dans le `localStorage` sous la clé `swowl_settings`. Elle est appelée à chaque modification d'un paramètre.

---

**Code source :** `app.js` → `Settings.save()`

### REQ-SET-002 — Chargement des paramètres au démarrage


La méthode `Settings.load()` lit l'entrée `swowl_settings` du `localStorage` et réhydrate les champs `preferredLang`, `activeLangs` et `namingFormat`. Si aucune valeur n'est stockée, les valeurs par défaut sont appliquées : langue préférée `fr`, langues actives `['fr']`, format d'identifiant `individual_counter`. Elle est invoquée une seule fois à l'initialisation du module (`Settings.load()` ligne 189).

---

**Code source :** `app.js` → `Settings.load()`

### REQ-SET-003 — Masquage et affichage d'un onglet optionnel


La méthode `TabVisibility.hide(tabId)` vérifie d'abord que l'onglet est bien dans la liste `_optional`. Si c'est le cas, elle ajoute son identifiant au `Set` interne `_hidden`, sauvegarde l'état, applique la visibilité dans le DOM, et redirige l'utilisateur vers l'onglet `ontologies` si l'onglet actuellement actif est celui qui vient d'être masqué. La méthode `TabVisibility.show(tabId)` supprime l'identifiant de l'onglet du `Set` `_hidden`, sauvegarde l'état dans le `localStorage`, et rappelle `APP._applyTabVisibility()` pour rendre l'onglet visible dans la barre de navigation.

---

**Code source :** `app.js` → `TabVisibility.hide()` | `TabVisibility.show()`

### REQ-SET-004 — Basculement de visibilité d'un onglet (toggle)


La méthode `TabVisibility.toggle(tabId)` appelle `TabVisibility.show()` si l'onglet est actuellement masqué, ou `TabVisibility.hide()` dans le cas contraire. Elle est invoquée directement par le gestionnaire `onclick` de chaque ligne d'onglet dans `APP.renderGuiTabs()`.

---

**Code source :** `app.js` → `TabVisibility.toggle()`

### REQ-SET-005 — Persistance de la visibilité des onglets dans le localStorage


La méthode `TabVisibility.save()` sérialise le contenu du `Set` `_hidden` en tableau JSON et le stocke dans le `localStorage` sous la clé `swowl_hidden_tabs`. Elle est appelée par `TabVisibility.hide()` et `TabVisibility.show()`.

---

**Code source :** `app.js` → `TabVisibility.save()`

### REQ-SET-006 — Définition de la langue préférée


La méthode `Settings.setPreferred(lang)` définit `preferredLang` à la valeur du code de langue fourni. Si cette langue n'est pas encore dans `activeLangs`, elle l'y ajoute. Elle appelle ensuite `Settings.save()` et `APP.renderSection('settings')` pour persister et rafraîchir l'interface.

---

**Code source :** `app.js` → `Settings.setPreferred()`

### REQ-SET-007 — Activation ou désactivation d'une langue


La méthode `Settings.toggleActive(lang)` ajoute le code de langue à `activeLangs` s'il n'y est pas déjà, ou le retire sinon. Elle appelle `Settings.save()` et `APP.renderSection('settings')` après chaque modification.

---

**Code source :** `app.js` → `Settings.toggleActive()`

### REQ-SET-008 — Protection de la langue préférée contre la désactivation


Dans la méthode `Settings.toggleActive(lang)`, un garde en début de fonction vérifie si `lang === this.preferredLang`. Si c'est le cas, la fonction retourne immédiatement sans effectuer aucune modification, empêchant ainsi la suppression de la langue préférée de la liste active.

---

**Code source :** `app.js` → `Settings.toggleActive()`

### REQ-SET-009 — Catalogue des langues européennes disponibles


L'objet `Settings` déclare une propriété `availableLangs` contenant un tableau de 25 entrées. Chaque entrée est un objet `{ code, name, nameEn }` correspondant à une langue officielle ou courante en Europe (bulgare, tchèque, danois, allemand, grec, anglais, espagnol, estonien, finnois, français, irlandais, croate, hongrois, italien, lituanien, letton, maltais, néerlandais, norvégien, polonais, portugais, roumain, slovaque, slovène, suédois).

---

**Code source :** `app.js` → `Settings.availableLangs` (propriété statique initialisée dans l'objet `Settings`)

### REQ-SET-010 — Sélection du format d'identifiant des individus


La méthode `Settings.setNamingFormat(fmt)` affecte la valeur reçue à `this.namingFormat`, appelle `Settings.save()` pour persister, puis `APP.renderSection('settings')` pour rafraîchir l'interface. Elle est déclenchée par les boutons radio du sous-onglet `IDs Rules`, qui propose trois valeurs : `individual_counter`, `class_counter`, `alphanumeric`.

---

**Code source :** `app.js` → `Settings.setNamingFormat()`

### REQ-SET-011 — Génération automatique d'un identifiant pour un nouvel individu


La méthode `Settings.generateIndividualId(classId)` calcule un identifiant par défaut pour un nouvel individu selon le format stocké dans `Settings.namingFormat` :

- **`individual_counter`** : retourne `Individual_N` où `N` est le nombre d'individus existants dans `APP.state.individuals` plus 1.
- **`class_counter`** : retourne `<classId>_N` si un `classId` est fourni, sinon se rabat sur `Individual_N`.
- **`alphanumeric`** : génère une chaîne de la forme `xxxxx-xxxxx-xxxxx-xxxxx` composée de 4 segments de 5 caractères alphanumériques aléatoires, le premier caractère du premier segment étant obligatoirement une lettre.

---

**Code source :** `app.js` → `Settings.generateIndividualId()`

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

### REQ-SET-012 — Navigation par sous-onglets dans la page Settings


La fonction `APP.renderSettings()` génère une interface à deux colonnes : une barre latérale gauche avec trois sous-onglets cliquables (`GUI Tabs`, `Languages`, `IDs Rules`), et une zone de contenu à droite dont le rendu dépend de la valeur de `APP._settingsTab`. Un clic sur un sous-onglet met à jour `APP._settingsTab` et rappelle `APP.renderSection('settings')` pour réafficher la page.

---

**Code source :** `app.js` → `APP.renderSettings()`

### REQ-SET-013 — Affichage de la liste des onglets GUI configurables


La fonction `APP.renderGuiTabs()` affiche la liste exhaustive des 11 onglets de l'application (`Ontologies`, `Settings`, `Classes`, `ObjectProperties`, `DatatypeProperties`, `AnnotationProperties`, `Individuals`, `SWRL Rules`, `Views`, `Queries`, `Inferences`). Les onglets marqués `fixed: true` sont affichés avec une case à cocher désactivée et le label `required`. Les onglets optionnels sont affichés avec une case à cocher interactive reflétant leur état de visibilité courant.

---

**Code source :** `app.js` → `APP.renderGuiTabs()`

### REQ-SET-014 — Application immédiate de la visibilité des onglets dans le DOM


La fonction `APP._applyTabVisibility()` parcourt la liste `TabVisibility._optional` et, pour chaque identifiant, sélectionne l'élément `.nav-item[data-section="<id>"]` dans le DOM. Elle affecte `display:none` si l'onglet est dans `_hidden`, ou supprime le style inline sinon.

---

**Code source :** `app.js` → `APP._applyTabVisibility()`
