const fs = require('fs');
const content = fs.readFileSync('../databases/db_base.js', 'utf8');

// The file is an IIFE (function() { const RAW = ...; window.GLOBAL_STATIC_BUILD_DB_BASE = ... })();
// Let's just create a mock window and eval it
const window = {};
eval(content);

const d = window.STATIC_BUILD_DB;

// Try to find Jinoo and Triple Threat
const jinoo = d['jinoo_shadow_monarch'] || d['jinoo'] || d['shadow_monarch'];
console.log('Jinoo:', jinoo ? 'FOUND' : 'NOT FOUND');
if (jinoo) {
    const fixed = jinoo.fixed || jinoo.f;
    const boss = jinoo.boss || jinoo.b;
    console.log('Jinoo Fixed Best:', fixed ? fixed[0][0] : null);
    console.log('Jinoo Boss Best:', boss ? boss[0][0] : null);
}

const jinoo_abil = d['jinoo_shadow_monarch_abil'] || d['jinoo_abil'] || d['shadow_monarch_abil'];
console.log('Jinoo Abil:', jinoo_abil ? 'FOUND' : 'NOT FOUND');
if (jinoo_abil) {
    const fixed = jinoo_abil.fixed || jinoo_abil.f;
    const boss = jinoo_abil.boss || jinoo_abil.b;
    console.log('Jinoo Abil Fixed Best:', fixed ? fixed[0][0].dps : null);
    console.log('Jinoo Abil Boss Best:', boss ? boss[0][0].dps : null);
}

const tt_abil = d['triple_threat'];
console.log('Triple Threat Base:', tt_abil ? 'FOUND' : 'NOT FOUND');
if (tt_abil) {
    const fixed = tt_abil.fixed || tt_abil.f;
    const boss = tt_abil.boss || tt_abil.b;
    console.log('TT Base Fixed Best:', fixed ? fixed[0][0].dps : null);
    console.log('TT Base Boss Best:', boss ? boss[0][0].dps : null);
}
if (tt) {
    const fixed = tt.fixed || tt.f;
    const boss = tt.boss || tt.b;
    console.log('TT Fixed Best:', fixed ? fixed[0][0] : null);
    console.log('TT Boss Best:', boss ? boss[0][0] : null);
}
