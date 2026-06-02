/**
 * owl_editor.js — Formulaires OWL : Classes, ObjectProperties, DatatypeProperties, Individus
 */

// ── Annotation Properties OWL 2 ─────────────────────────────
/** Toutes les annotation properties OWL 2 (pour l'onglet AnnotationProperties) */
const ALL_ANNO_PROPS = [
    'rdfs:label', 'rdfs:comment', 'rdfs:seeAlso', 'rdfs:isDefinedBy',
    'owl:versionInfo', 'owl:deprecated', 'owl:priorVersion',
    'owl:backwardCompatibleWith', 'owl:incompatibleWith',
];
/** Les 7 propriétés "autres" (hors label/comment qui ont leurs propres boutons) */
const OTHER_ANNO_PROPS = ALL_ANNO_PROPS.filter(p => p !== 'rdfs:label' && p !== 'rdfs:comment');

// ── Helpers UI ──────────────────────────────────────────────

function classOptions(selectedIds = []) {
    const classes = APP.state.classes || [];
    return classes.map(c =>
        `<option value="${c.id}" ${selectedIds.includes(c.id) ? 'selected' : ''}>${c.id}</option>`
    ).join('');
}

/** Options <option> des classes en ordre hiérarchique (même ordre que l'Asserted Hierarchy) */
function classHierarchyOptions(selectedId = '') {
    const classes = APP.state.classes || [];
    if (!classes.length) return '';
    const { roots, childrenOf } = ClassEditor.buildTree(classes);
    const lines = [];
    const visit = (id, depth) => {
        const pad   = '   '.repeat(depth);   // espaces insécables pour l'indentation
        const arrow = depth > 0 ? '▸ ' : '';       // ▸ + espace insécable
        lines.push(`<option value="${id}" ${id === selectedId ? 'selected' : ''}>${pad}${arrow}${id}</option>`);
        (childrenOf[id] || []).forEach(child => visit(child, depth + 1));
    };
    roots.forEach(id => visit(id, 0));
    return lines.join('');
}

/** Items HTML du picker custom de classe (dot marron + ordre hiérarchique) */
/** Items de l'arbre de classes pour un picker générique (domain, range…).
 *  onSelectExpr : expression JS exécutée au clic, ex: "OPEditor.addDomain(this.dataset.id)" */
/**
 * Génère les items de l'arbre des classes pour un picker.
 * @param {string}   callExpr    Expression JS appelée avec l'id en argument,
 *                               ex: "MyEditor.addSomething" → devient MyEditor.addSomething('WhoItem')
 * @param {string[]} [excludeIds] Classes à exclure (déjà sélectionnées, classe courante…)
 */
function _classTreePickerItems(callExpr, excludeIds = []) {
    const excluded = new Set(excludeIds);
    const classes  = APP.state.classes || [];
    const { roots, childrenOf } = ClassEditor.buildTree(classes);
    const lines = [];

    if (!excluded.has('owl:Thing')) {
        lines.push(`<div class="tree-item" data-id="owl:Thing"
            style="padding-left:6px" onclick="${callExpr}('owl:Thing')">
            <span class="tree-leaf">◦</span>
            <span class="cls-dot tree-thing-dot"></span>
            <span class="tree-label" style="font-style:italic">owl:Thing</span>
        </div>`);
    }

    const visit = (id, depth) => {
        if (excluded.has(id)) {
            // Afficher les enfants quand même (la classe est exclue mais pas ses filles)
            (childrenOf[id] || []).forEach(child => visit(child, depth + 1));
            return;
        }
        const pl = depth * 16 + 6;
        lines.push(`<div class="tree-item" data-id="${id}"
            style="padding-left:${pl}px" onclick="${callExpr}('${id}')">
            <span class="tree-leaf">◦</span>
            <span class="cls-dot tree-cls-dot"></span>
            <span class="tree-label">${id}</span>
        </div>`);
        (childrenOf[id] || []).forEach(child => visit(child, depth + 1));
    };
    roots.forEach(id => visit(id, 1));
    return lines.join('');
}

/** Items de l'arbre ObjectProperties pour un picker (inverse, subPropertyOf…)
 *  @param {string}   onSelectExpr  expression onclick
 *  @param {string[]} [excludeIds]  identifiants à exclure de l'arbre
 */
function _opTreePickerItems(onSelectExpr, excludeIds = []) {
    const excluded = new Set(excludeIds);
    const props = (APP.state.object_properties || []).filter(p => !excluded.has(p.id));
    const { roots, childrenOf } = OPEditor.buildTree(props);
    const lines = [];
    const visit = (id, depth) => {
        if (excluded.has(id)) return;
        const pl = depth * 16 + 6;
        lines.push(`<div class="tree-item" data-id="${id}"
            style="padding-left:${pl}px" onclick="${onSelectExpr}">
            <span class="tree-leaf">◦</span>
            <span class="op-prop-dot"></span>
            <span class="tree-label">${id}</span>
        </div>`);
        (childrenOf[id] || []).forEach(child => visit(child, depth + 1));
    };
    roots.forEach(id => visit(id, 1));
    return lines.join('') || '<div class="cls-list-empty" style="padding:4px 8px">—</div>';
}

/** Items du picker classe — structure identique à l\'Asserted Hierarchy */
function _classHierarchyItems(idx, selectedId) {
    const classes = APP.state.classes || [];
    const { roots, childrenOf } = ClassEditor.buildTree(classes);
    const lines = [];

    // owl:Thing — racine implicite (depth 0)
    lines.push(`<div class="tree-item${selectedId === 'owl:Thing' ? ' selected' : ''}" data-id="owl:Thing"
        style="padding-left:6px" onclick="RestrictionEditor.selectFiller('${idx}',this.dataset.id)">
        <span class="tree-leaf">◦</span>
        <span class="cls-dot tree-thing-dot"></span>
        <span class="tree-label" style="font-style:italic">owl:Thing</span>
    </div>`);

    const visit = (id, depth) => {
        const pl = depth * 16 + 6;
        lines.push(`<div class="tree-item${id === selectedId ? ' selected' : ''}" data-id="${id}"
            style="padding-left:${pl}px" onclick="RestrictionEditor.selectFiller('${idx}',this.dataset.id)">
            <span class="tree-leaf">◦</span>
            <span class="cls-dot tree-cls-dot"></span>
            <span class="tree-label">${id}</span>
        </div>`);
        (childrenOf[id] || []).forEach(child => visit(child, depth + 1));
    };
    roots.forEach(id => visit(id, 1));
    return lines.join('');
}

function opOptions(selectedId = '') {
    const ops = APP.state.object_properties || [];
    return ops.map(p =>
        `<option value="${p.id}" ${p.id === selectedId ? 'selected' : ''}>${p.id}</option>`
    ).join('');
}

function dpOptions(selectedId = '') {
    const dps = APP.state.datatype_properties || [];
    return dps.map(p =>
        `<option value="${p.id}" ${p.id === selectedId ? 'selected' : ''}>${p.id}</option>`
    ).join('');
}

const XSD_TYPES = [
    'xsd:string','xsd:integer','xsd:decimal','xsd:float','xsd:double',
    'xsd:boolean','xsd:date','xsd:dateTime','xsd:duration',
    'xsd:anyURI','xsd:nonNegativeInteger','xsd:positiveInteger',
];

function xsdOptions(selected = 'xsd:string') {
    return XSD_TYPES.map(t =>
        `<option value="${t}" ${t === selected ? 'selected' : ''}>${t}</option>`
    ).join('');
}

const SWRLB_BUILTINS = [
    'swrlb:equal','swrlb:notEqual',
    'swrlb:greaterThan','swrlb:greaterThanOrEqual',
    'swrlb:lessThan','swrlb:lessThanOrEqual',
    'swrlb:add','swrlb:subtract','swrlb:multiply','swrlb:divide',
    'swrlb:before','swrlb:after',
    'swrlb:stringConcat','swrlb:stringLength',
    'swrlb:matches','swrlb:contains',
    'swrlb:upperCase','swrlb:lowerCase',
];


// ════════════════════════════════════════════════════════════════
// CLASSES — vue arbre style Protégé
// ════════════════════════════════════════════════════════════════

