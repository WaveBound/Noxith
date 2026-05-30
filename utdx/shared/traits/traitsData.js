// ─── TRAIT DEFINITIONS ──────────────────────────────────────
const TRAITS = [
    {
        id: "duelist", name: "Duelist", chance: 0.8,
        image: "images/Traits/duelist.png",
        stats: { bossDmg: 35, cRate: 25, range: 20 },
        special: null
    },
    {
        id: "artificer", name: "Artificer", chance: 0.65,
        image: "images/Traits/artificer.png",
        stats: {},
        special: { relicStatBonus: 15 }
    },
    {
        id: "wizard", name: "Wizard", chance: 0.5,
        image: "images/Traits/wizard.png",
        stats: { dot: 30, spa: 15, range: 20 },
        special: null
    },
    {
        id: "astral", name: "Astral", chance: 0.45,
        image: "images/Traits/astral.png",
        stats: { spa: 20, range: 15 },
        special: { afflictionDuration: 20, dotCanStack: true }
    },
    {
        id: "sacred", name: "Sacred", chance: 0.3,
        image: "images/Traits/sacred.png",
        stats: { dmg: 25, range: 25, spa: 10, costReduction: 15 },
        special: null
    },
    {
        id: "eternal", name: "Eternal", chance: 0.2,
        image: "images/Traits/eternal.png",
        stats: { spa: 20 },
        special: { perWave: { dmg: 5, range: 2.5 }, cap: { dmg: 60, range: 30 } }
    },
    {
        id: "fission", name: "Fission", chance: 0.15,
        image: "images/Traits/fission.png",
        stats: { dmg: 15, spa: 15, range: 25 },
        special: { radiationDot: true }
    },
    {
        id: "ruler", name: "Ruler", chance: 0.1,
        image: "images/Traits/ruler.png",
        stats: { dmg: 200, spa: 20, range: 30 },
        special: { maxPlacements: 1 }
    }
];

// Attach to window for non-module compatibility in index.html
window.TRAITS = TRAITS;
