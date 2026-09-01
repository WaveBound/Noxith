import { STATUS_ICONS, iconImg } from "./../icons/icons.js";

export const relicStats = {
    "Promise Ring": {
        stats: [
            { damage: { min: "+1%", max: "+10%" }, spa: { min: "-1%", max: "-5%" } },
        ],
        passive: {
            name: "Spirit Bats",
            desc: `Every 20 total stacks of Bleed in this unit's range:<br>- Summon a Bat Spirit at this unit's position (Capacity: 3)<br>- Bat Spirits will deal 25% of this unit's current damage per attack<br>- Bat Spirits despawn after 3 attacks`,
        },
    },

    "Elven Battle Staff": {
        stats: [
            { damage: { min: "+1%", max: "+5%" }, spa: { min: "-1%", max: "-5%" } },
        ],
        passive: {
            name: "Arcane Spells",
            desc: `Arcane Spells are considered Follow-Up Attacks<br>At 3 Charges, cast Old Magic<br>- Line AoE at 100% current damage<br>At 5 Charges, cast Eruption<br>- Circle AoE at 125% current damage, and inflict Mana Burn<br>At 7 Charges, cast Storm<br>- Full AoE at 150% current damage<br><br><i>Overrides original passive</i>`,
        },
    },

    "Dark Scepter": {
        stats: [
            { spa: { min: "-1%", max: "-5%" } },
            { range: { min: "+1%", max: "+5%" } },
        ],
        passive: {
            name: "Lightning Orbs & Ice Barrage",
            desc: `<b>Lightning Orbs:</b><br>On switching to Lightning Magic:<br>- Summon an Arc of Lightning on the path inside of this unit's range<br>- Enemies that are touching Arc of Lightning will take <b>50%</b> of this unit's current damage every 1 second<br><br><b>Ice Barrage:</b><br>On switching to Ice Magic:<br>- This unit gains Freeze on attack<br>On Regular Attack:<br>- Gain 1 stack of Frostbite per enemy hit (Capacity: 15)<br>At 15 Frostbite stacks:<br>- This unit's next attack against enemies inflicted with Freeze will shatter, unfreezing them and dealing 25% additional damage in a small AoE (5 range)`,
        },
    },

    "Illusion Crow": {
        stats: [
            { damage: { min: "+1%", max: "+10%" } },
            { range: { min: "+1%", max: "+5%" } },
        ],
        passive: {
            name: "Broken Mind",
            desc: `While an enemy is in Illusion state:<br>- Store all damage taken from this unit<br>When Illusion expires:<br>- Deal stored damage at 50% effectiveness in a small AoE (2 range)<br><br>Overrides original passive`,
        },
    },

    "Predator's Skull": {
        stats: [
            { range: { min: "+1%", max: "+5%" }, damage: { min: "+1%", max: "+10%" } },
        ],
        passive: {
            name: "Roar",
            desc: `Every 10 seconds:<br>- Unleash a Full AoE Roar attack dealing 70% of this unit's current damage and apply Stagger to enemies for 2 seconds<br>- For each enemy hit by this attack, this unit gains 1% Critical Chance (Capacity: 30%)<br><br>Overrides original passive`,
        },
    },

    "Memory Pendant": {
        stats: [
            { critChance: { min: "+1%", max: "+10%" }, damage: { min: "+1%", max: "+10%" } },
        ],
        passive: {
            name: "Reckless Control",
            desc: `This unit has Black Magic meter, starting at 0.<br>- When Black Magic Meter is increasing this unit will be in "Caring State"<br>- When Black Magic Meter is decreasing this unit will be in "Cold State"<br><br><b>Caring State:</b><br>- Every 1 seconds this unit walks increases this meter by 5<br>- Deal 50% of this unit's current damage in 75% of his range<br><br><b>Cold State:</b><br>- Every 1 seconds this unit walks decreases this meter by 2<br>- Deal 150% of this unit's current damage in 25% of his range<br><br>Overrides original passive`,
        },
    },

    "Pirate's Slingshot": {
        stats: [
            { range: { min: "+5%", max: "+15%" } },
        ],
    },

    "Elf Suitcase": {
        stats: [
            { range: { min: "+1%", max: "+5%" }, magicdamage: { min: "+1%", max: "+10%" } },
        ],
    },

    "Raid Cape": {
        stats: [
            { range: { min: "+1%", max: "+5%" }, damage: { min: "+1%", max: "+10%" } },
        ],
    },

    "Bamboo Bottle": {
        stats: [
            { range: { min: "+1%", max: "+10%" } },
        ],
        passive: {
            name: "Bamboo Bottle",
            desc: `Every time this unit uses an Active Ability, reduce the Active Ability cooldown by 1 to 2% (Capacity: 10%).`,
        },
    },

    "Magic Orb": {
        stats: [
            { range: { min: "+1%", max: "+10%" }, damage: { min: "+1%", max: "+5%" } },
        ],
    },

    "Soul Splitter": {
        stats: [
            { range: { min: "+1%", max: "+5%" }, physicaldamage: { min: "+1%", max: "+10%" } },
        ],
    },

    "Dragon Hilt": {
        stats: [
            { critDamage: { min: "+1%", max: "+10%" }, critChance: { min: "+1%", max: "+5%" } },
        ],
    },

    "Magic Book": {
        stats: [
            { magicdamage: { min: "+1%", max: "+20%" } },
        ],
    },

    "Kunai": {
        stats: [
            { damage: { min: "+1%", max: "+10%" } },
            { spa: { min: "-1%", max: "-5%" } },
        ],
    },

    "Enhanced Katana": {
        stats: [
            { critChance: { min: "+1%", max: "+10%" } },
            { critDamage: { min: "+1%", max: "+5%" } },
        ],
    },

    "Three Swords From Hell": {
        stats: [
            { damage: { min: "+5%", max: "+15%" } },
        ],
    },

    "Shinigami Sword": {
        stats: [
            { damage: { min: "+1%", max: "+5%" } },
            { critChance: { min: "+1%", max: "+10%" } },
        ],
        passive: {
            name: "Shinigami Sword",
            desc: `Increases damage by 0.5% to 1% for each enemy in range. (Capacity: 15%)`,
        },
    },

    "Staff of Chaos": {
        stats: [
            { magicdamage: { min: "+1%", max: "+10%" } },
            { spa: { min: "-1%", max: "-5%" } },
        ],
    },

    "Warrior's Axe": {
        stats: [
            { physicaldamage: { min: "+1%", max: "+10%" } },
            { spa: { min: "-1%", max: "-5%" } },
        ],
    },

    "Katana": {
        stats: [
            { physicaldamage: { min: "+1%", max: "+10%" } },
            { damage: { min: "+1%", max: "+5%" } },
        ],
    },

    "Accursed Equipment": {
        stats: [
            { spa: { min: "-1%", max: "-10%" } },
        ],
    },

    "Red Finger": {
        stats: [
            { damage: { min: "+1%", max: "+10%" } },
            { critChance: { min: "+1%", max: "+5%" } },
        ],
        passive: {
            name: "Cursed Finger",
            desc: `Increase Bleed DoT Damage by <b>2% to 5%</b> per Bleed stack applied to an enemy. (Capacity: 20%)`,
        },
    },

    "Hexed Blade": {
        stats: [
            { range: { min: "+1%", max: "+5%" } },
            { damage: { min: "+1%", max: "+10%" } },
        ],
        passive: {
            name: "Winged Spirit",
            desc: `On Upgrade 3:<br>- Summon a Winged Spirit at this unit's position that will circle at 50% of this unit's range<br>- Winged Spirit will deal 75% of this unit's damage every 5 seconds in its current location and apply Stun<br><br>Overrides original passive`,
        },
    },

    "Hair Bells": {
        stats: [
            { range: { min: "+1%", max: "+5%" } },
            { damage: { min: "+1%", max: "+10%" } },
        ],
        passive: {
            name: "Demonic Presence & Savage Rebound",
            desc: `Enemies within 50% range will take 15% of this unit's current damage every 1 second.<br><br>When this unit is stunned:<br>- Immediately Cleanse the stun<br>Follow-Up Attack (Thunderclap Cut) at 125% current damage<br>All of this unit's Follow-Up Attacks apply Dismembered to enemies<br><br>Overrides original passive`,
        },
    },

    "Spirit of the Moonblade": {
        stats: [
            { critDamage: { min: "+1%", max: "+10%" } },
            { critChance: { min: "+1%", max: "+10%" } },
        ],
        passive: {
            name: "Adaptation",
            desc: `This unit gains permanent Buffs after attacking different enemy types:<br>For each enemy type attacked:<br>- Increase Damage by 10%<br>- Increase Critical Chance by 10%<br><br>Overrides original passive`,
        },
    },

    "Calamity's Eye": {
        stats: [
            { range: { min: "+1%", max: "+5%" } },
            { damage: { min: "+1%", max: "+10%" } },
        ],
        passive: {
            name: "Puppet Creation",
            desc: `When an enemy with Puppet Mark from this unit dies:<br>- Summon a Doll in front of the killed enemy. (Capacity: 1)<br>- Dolls will have 200% of this unit's current damage as health<br><br>Overrides original passive`,
        },
    },

    "Boulder": {
        stats: [
            { range: { min: "+1%", max: "+5%" } },
            { spa: { min: "-1%", max: "-5%" } },
        ],
        passive: {
            name: "Stone Wall",
            desc: `Summon a Stone Wall every 12 seconds. (Capacity: 2)<br>- In Base Form: Stone Wall will have 75% of this unit's current damage as health<br>- In Giant Form: Stone Wall will have 50% of this unit's current damage as health<br><br>Overrides original passive`,
        },
    },

    "Webbed Fruit": {
        stats: [
            { range: { min: "+1%", max: "+10%" } },
            { spa: { min: "-1%", max: "-5%" } },
        ],
        passive: {
            name: "Cocoon of Carnage",
            desc: `Every 5 Regular Attacks will Cocoon the enemies hit:<br>- Enemies are either stunned for 10 hits, or 5 seconds<br>If the Cocoon is broken after 10 hits:<br>- Deal 125% of this unit's current damage<br>If the Cocoon is not broken before 5 seconds:<br>Cocoon despawns<br><br>Overrides original passive`,
        },
    },

    "Emperor's Attire": {
        stats: [
            { range: { min: "+1%", max: "+5%" } },
            { damage: { min: "+1%", max: "+10%" } },
        ],
        passive: {
            name: "Wildfire",
            desc: `On applying Burn:<br>- Spread to the nearest 5 nearest enemies, that do not have Burn applied<br><br>Overrides original passive`,
        },
    },

    "Hell's Flower": {
        stats: [
            { spa: { min: "-1%", max: "-5%" } },
            { damage: { min: "+1%", max: "+10%" } },
        ],
        passive: {
            name: "Radial Flames",
            desc: `If an enemy with Burn stops ticking within this unit's range:<br>- Convert 1 Burn application into Austere Flames dealing 85% of this unit's current damage<br>- Instance of Austere Flames from Radial Flames do not stack<br><br>Overrides original passive`,
        },
    },

    "Technique Amplifier": {
        stats: [
            { range: { min: "+1%", max: "+5%" } },
            { spa: { min: "-1%", max: "-5%" } },
        ],
        passive: {
            name: "Crumble Away",
            desc: `Apply Slow based on current attack:<br>Explode - 20%<br>Blast Away - 35%<br>Twist - 50%<br>Crush - 65%<br><br>Overrides original passive`,
        },
    },

    "Royal Gi": {
        stats: [
            { damage: { min: "+10%", max: "+10%" } },
            { range: { min: "+5%", max: "+5%" } },
        ],
        passive: {
            name: "Royal Rivalry",
            desc: `For every Regular Attack from another unit in this unit's range:<br>- Increase this unit's damage by 5% (Capacity: 50%)<br>For every Critical Attack from another unit in this unit's range:<br>- Increase this unit's critical chance by 10% (Capacity: 50%)<br>For every Follow-Up Attack from another unit in this unit's range:<br>- Increase this unit's critical damage by 10% (Capacity: 30%)`,
        },
    },

    "Carrot's Gi": {
        stats: [
            { damage: { min: "+10%", max: "+10%" } },
            { range: { min: "+5%", max: "+5%" } },
        ],
        passive: {
            name: "Instant Relocation",
            desc: `Select a unit on the map or a position within this unit's range to <b>Relocate</b> to for <b>15</b> seconds.<br>On <b>Relocate</b> to a unit:<br>- Immediately perform a <b>Follow-Up Attack</b> dealing <b>125%</b> of this unit's current damage<br>- Trigger the selected unit to perform the same <b>Follow-Up Attack</b> dealing <b>125%</b> of the selected unit's current damage<br>On <b>Relocate</b> to a position:<br>- Immediately perform a <b>Follow-Up Attack</b> dealing <b>125%</b> of this unit's current damage<br>- Increase this unit's Damage by <b>50%</b> for <b>15</b> seconds<br><br><i>20s CD | Local Cooldown | Unlocks on Upgrade 8</i>`,
        },
    },

    "Mechanical Wings": {
        stats: [
            { damage: { min: "+10%", max: "+10%" } },
            { range: { min: "+5%", max: "+5%" } },
        ],
        passive: {
            name: "Genetic Duplication",
            desc: `On activation:<br>- Summon 1 Mini Bioinsect at this unit's position (Capacity: 1)<br>Mini Bioinsect will:<br>- Take 45% of this unit's current damage as its own damage<br>- Have 100% of this unit's current SPA<br>- Have 100% of this unit's current range<br>- Increase the damage of strongest unit in range by 10%<br>Mini Bioinsect is permanently in Imperfect form, and does not have passives or abilities.`,
        },
    },

    "Mentors Cape": {
        stats: [
            { range: { min: "+1%", max: "+1.18%" } },
            { spa: { min: "-1%", max: "-2.96%" } },
        ],
        passive: {
            name: "Hidden Potential",
            desc: `On Upgrade 3:<br>- Transform into Prodigy Transformation<br>- Every 3 Regular Attacks will deal 50% of this unit's damage to all enemies within its range<br>On Upgrade 5:<br>- Unlock Rage Unleashed`,
        },
    },

    "Warrior Pole": {
        stats: [
            { physicaldamage: { min: "+1%", max: "+10%" } },
            { damage: { min: "+1%", max: "+5%" } },
        ],
        passive: {
            name: "Warrior Pole",
            desc: `Increase unit damage by 1% to 20% while Transformed`,
        },
    },

    "Pointy Straw": {
        stats: [
            { damage: { min: "+1%", max: "+10%" } },
            { range: { min: "+1%", max: "+5%" } },
        ],
        passive: {
            name: "Precision Slash",
            desc: `Every <b>4 Regular Attacks</b>:<br>- Inflict enemies with <b>The Drink Mark</b> for <b>15</b> seconds<br><b>The Drink Mark</b> will:<br>- Increase all <b>Follow-Up Attack</b> damage by <b>25%</b><br>- Apply a <b>Physical</b> weakness at <b>10%</b>`,
        },
    },

    "Fiery Staff": {
        stats: [
            { damage: { min: "+1%", max: "+10%" } },
            { range: { min: "+1%", max: "+5%" } },
        ],
        passive: {
            name: "Equipment Passive South",
            desc: `On Takedown within this unit's range:<br>- Transform the enemy into a Skeleton (Capacity: 5)<br>Each Skeleton will act as a Path Trap:<br>- When touched by an enemy, deal 50% of this unit's current damage<br>- Explode and apply Burn to enemies within 3 range<br>Each Skeleton summoned will:<br>- Increase this unit's damage by 5%`,
        },
    },

    "Lightning Dagger": {
        stats: [
            { range: { min: "+1%", max: "+10%" } },
            { damage: { min: "+1%", max: "+5%" } },
        ],
        passive: {
            name: "Djinn's Judgment",
            desc: `Every 7 seconds summon a Lightning Strike on the strongest enemy in this unit's range:<br>- Lightning Strike deals 100% of this unit's damage<br>- Lightning Strike will chain between 5 enemies<br>- Each chain deals 25% of this unit's current damage<br>- Each chain will also apply Freeze`,
        },
    },
};

export function getRelicStatsByName(name) {
    if (!name) return null;
    const key = Object.keys(relicStats).find(
        (k) => k.toLowerCase() === String(name).toLowerCase()
    );
    return key ? relicStats[key] : null;
}