// Set to true when you are ready to publish the Traits tab
export const IS_TRAITS_PUBLISHED = true;

export const traits = [
  {
    id: "Unbound",
    name: "Unbound",
    image: "icons/traits/Unbound.png",
    rarity: "Mythic",
    rarityColor: "#a855f7",
    dropRate: "0.1%",
    pity: 1500,
    description: "Massive damage boost at the cost of restricting placement count to 1 unit.",
    stats: [
      { key: "damage", label: "DMG", value: "+350%", type: "buff" },
      { key: "spa", label: "SPA", value: "-5%", type: "buff" },
      { key: "range", label: "RNG", value: "+10%", type: "buff" },
      { key: "placement", label: "PLACE", value: "1 Max", type: "limit" },
    ],
  },
  {
    id: "Primordial",
    name: "Primordial",
    image: "icons/traits/Primordial.png",
    rarity: "Mythic",
    rarityColor: "#a855f7",
    dropRate: "0.2%",
    pity: 750,
    description: "Balanced high-tier trait boosting raw damage, attack speed, and range.",
    stats: [
      { key: "damage", label: "DMG", value: "+35%", type: "buff" },
      { key: "spa", label: "SPA", value: "-15%", type: "buff" },
      { key: "range", label: "RNG", value: "+20%", type: "buff" },
    ],
  },
  {
    id: "Forsaken",
    name: "Forsaken",
    image: "icons/traits/Forsaken.png",
    rarity: "Mythic",
    rarityColor: "#a855f7",
    dropRate: "0.3%",
    pity: 500,
    description: "Critical strike specialization granting high Crit Rate and Crit Damage.",
    stats: [
      { key: "critChance", label: "CRIT", value: "+35%", type: "buff" },
      { key: "critDamage", label: "CDMG", value: "+35%", type: "buff" },
      { key: "range", label: "RNG", value: "+10%", type: "buff" },
    ],
  },
  {
    id: "Draconic",
    name: "Draconic",
    image: "icons/traits/Draconic.png",
    rarity: "Mythic",
    rarityColor: "#a855f7",
    dropRate: "0.5%",
    pity: 300,
    description: "Empowers status effect damage for units with Bleed or DoT abilities.",
    stats: [
      { key: "damage", label: "DMG", value: "+20%", type: "buff" },
      { key: "dotDamage", label: "DOT", value: "+50%", type: "buff" },
      { key: "range", label: "RNG", value: "+10%", type: "buff" },
    ],
  },
];