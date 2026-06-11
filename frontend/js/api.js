/**
 * api.js — HTTP client for the FastAPI backend
 * Note: the backend exposes more endpoints (GET lists / GET by id / import /
 * health…) usable by external clients; only the methods actually used by the
 * SWOWL frontend are declared here.
 */
const API = {
    base: '/api',

    async _fetch(method, path, body = null) {
        // Snapshot avant toute mutation (POST/PUT/DELETE) sauf snapshot lui-même
        if (['POST','PUT','DELETE'].includes(method) && !path.includes('/snapshot/')) {
            if (typeof UndoRedo !== 'undefined') UndoRedo.snapshot();
        }
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

    // ── Ontology registry ──────────────────────────────
    peekOntology:     (path)  => API._fetch('GET', `/ontologies/peek?path=${encodeURIComponent(path)}`),
    registerJson:     (path, name, uri, prefix) =>
        API._fetch('POST', `/ontologies/register-json?path=${encodeURIComponent(path)}&name=${encodeURIComponent(name)}&uri=${encodeURIComponent(uri)}&prefix=${encodeURIComponent(prefix)}`),
    listOntologies:     ()           => API._fetch('GET',    '/ontologies'),
    registerOntology:   (data)       => API._fetch('POST',   '/ontologies/register', data),
    updateOntologyEntry:(name, data) => API._fetch('PUT',    `/ontologies/${encodeURIComponent(name)}`, data),
    unregisterOntology: (name, deleteFile = false) => API._fetch('DELETE', `/ontologies/${encodeURIComponent(name)}?delete_file=${deleteFile ? 'true' : 'false'}`),
    connectOntology:    (name)       => API._fetch('POST',   `/ontologies/${encodeURIComponent(name)}/connect`),
    disconnectOntology: ()           => API._fetch('POST',   '/ontologies/disconnect'),
    getCurrentOntology: ()           => API._fetch('GET',    '/ontologies/current'),
    updateOntology:     (data)       => API._fetch('PUT',    '/ontologies/current', data),
    updateDisplayRules: (rules)      => API._fetch('PUT',    '/display-rules', rules),
    listImportableOntologies: (exclude = '') => API._fetch('GET', `/ontologies/importable?exclude=${encodeURIComponent(exclude)}`),
    updateOntologyImports: (name, imports) => API._fetch('PUT', `/ontologies/${encodeURIComponent(name)}/imports`, { imports }),
    getImportedEntities: ()          => API._fetch('GET',    '/ontologies/current/imported-entities'),

    exportOntology: (fmt) => fetch(`${API.base}/ontologies/export?fmt=${fmt}`)
        .then(r => { if (!r.ok) throw new Error(r.statusText); return r.blob(); }),

    exportOntologyByName: (name, fmt) =>
        fetch(`${API.base}/ontologies/${encodeURIComponent(name)}/export?fmt=${fmt}`)
        .then(r => { if (!r.ok) throw new Error(r.statusText); return r.blob(); }),

    // ── Classes ────────────────────────────────────────
    createClass:   (cls)      => API._fetch('POST',   '/classes', cls),
    updateClass:   (id, cls)  => API._fetch('PUT',    `/classes/${id}`, cls),
    deleteClass:   (id)       => API._fetch('DELETE', `/classes/${id}`),

    // ── ObjectProperties ───────────────────────────────
    createOP:   (p)         => API._fetch('POST',   '/object-properties', p),
    updateOP:   (id, p)     => API._fetch('PUT',    `/object-properties/${id}`, p),
    deleteOP:   (id)        => API._fetch('DELETE', `/object-properties/${id}`),

    // ── DatatypeProperties ─────────────────────────────
    createDP:   (p)         => API._fetch('POST',   '/datatype-properties', p),
    updateDP:   (id, p)     => API._fetch('PUT',    `/datatype-properties/${id}`, p),
    deleteDP:   (id)        => API._fetch('DELETE', `/datatype-properties/${id}`),

    // ── AnnotationProperties ──────────────────────────────────
    createAP:   (p)         => API._fetch('POST',   '/annotation-properties', p),
    updateAP:   (id, p)     => API._fetch('PUT',    `/annotation-properties/${encodeURIComponent(id)}`, p),
    deleteAP:   (id)        => API._fetch('DELETE', `/annotation-properties/${encodeURIComponent(id)}`),

    // ── Individuals ──────────────────────────────────────────
    createIndividual:  (ind)     => API._fetch('POST',   '/individuals', ind),
    updateIndividual:  (id, ind) => API._fetch('PUT',    `/individuals/${id}`, ind),
    deleteIndividual:  (id)      => API._fetch('DELETE', `/individuals/${id}`),

    // ── SWRL ──────────────────────────────────────────
    createSWRLRule:   (r)     => API._fetch('POST',   '/swrl-rules', r),
    updateSWRLRule:   (id, r) => API._fetch('PUT',    `/swrl-rules/${id}`, r),
    deleteSWRLRule:   (id)    => API._fetch('DELETE', `/swrl-rules/${id}`),

    // ── Queries ────────────────────────────────────────
    createQuery:   (q)     => API._fetch('POST',   '/queries', q),
    updateQuery:   (id, q) => API._fetch('PUT',    `/queries/${id}`, q),
    deleteQuery:   (id)    => API._fetch('DELETE', `/queries/${id}`),

    // ── Inferences ─────────────────────────────────────────
    getInferences:      ()   => API._fetch('GET', '/inferences'),

    restoreSnapshot: (snap) => API._fetch('POST', '/snapshot/restore', snap),

    importFromPath: (data) => API._fetch('POST', '/ontologies/import-from-path', data),

    fsBrowse: (path, ext = '.json') => API._fetch('GET', `/fs/browse?path=${encodeURIComponent(path)}&ext=${encodeURIComponent(ext)}`),

    fetchBuiltins:  () => API._fetch('POST', '/builtins/fetch'),
    revealInFinder: (path) => API._fetch('POST', `/reveal?path=${encodeURIComponent(path)}`),
};
