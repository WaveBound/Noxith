export const unit = {
    id: "watermagescholar",
    name: "Water Mage (Scholar)",
    image: "Units/Image/WaterMageScholar.png",
    ascend: 3,
    tiers: ["Mythic"],
    update: "Summer",

    stats: {
        recommendedTrait: "Primordial",
        element: "Hydro",
        archetype: "Magical",
        damage: "1,898",
        spa: "7.3",
        range: "26",
        critChance: "0%",
        critDamage: "100%",
        placementCount: "3",
        totalCost: "$26,000",
    },

    placement: [
        {
            upgrade: 0, damage: "422", spa: "8.1", range: "21", cost: "1,150",
            attackName: "Water Blade",
            aoe: "Line 10",
            attackTime: "2.53",
            description: "Deals 4 ticks in a Line AoE (Size 10) over 2.53s"
        },
        {
            upgrade: 1, damage: "610", spa: "8", range: "22", cost: "1,650",
            attackName: "Water Blade",
            aoe: "Line 10",
            attackTime: "2.53",
        },
        {
            upgrade: 2, damage: "800", spa: "7.9", range: "22", cost: "2,200",
            attackName: "Water Blade",
            aoe: "Line 10",
            attackTime: "2.53",
        },
        {
            upgrade: 3, damage: "987", spa: "7.8", range: "23", cost: "2,900",
            attackName: "Ice Spikes",
            aoe: "Line 10",
            attackTime: "6.5",
            description: "Deals 3 ticks in a Line AoE (Size 10) over 6.5s"
        },
        {
            upgrade: 4, damage: "1,224", spa: "7.8", range: "23", cost: "3,400",
            attackName: "Ice Spikes",
            aoe: "Line 10",
            attackTime: "6.5",
        },
        {
            upgrade: 5, damage: "1,354", spa: "7.7", range: "24", cost: "4,050",
            attackName: "Ice Spikes",
            aoe: "Line 10",
            attackTime: "6.5",
        },
        {
            upgrade: 6, damage: "1,675", spa: "7.5", range: "25", cost: "4,900",
            attackName: "Ice Cube",
            aoe: "Circle 12.5",
            attackTime: "3.85",
            description: "Deals 1 tick in a Circle AoE (Size 12.5) over 3.85s"
        },
        {
            upgrade: 7, damage: "1,898", spa: "7.3", range: "26", cost: "5,750",
            attackName: "Ice Cube",
            aoe: "Circle 12.5",
            attackTime: "3.85",
        },
    ],

    passives: [
        {
            name: "Frost Bind",
            desc: `Every <b>15</b> seconds:<br>- Strongest enemy in range will <b>Freeze</b><br>- Enemy are either inflicted with <b>Freeze</b> for <b>10</b> hits, or <b>5</b> seconds`,
        },
        {
            name: "Shatter",
            desc: `Anytime this unit hits an enemy with <b>Freeze</b>:<br>- Deal <b>10%</b> of this unit's current damage around the enemy<br>When <b>Freeze</b> expires from an enemy:<br>- <b>Slow</b> enemy by <b>35%</b><br>If an enemy dies with <b>Freeze</b>:<br>- <b>3</b> nearest enemies will take <b>25%</b> of this unit's current damage`,
        },
    ],

    abilities: [
        {
            name: "Wall of Ice",
            desc: `On activation:<br>- Select a point on the path to spawn an <b>Ice Trap</b> (Capacity: <b>3</b>)<br>- <b>Ice Trap</b> has <b>100%</b> of this unit's current damage<br>Once placed:<br>- <b>Ice Trap</b> will gain <b>20%</b> HP per second (Capacity: <b>500%</b>)`,
            cooldown: "25s",
        },
    ],

    recommendedEquips: {
        unitEquip: "Spirit King's Blade",
        equip1: "Magic book",
        equip2: "Three Sword From Hell",
    },

    statusEffects: [
        {
            name: "Freeze",
            icon: "freeze",
            effect: "Freezes the strongest enemy in range for 10 hits or 5 seconds.",
            cooldown: "5s",
        },
        {
            name: "Slow",
            icon: "slow",
            effect: "Slows enemy by 35% after Freeze expires.",
            cooldown: "5s",
        },
    ],
};

export default unit;