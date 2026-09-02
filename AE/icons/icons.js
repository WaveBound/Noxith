const BASE_URL = new URL('../', import.meta.url).href;

export function toAbsoluteUrl(relativePath) {
    if (!relativePath) return "";
    if (relativePath.startsWith("http://") || relativePath.startsWith("https://") || relativePath.startsWith("data:")) {
        return relativePath;
    }
    const clean = relativePath.replace(/^(\.\/|\/)+/, "");
    try {
        return new URL(clean, BASE_URL).href;
    } catch (e) {
        return clean;
    }
}

export const UNIT_INFO_ICONS = {
    totalCost: toAbsoluteUrl("icons/unit-info/Yen.png"),
    yen: toAbsoluteUrl("icons/unit-info/Yen.png"),
    damage: toAbsoluteUrl("icons/unit-info/Damage.png"),
    spa: toAbsoluteUrl("icons/unit-info/Spa.png"),
    range: toAbsoluteUrl("icons/unit-info/Range.png"),
    critChance: toAbsoluteUrl("icons/unit-info/CritRate.png"),
    critDamage: toAbsoluteUrl("icons/unit-info/CritDamage.png"),
};

export const ELEMENT_ICONS = {
    hydro: toAbsoluteUrl("icons/elements/Hydro.png"),
    flame: toAbsoluteUrl("icons/elements/Flame.png"),
    terra: toAbsoluteUrl("icons/elements/Terra.png"),
    gale: toAbsoluteUrl("icons/elements/Gale.png"),
    storm: toAbsoluteUrl("icons/elements/Storm.png"),
    light: toAbsoluteUrl("icons/elements/Light.png"),
    dark: toAbsoluteUrl("icons/elements/Dark.png"),
    neutral: toAbsoluteUrl("icons/elements/Neutral.png"),
};

export const ARCHETYPE_ICONS = {
    magical: toAbsoluteUrl("icons/archetypes/Magical.png"),
    physical: toAbsoluteUrl("icons/archetypes/Physical.png"),
    psychic: toAbsoluteUrl("icons/archetypes/Psychic.png"),
};

export const STATUS_ICONS = {
    bleed: toAbsoluteUrl("icons/status/bleed.png"),
    burn: toAbsoluteUrl("icons/status/Burn.png"),
    austereflames: toAbsoluteUrl("icons/status/AustereFlames.png"),
    manaburn: toAbsoluteUrl("icons/status/ManaBurn.png"),
    freeze: toAbsoluteUrl("icons/status/freeze.png"),
    slow: toAbsoluteUrl("icons/status/Slow.png"),
    stun: toAbsoluteUrl("icons/status/Stun.png"),
    puppetmark: toAbsoluteUrl("icons/status/PuppetMark.png"),
    dismembered: toAbsoluteUrl("icons/status/Dismembered.png"),
    blackfire: toAbsoluteUrl("icons/status/BlackFire.png"),
    illusion: toAbsoluteUrl("icons/status/Illusion.png"),
    crimsonmark: toAbsoluteUrl("icons/status/CrimsonMark.png"),
    thedrinkmark: toAbsoluteUrl("icons/status/TheDrinkMark.png"),
    rewind: toAbsoluteUrl("icons/status/Rewind.png"),
    electricity: toAbsoluteUrl("icons/status/Electricity.png"),
};

export const RELIC_ICONS = {
    "relic-promise-ring": toAbsoluteUrl("icons/relics/PromiseRing.png"),
    "relic-elven-battle-staff": toAbsoluteUrl("icons/relics/ElvenBattleStaff.png"),
    "relic-kunai": toAbsoluteUrl("icons/relics/Kunai.png"),
    "relic-enhanced-katana": toAbsoluteUrl("icons/relics/EnhancedKatana.png"),
    "relic-three-swords-from-hell": toAbsoluteUrl("icons/relics/ThreeSwordsFromHell.png"),
    "relic-shinigami-sword": toAbsoluteUrl("icons/relics/ShinigamiSword.png"),
    "relic-staff-of-chaos": toAbsoluteUrl("icons/relics/StaffofChaos.png"),
    "relic-warriors-axe": toAbsoluteUrl("icons/relics/WarriorAxe.png"),
    "relic-katana": toAbsoluteUrl("icons/relics/Katana.png"),
    "relic-accursed-equipment": toAbsoluteUrl("icons/relics/AccursedEquipment.png"),
    "relic-red-finger": toAbsoluteUrl("icons/relics/RedFinger.png"),
    "relic-magic-book": toAbsoluteUrl("icons/relics/MagicBook.png"),
    "relic-pointy-straw": toAbsoluteUrl("icons/relics/PointyStraw.png"),
    "relic-fiery-staff": toAbsoluteUrl("icons/relics/FieryStaff.png"),
    "relic-lightning-dagger": toAbsoluteUrl("icons/relics/LightningDagger.png"),
    "relic-storm-trident": toAbsoluteUrl("icons/relics/StormTrident.png"),
};

export function relicImg(id) {
    return RELIC_ICONS[id] || toAbsoluteUrl("assets/placeholder.svg");
}

