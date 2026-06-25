/**
 * owl_editor.js — OWL Forms: Classes, ObjectProperties, DatatypeProperties, Individuals
 */

// ── OWL 2 Annotation Properties ─────────────────────────────
/** All OWL 2 annotation properties (for the AnnotationProperties tab) */
const ALL_ANNO_PROPS = [
    'rdfs:label', 'rdfs:comment', 'rdfs:seeAlso', 'rdfs:isDefinedBy',
    'owl:versionInfo', 'owl:deprecated', 'owl:priorVersion',
    'owl:backwardCompatibleWith', 'owl:incompatibleWith',
    'skos:prefLabel', 'skos:altLabel', 'skos:hiddenLabel', 'skos:definition',
    'skos:note', 'skos:scopeNote', 'skos:example', 'skos:editorialNote',
    'skos:historyNote', 'skos:changeNote',
];

// ── OWL ID validation ───────────────────────────────────────

/** Sanitize an ID input: replace spaces with _ and remove leading digits.
 *  Called oninput on all ID fields. */
function _sanitizeId(input) {
    let v = input.value.replace(/\s+/g, '_');
    // XML NCName: first char must be letter or underscore
    v = v.replace(/^[0-9]+/, '');
    input.value = v;
}

/** Validate an ID before saving. Returns an error message or null if valid. */
function _validateId(id, label = 'ID') {
    if (!id || !id.trim()) return `${label} is required.`;
    if (/^[0-9]/.test(id)) return `${label} cannot start with a digit (OWL NCName rule).`;
    return null;
}

// ── Helpers UI ──────────────────────────────────────────────

function classOptions(selectedIds = []) {
    const classes = APP.state.classes || [];
    return classes.map(c =>
        `<option value="${c.id}" ${selectedIds.includes(c.id) ? 'selected' : ''}>${c.id}</option>`
    ).join('');
}

/** <option> elements for classes in hierarchical order (same order as the Asserted Hierarchy) */
function classHierarchyOptions(selectedId = '') {
    const classes = APP.state.classes || [];
    if (!classes.length) return '';
    const { roots, childrenOf } = ClassEditor.buildTree(classes);
    const lines = [];
    const visit = (id, depth) => {
        const pad   = '   '.repeat(depth);   // non-breaking spaces for indentation
        const arrow = depth > 0 ? '▸ ' : '';       // ▸ + non-breaking space
        lines.push(`<option value="${id}" ${id === selectedId ? 'selected' : ''}>${pad}${arrow}${id}</option>`);
        (childrenOf[id] || []).forEach(child => visit(child, depth + 1));
    };
    roots.forEach(id => visit(id, 0));
    return lines.join('');
}

/** HTML items for the custom class picker (brown dot + hierarchical order) */
/** Class tree items for a generic picker (domain, range…).
 *  onSelectExpr : JS expression executed on click, e.g. "OPEditor.addDomain(this.dataset.id)" */
/**
 * Generates class tree items for a picker.
 * @param {string}   callExpr    JS expression called with the id as argument,
 *                               ex: "MyEditor.addSomething" → devient MyEditor.addSomething('WhoItem')
 * @param {string[]} [excludeIds] Classes to exclude (already selected, current class…)
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
            // Still show children (class is excluded but not its sub-classes)
            (childrenOf[id] || []).forEach(child => visit(child, depth + 1));
            return;
        }
        const pl = depth * 16 + 6;
        lines.push(`<div class="tree-item" data-id="${id}"
            style="padding-left:${pl}px" onclick="${callExpr}('${id}')">
            <span class="tree-leaf">◦</span>
            <span class="cls-dot tree-cls-dot"></span>
            <span class="tree-label">${_displayRefId(id)}</span>
        </div>`);
        (childrenOf[id] || []).forEach(child => visit(child, depth + 1));
    };
    roots.forEach(id => visit(id, 1));
    return lines.join('');
}

/** Items de l'arbre ObjectProperties pour un picker (inverse, subPropertyOf…)
 *  @param {string}   onSelectExpr  expression onclick
 *  @param {string[]} [excludeIds]  identifiers to exclude from the tree
 */
function _opTreePickerItems(onSelectExpr, excludeIds = []) {
    const excluded = new Set(excludeIds);
    const props = (APP.state.object_properties || []).filter(p => !excluded.has(p.id));
    const { roots, childrenOf, byKey } = OPEditor.buildTree(props);
    const lines = [];
    const visit = (key, depth) => {
        const prop = byKey[key]; if (!prop) return;
        if (excluded.has(prop.id)) return;
        const pl = depth * 16 + 6;
        lines.push(`<div class="tree-item" data-id="${prop.id}"
            style="padding-left:${pl}px" onclick="${onSelectExpr}">
            <span class="tree-leaf">◦</span>
            <span class="op-prop-dot"></span>
            <span class="tree-label">${_displayId(prop)}</span>
        </div>`);
        (childrenOf[key] || []).forEach(child => visit(child, depth + 1));
    };
    roots.forEach(key => visit(key, 1));
    return lines.join('') || '<div class="cls-list-empty" style="padding:4px 8px">—</div>';
}

/** Lignes d'arbre pour une liste de propriétés (OP ou DP), via subPropertyOf.
 *  Les éléments exclus ne sont pas affichés mais leurs enfants le sont. */
function _propTreeLines(props, excluded, dotCls, callExpr) {
    const allIds     = new Set(props.map(p => p.id));
    const childrenOf = {};
    props.forEach(p => { childrenOf[p.id] = []; });
    const hasParent = new Set();
    props.forEach(p => {
        [...new Set((p.subPropertyOf || []).filter(s => typeof s === 'string' && allIds.has(s)))]
            .forEach(par => { childrenOf[par].push(p.id); hasParent.add(p.id); });
    });
    const alpha = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });
    const roots = props.filter(p => !hasParent.has(p.id)).map(p => p.id).sort(alpha);
    Object.keys(childrenOf).forEach(id => childrenOf[id].sort(alpha));
    const lines = [];
    const visit = (id, depth) => {
        if (!excluded.has(id)) {
            const pl = depth * 16 + 6;
            lines.push(`<div class="tree-item restr-prop-item" data-id="${id}"
                style="padding:3px 8px;padding-left:${pl}px" onclick="${callExpr}('${id}')">
                <span class="${dotCls}" style="flex-shrink:0"></span>
                <span class="tree-label" style="margin-left:4px">${_displayRefId(id)}</span>
            </div>`);
        }
        (childrenOf[id] || []).forEach(c => visit(c, depth + 1));
    };
    roots.forEach(id => visit(id, 1));
    return lines.join('');
}

/** Picker "Asserted Properties" : section ObjectProperties (arbre) puis
 *  section DatatypeProperties (arbre). excludeIds = propriétés déjà posées. */
function _assertedPropPickerItems(excludeIds = [], action = 'RestrictionEditor.addProperty') {
    const excluded = new Set(excludeIds);
    const ops = APP.state.object_properties   || [];
    const dps = APP.state.datatype_properties || [];
    const hdr = (txt, dot) => `<div class="picker-section-hdr"
        style="padding:5px 8px 2px;font-size:10px;font-weight:600;color:var(--text-dim);
               letter-spacing:.05em;user-select:none;display:flex;align-items:center;gap:5px">
        <span class="${dot}" style="flex-shrink:0"></span>${txt}</div>`;
    const empty = '<div class="cls-list-empty" style="padding:3px 8px;font-size:11px;font-style:italic;color:var(--text-faint)">—</div>';
    const opLines = _propTreeLines(ops, excluded, 'op-prop-dot', action);
    const dpLines = _propTreeLines(dps, excluded, 'dp-prop-dot', action);
    return hdr('ObjectProperties', 'op-prop-dot') + (opLines || empty)
         + hdr('DatatypeProperties', 'dp-prop-dot') + (dpLines || empty);
}

/** Class picker items — same structure as the Asserted Hierarchy */
/** Individus dont la classe (en propre, types directs) contient classId. */
function _individualsOfClass(classId) {
    if (!classId || classId === 'owl:Thing') {
        // owl:Thing : on ne montre que les individus explicitement typés owl:Thing
        return (APP.state.individuals || []).filter(i => (i.types || []).includes('owl:Thing'));
    }
    return (APP.state.individuals || []).filter(i => (i.types || []).includes(classId));
}

/** Surligne le terme recherché dans un libellé. */
function _fillerHl(text, q) {
    if (!q) return _escapeHtml(text);
    const lo = text.toLowerCase(), i = lo.indexOf(q);
    if (i < 0) return _escapeHtml(text);
    return _escapeHtml(text.slice(0, i))
        + `<span class="rfs-hl">${_escapeHtml(text.slice(i, i + q.length))}</span>`
        + _escapeHtml(text.slice(i + q.length));
}

/** Lignes du volet "Classes" (arbre), filtrées par q.
 *  mode 'class' : classe sélectionnable (clic → sélection+fermeture).
 *  mode 'ind'   : classe = navigation seule (clic → charge ses individus). */
function _fillerClassRows(gid, selectedId, activeId, q, mode) {
    const classes = APP.state.classes || [];
    const { roots, childrenOf } = ClassEditor.buildTree(classes);
    const lines = [];
    const match = (id) => !q || id.toLowerCase().includes(q)
        || (mode === 'ind' && _individualsOfClass(id).some(i => i.id.toLowerCase().includes(q)));

    const row = (id, depth, italic) => {
        const pl  = depth * 14 + 6;
        const cls = ['tree-item', 'rfs-row'];
        if (mode === 'class' && id === selectedId) cls.push('selected');
        else if (mode === 'ind' && id === activeId) cls.push('rfs-active');
        const click = mode === 'class'
            ? `RestrictionEditor.selectFiller('${gid}',this.dataset.cls,'class',true)`
            : `RestrictionEditor._fillerNavClass('${gid}',this.dataset.cls)`;
        const n = mode === 'ind' ? _individualsOfClass(id).length : 0;
        const cnt = n ? `<span class="rfs-cnt">${n}</span>` : '';
        return `<div class="${cls.join(' ')}" style="padding-left:${pl}px" data-cls="${id}" onclick="${click}">
            <span class="cls-dot ${id === 'owl:Thing' ? 'tree-thing-dot' : 'tree-cls-dot'}"></span>
            <span class="tree-label"${italic ? ' style="font-style:italic"' : ''}>${_fillerHl(_displayRefId(id), q)}</span>${cnt}
        </div>`;
    };

    if (match('owl:Thing')) lines.push(row('owl:Thing', 0, true));
    const visit = (id, depth) => {
        if (match(id) || (childrenOf[id] || []).some(c => match(c))) lines.push(row(id, depth, false));
        (childrenOf[id] || []).forEach(c => visit(c, depth + 1));
    };
    roots.forEach(id => visit(id, 1));
    return lines.join('') || '<div class="rfs-empty">No class</div>';
}

/** Lignes du volet "Individus" pour la classe active, filtrées par q (mode 'ind'). */
function _fillerIndRows(gid, classId, selectedId, q) {
    if (!classId) return '<div class="rfs-empty">Pick a class on the left</div>';
    const all  = _individualsOfClass(classId);
    const inds = all.filter(i => !q || i.id.toLowerCase().includes(q));
    if (!all.length)  return '<div class="rfs-empty">This class has no individual</div>';
    if (!inds.length) return '<div class="rfs-empty">No matching individual</div>';
    return inds.map(i => `<div class="tree-item rfs-row${i.id === selectedId ? ' selected' : ''}" data-ind="${i.id}"
        onclick="RestrictionEditor.selectFiller('${gid}',this.dataset.ind,'ind',true)">
        <span class="xsd-dot rfs-ind-dot"></span>
        <span class="tree-label">${_fillerHl(_displayRefId(i.id), q)}</span>
    </div>`).join('');
}

/** Placeholder de la valeur selon le type de restriction et la nature de la propriété.
 *  hasValue + DatatypeProperty → littéral ; hasValue + ObjectProperty → individu ; sinon classe. */
function _fillerPlaceholder(prop, type) {
    if (type !== 'hasValue') return '— class —';
    const isDP = (APP.state.datatype_properties || []).some(p => p.id === prop);
    return isDP ? '— value —' : '— individual —';
}

/** Contenu interne du filler d'une restriction :
 *  - hasValue + DatatypeProperty → champ de saisie d'un littéral
 *  - sinon → sélecteur classe/individu (chip + dropdown). */
function _fillerInner(prop, type, fv, gid) {
    const isDP = (APP.state.datatype_properties || []).some(p => p.id === prop);

    // hasValue + DatatypeProperty → littéral (champ texte)
    if (type === 'hasValue' && isDP) {
        const dp  = (APP.state.datatype_properties || []).find(p => p.id === prop);
        const rng = (dp && dp.range && dp.range[0]) || 'xsd:string';
        return `<div class="restr-literal-row" style="display:flex;align-items:center;gap:6px">
                <span class="tree-leaf">◦</span>
                <input type="text" class="restr-filler-val restr-literal-inp"
                    value="${_escapeHtml(fv)}" placeholder="literal value"
                    title="Literal value (${_escapeHtml(rng)})"
                    onchange="if(ClassEditor._editingId!==null)ClassEditor.autoSave()">
                <span class="restr-literal-type" title="Datatype (range of ${_escapeHtml(prop)})">${_escapeHtml(rng)}</span>
                <button class="btn-frame-del restr-filler-clear" style="flex-shrink:0"
                    onclick="RestrictionEditor.deleteChild('${gid}')">✕</button>
            </div>`;
    }

    // someValuesFrom / allValuesFrom / hasValue+OP → sélecteur classe/individu
    const isNavClass = fv && (APP.state.classes      || []).some(c => c.id === fv);
    const isNavInd   = fv && !isNavClass && (APP.state.individuals || []).some(i => i.id === fv);
    const fillerPh   = _fillerPlaceholder(prop, type);
    return `<div class="tree-item restr-filler-btn" style="margin:0;padding:2px 4px"
                 onclick="RestrictionEditor.toggleFillerPicker('${gid}')">
                <span class="tree-leaf">◦</span>
                ${fv
                    ? (isNavInd
                        ? '<span class="xsd-dot" style="flex-shrink:0;margin:0"></span>'
                        : '<span class="cls-dot tree-cls-dot"></span>')
                    : '<span class="restr-filler-ph"></span>'}
                <span class="restr-filler-lbl" style="flex:0 1 auto"
                    oncontextmenu="event.preventDefault();event.stopPropagation();RestrictionEditor.toggleFillerPicker('${gid}')"
                    title="Right-click to pick a value"
                    ${isNavClass ? `
                        onclick="event.stopPropagation();APP.navigateTo('classes','${fv}')"
                        onmouseover="this.style.textDecoration='underline';this.style.color='var(--accent,#5f8dd3)';this.style.cursor='pointer'"
                        onmouseout="this.style.textDecoration='';this.style.color=''"
                    ` : isNavInd ? `
                        onclick="event.stopPropagation();APP.navigateTo('individuals','${fv}')"
                        onmouseover="this.style.textDecoration='underline';this.style.color='var(--accent,#5f8dd3)';this.style.cursor='pointer'"
                        onmouseout="this.style.textDecoration='';this.style.color=''"
                    ` : ''}
                >${fv ? _displayRefId(fv) : fillerPh}</span>
                <button class="btn-frame-del restr-filler-clear" style="flex-shrink:0"
                    onclick="event.stopPropagation();RestrictionEditor.deleteChild('${gid}')">✕</button>
                <span style="flex:1"></span>
            </div>
            <div class="restr-filler-dropdown" style="display:none">${_classHierarchyItems(gid, fv, _fillerModeFor(prop, type))}</div>
            <input type="hidden" class="restr-filler-val" value="${_escapeHtml(fv)}">`;
}

/** Mode du sélecteur d'après prop+type (utilisé au rendu initial). */
function _fillerModeFor(prop, type) {
    if (type !== 'hasValue') return 'class';
    const isDP = (APP.state.datatype_properties || []).some(p => p.id === prop);
    return isDP ? 'class' : 'ind';   // DP géré en littéral, pas via ce sélecteur
}

/** Mode du picker pour un gid : déduit de prop+type de la ligne. */
function _fillerMode(gid) {
    const row  = document.getElementById(`restr-child-${gid}`);
    const type = row?.querySelector('.restr-type-sel')?.value || '';
    return _fillerModeFor(row?.dataset.prop, type);
}

/** Sélecteur adaptatif : 1 volet (classes) pour someValuesFrom/allValuesFrom,
 *  2 volets (navigation classes + individus) pour hasValue. */