const ClassEditor = {

    _selectedId: null,          // classe sélectionnée dans l'arbre
    _expanded: new Set(),       // IDs des nœuds développés
    _editingId: null,           // ID original de la classe en cours d'édition
    _owlThingSelected: false,   // true quand owl:Thing est sélectionné
    _dragId: null,              // ID de la classe en cours de glisser-déposer

    // ── Icônes SVG partagées (toolbar + menu contextuel) ─────────
    _svgChild:  `<svg viewBox="0 0 18 15" width="16" height="13" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="1" y="1" width="16" height="4.5" rx="1"/>
            <line x1="4" y1="5.5" x2="4" y2="9"/>
            <line x1="4" y1="9"   x2="9" y2="9"/>
            <rect x="9" y="7.5" width="8" height="4.5" rx="1" stroke-dasharray="2.5 1.5"/>
            <line x1="13"   y1="8.8" x2="13"   y2="11.3"/>
            <line x1="11.5" y1="10"  x2="14.5" y2="10"/>
        </svg>`,
    _svgSister: `<svg viewBox="0 0 20 14" width="18" height="13" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="1" y="1.5" width="7" height="5" rx="1"/>
            <line x1="8" y1="4" x2="12" y2="4"/>
            <rect x="12" y="1.5" width="7" height="5" rx="1" stroke-dasharray="2.5 1.5"/>
            <line x1="15.5" y1="9"  x2="15.5" y2="13"/>
            <line x1="13.5" y1="11" x2="17.5" y2="11"/>
        </svg>`,
    _svgDelete: `<svg viewBox="0 0 14 16" width="12" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 4V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V4"/>
            <line x1="1" y1="4" x2="13" y2="4"/>
            <path d="M2.3 4.5 3 13.5a.7.7 0 0 0 .7.5h6.6a.7.7 0 0 0 .7-.5l.7-9"/>
            <line x1="5.5" y1="6.5" x2="5.5" y2="11.5"/>
            <line x1="8.5" y1="6.5" x2="8.5" y2="11.5"/>
        </svg>`,

    // ── Construction de l'arbre ──────────────────────────────────

    buildTree(classes) {
        const allIds = new Set(classes.map(c => c.id));
        const childrenOf = {};
        classes.forEach(c => { childrenOf[c.id] = []; });

        const hasParent = new Set();
        classes.forEach(c => {
            const parents = (c.subClassOf || []).filter(s => typeof s === 'string' && allIds.has(s));
            parents.forEach(p => {
                childrenOf[p].push(c.id);
                hasParent.add(c.id);
            });
        });

        // Tri alphabétique à chaque niveau
        const alpha = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });
        const roots = classes.filter(c => !hasParent.has(c.id)).map(c => c.id).sort(alpha);
        Object.keys(childrenOf).forEach(id => childrenOf[id].sort(alpha));
        return { roots, childrenOf };
    },

    /** Ajoute tous les ancêtres de classId dans _expanded pour déplier l'arbre jusqu'à lui */
    _expandAncestors(classId) {
        const classes = APP.state.classes || [];
        const allIds  = new Set(classes.map(c => c.id));
        const cls     = classes.find(c => c.id === classId);
        if (!cls) return;
        (cls.subClassOf || [])
            .filter(s => typeof s === 'string' && allIds.has(s))
            .forEach(par => { this._expanded.add(par); this._expandAncestors(par); });
    },

    // ── Rendu arbre ──────────────────────────────────────────────

    _renderNode(id, childrenOf, depth) {
        const cls = (APP.state.classes || []).find(c => c.id === id);
        if (!cls) return '';
        const children = childrenOf[id] || [];
        const hasChildren = children.length > 0;
        const label = cls.annotations?.labels?.[0]?.value || '';
        const isSelected = id === this._selectedId;
        const isOpen = this._expanded.has(id);

        return `
        <div class="tree-root-node">
            <div class="tree-item${isSelected ? ' selected' : ''}"
                 style="padding-left:${depth * 16 + 6}px"
                 draggable="true"
                 onclick="ClassEditor.selectClass('${id}')"
                 oncontextmenu="ClassEditor.showContextMenu(event,'${id}')"
                 ondragstart="ClassEditor.onDragStart(event,'${id}')"
                 ondragover="ClassEditor.onDragOver(event,'${id}')"
                 ondragleave="ClassEditor.onDragLeave(event)"
                 ondrop="ClassEditor.onDrop(event,'${id}')"
                 ondragend="ClassEditor.onDragEnd(event)">
                ${hasChildren
                    ? `<span class="tree-toggle${isOpen ? ' open' : ''}"
                             onclick="event.stopPropagation();ClassEditor.toggleNode('${id}')">▶</span>`
                    : `<span class="tree-leaf">◦</span>`}
                <span class="cls-dot tree-cls-dot"></span>
                <span class="tree-label">${id}</span>
            </div>
            <div id="tcn-${id}" style="display:${isOpen ? 'block' : 'none'}">
                ${children.map(cid => this._renderNode(cid, childrenOf, depth + 1)).join('')}
            </div>
        </div>`;
    },

    renderTree(classes) {
        const { roots, childrenOf } = this.buildTree(classes);
        const owlSel = this._owlThingSelected ? ' selected' : '';
        return `
        <div class="tree-root-item${owlSel}"
             onclick="ClassEditor.selectOwlThing()"
             oncontextmenu="ClassEditor.showContextMenu(event,null)"
             ondragover="ClassEditor.onDragOver(event,null)"
             ondragleave="ClassEditor.onDragLeave(event)"
             ondrop="ClassEditor.onDrop(event,null)">
            <span class="tree-toggle open" style="cursor:default">▶</span>
            <span class="cls-dot tree-cls-dot tree-thing-dot"></span>
            <span style="font-size:12px">owl:Thing</span>
        </div>
        ${classes.length
            ? roots.map(id => this._renderNode(id, childrenOf, 1)).join('')
            : '<p class="empty" style="padding:8px 16px;font-size:12px">No classes — create a child class of owl:Thing</p>'
        }`;
    },

    // ── Layout splitté ───────────────────────────────────────────

    renderSplit(classes) {
        const icoAdd = `<svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="4.5" y1="0.5" x2="4.5" y2="8.5"/><line x1="0.5" y1="4.5" x2="8.5" y2="4.5"/></svg>`;
        return `
        <div class="section-split">
            <div class="tree-panel" id="tree-panel">

                <!-- ── Arbre ── -->
                <div class="left-col-top">
                    <div class="tree-panel-header">
                        <h3>Asserted Hierarchy</h3>
                        <div class="tree-actions">
                            <button id="btn-cls-child" class="btn-icon" disabled
                                    onclick="ClassEditor.createChild()"
                                    title="Add child class (subclass)">${this._svgChild}<span>Child</span></button>
                            <button id="btn-cls-sister" class="btn-icon" disabled
                                    onclick="ClassEditor.createSibling()"
                                    title="Add sibling class (same level)">${this._svgSister}<span>Sibling</span></button>
                            <button id="btn-cls-delete" class="btn-icon btn-icon-danger" disabled
                                    onclick="ClassEditor.deleteSelected()"
                                    title="Delete selected class">${this._svgDelete}</button>
                        </div>
                    </div>
                    <div class="tree-scroll" id="class-tree">
                        ${this.renderTree(classes)}
                    </div>
                </div>

                <!-- ── Séparateur redimensionnable ── -->
                <div class="h-resizer"></div>

                <!-- ── Super Classes ── -->
                <div class="left-col-bottom">
                    <div class="tree-panel-header">
                        <h3>Super Classes</h3>
                        <button class="btn-ftool" onclick="ClassEditor.showPicker('cls-super-picker')"
                                title="Add super-class">${icoAdd}</button>
                    </div>
                    <div class="left-col-bottom-body" id="cls-supers-list">
                        <div class="cls-list-empty">— select a class —</div>
                        <select id="cls-super-picker" class="cls-picker" style="display:none"
                                onchange="ClassEditor.addSuperClass(this.value)">
                            <option value="">— choose —</option>
                        </select>
                    </div>
                </div>

            </div>
            <div class="split-handle" id="split-handle"></div>
            <div class="detail-panel" id="class-detail">
                <div class="detail-panel-empty">
                    <span class="cls-dot" style="width:32px;height:32px"></span>
                    <span>Select an existing <strong>Class</strong> or create a new one</span>
                    <button class="btn-primary btn-sm" onclick="ClassEditor.createChild()">＋ Create Class</button>
                </div>
            </div>
        </div>`;
    },

    // ── Sélection et navigation ──────────────────────────────────

    restoreSelection() {
        this._initSplitPane();
        if (this._owlThingSelected) {
            this.selectOwlThing();
        } else if (this._selectedId) {
            this.selectClass(this._selectedId);
        }
    },

    _initSplitPane() {
        const handle = document.getElementById('split-handle');
        const panel  = document.getElementById('tree-panel');
        if (!handle || !panel) return;
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startW = panel.offsetWidth;
            document.body.classList.add('resizing');
            const onMove = (e) => {
                const w = Math.min(520, Math.max(160, startW + e.clientX - startX));
                panel.style.width = w + 'px';
            };
            const onUp = () => {
                document.body.classList.remove('resizing');
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
        // Redimensionnement vertical arbre ↕ super-classes
        _initHResizers('tree-panel');
    },

    /** Met à jour le panneau "Super Classes" dans la colonne gauche */
    _updateSuperPanel(cls) {
        const panel = document.getElementById('cls-supers-list');
        if (!panel) return;
        if (!cls) {
            panel.innerHTML = `
                <div class="cls-list-empty">— select a class —</div>
                <select id="cls-super-picker" class="cls-picker" style="display:none"
                        onchange="ClassEditor.addSuperClass(this.value)">
                    <option value="">— choose —</option>
                </select>`;
            return;
        }
        const icoAdd = `<svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="4.5" y1="0.5" x2="4.5" y2="8.5"/><line x1="0.5" y1="4.5" x2="8.5" y2="4.5"/></svg>`;
        const superClasses = (cls.subClassOf || []).filter(s => typeof s === 'string');
        const superRows = superClasses.map(s => `
            <div class="cls-list-item" data-id="${s}">
                <span class="cls-dot"></span>
                <span class="cls-list-lbl" style="cursor:pointer"
                      onclick="APP.navigateTo('classes','${s}')">${s}</span>
                <button class="btn-frame-del" onclick="ClassEditor.removeSuperClass('${s}')">✕</button>
            </div>`).join('');
        const availSupers = (APP.state.classes || [])
            .filter(c2 => c2.id !== cls.id && !superClasses.includes(c2.id))
            .map(c2 => `<option value="${c2.id}">${c2.id}</option>`).join('');
        panel.innerHTML = `
            ${superRows || '<div class="cls-list-empty">owl:Thing</div>'}
            <select id="cls-super-picker" class="cls-picker" style="display:none"
                    onchange="ClassEditor.addSuperClass(this.value)">
                <option value="">— choose —</option>${availSupers}
            </select>`;
    },

    async selectOwlThing() {
        if (this._editingId !== null) await this._silentSave();
        this._selectedId = null;
        this._owlThingSelected = true;
        // Surbrillance
        document.querySelectorAll('.tree-item, .tree-root-item').forEach(el => el.classList.remove('selected'));
        document.querySelector('.tree-root-item')?.classList.add('selected');
        // Panneau droit
        const detail = document.getElementById('class-detail');
        if (detail) detail.innerHTML = `
            <div class="detail-panel-empty">
                <span class="cls-dot" style="width:32px;height:32px"></span>
                <strong style="font-family:var(--font-mono);font-size:13px">owl:Thing</strong>
                <span style="color:var(--text-dim);font-size:12px">Root of all OWL classes</span>
                <span style="color:var(--text2);font-size:12px">Select an existing <strong>Class</strong> or create a new one</span>
                <button class="btn-primary btn-sm" onclick="ClassEditor.createChild()">＋ Create Class</button>
            </div>`;
        // Super classes panel : vider
        this._updateSuperPanel(null);
        this._updateTreeButtons();
    },

    async selectClass(id) {
        // Sauvegarde silencieuse de la classe courante avant de changer
        if (this._editingId !== null && id !== this._editingId) {
            await this._silentSave();
        }
        this._selectedId = id;
        this._owlThingSelected = false;
        // Surbrillance
        document.querySelectorAll('.tree-item, .tree-root-item').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('.tree-item').forEach(el => {
            if (el.querySelector('.tree-label')?.textContent === id) el.classList.add('selected');
        });
        // Formulaire dans le panneau droit
        const detail = document.getElementById('class-detail');
        if (!detail) return;
        const cls = (APP.state.classes || []).find(c => c.id === id);
        detail.innerHTML = cls ? this.renderForm(cls) : this.renderForm(null);
        _initHResizers('class-detail');
        // Super classes panel : mettre à jour la colonne gauche
        this._updateSuperPanel(cls || null);
        this._updateTreeButtons();
    },

    _updateTreeButtons() {
        const btnSister = document.getElementById('btn-cls-sister');
        const btnChild  = document.getElementById('btn-cls-child');
        const btnDelete = document.getElementById('btn-cls-delete');
        if (!btnSister || !btnChild || !btnDelete) return;

        if (this._owlThingSelected) {
            // owl:Thing sélectionné : seulement "Fille"
            btnSister.disabled = true;
            btnSister.style.visibility = 'hidden';
            btnChild.disabled  = false;
            btnDelete.disabled = true;
            btnDelete.style.visibility = 'hidden';
        } else if (this._selectedId) {
            // Classe ordinaire sélectionnée : tous les boutons actifs
            btnSister.disabled = false;
            btnSister.style.visibility = '';
            btnChild.disabled  = false;
            btnDelete.disabled = false;
            btnDelete.style.visibility = '';
        } else {
            // Rien de sélectionné
            btnSister.disabled = true;
            btnSister.style.visibility = '';
            btnChild.disabled  = true;
            btnDelete.disabled = true;
            btnDelete.style.visibility = '';
        }
    },

    async createSibling() {
        if (!this._selectedId) return;
        const cls = (APP.state.classes || []).find(c => c.id === this._selectedId);
        const parents = cls ? (cls.subClassOf || []).filter(s => typeof s === 'string') : [];
        // Déployer les parents communs pour que la nouvelle sœur soit visible
        parents.forEach(p => this._expanded.add(p));
        await this._createAndSelect(parents);
    },

    async createChild() {
        const parent = this._selectedId; // null si owl:Thing sélectionné
        const parents = parent ? [parent] : [];
        // Déployer le parent pour que la classe fille soit visible dans l'arbre
        if (parent) this._expanded.add(parent);
        await this._createAndSelect(parents);
    },

    _generateClassName() {
        const existing = new Set((APP.state.classes || []).map(c => c.id));
        let name = 'NewClass';
        let i = 1;
        while (existing.has(name)) { name = `NewClass${i++}`; }
        return name;
    },

    async _createAndSelect(subClassOf) {
        const id = this._generateClassName();
        const cls = {
            id,
            annotations: { labels: [], comments: [] },
            subClassOf,
            equivalentClass: [],
            disjointWith: [],
        };
        try {
            await API.createClass(cls);
            this._selectedId = id;
            this._owlThingSelected = false;
            this._editingId = id;
            await APP.refresh();
            APP.renderSection('classes');
        } catch (e) {
            UI.error(e.message);
        }
    },

    async deleteSelected() {
        if (!this._selectedId) return;
        await this.delete(this._selectedId);
    },

    // ── Menu contextuel ──────────────────────────────────────────

    showContextMenu(event, id) {
        event.preventDefault();
        event.stopPropagation();
        // Sélectionner l'élément visé
        if (id) this.selectClass(id);
        else    this.selectOwlThing();
        this._closeContextMenu();

        const isClass = !!id;
        const menu = document.createElement('div');
        menu.id = 'cls-ctx-menu';
        menu.className = 'ctx-menu';
        menu.innerHTML = `
            <div class="ctx-item" onclick="ClassEditor._closeContextMenu();ClassEditor.createChild()">
                ${this._svgChild} Add Child Class</div>
            ${isClass ? `<div class="ctx-item" onclick="ClassEditor._closeContextMenu();ClassEditor.createSibling()">
                ${this._svgSister} Add Sibling Class</div>
            <div class="ctx-sep"></div>
            <div class="ctx-item ctx-danger" onclick="ClassEditor._closeContextMenu();ClassEditor.deleteSelected()">
                ${this._svgDelete} Supprimer</div>` : ''}
        `;
        menu.style.left = event.clientX + 'px';
        menu.style.top  = event.clientY + 'px';
        document.body.appendChild(menu);
        // Ajuster si hors écran
        requestAnimationFrame(() => {
            const r = menu.getBoundingClientRect();
            if (r.right  > window.innerWidth)  menu.style.left = (event.clientX - r.width)  + 'px';
            if (r.bottom > window.innerHeight)  menu.style.top  = (event.clientY - r.height) + 'px';
        });
        // Fermer au prochain clic hors du menu
        const close = (e) => {
            if (!menu.contains(e.target)) {
                this._closeContextMenu();
                document.removeEventListener('click', close, true);
            }
        };
        setTimeout(() => document.addEventListener('click', close, true), 0);
    },

    _closeContextMenu() {
        document.getElementById('cls-ctx-menu')?.remove();
    },

    // ── Drag & Drop ──────────────────────────────────────────────

    onDragStart(event, id) {
        this._dragId = id;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', id);
        // Légère opacité après le début du drag (setTimeout pour ne pas affecter le ghost)
        setTimeout(() => event.target.classList.add('dragging'), 0);
    },

    onDragOver(event, targetId) {
        if (!this._dragId) return;
        if (this._dragId === targetId) return;               // pas sur soi-même
        if (this._isDescendant(targetId, this._dragId)) return; // pas sur un descendant
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        event.currentTarget.classList.add('drag-over');
    },

    onDragLeave(event) {
        event.currentTarget.classList.remove('drag-over');
    },

    async onDrop(event, targetId) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');
        const draggedId = this._dragId;
        this._dragId = null;
        if (!draggedId || draggedId === targetId) return;
        if (this._isDescendant(targetId, draggedId)) {
            UI.warn('Cannot drop on a descendant — would create a cycle');
            return;
        }
        const cls = (APP.state.classes || []).find(c => c.id === draggedId);
        if (!cls) return;
        // Remplace les parents textuels ; conserve les restrictions objet
        const restrictions = (cls.subClassOf || []).filter(s => typeof s === 'object');
        const newParents   = targetId ? [targetId] : [];
        const updated = { ...cls, subClassOf: [...newParents, ...restrictions] };
        // Déployer le nouveau parent pour voir la classe déplacée
        if (targetId) this._expanded.add(targetId);
        this._selectedId = draggedId;
        this._editingId  = draggedId;
        this._owlThingSelected = false;
        try {
            await API.updateClass(draggedId, updated);
            UI.success(`'${draggedId}' moved`);
            await APP.refresh();
            APP.renderSection('classes');
        } catch (e) {
            UI.error(e.message);
        }
    },

    onDragEnd(event) {
        event.target.classList.remove('dragging');
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        this._dragId = null;
    },

    _isDescendant(potentialDesc, ancestorId) {
        if (!potentialDesc || !ancestorId) return false;
        const { childrenOf } = this.buildTree(APP.state.classes || []);
        const visit = (id) => {
            if (id === potentialDesc) return true;
            return (childrenOf[id] || []).some(child => visit(child));
        };
        return visit(ancestorId);
    },

    toggleNode(id) {
        const el = document.getElementById(`tcn-${id}`);
        if (!el) return;
        const isOpen = el.style.display !== 'none';
        el.style.display = isOpen ? 'none' : 'block';
        if (isOpen) this._expanded.delete(id);
        else        this._expanded.add(id);
        // Mettre à jour l'icône toggle
        const toggle = el.previousElementSibling?.querySelector('.tree-toggle');
        if (toggle) toggle.classList.toggle('open', !isOpen);
    },

    openNew() {
        this._selectedId = null;
        this._owlThingSelected = false;
        document.querySelectorAll('.tree-item, .tree-root-item').forEach(el => el.classList.remove('selected'));
        this._updateTreeButtons();
        const detail = document.getElementById('class-detail');
        if (detail) { detail.innerHTML = this.renderForm(null); _initHResizers('class-detail'); }
    },

    // ── Formulaire style Protégé ─────────────────────────────────

    renderForm(cls = null, forceNew = false) {
        const isNew = forceNew || !cls;
        const c = cls || {
            id: '', annotations: { labels: [], comments: [] },
            subClassOf: [], equivalentClass: [], disjointWith: []
        };
        ClassEditor._editingId = isNew ? null : c.id;
        const ac = isNew ? '' : 'onchange="ClassEditor.autoSave()"';

        const superClasses = (c.subClassOf || []).filter(s => typeof s === 'string');
        const restrictions = (c.subClassOf || []).filter(s => typeof s === 'object');
        const labels   = c.annotations?.labels   || [];
        const comments = c.annotations?.comments || [];

        // IRI complète
        const baseIri  = (APP.state.ontology?.id || '').replace(/#$/, '');
        const classIri = (c.id && baseIri) ? `${baseIri}#${c.id}` : '';

        // ── Lignes annotations ──
        const annoRows = [
            ...labels.map(l   => _annoRow('label',   l.value,  l.lang  || 'fr', 'ClassEditor', ac)),
            ...comments.map(cm => _annoRow('comment', cm.value, cm.lang || 'fr', 'ClassEditor', ac)),
            ...(c.annotations?.other || []).map(a => _annoRow('other', a.value, '', 'ClassEditor', ac, a.property)),
        ].join('');

        // ── Liste Superclasses ──
        const superRows = superClasses.map(s => `
            <div class="cls-list-item" data-id="${s}">
                <span class="cls-dot"></span>
                <span class="cls-list-lbl" style="cursor:pointer"
                      onclick="APP.navigateTo('classes','${s}')">${s}</span>
                <button class="btn-frame-del" onclick="ClassEditor.removeSuperClass('${s}')">✕</button>
            </div>`).join('');
        const availSupers = (APP.state.classes || [])
            .filter(c2 => c2.id !== c.id && !superClasses.includes(c2.id))
            .map(c2 => `<option value="${c2.id}">${c2.id}</option>`).join('');

        // ── Liste Disjoints ──
        const disjRows = (c.disjointWith || []).map(d => `
            <div class="cls-list-item" data-id="${d}">
                <span class="cls-dot"></span>
                <span class="cls-list-lbl" style="cursor:pointer"
                      onclick="APP.navigateTo('classes','${d}')">${d}</span>
                <button class="btn-frame-del" onclick="ClassEditor.removeDisjoint('${d}')">✕</button>
            </div>`).join('');
        // Icône ➕ SVG pour les toolbars
        const icoAdd = `<svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="4.5" y1="0.5" x2="4.5" y2="8.5"/><line x1="0.5" y1="4.5" x2="8.5" y2="4.5"/></svg>`;

        return `
        <div class="cls-editor">

            <!-- ── En-tête ───────────────────────────────── -->
            <div class="cls-editor-hdr">
                <div class="cls-editor-title">
                    CLASS EDITOR for&nbsp;
                    <input type="text" id="cls-id" class="cls-id-inp"
                           value="${c.id}" placeholder="NewClass"
                           ${ac} title="Identifiant IRI local">
                    <span class="cls-editor-meta">(instance of owl:Class)</span>
                </div>
                ${classIri ? `<div class="cls-editor-iri">For Class:&nbsp;<code>${classIri}</code></div>` : ''}
                ${isNew ? `<div style="margin-top:8px">
                    <button class="btn-primary btn-sm" onclick="ClassEditor.save(true)">✅ Create class</button>
                </div>` : ''}
            </div>

            <!-- ── Frame : Annotations ────────────────── -->
            <div class="cls-frame">
                <div class="cls-frame-bar">
                    <span class="cls-frame-tag">Annotation(s)</span>
                    <button class="btn-ftool" onclick="ClassEditor.addAnnotRow('label')"   title="Ajouter rdfs:label">${icoAdd}&thinsp;label</button>
                    <button class="btn-ftool" onclick="ClassEditor.addAnnotRow('comment')" title="Ajouter rdfs:comment">${icoAdd}&thinsp;comment</button>
                    <button class="btn-ftool" onclick="_togglePicker('cls-anno-picker')" title="Add annotation property">${icoAdd}&thinsp;Annotation Property</button>
                </div>
                <div class="cls-frame-body">
                    <table class="cls-anno-table">
                        <thead><tr><th>Property</th><th>Value</th><th>Lang</th><th></th></tr></thead>
                        <tbody id="cls-annotations-body">${annoRows}</tbody>
                    </table>
                    <div id="cls-anno-picker" class="cls-tree-picker" style="display:none">
                        ${_annoPickerItems('ClassEditor')}
                    </div>
                </div>
            </div>

            <div class="h-resizer"></div>

            <!-- ── Frame : Properties and Restrictions ── -->
            <div class="cls-frame" style="min-height:110px">
                <div class="cls-frame-bar">
                    <span class="cls-frame-tag cls-frame-tag-blue">Properties and Restrictions</span>
                </div>
                <div class="cls-frame-body" style="padding:0;overflow:visible">
                    ${RestrictionEditor.renderPanel(restrictions, c)}
                </div>
            </div>

            <div class="h-resizer"></div>

            <!-- ── Frame bas : Disjoints ── -->
            <div class="cls-frame">
                <div class="cls-frame-bar">
                    <span class="cls-frame-tag cls-frame-tag-orange">Disjoints</span>
                    <button class="btn-ftool" onclick="ClassEditor.showPicker('cls-disj-picker')" title="Add disjoint class">${icoAdd}</button>
                </div>
                <div class="cls-frame-body" id="cls-disjoints-list">
                    ${disjRows}
                    <div id="cls-disj-picker" class="cls-tree-picker" style="display:none">
                        ${_classTreePickerItems('ClassEditor.addDisjoint', [c.id, ...(c.disjointWith || [])])}
                    </div>
                </div>
            </div>

            ${_whereUsedFrame(r => _ruleUsesClass(r, c.id))}

        </div>`;
    },

    // ── Helpers annotations ──────────────────────────────────────

    addAnnotRow(type) {
        const ac = this._editingId !== null ? 'onchange="ClassEditor.autoSave()"' : '';
        document.getElementById('cls-annotations-body')?.appendChild(
            _makeAnnotRow(type, 'ClassEditor', ac)
        );
    },

    addOtherAnnotRow(prop) {
        const ac = this._editingId !== null ? 'onchange="ClassEditor.autoSave()"' : '';
        document.getElementById('cls-annotations-body')?.appendChild(
            _makeAnnotRow('other', 'ClassEditor', ac, prop)
        );
        document.getElementById('cls-anno-picker').style.display = 'none';
    },

    removeAnnotRow(btn) {
        btn.closest('tr')?.remove();
        if (this._editingId !== null) this.autoSave();
    },

    // ── Helpers superclasses ─────────────────────────────────────

    showPicker(id) {
        const el = document.getElementById(id);
        if (!el) return;
        const visible = el.style.display !== 'none';
        el.style.display = visible ? 'none' : '';
        if (!visible) el.focus();
    },

    addSuperClass(id) {
        if (!id) return;
        const list   = document.getElementById('cls-supers-list');
        const picker = document.getElementById('cls-super-picker');
        if (!list || list.querySelector(`.cls-list-item[data-id="${id}"]`)) return;
        list.querySelector('.cls-list-empty')?.remove();
        const item = document.createElement('div');
        item.className = 'cls-list-item';
        item.dataset.id = id;
        item.innerHTML = `<span class="cls-dot"></span>
            <span class="cls-list-lbl" onclick="ClassEditor.selectClass('${id}')">${id}</span>
            <button class="btn-frame-del" onclick="ClassEditor.removeSuperClass('${id}')">✕</button>`;
        list.insertBefore(item, picker);
        if (picker) { picker.style.display = 'none'; picker.value = ''; }
        if (this._editingId !== null) this.autoSave();
    },

    removeSuperClass(id) {
        document.querySelector(`#cls-supers-list .cls-list-item[data-id="${id}"]`)?.remove();
        const list = document.getElementById('cls-supers-list');
        if (list && !list.querySelector('.cls-list-item')) {
            const ph = document.createElement('div');
            ph.className = 'cls-list-empty';
            ph.textContent = 'owl:Thing';
            list.insertBefore(ph, list.firstChild);
        }
        if (this._editingId !== null) this.autoSave();
    },

    // ── Helpers disjoints ────────────────────────────────────────

    addDisjoint(id) {
        if (!id) return;
        const list   = document.getElementById('cls-disjoints-list');
        const picker = document.getElementById('cls-disj-picker');
        if (!list || list.querySelector(`.cls-list-item[data-id="${id}"]`)) return;
        const item = document.createElement('div');
        item.className = 'cls-list-item';
        item.dataset.id = id;
        item.innerHTML = `<span class="cls-dot"></span>
            <span class="cls-list-lbl">${id}</span>
            <button class="btn-frame-del" onclick="ClassEditor.removeDisjoint('${id}')">✕</button>`;
        list.insertBefore(item, picker);
        if (picker) picker.style.display = 'none';          // div : pas de .value à réinitialiser
        if (this._editingId !== null) this.autoSave();
    },

    removeDisjoint(id) {
        document.querySelector(`#cls-disjoints-list .cls-list-item[data-id="${id}"]`)?.remove();
        if (this._editingId !== null) this.autoSave();
    },

    autoSave() {
        if (this._editingId !== null) this.save(false);
    },

    /** Sauvegarde silencieuse : persiste l'état DOM courant sans re-rendu ni refresh global */
    async _silentSave() {
        const originalId = this._editingId;
        if (originalId === null) return;
        const idEl = document.getElementById('cls-id');
        if (!idEl) return;
        const id = idEl.value.trim();
        if (!id) return;

        const { labels, comments, other } = _collectAnnotations('cls-annotations-body');
        const supers = Array.from(document.querySelectorAll('#cls-supers-list .cls-list-item[data-id]'))
                            .map(el => el.dataset.id).filter(Boolean);
        const disj   = Array.from(document.querySelectorAll('#cls-disjoints-list .cls-list-item[data-id]'))
                            .map(el => el.dataset.id).filter(Boolean);

        const restrictions = RestrictionEditor.collect();

        const cls = {
            id,
            annotations: { labels, comments, other },
            subClassOf:  [...supers, ...restrictions],
            equivalentClass: [],
            disjointWith: disj,
        };
        try {
            await API.updateClass(originalId, cls);
            // Mise à jour en mémoire sans re-rendu
            const idx = (APP.state.classes || []).findIndex(c => c.id === originalId);
            if (idx >= 0) APP.state.classes[idx] = cls;
        } catch (_) { /* fail silently */ }
    },

    openEdit(id) {
        // Compatibilité ascendante (appelé depuis d'autres endroits)
        if (APP.currentSection !== 'classes') APP.renderSection('classes');
        this.selectClass(id);
    },

    // ── Sauvegarde / suppression ─────────────────────────────────

    async save(isNew) {
        const originalId = isNew ? null : this._editingId;
        const id = document.getElementById('cls-id').value.trim();
        if (!id) return UI.error('L\'identifiant est obligatoire');

        // Annotations depuis la table
        const { labels, comments, other } = _collectAnnotations('cls-annotations-body');

        // Superclasses et disjoints depuis les listes
        const supers = Array.from(document.querySelectorAll('#cls-supers-list .cls-list-item[data-id]'))
                            .map(el => el.dataset.id).filter(Boolean);
        const disj   = Array.from(document.querySelectorAll('#cls-disjoints-list .cls-list-item[data-id]'))
                            .map(el => el.dataset.id).filter(Boolean);
        const restrictions = RestrictionEditor.collect();

        const cls = {
            id,
            annotations: { labels, comments, other },
            subClassOf:  [...supers, ...restrictions],
            equivalentClass: [],
            disjointWith: disj,
        };

        try {
            if (isNew) {
                await API.createClass(cls);
                UI.success(`Class '${id}' created`);
                this._selectedId = id;
                this._editingId  = id;
                this._owlThingSelected = false;
                this._expanded.clear();
            } else {
                await API.updateClass(originalId, cls);
                if (id !== originalId) UI.success(`Class renamed → '${id}'`);
                this._selectedId = id;
                this._editingId  = id;
                this._owlThingSelected = false;
            }
            await APP.refresh();
            APP.renderSection('classes');
        } catch (e) {
            UI.error(e.message);
        }
    },

    async delete(id) {
        // Calculer les descendants
        const { childrenOf } = this.buildTree(APP.state.classes || []);
        const descendants = [];
        const collect = (cid) => (childrenOf[cid] || []).forEach(c => { descendants.push(c); collect(c); });
        collect(id);

        // ── Vérification individuals AVANT la confirmation ──────────
        const toDelete   = new Set([id, ...descendants]);
        const blocking   = (APP.state.individuals || []).filter(
            ind => (ind.types || []).some(t => toDelete.has(t))
        );
        if (blocking.length > 0) {
            const names = blocking.slice(0, 3).map(x => `<strong>${x.id}</strong>`).join(', ')
                        + (blocking.length > 3 ? ' …' : '');
            UI.error(
                `Cannot delete <strong>${id}</strong>: `
                + `${blocking.length} individual(s) are of this type — ${names}`
            );
            return;
        }

        const confirmed = await UI.confirm(
            descendants.length > 0
                ? `Delete <strong>${id}</strong> and its ${descendants.length} child class(es)?<br>
                   <small style="color:var(--text-dim)">${descendants.join(', ')}</small>`
                : `Delete class <strong>${id}</strong>?`
        );
        if (!confirmed) return;

        try {
            const result = await API.deleteClass(id);
            const n = (result?.deleted || [id]).length;
            UI.success(`${n} class(es) deleted`);
            this._selectedId  = null;
            this._editingId   = null;
            this._owlThingSelected = false;
            await APP.refresh();
            APP.renderSection('classes');
        } catch (e) {
            UI.error(e.message);
        }
    },
};


// ── Éditeur de restrictions ──────────────────────────────────

