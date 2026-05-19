const setBonuses = {
    laughing: { dmg: 5, spa: 5, cf: 0, cm: 0, range: 0 },
    ninja: { dmg: 5, spa: 0, cf: 0, cm: 0, range: 0 },
    sun_god: { dmg: 5, spa: 0, cf: 0, cm: 0, range: 0 },
    ex: { dmg: 0, spa: 0, cf: 10, cm: 25, range: 0 },
    shadow_reaper: { dmg: 2.5, spa: 0, cf: 5, cm: 5, range: 10 },
    reaper_set: { dmg: 0, spa: 7.5, cf: 0, cm: 0, range: 15 },
    super_roku: { dmg: 10, spa: 0, cf: 15, cm: 0, range: 0 },
    bio_android: { dmg: 10, spa: 5, cf: 5, cm: 15, range: 5 },
    biju_set: { dmg: 10, spa: 0, cf: 0, cm: 0, range: 0 },
    rebellious_set: { dmg: 0, spa: 0, cf: 0, cm: 0, range: 0 },
    reanimated_ninja: { dmg: 10, spa: 0, cf: 0, cm: 0, range: 0, dot: 30 },
    great_mage: { dmg: 0, spa: 0, cf: 0, cm: 0, range: 10 },
    sorcerer_hunter: { dmg: 10, spa: 7.5, cf: 0, cm: 0, range: 0 },
    strongest_sorcerer: { dmg: 10, spa: 0, cf: 0, cm: 0, range: 5 },
    monarch: { dmg: 0, spa: 0, cf: 0, cm: 0, range: 0 }, // Dynamic bonus handled in math.js
    warlord: { dmg: 0, spa: 0, cf: 0, cm: 0, range: 0 }, // Dynamic bonus handled in calculations.js
    mochi: { dmg: 0, spa: 0, cf: 0, cm: 0, range: 0 }, // Dynamic bonus handled in relic-backend.js
    none: { dmg: 0, spa: 0, cf: 0, cm: 0, range: 0 }
};

const BODY_DMG = { dmg: 60, dot: 0, cm: 0, desc: "Dmg", type: "dmg" };
const BODY_DOT = { dmg: 0, dot: 75, cm: 0, desc: "DoT", type: "dot" };
const BODY_CDMG = { dmg: 0, dot: 0, cm: 120, desc: "Crit Dmg", type: "cm" };

const LEG_DMG = { dmg: 60, spa: 0, desc: "Dmg", type: "dmg" };
const LEG_SPA = { dmg: 0, spa: 22.5, desc: "Spa", type: "spa" };
const LEG_CRIT = { dmg: 0, spa: 0, desc: "Crit Rate", type: "cf", cf: 37.5 };
const LEG_RANGE = { dmg: 0, spa: 0, desc: "Range", type: "range", range: 30 };

const SETS = [
    { id: "ninja", name: "Junior Ninja", bonus: { dmg: 5, spa: 0, cm: 0 } },
    { id: "sun_god", name: "Sun God", bonus: { dmg: 5, spa: 0, cm: 0 } },
    { id: "laughing", name: "Laughing Captain", bonus: { dmg: 5, spa: 5, cm: 0 } },
    { id: "ex", name: "Ex Captain", bonus: { dmg: 0, spa: 0, cm: 25, cf: 10 } },
    { id: "shadow_reaper", name: "Shadow Reaper", bonus: { dmg: 2.5, range: 10, cf: 5, cm: 5 } },
    { id: "reaper_set", name: "Reaper Set", bonus: { spa: 7.5, range: 15 } },
    { id: "super_roku", name: "Super Roku", bonus: { dmg: 10, cf: 15 } },
    { id: "bio_android", name: "Bio-Android", bonus: { dmg: 10, spa: 5, range: 5, cf: 5, cm: 15 } },
    { id: "biju_set", name: "Biju Set", bonus: { dmg: 10 } },
    { id: "rebellious_set", name: "Rebellious Shinobi", bonus: { dmg: "+30% Damage (CC)" } },
    { id: "reanimated_ninja", name: "Reanimated Ninja", bonus: { dmg: 10, dot: 30 } },
    { id: "great_mage", name: "Great Mage", bonus: { range: 10 } },
    { id: "sorcerer_hunter", name: "Sorcerer Hunter", bonus: { dmg: 10, spa: 7.5 } },
    { id: "strongest_sorcerer", name: "Strongest Sorcerer", bonus: { dmg: 10, range: 5 } },
    { id: "monarch", name: "Monarch", bonus: { dmg: "Up to +40% (Summon Based)" } },
    { id: "warlord", name: "Warlord", bonus: { dmg: "Avg +30% Dmg (Crit Proc)" } },
    { id: "mochi", name: "Mochi", bonus: { dmg: "+40% Damage (Time Snail)" } }
];

const globalBuilds = SETS.flatMap(set =>
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
