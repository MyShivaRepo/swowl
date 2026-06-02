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
    _editingRule:           null,
    _isNew:                 false,
    _currentPickerPath:     null,   // path + field pour le picker classe
    _currentPropPickerPath: null,   // path + field pour le picker propriété
    _drag:                  { section: null, fromIdx: null }, // état drag-and-drop

    // ── SVG icons ──────────────────────────────────────────────
    _ico: `<svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor"
              stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
           <line x1="4.5" y1=".5" x2="4.5" y2="8.5"/>
           <line x1=".5"  y1="4.5" x2="8.5"  y2="4.5"/>
           </svg>`,

    // ── Layout split ────────────────────────────────────────────
    renderSplit(rules) {
        return `
        <div class="section-split">
            <div class="tree-panel" id="swrl-list-panel">
                <div class="tree-panel-header">
                    <h3>SWRL Rules</h3>
                    <button class="btn-sm" onclick="SWRLEditor.newRule()" title="New SWRL rule">➕</button>
                </div>
                <div class="tree-scroll" id="swrl-list">${this.renderList(rules)}</div>
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

    renderList(rules) {
        if (!rules || !rules.length)
            return '<div class="cls-list-empty" style="padding:12px">No SWRL rule</div>';
        const sel = this._selectedId;
        return rules.map(r => `
            <div class="tree-item${r.id === sel ? ' selected' : ''}" data-id="${r.id}"
                 onclick="SWRLEditor.selectRule('${r.id}')">
                <span class="tree-leaf">◦</span>
                <span class="tree-label">${r.id}</span>
                ${r.label ? `<span class="restr-prop-summary" style="margin-left:4px;flex:1">${r.label}</span>` : '<span style="flex:1"></span>'}
                <button class="btn-icon btn-icon-danger" style="flex-shrink:0;padding:2px 4px"
                        onclick="event.stopPropagation();SWRLEditor.delete('${r.id}')"
                        title="Delete rule">${ClassEditor._svgDelete}</button>
            </div>`).join('');
    },

    restoreSelection() {
        this._initSplitHandle();
        if (this._selectedId) {
            this.selectRule(this._selectedId);
        }
    },

    // ── Sélection / création ─────────────────────────────────────
    selectRule(id) {
        const rule = (APP.state.swrl_rules || []).find(r => r.id === id);
        if (!rule) return;
        this._selectedId  = id;
        this._isNew       = false;
        this._editingRule = JSON.parse(JSON.stringify(rule));
        this._renderDetail();
        document.querySelectorAll('#swrl-list .tree-item').forEach(el =>
            el.classList.toggle('selected', el.dataset.id === id));
    },

    newRule() {
        this._selectedId  = null;
        this._isNew       = true;
        this._editingRule = { id: '', label: '', comment: '', body: [], head: [], enabled: true };
        this._renderDetail();
        document.querySelectorAll('#swrl-list .tree-item').forEach(el => el.classList.remove('selected'));
    },

    _renderDetail() {
        const detail = document.getElementById('swrl-detail');
        if (!detail) return;
        detail.innerHTML = this._renderForm(this._editingRule, this._isNew);
        _initHResizers('swrl-detail');
        if (this._isNew) {
            const idInp = document.getElementById('swrl-id');
            if (idInp) {
                idInp.focus();
                idInp.addEventListener('blur', function handler() {
                    idInp.removeEventListener('blur', handler);
                    if (idInp.value.trim()) SWRLEditor.save(true);
                });
            }
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
                    ID&nbsp;
                    <input type="text" class="cls-id-inp" id="swrl-id"
                           value="${rule.id}" placeholder="ruleName"
                           oninput="this.value=this.value.replace(/\\s+/g,'_')"
                           ${isNew ? '' : 'onchange="SWRLEditor._syncAndSave()"'}
                           title="Rule identifier">
                    <span class="cls-editor-meta">NAME</span>
                </div>
                <div style="margin-top:4px;display:flex;gap:4px">
                    <input type="text" id="swrl-label" value="${rule.label||''}" placeholder="Label"
                           class="cls-id-inp" style="flex:1;font-size:11px"
                           onchange="SWRLEditor._syncAndSave()">
                    <input type="text" id="swrl-comment" value="${rule.comment||''}" placeholder="Comment"
                           class="cls-id-inp" style="flex:2;font-size:11px"
                           onchange="SWRLEditor._syncAndSave()">
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
        // Draggable si l'atome est un élément d'une liste nommée (body, head, atoms, condition, consequent)
        const _listParents = new Set(['body', 'head', 'atoms', 'condition', 'consequent']);
        const isDraggable = parts.length >= 2 && _listParents.has(parts[parts.length - 2]);

        // Pour le dragstart/drop on a besoin du chemin de la LISTE parente + l'index
        const listPath = parts.slice(0, -1).join(',');   // ex: 'body' ou 'body,2,atoms'
        const idx      = parts[parts.length - 1];

        // Le conteneur reçoit seulement les événements de DROP (pas draggable lui-même)
        // onDragOver ne fait event.preventDefault() que si listPath correspond → empêche le drop sur un mauvais parent
        const dragAttrs = isDraggable ? `
            ondragover="SWRLEditor.onDragOver(event,this,'${listPath}')"
            ondragleave="SWRLEditor.onDragLeave(this)"
            ondrop="event.preventDefault();event.stopPropagation();SWRLEditor.onDrop(event,'${listPath}',${idx})"` : '';

        // La poignée porte draggable="true" — seule elle initie le drag, sans conflit de niveaux
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
                return `<div class="swrl-atom" data-path="${path}" ${dragAttrs}>
                    ${handle}
                    <input class="swrl-var" value="${atom.var||''}" placeholder="?var"
                           data-field="var" ${chg}>
                    <span class="swrl-kw">is a</span>
                    <div style="position:relative;flex:1;min-width:0">
                        <div class="tree-item restr-filler-btn" style="margin:0;padding:2px 6px;cursor:pointer"
                             title="${clsId ? 'Left-click: navigate · Right-click: change class' : 'Click to select a class'}"
                             onclick="${clsId ? '' : `SWRLEditor.toggleClassPicker('${pickerId}','${path}',this)`}"
                             oncontextmenu="event.preventDefault();SWRLEditor.toggleClassPicker('${pickerId}','${path}',this)">
                            ${clsId
                                ? `<span class="cls-dot tree-cls-dot" style="flex-shrink:0;margin-right:4px"></span>
                                   <span class="restr-filler-lbl" style="cursor:pointer"
                                         onclick="event.stopPropagation();APP.navigateTo('classes','${clsId}')"
                                         onmouseover="this.style.textDecoration='underline';this.style.color='var(--accent,#5f8dd3)'"
                                         onmouseout="this.style.textDecoration='';this.style.color=''">${clsId}</span>`
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
                const propDot   = isOP ? 'op-prop-dot' : isDP ? 'dp-prop-dot' : null;
                const propPickId = `swrl-prop-picker-${path.replace(/,/g,'__')}`;
                return `<div class="swrl-atom" data-path="${path}" ${dragAttrs}>
                    ${handle}
                    <input class="swrl-var" value="${atom.subject||''}" placeholder="?subj"
                           data-field="subject" ${chg}>
                    <div style="position:relative;flex:0 1 auto;min-width:80px">
                        <div class="tree-item restr-filler-btn" style="margin:0;padding:2px 6px;cursor:pointer;width:max-content;max-width:200px"
                             title="${propId ? 'Left-click: navigate · Right-click: change property' : 'Click to select a property'}"
                             onclick="${propId ? '' : `SWRLEditor.togglePropPicker('${propPickId}','${path}',this)`}"
                             oncontextmenu="event.preventDefault();SWRLEditor.togglePropPicker('${propPickId}','${path}',this)">
                            ${propId
                                ? `<span class="${propDot||'op-prop-dot'}" style="flex-shrink:0;margin-right:4px"></span>
                                   <span style="white-space:nowrap;cursor:pointer"
                                         onclick="event.stopPropagation();APP.navigateTo('${isOP ? 'object-properties' : 'datatype-properties'}','${propId}')"
                                         onmouseover="this.style.textDecoration='underline';this.style.color='var(--accent,#5f8dd3)'"
                                         onmouseout="this.style.textDecoration='';this.style.color=''">${propId}</span>`
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
                const safePath = path.replace(/,/g, '__');
                const indPickId = `swrl-ind-picker-${safePath}`;
                const inds = (APP.state.individuals || []);
                const indItems = inds.length
                    ? inds.map(i => `<div class="cls-tree-picker-item" onclick="SWRLEditor.onIndPickerSelect('${i.id}')">
                        <span class="xsd-dot" style="flex-shrink:0"></span>
                        <span>${i.id}</span></div>`).join('')
                    : '<div style="padding:6px 10px;font-size:11px;color:var(--text-dim)">No individuals</div>';
                return `<div class="swrl-atom" data-path="${path}" ${dragAttrs}>
                    ${handle}
                    <input class="swrl-var" value="${atom.var||''}" placeholder="?var"
                           data-field="var" ${chg}>
                    <select class="swrl-op-select" data-field="operator"
                            onchange="SWRLEditor.updateField('${path}',this.dataset.field,this.value)"
                            style="width:46px;flex-shrink:0;background:var(--bg3);color:var(--text);border:1px solid var(--border);border-radius:4px;padding:1px 2px;font-size:11px;font-family:var(--font-mono);height:20px">
                        ${opSel}
                    </select>
                    <div style="position:relative;flex:1;min-width:0;display:flex;gap:2px">
                        <input class="swrl-inp" value="${atom.value||''}" placeholder="individual, variable or value"
                               data-field="value" ${chg} style="flex:1;min-width:0">
                        <button class="btn-frame-del" style="flex-shrink:0;padding:1px 4px;background:var(--bg3);border-color:var(--border)"
                                title="Pick an individual"
                                onclick="SWRLEditor.toggleIndPicker('${indPickId}','${path}',this)">
                            <span class="xsd-dot" style="pointer-events:none"></span>
                        </button>
                        <div id="${indPickId}" class="cls-tree-picker" style="display:none;min-width:180px;max-height:220px;overflow-y:auto">
                            ${indItems}
                        </div>
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
     *  Utilise position:fixed pour échapper à tout overflow:hidden parent. */
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

        // Positionner en fixed sous le bouton déclencheur
        if (btn) {
            const rect = btn.getBoundingClientRect();
            el.style.position  = 'fixed';
            el.style.top       = (rect.bottom + 2) + 'px';
            el.style.left      = rect.left + 'px';
            el.style.width     = Math.max(200, rect.width) + 'px';
            el.style.zIndex    = '9000';
            el.style.maxHeight = '260px';
        }
        el.style.display = '';

        const close = (e) => {
            if (!el.contains(e.target) && e.target !== btn) {
                el.style.display = 'none';
                document.removeEventListener('click', close);
            }
        };
        setTimeout(() => document.addEventListener('click', close), 0);
    },

    /** Appelé quand une classe est sélectionnée dans le tree picker */
    onClassPickerSelect(classId) {
        if (!this._currentPickerPath) return;
        // Mettre à jour l'atome dans _editingRule
        const atom = this._navAtom(this._currentPickerPath);
        if (atom) atom['class_id'] = classId;
        // Fermer tous les pickers
        document.querySelectorAll('[id^="swrl-cls-picker-"]').forEach(p => p.style.display = 'none');
        this._currentPickerPath = null;
        // Re-rendre le formulaire pour afficher la classe sélectionnée
        this._renderDetail();
        // Sauvegarder si la règle existe déjà
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
        if (btnEl) {
            const rect = btnEl.getBoundingClientRect();
            el.style.position  = 'fixed';
            el.style.top       = (rect.bottom + 2) + 'px';
            el.style.zIndex    = '9000';
            // Aligner à droite du bouton, mais rester dans la fenêtre
            const pickerW = 200;
            const leftPos = Math.max(4, Math.min(rect.right - pickerW, window.innerWidth - pickerW - 4));
            el.style.left  = leftPos + 'px';
            el.style.width = pickerW + 'px';
        }
        el.style.display = '';
        const close = (e) => {
            if (!el.contains(e.target) && e.target !== btnEl) {
                el.style.display = 'none';
                document.removeEventListener('click', close);
            }
        };
        setTimeout(() => document.addEventListener('click', close), 0);
    },

    /** Appelé quand un individu est sélectionné dans le picker */
    onIndPickerSelect(indId) {
        if (!this._currentIndPickerPath) return;
        const atom = this._navAtom(this._currentIndPickerPath);
        if (atom) atom['value'] = indId;
        document.querySelectorAll('[id^="swrl-ind-picker-"]').forEach(p => p.style.display = 'none');
        this._currentIndPickerPath = null;
        this._renderDetail();
        if (!this._isNew && this._editingRule?.id) this.save(false);
    },

    /** Ouvre/ferme le tree picker de propriété (position:fixed) */
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

        // Construire le contenu du picker avec icônes
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

        // Positionner en fixed
        if (btn) {
            const rect = btn.getBoundingClientRect();
            el.style.position  = 'fixed';
            el.style.top       = (rect.bottom + 2) + 'px';
            el.style.left      = rect.left + 'px';
            el.style.width     = Math.max(200, rect.width) + 'px';
            el.style.zIndex    = '9000';
            el.style.maxHeight = '260px';
        }
        el.style.display = '';

        const close = (e) => {
            if (!el.contains(e.target) && e.target !== btn) {
                el.style.display = 'none';
                document.removeEventListener('click', close);
            }
        };
        setTimeout(() => document.addEventListener('click', close), 0);
    },

    /** Appelé quand une propriété est sélectionnée dans le picker */
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
        // N'accepte le drop que si on est dans la même liste que la source
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
        // Naviguer jusqu'à la liste et réordonner
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

    // ── Manipulation des atomes ──────────────────────────────────

    /** Ajoute un atome à la liste désignée par path */
    addAtom(pathStr, atomType) {
        const arr = this._nav(pathStr);
        if (!Array.isArray(arr)) return;
        arr.push(this._makeAtom(atomType));
        this._renderDetail();
        if (!this._isNew) this.save(false);
    },

    /** Supprime l'atome à l'index donné */
    removeAtom(pathStr) {
        const parts = pathStr.split(',');
        const idx   = parseInt(parts.pop());
        const arr   = this._nav(parts.join(',') || 'body');
        if (Array.isArray(arr) && !isNaN(idx)) arr.splice(idx, 1);
        this._renderDetail();
        if (!this._isNew) this.save(false);
    },

    /** Met à jour un champ d'un atome */
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
                condition:  [{ type: 'equality_atom', var: '?x', operator: '=', value: '' }],
                consequent: [{ type: 'type_atom',     var: '?x', class_id: '' }],
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

    // ── Sauvegarde / Suppression ─────────────────────────────────
    async save(isNew) {
        this._syncFromDom();
        const rule = this._editingRule;
        if (!rule?.id) { UI.error('Rule identifier is required'); return; }
        try {
            if (isNew) {
                await API.createSWRLRule(rule);
                this._isNew      = false;
                this._selectedId = rule.id;
                UI.success(`SWRL rule '${rule.id}' created`);
            } else {
                await API.updateSWRLRule(rule.id, rule);
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
