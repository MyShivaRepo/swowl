# Analyse par écart — SWOWL

## Résumé exécutif

| Onglet | Nb exigences | Nb écarts | Couverture % | Sévérité max |
|---|---|---|---|---|
| Ontologies | 54 | 29 | 46 % | CRITIQUE |
| Settings | 48 | 2 | 95,8 % | MINEUR |
| Classes | 102 | 4 | 96 % | MINEUR |
| ObjectProperties | 62 | 4 | 93,5 % | MAJEUR |
| DatatypeProperties | 58 | 5 | 91 % | MAJEUR |
| AnnotationProperties | 49 | 3 | 93,9 % | CRITIQUE |
| Individuals | 57 | 4 | 93 % | MAJEUR |
| SwrlRules | 56 | 3 | 96 % | MAJEUR |
| Views | 14 | 6 | 71 % | MAJEUR |
| Queries | 61 | 8 | 93 % | MAJEUR |
| Inferences | 53 | 4 | 94 % | MAJEUR |
| **TOTAL** | **614** | **72** | — | — |

**Score global de couverture (moyenne pondérée par nb exigences) :**

```
(54×0,46 + 48×0,958 + 102×0,96 + 62×0,935 + 58×0,91 + 49×0,939 + 57×0,93 + 56×0,96 + 14×0,71 + 61×0,93 + 53×0,94) / 614
≈ 539 / 614 ≈ 87,8 %
```

> L'onglet **Ontologies** (46 %) tire fortement le score vers le bas. Sans lui, la couverture globale des 10 autres onglets atteint **~93,5 %**.

---

## Écarts critiques (à traiter en priorité)

| Onglet | ID req | Description |
|---|---|---|
| Ontologies | REQ-ONT-012 | Les ontologies W3C (readonly) ne sont pas différenciées visuellement : pas d'étiquette "W3C", pas d'icône verrou, boutons ✏️ et ✕ affichés pour toutes les ontologies sans distinction. |
| Ontologies | REQ-ONT-027 | Seul le bouton "✨ New Ontology" est présent. Les boutons "📥 Import Ontology", "📂 Load Ontology" et "W3C Fetch W3C Ontologies" sont absents. |
| Ontologies | REQ-ONT-028 | Le comportement bascule (toggle) des wizards Import, Load et W3C n'est pas implémenté (les wizards n'existent pas). |
| Ontologies | REQ-ONT-043 | Le bouton "W3C Fetch W3C Ontologies" est absent ; aucun endpoint backend pour télécharger les ontologies RDF/RDFS/OWL depuis w3.org. |
| Ontologies | REQ-ONT-044 | Le mécanisme de désactivation du bouton W3C pendant le téléchargement n'est pas implémenté (bouton inexistant). |
| Ontologies | REQ-ONT-045 | Le stockage des ontologies W3C dans `~/.swowl/builtins/` et leur enregistrement en lecture seule ne sont pas implémentés. |
| AnnotationProperties | REQ-AP-015 | Le formulaire d'édition `_renderForm` est tronqué : `annoRows` est calculé mais jamais injecté dans le HTML. Le tableau d'annotations (labels, comments, other) est absent du rendu. |
| AnnotationProperties | REQ-AP-027 | Conséquence directe de REQ-AP-015 : l'utilisateur ne peut ni ajouter ni visualiser les annotations dans l'éditeur de propriétés d'annotation. |

---

## Écarts majeurs

