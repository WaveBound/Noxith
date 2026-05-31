// ============================================================================
// RELICS.JS - Dedicated Relic Database Tab
// ============================================================================

window.renderRelicDatabase = (mode) => {
    const view = document.getElementById('relicsPage');
    if (!view || typeof RELIC_DATABASE_DATA === 'undefined') return;

    // Build base structure if it doesn't exist
    let container = document.getElementById('relicDbContent');
    if (!container) {
        view.innerHTML = `
            <div class="relic-db-nav" id="relicDbNav">
                <button class="db-nav-btn active" id="btn-story" onclick="renderRelicDatabase('story')">Story / Legend</button>
                <button class="db-nav-btn" id="btn-raids" onclick="renderRelicDatabase('raids')">Raids</button>
                <button class="db-nav-btn" id="btn-virtual" onclick="renderRelicDatabase('virtual')">Virtual Realm (Heads)</button>
            </div>
            <div class="db-grid" id="relicDbContent"></div>
            <style>
                .relic-db-nav { display: flex; gap: 10px; flex-wrap: wrap; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px; }
                .db-nav-btn { background: #1a1a1a; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; transition: 0.2s; }
                .db-nav-btn:hover { background: #262626; color: #fff; }
                .db-nav-btn.active { border-color: #60a5fa; color: #60a5fa; background: rgba(96, 165, 250, 0.05); }
                .db-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; animation: fadeIn 0.3s ease; }
                .db-card { background: #111116; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
                .db-card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 8px; }
                .db-set-name { color: #fff; font-weight: 800; font-size: 0.95rem; letter-spacing: -0.2px; }
                .db-location-badge { font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; background: rgba(139, 92, 246, 0.1); color: #a78bfa; font-weight: 900; text-transform: uppercase; }
                .db-card-body { display: flex; flex-direction: column; gap: 5px; }
                .db-info-row { display: flex; gap: 10px; font-size: 0.7rem; align-items: baseline; }
                .db-label { color: #64748b; font-weight: 700; width: 65px; flex-shrink: 0; text-transform: uppercase; font-size: 0.6rem; }
                .db-val { color: #cbd5e1; font-weight: 600; }
                .db-piece-row { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 8px; }
                .db-piece-tag { font-size: 0.55rem; padding: 1px 6px; border-radius: 4px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); color: #94a3b8; font-weight: 700; }
            </style>
        `;
        container = document.getElementById('relicDbContent');
    }

    // Update active tab button
    document.querySelectorAll('.db-nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-' + mode)?.classList.add('active');

    const data = RELIC_DATABASE_DATA[mode] || [];
    container.innerHTML = data.map(item => `
        <div class="db-card" style="${mode === 'raids' ? 'border-color: rgba(244, 63, 94, 0.1);' : (mode === 'virtual' ? 'border-color: rgba(96, 165, 250, 0.1);' : '')}">
            <div class="db-card-header">
                <span class="db-set-name">${mode === 'virtual' ? item.name : item.set}</span>
                <span class="db-location-badge" style="${mode === 'raids' ? 'background: rgba(244, 63, 94, 0.1); color: #fb7185;' : (mode === 'virtual' ? 'background: rgba(96, 165, 250, 0.1); color: #60a5fa;' : '')}">${mode.toUpperCase()}</span>
            </div>
            <div class="db-card-body">
                ${mode === 'story' ? `
                    <div class="db-info-row"><span class="db-label">Mission:</span><span class="db-val">${item.name} (${item.area})</span></div>
                    <div class="db-info-row"><span class="db-label">Legend:</span><span class="db-val">${item.legend}</span></div>
                ` : mode === 'raids' ? `
                    <div class="db-info-row"><span class="db-label">Raid:</span><span class="db-val">${item.name}</span></div>
                    <div class="db-info-row"><span class="db-label">Note:</span><span class="db-val">${item.info}</span></div>
                ` : `
                    <div class="db-info-row"><span class="db-label">Set:</span><span class="db-val">${item.set}</span></div>
                    <div class="db-info-row"><span class="db-label">Cost:</span><span class="db-val">${item.cost}</span></div>
                `}
            </div>
            <div class="db-piece-row">${(item.drops || [item.type]).map(d => `<span class="db-piece-tag" style="${mode === 'raids' ? 'color: #fb7185;' : (mode === 'virtual' ? 'color: #60a5fa;' : '')}">${d}</span>`).join('')}</div>
        </div>`).join('');
};