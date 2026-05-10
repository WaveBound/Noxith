// ============================================================================
// HOTBAR.JS - Unit Selection Hotbar Logic
// ============================================================================

const hotbarState = {
    slots: Array(6).fill(null),
    fusionMode: false,
    buffState: {} // { configKey: bool } — completely separate from GLOBAL_BUFF_STATE
};
window.hotbarState = hotbarState;



const getActiveFusions = () => {
    const unitIdsInHotbar = hotbarState.slots.filter(u => u !== null).map(u => u.id);
    const hasNutaru = unitIdsInHotbar.includes(window.getUnitId('nutaru_beast'));
    const hasShinobi = unitIdsInHotbar.includes(window.getUnitId('ancient_shinob'));
    const hasSasuke = unitIdsInHotbar.includes(window.getUnitId('sasuke_great_war'));

    const fusions = [];
    if (hasNutaru && hasShinobi) fusions.push({ id: window.getUnitId('unparalleled_armor'), name: 'Unparalleled Armor', img: 'images/units/UnparalleledArmor.png', components: [window.getUnitId('nutaru_beast'), window.getUnitId('ancient_shinob')] });
    if (hasNutaru && hasSasuke) fusions.push({ id: window.getUnitId('majestic_armor'), name: 'Majestic Armor', img: 'images/units/MajesticArmor.png', components: [window.getUnitId('nutaru_beast'), window.getUnitId('sasuke_great_war')] });
    return fusions;
};

