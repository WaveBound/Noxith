// ============================================================================
// MATH-RENDER.JS - Mathematical Breakdown Display Rendering (Safe & Robust)
// ============================================================================

const fmt = {
    pct: (n) => `${(n || 0) >= 0 ? '+' : ''}${parseFloat((n || 0).toFixed(1))}%`,
    num: (n) => (n || 0).toLocaleString(undefined, { maximumFractionDigits: 1 }),
    fix: (n, d = 2) => (n !== undefined && n !== null) ? parseFloat(n.toFixed(d)) : 0
};

function getAbhHotbarContributions(data) {
    if (window.CALCULATION_MODE !== 'loadout') return [];
    if (!window.isUnit?.(data.baseStats?.id, 'angel_born_in_hell')) return [];

    const hotbarSlots = window.hotbarState?.slots || [];
    const abhPresent = hotbarSlots.some(s => s && window.isUnit?.(s.id, 'angel_born_in_hell'));
    if (!abhPresent) return [];

    const contributions = [];
    let totalCrit = 0;

    hotbarSlots.forEach((slot, slotIdx) => {
        if (!slot) return;
        if (window.isUnit?.(slot.id, 'angel_born_in_hell')) return;

        const unit = window.getUnitById?.(slot.id);
        if (!unit) return;

        const build = window.hotbarFilteredBuilds?.[unit.id] || window.unitActiveBuilds?.[unit.id];
        const critRate = build?.critData?.rawRate ?? build?.critData?.rate ?? (typeof window.getUnitUncappedCrit === 'function' ? window.getUnitUncappedCrit(unit, slotIdx) : (unit.stats?.crit || unit.crit || 0));
        const placement = slot.placement !== undefined ? slot.placement : (unit.placement || 1);
        const critContribution = critRate * placement;
        totalCrit += critContribution;
        contributions.push({
            unitId: unit.id,
            unitName: unit.name || unit.id,
            displayName: unit.name || unit.id,
            slotIndex: slotIdx + 1,
            critRate,
            placement,
            critContribution,
            dmgContribution: 0,
            percentOfPassive: 0
        });
    });

    const eLevel = data.upgradeLevel !== undefined ? data.upgradeLevel : 6;
    const mult = eLevel >= 4 ? 1.0 : 0.5;
    contributions.forEach(c => {
        c.dmgContribution = c.critContribution * mult;
        c.percentOfPassive = totalCrit > 0 ? (c.critContribution / totalCrit) * 100 : 0;
    });

    return contributions;
}

function getAbhContributionRowsHtml(p, data, style = 'compact') {
    const contributions = Array.isArray(p?.abhAllyCritContributions) && p.abhAllyCritContributions.length > 0
        ? p.abhAllyCritContributions
        : getAbhHotbarContributions(data || {});

    if (contributions.length === 0) return '';

    return contributions.map(c => {
        const label = c.slotIndex ? `${c.displayName || c.unitName || 'Unit'} (#${c.slotIndex})` : (c.displayName || c.unitName || 'Self');
        const critText = `${fmt.fix(c.critRate, 1)}% crit × ${c.placement || 0}`;
        const dmgText = `${fmt.pct(c.dmgContribution || 0)} (${(c.percentOfPassive || 0).toFixed(1)}%)`;

        if (style === 'table') {
            return `<tr><td class="mt-cell-label mt-pl-md opacity-70" style="padding-left: 48px;">↳ ${label}</td><td class="mt-cell-formula">Source crit: ${critText}</td><td class="mt-cell-val">${dmgText}</td></tr>`;
        }

        return `<div style="display:grid; grid-template-columns: 1fr auto; gap: 8px; font-size: 0.60rem; color: #999; margin-left: 8px; padding: 1px 0;"><span>↳ ${label} <span class="text-white">${dmgText}</span></span><span>${critText}</span></div>`;
    }).join('');
}

function getActiveTagAndSourceForStat(statType, data) {
    const unitTags = data.baseStats?.tags || [];
    const rawElement = data.baseStats?.element || data.baseStats?.stats?.element || "";
    const element = String(rawElement).toLowerCase();

    // 1. CHECK DYNAMIC LEADER BUFFS (Unrivaled Mark)
    const unrivaledMarkActive = data.activeGlobalBuffs?.unrivaledMark || (window.hotbarState?.buffState?.unrivaledMark);
    const isPotential = window.CALCULATION_MODE === 'potential';
    const leader = window.hotbarState?.slots?.[0];
    const leadingId = isPotential ? data.baseStats?.id : (leader ? leader.id : null);
    const normalizeUnitId = id => String(id || '').split('-')[0];
    const hotbarUnitIds = new Set([
        ...(window.hotbarState?.slots || []).filter(Boolean).map(slot => slot.id),
        ...(typeof window.getActiveFusions === 'function' ? window.getActiveFusions().map(fusion => fusion.id) : [])
    ].filter(Boolean).map(normalizeUnitId));

    if (window.CALCULATION_MODE === 'loadout' && !hotbarUnitIds.has(normalizeUnitId(data.baseStats?.id))) {
        return { label: '↳ Leader Buff', critLabel: '• Leader Buff', found: false };
    }

    if (unrivaledMarkActive && leadingId) {
        const isAbh = window.isUnit(leadingId, 'angel_born_in_hell');
        const isTt = window.isUnit(leadingId, 'triple_threat');
        const isKs = window.isUnit(leadingId, 'king_sailor');

        if (isAbh) {
            if (statType === 'dmg' || statType === 'cdmg') {
                if (unitTags.includes('Fused') || unitTags.includes('Fusion')) {
                    return {
                        label: `↳ Leader Buff<br>&nbsp;&nbsp;&nbsp;&nbsp;(Fusion Tag - ABH)`,
                        critLabel: `• Leader Buff<br>&nbsp;&nbsp;&nbsp;&nbsp;(Fusion Tag - ABH)`,
                        found: true
                    };
                }
            }
            if (statType === 'dmg' || statType === 'spa') {
                if (unitTags.includes('Super Warrior')) {
                    return {
                        label: `↳ Leader Buff<br>&nbsp;&nbsp;&nbsp;&nbsp;(Super Warrior Tag - ABH)`,
                        critLabel: `• Leader Buff<br>&nbsp;&nbsp;&nbsp;&nbsp;(Super Warrior Tag - ABH)`,
                        found: true
                    };
                }
            }
            if (statType === 'dmg' || statType === 'cf') {
                if (element === 'light') {
                    return {
                        label: `↳ Leader Buff<br>&nbsp;&nbsp;&nbsp;&nbsp;(Light Element - ABH)`,
                        critLabel: `• Leader Buff<br>&nbsp;&nbsp;&nbsp;&nbsp;(Light Element - ABH)`,
                        found: true
                    };
                }
            }
        } else if (isTt) {
            if (statType === 'dmg' || statType === 'range') {
                if (unitTags.includes('Piece')) {
                    return {
                        label: `↳ Leader Buff<br>&nbsp;&nbsp;&nbsp;&nbsp;(Piece Tag - Triple Threat)`,
                        critLabel: `• Leader Buff<br>&nbsp;&nbsp;&nbsp;&nbsp;(Piece Tag - Triple Threat)`,
                        found: true
                    };
                }
            }
            if (statType === 'dmg' || statType === 'range') {
                if (unitTags.includes('Sword')) {
                    return {
                        label: `↳ Leader Buff<br>&nbsp;&nbsp;&nbsp;&nbsp;(Sword Tag - Triple Threat)`,
                        critLabel: `• Leader Buff<br>&nbsp;&nbsp;&nbsp;&nbsp;(Sword Tag - Triple Threat)`,
                        found: true
                    };
                }
            }
            if (statType === 'dmg' || statType === 'cf') {
                if (element === 'wind') {
                    return {
                        label: `↳ Leader Buff<br>&nbsp;&nbsp;&nbsp;&nbsp;(Wind Element - Triple Threat)`,
                        critLabel: `• Leader Buff<br>&nbsp;&nbsp;&nbsp;&nbsp;(Wind Element - Triple Threat)`,
                        found: true
                    };
                }
            }
        } else if (isKs) {
            if (statType === 'dmg' || statType === 'spa') {
                if (unitTags.includes('Magi')) {
                    return {
                        label: `↳ Leader Buff<br>&nbsp;&nbsp;&nbsp;&nbsp;(Magi Tag - King Sailor)`,
                        critLabel: `• Leader Buff<br>&nbsp;&nbsp;&nbsp;&nbsp;(Magi Tag - King Sailor)`,
                        found: true
                    };
                }
            }
            if (statType === 'dmg' || statType === 'spa') {
                if (unitTags.includes('Uncontrollable Power')) {
                    return {
                        label: `↳ Leader Buff<br>&nbsp;&nbsp;&nbsp;&nbsp;(Uncontrollable Tag - King Sailor)`,
                        critLabel: `• Leader Buff<br>&nbsp;&nbsp;&nbsp;&nbsp;(Uncontrollable Tag - King Sailor)`,
                        found: true
                    };
                }
            }
            if (statType === 'dmg' || statType === 'spa') {
                if (element === 'water') {
                    return {
                        label: `↳ Leader Buff<br>&nbsp;&nbsp;&nbsp;&nbsp;(Water Element - King Sailor)`,
                        critLabel: `• Leader Buff<br>&nbsp;&nbsp;&nbsp;&nbsp;(Water Element - King Sailor)`,
                        found: true
                    };
                }
            }
        }
    }

    // 2. DYNAMIC RELIC SET TAG PERKS
    const tagPerksMap = {};
    if (typeof window.TAG_PERKS !== 'undefined') {
        Object.keys(window.TAG_PERKS).forEach(setId => {
            tagPerksMap[setId] = { sourceName: setId.replace('_set', '').replace('_', ' ').toUpperCase() };
            window.TAG_PERKS[setId].forEach(perk => {
                Object.keys(perk.bonus).forEach(stat => {
                    const sKey = stat === 'cRate' ? 'cf' : (stat === 'cDmg' ? 'cdmg' : stat);
                    if (!tagPerksMap[setId][sKey]) tagPerksMap[setId][sKey] = [];
                    tagPerksMap[setId][sKey].push(perk.tag);
                });
            });
        });
    }

    const activeSet = data.relicStats?.set;
    const activeHead = data.headBuffs?.type || data.relicStats?.head;

    let matchingTags = [];
    let sourceNames = [];

    [
        { key: activeSet, isSet: true },
        { key: activeHead, isSet: false }
    ].forEach(item => {
        if (!item.key) return;
        let cleanSource = item.key;
        if (cleanSource.includes('shadow_reaper')) cleanSource = 'shadow_reaper';
        else if (cleanSource.includes('reaper')) cleanSource = 'reaper_set';
        else if (cleanSource.includes('fused_earring')) cleanSource = 'fused_earrings_acc';
        else if (cleanSource === 'fused' || cleanSource === 'fused_set') cleanSource = 'fused_set';

        const perkCfg = tagPerksMap[cleanSource];
        if (perkCfg && perkCfg[statType]) {
            perkCfg[statType].forEach(t => {
                if (unitTags.includes(t)) {
                    matchingTags.push(t);
                    sourceNames.push(perkCfg.sourceName || (item.isSet ? 'Set' : 'Accessory'));
                }
            });
        }
    });

    if (matchingTags.length > 0) {
        const tagStr = [...new Set(matchingTags)].join(' / ');
        const sourceStr = [...new Set(sourceNames)].join(' / ');
        return {
            label: `↳ Tag Bonus<br>&nbsp;&nbsp;&nbsp;&nbsp;(${tagStr} : ${sourceStr})`,
            critLabel: `• Tag Bonus<br>&nbsp;&nbsp;&nbsp;&nbsp;(${tagStr} : ${sourceStr})`,
            found: true
        };
    }
    return { label: '↳ Tag Bonus', critLabel: '• Tag Bonus', found: false };
}

function renderOverviewSection(data) {
    const isNutaru = window.isUnit?.(data.baseStats?.id, 'nutaru_beast');
    return `
        <div class="math-section" style="border: 1px solid rgba(251, 191, 36, 0.2); border-left: 4px solid #fbbf24; padding: 8px 12px; background: linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(255,255,255,0) 100%);">
            <div class="math-header" style="font-size: 0.5rem; margin-bottom: 10px; letter-spacing: 1px; opacity: 0.6; font-weight: 900; color: #fbbf24;">SNAPSHOT OVERVIEW</div>
            <div class="math-row" style="margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px;">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">ACTIVE TRAIT</span>
                <b class="text-custom" style="font-size: 0.7rem; letter-spacing: 0.5px;">${data.traitObj?.name || 'None'}</b>
            </div>
            <div class="math-row" style="margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px;">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">TOTAL DPS</span>
                <b class="math-val-gold" style="font-size: 0.85rem;">${fmt.num(data.total)}</b>
            </div>
            ${data.bossTotal && Math.abs(data.bossTotal - data.total) > 1 ? `
            <div class="math-row" style="margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px;">
                <span style="font-size: 0.55rem; font-weight: 700; color: #f87171; letter-spacing: 0.5px;">BOSS DPS</span>
                <b style="font-size: 0.85rem; color: #f87171;">${fmt.num(data.bossTotal)}</b>
            </div>` : ''}
            ${(data.summon > 0 && (!data.summonData || !data.summonData.isCustom)) ? `
            <div class="math-row" style="margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px;">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">${isNutaru ? 'CLONES' : 'PLANES'} ACTIVE</span>
                <b class="text-accent-start" style="font-size: 0.7rem;">${fmt.fix(data.summonData?.count, 1)}</b>
            </div>` : ''}
            <div class="math-row" style="margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px;">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">PLACEMENT</span>
                <div style="text-align: right;">
                    <b style="font-size: 0.7rem;">${data.placement} Unit(s)</b>
                    ${data.placement < (data.baseStats?.placement || 1) ? `<div style="font-size: 0.5rem; color: #f87171; font-weight: 700;">(Synergy Reduction Active)</div>` : ''}
                </div>
            </div>
            <div class="math-row" style="margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px;">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">UNIT TYPE</span>
                <b class="text-custom" style="font-size: 0.7rem;">${data.baseStats?.placementType || 'Ground'}</b>
            </div>
            <div class="math-row" style="margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px;">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">FINAL RANGE</span>
                <b class="math-val-range" style="font-size: 0.8rem;">${fmt.fix(data.range, 1)}</b>
            </div>
            <div class="math-row">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">TRUE DAMAGE</span>
                <b class="text-accent-start" style="font-size: 0.8rem;">${(data.trueDmgPct || 0).toFixed(0)}%</b>
            </div>
        </div>`;
}

function renderBuffSummarySection(data) {
    const statPointsPct = ((data.lvStats?.dmgMult || 1) - 1) * 100;
    const totalMult = data.dmgVal / (data.baseStats?.dmg || 1);
    return `
        <div class="math-section" style="border: 1px solid rgba(74, 222, 128, 0.2); border-left: 4px solid #4ade80; padding: 8px 12px; background: linear-gradient(135deg, rgba(74, 222, 128, 0.05) 0%, rgba(255,255,255,0) 100%);">
            <div class="math-header" style="font-size: 0.5rem; margin-bottom: 10px; letter-spacing: 1px; opacity: 0.6; font-weight: 900; color: #4ade80;">TOTAL BUFF SUMMARY</div>
            <div class="math-row" style="margin-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 3px;">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">RELIC STATS</span>
                <b class="text-accent-end" style="font-size: 0.7rem;">${fmt.pct(data.relicBuffs?.dmg)}</b>
            </div>
            <div class="math-row" style="margin-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 3px;">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">TRAIT BONUS</span>
                <b class="text-custom" style="font-size: 0.7rem;">${fmt.pct(data.traitBuffs?.dmg)}</b>
            </div>
            ${(data.baseStats?.id && !(window.getUnitById(data.baseStats.id)?.noPoints)) ? `
            <div class="math-row" style="margin-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 3px;">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">STAT POINTS</span>
                <b class="text-white" style="font-size: 0.7rem;">${fmt.pct(statPointsPct)}</b>
            </div>` : ''}
            <div class="math-row" style="margin-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 3px;">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">ADDITIVE BUCKET</span>
                <b class="mt-text-gold" style="font-size: 0.7rem;">${fmt.pct(data.totalAdditivePct)}</b>
            </div>
            <div class="math-row mt-pt-sm">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">TOTAL MULTIPLIER</span>
                <b class="text-white" style="font-size: 0.75rem;">x${fmt.fix(totalMult, 2)}</b>
            </div>
        </div>`;
}

