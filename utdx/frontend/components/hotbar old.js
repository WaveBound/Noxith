// ============================================================================
// HOTBAR.JS - Unit Selection Hotbar Logic
// ============================================================================

const hotbarState = {
    slots: Array(6).fill(null),
    fusionMode: false, // Legacy master switch (still used for skipping components)
    activeFusionIds: [], // Specific fusions that the user has explicitly activated
    buffState: {},
    fernTargets: [] // Array of slot indices (0-5)
};
window.hotbarState = hotbarState;



const getAvailableFusions = () => {
    const unitIdsInHotbar = hotbarState.slots.filter(u => u !== null).map(u => u.id);
    const hasNutaru = unitIdsInHotbar.includes(window.getUnitId('nutaru_beast'));
    const hasShinobi = unitIdsInHotbar.includes(window.getUnitId('ancient_shinob'));
    const hasSasuke = unitIdsInHotbar.includes(window.getUnitId('sasuke_great_war'));

    const fusions = [];
    if (hasNutaru && hasShinobi) fusions.push({ id: window.getUnitId('unparalleled_armor'), name: 'Unparalleled Armor', img: 'images/units/UnparalleledArmor.png', components: [window.getUnitId('nutaru_beast'), window.getUnitId('ancient_shinob')] });
    if (hasNutaru && hasSasuke) fusions.push({ id: window.getUnitId('majestic_armor'), name: 'Majestic Armor', img: 'images/units/MajesticArmor.png', components: [window.getUnitId('nutaru_beast'), window.getUnitId('sasuke_great_war')] });
    return fusions;
};

const getActiveFusions = () => {
    const available = getAvailableFusions();
    return available.filter(f => hotbarState.activeFusionIds.includes(f.id));
};

const toggleFusion = (armorId) => {
    const idx = hotbarState.activeFusionIds.indexOf(armorId);
    if (idx === -1) {
        hotbarState.activeFusionIds.push(armorId);
    } else {
        hotbarState.activeFusionIds.splice(idx, 1);
    }

    // Update legacy fusionMode flag based on whether ANY fusion is active
    hotbarState.fusionMode = hotbarState.activeFusionIds.length > 0;

    recalculateHotbarTeam();
    updateHotbarUI();
};

/**
 * Performs a full team-wide recalculation for all hotbar units.
 * This should be called only when the team composition or global buffs change.
 */
window.recalculateHotbarTeam = function recalculateHotbarTeam() {
    // 1. Temporarily swap buff context and database to the hotbar ones
    const savedDb = window.STATIC_BUILD_DB;
    window.STATIC_BUILD_DB = window.HOTBAR_STATIC_BUILD_DB || savedDb;
    if (typeof window.applyBuffContext === 'function') {
        window.applyBuffContext(hotbarState.buffState);
    }

    const hiddenContainer = document.getElementById('hotbarHiddenRender');

    // Determine which units need recalculating
    const hotbarUnitIds = hotbarState.slots.filter(u => u !== null).map(u => u.id);

    // Also include active fusion units in the refresh
    if (hotbarState.activeFusionIds.length > 0) {
        hotbarState.activeFusionIds.forEach(id => {
            if (!hotbarUnitIds.includes(id)) {
                hotbarUnitIds.push(id);
            }
        });
    }

    hotbarUnitIds.forEach(id => {
        const u = typeof window.getUnitById === 'function' ? window.getUnitById(id) : null;
        if (!u) return;

        const isAssistant = u.tags && u.tags.includes('Assistant');
        if (isAssistant) return;

        // Ensure hidden card exists
        if (!document.getElementById('card-' + id) && hiddenContainer && typeof renderUnitCard === 'function') {
            const card = renderUnitCard(u, 0);
            hiddenContainer.appendChild(card);
        }

        // Clear caches and force recalculation
        if (typeof window.resetCachesForBuffChange === 'function') {
            window.resetCachesForBuffChange(id);
        }
        if (typeof updateBuildListDisplay === 'function') {
            updateBuildListDisplay(id, true);
        }
    });

    // 2. Restore global DB + global buff context
    window.STATIC_BUILD_DB = savedDb;
    if (typeof window.applyBuffContext === 'function') {
        window.applyBuffContext(window.GLOBAL_BUFF_STATE || {});
    }

    if (window.CALCULATION_MODE !== 'loadout' && typeof window.resortUnitCardsInPlace === 'function') {
        window.resortUnitCardsInPlace();
    }
}

const getDetailedUnitStats = (unitId) => {
    const fullUnit = typeof window.getUnitById === 'function' ? window.getUnitById(unitId) : null;
    if (!fullUnit) return null;

    // Read the #1 build that is already rendered and hydrated on the unit card.
    let bestBuild = window.hotbarFilteredBuilds && window.hotbarFilteredBuilds[unitId]
        ? window.hotbarFilteredBuilds[unitId]
        : null;

    if (!bestBuild) return null;

    // Total damage accounts for all placements for the team summary footer
    const placements = (bestBuild.placement !== undefined) ? bestBuild.placement : (fullUnit.placement || 1);
    const totalDmg = (bestBuild.dmgVal || 0) * placements;
    const totalDps = (bestBuild.dps || 0); // Already total from calculations.js

    return {
        unit: fullUnit,
        build: bestBuild,
        dmg: totalDmg,
        dps: totalDps,
        teamDmg: totalDmg,
        teamDps: totalDps,
        placementsCounted: placements,
        placements: placements
    };
};

