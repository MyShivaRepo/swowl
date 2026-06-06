# Exigences — Inferences

> Généré le 2026-06-06 | Dérivé strictement du code source | Aucune hallucination

## Table des matières

### Fond
- [REQ-INF-001 — Récupération des inférences via l'API](#req-inf-001--récupération-des-inférences-via-lapi)
- [REQ-INF-002 — Rafraîchissement automatique du panneau](#req-inf-002--rafraîchissement-automatique-du-panneau)
- [REQ-INF-003 — Arrêt du rafraîchissement automatique](#req-inf-003--arrêt-du-rafraîchissement-automatique)
- [REQ-INF-016 — Gestion des erreurs lors de la récupération des inférences](#req-inf-016--gestion-des-erreurs-lors-de-la-récupération-des-inférences)

### Forme
- [REQ-INF-004 — Affichage de l'état de cohérence de l'ontologie](#req-inf-004--affichage-de-létat-de-cohérence-de-lontologie)
- [REQ-INF-005 — Affichage des violations de cohérence](#req-inf-005--affichage-des-violations-de-cohérence)
- [REQ-INF-006 — Affichage de la fermeture transitive de la hiérarchie de classes](#req-inf-006--affichage-de-la-fermeture-transitive-de-la-hiérarchie-de-classes)
- [REQ-INF-007 — Affichage des restrictions héritées par héritage de classes](#req-inf-007--affichage-des-restrictions-héritées-par-héritage-de-classes)
- [REQ-INF-008 — Affichage des types inférés via domaine/portée des propriétés](#req-inf-008--affichage-des-types-inférés-via-domaineportée-des-propriétés)
- [REQ-INF-009 — Affichage des assertions symétriques inférées](#req-inf-009--affichage-des-assertions-symétriques-inférées)
- [REQ-INF-010 — Affichage des assertions transitives inférées](#req-inf-010--affichage-des-assertions-transitives-inférées)
- [REQ-INF-011 — Affichage des assertions inférées par chaînes de propriétés et inverses](#req-inf-011--affichage-des-assertions-inférées-par-chaînes-de-propriétés-et-inverses)
- [REQ-INF-012 — Affichage des restrictions inverses inférées sur les classes](#req-inf-012--affichage-des-restrictions-inverses-inférées-sur-les-classes)
- [REQ-INF-013 — Affichage des propriétés inverses inférées par owl:inverseOf](#req-inf-013--affichage-des-propriétés-inverses-inférées-par-owlinverseof)
- [REQ-INF-014 — Bouton de recalcul manuel des inférences](#req-inf-014--bouton-de-recalcul-manuel-des-inférences)
- [REQ-INF-015 — Sections rétractables (collapsible) pour les résultats d'inférence](#req-inf-015--sections-rétractables-collapsible-pour-les-résultats-dinférence)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles OWL, contraintes de données, comportements algorithmiques, validations, persistance.


### REQ-INF-001 — Récupération des inférences via l'API

**Si** l'application doit récupérer les données d'inférence calculées par le backend,

**Alors** elle effectue un appel HTTP GET vers l'endpoint `/api/inferences` et traite la réponse JSON contenant les champs `violations`, `subclass_closure`, `inherited_restrictions`, `inferred_inverse_restrictions`, `inferred_types`, `symmetric_assertions`, `transitive_assertions`, `chain_assertions` et `inferred_inverse_properties`.

---

**Code source :** `api.js` → `getInferences()`

### REQ-INF-002 — Rafraîchissement automatique du panneau

**Si** l'onglet "Inferences" est actif (`APP.currentSection === 'inferences'`),

**Alors** :
- le panneau se rafraîchit automatiquement toutes les 3000 ms via `setInterval()` déclenchant `InferenceUI.refresh()` à chaque cycle
- tout intervalle de rafraîchissement existant est préalablement arrêté via `stopAutoRefresh()` avant la création du nouveau cycle

---

**Code source :** `inference_ui.js` → `startAutoRefresh()`

### REQ-INF-003 — Arrêt du rafraîchissement automatique

**Si** la fonction d'arrêt du rafraîchissement automatique est appelée,

**Alors** l'intervalle en cours est annulé via `clearInterval()` sur la référence `_autoRefresh` et cette référence est remise à `null`, garantissant qu'aucun cycle résiduel ne subsiste avant le démarrage d'un nouveau cycle.

---

**Code source :** `inference_ui.js` → `stopAutoRefresh()`

### REQ-INF-016 — Gestion des erreurs lors de la récupération des inférences

**Si** l'appel à `API.getInferences()` échoue,

**Alors** :
- l'exception est interceptée par un bloc `catch`
- le contenu de l'élément HTML `#inference-panel` est remplacé par un paragraphe de classe CSS `error` affichant le message d'erreur (`e.message`)
- aucune donnée partielle n'est conservée

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

**Code source :** `inference_ui.js` → `refresh()`

### REQ-INF-004 — Affichage de l'état de cohérence de l'ontologie

**Si** l'ontologie est chargée et que le panneau d'inférences est affiché,

**Alors** :
- si des violations de sévérité `'error'` existent, un badge "🔴 N error(s)" avec la classe CSS `badge-error` est affiché dans l'en-tête
- si aucune erreur n'est présente, un badge "🟢 Consistent" avec la classe CSS `badge-ok` est affiché
- si des avertissements de sévérité `'warning'` existent, un badge supplémentaire "⚠️ N warning(s)" avec la classe `badge-warn` est affiché

---

**Code source :** `inference_ui.js` → `render()`

### REQ-INF-005 — Affichage des violations de cohérence

**Si** le panneau d'inférences est rendu et que des violations ont été retournées par le backend,

**Alors** la section "Violations" liste chaque violation avec une icône de sévérité (🔴 pour `'error'`, 🟡 pour `'warning'`), l'identifiant de l'entité concernée (`v.entity`) formaté en `<code>`, et le message descriptif (`v.message`) ;
**et** si aucune violation n'est présente, le message "No violations detected." est affiché à la place.

---

**Code source :** `inference_ui.js` → `_renderViolations()`

### REQ-INF-006 — Affichage de la fermeture transitive de la hiérarchie de classes

**Si** l'ontologie est chargée et contient des classes reliées par des relations `subClassOf`,

**Alors** la section "Resolved hierarchy" affiche un tableau de la fermeture transitive de ces relations, présentant pour chaque classe ayant au moins un ancêtre la classe source et l'ensemble de ses ancêtres à tous les niveaux (chaque ancêtre formaté avec la classe CSS `tag-class`), les entrées sans ancêtres étant filtrées avant rendu.

---

**Code source :** `inference_ui.js` → `_renderSubclassClosure()`

### REQ-INF-007 — Affichage des restrictions héritées par héritage de classes

**Si** l'ontologie est chargée et que des restrictions OWL ont été propagées par la hiérarchie de classes,

**Alors** la section "Inherited restrictions" affiche un tableau présentant pour chaque entrée : la classe qui hérite (`r.class_id`), la classe parente dont la restriction est héritée (`r.inherited_from`), et la description textuelle de la restriction construite à partir des champs `restr.type`, `restr.property`, `restr.filler` et `restr.cardinality`.

---

**Code source :** `inference_ui.js` → `_renderInheritedRestrictions()`

### REQ-INF-008 — Affichage des types inférés via domaine/portée des propriétés

**Si** l'ontologie est chargée et que des types ont été inférés pour des individus à partir des domaines et portées (`domain`/`range`) des propriétés,

**Alors** la section "Inferred types" affiche un tableau présentant pour chaque individu : son label résolu via `IndividualEditor._labelForId()` (avec l'IRI complet en attribut `title` si le label diffère), le type inféré (`t.inferred_type`), et la justification textuelle (`t.reason`).

---

**Code source :** `inference_ui.js` → `_renderInferredTypes()`

### REQ-INF-009 — Affichage des assertions symétriques inférées

**Si** l'ontologie est chargée et que des assertions ont été inférées par application de la caractéristique `owl:SymmetricProperty`
**et** que la liste résultante est non vide,

**Alors** la section "Inferred symmetric assertions" affiche un tableau présentant pour chaque assertion : l'individu source (label résolu via `IndividualEditor._labelForId()`), la propriété (`a.property`), l'individu cible (label résolu de même), et la justification (`a.reason`).

---

**Code source :** `inference_ui.js` → `_renderAssertions()`

### REQ-INF-010 — Affichage des assertions transitives inférées

**Si** l'ontologie est chargée et que des assertions ont été inférées par application de la caractéristique `owl:TransitiveProperty`
**et** que la liste résultante est non vide,

**Alors** la section "Inferred transitive assertions" affiche un tableau au format identique à REQ-INF-009, avec la liste `transitive_assertions` comme source de données.

---

**Code source :** `inference_ui.js` → `_renderAssertions()`

### REQ-INF-011 — Affichage des assertions inférées par chaînes de propriétés et inverses

**Si** l'ontologie est chargée et que des assertions ont été inférées par application des chaînes de propriétés (`owl:propertyChainAxiom`) et des propriétés inverses
**et** que la liste résultante est non vide,

**Alors** la section "Assertions (chains + inverses)" affiche un tableau au format identique à REQ-INF-009 et REQ-INF-010, avec la liste `chain_assertions` comme source de données.

---

**Code source :** `inference_ui.js` → `_renderAssertions()`

### REQ-INF-012 — Affichage des restrictions inverses inférées sur les classes

**Si** l'ontologie est chargée et que des restrictions existentielles ont été inférées sur des classes par inversion de propriétés
**et** que la liste résultante est non vide,

**Alors** la section "Inferred inverse restrictions" affiche un tableau présentant pour chaque restriction : la classe concernée (`i.class_id`), la description de la restriction sous la forme `∃<property>.<filler>` construite à partir des champs `r.property` et `r.filler`, et la justification (`i.reason`).

---

**Code source :** `inference_ui.js` → `_renderInverseClassRestrictions()`

### REQ-INF-013 — Affichage des propriétés inverses inférées par owl:inverseOf

**Si** l'ontologie est chargée et que des propriétés OWL ont été inférées par symétrie de la relation `owl:inverseOf`,

**Alors** :
- la section "Inferred inverse properties" affiche un tableau présentant pour chaque entrée : la propriété inférée (`i.property_id`), la propriété dont elle est l'inverse (`i.inverse_of`), et la justification (`i.reason`)
- si aucune propriété inverse n'est inférée, le message "No inverse inferred by owl:inverseOf symmetry." est affiché à la place

---

**Code source :** `inference_ui.js` → `_renderInferredInverseProperties()`

### REQ-INF-014 — Bouton de recalcul manuel des inférences

**Si** l'utilisateur clique sur le bouton "↻" affiché dans l'en-tête du panneau d'inférences,

**Alors** `InferenceUI.refresh()` est appelé immédiatement, déclenchant un recalcul et un rechargement complet des inférences depuis le backend, indépendamment du cycle de rafraîchissement automatique.

---

**Code source :** `inference_ui.js` → `render()`

### REQ-INF-015 — Sections rétractables (collapsible) pour les résultats d'inférence

**Si** une section de résultats d'inférence contient au moins un élément
**et** que l'utilisateur clique sur son titre,

**Alors** :
- la section bascule entre les états replié et déplié via `this.parentElement.classList.toggle('open')`
- la section est rendue avec la classe CSS `collapsible`
- un indicateur visuel `▶` (classe CSS `caret`) est affiché dans le titre

---

**Code source :** `inference_ui.js` → `_renderSubclassClosure()`, `_renderInheritedRestrictions()`, `_renderInferredTypes()`, `_renderAssertions()`, `_renderInverseClassRestrictions()`, `_renderInferredInverseProperties()`