function renderSourceTotalsSection(data) {
    const relicMainSub = data.relicBuffs?.dmg || 0;
    const setBaseDmg = data.detailedBuffs ? data.detailedBuffs.setBase : ((data.totalSetStats?.dmg || 0) - (data.tagBuffs?.dmg || 0));
    const tagDmg = data.detailedBuffs ? data.detailedBuffs.tagBonus : (data.tagBuffs?.dmg || 0);
    const setPerkTotal = data.detailedBuffs ? data.detailedBuffs.setPerk : 0;
    const accessoryPerkTotal = data.detailedBuffs ? data.detailedBuffs.accessoryPerk : 0;
    const gearTotalDmg = relicMainSub + setBaseDmg + tagDmg + setPerkTotal + accessoryPerkTotal;

    const gearSpa = (data.relicBuffs?.spa || 0) + (data.totalSetStats?.spa || 0) + (data.headBuffs?.spa || 0);
    const gearRange = (data.relicBuffs?.range || 0) + (data.totalSetStats?.range || 0);
    const gearCrit = (data.relicBuffs?.cf || 0) + (data.totalSetStats?.cf || 0);

    const traitDmg = data.traitBuffs?.dmg || 0;
    const traitSpa = data.traitBuffs?.spa || 0;
    const traitRange = data.traitBuffs?.range || 0;
    const traitCrit = data.traitObj?.critRate || 0;

    const eternalDmg = data.eternalBuff || 0;
    const unitInnateDmg = data.detailedBuffs ? (data.detailedBuffs.unitPassive - eternalDmg) : ((data.passiveBuff || 0) - (data.headBuffs?.dmg || 0) - (data.abilityBuff || 0) - eternalDmg);
    const abilityDmg = data.abilityBuff || 0;
    const accessoryBaseDmg = data.detailedBuffs ? data.detailedBuffs.accessoryBase : 0;

    let globalPassiveDmg = 0;
    let globalPassiveSpa = 0;
    let globalPassiveRange = 0;
    let globalPassiveCrit = 0;
    let globalPassiveCdmg = 0;

    let globalBuffsDmgHtml = '';
    let globalBuffsSpaHtml = '';
    let globalBuffsCritHtml = '';

    if (data.activeGlobalBuffs && window.GLOBAL_BUFF_DATA) {
        Object.values(window.GLOBAL_BUFF_DATA).forEach(buff => {
            const bData = data.activeGlobalBuffs[buff.id];
            if (bData) {
                if (bData.dmg > 0) {
                    globalPassiveDmg += bData.dmg;
                    globalBuffsDmgHtml += `<div style="display:flex; justify-content:space-between; font-size: 0.65rem; color: ${buff.color};"><span>↳ ${buff.name}</span><span>${fmt.pct(bData.dmg)}</span></div>`;
                }
                if (bData.spa > 0) {
                    globalPassiveSpa += bData.spa;
                    globalBuffsSpaHtml += `<div style="display:flex; justify-content:space-between; font-size: 0.65rem; color: ${buff.color};"><span>↳ ${buff.name}</span><span>Active</span></div>`;
                }
                if (bData.range) globalPassiveRange += bData.range;

                if (bData.crit || bData.cdmg) {
                    if (bData.crit) globalPassiveCrit += bData.crit;
                    if (bData.cdmg) globalPassiveCdmg += bData.cdmg;
                    if (!bData.spa && !bData.dmg) {
                        globalBuffsCritHtml += `<div style="display:flex; justify-content:space-between; font-size: 0.65rem; color: ${buff.color};"><span>↳ ${buff.name}</span><span>Active</span></div>`;
                    }
                }
            }
        });
    }

    const combinedActiveTags = [...new Set([
        ...(data.totalSetStats?.activeTags || []),
        ...(data.headBuffs?.activeTags || [])
    ])];

    const passiveTotalDmg = unitInnateDmg + abilityDmg + accessoryBaseDmg + globalPassiveDmg + eternalDmg;
    const passiveTotalSpa = (data.passiveSpaBuff || 0) + globalPassiveSpa;
    const passiveTotalRange = (data.baseStats?.passiveRange || 0) + (data.eternalRangeBuff || 0) + globalPassiveRange;
    const passiveTotalCrit = globalPassiveCrit;
    const passiveTotalCdmg = globalPassiveCdmg;

    return `
        <div class="math-section" style="border: 1px solid rgba(255, 255, 255, 0.1); background: #000; flex: 1; margin-bottom: 0; padding: 10px 12px; border-radius: 8px; background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%); border-top: 2px solid rgba(255,255,255,0.15);">
            <div class="math-header" style="color: #fff; font-size: 0.55rem; margin-bottom: 12px; letter-spacing: 1.5px; font-weight: 900; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; opacity: 0.8;">SOURCE TOTALS</div>
            
            <div style="margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); border-left: 3px solid #f472b6; padding-left: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-size: 0.68rem; font-weight: 800; color: #f472b6; letter-spacing: 0.5px;">RELICS & TAGS</span>
                    <b style="color: #f472b6; font-size: 0.8rem;">${fmt.pct(gearTotalDmg)}</b>
                </div>
                <div style="display: flex; flex-direction: column; gap: 3px; margin-bottom: 5px;">
                    <div style="display:flex; justify-content:space-between; font-size: 0.68rem; color: #999;"><span>Gear Main + Subs</span><span class="text-white">${fmt.pct(relicMainSub)}</span></div>
                    <div style="display:flex; justify-content:space-between; font-size: 0.68rem; color: #999;"><span>Set Base Bonus</span><span class="text-white">${fmt.pct(setBaseDmg)}</span></div>
                    <div style="display:flex; justify-content:space-between; font-size: 0.68rem; color: #999;"><span>Accessory Base Stats</span><span class="text-white">${fmt.pct(accessoryBaseDmg)}</span></div>
                    ${setPerkTotal > 0 ? `<div style="display:flex; justify-content:space-between; font-size: 0.68rem; color: #999;"><span>Set Perks</span><span class="text-white">${fmt.pct(setPerkTotal)}</span></div>` : ''}
                    ${accessoryPerkTotal > 0 ? `<div style="display:flex; justify-content:space-between; font-size: 0.68rem; color: #999;"><span>Accessory Perks</span><span class="text-white">${fmt.pct(accessoryPerkTotal)}</span></div>` : ''}
                    ${tagDmg > 0 ? `<div style="display:flex; justify-content:space-between; font-size: 0.68rem; color: #f472b6; font-weight: 700;"><span>Tag Bonuses (${combinedActiveTags.join(' / ') || 'N/A'})</span><span>${fmt.pct(tagDmg)}</span></div>` : ''}
                    ${data.totalSetStats?.set === 'sorcerer_hunter' ? `<div style="display:flex; justify-content:space-between; font-size: 0.68rem; color: #60a5fa; font-weight: 700;"><span>Sorcerer Hunter (True Dmg)</span><span>+15% True Dmg</span></div>` : ''}
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; font-size: 0.65rem; color: #777; border-top: 1px solid rgba(244, 114, 182, 0.1); padding-top: 4px;">
                    <div style="display:flex; justify-content:space-between;"><span>SPA</span><b class="text-white">-${gearSpa.toFixed(1)}%</b></div>
                    <div style="display:flex; justify-content:space-between;"><span>Range</span><b class="text-white">${fmt.pct(gearRange)}</b></div>
                    <div style="display:flex; justify-content:space-between; grid-column: span 2;"><span>Crit Rate Bonus</span><b class="text-white">+${gearCrit.toFixed(1)}%</b></div>
                </div>
            </div>

            <div style="margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); border-left: 3px solid #4ade80; padding-left: 10px; background: rgba(74, 222, 128, 0.02); padding-top: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-size: 0.68rem; font-weight: 800; color: #4ade80; letter-spacing: 0.5px;">TRAIT: ${data.traitObj?.name?.toUpperCase() || 'NONE'}</span>
                    <b style="color: #4ade80; font-size: 0.8rem;">${fmt.pct(traitDmg)}</b>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px 12px; font-size: 0.60rem; color: #999;">
                    <div style="display:flex; justify-content:space-between;"><span>SPA</span><b class="text-white">-${traitSpa.toFixed(1)}%</b></div>
                    <div style="display:flex; justify-content:space-between;"><span>Range</span><b class="text-white">${fmt.pct(traitRange)}</b></div>
                    ${traitCrit > 0 ? `<div style="display:flex; justify-content:space-between;"><span>Crit</span><b class="text-white">+${traitCrit}%</b></div>` : ''}
                </div>
            </div>

            <div style="border-left: 3px solid #fbbf24; padding-left: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-size: 0.68rem; font-weight: 800; color: #fbbf24; letter-spacing: 0.5px;">PASSIVES & GLOBAL</span>
                    <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                        <b style="color: #fbbf24; font-size: 0.8rem;">${fmt.pct(passiveTotalDmg)}</b>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 2px; margin-bottom: 6px;">` +
        (window.isUnit?.(data.baseStats?.id, 'nutaru_beast') ? `
                        <div style="display:flex; justify-content:space-between; font-size: 0.65rem; color: #999;"><span>Clone Despawn</span><span class="text-white">+40.0%</span></div>
                        ${data.isAbility ? `
                            <div style="display:flex; justify-content:space-between; font-size: 0.65rem; color: #999;"><span>Beast Form</span><span class="text-white">+30.0%</span></div>
                            <div style="display:flex; justify-content:space-between; font-size: 0.65rem; color: #999;"><span>Attack Cycle</span><span class="text-white">+50.0%</span></div>
                        ` : ''}
                    ` : `
                        ${(() => {
            if (data.detailedBuffs && data.detailedBuffs.passiveBreakdown && data.detailedBuffs.passiveBreakdown.length > 0) {
                let html = '';
                data.detailedBuffs.passiveBreakdown.forEach(p => {
                    if (p.dmg > 0) html += `<div style="display:flex; justify-content:space-between; font-size: 0.65rem; color: #999;"><span>${p.name}</span><span class="text-white">${fmt.pct(p.dmg)}</span></div>`;
                    html += getAbhContributionRowsHtml(p, data, 'compact');
                    if (p.trueDmg > 0) html += `<div style="display:flex; justify-content:space-between; font-size: 0.65rem; color: #60a5fa;"><span>${p.name} (True)</span><span>+${p.trueDmg}%</span></div>`;
                });
                const namedDmg = data.detailedBuffs.passiveBreakdown.reduce((sum, p) => sum + (p.dmg || 0), 0);
                const eternalSub = (data.traitObj && data.traitObj.isEternal) ? (Math.min(data.wave || 12, 12) * 5) : 0;
                const rem = (data.detailedBuffs.unitPassive || 0) - namedDmg - eternalSub;
                if (Math.abs(rem) > 0.01) html += `<div style="display:flex; justify-content:space-between; font-size: 0.65rem; color: #999;"><span>Unit Passive (Base)</span><span class="text-white">${fmt.pct(rem)}</span></div>`;
                return html;
            } else {
                const eternalSub = (data.traitObj && data.traitObj.isEternal) ? (Math.min(data.wave || 12, 12) * 5) : 0;
                const val = (data.detailedBuffs ? data.detailedBuffs.unitPassive : passiveDmg) - eternalSub;
                return val > 0 ? `<div style="display:flex; justify-content:space-between; font-size: 0.65rem; color: #999;"><span>Unit Passive</span><span class="text-white">${fmt.pct(val)}</span></div>` : '';
            }
        })()}
                    `) + `
                    ${abilityDmg > 0 ? `<div style="display:flex; justify-content:space-between; font-size: 0.68rem; color: #999;"><span>Active Ability</span><span class="text-white">${fmt.pct(abilityDmg)}</span></div>` : ''}
                    ${accessoryBaseDmg > 0 ? `<div style="display:flex; justify-content:space-between; font-size: 0.68rem; color: #999;"><span>Accessory Base</span><span class="text-white">${fmt.pct(abilityDmg)}</span></div>` : ''}
                    ${globalBuffsDmgHtml}
                    ${globalBuffsSpaHtml}
                    ${globalBuffsCritHtml}
                </div>
                <div style="grid-column: span 1; display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; font-size: 0.65rem; color: #777;">
                    <div style="display:flex; justify-content:space-between;"><span>SPA Reduction</span><b class="text-white">${passiveTotalSpa >= 0 ? '-' : '+'}${Math.abs(passiveTotalSpa).toFixed(1)}%</b></div>
                    <div style="display:flex; justify-content:space-between;"><span>Range</span><b class="text-white">${fmt.pct(passiveTotalRange)}</b></div>
                    <div style="display:flex; justify-content:space-between;"><span>Crit Rate</span><b style="color:#60a5fa;">+${passiveTotalCrit}%</b></div>
                    <div style="display:flex; justify-content:space-between;"><span>Crit Dmg</span><b style="color:#60a5fa;">+${passiveTotalCdmg}%</b></div>
                </div>
            </div>
        </div>`;
}

function renderActiveBuffsSection(data) {
    const buffs = [];

    if (data.activeGlobalBuffs && window.GLOBAL_BUFF_DATA) {
        Object.values(window.GLOBAL_BUFF_DATA).forEach(buff => {
            if (data.activeGlobalBuffs[buff.id]) {
                buffs.push({
                    name: "Global: " + buff.name,
                    desc: buff.renderLabel || buff.desc || '',
                    color: buff.color
                });
            }
        });
    }

    if (data.traitObj?.isEternal) buffs.push({ name: "Eternal Stacks", desc: "Applied: +5% Dmg & +2.5% Rng / Wave (Max 12)", color: "#c084fc" });
    if (data.traitObj?.hasRadiation) buffs.push({ name: "Radiation", desc: "Fission Trait: Radiation Status Active", color: "#f87171" });

    if (data.conditionalData) buffs.push({ name: data.conditionalData.name, desc: `Target condition met: x${data.conditionalData.mult.toFixed(2)} Dmg`, color: "#fb923c" });

    if (data.extraAttacks) buffs.push({ name: data.extraAttacks.label || "Attack Rate", desc: `${data.extraAttacks.hits}: Final x${data.extraAttacks.mult.toFixed(3)} DPS Mult`, color: "#60a5fa" });

    if (data.headBuffs && data.headBuffs.note) {
        buffs.push({ name: "Accessory Passive", desc: data.headBuffs.note, color: "#f472b6" });
    }

    const unit = typeof getUnitById === 'function' ? getUnitById(data.baseStats?.id) : null;

    const activePassives = data.baseStats?.passives || (unit ? unit.passives : null);

    if (activePassives && Array.isArray(activePassives)) {
        activePassives.forEach(p => {
            let stats = [];
            const pb = (data.detailedBuffs && data.detailedBuffs.passiveBreakdown)
                ? data.detailedBuffs.passiveBreakdown.find(item => item.name === p.name)
                : null;

            if (pb) {
                if (pb.dmg) stats.push(`+${pb.dmg}% Dmg`);
                if (pb.spa) stats.push(`${pb.spa > 0 ? '-' : '+'}${Math.abs(pb.spa)}% Spa`);
                if (pb.range) stats.push(`+${pb.range}% Rng`);
                if (pb.crit) stats.push(`+${pb.crit}% Crit`);
                if (pb.cdmg) stats.push(`+${pb.cdmg}% CDmg`);

                if (pb.dot) {
                    const dotType = p.dotType || data.baseStats?.dotType || data.baseStats?.stats?.dotType;
                    const dotSuffix = dotType ? ` (${dotType})` : '';
                    stats.push(`+${pb.dot}% DoT${dotSuffix}`);
                }
                if (pb.bossDmg) stats.push(`+${pb.bossDmg}% Boss Dmg`);
            }

            let desc = p.desc;
            if (stats.length > 0) desc = `<b class="text-accent-start">[Applied: ${stats.join(', ')}]</b> ` + desc;

            buffs.push({ name: p.name, desc: desc, color: "#fff" });
        });
    }

    if (buffs.length === 0) return '';

    const itemsHtml = buffs.map(b => `
        <div class="math-row" style="align-items: baseline; gap: 10px; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.03);">
            <div style="flex: 0 0 110px; line-height: 1.3;"><b style="color: ${b.color}; font-size: 0.75rem; text-transform: uppercase;">${b.name}</b></div>
            <div style="flex: 1; font-size: 0.75rem; color: #999; line-height: 1.3;">${b.desc}</div>
        </div>
    `).join('');

    return `
        <div class="math-section" style="margin-bottom: 6px; border-color: rgba(255,255,255,0.05); background: rgba(255,255,255,0.02); padding: 8px 10px; border-radius: 8px;">
            <div class="math-header" style="font-size: 0.65rem; opacity: 0.5; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                <span>Applied Passives & Global Buffs</span>
                ${unit ? `<button class="calc-info-btn" onclick="openUnitInfo('${unit.id}')" title="View Full Unit Passives">?</button>` : ''}
            </div>
            <div style="display: flex; flex-direction: column;">
                ${itemsHtml}
            </div>
        </div>`;
}