const RestrictionEditor = {

    _selectedProp: null,   // propriété sélectionnée dans le tree

    // ── Rendu principal ──────────────────────────────────────────
    renderPanel(restrictions, cls) {
        const ico = `<svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="4.5" y1=".5" x2="4.5" y2="8.5"/><line x1=".5" y1="4.5" x2="8.5" y2="4.5"/></svg>`;
        const alpha = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });

        // ── Section "Asserted" ────────────────────────────────
        const groups  = this._group(restrictions);
        const propIds = Object.keys(groups).sort(alpha);
        const _allProps = [
            ...(APP.state.object_properties   || []),
            ...(APP.state.datatype_properties || []),
        ].sort((a, b) => alpha(a.id, b.id));
        const opIds     = new Set((APP.state.object_properties || []).map(p => p.id));
        const availProps = _allProps
            .filter(p => !propIds.includes(p.id))
            .map(p => {
                const dotCls = opIds.has(p.id) ? 'op-prop-dot' : 'dp-prop-dot';
                return `<div class="tree-item restr-prop-item" data-id="${p.id}"
                    style="padding:3px 8px" onclick="RestrictionEditor.addProperty('${p.id}')">
                    <span class="${dotCls}" style="flex-shrink:0"></span>
                    <span class="tree-label" style="margin-left:4px">${p.id}</span>
                </div>`;
            }).join('');

        // ── Section "Inherited" ───────────────────────────────
        const inherited  = cls ? this._computeInherited(cls) : [];
        const inhGroups  = this._group(inherited);
        const inhPropIds = Object.keys(inhGroups).sort(alpha);

        const toggleFn = `const b=this.nextElementSibling;const t=this.querySelector('.restr-stoggle');const o=b.style.display!=='none';b.style.display=o?'none':'';t.style.transform=o?'rotate(0deg)':'rotate(90deg)'`;

        return `
        <div class="restr-panel">

            <!-- ── Inherited Properties ──────────────────── -->
            <div class="restr-section-hdr" onclick="${toggleFn}">
                <span class="restr-stoggle" style="transform:rotate(90deg)">▶</span>
                Inherited Properties
                <span style="font-weight:400;color:var(--text-dim);margin-left:3px">(${inhPropIds.length})</span>
            </div>
            <div class="restr-section-body">
                <div class="restr-tree">
                ${inhPropIds.length
                    ? inhPropIds.map(p => this._renderGroupReadOnly(p, inhGroups[p])).join('')
                    : '<div class="cls-list-empty" style="padding:4px 8px;font-size:11px;font-style:italic">—</div>'}
                </div>
            </div>

            <!-- ── Asserted Properties ───────────────────── -->
            <div class="restr-section-hdr" onclick="${toggleFn}">
                <span class="restr-stoggle" style="transform:rotate(90deg)">▶</span>
                Asserted Properties
                <span style="font-weight:400;color:var(--text-dim);margin-left:3px">(${propIds.length})</span>
                <button class="btn-ftool" style="margin-left:auto;flex-shrink:0"
                        onclick="event.stopPropagation();RestrictionEditor.showPropPicker()">
                    ${ico}&thinsp;property</button>
            </div>
            <div class="restr-section-body">
                <div id="restr-prop-picker" class="cls-tree-picker" style="display:none;margin:2px 4px 4px">
                    ${availProps || '<div class="cls-list-empty" style="padding:4px 8px;font-size:11px">—</div>'}
                </div>
                <div class="restr-tree" id="restr-tree">
                    ${propIds.length
                        ? propIds.map(p => this._renderGroup(p, groups[p])).join('')
                        : '<div class="cls-list-empty" style="padding:6px 8px;font-size:11px;font-style:italic">No asserted properties</div>'}
                </div>
            </div>

        </div>`;
    },

    // ── Calcul des propriétés héritées (traversée récursive) ─────
    _computeInherited(cls) {
        const classes = APP.state.classes || [];
        const visited = new Set([cls.id]);
        const result  = [];

        const collect = (clsId) => {
            if (visited.has(clsId)) return;
            visited.add(clsId);
            const c = classes.find(x => x.id === clsId);
            if (!c) return;
            (c.subClassOf || []).forEach(expr => {
                if (typeof expr === 'object') {
                    // _marker inclus : propriété sans restriction héritée aussi
                    result.push({ ...expr, _fromClass: clsId });
                } else if (typeof expr === 'string') {
                    collect(expr);   // remonter la hiérarchie
                }
            });
        };

        (cls.subClassOf || []).filter(s => typeof s === 'string').forEach(s => collect(s));
        return result;
    },

    // ── Groupe propriété en lecture seule (héritage) ─────────────
    _renderGroupReadOnly(prop, restrictions) {
        const isOP   = (APP.state.object_properties  || []).some(p => p.id === prop);
        const isDP   = (APP.state.datatype_properties || []).some(p => p.id === prop);
        const isAnno = !isOP && !isDP;
        const dotCls     = isOP ? 'op-prop-dot' : isAnno ? 'anno-prop-dot' : 'dp-prop-dot';
        const navSection = isOP ? 'object-properties' : isDP ? 'datatype-properties' : null;
        const visible = restrictions.filter(r => r.type !== '_marker');

        // Tag de provenance — affiché dans le header, pas dans les lignes enfants
        const fromClasses = [...new Set(restrictions.map(r => r._fromClass).filter(Boolean))];
        const fromTag = fromClasses.length
            ? `<span class="restr-prop-summary">(↑ ${fromClasses.join(', ')})</span>`
            : '';

        // Lignes enfants read-only — sans tag ↑ (déjà dans le header)
        const childRows = visible.map(r => {
            const isCard = (r.type || '').includes('Cardinality');
            let valueHtml = '';
            if (isCard) {
                valueHtml = `
                    <span class="tree-leaf" style="margin:0 2px">◦</span>
                    <span style="display:inline-block;width:40px;text-align:center;
                                 font-size:12px;color:var(--text)">${r.cardinality ?? ''}</span>`;
            } else {
                const fv = r.filler || r.value || '';
                if (fv) {
                    const isFillerClass = (APP.state.classes || []).some(c => c.id === fv);
                    const navAttr = isFillerClass
                        ? `style="color:var(--text);cursor:pointer"
                           onclick="APP.navigateTo('classes','${fv}')"
                           onmouseover="this.style.textDecoration='underline';this.style.color='var(--accent,#5f8dd3)'"
                           onmouseout="this.style.textDecoration='';this.style.color='var(--text)'"`
                        : `style="color:var(--text)"`;
                    valueHtml = `
                    <div style="display:inline-flex;align-items:center;gap:3px;
                                background:var(--bg3);border:1px solid var(--border);
                                border-radius:4px;padding:1px 4px;font-size:12px">
                        <span class="tree-leaf">◦</span>
                        <span class="cls-dot tree-cls-dot"></span>
                        <span ${navAttr}>${fv}</span>
                    </div>`;
                }
            }
            return `
            <div style="display:flex;align-items:center;gap:3px;padding:1px 4px;font-size:12px;color:var(--text2)">
                <span style="width:20px;flex-shrink:0"></span>
                <span style="opacity:.6;font-size:10px">◈</span>
                <span style="color:var(--text-dim);font-size:10px;flex-shrink:0">${r.type || ''}</span>
                ${valueHtml}
            </div>`;
        }).join('');

        return `
        <div class="restr-group-ro">
            <div class="tree-item restr-prop-row-ro" style="padding-left:4px;cursor:default">
                <span class="${dotCls}"></span>
                <span class="restr-prop-name" style="cursor:pointer"
                      onclick="APP.navigateTo('${navSection}','${prop}')">${prop}</span>
                ${fromTag}
            </div>
            ${childRows}
        </div>`;
    },

    _group(restrictions) {
        const g = {};
        (restrictions || []).forEach(r => {
            if (!r.property) return;
            if (!g[r.property]) g[r.property] = [];
            g[r.property].push(r);
        });
        return g;
    },

    _desc(r) {
        let d = r.type || '';
        if (r.filler)   d += ` ${r.filler}`;
        if (r.value  !== undefined) d += ` ${r.value}`;
        if (r.cardinality !== undefined) d += ` ${r.cardinality}`;
        return d;
    },

    // ── Rendu d'un groupe propriété ──────────────────────────────
    _renderGroup(prop, restrictions) {
        const isSel  = prop === this._selectedProp;
        // Filtrer les marqueurs de présence (_marker) — invisibles pour l'utilisateur
        const visible = restrictions.filter(r => r.type !== '_marker');
        const summary = visible.map(r => this._desc(r)).join(', ');

        // ── Chip multiplicity (single/multiple) basé sur range + functional ──
        const opData = (APP.state.object_properties  || []).find(p => p.id === prop);
        const dpData = (APP.state.datatype_properties || []).find(p => p.id === prop);
        const isOP   = !!opData;
        const isDP   = !!dpData;
        const isAnno = !isOP && !isDP;
        const dotCls     = isOP ? 'op-prop-dot' : isAnno ? 'anno-prop-dot' : 'dp-prop-dot';
        const navSection = isOP ? 'object-properties' : isDP ? 'datatype-properties' : null;

        let rangeChip = '';
        if (opData && opData.range && opData.range.length > 0) {
            const mult   = opData.characteristics?.functional ? 'single' : 'multiple';
            const ranges = opData.range.join(' or ');
            rangeChip = `<span class="restr-range-chip">(${mult} ${ranges})</span>`;
        } else if (dpData && dpData.range && dpData.range.length > 0) {
            const mult   = dpData.functional ? 'single' : 'multiple';
            const ranges = dpData.range.join(' or ');
            rangeChip = `<span class="restr-range-chip">(${mult} ${ranges})</span>`;
        }

        return `
        <div class="restr-prop-group" data-prop="${prop}">
            <div class="tree-item restr-prop-row${isSel ? ' selected' : ''}"
                 style="padding-left:4px"
                 oncontextmenu="RestrictionEditor.showContextMenu(event,'${prop}')"
                 onclick="RestrictionEditor.selectProp('${prop}')">
                <span class="${dotCls}"></span>
                <span class="restr-prop-name" style="cursor:pointer"
                      onclick="event.stopPropagation();APP.navigateTo('${navSection}','${prop}')">${prop}</span>
                ${rangeChip}
                ${summary ? `<span class="restr-prop-summary">(${summary})</span>` : ''}
                <button class="btn-frame-del" style="margin-left:auto"
                        onclick="event.stopPropagation();RestrictionEditor.deleteProp('${prop}')">✕</button>
            </div>
            <div class="restr-children">
                ${visible.map((r, i) => this._renderChild(prop, r, i)).join('')}
            </div>
        </div>`;
    },

    // ── Rendu d'un enfant restriction ────────────────────────────
    _renderChild(prop, r, li) {
        const gid        = `${prop}__${li}`;
        const types      = ['someValuesFrom','allValuesFrom','hasValue','exactCardinality','minCardinality','maxCardinality'];
        const isCard     = (r.type || '').includes('Cardinality');
        const fv         = r.filler || r.value || '';
        const isNavClass = fv && (APP.state.classes || []).some(c => c.id === fv);
        const racCard    = 'onchange="if(ClassEditor._editingId!==null)ClassEditor.autoSave()"';
        return `
        <div class="restr-child-row" id="restr-child-${gid}" data-prop="${prop}" data-li="${li}">
            <span style="width:20px;flex-shrink:0"></span>
            <span class="restr-child-icon">◈</span>
            <select class="restr-type-sel" onchange="RestrictionEditor.onChildType('${gid}')">
                ${types.map(t => `<option value="${t}" ${t === r.type ? 'selected':''}>${t}</option>`).join('')}
            </select>
            <div class="restr-filler-wrap" id="restr-filler-${gid}" style="display:${isCard ? 'none' : ''}">
                <div class="tree-item restr-filler-btn" style="margin:0;padding:2px 4px"
                     onclick="RestrictionEditor.toggleFillerPicker('${gid}')">
                    <span class="tree-leaf">◦</span>
                    ${fv ? '<span class="cls-dot tree-cls-dot"></span>' : '<span class="restr-filler-ph"></span>'}
                    <span class="restr-filler-lbl" style="flex:0 1 auto"
                        ${isNavClass ? `
                            onclick="event.stopPropagation();APP.navigateTo('classes','${fv}')"
                            onmouseover="this.style.textDecoration='underline';this.style.color='var(--accent,#5f8dd3)';this.style.cursor='pointer'"
                            onmouseout="this.style.textDecoration='';this.style.color=''"
                        ` : ''}
                    >${fv || '— classe —'}</span>
                    <button class="btn-frame-del restr-filler-clear" style="flex-shrink:0"
                        onclick="event.stopPropagation();RestrictionEditor.deleteChild('${gid}')">✕</button>
                    <span style="flex:1"></span>
                </div>
                <div class="restr-filler-dropdown" style="display:none">
                    ${_classHierarchyItems(gid, fv)}
                </div>
                <input type="hidden" class="restr-filler-val" value="${fv}">
            </div>
            <span class="tree-leaf" style="display:${isCard ? 'inline' : 'none'}">◦</span>
            <input class="restr-card-inp" type="text" inputmode="numeric" pattern="[0-9]*" placeholder="n"
                   value="${r.cardinality ?? ''}"
                   style="width:40px;display:${isCard ? 'inline' : 'none'};padding:0 3px;height:20px;box-sizing:border-box;line-height:18px;text-align:center" ${racCard}>
            ${isCard ? `<button class="btn-frame-del"
                    onclick="RestrictionEditor.deleteChild('${gid}')">✕</button>` : ''}
        </div>`;
    },

    // ── Actions toolbar ──────────────────────────────────────────
    showPropPicker() {
        const el = document.getElementById('restr-prop-picker');
        if (!el) return;
        const v = el.style.display !== 'none';
        el.style.display = v ? 'none' : '';
        if (!v) el.focus();
    },

    addProperty(propId) {
        if (!propId) return;
        const picker = document.getElementById('restr-prop-picker');
        if (picker) {
            picker.style.display = 'none';
            // Retirer l'item du picker (propriété déjà dans le panel)
            picker.querySelector(`.restr-prop-item[data-id="${propId}"]`)?.remove();
        }
        if (document.querySelector(`.restr-prop-group[data-prop="${propId}"]`)) {
            this.selectProp(propId); return;
        }
        const tree = document.getElementById('restr-tree');
        if (!tree) return;
        tree.querySelector('.cls-list-empty')?.remove();
        const div = document.createElement('div');
        div.innerHTML = this._renderGroup(propId, []);
        const newGroup = div.firstElementChild;
        // Insertion en ordre alphabétique
        const existing = Array.from(tree.querySelectorAll('.restr-prop-group'));
        const after = existing.find(el =>
            el.dataset.prop.localeCompare(propId, undefined, { sensitivity: 'base' }) > 0);
        after ? tree.insertBefore(newGroup, after) : tree.appendChild(newGroup);
        this.selectProp(propId);
        if (ClassEditor._editingId !== null) ClassEditor.autoSave();
    },

    addRestriction() {
        if (!this._selectedProp) return;
        const childrenEl = document.querySelector(
            `.restr-prop-group[data-prop="${this._selectedProp}"] .restr-children`);
        if (!childrenEl) return;
        const li = childrenEl.querySelectorAll('.restr-child-row').length;
        const div = document.createElement('div');
        div.innerHTML = this._renderChild(
            this._selectedProp, { type: 'someValuesFrom', filler: '' }, li);
        childrenEl.appendChild(div.firstElementChild);
    },

    selectProp(prop) {
        this._selectedProp = prop;
        document.querySelectorAll('.restr-prop-row').forEach(el =>
            el.classList.toggle('selected',
                el.closest('.restr-prop-group')?.dataset.prop === prop));
    },

    showContextMenu(event, prop) {
        event.preventDefault();
        event.stopPropagation();
        this._closeContextMenu();
        this.selectProp(prop);

        const types = [
            { id: 'someValuesFrom',   label: '∃ someValuesFrom' },
            { id: 'allValuesFrom',    label: '∀ allValuesFrom' },
            { id: 'hasValue',         label: '∋ hasValue' },
            { id: 'exactCardinality', label: '= exactCardinality' },
            { id: 'minCardinality',   label: '≥ minCardinality' },
            { id: 'maxCardinality',   label: '≤ maxCardinality' },
        ];

        const menu = document.createElement('div');
        menu.id = 'restr-ctx-menu';
        menu.className = 'ctx-menu';
        menu.style.left = event.clientX + 'px';
        menu.style.top  = event.clientY + 'px';
        menu.innerHTML =
            `<div style="font-size:10px;color:var(--text-dim);padding:3px 16px 4px;letter-spacing:.04em;text-transform:uppercase">Add restriction</div>` +
            `<div class="ctx-sep"></div>` +
            types.map(t =>
                `<div class="ctx-item" onclick="RestrictionEditor.addRestrictionOfType('${t.id}')">${t.label}</div>`
            ).join('');
        document.body.appendChild(menu);

        setTimeout(() => {
            document.addEventListener('click', function close() {
                RestrictionEditor._closeContextMenu();
                document.removeEventListener('click', close);
            });
        }, 0);
    },

    _closeContextMenu() {
        document.getElementById('restr-ctx-menu')?.remove();
    },

    addRestrictionOfType(type) {
        this._closeContextMenu();
        if (!this._selectedProp) return;
        const childrenEl = document.querySelector(
            `.restr-prop-group[data-prop="${this._selectedProp}"] .restr-children`);
        if (!childrenEl) return;
        const li = childrenEl.querySelectorAll('.restr-child-row').length;
        const div = document.createElement('div');
        div.innerHTML = this._renderChild(
            this._selectedProp, { type, filler: '' }, li);
        childrenEl.appendChild(div.firstElementChild);
    },

    deleteProp(prop) {
        document.querySelector(`.restr-prop-group[data-prop="${prop}"]`)?.remove();
        if (this._selectedProp === prop) this._selectedProp = null;
        // Remettre la propriété dans le picker avec son icône, en ordre alphabétique
        const picker = document.getElementById('restr-prop-picker');
        if (picker && !picker.querySelector(`.restr-prop-item[data-id="${prop}"]`)) {
            const isOP  = (APP.state.object_properties || []).some(p => p.id === prop);
            const dotCls = isOP ? 'op-prop-dot' : 'dp-prop-dot';
            const item  = document.createElement('div');
            item.className  = 'tree-item restr-prop-item';
            item.dataset.id = prop;
            item.style.padding = '3px 8px';
            item.innerHTML = `<span class="${dotCls}" style="flex-shrink:0"></span>
                <span class="tree-label" style="margin-left:4px">${prop}</span>`;
            item.onclick = () => RestrictionEditor.addProperty(prop);
            // Insertion en ordre alphabétique parmi les items existants
            const items = Array.from(picker.querySelectorAll('.restr-prop-item'));
            const after = items.find(el =>
                el.dataset.id.localeCompare(prop, undefined, { sensitivity: 'base' }) > 0);
            after ? picker.insertBefore(item, after) : picker.appendChild(item);
        }
        if (ClassEditor._editingId !== null) ClassEditor.autoSave();
    },

    deleteChild(gid) {
        document.getElementById(`restr-child-${gid}`)?.remove();
        if (ClassEditor._editingId !== null) ClassEditor.autoSave();
    },

    onChildType(gid) {
        const row  = document.getElementById(`restr-child-${gid}`);
        if (!row) return;
        const type   = row.querySelector('.restr-type-sel')?.value;
        const isCard = type?.includes('Cardinality');
        const card   = row.querySelector('.restr-card-inp');
        const filler = document.getElementById(`restr-filler-${gid}`);
        if (card)   card.style.display   = isCard ? 'inline' : 'none';
        if (filler) filler.style.display = isCard ? 'none'   : '';
        // Afficher/masquer le ◦ devant le champ de cardinalité
        const cardDot = card?.previousElementSibling;
        if (cardDot?.classList.contains('tree-leaf')) cardDot.style.display = isCard ? 'inline' : 'none';
        // Fermer le dropdown si on bascule vers cardinalité
        if (isCard) row.querySelector('.restr-filler-dropdown') && (row.querySelector('.restr-filler-dropdown').style.display = 'none');
    },

    // ── Filler picker (position fixed, flotte par-dessus) ────────
    toggleFillerPicker(gid) {
        const wrap = document.getElementById(`restr-filler-${gid}`);
        if (!wrap) return;
        const dd = wrap.querySelector('.restr-filler-dropdown');
        const isOpen = dd.style.display !== 'none';
        document.querySelectorAll('.restr-filler-dropdown').forEach(el => el.style.display = 'none');
        if (!isOpen) {
            const trigger = wrap.querySelector('.restr-filler-btn');
            const rect    = trigger.getBoundingClientRect();
            dd.style.position = 'fixed';
            dd.style.top      = (rect.bottom + 2) + 'px';
            dd.style.left     = rect.left + 'px';
            dd.style.right    = 'auto';
            dd.style.minWidth = Math.max(rect.width, 160) + 'px';
            dd.style.display  = 'block';
            setTimeout(() => document.addEventListener('click', function close(e) {
                if (!wrap.contains(e.target) && !dd.contains(e.target)) {
                    dd.style.display = 'none';
                    document.removeEventListener('click', close, true);
                }
            }, true), 0);
        }
    },

    selectFiller(gid, id) {
        const wrap = document.getElementById(`restr-filler-${gid}`);
        if (!wrap) return;
        wrap.querySelector('.restr-filler-val').value = id;
        const lbl = wrap.querySelector('.restr-filler-lbl');
        lbl.textContent = id || '— classe —';
        lbl.style.flex = '0 1 auto';
        const btn = wrap.querySelector('.restr-filler-btn');
        // Mettre à jour le dot
        const old = btn.querySelector('.cls-dot, .restr-filler-ph');
        if (old) old.remove();
        const dot = document.createElement('span');
        dot.className = id ? 'cls-dot tree-cls-dot' : 'restr-filler-ph';
        const leaf = btn.querySelector('.tree-leaf');
        leaf ? leaf.after(dot) : btn.insertBefore(dot, btn.firstChild);
        wrap.querySelectorAll('.tree-item').forEach(item =>
            item.classList.toggle('selected', item.dataset.id === id));
        wrap.querySelector('.restr-filler-dropdown').style.display = 'none';
        if (ClassEditor._editingId !== null) ClassEditor.autoSave();
    },

    // ── Collecte pour la sauvegarde ──────────────────────────────
    collect() {
        const result = [];
        document.querySelectorAll('#restr-tree .restr-prop-group').forEach(group => {
            const prop = group.dataset.prop;
            const rows = group.querySelectorAll('.restr-child-row');
            if (rows.length === 0) {
                // Groupe vide → marqueur de présence (persisté en JSON, ignoré en RDF)
                result.push({ type: '_marker', property: prop });
                return;
            }
            rows.forEach(row => {
                const type = row.querySelector('.restr-type-sel')?.value;
                const fill = row.querySelector('.restr-filler-val')?.value || '';
                const card = parseInt(row.querySelector('.restr-card-inp')?.value);
                if (!type || !prop) return;
                if (type.includes('Cardinality')) {
                    const r = { type, property: prop, cardinality: isNaN(card) ? 0 : card };
                    if (fill) r.filler = fill;
                    result.push(r);
                } else if (type === 'hasValue') {
                    result.push({ type, property: prop, value: fill || null });
                } else {
                    result.push({ type, property: prop, filler: fill || null });
                }
            });
        });
        return result;
    },
};


// ════════════════════════════════════════════════════════════════
// HELPERS PARTAGÉS  (Annotations, Listes, Pickers)
// Utilisés par OPEditor et DPEditor
// ════════════════════════════════════════════════════════════════

/** HTML d'une ligne d'annotation (pour rendu initial).
 *  type = 'label' | 'comment' | 'other'
 *  prop : requis si type === 'other' (ex: 'rdfs:seeAlso') */
function _annoRow(type, value, lang, editor, ac, prop = null) {
    let propLabel, langCell, dataProp;
    if (type === 'other') {
        propLabel = `<span class="anno-prop-dot"></span> ${prop}`;
        langCell  = '';
        dataProp  = ` data-prop="${prop}"`;
    } else {
        const propName = type === 'label' ? 'rdfs:label' : 'rdfs:comment';
        propLabel = `<span class="anno-prop-dot"></span> ${propName}`;
        langCell  = `<input type="text" class="anno-lang-inp" value="${lang||'fr'}" ${ac}>`;
        dataProp  = '';
    }
    return `<tr class="anno-row" data-type="${type}"${dataProp}>
        <td class="anno-prop">${propLabel}</td>
        <td class="anno-val"><input type="text" class="anno-value" value="${(value||'').replace(/"/g,'&quot;')}" ${ac}></td>
        <td class="anno-lang-cell">${langCell}</td>
        <td><button class="btn-frame-del" onclick="${editor}.removeAnnotRow(this)">✕</button></td>
    </tr>`;
}

/** Élément TR annotation (DOM) pour insertion dynamique.
 *  type = 'label' | 'comment' | 'other'
 *  propId : requis si type === 'other' */
function _makeAnnotRow(type, editor, ac, propId = null) {
    let propLabel, langHtml;
    if (type === 'other') {
        propLabel = `<span class="anno-prop-dot"></span> ${propId}`;
        langHtml  = '';
    } else {
        const propName = type === 'label' ? 'rdfs:label' : 'rdfs:comment';
        propLabel = `<span class="anno-prop-dot"></span> ${propName}`;
        langHtml  = `<input type="text" class="anno-lang-inp" value="fr" ${ac}>`;
    }
    const tr = document.createElement('tr');
    tr.className = 'anno-row';
    tr.dataset.type = type;
    if (type === 'other' && propId) tr.dataset.prop = propId;
    tr.innerHTML = `
        <td class="anno-prop">${propLabel}</td>
        <td class="anno-val"><input type="text" class="anno-value" placeholder="" ${ac}></td>
        <td class="anno-lang-cell">${langHtml}</td>
        <td><button class="btn-frame-del" onclick="${editor}.removeAnnotRow(this)">✕</button></td>`;
    return tr;
}

/** HTML des items d'une liste (propriétés/classes/XSD) */
/** Retourne true si la classe classId est référencée dans une règle SWORD (récursif) */
function _ruleUsesClass(rule, classId) {
    const search = (atom) => {
        if (!atom) return false;
        if (Array.isArray(atom)) return atom.some(search);
        switch (atom.type) {
            case 'type_atom':   return atom.class_id === classId;
            case 'naf_block':   return (atom.atoms || []).some(search);
            case 'conditional': return search(atom.condition) || search(atom.consequent);
            default:            return false;
        }
    };
    return [...(rule.body || []), ...(rule.head || [])].some(search);
}

/** Retourne true si la propriété propId est référencée dans une règle SWORD (récursif) */
function _ruleUsesProperty(rule, propId) {
    const search = (atom) => {
        if (!atom) return false;
        if (Array.isArray(atom)) return atom.some(search);
        switch (atom.type) {
            case 'property_atom': return atom.property_id === propId;
            case 'naf_block':     return (atom.atoms || []).some(search);
            case 'conditional':   return search(atom.condition) || search(atom.consequent);
            default:              return false;
        }
    };
    return [...(rule.body || []), ...(rule.head || [])].some(search);
}

/** Génère la frame "Where Used in Rules" pour un élément donné.
 *  @param {Function} testFn  (rule) => boolean — retourne true si la règle référence l'élément */
function _whereUsedFrame(testFn) {
    const used = (APP.state.sword_rules || []).filter(testFn);
    if (!used.length) return '';
    const rows = used.map(r => `
        <div class="cls-list-item" style="cursor:default">
            <span style="font-size:11px;flex-shrink:0">⚙️</span>
            <span class="cls-list-lbl" style="cursor:pointer"
                  onclick="APP.navigateTo('sword-rules','${r.id}')"
                  onmouseover="this.style.textDecoration='underline';this.style.color='var(--accent,#5f8dd3)'"
                  onmouseout="this.style.textDecoration='';this.style.color=''">${r.id}</span>
            ${r.label ? `<span class="restr-prop-summary" style="margin-left:4px">${r.label}</span>` : ''}
        </div>`).join('');
    return `<div class="h-resizer"></div>
        <div class="cls-frame">
            <div class="cls-frame-bar">
                <span class="cls-frame-tag" style="color:var(--accent)">Where Used in Rules</span>
                <span class="nav-count" style="margin-left:6px">${used.length}</span>
            </div>
            <div class="cls-frame-body">${rows}</div>
        </div>`;
}

function _listRows(items, listId, removeFunc, dotClass = 'cls-dot', dotStyle = '', iconText = '', navSection = null) {
    return items.map(id => {
        const icon = iconText
            ? `<span class="${dotClass}">${iconText}</span>`
            : `<span class="${dotClass}"${dotStyle ? ` style="${dotStyle}"` : ''}></span>`;
        const nav = navSection
            ? ` onclick="APP.navigateTo('${navSection}','${id}')" style="cursor:pointer"`
            : '';
        return `<div class="cls-list-item" data-id="${id}">
            ${icon}
            <span class="cls-list-lbl"${nav}>${id}</span>
            <button class="btn-frame-del" onclick="${removeFunc}('${id}')">✕</button>
        </div>`;
    }).join('');
}

/** Ajoute un item dans une liste (DOM) et masque le picker */
function _addListItem(id, listId, pickerId, removeFunc, dotClass = 'cls-dot', dotStyle = '', iconText = '', navSection = null) {
    if (!id) return;
    const list   = document.getElementById(listId);
    const picker = document.getElementById(pickerId);
    if (!list || list.querySelector(`.cls-list-item[data-id="${id}"]`)) return;
    list.querySelector('.cls-list-empty')?.remove();
    const item = document.createElement('div');
    item.className = 'cls-list-item';
    item.dataset.id = id;
    const icon = iconText
        ? `<span class="${dotClass}">${iconText}</span>`
        : `<span class="${dotClass}"${dotStyle ? ` style="${dotStyle}"` : ''}></span>`;
    item.innerHTML = `${icon}
        <span class="cls-list-lbl">${id}</span>
        <button class="btn-frame-del" onclick="${removeFunc}('${id}')">✕</button>`;
    if (navSection) {
        const lbl = item.querySelector('.cls-list-lbl');
        if (lbl) { lbl.style.cursor = 'pointer'; lbl.onclick = () => APP.navigateTo(navSection, id); }
    }
    list.insertBefore(item, picker || null);
    if (picker) {
        picker.style.display = 'none';
        if (picker.tagName === 'SELECT') picker.value = '';
    }
}

/** Supprime un item d'une liste par data-id, avec placeholder optionnel */
function _removeListItem(id, listId, placeholder = '') {
    document.querySelector(`#${listId} .cls-list-item[data-id="${id}"]`)?.remove();
    if (placeholder) {
        const list = document.getElementById(listId);
        if (list && !list.querySelector('.cls-list-item[data-id]')) {
            const ph = document.createElement('div');
            ph.className = 'cls-list-empty';
            ph.textContent = placeholder;
            list.insertBefore(ph, list.firstChild);
        }
    }
}

/** Bascule la visibilité d'un picker select */
function _togglePicker(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const visible = el.style.display !== 'none';
    el.style.display = visible ? 'none' : '';
    if (!visible) el.focus();
}

/** Collecte les annotations depuis un tbody (label, comment et autres) */
function _collectAnnotations(tbodyId) {
    const labels = [], comments = [], other = [];
    document.querySelectorAll(`#${tbodyId} .anno-row`).forEach(row => {
        const value = row.querySelector('.anno-value')?.value.trim() || '';
        const lang  = row.querySelector('.anno-lang-inp')?.value.trim() || 'fr';
        if (!value) return;
        if (row.dataset.type === 'label')   labels.push({ value, lang });
        if (row.dataset.type === 'comment') comments.push({ value, lang });
        if (row.dataset.type === 'other')   other.push({ property: row.dataset.prop, value });
    });
    return { labels, comments, other };
}

