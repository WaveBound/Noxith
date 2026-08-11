export const unit = {
    id: "prodigyrage",
    name: "Prodigy (Rage)",
    image: "Units/Image/ProdigyRage.png",
    ascend: 3,
    element: "Light",
    archetype: "Physical",

    stats: {
        recommendedTrait: "Unbound",
        element: "Light",
        archetype: "Physical",
        damage: "4,113",
        spa: "8",
        range: "25",
        critChance: "0%",
        critDamage: "100%",
        placementCount: "3",
        totalCost: "$32,900",
    },

    placement: [
        {
            upgrade: 0, damage: "509", spa: "5.6", range: "18", cost: "1,150",
            attackName: "Instantaneous Strike",
            aoe: "Circle 10",
            attackTime: "2.74",
            description: "Deals 3 hits in a Circle AoE (Size 10) over 2.74s"
        },
        {
            upgrade: 1, damage: "665", spa: "5.5", range: "18", cost: "2,000",
            attackName: "Instantaneous Strike",
            aoe: "Circle 10",
            attackTime: "2.74",
        },
        {
            upgrade: 2, damage: "952", spa: "5.5", range: "19", cost: "2,500",
            attackName: "Instantaneous Strike",
            aoe: "Circle 10",
            attackTime: "2.74",
        },
        {
            upgrade: 3, damage: "1,309", spa: "5.4", range: "20", cost: "3,750",
            attackName: "Instantaneous Strike",
            aoe: "Circle 10",
            attackTime: "2.74",
        },
        {
            upgrade: 4, damage: "1,612", spa: "5.3", range: "21", cost: "5,000",
            attackName: "Light Rays",
            aoe: "Circle 11",
            attackTime: "3.97",
            description: "Deals 2 ticks in a Circle AoE (Size 11) over 3.97s"
        },
        {
            upgrade: 5, damage: "1,925", spa: "5.3", range: "21", cost: "5,000",
            attackName: "Light Rays",
            aoe: "Circle 11",
            attackTime: "3.97",
        },
        {
            upgrade: 6, damage: "2,259", spa: "5.2", range: "22", cost: "5,500",
            attackName: "Light Rays",
            aoe: "Circle 11",
            attackTime: "3.97",
        },
        {
            upgrade: 7, damage: "4,113", spa: "8", range: "25", cost: "8,000",
            attackName: "Destructive Punches",
            aoe: "Circle 12.5",
            attackTime: "5.98",
            description: "Deals 4 ticks in a Circle AoE (Size 12.5) over 5.98s"
        },
    ],

    passives: [
        {
            name: "Hidden Potential",
            desc: `On Upgrade 3:<br>- Transform into Prodigy Transformation<br>- Every 3 Regular Attacks will deal 50% of this unit's damage to all enemies within its range<br>On Upgrade 5:<br>- Unlock Rage Unleashed`,
        },
        {
            name: "Unyielding Spirit",
            desc: `On Regular Attack against an enemy with a Status Effect:<br>- Deal 10% increased damage per stack of each Status Effect (Cap: 100)<br>If the Status Effect is a DOT:<br>- Refresh the duration<br>- Change the source to this unit<br>- This can only trigger once per DOT type per enemy`,
        },
        {
            name: "Rage Unleashed",
            desc: `This unit has Prodigy Meter, starting at 0.<br>On Regular Attack:<br>- Increase Prodigy Meter by 5<br>When enemies leave this unit's range:<br>- Increase Prodigy Meter by 1<br>At 100 Prodigy Meter stacks:<br>- Remove Prodigy Meter<br>- Transform this unit into Prodigy Transformation 2<br>In Prodigy Transformation 2 form:<br>- Increase this unit's damage by 25%<br>- Every 3 Regular Attacks will deal 75% of this unit's damage to all enemies within its range`,
        },
    ],

    abilities: [
        {
            name: "Father and Son Spirit Energy",
            cooldown: "90s CD",
            type: "Per Player Cooldown",
            desc: `On activation:<br>- Select a point within this unit's range to fire Father and Son Spirit Energy at for 10 seconds<br>Enemies in Father and Son Spirit Energy will:<br>- Take 75% of this unit's damage every 1 seconds<br>This unit will not Attack whilst this ability is active.`,
        },
    ],

    recommendedEquips: {
        unitEquip: "Mentors Cape",
        equip1: "Shinigami Sword",
        equip2: "Warrior Pole",
    },
};

export default unit;
