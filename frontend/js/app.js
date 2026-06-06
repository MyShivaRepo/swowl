/**
 * app.js — Main application: state, navigation, section rendering
 */

// ── User settings (persisted in localStorage) ───────

const Settings = {

    // ── Available European languages ──────────────────────────
    availableLangs: [
        { code: 'bg', name: 'Български',  nameEn: 'Bulgarian' },
        { code: 'cs', name: 'Čeština',    nameEn: 'Czech' },
        { code: 'da', name: 'Dansk',      nameEn: 'Danish' },
        { code: 'de', name: 'Deutsch',    nameEn: 'German' },
        { code: 'el', name: 'Ελληνικά',   nameEn: 'Greek' },
        { code: 'en', name: 'English',    nameEn: 'English' },
        { code: 'es', name: 'Español',    nameEn: 'Spanish' },
        { code: 'et', name: 'Eesti',      nameEn: 'Estonian' },
        { code: 'fi', name: 'Suomi',      nameEn: 'Finnish' },
        { code: 'fr', name: 'Français',   nameEn: 'French' },
        { code: 'ga', name: 'Gaeilge',    nameEn: 'Irish' },
        { code: 'hr', name: 'Hrvatski',   nameEn: 'Croatian' },
        { code: 'hu', name: 'Magyar',     nameEn: 'Hungarian' },
        { code: 'it', name: 'Italiano',   nameEn: 'Italian' },
        { code: 'lt', name: 'Lietuvių',   nameEn: 'Lithuanian' },
        { code: 'lv', name: 'Latviešu',   nameEn: 'Latvian' },
        { code: 'mt', name: 'Malti',      nameEn: 'Maltese' },
        { code: 'nl', name: 'Nederlands', nameEn: 'Dutch' },
        { code: 'nb', name: 'Norsk',      nameEn: 'Norwegian' },
        { code: 'pl', name: 'Polski',     nameEn: 'Polish' },
        { code: 'pt', name: 'Português',  nameEn: 'Portuguese' },
        { code: 'ro', name: 'Română',     nameEn: 'Romanian' },
        { code: 'sk', name: 'Slovenčina', nameEn: 'Slovak' },
        { code: 'sl', name: 'Slovenščina',nameEn: 'Slovenian' },
        { code: 'sv', name: 'Svenska',    nameEn: 'Swedish' },
    ],

    activeLangs:   ['fr', 'en'],   // active languages (subset of available)
    preferredLang: 'fr',           // preferred language (1 among active)
    namingFormat:  'individual_counter', // default ID format for individuals
    _key: 'swowl_settings',

    get defaultLang() { return this.preferredLang; },

    load() {
        try {
            const s = JSON.parse(localStorage.getItem(this._key) || '{}');
            this.preferredLang = s.preferredLang || 'fr';
            this.activeLangs   = s.activeLangs   || ['fr'];
            if (!this.activeLangs.includes(this.preferredLang))
                this.activeLangs.unshift(this.preferredLang);
            this.namingFormat  = s.namingFormat  || 'individual_counter';
        } catch (_) {}
    },

    save() {
        localStorage.setItem(this._key, JSON.stringify({
            preferredLang: this.preferredLang,
            activeLangs:   this.activeLangs,
            namingFormat:  this.namingFormat,
        }));
    },

    setNamingFormat(fmt) {
        this.namingFormat = fmt;
        this.save();
        APP.renderSection('settings');
    },

    /** Generates a default ID for a new individual based on the chosen format */
    generateIndividualId(classId) {
        const fmt = this.namingFormat;
        if (fmt === 'alphanumeric') {
            const letters = 'abcdefghijklmnopqrstuvwxyz';
            const chars   = 'abcdefghijklmnopqrstuvwxyz0123456789';
            const seg = (forceLetterFirst = false) => {
                const first = forceLetterFirst
                    ? letters[Math.floor(Math.random() * letters.length)]
                    : chars[Math.floor(Math.random() * chars.length)];
                return first + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
            };
            return `${seg(true)}-${seg()}-${seg()}-${seg()}`;
        }
        const existing = APP.state?.individuals || [];
        const counter  = existing.length + 1;
        if (fmt === 'class_counter' && classId) {
            return `${classId}_${counter}`;
        }
        return `Individual_${counter}`;
    },

    setPreferred(lang) {
        if (!this.activeLangs.includes(lang)) this.activeLangs.push(lang);
        this.preferredLang = lang;
        this.save();
        APP.renderSection('settings');
    },

    toggleActive(lang) {
        if (lang === this.preferredLang) return;  // cannot deactivate the preferred language
        if (this.activeLangs.includes(lang))
            this.activeLangs = this.activeLangs.filter(l => l !== lang);
        else
            this.activeLangs.push(lang);
        this.save();
        APP.renderSection('settings');
    },

    /** Opens/closes the active languages dropdown on a LANG field */
    showLangDropdown(btn) {
        document.getElementById('lang-dropdown')?.remove();
        const inp = btn.previousElementSibling;
        if (!inp) return;
        const rect = btn.getBoundingClientRect();
        const dd = document.createElement('div');
        dd.id = 'lang-dropdown';
        dd.style.cssText = `position:fixed;z-index:9999;background:var(--bg2);border:1px solid var(--border);
            border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,.3);min-width:120px;
            top:${rect.bottom+2}px;left:${rect.left}px;overflow:hidden`;
        Settings.activeLangs.forEach(l => {
            const item = document.createElement('div');
            const name = Settings.availableLangs.find(x => x.code === l)?.nameEn || '';
            item.textContent = `${l}${name ? ' — ' + name : ''}`;
            item.style.cssText = `padding:5px 12px;cursor:pointer;font-size:12px;font-family:var(--font-mono);
                ${l === inp.value ? 'background:var(--accent);color:#fff' : ''}`;
            item.onmouseenter = () => { if (l !== inp.value) item.style.background = 'var(--bg3)'; };
            item.onmouseleave = () => { if (l !== inp.value) item.style.background = ''; };
            item.onmousedown = (e) => {
                e.preventDefault();
                inp.value = l;
                inp.dispatchEvent(new Event('change', { bubbles: true }));
                dd.remove();
            };
            dd.appendChild(item);
        });
        document.body.appendChild(dd);
        const close = (e) => {
            if (!dd.contains(e.target) && e.target !== btn) {
                dd.remove();
                document.removeEventListener('click', close, true);
            }
        };
        setTimeout(() => document.addEventListener('click', close, true), 0);
    },
};
Settings.load();

// ── Global state ──────────────────────────────────────────────

