// Map the new nested TRAITS to the flat traitsList structure for backwards compatibility
const DESCRIPTIONS = {
    ruler: "+200% Dmg, Limit 1",
    fission: "+15% Dmg/SPA, +25% Range, radiation causes enemies to take +20% Dmg",
    eternal: "-20% SPA, +Dmg/Rng/Wave",
    sacred: "+25% Dmg, -10% SPA, -15% Cost",
    astral: "DoT Stacks (All Units)",
    wizard: "+30% DoT, -15% SPA",
    artificer: "+15% Relic Stats",
    duelist: "+Crit/Boss Dmg",
    none: "No buffs"
};

function getTraitDesc(t) {
    if (DESCRIPTIONS[t.id]) return DESCRIPTIONS[t.id];
    const parts = [];
    const stats = t.stats || {};
    const special = t.special || {};
    
    if (stats.dmg) parts.push(`+${stats.dmg}% Dmg`);
    if (stats.spa) parts.push(`-${stats.spa}% SPA`);
    if (stats.range) parts.push(`+${stats.range}% Range`);
    if (stats.dot) parts.push(`+${stats.dot}% DoT`);
    if (stats.cRate) parts.push(`+${stats.cRate}% Crit Rate`);
    if (stats.bossDmg) parts.push(`+${stats.bossDmg}% Boss Dmg`);
    if (stats.costReduction) parts.push(`-${stats.costReduction}% Cost`);
    
    if (special.maxPlacements) parts.push(`Limit ${special.maxPlacements}`);
    if (special.perWave) parts.push(`+Dmg/Rng/Wave`);
    if (special.dotCanStack) parts.push(`DoT Stacks (All Units)`);
    if (special.radiationDot) parts.push(`radiation causes enemies to take +20% Dmg`);
    if (special.relicStatBonus) parts.push(`+${special.relicStatBonus}% Relic Stats`);
    
    return parts.join(', ');
}

// Build traitsList from TRAITS
const traitsList = [
    ...(typeof TRAITS !== 'undefined' ? TRAITS : []).map(t => {
        const stats = t.stats || {};
        const special = t.special || {};
        return {
            id: t.id,
            name: t.name,
            dmg: stats.dmg || 0,
            spa: stats.spa || 0,
            range: stats.range || 0,
            dotBuff: stats.dot || 0,
            critRate: stats.cRate || 0,
            bossDmg: stats.bossDmg || 0,
            costReduction: stats.costReduction || 0,
            limitPlace: special.maxPlacements,
            isEternal: t.id === 'eternal',
            allowDotStack: special.dotCanStack || false,
            hasRadiation: special.radiationDot || false,
            radiationPct: special.radiationDot ? 20 : 0,
            relicBuff: special.relicStatBonus ? (1 + special.relicStatBonus / 100) : undefined,
            desc: getTraitDesc(t)
        };
    }),
    { id: "none", name: "None", dmg: 0, spa: 0, range: 0, desc: "No buffs" }
];

window.traitsList = traitsList;
