# Requirements — Extract from Text (LLMs, Corpus, Analysis tabs)

> Generated on 2026-06-17 | Strictly derived from source code | No hallucination

## Table of Contents

### Logic
- [REQ-EFT-001 — Corpus document management](#req-eft-001--corpus-document-management)
- [REQ-EFT-002 — LLM configuration (provider, model, API key)](#req-eft-002--llm-configuration-provider-model-api-key)
- [REQ-EFT-003 — Corpus analysis via the selected LLM](#req-eft-003--corpus-analysis-via-the-selected-llm)
- [REQ-EFT-004 — Corpus analysis via Claude Code CLI](#req-eft-004--corpus-analysis-via-claude-code-cli)
- [REQ-EFT-005 — Extraction and creation of OWL entities](#req-eft-005--extraction-and-creation-of-owl-entities)
- [REQ-EFT-006 — Extraction and creation of SWRL rules](#req-eft-006--extraction-and-creation-of-swrl-rules)
- [REQ-EFT-007 — Deduplication of extracted entities](#req-eft-007--deduplication-of-extracted-entities)
- [REQ-EFT-008 — Provenance traceability (WHERE EXTRACTED)](#req-eft-008--provenance-traceability-where-extracted)
- [REQ-EFT-009 — `swowl:candidate` annotation on extracted entities](#req-eft-009--swowlcandidate-annotation-on-extracted-entities)
- [REQ-EFT-010 — Corpus analysis limit](#req-eft-010--corpus-analysis-limit)
- [REQ-EFT-011 — Frontend polling for Claude Code analysis](#req-eft-011--frontend-polling-for-claude-code-analysis)

### Presentation
- [REQ-EFT-012 — LLMs tab: provider configuration](#req-eft-012--llms-tab-provider-configuration)
- [REQ-EFT-013 — Corpus tab: document list management](#req-eft-013--corpus-tab-document-list-management)
- [REQ-EFT-014 — Corpus tab: action buttons and checkbox](#req-eft-014--corpus-tab-action-buttons-and-checkbox)
- [REQ-EFT-015 — Analysis tab: chunk table](#req-eft-015--analysis-tab-chunk-table)
- [REQ-EFT-016 — Unique chunk labels](#req-eft-016--unique-chunk-labels)
- [REQ-EFT-017 — Term highlighting in TEXT EXTRACT](#req-eft-017--term-highlighting-in-text-extract)
- [REQ-EFT-018 — Entity-type icons in EXTRACTED ELEMENTS](#req-eft-018--entity-type-icons-in-extracted-elements)
- [REQ-EFT-019 — WHERE EXTRACTED panel on entity detail pages](#req-eft-019--where-extracted-panel-on-entity-detail-pages)
- [REQ-EFT-020 — Navigation from WHERE EXTRACTED to the source chunk](#req-eft-020--navigation-from-where-extracted-to-the-source-chunk)

---

## 1. Logic — Business rules and functional behaviour

> Requirements independent of the UI: extraction rules, deduplication and traceability.

---

### REQ-EFT-001 — Corpus document management

| **If** | the user adds a document in the **Corpus** tab (Web URL or local path), |
|---|---|
| **Then** | the document is stored with a `name` and a `location` in the corpus list, persisted in the current ontology's `localStorage`. Each document can be individually edited or deleted. The corpus is scoped to the currently connected ontology. |

**Source code:** `app.js` → `APP._corpusDocs()`, `APP._corpusAdd()`, `APP._corpusSave()` — The corpus is serialised to `localStorage` under the key `swowl_corpus_<ontologyId>`. `_corpusDocs()` returns the current list. `_corpusAdd()` appends an empty `{ name, location }` entry; `_corpusSave(i)` validates inline editing.

---

### REQ-EFT-002 — LLM configuration (provider, model, API key)

| **If** | the user configures an LLM provider in the **LLMs** tab, |
|---|---|
| **Then** | the system stores the provider (`anthropic`, `openai`, `meta`), the model name, the API key, and the base URL (for local Ollama) in `localStorage`. This configuration is reused at each analysis run. A **Test** button validates the API key before use. |

**Source code:** `app.js` → `APP._llmConfig()`, `APP._llmSave()`, `APP._llmTest()` — Configuration persisted in `localStorage` under `swowl_llm_config`. `_llmTest()` calls `API.testLlmKey(provider, api_key, base_url)` and displays the result. `frontend/js/api.js` → `API.testLlmKey()` → `POST /api/llm/test`.

---

### REQ-EFT-003 — Corpus analysis via the selected LLM

| **If** | the user clicks **🔬 Analyse with selected LLM**, |
|---|---|
| **Then** | the backend sends each chunk of each document to the configured LLM (Anthropic, OpenAI, or Ollama) using an OWL extraction prompt. The LLM responds with a structured JSON object containing `classes`, `object_properties`, `datatype_properties`, `individuals`, and `swrl_rules`. Each new entity is added to the ontology in real time via Server-Sent Events (SSE). When all chunks are processed, the full provenance is saved. |

**Source code:** `app.js` → `APP._corpusAnalyse()` — Reads the LLM config from `localStorage`, calls `API.analyseCorpus(api_key, model, documents, system_prompt)`. Consumes the SSE stream: each `chunk` event updates the status; the `done` event calls `_analysisSave(provenance, errors)`. `backend/corpus_analyzer.py` → `_analyse_chunk()`, `_call_anthropic()`, `_call_openai_compat()` — Splits documents into chunks (max 6,000 characters), calls the LLM, parses the JSON response. `backend/main.py` → `POST /api/corpus/analyse` — Merges extracted entities into the ontology via `_merge_chunk()`.

---

### REQ-EFT-004 — Corpus analysis via Claude Code CLI

| **If** | the user clicks **🤖 Analyse with Claude Code**, |
|---|---|
| **Then** | the frontend notifies the user to start the analysis manually in Claude Code CLI. Claude Code pushes extracted chunks one by one via `POST /api/analysis/chunk`. The frontend polls `GET /api/analysis/chunks` every 2 seconds; when `POST /api/analysis/done` is received, the frontend consolidates the provenance and saves the analysis. |

**Source code:** `app.js` → `APP._claudeCodeAnalyse()` — Calls `API.clearAnalysis(docs)` to reset the backend store and transmit the document list. Starts `_ccStartPolling()` which calls `_ccPoll()` every 2 seconds. `_ccPoll()` calls `API.getAnalysisChunks()`; when `running === false`, calls `_analysisSave(_ccBuildProv(chunks), [])`. `backend/main.py` → `POST /api/analysis/clear|chunk|done`, `GET /api/analysis/chunks|docs` — In-memory store `_cc_chunks`, `_cc_state`, `_cc_docs` protected by `_cc_lock`.

---

### REQ-EFT-005 — Extraction and creation of OWL entities

| **If** | the LLM (or Claude Code) returns a chunk containing OWL entities, |
|---|---|
| **Then** | for each new entity (not already present in the ontology), the system creates the class, property, or individual with its annotations, domain, range, and superclasses. Entities already present are neither recreated nor modified; only their provenance is recorded. Only newly created entities appear in the chunk's `ids_by_kind` field (displayed in the EXTRACTED ELEMENTS column). |

**Source code:** `backend/main.py` → `_merge_chunk()` — Maintains sets `cset`, `opset`, `dpset`, `iset`, `rset` of existing IDs. For each entity returned by the LLM: if `id not in set`, creates the entity via `OWLClass.model_validate(...)` / `OWLObjectProperty.model_validate(...)` etc., adds it to `onto.<collection>` and the set, and appends its ID to `ids_by_kind` (new entities only). `app.js` → `APP._ccBuildProv(chunks)` — For Claude Code analysis, builds provenance from received chunks using `KIND_MAP = { classes: 'class', object_properties: 'op', datatype_properties: 'dp', individuals: 'individual', swrl_rules: 'swrl_rule' }`.

---

### REQ-EFT-006 — Extraction and creation of SWRL rules

| **If** | the LLM returns SWRL rules in a chunk, |
|---|---|
| **Then** | each rule is validated via `SWRLRule.model_validate()` and added to the ontology if its ID is new. Accepted SWRL atoms are: `type_atom { var, class_id }`, `property_atom { subject, property_id, object }`, and `equality_atom { var, operator, value }`. If validation fails (invalid atom structure), the rule is silently skipped. |

**Source code:** `backend/main.py` → `_merge_chunk()`, `swrl_rules` block — Calls `SWRLRule.model_validate({ id, label, comment, body, head })` in a `try/except` block; on failure, the exception is absorbed (`pass`). `backend/owl_model.py` → `SWRLRule`, `SWRLTypeAtom`, `SWRLPropertyAtom`, `SWRLEqualityAtom`.

---

### REQ-EFT-007 — Deduplication of extracted entities

| **If** | the user clicks **🧹 Clean Duplicates**, |
|---|---|
| **Then** | the system detects duplicate entities (exact match, case-insensitive, or plural form) by type (`classes`, `object_properties`, `datatype_properties`, `individuals`) and proposes merging them: the canonical entity is kept, aliases are deleted, and all internal references are redirected to the canonical entity. |

**Source code:** `app.js` → `APP._corpusDedupe()` — Calls `API.getDuplicates()` then `API.mergeDuplicates(body)`. `backend/main.py` → `GET /api/ontology/duplicates`, `POST /api/ontology/merge-duplicates` → `_apply_merge()` — Rewires all references (`subClassOf`, `domain`, `range`, `types`, etc.) to the canonical ID, then removes duplicates from `onto.<collection>`.

---

### REQ-EFT-008 — Provenance traceability (WHERE EXTRACTED)

| **If** | an entity is extracted from a chunk, |
|---|---|
| **Then** | the system records its provenance as `{ id, kind, label, sections: [{ doc, chapter, page }] }`. Each entity may be referenced by multiple chunks (sections). This provenance is persisted in the ontology's `localStorage` and displayed in a **WHERE EXTRACTED** panel at the bottom of each entity's detail page (class, OP, DP, individual, SWRL rule). |

**Source code:** `backend/main.py` → `_record(kind, eid, label, ref)` — Populates the `prov` dictionary; `ref` = `{ doc, chapter, page }`. Provenance is emitted in the SSE `done` event: `{ provenance: list(prov.values()) }`. `app.js` → `APP._analysisSave(prov, errors)` — Persists `{ provenance, chunks, errors }` to `localStorage` under `swowl_analysis_<ontologyId>`. `frontend/js/owl_editor.js` → `_whereExtractedFrame(kind, id)` — Reads provenance from `APP._analysisData()` and generates the HTML panel.

---

### REQ-EFT-009 — `swowl:candidate` annotation on extracted entities

| **If** | the **Add Annotation Property `swowl:candidate`** checkbox is checked (default behaviour) during an LLM analysis, |
|---|---|
| **Then** | every entity created by the analysis automatically receives the annotation `swowl:candidate` with the value `"corpus"` in its `other` annotations. This annotation distinguishes candidate entities (automatically extracted) from entities validated manually. |

**Source code:** `backend/main.py` → `_anno(label, comment)` — Returns `{ labels, comments, other: [{ property: "swowl:candidate", value: "corpus" }] }`. Used when creating all entities in `_merge_chunk()`. `app.js` → `APP._corpusCandidateFlag` (boolean, `true` by default) — Controlled by the `#corpus-candidate-chk` checkbox.

---

### REQ-EFT-010 — Corpus analysis limit

| **If** | the corpus contains more than 40 chunks in total (across all pages and all documents), |
|---|---|
| **Then** | only the first 40 chunks are submitted to the LLM; remaining chunks are ignored, and an error `"Corpus truncated to 40 chunks"` is appended to the analysis error report. |

**Source code:** `backend/corpus_analyzer.py` → `MAX_CHUNKS = 40` — `work = [c for c in all_chunks[:MAX_CHUNKS] if c["text"].strip()]`. If `len(all_chunks) > MAX_CHUNKS`, appends `{ doc: "*", error: f"Corpus truncated to {MAX_CHUNKS} chunks." }` to errors.

---

### REQ-EFT-011 — Frontend polling for Claude Code analysis

| **If** | a Claude Code analysis is running (started by `_claudeCodeAnalyse()`), |
|---|---|
| **Then** | the frontend polls `GET /api/analysis/chunks` every 2 seconds. On each response, the displayed status is updated with the number of chunks received. When `running === false`, polling stops, provenance is computed via `_ccBuildProv()`, and the analysis is saved. The backend store is reset before each new analysis via `POST /api/analysis/clear`. |

**Source code:** `app.js` → `APP._ccStartPolling()` — `setInterval(_ccPoll, 2000)`. `_ccPoll()` — Calls `API.getAnalysisChunks()`; if `!data.running`, calls `clearInterval`, then `_analysisSave(_ccBuildProv(chunks), [])`. `APP._ccBuildProv(chunks)` — Builds `[{ id, kind, label, sections }]` from the `ids` of each chunk.

---

## 2. Presentation — UI and display rules

> Requirements relating to layout, controls and UI interactions in the LLMs, Corpus and Analysis tabs.

---

### REQ-EFT-012 — LLMs tab: provider configuration

| **If** | the user opens the **LLMs** tab, |
|---|---|
| **Then** | the interface displays: a provider selector (`Anthropic`, `OpenAI`, `Meta/Llama`), a model name input, a masked API key field, a base URL field (for Ollama), a **Test** button to validate the key, and an editable system prompt textarea. The default system prompt is loaded from `GET /api/corpus/prompt`. |

**Source code:** `app.js` → `APP._renderLLMs()` — Generates the configuration form. `APP._llmTest()` → `API.testLlmKey()` → `POST /api/llm/test`. `APP._llmSave()` persists to `localStorage`. `APP._renderCorpusPrompt()` loads the prompt via `API.getCorpusPrompt()` → `GET /api/corpus/prompt`.

---

### REQ-EFT-013 — Corpus tab: document list management

| **If** | the user opens the **Corpus** tab, |
|---|---|
| **Then** | the interface displays a table of corpus documents with three columns: **Name** (human-readable name), **Location** (URL or local path), and an action column (🗑 delete button). Each `Name` and `Location` cell is inline-editable by double-click. Below the table, an add form allows entering a new name and location, with a **📂 Browse…** button to open the local file browser. |

**Source code:** `app.js` → `APP._renderCorpus()` — Generates the HTML table with `rows` = document list. `APP._corpusEditStart(i)` / `APP._corpusEditSave(i)` — Inline editing. `APP._corpusDelete(i)` — Deletion. `APP._corpusBrowse()` → `API.fsBrowse()` → `GET /api/fs/browse` — File browser.

---

### REQ-EFT-014 — Corpus tab: action buttons and checkbox

| **If** | the **Corpus** tab displays at least one document, |
|---|---|
| **Then** | three action buttons are shown below the table, each with a uniform width of 220 px: (1) **🔬 Analyse with selected LLM** (disabled if no documents or analysis running), (2) **🤖 Analyse with Claude Code** (disabled if no documents or analysis running), (3) **🧹 Clean Duplicates**. Above the LLM button, an **Add Annotation Property `swowl:candidate`** checkbox (checked by default) controls whether the candidate annotation is added to extracted entities. |

**Source code:** `app.js` → `APP._renderCorpus()` — Generates the 3 `<button class="btn-sm" style="width:220px">` elements. The `#corpus-candidate-chk` checkbox reads/writes `APP._corpusCandidateFlag`. Buttons are `disabled` when `!docs.length || running`.

---

### REQ-EFT-015 — Analysis tab: chunk table

| **If** | an analysis has been performed, |
|---|---|
| **Then** | the **Analysis** tab displays a three-column table for each analysed chunk: **CHUNK** (unique chunk label), **TEXT EXTRACT** (text excerpt with extracted terms highlighted), **EXTRACTED ELEMENTS** (coloured chips representing entities newly created by this chunk). Each table row carries a `data-chunk-ref` attribute containing the JSON reference `{ doc, chapter, page }` for navigation. |

**Source code:** `app.js` → `APP._renderAnalysis()`, `chunkRow()` — Generates rows `<tr data-chunk-ref="${refKey}">`. Columns are rendered by `_highlightTerms(chunk.text, chunk.ids)` for TEXT EXTRACT and by the chip list for EXTRACTED ELEMENTS.

---

### REQ-EFT-016 — Unique chunk labels

| **If** | a chunk is displayed in the **Analysis** tab, |
|---|---|
| **Then** | its label (the **CHUNK** column) is composed of three elements guaranteeing uniqueness: the document name as registered in the corpus (e.g. `Directive`), the chapter title (e.g. `Article 1`), and the page number (e.g. `p.4`). The displayed format is `<doc> — <chapter> · p.<page>`. |

**Source code:** `app.js` → `chunkRow()` / `_ccBuildProv()` — The reference `ref = { doc, chapter, page }` is built by `backend/corpus_analyzer.py` → `_chunks()` using `doc_name` (the document name in the corpus) and `section.chapter` / `section.page`. The key `refKey = JSON.stringify({ doc, chapter, page })` is stored in `data-chunk-ref`.

---

### REQ-EFT-017 — Term highlighting in TEXT EXTRACT

| **If** | a chunk contains extracted entities, |
|---|---|
| **Then** | the **TEXT EXTRACT** column shows the raw chunk text with terms matching the extracted entity IDs highlighted in purple (`var(--accent)`). Highlighting is performed in a single pass on the raw text (not on HTML), with longer terms taking priority over shorter ones. Multi-word terms (e.g. `electrical and electronic equipment`) are recognised as a complete phrase before being decomposed into individual words. HTML tags are protected against recursive highlighting. |

**Source code:** `app.js` → `APP._highlightTerms(text, ids)` — Builds the set of terms from entity IDs (CamelCase decomposition, underscore-to-space replacement). Collects all `{ start, end }` ranges on the raw text sorted by descending length (long terms have priority) and eliminates overlaps. Reconstructs HTML with `<mark style="background:var(--accent);...">` in a single pass.

---

### REQ-EFT-018 — Entity-type icons in EXTRACTED ELEMENTS

| **If** | a chunk has extracted entities to display in the **EXTRACTED ELEMENTS** column, |
|---|---|
| **Then** | each entity is represented by a coloured chip whose icon reflects its type: `●` brown for `Class`, blue rectangle for `ObjectProperty`, green rectangle for `DatatypeProperty`, purple diamond for `Individual`, and `⚙️` for `SWRL Rules`. Clicking a chip navigates directly to the entity's detail page. |

**Source code:** `app.js` → `KIND_DOT`, `KIND_LBL` — Mappings from types to CSS spans: `KIND_DOT['classes'] = '<span class="cls-dot">'`, `KIND_DOT['swrl_rules'] = '⚙️'`. Emojis are detected with `/\p{Emoji}/u.test(dot)` to adapt rendering (span vs. plain text). `chunkRow()` — Generates chips `<span class="analysis-chip" onclick="APP.navigateTo(...)">`.

---

### REQ-EFT-019 — WHERE EXTRACTED panel on entity detail pages

| **If** | an entity (class, OP, DP, individual or SWRL rule) was extracted by an analysis, |
|---|---|
| **Then** | its detail page shows a **WHERE EXTRACTED** panel at the bottom, listing all source chunks in the format `<doc> — <chapter> · p.<page>`. Each entry is a clickable link. If the entity does not appear in any chunk, the panel displays `—`. |

**Source code:** `frontend/js/owl_editor.js` → `_whereExtractedFrame(kind, id)` — Looks up `APP._analysisData().provenance` for entries matching `kind` and `id`. Generates items `<div data-ref='...' onclick="APP._goToAnalysisChunk(JSON.parse(this.dataset.ref))">`. Called in `ClassEditor.renderForm()`, `OPEditor.renderForm()`, `DPEditor.renderForm()`, `IndividualEditor.renderForm()`. `frontend/js/swrl_editor.js` → `_renderForm()` — Same for SWRL rules.

---

### REQ-EFT-020 — Navigation from WHERE EXTRACTED to the source chunk

| **If** | the user clicks a link in the **WHERE EXTRACTED** panel, |
|---|---|
| **Then** | the system navigates to the **Analysis** tab (the `analysis` sub-tab of Sources), then locates and scrolls to the corresponding chunk row, which is briefly highlighted for 2 seconds. |

**Source code:** `app.js` → `APP._goToAnalysisChunk(ref)` — Sets `this._sourcesTab = 'analysis'`, calls `this.navigate('sources')`, then after 80 ms searches `tr[data-chunk-ref]` matching `JSON.stringify({ doc, chapter, page })` via `Array.from(...).find(tr => tr.dataset.chunkRef === key)`, calls `scrollIntoView({ behavior: 'smooth', block: 'center' })`, and applies a `var(--accent-dim)` background for 2 seconds.

---
