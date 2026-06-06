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

| **Si** | l'`ontologiste` consulte le panneau des `inférences`, |
|---|---|
| **Alors** | l'application récupère auprès du raisonneur l'ensemble des résultats calculés : violations de cohérence, fermeture de la hiérarchie, `restrictions` héritées, `restrictions` inverses, types inférés, assertions symétriques, transitives, par chaînes de `propriétés` et `propriétés` inverses. |

---

**Code source :** `api.js` → `getInferences()` — Effectue un appel HTTP GET vers l'endpoint `/api/inferences` et traite la réponse JSON contenant les champs `violations`, `subclass_closure`, `inherited_restrictions`, `inferred_inverse_restrictions`, `inferred_types`, `symmetric_assertions`, `transitive_assertions`, `chain_assertions` et `inferred_inverse_properties`.

### REQ-INF-002 — Rafraîchissement automatique du panneau

| **Si** | l'`ontologiste` navigue vers l'onglet des `inférences`, |
|---|---|
| **Alors** | le panneau se met à jour régulièrement de façon automatique, sans que l'utilisateur ait besoin d'intervenir, afin de refléter en permanence l'état courant du raisonnement sur l'`ontologie`. |

---

**Code source :** `inference_ui.js` → `startAutoRefresh()` — Arrête tout intervalle existant via `stopAutoRefresh()`, puis démarre un nouveau cycle `setInterval()` de 3 000 ms appelant `InferenceUI.refresh()` à chaque tick.

### REQ-INF-003 — Arrêt du rafraîchissement automatique

| **Si** | l'`ontologiste` quitte l'onglet des `inférences` ou qu'un nouveau cycle de rafraîchissement doit démarrer, |
|---|---|
| **Alors** | toute mise à jour automatique en cours est immédiatement interrompue, sans laisser de cycle résiduel actif en arrière-plan. |

---

**Code source :** `inference_ui.js` → `stopAutoRefresh()` — Appelle `clearInterval()` sur la référence interne `_autoRefresh` et remet cette référence à `null`.

### REQ-INF-016 — Gestion des erreurs lors de la récupération des inférences

| **Si** | la récupération des `inférences` auprès du raisonneur échoue, |
|---|---|
| **Alors** | l'`ontologiste` est informé de l'échec par un message d'erreur explicite affiché dans le panneau, et aucune donnée partielle ou obsolète n'est conservée à l'écran. |

---

**Code source :** `inference_ui.js` → `refresh()` — Le bloc `catch` intercepte l'exception, remplace le contenu de l'élément `#inference-panel` par un paragraphe de classe CSS `error` affichant `e.message`, sans conserver aucune donnée partielle.

---

## 2. Forme — Présentation et interface utilisateur

> Exigences relatives à l'affichage : layout, composants visuels, interactions, navigation, styles.

**Code source :** `inference_ui.js` → `refresh()`

### REQ-INF-004 — Affichage de l'état de cohérence de l'ontologie

| **Si** | l'`ontologiste` consulte le panneau des `inférences`, |
|---|---|
| **Alors** | l'en-tête du panneau indique clairement si l'`ontologie` est cohérente, en erreur ou porteuse d'avertissements, avec un indicateur visuel distinct pour chaque niveau de sévérité. |

---

**Code source :** `inference_ui.js` → `render()` — Génère un badge CSS `badge-error` "🔴 N error(s)" si des violations de sévérité `'error'` existent, un badge `badge-ok` "🟢 Consistent" en l'absence d'erreur, et un badge `badge-warn` "⚠️ N warning(s)" supplémentaire si des avertissements de sévérité `'warning'` sont présents.

### REQ-INF-005 — Affichage des violations de cohérence

| **Si** | le raisonneur a détecté des violations dans l'`ontologie`, |
|---|---|
| **Alors** | la section "Violations" les liste toutes, en distinguant visuellement les erreurs des avertissements et en identifiant pour chacune le concept ou l'entité concernée ainsi qu'une description du problème ; si aucune violation n'est détectée, un message le confirme explicitement. |