function _classHierarchyItems(gid, selectedId, mode) {
    mode = mode || 'class';
    const filter = `<div class="rfs-filter">
        <input type="text" class="rfs-filter-inp"
               placeholder="${mode === 'ind' ? 'Filter classes &amp; individuals…' : 'Filter classes…'}"
               autocomplete="off" spellcheck="false"
               oninput="RestrictionEditor._fillerFilter('${gid}',this.value)"></div>`;

    if (mode === 'class') {
        return `<div class="rfs rfs-mode-class" data-gid="${gid}" data-mode="class">
            ${filter}
            <div class="rfs-list rfs-cls-list">${_fillerClassRows(gid, selectedId, '', '', 'class')}</div>
        </div>`;
    }

    // mode 'ind' — la valeur est un individu ; classe = navigation pour le retrouver
    const classes  = APP.state.classes || [];
    const selIsInd = selectedId && (APP.state.individuals || []).some(i => i.id === selectedId);
    let active = '';
    if (selIsInd) {
        const ind = (APP.state.individuals || []).find(i => i.id === selectedId);
        active = (ind && (ind.types || [])[0]) || '';
    } else if (selectedId && classes.some(c => c.id === selectedId)) {
        active = selectedId;
    }
    return `<div class="rfs rfs-mode-ind" data-gid="${gid}" data-mode="ind" data-active="${active}">
        ${filter}
        <div class="rfs-panes">
            <div class="rfs-pane">
                <div class="rfs-pane-hdr"><span class="cls-dot" style="background:#b87333"></span> Browse by class</div>
                <div class="rfs-list rfs-cls-list">${_fillerClassRows(gid, '', active, '', 'ind')}</div>
            </div>
            <div class="rfs-pane">
                <div class="rfs-pane-hdr"><span class="xsd-dot rfs-ind-dot"></span> Pick an individual
                    <span class="rfs-active-lbl">${active || ''}</span></div>
                <div class="rfs-list rfs-ind-list">${_fillerIndRows(gid, active, selIsInd ? selectedId : '', '')}</div>
            </div>
        </div>
    </div>`;
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



// ════════════════════════════════════════════════════════════════
// SHARED TREE BEHAVIOURS (REQ-HM-*) — single implementation for the
// behaviours that must stay strictly identical across the hierarchy
// tabs (Classes / OPs / DPs / APs). Each editor declares a `_cfg`:
//   { tree, ctxMenu, detail, tcnPrefix, entities(), onDeselect? }
// ════════════════════════════════════════════════════════════════

/** Escapes user-provided text before interpolation into innerHTML templates. */
function _escapeHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * Render a read-only detail panel for an entity imported from another ontology.
 * @param {object} entity  - the entity object (class, property or individual)
 * @param {string} kind    - 'class' | 'object-property' | 'datatype-property' | 'individual'
 */
function _renderImportedDetail(entity, kind) {
    const prefix = _escapeHtml(entity._importPrefix || '');
    const name   = _escapeHtml(entity._importName   || entity._importPrefix || '');
    const id     = _escapeHtml(entity.id || '');
    const label  = entity.annotations?.labels?.[0]?.value || '';
    const comment = entity.annotations?.comments?.[0]?.value || '';
    return `
    <div class="detail-panel imported-detail-panel">
        <div class="imported-detail-banner">
            <span class="imported-detail-icon">🔒</span>
            <span>Imported from <strong>${name}</strong> <code>(${prefix}:)</code> — read only</span>
        </div>
        <div class="cls-frame" style="margin:10px 12px">
            <div class="cls-frame-bar"><span class="cls-frame-tag">Identity</span></div>
            <div class="cls-frame-body">
                <table class="entity-table" style="width:100%">
                    <tr><th style="width:90px">ID</th><td><code>${id}</code></td></tr>
                    ${prefix ? `<tr><th>Prefixed</th><td><code>${prefix}:${id}</code></td></tr>` : ''}
                    ${label   ? `<tr><th>Label</th><td>${_escapeHtml(label)}</td></tr>` : ''}
                    ${comment ? `<tr><th>Comment</th><td style="white-space:pre-wrap">${_escapeHtml(comment)}</td></tr>` : ''}
                </table>
            </div>
        </div>
    </div>`;
}

/** Returns only the read-only banner HTML to prepend to a full renderForm result. */
function _importedBannerHtml(entity) {
    const prefix = _escapeHtml(entity._importPrefix || '');
    const name   = _escapeHtml(entity._importName || entity._importPrefix || '');
    return `<div class="imported-detail-banner imported-detail-banner--form">
        <span class="imported-detail-icon">🔒</span>
        <span>Imported from <strong>${name}</strong> <code>(${prefix}:)</code> — read only</span>
    </div>`;
}

/** Disables all interactive elements inside a detail panel to make it read-only. */
function _applyReadOnly(detail) {
    // Les éléments marqués « keep-enabled » restent actifs même en vue importée :
    // ce sont des actions LECTURE SEULE (ex. exécuter une requête SPARQL, afficher
    // l'aperçu) qui ne modifient pas l'entité importée.
    detail.querySelectorAll('input, select, textarea, button').forEach(el => {
        if (el.classList.contains('keep-enabled')) return;
        el.disabled = true;
    });
}

/** Display id of an entity, préfixé :
 *  - entité importée → préfixe d'import,
 *  - entité propre   → préfixe de l'ontologie connectée (APP.state.ontology.prefix),
 *  - id déjà namespacé (contient ':') ou builtin → inchangé. */
function _displayId(entity) {
    if (!entity) return '';
    if (entity._imported) {
        if (entity._importPrefix) return `${entity._importPrefix}:${entity.id}`;
        // Préfixe contextuel vide → afficher le namespace complet (ex. http://examples.org/plm#Article)
        const ns = entity._importNamespace;
        if (ns) return (/[#/]$/.test(ns) ? ns : ns + '#') + entity.id;
        return entity.id;
    }
    const id = entity.id ?? '';
    if (!id || id.includes(':')) return id;            // owl:Thing, xsd:…, rdfs:label
    const p = (typeof APP !== 'undefined') ? APP.state?.ontology?.prefix : '';
    return p ? `${p}:${id}` : id;
}

/** Display form of a referenced entity id (class, OP, DP, AP, individual, rule, query) :
 *  résout l'entité dans APP.state et applique _displayId (préfixe d'import /
 *  d'ontologie / namespace complet). Id non trouvé : préfixe d'ontologie si nu. */
function _displayRefId(id) {
    if (!id) return id;
    for (const key of ['classes','object_properties','datatype_properties','annotation_properties','individuals','swrl_rules','queries']) {
        const e = (APP.state[key] || []).find(x => x.id === id);
        if (e) return _displayId(e);
    }
    if (String(id).includes(':')) return id;
    const p = (typeof APP !== 'undefined') ? APP.state?.ontology?.prefix : '';
    return p ? `${p}:${id}` : id;
}

/** True if the entity with this id in APP.state[stateKey] is imported. */
function _isImportedId(stateKey, id) {
    return !!(APP.state[stateKey] || []).find(e => e.id === id)?._imported;
}

/** Context-menu banner for an imported entity (no actions available). */
function _importedCtxBanner() {
    return `<div class="ctx-item" style="opacity:0.6;cursor:default;font-style:italic">🔒 Imported — read only</div>`;
}

/**
 * Sets the detail panel content for an entity, applying the imported-view treatment
 * (lock banner + dimming + read-only) when the entity is imported.
 * Returns true if the entity is imported, false otherwise.
 */
function _applyImportedView(detail, entity, html) {
    if (entity?._imported) {
        detail.innerHTML = _importedBannerHtml(entity) + html;
        detail.classList.add('is-imported-view');
        _applyReadOnly(detail);
        return true;
    }
    detail.classList.remove('is-imported-view');
    detail.innerHTML = html;
    return false;
}

/**
 * After any panel render, marks every [data-id] element whose id belongs to an
 * imported entity with the 'imported-entity' CSS class (dimmed icon + text).
 * Safe to call multiple times — adding an already-present class is a no-op.
 */
let _importedIdsCache = null;   // Set of imported entity ids — invalidated by _TreeCommon.invalidateCaches()

function _markImportedRefs(container) {
    if (!container) return;
    if (!_importedIdsCache) {
        _importedIdsCache = new Set();
        ['classes', 'object_properties', 'datatype_properties', 'annotation_properties', 'individuals'].forEach(key => {
            (APP.state[key] || []).filter(e => e._imported).forEach(e => _importedIdsCache.add(e.id));
        });
    }
    const importedSet = _importedIdsCache;
    if (!importedSet.size) return;
    // List items referencing a class or property by data-id
    container.querySelectorAll('[data-id]').forEach(el => {
        if (importedSet.has(el.dataset.id)) el.classList.add('imported-entity');
    });
    // Restriction group containers and individual property panels (data-prop)
    // Only top-level containers — NOT restr-child-row — to avoid double opacity stacking
    container.querySelectorAll('.restr-prop-group[data-prop], .ind-prop-panel[data-prop]').forEach(el => {
        if (importedSet.has(el.dataset.prop)) el.classList.add('imported-entity');
    });
}

const _TreeCommon = {

    /** buildTree() result cached per editor — invalidated by APP.refresh(). */
    getTree(ed) {
        if (!ed._treeCache) ed._treeCache = ed.buildTree(ed._cfg.entities() || []);
        return ed._treeCache;
    },

    invalidateCaches() {
        [ClassEditor, OPEditor, DPEditor, APEditor].forEach(ed => { ed._treeCache = null; });
        _importedIdsCache = null;
    },

    installDeselectListener(ed) {
        if (ed._deselectListener) {
            document.removeEventListener('mousedown', ed._deselectListener, true);
            ed._deselectListener = null;
        }
        ed._deselectListener = (e) => {
            if (!ed._selectedIds.size) return;
            if (e.target.closest('.tree-item[data-id]')) return;  // item row
            if (e.target.closest('.tree-root-item'))     return;  // root node
            if (e.target.closest('.tree-toggle'))        return;  // expand/collapse
            if (e.target.closest(ed._cfg.detail))        return;  // detail panel (forms, nav links…)
            if (e.target.closest(ed._cfg.ctxMenu))       return;
            if (e.target.closest('.ind-picker-overlay')) return;  // shared modals
            if (e.target.closest('.btn-icon, .btn-sm'))  return;
            ed._selectedIds.clear();
            ed._anchorId = null;
            if (ed._cfg.onDeselect) ed._cfg.onDeselect();
            else document.querySelectorAll(`${ed._cfg.tree} .tree-item[data-id]`)
                         .forEach(el => el.classList.remove('selected'));
        };
        document.addEventListener('mousedown', ed._deselectListener, true);
    },

    toggleNode(ed, id) {
        const el = document.getElementById(`${ed._cfg.tcnPrefix}${id}`);
        if (!el) return;
        const isOpen = el.style.display !== 'none';
        el.style.display = isOpen ? 'none' : 'block';
        if (isOpen) ed._expanded.delete(id);
        else        ed._expanded.add(id);
        const toggle = el.previousElementSibling?.querySelector('.tree-toggle');
        if (toggle) toggle.classList.toggle('open', !isOpen);
    },

    isDescendant(ed, potentialDesc, ancestorId) {
        if (!potentialDesc || !ancestorId) return false;
        const { childrenOf } = this.getTree(ed);
        const visit = (id) => {
            if (id === potentialDesc) return true;
            return (childrenOf[id] || []).some(child => visit(child));
        };
        return visit(ancestorId);
    },

    onDragStart(ed, event, id) {
        ed._dragId = id;
        if (!ed._selectedIds.has(id)) {
            ed._selectedIds = new Set([id]);
            ed._anchorId = id;
        }
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', id);
        setTimeout(() => {
            document.querySelectorAll(`${ed._cfg.tree} .tree-item[data-id]`).forEach(el => {
                if (ed._selectedIds.has(el.dataset.id)) el.classList.add('dragging');
            });
        }, 0);
    },

    onDragOver(ed, event, targetId) {
        if (!ed._dragId) return;
        if (ed._selectedIds.has(targetId)) return;
        if ([...ed._selectedIds].some(sid => ed._isDescendant(targetId, sid))) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        event.currentTarget.classList.add('drag-over');
    },

    onDragEnd(ed) {
        document.querySelectorAll('.tree-item.dragging').forEach(el => el.classList.remove('dragging'));
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        ed._dragId = null;
    },
};


// ════════════════════════════════════════════════════════════════
// CLASSES — Protégé-style tree view
// ════════════════════════════════════════════════════════════════

const ClassEditor = {

    _cfg: {
        tree:      '#class-tree',
        ctxMenu:   '#cls-ctx-menu',
        detail:    '#class-detail',
        tcnPrefix: 'tcn-',
        entities:  () => APP.state.classes,
    },
    _treeCache: null,
    _autoSaveTimer: null,

    _selectedId: null,          // class selected in the tree (single)
    _selectedIds: new Set(),    // all selected classes (multi-selection)
    _anchorId: null,            // anchor for Shift+Click range selection
    _deselectListener: null,    // document-level mousedown listener
    _expanded: new Set(),       // IDs of expanded nodes
    _editingId: null,           // original ID of the class being edited
    _owlThingSelected: false,   // true when owl:Thing is selected
    _dragId: null,              // ID of the class being dragged

    // ── Shared SVG icons (toolbar + context menu) ─────────
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

    // ── Tree construction ──────────────────────────────────

    buildTree(classes) {
        const allIds = new Set(classes.map(c => c.id));
        const childrenOf = {};
        classes.forEach(c => { childrenOf[c.id] = []; });

        const hasKnownParent   = new Set(); // has an internal parent (in allIds)
        const hasExternalParent = new Set(); // has a prefixed external parent (!owl:Thing)

        classes.forEach(c => {
            const allParents   = (c.subClassOf || []).filter(s => typeof s === 'string');
            const knownParents = [...new Set(allParents.filter(s => allIds.has(s)))];
            const classRoot = APP.getOntologyRootLabels().classRoot;
            const externalParents = allParents.filter(s =>
                !allIds.has(s) && s !== classRoot && s.includes(':')
            );
            if (knownParents.length > 0)   hasKnownParent.add(c.id);
            if (externalParents.length > 0) hasExternalParent.add(c.id);
            knownParents.forEach(p => {
                if (!childrenOf[p].includes(c.id)) childrenOf[p].push(c.id);
            });
        });

        const alpha = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });

        // owlRoots   → no known parent AND no external parent → shown under owl:Thing
        // externalRoots → no known parent BUT has external parent → shown as independent roots
        const owlRoots      = classes.filter(c => !hasKnownParent.has(c.id) && !hasExternalParent.has(c.id)).map(c => c.id).sort(alpha);
        const externalRoots = classes.filter(c => !hasKnownParent.has(c.id) &&  hasExternalParent.has(c.id)).map(c => c.id).sort(alpha);

        Object.keys(childrenOf).forEach(id => childrenOf[id].sort(alpha));
        return { roots: owlRoots, externalRoots, childrenOf };
    },

    /** Expands all ancestors of classId in _expanded to unfold the tree down to it */
    _expandAncestors(classId, visited = new Set()) {
        if (visited.has(classId)) return;
        visited.add(classId);
        const classes = APP.state.classes || [];
        const allIds  = new Set(classes.map(c => c.id));
        const cls     = classes.find(c => c.id === classId);
        if (!cls) return;
        (cls.subClassOf || [])
            .filter(s => typeof s === 'string' && allIds.has(s))
            .forEach(par => { this._expanded.add(par); this._expandAncestors(par, visited); });
    },

    // ── Tree rendering ──────────────────────────────────────────

    _renderNode(id, childrenOf, depth, visited = new Set()) {
        if (visited.has(id)) return ''; // cycle guard
        const cls = (APP.state.classes || []).find(c => c.id === id);
        if (!cls) return '';
        const children = childrenOf[id] || [];
        const nextVisited = new Set(visited); nextVisited.add(id);
        const hasChildren = children.length > 0;
        const isSelected = this._selectedIds.has(id);
        const isOpen = this._expanded.has(id);
        const isImported = !!cls._imported;
        const displayId = _displayId(cls);
        const importedClass = isImported ? ' imported-entity' : '';
        const dragAttrs = `${isImported ? '' : `draggable="true" ondragstart="ClassEditor.onDragStart(event,'${id}')" ondragend="ClassEditor.onDragEnd(event)"`}
                 ondragover="ClassEditor.onDragOver(event,'${id}')"
                 ondragleave="ClassEditor.onDragLeave(event)"
                 ondrop="ClassEditor.onDrop(event,'${id}')"`.trim();

        return `
        <div class="tree-root-node">
            <div class="tree-item${isSelected ? ' selected' : ''}${importedClass}"
                 style="padding-left:${depth * 16 + 6}px"
                 data-id="${id}"
                 ${dragAttrs}
                 onclick="ClassEditor.selectClass('${id}', event)"
                 oncontextmenu="ClassEditor.showContextMenu(event,'${id}')">
                ${hasChildren
                    ? `<span class="tree-toggle${isOpen ? ' open' : ''}"
                             onclick="event.stopPropagation();ClassEditor.toggleNode('${id}')">▶</span>`
                    : `<span class="tree-leaf">◦</span>`}
                <span class="cls-dot tree-cls-dot"></span>
                <span class="tree-label">${_escapeHtml(displayId)}</span>
            </div>
            <div id="tcn-${id}" style="display:${isOpen ? 'block' : 'none'}">
                ${children.map(cid => this._renderNode(cid, childrenOf, depth + 1, nextVisited)).join('')}
            </div>
        </div>`;
    },

    renderTree(classes) {
        const { roots, externalRoots, childrenOf } = this.buildTree(classes);
        const { classRoot } = APP.getOntologyRootLabels();
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
            <span style="font-size:12px">${classRoot}</span>
        </div>
        ${roots.length
            ? roots.map(id => this._renderNode(id, childrenOf, 1)).join('')
            : (!externalRoots.length ? `<p class="empty" style="padding:8px 16px;font-size:12px">No classes — create a child class of ${classRoot}</p>` : '')
        }
        ${externalRoots.map(id => this._renderNode(id, childrenOf, 1)).join('')}`;
    },

    // ── Split layout ───────────────────────────────────────────

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

                <!-- ── Resizable separator ── -->
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
                        <div id="cls-super-picker" class="cls-tree-picker" style="display:none"></div>
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

    // ── Selection and navigation ──────────────────────────────────

    restoreSelection() {
        this._initSplitPane();
        this._installDeselectListener();
        if (this._owlThingSelected) {
            this.selectOwlThing();
        } else if (this._selectedId) {
            this.selectClass(this._selectedId, false);
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

    /** Updates the "Super Classes" panel in the left column */
    _updateSuperPanel(cls) {
        const panel = document.getElementById('cls-supers-list');
        if (!panel) return;
        if (!cls) {
            panel.innerHTML = `
                <div class="cls-list-empty">— select a class —</div>
                <div id="cls-super-picker" class="cls-tree-picker" style="display:none"></div>`;
            return;
        }
        const isImp = !!cls._imported;
        const superClasses = [...new Set((cls.subClassOf || []).filter(s => typeof s === 'string'))];

        // Build a map id→class for ancestor traversal
        const classMap = {};
        (APP.state.classes || []).forEach(c => { classMap[c.id] = c; });

        // For each direct parent, compute the full ancestor chain up to owl:Thing
        const buildChain = (startId) => {
            const chain = [];
            const visited = new Set();
            let current = startId;
            while (current && !visited.has(current)) {
                visited.add(current);
                chain.push(current);
                const parentCls = classMap[current];
                const parents = parentCls ? (parentCls.subClassOf || []).filter(s => typeof s === 'string') : [];
                current = parents.length > 0 ? parents[0] : null;
            }
            chain.push('owl:Thing');
            return chain;
        };

        // Render direct parents with their ancestor chains
        const superRows = superClasses.map(s => {
            const chain = buildChain(s);
            const chainHtml = chain.map((id, i) => {
                const isOwlThing = id === 'owl:Thing';
                const indent = 6 + i * 14;
                if (isOwlThing) {
                    return `<div class="cls-list-item cls-ancestor" style="padding-left:${indent}px;opacity:0.55;font-style:italic;cursor:pointer" onclick="ClassEditor.selectOwlThing()">
                        <span class="cls-dot tree-cls-dot tree-thing-dot"></span>
                        <span class="cls-list-lbl">owl:Thing</span>
                    </div>`;
                }
                const isDirect = i === 0;
                const idCls   = classMap[id];
                const dispId  = idCls ? _displayId(idCls) : id;
                const impCls  = idCls?._imported ? ' imported-entity' : '';
                const anc     = (!isDirect && !impCls) ? ';opacity:0.75' : '';
                return `<div class="cls-list-item${isDirect ? '' : ' cls-ancestor'}${impCls}" ${isDirect ? `data-id="${id}"` : `data-ancestor-id="${id}"`} style="padding-left:${indent}px${anc}">
                    <span class="cls-dot tree-cls-dot"></span>
                    <span class="cls-list-lbl" style="cursor:pointer"
                          onclick="APP.navigateTo('classes','${id}')">${_escapeHtml(dispId)}</span>
                    ${isDirect && !isImp ? `<button class="btn-frame-del" onclick="ClassEditor.removeSuperClass('${id}')">✕</button>` : ''}
                </div>`;
            }).join('');
            return chainHtml;
        }).join('');

        panel.innerHTML = `
            ${superRows || '<div class="cls-list-item cls-ancestor" style="opacity:0.55;font-style:italic"><span class="cls-dot tree-cls-dot tree-thing-dot"></span><span class="cls-list-lbl">owl:Thing</span></div>'}
            ${isImp ? '' : `<div id="cls-super-picker" class="cls-tree-picker" style="display:none">
                ${_classTreePickerItems('ClassEditor.addSuperClass', [cls.id, ...superClasses])}
            </div>`}`;
    },

    async selectOwlThing() {
        if (this._editingId !== null) await this._silentSave();
        this._selectedId = null;
        this._selectedIds.clear();
        this._anchorId = null;
        this._owlThingSelected = true;
        // Surbrillance
        document.querySelectorAll('.tree-item, .tree-root-item').forEach(el => el.classList.remove('selected'));
        document.querySelector('.tree-root-item')?.classList.add('selected');
        // Right panel
        const detail = document.getElementById('class-detail');
        const { classRoot } = APP.getOntologyRootLabels();
        if (detail) detail.innerHTML = `
            <div class="detail-panel-empty">
                <span class="cls-dot" style="width:32px;height:32px"></span>
                <strong style="font-family:var(--font-mono);font-size:13px">${classRoot}</strong>
                <span style="color:var(--text-dim);font-size:12px">Root of all classes</span>
                <span style="color:var(--text2);font-size:12px">Select an existing <strong>Class</strong> or create a new one</span>
                <button class="btn-primary btn-sm" onclick="ClassEditor.createChild()">＋ Create Class</button>
            </div>`;
        // Super classes panel : vider
        this._updateSuperPanel(null);
        this._updateTreeButtons();
    },

    async selectClass(id, evtOrHist = true) {
        const isShift = (evtOrHist && typeof evtOrHist === 'object') ? evtOrHist.shiftKey : false;
        const _hist   = (evtOrHist && typeof evtOrHist === 'object') ? true : evtOrHist;

        if (isShift && this._anchorId) {
            // ── Shift+Click: range selection ─────────────────
            const items = [...document.querySelectorAll('#class-tree .tree-item[data-id]')];
            const ids   = items.map(el => el.dataset.id);
            const from  = ids.indexOf(this._anchorId);
            const to    = ids.indexOf(id);
            if (from !== -1 && to !== -1) {
                const [lo, hi] = from < to ? [from, to] : [to, from];
                this._selectedIds = new Set(ids.slice(lo, hi + 1));
            } else {
                this._selectedIds.add(id);
            }
        } else {
            // ── Single click: single selection ────────────────
            if (this._editingId !== null && id !== this._editingId) {
                clearTimeout(this._autoSaveTimer);
                await this._silentSave();
            }
            this._selectedIds = new Set([id]);
            this._anchorId    = id;
            if (_hist && !isShift) APP._pushNav('classes', id);
        }

        this._selectedId = id;
        this._owlThingSelected = false;

        // Révèle TOUTES les occurrences de la classe (cas multi-héritage : la classe
        // apparaît sous chacune de ses mères) en dépliant tous les chemins d'ancêtres.
        // On ne re-rend l'arbre que si le dépliage change réellement quelque chose.
        if (!isShift) {
            const _expBefore = this._expanded.size;
            this._expandAncestors(id);
            if (this._expanded.size !== _expBefore) {
                const treeEl = document.getElementById('class-tree');
                if (treeEl) treeEl.innerHTML = this.renderTree(APP.state.classes);
            }
        }

        // Surbrillance (toutes les occurrences ayant ce data-id)
        document.querySelectorAll('#class-tree .tree-item[data-id]').forEach(el => {
            el.classList.toggle('selected', this._selectedIds.has(el.dataset.id));
        });

        // Formulaire dans le panneau droit
        const detail = document.getElementById('class-detail');
        if (!detail) return;

        if (this._selectedIds.size === 1) {
            const cls = (APP.state.classes || []).find(c => c.id === id);
            const isImp = _applyImportedView(detail, cls, cls ? this.renderForm(cls) : this.renderForm(null));
            _initHResizers('class-detail');
            this._updateSuperPanel(cls || null);   // affiche aussi les super-classes des classes importées (lecture seule)
            _markImportedRefs(detail);
            _markImportedRefs(document.getElementById('cls-supers-list'));
        } else {
            const n = this._selectedIds.size;
            detail.innerHTML = `<div class="detail-panel-empty">
                <span style="font-size:28px"><span class="cls-dot" style="display:inline-block;vertical-align:middle"></span><span class="cls-dot" style="display:inline-block;vertical-align:middle;margin-left:4px"></span></span>
                <span><strong>${n}</strong> classes selected</span>
            </div>`;
            this._updateSuperPanel(null);
        }
        this._updateTreeButtons();
    },

    _installDeselectListener() { _TreeCommon.installDeselectListener(this); },

    _updateTreeButtons() {
        const btnSister = document.getElementById('btn-cls-sister');
        const btnChild  = document.getElementById('btn-cls-child');
        const btnDelete = document.getElementById('btn-cls-delete');
        if (!btnSister || !btnChild || !btnDelete) return;

        const _isImportedCls = (sid) => _isImportedId('classes', sid);
        const _hasImported   = this._selectedIds.size > 0 && [...this._selectedIds].some(_isImportedCls);
        const _selImported   = this._selectedId && _isImportedCls(this._selectedId);

        if (this._owlThingSelected) {
            btnSister.disabled = true;
            btnSister.style.visibility = 'hidden';
            btnChild.disabled  = false;
            btnDelete.disabled = true;
            btnDelete.style.visibility = 'hidden';
        } else if (this._selectedIds.size > 1) {
            btnSister.disabled = true;
            btnSister.style.visibility = '';
            btnChild.disabled  = true;
            // Autoriser si au moins une classe non-importée est sélectionnée
            const _deletableCount = [...this._selectedIds].filter(sid => !_isImportedCls(sid)).length;
            btnDelete.disabled = _deletableCount === 0;
            btnDelete.style.visibility = '';
        } else if (this._selectedId) {
            btnSister.disabled = !!_selImported;
            btnSister.style.visibility = _selImported ? 'hidden' : '';
            btnChild.disabled  = false;
            btnDelete.disabled = !!_selImported;
            btnDelete.style.visibility = _selImported ? 'hidden' : '';
        } else {
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
        // Expand common parents so the new sibling is visible
        parents.forEach(p => this._expanded.add(p));
        await this._createAndSelect(parents);
    },

    async createChild() {
        const parent = this._selectedId; // null if owl:Thing is selected
        const parents = parent ? [parent] : [];
        // Expand the parent so the child class is visible in the tree
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
        const ids = this._selectedIds.size > 0
            ? [...this._selectedIds]
            : (this._selectedId ? [this._selectedId] : []);
        if (!ids.length) return;

        if (ids.length === 1) {
            // Single delete: use existing method (confirmation + delete)
            await this.delete(ids[0]);
            return;
        }

        // Multi-delete: filter out imported classes, single confirmation, then batch API calls
        const deletable = ids.filter(id => !_isImportedId('classes', id));
        const skipped   = ids.length - deletable.length;
        if (!deletable.length) { UI.error('All selected classes are imported and cannot be deleted.'); return; }

        const skipNote = skipped > 0
            ? `<br><small style="color:var(--text-dim)">${skipped} imported class${skipped>1?'es':''} will be skipped.</small>`
            : '';
        const confirmed = await UI.confirm(
            `Delete <strong>${deletable.length}</strong> class${deletable.length>1?'es':''}?${skipNote}`
        );
        if (!confirmed) return;

        try {
            for (const id of deletable) {
                await API.deleteClass(id).catch(e => {
                    if (!e.message.includes('404') && !e.message.toLowerCase().includes('not found')) throw e;
                });
            }
            UI.success(`${ids.length} classes deleted`);
            this._selectedIds.clear();
            this._anchorId    = null;
            this._selectedId  = null;
            this._editingId   = null;
            this._owlThingSelected = false;
            await APP.refresh();
            APP.renderSection('classes');
        } catch (e) {
            UI.error(e.message);
        }
    },

    /** Creates an ObjectProperty with domain = selected class, then navigates to the OP tab */
    async createOPForClass() {
        const classId = this._selectedId;
        if (!classId) return UI.error('Select a class first');
        const id = OPEditor._generatePropName();
        const prop = {
            id, annotations: { labels: [], comments: [] },
            domain: [classId], range: [], subPropertyOf: [],
            inverseOf: null, characteristics: {}, propertyChainAxiom: [],
        };
        try {
            await API.createOP(prop);
            OPEditor._selectedId = id;
            OPEditor._editingId  = id;
            await APP.refresh();
            APP.renderSection('object-properties');
        } catch (e) { UI.error(e.message); }
    },

    /** Creates a DatatypeProperty with domain = selected class, then navigates to the DTP tab */
    async createDTPForClass() {
        const classId = this._selectedId;
        if (!classId) return UI.error('Select a class first');
        const id = DPEditor._generatePropName();
        const prop = {
            id, annotations: { labels: [], comments: [] },
            domain: [classId], range: [], subPropertyOf: [], functional: false,
        };
        try {
            await API.createDP(prop);
            DPEditor._selectedId = id;
            DPEditor._editingId  = id;
            await APP.refresh();
            APP.renderSection('datatype-properties');
        } catch (e) { UI.error(e.message); }
    },

    /** Ouvre/ferme le picker « + Property » (rattacher une OP/DP existante au domaine). */
    showDomainPropPicker() {
        const el = document.getElementById('domain-prop-picker');
        if (!el) return;
        const v = el.style.display !== 'none';
        el.style.display = v ? 'none' : '';
        if (!v) {
            if (typeof _decoratePickerWithFilter === 'function') _decoratePickerWithFilter(el);
            _floatPickerBelow(el, '[onclick*="showDomainPropPicker"]');
            const _close = (e) => {
                if (!el.contains(e.target) && !e.target.closest('[onclick*="showDomainPropPicker"]')) {
                    el.style.display = 'none';
                    document.removeEventListener('mousedown', _close, true);
                }
            };
            document.addEventListener('mousedown', _close, true);
        }
    },

    /** Rattache la propriété sélectionnée à la classe courante : ajoute la classe
     *  au Domain de la propriété → elle apparaît dans « Asserted Properties ». */
    async addDomainProperty(propId) {
        const classId = this._selectedId;
        if (!classId || !propId) return;
        const picker = document.getElementById('domain-prop-picker');
        if (picker) picker.style.display = 'none';
        const op = (APP.state.object_properties || []).find(p => p.id === propId);
        const dp = !op && (APP.state.datatype_properties || []).find(p => p.id === propId);
        const prop = op || dp;
        if (!prop) return;
        if ((prop.domain || []).includes(classId)) return;  // déjà présent
        try {
            const updated = { ...prop, domain: [...(prop.domain || []), classId] };
            if (op) await API.updateOP(propId, updated);
            else    await API.updateDP(propId, updated);
            await APP.refresh();
            APP.renderSection('classes');
            setTimeout(() => this.restoreSelection(), 50);
            if (UI && UI.success) UI.success(`'${propId}' added to domain of '${classId}'`);
        } catch (e) { UI.error(e.message); }
    },

    // ── Where Used in Range ───────────────────────────────────
    /** Panneau listant les ObjectProperties dont le range contient la classe. */
    _renderRangeUsagePanel(c) {
        const icoAdd  = `<svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="4.5" y1="0.5" x2="4.5" y2="8.5"/><line x1="0.5" y1="4.5" x2="8.5" y2="4.5"/></svg>`;
        const ops     = (APP.state.object_properties || []).filter(p => (p.range || []).includes(c.id));
        const usedIds = ops.map(p => p.id);
        const rows = ops.length
            ? ops.map(p => {
                const isImp = !!p._imported;
                const disp  = _displayId(p);
                return `<div class="cls-list-item${isImp ? ' imported-entity' : ''}" data-id="${p.id}">
                    <span class="op-prop-dot"></span>
                    <span class="cls-list-lbl" style="cursor:pointer"
                          onclick="APP.navigateTo('object-properties','${p.id}')">${_escapeHtml(disp)}</span>
                    ${isImp ? '' : `<button class="btn-frame-del" onclick="ClassEditor.removeRangeUsage('${p.id}')" title="Remove this class from the property range">✕</button>`}
                </div>`;
            }).join('')
            : '<div class="cls-list-empty" style="padding:6px 8px;font-size:11px;font-style:italic">No property has this class as range</div>';
        return `
            <div class="cls-frame">
                <div class="cls-frame-bar">
                    <span class="cls-frame-tag cls-frame-tag-blue">Where Used in Range</span>
                    <span class="nav-count" style="margin-left:6px">${ops.length}</span>
                    <span style="display:flex;gap:2px;margin-left:auto;flex-shrink:0">
                        <button class="btn-ftool" title="Add an existing ObjectProperty (set its range to this class)"
                                onclick="ClassEditor.showPicker('cls-range-picker')">${icoAdd}&thinsp;property</button>
                        <button class="btn-ftool" title="Create a new ObjectProperty with range = ${c.id}"
                                onclick="ClassEditor.createOPForClassRange()">
                            <span class="op-prop-dot" style="width:9px;height:9px;display:inline-block;vertical-align:middle;flex-shrink:0"></span>&thinsp;OP</button>
                    </span>
                </div>
                <div class="cls-frame-body" id="cls-range-list">
                    ${rows}
                    <div id="cls-range-picker" class="cls-tree-picker" style="display:none">
                        ${_opTreePickerItems('ClassEditor.addRangeUsage(this.dataset.id)', usedIds)}
                    </div>
                </div>
            </div>`;
    },

    /** Ajoute la classe courante au range de l'OP opId. */
    async addRangeUsage(opId) {
        const classId = this._selectedId;
        if (!classId || !opId) return;
        const op = (APP.state.object_properties || []).find(p => p.id === opId);
        if (!op || (op.range || []).includes(classId)) return;
        try {
            await API.updateOP(opId, { ...op, range: [...(op.range || []), classId] });
            await APP.refresh();
            this.selectClass(classId, false);
        } catch (e) { UI.error(e.message); }
    },

    /** Retire la classe courante du range de l'OP opId. */
    async removeRangeUsage(opId) {
        const classId = this._selectedId;
        const op = (APP.state.object_properties || []).find(p => p.id === opId);
        if (!op || !classId) return;
        try {
            await API.updateOP(opId, { ...op, range: (op.range || []).filter(r => r !== classId) });
            await APP.refresh();
            this.selectClass(classId, false);
        } catch (e) { UI.error(e.message); }
    },

    /** Crée une ObjectProperty avec range = classe sélectionnée, puis navigue vers l'onglet OPs. */
    async createOPForClassRange() {
        const classId = this._selectedId;
        if (!classId) return UI.error('Select a class first');
        const id = OPEditor._generatePropName();
        const prop = {
            id, annotations: { labels: [], comments: [] },
            domain: [], range: [classId], subPropertyOf: [],
            inverseOf: null, characteristics: {}, propertyChainAxiom: [],
        };
        try {
            await API.createOP(prop);
            OPEditor._selectedId = id;
            OPEditor._editingId  = id;
            await APP.refresh();
            APP.renderSection('object-properties');
        } catch (e) { UI.error(e.message); }
    },

    // ── Context menu ──────────────────────────────────────────

    showContextMenu(event, id) {
        event.preventDefault();
        event.stopPropagation();
        // If right-clicking on a class not in the current selection, reset to that class
        if (id) {
            if (!this._selectedIds.has(id)) {
                this._selectedIds = new Set([id]);
                this._anchorId = id;
                this._selectedId = id;
                this._owlThingSelected = false;
                document.querySelectorAll('#class-tree .tree-item[data-id]').forEach(el => {
                    el.classList.toggle('selected', el.dataset.id === id);
                });
            }
        } else {
            this.selectOwlThing();
        }
        this._closeContextMenu();

        const isClass = !!id;
        const isImported = isClass && _isImportedId('classes', id);
        const n = this._selectedIds.size;
        const deleteLabel = n > 1 ? `Delete Classes <strong>(${n})</strong>` : `Delete Class`;
        const menu = document.createElement('div');
        menu.id = 'cls-ctx-menu';
        menu.className = 'ctx-menu';
        menu.innerHTML = `
            ${isClass && n === 1 ? `<div class="ctx-item" onclick="ClassEditor._closeContextMenu();ClassEditor.createChild()">
                ${this._svgChild} Add Child Class</div>
            <div class="ctx-item" onclick="ClassEditor._closeContextMenu();ClassEditor.createSibling()">
                ${this._svgSister} Add Sibling Class</div>
            <div class="ctx-sep"></div>
            <div class="ctx-item" onclick="ClassEditor._closeContextMenu();APP.navigate('individuals');setTimeout(()=>IndividualEditor.selectClass('${id}'),50)">
                <span class="xsd-dot" style="display:inline-block;vertical-align:middle;margin-right:2px"></span> Go to Individuals Tab</div>
            ${!isImported ? `<div class="ctx-sep"></div>
            <div class="ctx-item ctx-danger" onclick="ClassEditor._closeContextMenu();ClassEditor.deleteSelected()">
                ${this._svgDelete} ${deleteLabel}</div>` : ''}` : (!isClass ? `<div class="ctx-item" onclick="ClassEditor._closeContextMenu();ClassEditor.createChild()">
                ${this._svgChild} Add Child Class</div>` : `
            ${!isImported ? `<div class="ctx-item ctx-danger" onclick="ClassEditor._closeContextMenu();ClassEditor.deleteSelected()">
                ${this._svgDelete} ${deleteLabel}</div>` : ''}`)}
        `;
        menu.style.left = event.clientX + 'px';
        menu.style.top  = event.clientY + 'px';
        document.body.appendChild(menu);
        // Adjust if off-screen
        requestAnimationFrame(() => {
            const r = menu.getBoundingClientRect();
            if (r.right  > window.innerWidth)  menu.style.left = (event.clientX - r.width)  + 'px';
            if (r.bottom > window.innerHeight)  menu.style.top  = (event.clientY - r.height) + 'px';
        });
        // Close on next click outside the menu
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

    onDragStart(event, id)       { _TreeCommon.onDragStart(this, event, id); },
    onDragOver(event, targetId)  { _TreeCommon.onDragOver(this, event, targetId); },
    onDragLeave(event)           { event.currentTarget.classList.remove('drag-over'); },
    onDragEnd()                  { _TreeCommon.onDragEnd(this); },

    async onDrop(event, targetId) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');
        const dragIds = this._selectedIds.size > 0 ? [...this._selectedIds] : [this._dragId];
        this._dragId = null;
        if (!dragIds.length || dragIds.includes(targetId)) return;
        if (dragIds.some(sid => this._isDescendant(targetId, sid))) {
            UI.warn('Cannot drop on a descendant — would create a cycle');
            return;
        }
        if (targetId) this._expanded.add(targetId);
        this._owlThingSelected = false;
        try {
            await Promise.all(dragIds.map(draggedId => {
                const cls = (APP.state.classes || []).find(c => c.id === draggedId);
                if (!cls) return null;
                const restrictions = (cls.subClassOf || []).filter(s => typeof s === 'object');
                const newParents   = targetId ? [targetId] : [];
                return API.updateClass(draggedId, { ...cls, subClassOf: [...newParents, ...restrictions] });
            }));
            UI.success(dragIds.length > 1 ? `${dragIds.length} classes moved` : `'${dragIds[0]}' moved`);
            this._selectedId = dragIds[0];
            this._editingId  = dragIds.length === 1 ? dragIds[0] : null;
            await APP.refresh();
            APP.renderSection('classes');
        } catch (e) { UI.error(e.message); }
    },

    _isDescendant(potentialDesc, ancestorId) { return _TreeCommon.isDescendant(this, potentialDesc, ancestorId); },

    toggleNode(id) { _TreeCommon.toggleNode(this, id); },

    openNew() {
        this._selectedId = null;
        this._owlThingSelected = false;
        document.querySelectorAll('.tree-item, .tree-root-item').forEach(el => el.classList.remove('selected'));
        this._updateTreeButtons();
        const detail = document.getElementById('class-detail');
        if (detail) { detail.innerHTML = this.renderForm(null); _initHResizers('class-detail'); }
    },

    // ── Protégé-style form ─────────────────────────────────

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

        // Full IRI
        const baseIri  = (APP.state.ontology?.id || '').replace(/[#/]+$/, '');
        const classIri = (c.id && baseIri) ? `${baseIri}#${c.id}` : '';

        // ── Annotation rows ──
        const annoRows = [
            ...labels.map(l   => _annoRow('label',   l.value,  l.lang  || Settings.defaultLang, 'ClassEditor', ac)),
            ...comments.map(cm => _annoRow('comment', cm.value, cm.lang || Settings.defaultLang, 'ClassEditor', ac)),
            ...(c.annotations?.other || []).map(a => _annoRow('other', a.value, '', 'ClassEditor', ac, a.property)),
        ].join('');

        // ── Superclass list ──
        const superRows = superClasses.map(s => `
            <div class="cls-list-item" data-id="${s}">
                <span class="cls-dot"></span>
                <span class="cls-list-lbl" style="cursor:pointer"
                      onclick="APP.navigateTo('classes','${s}')">${_displayRefId(s)}</span>
                <button class="btn-frame-del" onclick="ClassEditor.removeSuperClass('${s}')">✕</button>
            </div>`).join('');
        const availSupers = (APP.state.classes || [])
            .filter(c2 => c2.id !== c.id && !superClasses.includes(c2.id))
            .map(c2 => `<option value="${c2.id}">${c2.id}</option>`).join('');

        // ── Equivalent list ──
        const equivRows = (c.equivalentClass || []).filter(e => typeof e === 'string').map(e => `
            <div class="cls-list-item" data-id="${e}">
                <span class="cls-dot"></span>
                <span class="cls-list-lbl" style="cursor:pointer"
                      onclick="APP.navigateTo('classes','${e}')">${_displayRefId(e)}</span>
                <button class="btn-frame-del" onclick="ClassEditor.removeEquivalent('${e}')">✕</button>
            </div>`).join('');

        // ── Disjoint list ──
        const disjRows = (c.disjointWith || []).map(d => `
            <div class="cls-list-item" data-id="${d}">
                <span class="cls-dot"></span>
                <span class="cls-list-lbl" style="cursor:pointer"
                      onclick="APP.navigateTo('classes','${d}')">${_displayRefId(d)}</span>
                <button class="btn-frame-del" onclick="ClassEditor.removeDisjoint('${d}')">✕</button>
            </div>`).join('');
        // ➕ SVG icon for toolbars
        const icoAdd = `<svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="4.5" y1="0.5" x2="4.5" y2="8.5"/><line x1="0.5" y1="4.5" x2="8.5" y2="4.5"/></svg>`;

        return `
        <div class="cls-editor">

            <!-- ── Header ───────────────────────────────── -->
            <div class="cls-editor-hdr">
                <div class="cls-editor-title">
                    ID&nbsp;
                    <input type="text" id="cls-id" class="cls-id-inp"
                           value="${c.id}" placeholder="NewClass"
                           oninput="_sanitizeId(this)"
                           ${ac} title="Local IRI identifier — cannot start with a digit">
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
                    <button class="btn-ftool" onclick="ClassEditor.addAnnotRow('label')"   title="Add rdfs:label">${icoAdd}&thinsp;label</button>
                    <button class="btn-ftool" onclick="ClassEditor.addAnnotRow('comment')" title="Add rdfs:comment">${icoAdd}&thinsp;comment</button>
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

            <!-- ── Frame : Where Used in Range ── -->
            ${this._renderRangeUsagePanel(c)}

            <div class="h-resizer"></div>

            <!-- ── Frame bas : Disjoints + Equivalent (côte à côte) ── -->
            <div class="cls-frames-row">
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
                <div class="cls-frame">
                    <div class="cls-frame-bar">
                        <span class="cls-frame-tag cls-frame-tag-orange">Equivalent</span>
                        <button class="btn-ftool" onclick="ClassEditor.showPicker('cls-equiv-picker')" title="Add equivalent class">${icoAdd}</button>
                    </div>
                    <div class="cls-frame-body" id="cls-equivalents-list">
                        ${equivRows}
                        <div id="cls-equiv-picker" class="cls-tree-picker" style="display:none">
                            ${_classTreePickerItems('ClassEditor.addEquivalent', [c.id, ...(c.equivalentClass || []).filter(e => typeof e === 'string')])}
                        </div>
                    </div>
                </div>
            </div>

            ${_whereUsedFrame(r => _ruleUsesClass(r, c.id))}
            ${_whereExtractedFrame('class', c.id)}

        </div>`;
    },

    // ── Annotation helpers ──────────────────────────────────────

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

    // ── Superclass helpers ─────────────────────────────────────

    showPicker(id) {
        const el = document.getElementById(id);
        if (!el) return;
        const visible = el.style.display !== 'none';
        el.style.display = visible ? 'none' : '';
        if (!visible) {
            _decoratePickerWithFilter(el);
            el.focus();
            const close = (e) => {
                if (!el.contains(e.target) && !e.target.closest('[onclick*="showPicker"]')) {
                    el.style.display = 'none';
                    document.removeEventListener('click', close, true);
                }
            };
            setTimeout(() => document.addEventListener('click', close, true), 0);
        }
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
            <span class="cls-list-lbl" onclick="ClassEditor.selectClass('${id}')">${_displayRefId(id)}</span>
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

    // ── Equivalent helpers ──────────────────────────────────────

    addEquivalent(id) {
        if (!id) return;
        const list   = document.getElementById('cls-equivalents-list');
        const picker = document.getElementById('cls-equiv-picker');
        if (!list || list.querySelector(`.cls-list-item[data-id="${id}"]`)) return;
        const item = document.createElement('div');
        item.className = 'cls-list-item';
        item.dataset.id = id;
        item.innerHTML = `<span class="cls-dot"></span>
            <span class="cls-list-lbl" style="cursor:pointer"
                  onclick="APP.navigateTo('classes','${id}')">${_displayRefId(id)}</span>
            <button class="btn-frame-del" onclick="ClassEditor.removeEquivalent('${id}')">✕</button>`;
        list.insertBefore(item, picker);
        if (picker) picker.style.display = 'none';
        if (this._editingId !== null) this.autoSave();
    },

    removeEquivalent(id) {
        document.querySelector(`#cls-equivalents-list .cls-list-item[data-id="${id}"]`)?.remove();
        if (this._editingId !== null) this.autoSave();
    },

    // ── Disjoint helpers ────────────────────────────────────────

    addDisjoint(id) {
        if (!id) return;
        const list   = document.getElementById('cls-disjoints-list');
        const picker = document.getElementById('cls-disj-picker');
        if (!list || list.querySelector(`.cls-list-item[data-id="${id}"]`)) return;
        const item = document.createElement('div');
        item.className = 'cls-list-item';
        item.dataset.id = id;
        item.innerHTML = `<span class="cls-dot"></span>
            <span class="cls-list-lbl">${_displayRefId(id)}</span>
            <button class="btn-frame-del" onclick="ClassEditor.removeDisjoint('${id}')">✕</button>`;
        list.insertBefore(item, picker);
        if (picker) picker.style.display = 'none';          // div: no .value to reset
        if (this._editingId !== null) this.autoSave();
    },

    removeDisjoint(id) {
        document.querySelector(`#cls-disjoints-list .cls-list-item[data-id="${id}"]`)?.remove();
        if (this._editingId !== null) this.autoSave();
    },

    autoSave() {
        clearTimeout(this._autoSaveTimer);
        this._autoSaveTimer = setTimeout(() => {
            if (this._editingId !== null) this.save(false);
        }, 500);
    },

    /** Silent save: persists the current DOM state without re-rendering or global refresh */
    async _silentSave() {
        const originalId = this._editingId;
        if (originalId === null) return;
        if ((APP.state.classes || []).find(c => c.id === originalId)?._imported) return;
        const idEl = document.getElementById('cls-id');
        if (!idEl) return;
        const id = idEl.value.trim();
        if (!id) return;

        const { labels, comments, other } = _collectAnnotations('cls-annotations-body');
        const supers = Array.from(document.querySelectorAll('#cls-supers-list .cls-list-item[data-id]'))
                            .map(el => el.dataset.id).filter(Boolean);
        const equiv  = Array.from(document.querySelectorAll('#cls-equivalents-list .cls-list-item[data-id]'))
                            .map(el => el.dataset.id).filter(Boolean);
        const disj   = Array.from(document.querySelectorAll('#cls-disjoints-list .cls-list-item[data-id]'))
                            .map(el => el.dataset.id).filter(Boolean);

        const restrictions = RestrictionEditor.collect();

        const cls = {
            id,
            annotations: { labels, comments, other },
            subClassOf:  [...supers, ...restrictions],
            equivalentClass: equiv,
            disjointWith: disj,
        };
        try {
            await API.updateClass(originalId, cls);
            // In-memory update without re-render
            const idx = (APP.state.classes || []).findIndex(c => c.id === originalId);
            if (idx >= 0) APP.state.classes[idx] = cls;
            this._treeCache = null;
        } catch (e) { console.warn('[SWOWL] silent save failed (class):', e.message); }
    },

    openEdit(id) {
        // Backward compatibility (called from other places)
        if (APP.currentSection !== 'classes') APP.renderSection('classes');
        this.selectClass(id);
    },

    // ── Save / delete ─────────────────────────────────

    async save(isNew) {
        const originalId = isNew ? null : this._editingId;
        const id = document.getElementById('cls-id').value.trim();
        const _idErr = _validateId(id, 'Identifier'); if (_idErr) return UI.error(_idErr);

        // Annotations depuis la table
        const { labels, comments, other } = _collectAnnotations('cls-annotations-body');

        // Superclasses, équivalences et disjoints depuis les listes
        const supers = Array.from(document.querySelectorAll('#cls-supers-list .cls-list-item[data-id]'))
                            .map(el => el.dataset.id).filter(Boolean);
        const equiv  = Array.from(document.querySelectorAll('#cls-equivalents-list .cls-list-item[data-id]'))
                            .map(el => el.dataset.id).filter(Boolean);
        const disj   = Array.from(document.querySelectorAll('#cls-disjoints-list .cls-list-item[data-id]'))
                            .map(el => el.dataset.id).filter(Boolean);
        const restrictions = RestrictionEditor.collect();

        const cls = {
            id,
            annotations: { labels, comments, other },
            subClassOf:  [...supers, ...restrictions],
            equivalentClass: equiv,
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

        // ── Check individuals BEFORE confirmation ──────────
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


// ── Restriction editor ──────────────────────────────────

const RestrictionEditor = {

    _selectedProp: null,   // property selected in the tree

    // ── Main rendering ──────────────────────────────────────────
    renderPanel(restrictions, cls) {
        const ico = `<svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="4.5" y1=".5" x2="4.5" y2="8.5"/><line x1=".5" y1="4.5" x2="8.5" y2="4.5"/></svg>`;
        const alpha = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });

        // ── "Asserted" section ────────────────────────────────
        const groups  = this._group(restrictions);
        const propIds = Object.keys(groups).sort(alpha);
        // Picker en arbre : section ObjectProperties puis DatatypeProperties (+ filtre à l'ouverture)
        const availProps = _assertedPropPickerItems(propIds);
        // Picker « + Property » : ajoute une OP/DP existante au domaine de la classe.
        // Exclut les propriétés ayant déjà cette classe dans leur domaine.
        const _clsIdForDom = cls ? cls.id : null;
        const _domainExclude = _clsIdForDom
            ? [...(APP.state.object_properties || []), ...(APP.state.datatype_properties || [])]
                .filter(p => (p.domain || []).includes(_clsIdForDom)).map(p => p.id)
            : [];
        const availDomainProps = _assertedPropPickerItems(_domainExclude, 'ClassEditor.addDomainProperty');

        // ── "Inherited" section ───────────────────────────────
        // Une propriété héritée qui a une restriction/marker LOCAL (asserté sur cette
        // classe) bascule en « Asserted » → on l'exclut de la section « Inherited ».
        const _localAssertedSet = new Set(propIds);
        const inherited  = (cls ? this._computeInherited(cls) : [])
            .filter(r => !_localAssertedSet.has(r.property || r._marker));

        // Ordre des classes source = par profondeur de hiérarchie : d'abord les
        // classes du HAUT (ancêtres les plus éloignés = profondeur faible), puis
        // les filles, petites-filles… (tie-break alphabétique).
        const _srcOrder = [];
        const _srcSeen  = new Set();
        inherited.forEach(r => {
            if (r._fromClass && !_srcSeen.has(r._fromClass)) {
                _srcSeen.add(r._fromClass);
                _srcOrder.push(r._fromClass);
            }
        });
        const _clsArr = APP.state.classes || [];
        const _clsById = {};
        _clsArr.forEach(c => { _clsById[c.id] = c; });
        const _depthOf = (id, seen) => {
            seen = seen || new Set();
            if (seen.has(id)) return 0;
            seen.add(id);
            const c = _clsById[id];
            const parents = c ? (c.subClassOf || []).filter(s => typeof s === 'string') : [];
            if (!parents.length) return 0;
            return 1 + Math.min(...parents.map(p => _depthOf(p, seen)));
        };
        _srcOrder.sort((a, b) =>
            _depthOf(a) - _depthOf(b)
            || a.localeCompare(b, undefined, { sensitivity: 'base' }));

        // Group by (sourceClass → property)
        const _bySource = {};
        inherited.forEach(r => {
            if (!r._fromClass) return;
            if (!_bySource[r._fromClass]) _bySource[r._fromClass] = {};
            const prop = r.property || r._marker;
            if (!prop) return;
            if (!_bySource[r._fromClass][prop]) _bySource[r._fromClass][prop] = [];
            _bySource[r._fromClass][prop].push(r);
        });

        const inhPropIds = [...new Set(inherited.map(r => r.property || r._marker).filter(Boolean))];
        const inhGroups  = this._group(inherited);

        const toggleFn = `const b=this.nextElementSibling;const t=this.querySelector('.restr-stoggle');const o=b.style.display!=='none';b.style.display=o?'none':'';t.style.transform=o?'rotate(0deg)':'rotate(90deg)'`;

        // ── Collect ancestor class IDs for inherited domain props ──
        const clsId = cls ? cls.id : null;
        const ancestorIds = new Set();
        if (clsId) {
            const _visitAnc = (id) => {
                if (ancestorIds.has(id)) return;
                ancestorIds.add(id);
                const c = (APP.state.classes || []).find(x => x.id === id);
                if (!c) return;
                (c.subClassOf || []).forEach(e => { if (typeof e === 'string') _visitAnc(e); });
            };
            (cls.subClassOf || []).filter(e => typeof e === 'string').forEach(_visitAnc);
        }

        // Asserted domain props: domain contains this class directly
        // Inherited domain props: domain contains an ancestor (but not this class)
        const _allProps = [
            ...(APP.state.object_properties || []).map(p => ({ p, kind: 'op' })),
            ...(APP.state.datatype_properties || []).map(p => ({ p, kind: 'dp' })),
        ];
        // Dédup : ne pas re-lister par domaine une propriété déjà affichée via son
        // _marker (le backend crée un _marker quand une prop a la classe en domaine).
        const _assertedMarkerSet = new Set(propIds);
        const _inhMarkerSet      = new Set(inhPropIds);
        const assertedDomainProps = clsId
            ? _allProps.filter(({ p }) => (p.domain || []).includes(clsId) && !_assertedMarkerSet.has(p.id))
            : [];
        const inheritedDomainProps = clsId
            ? _allProps.filter(({ p }) => !(p.domain || []).includes(clsId)
                  && (p.domain || []).some(d => ancestorIds.has(d))
                  && !_inhMarkerSet.has(p.id)
                  && !_localAssertedSet.has(p.id))   // assertée localement → ne pas la remettre en hérité
            : [];
        assertedDomainProps.sort((a, b) => a.p.id.localeCompare(b.p.id));
        inheritedDomainProps.sort((a, b) => a.p.id.localeCompare(b.p.id));

        const _renderDomainPropRow = ({ p, kind }, showFrom = false) => {
            const dot  = kind === 'op' ? 'op-prop-dot' : 'dp-prop-dot';
            const tab  = kind === 'op' ? 'object-properties' : 'datatype-properties';
            const disp = _displayId(p);
            // ── Range : juste à droite de la propriété, entre parenthèses, icône devant.
            //    OP → classe (rond marron, navigable) ; DP → type xsd: (marqueur, non navigable).
            const _mult = (p.characteristics?.functional || p.functional) ? 'single' : 'multiple';
            const rangeTag = (p.range || []).length
                ? `<span style="display:inline-flex;align-items:center;gap:4px;flex-shrink:0;flex-wrap:wrap;margin-left:5px;font-size:10px;color:var(--text-dim)">
                    <span style="opacity:.7">(→</span><span style="font-style:italic;opacity:.7">${_mult}</span>${(p.range || []).map(r => {
                        const isClass = (APP.state.classes || []).some(c => c.id === r);
                        const dotCls  = isClass ? 'cls-dot' : 'dp-prop-dot';  // datatype (xsd:) → marqueur vert
                        const dotStyle = isClass ? 'width:11px;height:11px' : 'width:8px;height:5px';  // datatype plus petit
                        const inner   = isClass
                            ? `<span style="color:var(--text-dim);cursor:pointer" title="Go to class ${_escapeHtml(r)}"
                                     onclick="APP.navigateTo('classes','${r}')"
                                     onmouseover="this.style.color='var(--accent,#5f8dd3)';this.style.textDecoration='underline'"
                                     onmouseout="this.style.color='var(--text-dim)';this.style.textDecoration=''">${_escapeHtml(_displayRefId(r))}</span>`
                            : `<span style="color:var(--text-dim)">${_escapeHtml(_displayRefId(r))}</span>`;
                        return `<span style="display:inline-flex;align-items:center;gap:3px">
                            <span class="${dotCls}" style="flex-shrink:0;${dotStyle};margin:0"></span>${inner}
                        </span>`;
                    }).join('<span style="opacity:.5">,</span>')}<span style="opacity:.7">)</span>
                   </span>`
                : '';
            // Classe(s) de provenance (uniquement pour les propriétés héritées).
            const fromClasses = showFrom ? (p.domain || []) : [];
            const fromTag = fromClasses.length
                ? `<span style="display:inline-flex;align-items:center;gap:4px;flex-shrink:0;flex-wrap:wrap;margin-left:5px;font-size:10px;color:var(--text-dim)">
                    <span style="opacity:.7">(↑</span>${fromClasses.map(fc => `
                    <span style="display:inline-flex;align-items:center;gap:3px">
                        <span class="cls-dot" style="flex-shrink:0;width:11px;height:11px"></span>
                        <span style="color:var(--text-dim);cursor:pointer" title="Go to class ${_escapeHtml(fc)}"
                              onclick="APP.navigateTo('classes','${fc}')"
                              onmouseover="this.style.color='var(--accent,#5f8dd3)';this.style.textDecoration='underline'"
                              onmouseout="this.style.color='var(--text-dim)';this.style.textDecoration=''">${_escapeHtml(_displayRefId(fc))}</span>
                    </span>`).join('<span style="opacity:.5">,</span>')}<span style="opacity:.7">)</span>
                   </span>`
                : '';
            return `<div class="cls-list-item" style="padding:3px 6px;gap:5px">
                <span class="${dot}" style="flex-shrink:0"></span>
                <span class="cls-list-lbl" style="cursor:pointer;flex-shrink:0" onclick="APP.navigateTo('${tab}','${p.id}')">${_escapeHtml(disp)}</span>
                ${rangeTag}
                ${fromTag}
            </div>`;
        };

        const inhTotal   = inhPropIds.length + inheritedDomainProps.length;
        const assrtTotal = propIds.length   + assertedDomainProps.length;

        return `
        <div class="restr-panel">

            <!-- ── Inherited Properties ──────────────────── -->
            <div class="restr-section-hdr" onclick="${toggleFn}">
                <span class="restr-stoggle" style="transform:rotate(90deg)">▶</span>
                Inherited Properties
                <span style="font-weight:400;color:var(--text-dim);margin-left:3px">(${inhTotal})</span>
            </div>
            <div class="restr-section-body">
                <div class="restr-tree">
                ${inheritedDomainProps.length ? inheritedDomainProps.map(x => _renderDomainPropRow(x, true)).join('') : ''}
                ${_srcOrder.length
                    ? _srcOrder.map((srcCls, i) => {
                        const propMap = _bySource[srcCls] || {};
                        const props   = Object.keys(propMap).sort(alpha);
                        const rows    = props.map(p => this._renderGroupReadOnly(p, propMap[p])).join('');
                        const sep     = (i > 0 || inheritedDomainProps.length > 0) ? '<div class="inh-class-sep"></div>' : '';
                        return sep + rows;
                    }).join('')
                    : ''}
                ${inhTotal === 0 ? '<div class="cls-list-empty" style="padding:4px 8px;font-size:11px;font-style:italic">—</div>' : ''}
                </div>
            </div>

            <!-- ── Asserted Properties ───────────────────── -->
            <div class="restr-section-hdr" onclick="${toggleFn}">
                <span class="restr-stoggle" style="transform:rotate(90deg)">▶</span>
                Asserted Properties
                <span style="font-weight:400;color:var(--text-dim);margin-left:3px">(${assrtTotal})</span>
                <span style="display:flex;gap:2px;margin-left:auto;flex-shrink:0" onclick="event.stopPropagation()">
                    <button class="btn-ftool" title="Attach an existing ObjectProperty or DatatypeProperty to this class (adds the class to the property's Domain)"
                            onclick="ClassEditor.showDomainPropPicker()">
                        ${ico}&thinsp;Property</button>
                    <button class="btn-ftool" title="Add owl:Restriction"
                            onclick="RestrictionEditor.showPropPicker()">
                        ${ico}&thinsp;restriction</button>
                    <button class="btn-ftool" title="Create new ObjectProperty with domain = ${cls?.id || 'this class'}"
                            onclick="ClassEditor.createOPForClass()">
                        <span class="op-prop-dot" style="width:9px;height:9px;display:inline-block;vertical-align:middle;flex-shrink:0"></span>&thinsp;OP</button>
                    <button class="btn-ftool" title="Create new DatatypeProperty with domain = ${cls?.id || 'this class'}"
                            onclick="ClassEditor.createDTPForClass()">
                        <span class="dp-prop-dot" style="width:9px;height:9px;display:inline-block;vertical-align:middle;flex-shrink:0"></span>&thinsp;DP</button>
                </span>
            </div>
            <div class="restr-section-body">
                <div id="domain-prop-picker" class="cls-tree-picker" style="display:none;margin:2px 4px 4px">
                    ${availDomainProps || '<div class="cls-list-empty" style="padding:4px 8px;font-size:11px">—</div>'}
                </div>
                <div id="restr-prop-picker" class="cls-tree-picker" style="display:none;margin:2px 4px 4px">
                    ${availProps || '<div class="cls-list-empty" style="padding:4px 8px;font-size:11px">—</div>'}
                </div>
                <div class="restr-tree" id="restr-tree">
                    ${assertedDomainProps.length ? assertedDomainProps.map(x => _renderDomainPropRow(x)).join('') : ''}
                    ${propIds.length
                        ? (assertedDomainProps.length ? '<div class="inh-class-sep"></div>' : '') + propIds.map(p => this._renderGroup(p, groups[p])).join('')
                        : ''}
                    ${assrtTotal === 0 ? '<div class="cls-list-empty" style="padding:6px 8px;font-size:11px;font-style:italic">No asserted properties</div>' : ''}
                </div>
            </div>

        </div>`;
    },

    // ── Computing inherited properties (recursive traversal) ─────
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
                    // _marker included: property without restriction also inherited
                    result.push({ ...expr, _fromClass: clsId });
                } else if (typeof expr === 'string') {
                    collect(expr);   // traverse up the hierarchy
                }
            });
        };

        (cls.subClassOf || []).filter(s => typeof s === 'string').forEach(s => collect(s));
        return result;
    },

    // ── Read-only property group (inheritance) ─────────────
    _renderGroupReadOnly(prop, restrictions) {
        const isOP   = (APP.state.object_properties  || []).some(p => p.id === prop);
        const isDP   = (APP.state.datatype_properties || []).some(p => p.id === prop);
        const isAnno = !isOP && !isDP;
        const dotCls     = isOP ? 'op-prop-dot' : isAnno ? 'anno-prop-dot' : 'dp-prop-dot';
        const navSection = isOP ? 'object-properties' : isDP ? 'datatype-properties' : null;
        const visible = restrictions.filter(r => r.type !== '_marker');

        // Range (→) : juste à droite du nom, entre parenthèses, icône devant.
        const _propObj = (APP.state.object_properties || []).find(p => p.id === prop)
                      || (APP.state.datatype_properties || []).find(p => p.id === prop);
        const _ranges  = (_propObj && _propObj.range) || [];
        const _mult    = _propObj ? ((_propObj.characteristics?.functional || _propObj.functional) ? 'single' : 'multiple') : '';
        const rangeTag = _ranges.length
            ? `<span style="display:inline-flex;align-items:center;gap:4px;flex-shrink:0;flex-wrap:wrap;margin-left:5px;font-size:10px;color:var(--text-dim)">
                <span style="opacity:.7">(→</span>${_mult ? `<span style="font-style:italic;opacity:.7">${_mult}</span>` : ''}${_ranges.map(r => {
                    const isClass = (APP.state.classes || []).some(c => c.id === r);
                    const dotC    = isClass ? 'cls-dot' : 'dp-prop-dot';
                    const dotSt   = isClass ? 'width:11px;height:11px' : 'width:8px;height:5px';
                    const inner   = isClass
                        ? `<span class="restr-from-nav" style="color:var(--text-dim);cursor:pointer" title="Go to class ${_escapeHtml(r)}"
                                 onclick="APP.navigateTo('classes','${r}')"
                                 onmouseover="this.style.color='var(--accent,#5f8dd3)';this.style.textDecoration='underline'"
                                 onmouseout="this.style.color='var(--text-dim)';this.style.textDecoration=''">${_escapeHtml(_displayRefId(r))}</span>`
                        : `<span style="color:var(--text-dim)">${_escapeHtml(_displayRefId(r))}</span>`;
                    return `<span style="display:inline-flex;align-items:center;gap:3px">
                        <span class="${dotC}" style="flex-shrink:0;${dotSt};margin:0"></span>${inner}
                    </span>`;
                }).join('<span style="opacity:.5">,</span>')}<span style="opacity:.7">)</span>
               </span>`
            : '';

        // Source tag — provenance (↑) : juste après le range, rond marron devant chaque classe source.
        const fromClasses = [...new Set(restrictions.map(r => r._fromClass).filter(Boolean))];
        const fromTag = fromClasses.length
            ? `<span style="display:inline-flex;align-items:center;gap:4px;flex-shrink:0;flex-wrap:wrap;margin-left:5px;font-size:10px;color:var(--text-dim)">
                <span style="opacity:.7">(↑</span>${fromClasses.map(fc => `
                <span style="display:inline-flex;align-items:center;gap:3px">
                    <span class="cls-dot" style="flex-shrink:0;width:11px;height:11px"></span>
                    <span class="restr-from-nav" style="color:var(--text-dim)"
                          onclick="ClassEditor._expandAncestors('${fc}');ClassEditor._selectedId='${fc}';ClassEditor._selectedIds=new Set(['${fc}']);ClassEditor._anchorId='${fc}';ClassEditor._owlThingSelected=false;APP.renderSection('classes');setTimeout(()=>ClassEditor.restoreSelection(),50)"
                          onmouseover="this.style.color='var(--accent,#5f8dd3)';this.style.textDecoration='underline'"
                          onmouseout="this.style.color='var(--text-dim)';this.style.textDecoration=''">${_displayRefId(fc)}</span>
                </span>`).join('<span style="opacity:.5">,</span>')}<span style="opacity:.7">)</span>
               </span>`
            : '';

        // Read-only child rows — without ↑ tag (already in the header)
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
                    const isFillerClass = (APP.state.classes     || []).some(c => c.id === fv);
                    const isFillerInd   = !isFillerClass && (APP.state.individuals || []).some(i => i.id === fv);
                    const fillerSection = isFillerClass ? 'classes' : isFillerInd ? 'individuals' : null;
                    const navAttr = fillerSection
                        ? `style="color:var(--text);cursor:pointer"
                           onclick="APP.navigateTo('${fillerSection}','${fv}')"
                           onmouseover="this.style.textDecoration='underline';this.style.color='var(--accent,#5f8dd3)'"
                           onmouseout="this.style.textDecoration='';this.style.color='var(--text)'"`
                        : `style="color:var(--text)"`;
                    const dotIcon = isFillerInd
                        ? `<span class="xsd-dot" style="flex-shrink:0;margin:0"></span>`
                        : `<span class="cls-dot tree-cls-dot"></span>`;
                    valueHtml = `
                    <div style="display:inline-flex;align-items:center;gap:3px;
                                background:var(--bg3);border:1px solid var(--border);
                                border-radius:4px;padding:1px 4px;font-size:12px">
                        <span class="tree-leaf">◦</span>
                        ${dotIcon}
                        <span ${navAttr}>${_displayRefId(fv)}</span>
                    </div>`;
                }
            }
            return `
            <div style="display:flex;align-items:center;gap:3px;padding:1px 4px;font-size:12px;color:var(--text2)">
                <span style="width:20px;flex-shrink:0"></span>
                ${this._restrIcon(r.type)}
                ${valueHtml}
            </div>`;
        }).join('');

        return `
        <div class="restr-group-ro">
            <div class="tree-item restr-prop-row-ro" style="padding-left:4px;cursor:default">
                <span class="${dotCls}"></span>
                <span class="restr-prop-name" style="cursor:pointer"
                      onclick="APP.navigateTo('${navSection}','${prop}')"
                      oncontextmenu="event.preventDefault();event.stopPropagation();RestrictionEditor.showInheritedContextMenu(event,'${prop}')"
                      title="Right-click to add a restriction on this inherited property">${_displayRefId(prop)}</span>
                ${rangeTag}
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

    _restrIcon(type) {
        const map = {
            someValuesFrom:   ['restr-icon-some',  '∃'],
            allValuesFrom:    ['restr-icon-all',   '∀'],
            hasValue:         ['restr-icon-has',   '∋'],
            exactCardinality: ['restr-icon-exact', '='],
            minCardinality:   ['restr-icon-min',   '≥'],
            maxCardinality:   ['restr-icon-max',   '≤'],
        };
        const [cls, sym] = map[type] || ['restr-child-icon', '◈'];
        if (cls === 'restr-child-icon') return `<span class="restr-child-icon">◈</span>`;
        return `<span class="restr-icon ${cls}" title="${type}">${sym}</span>`;
    },

    _desc(r) {
        let d = r.type || '';
        if (r.filler)   d += ` ${_displayRefId(r.filler)}`;
        if (r.value  !== undefined) d += ` ${r.value}`;
        if (r.cardinality !== undefined) d += ` ${r.cardinality}`;
        return d;
    },

    // ── Rendering a property group ──────────────────────────────
    _renderGroup(prop, restrictions) {
        const isSel  = prop === this._selectedProp;
        // Filter presence markers (_marker) — invisible to the user
        const visible = restrictions.filter(r => r.type !== '_marker');
        const summary = visible.map(r => this._desc(r)).join(', ');

        // ── Multiplicity chip (single/multiple) based on range + functional ──
        const opData = (APP.state.object_properties  || []).find(p => p.id === prop);
        const dpData = (APP.state.datatype_properties || []).find(p => p.id === prop);
        const isOP   = !!opData;
        const isDP   = !!dpData;
        const isAnno = !isOP && !isDP;
        const dotCls     = isOP ? 'op-prop-dot' : isAnno ? 'anno-prop-dot' : 'dp-prop-dot';
        const navSection = isOP ? 'object-properties' : isDP ? 'datatype-properties' : null;

        // Range : (→ <mult> ● Classe) — icône de la cible (rond marron = classe navigable,
        // marqueur vert = type xsd:) + ID cliquable, comme la section Inherited.
        const _mkRangeTag = (ranges, mult) => {
            if (!ranges || !ranges.length) return '';
            return `<span style="display:inline-flex;align-items:center;gap:4px;flex-shrink:0;flex-wrap:wrap;margin-left:5px;font-size:10px;color:var(--text-dim)">
                <span style="opacity:.7">(→</span>${mult ? `<span style="font-style:italic;opacity:.7">${mult}</span>` : ''}${ranges.map(r => {
                    const isClass = (APP.state.classes || []).some(c => c.id === r);
                    const dotC  = isClass ? 'cls-dot' : 'dp-prop-dot';
                    const dotSt = isClass ? 'width:11px;height:11px' : 'width:8px;height:5px';
                    const inner = isClass
                        ? `<span style="color:var(--text-dim);cursor:pointer" title="Go to class ${_escapeHtml(r)}"
                                 onclick="event.stopPropagation();APP.navigateTo('classes','${r}')"
                                 onmouseover="this.style.color='var(--accent,#5f8dd3)';this.style.textDecoration='underline'"
                                 onmouseout="this.style.color='var(--text-dim)';this.style.textDecoration=''">${_escapeHtml(_displayRefId(r))}</span>`
                        : `<span style="color:var(--text-dim)">${_escapeHtml(_displayRefId(r))}</span>`;
                    return `<span style="display:inline-flex;align-items:center;gap:3px">
                        <span class="${dotC}" style="flex-shrink:0;${dotSt};margin:0"></span>${inner}
                    </span>`;
                }).join('<span style="opacity:.5">,</span>')}<span style="opacity:.7">)</span>
               </span>`;
        };
        let rangeChip = '';
        if (opData && opData.range && opData.range.length > 0) {
            rangeChip = _mkRangeTag(opData.range, opData.characteristics?.functional ? 'single' : 'multiple');
        } else if (dpData && dpData.range && dpData.range.length > 0) {
            rangeChip = _mkRangeTag(dpData.range, dpData.functional ? 'single' : 'multiple');
        }

        return `
        <div class="restr-prop-group" data-prop="${prop}">
            <div class="tree-item restr-prop-row${isSel ? ' selected' : ''}"
                 style="padding-left:4px"
                 oncontextmenu="RestrictionEditor.showContextMenu(event,'${prop}')"
                 onclick="RestrictionEditor.selectProp('${prop}')">
                <span class="${dotCls}"></span>
                <span class="restr-prop-name" style="cursor:pointer"
                      onclick="event.stopPropagation();APP.navigateTo('${navSection}','${prop}')">${_displayRefId(prop)}</span>
                ${rangeChip}
                ${summary ? `<span class="restr-prop-summary">(${summary})</span>` : ''}
                <button class="btn-frame-del" style="margin-left:2px"
                        onclick="event.stopPropagation();RestrictionEditor.deleteProp('${prop}')">✕</button>
            </div>
            <div class="restr-children">
                ${visible.map((r, i) => this._renderChild(prop, r, i)).join('')}
            </div>
        </div>`;
    },

    // ── Rendering a restriction child ────────────────────────────
    _renderChild(prop, r, li) {
        const gid        = `${prop}__${li}`;
        const types      = ['someValuesFrom','allValuesFrom','hasValue','exactCardinality','minCardinality','maxCardinality'];
        const isCard     = (r.type || '').includes('Cardinality');
        const fv         = r.filler || r.value || '';
        const racCard    = 'onchange="if(ClassEditor._editingId!==null)ClassEditor.autoSave()"';
        return `
        <div class="restr-child-row" id="restr-child-${gid}" data-prop="${prop}" data-li="${li}">
            <span style="width:20px;flex-shrink:0"></span>
            ${this._restrIcon(r.type)}
            <select class="restr-type-sel" onchange="RestrictionEditor.onChildType('${gid}')">
                ${types.map(t => `<option value="${t}" ${t === r.type ? 'selected':''}>${t}</option>`).join('')}
            </select>
            <div class="restr-filler-wrap" id="restr-filler-${gid}" style="display:${isCard ? 'none' : ''}">
                ${_fillerInner(prop, r.type, fv, gid)}
            </div>
            <span class="tree-leaf" style="display:${isCard ? 'inline' : 'none'}">◦</span>
            <input class="restr-card-inp" type="text" inputmode="numeric" pattern="[0-9]*" placeholder="n"
                   value="${r.cardinality ?? ''}"
                   style="width:40px;display:${isCard ? 'inline' : 'none'};padding:0 3px;height:20px;box-sizing:border-box;line-height:18px;text-align:center" ${racCard}>
            ${isCard ? `<button class="btn-frame-del"
                    onclick="RestrictionEditor.deleteChild('${gid}')">✕</button>` : ''}
        </div>`;
    },

    // ── Toolbar actions ──────────────────────────────────────────
    showPropPicker() {
        const el = document.getElementById('restr-prop-picker');
        if (!el) return;
        const v = el.style.display !== 'none';
        el.style.display = v ? 'none' : '';
        if (!v) {
            _decoratePickerWithFilter(el);   // champ filtre + liste scrollable (homogène)
            _floatPickerBelow(el, '[onclick*="showPropPicker"]');
            // Fermer si clic en dehors du picker
            const _close = (e) => {
                if (!el.contains(e.target) && !e.target.closest('[onclick*="showPropPicker"]')) {
                    el.style.display = 'none';
                    document.removeEventListener('mousedown', _close, true);
                }
            };
            document.addEventListener('mousedown', _close, true);
        }
    },

    addProperty(propId) {
        if (!propId) return;
        const picker = document.getElementById('restr-prop-picker');
        if (picker) {
            picker.style.display = 'none';
            // Remove the item from the picker (property already in the panel)
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
        // Insert in alphabetical order
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

    // ── Restriction sur une propriété HÉRITÉE (façon Protégé) ──────────
    /** Menu contextuel (clic droit) sur une propriété de la section Inherited. */
    showInheritedContextMenu(event, prop) {
        event.preventDefault();
        event.stopPropagation();
        this._closeContextMenu();
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
            `<div style="font-size:10px;color:var(--text-dim);padding:3px 16px 4px;letter-spacing:.04em;text-transform:uppercase">Add restriction (inherited → asserted)</div>` +
            `<div class="ctx-sep"></div>` +
            types.map(t =>
                `<div class="ctx-item" onclick="RestrictionEditor.addInheritedRestriction('${prop}','${t.id}')">${t.label}</div>`
            ).join('');
        document.body.appendChild(menu);
        setTimeout(() => {
            document.addEventListener('click', function close() {
                RestrictionEditor._closeContextMenu();
                document.removeEventListener('click', close);
            });
        }, 0);
    },

    /** Crée une restriction du type donné sur la classe courante pour une propriété
     *  héritée → la propriété bascule dans « Asserted ». */
    async addInheritedRestriction(prop, type) {
        this._closeContextMenu();
        const classId = ClassEditor._selectedId;
        if (!classId || !prop) return;
        const cls = (APP.state.classes || []).find(c => c.id === classId);
        if (!cls) return;
        let restr;
        if (type.includes('Cardinality')) restr = { type, property: prop, cardinality: 0 };
        else if (type === 'hasValue')     restr = { type, property: prop, value: null };
        else                              restr = { type, property: prop, filler: null };
        // Retire un éventuel _marker local pour cette prop (la restriction le remplace),
        // puis ajoute la restriction.
        const subClean = (cls.subClassOf || []).filter(r =>
            !(typeof r === 'object' && r.type === '_marker' && r.property === prop));
        subClean.push(restr);
        const updated = {
            id: cls.id,
            annotations: cls.annotations || { labels: [], comments: [], other: [] },
            subClassOf: subClean,
            equivalentClass: cls.equivalentClass || [],
            disjointWith: cls.disjointWith || [],
        };
        try {
            await API.updateClass(classId, updated);
            await APP.refresh();
            APP.renderSection('classes');
            setTimeout(() => ClassEditor.restoreSelection(), 50);
            if (typeof UI !== 'undefined' && UI.success) UI.success(`Restriction added on '${prop}' — now asserted`);
        } catch (e) { if (typeof UI !== 'undefined' && UI.error) UI.error(e.message); }
    },

    deleteProp(prop) {
        document.querySelector(`.restr-prop-group[data-prop="${prop}"]`)?.remove();
        if (this._selectedProp === prop) this._selectedProp = null;
        // Put the property back in the picker with its icon, in alphabetical order
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
            // Insert in alphabetical order among existing items
            const items = Array.from(picker.querySelectorAll('.restr-prop-item'));
            const after = items.find(el =>
                el.dataset.id.localeCompare(prop, undefined, { sensitivity: 'base' }) > 0);
            after ? picker.insertBefore(item, after) : picker.appendChild(item);
        }
        if (ClassEditor._editingId !== null) ClassEditor.autoSave();
    },

    deleteChild(gid) {
        const childEl = document.getElementById(`restr-child-${gid}`);
        const group   = childEl?.closest('.restr-prop-group');
        childEl?.remove();
        // Groupe désormais vide : un groupe vide est sérialisé comme _marker (reste
        // asserté). Pour une propriété PUREMENT HÉRITÉE (pas dans le domaine de la
        // classe courante), on retire le groupe entier → retour à « Inherited ».
        if (group && group.querySelectorAll('.restr-child-row').length === 0) {
            const prop    = group.dataset.prop;
            const clsId   = ClassEditor._editingId;
            const propObj = (APP.state.object_properties || []).find(p => p.id === prop)
                         || (APP.state.datatype_properties || []).find(p => p.id === prop);
            const inDomain = !!(clsId && propObj && (propObj.domain || []).includes(clsId));
            if (!inDomain) group.remove();
        }
        if (ClassEditor._editingId !== null) ClassEditor.autoSave();
    },

    onChildType(gid) {
        const row  = document.getElementById(`restr-child-${gid}`);
        if (!row) return;
        const type   = row.querySelector('.restr-type-sel')?.value;
        const isCard = type?.includes('Cardinality');
        // Update restriction icon
        const iconEl = row.querySelector('.restr-icon, .restr-child-icon');
        if (iconEl) iconEl.outerHTML = this._restrIcon(type);
        const card   = row.querySelector('.restr-card-inp');
        const filler = document.getElementById(`restr-filler-${gid}`);
        if (card)   card.style.display   = isCard ? 'inline' : 'none';
        if (filler) filler.style.display = isCard ? 'none'   : '';
        // Show/hide the ◦ before the cardinality field
        const cardDot = card?.previousElementSibling;
        if (cardDot?.classList.contains('tree-leaf')) cardDot.style.display = isCard ? 'inline' : 'none';
        // Régénère le contenu du filler dans la bonne forme (picker classe/individu ou champ littéral),
        // en effaçant la valeur si elle devient incompatible avec le nouveau type.
        if (filler && !isCard) {
            const prop = row.dataset.prop;
            let val = filler.querySelector('.restr-filler-val')?.value || '';
            if (val && !this._fillerValueCompatible(prop, type, val)) val = '';
            filler.innerHTML = _fillerInner(prop, type, val, gid);
        }
    },

    /** Une valeur reste-t-elle cohérente avec le nouveau type de restriction ? */
    _fillerValueCompatible(prop, type, val) {
        const mode = _fillerModeFor(prop, type);
        const isDP = (APP.state.datatype_properties || []).some(p => p.id === prop);
        if (type === 'hasValue' && isDP) return true;                 // littéral : tout texte convient
        if (mode === 'class') return (APP.state.classes || []).some(c => c.id === val) || val === 'owl:Thing';
        return (APP.state.individuals || []).some(i => i.id === val); // mode 'ind'
    },

    // ── Filler picker (position fixed, flotte par-dessus) ────────
    toggleFillerPicker(gid) {
        const wrap = document.getElementById(`restr-filler-${gid}`);
        if (!wrap) return;
        const dd = wrap.querySelector('.restr-filler-dropdown');
        const isOpen = dd.style.display !== 'none';
        document.querySelectorAll('.restr-filler-dropdown').forEach(el => el.style.display = 'none');
        if (!isOpen) {
            // Régénère le sélecteur depuis la valeur courante, dans le mode du type de restriction
            const curVal = wrap.querySelector('.restr-filler-val')?.value || '';
            const mode   = _fillerMode(gid);
            dd.innerHTML = _classHierarchyItems(gid, curVal, mode);
            const trigger = wrap.querySelector('.restr-filler-btn') || wrap;
            const rect    = trigger.getBoundingClientRect();
            const W        = mode === 'ind' ? 440 : 300;
            const margin   = 10;
            // Évite le débordement à droite de la fenêtre
            const left     = Math.min(rect.left, window.innerWidth - W - 12);
            dd.style.position = 'fixed';
            dd.style.left     = Math.max(8, left) + 'px';
            dd.style.right    = 'auto';
            dd.style.display  = 'flex';
            // Borne la hauteur à l'espace disponible (scroll interne) ; retourne vers le haut si besoin
            const spaceBelow = window.innerHeight - rect.bottom - margin;
            const spaceAbove = rect.top - margin;
            if (spaceBelow >= 240 || spaceBelow >= spaceAbove) {
                dd.style.maxHeight = Math.max(160, spaceBelow) + 'px';
                dd.style.top       = (rect.bottom + 2) + 'px';
            } else {
                dd.style.maxHeight = Math.max(160, spaceAbove) + 'px';
                const h = dd.getBoundingClientRect().height;   // hauteur réelle (déjà bornée)
                dd.style.top = Math.max(8, rect.top - h - 2) + 'px';
            }
            // Focus le champ filtre
            setTimeout(() => dd.querySelector('.rfs-filter-inp')?.focus(), 0);
            setTimeout(() => document.addEventListener('click', function close(e) {
                if (!wrap.contains(e.target) && !dd.contains(e.target)) {
                    dd.style.display = 'none';
                    document.removeEventListener('click', close, true);
                }
            }, true), 0);
        }
    },

    /** Pose la valeur du filler (id + type) sur la ligne, met à jour l'icône, sauvegarde.
     *  close=true ferme le sélecteur (cas individu / sélection finale). */
    selectFiller(gid, id, kind, close) {
        const wrap = document.getElementById(`restr-filler-${gid}`);
        if (!wrap) return;
        wrap.querySelector('.restr-filler-val').value = id;
        const lbl = wrap.querySelector('.restr-filler-lbl');
        const prow = wrap.closest('.restr-child-row');
        lbl.textContent = id || _fillerPlaceholder(prow?.dataset.prop, prow?.querySelector('.restr-type-sel')?.value);
        lbl.style.flex = '0 1 auto';
        const btn = wrap.querySelector('.restr-filler-btn');
        // Met à jour le dot (rond marron = classe, losange = individu)
        const old = btn.querySelector('.cls-dot, .xsd-dot, .restr-filler-ph');
        if (old) old.remove();
        const dot = document.createElement('span');
        dot.className = !id ? 'restr-filler-ph'
                      : kind === 'ind' ? 'xsd-dot'
                      : 'cls-dot tree-cls-dot';
        if (kind === 'ind') dot.style.cssText = 'flex-shrink:0;margin:0';
        const leaf = btn.querySelector('.tree-leaf');
        leaf ? leaf.after(dot) : btn.insertBefore(dot, btn.firstChild);
        if (close) wrap.querySelector('.restr-filler-dropdown').style.display = 'none';
        if (ClassEditor._editingId !== null) ClassEditor.autoSave();
    },

    /** Mode 'ind' — clic sur une classe à gauche : charge ses individus à droite (navigation). */
    _fillerNavClass(gid, classId) {
        const rfs = document.getElementById(`restr-filler-${gid}`)?.querySelector('.rfs');
        if (!rfs) return;
        rfs.dataset.active = classId;
        const q = (rfs.querySelector('.rfs-filter-inp')?.value || '').trim().toLowerCase();
        rfs.querySelector('.rfs-ind-list').innerHTML = _fillerIndRows(gid, classId, '', q);
        const lbl = rfs.querySelector('.rfs-active-lbl');
        if (lbl) lbl.textContent = classId || '';
        rfs.querySelectorAll('.rfs-cls-list .rfs-row').forEach(r =>
            r.classList.toggle('rfs-active', r.dataset.cls === classId));
    },

    /** Filtre en direct, selon le mode du sélecteur. */
    _fillerFilter(gid, value) {
        const rfs = document.getElementById(`restr-filler-${gid}`)?.querySelector('.rfs');
        if (!rfs) return;
        const q    = (value || '').trim().toLowerCase();
        const mode = rfs.dataset.mode || 'class';
        if (mode === 'class') {
            const sel = document.getElementById(`restr-filler-${gid}`)?.querySelector('.restr-filler-val')?.value || '';
            rfs.querySelector('.rfs-cls-list').innerHTML = _fillerClassRows(gid, sel, '', q, 'class');
        } else {
            const active = rfs.dataset.active || '';
            rfs.querySelector('.rfs-cls-list').innerHTML = _fillerClassRows(gid, '', active, q, 'ind');
            rfs.querySelector('.rfs-ind-list').innerHTML = _fillerIndRows(gid, active, '', q);
        }
    },

    // ── Collecting for save ──────────────────────────────
    collect() {
        const result = [];
        document.querySelectorAll('#restr-tree .restr-prop-group').forEach(group => {
            const prop = group.dataset.prop;
            const rows = group.querySelectorAll('.restr-child-row');
            if (rows.length === 0) {
                // Empty group → presence marker (persisted in JSON, ignored in RDF)
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
// Used by OPEditor and DPEditor
// ════════════════════════════════════════════════════════════════

/** HTML d'une ligne d'annotation (pour rendu initial).
 *  type = 'label' | 'comment' | 'other'
 *  prop : requis si type === 'other' (ex: 'rdfs:seeAlso') */
function _annoRow(type, value, lang, editor, ac, prop = null) {
    let propLabel, langCell, dataProp;
    if (type === 'other') {
        propLabel = `<span class="anno-prop-dot"></span>
                     <span class="nav-link" onclick="APP.navigateTo('annotation-properties','${prop}')"
                           title="Go to ${prop}">${prop}</span>`;
        langCell  = `<div style="display:flex;align-items:center;gap:1px">
                        <input type="text" class="anno-lang-inp" value="${lang||Settings.defaultLang}" ${ac}
                               style="width:36px;min-width:0">
                        <button class="btn-ftool" style="padding:1px 3px;font-size:9px;flex-shrink:0"
                                onclick="Settings.showLangDropdown(this)" title="Choose language">▼</button>
                    </div>`;
        dataProp  = ` data-prop="${prop}"`;
    } else {
        const propName = type === 'label' ? 'rdfs:label' : 'rdfs:comment';
        propLabel = `<span class="anno-prop-dot"></span>
                     <span class="nav-link" onclick="APP.navigateTo('annotation-properties','${propName}')"
                           title="Go to ${propName}">${propName}</span>`;
        langCell  = `<div style="display:flex;align-items:center;gap:1px">
                        <input type="text" class="anno-lang-inp" value="${lang||Settings.defaultLang}" ${ac}
                               style="width:36px;min-width:0">
                        <button class="btn-ftool" style="padding:1px 3px;font-size:9px;flex-shrink:0"
                                onclick="Settings.showLangDropdown(this)" title="Choose language">▼</button>
                    </div>`;
        dataProp  = '';
    }
    return `<tr class="anno-row" data-type="${type}"${dataProp}>
        <td class="anno-prop">${propLabel}</td>
        <td class="anno-val"><input type="text" class="anno-value" value="${_escapeHtml(value||'')}" ${ac}></td>
        <td class="anno-lang-cell">${langCell}</td>
        <td><button class="btn-frame-del" onclick="${editor}.removeAnnotRow(this)">✕</button></td>
    </tr>`;
}

/** Annotation TR element (DOM) for dynamic insertion.
 *  type = 'label' | 'comment' | 'other'
 *  propId : requis si type === 'other' */
function _makeAnnotRow(type, editor, ac, propId = null) {
    let propLabel, langHtml;
    if (type === 'other') {
        propLabel = `<span class="anno-prop-dot"></span>
                     <span class="nav-link" onclick="APP.navigateTo('annotation-properties','${propId}')"
                           title="Go to ${propId}">${propId}</span>`;
        langHtml  = `<div style="display:flex;align-items:center;gap:1px">
                        <input type="text" class="anno-lang-inp" value="${Settings.defaultLang}" ${ac}
                               style="width:36px;min-width:0">
                        <button class="btn-ftool" style="padding:1px 3px;font-size:9px;flex-shrink:0"
                                onclick="Settings.showLangDropdown(this)" title="Choose language">▼</button>
                    </div>`;
    } else {
        const propName = type === 'label' ? 'rdfs:label' : 'rdfs:comment';
        propLabel = `<span class="anno-prop-dot"></span>
                     <span class="nav-link" onclick="APP.navigateTo('annotation-properties','${propName}')"
                           title="Go to ${propName}">${propName}</span>`;
        langHtml  = `<div style="display:flex;align-items:center;gap:1px">
                        <input type="text" class="anno-lang-inp" value="${Settings.defaultLang}" ${ac}
                               style="width:36px;min-width:0">
                        <button class="btn-ftool" style="padding:1px 3px;font-size:9px;flex-shrink:0"
                                onclick="Settings.showLangDropdown(this)" title="Choose language">▼</button>
                    </div>`;
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

function _ruleUsesIndividual(rule, indId) {
    const search = (atom) => {
        if (!atom) return false;
        if (Array.isArray(atom)) return atom.some(search);
        switch (atom.type) {
            case 'equality_atom':   return atom.value === indId;
            case 'property_atom':   return atom.subject === indId || atom.object === indId;
            case 'naf_block':       return (atom.atoms || []).some(search);
            case 'conditional':     return search(atom.condition) || search(atom.consequent);
            default:                return false;
        }
    };
    return [...(rule.body || []), ...(rule.head || [])].some(search);
}

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

/** Generates the "Where Used in SWRL Rules" frame for a given element.
 *  @param {Function} testFn  (rule) => boolean — returns true if the rule references the element */
function _whereUsedFrame(testFn) {
    const used = (APP.state.swrl_rules || []).filter(testFn);
    if (!used.length) return '';
    const rows = used.map(r => {
        const mainText = r.label || r.id;
        const subText  = r.label ? r.id : '';
        const importedPrefix = r._imported ? `${r._importPrefix}:` : '';
        return `
        <div class="cls-list-item${r._imported ? ' imported-entity' : ''}" data-id="${r.id}" style="cursor:default;align-items:center">
            <span style="font-size:11px;flex-shrink:0">⚙️</span>
            <span style="flex:1;overflow:hidden;min-width:0;cursor:pointer"
                  onclick="APP.navigateTo('swrl-rules','${r.id}')"
                  onmouseover="this.querySelector('.swrl-main-lbl').style.textDecoration='underline';this.querySelector('.swrl-main-lbl').style.color='var(--accent,#5f8dd3)'"
                  onmouseout="this.querySelector('.swrl-main-lbl').style.textDecoration='';this.querySelector('.swrl-main-lbl').style.color=''">
                <span class="cls-list-lbl swrl-main-lbl" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block">${importedPrefix}${mainText}</span>
                ${subText ? `<span style="font-size:10px;color:var(--text-faint);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block">${subText}</span>` : ''}
            </span>
        </div>`;
    }).join('');
    return `<div class="h-resizer"></div>
        <div class="cls-frame">
            <div class="cls-frame-bar">
                <span class="cls-frame-tag" style="color:var(--accent)">Where Used in Rules</span>
                <span class="nav-count" style="margin-left:6px">${used.length}</span>
            </div>
            <div class="cls-frame-body">${rows}</div>
        </div>`;
}

/** Panel "Where Extracted" : liste les chunks du corpus où l'élément a été extrait.
 *  kind ∈ {'class','op','dp','individual'} (clés de provenance d'analyse). */
function _whereExtractedFrame(kind, id) {
    const data = (typeof APP !== 'undefined' && APP._analysisData) ? APP._analysisData() : [];
    const entry = data.find(e => e.kind === kind && e.id === id);
    if (!entry || !(entry.sections || []).length) return '';
    const rows = entry.sections.map(s => {
        // Label unique : <doc> — <chapter> (p.N)
        const docPart     = s.doc || '?';
        const chapterPart = s.chapter || '';
        const pagePart    = s.page != null ? 'p.' + s.page : '';
        const mainLabel   = chapterPart
            ? `${docPart} — ${chapterPart}${pagePart ? ' · ' + pagePart : ''}`
            : pagePart ? `${docPart} — ${pagePart}` : docPart;
        const refJson = APP._escAttr(JSON.stringify({doc: s.doc, chapter: s.chapter, page: s.page}));
        return `<div class="cls-list-item" style="cursor:pointer;align-items:center" data-ref="${refJson}" onclick="APP._goToAnalysisChunk(JSON.parse(this.dataset.ref))" title="Go to this chunk in Analysis tab">
            <span style="font-size:11px;flex-shrink:0">📄</span>
            <span style="flex:1;overflow:hidden;min-width:0">
                <span class="cls-list-lbl" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;color:var(--accent);text-decoration:underline dotted" title="${APP._escAttr(mainLabel)}">${APP._esc(mainLabel)}</span>
            </span>
        </div>`;
    }).join('');
    return `<div class="h-resizer"></div>
        <div class="cls-frame">
            <div class="cls-frame-bar">
                <span class="cls-frame-tag" style="color:var(--accent)">Where Extracted</span>
                <span class="nav-count" style="margin-left:6px">${entry.sections.length}</span>
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
            <span class="cls-list-lbl"${nav}>${_displayRefId(id)}</span>
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
        <span class="cls-list-lbl">${_displayRefId(id)}</span>
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