function renderQuickBreakdownSection(data, avgHitPerUnit, dotColorClass) {
    const isInactive = data.dotData && data.dotData.inactive;
    const dotLabelClass = data.dot > 0 ? 'text-accent-end' : (isInactive ? '' : '');
    const isNutaru = window.isUnit?.(data.baseStats?.id, 'nutaru_beast');

    return `
        <div class="math-section no-border-bottom" style="margin-bottom: 4px;">
            <div class="math-header opacity-70">Quick Breakdown</div>
            <div class="mq-box">
                <div style="border-color: rgba(251, 191, 36, 0.3);">
                    <div class="mq-label mt-text-gold">Hit DPS</div>
                    <div class="mq-val mt-text-gold">${fmt.num(data.hit)}</div>
                    <div class="mq-sub">
                        ${data.baseStats?.id === 'strongest_swordsman_hunter'
            ? `Stances Weighted Average × ${data.placement}`
            : (data.baseStats?.id === 'triple_threat'
                ? `(${fmt.num(avgHitPerUnit / data.spa)} Base + ${fmt.num((data.hit / data.placement) - (avgHitPerUnit / data.spa))} FUA) × ${data.placement}`
                : `(${fmt.num(avgHitPerUnit)} avg ÷ ${fmt.fix(data.usedSpa || data.spa, 2)}s) × ${data.placement}`)
        }
                    </div>
                </div>
                <div style="border-color: ${data.dot > 0 ? 'rgba(192, 132, 252, 0.3)' : (isInactive ? 'rgba(239, 68, 68, 0.4)' : '#333')};">
                    <div class="mq-label ${isInactive ? '' : dotLabelClass}" style="${isInactive ? 'color: #fca5a5;' : ''}">DoT DPS</div>
                    <div class="mq-val ${isInactive ? '' : dotColorClass}" style="${isInactive ? 'color: #ef4444;' : ''}">${data.dot > 0 ? fmt.num(data.dot) : (isInactive ? 'INACTIVE' : '-')}</div>
                    <div class="mq-sub">${data.dot > 0 ? (data.hasStackingDoT ? `Stacking: x${data.placement} units` : `Limited: x1 unit only`) : (isInactive ? `Needs ${data.dotData?.requirement}` : 'No DoT')}</div>
                </div>
                <div style="border-color: rgba(216, 180, 254, 0.3);"><div class="mq-label text-custom">Crit Rate / Dmg</div><div class="mq-val text-custom">${fmt.fix(data.critData?.rate, 0)}% <span class="color-dim">|</span> x${fmt.fix(data.critData?.cdmg / 100, 2)}</div><div class="mq-sub">Avg Mult: x${fmt.fix(data.critData?.avgMult, 3)}</div></div>
                ${data.summon > 0 ? `<div style="border-color: rgba(96, 165, 250, 0.3);"><div class="mq-label text-accent-start">${isNutaru ? 'Clone' : (data.summonData?.isCustom ? 'Custom Summon' : 'Plane')} DPS</div><div class="mq-val text-accent-start">${fmt.num(data.summon)}</div><div class="mq-sub">Independent of Host Stats</div></div>` : `<div style="border-color: rgba(96, 165, 250, 0.3);"><div class="mq-label text-accent-start">Attack Rate</div><div class="mq-val text-accent-start">${fmt.fix(data.spa, 2)}s</div><div class="mq-sub">Base: ${data.baseStats?.spa}s (Current Cap: ${data.spaCap}s)</div></div>`}
            </div>
        </div>`;
}

function renderBaseDamageSection(data, levelMult, traitRowsDmg, dmgAfterRelic, preConditionalDmg, baseSetDmg, tagDmg, passiveDmg, eternalDmg, statPointsHtml, cleanHeadDisplayName, relicSetName) {
    let globalDmgBreakdownHtml = '';
    if (data.activeGlobalBuffs && window.GLOBAL_BUFF_DATA) {
        Object.values(window.GLOBAL_BUFF_DATA).forEach(buff => {
            const bData = data.activeGlobalBuffs[buff.id];
            if (bData && bData.dmg > 0) {
                globalDmgBreakdownHtml += `<tr><td class="mt-cell-label mt-pl-md opacity-70" style="color: ${buff.color};">↳ ${buff.name}</td><td class="mt-cell-formula" style="color: ${buff.color};">${fmt.pct(bData.dmg)}</td><td class="mt-cell-val"></td></tr>`;
            }
        });
    }

    let warlordHtml = '';
    if (data.warlordData) {
        const w = data.warlordData;
        warlordHtml += `
        <tr class="mt-row-warlord"><td colspan="3" class="p-2">
            <div class="mt-flex-between mb-2">
                <span class="mt-text-bold text-xs tracking-sm" style="color: #a78bfa;">WARLORD SET PASSIVE</span>
                <button class="calc-info-btn" onclick="openInfoPopup('warlord_passive')">?</button>
            </div>
            <div class="mt-flex-between text-xs text-white mb-1">
                <span class="opacity-70">Estimated Crit Rate:</span>
                <span class="mt-font-mono mt-text-right text-white">${fmt.fix(w.critRate, 1)}%</span>
            </div>
            <div class="mt-flex-between text-xs text-white mb-1">
                <span class="opacity-70">Avg Attacks to Crit:</span>
                <span class="mt-font-mono mt-text-right text-white">${fmt.fix(w.attacksToCrit, 2)}</span>
            </div>
            <div class="mt-flex-between text-xs text-white mb-3">
                <span class="opacity-70">Buff Uptime:</span>
                <span class="mt-font-mono mt-text-right mt-text-green">${fmt.fix(w.uptime * 100, 1)}%</span>
            </div>
            <div class="mt-flex-between mt-border-top mt-pt-sm">
                <span class="text-white text-xs text-bold">Avg Damage Buff (+${fmt.fix(45 * (w.starMult || 1), 2)}% Base * Uptime)</span>
                <span class="text-sm mt-text-bold" style="color: #a78bfa;"> +${fmt.fix(w.dmg, 1)}%</span>
            </div>
        </td></tr>`;
    }

    return `
            <div class="dd-section">
                <div class="dd-title mt-text-red"><span>1. Base Damage Calculation</span></div>
                <table class="calc-table">
                    <tr><td class="mt-cell-label">Base Stats (Lv 1)</td><td class="mt-cell-formula"></td><td class="mt-cell-val">${fmt.num(data.baseStats?.dmg)}</td></tr>
                    ${statPointsHtml}
                    ${data.isSSS ? `<tr><td class="mt-cell-label">SSS Rank Bonus</td><td class="mt-cell-formula"><span class="op">×</span>1.2</td><td class="mt-cell-val">${fmt.num(data.lvStats?.dmg)}</td></tr>` : ''}
                    
                    ${traitRowsDmg}

                    <tr><td class="mt-cell-label text-accent-end">Relic Multiplier <button class="calc-info-btn" onclick="openInfoPopup('relic_multi')">?</button></td><td class="mt-cell-formula text-accent-end">${fmt.pct(data.relicBuffs?.dmg)}</td><td class="mt-cell-val">${fmt.num(dmgAfterRelic)}</td></tr>
                    
                    ${warlordHtml} 
                    <tr>
                        <td class="mt-cell-label mt-pt-md">Buff Data <button class="calc-info-btn" onclick="openInfoPopup('tag_logic')">?</button></td>
                        <td class="mt-cell-formula mt-pt-md mt-text-gold mt-text-bold">${fmt.pct(data.totalAdditivePct)}</td>
                        <td class="mt-cell-val calc-highlight mt-pt-md">${fmt.num(preConditionalDmg)}</td>
                    </tr>
                    ${(data.detailedBuffs ? data.detailedBuffs.setBase : baseSetDmg) !== 0 ? `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Set Base Bonus <span style="font-size: 0.65rem; color: #a78bfa; font-weight: 500;">(${relicSetName} Set)</span></td><td class="mt-cell-formula">${fmt.pct(data.detailedBuffs ? data.detailedBuffs.setBase : baseSetDmg)}</td><td class="mt-cell-val"></td></tr>` : ''}
                    ${(data.detailedBuffs?.accessoryBase || 0) > 0 ? `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Accessory Base <span style="font-size: 0.65rem; color: #a78bfa; font-weight: 500;">(${cleanHeadDisplayName})</span></td><td class="mt-cell-formula">${fmt.pct(data.detailedBuffs.accessoryBase)}</td><td class="mt-cell-val"></td></tr>` : ''}
                    ${(() => {
            const val = data.detailedBuffs?.accessoryPerk || 0;
            if (val === 0) return '';
            const note = data.headBuffs?.note || "";
            let label = `↳ Accessory Passive Perk`;
            if (note.includes('Clash')) label = `↳ Clash Potential Bonus`;
            else if (note.includes('Syncro')) label = `↳ Synchro Form Bonus`;

            return `<tr><td class="mt-cell-label mt-pl-md opacity-70">${label} <span style="font-size: 0.65rem; color: #a78bfa; font-weight: 500;">(${cleanHeadDisplayName})</span></td><td class="mt-cell-formula" style="vertical-align: middle;">${fmt.pct(val)}</td><td class="mt-cell-val"></td></tr>`;
        })()}
                    ${(() => {
            const val = (data.detailedBuffs ? data.detailedBuffs.tagBonus : tagDmg);
            if (val === 0) return '';
            return `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Tag Bonus</td><td class="mt-cell-formula">${fmt.pct(val)}</td><td class="mt-cell-val"></td></tr>`;
        })()}
                    ${(() => {
            if (!data.detailedBuffs) return '';
            let html = '';
            if (data.detailedBuffs.setPerk && data.detailedBuffs.setPerk !== 0) {
                let label = '↳ Set Perks';
                if (data.relicStats && data.relicStats.set === 'monarch') {
                    const summons = data.baseStats?.id === 'gluttonous_warlord' ? 4 : (data.summonStats ? Math.min(4, data.summonStats.maxCount) : 4);
                    label = `↳ Set Perks (Monarch Set: +10% × ${summons} Summons)`;
                } else if (data.relicStats && data.relicStats.set === 'warlord') {
                    label = `↳ Set Perks (Warlord)`;
                }
                html += `<tr><td class="mt-cell-label mt-pl-md opacity-70">${label}</td><td class="mt-cell-formula">${fmt.pct(data.detailedBuffs.setPerk)}</td><td class="mt-cell-val"></td></tr>`;
            }
            return html;
        })()}
                    ${(() => {
            if (!data.detailedBuffs) return '';
            let html = '';
            if (data.detailedBuffs.passiveBreakdown && data.detailedBuffs.passiveBreakdown.length > 0) {
                data.detailedBuffs.passiveBreakdown.forEach(p => {
                    if (p.dmg !== 0) html += `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ ${p.name}</td><td class="mt-cell-formula">${p.dmg > 0 ? '+' : ''}${fmt.fix(p.dmg, 1)}%</td><td class="mt-cell-val"></td></tr>`;
                    html += getAbhContributionRowsHtml(p, data, 'table');
                });
                const namedDmg = data.detailedBuffs.passiveBreakdown.reduce((sum, p) => sum + (p.dmg || 0), 0);
                const eternalSub = (data.traitObj && data.traitObj.isEternal) ? (Math.min(data.wave || 12, 12) * 5) : 0;
                const rem = (data.detailedBuffs.unitPassive || 0) - namedDmg - eternalSub;
                if (Math.abs(rem) > 0.01) html += `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Unit Passive (Base)</td><td class="mt-cell-formula">${rem > 0 ? '+' : ''}${fmt.fix(rem, 1)}%</td><td class="mt-cell-val"></td></tr>`;
            } else {
                const eternalSub = (data.traitObj && data.traitObj.isEternal) ? (Math.min(data.wave || 12, 12) * 5) : 0;
                const val = (data.detailedBuffs ? data.detailedBuffs.unitPassive : passiveDmg) - eternalSub;
                if (Math.abs(val) > 0.01) {
                    html = `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Unit Passive</td><td class="mt-cell-formula">${val > 0 ? '+' : ''}${fmt.fix(val, 1)}%</td><td class="mt-cell-val"></td></tr>`;
                }
            }
            return html;
        })()}
                    ${eternalDmg > 0 ? `<tr><td class="mt-cell-label mt-pl-md text-accent-start opacity-70">↳ Eternal Stacks (Wave 12+)</td><td class="mt-cell-formula text-accent-start">${fmt.pct(eternalDmg)}</td><td class="mt-cell-val"></td></tr>` : ''}
                    ${(data.abilityBuff || 0) > 0 ? `<tr><td class="mt-cell-label mt-pl-md text-custom opacity-70">↳ Ability Buffs</td><td class="mt-cell-formula text-custom">${fmt.pct(data.abilityBuff)}</td><td class="mt-cell-val"></td></tr>` : ''}

                    ${globalDmgBreakdownHtml}

                    ${data.conditionalData ? `
                    <tr><td class="mt-cell-label mt-pt-md mt-text-orange mt-text-bold">${data.conditionalData.name}</td><td class="mt-cell-formula mt-pt-md mt-text-orange mt-text-bold">x${data.conditionalData.mult.toFixed(2)}</td><td class="mt-cell-val calc-highlight mt-pt-md">${fmt.num(data.dmgVal)}</td></tr>` : ''}
                </table>
            </div>`;
}

function getTagPerkRowsHtml(statType, data) {
    const unitTags = data.baseStats?.tags || [];
    let html = '';

    const uniqueSets = new Set();
    const checkSet = [];

    const setKey = data.relicStats?.set;
    if (setKey && setKey !== 'none') {
        let cleanSet = setKey;
        if (cleanSet.includes('shadow_reaper')) cleanSet = 'shadow_reaper';
        else if (cleanSet.includes('reaper')) cleanSet = 'reaper_set';
        else if (cleanSet.includes('fused')) cleanSet = 'fused_set';
        else cleanSet = cleanSet.replace('_set', '');

        uniqueSets.add(cleanSet);
        checkSet.push({ id: setKey, label: 'Set' });
    }

    const headKey = data.headBuffs?.type || data.relicStats?.head;
    if (headKey && headKey !== 'none') {
        let cleanHead = headKey;
        if (cleanHead.includes('shadow_reaper')) cleanHead = 'shadow_reaper';
        else if (cleanHead.includes('reaper')) cleanHead = 'reaper_set';
        else if (cleanHead.includes('fused_earring')) cleanHead = 'fused_earrings_acc';
        else if (cleanHead === 'fused' || cleanHead === 'fused_set') cleanHead = 'fused_set';
        else cleanHead = cleanHead.replace('_necklace', '').replace('_hat', '').replace('_set', '');

        if (!uniqueSets.has(cleanHead)) {
            uniqueSets.add(cleanHead);
            checkSet.push({ id: headKey, label: 'Accessory' });
        }
    }

    checkSet.forEach(item => {
        let setId = item.id;
        if (setId.includes('fused_earring')) setId = 'fused_earrings_acc';
        else if (setId.includes('fused')) setId = 'fused_set';
        else if (setId.includes('shadow_reaper')) setId = 'shadow_reaper';
        else if (setId.includes('reaper')) setId = 'reaper_set';
        else setId = setId.replace('_necklace', '').replace('_hat', '').replace('_set', '');

        if (window.TAG_PERKS?.[setId]) {
            window.TAG_PERKS[setId].forEach(perk => {
                if (unitTags.includes(perk.tag)) {
                    const bonusKey = statType === 'cf' ? 'cRate' : 'cDmg';
                    const val = perk.bonus[bonusKey];
                    if (val) {
                        const source = (setId === 'warlord') ? 'Warlord Set' :
                            (setId === 'shadow_reaper') ? 'S. Reaper' :
                                (setId === 'reaper_set') ? 'Reaper Set' :
                                    (setId === 'fused_set') ? 'Fused Warrior Set' :
                                        (setId === 'fused_earrings_acc') ? 'Fused Earrings' : setId.replace('_', ' ').toUpperCase();

                        html += `<tr><td class="mt-cell-label mt-pl-lg text-dim text-xs" style="line-height: 1.3;">↳ Tag Bonus<br>&nbsp;&nbsp;&nbsp;&nbsp;(${perk.tag} : ${source})</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs" style="vertical-align: top; padding-top: 2px;">+${fmt.fix(val, 1)}%</td></tr>`;
                    }
                }
            });
        }
    });
    return html;
}

