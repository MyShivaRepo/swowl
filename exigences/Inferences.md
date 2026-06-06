# Exigences — Onglet « Inferences »

> Document généré par rétro-engineering du code source SWOWL · version 1.0 · 2026-06-06

---

## 1. Navigation et affichage général

- **REQ-INF-001** — L'onglet Inferences est optionnel et peut être masqué/affiché dans la navigation
  - *Si* Si l'onglet figure dans la liste _optional de APP, alors il peut être activé ou désactivé par l'utilisateur

- **REQ-INF-002** — L'onglet affiche le titre '🧠 Real-time Inferences' et un bouton de recalcul global
  - *Si* Si l'onglet est actif, alors le header contient le libellé et un bouton '↻ Recalculate'

- **REQ-INF-003** — Un message 'Loading…' est affiché dans le panneau pendant le chargement initial
  - *Si* Si la navigation vers l'onglet est déclenchée, alors le panneau affiche 'Loading…' avant la réponse de l'API

- **REQ-INF-004** — En cas d'erreur API, un message d'erreur est affiché dans le panneau d'inférences
  - *Si* Si l'appel à /api/inferences échoue, alors le panneau affiche le message d'erreur correspondant

- **REQ-INF-005** — L'onglet déclenche automatiquement un recalcul des inférences à l'activation
  - *Si* Si la section courante passe à 'inferences', alors InferenceUI.refresh() est appelé immédiatement

---

## 2. Rafraîchissement automatique et manuel

- **REQ-INF-006** — Le panneau se rafraîchit automatiquement toutes les 3 secondes lorsque l'onglet est actif
  - *Si* Si l'onglet Inferences est la section courante, alors InferenceUI.refresh() est appelé toutes les 3000 ms

- **REQ-INF-007** — Le rafraîchissement automatique ne se déclenche que si l'onglet Inferences est actif
  - *Si* Si APP.currentSection est différent de 'inferences', alors l'intervalle ne déclenche aucun appel API

- **REQ-INF-008** — Le rafraîchissement automatique est arrêté proprement avant d'en démarrer un nouveau
  - *Si* Si startAutoRefresh() est appelé, alors stopAutoRefresh() est d'abord appelé pour annuler l'intervalle existant

- **REQ-INF-009** — Un bouton '↻' dans le header du panneau permet un recalcul manuel immédiat
  - *Si* Si l'utilisateur clique sur le bouton '↻', alors InferenceUI.refresh() est appelé

---

## 3. Indicateur de cohérence et violations

- **REQ-INF-010** — Le header du panneau affiche un badge vert '🟢 Consistent' si aucune erreur n'est détectée
  - *Si* Si le nombre d'erreurs est zéro, alors le badge affiche 'badge-ok' avec l'icône verte

- **REQ-INF-011** — Le header affiche un badge rouge '🔴 N error(s)' si des erreurs sont présentes
  - *Si* Si le nombre d'erreurs est supérieur à zéro, alors le badge affiche 'badge-error' avec le compteur

- **REQ-INF-012** — Un badge orange '⚠️ N warning(s)' est affiché si des avertissements sont présents
  - *Si* Si le nombre d'avertissements est supérieur à zéro, alors un badge 'badge-warn' est ajouté dans le header

- **REQ-INF-013** — La section Violations affiche chaque violation avec son icône de sévérité, l'entité et le message
  - *Si* Si des violations existent, alors chaque ligne affiche '🔴' pour 'error' ou '🟡' pour 'warning', le code de l'entité et le texte du message

- **REQ-INF-014** — Si aucune violation n'est détectée, la section Violations affiche '✅ No violations detected.'
  - *Si* Si la liste violations est vide, alors la section affiche le message vide correspondant

- **REQ-INF-015** — Le backend détecte les violations de disjonction entre classes partagées par un individu
  - *Si* Si un individu est déclaré de type T1 et T2 avec T1 disjointWith T2, alors une violation 'error' est générée

- **REQ-INF-016** — Le backend détecte les violations de cohérence de domaine sur les propriétés objet
  - *Si* Si un individu utilise une propriété dont le domaine est D sans être de type D, alors une violation 'warning' est générée

- **REQ-INF-017** — Le backend détecte les violations de cardinalité exacte sur les classes
  - *Si* Si un individu de type C a un nombre de valeurs différent de la cardinalité exacte déclarée, alors une violation 'warning' est générée

