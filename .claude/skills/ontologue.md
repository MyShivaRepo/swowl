# Skill : Assistant Ontologue SWOWL

## Quand utiliser ce skill
Invoque ce skill (`/ontologue`) dès que l'utilisateur demande d'analyser un corpus et de peupler une ontologie SWOWL — quelle que soit la thématique (droit, médecine, industrie, science, etc.).

## Objectif
Extraire une ontologie OWL2 complète et cohérente depuis les documents du corpus SWOWL, en produisant des entités **avec leurs relations** (hiérarchie, types, domaines/ranges), puis les injecter dans l'ontologie active via l'API SWOWL.

---

## Protocole d'exécution

### Étape 0 — Contexte SWOWL
```bash
# Port du backend (Docker → host)
SWOWL_API=http://localhost:8001/api

# Récupérer les documents corpus et l'ontologie active
curl $SWOWL_API/analysis/docs      # [{name, location}]
curl $SWOWL_API/ontology/current   # nom + entités existantes
```
- Si aucun document → informer l'utilisateur d'en ajouter dans l'onglet **Corpus**.
- Si aucune ontologie connectée → demander à l'utilisateur d'en créer/connecter une.

Signaler le démarrage de l'analyse :
```bash
curl -X POST $SWOWL_API/analysis/clear \
  -H "Content-Type: application/json" \
  -d '{"docs": <liste_docs>}'
```

---

### Étape 1 — Extraction du texte
Pour chaque document `.pdf` du corpus, extraire le texte par page avec `pypdf` :
```python
from pypdf import PdfReader
reader = PdfReader("/chemin/vers/doc.pdf")
pages = [(i+1, page.extract_text() or "") for i, page in enumerate(reader.pages)]
```
Pour les fichiers `.txt` ou `.md`, lire directement.

---

### Étape 2 — Découpage en chunks sémantiques
Regrouper les pages en chunks **logiques** (par section, article, annexe, chapitre) plutôt que page par page. Critères :
- Un chunk = une unité conceptuelle cohérente (ex. un article de loi, une section de spec, un chapitre de manuel)
- Taille cible : 300–800 mots par chunk
- Conserver le titre de section comme `chapter` dans la référence

---

### Étape 3 — Extraction OWL par chunk (avec Claude)

Pour chaque chunk, analyser le texte et extraire les entités OWL **en contexte**, en tenant compte :
- Du domaine identifié (inféré du texte, pas présupposé)
- Des entités déjà extraites dans les chunks précédents (éviter les doublons)
- De la sémantique réelle du texte (pas de sur-extraction)

**Format des IDs** : CamelCase, sans espaces, sans caractères spéciaux (ex. `HazardousSubstance`, `isManufacturedBy`, `maxConcentrationByWeight_pct`).

**Entités à extraire par chunk** :

| Type | Critère d'inclusion |
|---|---|
| **Classes** | Concepts nommés, catégories, types d'entités du domaine |
| **ObjectProperties** | Relations entre classes (verbes, associations) |
| **DatatypeProperties** | Attributs scalaires (dates, mesures, chaînes, booléens) |
| **Individuals** | Instances nommées et identifiées (ex. substances spécifiques, standards) |

**Relations à capturer dès l'extraction** (pas en post-traitement) :

```python
# Pour chaque classe extraite, identifier :
{
  "id": "SousClasse",
  "subClassOf": ["SuperClasse"],   # si relation de spécialisation visible dans le texte
}

# Pour chaque ObjectProperty :
{
  "id": "nomPropriete",
  "domain": ["ClasseDomaine"],
  "range":  ["ClasseRange"],
}

# Pour chaque DatatypeProperty :
{
  "id": "nomAttribut",
  "domain": ["ClasseDomaine"],
  "range":  ["xsd:string"],        # ou xsd:integer, xsd:decimal, xsd:date, xsd:boolean
}

# Pour chaque Individual :
{
  "id": "NomIndividu",
  "types": ["ClasseDappartenance"],
}
```