/** Toggles the visibility of a select picker */
/** Masque/affiche les items d'un picker selon le texte du champ filtre. */
function _filterPicker(input) {
    const list = input.parentElement?.querySelector('.cls-picker-list');
    if (!list) return;
    const q = (input.value || '').trim().toLowerCase();
    list.querySelectorAll('.tree-item[data-id]').forEach(it => {
        const id  = (it.dataset.id   || '').toLowerCase();
        const txt = (it.textContent  || '').toLowerCase();
        it.style.display = (!q || id.includes(q) || txt.includes(q)) ? '' : 'none';
    });
}

/** Ajoute (à la première ouverture) un champ filtre en tête d'un .cls-tree-picker,
 *  enveloppe les items dans une zone scrollable, puis remet à zéro et focus le filtre. */
/** Affiche un picker en overlay flottant (position:fixed) juste sous le bouton
 *  déclencheur, pour qu'il ne soit pas clippé par l'overflow de la section. */
function _floatPickerBelow(el, anchorSelector) {
    if (!el) return;
    const btn = typeof anchorSelector === 'string'
        ? document.querySelector(anchorSelector) : anchorSelector;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const w = 300;
    const left = Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8));
    Object.assign(el.style, {
        position: 'fixed', zIndex: '3000',
        top: (r.bottom + 3) + 'px',
        left: left + 'px',
        width: w + 'px',
        maxHeight: '340px',
        margin: '0',
        boxShadow: '0 6px 24px rgba(0,0,0,.45)',
    });
}

