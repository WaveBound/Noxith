export const unit = {
    id: "silverfalcon",
    name: "Silver Falcon",
    image: "Units/Image/SilverFalcon.png",
    ascend: 0,
    tiers: ["Secret"],
    update: "2.5",

    stats: {
        recommendedTrait: "Unbound",
        element: "Light",
        archetype: "Magical",
        damage: "3,158",
        spa: "6.2",
        range: "24",
        critChance: "0%",
        critDamage: "100%",
        placementCount: "1",
        totalCost: "$69,250",
    },

    placement: [
        {
            upgrade: 0, damage: "319", spa: "5.3", range: "17.5", cost: "2,000",
            attackName: "Divine Ray",
            aoe: "Circle 5",
            hitCount: 1,
            attackTime: "3.98",
            description: "Deals 1 tick in a Circle AoE (Size 5) over 3.98s"
        },
        {
            upgrade: 1, damage: "435", spa: "5.2", range: "18", cost: "3,350",
            attackName: "Divine Ray",
            aoe: "Circle 5",
            hitCount: 1,
            attackTime: "3.98",
        },
        {
            upgrade: 2, damage: "703", spa: "6", range: "19", cost: "4,600",
            attackName: "Holy Cross",
            aoe: "Line 10",
            hitCount: 2,
            attackTime: "5.12",
            description: "Deals 2 ticks in a Line AoE (Size 10) over 5.12s."
        },
        {
            upgrade: 3, damage: "907", spa: "5.8", range: "19.5", cost: "5,400",
            attackName: "Holy Cross",
            aoe: "Line 10",
            hitCount: 2,
            attackTime: "5.12",
        },
        {
            upgrade: 4, damage: "1,157", spa: "5.6", range: "20", cost: "7,000",
            attackName: "Holy Cross",
            aoe: "Line 10",
            hitCount: 2,
            attackTime: "5.12",
        },
        {
            upgrade: 5, damage: "1,500", spa: "5.6", range: "20.5", cost: "8,350",
            attackName: "Holy Cross",
            aoe: "Line 10",
            hitCount: 2,
            attackTime: "5.12",
        },
        {
            upgrade: 6, damage: "2,215", spa: "6.5", range: "22", cost: "10,000",
            attackName: "Radiant Excalibur",
            aoe: "Cone 60",
            hitCount: 1,
            attackTime: "4.2",
            description: "Deals 1 tick in a Cone AoE (Size 60) over 4.2s."
        },
        {
            upgrade: 7, damage: "2,700", spa: "6.4", range: "23", cost: "12,800",
            attackName: "Radiant Excalibur",
            aoe: "Cone 60",
            hitCount: 1,
            attackTime: "4.2",
        },
        {
            upgrade: 8, damage: "3,158", spa: "6.2", range: "24", cost: "15,750",
            attackName: "Radiant Excalibur",
            aoe: "Cone 60",
            hitCount: 1,
            attackTime: "4.2",
        },
    ],

    passives: [
        {
            name: "The Captain",
            desc: `On Placement:<br>- Increase all players' units' base damage by <b>10%</b> (+<b>1%</b> per upgrade)<br>- Increase all players' <b>Physical</b> Archetype units' damage by <b>5%</b> (+<b>1%</b> per upgrade)<br>- Increase all players' <b>Magical</b> Archetype units' damage by <b>5%</b> (+<b>1%</b> per upgrade)<br><br>The player's most equipped <b>Archetype</b> gains an additional <b>10%</b> damage.<br><b>Buffs</b> from <b>The Captain</b> do not stack.`,
        },
        {
            name: "The Falcon's Pawn",
            desc: `Every <b>20</b> seconds, any unit within this unit's range will have its Range increased by <b>15%</b> for <b>10</b> seconds.<br><br>For every unit buffed by both <b>The Captain</b> and <b>The Falcon's Pawn</b> at the same time (Capacity: <b>10</b>):<br>- Increase this unit's Critical Chance by <b>5%</b><br>- Increase this unit's Critical Damage by <b>5%</b><br>- Increase this unit's Range by <b>5%</b>`,
        },
        {
            name: "War Chest",
            desc: `This unit has a <b>Ambition Meter</b>, starting at 0. (Capacity: <b>50</b>)<br><br>Every <b>5</b> <b>Kills</b> (from any source):<br>- Increase <b>Ambition Meter</b> by <b>1</b><br><br>Everytime <b>Ambition Meter</b> increases:<br>- The next enemy <b>Kill</b> will drop <b>15%</b> more yen<br><br>Every stack of <b>Ambition Meter</b> will:<br>- Increase the dropped yen by <b>5%</b><br><br>This meter does not reset unless this unit is sold.`,
        },
    ],

    recommendedEquips: {
        unitEquip: "Chosen Sabre",
        equip1: "Magic Book",
        equip2: "Shinigami Sword",
    },

    statusEffects: [],
};

export default unit;