const RELIC_NAME_TO_IMG = {
    "Promise Ring": RELIC_ICONS["relic-promise-ring"],
    "Elven Battle Staff": RELIC_ICONS["relic-elven-battle-staff"],
    "Kunai": RELIC_ICONS["relic-kunai"],
    "Enhanced Katana": RELIC_ICONS["relic-enhanced-katana"],
    "Three Swords From Hell": RELIC_ICONS["relic-three-swords-from-hell"],
    "Shinigami Sword": RELIC_ICONS["relic-shinigami-sword"],
    "Staff of Chaos": RELIC_ICONS["relic-staff-of-chaos"],
    "Warrior's Axe": RELIC_ICONS["relic-warriors-axe"],
    "Katana": RELIC_ICONS["relic-katana"],
    "Accursed Equipment": RELIC_ICONS["relic-accursed-equipment"],
    "Red Finger": RELIC_ICONS["relic-red-finger"],
    "Magic Book": RELIC_ICONS["relic-magic-book"],
    "Predator's Skull": toAbsoluteUrl("icons/relics/PredatorsSkull.png"),
    "Memory Pendant": toAbsoluteUrl("icons/relics/MemoryPendant.png"),
    "Pirate's Slingshot": toAbsoluteUrl("icons/relics/PiratesSlingshot.png"),
    "Elf Suitcase": toAbsoluteUrl("icons/relics/ElfSuitcase.png"),
    "Raid Cape": toAbsoluteUrl("icons/relics/RaidCape.png"),
    "Bamboo Bottle": toAbsoluteUrl("icons/relics/BambooBottle.png"),
    "Magic Orb": toAbsoluteUrl("icons/relics/MagicOrb.png"),
    "Soul Splitter": toAbsoluteUrl("icons/relics/SoulSplitter.png"),
    "Dragon Hilt": toAbsoluteUrl("icons/relics/DragonHilt.png"),
    "Hexed Blade": toAbsoluteUrl("icons/relics/HexedBlade.png"),
    "Hair Bells": toAbsoluteUrl("icons/relics/HairBells.png"),
    "Spirit of the Moonblade": toAbsoluteUrl("icons/relics/SpiritoftheMoonblade.png"),
    "Calamity's Eye": toAbsoluteUrl("icons/relics/CalamitysEye.png"),
    "Boulder": toAbsoluteUrl("icons/relics/Boulder.png"),
    "Webbed Fruit": toAbsoluteUrl("icons/relics/WebbedFruit.png"),
    "Emperor's Attire": toAbsoluteUrl("icons/relics/EmperorsAttire.png"),
    "Hell's Flower": toAbsoluteUrl("icons/relics/HellsFlower.png"),
    "Technique Amplifier": toAbsoluteUrl("icons/relics/TechniqueAmplifier.png"),
    "Dark Scepter": toAbsoluteUrl("icons/relics/DarkScepter.png"),
    "Illusion Crow": toAbsoluteUrl("icons/relics/IllusionCrow.png"),
    "Royal Gi": toAbsoluteUrl("icons/relics/RoyalGi.png"),
    "Carrot's Gi": toAbsoluteUrl("icons/relics/CarrotsGi.png"),
    "Carrots Gi": toAbsoluteUrl("icons/relics/CarrotsGi.png"),
    "Mechanical Wings": toAbsoluteUrl("icons/relics/MechanicalWings.png"),
    "Mentors Cape": toAbsoluteUrl("icons/relics/MentorsCape.png"),
    "Warrior Pole": toAbsoluteUrl("icons/relics/WarriorPole.png"),
    "Pointy Straw": toAbsoluteUrl("icons/relics/PointyStraw.png"),
    "Fiery Staff": toAbsoluteUrl("icons/relics/FieryStaff.png"),
    "FieryStaff": toAbsoluteUrl("icons/relics/FieryStaff.png"),
    "Lightning Dagger": toAbsoluteUrl("icons/relics/LightningDagger.png"),
    "LightningDagger": toAbsoluteUrl("icons/relics/LightningDagger.png"),
    "Storm Trident": toAbsoluteUrl("icons/relics/StormTrident.png"),
    "StormTrident": toAbsoluteUrl("icons/relics/StormTrident.png"),
    "Tideblade": toAbsoluteUrl("icons/relics/Tideblade.png"),
};

export function relicImgByName(name) {
    if (!name) return toAbsoluteUrl("assets/placeholder.svg");
    const key = Object.keys(RELIC_NAME_TO_IMG).find(
        (k) => k.toLowerCase() === String(name).toLowerCase()
    );
    return (key && RELIC_NAME_TO_IMG[key]) || toAbsoluteUrl("assets/placeholder.svg");
}

export function iconImg(src, alt = "", cls = "icon-img") {
    if (!src) return "";
    const abs = toAbsoluteUrl(src);
    return `<img src="${abs}" alt="${alt}" class="${cls}" />`;
}

