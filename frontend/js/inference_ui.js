/**
 * inference_ui.js — Panneau des inférences temps réel
 */

const InferenceUI = {

    _data: null,
    _autoRefresh: null,

    async refresh() {
        try {
            this._data = await API.getInferences();
            this.render();
        } catch (e) {
            document.getElementById('inference-panel').innerHTML =
                `<p class="error">Inference error: ${e.message}</p>`;
        }
    },

    startAutoRefresh(intervalMs = 3000) {
        this.stopAutoRefresh();
        this._autoRefresh = setInterval(() => {
            if (APP.currentSection === 'inferences') {
                this.refresh();
            }
        }, intervalMs);
    },

    stopAutoRefresh() {
        if (this._autoRefresh) {
            clearInterval(this._autoRefresh);
            this._autoRefresh = null;
        }
    },

    render() {
        const panel = document.querySelector('#main-content #inference-panel');
        if (!panel || !this._data) return;

        const d = this._data;
        const violations = d.violations || [];
        const errors   = violations.filter(v => v.severity === 'error');
        const warnings = violations.filter(v => v.severity === 'warning');

        panel.innerHTML = `
        <div class="inference-header">
            <span class="inf-badge ${errors.length ? 'badge-error' : 'badge-ok'}">
                ${errors.length ? `🔴 ${errors.length} error(s)` : '🟢 Consistent'}
            </span>
            ${warnings.length ? `<span class="inf-badge badge-warn">⚠️ ${warnings.length} warning(s)</span>` : ''}
            <button class="btn-sm" onclick="InferenceUI.refresh()" title="Recalculer">↻</button>
        </div>

        ${this._renderViolations(violations)}
        ${this._renderSubclassClosure(d.subclass_closure || {})}
        ${this._renderInheritedRestrictions(d.inherited_restrictions || [])}
        ${this._renderInverseClassRestrictions(d.inferred_inverse_restrictions || [])}
        ${this._renderInferredTypes(d.inferred_types || [])}
        ${this._renderAssertions('Inferred symmetric assertions', d.symmetric_assertions || [])}
        ${this._renderAssertions('Inferred transitive assertions', d.transitive_assertions || [])}
        ${this._renderAssertions('Assertions (chains + inverses)', d.chain_assertions || [])}
        ${this._renderInferredInverseProperties(d.inferred_inverse_properties || [])}
        `;
    },

    _renderViolations(violations) {
        if (!violations.length) {
            return '<div class="inf-section"><div class="inf-title">✅ Violations</div><p class="empty">No violations detected.</p></div>';
        }
        return `<div class="inf-section">
            <div class="inf-title">⚠️ Violations (${violations.length})</div>
            ${violations.map(v => `
            <div class="violation ${v.severity}">
                <span class="viol-icon">${v.severity === 'error' ? '🔴' : '🟡'}</span>
                <span class="viol-entity"><code>${v.entity}</code></span>
                <span class="viol-msg">${v.message}</span>
            </div>`).join('')}
        </div>`;
    },

    _renderSubclassClosure(closure) {
        const entries = Object.entries(closure).filter(([, ancs]) => ancs.length > 0);
        if (!entries.length) {
            return '<div class="inf-section"><div class="inf-title">🌳 Resolved hierarchy</div><p class="empty">No class hierarchy.</p></div>';
        }
        return `<div class="inf-section collapsible">
            <div class="inf-title" onclick="this.parentElement.classList.toggle('open')">
                🌳 Resolved hierarchy (fermeture transitive subClassOf) <span class="caret">▶</span>
            </div>
            <div class="inf-content">
            <table class="inf-table">
                <thead><tr><th>Classe</th><th>Ancestors (all levels)</th></tr></thead>
                <tbody>
                ${entries.map(([cls, ancs]) => `
                <tr>
                    <td><code>${cls}</code></td>
                    <td>${ancs.map(a => `<code class="tag-class">${a}</code>`).join(' ')}</td>
                </tr>`).join('')}
                </tbody>
            </table>
            </div>
        </div>`;
    },

    _renderInheritedRestrictions(restrictions) {
        if (!restrictions.length) {
            return '<div class="inf-section"><div class="inf-title">🔗 Inherited restrictions</div><p class="empty">No inherited restrictions.</p></div>';
        }
        return `<div class="inf-section collapsible">
            <div class="inf-title" onclick="this.parentElement.classList.toggle('open')">
                🔗 Inherited restrictions (${restrictions.length}) <span class="caret">▶</span>
            </div>
            <div class="inf-content">
            <table class="inf-table">
                <thead><tr><th>Classe</th><th>Inherited from</th><th>Restriction</th></tr></thead>
                <tbody>
                ${restrictions.map(r => {
                    const restr = r.restriction || {};
                    let desc = restr.type || '';
                    if (restr.property) desc += `(${restr.property}`;
                    if (restr.filler)   desc += ` . ${restr.filler}`;
                    if (restr.cardinality !== undefined) desc += ` = ${restr.cardinality}`;
                    if (restr.property) desc += ')';
                    return `<tr>
                        <td><code>${r.class_id}</code></td>
                        <td><code class="tag-class">${r.inherited_from}</code></td>
                        <td><code class="tag-restr">${desc}</code></td>
                    </tr>`;
                }).join('')}
                </tbody>
            </table>
            </div>
        </div>`;
    },

    _renderInferredTypes(types) {
        if (!types.length) {
            return '<div class="inf-section"><div class="inf-title">🏷 Inferred types</div><p class="empty">No inferred types.</p></div>';
        }
        return `<div class="inf-section collapsible">
            <div class="inf-title" onclick="this.parentElement.classList.toggle('open')">
                🏷 Inferred types via domain/range (${types.length}) <span class="caret">▶</span>
            </div>
            <div class="inf-content">
            <table class="inf-table">
                <thead><tr><th>Individu</th><th>Inferred type</th><th>Reason</th></tr></thead>
                <tbody>
                ${types.map(t => {
                    const lbl = IndividualEditor._labelForId(t.individual_id);
                    const tip = lbl !== t.individual_id ? ` title="${t.individual_id}"` : '';
                    return `<tr>
                    <td><code${tip}>${lbl}</code></td>
                    <td><code class="tag-class">${t.inferred_type}</code></td>
                    <td><small>${t.reason}</small></td>
                </tr>`;
                }).join('')}
                </tbody>
            </table>
            </div>
        </div>`;
    },

    _renderAssertions(title, assertions) {
        if (!assertions.length) return '';
        return `<div class="inf-section collapsible">
            <div class="inf-title" onclick="this.parentElement.classList.toggle('open')">
                🔄 ${title} (${assertions.length}) <span class="caret">▶</span>
            </div>
            <div class="inf-content">
            <table class="inf-table">
                <thead><tr><th>Individu</th><th>Property</th><th>Target</th><th>Reason</th></tr></thead>
                <tbody>
                ${assertions.map(a => {
                    const indLbl    = IndividualEditor._labelForId(a.individual);
                    const indTip    = indLbl !== a.individual ? ` title="${a.individual}"` : '';
                    const targetLbl = IndividualEditor._labelForId(a.target);
                    const targetTip = targetLbl !== a.target ? ` title="${a.target}"` : '';
                    return `<tr>
                    <td><code${indTip}>${indLbl}</code></td>
                    <td><code class="tag-prop">${a.property}</code></td>
                    <td><code${targetTip}>${targetLbl}</code></td>
                    <td><small>${a.reason}</small></td>
                </tr>`;
                }).join('')}
                </tbody>
            </table>
            </div>
        </div>`;
    },

    _renderInverseClassRestrictions(items) {
        if (!items.length) return '';
        return `<div class="inf-section collapsible">
            <div class="inf-title" onclick="this.parentElement.classList.toggle('open')">
                🔁 Inferred inverse restrictions (${items.length}) <span class="caret">▶</span>
            </div>
            <div class="inf-content">
            <table class="inf-table">
                <thead><tr><th>Classe</th><th>Inferred restriction</th><th>Reason</th></tr></thead>
                <tbody>
                ${items.map(i => {
                    const r = i.restriction || {};
                    const desc = `∃${r.property || ''}.${r.filler || ''}`;
                    return `<tr>
                        <td><code>${i.class_id}</code></td>
                        <td><code class="tag-restr">${desc}</code></td>
                        <td><small>${i.reason}</small></td>
                    </tr>`;
                }).join('')}
                </tbody>
            </table>
            </div>
        </div>`;
    },

    _renderInferredInverseProperties(items) {
        if (!items.length) {
            return '<div class="inf-section"><div class="inf-title">↔ Propertys inverses inférées</div><p class="empty">No inverse inferred by owl:inverseOf symmetry.</p></div>';
        }
        return `<div class="inf-section collapsible">
            <div class="inf-title" onclick="this.parentElement.classList.toggle('open')">
                ↔ Propertys inverses inférées (${items.length}) <span class="caret">▶</span>
            </div>
            <div class="inf-content">
            <table class="inf-table">
                <thead><tr><th>Property</th><th>Inverse of</th><th>Reason</th></tr></thead>
                <tbody>
                ${items.map(i => `<tr>
                    <td><code class="tag-prop">${i.property_id}</code></td>
                    <td><code class="tag-prop">${i.inverse_of}</code></td>
                    <td><small>${i.reason}</small></td>
                </tr>`).join('')}
                </tbody>
            </table>
            </div>
        </div>`;
    },

};
