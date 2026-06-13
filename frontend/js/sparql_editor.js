/**
 * sparql_editor.js — Visual SPARQL Query Builder
 *
 * Builds SPARQL 1.1 SELECT queries with a visual block-based editor.
 * Queries are persisted in localStorage per ontology.
 * Execution via POST /api/sparql.
 */

const SparqlEditor = {

    _selectedId:   null,
    _editingQuery: null,
    _isNew:        false,
    _searchQuery:  '',
    _showSparql:   false,

    // ── Storage (API-backed) ──────────────────────────────────────────
    _loadAll() {
        return APP.state.queries || [];
    },
    _saveEditing() {
        if (!this._editingQuery || this._editingQuery._imported) return;
        const q = this._editingQuery;
        const all = APP.state.queries || [];
        const idx = all.findIndex(x => x.id === q.id);
        if (idx >= 0) {
            APP.state.queries[idx] = q;
            API.updateQuery(q.id, q).catch(() => {});
        } else {
            APP.state.queries = [...all, q];
            API.createQuery(q).catch(() => {});
        }
    },

    // ── Layout ────────────────────────────────────────────────────────
    renderSplit() {
        const queries = this._loadAll();
        return `
        <div class="section-split">
            <div class="tree-panel" id="sparql-list-panel"
                 style="display:flex;flex-direction:column">
                <div class="tree-panel-header">
                    <h3>🔎 Queries</h3>
                    <button class="btn-sm" onclick="SparqlEditor.newQuery()"
                            title="New query">➕</button>
                </div>
                <div class="tree-scroll" id="sparql-list" style="flex:1">
                    ${this.renderList(queries)}
                </div>
                <div style="padding:6px 8px;border-top:1px solid var(--border);flex-shrink:0">
                    <div style="display:flex;align-items:center;gap:4px;
                                background:var(--bg3);border:1px solid var(--border2);
                                border-radius:4px;padding:3px 8px">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                             stroke="var(--text-dim)" stroke-width="1.5" style="flex-shrink:0">
                            <circle cx="5" cy="5" r="4"/>
                            <line x1="8.5" y1="8.5" x2="11" y2="11"/>
                        </svg>
                        <input id="sparql-search" type="text" placeholder="Search queries…"
                               value="${this._searchQuery || ''}"
                               style="flex:1;background:transparent;border:none;outline:none;
                                      font-size:11px;color:var(--text1);font-family:inherit"
                               oninput="SparqlEditor._onSearch(this.value)">
                    </div>
                </div>
            </div>
            <div class="split-handle" id="sparql-split-h"></div>
            <div class="detail-panel" id="sparql-detail">
                <div class="detail-panel-empty">
                    <span style="font-size:36px">🔎</span>
                    <span>Select an existing query or create a new one</span>
                </div>
            </div>
        </div>`;
    },

    renderList(qs) {
        const q = (this._searchQuery || '').trim().toLowerCase();
        const filtered = q
            ? qs.filter(x => (x.id + x.label).toLowerCase().includes(q))
            : qs;
        if (!filtered.length)
            return `<div class="cls-list-empty" style="padding:12px">
                ${q ? 'No matching query' : 'No saved query'}</div>`;
        return filtered.map(x => {
            const isImported = !!x._imported;
            const importedPrefix = isImported ? `${x._importPrefix}:` : '';
            const mainText = x.label || x.id;
            const subText  = x.label ? x.id : '';
            return `
            <div class="tree-item${x.id === this._selectedId ? ' selected' : ''}${isImported ? ' imported-entity' : ''}"
                 data-id="${x.id}" style="align-items:center"
                 onclick="SparqlEditor.selectQuery('${x.id}')"
                 oncontextmenu="event.preventDefault();SparqlEditor.showContextMenu(event,'${x.id}')">
                <span style="font-size:13px;flex-shrink:0;line-height:1">🎯</span>
                <span style="flex:1;overflow:hidden;min-width:0">
                    <span class="tree-label" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block">${importedPrefix}${this._esc(mainText)}</span>
                    ${subText ? `<span style="font-size:10px;color:var(--text-faint);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block">${this._esc(subText)}</span>` : ''}
                </span>
                ${!isImported ? `<button class="btn-icon btn-icon-danger" style="flex-shrink:0;padding:2px 4px"
                        onclick="event.stopPropagation();SparqlEditor.deleteQuery('${x.id}')"
                        title="Delete query">${ClassEditor._svgDelete}</button>` : ''}
            </div>`;
        }).join('');
    },

    _onSearch(val) {
        this._searchQuery = val;
        const list = document.getElementById('sparql-list');
        if (list) list.innerHTML = this.renderList(this._loadAll());
    },

    // ── CRUD ──────────────────────────────────────────────────────────
    newQuery() {
        const all = APP.state.queries || [];
        let n = all.length + 1;
        while (all.find(q => q.id === `Query${n}`)) n++;
        const q = this._emptyQuery(`Query${n}`);
        APP.state.queries = [...all, q];
        API.createQuery(q).catch(() => {});
        this._selectedId   = q.id;
        this._editingQuery = JSON.parse(JSON.stringify(q));
        this._refreshList();
        this._renderDetail();
    },

    _emptyQuery(id) {
        return {
            id,
            label:     '',
            comment:   '',
            distinct:  false,
            patterns:  [],
            order_by:  '',
            order_dir: 'ASC',
            limit:     100
        };
    },

    selectQuery(id) {
        const q = this._loadAll().find(x => x.id === id);
        if (!q) return;
        this._selectedId   = id;
        this._editingQuery = JSON.parse(JSON.stringify(q));
        this._refreshList();
        this._renderDetail();
    },

    deleteQuery(id) {
        const q = this._loadAll().find(x => x.id === id);
        if (q?._imported) { UI.error('Cannot delete an imported query.'); return; }
        APP.state.queries = (APP.state.queries || []).filter(x => x.id !== id);
        API.deleteQuery(id).catch(() => {});
        if (this._selectedId === id) {
            this._selectedId   = null;
            this._editingQuery = null;
            const detail = document.getElementById('sparql-detail');
            if (detail) detail.innerHTML = `
                <div class="detail-panel-empty">
                    <span style="font-size:36px">🔎</span>
                    <span>Select an existing query or create a new one</span>
                </div>`;
        }
        this._refreshList();
    },

    _refreshList() {
        const list = document.getElementById('sparql-list');
        if (list) list.innerHTML = this.renderList(this._loadAll());
    },

    // ── Detail panel ──────────────────────────────────────────────────
    _renderDetail() {
        const detail = document.getElementById('sparql-detail');
        if (!detail || !this._editingQuery) return;
        _applyImportedView(detail, this._editingQuery, this._renderForm(this._editingQuery));
        this._initSplitHandle();
    },

    _initSplitHandle() {
        const handle = document.getElementById('sparql-split-h');
        const panel  = document.getElementById('sparql-list-panel');
        if (!handle || !panel || handle._bound) return;
        handle._bound = true;
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

    // ── Form ──────────────────────────────────────────────────────────
    _renderForm(q) {
        const sparql   = this._buildSparql(q);
        const patterns = (q.patterns || []).map((p, i) => this._renderPattern(p, i)).join('');
        const allVars  = [...this._collectVars(q.patterns)];

        // datalist for variable autocomplete
        const varsList = allVars.map(v => `<option value="${v}">`).join('');

        return `
        <datalist id="sq-vars-list">${varsList}</datalist>

        <div class="cls-editor" style="display:flex;flex-direction:column;height:100%;overflow:hidden">

            <!-- ── Header ── -->
            <div class="cls-editor-hdr" style="flex-shrink:0">
                <div class="cls-editor-title" style="gap:6px;flex-wrap:wrap;align-items:center">
                    <span class="cls-editor-meta">ID</span>
                    <input type="text" id="sq-id" class="cls-id-inp" value="${q.id}"
                           placeholder="Id"
                           oninput="this.value=this.value.replace(/\\s+/g,'_')"
                           onchange="SparqlEditor._onIdChange(this.value)">
                    <span class="cls-editor-meta">LABEL</span>
                    <input type="text" id="sq-label" class="cls-id-inp"
                           value="${q.label || ''}" placeholder="Label"
                           style="font-size:11px" onchange="SparqlEditor._syncAndSave()">
                </div>
                <div style="margin-top:4px">
                    <span class="cls-editor-meta">COMMENT</span>
                    <textarea id="sq-comment" rows="2" placeholder="Comment"
                              class="cls-id-inp"
                              style="width:100%;margin-top:4px;resize:vertical;font-size:11px;
                                     border:1px solid var(--border2);border-radius:3px;
                                     padding:4px 6px;box-sizing:border-box;background:var(--bg3)"
                              onchange="SparqlEditor._syncAndSave()">${(q.comment||'').replace(/</g,'&lt;')}</textarea>
                </div>
            </div>

            <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column;min-height:0">

                <!-- ── WHERE ── -->
                <div class="swrl-cond-bar swrl-cond-bar-if"
                     style="justify-content:space-between;flex-shrink:0">
                    <span style="font-size:12px;font-weight:700;color:var(--accent3);
                                 font-family:var(--font-mono);letter-spacing:.04em">WHERE</span>
                    <div style="display:flex;gap:4px">
                        <button class="btn-sm" style="font-size:11px"
                                onclick="SparqlEditor.addPattern('triple')"
                                title="Add triple pattern">＋ Triple</button>
                        <button class="btn-sm" style="font-size:11px"
                                onclick="SparqlEditor.addPattern('filter')"
                                title="Add FILTER">＋ Filter</button>
                        <button class="btn-sm" style="font-size:11px"
                                onclick="SparqlEditor.addPattern('optional')"
                                title="Add OPTIONAL block">＋ Optional</button>
                    </div>
                </div>

                <div id="sq-patterns"
                     style="display:flex;flex-direction:column;gap:5px;padding:8px;flex-shrink:0">
                    ${patterns || `
                    <div style="padding:16px;text-align:center;color:var(--text-dim);font-size:12px;
                                border:1px dashed var(--border);border-radius:6px">
                        Click <b>＋ Triple</b> to add your first triple
                    </div>`}
                </div>

                <!-- ── Options ── -->
                <div class="swrl-cond-bar"
                     style="background:rgba(59,130,246,.05);border-top:1px solid var(--border);
                            border-bottom:1px solid var(--border);flex-shrink:0;
                            justify-content:space-between;flex-wrap:wrap;gap:8px">
                    <span style="font-size:12px;font-weight:700;color:var(--accent);
                                 font-family:var(--font-mono);letter-spacing:.04em">OPTIONS</span>
                    <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
                        <label style="display:flex;align-items:center;gap:5px;font-size:11px;
                                      cursor:pointer;user-select:none">
                            <input type="checkbox" id="sq-distinct" ${q.distinct ? 'checked' : ''}
                                   style="accent-color:var(--accent)"
                                   onchange="SparqlEditor._syncAndSave()">
                            DISTINCT
                        </label>
                        <label style="display:flex;align-items:center;gap:5px;font-size:11px">
                            ORDER BY
                            <input type="text" id="sq-orderby" value="${q.order_by || ''}"
                                   placeholder="?var" list="sq-vars-list"
                                   class="cls-id-inp" style="width:75px;font-size:11px;
                                   font-family:var(--font-mono)"
                                   onchange="SparqlEditor._syncAndSave()">
                            <select id="sq-orderdir"
                                    style="font-size:11px;background:var(--bg3);color:var(--text1);
                                           border:1px solid var(--border);border-radius:3px;padding:1px 3px"
                                    onchange="SparqlEditor._syncAndSave()">
                                <option value="ASC"  ${q.order_dir === 'ASC'  ? 'selected' : ''}>ASC</option>
                                <option value="DESC" ${q.order_dir === 'DESC' ? 'selected' : ''}>DESC</option>
                            </select>
                        </label>
                        <label style="display:flex;align-items:center;gap:5px;font-size:11px">
                            LIMIT
                            <input type="number" id="sq-limit" value="${q.limit || 100}"
                                   min="1" max="100000" class="cls-id-inp"
                                   style="width:70px;font-size:11px"
                                   onchange="SparqlEditor._syncAndSave()">
                        </label>
                    </div>
                </div>

                <!-- ── SPARQL preview ── -->
                <div style="border-top:1px solid var(--border);flex-shrink:0">
                    <div style="display:flex;align-items:center;justify-content:space-between;
                                padding:5px 12px;background:var(--bg3);cursor:pointer;
                                border-bottom:1px solid var(--border)"
                         onclick="SparqlEditor._toggleSparql()">
                        <span style="font-size:11px;font-weight:700;font-family:var(--font-mono);
                                     color:var(--accent);letter-spacing:.04em">SPARQL</span>
                        <span id="sq-sparql-toggle"
                              style="font-size:11px;color:var(--text-dim)">
                            ${this._showSparql ? '▲ Hide' : '▼ Show'}
                        </span>
                    </div>
                    <div id="sq-sparql-wrap"
                         style="display:${this._showSparql ? 'block' : 'none'}">
                        <pre id="sq-sparql-preview"
                             style="margin:0;padding:12px 14px;font-family:var(--font-mono);
                                    font-size:11px;background:var(--bg2);color:var(--text1);
                                    overflow-x:auto;line-height:1.65;white-space:pre">${this._esc(sparql)}</pre>
                    </div>
                </div>

                <!-- ── Run ── -->
                <div style="padding:8px 12px;border-top:1px solid var(--border);
                            display:flex;align-items:center;gap:10px;flex-shrink:0;background:var(--bg2)">
                    <button class="btn-primary" style="padding:5px 18px;font-size:13px"
                            onclick="SparqlEditor.runQuery()">▶ Run</button>
                    <span id="sq-status" style="font-size:11px;color:var(--text-dim)"></span>
                </div>

                <!-- ── Results ── -->
                <div id="sq-results" style="padding:0 12px 16px;flex-shrink:0"></div>

            </div>
        </div>`;
    },

    // ── Pattern rendering ─────────────────────────────────────────────
    _renderPattern(p, idx) {
        const delBtn = `
            <button class="btn-icon btn-icon-danger" style="flex-shrink:0;padding:2px 5px;margin-left:2px"
                    onclick="SparqlEditor.deletePattern(${JSON.stringify(idx)})"
                    title="Delete">✕</button>`;

        // Poignée de réordonnancement (comme les atomes SWRL)
        const _isNested = Array.isArray(idx);
        const _listKey  = _isNested ? `opt-${idx[0]}` : 'root';
        const _pos      = _isNested ? idx[1] : idx;
        const handle    = `<span class="sparql-drag-handle" title="Drag to reorder" draggable="true"
                ondragstart="event.stopPropagation();SparqlEditor._patDragStart(event,'${_listKey}',${_pos})"
                ondragend="SparqlEditor._patDragEnd()">⠿</span>`;
        const dragAttrs = `data-patkey="${_listKey}-${_pos}"
                ondragover="SparqlEditor._patDragOver(event,this,'${_listKey}')"
                ondragleave="SparqlEditor._patDragLeave(this)"
                ondrop="event.preventDefault();event.stopPropagation();SparqlEditor._patDrop(event,'${_listKey}',${_pos})"`;

        // ── FILTER ──
        if (p.type === 'filter') {
            return `
            <div class="sparql-pat-row" ${dragAttrs}>
                ${handle}
                <span class="sparql-pat-keyword">FILTER</span>
                <span style="color:var(--text-dim);font-size:13px;flex-shrink:0">(</span>
                <input type="text" class="cls-id-inp sparql-filter-expr"
                       value="${this._esc(p.expr || '')}"
                       placeholder="e.g.  ?age > 18  or  BOUND(?x)"
                       style="flex:1;font-family:var(--font-mono);font-size:11px"
                       oninput="SparqlEditor._onPatField(${JSON.stringify(idx)},'expr',this.value)">
                <span style="color:var(--text-dim);font-size:13px;flex-shrink:0">)</span>
                ${delBtn}
            </div>`;
        }

        // ── OPTIONAL ──
        if (p.type === 'optional') {
            const inner = (p.patterns || []).map((ip, ii) =>
                this._renderPattern(ip, [idx, ii])
            ).join('');
            return `
            <div class="sparql-pat-optional" ${dragAttrs}>
                <div class="sparql-opt-header">
                    ${handle}
                    <span class="sparql-pat-keyword" style="color:var(--purple)">OPTIONAL</span>
                    <div style="display:flex;gap:4px;margin-left:auto">
                        <button class="btn-sm" style="font-size:10px"
                                onclick="SparqlEditor._addInner(${idx},'triple')">＋ Triple</button>
                        <button class="btn-sm" style="font-size:10px"
                                onclick="SparqlEditor._addInner(${idx},'filter')">＋ Filter</button>
                    </div>
                    ${delBtn}
                </div>
                <div class="sparql-opt-body">
                    ${inner || `<div style="color:var(--text-dim);font-size:11px;padding:4px 8px;
                                            font-style:italic">OPTIONAL block empty</div>`}
                </div>
            </div>`;
        }

        // ── TRIPLE ──
        const _idxKey    = Array.isArray(idx) ? idx.join('-') : idx;
        const _predDdId  = 'sqdd-p-'    + _idxKey;
        const _predChip  = 'sqchip-p-'  + _idxKey;
        const _predEd    = 'sqed-p-'    + _idxKey;
        const _subjChip  = 'sqchip-s-'  + _idxKey;
        const _subjEd    = 'sqed-s-'    + _idxKey;

        const subjectField = this._atomFieldText(
            p.subject || '', _subjChip, _subjEd, idx, 'subject', '?var', '95px');

        const predDropdown = this._ddBuild(
            _predDdId, p.predicate, this._predGroups(),
            'pred', JSON.stringify(idx), 'max-width:220px');
        const predField = this._atomFieldDd(
            p.predicate, _predChip, _predEd, _predDdId, predDropdown);

        const objField = this._objectField(p, idx);

        return `
        <div class="sparql-pat-row" ${dragAttrs}>
            ${handle}
            ${subjectField}
            <span class="sparql-pat-dot">·</span>
            ${predField}
            <span class="sparql-pat-dot">·</span>
            ${objField}
            ${delBtn}
        </div>`;
    },


    _objectField(p, idx) {
        const _idxKey  = Array.isArray(idx) ? idx.join('-') : idx;
        const _objChip = 'sqchip-o-' + _idxKey;
        const _objEd   = 'sqed-o-'   + _idxKey;

        // rdf:type → picker de classe homogène (.cls-tree-picker + filtre, comme SWRL & autres onglets)
        if (p.predicate === 'rdf:type') {
            const _pickId = 'sqclspick-' + _idxKey;
            return `<span class="sq-atom-chip" style="cursor:pointer"
                          title="Click to select a class"
                          onclick="event.stopPropagation();SparqlEditor._toggleClsPicker('${_pickId}',${JSON.stringify(idx)},this)">${this._atomChipHtml(p.object)}</span
                   ><div id="${_pickId}" class="cls-tree-picker" style="display:none">
                        ${_classTreePickerItems('SparqlEditor._pickType')}
                   </div>`;
        }

        // rdfs:label / rdfs:comment / DP → littéral ou variable, pleine largeur
        const dps = new Set((APP.state?.datatype_properties || []).map(dp => dp.id));
        const isLiteralPred = p.predicate === 'rdfs:label'
                           || p.predicate === 'rdfs:comment'
                           || dps.has(p.predicate);
        if (isLiteralPred) {
            return this._atomFieldText(
                p.object || '', _objChip, _objEd, idx, 'object', '?var or literal value', '1', true);
        }

        // OP / annotation / inconnu → variable ou individual
        return this._atomFieldText(
            p.object || '', _objChip, _objEd, idx, 'object', '?var ou IRI', '95px');
    },

    // ── Pattern operations ─────────────────────────────────────────────
    addPattern(type) {
        this._sync();
        const q = this._editingQuery;
        if (!q) return;
        q.patterns.push(this._newPat(type));
        this._saveEditing();
        this._renderDetail();
    },

    _addInner(outerIdx, type) {
        this._sync();
        const q = this._editingQuery;
        const outer = q?.patterns[outerIdx];
        if (!outer || outer.type !== 'optional') return;
        outer.patterns = outer.patterns || [];
        outer.patterns.push(this._newPat(type));
        this._saveEditing();
        this._renderDetail();
    },

    _newPat(type) {
        if (type === 'triple')   return { type: 'triple',   subject: '?x', predicate: 'rdf:type', object: '' };
        if (type === 'filter')   return { type: 'filter',   expr: '' };
        if (type === 'optional') return { type: 'optional', patterns: [] };
        return { type: 'triple', subject: '?x', predicate: '', object: '' };
    },

    deletePattern(idx) {
        this._sync();
        const q = this._editingQuery;
        if (!q) return;
        if (Array.isArray(idx)) {
            const [oi, ii] = idx;
            q.patterns[oi]?.patterns?.splice(ii, 1);
        } else {
            q.patterns.splice(Number(idx), 1);
        }
        this._saveEditing();
        this._renderDetail();
    },

    // ── Réordonnancement des triples par glisser-déposer ───────────────
    _dragPat: { listKey: null, fromIdx: null },

    /** Liste de patterns ciblée par une clé : 'root' = q.patterns ; 'opt-N' = OPTIONAL N. */
    _patternList(listKey) {
        const q = this._editingQuery;
        if (!q) return null;
        if (listKey === 'root') return q.patterns;
        const m = /^opt-(\d+)$/.exec(listKey);
        if (m) return q.patterns[parseInt(m[1])]?.patterns || null;
        return null;
    },

    _patDragStart(event, listKey, pos) {
        this._dragPat = { listKey, fromIdx: parseInt(pos) };
        event.dataTransfer.effectAllowed = 'move';
        const row = event.target.closest('[data-patkey]');
        if (row) {
            event.dataTransfer.setDragImage(row, 0, 0);
            setTimeout(() => row.classList.add('sparql-pat-dragging'), 0);
        }
    },

    _patDragOver(event, el, listKey) {
        if (!this._dragPat?.listKey || this._dragPat.listKey !== listKey) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        document.querySelectorAll('.sparql-pat-drag-target').forEach(e => e.classList.remove('sparql-pat-drag-target'));
        el.classList.add('sparql-pat-drag-target');
    },

    _patDragLeave(el) { el.classList.remove('sparql-pat-drag-target'); },

    _patDrop(event, listKey, toPos) {
        document.querySelectorAll('.sparql-pat-drag-target').forEach(e => e.classList.remove('sparql-pat-drag-target'));
        const { listKey: fromKey, fromIdx } = this._dragPat;
        this._dragPat = { listKey: null, fromIdx: null };
        if (fromKey == null || fromKey !== listKey) return;
        toPos = parseInt(toPos);
        if (fromIdx === toPos) return;
        const arr = this._patternList(listKey);
        if (!Array.isArray(arr)) return;
        const [item] = arr.splice(fromIdx, 1);
        arr.splice(toPos, 0, item);
        this._saveEditing();
        this._renderDetail();
    },

    _patDragEnd() {
        this._dragPat = { listKey: null, fromIdx: null };
        document.querySelectorAll('.sparql-pat-drag-target').forEach(e => e.classList.remove('sparql-pat-drag-target'));
        document.querySelectorAll('.sparql-pat-dragging').forEach(e => e.classList.remove('sparql-pat-dragging'));
    },

    // ── Field change handlers ──────────────────────────────────────────
    _onPatField(idx, field, val) {
        const p = this._getPat(idx);
        if (p) p[field] = val;
        this._saveEditing();
        this._refreshSparqlPreview();
    },

    _onPredicateChange(idx, val) {
        const p = this._getPat(idx);
        if (!p) return;
        const prev = p.predicate;
        p.predicate = val;
        // Reset object only when switching to/from rdf:type
        if (val === 'rdf:type' && prev !== 'rdf:type') p.object = '';
        if (val !== 'rdf:type' && prev === 'rdf:type') p.object = '?y';
        this._saveEditing();
        this._renderDetail();   // re-render to swap object field type
    },

    _getPat(idx) {
        const q = this._editingQuery;
        if (!q) return null;
        if (Array.isArray(idx)) {
            const [oi, ii] = idx;
            return q.patterns[oi]?.patterns?.[ii] || null;
        }
        return q.patterns[Number(idx)] || null;
    },

    _onIdChange(val) {
        const old = this._editingQuery?.id;
        if (!val || val === old) return;
        const all = APP.state.queries || [];
        const entry = all.find(q => q.id === old);
        if (entry) {
            const oldId = entry.id;
            entry.id = val;
            this._editingQuery.id = val;
            this._selectedId = val;
            API.updateQuery(oldId, entry).catch(() => {});
            this._refreshList();
        }
    },

    // ── Sync form → model ──────────────────────────────────────────────
    _sync() {
        const q = this._editingQuery;
        if (!q) return;
        const g = id => document.getElementById(id);
        if (g('sq-id'))       q.id        = g('sq-id').value.trim()  || q.id;
        if (g('sq-label'))    q.label     = g('sq-label').value;
        if (g('sq-comment'))  q.comment   = g('sq-comment').value;
        if (g('sq-distinct')) q.distinct  = g('sq-distinct').checked;
        if (g('sq-orderby'))  q.order_by  = g('sq-orderby').value.trim();
        if (g('sq-orderdir')) q.order_dir = g('sq-orderdir').value;
        if (g('sq-limit'))    q.limit     = parseInt(g('sq-limit').value) || 100;
    },

    _syncAndSave() {
        this._sync();
        this._saveEditing();
        this._refreshList();
        this._refreshSparqlPreview();
    },

    _refreshSparqlPreview() {
        const el = document.getElementById('sq-sparql-preview');
        if (el && this._editingQuery) {
            this._sync();
            el.textContent = this._buildSparql(this._editingQuery);
        }
    },

    _toggleSparql() {
        this._showSparql = !this._showSparql;
        const wrap = document.getElementById('sq-sparql-wrap');
        const btn  = document.getElementById('sq-sparql-toggle');
        if (wrap) wrap.style.display = this._showSparql ? 'block' : 'none';
        if (btn)  btn.textContent    = this._showSparql ? '▲ Hide' : '▼ Show';
        if (this._showSparql) this._refreshSparqlPreview();
    },

    // ── SPARQL generation ──────────────────────────────────────────────
    _buildSparql(q) {
        if (!q) return '';
        const onto    = APP.state?.ontology;
        const pfxName = onto?.prefix || 'ex';
        const pfxUri  = onto?.id     || '';   // OWLOntology.id = base IRI

        const iriOf = id => {
            if (!id || id === '')              return '[]';
            if (id.startsWith('?'))            return id;
            if (id.startsWith('<'))            return id;
            if (id.startsWith('http://') ||
                id.startsWith('https://'))     return `<${id}>`;
            if (id.includes(':'))              return id;   // already prefixed
            return pfxUri ? `${pfxName}:${id}` : `<${id}>`;
        };

        // Prédicats dont l'objet est un littéral (pas une IRI)
        const dpIds = new Set((APP.state?.datatype_properties || []).map(p => p.id));
        const isLiteralPred = pred =>
            pred === 'rdfs:label' || pred === 'rdfs:comment' || dpIds.has(pred);

        let _litVarIdx = 0;  // compteur pour variables intermédiaires

        const patToLines = (pats, indent) => {
            return (pats || []).flatMap(p => {
                if (p.type === 'triple') {
                    if (!p.predicate) return [];
                    const s  = iriOf(p.subject || '?x');
                    const pr = p.predicate === 'rdf:type'     ? 'a'
                             : p.predicate === 'rdfs:label'   ? 'rdfs:label'
                             : p.predicate === 'rdfs:comment' ? 'rdfs:comment'
                             : iriOf(p.predicate);
                    const rawObj = p.object || (p.predicate === 'rdf:type' ? 'owl:Thing' : '?o');

                    // Objet littéral non-variable : FILTER(STR(?_v) = "valeur")
                    // pour matcher indépendamment de la langue (@fr, @en…)
                    if (isLiteralPred(p.predicate) && rawObj && !rawObj.startsWith('?')
                            && !rawObj.startsWith('"') && !rawObj.startsWith("'")) {
                        const litVar = `?_lv${_litVarIdx++}`;
                        return [
                            `${indent}${s} ${pr} ${litVar} .`,
                            `${indent}FILTER ( STR(${litVar}) = "${rawObj.replace(/"/g,'\\"')}" )`
                        ];
                    }

                    // Objet : variable, déjà quoté, ou IRI
                    const ob = rawObj.startsWith('?')
                        ? rawObj
                        : (rawObj.startsWith('"') || rawObj.startsWith("'"))
                        ? rawObj
                        : iriOf(rawObj);
                    return [`${indent}${s} ${pr} ${ob} .`];
                }
                if (p.type === 'filter') {
                    return p.expr ? [`${indent}FILTER ( ${p.expr} )`] : [];
                }
                if (p.type === 'optional') {
                    const inner = patToLines(p.patterns, indent + '  ');
                    if (!inner.length) return [`${indent}OPTIONAL { }`];
                    return [`${indent}OPTIONAL {`, ...inner, `${indent}}`];
                }
                return [];
            });
        };

        const whereLines = patToLines(q.patterns, '  ');
        const vars       = [...this._collectVars(q.patterns)];
        const selectVars = vars.length ? vars.join(' ') : '*';

        const prefixes = [
            'PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>',
            'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>',
            'PREFIX owl:  <http://www.w3.org/2002/07/owl#>',
            pfxUri
                ? `PREFIX ${pfxName}: <${pfxUri}${pfxUri.match(/[#/]$/) ? '' : '#'}>`
                : null,
        ].filter(Boolean).join('\n');

        const select  = `SELECT ${q.distinct ? 'DISTINCT ' : ''}${selectVars}`;
        const where   = `WHERE {\n${whereLines.join('\n') || '  # aucun triplet'}\n}`;
        const orderBy = q.order_by ? `ORDER BY ${q.order_dir || 'ASC'}(${q.order_by})` : '';
        const limit   = q.limit    ? `LIMIT ${q.limit}` : '';

        return [prefixes, '', select, where, orderBy, limit]
            .filter(x => x !== '')
            .join('\n')
            .trimEnd();
    },

    _collectVars(patterns) {
        const vars = new Set();
        const walk = (pats) => (pats || []).forEach(p => {
            if (p.type === 'triple') {
                if (p.subject?.startsWith('?')) vars.add(p.subject);
                if (p.object?.startsWith('?'))  vars.add(p.object);
            }
            if (p.type === 'optional') walk(p.patterns);
        });
        walk(patterns);
        return vars;
    },

    // ── Execution ──────────────────────────────────────────────────────
    async runQuery() {
        this._sync();
        const sparql  = this._buildSparql(this._editingQuery);
        const status  = document.getElementById('sq-status');
        const results = document.getElementById('sq-results');
        if (status)  status.innerHTML  = '<span style="font-style:italic">Running…</span>';
        if (results) results.innerHTML = '';

        // Auto-show SPARQL preview
        if (!this._showSparql) this._toggleSparql();
        this._refreshSparqlPreview();

        try {
            const res = await fetch('/api/sparql', {
                method:  'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body:    'query=' + encodeURIComponent(sparql),
            });
            if (!res.ok) throw new Error(await res.text());
            const data     = await res.json();
            const vars     = data.head?.vars    || [];
            const bindings = data.results?.bindings || [];
            if (status) status.textContent = `${bindings.length} result(s)`;
            if (results) results.innerHTML = this._renderResults(vars, bindings);
        } catch(e) {
            if (status)  status.textContent = '';
            if (results) results.innerHTML =
                `<p style="color:#f87171;font-size:12px;padding:8px 0">⚠ ${this._esc(e.message)}</p>`;
        }
    },

    // ── Entity navigation ─────────────────────────────────────────────
    _resolveEntity(uri) {
        // Returns {section, fn, dot, displayName, entityId} or null
        const local = uri.split(/[#/]/).pop() || uri;
        const s = APP.state || {};

        const _dispLabel = (entity) => {
            // Returns a display name only when it differs from the id
            const lbl = entity.label;
            return (lbl && lbl !== entity.id) ? lbl : null;
        };

        let e;
        if ((e = (s.classes || []).find(x => x.id === local)))
            return { section: 'classes',               fn: () => ClassEditor.selectClass(local),           dot: 'cls-dot',       displayName: _dispLabel(e), entityId: local };
        if ((e = (s.individuals || []).find(x => x.id === local))) {
            // Ensure display rules are loaded
            if (!Object.keys(IndividualEditor._displayProps || {}).length &&
                !Object.keys(IndividualEditor._displayPropsMulti || {}).length)
                IndividualEditor._loadDisplayRules?.();
            const dispName = IndividualEditor._resolveDisplayLabel(e, null) || null;
            return { section: 'individuals',           fn: () => IndividualEditor.focusIndividual(local),  dot: 'xsd-dot',       displayName: dispName !== local ? dispName : null, entityId: local };
        }
        if ((e = (s.object_properties || []).find(x => x.id === local)))
            return { section: 'object-properties',     fn: () => OPEditor.selectProp(local),               dot: 'op-prop-dot',   displayName: _dispLabel(e), entityId: local };
        if ((e = (s.datatype_properties || []).find(x => x.id === local)))
            return { section: 'datatype-properties',   fn: () => DPEditor.selectProp(local),               dot: 'dp-prop-dot',   displayName: _dispLabel(e), entityId: local };
        if ((e = (s.annotation_properties || []).find(x => x.id === local)))
            return { section: 'annotation-properties', fn: () => APEditor.selectProp(local),               dot: 'anno-prop-dot', displayName: _dispLabel(e), entityId: local };
        return null;
    },

    // ── Custom icon-dropdown ───────────────────────────────────────────
    // groups = [{label?, items:[{value, label, dotClass?, depth?}]}]
    // depth > 0 → tree indentation in the list
    _ddBuild(ddId, curVal, groups, cbName, idxJson, style) {
        const allItems = groups.flatMap(g => g.items || []);
        const cur = allItems.find(i => i.value === curVal) || null;
        const curDot = cur?.dotClass
            ? `<span class="${cur.dotClass}" style="flex-shrink:0"></span>`
            : `<span style="display:inline-block;width:8px;flex-shrink:0"></span>`;
        const curLbl = cur
            ? `<span>${this._esc(cur.label)}</span>`
            : `<span class="sq-dd-placeholder">— choose —</span>`;

        const rows = groups.map(g => {
            const hdr = g.label
                ? `<div class="sq-dd-grp">${this._esc(g.label)}</div>` : '';
            const items = (g.items || []).map(item => {
                const depth = item.depth || 0;
                const dot = item.dotClass
                    ? `<span class="${item.dotClass}" style="flex-shrink:0"></span>`
                    : '';
                const leaf = depth > 0 ? `<span class="tree-leaf">◦</span>` : '';
                const active = item.value === curVal ? ' selected' : '';
                return `<div class="tree-item${active}"
                              data-value="${this._esc(item.value)}"
                              style="padding-left:${depth * 16 + 6}px">
                            ${leaf}${dot}<span class="tree-label">${this._esc(item.label)}</span>
                        </div>`;
            }).join('');
            return hdr + items;
        }).join('');

        return `<div id="${ddId}" class="sq-dropdown" tabindex="-1" style="${style||''}"
                     onclick="SparqlEditor._ddToggle('${ddId}')"
                     onblur="SparqlEditor._ddClose('${ddId}')">
                    <div class="sq-dd-face">
                        ${curDot}${curLbl}
                        <span class="sq-dd-arrow" style="margin-left:auto">▾</span>
                    </div>
                    <div class="sq-dd-list"
                         onmousedown="event.preventDefault()"
                         onclick="event.stopPropagation();SparqlEditor._ddListClick('${ddId}',event,'${cbName}',${idxJson})">${rows}</div>
                </div>`;
    },

    // ── Class tree dropdown (same visual style as ClassEditor / SWRL) ─
    _buildClsDd(ddId, curVal, classes, idxJson) {
        // Build children map (same logic as ClassEditor._buildTree)
        const allIds = new Set(classes.map(c => c.id));
        const childrenOf = {};
        classes.forEach(c => { childrenOf[c.id] = []; });
        const hasKnownParent = new Set();
        classes.forEach(c => {
            (c.subClassOf || []).filter(s => typeof s === 'string' && allIds.has(s)).forEach(p => {
                hasKnownParent.add(c.id);
                if (!childrenOf[p].includes(c.id)) childrenOf[p].push(c.id);
            });
        });
        const alpha = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });
        Object.keys(childrenOf).forEach(id => childrenOf[id].sort(alpha));
        const roots = classes.filter(c => !hasKnownParent.has(c.id)).map(c => c.id).sort(alpha);

        // DFS → array of tree-item HTML rows (same style as ClassEditor/SWRL)
        const rows = [];
        const visited = new Set();

        // owl:Thing pseudo-root
        rows.push(`<div class="tree-item" data-value="" style="padding-left:6px;font-style:italic">
            <span class="cls-dot tree-thing-dot"></span>
            <span class="tree-label">owl:Thing</span>
        </div>`);

        const walk = (id, depth) => {
            if (visited.has(id)) return;
            visited.add(id);
            const cls = classes.find(c => c.id === id);
            if (!cls) return;
            const active = id === curVal ? ' selected' : '';
            rows.push(`<div class="tree-item${active}" data-value="${id}"
                            style="padding-left:${depth * 16 + 6}px">
                            <span class="tree-leaf">◦</span>
                            <span class="cls-dot tree-cls-dot"></span>
                            <span class="tree-label">${this._esc(cls.label || cls.id)}</span>
                        </div>`);
            (childrenOf[id] || []).forEach(c => walk(c, depth + 1));
        };
        roots.forEach(r => walk(r, 1));
        // Orphans (circular / external parents)
        classes.forEach(c => { if (!visited.has(c.id)) walk(c.id, 1); });

        // Face of the dropdown (current selection)
        const curCls = classes.find(c => c.id === curVal);
        const curDot  = `<span class="cls-dot" style="flex-shrink:0"></span>`;
        const curLbl  = curCls
            ? `<span>${this._esc(curCls.label || curCls.id)}</span>`
            : `<span class="sq-dd-placeholder">— classe —</span>`;

        return `<div id="${ddId}" class="sq-dropdown" tabindex="-1" style="max-width:240px"
                     onclick="SparqlEditor._ddToggle('${ddId}')"
                     onblur="SparqlEditor._ddClose('${ddId}')">
                    <div class="sq-dd-face">
                        ${curDot}${curLbl}
                        <span class="sq-dd-arrow" style="margin-left:auto">▾</span>
                    </div>
                    <div class="sq-dd-list" style="padding:4px 0"
                         onmousedown="event.preventDefault()"
                         onclick="event.stopPropagation();SparqlEditor._ddListClick('${ddId}',event,'obj',${idxJson})">
                        ${rows.join('')}
                    </div>
                </div>`;
    },

    // ── Picker de classe homogène (.cls-tree-picker + filtre) pour rdf:type ─────
    _toggleClsPicker(pickerId, idx, btn) {
        this._clsPickIdx = idx;
        document.querySelectorAll('[id^="sqclspick-"]').forEach(p => { if (p.id !== pickerId) p.style.display = 'none'; });
        const el = document.getElementById(pickerId);
        if (!el) return;
        if (el.style.display !== 'none') { el.style.display = 'none'; return; }
        const r = btn.getBoundingClientRect();
        el.style.position  = 'fixed';
        el.style.left      = Math.max(8, Math.min(r.left, window.innerWidth - 300)) + 'px';
        el.style.top       = (r.bottom + 2) + 'px';
        el.style.maxHeight = Math.max(160, window.innerHeight - r.bottom - 12) + 'px';
        el.style.minWidth  = '200px';
        el.style.maxWidth  = '440px';
        el.style.zIndex    = '9000';
        el.style.display   = '';
        _decoratePickerWithFilter(el);   // filtre + liste scrollable
        setTimeout(() => document.addEventListener('click', function close(e) {
            if (!el.contains(e.target) && e.target !== btn) {
                el.style.display = 'none';
                document.removeEventListener('click', close, true);
            }
        }, true), 0);
    },

    /** Sélection d'une classe dans le picker rdf:type. */
    _pickType(classId) {
        const idx = this._clsPickIdx;
        document.querySelectorAll('[id^="sqclspick-"]').forEach(p => p.style.display = 'none');
        this._clsPickIdx = null;
        if (idx == null) return;
        const p = this._getPat(idx);
        if (p) p.object = classId;
        this._saveEditing();
        this._renderDetail();
    },

    _ddToggle(id) {
        const el = document.getElementById(id);
        if (!el) return;
        const wasOpen = el.classList.contains('sq-dd-open');
        // Close all other open dropdowns first
        document.querySelectorAll('.sq-dropdown.sq-dd-open').forEach(d => d.classList.remove('sq-dd-open'));
        if (!wasOpen) { el.classList.add('sq-dd-open'); el.focus(); }
    },

    _ddClose(id) {
        // Small delay so onmousedown on items fires before blur
        setTimeout(() => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('sq-dd-open');
        }, 120);
    },

    // Délégation d'événement depuis la liste — trouve l'item [data-value] cliqué
    _ddListClick(ddId, event, cbName, idx) {
        try {
            const item = event.target.closest('[data-value]');
            if (!item) return;
            const val = item.dataset.value;
            document.getElementById(ddId)?.classList.remove('sq-dd-open');
            if (cbName === 'pred') {
                this._onPredicateChange(idx, val);          // already calls _renderDetail
            } else if (cbName === 'obj') {
                this._onPatField(idx, 'object', val);
                this._renderDetail();                       // met à jour la face du dropdown
            }
        } catch (err) {
            console.error('[SPARQL] _ddListClick ERROR', err);
        }
    },

    _ddPick(ddId, el, cbName, idx) {  // conservé pour compatibilité éventuelle
        const val = el.dataset?.value ?? '';
        document.getElementById(ddId)?.classList.remove('sq-dd-open');
        if (cbName === 'pred') this._onPredicateChange(idx, val);
        else if (cbName === 'obj') { this._onPatField(idx, 'object', val); this._renderDetail(); }
    },

    // ── Predicate groups (for icon-dropdown) ──────────────────────────

    // Builds a flat DFS-ordered list of property items respecting subPropertyOf hierarchy.
    // props    = array of property objects (each has .id, .label, .subPropertyOf)
    // dotClass = CSS class for the icon dot
    _propTreeItems(props, dotClass) {
        const allIds = new Set(props.map(p => p.id));
        const childrenOf = {};
        props.forEach(p => { childrenOf[p.id] = []; });
        const hasParent = new Set();
        props.forEach(p => {
            (p.subPropertyOf || []).filter(s => allIds.has(s)).forEach(par => {
                hasParent.add(p.id);
                if (!childrenOf[par].includes(p.id)) childrenOf[par].push(p.id);
            });
        });
        const alpha = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' });
        Object.keys(childrenOf).forEach(id => childrenOf[id].sort(alpha));
        const roots = props.filter(p => !hasParent.has(p.id)).map(p => p.id).sort(alpha);

        const result = [];
        const visited = new Set();
        const walk = (id, depth) => {
            if (visited.has(id)) return;
            visited.add(id);
            const p = props.find(x => x.id === id);
            if (!p) return;
            result.push({ value: p.id, label: p.label || p.id, dotClass, depth });
            (childrenOf[id] || []).forEach(c => walk(c, depth + 1));
        };
        roots.forEach(r => walk(r, 0));
        // orphans
        props.forEach(p => { if (!visited.has(p.id)) result.push({ value: p.id, label: p.label || p.id, dotClass, depth: 0 }); });
        return result;
    },

    _predGroups() {
        const ops = APP.state?.object_properties     || [];
        const dps = APP.state?.datatype_properties   || [];
        const aps = APP.state?.annotation_properties || [];
        const builtinAPs = [
            { value: 'rdfs:label',   label: 'rdfs:label',   dotClass: 'anno-prop-dot', depth: 0 },
            { value: 'rdfs:comment', label: 'rdfs:comment', dotClass: 'anno-prop-dot', depth: 0 },
        ];
        const allAPs = [...builtinAPs, ...this._propTreeItems(aps, 'anno-prop-dot')];
        return [
            { label: 'Classes', items: [
                { value: 'rdf:type', label: 'rdf:type', dotClass: 'cls-dot', depth: 0 },
            ]},
            ...(ops.length ? [{ label: 'Object Properties',   items: this._propTreeItems(ops, 'op-prop-dot') }] : []),
            ...(dps.length ? [{ label: 'Datatype Properties', items: this._propTreeItems(dps, 'dp-prop-dot') }] : []),
            { label: 'Annotation Properties', items: allAPs },
        ];
    },

    // ── Atom chip helpers (left-click = navigate, right-click = edit) ─────

    _openAtomEditor: null,
    _atomOutsideHandler: null,

    // Chip displaying the current value of a field
    _atomChipHtml(value) {
        if (!value) return `<span class="sq-atom-placeholder">—</span>`;
        const isVar = value.startsWith('?');
        if (isVar) return `<span class="sq-atom-var">${this._esc(value)}</span>`;
        const entity = this._resolveEntity(value);
        if (entity) {
            const lbl = entity.displayName || entity.entityId;
            return `<span class="${entity.dot}" style="flex-shrink:0"></span>`
                 + `<span class="sq-atom-lbl">${this._esc(lbl)}</span>`;
        }
        return `<span class="sq-atom-lbl">${this._esc(value)}</span>`;
    },

    // Chip + hidden text input
    _atomFieldText(value, chipId, edId, idx, field, placeholder, width, flex) {
        const entity  = value && !value.startsWith('?') ? this._resolveEntity(value) : null;
        const navAttr = entity
            ? `onclick="SparqlEditor.navigateToEntity('${this._esc(value)}')" `
            : `onclick="" `;
        const navCls  = entity ? ' sq-atom-nav' : '';
        const wStyle  = flex ? `flex:1` : `width:${width}`;
        return `<span class="sq-atom-chip${navCls}" id="${chipId}"
                      ${navAttr}
                      oncontextmenu="SparqlEditor._atomEdit('${chipId}','${edId}',null,event)"
                      title="Right-click to edit">${this._atomChipHtml(value)}</span
               ><input id="${edId}" type="text" class="cls-id-inp"
                       style="display:none;${wStyle};font-family:var(--font-mono);font-size:11px;flex-shrink:0"
                       value="${this._esc(value)}"
                       placeholder="${this._esc(placeholder)}"
                       list="sq-vars-list"
                       oninput="SparqlEditor._onPatField(${JSON.stringify(idx)},'${field}',this.value)"
                       onblur="SparqlEditor._atomEditClose('${chipId}','${edId}')"
                       onkeydown="if(event.key==='Escape'||event.key==='Enter'){event.preventDefault();SparqlEditor._atomEditClose('${chipId}','${edId}')}">`;
    },

    // Chip + hidden dropdown (predicate or class)
    _atomFieldDd(value, chipId, edId, ddId, ddHtml) {
        const entity  = value && !value.startsWith('?') && value !== 'rdf:type'
                        && value !== 'rdfs:label' && value !== 'rdfs:comment'
                        ? this._resolveEntity(value) : null;
        const navAttr = entity
            ? `onclick="SparqlEditor.navigateToEntity('${this._esc(value)}')" `
            : `onclick="" `;
        const navCls  = entity ? ' sq-atom-nav' : '';
        return `<span class="sq-atom-chip${navCls}" id="${chipId}"
                      ${navAttr}
                      oncontextmenu="SparqlEditor._atomEdit('${chipId}','${edId}','${ddId}',event)"
                      title="Right-click to edit">${this._atomChipHtml(value)}</span
               ><span id="${edId}" style="display:none">${ddHtml}</span>`;
    },

    // Open atom editor on right-click
    _atomEdit(chipId, edId, ddId, event) {
        event.preventDefault();
        event.stopPropagation();
        // Close previous editor if any
        if (this._openAtomEditor) {
            const o = this._openAtomEditor;
            const c = document.getElementById(o.chipId);
            const e = document.getElementById(o.edId);
            if (c) c.style.display = '';
            if (e) e.style.display = 'none';
        }
        if (this._atomOutsideHandler) {
            document.removeEventListener('mousedown', this._atomOutsideHandler);
            this._atomOutsideHandler = null;
        }
        const chip   = document.getElementById(chipId);
        const editor = document.getElementById(edId);
        if (!chip || !editor) return;
        chip.style.display   = 'none';
        editor.style.display = '';
        this._openAtomEditor = { chipId, edId, ddId };
        if (ddId) {
            // Open dropdown
            setTimeout(() => {
                const dd = document.getElementById(ddId);
                if (dd && !dd.classList.contains('sq-dd-open')) {
                    dd.classList.add('sq-dd-open');
                    dd.focus();
                }
            }, 20);
        } else {
            // Focus input
            const inp = editor.querySelector('input');
            if (inp) { inp.select(); inp.focus(); }
        }
        // Close on outside click
        const self = this;
        setTimeout(() => {
            self._atomOutsideHandler = function(e) {
                const edEl = document.getElementById(edId);
                if (edEl && !edEl.contains(e.target) && e.target.id !== chipId) {
                    self._atomEditClose(chipId, edId);
                }
            };
            document.addEventListener('mousedown', self._atomOutsideHandler);
        }, 80);
    },

    // Close atom editor and show chip
    _atomEditClose(chipId, edId) {
        const chip   = document.getElementById(chipId);
        const editor = document.getElementById(edId);
        if (chip)   chip.style.display   = '';
        if (editor) editor.style.display = 'none';
        // Update chip content with new input value.
        // For text fields, `editor` IS the <input> (edId points to it directly);
        // for other editors the input is a descendant.
        if (chip && editor) {
            const inp = editor.tagName === 'INPUT' ? editor : editor.querySelector('input');
            if (inp) {
                // Re-render chip content in-place
                chip.innerHTML = this._atomChipHtml(inp.value);
                const entity = inp.value && !inp.value.startsWith('?')
                    ? this._resolveEntity(inp.value) : null;
                if (entity) {
                    chip.classList.add('sq-atom-nav');
                    chip.setAttribute('onclick', `SparqlEditor.navigateToEntity('${this._esc(inp.value)}')`);
                } else {
                    chip.classList.remove('sq-atom-nav');
                    chip.setAttribute('onclick', '');
                }
            }
        }
        if (this._openAtomEditor?.chipId === chipId) this._openAtomEditor = null;
        if (this._atomOutsideHandler) {
            document.removeEventListener('mousedown', this._atomOutsideHandler);
            this._atomOutsideHandler = null;
        }
    },

    navigateToEntity(uri) {
        const match = this._resolveEntity(uri);
        if (match) {
            APP.navigate(match.section);
            setTimeout(() => match.fn(), 150);
        } else {
            window.open(uri, '_blank');
        }
    },

    _renderResults(vars, bindings) {
        if (!vars.length)
            return `<p style="color:var(--text-dim);font-size:12px;
                               font-style:italic;padding:8px 0">No results.</p>`;

        const th = vars.map(v =>
            `<th style="padding:5px 12px;text-align:left;font-size:11px;color:var(--text-dim);
                         font-weight:600;border-bottom:2px solid var(--border);
                         white-space:nowrap">${v}</th>`
        ).join('');

        const tr = bindings.map((b, ri) => {
            const cells = vars.map(v => {
                const cell = b[v];
                let val = '<span style="color:var(--text-faint)">—</span>';
                if (cell) {
                    if (cell.type === 'uri') {
                        const short = cell.value.split(/[#/]/).pop() || cell.value;
                        const match = this._resolveEntity(cell.value);
                        if (match) {
                            // Internal entity → dot icon + display name + optional id sub-line
                            const uriEsc   = cell.value.replace(/'/g, "\\'");
                            const dotHtml  = match.dot
                                ? `<span class="${match.dot}" style="flex-shrink:0;margin-right:4px;margin-top:1px;align-self:flex-start"></span>`
                                : '';
                            const mainText = match.displayName || match.entityId;
                            const subText  = match.displayName
                                ? `<span class="sq-res-nav-id">${this._esc(match.entityId)}</span>`
                                : '';
                            val = `<span class="sq-res-nav"
                                         onclick="SparqlEditor.navigateToEntity('${uriEsc}')"
                                         title="${this._esc(cell.value)}"
                                   >${dotHtml}<span style="display:flex;flex-direction:column;min-width:0">
                                       <span class="sq-res-nav-lbl">${this._esc(mainText)}</span>
                                       ${subText}
                                   </span></span>`;
                        } else {
                            // External URI → open in new tab
                            val = `<a href="${cell.value}" target="_blank" title="${this._esc(cell.value)}"
                                      style="color:var(--text-dim);text-decoration:none;
                                             font-family:var(--font-mono)">${this._esc(short)}</a>`;
                        }
                    } else {
                        let v2 = `<span style="color:var(--text1);font-family:var(--font-mono)">${this._esc(cell.value)}</span>`;
                        if (cell['xml:lang'])
                            v2 += ` <span style="color:var(--text-dim);font-size:10px">@${cell['xml:lang']}</span>`;
                        val = v2;
                    }
                }
                return `<td style="padding:4px 12px;font-size:12px;
                                   border-bottom:1px solid var(--border)">${val}</td>`;
            }).join('');
            return `<tr onmouseenter="this.style.background='var(--bg3)'"
                        onmouseleave="this.style.background='${ri % 2 ? 'var(--bg3)' : ''}'">
                        ${cells}</tr>`;
        }).join('');

        const oddRows = bindings
            .map((_, i) => i % 2 === 1
                ? `tr:nth-child(${i + 1}) { background: var(--bg3); }` : '')
            .filter(Boolean).join('');

        return `
        <div style="overflow-x:auto;margin-top:10px;border:1px solid var(--border);
                    border-radius:5px;font-size:12px">
            <table style="width:100%;border-collapse:collapse">
                <thead><tr>${th}</tr></thead>
                <tbody>${tr}</tbody>
            </table>
        </div>`;
    },

    // ── Utilities ─────────────────────────────────────────────────────
    _esc(s) {
        return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
                        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    },

    restoreSelection() {
        this._initSplitHandle();
        if (this._selectedId) this.selectQuery(this._selectedId);
    },

    // ── Menu contextuel (clic droit sur une requête) ──────────
    showContextMenu(event, id) {
        this._closeContextMenu();
        if (this._selectedId !== id) this.selectQuery(id);
        const q = this._loadAll().find(x => x.id === id);
        const isImported = !!q?._imported;
        const menu = document.createElement('div');
        menu.id = 'sparql-ctx-menu';
        menu.className = 'ctx-menu';
        if (isImported) {
            menu.innerHTML = _importedCtxBanner();
        } else {
            menu.innerHTML = `
                <div class="ctx-item ctx-danger" onclick="SparqlEditor._closeContextMenu();SparqlEditor.deleteQuery('${id}')">
                    ${ClassEditor._svgDelete} Delete Query</div>`;
        }
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
        document.getElementById('sparql-ctx-menu')?.remove();
    },
};
