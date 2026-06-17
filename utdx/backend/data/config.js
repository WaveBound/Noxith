const GAME_STATE = {
    BUG_DOT_RELICS: false,  // Set to true if Relic DoT is currently broken/ignored in-game
    BUG_CRIT_RELICS: false  // Set to true if Relic Crit is currently broken (Fixed in v2.4)
};

const SUPER_ROKU_NEARBY = false; // Toggle: +20% Damage if placed within range of a "Saiyan unit"

const statConfig = {
    applyRelicDmg: true,
    applyRelicSpa: true,
    applyRelicCrit: !GAME_STATE.BUG_CRIT_RELICS,
    applyRelicDot: !GAME_STATE.BUG_DOT_RELICS,
    applyRelicRange: false
};

const PERFECT_SUBS = {
    dmg: 4, spa: 1.5, cm: 4.5, cf: 2.5, dot: 5, range: 2
};

const SUB_CANDIDATES = ['dmg', 'spa', 'cm', 'cf', 'dot', 'range'];

const SUB_NAMES = {
    dmg: "Dmg", spa: "SPA", cm: "Crit Dmg", cf: "Crit Rate", dot: "DoT", range: "Range"
};