export const STAT_ICONS = {
    damage: iconImg(UNIT_INFO_ICONS.damage, "Damage"),
    spa: iconImg(UNIT_INFO_ICONS.spa, "SPA"),
    range: iconImg(UNIT_INFO_ICONS.range, "Range"),
    critChance: iconImg(UNIT_INFO_ICONS.critChance, "Crit Chance"),
    critDamage: iconImg(UNIT_INFO_ICONS.critDamage, "Crit Damage"),
    totalCost: iconImg(UNIT_INFO_ICONS.totalCost, "Total Cost"),
    magicdamage: iconImg(ARCHETYPE_ICONS.magical, "Magical Damage"),
    physicaldamage: iconImg(ARCHETYPE_ICONS.physical, "Physical Damage"),
    placement: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    attackSpeed: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
    passive: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/></svg>`,
};

export function formatPassiveText(text) {
    if (!text) return "";
    let out = String(text);

    out = out.replace(/<br\s*\/?>/gi, "__BR__");

    out = out.replace(/Thunderclap[\s\xA0]+Cut/gi, "@@TC@@");
    out = out.replace(/Unrestrained[\s\xA0]+Rampage/gi, "@@UR@@");
    out = out.replace(/Skyward[\s\xA0]+Slash/gi, "@@SS@@");
    out = out.replace(/Way[\s\xA0]+of[\s\xA0]+the[\s\xA0]+Sword/gi, "@@WSW@@");

    out = out.replace(/Piercing[\s\xA0]+Crimson/gi, "@@PC@@");
    out = out.replace(/Crimson[\s\xA0]+Marked/gi, "@@CMD@@");
    out = out.replace(/Crimson[\s\xA0]+Mark/gi, "@@CMK@@");
    out = out.replace(/Crimson[\s\xA0]+Pool/gi, "@@CPL@@");
    out = out.replace(/Crimson[\s\xA0]+Explode/gi, "@@CEX@@");
    out = out.replace(/Crimson/gi, "@@CRIMSON@@");

    out = out.replace(/Austere[\s\xA0]+Flames/gi, "@@AF@@");
    out = out.replace(/Winged[\s\xA0]+Spirit/gi, "@@WS@@");
    out = out.replace(/Wolf[\s\xA0]+Spirit/gi, "@@WFS@@");
    out = out.replace(/Divine[\s\xA0]+Spirit/gi, "@@DVS@@");
    out = out.replace(/Puppet[\s\xA0]+Marked/gi, "@@PMD@@");
    out = out.replace(/Puppet[\s\xA0]+Mark/gi, "@@PM@@");
    out = out.replace(/Black[\s\xA0]+Fire/gi, "@@BFI@@");
    out = out.replace(/Black[\s\xA0]+Magic/gi, "@@BMG@@");
    out = out.replace(/Illusions/gi, "@@ILS@@");
    out = out.replace(/Illusion/gi, "@@IL@@");
    out = out.replace(/Shadow[\s\xA0]+Rewind/gi, "@@SRW@@");
    out = out.replace(/Stone[\s\xA0]+Wall/gi, "@@SW@@");
    out = out.replace(/Rock[\s\xA0]+Chunks?/gi, "@@RC@@");
    out = out.replace(/\bRock\b/gi, "@@RK@@");
    out = out.replace(/Cocoon[\s\xA0]+of[\s\xA0]+Carnage/gi, "@@CC@@");
    out = out.replace(/Crumble[\s\xA0]+Away/gi, "@@CA@@");
    out = out.replace(/Radial[\s\xA0]+Flames/gi, "@@RF@@");

    out = out.replace(/Voltage[\s\xA0]+Meter/gi, "@@VM@@");
    out = out.replace(/Storm[\s\xA0]+Clouds?/gi, "@@SC@@");
    out = out.replace(/Electric[\s\xA0]+Residue/gi, "@@ERES@@");
    out = out.replace(/Electricity/gi, "@@ELEC@@");

    out = out.replace(/Magical/gi, "@@MAG@@");
    out = out.replace(/Mana[\s\xA0]+Burn/gi, "@@MB@@");
    out = out.replace(/Old[\s\xA0]+Magic/gi, "@@OM@@");
    out = out.replace(/Eruption/gi, "@@ER@@");
    out = out.replace(/Storm/gi, "@@ST@@");
    out = out.replace(/Nine[\s\xA0]+Tailed[\s\xA0]+Fox[\s\xA0]+Djinn/gi, "@@NTFD@@");
    out = out.replace(/Lightning[\s\xA0]+Djinn/gi, "@@LDJ@@");
    out = out.replace(/Lightning[\s\xA0]+Strikes?/gi, "@@LST@@");
    out = out.replace(/Follow-Up[\s\xA0]+Attacks/gi, "@@FUAS@@");
    out = out.replace(/Follow-Up[\s\xA0]+Attack/gi, "@@FUA@@");
    out = out.replace(/Follow-Up/gi, "@@FU@@");
    out = out.replace(/Bat[\s\xA0]+Spirits?/gi, "@@BS@@");
    out = out.replace(/Bleed/gi, "@@BL@@");
    out = out.replace(/(Burn|Flame|Flames|Ignite)/gi, "@@BU@@");

    out = out.replace(/Frostbite/gi, "@@FB@@");
    out = out.replace(/Freezes/gi, "@@FZS@@");
    out = out.replace(/Freeze/gi, "@@FZ@@");
    out = out.replace(/Genetic[\s\xA0]+Duplication/gi, "@@GD@@");
    out = out.replace(/Bio[\s\xA0]+Reset/gi, "@@BRS@@");
    out = out.replace(/Takedowns/gi, "@@TKDS@@");
    out = out.replace(/Takedown/gi, "@@TKDA@@");
    out = out.replace(/Taken[\s\xA0]+Down/gi, "@@TKD@@");
    out = out.replace(/Bio[\s\xA0]+Gel/gi, "@@BGEL@@");
    out = out.replace(/\bBoss\b/g, "@@BSS@@");
    out = out.replace(/Carrot[\s\xA0]+Transformation/gi, "@@CT@@");
    out = out.replace(/Fighting[\s\xA0]+Spirit/gi, "@@FSP@@");
    out = out.replace(/Critical[\s\xA0]+Attacks/gi, "@@CAS@@");
    out = out.replace(/Critical[\s\xA0]+Attack/gi, "@@CAK@@");
    out = out.replace(/Debuffed/gi, "@@DBF@@");
    out = out.replace(/Relocate/gi, "@@RLC@@");
    out = out.replace(/Regular[\s\xA0]+Attacks/gi, "@@RAS@@");
    out = out.replace(/Regular[\s\xA0]+Attack/gi, "@@RA@@");
    out = out.replace(/\bAttacks\b/g, "@@ATKS@@");
    out = out.replace(/\bAttack\b/g, "@@ATK@@");
    out = out.replace(/(Vegetable|Vegeta)[\s\xA0]+Transformation/gi, "@@VT@@");
    out = out.replace(/The[\s\xA0]+Drink[\s\xA0]+Transformation/gi, "@@TDT@@");
    out = out.replace(/The[\s\xA0]+Drink[\s\xA0]+Mark/gi, "@@TDM@@");
    out = out.replace(/Precision[\s\xA0]+Slash/gi, "@@PSL@@");
    out = out.replace(/Quick[\s\xA0]+Assist/gi, "@@QAS@@");
    out = out.replace(/Perfected[\s\xA0]+Strikes/gi, "@@PFS@@");
    out = out.replace(/Golden[\s\xA0]+Ascension/gi, "@@GAS@@");
    out = out.replace(/Golden/gi, "@@GLD@@");
    out = out.replace(/Physical/gi, "@@PHY@@");
    out = out.replace(/Prodigy[\s\xA0]+Transformation[\s\xA0]+2/gi, "@@PT2@@");
    out = out.replace(/Prodigy[\s\xA0]+Transformation/gi, "@@PT1@@");
    out = out.replace(/Prodigy[\s\xA0]+Meter/gi, "@@PMT@@");
    out = out.replace(/Rage[\s\xA0]+Meter/gi, "@@RMT@@");
    out = out.replace(/Father[\s\xA0]+and[\s\xA0]+Son[\s\xA0]+Spirit[\s\xA0]+Energy/gi, "@@FSSE@@");
    out = out.replace(/Rage[\s\xA0]+Unleashed/gi, "@@RU@@");
    out = out.replace(/\bDOT\b/g, "@@DOT@@");
    out = out.replace(/Status[\s\xA0]+Effects?/gi, "@@STE@@");
    out = out.replace(/Transformed/gi, "@@TRD@@");
    out = out.replace(/Transforms/gi, "@@TRS@@");
    out = out.replace(/Transform\b/gi, "@@TRM@@");
    out = out.replace(/Cubert[\s\xA0]+Cubes/gi, "@@CBCS@@");
    out = out.replace(/Cubert[\s\xA0]+Cube/gi, "@@CBC@@");
    out = out.replace(/Cubert[\s\xA0]+Meter/gi, "@@CBM@@");
    out = out.replace(/Patience/gi, "@@PAT@@");

    out = out.replace(/Vapor[\s\xA0]+Clouds/gi, "@@VCS@@");
    out = out.replace(/Vapor[\s\xA0]+Cloud/gi, "@@VC@@");
    out = out.replace(/Tidal[\s\xA0]+Waves/gi, "@@TWS@@");
    out = out.replace(/Tidal[\s\xA0]+Wave/gi, "@@TW@@");
    out = out.replace(/Waterfalls/gi, "@@WFS_WF@@");
    out = out.replace(/Waterfall/gi, "@@WF@@");

    out = out.replace(/Rewinds/gi, "@@RWS@@");
    out = out.replace(/Rewind/gi, "@@RW@@");
    out = out.replace(/Stunned/gi, "@@SND@@");
    out = out.replace(/Stuns/gi, "@@SNS@@");
    out = out.replace(/Stun/gi, "@@SN@@");
    out = out.replace(/Slow/gi, "@@SL@@");
    out = out.replace(/Stagger/gi, "@@SG@@");
    out = out.replace(/Cocoon/gi, "@@CN@@");
    out = out.replace(/Strings/gi, "@@STRS@@");
    out = out.replace(/String/gi, "@@STR@@");
    out = out.replace(/Dolls/gi, "@@DLS@@");
    out = out.replace(/Doll/gi, "@@DL@@");
    out = out.replace(/Cleanse/gi, "@@CL@@");
    out = out.replace(/Dismembered/gi, "@@DM@@");
    out = out.replace(/Buffs/gi, "@@BF@@");
    out = out.replace(/Skeletons/gi, "@@SKLS@@");
    out = out.replace(/\bSkeleton\b/gi, "@@SKL@@");
    out = out.replace(/Shields/gi, "@@SHLDS@@");
    out = out.replace(/\bShield\b/gi, "@@SHLD@@");
    out = out.replace(/Pierces/gi, "@@PRCS@@");
    out = out.replace(/\bPierce\b/gi, "@@PRC@@");

    out = out.replace(/(\$\d[\d,]*%?|\b\d+(?:,\d{3})*(?:\.\d+)?)(x|s|%)?/gi, (match, num, unit) => {
        return `<span class="p-num" style="font-weight:800;">${num}${unit || ""}</span>`;
    });

    const iconImgTag = (src) => src ? `<img src="${toAbsoluteUrl(src)}" class="p-kw-icon" alt="" />` : "";

    out = out.replace(/@@TC@@/g, `<span class="p-kw p-atk-name"><span>Thunderclap Cut</span></span>`);
    out = out.replace(/@@UR@@/g, `<span class="p-kw p-atk-name"><span>Unrestrained Rampage</span></span>`);
    out = out.replace(/@@SS@@/g, `<span class="p-kw p-atk-name"><span>Skyward Slash</span></span>`);
    out = out.replace(/@@WSW@@/g, `<span class="p-kw p-atk-name"><span>Way of the Sword</span></span>`);

    out = out.replace(/@@PC@@/g, `<span class="p-kw p-piercing-crimson"><span>Piercing Crimson</span></span>`);
    out = out.replace(/@@CMD@@/g, `<span class="p-kw p-crimson-marked">${iconImgTag(STATUS_ICONS.crimsonmark)}<span>Crimson Marked</span></span>`);
    out = out.replace(/@@CMK@@/g, `<span class="p-kw p-crimson-mark">${iconImgTag(STATUS_ICONS.crimsonmark)}<span>Crimson Mark</span></span>`);
    out = out.replace(/@@CPL@@/g, `<span class="p-kw p-crimson-pool"><span>Crimson Pool</span></span>`);
    out = out.replace(/@@CEX@@/g, `<span class="p-kw p-crimson-explode"><span>Crimson Explode</span></span>`);
    out = out.replace(/@@CRIMSON@@/g, `<span class="p-kw p-crimson-mark">${iconImgTag(STATUS_ICONS.crimsonmark)}<span>Crimson</span></span>`);

    out = out.replace(/@@AF@@/g, `<span class="p-kw p-austere-flames">${iconImgTag(STATUS_ICONS.burn)}<span>Austere Flames</span></span>`);
    out = out.replace(/@@WS@@/g, `<span class="p-kw p-winged-spirit"><span>Winged Spirit</span></span>`);
    out = out.replace(/@@WFS@@/g, `<span class="p-kw p-wolf-spirit"><span>Wolf Spirit</span></span>`);
    out = out.replace(/@@DVS@@/g, `<span class="p-kw p-divine-spirit"><span>Divine Spirit</span></span>`);
    out = out.replace(/@@PMD@@/g, `<span class="p-kw p-puppet-marked">${iconImgTag(STATUS_ICONS.puppetmark)}<span>Puppet Marked</span></span>`);
    out = out.replace(/@@PM@@/g, `<span class="p-kw p-puppet-mark">${iconImgTag(STATUS_ICONS.puppetmark)}<span>Puppet Mark</span></span>`);
    out = out.replace(/@@BFI@@/g, `<span class="p-kw p-black-fire">${iconImgTag(STATUS_ICONS.blackfire)}<span>Black Fire</span></span>`);
    out = out.replace(/@@BMG@@/g, `<span class="p-kw p-black-magic"><span>Black Magic</span></span>`);
    out = out.replace(/@@ILS@@/g, `<span class="p-kw p-illusion"><span>Illusions</span></span>`);
    out = out.replace(/@@IL@@/g, `<span class="p-kw p-illusion"><span>Illusion</span></span>`);
    out = out.replace(/@@SRW@@/g, `<span class="p-kw p-shadow-rewind"><span>Shadow Rewind</span></span>`);
    out = out.replace(/@@SW@@/g, `<span class="p-kw p-stone-wall"><span>Stone Wall</span></span>`);
    out = out.replace(/@@RC@@/g, `<span class="p-kw p-rock-chunk"><span>Rock Chunks</span></span>`);
    out = out.replace(/@@RK@@/g, `<span class="p-kw p-rock"><span>Rock</span></span>`);
    out = out.replace(/@@CC@@/g, `<span class="p-kw p-cocoon"><span>Cocoon of Carnage</span></span>`);

    out = out.replace(/@@MAG@@/g, `<span class="p-kw p-magical"><span class="p-magical-text">Magical</span></span>`);
    out = out.replace(/@@MB@@/g, `<span class="p-kw p-mana-burn">${iconImgTag(STATUS_ICONS.manaburn)}<span class="p-mana-burn-text">Mana Burn</span></span>`);
    out = out.replace(/@@OM@@/g, `<span class="p-kw p-spell"><span class="p-spell-text">Old Magic</span></span>`);
    out = out.replace(/@@ER@@/g, `<span class="p-kw p-spell"><span class="p-spell-text">Eruption</span></span>`);
    out = out.replace(/@@ST@@/g, `<span class="p-kw p-spell"><span class="p-spell-text">Storm</span></span>`);
    out = out.replace(/@@NTFD@@/g, `<span class="p-kw p-nine-tailed-fox-djinn"><span>Nine Tailed Fox Djinn</span></span>`);
    out = out.replace(/@@LDJ@@/g, `<span class="p-kw p-lightning-djinn"><span>Lightning Djinn</span></span>`);
    out = out.replace(/@@LST@@/g, `<span class="p-kw p-lightning-strike"><span>Lightning Strike</span></span>`);

    out = out.replace(/@@FUAS@@/g, `<span class="p-kw p-fua"><span class="p-fua-text">Follow-Up Attacks</span></span>`);
    out = out.replace(/@@FUA@@/g, `<span class="p-kw p-fua"><span class="p-fua-text">Follow-Up Attack</span></span>`);
    out = out.replace(/@@FU@@/g, `<span class="p-kw p-fua"><span class="p-fua-text">Follow-Up</span></span>`);
    out = out.replace(/@@BS@@/g, `<span class="p-ent"><span class="p-bat-text">Bat Spirits</span></span>`);

    out = out.replace(/@@BL@@/g, `<span class="p-kw p-bleed">${iconImgTag(STATUS_ICONS.bleed)}<span class="p-bleed-text">Bleed</span></span>`);
    out = out.replace(/@@BU@@/g, `<span class="p-kw p-burn">${iconImgTag(STATUS_ICONS.burn)}<span class="p-burn-text">Burn</span></span>`);

    out = out.replace(/@@FB@@/g, `<span class="p-kw p-frostbite"><span>Frostbite</span></span>`);
    out = out.replace(/@@FZS@@/g, `<span class="p-kw p-freeze">${iconImgTag(STATUS_ICONS.freeze)}<span>Freezes</span></span>`);
    out = out.replace(/@@FZ@@/g, `<span class="p-kw p-freeze">${iconImgTag(STATUS_ICONS.freeze)}<span>Freeze</span></span>`);
    out = out.replace(/@@CAS@@/g, `<span class="p-kw p-critical-attack"><span>Critical Attacks</span></span>`);
    out = out.replace(/@@CAK@@/g, `<span class="p-kw p-critical-attack"><span>Critical Attack</span></span>`);
    out = out.replace(/@@RAS@@/g, `<span class="p-kw p-reg-attack"><span>Regular Attacks</span></span>`);
    out = out.replace(/@@RA@@/g, `<span class="p-kw p-reg-attack"><span>Regular Attack</span></span>`);
    out = out.replace(/@@ATKS@@/g, `<span class="p-kw p-reg-attack"><span>Attacks</span></span>`);
    out = out.replace(/@@ATK@@/g, `<span class="p-kw p-reg-attack"><span>Attack</span></span>`);
    out = out.replace(/@@PAT@@/g, `<span class="p-kw p-patience"><span>Patience</span></span>`);
    out = out.replace(/@@VT@@/g, `<span class="p-kw p-vegeta-transform"><span>Vegetable Transformation</span></span>`);
    out = out.replace(/@@PT2@@/g, `<span class="p-kw p-prodigy-transform-2"><span>Prodigy Transformation 2</span></span>`);
    out = out.replace(/@@PT1@@/g, `<span class="p-kw p-prodigy-transform"><span>Prodigy Transformation</span></span>`);
    out = out.replace(/@@PMT@@/g, `<span class="p-kw p-prodigy-meter"><span>Prodigy Meter</span></span>`);
    out = out.replace(/@@RMT@@/g, `<span class="p-kw p-rage-meter"><span>Rage Meter</span></span>`);
    out = out.replace(/@@RLC@@/g, `<span class="p-kw p-relocate"><span>Relocate</span></span>`);
    out = out.replace(/@@DBF@@/g, `<span class="p-kw p-debuffed"><span>Debuffed</span></span>`);
    out = out.replace(/@@FSP@@/g, `<span class="p-kw p-fighting-spirit"><span>Fighting Spirit</span></span>`);
    out = out.replace(/@@CT@@/g, `<span class="p-kw p-carrot-transform"><span>Carrot Transformation</span></span>`);
    out = out.replace(/@@BSS@@/g, `<span class="p-kw p-boss"><span>Boss</span></span>`);
    out = out.replace(/@@BGEL@@/g, `<span class="p-kw p-bio-gel"><span>Bio Gel</span></span>`);
    out = out.replace(/@@TKDS@@/g, `<span class="p-kw p-takedown"><span>Takedowns</span></span>`);
    out = out.replace(/@@TKDA@@/g, `<span class="p-kw p-takedown"><span>Takedown</span></span>`);
    out = out.replace(/@@TKD@@/g, `<span class="p-kw p-takedown"><span>Taken Down</span></span>`);
    out = out.replace(/@@BRS@@/g, `<span class="p-kw p-stun"><span>Bio Reset</span></span>`);
    out = out.replace(/@@GD@@/g, `<span class="p-kw p-genetic-dupe"><span>Genetic Duplication</span></span>`);
    out = out.replace(/@@FSSE@@/g, `<span class="p-kw p-father-son"><span>Father and Son Spirit Energy</span></span>`);
    out = out.replace(/@@RU@@/g, `<span class="p-kw p-rage-unleashed"><span>Rage Unleashed</span></span>`);
    out = out.replace(/@@TDM@@/g, `<span class="p-kw p-drink-mark">${iconImgTag(STATUS_ICONS.thedrinkmark)}<span>The Drink Mark</span></span>`);
    out = out.replace(/@@PSL@@/g, `<span class="p-kw p-precision-slash"><span>Precision Slash</span></span>`);
    out = out.replace(/@@QAS@@/g, `<span class="p-kw p-quick-assist"><span>Quick Assist</span></span>`);
    out = out.replace(/@@PHY@@/g, `<span class="p-kw p-physical"><span>Physical</span></span>`);
    out = out.replace(/@@TDT@@/g, `<span class="p-kw p-drink-transform"><span>The Drink Transformation</span></span>`);
    out = out.replace(/@@PFS@@/g, `<span class="p-kw p-reg-attack"><span>Perfected Strikes</span></span>`);
    out = out.replace(/@@GAS@@/g, `<span class="p-kw p-reg-attack"><span>Golden Ascension</span></span>`);
    out = out.replace(/@@DOT@@/g, `<span class="p-kw p-dot"><span>DOT</span></span>`);
    out = out.replace(/@@STE@@/g, `<span class="p-kw p-reg-attack"><span>Status Effect</span></span>`);
    out = out.replace(/@@CBCS@@/g, `<span class="p-kw p-cubert-cubes"><span>Cubert Cubes</span></span>`);
    out = out.replace(/@@CBC@@/g, `<span class="p-kw p-cubert-cube"><span>Cubert Cube</span></span>`);
    out = out.replace(/@@CBM@@/g, `<span class="p-kw p-cubert-meter"><span>Cubert Meter</span></span>`);
    out = out.replace(/@@VM@@/g, `<span class="p-kw p-voltage-meter"><span>Voltage Meter</span></span>`);
    out = out.replace(/@@SC@@/g, `<span class="p-kw p-storm-cloud"><span>Storm Cloud</span></span>`);
    out = out.replace(/@@ERES@@/g, `<span class="p-kw p-electric-residue"><span>Electric Residue</span></span>`);
    out = out.replace(/@@ELEC@@/g, `<span class="p-kw p-electricity">${iconImgTag(STATUS_ICONS.electricity)}<span>Electricity</span></span>`);
    out = out.replace(/@@GLD@@/g, `<span class="p-kw p-golden"><span>Golden</span></span>`);
    out = out.replace(/@@TRD@@/g, `<span class="p-kw p-transforms"><span>Transformed</span></span>`);
    out = out.replace(/@@TRS@@/g, `<span class="p-kw p-transforms"><span>Transforms</span></span>`);
    out = out.replace(/@@TRM@@/g, `<span class="p-kw p-transforms"><span>Transform</span></span>`);

    out = out.replace(/@@VCS@@/g, `<span class="p-kw p-vapor-cloud"><span>Vapor Clouds</span></span>`);
    out = out.replace(/@@VC@@/g, `<span class="p-kw p-vapor-cloud"><span>Vapor Cloud</span></span>`);
    out = out.replace(/@@TWS@@/g, `<span class="p-kw p-tidal-wave"><span>Tidal Waves</span></span>`);
    out = out.replace(/@@TW@@/g, `<span class="p-kw p-tidal-wave"><span>Tidal Wave</span></span>`);
    out = out.replace(/@@WFS_WF@@/g, `<span class="p-kw p-waterfall"><span>Waterfalls</span></span>`);
    out = out.replace(/@@WF@@/g, `<span class="p-kw p-waterfall"><span>Waterfall</span></span>`);

    out = out.replace(/@@RWS@@/g, `<span class="p-kw p-rewind"><span>Rewinds</span></span>`);
    out = out.replace(/@@RW@@/g, `<span class="p-kw p-rewind"><span>Rewind</span></span>`);
    out = out.replace(/@@SND@@/g, `<span class="p-kw p-stun">${iconImgTag(STATUS_ICONS.stun)}<span>Stunned</span></span>`);
    out = out.replace(/@@SNS@@/g, `<span class="p-kw p-stun">${iconImgTag(STATUS_ICONS.stun)}<span>Stuns</span></span>`);
    out = out.replace(/@@SN@@/g, `<span class="p-kw p-stun">${iconImgTag(STATUS_ICONS.stun)}<span>Stun</span></span>`);
    out = out.replace(/@@SL@@/g, `<span class="p-kw p-slow">${iconImgTag(STATUS_ICONS.slow)}<span>Slow</span></span>`);
    out = out.replace(/@@SG@@/g, `<span class="p-kw p-stagger"><span>Stagger</span></span>`);
    out = out.replace(/@@CN@@/g, `<span class="p-kw p-cocoon"><span>Cocoon</span></span>`);
    out = out.replace(/@@STRS@@/g, `<span class="p-kw p-string"><span>Strings</span></span>`);
    out = out.replace(/@@STR@@/g, `<span class="p-kw p-string"><span>String</span></span>`);
    out = out.replace(/@@DLS@@/g, `<span class="p-kw p-doll"><span class="p-doll-text">Dolls</span></span>`);
    out = out.replace(/@@DL@@/g, `<span class="p-kw p-doll"><span class="p-doll-text">Doll</span></span>`);
    out = out.replace(/@@CL@@/g, `<span class="p-kw p-cleanse"><span>Cleanse</span></span>`);
    out = out.replace(/@@DM@@/g, `<span class="p-kw p-dismembered"><span>Dismembered</span></span>`);
    out = out.replace(/@@BF@@/g, `<span class="p-kw p-buffs"><span>Buffs</span></span>`);
    out = out.replace(/@@SKLS@@/g, `<span class="p-kw p-skeleton"><span class="p-burn-text">Skeletons</span></span>`);
    out = out.replace(/@@SKL@@/g, `<span class="p-kw p-skeleton"><span class="p-burn-text">Skeleton</span></span>`);
    out = out.replace(/@@SHLDS@@/g, `<span class="p-kw p-shield"><span>Shields</span></span>`);
    out = out.replace(/@@SHLD@@/g, `<span class="p-kw p-shield"><span>Shield</span></span>`);
    out = out.replace(/@@PRCS@@/g, `<span class="p-kw p-pierce"><span>Pierces</span></span>`);
    out = out.replace(/@@PRC@@/g, `<span class="p-kw p-pierce"><span>Pierce</span></span>`);

    out = out.replace(/__BR__/g, "<br>");
    return out;
}

if (typeof window !== "undefined") {
    let floatingTooltip = null;

    function getTooltipImage(target) {
        if (!target) return "";
        if (target.classList.contains("p-piercing-crimson")) return toAbsoluteUrl("icons/info/PiercingCrimsonInfo.png");
        if (target.classList.contains("p-crimson-marked")) return toAbsoluteUrl("icons/info/CrimsonMarkedInfo.png");
        if (target.classList.contains("p-crimson-mark")) return toAbsoluteUrl("icons/info/CrimsonMarkInfo.png");
        if (target.classList.contains("p-crimson-pool")) return toAbsoluteUrl("icons/info/CrimsonPoolInfo.png");
        if (target.classList.contains("p-crimson-explode")) return toAbsoluteUrl("icons/info/CrimsonExplodeInfo.png");
        if (target.classList.contains("p-winged-spirit")) return toAbsoluteUrl("icons/info/WingedSpiritInfo.png");
        if (target.classList.contains("p-magical")) return toAbsoluteUrl("icons/info/MagicalInfo.png");
        if (target.classList.contains("p-wolf-spirit")) return toAbsoluteUrl("icons/info/WolfSpiritInfo.png");
        if (target.classList.contains("p-divine-spirit")) return toAbsoluteUrl("icons/info/DivineSpiritInfo.png");
        if (target.classList.contains("p-shadow-rewind")) return toAbsoluteUrl("icons/info/ShadowRewindInfo.png");
        if (target.classList.contains("p-black-fire")) return toAbsoluteUrl("icons/info/BlackFireInfo.png");
        if (target.classList.contains("p-black-magic")) return toAbsoluteUrl("icons/info/BlackMagicInfo.png");
        if (target.classList.contains("p-illusion")) return toAbsoluteUrl("icons/info/IllusionInfo.png");
        if (target.classList.contains("p-mana-burn")) return toAbsoluteUrl("icons/info/ManaBurnInfo.png");
        if (target.classList.contains("p-burn") || target.classList.contains("p-austere-flames")) return toAbsoluteUrl("icons/info/Burninfo.png");
        if (target.classList.contains("p-bleed")) return toAbsoluteUrl("icons/info/BleedInfo.png");
        if (target.classList.contains("p-ent")) return toAbsoluteUrl("icons/info/batinfo.png");
        if (target.classList.contains("p-fua")) return toAbsoluteUrl("icons/info/followupinfo.png");
        if (target.classList.contains("p-stun")) return toAbsoluteUrl("icons/info/StunInfo.png");
        if (target.classList.contains("p-cocoon")) return toAbsoluteUrl("icons/info/Cocooninfo.png");
        if (target.classList.contains("p-string")) return toAbsoluteUrl("icons/info/Stringinfo.png");
        if (target.classList.contains("p-reg-attack")) return toAbsoluteUrl("icons/info/RegularAttackinfo.png");
        if (target.classList.contains("p-critical-attack")) return toAbsoluteUrl("icons/info/CriticalAttackinfo.png");
        if (target.classList.contains("p-transforms")) return toAbsoluteUrl("icons/info/Transformsinfo.png");
        if (target.classList.contains("p-patience")) return toAbsoluteUrl("icons/info/Patienceinfo.png");
        if (target.classList.contains("p-vegeta-transform")) return toAbsoluteUrl("icons/info/VegetaTransforminfo.png");
        if (target.classList.contains("p-takedown")) return toAbsoluteUrl("icons/info/Takedowninfo.png");
        if (target.classList.contains("p-drink-transform")) return toAbsoluteUrl("icons/info/TheDrinkTransforminfo.png");
        if (target.classList.contains("p-bio-gel")) return toAbsoluteUrl("icons/info/BioGelinfo.png");
        if (target.classList.contains("p-genetic-dupe")) return toAbsoluteUrl("icons/info/Geneticdupeinfo.png");
        if (target.classList.contains("p-physical")) return toAbsoluteUrl("icons/info/Physicalinfo.png");
        if (target.classList.contains("p-drink-mark")) return toAbsoluteUrl("icons/info/TheDrinkMarkinfo.png");
        if (target.classList.contains("p-precision-slash")) return toAbsoluteUrl("icons/info/PrecisionSlashinfo.png");
        if (target.classList.contains("p-quick-assist")) return toAbsoluteUrl("icons/info/QuickAssistinfo.png");
        if (target.classList.contains("p-rage-unleashed")) return toAbsoluteUrl("icons/info/RageMeterinfo.png");
        if (target.classList.contains("p-rage-meter")) return toAbsoluteUrl("icons/info/RageMeterinfo.png");
        if (target.classList.contains("p-prodigy-meter")) return toAbsoluteUrl("icons/info/ProdigyMeterinfo.png");
        if (target.classList.contains("p-prodigy-transform-2")) return toAbsoluteUrl("icons/info/ProdigyTransform2info.png");
        if (target.classList.contains("p-prodigy-transform")) return toAbsoluteUrl("icons/info/ProdigyTransforminfo.png");
        if (target.classList.contains("p-father-son")) return toAbsoluteUrl("icons/info/FatherandSoninfo.png");
        if (target.classList.contains("p-boss")) return toAbsoluteUrl("icons/info/Bossinfo.png");
        if (target.classList.contains("p-dot")) return toAbsoluteUrl("icons/info/Dotinfo.png");
        if (target.classList.contains("p-status-effect")) return toAbsoluteUrl("icons/info/StatusEffectinfo.png");
        if (target.classList.contains("p-stagger")) return toAbsoluteUrl("icons/info/StaggerInfo.png");
        if (target.classList.contains("p-slow")) return toAbsoluteUrl("icons/info/SlowInfo.png");
        if (target.classList.contains("p-freeze")) return toAbsoluteUrl("icons/info/FreezeInfo.png");
        if (target.classList.contains("p-frostbite")) return toAbsoluteUrl("icons/info/FrostbiteInfo.png");
        if (target.classList.contains("p-rock")) return toAbsoluteUrl("icons/info/RockInfo.png");
        if (target.classList.contains("p-rock-chunk")) return toAbsoluteUrl("icons/info/RockChunksInfo.png");
        if (target.classList.contains("p-stone-wall")) return toAbsoluteUrl("icons/info/StoneWallInfo.png");
        if (target.classList.contains("p-buffs")) return toAbsoluteUrl("icons/info/BuffInfo.png");
        if (target.classList.contains("p-dismembered")) return toAbsoluteUrl("icons/info/DismemberedInfo.png");
        if (target.classList.contains("p-puppet-marked")) return toAbsoluteUrl("icons/info/PuppetMarkedinfo.png");
        if (target.classList.contains("p-puppet-mark")) return toAbsoluteUrl("icons/info/PuppetMarkInfo.png");
        if (target.classList.contains("p-doll")) return toAbsoluteUrl("icons/info/Dollinfo.png");
        if (target.classList.contains("p-rewind")) return toAbsoluteUrl("icons/info/RewindInfo.png");
        if (target.classList.contains("p-cubert-cubes")) return toAbsoluteUrl("icons/info/CubertCubesInfo.png");
        if (target.classList.contains("p-cubert-cube")) return toAbsoluteUrl("icons/info/CubertCubeInfo.png");
        if (target.classList.contains("p-cubert-meter")) return toAbsoluteUrl("icons/info/CubertMeterInfo.png");
        if (target.classList.contains("p-fighting-spirit")) return toAbsoluteUrl("icons/info/FightingSpiritinfo.png");
        if (target.classList.contains("p-carrot-transform")) return toAbsoluteUrl("icons/info/CarrotTrasnforminfo.png");
        if (target.classList.contains("p-debuffed")) return toAbsoluteUrl("icons/info/Debuffedinfo.png");
        if (target.classList.contains("p-nine-tailed-fox-djinn")) return toAbsoluteUrl("icons/info/NineTailedFoxDjinninfo.png");
        if (target.classList.contains("p-lightning-djinn")) return toAbsoluteUrl("icons/info/LightningDjinninfo.png");
        if (target.classList.contains("p-lightning-strike")) return toAbsoluteUrl("icons/info/LightningStrikeinfo.png");
        if (target.classList.contains("p-golden")) return toAbsoluteUrl("icons/info/Goldeninfo.png");
        if (target.classList.contains("p-voltage-meter")) return toAbsoluteUrl("icons/info/VoltageMeterinfo.png");
        if (target.classList.contains("p-electricity")) return toAbsoluteUrl("icons/info/Electricityinfo.png");
        if (target.classList.contains("p-storm-cloud")) return toAbsoluteUrl("icons/info/StormCloudinfo.png");
        if (target.classList.contains("p-electric-residue")) return toAbsoluteUrl("icons/info/ElectricResidueinfo.png");
        if (target.classList.contains("p-pierce")) return toAbsoluteUrl("icons/info/Pierceinfo.png");
        if (target.classList.contains("p-skeleton")) return toAbsoluteUrl("icons/info/Skeletoninfo.png");
        if (target.classList.contains("p-shield")) return toAbsoluteUrl("icons/info/Shieldinfo.png");
        if (target.classList.contains("p-vapor-cloud")) return toAbsoluteUrl("icons/info/VaporCloudinfo.png");
        if (target.classList.contains("p-tidal-wave")) return toAbsoluteUrl("icons/info/TidalWaveinfo.png");
        if (target.classList.contains("p-waterfall")) return toAbsoluteUrl("icons/info/Waterfallinfo.png");
        return "";
    }

    function updateFloatingTooltip(e) {
        const kwTarget = e.target ? e.target.closest(".p-kw, .p-ent") : null;
        if (!kwTarget) {
            hideFloatingTooltip();
            return;
        }

        const src = getTooltipImage(kwTarget);
        if (!src) {
            hideFloatingTooltip();
            return;
        }

        if (!floatingTooltip || !floatingTooltip.isConnected) {
            floatingTooltip = document.createElement("img");
            floatingTooltip.className = "floating-status-tooltip";
            floatingTooltip.alt = "";

            // Robust multi-variant info card resolver (never falls back to small icons)
            floatingTooltip.onerror = () => {
                const currentTry = floatingTooltip.getAttribute("data-try-idx") ? parseInt(floatingTooltip.getAttribute("data-try-idx"), 10) : 0;
                const baseSrc = floatingTooltip.getAttribute("data-original-src") || floatingTooltip.src;

                let candidates = [];
                if (baseSrc.toLowerCase().includes("bleed")) {
                    candidates = [
                        toAbsoluteUrl("icons/info/BleedInfo.png"),
                        toAbsoluteUrl("icons/info/bleedinfo.png"),
                        toAbsoluteUrl("icons/info/Bleedinfo.png"),
                        toAbsoluteUrl("icons/info/Bleed_Info.png"),
                        toAbsoluteUrl("icons/status/BleedInfo.png"),
                        toAbsoluteUrl("icons/status/bleedinfo.png"),
                        toAbsoluteUrl("icons/status/Bleedinfo.png"),
                        toAbsoluteUrl("icons/status/Bleed_Info.png")
                    ];
                } else if (baseSrc.toLowerCase().includes("electri")) {
                    candidates = [
                        toAbsoluteUrl("icons/info/Electrictyinfo.png"),
                        toAbsoluteUrl("icons/info/Electricityinfo.png"),
                        toAbsoluteUrl("icons/info/ElectrictyInfo.png"),
                        toAbsoluteUrl("icons/info/ElectricityInfo.png"),
                        toAbsoluteUrl("icons/info/ElectricResidueinfo.png"),
                        toAbsoluteUrl("icons/info/ElectricResidueInfo.png"),
                    ];
                } else {
                    const filename = baseSrc.split('/').pop().split('?')[0];
                    candidates = [
                        toAbsoluteUrl(`icons/info/${filename}`),
                        toAbsoluteUrl(`icons/status/${filename}`),
                        toAbsoluteUrl(`icons/info/${filename.toLowerCase()}`),
                        toAbsoluteUrl(`icons/status/${filename.toLowerCase()}`)
                    ];
                }

                const nextIdx = currentTry + 1;
                if (nextIdx < candidates.length) {
                    console.warn(`[Tooltip] Failed loading ${floatingTooltip.src}. Trying fallback variant: ${candidates[nextIdx]}`);
                    floatingTooltip.setAttribute("data-try-idx", String(nextIdx));
                    floatingTooltip.src = candidates[nextIdx];
                } else {
                    console.error(`[Tooltip] Could not find any valid image card for ${baseSrc}. Please check file casing on GitHub.`);
                    hideFloatingTooltip();
                }
            };

            document.body.appendChild(floatingTooltip);
        }

        if (floatingTooltip.getAttribute("data-original-src") !== src) {
            floatingTooltip.setAttribute("data-original-src", src);
            floatingTooltip.removeAttribute("data-try-idx");
            floatingTooltip.src = src;
        }

        const span = kwTarget.querySelector("span") || kwTarget;
        const computedStyle = getComputedStyle(span);
        const themeColor = computedStyle.getPropertyValue("--kw-color").trim() || computedStyle.color || "#a855f7";
        floatingTooltip.style.setProperty("--tooltip-theme-color", themeColor);
        floatingTooltip.style.borderColor = themeColor;
        floatingTooltip.style.display = "block";

        // Read CSS zoom scale factor
        const htmlZoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
        const bodyZoom = parseFloat(getComputedStyle(document.body).zoom) || 1;
        const zoom = htmlZoom * bodyZoom;

        const tooltipWidth = 280;
        const tooltipHeight = 140;

        // Position top-left corner 4px right and 4px below mouse cursor tip
        let rawX = e.clientX + 4;
        let rawY = e.clientY + 4;

        // Viewport boundary checks
        if (rawX + tooltipWidth > window.innerWidth - 10) {
            rawX = e.clientX - tooltipWidth - 6;
        }

        if (rawY + tooltipHeight > window.innerHeight - 10) {
            rawY = e.clientY - tooltipHeight - 6;
        }

        rawX = Math.max(4, rawX);
        rawY = Math.max(4, rawY);

        // Integer pixel positioning normalized by zoom factor
        const finalX = Math.round(rawX / zoom);
        const finalY = Math.round(rawY / zoom);

        floatingTooltip.style.left = `${finalX}px`;
        floatingTooltip.style.top = `${finalY}px`;
    }

    function hideFloatingTooltip() {
        if (floatingTooltip) {
            floatingTooltip.style.display = "none";
        }
    }

    window.addEventListener("mousemove", updateFloatingTooltip, true);
}