- **REQ-INF-018** — Le backend détecte les violations de propriétés fonctionnelles
  - *Si* Si un individu a plus d'une valeur pour une propriété fonctionnelle, alors une violation 'error' est générée

- **REQ-INF-019** — Le backend détecte les violations de propriétés asymétriques
  - *Si* Si prop(A,B) et prop(B,A) coexistent pour une propriété asymétrique, alors une violation 'error' est générée

- **REQ-INF-020** — Le backend détecte les violations de propriétés irréflexives
  - *Si* Si prop(A,A) est déclaré pour une propriété irréflexive, alors une violation 'error' est générée

- **REQ-INF-021** — Le backend détecte les contradictions sameAs/differentFrom sur les individus
  - *Si* Si un individu est à la fois sameAs et differentFrom un autre individu, alors une violation 'error' est générée

---

## 4. Sections collapsibles et tableaux d'inférences

- **REQ-INF-022** — Les sections non-vides sont collapsibles via un clic sur leur titre
  - *Si* Si l'utilisateur clique sur le titre d'une section collapsible, alors la classe 'open' est basculée sur l'élément parent

- **REQ-INF-023** — Un indicateur visuel '▶' dans le titre signale les sections collapsibles
  - *Si* Si une section est collapsible, alors un élément span.caret contenant '▶' est affiché dans le titre

- **REQ-INF-024** — La section 'Resolved hierarchy' affiche la fermeture transitive de subClassOf sous forme de tableau
  - *Si* Si des classes ont des ancêtres, alors le tableau liste chaque classe et tous ses ancêtres avec un tag visuel

- **REQ-INF-025** — La section 'Inherited restrictions' affiche les restrictions héritées par chaque classe
  - *Si* Si des restrictions héritées existent, alors le tableau liste la classe, la classe source et la description de la restriction

- **REQ-INF-026** — La section 'Inferred types' affiche les types inférés via les domaines et ranges des propriétés
  - *Si* Si des types inférés existent, alors le tableau liste l'individu (avec son label si disponible), le type inféré et la raison

- **REQ-INF-027** — La section 'Inferred symmetric assertions' affiche les assertions symétriques déduites
  - *Si* Si des assertions symétriques existent, alors le tableau liste individu, propriété, cible et raison

- **REQ-INF-028** — La section 'Inferred transitive assertions' affiche les assertions transitives déduites
  - *Si* Si des assertions transitives existent, alors le tableau liste individu, propriété, cible et raison

- **REQ-INF-029** — La section 'Assertions (chains + inverses)' regroupe les assertions transitives, réflexives, en chaîne et inverses
  - *Si* Si le moteur produit des assertions combinées, alors elles sont toutes affichées dans cette section avec individu, propriété, cible et raison

- **REQ-INF-030** — La section 'Inferred inverse restrictions' affiche les restrictions inverses inférées au niveau classe
  - *Si* Si des restrictions inverses sont calculées, alors le tableau liste la classe, la restriction inférée (∃prop.filler) et la raison

- **REQ-INF-031** — La section 'Inferred inverse properties' affiche les symétries owl:inverseOf non déclarées explicitement
  - *Si* Si A inverseOf B est déclaré mais pas B inverseOf A, alors la propriété B est listée avec sa raison

- **REQ-INF-032** — Si une section est vide, un message 'No [entité] detected/inferred.' est affiché à la place du tableau
  - *Si* Si la liste de résultats d'une section est vide, alors la section affiche un paragraphe class='empty'

- **REQ-INF-033** — Les sections vides avec résultats zéro ne sont pas rendues (assertions symétriques, transitives et chaînes)
  - *Si* Si la liste d'assertions est vide, alors _renderAssertions retourne une chaîne vide et la section n'apparaît pas

---

## 5. Affichage des labels et identifiants

- **REQ-INF-034** — Les individus sont affichés avec leur label lisible plutôt que leur IRI brut
  - *Si* Si IndividualEditor._labelForId() retourne un label différent de l'IRI, alors le label est affiché et l'IRI est mis en attribut title

- **REQ-INF-035** — Les classes sont stylisées avec la classe CSS 'tag-class' pour les distinguer visuellement
  - *Si* Si un élément représente une classe OWL dans un tableau, alors il est rendu avec la classe 'tag-class'