const getDetailedUnitStats = (unitId) => {
    const fullUnit = typeof window.getUnitById === 'function' ? window.getUnitById(unitId) : null;
    if (!fullUnit) return null;

    // Read the #1 build that is already rendered and hydrated on the unit card.
    let bestBuild = window.hotbarFilteredBuilds && window.hotbarFilteredBuilds[unitId]
        ? window.hotbarFilteredBuilds[unitId]
        : null;

    // Check if the DOM card exists for this unit
    const hasCard = !!document.getElementById('card-' + unitId);
    
    if (hasCard) {
        // Card exists — clear cache and recalculate through the full rendering pipeline
        if (typeof window.resetCachesForBuffChange === 'function') {
            window.resetCachesForBuffChange(unitId);
        }
        if (typeof updateBuildListDisplay === 'function') {
            updateBuildListDisplay(unitId, true);
            bestBuild = window.hotbarFilteredBuilds && window.hotbarFilteredBuilds[unitId]
                ? window.hotbarFilteredBuilds[unitId]
                : bestBuild;
        }
    } else if (bestBuild && typeof reconstructMathData === 'function') {
        // Card doesn't exist (unit from another page) — recalculate directly
        // using the cached build data but with FRESH team context
        try {
            const refreshed = reconstructMathData(bestBuild);
            if (refreshed) {
                // Merge refreshed calculation values into the cached build
                bestBuild = Object.assign({}, bestBuild, {
                    dmgVal: refreshed.dmgVal,
                    dps: refreshed.total || refreshed.dps || 0,
                    sortDps: refreshed.total || refreshed.sortDps || 0,
                    spa: refreshed.spa,
                    range: refreshed.range,
                    placement: refreshed.placement,
                    detailedBuffs: refreshed.detailedBuffs
                });
                // Update the cache so subsequent reads get fresh values
                if (!window.hotbarFilteredBuilds) window.hotbarFilteredBuilds = {};
                window.hotbarFilteredBuilds[unitId] = bestBuild;
            }
        } catch (e) {
            console.warn('[TeamSummary] Direct recalc failed for', unitId, e);
        }
    }

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
        'monarch': 'Monarch Cape', 'none': 'None'
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
                renderLabel: "Leader Passive: +10% Crit, +20% CDmg + Tag Bonuses" 
            });
        }
    }

    let html = `
        <div class="team-summary-container">
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

    // PRE-PASS: Ensure all hotbar units have hidden cards and fresh calculations
    // This is critical for team-composition-dependent passives (e.g. King Sailor's Manipulator of Fate)
    const hiddenContainer = document.getElementById('hotbarHiddenRender');
    hotbarState.slots.forEach(u => {
        if (!u) return;
        const isAssistant = u.tags && u.tags.includes('Assistant');
        if (isAssistant) return;
        
        // Ensure hidden card exists
        if (!document.getElementById('card-' + u.id) && hiddenContainer && typeof renderUnitCard === 'function') {
            const card = renderUnitCard(u, 0);
            hiddenContainer.appendChild(card);
        }
        
        // Clear cache and force recalculation with current team context
        if (typeof window.resetCachesForBuffChange === 'function') {
            window.resetCachesForBuffChange(u.id);
        }
        if (typeof updateBuildListDisplay === 'function') {
            updateBuildListDisplay(u.id, true);
        }
    });

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
        // Push to team-wide effects tracker
        effects.forEach(e => teamEffects.push({ ...e, unitName: unit.name }));

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

        html += `
            <div class="ts-unit-card">
                <div class="ts-unit-header">
                    <div class="ts-header-left">
                        <div class="ts-img-container">
                            <img src="${unit.img}" class="ts-unit-img">
                        </div>
                        <div class="ts-unit-info">
                            <span class="ts-unit-name">${unit.name}</span>
                            <div class="ts-unit-trait">${traitName}</div>
                        </div>
                    </div>
                    <div class="ts-header-right">
                        <div class="ts-dps-box">
                            <div class="ts-dps-val">${format(detail.dps)}</div>
                            <div class="ts-dps-label">UNIT DPS</div>
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
                        if (unit.passives && unit.passives.length > 0) {
                            passiveHtml = unit.passives.map(p => {
                                // Special logic for King Sailor's conditional passive
                                if (p.name === "Unrivaled Mark") {
                                    if (!isKsActive || !isKsLeading) return null;
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
                                const descText = p.desc ? (p.desc.length > 120 ? p.desc.substring(0, 120).trim() + '…' : p.desc) : '';

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
                        <div class="ts-bonus-pill">
                            <span class="ks-text">${ksBonus}</span>
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

    // Build team effects summary
    const teamEffectsHtml = teamEffects.length > 0 ? `
        <div class="ts-section ts-team-effects-section">
            <h3 class="ts-title">TEAM EFFECTS</h3>
            <div class="ts-team-effects-grid">
                ${teamEffects.map(e => `
                    <div class="ts-team-effect-row" style="--effect-color: ${e.color};">
                        <span class="ts-effect-dot" style="background: ${e.color};"></span>
                        <span class="ts-te-label">${e.label}</span>
                        <span class="ts-te-val">${e.val}</span>
                        <span class="ts-te-source">${e.unitName}</span>
                    </div>
                `).join('')}
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
        showUniversalModal({ title: '⚔️ TEAM SUMMARY', content: html, size: 'modal-lg' });
    } else {
        alert("Modal system not found. Check console for data.");
        console.log("Team Summary HTML:", html);
    }
}

function handleHotbarBuffToggle(configKey, checkbox) {
    const config = window.GLOBAL_BUFF_DATA?.[configKey];
    if (!config) return;

    const isChecked = checkbox.checked;

    // Store in HOTBAR_BUFF_STATE only — never touches GLOBAL_BUFF_STATE
    hotbarState.buffState[configKey] = isChecked;
    if (window.HOTBAR_BUFF_STATE) window.HOTBAR_BUFF_STATE[configKey] = isChecked;

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
        // Apply hotbar buff context so reconstructMathData reads the right flags
        if (typeof window.applyBuffContext === 'function') {
            window.applyBuffContext(hotbarState.buffState);
        }

        // Temporarily swap STATIC_BUILD_DB to the hotbar DB so processUnitCache
        // and updateBuildListDisplay pull builds from the correct pre-computed table
        const savedDb = window.STATIC_BUILD_DB;
        window.STATIC_BUILD_DB = window.HOTBAR_STATIC_BUILD_DB || savedDb;

        hotbarUnitIds.forEach(id => {
            window.resetCachesForBuffChange(id);
            if (typeof updateBuildListDisplay === 'function') updateBuildListDisplay(id);
        });

        // Restore global DB + global buff context
        window.STATIC_BUILD_DB = savedDb;
        if (typeof window.applyBuffContext === 'function') {
            window.applyBuffContext(window.GLOBAL_BUFF_STATE || {});
        }

        // Pull fresh hotbarFilteredBuilds values into totals
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
                    
                    // Force a re-calculation for all units involved to update leader passives
                    hotbarState.slots.forEach(u => {
                        if (u && typeof window.resetCachesForBuffChange === 'function') {
                            window.resetCachesForBuffChange(u.id);
                        }
                    });

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
            { id: 'bulma', name: 'Bulma', img: 'images/units/Bulma.png', tags: ['Assistant'] },
            { id: 'speedwagon', name: 'Speedcart', img: 'images/units/Speedwagon.png', tags: ['Hero', 'Assistant'] }
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

    const slots = hotbarState.slots;
    const unitIds = slots.filter(u => u !== null).map(u => u.id);

    // Special Case: Unparalleled Armor
    if (window.isUnit(unit.id, 'unparalleled_armor')) {
        const hasShinobi = unitIds.includes(window.getUnitId('ancient_shinob'));
        const hasNutaru = unitIds.includes(window.getUnitId('nutaru_beast'));
        const isComplete = hasShinobi && hasNutaru;

        if (isComplete && !forceAdd) {
            const hasSasuke = unitIds.includes(window.getUnitId('sasuke_great_war'));

            const idxShinobi = slots.findIndex(s => s && window.isUnit(s.id, 'ancient_shinob'));
            if (idxShinobi !== -1) clearHotbarSlot(idxShinobi);

            if (!hasSasuke) {
                const idxNutaru = slots.findIndex(s => s && window.isUnit(s.id, 'nutaru_beast'));
                if (idxNutaru !== -1) clearHotbarSlot(idxNutaru);
            }
        } else {
            if (!hasShinobi) {
                const u = unitDatabase.find(x => window.isUnit(x.id, 'ancient_shinob'));
                if (u) _executeAddUnit(u, true);
            }
            if (!hasNutaru) {
                const u = unitDatabase.find(x => window.isUnit(x.id, 'nutaru_beast'));
                if (u) _executeAddUnit(u, true);
            }
        }
        return;
    }

    // Special Case: Majestic Armor
    if (window.isUnit(unit.id, 'majestic_armor')) {
        const hasSasuke = unitIds.includes(window.getUnitId('sasuke_great_war'));
        const hasNutaru = unitIds.includes(window.getUnitId('nutaru_beast'));
        const isComplete = hasSasuke && hasNutaru;

        if (isComplete && !forceAdd) {
            const hasShinobi = unitIds.includes(window.getUnitId('ancient_shinob'));

            const idxSasuke = slots.findIndex(s => s && window.isUnit(s.id, 'sasuke_great_war'));
            if (idxSasuke !== -1) clearHotbarSlot(idxSasuke);

            if (!hasShinobi) {
                const idxNutaru = slots.findIndex(s => s && window.isUnit(s.id, 'nutaru_beast'));
                if (idxNutaru !== -1) clearHotbarSlot(idxNutaru);
            }
        } else {
            if (!hasSasuke) {
                const u = unitDatabase.find(x => window.isUnit(x.id, 'sasuke_great_war'));
                if (u) _executeAddUnit(u, true);
            }
            if (!hasNutaru) {
                const u = unitDatabase.find(x => window.isUnit(x.id, 'nutaru_beast'));
                if (u) _executeAddUnit(u, true);
            }
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
            updateHotbarUI();
        }, 0);
    }
}

function clearHotbarSlot(index) {
    const unit = hotbarState.slots[index];
    if (unit) {
        hotbarState.slots[index] = null;

        // Remove from hidden container if it's there
        const hiddenCard = document.querySelector('#hotbarHiddenRender #card-' + unit.id);
        if (hiddenCard) hiddenCard.remove();

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
            const isFused = hotbarState.fusionMode;
            const fuseBtnText = isFused ? 'UNFUSE' : 'FUSE';
            const fuseBtnClass = isFused ? 'fusion-btn-unfuse' : 'fusion-btn-fuse';

            contentHtml += `
                <div class="fusion-card-overlay" onclick="event.stopPropagation();">
                    <img src="${fusionImg}" class="fusion-bg-img-clean" onerror="this.src='${unit.img}'">
                    
                    <div class="br-full-stats fusion-stats-box-full-build">
                        <div class="fs-comparison-grid" style="grid-template-columns: 1fr;">
                            <div class="fs-item-lg dmg-row" style="justify-content: center;">
                                <span class="fs-icon-box dmg-bg"><svg viewBox="0 0 290.226 290.226" fill="currentColor"><path d="M63.951,243.575c-1.945-3.578-4.401-6.907-7.363-9.869c-3.106-3.102-6.626-5.633-10.4-7.63 c-4.51-2.387-0.945-7.5-0.945-7.5c4.616-7.023,8.825-14.079,12.305-20.226l-23.363-23.344H11.504c-4.362,0-7.898-3.539-7.898-7.902 c0-4.361,3.536-7.9,7.898-7.9h25.947c2.1,0,4.107,0.832,5.588,2.312l85.379,85.291c1.483,1.483,2.315,3.495,2.315,5.589v26.073 c0,4.365-3.537,7.897-7.9,7.897c-4.367,0-7.904-3.531-7.904-7.897v-22.798l-23.27-23.24c-6.281,3.707-13.582,8.252-20.816,13.25 C70.842,245.679,66.698,248.629,63.951,243.575z"/><path d="M26.61,237.102c-7.106,0-13.784,2.764-18.812,7.784c-5.019,5.015-7.782,11.686-7.782,18.778 c0,7.097,2.764,13.762,7.782,18.776c5.027,5.016,11.706,7.783,18.812,7.785c7.102,0,13.781-2.77,18.804-7.785 c5.023-5.015,7.79-11.682,7.79-18.776c0-7.093-2.768-13.764-7.79-18.778C40.392,239.866,33.712,237.102,26.61,237.102z"/><path d="M100.985,182.318c-3.502,3.499-9.232,3.499-12.734,0.001l-8.81-8.801c-3.502-3.498-3.502-9.223,0-12.721L229.832,10.564 c3.502-3.498,10.401-6.727,15.33-7.175l36.862-3.352c4.93-0.448,8.596,3.218,8.148,8.148l-3.346,36.791 c-0.448,4.93-3.68,11.825-7.182,15.324l-150.4,150.251c-3.502,3.498-9.232,3.498-12.734,0l-8.822-8.813 c-3.502-3.498-3.502-9.223,0-12.722L233.608,63.213c1.854-1.848,1.856-4.852,0.003-6.702c-1.848-1.853-4.853-1.853-6.709-0.002 L100.985,182.318z"/></svg></span>
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

                    <button class="fusion-toggle-btn ${fuseBtnClass}" onclick="event.stopPropagation(); hotbarState.fusionMode = !hotbarState.fusionMode; updateHotbarUI(); if(typeof triggerGlobalBuffUpdate === 'function') triggerGlobalBuffUpdate(); closeModal('universalModal');">
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
    const activeFusions = getActiveFusions();

    // Auto-disable fusion mode if no fusions available
    if (activeFusions.length === 0) hotbarState.fusionMode = false;

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
        'bulma': ['bulma']
    };

    unitIdsInHotbar.forEach(id => {
        if (BUFF_PROVIDERS[id]) {
            BUFF_PROVIDERS[id].forEach(configKey => activeBuffsInHotbar.add(configKey));
        }
    });

    // Determine which configs are available
    const availableConfigs = [];
    if (window.GLOBAL_BUFF_DATA) {
        Object.keys(window.GLOBAL_BUFF_DATA).forEach(configKey => {
            const config = window.GLOBAL_BUFF_DATA[configKey];
            if (activeBuffsInHotbar.has(configKey)) {
                availableConfigs.push({ configKey, config });
            } else {
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

    // PRE-PASS: Ensure all hotbar units have hidden cards and fresh calculations
    // This makes sure stats like King Sailor's Manipulator of Fate update live in the hotbar 
    // even when you add matching units from a completely different page.
    const hiddenContainer = document.getElementById('hotbarHiddenRender');
    hotbarState.slots.forEach(u => {
        if (!u) return;
        const isAssistant = u.tags && u.tags.includes('Assistant');
        if (isAssistant) return;
        
        // Ensure hidden card exists for units added from other pages
        if (!document.getElementById('card-' + u.id) && hiddenContainer && typeof renderUnitCard === 'function') {
            const card = renderUnitCard(u, 0);
            hiddenContainer.appendChild(card);
        }
        
        // Force recalculation for the entire hotbar to catch team-composition changes
        if (typeof window.resetCachesForBuffChange === 'function') {
            window.resetCachesForBuffChange(u.id);
        }
        if (typeof updateBuildListDisplay === 'function') {
            updateBuildListDisplay(u.id, true);
        }
    });

    const getUnitStats = (unitId) => {
        const detail = getDetailedUnitStats(unitId);
        if (!detail) return { dmg: 0, dps: 0, teamDmg: 0, teamDps: 0 };
        return { 
            dmg: detail.dmg, 
            dps: detail.dps,
            teamDmg: detail.teamDmg,
            teamDps: detail.teamDps
        };
    };

    let teamDmg = 0;
    let teamDps = 0;

    // Add stats for non-fused units
    hotbarState.slots.forEach(u => {
        if (!u) return;
        if (fusionSkipIds.has(u.id)) return; // Skip component units in fusion mode
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

            // LEADER & MARK BADGES
            const leader = hotbarState.slots[0];
            const isKsLeading = (window.CALCULATION_MODE === 'potential') || (leader && window.isUnit(leader.id, 'king_sailor'));
            const isKs = window.isUnit(unit.id, 'king_sailor');
            
            if (i === 0 && isKs) {
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

            // Mini Stats Overlay (Hide for buffers)
            const isBuffer = unit.id === 'miku' || unit.id === 'enlightenedgod';
            let statsOverlay = slot.querySelector('.slot-stats-overlay');
            if (!isBuffer) {
                const stats = getUnitStats(unit.id);
                const placements = stats.placements || 1;
                const dmgStr = (typeof format === 'function') ? format(stats.dmg) : stats.dmg;
                const dpsStr = (typeof format === 'function') ? format(stats.dps) : stats.dps;
                const placeLabel = placements > 1 ? `<span class="place-mult">x${placements}</span>` : '';

                if (!statsOverlay) {
                    statsOverlay = document.createElement('div');
                    statsOverlay.className = 'slot-stats-overlay';
                    statsOverlay.innerHTML = `
                        <div class="stat-mini dmg"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"></path><path d="M13 19l6-6"></path><path d="M16 16l4 4"></path><path d="M19 13l2 2"></path></svg><span class="dmg-val">${dmgStr}</span>${placeLabel}</div>
                        <div class="stat-mini dps"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg><span class="dps-val">${dpsStr}</span></div>
                    `;
                    slot.appendChild(statsOverlay);
                } else {
                    const dmgValEl = statsOverlay.querySelector('.dmg-val') || statsOverlay.querySelector('.dmg span');
                    const dpsValEl = statsOverlay.querySelector('.dps-val') || statsOverlay.querySelector('.dps span');
                    const placeEl = statsOverlay.querySelector('.place-mult');
                    
                    if (dmgValEl) dmgValEl.innerText = dmgStr;
                    if (dpsValEl) dpsValEl.innerText = dpsStr;
                    if (placeEl) placeEl.innerText = placements > 1 ? `x${placements}` : '';
                }
            } else {
                if (statsOverlay) statsOverlay.remove();
            }
        } else {
            slot.classList.remove('filled');
            slot.classList.remove('fused-slot');
            
            const img = slot.querySelector('img');
            if (img) img.remove();
            
            const removeBtn = slot.querySelector('.remove-btn');
            if (removeBtn) removeBtn.remove();
            
            const fusionBadge = slot.querySelector('.fusion-badge:not(.modes-badge)');
            if (fusionBadge) fusionBadge.remove();
            
            const modesBadge = slot.querySelector('.modes-badge');
            if (modesBadge) modesBadge.remove();
            
            const statsOverlay = slot.querySelector('.slot-stats-overlay');
            if (statsOverlay) statsOverlay.remove();
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

