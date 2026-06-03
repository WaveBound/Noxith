// ─── RELIC SET BONUSES & BUILDS ────────────────────────────────

const setBonuses = {};
if (typeof SETS !== 'undefined') {
    SETS.forEach(set => {
        const b = set.bonus || {};
        setBonuses[set.id] = {
            dmg: b.dmg || 0,
            spa: b.spa ? -b.spa : 0, // flip sign since they are negative in new data
            cf: b.cRate || 0,
            cm: b.cDmg || 0,
            range: b.range || 0,
            dot: b.dot || 0,
            bossDmg: b.bossDmg || 0,
            trueDmg: b.trueDmg || 0
        };
    });
}
// Fallback for missing/none set
if (!setBonuses.none) {
    setBonuses.none = { dmg: 0, spa: 0, cf: 0, cm: 0, range: 0 };
}

const BODY_DMG = { dmg: 70, dot: 0, cm: 0, desc: "Dmg", type: "dmg" };
const BODY_DOT = { dmg: 0, dot: 99, cm: 0, desc: "DoT", type: "dot" };
const BODY_CDMG = { dmg: 0, dot: 0, cm: 120, desc: "Crit Dmg", type: "cm" };

const LEG_DMG = { dmg: 70, spa: 0, desc: "Dmg", type: "dmg" };
const LEG_SPA = { dmg: 0, spa: 22.5, desc: "Spa", type: "spa" };
const LEG_CRIT = { dmg: 0, spa: 0, desc: "Crit Rate", type: "cf", cf: 37.5 };
const LEG_RANGE = { dmg: 0, spa: 0, desc: "Range", type: "range", range: 30 };

const globalBuilds = (typeof SETS !== 'undefined' ? SETS : []).flatMap(set =>
    [BODY_DMG, BODY_DOT, BODY_CDMG].flatMap(body =>
        [LEG_DMG, LEG_SPA, LEG_CRIT, LEG_RANGE].map(leg => ({
            name: `${set.name} (${body.desc}/${leg.desc})`,
            set: set.id,
            dmg: body.dmg + leg.dmg,
            spa: leg.spa,
            dot: body.dot,
            cm: body.cm,
            cf: (body.cf || 0) + (leg.cf || 0),
            range: (leg.range || 0),
            bodyType: body.type,
            legType: leg.type
        }))
    )
);

// Attach globally
window.setBonuses = setBonuses;
window.globalBuilds = globalBuilds;
