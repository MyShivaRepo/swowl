/**
 * app.js — Application principale : état, navigation, rendu des sections
 */

// ── État global ──────────────────────────────────────────────

const APP = {
    state: {
        ontology: null,
        classes: [],
        object_properties: [],
        datatype_properties: [],
        individuals: [],
        swrl_rules:  [],
        sword_rules: [],
    },
    currentSection: 'ontologies',
    _importFile: null,   // fichier en attente d'import

    // ── Historique de navigation ─────────────────────────────────
    _navHistory: [],     // états passés (max 50)
    _navFuture:  [],     // états futurs (bouton ►)

    async init() {
        try {
            await this.loadState();
            this.renderNav();
            this.renderSection(this.currentSection);
            InferenceUI.startAutoRefresh(4000);
        } catch (e) {
            this.renderSection('ontologies');
        }
    },

    async loadState() {
        try {
            const onto = await API.getCurrentOntology();
            this.state.ontology = onto;
            this.state.classes             = onto.classes             || [];
            this.state.object_properties   = onto.object_properties   || [];
            this.state.datatype_properties = onto.datatype_properties || [];
            this.state.individuals         = onto.individuals         || [];
            this.state.swrl_rules          = onto.swrl_rules          || [];
            this.state.sword_rules         = onto.sword_rules         || [];
        } catch (e) {
            this.state.ontology = null;
        }
    },

    async refresh() {
        await this.loadState();
        this.updateStats();
        InferenceUI.refresh();
    },

    updateStats() {
        const s = this.state;
        const el = document.getElementById('nav-stats');
        if (el && s.ontology) {
            el.textContent =
                `${s.classes.length} cl · ${s.object_properties.length} op · ` +
                `${s.datatype_properties.length} dp · ${s.individuals.length} ind · ` +
                `${s.swrl_rules.length} rules`;
        } else if (el) {
            el.textContent = '';
        }
    },

    renderNav() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === this.currentSection);
        });
        this.updateStats();
    },

    // ── Gestion de l'historique ──────────────────────────────────

    /** Retourne l'état courant {section, entityId} */
    _currentState() {
        switch (this.currentSection) {
            case 'classes':
                return { section: 'classes', entityId: ClassEditor._selectedId };
            case 'object-properties':
                return { section: 'object-properties', entityId: OPEditor._selectedId };
            case 'datatype-properties':
                return { section: 'datatype-properties', entityId: DPEditor._selectedId };
            case 'individuals':
                return { section: 'individuals', entityId: IndividualEditor._selectedIndId };
            default:
                return { section: this.currentSection, entityId: null };
        }
    },

    /** Empile l'état courant dans l'historique (max 50) et vide le futur */
    _pushHistory() {
        const cur = this._currentState();
        this._navHistory.push(cur);
        if (this._navHistory.length > 50) this._navHistory.shift();
        this._navFuture = [];
        this._updateNavButtons();
    },

    /** Active/désactive les boutons ◀ ► */
    _updateNavButtons() {
        const back = document.getElementById('nav-back');
        const fwd  = document.getElementById('nav-fwd');
        if (back) back.disabled = this._navHistory.length === 0;
        if (fwd)  fwd.disabled  = this._navFuture.length  === 0;
    },

    /** Restaure un état {section, entityId} sans pousser d'historique */
    _restoreState(state) {
        if (state.entityId) {
            switch (state.section) {
                case 'classes':
                    ClassEditor._selectedId       = state.entityId;
                    ClassEditor._owlThingSelected = false;
                    ClassEditor._expandAncestors(state.entityId);
                    break;
                case 'object-properties':
                    OPEditor._selectedId      = state.entityId;
                    OPEditor._topPropSelected = false;
                    OPEditor._expandAncestors(state.entityId);
                    break;
                case 'datatype-properties':
                    DPEditor._selectedId      = state.entityId;
                    DPEditor._topPropSelected = false;
                    DPEditor._expandAncestors(state.entityId);
                    break;
            }
        }
        this.renderSection(state.section);
        if (state.section === 'individuals' && state.entityId) {
            IndividualEditor.selectIndividual(state.entityId);
        }
        this._updateNavButtons();
    },

    /** Point d'entrée pour tous les changements d'onglet initiés par l'utilisateur */
    navigate(section) {
        this._pushHistory();
        this.renderSection(section);
    },

    /** Revenir en arrière */
    navigateBack() {
        if (!this._navHistory.length) return;
        this._navFuture.push(this._currentState());
        const prev = this._navHistory.pop();
        this._restoreState(prev);
    },

    /** Aller en avant */
    navigateForward() {
        if (!this._navFuture.length) return;
        this._navHistory.push(this._currentState());
        const next = this._navFuture.pop();
        this._restoreState(next);
    },

    /** Navigation croisée : bascule vers l'onglet section et sélectionne l'entité entityId */
    navigateTo(section, entityId) {
        // Empiler l'état courant dans l'historique
        this._pushHistory();
        // Pré-positionner la sélection pour que restoreSelection() en bénéficie
        switch (section) {
            case 'classes':
                ClassEditor._selectedId       = entityId;
                ClassEditor._owlThingSelected = false;
                ClassEditor._expandAncestors(entityId);
                break;
            case 'object-properties':
                OPEditor._selectedId       = entityId;
                OPEditor._topPropSelected  = false;
                OPEditor._expandAncestors(entityId);
                break;
            case 'datatype-properties':
                DPEditor._selectedId       = entityId;
                DPEditor._topPropSelected  = false;
                DPEditor._expandAncestors(entityId);
                break;
            case 'individuals': {
                // Update _selectedClassId with the target individual's type
                const targetInd = (APP.state.individuals || []).find(x => x.id === entityId);
                if (targetInd?.types?.length > 0) {
                    IndividualEditor._selectedClassId = targetInd.types[0];
                }
                IndividualEditor._selectedIndId = entityId;
                break;
            }
            case 'sword-rules':
                SWORDEditor._selectedId = entityId;
                break;
        }
        this.renderSection(section);
        if (section === 'individuals') {
            IndividualEditor.selectIndividual(entityId);
        }
        if (section === 'sword-rules' && entityId) {
            SWORDEditor.selectRule(entityId);
        }
    },

    renderSection(section) {
        this.currentSection = section;
        this.renderNav();
        const main = document.getElementById('main-content');

        switch (section) {
            case 'ontologies':
                this.renderOntologies();
                break;
            case 'classes':
                main.innerHTML = ClassEditor.renderSplit(this.state.classes);
                ClassEditor.restoreSelection();
                break;
            case 'object-properties':
                main.innerHTML = OPEditor.renderSplit(this.state.object_properties);
                OPEditor.restoreSelection();
                break;
            case 'datatype-properties':
                main.innerHTML = DPEditor.renderSplit(this.state.datatype_properties);
                DPEditor.restoreSelection();
                break;
            case 'individuals':
                main.innerHTML = IndividualEditor.renderSplit(this.state.individuals);
                IndividualEditor.restoreSelection();
                break;
            case 'swrl-rules':
                main.innerHTML = this._renderSectionHeader(
                    '⊢ SWRL Rules',
                    `<button class="btn-primary" onclick="APP.showPanel('swrl-rules', SWRLEditor.renderForm())">➕ New rule</button>`,
                    SWRLEditor.renderList(this.state.swrl_rules)
                );
                break;
            case 'sword-rules':
                main.innerHTML = SWORDEditor.renderSplit(this.state.sword_rules || []);
                SWORDEditor.restoreSelection();
                break;
            case 'annotation-properties':
                main.innerHTML = this._renderAnnotationProperties();
                break;
            case 'inferences':
                main.innerHTML = `
                    <div class="section-header">
                        <h2>🧠 Real-time Inferences</h2>
                        <button class="btn-secondary" onclick="InferenceUI.refresh()">↻ Recalculate</button>
                    </div>
                    <div id="inference-panel"><p class="empty">Loading…</p></div>`;
                InferenceUI.refresh();
                break;
        }
    },

    showPanel(section, html) {
        const main = document.getElementById('main-content');
        main.innerHTML = html;
    },

    // ── Onglet Ontologies ────────────────────────────────────

    async renderOntologies() {
        const main = document.getElementById('main-content');
        main.innerHTML = this._renderOntologiesShell();
        try {
            const list = await API.listOntologies();
            const tbody = document.getElementById('onto-store-body');
            const count = document.getElementById('onto-store-count');
            if (tbody) tbody.innerHTML = this._renderOntoTableRows(list);
            if (count) count.textContent = `${list.length} ontolog${list.length !== 1 ? 'ies' : 'y'}`;
        } catch (e) {
            const tbody = document.getElementById('onto-store-body');
            if (tbody) tbody.innerHTML =
                `<tr><td colspan="5" class="onto-table-empty">Cannot fetch ontologies</td></tr>`;
        }
    },

    _renderOntologiesShell() {
        const onto    = this.state.ontology;
        const label   = onto?.annotations?.labels?.[0]   || { value: '', lang: 'en' };
        const comment = onto?.annotations?.comments?.[0] || { value: '', lang: 'en' };

        return `
        <div class="onto-page">

            <!-- ── Barre d'actions ── -->
            <div class="section-header">
                <h2>⚙️ Ontologies</h2>
                <div class="section-actions">
                    <button class="btn-secondary" onclick="APP.toggleOntoPanel('onto-import-panel')">
                        📂 Import
                    </button>
                    <button class="btn-primary" onclick="APP.toggleOntoPanel('onto-new-panel')">
                        ✨ New Ontology
                    </button>
                </div>
            </div>

            <!-- ── Panel Import (caché) ── -->
            <div id="onto-import-panel" class="cls-frame onto-collapsible" style="display:none">
                <div class="cls-frame-bar">
                    <span class="cls-frame-tag">📂 Import Ontology</span>
                </div>
                <div class="cls-frame-body onto-form-row">
                    <div class="form-group" style="margin:0">
                        <label>File</label>
                        <label class="btn-secondary btn-sm onto-file-btn">
                            <span id="onto-import-fname">Choose file…</span>
                            <input type="file" accept=".owl,.ttl,.rdf,.xml" style="display:none"
                                   onchange="APP._onImportFileChange(event)">
                        </label>
                    </div>
                    <div class="form-group" style="margin:0;flex:1;min-width:200px">
                        <label>Base IRI *</label>
                        <input type="text" id="onto-import-iri"
                               placeholder="https://example.org/my-ontology" style="width:100%">
                    </div>
                    <div class="form-group" style="margin:0">
                        <label>Prefix</label>
                        <input type="text" id="onto-import-prefix" value="onto" style="width:80px">
                    </div>
                    <div class="onto-form-btns">
                        <button class="btn-primary btn-sm" onclick="APP.doImport()">📂 Import</button>
                        <button class="btn-secondary btn-sm"
                                onclick="APP.toggleOntoPanel('onto-import-panel')">Cancel</button>
                    </div>
                </div>
            </div>

            <!-- ── Panel New Ontology (caché) ── -->
            <div id="onto-new-panel" class="cls-frame onto-collapsible" style="display:none">
                <div class="cls-frame-bar">
                    <span class="cls-frame-tag">✨ New Ontology</span>
                </div>
                <div class="cls-frame-body onto-form-row">
                    <div class="form-group" style="margin:0;flex:1;min-width:200px">
                        <label>Base IRI *</label>
                        <input type="text" id="onto-new-iri"
                               placeholder="https://example.org/my-ontology" style="width:100%">
                    </div>
                    <div class="form-group" style="margin:0">
                        <label>Prefix</label>
                        <input type="text" id="onto-new-prefix" value="onto" style="width:80px">
                    </div>
                    <div class="form-group" style="margin:0">
                        <label>Version</label>
                        <input type="text" id="onto-new-version" value="1.0.0" style="width:80px">
                    </div>
                    <div class="onto-form-btns">
                        <button class="btn-primary btn-sm" onclick="APP.doCreateOntology()">✅ Create</button>
                        <button class="btn-secondary btn-sm"
                                onclick="APP.toggleOntoPanel('onto-new-panel')">Cancel</button>
                    </div>
                </div>
            </div>

            <!-- ── Triple Store ── -->
            <div class="cls-frame">
                <div class="cls-frame-bar">
                    <span class="cls-frame-tag">Triple Store</span>
                    <span id="onto-store-count" style="font-size:11px;color:var(--text-dim);margin-left:6px"></span>
                </div>
                <div class="cls-frame-body" style="padding:0;overflow:hidden">
                    <table class="entity-table onto-store-table">
                        <thead><tr>
                            <th style="width:20px"></th>
                            <th>Prefix</th>
                            <th>Namespace (IRI)</th>
                            <th>Version</th>
                            <th></th>
                        </tr></thead>
                        <tbody id="onto-store-body">
                            <tr><td colspan="5" class="onto-table-empty">Loading…</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ── Ontologie active ── -->
            ${onto ? `
            <div class="cls-frame">
                <div class="cls-frame-bar">
                    <span class="cls-frame-tag">Active Ontology</span>
                    <span style="font-size:11px;color:var(--text-dim);margin-left:6px;font-family:var(--font-mono)">${onto.prefix}</span>
                    <span style="margin-left:auto;font-size:11px;color:var(--text-dim)">Export :</span>
                    <button class="btn-sm" style="margin-left:4px" onclick="APP.exportOntology('owl')">OWL/XML</button>
                    <button class="btn-sm" onclick="APP.exportOntology('ttl')">Turtle</button>
                    <button class="btn-sm" onclick="APP.exportOntology('jsonld')">JSON-LD</button>
                </div>
                <div class="cls-frame-body" style="padding:10px">
                    <div class="form-group">
                        <label>Base IRI *</label>
                        <input type="text" id="onto-id" value="${onto.id}"
                               placeholder="https://example.org/my-ontology" style="width:100%">
                    </div>
                    <div class="onto-form-row" style="flex-wrap:wrap">
                        <div class="form-group" style="margin:0;flex:0 0 auto">
                            <label>Prefix</label>
                            <input type="text" id="onto-prefix" value="${onto.prefix || 'onto'}" style="width:100px">
                        </div>
                        <div class="form-group" style="margin:0;flex:0 0 auto">
                            <label>Version</label>
                            <input type="text" id="onto-version" value="${onto.version || '1.0.0'}" style="width:100px">
                        </div>
                        <div class="form-group" style="margin:0;flex:1;min-width:160px">
                            <label>Label</label>
                            <input type="text" id="onto-label" value="${label.value}"
                                   placeholder="Ontology name">
                        </div>
                        <div class="form-group" style="margin:0;flex:0 0 auto">
                            <label>Lang</label>
                            <input type="text" id="onto-lang" value="${label.lang || 'en'}" style="width:50px">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="onto-comment" rows="2" style="width:100%"
                                  placeholder="Ontology description">${comment.value}</textarea>
                    </div>
                    <button class="btn-primary btn-sm" onclick="APP.saveOntologyMeta()">💾 Save</button>
                </div>
            </div>` : `
            <div class="cls-frame">
                <div class="cls-frame-bar"><span class="cls-frame-tag">Active Ontology</span></div>
                <div class="cls-frame-body" style="padding:16px;text-align:center;color:var(--text-dim)">
                    No active ontology — import or create one above.
                </div>
            </div>`}

        </div>`;
    },

    _renderOntoTableRows(list) {
        if (!list.length) {
            return `<tr><td colspan="5" class="onto-table-empty">No ontologies in the store.</td></tr>`;
        }
        const currentId = this.state.ontology?.id;
        return list.map(o => {
            const isCurrent = o.id === currentId;
            const safeId = o.id.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
            return `<tr${isCurrent ? ' class="onto-current-row"' : ''}>
                <td style="text-align:center;color:var(--accent);font-size:14px">${isCurrent ? '★' : ''}</td>
                <td><code>${o.prefix || '—'}</code></td>
                <td class="onto-iri-cell">${o.id}</td>
                <td style="color:var(--text-dim)">${o.version || '—'}</td>
                <td class="actions">
                    ${!isCurrent ? `<button class="btn-sm btn-edit"
                        onclick="APP.loadOntologyFromStore('${safeId}')"
                        title="Load this ontology">▶ Load</button>` : ''}
                    <button class="btn-sm btn-del"
                        onclick="APP.deleteOntologyFromStore('${safeId}')"
                        title="Delete from store">🗑</button>
                </td>
            </tr>`;
        }).join('');
    },

    // ── Actions Ontologies ───────────────────────────────────

    toggleOntoPanel(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.display = el.style.display === 'none' ? '' : 'none';
    },

    _onImportFileChange(event) {
        const file = event.target.files[0];
        if (!file) return;
        this._importFile = file;
        const span = document.getElementById('onto-import-fname');
        if (span) span.textContent = file.name;
        const iriInput = document.getElementById('onto-import-iri');
        if (iriInput && !iriInput.value)
            iriInput.value = `https://example.org/${file.name.replace(/\.\w+$/, '')}`;
    },

    async doImport() {
        const file   = this._importFile;
        const iri    = document.getElementById('onto-import-iri')?.value.trim();
        const prefix = document.getElementById('onto-import-prefix')?.value.trim() || 'onto';
        if (!file) return UI.error('Please select a file');
        if (!iri)  return UI.error('Base IRI is required');
        try {
            await API.importOntology(file, iri, prefix);
            UI.success(`Ontology imported from ${file.name}`);
            this._importFile = null;
            await this.refresh();
            this.renderOntologies();
        } catch (e) { UI.error(`Import error: ${e.message}`); }
    },

    async doCreateOntology() {
        const iri     = document.getElementById('onto-new-iri')?.value.trim();
        const prefix  = document.getElementById('onto-new-prefix')?.value.trim() || 'onto';
        const version = document.getElementById('onto-new-version')?.value.trim() || '1.0.0';
        if (!iri) return UI.error('Base IRI is required');
        const onto = {
            id: iri, prefix, version,
            annotations: { labels: [], comments: [], other: [] },
            classes: [], object_properties: [], datatype_properties: [],
            individuals: [], swrl_rules: [],
        };
        try {
            await API.createOntology(onto);
            UI.success(`Ontology '${prefix}' created`);
            await this.refresh();
            this.renderOntologies();
        } catch (e) { UI.error(e.message); }
    },

    async loadOntologyFromStore(id) {
        try {
            await API.loadOntology(id);
            UI.success('Ontology loaded');
            await this.refresh();
            this.renderOntologies();
        } catch (e) { UI.error(e.message); }
    },

    async deleteOntologyFromStore(id) {
        if (!await UI.confirm(`Delete ontology <strong>${id}</strong> from the store?`)) return;
        try {
            await API.deleteOntology(id);
            UI.success('Ontology deleted');
            if (this.state.ontology?.id === id) this.state.ontology = null;
            await this.refresh();
            this.renderOntologies();
        } catch (e) { UI.error(e.message); }
    },

    async saveOntologyMeta() {
        const id      = document.getElementById('onto-id').value.trim();
        const prefix  = document.getElementById('onto-prefix').value.trim() || 'onto';
        const version = document.getElementById('onto-version').value.trim() || '1.0.0';
        const label   = document.getElementById('onto-label').value.trim();
        const lang    = document.getElementById('onto-lang').value.trim() || 'en';
        const comment = document.getElementById('onto-comment').value.trim();

        if (!id) return UI.error('Base IRI is required');

        const onto = {
            id, prefix, version,
            annotations: {
                labels:   label   ? [{ value: label,   lang }] : [],
                comments: comment ? [{ value: comment, lang }] : [],
                other: [],
            },
            classes:             this.state.classes             || [],
            object_properties:   this.state.object_properties   || [],
            datatype_properties: this.state.datatype_properties || [],
            individuals:         this.state.individuals         || [],
            swrl_rules:          this.state.swrl_rules          || [],
        };

        try {
            if (this.state.ontology?.id) {
                await API.updateOntology(onto);
                UI.success('Ontology saved');
            } else {
                await API.createOntology(onto);
                UI.success('Ontology created');
            }
            await this.refresh();
            this.renderOntologies();
        } catch (e) { UI.error(e.message); }
    },

    async exportOntology(fmt) {
        try {
            const blob = await API.exportOntology(fmt);
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `ontology.${fmt === 'owl' ? 'owl' : fmt === 'ttl' ? 'ttl' : 'jsonld'}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) { UI.error(`Export error: ${e.message}`); }
    },

    // ── Helpers sections ─────────────────────────────────────

    _renderAnnotationProperties() {
        const groups = [
            {
                prefix: 'rdfs',
                desc: 'RDF Schema annotation properties',
                props: [
                    { id: 'rdfs:label',         desc: 'Human-readable name for a resource' },
                    { id: 'rdfs:comment',        desc: 'Description of a resource' },
                    { id: 'rdfs:seeAlso',        desc: 'Related resource with more information' },
                    { id: 'rdfs:isDefinedBy',    desc: 'Resource that defines the subject' },
                ],
            },
            {
                prefix: 'owl',
                desc: 'OWL 2 ontology annotation properties',
                props: [
                    { id: 'owl:versionInfo',            desc: 'Version information (string)' },
                    { id: 'owl:deprecated',             desc: 'Marks entity as deprecated (boolean)' },
                    { id: 'owl:priorVersion',           desc: 'Previous version of the ontology' },
                    { id: 'owl:backwardCompatibleWith', desc: 'Prior version backward compatible' },
                    { id: 'owl:incompatibleWith',       desc: 'Prior version incompatible' },
                ],
            },
        ];
        const groupsHtml = groups.map(g => `
            <div class="cls-frame" style="margin-bottom:8px">
                <div class="cls-frame-bar">
                    <span class="cls-frame-tag">${g.prefix}:</span>
                    <span style="font-size:11px;color:var(--text-dim);margin-left:6px">${g.desc}</span>
                </div>
                <div class="cls-frame-body">
                    ${g.props.map(p => `
                    <div class="cls-list-item" style="padding:4px 6px;align-items:flex-start">
                        <span class="anno-prop-dot" style="margin-top:2px;flex-shrink:0"></span>
                        <div style="display:flex;flex-direction:column;gap:1px">
                            <span style="font-size:12px;font-family:var(--font-mono);color:var(--text2)">${p.id}</span>
                            <span style="font-size:11px;color:var(--text-dim)">${p.desc}</span>
                        </div>
                    </div>`).join('')}
                </div>
            </div>`).join('');

        return `
        <div class="section-header">
            <h2><span class="anno-prop-dot" style="display:inline-block;vertical-align:middle;margin-right:6px"></span> Annotation Properties</h2>
        </div>
        <div style="padding:0 8px 8px">
            <p style="font-size:12px;color:var(--text-dim);margin:0 0 10px">
                OWL 2 built-in annotation properties — read-only reference.
                Use the <strong>+ Annotation Property</strong> button in each entity editor.
            </p>
            ${groupsHtml}
        </div>`;
    },

    _renderSectionHeader(title, actions, content) {
        return `
        <div class="section-header">
            <h2>${title}</h2>
            <div class="section-actions">${actions}</div>
        </div>
        <div class="section-content">${content}</div>`;
    },
};


// ── UI helpers ───────────────────────────────────────────────

const UI = {
    _toastTimeout: null,

    success(msg) { this._toast(msg, 'success'); },
    error(msg)   { this._toast(msg, 'error');   },
    warn(msg)    { this._toast(msg, 'warn');     },

    _toast(msg, type) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            document.body.appendChild(toast);
        }
        toast.className = `toast toast-${type}`;
        toast.textContent = msg;
        toast.style.display = 'block';
        clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => { toast.style.display = 'none'; }, 3500);
    },

    confirm(htmlMessage) {
        return new Promise(resolve => {
            document.getElementById('ui-modal-overlay')?.remove();

            const overlay = document.createElement('div');
            overlay.id = 'ui-modal-overlay';
            overlay.innerHTML = `
                <div class="ui-modal">
                    <div class="ui-modal-body">${htmlMessage}</div>
                    <div class="ui-modal-actions">
                        <button class="btn-danger"     id="ui-modal-ok">🗑 Delete</button>
                        <button class="btn-secondary"  id="ui-modal-cancel">Cancel</button>
                    </div>
                </div>`;
            document.body.appendChild(overlay);

            const close = (result) => { overlay.remove(); resolve(result); };
            document.getElementById('ui-modal-ok').onclick     = () => close(true);
            document.getElementById('ui-modal-cancel').onclick  = () => close(false);
            overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
        });
    },
};


// ── Init ─────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
    APP.init();

});
