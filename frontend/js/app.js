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
        swrl_rules: [],
    },
    currentSection: 'ontologies',
    _importFilePath: null,   // chemin du fichier OWL à importer

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
            this.state.swrl_rules         = onto.swrl_rules         || [];
        } catch (e) {
            this.state.ontology = null;
            this.state.classes             = [];
            this.state.object_properties   = [];
            this.state.datatype_properties = [];
            this.state.individuals         = [];
            this.state.swrl_rules         = [];
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
                `${s.datatype_properties.length} dp · ${s.individuals.length} ind`;
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
        }
        if (section === 'swrl-rules' && entityId) {
            SWRLEditor._selectedId = entityId;
        }
        this.renderSection(section);
        if (section === 'individuals') {
            IndividualEditor.selectIndividual(entityId);
        }
    },

    _noOntoMsg() {
        return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;gap:12px;color:var(--text-dim)">
            <span style="font-size:32px">🔌</span>
            <span style="font-size:14px">No ontology connected.</span>
            <button class="btn-primary btn-sm" onclick="APP.navigate('ontologies')">Go to Ontologies</button>
        </div>`;
    },

    renderSection(section) {
        this.currentSection = section;
        this.renderNav();
        const main = document.getElementById('main-content');

        // Bloquer les onglets d'édition si aucune ontologie n'est connectée
        const editSections = ['classes','object-properties','datatype-properties','individuals','swrl-rules','inferences'];
        if (!this.state.ontology && editSections.includes(section)) {
            main.innerHTML = this._noOntoMsg();
            return;
        }

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
            case 'annotation-properties':
                main.innerHTML = this._renderAnnotationProperties();
                break;
            case 'swrl-rules':
                main.innerHTML = SWRLEditor.renderSplit(this.state.swrl_rules || []);
                SWRLEditor.restoreSelection();
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
            this._refreshOntoTable(list);
        } catch (e) {
            const tbody = document.getElementById('onto-registry-body');
            if (tbody) tbody.innerHTML =
                `<tr><td colspan="6" class="onto-table-empty">Impossible de charger le registre.</td></tr>`;
        }
    },

    _refreshOntoTable(list) {
        const tbody = document.getElementById('onto-registry-body');
        const count = document.getElementById('onto-registry-count');
        if (count) count.textContent = `${list.length} ontologie${list.length !== 1 ? 's' : ''}`;
        if (!tbody) return;
        if (!list.length) {
            tbody.innerHTML = `<tr><td colspan="6" class="onto-table-empty">No ontologies in the registry — create one using the button above.</td></tr>`;
            return;
        }
        tbody.innerHTML = list.map(o => {
            const isConn = o.connected;
            const safeName = o.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
            const statusBadge = isConn
                ? `<span class="onto-badge onto-badge-connected">● connected</span>`
                : `<span class="onto-badge onto-badge-disconnected">○ disconnected</span>`;
            const connectBtn = isConn
                ? `<button class="btn-sm btn-warn" onclick="APP.doDisconnect()" title="Disconnect">⏏ Disconnect</button>`
                : `<button class="btn-sm btn-edit" onclick="APP.doConnect('${safeName}')" title="Connect">▶ Connect</button>`;
            // Afficher uniquement le dossier dans la colonne Path (pas le nom de fichier)
            const displayPath = o.path.substring(0, o.path.lastIndexOf('/') + 1);
            return `<tr class="${isConn ? 'onto-current-row' : ''}">
                <td>${statusBadge}</td>
                <td><strong>${o.name}</strong></td>
                <td class="onto-iri-cell" title="${o.path}">${displayPath}</td>
                <td><code>${o.prefix}</code></td>
                <td><code>${o.uri}</code></td>
                <td class="actions" style="white-space:nowrap">
                    <button class="btn-sm" onclick="APP.doEditOntology('${safeName}')" title="Edit attributes">✏️</button>
                    ${connectBtn}
                    ${isConn ? `<button class="btn-sm" onclick="APP.exportOntology('owl')" title="Export OWL">↓ OWL</button>
                    <button class="btn-sm" onclick="APP.exportOntology('ttl')" title="Export Turtle">↓ TTL</button>` : ''}
                    <button class="btn-sm btn-del" onclick="APP.doUnregister('${safeName}')" title="Remove from registry">✕</button>
                </td>
            </tr>`;
        }).join('');
    },

    _renderOntologiesShell() {
        return `
        <div class="onto-page">

            <div class="section-header">
                <h2><svg width="18" height="15" viewBox="0 0 14 12" fill="currentColor" style="vertical-align:middle;margin-right:6px"><circle cx="7" cy="1.5" r="1.5"/><circle cx="1.5" cy="10.5" r="1.5"/><circle cx="12.5" cy="10.5" r="1.5"/><line x1="7" y1="3" x2="2.5" y2="9" stroke="currentColor" stroke-width="1"/><line x1="7" y1="3" x2="11.5" y2="9" stroke="currentColor" stroke-width="1"/><line x1="3" y1="10.5" x2="11" y2="10.5" stroke="currentColor" stroke-width="1"/></svg> Ontologies</h2>
                <div class="section-actions">
                    <button class="btn-primary" onclick="APP.toggleOntoPanel('onto-new-panel')">✨ New Ontology</button>
                </div>
            </div>

            <!-- ── New Ontology form ── -->
            <div id="onto-new-panel" class="cls-frame onto-collapsible" style="display:none">
                <div class="cls-frame-bar"><span class="cls-frame-tag">✨ New Ontology</span></div>
                <div class="cls-frame-body" style="padding:12px;display:flex;flex-direction:column;gap:10px">
                    <!-- Row 1 : Name + Path -->
                    <div style="display:flex;gap:10px;flex-wrap:wrap">
                        <div class="form-group" style="margin:0;flex:1;min-width:160px">
                            <label>Name *</label>
                            <input type="text" id="onto-new-name" placeholder="e.g. MyOntology" style="width:100%">
                        </div>
                        <div class="form-group" style="margin:0;flex:2;min-width:260px">
                            <label>Path * <span style="font-size:10px;color:var(--text-dim)">(directory on your Mac)</span></label>
                            <input type="text" id="onto-new-path" placeholder="Choose directory…"
                                   style="width:100%;cursor:pointer"
                                   onclick="FsBrowser.open('onto-new-path')"
                                   readonly>
                        </div>
                    </div>
                    <!-- Row 2 : Prefix + URI -->
                    <div style="display:flex;gap:10px;flex-wrap:wrap">
                        <div class="form-group" style="margin:0;flex:0 0 auto">
                            <label>Prefix</label>
                            <input type="text" id="onto-new-prefix" value="onto" style="width:90px">
                        </div>
                        <div class="form-group" style="margin:0;flex:2;min-width:260px">
                            <label>URI (base IRI) *</label>
                            <input type="text" id="onto-new-uri" placeholder="https://example.org/my-ontology" style="width:100%">
                        </div>
                    </div>
                    <!-- Row 3 : optional import file -->
                    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">
                        <div class="form-group" style="margin:0;flex:1;min-width:260px">
                            <label>Import from file <span style="font-size:10px;color:var(--text-dim)">(optional — .owl / .ttl / .rdf)</span></label>
                            <input type="text" id="onto-new-fname" placeholder="Choose file…"
                                   style="width:100%;cursor:pointer"
                                   onclick="FsBrowser.open('onto-new-fname', ['.owl','.ttl','.rdf','.xml','.json'])"
                                   readonly>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px">
                        <button class="btn-primary btn-sm" onclick="APP.doCreateOntology()">📋 Add to registry</button>
                        <button class="btn-secondary btn-sm" onclick="APP.toggleOntoPanel('onto-new-panel')">Cancel</button>
                    </div>
                </div>
            </div>

            <!-- ── Edit Ontology form (hidden by default) ── -->
            <div id="onto-edit-panel" class="cls-frame onto-collapsible" style="display:none">
                <div class="cls-frame-bar"><span class="cls-frame-tag">✏️ Edit Ontology</span></div>
                <div class="cls-frame-body" style="padding:12px;display:flex;flex-direction:column;gap:10px">
                    <input type="hidden" id="onto-edit-orig-name">
                    <div style="display:flex;gap:10px;flex-wrap:wrap">
                        <div class="form-group" style="margin:0;flex:1;min-width:160px">
                            <label>Name *</label>
                            <input type="text" id="onto-edit-name" style="width:100%">
                        </div>
                        <div class="form-group" style="margin:0;flex:2;min-width:260px">
                            <label>Path * <span style="font-size:10px;color:var(--text-dim)">(directory)</span></label>
                            <div style="display:flex;gap:4px">
                                <input type="text" id="onto-edit-path" style="flex:1;min-width:0">
                                <button class="btn-sm btn-secondary" onclick="FsBrowser.open('onto-edit-path')" title="Browse">📁</button>
                            </div>
                        </div>
                    </div>
                    <div style="display:flex;gap:10px;flex-wrap:wrap">
                        <div class="form-group" style="margin:0;flex:0 0 auto">
                            <label>Prefix</label>
                            <input type="text" id="onto-edit-prefix" style="width:90px">
                        </div>
                        <div class="form-group" style="margin:0;flex:2;min-width:260px">
                            <label>URI (base IRI) *</label>
                            <input type="text" id="onto-edit-uri" style="width:100%">
                        </div>
                    </div>
                    <div style="display:flex;gap:8px">
                        <button class="btn-primary btn-sm" onclick="APP.doSaveEdit()">💾 Save changes</button>
                        <button class="btn-secondary btn-sm" onclick="APP.toggleOntoPanel('onto-edit-panel')">Cancel</button>
                    </div>
                </div>
            </div>

            <!-- ── Registry table ── -->
            <div class="cls-frame">
                <div class="cls-frame-bar">
                    <span class="cls-frame-tag">Ontology Registry</span>
                    <span id="onto-registry-count" style="font-size:11px;color:var(--text-dim);margin-left:8px"></span>
                </div>
                <div class="cls-frame-body" style="padding:0;overflow:hidden">
                    <table class="entity-table onto-store-table">
                        <thead><tr>
                            <th style="width:110px">Status</th>
                            <th>Name</th>
                            <th>Path</th>
                            <th style="width:70px">Prefix</th>
                            <th>URI</th>
                            <th style="width:180px"></th>
                        </tr></thead>
                        <tbody id="onto-registry-body">
                            <tr><td colspan="6" class="onto-table-empty">Loading…</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>`;
    },

    // ── Actions Ontologies ───────────────────────────────────

    toggleOntoPanel(id) {
        const el = document.getElementById(id);
        if (!el) return;
        // Fermer les autres panneaux ouverts
        ['onto-new-panel','onto-edit-panel'].forEach(pid => {
            if (pid !== id) {
                const other = document.getElementById(pid);
                if (other) other.style.display = 'none';
            }
        });
        const wasHidden = el.style.display === 'none';
        el.style.display = wasHidden ? '' : 'none';
        // Reset du formulaire New Ontology à chaque ouverture
        if (wasHidden && id === 'onto-new-panel') {
            ['onto-new-name','onto-new-path','onto-new-uri'].forEach(fid => {
                const f = document.getElementById(fid);
                if (f) f.value = '';
            });
            const d = document.getElementById('onto-new-prefix');
            if (d) d.value = 'onto';
            const fn = document.getElementById('onto-new-fname');
            if (fn) fn.value = '';
            this._importFilePath = null;
        }
    },



    async doCreateOntology() {
        const name   = document.getElementById('onto-new-name')?.value.trim();
        const dir    = document.getElementById('onto-new-path')?.value.trim();
        const uri    = document.getElementById('onto-new-uri')?.value.trim();
        const prefix = document.getElementById('onto-new-prefix')?.value.trim() || 'onto';
        if (!name) return UI.error('Name is required.');
        if (!dir)  return UI.error('Path is required.');
        if (!uri)  return UI.error('URI is required.');
        // Construire le chemin complet : dossier + nom.json
        const path = dir.replace(/\/$/, '') + '/' + name + '.json';
        try {
            if (this._importFilePath) {
                // Import depuis chemin filesystem (enregistre sans connecter)
                await API.importFromPath({ name, owl_path: this._importFilePath, save_path: path, uri, prefix });
                // Déconnecter après import (import-from-path connecte automatiquement côté backend)
                await API.disconnectOntology();
                UI.success(`Ontology "${name}" added to registry.`);
                this._importFilePath = null;
            } else {
                // Create from scratch : enregistrer uniquement
                await API.registerOntology({ name, path, uri, prefix });
                UI.success(`Ontology "${name}" added to registry.`);
            }
            await this.refresh();
            this.renderOntologies();
        } catch (e) { UI.error(e.message); }
    },

    doEditOntology(name) {
        // Récupérer l'entrée dans la liste affichée
        API.listOntologies().then(list => {
            const o = list.find(e => e.name === name);
            if (!o) return;
            document.getElementById('onto-edit-orig-name').value = o.name;
            document.getElementById('onto-edit-name').value    = o.name;
            // Afficher le dossier (sans le nom de fichier)
            const dir = o.path.substring(0, o.path.lastIndexOf('/') + 1);
            document.getElementById('onto-edit-path').value   = dir;
            document.getElementById('onto-edit-prefix').value = o.prefix;
            document.getElementById('onto-edit-uri').value    = o.uri;
            // Ouvrir le panel (ferme les autres)
            ['onto-new-panel'].forEach(pid => {
                const p = document.getElementById(pid);
                if (p) p.style.display = 'none';
            });
            const panel = document.getElementById('onto-edit-panel');
            if (panel) panel.style.display = '';
            panel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }).catch(e => UI.error(e.message));
    },

    async doSaveEdit() {
        const origName = document.getElementById('onto-edit-orig-name')?.value.trim();
        const name     = document.getElementById('onto-edit-name')?.value.trim();
        const dir      = document.getElementById('onto-edit-path')?.value.trim();
        const prefix   = document.getElementById('onto-edit-prefix')?.value.trim() || 'onto';
        const uri      = document.getElementById('onto-edit-uri')?.value.trim();
        if (!name)  return UI.error('Name is required.');
        if (!dir)   return UI.error('Path is required.');
        if (!uri)   return UI.error('URI is required.');
        // Reconstruire le chemin complet (dir + nom original de fichier si même nom, sinon name.json)
        const filename = name + '.json';
        const path = dir.replace(/\/$/, '') + '/' + filename;
        try {
            await API.updateOntologyEntry(origName, { name, path, uri, prefix });
            UI.success(`Ontology "${name}" updated.`);
            document.getElementById('onto-edit-panel').style.display = 'none';
            await this.refresh();
            this.renderOntologies();
        } catch (e) { UI.error(e.message); }
    },

    async doConnect(name) {
        try {
            await API.connectOntology(name);
            UI.success(`Ontology "${name}" connected.`);
            await this.refresh();
            this.renderOntologies();
        } catch (e) { UI.error(e.message); }
    },

    async doDisconnect() {
        try {
            await API.disconnectOntology();
            UI.success('Ontology disconnected.');
            await this.refresh();
            this.renderSection(this.currentSection);
        } catch (e) { UI.error(e.message); }
    },

    async doUnregister(name) {
        if (!await UI.confirm(`Remove <strong>${name}</strong> from the registry?<br><small style="color:var(--text-dim)">The file on disk will not be deleted.</small>`)) return;
        try {
            await API.unregisterOntology(name);
            UI.success(`"${name}" removed from registry.`);
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
        } catch (e) { UI.error(`Erreur d'export : ${e.message}`); }
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


// ── Filesystem Browser ───────────────────────────────────────

const FsBrowser = {
    _targetFieldId: null,
    _currentPath: '/Users/bernard/AppData',
    _pendingFilename: '',   // filename typed in the bottom bar
    _fileTypes: null,       // extensions acceptées (null = .json uniquement)

    open(targetFieldId, fileTypes = null) {
        this._fileTypes = fileTypes;
        return this._open(targetFieldId);
    },

    _open(targetFieldId) {
        this._targetFieldId = targetFieldId;
        const current = document.getElementById(targetFieldId)?.value.trim();
        if (current && current.startsWith('/')) {
            const parts = current.split('/');
            parts.pop();
            this._currentPath = parts.join('/') || '/Users/bernard/AppData';
            this._pendingFilename = current.split('/').pop() || '';
        } else {
            this._currentPath = '/Users/bernard/AppData';
            this._pendingFilename = '';
        }
        this._renderModal();
        this._load(this._currentPath);
    },

    _renderModal() {
        document.getElementById('fs-browser-overlay')?.remove();
        const overlay = document.createElement('div');
        overlay.id = 'fs-browser-overlay';
        overlay.className = 'fs-browser-overlay';
        overlay.innerHTML = `
            <div class="fs-browser-modal">
                <div class="fs-browser-header">
                    <span style="font-weight:600;font-size:13px">📁 Browse Filesystem</span>
                    <button class="btn-sm" onclick="FsBrowser.close()">✕</button>
                </div>
                <div class="fs-browser-breadcrumb" id="fs-breadcrumb">${this._currentPath}</div>
                <div class="fs-browser-list" id="fs-list">
                    <div class="fs-loading">Loading…</div>
                </div>
                <div class="fs-browser-footer">
                    <span style="font-size:10px;color:var(--text-dim);white-space:nowrap">Folder:</span>
                    <code style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:var(--text2)" id="fs-selected-path">${this._currentPath}/</code>
                    <button class="btn-primary btn-sm" id="fs-select-btn"
                            data-dir="${this._currentPath}/"
                            onclick="FsBrowser.confirm(this.dataset.dir)">Select this folder</button>
                    <button class="btn-secondary btn-sm" onclick="FsBrowser.close()">Cancel</button>
                </div>
            </div>`;
        overlay.addEventListener('click', e => { if (e.target === overlay) this.close(); });
        document.body.appendChild(overlay);
    },

    async _load(path) {
        const list = document.getElementById('fs-list');
        const breadcrumb = document.getElementById('fs-breadcrumb');
        if (list) list.innerHTML = '<div class="fs-loading">Loading…</div>';
        try {
            const extParam = (this._fileTypes || ['.json']).join(',');
            const data = await API.fsBrowse(path, extParam);
            this._currentPath = data.current;
            const dir = data.current.replace(/\/$/, '') + '/';
            const selPath = document.getElementById('fs-selected-path');
            if (selPath) selPath.textContent = dir;
            const btn = document.getElementById('fs-select-btn');
            if (btn) btn.dataset.dir = dir;

            // Breadcrumb
            if (breadcrumb) {
                const parts = data.current.split('/').filter(Boolean);
                let built = '';
                const crumbs = parts.map((part, i) => {
                    built += '/' + part;
                    const p = built;
                    return `<span class="fs-crumb" onclick="FsBrowser._load('${p}')">${part}</span>`;
                });
                breadcrumb.innerHTML =
                    `<span class="fs-crumb" onclick="FsBrowser._load('/Users/bernard')">🏠</span>` +
                    (crumbs.length ? ' / ' + crumbs.join(' / ') : '');
            }

            // List
            if (!list) return;
            let html = '';
            if (data.parent && data.current !== '/Users/bernard') {
                html += `<div class="fs-item fs-item-dir" onclick="FsBrowser._load('${data.parent}')">
                    <span class="fs-icon">⬆️</span><span>..</span></div>`;
            }
            data.dirs.forEach(d => {
                const safePath = d.path.replace(/'/g, "\\'");
                html += `<div class="fs-item fs-item-dir" onclick="FsBrowser._load('${safePath}')">
                    <span class="fs-icon">📁</span><span>${d.name}</span></div>`;
            });
            data.files.forEach(f => {
                const safePath = f.path.replace(/'/g, "\\'");
                const safeName = f.name.replace(/'/g, "\\'");
                html += `<div class="fs-item fs-item-file" onclick="FsBrowser._selectFile('${safePath}','${safeName}',this)">
                    <span class="fs-icon">📄</span><span>${f.name}</span></div>`;
            });
            if (!html) html = '<div class="fs-loading" style="color:var(--text-dim)">Empty folder</div>';
            list.innerHTML = html;
        } catch (e) {
            const msg = e.message?.includes('403') || e.message?.includes('Permission')
                ? 'Permission denied — this folder is not accessible from Docker.'
                : `Cannot open this folder: ${e.message}`;
            if (list) list.innerHTML = `<div class="fs-loading" style="color:#c55">${msg}</div>`;
        }
    },

    _selectedFile: null,   // { name, dir } du fichier cliqué

    _selectFile(path, name, el) {
        this._selectedFile = { name, dir: this._currentPath };
        // Highlight
        document.querySelectorAll('.fs-item').forEach(e => e.classList.remove('fs-item-selected'));
        el.classList.add('fs-item-selected');
        // Le footer garde le dossier courant — le fichier sélectionné est juste mis en évidence
    },

    confirm(dirFromBtn) {
        // dirFromBtn est passé directement depuis le data-dir du bouton — source fiable
        let dirPath = (dirFromBtn || this._currentPath + '/').replace(/\/$/, '') + '/';

        const pathField = document.getElementById(this._targetFieldId);
        const owlExts = ['.owl','.ttl','.rdf','.xml'];

        if (this._selectedFile) {
            const fname = this._selectedFile.name;
            const isOwl = owlExts.some(e => fname.toLowerCase().endsWith(e));
            const fullFilePath = this._currentPath.replace(/\/$/, '') + '/' + fname;

            if (this._targetFieldId === 'onto-new-fname' && isOwl) {
                // Import from file : chemin complet du fichier OWL
                if (pathField) pathField.value = fullFilePath;
                APP._importFilePath = fullFilePath;
                // Auto-remplir Name et URI si vides
                const base = fname.replace(/\.\w+$/, '');
                const nameF = document.getElementById('onto-new-name');
                if (nameF && !nameF.value.trim()) nameF.value = base;
                const uriF = document.getElementById('onto-new-uri');
                if (uriF && !uriF.value.trim()) uriF.value = `https://example.org/${base}`;
            } else {
                // Path (dossier) : on injecte le dossier + pré-remplit Name
                if (pathField) pathField.value = dirPath;
                const nameField = document.getElementById('onto-new-name');
                if (nameField && !nameField.value.trim())
                    nameField.value = fname.replace(/\.\w+$/, '');
            }
            this._selectedFile = null;
        } else {
            // Pas de fichier sélectionné : injecter le dossier courant
            if (pathField) pathField.value = dirPath;
        }
        this.close();
    },

    close() {
        document.getElementById('fs-browser-overlay')?.remove();
    },
};


// ── Init ─────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', () => {
    APP.init();

});
