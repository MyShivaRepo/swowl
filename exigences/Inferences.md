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
**Code source :** `api.js` → `getInferences()`

L'application effectue un appel HTTP GET vers l'endpoint `/api/inferences` pour récupérer l'ensemble des données d'inférence calculées par le backend. La réponse est un objet JSON contenant les champs `violations`, `subclass_closure`, `inherited_restrictions`, `inferred_inverse_restrictions`, `inferred_types`, `symmetric_assertions`, `transitive_assertions`, `chain_assertions` et `inferred_inverse_properties`.

---

### REQ-INF-002 — Rafraîchissement automatique du panneau
**Code source :** `inference_ui.js` → `startAutoRefresh()`

Lorsque l'onglet "Inferences" est actif (`APP.currentSection === 'inferences'`), le panneau se rafraîchit automatiquement à intervalle régulier. L'intervalle par défaut est de 3000 ms. La fonction appelle `setInterval()` qui déclenche `InferenceUI.refresh()` à chaque cycle, et arrête préalablement tout intervalle existant via `stopAutoRefresh()` avant d'en créer un nouveau.

---

### REQ-INF-003 — Arrêt du rafraîchissement automatique
**Code source :** `inference_ui.js` → `stopAutoRefresh()`

La fonction arrête l'intervalle de rafraîchissement automatique en appelant `clearInterval()` sur la référence `_autoRefresh` et en remettant celle-ci à `null`. Cette fonction est appelée systématiquement avant tout démarrage d'un nouveau cycle de rafraîchissement.

---

### REQ-INF-016 — Gestion des erreurs lors de la récupération des inférences
**Code source :** `inference_ui.js` → `refresh()`

En cas d'échec de l'appel à `API.getInferences()`, l'exception est interceptée par un bloc `catch`. Le contenu de l'élément HTML `#inference-panel` est remplacé par un paragraphe de classe CSS `error` affichant le message d'erreur (`e.message`). Aucune donnée partielle n'est conservée en cas d'erreur.

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

### REQ-INF-004 — Affichage de l'état de cohérence de l'ontologie
**Code source :** `inference_ui.js` → `render()`

L'en-tête du panneau affiche un badge d'état calculé à partir des violations dont la sévérité est `'error'`. Si des erreurs existent, le badge affiche "🔴 N error(s)" avec la classe CSS `badge-error`. Si aucune erreur n'est présente, le badge affiche "🟢 Consistent" avec la classe CSS `badge-ok`. Les avertissements (`severity === 'warning'`) génèrent un badge supplémentaire "⚠️ N warning(s)" avec la classe `badge-warn`.

---

### REQ-INF-005 — Affichage des violations de cohérence
**Code source :** `inference_ui.js` → `_renderViolations()`

La section "Violations" liste toutes les violations retournées par le backend. Chaque violation est affichée avec : une icône selon la sévérité (🔴 pour `'error'`, 🟡 pour `'warning'`), l'identifiant de l'entité concernée (`v.entity`) formaté en `<code>`, et le message descriptif (`v.message`). Si aucune violation n'est présente, le message "No violations detected." est affiché.

---

### REQ-INF-006 — Affichage de la fermeture transitive de la hiérarchie de classes
**Code source :** `inference_ui.js` → `_renderSubclassClosure()`

La section "Resolved hierarchy" affiche, sous forme de tableau, la fermeture transitive des relations `subClassOf` de l'ontologie. Pour chaque classe ayant au moins un ancêtre, le tableau présente la classe source et l'ensemble de ses ancêtres à tous les niveaux, chaque ancêtre formaté avec la classe CSS `tag-class`. Les entrées sans ancêtres sont filtrées avant rendu (`ancs.length > 0`).

---

### REQ-INF-007 — Affichage des restrictions héritées par héritage de classes
**Code source :** `inference_ui.js` → `_renderInheritedRestrictions()`

La section "Inherited restrictions" affiche un tableau des restrictions OWL héritées par propagation de la hiérarchie de classes. Pour chaque entrée, le tableau présente : la classe qui hérite (`r.class_id`), la classe parente dont la restriction est héritée (`r.inherited_from`), et la description textuelle de la restriction construite à partir des champs `restr.type`, `restr.property`, `restr.filler` et `restr.cardinality`.

---