function _decoratePickerWithFilter(el) {
    if (!el || !el.classList.contains('cls-tree-picker')) return;
    let filter = el.querySelector(':scope > .cls-picker-filter');
    if (!filter) {
        const list = document.createElement('div');
        list.className = 'cls-picker-list';
        while (el.firstChild) list.appendChild(el.firstChild);
        filter = document.createElement('input');
        filter.type = 'text';
        filter.className = 'cls-picker-filter';
        filter.placeholder = 'Filter…';
        filter.setAttribute('autocomplete', 'off');
        filter.setAttribute('spellcheck', 'false');
        filter.addEventListener('input', () => _filterPicker(filter));
        filter.addEventListener('mousedown', e => e.stopPropagation());
        el.appendChild(filter);
        el.appendChild(list);
    }
    filter.value = '';
    _filterPicker(filter);
    setTimeout(() => filter.focus(), 0);
}

function _togglePicker(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const visible = el.style.display !== 'none';
    el.style.display = visible ? 'none' : '';
    if (!visible) {
        _decoratePickerWithFilter(el);
        el.focus();
        const close = (e) => {
            if (!el.contains(e.target) && !e.target.closest('[onclick*="_togglePicker"],[onclick*="showPicker"]')) {
                el.style.display = 'none';
                document.removeEventListener('click', close, true);
            }
        };
        setTimeout(() => document.addEventListener('click', close, true), 0);
    }
}

/** Collects annotations from a tbody (label, comment, and others) */
function _collectAnnotations(tbodyId) {
    const labels = [], comments = [], other = [];
    document.querySelectorAll(`#${tbodyId} .anno-row`).forEach(row => {
        const value = row.querySelector('.anno-value')?.value.trim() || '';
        const lang  = row.querySelector('.anno-lang-inp')?.value.trim() || Settings.defaultLang;
        if (!value) return;
        if (row.dataset.type === 'label')   labels.push({ value, lang });
        if (row.dataset.type === 'comment') comments.push({ value, lang });
        if (row.dataset.type === 'other')   other.push({ property: row.dataset.prop, value });
    });
    return { labels, comments, other };
}

/** Items HTML du picker d'annotation properties — arbre complet (built-ins + user-defined) */
function _annoPickerItems(editorName) {
    const userProps = APP.state.annotation_properties || [];
    const { childrenOf, builtinChildrenOf } = typeof APEditor !== 'undefined'
        ? APEditor._buildUserTree(userProps)
        : { childrenOf: {}, builtinChildrenOf: {} };

    const itemHtml = (id, depth, isBuiltin) => `
        <div class="tree-item" style="padding:3px 8px;padding-left:${8 + depth * 14}px"
             onclick="${editorName}.addOtherAnnotRow('${id}')">
            <span class="anno-prop-dot" style="margin-right:4px;flex-shrink:0"></span>
            <span class="tree-label" style="font-size:12px;color:var(--text2);font-family:var(--font-mono)">${_displayRefId(id)}</span>
            ${isBuiltin ? '<span style="font-size:10px;color:var(--text-faint);font-style:italic;margin-left:4px">built-in</span>' : ''}
        </div>`;

    const renderUserNode = (id, depth) => {
        const children = childrenOf[id] || [];
        return itemHtml(id, depth, false)
             + children.map(cid => renderUserNode(cid, depth + 1)).join('');
    };

    const renderNs = (ns) => {
        const builtins = AP_BUILTINS[ns];
        const nsLabel = `<div style="padding:4px 8px 2px;font-size:10px;font-weight:600;color:var(--text-dim);
                               font-family:var(--font-mono);letter-spacing:0.05em;user-select:none">${ns}</div>`;
        const builtinHtml = builtins.map(p => {
            const kids = (builtinChildrenOf[p.id] || []);
            return itemHtml(p.id, 1, true)
                 + kids.map(cid => renderUserNode(cid, 2)).join('');
        }).join('');
        // user props under this namespace with no parent
        const allUserIds  = new Set(userProps.map(q => q.id));
        const allBuiltins = new Set(Object.values(AP_BUILTINS).flat().map(q => q.id));
        const hasParent   = new Set(Object.values(childrenOf).flat().concat(Object.values(builtinChildrenOf).flat()));
        const nsRoots = userProps
            .filter(q => !hasParent.has(q.id) && q.id.startsWith(ns.replace(':', ':')))
            .map(q => renderUserNode(q.id, 1)).join('');
        return nsLabel + builtinHtml + nsRoots;
    };

    // Orphan user props (no namespace match, no parent)
    const allBuiltinIds = new Set(Object.values(AP_BUILTINS).flat().map(q => q.id));
    const hasParent     = new Set(Object.values(childrenOf).flat().concat(Object.values(builtinChildrenOf).flat()));
    const orphans = userProps
        .filter(q => !hasParent.has(q.id) && !q.id.startsWith('rdfs:') && !q.id.startsWith('owl:'))
        .map(q => renderUserNode(q.id, 0)).join('');

    return renderNs('rdfs:') + renderNs('owl:') + orphans;
}

/** Collects data-id values from a list */
function _collectList(listId) {
    return Array.from(document.querySelectorAll(`#${listId} .cls-list-item[data-id]`))
        .map(el => el.dataset.id).filter(Boolean);
}


