# Skill : Assistant Ontologue SWOWL `/ontologue`

## Déclenchement
Invoque ce skill dès que l'utilisateur demande d'analyser un corpus documentaire dans SWOWL dans le but d'extraire de ce corpus une ontologie "complète", c'est à dire constitué d'un modèle métier OWL et de règles métiers SWRL. Ce skill est générique, c'est à dire qu'il ne dépends pas d'un domaine d'application particulier (droit, finance, médecine, industrie, finance, science, ...)

---

## Vue d'ensemble du protocole

```
Étape 0 → Contexte SWOWL (docs + ontologie active)
Étape 1 → Lecture et extraction du texte
Étape 2 → Passe de reconnaissance du domaine (premier survol)
Étape 3 → Découpage en chunks sémantiques
Étape 4 → Extraction OWL par chunk (format enrichi avec relations)
Étape 5 → Push progressif des chunks + signal done → merge automatique
Étape 6 → Règles SWRL (si contraintes explicites dans le texte)
Étape 7 → Résumé et conseils de raffinage
```

Toutes les relations (hiérarchie, domaines, ranges, types) sont encodées **dans les chunks** — le merge est complet en une seule passe, sans post-traitement manuel.

---

## Étape 0 — Contexte SWOWL

```bash
SWOWL=http://localhost:8001/api

# Documents corpus déclarés par l'utilisateur dans SWOWL
curl $SWOWL/analysis/docs
# → [{"name": "NomDoc", "location": "/chemin/vers/fichier.pdf"}, ...]

# Ontologie active (entités déjà présentes)
curl $SWOWL/classes
curl $SWOWL/object-properties
curl $SWOWL/individuals
```

**Vérifications :**
- Aucun document → informer l'utilisateur d'en ajouter dans l'onglet **Corpus** de SWOWL
- Aucune ontologie connectée → demander de créer/connecter une ontologie dans l'onglet **Ontologies**
- Entités déjà présentes → les prendre en compte pour éviter les doublons

Signaler le démarrage (active le polling du frontend) :
```bash
curl -X POST $SWOWL/analysis/clear \
  -H "Content-Type: application/json" \
  -d '{"docs": [{"name": "NomDoc", "location": "/chemin/fichier.pdf"}]}'
```

---

## Étape 1 — Extraction du texte

### PDF
```python
from pypdf import PdfReader

reader = PdfReader("/chemin/vers/document.pdf")
pages = []
for i, page in enumerate(reader.pages):
    text = page.extract_text() or ""
    if text.strip():
        pages.append({"page": i + 1, "text": text})

print(f"{len(pages)} pages extraites sur {len(reader.pages)}")
```

### Autres formats
- `.txt` / `.md` : lire directement (`Path(loc).read_text()`)
- `.docx` : utiliser `python-docx` (`doc.paragraphs`)
- Plusieurs documents : traiter chacun indépendamment, conserver `name` dans `ref.doc`

**Si des pages sont vides ou illisibles** (scan non-OCRisé) : le noter dans le résumé final.

---

## Étape 2 — Passe de reconnaissance du domaine

Avant d'extraire, faire un **survol rapide** des 3 à 5 premières pages + table des matières pour identifier :

| Question | Intérêt |
|---|---|
| Quel est le domaine principal ? | Calibre le vocabulaire OWL |
| Quels sont les concepts centraux ? | Futures classes racines |
| Y a-t-il des catégories explicites ? | Futures sous-classes |
| Y a-t-il des acteurs / parties prenantes ? | Futures classes ou individus |
| Y a-t-il des mesures / seuils / dates ? | Futures datatype properties |
| Y a-t-il des règles / contraintes explicites ? | Futures SWRL rules |
| Quelle est la langue du document ? | Labels/comments dans cette langue |

Cette passe prend 30 secondes et évite les incohérences de nommage entre les chunks.

---

## Étape 3 — Découpage en chunks sémantiques

**Critères de découpage :**
- Un chunk = une **unité conceptuelle cohérente** (article, section, annexe, chapitre)
- **300 à 800 mots** par chunk (ni trop petit = bruit, ni trop grand = perte de précision)
- Conserver le **titre de section** comme `chapter` dans la référence
- Les pages de garde, tables des matières, bibliographies → ignorer ou chunk séparé sans entités

