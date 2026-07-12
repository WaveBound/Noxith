// ============================================================================
// RELICS.JS - Dedicated Relic Database Tab (Wiki Layout)
// ============================================================================

window.renderRelicDatabase = () => {
    const view = document.getElementById('relicsPage');
    if (!view || typeof SETS === 'undefined') return;

    // Ensure the relics tab button is active in sidebar
    document.querySelectorAll('.dashboard-sidebar .nav-btn').forEach(btn => {
        const click = btn.getAttribute('onclick') || '';
        btn.classList.toggle('active', click.includes("switchPage('relics')"));
    });

    view.innerHTML = `
        <div class="wiki-container">
            <div class="wiki-header">
                <h2>Relic Database</h2>
                <p>Overview of all relic sets, their drop locations, set bonuses, and tag perks.</p>
            </div>
            <div class="wiki-list" id="relicDbContent"></div>
        </div>
        
        <style>
            #relicsPage.page.active {
                display: block !important;
                width: 100%;
            }
            .wiki-container {
                padding: 0 25px 50px 25px;
                max-width: 100%;
                margin: 0 auto;
                font-family: var(--font-family, inherit);
            }
            .wiki-header {
                margin-bottom: 25px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                padding-bottom: 15px;
            }
            .wiki-header h2 {
                color: #fff;
                font-size: 1.6rem;
                font-weight: 800;
                margin: 0 0 6px 0;
            }
            .wiki-header p {
                color: #94a3b8;
                font-size: 0.85rem;
                margin: 0;
            }
            .wiki-list {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            /* Wiki Row Item */
            .wiki-row {
                background: #0d0e12;
                border: 1px solid #1e293b;
                border-radius: 12px;
                display: flex;
                gap: 20px;
                padding: 20px;
                transition: border-color 0.2s;
            }
            .wiki-row:hover {
                border-color: #3b82f6;
            }
            
            /* Left side: Images and Placeholders */
            .wiki-visuals {
                display: flex;
                flex-direction: column;
                gap: 12px;
                width: 260px;
                flex-shrink: 0;
            }
            
            /* Map Placeholder Box */
            .wiki-map-placeholder {
                width: 100%;
                height: 140px;
                background: #1e293b;
                border: 2px dashed #475569;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
            }
            .wiki-map-placeholder svg {
                width: 32px;
                height: 32px;
                color: #64748b;
                margin-bottom: 4px;
            }
            .wiki-map-text {
                font-size: 0.72rem;
                color: #94a3b8;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                text-align: center;
            }
            .wiki-map-img {
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                opacity: 0.4;
            }
            
            /* Relic Items Icons Bar */
            .wiki-relic-pieces {
                display: flex;
                justify-content: space-between;
                gap: 6px;
            }
            .wiki-piece-icon-wrapper {
                flex: 1;
                aspect-ratio: 1;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                padding: 6px;
            }
            .wiki-piece-icon {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }
            .wiki-piece-label {
                position: absolute;
                bottom: 2px;
                font-size: 0.45rem;
                font-weight: 900;
                color: rgba(255, 255, 255, 0.5);
                text-transform: uppercase;
            }
            
            /* Right side: Relic Information */
            .wiki-info {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                gap: 12px;
                min-width: 0;
            }
            
            .wiki-row-header {
                display: flex;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
            }
            .wiki-row-title {
                font-size: 1.35rem;
                font-weight: 800;
                color: #fff;
                margin: 0;
            }
            .wiki-badge {
                font-size: 0.6rem;
                padding: 2px 8px;
                border-radius: 4px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border: 1px solid transparent;
            }
            .badge-secret {
                background: rgba(167, 139, 250, 0.1);
                color: #c084fc;
                border-color: rgba(167, 139, 250, 0.2);
            }
            .badge-mythical {
                background: rgba(245, 158, 11, 0.1);
                color: #fbbf24;
                border-color: rgba(245, 158, 11, 0.2);
            }
            .badge-source {
                background: rgba(255, 255, 255, 0.05);
                color: #94a3b8;
                border-color: rgba(255, 255, 255, 0.1);
            }
            
            .wiki-location-desc {
                font-size: 0.78rem;
                color: #cbd5e1;
                line-height: 1.4;
            }
            .wiki-location-desc strong {
                color: #60a5fa;
            }
            
            /* Stats Layout */
            .wiki-stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                gap: 12px;
                flex-grow: 1;
            }
            .wiki-stats-box {
                background: rgba(255, 255, 255, 0.01);
                border: 1px solid rgba(255, 255, 255, 0.03);
                border-radius: 8px;
                padding: 12px;
            }
            .wiki-stats-title {
                font-size: 0.6rem;
                font-weight: 900;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.8px;
                margin-bottom: 6px;
            }
            .wiki-stats-content {
                font-size: 0.76rem;
                color: #e2e8f0;
                font-weight: 700;
            }
            
            /* Passive Description formatting */
            .wiki-passive-box {
                margin-top: 4px;
                padding-top: 4px;
                border-top: 1px solid rgba(255, 255, 255, 0.05);
            }
            .wiki-passive-title {
                font-size: 0.7rem;
                font-weight: 800;
                color: #60a5fa;
            }
            .wiki-passive-desc {
                font-size: 0.68rem;
                color: #94a3b8;
                font-weight: 500;
                margin-top: 2px;
                line-height: 1.4;
            }
            
            /* Tag Perks List */
            .wiki-tags-list {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .wiki-tag-item {
                display: flex;
                align-items: flex-start;
                gap: 8px;
                font-size: 0.7rem;
            }
            .wiki-tag-badge {
                font-size: 0.55rem;
                padding: 1px 6px;
                border-radius: 4px;
                background: rgba(59, 130, 246, 0.1);
                color: #60a5fa;
                border: 1px solid rgba(59, 130, 246, 0.2);
                font-weight: 800;
                flex-shrink: 0;
            }
            
            /* Responsive */
            @media (max-width: 1100px) {
                .wiki-row {
                    flex-direction: column;
                }
                .wiki-visuals {
                    width: 100%;
                    flex-direction: row;
                    align-items: center;
                }
                .wiki-map-placeholder {
                    width: auto;
                    height: auto;
                    flex: 1.5;
                    align-self: stretch;
                    flex-shrink: 0;
                }
                .wiki-relic-pieces {
                    flex: 3;
                }
            }
            
            /* Custom Build Row styling */
            .wiki-row.wiki-custom-row {
                border-color: rgba(139, 92, 246, 0.4);
                background: linear-gradient(135deg, #0e0d14, #120d1c);
                box-shadow: 0 4px 20px rgba(139, 92, 246, 0.15);
            }
            .wiki-row.wiki-custom-row:hover {
                border-color: #a78bfa;
            }
            .wiki-row.wiki-custom-row .wiki-visuals {
                width: 320px;
                flex-direction: column !important;
                align-items: stretch !important;
            }
            @media (max-width: 1100px) {
                .wiki-row.wiki-custom-row .wiki-visuals {
                    width: 100% !important;
                }
            }
            .wiki-custom-clear-btn {
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.3);
                color: #ef4444;
                font-size: 0.65rem;
                font-weight: 800;
                padding: 2px 8px;
                border-radius: 4px;
                cursor: pointer;
                text-transform: uppercase;
                margin-left: auto;
                transition: all 0.2s;
            }
            .wiki-custom-clear-btn:hover {
                background: rgba(239, 68, 68, 0.2);
                border-color: #ef4444;
            }
        </style>
    `;

    const container = document.getElementById('relicDbContent');
    if (!container) return;

    let customHtml = '';
    if (window.customRelicSetup) {
        const custom = window.customRelicSetup;
        
        const getSetByIdOrHead = (hKey) => {
            let checkId = hKey;
            if (hKey === 'shadow_reaper_necklace') checkId = 'shadow_reaper';
            if (hKey === 'reaper_necklace') checkId = 'reaper_set';
            if (hKey === 'warlord_hat') checkId = 'warlord';
            if (hKey === 'biju_head') checkId = 'biju_set';
            if (hKey === 'reanimated_head') checkId = 'reanimated_ninja';
            if (hKey === 'sorcerer_hunter_spirit') checkId = 'sorcerer_hunter';
            if (hKey === 'strongest_sorcerer_glasses') checkId = 'strongest_sorcerer';
            if (hKey === 'mochi_scarf') checkId = 'mochi';
            if (hKey === 'fused_earrings') checkId = 'fused_set';
            return SETS.find(s => s.id === checkId);
        };

        const headSet = getSetByIdOrHead(custom.head);
        const bodySet = SETS.find(s => s.id === custom.body);
        const legsSet = SETS.find(s => s.id === custom.legs);

        // Group pieces by drop location for up to 3 map previews
        const mapGroups = {};
        if (custom.head && custom.head !== 'none') {
            const loc = headSet?.location || 'Virtual Realm';
            const img = headSet?.locationImage || 'images/location/virtual_realm.png';
            if (!mapGroups[loc]) mapGroups[loc] = { slots: [], image: img };
            mapGroups[loc].slots.push('Head');
        }
        if (custom.body && custom.body !== 'none') {
            const loc = bodySet?.location || 'Unknown Location';
            const img = bodySet?.locationImage || '';
            if (!mapGroups[loc]) mapGroups[loc] = { slots: [], image: img };
            mapGroups[loc].slots.push('Body');
        }
        if (custom.legs && custom.legs !== 'none') {
            const loc = legsSet?.location || 'Unknown Location';
            const img = legsSet?.locationImage || '';
            if (!mapGroups[loc]) mapGroups[loc] = { slots: [], image: img };
            mapGroups[loc].slots.push('Legs');
        }

        const mapHtmls = Object.entries(mapGroups).map(([locationName, data]) => `
            <div class="wiki-map-placeholder" style="flex: 1; height: 110px; margin-bottom: 0; min-width: 100px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px; color: #64748b; margin-bottom: 4px; z-index: 2;">
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                    <line x1="9" y1="3" x2="9" y2="18"></line>
                    <line x1="15" y1="6" x2="15" y2="21"></line>
                </svg>
                <span class="wiki-map-text" style="font-size: 0.62rem; z-index: 2; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; text-align: center;">${data.slots.join(' & ')} MAP</span>
                ${data.image ? `<img src="${data.image}" class="wiki-map-img" onerror="this.style.display='none'">` : ''}
            </div>
        `);

        // Resolve relic piece images using getRelicVisuals
        let headImg = '', bodyImg = '', legsImg = '';
        if (typeof window.getRelicVisuals === 'function') {
            if (custom.head && custom.head !== 'none') {
                let headKeyForImg = custom.head;
                if (headKeyForImg === 'shadow_reaper') headKeyForImg = 'shadow_reaper_necklace';
                if (headKeyForImg === 'reaper_set') headKeyForImg = 'reaper_necklace';
                if (headKeyForImg === 'warlord') headKeyForImg = 'warlord_hat';
                if (headKeyForImg === 'biju_set') headKeyForImg = 'biju_head';
                if (headKeyForImg === 'reanimated_ninja') headKeyForImg = 'reanimated_head';
                if (headKeyForImg === 'sorcerer_hunter') headKeyForImg = 'sorcerer_hunter_spirit';
                if (headKeyForImg === 'strongest_sorcerer') headKeyForImg = 'strongest_sorcerer_glasses';
                headImg = window.getRelicVisuals(headKeyForImg, 'Head').src;
            }
            if (custom.body && custom.body !== 'none') {
                bodyImg = window.getRelicVisuals(custom.body, 'Body').src;
            }
            if (custom.legs && custom.legs !== 'none') {
                legsImg = window.getRelicVisuals(custom.legs, 'Legs').src;
            }
        }

        // Format stats and set bonuses
        const isSameSet = (custom.body === custom.legs && custom.body !== 'none');
        const setBonusHtml = isSameSet && bodySet ? formatRelicBonus(bodySet.bonus) : `<span style="color:#ef4444">None (Mixed Set: ${bodySet?.name || 'Empty'} / ${legsSet?.name || 'Empty'})</span>`;
        const accessoryBonusHtml = headSet ? formatRelicBonus(headSet.accessory) : '<span style="color:#64748b">None</span>';

        // Format tag perks (combine tag perks from all worn sets)
        const combinedTagPerks = [];
        const seenTags = new Set();
        [headSet, bodySet, legsSet].forEach(set => {
            if (!set) return;
            const perks = window.TAG_PERKS?.[set.id] || window.TAG_PERKS?.[set.id + '_set'] || [];
            perks.forEach(p => {
                const key = `${p.tag}_${JSON.stringify(p.bonus)}`;
                if (!seenTags.has(key)) {
                    seenTags.add(key);
                    combinedTagPerks.push(p);
                }
            });
        });

        let tagPerksHtml = '<span style="color:#64748b">None</span>';
        if (combinedTagPerks.length > 0) {
            tagPerksHtml = `
                <div class="wiki-tags-list">
                    ${combinedTagPerks.map(perk => `
                        <div class="wiki-tag-item">
                            <span class="wiki-tag-badge">${perk.tag}</span>
                            <span style="color: #cbd5e1; font-weight: 700;">${formatRelicBonus(perk.bonus)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Determine dynamic title based on equipped sets
        const headTitleName = headSet ? (headSet.name.toLowerCase().includes('set') ? headSet.name : headSet.name + ' Set') : '';
        const isSameSetTitle = (custom.body === custom.legs && custom.body !== 'none');
        const bodyLegsTitleName = isSameSetTitle && bodySet 
            ? (bodySet.name.toLowerCase().includes('set') ? bodySet.name : bodySet.name + ' Set') 
            : 'Mixed Set';

        let rowTitle = '';
        if (headTitleName && bodyLegsTitleName) {
            rowTitle = `Head: ${headTitleName} / Body & Legs: ${bodyLegsTitleName}`;
        } else if (bodyLegsTitleName) {
            rowTitle = `Body & Legs: ${bodyLegsTitleName}`;
        } else if (headTitleName) {
            rowTitle = `Head: ${headTitleName}`;
        } else {
            rowTitle = 'Custom Set';
        }

        customHtml = `
            <div class="wiki-row wiki-custom-row">
                <div class="wiki-visuals" style="width: 320px;">
                    <!-- Map Previews Container -->
                    <div style="display: flex; gap: 8px; width: 100%;">
                        ${mapHtmls.join('')}
                    </div>
                    
                    <!-- Relic Piece Icons -->
                    <div class="wiki-relic-pieces">
                        <div class="wiki-piece-icon-wrapper" title="Head Piece">
                            ${headImg ? `<img src="${headImg}" class="wiki-piece-icon" onerror="this.style.display='none'">` : ''}
                            <span class="wiki-piece-label">Head</span>
                        </div>
                        <div class="wiki-piece-icon-wrapper" title="Body Piece">
                            ${bodyImg ? `<img src="${bodyImg}" class="wiki-piece-icon" onerror="this.style.display='none'">` : ''}
                            <span class="wiki-piece-label">Body</span>
                        </div>
                        <div class="wiki-piece-icon-wrapper" title="Legs Piece">
                            ${legsImg ? `<img src="${legsImg}" class="wiki-piece-icon" onerror="this.style.display='none'">` : ''}
                            <span class="wiki-piece-label">Legs</span>
                        </div>
                    </div>
                </div>
                
                <div class="wiki-info">
                    <div class="wiki-row-header">
                        <h3 class="wiki-row-title">${rowTitle}</h3>
                        <span class="wiki-badge" style="background: rgba(139, 92, 246, 0.15); color: #c084fc; border-color: rgba(139, 92, 246, 0.3);">Active Build</span>
                        <button class="wiki-custom-clear-btn" onclick="window.customRelicSetup = null; window.renderRelicDatabase();">Clear Custom</button>
                    </div>
                    
                    <div class="wiki-location-desc">
                        <strong>Obtain Location:</strong> Not Set (Work in Progress)
                    </div>
                    
                    <div class="wiki-stats-grid">
                        <div class="wiki-stats-box">
                            <div class="wiki-stats-title">2-Piece Set Bonus</div>
                            <div class="wiki-stats-content">${setBonusHtml}</div>
                        </div>
                        
                        <div class="wiki-stats-box">
                            <div class="wiki-stats-title">Accessory (Head) Set Bonus</div>
                            <div class="wiki-stats-content">${accessoryBonusHtml}</div>
                        </div>
                        
                        <div class="wiki-stats-box" style="grid-column: span 1;">
                            <div class="wiki-stats-title">Tag Perks</div>
                            <div class="wiki-stats-content">${tagPerksHtml}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    container.innerHTML = customHtml + SETS.map(item => {
        const isSecret = item.rarity === 'Secret';
        const rarityBadge = isSecret ? '<span class="wiki-badge badge-secret">Secret</span>' : '<span class="wiki-badge badge-mythical">Mythical</span>';
        const sourceBadge = `<span class="wiki-badge badge-source">${item.source}</span>`;

        // Resolve relic piece images using getRelicVisuals
        let headImg = '', bodyImg = '', legsImg = '';
        if (typeof window.getRelicVisuals === 'function') {
            let headKey = item.id;
            if (headKey === 'shadow_reaper') headKey = 'shadow_reaper_necklace';
            if (headKey === 'reaper_set') headKey = 'reaper_necklace';
            if (headKey === 'warlord') headKey = 'warlord_hat';
            if (headKey === 'biju_set') headKey = 'biju_head';
            if (headKey === 'reanimated_ninja') headKey = 'reanimated_head';
            if (headKey === 'sorcerer_hunter') headKey = 'sorcerer_hunter_spirit';
            if (headKey === 'strongest_sorcerer') headKey = 'strongest_sorcerer_glasses';

            headImg = window.getRelicVisuals(headKey, 'Head').src;
            bodyImg = window.getRelicVisuals(item.id, 'Body').src;
            legsImg = window.getRelicVisuals(item.id, 'Legs').src;
        }

        // Format stats
        const setBonusHtml = formatRelicBonus(item.bonus);
        const accessoryBonusHtml = formatRelicBonus(item.accessory);

        // Format tag perks
        const tagPerks = window.TAG_PERKS?.[item.id] || window.TAG_PERKS?.[item.id + '_set'] || [];
        let tagPerksHtml = '<span style="color:#64748b">None</span>';
        if (tagPerks.length > 0) {
            tagPerksHtml = `
                <div class="wiki-tags-list">
                    ${tagPerks.map(perk => `
                        <div class="wiki-tag-item">
                            <span class="wiki-tag-badge">${perk.tag}</span>
                            <span style="color: #cbd5e1; font-weight: 700;">${formatRelicBonus(perk.bonus)}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        return `
            <div class="wiki-row">
                <div class="wiki-visuals">
                    <!-- Map/Place Placeholder Box -->
                    <div class="wiki-map-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
                            <line x1="9" y1="3" x2="9" y2="18"></line>
                            <line x1="15" y1="6" x2="15" y2="21"></line>
                        </svg>
                        <span class="wiki-map-text">MAP PREVIEW</span>
                        ${item.locationImage ? `<img src="${item.locationImage}" class="wiki-map-img" onerror="this.style.display='none'">` : ''}
                    </div>
                    
                    <!-- Relic Piece Icons -->
                    <div class="wiki-relic-pieces">
                        <div class="wiki-piece-icon-wrapper" title="Head Piece">
                            ${headImg ? `<img src="${headImg}" class="wiki-piece-icon" onerror="this.style.display='none'">` : ''}
                            <span class="wiki-piece-label">Head</span>
                        </div>
                        <div class="wiki-piece-icon-wrapper" title="Body Piece">
                            ${bodyImg ? `<img src="${bodyImg}" class="wiki-piece-icon" onerror="this.style.display='none'">` : ''}
                            <span class="wiki-piece-label">Body</span>
                        </div>
                        <div class="wiki-piece-icon-wrapper" title="Legs Piece">
                            ${legsImg ? `<img src="${legsImg}" class="wiki-piece-icon" onerror="this.style.display='none'">` : ''}
                            <span class="wiki-piece-label">Legs</span>
                        </div>
                    </div>
                </div>
                
                <div class="wiki-info">
                    <div class="wiki-row-header">
                        <h3 class="wiki-row-title">${item.name}</h3>
                        ${rarityBadge}
                        ${sourceBadge}
                    </div>
                    
                    <div class="wiki-location-desc">
                        <strong>Obtain Location:</strong> Not Set (Work in Progress)
                    </div>
                    
                    <div class="wiki-stats-grid">
                        <div class="wiki-stats-box">
                            <div class="wiki-stats-title">2-Piece Set Bonus</div>
                            <div class="wiki-stats-content">${setBonusHtml}</div>
                        </div>
                        
                        <div class="wiki-stats-box">
                            <div class="wiki-stats-title">Accessory (Head) Set Bonus</div>
                            <div class="wiki-stats-content">${accessoryBonusHtml}</div>
                        </div>
                        
                        <div class="wiki-stats-box" style="grid-column: span 1;">
                            <div class="wiki-stats-title">Tag Perks</div>
                            <div class="wiki-stats-content">${tagPerksHtml}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
};

function formatRelicBonus(bonus) {
    if (!bonus) return '<span style="color:#64748b">None</span>';
    const parts = [];
    if (bonus.dmg) parts.push(`+${bonus.dmg}% DMG`);
    if (bonus.spa) parts.push(`-${bonus.spa}% SPA`);
    if (bonus.range) parts.push(`+${bonus.range}% Rng`);
    if (bonus.cRate) parts.push(`+${bonus.cRate}% Crit`);
    if (bonus.cDmg) parts.push(`+${bonus.cDmg}% CDmg`);
    if (bonus.dot) parts.push(`+${bonus.dot}% DoT`);
    if (bonus.trueDmg) parts.push(`+${bonus.trueDmg}% True DMG`);
    if (bonus.meterGain) parts.push(`+${bonus.meterGain}% Meter`);
    if (bonus.abilityCd) parts.push(`-${bonus.abilityCd}% Skill CD`);
    if (bonus.upgradeRefund) parts.push(`+${bonus.upgradeRefund}% Refund`);
    if (bonus.buffReceivedMultiplier) parts.push(`+${Math.round((bonus.buffReceivedMultiplier - 1)*100)}% Buff Potency`);
    if (bonus.buffGainMultiplier) parts.push(`+${Math.round((bonus.buffGainMultiplier - 1)*100)}% Global Buff Gain`);
    if (bonus.elemental) {
        const elems = Object.entries(bonus.elemental).map(([el, val]) => `+${val}% ${el}`).join(', ');
        parts.push(`Elemental (${elems})`);
    }
    if (bonus.passive) {
        const passiveData = window.PASSIVES?.[bonus.passive];
        if (passiveData) {
            parts.push(`
                <div class="wiki-passive-box">
                    <div class="wiki-passive-title">${passiveData.name}</div>
                    <div class="wiki-passive-desc">${passiveData.desc}</div>
                </div>
            `);
        } else {
            parts.push(`<div class="wiki-passive-box">Passive: ${bonus.passive}</div>`);
        }
    }
    return parts.length ? parts.join(' | ') : 'Special Effects';
}