---

**Code source :** `inference_ui.js` → `_renderViolations()` — Pour chaque violation, affiche une icône de sévérité (🔴 pour `'error'`, 🟡 pour `'warning'`), l'identifiant `v.entity` formaté en `<code>` et le message `v.message` ; affiche "No violations detected." si la liste est vide.

### REQ-INF-006 — Affichage de la fermeture transitive de la hiérarchie de classes

| **Si** | l'`ontologie` contient des `classes` organisées en hiérarchie, |
|---|---|
| **Alors** | la section "Resolved hierarchy" présente pour chaque `classe` l'ensemble de ses ancêtres à tous les niveaux, permettant à l'`ontologiste` de visualiser d'un coup d'œil l'intégralité de la chaîne de spécialisation, sans avoir à remonter manuellement les relations une à une. |

---

**Code source :** `inference_ui.js` → `_renderSubclassClosure()` — Parcourt le champ `subclass_closure`, filtre les entrées sans ancêtres, et affiche pour chaque classe ses ancêtres formatés avec la classe CSS `tag-class` dans un tableau ; les entrées vides sont ignorées avant le rendu.

### REQ-INF-007 — Affichage des restrictions héritées par héritage de classes

| **Si** | des `restrictions` OWL ont été définies sur des `classes` parentes et propagées à leurs sous-`classes` par la hiérarchie, |
|---|---|
| **Alors** | la section "Inherited `restrictions`" indique pour chaque sous-`classe` quelles `restrictions` elle hérite, de quelle `classe` parente elles proviennent, et en quoi elles consistent, afin que l'`ontologiste` comprenne l'impact transitif de la hiérarchie sur les contraintes des `individus`. |

---

**Code source :** `inference_ui.js` → `_renderInheritedRestrictions()` — Pour chaque entrée du champ `inherited_restrictions`, affiche `r.class_id`, `r.inherited_from`, et une description construite à partir des champs `restr.type`, `restr.property`, `restr.filler` et `restr.cardinality`.

### REQ-INF-008 — Affichage des types inférés via domaine/portée des propriétés

| **Si** | des `individus` participent à des assertions de `propriétés` dont le domaine ou la portée est déclaré, |
|---|---|
| **Alors** | la section "Inferred types" liste les types que le raisonneur a attribués à ces `individus` par application des `axiomes` de domaine et de portée, en précisant pour chacun la justification qui a conduit à cette `inférence`. |

---

**Code source :** `inference_ui.js` → `_renderInferredTypes()` — Pour chaque entrée du champ `inferred_types`, affiche le label de l'individu résolu via `IndividualEditor._labelForId()` (avec l'IRI complet en attribut `title` si le label diffère), le type inféré `t.inferred_type` et la justification `t.reason`.

### REQ-INF-009 — Affichage des assertions symétriques inférées

| **Si** | l'`ontologie` déclare des `propriétés` symétriques et que des assertions existent sur ces `propriétés`, |
|---|---|
| **Alors** | la section "Inferred symmetric assertions" présente les assertions réciproques que le raisonneur a déduites, en indiquant les deux `individus` concernés, la `propriété` symétrique impliquée et la justification de l'`inférence`. |

---

**Code source :** `inference_ui.js` → `_renderAssertions()` — Pour chaque entrée de `symmetric_assertions`, affiche le label source résolu via `IndividualEditor._labelForId()`, la propriété `a.property`, le label cible résolu de même, et la justification `a.reason` ; la section n'est rendue que si la liste est non vide.

### REQ-INF-010 — Affichage des assertions transitives inférées

| **Si** | l'`ontologie` déclare des `propriétés` transitives et que des chaînes d'assertions directes existent entre `individus`, |
|---|---|
| **Alors** | la section "Inferred transitive assertions" présente les relations indirectes que le raisonneur a déduites par transitivité, avec le même niveau de détail que pour les assertions symétriques. |