/**
 * Activates the resizable horizontal separators (.h-resizer)
 * located in the container identified by `containerId`.
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

    _cfg: {
        tree:      '#op-tree',
        ctxMenu:   '#op-ctx-menu',
        detail:    '#op-detail',
        tcnPrefix: 'op-tcn-',
        entities:  () => APP.state.object_properties,
    },
    _treeCache: null,
    _autoSaveTimer: null,

    _selectedId: null,
    _selectedIds: new Set(),    // multi-selection
    _anchorId: null,            // anchor for Shift+Click range selection
    _deselectListener: null,    // document-level mousedown listener
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

    // ── Tree construction ──────────────────────────────────

    // Clé de nœud UNIQUE : = id pour les ids uniques, = id+sep+provenance pour les
    // HOMONYMES (deux propriétés de même id local : propre vs importée). Garde le
    // comportement identique (clé=id) pour tout sauf les homonymes.
    _TREE_SEP: '␟',
    _dupIds(props) {
        const seen = {}, dup = new Set();
        props.forEach(p => { seen[p.id] = (seen[p.id] || 0) + 1; });
        Object.keys(seen).forEach(id => { if (seen[id] > 1) dup.add(id); });
        return dup;
    },
    _nkey(p, dup) {
        return dup.has(p.id)
            ? p.id + this._TREE_SEP + (p._imported ? 'I:' + (p._importPrefix || p._importNamespace || 'imp') : 'O')
            : p.id;
    },
    /** Résout la clé de nœud pour (id, importedHint). Sans hint → 1ʳᵉ clé pour cet id. */
    _keyFor(id, imported) {
        const props = APP.state.object_properties || [];
        const dup = this._dupIds(props);
        const cands = props.filter(p => p.id === id);
        if (!cands.length) return id;
        const chosen = (imported !== undefined ? cands.find(p => !!p._imported === imported) : null) || cands[0];
        return this._nkey(chosen, dup);
    },

    buildTree(props) {
        const dup = this._dupIds(props);
        const byKey = {}, idToKeys = {};
        props.forEach(p => { const k = this._nkey(p, dup); byKey[k] = p; (idToKeys[p.id] = idToKeys[p.id] || []).push(k); });
        const childrenOf = {};
        Object.keys(byKey).forEach(k => { childrenOf[k] = []; });
        const hasParent = new Set();
        props.forEach(p => {
            const ck = this._nkey(p, dup);
            [...new Set((p.subPropertyOf || []).filter(s => typeof s === 'string' && idToKeys[s]))].forEach(parId => {
                const pks = idToKeys[parId];
                const pk = pks.find(k => !!byKey[k]._imported === !!p._imported) || pks[0];
                if (!childrenOf[pk].includes(ck)) childrenOf[pk].push(ck);
                hasParent.add(ck);
            });
        });
        const alpha = (a, b) => byKey[a].id.localeCompare(byKey[b].id, undefined, { sensitivity: 'base' });
        const roots = Object.keys(byKey).filter(k => !hasParent.has(k)).sort(alpha);
        Object.keys(childrenOf).forEach(k => childrenOf[k].sort(alpha));
        return { roots, childrenOf, byKey };
    },

    /** Déplie les ancêtres d'une clé de nœud (clés parentes de même provenance). */
    _expandAncestors(keyOrId, visited = new Set()) {
        const { childrenOf, byKey } = this.buildTree(APP.state.object_properties || []);
        const parentOf = {};
        Object.entries(childrenOf).forEach(([pk, kids]) => kids.forEach(ck => { (parentOf[ck] = parentOf[ck] || []).push(pk); }));
        const key = byKey[keyOrId] ? keyOrId : this._keyFor(keyOrId);
        const walk = (k) => {
            if (visited.has(k)) return;
            visited.add(k);
            (parentOf[k] || []).forEach(pk => { this._expanded.add(pk); walk(pk); });
        };
        walk(key);
    },

    _renderNode(key, childrenOf, depth, visited = new Set()) {
        if (visited.has(key)) return ''; // cycle guard
        const prop = (this._byKey || {})[key];
        if (!prop) return '';
        const id = prop.id;
        const children = childrenOf[key] || [];
        const nextVisited = new Set(visited); nextVisited.add(key);
        const hasChildren = children.length > 0;
        const isSelected = this._selectedKey ? this._selectedKey === key : this._selectedIds.has(id);
        const isOpen = this._expanded.has(key);
        const isImported = !!prop._imported;
        const displayId = _displayId(prop);
        const importedClass = isImported ? ' imported-entity' : '';
        const kJs = key.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const dragAttrs = `${isImported ? '' : `draggable="true" ondragstart="OPEditor.onDragStart(event,'${id}')" ondragend="OPEditor.onDragEnd(event)"`}
                 ondragover="OPEditor.onDragOver(event,'${id}')"
                 ondragleave="OPEditor.onDragLeave(event)"
                 ondrop="OPEditor.onDrop(event,'${id}')"`.trim();
        return `
        <div class="tree-root-node">
            <div class="tree-item${isSelected ? ' selected' : ''}${importedClass}"
                 style="padding-left:${depth * 16 + 6}px"
                 data-id="${id}" data-key="${_escapeHtml(key)}"
                 ${dragAttrs}
                 onclick="OPEditor.selectProp('${id}', event, ${isImported})"
                 oncontextmenu="OPEditor.showContextMenu(event,'${id}')">
                ${hasChildren
                    ? `<span class="tree-toggle${isOpen ? ' open' : ''}"
                             onclick="event.stopPropagation();OPEditor.toggleNode('${kJs}')">▶</span>`
                    : `<span class="tree-leaf">◦</span>`}
                <span class="op-prop-dot tree-op-dot"></span>
                <span class="tree-label">${_escapeHtml(displayId)}</span>
                ${prop.inverseOf ? `<span class="op-inverse-tag">(↔&thinsp;<span class="op-prop-dot" style="width:9px;height:6px;flex-shrink:0;display:inline-block;vertical-align:middle"></span>&thinsp;<span class="op-inv-nav"
                      onclick="event.stopPropagation();APP.navigateTo('object-properties','${prop.inverseOf}')"
                      onmouseover="this.style.color='var(--accent)';this.style.textDecoration='underline'"
                      onmouseout="this.style.color='';this.style.textDecoration='';">${_displayRefId(prop.inverseOf)}</span>)</span>` : ''}
            </div>
            <div id="op-tcn-${_escapeHtml(key)}" style="display:${isOpen ? 'block' : 'none'}">
                ${children.map(cid => this._renderNode(cid, childrenOf, depth + 1, nextVisited)).join('')}
            </div>
        </div>`;
    },

    renderTree(props) {
        const { roots, childrenOf, byKey } = this.buildTree(props);
        this._byKey = byKey;   // résolution clé→propriété pour _renderNode
        const { propRoot } = APP.getOntologyRootLabels();
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
            <span style="font-size:12px">${propRoot}</span>
        </div>
        ${props.length
            ? roots.map(id => this._renderNode(id, childrenOf, 1)).join('')
            : '<p class="empty" style="padding:8px 16px;font-size:12px">No ObjectProperty</p>'
        }`;
    },

    // ── Split layout ───────────────────────────────────────────

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

                <!-- ── Resizable separator ── -->
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

    // ── Selection / navigation ───────────────────────────────────

    restoreSelection() {
        this._initSplitPane();
        this._installDeselectListener();
        if (this._topPropSelected) {
            this.selectTopProp();
        } else if (this._selectedId) {
            this.selectProp(this._selectedId, false);
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
        // Vertical resizing tree ↕ super-properties
        _initHResizers('op-tree-panel');
    },

    /** Updates the "Super Properties" panel in the left column */
    _updateSuperPanel(prop) {
        const panel = document.getElementById('op-sub-list');
        if (!panel) return;
        if (!prop) {
            panel.innerHTML = `
                <div class="cls-list-empty">— select a property —</div>
                <div id="op-sub-picker" class="cls-tree-picker" style="display:none"></div>`;
            return;
        }
        const isImp = !!prop._imported;
        const superProps = [...new Set((prop.subPropertyOf || []).filter(s => typeof s === 'string'))];

        const propMap = {};
        (APP.state.object_properties || []).forEach(p => { propMap[p.id] = p; });

        const buildChain = (startId) => {
            const chain = [];
            const visited = new Set();
            let current = startId;
            while (current && !visited.has(current)) {
                visited.add(current);
                chain.push(current);
                const parentProp = propMap[current];
                const parents = parentProp ? (parentProp.subPropertyOf || []).filter(s => typeof s === 'string') : [];
                current = parents.length > 0 ? parents[0] : null;
            }
            chain.push('owl:topObjectProperty');
            return chain;
        };

        const superPropRows = superProps.map(s => {
            const chain = buildChain(s);
            return chain.map((id, i) => {
                const isRoot = id === 'owl:topObjectProperty';
                const indent = 6 + i * 14;
                if (isRoot) {
                    return `<div class="cls-list-item cls-ancestor" style="padding-left:${indent}px;opacity:0.55;font-style:italic;cursor:pointer" onclick="OPEditor.selectTopProp()">
                        <span class="op-prop-dot tree-op-dot tree-op-top-dot"></span>
                        <span class="cls-list-lbl">owl:topObjectProperty</span>
                    </div>`;
                }
                const isDirect = i === 0;
                const idP    = propMap[id];
                const dispId = idP ? _displayId(idP) : id;
                const impP   = idP?._imported ? ' imported-entity' : '';
                const anc    = (!isDirect && !impP) ? ';opacity:0.75' : '';
                return `<div class="cls-list-item${isDirect ? '' : ' cls-ancestor'}${impP}" ${isDirect ? `data-id="${id}"` : `data-ancestor-id="${id}"`} style="padding-left:${indent}px${anc}">
                    <span class="op-prop-dot tree-op-dot"></span>
                    <span class="cls-list-lbl" style="cursor:pointer"
                          onclick="APP.navigateTo('object-properties','${id}')">${_escapeHtml(dispId)}</span>
                    ${isDirect && !isImp ? `<button class="btn-frame-del" onclick="OPEditor.removeSubProp('${id}')">✕</button>` : ''}
                </div>`;
            }).join('');
        }).join('');

        panel.innerHTML = `
            ${superPropRows || '<div class="cls-list-item cls-ancestor" style="opacity:0.55;font-style:italic;cursor:pointer" onclick="OPEditor.selectTopProp()"><span class="op-prop-dot tree-op-dot tree-op-top-dot"></span><span class="cls-list-lbl">owl:topObjectProperty</span></div>'}
            ${isImp ? '' : `<div id="op-sub-picker" class="cls-tree-picker" style="display:none">
                ${_opTreePickerItems('OPEditor.addSubProp(this.dataset.id)', [prop.id])}
            </div>`}`;
    },

    selectTopProp() {
        this._selectedId = null;
        this._selectedIds.clear();
        this._anchorId = null;
        this._topPropSelected = true;
        document.querySelectorAll('#op-tree .tree-item, #op-tree .tree-root-item').forEach(el => el.classList.remove('selected'));
        document.querySelector('#op-tree .tree-root-item')?.classList.add('selected');
        const detail = document.getElementById('op-detail');
        const { propRoot } = APP.getOntologyRootLabels();
        if (detail) detail.innerHTML = `
            <div class="detail-panel-empty">
                <span class="op-prop-dot" style="width:40px;height:20px"></span>
                <strong style="font-family:var(--font-mono);font-size:13px">${propRoot}</strong>
                <span style="color:var(--text-dim);font-size:12px">Root of all Object Properties</span>
                <span style="color:var(--text2);font-size:12px">Select an existing <strong>Object Property</strong> or create a new one</span>
                <button class="btn-primary btn-sm" onclick="OPEditor.createChild()">＋ Create Object Property</button>
            </div>`;
        this._updateSuperPanel(null);
        this._updateTreeButtons();
    },

    async selectProp(id, evtOrHist = true, imported) {
        const isShift = (evtOrHist && typeof evtOrHist === 'object') ? evtOrHist.shiftKey : false;
        const _hist   = (evtOrHist && typeof evtOrHist === 'object') ? true : evtOrHist;
        // Indice de provenance pour désambiguïser les homonymes (propre vs importé)
        const _wantImp = (imported !== undefined) ? imported : this._pendingImported;
        this._pendingImported = undefined;
        const key = this._keyFor(id, _wantImp);

        if (isShift && this._anchorId) {
            // ── Shift+Click: range selection ─────────────────
            const items = [...document.querySelectorAll('#op-tree .tree-item[data-id]')];
            const ids   = items.map(el => el.dataset.id);
            const from  = ids.indexOf(this._anchorId);
            const to    = ids.indexOf(id);
            if (from !== -1 && to !== -1) {
                const [lo, hi] = from < to ? [from, to] : [to, from];
                this._selectedIds = new Set(ids.slice(lo, hi + 1));
            } else {
                this._selectedIds.add(id);
            }
            this._selectedKey = null;   // multi-sélection : pas de clé unique
        } else {
            // ── Single click: single selection ────────────────
            if (this._editingId !== null && id !== this._editingId) {
                clearTimeout(this._autoSaveTimer);
                await this._silentSave();
            }
            this._selectedIds = new Set([id]);
            this._anchorId    = id;
            this._selectedKey = key;
            if (_hist && !isShift) APP._pushNav('object-properties', id);
        }

        this._selectedId = id;
        this._topPropSelected = false;

        // Déplie l'arbre jusqu'à la propriété (chemins de super-propriétés) et re-rend
        // si nécessaire, afin que la propriété ciblée soit visible (ex. navigation depuis
        // les résultats SWRL/Query).
        if (!isShift) {
            const _expBefore = this._expanded.size;
            this._expandAncestors(key);
            if (this._expanded.size !== _expBefore) {
                const treeEl = document.getElementById('op-tree');
                if (treeEl) treeEl.innerHTML = this.renderTree(APP.state.object_properties);
            }
        }

        // Highlight : par clé en sélection simple (désambiguïse les homonymes), sinon par id
        const _single = this._selectedKey && this._selectedIds.size === 1;
        let _scrollEl = null;
        document.querySelectorAll('#op-tree .tree-item[data-id]').forEach(el => {
            const sel = _single ? (el.dataset.key === this._selectedKey) : this._selectedIds.has(el.dataset.id);
            el.classList.toggle('selected', sel);
            if (sel && !_scrollEl) _scrollEl = el;
        });
        _scrollEl?.scrollIntoView({ block: 'nearest' });

        const detail = document.getElementById('op-detail');
        if (!detail) return;

        if (this._selectedIds.size === 1) {
            const prop = (this._byKey && this._byKey[key]) || (APP.state.object_properties || []).find(p => p.id === id);
            const isImp = _applyImportedView(detail, prop, this.renderForm(prop));
            _initHResizers('op-detail');
            this._updateSuperPanel(prop || null);
            this._loadInferredInverse(id);   // aussi pour les OPs importées (parité)
            _markImportedRefs(detail);
            _markImportedRefs(document.getElementById('op-supers-list'));
        } else {
            const n = this._selectedIds.size;
            detail.innerHTML = `<div class="detail-panel-empty">
                <span style="font-size:28px"><span class="op-prop-dot" style="display:inline-block;vertical-align:middle;width:20px;height:10px"></span><span class="op-prop-dot" style="display:inline-block;vertical-align:middle;width:20px;height:10px;margin-left:4px"></span></span>
                <span><strong>${n}</strong> object properties selected</span>
            </div>`;
            this._updateSuperPanel(null);
        }
        this._updateTreeButtons();
    },

    _installDeselectListener() { _TreeCommon.installDeselectListener(this); },

    _updateTreeButtons() {
        const btnSister = document.getElementById('op-btn-sister');
        const btnChild  = document.getElementById('op-btn-child');
        const btnDelete = document.getElementById('op-btn-delete');
        if (!btnSister || !btnChild || !btnDelete) return;
        const _isImportedOP = (sid) => _isImportedId('object_properties', sid);
        const _hasImported  = this._selectedIds.size > 0 && [...this._selectedIds].some(_isImportedOP);
        const _selImported  = this._selectedId && _isImportedOP(this._selectedId);

        if (this._topPropSelected) {
            btnSister.disabled = true;
            btnSister.style.visibility = 'hidden';
            btnChild.disabled  = false;
            btnDelete.disabled = true;
            btnDelete.style.visibility = 'hidden';
        } else if (this._selectedIds.size > 1) {
            btnSister.disabled = true;
            btnSister.style.visibility = '';
            btnChild.disabled  = true;
            btnDelete.disabled = _hasImported;
            btnDelete.style.visibility = '';
        } else if (this._selectedId) {
            btnSister.disabled = !!_selImported;
            btnSister.style.visibility = _selImported ? 'hidden' : '';
            btnChild.disabled  = false;
            btnDelete.disabled = !!_selImported;
            btnDelete.style.visibility = _selImported ? 'hidden' : '';
        } else {
            btnSister.disabled = true;
            btnSister.style.visibility = '';
            btnChild.disabled  = true;
            btnDelete.disabled = true;
            btnDelete.style.visibility = '';
        }
    },

    toggleNode(id) { _TreeCommon.toggleNode(this, id); },

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
        let name = 'newObjectProperty';
        let i = 1;
        while (existing.has(name)) { name = `newObjectProperty${i++}`; }
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

    // ── Context menu ──────────────────────────────────────────

    showContextMenu(event, id) {
        event.preventDefault();
        event.stopPropagation();
        if (id) {
            if (!this._selectedIds.has(id)) {
                this._selectedIds = new Set([id]);
                this._anchorId = id;
                this._selectedId = id;
                this._topPropSelected = false;
                document.querySelectorAll('#op-tree .tree-item[data-id]').forEach(el => {
                    el.classList.toggle('selected', el.dataset.id === id);
                });
            }
        } else {
            this.selectTopProp();
        }
        this._closeContextMenu();

        const isProp = !!id;
        const isImported = isProp && _isImportedId('object_properties', id);
        const n = this._selectedIds.size;
        const deleteLabel = n > 1 ? `Delete Properties <strong>(${n})</strong>` : `Delete`;
        const menu = document.createElement('div');
        menu.id = 'op-ctx-menu';
        menu.className = 'ctx-menu';
        menu.innerHTML = `
            ${isProp && n === 1 ? `<div class="ctx-item" onclick="OPEditor._closeContextMenu();OPEditor.createChild()">
                ${this._svgChild} Add Child Property</div>
            <div class="ctx-item" onclick="OPEditor._closeContextMenu();OPEditor.createSibling()">
                ${this._svgSister} Add Sibling Property</div>
            ${!isImported ? `<div class="ctx-sep"></div>
            <div class="ctx-item ctx-danger" onclick="OPEditor._closeContextMenu();OPEditor.deleteSelected()">
                ${this._svgDelete} ${deleteLabel}</div>` : ''}` : (!isProp ? `<div class="ctx-item" onclick="OPEditor._closeContextMenu();OPEditor.createChild()">
                ${this._svgChild} Add Child Property</div>` : `${!isImported ? `<div class="ctx-item ctx-danger" onclick="OPEditor._closeContextMenu();OPEditor.deleteSelected()">
                ${this._svgDelete} ${deleteLabel}</div>` : ''}`)}
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

    onDragStart(event, id)       { _TreeCommon.onDragStart(this, event, id); },
    onDragOver(event, targetId)  { _TreeCommon.onDragOver(this, event, targetId); },
    onDragLeave(event)           { event.currentTarget.classList.remove('drag-over'); },
    onDragEnd()                  { _TreeCommon.onDragEnd(this); },

    async onDrop(event, targetId) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');
        const dragIds = this._selectedIds.size > 0 ? [...this._selectedIds] : [this._dragId];
        this._dragId = null;
        if (!dragIds.length || dragIds.includes(targetId)) return;
        if (dragIds.some(sid => this._isDescendant(targetId, sid))) {
            UI.warn('Cannot drop on a descendant — would create a cycle');
            return;
        }
        if (targetId) this._expanded.add(targetId);
        this._topPropSelected = false;
        try {
            await Promise.all(dragIds.map(draggedId => {
                const prop = (APP.state.object_properties || []).find(p => p.id === draggedId);
                if (!prop) return null;
                return API.updateOP(draggedId, { ...prop, subPropertyOf: targetId ? [targetId] : [] });
            }));
            UI.success(dragIds.length > 1 ? `${dragIds.length} properties moved` : `'${dragIds[0]}' moved`);
            this._selectedId = dragIds[0];
            this._editingId  = dragIds.length === 1 ? dragIds[0] : null;
            await APP.refresh();
            APP.renderSection('object-properties');
        } catch (e) { UI.error(e.message); }
    },

    _isDescendant(potentialDesc, ancestorId) { return _TreeCommon.isDescendant(this, potentialDesc, ancestorId); },

    async deleteSelected() {
        const ids = this._selectedIds.size > 0
            ? [...this._selectedIds]
            : (this._selectedId ? [this._selectedId] : []);
        if (!ids.length) return;

        if (ids.length === 1) {
            await this.delete(ids[0]);
            return;
        }

        const confirmed = await UI.confirm(
            `Delete <strong>${ids.length}</strong> object properties?<br>
             <small style="color:var(--text-dim)">${ids.join(', ')}</small>`
        );
        if (!confirmed) return;

        try {
            for (const id of ids) { await API.deleteOP(id); }
            UI.success(`${ids.length} object properties deleted`);
            this._selectedIds.clear();
            this._anchorId = null;
            this._selectedId = null;
            this._editingId  = null;
            this._topPropSelected = false;
            await APP.refresh();
            APP.renderSection('object-properties');
        } catch (e) { UI.error(e.message); }
    },

    // ── Protégé-style form ─────────────────────────────────

    renderForm(prop = null) {
        const isNew = !prop;
        OPEditor._editingId = isNew ? null : prop.id;
        const p = prop || { id: '', annotations: { labels: [], comments: [] },
            domain: [], range: [], subPropertyOf: [], inverseOf: null,
            characteristics: {}, propertyChainAxiom: [] };
        const chars = p.characteristics || {};
        const ac    = isNew ? 'onblur="if(this.value.trim()) OPEditor.save(true)"'
                           : 'onchange="OPEditor.autoSave()"';
        const baseIri = (APP.state.ontology?.id || '').replace(/[#/]+$/, '');
        const propIri = (p.id && baseIri) ? `${baseIri}#${p.id}` : '';

        // Annotations
        const annoRows = [
            ...(p.annotations?.labels   || []).map(l  => _annoRow('label',   l.value,  l.lang  || Settings.defaultLang, 'OPEditor', ac)),
            ...(p.annotations?.comments || []).map(cm => _annoRow('comment', cm.value, cm.lang || Settings.defaultLang, 'OPEditor', ac)),
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
                         onclick="APP.navigateTo('object-properties','${p.inverseOf}')">${_displayRefId(p.inverseOf)}</span>
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
                <div class="cls-editor-title">ID&nbsp;
                    <input type="text" id="op-id" class="cls-id-inp" value="${p.id}" placeholder="newObjectProperty" oninput="_sanitizeId(this)" ${ac} title="Local IRI identifier — cannot start with a digit">
                    <span class="cls-editor-meta">(instance of owl:ObjectProperty)</span>
                </div>
                ${propIri ? `<div class="cls-editor-iri">For Property:&nbsp;<code>${propIri}</code></div>` : ''}
            </div>

            <div class="cls-frame">
                <div class="cls-frame-bar">
                    <span class="cls-frame-tag">Annotation(s)</span>
                    <button class="btn-ftool" onclick="OPEditor.addAnnotRow('label')"   title="Add rdfs:label">${ico}&thinsp;label</button>
                    <button class="btn-ftool" onclick="OPEditor.addAnnotRow('comment')" title="Add rdfs:comment">${ico}&thinsp;comment</button>
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
                        <button class="btn-ftool" onclick="OPEditor.showPicker('op-domain-picker')" title="Add domain">${ico}</button>
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
                        <button class="btn-ftool" onclick="OPEditor.showPicker('op-range-picker')" title="Add range">${ico}</button>
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
                        ${_opTreePickerItems('OPEditor.setInverse(this.dataset.id)',
                            [p.id, ...(APP.state.object_properties || [])
                                .filter(q => q.inverseOf && q.inverseOf !== p.id)
                                .map(q => q.id)])}
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
            ${_whereExtractedFrame('op', p.id)}
        </div>`;
    },

    // ── Annotation helpers ──────────────────────────────────────

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
        // Uniqueness of inverse: if an inverse is already defined, do not open the picker
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
                <span class="cls-list-lbl">${_displayRefId(id)}</span>
                <button class="btn-frame-del" onclick="OPEditor.removeInverse()">✕</button>`;
            body.insertBefore(item, body.querySelector('input'));
        } else {
            const ph = document.createElement('div');
            ph.className = 'cls-list-empty';
            ph.textContent = '— none —';
            body.insertBefore(ph, body.querySelector('input'));
        }
        // Hide/show the + button depending on whether an inverse is defined (uniqueness)
        const btn = document.getElementById('op-inverse-btn');
        if (btn) btn.style.display = id ? 'none' : '';
        // Close the picker
        const picker = document.getElementById('op-inverse-picker');
        if (picker) picker.style.display = 'none';
        if (this._editingId !== null) this.autoSave();
    },
    removeInverse() { this.setInverse(''); },

    // ── Inverse inference ────────────────────────────────────────

    async _loadInferredInverse(id) {
        try {
            const data  = await API.getInferences();
            const items = (data.inferred_inverse_properties || []).filter(i => i.property_id === id);
            const el    = document.getElementById('op-inferred-inverse');
            if (el) el.innerHTML = items.map(i =>
                `<span class="badge-inferred" title="${i.reason}">⊢ inverse of <strong>${i.inverse_of}</strong></span>`
            ).join('');
        } catch (e) { /* silent */ }
    },

    // ── Sauvegarde ───────────────────────────────────────────────

    autoSave() {
        clearTimeout(this._autoSaveTimer);
        this._autoSaveTimer = setTimeout(() => {
            if (this._editingId !== null) this.save(false);
        }, 500);
    },

    /** Collects the current form state from the DOM (shared by save / _silentSave). */
    _collectFormProp(id) {
        const { labels, comments, other } = _collectAnnotations('op-annotations-body');
        const domain  = _collectList('op-domain-list');
        const range   = _collectList('op-range-list');
        const subPropertyOf = _collectList('op-sub-list');
        const inverseOf = document.getElementById('op-inverse-value')?.value || null;
        const chars = {};
        ['functional','inverseFunctional','transitive','symmetric','asymmetric','reflexive','irreflexive']
            .forEach(k => { chars[k] = document.getElementById(`op-${k}`)?.checked || false; });
        return { id, annotations: { labels, comments, other },
            domain, range, subPropertyOf, inverseOf: inverseOf || null,
            characteristics: chars, propertyChainAxiom: [] };
    },

    /** Silent save: persists the current DOM state without re-rendering or global refresh */
    async _silentSave() {
        const originalId = this._editingId;
        if (originalId === null) return;
        // Ne jamais sauvegarder une entité importée (lecture seule) : éviterait de
        // créer un doublon dans l'ontologie connectée et d'écraser ses tags _imported.
        if ((APP.state.object_properties || []).find(p => p.id === originalId)?._imported) return;
        const idEl = document.getElementById('op-id');
        if (!idEl) return;
        const id = idEl.value.trim();
        if (!id || _validateId(id, 'Identifier')) return;
        const prop = this._collectFormProp(id);
        try {
            await API.updateOP(originalId, prop);
            const idx = (APP.state.object_properties || []).findIndex(p => p.id === originalId);
            if (idx >= 0) APP.state.object_properties[idx] = prop;
            this._treeCache = null;
        } catch (e) { console.warn('[SWOWL] silent save failed (OP):', e.message); }
    },

    async save(isNew) {
        const originalId = isNew ? null : this._editingId;
        const id = document.getElementById('op-id').value.trim();
        const _idErr = _validateId(id, 'Identifier'); if (_idErr) return UI.error(_idErr);

        const prop = this._collectFormProp(id);

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
        // Collect descendants
        const { childrenOf } = this.buildTree(APP.state.object_properties || []);
        const descendants = [];
        const collect = (cid) => (childrenOf[cid] || []).forEach(c => { descendants.push(c); collect(c); });
        collect(id);

        const confirmed = await UI.confirm(
            descendants.length > 0
                ? `Delete <strong>${id}</strong> and its ${descendants.length} sub-propert${descendants.length > 1 ? 'ies' : 'y'}?<br>
                   <small style="color:var(--text-dim)">${descendants.join(', ')}</small>`
                : `Delete ObjectProperty <strong>${id}</strong>?`
        );
        if (!confirmed) return;
        try {
            const result = await API.deleteOP(id);
            const n = (result?.deleted || [id]).length;
            UI.success(`${n} object propert${n > 1 ? 'ies' : 'y'} deleted`);
            this._selectedId = null; this._editingId = null;
            this._selectedIds.clear(); this._anchorId = null;
            this._topPropSelected = false;
            await APP.refresh(); APP.renderSection('object-properties');
        } catch (e) { UI.error(e.message); }
    },
};


// ════════════════════════════════════════════════════════════════
// DATATYPE PROPERTIES
// ════════════════════════════════════════════════════════════════

const DPEditor = {

    _cfg: {
        tree:      '#dp-tree',
        ctxMenu:   '#dp-ctx-menu',
        detail:    '#dp-detail',
        tcnPrefix: 'dp-tcn-',
        entities:  () => APP.state.datatype_properties,
    },
    _treeCache: null,
    _autoSaveTimer: null,

    _selectedId: null,
    _selectedIds: new Set(),    // multi-selection
    _anchorId: null,            // anchor for Shift+Click range selection
    _deselectListener: null,    // document-level mousedown listener
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

    // ── Tree construction ──────────────────────────────────

    // Clés de nœud uniques (id, ou id+sep+provenance pour les homonymes) — cf. OPEditor.
    _TREE_SEP: '␟',
    _dupIds(props) {
        const seen = {}, dup = new Set();
        props.forEach(p => { seen[p.id] = (seen[p.id] || 0) + 1; });
        Object.keys(seen).forEach(id => { if (seen[id] > 1) dup.add(id); });
        return dup;
    },
    _nkey(p, dup) {
        return dup.has(p.id)
            ? p.id + this._TREE_SEP + (p._imported ? 'I:' + (p._importPrefix || p._importNamespace || 'imp') : 'O')
            : p.id;
    },
    _keyFor(id, imported) {
        const props = APP.state.datatype_properties || [];
        const dup = this._dupIds(props);
        const cands = props.filter(p => p.id === id);
        if (!cands.length) return id;
        const chosen = (imported !== undefined ? cands.find(p => !!p._imported === imported) : null) || cands[0];
        return this._nkey(chosen, dup);
    },

    buildTree(props) {
        const dup = this._dupIds(props);
        const byKey = {}, idToKeys = {};
        props.forEach(p => { const k = this._nkey(p, dup); byKey[k] = p; (idToKeys[p.id] = idToKeys[p.id] || []).push(k); });
        const childrenOf = {};
        Object.keys(byKey).forEach(k => { childrenOf[k] = []; });
        const hasParent = new Set();
        props.forEach(p => {
            const ck = this._nkey(p, dup);
            [...new Set((p.subPropertyOf || []).filter(s => typeof s === 'string' && idToKeys[s]))].forEach(parId => {
                const pks = idToKeys[parId];
                const pk = pks.find(k => !!byKey[k]._imported === !!p._imported) || pks[0];
                if (!childrenOf[pk].includes(ck)) childrenOf[pk].push(ck);
                hasParent.add(ck);
            });
        });
        const alpha = (a, b) => byKey[a].id.localeCompare(byKey[b].id, undefined, { sensitivity: 'base' });
        const roots = Object.keys(byKey).filter(k => !hasParent.has(k)).sort(alpha);
        Object.keys(childrenOf).forEach(k => childrenOf[k].sort(alpha));
        return { roots, childrenOf, byKey };
    },

    _expandAncestors(keyOrId, visited = new Set()) {
        const { childrenOf, byKey } = this.buildTree(APP.state.datatype_properties || []);
        const parentOf = {};
        Object.entries(childrenOf).forEach(([pk, kids]) => kids.forEach(ck => { (parentOf[ck] = parentOf[ck] || []).push(pk); }));
        const key = byKey[keyOrId] ? keyOrId : this._keyFor(keyOrId);
        const walk = (k) => {
            if (visited.has(k)) return;
            visited.add(k);
            (parentOf[k] || []).forEach(pk => { this._expanded.add(pk); walk(pk); });
        };
        walk(key);
    },

    _renderNode(key, childrenOf, depth, visited = new Set()) {
        if (visited.has(key)) return ''; // cycle guard
        const prop = (this._byKey || {})[key];
        if (!prop) return '';
        const id = prop.id;
        const children = childrenOf[key] || [];
        const nextVisited = new Set(visited); nextVisited.add(key);
        const hasChildren = children.length > 0;
        const isSelected = this._selectedKey ? this._selectedKey === key : this._selectedIds.has(id);
        const isOpen = this._expanded.has(key);
        const isImported = !!prop._imported;
        const displayId = _displayId(prop);
        const importedClass = isImported ? ' imported-entity' : '';
        const kJs = key.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const dragAttrs = `${isImported ? '' : `draggable="true" ondragstart="DPEditor.onDragStart(event,'${id}')" ondragend="DPEditor.onDragEnd(event)"`}
                 ondragover="DPEditor.onDragOver(event,'${id}')"
                 ondragleave="DPEditor.onDragLeave(event)"
                 ondrop="DPEditor.onDrop(event,'${id}')"`.trim();
        return `
        <div class="tree-root-node">
            <div class="tree-item${isSelected ? ' selected' : ''}${importedClass}"
                 style="padding-left:${depth * 16 + 6}px"
                 data-id="${id}" data-key="${_escapeHtml(key)}"
                 ${dragAttrs}
                 onclick="DPEditor.selectProp('${id}', event, ${isImported})"
                 oncontextmenu="DPEditor.showContextMenu(event,'${id}')">
                ${hasChildren
                    ? `<span class="tree-toggle${isOpen ? ' open' : ''}"
                             onclick="event.stopPropagation();DPEditor.toggleNode('${kJs}')">▶</span>`
                    : `<span class="tree-leaf">◦</span>`}
                <span class="dp-prop-dot tree-dp-dot"></span>
                <span class="tree-label">${_escapeHtml(displayId)}</span>
            </div>
            <div id="dp-tcn-${_escapeHtml(key)}" style="display:${isOpen ? 'block' : 'none'}">
                ${children.map(cid => this._renderNode(cid, childrenOf, depth + 1, nextVisited)).join('')}
            </div>
        </div>`;
    },

    renderTree(props) {
        const { roots, childrenOf, byKey } = this.buildTree(props);
        this._byKey = byKey;
        const { propRoot } = APP.getOntologyRootLabels();
        const dpRoot = propRoot === 'rdf:Property' ? 'rdf:Property' : 'owl:topDataProperty';
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
            <span style="font-size:12px">${dpRoot}</span>
        </div>
        ${props.length
            ? roots.map(id => this._renderNode(id, childrenOf, 1)).join('')
            : '<p class="empty" style="padding:8px 16px;font-size:12px">No DatatypeProperty</p>'
        }`;
    },

    // ── Split layout ───────────────────────────────────────────

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

                <!-- ── Resizable separator ── -->
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

    // ── Selection / navigation ───────────────────────────────────

    restoreSelection() {
        this._initSplitPane();
        this._installDeselectListener();
        if (this._topPropSelected) {
            this.selectTopProp();
        } else if (this._selectedId) {
            this.selectProp(this._selectedId, false);
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
        // Vertical resizing tree ↕ super-properties
        _initHResizers('dp-tree-panel');
    },

    /** Updates the "Super Properties" panel in the left column */
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
        const isImp = !!prop._imported;
        const superProps = [...new Set((prop.subPropertyOf || []).filter(s => typeof s === 'string'))];

        const propMap = {};
        (APP.state.datatype_properties || []).forEach(p => { propMap[p.id] = p; });

        const buildChain = (startId) => {
            const chain = [];
            const visited = new Set();
            let current = startId;
            while (current && !visited.has(current)) {
                visited.add(current);
                chain.push(current);
                const parentProp = propMap[current];
                const parents = parentProp ? (parentProp.subPropertyOf || []).filter(s => typeof s === 'string') : [];
                current = parents.length > 0 ? parents[0] : null;
            }
            chain.push('owl:topDatatypeProperty');
            return chain;
        };

        const subRows = superProps.map(s => {
            const chain = buildChain(s);
            return chain.map((id, i) => {
                const isRoot = id === 'owl:topDatatypeProperty';
                const indent = 6 + i * 14;
                if (isRoot) {
                    return `<div class="cls-list-item cls-ancestor" style="padding-left:${indent}px;opacity:0.55;font-style:italic;cursor:pointer" onclick="DPEditor.selectTopProp()">
                        <span class="dp-prop-dot tree-dp-dot tree-dp-top-dot"></span>
                        <span class="cls-list-lbl">owl:topDatatypeProperty</span>
                    </div>`;
                }
                const isDirect = i === 0;
                const idP    = propMap[id];
                const dispId = idP ? _displayId(idP) : id;
                const impP   = idP?._imported ? ' imported-entity' : '';
                const anc    = (!isDirect && !impP) ? ';opacity:0.75' : '';
                return `<div class="cls-list-item${isDirect ? '' : ' cls-ancestor'}${impP}" ${isDirect ? `data-id="${id}"` : `data-ancestor-id="${id}"`} style="padding-left:${indent}px${anc}">
                    <span class="dp-prop-dot tree-dp-dot"></span>
                    <span class="cls-list-lbl" style="cursor:pointer"
                          onclick="APP.navigateTo('datatype-properties','${id}')">${_escapeHtml(dispId)}</span>
                    ${isDirect && !isImp ? `<button class="btn-frame-del" onclick="DPEditor.removeSubProp('${id}')">✕</button>` : ''}
                </div>`;
            }).join('');
        }).join('');

        const availSub = (APP.state.datatype_properties || [])
            .filter(q => q.id !== prop.id && !superProps.includes(q.id))
            .map(q => `<option value="${q.id}">${q.id}</option>`).join('');
        panel.innerHTML = `
            ${subRows || '<div class="cls-list-item cls-ancestor" style="opacity:0.55;font-style:italic;cursor:pointer" onclick="DPEditor.selectTopProp()"><span class="dp-prop-dot tree-dp-dot tree-dp-top-dot"></span><span class="cls-list-lbl">owl:topDatatypeProperty</span></div>'}
            ${isImp ? '' : `<select id="dp-sub-picker" class="cls-picker" style="display:none"
                    onchange="DPEditor.addSubProp(this.value)">
                <option value="">— choose —</option>${availSub}
            </select>`}`;
    },

    selectTopProp() {
        this._selectedId = null;
        this._selectedIds.clear();
        this._anchorId = null;
        this._topPropSelected = true;
        document.querySelectorAll('#dp-tree .tree-item, #dp-tree .tree-root-item').forEach(el => el.classList.remove('selected'));
        document.querySelector('#dp-tree .tree-root-item')?.classList.add('selected');
        const detail = document.getElementById('dp-detail');
        const { propRoot } = APP.getOntologyRootLabels();
        const dpRoot = propRoot === 'rdf:Property' ? 'rdf:Property' : 'owl:topDataProperty';
        if (detail) detail.innerHTML = `
            <div class="detail-panel-empty">
                <span class="dp-prop-dot" style="width:40px;height:20px"></span>
                <strong style="font-family:var(--font-mono);font-size:13px">${dpRoot}</strong>
                <span style="color:var(--text-dim);font-size:12px">Root of all Datatype Properties</span>
                <span style="color:var(--text2);font-size:12px">Select an existing <strong>Datatype Property</strong> or create a new one</span>
                <button class="btn-primary btn-sm" onclick="DPEditor.createChild()">＋ Create Datatype Property</button>
            </div>`;
        this._updateSuperPanel(null);
        this._updateTreeButtons();
    },

    async selectProp(id, evtOrHist = true, imported) {
        const isShift = (evtOrHist && typeof evtOrHist === 'object') ? evtOrHist.shiftKey : false;
        const _hist   = (evtOrHist && typeof evtOrHist === 'object') ? true : evtOrHist;
        const _wantImp = (imported !== undefined) ? imported : this._pendingImported;
        this._pendingImported = undefined;
        const key = this._keyFor(id, _wantImp);

        if (isShift && this._anchorId) {
            const items = [...document.querySelectorAll('#dp-tree .tree-item[data-id]')];
            const ids   = items.map(el => el.dataset.id);
            const from  = ids.indexOf(this._anchorId);
            const to    = ids.indexOf(id);
            if (from !== -1 && to !== -1) {
                const [lo, hi] = from < to ? [from, to] : [to, from];
                this._selectedIds = new Set(ids.slice(lo, hi + 1));
            } else {
                this._selectedIds.add(id);
            }
            this._selectedKey = null;
        } else {
            if (this._editingId !== null && id !== this._editingId) {
                clearTimeout(this._autoSaveTimer);
                await this._silentSave();
            }
            this._selectedIds = new Set([id]);
            this._anchorId    = id;
            this._selectedKey = key;
            if (_hist && !isShift) APP._pushNav('datatype-properties', id);
        }

        this._selectedId = id;
        this._topPropSelected = false;

        // Déplie l'arbre jusqu'à la propriété et re-rend si besoin (navigation depuis
        // les résultats SWRL/Query).
        if (!isShift) {
            const _expBefore = this._expanded.size;
            this._expandAncestors(key);
            if (this._expanded.size !== _expBefore) {
                const treeEl = document.getElementById('dp-tree');
                if (treeEl) treeEl.innerHTML = this.renderTree(APP.state.datatype_properties);
            }
        }

        const _single = this._selectedKey && this._selectedIds.size === 1;
        let _scrollEl = null;
        document.querySelectorAll('#dp-tree .tree-item[data-id]').forEach(el => {
            const sel = _single ? (el.dataset.key === this._selectedKey) : this._selectedIds.has(el.dataset.id);
            el.classList.toggle('selected', sel);
            if (sel && !_scrollEl) _scrollEl = el;
        });
        _scrollEl?.scrollIntoView({ block: 'nearest' });

        const detail = document.getElementById('dp-detail');
        if (!detail) return;

        if (this._selectedIds.size === 1) {
            const prop = (this._byKey && this._byKey[key]) || (APP.state.datatype_properties || []).find(p => p.id === id);
            const isImp = _applyImportedView(detail, prop, this.renderForm(prop));
            _initHResizers('dp-detail');
            this._updateSuperPanel(prop || null);
            _markImportedRefs(detail);
            _markImportedRefs(document.getElementById('dp-supers-list'));
        } else {
            const n = this._selectedIds.size;
            detail.innerHTML = `<div class="detail-panel-empty">
                <span style="font-size:28px"><span class="dp-prop-dot" style="display:inline-block;vertical-align:middle;width:20px;height:10px"></span><span class="dp-prop-dot" style="display:inline-block;vertical-align:middle;width:20px;height:10px;margin-left:4px"></span></span>
                <span><strong>${n}</strong> datatype properties selected</span>
            </div>`;
            this._updateSuperPanel(null);
        }
        this._updateTreeButtons();
    },

    _installDeselectListener() { _TreeCommon.installDeselectListener(this); },

    _updateTreeButtons() {
        const btnSister = document.getElementById('dp-btn-sister');
        const btnChild  = document.getElementById('dp-btn-child');
        const btnDelete = document.getElementById('dp-btn-delete');
        if (!btnSister || !btnChild || !btnDelete) return;
        const _isImportedDP = (sid) => _isImportedId('datatype_properties', sid);
        const _hasImported  = this._selectedIds.size > 0 && [...this._selectedIds].some(_isImportedDP);
        const _selImported  = this._selectedId && _isImportedDP(this._selectedId);

        if (this._topPropSelected) {
            btnSister.disabled = true;
            btnSister.style.visibility = 'hidden';
            btnChild.disabled  = false;
            btnDelete.disabled = true;
            btnDelete.style.visibility = 'hidden';
        } else if (this._selectedIds.size > 1) {
            btnSister.disabled = true;
            btnSister.style.visibility = '';
            btnChild.disabled  = true;
            btnDelete.disabled = _hasImported;
            btnDelete.style.visibility = '';
        } else if (this._selectedId) {
            btnSister.disabled = !!_selImported;
            btnSister.style.visibility = _selImported ? 'hidden' : '';
            btnChild.disabled  = false;
            btnDelete.disabled = !!_selImported;
            btnDelete.style.visibility = _selImported ? 'hidden' : '';
        } else {
            btnSister.disabled = true;
            btnSister.style.visibility = '';
            btnChild.disabled  = true;
            btnDelete.disabled = true;
            btnDelete.style.visibility = '';
        }
    },

    toggleNode(id) { _TreeCommon.toggleNode(this, id); },

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
        let name = 'newDatatypeProperty';
        let i = 1;
        while (existing.has(name)) { name = `newDatatypeProperty${i++}`; }
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

    // ── Context menu ──────────────────────────────────────────

    showContextMenu(event, id) {
        event.preventDefault();
        event.stopPropagation();
        if (id) {
            if (!this._selectedIds.has(id)) {
                this._selectedIds = new Set([id]);
                this._anchorId = id;
                this._selectedId = id;
                this._topPropSelected = false;
                document.querySelectorAll('#dp-tree .tree-item[data-id]').forEach(el => {
                    el.classList.toggle('selected', el.dataset.id === id);
                });
            }
        } else {
            this.selectTopProp();
        }
        this._closeContextMenu();

        const isProp = !!id;
        const isImported = isProp && _isImportedId('datatype_properties', id);
        const n = this._selectedIds.size;
        const deleteLabel = n > 1 ? `Delete Properties <strong>(${n})</strong>` : `Delete`;
        const menu = document.createElement('div');
        menu.id = 'dp-ctx-menu';
        menu.className = 'ctx-menu';
        menu.innerHTML = `
            ${isProp && n === 1 ? `<div class="ctx-item" onclick="DPEditor._closeContextMenu();DPEditor.createChild()">
                ${this._svgChild} Add Child Property</div>
            <div class="ctx-item" onclick="DPEditor._closeContextMenu();DPEditor.createSibling()">
                ${this._svgSister} Add Sibling Property</div>
            ${!isImported ? `<div class="ctx-sep"></div>
            <div class="ctx-item ctx-danger" onclick="DPEditor._closeContextMenu();DPEditor.deleteSelected()">
                ${this._svgDelete} ${deleteLabel}</div>` : ''}` : (!isProp ? `<div class="ctx-item" onclick="DPEditor._closeContextMenu();DPEditor.createChild()">
                ${this._svgChild} Add Child Property</div>` : `${!isImported ? `<div class="ctx-item ctx-danger" onclick="DPEditor._closeContextMenu();DPEditor.deleteSelected()">
                ${this._svgDelete} ${deleteLabel}</div>` : ''}`)}
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

    onDragStart(event, id)       { _TreeCommon.onDragStart(this, event, id); },
    onDragOver(event, targetId)  { _TreeCommon.onDragOver(this, event, targetId); },
    onDragLeave(event)           { event.currentTarget.classList.remove('drag-over'); },
    onDragEnd()                  { _TreeCommon.onDragEnd(this); },

    async onDrop(event, targetId) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');
        const dragIds = this._selectedIds.size > 0 ? [...this._selectedIds] : [this._dragId];
        this._dragId = null;
        if (!dragIds.length || dragIds.includes(targetId)) return;
        if (dragIds.some(sid => this._isDescendant(targetId, sid))) {
            UI.warn('Cannot drop on a descendant — would create a cycle');
            return;
        }
        if (targetId) this._expanded.add(targetId);
        this._topPropSelected = false;
        try {
            await Promise.all(dragIds.map(draggedId => {
                const prop = (APP.state.datatype_properties || []).find(p => p.id === draggedId);
                if (!prop) return null;
                return API.updateDP(draggedId, { ...prop, subPropertyOf: targetId ? [targetId] : [] });
            }));
            UI.success(dragIds.length > 1 ? `${dragIds.length} properties moved` : `'${dragIds[0]}' moved`);
            this._selectedId = dragIds[0];
            this._editingId  = dragIds.length === 1 ? dragIds[0] : null;
            await APP.refresh();
            APP.renderSection('datatype-properties');
        } catch (e) { UI.error(e.message); }
    },

    _isDescendant(potentialDesc, ancestorId) { return _TreeCommon.isDescendant(this, potentialDesc, ancestorId); },

    async deleteSelected() {
        const ids = this._selectedIds.size > 0
            ? [...this._selectedIds]
            : (this._selectedId ? [this._selectedId] : []);
        if (!ids.length) return;

        if (ids.length === 1) {
            await this.delete(ids[0]);
            return;
        }

        const confirmed = await UI.confirm(
            `Delete <strong>${ids.length}</strong> datatype properties?<br>
             <small style="color:var(--text-dim)">${ids.join(', ')}</small>`
        );
        if (!confirmed) return;

        try {
            for (const id of ids) { await API.deleteDP(id); }
            UI.success(`${ids.length} datatype properties deleted`);
            this._selectedIds.clear();
            this._anchorId = null;
            this._selectedId = null;
            this._editingId  = null;
            this._topPropSelected = false;
            await APP.refresh();
            APP.renderSection('datatype-properties');
        } catch (e) { UI.error(e.message); }
    },

    // ── Protégé-style form ─────────────────────────────────

    renderForm(prop = null) {
        const isNew = !prop;
        DPEditor._editingId = isNew ? null : prop.id;
        const p = prop || { id: '', annotations: { labels: [], comments: [] },
            domain: [], range: [], subPropertyOf: [], functional: false };
        const chars = { functional: p.functional || false };
        const ac    = isNew ? '' : 'onchange="DPEditor.autoSave()"';
        const baseIri = (APP.state.ontology?.id || '').replace(/[#/]+$/, '');
        const propIri = (p.id && baseIri) ? `${baseIri}#${p.id}` : '';

        // Annotations
        const annoRows = [
            ...(p.annotations?.labels   || []).map(l  => _annoRow('label',   l.value,  l.lang  || Settings.defaultLang, 'DPEditor', ac)),
            ...(p.annotations?.comments || []).map(cm => _annoRow('comment', cm.value, cm.lang || Settings.defaultLang, 'DPEditor', ac)),
            ...(p.annotations?.other    || []).map(a  => _annoRow('other',   a.value,  '',             'DPEditor', ac, a.property)),
        ].join('');

        // Domain
        const domainRows = _listRows(p.domain || [], 'dp-domain-list', 'DPEditor.removeDomain', 'cls-dot', '', '', 'classes');

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
                <div class="cls-editor-title">ID&nbsp;
                    <input type="text" id="dp-id" class="cls-id-inp" value="${p.id}" placeholder="newDatatypeProperty" oninput="_sanitizeId(this)" ${ac} title="Local IRI identifier — cannot start with a digit">
                    <span class="cls-editor-meta">(instance of owl:DatatypeProperty)</span>
                </div>
                ${propIri ? `<div class="cls-editor-iri">For Property:&nbsp;<code>${propIri}</code></div>` : ''}
                ${isNew ? `<div style="margin-top:8px"><button class="btn-primary btn-sm" onclick="DPEditor.save(true)">✅ Create</button></div>` : ''}
            </div>

            <div class="cls-frame">
                <div class="cls-frame-bar">
                    <span class="cls-frame-tag">Annotation(s)</span>
                    <button class="btn-ftool" onclick="DPEditor.addAnnotRow('label')"   title="Add rdfs:label">${ico}&thinsp;label</button>
                    <button class="btn-ftool" onclick="DPEditor.addAnnotRow('comment')" title="Add rdfs:comment">${ico}&thinsp;comment</button>
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
                        <button class="btn-ftool" onclick="DPEditor.showPicker('dp-domain-picker')" title="Add domain">${ico}</button>
                    </div>
                    <div class="cls-frame-body" id="dp-domain-list">
                        ${domainRows || '<div class="cls-list-empty">owl:Thing</div>'}
                        <div id="dp-domain-picker" class="cls-tree-picker" style="display:none">
                            ${_classTreePickerItems('DPEditor.addDomain', p.domain||[])}
                        </div>
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
            ${_whereExtractedFrame('dp', p.id)}
        </div>`;
    },

    // ── Annotation helpers ──────────────────────────────────────

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
        // Range uniqueness: if a type is already defined, do not open the picker
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
        // Uniqueness: hide the + button after adding
        const btn = document.getElementById('dp-range-btn');
        if (btn) btn.style.display = 'none';
        if (this._editingId !== null) this.autoSave();
    },
    removeRange(id) {
        _removeListItem(id, 'dp-range-list', 'rdfs:Literal');
        // Show the + button again after removal
        const btn = document.getElementById('dp-range-btn');
        if (btn) btn.style.display = '';
        if (this._editingId !== null) this.autoSave();
    },

    addSubProp(id)    { _addListItem(id, 'dp-sub-list', 'dp-sub-picker', 'DPEditor.removeSubProp', 'dp-prop-dot', '', '', 'datatype-properties'); if (id && this._editingId !== null) this.autoSave(); },
    removeSubProp(id) { _removeListItem(id, 'dp-sub-list'); if (this._editingId !== null) this.autoSave(); },

    // ── Save / delete ─────────────────────────────────

    autoSave() {
        clearTimeout(this._autoSaveTimer);
        this._autoSaveTimer = setTimeout(() => {
            if (this._editingId !== null) this.save(false);
        }, 500);
    },

    /** Collects the current form state from the DOM (shared by save / _silentSave). */
    _collectFormProp(id) {
        const { labels, comments, other } = _collectAnnotations('dp-annotations-body');
        const domain  = _collectList('dp-domain-list');
        const range   = _collectList('dp-range-list');
        const subPropertyOf = _collectList('dp-sub-list');
        return { id, annotations: { labels, comments, other },
            domain, range, subPropertyOf,
            functional: document.getElementById('dp-functional')?.checked || false };
    },

    /** Silent save: persists the current DOM state without re-rendering or global refresh */
    async _silentSave() {
        const originalId = this._editingId;
        if (originalId === null) return;
        if ((APP.state.datatype_properties || []).find(p => p.id === originalId)?._imported) return;
        const idEl = document.getElementById('dp-id');
        if (!idEl) return;
        const id = idEl.value.trim();
        if (!id || _validateId(id, 'Identifier')) return;
        const prop = this._collectFormProp(id);
        try {
            await API.updateDP(originalId, prop);
            const idx = (APP.state.datatype_properties || []).findIndex(p => p.id === originalId);
            if (idx >= 0) APP.state.datatype_properties[idx] = prop;
            this._treeCache = null;
        } catch (e) { console.warn('[SWOWL] silent save failed (DP):', e.message); }
    },

    async save(isNew) {
        const originalId = isNew ? null : this._editingId;
        const id = document.getElementById('dp-id').value.trim();
        const _idErr = _validateId(id, 'Identifier'); if (_idErr) return UI.error(_idErr);

        const prop = this._collectFormProp(id);

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
        // Collect descendants
        const { childrenOf } = this.buildTree(APP.state.datatype_properties || []);
        const descendants = [];
        const collect = (cid) => (childrenOf[cid] || []).forEach(c => { descendants.push(c); collect(c); });
        collect(id);

        const confirmed = await UI.confirm(
            descendants.length > 0
                ? `Delete <strong>${id}</strong> and its ${descendants.length} sub-propert${descendants.length > 1 ? 'ies' : 'y'}?<br>
                   <small style="color:var(--text-dim)">${descendants.join(', ')}</small>`
                : `Delete DatatypeProperty <strong>${id}</strong>?`
        );
        if (!confirmed) return;
        try {
            const result = await API.deleteDP(id);
            const n = (result?.deleted || [id]).length;
            UI.success(`${n} datatype propert${n > 1 ? 'ies' : 'y'} deleted`);
            this._selectedId = null; this._editingId = null;
            this._selectedIds.clear(); this._anchorId = null;
            this._topPropSelected = false;
            await APP.refresh(); APP.renderSection('datatype-properties');
        } catch (e) { UI.error(e.message); }
    },
};


// ════════════════════════════════════════════════════════════════
// INDIVIDUS
// ════════════════════════════════════════════════════════════════

const IndividualEditor = {

    _editingId:         null,   // ID of the individual being edited (null = new)
    _selectedClassId:   null,   // null = owl:Thing (tous) ; string = IRI de classe
    _selectedIndId:     null,   // last selected individual (col 3 form)
    _selectedIndIds:    new Set(), // all selected individuals (multi-selection)
    _anchorIndId:       null,   // point d'ancrage pour Shift+Click
    _expandedClasses:   new Set(), // IDs des classes dépliées dans le CLASS HIERARCHY
    _displayProps:      {},     // classId → propId  (simple rule)
    _displayPropsMulti: {},     // classId → [{sep, propId}, ...]  (composite rule)

    // ── Portée d'affichage des individus (réglage GLOBAL, partagé avec les pickers) ──
    // true  = classe + toutes ses sous-classes (transitif)
    // false = uniquement les individus typés directement sur la classe
    get _includeSubclasses() {
        return localStorage.getItem('swowl_ind_include_subclasses') !== 'false';
    },
    set _includeSubclasses(v) {
        localStorage.setItem('swowl_ind_include_subclasses', v ? 'true' : 'false');
    },

    /** SVG œil (ouvert = inclut les sous-classes, barré = classe seule) + bouton de bascule. */
    _subclassToggleHtml() {
        const on = this._includeSubclasses;
        const eye = on
            ? `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8z"/><circle cx="8" cy="8" r="2"/></svg>`
            : `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4.5C1.6 5.6 1 8 1 8s2.5 4.5 7 4.5c1.2 0 2.2-.3 3.1-.7M6.2 3.7C6.8 3.6 7.4 3.5 8 3.5c4.5 0 7 4.5 7 4.5s-.7 1.3-2 2.5"/><path d="M2 2l12 12"/></svg>`;
        const title = on ? 'Showing this class + its sub-classes — click for this class only'
                         : 'Showing this class only — click to include sub-classes';
        return `<button id="ind-subclass-toggle" class="btn-sm ind-hdr-btn${on ? ' ind-eye-on' : ''}"
                    onclick="IndividualEditor.toggleSubclasses()" title="${title}">${eye}</button>`;
    },

    /** Bascule la portée (classe seule ↔ + sous-classes), persiste, et re-rend la liste. */
    toggleSubclasses() {
        this._includeSubclasses = !this._includeSubclasses;
        // Met à jour le bouton
        const wrap = document.getElementById('ind-subclass-toggle');
        if (wrap) wrap.outerHTML = this._subclassToggleHtml();
        // Re-rend la liste des individus
        const listScroll = document.getElementById('ind-list-scroll');
        if (listScroll) listScroll.innerHTML = this._renderIndList(APP.state.individuals);
    },

    // ── 3-column layout ────────────────────────────────────────

    renderSplit(individuals) {
        const treeContent = this._renderClassTree(individuals);
        const listContent = this._renderIndList(individuals);
        return `
        <div class="section-split">
            <div class="tree-panel" id="ind-tree-panel">
                <div class="tree-panel-header">
                    <h3>Class Hierarchy</h3>
                    <div style="display:flex;gap:4px;align-items:center;flex-shrink:0">
                    ${this._subclassToggleHtml()}
                    <div style="position:relative;flex-shrink:0">
                        <button class="btn-sm ind-hdr-btn" onclick="IndividualEditor._toggleDisplayMenu(event)" title="Display options"><span style="font-size:15px;line-height:1">▾</span></button>
                        <div id="ind-display-menu" class="ctx-menu" style="display:none;position:absolute;top:100%;right:0;min-width:180px;z-index:200">
                            <div class="ctx-item" onclick="IndividualEditor._openDisplayPropModal();IndividualEditor._toggleDisplayMenu()">Set Display Property</div>
                            <div class="ctx-item" onclick="IndividualEditor._openDisplayPropsMultiModal();IndividualEditor._toggleDisplayMenu()">Set Display Properties</div>
                        </div>
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
                        <button class="btn-tool" onclick="IndividualEditor.newIndividual()" title="New individual">➕</button>
                        <button id="ind-del-btn" class="btn-tool is-danger" ${this._selectedIndId ? '' : 'disabled'}
                                onclick="IndividualEditor.deleteSelected()" title="Delete selected individual">${ClassEditor._svgDelete}</button>
                    </div>
                </div>
                <div class="tree-scroll" id="ind-list-scroll"
                     onclick="IndividualEditor._onListBgClick(event)">${listContent}</div>
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

    /** Menu contextuel sur un nœud de la hiérarchie de classes (onglet Individuals) */
    _showClassContextMenu(event, id) {
        event.preventDefault();
        event.stopPropagation();
        document.getElementById('ind-cls-ctx-menu')?.remove();
        const menu = document.createElement('div');
        menu.id = 'ind-cls-ctx-menu';
        menu.className = 'ctx-menu';
        menu.style.left = event.clientX + 'px';
        menu.style.top  = event.clientY + 'px';
        menu.innerHTML = `
            <div class="ctx-item" onclick="
                document.getElementById('ind-cls-ctx-menu')?.remove();
                ClassEditor._expandAncestors('${id}');
                ClassEditor._selectedId = '${id}';
                ClassEditor._selectedIds = new Set(['${id}']);
                ClassEditor._anchorId = '${id}';
                ClassEditor._owlThingSelected = false;
                APP.renderSection('classes');
                setTimeout(() => ClassEditor.restoreSelection(), 50)">
                <span class="cls-dot" style="display:inline-block;vertical-align:middle;margin-right:4px"></span> Go to Classes Tab
            </div>`;
        document.body.appendChild(menu);
        requestAnimationFrame(() => {
            const r = menu.getBoundingClientRect();
            if (r.right  > window.innerWidth)  menu.style.left = (event.clientX - r.width)  + 'px';
            if (r.bottom > window.innerHeight)  menu.style.top  = (event.clientY - r.height) + 'px';
        });
        const close = (e) => {
            if (!menu.contains(e.target)) {
                document.getElementById('ind-cls-ctx-menu')?.remove();
                document.removeEventListener('click', close, true);
            }
        };
        setTimeout(() => document.addEventListener('click', close, true), 0);
    },

    /** Déplie/replie un nœud de la hiérarchie de classes */
    toggleClassExpand(id) {
        if (this._expandedClasses.has(id)) this._expandedClasses.delete(id);
        else                               this._expandedClasses.add(id);
        const classTree = document.getElementById('ind-class-tree');
        if (classTree) classTree.innerHTML = this._renderClassTree(APP.state.individuals);
    },

    /** Déplie tous les ancêtres d'une classe pour la rendre visible dans l'arbre.
     *  Logique : cls.subClassOf = [parentId, ...] → expand parentId puis remonter */
    _expandClassAncestors(classId) {
        const classes = APP.state.classes || [];
        const cls = classes.find(c => c.id === classId);
        if (!cls) return;
        (cls.subClassOf || [])
            .filter(s => typeof s === 'string')
            .forEach(parentId => {
                this._expandedClasses.add(parentId);   // déplie le parent pour que classId soit visible
                this._expandClassAncestors(parentId);  // remonte récursivement
            });
    },

    _renderClassTree(individuals) {
        const classes = APP.state.classes || [];
        const inds    = individuals || APP.state.individuals || [];
        const sel     = this._selectedClassId;
        const { roots, childrenOf } = ClassEditor.buildTree(classes);

        const dropAttrs = (clsId) =>
            `ondragover="IndividualEditor._onClassDragOver(event,this)"
             ondragleave="IndividualEditor._onClassDragLeave(this)"
             ondrop="IndividualEditor._onClassDrop(event,this,'${clsId}')"`;

        // Recursive collection of all sub-classes of a node (including itself)
        const allDescendants = (id) => {
            const set   = new Set([id]);
            const queue = [...(childrenOf[id] || [])];
            while (queue.length) {
                const c = queue.shift();
                if (!set.has(c)) { set.add(c); (childrenOf[c] || []).forEach(gc => queue.push(gc)); }
            }
            return set;
        };

        const renderNode = (id, depth) => {
            const pl          = depth * 16 + 6;
            const children    = childrenOf[id] || [];
            const hasChildren = children.length > 0;
            const isOpen      = this._expandedClasses.has(id);
            const desc        = allDescendants(id);
            const count       = inds.filter(x => (x.types || []).some(t => desc.has(t))).length;
            const clsObj      = classes.find(c => c.id === id);
            const isImported  = !!clsObj?._imported;
            const displayId   = _displayId(clsObj);
            const importedCls = isImported ? ' imported-entity' : '';
            const dragDrop    = dropAttrs(id);

            const toggle = hasChildren
                ? `<span class="tree-toggle${isOpen ? ' open' : ''}"
                         onclick="event.stopPropagation();IndividualEditor.toggleClassExpand('${id}')">▶</span>`
                : `<span class="tree-leaf">◦</span>`;

            const childrenHtml = (hasChildren && isOpen)
                ? `<div>${children.map(c => renderNode(c, depth + 1)).join('')}</div>`
                : '';

            return `<div class="tree-root-node">
                <div class="tree-item${id === sel ? ' selected' : ''}${importedCls}" data-id="${id}"
                     style="padding-left:${pl}px"
                     onclick="IndividualEditor.selectClass('${id}')"
                     oncontextmenu="IndividualEditor._showClassContextMenu(event,'${id}')"
                     ${dragDrop}>
                    ${toggle}
                    <span class="cls-dot tree-cls-dot"></span>
                    <span class="tree-label">${_escapeHtml(displayId)}</span>
                    ${count ? `<span class="nav-count" style="margin-left:auto;margin-right:6px">${count}</span>` : ''}
                </div>
                ${childrenHtml}
            </div>`;
        };

        // owl:Thing header
        const thingHtml = `<div class="tree-item imported-entity${sel === null ? ' selected' : ''}" data-id="owl:Thing"
            style="padding-left:6px" onclick="IndividualEditor.selectClass(null)">
            <span class="tree-toggle open" style="cursor:default">▶</span>
            <span class="cls-dot tree-thing-dot"></span>
            <span class="tree-label" style="font-style:italic">owl:Thing</span>
            <span class="nav-count" style="margin-left:auto;margin-right:6px">${inds.length}</span>
        </div>`;

        const treeHtml = roots.map(id => renderNode(id, 1)).join('');
        return treeHtml
            ? thingHtml + treeHtml
            : '<div class="cls-list-empty">No classes defined</div>';
    },

    _renderIndList(individuals) {
        const classId = this._selectedClassId;
        const inds    = individuals || APP.state.individuals || [];

        // Classe effective : owl:Thing quand rien n'est sélectionné (racine)
        const effClass = classId || 'owl:Thing';
        let filtered;
        if (!this._includeSubclasses) {
            // Portée « cette classe seule » → individus typés directement sur effClass.
            // Pour owl:Thing, on inclut aussi les individus SANS type (implicitement owl:Thing).
            filtered = effClass === 'owl:Thing'
                ? inds.filter(x => !(x.types || []).length || (x.types || []).includes('owl:Thing'))
                : inds.filter(x => (x.types || []).includes(effClass));
        } else if (effClass === 'owl:Thing') {
            // owl:Thing + sous-classes = tous les individus
            filtered = inds;
        } else {
            // Portée « + sous-classes » → individus de effClass ET de toutes ses sous-classes
            const { childrenOf } = ClassEditor.buildTree(APP.state.classes || []);
            const accepted = new Set([effClass]);
            const queue = [...(childrenOf[effClass] || [])];
            while (queue.length) {
                const c = queue.shift();
                if (!accepted.has(c)) {
                    accepted.add(c);
                    (childrenOf[c] || []).forEach(gc => queue.push(gc));
                }
            }
            filtered = inds.filter(x => (x.types || []).some(t => accepted.has(t)));
        }

        // Ensure display rules are loaded before resolving labels
        if (!Object.keys(this._displayProps).length && !Object.keys(this._displayPropsMulti).length) {
            this._loadDisplayRules();
        }

        const selId = this._selectedIndId;

        if (!filtered.length) return '<div class="cls-list-empty" style="padding:12px 8px;font-style:italic">No individuals</div>';

        filtered = [...filtered].sort((a, b) => {
            const la = (this._resolveDisplayLabel(a, this._selectedClassId) || a.id).toLowerCase();
            const lb = (this._resolveDisplayLabel(b, this._selectedClassId) || b.id).toLowerCase();
            return la.localeCompare(lb);
        });

        return filtered.map(ind => {
            const isImported = !!ind._imported;
            const dispId    = _displayId(ind);   // préfixé : import OU ontologie connectée
            const dispLabel = this._resolveDisplayLabel(ind, this._selectedClassId);
            // Display Name présent → libellé en haut + ID préfixé en dessous ;
            // sinon → juste l'ID préfixé en taille normale.
            const mainText  = dispLabel ? dispLabel : dispId;
            const subText   = dispLabel ? dispId : '';
            const importedClass = isImported ? ' imported-entity' : '';
            const dragAttrs = isImported ? '' :
                `draggable="true"
                 ondragstart="IndividualEditor._onIndDragStart(event,'${ind.id}')"
                 ondragend="IndividualEditor._onIndDragEnd(event)"`;
            return `
            <div class="tree-item${this._selectedIndIds.has(ind.id) ? ' selected' : ''}${importedClass}" data-id="${ind.id}"
                 style="padding:4px 6px 4px 10px;display:flex;align-items:center;gap:4px;${isImported ? 'cursor:default' : 'cursor:grab'}"
                 ${dragAttrs}
                 onclick="IndividualEditor.selectIndividual('${ind.id}', event.shiftKey)"
                 oncontextmenu="event.preventDefault();IndividualEditor.showContextMenu(event,'${ind.id}')">
                <span class="xsd-dot" style="flex-shrink:0;margin:0"></span>
                <span style="flex:1;overflow:hidden;min-width:0">
                    <span class="tree-label" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;display:block"
                          onmouseover="this.style.textDecoration='underline';this.style.color='var(--accent,#5f8dd3)'"
                          onmouseout="this.style.textDecoration='';this.style.color=''">${_escapeHtml(mainText)}</span>
                    ${subText ? `<span style="font-size:10px;color:var(--text-dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block">${_escapeHtml(subText)}</span>` : ''}
                </span>
            </div>`;
        }).join('');
    },

    // ── Drag & drop : déplacer un individual vers une classe ────────

    _onIndDragStart(event, indId) {
        event.dataTransfer.setData('text/plain', indId);
        event.dataTransfer.effectAllowed = 'move';
        event.currentTarget.style.opacity = '0.5';
    },

    _onIndDragEnd(event) {
        event.currentTarget.style.opacity = '';
    },

    _onClassDragOver(event, el) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        el.style.background = 'rgba(59,130,246,0.18)';
        el.style.outline    = '2px solid var(--accent)';
    },

    _onClassDragLeave(el) {
        el.style.background = '';
        el.style.outline    = '';
    },

    async _onClassDrop(event, el, targetClassId) {
        event.preventDefault();
        el.style.background = '';
        el.style.outline    = '';
        const indId = event.dataTransfer.getData('text/plain');
        if (!indId || !targetClassId) return;
        const ind = (APP.state.individuals || []).find(i => i.id === indId);
        if (!ind) return;
        // Remplace le type correspondant à la classe source (ou le premier type), sinon ajoute
        const srcClass = this._selectedClassId;
        let newTypes;
        if (srcClass && (ind.types || []).includes(srcClass)) {
            // Remplace le type source par la classe cible
            newTypes = (ind.types || []).map(t => t === srcClass ? targetClassId : t);
        } else if ((ind.types || []).length === 1) {
            // Un seul type → on le remplace
            newTypes = [targetClassId];
        } else {
            // Plusieurs types sans filtre clair → on ajoute la nouvelle classe
            newTypes = [...new Set([...(ind.types || []), targetClassId])];
        }
        if (newTypes.join(',') === (ind.types || []).join(',')) return; // pas de changement
        const updated = { ...ind, types: newTypes };
        try {
            await API.updateIndividual(indId, updated);
            UI.success(`'${indId}' moved to '${targetClassId}'`);
            await APP.refresh();
            APP.renderSection('individuals');
            this.selectIndividual(indId);
        } catch (e) { UI.error(e.message); }
    },

    // ── Selections ───────────────────────────────────────────────

    selectClass(classId) {
        this._selectedClassId = classId;
        this._selectedIndId   = null;
        this._selectedIndIds.clear();
        this._anchorIndId     = null;
        // Auto-expand les ancêtres pour rendre la classe visible
        if (classId) this._expandClassAncestors(classId);
        // Col 1 — re-rendu de l'arbre (structure tree-root-node avec collapse)
        const classTree = document.getElementById('ind-class-tree');
        if (classTree) classTree.innerHTML = this._renderClassTree(APP.state.individuals);
        // Col 2 — title + list
        const title = document.getElementById('ind-list-title');
        if (title) title.textContent = classId || 'All Individuals';
        const listScroll = document.getElementById('ind-list-scroll');
        if (listScroll) listScroll.innerHTML = this._renderIndList(APP.state.individuals);
        // Col 3 — clear
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

    selectIndividual(id, isShift = false, _hist = true) {
        if (isShift && this._anchorIndId) {
            // ── Shift+Click: range selection ─────────────────
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
            // ── Single click: single selection ────────────────────
            this._selectedIndIds = new Set([id]);
            this._anchorIndId    = id;
        }

        this._selectedIndId = id;
        this._editingId     = this._selectedIndIds.size === 1 ? id : null;
        if (_hist && !isShift) APP._pushNav('individuals', id);
        const hasImportedSel = [...this._selectedIndIds].some(sid => _isImportedId('individuals', sid));
        this._setDelBtn(this._selectedIndIds.size > 0 && !hasImportedSel);

        // Col 2 — multi-highlight
        document.querySelector('#ind-list-scroll .ind-new-placeholder')?.remove();
        document.querySelectorAll('#ind-list-scroll .tree-item').forEach(el => {
            el.classList.toggle('selected', this._selectedIndIds.has(el.dataset.id));
        });

        // Col 3 — form (1 selected) or summary (N selected)
        const detail = document.getElementById('ind-detail');
        if (!detail) return;
        if (this._selectedIndIds.size === 1) {
            const ind = (APP.state.individuals || []).find(x => x.id === id);
            if (ind) {
                _applyImportedView(detail, ind, this.renderForm(ind, ind._imported ? this._selectedClassId : undefined));
                _initHResizers('ind-detail');
            }
            _markImportedRefs(detail);
        } else {
            const n = this._selectedIndIds.size;
            detail.innerHTML = `<div class="detail-panel-empty">
                <span style="font-size:28px">◆◆</span>
                <span><strong>${n}</strong> individuals selected</span>
            </div>`;
        }
    },

    /** Sélectionne un individu ET sa classe : surligne la classe (col 1),
     *  reconstruit la liste de cette classe (col 2), sélectionne l'individu
     *  (col 2 + col 3) et le fait défiler à la vue. Utilisé par les navigations
     *  externes (résultats SPARQL, recherche globale, historique). */
    focusIndividual(id, _hist = true) {
        const ind = (APP.state.individuals || []).find(x => x.id === id);
        if (!ind) { this.selectIndividual(id, false, _hist); return; }
        // Classe représentative : 1er type "réel" (hors owl:NamedIndividual), sinon « All »
        const cls = (ind.types || []).find(t => t && t !== 'owl:NamedIndividual') || null;
        this.selectClass(cls);              // col 1 (surligne la classe) + col 2 (liste filtrée)
        this.selectIndividual(id, false, _hist);  // col 2 (surligne l'individu) + col 3 (formulaire)
        // Défile l'individu à la vue dans la colonne 2
        const sel = (window.CSS && CSS.escape) ? CSS.escape(id) : id.replace(/"/g, '\\"');
        document.querySelector(`#ind-list-scroll .tree-item[data-id="${sel}"]`)
            ?.scrollIntoView({ block: 'nearest' });
    },

    newIndividual() {
        this._selectedIndId  = null;
        this._selectedIndIds.clear();
        this._anchorIndId    = null;
        this._editingId      = null;
        this._setDelBtn(false);
        // Col 2 — deselect + insert ghost placeholder
        document.querySelectorAll('#ind-list-scroll .tree-item').forEach(el => el.classList.remove('selected'));
        const scroll = document.getElementById('ind-list-scroll');
        if (scroll) {
            scroll.querySelector('.ind-new-placeholder')?.remove();
            const ghost = document.createElement('div');
            ghost.className = 'tree-item ind-new-placeholder selected';
            ghost.style.cssText = 'padding:4px 6px 4px 10px;display:flex;align-items:center;gap:4px;opacity:0.6';
            ghost.innerHTML = `<span class="xsd-dot" style="flex-shrink:0;margin:0"></span>
                <span style="flex:1;font-style:italic;color:var(--text-dim)">new individual…</span>`;
            scroll.prepend(ghost);
        }
        // Col 3 — empty form
        const detail = document.getElementById('ind-detail');
        if (detail) {
            detail.innerHTML = this.renderForm(null, this._selectedClassId);
            _initHResizers('ind-detail');
            setTimeout(() => {
                const inp = document.getElementById('ind-id');
                if (inp) {
                    inp.value = Settings.generateIndividualId(this._selectedClassId);
                    inp.focus();
                    inp.select();
                }
            }, 30);
        }
    },

    _cancelForm() {
        this._selectedIndId  = null;
        this._selectedIndIds.clear();
        this._anchorIndId    = null;
        this._editingId      = null;
        this._setDelBtn(false);
        document.querySelectorAll('#ind-list-scroll .tree-item').forEach(el => el.classList.remove('selected'));
        document.querySelector('#ind-list-scroll .ind-new-placeholder')?.remove();
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
        // Repli : si l'ensemble multi-sélection est vide mais qu'un individu est
        // sélectionné (col 3), on le supprime — cohérent avec l'état du bouton.
        const _impSet = new Set((APP.state.individuals || []).filter(i => i._imported).map(i => i.id));
        const toDelete = (this._selectedIndIds.size
            ? [...this._selectedIndIds]
            : (this._selectedIndId ? [this._selectedIndId] : []))
            .filter(id => !_impSet.has(id));   // jamais supprimer un individu importé (lecture seule)
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

    // ── Listener document-level : désélectionner si clic hors liste ─
    _deselectListener: null,

    _installDeselectListener() {
        // Nettoyer l'ancien listener s'il existe
        if (this._deselectListener) {
            document.removeEventListener('mousedown', this._deselectListener, true);
            this._deselectListener = null;
        }
        this._deselectListener = (e) => {
            if (!this._selectedIndIds.size) return;
            // Ignorer si clic sur un item individual, dans le panneau détail, dans un modal ou sur un bouton
            if (e.target.closest('.tree-item[data-id]')) return;
            if (e.target.closest('#ind-detail'))         return;  // property panels, navigation links…
            if (e.target.closest('.ind-picker-overlay')) return;  // picker modal + display modals
            if (e.target.closest('#ind-ctx-menu'))       return;
            if (e.target.closest('.btn-icon, .btn-sm, .btn-tool')) return;
            // Tout autre clic → désélectionner
            this._selectedIndIds.clear();
            this._selectedIndId = null;
            this._anchorIndId   = null;
            this._editingId     = null;
            this._setDelBtn(false);
            document.querySelectorAll('#ind-list-scroll .tree-item').forEach(el => el.classList.remove('selected'));
            const detail = document.getElementById('ind-detail');
            if (detail) detail.innerHTML = `<div class="detail-panel-empty">
                <span class="xsd-dot" style="width:28px;height:28px"></span>
                <span>Select an individual to view details</span>
            </div>`;
        };
        document.addEventListener('mousedown', this._deselectListener, true);
    },

    // ── Clic sur le fond de la liste → désélectionner tout ───
    _onListBgClick(event) {
        // Géré par _deselectListener — garder pour compatibilité
    },

    // ── Menu contextuel (clic droit sur un individual) ────────
    showContextMenu(event, id) {
        this._closeContextMenu();
        // Si l'individual cliqué n'est pas dans la sélection courante, on le sélectionne seul
        if (!this._selectedIndIds.has(id)) {
            this.selectIndividual(id, false);
        }
        const isImported = _isImportedId('individuals', id);
        const n = this._selectedIndIds.size;
        const label = n > 1
            ? `Delete Individuals <strong>(${n})</strong>`
            : `Delete Individual`;
        const menu = document.createElement('div');
        menu.id = 'ind-ctx-menu';
        menu.className = 'ctx-menu';
        menu.innerHTML = isImported ? _importedCtxBanner() : `
            <div class="ctx-item ctx-danger" onclick="IndividualEditor._closeContextMenu();IndividualEditor.deleteSelected()">
                ${ClassEditor._svgDelete} ${label}</div>`;
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
        document.getElementById('ind-ctx-menu')?.remove();
    },

    /** Persists the display rules in the ontology (backend) */
    _saveDisplayRules() {
        const rules = { single: this._displayProps, multi: this._displayPropsMulti };
        API.updateDisplayRules(rules).catch(() => {});
        if (APP.state.ontology) APP.state.ontology.display_rules = rules;
    },

    /** Loads the display rules from the ontology state */
    _loadDisplayRules() {
        const rules = APP.state.ontology?.display_rules || {};
        this._displayProps      = rules.single || {};
        this._displayPropsMulti = rules.multi  || {};
    },

    restoreSelection() {
        this._loadDisplayRules();
        this._initSplitPanes();
        this._installDeselectListener();
        // Col 1 — restore highlighting
        const treeId = this._selectedClassId === null ? 'owl:Thing' : this._selectedClassId;
        document.querySelectorAll('#ind-class-tree .tree-item').forEach(el => {
            el.classList.toggle('selected', el.dataset.id === treeId);
        });
        // Col 2 — restore title (exact class casing)
        const titleEl = document.getElementById('ind-list-title');
        if (titleEl) titleEl.textContent = this._selectedClassId || 'All Individuals';
        // Col 2 — restore individual highlighting
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

    /** Depth of a class in the hierarchy (0 = root with no known parents).
     *  Iterative BFS, robust against cycles. */
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

    /** Collects properties of the individual's classes, separated into two maps:
     *  - asserted  : defined directly on the individual's types
     *  - inherited : defined on ancestor classes
     *  Chaque map : propId → { kind: 'op'|'dp', fillers: Set<string> }
     *  Ordered by hierarchical depth (highest classes first), then alpha.
     *  A property can only be in one or the other. */
    _getClassProperties(types) {
        const classes   = APP.state.classes || [];
        const depthCache = {};
        const depth     = (id) => { if (depthCache[id] === undefined) depthCache[id] = this._classDepth(id, classes); return depthCache[id]; };
        const alpha     = (a, b) => a.localeCompare(b);

        const addProp = (map, r, fromClass) => {
            if (!map.has(r.property)) {
                const kind = (APP.state.object_properties || []).some(p => p.id === r.property) ? 'op' : 'dp';
                map.set(r.property, { kind, fillers: new Set(), _fromClass: fromClass || null });
            }
            if (r.filler && (r.type === 'someValuesFrom' || r.type === 'allValuesFrom'))
                map.get(r.property).fillers.add(r.filler);
        };

        // ── Asserted: direct types of the individual, processed from highest to lowest ──
        const asserted = new Map();
        // Group properties of each direct type, then order by depth + alpha
        const assertedByClass = []; // [{depth, props: [r,...]}]
        const sortedTypes = [...(types || [])].sort((a, b) => depth(a) - depth(b));
        sortedTypes.forEach(typeId => {
            const cls = classes.find(c => c.id === typeId);
            if (!cls) return;
            const props = (cls.subClassOf || []).filter(r => typeof r === 'object' && r.property);
            if (props.length) assertedByClass.push({ d: depth(typeId), typeId, props });
        });
        // Sort: ascending depth, then alpha on typeId for tie-breaking
        assertedByClass.sort((a, b) => a.d - b.d || alpha(a.typeId, b.typeId));
        assertedByClass.forEach(({ typeId, props }) => {
            // Alpha dans la classe courante
            [...props].sort((a, b) => alpha(a.property, b.property))
                      .forEach(r => addProp(asserted, r, typeId));
        });

        // ── Inherited: ancestors, ordered from highest to lowest ──────────────
        const inh = new Map();
        // Collect all ancestors and their properties
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
        // Sort ancestors by ascending depth, then alpha
        [...ancMap.entries()]
            .sort((a, b) => depth(a[0]) - depth(b[0]) || alpha(a[0], b[0]))
            .forEach(([clsId, props]) => {
                [...props].sort((a, b) => alpha(a.property, b.property))
                          .forEach(r => { if (!inh.has(r.property)) addProp(inh, r, clsId); });
            });

        return { inherited: inh, asserted };
    },

    /** Refreshes the visibility of the + button after adding/removing a value */
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
        // Étendre aux descendants des classes du range
        const { childrenOf } = ClassEditor.buildTree(APP.state.classes || []);
        const accepted = new Set(rangeClasses);
        const addDesc = (id) => (childrenOf[id]||[]).forEach(c => { if(!accepted.has(c)){ accepted.add(c); addDesc(c); } });
        rangeClasses.forEach(r => addDesc(r));
        return allInds.filter(x =>
            x.id !== excludeId &&
            (x.types || []).some(t => accepted.has(t))
        );
    },

    /** Generates a dynamic property panel for an individual.
     *  propInfo = { kind: 'op'|'dp', fillers: Set<string> } */
    _renderPropPanel(propId, propInfo, ind, ac, ico) {
        const { kind, fillers } = propInfo;
        const safeId  = propId.replace(/[^a-zA-Z0-9]/g, '_');
        const dotCls  = kind === 'op' ? 'op-prop-dot' : 'dp-prop-dot';

        // Effective range: prop.range takes priority, otherwise restriction fillers
        const opData   = kind === 'op' ? (APP.state.object_properties  || []).find(p => p.id === propId) : null;
        const dpData   = kind === 'dp' ? (APP.state.datatype_properties || []).find(p => p.id === propId) : null;
        const propRange      = opData?.range || dpData?.range || [];
        const effectiveRange = [...new Set([...propRange, ...(fillers || [])])];

        // Range/multiplicity chip
        const mult = kind === 'op'
            ? (opData?.characteristics?.functional ? 'single' : 'multiple')
            : (dpData?.functional ? 'single' : 'multiple');
        const rangeChip = effectiveRange.length > 0
            ? `<span class="restr-range-chip">(${mult} ${effectiveRange.map(_displayRefId).join(' or ')})</span>`
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
            const ctxClass = effectiveRange[0] || null;
            rows = current.map(a => {
                const rawLbl = this._labelForId(a.target, ctxClass);
                const dispTarget = _displayRefId(a.target);
                const lbl = rawLbl !== a.target ? rawLbl : dispTarget;
                const sub = rawLbl !== a.target ? `<span style="font-size:10px;color:var(--text-dim);display:block">${dispTarget}</span>` : '';
                const derivedBadge = a.derived
                    ? `<span class="ind-derived-badge" title="Inferred assertion (owl:inverseOf / rdfs:subPropertyOf). To remove it, delete the source assertion." style="flex-shrink:0;font-size:10px;font-weight:600;color:#fff;background:var(--accent,#5f8dd3);border:1px solid var(--accent,#5f8dd3);border-radius:4px;padding:1px 6px;letter-spacing:.02em">⊢ inferred</span>`
                    : `<button class="btn-frame-del" onclick="${delOnclick}">✕</button>`;
                return `
                <div class="ind-prop-row${a.derived ? ' ind-derived-row' : ''}"${a.derived ? ' data-derived="1"' : ''} data-id="${a.target}" style="display:flex;align-items:center;gap:4px;padding:2px 4px${a.derived ? ';opacity:0.7' : ''}">
                    <span class="xsd-dot" style="flex-shrink:0;margin:0"></span>
                    <span class="ind-op-label" style="flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-family:var(--font-mono);cursor:pointer"
                          onclick="APP.navigateTo('individuals','${a.target}')"
                          onmouseover="this.style.textDecoration='underline';this.style.color='var(--accent,#5f8dd3)'"
                          onmouseout="this.style.textDecoration='';this.style.color=''">${lbl}${sub}</span>
                    <input type="hidden" class="ind-op-target" value="${a.target}">
                    ${derivedBadge}
                </div>`;
            }).join('') || '<div class="cls-list-empty">—</div>';
        } else {
            const current  = (ind?.dataAssertions || []).filter(a => a.property === propId);
            const dpData2  = (APP.state.datatype_properties || []).find(p => p.id === propId);
            const defDtype = dpData2?.range?.[0] || 'xsd:string';
            rows = current.map(a => {
                const isUrl = /^https?:\/\//i.test(a.value || '');
                const urlBtn = isUrl
                    ? `<a href="${(a.value||'').replace(/"/g,'&quot;')}" target="_blank" rel="noopener noreferrer"
                          style="flex-shrink:0;font-size:14px;line-height:1;opacity:0.65;text-decoration:none;cursor:pointer"
                          title="Open URL" onclick="event.stopPropagation()">🔗</a>`
                    : '';
                const derivedBadge = a.derived
                    ? `<span class="ind-derived-badge" title="Inferred assertion (rdfs:subPropertyOf). To remove it, delete the source assertion." style="flex-shrink:0;font-size:10px;font-weight:600;color:#fff;background:var(--accent,#5f8dd3);border:1px solid var(--accent,#5f8dd3);border-radius:4px;padding:1px 6px;letter-spacing:.02em">⊢ inferred</span>`
                    : `<button class="btn-frame-del" onclick="${delOnclick}">✕</button>`;
                if (a.derived) {
                    // Valeur inférée : span compact + badge JUSTE APRÈS la valeur (pas en fin de ligne)
                    return `
                    <div class="ind-prop-row ind-derived-row" data-derived="1" style="display:flex;align-items:center;gap:6px;padding:2px 4px;opacity:0.85">
                        <span class="ind-dp-value" style="flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-family:var(--font-mono);color:var(--text1)">${_escapeHtml(a.value||'')}</span>
                        ${derivedBadge}
                        ${urlBtn}
                        <span class="ind-dp-type" data-dtype="${a.datatype || defDtype}"
                              style="font-size:10px;color:var(--text-dim);flex-shrink:0;margin-left:auto">${a.datatype || defDtype}</span>
                    </div>`;
                }
                return `
                <div class="ind-prop-row" style="display:flex;align-items:center;gap:4px;padding:2px 4px">
                    <input type="text" class="ind-dp-value"
                        value="${_escapeHtml(a.value||'')}" placeholder="value" ${ac}
                        style="flex:1;font-size:11px;border:1px solid var(--border);border-radius:3px;
                               padding:2px 4px;background:var(--bg2);color:var(--text1)">
                    ${urlBtn}
                    <span class="ind-dp-type" data-dtype="${a.datatype || defDtype}"
                          style="font-size:10px;color:var(--text-dim);flex-shrink:0">${a.datatype || defDtype}</span>
                    <button class="btn-frame-del" onclick="${delOnclick}">✕</button>
                </div>`;
            }).join('') || '<div class="cls-list-empty">—</div>';
        }

        // Hide the + button if single AND already has a value
        const currentCount = kind === 'op'
            ? (ind?.objectAssertions || []).filter(a => a.property === propId).length
            : (ind?.dataAssertions   || []).filter(a => a.property === propId).length;
        const addBtnHidden = isSingle && currentCount > 0;

        return `
        <div class="cls-frame ind-prop-panel" data-prop="${propId}" data-kind="${kind}"
             data-effective-range="${erStr}" data-single="${isSingle}">
            <div class="cls-frame-bar">
                <span class="${dotCls}"></span>
                <span class="cls-frame-tag" style="margin-left:4px;cursor:pointer"
                      onclick="APP.navigateTo('${kind === 'op' ? 'object-properties' : 'datatype-properties'}','${propId}')"
                      onmouseover="this.style.textDecoration='underline'"
                      onmouseout="this.style.textDecoration=''"
                      title="Navigate to ${propId}">${_displayRefId(propId)}</span>
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

        const baseIri = (APP.state.ontology?.id || '').replace(/[#/]+$/, '');
        const indIri  = (i.id && baseIri) ? `${baseIri}#${i.id}` : '';

        // Annotations
        const annoRows = [
            ...(i.annotations?.labels   || []).map(l  => _annoRow('label',   l.value, l.lang  || Settings.defaultLang, 'IndividualEditor', ac)),
            ...(i.annotations?.comments || []).map(cm => _annoRow('comment', cm.value, cm.lang || Settings.defaultLang, 'IndividualEditor', ac)),
            ...(i.annotations?.other    || []).map(a  => _annoRow('other',   a.value,  '',             'IndividualEditor', ac, a.property)),
        ].join('');

        // Types
        const typeRows    = _listRows(i.types || [], 'ind-types-list', 'IndividualEditor.removeType', 'cls-dot', '', '', 'classes');
        const typePicker  = (APP.state.classes || [])
            .filter(c => !(i.types || []).includes(c.id))
            .map(c => `<div class="tree-item" data-id="${c.id}" style="padding:3px 8px"
                onclick="IndividualEditor.addType(this.dataset.id)">
                <span class="cls-dot tree-cls-dot"></span>
                <span class="tree-label" style="margin-left:4px">${_displayRefId(c.id)}</span>
            </div>`).join('') || '<div class="cls-list-empty" style="padding:4px 8px">No classes</div>';

        // Panels dynamiques : inherited d'abord (alpha), puis asserted (alpha)
        const { inherited: inhProps, asserted: assProps } = this._getClassProperties(i.types || []);
        // Séparateur indiquant la classe de provenance d'un groupe de propriétés.
        const originSep = (clsId) => `
            <div style="display:flex;align-items:center;gap:8px;padding:6px 4px 2px;user-select:none">
                <span style="flex:1;height:1px;background:var(--border)"></span>
                <span class="cls-dot" style="flex-shrink:0"></span>
                <span style="font-size:10px;color:var(--text-faint);font-style:italic;white-space:nowrap">
                    from ${_displayRefId(clsId)}
                </span>
                <span style="flex:1;height:1px;background:var(--border)"></span>
            </div>`;
        // Construit les panneaux en insérant un séparateur à chaque changement de
        // classe d'origine (_fromClass) ; sinon un h-resizer entre panneaux du même groupe.
        const makePanels = (map) => {
            let last = null, first = true, html = '';
            for (const [propId, propInfo] of map.entries()) {
                const from = propInfo._fromClass || null;
                if (from && from !== last) { html += originSep(from); last = from; }
                else if (!first)           { html += '<div class="h-resizer"></div>'; }
                html += this._renderPropPanel(propId, propInfo, i, ac, ico);
                first = false;
            }
            return html;
        };
        // Propriétés réellement assertées par l'individu mais NON couvertes par les
        // restrictions/domaines ci-dessus (ex. MemberOf avec domaine vide) → sinon
        // l'assertion existante serait invisible.
        const _coveredPanels = new Set([...inhProps.keys(), ...assProps.keys()]);
        const _opSet = new Set((APP.state.object_properties   || []).map(p => p.id));
        const _dpSet = new Set((APP.state.datatype_properties || []).map(p => p.id));
        const usedProps = new Map();
        [...(i.objectAssertions || []).map(a => a.property),
         ...(i.dataAssertions   || []).map(a => a.property)].forEach(pid => {
            if (!pid || _coveredPanels.has(pid) || usedProps.has(pid)) return;
            const kind = _opSet.has(pid) ? 'op' : (_dpSet.has(pid) ? 'dp' : null);
            if (kind) usedProps.set(pid, { kind, fillers: new Set() });
        });
        const inhHtml  = makePanels(inhProps);
        const assHtml  = [makePanels(assProps), makePanels(usedProps)].filter(Boolean).join('<div class="h-resizer"></div>');

        // Plus de section « inférée » : les entailments (subPropertyOf / inverseOf)
        // sont désormais matérialisés côté backend (assertions derived=True).
        const propPanelsHtml = [inhHtml, assHtml].filter(Boolean).join('<div class="h-resizer"></div>');
        const hasProps = inhProps.size + assProps.size + usedProps.size > 0;

        return `
        <div class="cls-editor">
            <div class="cls-editor-hdr">
                <div class="cls-editor-title">ID&nbsp;
                    <input type="text" id="ind-id" class="cls-id-inp" value="${i.id}"
                           placeholder="newIndividual"
                           oninput="_sanitizeId(this)"
                           ${isNew
                               ? 'onblur="if(this.value.trim()) IndividualEditor.save(true)"'
                               : ac}
                           title="IRI local identifier — cannot start with a digit">
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

            ${ind ? _whereUsedFrame(r => _ruleUsesIndividual(r, ind.id)) : ''}
            ${ind ? _whereExtractedFrame('individual', ind.id) : ''}

        </div>`;
    },

    // ── Annotation helpers ──────────────────────────────────────

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
        // Block if single and already has a value
        const panel    = body.closest('.ind-prop-panel');
        const isSingle = panel?.dataset?.single === 'true';
        if (isSingle && body.querySelectorAll('.ind-prop-row').length > 0) return;
        body.querySelector('.cls-list-empty')?.remove();
        const ac  = this._editingId !== null ? 'onchange="IndividualEditor.autoSave()"' : '';
        const row = document.createElement('div');
        row.className = 'ind-prop-row';
        row.style.cssText = 'display:flex;align-items:center;gap:4px;padding:2px 4px';
        if (kind === 'op') {
            // Read the effective range stored on the panel (prop.range OR restriction fillers)
            const panel         = body.closest('.ind-prop-panel');
            const effectiveRange = (panel?.dataset?.effectiveRange || '').split(',').filter(Boolean);
            const rangeInds     = this._indsOfRange(effectiveRange, this._editingId);
            const ctxClass = effectiveRange[0] || null;
            const opts = rangeInds.map(x => {
                const lbl = this._resolveDisplayLabel(x, ctxClass);
                return `<option value="${x.id}">${lbl ? `${lbl} (${x.id})` : x.id}</option>`;
            }).join('');
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

    /** Opens the individual selection modal for an OP */
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
                    <span class="tree-label" style="flex:1">${_displayRefId(id)}</span>
                    ${n ? `<span class="nav-count" style="margin-right:6px">${n}</span>` : ''}
                </div>`);
                (childrenOf[id]||[]).forEach(c => { if (clsIds.has(c)) visit(c, depth+1); });
            };
            roots.forEach(id => visit(id, 0));
            return lines.join('') || '<div class="cls-list-empty" style="padding:8px">—</div>';
        };

        // Build the set of classes to display
        // Si range vide → montrer TOUTES les classes (pas de contrainte)
        const allClasses = APP.state.classes || [];
        const { roots: allRoots } = ClassEditor.buildTree(allClasses);
        let clsIds, roots;
        if (effectiveRange.length > 0) {
            clsIds = new Set(effectiveRange);
            const addDesc = (id) => (childrenOf[id]||[]).forEach(c => { if(!clsIds.has(c)){ clsIds.add(c); addDesc(c); } });
            effectiveRange.forEach(r => addDesc(r));
            roots = effectiveRange;
        } else {
            clsIds = new Set(allClasses.map(c => c.id));
            roots = allRoots;
        }
        const clsHtml = renderClsTree(roots, clsIds);
        this._picker.clsIds = clsIds;   // classes autorisées (range + descendants), pour la recherche globale

        const modal = document.createElement('div');
        modal.id = 'ind-picker-overlay';
        modal.className = 'ind-picker-overlay';
        modal.innerHTML = `
        <div class="ind-picker-modal">
            <div class="ind-picker-hdr">
                <span style="font-weight:600">Select Resource — <code style="font-size:11px">${_displayRefId(propId)}</code></span>
                <button class="btn-sm" onclick="IndividualEditor.closePicker()">✕</button>
            </div>
            <div class="ind-picker-body">
                <div class="ind-picker-classes" id="ind-picker-cls-panel">
                    <div class="tree-panel-header" style="padding:4px 8px"><h3>Allowed Classes</h3></div>
                    <input type="text" class="cls-picker-filter" id="ind-picker-cls-filter"
                           placeholder="Filter classes…" autocomplete="off" spellcheck="false"
                           oninput="IndividualEditor._pickerFilter('cls')">
                    <div id="ind-picker-cls-tree">${clsHtml}</div>
                </div>
                <div class="ind-picker-inds">
                    <div class="tree-panel-header" style="padding:4px 8px"><h3 id="ind-picker-cls-title">— select a class —</h3></div>
                    <input type="text" class="cls-picker-filter" id="ind-picker-ind-filter"
                           placeholder="Filter individuals…" autocomplete="off" spellcheck="false"
                           oninput="IndividualEditor._pickerFilter('ind')">
                    <div id="ind-picker-ind-list"><div class="cls-list-empty" style="padding:8px;font-style:italic">Select a class or type to search</div></div>
                </div>
            </div>
            <div class="ind-picker-ftr">
                <button id="ind-picker-ok" class="btn-primary btn-sm" disabled
                        onclick="IndividualEditor.confirmPicker()">OK</button>
                <button id="ind-picker-new" class="btn-secondary btn-sm" disabled
                        onclick="IndividualEditor.pickerCreateNew()" title="Create a new individual with the selected class as type">＋ New</button>
                <button class="btn-secondary btn-sm" onclick="IndividualEditor.closePicker()">Cancel</button>
            </div>
        </div>`;
        document.body.appendChild(modal);

        // Select the first class by default if only one range
        if (effectiveRange.length === 1) this.pickerSelectClass(effectiveRange[0]);
        // Le filtre individus est actif dès l'ouverture (recherche globale)
        setTimeout(() => document.getElementById('ind-picker-ind-filter')?.focus(), 0);
    },

    pickerSelectClass(classId) {
        this._picker.selectedClass = classId;
        this._picker.selectedInd   = null;

        // Surligner dans l'arbre
        document.querySelectorAll('#ind-picker-cls-tree .ind-picker-cls').forEach(el =>
            el.classList.toggle('selected', el.dataset.id === classId));

        // Update the title
        const title = document.getElementById('ind-picker-cls-title');
        if (title) title.textContent = _displayRefId(classId);

        this._renderPickerIndList();
    },

    /** Une ligne d'individu dans le volet droit du picker (avec, en option, sa classe). */
    _pickerIndRow(x, ctxClass, showClass) {
        const lbl = this._resolveDisplayLabel(x, ctxClass);
        const sub = lbl ? `<span style="font-size:10px;color:var(--text-dim);display:block">${x.id}</span>` : '';
        const cls = showClass ? (x.types || []).find(t => this._picker.clsIds?.has(t)) : '';
        const clsTag = cls ? `<span style="margin-left:auto;font-size:10px;color:var(--text-faint);padding-left:8px;flex-shrink:0">${_displayRefId(cls)}</span>` : '';
        return `<div class="tree-item ind-picker-ind" data-id="${x.id}"
                 style="padding:4px 10px;cursor:pointer;align-items:center"
                 onclick="IndividualEditor.pickerSelectInd('${x.id}')"
                 ondblclick="IndividualEditor.pickerSelectInd('${x.id}');IndividualEditor.confirmPicker()">
                <span class="xsd-dot" style="margin:0 6px 0 0;flex-shrink:0"></span>
                <span class="tree-label" style="flex:0 1 auto">${lbl || x.id}${sub}</span>${clsTag}
            </div>`;
    },

    /** Rend le volet droit du picker :
     *  - filtre non vide → recherche GLOBALE sur tous les individus autorisés (toutes classes)
     *  - filtre vide + classe sélectionnée → individus de cette classe (et sous-classes)
     *  - sinon → invite à sélectionner/filtrer */
    _renderPickerIndList() {
        const listEl = document.getElementById('ind-picker-ind-list');
        if (!listEl) return;
        const q        = (document.getElementById('ind-picker-ind-filter')?.value || '').trim().toLowerCase();
        const clsIds   = this._picker.clsIds || new Set();
        const selClass = this._picker.selectedClass;
        const allInds  = (APP.state.individuals || []).filter(x => x.id !== this._editingId);
        const matchTxt = (x) => x.id.toLowerCase().includes(q)
            || (this._resolveDisplayLabel(x, null) || '').toLowerCase().includes(q);

        let html, eligible = true;
        if (q) {
            // Recherche globale parmi tous les individus dont la classe est autorisée
            const found = allInds.filter(x => (x.types || []).some(t => clsIds.has(t)) && matchTxt(x));
            html = found.length
                ? found.map(x => this._pickerIndRow(x, null, true)).join('')
                : '<div class="cls-list-empty" style="padding:8px;font-style:italic">No matching individual</div>';
        } else if (selClass) {
            const { childrenOf } = ClassEditor.buildTree(APP.state.classes || []);
            const accepted = new Set();
            const addDesc = (id) => { accepted.add(id); (childrenOf[id]||[]).forEach(c => { if(!accepted.has(c)) addDesc(c); }); };
            addDesc(selClass);
            const found = allInds.filter(x => (x.types || []).some(t => accepted.has(t)));
            html = found.length
                ? found.map(x => this._pickerIndRow(x, selClass, false)).join('')
                : '<div class="cls-list-empty" style="padding:8px;font-style:italic">No individuals</div>';
        } else {
            html = '<div class="cls-list-empty" style="padding:8px;font-style:italic">Select a class or type to search</div>';
            eligible = false;
        }
        listEl.innerHTML = html;
        this._picker.selectedInd = null;
        const ok = document.getElementById('ind-picker-ok');
        if (ok) ok.disabled = true;
        const newBtn = document.getElementById('ind-picker-new');
        if (newBtn) newBtn.disabled = !selClass;
    },

    /** Filtre en direct : 'cls' masque/affiche l'arbre des classes ; 'ind' rerend la liste globale. */
    _pickerFilter(which) {
        if (which === 'ind') { this._renderPickerIndList(); return; }
        const inp  = document.getElementById('ind-picker-cls-filter');
        const list = document.getElementById('ind-picker-cls-tree');
        if (!inp || !list) return;
        const q = (inp.value || '').trim().toLowerCase();
        list.querySelectorAll('.ind-picker-cls').forEach(it => {
            const id  = (it.dataset.id  || '').toLowerCase();
            const txt = (it.textContent || '').toLowerCase();
            it.style.display = (!q || id.includes(q) || txt.includes(q)) ? '' : 'none';
        });
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
            // Block if single and already has a value
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
            const selIndObj = (APP.state.individuals || []).find(x => x.id === selectedInd);
            const selDisp = _displayRefId(selectedInd);
            const selRawLbl = selIndObj ? this._resolveDisplayLabel(selIndObj, this._picker.selectedClass) : null;
            const selLbl = selRawLbl || selDisp;
            const selSub = selRawLbl ? `<span style="font-size:10px;color:var(--text-dim);display:block">${selDisp}</span>` : '';
            row.innerHTML = `
                <span class="xsd-dot" style="flex-shrink:0;margin:0"></span>
                <span class="ind-op-label" style="flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-family:var(--font-mono);cursor:pointer"
                      onclick="APP.navigateTo('individuals','${selectedInd}')"
                      onmouseover="this.style.textDecoration='underline';this.style.color='var(--accent,#5f8dd3)'"
                      onmouseout="this.style.textDecoration='';this.style.color=''">${selLbl}${selSub}</span>
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

    /** Shows an inline field in the picker to name then create an individual on the fly */
    pickerCreateNew() {
        const listEl = document.getElementById('ind-picker-ind-list');
        if (!listEl) return;
        // Ne pas empiler plusieurs champs
        if (listEl.querySelector('.ind-picker-new-row')) return;

        const classId = this._picker.selectedClass;
        const row = document.createElement('div');
        row.className = 'ind-picker-new-row';
        row.style.cssText = 'display:flex;align-items:center;gap:4px;padding:4px 10px;border-bottom:1px solid var(--border)';
        row.innerHTML = `
            <span class="xsd-dot" style="margin:0 6px 0 0;flex-shrink:0"></span>
            <input type="text" id="ind-picker-new-id" class="cls-id-inp"
                   placeholder="Individual ID" autocomplete="off"
                   oninput="_sanitizeId(this)"
                   style="flex:1;font-size:12px">
            <button class="btn-primary btn-sm" style="font-size:11px;padding:2px 6px"
                    onclick="IndividualEditor._pickerConfirmNew()">✓</button>
            <button class="btn-sm" style="font-size:11px;padding:2px 6px"
                    onclick="this.closest('.ind-picker-new-row').remove()">✕</button>`;
        listEl.prepend(row);
        const inp = document.getElementById('ind-picker-new-id');
        if (inp) {
            inp.value = Settings.generateIndividualId(classId);
            inp.focus();
            inp.select();
            inp.addEventListener('keydown', e => {
                if (e.key === 'Enter') IndividualEditor._pickerConfirmNew();
                if (e.key === 'Escape') row.remove();
            });
        }
    },

    async _pickerConfirmNew() {
        const inp = document.getElementById('ind-picker-new-id');
        const name = inp?.value.trim().replace(/\s+/g, '_');
        if (!name) return;
        const classId = this._picker.selectedClass;
        const ind = {
            id: name,
            annotations: { labels: [], comments: [], other: [] },
            types: classId ? [classId] : [],
            objectAssertions: [], dataAssertions: [], sameAs: [], differentFrom: [],
        };
        try {
            await API.createIndividual(ind);
            await APP.refresh();
            document.querySelector('.ind-picker-new-row')?.remove();
            if (classId) this.pickerSelectClass(classId);
            this.pickerSelectInd(name);
        } catch (e) { UI.error(e.message); }
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

    /** Returns the effective display rule for a class.
     *  Walks up the hierarchy if no rule is defined on the class itself. */
    _getEffectiveDisplayProp(classId, _visited = new Set()) {
        const key = classId || '__root__';
        if (key in this._displayProps) return this._displayProps[key] || null;
        if (!classId) return null;
        if (_visited.has(classId)) return null;
        _visited.add(classId);
        const classes = APP.state.classes || [];
        const cls = classes.find(c => c.id === classId);
        if (!cls) return this._displayProps['__root__'] || null;
        for (const parent of (cls.subClassOf || []).filter(s => typeof s === 'string')) {
            const rule = this._getEffectiveDisplayProp(parent, _visited);
            if (rule) return rule;
        }
        // Fallback: rule defined at owl:Thing level
        return this._displayProps['__root__'] || null;
    },

    /** Value to display for an individual based on a given display property.
     *  Pour rdfs:label@xx : cherche d'abord la langue xx, puis les autres langues
     *  actives dans l'ordre, puis le premier label disponible. */
    _getDisplayLabel(ind, prop) {
        if (!prop) return null;
        // rdfs:label with specific language: rdfs:label@en, rdfs:label@fr …
        if (prop === 'rdfs:label' || prop.startsWith('rdfs:label@')) {
            const labels = ind.annotations?.labels || [];
            if (!labels.length) return null;
            const requestedLang = prop.includes('@') ? prop.split('@')[1] : null;
            if (requestedLang) {
                // 1. requested language
                const exact = labels.find(l => l.lang === requestedLang);
                if (exact) return exact.value;
                // 2. autres langues actives dans l'ordre
                const activeLangs = (Settings.activeLangs || []).filter(l => l !== requestedLang);
                for (const lang of activeLangs) {
                    const found = labels.find(l => l.lang === lang);
                    if (found) return found.value;
                }
                // 3. premier label disponible quelle que soit la langue
                return labels[0].value;
            }
            // rdfs:label without language: preferred language first, otherwise first available
            const preferred = Settings.preferredLang
                ? labels.find(l => l.lang === Settings.preferredLang)
                : null;
            return (preferred || labels[0]).value;
        }
        if (prop === 'rdfs:comment') return (ind.annotations?.comments || [])[0]?.value || null;
        const other = (ind.annotations?.other || []).find(a => a.property === prop);
        if (other) return other.value;
        const da = (ind.dataAssertions || []).find(a => a.property === prop);
        if (da) return da.value;
        const oa = (ind.objectAssertions || []).find(a => a.property === prop);
        if (oa) return oa.target;
        return null;
    },

    /** Sets (or removes) the display rule for the current class */
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
        this._saveDisplayRules();
    },

    // ── Display Properties (composite) ──────────────────────────

    /** Effective composite rule (with hierarchical inheritance) */
    _getEffectiveDisplayMulti(classId, _visited = new Set()) {
        const key = classId || '__root__';
        if (key in this._displayPropsMulti) return this._displayPropsMulti[key] || null;
        if (!classId) return null;
        if (_visited.has(classId)) return null;
        _visited.add(classId);
        const classes = APP.state.classes || [];
        const cls = classes.find(c => c.id === classId);
        if (!cls) return this._displayPropsMulti['__root__'] || null;
        for (const parent of (cls.subClassOf || []).filter(s => typeof s === 'string')) {
            const rule = this._getEffectiveDisplayMulti(parent, _visited);
            if (rule) return rule;
        }
        // Fallback: rule defined at owl:Thing level
        return this._displayPropsMulti['__root__'] || null;
    },

    /** Builds the composite label from the {sep, propId} rows */
    _buildMultiLabel(ind, rows) {
        if (!rows || !rows.length) return null;
        let result = '';
        let hasValue = false;
        for (const { sep, propId } of rows) {
            if (!propId) {
                if (sep) { result += sep; hasValue = true; }
            } else {
                const val = this._getDisplayLabel(ind, propId);
                if (val) { result += (sep || '') + val; hasValue = true; }
            }
        }
        return hasValue ? result || null : null;
    },

    /** Resolves the display label of an individual based on the rules defined for its class.
     *  contextClassId : reference class for the search (e.g. selected class, picker class) */
    _resolveDisplayLabel(ind, contextClassId = null) {
        if (!ind) return null;
        const resolveForClass = (clsId) => {
            const multi = this._getEffectiveDisplayMulti(clsId);
            if (multi) return { multi };
            const single = this._getEffectiveDisplayProp(clsId);
            if (single) return { single };
            return null;
        };
        let rule = null;
        // 1. Individual's own types — always takes priority
        for (const typeId of (ind.types || [])) {
            rule = resolveForClass(typeId);
            if (rule) break;
        }
        // 2. Context class (selected in tree) — used if no rule found on own types
        if (!rule && contextClassId) rule = resolveForClass(contextClassId);
        // 3. Root rule (__root__)
        if (!rule) rule = resolveForClass(null);
        if (!rule) return null;
        return rule.multi
            ? this._buildMultiLabel(ind, rule.multi)
            : rule.single ? this._getDisplayLabel(ind, rule.single) : null;
    },

    /** Returns the display label for an individual ID (or the ID itself if no rule) */
    _labelForId(id, contextClassId = null) {
        // Auto-load display rules from state if not yet in memory
        if (!Object.keys(this._displayProps).length && !Object.keys(this._displayPropsMulti).length) {
            this._loadDisplayRules();
        }
        const ind = (APP.state.individuals || []).find(x => x.id === id);
        if (!ind) return id;
        return this._resolveDisplayLabel(ind, contextClassId) || id;
    },

    /** Saves the composite rule for the current class */
    setDisplayPropsMulti(rows) {
        const key = this._selectedClassId || '__root__';
        const cleaned = (rows || []).filter(r => r.propId || r.sep);
        if (cleaned.length) this._displayPropsMulti[key] = cleaned;
        else delete this._displayPropsMulti[key];
        document.getElementById('ind-disp-multi-modal')?.remove();
        const listScroll = document.getElementById('ind-list-scroll');
        if (listScroll) listScroll.innerHTML = this._renderIndList(APP.state.individuals);
        if (this._selectedIndId)
            document.querySelectorAll('#ind-list-scroll .tree-item').forEach(el =>
                el.classList.toggle('selected', el.dataset.id === this._selectedIndId));
        this._saveDisplayRules();
    },

    /** Ouvre le modal "Set Display Properties" (composite) */
    _openDisplayPropsMultiModal() {
        const classId  = this._selectedClassId;
        const existing = this._displayPropsMulti[classId || '__root__']
                      || this._getEffectiveDisplayMulti(classId)
                      || [{ sep: '', propId: '' }];

        // Build the list of available properties (same logic as the simple modal)
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
                        onclick="IndividualEditor._addDisplayMultiRow('')">➕ Add row</button>
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

    /** Confirms and saves the composite rule */
    _confirmDisplayMulti() {
        const rows = [];
        document.querySelectorAll('#disp-multi-rows .disp-multi-row').forEach(row => {
            const sep    = row.querySelector('.disp-sep')?.value || '';
            const propId = row.querySelector('.disp-prop')?.value || '';
            rows.push({ sep, propId });
        });
        this.setDisplayPropsMulti(rows);
    },

    /** Builds the property option list for the modals */
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
        const activeLangs = Settings.activeLangs || [];
        const labelOpts = activeLangs.length
            ? activeLangs.map(l => ({ id: `rdfs:label@${l}`, kind: 'anno', label: `rdfs:label (${l})` }))
            : [{ id: 'rdfs:label', kind: 'anno', label: 'rdfs:label' }];
        return [
            ...labelOpts,
            { id: 'rdfs:comment', kind: 'anno', label: 'rdfs:comment' },
            ...[...inh.keys()].filter(id => id !== 'rdfs:label' && id !== 'rdfs:comment').map(toOpt),
            ...[...ass.keys()].filter(id => id !== 'rdfs:label' && id !== 'rdfs:comment').map(toOpt),
            ...extras.filter(id => id !== 'rdfs:label' && id !== 'rdfs:comment').map(toOpt),
        ];
    },

    /** Opens the display property selection modal */
    _openDisplayPropModal() {
        const classId = this._selectedClassId;

        // Collect the class and all its ancestors
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

        // Properties via restrictions (same order as the individual form)
        const { inherited: inh, asserted: ass } = this._getClassProperties(classId ? [classId] : []);

        // Additional properties via domain (not covered by restrictions)
        // Only if a concrete class is selected (not owl:Thing)
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

        // Order: inherited (same order as the form) → asserted → domain extras
        const classProps = [
            ...[...inh.keys()].map(toItem),
            ...[...ass.keys()].map(toItem),
            ...domainExtras.map(toItem),
        ].filter(({ id }) => id !== 'rdfs:label' && id !== 'rdfs:comment');

        const activeLangs = Settings.activeLangs || [];
        const labelItems = activeLangs.length
            ? activeLangs.map(l => ({ id: `rdfs:label@${l}`, kind: 'anno', label: `rdfs:label (${l})` }))
            : [{ id: 'rdfs:label', kind: 'anno', label: 'rdfs:label' }];
        const items = [
            // Annotations : rdfs:label (par langue) et rdfs:comment
            ...labelItems,
            { id: 'rdfs:comment', kind: 'anno', label: 'rdfs:comment' },
            // Class properties (OP + DP via domain)
            ...classProps,
        ];

        const dotFor = (kind) => kind === 'op' ? 'op-prop-dot' : kind === 'dp' ? 'dp-prop-dot' : 'anno-prop-dot';

        // Effective rule: own to this class or inherited
        const ownRule       = this._displayProps[classId || '__root__'] || null;
        const effectiveProp = this._getEffectiveDisplayProp(classId);
        const hasOwn        = !!ownRule;

        const listHtml = items.map(({ id, kind, label }) => {
            const isActive   = effectiveProp === id;
            const isOwn      = ownRule === id;
            const isInherited = isActive && !isOwn;
            return `
            <div class="tree-item${isOwn ? ' selected' : ''}" style="padding:4px 12px;cursor:pointer"
                 onclick="IndividualEditor.setDisplayProp('${id}')">
                <span class="${dotFor(kind)}" style="flex-shrink:0;margin-right:6px"></span>
                <span class="tree-label">${label || _displayRefId(id)}</span>
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

    _autoSaveTimer: null,
    autoSave() {
        clearTimeout(this._autoSaveTimer);
        this._autoSaveTimer = setTimeout(() => {
            if (this._editingId !== null) this.save(false);
        }, 500);
    },

    // ── Sauvegarde ───────────────────────────────────────────────

    async save(isNew) {
        const originalId = isNew ? null : this._editingId;
        // Garde read-only : un individu importé ne peut pas être modifié (il serait
        // de toute façon retiré à la persistance → édition silencieusement perdue).
        if (!isNew && (APP.state.individuals || []).find(x => x.id === originalId)?._imported) {
            return UI.error('Cet individu est importé (lecture seule) et ne peut pas être modifié.');
        }
        const idRaw = document.getElementById('ind-id')?.value.trim() || '';
        const id    = idRaw.replace(/\s+/g, '_');   // spaces → underscore
        // Update the field if the value has changed
        const idEl = document.getElementById('ind-id');
        if (idEl && id !== idRaw) idEl.value = id;
        const _idErr = _validateId(id, 'Identifier'); if (_idErr) return UI.error(_idErr);

        const { labels, comments, other } = _collectAnnotations('ind-annotations-body');
        const types = _collectList('ind-types-list');

        // Keep existing sameAs / differentFrom (removed panels)
        const existingInd   = (APP.state.individuals || []).find(x => x.id === (originalId || id));
        const sameAs        = existingInd?.sameAs        || [];
        const differentFrom = existingInd?.differentFrom || [];

        // Collect from dynamic property panels
        const objAssertions = [];
        document.querySelectorAll('.ind-prop-panel[data-kind="op"]').forEach(panel => {
            const prop = panel.dataset.prop;
            panel.querySelectorAll('.ind-op-target').forEach(sel => {
                // Les assertions dérivées (inférées) ne sont pas persistées en base :
                // le backend les re-matérialise depuis leur source.
                if (sel.closest('.ind-prop-row')?.dataset.derived) return;
                if (sel.value) objAssertions.push({ property: prop, target: sel.value });
            });
        });

        const dataAssertions = [];
        document.querySelectorAll('.ind-prop-panel[data-kind="dp"]').forEach(panel => {
            const prop = panel.dataset.prop;
            panel.querySelectorAll('.ind-prop-row').forEach(row => {
                if (row.dataset.derived) return;   // inférée → non persistée en base
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
                this._selectedIndIds = new Set([id]);   // garde la sélection cohérente (corbeille, etc.)
                this._anchorIndId   = id;
                this._editingId     = id;
                this._setDelBtn(!_isImportedId('individuals', id));
                // Col 1 — recalculate counters
                const classTree = document.getElementById('ind-class-tree');
                if (classTree) classTree.innerHTML = this._renderClassTree(APP.state.individuals);
                // Col 2 — update the list
                const listScroll = document.getElementById('ind-list-scroll');
                if (listScroll) listScroll.innerHTML = this._renderIndList(APP.state.individuals);
                // Col 3 — show the created individual form
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
                this._selectedIndIds = new Set([id]);   // garde la sélection cohérente (corbeille, etc.)
                this._anchorIndId   = id;
                this._setDelBtn(!_isImportedId('individuals', id));
                await APP.refresh();
                // Col 1 — recalculate counters
                const classTree = document.getElementById('ind-class-tree');
                if (classTree) classTree.innerHTML = this._renderClassTree(APP.state.individuals);
                // Col 2 — update the list
                const listScroll = document.getElementById('ind-list-scroll');
                if (listScroll) listScroll.innerHTML = this._renderIndList(APP.state.individuals);
                // Col 3 — show fresh data
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
        if ((APP.state.individuals || []).find(x => x.id === id)?._imported) {
            return UI.error('Cet individu est importé (lecture seule) et ne peut pas être supprimé.');
        }
        if (!await UI.confirm(`Delete individual <strong>${id}</strong>?`)) return;
        try {
            await API.deleteIndividual(id);
            UI.success(`Individual '${id}' deleted`);
            await APP.refresh();
            // Clear the selection if it was the selected individual
            if (this._selectedIndId === id) {
                this._selectedIndId = null;
                this._editingId     = null;
                const detail = document.getElementById('ind-detail');
                if (detail) detail.innerHTML = `<div class="detail-panel-empty">
                    <span class="xsd-dot" style="width:28px;height:28px;margin:4px"></span>
                    <span>Select an existing Individual or create a new one</span>
                </div>`;
            }
            // Col 1 — recalculate counters
            const classTree = document.getElementById('ind-class-tree');
            if (classTree) classTree.innerHTML = this._renderClassTree(APP.state.individuals);
            // Col 2 — update the list
            const listScroll = document.getElementById('ind-list-scroll');
            if (listScroll) listScroll.innerHTML = this._renderIndList(APP.state.individuals);
        } catch (e) { UI.error(e.message); }
    },
};

// ════════════════════════════════════════════════════════════════
// ANNOTATION PROPERTIES EDITOR
// ════════════════════════════════════════════════════════════════

/**
 * Built-in annotation properties (read-only, cannot be deleted/renamed).
 * Displayed under their namespace root node.
 */
const AP_BUILTINS = {
    'rdfs:': [
        { id: 'rdfs:label',         comment: 'Human-readable name for a resource' },
        { id: 'rdfs:comment',       comment: 'Description of a resource' },
        { id: 'rdfs:seeAlso',       comment: 'Related resource with more information' },
        { id: 'rdfs:isDefinedBy',   comment: 'Resource that defines the subject' },
    ],
    'owl:': [
        { id: 'owl:versionInfo',            comment: 'Version information (string)' },
        { id: 'owl:deprecated',             comment: 'Marks entity as deprecated (boolean)' },
        { id: 'owl:priorVersion',           comment: 'Previous version of the ontology' },
        { id: 'owl:backwardCompatibleWith', comment: 'Prior version backward compatible' },
        { id: 'owl:incompatibleWith',       comment: 'Prior version incompatible' },
    ],
    'skos:': [
        { id: 'skos:prefLabel',     comment: 'Preferred lexical label' },
        { id: 'skos:altLabel',      comment: 'Alternative lexical label' },
        { id: 'skos:hiddenLabel',   comment: 'Hidden lexical label (for search)' },
        { id: 'skos:definition',    comment: 'Complete explanation of the concept' },
        { id: 'skos:note',          comment: 'General note' },
        { id: 'skos:scopeNote',     comment: 'Note clarifying the scope of a concept' },
        { id: 'skos:example',       comment: 'Example of the use of a concept' },
        { id: 'skos:editorialNote', comment: 'Editorial note (for editors)' },
        { id: 'skos:historyNote',   comment: 'Note about changes to a concept' },
        { id: 'skos:changeNote',    comment: 'Note about a fine-grained change' },
    ],
};

const APEditor = {

    _cfg: {
        tree:      '#ap-tree',
        ctxMenu:   '#ap-ctx-menu',
        detail:    '#ap-detail',
        tcnPrefix: 'ap-tcn-',          // unused — AP tree re-renders on toggle
        entities:  () => APP.state.annotation_properties,
        onDeselect: () => APEditor._highlightSelected(),
    },
    _treeCache: null,
    _autoSaveTimer: null,

    _selectedId:   null,              // null | 'rdfs:' | 'owl:' | user-prop id
    _selectedIds:  new Set(),         // multi-selection (user props only)
    _anchorId:     null,              // anchor for Shift+Click range selection
    _deselectListener: null,          // document-level mousedown listener
    _editingId:    null,              // original id being edited (null = new)
    _expanded:     new Set(Object.keys(AP_BUILTINS)),

    // ── Shared SVG icons ──────────────────────────────────────
    _svgChild:  ClassEditor._svgChild,
    _svgSister: ClassEditor._svgSister,
    _svgDelete: ClassEditor._svgDelete,
    _svgChild:  ClassEditor._svgChild,
    _svgSister: ClassEditor._svgSister,

    // ── Helpers ───────────────────────────────────────────────

    _isBuiltin(id) {
        return Object.values(AP_BUILTINS).some(arr => arr.some(p => p.id === id));
    },

    _isRoot(id) { return Object.prototype.hasOwnProperty.call(AP_BUILTINS, id); },

    /** Namespace root of a prop id ('rdfs:label' → 'rdfs:', 'myProp' → null) */
    _rootOf(id) {
        return Object.keys(AP_BUILTINS).find(ns => id.startsWith(ns)) || null;
    },

    // ── Tree construction ─────────────────────────────────────

    _allBuiltinIds() {
        return new Set(Object.values(AP_BUILTINS).flatMap(arr => arr.map(p => p.id)));
    },

    /** Build tree maps for user-defined props.
     *  builtinChildrenOf: builtinId → [userPropId] for props whose direct parent is a built-in. */
    _buildUserTree(props) {
        const allUserIds   = new Set(props.map(p => p.id));
        const allBuiltins  = this._allBuiltinIds();
        const childrenOf        = {};   // user → user children
        const builtinChildrenOf = {};   // builtinId → [userPropId]
        props.forEach(p => { childrenOf[p.id] = []; });
        const hasParent = new Set();
        props.forEach(p => {
            (p.subPropertyOf || []).forEach(par => {
                if (allUserIds.has(par)) {
                    if (!childrenOf[par].includes(p.id)) childrenOf[par].push(p.id);
                    hasParent.add(p.id);
                } else if (allBuiltins.has(par)) {
                    if (!builtinChildrenOf[par]) builtinChildrenOf[par] = [];
                    if (!builtinChildrenOf[par].includes(p.id)) builtinChildrenOf[par].push(p.id);
                    hasParent.add(p.id);
                }
            });
        });
        const alpha = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });
        const roots = props.filter(p => !hasParent.has(p.id)).map(p => p.id).sort(alpha);
        Object.keys(childrenOf).forEach(id => childrenOf[id].sort(alpha));
        Object.keys(builtinChildrenOf).forEach(id => builtinChildrenOf[id].sort(alpha));
        return { roots, childrenOf, builtinChildrenOf };
    },

    // ── Rendering ─────────────────────────────────────────────

    _renderBuiltinNode(p, childrenOf, builtinChildrenOf, props) {
        const isSel      = this._selectedId === p.id;
        const userKids   = (builtinChildrenOf[p.id] || []);
        const hasKids    = userKids.length > 0;
        const isOpen     = this._expanded.has(p.id);
        return `
        <div class="tree-root-node">
            <div class="tree-item builtin-ap${isSel ? ' selected' : ''}" style="padding-left:32px"
                 onclick="APEditor.selectProp('${p.id}')"
                 ondragover="APEditor.onDragOver(event,'${p.id}')"
                 ondragleave="APEditor.onDragLeave(event)"
                 ondrop="APEditor.onDrop(event,'${p.id}')">
                ${hasKids
                    ? `<span class="tree-toggle${isOpen ? ' open' : ''}"
                             onclick="event.stopPropagation();APEditor.toggleNode('${p.id}')">▶</span>`
                    : `<span class="tree-leaf">◦</span>`}
                <span class="anno-prop-dot tree-ap-dot"></span>
                <span class="tree-label">${p.id}</span>
                <span style="font-size:10px;color:var(--text-faint);margin-left:6px;font-style:italic">built-in</span>
            </div>
            ${hasKids ? `<div style="display:${isOpen ? 'block' : 'none'}">
                ${userKids.map(cid => this._renderUserNode(cid, childrenOf, 3, props)).join('')}
            </div>` : ''}
        </div>`;
    },

    _renderUserNode(id, childrenOf, depth, props) {
        const prop = props.find(p => p.id === id);
        if (!prop) return '';
        const children = childrenOf[id] || [];
        const hasChildren = children.length > 0;
        const isSel = this._selectedIds.has(id);
        const isOpen = this._expanded.has(id);
        const isImported = !!prop._imported;
        const displayId = _displayId(prop);
        const importedClass = isImported ? ' imported-entity' : '';
        const sid = id.replace(/'/g, "\\'");
        const dragAttrs = `${isImported ? '' : `draggable="true" ondragstart="APEditor.onDragStart(event,'${sid}')" ondragend="APEditor.onDragEnd(event)"`}
                 ondragover="APEditor.onDragOver(event,'${sid}')"
                 ondragleave="APEditor.onDragLeave(event)"
                 ondrop="APEditor.onDrop(event,'${sid}')"`.trim();
        return `
        <div class="tree-root-node">
            <div class="tree-item${isSel ? ' selected' : ''}${importedClass}" style="padding-left:${depth * 16 + 6}px"
                 data-id="${id}"
                 ${dragAttrs}
                 onclick="APEditor.selectProp('${sid}', event)"
                 oncontextmenu="event.preventDefault();APEditor.showContextMenu(event,'${sid}')">
                ${hasChildren
                    ? `<span class="tree-toggle${isOpen ? ' open' : ''}"
                             onclick="event.stopPropagation();APEditor.toggleNode('${sid}')">▶</span>`
                    : `<span class="tree-leaf">◦</span>`}
                <span class="anno-prop-dot tree-ap-dot"></span>
                <span class="tree-label">${_escapeHtml(displayId)}</span>
            </div>
            <div style="display:${isOpen ? 'block' : 'none'}">
                ${children.map(cid => this._renderUserNode(cid, childrenOf, depth + 1, props)).join('')}
            </div>
        </div>`;
    },

    _renderTree(props) {
        const { roots, childrenOf, builtinChildrenOf } = this._buildUserTree(props);
        // Only show rdfs:/owl: namespace roots for OWL-based ontologies
        const showBuiltins = APP.getOntologyRootLabels().classRoot === 'owl:Thing';

        const renderNsRoot = (ns) => {
            const builtins  = showBuiltins ? AP_BUILTINS[ns] : [];
            // User props with no parent whose IRI starts with this namespace
            const userUnder = roots.filter(id => this._rootOf(id) === ns);
            const isOpen    = this._expanded.has(ns);
            const isSel     = this._selectedId === ns;
            const hasChildren = builtins.length + userUnder.length > 0;
            return `
            <div class="tree-root-node">
                <div class="tree-root-item${isSel ? ' selected' : ''}"
                     onclick="APEditor.selectProp('${ns}')"
                     ondragover="APEditor.onDragOver(event,'${ns}')"
                     ondragleave="APEditor.onDragLeave(event)"
                     ondrop="APEditor.onDrop(event,'${ns}')">
                    ${hasChildren
                        ? `<span class="tree-toggle${isOpen ? ' open' : ''}" style="cursor:pointer"
                                 onclick="event.stopPropagation();APEditor.toggleNode('${ns}')">▶</span>`
                        : `<span class="tree-toggle open" style="cursor:default">▶</span>`}
                    <svg class="ap-ns-icon" viewBox="0 0 22 14" width="22" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 2 L2 7 L7 12"/><path d="M15 2 L20 7 L15 12"/></svg>
                    <span style="font-size:12px;font-family:var(--font-mono);opacity:0.85">${ns}</span>
                </div>
                <div style="display:${isOpen ? 'block' : 'none'}">
                    ${builtins.map(p => this._renderBuiltinNode(p, childrenOf, builtinChildrenOf, props)).join('')}
                    ${userUnder.map(id => this._renderUserNode(id, childrenOf, 2, props)).join('')}
                </div>
            </div>`;
        };

        // User props with no parent and no namespace match → orphans at root level
        const orphans = roots.filter(id => !this._rootOf(id));

        return `
        ${Object.keys(AP_BUILTINS).map(ns => renderNsRoot(ns)).join('')}
        ${orphans.map(id => this._renderUserNode(id, childrenOf, 1, props)).join('')}`;
    },

    // ── Split layout ──────────────────────────────────────────

    renderSplit(props) {
        const ico = `<svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="4.5" y1=".5" x2="4.5" y2="8.5"/><line x1=".5" y1="4.5" x2="8.5" y2="4.5"/></svg>`;
        return `
        <div class="section-split">
            <div class="tree-panel" id="ap-tree-panel">
                <div class="left-col-top">
                    <div class="tree-panel-header">
                        <h3>Annotation Properties</h3>
                        <div class="tree-actions">
                            <button id="ap-btn-child" class="btn-icon" disabled
                                    onclick="APEditor.createChild()"
                                    title="Add child property (sub-property)">${this._svgChild}<span>Child</span></button>
                            <button id="ap-btn-sister" class="btn-icon" disabled
                                    onclick="APEditor.createSibling()"
                                    title="Add sibling property (same level)">${this._svgSister}<span>Sibling</span></button>
                            <button id="ap-btn-delete" class="btn-icon btn-icon-danger" disabled
                                    onclick="APEditor.deleteSelected()" title="Delete">${this._svgDelete}</button>
                        </div>
                    </div>
                    <div class="tree-scroll" id="ap-tree">
                        ${this._renderTree(props)}
                    </div>
                </div>

                <div class="h-resizer"></div>

                <!-- ── Super Properties ── -->
                <div class="left-col-bottom">
                    <div class="tree-panel-header">
                        <h3>Super Properties</h3>
                    </div>
                    <div class="left-col-bottom-body" id="ap-super-list">
                        <div class="cls-list-empty">— select a property —</div>
                    </div>
                </div>

            </div>
            <div class="split-handle" id="ap-split-handle"></div>
            <div class="detail-panel" id="ap-detail">
                <div class="detail-panel-empty">
                    <span class="anno-prop-dot" style="width:40px;height:20px"></span>
                    <span>Select an <strong>Annotation Property</strong> or create a new one</span>
                    <button class="btn-primary btn-sm" onclick="APEditor.createChild()">＋ Create Annotation Property</button>
                </div>
            </div>
        </div>`;
    },

    restoreSelection() {
        this._initSplitPane();
        this._installDeselectListener();
        if (this._selectedId) this.selectProp(this._selectedId, false);
    },

    _initSplitPane() {
        const handle = document.getElementById('ap-split-handle');
        const panel  = document.getElementById('ap-tree-panel');
        if (!handle || !panel) return;
        handle.addEventListener('mousedown', e => {
            e.preventDefault();
            const startX = e.clientX, startW = panel.offsetWidth;
            document.body.classList.add('resizing');
            const onMove = ev => { panel.style.width = Math.min(520, Math.max(160, startW + ev.clientX - startX)) + 'px'; };
            const onUp   = () => { document.body.classList.remove('resizing'); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
        _initHResizers('ap-tree-panel');
    },

    toggleNode(id) {
        if (this._expanded.has(id)) this._expanded.delete(id);
        else this._expanded.add(id);
        const tree = document.getElementById('ap-tree');
        if (tree) tree.innerHTML = this._renderTree(APP.state.annotation_properties || []);
        this._highlightSelected();
    },

    // ── Selection ────────────────────────────────────────────

    async selectProp(id, evtOrHist = true) {
        const isShift = (evtOrHist && typeof evtOrHist === 'object') ? evtOrHist.shiftKey : false;
        const _hist   = (evtOrHist && typeof evtOrHist === 'object') ? true : evtOrHist;

        const isUserProp = id && !this._isRoot(id) && !this._isBuiltin(id);

        if (!isShift && this._editingId !== null && id !== this._editingId) {
            clearTimeout(this._autoSaveTimer);
            await this._silentSave();
        }

        if (isShift && isUserProp && this._anchorId) {
            // ── Shift+Click: range selection over visible user props ──
            const items = [...document.querySelectorAll('#ap-tree .tree-item[data-id]')];
            const ids   = items.map(el => el.dataset.id);
            const from  = ids.indexOf(this._anchorId);
            const to    = ids.indexOf(id);
            if (from !== -1 && to !== -1) {
                const [lo, hi] = from < to ? [from, to] : [to, from];
                this._selectedIds = new Set(ids.slice(lo, hi + 1));
            } else {
                this._selectedIds.add(id);
            }
        } else {
            // ── Single click ──────────────────────────────────────────
            this._selectedIds = isUserProp ? new Set([id]) : new Set();
            if (isUserProp) this._anchorId = id;
            if (_hist && !isShift) APP._pushNav('annotation-properties', id);
        }

        this._selectedId = id;
        this._highlightSelected();
        this._updateTreeButtons();

        const detail = document.getElementById('ap-detail');
        if (!detail) return;

        if (this._selectedIds.size > 1) {
            const n = this._selectedIds.size;
            detail.innerHTML = `<div class="detail-panel-empty">
                <span style="font-size:28px"><span class="anno-prop-dot" style="display:inline-block;vertical-align:middle;width:20px;height:10px"></span><span class="anno-prop-dot" style="display:inline-block;vertical-align:middle;width:20px;height:10px;margin-left:4px"></span></span>
                <span><strong>${n}</strong> annotation properties selected</span>
            </div>`;
            this._updateSuperPanel(null);
        } else if (this._isRoot(id)) {
            detail.innerHTML = this._renderRootDetail(id);
            this._updateSuperPanel(null);
        } else if (this._isBuiltin(id)) {
            detail.innerHTML = this._renderBuiltinDetail(id);
            this._updateSuperPanel(id);
        } else {
            const prop = (APP.state.annotation_properties || []).find(p => p.id === id);
            const isImp = _applyImportedView(detail, prop, prop ? this._renderForm(prop) : '');
            this._updateSuperPanel(id);   // affiche aussi les super-propriétés des AP importées (lecture seule)
            _markImportedRefs(detail);
            _markImportedRefs(document.getElementById('ap-supers-list'));
        }
    },

    _installDeselectListener() { _TreeCommon.installDeselectListener(this); },

    _highlightSelected() {
        // Re-render the tree — highlighting is done via _selectedIds in _renderUserNode
        const tree = document.getElementById('ap-tree');
        if (tree) tree.innerHTML = this._renderTree(APP.state.annotation_properties || []);
    },

    _updateTreeButtons() {
        const id        = this._selectedId;
        const btnChild  = document.getElementById('ap-btn-child');
        const btnSister = document.getElementById('ap-btn-sister');
        const btnDelete = document.getElementById('ap-btn-delete');
        if (!btnChild) return;

        const isRoot     = this._isRoot(id);
        const isBuiltin  = id && this._isBuiltin(id);
        const isImported = id && _isImportedId('annotation_properties', id);
        const isUser     = id && !isRoot && !isBuiltin && !isImported;
        const isMulti    = this._selectedIds.size > 1;

        if (isMulti) {
            // Multi-selection: only Delete active (only if no imported in selection)
            const hasImported = [...this._selectedIds].some(sid => _isImportedId('annotation_properties', sid));
            btnChild.style.display  = '';
            btnSister.style.display = '';
            btnDelete.style.display = '';
            btnChild.disabled  = true;
            btnSister.disabled = true;
            btnDelete.disabled = hasImported;
        } else {
            btnChild.style.display  = isRoot ? 'none' : '';
            btnSister.style.display = (isRoot || isBuiltin || isImported) ? 'none' : '';
            btnDelete.style.display = (isRoot || isBuiltin || isImported) ? 'none' : '';
            btnChild.disabled  = !id;
            btnSister.disabled = !isUser;
            btnDelete.disabled = !isUser;
        }
    },

    // ── Detail panels (read-only) ─────────────────────────────

    _renderRootDetail(ns) {
        const builtins = AP_BUILTINS[ns];
        return `
        <div class="cls-editor">
            <div class="cls-editor-hdr">
                <div class="cls-editor-title" style="font-family:var(--font-mono)">${ns}</div>
                <div class="cls-editor-meta" style="font-size:11px;color:var(--text-dim)">Namespace root — not an AnnotationProperty</div>
            </div>
            <div class="cls-frame">
                <div class="cls-frame-bar"><span class="cls-frame-tag">Built-in properties</span></div>
                <div class="cls-frame-body">
                    ${builtins.map(p => `
                    <div class="cls-list-item" style="padding:4px 6px;align-items:flex-start">
                        <span class="anno-prop-dot" style="margin-top:3px;flex-shrink:0"></span>
                        <div style="display:flex;flex-direction:column;gap:1px">
                            <span style="font-size:12px;font-family:var(--font-mono);color:var(--text2)">${p.id}</span>
                            <span style="font-size:11px;color:var(--text-dim)">${p.comment}</span>
                        </div>
                    </div>`).join('')}
                </div>
            </div>
        </div>`;
    },

    _renderBuiltinDetail(id) {
        const p = Object.values(AP_BUILTINS).flat().find(x => x.id === id);
        if (!p) return '';
        return `
        <div class="cls-editor">
            <div class="cls-editor-hdr">
                <div class="cls-editor-title" style="font-family:var(--font-mono)">${p.id}</div>
                <div style="margin-top:4px;font-size:11px;color:var(--text-dim)">${p.comment}</div>
                <div style="margin-top:6px;font-size:11px;color:var(--text-faint);font-style:italic">Built-in OWL 2 annotation property — read-only.</div>
            </div>
        </div>`;
    },

    // ── Form (user-defined props) ────────────────────────────

    _renderForm(prop) {
        APEditor._editingId = prop?.id || null;
        const p          = prop || { id: '', comment: '', subPropertyOf: [], annotations: { labels: [], comments: [], other: [] } };
        const ac         = `onchange="APEditor.autoSave()"`;
        const baseIri    = (APP.state.ontology?.id || '').replace(/[#/]+$/, '');
        const propIri    = (p.id && baseIri) ? `${baseIri}#${p.id}` : '';
        const allBuiltins = Object.values(AP_BUILTINS).flat();
        const userProps   = (APP.state.annotation_properties || []).filter(q => q.id !== p.id);
        const currentParents = p.subPropertyOf || [];
        const ico = `<svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><line x1="4.5" y1=".5" x2="4.5" y2="8.5"/><line x1=".5" y1="4.5" x2="8.5" y2="4.5"/></svg>`;

        const annoRows = [
            ...(p.annotations?.labels   || []).map(l  => _annoRow('label',   l.value, l.lang || Settings.defaultLang, 'APEditor', ac)),
            ...(p.annotations?.comments || []).map(cm => _annoRow('comment', cm.value, cm.lang || Settings.defaultLang, 'APEditor', ac)),
            ...(p.annotations?.other    || []).map(a  => _annoRow('other',   a.value, '', 'APEditor', ac, a.property)),
        ].join('');

        return `
        <div class="cls-editor">
            <div class="cls-editor-hdr">
                <div class="cls-editor-title">ID&nbsp;</div>
                    <input type="text" id="ap-id" class="cls-id-inp" value="${p.id}"
                           placeholder="newAnnotationProperty"
                           oninput="_sanitizeId(this)"
                           onchange="APEditor.autoSave()"
                           title="Local IRI identifier">
                    <span class="cls-editor-meta">(instance of owl:AnnotationProperty)</span>
                </div>
                ${propIri ? `<div class="cls-editor-iri">For Property:&nbsp;<code>${propIri}</code></div>` : ''}
            </div>
        </div>`;
    },

    addAnnotRow(type) {
        const ac   = `onchange="APEditor.autoSave()"`;
        const tbody = document.getElementById('ap-annotations-body');
        if (tbody) tbody.appendChild(_makeAnnotRow(type, 'APEditor', ac));
    },

    // ── Create ────────────────────────────────────────────────

    _generatePropName() {
        const existing = new Set((APP.state.annotation_properties || []).map(p => p.id));
        let name = 'newAnnotationProperty';
        let i = 1;
        while (existing.has(name)) { name = `newAnnotationProperty${i++}`; }
        return name;
    },

    async _createAndSelect(subPropertyOf) {
        const id = this._generatePropName();
        const prop = { id, comment: '', subPropertyOf, annotations: { labels: [], comments: [], other: [] } };
        try {
            await API.createAP(prop);
            this._selectedId = id;
            this._editingId  = id;
            // Expand parents so the new node is visible
            subPropertyOf.forEach(par => this._expanded.add(par));
            await APP.refresh();
            APP.renderSection('annotation-properties');
        } catch (e) { UI.error(e.message); }
    },

    async createChild() {
        const parent = this._selectedId;
        const subPropertyOf = (parent && !this._isRoot(parent)) ? [parent] : [];
        if (parent) this._expanded.add(parent);
        await this._createAndSelect(subPropertyOf);
    },

    async createSibling() {
        const sel = this._selectedId;
        if (!sel || this._isRoot(sel)) return;
        const prop = (APP.state.annotation_properties || []).find(p => p.id === sel);
        const parentIds = prop ? (prop.subPropertyOf || []) : [];
        parentIds.forEach(p => this._expanded.add(p));
        await this._createAndSelect([...parentIds]);
    },

    // ── Save ─────────────────────────────────────────────────

    _collectForm() {
        const id  = document.getElementById('ap-id')?.value.trim().replace(/\s+/g, '_') || '';
        // Preserve existing subPropertyOf from state — the form has no checkbox for it
        const existing = (APP.state.annotation_properties || []).find(p => p.id === (this._editingId || id));
        const subPropertyOf = existing?.subPropertyOf || [];
        const { labels, comments, other } = _collectAnnotations('ap-annotations-body');
        return { id, comment: '', subPropertyOf, annotations: { labels, comments, other } };
    },

    autoSave() {
        clearTimeout(this._autoSaveTimer);
        this._autoSaveTimer = setTimeout(() => this._doAutoSave(), 500);
    },

    async _doAutoSave() {
        const id = this._selectedId;
        if (!id || this._isRoot(id) || this._isBuiltin(id)) return;
        const data = this._collectForm();
        if (!data.id) return;
        try {
            await API.updateAP(id, data);
            if (data.id !== id) {
                this._selectedId = data.id;
                UI.success(`Renamed → '${data.id}'`);
            }
            await APP.refresh();
            APEditor.restoreSelection();
        } catch (e) { UI.error(e.message); }
    },

    /** Silent save: persists the current DOM state without re-rendering or global refresh */
    async _silentSave() {
        const originalId = this._editingId;
        if (originalId === null || this._isRoot(originalId) || this._isBuiltin(originalId)) return;
        if ((APP.state.annotation_properties || []).find(p => p.id === originalId)?._imported) return;
        const data = this._collectForm();
        if (!data.id) return;
        try {
            await API.updateAP(originalId, data);
            const idx = (APP.state.annotation_properties || []).findIndex(p => p.id === originalId);
            if (idx >= 0) APP.state.annotation_properties[idx] = data;
            this._treeCache = null;
        } catch (e) { console.warn('[SWOWL] silent save failed (AP):', e.message); }
    },

    async save() {
        const data = this._collectForm();
        const _apErr = _validateId(data.id, 'ID'); if (_apErr) { UI.warn(_apErr); return; }
        try {
            await API.updateAP(this._editingId || data.id, data);
            this._editingId  = data.id;
            this._selectedId = data.id;
            this._expanded.add(data.id);
            await APP.refresh();
            APEditor.restoreSelection();
        } catch (e) { UI.error(e.message); }
    },

    // ── Super Properties panel ────────────────────────────────

    _updateSuperPanel(selectedId) {
        const panel = document.getElementById('ap-super-list');
        if (!panel) return;
        if (!selectedId) {
            panel.innerHTML = '<div class="cls-list-empty">— select a property —</div>';
            return;
        }

        const allBuiltins = Object.values(AP_BUILTINS).flat();
        const userProps   = APP.state.annotation_properties || [];
        const allPropsMap = {};
        allBuiltins.forEach(p => { allPropsMap[p.id] = { id: p.id, subPropertyOf: [] }; });
        userProps.forEach(p => { allPropsMap[p.id] = p; });

        const prop    = allPropsMap[selectedId];
        const parents = prop ? (prop.subPropertyOf || []).filter(s => typeof s === 'string') : [];

        if (!parents.length) {
            panel.innerHTML = '<div class="cls-list-empty" style="font-style:italic;opacity:0.6">— no super-property —</div>';
            return;
        }

        const buildChain = (startId) => {
            const chain = [];
            const visited = new Set();
            let current = startId;
            while (current && !visited.has(current)) {
                visited.add(current);
                chain.push(current);
                const p = allPropsMap[current];
                const nextParents = p ? (p.subPropertyOf || []).filter(s => typeof s === 'string') : [];
                current = nextParents.length > 0 ? nextParents[0] : null;
            }
            // Append namespace root at the top of the chain
            const last = chain[chain.length - 1] || '';
            const nsRoot = last.startsWith('rdfs:') ? 'rdfs:' : last.startsWith('owl:') ? 'owl:' : null;
            if (nsRoot) chain.push(nsRoot);
            return chain;
        };

        const nsRootItem = (ns) => `
            <div class="cls-list-item cls-ancestor" style="padding-left:${6 + buildChain(parents[0]).length * 14 - 14}px;opacity:0.55;font-style:italic;cursor:pointer"
                 onclick="APEditor.selectProp('${ns}')">
                <svg class="ap-ns-icon" viewBox="0 0 22 14" width="16" height="10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;flex-shrink:0"><path d="M7 2 L2 7 L7 12"/><path d="M15 2 L20 7 L15 12"/></svg>
                <span class="cls-list-lbl">${ns}</span>
            </div>`;

        const html = parents.map(parentId => {
            const chain = buildChain(parentId);
            return chain.map((id, i) => {
                const indent    = 6 + i * 14;
                const isDirect  = i === 0;
                const isNsRoot  = id === 'rdfs:' || id === 'owl:';
                const isBuiltin = allBuiltins.some(b => b.id === id);
                if (isNsRoot) {
                    return `<div class="cls-list-item cls-ancestor" style="padding-left:${indent}px;opacity:0.55;font-style:italic;cursor:pointer"
                                 onclick="APEditor.selectProp('${id}')">
                        <svg class="ap-ns-icon" viewBox="0 0 22 14" width="16" height="10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;flex-shrink:0"><path d="M7 2 L2 7 L7 12"/><path d="M15 2 L20 7 L15 12"/></svg>
                        <span class="cls-list-lbl">${id}</span>
                    </div>`;
                }
                const idP    = allPropsMap[id];
                const dispId = (idP && !isBuiltin) ? _displayId(idP) : id;
                const impP   = idP?._imported ? ' imported-entity' : '';
                const anc    = (!isDirect && !impP) ? ';opacity:0.75' : '';
                return `<div class="cls-list-item${isDirect ? '' : ' cls-ancestor'}${impP}"
                             style="padding-left:${indent}px${anc}">
                    <span class="anno-prop-dot" style="flex-shrink:0;margin-right:4px"></span>
                    <span class="cls-list-lbl nav-link"
                          onclick="APP.navigateTo('annotation-properties','${id}')">${_escapeHtml(dispId)}</span>
                    ${isBuiltin ? '<span style="font-size:10px;color:var(--text-faint);font-style:italic;margin-left:4px">built-in</span>' : ''}
                </div>`;
            }).join('');
        }).join('');

        panel.innerHTML = html || '<div class="cls-list-empty" style="font-style:italic;opacity:0.6">— no super-property —</div>';
    },

    // ── Drag & Drop ───────────────────────────────────────────

    _dragId: null,

    onDragStart(event, id)  { _TreeCommon.onDragStart(this, event, id); },
    onDragLeave(event)      { event.currentTarget.classList.remove('drag-over'); },
    onDragEnd()             { _TreeCommon.onDragEnd(this); },

    /** AP-specific dragover: namespace roots and built-ins are valid drop
     *  targets, so the descendant check only applies to user properties. */
    onDragOver(event, targetId) {
        if (!this._dragId) return;
        if (this._selectedIds.has(targetId)) return;
        if (!this._isRoot(targetId) && !this._isBuiltin(targetId) &&
            [...this._selectedIds].some(sid => this._isDescendant(targetId, sid))) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        event.currentTarget.classList.add('drag-over');
    },

    async onDrop(event, targetId) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');
        const dragIds = this._selectedIds.size > 0 ? [...this._selectedIds] : [this._dragId];
        this._dragId = null;
        if (!dragIds.length || dragIds.includes(targetId)) return;
        const newParents = (!targetId || this._isRoot(targetId)) ? [] : [targetId];
        if (targetId && !this._isRoot(targetId)) this._expanded.add(targetId);
        try {
            await Promise.all(dragIds.map(draggedId => {
                const prop = (APP.state.annotation_properties || []).find(p => p.id === draggedId);
                if (!prop) return null;
                return API.updateAP(draggedId, { ...prop, subPropertyOf: newParents });
            }));
            UI.success(dragIds.length > 1 ? `${dragIds.length} properties moved` : `'${dragIds[0]}' moved`);
            this._selectedId = dragIds[0];
            await APP.refresh();
            APP.renderSection('annotation-properties');
        } catch (e) { UI.error(e.message); }
    },

    /** buildTree alias so _TreeCommon can cache the AP user-prop tree. */
    buildTree(props) { return this._buildUserTree(props); },

    _isDescendant(potentialDesc, ancestorId) { return _TreeCommon.isDescendant(this, potentialDesc, ancestorId); },

    // ── Delete ────────────────────────────────────────────────

    async deleteSelected() {
        const ids = this._selectedIds.size > 0
            ? [...this._selectedIds]
            : (this._selectedId && !this._isRoot(this._selectedId) && !this._isBuiltin(this._selectedId) ? [this._selectedId] : []);
        if (!ids.length) return;

        if (ids.length === 1) {
            const id = ids[0];
            // Collect descendants for display in confirm dialog
            const props = APP.state.annotation_properties || [];
            const childrenOf = {};
            props.forEach(p => { childrenOf[p.id] = []; });
            props.forEach(p => { (p.subPropertyOf || []).forEach(par => { if (childrenOf[par]) childrenOf[par].push(p.id); }); });
            const descendants = [];
            const collect = (cid) => (childrenOf[cid] || []).forEach(c => { descendants.push(c); collect(c); });
            collect(id);

            const confirmed = await UI.confirm(
                descendants.length > 0
                    ? `Delete <strong>${id}</strong> and its ${descendants.length} sub-propert${descendants.length > 1 ? 'ies' : 'y'}?<br>
                       <small style="color:var(--text-dim)">${descendants.join(', ')}</small>`
                    : `Delete annotation property <strong>${id}</strong>?`
            );
            if (!confirmed) return;
            try {
                const result = await API.deleteAP(id);
                const n = (result?.deleted || [id]).length;
                UI.success(`${n} annotation propert${n > 1 ? 'ies' : 'y'} deleted`);
                this._selectedId  = null;
                this._selectedIds.clear();
                this._anchorId    = null;
                await APP.refresh();
                const detail = document.getElementById('ap-detail');
                if (detail) detail.innerHTML = `
                    <div class="detail-panel-empty">
                        <span class="anno-prop-dot" style="width:40px;height:20px"></span>
                        <span>Select an <strong>Annotation Property</strong> or create a new one</span>
                        <button class="btn-primary btn-sm" onclick="APEditor.createChild()">＋ Create Annotation Property</button>
                    </div>`;
                const tree = document.getElementById('ap-tree');
                if (tree) tree.innerHTML = this._renderTree(APP.state.annotation_properties || []);
                this._updateTreeButtons();
            } catch (e) { UI.error(e.message); }
            return;
        }

        const confirmed = await UI.confirm(
            `Delete <strong>${ids.length}</strong> annotation properties?<br>
             <small style="color:var(--text-dim)">${ids.join(', ')}</small>`
        );
        if (!confirmed) return;
        try {
            for (const id of ids) { await API.deleteAP(id); }
            UI.success(`${ids.length} annotation properties deleted`);
            this._selectedId  = null;
            this._selectedIds.clear();
            this._anchorId    = null;
            this._editingId   = null;
            await APP.refresh();
            APP.renderSection('annotation-properties');
        } catch (e) { UI.error(e.message); }
    },

    showContextMenu(event, id) {
        event.stopPropagation();
        if (!this._selectedIds.has(id)) {
            this._selectedIds = new Set([id]);
            this._anchorId    = id;
            this._selectedId  = id;
            this._highlightSelected();
            this._updateTreeButtons();
        }
        this._closeContextMenu();

        const isImported = _isImportedId('annotation_properties', id);
        const n = this._selectedIds.size;
        const deleteLabel = n > 1 ? `Delete Properties <strong>(${n})</strong>` : `Delete Property`;
        const menu = document.createElement('div');
        menu.id = 'ap-ctx-menu';
        menu.className = 'ctx-menu';
        menu.innerHTML = `
            ${n === 1 ? `<div class="ctx-item" onclick="APEditor._closeContextMenu();APEditor.createChild()">
                ${this._svgChild} Add Child Property</div>
            <div class="ctx-item" onclick="APEditor._closeContextMenu();APEditor.createSibling()">
                ${this._svgSister} Add Sibling Property</div>` : ''}
            ${!isImported ? `${n === 1 ? '<div class="ctx-sep"></div>' : ''}
            <div class="ctx-item ctx-danger" onclick="APEditor._closeContextMenu();APEditor.deleteSelected()">
                ${this._svgDelete} ${deleteLabel}</div>` : ''}`;
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
        document.getElementById('ap-ctx-menu')?.remove();
    },
};