function openTeamSummary() {
    const slots = hotbarState.slots.filter(u => u !== null);
    if (slots.length === 0) {
        alert("Your hotbar is empty! Add some units to see the team summary.");
        return;
    }

    // HEAD_CONFIG from rendering.js — inline lookup for display names
    const HEAD_NAMES = {
        'sun_god': 'Sun God', 'ninja': 'Junior Ninja', 'reaper_necklace': 'Reaper',
        'shadow_reaper_necklace': 'S. Reaper', 'junior': 'Junior Ninja', 'biju_head': 'Biju',
        'reanimated_head': 'Reanimated', 'bloodline_head': 'Bloodline',
        'sorcerer_hunter_spirit': 'S.H. Spirit', 'strongest_sorcerer_glasses': 'Strongest',
        'monarch': 'Monarch Cape', 'warlord_hat': 'Warlord Hat', 'mochi_scarf': 'Mochi Scarf', 'flaming_donut': 'Flaming Donut', 'none': 'None'
    };
    const MAIN_STAT_NAMES = {
        body: { 'dmg': 'Damage', 'dot': 'DoT', 'cm': 'Crit Damage' },
        legs: { 'dmg': 'Damage', 'spa': 'SPA', 'cf': 'Crit Rate', 'range': 'Range' }
    };

    // Collect active hotbar buffs
    const activeBuffs = [];
    if (window.GLOBAL_BUFF_DATA) {
        Object.entries(window.GLOBAL_BUFF_DATA).forEach(([key, config]) => {
            if (hotbarState.buffState[key] === true) {
                activeBuffs.push({ name: config.name, color: config.color, renderLabel: config.renderLabel || config.desc || '' });
            }
        });
    }

    // Add King Sailor Leader Buff if active
    const leader = hotbarState.slots[0];
    if (leader && window.isUnit(leader.id, 'king_sailor')) {
        const config = (window.GLOBAL_BUFF_DATA || {}).kingSailor;
        if (config) {
            activeBuffs.push({
                name: "King's Mark",
                color: config.color,
                renderLabel: "Mark Synergy: Magi (+15% SPA +50% Dmg), Uncontrollable (+10% SPA +30% Dmg), Water (+10% SPA +20% Dmg)"
            });
        }
    }

    let html = `
        <style>
            .ts-ability-toggle {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                cursor: pointer;
                user-select: none;
                vertical-align: middle;
            }
            .ts-ability-toggle .mini-switch {
                margin: 0;
                transform: scale(0.7);
                flex-shrink: 0;
            }
            .ts-ability-toggle.is-on .mini-switch {
                background: var(--toggle-color, #f472b6);
            }
            .ts-ability-toggle.is-on .mini-switch::after {
                transform: translateX(14px);
            }
            .ts-ability-status {
                font-size: 0.6rem;
                font-weight: 900;
                letter-spacing: 0.5px;
                color: rgba(255,255,255,0.5);
            }
            .ts-ability-toggle.is-on .ts-ability-status {
                color: var(--toggle-color, #f472b6);
                text-shadow: 0 0 6px color-mix(in srgb, var(--toggle-color, #f472b6) 40%, transparent);
            }
        </style>
        <div class="team-summary-container">
            <div class="ts-modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                <h2 style="margin: 0; color: #e2e8f0; font-size: 1.4rem; display: flex; align-items: center; gap: 10px; font-weight: 900; letter-spacing: 1.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
                    <i class="fas fa-swords" style="color: var(--accent-start);"></i> TEAM SUMMARY
                </h2>
                <button onclick="closeModal('universalModal')" style="width: 32px; height: 32px; font-size: 1.4rem; background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); color: #fb7185; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 900; transition: 0.2s; padding-bottom: 2px;" onmouseover="this.style.background='rgba(244, 63, 94, 0.2)'" onmouseout="this.style.background='rgba(244, 63, 94, 0.1)'" title="Close">
                    &times;
                </button>
            </div>
            
            <div class="ts-section">
                <h3 class="ts-title">ACTIVE HOTBAR BUFFS</h3>
                <div class="ts-buffs-list">
                    ${activeBuffs.length > 0 ? activeBuffs.map(b => `
                        <div class="ts-buff-badge" style="border-color: ${b.color}44; background: ${b.color}11;">
                            <span style="color: ${b.color};">${b.name}</span>
                            <small>${b.renderLabel}</small>
                        </div>
                    `).join('') : '<div class="ts-empty">No active hotbar buffs.</div>'}
                </div>
            </div>

            <div class="ts-section">
                <h3 class="ts-title">UNIT BREAKDOWN</h3>
                <div class="ts-unit-grid">
    `;

    let teamDps = 0;
    let teamDmg = 0;
    let unitsToProcess = [...hotbarState.slots.filter(u => u !== null)];
    const teamEffects = []; // Collect all CC/debuff effects across the team

    // Rely on the hotbar's existing cache for speed
    // Calculations are kept fresh by updateHotbarUI(true) called on changes

    // If fusion is active, process fused units instead of components
    if (hotbarState.fusionMode) {
        const activeFusions = getActiveFusions();
        const componentIds = new Set();
        activeFusions.forEach(f => {
            f.components.forEach(id => componentIds.add(id));
            unitsToProcess.push({ id: f.id, name: f.name, img: f.img });
        });
        unitsToProcess = unitsToProcess.filter(u => !componentIds.has(u.id));
    }

    unitsToProcess.forEach(u => {
        const detail = getDetailedUnitStats(u.id);
        if (!detail) return;
        teamDps += detail.teamDps;
        teamDmg += detail.teamDmg;

        const unit = detail.unit;
        const build = detail.build;

        const headName = HEAD_NAMES[build.headUsed] || build.headUsed || 'None';
        const bodyName = (MAIN_STAT_NAMES.body[build.mainStats?.body] || build.mainStats?.body || 'Dmg');
        const legsName = (MAIN_STAT_NAMES.legs[build.mainStats?.legs] || build.mainStats?.legs || 'Dmg');
        const setName = build.setName || '—';
        const traitName = build.traitName || '—';

        // Use the same getRichBadgeHtml from utils.js for sub stat display
        const formatSubs = (list) => {
            if (typeof getRichBadgeHtml === 'function') {
                return getRichBadgeHtml(list || []);
            }
            // Fallback if getRichBadgeHtml isn't available
            if (!list || !Array.isArray(list) || list.length === 0) return '<span class="badge-empty">None</span>';
            return list.map(s => {
                const type = typeof getStatType === 'function' ? getStatType(s.type) : s.type;
                const label = (typeof STAT_LABELS !== 'undefined' && STAT_LABELS[type]) || s.type?.toUpperCase() || '?';
                const val = fix1(s.val) + '%';
                return `<span class="grad-${type}">${label}</span><span class="badge-val val-sub">${val}</span>`;
            }).join(' ');
        };

        const subs = build.subStats || {};

        // Collect Multipliers / CC — read directly from unit stats
        const effects = [];
        const stats = unit.stats || {};
        if (stats.slowPct) effects.push({ label: 'Slow', val: `${stats.slowPct}% (${stats.slowDuration || 0}s)`, color: '#60a5fa' });
        if (stats.stunDuration) effects.push({ label: 'Stun', val: `${stats.stunDuration}s`, color: '#fbbf24' });
        if (stats.timestopDuration) effects.push({ label: 'Timestop', val: `${stats.timestopDuration}s`, color: '#a78bfa' });
        if (stats.hasRadiation) effects.push({ label: 'Radiation', val: `+${stats.radiationPct || 20}% Dmg Taken (${stats.radiationDuration || 6}s)`, color: '#f87171' });

        // Get active mode name for mode-specific effects
        let activeModeName = null;
        let activeModes = [];
        if (unit.modes && Array.isArray(unit.modes)) {
            const state = (window.unitModesState && window.unitModesState[unit.id] !== undefined) ? window.unitModesState[unit.id] : 0;
            activeModes = Array.isArray(state) ? state : [state];
            const currentModeObj = unit.modes[activeModes[0]];
            if (currentModeObj) activeModeName = currentModeObj.name.toLowerCase();
        }

        // Custom Unit Effects requested by user
        if (unit.id === 'joyful_captain' && (activeModes.includes(2) || activeModes.includes(3))) {
            effects.push({ label: 'Rubber Control', val: '1.5x DoT', color: '#f43f5e', skipTeam: true });
            effects.push({ label: 'Rubber Control', val: 'Knockback 10 studs', color: '#f43f5e', skipTeam: true });
            effects.push({ label: 'Rubber Control', val: '+30% Dmg Taken', color: '#f43f5e', skipTeam: true });
            teamEffects.push({ label: 'Rubber Control', val: '1.5x DoT | Knockback 10 studs | +30% Dmg Taken', color: '#f43f5e', unitName: unit.name });
        } else if (unit.id === 'underworld_god') {
            effects.push({ label: 'Primordial Power', val: '30% Slow (3s) | +20% DoT/Affliction', color: '#60a5fa' });
        } else if (unit.id === 'water_god') {
            effects.push({ label: 'Primordial Power', val: '30% Slow (3s) | +20% DoT Duration', color: '#60a5fa' });
            effects.push({ label: 'God of the Seas', val: '+30% DoT Dmg / Duration to enemies', color: '#38bdf8' });

            // Check for Underworld God synergy
            const hotbar = window.hotbarState;
            if (hotbar && hotbar.slots && hotbar.slots.some(s => s && window.isUnit(s.id, 'underworld_god'))) {
                effects.push({ label: 'Divine Accord', val: '-1 Placement Limit (Synergy Active)', color: '#c084fc' });
            }
        } else if (unit.id === 'sasuke_great_war') {
            effects.push({ label: 'Pure Hatred', val: 'Applies Hatred (5s) | +15% Dmg Taken', color: '#a855f7' });
            effects.push({ label: 'Dark Stun', val: 'Stuns Dark enemies for 3s', color: '#fcd34d' });
        } else if (unit.id === 'crow_shinobi') {
            effects.push({ label: 'Amaterasu', val: 'Passive', color: '#f87171' });
            effects.push({ label: 'Time Snail', val: '+20% DoT & Status | 30% Slow (3s)', color: '#fb923c' });
        } else if (unit.id === 'the_strongest_in_history') {
            effects.push({ label: 'The Shadows', val: '+15-35% Dmg Taken (Marks)', color: '#f87171' });
            if (activeModes.includes(1) || activeModes.includes(2)) {
                effects.push({ label: 'Ten Umbra', val: 'Stun (3s) | 40% Bleed | 20% Radiation', color: '#c084fc' });
            }
            effects.push({ label: 'Domain Expansion', val: '20% Slow | +20% Dmg Taken', color: '#f43f5e' });
        } else if (unit.id === 'the_strongest_of_today') {
            effects.push({ label: 'Limitless', val: '40% Slow (5s) | +25% Dmg Taken in Range', color: '#60a5fa' });
            effects.push({ label: 'On Crit', val: 'Timestops enemies for 4s', color: '#a78bfa' });
            effects.push({ label: 'Domain Expansion', val: 'Timestops map for 30s', color: '#c084fc' });

            const isToggled = window.activeAbilityIds.has(unit.id);
            effects.push({
                label: 'TS Enemy (3x)',
                val: `<label class="ts-ability-toggle ${isToggled ? 'is-on' : ''}" style="--toggle-color: #f472b6;">
                    <input type="checkbox" ${isToggled ? 'checked' : ''} onchange="toggleAbility('${unit.id}', this); var lbl=this.closest('.ts-ability-toggle'); lbl.classList.toggle('is-on',this.checked); lbl.querySelector('.ts-ability-status').textContent=this.checked?'ON':'OFF';" style="display:none;">
                    <span class="ts-ability-status">${isToggled ? 'ON' : 'OFF'}</span>
                    <div class="mini-switch"></div>
                </label>`,
                color: '#f472b6'
            });
        } else if (unit.id === 'ant_king_savage') {
            effects.push({ label: 'Paralyzing Venom', val: '20% Slow (6s)', color: '#fbbf24' });

            // Check for E4+ team buff
            if (unit.etherealization && unit.etherealization.length >= 4) {
                effects.push({ label: "Monarch's Devotion", val: '+10% Dmg to Team (E4+)', color: '#f472b6' });
            }
        } else if (unit.id === 'quake_warlord') {
            effects.push({ label: 'Quake Stun', val: 'Stun for 3s on attack', color: '#fbbf24' });
            effects.push({ label: 'Quake Slow', val: '40% Slow for 5s on Crit', color: '#60a5fa' });
        } else if (unit.id === 'mochi_pirate') {
            effects.push({ label: 'Time Snail', val: '+20% DoT & Status | 30% Slow (3s)', color: '#fb923c' });
        } else if (unit.id === 'jinoo_shadow_monarch') {
            effects.push({ label: 'Strongest Hunter', val: '+20-30% Dmg to Leveling units', color: '#818cf8' });
            if (activeModes.includes(3)) effects.push({ label: 'Shadow Knight', val: '2s Stun', color: '#a78bfa' });
            if (activeModes.includes(4)) effects.push({ label: 'Ant King', val: '30% Bleed', color: '#f87171' });
        } else if (unit.id === 'alpha_devil' && activeModeName === 'katana') {
            effects.push({ label: 'Katana Mode', val: 'Stuns enemies for 3s', color: '#fcd34d' });
        } else if (unit.id === 'devil_hunter' && activeModeName === 'demoncycle') {
            effects.push({ label: 'Demoncycle Mode', val: 'Stuns +2s per DoT applied to enemy', color: '#f87171' });
        } else if (unit.id === 'ancient_mage' && activeModeName === 'utility') {
            effects.push({ label: 'Utility Stun', val: 'Stun (2s) | +20% Dmg Taken', color: '#a78bfa' });
            effects.push({ label: 'Utility Slow', val: '75% Slow for 5s', color: '#38bdf8' });
        } else if (unit.id === 'mimicry_sorcerer' && activeModeName === 'infinity sorcerer') {
            effects.push({ label: 'Infinity Mode', val: '+15% Dmg Taken | 30% Slow (5s) | Stun (3s)', color: '#818cf8' });
        } else if (unit.id === 'enlightenedgod' && activeModeName === 'shield of fear') {
            effects.push({ label: 'Shield of Fear', val: 'Converts Debuffs to Buffs', color: '#fbbf24' });
        } else if (unit.id === 'prodigy_mage') {
            effects.push({ label: 'Prodigy Slow', val: '30% Slow for 5s', color: '#38bdf8' });
            effects.push({ label: 'Prodigy Stun', val: 'Stun for 2.5s', color: '#a78bfa' });
        } else if (unit.id === 'unparalleled_armor') {
            effects.push({ label: 'Ancient Shinobi', val: 'Stun or Confuse (3s)', color: '#fbbf24' });
        } else if (unit.id === 'majestic_armor') {
            // Combined Might removed as per user request
        }

        // Push to team-wide effects tracker
        effects.forEach(e => {
            if (!e.skipTeam) teamEffects.push({ ...e, unitName: unit.name });
        });

        // DPS breakdown stats
        const spaStr = build.spa ? (typeof fix2 === 'function' ? fix2(build.spa) + 's' : build.spa.toFixed(2) + 's') : '—';
        const rangeStr = build.range ? (typeof fix1 === 'function' ? fix1(build.range) : build.range.toFixed(1)) : '—';
        const critStr = subs.finalCf != null ? (typeof fix1 === 'function' ? fix1(subs.finalCf) : subs.finalCf.toFixed(1)) + '%' : '—';
        const cdmgStr = subs.finalCm != null ? Math.round(subs.finalCm) + '%' : '—';

        // Check for King Sailor bonus - ONLY applies if KS is in Slot 1 (Leader)
        let ksBonus = null;
        const leader = hotbarState.slots[0];
        const isPotential = window.CALCULATION_MODE === 'potential';
        const isLoadout = window.CALCULATION_MODE === 'loadout';
        const isKsLeading = isPotential || (leader && window.isUnit(leader.id, 'king_sailor'));
        const isKsActive = isPotential || (isLoadout && isKsLeading) || window.kingSailorActive || (hotbarState.buffState.kingSailor && isKsLeading);

        // Mark bonus only triggers if KS is the leader
        if (isKsActive && isKsLeading) {
            const tags = unit.tags || [];
            const rawElement = unit.element || (unit.stats && unit.stats.element) || (unit.meta && unit.meta.element) || "";
            const element = String(rawElement).toLowerCase();

            if (tags.includes('Magi')) ksBonus = 'MAGI: +50% DMG / +15% SPA';
            else if (tags.includes('Uncontrollable Power')) ksBonus = 'UNCONTROLLABLE: +30% DMG / +10% SPA';
            else if (element === 'water') ksBonus = 'WATER: +20% DMG / +10% SPA';
        }

        // Check for Triple Threat leader bonus - ONLY applies if TT is in Slot 1 (Leader)
        let ttBonus = null;
        const isTtLeading = isPotential || (leader && window.isUnit(leader.id, 'triple_threat'));
        const isTtActive = isPotential || (isLoadout && isTtLeading) || window.tripleThreatActive || (hotbarState.buffState.triple_threat && isTtLeading) || (hotbarState.buffState.triplethreat && isTtLeading);

        if (isTtActive && isTtLeading) {
            const tags = unit.tags || [];
            const rawElement = unit.element || (unit.stats && unit.stats.element) || (unit.meta && unit.meta.element) || "";
            const element = String(rawElement).toLowerCase();

            if (tags.includes('Piece')) ttBonus = 'UNRIVALED: +50% DMG (Piece)';
            else if (tags.includes('Sword')) ttBonus = 'UNRIVALED: +25% DMG (Sword)';
            else if (element === 'wind') ttBonus = 'UNRIVALED: +20% DMG / +5% CRIT (Wind)';
        }

        html += `
            <div class="ts-unit-card">
                <div class="ts-unit-header">
                    <div class="ts-header-left">
                        <div class="ts-img-container">
                            <img src="${unit.img}" class="ts-unit-img">
                        </div>
                        <div class="ts-unit-info">
                            <div style="display: flex; align-items: center; flex-wrap: wrap;">
                                <span class="ts-unit-name">${unit.name}</span>
                            </div>
                            <div class="ts-unit-trait">${traitName}</div>
                            ${(() => {
                if (unit.modes && Array.isArray(unit.modes)) {
                    const activeMode = (window.unitModesState && window.unitModesState[unit.id] !== undefined) ? window.unitModesState[unit.id] : 0;
                    const currentMode = unit.modes[activeMode];
                    const isSummon = unit.modesLabel && unit.modesLabel.toLowerCase() === 'summons';
                    if (currentMode && !isSummon) {
                        return `<div class="ts-unit-mode" style="margin-top: 4px; font-size: 0.75rem; color: #c084fc; font-weight: 800; background: rgba(192, 132, 252, 0.1); border: 1px solid rgba(192, 132, 252, 0.3); padding: 2px 6px; border-radius: 4px; white-space: nowrap; max-width: 150px; overflow: hidden; text-overflow: ellipsis; display: inline-block;" title="${currentMode.name}">⚙ MODE: ${currentMode.name.toUpperCase()}</div>`;
                    }
                }
                return '';
            })()}
                            ${(() => {
                if (!isLoadout || !build.baseStats || !build.baseStats.requiresDot) return '';
                const req = build.baseStats.requiresDot;
                const isMet = build.dotData && !build.dotData.inactive;
                return `
                                    <div class="ts-synergy-badge ${isMet ? 'active' : 'missing'}">
                                        <i class="fas ${isMet ? 'fa-link' : 'fa-link-slash'}"></i> 
                                        ${isMet ? 'SYNCED' : 'REQUIRED'}: ${req.toUpperCase()}
                                    </div>
                                `;
            })()}
                        </div>
                    </div>
                    <div class="ts-header-right">
                        <div class="ts-dps-box">
                            <div class="ts-dps-val">${format(detail.dps)}</div>
                            <div class="ts-dps-label">TOTAL DPS (x${detail.placementsCounted})</div>
                        </div>
                    </div>
                </div>

                <div class="ts-stats-compact-grid">
                    <div class="ts-stat-item"><span class="ts-stat-label">DMG</span><span class="ts-stat-val dmg">${format(detail.dmg)}</span></div>
                    <div class="ts-stat-item"><span class="ts-stat-label">SPA</span><span class="ts-stat-val spa">${spaStr}</span></div>
                    <div class="ts-stat-item"><span class="ts-stat-label">RANGE</span><span class="ts-stat-val range">${rangeStr}</span></div>
                    <div class="ts-stat-item"><span class="ts-stat-label">CRIT</span><span class="ts-stat-val crit">${critStr}</span></div>
                    <div class="ts-stat-item"><span class="ts-stat-label">CDMG</span><span class="ts-stat-val cdmg">${cdmgStr}</span></div>
                </div>

                <div class="ts-breakdown-container">
                    <div class="ts-section-group">
                        <div class="ts-breakdown-title">EQUIPMENT</div>
                        <div class="ts-set-display">
                            <span class="ts-set-label">Relic Set</span>
                            <span class="ts-set-val">${setName}</span>
                        </div>
                        <div class="ts-equipment-grid">
                            <div class="ts-eq-item">
                                <span class="ts-eq-label">Head Piece</span>
                                <span class="ts-eq-val">${headName}</span>
                            </div>
                            <div class="ts-eq-item">
                                <span class="ts-eq-label">Body Relic</span>
                                <span class="ts-eq-val">${bodyName}</span>
                            </div>
                            <div class="ts-eq-item">
                                <span class="ts-eq-label">Leg Relic</span>
                                <span class="ts-eq-val">${legsName}</span>
                            </div>
                        </div>
                    </div>

                    <div class="ts-section-group">
                        <div class="ts-breakdown-title">SUB-STAT BREAKDOWN</div>
                        <div class="ts-subs-breakdown">
                            <div class="ts-subs-row">
                                <div class="ts-piece-badge">HEAD</div>
                                <div class="ts-subs-list">${formatSubs(subs.head || [])}</div>
                            </div>
                            <div class="ts-subs-row">
                                <div class="ts-piece-badge">BODY</div>
                                <div class="ts-subs-list">${formatSubs(subs.body || [])}</div>
                            </div>
                            <div class="ts-subs-row">
                                <div class="ts-piece-badge">LEGS</div>
                                <div class="ts-subs-list">${formatSubs(subs.legs || [])}</div>
                            </div>
                        </div>
                    </div>

                    ${(() => {
                // Determine if Jinoo is in loadout (for Monarch's Devotion)
                const jinooInLoadout = isLoadout ? hotbarState.slots.some(s => s && (window.isUnit(s.id, 'jinoo_shadow_monarch') || window.isUnit(s.id, 'sjw'))) : true;

                let passiveHtml = '';
                let activePassives = unit.passives;
                if (unit.modes && Array.isArray(unit.modes)) {
                    const activeModeIdx = (window.unitModesState && window.unitModesState[unit.id] !== undefined) ? window.unitModesState[unit.id] : 0;
                    if (unit.modes[activeModeIdx] && unit.modes[activeModeIdx].passives) {
                        activePassives = unit.modes[activeModeIdx].passives;
                    }
                }
                if (activePassives && activePassives.length > 0) {
                    passiveHtml = activePassives.map(p => {
                        // Special logic for King Sailor and Triple Threat conditional passives
                        if (p.name === "Unrivaled Mark") {
                            if (window.isUnit(unit.id, 'king_sailor')) {
                                if (!isKsActive || !isKsLeading) return null;
                            } else if (window.isUnit(unit.id, 'triple_threat')) {
                                const isTtLeading = isPotential || (leader && window.isUnit(leader.id, 'triple_threat'));
                                if (!isTtLeading) return null;
                            }
                        }

                        // Monarch's Devotion: only show when Jinoo is in loadout (Loadout Mode) or always in Potential
                        if (p.name === "Monarch's Devotion") {
                            if (isLoadout && !jinooInLoadout) return null;
                        }

                        // Find calculated stats in the breakdown if available
                        const pb = (build.detailedBuffs && build.detailedBuffs.passiveBreakdown)
                            ? build.detailedBuffs.passiveBreakdown.find(item => item.name === p.name)
                            : null;

                        const statParts = [];
                        const dmgVal = pb ? pb.dmg : (p.passiveDmg || 0);
                        const spaVal = pb ? pb.spa : (p.passiveSpa || 0);
                        const critVal = pb ? pb.crit : (p.passiveCrit || 0);
                        const cdmgVal = pb ? pb.cdmg : (p.passiveCdmg || 0);
                        const trueVal = pb ? (pb.trueDmg || 0) : (p.trueDmg || 0);
                        const dotVal = pb ? (pb.dot || 0) : (p.dot || 0);
                        const rangeVal = pb ? (pb.range || 0) : (p.passiveRange || 0);

                        if (dmgVal !== 0) statParts.push(`+${dmgVal}% DMG`);
                        else if (pb && p.name === "Manipulator of Fate") statParts.push(`+0% DMG`);

                        if (spaVal !== 0) statParts.push(`-${spaVal}% SPA`);
                        else if (pb && p.name === "Manipulator of Fate") statParts.push(`-0% SPA`);

                        if (critVal !== 0) statParts.push(`+${critVal}% CRIT`);
                        if (cdmgVal !== 0) statParts.push(`+${cdmgVal}% CDMG`);
                        if (trueVal !== 0) statParts.push(`+${trueVal}% TRUE`);
                        if (dotVal !== 0) statParts.push(`+${dotVal}% DOT`);
                        if (rangeVal !== 0) statParts.push(`+${rangeVal}% RANGE`);

                        const statStr = statParts.join(' / ');
                        let descText = p.desc ? (p.desc.length > 250 ? p.desc.substring(0, 250).trim() + '…' : p.desc) : '';


                        // Determine badge type
                        let badgeLabel = 'PASSIVE';
                        let badgeClass = 'ts-passive-badge';
                        if (p.name === "Monarch's Devotion" && isLoadout && jinooInLoadout) {
                            badgeLabel = 'TEAM';
                            badgeClass = 'ts-passive-badge ts-team-badge';
                        }

                        return `
                                    <div class="ts-passive-row">
                                        <div class="${badgeClass}">${badgeLabel}</div>
                                        <div class="ts-passive-main">
                                            <span class="ts-passive-name">${p.name}</span>
                                            ${statStr ? `<span class="ts-passive-stats">${statStr}</span>` : ''}
                                            ${descText ? `<span class="ts-passive-desc">${descText}</span>` : ''}
                                        </div>
                                    </div>
                                `;
                    }).filter(x => x !== null).join('');
                }

                // Check if Monarch's Devotion team buff applies to THIS unit (from Ant King being in loadout)
                let monarchTeamBuff = '';
                if (isLoadout) {
                    const antKingInLoadout = hotbarState.slots.some(s => s && window.isUnit(s.id, 'ant_king_savage'));
                    const isThisAntKing = window.isUnit(unit.id, 'ant_king_savage');
                    if (antKingInLoadout && jinooInLoadout && !isThisAntKing) {
                        monarchTeamBuff = `
                                    <div class="ts-passive-row">
                                        <div class="ts-passive-badge ts-team-badge">TEAM</div>
                                        <div class="ts-passive-main">
                                            <span class="ts-passive-name">Monarch's Devotion</span>
                                            <span class="ts-passive-stats">+10% DMG</span>
                                            <span class="ts-passive-desc">Ant King (Savage) buffs all other units in range by +10% Damage.</span>
                                        </div>
                                    </div>
                                `;
                    }
                }

                if (!passiveHtml && !monarchTeamBuff) return '';

                return `
                        <div class="ts-section-group">
                            <div class="ts-breakdown-title">PASSIVE ABILITIES</div>
                            <div class="ts-passives-container">
                                ${passiveHtml}
                                ${monarchTeamBuff}
                            </div>
                        </div>
                        `;
            })()}
                </div>

                <div class="ts-lower-row" style="margin-top: auto;">
                    ${ksBonus ? `
                        <div class="ts-bonus-pill" style="margin-bottom: 8px; display: inline-block;">
                            <span class="ks-text">${ksBonus}</span>
                        </div>
                    ` : ''}
                    ${ttBonus ? `
                        <div class="ts-bonus-pill" style="border-color: rgba(167, 243, 208, 0.4); background: rgba(167, 243, 208, 0.08); color: #a7f3d0; padding: 4px 10px; font-size: 0.7rem; height: auto; margin-bottom: 8px; display: inline-block; width: fit-content; line-height: 1.2;">
                            <span class="ks-text" style="color: #a7f3d0;">${ttBonus}</span>
                        </div>
                    ` : ''}
                    ${effects.length > 0 ? `
                        <div class="ts-effect-badges">
                            ${effects.map(e => `<div class="ts-effect-badge" style="--effect-color: ${e.color};"><span class="ts-effect-dot" style="background: ${e.color};"></span>${e.label}<span class="ts-effect-val">${e.val}</span></div>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    });

    // Build team effects summary - deduplicate non-slows, list all slows and highlight the max
    const uniqueTeamEffects = [];
    const seenLabels = new Set();

    // Separate Slows for special handling
    const slows = teamEffects.filter(e => e.label.toLowerCase().includes('slow'));
    const nonSlows = teamEffects.filter(e => !e.label.toLowerCase().includes('slow'));

    // Handle Non-Slows (Deduplicate)
    nonSlows.forEach(e => {
        if (!seenLabels.has(e.label)) {
            uniqueTeamEffects.push(e);
            seenLabels.add(e.label);
        } else {
            const existing = uniqueTeamEffects.find(x => x.label === e.label);
            if (existing && !existing.unitName.includes(e.unitName)) {
                existing.unitName += `, ${e.unitName}`;
            }
        }
    });

    // Handle Slows (List all, highlight max)
    let maxSlowVal = 0;
    slows.forEach(s => {
        const match = s.val.match(/(\d+)%/);
        if (match) {
            const val = parseInt(match[1]);
            if (val > maxSlowVal) maxSlowVal = val;
        }
    });

    slows.forEach(s => {
        const match = s.val.match(/(\d+)%/);
        const isMax = match && parseInt(match[1]) === maxSlowVal && maxSlowVal > 0;
        uniqueTeamEffects.push({
            ...s,
            isMaxEffect: isMax
        });
    });

    // Calculate total damage multiplier
    let totalDmgMulti = 1.0;
    uniqueTeamEffects.forEach(e => {
        const valText = e.val.toLowerCase();
        const labelText = e.label.toLowerCase();

        // Match damage taken / radiation multipliers
        if (valText.includes('dmg taken') || labelText.includes('dmg taken') || labelText.includes('radiation')) {
            // Find percentages
            const matches = [...e.val.matchAll(/(\d+)%/g)];
            if (matches.length > 0) {
                // For ranges or multiple percentages in one string, use the highest one for the multiplier
                let highestPct = 0;
                matches.forEach(m => {
                    const num = parseInt(m[1]);
                    if (num > highestPct) highestPct = num;
                });
                totalDmgMulti *= (1 + highestPct / 100);
            }
        }
    });

    const teamEffectsHtml = uniqueTeamEffects.length > 0 ? `
        <div class="ts-section ts-team-effects-section">
            <h3 class="ts-title">TEAM EFFECTS</h3>
            <div class="ts-team-effects-grid">
                ${uniqueTeamEffects.map(e => `
                    <div class="ts-team-effect-row ${e.isMaxEffect ? 'is-max-effect' : ''}" style="--effect-color: ${e.color}; ${e.isMaxEffect ? 'background: rgba(255,255,255,0.05); border-left: 2px solid ' + e.color + ';' : ''}">
                        <span class="ts-effect-dot" style="background: ${e.color};"></span>
                        <span class="ts-te-label">${e.label}</span>
                        <span class="ts-te-val">${e.val} ${e.isMaxEffect ? '<span style="font-size: 0.6rem; font-weight: 900; color: #4ade80; margin-left: 5px; letter-spacing: 0.5px;">[MAX]</span>' : ''}</span>
                        <span class="ts-te-source">${e.unitName}</span>
                    </div>
                `).join('')}

                ${totalDmgMulti > 1.0 ? `
                    <div class="ts-team-effect-row total-multi-row" style="margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; --effect-color: #fb7185;">
                        <span class="ts-te-label" style="font-weight: 900; color: #fb7185; letter-spacing: 1px; font-size: 0.75rem;">TOTAL DMG MULTI</span>
                        <span class="ts-te-val" style="font-size: 1.2rem; font-weight: 900; color: #fff; text-shadow: 0 0 10px rgba(251, 113, 133, 0.4);">x${totalDmgMulti.toFixed(2)}</span>
                        <span class="ts-te-source" style="font-size: 0.7rem; opacity: 0.6;">Combined Team Debuffs</span>
                    </div>
                ` : ''}
            </div>
        </div>
    ` : '';

    html += `
                </div>
            </div>

            ${teamEffectsHtml}

            <div class="ts-footer">
                <div class="ts-total-group left">
                    <span class="ts-total-label">TEAM TOTAL DPS</span>
                    <span class="ts-total-val dps">${format(teamDps)}</span>
                </div>
                <div class="ts-total-group right">
                    <span class="ts-total-label">TEAM TOTAL DMG</span>
                    <span class="ts-total-val dmg">${format(teamDmg)}</span>
                </div>
            </div>
        </div>
    `;



    if (typeof showUniversalModal === 'function') {
        showUniversalModal({
            title: '',
            content: html,
            size: 'modal-lg',
            headerClass: 'hidden-header',
            footerClass: 'hidden-header',
            boxClass: 'modal-transparent'
        });
    } else {
        alert("Modal system not found. Check console for data.");
        console.log("Team Summary HTML:", html);
    }
}

function handleHotbarBuffToggle(configKey, checkbox) {
    const config = window.GLOBAL_BUFF_DATA?.[configKey];
    if (!config) return;

    const isChecked = checkbox.checked;

    // Store in hotbarState.buffState for the math function to read at runtime
    hotbarState.buffState[configKey] = isChecked;

    // Fern buffs (mageHill/mageGround) are per-unit TARGETED — they must NOT
    // be included in HOTBAR_BUFF_STATE because that determines which pre-calculated
    // database file is loaded. If included, ALL builds get Fern baked in, even
    // for untargeted units. Fern is applied purely through the math function.
    const isFernTargetedBuff = (configKey === 'mageHill' || configKey === 'mageGround');
    if (window.HOTBAR_BUFF_STATE && !isFernTargetedBuff) {
        window.HOTBAR_BUFF_STATE[configKey] = isChecked;
    }

    // Handle mutually exclusive buffs (e.g. mageHill <-> mageGround)
    if (isChecked && config.excludes) {
        const exclConfig = window.GLOBAL_BUFF_DATA[config.excludes];
        if (exclConfig) {
            hotbarState.buffState[config.excludes] = false;
            if (window.HOTBAR_BUFF_STATE) window.HOTBAR_BUFF_STATE[config.excludes] = false;
            const otherCb = document.querySelector(`#hotbarToggles input[data-hotbar-buff="${config.excludes}"]`);
            if (otherCb) {
                otherCb.checked = false;
                if (typeof updateBuffVisuals === 'function') {
                    updateBuffVisuals(otherCb.closest('.nav-toggle-label'), false, exclConfig.color);
                }
            }
        }
    }

    // Update visuals for this toggle
    if (typeof updateBuffVisuals === 'function') {
        updateBuffVisuals(checkbox.closest('.nav-toggle-label'), isChecked, config.color);
    }

    // Load the hotbar-specific DB (scoped to HOTBAR_BUFF_STATE), then re-render
    // only hotbar unit cards with hotbar buff context applied.
    const hotbarUnitIds = hotbarState.slots.filter(u => u !== null).map(u => u.id);

    // Also apply hotbar buffs to active synchro/fusion units
    const activeFusions = getActiveFusions();
    activeFusions.forEach(f => {
        if (!hotbarUnitIds.includes(f.id)) {
            hotbarUnitIds.push(f.id);
        }
    });

    window.loadHotbarDb(() => {
        if (typeof window.recalculateHotbarTeam === 'function') {
            window.recalculateHotbarTeam();
        }
        updateHotbarUI();
    });
}

function initHotbar() {
    // Create Hotbar HTML if it doesn't exist
    if (!document.getElementById('unitHotbar')) {
        const hotbar = document.createElement('div');
        hotbar.id = 'unitHotbar';
        hotbar.className = 'unit-hotbar';

        // --- TOP BAR (Hotbar Buff Toggles) ---
        const togglesRow = document.createElement('div');
        togglesRow.id = 'hotbarToggles';
        togglesRow.className = 'hotbar-toggles-row';
        hotbar.appendChild(togglesRow);

        // --- LEFT WRAPPER (Stats & Info) ---
        const leftWrapper = document.createElement('div');
        leftWrapper.className = 'hotbar-left-wrapper';

        const statsBox = document.createElement('div');
        statsBox.className = 'hotbar-stats-box';
        statsBox.innerHTML = `
            <div class="hotbar-stat-group dmg-group" title="Total Team Damage">
                <div class="stat-label">TOTAL DMG</div>
                <div class="stat-value-box">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"></path><path d="M13 19l6-6"></path><path d="M16 16l4 4"></path><path d="M19 13l2 2"></path></svg>
                    <span id="totalTeamDmg">0</span>
                </div>
            </div>
            <div class="hotbar-stat-group dps-group" title="Total Team DPS">
                <div class="stat-label">TOTAL DPS</div>
                <div class="stat-value-box dps-value-box">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                    <span id="totalTeamDps">0</span>
                </div>
            </div>
        `;

        const infoBtn = document.createElement('button');
        infoBtn.className = 'hotbar-extra-btn hotbar-info-btn';
        infoBtn.innerHTML = 'Info';
        infoBtn.onclick = (e) => {
            e.stopPropagation();
            if (typeof openTeamSummary === 'function') openTeamSummary();
        };

        leftWrapper.appendChild(statsBox);
        leftWrapper.appendChild(infoBtn);
        hotbar.appendChild(leftWrapper);

        // --- CENTER WRAPPER (Slots) ---
        const centerWrapper = document.createElement('div');
        centerWrapper.className = 'hotbar-center-wrapper';

        const slotsWrapper = document.createElement('div');
        slotsWrapper.className = 'hotbar-slots-wrapper';

        for (let i = 0; i < 6; i++) {
            const slot = document.createElement('div');
            slot.className = 'hotbar-slot';
            slot.dataset.index = i;
            slot.draggable = true;

            slot.addEventListener('dragstart', (e) => {
                if (!hotbarState.slots[i]) {
                    e.preventDefault();
                    return;
                }
                e.dataTransfer.setData('text/plain', i);
                slot.classList.add('dragging');
            });

            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.classList.add('drag-over');
            });

            slot.addEventListener('dragleave', () => {
                slot.classList.remove('drag-over');
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const toIndex = i;

                if (fromIndex !== toIndex) {
                    const temp = hotbarState.slots[toIndex];
                    hotbarState.slots[toIndex] = hotbarState.slots[fromIndex];
                    hotbarState.slots[fromIndex] = temp;

                    recalculateHotbarTeam();
                    updateHotbarUI();
                }
            });

            slot.addEventListener('dragend', () => {
                slot.classList.remove('dragging');
                document.querySelectorAll('.hotbar-slot').forEach(s => s.classList.remove('drag-over'));
            });

            const num = document.createElement('div');
            num.className = 'slot-number';
            num.innerText = i + 1;
            slot.appendChild(num);

            slotsWrapper.appendChild(slot);
        }
        centerWrapper.appendChild(slotsWrapper);
        hotbar.appendChild(centerWrapper);

        // Add Farms & Buffers Buttons and Menus
        const extraButtonsWrapper = document.createElement('div');
        extraButtonsWrapper.className = 'extra-buttons-wrapper';

        // --- FARMS ---
        const farmsContainer = document.createElement('div');
        farmsContainer.className = 'hotbar-extra-container';

        const farmsBtn = document.createElement('button');
        farmsBtn.className = 'hotbar-extra-btn farms-btn';
        farmsBtn.innerHTML = 'Farms';
        farmsBtn.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll('.hotbar-extra-menu').forEach(m => m !== farmsMenu && m.classList.remove('active'));
            farmsMenu.classList.toggle('active');
        };

        const farmsMenu = document.createElement('div');
        farmsMenu.className = 'hotbar-extra-menu farms-menu';
        farmsMenu.onclick = (e) => e.stopPropagation();

        const farmUnits = [
            { id: 'bulma', name: 'Bulma', img: 'images/units/Bulma.png', tags: ['Hero', 'Assistant'] },
            { id: 'speedwagon', name: 'Speedcart', img: 'images/units/Speedwagon.png', tags: ['Assistant'] }
        ];

        farmUnits.forEach(farm => {
            const item = document.createElement('div');
            item.className = 'farm-item';
            item.innerHTML = `<img src="${farm.img}" alt="${farm.name}" title="${farm.name}" onerror="this.src='images/units/placeholder.png'">`;
            item.onclick = (e) => {
                e.stopPropagation();
                addUnitToHotbar(farm);
                farmsMenu.classList.remove('active');
            };
            farmsMenu.appendChild(item);
        });

        farmsContainer.appendChild(farmsBtn);
        farmsContainer.appendChild(farmsMenu);

        // --- BUFFERS ---
        const buffersContainer = document.createElement('div');
        buffersContainer.className = 'hotbar-extra-container';

        const buffersBtn = document.createElement('button');
        buffersBtn.className = 'hotbar-extra-btn buffers-btn';
        buffersBtn.innerHTML = 'Buffers';
        buffersBtn.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll('.hotbar-extra-menu').forEach(m => m !== buffersMenu && m.classList.remove('active'));
            buffersMenu.classList.toggle('active');
        };

        const buffersMenu = document.createElement('div');
        buffersMenu.className = 'hotbar-extra-menu buffers-menu';
        buffersMenu.onclick = (e) => e.stopPropagation();

        const bufferUnits = [
            { id: 'miku', name: 'Miku', img: 'images/units/Miku.png', tags: ['Assistant'] },
            { id: 'enlightenedgod', name: 'Enlightened God', img: 'images/units/EnlightenedGod.png' },
            { id: 'ancient_mage', name: 'Ancient Mage', img: 'images/units/AncientMage.png' },
            { id: 'king_sailor', name: 'King Sailor', img: 'images/units/KingSailor.png' },
            { id: 'prodigy_mage', name: 'Prodigy Mage', img: 'images/units/ProdigyMage.png' }
        ];

        bufferUnits.forEach(buff => {
            const item = document.createElement('div');
            item.className = 'farm-item buffer-item'; // Reuse farm-item class for styling
            item.innerHTML = `<img src="${buff.img}" alt="${buff.name}" title="${buff.name}" onerror="this.src='images/units/placeholder.png'">`;
            item.onclick = (e) => {
                e.stopPropagation();
                // Use forceAdd = true so it doesn't toggle OFF if already there
                addUnitToHotbar(buff, true);


                updateHotbarUI();
                buffersMenu.classList.remove('active');
            };
            buffersMenu.appendChild(item);
        });

        buffersContainer.appendChild(buffersBtn);
        buffersContainer.appendChild(buffersMenu);

        extraButtonsWrapper.appendChild(farmsContainer);
        extraButtonsWrapper.appendChild(buffersContainer);
        hotbar.appendChild(extraButtonsWrapper);

        // Hide hotbar initially unless we're already in loadout mode
        if (window.CALCULATION_MODE !== 'loadout') {
            hotbar.style.display = 'none';
        }

        document.body.appendChild(hotbar);

        // --- HIDDEN RENDER CONTAINER (For Hotbar Units not on current page) ---
        const hiddenRender = document.createElement('div');
        hiddenRender.id = 'hotbarHiddenRender';
        hiddenRender.style.display = 'none';
        document.body.appendChild(hiddenRender);

        // Close menus on click outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.hotbar-extra-menu').forEach(m => m.classList.remove('active'));
        });
    }

    // Add global click listener for unit cards using event delegation
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.unit-card');
        if (card) {
            // Check if we clicked a button or interactive element inside the card
            const interactive = e.target.closest('button, input, select, label, .e-pill');
            if (interactive) return;

            const unitId = card.id.replace('card-', '');
            const unit = unitDatabase.find(u => u.id === unitId);
            if (unit) {
                addUnitToHotbar(unit);
            }
        }
    });

    // Initial UI update
    updateHotbarUI();
}

