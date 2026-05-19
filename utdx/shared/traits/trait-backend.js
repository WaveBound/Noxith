// ============================================================================
// TRAIT-BACKEND.JS - Centralized Math for Traits and Synergies
// ============================================================================

window.combineTraits = function(t1, t2) {
    if (t1.id === 'none' && t2.id === 'none') return t1;
    if (t1.id === 'none') return t2;
    if (t2.id === 'none') return t1;

    const compound = (v1, v2) => {
        const d1 = (v1 || 0) / 100;
        const d2 = (v2 || 0) / 100;
        return ((1 + d1) * (1 + d2) - 1) * 100;
    };

    const compoundReduction = (v1, v2) => {
        const r1 = (v1 || 0) / 100;
        const r2 = (v2 || 0) / 100;
        return (1 - (1 - r1) * (1 - r2)) * 100;
    };

    let combined = {
        id: t1.id + "+" + t2.id,
        name: `${t1.name} + ${t2.name}`,
        isCustom: true,
        subTraits: [t1, t2],

        dmg: compound(t1.dmg, t2.dmg),
        spa: compoundReduction(t1.spa, t2.spa),
        range: compound(t1.range, t2.range),
        bossDmg: compound(t1.bossDmg, t2.bossDmg),

        critRate: (t1.critRate || 0) + (t2.critRate || 0),
        dotBuff: (t1.dotBuff || 0) + (t2.dotBuff || 0),

        isEternal: t1.isEternal || t2.isEternal,
        hasRadiation: t1.hasRadiation || t2.hasRadiation,
        radiationPct: (t1.radiationPct || 0) + (t2.radiationPct || 0),
        radiationDuration: Math.max(t1.radiationDuration || 0, t2.radiationDuration || 0),
        afflictionDuration: (t1.afflictionDuration || 0) + (t2.afflictionDuration || 0),
        dmgDebuff: (t1.dmgDebuff || 0) + (t2.dmgDebuff || 0),
        isAfflictionBugged: t1.isAfflictionBugged || t2.isAfflictionBugged,
        isDotBugged: t1.isDotBugged || t2.isDotBugged,
        isDebuffBugged: t1.isDebuffBugged || t2.isDebuffBugged,

        allowDotStack: t1.allowDotStack || t2.allowDotStack,
        allowPlacementStack: t1.allowPlacementStack || t2.allowPlacementStack,

        relicBuff: (t1.relicBuff ? t1.relicBuff - 1 : 0) + (t2.relicBuff ? t2.relicBuff - 1 : 0) + 1,

        limitPlace: (t1.limitPlace && t2.limitPlace) ? Math.min(t1.limitPlace, t2.limitPlace) : (t1.limitPlace || t2.limitPlace),

        costReduction: (t1.costReduction || 0) + (t2.costReduction || 0)
    };

    if (combined.relicBuff === 1) combined.relicBuff = undefined;
    return combined;
};

window.calcTraitSynergies = function(traitObj, uStats, wave) {
    const totalBossDmg = (uStats.bossDmg || 0) + (traitObj.bossDmg || 0);
    const bossMult = 1 + (totalBossDmg / 100);
    let traitDmgPct = traitObj.dmg || 0;
    let traitSpaPct = traitObj.spa || 0;
    let traitCritRate = traitObj.critRate || 0;
    let traitRangePct = traitObj.range || 0;
    let traitDotBuff = (traitObj.dotBuff || 0) + (uStats.dotBuff || 0);

    let eternalDmgBuff = 0, eternalRangeBuff = 0;
    if (traitObj.isEternal) { 
        const waveCap = Math.min(wave || 0, 12); 
        eternalDmgBuff = waveCap * 5; 
        eternalRangeBuff = waveCap * 2.5; 
    }

    return { bossMult, traitDmgPct, traitSpaPct, traitCritRate, traitRangePct, traitDotBuff, eternalDmgBuff, eternalRangeBuff };
};
