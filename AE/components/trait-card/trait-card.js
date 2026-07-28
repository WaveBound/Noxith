// Enable the Traits page
export const IS_TRAITS_PUBLISHED = true;

export const traits = [
  {
    id: "unbound",
    name: "Unbound",
    image: "assets/placeholder.svg",
    rarity: "Mythic",
    rainbow: true,
    dropRate: "0.1%",
    rateNum: 0.1,
    pity: 1500,
    description: "Increase DMG by 350% - Decrease SPA by 5% - Increase Range by 10% (Single Placement)",
    stats: [
      { label: "DMG", value: "+350%" },
      { label: "SPA", value: "-5%" },
      { label: "Range", value: "+10%" },
      { label: "Placement", value: "Single" },
    ]
  },
  {
    id: "primordial",
    name: "Primordial",
    image: "assets/placeholder.svg",
    rarity: "Mythic",
    rainbow: true,
    dropRate: "0.2%",
    rateNum: 0.2,
    pity: 750,
    description: "Increase DMG by 35% - Decrease SPA by 15% - Increase Range by 20%",
    stats: [
      { label: "DMG", value: "+35%" },
      { label: "SPA", value: "-15%" },
      { label: "Range", value: "+20%" },
    ]
  },
  {
    id: "forsaken",
    name: "Forsaken",
    image: "assets/placeholder.svg",
    rarity: "Mythic",
    rainbow: true,
    dropRate: "0.3%",
    rateNum: 0.3,
    pity: 500,
    description: "Increase Crit DMG by 35% - Increase Crit Chance by 35% - Increase Range by 10%",
    stats: [
      { label: "Crit DMG", value: "+35%" },
      { label: "Crit Chance", value: "+35%" },
      { label: "Range", value: "+10%" },
    ]
  },
  {
    id: "draconic",
    name: "Draconic",
    image: "assets/placeholder.svg",
    rarity: "Mythic",
    rainbow: true,
    dropRate: "0.5%",
    rateNum: 0.5,
    pity: 300,
    description: "Increase DMG by 20% - Increase DOT Damage by 50% - Decrease Overall cost by 10%",
    stats: [
      { label: "DMG", value: "+20%" },
      { label: "DOT DMG", value: "+50%" },
      { label: "Cost", value: "-10%" },
    ]
  },
  {
    id: "investor",
    name: "Investor",
    image: "assets/placeholder.svg",
    rarity: "Legendary",
    color: "#f59e0b",
    dropRate: "2%",
    rateNum: 2.0,
    pity: null,
    description: "Increase money-farm income by 25%",
    stats: [{ label: "Income", value: "+25%" }]
  },
  {
    id: "optics",
    name: "Optics",
    image: "assets/placeholder.svg",
    rarity: "Legendary",
    color: "#f59e0b",
    dropRate: "3%",
    rateNum: 3.0,
    pity: null,
    description: "Increase RNG by 25%",
    stats: [{ label: "Range", value: "+25%" }]
  },
  {
    id: "bolt",
    name: "Bolt",
    image: "assets/placeholder.svg",
    rarity: "Legendary",
    color: "#f59e0b",
    dropRate: "4%",
    rateNum: 4.0,
    pity: null,
    description: "Decrease SPA by 15%",
    stats: [{ label: "SPA", value: "-15%" }]
  },
  {
    id: "precision2",
    name: "Precision 2",
    image: "assets/placeholder.svg",
    rarity: "Legendary",
    color: "#f59e0b",
    dropRate: "4%",
    rateNum: 4.0,
    pity: null,
    description: "Increase Critical Chance by 20% - Increase Critical Damage by 10%",
    stats: [
      { label: "Crit Chance", value: "+20%" },
      { label: "Crit DMG", value: "+10%" },
    ]
  },
  {
    id: "precision1",
    name: "Precision 1",
    image: "assets/placeholder.svg",
    rarity: "Epic",
    color: "#eab308",
    dropRate: "6%",
    rateNum: 6.0,
    pity: null,
    description: "Increase Critical Chance by 10% - Increase Critical Damage by 5%",
    stats: [
      { label: "Crit Chance", value: "+10%" },
      { label: "Crit DMG", value: "+5%" },
    ]
  },
  {
    id: "limitbreaker",
    name: "Limit Breaker",
    image: "assets/placeholder.svg",
    rarity: "Epic",
    color: "#eab308",
    dropRate: "6%",
    rateNum: 6.0,
    pity: null,
    description: "Increase DMG by 15%",
    stats: [{ label: "DMG", value: "+15%" }]
  },
  {
    id: "range2",
    name: "Range 2",
    image: "assets/placeholder.svg",
    rarity: "Rare",
    color: "#38bdf8",
    dropRate: "7%",
    rateNum: 7.0,
    pity: null,
    description: "Increase RNG by 10%",
    stats: [{ label: "Range", value: "+10%" }]
  },
  {
    id: "speed2",
    name: "Speed 2",
    image: "assets/placeholder.svg",
    rarity: "Rare",
    color: "#38bdf8",
    dropRate: "7%",
    rateNum: 7.0,
    pity: null,
    description: "Decrease SPA by 10%",
    stats: [{ label: "SPA", value: "-10%" }]
  },
  {
    id: "strength2",
    name: "Strength 2",
    image: "assets/placeholder.svg",
    rarity: "Rare",
    color: "#38bdf8",
    dropRate: "7%",
    rateNum: 7.0,
    pity: null,
    description: "Increase DMG by 10%",
    stats: [{ label: "DMG", value: "+10%" }]
  },
  {
    id: "enlightenment",
    name: "Enlightenment",
    image: "assets/placeholder.svg",
    rarity: "Rare",
    color: "#38bdf8",
    dropRate: "9%",
    rateNum: 9.0,
    pity: null,
    description: "Increase Exp by 50%",
    stats: [{ label: "EXP", value: "+50%" }]
  },
  {
    id: "range1",
    name: "Range 1",
    image: "assets/placeholder.svg",
    rarity: "Common",
    color: "#60a5fa",
    dropRate: "14.63%",
    rateNum: 14.63,
    pity: null,
    description: "Increase RNG by 5%",
    stats: [{ label: "Range", value: "+5%" }]
  },
  {
    id: "speed1",
    name: "Speed 1",
    image: "assets/placeholder.svg",
    rarity: "Common",
    color: "#60a5fa",
    dropRate: "14.63%",
    rateNum: 14.63,
    pity: null,
    description: "Decrease SPA by 5%",
    stats: [{ label: "SPA", value: "-5%" }]
  },
  {
    id: "strength1",
    name: "Strength 1",
    image: "assets/placeholder.svg",
    rarity: "Common",
    color: "#60a5fa",
    dropRate: "14.64%",
    rateNum: 14.64,
    pity: null,
    description: "Increase DMG by 5%",
    stats: [{ label: "DMG", value: "+5%" }]
  }
];