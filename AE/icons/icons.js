const BASE_URL = new URL('../', import.meta.url).href;

export function toAbsoluteUrl(relativePath) {
    if (!relativePath) return "";
    if (relativePath.startsWith("http://") || relativePath.startsWith("https://") || relativePath.startsWith("data:")) {
        return relativePath;
    }
    const clean = relativePath.replace(/^(\.\/|\/)+/, "");
    return new URL(clean, BASE_URL).href;
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

    out = out.replace(/Austere[\s\xA0]+Flames/gi, "@@AF@@");
    out = out.replace(/Winged[\s\xA0]+Spirit/gi, "@@WS@@");
    out = out.replace(/Wolf[\s\xA0]+Spirit/gi, "@@WFS@@");
    out = out.replace(/Divine[\s\xA0]+Spirit/gi, "@@DVS@@");
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

    out = out.replace(/Magical/gi, "@@MAG@@");
    out = out.replace(/Mana[\s\xA0]+Burn/gi, "@@MB@@");
    out = out.replace(/Old[\s\xA0]+Magic/gi, "@@OM@@");
    out = out.replace(/Eruption/gi, "@@ER@@");
    out = out.replace(/Storm/gi, "@@ST@@");
    out = out.replace(/Follow-Up[\s\xA0]+Attacks?/gi, "@@FUA@@");
    out = out.replace(/Follow-Up/gi, "@@FU@@");
    out = out.replace(/Bat[\s\xA0]+Spirits?/gi, "@@BS@@");
    out = out.replace(/Bleed/gi, "@@BL@@");
    out = out.replace(/(Burn|Flame|Flames|Ignite)/gi, "@@BU@@");

    out = out.replace(/Frostbite/gi, "@@FB@@");
    out = out.replace(/Freezes/gi, "@@FZS@@");
    out = out.replace(/Freeze/gi, "@@FZ@@");
    out = out.replace(/Regular[\s\xA0]+Attacks/gi, "@@RAS@@");
    out = out.replace(/Regular[\s\xA0]+Attack/gi, "@@RA@@");

    out = out.replace(/Rewind/gi, "@@RW@@");
    out = out.replace(/Stunned/gi, "@@SND@@");
    out = out.replace(/Stun/gi, "@@SN@@");
    out = out.replace(/Slow/gi, "@@SL@@");
    out = out.replace(/Stagger/gi, "@@SG@@");
    out = out.replace(/Cocoon/gi, "@@CN@@");
    out = out.replace(/Dolls/gi, "@@DLS@@");
    out = out.replace(/Doll/gi, "@@DL@@");
    out = out.replace(/Cleanse/gi, "@@CL@@");
    out = out.replace(/Dismembered/gi, "@@DM@@");
    out = out.replace(/Buffs/gi, "@@BF@@");

    out = out.replace(/(\$\d[\d,]*%?|\b\d+(?:,\d{3})*(?:\.\d+)?)(x|s|%)?/gi, (match, num, unit) => {
        return `<span class="p-num" style="font-weight:800;">${num}${unit || ""}</span>`;
    });

    const iconImgTag = (src) => src ? `<img src="${toAbsoluteUrl(src)}" class="p-kw-icon" alt="" />` : "";

    out = out.replace(/@@TC@@/g, `<span class="p-kw p-atk-name"><span>Thunderclap Cut</span></span>`);
    out = out.replace(/@@UR@@/g, `<span class="p-kw p-atk-name"><span>Unrestrained Rampage</span></span>`);
    out = out.replace(/@@SS@@/g, `<span class="p-kw p-atk-name"><span>Skyward Slash</span></span>`);
    out = out.replace(/@@WSW@@/g, `<span class="p-kw p-atk-name"><span>Way of the Sword</span></span>`);

    out = out.replace(/@@AF@@/g, `<span class="p-kw p-austere-flames">${iconImgTag(STATUS_ICONS.burn)}<span>Austere Flames</span></span>`);
    out = out.replace(/@@WS@@/g, `<span class="p-kw p-winged-spirit"><span>Winged Spirit</span></span>`);
    out = out.replace(/@@WFS@@/g, `<span class="p-kw p-wolf-spirit"><span>Wolf Spirit</span></span>`);
    out = out.replace(/@@DVS@@/g, `<span class="p-kw p-divine-spirit"><span>Divine Spirit</span></span>`);
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

    out = out.replace(/@@FUA@@/g, `<span class="p-kw p-fua"><span class="p-fua-text">Follow-Up Attacks</span></span>`);
    out = out.replace(/@@FU@@/g, `<span class="p-kw p-fua"><span class="p-fua-text">Follow-Up</span></span>`);
    out = out.replace(/@@BS@@/g, `<span class="p-ent"><span class="p-bat-text">Bat Spirits</span></span>`);

    out = out.replace(/@@BL@@/g, `<span class="p-kw p-bleed">${iconImgTag(STATUS_ICONS.bleed)}<span class="p-bleed-text">Bleed</span></span>`);
    out = out.replace(/@@BU@@/g, `<span class="p-kw p-burn">${iconImgTag(STATUS_ICONS.burn)}<span class="p-burn-text">Burn</span></span>`);

    out = out.replace(/@@FB@@/g, `<span class="p-kw p-frostbite"><span>Frostbite</span></span>`);
    out = out.replace(/@@FZS@@/g, `<span class="p-kw p-freeze">${iconImgTag(STATUS_ICONS.freeze)}<span>Freezes</span></span>`);
    out = out.replace(/@@FZ@@/g, `<span class="p-kw p-freeze">${iconImgTag(STATUS_ICONS.freeze)}<span>Freeze</span></span>`);
    out = out.replace(/@@RAS@@/g, `<span class="p-kw p-reg-attack"><span>Regular Attacks</span></span>`);
    out = out.replace(/@@RA@@/g, `<span class="p-kw p-reg-attack"><span>Regular Attack</span></span>`);

    out = out.replace(/@@RW@@/g, `<span class="p-kw p-rewind"><span>Rewind</span></span>`);
    out = out.replace(/@@SND@@/g, `<span class="p-kw p-stun">${iconImgTag(STATUS_ICONS.stun)}<span>Stunned</span></span>`);
    out = out.replace(/@@SN@@/g, `<span class="p-kw p-stun">${iconImgTag(STATUS_ICONS.stun)}<span>Stun</span></span>`);
    out = out.replace(/@@SL@@/g, `<span class="p-kw p-slow">${iconImgTag(STATUS_ICONS.slow)}<span>Slow</span></span>`);
    out = out.replace(/@@SG@@/g, `<span class="p-kw p-stagger"><span>Stagger</span></span>`);
    out = out.replace(/@@CN@@/g, `<span class="p-kw p-cocoon"><span>Cocoon</span></span>`);
    out = out.replace(/@@DLS@@/g, `<span class="p-kw p-doll"><span class="p-doll-text">Dolls</span></span>`);
    out = out.replace(/@@DL@@/g, `<span class="p-kw p-doll"><span class="p-doll-text">Doll</span></span>`);
    out = out.replace(/@@CL@@/g, `<span class="p-kw p-cleanse"><span>Cleanse</span></span>`);
    out = out.replace(/@@DM@@/g, `<span class="p-kw p-dismembered"><span>Dismembered</span></span>`);
    out = out.replace(/@@BF@@/g, `<span class="p-kw p-buffs"><span>Buffs</span></span>`);

    out = out.replace(/__BR__/g, "<br>");
    return out;
}