function addUnitToHotbar(unit, forceAdd = false) {
    if (typeof ENABLE_HOTBAR !== 'undefined' && !ENABLE_HOTBAR) return;

    if (window.CALCULATION_MODE === 'potential' && !forceAdd) {
        if (typeof showToast === 'function') {
            showToast("Switch to Loadout Mode to build a team and test position-based passives.");
        }
        return;
    }

    // Auto-add fusion components for armors
    const majesticId = window.getUnitId('majestic_armor');
    const unparalleledId = window.getUnitId('unparalleled_armor');

    if (unit.id === majesticId || unit.id === unparalleledId) {
        const components = unit.id === majesticId
            ? ['sasuke_great_war', 'nutaru_beast']
            : ['ancient_shinob', 'nutaru_beast'];

        let addedCount = 0;
        components.forEach(fName => {
            const compId = window.getUnitId(fName);
            const alreadyInHotbar = hotbarState.slots.some(s => s && s.id === compId);
            if (!alreadyInHotbar) {
                const compUnit = typeof unitDatabase !== 'undefined' ? unitDatabase.find(u => u.id === compId) : null;
                if (compUnit) {
                    _executeAddUnit(compUnit, true);
                    addedCount++;
                }
            }
        });

        if (addedCount > 0) {
            recalculateHotbarTeam();
            updateHotbarUI();
        }
        return;
    }

    _executeAddUnit(unit, forceAdd);
}