/** Items HTML du picker d'annotation properties (les 7 "other") */
function _annoPickerItems(editorName) {
    return OTHER_ANNO_PROPS.map(p =>
        `<div class="tree-item" style="padding:3px 8px"
              onclick="${editorName}.addOtherAnnotRow('${p}')">
            <span class="anno-prop-dot" style="margin-right:4px"></span>
            <span class="tree-label" style="font-size:12px;color:var(--text2);font-family:var(--font-mono)">${p}</span>
        </div>`
    ).join('');
}

/** Collecte les data-id depuis une liste */
function _collectList(listId) {
    return Array.from(document.querySelectorAll(`#${listId} .cls-list-item[data-id]`))
        .map(el => el.dataset.id).filter(Boolean);
}


/**
 * Active les séparateurs horizontaux redimensionnables (.h-resizer)
 * situés dans le conteneur identifié par `containerId`.
 * Le drag redistribue proportionnellement les hauteurs des frames
 * adjacents (prev + next = total constant).
 */
function _initHResizers(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll('.h-resizer').forEach(handle => {
        handle.addEventListener('mousedown', e => {
            e.preventDefault();
            const prev = handle.previousElementSibling;
            const next = handle.nextElementSibling;
            if (!prev || !next) return;

            const startY = e.clientY;
            const prevH  = prev.getBoundingClientRect().height;
            const nextH  = next.getBoundingClientRect().height;
            const total  = prevH + nextH;
            const MIN    = 50;

            handle.classList.add('h-active');
            document.body.classList.add('h-resizing');

            const onMove = ev => {
                const dy      = ev.clientY - startY;
                const newPrev = Math.max(MIN, Math.min(total - MIN, prevH + dy));
                const newNext = total - newPrev;
                prev.style.height    = newPrev + 'px';
                prev.style.minHeight = newPrev + 'px';
                prev.style.maxHeight = newPrev + 'px';
                next.style.height    = newNext + 'px';
                next.style.minHeight = newNext + 'px';
                next.style.maxHeight = newNext + 'px';
            };

            const onUp = () => {
                handle.classList.remove('h-active');
                document.body.classList.remove('h-resizing');
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup',  onUp);
            };

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup',   onUp);
        });
    });
}


// ════════════════════════════════════════════════════════════════
// OBJECT PROPERTIES
// ════════════════════════════════════════════════════════════════

