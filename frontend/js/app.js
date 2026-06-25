/**
 * app.js — Main application: state, navigation, section rendering
 */

// ── Tab visibility (persisted in localStorage) ──────────────────────
const TabVisibility = {
    _baseKey:  'swowl_hidden_tabs',
    _optional: ['sources','annotation-properties','individuals','swrl-rules','views','queries'],
    _hidden:   new Set(),

    _ctxKey() {
        const n = typeof APP !== 'undefined' && APP.state && APP.state.ontology && APP.state.ontology.name;
        return n ? this._baseKey + '::' + n : this._baseKey;
    },

    load() {
        try {
            const arr = JSON.parse(localStorage.getItem(this._ctxKey()) || '[]');
            this._hidden = new Set(arr);
        } catch(_) { this._hidden = new Set(); }
    },

    save() {
        localStorage.setItem(this._ctxKey(), JSON.stringify([...this._hidden]));
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
    _baseKey: 'swowl_settings',

    get defaultLang() { return this.preferredLang; },

    _ctxKey() {
        const n = typeof APP !== 'undefined' && APP.state && APP.state.ontology && APP.state.ontology.name;
        return n ? this._baseKey + '::' + n : this._baseKey;
    },

    load() {
        try {
            const s = JSON.parse(localStorage.getItem(this._ctxKey()) || '{}');
            this.preferredLang = s.preferredLang || 'fr';
            this.activeLangs   = s.activeLangs   || ['fr'];
            if (!this.activeLangs.includes(this.preferredLang))
                this.activeLangs.unshift(this.preferredLang);
            this.namingFormat  = s.namingFormat  || 'individual_counter';
        } catch (_) {}
    },

    save() {
        localStorage.setItem(this._ctxKey(), JSON.stringify({
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
        const wrap  = document.getElementById('topbar-onto-wrap');
        const label = document.getElementById('topbar-onto-label');
        const sep   = document.querySelector('.topbar-vsep-nav');
        if (!wrap || !label) return;

        const onto = this.state.ontology;
        if (onto && onto.name) {
            const display = onto.prefix && onto.name ? `${onto.prefix}:${onto.name}` : onto.name || onto.prefix;
            label.textContent = display;
            wrap.style.display = '';
            if (sep) sep.style.display = '';
        } else {
            wrap.style.display = 'none';
            if (sep) sep.style.display = 'none';
        }
    },

    _topbarOntoNavigate() {
        const name = (this.state.ontology && this.state.ontology.name) || null;
        if (!name) return;
        APP.navigate('ontologies');
        setTimeout(() => {
            const row = document.querySelector(`#onto-registry-body tr[data-name="${CSS.escape(name)}"]`);
            if (row) { row.scrollIntoView({ block: 'center' }); row.classList.add('highlight-flash'); setTimeout(() => row.classList.remove('highlight-flash'), 1200); }
        }, 120);
    },

    _topbarOntoDropdown() {
        const dropdown = document.getElementById('topbar-onto-dropdown');
        if (!dropdown) return;
        if (dropdown.style.display !== 'none') { dropdown.style.display = 'none'; return; }

        // User ontologies only (exclude readonly/system)
        const userList = (this._ontoList || []).filter(o => !o.readonly).sort((a, b) => a.name.localeCompare(b.name));
        if (userList.length === 0) return;

        const current = (this.state.ontology && this.state.ontology.name) || null;
        dropdown.innerHTML = '';
        userList.forEach(o => {
            const btn = document.createElement('button');
            btn.className = 'topbar-onto-dropdown-item' + (o.name === current ? ' active' : '');
            btn.textContent = (o.name === current ? '● ' : '○ ') + o.name;
            btn.onclick = async () => {
                dropdown.style.display = 'none';
                if (o.name === current) return;
                try {
                    await API.connectOntology(o.name);
                    UI.success(`Ontology "${o.name}" connected.`);
                    await this.refresh();
                    // Si l'onglet courant est maintenant caché pour cette ontologie → retour à Ontologies
                    const sec = this.currentSection;
                    if (sec && sec !== 'ontologies' && TabVisibility.isHidden(sec)) {
                        this.navigate('ontologies');
                    } else {
                        this.renderSection(sec);
                    }
                    API.listOntologies().then(list => {
                        this._ontoList = list;
                        const tbody = document.getElementById('onto-registry-body');
                        if (tbody) this._refreshOntoTable(list);
                    }).catch(() => {});
                } catch (e) { UI.error(e.message); }
            };
            dropdown.appendChild(btn);
        });
        dropdown.style.display = '';

        // Ferme le dropdown si on clique ailleurs
        const close = (e) => {
            if (!dropdown.contains(e.target) && e.target.id !== 'topbar-onto-arrow') {
                dropdown.style.display = 'none';
                document.removeEventListener('mousedown', close);
            }
        };
        setTimeout(() => document.addEventListener('mousedown', close), 10);
    },

    async refresh() {
        await this.loadState();
        _TreeCommon.invalidateCaches();   // hierarchy trees changed → drop buildTree caches
        this.updateStats();
        Settings.load();        // recharge les settings contextuels de l'ontologie connectée
        TabVisibility.load();   // recharge la visibilité des onglets contextuelle
        this._applyTabVisibility();
        // Keep the topbar ontology selector in sync
        API.listOntologies().then(list => { this._ontoList = list; this._updateTopbarOntology(); }).catch(() => {});
    },

    updateStats() {
        const s = this.state || {};
        const set = (id, n) => { const el = document.getElementById(id); if (el) el.textContent = n; };
        set('nc-classes', (s.classes || []).length);
        set('nc-ops',     (s.object_properties || []).length);
        set('nc-dps',     (s.datatype_properties || []).length);
        set('nc-annos',   (s.annotation_properties || []).length);
        set('nc-inds',    (s.individuals || []).length);
        set('nc-swrl',    (s.swrl_rules || []).length);
    },

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
    _applyEntityId(section, entityId, opts = {}) {
        if (!entityId) return;
        switch (section) {
            case 'classes':
                if (entityId === 'owl:Thing') {
                    ClassEditor._owlThingSelected = true;
                    ClassEditor._selectedId       = null;
                } else {
                    ClassEditor._selectedId       = entityId;
                    ClassEditor._owlThingSelected = false;
                    ClassEditor._pendingImported  = opts.imported;   // désambiguïse les homonymes
                    ClassEditor._expandAncestors(entityId);
                }
                break;
            case 'object-properties':
                OPEditor._selectedId      = entityId;
                OPEditor._topPropSelected = false;
                OPEditor._pendingImported = opts.imported;   // désambiguïse les homonymes propre/importé
                OPEditor._expandAncestors(entityId);
                break;
            case 'datatype-properties':
                DPEditor._selectedId      = entityId;
                DPEditor._topPropSelected = false;
                DPEditor._pendingImported = opts.imported;
                DPEditor._expandAncestors(entityId);
                break;
            case 'annotation-properties':
                APEditor._selectedId      = entityId;
                APEditor._pendingImported = opts.imported;
                APEditor._expanded.add(entityId);
                break;
            case 'swrl-rules':
                SWRLEditor._selectedId      = entityId;
                SWRLEditor._pendingImported = opts.imported;
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
            IndividualEditor.focusIndividual(state.entityId, false);
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
    navigateTo(section, entityId, opts = {}) {
        this._pushNav(section, entityId);
        this._applyEntityId(section, entityId, opts);
        this.renderSection(section);
        if (section === 'individuals') {
            IndividualEditor.focusIndividual(entityId, false);
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
        const editSections = ['classes','object-properties','datatype-properties','individuals','swrl-rules','views','queries'];
        if (!this.state.ontology && editSections.includes(section)) {
            main.innerHTML = this._noOntoMsg();
            return;
        }

        switch (section) {
            case 'settings':
                main.innerHTML = this.renderSettings();
                break;
            case 'sources':
                main.innerHTML = this.renderSources();
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
                if (APP._viewsTab === 'ontology2')       setTimeout(() => APP._initOntology2(), 80);
                if (APP._viewsTab === 'treemap')         setTimeout(() => APP._initTreemap(), 80);
                if (APP._viewsTab === 'ontology-network') setTimeout(() => APP._initOntologyNetwork(), 80);
                if (APP._viewsTab === 'knowledge-base')  setTimeout(() => APP._initKnowledgeBase(), 80);
                break;
            case 'queries':
                main.innerHTML = APP.renderQueries();
                if (APP._queriesTab === 'vizq')        SparqlEditor.restoreSelection();
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
                    <span class="btn-onto-desc">Download RDF, RDFS, OWL, SKOS from w3.org</span>
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
        // Ontologies utilisateur d'abord (alphabétique), puis les built-in W3C
        // (readonly) à la fin, eux aussi par ordre alphabétique → owl, rdf, rdfs, skos.
        list = [...list].sort((a, b) => {
            if (a.readonly !== b.readonly) return a.readonly ? 1 : -1;
            return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        });
        // Resolve URI → registry entry (handles trailing # or not)
        const resolveImport = (uri) =>
            list.find(x => x.uri === uri || x.uri === uri + '#'
                        || uri === x.uri + '#' || uri === x.uri);

        if (!this._ontoImportExpanded) this._ontoImportExpanded = new Set();

        const OWL_URI = 'http://www.w3.org/2002/07/owl#';
        // Dédup des imports par URI normalisée (sans '#'/'/' final) : évite qu'un même
        // namespace apparaisse deux fois (ex. .../skos/core et .../skos/core#). On garde
        // de préférence la variante avec séparateur final.
        const _dedupImports = (uris) => {
            const byNorm = new Map();
            for (const u of (uris || [])) {
                const norm = u.replace(/[#/]+$/, '');
                const ex = byNorm.get(norm);
                if (!ex) byNorm.set(norm, u);
                else if (/[#/]$/.test(u) && !/[#/]$/.test(ex)) byNorm.set(norm, u);
            }
            return [...byNorm.values()];
        };
        // Returns effective imports for any entry: user ontologies always implicitly import OWL
        const effectiveImportsOf = (entry) => {
            if (!entry || entry.readonly) return entry ? _dedupImports(entry.imports || []) : [];
            const declared = entry.imports || [];
            const hasOwl = declared.some(u => u.startsWith('http://www.w3.org/2002/07/owl'));
            return _dedupImports(hasOwl ? declared : [...declared, OWL_URI]);
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
            // Le préfixe CONTEXTUEL (import_labels de l'ontologie qui importe) prime :
            // si une entrée de label existe, on respecte sa valeur, même VIDE (→ aucun
            // préfixe affiché). Repli sur le préfixe propre de l'importée seulement si
            // aucune entrée de label.
            const prefix     = snap ? (snap.prefix || '') : (entry ? entry.prefix : '');
            const subImports = effectiveImportsOf(entry);
            const hasKids    = subImports.length > 0;
            const path       = parentPath + '/' + name;
            const safeP      = path.replace(/'/g, "\\'");
            const safeN      = name.replace(/'/g, "\\'");
            const safeU      = uri.replace(/'/g, "\\'");
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
                    <span class="${entry ? 'onto-import-link' : 'onto-import-missing'}">
                        <code ${entry ? `onclick="event.stopPropagation();APP._scrollToRegistryRow('${safeN}')" title="Go to ${name} in registry" style="cursor:pointer${missing ? '' : ';color:var(--text2)'}"` : (missing ? '' : 'style="color:var(--text2)"')}>${prefix ? prefix + ':' : ''}</code><span
                              style="font-style:italic;cursor:pointer"
                              onclick="event.stopPropagation();window.open('${safeU}','_blank','noopener')"
                              title="Open ${_escapeHtml(uri)} in browser">${_escapeHtml(uri)}</span>
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

        this._ontoList = list;   // mémorisé pour re-render au repli/dépli de la section système
        const renderRow = (o) => {
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
                   <button class="btn-sm" onclick="APP.exportHtmlSite('${safe}')" title="Export navigable HTML (single page)">↓ HTML</button>
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
                <td class="onto-iri-cell">${o.uri
                    ? `<code class="onto-ns-link" title="Ouvrir le namespace dans le navigateur"
                            style="font-size:11px;color:var(--accent);cursor:pointer;text-decoration:underline;text-decoration-style:dotted"
                            onclick="event.stopPropagation();window.open('${o.uri.replace(/'/g,"\\'")}','_blank','noopener')"
                            onmouseover="this.style.textDecorationStyle='solid'"
                            onmouseout="this.style.textDecorationStyle='dotted'">${o.uri}</code>`
                    : `<code style="font-size:11px;color:var(--text-faint)">—</code>`}</td>
                <td style="white-space:nowrap">
                    <div style="display:flex;gap:4px;align-items:center;justify-content:flex-end">
                        ${actions}
                    </div>
                </td>
            </tr>${importRows}`;
        };

        const userList = list.filter(o => !o.readonly);
        const sysList  = list.filter(o =>  o.readonly);
        const sysCollapsed = !!this._sysRegistryCollapsed;

        let html = '';
        if (userList.length) {
            html += `<tr class="onto-section-hdr"><td colspan="6">USER REGISTRY</td></tr>`;
            html += userList.map(renderRow).join('');
        }
        if (sysList.length) {
            html += `<tr class="onto-section-hdr onto-section-toggle" onclick="APP.toggleSysRegistry()">
                <td colspan="6"><span class="onto-section-caret">${sysCollapsed ? '▶' : '▼'}</span> SYSTEM REGISTRY
                    <span class="onto-section-count">(${sysList.length})</span></td></tr>`;
            if (!sysCollapsed) html += sysList.map(renderRow).join('');
        }
        tbody.innerHTML = html;
    },

    /** Replie/déplie la section SYSTEM REGISTRY (ontologies W3C). */
    toggleSysRegistry() {
        this._sysRegistryCollapsed = !this._sysRegistryCollapsed;
        if (this._ontoList) this._refreshOntoTable(this._ontoList);
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
                <!-- Imported namespaces (prefix → namespace) -->
                <div class="form-group" style="margin:0">
                    <label>Imported namespaces
                        <span style="font-size:10px;color:var(--text-dim)">(prefix → namespace, pour les entités issues d'autres ontologies — optionnel)</span></label>
                    <div id="wiz-new-ns-list" style="display:flex;flex-direction:column;gap:6px"></div>
                    <button class="btn-secondary btn-sm" style="align-self:flex-start;margin-top:6px"
                            onclick="APP._wizImpAddNs('','','wiz-new-ns-list')">+ namespace</button>
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
                        onclick="APP._wizardImportPeek()">🔍 Read prefix, URI &amp; imports from file</button>
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
                <!-- Step 2b: imported namespaces (prefix → namespace) -->
                <div class="form-group" style="margin:0">
                    <label>Imported namespaces
                        <span style="font-size:10px;color:var(--text-dim)">(prefix → namespace, pour les entités issues d'autres ontologies — optionnel)</span></label>
                    <div id="wiz-imp-ns-list" style="display:flex;flex-direction:column;gap:6px"></div>
                    <button class="btn-secondary btn-sm" style="align-self:flex-start;margin-top:6px"
                            onclick="APP._wizImpAddNs()">+ namespace</button>
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
                <!-- Step 1: source file -->
                <div class="form-group" style="margin:0">
                    <label>Source file <span style="font-size:10px;color:var(--text-dim)">(.json)</span> <span class="form-req">*</span></label>
                    <input type="text" id="wiz-load-src" placeholder="Choose .json file…"
                           style="width:100%;cursor:pointer" readonly
                           onclick="FsBrowser.open('wiz-load-src',['.json'])">
                </div>
                <button class="btn-secondary btn-sm" style="align-self:flex-start"
                        onclick="APP._wizardLoadPeek()">🔍 Read prefix, URI &amp; imports from file</button>
                <!-- Step 2: auto-filled fields -->
                <div style="display:flex;gap:10px;flex-wrap:wrap">
                    <div class="form-group" style="margin:0;flex:0 0 100px">
                        <label>Prefix</label>
                        <input type="text" id="wiz-load-prefix" placeholder="auto-detected…" style="width:100%">
                    </div>
                    <div class="form-group" style="margin:0;flex:2;min-width:260px">
                        <label>Namespace (base URI)</label>
                        <input type="text" id="wiz-load-uri" placeholder="auto-detected…" style="width:100%">
                    </div>
                </div>
                <!-- Step 2b: imported namespaces (prefix → namespace) -->
                <div class="form-group" style="margin:0">
                    <label>Imported namespaces
                        <span style="font-size:10px;color:var(--text-dim)">(prefix → namespace, pour les entités issues d'autres ontologies — optionnel)</span></label>
                    <div id="wiz-load-ns-list" style="display:flex;flex-direction:column;gap:6px"></div>
                    <button class="btn-secondary btn-sm" style="align-self:flex-start;margin-top:6px"
                            onclick="APP._wizImpAddNs('','','wiz-load-ns-list')">+ namespace</button>
                </div>
                <!-- Step 3: registry name -->
                <div style="display:flex;gap:10px;flex-wrap:wrap">
                    <div class="form-group" style="margin:0;flex:1;min-width:160px">
                        <label>Name <span class="form-req">*</span></label>
                        <input type="text" id="wiz-load-name" placeholder="auto-detected…" style="width:100%">
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
        const ns_prefixes = this._wizImpCollectNs('wiz-new-ns-list');
        try {
            await API.registerOntology({ name, path, uri, prefix, ns_prefixes });
            UI.success(`Ontology "${name}" added to registry.`);
            if (conn) await API.connectOntology(name);
            this._closeWizard();
            await this.refresh();
            this.renderOntologies();
        } catch (e) { UI.error(e.message); }
    },

    // ── Section "Imported namespaces" du wizard d'import ──────────
    _wizImpNsRow(prefix = '', ns = '') {
        const pe = String(prefix).replace(/"/g, '&quot;');
        const ne = String(ns).replace(/"/g, '&quot;');
        return `<div class="wiz-imp-ns-row" style="display:flex;gap:6px;align-items:center">
            <input type="text" class="wiz-imp-ns-prefix" value="${pe}" placeholder="prefix" style="flex:0 0 110px">
            <span style="color:var(--text-dim)">→</span>
            <input type="text" class="wiz-imp-ns-uri" value="${ne}" placeholder="http://…namespace#" style="flex:1;min-width:0">
            <button class="btn-frame-del" title="Retirer ce namespace"
                    onclick="this.closest('.wiz-imp-ns-row').remove()">✕</button>
        </div>`;
    },
    _wizImpAddNs(prefix = '', ns = '', listId = 'wiz-imp-ns-list') {
        const list = document.getElementById(listId);
        if (list) list.insertAdjacentHTML('beforeend', this._wizImpNsRow(prefix, ns));
    },
    _wizImpCollectNs(listId = 'wiz-imp-ns-list') {
        return [...document.querySelectorAll(`#${listId} .wiz-imp-ns-row`)]
            .map(r => ({
                prefix:    r.querySelector('.wiz-imp-ns-prefix')?.value.trim() || '',
                namespace: r.querySelector('.wiz-imp-ns-uri')?.value.trim()    || '',
            }))
            .filter(x => x.namespace);   // préfixe optionnel (vide → affichage par namespace)
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
            // Pré-remplit la section "Imported namespaces" avec les namespaces référencés
            const nsList = document.getElementById('wiz-imp-ns-list');
            if (nsList) {
                nsList.innerHTML = '';
                (info.namespaces || []).forEach(n => this._wizImpAddNs(n.prefix, n.namespace));
            }
            const nbNs = (info.namespaces || []).length;
            UI.success(`Prefix & URI read from file${nbNs ? ` — ${nbNs} namespace(s) référencé(s)` : ''}.`);
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
        const ns_prefixes = this._wizImpCollectNs();
        try {
            await API.importFromPath({ name, owl_path: src, save_path: savePath, uri, prefix, ns_prefixes });
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
            const nsList = document.getElementById('wiz-load-ns-list');
            if (nsList) {
                nsList.innerHTML = '';
                (info.namespaces || []).forEach(n => this._wizImpAddNs(n.prefix, n.namespace, 'wiz-load-ns-list'));
            }
            const nbNs = (info.namespaces || []).length;
            UI.success(`Info read from file${nbNs ? ` — ${nbNs} namespace(s) importé(s)` : ''}.`);
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
        const ns_prefixes = this._wizImpCollectNs('wiz-load-ns-list');
        try {
            await API.registerJson(src, name, uri, prefix, ns_prefixes);
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
                    <!-- Imported namespaces (prefix → namespace) -->
                    <div class="form-group" style="margin:0">
                        <label>Imported namespaces
                            <span style="font-size:10px;color:var(--text-dim)">(prefix → namespace des ontologies importées)</span></label>
                        <div id="wiz-edit-ns-list" style="display:flex;flex-direction:column;gap:6px">${
                            Object.entries(o.import_labels || {})
                                .map(([uri, lab]) => this._wizImpNsRow((lab && lab.prefix) || '', uri)).join('')
                        }</div>
                        <button class="btn-secondary btn-sm" style="align-self:flex-start;margin-top:6px"
                                onclick="APP._wizImpAddNs('','','wiz-edit-ns-list')">+ namespace</button>
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
        const ns_prefixes = this._wizImpCollectNs('wiz-edit-ns-list');
        try {
            await API.updateOntologyEntry(origName, { name, path, uri, prefix, ns_prefixes });
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
            : [{ label: '↓ SWRL (.json)', fmt: 'swrl' }, { label: '↓ SWORD (.swd)', fmt: 'sword' }];
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
            const ext  = fmt === 'owl' ? 'owl' : fmt === 'ttl' ? 'ttl' : fmt === 'swrl' ? 'json' : fmt === 'sword' ? 'swd' : 'jsonld';
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `${name}.${ext}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) { UI.error(`Export error: ${e.message}`); }
    },

    /** Génère une page HTML autonome (1 fichier), navigable + recherche full-text,
     *  des onglets Classes / OPs / DPs / APs / Individuals / SWRL Rules de
     *  l'ontologie CONNECTÉE (entités propres + importées). */
    exportHtmlSite(name) {
        if (!APP.state.ontology) return UI.error("Connecte une ontologie d'abord.");
        const connected = (this._ontoList || []).find(o => o.connected);
        if (connected && connected.name !== name) {
            return UI.warn(`L'export HTML porte sur l'ontologie connectée — connecte d'abord « ${name} ».`);
        }
        const s = APP.state;
        const esc = t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const enc = id => 'e_' + String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
        const disp = id => esc(_displayRefId(id));
        const ALL = new Set([
            ...(s.classes || []), ...(s.object_properties || []), ...(s.datatype_properties || []),
            ...(s.annotation_properties || []), ...(s.individuals || []),
        ].map(e => e.id));
        // Référence cliquable si l'entité existe, sinon texte (ex. owl:Thing, xsd:…)
        const ref = id => ALL.has(id) ? `<a href="#${enc(id)}" class="ref">${disp(id)}</a>` : `<span class="ext">${disp(id)}</span>`;
        const refs = (arr, link = true) => (arr || []).filter(x => typeof x === 'string').length
            ? (arr || []).filter(x => typeof x === 'string').map(x => link ? ref(x) : disp(x)).join(', ') : '';

        const restrText = (r) => {
            const p = ref(r.property);
            switch (r.type) {
                case 'someValuesFrom': return `∃ ${p} . ${ref(r.filler)}`;
                case 'allValuesFrom':  return `∀ ${p} . ${ref(r.filler)}`;
                case 'hasValue':       return `${p} ∋ ${esc(r.value)}`;
                case 'exactCardinality': return `${p} = ${r.cardinality}${r.filler ? ' ' + ref(r.filler) : ''}`;
                case 'minCardinality':   return `${p} ≥ ${r.cardinality}${r.filler ? ' ' + ref(r.filler) : ''}`;
                case 'maxCardinality':   return `${p} ≤ ${r.cardinality}${r.filler ? ' ' + ref(r.filler) : ''}`;
                default: return r.type === '_marker' ? p : esc(JSON.stringify(r));
            }
        };
        // ── Rendu façon SWOWL : cadres encadrés + items à icônes ──
        const ICONCLS = { cls: 'ic-cls', op: 'ic-op', dp: 'ic-dp', ap: 'ic-ap', ind: 'ic-ind', xsd: 'ic-xsd' };
        const SEC_FOR = { cls: 'classes', op: 'object-properties', dp: 'datatype-properties', ap: 'annotation-properties', ind: 'individuals' };
        const iconSpan = t => `<span class="ic ${ICONCLS[t] || ''}"></span>`;
        // item de liste : icône de type + référence cliquable (ou texte externe)
        const li = (id, t) => `<div class="cls-list-item">${iconSpan(t)}${ALL.has(id)
            ? `<a href="#${enc(id)}" class="cls-list-lbl ref" data-nav-sec="${SEC_FOR[t]||'classes'}" data-nav-id="${id.replace(/"/g,'&quot;')}">${disp(id)}</a>`
            : `<span class="cls-list-lbl ext">${disp(id)}</span>`}</div>`;
        const liList = (arr, t) => (arr || []).filter(x => typeof x === 'string').map(x => li(x, t)).join('');
        // item « brut » (restriction, caractéristique…) sans référence
        const liRaw = (html, t) => `<div class="cls-list-item">${t ? iconSpan(t) : ''}<span class="cls-list-lbl">${html}</span></div>`;
        // cadre encadré (n'apparaît que si le corps est non vide)
        const frame = (tag, body, cls = '') => body
            ? `<div class="cls-frame"><div class="cls-frame-bar"><span class="cls-frame-tag ${cls}">${tag}</span></div><div class="cls-frame-body">${body}</div></div>`
            : '';
        const annoFrame = (a) => {
            if (!a) return '';
            const rows = [];
            (a.labels || []).forEach(l => rows.push(['rdfs:label', `${esc(l.value)}${l.lang ? ` <span class="lang">@${esc(l.lang)}</span>` : ''}`]));
            (a.comments || []).forEach(c => rows.push(['rdfs:comment', `${esc(c.value)}${c.lang ? ` <span class="lang">@${esc(c.lang)}</span>` : ''}`]));
            (a.other || []).forEach(o => rows.push([esc(o.property), esc(o.value)]));
            if (!rows.length) return '';
            const tb = rows.map(([k, v]) => `<tr><td class="an-p">${k}</td><td class="an-v">${v}</td></tr>`).join('');
            return frame('Annotation(s)', `<table class="cls-anno-table">${tb}</table>`);
        };
        // Nom d'affichage d'un individu (1er rdfs:label), sinon null
        const dispName = e => { const l = (e.annotations && e.annotations.labels || [])[0]; return l && l.value ? l.value : null; };

        // Nom d'affichage des individus selon les display_rules configurées (comme l'éditeur SWOWL)
        const _dr = (s.ontology && s.ontology.display_rules) || {};
        const _drSingle = _dr.single || {}, _drMulti = _dr.multi || {};
        const _clsById = {}; (s.classes || []).forEach(c => { _clsById[c.id] = c; });
        const _effRule = (classId, map, _v) => {
            const key = classId || '__root__';
            if (key in map) return map[key] || null;
            if (!classId) return null;
            _v = _v || new Set(); if (_v.has(classId)) return null; _v.add(classId);
            const cls = _clsById[classId];
            if (!cls) return map['__root__'] || null;
            for (const parent of (cls.subClassOf || []).filter(x => typeof x === 'string')) {
                const r = _effRule(parent, map, _v); if (r) return r;
            }
            return map['__root__'] || null;
        };
        const _labelByProp = (ind, prop) => {
            if (!prop) return null;
            if (prop === 'rdfs:label' || prop.indexOf('rdfs:label@') === 0) {
                const labels = (ind.annotations && ind.annotations.labels) || [];
                if (!labels.length) return null;
                const lang = prop.indexOf('@') >= 0 ? prop.split('@')[1] : null;
                if (lang) { const ex = labels.find(l => l.lang === lang); if (ex) return ex.value; }
                return labels[0].value;
            }
            if (prop === 'rdfs:comment') { const c = ((ind.annotations && ind.annotations.comments) || [])[0]; return c ? c.value : null; }
            const o = ((ind.annotations && ind.annotations.other) || []).find(a => a.property === prop); if (o) return o.value;
            const da = (ind.dataAssertions || []).find(a => a.property === prop); if (da) return da.value;
            const oa = (ind.objectAssertions || []).find(a => a.property === prop); if (oa) return oa.target;
            return null;
        };
        const _buildMulti = (ind, rows) => {
            if (!rows || !rows.length) return null;
            let res = '', has = false;
            for (const { sep, propId } of rows) {
                if (!propId) { if (sep) { res += sep; has = true; } }
                else { const v = _labelByProp(ind, propId); if (v) { res += (sep || '') + v; has = true; } }
            }
            return has ? (res || null) : null;
        };
        const _resolveFor = clsId => {
            const m = _effRule(clsId, _drMulti); if (m) return { multi: m };
            const sg = _effRule(clsId, _drSingle); if (sg) return { single: sg };
            return null;
        };
        // DisplayName : règles configurées (types puis racine), repli sur rdfs:label
        const indDispName = ind => {
            let rule = null;
            for (const t of (ind.types || [])) { rule = _resolveFor(t); if (rule) break; }
            if (!rule) rule = _resolveFor(null);
            const r = rule ? (rule.multi ? _buildMulti(ind, rule.multi) : (rule.single ? _labelByProp(ind, rule.single) : null)) : null;
            return r || dispName(ind);
        };

        // Texte de recherche (id + labels + commentaires + références + contenu)
        const annoTxt = a => !a ? '' : [...(a.labels || []).map(l => l.value), ...(a.comments || []).map(c => c.value), ...(a.other || []).map(o => o.property + ' ' + o.value)].join(' ');

        const card = (id, searchExtra, bodyHtml, displayName, metaTxt) => {
            const txt = (id + ' ' + _displayRefId(id) + ' ' + (displayName || '') + ' ' + (searchExtra || '')).toLowerCase();
            const main = displayName ? esc(displayName) : disp(id);
            const sub = displayName ? `<span class="ent-sub">${disp(id)}</span>` : '';
            return `<div class="ent cls-editor" id="${enc(id)}" data-id="${esc(id)}" data-s="${esc(txt)}">
                <div class="cls-editor-hdr"><div class="ent-h"><span class="ent-ic"></span><span class="ent-id">${main}</span>${sub}${metaTxt ? `<span class="ent-meta">${metaTxt}</span>` : ''}</div></div>
                ${bodyHtml ? `<div class="ent-b">${bodyHtml}</div>` : ''}
            </div>`;
        };

        // ── Atomes SWRL → texte lisible ───────────────────────
        const atomText = (a) => {
            if (!a) return '';
            switch (a.type) {
                case 'type_atom':     return `${ref(a.class_id || '?')}(${esc(a.var || '?')})`;
                case 'property_atom': return `${ref(a.property_id || '?')}(${esc(a.subject || '?')}, ${esc(a.object || '?')})`;
                case 'equality_atom': return `${esc(a.var || '?')} ${esc(a.operator || '=')} ${ALL.has(a.value) ? ref(a.value) : esc(a.value)}`;
                case 'naf_block':     return `NAF(${(a.atoms || []).map(atomText).join(' ∧ ')})`;
                default: return esc(a.type || '');
            }
        };

        // ── Atomes SWRL en mode « triple » (comme l'éditeur SWOWL) ──
        const _dpIds = new Set((s.datatype_properties || []).map(p => p.id));
        const _propIcon = id => _dpIds.has(id) ? 'dp' : 'op';
        const v = x => `<span class="swrl-var">${esc(x || '?')}</span>`;
        const atomInner = (a) => {
            if (!a) return '';
            switch (a.type) {
                case 'type_atom':     return `${v(a.var)} <span class="swrl-kw">is a</span> ${iconSpan('cls')}${ref(a.class_id || '?')}`;
                case 'property_atom': return `${v(a.subject)} ${iconSpan(_propIcon(a.property_id))}${ref(a.property_id || '?')} ${v(a.object)}`;
                case 'equality_atom': return `${v(a.var)} <span class="swrl-op">${esc(a.operator || '=')}</span> ${ALL.has(a.value) ? ref(a.value) : esc(a.value)}`;
                case 'naf_block':     return `<span class="swrl-naf">NAF</span> ( ${(a.atoms || []).map(atomInner).join(' <span class="swrl-and">∧</span> ')} )`;
                default: return esc(a.type || '');
            }
        };
        // Liste d'atomes : un par ligne, « ∧ » en fin de ligne (sauf le dernier).
        // Les atomes « conditional » sont rendus en bloc if/then imbriqué (récursif).
        const atomLines = (arr) => {
            const list = (arr || []);
            if (!list.length) return `<div class="swrl-atom">⊤</div>`;
            return list.map((a, i) => {
                const and = i < list.length - 1 ? ' <span class="swrl-and">∧</span>' : '';
                if (a && a.type === 'conditional') {
                    const cond = Array.isArray(a.condition) ? a.condition : (a.condition ? [a.condition] : []);
                    const cons = Array.isArray(a.consequent) ? a.consequent : (a.consequent ? [a.consequent] : []);
                    return `<div class="swrl-cond">`
                        + `<div class="cls-frame"><div class="cls-frame-bar"><span class="cls-frame-tag swrl-if">if</span></div><div class="cls-frame-body">${atomLines(cond)}</div></div>`
                        + `<div class="cls-frame"><div class="cls-frame-bar"><span class="cls-frame-tag swrl-then">then</span></div><div class="cls-frame-body">${atomLines(cons)}</div></div>`
                        + `</div>${and ? `<div class="swrl-atom swrl-and-line">${and}</div>` : ''}`;
                }
                return `<div class="swrl-atom">${atomInner(a)}${and}</div>`;
            }).join('');
        };

        // ── « Where Used in Rules » : règles SWRL référençant l'entité ──
        const _ruleHits = (pred) => {
            const visit = a => {
                if (!a) return false;
                if (Array.isArray(a)) return a.some(visit);
                if (pred(a)) return true;
                if (a.type === 'naf_block') return (a.atoms || []).some(visit);
                if (a.type === 'conditional') return visit(a.condition) || visit(a.consequent);
                return false;
            };
            return (s.swrl_rules || []).filter(r => [...(r.body || []), ...(r.head || [])].some(visit));
        };
        const whereUsed = (pred) => {
            const used = _ruleHits(pred);
            if (!used.length) return '';
            const rows = used.map(r => `<div class="cls-list-item"><span class="ic-gear">⚙️</span><a href="#${enc(r.id)}" class="cls-list-lbl ref" data-nav-sec="swrl-rules" data-nav-id="${r.id.replace(/"/g,'&quot;')}">${esc(r.label || _displayRefId(r.id))}</a></div>`).join('');
            return frame(`Where Used in Rules <span class="frame-cnt">${used.length}</span>`, rows, 'cls-frame-tag-rule');
        };
        const usedByClass = id => whereUsed(a => a.type === 'type_atom' && a.class_id === id);
        const usedByProp  = id => whereUsed(a => a.type === 'property_atom' && a.property_id === id);
        const usedByInd   = id => whereUsed(a => (a.type === 'equality_atom' && a.value === id) || (a.type === 'property_atom' && (a.subject === id || a.object === id)));

        // ── Cross-références classe → OPs/DPs/individus ──
        const opRange = {};
        (s.object_properties || []).forEach(p => {
            (p.range || []).forEach(r => { (opRange[r] = opRange[r] || []).push(p.id); });
        });
        const indTypes = {};
        (s.individuals || []).forEach(i => {
            (i.types || []).filter(t => typeof t === 'string').forEach(t => { (indTypes[t] = indTypes[t] || []).push(i.id); });
        });
        const xrefFrame = (tag, ids, type, cls = 'cls-frame-tag-blue') => {
            if (!ids || !ids.length) return '';
            return frame(`${tag} <span class="frame-cnt">${ids.length}</span>`, ids.map(id => li(id, type)).join(''), cls);
        };

        // ── Sections ──────────────────────────────────────────
        const sections = [];

        // Classes
        sections.push({ key: 'classes', title: 'Classes', dot: 'cls', items: (s.classes || []).map(c => {
            const supers = (c.subClassOf || []).filter(x => typeof x === 'string');
            const restr  = (c.subClassOf || []).filter(x => typeof x === 'object' && x.type !== '_marker');
            const props  = (c.subClassOf || []).filter(x => typeof x === 'object' && x.type === '_marker');
            const propRestrBody = [...restr.map(r => liRaw(restrText(r))), ...props.map(r => liRaw(restrText(r), 'op'))].join('');
            const body = [
                annoFrame(c.annotations),
                frame('Properties and Restrictions', propRestrBody, 'cls-frame-tag-blue'),
                xrefFrame('Where Used in Range', opRange[c.id], 'op'),
                frame('Disjoints', liList(c.disjointWith, 'cls'), 'cls-frame-tag-orange'),
                frame('Equivalent', (c.equivalentClass || []).map(e => typeof e === 'string' ? li(e, 'cls') : liRaw(restrText(e))).join(''), 'cls-frame-tag-orange'),
                frame('SubClassOf', liList(supers, 'cls')),
                xrefFrame('Individuals', indTypes[c.id], 'ind'),
                usedByClass(c.id),
            ].join('');
            const stxt = [...supers, ...(c.disjointWith || []), ...restr.map(r => r.property + ' ' + (r.filler || r.value || '')), annoTxt(c.annotations)].join(' ');
            return { id: c.id, imported: !!c._imported, html: card(c.id, stxt, body, null, '(owl:Class)') };
        }) });

        // ObjectProperties
        sections.push({ key: 'object_properties', title: 'ObjectProperties', dot: 'op', items: (s.object_properties || []).map(p => {
            const chars = Object.entries(p.characteristics || {}).filter(([, v]) => v).map(([k]) => k);
            const body = [
                annoFrame(p.annotations),
                frame('Domain(s)', liList(p.domain, 'cls')),
                frame('Range(s)', liList(p.range, 'cls')),
                frame('SubPropertyOf', liList(p.subPropertyOf, 'op')),
                frame('Inverse Of', p.inverseOf ? li(p.inverseOf, 'op') : ''),
                frame('Characteristics', chars.map(c => liRaw(esc(c))).join(''), 'cls-frame-tag-blue'),
                usedByProp(p.id),
            ].join('');
            const stxt = [...(p.domain || []), ...(p.range || []), p.inverseOf, ...chars, annoTxt(p.annotations)].join(' ');
            return { id: p.id, imported: !!p._imported, html: card(p.id, stxt, body, null, '(owl:ObjectProperty)') };
        }) });

        // DatatypeProperties
        sections.push({ key: 'datatype_properties', title: 'DatatypeProperties', dot: 'dp', items: (s.datatype_properties || []).map(p => {
            const body = [
                annoFrame(p.annotations),
                frame('Domain(s)', liList(p.domain, 'cls')),
                frame('Range', (p.range || []).map(r => liRaw(disp(r), 'xsd')).join('')),
                frame('SubPropertyOf', liList(p.subPropertyOf, 'dp')),
                frame('Characteristics', p.functional ? liRaw('Functional') : '', 'cls-frame-tag-blue'),
                usedByProp(p.id),
            ].join('');
            const stxt = [...(p.domain || []), ...(p.range || []), annoTxt(p.annotations)].join(' ');
            return { id: p.id, imported: !!p._imported, html: card(p.id, stxt, body, null, '(owl:DatatypeProperty)') };
        }) });

        // AnnotationProperties
        sections.push({ key: 'annotation_properties', title: 'AnnotationProperties', dot: 'ap', items: (s.annotation_properties || []).map(p => {
            const body = [annoFrame(p.annotations), frame('SubPropertyOf', liList(p.subPropertyOf, 'ap'))].join('');
            return { id: p.id, imported: !!p._imported, html: card(p.id, annoTxt(p.annotations), body, null, '(owl:AnnotationProperty)') };
        }) });

        // Individuals
        sections.push({ key: 'individuals', title: 'Individuals', dot: 'ind', items: (s.individuals || []).map(i => {
            const oa = (i.objectAssertions || []).map(a => liRaw(`${ref(a.property)} <span class="rel">→</span> ${ref(a.target)}`, 'op')).join('');
            const da = (i.dataAssertions || []).map(a => liRaw(`${ref(a.property)} <span class="rel">:</span> ${esc(a.value)}${a.datatype ? ` <span class="lang">^^${esc(a.datatype)}</span>` : ''}`, 'dp')).join('');
            const body = [
                annoFrame(i.annotations),
                frame('Types (rdf:type)', liList(i.types, 'cls')),
                frame('Object assertions', oa),
                frame('Data assertions', da),
                frame('sameAs', liList(i.sameAs, 'ind')),
                frame('differentFrom', liList(i.differentFrom, 'ind'), 'cls-frame-tag-orange'),
                usedByInd(i.id),
            ].join('');
            const dn = indDispName(i);
            const stxt = [dn, ...(i.types || []), ...(i.objectAssertions || []).map(a => a.property + ' ' + a.target), ...(i.dataAssertions || []).map(a => a.property + ' ' + a.value), annoTxt(i.annotations)].join(' ');
            return { id: i.id, imported: !!i._imported, html: card(i.id, stxt, body, dn, '(owl:NamedIndividual)') };
        }) });

        // SWRL Rules
        sections.push({ key: 'swrl_rules', title: 'SWRL Rules', dot: 'rule', items: (s.swrl_rules || []).map(r => {
            const body = [
                annoFrame({ labels: r.label ? [{ value: r.label }] : [], comments: r.comment ? [{ value: r.comment }] : [] }),
                frame('if', atomLines(r.body), 'swrl-if'),
                frame('then', atomLines(r.head), 'swrl-then'),
            ].join('');
            const stxt = [r.label, r.comment, ...(r.body || []).map(a => a.class_id || a.property_id || ''), ...(r.head || []).map(a => a.class_id || a.property_id || '')].join(' ');
            return { id: r.id, imported: !!r._imported, html: card(r.id, stxt, body, r.label || null, '(swrl:Rule)') };
        }) });

        const visible = sections.filter(sec => sec.items.length);

        // Icônes SWOWL (mêmes que l'éditeur) : classe = rond cuivré, OP = rect bleu,
        // DP = rect vert, AP = rect jaune, individu = losange violet, règle = ⚙️.
        const iconMk = {
            classes: '<span class="ic ic-cls"></span>',
            object_properties: '<span class="ic ic-op"></span>',
            datatype_properties: '<span class="ic ic-dp"></span>',
            annotation_properties: '<span class="ic ic-ap"></span>',
            individuals: '<span class="ic ic-ind"></span>',
            swrl_rules: '<span class="ic-gear">⚙️</span>',
        };
        const superLabel = {
            classes: 'Super Classes', object_properties: 'Super Properties',
            datatype_properties: 'Super Properties', annotation_properties: 'Super Properties',
        };

        // Arbre de navigation (gauche), hiérarchique pour classes/propriétés
        const rawOf = {
            classes: s.classes, object_properties: s.object_properties, datatype_properties: s.datatype_properties,
            annotation_properties: s.annotation_properties, individuals: s.individuals, swrl_rules: s.swrl_rules,
        };
        const subClsParents = e => (e.subClassOf || []).filter(x => typeof x === 'string');
        const subPropParents = e => (e.subPropertyOf || []).filter(x => typeof x === 'string');
        const parentsOf = {
            classes: subClsParents, object_properties: subPropParents, datatype_properties: subPropParents,
            annotation_properties: subPropParents, individuals: () => [], swrl_rules: () => [],
        };
        const treeRows = (arr, getParents, ic) => {
            arr = arr || [];
            const ids = new Set(arr.map(e => e.id)), ch = {}, hp = new Set(), byId = {};
            arr.forEach(e => { ch[e.id] = []; byId[e.id] = e; });
            arr.forEach(e => getParents(e).forEach(p => { if (ids.has(p) && p !== e.id) { ch[p].push(e.id); hp.add(e.id); } }));
            const alpha = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });
            const roots = arr.filter(e => !hp.has(e.id)).map(e => e.id).sort(alpha);
            Object.keys(ch).forEach(k => ch[k].sort(alpha));
            const out = [], seen = new Set();
            const visit = (id, depth) => {
                if (seen.has(id)) return; seen.add(id);
                const e = byId[id];
                out.push(`<div class="ti${e && e._imported ? ' imp' : ''}" data-target="${enc(id)}" data-id="${esc(id)}" style="padding-left:${depth * 14 + 10}px">${ic}<span class="tl">${disp(id)}</span></div>`);
                (ch[id] || []).forEach(c => visit(c, depth + 1));
            };
            roots.forEach(r => visit(r, 0));
            return out.join('');
        };

        // Données embarquées : chaîne de parents (panneau « Super … ») + types stricts des individus
        const parentMap = (arr, getP) => {
            const ids = new Set((arr || []).map(e => e.id)), m = {};
            (arr || []).forEach(e => { const ps = getP(e).filter(p => ids.has(p) && p !== e.id); if (ps.length) m[e.id] = ps; });
            return m;
        };
        const labelMap = arr => { const m = {}; (arr || []).forEach(e => m[e.id] = _displayRefId(e.id)); return m; };
        const META = {
            classes: { P: parentMap(s.classes, subClsParents), L: labelMap(s.classes) },
            object_properties: { P: parentMap(s.object_properties, subPropParents), L: labelMap(s.object_properties) },
            datatype_properties: { P: parentMap(s.datatype_properties, subPropParents), L: labelMap(s.datatype_properties) },
            annotation_properties: { P: parentMap(s.annotation_properties, subPropParents), L: labelMap(s.annotation_properties) },
        };
        const clsIds = new Set((s.classes || []).map(c => c.id));
        const INDTYPES = {}, INDLABEL = {};
        (s.individuals || []).forEach(i => {
            INDTYPES[i.id] = (i.types || []).filter(t => typeof t === 'string' && clsIds.has(t));
            INDLABEL[i.id] = indDispName(i) || _displayRefId(i.id);
        });

        const tabs = visible.map((sec, i) =>
            `<button class="tab${i === 0 ? ' active' : ''}" data-sec="${sec.key}">${iconMk[sec.key]}${sec.title}<span class="cnt">${sec.items.length}</span></button>`
        ).join('');

        const panels = visible.map((sec, i) => {
            const hidden = i === 0 ? '' : ' style="display:none"';
            const cards = sec.items.map(it => it.html).join('');
            let inner;
            if (sec.key === 'individuals') {
                const clsTree = treeRows(s.classes, subClsParents, iconMk.classes);
                inner = `<div class="split">
                    <div class="tree indcls">${clsTree || '<div class="ph2">Aucune classe.</div>'}</div>
                    <div class="indlist"><div class="col-h">Individuals</div><div class="il-body"><div class="ph2">Sélectionne une classe.</div></div></div>
                    <div class="detail">${cards}<div class="placeholder">Sélectionne un individu.</div></div>
                </div>`;
            } else if (sec.key === 'swrl_rules') {
                inner = `<div class="split">
                    <div class="tree">${treeRows(rawOf[sec.key], parentsOf[sec.key], iconMk[sec.key])}</div>
                    <div class="detail">${cards}<div class="placeholder">Sélectionne une règle.</div></div>
                </div>`;
            } else {
                inner = `<div class="split">
                    <div class="leftcol">
                        <div class="tree">${treeRows(rawOf[sec.key], parentsOf[sec.key], iconMk[sec.key])}</div>
                        <div class="superpanel"><div class="col-h">${superLabel[sec.key] || 'Super'}</div><div class="sp-body"><div class="ph2">—</div></div></div>
                    </div>
                    <div class="detail">${cards}<div class="placeholder">Sélectionne un élément.</div></div>
                </div>`;
            }
            return `<div class="panel" data-sec="${sec.key}"${hidden}>${inner}</div>`;
        }).join('');

        const onto = s.ontology || {};
        const title = esc(onto.name || name);
        const total = sections.reduce((n, sec) => n + sec.items.length, 0);

        // ── Données graphe D3 ──
        const gNodes = [
            ...(s.classes || []).map(c => ({ id: c.id, lbl: _displayRefId(c.id), type: 'cls' })),
            ...(s.object_properties || []).map(p => ({ id: p.id, lbl: _displayRefId(p.id), type: 'op' })),
            ...(s.datatype_properties || []).map(p => ({ id: p.id, lbl: _displayRefId(p.id), type: 'dp' })),
            ...(s.individuals || []).map(i => ({ id: i.id, lbl: indDispName(i) || _displayRefId(i.id), type: 'ind' })),
        ];
        const gNodeIds = new Set(gNodes.map(n => n.id));
        const gEdges = [];
        (s.classes || []).forEach(c => {
            (c.subClassOf || []).filter(x => typeof x === 'string' && gNodeIds.has(x)).forEach(p => gEdges.push({ s: c.id, t: p, lbl: 'subClassOf', k: 'sub' }));
        });
        (s.object_properties || []).forEach(p => {
            (p.domain || []).filter(x => gNodeIds.has(x)).forEach(d => gEdges.push({ s: p.id, t: d, lbl: 'domain', k: 'dom' }));
            (p.range || []).filter(x => gNodeIds.has(x)).forEach(r => gEdges.push({ s: p.id, t: r, lbl: 'range', k: 'rng' }));
        });
        // DatatypeProperties : arête 'domain' vers leur classe (leur range est un
        // type de données, pas une classe → pas d'arête de range).
        (s.datatype_properties || []).forEach(p => {
            (p.domain || []).filter(x => gNodeIds.has(x)).forEach(d => gEdges.push({ s: p.id, t: d, lbl: 'domain', k: 'dom' }));
        });
        (s.individuals || []).forEach(i => {
            (i.types || []).filter(x => gNodeIds.has(x)).forEach(t => gEdges.push({ s: i.id, t, lbl: 'type', k: 'type' }));
            (i.objectAssertions || []).filter(a => gNodeIds.has(a.target)).forEach(a => gEdges.push({ s: i.id, t: a.target, lbl: _displayRefId(a.property), k: 'oa' }));
        });

        const networkTab = `<button class="tab" data-sec="__network__"><span style="font-size:13px">🕸</span> Ontology (Network)<span class="cnt">${gNodes.length}</span></button>`;
        const networkPanel = `<div class="panel" data-sec="__network__" style="display:none;height:100%;position:relative">
  <div id="net-wrap" style="width:100%;height:100%;position:relative;background:#0e1219">
    <svg id="net-svg" style="width:100%;height:100%"></svg>
    <div id="net-tooltip" style="position:absolute;pointer-events:none;display:none;background:#1d2535;border:1px solid #2a3347;border-radius:6px;padding:7px 12px;font-size:12px;color:#e2e8f0;font-family:monospace;z-index:20;max-width:340px;word-break:break-all"></div>
    <button id="net-fit" style="position:absolute;top:12px;right:12px;background:#1d2535;border:1px solid #2a3347;color:#94a3b8;border-radius:6px;padding:6px 14px;font-size:12px;cursor:pointer;z-index:10">Fit</button>
    <div id="net-legend" style="position:absolute;bottom:16px;left:16px;background:#161b24cc;border:1px solid #2a3347;border-radius:7px;padding:10px 14px;font-size:11px;color:#94a3b8;display:flex;flex-direction:column;gap:5px;z-index:10;backdrop-filter:blur(4px)">
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#4b5a6e;margin-bottom:2px">Nœuds</div>
      <div style="display:flex;align-items:center;gap:7px"><span style="width:12px;height:12px;border-radius:50%;background:#b87333;display:inline-block;flex-shrink:0"></span>Class</div>
      <div style="display:flex;align-items:center;gap:7px"><span style="width:12px;height:8px;border-radius:2px;background:#3b82f6;display:inline-block;flex-shrink:0"></span>Object Property</div>
      <div style="display:flex;align-items:center;gap:7px"><span style="width:12px;height:8px;border-radius:2px;background:#10b981;display:inline-block;flex-shrink:0"></span>Data Property</div>
      <div style="display:flex;align-items:center;gap:7px"><span style="width:10px;height:10px;background:#8b4db8;display:inline-block;transform:rotate(45deg);flex-shrink:0"></span>Individual</div>
      <div style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#4b5a6e;margin-top:4px;margin-bottom:2px">Arêtes</div>
      <div style="display:flex;align-items:center;gap:7px"><span style="width:20px;height:2px;background:#6b7280;display:inline-block;flex-shrink:0"></span>subClassOf</div>
      <div style="display:flex;align-items:center;gap:7px"><span style="width:20px;height:2px;background:#60a5fa;display:inline-block;flex-shrink:0"></span>domain</div>
      <div style="display:flex;align-items:center;gap:7px"><span style="width:20px;height:2px;background:#34d399;display:inline-block;flex-shrink:0"></span>range</div>
      <div style="display:flex;align-items:center;gap:7px"><span style="width:20px;height:2px;background:#a78bfa;display:inline-block;flex-shrink:0"></span>type</div>
      <div style="display:flex;align-items:center;gap:7px"><span style="width:20px;height:2px;background:#e2d9c0;display:inline-block;flex-shrink:0"></span>objectAssertion</div>
    </div>
  </div>
</div>`;

        const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — SWOWL export</title>
<style>
:root{--bg:#0e1219;--bg2:#161b24;--bg3:#1d2535;--bd:#2a3347;--tx:#e2e8f0;--dim:#94a3b8;--faint:#4b5a6e;--acc:#5f8dd3}
*{box-sizing:border-box}html,body{height:100%}
body{margin:0;display:flex;flex-direction:column;height:100vh;overflow:hidden;background:var(--bg);color:var(--tx);font:14px/1.6 system-ui,sans-serif}
a{color:var(--acc);text-decoration:none}a:hover{text-decoration:underline}
header{flex-shrink:0;background:var(--bg2);border-bottom:1px solid var(--bd);padding:10px 16px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
header h1{font-size:15px;font-weight:600;margin:0}header .pfx{color:var(--dim);font-size:12px;font-family:monospace}
header .badge-ro{font-size:11px;color:var(--faint);background:var(--bg3);border:1px solid var(--bd);border-radius:10px;padding:1px 8px;white-space:nowrap}
.search-wrap{position:relative;flex:1;min-width:240px}
#q{width:100%;background:var(--bg3);border:1px solid var(--bd);color:var(--tx);border-radius:6px;padding:7px 12px;font-size:13px}
#results{position:absolute;top:38px;left:0;right:0;background:var(--bg2);border:1px solid var(--bd);border-radius:6px;max-height:60vh;overflow:auto;display:none;box-shadow:0 8px 24px rgba(0,0,0,.5);z-index:30}
.res{display:flex;align-items:center;gap:8px;padding:6px 12px;cursor:pointer;font-size:13px}
.res:hover{background:var(--bg3)}.res .rl{flex:1;font-family:monospace;color:#cfe0ff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.res .rs{font-size:10px;color:var(--dim);background:var(--bg3);border-radius:8px;padding:1px 7px;flex-shrink:0}
.res.empty{color:var(--dim);font-style:italic;cursor:default}
nav.tabs{flex-shrink:0;display:flex;flex-wrap:wrap;gap:2px;background:var(--bg2);border-bottom:1px solid var(--bd);padding:0 12px}
.tab{display:flex;align-items:center;gap:6px;background:none;border:none;border-bottom:2px solid transparent;color:var(--dim);font-size:13px;padding:9px 14px;cursor:pointer}
.tab:hover{color:var(--tx)}.tab.active{color:var(--acc);border-bottom-color:var(--acc);font-weight:600}
.cnt{font-size:11px;color:var(--dim);background:var(--bg3);border-radius:10px;padding:1px 8px}
/* Icônes SWOWL */
.ic{flex-shrink:0;display:inline-block}
.ic-cls{width:12px;height:12px;border-radius:50%;background:#b87333}
.ic-op{width:12px;height:8px;border-radius:2px;background:#3b82f6}
.ic-dp{width:12px;height:8px;border-radius:2px;background:#10b981}
.ic-ap{width:12px;height:8px;border-radius:2px;background:#e8d400}
.ic-ind{width:9px;height:9px;background:#8b4db8;border-radius:1px;transform:rotate(45deg);margin:0 2px}
.ic-gear{flex-shrink:0;font-size:12px;line-height:1}
.panels{flex:1;min-height:0;overflow:hidden;position:relative}.panel{position:absolute;inset:0;display:none}
.split{display:flex;height:100%}
.tree{width:300px;flex-shrink:0;overflow:auto;border-right:1px solid var(--bd);padding:8px 4px}
.ti{display:flex;align-items:center;gap:6px;padding:3px 8px;font-family:monospace;font-size:12px;border-radius:4px;cursor:pointer;white-space:nowrap}
.ti:hover{background:var(--bg3)}.ti.sel{background:var(--acc);color:#fff}.ti.imp{font-style:italic;opacity:.75}
.ti .tl{overflow:hidden;text-overflow:ellipsis}
/* Colonne gauche = arbre + panneau Super */
.leftcol{width:300px;flex-shrink:0;display:flex;flex-direction:column;border-right:1px solid var(--bd)}
.leftcol .tree{width:auto;border-right:none;flex:1;min-height:0}
.superpanel{flex-shrink:0;max-height:40%;display:flex;flex-direction:column;border-top:1px solid var(--bd)}
.col-h{flex-shrink:0;font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:var(--dim);padding:6px 10px;background:var(--bg2);border-bottom:1px solid var(--bd)}
.sp-body{overflow:auto;padding:4px}
.sp-i{display:flex;align-items:center;gap:6px;padding:3px 8px;font-family:monospace;font-size:12px;border-radius:4px;cursor:pointer;white-space:nowrap}
.sp-i:hover{background:var(--bg3)}.sp-i .tl{overflow:hidden;text-overflow:ellipsis}
.ph2{color:var(--dim);font-style:italic;font-size:12px;padding:8px 10px}
/* Individuals : 3 colonnes (classes | individus | détail) */
.indcls{width:260px}
.indlist{width:260px;flex-shrink:0;display:flex;flex-direction:column;border-right:1px solid var(--bd)}
.il-body{flex:1;overflow:auto;padding:6px 4px}
.ii{display:flex;align-items:center;gap:6px;padding:3px 8px;font-family:monospace;font-size:12px;border-radius:4px;cursor:pointer;white-space:nowrap}
.ii:hover{background:var(--bg3)}.ii.sel{background:var(--acc);color:#fff}.ii .tl{overflow:hidden;text-overflow:ellipsis}
.detail{flex:1;min-width:0;overflow:auto;padding:16px 22px}
.detail .ent{display:none;margin:0}.detail .ent.sel{display:block}
.ic-xsd{width:9px;height:9px;background:#8b4db8;border-radius:1px;transform:rotate(45deg);margin:0 2px}
.placeholder{color:var(--dim);font-style:italic;padding:20px}
/* Fiche de détail façon éditeur SWOWL */
.ent{max-width:880px}
.cls-editor-hdr{padding:4px 2px 10px;border-bottom:1px solid var(--bd);margin-bottom:8px}
.ent-h{display:flex;align-items:center;gap:9px;font-family:monospace;font-weight:600;font-size:15px;flex-wrap:wrap}.ent-id{color:#cfe0ff}
.ent-sub{font-family:monospace;font-weight:400;font-size:11px;color:var(--dim)}
.ent-meta{font-family:system-ui,sans-serif;font-weight:400;font-size:11px;color:var(--dim);margin-left:auto}
.ent-ic{flex-shrink:0;display:inline-block}
.panel[data-sec="classes"] .ent-ic{width:13px;height:13px;border-radius:50%;background:#b87333}
.panel[data-sec="object_properties"] .ent-ic{width:13px;height:9px;border-radius:2px;background:#3b82f6}
.panel[data-sec="datatype_properties"] .ent-ic{width:13px;height:9px;border-radius:2px;background:#10b981}
.panel[data-sec="annotation_properties"] .ent-ic{width:13px;height:9px;border-radius:2px;background:#e8d400}
.panel[data-sec="individuals"] .ent-ic{width:10px;height:10px;border-radius:1px;background:#8b4db8;transform:rotate(45deg);margin:0 2px}
.panel[data-sec="swrl_rules"] .ent-ic::before{content:"⚙️";font-size:13px}
.ent-b{display:flex;flex-direction:column;gap:8px}
/* Cadres encadrés */
.cls-frame{border:1px solid var(--bd);border-radius:5px;overflow:hidden;background:var(--bg)}
.cls-frame-bar{display:flex;align-items:center;gap:6px;min-height:24px;padding:3px 10px;background:var(--bg3);border-bottom:1px solid var(--bd)}
.cls-frame-tag{font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--dim)}
.cls-frame-tag-blue{color:#7fa9e8}.cls-frame-tag-orange{color:#e0a96d}
.cls-frame-body{padding:5px 6px}
.cls-list-item{display:flex;align-items:center;gap:7px;padding:2px 6px;border-radius:4px;font-size:13px;font-family:monospace}
.cls-list-item:hover{background:var(--bg3)}
.cls-list-lbl{min-width:0;overflow:hidden;text-overflow:ellipsis}
.cls-list-item .rel{color:var(--dim);margin:0 4px}
.cls-anno-table{width:100%;border-collapse:collapse;font-size:12px}
.cls-anno-table td{padding:2px 8px;vertical-align:top;border-bottom:1px solid var(--bd)}
.cls-anno-table tr:last-child td{border-bottom:none}
.an-p{color:var(--dim);font-family:monospace;white-space:nowrap;width:1%}
.an-v{color:var(--tx)}
.lang{color:var(--dim);font-size:11px}.ext{color:var(--dim)}.ref{color:var(--acc);cursor:pointer}
/* Atomes SWRL en triple (un par ligne) */
.swrl-atom{display:flex;align-items:center;flex-wrap:wrap;gap:6px;font-family:monospace;font-size:13px;padding:3px 6px;border-radius:4px}
.swrl-atom:hover{background:var(--bg3)}
.swrl-var{color:#cfe0ff}
.swrl-kw{color:var(--dim);font-style:italic}
.swrl-op{color:var(--acc);font-weight:700}
.swrl-and{color:#e0a96d;font-weight:700;margin-left:2px}
.swrl-naf{color:#ef4444;font-weight:700;font-size:10px;letter-spacing:.1em}
.cls-frame-tag.swrl-if{color:#f59e0b}.cls-frame-tag.swrl-then{color:#10b981}
.cls-frame-tag-rule{color:var(--acc)}
.frame-cnt{font-size:10px;color:var(--dim);background:var(--bg3);border-radius:9px;padding:0 7px;margin-left:6px;font-weight:600}
.swrl-cond{display:flex;flex-direction:column;gap:4px;margin:4px 0;padding-left:8px;border-left:2px solid rgba(16,185,129,.4)}
.swrl-and-line{padding:0 6px}
.ent.hl{outline:2px solid var(--acc);outline-offset:2px}
/* Graphe D3 */
#net-svg .link{stroke-opacity:.7}
#net-svg .link-lbl{font-size:9px;fill:#64748b;pointer-events:none}
#net-svg .node text{font-size:11px;font-family:monospace;fill:#e2e8f0;pointer-events:none}
</style></head><body>
<header>
  <h1>🦉 SWOWL | ${title}</h1>
  ${onto.prefix ? `<span class="pfx">${esc(onto.prefix)}: ${esc(onto.id || '')}</span>` : `<span class="pfx">${esc(onto.id || '')}</span>`}
  <div class="search-wrap">
    <input id="q" type="search" placeholder="Recherche full-text (id, labels, contenu)…" autocomplete="off">
    <div id="results"></div>
  </div>
  <span id="count">${total} éléments</span>
  <span class="badge-ro">read-only export</span>
</header>
<nav class="tabs">${tabs}${networkTab}</nav>
<div class="panels">${panels || '<p style="color:var(--dim);padding:20px">Ontologie vide.</p>'}${networkPanel}</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></script>
<script>
var META=${JSON.stringify(META).replace(/</g, '\\u003c')};
var INDTYPES=${JSON.stringify(INDTYPES).replace(/</g, '\\u003c')};
var INDLABEL=${JSON.stringify(INDLABEL).replace(/</g, '\\u003c')};
var GNODES=${JSON.stringify(gNodes).replace(/</g, '\\u003c')};
var GEDGES=${JSON.stringify(gEdges).replace(/</g, '\\u003c')};
(function(){
  var ICON={classes:'<span class="ic ic-cls"></span>',object_properties:'<span class="ic ic-op"></span>',datatype_properties:'<span class="ic ic-dp"></span>',annotation_properties:'<span class="ic ic-ap"></span>',individuals:'<span class="ic ic-ind"></span>'};
  function enc(id){return 'e_'+String(id).replace(/[^a-zA-Z0-9_-]/g,'_');}
  function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
  function hlEl(el){if(el){el.classList.add('hl');setTimeout(function(){el.classList.remove('hl');},1600);}}

  var tabs=[].slice.call(document.querySelectorAll('.tab'));
  var panels=[].slice.call(document.querySelectorAll('.panel'));
  var panelOf={}; panels.forEach(function(p){panelOf[p.dataset.sec]=p;});
  var secTitle={};
  tabs.forEach(function(t){secTitle[t.dataset.sec]=t.textContent.replace(/\\s+/g,' ').replace(/\\s*\\d+\\s*$/,'').trim();});

  // ── Panneau « Super … » : chaîne de sur-classes / sur-propriétés ──
  function renderSuper(sec,rawId){
    var panel=panelOf[sec]; if(!panel)return; var body=panel.querySelector('.sp-body'); if(!body)return;
    var P=(META[sec]||{}).P||{}, L=(META[sec]||{}).L||{}, anc=[], seen={};
    (function climb(id,depth){(P[id]||[]).forEach(function(p){if(!seen[p]){seen[p]=1;anc.push({id:p,d:depth});climb(p,depth+1);}});})(rawId,0);
    body.innerHTML=anc.length?anc.map(function(a){return '<div class="sp-i" data-target="'+enc(a.id)+'" style="padding-left:'+(a.d*14+8)+'px">'+(ICON[sec]||'')+'<span class="tl">'+esc(L[a.id]||a.id)+'</span></div>';}).join(''):'<div class="ph2">—</div>';
  }
  // ── Sélection standard (classes / propriétés / règles) ──
  function selectIn(sec,anchor){
    var panel=panelOf[sec]; if(!panel)return null;
    panel.querySelectorAll('.tree .ti').forEach(function(t){t.classList.toggle('sel',t.dataset.target===anchor);});
    var found=null;
    panel.querySelectorAll('.detail .ent').forEach(function(e){var m=e.id===anchor;e.classList.toggle('sel',m);if(m)found=e;});
    var ph=panel.querySelector('.detail .placeholder'); if(ph)ph.style.display=found?'none':'';
    var sel=panel.querySelector('.tree .ti.sel'); if(sel)sel.scrollIntoView({block:'nearest'});
    if(META[sec])renderSuper(sec,sel?sel.dataset.id:(found?found.dataset.id:null));
    var d=panel.querySelector('.detail'); if(d)d.scrollTop=0;
    return found;
  }
  // ── Individuals : 3 colonnes (classes | individus | détail) ──
  var indP=panelOf['individuals'];
  function renderIndList(classId){
    if(!indP)return; var body=indP.querySelector('.il-body');
    var allIds=Object.keys(INDLABEL);
    var ids=classId?allIds.filter(function(id){return (INDTYPES[id]||[]).indexOf(classId)>=0;}):allIds;
    if(!ids.length&&classId)ids=allIds; // fallback : tous les individus si aucun ne match la classe
    ids.sort(function(a,b){return (INDLABEL[a]||a).localeCompare(INDLABEL[b]||b,undefined,{sensitivity:'base'});});
    body.innerHTML=ids.length?ids.map(function(id){return '<div class="ii" data-target="'+enc(id)+'"><span class="ic ic-ind"></span><span class="tl">'+esc(INDLABEL[id]||id)+'</span></div>';}).join(''):'<div class="ph2">Aucun individu.</div>';
  }
  function setIndClass(classId){
    if(!indP)return; indP.querySelectorAll('.tree .ti').forEach(function(t){t.classList.toggle('sel',t.dataset.id===classId);});
    renderIndList(classId);
  }
  function showInd(anchor){
    if(!indP)return null;
    indP.querySelectorAll('.il-body .ii').forEach(function(i){i.classList.toggle('sel',i.dataset.target===anchor);});
    var found=null; indP.querySelectorAll('.detail .ent').forEach(function(e){var m=e.id===anchor;e.classList.toggle('sel',m);if(m)found=e;});
    var ph=indP.querySelector('.detail .placeholder'); if(ph)ph.style.display=found?'none':'';
    var d=indP.querySelector('.detail'); if(d)d.scrollTop=0;
    return found;
  }
  function selectIndividual(anchor){
    var el=document.getElementById(anchor), indId=el?el.dataset.id:null;
    var cur=indP?indP.querySelector('.tree .ti.sel'):null;
    var cls=(cur&&indId&&INDTYPES[indId]&&INDTYPES[indId].indexOf(cur.dataset.id)>=0)?cur.dataset.id:(indId&&INDTYPES[indId]?INDTYPES[indId][0]:null);
    if(cls!=null)setIndClass(cls);
    return showInd(anchor);
  }
  var indInited=false;
  function ensureIndInit(){
    if(indInited||!indP)return; indInited=true;
    renderIndList(null); // tous les individus par défaut
    var fi=indP.querySelector('.il-body .ii'); if(fi)showInd(fi.dataset.target);
  }
  // ── Activation d'onglet ──
  function activate(sec){
    tabs.forEach(function(t){t.classList.toggle('active',t.dataset.sec===sec);});
    panels.forEach(function(p){p.style.display=p.dataset.sec===sec?'block':'none';});
    if(sec==='__network__'){initNetwork();return;}
    var panel=panelOf[sec]; if(!panel)return;
    if(sec==='individuals'){ensureIndInit();return;}
    if(!panel.querySelector('.tree .ti.sel')){var first=panel.querySelector('.tree .ti');if(first)selectIn(sec,first.dataset.target);}
  }
  tabs.forEach(function(t){t.addEventListener('click',function(){activate(t.dataset.sec);});});
  panels.forEach(function(p){
    var sec=p.dataset.sec;
    if(sec==='__network__')return;
    if(sec==='individuals'){
      var ct=p.querySelector('.tree'); if(ct)ct.addEventListener('click',function(ev){var t=ev.target.closest('.ti');if(!t)return;setIndClass(t.dataset.id);var fi=p.querySelector('.il-body .ii');showInd(fi?fi.dataset.target:null);});
      var lb=p.querySelector('.il-body'); if(lb)lb.addEventListener('click',function(ev){var i=ev.target.closest('.ii');if(i)showInd(i.dataset.target);});
    }else{
      var tr=p.querySelector('.tree'); if(tr)tr.addEventListener('click',function(ev){var t=ev.target.closest('.ti');if(t)selectIn(sec,t.dataset.target);});
      var sp=p.querySelector('.sp-body'); if(sp)sp.addEventListener('click',function(ev){var s=ev.target.closest('.sp-i');if(s)selectIn(sec,s.dataset.target);});
    }
  });

  // ── Recherche full-text (index depuis le DOM) ──
  var IDX=[];
  panels.forEach(function(p){if(p.dataset.sec==='__network__')return;[].slice.call(p.querySelectorAll('.detail .ent')).forEach(function(e){
    var lbl=(e.querySelector('.ent-id')||{}).textContent||e.id;
    IDX.push({a:e.id,sec:p.dataset.sec,l:lbl,t:e.dataset.s||''});
  });});
  var q=document.getElementById('q'), box=document.getElementById('results');
  function close(){box.style.display='none';box.innerHTML='';}
  function goTo(a,sec){activate(sec);var el=sec==='individuals'?selectIndividual(a):selectIn(sec,a);hlEl(el);}
  q.addEventListener('input',function(){
    var v=q.value.trim().toLowerCase();
    if(!v){close();return;}
    var m=IDX.filter(function(x){return x.l.toLowerCase().indexOf(v)>=0;}), top=m.slice(0,100);
    box.innerHTML=top.length
      ? top.map(function(x){return '<div class="res" data-a="'+x.a+'" data-sec="'+x.sec+'"><span class="rl">'+esc(x.l)+'</span><span class="rs">'+esc(secTitle[x.sec]||'')+'</span></div>';}).join('')
        + (m.length>top.length?'<div class="res empty">… '+(m.length-top.length)+' de plus</div>':'')
      : '<div class="res empty">Aucun résultat</div>';
    box.style.display='block';
  });
  box.addEventListener('mousedown',function(ev){var r=ev.target.closest('.res[data-a]');if(!r)return;ev.preventDefault();goTo(r.dataset.a,r.dataset.sec);close();q.blur();});
  q.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  q.addEventListener('blur',function(){setTimeout(close,150);});

  // ── Liens internes (#ancre) → bon onglet + sélection ──
  function hl(){var id=location.hash.slice(1);if(!id)return;var el=document.getElementById(id);if(!el)return;var p=el.closest('.panel');if(!p)return;goTo(id,p.dataset.sec);}
  window.addEventListener('hashchange',hl);
  if(tabs.length)activate(tabs[0].dataset.sec);
  hl();

  // ── Graphe D3 force-directed ──
  var netInited=false;
  var NODE_SEC={cls:'classes',op:'object_properties',dp:'datatype_properties',ind:'individuals'};
  var NODE_CLR={cls:'#b87333',op:'#3b82f6',dp:'#10b981',ind:'#8b4db8'};
  var EDGE_CLR={sub:'#6b7280',dom:'#60a5fa',rng:'#34d399',type:'#a78bfa',oa:'#e2d9c0'};
  function initNetwork(){
    if(netInited)return; netInited=true;
    var svg=d3.select('#net-svg');
    var w=document.getElementById('net-wrap').clientWidth||800;
    var h=document.getElementById('net-wrap').clientHeight||600;
    // Marqueurs de flèches
    var defs=svg.append('defs');
    Object.keys(EDGE_CLR).forEach(function(k){
      defs.append('marker').attr('id','arr-'+k).attr('viewBox','0 -4 8 8').attr('refX',18).attr('refY',0)
        .attr('markerWidth',6).attr('markerHeight',6).attr('orient','auto')
        .append('path').attr('d','M0,-4L8,0L0,4').attr('fill',EDGE_CLR[k]).attr('opacity',.8);
    });
    var g=svg.append('g');
    // Zoom/pan
    var zoom=d3.zoom().scaleExtent([0.05,4]).on('zoom',function(ev){g.attr('transform',ev.transform);});
    svg.call(zoom);
    // Données
    var nodes=GNODES.map(function(n){return Object.assign({},n);});
    var idIdx={}; nodes.forEach(function(n,i){idIdx[n.id]=i;});
    var links=GEDGES.map(function(e){return {source:e.s,target:e.t,lbl:e.lbl,k:e.k};}).filter(function(e){return idIdx[e.source]!==undefined&&idIdx[e.target]!==undefined;});
    // Simulation
    var sim=d3.forceSimulation(nodes)
      .force('link',d3.forceLink(links).id(function(d){return d.id;}).distance(100))
      .force('charge',d3.forceManyBody().strength(-220))
      .force('center',d3.forceCenter(w/2,h/2))
      .force('collide',d3.forceCollide(28));
    // Arêtes
    var link=g.append('g').selectAll('line').data(links).join('line')
      .attr('class','link')
      .attr('stroke',function(d){return EDGE_CLR[d.k]||'#4b5a6e';})
      .attr('stroke-width',1.5)
      .attr('marker-end',function(d){return 'url(#arr-'+d.k+')';});
    // Labels arêtes
    var linkLbl=g.append('g').selectAll('text').data(links).join('text')
      .attr('class','link-lbl').text(function(d){return d.lbl;});
    // Nœuds
    var node=g.append('g').selectAll('g').data(nodes).join('g').attr('class','node').style('cursor','pointer');
    node.each(function(d){
      var el=d3.select(this);
      if(d.type==='cls'){el.append('circle').attr('r',10).attr('fill',NODE_CLR[d.type]).attr('stroke','#0e1219').attr('stroke-width',1.5);}
      else if(d.type==='ind'){el.append('rect').attr('x',-8).attr('y',-8).attr('width',16).attr('height',16).attr('fill',NODE_CLR[d.type]).attr('stroke','#0e1219').attr('stroke-width',1.5).attr('transform','rotate(45)');}
      else{el.append('rect').attr('x',-14).attr('y',-7).attr('width',28).attr('height',14).attr('rx',3).attr('fill',NODE_CLR[d.type]).attr('stroke','#0e1219').attr('stroke-width',1.5);}
      el.append('text').attr('dy',22).attr('text-anchor','middle').text(d.lbl.length>18?d.lbl.slice(0,16)+'…':d.lbl);
    });
    // Drag
    node.call(d3.drag()
      .on('start',function(ev,d){if(!ev.active)sim.alphaTarget(.3).restart();d.fx=d.x;d.fy=d.y;})
      .on('drag',function(ev,d){d.fx=ev.x;d.fy=ev.y;})
      .on('end',function(ev,d){if(!ev.active)sim.alphaTarget(0);d.fx=null;d.fy=null;}));
    // Tooltip
    var tip=document.getElementById('net-tooltip');
    node.on('mouseover',function(ev,d){
      tip.innerHTML='<b>'+d.lbl+'</b><br><span style="color:#64748b">'+d.type+'</span>';
      tip.style.display='';
    }).on('mousemove',function(ev){
      var rect=document.getElementById('net-wrap').getBoundingClientRect();
      tip.style.left=(ev.clientX-rect.left+14)+'px'; tip.style.top=(ev.clientY-rect.top-10)+'px';
    }).on('mouseout',function(){tip.style.display='none';});
    // Clic → goTo
    node.on('click',function(ev,d){
      ev.stopPropagation();
      var sec=NODE_SEC[d.type]; if(!sec)return;
      var anchor=enc(d.id);
      goTo(anchor,sec);
    });
    // Tick
    sim.on('tick',function(){
      link.attr('x1',function(d){return d.source.x;}).attr('y1',function(d){return d.source.y;})
          .attr('x2',function(d){return d.target.x;}).attr('y2',function(d){return d.target.y;});
      linkLbl.attr('x',function(d){return (d.source.x+d.target.x)/2;}).attr('y',function(d){return (d.source.y+d.target.y)/2;});
      node.attr('transform',function(d){return 'translate('+d.x+','+d.y+')';});
    });
    // Bouton Fit
    document.getElementById('net-fit').addEventListener('click',function(){
      var bounds=g.node().getBBox();
      if(!bounds.width||!bounds.height)return;
      var pw=document.getElementById('net-wrap').clientWidth, ph2=document.getElementById('net-wrap').clientHeight;
      var scale=0.85/Math.max(bounds.width/pw,bounds.height/ph2);
      var tx=pw/2-(bounds.x+bounds.width/2)*scale, ty=ph2/2-(bounds.y+bounds.height/2)*scale;
      svg.transition().duration(500).call(zoom.transform,d3.zoomIdentity.translate(tx,ty).scale(scale));
    });
  }
})();
</script>
</body></html>`;

        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${name}.html`; a.click();
        URL.revokeObjectURL(url);
        UI.success(`Export HTML : ${total} éléments générés.`);
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

    success(msg) { this._toast(msg, 'success', 4000); },
    error(msg)   { this._toast(msg, 'error',   null);  },  // erreur : persistante jusqu'au ✕
    warn(msg)    { this._toast(msg, 'warn',    5000);  },

    _toast(msg, type, duration) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            document.body.appendChild(toast);
        }
        toast.className = `toast toast-${type}`;
        toast.style.display = 'flex';
        toast.style.alignItems = 'flex-start';
        toast.style.gap = '10px';
        const text = document.createElement('span');
        text.style.flex = '1';
        text.textContent = msg;
        const close = document.createElement('button');
        close.textContent = '✕';
        close.style.cssText = 'background:none;border:none;cursor:pointer;color:inherit;font-size:14px;padding:0;line-height:1;flex-shrink:0;opacity:.8';
        close.onclick = () => { toast.style.display = 'none'; clearTimeout(this._toastTimeout); };
        toast.innerHTML = '';
        toast.appendChild(text);
        toast.appendChild(close);
        clearTimeout(this._toastTimeout);
        if (duration) {
            this._toastTimeout = setTimeout(() => { toast.style.display = 'none'; }, duration);
        }
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

    // Délégation de clic pour les liens internes (domain/range/used-in-rules)
    document.getElementById('main-content').addEventListener('click', e => {
        const a = e.target.closest('a[data-nav-sec]');
        if (!a) return;
        e.preventDefault();
        APP.navigateTo(a.dataset.navSec, a.dataset.navId);
    });
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
                IndividualEditor.focusIndividual(snap.entityId, false);
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
    const active = document.activeElement;
    const inInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
    // Input is in a detail/form panel if it has a closest ancestor with id ending in "-detail".
    // Such inputs get focus programmatically (e.g. swrl-id auto-focused on rule selection),
    // so Cmd+A should still select all list items rather than text in the input.
    const inDetailPanel = inInput && !!active.closest('[id$="-detail"]');

    // Ctrl+A — select all items in the current list
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        if (!inInput || inDetailPanel) {
            e.preventDefault();
            APP._selectAllInSection();
        }
    }

    // ArrowUp / ArrowDown — navigate list items.
    // Allowed when no input is focused, OR when a single-line <input> of a detail
    // panel is focused (e.g. swrl-id auto-focused on rule selection): such inputs
    // are focused programmatically, so arrows should still navigate the list.
    // Multi-line <textarea> keeps its native line-by-line behaviour.
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown')
        && (!inInput || (inDetailPanel && active.tagName === 'INPUT'))) {
        e.preventDefault();
        APP._arrowNavSection(e.key === 'ArrowDown' ? 1 : -1);
    }

    if (!UndoRedo._VALID.has(APP.currentSection)) return;
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault(); UndoRedo.undo();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault(); UndoRedo.redo();
    }
});

APP._arrowNavSection = function (dir) {
    const section = this.currentSection;

    // Config par onglet : { treeId, currentId(), select(id) }
    // Pour Individuals : deux sous-listes (arbre classes + liste individus)
    const configs = {
        'classes':               [{ treeId: 'class-tree',     currentId: () => ClassEditor._selectedId,        select: id => ClassEditor.selectClass(id) }],
        'object-properties':     [{ treeId: 'op-tree',        currentId: () => OPEditor._selectedId,           select: id => OPEditor.selectProp(id) }],
        'datatype-properties':   [{ treeId: 'dp-tree',        currentId: () => DPEditor._selectedId,           select: id => DPEditor.selectProp(id) }],
        'annotation-properties': [{ treeId: 'ap-tree',        currentId: () => APEditor._selectedId,           select: id => APEditor.selectProp(id) }],
        'swrl-rules':            [{ treeId: 'swrl-list',      currentId: () => SWRLEditor._selectedId,         select: id => SWRLEditor.selectRule(id) }],
        'queries':               [{ treeId: 'sparql-list',    currentId: () => typeof SparqlEditor !== 'undefined' ? SparqlEditor._selectedId : null, select: id => SparqlEditor.selectQuery(id) }],
        'vizq':                  [{ treeId: 'sparql-list',    currentId: () => typeof SparqlEditor !== 'undefined' ? SparqlEditor._selectedId : null, select: id => SparqlEditor.selectQuery(id) }],
        'individuals': [
            { treeId: 'ind-class-tree', currentId: () => IndividualEditor._selectedClassId, select: id => IndividualEditor.selectClass(id) },
            { treeId: 'ind-list-scroll', currentId: () => IndividualEditor._selectedIndId,  select: id => IndividualEditor.selectIndividual(id) },
        ],
    };

    const list = configs[section];
    if (!list) return;

    // Pour individuals : priorité à la liste des individus si un individu est sélectionné,
    // sinon naviguer dans l'arbre des classes.
    let cfg;
    if (list.length > 1) {
        cfg = list.find(c => c.currentId() !== null && c.treeId === 'ind-list-scroll')
           || list.find(c => c.currentId() !== null)
           || list[list.length - 1];
    } else {
        cfg = list[0];
    }

    const items = [...document.querySelectorAll(`#${cfg.treeId} .tree-item[data-id]`)];
    if (!items.length) return;
    const ids = items.map(el => el.dataset.id);
    const cur = cfg.currentId();
    const curIdx = cur ? ids.indexOf(cur) : -1;
    let nextIdx;
    if (curIdx === -1) {
        nextIdx = dir > 0 ? 0 : ids.length - 1;
    } else {
        nextIdx = curIdx + dir;
        if (nextIdx < 0) nextIdx = 0;
        if (nextIdx >= ids.length) nextIdx = ids.length - 1;
    }
    if (nextIdx === curIdx) return;
    cfg.select(ids[nextIdx]);
    // scroll the item into view
    items[nextIdx]?.scrollIntoView({ block: 'nearest' });
};

APP._selectAllInSection = function () {
    const section = this.currentSection;

    const _selectInTree = (ed, treeId, detailId, label) => {
        const items = [...document.querySelectorAll(`#${treeId} .tree-item[data-id]`)];
        if (!items.length) return;
        const ids = items.map(el => el.dataset.id);
        ed._selectedIds = new Set(ids);
        items.forEach(el => el.classList.add('selected'));
        const detail = document.getElementById(detailId);
        if (detail && ids.length > 1) {
            detail.innerHTML = `<div class="detail-panel-empty"><span><strong>${ids.length}</strong> ${label} selected</span></div>`;
        }
        if (ed._updateTreeButtons) ed._updateTreeButtons();
        if (ed._updateToolbar)   ed._updateToolbar();
    };

    switch (section) {
        case 'classes':
            _selectInTree(ClassEditor, 'class-tree', 'class-detail', 'classes');
            break;
        case 'object-properties':
            _selectInTree(OPEditor, 'op-tree', 'op-detail', 'object properties');
            break;
        case 'datatype-properties':
            _selectInTree(DPEditor, 'dp-tree', 'dp-detail', 'datatype properties');
            break;
        case 'annotation-properties':
            _selectInTree(APEditor, 'ap-tree', 'ap-detail', 'annotation properties');
            break;
        case 'individuals': {
            const items = [...document.querySelectorAll('#ind-list-scroll .tree-item[data-id]')];
            if (!items.length) return;
            const ids = items.map(el => el.dataset.id);
            IndividualEditor._selectedIndIds = new Set(ids);
            IndividualEditor._editingId = null;
            items.forEach(el => el.classList.add('selected'));
            IndividualEditor._setDelBtn(ids.length > 0);
            const detail = document.getElementById('ind-detail');
            if (detail && ids.length > 1) {
                detail.innerHTML = `<div class="detail-panel-empty"><span style="font-size:28px">◆◆</span><span><strong>${ids.length}</strong> individuals selected</span></div>`;
            }
            break;
        }
        case 'swrl-rules':
            _selectInTree(SWRLEditor, 'swrl-list', 'swrl-detail', 'rules');
            if (SWRLEditor._renderMultiSelDetail) SWRLEditor._renderMultiSelDetail();
            break;
        case 'queries':
        case 'vizq':
            if (typeof SparqlEditor !== 'undefined') {
                _selectInTree(SparqlEditor, 'sparql-list', 'sparql-detail', 'queries');
                if (SparqlEditor._renderMultiSelDetail) SparqlEditor._renderMultiSelDetail();
            }
            break;
    }
};

// ── Global Search ─────────────────────────────────────────────

const GlobalSearch = {
    _query:     '',
    _focusIdx:  -1,
    _blurTimer: null,
    _items:     [],   // flat list of {section, id, label, sub, dot}

    _dot(type) {
        if (type === 'swrl-rules')  return `<span style="flex-shrink:0;font-size:11px">⚙️</span>`;
        if (type === 'sparql-vizq') return `<span style="flex-shrink:0;font-size:11px">🔎</span>`;
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
        // disp = forme préfixée de l'entité SPÉCIFIQUE (gère les homonymes propre/importé,
        // ex. deux ObjectProperties « about ») via _displayId(entity).
        (s.classes               || []).forEach(c => { if (_idMatch(c)) results.push({ section: 'classes',               id: c.id, label: c.id, disp: _displayId(c), imported: !!c._imported }); });
        (s.object_properties     || []).forEach(p => { if (_idMatch(p)) results.push({ section: 'object-properties',     id: p.id, label: p.id, disp: _displayId(p), imported: !!p._imported }); });
        (s.datatype_properties   || []).forEach(p => { if (_idMatch(p)) results.push({ section: 'datatype-properties',   id: p.id, label: p.id, disp: _displayId(p), imported: !!p._imported }); });
        (s.annotation_properties || []).forEach(p => { if (_idMatch(p)) results.push({ section: 'annotation-properties', id: p.id, label: p.id, disp: _displayId(p), imported: !!p._imported }); });
        (s.individuals           || []).forEach(i => { if (_idMatch(i)) results.push({ section: 'individuals',           id: i.id, label: i.id, disp: _displayId(i), imported: !!i._imported }); });
        (s.swrl_rules            || []).forEach(r => { if (_idMatch(r)) results.push({ section: 'swrl-rules',            id: r.id, label: r.id, disp: _displayId(r), imported: !!r._imported }); });
        sparqlQueries.forEach(sq => {
            if ((sq.id || '').toLowerCase().includes(lq))
                results.push({ section: 'sparql-vizq', id: sq.id, label: sq.id, disp: _displayId(sq), imported: !!sq._imported });
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
            'sparql-vizq':          'Queries',
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
                            <span class="gs-item-sub">${_escapeHtml(r.disp || _displayRefId(r.id))}</span>`;
                        break;
                    case 'swrl-labels':
                        inner = `<span style="flex-shrink:0;font-size:11px">⚙️</span>
                            <span class="gs-item-label">${_escapeHtml(r.label)}</span>
                            <span class="gs-item-sub">${_escapeHtml(r.disp || _displayRefId(r.id))}</span>`;
                        break;
                    case 'sparql-labels':
                        inner = `<span style="flex-shrink:0;font-size:11px">🔎</span>
                            <span class="gs-item-label">${_escapeHtml(r.label)}</span>
                            <span class="gs-item-sub">${_escapeHtml(r.disp || _displayRefId(r.id))}</span>`;
                        break;
                    case 'individual-names':
                        inner = `<span class="xsd-dot" style="flex-shrink:0;margin:0"></span>
                            <span class="gs-item-label">${_escapeHtml(r.label)}</span>
                            <span class="gs-item-sub">${_escapeHtml(r.disp || _displayRefId(r.id))}</span>`;
                        break;
                    default:
                        inner = `${this._dot(sec)}
                            <span class="gs-item-label">${_escapeHtml(r.disp || _displayRefId(r.id))}</span>`;
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
                if (found) { SparqlEditor._pendingImported = item.imported; SparqlEditor.selectQuery(item.id); }
            }
            APP.renderSection('queries');
            return;
        }
        APP.navigateTo(navSection, item.id, { imported: item.imported });
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
    // Les requêtes sont affichées directement dans l'onglet « Queries »
    // (l'ancienne sous-barre « SPARQL VizQ » a été supprimée).
    return `
    <div style="height:100%;display:flex;overflow:hidden">
        <div style="flex:1;overflow:hidden;display:flex;flex-direction:column;min-height:0">
            ${SparqlEditor.renderSplit()}
        </div>
    </div>`;
};

// ── Views UI ──────────────────────────────────────────────────

APP._viewsTab = APP._viewsTab || 'ontology2';
APP._viewsSidebarW = APP._viewsSidebarW || 210;   // largeur (px) de la sidebar Views, redimensionnable

/** Démarre le glisser-redimensionner de la sidebar Views. */
APP._viewsSidebarDragStart = function(e) {
    e.preventDefault();
    const bar = document.getElementById('views-sidebar');
    if (!bar) return;
    const startX = e.clientX, startW = bar.offsetWidth;
    const onMove = ev => {
        const w = Math.max(140, Math.min(440, startW + (ev.clientX - startX)));
        bar.style.width = w + 'px';
        APP._viewsSidebarW = w;
    };
    const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.body.style.userSelect = '';
        // Réajuste la visualisation active à la nouvelle largeur
        const t = APP._viewsTab;
        if (t === 'treemap')                  APP._initTreemap();
        else if (t === 'ontology2')           APP._initOntology2();
        else if (t === 'ontology-network')    APP._initOntologyNetwork();
        else if (t === 'knowledge-base')      APP._initKnowledgeBase();
    };
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
};

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
        <div id="views-sidebar" style="width:${APP._viewsSidebarW}px;flex-shrink:0;border-right:1px solid var(--border);padding:8px 0;overflow-x:hidden">
            ${tabBtn('ontology2',        '🌐 Ontology (Hyperbolic)')}
            ${tabBtn('treemap',          '🌐 Ontology (TreeMap)')}
            ${tabBtn('ontology-network', '🌐 Ontology (Network)')}
            ${tabBtn('knowledge-base',   '🧩 Knowledge Base')}
        </div>
        <div id="views-sidebar-resizer" onmousedown="APP._viewsSidebarDragStart(event)"
             title="Glisser pour redimensionner"
             style="width:5px;flex-shrink:0;cursor:col-resize;background:transparent;transition:background .12s"
             onmouseenter="this.style.background='var(--accent)'" onmouseleave="this.style.background='transparent'"></div>`;

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
    } else if (tab === 'ontology-network') {
        tabContent = `
        <div style="display:flex;flex-direction:column;height:100%">
            <div style="display:flex;align-items:center;gap:8px;padding:8px 14px;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--bg2)">
                <button class="btn-sm" onclick="APP._initOntologyNetwork()" title="Relancer la disposition">⟳ Restart</button>
                <span style="font-size:10px;color:var(--text-dim);margin-left:8px">
                    subClassOf (hiérarchie) · ObjectProperties (domain → range) · clic → éditer la classe
                </span>
                <span id="onet-legend" style="display:flex;align-items:center;gap:10px;margin-left:12px;font-size:11px"></span>
                <span id="onet-count" style="margin-left:auto;font-size:11px;color:var(--text-dim)"></span>
            </div>
            <div id="cy-onetwork" style="flex:1;min-height:0;background:#0e1219;overflow:hidden;position:relative"></div>
        </div>`;
    } else if (tab === 'ontology2') {
        tabContent = `
        <div style="display:flex;flex-direction:column;height:100%">
            <div style="display:flex;align-items:center;gap:8px;padding:8px 14px;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--bg2)">
                <span style="font-size:11px;color:var(--text-dim);font-family:var(--font-mono)">Disque de Poincaré · hyperbolique</span>
                <span style="font-size:10px;color:var(--text-dim);margin-left:8px">Glisser → déplacer · Clic nœud → recentrer · Double-clic → éditer · Survol → sous-branche</span>
                <span id="cy-ontology2-count" style="margin-left:auto;font-size:11px;color:var(--text-dim)"></span>
            </div>
            <div id="cy-ontology2" style="flex:1;min-height:0;background:#12161f;overflow:hidden;position:relative"></div>
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

// ── Libellé d'affichage d'une classe (utilisé par TreeMap & Ontology Hyperbolic) ──
APP._hypBestLabel = function(cls) {
    // Préfixe d'affichage cohérent avec la vue Network (préfixe d'import / d'ontologie).
    return cls && cls.id ? _displayRefId(cls.id) : '';
};

// ── Ontology (Hyperbolic) — disque de Poincaré maison (canvas + Möbius) ───────

APP._onto2Resize = null;   // handler resize courant (disque de Poincaré)
APP._onto2Tap    = null;   // timer tap (distingue clic/double-clic)

/** Construit l'arbre de données {name, id, children}
 *  à partir de APP.state.classes (hiérarchie subClassOf, racine owl:Thing). */
APP._buildOntologyTreeData = function() {
    const classes = APP.state.classes || [];
    const classMap = {};
    classes.forEach(c => { classMap[c.id] = c; });
    const allIds = new Set(classes.map(c => c.id));
    const childrenOf = {};
    const hasInternalParent = new Set();
    classes.forEach(cls => {
        (cls.subClassOf || []).filter(s => typeof s === 'string' && allIds.has(s)).forEach(p => {
            hasInternalParent.add(cls.id);
            (childrenOf[p] = childrenOf[p] || []).push(cls.id);
        });
    });
    const roots = classes.filter(c => !hasInternalParent.has(c.id)).map(c => c.id);

    let count = 0;
    const buildNode = (id, ancestors) => {
        if (!classMap[id] || ancestors.has(id)) return null;   // anti-cycle
        const next = new Set(ancestors); next.add(id);
        count++;
        const kids = (childrenOf[id] || []).map(cid => buildNode(cid, next)).filter(Boolean);
        const node = { name: APP._hypBestLabel(classMap[id]), id };
        if (kids.length) node.children = kids;
        return node;
    };
    const tree = { name: 'owl:Thing', id: 'owl:Thing',
        children: roots.map(r => buildNode(r, new Set())).filter(Boolean) };
    count++; // owl:Thing
    return { tree, count };
};

APP._initOntology2 = function() {
    const container = document.getElementById('cy-ontology2');
    if (!container || APP._viewsTab !== 'ontology2') return;

    if (APP._onto2Resize) { window.removeEventListener('resize', APP._onto2Resize); APP._onto2Resize = null; }
    if (APP._onto2Tap) { clearTimeout(APP._onto2Tap); APP._onto2Tap = null; }
    container.innerHTML = '';

    const classes = APP.state.classes || [];
    if (!classes.length) {
        container.innerHTML = '<p style="padding:24px;color:var(--text-dim);font-style:italic">Aucune classe dans cette ontologie.</p>';
        return;
    }

    const { tree, count } = APP._buildOntologyTreeData();
    const cntEl = document.getElementById('cy-ontology2-count');
    if (cntEl) cntEl.textContent = count + ' classes';

    if (container.offsetHeight < 20) container.style.height = (window.innerHeight - 170) + 'px';

    const cv = document.createElement('canvas');
    cv.style.cssText = 'width:100%;height:100%;display:block;cursor:grab';
    container.appendChild(cv);
    const ctx = cv.getContext('2d');
    const DPR = window.devicePixelRatio || 1;
    let W, H, R, CX, CY;
    const fit = () => {
        const w = container.clientWidth, h = container.clientHeight;
        cv.width = w * DPR; cv.height = h * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        W = w; H = h; R = Math.min(w, h) * 0.46; CX = w / 2; CY = h / 2;
    };

    // ── Nombres complexes / Möbius ────────────────────────────
    const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
    const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
    const cconj = a => [a[0], -a[1]];
    const cdiv = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
    const polar = (r, t) => [r * Math.cos(t), r * Math.sin(t)];
    const mob = (z, a) => cdiv(cadd(z, a), cadd([1, 0], cmul(cconj(a), z)));
    const cabs = a => Math.hypot(a[0], a[1]);

    // ── Layout hyperbolique ───────────────────────────────────
    const palette = ['#7F77DD', '#1D9E75', '#D85A30', '#378ADD', '#D4537E', '#EF9F27', '#5DCAA5', '#F0997B'];
    const nodes = [];
    const STEP = Math.tanh(0.36);
    (function layout(n, pos, ang, wedge, depth, color, parent) {
        n.disp = pos.slice(); n.depth = depth; n.color = color; n.parent = parent;
        nodes.push(n);
        const ch = n.children || []; if (!ch.length) return;
        const w = Math.min(2 * Math.PI / Math.max(1, ch.length), wedge);
        const start = ang - (w * ch.length) / 2;
        ch.forEach((c, i) => {
            const a = start + (i + 0.5) * w;
            const col = depth === 0 ? palette[i % palette.length] : color;
            layout(c, mob(polar(STEP, a), pos), a, w * 0.86, depth + 1, col, n);
        });
    })(tree, [0, 0], -Math.PI / 2, 2 * Math.PI, 0, '#9aa6bd', null);

    const applyT = delta => { for (let i = 0; i < nodes.length; i++) nodes[i].disp = mob(nodes[i].disp, delta); };
    const descendants = n => { const s = new Set(); (function w(x){ s.add(x); (x.children || []).forEach(w); })(n); return s; };
    let hoverSet = null;

    const S = p => [CX + p[0] * R, CY + p[1] * R];
    const draw = () => {
        ctx.clearRect(0, 0, W, H);
        ctx.beginPath(); ctx.arc(CX, CY, R, 0, 2 * Math.PI);
        ctx.fillStyle = '#0e1219'; ctx.fill();
        ctx.strokeStyle = '#2a3347'; ctx.lineWidth = 1; ctx.stroke();
        [0.82, 0.6, 0.33].forEach(f => { ctx.beginPath(); ctx.arc(CX, CY, R * f, 0, 2 * Math.PI); ctx.strokeStyle = 'rgba(40,50,70,0.6)'; ctx.lineWidth = 0.5; ctx.stroke(); });
        // arêtes (géodésiques approchées)
        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i]; if (!n.parent) continue;
            const a = S(n.parent.disp), b = S(n.disp);
            const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
            const cxp = mx + (CX - mx) * 0.18, cyp = my + (CY - my) * 0.18;
            const dim = hoverSet && !hoverSet.has(n) ? 0.18 : 1;
            ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(cxp, cyp, b[0], b[1]);
            ctx.strokeStyle = n.color; ctx.globalAlpha = Math.max(0.12, 0.85 - cabs(n.disp) * 0.8) * dim;
            ctx.lineWidth = 1.3; ctx.stroke(); ctx.globalAlpha = 1;
        }
        // nœuds
        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i]; const p = S(n.disp); const sc = 1 - cabs(n.disp) * cabs(n.disp);
            const rad = Math.max(2.2, (n.depth === 0 ? 9 : n.depth === 1 ? 7 : 5) * sc + 1.5);
            const dim = hoverSet && !hoverSet.has(n) ? 0.22 : 1;
            ctx.globalAlpha = dim;
            ctx.beginPath(); ctx.arc(p[0], p[1], rad, 0, 2 * Math.PI);
            ctx.fillStyle = n.depth === 0 ? '#cdd6e6' : n.color; ctx.fill();
            ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.stroke();
            ctx.globalAlpha = 1;
            n._sr = rad; n._sx = p[0]; n._sy = p[1];
            if (cabs(n.disp) < 0.55 && sc > 0.32) {
                ctx.globalAlpha = Math.min(1, sc * 1.6) * dim;
                ctx.fillStyle = '#e2e8f0'; ctx.font = '11px sans-serif'; ctx.textBaseline = 'middle';
                ctx.fillText(n.name, p[0] + rad + 3, p[1]); ctx.globalAlpha = 1;
            }
        }
    };

    // ── Recentrage animé (glide) ──────────────────────────────
    let anim = null;
    const glide = target => {
        if (anim) cancelAnimationFrame(anim);
        let i = 0;
        (function step() {
            i++; applyT([-target.disp[0] * 0.16, -target.disp[1] * 0.16]); draw();
            if (i < 24 && cabs(target.disp) > 0.004) anim = requestAnimationFrame(step);
        })();
    };

    const pt = e => {
        const r = cv.getBoundingClientRect();
        let x = (e.clientX - r.left - CX) / R, y = (e.clientY - r.top - CY) / R;
        const d = Math.hypot(x, y); if (d > 0.98) { x = x / d * 0.98; y = y / d * 0.98; }
        return [x, y];
    };
    const nodeAt = e => {
        const r = cv.getBoundingClientRect();
        const mx = e.clientX - r.left, my = e.clientY - r.top;
        let best = null, bd = 14;
        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i], dd = Math.hypot(mx - n._sx, my - n._sy);
            if (dd < Math.max(bd, n._sr + 5) && dd < bd) { bd = dd; best = n; }
        }
        return best;
    };

    let dragging = false, last = null, moved = 0;
    cv.addEventListener('pointerdown', e => { dragging = true; moved = 0; last = pt(e); cv.style.cursor = 'grabbing'; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => {
        if (dragging) { const p = pt(e); applyT([p[0] - last[0], p[1] - last[1]]); last = p; moved += 1; draw(); return; }
        const n = nodeAt(e); const set = n && n.depth > 0 ? descendants(n) : null;
        if (set !== hoverSet) { hoverSet = set; cv.style.cursor = n ? 'pointer' : 'grab'; draw(); }
    });
    cv.addEventListener('pointerup', e => {
        dragging = false; cv.style.cursor = 'grab';
        if (moved < 3) {
            const n = nodeAt(e);
            if (n) { if (APP._onto2Tap) clearTimeout(APP._onto2Tap); APP._onto2Tap = setTimeout(() => glide(n), 230); }
        }
    });
    cv.addEventListener('dblclick', e => {
        if (APP._onto2Tap) { clearTimeout(APP._onto2Tap); APP._onto2Tap = null; }
        const n = nodeAt(e);
        if (n && n.id && n.id !== 'owl:Thing') APP.navigateTo('classes', n.id);
    });

    APP._onto2Resize = () => { fit(); draw(); };
    window.addEventListener('resize', APP._onto2Resize);
    fit(); draw();
};

// ── Treemap (D3 v7) ──────────────────────────────────────────

APP._tmRoot       = null;   // d3.hierarchy root complet
APP._tmCurrent    = null;   // nœud courant affiché (drill-down)
APP._tmSvg        = null;   // sélection SVG D3
APP._tmW          = 0;
APP._tmH          = 0;

// Palette vibrante par branche racine (fond sombre)
APP._tmPalette = [
    '#534AB7','#1D9E75','#D85A30','#185FA5','#D4537E',
    '#BA7517','#0F6E56','#993C1D','#7F77DD','#3B6D11',
    '#A32D2D','#0C447C',
];

// Mélange une couleur hex vers le noir (k<0) ou le blanc (k>0), |k| ∈ [0,1]
APP._tmMix = function(c, k) {
    c = c.replace('#', '');
    const r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16);
    const t = k < 0 ? [13, 17, 23] : [255, 255, 255], a = Math.abs(k);
    return `rgb(${Math.round(r + (t[0] - r) * a)},${Math.round(g + (t[1] - g) * a)},${Math.round(b + (t[2] - b) * a)})`;
};

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
        .paddingOuter(3)
        .paddingTop(d => d.depth === 0 ? 0 : 22)
        .paddingInner(3)
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

    // Couleur de base (branche de premier niveau), robuste en drill-down
    const baseColorOf = d => {
        let n = d;
        while (n.parent && n.parent.depth > 0) n = n.parent;
        const globalChild = (APP._tmRoot.children || []).find(c => c.data.id === n.data.id);
        return globalChild ? (branchPalette.get(globalChild.data.id) || '#1e2a3a') : '#1e2a3a';
    };
    const fillOf  = d => d.children ? APP._tmMix(baseColorOf(d), -0.18 + d.depth * 0.04) : APP._tmMix(baseColorOf(d), 0.16);
    const hoverOf = d => d.children ? APP._tmMix(baseColorOf(d), 0.02) : APP._tmMix(baseColorOf(d), 0.34);

    // Rectangle de fond
    cell.append('rect')
        .attr('width',  cellW)
        .attr('height', cellH)
        .attr('rx', 4)
        .attr('fill', d => d.depth === 0 ? '#0d1117' : fillOf(d))
        .attr('stroke', d => d.depth === 0 ? 'none' : 'rgba(13,17,23,0.9)')
        .attr('stroke-width', 1.5)
        .style('cursor', d => (d.depth > 0) ? 'pointer' : 'default')
        .style('transition', 'fill .12s')
        .on('mouseover', function (event, d) {
            if (d.depth > 0) d3.select(this).attr('fill', hoverOf(d)).attr('stroke', 'rgba(255,255,255,0.55)');
        })
        .on('mouseout', function (event, d) {
            if (d.depth > 0) d3.select(this).attr('fill', fillOf(d)).attr('stroke', 'rgba(13,17,23,0.9)');
        })
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

    // En-tête des nœuds parents
    cell.filter(d => d.depth > 0 && d.children)
        .append('text')
        .attr('x', 7)
        .attr('y', 15)
        .attr('font-size', d => { const w = cellW(d); return w > 50 ? '12px' : w > 30 ? '10px' : '0px'; })
        .attr('font-weight', '500')
        .attr('fill', '#eef2fb')
        .attr('pointer-events', 'none')
        .text(d => {
            const w = cellW(d);
            if (w < 34) return '';
            const maxCh = Math.max(2, Math.floor(w / 7.5));
            const name = d.data.name || d.data.id;
            return name.length > maxCh ? name.slice(0, maxCh - 1) + '…' : name;
        });

    // Compteur d'enfants, aligné à droite de l'en-tête
    cell.filter(d => d.depth > 0 && d.children)
        .append('text')
        .attr('x', d => cellW(d) - 7).attr('y', 15)
        .attr('text-anchor', 'end')
        .attr('font-size', '10px')
        .attr('fill', 'rgba(255,255,255,0.55)')
        .attr('pointer-events', 'none')
        .text(d => {
            if (cellW(d) < 70 || cellH(d) < 30) return '';
            return d.leaves().length;
        });

    // Étiquette des feuilles
    cell.filter(d => !d.children)
        .append('text')
        .attr('x', 7)
        .attr('y', d => Math.min(16, cellH(d) - 3))
        .attr('font-size', d => {
            const w = cellW(d), h = cellH(d), area = w * h;
            if (area < 360) return '0px';
            return Math.min(13, Math.max(9, Math.sqrt(area) / 8)) + 'px';
        })
        .attr('font-weight', '500')
        .attr('fill', '#ffffff')
        .attr('pointer-events', 'none')
        .text(d => {
            const w = cellW(d), h = cellH(d);
            if (w * h < 360) return '';
            const maxCh = Math.max(2, Math.floor(w / 6.8));
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

// ── Ontology (Network) : classes + subClassOf + ObjectProperties (domain→range) ──
APP._initOntologyNetwork = function() {
    const container = document.getElementById('cy-onetwork');
    if (!container || APP._viewsTab !== 'ontology-network') return;
    container.innerHTML = '';
    if (APP._onetSim) { APP._onetSim.stop(); APP._onetSim = null; }

    const classes = APP.state.classes || [];
    if (!classes.length) {
        container.innerHTML = '<p style="padding:24px;color:var(--text-dim);font-style:italic">Aucune classe dans cette ontologie.</p>';
        return;
    }
    if (typeof d3 === 'undefined') {
        container.innerHTML = '<p style="padding:24px;color:#f87171">⚠ D3.js non chargé.</p>';
        return;
    }

    const W = container.offsetWidth || 900, H = container.offsetHeight || 600;
    if (container.offsetHeight < 20) container.style.height = (window.innerHeight - 170) + 'px';

    const clsIds = new Set(classes.map(c => c.id));
    const ops    = APP.state.object_properties || [];
    const cid = id => 'cls::' + id;   // ids de nœuds préfixés (classe vs OP, pas de collision)
    const pid = id => 'op::'  + id;

    // Nœuds = classes + ObjectProperties (les OP deviennent des ressources du graphe)
    const nodes = [
        ...classes.map(c => ({
            id: cid(c.id), refId: c.id, kind: 'class', label: _displayRefId(c.id), imported: !!c._imported,
            x: W / 2 + (Math.random() - 0.5) * 260, y: H / 2 + (Math.random() - 0.5) * 260,
        })),
        ...ops.map(op => ({
            id: pid(op.id), refId: op.id, kind: 'op', label: _displayRefId(op.id), imported: !!op._imported,
            x: W / 2 + (Math.random() - 0.5) * 260, y: H / 2 + (Math.random() - 0.5) * 260,
        })),
    ];

    const links = [];
    // subClassOf : classe enfant → classe parent (hiérarchie)
    classes.forEach(c => {
        (c.subClassOf || []).forEach(s => {
            if (typeof s === 'string' && clsIds.has(s) && s !== c.id) {
                links.push({ source: cid(c.id), target: cid(s), kind: 'sub', label: '', id: `${c.id}__sub__${s}` });
            }
        });
    });
    // ObjectProperty (nœud) relié à ses classes via les méta-propriétés rdfs:domain / rdfs:range
    ops.forEach(op => {
        (op.domain || []).forEach(d => {
            if (clsIds.has(d)) links.push({ source: pid(op.id), target: cid(d), kind: 'domain', label: 'rdfs:domain', id: `${op.id}__domain__${d}` });
        });
        (op.range || []).forEach(r => {
            if (clsIds.has(r)) links.push({ source: pid(op.id), target: cid(r), kind: 'range', label: 'rdfs:range', id: `${op.id}__range__${r}` });
        });
    });

    // Courbure pour arêtes multiples / réciproques (évite la superposition)
    const revCount = {};
    links.forEach(l => { revCount[`${l.target}__${l.source}`] = (revCount[`${l.target}__${l.source}`] || 0) + 1; });
    const seen = {};
    links.forEach(l => {
        const k = `${l.source}__${l.target}`;
        seen[k] = (seen[k] || 0) + 1;
        l.curve = (revCount[k] || seen[k] > 1) ? 26 * seen[k] : 0;
    });

    const counter = document.getElementById('onet-count');
    if (counter) counter.textContent = `${classes.length} classes · ${ops.length} OPs · ${links.length} liens`;
    const legend = document.getElementById('onet-legend');
    if (legend) legend.innerHTML = `
        <span style="display:flex;align-items:center;gap:4px;color:var(--text-dim)"><span style="width:9px;height:9px;border-radius:50%;background:#8B5E3C"></span>Class</span>
        <span style="display:flex;align-items:center;gap:4px;color:var(--text-dim)"><span style="width:9px;height:9px;border-radius:50%;background:#3b82f6"></span>ObjectProperty</span>
        <span style="display:flex;align-items:center;gap:4px;color:var(--text-dim)"><span style="width:16px;border-top:2px solid #5a4030"></span>subClassOf · <span style="color:#5a82b8">domain/range</span></span>`;

    const svgEl = d3.select(container).append('svg').attr('width', W).attr('height', H).style('display', 'block');
    const defs = svgEl.append('defs');
    const mkArrow = (id, color) => defs.append('marker').attr('id', id).attr('viewBox', '0 -4 10 8')
        .attr('refX', 19).attr('refY', 0).attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto')
        .append('path').attr('d', 'M0,-4L10,0L0,4').attr('fill', color);
    mkArrow('onet-arrow-sub', '#5a4030'); mkArrow('onet-arrow-op', '#3b82f6');

    const zoomG = svgEl.append('g');
    svgEl.call(d3.zoom().scaleExtent([0.1, 4]).on('zoom', ev => zoomG.attr('transform', ev.transform)));
    const linkG = zoomG.append('g'), labelG = zoomG.append('g'), nodeG = zoomG.append('g');

    const arcCtrl = (sx, sy, tx, ty, c) => { const mx = (sx + tx) / 2, my = (sy + ty) / 2, dx = tx - sx, dy = ty - sy, len = Math.hypot(dx, dy) || 1; return { cx: mx - dy / len * c, cy: my + dx / len * c }; };
    const arcPath = (sx, sy, tx, ty, c) => { if (!c) return `M${sx},${sy}L${tx},${ty}`; const { cx, cy } = arcCtrl(sx, sy, tx, ty, c); return `M${sx},${sy}Q${cx},${cy} ${tx},${ty}`; };

    const linkEls = linkG.selectAll('path').data(links, d => d.id).enter().append('path')
        .attr('fill', 'none')
        .attr('stroke', d => d.kind === 'sub' ? '#5a3d25' : '#2f5b8f')
        .attr('stroke-width', d => d.kind === 'sub' ? 1.8 : 1.4)
        .attr('stroke-dasharray', d => d.kind === 'range' ? '4 3' : '0')
        .attr('marker-end', d => d.kind === 'sub' ? 'url(#onet-arrow-sub)' : 'url(#onet-arrow-op)');

    const edgeLabelEls = labelG.selectAll('text').data(links.filter(l => l.label), d => d.id).enter().append('text')
        .text(d => d.label).attr('text-anchor', 'middle').attr('font-size', '9px')
        .attr('font-family', 'system-ui,sans-serif').attr('fill', '#5a82b8').attr('pointer-events', 'none');

    // class = cercle marron ; ObjectProperty = cercle bleu plus petit (ressource RDF)
    const COL = {
        class: { fill: '#8B5E3C33', stroke: '#8B5E3C' }, classImp: { fill: '#5a3d2533', stroke: '#8a7060' },
        op:    { fill: '#3b82f633', stroke: '#3b82f6' }, opImp:    { fill: '#1e3a6433', stroke: '#6080b0' },
    };
    const colOf = d => COL[d.kind === 'op' ? (d.imported ? 'opImp' : 'op') : (d.imported ? 'classImp' : 'class')];
    const nodeEls = nodeG.selectAll('g').data(nodes, d => d.id).enter().append('g').style('cursor', 'pointer');
    nodeEls.append('circle')
        .attr('r', d => d.kind === 'op' ? 8 : 11)
        .attr('fill', d => colOf(d).fill)
        .attr('stroke', d => colOf(d).stroke).attr('stroke-width', 2);
    nodeEls.append('text').attr('text-anchor', 'middle').attr('y', d => d.kind === 'op' ? -12 : -15).attr('font-size', d => d.kind === 'op' ? '10px' : '11px')
        .attr('font-family', 'system-ui,sans-serif').attr('fill', d => d.kind === 'op' ? '#93c5fd' : '#c4a882').attr('pointer-events', 'none')
        .style('font-style', d => d.imported ? 'italic' : 'normal').text(d => d.label);

    nodeEls.on('click', (ev, d) => APP.navigateTo(d.kind === 'op' ? 'object-properties' : 'classes', d.refId));

    nodeEls.on('mouseover', function (ev, d) {
        const conn = new Set();
        links.forEach(l => { const s = typeof l.source === 'object' ? l.source.id : l.source, t = typeof l.target === 'object' ? l.target.id : l.target; if (s === d.id || t === d.id) { conn.add(s); conn.add(t); } });
        nodeEls.select('circle').attr('opacity', n => conn.has(n.id) ? 1 : 0.2);
        linkEls.attr('opacity', l => { const s = typeof l.source === 'object' ? l.source.id : l.source, t = typeof l.target === 'object' ? l.target.id : l.target; return (s === d.id || t === d.id) ? 1 : 0.06; });
        edgeLabelEls.attr('opacity', l => { const s = typeof l.source === 'object' ? l.source.id : l.source, t = typeof l.target === 'object' ? l.target.id : l.target; return (s === d.id || t === d.id) ? 1 : 0.06; });
    }).on('mouseout', function () { nodeEls.select('circle').attr('opacity', 1); linkEls.attr('opacity', 1); edgeLabelEls.attr('opacity', 1); });

    nodeEls.call(d3.drag()
        .on('start', (ev, d) => { if (!ev.active) APP._onetSim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
        .on('end', (ev, d) => { if (!ev.active) APP._onetSim.alphaTarget(0); d.fx = null; d.fy = null; }));

    APP._onetSim = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(110).strength(0.5))
        .force('charge', d3.forceManyBody().strength(-380))
        .force('center', d3.forceCenter(W / 2, H / 2).strength(0.05))
        .force('collision', d3.forceCollide(30))
        .on('tick', () => {
            linkEls.attr('d', d => arcPath(d.source.x, d.source.y, d.target.x, d.target.y, d.curve));
            edgeLabelEls.each(function (d) {
                const sx = d.source.x, sy = d.source.y, tx = d.target.x, ty = d.target.y;
                if (d.curve) { const { cx, cy } = arcCtrl(sx, sy, tx, ty, d.curve); d3.select(this).attr('x', (sx + tx) / 2 * 0.25 + cx * 0.75).attr('y', (sy + ty) / 2 * 0.25 + cy * 0.75 - 3); }
                else { d3.select(this).attr('x', (sx + tx) / 2).attr('y', (sy + ty) / 2 - 4); }
            });
            nodeEls.attr('transform', d => `translate(${d.x},${d.y})`);
        });
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

// ── Sources (LLMs / Corpus / Analysis) ───────────────────────────
APP._sourcesTab = APP._sourcesTab || 'llms';

APP.renderSources = function() {
    const tab = APP._sourcesTab;
    const tabBtn = (id, label) => `
        <div class="settings-vtab${tab === id ? ' active' : ''}"
             onclick="APP._sourcesTab='${id}';APP.renderSection('sources')"
             style="padding:10px 16px;cursor:pointer;font-size:13px;font-weight:${tab===id?'600':'400'};
                    border-left:3px solid ${tab===id?'var(--accent)':'transparent'};
                    color:${tab===id?'var(--accent)':'var(--text1)'};
                    background:${tab===id?'var(--bg3)':'transparent'};
                    white-space:nowrap;user-select:none">
            ${label}
        </div>`;

    const sidebar = `
        <div style="width:160px;flex-shrink:0;border-right:1px solid var(--border);padding:8px 0">
            ${tabBtn('llms',     '🤖 LLMs')}
            ${tabBtn('corpus',   '📚 Corpus')}
            ${tabBtn('analysis', '📊 Analysis')}
        </div>`;

    const titles = { llms: '🤖 LLMs', corpus: '📚 Corpus', analysis: '📊 Analysis' };
    const content = tab === 'llms'   ? APP._renderLLMs()
        : tab === 'corpus'   ? APP._renderCorpus()
        : tab === 'analysis' ? APP._renderAnalysis()
        : `<div style="padding:24px;color:var(--text-dim)">
            <h3 style="margin:0 0 8px;font-size:15px;color:var(--text1)">${titles[tab] || ''}</h3>
            <p style="font-style:italic;font-size:13px">Contenu à venir.</p>
        </div>`;

    return `
    <div class="section-split" style="display:flex;flex-direction:column">
        <div style="padding:12px 20px;border-bottom:1px solid var(--border);flex-shrink:0">
            <h2 style="margin:0;font-size:16px;font-weight:600;display:flex;align-items:center;gap:8px">📚 Sources</h2>
        </div>
        <div style="display:flex;flex:1;overflow:hidden;min-height:0">
            ${sidebar}
            <div style="flex:1;overflow:auto;display:flex;flex-direction:column;min-height:0">
                ${content}
            </div>
        </div>
    </div>`;
};

// ── LLMs : fournisseurs + clés API (localStorage) + test (proxy backend) ──
// Clé contextuelle : préfixée par le nom de l'ontologie connectée
APP._ontoName   = function () { return this.state && this.state.ontology && this.state.ontology.name || null; };
APP._llmCtxKey  = function (base) { const n = this._ontoName(); return n ? base + '::' + n : base; };
APP._LLM_PROVIDERS = [
    { id: 'anthropic', name: 'Anthropic', sub: 'Claude',                icon: '🤖', hint: 'sk-ant-api03-…' },
    { id: 'openai',    name: 'OpenAI',    sub: 'GPT',                   icon: '🤖', hint: 'sk-…' },
    { id: 'meta',      name: 'Ollama',    sub: 'local — Llama, Mistral…', icon: '💻' },
    { id: 'claude-code', name: 'Claude Code', sub: 'CLI agent',         icon: '🧑‍💻' },
];

// Regroupement des providers par mode d'exécution (affiché dans l'onglet LLMs)
APP._LLM_MODES = [
    { key: 'online',     label: 'On-Line LLMs',  badge: 'built-in',   icon: '🌐',
      desc: 'Cloud LLMs called directly by SWOWL (an API key is required).', providers: ['anthropic', 'openai'] },
    { key: 'offline',    label: 'Off-Line LLMs', badge: 'built-in',   icon: '💻',
      desc: 'Local LLM served by Ollama on your machine — no data leaves your computer. Pick any pulled model (Llama, Mistral…).', providers: ['meta'] },
    { key: 'interfaced', label: 'Interfaced',    badge: 'agent',      icon: '🔌',
      desc: 'The analysis is delegated to an external agent driving SWOWL.', providers: ['claude-code'] },
];

APP._llmKeys = function () {
    try { return JSON.parse(localStorage.getItem(this._llmCtxKey('swowl_llm_keys')) || '{}'); }
    catch { return {}; }
};
APP._llmSetKey = function (p, v) {
    const k = this._llmKeys();
    if (v) k[p] = v; else delete k[p];
    localStorage.setItem(this._llmCtxKey('swowl_llm_keys'), JSON.stringify(k));
};
APP._llmToggle = function (p) {
    const inp = document.getElementById('llm-key-' + p);
    if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
};
APP._llmSave = function (p) {
    const inp = document.getElementById('llm-key-' + p);
    const val = (inp ? inp.value : '').trim();
    this._llmSetKey(p, val);
    const badge = document.getElementById('llm-badge-' + p);
    if (badge) {
        badge.textContent = val ? '● configured' : '○ not configured';
        badge.style.color = val ? 'var(--accent2)' : 'var(--text-dim)';
    }
    const st = document.getElementById('llm-status-' + p);
    if (st) st.innerHTML = val
        ? '<span style="color:var(--text-dim)">key saved (not tested)</span>'
        : '';
    if (typeof UI !== 'undefined' && UI.success) UI.success(`${p} key saved locally.`);
};
APP._llmTest = async function (p) {
    const inp = document.getElementById('llm-key-' + p);
    const key = (inp ? inp.value : '').trim();
    const st = document.getElementById('llm-status-' + p);
    if (!st) return;
    if (!key) { st.innerHTML = '<span style="color:#e0a96d">⚠ enter a key first</span>'; return; }
    st.innerHTML = '<span style="color:var(--text-dim)">⏳ testing…</span>';
    try {
        const r = await API.testLlmKey(p, key);
        st.innerHTML = r && r.ok
            ? `<span style="color:var(--accent2)">✅ ${this._esc(r.message || 'valid key')}</span>`
            : `<span style="color:#ef4444">❌ ${this._esc((r && r.message) || 'invalid key')}</span>`;
    } catch (e) {
        st.innerHTML = `<span style="color:#ef4444">❌ ${this._esc(e.message || 'test failed')}</span>`;
    }
};
APP._esc = function (t) { const d = document.createElement('div'); d.textContent = String(t); return d.innerHTML; };

// ── Provider actif ──
APP._llmProvider    = function ()  { return localStorage.getItem(this._llmCtxKey('swowl_llm_provider')) || 'anthropic'; };
APP._llmSetProvider = function (v) { if (v) { localStorage.setItem(this._llmCtxKey('swowl_llm_provider'), v); APP.renderSection('sources'); } };

// Libellé lisible du mode d'exécution actif (utilisé dans l'onglet LLMs et Corpus)
APP._llmActiveLabel = function () {
    const p = this._llmProvider();
    const metaMode = this._llmMetaMode();
    return {
        anthropic:     'On-Line — Anthropic Claude',
        openai:        'On-Line — OpenAI GPT',
        meta:          `Off-Line — Ollama local (${this._llmOllamaModelLabel(this._llmOllamaModel())})`,
        'claude-code': 'Interfaced — Claude Code',
    }[p] || p;
};

// Routeur d'analyse : aiguille vers le bon moteur selon le mode choisi dans l'onglet LLMs
APP._analyseCorpus = function () {
    if (this._llmProvider() === 'claude-code') return this._claudeCodeAnalyse();
    return this._corpusAnalyse();
};

// ── Mode Meta/Llama : 'cloud' ou 'local' (Ollama) ──
APP._llmMetaMode    = function ()  { return 'local'; };  // Meta = Ollama local uniquement (mode Cloud retiré)
APP._llmSetMetaMode = function (v) { localStorage.setItem(this._llmCtxKey('swowl_llm_meta_mode'), v); APP.renderSection('sources'); };

// ── URLs / modèles par provider ──
APP._llmOllamaUrl      = function ()  { return localStorage.getItem(this._llmCtxKey('swowl_llm_ollama_url'))   || 'http://host.docker.internal:11434'; };
APP._llmSetOllamaUrl   = function (v) { if (v) localStorage.setItem(this._llmCtxKey('swowl_llm_ollama_url'), v); };
APP._llmOllamaModel    = function ()  { return localStorage.getItem(this._llmCtxKey('swowl_llm_ollama_model')) || 'llama3.2'; };
APP._llmSetOllamaModel = function (v) { if (v) localStorage.setItem(this._llmCtxKey('swowl_llm_ollama_model'), v); };

APP._llmOpenAIModel    = function ()  { return localStorage.getItem(this._llmCtxKey('swowl_llm_openai_model')) || 'gpt-4o'; };
APP._llmSetOpenAIModel = function (v) { if (v) localStorage.setItem(this._llmCtxKey('swowl_llm_openai_model'), v); };
APP._llmOpenAIModels   = function ()  {
    try { const a = JSON.parse(localStorage.getItem(this._llmCtxKey('swowl_llm_openai_models')) || '[]'); return Array.isArray(a) ? a : []; }
    catch { return []; }
};

APP._llmMetaCloudModel    = function ()  { return localStorage.getItem(this._llmCtxKey('swowl_llm_meta_model')) || 'Llama-4-Scout-17B-16E-Instruct'; };
APP._llmSetMetaCloudModel = function (v) { if (v) localStorage.setItem(this._llmCtxKey('swowl_llm_meta_model'), v); };

// ── Modèles Anthropic (global) ──
APP._LLM_MODELS = [
    { id: 'claude-opus-4-8', label: 'Opus 4.8 — best quality' },
    { id: 'claude-sonnet-4-6', label: 'Sonnet 4.6 — balanced (default)' },
    { id: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5 — fast / cheap' },
];
APP._llmModel = function () { return localStorage.getItem(this._llmCtxKey('swowl_llm_model')) || 'claude-sonnet-4-6'; };
APP._llmSetModel = function (v) { if (v) localStorage.setItem(this._llmCtxKey('swowl_llm_model'), v); };

// ── Modèles Ollama découverts (via Test) ──
APP._llmOllamaModels = function () {
    try { const a = JSON.parse(localStorage.getItem(this._llmCtxKey('swowl_llm_ollama_models')) || '[]'); return Array.isArray(a) ? a : []; }
    catch { return []; }
};
// Détails par modèle Ollama découverts au Test : [{name, params, quant, ctx}]
APP._llmOllamaModelsDetail = function () {
    try { const a = JSON.parse(localStorage.getItem(this._llmCtxKey('swowl_llm_ollama_models_detail')) || '[]'); return Array.isArray(a) ? a : []; }
    catch { return []; }
};
// Libellé enrichi d'un modèle Ollama : "name — 7.2B · Q4_K_M · 32k"
APP._llmOllamaModelLabel = function (name) {
    const d = (this._llmOllamaModelsDetail() || []).find(x => x.name === name);
    if (!d) return name;
    const bits = [];
    if (d.params) bits.push(d.params);
    if (d.quant)  bits.push(d.quant);
    if (d.ctx)    bits.push(Math.round(d.ctx / 1024) + 'k');
    return bits.length ? `${name} — ${bits.join(' · ')}` : name;
};

// ── Test Ollama local ──
APP._llmTestOllama = async function () {
    const url = (document.getElementById('llm-ollama-url') || {}).value || this._llmOllamaUrl();
    const st  = document.getElementById('llm-status-meta');
    if (!st) return;
    st.innerHTML = '<span style="color:var(--text-dim)">⏳ testing Ollama…</span>';
    try {
        const r = await API.testLlmKey('meta', '', url);
        if (r && r.ok) {
            const models = (r.models || []).filter(Boolean);
            localStorage.setItem(this._llmCtxKey('swowl_llm_ollama_models'), JSON.stringify(models));
            localStorage.setItem(this._llmCtxKey('swowl_llm_ollama_models_detail'), JSON.stringify(r.models_detail || []));
            // Si le modèle courant n'est pas dans la liste, présélectionne le 1er disponible
            if (models.length && !models.includes(this._llmOllamaModel())) {
                this._llmSetOllamaModel(models[0]);
            }
            this.renderSection('sources');  // re-render → menu déroulant peuplé
            // Le re-render a remplacé l'élément de statut : ré-appliquer le message
            const st2 = document.getElementById('llm-status-meta');
            if (st2) st2.innerHTML = `<span style="color:var(--accent2)">✅ ${this._esc(r.message)}</span>`;
        } else {
            st.innerHTML = `<span style="color:#ef4444">❌ ${this._esc((r && r.message) || 'unreachable')}</span>`;
        }
    } catch (e) {
        st.innerHTML = `<span style="color:#ef4444">❌ ${this._esc(e.message)}</span>`;
    }
};

// ── Test OpenAI : récupère la liste des modèles dynamiquement ──
APP._llmTestOpenAI = async function () {
    const inp = document.getElementById('llm-key-openai');
    const key = (inp ? inp.value : '').trim();
    const st  = document.getElementById('llm-status-openai');
    if (!st) return;
    if (!key) { st.innerHTML = '<span style="color:#e0a96d">⚠ enter a key first</span>'; return; }
    st.innerHTML = '<span style="color:var(--text-dim)">⏳ testing…</span>';
    try {
        const r = await API.testLlmKey('openai', key);
        if (r && r.ok) {
            const models = (r.models || []).filter(Boolean);
            localStorage.setItem(this._llmCtxKey('swowl_llm_openai_models'), JSON.stringify(models));
            if (models.length && !models.includes(this._llmOpenAIModel())) {
                this._llmSetOpenAIModel(models[0]);
            }
            this._llmSetKey('openai', key);
            this.renderSection('sources');
            const st2 = document.getElementById('llm-status-openai');
            if (st2) st2.innerHTML = `<span style="color:var(--accent2)">✅ ${this._esc(r.message)}</span>`;
        } else {
            st.innerHTML = `<span style="color:#ef4444">❌ ${this._esc((r && r.message) || 'invalid key')}</span>`;
        }
    } catch (e) {
        st.innerHTML = `<span style="color:#ef4444">❌ ${this._esc(e.message)}</span>`;
    }
};

// ── Prompt système d'extraction (global, éditable) ──
APP._llmPrompt = function () { return localStorage.getItem(this._llmCtxKey('swowl_llm_prompt')) || ''; };  // '' = défaut backend
APP._llmSavePrompt = function () {
    const t = document.getElementById('llm-prompt');
    const v = (t ? t.value : '').trim();
    const k = this._llmCtxKey('swowl_llm_prompt');
    if (v) localStorage.setItem(k, v); else localStorage.removeItem(k);
    if (UI && UI.success) UI.success('Extraction prompt saved.');
};
APP._llmResetPrompt = async function () {
    localStorage.removeItem(this._llmCtxKey('swowl_llm_prompt'));
    const t = document.getElementById('llm-prompt');
    if (t) { try { const r = await API.getCorpusPrompt(); t.value = (r && r.prompt) || ''; } catch { t.value = ''; } }
    if (UI && UI.success) UI.success('Extraction prompt reset to default.');
};
// Charge le prompt par défaut dans le textarea si l'utilisateur n'en a pas enregistré
APP._llmLoadDefaultPrompt = async function () {
    const t = document.getElementById('llm-prompt');
    if (!t || t.value.trim()) return;
    try { const r = await API.getCorpusPrompt(); if (!t.value.trim()) t.value = (r && r.prompt) || ''; } catch { /* backend indispo */ }
};

APP._renderLLMs = function () {
    const keys       = this._llmKeys();
    const activeProv = this._llmProvider();
    const modelSel   = this._llmModel();
    const metaMode   = this._llmMetaMode();
    const inp = (id, val, ph, extra='') =>
        `<input id="${id}" type="password" value="${(val||'').replace(/"/g,'&quot;')}" placeholder="${ph}"
                autocomplete="off" spellcheck="false" ${extra}
                style="flex:1;min-width:200px;background:var(--bg3);border:1px solid var(--border);
                       color:var(--text1);border-radius:6px;padding:7px 10px;font-size:13px;font-family:monospace">`;

    const modelField = (id, val, ph, onchange) =>
        `<div style="display:flex;align-items:center;gap:8px;margin-top:10px">
            <span style="font-size:12px;color:var(--text-dim);white-space:nowrap">Model:</span>
            <input id="${id}" type="text" value="${this._esc(val)}" placeholder="${ph}"
                   autocomplete="off" spellcheck="false"
                   onchange="${onchange}"
                   style="flex:1;background:var(--bg3);border:1px solid var(--border);color:var(--text1);
                          border-radius:6px;padding:5px 8px;font-size:12px;font-family:monospace">
        </div>`;

    const card = (p) => {
        const isActive = activeProv === p.id;
        const has = p.id === 'meta' ? (metaMode === 'local' || !!keys[p.id]) : !!keys[p.id];
        let body = '';

        if (p.id === 'anthropic') {
            const val = keys[p.id] || '';
            body = `
                <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                    ${inp('llm-key-anthropic', val, p.hint)}
                    <button class="btn-sm" onclick="APP._llmToggle('anthropic')" title="Afficher/masquer">👁</button>
                    <button class="btn-sm" onclick="APP._llmSave('anthropic')">💾 Save</button>
                    <button class="btn-sm" onclick="APP._llmTest('anthropic')">🧪 Test</button>
                </div>
                <div id="llm-status-anthropic" style="margin-top:8px;font-size:12px;min-height:16px">
                    ${keys[p.id] ? '<span style="color:var(--text-dim)">key saved (not tested)</span>' : ''}
                </div>
                <div style="margin-top:10px;display:flex;align-items:center;gap:8px">
                    <span style="font-size:12px;color:var(--text-dim);white-space:nowrap">Model:</span>
                    <select id="llm-model-anthropic" onchange="APP._llmSetModel(this.value)"
                            style="background:var(--bg3);border:1px solid var(--border);color:var(--text1);border-radius:6px;padding:5px 8px;font-size:12px">
                        ${this._LLM_MODELS.map(m => `<option value="${m.id}"${m.id === modelSel ? ' selected' : ''}>${m.label}</option>`).join('')}
                    </select>
                </div>`;

        } else if (p.id === 'openai') {
            const val = keys[p.id] || '';
            const openaiModels = this._llmOpenAIModels();
            const curModel = this._llmOpenAIModel();
            const modelWidget = openaiModels.length
                ? `<div style="display:flex;align-items:center;gap:8px;margin-top:10px">
                    <span style="font-size:12px;color:var(--text-dim);white-space:nowrap">Model:</span>
                    <select id="llm-model-openai" onchange="APP._llmSetOpenAIModel(this.value)"
                            style="flex:1;background:var(--bg3);border:1px solid var(--border);color:var(--text1);
                                   border-radius:6px;padding:5px 8px;font-size:12px;font-family:monospace">
                        ${openaiModels.map(m => `<option value="${this._esc(m)}"${m === curModel ? ' selected' : ''}>${this._esc(m)}</option>`).join('')}
                    </select>
                   </div>`
                : modelField('llm-model-openai', curModel, 'cliquez « Test » pour lister les modèles', "APP._llmSetOpenAIModel(this.value)");
            body = `
                <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                    ${inp('llm-key-openai', val, p.hint)}
                    <button class="btn-sm" onclick="APP._llmToggle('openai')" title="Afficher/masquer">👁</button>
                    <button class="btn-sm" onclick="APP._llmSave('openai')">💾 Save</button>
                    <button class="btn-sm" onclick="APP._llmTestOpenAI()">🧪 Test</button>
                </div>
                <div id="llm-status-openai" style="margin-top:8px;font-size:12px;min-height:16px">
                    ${keys[p.id] ? '<span style="color:var(--text-dim)">key saved (not tested)</span>' : ''}
                </div>
                ${modelWidget}`;

        } else if (p.id === 'meta') {
            // Meta = LLM Off-Line via Ollama (local) uniquement.
            body = `
                <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                    <input id="llm-ollama-url" type="text"
                           value="${this._esc(this._llmOllamaUrl())}"
                           placeholder="http://host.docker.internal:11434"
                           onchange="APP._llmSetOllamaUrl(this.value)"
                           autocomplete="off" spellcheck="false"
                           style="flex:1;min-width:200px;background:var(--bg3);border:1px solid var(--border);
                                  color:var(--text1);border-radius:6px;padding:7px 10px;font-size:13px;font-family:monospace">
                    <button class="btn-sm" onclick="APP._llmTestOllama()">🧪 Test</button>
                </div>
                <div id="llm-status-meta" style="margin-top:8px;font-size:12px;min-height:16px"></div>
                ${(() => {
                    const found = this._llmOllamaModels();
                    const cur = this._llmOllamaModel();
                    if (found.length) {
                        const opts = found.map(m => `<option value="${this._esc(m)}"${m === cur ? ' selected' : ''}>${this._esc(this._llmOllamaModelLabel(m))}</option>`).join('');
                        return `<div style="display:flex;align-items:center;gap:8px;margin-top:10px">
                            <span style="font-size:12px;color:var(--text-dim);white-space:nowrap">Model:</span>
                            <select id="llm-model-ollama" onchange="APP._llmSetOllamaModel(this.value)"
                                    style="flex:1;background:var(--bg3);border:1px solid var(--border);color:var(--text1);
                                           border-radius:6px;padding:5px 8px;font-size:12px;font-family:monospace">
                                ${opts}
                            </select>
                        </div>`;
                    }
                    return modelField('llm-model-ollama', cur, 'cliquez « Test » pour lister les modèles', "APP._llmSetOllamaModel(this.value)");
                })()}
                <p style="margin:8px 0 0;font-size:11px;color:var(--text-faint);font-style:italic">
                    Ollama doit tourner localement et être accessible depuis le conteneur Docker.
                    Installez Ollama depuis <a href="https://ollama.com" target="_blank" style="color:var(--accent)">ollama.com</a>,
                    tirez un modèle — ex. <code>ollama pull llama3.2</code>, <code>ollama pull mistral</code> —
                    puis cliquez <b>🧪 Test</b> et choisissez-le dans la liste <b>Model</b>.
                </p>`;

        } else if (p.id === 'claude-code') {
            body = `
                <p style="margin:0 0 8px;font-size:13px;color:var(--text1);line-height:1.6">
                    Claude Code (CLI) — the analysis is performed by the <b>Claude Code</b> agent
                    via the <code>/ontologue</code> skill, which drives SWOWL for you.
                </p>
                <p style="margin:0;font-size:12px;color:var(--text-dim);line-height:1.6">
                    No API key is needed here: select this mode, then click
                    <b>🔬 Analyse Corpus</b> in the <b>Corpus</b> tab and let Claude Code populate
                    the candidate ontology. See <b>« How to do it »</b> below.
                </p>`;
        }

        const activeBorder = isActive ? 'border:2px solid var(--accent);' : '';
        return `<div class="cls-frame" style="margin-bottom:14px;${activeBorder}">
            <div class="cls-frame-bar" style="gap:8px">
                <span style="font-size:16px;line-height:1;flex-shrink:0">${p.icon}</span>
                <span style="font-size:13px;font-weight:600;color:var(--text1)">${p.name}</span>
                <span style="font-size:11px;color:var(--text-dim)">${p.sub}</span>
                ${isActive
                    ? `<span style="margin-left:auto;font-size:11px;font-weight:600;color:var(--accent)">✓ Active</span>`
                    : `<button class="btn-sm" style="margin-left:auto"
                               onclick="APP._llmSetProvider('${p.id}')">Use for analysis</button>`}
            </div>
            <div class="cls-frame-body" style="padding:12px">${body}</div>
        </div>`;
    };

    // Charge le prompt dans le textarea une fois le DOM injecté
    const savedPrompt = this._llmPrompt();
    setTimeout(async () => {
        const t = document.getElementById('llm-prompt');
        if (!t) return;
        if (savedPrompt) { t.value = savedPrompt; }
        else { try { const r = await API.getCorpusPrompt(); t.value = (r && r.prompt) || ''; } catch { /* backend indispo */ } }
    }, 0);

    const activeLabel = this._llmActiveLabel();

    // Une « mode-group » : un titre de mode + ses cartes provider
    const cardById = {};
    this._LLM_PROVIDERS.forEach(p => { cardById[p.id] = p; });
    const modeGroup = (m) => `
        <div style="margin-bottom:22px">
            <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:4px">
                <span style="font-size:15px">${m.icon}</span>
                <span style="font-size:14px;font-weight:700;color:var(--text1)">${m.label}</span>
                <span style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;
                             color:var(--text-dim);border:1px solid var(--border);border-radius:4px;padding:1px 6px">${m.badge}</span>
            </div>
            <p style="margin:0 0 10px;font-size:11px;color:var(--text-faint);font-style:italic">${m.desc}</p>
            ${m.providers.map(id => cardById[id] ? card(cardById[id]) : '').join('')}
        </div>`;

    return `<div style="padding:20px;max-width:780px">
        <div style="margin-bottom:18px;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);
                    border-radius:8px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <span style="font-size:12px;color:var(--text-dim)">Execution mode used for corpus analysis :</span>
            <span style="font-size:13px;font-weight:600;color:var(--accent)">${activeLabel}</span>
            <span style="font-size:11px;color:var(--text-faint);margin-left:auto">
                (click <em>Use for analysis</em> on a card to change)
            </span>
        </div>
        ${this._LLM_MODES.map(modeGroup).join('')}

        <hr style="border:none;border-top:1px solid var(--border);margin:18px 0">

        <!-- ── What to do ── -->
        <div class="cls-frame" style="margin-top:6px">
            <div class="cls-frame-bar" style="gap:8px">
                <span style="font-size:13px;font-weight:600;color:var(--text1)">🧬 What to do</span>
                <span style="font-size:11px;color:var(--text-dim)">corpus extraction prompt</span>
                <span style="margin-left:auto;display:flex;gap:6px">
                    <button class="btn-sm" onclick="APP._llmSavePrompt()" title="Save your custom prompt">💾 Save</button>
                    <button class="btn-sm" onclick="APP._llmResetPrompt()" title="Restore the default prompt">↺ Reset to default</button>
                </span>
            </div>
            <div class="cls-frame-body" style="padding:12px">
                <p style="margin:0 0 10px;font-size:12px;color:var(--text-dim);line-height:1.5">
                    The instruction sent to the model (built-in LLMs) and the goal the Claude Code agent
                    must achieve: extract a complete ontology (OWL business model + SWRL business rules)
                    from the corpus documents.
                </p>
                <textarea id="llm-prompt" spellcheck="false" placeholder="Loading default prompt…"
                          style="width:100%;min-height:200px;resize:vertical;background:var(--bg3);border:1px solid var(--border);
                                 color:var(--text1);border-radius:6px;padding:10px;font-size:12px;font-family:monospace;
                                 line-height:1.5;box-sizing:border-box"></textarea>
                <p style="margin:8px 0 0;font-size:11px;color:var(--text-faint);font-style:italic">
                    The model must return strict JSON ({classes, object_properties, datatype_properties, individuals, swrl_rules}).
                    Keep that contract if you edit — the backend parses this JSON to build the candidate ontology.
                </p>
            </div>
        </div>

        <!-- ── How to do it ── -->
        <div class="cls-frame" style="margin-top:14px">
            <div class="cls-frame-bar" style="gap:8px">
                <span style="font-size:13px;font-weight:600;color:var(--text1)">📖 How to do it</span>
                <span style="font-size:11px;color:var(--text-dim)">Claude Code skill</span>
            </div>
            <div class="cls-frame-body" style="padding:12px">
                <p style="margin:0;font-size:13px;color:var(--text1);line-height:1.6">
                    The <b>Interfaced</b> mode relies on the <code>/ontologue</code> Claude Code skill,
                    which drives SWOWL step by step to build the candidate ontology.
                </p>
                <p style="margin:8px 0 0;font-size:13px;line-height:1.6">
                    👉 <a href="https://github.com/MyShivaRepo/swowl/blob/main/.claude/skills/ontologue.md"
                          target="_blank" rel="noopener" style="color:var(--accent);font-weight:600">
                        Open the <code>/ontologue</code> skill on GitHub
                    </a>
                </p>
            </div>
        </div>
    </div>`;
};

// ── Corpus : liste de documents (Name / Location) dans localStorage ──
APP._escAttr = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
};
// Corpus : propre à chaque ontologie → clé indexée par le nom de l'ontologie connectée
APP._corpusStorageKey = function () {
    const n = this.state.ontology && this.state.ontology.name;
    return n ? 'swowl_corpus::' + n : null;
};
// Migration unique : l'ancien corpus global appartient à l'ontologie « RoHS_Ontology »
APP._corpusMigrate = function () {
    try {
        if (localStorage.getItem('swowl_corpus_migrated')) return;
        const legacy = localStorage.getItem('swowl_corpus_docs');
        if (legacy && legacy !== '[]') {
            const target = 'swowl_corpus::RoHS_Ontology';
            if (!localStorage.getItem(target)) localStorage.setItem(target, legacy);
        }
        localStorage.removeItem('swowl_corpus_docs');
        localStorage.setItem('swowl_corpus_migrated', '1');
    } catch { /* localStorage indisponible */ }
};
APP._corpusDocs = function () {
    this._corpusMigrate();
    const key = this._corpusStorageKey();
    if (!key) return [];
    try { const a = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(a) ? a : []; }
    catch { return []; }
};
APP._corpusSave = function (arr) {
    const key = this._corpusStorageKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(arr));
};
// Sélecteur de fichier local via le FsBrowser (chemin absolu, comme l'onglet Ontologies)
APP._CORPUS_EXTS = ['.pdf', '.txt', '.md', '.csv', '.json', '.xml', '.html', '.htm',
    '.doc', '.docx', '.rtf', '.odt', '.owl', '.ttl', '.rdf', '.n3', '.nt'];
APP._corpusReveal = function (i) {
    const docs = this._corpusDocs();
    const loc = docs[i] && docs[i].location;
    if (loc) API.revealInFinder(loc).catch(() => {});
};
APP._corpusBrowse = function () {
    FsBrowser.open('corpus-loc', this._CORPUS_EXTS);
};
APP._corpusBrowseEdit = function () {
    FsBrowser.open('corpus-edit-loc', this._CORPUS_EXTS);
};
APP._corpusEditIdx = null;
APP._corpusEdit = function (i) { this._corpusEditIdx = i; this.renderSection('sources'); };
APP._corpusEditCancel = function () { this._corpusEditIdx = null; this.renderSection('sources'); };
APP._corpusEditSave = function (i) {
    const nameI = document.getElementById('corpus-edit-name');
    const locI  = document.getElementById('corpus-edit-loc');
    const name = (nameI ? nameI.value : '').trim();
    const loc  = (locI ? locI.value : '').trim();
    if (!loc) { if (typeof UI !== 'undefined' && UI.error) UI.error('Location cannot be empty.'); return; }
    const docs = this._corpusDocs();
    if (i < 0 || i >= docs.length) { this._corpusEditIdx = null; return; }
    docs[i] = { name: name || ((loc.split(/[\\/]/).pop() || loc).split('?')[0] || loc), location: loc };
    this._corpusSave(docs);
    this._corpusEditIdx = null;
    this.renderSection('sources');
    if (typeof UI !== 'undefined' && UI.success) UI.success('Document updated.');
};
APP._corpusAdd = function () {
    const nameI = document.getElementById('corpus-name');
    const locI  = document.getElementById('corpus-loc');
    let name = (nameI ? nameI.value : '').trim();
    const loc  = (locI ? locI.value : '').trim();
    if (!loc) {
        if (typeof UI !== 'undefined' && UI.error) UI.error('Please provide a Location (URL or local file).');
        return;
    }
    if (!name) {  // déduit le nom du dernier segment du chemin/URL
        name = (loc.split(/[\\/]/).pop() || loc).split('?')[0] || loc;
    }
    const docs = this._corpusDocs();
    docs.push({ name, location: loc });
    this._corpusSave(docs);
    this.renderSection('sources');
    if (typeof UI !== 'undefined' && UI.success) UI.success(`Document "${name}" added.`);
};
APP._corpusDel = function (i) {
    const docs = this._corpusDocs();
    if (i < 0 || i >= docs.length) return;
    const removed = docs.splice(i, 1)[0];
    this._corpusSave(docs);
    this.renderSection('sources');
    if (typeof UI !== 'undefined' && UI.success) UI.success(`Document "${removed ? removed.name : ''}" removed.`);
};
APP._renderCorpus = function () {
    const onto = this.state.ontology;
    if (!onto) {
        return `<div style="padding:24px;color:var(--text-dim)">
            <p style="font-size:13px;font-style:italic">The Corpus is specific to each ontology. Connect an ontology first (Ontologies tab).</p>
        </div>`;
    }
    const ontoLabel = (onto.prefix ? onto.prefix + ':' : '') + (onto.name || '');
    const docs = this._corpusDocs();
    const running = !!this._analysisInProgress || (this._analysisStatus && this._analysisStatus.state === 'running');
    const th = (label, extra = '') => `<th style="text-align:left;padding:7px 10px;border-bottom:2px solid var(--border);color:var(--text-dim);font-size:11px;text-transform:uppercase;letter-spacing:.04em;${extra}">${label}</th>`;
    const editIdx = this._corpusEditIdx;
    const inpStyle = 'background:var(--bg3);border:1px solid var(--border);color:var(--text1);border-radius:6px;padding:6px 9px;font-size:13px';
    const rows = docs.length ? docs.map((d, i) => {
        const cell = 'padding:7px 10px;border-bottom:1px solid var(--border);vertical-align:top';
        if (i === editIdx) {  // ── ligne en édition ──
            return `<tr>
                <td style="${cell}"><input id="corpus-edit-name" value="${this._escAttr(d.name)}" placeholder="Document name" autocomplete="off" spellcheck="false" style="${inpStyle};width:100%"></td>
                <td style="${cell}"><div style="display:flex;gap:6px;align-items:center">
                    <input id="corpus-edit-loc" value="${this._escAttr(d.location)}" placeholder="URL or local path" autocomplete="off" spellcheck="false" style="${inpStyle};flex:1;min-width:0;font-family:monospace" onkeydown="if(event.key==='Enter')APP._corpusEditSave(${i})">
                    <button class="btn-sm" onclick="APP._corpusBrowseEdit()" title="Pick a local file">📂</button>
                </div></td>
                <td style="${cell};text-align:right;white-space:nowrap">
                    <button class="btn-sm" onclick="APP._corpusEditSave(${i})" title="Save">💾</button>
                    <button class="btn-sm" onclick="APP._corpusEditCancel()" title="Cancel">✕</button>
                </td>
            </tr>`;
        }
        const isUrl = /^https?:\/\//i.test(d.location || '');
        const loc = isUrl
            ? `<a href="${this._escAttr(d.location)}" target="_blank" rel="noopener" style="color:var(--accent);word-break:break-all">${this._esc(d.location)}</a>`
            : `<span onclick="APP._corpusReveal(${i})"
                  style="font-family:monospace;font-size:12px;color:var(--accent);word-break:break-all;cursor:pointer;text-decoration:underline dotted"
                  title="Click to reveal in Finder">${this._esc(d.location)}</span>`;
        const tag = isUrl ? '🌐 URL' : '📁 path';
        return `<tr>
            <td style="${cell}">${this._esc(d.name)}</td>
            <td style="${cell}">${loc} <span style="font-size:10px;color:var(--text-faint);white-space:nowrap">${tag}</span></td>
            <td style="${cell};text-align:right;white-space:nowrap">
                <button class="btn-sm" onclick="APP._corpusEdit(${i})" title="Edit document">✏️</button>
                <button class="btn-sm btn-del" onclick="APP._corpusDel(${i})" title="Remove document">✕</button>
            </td>
        </tr>`;
    }).join('') : `<tr><td colspan="3" style="padding:16px 10px;color:var(--text-dim);font-style:italic">No document yet. Add one above.</td></tr>`;

    return `<div style="padding:20px;max-width:900px">
        <p style="margin:0 0 16px;font-size:13px;color:var(--text-dim);line-height:1.6">
            Corpus documents for ontology <b style="color:var(--text1)">${this._esc(ontoLabel)}</b>
            (this list is specific to this ontology). A <b style="color:var(--text1)">location</b> can be a
            <b style="color:var(--text1)">local file path</b> or an <b style="color:var(--text1)">internet URL</b>.
        </p>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:16px">
            <input id="corpus-name" placeholder="Document name" autocomplete="off" spellcheck="false"
                   onkeydown="if(event.key==='Enter')APP._corpusAdd()"
                   style="width:200px;background:var(--bg3);border:1px solid var(--border);color:var(--text1);border-radius:6px;padding:7px 10px;font-size:13px">
            <input id="corpus-loc" placeholder="Paste an https:// URL, or pick a local file →" autocomplete="off" spellcheck="false"
                   onkeydown="if(event.key==='Enter')APP._corpusAdd()"
                   style="flex:1;min-width:280px;background:var(--bg3);border:1px solid var(--border);color:var(--text1);border-radius:6px;padding:7px 10px;font-size:13px;font-family:monospace">
            <button class="btn-sm" onclick="APP._corpusBrowse()" title="Pick a local file (absolute path)">📂 Browse…</button>
            <button class="btn-sm" onclick="APP._corpusAdd()" title="Add document to the list">➕ Add Document</button>
        </div>
        <p style="margin:-8px 0 16px;font-size:11px;color:var(--text-faint);font-style:italic">
            Paste a Web URL into Location, or use <b>📂 Browse…</b> to pick a local file (its absolute path is filled in).
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead><tr>${th('Name', 'width:200px')}${th('Location')}${th('', 'width:80px')}</tr></thead>
            <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:14px;margin-bottom:6px">
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;user-select:none">
                <input type="checkbox" id="corpus-candidate-chk" ${this._corpusCandidateFlag !== false ? 'checked' : ''} onchange="APP._corpusCandidateFlag = this.checked">
                Add Annotation Property <code style="font-size:11px">swowl:candidate</code>
            </label>
        </div>
        <div style="display:flex;align-items:center;gap:12px">
            <button id="corpus-analyse-btn" class="btn-sm" style="width:220px" onclick="APP._analyseCorpus()" title="Analyse the corpus documents into a candidate ontology, using the mode selected in the LLMs tab"${(docs.length && !running) ? '' : ' disabled'}>${running ? '⏳ Analysing…' : '🔬 Analyse Corpus'}</button>
            <span id="corpus-analyse-status" style="font-size:12px">${this._analysisStatusHtml()}</span>
        </div>
        <p style="margin:6px 0 0;font-size:11px;color:var(--text-faint);font-style:italic">
            In case of Claude Code (CLI) choose, continu to chat into Claude Desktop
        </p>
        <div style="margin-top:12px">
            <button class="btn-sm" style="width:220px" onclick="APP._corpusDedupe()" title="Detect and merge duplicate entities (exact, case, plural)"${running ? ' disabled' : ''}>🧹 Clean Duplicates</button>
        </div>
    </div>`;
};

// Statut de l'analyse, persistant à droite du bouton « Analyse Corpus »
APP._analysisStatus = null;  // {state:'running'|'done'|'error', done, elements, message}
APP._analysisStatusHtml = function () {
    const s = this._analysisStatus;
    if (!s) return '';
    if (s.state === 'running') {
        return `<span style="color:var(--text-dim)">⏳ Analyse en cours… <b style="color:var(--text1)">${s.done}</b> chunk${s.done !== 1 ? 's' : ''} traité${s.done !== 1 ? 's' : ''}, <b style="color:var(--text1)">${s.elements}</b> élément${s.elements !== 1 ? 's' : ''} extrait${s.elements !== 1 ? 's' : ''}</span>`;
    }
    if (s.state === 'done') {
        return `<span style="color:var(--accent2)">✅ Analyse terminée — <b>${s.elements}</b> élément${s.elements !== 1 ? 's' : ''} extrait${s.elements !== 1 ? 's' : ''} sur <b>${s.done}</b> chunk${s.done !== 1 ? 's' : ''}</span>`;
    }
    if (s.state === 'error') {
        return `<span style="color:#ef4444">❌ ${this._esc(s.message || 'analyse en échec')}</span>`;
    }
    return '';
};
// Met à jour le statut en mémoire + le DOM si le span est visible (onglet Corpus)
APP._setAnalysisStatus = function (status) {
    this._analysisStatus = status;
    const el = document.getElementById('corpus-analyse-status');
    if (el) el.innerHTML = this._analysisStatusHtml();
};
// ── Analyse du corpus → ontologie candidate (LLM Anthropic) ──
APP._analysisKey = function () {
    const n = this.state.ontology && this.state.ontology.name;
    return n ? 'swowl_analysis::' + n : null;
};
APP._analysisData = function () {
    const k = this._analysisKey();
    if (!k) return [];
    try { const a = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(a) ? a : []; }
    catch { return []; }
};
APP._analysisErrors = function () {
    const k = this._analysisKey();
    if (!k) return [];
    try { const a = JSON.parse(localStorage.getItem(k + '::errors') || '[]'); return Array.isArray(a) ? a : []; }
    catch { return []; }
};
APP._analysisSave = function (prov, errors) {
    const k = this._analysisKey();
    if (k) {
        localStorage.setItem(k, JSON.stringify(prov || []));
        localStorage.setItem(k + '::errors', JSON.stringify(errors || []));
    }
};
// ── Claude Code analysis polling ──────────────────────────────────────────
APP._corpusCandidateFlag = true;  // checkbox "Add Annotation Property swowl:candidate"
APP._ccPolling = null;   // setInterval handle
APP._ccChunks  = null;   // null = not in CC mode, [] = CC mode active

APP._claudeCodeAnalyse = async function () {
    if (this._analysisInProgress) { alert('An LLM analysis is already running.'); return; }
    // Envoie la liste des docs corpus au backend (pour que Claude Code utilise le bon nom)
    const docs = this._corpusDocs();
    await API.clearAnalysis(docs);
    this._ccChunks = [];
    this._setAnalysisStatus({ state: 'running', done: 0, elements: 0 });
    this.renderSection('corpus');
    this._ccStartPolling();
    alert('Claude Code analysis started.\n\nAsk Claude Code:\n"Analyse the corpus and populate the ontology (call /api/analysis/chunk for each chunk and /api/analysis/done when finished)"');
};

APP._ccStartPolling = function () {
    if (this._ccPolling) clearInterval(this._ccPolling);
    this._ccPolling = setInterval(() => this._ccPoll(), 2000);
};

APP._ccPoll = async function () {
    try {
        const res = await API.getAnalysisChunks();
        this._ccChunks = res.chunks || [];
        const els = this._ccChunks.reduce((n, c) =>
            n + Object.values(c.ids || {}).reduce((s, l) => s + (l || []).length, 0), 0);
        if (res.running) {
            this._setAnalysisStatus({ state: 'running', done: this._ccChunks.length, elements: els });
        } else {
            clearInterval(this._ccPolling);
            this._ccPolling = null;
            this._setAnalysisStatus({ state: 'done', done: this._ccChunks.length, elements: els });
            this._analysisSaveChunks(this._ccChunks);
            // Dériver le format provenance (pour _whereExtractedFrame) depuis les chunks
            this._analysisSave(this._ccBuildProv(this._ccChunks), []);
            this._ccChunks = null;
            this.refresh();
        }
        if (document.getElementById('analysis-tab-live')) this.renderSection('analysis');
    } catch (e) { /* réseau : on ignore et on reessaie */ }
};

// Construit le format provenance [{id, kind, label, sections}] depuis les chunks CC
// Les kinds doivent correspondre à ce que _whereExtractedFrame attend : 'class','op','dp','individual'
// Résout un item de ids (string ou objet enrichi {id, label, ...}) → {id, label}
APP._ccResolveItem = function (item) {
    if (!item) return null;
    if (typeof item === 'string') return item ? {id: item, label: item} : null;
    if (typeof item === 'object' && item.id) return {id: item.id, label: item.label || item.id};
    return null;
};

APP._ccBuildProv = function (chunks) {
    const map = {};
    const KIND_MAP = {
        classes: 'class', object_properties: 'op',
        datatype_properties: 'dp', individuals: 'individual', swrl_rules: 'swrl_rule'
    };
    (chunks || []).forEach(c => {
        const ref = c.ref || {};
        const sig = JSON.stringify({doc: ref.doc, chapter: ref.chapter, page: ref.page});
        Object.entries(c.ids || {}).forEach(([kind, list]) => {
            const k = KIND_MAP[kind] || kind;
            (list || []).forEach(raw => {
                const item = APP._ccResolveItem(raw);
                if (!item) return;
                const {id, label} = item;
                if (!map[id]) map[id] = {id, kind: k, label, sections: []};
                else if (label !== id) map[id].label = label; // update label if enriched
                if (!map[id].sections.find(s => JSON.stringify(s) === sig))
                    map[id].sections.push({doc: ref.doc, chapter: ref.chapter, page: ref.page});
            });
        });
    });
    return Object.values(map);
};

// Sync depuis le backend : récupère les chunks CC stockés côté serveur si le localStorage est vide.
// force=true → re-sync même si localStorage a déjà des données (bouton "Reload").
APP._ccSyncFromBackend = async function (force = false) {
    if (this._ccSyncInProgress) return;
    const k = this._analysisKey();
    if (!k) return;
    if (!force && this._analysisChunks().length > 0) return;
    this._ccSyncInProgress = true;
    try {
        const res = await API.getAnalysisChunks();
        const serverChunks = res.chunks || [];
        if (serverChunks.length > 0) {
            // Sauvegarde sans le texte brut pour éviter le dépassement du quota localStorage
            const lean = serverChunks.map(c => ({ ref: c.ref, ids: c.ids, error: c.error }));
            this._analysisSaveChunks(lean);
            this._analysisSave(this._ccBuildProv(lean), []);
            await this.refresh();
            if (UI && UI.success) UI.success(`Analysis ready — ${serverChunks.length} chunks loaded. Click Analysis tab to view.`);
        } else {
            if (UI && UI.warn) UI.warn('No analysis found on backend for this ontology.');
        }
    } catch (e) { /* réseau — on ignore */ }
    finally { this._ccSyncInProgress = false; }
};

// Navigation depuis WHERE EXTRACTED → onglet Analysis, scroll jusqu'au chunk
APP._goToAnalysisChunk = function (ref) {
    // Analysis est un sous-onglet de sources
    this._sourcesTab = 'analysis';
    this.navigate('sources');
    const key = JSON.stringify({doc: ref.doc, chapter: ref.chapter, page: ref.page});
    setTimeout(() => {
        const row = Array.from(document.querySelectorAll('tr[data-chunk-ref]'))
            .find(tr => tr.dataset.chunkRef === key);
        if (!row) return;
        row.scrollIntoView({behavior: 'smooth', block: 'center'});
        row.style.transition = 'background 0.4s';
        row.style.background = 'var(--accent-dim, rgba(99,102,241,0.18))';
        setTimeout(() => { row.style.background = ''; }, 2000);
    }, 80);
};

// Chunks (vue document-centrée) : [{ref, text, ids, error}]
APP._analysisChunks = function () {
    const k = this._analysisKey();
    if (!k) return [];
    try { const a = JSON.parse(localStorage.getItem(k + '::chunks') || '[]'); return Array.isArray(a) ? a : []; }
    catch { return []; }
};
APP._analysisSaveChunks = function (chunks) {
    const k = this._analysisKey();
    if (k) {
        try { localStorage.setItem(k + '::chunks', JSON.stringify(chunks || [])); }
        catch (e) { /* quota dépassé : on ignore, le tableau chunk sera juste vide */ }
    }
};
// Surligne dans `text` les termes candidats extraits — travaille sur le texte brut,
// construit le HTML en une seule passe (évite les matches dans les balises <mark>).
APP._highlightTerms = function (text, ids) {
    const plain = text || '';
    if (!plain) return '';
    const EXCLUDED = new Set(['mark','span','href','style','class','attr','text','data','body','head','html','true','false','null','with','that','this','from','have','been','they','their','will','when','than','into','each','also','only','both','some','such','more','other']);

    // Convertit un ID CamelCase / snake_case en phrase lisible
    const toPhrase = id => String(id)
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/[_]+/g, ' ').trim();

    // Construit un pattern regex tolérant le pluriel anglais courant sur le DERNIER mot
    // "Hazardous Substance" → "Hazardous Substances?" (match singular et plural)
    const pluralPat = phrase => {
        const esc = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Ajoute s? / es? / ies? sur la fin (couvre: substance→substances, property→properties)
        return esc.replace(/(y)$/i, '(?:y|ies)')
                  .replace(/(e)$/i,  '$1s?')
                  .replace(/([^aeiou\s])$/i, '$1(?:es|s)?');
    };

    // Collecte phrases (priorité) puis mots individuels
    const phrases = [];  // {pat, len}
    const words   = [];
    Object.values(ids || {}).forEach(list => (list || []).forEach(raw => {
        const item = APP._ccResolveItem(raw);
        if (!item) return;
        // Indexer à la fois l'ID et le label (si différent) pour le surlignage
        const candidates = [item.id];
        if (item.label && item.label !== item.id) candidates.push(item.label);
        candidates.forEach(id => {
        const phrase = toPhrase(id);
        const parts  = phrase.split(/\s+/);
        if (parts.length > 1 && phrase.length > 4) {
            phrases.push({pat: pluralPat(phrase), len: phrase.length});
        }
        parts.forEach(w => {
            const lw = w.toLowerCase();
            if (w.length > 3 && !EXCLUDED.has(lw))
                words.push({pat: pluralPat(w), len: w.length});
        });
        }); // end candidates.forEach
    }));

    // Trier du plus long au plus court pour que les phrases priment sur les mots
    const all = [...phrases, ...words].sort((a, b) => b.len - a.len);

    const ranges = [];
    for (const {pat} of all) {
        try {
            const re = new RegExp('\\b' + pat + '\\b', 'gi');
            let m;
            while ((m = re.exec(plain)) !== null) {
                if (!ranges.some(r => m.index < r.end && m.index + m[0].length > r.start))
                    ranges.push({start: m.index, end: m.index + m[0].length});
            }
        } catch { /* regex invalide */ }
    }
    if (!ranges.length) return this._esc(plain);
    ranges.sort((a, b) => a.start - b.start);
    let result = '', pos = 0;
    for (const {start, end} of ranges) {
        result += this._esc(plain.slice(pos, start));
        result += `<mark style="background:var(--accent);color:#fff;border-radius:3px;padding:0 2px">${this._esc(plain.slice(start, end))}</mark>`;
        pos = end;
    }
    result += this._esc(plain.slice(pos));
    return result;
};
APP._analysisInProgress = null;  // {total, done, chunks: [{ref, added, error}]}

APP._corpusAnalyse = async function () {
    const docs = this._corpusDocs();
    if (!docs.length) { if (UI && UI.error) UI.error('Add at least one document first.'); return; }

    const provider  = this._llmProvider();
    const metaMode  = this._llmMetaMode();
    const isOllama  = provider === 'meta' && metaMode === 'local';
    let   api_key   = (this._llmKeys()[provider] || '').trim();
    let   model     = '';
    let   base_url  = '';

    if (provider === 'anthropic') {
        model = this._llmModel();
        if (!api_key) { UI.error('Configure an Anthropic API key in the LLMs tab first.'); return; }
    } else if (provider === 'openai') {
        model = this._llmOpenAIModel();
        if (!api_key) { UI.error('Configure an OpenAI API key in the LLMs tab first.'); return; }
    } else if (provider === 'meta') {
        if (isOllama) {
            base_url = this._llmOllamaUrl();
            model    = this._llmOllamaModel();
            api_key  = 'ollama';
            if (!base_url) { UI.error('Configure the Ollama URL in the LLMs tab first.'); return; }
        } else {
            model = this._llmMetaCloudModel();
            if (!api_key) { UI.error('Configure a Meta/Llama API key in the LLMs tab first.'); return; }
        }
    }
    const btn = document.getElementById('corpus-analyse-btn');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Analysing…'; }

    // Effacer les résultats/erreurs précédents et basculer sur l'onglet Analysis
    this._analysisSave([], []);
    this._analysisSaveChunks([]);
    this._analysisInProgress = { done: 0, chunks: [] };
    this._setAnalysisStatus({ state: 'running', done: 0, elements: 0 });
    APP._sourcesTab = 'analysis';
    APP.navigate('sources');

    const ctrl = new AbortController();
    // Timeout d'INACTIVITÉ (pas total) : réarmé à chaque event reçu (chunk/heartbeat).
    // Le backend envoie un heartbeat toutes les 100s → 250s couvre un modèle local lent.
    let tid;
    const resetIdle = () => { clearTimeout(tid); tid = setTimeout(() => ctrl.abort(), 250_000); };
    resetIdle();
    try {
        const resp = await fetch('/api/corpus/analyse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key, model, provider, base_url,
                                   documents: docs, system_prompt: this._llmPrompt() }),
            signal: ctrl.signal,
        });
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({ detail: resp.statusText }));
            throw new Error(err.detail || resp.statusText);
        }

        const reader = resp.body.getReader();
        const dec = new TextDecoder();
        let buf = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            resetIdle();  // réarme le timeout d'inactivité à chaque paquet reçu
            buf += dec.decode(value, { stream: true });
            const lines = buf.split('\n');
            buf = lines.pop();
            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                let ev;
                try { ev = JSON.parse(line.slice(6)); } catch { continue; }
                if (ev.type === 'heartbeat') continue;
                if (ev.type === 'chunk') {
                    this._analysisInProgress.done++;
                    this._analysisInProgress.chunks.push(ev);
                    const elems = this._analysisInProgress.chunks.reduce((sum, c) =>
                        sum + Object.values(c.ids || {}).reduce((a, l) => a + (l || []).length, 0), 0);
                    this._setAnalysisStatus({ state: 'running', done: this._analysisInProgress.done, elements: elems });
                    // Re-render uniquement si l'utilisateur est sur cet onglet
                    // (évite de forcer la navigation et de geler l'IHM)
                    if (this.currentSection === 'sources') this.renderSection('sources');
                } else if (ev.type === 'done' || ev.type === 'error') {
                    clearTimeout(tid);
                    const chunksDone = (this._analysisInProgress && this._analysisInProgress.done) || 0;
                    this._lastChunks = (this._analysisInProgress && this._analysisInProgress.chunks) || [];
                    this._analysisInProgress = null;
                    if (ev.type === 'done') {
                        const errs = ev.errors || [];
                        this._analysisSave(ev.provenance || [], errs);
                        this._analysisSaveChunks(this._lastChunks || []);
                        await APP.refresh();
                        const n = Object.values(ev.added || {}).reduce((x, y) => x + (y || 0), 0);
                        this._setAnalysisStatus({ state: 'done', done: chunksDone, elements: n });
                        if (n > 0 && UI && UI.success) UI.success(`Corpus analysed: ${n} candidate elements merged.`);
                        else if (UI && UI.warn) UI.warn('Corpus analysed: 0 new elements. See Analysis tab for details.');
                    } else {
                        this._setAnalysisStatus({ state: 'error', done: chunksDone, message: ev.message });
                        if (UI && UI.error) UI.error('Analysis error: ' + ev.message);
                    }
                    this.renderSection('sources');
                }
            }
        }
    } catch (e) {
        clearTimeout(tid);
        this._analysisInProgress = null;
        this._setAnalysisStatus({ state: 'error', done: 0, message: (e && e.message ? e.message : String(e)) });
        if (btn) { btn.disabled = false; btn.textContent = '🔬 Analyse Corpus'; }
        if (UI && UI.error) UI.error('Analysis failed: ' + (e && e.message ? e.message : e));
        this.renderSection('sources');
        return;
    }
    if (btn) { btn.disabled = false; btn.textContent = '🔬 Analyse Corpus'; }
};

// Détecte et fusionne les doublons : exacts+casse en auto, pluriels validés un par un
APP._corpusDedupe = async function () {
    let dups;
    try { dups = await API.getDuplicates(); }
    catch (e) { UI.error('Duplicate detection failed: ' + e.message); return; }

    const KIND_LBL = { classes: 'class', object_properties: 'ObjectProperty',
                       datatype_properties: 'DatatypeProperty', individuals: 'individual' };
    const exactCount = Object.values(dups).reduce((n, v) => n + v.exact.length, 0);
    const caseCount  = Object.values(dups).reduce((n, v) => n + v.case.length, 0);
    // "plural / variant" pairs → manual validation
    const pluralPairs = [];
    Object.entries(dups).forEach(([kind, v]) => v.plural.forEach(g => pluralPairs.push({ kind, ids: g })));

    if (!exactCount && !caseCount && !pluralPairs.length) {
        UI.success('No duplicates found. 👍');
        return;
    }

    // 1) Auto: exact + case. 2) Plural: ask which id to keep (or skip)
    const merges = [];
    for (const p of pluralPairs) {
        const [a, b] = p.ids;
        const keep = await UI.confirm(
            `Duplicate ${KIND_LBL[p.kind]} (variant):<br>
             <b>${this._esc(a)}</b> and <b>${this._esc(b)}</b><br>
             <small style="color:var(--text-dim)">OK = merge into “${this._esc(a)}” · Cancel = keep both</small>`);
        if (keep) merges.push({ kind: p.kind, keep: a, remove: [b] });
    }

    try {
        const res = await API.mergeDuplicates({ auto_exact: true, auto_case: true, merges });
        await APP.refresh();
        APP.renderSection('sources');
        UI.success(`Duplicates cleaned: ${res.exact_removed} exact removed, ${res.merged} merged.`);
    } catch (e) { UI.error('Merge failed: ' + e.message); }
};

APP._renderAnalysis = function () {
    const onto = this.state.ontology;
    if (!onto) {
        return `<div style="padding:24px;color:var(--text-dim)"><p style="font-size:13px;font-style:italic">Analysis is specific to each ontology. Connect an ontology first.</p></div>`;
    }
    const KIND_DOT = {classes:'cls-dot', object_properties:'op-prop-dot',
                       datatype_properties:'dp-prop-dot', individuals:'xsd-dot', swrl_rules:'⚙️'};
    const KIND_LBL = {classes:'C', object_properties:'OP', datatype_properties:'DP',
                      individuals:'I', swrl_rules:'⚙️'};
    const KIND_SEC = {classes:'classes', object_properties:'object-properties',
                      datatype_properties:'datatype-properties', individuals:'individuals',
                      swrl_rules:'swrl-rules'};

    // Identifiant lisible d'un chunk : doc — chapitre (préféré) sinon doc — p.N
    const chunkLabel = (ref) => {
        const r = ref || {};
        const parts = [r.doc || '?'];
        if (r.chapter) parts.push(r.chapter);
        else if (r.page != null) parts.push('p.' + r.page);
        return parts.join(' — ');
    };

    // Une ligne de tableau (3 colonnes) pour un chunk
    const chunkRow = (c) => {
        const ref = c.ref || {};
        const refKey = this._escAttr(JSON.stringify({doc: ref.doc, chapter: ref.chapter, page: ref.page}));
        const chunkCell = `<div style="font-size:12px;font-weight:600;color:var(--text1)">${this._esc(ref.doc || '?')}</div>
            ${ref.chapter ? `<div style="font-size:11px;color:var(--accent);margin-top:2px">${this._esc(ref.chapter)}</div>` : ''}
            ${ref.page != null ? `<div style="font-size:10px;color:var(--text-faint);margin-top:1px">p.${ref.page}</div>` : ''}`;

        if (c.error) {
            return `<tr data-chunk-ref="${refKey}">
                <td style="padding:8px 10px;border-bottom:1px solid var(--border);vertical-align:top;white-space:nowrap">${chunkCell}</td>
                <td colspan="2" style="padding:8px 10px;border-bottom:1px solid var(--border);vertical-align:top;color:var(--error,#e74c3c);font-size:12px">⚠ ${this._esc(c.error)}</td>
            </tr>`;
        }
        const ids = c.ids || {};
        const textHtml = c.text
            ? `<div style="font-size:11px;line-height:1.5;color:var(--text-dim);max-height:140px;overflow:auto;white-space:pre-wrap">${this._highlightTerms(c.text, ids)}</div>`
            : `<span style="color:var(--text-faint);font-size:11px">—</span>`;
        const chips = Object.entries(ids).flatMap(([kind, list]) =>
            (list || []).map(raw => {
                const item = APP._ccResolveItem(raw);
                if (!item) return '';
                const {id, label} = item;
                const dot = KIND_DOT[kind];
                const sec = KIND_SEC[kind] || 'classes';
                const isEmoji = dot && /\p{Emoji}/u.test(dot);
                const icon = !dot ? `<b>${KIND_LBL[kind]||kind} </b>`
                           : isEmoji ? `<span style="font-size:11px;margin-right:3px">${dot}</span>`
                           : `<span class="${dot}" style="display:inline-block;vertical-align:middle;margin-right:3px"></span>`;
                const displayLabel = this._esc(id);
                return `<span onclick="APP.navigateTo('${sec}','${this._escAttr(id)}')" title="Go to ${this._esc(id)}" style="display:inline-flex;align-items:center;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:1px 7px;margin:2px;font-size:11px;font-family:monospace;cursor:pointer">${icon}${displayLabel}</span>`;
            })
        ).join('');
        const elemHtml = chips || `<span style="color:var(--text-faint);font-size:11px">—</span>`;
        return `<tr data-chunk-ref="${refKey}">
            <td style="padding:8px 10px;border-bottom:1px solid var(--border);vertical-align:top;white-space:nowrap">${chunkCell}</td>
            <td style="padding:8px 10px;border-bottom:1px solid var(--border);vertical-align:top;max-width:380px">${textHtml}</td>
            <td style="padding:8px 10px;border-bottom:1px solid var(--border);vertical-align:top;line-height:1.8">${elemHtml}</td>
        </tr>`;
    };

    const th = (l, ex = '') => `<th style="text-align:left;padding:7px 10px;border-bottom:2px solid var(--border);color:var(--text-dim);font-size:11px;text-transform:uppercase;letter-spacing:.04em;${ex}">${l}</th>`;
    const tableHead = `<thead><tr>${th('Chunk', 'width:170px')}${th('Text extract')}${th('Extracted elements', 'width:300px')}</tr></thead>`;

    // Un chunk est "vide" s'il n'a ni erreur ni aucun élément extrait → on le masque
    // Gère les deux formats : string et objet enrichi
    const hasContent = (c) => !!c.error || Object.values(c.ids || {}).some(list =>
        (list || []).some(raw => APP._ccResolveItem(raw) !== null));
    const hiddenNote = (n) => n > 0
        ? `<p style="margin:8px 0 0;font-size:11px;color:var(--text-faint);font-style:italic">${n} empty chunk${n > 1 ? 's' : ''} hidden (no element extracted).</p>`
        : '';

    // ── mode Claude Code (polling) ────────────────────────────────────────
    if (this._ccChunks !== null) {
        const visible = this._ccChunks.filter(hasContent);
        const hidden  = this._ccChunks.length - visible.length;
        const rows = visible.map(chunkRow).join('');
        return `<div id="analysis-tab-live" style="padding:20px;max-width:1100px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
                <span style="font-size:15px">🤖</span>
                <span style="font-size:13px;font-weight:600;color:var(--text1)">Claude Code is analysing… (${this._ccChunks.length} chunk${this._ccChunks.length !== 1 ? 's' : ''} received)</span>
            </div>
            <table style="width:100%;border-collapse:collapse">${tableHead}
                <tbody>${rows || '<tr><td colspan="3" style="padding:10px;color:var(--text-dim);font-style:italic">Waiting for first chunk…</td></tr>'}</tbody>
            </table>
            ${hiddenNote(hidden)}
        </div>`;
    }

    // ── état "en cours" (LLM) ─────────────────────────────────────────────
    const ip = this._analysisInProgress;
    if (ip) {
        const visible = ip.chunks.filter(hasContent);
        const hidden  = ip.chunks.length - visible.length;
        const rows = visible.map(chunkRow).join('');
        return `<div style="padding:20px;max-width:1100px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
                <span style="font-size:15px">⏳</span>
                <span style="font-size:13px;font-weight:600;color:var(--text1)">Analysing corpus… (${ip.done} chunk${ip.done !== 1 ? 's' : ''} processed)</span>
            </div>
            <table style="width:100%;border-collapse:collapse">${tableHead}
                <tbody>${rows || '<tr><td colspan="3" style="padding:10px;color:var(--text-dim);font-style:italic">Waiting for elements…</td></tr>'}</tbody>
            </table>
            ${hiddenNote(hidden)}
        </div>`;
    }

    // ── état persisté ─────────────────────────────────────────────────────
    const chunks = this._analysisChunks();
    const errs = this._analysisErrors();
    const errBlock = errs.length ? `<div style="margin:0 0 16px;padding:10px 14px;background:var(--error-bg,#3a1a1a);border:1px solid var(--error,#c0392b);border-radius:6px;font-size:12px;color:var(--error,#e74c3c)">
        <b>⚠ Analysis errors (${errs.length})</b><br>${errs.map(e => `<span style="font-family:monospace">[${this._esc(e.doc)}]</span> ${this._esc(e.error)}`).join('<br>')}
    </div>` : '';

    if (!chunks.length) {
        // Auto-sync: check if backend has CC chunks not yet in localStorage
        APP._ccSyncFromBackend();
        return `<div style="padding:24px">${errBlock}
            <p style="font-size:13px;font-style:italic;color:var(--text-dim)">No analysis yet. Go to the <b>Corpus</b> tab and click <b>🔬 Analyse Corpus</b> to extract a candidate ontology from your documents.</p>
            <button class="btn-sm" onclick="APP._ccSyncFromBackend(true)" style="margin-top:8px">↻ Reload from backend</button>
        </div>`;
    }

    const visible = chunks.filter(hasContent);
    const hidden  = chunks.length - visible.length;
    if (!visible.length) {
        return errBlock + `<div style="padding:24px"><p style="font-size:13px;font-style:italic;color:var(--text-dim)">${chunks.length} chunk${chunks.length > 1 ? 's' : ''} analysed, but no element was extracted. Try a more capable model (e.g. Claude) or refine the extraction prompt in the LLMs tab.</p></div>`;
    }
    const PAGE = 30;
    const showAll = this._analysisShowAll || false;
    const displayed = showAll ? visible : visible.slice(0, PAGE);
    const rows = displayed.map(chunkRow).join('');
    const moreBtn = (!showAll && visible.length > PAGE)
        ? `<div style="text-align:center;margin-top:10px">
              <button class="btn-sm" onclick="APP._analysisShowAll=true;APP.renderSection('sources')">
                Show all ${visible.length} chunks (${visible.length - PAGE} more)
              </button>
           </div>`
        : '';
    return errBlock + `<div style="padding:20px;max-width:1100px">
        <p style="margin:0 0 16px;font-size:13px;color:var(--text-dim);line-height:1.6">
            Corpus chunks analysed for <b style="color:var(--text1)">${this._esc(onto.name || '')}</b>.
            For each chunk: its <b style="color:var(--text1)">source</b> (document — chapter / page),
            the <b style="color:var(--text1)">text extract</b> with candidate terms highlighted, and the
            <b style="color:var(--text1)">extracted elements</b> (navigable).
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:13px">${tableHead}
            <tbody>${rows}</tbody>
        </table>
        ${moreBtn}
        ${hiddenNote(hidden)}
    </div>`;
};

// ── GUI Tabs sub-tab content ──────────────────────────────────────
APP.renderGuiTabs = function() {
    const ALL_TABS = [
        { id: 'ontologies',            label: 'Ontologies',           icon: `<svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor" style="vertical-align:middle;color:var(--accent)"><circle cx="7" cy="1.5" r="1.5"/><circle cx="1.5" cy="10.5" r="1.5"/><circle cx="12.5" cy="10.5" r="1.5"/><line x1="7" y1="3" x2="2.5" y2="9" stroke="currentColor" stroke-width="1"/><line x1="7" y1="3" x2="11.5" y2="9" stroke="currentColor" stroke-width="1"/><line x1="3" y1="10.5" x2="11" y2="10.5" stroke="currentColor" stroke-width="1"/></svg>`, fixed: true  },
        { id: 'settings',              label: 'Settings',             icon: '🛠️', fixed: true  },
        { id: 'sources',               label: 'Sources',              icon: '📚', fixed: false },
        { id: 'classes',               label: 'Classes',              icon: '<span class="cls-dot" style="display:inline-block;vertical-align:middle"></span>',        fixed: true  },
        { id: 'object-properties',     label: 'ObjectProperties',     icon: '<span class="op-prop-dot" style="display:inline-block;vertical-align:middle"></span>',    fixed: true  },
        { id: 'datatype-properties',   label: 'DatatypeProperties',   icon: '<span class="dp-prop-dot" style="display:inline-block;vertical-align:middle"></span>',    fixed: true  },
        { id: 'annotation-properties', label: 'AnnotationProperties', icon: '<span class="anno-prop-dot" style="display:inline-block;vertical-align:middle"></span>',  fixed: false },
        { id: 'individuals',           label: 'Individuals',          icon: '<span class="xsd-dot" style="display:inline-block;vertical-align:middle;margin:0"></span>',fixed: false },
        { id: 'swrl-rules',            label: 'SWRL Rules',           icon: '⚙️', fixed: false },
        { id: 'queries',               label: 'Queries',              icon: '🔎', fixed: false },
        { id: 'views',                 label: 'Views',                icon: `<svg width="14" height="10" viewBox="0 0 14 10" fill="none" style="vertical-align:middle;color:var(--text1)"><ellipse cx="7" cy="5" rx="6.5" ry="4.5" stroke="currentColor" stroke-width="1.2"/><circle cx="7" cy="5" r="2" fill="currentColor"/></svg>`, fixed: false },
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
                    ${fmtOption('alphanumeric',       'Alphanumeric string', 'rgu8j-7t32z-oh7g5-mq78t','4 groups of 5 random alphanumeric characters separated by dashes. The first character is always a letter — an ID must not start with a digit (NCName rule).')}
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