**Exemples de découpages adaptés :**

| Type de document | Stratégie |
|---|---|
| Directive / Règlement | Par article (Art.1, Art.2…) puis par Annexe |
| Manuel technique | Par section (1.1, 1.2…) |
| Contrat | Par clause |
| Article scientifique | Introduction / Méthodes / Résultats / Discussion |
| Norme ISO | Par paragraphe numéroté |
| Roman / corpus littéraire | Par chapitre |

---

## Étape 4 — Extraction OWL par chunk

### Principes fondamentaux

- **Fidélité** : extraire uniquement ce qui est **explicitement présent** dans le texte, jamais des connaissances générales du domaine
- **Cohérence** : même concept = même ID dans **tous** les chunks
- **Minimalisme** : 20 classes précises valent mieux que 100 vagues
- **Singulier** : IDs toujours au singulier (`ElectricalDevice`, pas `ElectricalDevices`)
- **CamelCase anglais** : IDs en anglais CamelCase, labels/comments dans la langue du document
- **Traçabilité** : chaque entité doit apparaître dans au moins un chunk

### Format enrichi des `ids` (à utiliser systématiquement)

Le format enrichi encode les relations directement dans le chunk. Le merge backend les applique en une seule passe — aucun patch séparé nécessaire.

```json
{
  "ref":  {"doc": "NomDocument", "chapter": "Titre de section", "page": 4},
  "text": "Extrait du texte source (300 mots max, fidèle au document)",
  "ids": {
    "classes": [
      {
        "id":         "NomClasse",
        "label":      "Nom lisible en langue du document",
        "comment":    "Définition extraite du texte (citation directe si possible)",
        "subClassOf": ["ClasseParente"],
        "disjointWith": ["ClasseDisjointe"]
      }
    ],
    "object_properties": [
      {
        "id":      "nomPropriete",
        "label":   "nom lisible",
        "comment": "Sémantique de la relation (extrait du texte)",
        "domain":  ["ClasseDomaine"],
        "range":   ["ClasseRange"]
      }
    ],
    "datatype_properties": [
      {
        "id":      "nomAttribut",
        "label":   "nom lisible",
        "comment": "Unité, format, contrainte (extrait du texte)",
        "domain":  ["ClasseDomaine"],
        "range":   ["xsd:string"]
      }
    ],
    "individuals": [
      {
        "id":     "NomIndividu",
        "label":  "nom lisible",
        "comment":"Description ou valeur (extrait du texte)",
        "types":  ["ClasseDappartenance"]
      }
    ],
    "swrl_rules": []
  },
  "error": ""
}
```

### Types XSD pour les datatype properties

| Donnée | Type XSD |
|---|---|
| Texte libre | `xsd:string` |
| Entier | `xsd:integer` |
| Décimal / pourcentage / mesure | `xsd:decimal` |
| Date (YYYY-MM-DD) | `xsd:date` |
| Date+heure | `xsd:dateTime` |
| Durée | `xsd:duration` |
| Booléen | `xsd:boolean` |
| URL / URI | `xsd:anyURI` |

### Règles de nommage des IDs

| Entité | Convention | Exemples |
|---|---|---|
| Classe | Nom commun, CamelCase, singulier | `ElectricalDevice`, `ManufacturingProcess`, `ComplianceRequirement` |
| ObjectProperty | Verbe ou relation, lowerCamelCase | `isManufacturedBy`, `containsSubstance`, `hasExemption` |
| DatatypeProperty | Attribut + unité si pertinent, lowerCamelCase | `maxConcentration_pct`, `expiryDate`, `serialNumber` |
| Individual | Nom propre ou valeur spécifique, CamelCase | `Lead`, `ISO9001`, `CategoryA` |

### Surlignage dans l'onglet Analysis — règles de nommage critiques

L'onglet Analysis surligne les termes extraits directement dans le texte. L'algorithme de surlignage :
1. Convertit chaque ID CamelCase en phrase : `HazardousSubstance` → `"Hazardous Substance"`
2. Trie les phrases du plus long au plus court (les phrases priment sur les mots isolés)
3. Empêche le double-surlignage par détection des recouvrements

**Règle d'or : un concept multi-mots = un seul ID CamelCase**

