# Exigences — Import d'ontologies

> Généré le 2026-06-10 | Dérivé strictement du code source | Aucune hallucination

## Table des matières

### Fond
- [REQ-IMP-001 — Déclaration d'imports dans l'ontologie courante](#req-imp-001--déclaration-dimports-dans-lontologie-courante)
- [REQ-IMP-002 — Fusion des entités importées dans l'état de l'application](#req-imp-002--fusion-des-entités-importées-dans-létat-de-lapplication)
- [REQ-IMP-003 — Héritage des règles de nommage (display_rules)](#req-imp-003--héritage-des-règles-de-nommage-display_rules)
- [REQ-IMP-004 — Persistance : les entités importées ne sont pas sauvegardées localement](#req-imp-004--persistance--les-entités-importées-ne-sont-pas-sauvegardées-localement)
- [REQ-IMP-005 — Lecture seule : modification et suppression impossibles](#req-imp-005--lecture-seule--modification-et-suppression-impossibles)
- [REQ-IMP-011 — Import des annotations SKOS et autres propriétés d'annotation](#req-imp-011--import-des-annotations-skos-et-autres-propriétés-dannotation)
- [REQ-IMP-012 — Détection des Individuals typés par une classe utilisateur (style OWL 1 / Protégé)](#req-imp-012--détection-des-individuals-typés-par-une-classe-utilisateur-style-owl-1--protégé)
- [REQ-IMP-013 — Lecture de owl:equivalentClass à l'import](#req-imp-013--lecture-de-owlequivalentclass-à-limport)
- [REQ-IMP-014 — Ignorer les ranges DataRange anonymes des DatatypeProperties](#req-imp-014--ignorer-les-ranges-datarange-anonymes-des-datatypeproperties)
- [REQ-IMP-015 — Préfixage contextuel des entités issues des namespaces importés](#req-imp-015--préfixage-contextuel-des-entités-issues-des-namespaces-importés)
- [REQ-IMP-016 — Priorité de la base de l'ontologie sur les namespaces utilisateur](#req-imp-016--priorité-de-la-base-de-lontologie-sur-les-namespaces-utilisateur)
- [REQ-IMP-017 — Conversion des namespaces du wizard en owl:imports](#req-imp-017--conversion-des-namespaces-du-wizard-en-owlimports)
- [REQ-IMP-018 — Export : mapping des préfixes externes vers leur namespace](#req-imp-018--export--mapping-des-préfixes-externes-vers-leur-namespace)
- [REQ-IMP-019 — Export : types de données XSD pour les ranges et les littéraux](#req-imp-019--export--types-de-données-xsd-pour-les-ranges-et-les-littéraux)
- [REQ-IMP-020 — Export : owl:NamedIndividual uniquement pour les individus sans classe](#req-imp-020--export--owlnamedindividual-uniquement-pour-les-individus-sans-classe)
- [REQ-IMP-021 — Export : sérialisation RDF/XML plate](#req-imp-021--export--sérialisation-rdfxml-plate)

### Forme
- [REQ-IMP-006 — Style visuel atténué dans les listes et arbres](#req-imp-006--style-visuel-atténué-dans-les-listes-et-arbres)
- [REQ-IMP-007 — Nœuds racines des arbres : même style visuel que les entités importées](#req-imp-007--nœuds-racines-des-arbres--même-style-visuel-que-les-entités-importées)
- [REQ-IMP-008 — Panneau détail : bannière verrouillée et formulaire en lecture seule](#req-imp-008--panneau-détail--bannière-verrouillée-et-formulaire-en-lecture-seule)
- [REQ-IMP-009 — Références aux entités importées dans les panneaux de détail locaux](#req-imp-009--références-aux-entités-importées-dans-les-panneaux-de-détail-locaux)
- [REQ-IMP-010 — Menu contextuel des entités importées](#req-imp-010--menu-contextuel-des-entités-importées)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles de chargement, priorités, comportements algorithmiques, persistance.


### REQ-IMP-001 — Déclaration d'imports dans l'ontologie courante

| **Si** | l'ontologie courante déclare un ou plusieurs imports via son champ `imports`, |
|---|---|
| **Alors** | chaque import est identifié par un **préfixe** (ex. `plm`) et un **nom d'ontologie** (ex. `RoHS_Ontology`). Ces imports sont listés dans l'onglet **Ontologies** en lecture seule. |

**Code source :** `backend/main.py` → `GET /api/imported-entities` — lit le champ `imports` de l'ontologie courante, charge chaque ontologie référencée et en extrait les entités. `frontend/js/app.js` → `loadState()` — appelle `API.getImportedEntities()` après le chargement de l'ontologie courante.

---

### REQ-IMP-002 — Fusion des entités importées dans l'état de l'application

| **Si** | l'ontologie courante déclare des imports, |
|---|---|
| **Alors** | au chargement, le système fusionne dans `APP.state` les 7 types d'entités issus des ontologies importées : `classes`, `object_properties`, `datatype_properties`, `annotation_properties`, `individuals`, `swrl_rules` et `queries`. Chaque entité importée est taguée `_imported: true`, `_importPrefix` (préfixe) et `_importName` (nom de l'ontologie source). |

**Code source :** `backend/main.py` → `get_imported_entities()` — itère sur les 7 types d'entités et ajoute `{ "_imported": True, "_importPrefix": prefix, "_importName": name }` à chaque entité. `frontend/js/app.js` → `loadState()` — fusionne chaque collection : `this.state.classes = [...this.state.classes, ...(imp.classes || [])]` (idem pour les 6 autres types).

---

### REQ-IMP-003 — Héritage des règles de nommage (display_rules)

| **Si** | une ontologie importée définit des règles de nommage (`display_rules`), |
|---|---|
| **Alors** | ces règles sont copiées dans l'état de l'ontologie courante afin d'afficher correctement les noms des `Individual` de l'ontologie importée. En cas de conflit sur la même classe, les règles **locales ont la priorité** sur les règles importées. |

**Code source :** `backend/main.py` → `get_imported_entities()` — construit `result["display_rules"]` par fusion (première occurrence gagne). `frontend/js/app.js` → `loadState()` — fusionne avec `{ single: { ...(impDr.single), ...(local.single) }, multi: { ...(impDr.multi), ...(local.multi) } }` : les clés locales écrasent les importées.

---

### REQ-IMP-004 — Persistance : les entités importées ne sont pas sauvegardées localement

| **Si** | une opération de sauvegarde, d'annulation (undo) ou de rétablissement (redo) est effectuée, |
|---|---|
| **Alors** | les entités importées ne sont **pas stockées** dans le fichier de l'ontologie courante. Elles sont rechargées dynamiquement depuis le backend à chaque ouverture. Les snapshots undo/redo ne contiennent que les entités locales. |

**Code source :** `backend/main.py` → `PUT /api/ontology` — sauvegarde uniquement les données de l'ontologie courante, sans les entités importées. `frontend/js/app.js` → `UndoRedo._snap()` — sauvegarde uniquement les collections locales ; les entités importées sont rechargées via `loadState()` à chaque `APP.refresh()`.

---

### REQ-IMP-005 — Lecture seule : modification et suppression impossibles

| **Si** | l'utilisateur tente de modifier ou de supprimer une entité importée (formulaire, bouton de suppression ou menu contextuel), |
|---|---|
| **Alors** | l'action est bloquée : les champs du formulaire sont désactivés, le bouton de suppression est masqué dans la liste, et toute tentative programmatique de suppression affiche un message d'erreur. |

**Code source :** `owl_editor.js` → `_applyReadOnly(detail)` — désactive tous les `input, select, textarea, button` du panneau de détail. `SWRLEditor.delete()` et `SparqlEditor.deleteQuery()` — vérifient `entity._imported` et appellent `UI.error()` si vrai. `renderList()` de chaque éditeur — masque le bouton de suppression si `isImported`.

---

### REQ-IMP-011 — Import des annotations SKOS et autres propriétés d'annotation

| **Si** | une ontologie est importée (ex. un fichier Turtle/`.ttl`) et que ses entités portent des assertions de propriétés d'annotation au-delà de `rdfs:label` et `rdfs:comment`, |
|---|---|
| **Alors** | SWOWL importe également ces annotations supplémentaires et les rattache à chaque entité concernée. Sont reconnues notamment : les annotations **SKOS** (`skos:prefLabel`, `skos:altLabel`, `skos:hiddenLabel`, `skos:definition`, `skos:note`, `skos:scopeNote`, `skos:example`, `skos:editorialNote`, `skos:historyNote`, `skos:changeNote`), ainsi que `rdfs:seeAlso` (et les autres prédicats d'annotation reconnus). Ces annotations sont collectées par entité — `classes`, `object_properties`, `datatype_properties`, `annotation_properties`, `individuals` — dans le champ **« autres annotations »** de l'entité (`annotations.other`), chacune sous la forme d'un couple `{property, value}`, et sont affichées dans la section « annotations » du formulaire de l'entité. Les annotations **multi-valuées** (ex. plusieurs `skos:altLabel`) sont toutes conservées. |

**Note :** à titre d'exemple, l'import de l'ontologie « capital » fait désormais apparaître **53** annotations « other » qui étaient auparavant ignorées.

---

### REQ-IMP-012 — Détection des Individuals typés par une classe utilisateur (style OWL 1 / Protégé)

| **Si** | une ontologie importée déclare des individus à la manière OWL 1 / Protégé, c'est-à-dire `<MaClasse rdf:ID="x"/>` (soit `x rdf:type :MaClasse`), **sans** `owl:NamedIndividual` ni `owl:Thing`, |
|---|---|
| **Alors** | ces sujets sont désormais reconnus comme des `Individual`. En plus des sujets de type `owl:NamedIndividual` et `owl:Thing`, l'importeur collecte tout sujet URI dont le `rdf:type` est une classe définie par l'utilisateur (un sujet de `owl:Class` / `rdfs:Class`), en excluant les sujets qui sont eux-mêmes des entités structurelles OWL (classes, propriétés, etc.). L'individu est importé avec son type et ses assertions de données. |

**Note :** à titre d'exemple, l'import de l'ontologie RoHS fait désormais apparaître ses **7** instances de `Substance` (chromium, mercury, lead…) avec leur type et leurs assertions de données (`toleratesMaximumPercentage`).

**Code source :** `backend/triple_store.py` → `import_from_rdf` — en plus des sujets `owl:NamedIndividual` et `owl:Thing`, collecte chaque sujet URI dont le `rdf:type` est un sujet de `owl:Class` / `rdfs:Class`, à l'exclusion des sujets qui sont eux-mêmes des entités structurelles OWL (classes, propriétés, etc.).

---

### REQ-IMP-013 — Lecture de owl:equivalentClass à l'import

| **Si** | une classe d'une ontologie importée déclare une ou plusieurs assertions `owl:equivalentClass`, |
|---|---|
| **Alors** | l'importeur lit désormais `owl:equivalentClass` pour chaque classe (auparavant `equivalentClass` n'était écrit qu'à l'export et jamais relu). Une classe nommée devient un id ; un `owl:Restriction` anonyme devient un objet restriction (ex. `Assembly ≡ ∃ hasPart . Part` → une restriction `someValuesFrom` dans la liste `equivalentClass` de la classe), analysé de la même manière que les restrictions de `subClassOf`. |

**Code source :** `backend/triple_store.py` → `import_from_rdf` — lit `owl:equivalentClass` pour chaque classe : une classe nommée est ajoutée comme id, un `owl:Restriction` anonyme est analysé en objet restriction (même logique que `subClassOf`) et ajouté à la liste `equivalentClass` de la classe.

---

### REQ-IMP-014 — Ignorer les ranges DataRange anonymes des DatatypeProperties

| **Si** | une `DatatypeProperty` d'une ontologie importée déclare un `rdfs:range` qui est un `owl:DataRange` / `owl:oneOf` anonyme (type de données énuméré, ex. `{compliant, suspect, failed}`), |
|---|---|
| **Alors** | l'importeur ne conserve désormais que les ranges de type `URIRef` (URIs de types de données) et **ignore** les nœuds `DataRange` anonymes (auparavant un id de nœud anonyme dénué de sens apparaissait dans le range). Le type de données énuméré lui-même n'est pas modélisé dans le range de SWOWL, qui ne contient que des URIs de types de données. |

**Code source :** `backend/triple_store.py` → `import_from_rdf` — ne conserve que les ranges `rdfs:range` de type `URIRef` et ignore les nœuds `owl:DataRange` / `owl:oneOf` anonymes.

---

### REQ-IMP-015 — Préfixage contextuel des entités issues des namespaces importés

| **Si** | l'utilisateur a renseigné la table **« Imported namespaces »** d'un wizard (couples `préfixe → namespace`, ex. `plm → http://examples.org/plm`) et qu'une ontologie est importée, |
|---|---|
| **Alors** | cette table est transmise à l'import (paramètre `ns_prefixes`) et chaque entité dont l'URI appartient à un namespace mappé reçoit l'**identifiant local préfixé** par le préfixe contextuel choisi (ex. la classe `http://examples.org/plm#Foo` devient `plm:Foo`). Le préfixe affiché provient ainsi de la table saisie par l'utilisateur, et non d'un préfixe arbitraire du fichier source. |

**Code source :** `backend/triple_store.py` → `import_from_rdf(..., ns_prefixes=...)` reçoit la table `préfixe → namespace` ; la fonction interne `_lid` préfixe l'identifiant local d'une entité par le préfixe contextuel lorsque son URI appartient à un namespace mappé (ex. `plm:Foo`).

---

### REQ-IMP-016 — Priorité de la base de l'ontologie sur les namespaces utilisateur

| **Si** | une entité importée pourrait à la fois relever de la **base de l'ontologie** et d'un **namespace utilisateur** déclaré (cas où la base est un sur-ensemble d'un namespace importé, ex. base `http://examples.org/plm/data#` vs import `http://examples.org/plm`), |
|---|---|
| **Alors** | `_lid` teste l'appartenance de l'URI à la **base de l'ontologie AVANT** les namespaces déclarés par l'utilisateur. Les entités natives de la base restent donc des **identifiants locaux nus** (ex. `MyClass`) et ne sont pas préfixées à tort (ex. l'erreur `plm:/data#MyClass` est évitée). |

**Code source :** `backend/triple_store.py` → `import_from_rdf` / `_lid` — l'appartenance à la base de l'ontologie est testée avant les namespaces utilisateur ; les entités de la base produisent un id local nu, les entités d'un namespace mappé un id préfixé.

---

### REQ-IMP-017 — Conversion des namespaces du wizard en owl:imports

| **Si** | l'utilisateur déclare des namespaces via la table **« Imported namespaces »** d'un wizard, |
|---|---|
| **Alors** | ces namespaces sont aussi convertis en `owl:imports` accompagnés de leurs `import_labels` (préfixe contextuel), à la fois sur l'entrée de registre et dans le fichier `.json` de l'ontologie, afin que l'import soit réellement **résolu** et que les entités importées soient affichées en lecture seule (voir REQ-IMP-001 à REQ-IMP-005). |

**Code source :** `backend/triple_store.py` → helper `store._imports_from_ns` — convertit la table `ns_prefixes` en entrées `owl:imports` + `import_labels` (préfixe contextuel) sur l'entrée de registre et le `.json`.

---

### REQ-IMP-018 — Export : mapping des préfixes externes vers leur namespace

| **Si** | un identifiant d'entité porte un préfixe externe connu (`xsd:`, `owl:`, `rdfs:`, `rdf:`, `skos:`) lors de la sérialisation RDF, |
|---|---|
| **Alors** | l'export résout ce préfixe vers son **espace de noms standard**, **indépendamment du préfixe propre de l'ontologie**. La fonction interne `iri()` teste une table explicite `_EXT_PREFIX_NS` (`xsd:` → XSD, `owl:` → OWL, `rdfs:` → RDFS, `rdf:` → RDF, `skos:` → SKOS) avant de retomber sur l'espace de noms de l'ontologie. Cela corrige un bug survenant quand le préfixe de l'ontologie est **vide** : l'ancien test `startswith` produisait alors des IRIs malformés comme `<base>#xsd:string`. |

**Code source :** `backend/triple_store.py` → `to_rdf_graph` — la fonction interne `iri(local_id)` parcourt `_EXT_PREFIX_NS = {"xsd:": XSD, "owl:": OWL, "rdfs:": RDFS, "rdf:": RDF, "skos:": SKOS}` et renvoie `ns[local_id[len(pfx):]]` pour un préfixe correspondant ; sinon elle renvoie `NS[local_id]`.

---

### REQ-IMP-019 — Export : types de données XSD pour les ranges et les littéraux

| **Si** | une `DatatypeProperty` déclare un `rdfs:range` qui est un type de données XSD, ou une data assertion d'un `Individual` porte un `rdf:datatype`, et que la valeur stockée est nue (`string`) ou préfixée (`xsd:string`), |
|---|---|
| **Alors** | l'export émet le type de données dans l'**espace de noms XSD** (`http://www.w3.org/2001/XMLSchema#…`). Le helper `dt_iri` retire un préfixe `xsd:` éventuel et, lorsque le nom appartient à l'ensemble reconnu `_XSD_DATATYPES`, renvoie `XSD[name]`. Les data assertions sans type de données explicite retombent par défaut sur `xsd:string`. Cela évite l'apparition de classes fantômes telles que `#string`, `#date`, etc. à la ré-importation. |

**Code source :** `backend/triple_store.py` → l'ensemble `_XSD_DATATYPES` (niveau module) ; `to_rdf_graph` → la fonction interne `dt_iri(r)` utilisée pour le `RDFS.range` des DatatypeProperties (`g.add((uri_, RDFS.range, dt_iri(r)))`) et pour le `datatype` des littéraux des data assertions (`dt = dt_iri(da.datatype) if da.datatype else XSD.string`).

---

### REQ-IMP-020 — Export : owl:NamedIndividual uniquement pour les individus sans classe

| **Si** | un `Individual` est exporté, |
|---|---|
| **Alors** | `rdf:type owl:NamedIndividual` n'est **pas** émis lorsque l'individu possède déjà au moins une classe : il reste reconnu comme individu via son assertion `rdf:type <Classe>` (voir REQ-IMP-012). `owl:NamedIndividual` n'est émis **que** pour un individu ne possédant aucune classe. Cela évite l'affichage fantôme de « owl:NamedIndividual » comme classe dans Protégé. |

**Code source :** `backend/triple_store.py` → `to_rdf_graph` — `real_types = [t for t in ind.types if t and t != 'owl:NamedIndividual']` ; chaque type réel est ajouté en `rdf:type`, et `g.add((uri_, RDF.type, OWL.NamedIndividual))` ne s'exécute que dans le bloc `if not real_types:`.

---

### REQ-IMP-021 — Export : sérialisation RDF/XML plate

| **Si** | l'ontologie est exportée au format OWL/XML (RDF/XML), |
|---|---|
| **Alors** | le graphe est sérialisé avec le format rdflib **`xml`** (plat, standard) plutôt qu'avec le format déprécié **`pretty-xml`**, qui imbriquait les individus et générait des références `rdf:nodeID`. La sérialisation plate produit un fichier proprement ré-importable. |

**Code source :** `backend/serializers.py` → `export_owl_xml` — `return g.serialize(format="xml").encode("utf-8")` (graphe construit par `store.to_rdf_graph()`).

---

## 2. Forme — Règles d'interface et de présentation

> Exigences portant sur l'affichage, les icônes, l'ordre visuel et les interactions IHM.

---

### REQ-IMP-006 — Style visuel atténué dans les listes et arbres

| **Si** | une entité importée apparaît dans la liste ou l'arbre d'un onglet, |
|---|---|
| **Alors** | elle est affichée avec : (1) une **opacité atténuée** (`opacity: 0.5`), (2) un texte en **italique**, (3) son identifiant précédé du **préfixe d'import** (ex. `plm:Article`), (4) le **bouton de suppression masqué**. |

**Code source :** `style.css` → `.imported-entity { font-style: italic; opacity: 0.5; }` — règle CSS appliquée à tous les items importés. `owl_editor.js` → `ClassEditor._renderNode()`, `OPEditor._renderNode()`, `DPEditor._renderNode()`, `APEditor._renderUserNode()` — appliquent la classe CSS `imported-entity` et le préfixe si `entity._imported === true`. `swrl_editor.js` → `SWRLEditor.renderList()` et `sparql_editor.js` → `SparqlEditor.renderList()` — même logique pour les onglets SWRL Rules et Queries.

---

### REQ-IMP-007 — Nœuds racines des arbres : même style visuel que les entités importées

| **Si** | l'arbre des `Classes`, `ObjectProperties` ou `DatatypeProperties` est affiché, |
|---|---|
| **Alors** | le nœud racine (`owl:Thing`, `owl:topObjectProperty`, `owl:topDataProperty`) adopte le **même style visuel** que les entités importées : même opacité (`0.5`), même couleur de texte (`var(--text)`) et même couleur de dot que les items enfants réguliers. |

**Code source :** `style.css` → `.tree-root-item { color: var(--text); opacity: 0.5; }` — aligne la couleur et l'opacité du nœud racine sur les items enfants. `.tree-thing-dot { background: #b87333 }` — identique à `.cls-dot`. `.tree-op-top-dot { background: var(--accent) }` — identique à `.op-prop-dot`. `.tree-dp-top-dot { background: var(--accent2) }` — identique à `.dp-prop-dot`.

---

### REQ-IMP-008 — Panneau détail : bannière verrouillée et formulaire en lecture seule

| **Si** | l'utilisateur sélectionne une entité importée dans un onglet, |
|---|---|
| **Alors** | le panneau de détail affiche : (1) une **bannière 🔒** en haut indiquant le nom de l'ontologie source (ex. `🔒 Imported from RoHS_Ontology (plm:)`), (2) le contenu du formulaire avec une **opacité atténuée** (`0.55`), (3) tous les champs et boutons **désactivés**. |

**Code source :** `owl_editor.js` → `_importedBannerHtml(entity)` — génère le HTML de la bannière 🔒. `_applyImportedView(detail, entity, html)` — si `entity._imported`, injecte la bannière + le HTML, ajoute la classe CSS `is-imported-view` et appelle `_applyReadOnly(detail)`. `style.css` → `.is-imported-view > *:not(.imported-detail-banner) { opacity: 0.55; }` — atténue le contenu du formulaire sans affecter la bannière.

---

### REQ-IMP-009 — Références aux entités importées dans les panneaux de détail locaux

| **Si** | un panneau de détail d'une entité **locale** affiche des références vers des entités importées (valeur de propriété d'objet, membre de classe, propriété inférée, règle SWRL référencée), |
|---|---|
| **Alors** | chaque référence pointant vers une entité importée est affichée avec le style atténué (`opacity: 0.5`, italique). Ceci s'applique aux assertions de propriétés d'objet sur les `Individual`, aux propriétés inférées, et aux sections **"Where Used In Rules"** des onglets `Classes`, `ObjectProperties`, `DatatypeProperties` et `Individuals`. |

**Code source :** `owl_editor.js` → `_markImportedRefs(container)` — construit un `Set` de tous les IDs importés et ajoute la classe CSS `imported-entity` à tout `[data-id]` correspondant dans le panneau. Les assertions OP sur `Individual` incluent `data-id="${target}"` et `_renderInferredPanel()` ajoute `data-id="${value}"` sur les lignes de type `op` pour permettre la détection. `_whereUsedFrame()` — ajoute directement la classe `imported-entity` et le préfixe sur les items de règles SWRL importées.

---

### REQ-IMP-010 — Menu contextuel des entités importées

| **Si** | l'utilisateur ouvre le menu contextuel (clic droit) sur une entité importée, |
|---|---|
| **Alors** | le menu affiche une icône 🔒 suivie du nom de l'ontologie source (ex. `🔒 Imported from RoHS_Ontology (plm:)`), sans proposer d'actions de modification ni de suppression. |

**Code source :** `owl_editor.js` → `ClassEditor.showContextMenu()`, `OPEditor.showContextMenu()`, `DPEditor.showContextMenu()` — vérifient `isImported` et remplacent les items d'action par `<div>🔒 Imported from ${entity._importName}</div>`. `swrl_editor.js` → `SWRLEditor.showContextMenu()` et `sparql_editor.js` → `SparqlEditor.showContextMenu()` — même logique sur `rule._imported` / `query._imported`.

---