/**
 * app.js — Main application: state, navigation, section rendering
 */

// ── Tab visibility (persisted in localStorage) ──────────────────────
const TabVisibility = {
    _key:      'swowl_hidden_tabs',
    _optional: ['annotation-properties','individuals','swrl-rules','views','queries','inferences'],
    _hidden:   new Set(),

    load() {
        try {
            const arr = JSON.parse(localStorage.getItem(this._key) || '[]');
            this._hidden = new Set(arr);
        } catch(_) { this._hidden = new Set(); }
    },

    save() {
        localStorage.setItem(this._key, JSON.stringify([...this._hidden]));
    },

    isHidden(tabId)   { return this._hidden.has(tabId); },
    isOptional(tabId) { return this._optional.includes(tabId); },

    hide(tabId) {
        if (!this.isOptional(tabId)) return;
        this._hidden.add(tabId);
        this.save();
        APP._applyTabVisibility();
        if (APP.currentSection === tabId) APP.navigate('ontologies');
        if (APP.currentSection === 'settings' && APP._settingsTab === 'gui-tabs')
            APP.renderSection('settings');
    },

    show(tabId) {
        this._hidden.delete(tabId);
        this.save();
        APP._applyTabVisibility();
        if (APP.currentSection === 'settings' && APP._settingsTab === 'gui-tabs')
            APP.renderSection('settings');
    },

    toggle(tabId) {
        if (this.isHidden(tabId)) this.show(tabId); else this.hide(tabId);
    }
};

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
        queries: [],
    },
    currentSection: 'ontologies',
    _importFilePath: null,   // path to the OWL file to import

    // ── Navigation history ─────────────────────────────────
    // Stack interne : tableau d'entrées {section, entityId} + curseur.
    // Indépendant de window.history — robuste, prévisible.
    _navStack:  [],   // [{section, entityId}, ...]
    _navCursor: -1,   // index de l'entrée courante

    async init() {
        try {
            await this.loadState();
            this.renderNav();
            this.renderSection(this.currentSection);
            this._updateNavButtons();
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
            this.state.queries                = onto.queries                || [];
            // Merge imported-ontology entities (read-only, tagged _imported)
            try {
                const imp = await API.getImportedEntities();
                this.state.classes               = [...this.state.classes,               ...(imp.classes                || [])];
                this.state.object_properties     = [...this.state.object_properties,     ...(imp.object_properties      || [])];
                this.state.datatype_properties   = [...this.state.datatype_properties,   ...(imp.datatype_properties    || [])];
                this.state.annotation_properties = [...this.state.annotation_properties, ...(imp.annotation_properties  || [])];
                this.state.individuals           = [...this.state.individuals,           ...(imp.individuals            || [])];
                this.state.swrl_rules            = [...this.state.swrl_rules,            ...(imp.swrl_rules             || [])];
                this.state.queries               = [...this.state.queries,               ...(imp.queries                || [])];
                // Merge imported display_rules — local rules take precedence
                if (this.state.ontology && imp.display_rules) {
                    const local = this.state.ontology.display_rules || {};
                    const impDr = imp.display_rules;
                    this.state.ontology.display_rules = {
                        single: { ...(impDr.single || {}), ...(local.single || {}) },
                        multi:  { ...(impDr.multi  || {}), ...(local.multi  || {}) },
                    };
                }
            } catch (_) { /* imported entities are best-effort */ }
        } catch (e) {
            this.state.ontology = null;
            this.state.classes                = [];
            this.state.object_properties      = [];
            this.state.datatype_properties    = [];
            this.state.annotation_properties  = [];
            this.state.individuals            = [];
            this.state.swrl_rules             = [];
            this.state.queries                = [];
        }
        this._updateTopbarOntology();
    },

    _updateTopbarOntology() {
        const el = document.getElementById('topbar-onto-label');
        if (!el) return;
        const onto = this.state.ontology;
        if (onto) {
            const prefix = onto.prefix || '';
            const name   = onto.name   || '';
            const label  = prefix && name ? `${prefix}:${name}` : name || prefix;
            el.textContent = label;
            el.title = 'Go to ontology';
            el.style.display = '';
            el.style.cursor = 'pointer';
            el.onclick = () => {
                APP.navigate('ontologies');
                setTimeout(() => {
                    const row = document.querySelector(`#onto-registry-body tr[data-name="${CSS.escape(name)}"]`);
                    if (row) { row.scrollIntoView({ block: 'center' }); row.classList.add('highlight-flash'); setTimeout(() => row.classList.remove('highlight-flash'), 1200); }
                }, 120);
            };
            const sep = document.querySelector('.topbar-vsep-nav');
            if (sep) sep.style.display = '';
        } else {
            el.textContent = '';
            el.style.display = 'none';
            const sep = document.querySelector('.topbar-vsep-nav');
            if (sep) sep.style.display = 'none';
        }
    },

    async refresh() {
        await this.loadState();
        _TreeCommon.invalidateCaches();   // hierarchy trees changed → drop buildTree caches
        this.updateStats();
        InferenceUI.refresh();
    },

    updateStats() {},

    renderNav() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === this.currentSection);
        });
        this.updateStats();
        APP._applyTabVisibility();
    },

    // ── History management (stack interne) ─────────────────────

    /** Flag : true pendant une restauration — empêche les select* de pousser */
    _historyRestoring: false,

    /** Pousse une entrée dans le stack — uniquement si entityId est renseigné */
    _pushNav(section, entityId) {
        if (this._historyRestoring) return;
        if (!entityId) return;                                   // on n'enregistre que les entités réelles
        // Tronque le futur
        this._navStack  = this._navStack.slice(0, this._navCursor + 1);
        // Dédoublonnage : ne pas pousser si identique à l'entrée courante
        const cur = this._navStack[this._navCursor];
        if (cur && cur.section === section && cur.entityId === entityId) return;
        this._navStack.push({ section, entityId });
        this._navCursor = this._navStack.length - 1;
        if (this._navStack.length > 100) { this._navStack.shift(); this._navCursor--; }
        this._updateNavButtons();
    },

    /** Retourne l'état courant selon les sélections actives */
    _currentState() {
        switch (this.currentSection) {
            case 'classes':             return { section: 'classes',             entityId: ClassEditor._selectedId       || null };
            case 'object-properties':   return { section: 'object-properties',   entityId: OPEditor._selectedId          || null };
            case 'datatype-properties': return { section: 'datatype-properties', entityId: DPEditor._selectedId          || null };
            case 'annotation-properties': return { section: 'annotation-properties', entityId: APEditor._selectedId     || null };
            case 'individuals':         return { section: 'individuals',         entityId: IndividualEditor._selectedIndId || null };
            case 'swrl-rules':          return { section: 'swrl-rules',          entityId: SWRLEditor._selectedId        || null };
            default:                    return { section: this.currentSection,    entityId: null };
        }
    },

    /** Active/désactive les boutons ◀ ► */
    _updateNavButtons() {
        const back = document.getElementById('nav-back');
        const fwd  = document.getElementById('nav-fwd');
        if (back) back.disabled = (this._navCursor <= 0);
        if (fwd)  fwd.disabled  = (this._navCursor >= this._navStack.length - 1);
    },

    /** Positionne les éditeurs sur section+entityId sans rendre ni pousser */
    _applyEntityId(section, entityId) {
        if (!entityId) return;
        switch (section) {
            case 'classes':
                if (entityId === 'owl:Thing') {
                    ClassEditor._owlThingSelected = true;
                    ClassEditor._selectedId       = null;
                } else {
                    ClassEditor._selectedId       = entityId;
                    ClassEditor._owlThingSelected = false;
                    ClassEditor._expandAncestors(entityId);
                }
                break;
            case 'object-properties':
                OPEditor._selectedId      = entityId;
                OPEditor._topPropSelected = false;
                OPEditor._expandAncestors(entityId);
                break;
            case 'datatype-properties':
                DPEditor._selectedId      = entityId;
                DPEditor._topPropSelected = false;
                DPEditor._expandAncestors(entityId);
                break;
            case 'annotation-properties':
                APEditor._selectedId = entityId;
                APEditor._expanded.add(entityId);
                break;
            case 'swrl-rules':
                SWRLEditor._selectedId = entityId;
                break;
            case 'individuals': {
                const targetInd = (APP.state.individuals || []).find(x => x.id === entityId);
                if (targetInd?.types?.length > 0) IndividualEditor._selectedClassId = targetInd.types[0];
                IndividualEditor._selectedIndId = entityId;
                break;
            }
        }
    },

    /** Restaure un état depuis le stack — ne pousse pas */
    _restoreState(state) {
        if (!state?.section) return;
        this._historyRestoring = true;
        this._applyEntityId(state.section, state.entityId);
        this.renderSection(state.section);
        if (state.section === 'individuals' && state.entityId) {
            IndividualEditor.selectIndividual(state.entityId, false, false);
        }
        this._historyRestoring = false;
        this._updateNavButtons();
    },

    /** Renvoie l'entityId actuellement sélectionné dans une section donnée */
    _entityForSection(section) {
        switch (section) {
            case 'classes':               return ClassEditor._selectedId          || null;
            case 'object-properties':     return OPEditor._selectedId             || null;
            case 'datatype-properties':   return DPEditor._selectedId             || null;
            case 'annotation-properties': return APEditor._selectedId             || null;
            case 'individuals':           return IndividualEditor._selectedIndId  || null;
            case 'swrl-rules':            return SWRLEditor._selectedId           || null;
            default:                      return null;
        }
    },

    /** Clic sur un onglet de la nav bar — ne pousse pas dans l'historique */
    navigate(section) {
        this.renderSection(section);
    },

    /** Bouton ◀ */
    navigateBack() {
        if (this._navCursor <= 0) return;
        this._navCursor--;
        this._restoreState(this._navStack[this._navCursor]);
    },

    /** Bouton ► */
    navigateForward() {
        if (this._navCursor >= this._navStack.length - 1) return;
        this._navCursor++;
        this._restoreState(this._navStack[this._navCursor]);
    },

    /** Navigation cross-onglet avec entité cible */
    navigateTo(section, entityId) {
        this._pushNav(section, entityId);
        this._applyEntityId(section, entityId);
        this.renderSection(section);
        if (section === 'individuals') {
            IndividualEditor.selectIndividual(entityId, false, false);
        }
        this._updateNavButtons();
    },

    _noOntoMsg() {
        return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;gap:12px;color:var(--text-dim)">
            <span style="font-size:32px">🔌</span>
            <span style="font-size:14px">No ontology connected.</span>
            <button class="btn-primary btn-sm" onclick="APP.navigate('ontologies')">Go to Ontologies</button>
        </div>`;
    },

    renderSection(section) {
        // Nettoyer le listener de désélection des individuals si on quitte cet onglet
        if (section !== 'individuals' && IndividualEditor._deselectListener) {
            document.removeEventListener('mousedown', IndividualEditor._deselectListener, true);
            IndividualEditor._deselectListener = null;
        }
        // Nettoyer le listener de désélection des classes si on quitte cet onglet
        if (section !== 'classes' && ClassEditor._deselectListener) {
            document.removeEventListener('mousedown', ClassEditor._deselectListener, true);
            ClassEditor._deselectListener = null;
        }
        // Nettoyer le listener de désélection des ObjectProperties si on quitte cet onglet
        if (section !== 'object-properties' && OPEditor._deselectListener) {
            document.removeEventListener('mousedown', OPEditor._deselectListener, true);
            OPEditor._deselectListener = null;
        }
        // Nettoyer le listener de désélection des DatatypeProperties si on quitte cet onglet
        if (section !== 'datatype-properties' && DPEditor._deselectListener) {
            document.removeEventListener('mousedown', DPEditor._deselectListener, true);
            DPEditor._deselectListener = null;
        }
        // Nettoyer le listener de désélection des AnnotationProperties si on quitte cet onglet
        if (section !== 'annotation-properties' && APEditor._deselectListener) {
            document.removeEventListener('mousedown', APEditor._deselectListener, true);
            APEditor._deselectListener = null;
        }
        this.currentSection = section;
        this.renderNav();
        UndoRedo._updateButtons();
        const main = document.getElementById('main-content');

        // Block editing tabs if no ontology is connected
        const editSections = ['classes','object-properties','datatype-properties','individuals','swrl-rules','views','queries','inferences'];
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
            case 'views':
                main.innerHTML = APP.renderViews();
                if (APP._viewsTab === 'ontology')       setTimeout(() => APP._initHyperbolicGraph(), 80);
                if (APP._viewsTab === 'treemap')         setTimeout(() => APP._initTreemap(), 80);
                if (APP._viewsTab === 'knowledge-base')  setTimeout(() => APP._initKnowledgeBase(), 80);
                break;
            case 'queries':
                main.innerHTML = APP.renderQueries();
                if (APP._queriesTab === 'sparnatural') setTimeout(() => APP._initSparnatural(), 80);
                if (APP._queriesTab === 'vizq')        SparqlEditor.restoreSelection();
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
        API.listOntologies().then(list => this._refreshOntoTable(list))
            .catch(e => console.warn('[SWOWL] ontology table refresh failed:', e.message));
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

        const OWL_URI = 'http://www.w3.org/2002/07/owl#';
        // Returns effective imports for any entry: user ontologies always implicitly import OWL
        const effectiveImportsOf = (entry) => {
            if (!entry || entry.readonly) return entry ? (entry.imports || []) : [];
            const declared = entry.imports || [];
            const hasOwl = declared.some(u => u.startsWith('http://www.w3.org/2002/07/owl'));
            return hasOwl ? declared : [...declared, OWL_URI];
        };

        // Recursively render import sub-rows with collapsible toggle.
        // labelMap = import_labels of the parent entry (snapshot of prefix/name per uri),
        // used as a fallback when the imported ontology is no longer in the registry.
        const renderImportRows = (uri, depth, parentPath, labelMap = {}, visited = new Set()) => {
            if (visited.has(uri)) return '';
            visited = new Set([...visited, uri]);
            const entry      = resolveImport(uri);
            const missing    = !entry;
            const snap        = labelMap?.[uri] || null;   // {prefix, name} mémorisé
            const name       = entry ? entry.name   : (snap ? snap.name   : uri);
            const prefix     = entry ? entry.prefix : (snap ? snap.prefix : '');
            const subImports = effectiveImportsOf(entry);
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
                    <span class="${entry ? 'onto-import-link' : 'onto-import-missing'}"
                          ${entry ? `onclick="event.stopPropagation();APP._scrollToRegistryRow('${safeN}')" title="Go to ${name}"` : ''}>
                        <code${missing ? '' : ` style="color:var(--text2)"`}>${prefix ? prefix + ':' : ''}</code>
                        <span style="font-style:italic">${_escapeHtml(uri)}</span>
                    </span>
                    ${missing ? `<span class="onto-import-warn" title="Cette ontologie importée n'est pas dans le registre">⚠ Not in the registry</span>` : ''}
                </td>
                <td></td>
            </tr>`;
            const children = hasKids && isExpanded
                ? subImports.map(u => renderImportRows(u, depth + 1, path, (entry?.import_labels || {}), visited)).join('')
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
            const importRows = effectiveImportsOf(o).map(u => renderImportRows(u, 1, o.name, o.import_labels || {})).join('');
            const isSel = o.name === this._selectedOntoName;
            return `<tr data-name="${o.name}" onclick="APP.selectOntoRow('${safe}')" style="cursor:pointer"
                class="${isConn ? 'onto-current-row' : ''}${isReadonly ? ' onto-readonly-row' : ''}${isSel ? ' onto-selected-row' : ''}">
                <td style="text-align:center">${dot}</td>
                <td ${!isReadonly ? `oncontextmenu="event.preventDefault();event.stopPropagation();APP._showImportPicker('${safe}',event)" title="Right-click to manage imports"` : ''}>
                    <strong>${o.name}</strong>${isReadonly ? ' <span style="font-size:10px;color:var(--text-faint);font-style:italic">W3C</span>' : ''}
                </td>
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
        const prefix = document.getElementById('wiz-new-prefix')?.value.trim() ?? '';
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
        const prefix = document.getElementById('wiz-imp-prefix')?.value.trim() ?? '';
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
        const prefix = document.getElementById('wiz-load-prefix')?.value.trim() ?? '';
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
        const prefix   = document.getElementById('wiz-edit-prefix')?.value.trim() ?? '';
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

    // ── Import picker ─────────────────────────────────────────

    async _showImportPicker(name) {
        const list = await API.listOntologies().catch(() => []);
        const target = list.find(o => o.name === name);
        if (!target) return;

        let importables;
        try {
            importables = await API.listImportableOntologies(name);
        } catch (e) {
            UI.error(`Cannot load importable ontologies: ${e.message}`);
            return;
        }
        if (!importables.length) {
            UI.warn('No other ontology with a namespace and prefix is registered yet.');
            return;
        }

        const currentImports = new Set(target.imports || []);

        // Remove existing modal if any
        document.getElementById('onto-import-picker-modal')?.remove();

        const rows = importables.map(o => `
            <label class="onto-import-picker-row">
                <input type="checkbox" value="${_escapeHtml(o.uri)}"
                    ${currentImports.has(o.uri) ? 'checked' : ''}>
                <span class="onto-import-picker-name">${_escapeHtml(o.name)}</span>
                <code class="onto-import-picker-prefix">${_escapeHtml(o.prefix)}:</code>
                <span class="onto-import-picker-uri">${_escapeHtml(o.uri)}</span>
            </label>`).join('');

        const modal = document.createElement('div');
        modal.id = 'onto-import-picker-modal';
        modal.className = 'onto-import-picker-overlay';
        modal.innerHTML = `
            <div class="onto-import-picker-box">
                <div class="cls-frame-bar" style="border-radius:6px 6px 0 0">
                    <span class="cls-frame-tag">📥 Import ontologies into <strong>${_escapeHtml(name)}</strong></span>
                    <button class="btn-frame-del" onclick="document.getElementById('onto-import-picker-modal').remove()" style="margin-left:auto">✕</button>
                </div>
                <div class="onto-import-picker-list">${rows || '<p class="empty" style="padding:12px">No ontologies available.</p>'}</div>
                <div style="display:flex;gap:8px;justify-content:flex-end;padding:10px 14px;border-top:1px solid var(--border1)">
                    <button class="btn-sm" onclick="document.getElementById('onto-import-picker-modal').remove()">Cancel</button>
                    <button class="btn-sm btn-edit" onclick="APP._confirmImportPicker('${_escapeHtml(name)}')">✔ Apply</button>
                </div>
            </div>`;
        // Close on backdrop click
        modal.addEventListener('mousedown', e => { if (e.target === modal) modal.remove(); });
        document.body.appendChild(modal);
    },

    async _confirmImportPicker(name) {
        const modal = document.getElementById('onto-import-picker-modal');
        if (!modal) return;
        const checked = [...modal.querySelectorAll('input[type=checkbox]:checked')].map(cb => cb.value);
        try {
            await API.updateOntologyImports(name, checked);
            UI.success(`Imports updated for "${name}".`);
        } catch (e) {
            UI.error(`Failed to update imports: ${e.message}`);
            return;
        }
        modal.remove();
        await APP.refresh();
        APP.renderOntologies();
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
            // Re-render the current section so imported entities appear immediately
            this.renderSection(this.currentSection);
            // Also refresh the ontologies table (green dot update) if not already there
            if (this.currentSection !== 'ontologies') {
                API.listOntologies().then(list => {
                    const tbody = document.getElementById('onto-registry-body');
                    if (tbody) this._refreshOntoTable(list);
                }).catch(() => {});
            }
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

    _delFileOnUnregister: false,
    async doUnregister(name) {
        this._delFileOnUnregister = false;
        const html = `Remove <strong>${name}</strong> from the registry?<br>
            <label style="display:flex;align-items:center;gap:6px;margin-top:10px;font-size:12px;color:var(--text-dim);cursor:pointer">
                <input type="checkbox" onchange="APP._delFileOnUnregister=this.checked">
                Delete also the .json file?
            </label>`;
        if (!await UI.confirm(html)) return;
        const deleteFile = this._delFileOnUnregister;
        try {
            const res = await API.unregisterOntology(name, deleteFile);
            UI.success(deleteFile && res?.file_deleted
                ? `"${name}" removed from registry and .json file deleted.`
                : `"${name}" removed from registry.`);
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
    _past:   [],   // snapshots avant mutation  { data, section, entityId }
    _future: [],   // snapshots annulés          { data, section, entityId }
    _MAX:    20,

    // Onglets pour lesquels l'Undo/Redo est actif
    _VALID: new Set([
        'classes', 'object-properties', 'datatype-properties',
        'annotation-properties', 'individuals', 'swrl-rules',
    ]),

    /** N'inclut QUE les entités locales — les entités importées (lecture seule, taguées
     *  _imported) ne doivent jamais être persistées dans l'ontologie courante. */
    _localData() {
        const s = APP.state;
        const local = (arr) => (arr || []).filter(e => !e._imported);
        return JSON.parse(JSON.stringify({
            classes:               local(s.classes),
            object_properties:     local(s.object_properties),
            datatype_properties:   local(s.datatype_properties),
            annotation_properties: local(s.annotation_properties),
            individuals:           local(s.individuals),
            swrl_rules:            local(s.swrl_rules),
            queries:               local(s.queries),
        }));
    },

    /** Capture l'état courant avant une mutation (appelé par api.js) */
    snapshot() {
        const s = APP.state;
        if (!s.ontology) return;
        const section  = APP.currentSection;
        const entityId = this._VALID.has(section) ? (APP._entityForSection(section) || null) : null;
        this._past.push({ section, entityId, data: this._localData() });
        if (this._past.length > this._MAX) this._past.shift();
        this._future = [];
        this._updateButtons();
    },

    /** Construit un snapshot de l'état actuel (pour future/past) */
    _currentSnap() {
        const section  = APP.currentSection;
        const entityId = this._VALID.has(section) ? (APP._entityForSection(section) || null) : null;
        return { section, entityId, data: this._localData() };
    },

    /** Restaure un snapshot et navigue vers le bon onglet */
    async _apply(snap) {
        await API.restoreSnapshot(snap.data);
        await APP.refresh();
        // Naviguer vers l'onglet + entité du snapshot (même pattern que _restoreState)
        if (snap.section && this._VALID.has(snap.section)) {
            APP._historyRestoring = true;
            APP._applyEntityId(snap.section, snap.entityId);
            APP.renderSection(snap.section);
            if (snap.section === 'individuals' && snap.entityId) {
                IndividualEditor.selectIndividual(snap.entityId, false, false);
            }
            APP._historyRestoring = false;
        } else {
            APP.renderSection(APP.currentSection);
        }
    },

    async undo() {
        if (!this._past.length) return;
        const snap = this._past.pop();
        this._future.push(this._currentSnap());
        try {
            await this._apply(snap);
            UI.success('Undo ✓');
        } catch (e) { UI.error('Undo failed: ' + e.message); }
        this._updateButtons();
    },

    async redo() {
        if (!this._future.length) return;
        const snap = this._future.pop();
        this._past.push(this._currentSnap());
        try {
            await this._apply(snap);
            UI.success('Redo ✓');
        } catch (e) { UI.error('Redo failed: ' + e.message); }
        this._updateButtons();
    },

    _updateButtons() {
        const onValidTab = this._VALID.has(APP.currentSection);
        const u = document.getElementById('undo-btn');
        const r = document.getElementById('redo-btn');
        if (u) u.disabled = !onValidTab || this._past.length   === 0;
        if (r) r.disabled = !onValidTab || this._future.length === 0;
    },
};

// Raccourcis clavier Ctrl+Z / Ctrl+Y — actifs uniquement sur les 6 onglets valides
document.addEventListener('keydown', e => {
    if (!UndoRedo._VALID.has(APP.currentSection)) return;
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
        if (type === 'swrl-rules')  return `<span style="flex-shrink:0;font-size:11px">⚙️</span>`;
        if (type === 'sparql-vizq') return `<span style="flex-shrink:0;font-size:11px">🎯</span>`;
        const map = { classes: 'cls-dot', 'object-properties': 'op-prop-dot',
                      'datatype-properties': 'dp-prop-dot', 'annotation-properties': 'anno-prop-dot',
                      individuals: 'xsd-dot' };
        return `<span class="${map[type] || 'cls-dot'}" style="flex-shrink:0;margin:0"></span>`;
    },

    _search(q) {
        const s  = APP.state;
        const lq = q.toLowerCase();
        const results = [];

        // ── helpers ─────────────────────────────────────────────────────────
        const _idMatch    = (e) => (e.id || '').toLowerCase().includes(lq);
        const _lblMatches = (e) => (e.annotations?.labels || []).filter(l =>
            (l.value || '').toLowerCase().includes(lq));

        // ── A. USER LABELS ───────────────────────────────────────────────────

        // A1. rdfs:label — toutes entités avec annotations.labels
        [
            ...(s.classes               || []).map(e => ({ e, kind: 'classes' })),
            ...(s.object_properties     || []).map(e => ({ e, kind: 'object-properties' })),
            ...(s.datatype_properties   || []).map(e => ({ e, kind: 'datatype-properties' })),
            ...(s.annotation_properties || []).map(e => ({ e, kind: 'annotation-properties' })),
            ...(s.individuals           || []).map(e => ({ e, kind: 'individuals' })),
        ].forEach(({ e, kind }) => {
            _lblMatches(e).forEach(l =>
                results.push({ section: 'rdfs-labels', id: e.id, label: l.value, lang: l.lang || '', kind })
            );
        });

        // A2. SWRL labels (label ≠ id)
        (s.swrl_rules || []).forEach(r => {
            const lbl = r.label || '';
            if (lbl && lbl !== r.id && lbl.toLowerCase().includes(lq))
                results.push({ section: 'swrl-labels', id: r.id, label: lbl });
        });

        // A3. SPARQL VizQ labels (label ≠ id)
        const sparqlQueries = (typeof SparqlEditor !== 'undefined') ? SparqlEditor._loadAll() : [];
        sparqlQueries.forEach(sq => {
            const lbl = sq.label || '';
            if (lbl && lbl !== sq.id && lbl.toLowerCase().includes(lq))
                results.push({ section: 'sparql-labels', id: sq.id, label: lbl });
        });

        // A4. Individual display names (displayName ≠ id)
        (s.individuals || []).forEach(i => {
            const dn = (typeof IndividualEditor !== 'undefined')
                ? IndividualEditor._resolveDisplayLabel(i, null) : '';
            if (dn && dn !== i.id && dn.toLowerCase().includes(lq))
                results.push({ section: 'individual-names', id: i.id, label: dn });
        });

        // ── B. SYSTEM IDs ────────────────────────────────────────────────────
        (s.classes               || []).forEach(c => { if (_idMatch(c)) results.push({ section: 'classes',               id: c.id, label: c.id }); });
        (s.object_properties     || []).forEach(p => { if (_idMatch(p)) results.push({ section: 'object-properties',     id: p.id, label: p.id }); });
        (s.datatype_properties   || []).forEach(p => { if (_idMatch(p)) results.push({ section: 'datatype-properties',   id: p.id, label: p.id }); });
        (s.annotation_properties || []).forEach(p => { if (_idMatch(p)) results.push({ section: 'annotation-properties', id: p.id, label: p.id }); });
        (s.individuals           || []).forEach(i => { if (_idMatch(i)) results.push({ section: 'individuals',           id: i.id, label: i.id }); });
        (s.swrl_rules            || []).forEach(r => { if (_idMatch(r)) results.push({ section: 'swrl-rules',            id: r.id, label: r.id }); });
        sparqlQueries.forEach(sq => {
            if ((sq.id || '').toLowerCase().includes(lq))
                results.push({ section: 'sparql-vizq', id: sq.id, label: sq.id });
        });

        return results;
    },

    _render(results) {
        if (!results.length)
            return `<div class="gs-empty">No results for "<strong>${_escapeHtml(this._query)}</strong>"</div>`;

        // Ordre des sections : A avant B
        const groups = {
            'rdfs-labels': [], 'individual-names': [], 'swrl-labels': [], 'sparql-labels': [],
            'classes': [], 'object-properties': [], 'datatype-properties': [],
            'annotation-properties': [], 'individuals': [], 'swrl-rules': [], 'sparql-vizq': [],
        };
        const sectionLabels = {
            'rdfs-labels':          'rdfs:label',
            'swrl-labels':          'SWRL Labels',
            'sparql-labels':        'SPARQL Labels',
            'individual-names':     'Individual Display Name',
            'classes':              'Classes',
            'object-properties':    'Object Properties',
            'datatype-properties':  'Datatype Properties',
            'annotation-properties':'Annotation Properties',
            'individuals':          'Individuals',
            'swrl-rules':           'SWRL Rules',
            'sparql-vizq':          'SPARQL VizQ',
        };

        results.forEach(r => { if (r.section in groups) groups[r.section].push(r); });

        this._items = [];  // reconstruit dans l'ordre d'affichage → data-idx cohérent

        // Super-sections : Partie A (User Labels) et Partie B (System IDs)
        const _PART_A = new Set(['rdfs-labels', 'individual-names', 'swrl-labels', 'sparql-labels']);
        const _PART_B = new Set(['classes', 'object-properties', 'datatype-properties',
                                  'annotation-properties', 'individuals', 'swrl-rules', 'sparql-vizq']);

        const _row = (r, inner) => {
            const idx = this._items.length;
            this._items.push(r);
            const f = idx === this._focusIdx ? ' focused' : '';
            return `<div class="gs-item${f}" data-idx="${idx}"
                         onmousedown="GlobalSearch._navigate(${idx})"
                         onmouseover="GlobalSearch._hover(${idx})">${inner}</div>`;
        };

        let _superShown = { a: false, b: false };
        const html = [];

        Object.entries(groups).filter(([, arr]) => arr.length).forEach(([sec, arr]) => {
            // En-tête de super-section (une seule fois par groupe)
            if (_PART_A.has(sec) && !_superShown.a) {
                html.push(`<div class="gs-super-label">🏷 User Labels</div>`);
                _superShown.a = true;
            } else if (_PART_B.has(sec) && !_superShown.b) {
                html.push(`<div class="gs-super-label">🔑 System IDs</div>`);
                _superShown.b = true;
            }

            // En-tête de sous-section
            html.push(`<div class="gs-group-label">${sectionLabels[sec]}</div>`);

            // Lignes
            arr.forEach(r => {
                let inner;
                switch (sec) {
                    case 'rdfs-labels':
                        inner = `<span class="lbl-dot"></span>
                            <span class="gs-item-label">${_escapeHtml(r.label)}${r.lang ? ` <span class="gs-lang-tag">(${_escapeHtml(r.lang)})</span>` : ''}</span>
                            ${this._dot(r.kind)}
                            <span class="gs-item-sub">${_escapeHtml(r.id)}</span>`;
                        break;
                    case 'swrl-labels':
                        inner = `<span style="flex-shrink:0;font-size:11px">⚙️</span>
                            <span class="gs-item-label">${_escapeHtml(r.label)}</span>
                            <span class="gs-item-sub">${_escapeHtml(r.id)}</span>`;
                        break;
                    case 'sparql-labels':
                        inner = `<span style="flex-shrink:0;font-size:11px">🎯</span>
                            <span class="gs-item-label">${_escapeHtml(r.label)}</span>
                            <span class="gs-item-sub">${_escapeHtml(r.id)}</span>`;
                        break;
                    case 'individual-names':
                        inner = `<span class="xsd-dot" style="flex-shrink:0;margin:0"></span>
                            <span class="gs-item-label">${_escapeHtml(r.label)}</span>
                            <span class="gs-item-sub">${_escapeHtml(r.id)}</span>`;
                        break;
                    default:
                        inner = `${this._dot(sec)}
                            <span class="gs-item-label">${_escapeHtml(r.label)}</span>`;
                }
                html.push(_row(r, inner));
            });
        });

        return html.join('');
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
        // Mapping Part A → section de navigation réelle
        const navMap = {
            'rdfs-labels':      item.kind,
            'swrl-labels':      'swrl-rules',
            'sparql-labels':    'sparql-vizq',
            'individual-names': 'individuals',
        };
        const navSection = navMap[item.section] || item.section;
        // SPARQL VizQ : sélectionner la requête et switcher sur l'onglet vizq
        if (navSection === 'sparql-vizq') {
            APP._queriesTab = 'vizq';
            if (typeof SparqlEditor !== 'undefined') {
                const all = SparqlEditor._loadAll();
                const found = all.find(q => q.id === item.id);
                if (found) SparqlEditor.selectQuery(item.id);
            }
            APP.renderSection('queries');
            return;
        }
        APP.navigateTo(navSection, item.id);
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

// ── Queries UI ────────────────────────────────────────────────────

APP._queriesTab = APP._queriesTab || 'vizq';

APP.renderQueries = function() {
    const tab = APP._queriesTab;

    // ── Sidebar vertical ──────────────────────────────────────────
    const tabBtn = (id, icon, label) => {
        const active = tab === id;
        return `
        <div class="settings-vtab${active ? ' active' : ''}"
             onclick="APP._queriesTab='${id}';APP.renderSection('queries')"
             style="padding:10px 16px;cursor:pointer;font-size:13px;
                    font-weight:${active ? '600' : '400'};user-select:none;
                    border-left:3px solid ${active ? 'var(--accent)' : 'transparent'};
                    color:${active ? 'var(--accent)' : 'var(--text1)'};
                    background:${active ? 'var(--bg3)' : 'transparent'};
                    white-space:nowrap;display:flex;align-items:center;gap:6px">
            ${icon} ${label}
        </div>`;
    };

    const sidebar = `
        <div style="width:160px;flex-shrink:0;border-right:1px solid var(--border);padding:8px 0">
            ${tabBtn('vizq',        '🎯', 'SPARQL VizQ')}
            ${tabBtn('sparnatural', '🔎', 'Sparnatural')}
        </div>`;

    // ── Tab content ───────────────────────────────────────────────
    let content = '';

    if (tab === 'sparnatural') {
        content = `
        <div style="display:flex;flex-direction:column;height:100%;overflow:hidden">
            <div id="sparnatural-wrap"
                 style="flex-shrink:0;padding:16px;border-bottom:1px solid var(--border);
                        background:var(--bg2)">
                <p style="color:var(--text-dim);font-style:italic;font-size:13px">
                    Chargement de Sparnatural…
                </p>
            </div>
            <div style="flex:1;overflow-y:auto">
                <div id="sparnatural-results" style="padding:16px"></div>
            </div>
        </div>`;
    } else if (tab === 'vizq') {
        content = SparqlEditor.renderSplit();
    }

    return `
    <div style="height:100%;display:flex;overflow:hidden">
        ${sidebar}
        <div style="flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0">
            ${content}
        </div>
    </div>`;
};

APP._initSparnatural = function() {
    const wrap = document.getElementById('sparnatural-wrap');
    if (!wrap) return;

    // Attendre que le custom element soit enregistré (max 5s)
    const maxWait = 5000;
    const start   = Date.now();
    const tryInit = () => {
        if (customElements.get('spar-natural')) {
            APP._doInitSparnatural(wrap);
        } else if (Date.now() - start < maxWait) {
            setTimeout(tryInit, 200);
        } else {
            wrap.innerHTML = `<p style="color:#f87171;font-size:13px">
                ⚠ Sparnatural could not be loaded from
                <a href="https://cdn.jsdelivr.net/npm/sparnatural@9.1.6/dist/sparnatural.js"
                   target="_blank" style="color:#60a5fa">jsdelivr.net</a> —
                please check your network connection.
            </p>`;
        }
    };
    tryInit();
};

APP._doInitSparnatural = function(wrap) {

    wrap.innerHTML = `
        <spar-natural
            id="sparnatural-widget"
            src="/api/sparnatural-config"
            endpoint="/api/sparql"
            language="${(typeof Settings !== 'undefined' && Settings.preferredLang) || 'en'}"
            defaultlang="${(typeof Settings !== 'undefined' && Settings.preferredLang) || 'en'}"
            limit="1000"
            style="--sparnatural-primary-color:#3b82f6;
                   --sparnatural-secondary-color:#1d2535;
                   --sparnatural-background-color:#161b24;
                   --sparnatural-text-color:#e2e8f0;
                   --sparnatural-border-color:#2a3347;">
        </spar-natural>`;

    // Écouter les événements Sparnatural
    const widget = document.getElementById('sparnatural-widget');
    if (!widget) return;

    widget.addEventListener('queryUpdated', async (e) => {
        const sparql = e.detail.queryString;
        if (!sparql) return;
        await APP._runSparqlQuery(sparql);
    });

    widget.addEventListener('submit', async (e) => {
        const sparql = e.detail.queryString;
        if (!sparql) return;
        await APP._runSparqlQuery(sparql);
    });
};

APP._runSparqlQuery = async function(sparql) {
    const resultsDiv = document.getElementById('sparnatural-results');
    if (!resultsDiv) return;
    resultsDiv.innerHTML = '<p style="color:var(--text-dim);font-style:italic;font-size:12px">Running…</p>';
    try {
        const res = await fetch('/api/sparql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'query=' + encodeURIComponent(sparql),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        APP._renderSparqlResults(resultsDiv, data);
    } catch (e) {
        resultsDiv.innerHTML = `<p style="color:#f87171;font-size:12px">⚠ Error: ${_escapeHtml(e.message)}</p>`;
    }
};

APP._renderSparqlResults = function(container, data) {
    const vars = data.head?.vars || [];
    const rows = data.results?.bindings || [];

    if (!vars.length) {
        container.innerHTML = '<p style="color:var(--text-dim);font-size:12px;font-style:italic">No results.</p>';
        return;
    }

    const shortVal = (binding) => {
        if (!binding) return '';
        const v = binding.value || '';
        if (binding.type === 'uri') {
            // Raccourcir les URIs longues
            const hash = v.lastIndexOf('#');
            const slash = v.lastIndexOf('/');
            const local = v.substring(Math.max(hash, slash) + 1);
            return `<span title="${v}" style="color:var(--accent);cursor:default">${local || v}</span>`;
        }
        return `<span style="color:var(--text1)">${v}</span>`;
    };

    const thead = `<tr>${vars.map(v => `<th style="padding:6px 12px;text-align:left;border-bottom:1px solid var(--border2);color:var(--text-dim);font-size:11px;font-weight:600;text-transform:uppercase">${v}</th>`).join('')}</tr>`;
    const tbody = rows.map(row =>
        `<tr style="border-bottom:1px solid var(--border)">${vars.map(v => `<td style="padding:5px 12px;font-size:12px">${shortVal(row[v])}</td>`).join('')}</tr>`
    ).join('');

    container.innerHTML = `
        <div style="font-size:11px;color:var(--text-dim);margin-bottom:8px">
            ${rows.length} result${rows.length > 1 ? 's' : ''}
        </div>
        <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;background:var(--bg3);border-radius:4px;overflow:hidden">
                <thead style="background:var(--bg2)">${thead}</thead>
                <tbody>${tbody}</tbody>
            </table>
        </div>`;
};

// ── Views UI ──────────────────────────────────────────────────

APP._viewsTab = APP._viewsTab || 'ontology';

APP.renderViews = function() {
    const tab = APP._viewsTab;

    const tabBtn = (id, label) => `
        <div class="settings-vtab${tab === id ? ' active' : ''}"
             onclick="APP._viewsTab='${id}';APP.renderSection('views')"
             style="padding:10px 16px;cursor:pointer;font-size:13px;font-weight:${tab===id?'600':'400'};
                    border-left:3px solid ${tab===id?'var(--accent)':'transparent'};
                    color:${tab===id?'var(--accent)':'var(--text1)'};
                    background:${tab===id?'var(--bg3)':'transparent'};
                    white-space:nowrap;user-select:none">
            ${label}
        </div>`;

    const sidebar = `
        <div style="width:160px;flex-shrink:0;border-right:1px solid var(--border);padding:8px 0">
            ${tabBtn('ontology',       '🗂 Ontology')}
            ${tabBtn('treemap',        '🟦 Treemap')}
            ${tabBtn('knowledge-base', '🧩 Knowledge Base')}
        </div>`;

    let tabContent = '';
    if (tab === 'treemap') {
        tabContent = `
        <div style="display:flex;flex-direction:column;height:100%">
            <div style="display:flex;align-items:center;gap:8px;padding:8px 14px;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--bg2)">
                <button class="btn-sm" onclick="APP._tmDrillUp()" id="tm-up-btn" disabled title="Go up one level">⬆ Up</button>
                <span id="tm-breadcrumb" style="font-size:11px;color:var(--text-dim);margin-left:4px;font-family:var(--font-mono)">owl:Thing</span>
                <span style="font-size:10px;color:var(--text-dim);margin-left:auto">Click → edit · Double-click → zoom</span>
                <span id="tm-count" style="font-size:11px;color:var(--text-dim);margin-left:12px"></span>
            </div>
            <div id="cy-treemap" style="flex:1;min-height:0;background:#0d1117;overflow:hidden;position:relative"></div>
        </div>`;
    } else if (tab === 'ontology') {
        tabContent = `
        <div style="display:flex;flex-direction:column;height:100%">
            <div style="display:flex;align-items:center;gap:8px;padding:8px 14px;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--bg2)">
                <button class="btn-sm" onclick="APP._hypZoomUp()" id="hyp-up-btn" disabled title="Go up one level">⬆ Up</button>
                <span id="hyp-breadcrumb" style="font-size:11px;color:var(--text-dim);font-family:var(--font-mono);max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">owl:Thing</span>
                <button class="btn-sm" onclick="APP._hypReset()" title="Reset view">⟳ Reset</button>
                <div style="position:relative;margin-left:4px">
                    <input id="hyp-filter-input" type="text" placeholder="Filter classes…"
                           style="background:var(--bg3);border:1px solid var(--border2);color:var(--text1);
                                  border-radius:4px;padding:3px 8px;font-size:12px;width:180px"
                           oninput="APP._hypFilter(this.value)">
                </div>
                <span style="font-size:10px;color:var(--text-dim);margin-left:4px">
                    Click → center · 2nd click → edit · Double-click → zoom
                </span>
                <span id="cy-node-count" style="margin-left:auto;font-size:11px;color:var(--text-dim)"></span>
            </div>
            <div id="cy-ontology" style="flex:1;min-height:0;background:#12161f;overflow:hidden"></div>
        </div>`;
    } else {
        tabContent = `
        <div style="display:flex;flex-direction:column;height:100%">
            <div style="display:flex;align-items:center;gap:8px;padding:8px 14px;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--bg2)">
                <button class="btn-sm" onclick="APP._kbRestart()" title="Relancer la simulation">⟳ Restart</button>
                <div style="position:relative;margin-left:8px">
                    <input id="kb-filter-input" type="text" placeholder="Filter individuals…"
                           style="background:var(--bg3);border:1px solid var(--border2);color:var(--text1);
                                  border-radius:4px;padding:3px 8px;font-size:12px;width:200px"
                           oninput="APP._kbFilter(this.value)">
                </div>
                <span id="kb-legend" style="display:flex;align-items:center;gap:10px;margin-left:12px;font-size:11px"></span>
                <span id="kb-count" style="margin-left:auto;font-size:11px;color:var(--text-dim)"></span>
            </div>
            <div id="kb-graph" style="flex:1;min-height:0;background:#0e1219;overflow:hidden;position:relative"></div>
        </div>`;
    }

    return `
    <div class="section-split" style="display:flex;flex-direction:column">
        <div style="padding:12px 20px;border-bottom:1px solid var(--border);flex-shrink:0">
            <h2 style="margin:0;font-size:16px;font-weight:600;display:flex;align-items:center;gap:8px">
                <svg width="16" height="12" viewBox="0 0 14 10" fill="none" style="vertical-align:middle"><ellipse cx="7" cy="5" rx="6.5" ry="4.5" stroke="currentColor" stroke-width="1.2"/><circle cx="7" cy="5" r="2" fill="currentColor"/></svg>
                Views
            </h2>
        </div>
        <div style="display:flex;flex:1;overflow:hidden;min-height:0">
            ${sidebar}
            <div style="flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0">
                ${tabContent}
            </div>
        </div>
    </div>`;
};

// ── Ontology Graph (D3 — Hyperbolic Tree / Disque de Poincaré) ────────────────

APP._hypZoomStack = [];   // pile des IDs zoomés [{id, label}]

APP._hypBestLabel = function(cls) {
    return cls ? (cls.id || '') : '';
};

APP._initHyperbolicGraph = function() {
    const container = document.getElementById('cy-ontology');
    if (!container) { console.error('[SWOWL] #cy-ontology not found'); return; }
    if (APP._viewsTab !== 'ontology') return;
    container.innerHTML = '';

    const classes = APP.state.classes || [];
    if (!classes.length) {
        container.innerHTML = '<p style="padding:24px;color:var(--text-dim);font-style:italic">No classes in this ontology.</p>';
        return;
    }
    if (typeof d3 === 'undefined') {
        container.innerHTML = '<p style="padding:24px;color:#f87171">⚠ D3.js not loaded — please check your network connection.</p>';
        return;
    }

    // ── 1. Build tree ─────────────────────────────────────────
    const classMap = {};
    classes.forEach(c => { classMap[c.id] = c; });
    const allIds    = new Set(classes.map(c => c.id));
    const childrenOf      = {};
    const hasInternalParent = new Set();
    classes.forEach(cls => {
        (cls.subClassOf || []).filter(s => typeof s === 'string' && allIds.has(s)).forEach(p => {
            hasInternalParent.add(cls.id);
            if (!childrenOf[p]) childrenOf[p] = [];
            if (!childrenOf[p].includes(cls.id)) childrenOf[p].push(cls.id);
        });
    });
    const roots = classes.filter(c => !hasInternalParent.has(c.id)).map(c => c.id);

    function buildNode(id, depth, ancestors) {
        if (!classMap[id] || ancestors.has(id)) return null;
        const next = new Set(ancestors); next.add(id);
        return {
            id, depth,
            label: APP._hypBestLabel(classMap[id]),
            hpos: [0, 0], basePos: [0, 0],
            children: (childrenOf[id] || []).map(cid => buildNode(cid, depth + 1, next)).filter(Boolean)
        };
    }

    // ── Zoom : si une pile de zoom existe, on part du nœud zoomé ─
    const zoomEntry = APP._hypZoomStack.length
        ? APP._hypZoomStack[APP._hypZoomStack.length - 1]
        : null;

    let treeRoot;
    if (zoomEntry && classMap[zoomEntry.id]) {
        const zNode = buildNode(zoomEntry.id, 0, new Set());
        treeRoot = zNode || {
            id: 'owl:Thing', label: 'owl:Thing', depth: 0,
            hpos: [0,0], basePos: [0,0],
            children: roots.map(r => buildNode(r, 1, new Set())).filter(Boolean)
        };
    } else {
        APP._hypZoomStack = []; // réinitialise si nœud introuvable
        treeRoot = {
            id: 'owl:Thing', label: 'owl:Thing', depth: 0,
            hpos: [0, 0], basePos: [0, 0],
            children: roots.map(r => buildNode(r, 1, new Set())).filter(Boolean)
        };
    }

    // ── Mise à jour breadcrumb & bouton Up ───────────────────
    const upBtn     = document.getElementById('hyp-up-btn');
    const breadcrumb = document.getElementById('hyp-breadcrumb');
    if (upBtn)      upBtn.disabled = APP._hypZoomStack.length === 0;
    if (breadcrumb) {
        const path = ['owl:Thing', ...APP._hypZoomStack.map(e => e.label)];
        breadcrumb.textContent = path.join(' › ');
        breadcrumb.title       = path.join(' › ');
    }

    // ── 2. Complex number / Möbius helpers ────────────────────
    const cadd  = (a, b) => [a[0]+b[0], a[1]+b[1]];
    const csub  = (a, b) => [a[0]-b[0], a[1]-b[1]];
    const cmul  = (a, b) => [a[0]*b[0]-a[1]*b[1], a[0]*b[1]+a[1]*b[0]];
    const cconj = a => [a[0], -a[1]];
    const cabs  = a => Math.sqrt(a[0]*a[0]+a[1]*a[1]);
    const cdiv  = (a, b) => { const d = b[0]*b[0]+b[1]*b[1]; return [(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d]; };
    const polar = (r, t) => [r*Math.cos(t), r*Math.sin(t)];
    const mobiusFocus     = (z, a) => cdiv(csub(z,a), csub([1,0], cmul(cconj(a),z)));
    const mobiusTranslate = (z, a) => cdiv(cadd(z,a), cadd([1,0], cmul(cconj(a),z)));

    // ── 3. Poincaré layout ────────────────────────────────────
    const STEP_R = Math.tanh(0.4);
    function layoutNode(node, pos, angle, wedge) {
        node.hpos = [...pos]; node.basePos = [...pos];
        const ch = node.children || [];
        if (!ch.length) return;
        const w = Math.min(2*Math.PI/Math.max(1,ch.length), wedge);
        const start = angle - (w * ch.length) / 2;
        ch.forEach((child, i) => {
            const a = start + (i + 0.5) * w;
            const globalPos = mobiusTranslate(polar(STEP_R, a), pos);
            layoutNode(child, globalPos, a, w * 0.88);
        });
    }
    layoutNode(treeRoot, [0,0], -Math.PI/2, 2*Math.PI);

    // ── 4. Flatten ────────────────────────────────────────────
    function flatten(node, parent) {
        node.parent = parent || null;
        const res = [node];
        (node.children || []).forEach(c => res.push(...flatten(c, node)));
        return res;
    }
    const allNodes = flatten(treeRoot, null);
    APP._hypNodes = allNodes;
    APP._hypMath  = { cadd, csub, cmul, cconj, cabs, cdiv, polar, mobiusFocus, mobiusTranslate };

    // ── 5. SVG canvas ─────────────────────────────────────────
    if (container.offsetHeight < 20) container.style.height = (window.innerHeight - 170) + 'px';
    const W  = container.offsetWidth  || 800;
    const H  = container.offsetHeight || 600;
    const R  = Math.min(W, H) * 0.46;
    const CX = W/2, CY = H/2;
    APP._hypGeom = { W, H, R, CX, CY };
    APP._hypToScreen = pos => [CX + pos[0]*R, CY + pos[1]*R];

    const svg = d3.select(container).append('svg')
        .attr('width', W).attr('height', H).style('display','block');
    APP._hypSvg = svg;

    svg.append('circle').attr('cx',CX).attr('cy',CY).attr('r',R+1)
        .attr('fill','#0e1219').attr('stroke','#2a3347').attr('stroke-width',1.5);
    [0.33, 0.60, 0.82].forEach(fr =>
        svg.append('circle').attr('cx',CX).attr('cy',CY).attr('r',R*fr)
            .attr('fill','none').attr('stroke','#1a2030').attr('stroke-width',0.5));

    // ── 6. Create DOM elements once ───────────────────────────
    const svgNS = 'http://www.w3.org/2000/svg';
    const edgeGroup = document.createElementNS(svgNS, 'g');
    const nodeGroup = document.createElementNS(svgNS, 'g');
    svg.node().appendChild(edgeGroup);
    svg.node().appendChild(nodeGroup);
    APP._hypEdgeEls = new Map();
    APP._hypNodeEls = new Map();

    allNodes.filter(n => n.parent).forEach(n => {
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('stroke', '#252f42');
        line.setAttribute('stroke-width', '0.9');
        line.setAttribute('stroke-opacity', '0.7');
        edgeGroup.appendChild(line);
        APP._hypEdgeEls.set(n.id, line);
    });

    allNodes.forEach(n => {
        const g = document.createElementNS(svgNS, 'g');
        g.style.cursor = 'pointer';
        const circle = document.createElementNS(svgNS, 'circle');
        const label  = document.createElementNS(svgNS, 'text');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-family', 'system-ui,sans-serif');
        label.setAttribute('pointer-events', 'none');
        g.appendChild(circle);
        g.appendChild(label);
        nodeGroup.appendChild(g);
        APP._hypNodeEls.set(n.id, { g, circle, label, node: n });
        g.addEventListener('click',    () => APP._hypClick(n));
        g.addEventListener('dblclick', (e) => { e.stopPropagation(); APP._hypZoomTo(n); });
    });

    APP._hypEdgeGroup = edgeGroup;
    APP._hypNodeGroup = nodeGroup;

    // ── 7. Initial draw ───────────────────────────────────────
    APP._hypDraw(false);

    const counter = document.getElementById('cy-node-count');
    if (counter) counter.textContent = `${classes.length} classe${classes.length>1?'s':''}`;
};

// ── Hyperbolic draw — direct DOM, CSS transitions ─────────────
APP._hypDraw = function(animated) {
    if (!APP._hypNodes || !APP._hypNodeEls) return;
    const { cabs } = APP._hypMath;
    const toSc = APP._hypToScreen;
    const TR = animated ? 'transform 0.42s cubic-bezier(0.33,1,0.68,1)' : 'none';

    APP._hypNodes.forEach(node => {
        const [sx, sy] = toSc(node.hpos);
        const dist  = cabs(node.hpos);
        const isRoot = node.id === 'owl:Thing';

        const el = APP._hypNodeEls.get(node.id);
        if (!el) return;

        const nr     = isRoot ? 11 : Math.max(3.5, 10 * (1 - dist*0.65));
        const opc    = Math.max(0.12, 1 - dist*0.55).toFixed(2);
        const fs     = Math.max(8,  13 * (1 - dist*0.82)).toFixed(1);
        const fill   = isRoot ? '#1e3a5f' : (dist < 0.35 ? '#1c3350' : '#161e2e');
        const stroke = isRoot ? '#3b82f6' : (dist < 0.45 ? '#4b8cf5' : '#2a3a55');
        const sw     = dist < 0.35 ? 1.8 : 1;
        const tc     = dist < 0.25 ? '#93c5fd' : (dist < 0.55 ? '#a8c4e8' : '#64748b');

        el.circle.setAttribute('r',            nr);
        el.circle.setAttribute('fill',         fill);
        el.circle.setAttribute('stroke',       stroke);
        el.circle.setAttribute('stroke-width', sw);
        el.circle.setAttribute('opacity',      opc);

        el.label.textContent = dist < 0.78 ? node.label : '';
        el.label.setAttribute('font-size',   fs);
        el.label.setAttribute('y',           -(nr + 3));
        el.label.setAttribute('fill',        tc);
        el.label.setAttribute('opacity',     opc);
        el.label.setAttribute('font-weight', dist < 0.15 ? '600' : '400');

        el.g.style.transition = TR;
        el.g.setAttribute('transform', `translate(${sx.toFixed(1)},${sy.toFixed(1)})`);

        if (node.parent) {
            const line = APP._hypEdgeEls.get(node.id);
            if (line) {
                const [px, py] = toSc(node.parent.hpos);
                line.style.transition = TR;
                line.setAttribute('x1', px.toFixed(1));
                line.setAttribute('y1', py.toFixed(1));
                line.setAttribute('x2', sx.toFixed(1));
                line.setAttribute('y2', sy.toFixed(1));
            }
        }
    });
};

// ── Click: focus → center, puis 2e clic → éditeur ────────────
APP._hypClick = function(node) {
    if (!APP._hypNodes) return;
    const { cabs, mobiusFocus } = APP._hypMath;
    const dist = cabs(node.hpos);

    if (dist < 0.10 && node.id !== 'owl:Thing') {
        APP.navigate('classes');
        setTimeout(() => {
            if (typeof ClassEditor !== 'undefined') {
                ClassEditor._selectedId = node.id;
                ClassEditor.restoreSelection();
            }
        }, 80);
        return;
    }

    if (dist < 0.02) return;
    const a = [node.hpos[0], node.hpos[1]];
    APP._hypNodes.forEach(n => {
        n.hpos = mobiusFocus(n.hpos, a);
    });
    APP._hypDraw(true);
};

// ── Reset focus (recentre la vue sans changer le niveau de zoom) ──
APP._hypReset = function() {
    if (!APP._hypNodes) return;
    APP._hypNodes.forEach(n => { n.hpos = [...n.basePos]; });
    APP._hypDraw(true);
};

// ── Zoom in : double-clic → entre dans le sous-arbre ─────────
APP._hypZoomTo = function(node) {
    if (!node || node.id === 'owl:Thing') return;
    // Ne zoome que si le nœud a des enfants
    if (!node.children || !node.children.length) return;
    APP._hypZoomStack.push({ id: node.id, label: node.label });
    APP._initHyperbolicGraph();
};

// ── Zoom out : remonte d'un niveau ───────────────────────────
APP._hypZoomUp = function() {
    if (!APP._hypZoomStack.length) return;
    APP._hypZoomStack.pop();
    APP._initHyperbolicGraph();
};

// ── Filter ────────────────────────────────────────────────────
APP._hypFilter = function(q) {
    if (!APP._hypNodeEls) return;
    const query = q.trim().toLowerCase();
    APP._hypNodeEls.forEach((el, id) => {
        const node  = el.node;
        const match = !query
            || node.label.toLowerCase().includes(query)
            || node.id.toLowerCase().includes(query);
        if (query && match) {
            el.circle.setAttribute('stroke', '#10b981');
            el.circle.setAttribute('stroke-width', '2.5');
            el.label.setAttribute('fill', '#6ee7b7');
        } else {
            el.circle.removeAttribute('stroke');
            el.circle.removeAttribute('stroke-width');
            el.label.removeAttribute('fill');
            APP._hypDraw(false);
        }
    });
};

// ── Treemap (D3 v7) ──────────────────────────────────────────

APP._tmRoot       = null;   // d3.hierarchy root complet
APP._tmCurrent    = null;   // nœud courant affiché (drill-down)
APP._tmSvg        = null;   // sélection SVG D3
APP._tmW          = 0;
APP._tmH          = 0;

// Palette de couleurs par branche racine (fond sombre)
APP._tmPalette = [
    '#1d3557','#1b4332','#3d1f6e','#7b2d00','#004e64',
    '#3a0ca3','#023047','#6a0572','#0a3622','#1c2b3a',
    '#4a1942','#2b4141',
];

APP._tmBuildHierarchy = function() {
    const classes = APP.state.classes || [];
    const realClasses = classes.filter(c => c.id !== 'owl:Thing');
    const classMap = {};
    realClasses.forEach(c => { classMap[c.id] = c; });
    const allIds = new Set(realClasses.map(c => c.id));
    const childrenOf = {};
    const hasInternalParent = new Set();

    realClasses.forEach(cls => {
        (cls.subClassOf || [])
            .filter(s => typeof s === 'string' && s !== 'owl:Thing' && allIds.has(s))
            .forEach(parentId => {
                hasInternalParent.add(cls.id);
                if (!childrenOf[parentId]) childrenOf[parentId] = [];
                if (!childrenOf[parentId].includes(cls.id)) childrenOf[parentId].push(cls.id);
            });
    });
    const roots = realClasses.filter(c => !hasInternalParent.has(c.id)).map(c => c.id);

    function buildData(id, ancestors, depth) {
        if (!id || !classMap[id] || depth > 30 || ancestors.has(id)) return null;
        const next = new Set(ancestors); next.add(id);
        const ch = (childrenOf[id] || [])
            .map(cid => buildData(cid, next, depth + 1))
            .filter(Boolean);
        return { id, name: APP._hypBestLabel(classMap[id]), children: ch.length ? ch : undefined };
    }

    return {
        id: 'owl:Thing', name: 'owl:Thing',
        children: roots.map(r => buildData(r, new Set(), 0)).filter(Boolean),
    };
};

APP._tmRender = function(node) {
    if (!APP._tmSvg) return;
    APP._tmCurrent = node;

    const W = APP._tmW;
    const H = APP._tmH;

    // Couleur par branche de premier niveau
    const branchPalette = new Map();
    (APP._tmRoot.children || []).forEach((ch, i) => {
        branchPalette.set(ch.data.id, APP._tmPalette[i % APP._tmPalette.length]);
    });

    function branchBase(d) {
        let n = d;
        while (n.depth > 1) n = n.parent;
        return branchPalette.get(n.data.id) || '#1e2a3a';
    }

    // Calculer le treemap sur le nœud courant
    const subtree = d3.hierarchy(node.data, d => d.children)
        .sum(d => d.children ? 0 : 1)
        .sort((a, b) => b.value - a.value);

    // Rétablir les profondeurs réelles (pour couleurs cohérentes)
    subtree.each(d => {
        d._realDepth = node.depth + d.depth;
    });

    d3.treemap()
        .size([W, H])
        .padding(1)
        .paddingTop(d => d.depth === 0 ? 0 : 20)
        .paddingInner(1)
        .round(true)
    (subtree);

    // Supprimer les anciens éléments
    APP._tmSvg.selectAll('*').remove();

    const allNodes = subtree.descendants();

    const cellW = d => Math.max(0, d.x1 - d.x0);
    const cellH = d => Math.max(0, d.y1 - d.y0);

    // Groupe par nœud
    const cell = APP._tmSvg.selectAll('g')
        .data(allNodes)
        .join('g')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

    // Rectangle de fond
    cell.append('rect')
        .attr('width',  cellW)
        .attr('height', cellH)
        .attr('rx', 2)
        .attr('fill', d => {
            if (d.depth === 0) return '#0d1117';
            let n = d;
            while (n.parent && n.parent.depth > 0) n = n.parent;
            const globalChild = (APP._tmRoot.children || []).find(c => c.data.id === n.data.id);
            const base = globalChild
                ? (branchPalette.get(globalChild.data.id) || '#1e2a3a')
                : '#1e2a3a';
            return d.children ? base : base + 'cc';
        })
        .attr('stroke', '#0d1117')
        .attr('stroke-width', 1)
        .attr('fill-opacity', d => d.depth === 0 ? 1 : d.children ? 0.9 : 0.65)
        .style('cursor', d => (d.depth > 0) ? 'pointer' : 'default')
        .on('click', (event, d) => {
            if (d.depth === 0) return;
            event.stopPropagation();
            if (d.children) {
                APP._tmDrillInto(d);
            } else {
                APP.navigateTo('classes', d.data.id);
                setTimeout(() => { if (typeof ClassEditor !== 'undefined') ClassEditor.restoreSelection(); }, 80);
            }
        })
        .on('dblclick', (event, d) => {
            if (d.depth === 0 || d.data.id === 'owl:Thing') return;
            event.stopPropagation();
            APP.navigateTo('classes', d.data.id);
            setTimeout(() => { if (typeof ClassEditor !== 'undefined') ClassEditor.restoreSelection(); }, 80);
        });

    // Étiquette des nœuds parents
    cell.filter(d => d.depth > 0 && d.children)
        .append('text')
        .attr('x', 4)
        .attr('y', 14)
        .attr('font-size', d => { const w = cellW(d); return w > 60 ? '11px' : w > 30 ? '9px' : '0px'; })
        .attr('font-weight', '600')
        .attr('fill', '#c8d6f0')
        .attr('pointer-events', 'none')
        .text(d => {
            const w = cellW(d);
            if (w < 20) return '';
            const maxCh = Math.max(2, Math.floor(w / 7));
            const name = d.data.name || d.data.id;
            return name.length > maxCh ? name.slice(0, maxCh - 1) + '…' : name;
        });

    // Nombre d'enfants pour les parents
    cell.filter(d => d.depth > 0 && d.children)
        .append('text')
        .attr('x', 4).attr('y', 25)
        .attr('font-size', '9px')
        .attr('fill', '#7a8faa')
        .attr('pointer-events', 'none')
        .text(d => {
            if (cellW(d) < 50 || cellH(d) < 32) return '';
            const n = d.leaves().length;
            return `${n} classe${n > 1 ? 's' : ''}`;
        });

    // Étiquette des feuilles
    cell.filter(d => !d.children)
        .append('text')
        .attr('x', 4)
        .attr('y', d => Math.min(14, cellH(d) - 3))
        .attr('font-size', d => {
            const w = cellW(d), h = cellH(d), area = w * h;
            if (area < 400) return '0px';
            return Math.min(12, Math.max(8, Math.sqrt(area) / 8)) + 'px';
        })
        .attr('fill', '#dde2ee')
        .attr('pointer-events', 'none')
        .text(d => {
            const w = cellW(d), h = cellH(d);
            if (w * h < 400) return '';
            const maxCh = Math.max(2, Math.floor(w / 6.5));
            const name = d.data.name || d.data.id;
            return name.length > maxCh ? name.slice(0, maxCh - 1) + '…' : name;
        });

    // Breadcrumb & bouton Up
    const breadcrumb = document.getElementById('tm-breadcrumb');
    const upBtn      = document.getElementById('tm-up-btn');
    const counter    = document.getElementById('tm-count');
    if (breadcrumb) {
        // Construire le chemin depuis tmRoot jusqu'au nœud courant
        const path = [];
        let n = APP._tmCurrent;
        while (n) { path.unshift(n.data.name || n.data.id); n = n.parent; }
        breadcrumb.textContent = path.join(' › ');
    }
    if (upBtn)   upBtn.disabled = (APP._tmCurrent === APP._tmRoot);
    if (counter) {
        const leaves = subtree.leaves().length;
        counter.textContent = `${leaves} classe${leaves > 1 ? 's' : ''}`;
    }
};

// Drill-down dans un nœud (trouver le nœud correspondant dans tmRoot)
APP._tmDrillInto = function(subtreeNode) {
    const targetId = subtreeNode.data.id;
    // Chercher dans le tmRoot global
    let found = null;
    APP._tmRoot.each(n => { if (n.data.id === targetId) found = n; });
    if (found) APP._tmRender(found);
};

APP._tmDrillUp = function() {
    if (!APP._tmCurrent || APP._tmCurrent === APP._tmRoot) return;
    APP._tmRender(APP._tmCurrent.parent || APP._tmRoot);
};

APP._initTreemap = function() {
    const container = document.getElementById('cy-treemap');
    if (!container || APP._viewsTab !== 'treemap') return;
    container.innerHTML = '';

    const classes = APP.state.classes || [];
    if (!classes.length) {
        container.innerHTML = '<p style="padding:24px;color:var(--text-dim);font-style:italic">No classes in this ontology.</p>';
        return;
    }

    const W = container.clientWidth  || 800;
    const H = container.clientHeight || 500;
    APP._tmW = W;
    APP._tmH = H;

    // Construire la hiérarchie complète
    const rawData = APP._tmBuildHierarchy();
    APP._tmRoot = d3.hierarchy(rawData, d => d.children)
        .sum(d => d.children ? 0 : 1)
        .sort((a, b) => b.value - a.value);

    APP._tmSvg = d3.select(container)
        .append('svg')
        .attr('width', W)
        .attr('height', H)
        .style('display', 'block');

    APP._tmRender(APP._tmRoot);

    // Compteur global
    const counter = document.getElementById('tm-count');
    if (counter) counter.textContent = `${classes.length - (classes.some(c=>c.id==='owl:Thing')?1:0)} classes`;
};

// ── Knowledge Base Graph (D3 force) ──────────────────────────

APP._kbSim  = null; // D3 simulation
APP._kbData = null; // { nodes, links }

// Palette de couleurs pour les classes
APP._kbClassColor = function(classId) {
    const palette = [
        '#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6',
        '#06b6d4','#f97316','#ec4899','#84cc16','#14b8a6',
        '#a78bfa','#fb923c','#34d399','#60a5fa','#fbbf24',
    ];
    if (!APP._kbColorMap) APP._kbColorMap = {};
    if (!APP._kbColorIndex) APP._kbColorIndex = 0;
    if (!APP._kbColorMap[classId]) {
        APP._kbColorMap[classId] = palette[APP._kbColorIndex % palette.length];
        APP._kbColorIndex++;
    }
    return APP._kbColorMap[classId];
};

APP._kbBestLabel = function(ind) {
    const pref  = (typeof Settings !== 'undefined') ? Settings.preferredLang : 'en';
    const labels = (ind.annotations && ind.annotations.labels) ? ind.annotations.labels : [];
    const found  = labels.find(l => l.lang === pref) || labels[0];
    return found ? found.value : ind.id;
};

APP._initKnowledgeBase = function() {
    const container = document.getElementById('kb-graph');
    if (!container || APP._viewsTab !== 'knowledge-base') return;
    container.innerHTML = '';
    if (APP._kbSim) { APP._kbSim.stop(); APP._kbSim = null; }
    APP._kbColorMap = {};
    APP._kbColorIndex = 0;

    const individuals = APP.state.individuals || [];
    if (!individuals.length) {
        container.innerHTML = '<p style="padding:24px;color:var(--text-dim);font-style:italic">No individuals in this ontology.</p>';
        return;
    }
    if (typeof d3 === 'undefined') {
        container.innerHTML = '<p style="padding:24px;color:#f87171">⚠ D3.js not loaded.</p>';
        return;
    }

    const W  = container.offsetWidth  || 900;
    const H  = container.offsetHeight || 600;
    if (container.offsetHeight < 20) container.style.height = (window.innerHeight - 170) + 'px';

    // ── Nodes ─────────────────────────────────────────────────
    const indMap = {};
    individuals.forEach(ind => { indMap[ind.id] = ind; });

    const nodes = individuals.map(ind => ({
        id:      ind.id,
        label:   APP._kbBestLabel(ind),
        classId: ind.class_id || ind.types?.[0] || 'Unknown',
        ind,
        x: W/2 + (Math.random()-0.5)*200,
        y: H/2 + (Math.random()-0.5)*200,
    }));

    // ── Links (object property assertions) ────────────────────
    const links = [];
    individuals.forEach(ind => {
        (ind.objectAssertions || []).forEach(a => {
            if (indMap[a.target]) {
                links.push({
                    source: ind.id,
                    target: a.target,
                    property: a.property,
                    id: `${ind.id}__${a.property}__${a.target}`,
                });
            }
        });
    });

    // Détecter les paires bidirectionnelles et assigner une courbure
    const pairSet = new Set(links.map(l => `${l.source}__${l.target}`));
    links.forEach(l => {
        l.bidir = pairSet.has(`${l.target}__${l.source}`);
        l.curve = l.bidir ? 40 : 0;  // offset perpendiculaire en px
    });

    APP._kbData = { nodes, links };

    // ── Legend ────────────────────────────────────────────────
    const classIds = [...new Set(nodes.map(n => n.classId))].sort();
    classIds.forEach(cid => APP._kbClassColor(cid)); // pre-assign colors
    const legend = document.getElementById('kb-legend');
    if (legend) {
        legend.innerHTML = classIds.map(cid => `
            <span style="display:flex;align-items:center;gap:4px;color:var(--text-dim)">
                <span style="width:8px;height:8px;border-radius:50%;background:${APP._kbClassColor(cid)};flex-shrink:0"></span>
                <span style="font-size:10px">${cid}</span>
            </span>`).join('');
    }
    const counter = document.getElementById('kb-count');
    if (counter) counter.textContent = `${nodes.length} individual${nodes.length>1?'s':''} · ${links.length} connexion${links.length>1?'s':''}`;

    // ── SVG setup ─────────────────────────────────────────────
    const svgEl = d3.select(container).append('svg')
        .attr('width', W).attr('height', H)
        .style('display','block');

    // Defs: arrowhead marker
    const defs = svgEl.append('defs');
    const mkArrow = (id, color) => defs.append('marker')
        .attr('id', id)
        .attr('viewBox','0 -4 10 8').attr('refX',18).attr('refY',0)
        .attr('markerWidth',6).attr('markerHeight',6).attr('orient','auto')
        .append('path').attr('d','M0,-4L10,0L0,4').attr('fill', color);
    mkArrow('kb-arrow',     '#3a4a62');
    mkArrow('kb-arrow-hi',  '#3b82f6');

    // Zoom / pan
    const zoomG = svgEl.append('g');
    svgEl.call(d3.zoom().scaleExtent([0.1, 4]).on('zoom', ev => {
        zoomG.attr('transform', ev.transform);
    }));

    const linkG = zoomG.append('g').attr('class','kb-links');
    const labelG = zoomG.append('g').attr('class','kb-edge-labels');
    const nodeG  = zoomG.append('g').attr('class','kb-nodes');

    // ── Helper : calcule le point de contrôle de l'arc ───────
    const arcCtrl = (sx, sy, tx, ty, curve) => {
        const mx = (sx + tx) / 2, my = (sy + ty) / 2;
        const dx = tx - sx,       dy = ty - sy;
        const len = Math.sqrt(dx*dx + dy*dy) || 1;
        return { cx: mx - dy/len*curve, cy: my + dx/len*curve };
    };
    const arcPath = (sx, sy, tx, ty, curve) => {
        if (!curve) return `M${sx},${sy}L${tx},${ty}`;
        const { cx, cy } = arcCtrl(sx, sy, tx, ty, curve);
        return `M${sx},${sy}Q${cx},${cy} ${tx},${ty}`;
    };

    // ── Render links (path au lieu de line) ───────────────────
    const linkEls = linkG.selectAll('path').data(links, d => d.id).enter()
        .append('path')
        .attr('fill','none')
        .attr('stroke','#2a3a55').attr('stroke-width',1.5)
        .attr('marker-end','url(#kb-arrow)');

    const edgeLabelEls = labelG.selectAll('text').data(links, d => d.id).enter()
        .append('text')
        .text(d => d.property)
        .attr('text-anchor','middle').attr('font-size','9px')
        .attr('font-family','system-ui,sans-serif')
        .attr('fill','#4a5a72').attr('pointer-events','none');

    // ── Render nodes ──────────────────────────────────────────
    const nodeEls = nodeG.selectAll('g').data(nodes, d => d.id).enter()
        .append('g').attr('class','kb-node').style('cursor','pointer');

    nodeEls.append('circle')
        .attr('r', 10)
        .attr('fill', d => APP._kbClassColor(d.classId) + '33') // ~20% opacity fill
        .attr('stroke', d => APP._kbClassColor(d.classId))
        .attr('stroke-width', 2);

    nodeEls.append('text').attr('class','kb-node-label')
        .attr('text-anchor','middle').attr('y', -14)
        .attr('font-size','11px').attr('font-family','system-ui,sans-serif')
        .attr('fill','#cbd5e1').attr('pointer-events','none')
        .text(d => d.label);

    nodeEls.append('text').attr('class','kb-node-class')
        .attr('text-anchor','middle').attr('y', 22)
        .attr('font-size','9px').attr('font-family','system-ui,sans-serif')
        .attr('pointer-events','none')
        .attr('fill', d => APP._kbClassColor(d.classId))
        .text(d => d.classId);

    // ── Tooltip DataProperties ────────────────────────────────
    let kbTooltip = document.getElementById('kb-dp-tooltip');
    if (!kbTooltip) {
        kbTooltip = document.createElement('div');
        kbTooltip.id = 'kb-dp-tooltip';
        kbTooltip.style.cssText = `
            position:fixed;pointer-events:none;display:none;z-index:9999;
            background:var(--bg2,#1e293b);border:1px solid var(--border,#334155);
            border-radius:6px;padding:8px 10px;font-size:11px;color:var(--text1,#e2e8f0);
            font-family:var(--font-mono,monospace);max-width:260px;
            box-shadow:0 4px 12px rgba(0,0,0,.4);line-height:1.6;`;
        document.body.appendChild(kbTooltip);
    }

    // Click → navigate to individual (fix: use navigateTo for proper selection)
    nodeEls.on('click', (ev, d) => {
        APP.navigateTo('individuals', d.id);
    });

    // Hover highlight + DataProperties tooltip
    nodeEls.on('mouseover', function(ev, d) {
        // Highlight connected links
        const connectedIds = new Set();
        links.forEach(l => {
            const sid = typeof l.source === 'object' ? l.source.id : l.source;
            const tid = typeof l.target === 'object' ? l.target.id : l.target;
            if (sid === d.id || tid === d.id) { connectedIds.add(sid); connectedIds.add(tid); }
        });
        nodeEls.select('circle').attr('opacity', n => connectedIds.has(n.id) ? 1 : 0.2);
        linkEls.attr('opacity', l => {
            const sid = typeof l.source === 'object' ? l.source.id : l.source;
            const tid = typeof l.target === 'object' ? l.target.id : l.target;
            return (sid === d.id || tid === d.id) ? 1 : 0.05;
        });
        edgeLabelEls.attr('opacity', l => {
            const sid = typeof l.source === 'object' ? l.source.id : l.source;
            const tid = typeof l.target === 'object' ? l.target.id : l.target;
            return (sid === d.id || tid === d.id) ? 1 : 0.05;
        });
        // Tooltip : DataProperties
        const dps = (d.ind.dataAssertions || []);
        if (dps.length) {
            const rows = dps.map(a =>
                `<div><span style="color:var(--accent,#38bdf8)">${a.property}</span>`
              + ` <span style="color:var(--text-dim,#64748b)">:</span> ${a.value}</div>`
            ).join('');
            kbTooltip.innerHTML = `<div style="font-weight:600;margin-bottom:4px;color:var(--text2,#94a3b8)">${d.label}</div>${rows}`;
            kbTooltip.style.display = 'block';
        }
    }).on('mousemove', function(ev) {
        kbTooltip.style.left = (ev.clientX + 14) + 'px';
        kbTooltip.style.top  = (ev.clientY - 10) + 'px';
    }).on('mouseout', function() {
        nodeEls.select('circle').attr('opacity', 1);
        linkEls.attr('opacity', 1);
        edgeLabelEls.attr('opacity', 1);
        kbTooltip.style.display = 'none';
    });

    // Drag
    nodeEls.call(d3.drag()
        .on('start', (ev, d) => { if (!ev.active) APP._kbSim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag',  (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
        .on('end',   (ev, d) => { if (!ev.active) APP._kbSim.alphaTarget(0); d.fx = null; d.fy = null; })
    );

    // ── Force simulation ──────────────────────────────────────
    APP._kbSim = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(120).strength(0.6))
        .force('charge', d3.forceManyBody().strength(-350))
        .force('center', d3.forceCenter(W/2, H/2).strength(0.05))
        .force('collision', d3.forceCollide(28))
        .on('tick', () => {
            linkEls.attr('d', d => arcPath(d.source.x, d.source.y, d.target.x, d.target.y, d.curve));
            edgeLabelEls.each(function(d) {
                const sx = d.source.x, sy = d.source.y, tx = d.target.x, ty = d.target.y;
                if (d.curve) {
                    // Positionner le label au point de contrôle (milieu de l'arc)
                    const { cx, cy } = arcCtrl(sx, sy, tx, ty, d.curve);
                    d3.select(this).attr('x', (sx+tx)/2*0.25 + cx*0.75).attr('y', (sy+ty)/2*0.25 + cy*0.75 - 3);
                } else {
                    d3.select(this).attr('x', (sx+tx)/2).attr('y', (sy+ty)/2 - 4);
                }
            });
            nodeEls.attr('transform', d => `translate(${d.x},${d.y})`);
        });

    APP._kbNodeEls = nodeEls;
    APP._kbLinkEls = linkEls;
};

APP._kbRestart = function() {
    if (APP._kbSim) { APP._kbSim.alpha(0.8).restart(); }
};

APP._kbFilter = function(q) {
    if (!APP._kbNodeEls) return;
    const query = q.trim().toLowerCase();
    APP._kbNodeEls.select('circle').attr('opacity', d => {
        if (!query) return 1;
        return (d.label.toLowerCase().includes(query) || d.classId.toLowerCase().includes(query)) ? 1 : 0.1;
    });
    APP._kbNodeEls.selectAll('.kb-node-label,.kb-node-class').attr('opacity', d => {
        if (!query) return 1;
        return (d.label.toLowerCase().includes(query) || d.classId.toLowerCase().includes(query)) ? 1 : 0.1;
    });
};

// ── Settings UI ───────────────────────────────────────────────

// ── Tab visibility: apply to DOM ──────────────────────────────────
APP._applyTabVisibility = function() {
    TabVisibility._optional.forEach(id => {
        const el = document.querySelector(`.nav-item[data-section="${id}"]`);
        if (el) el.style.display = TabVisibility.isHidden(id) ? 'none' : '';
    });
};

// ── GUI Tabs sub-tab content ──────────────────────────────────────
APP.renderGuiTabs = function() {
    const ALL_TABS = [
        { id: 'ontologies',            label: 'Ontologies',           icon: `<svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor" style="vertical-align:middle;color:var(--accent)"><circle cx="7" cy="1.5" r="1.5"/><circle cx="1.5" cy="10.5" r="1.5"/><circle cx="12.5" cy="10.5" r="1.5"/><line x1="7" y1="3" x2="2.5" y2="9" stroke="currentColor" stroke-width="1"/><line x1="7" y1="3" x2="11.5" y2="9" stroke="currentColor" stroke-width="1"/><line x1="3" y1="10.5" x2="11" y2="10.5" stroke="currentColor" stroke-width="1"/></svg>`, fixed: true  },
        { id: 'settings',              label: 'Settings',             icon: '🛠️', fixed: true  },
        { id: 'classes',               label: 'Classes',              icon: '<span class="cls-dot" style="display:inline-block;vertical-align:middle"></span>',        fixed: true  },
        { id: 'object-properties',     label: 'ObjectProperties',     icon: '<span class="op-prop-dot" style="display:inline-block;vertical-align:middle"></span>',    fixed: true  },
        { id: 'datatype-properties',   label: 'DatatypeProperties',   icon: '<span class="dp-prop-dot" style="display:inline-block;vertical-align:middle"></span>',    fixed: true  },
        { id: 'annotation-properties', label: 'AnnotationProperties', icon: '<span class="anno-prop-dot" style="display:inline-block;vertical-align:middle"></span>',  fixed: false },
        { id: 'individuals',           label: 'Individuals',          icon: '<span class="xsd-dot" style="display:inline-block;vertical-align:middle;margin:0"></span>',fixed: false },
        { id: 'swrl-rules',            label: 'SWRL Rules',           icon: '⚙️', fixed: false },
        { id: 'queries',               label: 'Queries',              icon: '🎯', fixed: false },
        { id: 'views',                 label: 'Views',                icon: `<svg width="14" height="10" viewBox="0 0 14 10" fill="none" style="vertical-align:middle;color:var(--text1)"><ellipse cx="7" cy="5" rx="6.5" ry="4.5" stroke="currentColor" stroke-width="1.2"/><circle cx="7" cy="5" r="2" fill="currentColor"/></svg>`, fixed: false },
        { id: 'inferences',            label: 'Inferences',           icon: '🧠', fixed: false },
    ];

    const rows = ALL_TABS.map(t => {
        const visible = !TabVisibility.isHidden(t.id);
        if (t.fixed) {
            return `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 14px;
                        border-radius:6px;background:var(--bg3);border:1px solid var(--border);
                        opacity:0.55;cursor:default">
                <input type="checkbox" checked disabled
                       style="width:15px;height:15px;accent-color:var(--accent);flex-shrink:0;pointer-events:none">
                <span style="display:flex;align-items:center;gap:6px;font-size:13px">${t.icon} ${t.label}</span>
                <span style="margin-left:auto;font-size:10px;color:var(--text-dim);
                             font-family:var(--font-mono);letter-spacing:.04em">required</span>
            </div>`;
        }
        return `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 14px;
                    border-radius:6px;background:var(--bg2);border:1px solid var(--border);
                    cursor:pointer;transition:background .15s;user-select:none"
             onmouseenter="this.style.background='var(--bg3)'"
             onmouseleave="this.style.background='var(--bg2)'"
             onclick="TabVisibility.toggle('${t.id}')">
            <input type="checkbox" ${visible ? 'checked' : ''}
                   style="width:15px;height:15px;accent-color:var(--accent);flex-shrink:0;pointer-events:none">
            <span style="display:flex;align-items:center;gap:6px;font-size:13px">${t.icon} ${t.label}</span>
        </div>`;
    }).join('');

    return `
    <div style="display:flex;flex-direction:column;gap:6px;padding:16px;flex:1;overflow-y:auto">
        <p style="margin:0 0 10px;font-size:11px;color:var(--text-dim)">
            Choose the tabs visible in the navigation bar.
            Required tabs cannot be hidden.
        </p>
        ${rows}
    </div>`;
};

APP._settingsTab = APP._settingsTab || 'gui-tabs';

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
        <div style="width:160px;flex-shrink:0;border-right:1px solid var(--border);padding:8px 0">
            ${tabBtn('gui-tabs',      '🗂️ GUI Tabs')}
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
    } else if (tab === 'gui-tabs') {
        tabContent = APP.renderGuiTabs();
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