---

### Étape 4 — Push des chunks

Pour chaque chunk traité :
```bash
curl -X POST $SWOWL_API/analysis/chunk \
  -H "Content-Type: application/json" \
  -d '{
    "ref":   {"doc": "<nom_doc>", "chapter": "<titre_section>", "page": <n>},
    "text":  "<extrait_texte_300_mots_max>",
    "ids": {
      "classes":              ["Id1", "Id2"],
      "object_properties":    ["propA"],
      "datatype_properties":  ["attrB"],
      "individuals":          ["IndC"],
      "swrl_rules":           []
    },
    "error": ""
  }'
```

> **Note** : `ids` contient uniquement des strings (les IDs). Les relations (subClassOf, domain, range, types) sont patchées à l'Étape 6.

---

### Étape 5 — Signal de fin (merge automatique)
```bash
curl -X POST $SWOWL_API/analysis/done
```
Le backend crée automatiquement toutes les entités dans l'ontologie.  
La réponse indique le nombre d'entités ajoutées par type.

---

### Étape 6 — Enrichissement des relations via l'API

Après le merge, patcher les relations sur les entités créées :

```bash
# Hiérarchie de classes
curl -X PUT $SWOWL_API/classes/<ClasseId> \
  -H "Content-Type: application/json" \
  -d '{"id": "ClasseId", "subClassOf": ["SuperClasseId"], ...}'

# Types des individus
curl -X PUT $SWOWL_API/individuals/<IndividuId> \
  -H "Content-Type: application/json" \
  -d '{"id": "IndividuId", "types": ["ClasseId"], ...}'

# Domaine et range des ObjectProperties
curl -X PUT $SWOWL_API/object-properties/<PropId> \
  -H "Content-Type: application/json" \
  -d '{"id": "PropId", "domain": ["ClasseDomaine"], "range": ["ClasseRange"]}'

# Domaine et range des DatatypeProperties
curl -X PUT $SWOWL_API/datatype-properties/<PropId> \
  -H "Content-Type: application/json" \
  -d '{"id": "PropId", "domain": ["ClasseDomaine"], "range": ["xsd:decimal"]}'
```

> **Stratégie** : ne patcher que les relations identifiées avec certitude dans le texte. Vaut mieux sous-extraire que sur-inventer.

---

### Étape 7 — Règles SWRL (optionnel)

Créer des règles SWRL uniquement si des contraintes ou inférences **explicitement formulées** dans le texte s'y prêtent.

Format des atomes :
```json
{"type": "type_atom",     "var": "?x",  "class_id": "MaClasse"}
{"type": "property_atom", "subject": "?x", "property_id": "maProp", "object": "?y"}
{"type": "equality_atom", "var": "?x",  "operator": "<=", "value": "0.1"}
```

```bash
curl -X POST $SWOWL_API/swrl-rules \
  -H "Content-Type: application/json" \
  -d '{"id": "rule_id", "label": "...", "comment": "...", "body": [...], "head": [...]}'
```

---

## Principes de qualité

- **Fidélité** : extraire ce qui est dans le texte, pas ce qu'on imagine du domaine
- **Cohérence** : un même concept = un seul ID dans toute l'ontologie
- **Minimalisme** : mieux vaut 20 classes précises que 100 classes vagues
- **Traçabilité** : chaque entité doit apparaître dans au moins un chunk (colonne WHERE EXTRACTED)
- **Pluriel** : les IDs sont au singulier (`ElectricalDevice`, pas `ElectricalDevices`)
- **Langue** : les IDs en anglais (CamelCase), les labels/comments dans la langue du document

## Signalement de fin

À la fin, résumer :
- Nombre de chunks traités
- Entités créées par type (classes / OPs / DPs / individus)
- Relations patchées (hiérarchie, domaines/ranges, types)
- Règles SWRL créées
- Éventuels problèmes rencontrés (pages illisibles, sections ambiguës)