function _executeAddUnit(unit, onlyAdd = false) {
    // Check if unit is already in hotbar
    const existingIndex = hotbarState.slots.findIndex(s => s && s.id === unit.id);

    if (existingIndex !== -1) {
        if (onlyAdd) return; // Don't remove if we are just ensuring it's there
        // Toggle: If it exists, remove it
        clearHotbarSlot(existingIndex);
        return;
    }

    // Find first empty slot
    const emptyIndex = hotbarState.slots.findIndex(s => s === null);

    if (emptyIndex !== -1) {
        hotbarState.slots[emptyIndex] = unit;

        const isAssistant = unit.tags && unit.tags.includes('Assistant');

        // PERFORMANCE: Run heavy calculations in background to prevent UI lag
        setTimeout(() => {
            if (!isAssistant && !document.getElementById('card-' + unit.id)) {
                const hiddenContainer = document.getElementById('hotbarHiddenRender');
                if (hiddenContainer && typeof renderUnitCard === 'function') {
                    const card = renderUnitCard(unit, 0);
                    hiddenContainer.appendChild(card);

                    if (typeof updateBuildListDisplay === 'function') {
                        updateBuildListDisplay(unit.id);
                    }
                }
            }
            checkHotbarSynergies();
            recalculateHotbarTeam();
            updateHotbarUI();
        }, 0);
    }
}

