#!/usr/bin/env node
/**
 * COUCHE 3 (garde-fou CI) — « Tout est cherchable ».
 *
 * Les pickers FILTRABLES (décorés par `_decoratePickerWithFilter`, filtrés par
 * `_filterPicker` qui cible `.tree-item[data-id]`) doivent construire leurs items via
 * la fabrique unique `_pickerItem(...)`, qui garantit `class="tree-item"` + `data-id`.
 * Sans `data-id`, l'item est ignoré silencieusement par le filtre — c'est la régression
 * qui avait cassé le filtre du picker d'annotations.
 *
 * Ce scan vérifie qu'AUCUNE fonction-fabrique de picker ne construit un `.tree-item`
 * « à la main » (elle doit passer par `_pickerItem`). Il est ciblé (pas de faux positifs
 * sur les autres usages de la classe .tree-item : chips, lignes de panels, nœuds d'arbre).
 *
 * Sont auditées : toute fonction `_*PickerItems(...)` + `_propTreeLines(...)`.
 *
 * Usage :  node scripts/check-picker-items.js   (exit 1 si violation)
 * À brancher en pre-commit ou en GitHub Action.
 */
const fs   = require('fs');
const path = require('path');

const dir   = path.join(__dirname, '..', 'frontend', 'js');
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.js')) : [];
// Fonctions considérées comme « fabriques de picker filtrable »
const FN_RE = /function\s+(_\w*PickerItems|_propTreeLines)\s*\(/g;
const violations = [];

for (const f of files) {
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    let m;
    while ((m = FN_RE.exec(src)) !== null) {
        const name  = m[1];
        const start = m.index;
        // Corps ≈ jusqu'à la prochaine déclaration de fonction au niveau module, sinon fin du fichier
        const next  = src.indexOf('\nfunction ', start + 1);
        const body  = src.slice(start, next === -1 ? src.length : next);
        // Un item de picker doit passer par _pickerItem → aucun `class="tree-item` brut
        const idx = body.indexOf('class="tree-item');
        if (idx !== -1) {
            const line = src.slice(0, start + idx).split('\n').length;
            violations.push(`${f}:${line}  ${name}() construit un .tree-item sans passer par _pickerItem()`);
        }
    }
    FN_RE.lastIndex = 0;
}

if (violations.length) {
    console.error('❌  Fabrique(s) de picker n\'utilisant pas _pickerItem() (data-id non garanti) :');
    violations.forEach(v => console.error('   ' + v));
    process.exit(1);
}
console.log(`✅  Toutes les fabriques de picker passent par _pickerItem() (${files.length} fichiers scannés).`);