- **REQ-INF-036** — Les propriétés sont stylisées avec la classe CSS 'tag-prop' pour les distinguer visuellement
  - *Si* Si un élément représente une propriété OWL dans un tableau, alors il est rendu avec la classe 'tag-prop'

- **REQ-INF-037** — Les restrictions sont stylisées avec la classe CSS 'tag-restr' pour les distinguer visuellement
  - *Si* Si un élément représente une restriction OWL dans un tableau, alors il est rendu avec la classe 'tag-restr'

- **REQ-INF-038** — Les restrictions inverses sont décrites avec la notation existentielle ∃prop.filler
  - *Si* Si une restriction inverse est affichée, alors son libellé est formaté comme '∃{property}.{filler}'

- **REQ-INF-039** — Les descriptions de restrictions héritées incluent type, propriété, filler et cardinalité si applicable
  - *Si* Si une restriction héritée a une cardinalité, alors elle est affichée sous la forme 'type(property . filler = cardinality)'

---

## 6. Moteur d'inférences backend

- **REQ-INF-040** — Le moteur calcule la fermeture transitive complète de subClassOf pour toutes les classes
  - *Si* Si la classe A est sous-classe de B et B sous-classe de C, alors A a C dans ses ancêtres calculés

- **REQ-INF-041** — Le moteur traite les équivalences de classes comme des sous-classes bilatérales
  - *Si* Si A equivalentClass B est déclaré, alors A ⊑ B et B ⊑ A sont ajoutés aux super-classes directes

- **REQ-INF-042** — Le moteur infère les types des individus via le domaine et le range des propriétés objet
  - *Si* Si un individu utilise une propriété avec domaine D, alors il est inféré de type D; si un individu est objet d'une propriété avec range R, alors il est inféré de type R

- **REQ-INF-043** — Le moteur calcule les assertions symétriques pour toutes les propriétés déclarées symmetric
  - *Si* Si prop(A,B) et prop est symmetric, alors l'assertion prop(B,A) est inférée

- **REQ-INF-044** — Le moteur calcule la fermeture transitive pour toutes les propriétés déclarées transitive
  - *Si* Si prop(A,B) et prop(B,C) et prop est transitive, alors prop(A,C) est inféré

- **REQ-INF-045** — Le moteur génère des assertions réflexives pour toutes les propriétés déclarées reflexive
  - *Si* Si prop est reflexive, alors prop(A,A) est inféré pour chaque individu A

- **REQ-INF-046** — Le moteur suit les chaînes de propriétés (propertyChainAxiom) de longueur arbitraire
  - *Si* Si p1 ∘ p2 → prop est déclaré et p1(A,B) et p2(B,C), alors prop(A,C) est inféré

- **REQ-INF-047** — Le moteur calcule les assertions inverses pour toutes les propriétés ayant un inverseOf déclaré
  - *Si* Si prop(A,B) et invProp = inverseOf(prop), alors invProp(B,A) est inféré

- **REQ-INF-048** — Le moteur infère la symétrie owl:inverseOf : si A inverseOf B est déclaré, B inverseOf A est inféré
  - *Si* Si prop_A inverseOf prop_B est déclaré et prop_B inverseOf prop_A ne l'est pas, alors l'inférence inverse est ajoutée

- **REQ-INF-049** — Le moteur infère des restrictions inverses au niveau classe depuis les restrictions someValuesFrom/allValuesFrom et inverseOf
  - *Si* Si C ⊑ ∃prop.D et prop inverseOf invProp, alors D ⊑ ∃invProp.C est inféré

- **REQ-INF-050** — Le backend lève une erreur 404 si aucune ontologie n'est chargée lors du calcul des inférences
  - *Si* Si aucune ontologie n'est présente en mémoire, alors l'API retourne HTTP 404 avec le message correspondant

- **REQ-INF-051** — Le backend expose un endpoint dédié /api/inferences/violations retournant uniquement les violations
  - *Si* Si /api/inferences/violations est appelé, alors seule la liste violations du résultat complet est retournée

- **REQ-INF-052** — Le backend expose un endpoint dédié /api/inferences/subclass-closure retournant uniquement la fermeture transitive
  - *Si* Si /api/inferences/subclass-closure est appelé, alors seul le dictionnaire de fermeture de subClassOf est retourné

- **REQ-INF-053** — Les résultats de fermeture transitive sont triés alphabétiquement dans la réponse API
  - *Si* Si la fermeture est retournée, alors les listes d'ancêtres sont triées via sorted()