function checkHotbarSynergies() {
    if (window.CALCULATION_MODE !== 'loadout') return;

    const slots = hotbarState.slots.filter(u => u !== null);
    const unitIds = slots.map(u => u.id);

    // Ant King / Jinoo Auto-Toggle
    const hasJinoo = unitIds.some(id => window.isUnit(id, 'jinoo_shadow_monarch') || window.isUnit(id, 'sjw'));
    const antKing = slots.find(s => window.isUnit(s.id, 'ant_king_savage'));

    if (antKing) {
        const isCurrentlyActive = activeAbilityIds.has(antKing.id);
        if (hasJinoo) {
            if (!isCurrentlyActive) {
                activeAbilityIds.add(antKing.id);
                const card = document.getElementById('card-' + antKing.id);
                if (card) {
                    card.classList.add('use-ability');
                    const cb = card.querySelector('.ability-cb');
                    if (cb) {
                        cb.checked = true;
                        cb.parentNode.classList.add('is-checked');
                    }
                    const label = card.querySelector('.ut-ability-text');
                    const override = (typeof TOGGLE_OVERRIDES !== 'undefined') ? TOGGLE_OVERRIDES[window.getFileName(antKing.id)] : null;
                    if (label && override && override.dynamicLabel) label.innerText = override.dynamicLabel(true);
                }
                if (typeof window.resetCachesForBuffChange === 'function') window.resetCachesForBuffChange(antKing.id);
                if (typeof updateBuildListDisplay === 'function') updateBuildListDisplay(antKing.id, true);
            }
        } else {
            // Deactivate if Jinoo is gone
            if (isCurrentlyActive) {
                activeAbilityIds.delete(antKing.id);
                const card = document.getElementById('card-' + antKing.id);
                if (card) {
                    card.classList.remove('use-ability');
                    const cb = card.querySelector('.ability-cb');
                    if (cb) {
                        cb.checked = false;
                        cb.parentNode.classList.remove('is-checked');
                    }
                    const label = card.querySelector('.ut-ability-text');
                    const override = (typeof TOGGLE_OVERRIDES !== 'undefined') ? TOGGLE_OVERRIDES[window.getFileName(antKing.id)] : null;
                    if (label && override && override.dynamicLabel) label.innerText = override.dynamicLabel(false);
                }
                if (typeof window.resetCachesForBuffChange === 'function') window.resetCachesForBuffChange(antKing.id);
                if (typeof updateBuildListDisplay === 'function') updateBuildListDisplay(antKing.id, true);
            }
        }
    }
}

