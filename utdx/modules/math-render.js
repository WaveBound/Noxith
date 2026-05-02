// ============================================================================
// MATH-RENDER.JS - UI Rendering for DPS Calculations
// ============================================================================

//Helpers for formatting
const fmt = {
    pct: (n) => `${(n || 0) >= 0 ? '+' : ''}${parseFloat((n || 0).toFixed(1))}%`,
    num: (n) => (n || 0).toLocaleString(undefined, { maximumFractionDigits: 1 }),
    fix: (n, d = 2) => (n !== undefined && n !== null) ? parseFloat(n.toFixed(d)) : 0
};

function renderOverviewSection(data) {
    const isNutaru = data.baseStats.id === 'nutaru_beast';
    return `
        <div class="math-section" style="border: 1px solid rgba(251, 191, 36, 0.2); border-left: 4px solid #fbbf24; padding: 8px 12px; background: linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(255,255,255,0) 100%);">
            <div class="math-header" style="font-size: 0.5rem; margin-bottom: 10px; letter-spacing: 1px; opacity: 0.6; font-weight: 900; color: #fbbf24;">SNAPSHOT OVERVIEW</div>
            <div class="math-row" style="margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px;">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">ACTIVE TRAIT</span>
                <b class="text-custom" style="font-size: 0.7rem; letter-spacing: 0.5px;">${data.traitObj.name}</b>
            </div>
            <div class="math-row" style="margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px;">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">TOTAL DPS</span>
                <b class="math-val-gold" style="font-size: 0.85rem;">${fmt.num(data.total)}</b>
            </div>
            ${(data.summon > 0 && (!data.summonData || !data.summonData.isCustom)) ? `
            <div class="math-row" style="margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px;">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">${isNutaru ? 'CLONES' : 'PLANES'} ACTIVE</span>
                <b class="text-accent-start" style="font-size: 0.7rem;">${fmt.fix(data.summonData.count, 1)}</b>
            </div>` : ''}
            <div class="math-row" style="margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px;">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">PLACEMENT</span>
                <b style="font-size: 0.7rem;">${data.placement} Unit(s)</b>
            </div>
            <div class="math-row" style="margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px;">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">UNIT TYPE</span>
                <b class="text-custom" style="font-size: 0.7rem;">${data.baseStats.placementType || 'Ground'}</b>
            </div>
            <div class="math-row">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">FINAL RANGE</span>
                <b class="math-val-range" style="font-size: 0.8rem;">${fmt.fix(data.range, 1)}</b>
            </div>
        </div>`;
}

function renderBuffSummarySection(data) {
    const statPointsPct = (data.lvStats.dmgMult - 1) * 100;
    const totalMult = data.dmgVal / data.baseStats.dmg;
    return `
        <div class="math-section" style="border: 1px solid rgba(74, 222, 128, 0.2); border-left: 4px solid #4ade80; padding: 8px 12px; background: linear-gradient(135deg, rgba(74, 222, 128, 0.05) 0%, rgba(255,255,255,0) 100%);">
            <div class="math-header" style="font-size: 0.5rem; margin-bottom: 10px; letter-spacing: 1px; opacity: 0.6; font-weight: 900; color: #4ade80;">TOTAL BUFF SUMMARY</div>
            <div class="math-row" style="margin-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 3px;">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">RELIC STATS</span>
                <b class="text-accent-end" style="font-size: 0.7rem;">${fmt.pct(data.relicBuffs.dmg)}</b>
            </div>
            <div class="math-row" style="margin-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 3px;">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">TRAIT BONUS</span>
                <b class="text-custom" style="font-size: 0.7rem;">${fmt.pct(data.traitBuffs.dmg)}</b>
            </div>
            <div class="math-row" style="margin-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 3px;">
                <span style="font-size: 0.55rem; font-weight: 700; opacity: 0.6; letter-spacing: 0.5px;">STAT POINTS</span>
                <b class="text-white" style="font-size: 0.7rem;">${fmt.pct(statPointsPct)}</b>
            </div>
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
    // 1. Relic & Tag Breakdown
    const relicMainSub = data.relicBuffs.dmg || 0;
    const setBaseDmg = (data.totalSetStats.dmg || 0) - (data.tagBuffs.dmg || 0);
    const tagDmg = data.tagBuffs.dmg || 0;
    const gearTotalDmg = relicMainSub + setBaseDmg + tagDmg;

    const gearSpa = (data.relicBuffs.spa || 0) + (data.totalSetStats.spa || 0);
    const gearRange = (data.relicBuffs.range || 0) + (data.totalSetStats.range || 0);
    const gearCrit = (data.relicBuffs.cf || 0) + (data.totalSetStats.cf || 0);

    // 2. Trait Logic (Isolate Base Multipliers)
    const traitDmg = data.traitBuffs.dmg || 0;
    const traitSpa = data.traitBuffs.spa || 0;
    const traitRange = data.traitBuffs.range || 0;
    const traitCrit = data.traitObj.critRate || 0;

    // 3. Passive & Global Breakdown (Isolate specific sources)
    const eternalDmg = data.eternalBuff || 0;
    const unitInnateDmg = (data.passiveBuff || 0) - (data.headBuffs.dmg || 0) - (data.abilityBuff || 0) - eternalDmg;
    const abilityDmg = data.abilityBuff || 0;
    const accessoryDmg = data.headBuffs.dmg || 0;

    let globalPassiveDmg = 0;
    let globalPassiveSpa = 0;
    let globalPassiveRange = 0;
    let globalPassiveCrit = 0;
    let globalPassiveCdmg = 0;

    let globalBuffsDmgHtml = '';
    let globalBuffsSpaHtml = '';
    let globalBuffsCritHtml = '';

    // Dynamically aggregate ALL active buffs for the breakdown
    if (data.activeGlobalBuffs && window.GLOBAL_BUFF_DATA) {
        Object.values(window.GLOBAL_BUFF_DATA).forEach(buff => {
            const bData = data.activeGlobalBuffs[buff.id];
            if (bData) {
                if (bData.dmg) {
                    globalPassiveDmg += bData.dmg;
                    globalBuffsDmgHtml += `<div style="display:flex; justify-content:space-between; font-size: 0.65rem; color: ${buff.color};"><span>↳ ${buff.name}</span><span>${fmt.pct(bData.dmg)}</span></div>`;
                }
                if (bData.spa) {
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

    const passiveTotalDmg = unitInnateDmg + abilityDmg + accessoryDmg + globalPassiveDmg + eternalDmg;
    const passiveTotalSpa = (data.passiveSpaBuff || 0) + globalPassiveSpa;
    const passiveTotalRange = (data.baseStats.passiveRange || 0) + (data.eternalRangeBuff || 0) + globalPassiveRange;
    const passiveTotalCrit = globalPassiveCrit;
    const passiveTotalCdmg = globalPassiveCdmg;

    return `
        <div class="math-section" style="border: 1px solid rgba(255, 255, 255, 0.1); background: #000; flex: 1; margin-bottom: 0; padding: 10px 12px; border-radius: 8px; background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%); border-top: 2px solid rgba(255,255,255,0.15);">
            <div class="math-header" style="color: #fff; font-size: 0.55rem; margin-bottom: 12px; letter-spacing: 1.5px; font-weight: 900; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; opacity: 0.8;">SOURCE TOTALS</div>
            
            <div style="margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.05); border-left: 3px solid #f472b6; padding-left: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-size: 0.68rem; font-weight: 800; color: #f472b6; letter-spacing: 0.5px;">RELICS & TAGS</span>
                    <b style="color: #f472b6; font-size: 0.8rem;">${fmt.pct(gearTotalDmg)}</b>
                </div>
                <div style="display: flex; flex-direction: column; gap: 3px; margin-bottom: 5px;">
                    <div style="display:flex; justify-content:space-between; font-size: 0.68rem; color: #999;"><span>Gear Main + Subs</span><span class="text-white">${fmt.pct(relicMainSub)}</span></div>
                    <div style="display:flex; justify-content:space-between; font-size: 0.68rem; color: #999;"><span>Relic Set Base</span><span class="text-white">${fmt.pct(setBaseDmg)}</span></div>
                    ${tagDmg > 0 ? `<div style="display:flex; justify-content:space-between; font-size: 0.68rem; color: #f472b6; font-weight: 700;"><span>Unit Tag Bonuses</span><span>${fmt.pct(tagDmg)}</span></div>` : ''}
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; font-size: 0.65rem; color: #777; border-top: 1px solid rgba(244, 114, 182, 0.1); padding-top: 4px;">
                    <div style="display:flex; justify-content:space-between;"><span>SPA</span><b class="text-white">-${gearSpa.toFixed(1)}%</b></div>
                    <div style="display:flex; justify-content:space-between;"><span>Range</span><b class="text-white">${fmt.pct(gearRange)}</b></div>
                    <div style="display:flex; justify-content:space-between; grid-column: span 2;"><span>Crit Rate Bonus</span><b class="text-white">+${gearCrit.toFixed(1)}%</b></div>
                </div>
            </div>

            <div style="margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.05); border-left: 3px solid #4ade80; padding-left: 10px; background: rgba(74, 222, 128, 0.02); padding-top: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span style="font-size: 0.68rem; font-weight: 800; color: #4ade80; letter-spacing: 0.5px;">TRAIT: ${data.traitObj.name.toUpperCase()}</span>
                    <b style="color: #4ade80; font-size: 0.8rem;">${fmt.pct(traitDmg)}</b>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px 12px; font-size: 0.6rem; color: #999;">
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
        (data.baseStats.id === 'nutaru_beast' ? `
                        <div style="display:flex; justify-content:space-between; font-size: 0.65rem; color: #999;"><span>Clone Despawn</span><span class="text-white">+40.0%</span></div>
                        ${data.isAbility ? `
                            <div style="display:flex; justify-content:space-between; font-size: 0.65rem; color: #999;"><span>Beast Form</span><span class="text-white">+30.0%</span></div>
                            <div style="display:flex; justify-content:space-between; font-size: 0.65rem; color: #999;"><span>Attack Cycle</span><span class="text-white">+50.0%</span></div>
                        ` : ''}
                    ` : `
                        ${unitInnateDmg > 0 ? `<div style="display:flex; justify-content:space-between; font-size: 0.65rem; color: #999;"><span>Unit Passive</span><span class="text-white">${fmt.pct(unitInnateDmg)}</span></div>` : ''}
                    `) + `
                    ${abilityDmg > 0 ? `<div style="display:flex; justify-content:space-between; font-size: 0.68rem; color: #999;"><span>Active Ability</span><span class="text-white">${fmt.pct(abilityDmg)}</span></div>` : ''}
                    ${accessoryDmg > 0 ? `<div style="display:flex; justify-content:space-between; font-size: 0.68rem; color: #999;"><span>Accessory</span><span class="text-white">${fmt.pct(accessoryDmg)}</span></div>` : ''}
                    ${globalBuffsDmgHtml}
                    ${globalBuffsSpaHtml}
                    ${globalBuffsCritHtml}
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; font-size: 0.65rem; color: #777;">
                    <div style="display:flex; justify-content:space-between;"><span>SPA Reduction</span><b class="text-white">${passiveTotalSpa >= 0 ? '-' : '+'}${Math.abs(passiveTotalSpa).toFixed(1)}%</b></div>
                    <div style="display:flex; justify-content:space-between;"><span>Range</span><b class="text-white">${fmt.pct(passiveTotalRange)}</b></div>
                    ${passiveTotalCrit > 0 ? `<div style="display:flex; justify-content:space-between;"><span>Crit Rate</span><b style="color:#60a5fa;">+${passiveTotalCrit}%</b></div>` : ''}
                    ${passiveTotalCdmg > 0 ? `<div style="display:flex; justify-content:space-between;"><span>Crit Dmg</span><b style="color:#60a5fa;">+${passiveTotalCdmg}%</b></div>` : ''}
                </div>
            </div>
        </div>`;
}