---

**Code source :** `inference_ui.js` → `_renderAssertions()` — Identique à REQ-INF-009, avec le champ `transitive_assertions` comme source de données.

### REQ-INF-011 — Affichage des assertions inférées par chaînes de propriétés et inverses

| **Si** | l'`ontologie` définit des chaînes de `propriétés` ou des `propriétés` inverses et que les conditions d'application sont réunies, |
|---|---|
| **Alors** | la section "Assertions (chains + inverses)" présente les assertions que le raisonneur a déduites par composition de `propriétés` ou par inversion, avec le même niveau de détail que pour les assertions précédentes. |

---

**Code source :** `inference_ui.js` → `_renderAssertions()` — Identique à REQ-INF-009 et REQ-INF-010, avec le champ `chain_assertions` comme source de données.

### REQ-INF-012 — Affichage des restrictions inverses inférées sur les classes

| **Si** | des `propriétés` inverses ont permis au raisonneur de déduire des `restrictions` existentielles sur des `classes` qui n'en déclaraient pas explicitement, |
|---|---|
| **Alors** | la section "Inferred inverse `restrictions`" liste ces `restrictions` déduites, en identifiant la `classe` concernée, la nature de la `restriction` et la justification qui a permis de l'inférer. |

---

**Code source :** `inference_ui.js` → `_renderInverseClassRestrictions()` — Pour chaque entrée de `inferred_inverse_restrictions`, affiche `i.class_id`, la restriction sous la forme `∃<r.property>.<r.filler>`, et la justification `i.reason` ; la section n'est rendue que si la liste est non vide.

### REQ-INF-013 — Affichage des propriétés inverses inférées par owl:inverseOf

| **Si** | l'`ontologie` déclare des relations `owl:inverseOf` entre `propriétés`, |
|---|---|
| **Alors** | la section "Inferred inverse `properties`" liste les `propriétés` que le raisonneur a déduites par symétrie de cette relation, en précisant pour chacune de quelle `propriété` elle est l'inverse et pourquoi cette `inférence` est valide ; si aucune `propriété` inverse n'est inférée, un message le confirme explicitement. |

---

**Code source :** `inference_ui.js` → `_renderInferredInverseProperties()` — Pour chaque entrée de `inferred_inverse_properties`, affiche `i.property_id`, `i.inverse_of` et `i.reason` ; affiche "No inverse inferred by owl:inverseOf symmetry." si la liste est vide.

### REQ-INF-014 — Bouton de recalcul manuel des inférences

| **Si** | l'`ontologiste` souhaite forcer une mise à jour immédiate des résultats d'`inférence` sans attendre le prochain cycle automatique, |
|---|---|
| **Alors** | il peut déclencher un recalcul complet à la demande, et le panneau se met à jour instantanément avec les derniers résultats du raisonneur. |

---

**Code source :** `inference_ui.js` → `render()` — Le bouton "↻" affiché dans l'en-tête du panneau appelle `InferenceUI.refresh()` au clic, déclenchant un rechargement complet des inférences depuis le backend, indépendamment du cycle `setInterval`.

### REQ-INF-015 — Sections rétractables (collapsible) pour les résultats d'inférence

| **Si** | l'`ontologiste` veut se concentrer sur une catégorie d'`inférences` particulière, |
|---|---|
| **Alors** | il peut replier ou déplier chaque section de résultats individuellement en cliquant sur son titre, et un indicateur visuel signale l'état courant (replié ou déplié) de chaque section. |

---

**Code source :** `inference_ui.js` → `_renderSubclassClosure()`, `_renderInheritedRestrictions()`, `_renderInferredTypes()`, `_renderAssertions()`, `_renderInverseClassRestrictions()`, `_renderInferredInverseProperties()` — Chaque section est rendue avec la classe CSS `collapsible` et un `<span class="caret">▶</span>` dans le titre ; le clic bascule la classe CSS `open` sur l'élément parent via `this.parentElement.classList.toggle('open')`.