function clearHotbarSlot(index) {
    const unit = hotbarState.slots[index];
    if (unit) {
        hotbarState.slots[index] = null;

        // If removed unit is Fern, clear her targets
        if (window.isUnit(unit.id, 'prodigy_mage') || window.isUnit(unit.id, 'ancient_mage')) {
            hotbarState.fernTargets = [];
        }

        // Remove from hidden container if it's there
        const hiddenCard = document.querySelector('#hotbarHiddenRender #card-' + unit.id);
        if (hiddenCard) hiddenCard.remove();

        // FORCED RE-RENDER: Ensure the database card resets to global state (removes hotbar buffs)
        if (typeof window.resetCachesForBuffChange === 'function') {
            window.resetCachesForBuffChange(unit.id);
        }
        if (typeof updateBuildListDisplay === 'function') {
            // Re-render removed unit without hotbar context
            updateBuildListDisplay(unit.id);
        }

        recalculateHotbarTeam();
        checkHotbarSynergies();
        updateHotbarUI();
    }
}

function showFusionImages(armorIds) {
    if (!armorIds || armorIds.length === 0) return;

    const bestBuilds = {
        [window.getUnitId('unparalleled_armor')]: { dmg: '251.2k', spa: '5.39s', range: '75.2', crit: '77.5%', cdmg: '189%', dot: '0' },
        [window.getUnitId('majestic_armor')]: { dmg: '132.4k', spa: '7.12s', range: '52.5', crit: '95%', cdmg: '284%', dot: '0' },
        [window.getUnitId('sjw')]: { dmg: '312.5k', spa: '3.82s', range: '82.4', crit: '85%', cdmg: '215%', dot: '0' }
    };

    let contentHtml = '';
    armorIds.forEach(id => {
        const unit = unitDatabase.find(u => u.id === id);
        if (unit) {
            const build = bestBuilds[id] || { dmg: '0', spa: '0', range: '0', crit: '0%', cdmg: '0%', dot: '0' };
            const fusionImg = unit.img.replace('.png', 'Syncro.png');
            const isFused = hotbarState.activeFusionIds.includes(id);
            const fuseBtnText = isFused ? 'UNFUSE' : 'FUSE';
            const fuseBtnClass = isFused ? 'fusion-btn-unfuse' : 'fusion-btn-fuse';

            contentHtml += `
                <div class="fusion-card-overlay" onclick="event.stopPropagation();">
                    <img src="${fusionImg}" class="fusion-bg-img-clean" onerror="this.src='${unit.img}'">
                    
                    <div class="br-full-stats fusion-stats-box-full-build">
                        <div class="fs-comparison-grid" style="grid-template-columns: 1fr;">
                            <div class="fs-item-lg dmg-row" style="justify-content: center;">
                                <span class="fs-icon-box dmg-bg"><svg viewBox="0 0 290.226 290.226" fill="currentColor"><path d="M63.951,243.575c-1.945-3.578-4.401-6.907-7.363-9.869c-3.106-3.102-6.626-5.633-10.4-7.63 c-4.51-2.387-0.945-7.5-0.945-7.5c4.616-7.023,8.825-14.079,12.305-20.226l-23.363-23.344H11.504c-4.362,0-7.898-3.539-7.898-7.902 c0-4.361,3.536-7.9,7.898-7.9h25.947c2.1,0,4.107,0.832,5.588,2.312l85.379,85.291c1.483,1.483,2.315,3.495,2.315,5.589v26.073 c0,4.365-3.537,7.897-7.9,7.897c-4.367,0-7.904-3.531-7.904-7.897v-22.798l-23.27-23.24c-6.281,3.707-13.582,8.252-20.816,13.25 C70.842,245.679,66.698,248.629,63.951,243.575z"/><path d="M26.61,237.102c-7.106,0-13.784,2.764-18.812,7.784c-5.019,5.015-7.782,11.686-7.782,18.778 c0,7.097,2.764,13.762,7.782,18.776c5.027,5.016,11.706,7.783,18.812,7.785c7.102,0,13.781-2.77,18.804-7.785 c5.023-5.015,7.79-11.682,7.79-18.776c0-7.093-2.768-13.764-7.79-18.778C40.392,239.866,33.712,237.102,26.61,237.102z"/><path d="M100.985,182.318c-3.502,3.499-9.232,3.499-12.734,0.001l-8.81-8.801c-3.502-3.498-3.502-9.223,0-12.721L229.832,10.564 c3.502-3.498,10.401-6.727,15.33-7.175l36.862-3.352c4.93-0.448,8.596,3.218,8.148,8.148l-3.346,36.791 c-0.448,4.93-3.68,11.825-7.182,15.324l-150.4,150.251c-3.502,3.498-9.232,3.498-12.734,0l-8.822-8.813 c-3.502-3.498-3.502-9.223,0-12.722L233.608,63.213c1.854-1.848,1.856-4.852,0.003-6.702c-1.848-1.848,1.856-4.852,0.003-6.702c-1.848-1.853-4.853-1.853-6.709-0.002 L100.985,182.318z"/></svg></span>
                                <span class="fs-val val-dmg" style="width: 60px; text-align: left;">${build.dmg}</span>
                            </div>

                            <div class="fs-item-lg spa-row" style="justify-content: center;">
                                <span class="fs-icon-box spa-bg"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zM12 11.5l-4-4V4h8v3.5l-4 4z"/></svg></span>
                                <span class="fs-val val-spa" style="width: 60px; text-align: left;">${build.spa}</span>
                            </div>

                            <div class="fs-item-lg range-row" style="justify-content: center;">
                                <span class="fs-icon-box range-bg"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></span>
                                <span class="fs-val val-range" style="width: 60px; text-align: left;">${build.range}</span>
                            </div>
                        </div>
                        <div class="fs-sub-row">
                            <div class="fs-item-sm"><span class="fs-label">Crit %</span><span class="fs-val val-crit">${build.crit}</span></div>
                            <div class="fs-item-sm"><span class="fs-label">CDmg</span><span class="fs-val val-cdmg">${build.cdmg}</span></div>
                            <div class="fs-item-sm"><span class="fs-label">DoT Dmg</span><span class="fs-val val-dot">${build.dot}</span></div>
                        </div>
                    </div>

                    <button class="fusion-toggle-btn ${fuseBtnClass}" onclick="event.stopPropagation(); toggleFusion('${id}'); showFusionImages([${armorIds.map(aid => `'${aid}'`).join(',')}]);">
                        ${fuseBtnText}
                    </button>
                </div>
            `;
        }
    });

    if (typeof showUniversalModal === 'function') {
        showUniversalModal({
            title: '',
            content: `<div class="fusion-overlay-container" onclick="closeModal('universalModal')">${contentHtml}</div>`,
            size: 'modal-full',
            headerClass: 'hidden-header',
            footerClass: 'hidden-header',
            boxClass: 'modal-transparent'
        });

        // Ensure clicking the background overlay also closes it
        const overlay = document.getElementById('universalModal');
        if (overlay) {
            overlay.onclick = (e) => {
                if (e.target === overlay) closeModal('universalModal');
            };
        }
    }
}

