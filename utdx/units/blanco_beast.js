unitDatabase.push({
    // IDENTITY
    id: "blanco_beast",
    name: "Blanco Beast",
    img: "images/units/BlancoBeast.png",
    level: 70,
    placement: 3,
    placementType: "Hill",
    role: "DPS",
    tags: ["Super Warrior", "Hero"],

    // META (Build Guide / Trait Tier List)
    meta: {
        short: "Ruler/Duelist",
        long: "Duelist",
        note: "Duelist Long term dps / Pairing with \"Angel born in hell\"."
    },

    // TODO: Replace with final placement + upgrade cost total.
    totalCost: 65900,

    // WRATH STOCK BAR: stock 1 = +300%, stock 2 = +225%, stock 3 = +150%, stock 4 = +75%, stock 5 = +0%
    systemLevel: {
        label: "Wrath Stocks",
        passiveName: "Wrath of the Beast",
        controlType: 'slider',
        min: 1,
        max: 5,
        default: 5,
        // Engine thresholds are cumulative, so perLevel(-75) + threshold at level 1 (+375)
        // maps 5/4/3/2/1 stocks to +0/+75/+150/+225/+300% stock bonus.
        perLevel: { passiveDmg: -75 },
        thresholds: [
            { level: 1, passiveDmg: 375 }
        ]
    },

    // BASE STATS
    stats: {
        crit: 0,
        cdmg: 150,
        dot: 0,
        dotStacks: 1,
        spaCap: 4,
        passiveDmg: 0,
        element: "Ice",
        dotDuration: 0,
        support: ""
    },

    // UPGRADES - Placeholder values only.
    upgrades: [
        { name: "Explosive Ray", dmg: 240, spa: 8, range: 23, cost: 900 },
        { name: "Explosive Ray", dmg: 720, spa: 8, range: 27, cost: 2500 },
        { name: "Explosive Ray", dmg: 1620, spa: 8, range: 29, cost: 5000 },
        { name: "Explosive Flash", dmg: 2160, spa: 10, range: 32, cost: 9500 },
        { name: "Explosive Flash", dmg: 3000, spa: 10, range: 35, cost: 12000 },
        { name: "Explosive Beam", dmg: 4800, spa: 10, range: 35, cost: 16000 },
        { name: "Explosive Beam", dmg: 7200, spa: 10, range: 40, cost: 20000 }
    ],

    // PASSIVES
    passives: [
        {
            name: "Unrestrained Power",
            passiveDmg: 100,
            desc: `This unit gains 10% of the total Damage of all units owned by the player within Range.<br>• This Buff can scale up to +100% Damage<br><br>On Stun / Debuff:<br>• +30% Critical Rate for 20s<br>• +30% AOE Size for 20s`
        },
        {
            name: "Overwhelming Force",
            passiveCdmg: 150,
            desc: `<br>When this unit's Damage is higher than the enemy's Health:<br>• Deal the leftover Damage to surrounding enemies<br>• +15% Critical Damage (Cap: +150%)`
        },
        {
            name: "Wrath of the Beast",
            passiveDmg: 150,
            passiveHyperArmorDmg: 30,
            desc: `<br>When any unit gets a Debuff or when this unit gets a Stun:<br>• +150% Damage permanently<br>• +30% Hyper Armor Damage for 20s<br><br>Wrath Stocks:<br>• Stock 1: +300% Damage Bonus<br>• Stock 2: +225% Damage Bonus<br>• Stock 3: +150% Damage Bonus<br>• Stock 4: +75% Damage Bonus<br>• Stock 5: +0% Damage Bonus`
        },
        {
            name: "Super Blue Beam",
            desc: `Deal 500% Damage to all enemies on the Map.<br>• This Active Ability will always land as a Critical Hit.<br>• Active Ability Cooldown: 120s.<br><br>Ability math is intentionally not implemented yet; damage bonuses will be added later.`
        }
    ],

    ability: [
        {
            buffDmg: 0,
            abilityName: "Super Blue Beam",
            noToggle: true,
            cooldown: 120,
            desc: `Active Ability unlocked on the final Upgrade<br>• Deal 500% Damage to all enemies on the Map<br>• This Active Ability will always land as a Critical Hit<br>• Active Ability Cooldown: 120s<br><br>Damage bonuses are intentionally not implemented yet.`
        }
    ],

    // ETHEREALIZATION
    etherealization: [
        "+10 Stat Points",
        "\"Overwhelming Force\" Critical Damage Cap increased to 150%.",
        "+10 Stat Points",
        "\"Super Blue Beam\" Damage increased to 500%.",
        "+10 Stat Points",
        "\"Wrath of the Beast\" Damage increased to 150%."
    ]
});
