/**
 * api.js — Client HTTP pour l'API FastAPI
 */
const API = {
    base: '/api',

    async _fetch(method, path, body = null) {
        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body !== null) opts.body = JSON.stringify(body);
        const res = await fetch(this.base + path, opts);
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: res.statusText }));
            throw new Error(err.detail || res.statusText);
        }
        if (res.status === 204) return null;
        return res.json();
    },

    // ── Registre d'ontologies ──────────────────────────────
    listOntologies:     ()           => API._fetch('GET',    '/ontologies'),
    registerOntology:   (data)       => API._fetch('POST',   '/ontologies/register', data),
    updateOntologyEntry:(name, data) => API._fetch('PUT',    `/ontologies/${encodeURIComponent(name)}`, data),
    unregisterOntology: (name)       => API._fetch('DELETE', `/ontologies/${encodeURIComponent(name)}`),
    connectOntology:    (name)       => API._fetch('POST',   `/ontologies/${encodeURIComponent(name)}/connect`),
    disconnectOntology: ()           => API._fetch('POST',   '/ontologies/disconnect'),
    getCurrentOntology: ()           => API._fetch('GET',    '/ontologies/current'),
    updateOntology:     (data)       => API._fetch('PUT',    '/ontologies/current', data),

    exportOntology: (fmt) => fetch(`${API.base}/ontologies/export?fmt=${fmt}`)
        .then(r => { if (!r.ok) throw new Error(r.statusText); return r.blob(); }),

    importOntology: async (file, name, path, uri, prefix) => {
        const fd = new FormData();
        fd.append('file', file);
        const url = `${API.base}/ontologies/import?name=${encodeURIComponent(name)}&path=${encodeURIComponent(path)}&uri=${encodeURIComponent(uri)}&prefix=${encodeURIComponent(prefix)}`;
        const res = await fetch(url, { method: 'POST', body: fd });
        if (!res.ok) throw new Error((await res.json()).detail || res.statusText);
        return res.json();
    },

    // ── Classes ────────────────────────────────────────────
    listClasses:   ()         => API._fetch('GET',    '/classes'),
    createClass:   (cls)      => API._fetch('POST',   '/classes', cls),
    getClass:      (id)       => API._fetch('GET',    `/classes/${id}`),
    updateClass:   (id, cls)  => API._fetch('PUT',    `/classes/${id}`, cls),
    deleteClass:   (id)       => API._fetch('DELETE', `/classes/${id}`),

    // ── ObjectProperties ───────────────────────────────────
    listOPs:    ()          => API._fetch('GET',    '/object-properties'),
    createOP:   (p)         => API._fetch('POST',   '/object-properties', p),
    getOP:      (id)        => API._fetch('GET',    `/object-properties/${id}`),
    updateOP:   (id, p)     => API._fetch('PUT',    `/object-properties/${id}`, p),
    deleteOP:   (id)        => API._fetch('DELETE', `/object-properties/${id}`),

    // ── DatatypeProperties ─────────────────────────────────
    listDPs:    ()          => API._fetch('GET',    '/datatype-properties'),
    createDP:   (p)         => API._fetch('POST',   '/datatype-properties', p),
    getDP:      (id)        => API._fetch('GET',    `/datatype-properties/${id}`),
    updateDP:   (id, p)     => API._fetch('PUT',    `/datatype-properties/${id}`, p),
    deleteDP:   (id)        => API._fetch('DELETE', `/datatype-properties/${id}`),

    // ── Individus ──────────────────────────────────────────
    listIndividuals:   ()        => API._fetch('GET',    '/individuals'),
    createIndividual:  (ind)     => API._fetch('POST',   '/individuals', ind),
    getIndividual:     (id)      => API._fetch('GET',    `/individuals/${id}`),
    updateIndividual:  (id, ind) => API._fetch('PUT',    `/individuals/${id}`, ind),
    deleteIndividual:  (id)      => API._fetch('DELETE', `/individuals/${id}`),


    // ── SWRL ──────────────────────────────────────────────
    listSWRLRules:    ()      => API._fetch('GET',    '/swrl-rules'),
    createSWRLRule:   (r)     => API._fetch('POST',   '/swrl-rules', r),
    getSWRLRule:      (id)    => API._fetch('GET',    `/swrl-rules/${id}`),
    updateSWRLRule:   (id, r) => API._fetch('PUT',    `/swrl-rules/${id}`, r),
    deleteSWRLRule:   (id)    => API._fetch('DELETE', `/swrl-rules/${id}`),

    // ── Inférences ─────────────────────────────────────────
    getInferences:      ()   => API._fetch('GET', '/inferences'),
    getViolations:      ()   => API._fetch('GET', '/inferences/violations'),
    getSubclassClosure: ()   => API._fetch('GET', '/inferences/subclass-closure'),

    importFromPath: (data) => API._fetch('POST', '/ontologies/import-from-path', data),

    fsBrowse: (path, ext = '.json') => API._fetch('GET', `/fs/browse?path=${encodeURIComponent(path)}&ext=${encodeURIComponent(ext)}`),

    health: () => API._fetch('GET', '/health'),
};