function updateHotbarUI() {
    const hotbar = document.getElementById('unitHotbar');
    if (!hotbar) return;

    // 1. Detect Fusions dynamically
    const availableFusions = getAvailableFusions();

    // Clean up activeFusionIds if components are missing
    const availableIds = availableFusions.map(f => f.id);
    hotbarState.activeFusionIds = hotbarState.activeFusionIds.filter(id => availableIds.includes(id));

    // Update legacy fusionMode flag
    hotbarState.fusionMode = hotbarState.activeFusionIds.length > 0;
    const activeFusions = availableFusions.filter(f => hotbarState.activeFusionIds.includes(f.id));

    // Detect component flags for logic further down
    const unitIdsInHotbar = hotbarState.slots.filter(u => u !== null).map(u => u.id);
    const hasNutaru = unitIdsInHotbar.includes(window.getUnitId('nutaru_beast'));
    const hasShinobi = unitIdsInHotbar.includes(window.getUnitId('ancient_shinob'));
    const hasSasuke = unitIdsInHotbar.includes(window.getUnitId('sasuke_great_war'));

    // 1.2 Detect Buffers in Hotbar Dynamically
    const activeBuffsInHotbar = new Set();
    const BUFF_PROVIDERS = {
        'miku': ['miku'],
        'enlightenedgod': ['enlightenedGod'],
        'ancient_mage': ['ancientMage'],
        'king_sailor': ['kingSailor'],
        'prodigy_mage': ['mageHill', 'mageGround'],
        'unparalleled_armor': ['bijuu'],
        'bulma': ['bulma']
    };

    const idsToCheck = [...unitIdsInHotbar];
    if (hotbarState.fusionMode) {
        activeFusions.forEach(f => idsToCheck.push(f.id));
    }

    idsToCheck.forEach(id => {
        if (BUFF_PROVIDERS[id]) {
            BUFF_PROVIDERS[id].forEach(configKey => activeBuffsInHotbar.add(configKey));
        }
    });

    // Determine which configs are available
    const availableConfigs = [];
    if (window.GLOBAL_BUFF_DATA) {
        Object.keys(window.GLOBAL_BUFF_DATA).forEach(configKey => {
            const config = window.GLOBAL_BUFF_DATA[configKey];
            const isProvided = activeBuffsInHotbar.has(configKey);

            if (isProvided && !config.hideButton) {
                availableConfigs.push({ configKey, config });
            } else {
                // AUTO-DISABLE: If no provider is in hotbar, ensure the buff is OFF
                if (hotbarState.buffState[configKey]) {
                    hotbarState.buffState[configKey] = false;
                    if (window.HOTBAR_BUFF_STATE) window.HOTBAR_BUFF_STATE[configKey] = false;

                    // If we auto-disabled a buff, we need to force the database to refresh 
                    // so any cards reflecting hotbar stats are updated.
                    if (typeof window.renderDatabase === 'function') {
                        setTimeout(() => window.renderDatabase(), 0);
                    }
                }
            }
        });
    }

    // Render Toggles
    const togglesRow = document.getElementById('hotbarToggles');
    if (togglesRow) {
        const currentConfigsKey = availableConfigs.map(c => c.configKey).join(',');

        if (togglesRow.dataset.configsKey !== currentConfigsKey) {
            let togglesHtml = '';
            availableConfigs.forEach(({ configKey, config }) => {
                togglesHtml += `
                    <div class="hotbar-toggle-item">
                        <label class="nav-toggle-label miku-btn-label hotbar-buff-toggle" 
                               style="--accent: ${config.color || '#4ade80'}" 
                               title="${config.desc || ''}">
                            <div class="toggle-wrapper" style="gap: 6px;">
                                <input type="checkbox" data-hotbar-buff="${configKey}" 
                                       onchange="window.handleHotbarBuffToggle('${configKey}', this)">
                                <div class="mini-switch"></div>
                                <span style="white-space: nowrap;">${config.name.toUpperCase()}</span>
                            </div>
                        </label>
                    </div>`;
            });
            togglesRow.innerHTML = togglesHtml;
            togglesRow.dataset.configsKey = currentConfigsKey;
        }

        // Restore checked state from HOTBAR_BUFF_STATE — fully isolated from global panel
        availableConfigs.forEach(({ configKey, config }) => {
            const isActive = hotbarState.buffState[configKey] === true;
            const cb = togglesRow.querySelector(`input[data-hotbar-buff="${configKey}"]`);
            if (cb) {
                cb.checked = isActive;
                if (typeof updateBuffVisuals === 'function') {
                    updateBuffVisuals(cb.closest('.nav-toggle-label'), isActive, config.color);
                }
            }
        });
    }



    // 1.5 Calculate Team Totals
    // Build a set of component unit IDs to skip in fusion mode
    const fusionSkipIds = new Set();

    if (hotbarState.fusionMode) {
        activeFusions.forEach(f => f.components.forEach(c => fusionSkipIds.add(c)));
    }

    const getUnitStats = (unitId) => {
        const detail = getDetailedUnitStats(unitId);
        if (!detail) return { dmg: 0, dps: 0, teamDmg: 0, teamDps: 0, placements: 1 };
        return {
            dmg: detail.dmg,
            dps: detail.dps,
            teamDmg: detail.teamDmg,
            teamDps: detail.teamDps,
            placements: detail.placementsCounted || detail.placements || 1
        };
    };

    let teamDmg = 0;
    let teamDps = 0;

    // Add stats for non-fused units
    hotbarState.slots.forEach(u => {
        if (!u) return;

        // Robust skip check for components when fused
        const isComponent = hotbarState.fusionMode && activeFusions.some(f =>
            f.components.includes(u.id) || f.components.some(c => window.isUnit(u.id, c))
        );

        if (isComponent) return;

        const stats = getUnitStats(u.id);
        teamDmg += stats.teamDmg;
        teamDps += stats.teamDps;
    });

    // Add fusion unit stats when fusion mode is active
    if (hotbarState.fusionMode) {
        activeFusions.forEach(f => {
            const stats = getUnitStats(f.id);
            teamDmg += stats.teamDmg;
            teamDps += stats.teamDps;
        });
    }


    const teamDmgEl = document.getElementById('totalTeamDmg');
    const teamDpsEl = document.getElementById('totalTeamDps');
    if (teamDmgEl) teamDmgEl.innerText = (typeof format === 'function') ? format(teamDmg) : teamDmg;
    if (teamDpsEl) teamDpsEl.innerText = (typeof format === 'function') ? format(teamDps) : teamDps;

    // Visual indicator on stats box
    const statsBox = hotbar.querySelector('.hotbar-stats-box');
    if (statsBox) statsBox.classList.toggle('fusion-active', hotbarState.fusionMode && activeFusions.length > 0);



    // Fusion Map: Unit ID -> Array of Armor IDs
    const fusionMap = new Map();
    const nutaruId = window.getUnitId('nutaru_beast');
    const shinobiId = window.getUnitId('ancient_shinob');
    const sasukeId = window.getUnitId('sasuke_great_war');
    const unparalleledId = window.getUnitId('unparalleled_armor');
    const majesticId = window.getUnitId('majestic_armor');

    if (hasNutaru && hasShinobi) {
        if (!fusionMap.has(nutaruId)) fusionMap.set(nutaruId, []);
        fusionMap.get(nutaruId).push(unparalleledId);
        fusionMap.set(shinobiId, [unparalleledId]);
    }
    if (hasNutaru && hasSasuke) {
        if (!fusionMap.has(nutaruId)) fusionMap.set(nutaruId, []);
        fusionMap.get(nutaruId).push(majesticId);
        fusionMap.set(sasukeId, [majesticId]);
    }

    const slots = hotbar.querySelectorAll('.hotbar-slot');
    slots.forEach((slot, i) => {
        const unit = hotbarState.slots[i];

        if (unit) {
            slot.classList.add('filled');

            // Image
            let img = slot.querySelector('img');
            if (!img) {
                img = document.createElement('img');
                img.onerror = () => { img.src = 'images/units/placeholder.png'; };
                slot.appendChild(img);
            }
            if (img.src !== unit.img) img.src = unit.img;
            if (img.alt !== unit.name) img.alt = unit.name;

            // Remove Button
            let removeBtn = slot.querySelector('.remove-btn');
            if (!removeBtn) {
                removeBtn = document.createElement('div');
                removeBtn.className = 'remove-btn';
                removeBtn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
                slot.appendChild(removeBtn);
            }
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                clearHotbarSlot(i);
            };

            // DYNAMIC FUSION BADGE
            const armorIds = fusionMap.get(unit.id);
            let fusionBadge = slot.querySelector('.fusion-badge:not(.modes-badge)');
            if (armorIds && armorIds.length > 0) {
                if (!fusionBadge) {
                    fusionBadge = document.createElement('div');
                    slot.appendChild(fusionBadge);
                }
                fusionBadge.className = 'fusion-badge interactive' + (hotbarState.fusionMode ? ' fused-active' : '');
                fusionBadge.innerText = hotbarState.fusionMode ? 'FUSED' : 'FUSION';
                fusionBadge.onclick = (e) => {
                    e.stopPropagation();
                    showFusionImages(armorIds);
                };
                slot.classList.add('fused-slot');
            } else {
                if (fusionBadge) fusionBadge.remove();
                slot.classList.remove('fused-slot');
            }

            // MODES badge
            const unitObj = typeof window.getUnitById === 'function' ? window.getUnitById(unit.id) : null;
            let modesBadge = slot.querySelector('.modes-badge');
            if (unitObj && unitObj.modes && Array.isArray(unitObj.modes)) {
                if (!modesBadge) {
                    modesBadge = document.createElement('div');
                    modesBadge.className = 'fusion-badge interactive modes-badge';
                    modesBadge.innerText = 'MODES';
                    modesBadge.style.cssText = 'background: linear-gradient(135deg, rgba(139,92,246,0.85), rgba(99,102,241,0.85)); border-color: #8b5cf6;';
                    slot.appendChild(modesBadge);
                }
                modesBadge.onclick = (e) => {
                    e.stopPropagation();
                    if (typeof openUnitModes === 'function') {
                        openUnitModes(unit.id);
                    }
                };
            } else {
                if (modesBadge) modesBadge.remove();
            }

            // Old TRAIT badge replaced by overlay button

            // LEADER & MARK BADGES
            const leader = hotbarState.slots[0];
            const isKsLeading = (window.CALCULATION_MODE === 'potential') || (leader && window.isUnit(leader.id, 'king_sailor'));
            const isKs = window.isUnit(unit.id, 'king_sailor');
            const isTt = window.isUnit(unit.id, 'triple_threat');

            if (i === 0 && (isKs || isTt)) {
                let leaderBadge = slot.querySelector('.leader-badge');
                if (!leaderBadge) {
                    leaderBadge = document.createElement('div');
                    leaderBadge.className = 'leader-badge';
                    leaderBadge.innerText = 'LEADER';
                    slot.appendChild(leaderBadge);
                }
            } else {
                const lb = slot.querySelector('.leader-badge');
                if (lb) lb.remove();
            }

            if (isKsLeading && !isKs) {
                // Removed 'MARK ACTIVE' text as per user request
            } else {
                const mb = slot.querySelector('.mark-badge');
                if (mb) mb.remove();
            }

            // FERN TARGETS BUTTON (Only for Fern herself)
            const isFern = window.isUnit(unit.id, 'prodigy_mage');
            let fernTargetBtn = slot.querySelector('.fern-target-btn');
            if (isFern) {
                if (!fernTargetBtn) {
                    fernTargetBtn = document.createElement('div');
                    fernTargetBtn.className = 'fern-target-btn';
                    fernTargetBtn.innerHTML = `<i class="fas fa-bullseye"></i> TARGETS`;
                    slot.appendChild(fernTargetBtn);
                }
                fernTargetBtn.onclick = (e) => {
                    e.stopPropagation();
                    openFernTargetMenu();
                };
            } else {
                if (fernTargetBtn) fernTargetBtn.remove();
            }

            // Highlight targeted units
            if (hotbarState.fernTargets.includes(i)) {
                slot.style.borderColor = '#8b5cf6';
                slot.style.boxShadow = '0 0 10px rgba(139, 92, 246, 0.3)';
            } else {
                slot.style.borderColor = '';
                slot.style.boxShadow = '';
            }
            const oldBadge = slot.querySelector('.fern-target-badge');
            if (oldBadge) oldBadge.remove();
            // Mini Stats Overlay & Trait Button
            let statsOverlay = slot.querySelector('.slot-stats-overlay');
            if (!statsOverlay) {
                statsOverlay = document.createElement('div');
                statsOverlay.className = 'slot-stats-overlay';
                slot.appendChild(statsOverlay);
            }

            const activeTraitName = (window.unitTraits && window.unitTraits[unit.id]) || 'DEFAULT';
            const isBuffer = unit.id === 'miku';
            const traitBtnHtml = `<div class="stats-trait-btn interactive" title="Active Trait: ${activeTraitName}. Click to change!" onclick="event.stopPropagation(); if (typeof openTraitBestList === 'function') openTraitBestList('${unit.id}');">TRAIT</div>`;

            if (isBuffer) {
                statsOverlay.innerHTML = traitBtnHtml;
            } else {
                const stats = getUnitStats(unit.id);
                const placements = stats.placements || 1;
                const dmgStr = (typeof format === 'function') ? format(stats.dmg) : stats.dmg;
                const dpsStr = (typeof format === 'function') ? format(stats.dps) : stats.dps;

                statsOverlay.innerHTML = `
                    <div class="stat-mini dmg"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"></path><path d="M13 19l6-6"></path><path d="M16 16l4 4"></path><path d="M19 13l2 2"></path></svg><span class="dmg-val">${dmgStr}</span></div>
                    <div class="stat-mini dps"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg><span class="dps-val">${dpsStr}</span></div>
                    ${traitBtnHtml}
                `;
            }
        } else {
            slot.classList.remove('filled');
            slot.classList.remove('fused-slot');

            // Cleanup all possible extra UI elements for empty slots
            [
                '.leader-badge', '.mark-badge', '.fern-target-btn',
                '.modes-badge', '.fusion-badge', '.slot-stats-overlay',
                '.remove-btn', 'img', '.fern-target-badge'
            ].forEach(selector => {
                const el = slot.querySelector(selector);
                if (el) el.remove();
            });

            // Reset styling
            slot.style.borderColor = '';
            slot.style.boxShadow = '';
        }
    });
}