| Onglet | ID req | Description |
|---|---|---|
| Ontologies | REQ-ONT-008 | Aucune logique de tri dans `_refreshOntoTable` : les ontologies readonly (W3C) ne sont pas placées après les ontologies utilisateur dans l'ordre OWL > RDFS > RDF. |
| Ontologies | REQ-ONT-009 | La classe CSS `onto-selected-row` n'est pas appliquée. Seule `onto-current-row` est utilisée pour l'ontologie connectée. |
| Ontologies | REQ-ONT-010 | Aucun gestionnaire `onclick` sur les `<tr>` du tableau pour sélectionner une ontologie. Les lignes ne sont pas cliquables pour la sélection. |
| Ontologies | REQ-ONT-015 | Aucune sous-ligne d'imports OWL n'est affichée dans la table. L'arbre des imports est entièrement absent de `_refreshOntoTable`. |
| Ontologies | REQ-ONT-016 | Le toggle ▶/▼ pour développer/replier les sous-imports n'est pas implémenté (dépend de REQ-ONT-015). |
| Ontologies | REQ-ONT-017 | L'ensemble `_ontoImportExpanded` pour mémoriser l'état d'expansion des sous-lignes n'existe pas dans le code. |
| Ontologies | REQ-ONT-019 | Aucune détection de cycles d'imports n'est implémentée (dépend de REQ-ONT-015). |
| Ontologies | REQ-ONT-023 | Export via deux boutons séparés "↓ OWL" / "↓ TTL" au lieu d'un menu déroulant unique "↓ Ontology". Nom de fichier générique `ontology.owl` au lieu de `{name}.owl`. |
| Ontologies | REQ-ONT-024 | Le bouton "↓ Rules" pour exporter les règles SWRL (JSON/SWORD) est totalement absent du frontend et du backend. |
| Ontologies | REQ-ONT-030 | La case à cocher "Connect immediately" est absente du formulaire New Ontology. |
| Ontologies | REQ-ONT-031 | Le wizard "Import Ontology" séparé n'existe pas. Le bouton "🔍 Read Prefix & URI from file" est absent. |
| Ontologies | REQ-ONT-032 | L'auto-détection du préfixe et de l'URI depuis le fichier source n'est pas implémentée dans le frontend. |
| Ontologies | REQ-ONT-033 | Le wizard "Load Ontology" (fichier `.json` interne SWOWL) est absent. Aucun endpoint `/api/ontologies/load`. |
| Ontologies | REQ-ONT-034 | Le bouton "🔍 Read info from file" du wizard Load Ontology est absent (wizard inexistant). |
| Ontologies | REQ-ONT-051 | Le préfixe de l'ontologie connectée n'est pas utilisé pour déterminer les racines virtuelles dans les éditeurs (logique `rdfs:Resource` / `owl:Thing` absente). |
| ObjectProperties | REQ-OP-021 | La sauvegarde via `onblur` quand `isNew=true` est inopérante en pratique : `_createAndSelect` crée la propriété avant le rendu du formulaire, rendant le chemin `onblur` inaccessible. |
| ObjectProperties | REQ-OP-037 | `buildChain` suit uniquement `parents[0]` : si une propriété a plusieurs parents, seule la première chaîne d'ascendance est remontée. |
| DatatypeProperties | REQ-DP-032 | Même défaut que REQ-OP-037 : `buildChain` ignore les parents multiples d'un nœud intermédiaire dans le panneau Super Properties. |
| Individuals | REQ-IND-018 | Le renommage d'un individu en backend ne déclenche pas `_rename_swrl_atom`. Les règles SWRL référençant l'individu par ID seront cassées après renommage. |
| SwrlRules | REQ-SWRL-003 | `_ruleHasBrokenRefs()` ne détecte pas les références d'individus supprimés dans les `equality_atom` : le bloc correspondant est présent mais neutralisé. Les règles cassées ne sont pas affichées en rouge. |
| Views | N/A | Un clic sur un nœud de classe dans le sous-onglet Knowledge Base navigue vers l'éditeur d'individus au lieu de l'éditeur de classes. |
| Views | N/A | L'encart "Where Used in Rules" (règles SWRL référençant l'entité éditée) est totalement absent des sous-onglets Views. |
| Views | N/A | Le filtre texte dans Ontology appelle `APP._hypDraw(false)` sur les nœuds non-correspondants, écrasant la surbrillance déjà appliquée. La mise en évidence des correspondances est instable. |
| Queries | REQ-QRY-049 | La variable `oddRows` (CSS de zebra striping) est construite dans `_renderResults()` mais jamais injectée dans un élément `<style>`. Le striping réel est absent. |
| Inferences | REQ-INF-029 | Les assertions transitives apparaissent dans deux sections simultanément (REQ-INF-028 et REQ-INF-029), créant une duplication non documentée. |
| Inferences | REQ-INF-053 | Le tri alphabétique des résultats de fermeture transitive n'est appliqué que dans `/api/inferences`. L'endpoint `/api/inferences/subclass-closure` retourne des sets Python sérialisés dans un ordre indéterminé. |