if (typeof window !== "undefined") {
    let floatingTooltip = null;

    function getTooltipImage(target) {
        if (!target) return "";
        if (target.classList.contains("p-winged-spirit")) return toAbsoluteUrl("icons/info/WingedSpiritInfo.png");
        if (target.classList.contains("p-magical")) return toAbsoluteUrl("icons/info/MagicalInfo.png");
        if (target.classList.contains("p-wolf-spirit")) return toAbsoluteUrl("icons/info/WolfSpiritInfo.png");
        if (target.classList.contains("p-divine-spirit")) return toAbsoluteUrl("icons/info/DivineSpiritInfo.png");
        if (target.classList.contains("p-shadow-rewind")) return toAbsoluteUrl("icons/info/ShadowRewindInfo.png");
        if (target.classList.contains("p-black-fire")) return toAbsoluteUrl("icons/info/BlackFireInfo.png");
        if (target.classList.contains("p-black-magic")) return toAbsoluteUrl("icons/info/BlackMagicInfo.png");
        if (target.classList.contains("p-illusion")) return toAbsoluteUrl("icons/info/IllusionInfo.png");
        if (target.classList.contains("p-mana-burn")) return toAbsoluteUrl("icons/info/ManaBurnInfo.png");
        if (target.classList.contains("p-bleed")) return toAbsoluteUrl("icons/info/BleedInfo.png");
        if (target.classList.contains("p-ent")) return toAbsoluteUrl("icons/info/batinfo.png");
        if (target.classList.contains("p-fua")) return toAbsoluteUrl("icons/info/followupinfo.png");
        if (target.classList.contains("p-stun")) return toAbsoluteUrl("icons/info/StunInfo.png");
        if (target.classList.contains("p-stagger")) return toAbsoluteUrl("icons/info/StaggerInfo.png");
        if (target.classList.contains("p-slow")) return toAbsoluteUrl("icons/info/SlowInfo.png");
        if (target.classList.contains("p-freeze")) return toAbsoluteUrl("icons/info/FreezeInfo.png");
        if (target.classList.contains("p-frostbite")) return toAbsoluteUrl("icons/info/FrostbiteInfo.png");
        if (target.classList.contains("p-rock")) return toAbsoluteUrl("icons/info/RockInfo.png");
        if (target.classList.contains("p-rock-chunk")) return toAbsoluteUrl("icons/info/RockChunksInfo.png");
        if (target.classList.contains("p-stone-wall")) return toAbsoluteUrl("icons/info/StoneWallInfo.png");
        if (target.classList.contains("p-buffs")) return toAbsoluteUrl("icons/info/BuffInfo.png");
        if (target.classList.contains("p-dismembered")) return toAbsoluteUrl("icons/info/DismemberedInfo.png");
        if (target.classList.contains("p-puppet-mark")) return toAbsoluteUrl("icons/info/PuppetMarkInfo.png");
        if (target.classList.contains("p-rewind")) return toAbsoluteUrl("icons/info/RewindInfo.png");
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
            floatingTooltip.style.position = "fixed";
            floatingTooltip.style.pointerEvents = "none";
            floatingTooltip.style.zIndex = "1000000";
            floatingTooltip.style.boxShadow = "none";
            floatingTooltip.style.borderRadius = "10px";
            floatingTooltip.style.width = "280px";
            floatingTooltip.style.height = "140px";
            floatingTooltip.style.maxWidth = "none";
            floatingTooltip.style.objectFit = "contain";
            floatingTooltip.style.transform = "none";
            floatingTooltip.style.margin = "0";
            floatingTooltip.style.padding = "0";
            document.body.appendChild(floatingTooltip);
        }

        if (floatingTooltip.src !== src) {
            floatingTooltip.src = src;
        }
        floatingTooltip.style.display = "block";

        // Read CSS zoom factor (e.g. 1.25x on 1440p/4K or Windows scaled displays)
        const htmlZoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
        const bodyZoom = parseFloat(getComputedStyle(document.body).zoom) || 1;
        const zoom = htmlZoom * bodyZoom;

        const tooltipWidth = 280;
        const tooltipHeight = 140;

        let rawX = e.clientX;
        let rawY = e.clientY;

        // Viewport edge checks
        if (rawX + tooltipWidth > window.innerWidth - 10) {
            rawX = e.clientX - tooltipWidth - 6;
        }

        if (rawY + tooltipHeight > window.innerHeight - 10) {
            rawY = e.clientY - tooltipHeight - 6;
        }

        rawX = Math.max(4, rawX);
        rawY = Math.max(4, rawY);

        // Cancel out zoom scale so actual rendered top-left lands 1:1 at cursor tip
        const finalX = rawX / zoom;
        const finalY = rawY / zoom;

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