// Export for use in other modules if needed
window.addUnitToHotbar = addUnitToHotbar;
window.clearHotbarSlot = clearHotbarSlot;
window.initHotbar = initHotbar;
window.updateHotbarUI = updateHotbarUI;
window.openTeamSummary = openTeamSummary;
window.handleHotbarBuffToggle = handleHotbarBuffToggle;
window.getHotbarState = () => hotbarState;
window.getActiveFusions = getActiveFusions;
window.getAvailableFusions = getAvailableFusions;

function toggleFernTarget(index) {
    const idx = hotbarState.fernTargets.indexOf(index);
    if (idx === -1) {
        // Max 3 targets total
        if (hotbarState.fernTargets.length >= 3) {
            hotbarState.fernTargets.shift();
        }
        hotbarState.fernTargets.push(index);
    } else {
        hotbarState.fernTargets.splice(idx, 1);
    }

    recalculateHotbarTeam();
    updateHotbarUI();
}

function openFernTargetMenu() {
    const slots = hotbarState.slots;
    const fernIndex = slots.findIndex(s => s && (window.isUnit(s.id, 'prodigy_mage') || window.isUnit(s.id, 'ancient_mage')));

    if (fernIndex === -1) {
        alert("Prodigy Mage must be in your hotbar to select targets!");
        return;
    }

    let html = `
        <div class="fern-menu-container" style="display: flex; flex-direction: column; gap: 15px; padding: 10px;">
            <div style="font-size: 0.85rem; color: #94a3b8; line-height: 1.4;">
                Select up to <b style="color: #8b5cf6;">3</b> team members to receive tactical support from Fern.
            </div>
            <div class="fern-slots-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
    `;

    slots.forEach((s, i) => {
        if (!s || i === fernIndex) return;
        const isTargeted = hotbarState.fernTargets.includes(i);
        html += `
            <div class="fern-menu-item" 
                 onclick="toggleFernTarget(${i}); openFernTargetMenu();"
                 style="background: #1e293b; border: 2px solid ${isTargeted ? '#8b5cf6' : 'rgba(255,255,255,0.05)'}; border-radius: 12px; padding: 10px; cursor: pointer; transition: 0.2s; display: flex; flex-direction: column; align-items: center; gap: 8px; ${isTargeted ? 'box-shadow: 0 0 15px rgba(139, 92, 246, 0.2);' : ''}">
                <img src="${s.img}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
                <div style="font-size: 0.65rem; font-weight: 800; color: ${isTargeted ? 'white' : '#64748b'}; text-align: center; text-transform: uppercase;">${s.name}</div>
            </div>
        `;
    });

    html += `</div></div>`;

    if (typeof showUniversalModal === 'function') {
        showUniversalModal({
            title: '<i class="fas fa-magic" style="color: #8b5cf6;"></i> PARTY TACTICIAN',
            content: html,
            size: 'modal-md'
        });
    }
}
