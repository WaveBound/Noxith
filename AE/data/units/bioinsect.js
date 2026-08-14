export const unit = {
    id: "bioinsectfinal",
    name: "Bioinsect (Final Form)",
    image: "Units/Image/BioinsectFinalForm.png",
    ascend: 3,
    tiers: [],

    stats: {
        recommendedTrait: "Primordial",
        element: "Terra",
        archetype: "Magical",
        damage: "0",   // Base damage is derived from a copied unit — handled dynamically in dps-math
        spa: "5",
        range: "21",
        critChance: "0%",
        critDamage: "50%",
        placementCount: "3",
        totalCost: "$1,350",
    },

    // Single placement — no upgrades, just base form
    placement: [
        {
            upgrade: 0, damage: "0", spa: "5", range: "21", cost: "1,350",
            attackName: "Piercing Ray",
            aoe: "Line 10",
            hitCount: 5,
            attackTime: "2",
            description: "Deal 5 ticks in a Line AoE (Size 10) per attack cycle",
        },
    ],

    passives: [
        {
            name: "Passive Absorption",
            desc: `After this unit scores 50 takedowns in Imperfect form:<br>- Spawn <b>Mecha 17</b> as an enemy Boss<br>- <b>Mecha 17</b> health is <b>10000</b><br>When <b>Mecha 17</b> is defeated:<br>- This unit transforms from Imperfect to Semiperfect form<br>After this unit scores 50 takedowns in Semiperfect form:<br>- Spawn <b>Mecha 18</b> as an enemy Boss<br>- <b>Mecha 18</b> health is <b>20000</b><br>When <b>Mecha 18</b> is defeated:<br>- This unit transforms from Semiperfect to Perfect form`,
        },
        {
            name: "Genetic Code",
            desc: `In Imperfect form:<br>- Copy <b>50%</b> base damage of the strongest unit in range<br><br>In Semiperfect form:<br>- This unit gains <b>Bio Gel</b> on attack<br>- Unlock <b>Genetic Duplication</b><br><b>Bio Gel</b> will:<br>- <b>Slow</b> enemies by <b>60%</b> for <b>5</b> seconds<br>- <b>Stun</b> enemies for <b>3</b> seconds on expiry<br>In Perfect form:<br>Unlock <b>Bio Reset</b><br>On <b>Takedown</b> of an enemy inflicted with <b>Bio Gel</b>:<br>- Increase this unit's range by <b>0.2%</b> (Capacity: <b>30%</b>)<br>- Increase this unit's AoE size by <b>0.4%</b> (Capacity: <b>20%</b>)`,
        },
    ],

    abilities: [
        {
            name: "Genetic Duplication",
            cooldown: "PerUnit Cooldown",
            desc: `On activation:<br>Summon <b>1 Mini Bioinsect</b> at this unit's position (Capacity: <b>1</b>)<br><b>Mini Bioinsect</b> will:<br>- Take <b>35%</b> of this unit's current damage as its own damage<br>- Have <b>100%</b> of this unit's current SPA<br>- Have <b>100%</b> of this unit's current range as its range<br><b>Mini Bioinsect</b> is permanently in Imperfect form, and does not have passives or abilities.`,
        },
        {
            name: "Bio Reset",
            cooldown: "PerUnit Cooldown",
            desc: `On activation:<br>- This unit will reset back to Imperfect form<br>- Permanently increase its own damage by <b>1%</b><br>- Permanently increase its own range by <b>1%</b> (Capacity: <b>15%</b>)`,
        },
    ],

    // Summon configuration for Imperfect/Semiperfect form Mini Bioinsect
    // baseDamageMultiplier is 0.35 base; 0.45 with Mechanical Wings relic
    summons: {
        id: "minibioinsect",
        name: "Mini Bioinsect",
        countPerPlacement: 1,
        baseDamageMultiplier: 0.35,
        noShinigamiPassive: true,
        relicModifiers: [
            {
                relicName: "Mechanical Wings",
                damageMultiplierOverride: 0.45,
            }
        ],
    },

    recommendedEquips: {
        unitEquip: "Mechanical Wings",
        equip1: "Shinigami Sword",
        equip2: "Three Swords From Hell",
    },

    // Custom flag to mark this unit as Bioinsect so dps-math handles it specially
    isBioinsectUnit: true,
};

export default unit;