function renderCritSection(data, setTagCfTotal, setTagCmTotal, cleanHeadDisplayName, relicSetName) {
    let globalCritBreakdownHtml = '';
    let globalCdmgBreakdownHtml = '';

    if (data.activeGlobalBuffs && window.GLOBAL_BUFF_DATA) {
        Object.values(window.GLOBAL_BUFF_DATA).forEach(buff => {
            const bData = data.activeGlobalBuffs[buff.id];
            if (bData) {
                if (bData.crit > 0) globalCritBreakdownHtml += `<tr><td class="mt-cell-label mt-pl-lg text-dim text-xs" style="color:${buff.color}">• ${buff.name}</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs" style="color:${buff.color}">+${fmt.fix(bData.crit, 1)}%</td></tr>`;
                if (bData.cdmg > 0) globalCdmgBreakdownHtml += `<tr><td class="mt-cell-label mt-pl-lg text-dim text-xs" style="color:${buff.color}">• ${buff.name}</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs" style="color:${buff.color}">+${fmt.fix(bData.cdmg, 1)}%</td></tr>`;
            }
        });
    }

    let passiveCritBreakdownHtml = '';
    let passiveCdmgBreakdownHtml = '';
    if (data.detailedBuffs && data.detailedBuffs.passiveBreakdown) {
        data.detailedBuffs.passiveBreakdown.forEach(p => {
            if (p.crit > 0 && p.name !== "Sword Stances (Avg)") passiveCritBreakdownHtml += `<tr><td class="mt-cell-label mt-pl-lg text-dim text-xs">• ${p.name}</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">+${fmt.fix(p.crit, 1)}%</td></tr>`;
            if (p.cdmg > 0) globalCdmgBreakdownHtml += `<tr><td class="mt-cell-label mt-pl-lg text-dim text-xs">• ${p.name}</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">+${fmt.fix(p.cdmg, 1)}%</td></tr>`;
        });
    }

    const accCfVal = data.headBuffs?.cf || 0;
    const tagCfVal = data.tagBuffs?.cf || 0;
    const setCfVal = Math.max(0, (data.totalSetStats?.cf || 0) - tagCfVal);

    const accCmVal = data.headBuffs?.cm || 0;
    const tagCmVal = data.tagBuffs?.cm || data.tagBuffs?.cdmg || 0;
    const setCmVal = Math.max(0, (data.totalSetStats?.cm || data.totalSetStats?.cdmg || 0) - tagCmVal);

    return `
            <div class="dd-section">
                <div class="dd-title" style="color: #c084fc"><span>2. Crit Averaging</span> <button class="calc-info-btn" onclick="openInfoPopup('crit_avg')">?</button></div>
                <table class="calc-table">
                    <tr><td class="mt-cell-label">Base Hit (Non-Crit)</td><td class="mt-cell-formula"></td><td class="mt-cell-val">${fmt.num(data.dmgVal)}</td></tr>
                    
                    <tr><td class="mt-cell-label mt-pl-sm mt-text-gold mt-text-bold">Crit Rate Calculation</td><td class="mt-cell-formula"></td><td class="mt-cell-val"></td></tr>
                    ${data.baseStats?.crit > 0 ? `<tr><td class="mt-cell-label mt-pl-lg text-dim text-xs">• Unit Base</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">${fmt.fix(data.baseStats.crit, 1)}%</td></tr>` : ''}
                    ${(data.traitObj?.critRate || 0) > 0 ? `<tr><td class="mt-cell-label mt-pl-lg text-dim text-xs">• Trait (${data.traitObj.name})</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">${fmt.fix(data.traitObj.critRate, 1)}%</td></tr>` : ''}
                    ${data.relicBuffs?.cf > 0 ? `<tr><td class="mt-cell-label mt-pl-lg text-dim text-xs">• Relics (Main+Sub)</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">${fmt.fix(data.relicBuffs.cf, 1)}%</td></tr>` : ''}
                    ${setCfVal > 0 ? `<tr><td class="mt-cell-label mt-pl-lg text-dim text-xs" style="line-height: 1.4;">↳ Set Bonus<br>&nbsp;&nbsp;&nbsp;&nbsp;(${relicSetName} Set)</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs" style="vertical-align: top; padding-top: 4px;">${fmt.fix(setCfVal, 1)}%</td></tr>` : ''}
                    ${accCfVal > 0 ? `<tr><td class="mt-cell-label mt-pl-lg text-dim text-xs" style="line-height: 1.4;">↳ Accessory Base<br>&nbsp;&nbsp;&nbsp;&nbsp;(${cleanHeadDisplayName})</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs" style="vertical-align: top; padding-top: 4px;">+${fmt.fix(accCfVal, 1)}%</td></tr>` : ''}
                    ${getTagPerkRowsHtml('cf', data)}
                    ${globalCritBreakdownHtml}
                    ${passiveCritBreakdownHtml}
                    <tr><td class="mt-cell-label mt-pl-sm mt-text-gold mt-text-bold">↳ Final Crit Rate</td><td class="mt-cell-formula"></td><td class="mt-cell-val mt-text-gold mt-text-bold">${fmt.fix(data.critData?.rate, 1)}%</td></tr>
                    
                    <tr><td class="mt-cell-label mt-pl-sm mt-text-gold mt-text-bold mt-pt-md">Crit Damage Calculation</td><td class="mt-cell-formula mt-pt-md"></td><td class="mt-cell-val mt-pt-md"></td></tr>
                    <tr><td class="mt-cell-label mt-pl-sm text-gray">↳ CDmg Base</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-gray font-normal">${fmt.fix(data.critData?.baseCdmg, 0)}</td></tr>
                    ${data.relicBuffs?.cm > 0 ? `<tr><td class="mt-cell-label mt-pl-lg text-dim text-xs">• Relics</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">+${fmt.fix(data.relicBuffs.cm, 1)}%</td></tr>` : ''}
                    ${setCmVal > 0 ? `<tr><td class="mt-cell-label mt-pl-lg text-dim text-xs" style="line-height: 1.4;">↳ Set Bonus<br>&nbsp;&nbsp;&nbsp;&nbsp;(${relicSetName} Set)</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs" style="vertical-align: top; padding-top: 4px;">+${fmt.fix(setCmVal, 1)}%</td></tr>` : ''}
                    ${accCmVal > 0 ? `<tr><td class="mt-cell-label mt-pl-lg text-dim text-xs" style="line-height: 1.4;">↳ Accessory Base<br>&nbsp;&nbsp;&nbsp;&nbsp;(${cleanHeadDisplayName})</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs" style="vertical-align: top; padding-top: 4px;">+${fmt.fix(accCmVal, 1)}%</td></tr>` : ''}
                    ${getTagPerkRowsHtml('cdmg', data)}
                    ${globalCdmgBreakdownHtml}
                    ${passiveCdmgBreakdownHtml}
                    <tr><td class="mt-cell-label">Total Crit Damage</td><td class="mt-cell-formula">=</td><td class="mt-cell-val calc-highlight">${fmt.fix(data.critData?.cdmg, 0)}%</td></tr>
                    
                    <tr>
                        <td class="mt-cell-label text-right pr-2 mt-pt-md">Avg Damage Per Hit</td>
                        <td class="mt-cell-formula mt-pt-md"></td>
                        <td class="mt-cell-val calc-result text-right mt-pt-md">${fmt.num((data.dmgVal || 0) * (data.critData?.avgMult || 1))}</td>
                    </tr>
                </table>
            </div>`;
}

function renderSpaSection(data, traitRowsSpa, baseSetSpa, tagSpa, passiveSpa, cleanHeadDisplayName) {
    const headSpaVal = data.headBuffs?.spa || 0;
    const upgradeBaseSpa = data.baseStats?.spa || (data.lvStats?.spa / data.lvStats?.spaMult) || 1;
    const spaAfterPoints = upgradeBaseSpa * (data.lvStats?.spaMult || 1);
    let globalSpaBreakdownHtml = '';
    if (data.activeGlobalBuffs && window.GLOBAL_BUFF_DATA) {
        Object.values(window.GLOBAL_BUFF_DATA).forEach(buff => {
            const bData = data.activeGlobalBuffs[buff.id];
            if (bData && bData.spa > 0) {
                globalSpaBreakdownHtml += `<tr><td class="mt-cell-label mt-pl-md opacity-70" style="color:${buff.color};">↳ ${buff.name}</td><td class="mt-cell-formula" style="color:${buff.color};">-${fmt.fix(bData.spa, 1)}%</td><td class="mt-cell-val"></td></tr>`;
            }
        });
    }

    return `
            <div class="dd-section">
                <div class="dd-title mt-text-custom"><span>3. SPA (Speed) Calculation</span> <button class="calc-info-btn" onclick="openInfoPopup('spa_calc')">?</button></div>
                <table class="calc-table">
                    <tr><td class="mt-cell-label">Base SPA (Upgrade)</td><td class="mt-cell-formula"></td><td class="mt-cell-val">${fmt.fix(upgradeBaseSpa, 2)}s</td></tr>
                    <tr><td class="mt-cell-label">Stat Point Scaling</td><td class="mt-cell-formula">x${fmt.fix(data.lvStats?.spaMult, 3)}</td><td class="mt-cell-val">${fmt.fix(spaAfterPoints, 3)}s</td></tr>
                    ${data.isSSS ? `<tr><td class="mt-cell-label">SSS Rank (-8%)</td><td class="mt-cell-formula"><span class="op">×</span>0.92</td><td class="mt-cell-val">${fmt.fix(data.lvStats?.spa, 3)}s</td></tr>` : ''}
                    ${traitRowsSpa}
                    
                    <tr><td class="mt-cell-label mt-pt-md">Relic Multiplier</td><td class="mt-cell-formula mt-pt-md">-${fmt.fix(data.relicBuffs?.spa, 1)}%</td><td class="mt-cell-val mt-pt-md">${fmt.fix(data.spaAfterRelic, 3)}s</td></tr>
                    <tr><td class="mt-cell-label mt-pt-md">Set Bonus + Passive + Abilities <button class="calc-info-btn" onclick="openInfoPopup('tag_logic')">?</button></td><td class="mt-cell-formula mt-pt-md">${data.setAndPassiveSpa >= 0 ? '-' : '+'}${Math.abs(fmt.fix(data.setAndPassiveSpa, 1))}%</td><td class="mt-cell-val mt-pt-md">${fmt.fix(data.rawFinalSpa, 3)}s</td></tr>
                    <tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Set Base</td><td class="mt-cell-formula">-${fmt.fix(baseSetSpa, 1)}%</td><td class="mt-cell-val"></td></tr>
                    ${headSpaVal > 0 ? `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Accessory Base <span style="font-size: 0.65rem; color: #a78bfa; font-weight: 500;">(${cleanHeadDisplayName})</span></td><td class="mt-cell-formula">-${fmt.fix(headSpaVal, 1)}%</td><td class="mt-cell-val"></td></tr>` : ''}
                    ${(data.headBuffs && data.headBuffs.warlordSpa > 0) ? `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Warlord Hat Accessory</td><td class="mt-cell-formula">-${fmt.fix(data.headBuffs.warlordSpa, 1)}%</td><td class="mt-cell-val"></td></tr>` : ''}
                    ${tagSpa !== 0 ? `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Tag Bonuses</td><td class="mt-cell-formula">${tagSpa > 0 ? '-' : '+'}${Math.abs(fmt.fix(tagSpa, 1))}%</td><td class="mt-cell-val"></td></tr>` : ''}
                    ${(() => {
            let html = '';
            if (data.detailedBuffs && data.detailedBuffs.passiveBreakdown && data.detailedBuffs.passiveBreakdown.length > 0) {
                data.detailedBuffs.passiveBreakdown.forEach(p => {
                    if (p.spa !== 0) html += `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ ${p.name}</td><td class="mt-cell-formula">${p.spa > 0 ? '-' : '+'}${Math.abs(fmt.fix(p.spa, 1))}%</td><td class="mt-cell-val"></td></tr>`;
                });
                const namedSpa = data.detailedBuffs.passiveBreakdown.reduce((sum, p) => sum + (p.spa || 0), 0);
                const rem = passiveSpa - namedSpa;
                if (Math.abs(rem) > 0.01) html += `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Unit Passive (Base)</td><td class="mt-cell-formula">${rem > 0 ? '-' : '+'}${Math.abs(fmt.fix(rem, 1))}%</td><td class="mt-cell-val"></td></tr>`;
            } else {
                if (passiveSpa !== 0) html = `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Unit Passive</td><td class="mt-cell-formula">${passiveSpa > 0 ? '-' : '+'}${Math.abs(fmt.fix(passiveSpa, 1))}%</td><td class="mt-cell-val"></td></tr>`;
            }
            return html;
        })()}
                    ${globalSpaBreakdownHtml}

                    <tr><td class="mt-cell-label">Cap Check (${data.spaCap}s)</td><td class="mt-cell-formula">MAX</td><td class="mt-cell-val calc-result">${fmt.fix(data.finalSpa, 3)}s</td></tr>
                </table>
            </div>`;
}

function renderDotSection(data, headDotRow) {
    if (data.dotData && data.dotData.inactive) {
        return `
        <div class="dd-section">
            <div class="dd-title text-accent-end"><span>6. Status Effect (DoT) Breakdown</span> <button class="calc-info-btn" onclick="openInfoPopup('dot_logic')">?</button></div>
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 12px; border-radius: 8px; color: #fca5a5; font-size: 0.75rem; text-align: center; margin-top: 8px; line-height: 1.4;">
                <b style="color: #ef4444; display: block; margin-bottom: 4px; font-size: 0.85rem;">⚠ DOT INACTIVE</b>
                This unit requires a teammate with <b style="color: #fff; text-decoration: underline;">${data.dotData.requirement}</b> DoT to enable its own status effects in Loadout Mode.
            </div>
        </div>`;
    }
    if (data.dot <= 0) return '';
    const db = data.dotData;
    const getFormula = (total, time) => {
        if (time === 0) return '';
        const isChief = data.baseStats?.id === 'revolutionary_chief_syncro';
        const label = isChief ? 'Continuous' : (Math.abs(time - data.spa) < 0.001 ? 'SPA' : 'Interval');
        if (isChief) return `<span class="text-dim">(${fmt.num(total / 9.0)} / 1.0s ${label})</span>`;
        return `<span class="text-dim">(${fmt.num(total)} / ${fmt.fix(time, 1)}s ${label})</span>`;
    };

    const isSpadeAce = data.baseStats?.id === 'ace' || window.isUnit?.(data.baseStats?.id, 'ace');

    const baseDot = data.baseStats?.dot || 0;
    const traitDot = data.traitObj?.dotBuff || 0;
    const setDot = data.totalSetStats?.dot || 0;
    const headDot = data.headBuffs?.dot || 0;
    const relicDot = data.relicBuffs?.dot || 0;

    const passiveDot = data.dotData?.passiveBonus || 0;
    const gearBonus = relicDot + setDot + headDot;
    const showSeparatePassiveRow = passiveDot > 0 && !(data.detailedBuffs?.passiveBreakdown?.some(p => p.dot === passiveDot));
    const bugMult = (data.baseStats?.id === 'ant_king_savage' || (window.isUnit && window.isUnit(data.baseStats?.id, 'ant_king_savage'))) ? 2 : 1;

    const combinedMultiplier = (1 + ((traitDot + gearBonus + passiveDot) * bugMult) / 100) * (db?.globalDotMult || 1.0);
    const baseDotPctVal = db?.nativeDps > 0 ? (db?.base || 0) : (data.baseStats?.customFollowUp?.dotPct || 0);
    const finalTickPct = baseDotPctVal * combinedMultiplier;

    if (data.headBuffs && data.headBuffs.type === 'ninja') {
        const uptimePct = (data.headBuffs.uptime || 0);
        headDotRow = `
        <tr class="mt-row-ninja"><td colspan="3" class="p-2">
            <div class="mt-flex-between mb-2">
                <span class="text-custom mt-text-bold text-xs tracking-sm">NINJA HEAD PASSIVE</span>
                <button class="calc-info-btn" onclick="openInfoPopup('ninja_passive')">?</button>
            </div>
            <div class="mt-flex-between text-xs text-white mb-1">
                <span class="opacity-70">Active Duration:</span>
                <span class="mt-font-mono mt-text-right text-white">10.0s</span>
            </div>
            <div class="mt-flex-between text-xs text-white mb-3">
                <span class="opacity-70">Uptime:</span>
                <span class="mt-font-mono mt-text-right ${uptimePct >= 1 ? 'mt-text-green' : 'mt-text-orange'}">${fmt.fix(uptimePct * 100, 1)}%</span>
            </div>
            <div class="mt-flex-between mt-border-top mt-pt-sm">
                <span class="text-white text-xs text-bold">Avg DoT Buff</span>
                <span class="text-custom text-sm mt-text-bold"> +${fmt.fix(data.headBuffs.dot, 2)}%</span>
            </div>
        </td></tr>`;
    }

    if (data.headBuffs && data.headBuffs.type === 'reanimated') {
        const uptimePct = (data.headBuffs.uptime || 0);
        headDotRow = `
        <tr class="mt-row-sungod"><td colspan="3" class="p-2">
            <div class="mt-flex-between mb-2">
                <span class="text-accent-end mt-text-bold text-xs tracking-sm">REANIMATED NINJA PASSIVE</span>
                <button class="calc-info-btn" onclick="openInfoPopup('reanimated_passive')">?</button>
            </div>
            <div class="mt-flex-between text-xs text-white mb-1">
                <span class="opacity-70">Range Stat:</span>
                <span class="mt-font-mono mt-text-right mt-text-range">${fmt.fix(data.range, 1)}</span>
            </div>
            <div class="mt-flex-between text-xs text-white mb-1">
                <span class="opacity-70">Trigger:</span>
                <span class="mt-font-mono mt-text-right text-white">Every 5th Attack (${fmt.fix(data.headBuffs.trigger, 1)}s)</span>
            </div>
            <div class="mt-flex-between text-xs text-white mb-1">
                <span class="opacity-70">Buff Duration:</span>
                <span class="mt-font-mono mt-text-right text-white">10.0s</span>
            </div>
            <div class="mt-flex-between text-xs text-white mb-3">
                <span class="opacity-70">Uptime:</span>
                <span class="mt-font-mono mt-text-right ${uptimePct >= 1 ? 'mt-text-green' : 'mt-text-orange'}">${fmt.fix(uptimePct * 100, 1)}%</span>
            </div>
            <div class="mt-flex-between mt-border-top mt-pt-sm">
                <span class="text-white text-xs text-bold">Avg DoT Buff</span>
                <span class="text-accent-end text-sm mt-text-bold"> +${fmt.fix(data.headBuffs.dot, 2)}%</span>
            </div>
        </td></tr>`;
    }

    if (data.headBuffs && data.headBuffs.type === 'flaming_donut') {
        headDotRow = `
        <tr class="mt-row-ninja" style="background: rgba(239, 68, 68, 0.05); border-left: 3px solid #ef4444;"><td colspan="3" class="p-2">
            <div class="mt-flex-between mb-2">
                <span class="mt-text-bold text-xs tracking-sm" style="color: #fca5a5;">FLAMING DONUT PASSIVE</span>
                <button class="calc-info-btn" onclick="openInfoPopup('flaming_donut_passive')">?</button>
            </div>
            <div class="mt-flex-between text-xs text-white mb-1">
                <span class="opacity-70">Damage Passive:</span>
                <span class="mt-font-mono mt-text-right text-white">+100% Dmg (Spade/Ace only)</span>
            </div>
            <div class="mt-flex-between text-xs text-white mb-3">
                <span class="opacity-70">Burn Multiplier:</span>
                <span class="mt-font-mono mt-text-right mt-text-green">${isSpadeAce ? '1.5x Multiplier (Active)' : '1.0x (Spade/Ace only)'}</span>
            </div>
            <div class="mt-flex-between mt-border-top mt-pt-sm">
                <span class="text-white text-xs text-bold">Applied DoT Multiplier</span>
                <span class="text-sm mt-text-bold" style="color: #fca5a5;"> ${isSpadeAce ? '×1.50' : '×1.00'}</span>
            </div>
        </td></tr>`;
    }

    return `
    <div class="dd-section">
        <div class="dd-title text-accent-end"><span>6. Status Effect (DoT) Breakdown</span> <button class="calc-info-btn" onclick="openInfoPopup('dot_logic')">?</button></div>
        <table class="calc-table">
            <tr><td class="mt-cell-label">Hit Ref ${db?.critMult > 1 ? '(Crit Avg)' : '(Non-Crit)'}</td><td class="mt-cell-val" colspan="2">${fmt.num(data.dmgVal * (db?.critMult || 1))}</td></tr>
            
            ${headDotRow}

            ${db?.nativeDps > 0 ? `
            <tr><td class="mt-cell-label mt-pt-md">Native Tick % Calculation</td><td class="mt-cell-formula mt-pt-md"></td><td class="mt-cell-val mt-pt-md mt-text-bold">${fmt.fix(finalTickPct, 1)}%</td></tr>
            ${baseDot > 0 ? `<tr><td class="mt-cell-label mt-pl-sm opacity-70">↳ Unit Base</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-xs text-white">${fmt.num(baseDot)}%</td></tr>` : ''}
            ${(() => {
                if (data.detailedBuffs && data.detailedBuffs.passiveBreakdown) {
                    let html = '';
                    const seen = new Set();
                    data.detailedBuffs.passiveBreakdown.forEach(p => {
                        if (p.dot > 0 && !seen.has(p.name)) {
                            html += `<tr><td class="mt-cell-label mt-pl-md text-dim text-xs">↳ ${p.name}</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">+${fmt.num(p.dot)}%</td></tr>`;
                            seen.add(p.name);
                        }
                    });
                    return html;
                }
                return '';
            })()}
            <tr><td class="mt-cell-label mt-pl-sm mt-text-bold text-custom">1. Trait Multiplier (${data.traitObj?.name || 'None'})</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-custom text-bold">${fmt.pct(traitDot)}</td></tr>
            <tr><td class="mt-cell-label mt-pl-sm mt-text-bold text-accent-end">2. Gear Multiplier (Relics/Set/Head)</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-accent-end text-bold">${fmt.pct(gearBonus)}</td></tr>
            ${(passiveDot > 0 && !(data.detailedBuffs?.passiveBreakdown?.some(p => p.dot === passiveDot))) ? `<tr><td class="mt-cell-label mt-pl-sm mt-text-bold text-white">3. Passive Bonus (Unit/Mode)</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-white text-bold">${fmt.pct(passiveDot)}</td></tr>` : ''}
            ${bugMult > 1 ? `<tr><td class="mt-cell-label mt-pl-md text-dim text-xs" style="color:#f87171 !important;">↳ Bugged Double Scaling (Ant King)</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-xs" style="color:#f87171 !important;">×2.0 Buffs</td></tr>` : ''}
            <tr class="mt-border-top"><td class="mt-cell-label mt-pl-sm mt-pt-sm text-bold text-gray">↳ Combined DoT Multiplier</td><td class="mt-cell-formula mt-pt-sm text-bold"><span class="op">×</span>${fmt.fix(combinedMultiplier, 3)}</td><td class="mt-cell-val"></td></tr>
            ${relicDot > 0 ? `<tr><td class="mt-cell-label mt-pl-md text-dim text-xs">• Relic Stats (Main+Sub)</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-xs text-dim">${fmt.pct(relicDot)}</td></tr>` : ''}
            ${setDot > 0 ? `<tr><td class="mt-cell-label mt-pl-md text-dim text-xs">• Set Bonus</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-xs text-dim">${fmt.pct(setDot)}</td></tr>` : ''}
            ${headDot > 0 ? `<tr><td class="mt-cell-label mt-pl-md text-dim text-xs">• Head Passive</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-xs text-dim">${fmt.pct(headDot)}</td></tr>` : ''}
            ${(data.headBuffs && data.headBuffs.type === 'flaming_donut' && isSpadeAce) ? `
            <tr><td class="mt-cell-label mt-pl-sm mt-text-bold" style="color: #fca5a5;">3. Flaming Donut Multiplier (Ace)</td><td class="mt-cell-formula mt-text-bold" style="color: #fca5a5;"><span class="op">×</span>1.50</td><td class="text-bold" style="color: #fca5a5;">1.5x Burn</td></tr>
            ` : ''}
            
            <tr><td class="mt-cell-label mt-pt-md">Final Native Tick %</td><td class="mt-cell-formula">=</td><td class="mt-cell-val calc-highlight">${fmt.fix(finalTickPct, 2)}%</td></tr>
            <tr><td class="mt-cell-label mt-pl-sm text-accent-end mt-pt-sm">↳ Total Damage</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-accent-end mt-pt-sm">${fmt.num(db.nativeTotalDmg)}</td></tr>
            ${data.baseStats?.dotDuration ? `
            <tr><td class="mt-cell-label mt-pl-md text-dim text-xs opacity-70">• Ticks Over Time</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">${data.baseStats.dotDuration} Ticks</td></tr>
            <tr><td class="mt-cell-label mt-pl-md text-dim text-xs opacity-70">• Damage Per Tick</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">${fmt.num(db.nativeTotalDmg / data.baseStats.dotDuration)}</td></tr>
            ` : ''}
          ${db?.isMultiHit ? `<tr><td class="mt-cell-label mt-pl-md text-custom">↳ Multi-Hit Proc (Astral)</td><td class="mt-cell-formula">x${data.baseStats?.hitCount}</td><td class="mt-cell-val text-custom">Active</td></tr>` : ''}
            <tr>
                <td class="mt-cell-label mt-pt-sm">Native DoT DPS</td>
                <td class="mt-cell-formula mt-pt-sm">${getFormula(db.nativeTotalDmg, db.nativeInterval)}</td>
                <td class="mt-cell-val mt-pt-sm">${fmt.num(db.nativeDps)}</td>
            </tr>
            ` : ''}

            ${db?.radDps > 0 ? `
            <tr>
                <td class="mt-cell-label text-accent-start mt-pt-md">Radiation DoT (${data.traitObj?.radiationPct || 20}% / 10s)</td>
                <td class="mt-cell-formula mt-pt-md">${getFormula(db.radTotalDmg, db.radInterval)}</td>
                <td class="mt-cell-val text-accent-start mt-pt-md">${fmt.num(db.radDps)} DPS</td>
            </tr>
            ` : ''}

            ${data.baseStats?.id === 'triple_threat' ? `
            <tr>
                <td class="mt-cell-label mt-pt-md mt-text-bold" style="color: #60a5fa">Brutal Slashes Follow-Up Bleed</td>
                <td class="mt-cell-formula mt-pt-md"></td>
                <td class="mt-cell-val mt-pt-md mt-text-bold" style="color: #60a5fa">${fmt.num(db.fuaDotDps || 0)} DPS</td>
            </tr>
            <tr><td class="mt-cell-label mt-pl-sm text-dim text-xs">• Trigger Cooldown</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-xs text-white">Every 15.0s</td></tr>
            <tr><td class="mt-cell-label mt-pl-sm text-dim text-xs">• Bleed Proc</td><td class="mt-cell-formula">Hit Dmg × ${((data.upgradeLevel >= 6) ? 120 : 100)}%</td><td class="mt-cell-val text-xs text-gold">${fmt.num(db.fuaDotTotalDmg)}</td></tr>
            ${(db.fuaDotDps || 0) === 0 ? `
            <tr>
                <td colspan="3" class="pt-1 pb-1" style="font-size: 0.72rem; color: #f87171; line-height: 1.35; padding-left: 12px;">
                    ↳ <i>Disabled: Requires <b>Astral</b> trait to stack Bleed.</i>
                </td>
            </tr>` : ''}
            ` : (db?.fuaDotDps > 0 ? `
            <tr><td class="mt-cell-label mt-pt-md mt-text-bold" style="color: #60a5fa">${db.fuaLabel || 'Follow-Up DoT'} Calculation</td><td class="mt-cell-formula mt-pt-md"></td><td class="mt-cell-val mt-pt-md mt-text-bold" style="color: #60a5fa"></td></tr>
            <tr><td class="mt-cell-label mt-pl-sm opacity-70">↳ Base Tick %</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-xs text-white">${fmt.num(baseDotPctVal)}%</td></tr>
            <tr><td class="mt-cell-label mt-pl-sm mt-text-bold text-custom">1. Trait Multiplier (${data.traitObj?.name || 'None'})</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-custom text-bold">${fmt.pct(traitDot)}</td></tr>
            <tr><td class="mt-cell-label mt-pl-sm mt-text-bold text-accent-end">2. Gear Multiplier (Relics/Set/Head)</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-accent-end text-bold">${fmt.pct(gearBonus)}</td></tr>
            <tr class="mt-border-top"><td class="mt-cell-label mt-pl-sm mt-pt-sm text-bold text-gray">↳ Combined DoT Multiplier</td><td class="mt-cell-formula mt-pt-sm text-bold"><span class="op">×</span>${fmt.fix(combinedMultiplier, 3)}</td><td class="mt-cell-val"></td></tr>
            ${relicDot > 0 ? `<tr><td class="mt-cell-label mt-pl-md text-dim text-xs">• Relic Stats (Main+Sub)</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-xs text-dim">${fmt.pct(relicDot)}</td></tr>` : ''}
            ${setDot > 0 ? `<tr><td class="mt-cell-label mt-pl-md text-dim text-xs">• Set Bonus</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-xs text-dim">${fmt.pct(setDot)}</td></tr>` : ''}
            ${headDot > 0 ? `<tr><td class="mt-cell-label mt-pl-md text-dim text-xs">• Head Passive</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-xs text-dim">${fmt.pct(headDot)}</td></tr>` : ''}
            ${(data.headBuffs && data.headBuffs.type === 'flaming_donut' && isSpadeAce) ? `
            <tr><td class="mt-cell-label mt-pl-sm mt-text-bold" style="color: #fca5a5;">3. Flaming Donut Multiplier (Ace)</td><td class="mt-cell-formula mt-text-bold" style="color: #fca5a5;"><span class="op">×</span>1.50</td><td class="text-bold" style="color: #fca5a5;">1.5x Burn</td></tr>
            ` : ''}
            
            <tr><td class="mt-cell-label mt-pt-md">Final Tick %</td><td class="mt-cell-formula">=</td><td class="mt-cell-val calc-highlight">${fmt.fix(finalTickPct, 2)}%</td></tr>
            <tr><td class="mt-cell-label mt-pl-sm text-accent-end mt-pt-sm">↳ Total Damage Per Proc</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-accent-end mt-pt-sm">${fmt.num(db.fuaDotTotalDmg)}</td></tr>
            <tr><td class="mt-cell-label mt-pl-md text-dim text-xs opacity-70">• DoT Duration</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">${db.fuaDotDuration} Ticks</td></tr>
            <tr><td class="mt-cell-label mt-pl-md text-dim text-xs opacity-70">• Damage Per Tick</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">${fmt.num(db.fuaDotTotalDmg / db.fuaDotDuration)}</td></tr>
            <tr><td class="mt-cell-label mt-pl-md text-dim text-xs opacity-70">• Trigger Chance</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">${db.fuaChance != null ? db.fuaChance.toFixed(0) : 'N/A'}%</td></tr>
            <tr><td class="mt-cell-label mt-pl-md text-dim text-xs opacity-70">• Avg Applications / Sec</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">${fmt.fix(db.dotApplicationRate, 2)}</td></tr>
            
            <tr>
                <td class="mt-cell-label mt-pt-sm" style="color: #60a5fa; font-weight: 700;">Follow-Up DoT DPS</td>
                <td class="mt-cell-formula mt-pt-sm"><span class="text-dim">(${fmt.num(db.fuaDotTotalDmg)} / ${fmt.fix(db.fuaDotTotalDmg / db.fuaDotDps, 2)}s Interval)</span></td>
                <td class="mt-cell-val mt-pt-sm" style="color: #60a5fa; font-weight: 700;">${fmt.num(db.fuaDotDps)}</td>
            </tr>
            ` : '')}

            ${db?.scarfBurnDps > 0 ? `
            <tr>
                <td class="mt-cell-label mt-pt-md mt-text-bold" style="color: #fb923c">Mochi Scarf Burn DoT (${db.scarfBurnDuration || 5}s)</td>
                <td class="mt-cell-formula mt-pt-md">${getFormula(data.headBuffs.totalScarfBurnDmg, db.scarfInterval)}</td>
                <td class="mt-cell-val mt-text-bold mt-pt-md" style="color: #fb923c">${fmt.num(db.scarfBurnDps)} DPS</td>
            </tr>
            <tr><td class="mt-cell-label mt-pl-sm text-dim text-xs">• Condition</td><td class="mt-cell-formula"></td><td class="text-xs text-white">${fmt.num(db.scarfBurnTotalDmg)}</td></tr>
            ` : ''}

            <tr class="mt-border-top">
                <td class="mt-cell-label text-white mt-pt-md">Total DoT (1 Unit)</td>
                <td class="mt-cell-formula mt-pt-md"></td>
                <td class="mt-cell-val text-white mt-pt-md">${fmt.num((db?.nativeDps || 0) + (db?.radDps || 0) + (db?.fuaDotDps || 0) + (db?.scarfBurnDps || 0))}</td>
            </tr>
            ${data.placement > 1 ? `
            <tr>
                <td class="mt-cell-label text-gold">Total x${data.placement} Units ${data.hasStackingDoT ? '' : '<small class="opacity-50">(Non-Stacking)</small>'}</td>
                <td class="mt-cell-formula">${data.hasStackingDoT ? '×' + data.placement : 'MAX'}</td>
                <td class="mt-cell-val text-gold">${fmt.num(data.dot)}</td>
            </tr>` : ''}
        </table>
    </div>`;
}

function renderAttackRateSection(data) {
    const isSyncro = window.isUnit?.(data.baseStats?.id, 'fused_warrior_super_syncro');
    if (isSyncro) {
        const f = data.baseStats?.customFollowUp || {};
        const ea = data.extraAttacks || {};
        const critRate = data.critData?.rate ?? 0;
        const fuaChance = f.chance ?? ea.fuaChance ?? 25;
        const fuaDmgMult = f.dmgMult ?? ea.fuaDmgMult ?? 1;
        const critGatedExtra = (critRate / 100) * (fuaChance / 100) * fuaDmgMult;
        const attackMult = ea.mult ?? (1 + critGatedExtra);
        const baseHitDps = (data.dmgVal * (data.critData?.avgMult || 1) / (data.finalSpa || data.spa || 1)) * (data.placement || 1);
        const critGatedDps = baseHitDps * critGatedExtra;
        const abilities = (data.baseStats?.ability || []).filter(ab => ab.noToggle && ab.dmgMult && ab.cooldown);
        const abilityRows = abilities.map(ab => {
            const abDmg = data.dmgVal * ab.dmgMult * (data.critData?.avgMult || 1);
            const abDps = (abDmg / ab.cooldown) * (data.placement || 1);

            return `
                <tr><td class="mt-cell-label text-custom" style="font-weight: 700;">${ab.abilityName || 'Ability Follow-Up'}</td><td class="mt-cell-formula">Every ${ab.cooldown}s · Can Crit</td><td class="mt-cell-val" style="color: #4ade80;">${fmt.num(abDps)} DPS</td></tr>
                <tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Ability Damage</td><td class="mt-cell-formula">${fmt.fix(ab.dmgMult * 100, 1)}% × Avg Crit Mult</td><td class="mt-cell-val">${fmt.num(abDmg)}</td></tr>
            `;
        }).join('');
        const totalAbilityDps = abilities.reduce((sum, ab) => sum + ((data.dmgVal * ab.dmgMult * (data.critData?.avgMult || 1) / ab.cooldown) * (data.placement || 1)), 0);

        return `
            <div class="dd-section" style="border-left: 3px solid #4ade80;">
                <div class="dd-title mt-text-green"><span>5. Crit-Gated Follow-Up (On Crit)</span> <button class="calc-info-btn" onclick="openInfoPopup('attack_rate')">?</button></div>
                <table class="calc-table">
                    <tr><td class="mt-cell-label">Trigger Formula</td><td class="mt-cell-formula">Crit Rate × ${fmt.fix(fuaChance, 1)}% FUA</td><td class="mt-cell-val text-custom">${fmt.fix(critRate, 1)}% × ${fmt.fix(fuaChance, 1)}%</td></tr>
                    <tr><td class="mt-cell-label opacity-70 mt-pl-md">↳ Crit Rate / ${fmt.fix(100 / fuaChance, 0)}</td><td class="mt-cell-formula">${fmt.fix(critRate, 1)}% / ${fmt.fix(100 / fuaChance, 0)}</td><td class="mt-cell-val opacity-70">${fmt.fix(critGatedExtra * 100, 1)}% Avg Attack Mult</td></tr>
                    <tr><td class="mt-cell-label text-accent-start">Average FUA Damage Added</td><td class="mt-cell-formula">Base Hit DPS × Extra Mult</td><td class="mt-cell-val text-accent-start">${fmt.num(baseHitDps)} × ${fmt.fix(critGatedExtra, 3)}</td></tr>
                    <tr><td class="mt-cell-label text-accent-start">Crit-Gated FUA DPS</td><td class="mt-cell-formula">Base Hit DPS × (Crit × FUA Chance)</td><td class="mt-cell-val text-accent-start">${fmt.num(critGatedDps)} DPS</td></tr>
                    <tr class="mt-border-top">
                        <td class="mt-cell-label mt-pt-sm text-white" style="font-weight: 900;">Final Attack Mult</td>
                        <td class="mt-cell-formula mt-pt-sm">1 + (Crit Rate × FUA Chance × FUA Mult)</td>
                        <td class="mt-cell-val mt-pt-sm calc-highlight" style="font-size: 1.15rem; color: #4ade80;">x${fmt.fix(attackMult, 3)}</td>
                    </tr>
                </table>
            </div>
            <div class="dd-section" style="border-left: 3px solid #4ade80;">
                <div class="dd-title mt-text-green"><span>6. Ability Follow-Up Attacks</span></div>
                <table class="calc-table">
                    ${abilityRows || '<tr><td colspan="3" class="mt-cell-label opacity-50">No no-toggle ability follow-ups found.</td></tr>'}
                    <tr class="mt-border-top">
                        <td class="mt-cell-label mt-pt-sm text-white" style="font-weight: 900;">Total Ability DPS Added</td>
                        <td class="mt-cell-formula mt-pt-sm"></td>
                        <td class="mt-cell-val mt-pt-sm calc-highlight" style="font-size: 1.15rem; color: #4ade80;">${fmt.num(totalAbilityDps)} DPS</td>
                    </tr>
                </table>
            </div>`;
    }

    if (data.baseStats?.customFollowUp) {
        const f = data.baseStats.customFollowUp;
        const ea = data.extraAttacks;
        const cooldown = f.cooldown;

        if (cooldown) {
            if (f.nextAttack && ea) {
                if (!ea.hitsInCycle) return '';
                const { hitsInCycle, cycleDuration, totalDmgInCycle, hitsMult } = ea;
                const speedPenalty = (hitsInCycle * data.finalSpa) / cycleDuration;

                return `
                    <div class="dd-section" style="border-left: 3px solid #4ade80;">
                        <div class="dd-title mt-text-green"><span>5. Attack Cycle Snapping (Threshold: ${cooldown}s)</span> <button class="calc-info-btn" onclick="openInfoPopup('attack_rate')">?</button></div>
                        <table class="calc-table">
                            <tr><td class="mt-cell-label">Interval (SPA)</td><td class="mt-cell-formula"></td><td class="mt-cell-val">${fmt.fix(data.finalSpa, 3)}s</td></tr>
                            <tr><td class="mt-cell-label text-custom">Hits per Proc</td><td class="mt-cell-formula">Ceil(${cooldown}s / SPA)</td><td class="mt-cell-val text-custom">${hitsInCycle} Hits</td></tr>
                            <tr><td class="mt-cell-label opacity-70 mt-pl-md">↳ Hits Multiplier</td><td class="mt-cell-formula">(${hitsInCycle} + ${f.dmgMult}) / ${hitsInCycle}</td><td class="mt-cell-val opacity-70">x${hitsMult.toFixed(2)}</td></tr>
                            <tr class="mt-border-top">
                                <td class="mt-cell-label">Total Cycle Duration</td>
                                <td class="mt-cell-formula">(${hitsInCycle} × SPA) + ${f.fuaAnimation}s Lock</td>
                                <td class="mt-cell-val text-white font-bold">${fmt.fix(cycleDuration, 2)}s</td>
                            </tr>
                            <tr><td class="mt-cell-label opacity-70 mt-pl-md">↳ Lock Speed Penalty</td><td class="mt-cell-formula">(${hitsInCycle} × SPA) / Duration</td><td class="mt-cell-val opacity-70">x${speedPenalty.toFixed(3)}</td></tr>
                            <tr class="mt-border-top">
                                <td class="mt-cell-label mt-pt-sm text-white" style="font-weight: 900;">Final Attack Mult</td>
                                <td class="mt-cell-formula mt-pt-sm">Hits Mult × Speed Penalty</td>
                                <td class="mt-cell-val mt-pt-sm calc-highlight" style="font-size: 1.15rem; color: #4ade80;">x${fmt.fix(ea?.mult, 3)}</td>
                            </tr>
                        </table>
                        <div class="text-xs mt-2 opacity-50" style="font-style: italic; padding-left: 5px;">Wait ${cooldown}s → Trigger extra attack on the next available hit.</div>
                    </div>`;
            }
            return ea ? `
                <div class="dd-section" style="border-left: 3px solid #4ade80;">
                    <div class="dd-title mt-text-green"><span>5. Follow-Up Cooldown Logic</span></div>
                    <table class="calc-table">
                        <tr><td class="mt-cell-label">Cooldown</td><td class="mt-cell-formula"></td><td class="mt-cell-val">${cooldown}s</td></tr>
                        <tr><td class="mt-cell-label">Final Attack Mult</td><td class="mt-cell-formula"></td><td class="mt-cell-val calc-highlight">x${fmt.fix(ea.mult, 3)}</td></tr>
                    </table>
                </div>` : '';
        } else {
            return `
                <div class="dd-section" style="border-left: 3px solid #4ade80;">
                    <div class="dd-title mt-text-green"><span>5. Attack Rate Multiplier (On-Attack)</span> <button class="calc-info-btn" onclick="openInfoPopup('attack_rate')">?</button></div>
                    <table class="calc-table">
                        ${!ea ? '<tr><td colspan="3" class="mt-cell-label opacity-50">Follow-up data unavailable for this mode.</td></tr>' : `
                        <tr><td class="mt-cell-label">Primary Target Hits</td><td class="mt-cell-formula"></td><td class="mt-cell-val">1.0</td></tr>
                        <tr><td class="mt-cell-label text-custom">Follow-Up Chance</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-custom">${ea.req}</td></tr>
                        <tr><td class="mt-cell-label text-accent-start">Follow-Up Multiplier</td><td class="mt-cell-formula">+</td><td class="mt-cell-val text-accent-start">+${fmt.fix(ea.extra, 2)}</td></tr>
                        <tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Animation Adj. SPA</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-accent-start">${fmt.fix(ea.usedSpa, 3)}s</td></tr>
                        <tr class="mt-border-top">
                            <td class="mt-cell-label mt-pt-sm text-white" style="font-weight: 900;">Final Attack Mult</td>
                            <td class="mt-cell-formula mt-pt-sm">1 + (Chance × Mult)</td>
                            <td class="mt-cell-val mt-pt-sm calc-highlight" style="font-size: 1.15rem; color: #4ade80;">x${fmt.fix(data.extraAttacks ? data.extraAttacks.mult : 1, 3)}</td>
                        </tr>
                        `}
                   </table>
                </div>`;
        }
    }

    const isFW = (window.isUnit?.(data.baseStats?.id, 'ultimate_fused_warrior') || window.isUnit?.(data.baseStats?.id, 'fused_warrior') || (data.baseStats?.id && data.baseStats.id.toLowerCase().includes('fused'))) && !window.isUnit?.(data.baseStats?.id, 'fused_warrior_super_syncro');
    if (isFW && data.extraAttacks) {
        const ea = data.extraAttacks;
        const eLevel = data.upgradeLevel !== undefined ? data.upgradeLevel : 6;
        const fua2Chance = (eLevel >= 2) ? 70 : 50;

        return `
            <div class="dd-section" style="border-left: 3px solid #4ade80;">
                <div class="dd-title mt-text-green"><span>5. Fused Godly Might Multiplier</span> <button class="calc-info-btn" onclick="openInfoPopup('attack_rate')">?</button></div>
                <table class="calc-table">
                    <tr><td class="mt-cell-label">Primary Attack Hit</td><td class="mt-cell-formula">Base Strike</td><td class="mt-cell-val">1.0 Hits</td></tr>
                    <tr><td class="mt-cell-label text-custom">1st Follow-Up Attack (Guaranteed)</td><td class="mt-cell-formula">100% Proc Rate</td><td class="mt-cell-val text-custom">+1.0 Hits</td></tr>
                    <tr><td class="mt-cell-label text-accent-start">2nd Follow-Up Attack (Chance)</td><td class="mt-cell-formula">${fua2Chance}% Proc (E${eLevel >= 2 ? '2+' : '0-1'})</td><td class="mt-cell-val text-accent-start">+${fua2Chance / 100} Hits</td></tr>
                    <tr class="mt-border-top">
                        <td class="mt-cell-label text-white">Average Hits per Cycle</td>
                        <td class="mt-cell-formula">1.0 + 1.0 + ${fua2Chance / 100}</td>
                        <td class="mt-cell-val text-white font-bold">${fmt.fix(ea.mult, 2)} Hits</td>
                    </tr>
                    <tr>
                        <td class="mt-cell-label text-accent-end">Animation Cap Protection</td>
                        <td class="mt-cell-formula">Effective Cap</td>
                        <td class="mt-cell-val text-accent-end">${fmt.fix(data.spaCap, 2)}s Lock</td>
                    </tr>
                    <tr class="mt-border-top">
                        <td class="mt-cell-label mt-pt-sm text-white" style="font-weight: 900;">Final Attack Mult</td>
                        <td class="mt-cell-formula mt-pt-sm">Expected Hits / Attack</td>
                        <td class="mt-cell-val mt-pt-sm calc-highlight" style="font-size: 1.15rem; color: #4ade80;">x${fmt.fix(ea.mult, 2)}</td>
                    </tr>
                </table>
            </div>`;
    }

    if (data.baseStats?.id === 'triple_threat') {
        const baseDmgNoAdditive = data.dmgVal / (1 + data.totalAdditivePct / 100);
        const fuaHitNormal = baseDmgNoAdditive * Math.max(0, 1 + ((data.totalAdditivePct || 0) - 25) / 100);
        const fuaDmg = fuaHitNormal * (data.critData?.avgMult || 1);

        const singleBaseHitDps = (data.dmgVal * (data.critData?.avgMult || 1)) / data.spa;
        const totalBaseHitDps = singleBaseHitDps * data.placement;
        const singleFuaDps = fuaDmg / 15;
        const totalFuaDps = singleFuaDps * data.placement;

        return `
            <div class="dd-section" style="border-left: 3px solid #60a5fa;">
                <div class="dd-title text-custom" style="color: #60a5fa !important;"><span>5. Follow-Up Attack (Brutal Slashes)</span> <button class="calc-info-btn" onclick="openInfoPopup('tag_logic')">?</button></div>
                <table class="calc-table">
                    <tr><td class="mt-cell-label">Trigger Condition</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-white">Hit Enemy with Critical Bleed</td></tr>
                    <tr><td class="mt-cell-label">Trigger Cooldown</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-white">Every 15.0s</td></tr>
                    <tr><td class="mt-cell-label">Follow-Up Damage</td><td class="mt-cell-formula">Hit Dmg (Passives -25%)</td><td class="mt-cell-val text-gold">${fmt.num(fuaDmg)}</td></tr>
                    
                    <tr class="mt-border-top">
                        <td class="mt-cell-label mt-pt-sm text-white">Single FUA Hit DPS</td>
                        <td class="mt-cell-formula">${fmt.num(fuaDmg)} / 15s</td>
                        <td class="mt-cell-val mt-pt-sm text-white">${fmt.num(singleFuaDps)}</td>
                    </tr>
                    <tr>
                        <td class="mt-cell-label text-accent-start">Total FUA DPS (x${data.placement})</td>
                        <td class="mt-cell-formula">${fmt.num(singleFuaDps)} × ${data.placement}</td>
                        <td class="mt-cell-val text-accent-start font-bold" style="font-size: 1.05rem;">${fmt.num(totalFuaDps)}</td>
                    </tr>
                </table>
            </div>`;
    }

    if (data.baseStats?.id === 'strongest_swordsman_hunter' && data.extraAttacks) {
        const ea = data.extraAttacks;
        return `
            <div class="dd-section" style="border-left: 3px solid #4ade80;">
                <div class="dd-title mt-text-green"><span>5. Sword Stances Rotation Analysis</span> <button class="calc-info-btn" onclick="openInfoPopup('attack_rate')">?</button></div>
                <table class="calc-table">
                    <tr>
                        <td class="mt-cell-label">Stance 1 & 3 (6 Normal Attacks)</td>
                        <td class="mt-cell-formula">Crit: ${fmt.fix(ea.unbuffedCrit, 1)}%</td>
                        <td class="mt-cell-val" style="color: #94a3b8;">${fmt.num(ea.unbuffedHitVal)} Avg Hit</td>
                    </tr>
                    <tr>
                        <td class="mt-cell-label text-custom" style="font-weight: 700;">Stance 2 (3 Buffed Attacks)</td>
                        <td class="mt-cell-formula text-custom" style="font-weight: 700;">+60% Dmg / +20% Crit</td>
                        <td class="mt-cell-val text-custom" style="font-weight: 700;">${fmt.num(ea.buffedHitVal)} Avg Hit</td>
                    </tr>
                    <tr class="mt-border-top">
                        <td class="mt-cell-label">Equivalent Cycle Damage</td>
                        <td class="mt-cell-formula">6 × Unbuffed + 3 × Buffed</td>
                        <td class="mt-cell-val text-white font-bold">${fmt.num((6 * ea.unbuffedHitVal) + (3 * ea.buffedHitVal))}</td>
                    </tr>
                    <tr>
                        <td class="mt-cell-label">Primary Attack Cost (Equivalent)</td>
                        <td class="mt-cell-formula">6 Base Normal Attacks</td>
                        <td class="mt-cell-val text-gray">6.0</td>
                    </tr>
                    <tr class="mt-border-top">
                        <td class="mt-cell-label text-white mt-pt-sm">Final Stance DPS Multiplier</td>
                        <td class="mt-cell-formula mt-pt-sm">Total Dmg / 6 Hits</td>
                        <td class="mt-cell-val mt-pt-sm calc-highlight" style="font-size: 1.15rem; color: #4ade80;">x${fmt.fix(ea.mult, 3)}</td>
                    </tr>
                </table>
            </div>`;
    }

    // Render dedicated section for units with noToggle abilities tracked in the ability array
    const noToggleAbilities = (data.baseStats?.ability || []).filter(ab => ab.noToggle && ab.dmgMult && ab.cooldown);
    if (noToggleAbilities.length > 0) {
        const abilityRows = noToggleAbilities.map(ab => {
            const abDmg = data.dmgVal * ab.dmgMult * (data.critData?.avgMult || 1);
            const abDps = abDmg / ab.cooldown;
            return `
                <tr><td class="mt-cell-label text-custom" style="font-weight:700;">${ab.abilityName || 'Ability Follow-Up'}</td><td class="mt-cell-formula">Every ${ab.cooldown}s</td><td class="mt-cell-val" style="color:#4ade80;">${fmt.num(abDps * (data.placement || 1))} DPS</td></tr>
                <tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Ability Damage (${ab.dmgMult * 100}% × Avg Crit Mult)</td><td class="mt-cell-formula"></td><td class="mt-cell-val">${fmt.num(abDmg)}</td></tr>
            `;
        }).join('');
        return `
            <div class="dd-section" style="border-left: 3px solid #4ade80;">
                <div class="dd-title mt-text-green"><span>5. Ability Follow-Up Attacks</span></div>
                <table class="calc-table">
                    ${abilityRows}
                    <tr class="mt-border-top">
                        <td class="mt-cell-label mt-pt-sm text-white" style="font-weight: 900;">Total Ability DPS Added</td>
                        <td class="mt-cell-formula"></td>
                        <td class="mt-cell-val mt-pt-sm calc-highlight" style="font-size: 1.15rem; color: #4ade80;">${fmt.num(noToggleAbilities.reduce((sum, ab) => sum + (data.dmgVal * ab.dmgMult * (data.critData?.avgMult || 1) / ab.cooldown) * (data.placement || 1), 0))}</td>
                    </tr>
                </table>
            </div>`;
    }

    if (!data.extraAttacks) return '';
    const isKS = window.isUnit?.(data.baseStats?.id, 'king_sailor');
    const isAD = window.isUnit?.(data.baseStats?.id, 'alpha_devil');

    let detailRows = '';
    if (isKS) {
        detailRows = `
            <tr class="mt-border-top"><td class="mt-cell-label mt-pt-md">Chain Logic</td><td class="mt-cell-formula mt-pt-md">1 Tick × 20% (Non-Crit)</td><td class="mt-cell-val mt-pt-md"></td></tr>
            <tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Base Tick Dmg</td><td class="mt-cell-formula"></td><td class="mt-cell-val">${fmt.num(data.extraAttacks.tickDmgVal)}</td></tr>
            <tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Total Chain Output</td><td class="mt-cell-formula"><span class="op">×</span>1</td><td class="mt-cell-val text-gold">${fmt.num(data.extraAttacks.totalChain)}</td></tr>
        `;
    } else if (isAD) {
        detailRows = `
            <tr class="mt-border-top"><td class="mt-cell-label mt-pt-md">Sword Logic</td><td class="mt-cell-formula mt-pt-md">(200% Dmg * Crit) / 20s</td><td class="mt-cell-val mt-pt-md"></td></tr>
            <tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Avg Sword DPS</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-gold">${fmt.num(data.extraAttacks.swordDps)}</td></tr>
        `;
    }

    const extraHits = (data.extraAttacks ? data.extraAttacks.extra : 0);

    return `
        <div class="dd-section" style="border-left: 3px solid #4ade80;">
            <div class="dd-title mt-text-green"><span>5. Attack Rate Multiplier</span> <button class="calc-info-btn" onclick="openInfoPopup('attack_rate')">?</button></div>
            <table class="calc-table">
                <tr><td class="mt-cell-label">Primary Target Hits</td><td class="mt-cell-formula"></td><td class="mt-cell-val">1.0</td></tr>
                ${extraHits > 0 ? `<tr><td class="mt-cell-label">${data.baseStats?.customFollowUp ? 'Follow-Up Multiplier' : 'Extra Hits (Equiv)'}</td><td class="mt-cell-formula">+</td><td class="mt-cell-val">${fmt.fix(extraHits, 2)}</td></tr>` : ''}
                ${detailRows}

                <tr class="mt-border-top">
                    <td class="mt-cell-label mt-pt-sm text-white">Final Attack Mult</td>
                    <td class="mt-cell-formula"></td>
                    <td class="mt-cell-val mt-pt-sm calc-highlight" style="font-size: 1.15rem; color: #4ade80;">x${fmt.fix(data.extraAttacks ? data.extraAttacks.mult : 1, 3)}</td>
                </tr>
            </table>
        </div>`;
}

function renderFinalSection(data) {
    const hitLabel = data.placement > 1 ? `Hit DPS (x${data.placement} Units)` : `Hit DPS`;
    const singleHit = data.hit / (data.placement || 1);
    const hitFormula = data.placement > 1 ? `${fmt.num(singleHit)} <span class="op">×</span> ${data.placement}` : ``;
    const isNutaru = window.isUnit?.(data.baseStats?.id, 'nutaru_beast');
    const isTripleThreat = data.baseStats?.id === 'triple_threat';

    let tripleThreatFollowUpHtml = '';
    if (isTripleThreat) {
        const baseDmgNoAdditive = data.dmgVal / (1 + data.totalAdditivePct / 100);
        const fuaHitNormal = baseDmgNoAdditive * Math.max(0, 1 + ((data.totalAdditivePct || 0) - 25) / 100);
        const fuaDmg = fuaHitNormal * (data.critData?.avgMult || 1);

        const singleBaseHitDps = (data.dmgVal * (data.critData?.avgMult || 1)) / data.spa;
        const totalBaseHitDps = singleBaseHitDps * data.placement;
        const singleFuaDps = fuaDmg / 15;
        const totalFuaDps = singleFuaDps * data.placement;

        tripleThreatFollowUpHtml = `
            <tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Base Hit DPS</td><td class="mt-cell-formula">${fmt.num(singleBaseHitDps)} <span class="op">×</span> ${data.placement}</td><td class="mt-cell-val opacity-70">${fmt.num(totalBaseHitDps)}</td></tr>
            <tr><td class="mt-cell-label mt-pl-md text-accent-start" style="font-weight: 700;">↳ Brutal Slashes Follow-Up (-25% Passive / 15s)</td><td class="mt-cell-formula text-accent-start">${fmt.num(singleFuaDps)} <span class="op">×</span> ${data.placement}</td><td class="mt-cell-val text-accent-start" style="font-weight: 700;">${fmt.num(totalFuaDps)}</td></tr>
        `;
    }

    let debuffsHtml = '';
    if (data.appliedDebuffs && data.appliedDebuffs.length > 0) {
        data.appliedDebuffs.forEach(d => {
            debuffsHtml += `
                <tr>
                    <td class="mt-cell-label mt-pl-sm text-accent-start">↳ Multiplier: ${d.label}</td>
                    <td class="mt-cell-formula">Applied</td>
                    <td class="mt-cell-val text-accent-start">×${d.val.toFixed(2)}</td>
                </tr>`;
        });
    }

    return `
            <div class="dd-section border-l-gold">
                <div class="dd-title text-gold">Final Synthesis</div>
                <table class="calc-table">
                    <tr><td class="mt-cell-label">${hitLabel}</td><td class="mt-cell-formula">${hitFormula}</td><td class="mt-cell-val calc-highlight">${fmt.num(data.hit)}</td></tr>
                    ${tripleThreatFollowUpHtml}
                    ${data.trueDmgPct > 0 ? `
                        <tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Normal Damage (${Math.max(0, 100 - (data.trueDmgPct || 0)).toFixed(0)}%)</td><td class="mt-cell-formula"></td><td class="mt-cell-val opacity-70">${fmt.num(data.normalDmgVal)}</td></tr>
                        <tr><td class="mt-cell-label mt-pl-md text-accent-start">↳ True Damage (${data.trueDmgPct.toFixed(0)}%)</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-accent-start">${fmt.num(data.trueDmgVal)}</td></tr>
                    ` : ''}
                    ${data.dot > 0 ? `<tr><td class="mt-cell-label">DoT DPS</td><td class="mt-cell-formula">+</td><td class="mt-cell-val text-accent-end">${fmt.num(data.dot)}</td></tr>` : ''}
                    ${debuffsHtml}
                    ${(data.bossTotal && data.bossTotal > data.total) ? `
                    <tr>
                        <td class="mt-cell-label text-accent-start mt-pt-sm" style="font-size: 0.95rem; font-weight: 700;">↳ Boss Multiplier</td>
                        <td class="mt-cell-formula mt-pt-sm"><span class="op">×</span></td>
                        <td class="mt-cell-val text-accent-start mt-pt-sm" style="font-size: 1.1rem; font-weight: 800;">${fmt.fix(data.bossMult, 2)}</td>
                    </tr>
                    <tr>
                        <td class="mt-cell-label mt-pt-sm" style="font-size: 1.0rem; font-weight: 700;">= Boss DPS</td>
                        <td class="mt-cell-formula mt-pt-sm"></td>
                        <td class="mt-cell-val mt-pt-sm" style="font-size: 1.1rem; font-weight: 800;">${fmt.num(data.bossTotal - (data.summon || 0))}</td>
                    </tr>` : ''}
                    ${data.summon > 0 ? `<tr><td class="mt-cell-label">${isNutaru ? 'Clone' : (data.summonData?.isCustom ? 'Custom Summon' : 'Plane')} DPS</td><td class="mt-cell-formula">+</td><td class="mt-cell-val text-accent-start">${fmt.num(data.summon)}</td></tr>` : ''}
                    <tr>
                        <td class="mt-cell-label text-white mt-pt-md" style="font-size: 1.1rem; font-weight: 800;">TOTAL DPS</td>
                        <td class="mt-cell-formula"></td>
                        <td class="mt-cell-val mt-text-gold mt-pt-md" style="font-size: 1.2rem;">${fmt.num(data.bossTotal && data.bossTotal > data.total ? data.bossTotal : data.total)}</td>
                    </tr>
                </table>
            </div>`;
}

function renderRangeSection(data) {
    const baseRange = data.baseStats?.range || 0;
    const traitRange = data.traitBuffs?.range || 0;
    const relicRange = data.relicBuffs?.range || 0;
    const setRange = data.totalSetStats?.range || 0;
    const passiveRange = (data.passiveRange || 0);

    let globalRangeHtml = '';
    if (data.activeGlobalBuffs && window.GLOBAL_BUFF_DATA) {
        Object.values(window.GLOBAL_BUFF_DATA).forEach(buff => {
            const bData = data.activeGlobalBuffs[buff.id];
            if (bData && bData.range) {
                globalRangeHtml += `<tr><td class="mt-cell-label mt-pl-md opacity-70" style="color:${buff.color};">↳ ${buff.name}</td><td class="mt-cell-formula" style="color:${buff.color};">+${fmt.fix(bData.range, 1)}%</td><td class="mt-cell-val"></td></tr>`;
            }
        });
    }

    return `
        <div class="dd-section">
            <div class="dd-title mt-text-range"><span>4. Range Calculation</span></div>
            <table class="calc-table">
                <tr><td class="mt-cell-label">Base Range</td><td class="mt-cell-formula"></td><td class="mt-cell-val">${fmt.fix(baseRange, 1)}</td></tr>
                ${data.rangePoints > 0 ? `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Stat Points (${data.rangePoints} pts)</td><td class="mt-cell-formula">×${fmt.fix(data.lvStats?.rangeMult, 3)}</td><td class="mt-cell-val"></td></tr>` : ''}
                ${data.isSSS ? `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ SSS Rank Bonus</td><td class="mt-cell-formula">×1.2</td><td class="mt-cell-val"></td></tr>` : ''}
                ${traitRange !== 0 ? `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Trait (${data.traitObj?.name})</td><td class="mt-cell-formula">+${fmt.fix(traitRange, 1)}%</td><td class="mt-cell-val"></td></tr>` : ''}
                <tr><td class="mt-cell-label mt-pt-md">Relic Multiplier</td><td class="mt-cell-formula mt-pt-md">+${fmt.fix(relicRange, 1)}%</td><td class="mt-cell-val mt-pt-md"></td></tr>
                <tr><td class="mt-cell-label mt-pt-md">Additive Buff Bucket</td><td class="mt-cell-formula mt-pt-md">+${fmt.fix(setRange + passiveRange, 1)}%</td><td class="mt-cell-val mt-pt-md"></td></tr>
                ${setRange !== 0 ? `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Set Bonus</td><td class="mt-cell-formula">+${fmt.fix(setRange, 1)}%</td><td class="mt-cell-val"></td></tr>` : ''}
                ${passiveRange !== 0 ? `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Unit Passives</td><td class="mt-cell-formula">+${fmt.fix(passiveRange, 1)}%</td><td class="mt-cell-val"></td></tr>` : ''}
                ${globalRangeHtml}
                <tr class="mt-border-top"><td class="mt-cell-label mt-pt-sm text-white">Final Range</td><td class="mt-cell-formula"></td><td class="mt-cell-val mt-pt-sm calc-highlight" style="color: #60a5fa;">${fmt.fix(data.range, 1)}</td></tr>
            </table>
        </div>`;
}

function renderSummonSection(data) {
    if (!data.summonData) return '';

    if (data.summonData.isCustom) {
        if (!data.summonData.summons || data.summonData.summons.length === 0) {
            return '';
        }

        let summonsHtml = (data.summonData.summons || []).map(s => {
            const descHtml = s.desc ? (
                Array.isArray(s.desc)
                    ? s.desc.map(line => `<div class="summon-desc-line" style="font-size: 0.65rem; color: #94a3b8; margin-top: 2px; line-height: 1.35;">${line}</div>`).join('')
                    : `<div class="summon-desc-line" style="font-size: 0.65rem; color: #94a3b8; margin-top: 2px; line-height: 1.35;">${s.desc}</div>`
            ) : '';
            return `
                <tr class="summon-header-row">
                    <td class="mt-cell-label mt-text-bold" style="color: ${s.color}; font-size: 0.82rem; padding-top: 10px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        ${s.name} ${s.count ? `(x${fmt.fix(s.count, 2)})` : ''}
                    </td>
                    <td class="mt-cell-val"></td>
                </tr>
                <tr><td class="mt-cell-label mt-pl-sm opacity-70">↳ Host Reference Hit</td><td class="mt-cell-val opacity-70">${fmt.num((data.dmgVal || 0) * (data.critData?.avgMult || 1))}</td></tr>
                <tr><td class="mt-cell-label mt-pl-sm">Base Hit Damage</td><td class="mt-cell-val">${fmt.num(s.hitDmg)}</td></tr>
                ${s.avgMult && s.avgMult !== 1 ? `<tr><td class="mt-cell-label mt-pl-sm opacity-70">↳ Avg Multiplier (Cycle)</td><td class="mt-cell-val opacity-70">x${fmt.fix(s.avgMult, 3)}</td></tr>` : ''}
                ${s.avgMult && s.avgMult !== 1 ? `<tr><td class="mt-cell-label mt-pl-sm text-accent-start">Avg Cycle Damage</td><td class="mt-cell-val text-accent-start">${fmt.num(s.avgDmg)}</td></tr>` : ''}
                <tr><td class="mt-cell-label mt-pl-sm">Attack Speed (SPA)</td><td class="mt-cell-val">${fmt.fix(s.spa, 2)}s</td></tr>
                <tr><td class="mt-cell-label mt-pl-sm opacity-50">↳ Hit DPS</td><td class="mt-cell-val opacity-50">${fmt.num((s.avgDmg || s.hitDmg || 0) * s.count / s.spa)}</td></tr>
                ${s.dotDps > 0 ? `
                    <tr><td class="mt-cell-label mt-pl-sm text-accent-end">↳ DoT Damage (Non-Stacking)</td><td class="mt-cell-val text-accent-end">${fmt.num(s.dotDps * s.spa)}</td></tr>
                    <tr><td class="mt-cell-label mt-pl-sm text-accent-end" style="font-weight: 700; padding-left: 20px;">↳ Summon DoT DPS</td><td class="mt-cell-val text-accent-end" style="font-weight: 700;">${fmt.num(s.dotDps)}</td></tr>
                ` : ''}
                ${descHtml ? `<tr><td colspan="2" style="padding: 6px 10px; background: rgba(255,255,255,0.02); border-radius: 6px; margin-top: 4px; border: 1px solid rgba(255,255,255,0.03);">${descHtml}</td></tr>` : ''}
                <tr class="mt-border-top"><td class="mt-cell-label mt-pl-sm text-gold">Final Summon DPS</td><td class="mt-cell-val text-gold text-bold">${fmt.num(s.dps)}</td></tr>
                <tr><td colspan="2" style="height: 12px;"></td></tr>
            `;
        }).join('');

        return `
        <div class="dd-section" style="border-left: 3px solid #60a5fa;">
            <div class="dd-title mt-text-blue"><span>Custom Summon Analysis</span></div>
            <table class="calc-table sidebar-table">
                ${summonsHtml}
                <tr class="mt-border-top"><td class="text-white mt-pt-md" style="font-size: 0.8rem;">TOTAL SUMMON DPS</td><td class="mt-cell-val mt-pt-md text-accent-start text-bold" style="font-size: 0.9rem;">${fmt.num(data.summon)}</td></tr>
            </table>
        </div>
        <style>
            .summon-info-btn {
                background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                color: #60a5fa; font-size: 0.5rem; font-weight: 800; padding: 2px 6px;
                border-radius: 3px; cursor: pointer; letter-spacing: 0.5px; white-space: nowrap;
            }
            .summon-info-btn:hover { background: rgba(96, 165, 250, 0.1); border-color: #60a5fa; }
            .sidebar-table { width: 100%; }
            .sidebar-table td { padding: 3px 6px !important; }
            .summon-desc-grid {
                display: flex;
                flex-direction: column;
                gap: 4px;
                color: #94a3b8;
                font-size: 0.62rem;
                line-height: 1.3;
            }
            .summon-desc-tag {
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.05);
                padding: 3px 8px;
                border-radius: 4px;
                white-space: nowrap;
            }
            .tag-bullet { color: #60a5fa; font-weight: bold; margin-right: 4px; }
        </style>`;
    }
    const isNutaru = window.isUnit?.(data.baseStats?.id, 'nutaru_beast');
    return `
    <div class="dd-section">
        <div class="dd-title text-accent-start"><span>${isNutaru ? 'Clones' : 'Summon Logic (Planes)'}</span></div>
        <table class="calc-table">
            <tr><td class="mt-cell-label">${isNutaru ? 'Single Clone Dmg' : 'Plane Base Damage'}</td><td class="mt-cell-val">${isNutaru ? fmt.num((data.dmgVal || 0) * 0.75) : fmt.num((data.dmgVal || 0) * (data.baseStats?.summonStats?.dmgPct / 100 || 0.5))}</td></tr>
            <tr><td class="mt-cell-label">${isNutaru ? 'Summon Rate' : 'Host SPA (Spawn Rate)'}</td><td class="mt-cell-val">${fmt.fix((data.summonData?.hostSpa || 0) * (isNutaru ? 8 : 1), 2)}s</td></tr>
            
            <tr><td class="mt-cell-label mt-pt-md">Active ${isNutaru ? 'Clones' : 'Planes'}</td><td class="mt-cell-val mt-pt-md text-gold text-bold">${fmt.fix(data.summonData?.count, 1)} / ${data.summonData?.max || 1}</td></tr>
            <tr><td class="mt-cell-label calc-sub">Avg Duration</td><td class="mt-cell-val calc-sub">${data.summonData?.avgDuration || 0}s</td></tr>

            <tr><td class="mt-cell-label mt-pt-md">Avg ${isNutaru ? 'Clone' : 'Plane'} DPS (Individual)</td><td class="mt-cell-val mt-pt-md">${fmt.num(data.summonData?.avgPlaneDps)}</td></tr>
            ${isNutaru ? `<tr><td class="mt-cell-label calc-sub">Clone Attack Rate</td><td class="mt-cell-val calc-sub">8.0s</td></tr>` :
            `<tr><td class="mt-cell-label calc-sub">Type A (Explosive)</td><td class="mt-cell-formula"></td><td class="mt-cell-val calc-sub">${fmt.num(data.summonData?.dpsA)}</td></tr>
            <tr><td class="mt-cell-label calc-sub">Type B (Mounted)</td><td class="mt-cell-formula"></td><td class="mt-cell-val calc-sub">${fmt.num(data.summonData?.dpsB)}</td></tr>`}

            <tr><td class="mt-cell-label text-white mt-pt-md">Total ${isNutaru ? 'Clone' : 'Summon'} DPS (x${data.placement})</td><td class="mt-cell-val mt-pt-md text-accent-start text-bold">${fmt.num(data.summon)}</td></tr>
        </table>
    </div>`;
}

// ============================================================================
// MAIN ENTRY POINT FOR DPS BREAKDOWN
// ============================================================================
window.renderMathContent = function (data, isSplit = false) {
    if (!data) return '<div class="msg-empty">Error: Math data unavailable for this build.</div>';

    const lvStats = data.lvStats || { dmg: 0, spa: 1, range: 0, dmgMult: 1, spaMult: 1, rangeMult: 1 };
    const baseStats = data.baseStats || {};
    const traitObj = data.traitObj || {};
    const relicBuffs = data.relicBuffs || {};
    const totalSetStats = data.totalSetStats || {};
    const tagBuffs = data.tagBuffs || {};
    const headBuffs = data.headBuffs || {};
    const critData = data.critData || { rate: 0, cdmg: 150, avgMult: 1 };

    const MAP_HEAD_NAMES = {
        'sun_god': 'Sun God', 'ninja': 'Ninja Headband', 'reaper_necklace': 'Reaper Necklace',
        'shadow_reaper_necklace': 'Shadow Reaper Head', 'junior': 'Junior Ninja', 'biju_head': 'Biju Headband',
        'bloodline_head': 'Bloodline', 'reanimated_head': 'Reanimated', 'sorcerer_hunter_spirit': 'S.H. Spirit',
        'strongest_sorcerer_glasses': 'Strongest Glasses', 'monarch_cape': 'Monarch Cape',
        'monarch_head': 'Monarch Head', 'monarch': 'Monarch Cape', 'warlord_hat': 'Warlord Hat',
        'mochi_scarf': 'Mochi Scarf', 'flaming_donut': 'Flaming Donut', 'fused_earrings': 'Fused Earrings',
        'berserk_cleaver': 'Berserk Cleave'
    };
    const headType = (data.headBuffs?.type || data.relicStats?.head || 'none');
    const headDisplayName = String(MAP_HEAD_NAMES[headType] ?? (headType === 'none' || !headType ? 'None' : (String(headType).replace(/_/g, ' ').toUpperCase())));
    const cleanHeadDisplayName = headDisplayName.replace(' Head', '').replace(' Necklace', '').replace(' undefined', '').trim();
    const relicSetName = data.setName ? data.setName.replace(' Set', '') : (data.relicStats?.set ? data.relicStats.set.replace('_set', '').replace('_', ' ').toUpperCase() : 'None');

    const dotColorClass = data.dot > 0 ? 'text-accent-end' : '';
    const avgHitPerUnit = (data.dmgVal || 0) * (critData.avgMult || 1);
    const levelMult = lvStats.dmgMult || 1;
    const statPointsHtml = data.dmgPoints > 0 ? `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Stat Points (${data.dmgPoints} pts)</td><td class="mt-cell-formula">×${fmt.fix(levelMult, 3)}</td><td class="mt-cell-val"></td></tr>` : '';

    let traitRowsDmg = '';
    if (traitObj.dmg > 0) {
        traitRowsDmg += `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Trait (${traitObj.name})</td><td class="mt-cell-formula">+${traitObj.dmg}%</td><td class="mt-cell-val"></td></tr>`;
    }

    const dmgAfterRelic = lvStats.dmg * (1 + (data.traitBuffs?.dmg || 0) / 100) * (1 + (relicBuffs.dmg || 0) / 100);

    const preConditionalDmg = dmgAfterRelic * (1 + (data.totalAdditivePct || 0) / 100);
    const baseSetDmg = data.detailedBuffs ? data.detailedBuffs.setBase : Math.max(0, (totalSetStats.dmg || 0) - (tagBuffs.dmg || 0));
    const tagDmg = (data.detailedBuffs ? data.detailedBuffs.tagBonus : (tagBuffs.dmg || 0)) || 0;
    const passiveDmg = data.detailedBuffs ? data.detailedBuffs.unitPassive : ((data.passiveBuff || 0) - (headBuffs.headBase || 0) - (headBuffs.passiveDmg || 0) - (headBuffs.tagDmg || 0) - (data.abilityBuff || 0) - (data.eternalBuff || 0)) || 0;
    const eternalDmg = data.eternalBuff || 0;

    const setTagCfTotal = (totalSetStats.cf || 0) + (tagBuffs.cf || 0);
    const setTagCmTotal = (totalSetStats.cm || 0) + (tagBuffs.cm || 0);

    const tagSpa = data.tagBuffs?.spa || 0;
    const baseSetSpa = Math.max(0, (data.totalSetStats?.spa || 0) - tagSpa);
    const passiveSpa = data.passiveSpaBuff || 0;

    let traitRowsSpa = '';
    if (traitObj.spa > 0) {
        traitRowsSpa += `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Trait (${traitObj.name})</td><td class="mt-cell-formula">-${traitObj.spa}%</td><td class="mt-cell-val"></td></tr>`;
    }

    let headDotRow = '';
    if (headBuffs.dot > 0) {
        headDotRow += `<tr><td class="mt-cell-label">Accessory DoT (${headBuffs.type})</td><td class="mt-cell-formula">+${headBuffs.dot}%</td><td class="mt-cell-val"></td></tr>`;
    }

    const overview = renderOverviewSection(data);
    const summary = renderBuffSummarySection(data);
    const sourceTotals = renderSourceTotalsSection(data);
    const activeBuffs = renderActiveBuffsSection(data);
    const quickBreakdown = renderQuickBreakdownSection(data, avgHitPerUnit, dotColorClass);
    const baseDamage = renderBaseDamageSection(data, levelMult, traitRowsDmg, dmgAfterRelic, preConditionalDmg, baseSetDmg, tagDmg, passiveDmg, eternalDmg, statPointsHtml, cleanHeadDisplayName, relicSetName);
    const critSection = renderCritSection(data, setTagCfTotal, setTagCmTotal, cleanHeadDisplayName, relicSetName);
    const spaSection = renderSpaSection(data, traitRowsSpa, baseSetSpa, tagSpa, passiveSpa, cleanHeadDisplayName);
    const rangeSection = renderRangeSection(data);
    const dotSection = renderDotSection(data, headDotRow);
    const attackRate = renderAttackRateSection(data);
    const finalSection = renderFinalSection(data);
    const summonSection = renderSummonSection(data);

    if (isSplit) {
        return {
            content: `
                <div class="breakdown-center-panel" style="display: flex; flex-direction: column; gap: 15px;">
                    ${baseDamage}
                    ${critSection}
                    ${spaSection}
                    ${rangeSection}
                    ${dotSection}
                    ${attackRate}
                    ${finalSection}
                </div>
            `,
            leftPanel: `
                <div class="breakdown-left-panel" style="display: flex; flex-direction: column; gap: 15px;">
                    ${overview}
                    ${summary}
                    ${quickBreakdown}
                    ${activeBuffs}
                </div>
            `,
            rightPanel: `
                <div class="breakdown-right-panel" style="display: flex; flex-direction: column; gap: 15px;">
                    ${summonSection}
                </div>
            `
        };
    }

    return `
        <div class="math-breakdown-single-column" style="display: flex; flex-direction: column; gap: 15px;">
            ${overview}
            ${summary}
            ${quickBreakdown}
            ${activeBuffs}
            ${baseDamage}
            ${critSection}
            ${spaSection}
            ${rangeSection}
            ${dotSection}
            ${attackRate}
            ${summonSection}
            ${finalSection}
        </div>
    `;
};