const OPEditor = {

    _selectedId: null,
    _editingId:  null,
    _expanded: new Set(),
    _topPropSelected: false,
    _dragId: null,

    _svgChild:  `<svg viewBox="0 0 18 15" width="16" height="13" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="1" y="1" width="16" height="4.5" rx="1"/>
            <line x1="4" y1="5.5" x2="4" y2="9"/>
            <line x1="4" y1="9"   x2="9" y2="9"/>
            <rect x="9" y="7.5" width="8" height="4.5" rx="1" stroke-dasharray="2.5 1.5"/>
            <line x1="13"   y1="8.8" x2="13"   y2="11.3"/>
            <line x1="11.5" y1="10"  x2="14.5" y2="10"/>
        </svg>`,
    _svgSister: `<svg viewBox="0 0 20 14" width="18" height="13" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="1" y="1.5" width="7" height="5" rx="1"/>
            <line x1="8" y1="4" x2="12" y2="4"/>
            <rect x="12" y="1.5" width="7" height="5" rx="1" stroke-dasharray="2.5 1.5"/>
            <line x1="15.5" y1="9"  x2="15.5" y2="13"/>
            <line x1="13.5" y1="11" x2="17.5" y2="11"/>
        </svg>`,
    _svgDelete: `<svg viewBox="0 0 14 16" width="12" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 4V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V4"/>
            <line x1="1" y1="4" x2="13" y2="4"/>
            <path d="M2.3 4.5 3 13.5a.7.7 0 0 0 .7.5h6.6a.7.7 0 0 0 .7-.5l.7-9"/>
            <line x1="5.5" y1="6.5" x2="5.5" y2="11.5"/>
            <line x1="8.5" y1="6.5" x2="8.5" y2="11.5"/>
        </svg>`,

    // ── Construction de l'arbre ──────────────────────────────────

    buildTree(props) {
        const allIds = new Set(props.map(p => p.id));
        const childrenOf = {};
        props.forEach(p => { childrenOf[p.id] = []; });
        const hasParent = new Set();
        props.forEach(p => {
            (p.subPropertyOf || []).filter(s => typeof s === 'string' && allIds.has(s)).forEach(par => {
                childrenOf[par].push(p.id);
                hasParent.add(p.id);
            });
        });
        const alpha = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });
        const roots = props.filter(p => !hasParent.has(p.id)).map(p => p.id).sort(alpha);
        Object.keys(childrenOf).forEach(id => childrenOf[id].sort(alpha));
        return { roots, childrenOf };
    },

    _expandAncestors(propId) {
        const props  = APP.state.object_properties || [];
        const allIds = new Set(props.map(p => p.id));
        const prop   = props.find(p => p.id === propId);
        if (!prop) return;
        (prop.subPropertyOf || [])
            .filter(s => typeof s === 'string' && allIds.has(s))
            .forEach(par => { this._expanded.add(par); this._expandAncestors(par); });
    },

    _renderNode(id, childrenOf, depth) {
        const prop = (APP.state.object_properties || []).find(p => p.id === id);
        if (!prop) return '';
        const children = childrenOf[id] || [];
        const hasChildren = children.length > 0;
        const isSelected = id === this._selectedId;
        const isOpen = this._expanded.has(id);
        return `
        <div class="tree-root-node">
            <div class="tree-item${isSelected ? ' selected' : ''}"
                 style="padding-left:${depth * 16 + 6}px"
                 draggable="true"
                 onclick="OPEditor.selectProp('${id}')"
                 oncontextmenu="OPEditor.showContextMenu(event,'${id}')"
                 ondragstart="OPEditor.onDragStart(event,'${id}')"
                 ondragover="OPEditor.onDragOver(event,'${id}')"
                 ondragleave="OPEditor.onDragLeave(event)"
                 ondrop="OPEditor.onDrop(event,'${id}')"
                 ondragend="OPEditor.onDragEnd(event)">
                ${hasChildren
                    ? `<span class="tree-toggle${isOpen ? ' open' : ''}"
                             onclick="event.stopPropagation();OPEditor.toggleNode('${id}')">▶</span>`
                    : `<span class="tree-leaf">◦</span>`}
                <span class="op-prop-dot tree-op-dot"></span>
                <span class="tree-label">${id}</span>
                ${prop.inverseOf ? `<span class="op-inverse-tag">↔ ${prop.inverseOf}</span>` : ''}
            </div>
            <div id="op-tcn-${id}" style="display:${isOpen ? 'block' : 'none'}">
                ${children.map(cid => this._renderNode(cid, childrenOf, depth + 1)).join('')}
            </div>
        </div>`;
    },

    renderTree(props) {
        const { roots, childrenOf } = this.buildTree(props);
        const topSel = this._topPropSelected ? ' selected' : '';
        return `
        <div class="tree-root-item${topSel}"
             onclick="OPEditor.selectTopProp()"
             oncontextmenu="OPEditor.showContextMenu(event,null)"
             ondragover="OPEditor.onDragOver(event,null)"
             ondragleave="OPEditor.onDragLeave(event)"
             ondrop="OPEditor.onDrop(event,null)">
            <span class="tree-toggle open" style="cursor:default">▶</span>
            <span class="op-prop-dot tree-op-dot tree-op-top-dot"></span>
            <span style="font-size:12px">owl:topObjectProperty</span>
        </div>
        ${props.length
            ? roots.map(id => this._renderNode(id, childrenOf, 1)).join('')
            : '<p class="empty" style="padding:8px 16px;font-size:12px">No ObjectProperty</p>'
        }`;
    },

    // ── Layout splitté ───────────────────────────────────────────

    renderSplit(props) {
        const ico = `<svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="4.5" y1=".5" x2="4.5" y2="8.5"/><line x1=".5" y1="4.5" x2="8.5" y2="4.5"/></svg>`;
        return `
        <div class="section-split">
            <div class="tree-panel" id="op-tree-panel">

                <!-- ── Arbre ── -->
                <div class="left-col-top">
                    <div class="tree-panel-header">
                        <h3>Object Properties</h3>
                        <div class="tree-actions">
                            <button id="op-btn-child" class="btn-icon" disabled
                                    onclick="OPEditor.createChild()"
                                    title="Add child property (sub-property)">${this._svgChild}<span>Child</span></button>
                            <button id="op-btn-sister" class="btn-icon" disabled
                                    onclick="OPEditor.createSibling()"
                                    title="Add sibling property (same level)">${this._svgSister}<span>Sibling</span></button>
                            <button id="op-btn-delete" class="btn-icon btn-icon-danger" disabled
                                    onclick="OPEditor.deleteSelected()" title="Delete">${this._svgDelete}</button>
                        </div>
                    </div>
                    <div class="tree-scroll" id="op-tree">
                        ${this.renderTree(props)}
                    </div>
                </div>

                <!-- ── Séparateur redimensionnable ── -->
                <div class="h-resizer"></div>

                <!-- ── Super Properties ── -->
                <div class="left-col-bottom">
                    <div class="tree-panel-header">
                        <h3>Super Properties</h3>
                        <button class="btn-ftool" onclick="OPEditor.showPicker('op-sub-picker')"
                                title="Add super-property">${ico}</button>
                    </div>
                    <div class="left-col-bottom-body" id="op-sub-list">
                        <div class="cls-list-empty">— select a property —</div>
                        <div id="op-sub-picker" class="cls-tree-picker" style="display:none"></div>
                    </div>
                </div>

            </div>
            <div class="split-handle" id="op-split-handle"></div>
            <div class="detail-panel" id="op-detail">
                <div class="detail-panel-empty">
                    <span class="op-prop-dot" style="width:40px;height:20px"></span>
                    <span>Select an existing <strong>Object Property</strong> or create a new one</span>
                    <button class="btn-primary btn-sm" onclick="OPEditor.createChild()">＋ Create Object Property</button>
                </div>
            </div>
        </div>`;
    },

    // ── Sélection / navigation ───────────────────────────────────

    restoreSelection() {
        this._initSplitPane();
        if (this._topPropSelected) {
            this.selectTopProp();
        } else if (this._selectedId) {
            this.selectProp(this._selectedId);
        }
    },

    _initSplitPane() {
        const handle = document.getElementById('op-split-handle');
        const panel  = document.getElementById('op-tree-panel');
        if (!handle || !panel) return;
        handle.addEventListener('mousedown', e => {
            e.preventDefault();
            const startX = e.clientX, startW = panel.offsetWidth;
            document.body.classList.add('resizing');
            const onMove = e => { panel.style.width = Math.min(520, Math.max(160, startW + e.clientX - startX)) + 'px'; };
            const onUp   = () => { document.body.classList.remove('resizing'); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
        // Redimensionnement vertical arbre ↕ super-propriétés
        _initHResizers('op-tree-panel');
    },

    /** Met à jour le panneau "Super Properties" dans la colonne gauche */
    _updateSuperPanel(prop) {
        const panel = document.getElementById('op-sub-list');
        if (!panel) return;
        if (!prop) {
            panel.innerHTML = `
                <div class="cls-list-empty">— select a property —</div>
                <div id="op-sub-picker" class="cls-tree-picker" style="display:none"></div>`;
            return;
        }
        const superPropRows = _listRows(prop.subPropertyOf || [], 'op-sub-list', 'OPEditor.removeSubProp', 'op-prop-dot', '', '', 'object-properties');
        const superPropTree = _opTreePickerItems('OPEditor.addSubProp(this.dataset.id)', [prop.id]);
        panel.innerHTML = `
            ${superPropRows || '<div class="cls-list-empty">owl:topObjectProperty</div>'}
            <div id="op-sub-picker" class="cls-tree-picker" style="display:none">
                ${superPropTree}
            </div>`;
    },

    selectTopProp() {
        this._selectedId = null;
        this._topPropSelected = true;
        document.querySelectorAll('#op-tree .tree-item, #op-tree .tree-root-item').forEach(el => el.classList.remove('selected'));
        document.querySelector('#op-tree .tree-root-item')?.classList.add('selected');
        const detail = document.getElementById('op-detail');
        if (detail) detail.innerHTML = `
            <div class="detail-panel-empty">
                <span class="op-prop-dot" style="width:40px;height:20px"></span>
                <strong style="font-family:var(--font-mono);font-size:13px">owl:topObjectProperty</strong>
                <span style="color:var(--text-dim);font-size:12px">Root of all OWL Object Properties</span>
                <span style="color:var(--text2);font-size:12px">Select an existing <strong>Object Property</strong> or create a new one</span>
                <button class="btn-primary btn-sm" onclick="OPEditor.createChild()">＋ Create Object Property</button>
            </div>`;
        this._updateSuperPanel(null);
        this._updateTreeButtons();
    },

    selectProp(id) {
        this._selectedId = id;
        this._topPropSelected = false;
        document.querySelectorAll('#op-tree .tree-item, #op-tree .tree-root-item').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('#op-tree .tree-item').forEach(el => {
            if (el.querySelector('.tree-label')?.textContent === id) el.classList.add('selected');
        });
        const detail = document.getElementById('op-detail');
        if (!detail) return;
        const prop = (APP.state.object_properties || []).find(p => p.id === id);
        detail.innerHTML = this.renderForm(prop);
        _initHResizers('op-detail');
        this._updateSuperPanel(prop || null);
        this._updateTreeButtons();
        this._loadInferredInverse(id);
    },

    _updateTreeButtons() {
        const btnSister = document.getElementById('op-btn-sister');
        const btnChild  = document.getElementById('op-btn-child');
        const btnDelete = document.getElementById('op-btn-delete');
        if (!btnSister || !btnChild || !btnDelete) return;
        if (this._topPropSelected) {
            btnSister.disabled = true;
            btnSister.style.visibility = 'hidden';
            btnChild.disabled  = false;
            btnDelete.disabled = true;
            btnDelete.style.visibility = 'hidden';
        } else if (this._selectedId) {
            btnSister.disabled = false;
            btnSister.style.visibility = '';
            btnChild.disabled  = false;
            btnDelete.disabled = false;
            btnDelete.style.visibility = '';
        } else {
            btnSister.disabled = true;
            btnSister.style.visibility = '';
            btnChild.disabled  = true;
            btnDelete.disabled = true;
            btnDelete.style.visibility = '';
        }
    },

    toggleNode(id) {
        const el = document.getElementById(`op-tcn-${id}`);
        if (!el) return;
        const isOpen = el.style.display !== 'none';
        el.style.display = isOpen ? 'none' : 'block';
        if (isOpen) this._expanded.delete(id);
        else        this._expanded.add(id);
        const toggle = el.previousElementSibling?.querySelector('.tree-toggle');
        if (toggle) toggle.classList.toggle('open', !isOpen);
    },

    async createSibling() {
        if (!this._selectedId) return;
        const prop = (APP.state.object_properties || []).find(p => p.id === this._selectedId);
        const parents = prop ? (prop.subPropertyOf || []).filter(s => typeof s === 'string') : [];
        parents.forEach(p => this._expanded.add(p));
        await this._createAndSelect(parents);
    },

    async createChild() {
        const parent = this._selectedId;
        const parents = parent ? [parent] : [];
        if (parent) this._expanded.add(parent);
        await this._createAndSelect(parents);
    },

    _generatePropName() {
        const existing = new Set((APP.state.object_properties || []).map(p => p.id));
        let name = 'NewObjectProperty';
        let i = 1;
        while (existing.has(name)) { name = `NewObjectProperty${i++}`; }
        return name;
    },

    async _createAndSelect(subPropertyOf) {
        const id = this._generatePropName();
        const prop = {
            id, annotations: { labels: [], comments: [] },
            domain: [], range: [], subPropertyOf,
            inverseOf: null, characteristics: {}, propertyChainAxiom: [],
        };
        try {
            await API.createOP(prop);
            this._selectedId = id;
            this._topPropSelected = false;
            this._editingId = id;
            await APP.refresh();
            APP.renderSection('object-properties');
        } catch (e) { UI.error(e.message); }
    },

    // ── Menu contextuel ──────────────────────────────────────────

    showContextMenu(event, id) {
        event.preventDefault();
        event.stopPropagation();
        if (id) this.selectProp(id);
        else    this.selectTopProp();
        this._closeContextMenu();

        const isProp = !!id;
        const menu = document.createElement('div');
        menu.id = 'op-ctx-menu';
        menu.className = 'ctx-menu';
        menu.innerHTML = `
            <div class="ctx-item" onclick="OPEditor._closeContextMenu();OPEditor.createChild()">
                ${this._svgChild} Add Child Property</div>
            ${isProp ? `<div class="ctx-item" onclick="OPEditor._closeContextMenu();OPEditor.createSibling()">
                ${this._svgSister} Add Sibling Property</div>
            <div class="ctx-sep"></div>
            <div class="ctx-item ctx-danger" onclick="OPEditor._closeContextMenu();OPEditor.deleteSelected()">
                ${this._svgDelete} Delete</div>` : ''}
        `;
        menu.style.left = event.clientX + 'px';
        menu.style.top  = event.clientY + 'px';
        document.body.appendChild(menu);
        requestAnimationFrame(() => {
            const r = menu.getBoundingClientRect();
            if (r.right  > window.innerWidth)  menu.style.left = (event.clientX - r.width)  + 'px';
            if (r.bottom > window.innerHeight)  menu.style.top  = (event.clientY - r.height) + 'px';
        });
        const close = (e) => {
            if (!menu.contains(e.target)) {
                this._closeContextMenu();
                document.removeEventListener('click', close, true);
            }
        };
        setTimeout(() => document.addEventListener('click', close, true), 0);
    },

    _closeContextMenu() {
        document.getElementById('op-ctx-menu')?.remove();
    },

    // ── Drag & Drop ──────────────────────────────────────────────

    onDragStart(event, id) {
        this._dragId = id;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', id);
        setTimeout(() => event.target.classList.add('dragging'), 0);
    },

    onDragOver(event, targetId) {
        if (!this._dragId) return;
        if (this._dragId === targetId) return;
        if (this._isDescendant(targetId, this._dragId)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        event.currentTarget.classList.add('drag-over');
    },

    onDragLeave(event) {
        event.currentTarget.classList.remove('drag-over');
    },

    async onDrop(event, targetId) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');
        const draggedId = this._dragId;
        this._dragId = null;
        if (!draggedId || draggedId === targetId) return;
        if (this._isDescendant(targetId, draggedId)) {
            UI.warn('Cannot drop on a descendant — would create a cycle');
            return;
        }
        const prop = (APP.state.object_properties || []).find(p => p.id === draggedId);
        if (!prop) return;
        const newParents = targetId ? [targetId] : [];
        const updated = { ...prop, subPropertyOf: newParents };
        if (targetId) this._expanded.add(targetId);
        this._selectedId = draggedId;
        this._editingId  = draggedId;
        this._topPropSelected = false;
        try {
            await API.updateOP(draggedId, updated);
            UI.success(`'${draggedId}' moved`);
            await APP.refresh();
            APP.renderSection('object-properties');
        } catch (e) { UI.error(e.message); }
    },

    onDragEnd(event) {
        event.target.classList.remove('dragging');
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        this._dragId = null;
    },

    _isDescendant(potentialDesc, ancestorId) {
        if (!potentialDesc || !ancestorId) return false;
        const { childrenOf } = this.buildTree(APP.state.object_properties || []);
        const visit = (id) => {
            if (id === potentialDesc) return true;
            return (childrenOf[id] || []).some(child => visit(child));
        };
        return visit(ancestorId);
    },

    deleteSelected() { if (this._selectedId) this.delete(this._selectedId); },

    // ── Formulaire style Protégé ─────────────────────────────────

    renderForm(prop = null) {
        const isNew = !prop;
        OPEditor._editingId = isNew ? null : prop.id;
        const p = prop || { id: '', annotations: { labels: [], comments: [] },
            domain: [], range: [], subPropertyOf: [], inverseOf: null,
            characteristics: {}, propertyChainAxiom: [] };
        const chars = p.characteristics || {};
        const ac    = isNew ? 'onblur="if(this.value.trim()) OPEditor.save(true)"'
                           : 'onchange="OPEditor.autoSave()"';
        const baseIri = (APP.state.ontology?.id || '').replace(/#$/, '');
        const propIri = (p.id && baseIri) ? `${baseIri}#${p.id}` : '';

        // Annotations
        const annoRows = [
            ...(p.annotations?.labels   || []).map(l  => _annoRow('label',   l.value,  l.lang  || 'fr', 'OPEditor', ac)),
            ...(p.annotations?.comments || []).map(cm => _annoRow('comment', cm.value, cm.lang || 'fr', 'OPEditor', ac)),
            ...(p.annotations?.other    || []).map(a  => _annoRow('other',   a.value,  '',             'OPEditor', ac, a.property)),
        ].join('');

        // Domain / Range
        const domainRows = _listRows(p.domain || [], 'op-domain-list', 'OPEditor.removeDomain', 'cls-dot', '', '', 'classes');
        const rangeRows  = _listRows(p.range || [], 'op-range-list', 'OPEditor.removeRange', 'cls-dot', '', '', 'classes');

        // Inverse Of
        const inverseItem = p.inverseOf
            ? `<div class="cls-list-item" data-id="${p.inverseOf}">
                   <span class="op-prop-dot"></span>
                   <span class="cls-list-lbl" style="cursor:pointer"
                         onclick="APP.navigateTo('object-properties','${p.inverseOf}')">${p.inverseOf}</span>
                   <button class="btn-frame-del" onclick="OPEditor.removeInverse()">✕</button>
               </div>`
            : '<div class="cls-list-empty">— none —</div>';

        // Characteristics
        const charsList = ['functional','inverseFunctional','transitive','symmetric','asymmetric','reflexive','irreflexive'];
        const charLabels = ['Functional','InverseFunctional','Transitive','Symmetric','Asymmetric','Reflexive','Irreflexive'];

        const ico = `<svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="4.5" y1=".5" x2="4.5" y2="8.5"/><line x1=".5" y1="4.5" x2="8.5" y2="4.5"/></svg>`;

        return `
        <div class="cls-editor">
            <div class="cls-editor-hdr">
                <div class="cls-editor-title">OBJECT PROPERTY EDITOR for&nbsp;
                    <input type="text" id="op-id" class="cls-id-inp" value="${p.id}" placeholder="NewProperty" ${ac} title="Identifiant IRI local">
                    <span class="cls-editor-meta">(instance of owl:ObjectProperty)</span>
                </div>
                ${propIri ? `<div class="cls-editor-iri">For Property:&nbsp;<code>${propIri}</code></div>` : ''}
            </div>

            <div class="cls-frame">
                <div class="cls-frame-bar">
                    <span class="cls-frame-tag">Annotation(s)</span>
                    <button class="btn-ftool" onclick="OPEditor.addAnnotRow('label')"   title="Ajouter rdfs:label">${ico}&thinsp;label</button>
                    <button class="btn-ftool" onclick="OPEditor.addAnnotRow('comment')" title="Ajouter rdfs:comment">${ico}&thinsp;comment</button>
                    <button class="btn-ftool" onclick="_togglePicker('op-anno-picker')" title="Add annotation property">${ico}&thinsp;Annotation Property</button>
                </div>
                <div class="cls-frame-body">
                    <table class="cls-anno-table">
                        <thead><tr><th>Property</th><th>Value</th><th>Lang</th><th></th></tr></thead>
                        <tbody id="op-annotations-body">${annoRows}</tbody>
                    </table>
                    <div id="op-anno-picker" class="cls-tree-picker" style="display:none">
                        ${_annoPickerItems('OPEditor')}
                    </div>
                </div>
            </div>

            <div class="h-resizer"></div>

            <div class="cls-frames-row">
                <div class="cls-frame cls-frame-half">
                    <div class="cls-frame-bar">
                        <span class="cls-frame-tag">Domain(s)</span>
                        <button class="btn-ftool" onclick="OPEditor.showPicker('op-domain-picker')" title="Ajouter domaine">${ico}</button>
                    </div>
                    <div class="cls-frame-body" id="op-domain-list">
                        ${domainRows || '<div class="cls-list-empty">owl:Thing</div>'}
                        <div id="op-domain-picker" class="cls-tree-picker" style="display:none">
                            ${_classTreePickerItems('OPEditor.addDomain')}
                        </div>
                    </div>
                </div>
                <div class="cls-frame cls-frame-half">
                    <div class="cls-frame-bar">
                        <span class="cls-frame-tag">Range(s)</span>
                        <button class="btn-ftool" onclick="OPEditor.showPicker('op-range-picker')" title="Ajouter range">${ico}</button>
                    </div>
                    <div class="cls-frame-body" id="op-range-list">
                        ${rangeRows || '<div class="cls-list-empty">owl:Thing</div>'}
                        <div id="op-range-picker" class="cls-tree-picker" style="display:none">
                            ${_classTreePickerItems('OPEditor.addRange')}
                        </div>
                    </div>
                </div>
            </div>

            <div class="h-resizer"></div>

            <div class="cls-frame">
                <div class="cls-frame-bar">
                    <span class="cls-frame-tag">Inverse Of</span>
                    <button id="op-inverse-btn" class="btn-ftool"
                            style="${p.inverseOf ? 'display:none' : ''}"
                            onclick="OPEditor.showPicker('op-inverse-picker')"
                            title="Set inverse property">${ico}</button>
                </div>
                <div class="cls-frame-body" id="op-inverse-body">
                    ${inverseItem}
                    <input type="hidden" id="op-inverse-value" value="${p.inverseOf || ''}">
                    <div id="op-inverse-picker" class="cls-tree-picker" style="display:none">
                        ${_opTreePickerItems('OPEditor.setInverse(this.dataset.id)')}
                    </div>
                    <div id="op-inferred-inverse" style="margin-top:4px;font-size:11px"></div>
                </div>
            </div>

            <div class="h-resizer"></div>

            <div class="cls-frame">
                <div class="cls-frame-bar"><span class="cls-frame-tag cls-frame-tag-blue">Characteristics</span></div>
                <div class="cls-frame-body">
                    <div class="chars-grid">
                        ${charsList.map((k, i) => `<label class="char-check"><input type="checkbox" id="op-${k}" ${chars[k] ? 'checked':''} ${ac}> ${charLabels[i]}</label>`).join('')}
                    </div>
                </div>
            </div>

            ${_whereUsedFrame(r => _ruleUsesProperty(r, p.id))}
        </div>`;
    },

    // ── Helpers annotations ──────────────────────────────────────

    addAnnotRow(type) {
        const ac = this._editingId !== null ? 'onchange="OPEditor.autoSave()"' : '';
        document.getElementById('op-annotations-body')?.appendChild(_makeAnnotRow(type, 'OPEditor', ac));
    },
    addOtherAnnotRow(prop) {
        const ac = this._editingId !== null ? 'onchange="OPEditor.autoSave()"' : '';
        document.getElementById('op-annotations-body')?.appendChild(_makeAnnotRow('other', 'OPEditor', ac, prop));
        document.getElementById('op-anno-picker').style.display = 'none';
    },
    removeAnnotRow(btn) { btn.closest('tr')?.remove(); if (this._editingId !== null) this.autoSave(); },

    // ── Helpers pickers ──────────────────────────────────────────

    showPicker(id) {
        // Unicité de l'inverse : si un inverse est déjà défini, ne pas ouvrir le picker
        if (id === 'op-inverse-picker') {
            const val = document.getElementById('op-inverse-value')?.value;
            if (val) return;
        }
        _togglePicker(id);
    },

    addDomain(id)    { _addListItem(id, 'op-domain-list', 'op-domain-picker', 'OPEditor.removeDomain', 'cls-dot', '', '', 'classes'); if (id && this._editingId !== null) this.autoSave(); },
    removeDomain(id) { _removeListItem(id, 'op-domain-list', 'owl:Thing'); if (this._editingId !== null) this.autoSave(); },

    addRange(id)    { _addListItem(id, 'op-range-list', 'op-range-picker', 'OPEditor.removeRange', 'cls-dot', '', '', 'classes'); if (id && this._editingId !== null) this.autoSave(); },
    removeRange(id) { _removeListItem(id, 'op-range-list', 'owl:Thing'); if (this._editingId !== null) this.autoSave(); },

    addSubProp(id)    { _addListItem(id, 'op-sub-list', 'op-sub-picker', 'OPEditor.removeSubProp', 'op-prop-dot', '', '', 'object-properties'); if (id && this._editingId !== null) this.autoSave(); },
    removeSubProp(id) { _removeListItem(id, 'op-sub-list'); if (this._editingId !== null) this.autoSave(); },

    setInverse(id) {
        const body  = document.getElementById('op-inverse-body');
        const input = document.getElementById('op-inverse-value');
        if (!body || !input) return;
        input.value = id;
        body.querySelector('.cls-list-item')?.remove();
        body.querySelector('.cls-list-empty')?.remove();
        if (id) {
            const item = document.createElement('div');
            item.className = 'cls-list-item';
            item.dataset.id = id;
            item.innerHTML = `<span class="op-prop-dot"></span>
                <span class="cls-list-lbl">${id}</span>
                <button class="btn-frame-del" onclick="OPEditor.removeInverse()">✕</button>`;
            body.insertBefore(item, body.querySelector('input'));
        } else {
            const ph = document.createElement('div');
            ph.className = 'cls-list-empty';
            ph.textContent = '— none —';
            body.insertBefore(ph, body.querySelector('input'));
        }
        // Masquer/afficher le bouton + selon qu'un inverse est défini (unicité)
        const btn = document.getElementById('op-inverse-btn');
        if (btn) btn.style.display = id ? 'none' : '';
        // Fermer le picker
        const picker = document.getElementById('op-inverse-picker');
        if (picker) picker.style.display = 'none';
        if (this._editingId !== null) this.autoSave();
    },
    removeInverse() { this.setInverse(''); },

    // ── Inférence inverse ────────────────────────────────────────

    async _loadInferredInverse(id) {
        try {
            const data  = await API.getInferences();
            const items = (data.inferred_inverse_properties || []).filter(i => i.property_id === id);
            const el    = document.getElementById('op-inferred-inverse');
            if (el) el.innerHTML = items.map(i =>
                `<span class="badge-inferred" title="${i.reason}">⊢ inverse de <strong>${i.inverse_of}</strong></span>`
            ).join('');
        } catch (e) { /* silencieux */ }
    },

    // ── Sauvegarde ───────────────────────────────────────────────

    autoSave() { if (this._editingId !== null) this.save(false); },

    async save(isNew) {
        const originalId = isNew ? null : this._editingId;
        const id = document.getElementById('op-id').value.trim();
        if (!id) return UI.error('L\'identifiant est obligatoire');

        const { labels, comments, other } = _collectAnnotations('op-annotations-body');
        const domain  = _collectList('op-domain-list');
        const range   = _collectList('op-range-list');
        const subPropertyOf = _collectList('op-sub-list');
        const inverseOf = document.getElementById('op-inverse-value')?.value || null;

        const chars = {};
        ['functional','inverseFunctional','transitive','symmetric','asymmetric','reflexive','irreflexive']
            .forEach(k => { chars[k] = document.getElementById(`op-${k}`)?.checked || false; });

        const prop = { id, annotations: { labels, comments, other },
            domain, range, subPropertyOf, inverseOf: inverseOf || null,
            characteristics: chars, propertyChainAxiom: [] };

        try {
            if (isNew) {
                await API.createOP(prop);
                UI.success(`ObjectProperty '${id}' created`);
                this._selectedId = id; this._editingId = id;
            } else {
                await API.updateOP(originalId, prop);
                if (id !== originalId) UI.success(`Property renamed → '${id}'`);
                this._selectedId = id; this._editingId = id;
            }
            await APP.refresh();
            APP.renderSection('object-properties');
        } catch (e) { UI.error(e.message); }
    },

    async delete(id) {
        if (!await UI.confirm(`Delete ObjectProperty <strong>${id}</strong>?`)) return;
        try {
            await API.deleteOP(id);
            UI.success(`ObjectProperty '${id}' deleted`);
            this._selectedId = null; this._editingId = null;
            await APP.refresh(); APP.renderSection('object-properties');
        } catch (e) { UI.error(e.message); }
    },
};


// ════════════════════════════════════════════════════════════════
// DATATYPE PROPERTIES
// ════════════════════════════════════════════════════════════════

const DPEditor = {

    _selectedId: null,
    _editingId:  null,
    _expanded: new Set(),
    _topPropSelected: false,
    _dragId: null,

    _svgChild:  `<svg viewBox="0 0 18 15" width="16" height="13" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="1" y="1" width="16" height="4.5" rx="1"/>
            <line x1="4" y1="5.5" x2="4" y2="9"/>
            <line x1="4" y1="9"   x2="9" y2="9"/>
            <rect x="9" y="7.5" width="8" height="4.5" rx="1" stroke-dasharray="2.5 1.5"/>
            <line x1="13"   y1="8.8" x2="13"   y2="11.3"/>
            <line x1="11.5" y1="10"  x2="14.5" y2="10"/>
        </svg>`,
    _svgSister: `<svg viewBox="0 0 20 14" width="18" height="13" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="1" y="1.5" width="7" height="5" rx="1"/>
            <line x1="8" y1="4" x2="12" y2="4"/>
            <rect x="12" y="1.5" width="7" height="5" rx="1" stroke-dasharray="2.5 1.5"/>
            <line x1="15.5" y1="9"  x2="15.5" y2="13"/>
            <line x1="13.5" y1="11" x2="17.5" y2="11"/>
        </svg>`,
    _svgDelete: `<svg viewBox="0 0 14 16" width="12" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 4V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V4"/>
            <line x1="1" y1="4" x2="13" y2="4"/>
            <path d="M2.3 4.5 3 13.5a.7.7 0 0 0 .7.5h6.6a.7.7 0 0 0 .7-.5l.7-9"/>
            <line x1="5.5" y1="6.5" x2="5.5" y2="11.5"/>
            <line x1="8.5" y1="6.5" x2="8.5" y2="11.5"/>
        </svg>`,

    // ── Construction de l'arbre ──────────────────────────────────

    buildTree(props) {
        const allIds = new Set(props.map(p => p.id));
        const childrenOf = {};
        props.forEach(p => { childrenOf[p.id] = []; });
        const hasParent = new Set();
        props.forEach(p => {
            (p.subPropertyOf || []).filter(s => typeof s === 'string' && allIds.has(s)).forEach(par => {
                childrenOf[par].push(p.id);
                hasParent.add(p.id);
            });
        });
        const alpha = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });
        const roots = props.filter(p => !hasParent.has(p.id)).map(p => p.id).sort(alpha);
        Object.keys(childrenOf).forEach(id => childrenOf[id].sort(alpha));
        return { roots, childrenOf };
    },

    _expandAncestors(propId) {
        const props  = APP.state.datatype_properties || [];
        const allIds = new Set(props.map(p => p.id));
        const prop   = props.find(p => p.id === propId);
        if (!prop) return;
        (prop.subPropertyOf || [])
            .filter(s => typeof s === 'string' && allIds.has(s))
            .forEach(par => { this._expanded.add(par); this._expandAncestors(par); });
    },

    _renderNode(id, childrenOf, depth) {
        const prop = (APP.state.datatype_properties || []).find(p => p.id === id);
        if (!prop) return '';
        const children = childrenOf[id] || [];
        const hasChildren = children.length > 0;
        const isSelected = id === this._selectedId;
        const isOpen = this._expanded.has(id);
        return `
        <div class="tree-root-node">
            <div class="tree-item${isSelected ? ' selected' : ''}"
                 style="padding-left:${depth * 16 + 6}px"
                 draggable="true"
                 onclick="DPEditor.selectProp('${id}')"
                 oncontextmenu="DPEditor.showContextMenu(event,'${id}')"
                 ondragstart="DPEditor.onDragStart(event,'${id}')"
                 ondragover="DPEditor.onDragOver(event,'${id}')"
                 ondragleave="DPEditor.onDragLeave(event)"
                 ondrop="DPEditor.onDrop(event,'${id}')"
                 ondragend="DPEditor.onDragEnd(event)">
                ${hasChildren
                    ? `<span class="tree-toggle${isOpen ? ' open' : ''}"
                             onclick="event.stopPropagation();DPEditor.toggleNode('${id}')">▶</span>`
                    : `<span class="tree-leaf">◦</span>`}
                <span class="dp-prop-dot tree-dp-dot"></span>
                <span class="tree-label">${id}</span>
            </div>
            <div id="dp-tcn-${id}" style="display:${isOpen ? 'block' : 'none'}">
                ${children.map(cid => this._renderNode(cid, childrenOf, depth + 1)).join('')}
            </div>
        </div>`;
    },

    renderTree(props) {
        const { roots, childrenOf } = this.buildTree(props);
        const topSel = this._topPropSelected ? ' selected' : '';
        return `
        <div class="tree-root-item${topSel}"
             onclick="DPEditor.selectTopProp()"
             oncontextmenu="DPEditor.showContextMenu(event,null)"
             ondragover="DPEditor.onDragOver(event,null)"
             ondragleave="DPEditor.onDragLeave(event)"
             ondrop="DPEditor.onDrop(event,null)">
            <span class="tree-toggle open" style="cursor:default">▶</span>
            <span class="dp-prop-dot tree-dp-dot tree-dp-top-dot"></span>
            <span style="font-size:12px">owl:topDataProperty</span>
        </div>
        ${props.length
            ? roots.map(id => this._renderNode(id, childrenOf, 1)).join('')
            : '<p class="empty" style="padding:8px 16px;font-size:12px">No DatatypeProperty</p>'
        }`;
    },

    // ── Layout splitté ───────────────────────────────────────────

    renderSplit(props) {
        const ico = `<svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="4.5" y1=".5" x2="4.5" y2="8.5"/><line x1=".5" y1="4.5" x2="8.5" y2="4.5"/></svg>`;
        const availSub0 = (APP.state.datatype_properties || [])
            .map(q => `<option value="${q.id}">${q.id}</option>`).join('');
        return `
        <div class="section-split">
            <div class="tree-panel" id="dp-tree-panel">

                <!-- ── Arbre ── -->
                <div class="left-col-top">
                    <div class="tree-panel-header">
                        <h3>Datatype Properties</h3>
                        <div class="tree-actions">
                            <button id="dp-btn-child" class="btn-icon" disabled
                                    onclick="DPEditor.createChild()"
                                    title="Add child property (sub-property)">${this._svgChild}<span>Child</span></button>
                            <button id="dp-btn-sister" class="btn-icon" disabled
                                    onclick="DPEditor.createSibling()"
                                    title="Add sibling property (same level)">${this._svgSister}<span>Sibling</span></button>
                            <button id="dp-btn-delete" class="btn-icon btn-icon-danger" disabled
                                    onclick="DPEditor.deleteSelected()" title="Delete">${this._svgDelete}</button>
                        </div>
                    </div>
                    <div class="tree-scroll" id="dp-tree">
                        ${this.renderTree(props)}
                    </div>
                </div>

                <!-- ── Séparateur redimensionnable ── -->
                <div class="h-resizer"></div>

                <!-- ── Super Properties ── -->
                <div class="left-col-bottom">
                    <div class="tree-panel-header">
                        <h3>Super Properties</h3>
                        <button class="btn-ftool" onclick="DPEditor.showPicker('dp-sub-picker')"
                                title="Add super-property">${ico}</button>
                    </div>
                    <div class="left-col-bottom-body" id="dp-sub-list">
                        <div class="cls-list-empty">— select a property —</div>
                        <select id="dp-sub-picker" class="cls-picker" style="display:none"
                                onchange="DPEditor.addSubProp(this.value)">
                            <option value="">— choose —</option>${availSub0}
                        </select>
                    </div>
                </div>

            </div>
            <div class="split-handle" id="dp-split-handle"></div>
            <div class="detail-panel" id="dp-detail">
                <div class="detail-panel-empty">
                    <span class="dp-prop-dot" style="width:40px;height:20px"></span>
                    <span>Select an existing <strong>Datatype Property</strong> or create a new one</span>
                    <button class="btn-primary btn-sm" onclick="DPEditor.createChild()">＋ Create Datatype Property</button>
                </div>
            </div>
        </div>`;
    },

    // ── Sélection / navigation ───────────────────────────────────

    restoreSelection() {
        this._initSplitPane();
        if (this._topPropSelected) {
            this.selectTopProp();
        } else if (this._selectedId) {
            this.selectProp(this._selectedId);
        }
    },

    _initSplitPane() {
        const handle = document.getElementById('dp-split-handle');
        const panel  = document.getElementById('dp-tree-panel');
        if (!handle || !panel) return;
        handle.addEventListener('mousedown', e => {
            e.preventDefault();
            const startX = e.clientX, startW = panel.offsetWidth;
            document.body.classList.add('resizing');
            const onMove = e => { panel.style.width = Math.min(520, Math.max(160, startW + e.clientX - startX)) + 'px'; };
            const onUp   = () => { document.body.classList.remove('resizing'); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
        // Redimensionnement vertical arbre ↕ super-propriétés
        _initHResizers('dp-tree-panel');
    },

    /** Met à jour le panneau "Super Properties" dans la colonne gauche */
    _updateSuperPanel(prop) {
        const panel = document.getElementById('dp-sub-list');
        if (!panel) return;
        if (!prop) {
            const allSub = (APP.state.datatype_properties || [])
                .map(q => `<option value="${q.id}">${q.id}</option>`).join('');
            panel.innerHTML = `
                <div class="cls-list-empty">— select a property —</div>
                <select id="dp-sub-picker" class="cls-picker" style="display:none"
                        onchange="DPEditor.addSubProp(this.value)">
                    <option value="">— choose —</option>${allSub}
                </select>`;
            return;
        }
        const subRows = _listRows(prop.subPropertyOf || [], 'dp-sub-list', 'DPEditor.removeSubProp', 'dp-prop-dot', '', '', 'datatype-properties');
        const availSub = (APP.state.datatype_properties || [])
            .filter(q => q.id !== prop.id && !(prop.subPropertyOf||[]).includes(q.id))
            .map(q => `<option value="${q.id}">${q.id}</option>`).join('');
        panel.innerHTML = `
            ${subRows || '<div class="cls-list-empty">owl:topDatatypeProperty</div>'}
            <select id="dp-sub-picker" class="cls-picker" style="display:none"
                    onchange="DPEditor.addSubProp(this.value)">
                <option value="">— choose —</option>${availSub}
            </select>`;
    },

    selectTopProp() {
        this._selectedId = null;
        this._topPropSelected = true;
        document.querySelectorAll('#dp-tree .tree-item, #dp-tree .tree-root-item').forEach(el => el.classList.remove('selected'));
        document.querySelector('#dp-tree .tree-root-item')?.classList.add('selected');
        const detail = document.getElementById('dp-detail');
        if (detail) detail.innerHTML = `
            <div class="detail-panel-empty">
                <span class="dp-prop-dot" style="width:40px;height:20px"></span>
                <strong style="font-family:var(--font-mono);font-size:13px">owl:topDatatypeProperty</strong>
                <span style="color:var(--text-dim);font-size:12px">Root of all OWL Datatype Properties</span>
                <span style="color:var(--text2);font-size:12px">Select an existing <strong>Datatype Property</strong> or create a new one</span>
                <button class="btn-primary btn-sm" onclick="DPEditor.createChild()">＋ Create Datatype Property</button>
            </div>`;
        this._updateSuperPanel(null);
        this._updateTreeButtons();
    },

    selectProp(id) {
        this._selectedId = id;
        this._topPropSelected = false;
        document.querySelectorAll('#dp-tree .tree-item, #dp-tree .tree-root-item').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('#dp-tree .tree-item').forEach(el => {
            if (el.querySelector('.tree-label')?.textContent === id) el.classList.add('selected');
        });
        const detail = document.getElementById('dp-detail');
        if (!detail) return;
        const prop = (APP.state.datatype_properties || []).find(p => p.id === id);
        detail.innerHTML = this.renderForm(prop);
        _initHResizers('dp-detail');
        this._updateSuperPanel(prop || null);
        this._updateTreeButtons();
    },

    _updateTreeButtons() {
        const btnSister = document.getElementById('dp-btn-sister');
        const btnChild  = document.getElementById('dp-btn-child');
        const btnDelete = document.getElementById('dp-btn-delete');
        if (!btnSister || !btnChild || !btnDelete) return;
        if (this._topPropSelected) {
            btnSister.disabled = true;
            btnSister.style.visibility = 'hidden';
            btnChild.disabled  = false;
            btnDelete.disabled = true;
            btnDelete.style.visibility = 'hidden';
        } else if (this._selectedId) {
            btnSister.disabled = false;
            btnSister.style.visibility = '';
            btnChild.disabled  = false;
            btnDelete.disabled = false;
            btnDelete.style.visibility = '';
        } else {
            btnSister.disabled = true;
            btnSister.style.visibility = '';
            btnChild.disabled  = true;
            btnDelete.disabled = true;
            btnDelete.style.visibility = '';
        }
    },

    toggleNode(id) {
        const el = document.getElementById(`dp-tcn-${id}`);
        if (!el) return;
        const isOpen = el.style.display !== 'none';
        el.style.display = isOpen ? 'none' : 'block';
        if (isOpen) this._expanded.delete(id);
        else        this._expanded.add(id);
        const toggle = el.previousElementSibling?.querySelector('.tree-toggle');
        if (toggle) toggle.classList.toggle('open', !isOpen);
    },

    async createSibling() {
        if (!this._selectedId) return;
        const prop = (APP.state.datatype_properties || []).find(p => p.id === this._selectedId);
        const parents = prop ? (prop.subPropertyOf || []).filter(s => typeof s === 'string') : [];
        parents.forEach(p => this._expanded.add(p));
        await this._createAndSelect(parents);
    },

    async createChild() {
        const parent = this._selectedId;
        const parents = parent ? [parent] : [];
        if (parent) this._expanded.add(parent);
        await this._createAndSelect(parents);
    },

    _generatePropName() {
        const existing = new Set((APP.state.datatype_properties || []).map(p => p.id));
        let name = 'NewDatatypeProperty';
        let i = 1;
        while (existing.has(name)) { name = `NewDatatypeProperty${i++}`; }
        return name;
    },

    async _createAndSelect(subPropertyOf) {
        const id = this._generatePropName();
        const prop = {
            id, annotations: { labels: [], comments: [] },
            domain: [], range: [], subPropertyOf, functional: false,
        };
        try {
            await API.createDP(prop);
            this._selectedId = id;
            this._topPropSelected = false;
            this._editingId = id;
            await APP.refresh();
            APP.renderSection('datatype-properties');
        } catch (e) { UI.error(e.message); }
    },

    // ── Menu contextuel ──────────────────────────────────────────

    showContextMenu(event, id) {
        event.preventDefault();
        event.stopPropagation();
        if (id) this.selectProp(id);
        else    this.selectTopProp();
        this._closeContextMenu();

        const isProp = !!id;
        const menu = document.createElement('div');
        menu.id = 'dp-ctx-menu';
        menu.className = 'ctx-menu';
        menu.innerHTML = `
            <div class="ctx-item" onclick="DPEditor._closeContextMenu();DPEditor.createChild()">
                ${this._svgChild} Add Child Property</div>
            ${isProp ? `<div class="ctx-item" onclick="DPEditor._closeContextMenu();DPEditor.createSibling()">
                ${this._svgSister} Add Sibling Property</div>
            <div class="ctx-sep"></div>
            <div class="ctx-item ctx-danger" onclick="DPEditor._closeContextMenu();DPEditor.deleteSelected()">
                ${this._svgDelete} Delete</div>` : ''}
        `;
        menu.style.left = event.clientX + 'px';
        menu.style.top  = event.clientY + 'px';
        document.body.appendChild(menu);
        requestAnimationFrame(() => {
            const r = menu.getBoundingClientRect();
            if (r.right  > window.innerWidth)  menu.style.left = (event.clientX - r.width)  + 'px';
            if (r.bottom > window.innerHeight)  menu.style.top  = (event.clientY - r.height) + 'px';
        });
        const close = (e) => {
            if (!menu.contains(e.target)) {
                this._closeContextMenu();
                document.removeEventListener('click', close, true);
            }
        };
        setTimeout(() => document.addEventListener('click', close, true), 0);
    },

    _closeContextMenu() {
        document.getElementById('dp-ctx-menu')?.remove();
    },

    // ── Drag & Drop ──────────────────────────────────────────────

    onDragStart(event, id) {
        this._dragId = id;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', id);
        setTimeout(() => event.target.classList.add('dragging'), 0);
    },

    onDragOver(event, targetId) {
        if (!this._dragId) return;
        if (this._dragId === targetId) return;
        if (this._isDescendant(targetId, this._dragId)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        event.currentTarget.classList.add('drag-over');
    },

    onDragLeave(event) {
        event.currentTarget.classList.remove('drag-over');
    },

    async onDrop(event, targetId) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');
        const draggedId = this._dragId;
        this._dragId = null;
        if (!draggedId || draggedId === targetId) return;
        if (this._isDescendant(targetId, draggedId)) {
            UI.warn('Cannot drop on a descendant — would create a cycle');
            return;
        }
        const prop = (APP.state.datatype_properties || []).find(p => p.id === draggedId);
        if (!prop) return;
        const newParents = targetId ? [targetId] : [];
        const updated = { ...prop, subPropertyOf: newParents };
        if (targetId) this._expanded.add(targetId);
        this._selectedId = draggedId;
        this._editingId  = draggedId;
        this._topPropSelected = false;
        try {
            await API.updateDP(draggedId, updated);
            UI.success(`'${draggedId}' moved`);
            await APP.refresh();
            APP.renderSection('datatype-properties');
        } catch (e) { UI.error(e.message); }
    },

    onDragEnd(event) {
        event.target.classList.remove('dragging');
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        this._dragId = null;
    },

    _isDescendant(potentialDesc, ancestorId) {
        if (!potentialDesc || !ancestorId) return false;
        const { childrenOf } = this.buildTree(APP.state.datatype_properties || []);
        const visit = (id) => {
            if (id === potentialDesc) return true;
            return (childrenOf[id] || []).some(child => visit(child));
        };
        return visit(ancestorId);
    },

    deleteSelected() { if (this._selectedId) this.delete(this._selectedId); },

    // ── Formulaire style Protégé ─────────────────────────────────

    renderForm(prop = null) {
        const isNew = !prop;
        DPEditor._editingId = isNew ? null : prop.id;
        const p = prop || { id: '', annotations: { labels: [], comments: [] },
            domain: [], range: [], subPropertyOf: [], functional: false };
        const chars = { functional: p.functional || false };
        const ac    = isNew ? '' : 'onchange="DPEditor.autoSave()"';
        const baseIri = (APP.state.ontology?.id || '').replace(/#$/, '');
        const propIri = (p.id && baseIri) ? `${baseIri}#${p.id}` : '';

        // Annotations
        const annoRows = [
            ...(p.annotations?.labels   || []).map(l  => _annoRow('label',   l.value,  l.lang  || 'fr', 'DPEditor', ac)),
            ...(p.annotations?.comments || []).map(cm => _annoRow('comment', cm.value, cm.lang || 'fr', 'DPEditor', ac)),
            ...(p.annotations?.other    || []).map(a  => _annoRow('other',   a.value,  '',             'DPEditor', ac, a.property)),
        ].join('');

        // Domain
        const domainRows = _listRows(p.domain || [], 'dp-domain-list', 'DPEditor.removeDomain', 'cls-dot', '', '', 'classes');
        const availDomain = (APP.state.classes || []).filter(c => !(p.domain||[]).includes(c.id))
            .map(c => `<option value="${c.id}">${c.id}</option>`).join('');

        // Range (type XSD — 1 seule valeur)
        const rangeRows = _listRows(p.range || [], 'dp-range-list', 'DPEditor.removeRange', 'xsd-dot');
        const rangePickerItems = XSD_TYPES.filter(t => !(p.range||[]).includes(t))
            .map(t => `<div class="tree-item" data-id="${t}"
                style="padding:2px 8px" onclick="DPEditor.addRange(this.dataset.id)">
                <span class="xsd-dot"></span>
                <span class="tree-label">${t}</span>
            </div>`).join('');

        const ico = `<svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="4.5" y1=".5" x2="4.5" y2="8.5"/><line x1=".5" y1="4.5" x2="8.5" y2="4.5"/></svg>`;

        return `
        <div class="cls-editor">
            <div class="cls-editor-hdr">
                <div class="cls-editor-title">DATATYPE PROPERTY EDITOR for&nbsp;
                    <input type="text" id="dp-id" class="cls-id-inp" value="${p.id}" placeholder="NewDatatypeProperty" ${ac} title="Identifiant IRI local">
                    <span class="cls-editor-meta">(instance of owl:DatatypeProperty)</span>
                </div>
                ${propIri ? `<div class="cls-editor-iri">For Property:&nbsp;<code>${propIri}</code></div>` : ''}
                ${isNew ? `<div style="margin-top:8px"><button class="btn-primary btn-sm" onclick="DPEditor.save(true)">✅ Create</button></div>` : ''}
            </div>

            <div class="cls-frame">
                <div class="cls-frame-bar">
                    <span class="cls-frame-tag">Annotation(s)</span>
                    <button class="btn-ftool" onclick="DPEditor.addAnnotRow('label')"   title="Ajouter rdfs:label">${ico}&thinsp;label</button>
                    <button class="btn-ftool" onclick="DPEditor.addAnnotRow('comment')" title="Ajouter rdfs:comment">${ico}&thinsp;comment</button>
                    <button class="btn-ftool" onclick="_togglePicker('dp-anno-picker')" title="Add annotation property">${ico}&thinsp;Annotation Property</button>
                </div>
                <div class="cls-frame-body">
                    <table class="cls-anno-table">
                        <thead><tr><th>Property</th><th>Value</th><th>Lang</th><th></th></tr></thead>
                        <tbody id="dp-annotations-body">${annoRows}</tbody>
                    </table>
                    <div id="dp-anno-picker" class="cls-tree-picker" style="display:none">
                        ${_annoPickerItems('DPEditor')}
                    </div>
                </div>
            </div>

            <div class="h-resizer"></div>

            <div class="cls-frames-row">
                <div class="cls-frame cls-frame-half">
                    <div class="cls-frame-bar">
                        <span class="cls-frame-tag">Domain(s)</span>
                        <button class="btn-ftool" onclick="DPEditor.showPicker('dp-domain-picker')" title="Ajouter domaine">${ico}</button>
                    </div>
                    <div class="cls-frame-body" id="dp-domain-list">
                        ${domainRows || '<div class="cls-list-empty">owl:Thing</div>'}
                        <select id="dp-domain-picker" class="cls-picker" style="display:none" onchange="DPEditor.addDomain(this.value)">
                            <option value="">— choose —</option>${availDomain}</select>
                    </div>
                </div>
                <div class="cls-frame cls-frame-half">
                    <div class="cls-frame-bar">
                        <span class="cls-frame-tag">Range</span>
                        <button id="dp-range-btn" class="btn-ftool"
                                style="${(p.range||[]).length > 0 ? 'display:none' : ''}"
                                onclick="DPEditor.showPicker('dp-range-picker')"
                                title="Set XSD type">${ico}</button>
                    </div>
                    <div class="cls-frame-body" id="dp-range-list">
                        ${rangeRows || '<div class="cls-list-empty">rdfs:Literal</div>'}
                        <div id="dp-range-picker" class="cls-tree-picker" style="display:none">
                            <div class="cls-picker-hdr">— choose —</div>
                            ${rangePickerItems}
                        </div>
                    </div>
                </div>
            </div>

            <div class="h-resizer"></div>

            <div class="cls-frame">
                <div class="cls-frame-bar"><span class="cls-frame-tag cls-frame-tag-blue">Characteristics</span></div>
                <div class="cls-frame-body">
                    <div class="chars-grid">
                        <label class="char-check"><input type="checkbox" id="dp-functional" ${chars.functional ? 'checked':''} ${ac}> Functional</label>
                    </div>
                </div>
            </div>

            ${_whereUsedFrame(r => _ruleUsesProperty(r, p.id))}
        </div>`;
    },

    // ── Helpers annotations ──────────────────────────────────────

    addAnnotRow(type) {
        const ac = this._editingId !== null ? 'onchange="DPEditor.autoSave()"' : '';
        document.getElementById('dp-annotations-body')?.appendChild(_makeAnnotRow(type, 'DPEditor', ac));
    },
    addOtherAnnotRow(prop) {
        const ac = this._editingId !== null ? 'onchange="DPEditor.autoSave()"' : '';
        document.getElementById('dp-annotations-body')?.appendChild(_makeAnnotRow('other', 'DPEditor', ac, prop));
        document.getElementById('dp-anno-picker').style.display = 'none';
    },
    removeAnnotRow(btn) { btn.closest('tr')?.remove(); if (this._editingId !== null) this.autoSave(); },

    // ── Helpers pickers ──────────────────────────────────────────

    showPicker(id) {
        // Unicité du range : si un type est déjà défini, ne pas ouvrir le picker
        if (id === 'dp-range-picker') {
            const list = document.getElementById('dp-range-list');
            if (list && list.querySelector('.cls-list-item[data-id]')) return;
        }
        _togglePicker(id);
    },

    addDomain(id)    { _addListItem(id, 'dp-domain-list', 'dp-domain-picker', 'DPEditor.removeDomain', 'cls-dot', '', '', 'classes'); if (id && this._editingId !== null) this.autoSave(); },
    removeDomain(id) { _removeListItem(id, 'dp-domain-list', 'owl:Thing'); if (this._editingId !== null) this.autoSave(); },

    addRange(id) {
        if (!id) return;
        _addListItem(id, 'dp-range-list', 'dp-range-picker', 'DPEditor.removeRange', 'xsd-dot');
        // Unicité : masquer le bouton + après ajout
        const btn = document.getElementById('dp-range-btn');
        if (btn) btn.style.display = 'none';
        if (this._editingId !== null) this.autoSave();
    },
    removeRange(id) {
        _removeListItem(id, 'dp-range-list', 'rdfs:Literal');
        // Réafficher le bouton + après suppression
        const btn = document.getElementById('dp-range-btn');
        if (btn) btn.style.display = '';
        if (this._editingId !== null) this.autoSave();
    },

    addSubProp(id)    { _addListItem(id, 'dp-sub-list', 'dp-sub-picker', 'DPEditor.removeSubProp', 'dp-prop-dot', '', '', 'datatype-properties'); if (id && this._editingId !== null) this.autoSave(); },
    removeSubProp(id) { _removeListItem(id, 'dp-sub-list'); if (this._editingId !== null) this.autoSave(); },

    // ── Sauvegarde / suppression ─────────────────────────────────

    autoSave() { if (this._editingId !== null) this.save(false); },

    async save(isNew) {
        const originalId = isNew ? null : this._editingId;
        const id = document.getElementById('dp-id').value.trim();
        if (!id) return UI.error('L\'identifiant est obligatoire');

        const { labels, comments, other } = _collectAnnotations('dp-annotations-body');
        const domain  = _collectList('dp-domain-list');
        const range   = _collectList('dp-range-list');
        const subPropertyOf = _collectList('dp-sub-list');

        const prop = { id, annotations: { labels, comments, other },
            domain, range, subPropertyOf,
            functional: document.getElementById('dp-functional')?.checked || false };

        try {
            if (isNew) {
                await API.createDP(prop);
                UI.success(`DatatypeProperty '${id}' created`);
                this._selectedId = id; this._editingId = id;
            } else {
                await API.updateDP(originalId, prop);
                if (id !== originalId) UI.success(`Property renamed → '${id}'`);
                this._selectedId = id; this._editingId = id;
            }
            await APP.refresh();
            APP.renderSection('datatype-properties');
        } catch (e) { UI.error(e.message); }
    },

    async delete(id) {
        if (!await UI.confirm(`Delete DatatypeProperty <strong>${id}</strong>?`)) return;
        try {
            await API.deleteDP(id);
            UI.success(`DatatypeProperty '${id}' deleted`);
            this._selectedId = null; this._editingId = null;
            await APP.refresh(); APP.renderSection('datatype-properties');
        } catch (e) { UI.error(e.message); }
    },
};


// ════════════════════════════════════════════════════════════════
// INDIVIDUS
// ════════════════════════════════════════════════════════════════

const IndividualEditor = {

    _editingId:         null,   // ID de l'individu en cours d'édition (null = nouveau)
    _selectedClassId:   null,   // null = owl:Thing (tous) ; string = IRI de classe
    _selectedIndId:     null,   // dernier individu sélectionné (formulaire col 3)
    _selectedIndIds:    new Set(), // tous les individus sélectionnés (multi-sélection)
    _anchorIndId:       null,   // point d'ancrage pour Shift+Click
    _displayProps:      {},     // classId → propId  (règle simple)
    _displayPropsMulti: {},     // classId → [{sep, propId}, ...]  (règle composite)

    // ── Layout 3 colonnes ────────────────────────────────────────

    renderSplit(individuals) {
        const treeContent = this._renderClassTree(individuals);
        const listContent = this._renderIndList(individuals);
        return `
        <div class="section-split">
            <div class="tree-panel" id="ind-tree-panel">
                <div class="tree-panel-header">
                    <h3>Class Hierarchy</h3>
                    <div style="position:relative;flex-shrink:0">
                        <button class="btn-sm" onclick="IndividualEditor._toggleDisplayMenu(event)" title="Display options"><span style="font-size:15px;line-height:1">▾</span></button>
                        <div id="ind-display-menu" class="ctx-menu" style="display:none;position:absolute;top:100%;right:0;min-width:180px;z-index:200">
                            <div class="ctx-item" onclick="IndividualEditor._openDisplayPropModal();IndividualEditor._toggleDisplayMenu()">Set Display Property</div>
                            <div class="ctx-item" onclick="IndividualEditor._openDisplayPropsMultiModal();IndividualEditor._toggleDisplayMenu()">Set Display Properties</div>
                        </div>
                    </div>
                </div>
                <div class="tree-scroll" id="ind-class-tree">${treeContent}</div>
            </div>
            <div class="split-handle" id="ind-split-h1"></div>
            <div class="ind-list-panel" id="ind-list-panel">
                <div class="tree-panel-header">
                    <h3 id="ind-list-title">${this._selectedClassId || 'All Individuals'}</h3>
                    <div style="display:flex;gap:4px;flex-shrink:0;align-items:center">
                        <button class="btn-sm" onclick="IndividualEditor.newIndividual()" title="New individual">➕</button>
                        <button id="ind-del-btn" class="btn-icon btn-icon-danger" ${this._selectedIndId ? '' : 'disabled'}
                                onclick="IndividualEditor.deleteSelected()" title="Delete selected individual">${ClassEditor._svgDelete}</button>
                    </div>
                </div>
                <div class="tree-scroll" id="ind-list-scroll">${listContent}</div>
            </div>
            <div class="split-handle" id="ind-split-h2"></div>
            <div class="detail-panel" id="ind-detail">
                <div class="detail-panel-empty">
                    <span class="xsd-dot" style="width:28px;height:28px"></span>
                    <span>Select an existing <strong>Individual</strong> or create a new one</span>
                    <button class="btn-primary btn-sm" onclick="IndividualEditor.newIndividual()">＋ Create Individual</button>
                </div>
            </div>
        </div>`;
    },

    _renderClassTree(individuals) {
        const classes = APP.state.classes || [];
        const inds    = individuals || APP.state.individuals || [];
        const sel     = this._selectedClassId;
        const { roots, childrenOf } = ClassEditor.buildTree(classes);
        const lines   = [];

        // owl:Thing → tous les individuals
        lines.push(`<div class="tree-item${sel === null ? ' selected' : ''}" data-id="owl:Thing"
            style="padding-left:6px" onclick="IndividualEditor.selectClass(null)">
            <span class="tree-leaf">◦</span>
            <span class="cls-dot tree-thing-dot"></span>
            <span class="tree-label" style="font-style:italic">owl:Thing</span>
            <span class="nav-count" style="margin-left:auto;margin-right:6px">${inds.length}</span>
        </div>`);

        // Collecte récursive de toutes les sous-classes d'un nœud (lui inclus)
        const allDescendants = (id) => {
            const set   = new Set([id]);
            const queue = [...(childrenOf[id] || [])];
            while (queue.length) {
                const c = queue.shift();
                if (!set.has(c)) {
                    set.add(c);
                    (childrenOf[c] || []).forEach(gc => queue.push(gc));
                }
            }
            return set;
        };

        const visit = (id, depth) => {
            const pl   = depth * 16 + 6;
            const desc = allDescendants(id);
            // Compte transitif : individu dont au moins 1 type est dans la descendance
            const count = inds.filter(x => (x.types || []).some(t => desc.has(t))).length;
            lines.push(`<div class="tree-item${id === sel ? ' selected' : ''}" data-id="${id}"
                style="padding-left:${pl}px" onclick="IndividualEditor.selectClass('${id}')">
                <span class="tree-leaf">◦</span>
                <span class="cls-dot tree-cls-dot"></span>
                <span class="tree-label">${id}</span>
                ${count ? `<span class="nav-count" style="margin-left:auto;margin-right:6px">${count}</span>` : ''}
            </div>`);
            (childrenOf[id] || []).forEach(child => visit(child, depth + 1));
        };
        roots.forEach(id => visit(id, 1));

        return lines.join('') || '<div class="cls-list-empty">No classes defined</div>';
    },

    _renderIndList(individuals) {
        const classId = this._selectedClassId;
        const inds    = individuals || APP.state.individuals || [];

        let filtered;
        if (!classId) {
            filtered = inds; // owl:Thing → tous
        } else {
            // Filtrage transitif : individuals de classId ET de toutes ses sous-classes
            const { childrenOf } = ClassEditor.buildTree(APP.state.classes || []);
            const accepted = new Set([classId]);
            const queue = [...(childrenOf[classId] || [])];
            while (queue.length) {
                const c = queue.shift();
                if (!accepted.has(c)) {
                    accepted.add(c);
                    (childrenOf[c] || []).forEach(gc => queue.push(gc));
                }
            }
            filtered = inds.filter(x => (x.types || []).some(t => accepted.has(t)));
        }

        const selId = this._selectedIndId;

        if (!filtered.length) return '<div class="cls-list-empty" style="padding:12px 8px;font-style:italic">No individuals</div>';

        return filtered.map(ind => {
            // Cherche la règle effective pour cet individu
            const resolveForClass = (clsId) => {
                const multi = this._getEffectiveDisplayMulti(clsId);
                if (multi) return { multi };
                const single = this._getEffectiveDisplayProp(clsId);
                if (single) return { single };
                return null;
            };
            let rule = null;
            if (!this._selectedClassId) {
                for (const typeId of (ind.types || [])) {
                    rule = resolveForClass(typeId);
                    if (rule) break;
                }
                if (!rule) rule = resolveForClass(null);
            } else {
                rule = resolveForClass(this._selectedClassId);
            }
            const dispLabel = rule?.multi
                ? this._buildMultiLabel(ind, rule.multi)
                : rule?.single ? this._getDisplayLabel(ind, rule.single) : null;
            const mainText  = dispLabel || ind.id;
            const subText   = dispLabel ? ind.id : '';
            return `
            <div class="tree-item${this._selectedIndIds.has(ind.id) ? ' selected' : ''}" data-id="${ind.id}"
                 style="padding:4px 6px 4px 10px;display:flex;align-items:center;gap:4px;cursor:pointer"
                 onclick="IndividualEditor.selectIndividual('${ind.id}', event.shiftKey)">
                <span class="xsd-dot" style="flex-shrink:0;margin:0"></span>
                <span style="flex:1;overflow:hidden;min-width:0">
                    <span class="tree-label" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;display:block"
                          onmouseover="this.style.textDecoration='underline';this.style.color='var(--accent,#5f8dd3)'"
                          onmouseout="this.style.textDecoration='';this.style.color=''">${mainText}</span>
                    ${subText ? `<span style="font-size:10px;color:var(--text-faint);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block">${subText}</span>` : ''}
                </span>
            </div>`;
        }).join('');
    },

    // ── Sélections ───────────────────────────────────────────────

    selectClass(classId) {
        this._selectedClassId = classId;
        this._selectedIndId   = null;
        this._selectedIndIds.clear();
        this._anchorIndId     = null;
        // Col 1 — surlignage
        document.querySelectorAll('#ind-class-tree .tree-item').forEach(el => {
            const match = classId === null ? el.dataset.id === 'owl:Thing' : el.dataset.id === classId;
            el.classList.toggle('selected', match);
        });
        // Col 2 — titre + liste
        const title = document.getElementById('ind-list-title');
        if (title) title.textContent = classId || 'All Individuals';
        const listScroll = document.getElementById('ind-list-scroll');
        if (listScroll) listScroll.innerHTML = this._renderIndList(APP.state.individuals);
        // Col 3 — vider
        const detail = document.getElementById('ind-detail');
        if (detail) detail.innerHTML = `<div class="detail-panel-empty">
            <span class="cls-dot" style="width:32px;height:32px"></span>
            <strong style="font-family:var(--font-mono);font-size:13px">owl:Thing</strong>
            <span style="color:var(--text-dim);font-size:12px">Root of all OWL classes</span>
            <span style="color:var(--text2);font-size:12px">Select an existing <strong>Individual</strong> or create a new one</span>
            <button class="btn-primary btn-sm" onclick="IndividualEditor.newIndividual()">＋ Create Individual</button>
        </div>`;
        this._editingId = null;
    },

    _setDelBtn(enabled) {
        const btn = document.getElementById('ind-del-btn');
        if (btn) btn.disabled = !enabled;
    },

    selectIndividual(id, isShift = false) {
        if (isShift && this._anchorIndId) {
            // ── Shift+Click : sélection en plage ─────────────────
            const items  = [...document.querySelectorAll('#ind-list-scroll .tree-item[data-id]')];
            const ids    = items.map(el => el.dataset.id);
            const from   = ids.indexOf(this._anchorIndId);
            const to     = ids.indexOf(id);
            if (from !== -1 && to !== -1) {
                const [lo, hi] = from < to ? [from, to] : [to, from];
                this._selectedIndIds = new Set(ids.slice(lo, hi + 1));
            } else {
                this._selectedIndIds.add(id);
            }
        } else {
            // ── Clic simple : sélection unique ────────────────────
            this._selectedIndIds = new Set([id]);
            this._anchorIndId    = id;
        }

        this._selectedIndId = id;
        this._editingId     = this._selectedIndIds.size === 1 ? id : null;
        this._setDelBtn(this._selectedIndIds.size > 0);

        // Col 2 — surlignage multi
        document.querySelectorAll('#ind-list-scroll .tree-item').forEach(el => {
            el.classList.toggle('selected', this._selectedIndIds.has(el.dataset.id));
        });

        // Col 3 — formulaire (1 sélectionné) ou résumé (N sélectionnés)
        const detail = document.getElementById('ind-detail');
        if (!detail) return;
        if (this._selectedIndIds.size === 1) {
            const ind = (APP.state.individuals || []).find(x => x.id === id);
            if (ind) { detail.innerHTML = this.renderForm(ind); _initHResizers('ind-detail'); }
        } else {
            const n = this._selectedIndIds.size;
            const ico = ClassEditor._svgDelete;
            detail.innerHTML = `<div class="detail-panel-empty">
                <span style="font-size:28px">◆◆</span>
                <span><strong>${n}</strong> individuals selected</span>
                <button class="btn-icon btn-icon-danger" onclick="IndividualEditor.deleteSelected()"
                        style="gap:6px">${ico} Delete all selected</button>
            </div>`;
        }
    },

    newIndividual() {
        this._selectedIndId  = null;
        this._selectedIndIds.clear();
        this._anchorIndId    = null;
        this._editingId      = null;
        this._setDelBtn(false);
        // Col 2 — désélectionner
        document.querySelectorAll('#ind-list-scroll .tree-item').forEach(el => el.classList.remove('selected'));
        // Col 3 — formulaire vide
        const detail = document.getElementById('ind-detail');
        if (detail) {
            detail.innerHTML = this.renderForm(null, this._selectedClassId);
            _initHResizers('ind-detail');
        }
    },

    _cancelForm() {
        this._selectedIndId  = null;
        this._selectedIndIds.clear();
        this._anchorIndId    = null;
        this._editingId      = null;
        this._setDelBtn(false);
        document.querySelectorAll('#ind-list-scroll .tree-item').forEach(el => el.classList.remove('selected'));
        const detail = document.getElementById('ind-detail');
        if (detail) detail.innerHTML = `<div class="detail-panel-empty">
            <span class="cls-dot" style="width:32px;height:32px"></span>
            <strong style="font-family:var(--font-mono);font-size:13px">owl:Thing</strong>
            <span style="color:var(--text-dim);font-size:12px">Root of all OWL classes</span>
            <span style="color:var(--text2);font-size:12px">Select an existing <strong>Individual</strong> or create a new one</span>
            <button class="btn-primary btn-sm" onclick="IndividualEditor.newIndividual()">＋ Create Individual</button>
        </div>`;
    },

    async deleteSelected() {
        const toDelete = [...this._selectedIndIds];
        if (!toDelete.length) return;
        const n = toDelete.length;
        const label = n === 1
            ? `individual <strong>${toDelete[0]}</strong>`
            : `<strong>${n}</strong> selected individuals`;
        if (!await UI.confirm(`Delete ${label}?`)) return;
        try {
            for (const id of toDelete) {
                await API.deleteIndividual(id);
            }
            UI.success(`${n} individual(s) deleted`);
            this._selectedIndIds.clear();
            this._selectedIndId = null;
            this._anchorIndId   = null;
            this._editingId     = null;
            this._setDelBtn(false);
            await APP.refresh();
            const classTree = document.getElementById('ind-class-tree');
            if (classTree) classTree.innerHTML = this._renderClassTree(APP.state.individuals);
            const listScroll = document.getElementById('ind-list-scroll');
            if (listScroll) listScroll.innerHTML = this._renderIndList(APP.state.individuals);
            const detail = document.getElementById('ind-detail');
            if (detail) detail.innerHTML = `<div class="detail-panel-empty">
                <span style="font-size:32px">🦉</span>
                <span>Select an individual or create a new one</span>
            </div>`;
        } catch (e) { UI.error(e.message); }
    },

    restoreSelection() {
        this._initSplitPanes();
        // Col 1 — restaurer surlignage
        const treeId = this._selectedClassId === null ? 'owl:Thing' : this._selectedClassId;
        document.querySelectorAll('#ind-class-tree .tree-item').forEach(el => {
            el.classList.toggle('selected', el.dataset.id === treeId);
        });
        // Col 2 — restaurer le titre (casse exacte de la classe)
        const titleEl = document.getElementById('ind-list-title');
        if (titleEl) titleEl.textContent = this._selectedClassId || 'All Individuals';
        // Col 2 — restaurer surlignage individu
        if (this._selectedIndId) {
            document.querySelectorAll('#ind-list-scroll .tree-item').forEach(el => {
                el.classList.toggle('selected', el.dataset.id === this._selectedIndId);
            });
        }
    },

    // ── Split handles ────────────────────────────────────────────

    _initHandle(handleEl, panelEl, minW = 120, maxW = 520) {
        if (!handleEl || !panelEl) return;
        let dragging = false;
        handleEl.addEventListener('mousedown', e => {
            dragging = true;
            document.body.classList.add('resizing');
            e.preventDefault();
        });
        document.addEventListener('mousemove', e => {
            if (!dragging) return;
            const panelLeft = panelEl.getBoundingClientRect().left;
            const w = Math.max(minW, Math.min(maxW, e.clientX - panelLeft));
            panelEl.style.width = `${w}px`;
            panelEl.style.flex  = 'none';
        });
        document.addEventListener('mouseup', () => {
            if (dragging) { dragging = false; document.body.classList.remove('resizing'); }
        });
    },

    _initSplitPanes() {
        this._initHandle(
            document.getElementById('ind-split-h1'),
            document.getElementById('ind-tree-panel'),
            120, 520
        );
        this._initHandle(
            document.getElementById('ind-split-h2'),
            document.getElementById('ind-list-panel'),
            100, 400
        );
    },

    // ── Formulaire individu ─────────────────────────────────────

    /** Profondeur d'une classe dans la hiérarchie (0 = racine sans parents connus).
     *  BFS itératif, robuste aux cycles. */
    _classDepth(clsId, classes) {
        const visited  = new Set();
        let frontier = [clsId];
        let depth    = 0;
        while (frontier.length) {
            const next = [];
            for (const id of frontier) {
                if (visited.has(id)) continue;
                visited.add(id);
                const cls = classes.find(c => c.id === id);
                if (!cls) continue;
                (cls.subClassOf || [])
                    .filter(s => typeof s === 'string' && classes.some(c => c.id === s))
                    .forEach(p => next.push(p));
            }
            if (!next.length) return depth;
            frontier = next;
            depth++;
        }
        return depth;
    },

    /** Collecte les propriétés des classes de l'individu, séparées en deux maps :
     *  - asserted  : définies directement sur les types de l'individu
     *  - inherited : définies sur les classes ancêtres
     *  Chaque map : propId → { kind: 'op'|'dp', fillers: Set<string> }
     *  Ordonnées par profondeur hiérarchique (classes hautes en premier), puis alpha.
     *  Une propriété ne peut être que dans l'une ou l'autre. */
    _getClassProperties(types) {
        const classes   = APP.state.classes || [];
        const depthCache = {};
        const depth     = (id) => { if (depthCache[id] === undefined) depthCache[id] = this._classDepth(id, classes); return depthCache[id]; };
        const alpha     = (a, b) => a.localeCompare(b);

        const addProp = (map, r) => {
            if (!map.has(r.property)) {
                const kind = (APP.state.object_properties || []).some(p => p.id === r.property) ? 'op' : 'dp';
                map.set(r.property, { kind, fillers: new Set() });
            }
            if (r.filler && (r.type === 'someValuesFrom' || r.type === 'allValuesFrom'))
                map.get(r.property).fillers.add(r.filler);
        };

        // ── Asserted : types directs de l'individu, traités du plus haut au plus bas ──
        const asserted = new Map();
        // Grouper les propriétés de chaque type direct, puis les ordonner par depth + alpha
        const assertedByClass = []; // [{depth, props: [r,...]}]
        const sortedTypes = [...(types || [])].sort((a, b) => depth(a) - depth(b));
        sortedTypes.forEach(typeId => {
            const cls = classes.find(c => c.id === typeId);
            if (!cls) return;
            const props = (cls.subClassOf || []).filter(r => typeof r === 'object' && r.property);
            if (props.length) assertedByClass.push({ d: depth(typeId), typeId, props });
        });
        // Tri : profondeur ascendante, puis alpha sur le typeId pour égalité
        assertedByClass.sort((a, b) => a.d - b.d || alpha(a.typeId, b.typeId));
        assertedByClass.forEach(({ props }) => {
            // Alpha dans la classe courante
            [...props].sort((a, b) => alpha(a.property, b.property))
                      .forEach(r => addProp(asserted, r));
        });

        // ── Inherited : ancêtres, ordonnés du plus haut au plus bas ──────────────
        const inh = new Map();
        // Collecter tous les ancêtres et leurs propriétés
        const ancMap = new Map(); // clsId → [restrictions]
        const visitedAnc = new Set();
        const collectAnc = (clsId) => {
            if (visitedAnc.has(clsId)) return;
            visitedAnc.add(clsId);
            const cls = classes.find(c => c.id === clsId);
            if (!cls) return;
            const props = (cls.subClassOf || []).filter(r => typeof r === 'object' && r.property && !asserted.has(r.property));
            if (props.length) ancMap.set(clsId, props);
            (cls.subClassOf || []).filter(s => typeof s === 'string').forEach(collectAnc);
        };
        sortedTypes.forEach(typeId => {
            const cls = classes.find(c => c.id === typeId);
            if (!cls) return;
            (cls.subClassOf || []).filter(s => typeof s === 'string').forEach(collectAnc);
        });
        // Trier les ancêtres par profondeur ascendante, puis alpha
        [...ancMap.entries()]
            .sort((a, b) => depth(a[0]) - depth(b[0]) || alpha(a[0], b[0]))
            .forEach(([, props]) => {
                [...props].sort((a, b) => alpha(a.property, b.property))
                          .forEach(r => { if (!inh.has(r.property)) addProp(inh, r); });
            });

        return { inherited: inh, asserted };
    },

    /** Rafraîchit la visibilité du bouton + après ajout/suppression d'une valeur */
    _refreshAddBtn(safeId) {
        const body   = document.getElementById(`ind-prop-${safeId}`);
        const panel  = body?.closest('.ind-prop-panel');
        const btn    = document.getElementById(`ind-prop-add-${safeId}`);
        if (!btn || !panel) return;
        const isSingle = panel.dataset.single === 'true';
        const hasValue = body.querySelectorAll('.ind-prop-row').length > 0;
        btn.style.display = (isSingle && hasValue) ? 'none' : '';
    },

    /** Retourne les individuals dont les types correspondent au range d'une OP.
     *  Aucun range → tous les individuals sauf excludeId. */
    _indsOfRange(rangeClasses, excludeId) {
        const allInds = APP.state.individuals || [];
        if (!rangeClasses || rangeClasses.length === 0)
            return allInds.filter(x => x.id !== excludeId);
        const accepted = new Set(rangeClasses);
        return allInds.filter(x =>
            x.id !== excludeId &&
            (x.types || []).some(t => accepted.has(t))
        );
    },

    /** Génère un panel de propriété dynamique pour un individu.
     *  propInfo = { kind: 'op'|'dp', fillers: Set<string> } */
    _renderPropPanel(propId, propInfo, ind, ac, ico) {
        const { kind, fillers } = propInfo;
        const safeId  = propId.replace(/[^a-zA-Z0-9]/g, '_');
        const dotCls  = kind === 'op' ? 'op-prop-dot' : 'dp-prop-dot';

        // Range effectif : prop.range en priorité, sinon fillers des restrictions
        const opData   = kind === 'op' ? (APP.state.object_properties  || []).find(p => p.id === propId) : null;
        const dpData   = kind === 'dp' ? (APP.state.datatype_properties || []).find(p => p.id === propId) : null;
        const propRange      = opData?.range || dpData?.range || [];
        const effectiveRange = [...new Set([...propRange, ...(fillers || [])])];

        // Chip range/multiplicité
        const mult = kind === 'op'
            ? (opData?.characteristics?.functional ? 'single' : 'multiple')
            : (dpData?.functional ? 'single' : 'multiple');
        const rangeChip = effectiveRange.length > 0
            ? `<span class="restr-range-chip">(${mult} ${effectiveRange.join(' or ')})</span>`
            : '';

        // Lignes courantes
        const erStr    = effectiveRange.join(',');
        const isSingle = mult === 'single';
        const delOnclick = "this.closest('.ind-prop-row').remove();IndividualEditor._refreshAddBtn('" + safeId + "');IndividualEditor.autoSave()";
        const addOnclick = kind === 'op'
            ? "IndividualEditor.openPicker('" + propId + "','" + erStr + "')"
            : "IndividualEditor.addPropValue('" + propId + "','" + kind + "')";

        let rows = '';
        if (kind === 'op') {
            const current = (ind?.objectAssertions || []).filter(a => a.property === propId);
            rows = current.map(a => `
                <div class="ind-prop-row" style="display:flex;align-items:center;gap:4px;padding:2px 4px">
                    <span class="xsd-dot" style="flex-shrink:0;margin:0"></span>
                    <span class="ind-op-label" style="flex:1;font-size:12px;font-family:var(--font-mono);cursor:pointer"
                          onclick="APP.navigateTo('individuals','${a.target}')"
                          onmouseover="this.style.textDecoration='underline';this.style.color='var(--accent,#5f8dd3)'"
                          onmouseout="this.style.textDecoration='';this.style.color=''">${a.target}</span>
                    <input type="hidden" class="ind-op-target" value="${a.target}">
                    <button class="btn-frame-del" onclick="${delOnclick}">✕</button>
                </div>`).join('') || '<div class="cls-list-empty">—</div>';
        } else {
            const current  = (ind?.dataAssertions || []).filter(a => a.property === propId);
            const dpData2  = (APP.state.datatype_properties || []).find(p => p.id === propId);
            const defDtype = dpData2?.range?.[0] || 'xsd:string';
            rows = current.map(a => `
                <div class="ind-prop-row" style="display:flex;align-items:center;gap:4px;padding:2px 4px">
                    <input type="text" class="ind-dp-value"
                        value="${(a.value||'').replace(/"/g,'&quot;')}" placeholder="value" ${ac}
                        style="flex:1;font-size:11px;border:1px solid var(--border);border-radius:3px;
                               padding:2px 4px;background:var(--bg2);color:var(--text1)">
                    <span class="ind-dp-type" data-dtype="${a.datatype || defDtype}"
                          style="font-size:10px;color:var(--text-dim);flex-shrink:0">${a.datatype || defDtype}</span>
                    <button class="btn-frame-del" onclick="${delOnclick}">✕</button>
                </div>`).join('') || '<div class="cls-list-empty">—</div>';
        }

        // Masquer le bouton + si single ET déjà une valeur
        const currentCount = kind === 'op'
            ? (ind?.objectAssertions || []).filter(a => a.property === propId).length
            : (ind?.dataAssertions   || []).filter(a => a.property === propId).length;
        const addBtnHidden = isSingle && currentCount > 0;

        return `
        <div class="cls-frame ind-prop-panel" data-prop="${propId}" data-kind="${kind}"
             data-effective-range="${erStr}" data-single="${isSingle}">
            <div class="cls-frame-bar">
                <span class="${dotCls}"></span>
                <span class="cls-frame-tag" style="margin-left:4px">${propId}</span>
                ${rangeChip}
                <button id="ind-prop-add-${safeId}" class="btn-ftool" style="margin-left:auto${addBtnHidden ? ';display:none' : ''}"
                        onclick="${addOnclick}">${ico}</button>
            </div>
            <div class="cls-frame-body" id="ind-prop-${safeId}">${rows}</div>
        </div>`;
    },

    renderForm(ind = null, defaultClassId = null) {
        const isNew = !ind;
        IndividualEditor._editingId = isNew ? null : ind.id;
        const effectiveClass = defaultClassId !== null ? defaultClassId : this._selectedClassId;
        const i = ind || {
            id: '', annotations: { labels: [], comments: [], other: [] },
            types: effectiveClass ? [effectiveClass] : [],
            objectAssertions: [], dataAssertions: [], sameAs: [], differentFrom: [],
        };
        const ac = isNew ? '' : 'onchange="IndividualEditor.autoSave()"';
        const ico = `<svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="4.5" y1="0.5" x2="4.5" y2="8.5"/><line x1="0.5" y1="4.5" x2="8.5" y2="4.5"/></svg>`;

        const baseIri = (APP.state.ontology?.id || '').replace(/#$/, '');
        const indIri  = (i.id && baseIri) ? `${baseIri}#${i.id}` : '';

        // Annotations
        const annoRows = [
            ...(i.annotations?.labels   || []).map(l  => _annoRow('label',   l.value, l.lang  || 'fr', 'IndividualEditor', ac)),
            ...(i.annotations?.comments || []).map(cm => _annoRow('comment', cm.value, cm.lang || 'fr', 'IndividualEditor', ac)),
            ...(i.annotations?.other    || []).map(a  => _annoRow('other',   a.value,  '',             'IndividualEditor', ac, a.property)),
        ].join('');

        // Types
        const typeRows    = _listRows(i.types || [], 'ind-types-list', 'IndividualEditor.removeType', 'cls-dot', '', '', 'classes');
        const typePicker  = (APP.state.classes || [])
            .filter(c => !(i.types || []).includes(c.id))
            .map(c => `<div class="tree-item" data-id="${c.id}" style="padding:3px 8px"
                onclick="IndividualEditor.addType(this.dataset.id)">
                <span class="cls-dot tree-cls-dot"></span>
                <span class="tree-label" style="margin-left:4px">${c.id}</span>
            </div>`).join('') || '<div class="cls-list-empty" style="padding:4px 8px">No classes</div>';

        // Panels dynamiques : inherited d'abord (alpha), puis asserted (alpha)
        const { inherited: inhProps, asserted: assProps } = this._getClassProperties(i.types || []);
        const makePanels = (map) => [...map.entries()]
            .map(([propId, propInfo]) => this._renderPropPanel(propId, propInfo, i, ac, ico))
            .join('<div class="h-resizer"></div>');
        const inhHtml  = makePanels(inhProps);
        const assHtml  = makePanels(assProps);
        const propPanelsHtml = [inhHtml, assHtml].filter(Boolean).join('<div class="h-resizer"></div>');
        const hasProps = inhProps.size + assProps.size > 0;

        return `
        <div class="cls-editor">
            <div class="cls-editor-hdr">
                <div class="cls-editor-title">INDIVIDUAL EDITOR for&nbsp;
                    <input type="text" id="ind-id" class="cls-id-inp" value="${i.id}"
                           placeholder="newIndividual"
                           oninput="this.value=this.value.replace(/\s+/g,'_')"
                           ${isNew
                               ? 'onblur="if(this.value.trim()) IndividualEditor.save(true)"'
                               : ac}
                           title="IRI local identifier — spaces are replaced by _">
                    <span class="cls-editor-meta">(owl:NamedIndividual)</span>
                </div>
                ${indIri ? `<div class="cls-editor-iri">For Individual:&nbsp;<code>${indIri}</code></div>` : ''}
                ${isNew ? `<div style="margin-top:8px">
                    <button class="btn-secondary btn-sm" onclick="IndividualEditor._cancelForm()">Cancel</button>
                </div>` : ''}
            </div>

            <div class="cls-frame">
                <div class="cls-frame-bar">
                    <span class="cls-frame-tag">Annotations</span>
                    <button class="btn-ftool" onclick="IndividualEditor.addAnnotRow('label')">${ico}&thinsp;label</button>
                    <button class="btn-ftool" onclick="IndividualEditor.addAnnotRow('comment')">${ico}&thinsp;comment</button>
                    <button class="btn-ftool" onclick="_togglePicker('ind-anno-picker')" title="Add annotation property">${ico}&thinsp;Annotation Property</button>
                </div>
                <div class="cls-frame-body">
                    <table class="cls-anno-table">
                        <thead><tr><th>Property</th><th>Value</th><th>Lang</th><th></th></tr></thead>
                        <tbody id="ind-annotations-body">${annoRows}</tbody>
                    </table>
                    <div id="ind-anno-picker" class="cls-tree-picker" style="display:none">
                        ${_annoPickerItems('IndividualEditor')}
                    </div>
                </div>
            </div>

            <div class="h-resizer"></div>

            <div class="cls-frame">
                <div class="cls-frame-bar">
                    <span class="cls-frame-tag">Types (rdf:type)</span>
                    <button class="btn-ftool" onclick="IndividualEditor.showPicker('ind-type-picker')">${ico}</button>
                </div>
                <div class="cls-frame-body" id="ind-types-list">
                    ${typeRows || '<div class="cls-list-empty">owl:NamedIndividual</div>'}
                    <div id="ind-type-picker" class="cls-tree-picker" style="display:none">${typePicker}</div>
                </div>
            </div>

            ${hasProps ? `<div class="h-resizer"></div>${propPanelsHtml}` : ''}

        </div>`;
    },

    // ── Helpers annotations ──────────────────────────────────────

    addAnnotRow(type) {
        const ac = this._editingId !== null ? 'onchange="IndividualEditor.autoSave()"' : '';
        document.getElementById('ind-annotations-body')?.appendChild(_makeAnnotRow(type, 'IndividualEditor', ac));
    },
    removeAnnotRow(btn) { btn.closest('tr')?.remove(); if (this._editingId !== null) this.autoSave(); },

    addOtherAnnotRow(prop) {
        const ac = this._editingId !== null ? 'onchange="IndividualEditor.autoSave()"' : '';
        document.getElementById('ind-annotations-body')?.appendChild(_makeAnnotRow('other', 'IndividualEditor', ac, prop));
        document.getElementById('ind-anno-picker')?.style.setProperty('display', 'none');
    },

    // ── Helpers types ────────────────────────────────────────────

    showPicker(id) { _togglePicker(id); },

    addType(id) {
        _addListItem(id, 'ind-types-list', 'ind-type-picker', 'IndividualEditor.removeType', 'cls-dot', '', '', 'classes');
        if (this._editingId !== null) this.autoSave();
    },
    removeType(id) {
        _removeListItem(id, 'ind-types-list', '');
        const list = document.getElementById('ind-types-list');
        if (list && !list.querySelector('.cls-list-item[data-id]'))
            list.insertAdjacentHTML('afterbegin', '<div class="cls-list-empty">owl:NamedIndividual</div>');
        if (this._editingId !== null) this.autoSave();
    },

    // ── Ajout d'une valeur dans un panel dynamique ───────────────

    addPropValue(propId, kind) {
        const safeId = propId.replace(/[^a-zA-Z0-9]/g, '_');
        const body   = document.getElementById(`ind-prop-${safeId}`);
        if (!body) return;
        // Bloquer si single et déjà une valeur
        const panel    = body.closest('.ind-prop-panel');
        const isSingle = panel?.dataset?.single === 'true';
        if (isSingle && body.querySelectorAll('.ind-prop-row').length > 0) return;
        body.querySelector('.cls-list-empty')?.remove();
        const ac  = this._editingId !== null ? 'onchange="IndividualEditor.autoSave()"' : '';
        const row = document.createElement('div');
        row.className = 'ind-prop-row';
        row.style.cssText = 'display:flex;align-items:center;gap:4px;padding:2px 4px';
        if (kind === 'op') {
            // Lire le range effectif stocké sur le panel (prop.range OU fillers de restrictions)
            const panel         = body.closest('.ind-prop-panel');
            const effectiveRange = (panel?.dataset?.effectiveRange || '').split(',').filter(Boolean);
            const rangeInds     = this._indsOfRange(effectiveRange, this._editingId);
            const opts = rangeInds.map(x => `<option value="${x.id}">${x.id}</option>`).join('');
            row.innerHTML = `
                <span class="xsd-dot" style="flex-shrink:0;margin:0"></span>
                <select class="ind-op-target" ${ac} style="flex:1;font-size:11px">
                    <option value="">— individual —</option>${opts}
                </select>
                <button class="btn-frame-del" onclick="this.closest('.ind-prop-row').remove();IndividualEditor.autoSave()">✕</button>`;
        } else {
            const dpData   = (APP.state.datatype_properties || []).find(p => p.id === propId);
            const defDtype = dpData?.range?.[0] || 'xsd:string';
            row.innerHTML = `
                <input type="text" class="ind-dp-value" placeholder="value" ${ac}
                    style="flex:1;font-size:11px;border:1px solid var(--border);border-radius:3px;
                           padding:2px 4px;background:var(--bg2);color:var(--text1)">
                <span class="ind-dp-type" data-dtype="${defDtype}"
                      style="font-size:10px;color:var(--text-dim);flex-shrink:0">${defDtype}</span>
                <button class="btn-frame-del" onclick="this.closest('.ind-prop-row').remove();IndividualEditor._refreshAddBtn('${safeId}');IndividualEditor.autoSave()">✕</button>`;
        }
        body.appendChild(row);
        this._refreshAddBtn(safeId);
    },

    // ── Picker modal "Select Resource" ──────────────────────────

    _picker: { propId: null, effectiveRange: [], selectedClass: null, selectedInd: null },

    /** Ouvre le modal de sélection d'individu pour une OP */
    openPicker(propId, effectiveRangeStr) {
        const effectiveRange = (effectiveRangeStr || '').split(',').filter(Boolean);
        this._picker = { propId, effectiveRange, selectedClass: null, selectedInd: null };

        // Construire l'arbre des classes pertinentes
        const { childrenOf } = ClassEditor.buildTree(APP.state.classes || []);
        const allInds = APP.state.individuals || [];

        const countFor = (clsId) => {
            const accepted = new Set();
            const addDesc = (id) => { accepted.add(id); (childrenOf[id]||[]).forEach(c => { if(!accepted.has(c)) addDesc(c); }); };
            addDesc(clsId);
            return allInds.filter(x => (x.types||[]).some(t => accepted.has(t))).length;
        };

        const renderClsTree = (roots, clsIds) => {
            const lines = [];
            const visit = (id, depth) => {
                const pl = depth * 14 + 8;
                const n  = countFor(id);
                lines.push(`<div class="tree-item ind-picker-cls" data-id="${id}"
                    style="padding-left:${pl}px" onclick="IndividualEditor.pickerSelectClass('${id}')">
                    <span class="cls-dot tree-cls-dot"></span>
                    <span class="tree-label" style="flex:1">${id}</span>
                    ${n ? `<span class="nav-count" style="margin-right:6px">${n}</span>` : ''}
                </div>`);
                (childrenOf[id]||[]).forEach(c => { if (clsIds.has(c)) visit(c, depth+1); });
            };
            roots.forEach(id => visit(id, 0));
            return lines.join('') || '<div class="cls-list-empty" style="padding:8px">—</div>';
        };

        // Construire l'ensemble des classes à afficher (range + descendants)
        const clsIds = new Set(effectiveRange);
        const addDesc = (id) => (childrenOf[id]||[]).forEach(c => { if(!clsIds.has(c)){ clsIds.add(c); addDesc(c); } });
        effectiveRange.forEach(r => addDesc(r));

        const roots = effectiveRange.length > 0 ? effectiveRange : [];
        const clsHtml = renderClsTree(roots, clsIds);

        const modal = document.createElement('div');
        modal.id = 'ind-picker-overlay';
        modal.className = 'ind-picker-overlay';
        modal.innerHTML = `
        <div class="ind-picker-modal">
            <div class="ind-picker-hdr">
                <span style="font-weight:600">Select Resource — <code style="font-size:11px">${propId}</code></span>
                <button class="btn-sm" onclick="IndividualEditor.closePicker()">✕</button>
            </div>
            <div class="ind-picker-body">
                <div class="ind-picker-classes" id="ind-picker-cls-panel">
                    <div class="tree-panel-header" style="padding:4px 8px"><h3>Allowed Classes</h3></div>
                    <div id="ind-picker-cls-tree">${clsHtml}</div>
                </div>
                <div class="ind-picker-inds">
                    <div class="tree-panel-header" style="padding:4px 8px"><h3 id="ind-picker-cls-title">— select a class —</h3></div>
                    <div id="ind-picker-ind-list"><div class="cls-list-empty" style="padding:8px;font-style:italic">Select a class</div></div>
                </div>
            </div>
            <div class="ind-picker-ftr">
                <button id="ind-picker-ok" class="btn-primary btn-sm" disabled
                        onclick="IndividualEditor.confirmPicker()">OK</button>
                <button class="btn-secondary btn-sm" onclick="IndividualEditor.closePicker()">Cancel</button>
            </div>
        </div>`;
        document.body.appendChild(modal);

        // Sélectionner la première classe par défaut si une seule range
        if (effectiveRange.length === 1) this.pickerSelectClass(effectiveRange[0]);
    },

    pickerSelectClass(classId) {
        this._picker.selectedClass = classId;
        this._picker.selectedInd   = null;

        // Surligner dans l'arbre
        document.querySelectorAll('#ind-picker-cls-tree .ind-picker-cls').forEach(el =>
            el.classList.toggle('selected', el.dataset.id === classId));

        // Mettre à jour le titre
        const title = document.getElementById('ind-picker-cls-title');
        if (title) title.textContent = classId;

        // Lister les individuals de cette classe (et sous-classes)
        const { childrenOf } = ClassEditor.buildTree(APP.state.classes || []);
        const accepted = new Set();
        const addDesc = (id) => { accepted.add(id); (childrenOf[id]||[]).forEach(c => { if(!accepted.has(c)) addDesc(c); }); };
        addDesc(classId);

        const matching = (APP.state.individuals || [])
            .filter(x => x.id !== this._editingId && (x.types||[]).some(t => accepted.has(t)));

        const listHtml = matching.length
            ? matching.map(x => `
                <div class="tree-item ind-picker-ind" data-id="${x.id}"
                     style="padding:4px 10px;cursor:pointer"
                     onclick="IndividualEditor.pickerSelectInd('${x.id}')"
                     ondblclick="IndividualEditor.pickerSelectInd('${x.id}');IndividualEditor.confirmPicker()">
                    <span class="xsd-dot" style="margin:0 6px 0 0;flex-shrink:0"></span>
                    <span class="tree-label">${x.id}</span>
                </div>`).join('')
            : '<div class="cls-list-empty" style="padding:8px;font-style:italic">No individuals</div>';

        const listEl = document.getElementById('ind-picker-ind-list');
        if (listEl) listEl.innerHTML = listHtml;

        // Désactiver OK (plus aucun individu sélectionné)
        const ok = document.getElementById('ind-picker-ok');
        if (ok) ok.disabled = true;
    },

    pickerSelectInd(indId) {
        this._picker.selectedInd = indId;
        document.querySelectorAll('#ind-picker-ind-list .ind-picker-ind').forEach(el =>
            el.classList.toggle('selected', el.dataset.id === indId));
        const ok = document.getElementById('ind-picker-ok');
        if (ok) ok.disabled = false;
    },

    confirmPicker() {
        const { propId, selectedInd } = this._picker;
        if (!selectedInd || !propId) return;

        const safeId = propId.replace(/[^a-zA-Z0-9]/g, '_');
        const body   = document.getElementById(`ind-prop-${safeId}`);
        if (body) {
            // Bloquer si single et déjà une valeur
            const panel    = body.closest('.ind-prop-panel');
            const isSingle = panel?.dataset?.single === 'true';
            if (isSingle && body.querySelectorAll('.ind-prop-row').length > 0) {
                this.closePicker();
                return;
            }
            body.querySelector('.cls-list-empty')?.remove();
            const row = document.createElement('div');
            row.className = 'ind-prop-row';
            row.style.cssText = 'display:flex;align-items:center;gap:4px;padding:2px 4px';
            row.innerHTML = `
                <span class="xsd-dot" style="flex-shrink:0;margin:0"></span>
                <span class="ind-op-label" style="flex:1;font-size:12px;font-family:var(--font-mono);cursor:pointer"
                      onclick="APP.navigateTo('individuals','${selectedInd}')"
                      onmouseover="this.style.textDecoration='underline';this.style.color='var(--accent,#5f8dd3)'"
                      onmouseout="this.style.textDecoration='';this.style.color=''">${selectedInd}</span>
                <input type="hidden" class="ind-op-target" value="${selectedInd}">
                <button class="btn-frame-del" onclick="this.closest('.ind-prop-row').remove();IndividualEditor._refreshAddBtn('${safeId}');IndividualEditor.autoSave()">✕</button>`;
            body.appendChild(row);
            this._refreshAddBtn(safeId);
            if (this._editingId !== null) this.autoSave();
        }
        this.closePicker();
    },

    closePicker() {
        document.getElementById('ind-picker-overlay')?.remove();
        this._picker = { propId: null, effectiveRange: [], selectedClass: null, selectedInd: null };
    },

    // ── Display Property ─────────────────────────────────────────

    _toggleDisplayMenu(e) {
        if (e) e.stopPropagation();
        const menu = document.getElementById('ind-display-menu');
        if (!menu) return;
        const visible = menu.style.display !== 'none';
        menu.style.display = visible ? 'none' : '';
        if (!visible) {
            const close = () => { menu.style.display = 'none'; document.removeEventListener('click', close); };
            setTimeout(() => document.addEventListener('click', close), 0);
        }
    },

    /** Retourne la règle d'affichage effective pour une classe.
     *  Remonte la hiérarchie si aucune règle n'est définie sur la classe elle-même. */
    _getEffectiveDisplayProp(classId, _visited = new Set()) {
        const key = classId || '__root__';
        if (key in this._displayProps) return this._displayProps[key] || null;
        if (!classId) return null;
        if (_visited.has(classId)) return null;
        _visited.add(classId);
        const classes = APP.state.classes || [];
        const cls = classes.find(c => c.id === classId);
        if (!cls) return null;
        for (const parent of (cls.subClassOf || []).filter(s => typeof s === 'string')) {
            const rule = this._getEffectiveDisplayProp(parent, _visited);
            if (rule) return rule;
        }
        return null;
    },

    /** Valeur à afficher pour un individu selon une display property donnée */
    _getDisplayLabel(ind, prop) {
        if (!prop) return null;
        if (prop === 'rdfs:label')   return (ind.annotations?.labels   || [])[0]?.value || null;
        if (prop === 'rdfs:comment') return (ind.annotations?.comments || [])[0]?.value || null;
        const other = (ind.annotations?.other || []).find(a => a.property === prop);
        if (other) return other.value;
        const da = (ind.dataAssertions || []).find(a => a.property === prop);
        if (da) return da.value;
        const oa = (ind.objectAssertions || []).find(a => a.property === prop);
        if (oa) return oa.target;
        return null;
    },

    /** Définit (ou supprime) la règle d'affichage pour la classe courante */
    setDisplayProp(propId) {
        const key = this._selectedClassId || '__root__';
        if (propId) this._displayProps[key] = propId;
        else delete this._displayProps[key];
        document.getElementById('ind-disp-modal')?.remove();
        const listScroll = document.getElementById('ind-list-scroll');
        if (listScroll) listScroll.innerHTML = this._renderIndList(APP.state.individuals);
        if (this._selectedIndId) {
            document.querySelectorAll('#ind-list-scroll .tree-item').forEach(el =>
                el.classList.toggle('selected', el.dataset.id === this._selectedIndId));
        }
    },

    // ── Display Properties (composite) ──────────────────────────

    /** Règle composite effective (avec héritage hiérarchique) */
    _getEffectiveDisplayMulti(classId, _visited = new Set()) {
        const key = classId || '__root__';
        if (key in this._displayPropsMulti) return this._displayPropsMulti[key] || null;
        if (!classId) return null;
        if (_visited.has(classId)) return null;
        _visited.add(classId);
        const classes = APP.state.classes || [];
        const cls = classes.find(c => c.id === classId);
        if (!cls) return null;
        for (const parent of (cls.subClassOf || []).filter(s => typeof s === 'string')) {
            const rule = this._getEffectiveDisplayMulti(parent, _visited);
            if (rule) return rule;
        }
        return null;
    },

    /** Construit le label composite à partir des lignes {sep, propId} */
    _buildMultiLabel(ind, rows) {
        if (!rows || !rows.length) return null;
        let result = '';
        let hasValue = false;
        for (const { sep, propId } of rows) {
            const val = this._getDisplayLabel(ind, propId);
            if (val) { result += (sep || '') + val; hasValue = true; }
        }
        return hasValue ? result.trim() || null : null;
    },

    /** Enregistre la règle composite pour la classe courante */
    setDisplayPropsMulti(rows) {
        const key = this._selectedClassId || '__root__';
        const cleaned = (rows || []).filter(r => r.propId);
        if (cleaned.length) this._displayPropsMulti[key] = cleaned;
        else delete this._displayPropsMulti[key];
        document.getElementById('ind-disp-multi-modal')?.remove();
        const listScroll = document.getElementById('ind-list-scroll');
        if (listScroll) listScroll.innerHTML = this._renderIndList(APP.state.individuals);
        if (this._selectedIndId)
            document.querySelectorAll('#ind-list-scroll .tree-item').forEach(el =>
                el.classList.toggle('selected', el.dataset.id === this._selectedIndId));
    },

    /** Ouvre le modal "Set Display Properties" (composite) */
    _openDisplayPropsMultiModal() {
        const classId  = this._selectedClassId;
        const existing = this._displayPropsMulti[classId || '__root__']
                      || this._getEffectiveDisplayMulti(classId)
                      || [{ sep: '', propId: '' }];

        // Construire la liste des propriétés disponibles (même logique que modal simple)
        const propOpts = this._buildPropOptions(classId);

        const rowHtml = (r, i) => `
            <div class="disp-multi-row" data-idx="${i}" style="display:flex;align-items:center;gap:4px;margin-bottom:4px">
                <input type="text" class="disp-sep" maxlength="5" value="${(r.sep||'').replace(/"/g,'&quot;')}"
                       style="width:44px;padding:2px 4px;font-size:11px;border:1px solid var(--border);border-radius:3px;background:var(--bg2);color:var(--text1);text-align:center"
                       placeholder="text">
                <select class="disp-prop" style="flex:1;font-size:11px">
                    <option value="">— property —</option>
                    ${propOpts.map(({ id, kind, label }) =>
                        `<option value="${id}" ${id === r.propId ? 'selected' : ''}>${label || id}</option>`
                    ).join('')}
                </select>
                <button class="btn-frame-del" onclick="this.closest('.disp-multi-row').remove()">✕</button>
            </div>`;

        const modal = document.createElement('div');
        modal.id = 'ind-disp-multi-modal';
        modal.className = 'ind-picker-overlay';
        modal.innerHTML = `
        <div class="ind-picker-modal" style="width:360px;max-height:480px">
            <div class="ind-picker-hdr">
                <span style="font-weight:600">Set Display Properties
                    ${classId ? `<span style="font-weight:400;font-size:11px;color:var(--text-dim)"> — ${classId}</span>` : ''}
                </span>
                <button class="btn-sm" onclick="document.getElementById('ind-disp-multi-modal').remove()">✕</button>
            </div>
            <div style="padding:8px;overflow-y:auto;flex:1" id="disp-multi-rows">
                ${existing.map((r, i) => rowHtml(r, i)).join('')}
            </div>
            <div style="padding:4px 8px;border-top:1px solid var(--border)">
                <button class="btn-sm" style="width:100%"
                        onclick="IndividualEditor._addDisplayMultiRow('${(propOpts[0]?.id || '')}')">➕ Add row</button>
            </div>
            <div class="ind-picker-ftr">
                <button class="btn-primary btn-sm" onclick="IndividualEditor._confirmDisplayMulti()">OK</button>
                <button class="btn-secondary btn-sm" onclick="IndividualEditor.setDisplayPropsMulti(null)">Clear</button>
                <button class="btn-secondary btn-sm" onclick="document.getElementById('ind-disp-multi-modal').remove()">Cancel</button>
            </div>
        </div>`;
        document.body.appendChild(modal);
    },

    /** Ajoute une ligne dans le modal multi */
    _addDisplayMultiRow(defaultPropId) {
        const container = document.getElementById('disp-multi-rows');
        if (!container) return;
        const classId  = this._selectedClassId;
        const propOpts = this._buildPropOptions(classId);
        const idx = container.querySelectorAll('.disp-multi-row').length;
        const div = document.createElement('div');
        div.className = 'disp-multi-row';
        div.dataset.idx = idx;
        div.style.cssText = 'display:flex;align-items:center;gap:4px;margin-bottom:4px';
        div.innerHTML = `
            <input type="text" class="disp-sep" maxlength="5" value=""
                   style="width:44px;padding:2px 4px;font-size:11px;border:1px solid var(--border);border-radius:3px;background:var(--bg2);color:var(--text1);text-align:center"
                   placeholder="text">
            <select class="disp-prop" style="flex:1;font-size:11px">
                <option value="">— property —</option>
                ${propOpts.map(({ id }) =>
                    `<option value="${id}" ${id === defaultPropId ? 'selected' : ''}>${id}</option>`
                ).join('')}
            </select>
            <button class="btn-frame-del" onclick="this.closest('.disp-multi-row').remove()">✕</button>`;
        container.appendChild(div);
    },

    /** Confirme et sauvegarde la règle composite */
    _confirmDisplayMulti() {
        const rows = [];
        document.querySelectorAll('#disp-multi-rows .disp-multi-row').forEach(row => {
            const sep    = row.querySelector('.disp-sep')?.value || '';
            const propId = row.querySelector('.disp-prop')?.value || '';
            rows.push({ sep, propId });
        });
        this.setDisplayPropsMulti(rows);
    },

    /** Construit la liste des options de propriétés pour les modals */
    _buildPropOptions(classId) {
        const relevantClasses = new Set();
        if (classId) {
            const classes = APP.state.classes || [];
            const addAnc = (id) => {
                if (relevantClasses.has(id)) return;
                relevantClasses.add(id);
                const cls = classes.find(c => c.id === id);
                if (!cls) return;
                (cls.subClassOf || []).filter(s => typeof s === 'string').forEach(addAnc);
            };
            addAnc(classId);
        }
        const { inherited: inh, asserted: ass } = this._getClassProperties(classId ? [classId] : []);
        const covered = new Set([...inh.keys(), ...ass.keys()]);
        const extras = [];
        if (classId) {
            [...(APP.state.object_properties || []), ...(APP.state.datatype_properties || [])].forEach(p => {
                if (!covered.has(p.id) && (p.domain || []).some(d => relevantClasses.has(d))) {
                    covered.add(p.id); extras.push(p.id);
                }
            });
            extras.sort((a, b) => a.localeCompare(b));
        }
        const toOpt = (id) => ({
            id,
            kind: (APP.state.object_properties || []).some(p => p.id === id) ? 'op' : 'dp',
            label: id,
        });
        return [
            { id: 'rdfs:label',   kind: 'anno', label: 'rdfs:label' },
            { id: 'rdfs:comment', kind: 'anno', label: 'rdfs:comment' },
            ...[...inh.keys()].filter(id => id !== 'rdfs:label' && id !== 'rdfs:comment').map(toOpt),
            ...[...ass.keys()].filter(id => id !== 'rdfs:label' && id !== 'rdfs:comment').map(toOpt),
            ...extras.filter(id => id !== 'rdfs:label' && id !== 'rdfs:comment').map(toOpt),
        ];
    },

    /** Ouvre le modal de sélection de propriété d'affichage */
    _openDisplayPropModal() {
        const classId = this._selectedClassId;

        // Collecter la classe et tous ses ancêtres
        const relevantClasses = new Set();
        if (classId) {
            const classes = APP.state.classes || [];
            const addAnc = (id) => {
                if (relevantClasses.has(id)) return;
                relevantClasses.add(id);
                const cls = classes.find(c => c.id === id);
                if (!cls) return;
                (cls.subClassOf || []).filter(s => typeof s === 'string').forEach(addAnc);
            };
            addAnc(classId);
        }

        // Propriétés via restrictions (même ordre que le formulaire individu)
        const { inherited: inh, asserted: ass } = this._getClassProperties(classId ? [classId] : []);

        // Propriétés supplémentaires via domain (non couvertes par les restrictions)
        // Uniquement si une classe concrète est sélectionnée (pas owl:Thing)
        const alreadyCovered = new Set([...inh.keys(), ...ass.keys()]);
        const domainExtras = [];
        if (classId) {
            [...(APP.state.object_properties || []), ...(APP.state.datatype_properties || [])].forEach(p => {
                if (!alreadyCovered.has(p.id) && (p.domain || []).some(d => relevantClasses.has(d))) {
                    alreadyCovered.add(p.id);
                    domainExtras.push(p.id);
                }
            });
            domainExtras.sort((a, b) => a.localeCompare(b));
        }

        const toItem = (id) => ({
            id,
            kind: (APP.state.object_properties || []).some(p => p.id === id) ? 'op' : 'dp',
        });

        // Ordre : inherited (même ordre que le formulaire) → asserted → extras domain
        const classProps = [
            ...[...inh.keys()].map(toItem),
            ...[...ass.keys()].map(toItem),
            ...domainExtras.map(toItem),
        ].filter(({ id }) => id !== 'rdfs:label' && id !== 'rdfs:comment');

        const items = [
            // Annotations : rdfs:label et rdfs:comment seulement
            { id: 'rdfs:label',   kind: 'anno' },
            { id: 'rdfs:comment', kind: 'anno' },
            // Propriétés de la classe (OP + DP via domain)
            ...classProps,
        ];

        const dotFor = (kind) => kind === 'op' ? 'op-prop-dot' : kind === 'dp' ? 'dp-prop-dot' : 'anno-prop-dot';

        // Règle effective : propre à cette classe ou héritée
        const ownRule       = this._displayProps[classId || '__root__'] || null;
        const effectiveProp = this._getEffectiveDisplayProp(classId);
        const hasOwn        = !!ownRule;

        const listHtml = items.map(({ id, kind }) => {
            const isActive   = effectiveProp === id;
            const isOwn      = ownRule === id;
            const isInherited = isActive && !isOwn;
            return `
            <div class="tree-item${isOwn ? ' selected' : ''}" style="padding:4px 12px;cursor:pointer"
                 onclick="IndividualEditor.setDisplayProp('${id}')">
                <span class="${dotFor(kind)}" style="flex-shrink:0;margin-right:6px"></span>
                <span class="tree-label">${id}</span>
                ${isOwn      ? '<span style="margin-left:auto;color:var(--accent)">✓</span>' : ''}
                ${isInherited ? '<span style="margin-left:auto;font-size:10px;color:var(--text-faint)">(inherited)</span>' : ''}
            </div>`;
        }).join('');

        const modal = document.createElement('div');
        modal.id = 'ind-disp-modal';
        modal.className = 'ind-picker-overlay';
        modal.innerHTML = `
        <div class="ind-picker-modal" style="width:320px;max-height:420px">
            <div class="ind-picker-hdr">
                <span style="font-weight:600">Set Display Property
                    ${classId ? `<span style="font-weight:400;font-size:11px;color:var(--text-dim)"> — ${classId}</span>` : ''}
                </span>
                <button class="btn-sm" onclick="document.getElementById('ind-disp-modal').remove()">✕</button>
            </div>
            <div style="overflow-y:auto;flex:1">${listHtml}</div>
            <div class="ind-picker-ftr">
                ${hasOwn ? `<button class="btn-secondary btn-sm" onclick="IndividualEditor.setDisplayProp(null)">Clear (use inherited)</button>` : ''}
                <button class="btn-secondary btn-sm" onclick="document.getElementById('ind-disp-modal').remove()">Cancel</button>
            </div>
        </div>`;
        document.body.appendChild(modal);
    },

    openEdit(id) {
        this.selectIndividual(id);
    },

    autoSave() { if (this._editingId !== null) this.save(false); },

    // ── Sauvegarde ───────────────────────────────────────────────

    async save(isNew) {
        const originalId = isNew ? null : this._editingId;
        const idRaw = document.getElementById('ind-id')?.value.trim() || '';
        const id    = idRaw.replace(/\s+/g, '_');   // espace → underscore (URI valide)
        // Mettre à jour le champ si la valeur a changé
        const idEl = document.getElementById('ind-id');
        if (idEl && id !== idRaw) idEl.value = id;
        if (!id) return UI.error('Identifier is required');

        const { labels, comments, other } = _collectAnnotations('ind-annotations-body');
        const types = _collectList('ind-types-list');

        // Conserver sameAs / differentFrom existants (panels supprimés)
        const existingInd   = (APP.state.individuals || []).find(x => x.id === (originalId || id));
        const sameAs        = existingInd?.sameAs        || [];
        const differentFrom = existingInd?.differentFrom || [];

        // Collecter depuis les panels dynamiques de propriétés
        const objAssertions = [];
        document.querySelectorAll('.ind-prop-panel[data-kind="op"]').forEach(panel => {
            const prop = panel.dataset.prop;
            panel.querySelectorAll('.ind-op-target').forEach(sel => {
                if (sel.value) objAssertions.push({ property: prop, target: sel.value });
            });
        });

        const dataAssertions = [];
        document.querySelectorAll('.ind-prop-panel[data-kind="dp"]').forEach(panel => {
            const prop = panel.dataset.prop;
            panel.querySelectorAll('.ind-prop-row').forEach(row => {
                const value = row.querySelector('.ind-dp-value')?.value?.trim() || '';
                const dtype = row.querySelector('.ind-dp-type')?.dataset?.dtype || 'xsd:string';
                if (value !== '') dataAssertions.push({ property: prop, value, datatype: dtype });
            });
        });

        const ind = {
            id,
            annotations: { labels, comments, other },
            types, objectAssertions: objAssertions,
            dataAssertions, sameAs, differentFrom,
        };

        try {
            if (isNew) {
                await API.createIndividual(ind);
                UI.success(`Individual '${id}' created`);
                await APP.refresh();
                this._selectedIndId = id;
                this._editingId     = id;
                // Col 1 — recalculer les compteurs
                const classTree = document.getElementById('ind-class-tree');
                if (classTree) classTree.innerHTML = this._renderClassTree(APP.state.individuals);
                // Col 2 — mettre à jour la liste
                const listScroll = document.getElementById('ind-list-scroll');
                if (listScroll) listScroll.innerHTML = this._renderIndList(APP.state.individuals);
                // Col 3 — afficher le formulaire de l'individu créé
                const updated = APP.state.individuals.find(x => x.id === id);
                const detail  = document.getElementById('ind-detail');
                if (detail && updated) {
                    detail.innerHTML = this.renderForm(updated);
                    _initHResizers('ind-detail');
                }
            } else {
                await API.updateIndividual(originalId, ind);
                if (id !== originalId) UI.success(`Individual renamed → '${id}'`);
                this._editingId     = id;
                this._selectedIndId = id;
                await APP.refresh();
                // Col 1 — recalculer les compteurs
                const classTree = document.getElementById('ind-class-tree');
                if (classTree) classTree.innerHTML = this._renderClassTree(APP.state.individuals);
                // Col 2 — mettre à jour la liste
                const listScroll = document.getElementById('ind-list-scroll');
                if (listScroll) listScroll.innerHTML = this._renderIndList(APP.state.individuals);
                // Col 3 — afficher les données fraîches
                const updated = APP.state.individuals.find(x => x.id === id);
                const detail  = document.getElementById('ind-detail');
                if (detail && updated) {
                    detail.innerHTML = this.renderForm(updated);
                    _initHResizers('ind-detail');
                }
            }
        } catch (e) { UI.error(e.message); }
    },

    async delete(id) {
        if (!await UI.confirm(`Delete individual <strong>${id}</strong>?`)) return;
        try {
            await API.deleteIndividual(id);
            UI.success(`Individual '${id}' deleted`);
            await APP.refresh();
            // Vider la sélection si c'était l'individu sélectionné
            if (this._selectedIndId === id) {
                this._selectedIndId = null;
                this._editingId     = null;
                const detail = document.getElementById('ind-detail');
                if (detail) detail.innerHTML = `<div class="detail-panel-empty">
                    <span class="xsd-dot" style="width:28px;height:28px;margin:4px"></span>
                    <span>Select an existing Individual or create a new one</span>
                </div>`;
            }
            // Col 1 — recalculer les compteurs
            const classTree = document.getElementById('ind-class-tree');
            if (classTree) classTree.innerHTML = this._renderClassTree(APP.state.individuals);
            // Col 2 — mettre à jour la liste
            const listScroll = document.getElementById('ind-list-scroll');
            if (listScroll) listScroll.innerHTML = this._renderIndList(APP.state.individuals);
        } catch (e) { UI.error(e.message); }
    },
};
