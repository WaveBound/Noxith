export const unit = {
    id: "5thgodhand",
    name: "5th God Hand",
    image: "Units/Image/5thGodHand.png",
    ascend: 0,
    tiers: ["Secret"],
    update: "2.5",

    stats: {
        recommendedTrait: "Unbound",
        element: "Dark",
        archetype: "Psychic",
        damage: "5,960",
        spa: "11.5",
        range: "23",
        critChance: "0%",
        critDamage: "100%",
        placementCount: "1",
        totalCost: "$58,500",
    },

    placement: [
        {
            upgrade: 0, damage: "682", spa: "6.5", range: "14.5", cost: "1,350",
            attackName: "Shatter",
            aoe: "Cone 60",
            hitCount: 5,
            attackTime: "5.15",
            description: "Deals 5 ticks in a Cone AoE (Size 60) over 5.15s"
        },
        {
            upgrade: 1, damage: "938", spa: "6.4", range: "15.5", cost: "2,500",
            attackName: "Shatter",
            aoe: "Cone 60",
            hitCount: 5,
            attackTime: "5.15",
        },
        {
            upgrade: 2, damage: "1,176", spa: "6.2", range: "16.5", cost: "3,700",
            attackName: "Shatter",
            aoe: "Cone 60",
            hitCount: 5,
            attackTime: "5.15",
        },
        {
            upgrade: 3, damage: "1,524", spa: "6", range: "17.5", cost: "4,850",
            attackName: "Shatter",
            aoe: "Cone 60",
            hitCount: 5,
            attackTime: "5.15",
        },
        {
            upgrade: 4, damage: "1,838", spa: "5.7", range: "18.5", cost: "6,300",
            attackName: "Shatter",
            aoe: "Cone 60",
            hitCount: 5,
            attackTime: "5.15",
        },
        {
            upgrade: 5, damage: "2,317", spa: "5.5", range: "19.5", cost: "7,400",
            attackName: "Shatter",
            aoe: "Cone 60",
            hitCount: 5,
            attackTime: "5.15",
        },
        {
            upgrade: 6, damage: "2,851", spa: "5.3", range: "20.5", cost: "8,650",
            attackName: "Shatter",
            aoe: "Cone 60",
            hitCount: 5,
            attackTime: "5.15",
        },
        {
            upgrade: 7, damage: "4,962", spa: "12", range: "22", cost: "10,250",
            attackName: "Calamity",
            aoe: "Full",
            hitCount: 4,
            attackTime: "4.95",
            description: "Deals 4 ticks in a Full AoE over 4.95s"
        },
        {
            upgrade: 8, damage: "5,960", spa: "11.5", range: "23", cost: "13,500",
            attackName: "Calamity",
            aoe: "Full",
            hitCount: 4,
            attackTime: "4.95",
        },
    ],

    passives: [
        {
            name: "Eclipse Distortion",
            desc: `Every <b>3</b> <b>Regular Attacks</b>:<br>- Create a <b>Distortion</b> on this unit's <b>Target</b> for <b>10</b> seconds<br><br>Enemies walking into <b>Distortion</b> will:<br>- Disappear from the map for <b>2</b> seconds (<b>12s</b> Cooldown)<br>- Take <b>50%</b> of this unit's current damage<br><br>Enemies will not move while in <b>Distortion</b>.`,
        },
        {
            name: "Causality",
            desc: `This unit has <b>Fated Meter</b>, starting at 0. (Capacity: <b>35</b>)<br><br>If an enemy survives <b>Distortion</b>'s damage:<br>- Inflict enemy with <b>Mark Of Fate</b> for <b>5</b> seconds<br>- Gain <b>1</b> <b>Fated Meter</b><br><br>For every enemy in range with <b>Mark Of Fate</b>:<br>- Increase this unit's damage by <b>2.5%</b><br>- Increase this unit's range by <b>1%</b><br><br><b>Mark Of Fate</b> cannot stack.<br>Enemies inflicted with <b>Mark Of Fate</b> will take <b>5%</b> increased damage from this unit.`,
        },
        {
            name: "Eclipse",
            desc: `For every <b>Fated Meter</b> stack:<br>- Increase the damage of this unit's <b>Distortion</b> by <b>5%</b><br><br>At <b>35</b> <b>Fated Meter</b> stacks:<br>- All enemies in range will take <b>100%</b> of this unit's current damage per second for <b>5</b> seconds<br>- After <b>5</b> seconds reset <b>Fated Meter</b> back to 0`,
        },
    ],

    recommendedEquips: {
        unitEquip: "Orb of Causality",
        equip1: "Three Swords From Hell",
        equip2: "Kunai",
    },

    statusEffects: [
        {
            name: "Mark Of Fate",
            icon: "markoffate",
            tag: "Mark",
            effect: "Mark applied by Causality",
            cooldown: "10s",
        },
    ],
};

export default unit;
