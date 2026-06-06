/**
 * swrl_editor.js — SWRL rule editor
 * SWRL = SWRL extended with NAF (Negation As Failure) and conditional consequents
 *
 * Atom types:
 *   body: type_atom | property_atom | equality_atom | naf_block
 *   head: type_atom | property_atom | equality_atom | conditional
 */

const SWRLEditor = {

    _selectedId:   null,
    _editingId:             null,   // original ID of the rule being edited
    _editingRule:           null,
    _isNew:                 false,
    _currentPickerPath:     null,   // path + field pour le picker classe
    _currentPropPickerPath: null,   // path + field for the property picker
    _drag:                  { section: null, fromIdx: null }, // drag-and-drop state

    // ── SVG icons ──────────────────────────────────────────────
    _ico: `<svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor"
              stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
           <line x1="4.5" y1=".5" x2="4.5" y2="8.5"/>
           <line x1=".5"  y1="4.5" x2="8.5"  y2="4.5"/>
           </svg>`,

    // ── Layout split ────────────────────────────────────────────
    _searchQuery: '',

    _filterRules(rules) {
        const q = (this._searchQuery || '').trim().toLowerCase();
        if (!q) return rules;
        return (rules || []).filter(r =>
            (r.id     || '').toLowerCase().includes(q) ||
            (r.label  || '').toLowerCase().includes(q) ||
            (r.comment|| '').toLowerCase().includes(q) ||
            [...(r.body||[]), ...(r.head||[])].some(a =>
                (a.class_id    || '').toLowerCase().includes(q) ||
                (a.property_id || '').toLowerCase().includes(q) ||
                (a.var         || '').toLowerCase().includes(q) ||
                (a.subject     || '').toLowerCase().includes(q) ||
                (a.object      || '').toLowerCase().includes(q) ||
                (a.value       || '').toLowerCase().includes(q)
            )
        );
    },

    renderSplit(rules) {
        return `
        <div class="section-split">
            <div class="tree-panel" id="swrl-list-panel" style="display:flex;flex-direction:column">
                <div class="tree-panel-header">
                    <h3>SWRL Rules</h3>
                    <button class="btn-sm" onclick="SWRLEditor.newRule()" title="New SWRL rule">➕</button>
                </div>
                <div class="tree-scroll" id="swrl-list" style="flex:1">${this.renderList(rules)}</div>
                <div style="padding:6px 8px;border-top:1px solid var(--border);flex-shrink:0">
                    <div style="display:flex;align-items:center;gap:4px;background:var(--bg3);border:1px solid var(--border2);border-radius:4px;padding:3px 8px">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--text-dim)" stroke-width="1.5" style="flex-shrink:0">
                            <circle cx="5" cy="5" r="4"/><line x1="8.5" y1="8.5" x2="11" y2="11"/>
                        </svg>
                        <input id="swrl-search" type="text" placeholder="Search rules…"
                               value="${this._searchQuery || ''}"
                               style="flex:1;background:transparent;border:none;outline:none;font-size:11px;color:var(--text1);font-family:inherit"
                               oninput="SWRLEditor._searchQuery=this.value;SWRLEditor._applySearch()">
                        ${this._searchQuery ? `<span style="cursor:pointer;color:var(--text-dim);font-size:13px;line-height:1" title="Clear"
                               onclick="SWRLEditor._searchQuery='';document.getElementById('swrl-search').value='';SWRLEditor._applySearch()">✕</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="split-handle" id="swrl-split-h"></div>
            <div class="detail-panel" id="swrl-detail">
                <div class="detail-panel-empty">
                    <span style="font-size:36px">⚙️</span>
                    <span>Select an existing SWRL Rule or create a new one</span>
                </div>
            </div>
        </div>`;
    },

    /** Retourne true si la règle référence une entité (classe/propriété/individu) qui n'existe plus */
    _ruleHasBrokenRefs(rule) {
        const classes = new Set((APP.state.classes              || []).map(c => c.id));
        const ops     = new Set((APP.state.object_properties    || []).map(p => p.id));
        const dps     = new Set((APP.state.datatype_properties  || []).map(p => p.id));
        const inds    = new Set((APP.state.individuals          || []).map(i => i.id));
        const checkAtom = (atom) => {
            if (!atom) return false;
            if (atom.type === 'type_atom'     && atom.class_id    && !classes.has(atom.class_id))    return true;
            if (atom.type === 'property_atom' && atom.property_id && !ops.has(atom.property_id) && !dps.has(atom.property_id)) return true;
            if (atom.type === 'equality_atom' && atom.value       && inds.has(atom.value) === false
                && (APP.state.individuals||[]).length > 0 && atom.value && !atom.value.startsWith('?')
                && !/^["'\d]/.test(atom.value)
                && (APP.state.individuals||[]).some(i => i.id) /* only flag if at least one ind exists */
                && !(APP.state.individuals||[]).some(i => i.id === atom.value)) {
                // only flag equality atoms that look like individual references (not literals/vars)
            }
            if (atom.type === 'naf_block')    return (atom.atoms      || []).some(checkAtom);
            if (atom.type === 'conditional')  return [...(atom.condition||[]), ...(atom.consequent||[])].some(checkAtom);
            return false;
        };
        return [...(rule.body||[]), ...(rule.head||[])].some(checkAtom);
    },

    _applySearch() {
        const list = document.getElementById('swrl-list');
        if (list) list.innerHTML = this.renderList(APP.state.swrl_rules || []);
        // Mettre à jour / supprimer le bouton ✕
        const search = document.getElementById('swrl-search');
        if (search) {
            let btn = search.parentElement.querySelector('.swrl-clear-btn');
            if (this._searchQuery) {
                if (!btn) {
                    btn = document.createElement('span');
                    btn.className = 'swrl-clear-btn';
                    btn.style.cssText = 'cursor:pointer;color:var(--text-dim);font-size:13px;line-height:1';
                    btn.title = 'Clear';
                    btn.textContent = '✕';
                    btn.onclick = () => { SWRLEditor._searchQuery = ''; search.value = ''; SWRLEditor._applySearch(); };
                    search.parentElement.appendChild(btn);
                }
            } else if (btn) {
                btn.remove();
            }
        }
    },

    renderList(rules) {
        const filtered = this._filterRules(rules);
        if (!filtered || !filtered.length)
            return `<div class="cls-list-empty" style="padding:12px">${this._searchQuery ? 'No matching rule' : 'No SWRL rule'}</div>`;
        const sel = this._selectedId;
        return filtered.map(r => {
            const broken   = this._ruleHasBrokenRefs(r);
            const mainText = r.label || r.id;
            const subText  = r.label ? r.id : '';
            return `
            <div class="tree-item${r.id === sel ? ' selected' : ''}" data-id="${r.id}"
                 style="align-items:center${broken ? ';color:var(--red,#ef4444)' : ''}"
                 onclick="SWRLEditor.selectRule('${r.id}')">
                <span style="font-size:13px;flex-shrink:0;line-height:1;${broken ? 'color:var(--red,#ef4444)' : 'color:var(--text-dim)'}">⚙️</span>
                <span style="flex:1;overflow:hidden;min-width:0">
                    <span class="tree-label" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block${broken ? ';color:var(--red,#ef4444)' : ''}">${mainText}</span>
                    ${subText ? `<span style="font-size:10px;color:${broken ? 'var(--red,#ef4444)' : 'var(--text-faint)'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block">${subText}</span>` : ''}
                </span>
                <button class="btn-icon btn-icon-danger" style="flex-shrink:0;padding:2px 4px"
                        onclick="event.stopPropagation();SWRLEditor.delete('${r.id}')"
                        title="Delete rule">${ClassEditor._svgDelete}</button>
            </div>`;
        }).join('');
    },

    restoreSelection() {
        this._initSplitHandle();
        if (this._selectedId) {
            this.selectRule(this._selectedId);
        }
    },

    // ── Selection / creation ─────────────────────────────────────
    selectRule(id) {
        const rule = (APP.state.swrl_rules || []).find(r => r.id === id);
        if (!rule) return;
        this._selectedId  = id;
        this._editingId   = id;
        this._isNew       = false;
        this._editingRule = JSON.parse(JSON.stringify(rule));
        this._renderDetail();
        document.querySelectorAll('#swrl-list .tree-item').forEach(el =>
            el.classList.toggle('selected', el.dataset.id === id));
    },

    _generateRuleName() {
        const existing = new Set((APP.state.swrl_rules || []).map(r => r.id));
        let name = 'NewRule';
        let i = 1;
        while (existing.has(name)) { name = `NewRule${i++}`; }
        return name;
    },

    async newRule() {
        const id   = this._generateRuleName();
        const rule = { id, label: '', comment: '', body: [], head: [], enabled: true };
        try {
            await API.createSWRLRule(rule);
            this._selectedId  = id;
            this._editingId   = id;
            this._isNew       = false;
            this._editingRule = rule;
            await APP.refresh();
            const listEl = document.getElementById('swrl-list');
            if (listEl) listEl.innerHTML = this.renderList(APP.state.swrl_rules || []);
            this._renderDetail();
            document.querySelectorAll('#swrl-list .tree-item').forEach(el =>
                el.classList.toggle('selected', el.dataset.id === id));
        } catch (e) { UI.error(e.message); }
    },

    _renderDetail() {
        const detail = document.getElementById('swrl-detail');
        if (!detail) return;
        detail.innerHTML = this._renderForm(this._editingRule, this._isNew);
        _initHResizers('swrl-detail');
        if (!this._isNew) {
            // Focus on the ID field so the user can rename it directly
            const idInp = document.getElementById('swrl-id');
            if (idInp) idInp.focus();
        }
        detail.querySelectorAll('input.swrl-var').forEach(inp => {
            inp.addEventListener('focus', function handler() {
                inp.removeEventListener('focus', handler);
                requestAnimationFrame(() => inp.setSelectionRange(inp.value.length, inp.value.length));
            });
        });
    },

    // ── Formulaire principal ─────────────────────────────────────
    _renderForm(rule, isNew) {
        const ico  = this._ico;
        const body = this._renderAtomList(rule.body || [], 'body');
        const head = this._renderAtomList(rule.head || [], 'head');

        return `
        <div class="cls-editor">
            <div class="cls-editor-hdr">
                <div class="cls-editor-title" style="gap:6px;flex-wrap:wrap">
                    ID <span class="form-req">*</span>&nbsp;
                    <input type="text" class="cls-id-inp" id="swrl-id"
                           value="${rule.id}" placeholder="RuleID"
                           oninput="this.value=this.value.replace(/\\s+/g,'_')"
                           ${isNew ? '' : 'onchange="SWRLEditor._syncAndSave()"'}
                           title="Rule identifier">
                    <span class="cls-editor-meta">LABEL</span>
                </div>
                <div style="margin-top:4px">
                    <input type="text" id="swrl-label" value="${rule.label||''}" placeholder="Label"
                           class="cls-id-inp" style="width:100%;font-size:11px"
                           onchange="SWRLEditor._syncAndSave()">
                </div>
                <div style="margin-top:6px">
                    <span class="cls-editor-meta">COMMENT</span>
                    <textarea id="swrl-comment" placeholder="Comment"
                              class="cls-id-inp" rows="3"
                              style="width:100%;margin-top:4px;resize:vertical;white-space:pre-wrap;word-break:break-word;border:1px solid var(--border2);border-radius:3px;padding:4px 6px;box-sizing:border-box;background:var(--bg3)"
                              onchange="SWRLEditor._syncAndSave()">${(rule.comment||'').replace(/</g,'&lt;')}</textarea>
                </div>
            </div>

            <!-- BODY (if) -->
            <div class="cls-frame" style="margin-top:6px">
                <div class="cls-frame-bar">
                    <span style="font-size:13px;font-weight:700;color:#f59e0b;font-family:var(--font-mono)">if</span>
                    <div style="display:flex;gap:3px;margin-left:auto;flex-wrap:wrap">
                        <button class="btn-ftool" onclick="SWRLEditor.addAtom('body','type_atom')"     title="Add type atom">${ico}&thinsp;Class</button>
                        <button class="btn-ftool" onclick="SWRLEditor.addAtom('body','property_atom')" title="Add property atom">${ico}&thinsp;Property</button>
                        <button class="btn-ftool" onclick="SWRLEditor.addAtom('body','equality_atom')" title="Add comparison">${ico}&thinsp;≟</button>
                        <button class="btn-ftool" onclick="SWRLEditor.addAtom('body','naf_block')"     title="Add NAF block">${ico}&thinsp;NAF</button>
                    </div>
                </div>
                <div class="cls-frame-body" id="swrl-body">
                    ${body || '<div class="cls-list-empty" style="font-style:italic">— add antecedents —</div>'}
                </div>
            </div>

            <div class="h-resizer"></div>

            <!-- HEAD (then) -->
            <div class="cls-frame">
                <div class="cls-frame-bar">
                    <span style="font-size:13px;font-weight:700;color:#10b981;font-family:var(--font-mono)">then</span>
                    <div style="display:flex;gap:3px;margin-left:auto;flex-wrap:wrap">
                        <button class="btn-ftool" onclick="SWRLEditor.addAtom('head','type_atom')"     title="Add type atom">${ico}&thinsp;Class</button>
                        <button class="btn-ftool" onclick="SWRLEditor.addAtom('head','property_atom')" title="Add property atom">${ico}&thinsp;Property</button>
                        <button class="btn-ftool" onclick="SWRLEditor.addAtom('head','equality_atom')" title="Add comparison">${ico}&thinsp;≟</button>
                        <button class="btn-ftool" onclick="SWRLEditor.addAtom('head','conditional')"   title="Add conditional consequent">${ico}&thinsp;If … Then</button>
                    </div>
                </div>
                <div class="cls-frame-body" id="swrl-head">
                    ${head || '<div class="cls-list-empty" style="font-style:italic">— add consequents —</div>'}
                </div>
            </div>
        </div>`;
    },

    // ── Rendu des listes d'atomes ────────────────────────────────
    _renderAtomList(atoms, section) {
        return (atoms || []).map((atom, i) => this._renderAtom(atom, `${section},${i}`)).join('');
    },

    _renderAtom(atom, path) {
        const parts = path.split(',');
        // Draggable if the atom is an element of a named list (body, head, atoms, condition, consequent)
        const _listParents = new Set(['body', 'head', 'atoms', 'condition', 'consequent']);
        const isDraggable = parts.length >= 2 && _listParents.has(parts[parts.length - 2]);

        // Pour le dragstart/drop on a besoin du chemin de la LISTE parente + l'index
        const listPath = parts.slice(0, -1).join(',');   // ex: 'body' ou 'body,2,atoms'
        const idx      = parts[parts.length - 1];

        // The container receives only DROP events (not draggable itself)
        // onDragOver only calls event.preventDefault() if listPath matches → prevents drop on wrong parent
        const dragAttrs = isDraggable ? `
            ondragover="SWRLEditor.onDragOver(event,this,'${listPath}')"
            ondragleave="SWRLEditor.onDragLeave(this)"
            ondrop="event.preventDefault();event.stopPropagation();SWRLEditor.onDrop(event,'${listPath}',${idx})"` : '';

        // The handle has draggable="true" — it alone initiates the drag, without level conflicts
        const handle = isDraggable ? `
            <span class="swrl-drag-handle" title="Drag to reorder"
                  draggable="true"
                  ondragstart="event.stopPropagation();SWRLEditor.onDragStart(event,'${listPath}',${idx})"
                  ondragend="SWRLEditor.onDragEnd()">⠿</span>` : '';

        const del = `<button class="btn-frame-del" style="flex-shrink:0;margin-left:auto"
                             onclick="SWRLEditor.removeAtom('${path}')">✕</button>`;
        const chg = `onchange="SWRLEditor.updateField('${path}',this.dataset.field,this.value)"`;

        switch (atom.type) {
            case 'type_atom': {
                const clsId    = atom.class_id || '';
                const safePath = path.replace(/,/g, '__');
                const pickerId = `swrl-cls-picker-${safePath}`;
                const tree     = _classTreePickerItems('SWRLEditor.onClassPickerSelect');
                const clsExists = !clsId || (APP.state.classes||[]).some(c => c.id === clsId);
                return `<div class="swrl-atom" data-path="${path}" ${dragAttrs}>
                    ${handle}
                    <input class="swrl-var" value="${atom.var||''}" placeholder="?var"
                           data-field="var" ${chg}>
                    <span class="swrl-kw">is a</span>
                    <div style="position:relative;flex:1;min-width:0">
                        <div class="tree-item restr-filler-btn" style="margin:0;padding:2px 6px;cursor:pointer"
                             title="${clsId ? 'Left-click: navigate · Right-click: change class' : 'Click to select a class'}"
                             onclick="${clsId && clsExists ? '' : `SWRLEditor.toggleClassPicker('${pickerId}','${path}',this)`}"
                             oncontextmenu="event.preventDefault();SWRLEditor.toggleClassPicker('${pickerId}','${path}',this)">
                            ${clsId
                                ? (clsExists
                                    ? `<span class="cls-dot tree-cls-dot" style="flex-shrink:0;margin-right:4px"></span>
                                       <span class="restr-filler-lbl" style="cursor:pointer"
                                             onclick="event.stopPropagation();APP.navigateTo('classes','${clsId}')"
                                             onmouseover="this.style.textDecoration='underline';this.style.color='var(--accent,#5f8dd3)'"
                                             onmouseout="this.style.textDecoration='';this.style.color=''">${clsId}</span>`
                                    : `<span style="color:var(--red,#ef4444);font-weight:600;font-size:11px" title="${clsId} — deleted">⚠ deleted</span>`)
                                : `<span class="restr-filler-ph"></span>
                                   <span class="restr-filler-lbl" style="color:var(--text-faint)">— class —</span>`
                            }
                        </div>
                        <div id="${pickerId}" class="cls-tree-picker" style="display:none">
                            ${tree}
                        </div>
                    </div>
                    ${del}
                </div>`;
            }

            case 'property_atom': {
                const propId    = atom.property_id || '';
                const isOP      = (APP.state.object_properties  || []).some(p => p.id === propId);
                const isDP      = (APP.state.datatype_properties || []).some(p => p.id === propId);
                const propExists = !propId || isOP || isDP;
                const propDot   = isOP ? 'op-prop-dot' : isDP ? 'dp-prop-dot' : null;
                const propPickId = `swrl-prop-picker-${path.replace(/,/g,'__')}`;
                return `<div class="swrl-atom" data-path="${path}" ${dragAttrs}>
                    ${handle}
                    <input class="swrl-var" value="${atom.subject||''}" placeholder="?subj"
                           data-field="subject" ${chg}>
                    <div style="position:relative;flex:0 1 auto;min-width:80px">
                        <div class="tree-item restr-filler-btn" style="margin:0;padding:2px 6px;cursor:pointer;width:max-content;max-width:200px"
                             title="${propId ? 'Left-click: navigate · Right-click: change property' : 'Click to select a property'}"
                             onclick="${propId && propExists ? '' : `SWRLEditor.togglePropPicker('${propPickId}','${path}',this)`}"
                             oncontextmenu="event.preventDefault();SWRLEditor.togglePropPicker('${propPickId}','${path}',this)">
                            ${propId
                                ? (propExists
                                    ? `<span class="${propDot||'op-prop-dot'}" style="flex-shrink:0;margin-right:4px"></span>
                                       <span style="white-space:nowrap;cursor:pointer"
                                             onclick="event.stopPropagation();APP.navigateTo('${isOP ? 'object-properties' : 'datatype-properties'}','${propId}')"
                                             onmouseover="this.style.textDecoration='underline';this.style.color='var(--accent,#5f8dd3)'"
                                             onmouseout="this.style.textDecoration='';this.style.color=''">${propId}</span>`
                                    : `<span style="color:var(--red,#ef4444);font-weight:600;font-size:11px" title="${propId} — deleted">⚠ deleted</span>`)
                                : `<span class="restr-filler-ph"></span>
                                   <span style="color:var(--text-faint);white-space:nowrap">— property —</span>`
                            }
                        </div>
                        <div id="${propPickId}" class="cls-tree-picker" style="display:none"></div>
                    </div>
                    <input class="swrl-inp" value="${atom.object||''}" placeholder="?obj / ?_"
                           data-field="object" ${chg} style="width:60px;flex-shrink:0">
                    ${del}
                </div>`;
            }

            case 'equality_atom': {
                const ops = ['=','!=','>','>=','<','<='];
                const opSel = ops.map(o =>
                    `<option value="${o}"${(atom.operator||'=')===o?' selected':''}>${o}</option>`
                ).join('');
                const inds = (APP.state.individuals || []);
                const isInd = atom.value && inds.some(i => i.id === atom.value);

                // Champ valeur : si individu connu → pill navigable, sinon input texte
                const valueField = isInd
                    ? `<div class="tree-item restr-filler-btn" style="flex:1;min-width:0;margin:0;padding:2px 6px;cursor:default"
                            title="Left-click: navigate · Right-click: open picker"
                            oncontextmenu="event.preventDefault();SWRLEditor.openIndPicker('${path}')">
                           <span class="xsd-dot" style="flex-shrink:0;margin-right:4px"></span>
                           <span class="restr-filler-lbl" style="cursor:pointer;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
                                 onclick="APP.navigateTo('individuals','${atom.value}')"
                                 onmouseover="this.style.textDecoration='underline';this.style.color='var(--accent)'"
                                 onmouseout="this.style.textDecoration='';this.style.color=''"
                                 title="${atom.value}">${IndividualEditor._labelForId(atom.value)}</span>
                       </div>`
                    : `<input class="swrl-inp" value="${atom.value||''}" placeholder="individual, variable or value"
                              data-field="value" ${chg} style="flex:1;min-width:0">`;

                return `<div class="swrl-atom" data-path="${path}" ${dragAttrs}>
                    ${handle}
                    <input class="swrl-var" value="${atom.var||''}" placeholder="?var"
                           data-field="var" ${chg}>
                    <select class="swrl-op-select" data-field="operator"
                            onchange="SWRLEditor.updateField('${path}',this.dataset.field,this.value)"
                            style="width:46px;flex-shrink:0;background:var(--bg3);color:var(--text);border:1px solid var(--border);border-radius:4px;padding:1px 2px;font-size:11px;font-family:var(--font-mono);height:20px">
                        ${opSel}
                    </select>
                    <div style="flex:1;min-width:0;display:flex;gap:2px">
                        ${valueField}
                        <button class="btn-frame-del" style="flex-shrink:0;padding:1px 4px;background:var(--bg3);border-color:var(--border)"
                                title="Pick an individual"
                                onclick="SWRLEditor.openIndPicker('${path}')">
                            <span class="xsd-dot" style="pointer-events:none"></span>
                        </button>
                    </div>
                    ${del}
                </div>`;
            }

            case 'naf_block': {
                const ico = this._ico;
                const inner = this._renderAtomList(atom.atoms || [], `${path},atoms`);
                return `<div class="swrl-naf-block" data-path="${path}" ${dragAttrs}>
                    <div class="swrl-naf-hdr">
                    ${handle}
                        <span class="swrl-naf-label">NAF</span>
                        <div style="display:flex;gap:2px;align-items:center;margin-left:auto">
                            <button class="btn-ftool" style="font-size:9px" title="Add type atom"
                                    onclick="SWRLEditor.addAtom('${path},atoms','type_atom')">${ico}&thinsp;Class</button>
                            <button class="btn-ftool" style="font-size:9px" title="Add property atom"
                                    onclick="SWRLEditor.addAtom('${path},atoms','property_atom')">${ico}&thinsp;Property</button>
                            <button class="btn-ftool" style="font-size:9px" title="Add equality"
                                    onclick="SWRLEditor.addAtom('${path},atoms','equality_atom')">${ico}&thinsp;=</button>
                            <button class="btn-frame-del" style="flex-shrink:0;margin-left:4px"
                                    onclick="SWRLEditor.removeAtom('${path}')">✕</button>
                        </div>
                    </div>
                    <div class="swrl-naf-body">
                        ${inner || '<div class="cls-list-empty" style="font-size:10px;font-style:italic">— add atoms —</div>'}
                    </div>
                </div>`;
            }

            case 'conditional': {
                // Normalise en place : ancien format (objet unique) → liste
                if (!Array.isArray(atom.condition))  atom.condition  = atom.condition  ? [atom.condition]  : [];
                if (!Array.isArray(atom.consequent)) atom.consequent = atom.consequent ? [atom.consequent] : [];
                const condList = atom.condition;
                const consList = atom.consequent;
                const condHtml = this._renderAtomList(condList, `${path},condition`);
                const consHtml = this._renderAtomList(consList, `${path},consequent`);
                const ico = this._ico;
                return `<div class="swrl-conditional" data-path="${path}" ${dragAttrs}>
                    <div style="display:flex;align-items:flex-start;gap:4px;width:100%">
                        ${handle}
                        <div style="flex:1;min-width:0">
                            <div class="cls-frame" style="margin-top:0">
                                <div class="cls-frame-bar">
                                    <span style="font-size:13px;font-weight:700;color:#f59e0b;font-family:var(--font-mono)">if</span>
                                    <div style="display:flex;gap:3px;margin-left:auto;flex-wrap:wrap">
                                        <button class="btn-ftool" onclick="SWRLEditor.addAtom('${path},condition','type_atom')">${ico}&thinsp;Class</button>
                                        <button class="btn-ftool" onclick="SWRLEditor.addAtom('${path},condition','property_atom')">${ico}&thinsp;Property</button>
                                        <button class="btn-ftool" onclick="SWRLEditor.addAtom('${path},condition','equality_atom')">${ico}&thinsp;=</button>
                                        <button class="btn-ftool" onclick="SWRLEditor.addAtom('${path},condition','naf_block')">${ico}&thinsp;NAF</button>
                                    </div>
                                </div>
                                <div class="cls-frame-body">
                                    ${condHtml || '<div class="cls-list-empty" style="font-style:italic">— add antecedents —</div>'}
                                </div>
                            </div>
                            <div class="h-resizer"></div>
                            <div class="cls-frame">
                                <div class="cls-frame-bar">
                                    <span style="font-size:13px;font-weight:700;color:#10b981;font-family:var(--font-mono)">then</span>
                                    <div style="display:flex;gap:3px;margin-left:auto;flex-wrap:wrap">
                                        <button class="btn-ftool" onclick="SWRLEditor.addAtom('${path},consequent','type_atom')">${ico}&thinsp;Class</button>
                                        <button class="btn-ftool" onclick="SWRLEditor.addAtom('${path},consequent','property_atom')">${ico}&thinsp;Property</button>
                                        <button class="btn-ftool" onclick="SWRLEditor.addAtom('${path},consequent','equality_atom')">${ico}&thinsp;=</button>
                                        <button class="btn-ftool" onclick="SWRLEditor.addAtom('${path},consequent','conditional')">${ico}&thinsp;If&nbsp;…&nbsp;Then</button>
                                    </div>
                                </div>
                                <div class="cls-frame-body">
                                    ${consHtml || '<div class="cls-list-empty" style="font-style:italic">— add consequents —</div>'}
                                </div>
                            </div>
                        </div>
                        ${del}
                    </div>
                </div>`;
            }

            default:
                return '';
        }
    },

    // ── Pickers ──────────────────────────────────────────────────

    /** Ouvre/ferme le tree picker de classe pour un atome type_atom.
     *  Uses position:fixed to escape any overflow:hidden parent. */

    /** Positions a dropdown in fixed mode below (or above if no room) the trigger button */
    _positionDropdown(el, btn, width = 200, maxH = 260) {
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom - 4;
        const spaceAbove = rect.top - 4;
        el.style.position  = 'fixed';
        el.style.left      = Math.max(4, Math.min(rect.left, window.innerWidth - width - 4)) + 'px';
        el.style.width     = Math.max(width, rect.width) + 'px';
        el.style.maxHeight = Math.min(maxH, Math.max(spaceBelow, spaceAbove)) + 'px';
        el.style.zIndex    = '9000';
        el.style.overflowY = 'auto';
        if (spaceBelow >= Math.min(maxH, 120) || spaceBelow >= spaceAbove) {
            el.style.top    = (rect.bottom + 2) + 'px';
            el.style.bottom = '';
        } else {
            el.style.bottom = (window.innerHeight - rect.top + 2) + 'px';
            el.style.top    = '';
        }
    },

    toggleClassPicker(pickerId, atomPath, btnEl) {
        this._currentPickerPath = atomPath;
        // Fermer tous les autres pickers
        document.querySelectorAll('[id^="swrl-cls-picker-"]').forEach(p => {
            if (p.id !== pickerId) p.style.display = 'none';
        });
        const el  = document.getElementById(pickerId);
        const btn = btnEl || document.querySelector(`[onclick*="'${pickerId}'"]`);
        if (!el) return;
        const visible = el.style.display !== 'none';
        if (visible) { el.style.display = 'none'; return; }

        this._positionDropdown(el, btn);
        el.style.display = '';

        const close = (e) => {
            if (!el.contains(e.target) && e.target !== btn) {
                el.style.display = 'none';
                document.removeEventListener('click', close);
            }
        };
        setTimeout(() => document.addEventListener('click', close), 0);
    },

    /** Called when a class is selected in the tree picker */
    onClassPickerSelect(classId) {
        if (!this._currentPickerPath) return;
        // Update the atom in _editingRule
        const atom = this._navAtom(this._currentPickerPath);
        if (atom) atom['class_id'] = classId;
        // Fermer tous les pickers
        document.querySelectorAll('[id^="swrl-cls-picker-"]').forEach(p => p.style.display = 'none');
        this._currentPickerPath = null;
        // Re-render the form to show the selected class
        this._renderDetail();
        // Save if the rule already exists
        if (!this._isNew && this._editingRule?.id) this.save(false);
    },

    /** Ouvre/ferme le picker d'individu (losange violet) */
    toggleIndPicker(pickerId, atomPath, btnEl) {
        this._currentIndPickerPath = atomPath;
        document.querySelectorAll('[id^="swrl-ind-picker-"]').forEach(p => {
            if (p.id !== pickerId) p.style.display = 'none';
        });
        const el = document.getElementById(pickerId);
        if (!el) return;
        const visible = el.style.display !== 'none';
        if (visible) { el.style.display = 'none'; return; }
        this._positionDropdown(el, btnEl);
        el.style.display = '';
        const close = (e) => {
            if (!el.contains(e.target) && e.target !== btnEl) {
                el.style.display = 'none';
                document.removeEventListener('click', close);
            }
        };
        setTimeout(() => document.addEventListener('click', close), 0);
    },

    /** Called when an individual is selected in the picker */
    onIndPickerSelect(indId) {
        const atomPath = this._swrlIndPicker?.atomPath || this._currentIndPickerPath;
        if (!atomPath) return;
        const atom = this._navAtom(atomPath);
        if (atom) atom['value'] = indId;
        this._currentIndPickerPath = null;
        this._renderDetail();
        if (!this._isNew && this._editingRule?.id) this.save(false);
    },

    /** Opens/closes the property tree picker (position:fixed) */
    togglePropPicker(pickerId, atomPath, btnEl) {
        this._currentPropPickerPath = atomPath;
        document.querySelectorAll('[id^="swrl-prop-picker-"]').forEach(p => {
            if (p.id !== pickerId) p.style.display = 'none';
        });
        const el  = document.getElementById(pickerId);
        const btn = btnEl || document.querySelector(`[onclick*="'${pickerId}'"]`);
        if (!el) return;
        const visible = el.style.display !== 'none';
        if (visible) { el.style.display = 'none'; return; }

        // Build the picker content with icons
        const ops = APP.state.object_properties  || [];
        const dps = APP.state.datatype_properties || [];
        const alpha = (a, b) => a.id.localeCompare(b.id);
        const opItems = [...ops].sort(alpha).map(p =>
            `<div class="tree-item" data-id="${p.id}" style="padding:3px 8px"
                  onclick="SWRLEditor.onPropPickerSelect('${p.id}')">
                <span class="op-prop-dot" style="flex-shrink:0;margin-right:5px"></span>
                <span class="tree-label">${p.id}</span>
             </div>`).join('');
        const dpItems = [...dps].sort(alpha).map(p =>
            `<div class="tree-item" data-id="${p.id}" style="padding:3px 8px"
                  onclick="SWRLEditor.onPropPickerSelect('${p.id}')">
                <span class="dp-prop-dot" style="flex-shrink:0;margin-right:5px"></span>
                <span class="tree-label">${p.id}</span>
             </div>`).join('');
        const sep = (opItems && dpItems)
            ? `<div style="border-top:1px solid var(--border);margin:2px 0"></div>` : '';
        el.innerHTML = opItems + sep + dpItems ||
            '<div class="cls-list-empty" style="padding:6px">No properties</div>';

        this._positionDropdown(el, btn);
        el.style.display = '';

        const close = (e) => {
            if (!el.contains(e.target) && e.target !== btn) {
                el.style.display = 'none';
                document.removeEventListener('click', close);
            }
        };
        setTimeout(() => document.addEventListener('click', close), 0);
    },

    // ── Picker individu bi-panneau (SWRL equality atom) ──────────

    _swrlIndPicker: { atomPath: null, selectedClass: null, selectedInd: null },

    /** Opens the two-panel picker to select an individual */
    openIndPicker(atomPath) {
        this._swrlIndPicker = { atomPath, selectedClass: null, selectedInd: null };
        document.getElementById('swrl-ind-picker-modal')?.remove();

        const classes = APP.state.classes || [];
        const { roots, childrenOf } = ClassEditor.buildTree(classes);
        const allInds = APP.state.individuals || [];

        const countFor = (id) => {
            const desc = new Set([id]);
            const q = [...(childrenOf[id] || [])];
            while (q.length) { const c = q.shift(); if (!desc.has(c)) { desc.add(c); (childrenOf[c]||[]).forEach(x => q.push(x)); } }
            return allInds.filter(x => (x.types||[]).some(t => desc.has(t))).length;
        };

        const clsLines = [];
        // owl:Thing → tous les individus
        clsLines.push(`<div class="tree-item" data-id="__all__" style="padding-left:6px;font-style:italic"
            onclick="SWRLEditor.swrlIndPickerSelectClass('__all__')">
            <span class="cls-dot tree-thing-dot"></span>
            <span class="tree-label">owl:Thing</span>
            <span class="nav-count" style="margin-left:auto;margin-right:6px">${allInds.length}</span>
        </div>`);
        const visitCls = (id, depth) => {
            const n = countFor(id);
            clsLines.push(`<div class="tree-item" data-id="${id}" style="padding-left:${depth*16+6}px"
                onclick="SWRLEditor.swrlIndPickerSelectClass('${id}')">
                <span class="cls-dot tree-cls-dot"></span>
                <span class="tree-label">${id}</span>
                ${n ? `<span class="nav-count" style="margin-left:auto;margin-right:6px">${n}</span>` : ''}
            </div>`);
            (childrenOf[id]||[]).forEach(c => visitCls(c, depth+1));
        };
        roots.forEach(r => visitCls(r, 1));
        const clsHtml = clsLines.join('') || '<div class="cls-list-empty">No classes</div>';

        const modal = document.createElement('div');
        modal.id = 'swrl-ind-picker-modal';
        modal.className = 'ind-picker-overlay';
        modal.innerHTML = `
        <div class="ind-picker-modal">
            <div class="ind-picker-hdr">
                <span style="font-weight:600">Select Individual</span>
                <button class="btn-sm" onclick="SWRLEditor.closeIndPicker()">✕</button>
            </div>
            <div class="ind-picker-body">
                <div class="ind-picker-classes" id="swrl-ind-cls-panel" style="display:flex;flex-direction:column;overflow:hidden">
                    <div class="tree-panel-header" style="padding:4px 8px;flex-shrink:0"><h3>Classes</h3></div>
                    <div id="swrl-ind-cls-tree" style="overflow-y:auto;flex:1">${clsHtml}</div>
                </div>
                <div class="ind-picker-inds" style="display:flex;flex-direction:column;overflow:hidden">
                    <div class="tree-panel-header" style="padding:4px 8px;flex-shrink:0"><h3 id="swrl-ind-cls-title">— select a class —</h3></div>
                    <div id="swrl-ind-list" style="overflow-y:auto;flex:1"><div class="cls-list-empty" style="padding:8px;font-style:italic">Select a class</div></div>
                </div>
            </div>
            <div class="ind-picker-ftr">
                <button id="swrl-ind-ok" class="btn-primary btn-sm" disabled onclick="SWRLEditor.confirmIndPicker()">OK</button>
                <button class="btn-secondary btn-sm" onclick="SWRLEditor.closeIndPicker()">Cancel</button>
            </div>
        </div>`;
        document.body.appendChild(modal);
    },

    swrlIndPickerSelectClass(classId) {
        this._swrlIndPicker.selectedClass = classId;
        this._swrlIndPicker.selectedInd   = null;
        document.querySelectorAll('#swrl-ind-cls-tree .tree-item').forEach(el =>
            el.classList.toggle('selected', el.dataset.id === classId));
        const title = document.getElementById('swrl-ind-cls-title');
        if (title) title.textContent = classId === '__all__' ? 'owl:Thing' : classId;

        const allInds = APP.state.individuals || [];
        let filtered;
        if (classId === '__all__') {
            filtered = allInds;
        } else {
            const { childrenOf } = ClassEditor.buildTree(APP.state.classes || []);
            const desc = new Set([classId]);
            const q = [...(childrenOf[classId]||[])];
            while (q.length) { const c = q.shift(); if (!desc.has(c)) { desc.add(c); (childrenOf[c]||[]).forEach(x => q.push(x)); } }
            filtered = allInds.filter(x => (x.types||[]).some(t => desc.has(t)));
        }

        const ctxClass = classId === '__all__' ? null : classId;
        const listHtml = filtered.length
            ? filtered.map(x => {
                const lbl = IndividualEditor._labelForId(x.id, ctxClass);
                const sub = lbl !== x.id ? `<span style="font-size:10px;color:var(--text-faint);display:block">${x.id}</span>` : '';
                return `<div class="tree-item ind-picker-ind" data-id="${x.id}"
                     style="padding:4px 10px;cursor:pointer"
                     onclick="SWRLEditor.swrlIndPickerSelectInd('${x.id}')"
                     ondblclick="SWRLEditor.swrlIndPickerSelectInd('${x.id}');SWRLEditor.confirmIndPicker()">
                    <span class="xsd-dot" style="margin:0 6px 0 0;flex-shrink:0"></span>
                    <span class="tree-label">${lbl}${sub}</span>
                </div>`;
            }).join('')
            : '<div class="cls-list-empty" style="padding:8px;font-style:italic">No individuals</div>';

        const listEl = document.getElementById('swrl-ind-list');
        if (listEl) listEl.innerHTML = listHtml;
        const ok = document.getElementById('swrl-ind-ok');
        if (ok) ok.disabled = true;
    },

    swrlIndPickerSelectInd(indId) {
        this._swrlIndPicker.selectedInd = indId;
        document.querySelectorAll('#swrl-ind-list .ind-picker-ind').forEach(el =>
            el.classList.toggle('selected', el.dataset.id === indId));
        const ok = document.getElementById('swrl-ind-ok');
        if (ok) ok.disabled = false;
    },

    confirmIndPicker() {
        const { atomPath, selectedInd } = this._swrlIndPicker;
        if (!selectedInd || !atomPath) return;
        this.onIndPickerSelect(selectedInd);
        this.closeIndPicker();
    },

    closeIndPicker() {
        document.getElementById('swrl-ind-picker-modal')?.remove();
        this._swrlIndPicker = { atomPath: null, selectedClass: null, selectedInd: null };
    },

    /** Called when a property is selected in the picker */
    onPropPickerSelect(propId) {
        if (!this._currentPropPickerPath) return;
        const atom = this._navAtom(this._currentPropPickerPath);
        if (atom) atom['property_id'] = propId;
        document.querySelectorAll('[id^="swrl-prop-picker-"]').forEach(p => p.style.display = 'none');
        this._currentPropPickerPath = null;
        this._renderDetail();
        if (!this._isNew && this._editingRule?.id) this.save(false);
    },

    // ── Drag-and-drop ────────────────────────────────────────────

    onDragStart(event, listPath, idx) {
        event.stopPropagation();
        this._drag = { listPath, fromIdx: parseInt(idx) };
        event.dataTransfer.effectAllowed = 'move';
        document.body.classList.add('resizing');
        const atomEl = event.target.closest('[data-path]');
        if (atomEl) {
            event.dataTransfer.setDragImage(atomEl, 0, 0);
            setTimeout(() => atomEl.classList.add('swrl-dragging'), 0);
        }
    },

    onDragOver(event, el, listPath) {
        // Only accept the drop if in the same list as the source
        if (!this._drag?.listPath || this._drag.listPath !== listPath) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        document.querySelectorAll('.swrl-drag-target').forEach(e => e.classList.remove('swrl-drag-target'));
        el.classList.add('swrl-drag-target');
    },

    onDragLeave(el) {
        el.closest('[data-path]')?.classList.remove('swrl-drag-target');
    },

    onDrop(event, listPath, toIdx) {
        event.preventDefault();
        event.stopPropagation();
        document.querySelectorAll('.swrl-drag-target').forEach(e => e.classList.remove('swrl-drag-target'));
        const { listPath: fromPath, fromIdx } = this._drag;
        if (!fromPath || fromIdx === null || fromPath !== listPath) return;
        toIdx = parseInt(toIdx);
        if (fromIdx === toIdx) return;
        // Navigate to the list and reorder
        const arr = this._nav(listPath);
        if (!Array.isArray(arr)) return;
        const [item] = arr.splice(fromIdx, 1);
        arr.splice(toIdx, 0, item);
        this._drag = { listPath: null, fromIdx: null };
        this._renderDetail();
        if (!this._isNew && this._editingRule?.id) this.save(false);
    },

    onDragEnd() {
        this._drag = { listPath: null, fromIdx: null };
        document.body.classList.remove('resizing');
        document.querySelectorAll('[data-path]').forEach(e => e.style.opacity = '');
        document.querySelectorAll('.swrl-drag-target').forEach(e => e.classList.remove('swrl-drag-target'));
        document.querySelectorAll('.swrl-dragging').forEach(e => e.classList.remove('swrl-dragging'));
    },

    // ── Atom manipulation ──────────────────────────────────

    /** Adds an atom to the list designated by path */
    addAtom(pathStr, atomType) {
        const arr = this._nav(pathStr);
        if (!Array.isArray(arr)) return;
        arr.push(this._makeAtom(atomType));
        this._renderDetail();
        if (!this._isNew) this.save(false);
    },

    /** Removes the atom at the given index */
    removeAtom(pathStr) {
        const parts = pathStr.split(',');
        const idx   = parseInt(parts.pop());
        const arr   = this._nav(parts.join(',') || 'body');
        if (Array.isArray(arr) && !isNaN(idx)) arr.splice(idx, 1);
        this._renderDetail();
        if (!this._isNew) this.save(false);
    },

    /** Updates a field of an atom */
    updateField(pathStr, field, value) {
        const atom = this._navAtom(pathStr);
        if (atom && field) {
            atom[field] = value;
            if (!this._isNew) this.save(false);
        }
    },

    _makeAtom(type) {
        switch (type) {
            case 'type_atom':     return { type: 'type_atom',     var: '?x', class_id: '' };
            case 'property_atom': return { type: 'property_atom', subject: '?x', property_id: '', object: '?_' };
            case 'equality_atom': return { type: 'equality_atom', var: '?x', operator: '=', value: '' };
            case 'naf_block':     return { type: 'naf_block',     atoms: [] };
            case 'conditional':   return {
                type: 'conditional',
                condition:  [],
                consequent: [],
            };
            default: return { type };
        }
    },

    /** Remplace l'atome condition ou consequent d'un conditional par un nouveau type */
    setCondAtom(condPath, field, atomType) {
        const atom = this._navAtom(condPath);
        if (!atom) return;
        atom[field] = this._makeAtom(atomType);
        this._renderDetail();
        if (!this._isNew && this._editingRule?.id) this.save(false);
    },

    /** Navigate to a list/object by comma-separated path */
    _nav(pathStr) {
        if (!pathStr) return null;
        let obj = this._editingRule;
        for (const p of pathStr.split(',')) {
            if (obj == null) return null;
            obj = isNaN(p) ? obj[p] : obj[parseInt(p)];
        }
        return obj;
    },

    /** Navigate to an atom (resolves the last index) */
    _navAtom(pathStr) {
        const parts = pathStr.split(',');
        const last  = parts.pop();
        const parent = this._nav(parts.join(','));
        if (!parent) return null;
        return isNaN(last) ? parent[last] : parent[parseInt(last)];
    },

    // ── Sync meta ────────────────────────────────────────────────
    _syncFromDom() {
        if (!this._editingRule) return;
        const idEl = document.getElementById('swrl-id');
        const id   = (idEl?.value || '').trim().replace(/\s+/g, '_');
        if (id) { this._editingRule.id = id; if (idEl) idEl.value = id; }
        this._editingRule.label   = document.getElementById('swrl-label')?.value   || '';
        this._editingRule.comment = document.getElementById('swrl-comment')?.value || '';
    },

    _syncAndSave() {
        this._syncFromDom();
        if (!this._isNew && this._editingRule?.id) this.save(false);
    },

    // ── Save / Delete ─────────────────────────────────
    async save(isNew) {
        this._syncFromDom();
        const rule = this._editingRule;
        if (!rule?.id) { UI.error('Rule identifier is required'); return; }
        try {
            if (isNew) {
                await API.createSWRLRule(rule);
                this._isNew      = false;
                this._selectedId = rule.id;
                this._editingId  = rule.id;
                UI.success(`SWRL rule '${rule.id}' created`);
            } else {
                const originalId = this._editingId || rule.id;
                await API.updateSWRLRule(originalId, rule);
                if (rule.id !== originalId) UI.success(`Rule renamed → '${rule.id}'`);
                this._selectedId = rule.id;
                this._editingId  = rule.id;
            }
            await APP.refresh();
            const listEl = document.getElementById('swrl-list');
            if (listEl) listEl.innerHTML = this.renderList(APP.state.swrl_rules || []);
        } catch (e) { UI.error(e.message); }
    },

    async delete(id) {
        if (!await UI.confirm(`Delete SWRL rule <strong>${id}</strong>?`)) return;
        try {
            await API.deleteSWRLRule(id);
        } catch (e) {
            if (!e.message.includes('404') && !e.message.toLowerCase().includes('not found')) {
                UI.error(e.message); return;
            }
        }
        UI.success(`SWRL rule '${id}' deleted`);
        this._selectedId  = null;
        this._editingRule = null;
        this._isNew       = false;
        await APP.refresh();
        const listEl = document.getElementById('swrl-list');
        if (listEl) listEl.innerHTML = this.renderList(APP.state.swrl_rules || []);
        this._cancel();
    },

    _cancel() {
        this._editingRule = null;
        this._isNew       = false;
        const detail = document.getElementById('swrl-detail');
        if (detail) detail.innerHTML = `<div class="detail-panel-empty">
            <span style="font-size:36px;font-weight:300">⊢¬</span>
            <span>Select a SWRL rule or create a new one</span>
        </div>`;
    },

    // ── Split handle ─────────────────────────────────────────────
    _initSplitHandle() {
        const handle = document.getElementById('swrl-split-h');
        const panel  = document.getElementById('swrl-list-panel');
        if (!handle || !panel) return;
        let dragging = false;
        handle.addEventListener('mousedown', e => {
            dragging = true; document.body.classList.add('resizing'); e.preventDefault();
        });
        document.addEventListener('mousemove', e => {
            if (!dragging) return;
            const left = panel.getBoundingClientRect().left;
            panel.style.width = Math.max(120, Math.min(400, e.clientX - left)) + 'px';
            panel.style.flex  = 'none';
        });
        document.addEventListener('mouseup', () => {
            if (dragging) { dragging = false; document.body.classList.remove('resizing'); }
        });
    },
};
