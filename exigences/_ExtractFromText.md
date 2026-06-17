# Exigences — Extract from Text (onglets LLMs, Corpus, Analysis)

> Généré le 2026-06-17 | Dérivé strictement du code source | Aucune hallucination

## Table des matières

### Fond
- [REQ-EFT-001 — Gestion du corpus de documents](#req-eft-001--gestion-du-corpus-de-documents)
- [REQ-EFT-002 — Configuration du LLM (provider, modèle, clé API)](#req-eft-002--configuration-du-llm-provider-modèle-clé-api)
- [REQ-EFT-003 — Analyse du corpus via le LLM sélectionné](#req-eft-003--analyse-du-corpus-via-le-llm-sélectionné)
- [REQ-EFT-004 — Analyse du corpus via Claude Code CLI](#req-eft-004--analyse-du-corpus-via-claude-code-cli)
- [REQ-EFT-005 — Extraction et création des entités OWL](#req-eft-005--extraction-et-création-des-entités-owl)
- [REQ-EFT-006 — Extraction et création des règles SWRL](#req-eft-006--extraction-et-création-des-règles-swrl)
- [REQ-EFT-007 — Déduplication des entités extraites](#req-eft-007--déduplication-des-entités-extraites)
- [REQ-EFT-008 — Traçabilité de la provenance (WHERE EXTRACTED)](#req-eft-008--traçabilité-de-la-provenance-where-extracted)
- [REQ-EFT-009 — Annotation `swowl:candidate` des entités extraites](#req-eft-009--annotation-swowlcandidate-des-entités-extraites)
- [REQ-EFT-010 — Limite du corpus analysé](#req-eft-010--limite-du-corpus-analysé)
- [REQ-EFT-011 — Polling frontend pour l'analyse Claude Code](#req-eft-011--polling-frontend-pour-lanalyse-claude-code)

### Forme
- [REQ-EFT-012 — Onglet LLMs : configuration du fournisseur](#req-eft-012--onglet-llms--configuration-du-fournisseur)
- [REQ-EFT-013 — Onglet Corpus : gestion de la liste de documents](#req-eft-013--onglet-corpus--gestion-de-la-liste-de-documents)
- [REQ-EFT-014 — Onglet Corpus : boutons d'action et case à cocher](#req-eft-014--onglet-corpus--boutons-daction-et-case-à-cocher)
- [REQ-EFT-015 — Onglet Analysis : tableau des chunks](#req-eft-015--onglet-analysis--tableau-des-chunks)
- [REQ-EFT-016 — Label unique des chunks](#req-eft-016--label-unique-des-chunks)
- [REQ-EFT-017 — Sur-lignage des termes dans TEXT EXTRACT](#req-eft-017--sur-lignage-des-termes-dans-text-extract)
- [REQ-EFT-018 — Icônes par type d'entité dans EXTRACTED ELEMENTS](#req-eft-018--icônes-par-type-dentité-dans-extracted-elements)
- [REQ-EFT-019 — Panel WHERE EXTRACTED sur les fiches d'entités](#req-eft-019--panel-where-extracted-sur-les-fiches-dentités)
- [REQ-EFT-020 — Navigation depuis WHERE EXTRACTED vers le chunk source](#req-eft-020--navigation-depuis-where-extracted-vers-le-chunk-source)

---

## 1. Fond — Règles métier et logique fonctionnelle

> Exigences indépendantes de l'IHM : règles d'extraction, de déduplication et de traçabilité.

---

### REQ-EFT-001 — Gestion du corpus de documents

| **Si** | l'utilisateur ajoute un document dans l'onglet **Corpus** (URL Web ou chemin local), |
|---|---|
| **Alors** | le document est enregistré avec un nom (`name`) et une localisation (`location`) dans la liste du corpus, persistée dans le `localStorage` de l'ontologie courante. Chaque document peut être édité ou supprimé individuellement. Le corpus est propre à chaque ontologie connectée. |

**Code source :** `app.js` → `APP._corpusDocs()`, `APP._corpusAdd()`, `APP._corpusSave()` — Le corpus est sérialisé dans `localStorage` sous la clé `swowl_corpus_<ontologyId>`. `_corpusDocs()` retourne la liste courante. `_corpusAdd()` ajoute une entrée `{ name, location }` vide, `_corpusSave(i)` valide l'édition inline.

---

### REQ-EFT-002 — Configuration du LLM (provider, modèle, clé API)

| **Si** | l'utilisateur configure un fournisseur LLM dans l'onglet **LLMs**, |
|---|---|
| **Alors** | le système enregistre le provider (`anthropic`, `openai`, `meta`), le modèle, la clé API et l'URL de base (pour Ollama local) dans le `localStorage`. Cette configuration est réutilisée à chaque analyse. Un bouton **Test** valide la clé API avant usage. |

**Code source :** `app.js` → `APP._llmConfig()`, `APP._llmSave()`, `APP._llmTest()` — La configuration est stockée dans `localStorage` sous la clé `swowl_llm_config`. `_llmTest()` appelle `API.testLlmKey(provider, api_key, base_url)` et affiche le résultat. `frontend/js/api.js` → `API.testLlmKey()` → `POST /api/llm/test`.

---

### REQ-EFT-003 — Analyse du corpus via le LLM sélectionné

| **Si** | l'utilisateur clique sur **🔬 Analyse with selected LLM**, |
|---|---|
| **Alors** | le backend envoie chaque chunk de chaque document au LLM configuré (Anthropic, OpenAI ou Ollama) via un prompt d'extraction OWL. Le LLM répond avec un objet JSON structuré contenant des `classes`, `object_properties`, `datatype_properties`, `individuals` et `swrl_rules`. Chaque entité nouvelle est ajoutée à l'ontologie en temps réel via SSE (Server-Sent Events). À la fin, la provenance complète est sauvegardée. |

**Code source :** `app.js` → `APP._corpusAnalyse()` — Lit la config LLM dans `localStorage`, appelle `API.analyseCorpus(api_key, model, documents, system_prompt)`. Consomme le flux SSE : chaque événement `chunk` met à jour le statut ; l'événement `done` appelle `_analysisSave(provenance, errors)`. `backend/corpus_analyzer.py` → `_analyse_chunk()`, `_call_anthropic()`, `_call_openai_compat()` — Découpe les documents en chunks (max 6 000 caractères), appelle le LLM, parse la réponse JSON. `backend/main.py` → `POST /api/corpus/analyse` — Fusionne les entités extraites dans l'ontologie via `_merge_chunk()`.

---

### REQ-EFT-004 — Analyse du corpus via Claude Code CLI

| **Si** | l'utilisateur clique sur **🤖 Analyse with Claude Code**, |
|---|---|
| **Alors** | le frontend notifie l'utilisateur de démarrer manuellement l'analyse dans Claude Code CLI. Claude Code pousse les chunks extraits un à un via `POST /api/analysis/chunk`. Le frontend interroge `GET /api/analysis/chunks` toutes les 2 secondes (polling) ; lorsque `POST /api/analysis/done` est reçu, le frontend consolide la provenance et sauvegarde l'analyse. |

**Code source :** `app.js` → `APP._claudeCodeAnalyse()` — Appelle `API.clearAnalysis(docs)` pour réinitialiser le store backend et transmettre la liste des documents. Démarre `_ccStartPolling()` qui appelle `_ccPoll()` toutes les 2 secondes. `_ccPoll()` appelle `API.getAnalysisChunks()` ; quand `running === false`, appelle `_analysisSave(_ccBuildProv(chunks), [])`. `backend/main.py` → `POST /api/analysis/clear|chunk|done`, `GET /api/analysis/chunks|docs` — Store en mémoire `_cc_chunks`, `_cc_state`, `_cc_docs` protégé par `_cc_lock`.

---

### REQ-EFT-005 — Extraction et création des entités OWL

| **Si** | le LLM (ou Claude Code) retourne un chunk contenant des entités OWL, |
|---|---|
| **Alors** | pour chaque entité nouvelle (non déjà présente dans l'ontologie), le système crée la classe, propriété ou individu avec ses annotations, son domaine, son range et ses super-classes. Les entités déjà existantes ne sont pas recréées ni modifiées ; seule leur provenance est enregistrée. |

**Code source :** `backend/main.py` → `_merge_chunk()` — Maintient des ensembles `cset`, `opset`, `dpset`, `iset`, `rset` des IDs existants. Pour chaque entité retournée par le LLM : si `id not in set`, crée l'entité via `OWLClass.model_validate(...)` / `OWLObjectProperty.model_validate(...)` etc., l'ajoute à `onto.<collection>` et à l'ensemble, et l'ajoute à `ids_by_kind` (seules les entités nouvelles). `app.js` → `APP._ccBuildProv(chunks)` — Pour l'analyse Claude Code, construit la provenance à partir des chunks reçus via le mapping `KIND_MAP = { classes: 'class', object_properties: 'op', datatype_properties: 'dp', individuals: 'individual', swrl_rules: 'swrl_rule' }`.

---

### REQ-EFT-006 — Extraction et création des règles SWRL

| **Si** | le LLM retourne des règles SWRL dans un chunk, |
|---|---|
| **Alors** | chaque règle est validée via `SWRLRule.model_validate()` et ajoutée à l'ontologie si son ID est nouveau. Les atomes SWRL acceptés sont : `type_atom { var, class_id }`, `property_atom { subject, property_id, object }` et `equality_atom { var, operator, value }`. En cas d'erreur de validation (structure d'atome invalide), la règle est silencieusement ignorée. |

**Code source :** `backend/main.py` → `_merge_chunk()`, bloc `swrl_rules` — Appelle `SWRLRule.model_validate({ id, label, comment, body, head })` dans un bloc `try/except` ; en cas d'échec, l'exception est absorbée (`pass`). `backend/owl_model.py` → `SWRLRule`, `SWRLTypeAtom`, `SWRLPropertyAtom`, `SWRLEqualityAtom`.

---

### REQ-EFT-007 — Déduplication des entités extraites

| **Si** | l'utilisateur clique sur **🧹 Clean Duplicates**, |
|---|---|
| **Alors** | le système détecte les entités doublon (correspondance exacte, insensible à la casse, ou forme plurielle) par type (`classes`, `object_properties`, `datatype_properties`, `individuals`) et propose à l'utilisateur de les fusionner : l'entité canonique est conservée, les alias sont supprimés et toutes les références internes sont redirigées vers l'entité conservée. |

**Code source :** `app.js` → `APP._corpusDedupe()` — Appelle `API.getDuplicates()` puis `API.mergeDuplicates(body)`. `backend/main.py` → `GET /api/ontology/duplicates`, `POST /api/ontology/merge-duplicates` → `_apply_merge()` — Rewire toutes les références (`subClassOf`, `domain`, `range`, `types`, etc.) vers l'ID canonique, puis supprime les doublons de `onto.<collection>`.

---

### REQ-EFT-008 — Traçabilité de la provenance (WHERE EXTRACTED)

| **Si** | une entité est extraite d'un chunk, |
|---|---|
| **Alors** | le système enregistre sa provenance sous la forme `{ id, kind, label, sections: [{ doc, chapter, page }] }`. Chaque entité peut être référencée par plusieurs chunks (sections). Cette provenance est persistée dans le `localStorage` de l'ontologie et affichée dans un panel **WHERE EXTRACTED** sur la fiche de chaque entité (classe, OP, DP, individu, règle SWRL). |

**Code source :** `backend/main.py` → `_record(kind, eid, label, ref)` — Alimente le dictionnaire `prov` ; `ref` = `{ doc, chapter, page }`. La provenance est émise dans l'événement SSE `done` : `{ provenance: list(prov.values()) }`. `app.js` → `APP._analysisSave(prov, errors)` — Persiste `{ provenance, chunks, errors }` dans `localStorage` sous `swowl_analysis_<ontologyId>`. `frontend/js/owl_editor.js` → `_whereExtractedFrame(kind, id)` — Lit la provenance depuis `APP._analysisData()` et génère le panel HTML.

---

### REQ-EFT-009 — Annotation `swowl:candidate` des entités extraites

| **Si** | la case **Add Annotation Property `swowl:candidate`** est cochée (comportement par défaut) lors d'une analyse LLM, |
|---|---|
| **Alors** | chaque entité créée par l'analyse reçoit automatiquement l'annotation `swowl:candidate` avec la valeur `"corpus"` dans ses `other` annotations. Cette annotation permet de distinguer les entités candidates (extraites automatiquement) des entités validées manuellement. |

**Code source :** `backend/main.py` → `_anno(label, comment)` — Retourne `{ labels, comments, other: [{ property: "swowl:candidate", value: "corpus" }] }`. Utilisé lors de la création de toutes les entités dans `_merge_chunk()`. `app.js` → `APP._corpusCandidateFlag` (booléen, `true` par défaut) — Contrôlé par la case à cocher `#corpus-candidate-chk`.

---

### REQ-EFT-010 — Limite du corpus analysé

| **Si** | le corpus contient plus de 40 chunks au total (toutes pages et tous documents confondus), |
|---|---|
| **Alors** | seuls les 40 premiers chunks sont soumis au LLM ; les chunks suivants sont ignorés et une erreur `"Corpus truncated to 40 chunks"` est ajoutée à la liste des erreurs du rapport d'analyse. |

**Code source :** `backend/corpus_analyzer.py` → `MAX_CHUNKS = 40` — `work = [c for c in all_chunks[:MAX_CHUNKS] if c["text"].strip()]`. Si `len(all_chunks) > MAX_CHUNKS`, ajoute `{ doc: "*", error: f"Corpus truncated to {MAX_CHUNKS} chunks." }` aux erreurs.

---

### REQ-EFT-011 — Polling frontend pour l'analyse Claude Code

| **Si** | une analyse Claude Code est en cours (démarrée par `_claudeCodeAnalyse()`), |
|---|---|
| **Alors** | le frontend interroge `GET /api/analysis/chunks` toutes les 2 secondes. À chaque réponse, le statut affiché est mis à jour avec le nombre de chunks reçus. Lorsque `running === false`, le polling s'arrête, la provenance est calculée via `_ccBuildProv()` et l'analyse est sauvegardée. Le store backend est réinitialisé avant chaque nouvelle analyse via `POST /api/analysis/clear`. |

**Code source :** `app.js` → `APP._ccStartPolling()` — `setInterval(_ccPoll, 2000)`. `_ccPoll()` — Appelle `API.getAnalysisChunks()` ; si `!data.running`, appelle `clearInterval`, puis `_analysisSave(_ccBuildProv(chunks), [])`. `APP._ccBuildProv(chunks)` — Construit `[{ id, kind, label, sections }]` à partir des `ids` de chaque chunk.

---

## 2. Forme — Règles d'interface et de présentation

> Exigences portant sur l'affichage, les contrôles et les interactions IHM des onglets LLMs, Corpus et Analysis.

---

### REQ-EFT-012 — Onglet LLMs : configuration du fournisseur

| **Si** | l'utilisateur ouvre l'onglet **LLMs**, |
|---|---|
| **Alors** | l'interface affiche : un sélecteur de provider (`Anthropic`, `OpenAI`, `Meta/Llama`), un champ de saisie du modèle, un champ de clé API (masqué), un champ URL de base (pour Ollama), un bouton **Test** qui valide la clé, et un éditeur du prompt système personnalisable. Le prompt système par défaut est chargé depuis `GET /api/corpus/prompt`. |

**Code source :** `app.js` → `APP._renderLLMs()` — Génère le formulaire de configuration. `APP._llmTest()` → `API.testLlmKey()` → `POST /api/llm/test`. `APP._llmSave()` persiste dans `localStorage`. `APP._renderCorpusPrompt()` charge le prompt via `API.getCorpusPrompt()` → `GET /api/corpus/prompt`.

---

### REQ-EFT-013 — Onglet Corpus : gestion de la liste de documents

| **Si** | l'utilisateur ouvre l'onglet **Corpus**, |
|---|---|
| **Alors** | l'interface affiche un tableau des documents du corpus avec trois colonnes : **Name** (nom lisible), **Location** (URL ou chemin local), et une colonne d'actions (bouton 🗑 suppression). Chaque cellule `Name` et `Location` est éditable en ligne par double-clic. En bas du tableau, un formulaire d'ajout permet de saisir un nouveau nom et une nouvelle localisation, avec un bouton **📂 Browse…** pour parcourir le système de fichiers local. |

**Code source :** `app.js` → `APP._renderCorpus()` — Génère le tableau HTML avec `rows` = liste des documents. `APP._corpusEditStart(i)` / `APP._corpusEditSave(i)` — Édition inline. `APP._corpusDelete(i)` — Suppression. `APP._corpusBrowse()` → `API.fsBrowse()` → `GET /api/fs/browse` — Ouverture du sélecteur de fichier.

---

### REQ-EFT-014 — Onglet Corpus : boutons d'action et case à cocher

| **Si** | l'onglet **Corpus** affiche au moins un document, |
|---|---|
| **Alors** | trois boutons d'action sont affichés sous le tableau, chacun d'une largeur uniforme de 220 px : (1) **🔬 Analyse with selected LLM** (désactivé si aucun document ou analyse en cours), (2) **🤖 Analyse with Claude Code** (désactivé si aucun document ou analyse en cours), (3) **🧹 Clean Duplicates**. Au-dessus du bouton LLM, une case à cocher **Add Annotation Property `swowl:candidate`** (cochée par défaut) contrôle l'ajout de l'annotation candidate. |

**Code source :** `app.js` → `APP._renderCorpus()` — Génère les 3 `<button class="btn-sm" style="width:220px">`. La case à cocher `#corpus-candidate-chk` lit/écrit `APP._corpusCandidateFlag`. Les boutons sont `disabled` si `!docs.length || running`.

---

### REQ-EFT-015 — Onglet Analysis : tableau des chunks

| **Si** | une analyse a été effectuée, |
|---|---|
| **Alors** | l'onglet **Analysis** affiche un tableau à 3 colonnes pour chaque chunk analysé : **CHUNK** (label unique du chunk), **TEXT EXTRACT** (extrait du texte avec les termes extraits sur-lignés), **EXTRACTED ELEMENTS** (chips colorées représentant les entités nouvellement créées par ce chunk). Chaque ligne du tableau porte un attribut `data-chunk-ref` contenant la référence JSON `{ doc, chapter, page }` pour la navigation. |

**Code source :** `app.js` → `APP._renderAnalysis()`, `chunkRow()` — Génère les lignes `<tr data-chunk-ref="${refKey}">`. Les colonnes sont rendues par `_highlightTerms(chunk.text, chunk.ids)` pour la colonne TEXT EXTRACT, et par la liste de chips pour EXTRACTED ELEMENTS.

---

### REQ-EFT-016 — Label unique des chunks

| **Si** | un chunk est affiché dans l'onglet **Analysis**, |
|---|---|
| **Alors** | son label (colonne **CHUNK**) est composé de trois éléments garantissant l'unicité : le nom du document tel qu'enregistré dans le corpus (ex. `Directive`), le titre du chapitre (ex. `Article 1`), et le numéro de page (ex. `p.4`). Le format affiché est `<doc> — <chapter> · p.<page>`. |

**Code source :** `app.js` → `chunkRow()` / `_ccBuildProv()` — La référence `ref = { doc, chapter, page }` est construite par `corpus_analyzer.py` → `_chunks()` en utilisant `doc_name` (nom du document dans le corpus) et `section.chapter` / `section.page`. La clé `refKey = JSON.stringify({ doc, chapter, page })` est stockée dans `data-chunk-ref`.

---

### REQ-EFT-017 — Sur-lignage des termes dans TEXT EXTRACT

| **Si** | un chunk contient des entités extraites, |
|---|---|
| **Alors** | la colonne **TEXT EXTRACT** affiche le texte brut du chunk avec les termes correspondant aux IDs des entités extraites sur-lignés en violet (`var(--accent)`). Le sur-lignage s'effectue en une seule passe sur le texte brut (pas sur le HTML), les termes les plus longs étant prioritaires. Les termes multi-mots (ex. `electrical and electronic equipment`) sont reconnus comme une phrase entière avant d'être décomposés en mots individuels. Les balises HTML sont protégées contre le sur-lignage récursif. |

**Code source :** `app.js` → `APP._highlightTerms(text, ids)` — Construit l'ensemble des termes depuis les IDs (décomposition CamelCase, remplacement des underscores par des espaces). Collecte toutes les plages `{ start, end }` sur le texte brut en triant par longueur décroissante (priorité aux termes longs) et en éliminant les chevauchements. Reconstruit le HTML avec `<mark style="background:var(--accent);...">` en une seule passe.

---

### REQ-EFT-018 — Icônes par type d'entité dans EXTRACTED ELEMENTS

| **Si** | un chunk a des entités extraites à afficher dans la colonne **EXTRACTED ELEMENTS**, |
|---|---|
| **Alors** | chaque entité est représentée par une chip colorée dont l'icône reflète son type : `●` marron pour les `Class`, rectangle bleu pour les `ObjectProperty`, rectangle vert pour les `DatatypeProperty`, losange violet pour les `Individual`, et `⚙️` pour les `SWRL Rules`. Un clic sur une chip navigue directement vers la fiche de l'entité. |

**Code source :** `app.js` → `KIND_DOT`, `KIND_LBL` — Mappings des types vers les spans CSS : `KIND_DOT['classes'] = '<span class="cls-dot">'`, `KIND_DOT['swrl_rules'] = '⚙️'`. Les emojis sont détectés avec `/\p{Emoji}/u.test(dot)` pour adapter le rendu (span vs texte). `chunkRow()` — Génère les chips `<span class="analysis-chip" onclick="APP.navigateTo(...)">`.

---

### REQ-EFT-019 — Panel WHERE EXTRACTED sur les fiches d'entités

| **Si** | une entité (classe, OP, DP, individu ou règle SWRL) a été extraite par une analyse, |
|---|---|
| **Alors** | sa fiche affiche en bas un panel **WHERE EXTRACTED** listant tous les chunks sources sous la forme `<doc> — <chapter> · p.<page>`. Chaque ligne est un lien cliquable. Si l'entité n'apparaît dans aucun chunk, le panel affiche `—`. |

**Code source :** `frontend/js/owl_editor.js` → `_whereExtractedFrame(kind, id)` — Cherche dans `APP._analysisData().provenance` les entrées correspondant à `kind` et `id`. Génère les items `<div data-ref='...' onclick="APP._goToAnalysisChunk(JSON.parse(this.dataset.ref))">`. Appelé dans `ClassEditor.renderForm()`, `OPEditor.renderForm()`, `DPEditor.renderForm()`, `IndividualEditor.renderForm()`. `frontend/js/swrl_editor.js` → `_renderForm()` — Idem pour les règles SWRL.

---

### REQ-EFT-020 — Navigation depuis WHERE EXTRACTED vers le chunk source

| **Si** | l'utilisateur clique sur un lien dans le panel **WHERE EXTRACTED**, |
|---|---|
| **Alors** | le système navigue vers l'onglet **Analysis** (sous-onglet `analysis` de Sources), puis sélectionne et fait défiler jusqu'à la ligne du chunk correspondant, qui est brièvement mise en surbrillance pendant 2 secondes. |

**Code source :** `app.js` → `APP._goToAnalysisChunk(ref)` — Positionne `this._sourcesTab = 'analysis'`, appelle `this.navigate('sources')`, puis après 80 ms recherche `tr[data-chunk-ref]` correspondant à `JSON.stringify({ doc, chapter, page })` via `Array.from(...).find(tr => tr.dataset.chunkRef === key)`, appelle `scrollIntoView({ behavior: 'smooth', block: 'center' })` et applique un fond `var(--accent-dim)` pendant 2 secondes.

---