### REQ-INF-008 — Affichage des types inférés via domaine/portée des propriétés
**Code source :** `inference_ui.js` → `_renderInferredTypes()`

La section "Inferred types" affiche un tableau des types OWL inférés pour les individus à partir des domaines et portées (`domain`/`range`) des propriétés. Pour chaque individu, le tableau présente : le label de l'individu résolu via `IndividualEditor._labelForId()` (avec l'IRI complet en attribut `title` si le label diffère), le type inféré (`t.inferred_type`), et la justification textuelle (`t.reason`).

---

### REQ-INF-009 — Affichage des assertions symétriques inférées
**Code source :** `inference_ui.js` → `_renderAssertions()`

La section "Inferred symmetric assertions" liste les assertions sur individus inférées par application de la caractéristique `owl:SymmetricProperty`. Chaque ligne du tableau présente : l'individu source (label résolu via `IndividualEditor._labelForId()`), la propriété (`a.property`), l'individu cible (label résolu de même), et la justification (`a.reason`). La section n'est pas rendue si la liste est vide.

---

### REQ-INF-010 — Affichage des assertions transitives inférées
**Code source :** `inference_ui.js` → `_renderAssertions()`

La section "Inferred transitive assertions" liste les assertions sur individus inférées par application de la caractéristique `owl:TransitiveProperty`. Le rendu est identique à REQ-INF-009 (même fonction `_renderAssertions()` appelée avec un titre différent et la liste `transitive_assertions`). La section n'est pas rendue si la liste est vide.

---

### REQ-INF-011 — Affichage des assertions inférées par chaînes de propriétés et inverses
**Code source :** `inference_ui.js` → `_renderAssertions()`

La section "Assertions (chains + inverses)" liste les assertions sur individus inférées par application des chaînes de propriétés (`owl:propertyChainAxiom`) et des propriétés inverses. Le rendu est identique à REQ-INF-009 et REQ-INF-010 (même fonction `_renderAssertions()` appelée avec la liste `chain_assertions`). La section n'est pas rendue si la liste est vide.

---

### REQ-INF-012 — Affichage des restrictions inverses inférées sur les classes
**Code source :** `inference_ui.js` → `_renderInverseClassRestrictions()`

La section "Inferred inverse restrictions" affiche un tableau des restrictions existentielles inférées sur les classes par inversion de propriétés. La description de chaque restriction est construite sous la forme `∃<property>.<filler>` à partir des champs `r.property` et `r.filler`. Le tableau présente également la classe concernée (`i.class_id`) et la justification (`i.reason`). La section n'est pas rendue si la liste est vide.

---

### REQ-INF-013 — Affichage des propriétés inverses inférées par owl:inverseOf
**Code source :** `inference_ui.js` → `_renderInferredInverseProperties()`

La section "Inferred inverse properties" affiche un tableau des propriétés OWL inférées par symétrie de la relation `owl:inverseOf`. Pour chaque entrée, le tableau présente : la propriété inférée (`i.property_id`), la propriété dont elle est l'inverse (`i.inverse_of`), et la justification (`i.reason`). Si aucune propriété inverse n'est inférée, le message "No inverse inferred by owl:inverseOf symmetry." est affiché.

---

### REQ-INF-014 — Bouton de recalcul manuel des inférences
**Code source :** `inference_ui.js` → `render()`

L'en-tête du panneau contient un bouton "↻" dont le gestionnaire d'événement `onclick` appelle directement `InferenceUI.refresh()`. Ce bouton permet à l'utilisateur de déclencher manuellement un recalcul et un rechargement des inférences depuis le backend, indépendamment du cycle de rafraîchissement automatique.

---

### REQ-INF-015 — Sections rétractables (collapsible) pour les résultats d'inférence
**Code source :** `inference_ui.js` → `_renderSubclassClosure()`, `_renderInheritedRestrictions()`, `_renderInferredTypes()`, `_renderAssertions()`, `_renderInverseClassRestrictions()`, `_renderInferredInverseProperties()`

Toutes les sections de résultats contenant au moins un élément sont rendues avec la classe CSS `collapsible`. Un gestionnaire `onclick` sur l'élément de titre appelle `this.parentElement.classList.toggle('open')`, permettant à l'utilisateur de replier ou déplier chaque section individuellement. Un indicateur visuel `▶` (classe CSS `caret`) est affiché dans le titre.

---