function renderActiveBuffsSection(data) {
    const buffs = [];

    // 1. Automatically fetch active Global Buffs
    if (window.GLOBAL_BUFF_DATA) {
        Object.values(window.GLOBAL_BUFF_DATA).forEach(buff => {
            if (window[buff.stateKey]) {
                buffs.push({
                    name: buff.name,
                    desc: buff.renderLabel,
                    color: buff.color
                });
            }
        });
    }

    // 2. Trait "Passives"
    if (data.traitObj.isEternal) buffs.push({ name: "Eternal Stacks", desc: "Applied: +5% Dmg & +2.5% Rng / Wave (Max 12)", color: "#c084fc" });
    if (data.traitObj.hasRadiation) buffs.push({ name: "Radiation", desc: "Fission Trait: Enemies take +20% Damage", color: "#f87171" });

    // 3. Conditionals
    if (data.conditionalData) buffs.push({ name: data.conditionalData.name, desc: `Target condition met: x${data.conditionalData.mult.toFixed(2)} Dmg`, color: "#fb923c" });

    // 4. Special Attack Mechanics (FuA, Multi-hit, etc.)
    if (data.extraAttacks) buffs.push({ name: data.extraAttacks.label || "Attack Rate", desc: `${data.extraAttacks.hits}: Final x${data.extraAttacks.mult.toFixed(3)} DPS Mult`, color: "#60a5fa" });

    // 5. Unit Innate Passives (Fetched from Database via refreshUnitMap helper)
    const unit = typeof getUnitById === 'function' ? getUnitById(data.baseStats.id) : null;
    if (unit && unit.passives) {
        unit.passives.forEach(p => {
            buffs.push({ name: p.name, desc: p.desc, color: "#fff" });
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
    const dotLabelClass = data.dot > 0 ? 'text-accent-end' : '';
    const isNutaru = data.baseStats.id === 'nutaru_beast';
    return `
        <div class="math-section no-border-bottom" style="margin-bottom: 4px;">
            <div class="math-header opacity-70">Quick Breakdown</div>
            <div class="mq-box">
                <div style="border-color: rgba(251, 191, 36, 0.3);"><div class="mq-label mt-text-gold">Hit DPS</div><div class="mq-val mt-text-gold">${fmt.num(data.hit)}</div><div class="mq-sub">(${fmt.num(avgHitPerUnit)} avg ÷ ${fmt.fix(data.spa, 2)}s) × ${data.placement}</div></div>
                <div style="border-color: ${data.dot > 0 ? 'rgba(192, 132, 252, 0.3)' : '#333'};"><div class="mq-label ${dotLabelClass}">DoT DPS</div><div class="mq-val ${dotColorClass}">${data.dot > 0 ? fmt.num(data.dot) : '-'}</div><div class="mq-sub">${data.dot > 0 ? (data.hasStackingDoT ? `Stacking: x${data.placement} units` : `Limited: x1 unit only`) : 'No DoT'}</div></div>
                <div style="border-color: rgba(216, 180, 254, 0.3);"><div class="mq-label text-custom">Crit Rate / Dmg</div><div class="mq-val text-custom">${fmt.fix(data.critData.rate, 0)}% <span class="color-dim">|</span> x${fmt.fix(data.critData.cdmg / 100, 2)}</div><div class="mq-sub">Avg Mult: x${fmt.fix(data.critData.avgMult, 3)}</div></div>
                ${data.summon > 0 ? `<div style="border-color: rgba(96, 165, 250, 0.3);"><div class="mq-label text-accent-start">${isNutaru ? 'Clone' : (data.summonData?.isCustom ? 'Custom Summon' : 'Plane')} DPS</div><div class="mq-val text-accent-start">${fmt.num(data.summon)}</div><div class="mq-sub">Independent of Host Stats</div></div>` : `<div style="border-color: rgba(96, 165, 250, 0.3);"><div class="mq-label text-accent-start">Attack Rate</div><div class="mq-val text-accent-start">${fmt.fix(data.spa, 2)}s</div><div class="mq-sub">Base: ${data.baseStats.spa}s (Current Cap: ${data.spaCap}s)</div></div>`}
            </div>
        </div>`;
}

function renderBaseDamageSection(data, levelMult, traitRowsDmg, dmgAfterRelic, headDmgHtml, preConditionalDmg, baseSetDmg, tagDmg, passiveDmg, eternalDmg, statPointsHtml) {
    let globalDmgBreakdownHtml = '';
    if (data.activeGlobalBuffs && window.GLOBAL_BUFF_DATA) {
        Object.values(window.GLOBAL_BUFF_DATA).forEach(buff => {
            const bData = data.activeGlobalBuffs[buff.id];
            if (bData && bData.dmg > 0) {
                globalDmgBreakdownHtml += `<tr><td class="mt-cell-label mt-pl-md opacity-70" style="color: ${buff.color};">↳ ${buff.name}</td><td class="mt-cell-formula" style="color: ${buff.color};">${fmt.pct(bData.dmg)}</td><td class="mt-cell-val"></td></tr>`;
            }
        });
    }

    return `
            <div class="dd-section">
                <div class="dd-title mt-text-red"><span>1. Base Damage Calculation</span></div>
                <table class="calc-table">
                    <tr><td class="mt-cell-label">Base Stats (Lv 1)</td><td class="mt-cell-formula"></td><td class="mt-cell-val">${fmt.num(data.baseStats.dmg)}</td></tr>
                    ${statPointsHtml}
                    ${data.isSSS ? `<tr><td class="mt-cell-label">SSS Rank Bonus</td><td class="mt-cell-formula"><span class="op">×</span>1.2</td><td class="mt-cell-val">${fmt.num(data.lvStats.dmg)}</td></tr>` : ''}
                    
                    ${traitRowsDmg}

                    <tr><td class="mt-cell-label text-accent-end">Relic Multiplier <button class="calc-info-btn" onclick="openInfoPopup('relic_multi')">?</button></td><td class="mt-cell-formula text-accent-end">${fmt.pct(data.relicBuffs.dmg)}</td><td class="mt-cell-val">${fmt.num(dmgAfterRelic)}</td></tr>
                    
                    ${headDmgHtml}

                    <tr>
                        <td class="mt-cell-label mt-pt-md">Buff Data <button class="calc-info-btn" onclick="openInfoPopup('tag_logic')">?</button></td>
                        <td class="mt-cell-formula mt-pt-md mt-text-gold mt-text-bold">${fmt.pct(data.totalAdditivePct)}</td>
                        <td class="mt-cell-val calc-highlight mt-pt-md">${fmt.num(preConditionalDmg)}</td>
                    </tr>
                    <tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Set Base</td><td class="mt-cell-formula">${fmt.pct(baseSetDmg)}</td><td class="mt-cell-val"></td></tr>
                    ${(data.headBuffs.dmg || 0) > 0 ? `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Accessory</td><td class="mt-cell-formula">${fmt.pct(data.headBuffs.dmg)}</td><td class="mt-cell-val"></td></tr>` : ''}
                    ${tagDmg !== 0 ? `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Tag Bonuses</td><td class="mt-cell-formula">${fmt.pct(tagDmg)}</td><td class="mt-cell-val"></td></tr>` : ''}
                    ${passiveDmg > 0 ? `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Unit Passive</td><td class="mt-cell-formula">${fmt.pct(passiveDmg)}</td><td class="mt-cell-val"></td></tr>` : ''}
                    ${eternalDmg > 0 ? `<tr><td class="mt-cell-label mt-pl-md text-accent-start opacity-70">↳ Eternal Stacks (Wave 12+)</td><td class="mt-cell-formula text-accent-start">${fmt.pct(eternalDmg)}</td><td class="mt-cell-val"></td></tr>` : ''}
                    ${(data.abilityBuff || 0) > 0 ? `<tr><td class="mt-cell-label mt-pl-md text-custom opacity-70">↳ Ability Buffs</td><td class="mt-cell-formula text-custom">${fmt.pct(data.abilityBuff)}</td><td class="mt-cell-val"></td></tr>` : ''}

                    ${globalDmgBreakdownHtml}

                    ${data.conditionalData ? `
                    <tr><td class="mt-cell-label mt-pt-md mt-text-orange mt-text-bold">${data.conditionalData.name}</td><td class="mt-cell-formula mt-pt-md mt-text-orange mt-text-bold">x${data.conditionalData.mult.toFixed(2)}</td><td class="mt-cell-val calc-highlight mt-pt-md">${fmt.num(data.dmgVal)}</td></tr>` : ''}
                </table>
            </div>`;
}

function renderCritSection(data, setTagCfTotal, setTagCmTotal) {
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

    return `
            <div class="dd-section">
                <div class="dd-title" style="color: #c084fc"><span>2. Crit Averaging</span> <button class="calc-info-btn" onclick="openInfoPopup('crit_avg')">?</button></div>
                <table class="calc-table">
                    <tr><td class="mt-cell-label">Base Hit (Non-Crit)</td><td class="mt-cell-formula"></td><td class="mt-cell-val">${fmt.num(data.dmgVal)}</td></tr>
                    
                    <tr><td class="mt-cell-label mt-pl-sm mt-text-gold mt-text-bold">↳ Final Crit Rate</td><td class="mt-cell-formula"></td><td class="mt-cell-val mt-text-gold mt-text-bold">${fmt.fix(data.critData.rate, 1)}%</td></tr>
                    ${data.baseStats.crit > 0 ? `<tr><td class="mt-cell-label mt-pl-lg text-dim text-xs">• Unit Base</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">${fmt.fix(data.baseStats.crit, 1)}%</td></tr>` : ''}
                    ${(data.traitObj.critRate || 0) > 0 ? `<tr><td class="mt-cell-label mt-pl-lg text-dim text-xs">• Trait (${data.traitObj.name})</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">${fmt.fix(data.traitObj.critRate, 1)}%</td></tr>` : ''}
                    ${data.relicBuffs.cf > 0 ? `<tr><td class="mt-cell-label mt-pl-lg text-dim text-xs">• Relics (Main+Sub)</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">${fmt.fix(data.relicBuffs.cf, 1)}%</td></tr>` : ''}
                    ${setTagCfTotal > 0 ? `<tr><td class="mt-cell-label mt-pl-lg text-dim text-xs">• Set Bonus & Tags</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">${fmt.fix(setTagCfTotal, 1)}%</td></tr>` : ''}
                    ${globalCritBreakdownHtml}
                    
                    <tr><td class="mt-cell-label mt-pl-sm text-gray">↳ CDmg Base</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-gray font-normal">${fmt.fix(data.critData.baseCdmg, 0)}</td></tr>
                    ${data.relicBuffs.cm > 0 ? `<tr><td class="mt-cell-label mt-pl-lg text-dim text-xs">• Relics</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">+${fmt.fix(data.relicBuffs.cm, 1)}%</td></tr>` : ''}
                    ${setTagCmTotal > 0 ? `<tr><td class="mt-cell-label mt-pl-lg text-dim text-xs">• Set & Tags</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">+${fmt.fix(setTagCmTotal, 1)}%</td></tr>` : ''}
                    ${globalCdmgBreakdownHtml}

                    <tr><td class="mt-cell-label">Total Crit Damage</td><td class="mt-cell-formula">=</td><td class="mt-cell-val calc-highlight">${fmt.fix(data.critData.cdmg, 0)}%</td></tr>
                    
                    <tr>
                        <td class="mt-cell-label text-right pr-2">Avg Damage Per Hit</td>
                        <td class="mt-cell-formula"></td>
                        <td class="mt-cell-val calc-result text-right">${fmt.num(data.dmgVal * data.critData.avgMult)}</td>
                    </tr>
                </table>
            </div>`;
}

function renderSpaSection(data, traitRowsSpa, baseSetSpa, tagSpa, passiveSpa) {
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
                    <tr><td class="mt-cell-label">Base SPA (Lv 1)</td><td class="mt-cell-formula"></td><td class="mt-cell-val">${data.baseStats.spa}s</td></tr>
                    <tr><td class="mt-cell-label">Stat Point Scaling</td><td class="mt-cell-formula">x${fmt.fix(data.lvStats.spaMult, 3)}</td><td class="mt-cell-val">${fmt.fix(data.baseStats.spa * data.lvStats.spaMult, 3)}s</td></tr>
                    ${data.isSSS ? `<tr><td class="mt-cell-label">SSS Rank (-8%)</td><td class="mt-cell-formula"><span class="op">×</span>0.92</td><td class="mt-cell-val">${fmt.fix(data.lvStats.spa, 3)}s</td></tr>` : ''}
                    ${traitRowsSpa}
                    
                    <tr><td class="mt-cell-label mt-pt-md">Relic Multiplier</td><td class="mt-cell-formula mt-pt-md">-${fmt.fix(data.relicBuffs.spa, 1)}%</td><td class="mt-cell-val mt-pt-md">${fmt.fix(data.spaAfterRelic, 3)}s</td></tr>
                    <tr><td class="mt-cell-label mt-pt-md">Set Bonus + Passive + Abilities <button class="calc-info-btn" onclick="openInfoPopup('tag_logic')">?</button></td><td class="mt-cell-formula mt-pt-md">${data.setAndPassiveSpa >= 0 ? '-' : '+'}${Math.abs(fmt.fix(data.setAndPassiveSpa, 1))}%</td><td class="mt-cell-val mt-pt-md">${fmt.fix(data.rawFinalSpa, 3)}s</td></tr>
                    <tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Set Base</td><td class="mt-cell-formula">-${fmt.fix(baseSetSpa, 1)}%</td><td class="mt-cell-val"></td></tr>
                    ${tagSpa !== 0 ? `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Tag Bonuses</td><td class="mt-cell-formula">-${fmt.fix(tagSpa, 1)}%</td><td class="mt-cell-val"></td></tr>` : ''}
                    ${passiveSpa !== 0 ? `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Unit Passive</td><td class="mt-cell-formula">${passiveSpa > 0 ? '+' : ''}${fmt.fix(passiveSpa, 1)}% ${passiveSpa > 0 ? 'Speed' : 'Slow'}</td><td class="mt-cell-val"></td></tr>` : ''}
                    ${globalSpaBreakdownHtml}

                    <tr><td class="mt-cell-label">Cap Check (${data.spaCap}s)</td><td class="mt-cell-formula">MAX</td><td class="mt-cell-val calc-result">${fmt.fix(data.spa, 3)}s</td></tr>
                </table>
            </div>`;
}

function renderDotSection(data, headDotRow) {
    if (data.dot <= 0) return '';
    const db = data.dotData;
    const getFormula = (total, time) => {
        if (time === 0) return '';
        const label = Math.abs(time - data.spa) < 0.001 ? 'SPA' : 'Interval';
        return `<span class="text-dim">(${fmt.num(total)} / ${fmt.fix(time, 1)}s ${label})</span>`;
    };

    const baseDot = data.baseStats.dot || 0;
    const traitDot = data.traitObj.dotBuff || 0;
    const setDot = data.totalSetStats.dot || 0;
    const headDot = data.headBuffs.dot || 0;
    const relicDot = data.relicBuffs.dot || 0;

    const gearBonus = relicDot + setDot + headDot;
    const traitMultiplier = 1 + (traitDot / 100);
    const gearMultiplier = 1 + (gearBonus / 100);
    const finalTickPct = baseDot * traitMultiplier * gearMultiplier;

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

    return `
    <div class="dd-section">
        <div class="dd-title text-accent-end"><span>6. Status Effect (DoT) Breakdown</span> <button class="calc-info-btn" onclick="openInfoPopup('dot_logic')">?</button></div>
        <table class="calc-table">
            <tr><td class="mt-cell-label">Hit Ref ${db.critMult > 1 ? '(Crit Avg)' : '(Non-Crit)'}</td><td class="mt-cell-val" colspan="2">${fmt.num(data.dmgVal * db.critMult)}</td></tr>
            
            ${headDotRow}

            ${db.nativeDps > 0 ? `
            <tr><td class="mt-cell-label mt-pt-md mt-text-bold">Native Tick % Calculation</td><td class="mt-cell-formula mt-pt-md"></td><td class="mt-cell-val mt-pt-md mt-text-bold">${fmt.fix(finalTickPct, 1)}%</td></tr>
            ${baseDot > 0 ? `<tr><td class="mt-cell-label mt-pl-sm opacity-70">↳ Unit Base</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-xs text-white">${fmt.num(baseDot)}%</td></tr>` : ''}
            <tr><td class="mt-cell-label mt-pl-sm mt-text-bold text-custom">1. Trait Multiplier (${data.traitObj.name})</td><td class="mt-cell-formula mt-text-bold text-custom"><span class="op">×</span>${fmt.fix(traitMultiplier, 2)}</td><td class="mt-cell-val text-custom text-bold">${fmt.pct(traitDot)}</td></tr>
            <tr><td class="mt-cell-label mt-pl-sm mt-text-bold text-accent-end">2. Gear Multiplier (Relics/Set/Head)</td><td class="mt-cell-formula mt-text-bold text-accent-end"><span class="op">×</span>${fmt.fix(gearMultiplier, 2)}</td><td class="mt-cell-val text-accent-end text-bold">${fmt.pct(gearBonus)}</td></tr>
            ${relicDot > 0 ? `<tr><td class="mt-cell-label mt-pl-md text-dim text-xs">• Relic Stats (Main+Sub)</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-xs text-dim">${fmt.pct(relicDot)}</td></tr>` : ''}
            ${setDot > 0 ? `<tr><td class="mt-cell-label mt-pl-md text-dim text-xs">• Set Bonus</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-xs text-dim">${fmt.pct(setDot)}</td></tr>` : ''}
            ${headDot > 0 ? `<tr><td class="mt-cell-label mt-pl-md text-dim text-xs">• Head Passive</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-xs text-dim">${fmt.pct(headDot)}</td></tr>` : ''}
            
            <tr><td class="mt-cell-label mt-pt-md">Final Native Tick %</td><td class="mt-cell-formula">=</td><td class="mt-cell-val calc-highlight">${fmt.fix(finalTickPct, 2)}%</td></tr>
            <tr><td class="mt-cell-label mt-pl-sm text-accent-end mt-pt-sm">↳ Total Damage</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-accent-end mt-pt-sm">${fmt.num(db.nativeTotalDmg)}</td></tr>
            ${data.baseStats.dotDuration ? `
            <tr><td class="mt-cell-label mt-pl-md text-dim text-xs opacity-70">• Ticks Over Time</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">${data.baseStats.dotDuration} Ticks</td></tr>
            <tr><td class="mt-cell-label mt-pl-md text-dim text-xs opacity-70">• Damage Per Tick</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-dim text-xs">${fmt.num(db.nativeTotalDmg / data.baseStats.dotDuration)}</td></tr>
            ` : ''}
          ${db.isMultiHit ? `<tr><td class="mt-cell-label mt-pl-md text-custom">↳ Multi-Hit Proc (Astral)</td><td class="mt-cell-formula">x${data.baseStats.hitCount}</td><td class="mt-cell-val text-custom">Active</td></tr>` : ''}
            <tr>
                <td class="mt-cell-label mt-pt-sm">Native DoT DPS</td>
                <td class="mt-cell-formula mt-pt-sm">${getFormula(db.nativeTotalDmg, db.nativeInterval)}</td>
                <td class="mt-cell-val mt-pt-sm">${fmt.num(db.nativeDps)}</td>
            </tr>
            ` : ''}

            ${db.radDps > 0 ? `
            <tr>
                <td class="mt-cell-label text-accent-start mt-pt-md">Radiation DoT (${data.traitObj.radiationPct || 20}% / 10s)</td>
                <td class="mt-cell-formula mt-pt-md">${getFormula(db.radTotalDmg, db.radInterval)}</td>
                <td class="mt-cell-val text-accent-start mt-pt-md">${fmt.num(db.radDps)} DPS</td>
            </tr>
            ` : ''}

            ${db.fuaDotDps > 0 ? `
            <tr><td class="mt-cell-label mt-pt-md mt-text-bold" style="color: #60a5fa">${db.fuaLabel || 'Follow-Up DoT'}</td><td class="mt-cell-formula mt-pt-md"></td><td class="mt-cell-val mt-pt-md mt-text-bold" style="color: #60a5fa">${fmt.num(db.fuaDotDps)}</td></tr>
            <tr><td class="mt-cell-label mt-pl-sm text-dim text-xs">• Trigger Chance</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-xs text-white">${db.fuaChance}%</td></tr>
            <tr><td class="mt-cell-label mt-pl-sm text-dim text-xs">• Damage Per Proc</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-xs text-white">${fmt.num(db.fuaDotTotalDmg)}</td></tr>
            ` : ''}

            <tr class="mt-border-top">
                <td class="mt-cell-label text-white mt-pt-md">Total DoT (1 Unit)</td>
                <td class="mt-cell-formula mt-pt-md"></td>
                <td class="mt-cell-val text-white mt-pt-md">${fmt.num(db.nativeDps + db.radDps + (db.fuaDotDps || 0))}</td>
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

function renderMathContent(data, isSplit = false) {
    if (!data || !data.lvStats || !data.critData) return '<div class="msg-empty">Data incomplete.</div>';

    // BUILD IDENTITY SECTION
    const identityHtml = `
        <div class="build-identity-box" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 6px 15px; margin-bottom: 6px; border-left: 4px solid #60a5fa;">
            <div style="font-size: 0.55rem; color: #888; text-transform: uppercase; letter-spacing: 1px; font-weight: 900; margin-bottom: 2px;">Relic Set & Trait</div>
            <div style="font-size: 0.95rem; font-weight: 900; color: #fff; line-height: 1.1;">${data.setName || 'Standard Build'}</div>
            <div style="font-size: 0.8rem; color: #60a5fa; font-weight: 800; margin-top: 1px;">${data.traitObj ? data.traitObj.name : 'Unknown Trait'}</div>
        </div>
    `;

    const levelMult = data.lvStats.dmgMult;
    const avgHitPerUnit = data.dmgVal * data.critData.avgMult;

    // --- Trait Row Logic ---
    let traitRowsDmg = '';
    let traitRowsSpa = '';
    let runningDmg = data.isSSS ? data.lvStats.dmg : (data.baseStats.dmg * levelMult);
    if (data.isSSS) runningDmg = data.lvStats.dmg;
    let runningSpa = data.isSSS ? data.lvStats.spa : (data.baseStats.spa * data.lvStats.spaMult);

    if (data.traitObj && data.traitObj.subTraits && data.traitObj.subTraits.length > 0) {
        data.traitObj.subTraits.forEach((t, i) => {
            const tDmg = t.dmg || 0;
            const nextDmg = runningDmg * (1 + tDmg / 100);
            let labelHtml = `↳ ${t.name}`;
            if (i === 0) labelHtml += ` <button class="calc-info-btn" onclick="openInfoPopup('trait_logic')">?</button>`;
            traitRowsDmg += `<tr><td class="mt-cell-label mt-pl-md">${labelHtml}</td><td class="mt-cell-formula">${fmt.pct(tDmg)}</td><td class="mt-cell-val">${fmt.num(nextDmg)}</td></tr>`;
            runningDmg = nextDmg;

            const tSpa = t.spa || 0;
            const nextSpa = runningSpa * (1 - tSpa / 100);
            traitRowsSpa += `<tr><td class="mt-cell-label mt-pl-md">↳ ${t.name}</td><td class="mt-cell-formula">-${fmt.fix(tSpa, 1)}%</td><td class="mt-cell-val">${fmt.fix(nextSpa, 3)}s</td></tr>`;
            runningSpa = nextSpa;
        });
    } else {
        const dmgAfterTrait = runningDmg * (1 + data.traitBuffs.dmg / 100);
        traitRowsDmg = `<tr><td class="mt-cell-label">Trait Multiplier <button class="calc-info-btn" onclick="openInfoPopup('trait_logic')">?</button></td><td class="mt-cell-formula">${fmt.pct(data.traitBuffs.dmg)}</td><td class="mt-cell-val">${fmt.num(dmgAfterTrait)}</td></tr>`;
        const spaAfterTrait = runningSpa * (1 - data.traitBuffs.spa / 100);
        traitRowsSpa = `<tr><td class="mt-cell-label">Trait Reduction</td><td class="mt-cell-formula">-${fmt.fix(data.traitBuffs.spa, 1)}%</td><td class="mt-cell-val">${fmt.fix(spaAfterTrait, 3)}s</td></tr>`;
        runningDmg = dmgAfterTrait; runningSpa = spaAfterTrait;
    }

    const dmgAfterRelic = runningDmg * (1 + data.relicBuffs.dmg / 100);
    const baseSetDmg = (data.totalSetStats.dmg || 0) - (data.tagBuffs.dmg || 0);
    const tagDmg = (data.tagBuffs.dmg || 0);
    const eternalDmg = data.eternalBuff || 0;
    const passiveDmg = (data.passiveBuff || 0) - (data.headBuffs.dmg || 0) - (data.abilityBuff || 0) - eternalDmg;
    const baseSetSpa = (data.totalSetStats.spa || 0) - (data.tagBuffs.spa || 0);
    const tagSpa = (data.tagBuffs.spa || 0);
    const passiveSpa = (data.passiveSpaBuff || 0);
    const baseSetCf = (data.totalSetStats.cf || 0) - (data.tagBuffs.cf || 0);
    const tagCf = (data.tagBuffs.cf || 0);
    const setTagCfTotal = baseSetCf + tagCf;
    const baseSetCm = (data.totalSetStats.cdmg || data.totalSetStats.cm || 0) - (data.tagBuffs.cdmg || data.tagBuffs.cm || 0);
    const tagCm = (data.tagBuffs.cdmg || data.tagBuffs.cm || 0);
    const setTagCmTotal = baseSetCm + tagCm;
    const preConditionalDmg = data.dmgVal / (data.conditionalData ? data.conditionalData.mult : 1);

    // --- SUN GOD HTML (Base Damage Section) ---
    let headDmgHtml = '';
    if (data.headBuffs && data.headBuffs.type === 'sun_god') {
        const uptimePct = (data.headBuffs.uptime || 0);
        headDmgHtml = `
        <tr class="mt-row-sungod"><td colspan="3" class="p-2">
            <div class="mt-flex-between mb-2"><span class="text-gold mt-text-bold text-xs tracking-sm">SUN GOD PASSIVE</span><button class="calc-info-btn" onclick="openInfoPopup('sungod_passive')">?</button></div>
            
            <div class="mt-flex-between text-xs text-white mb-1">
                <span class="opacity-70">Range Stat:</span>
                <span class="mt-font-mono mt-text-right mt-text-range">${fmt.fix(data.range, 1)}</span>
            </div>
            <div class="mt-flex-between text-xs text-white mb-3">
                <span class="opacity-70">Uptime:</span>
                <span class="mt-font-mono mt-text-right ${uptimePct >= 1 ? 'mt-text-green' : 'mt-text-orange'}">${fmt.fix(uptimePct * 100, 1)}%</span>
            </div>

            <div class="mt-flex-between mt-border-top mt-pt-sm"><span class="text-white text-xs text-bold">Avg Damage Buff</span><span class="text-gold text-sm mt-text-bold"> +${fmt.num(data.headBuffs.dmg)}%</span></div>
        </td></tr>`;
    }

    let headDotRow = '';

    const statPointsHtml = (data.dmgPoints !== undefined) ? `
    <tr>
        <td class="mt-cell-label">Stat Points (Dmg) <button class="calc-info-btn" onclick="openInfoPopup('level_scale')">?</button></td>
        <td class="mt-cell-formula">x${fmt.fix(data.lvStats.dmgMult, 2)}</td>
        <td class="mt-cell-val">${fmt.num(data.baseStats.dmg * data.lvStats.dmgMult)}</td>
    </tr>`
        : `
    <tr>
        <td class="mt-cell-label">Level Scaling <button class="calc-info-btn" onclick="openInfoPopup('level_scale')">?</button></td>
        <td class="mt-cell-formula"><span class="op">×</span>${fmt.fix(levelMult, 3)}</td>
        <td class="mt-cell-val">${fmt.num(data.baseStats.dmg * levelMult)}</td>
    </tr>`;

    const dotColorClass = data.dot > 0 ? 'text-accent-end' : 'text-dark-dim';

    const leftPanelHtml = (data.summonData) ? `
        <div class="modal-side-content">
            <div class="math-header" style="font-size: 0.55rem; color: #fff; opacity: 0.5; margin-bottom: 12px; letter-spacing: 1px; padding-left: 4px;">
                ${data.summonData.isCustom ? 'UNIT SUMMONS' : (data.baseStats.id === 'nutaru_beast' ? 'CLONE LOGIC' : 'PLANE LOGIC')}
            </div>
            
            ${data.summonData.isCustom ? 
                data.summonData.summons.map(s => `
                <div class="math-section" style="border: 1px solid ${s.color}44; border-left: 4px solid ${s.color}; padding: 10px 14px; background: linear-gradient(135deg, ${s.color}15 0%, rgba(0,0,0,0) 100%); margin-bottom: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                    <div class="math-header" style="font-size: 0.5rem; margin-bottom: 12px; letter-spacing: 1px; opacity: 0.8; font-weight: 900; color: ${s.color};">${s.name.toUpperCase()}</div>
                    <div class="math-row" style="margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px;">
                        <span style="font-size: 0.5rem; font-weight: 700; opacity: 0.7;">HIT DAMAGE</span>
                        <b class="text-white" style="font-size: 0.75rem;">${fmt.num(s.hitDmg)}</b>
                    </div>
                    <div class="math-row" style="margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px;">
                        <span style="font-size: 0.5rem; font-weight: 700; opacity: 0.7;">LOCKED SPA</span>
                        <b class="text-white" style="font-size: 0.75rem;">${fmt.fix(s.spa, 2)}s</b>
                    </div>
                    <div class="math-row">
                        <span style="font-size: 0.5rem; font-weight: 700; opacity: 0.7;">SUMMON DPS</span>
                        <b class="math-val-gold" style="font-size: 0.8rem;">${fmt.num(s.dps)}</b>
                    </div>
                </div>`).join('')
            : ''}
            
            ${data.summonData.isCustom ? `
                <div class="math-section" style="border: 1px solid rgba(251, 191, 36, 0.3); border-left: 4px solid #fbbf24; padding: 10px 14px; background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(0,0,0,0) 100%); margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                    <div class="math-header" style="font-size: 0.5rem; margin-bottom: 6px; letter-spacing: 1px; opacity: 0.8; font-weight: 900; color: #fbbf24;">TOTAL (WITH SUMMONS)</div>
                    <div class="math-row">
                        <span style="font-size: 0.5rem; font-weight: 700; opacity: 0.7;">TOTAL DPS</span>
                        <b class="math-val-gold" style="font-size: 0.9rem;">${fmt.num(data.total)}</b>
                    </div>
                </div>
            ` : ''}

            <div style="margin-top: 10px;">
                ${renderSummonSection(data)}
            </div>
        </div>
    ` : '';

    // No more right panel - merged into main panel toggle
    const rightPanelHtml = '';

    const summarySection = `
        <div class="modal-side-content">
            <div style="margin-bottom: 12px;">${renderOverviewSection(data)}</div>
            <div style="margin-bottom: 12px;">${renderBuffSummarySection(data)}</div>
        </div>
    `;

    const mainContent = `
        <div class="breakdown-wrapper">
            ${identityHtml}
            <div class="breakdown-top-panels" style="position: relative; margin-bottom: 15px;">
                ${!isSplit && leftPanelHtml ? `<div class="breakdown-panel" style="margin-bottom: 12px;">${leftPanelHtml}</div>` : ''}
                
                <div class="top-toggle-container" style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
                    <button class="top-view-btn" onclick="toggleTopPanel(this)" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; font-size: 0.55rem; font-weight: 800; padding: 4px 10px; border-radius: 4px; cursor: pointer; letter-spacing: 1px;">
                        <span>VIEW SUMMARY & BUFFS</span>
                    </button>
                </div>

                <div class="breakdown-panel breakdown-panel--left" style="display: block;">
                    ${renderSourceTotalsSection(data)}
                </div>

                <div class="breakdown-panel breakdown-panel--right hidden" style="display: none;">
                    ${summarySection}
                </div>
            </div>
            
            <style>
                .hidden { display: none !important; }
                .top-view-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
                @media (max-width: 992px) {
                    .top-toggle-container { display: flex !important; margin-top: 8px; }
                    /* Ensure panels respect the .hidden class on mobile instead of being forced hidden/visible */
                    .breakdown-panel--right:not(.hidden) { display: block !important; }
                    .breakdown-panel--left:not(.hidden) { display: block !important; }
                }
            </style>

            ${renderQuickBreakdownSection(data, avgHitPerUnit, dotColorClass)}
            ${renderActiveBuffsSection(data)}
            <div class="deep-dive-trigger" onclick="toggleDeepDive(this)"><span>Full Calculation Log</span><span class="dd-arrow text-accent-start">▼</span></div>
            <div class="deep-dive-content hidden">
                ${renderBaseDamageSection(data, levelMult, traitRowsDmg, dmgAfterRelic, headDmgHtml, preConditionalDmg, baseSetDmg, tagDmg, passiveDmg, eternalDmg, statPointsHtml)}
                ${renderCritSection(data, setTagCfTotal, setTagCmTotal)}
                ${renderSpaSection(data, traitRowsSpa, baseSetSpa, tagSpa, passiveSpa)}
                ${renderRangeSection(data)}
                ${renderAttackRateSection(data)}
                ${renderDotSection(data, headDotRow)}
                ${!isSplit ? renderSummonSection(data) : ''}
                ${renderFinalSection(data)}
            </div>
        </div>
    `;

    if (isSplit) {
        return { content: mainContent, leftPanel: leftPanelHtml, rightPanel: rightPanelHtml };
    }
    return mainContent;
}

function renderSummonSection(data) {
    if (!data.summonData) return '';
    if (data.summonData && data.summonData.isCustom && data.summonData.summons && data.summonData.summons.length > 0) {
        let summonsHtml = data.summonData.summons.map(s => `
                <tr class="summon-header-row">
                    <td class="mt-cell-label mt-text-bold" style="color: ${s.color}; font-size: 0.85rem;">
                        ${s.name}
                    </td>
                    <td class="mt-cell-val" style="vertical-align: bottom;">
                        <button class="summon-info-btn" onclick="toggleSummonDesc(this)">VIEW INFO</button>
                    </td>
                </tr>
                <tr class="summon-desc-row hidden">
                    <td colspan="2" class="mt-cell-label" style="padding: 12px 15px; background: rgba(0,0,0,0.25); border-radius: 8px; margin: 5px 0;">
                        ${s.desc && s.desc.length > 0 ? `
                            <div class="summon-desc-grid">
                                ${s.desc.map(item => `
                                    <div class="summon-desc-tag">
                                        <span class="tag-bullet">•</span> ${item.replace('•', '').trim()}
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<div class="text-dim">No additional description available.</div>'}
                    </td>
                </tr>
                <tr><td class="mt-cell-label mt-pl-sm">Base Hit Damage</td><td class="mt-cell-val">${fmt.num(s.hitDmg)}</td></tr>
                ${s.avgMult && s.avgMult !== 1 ? `<tr><td class="mt-cell-label mt-pl-sm opacity-70">↳ Avg Multiplier (Cycle)</td><td class="mt-cell-val opacity-70">x${fmt.fix(s.avgMult, 3)}</td></tr>` : ''}
                ${s.avgMult && s.avgMult !== 1 ? `<tr><td class="mt-cell-label mt-pl-sm text-accent-start">Avg Cycle Damage</td><td class="mt-cell-val text-accent-start">${fmt.num(s.avgDmg)}</td></tr>` : ''}
                <tr><td class="mt-cell-label mt-pl-sm">Attack Speed (SPA)</td><td class="mt-cell-val">${fmt.fix(s.spa, 2)}s</td></tr>
                <tr class="mt-border-top"><td class="mt-cell-label mt-pl-sm text-gold">Final Summon DPS</td><td class="mt-cell-val text-gold text-bold">${fmt.num(s.dps)}</td></tr>
                <tr><td colspan="2" style="height: 12px;"></td></tr>
        `).join('');

        return `
        <div class="dd-section" style="border-left: 3px solid #60a5fa;">
            <div class="dd-title mt-text-blue"><span>Custom Summon Analysis</span></div>
            <table class="calc-table sidebar-table">
                ${summonsHtml}
                <tr class="mt-border-top"><td class="mt-cell-label text-white mt-pt-md" style="font-size: 0.8rem;">TOTAL SUMMON DPS</td><td class="mt-cell-val mt-pt-md text-accent-start text-bold" style="font-size: 0.9rem;">${fmt.num(data.summon)}</td></tr>
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
    const isNutaru = data.baseStats.id === 'nutaru_beast';
    return `
    <div class="dd-section">
        <div class="dd-title text-accent-start"><span>${isNutaru ? 'Clones' : 'Summon Logic (Planes)'}</span></div>
        <table class="calc-table">
            <tr><td class="mt-cell-label">${isNutaru ? 'Single Clone Dmg' : 'Plane Base Damage'}</td><td class="mt-cell-val">${isNutaru ? fmt.num(data.dmgVal * 0.75) : fmt.num(data.dmgVal * 0.5)}</td></tr>
            <tr><td class="mt-cell-label">${isNutaru ? 'Summon Rate' : 'Host SPA (Spawn Rate)'}</td><td class="mt-cell-val">${fmt.fix(data.summonData.hostSpa * (isNutaru ? 8 : 1), 2)}s</td></tr>
            
            <tr><td class="mt-cell-label mt-pt-md text-white">Active ${isNutaru ? 'Clones' : 'Planes'}</td><td class="mt-cell-val mt-pt-md text-gold text-bold">${fmt.fix(data.summonData.count, 1)} / ${data.summonData.max}</td></tr>
            <tr><td class="mt-cell-label calc-sub">Avg Duration</td><td class="mt-cell-val calc-sub">${data.summonData.avgDuration}s</td></tr>

            <tr><td class="mt-cell-label mt-pt-md">Avg ${isNutaru ? 'Clone' : 'Plane'} DPS (Individual)</td><td class="mt-cell-val mt-pt-md">${fmt.num(data.summonData.avgPlaneDps)}</td></tr>
            ${isNutaru ? `<tr><td class="mt-cell-label calc-sub">Clone Attack Rate</td><td class="mt-cell-val calc-sub">8.0s</td></tr>` :
            `<tr><td class="mt-cell-label calc-sub">Type A (Explosive)</td><td class="mt-cell-val calc-sub">${fmt.num(data.summonData.dpsA)}</td></tr>
            <tr><td class="mt-cell-label calc-sub">Type B (Mounted)</td><td class="mt-cell-val calc-sub">${fmt.num(data.summonData.dpsB)}</td></tr>`}

            <tr><td class="mt-cell-label text-white mt-pt-md">Total ${isNutaru ? 'Clone' : 'Summon'} DPS (x${data.placement})</td><td class="mt-cell-val mt-pt-md text-accent-start text-bold">${fmt.num(data.summon)}</td></tr>
        </table>
    </div>`;
}

function renderAttackRateSection(data) {
    if (!data.extraAttacks) return '';
    const isKS = data.baseStats.id === 'king_sailor';

    let detailRows = '';
    if (isKS) {
        detailRows = `
            <tr class="mt-border-top"><td class="mt-cell-label mt-pt-md">Chain Logic</td><td class="mt-cell-formula mt-pt-md">1 Tick × 20% (Non-Crit)</td><td class="mt-cell-val mt-pt-md"></td></tr>
            <tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Base Tick Dmg</td><td class="mt-cell-formula"></td><td class="mt-cell-val">${fmt.num(data.extraAttacks.tickDmgVal)}</td></tr>
            <tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Total Chain Output</td><td class="mt-cell-formula"><span class="op">×</span>1</td><td class="mt-cell-val text-gold">${fmt.num(data.extraAttacks.totalChain)}</td></tr>
        `;
    }

    const extraHits = (data.extraAttacks ? data.extraAttacks.extra : 0);

    return `
        <div class="dd-section" style="border-left: 3px solid #4ade80;">
            <div class="dd-title mt-text-green"><span>5. Attack Rate Multiplier</span> <button class="calc-info-btn" onclick="openInfoPopup('attack_rate')">?</button></div>
            <table class="calc-table">
                <tr><td class="mt-cell-label">Primary Target Hits</td><td class="mt-cell-formula"></td><td class="mt-cell-val">1.0</td></tr>
                ${extraHits > 0 ? `<tr><td class="mt-cell-label">${data.baseStats.customFollowUp ? 'Follow-Up Multiplier' : 'Extra Hits (Equiv)'}</td><td class="mt-cell-formula">+</td><td class="mt-cell-val">${fmt.fix(extraHits, 2)}</td></tr>` : ''}
                ${data.extraAttacks && data.extraAttacks.usedSpa ? `
                <tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Animation Adj. SPA</td><td class="mt-cell-formula"></td><td class="mt-cell-val text-accent-start">${fmt.fix(data.extraAttacks.usedSpa, 3)}s</td></tr>
                ` : ''}
                
                ${detailRows}

                <tr class="mt-border-top">
                    <td class="mt-cell-label mt-pt-sm text-white">Final Attack Mult</td>
                    <td class="mt-cell-formula"></td>
                    <td class="mt-cell-val mt-pt-sm calc-highlight" style="font-size: 1.1rem; color: #4ade80;">x${fmt.fix(data.extraAttacks ? data.extraAttacks.mult : 1, 3)}</td>
                </tr>
            </table>
        </div>`;
}

function renderFinalSection(data) {
    const hitLabel = data.placement > 1 ? `Hit DPS (x${data.placement} Units)` : `Hit DPS`;
    const hitFormula = data.placement > 1 ? `<span class="op">×</span>${data.placement}` : ``;
    const isNutaru = data.baseStats.id === 'nutaru_beast';

    return `
            <div class="dd-section border-l-gold">
                <div class="dd-title text-gold">Final Synthesis</div>
                <table class="calc-table">
                    <tr><td class="mt-cell-label">${hitLabel}</td><td class="mt-cell-formula">${hitFormula}</td><td class="mt-cell-val calc-highlight">${fmt.num(data.trueDmgMult > 1 ? data.baseHitDps : data.hit)}</td></tr>
                    ${data.trueDmgMult > 1 ? `<tr><td class="mt-cell-label text-accent-start">Sorcerer Hunter (True Dmg)</td><td class="mt-cell-formula"><span class="op">×</span>1.15</td><td class="mt-cell-val text-accent-start">${fmt.num(data.hit)}</td></tr>` : ''}
                    ${data.dot > 0 ? `<tr><td class="mt-cell-label">DoT DPS</td><td class="mt-cell-formula">+</td><td class="mt-cell-val text-accent-end">${fmt.num(data.dot)}</td></tr>` : ''}
                    ${data.summon > 0 ? `<tr><td class="mt-cell-label">${isNutaru ? 'Clone' : (data.summonData?.isCustom ? 'Custom Summon' : 'Plane')} DPS</td><td class="mt-cell-formula">+</td><td class="mt-cell-val text-accent-start">${fmt.num(data.summon)}</td></tr>` : ''}
                    <tr>
                        <td class="mt-cell-label text-white mt-pt-md" style="font-size: 1.1rem; font-weight: 800;">TOTAL DPS</td>
                        <td class="mt-cell-formula"></td>
                        <td class="mt-cell-val mt-text-gold mt-pt-md" style="font-size: 1.2rem;">${fmt.num(data.total)}</td>
                    </tr>
                </table>
            </div>`;
}

function renderRangeSection(data) {
    const mTrait = 1 + (data.traitBuffs.range / 100);
    const mRelic = 1 + (data.relicBuffs.range / 100);

    let globalRangeBreakdownHtml = '';
    let globalRangeTotal = 0;
    if (data.activeGlobalBuffs && window.GLOBAL_BUFF_DATA) {
        Object.values(window.GLOBAL_BUFF_DATA).forEach(buff => {
            const bData = data.activeGlobalBuffs[buff.id];
            if (bData && bData.range > 0) {
                globalRangeTotal += bData.range;
                globalRangeBreakdownHtml += `<tr><td class="mt-cell-label mt-pl-md opacity-70" style="color:${buff.color}">↳ ${buff.name}</td><td class="mt-cell-formula" style="color:${buff.color}">${fmt.pct(bData.range)}</td><td class="mt-cell-val"></td></tr>`;
            }
        });
    }

    const totalAdditiveRange = (data.totalSetStats.range || 0) + (data.passiveRange || 0) + globalRangeTotal;
    const mAdditive = 1 + (totalAdditiveRange / 100);
    const basePassiveRange = (data.passiveRange || 0) - (data.eternalRangeBuff || 0);
    const setRange = data.totalSetStats.range || 0;
    const hasEternal = (data.eternalRangeBuff || 0) > 0;
    const additiveLabel = hasEternal ? "Set Bonus + Passive + Eternal" : "Set Bonus + Passive";

    return `
        <div class="dd-section">
            <div class="dd-title" style="color: #fbbf24"><span>4. Range Calculation</span> <button class="calc-info-btn" onclick="openInfoPopup('stat_range')">?</button></div>
            <table class="calc-table">
                <tr><td class="mt-cell-label">Base Range (Lv 1)</td><td class="mt-cell-formula"></td><td class="mt-cell-val">${data.baseStats.range || 0}</td></tr>
                
                <tr><td class="mt-cell-label">Scaling (Level + Points)</td><td class="mt-cell-formula"><span class="op">×</span>${fmt.fix(data.lvStats.rangeMult, 3)}</td><td class="mt-cell-val">${fmt.fix(data.lvStats.range / (data.isSSS ? 1.2 : 1), 2)}</td></tr>
                
                ${data.isSSS ? `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ SSS Rank Bonus</td><td class="mt-cell-formula"><span class="op">×</span>1.2</td><td class="mt-cell-val">${fmt.fix(data.lvStats.range, 2)}</td></tr>` : ''}

                <tr class="mt-border-top"><td class="mt-cell-label mt-pt-md">Trait Multiplier</td><td class="mt-cell-formula mt-pt-md">x${fmt.fix(mTrait, 2)}</td><td class="mt-cell-val mt-pt-md">${fmt.pct(data.traitBuffs.range)}</td></tr>
                
                <tr><td class="mt-cell-label">Relic Substats</td><td class="mt-cell-formula">x${fmt.fix(mRelic, 2)}</td><td class="mt-cell-val">${fmt.pct(data.relicBuffs.range)}</td></tr>
                
                <tr><td class="mt-cell-label mt-pt-md">${additiveLabel}</td><td class="mt-cell-formula mt-pt-md">x${fmt.fix(mAdditive, 2)}</td><td class="mt-cell-val mt-pt-md">${fmt.pct(totalAdditiveRange)}</td></tr>
                
                ${setRange > 0 ? `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Set Bonus</td><td class="mt-cell-formula">${fmt.pct(setRange)}</td><td class="mt-cell-val"></td></tr>` : ''}
                ${basePassiveRange > 0 ? `<tr><td class="mt-cell-label mt-pl-md opacity-70">↳ Unit Passive</td><td class="mt-cell-formula">${fmt.pct(basePassiveRange)}</td><td class="mt-cell-val"></td></tr>` : ''}
                ${(data.eternalRangeBuff > 0) ? `<tr><td class="mt-cell-label mt-pl-md text-accent-start opacity-70">↳ Eternal Stacks</td><td class="mt-cell-formula text-accent-start">${fmt.pct(data.eternalRangeBuff)}</td><td class="mt-cell-val"></td></tr>` : ''}
                ${globalRangeBreakdownHtml}

                <tr class="mt-border-top"><td class="mt-cell-label mt-pt-sm text-white">Final Range Result</td><td class="mt-cell-formula"></td><td class="mt-cell-val mt-pt-sm mt-text-bold" style="color: #fbbf24">${fmt.fix(data.range, 2)}</td></tr>
            </table>
        </div>`;
}