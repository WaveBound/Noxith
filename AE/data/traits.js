// Trait catalog. Append new objects to add traits — no HTML changes needed.
//
// Each trait uses the same stat-modifier shape as relics:
//   stats: [ { damage: "+350%" }, { spa: "-5%" }, ... ]
// Rarity drives the card accent color (rarityColor) and the drop-rate badge.
//   dropRate: display string for the base roll chance
//   pity:     number of rolls until a guaranteed pull

export const traits = [
  {
    id: "Unbound",
    name: "Unbound",
    image: "icons/traits/Unbound.png",
    rarity: "Mythic",
    rarityColor: "#a855f7",
    dropRate: "0.1%",
    pity: 1500,
    stats: [
      { damage: "+350%" },
      { spa: "-5%" },
      { range: "+10%" },
      { placement: "1" },
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
    stats: [
      { damage: "+35%" },
      { spa: "-15%" },
      { range: "+20%" },
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
    stats: [
      { critDamage: "+35%" },
      { critChance: "+35%" },
      { range: "+10%" },
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
    stats: [
      { damage: "+20%" },
      { dotDamage: "+50%" },
      { range: "+10%" },
    ],
  },
];