| ❌ MAUVAIS | ✓ CORRECT | Résultat dans l'onglet |
|---|---|---|
| `Hazardous` + `Substance` (deux IDs) | `HazardousSubstance` (un ID) | ✅ Un seul surlignage continu |
| `Electrical` + `Electronic` + `Equipment` | `ElectricalElectronicEquipment` | ✅ "Electrical Electronic Equipment" surligné d'un trait |
| `Restricted` + `Substance` | `RestrictedSubstance` | ✅ Surlignage cohérent |

**Règle du label** : si le concept apparaît dans le texte sous une forme légèrement différente de l'ID CamelCase décomposé (ex : tiret, abréviation, acronyme), renseigner le `label` avec la forme exacte du texte :

```json
{
  "id": "ElectricalElectronicEquipment",
  "label": "EEE",
  "comment": "Electrical and Electronic Equipment as defined in Article 3"
}
```

→ Le frontend cherchera **à la fois** `"Electrical Electronic Equipment"` (depuis l'ID) et `"EEE"` (depuis le label) dans le texte.

**Longueur minimale** : les mots de 3 lettres ou moins et les mots courants (`the`, `and`, `for`, `with`, `that`, `this`, `from`…) sont automatiquement exclus du surlignage — ne pas créer d'IDs pour ces termes.

### Quoi extraire — guide par type d'entité

**Classes** — extraire quand :
- Le texte définit explicitement un concept ("On entend par X…", "X means…")
- Le texte mentionne des catégories ou types récurrents
- Le texte liste des acteurs / rôles / parties prenantes
- Le texte décrit des processus, états, ou artefacts nommés

**ObjectProperties** — extraire quand :
- Le texte décrit une relation entre deux concepts ("X doit être Y par Z", "A contient B")
- Un verbe relie deux noms qui sont déjà des classes

**DatatypeProperties** — extraire quand :
- Le texte mentionne une valeur mesurable, une date, un identifiant, un seuil
- Des unités ou formats sont précisés

**Individuals** — extraire quand :
- Le texte cite des instances **nommées et spécifiques** d'une classe
- Ex : substances précises, pays, standards, versions de produits

**Ne pas extraire :**
- Les connecteurs logiques (et, ou, si, alors)
- Les verbes génériques (être, avoir, faire)
- Les concepts trop vagues sans définition dans le texte
- Les informations qui relèvent du contexte général, pas du document

### Gestion des références croisées entre chunks

Tenir un **dictionnaire d'entités vues** qui s'enrichit chunk par chunk :
```python
seen_classes = set()       # IDs des classes déjà extraites
seen_ops     = set()       # ObjectProperties
seen_dps     = set()       # DatatypeProperties
seen_inds    = set()       # Individuals
```

- Si une entité est déjà connue → utiliser le même ID (ne pas re-créer)
- Si une entité est enrichie (nouvelle relation trouvée) → inclure l'objet enrichi dans le chunk courant avec les nouvelles relations seulement
- Le backend fait l'union des relations sur les entités existantes

---

## Étape 5 — Push des chunks et merge

### Push de chaque chunk
```bash
curl -X POST $SWOWL/analysis/chunk \
  -H "Content-Type: application/json" \
  -d '<chunk JSON complet>'
```

**Réponse attendue :** `{"ok": true, "total": N}` — N = nombre de chunks reçus depuis le dernier `clear`.

### Signal de fin (déclenche le merge complet)
```bash
curl -X POST $SWOWL/analysis/done
```

**Réponse :** `{"ok": true, "added": {"classes": N, "object_properties": N, ...}}`

Le backend effectue en une passe :
1. Création de toutes les entités nouvelles
2. Application de toutes les relations (subClassOf, domain, range, types, disjointWith)
3. Sauvegarde sur disque

**Aucun patch séparé n'est nécessaire si le format enrichi est utilisé.**

---

## Étape 6 — Règles SWRL

Créer une règle SWRL **uniquement** si le texte source contient une contrainte ou inférence **explicitement formulée** sous forme logique ("Si X alors Y", "Tout X qui est Y doit être Z", seuils numériques, etc.).

### Format des atomes

```json
{"type": "type_atom",     "var": "?x",  "class_id": "MaClasse"}
{"type": "property_atom", "subject": "?x", "property_id": "maProp", "object": "?y"}
{"type": "equality_atom", "var": "?x",  "operator": "<=", "value": "0.1"}
```

Opérateurs equality_atom : `=`, `!=`, `>`, `>=`, `<`, `<=`

### Exemple : contrainte de seuil
Texte source : *"The concentration of Lead shall not exceed 0.1% by weight"*

```json
{
  "id": "rule_lead_max_concentration",
  "label": "Lead max concentration 0.1%",
  "comment": "Article 4 + Annex II: Lead restricted to 0.1% by weight in homogeneous material",
  "body": [
    {"type": "type_atom",     "var": "?mat",  "class_id": "HomogeneousMaterial"},
    {"type": "property_atom", "subject": "?mat", "property_id": "containsSubstance", "object": "?sub"},
    {"type": "equality_atom", "var": "?sub",  "operator": "=", "value": "Lead"}
  ],
  "head": [
    {"type": "equality_atom", "var": "?mat", "operator": "<=", "value": "0.001"}
  ]
}
```

### Exemple : inférence de type
Texte source : *"An importer who places EEE under its own name shall be considered a manufacturer"*

```json
{
  "id": "rule_importer_as_manufacturer",
  "label": "Importer acting under own name = Manufacturer",
  "comment": "Article 11: importer placing EEE under own trademark is deemed a manufacturer",
  "body": [
    {"type": "type_atom",     "var": "?imp", "class_id": "Importer"},
    {"type": "property_atom", "subject": "?eee", "property_id": "isPlacedOnMarketBy", "object": "?imp"},
    {"type": "property_atom", "subject": "?eee", "property_id": "hasIdentification",  "object": "?_"}
  ],
  "head": [
    {"type": "type_atom", "var": "?imp", "class_id": "Manufacturer"}
  ]
}
```

Intégrer les règles SWRL directement dans les `ids.swrl_rules` du chunk concerné :
```json
"swrl_rules": [
  {
    "id": "rule_id",
    "label": "...",
    "comment": "...",
    "body": [...],
    "head": [...]
  }
]
```

---

## Étape 7 — Résumé et conseils de raffinage

À la fin de l'analyse, produire un résumé structuré :

```
✅ Analyse terminée — <N> chunks traités depuis <M> page(s)

ENTITÉS CRÉÉES
  Classes             : N  (dont N racines, N sous-classes)
  ObjectProperties    : N  (toutes avec domaine et range)
  DatatypeProperties  : N  (toutes avec domaine et type XSD)
  Individuals         : N  (tous typés)
  Règles SWRL         : N

QUALITÉ
  Hiérarchies détectées : [liste des axes principaux]
  Relations manquantes  : [OPs/DPs sans domaine ou range — à compléter manuellement]
  Ambiguïtés            : [concepts qui mériteraient clarification]

CONSEILS
  → Vérifier dans SWOWL l'onglet Classes : la hiérarchie est-elle cohérente ?
  → Vérifier l'onglet ObjectProperties : les domaines/ranges sont-ils corrects ?
  → Utiliser "🧹 Clean Duplicates" si des synonymes ont été extraits séparément
  → Compléter les labels en français/langue du document via l'éditeur SWOWL
```

---

## Anti-patterns à éviter

| ❌ À éviter | ✓ Correct |
|---|---|
| Extraire des concepts du domaine général non mentionnés dans le texte | Extraire uniquement ce qui est dans le texte |
| IDs au pluriel (`Substances`) | IDs au singulier (`Substance`) |
| IDs avec espaces ou accents | CamelCase sans caractères spéciaux |
| ObjectProperty sans domain ni range | Toujours renseigner domain et range si identifiables |
| Individu sans types | Toujours typer les individus |
| Règle SWRL vide (`body:[], head:[]`) | Ne créer que des règles avec contenu logique |
| Appeler `/api/analysis/done` avant de pousser tous les chunks | Tous les chunks d'abord, `done` en dernier |
| Patcher les relations via `PUT` après `done` | Encoder les relations dans les chunks (format enrichi) |
| Concept multi-mots → un ID par mot (`Hazardous` + `Substance`) | Un ID CamelCase (`HazardousSubstance`) → surlignage d'un seul trait |
| Ne pas renseigner `label` quand le texte utilise un acronyme | `"label": "EEE"` pour que `ElectricalElectronicEquipment` trouve "EEE" dans le texte |