const APP = {
    state: {
        ontology: null,
        classes: [],
        object_properties: [],
        datatype_properties: [],
        annotation_properties: [],
        individuals: [],
        swrl_rules: [],
    },
    currentSection: 'ontologies',
    _importFilePath: null,   // path to the OWL file to import

    // ── Navigation history ─────────────────────────────────
    _navHistory: [],     // past states (max 50)
    _navFuture:  [],     // future states (► button)

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
            this.state.classes                = onto.classes                || [];
            this.state.object_properties      = onto.object_properties      || [];
            this.state.datatype_properties    = onto.datatype_properties    || [];
            this.state.annotation_properties  = onto.annotation_properties  || [];
            this.state.individuals            = onto.individuals            || [];
            this.state.swrl_rules             = onto.swrl_rules             || [];
        } catch (e) {
            this.state.ontology = null;
            this.state.classes                = [];
            this.state.object_properties      = [];
            this.state.datatype_properties    = [];
            this.state.annotation_properties  = [];
            this.state.individuals            = [];
            this.state.swrl_rules             = [];
        }
    },

    async refresh() {
        await this.loadState();
        this.updateStats();
        InferenceUI.refresh();
    },

    updateStats() {},

    renderNav() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === this.currentSection);
        });
        this.updateStats();
    },

    // ── History management ──────────────────────────────────────

    /** Returns the current state {section, entityId} */
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

    /** Pushes the current state onto the history stack (max 50) and clears the future */
    _pushHistory() {
        const cur = this._currentState();
        this._navHistory.push(cur);
        if (this._navHistory.length > 50) this._navHistory.shift();
        this._navFuture = [];
        this._updateNavButtons();
    },

    /** Enables/disables the ◀ ► buttons */
    _updateNavButtons() {
        const back = document.getElementById('nav-back');
        const fwd  = document.getElementById('nav-fwd');
        if (back) back.disabled = this._navHistory.length === 0;
        if (fwd)  fwd.disabled  = this._navFuture.length  === 0;
    },

    /** Restores a state {section, entityId} without pushing to history */
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

    /** Entry point for all tab changes initiated by the user */
    navigate(section) {
        this._pushHistory();
        this.renderSection(section);
    },

    /** Go back */
    navigateBack() {
        if (!this._navHistory.length) return;
        this._navFuture.push(this._currentState());
        const prev = this._navHistory.pop();
        this._restoreState(prev);
    },

    /** Go forward */
    navigateForward() {
        if (!this._navFuture.length) return;
        this._navHistory.push(this._currentState());
        const next = this._navFuture.pop();
        this._restoreState(next);
    },

    /** Cross-navigation: switches to section tab and selects entity entityId */
    navigateTo(section, entityId) {
        // Push current state onto history
        this._pushHistory();
        // Pre-position the selection so that restoreSelection() benefits from it
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
        if (section === 'annotation-properties' && entityId) {
            APEditor._selectedId = entityId;
            APEditor._expanded.add(entityId);
            const allBuiltins = [...(Object.values(AP_BUILTINS || {}).flat())].map(p => p.id);
            if (allBuiltins.includes(entityId)) {
                APEditor._expanded.add(entityId.startsWith('rdfs:') ? 'rdfs:' : 'owl:');
            }
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

        // Block editing tabs if no ontology is connected
        const editSections = ['classes','object-properties','datatype-properties','individuals','swrl-rules','inferences'];
        if (!this.state.ontology && editSections.includes(section)) {
            main.innerHTML = this._noOntoMsg();
            return;
        }

        switch (section) {
            case 'settings':
                main.innerHTML = this.renderSettings();
                break;
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
            case 'annotation-properties':
                main.innerHTML = APEditor.renderSplit(this.state.annotation_properties);
                APEditor.restoreSelection();
                break;
            case 'individuals':
                main.innerHTML = IndividualEditor.renderSplit(this.state.individuals);
                IndividualEditor.restoreSelection();
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

    // ── Ontologies tab ────────────────────────────────────

    _selectedOntoName:    null,     // registry row currently selected (click)
    _ontoImportExpanded:  null,     // Set of expanded import path keys (null = not yet init)

    /** Returns the contextual virtual root labels based on the connected ontology's prefix */
    getOntologyRootLabels() {
        const prefix = this.state.ontology?.prefix || '';
        if (prefix === 'rdf' || prefix === 'rdfs') {
            return { classRoot: 'rdfs:Resource', propRoot: 'rdf:Property' };
        }
        return { classRoot: 'owl:Thing', propRoot: 'owl:topObjectProperty' };
    },

    async renderOntologies() {
        const main = document.getElementById('main-content');
        main.innerHTML = this._renderOntologiesShell();
        try {
            const list = await API.listOntologies();
            // Auto-select the connected ontology if nothing is manually selected
            if (!this._selectedOntoName) {
                const conn = list.find(o => o.connected);
                if (conn) this._selectedOntoName = conn.name;
            }
            this._refreshOntoTable(list);
        } catch (e) {
            const tbody = document.getElementById('onto-registry-body');
            if (tbody) tbody.innerHTML =
                `<tr><td colspan="6" class="onto-table-empty">Unable to load the registry.</td></tr>`;
        }
    },

    toggleImportRow(path) {
        if (!this._ontoImportExpanded) this._ontoImportExpanded = new Set();
        if (this._ontoImportExpanded.has(path)) this._ontoImportExpanded.delete(path);
        else this._ontoImportExpanded.add(path);
        // Re-render only the table body (fast, no API call)
        API.listOntologies().then(list => this._refreshOntoTable(list)).catch(() => {});
    },

    selectOntoRow(name) {
        this._selectedOntoName = name;
        document.querySelectorAll('#onto-registry-body tr').forEach(tr => {
            tr.classList.toggle('onto-selected-row', tr.dataset.name === name);
        });
    },

    _renderOntologiesShell() {
        return `
        <div class="onto-page">
            <div class="section-header">
                <h2>Ontologies</h2>
            </div>

            <!-- ── 3 wizard buttons ── -->
            <div style="display:flex;gap:10px;padding:0 0 12px;flex-wrap:wrap">
                <button class="btn-onto-action" onclick="APP._openWizard('new')">
                    <span style="font-size:18px">✨</span>
                    <span class="btn-onto-label">New Ontology</span>
                    <span class="btn-onto-desc">Create a new empty ontology</span>
                </button>
                <button class="btn-onto-action" onclick="APP._openWizard('import')">
                    <span style="font-size:18px">📥</span>
                    <span class="btn-onto-label">Import Ontology</span>
                    <span class="btn-onto-desc">From an existing .owl or .ttl file</span>
                </button>
                <button class="btn-onto-action" onclick="APP._openWizard('load')">
                    <span style="font-size:18px">📂</span>
                    <span class="btn-onto-label">Load Ontology</span>
                    <span class="btn-onto-desc">From an existing .json file</span>
                </button>
                <button class="btn-onto-action" onclick="APP._fetchBuiltins()" id="btn-fetch-builtins">
                    <span class="btn-onto-w3c-badge">W3C</span>
                    <span class="btn-onto-label">Fetch W3C Ontologies</span>
                    <span class="btn-onto-desc">Download RDF, RDFS, OWL from w3.org</span>
                </button>
            </div>

            <!-- ── Wizard panel ── -->
            <div id="onto-wizard" style="display:none;margin-bottom:12px"></div>

            <!-- ── Registry table ── -->
            <div class="cls-frame">
                <div class="cls-frame-bar">
                    <span class="cls-frame-tag">Registry</span>
                    <span id="onto-registry-count" style="font-size:11px;color:var(--text-dim);margin-left:8px"></span>
                </div>
                <div class="cls-frame-body" style="padding:0;overflow:hidden">
                    <table class="entity-table onto-store-table">
                        <thead><tr>
                            <th style="width:32px"></th>
                            <th>Name</th>
                            <th>Directory</th>
                            <th style="width:70px">Prefix</th>
                            <th>NAMESPACE</th>
                            <th style="width:200px"></th>
                        </tr></thead>
                        <tbody id="onto-registry-body">
                            <tr><td colspan="6" class="onto-table-empty">Loading…</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;
    },

    _refreshOntoTable(list) {
        const tbody = document.getElementById('onto-registry-body');
        const count = document.getElementById('onto-registry-count');
        if (count) count.textContent = `${list.length} ontolog${list.length !== 1 ? 'ies' : 'y'}`;
        if (!tbody) return;
        if (!list.length) {
            tbody.innerHTML = `<tr><td colspan="6" class="onto-table-empty">No ontologies yet — use a button above to get started.</td></tr>`;
            return;
        }
        // Sort: user ontologies first (alphabetical), then W3C builtins last in dependency order
        const BUILTIN_ORDER = { 'owl': 1, 'rdfs': 2, 'rdf': 3 };
        list = [...list].sort((a, b) => {
            const aB = a.readonly ? (BUILTIN_ORDER[a.name] ?? 0) : -1;
            const bB = b.readonly ? (BUILTIN_ORDER[b.name] ?? 0) : -1;
            if (a.readonly !== b.readonly) return a.readonly ? 1 : -1;
            if (a.readonly && b.readonly) return aB - bB;
            return a.name.localeCompare(b.name);
        });
        // Resolve URI → registry entry (handles trailing # or not)
        const resolveImport = (uri) =>
            list.find(x => x.uri === uri || x.uri === uri + '#'
                        || uri === x.uri + '#' || uri === x.uri);

        if (!this._ontoImportExpanded) this._ontoImportExpanded = new Set();

        // Recursively render import sub-rows with collapsible toggle
        const renderImportRows = (uri, depth, parentPath, visited = new Set()) => {
            if (visited.has(uri)) return '';
            visited = new Set([...visited, uri]);
            const entry      = resolveImport(uri);
            const name       = entry ? entry.name   : uri;
            const prefix     = entry ? entry.prefix : '';
            const subImports = entry ? (entry.imports || []) : [];
            const hasKids    = subImports.length > 0;
            const path       = parentPath + '/' + name;
            const safeP      = path.replace(/'/g, "\\'");
            const safeN      = name.replace(/'/g, "\\'");
            const isExpanded = this._ontoImportExpanded.has(path);
            const indent     = depth * 20 + 12;
            const toggle     = hasKids
                ? `<span class="onto-import-toggle" onclick="event.stopPropagation();APP.toggleImportRow('${safeP}')"
                         style="cursor:pointer;margin-right:4px;display:inline-block;width:12px;text-align:center;opacity:0.6">
                       ${isExpanded ? '▼' : '▶'}
                   </span>`
                : `<span style="display:inline-block;width:16px;margin-right:4px;opacity:0.4">↳</span>`;
            const row = `
            <tr class="onto-import-subrow" data-path="${path}">
                <td></td>
                <td colspan="4" style="padding-left:${indent}px;font-size:11px;color:var(--text-dim)">
                    ${toggle}
                    <span class="${entry ? 'onto-import-link' : ''}"
                          ${entry ? `onclick="event.stopPropagation();APP._scrollToRegistryRow('${safeN}')" title="Go to ${name}"` : ''}>
                        <code style="color:var(--text2)">${prefix ? prefix + ':' : ''}</code>
                        <span style="font-style:italic">${name}</span>
                    </span>
                </td>
                <td></td>
            </tr>`;
            const children = hasKids && isExpanded
                ? subImports.map(u => renderImportRows(u, depth + 1, path, visited)).join('')
                : '';
            return row + children;
        };

        tbody.innerHTML = list.map(o => {
            const isConn     = o.connected;
            const isReadonly = o.readonly;
            const safe       = o.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
            const dot        = isConn
                ? `<span title="Connected" style="color:#4ade80;font-size:14px">●</span>`
                : `<span title="Disconnected" style="color:var(--text-faint);font-size:14px">○</span>`;
            const connBtn    = isConn
                ? `<button class="btn-sm btn-warn" onclick="APP.doDisconnect()" title="Disconnect">⏏ Disconnect</button>`
                : `<button class="btn-sm btn-edit" onclick="APP.doConnect('${safe}')" title="Connect">▶ Connect</button>`;
            const dirPath    = o.path.substring(0, o.path.lastIndexOf('/') + 1);
            const actions    = isReadonly
                ? `${connBtn}
                   <span title="Read-only W3C ontology" style="font-size:13px;opacity:0.5;margin-left:2px">🔒</span>`
                : `<button class="btn-sm" onclick="APP.doEditOntology('${safe}')" title="Edit attributes">✏️</button>
                   ${connBtn}
                   <button class="btn-sm" onclick="APP._ontoExportDropdown(this,'${safe}','onto')" title="Export ontology">↓ Ontology</button>
                   <button class="btn-sm" onclick="APP._ontoExportDropdown(this,'${safe}','rules')" title="Export rules">↓ Rules</button>
                   <button class="btn-sm btn-del" onclick="APP.doUnregister('${safe}')" title="Remove from registry">✕</button>`;
            // Every user ontology implicitly imports OWL (unless already declared or readonly)
            const effectiveImports = o.readonly
                ? (o.imports || [])
                : (o.imports || []).length
                    ? o.imports
                    : ['http://www.w3.org/2002/07/owl#'];
            const importRows = effectiveImports.map(u => renderImportRows(u, 1, o.name)).join('');
            const isSel = o.name === this._selectedOntoName;
            return `<tr data-name="${o.name}" onclick="APP.selectOntoRow('${safe}')" style="cursor:pointer"
                class="${isConn ? 'onto-current-row' : ''}${isReadonly ? ' onto-readonly-row' : ''}${isSel ? ' onto-selected-row' : ''}">
                <td style="text-align:center">${dot}</td>
                <td><strong>${o.name}</strong>${isReadonly ? ' <span style="font-size:10px;color:var(--text-faint);font-style:italic">W3C</span>' : ''}</td>
                <td class="onto-iri-cell onto-path-cell"
                    title="Click to open in Finder"
                    onclick="API.revealInFinder('${o.path.replace(/'/g,"\\'")}').catch(e=>UI.warn('Start host_agent.py to enable Finder reveal.'))"
                    style="font-size:11px;color:var(--text-dim);cursor:pointer">${dirPath}</td>
                <td><code>${o.prefix}</code></td>
                <td class="onto-iri-cell"><code style="font-size:11px">${o.uri}</code></td>
                <td style="white-space:nowrap">
                    <div style="display:flex;gap:4px;align-items:center;justify-content:flex-end">
                        ${actions}
                    </div>
                </td>
            </tr>${importRows}`;
        }).join('');
    },

    // ── Wizard ────────────────────────────────────────────────

    _openWizard(type) {
        const panel = document.getElementById('onto-wizard');
        if (!panel) return;
        // Toggle off if same wizard already open
        if (panel.dataset.type === type && panel.style.display !== 'none') {
            panel.style.display = 'none';
            panel.dataset.type  = '';
            return;
        }
        panel.dataset.type  = type;
        panel.style.display = '';
        if (type === 'new')    panel.innerHTML = this._wizardNew();
        if (type === 'import') panel.innerHTML = this._wizardImport();
        if (type === 'load')   panel.innerHTML = this._wizardLoad();
        // 'edit' fills the panel itself via doEditOntology()
    },

    _closeWizard() {
        const panel = document.getElementById('onto-wizard');
        if (panel) { panel.style.display = 'none'; panel.dataset.type = ''; }
    },

    _wizardNew() {
        return `
        <div class="cls-frame">
            <div class="cls-frame-bar">
                <span class="cls-frame-tag">✨ New Ontology</span>
                <button class="btn-frame-del" onclick="APP._closeWizard()" style="margin-left:auto">✕</button>
            </div>
            <div class="cls-frame-body" style="padding:14px;display:flex;flex-direction:column;gap:10px">
                <div style="display:flex;gap:10px;flex-wrap:wrap">
                    <div class="form-group" style="margin:0;flex:1;min-width:160px">
                        <label>Name <span class="form-req">*</span></label>
                        <div style="display:flex;align-items:center;gap:4px">
                            <input type="text" id="wiz-new-name" placeholder="MyOntology" style="flex:1;min-width:0">
                            <span style="font-size:11px;color:var(--text-dim);font-family:var(--font-mono)">.json</span>
                        </div>
                    </div>
                    <div class="form-group" style="margin:0;flex:2;min-width:260px">
                        <label>Directory <span class="form-req">*</span></label>
                        <input type="text" id="wiz-new-dir" placeholder="Choose directory…"
                               style="width:100%;cursor:pointer" readonly
                               onclick="FsBrowser.open('wiz-new-dir')">
                    </div>
                </div>
                <div style="display:flex;gap:10px;flex-wrap:wrap">
                    <div class="form-group" style="margin:0;flex:0 0 100px">
                        <label>Prefix</label>
                        <input type="text" id="wiz-new-prefix" value="onto" style="width:100%">
                    </div>
                    <div class="form-group" style="margin:0;flex:2;min-width:260px">
                        <label>Namespace (base URI) <span class="form-req">*</span></label>
                        <input type="text" id="wiz-new-uri" placeholder="https://example.org/my-ontology" style="width:100%">
                    </div>
                </div>
                <div style="display:flex;gap:10px;align-items:center">
                    <button class="btn-primary btn-sm" onclick="APP._doNew()">Add to Registry</button>
                    <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
                        <input type="checkbox" id="wiz-new-connect" checked> Connect immediately
                    </label>
                    <button class="btn-secondary btn-sm" onclick="APP._closeWizard()">Cancel</button>
                </div>
            </div>
        </div>`;
    },

    _wizardImport() {
        return `
        <div class="cls-frame">
            <div class="cls-frame-bar">
                <span class="cls-frame-tag">📥 Import Ontology — .owl / .ttl</span>
                <button class="btn-frame-del" onclick="APP._closeWizard()" style="margin-left:auto">✕</button>
            </div>
            <div class="cls-frame-body" style="padding:14px;display:flex;flex-direction:column;gap:10px">
                <!-- Step 1: source file -->
                <div class="form-group" style="margin:0">
                    <label>Source file <span style="font-size:10px;color:var(--text-dim)">(.owl / .ttl / .rdf)</span> <span class="form-req">*</span></label>
                    <input type="text" id="wiz-imp-src" placeholder="Choose source file…"
                           style="width:100%;cursor:pointer" readonly
                           onclick="FsBrowser.open('wiz-imp-src',['.owl','.ttl','.rdf','.xml'])">
                </div>
                <button class="btn-secondary btn-sm" style="align-self:flex-start"
                        onclick="APP._wizardImportPeek()">🔍 Read Prefix &amp; URI from file</button>
                <!-- Step 2: auto-filled fields -->
                <div style="display:flex;gap:10px;flex-wrap:wrap">
                    <div class="form-group" style="margin:0;flex:0 0 100px">
                        <label>Prefix</label>
                        <input type="text" id="wiz-imp-prefix" value="onto" style="width:100%">
                    </div>
                    <div class="form-group" style="margin:0;flex:2;min-width:260px">
                        <label>Namespace (base URI) <span class="form-req">*</span></label>
                        <input type="text" id="wiz-imp-uri" placeholder="auto-detected…" style="width:100%">
                    </div>
                </div>
                <!-- Step 3: destination -->
                <div style="display:flex;gap:10px;flex-wrap:wrap">
                    <div class="form-group" style="margin:0;flex:1;min-width:160px">
                        <label>Name <span class="form-req">*</span></label>
                        <div style="display:flex;align-items:center;gap:4px">
                            <input type="text" id="wiz-imp-name" placeholder="MyOntology" style="flex:1;min-width:0">
                            <span style="font-size:11px;color:var(--text-dim);font-family:var(--font-mono)">.json</span>
                        </div>
                    </div>
                    <div class="form-group" style="margin:0;flex:2;min-width:260px">
                        <label>Directory <span class="form-req">*</span></label>
                        <input type="text" id="wiz-imp-dir" placeholder="Choose directory…"
                               style="width:100%;cursor:pointer" readonly
                               onclick="FsBrowser.open('wiz-imp-dir')">
                    </div>
                </div>
                <div style="display:flex;gap:10px;align-items:center">
                    <button class="btn-primary btn-sm" onclick="APP._doImport()">Import &amp; Register</button>
                    <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
                        <input type="checkbox" id="wiz-imp-connect" checked> Connect immediately
                    </label>
                    <button class="btn-secondary btn-sm" onclick="APP._closeWizard()">Cancel</button>
                </div>
            </div>
        </div>`;
    },

    _wizardLoad() {
        return `
        <div class="cls-frame">
            <div class="cls-frame-bar">
                <span class="cls-frame-tag">📂 Load Ontology — .json</span>
                <button class="btn-frame-del" onclick="APP._closeWizard()" style="margin-left:auto">✕</button>
            </div>
            <div class="cls-frame-body" style="padding:14px;display:flex;flex-direction:column;gap:10px">
                <div class="form-group" style="margin:0">
                    <label>Source file (.json) <span class="form-req">*</span></label>
                    <input type="text" id="wiz-load-src" placeholder="Choose .json file…"
                           style="width:100%;cursor:pointer" readonly
                           onclick="FsBrowser.open('wiz-load-src',['.json'])">
                </div>
                <button class="btn-secondary btn-sm" style="align-self:flex-start"
                        onclick="APP._wizardLoadPeek()">🔍 Read info from file</button>
                <div style="display:flex;gap:10px;flex-wrap:wrap">
                    <div class="form-group" style="margin:0;flex:1;min-width:160px">
                        <label>Name <span class="form-req">*</span></label>
                        <input type="text" id="wiz-load-name" placeholder="auto-detected…" style="width:100%">
                    </div>
                    <div class="form-group" style="margin:0;flex:0 0 100px">
                        <label>Prefix</label>
                        <input type="text" id="wiz-load-prefix" placeholder="auto-detected…" style="width:100%">
                    </div>
                    <div class="form-group" style="margin:0;flex:2;min-width:260px">
                        <label>Namespace (base URI)</label>
                        <input type="text" id="wiz-load-uri" placeholder="auto-detected…" style="width:100%">
                    </div>
                </div>
                <div style="display:flex;gap:10px;align-items:center">
                    <button class="btn-primary btn-sm" onclick="APP._doLoad()">Load &amp; Register</button>
                    <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer">
                        <input type="checkbox" id="wiz-load-connect" checked> Connect immediately
                    </label>
                    <button class="btn-secondary btn-sm" onclick="APP._closeWizard()">Cancel</button>
                </div>
            </div>
        </div>`;
    },

    // ── Wizard actions ────────────────────────────────────────

    async _doNew() {
        const name   = document.getElementById('wiz-new-name')?.value.trim();
        const dir    = document.getElementById('wiz-new-dir')?.value.trim();
        const prefix = document.getElementById('wiz-new-prefix')?.value.trim() || 'onto';
        const uri    = document.getElementById('wiz-new-uri')?.value.trim();
        const conn   = document.getElementById('wiz-new-connect')?.checked;
        if (!name) return UI.error('Name is required.');
        if (!dir)  return UI.error('Directory is required.');
        if (!uri)  return UI.error('URI is required.');
        const path = dir.replace(/\/$/, '') + '/' + name + '.json';
        try {
            await API.registerOntology({ name, path, uri, prefix });
            UI.success(`Ontology "${name}" added to registry.`);
            if (conn) await API.connectOntology(name);
            this._closeWizard();
            await this.refresh();
            this.renderOntologies();
        } catch (e) { UI.error(e.message); }
    },

    async _wizardImportPeek() {
        const src = document.getElementById('wiz-imp-src')?.value.trim();
        if (!src) return UI.warn('Please select a source file first.');
        try {
            const info = await API.peekOntology(src);
            const nameInp   = document.getElementById('wiz-imp-name');
            const prefixInp = document.getElementById('wiz-imp-prefix');
            const uriInp    = document.getElementById('wiz-imp-uri');
            if (nameInp   && !nameInp.value)   nameInp.value   = info.name   || '';
            if (prefixInp) prefixInp.value = info.prefix || 'onto';
            if (uriInp)    uriInp.value    = info.uri    || '';
            UI.success('Prefix & URI read from file.');
        } catch (e) { UI.error(`Cannot read file: ${e.message}`); }
    },

    async _doImport() {
        const src    = document.getElementById('wiz-imp-src')?.value.trim();
        const name   = document.getElementById('wiz-imp-name')?.value.trim();
        const dir    = document.getElementById('wiz-imp-dir')?.value.trim();
        const prefix = document.getElementById('wiz-imp-prefix')?.value.trim() || 'onto';
        const uri    = document.getElementById('wiz-imp-uri')?.value.trim();
        const conn   = document.getElementById('wiz-imp-connect')?.checked;
        if (!src)  return UI.error('Source file is required.');
        if (!name) return UI.error('Name is required.');
        if (!dir)  return UI.error('Destination directory is required.');
        if (!uri)  return UI.error('URI is required — use 🔍 to auto-detect or enter manually.');
        const savePath = dir.replace(/\/$/, '') + '/' + name + '.json';
        try {
            await API.importFromPath({ name, owl_path: src, save_path: savePath, uri, prefix });
            if (!conn) await API.disconnectOntology();
            UI.success(`Ontology "${name}" imported & registered.`);
            this._closeWizard();
            await this.refresh();
            this.renderOntologies();
        } catch (e) { UI.error(e.message); }
    },

    async _wizardLoadPeek() {
        const src = document.getElementById('wiz-load-src')?.value.trim();
        if (!src) return UI.warn('Please select a .json file first.');
        try {
            const info = await API.peekOntology(src);
            const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
            set('wiz-load-name',   info.name);
            set('wiz-load-prefix', info.prefix);
            set('wiz-load-uri',    info.uri);
            UI.success('Info read from file.');
        } catch (e) { UI.error(`Cannot read file: ${e.message}`); }
    },

    async _doLoad() {
        const src    = document.getElementById('wiz-load-src')?.value.trim();
        const name   = document.getElementById('wiz-load-name')?.value.trim();
        const prefix = document.getElementById('wiz-load-prefix')?.value.trim() || 'onto';
        const uri    = document.getElementById('wiz-load-uri')?.value.trim();
        const conn   = document.getElementById('wiz-load-connect')?.checked;
        if (!src)  return UI.error('Please select a .json file.');
        if (!name) return UI.error('Name is required — use 🔍 to auto-detect.');
        try {
            await API.registerJson(src, name, uri, prefix);
            UI.success(`Ontology "${name}" loaded & registered.`);
            if (conn) await API.connectOntology(name);
            this._closeWizard();
            await this.refresh();
            this.renderOntologies();
        } catch (e) { UI.error(e.message); }
    },

    doEditOntology(name) {
        API.listOntologies().then(list => {
            const o = list.find(e => e.name === name);
            if (!o) return;
            this._openWizard('edit');
            const panel = document.getElementById('onto-wizard');
            if (!panel) return;
            panel.innerHTML = `
            <div class="cls-frame">
                <div class="cls-frame-bar">
                    <span class="cls-frame-tag">✏️ Edit — ${o.name}</span>
                    <button class="btn-frame-del" onclick="APP._closeWizard()" style="margin-left:auto">✕</button>
                </div>
                <div class="cls-frame-body" style="padding:14px;display:flex;flex-direction:column;gap:10px">
                    <input type="hidden" id="wiz-edit-orig" value="${o.name.replace(/"/g,'&quot;')}">
                    <div style="display:flex;gap:10px;flex-wrap:wrap">
                        <div class="form-group" style="margin:0;flex:1;min-width:160px">
                            <label>Name <span class="form-req">*</span></label>
                            <input type="text" id="wiz-edit-name" value="${o.name.replace(/"/g,'&quot;')}" style="width:100%">
                        </div>
                        <div class="form-group" style="margin:0;flex:2;min-width:260px">
                            <label>Directory <span class="form-req">*</span></label>
                            <input type="text" id="wiz-edit-dir"
                                   value="${o.path.substring(0, o.path.lastIndexOf('/')+1).replace(/"/g,'&quot;')}"
                                   style="width:100%;cursor:pointer" readonly
                                   onclick="FsBrowser.open('wiz-edit-dir')">
                        </div>
                    </div>
                    <div style="display:flex;gap:10px;flex-wrap:wrap">
                        <div class="form-group" style="margin:0;flex:0 0 100px">
                            <label>Prefix</label>
                            <input type="text" id="wiz-edit-prefix" value="${o.prefix.replace(/"/g,'&quot;')}" style="width:100%">
                        </div>
                        <div class="form-group" style="margin:0;flex:2;min-width:260px">
                            <label>Namespace (base URI) <span class="form-req">*</span></label>
                            <input type="text" id="wiz-edit-uri" value="${o.uri.replace(/"/g,'&quot;')}" style="width:100%">
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;align-items:center">
                        <button class="btn-primary btn-sm" onclick="APP.doSaveEdit()">💾 Save changes</button>
                        <button class="btn-secondary btn-sm" onclick="APP._closeWizard()">Cancel</button>
                    </div>
                </div>
            </div>`;
        }).catch(e => UI.error(e.message));
    },

    async doSaveEdit() {
        const origName = document.getElementById('wiz-edit-orig')?.value.trim();
        const name     = document.getElementById('wiz-edit-name')?.value.trim();
        const dir      = document.getElementById('wiz-edit-dir')?.value.trim();
        const prefix   = document.getElementById('wiz-edit-prefix')?.value.trim() || 'onto';
        const uri      = document.getElementById('wiz-edit-uri')?.value.trim();
        if (!name) return UI.error('Name is required.');
        if (!dir)  return UI.error('Directory is required.');
        if (!uri)  return UI.error('URI is required.');
        const path = dir.replace(/\/$/, '') + '/' + name + '.json';
        try {
            await API.updateOntologyEntry(origName, { name, path, uri, prefix });
            UI.success(`Ontology "${name}" updated.`);
            this._closeWizard();
            await this.refresh();
            this.renderOntologies();
        } catch (e) { UI.error(e.message); }
    },

    _scrollToRegistryRow(name) {
        const rows = document.querySelectorAll('#onto-registry-body tr[data-name]');
        for (const row of rows) {
            if (row.dataset.name === name) {
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Flash via outline — n'interfère pas avec le background persistant
                row.style.outline = '2px solid var(--accent)';
                row.style.outlineOffset = '-2px';
                setTimeout(() => { row.style.outline = ''; row.style.outlineOffset = ''; }, 1500);
                return;
            }
        }
    },

    async _fetchBuiltins() {
        const btn = document.getElementById('btn-fetch-builtins');
        if (btn) btn.disabled = true;
        UI.success('Fetching W3C ontologies… this may take a few seconds.');
        try {
            const res = await API.fetchBuiltins();
            const fetched = res.results.filter(r => r.status.includes('fetched')).length;
            UI.success(`Done — ${fetched} ontology(ies) fetched & registered.`);
            await this.refresh();
            this.renderOntologies();
        } catch (e) {
            UI.error(`Fetch failed: ${e.message}`);
        } finally {
            if (btn) btn.disabled = false;
        }
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
        } catch (e) { UI.error(`Export error: ${e.message}`); }
    },

    _ontoExportDropdown(btn, name, kind) {
        document.getElementById('onto-export-dd')?.remove();
        const rect = btn.getBoundingClientRect();
        const dd = document.createElement('div');
        dd.id = 'onto-export-dd';
        dd.style.cssText = `position:fixed;z-index:9999;background:var(--bg2);border:1px solid var(--border);
            border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,.3);min-width:130px;
            top:${rect.bottom+2}px;left:${rect.left}px;overflow:hidden`;
        const items = kind === 'onto'
            ? [{ label: '↓ OWL (.owl)', fmt: 'owl' }, { label: '↓ Turtle (.ttl)', fmt: 'ttl' }]
            : [{ label: '↓ SWRL (.json)', fmt: 'swrl' }, { label: '↓ SWORD (.sword)', fmt: 'sword' }];
        items.forEach(({ label, fmt }) => {
            const item = document.createElement('div');
            item.textContent = label;
            item.style.cssText = 'padding:7px 14px;cursor:pointer;font-size:12px';
            item.onmouseenter = () => item.style.background = 'var(--bg3)';
            item.onmouseleave = () => item.style.background = '';
            item.onclick = () => { dd.remove(); APP.exportOntologyByName(name, fmt); };
            dd.appendChild(item);
        });
        document.body.appendChild(dd);
        const close = (e) => {
            if (!dd.contains(e.target) && e.target !== btn) {
                dd.remove(); document.removeEventListener('click', close, true);
            }
        };
        setTimeout(() => document.addEventListener('click', close, true), 0);
    },

    async exportOntologyByName(name, fmt) {
        try {
            const blob = await API.exportOntologyByName(name, fmt);
            const ext  = fmt === 'owl' ? 'owl' : fmt === 'ttl' ? 'ttl' : fmt === 'swrl' ? 'json' : fmt === 'sword' ? 'sword' : 'jsonld';
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `${name}.${ext}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) { UI.error(`Export error: ${e.message}`); }
    },

    // ── Section helpers ─────────────────────────────────────

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
    _currentPath: '/Users/bernard',
    _pendingFilename: '',   // filename typed in the bottom bar
    _fileTypes: null,       // accepted extensions (null = .json only)

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
            this._currentPath = '/Users/bernard';
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
                    ${this._fileTypes !== null
                        ? `<span style="font-size:10px;color:var(--text-dim);white-space:nowrap">File:</span>
                           <code style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:var(--text2)" id="fs-selected-path">— select a file —</code>
                           <button class="btn-primary btn-sm" id="fs-select-btn" disabled
                                   onclick="FsBrowser.confirm()">Select this file</button>`
                        : `<span style="font-size:10px;color:var(--text-dim);white-space:nowrap">Folder:</span>
                           <code style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:var(--text2)" id="fs-selected-path">${this._currentPath}/</code>
                           <button class="btn-primary btn-sm" id="fs-select-btn"
                                   data-dir="${this._currentPath}/"
                                   onclick="FsBrowser.confirm(this.dataset.dir)">Select this folder</button>`}
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
                html += `<div class="fs-item fs-item-file"
                              onclick="FsBrowser._selectFile('${safePath}','${safeName}',this)"
                              ondblclick="FsBrowser._selectFile('${safePath}','${safeName}',this);FsBrowser.confirm()">
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

    _selectedFile: null,   // { name, dir } of the clicked file

    _selectFile(path, name, el) {
        this._selectedFile = { path, name, dir: this._currentPath };
        // Highlight
        document.querySelectorAll('.fs-item').forEach(e => e.classList.remove('fs-item-selected'));
        el.classList.add('fs-item-selected');
        // File mode: enable the button and show the filename
        if (this._fileTypes !== null) {
            const selPath = document.getElementById('fs-selected-path');
            if (selPath) selPath.textContent = path;
            const btn = document.getElementById('fs-select-btn');
            if (btn) btn.disabled = false;
        }
    },

    confirm(dirFromBtn) {
        // dirFromBtn is passed directly from the button's data-dir — reliable source
        const pathField = document.getElementById(this._targetFieldId);

        if (this._fileTypes !== null) {
            // ── File picker mode ──────────────────────────────
            if (!this._selectedFile) return; // nothing selected, stay open
            const fullPath = this._selectedFile.path;
            if (pathField) pathField.value = fullPath;
            this._selectedFile = null;
        } else {
            // ── Folder picker mode ────────────────────────────
            const dirPath = (dirFromBtn || this._currentPath + '/').replace(/\/$/, '') + '/';
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

// ── Undo / Redo ───────────────────────────────────────────────

const UndoRedo = {
    _past:   [],   // snapshots avant mutation
    _future: [],   // snapshots annulés
    _MAX:    20,

    /** Capture l'état courant avant une mutation (appelé par api.js) */
    snapshot() {
        const s = APP.state;
        if (!s.ontology) return;
        const snap = JSON.parse(JSON.stringify({
            classes:             s.classes             || [],
            object_properties:   s.object_properties   || [],
            datatype_properties: s.datatype_properties || [],
            individuals:         s.individuals         || [],
            swrl_rules:          s.swrl_rules          || [],
        }));
        this._past.push(snap);
        if (this._past.length > this._MAX) this._past.shift();
        this._future = [];
        this._updateButtons();
    },

    async undo() {
        if (!this._past.length) return;
        const snap = this._past.pop();
        // Sauvegarder l'état actuel dans future
        const s = APP.state;
        this._future.push(JSON.parse(JSON.stringify({
            classes:             s.classes             || [],
            object_properties:   s.object_properties   || [],
            datatype_properties: s.datatype_properties || [],
            individuals:         s.individuals         || [],
            swrl_rules:          s.swrl_rules          || [],
        })));
        try {
            await API.restoreSnapshot(snap);
            await APP.refresh();
            APP.renderSection(APP.currentSection);
            UI.success('Undo ✓');
        } catch (e) { UI.error('Undo failed: ' + e.message); }
        this._updateButtons();
    },

    async redo() {
        if (!this._future.length) return;
        const snap = this._future.pop();
        const s = APP.state;
        this._past.push(JSON.parse(JSON.stringify({
            classes:             s.classes             || [],
            object_properties:   s.object_properties   || [],
            datatype_properties: s.datatype_properties || [],
            individuals:         s.individuals         || [],
            swrl_rules:          s.swrl_rules          || [],
        })));
        try {
            await API.restoreSnapshot(snap);
            await APP.refresh();
            APP.renderSection(APP.currentSection);
            UI.success('Redo ✓');
        } catch (e) { UI.error('Redo failed: ' + e.message); }
        this._updateButtons();
    },

    _updateButtons() {
        const u = document.getElementById('undo-btn');
        const r = document.getElementById('redo-btn');
        if (u) u.disabled = this._past.length   === 0;
        if (r) r.disabled = this._future.length === 0;
    },
};

// Raccourcis clavier Ctrl+Z / Ctrl+Y
document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault(); UndoRedo.undo();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault(); UndoRedo.redo();
    }
});

// ── Global Search ─────────────────────────────────────────────

const GlobalSearch = {
    _query:     '',
    _focusIdx:  -1,
    _blurTimer: null,
    _items:     [],   // flat list of {section, id, label, sub, dot}

    _dot(type) {
        if (type === 'swrl-rules') return `<span style="flex-shrink:0;font-size:11px">⚙️</span>`;
        const map = { classes: 'cls-dot', 'object-properties': 'op-prop-dot',
                      'datatype-properties': 'dp-prop-dot', 'annotation-properties': 'anno-prop-dot',
                      individuals: 'xsd-dot' };
        return `<span class="${map[type] || 'cls-dot'}" style="flex-shrink:0;margin:0"></span>`;
    },

    /** Retourne le meilleur label d'annotation (langue préférée, sinon premier disponible) */
    _bestLabel(entity) {
        const labels = entity?.annotations?.labels || [];
        if (!labels.length) return '';
        const pref = Settings.preferredLang;
        const byLang = labels.find(l => l.lang === pref);
        return (byLang || labels[0]).value || '';
    },

    /** Retourne true si la query matche l'ID ou n'importe quel label d'annotation */
    _matchEntity(entity, lq) {
        if ((entity.id || '').toLowerCase().includes(lq)) return true;
        return (entity.annotations?.labels || []).some(l =>
            (l.value || '').toLowerCase().includes(lq)
        );
    },

    _search(q) {
        const s   = APP.state;
        const lq  = q.toLowerCase();
        const results = [];
        const push = (section, id, label, sub) => results.push({ section, id, label, sub });

        (s.classes || []).forEach(c => {
            if (!this._matchEntity(c, lq)) return;
            const lbl = this._bestLabel(c);
            push('classes', c.id, lbl || c.id, lbl ? c.id : '');
        });

        (s.object_properties || []).forEach(p => {
            if (!this._matchEntity(p, lq)) return;
            const lbl = this._bestLabel(p);
            push('object-properties', p.id, lbl || p.id, lbl ? p.id : '');
        });

        (s.datatype_properties || []).forEach(p => {
            if (!this._matchEntity(p, lq)) return;
            const lbl = this._bestLabel(p);
            push('datatype-properties', p.id, lbl || p.id, lbl ? p.id : '');
        });

        (APP.state.annotation_properties || []).forEach(p => {
            if ((p.id || '').toLowerCase().includes(lq))
                push('annotation-properties', p.id, p.id, '');
        });

        (s.swrl_rules || []).forEach(r => {
            if (!(r.id || '').toLowerCase().includes(lq) && !(r.label || '').toLowerCase().includes(lq)) return;
            const mainText = r.label || r.id;
            push('swrl-rules', r.id, mainText, mainText !== r.id ? r.id : '');
        });

        (s.individuals || []).forEach(i => {
            const dispLabel = (typeof IndividualEditor !== 'undefined')
                ? IndividualEditor._resolveDisplayLabel(i, null) : '';
            const mainText = dispLabel || i.id;
            const idMatch  = (i.id || '').toLowerCase().includes(lq);
            const lblMatch = mainText.toLowerCase().includes(lq);
            // Chercher aussi sur tous les labels d'annotation
            const annoMatch = (i.annotations?.labels || []).some(l =>
                (l.value || '').toLowerCase().includes(lq)
            );
            if (!idMatch && !lblMatch && !annoMatch) return;
            push('individuals', i.id, mainText, mainText !== i.id ? i.id : '');
        });

        return results;
    },

    _render(results) {
        if (!results.length)
            return `<div class="gs-empty">No results for "<strong>${this._query}</strong>"</div>`;

        const groups = { classes: [], 'object-properties': [], 'datatype-properties': [],
                         'annotation-properties': [], individuals: [], 'swrl-rules': [] };
        const labels = { classes: 'Classes', 'object-properties': 'Object Properties',
                         'datatype-properties': 'Datatype Properties',
                         'annotation-properties': 'Annotation Properties',
                         individuals: 'Individuals', 'swrl-rules': 'SWRL Rules' };

        results.forEach(r => { if (groups[r.section]) groups[r.section].push(r); });

        let flatIdx = 0;
        this._items = results;

        return Object.entries(groups).filter(([, arr]) => arr.length).map(([sec, arr]) => {
            const rows = arr.map(r => {
                const idx = flatIdx++;
                return `<div class="gs-item${idx === this._focusIdx ? ' focused' : ''}" data-idx="${idx}"
                             onmousedown="GlobalSearch._navigate(${idx})"
                             onmouseover="GlobalSearch._hover(${idx})">
                    ${this._dot(sec)}
                    <span class="gs-item-label">${r.label}</span>
                    ${r.sub ? `<span class="gs-item-sub">${r.sub}</span>` : ''}
                </div>`;
            }).join('');
            return `<div class="gs-group-label">${labels[sec]}</div>${rows}`;
        }).join('');
    },

    onInput(val) {
        this._query   = val;
        this._focusIdx = -1;
        const clear = document.getElementById('global-search-clear');
        if (clear) clear.style.display = val ? 'inline' : 'none';

        const drop = document.getElementById('global-search-dropdown');
        if (!drop) return;

        if (!val.trim() || !APP.state.ontology) {
            drop.style.display = 'none';
            return;
        }

        const results = this._search(val.trim());
        drop.innerHTML = this._render(results);
        drop.style.display = 'block';
    },

    _hover(idx) {
        this._focusIdx = idx;
        document.querySelectorAll('.gs-item').forEach((el, i) =>
            el.classList.toggle('focused', i === idx));
    },

    _navigate(idx) {
        const item = this._items[idx];
        if (!item) return;
        this.clear();
        APP.navigateTo(item.section, item.id);
    },

    onKey(e) {
        const drop = document.getElementById('global-search-dropdown');
        if (!drop || drop.style.display === 'none') return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this._focusIdx = Math.min(this._focusIdx + 1, this._items.length - 1);
            this._refreshFocus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this._focusIdx = Math.max(this._focusIdx - 1, 0);
            this._refreshFocus();
        } else if (e.key === 'Enter') {
            if (this._focusIdx >= 0) this._navigate(this._focusIdx);
            else if (this._items.length === 1) this._navigate(0);
        } else if (e.key === 'Escape') {
            this.clear();
        }
    },

    _refreshFocus() {
        document.querySelectorAll('.gs-item').forEach((el, i) =>
            el.classList.toggle('focused', i === this._focusIdx));
        const focused = document.querySelector('.gs-item.focused');
        if (focused) focused.scrollIntoView({ block: 'nearest' });
    },

    onFocus() {
        if (this._blurTimer) { clearTimeout(this._blurTimer); this._blurTimer = null; }
        if (this._query.trim()) this.onInput(this._query);
    },

    onBlur() {
        this._blurTimer = setTimeout(() => {
            const drop = document.getElementById('global-search-dropdown');
            if (drop) drop.style.display = 'none';
        }, 150);
    },

    clear() {
        this._query    = '';
        this._focusIdx = -1;
        this._items    = [];
        const inp   = document.getElementById('global-search-input');
        const drop  = document.getElementById('global-search-dropdown');
        const clear = document.getElementById('global-search-clear');
        if (inp)   { inp.value = ''; inp.blur(); }
        if (drop)  drop.style.display  = 'none';
        if (clear) clear.style.display = 'none';
    },
};

// ── Settings UI ───────────────────────────────────────────────

APP._settingsTab = APP._settingsTab || 'languages';

APP.renderSettings = function() {
    const tab = APP._settingsTab;

    const tabBtn = (id, label) => `
        <div class="settings-vtab${tab === id ? ' active' : ''}"
             onclick="APP._settingsTab='${id}';APP.renderSection('settings')"
             style="padding:10px 16px;cursor:pointer;font-size:13px;font-weight:${tab===id?'600':'400'};
                    border-left:3px solid ${tab===id?'var(--accent)':'transparent'};
                    color:${tab===id?'var(--accent)':'var(--text1)'};
                    background:${tab===id?'var(--bg3)':'transparent'};
                    white-space:nowrap;user-select:none">
            ${label}
        </div>`;

    const sidebar = `
        <div style="width:150px;flex-shrink:0;border-right:1px solid var(--border);padding:8px 0">
            ${tabBtn('languages',     '🌐 Languages')}
            ${tabBtn('naming-rules',  '🏷 IDs Rules')}
        </div>`;

    const pref    = Settings.preferredLang;
    const active  = Settings.activeLangs;
    const avail   = Settings.availableLangs;

    // ── Stage 1: Preferred language ────────────────────────────
    const prefHtml = active.map(code => {
        const name = avail.find(x => x.code === code)?.name || '';
        const isPref = code === pref;
        return `<button class="btn-${isPref ? 'primary' : 'secondary'} btn-sm"
                        onclick="Settings.setPreferred('${code}')"
                        style="min-width:60px;gap:4px"
                        title="${name}">
                    ${isPref ? '★' : '☆'} ${code}
                </button>`;
    }).join('');

    // ── Stage 2: Active languages ───────────────────────────
    const activeHtml = active.map(code => {
        const name = avail.find(x => x.code === code)?.name || '';
        const isPref = code === pref;
        return `<div style="display:inline-flex;align-items:center;gap:2px;
                    background:var(--bg3);border:1px solid var(--border);border-radius:4px;
                    padding:3px 8px;font-size:12px;font-family:var(--font-mono)">
                    <span title="${name}">${code}</span>
                    ${!isPref ? `<button class="btn-frame-del" style="margin-left:4px;font-size:10px"
                        onclick="Settings.toggleActive('${code}')" title="Remove">✕</button>` : ''}
                </div>`;
    }).join('');

    // ── Stage 3: Available languages ──────────────────────
    const availHtml = avail.map(({ code, name }) => {
        const isActive = active.includes(code);
        return `<button class="btn-${isActive ? 'primary' : 'secondary'} btn-sm"
                        onclick="Settings.toggleActive('${code}')"
                        style="min-width:48px;font-size:11px"
                        title="${name}${isActive ? ' — active' : ''}">${code}</button>`;
    }).join('');

    // ── Active tab content ─────────────────────────────
    let tabContent = '';
    if (tab === 'languages') {
        tabContent = `
        <div style="display:flex;flex-direction:column;gap:16px;padding:16px;flex:1;overflow-y:auto">

            <!-- Stage 1: Preferred language -->
            <div class="cls-frame" style="padding:0">
                <div class="cls-frame-bar"><span class="cls-frame-tag">★ Preferred language</span></div>
                <div class="cls-frame-body" style="padding:10px 14px">
                    <p style="margin:0 0 8px;font-size:11px;color:var(--text-dim)">
                        Language applied by default to new <code>rdfs:label</code> and <code>rdfs:comment</code>.
                        Select one among the active languages.
                    </p>
                    <div style="display:flex;flex-wrap:wrap;gap:6px">
                        ${prefHtml || '<span style="font-size:12px;color:var(--text-dim)">No active languages</span>'}
                    </div>
                </div>
            </div>

            <!-- Stage 2: Active languages -->
            <div class="cls-frame" style="padding:0">
                <div class="cls-frame-bar"><span class="cls-frame-tag">◆ Active languages</span></div>
                <div class="cls-frame-body" style="padding:10px 14px">
                    <p style="margin:0 0 8px;font-size:11px;color:var(--text-dim)">
                        Languages available in the LANG dropdown. Add from the list below —
                        the ★ preferred cannot be removed.
                    </p>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;min-height:28px">
                        ${activeHtml || '<span style="font-size:12px;color:var(--text-dim)">—</span>'}
                    </div>
                </div>
            </div>

            <!-- Stage 3: Available languages -->
            <div class="cls-frame" style="padding:0">
                <div class="cls-frame-bar"><span class="cls-frame-tag">◇ Available languages</span></div>
                <div class="cls-frame-body" style="padding:10px 14px">
                    <p style="margin:0 0 8px;font-size:11px;color:var(--text-dim)">
                        All European languages. Click to toggle active / inactive.
                    </p>
                    <div style="display:flex;flex-wrap:wrap;gap:5px">${availHtml}</div>
                </div>
            </div>
        </div>`;
    } else if (tab === 'naming-rules') {
        const fmt = Settings.namingFormat;
        const fmtOption = (id, label, example, desc) => `
            <label style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:6px;cursor:pointer;
                          border:1px solid ${fmt===id?'var(--accent)':'var(--border)'};
                          background:${fmt===id?'var(--bg3)':'var(--bg2)'};margin-bottom:8px">
                <input type="radio" name="naming-fmt" value="${id}" ${fmt===id?'checked':''} style="margin-top:3px;accent-color:var(--accent)"
                       onchange="Settings.setNamingFormat('${id}')">
                <div style="flex:1">
                    <div style="font-weight:600;font-size:13px">${label}</div>
                    <div style="font-size:11px;color:var(--text-dim);margin:2px 0">${desc}</div>
                    <div style="font-family:var(--font-mono);font-size:11px;color:var(--accent);margin-top:4px">ex : ${example}</div>
                </div>
            </label>`;
        tabContent = `
        <div style="display:flex;flex-direction:column;gap:16px;padding:16px;flex:1;overflow-y:auto">
            <div class="cls-frame" style="padding:0">
                <div class="cls-frame-bar"><span class="cls-frame-tag">🏷 Individual ID format</span></div>
                <div class="cls-frame-body" style="padding:12px 14px">
                    <p style="margin:0 0 12px;font-size:11px;color:var(--text-dim)">
                        Format automatically applied when creating a new individual.
                        The ID can still be edited before confirming.
                    </p>
                    ${fmtOption('individual_counter', 'Individual_Counter',  'Individual_123',        'Generic prefix + sequential number based on the number of existing individuals.')}
                    ${fmtOption('class_counter',      'ClassName_Counter','Part_456',             'Name of the selected class + sequential number. Falls back to Individual_N if no class is selected.')}
                    ${fmtOption('alphanumeric',       'Alphanumeric string', 'rgu8j-7t32z-oh7g5-mq78t','4 groups of 5 random alphanumeric characters separated by dashes.')}
                </div>
            </div>
        </div>`;
    }

    return `
    <div style="height:100%;display:flex;flex-direction:column">
        <div style="padding:16px 20px 0;border-bottom:1px solid var(--border)">
            <h2 style="margin:0 0 12px;font-size:18px;font-weight:600">🛠️ Settings</h2>
        </div>
        <div style="display:flex;flex:1;overflow:hidden">
            ${sidebar}
            <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column">
                ${tabContent}
            </div>
        </div>
    </div>`;
};
