/**
 * swrl_editor.js — Formulaires SWRL : règles, atomes, builtins
 */

function moveCursorToEnd(el) {
    setTimeout(function() { el.setSelectionRange(el.value.length, el.value.length); }, 0);
}

const SWRLEditor = {

    renderList(rules) {
        if (!rules.length) return '<p class="empty">No SWRL rules defined.</p>';
        return `<table class="entity-table">
            <thead><tr>
                <th>ID</th><th>Label</th>
                <th>Antecedents</th><th>Consequents</th>
                <th>Actif</th><th>Actions</th>
            </tr></thead>
            <tbody>
            ${rules.map(r => `<tr>
                <td><code>${r.id}</code></td>
                <td>${r.label || '—'}</td>
                <td><small>${this._describeAtoms(r.body)}</small></td>
                <td><small>${this._describeAtoms(r.head)}</small></td>
                <td>${r.enabled !== false ? '✅' : '⏸'}</td>
                <td class="actions">
                    <button class="btn-sm btn-edit" onclick="SWRLEditor.openEdit('${r.id}')">✏️</button>
                    <button class="btn-sm btn-del"  onclick="SWRLEditor.delete('${r.id}')">🗑</button>
                </td>
            </tr>`).join('')}
            </tbody>
        </table>`;
    },

    _describeAtoms(atoms) {
        if (!atoms || !atoms.length) return '—';
        return atoms.map(a => {
            if (a.type === 'ClassAtom')          return `${a.class_iri}(?${a.variable})`;
            if (a.type === 'ObjectPropertyAtom') return `${a.property_iri}(${a.arg1},${a.arg2})`;
            if (a.type === 'DataPropertyAtom')   return `${a.property_iri}(${a.arg1},${a.arg2})`;
            if (a.type === 'BuiltinAtom')        return `${a.builtin}(${a.args.join(',')})`;
            return '?';
        }).join(' ∧ ');
    },

    renderForm(rule = null) {
        const isNew = !rule;
        const r = rule || { id:'', label:'', comment:'', body:[], head:[], enabled:true };

        return `
        <div class="form-section">
            <h3>${isNew ? '➕ New SWRL rule' : `✏️ Edit rule: ${r.id}`}</h3>

            <div class="form-row">
                <div class="form-group">
                    <label>Identifiant *</label>
                    <input type="text" id="swrl-id" value="${r.id}" placeholder="ex: rule_V1" ${!isNew ? 'readonly' : ''}>
                </div>
                <div class="form-group" style="flex:0">
                    <label>Actif</label>
                    <input type="checkbox" id="swrl-enabled" ${r.enabled !== false ? 'checked' : ''} style="margin-top:10px">
                </div>
            </div>

            <div class="form-group">
                <label>Label</label>
                <input type="text" id="swrl-label" value="${r.label || ''}" placeholder="Human-readable rule name">
            </div>
            <div class="form-group">
                <label>Comment / Description</label>
                <textarea id="swrl-comment" rows="2" placeholder="Rule description">${r.comment || ''}</textarea>
            </div>

            <!-- BODY -->
            <div class="form-group">
                <label class="section-label">⟦ Rule body (antecedents) ⟧</label>
                <div id="swrl-body" class="atom-list">
                    ${(r.body || []).map((a, i) => this.renderAtomRow(a, i, 'body')).join('')}
                </div>
                <div class="atom-add-buttons">
                    <button class="btn-sm" onclick="SWRLEditor.addAtom('body','ClassAtom')">➕ ClassAtom</button>
                    <button class="btn-sm" onclick="SWRLEditor.addAtom('body','ObjectPropertyAtom')">➕ ObjPropAtom</button>
                    <button class="btn-sm" onclick="SWRLEditor.addAtom('body','DataPropertyAtom')">➕ DataPropAtom</button>
                    <button class="btn-sm" onclick="SWRLEditor.addAtom('body','BuiltinAtom')">➕ BuiltinAtom</button>
                </div>
            </div>

            <div class="swrl-arrow">→</div>

            <!-- HEAD -->
            <div class="form-group">
                <label class="section-label">⟦ Rule head (consequents) ⟧</label>
                <div id="swrl-head" class="atom-list">
                    ${(r.head || []).map((a, i) => this.renderAtomRow(a, i, 'head')).join('')}
                </div>
                <div class="atom-add-buttons">
                    <button class="btn-sm" onclick="SWRLEditor.addAtom('head','ClassAtom')">➕ ClassAtom</button>
                    <button class="btn-sm" onclick="SWRLEditor.addAtom('head','ObjectPropertyAtom')">➕ ObjPropAtom</button>
                    <button class="btn-sm" onclick="SWRLEditor.addAtom('head','DataPropertyAtom')">➕ DataPropAtom</button>
                    <button class="btn-sm" onclick="SWRLEditor.addAtom('head','BuiltinAtom')">➕ BuiltinAtom</button>
                </div>
            </div>

            <!-- Preview -->
            <div class="form-group">
                <label>SWRL Preview</label>
                <div id="swrl-preview" class="swrl-preview" onclick="SWRLEditor.updatePreview()">
                    <em>Click to update</em>
                </div>
                <button class="btn-sm" onclick="SWRLEditor.updatePreview()">🔄 Preview</button>
            </div>

            <div class="form-actions">
                <button class="btn-primary" onclick="SWRLEditor.save('${r.id}', ${isNew})">
                    ${isNew ? '✅ Create' : '💾 Save'}
                </button>
                <button class="btn-secondary" onclick="APP.renderSection('swrl-rules')">Cancel</button>
            </div>
        </div>`;
    },

    // ── Rendu d'un atome ────────────────────────────────────

    renderAtomRow(atom, idx, part) {
        const uid = `${part}-atom-${idx}`;
        let content = '';

        if (atom.type === 'ClassAtom') {
            content = `
                <span class="atom-type-badge badge-class">ClassAtom</span>
                <select class="atom-class-iri">
                    <option value="">-- class --</option>
                    ${(APP.state.classes||[]).map(c =>
                        `<option value="${c.id}" ${c.id===atom.class_iri?'selected':''}>${c.id}</option>`
                    ).join('')}
                </select>
                <input class="atom-var" type="text" value="${atom.variable||''}" placeholder="?variable" style="width:90px">`;
        }
        else if (atom.type === 'ObjectPropertyAtom') {
            content = `
                <span class="atom-type-badge badge-op">ObjPropAtom</span>
                <select class="atom-prop-iri">
                    <option value="">-- prop --</option>
                    ${(APP.state.object_properties||[]).map(p =>
                        `<option value="${p.id}" ${p.id===atom.property_iri?'selected':''}>${p.id}</option>`
                    ).join('')}
                </select>
                <input class="atom-arg1" type="text" value="${atom.arg1||''}" placeholder="?arg1" style="width:80px">
                <input class="atom-arg2" type="text" value="${atom.arg2||''}" placeholder="?arg2" style="width:80px">`;
        }
        else if (atom.type === 'DataPropertyAtom') {
            content = `
                <span class="atom-type-badge badge-dp">DataPropAtom</span>
                <select class="atom-prop-iri">
                    <option value="">-- prop --</option>
                    ${(APP.state.datatype_properties||[]).map(p =>
                        `<option value="${p.id}" ${p.id===atom.property_iri?'selected':''}>${p.id}</option>`
                    ).join('')}
                </select>
                <input class="atom-arg1" type="text" value="${atom.arg1||''}" placeholder="?subject" style="width:80px">
                <input class="atom-arg2" type="text" value="${atom.arg2||''}" placeholder="?value or lit" style="width:100px">`;
        }
        else if (atom.type === 'BuiltinAtom') {
            content = `
                <span class="atom-type-badge badge-bi">BuiltinAtom</span>
                <select class="atom-builtin">
                    ${SWRLB_BUILTINS.map(b =>
                        `<option value="${b}" ${b===atom.builtin?'selected':''}>${b}</option>`
                    ).join('')}
                </select>
                <input class="atom-args" type="text"
                    value="${(atom.args||[]).join(', ')}"
                    placeholder="?a, ?b, ...  (comma-separated)" style="width:180px"
                   >`;
        }

        return `<div class="atom-row" id="${uid}" data-type="${atom.type}" data-part="${part}">
            ${content}
            <button class="btn-sm btn-del" onclick="document.getElementById('${uid}').remove(); SWRLEditor.updatePreview()">✕</button>
        </div>`;
    },

    addAtom(part, type) {
        const container = document.getElementById(`swrl-${part}`);
        const idx = container.children.length;
        const atom = {
            type,
            class_iri: '',
            property_iri: '',
            variable: '?x',
            arg1: '?x',
            arg2: '?y',
            builtin: SWRLB_BUILTINS[0],
            args: ['?x', '?y'],
        };
        container.insertAdjacentHTML('beforeend', this.renderAtomRow(atom, idx, part));
        const newRow = container.lastElementChild;
        newRow.querySelectorAll('input[type="text"]').forEach(inp => {
            inp.addEventListener('focus', function handler() {
                inp.removeEventListener('focus', handler);
                requestAnimationFrame(() => inp.setSelectionRange(inp.value.length, inp.value.length));
            });
        });
    },

    // ── Collecte des atomes ─────────────────────────────────

    collectAtoms(part) {
        const rows = document.querySelectorAll(`#swrl-${part} .atom-row`);
        const atoms = [];
        rows.forEach(row => {
            const type = row.dataset.type;
            if (type === 'ClassAtom') {
                const cls = row.querySelector('.atom-class-iri')?.value;
                const v   = row.querySelector('.atom-var')?.value?.replace(/^\?/, '');
                if (cls) atoms.push({ type, class_iri: cls, variable: v || 'x' });
            }
            else if (type === 'ObjectPropertyAtom') {
                const prop = row.querySelector('.atom-prop-iri')?.value;
                const a1   = row.querySelector('.atom-arg1')?.value;
                const a2   = row.querySelector('.atom-arg2')?.value;
                if (prop) atoms.push({ type, property_iri: prop, arg1: a1||'?x', arg2: a2||'?y' });
            }
            else if (type === 'DataPropertyAtom') {
                const prop = row.querySelector('.atom-prop-iri')?.value;
                const a1   = row.querySelector('.atom-arg1')?.value;
                const a2   = row.querySelector('.atom-arg2')?.value;
                if (prop) atoms.push({ type, property_iri: prop, arg1: a1||'?x', arg2: a2||'?v' });
            }
            else if (type === 'BuiltinAtom') {
                const bi   = row.querySelector('.atom-builtin')?.value;
                const args = (row.querySelector('.atom-args')?.value || '').split(',').map(s => s.trim()).filter(Boolean);
                if (bi) atoms.push({ type, builtin: bi, args });
            }
        });
        return atoms;
    },

    // ── Preview ─────────────────────────────────────

    updatePreview() {
        const body = this.collectAtoms('body');
        const head = this.collectAtoms('head');
        const bodyStr = body.map(a => {
            if (a.type === 'ClassAtom')          return `${a.class_iri}(?${a.variable})`;
            if (a.type === 'ObjectPropertyAtom') return `${a.property_iri}(${a.arg1}, ${a.arg2})`;
            if (a.type === 'DataPropertyAtom')   return `${a.property_iri}(${a.arg1}, ${a.arg2})`;
            if (a.type === 'BuiltinAtom')        return `${a.builtin}(${a.args.join(', ')})`;
            return '?';
        }).join('\n  ∧ ');
        const headStr = head.map(a => {
            if (a.type === 'ClassAtom')          return `${a.class_iri}(?${a.variable})`;
            if (a.type === 'ObjectPropertyAtom') return `${a.property_iri}(${a.arg1}, ${a.arg2})`;
            if (a.type === 'DataPropertyAtom')   return `${a.property_iri}(${a.arg1}, ${a.arg2})`;
            if (a.type === 'BuiltinAtom')        return `${a.builtin}(${a.args.join(', ')})`;
            return '?';
        }).join('\n  ∧ ');
        const preview = document.getElementById('swrl-preview');
        if (preview) {
            preview.innerHTML = `<pre>${bodyStr || '(empty)'}\n→\n${headStr || '(empty)'}</pre>`;
        }
    },

    // ── Sauvegarde ───────────────────────────────────────────

    openEdit(id) {
        const rule = APP.state.swrl_rules.find(r => r.id === id);
        APP.showPanel('swrl-rules', this.renderForm(rule));
    },

    async save(originalId, isNew) {
        const id      = document.getElementById('swrl-id').value.trim();
        const label   = document.getElementById('swrl-label').value.trim();
        const comment = document.getElementById('swrl-comment').value.trim();
        const enabled = document.getElementById('swrl-enabled').checked;

        if (!id) return UI.error('L\'identifiant est obligatoire');

        const body = this.collectAtoms('body');
        const head = this.collectAtoms('head');

        if (!head.length) return UI.error('The rule must have at least one consequent (head)');

        const rule = { id, label, comment, enabled, body, head };

        try {
            if (isNew) { await API.createRule(rule); UI.success(`Rule '${id}' created`); }
            else        { await API.updateRule(originalId, rule); UI.success(`Rule '${id}' updated`); }
            await APP.refresh();
            APP.renderSection('swrl-rules');
        } catch (e) { UI.error(e.message); }
    },

    async delete(id) {
        if (!confirm(`Delete rule '${id}'?`)) return;
        try {
            await API.deleteRule(id);
            UI.success(`Rule '${id}' deleted`);
            await APP.refresh();
            APP.renderSection('swrl-rules');
        } catch (e) { UI.error(e.message); }
    },
};