---

## Fonctionnalités non documentées (MANQUANT_EXIGENCE)

### Ontologies
- Fusion création + import dans un seul panneau "New Ontology" avec champ optionnel "Import from file" — non décrit dans les exigences (REQ-ONT-029 et REQ-ONT-031 prévoient des wizards séparés).

### Classes
- `createOPForClass()` / `createDTPForClass()` : création d'une ObjectProperty ou DatatypeProperty avec la classe sélectionnée comme domaine, directement depuis l'onglet Classes.
- `openNew()` : ouverture d'un formulaire de création vierge sans sélection préalable dans l'arbre.

### DatatypeProperties
- Case à cocher "Functional" (`owl:FunctionalProperty`) dans le formulaire de détail, non documentée dans REQ-DP-020 à REQ-DP-031.
- Cascade de renommage via `_cascade_rename_property` lors d'un PUT, non décrite dans REQ-DP-047 à REQ-DP-053.

### SwrlRules
- Redimensionneur horizontal entre les sections body et head du formulaire d'édition (`_initHResizers('swrl-detail')`), non documenté.

### Views
- Zoom/pan via `d3.zoom()` sur le graphe Knowledge Base.
- Filtre texte `_kbFilter` permettant de filtrer les individus dans le sous-onglet Knowledge Base.
- Légende de couleurs par classe (`#kb-legend`) dans le sous-onglet Knowledge Base.

### Queries
- Résolution de label enrichi pour les individus via `IndividualEditor._resolveDisplayLabel()` dans les cellules de résultats.
- Normalisation automatique du préfixe ontologie dans `_buildSparql()` (ajout de `#` si l'IRI de base ne se termine pas par `#` ou `/`).
- Gestion des propriétés orphelines (parents externes) dans `_propTreeItems()`.

---

## Recommandations

### 1. Corriger la troncature du formulaire AnnotationProperties (CRITIQUE — correctif rapide)
Le bug `_renderForm` dans `owl_editor.js` (APEditor) est un oubli d'injection de la variable `annoRows` dans le template HTML. Correction en quelques lignes ; impact utilisateur immédiat.

### 2. Implémenter les wizards manquants de l'onglet Ontologies (CRITIQUE — effort élevé)
Les boutons "📥 Import Ontology", "📂 Load Ontology" et "W3C Fetch W3C Ontologies" (REQ-ONT-027/028/031/032/033/034/043/044/045) constituent le plus grand bloc d'exigences non couvertes (8 exigences CRITIQUE/MAJEUR). Prioriser en sprint dédié.

### 3. Implémenter la différenciation visuelle des ontologies W3C readonly (CRITIQUE)
REQ-ONT-012 : ajouter l'étiquette "W3C", l'icône verrou et masquer les boutons ✏️ / ✕ pour les entrées readonly. Conditionner l'affichage des actions sur la propriété `readonly` de chaque ontologie.

### 4. Corriger la cascade SWRL lors du renommage d'un individu (MAJEUR — risque de données corrompues)
REQ-IND-018 : appeler `_rename_swrl_atom` dans le handler PUT `/api/individuals/{ind_id}` du backend, sur le modèle de `_cascade_rename_class`. Sans ce correctif, tout renommage d'individu casse silencieusement les règles SWRL le référençant.

### 5. Résoudre les défauts d'arbre des imports et de sélection de ligne dans l'onglet Ontologies (MAJEUR — fonctionnalité de navigation centrale)
REQ-ONT-008/009/010/015/016/017/019 forment un bloc cohérent : ajouter les gestionnaires `onclick` sur les `<tr>`, implémenter la classe `onto-selected-row`, et construire le rendu des sous-lignes d'imports avec toggle ▶/▼ et détection de cycles.

---

*claude-sonnet-4-6*
