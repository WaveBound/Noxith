const traitsList = [
    { id: "ruler", name: "Ruler", dmg: 200, spa: 20, range: 30, desc: "+200% Dmg, Limit 1", limitPlace: 1 },
    { id: "fission", name: "Fission", dmg: 15, spa: 15, range: 25, hasRadiation: true, radiationPct: 20, desc: "+15% Dmg/SPA, +25% Range, radiation causes enemies to take +20% Dmg" },
    { id: "eternal", name: "Eternal", dmg: 0, spa: 20, range: 0, desc: "-20% SPA, +Dmg/Rng/Wave", isEternal: true },
    { id: "sacred", name: "Sacred", dmg: 25, spa: 10, range: 25, desc: "+25% Dmg, -10% SPA, -15% Cost", costReduction: 15 },
    { id: "astral", name: "Astral", dmg: 0, spa: 20, range: 15, desc: "DoT Stacks (All Units)", allowDotStack: true },
    { id: "wizard", name: "Wizard", dmg: 0, spa: 15, range: 20, desc: "+30% DoT, -15% SPA", dotBuff: 30 },
    { id: "artificer", name: "Artificer", dmg: 0, spa: 0, range: 0, desc: "+15% Relic Stats", relicBuff: 1.15 },
    { id: "duelist", name: "Duelist", dmg: 0, spa: 0, range: 0, desc: "+Crit/Boss Dmg", critRate: 25, bossDmg: 35 },
    { id: "none", name: "None", dmg: 0, spa: 0, range: 0, desc: "No buffs" }
];
