// ============================================================================
// HOTBAR.JS - Unit Selection Hotbar Logic (Optimized & Isolated)
// ============================================================================

(() => {
    // --- LOCAL HELPERS ---
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];
    const callWin = (fn, ...args) => typeof window[fn] === 'function' ? window[fn](...args) : null;
    const isUnit = (id, target) => typeof window.isUnit === 'function' ? window.isUnit(id, target) : false;

    // Lexical global checks for formatting helpers
    const formatVal = (v) => typeof format === 'function' ? format(v) : v;
    const fix1Val = (v) => typeof fix1 === 'function' ? fix1(v) : (v != null ? v.toFixed(1) : '');
    const fix2Val = (v) => typeof fix2 === 'function' ? fix2(v) : (v != null ? v.toFixed(2) : '');

    // --- STATE ---
    const hotbarState = {
        slots: Array(6).fill(null),
        fusionMode: false,
        activeFusionIds: [],
        buffState: {},
        fernTargets: []
    };

    const getAvailableFusions = () => {
        const ids = hotbarState.slots.filter(Boolean).map(u => u.id);
        const getUId = name => callWin('getUnitId', name);
        const has = name => ids.includes(getUId(name));
        const fusions = [];
        if (has('nutaru_beast') && has('ancient_shinob')) fusions.push({ id: getUId('unparalleled_armor'), name: 'Unparalleled Armor (Syncro)', img: 'images/units/UnparalleledArmor.png', components: [getUId('nutaru_beast'), getUId('ancient_shinob')] });
        if (has('nutaru_beast') && has('sasuke_great_war')) fusions.push({ id: getUId('majestic_armor'), name: 'Majestic Armor (Syncro)', img: 'images/units/MajesticArmor.png', components: [getUId('nutaru_beast'), getUId('sasuke_great_war')] });
        return fusions;
    };

    const getActiveFusions = () => getAvailableFusions().filter(f => hotbarState.activeFusionIds.includes(f.id));

    const toggleFusion = (armorId) => {
        const idx = hotbarState.activeFusionIds.indexOf(armorId);
        idx === -1 ? hotbarState.activeFusionIds.push(armorId) : hotbarState.activeFusionIds.splice(idx, 1);
        hotbarState.fusionMode = hotbarState.activeFusionIds.length > 0;
        recalculateHotbarTeam();
        updateHotbarUI();
    };

    const recalculateHotbarTeam = () => {
        const savedDb = window.STATIC_BUILD_DB;
        window.STATIC_BUILD_DB = window.HOTBAR_STATIC_BUILD_DB || savedDb;
        callWin('applyBuffContext', hotbarState.buffState);

        const hidden = $('#hotbarHiddenRender');
        const uniqueIds = [...new Set([...hotbarState.slots.filter(Boolean).map(u => u.id), ...hotbarState.activeFusionIds])];

        // Two-Pass Update: Process dependency-based units last so they see updated ally stats (e.g. ABH Ally Crit)
        const dependencyUnits = ['angel_born_in_hell', 'king_sailor', 'underworld_god', 'marine_hero'];
        const sortedIds = [
            ...uniqueIds.filter(id => !dependencyUnits.some(d => isUnit(id, d))),
            ...uniqueIds.filter(id => dependencyUnits.some(d => isUnit(id, d)))
        ];

        // Clear dependency-linked caches for all team members before starting update pass
        // This ensures ABH doesn't read stale builds for allies during his own recalculation.
        sortedIds.forEach(id => {
            if (window.hotbarFilteredBuilds) delete window.hotbarFilteredBuilds[id];
            if (window.unitActiveBuilds) delete window.unitActiveBuilds[id];
        });

        sortedIds.forEach(id => {
            const u = callWin('getUnitById', id);
            if (!u || u.tags?.includes('Assistant')) return;
            if (!$(`#card-${id}`) && hidden && typeof renderUnitCard === 'function') {
                hidden.appendChild(renderUnitCard(u, 0));
            }
            callWin('resetCachesForBuffChange', id);
            callWin('updateBuildListDisplay', id, true);
        });

        window.STATIC_BUILD_DB = savedDb;
        callWin('applyBuffContext', window.GLOBAL_BUFF_STATE || {});
        if (window.CALCULATION_MODE !== 'loadout') callWin('resortUnitCards');
    };

    const getDetailedUnitStats = (unitId) => {
        const unit = callWin('getUnitById', unitId);
        const build = window.hotbarFilteredBuilds?.[unitId];
        if (!unit || !build) return null;
        const placements = build.placement !== undefined ? build.placement : (unit.placement || 1);
        const totalDmg = (build.dmgVal || 0) * placements;
        return { unit, build, dmg: totalDmg, dps: build.dps || 0, bossDps: build.bossDps || 0, teamDmg: totalDmg, teamDps: build.dps || 0, placementsCounted: placements, placements };
    };

    // --- DECLARATIVE CUSTOM UNIT EFFECTS MAP ---
    const CUSTOM_EFFECTS_MAP = {
        'joyful_captain': (u, m, modes) => (modes.includes(2) || modes.includes(3)) ? [
            { label: 'Rubber Control', val: '1.5x DoT', color: '#f43f5e', skipTeam: true },
            { label: 'Rubber Control', val: 'Knockback 10 studs', color: '#f43f5e', skipTeam: true },
            { label: 'Rubber Control', val: '+30% Dmg Taken', color: '#f43f5e', skipTeam: true },
            { label: 'Rubber Control', val: '1.5x DoT | Knockback 10 studs | +30% Dmg Taken', color: '#f43f5e', isTeam: true }
        ] : [],
        'underworld_god': () => [{ label: 'Primordial Power', val: '30% Slow (3s) | +20% DoT/Affliction', color: '#60a5fa' }],
        'water_god': () => {
            const fx = [
                { label: 'Primordial Power', val: '30% Slow (3s) | +20% DoT Duration', color: '#60a5fa' },
                { label: 'God of the Seas', val: '+30% DoT Dmg / Duration to enemies', color: '#38bdf8' }
            ];
            if (hotbarState.slots.some(s => s && isUnit(s.id, 'underworld_god'))) {
                fx.push({ label: 'Divine Accord', val: '-1 Placement Limit (Synergy Active)', color: '#c084fc' });
            }
            return fx;
        },
        'sasuke_great_war': () => [
            { label: 'Pure Hatred', val: 'Applies Hatred (5s) | +15% Dmg Taken', color: '#a855f7' },
            { label: 'Dark Stun', val: 'Stuns Dark enemies for 3s', color: '#fcd34d' }
        ],
        'crow_shinobi': () => [
            { label: 'Amaterasu', val: 'Passive', color: '#f87171' },
            { label: 'Time Snail', val: '+20% DoT & Status | 30% Slow (3s)', color: '#fb923c' }
        ],
        'the_strongest_in_history': (u, m, modes) => {
            const fx = [{ label: 'The Shadows', val: '+15-35% Dmg Taken (Marks)', color: '#f87171' }];
            if (modes.includes(1) || modes.includes(2)) fx.push({ label: 'Ten Umbra', val: 'Stun (3s) | 40% Bleed | 20% Radiation', color: '#c084fc' });
            fx.push({ label: 'Domain Expansion', val: '20% Slow | +20% Dmg Taken', color: '#f43f5e' });
            return fx;
        },
        'the_strongest_of_today': (u) => {
            const isToggled = window.activeAbilityIds?.has(u.id);
            return [
                { label: 'Limitless', val: '40% Slow (5s)', color: '#60a5fa' },
                { label: 'Infinity', val: '1.25x Dmg Taken', color: '#38bdf8' },
                { label: 'On Crit', val: 'Timestops enemies for 4s', color: '#a78bfa' },
                { label: 'Domain Expansion', val: 'Timestops map for 30s', color: '#c084fc' },
                {
                    label: 'TS Enemy (3x)',
                    val: `<label class="ts-ability-toggle ${isToggled ? 'is-on' : ''}" style="--toggle-color: #f472b6;">
                        <input type="checkbox" ${isToggled ? 'checked' : ''} onchange="window.toggleAbility('${u.id}', this); var lbl=this.closest('.ts-ability-toggle'); lbl.classList.toggle('is-on',this.checked); lbl.querySelector('.ts-ability-status').textContent=this.checked?'ON':'OFF';" style="display:none;">
                        <span class="ts-ability-status">${isToggled ? 'ON' : 'OFF'}</span>
                        <div class="mini-switch"></div>
                    </label>`,
                    color: '#f472b6'
                }
            ];
        },
        'ant_king_savage': (u) => {
            const fx = [{ label: 'Paralyzing Venom', val: '20% Slow (6s)', color: '#fbbf24' }];
            if (u.etherealization && u.etherealization.length >= 4) fx.push({ label: "Monarch's Devotion", val: '+10% Dmg to Team (E4+)', color: '#f472b6' });
            return fx;
        },
        'quake_warlord': () => [
            { label: 'Quake Stun', val: 'Stun for 3s on attack', color: '#fbbf24' },
            { label: 'Quake Slow', val: '40% Slow for 5s on Crit', color: '#60a5fa' }
        ],
        'mochi_pirate': () => [{ label: 'Time Snail', val: '+20% DoT & Status | 30% Slow (3s)', color: '#fb923c' }],
        'jinoo_shadow_monarch': (u, m, modes) => {
            const fx = [{ label: 'Strongest Hunter', val: '+20-30% Dmg to Leveling units', color: '#818cf8' }];
            if (modes.includes(3)) fx.push({ label: 'Shadow Knight', val: '2s Stun', color: '#a78bfa' });
            if (modes.includes(4)) fx.push({ label: 'Ant King', val: '30% Bleed', color: '#f87171' });
            return fx;
        },
        'alpha_devil': (u, m) => m === 'katana' ? [{ label: 'Katana Mode', val: 'Stuns enemies for 3s', color: '#fcd34d' }] : [],
        'devil_hunter': (u, m) => m === 'demoncycle' ? [{ label: 'Demoncycle Mode', val: 'Stuns +2s per DoT applied to enemy', color: '#f87171' }] : [],
        'ultimate_fused_warrior': () => [
            { label: 'Godly Might', val: '1.3x Dmg Taken', color: '#f472b6' }
        ],
        'merciless_god': (u, m, modes) => {
            const fx = [];
            // Check if current mode has Godly Earrings passive
            if (u.modes && Array.isArray(u.modes)) {
                const modeIdx = modes[0] || 0;
                const modeData = u.modes[modeIdx];
                if (modeData && modeData.passives && modeData.passives.some(p => p.name === 'Godly Earrings')) {
                    fx.push({ label: 'Godly Earrings', val: 'Allies gain +50% DoT Dmg', color: '#f472b6' });
                }
            }
            return fx;
        },
        'ancient_mage': (u, m) => m === 'utility' ? [
            { label: 'Utility Stun', val: 'Stun (2s)', color: '#a78bfa' },
            { label: 'Utility Slow', val: '75% Slow for 5s', color: '#38bdf8' }
        ] : [],
        'mimicry_sorcerer': (u, m) => m === 'infinity sorcerer' ? [{ label: 'Infinity Mode', val: '+15% Dmg Taken | 30% Slow (5s) | Stun (3s)', color: '#818cf8' }] : [],
        'enlightenedgod': (u, m) => m === 'shield of fear' ? [{ label: 'Shield of Fear', val: 'Converts Debuffs to Buffs', color: '#fbbf24' }] : [],
        'prodigy_mage': () => [
            { label: 'Prodigy Slow', val: '30% Slow for 5s', color: '#38bdf8' },
            { label: 'Prodigy Stun', val: 'Stun for 2.5s', color: '#a78bfa' }
        ],
        'unparalleled_armor': () => [{ label: 'Ancient Shinobi', val: 'Stun or Confuse (3s)', color: '#fbbf24' }]
    };

    const getLeaderBonus = (leader, activeKey, buffKey, tags, element, bonusFn) => {
        const isLeading = window.CALCULATION_MODE === 'potential' || (leader && isUnit(leader.id, activeKey));
        const isActive = window.CALCULATION_MODE === 'potential' || (window.CALCULATION_MODE === 'loadout' && isLeading) || window[activeKey + 'Active'] || (hotbarState.buffState[buffKey] && isLeading);
        return (isActive && isLeading) ? bonusFn(tags, element) : null;
    };

    function openTeamSummary() {
        const slots = hotbarState.slots.filter(Boolean);
        if (!slots.length) return alert("Your hotbar is empty! Add some units to see the team summary.");

        const HEAD_NAMES = {
            'sun_god': 'Sun God', 'ninja': 'Junior Ninja', 'reaper_necklace': 'Reaper',
            'shadow_reaper_necklace': 'S. Reaper', 'junior': 'Junior Ninja', 'biju_head': 'Biju',
            'reanimated_head': 'Reanimated', 'bloodline_head': 'Bloodline',
            'sorcerer_hunter_spirit': 'S.H. Spirit', 'strongest_sorcerer_glasses': 'Strongest',
            'monarch': 'Monarch Cape', 'warlord_hat': 'Warlord Hat', 'mochi_scarf': 'Mochi Scarf',
            'flaming_donut': 'Flaming Donut', "ultiorras_wings": "Ultiorra's Wings",
            "berserks_cleave": "Berserk's Cleave", 'panther_claws': 'Panther Claws', 'none': 'None'
        };
        const MAIN_STAT_NAMES = {
            body: { 'dmg': 'Damage', 'dot': 'DoT', 'cm': 'Crit Damage' },
            legs: { 'dmg': 'Damage', 'spa': 'SPA', 'cf': 'Crit Rate', 'range': 'Range' }
        };

        const activeBuffs = [];
        if (window.GLOBAL_BUFF_DATA) {
            Object.entries(window.GLOBAL_BUFF_DATA).forEach(([key, config]) => {
                if (hotbarState.buffState[key]) activeBuffs.push({ name: config.name, color: config.color, renderLabel: config.renderLabel || config.desc || '' });
            });
        }

        const leader = hotbarState.slots[0];
        if (leader) {
            if (isUnit(leader.id, 'triple_threat')) {
                activeBuffs.push({ name: "Unrivaled Mark", color: '#a7f3d0', renderLabel: "Mark Synergy: Piece (+50% Dmg -7.5% Cost), Sword (+25% Dmg +10% Range), Wind (+20% Dmg +5% Crit)" });
            } else if (isUnit(leader.id, 'king_sailor') && window.GLOBAL_BUFF_DATA?.kingSailor) {
                activeBuffs.push({ name: "Unrivaled Mark", color: window.GLOBAL_BUFF_DATA.kingSailor.color, renderLabel: "Mark Synergy: Magi (+15% SPA +50% Dmg), Uncontrollable (+10% SPA +30% Dmg), Water (+10% SPA +20% Dmg)" });
            } else if (isUnit(leader.id, 'angel_born_in_hell')) {
                activeBuffs.push({ name: "Unrivaled Mark", color: '#a7f3d0', renderLabel: "Mark Synergy: Fusion (+50% Dmg +50% Crit Dmg), Super Warrior (+30% Dmg -10% CD), Light (+20% Dmg +5% Crit)" });
            }
        }

        let html = `
            <style>
                .ts-ability-toggle { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; user-select: none; vertical-align: middle; }
                .ts-ability-toggle .mini-switch { margin: 0; transform: scale(0.7); flex-shrink: 0; }
                .ts-ability-toggle.is-on .mini-switch { background: var(--toggle-color, #f472b6); }
                .ts-ability-toggle.is-on .mini-switch::after { transform: translateX(14px); }
                .ts-ability-status { font-size: 0.6rem; font-weight: 900; letter-spacing: 0.5px; color: rgba(255,255,255,0.5); }
                .ts-ability-toggle.is-on .ts-ability-status { color: var(--toggle-color, #f472b6); text-shadow: 0 0 6px color-mix(in srgb, var(--toggle-color, #f472b6) 40%, transparent); }
            </style>
            <div class="team-summary-container">
                <div class="ts-modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                    <h2 style="margin: 0; color: #e2e8f0; font-size: 1.4rem; display: flex; align-items: center; gap: 10px; font-weight: 900; letter-spacing: 1.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
                        <i class="fas fa-swords" style="color: var(--accent-start);"></i> TEAM SUMMARY
                    </h2>
                    <button onclick="closeModal('universalModal')" style="width: 32px; height: 32px; font-size: 1.4rem; background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); color: #fb7185; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 900; transition: 0.2s; padding-bottom: 2px;" title="Close">&times;</button>
                </div>
                <div class="ts-section">
                    <h3 class="ts-title">ACTIVE HOTBAR BUFFS</h3>
                    <div class="ts-buffs-list">
                        ${activeBuffs.length ? activeBuffs.map(b => `
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

        let teamDps = 0, teamDmg = 0;
        let unitsToProcess = [...hotbarState.slots.filter(Boolean)];
        const teamEffects = [];

        if (hotbarState.fusionMode) {
            const activeFusions = getActiveFusions();
            const componentIds = new Set();
            activeFusions.forEach(f => {
                f.components.forEach(id => componentIds.add(id));
                unitsToProcess.push({ id: f.id, name: f.name, img: f.img });
            });
            unitsToProcess = unitsToProcess.filter(u => !componentIds.has(u.id));
        }

        const formatSubs = (list) => {
            if (typeof getRichBadgeHtml === 'function') return getRichBadgeHtml(list || []);
            if (!list || !Array.isArray(list) || list.length === 0) return '<span class="badge-empty">None</span>';
            return list.map(s => {
                const type = callWin('getStatType', s.type) || s.type;
                const label = (typeof STAT_LABELS !== 'undefined' && STAT_LABELS[type]) || s.type?.toUpperCase() || '?';
                const val = fix1Val(s.val) + '%';
                return `<span class="grad-${type}">${label}</span><span class="badge-val val-sub">${val}</span>`;
            }).join(' ');
        };

        unitsToProcess.forEach(u => {
            const detail = getDetailedUnitStats(u.id);
            if (!detail) return;
            teamDps += detail.teamDps;
            teamDmg += detail.teamDmg;

            const { unit, build } = detail;
            const headName = HEAD_NAMES[build.headUsed] || build.headUsed || 'None';
            const bodyName = MAIN_STAT_NAMES.body[build.mainStats?.body] || build.mainStats?.body || 'Dmg';
            const legsName = MAIN_STAT_NAMES.legs[build.mainStats?.legs] || build.mainStats?.legs || 'Dmg';
            const setName = build.setName || '—';
            const traitName = build.traitName || '—';
            const subs = { ...(build.subStats || {}) };
            if (unit.id === 'ant_king_savage' && build.mainStats?.body === 'dot' && (!Array.isArray(subs.body) || subs.body.length === 0)) {
                subs.body = [{ type: 'dmg', val: (typeof PERFECT_SUBS !== 'undefined' ? PERFECT_SUBS.dmg : 4) * 6 }];
            }
            const stats = unit.stats || {};
            const htmlArr = [];

            if (stats.slowPct) htmlArr.push({ label: 'Slow', val: `${stats.slowPct}% (${stats.slowDuration || 0}s)`, color: '#60a5fa' });
            if (stats.stunDuration) htmlArr.push({ label: 'Stun', val: `${stats.stunDuration}s`, color: '#fbbf24' });
            if (stats.timestopDuration) htmlArr.push({ label: 'Timestop', val: `${stats.timestopDuration}s`, color: '#a78bfa' });
            if (stats.hasRadiation) htmlArr.push({ label: 'Radiation', val: `Status Applied (${stats.radiationDuration || 6}s)`, color: '#f87171' });

            let activeModeName = null, activeModes = [];
            if (unit.modes && Array.isArray(unit.modes)) {
                const state = window.unitModesState?.[unit.id] ?? 0;
                activeModes = Array.isArray(state) ? state : [state];
                activeModeName = unit.modes[activeModes[0]]?.name.toLowerCase();
            }

            if (CUSTOM_EFFECTS_MAP[unit.id]) {
                CUSTOM_EFFECTS_MAP[unit.id](unit, activeModeName, activeModes).forEach(e => {
                    e.isTeam ? teamEffects.push({ ...e, unitName: unit.name }) : htmlArr.push(e);
                });
            }

            htmlArr.forEach(e => { if (!e.skipTeam) teamEffects.push({ ...e, unitName: unit.name }); });

            const spaStr = build.spa ? fix2Val(build.spa) + 's' : '—';
            const rangeStr = build.range ? fix1Val(build.range) : '—';
            const critStr = subs.finalCf != null ? fix1Val(Math.min(subs.finalCf, 100)) + '%' : '—';
            const cdmgStr = subs.finalCm != null ? Math.round(subs.finalCm) + '%' : '—';

            const tags = unit.tags || [], element = String(unit.element || unit.stats?.element || unit.meta?.element || '').toLowerCase();
            const ksBonus = getLeaderBonus(leader, 'king_sailor', 'kingSailor', tags, element, (t, e) => {
                if (t.includes('Magi')) return 'MAGI: +50% DMG / +15% SPA';
                if (t.includes('Uncontrollable Power')) return 'UNCONTROLLABLE: +30% DMG / +10% SPA';
                if (e === 'water') return 'WATER: +20% DMG / +10% SPA';
            });

            const ttBonus = getLeaderBonus(leader, 'triple_threat', 'triple_threat', tags, element, (t, e) => {
                if (t.includes('Piece')) return 'UNRIVALED: +50% DMG (Piece)';
                if (t.includes('Sword')) return 'UNRIVALED: +25% DMG (Sword)';
                if (e === 'wind') return 'UNRIVALED: +20% DMG / +5% CRIT (Wind)';
            });

            const abhBonus = getLeaderBonus(leader, 'angel_born_in_hell', 'unrivaledMark', tags, element, (t, e) => {
                if (t.some(tag => ['fused', 'fusion'].includes(tag.toLowerCase()))) return 'UNRIVALED: +50% DMG / +50% CDMG (Fusion)';
                if (t.includes('Super Warrior')) return 'UNRIVALED: +30% DMG / -10% CD (Super Warrior)';
                if (e === 'light') return 'UNRIVALED: +20% DMG / +5% CRIT (Light)';
            });

            const isLoadout = window.CALCULATION_MODE === 'loadout';

            // --- Pre-evaluate active passives to keep template strings completely unnested ---
            let passivesBlock = '';
            if (build.detailedBuffs?.passiveBreakdown) {
                const nativePassives = new Map((unit.passives || []).map(p => [p.name, p]));
                const activeModeIdx = window.unitModesState?.[unit.id] ?? 0;
                if (unit.modes?.[activeModeIdx]?.passives) {
                    unit.modes[activeModeIdx].passives.forEach(p => nativePassives.set(p.name, p));
                }

                const renderedPassives = build.detailedBuffs.passiveBreakdown.map(pb => {
                    if (pb.name === "Unit Base (Passive)") return null;
                    const native = nativePassives.get(pb.name);
                    const isTeamBuff = !native;
                    if (pb.name === "Unrivaled Mark" && isUnit(unit.id, 'angel_born_in_hell')) return null;

                    const parts = [];
                    const d = pb.dmg || pb.damage || 0;
                    const s = pb.spa || 0;
                    const c = pb.crit || pb.cRate || pb.critRate || 0;
                    const cm = pb.cdmg || pb.cDmg || pb.critDmg || 0;
                    const r = pb.range || pb.passiveRange || 0;

                    if (d !== 0) parts.push(`+${d}% DMG`);
                    if (s !== 0) parts.push(`-${s}% SPA`);
                    if (c !== 0) parts.push(`+${c}% CRIT`);
                    if (cm !== 0) parts.push(`+${cm}% CDMG`);
                    if (r !== 0) parts.push(`+${r}% RNG`);

                    let desc = native ? native.desc : '';
                    if (pb.name.includes('Holy Aura')) desc = "ABH Buff: +30/50% Damage for units with Follow-Up attacks.";
                    if (pb.name.includes('Shadow Legion')) desc = "Jinwoo Buff: Massive Damage/Utility for Leveling tagged units.";
                    if (pb.name.includes("Monarch's Devotion") && isTeamBuff) desc = "Ant King (Savage) buffs all other units in range by +10% Damage.";

                    return `
                        <div class="ts-passive-row">
                            <div class="ts-passive-badge ${isTeamBuff ? 'ts-team-badge' : ''}">${isTeamBuff ? 'TEAM' : 'PASSIVE'}</div>
                            <div class="ts-passive-main">
                                <span class="ts-passive-name">${pb.name.replace(' (ABH Buff)', '')}</span>
                                ${parts.length ? `<span class="ts-passive-stats">${parts.join(' / ')}</span>` : ''}
                                ${desc ? `<span class="ts-passive-desc">${desc.length > 200 ? desc.slice(0, 200) + '...' : desc}</span>` : ''}
                            </div>
                        </div>`;
                }).filter(Boolean).join('');

                if (renderedPassives) {
                    passivesBlock = `<div class="ts-section-group"><div class="ts-breakdown-title">PASSIVE ABILITIES & SYNERGY</div><div class="ts-passives-container">${renderedPassives}</div></div>`;
                }
            }
            let synergyBadge = '';
            if (isLoadout && build.baseStats?.requiresDot) {
                const req = build.baseStats.requiresDot;
                const isMet = build.dotData && !build.dotData.inactive;
                synergyBadge = `<div class="ts-synergy-badge ${isMet ? 'active' : 'missing'}"><i class="fas ${isMet ? 'fa-link' : 'fa-link-slash'}"></i> ${isMet ? 'SYNCED' : 'REQUIRED'}: ${req.toUpperCase()}</div>`;
            }

            let modeBadge = '';
            if (unit.modes && Array.isArray(unit.modes)) {
                const activeMode = window.unitModesState?.[unit.id] ?? 0;
                const currentMode = unit.modes[activeMode];
                if (currentMode && unit.modesLabel?.toLowerCase() !== 'summons') {
                    modeBadge = `<div class="ts-unit-mode" style="margin-top: 4px; font-size: 0.75rem; color: #c084fc; font-weight: 800; background: rgba(192, 132, 252, 0.1); border: 1px solid rgba(192, 132, 252, 0.3); padding: 2px 6px; border-radius: 4px; white-space: nowrap; max-width: 150px; overflow: hidden; text-overflow: ellipsis; display: inline-block;" title="${currentMode.name}">⚙ MODE: ${currentMode.name.toUpperCase()}</div>`;
                }
            }

            html += `
                <div class="ts-unit-card">
                    <div class="ts-header-left" style="display: flex; gap: 15px; align-items: center;">
                        <div class="ts-img-container"><img src="${unit.img}" class="ts-unit-img"></div>
                        <div class="ts-unit-info">
                            <div style="display: flex; align-items: center; flex-wrap: wrap;"><span class="ts-unit-name">${unit.name}</span></div>
                            <div class="ts-unit-trait">${traitName}</div>
                            ${modeBadge}
                            ${synergyBadge}
                        </div>
                        <div class="ts-header-right">
                            <div class="ts-dps-box">
                                <div class="ts-dps-val">${formatVal(detail.dps)}</div>
                                <div class="ts-dps-label">TOTAL DPS (x${detail.placementsCounted})</div>
                            </div>
                        </div>
                    </div>
                    <div class="ts-stats-compact-grid">
                        <div class="ts-stat-item"><span class="ts-stat-label">DMG</span><span class="ts-stat-val dmg">${formatVal(detail.dmg)}</span></div>
                        <div class="ts-stat-item"><span class="ts-stat-label">SPA</span><span class="ts-stat-val spa">${spaStr}</span></div>
                        <div class="ts-stat-item"><span class="ts-stat-label">RANGE</span><span class="ts-stat-val range">${rangeStr}</span></div>
                        <div class="ts-stat-item"><span class="ts-stat-label">CRIT</span><span class="ts-stat-val crit">${critStr}</span></div>
                        <div class="ts-stat-item"><span class="ts-stat-label">CDMG</span><span class="ts-stat-val cdmg">${cdmgStr}</span></div>
                    </div>
                    <div class="ts-breakdown-container">
                        <div class="ts-section-group">
                            <div class="ts-breakdown-title">EQUIPMENT</div>
                            <div class="ts-set-display"><span class="ts-set-label">Relic Set</span><span class="ts-set-val">${setName}</span></div>
                            <div class="ts-equipment-grid">
                                <div class="ts-eq-item"><span class="ts-eq-label">Head Piece</span><span class="ts-eq-val">${headName}</span></div>
                                <div class="ts-eq-item"><span class="ts-eq-label">Body Relic</span><span class="ts-eq-val">${bodyName}</span></div>
                                <div class="ts-eq-item"><span class="ts-eq-label">Leg Relic</span><span class="ts-eq-val">${legsName}</span></div>
                            </div>
                        </div>
                        <div class="ts-section-group">
                            <div class="ts-breakdown-title">SUB-STAT BREAKDOWN</div>
                            <div class="ts-subs-breakdown">
                                <div class="ts-subs-row"><div class="ts-piece-badge">HEAD</div><div class="ts-subs-list">${formatSubs(subs.head || [])}</div></div>
                                <div class="ts-subs-row"><div class="ts-piece-badge">BODY</div><div class="ts-subs-list">${formatSubs(subs.body || [])}</div></div>
                                <div class="ts-subs-row"><div class="ts-piece-badge">LEGS</div><div class="ts-subs-list">${formatSubs(subs.legs || [])}</div></div>
                            </div>
                        </div>
                        ${passivesBlock}
                    </div>
                    <div class="ts-lower-row" style="margin-top: auto;">
                        ${ksBonus ? `<div class="ts-bonus-pill" style="margin-bottom: 8px; display: inline-block;"><span class="ks-text">${ksBonus}</span></div>` : ''}
                        ${ttBonus ? `<div class="ts-bonus-pill" style="border-color: rgba(167, 243, 208, 0.4); background: rgba(167, 243, 208, 0.08); color: #a7f3d0; padding: 4px 10px; font-size: 0.7rem; height: auto; margin-bottom: 8px; display: inline-block; width: fit-content; line-height: 1.2;"><span class="ks-text" style="color: #a7f3d0;">${ttBonus}</span></div>` : ''}
                        ${abhBonus ? `<div class="ts-bonus-pill" style="border-color: rgba(167, 243, 208, 0.4); background: rgba(167, 243, 208, 0.08); color: #a7f3d0; padding: 4px 10px; font-size: 0.7rem; height: auto; margin-bottom: 8px; display: inline-block; width: fit-content; line-height: 1.2;"><span class="ks-text" style="color: #a7f3d0;">${abhBonus}</span></div>` : ''}
                        ${htmlArr.length ? `<div class="ts-effect-badges">${htmlArr.map(e => `<div class="ts-effect-badge" style="--effect-color: ${e.color};"><span class="ts-effect-dot" style="background: ${e.color};"></span>${e.label}<span class="ts-effect-val">${e.val}</span></div>`).join('')}</div>` : ''}
                    </div>
                </div>
            `;
        });

        const uniqueTeamEffects = [];
        const seenLabels = new Set();
        const slows = teamEffects.filter(e => e.label.toLowerCase().includes('slow'));
        const nonSlows = teamEffects.filter(e => !e.label.toLowerCase().includes('slow'));

        nonSlows.forEach(e => {
            if (!seenLabels.has(e.label)) {
                uniqueTeamEffects.push(e);
                seenLabels.add(e.label);
            } else {
                const existing = uniqueTeamEffects.find(x => x.label === e.label);
                if (existing && !existing.unitName.includes(e.unitName)) existing.unitName += `, ${e.unitName}`;
            }
        });

        const maxSlowVal = Math.max(...slows.map(s => parseInt(s.val.match(/(\d+)%/)?.[1] || 0)), 0);
        slows.forEach(s => {
            const match = s.val.match(/(\d+)%/);
            const matchVal = match ? parseInt(match[1]) : 0;
            uniqueTeamEffects.push({ ...s, isMaxEffect: matchVal === maxSlowVal && maxSlowVal > 0 });
        });

        let totalDmgMulti = 1.0;
        uniqueTeamEffects.forEach(e => {
            const valText = e.val.toLowerCase();
            const labelText = e.label.toLowerCase();
            let effectMult = 1.0;
            if ((valText.includes('dmg taken') || labelText.includes('dmg taken')) && !labelText.includes('radiation')) {
                const matches = [...e.val.matchAll(/(\d+)%/g)].map(m => parseInt(m[1]));
                if (matches.length) effectMult = 1 + Math.max(...matches) / 100;
            }
            // Also detect "Nx Dmg" patterns like "1.3x Dmg"
            const xMatch = e.val.match(/([\d.]+)x\s*Dmg/i);
            if (xMatch) effectMult = Math.max(effectMult, parseFloat(xMatch[1]));
            // Non-stacking: only use the highest single debuff multiplier
            if (effectMult > totalDmgMulti) totalDmgMulti = effectMult;
        });

        const teamEffectsHtml = uniqueTeamEffects.length ? `
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
                    <div class="ts-total-group left"><span class="ts-total-label">TEAM TOTAL DPS</span><span class="ts-total-val dps">${formatVal(teamDps)}</span></div>
                    <div class="ts-total-group right"><span class="ts-total-label">TEAM TOTAL DMG</span><span class="ts-total-val dmg">${formatVal(teamDmg)}</span></div>
                </div>
            </div>
        `;

        if (typeof showUniversalModal === 'function') {
            showUniversalModal({ title: '', content: html, size: 'modal-lg', headerClass: 'hidden-header', footerClass: 'hidden-header', boxClass: 'modal-transparent' });
        } else {
            console.log("Team Summary HTML:", html);
        }
    }

    function handleHotbarBuffToggle(configKey, checkbox) {
        const config = window.GLOBAL_BUFF_DATA?.[configKey];
        if (!config) return;

        const isChecked = checkbox.checked;
        hotbarState.buffState[configKey] = isChecked;

        const isFernTargetedBuff = (configKey === 'mageHill' || configKey === 'mageGround');
        if (window.HOTBAR_BUFF_STATE && !isFernTargetedBuff) window.HOTBAR_BUFF_STATE[configKey] = isChecked;

        if (isChecked && config.excludes) {
            const exclConfig = window.GLOBAL_BUFF_DATA[config.excludes];
            if (exclConfig) {
                hotbarState.buffState[config.excludes] = false;
                if (window.HOTBAR_BUFF_STATE) window.HOTBAR_BUFF_STATE[config.excludes] = false;
                const otherCb = $(`#hotbarToggles input[data-hotbar-buff="${config.excludes}"]`);
                if (otherCb) {
                    otherCb.checked = false;
                    callWin('updateBuffVisuals', otherCb.closest('.nav-toggle-label'), false, exclConfig.color);
                }
            }
        }

        callWin('updateBuffVisuals', checkbox.closest('.nav-toggle-label'), isChecked, config.color);
        callWin('loadHotbarDb', () => {
            recalculateHotbarTeam();
            updateHotbarUI();
        });
    }

    function toggleExtraMenu(selector) {
        const target = $(selector);
        $$('.hotbar-extra-menu').forEach(m => m !== target && m.classList.remove('active'));
        target?.classList.toggle('active');
    }

    function initHotbar() {
        if ($('#unitHotbar')) return;

        const hotbar = document.createElement('div');
        hotbar.id = 'unitHotbar';
        hotbar.className = 'unit-hotbar';
        if (window.CALCULATION_MODE !== 'loadout') hotbar.style.display = 'none';

        hotbar.innerHTML = `
            <div id="hotbarToggles" class="hotbar-toggles-row"></div>
            <div class="hotbar-left-wrapper">
                <div class="hotbar-stats-box">
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
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                            <span id="totalTeamDps">0</span>
                        </div>
                    </div>
                    <div class="hotbar-stat-group boss-dps-group" title="Total Team Boss DPS">
                        <div class="stat-label">BOSS DPS</div>
                        <div class="stat-value-box boss-dps-value-box">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-13h-9l1-7z"></path></svg>
                            <span id="totalTeamBossDps">0</span>
                        </div>
                    </div>
                </div>
                <button class="hotbar-extra-btn hotbar-info-btn" onclick="event.stopPropagation(); openTeamSummary();">Info</button>
            </div>
            <div class="hotbar-center-wrapper">
                <div class="hotbar-slots-wrapper">
                    ${Array.from({ length: 6 }, (_, i) => `
                        <div class="hotbar-slot" data-index="${i}" draggable="true">
                            <div class="slot-number">${i + 1}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="extra-buttons-wrapper">
                <div class="hotbar-extra-container">
                    <button class="hotbar-extra-btn farms-btn" onclick="event.stopPropagation(); toggleExtraMenu('.farms-menu')">Farms</button>
                    <div class="hotbar-extra-menu farms-menu" onclick="event.stopPropagation();"></div>
                </div>
                <div class="hotbar-extra-container">
                    <button class="hotbar-extra-btn buffers-btn" onclick="event.stopPropagation(); toggleExtraMenu('.buffers-menu')">Buffers</button>
                    <div class="hotbar-extra-menu buffers-menu" onclick="event.stopPropagation();"></div>
                </div>
            </div>
        `;

        document.body.appendChild(hotbar);

        const populateMenu = (selector, units) => {
            const el = $(selector);
            if (!el) return;
            units.forEach(u => {
                const item = document.createElement('div');
                item.className = 'farm-item' + (selector.includes('buffers') ? ' buffer-item' : '');
                item.innerHTML = `<img src="${u.img}" alt="${u.name}" title="${u.name}" onerror="this.src='images/units/placeholder.png'">`;
                item.onclick = (e) => {
                    e.stopPropagation();
                    addUnitToHotbar(u, selector.includes('buffers'));
                    el.classList.remove('active');
                };
                el.appendChild(item);
            });
        };

        populateMenu('.farms-menu', [
            { id: 'speedwagon', name: 'Speedcart', img: 'images/units/Speedwagon.png', tags: ['Assistant', 'Miner'] },
            { id: 'bulma', name: 'Bulma', img: 'images/units/Bulma.png', tags: ['Assistant', 'Miner'] }
        ]);

        populateMenu('.buffers-menu', [
            { id: 'miku', name: 'Miku', img: 'images/units/Miku.png', tags: ['Assistant'] },
            { id: 'enlightenedgod', name: 'Enlightened God', img: 'images/units/EnlightenedGod.png' },
            { id: 'ancient_mage', name: 'Ancient Mage', img: 'images/units/AncientMage.png' },
            { id: 'king_sailor', name: 'King Sailor', img: 'images/units/KingSailor.png' },
            { id: 'prodigy_mage', name: 'Prodigy Mage', img: 'images/units/ProdigyMage.png' }
        ]);

        $$('.hotbar-slot', hotbar).forEach((slot, i) => {
            slot.addEventListener('dragstart', (e) => {
                if (!hotbarState.slots[i]) return e.preventDefault();
                e.dataTransfer.setData('text/plain', i);
                slot.classList.add('dragging');
            });
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.classList.add('drag-over');
            });
            slot.addEventListener('dragleave', () => slot.classList.remove('drag-over'));
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');
                const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
                if (fromIdx !== i) {
                    const temp = hotbarState.slots[i];
                    hotbarState.slots[i] = hotbarState.slots[fromIdx];
                    hotbarState.slots[fromIdx] = temp;
                    recalculateHotbarTeam();
                    updateHotbarUI();
                }
            });
            slot.addEventListener('dragend', () => {
                slot.classList.remove('dragging');
                $$('.hotbar-slot').forEach(s => s.classList.remove('drag-over'));
            });
        });

        if (!$('#hotbarHiddenRender')) {
            const hidden = document.createElement('div');
            hidden.id = 'hotbarHiddenRender';
            hidden.style.display = 'none';
            document.body.appendChild(hidden);
        }

        document.addEventListener('click', (e) => {
            const card = e.target.closest('.unit-card');
            if (card && !e.target.closest('button, input, select, label, .e-pill')) {
                const id = card.id.replace('card-', '');
                const u = typeof unitDatabase !== 'undefined' && unitDatabase.find(x => x.id === id);
                if (u) addUnitToHotbar(u);
            }
            $$('.hotbar-extra-menu').forEach(m => m.classList.remove('active'));
        });
    }

    function addUnitToHotbar(unit, forceAdd = false) {
        if (typeof ENABLE_HOTBAR !== 'undefined' && !ENABLE_HOTBAR) return;
        if (window.CALCULATION_MODE === 'potential' && !forceAdd) {
            return callWin('showToast', "Switch to Loadout Mode to build a team and test position-based passives.");
        }

        const majesticId = callWin('getUnitId', 'majestic_armor');
        const unparalleledId = callWin('getUnitId', 'unparalleled_armor');

        if (unit.id === majesticId || unit.id === unparalleledId) {
            const components = unit.id === majesticId ? ['sasuke_great_war', 'nutaru_beast'] : ['ancient_shinob', 'nutaru_beast'];
            let addedCount = 0;
            components.forEach(name => {
                const compId = callWin('getUnitId', name);
                if (!hotbarState.slots.some(s => s && s.id === compId)) {
                    const compUnit = typeof unitDatabase !== 'undefined' ? unitDatabase.find(x => x.id === compId) : null;
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
        const existingIndex = hotbarState.slots.findIndex(s => s && s.id === unit.id);
        if (existingIndex !== -1) {
            if (!onlyAdd) clearHotbarSlot(existingIndex);
            return;
        }

        const emptyIndex = hotbarState.slots.findIndex(s => s === null);
        if (emptyIndex !== -1) {
            hotbarState.slots[emptyIndex] = unit;
            setTimeout(() => {
                const isAssistant = unit.tags?.includes('Assistant');
                if (!isAssistant && !$(`#card-${unit.id}`)) {
                    const hidden = $('#hotbarHiddenRender');
                    if (hidden && typeof renderUnitCard === 'function') {
                        hidden.appendChild(renderUnitCard(unit, 0));
                        callWin('updateBuildListDisplay', unit.id);
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
        const ids = hotbarState.slots.filter(Boolean).map(u => u.id);
        const hasJinoo = ids.some(id => isUnit(id, 'jinoo_shadow_monarch') || isUnit(id, 'sjw'));
        const antKing = hotbarState.slots.find(s => s && isUnit(s.id, 'ant_king_savage'));

        if (antKing && typeof activeAbilityIds !== 'undefined') {
            const active = activeAbilityIds.has(antKing.id);
            if (hasJinoo !== active) {
                hasJinoo ? activeAbilityIds.add(antKing.id) : activeAbilityIds.delete(antKing.id);
                const card = $(`#card-${antKing.id}`);
                if (card) {
                    card.classList.toggle('use-ability', hasJinoo);
                    const cb = $('.ability-cb', card);
                    if (cb) {
                        cb.checked = hasJinoo;
                        cb.parentNode.classList.toggle('is-checked', hasJinoo);
                    }
                    const label = $('.ut-ability-text', card);
                    const override = typeof TOGGLE_OVERRIDES !== 'undefined' ? TOGGLE_OVERRIDES[callWin('getFileName', antKing.id)] : null;
                    if (label && override?.dynamicLabel) label.innerText = override.dynamicLabel(hasJinoo);
                }
                callWin('resetCachesForBuffChange', antKing.id);
                callWin('updateBuildListDisplay', antKing.id, true);
            }
        }
    }

    function clearHotbarSlot(index) {
        const unit = hotbarState.slots[index];
        if (unit) {
            hotbarState.slots[index] = null;
            if (isUnit(unit.id, 'prodigy_mage') || isUnit(unit.id, 'ancient_mage')) hotbarState.fernTargets = [];

            $(`#hotbarHiddenRender #card-${unit.id}`)?.remove();
            callWin('resetCachesForBuffChange', unit.id);
            callWin('updateBuildListDisplay', unit.id);

            recalculateHotbarTeam();
            checkHotbarSynergies();
            updateHotbarUI();
        }
    }

    function showFusionImages(armorIds) {
        if (!armorIds || !armorIds.length) return;
        const bestBuilds = {
            [callWin('getUnitId', 'unparalleled_armor')]: { dmg: '251.2k', spa: '5.39s', range: '75.2', crit: '77.5%', cdmg: '189%', dot: '0' },
            [callWin('getUnitId', 'majestic_armor')]: { dmg: '132.4k', spa: '7.12s', range: '52.5', crit: '95%', cdmg: '284%', dot: '0' },
            [callWin('getUnitId', 'sjw')]: { dmg: '312.5k', spa: '3.82s', range: '82.4', crit: '85%', cdmg: '215%', dot: '0' }
        };

        let contentHtml = '';
        armorIds.forEach(id => {
            const u = typeof unitDatabase !== 'undefined' && unitDatabase.find(x => x.id === id);
            if (u) {
                const b = bestBuilds[id] || { dmg: '0', spa: '0', range: '0', Math: '0%', cdmg: '0%', dot: '0' };
                const isFused = hotbarState.activeFusionIds.includes(id);
                contentHtml += `
                    <div class="fusion-card-overlay" onclick="event.stopPropagation();">
                        <img src="${u.img.replace('.png', 'Syncro.png')}" class="fusion-bg-img-clean" onerror="this.src='${u.img}'">
                        <div class="br-full-stats fusion-stats-box-full-build">
                            <div class="fs-comparison-grid" style="grid-template-columns: 1fr;">
                                <div class="fs-item-lg dmg-row" style="justify-content: center;">
                                    <span class="fs-icon-box dmg-bg"><svg viewBox="0 0 290.226 290.226" fill="currentColor"><path d="M63.951,243.575c-1.945-3.578-4.401-6.907-7.363-9.869c-3.106-3.102-6.626-5.633-10.4-7.63 c-4.51-2.387-0.945-7.5-0.945-7.5c4.616-7.023,8.825-14.079,12.305-20.226l-23.363-23.344H11.504c-4.362,0-7.898-3.539-7.898-7.902 c0-4.361,3.536-7.9,7.898-7.9h25.947c2.1,0,4.107,0.832,5.588,2.312l85.379,85.291c1.483,1.483,2.315,3.495,2.315,5.589v26.073 c0,4.365-3.537,7.897-7.9,7.897c-4.367,0-7.904-3.531-7.904-7.897v-22.798l-23.27-23.24c-6.281,3.707-13.582,8.252-20.816,13.25 C70.842,245.679,66.698,248.629,63.951,243.575z"/><path d="M26.61,237.102c-7.106,0-13.784,2.764-18.812,7.784c-5.019,5.015-7.782,11.686-7.782,18.778 c0,7.097,2.764,13.762,7.782,18.776c5.027,5.016,11.706,7.783,18.812,7.785c7.102,0,13.781-2.77,18.804-7.785 c5.023-5.015,7.79-11.682,7.79-18.776c0-7.093-2.768-13.764-7.79-18.778C40.392,239.866,33.712,237.102,26.61,237.102z"/><path d="M100.985,182.318c-3.502,3.499-9.232,3.499-12.734,0.001l-8.81-8.801c-3.502-3.498-3.502-9.223,0-12.721L229.832,10.564 c3.502-3.498,10.401-6.727,15.33-7.175l36.862-3.352c4.93-0.448,8.596,3.218,8.148,8.148l-3.346,36.791 c-0.448,4.93-3.68,11.825-7.182,15.324l-150.4,150.251c-3.502,3.498-9.232,3.498-12.734,0l-8.822-8.813 c-3.502-3.498-3.502-9.223,0-12.722L233.608,63.213c1.854-1.848,1.856-4.852,0.003-6.702c-1.848-1.848,1.856-4.852,0.003-6.702c-1.848-1.853-4.853-1.853-6.709-0.002 L100.985,182.318z"/></svg></span>
                                    <span class="fs-val val-dmg" style="width: 60px; text-align: left;">${b.dmg}</span>
                                </div>
                                <div class="fs-item-lg spa-row" style="justify-content: center;">
                                    <span class="fs-icon-box spa-bg"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zM12 11.5l-4-4V4h8v3.5l-4 4z"/></svg></span>
                                    <span class="fs-val val-spa" style="width: 60px; text-align: left;">${b.spa}</span>
                                </div>
                                <div class="fs-item-lg range-row" style="justify-content: center;">
                                    <span class="fs-icon-box range-bg"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg></span>
                                    <span class="fs-val val-range" style="width: 60px; text-align: left;">${b.range}</span>
                                </div>
                            </div>
                            <div class="fs-sub-row">
                                <div class="fs-item-sm"><span class="fs-label">Crit %</span><span class="fs-val val-crit">${b.crit}</span></div>
                                <div class="fs-item-sm"><span class="fs-label">CDmg</span><span class="fs-val val-cdmg">${b.cdmg}</span></div>
                                <div class="fs-item-sm"><span class="fs-label">DoT Dmg</span><span class="fs-val val-dot">${b.dot}</span></div>
                            </div>
                        </div>
                        <button class="fusion-toggle-btn ${isFused ? 'fusion-btn-unfuse' : 'fusion-btn-fuse'}" onclick="event.stopPropagation(); toggleFusion('${id}'); showFusionImages([${armorIds.map(aid => `'${aid}'`).join(',')}]);">
                            ${isFused ? 'UNFUSE' : 'FUSE'}
                        </button>
                    </div>
                `;
            }
        });

        if (typeof showUniversalModal === 'function') {
            showUniversalModal({ title: '', content: `<div class="fusion-overlay-container" onclick="closeModal('universalModal')">${contentHtml}</div>`, size: 'modal-full', headerClass: 'hidden-header', footerClass: 'hidden-header', boxClass: 'modal-transparent' });
            const overlay = $('#universalModal');
            if (overlay) overlay.onclick = (e) => { if (e.target === overlay) closeModal('universalModal'); };
        }
    }

    function updateHotbarUI() {
        const hotbar = $('#unitHotbar');
        if (!hotbar) return;

        const avFusions = getAvailableFusions();
        hotbarState.activeFusionIds = hotbarState.activeFusionIds.filter(id => avFusions.some(f => f.id === id));
        hotbarState.fusionMode = hotbarState.activeFusionIds.length > 0;
        const activeFusions = getActiveFusions();

        const hotbarUnitIds = hotbarState.slots.filter(Boolean).map(u => u.id);
        const activeBuffsInHotbar = new Set();
        const BUFF_PROVIDERS = {
            'miku': ['miku'], 'enlightenedgod': ['enlightenedGod'], 'ancient_mage': ['ancientMage'],
            'king_sailor': ['kingSailor', 'unrivaledMark'], 'prodigy_mage': ['mageHill', 'mageGround'],
            'triple_threat': ['unrivaledMark'],
            'unparalleled_armor': ['bijuu'],
            'angel_born_in_hell': ['unrivaledMark']
        };

        const idsToCheck = [...hotbarUnitIds, ...(hotbarState.fusionMode ? activeFusions.map(f => f.id) : [])];
        idsToCheck.forEach(id => {
            if (BUFF_PROVIDERS[id]) BUFF_PROVIDERS[id].forEach(k => activeBuffsInHotbar.add(k));
        });

        const avConfigs = [];
        if (window.GLOBAL_BUFF_DATA) {
            Object.keys(window.GLOBAL_BUFF_DATA).forEach(k => {
                if (activeBuffsInHotbar.has(k)) {
                    if (!window.GLOBAL_BUFF_DATA[k].hideButton) avConfigs.push({ configKey: k, config: window.GLOBAL_BUFF_DATA[k] });
                } else if (hotbarState.buffState[k]) {
                    hotbarState.buffState[k] = false;
                    if (window.HOTBAR_BUFF_STATE) window.HOTBAR_BUFF_STATE[k] = false;
                    setTimeout(() => {
                        callWin('resetCachesForBuffChange');
                        callWin('updateAllUnitsBuilds');
                        if (!window.visibleUnitIds?.size) callWin('renderDatabase');
                    }, 0);
                }
            });
        }

        const togglesRow = $('#hotbarToggles');
        if (togglesRow) {
            const currentKey = avConfigs.map(c => c.configKey).join(',');
            if (togglesRow.dataset.configsKey !== currentKey) {
                togglesRow.innerHTML = avConfigs.map(({ configKey, config }) => `
                    <div class="hotbar-toggle-item">
                        <label class="nav-toggle-label miku-btn-label hotbar-buff-toggle" style="--accent: ${config.color || '#4ade80'}" title="${config.desc || ''}">
                            <div class="toggle-wrapper" style="gap: 6px;">
                                <input type="checkbox" data-hotbar-buff="${configKey}" onchange="window.handleHotbarBuffToggle('${configKey}', this)">
                                <div class="mini-switch"></div>
                                <span style="white-space: nowrap;">${config.name.toUpperCase()}</span>
                            </div>
                        </label>
                    </div>`).join('');
                togglesRow.dataset.configsKey = currentKey;
            }
            avConfigs.forEach(({ configKey, config }) => {
                const cb = $(`input[data-hotbar-buff="${configKey}"]`, togglesRow);
                if (cb) {
                    cb.checked = !!hotbarState.buffState[configKey];
                    callWin('updateBuffVisuals', cb.closest('.nav-toggle-label'), cb.checked, config.color);
                }
            });
        }

        let teamDmg = 0, teamDps = 0, teamBossDps = 0;
        const getStats = (id) => {
            const det = getDetailedUnitStats(id);
            return det ? { dmg: det.dmg, dps: det.dps, bossDps: det.bossDps, placements: det.placementsCounted || 1 } : { dmg: 0, dps: 0, bossDps: 0, placements: 1 };
        };

        hotbarState.slots.forEach(u => {
            if (!u) return;
            const isComp = hotbarState.fusionMode && activeFusions.some(f => f.components.includes(u.id) || f.components.some(c => isUnit(u.id, c)));
            if (isComp) return;
            const s = getStats(u.id);
            teamDmg += s.dmg; teamDps += s.dps; teamBossDps += s.bossDps;
        });

        if (hotbarState.fusionMode) {
            activeFusions.forEach(f => {
                const s = getStats(f.id);
                teamDmg += s.dmg; teamDps += s.dps; teamBossDps += s.bossDps;
            });
        }

        const teamDmgEl = $('#totalTeamDmg'), teamDpsEl = $('#totalTeamDps'), teamBossDpsEl = $('#totalTeamBossDps');
        if (teamDmgEl) teamDmgEl.innerText = formatVal(teamDmg);
        if (teamDpsEl) teamDpsEl.innerText = formatVal(teamDps);
        if (teamBossDpsEl) teamBossDpsEl.innerText = formatVal(teamBossDps);
        $('.hotbar-stats-box')?.classList.toggle('fusion-active', hotbarState.fusionMode && activeFusions.length > 0);

        const fusionMap = new Map();
        const nut = callWin('getUnitId', 'nutaru_beast');
        const sh = callWin('getUnitId', 'ancient_shinob');
        const sa = callWin('getUnitId', 'sasuke_great_war');
        const un = callWin('getUnitId', 'unparalleled_armor');
        const ma = callWin('getUnitId', 'majestic_armor');

        if (hotbarUnitIds.includes(nut)) {
            if (hotbarUnitIds.includes(sh)) { fusionMap.set(nut, [un]); fusionMap.set(sh, [un]); }
            if (hotbarUnitIds.includes(sa)) {
                if (!fusionMap.has(nut)) fusionMap.set(nut, []);
                fusionMap.get(nut).push(ma); fusionMap.set(sa, [ma]);
            }
        }

        $$('.hotbar-slot').forEach((slot, i) => {
            const u = hotbarState.slots[i];
            if (u) {
                slot.classList.add('filled');
                let img = $('img', slot);
                if (!img) {
                    img = document.createElement('img');
                    img.onerror = () => { img.src = 'images/units/placeholder.png'; };
                    slot.appendChild(img);
                }
                if (img.src !== u.img) img.src = u.img;
                img.alt = u.name;

                if (!$('.remove-btn', slot)) {
                    const rem = document.createElement('div');
                    rem.className = 'remove-btn';
                    rem.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                    rem.onclick = (e) => { e.stopPropagation(); clearHotbarSlot(i); };
                    slot.appendChild(rem);
                }

                const armorIds = fusionMap.get(u.id);
                let fusB = $('.fusion-badge:not(.modes-badge)', slot);
                if (armorIds?.length) {
                    if (!fusB) { fusB = document.createElement('div'); slot.appendChild(fusB); }
                    fusB.className = 'fusion-badge interactive' + (hotbarState.fusionMode ? ' fused-active' : '');
                    fusB.innerText = hotbarState.fusionMode ? 'FUSED' : 'FUSION';
                    fusB.onclick = (e) => { e.stopPropagation(); showFusionImages(armorIds); };
                    slot.classList.add('fused-slot');
                } else {
                    fusB?.remove();
                    slot.classList.remove('fused-slot');
                }

                const uObj = callWin('getUnitById', u.id);
                let modB = $('.modes-badge', slot);
                if (uObj?.modes?.length) {
                    if (!modB) {
                        modB = document.createElement('div');
                        modB.className = 'fusion-badge interactive modes-badge';
                        modB.innerText = 'MODES';
                        modB.style.cssText = 'background: linear-gradient(135deg, rgba(139,92,246,0.85), rgba(99,102,241,0.85)); border-color: #8b5cf6;';
                        slot.appendChild(modB);
                    }
                    modB.onclick = (e) => { e.stopPropagation(); if (typeof openUnitModes === 'function') openUnitModes(u.id); };
                } else {
                    modB?.remove();
                }

                const isLeader = i === 0 && (isUnit(u.id, 'king_sailor') || isUnit(u.id, 'triple_threat') || isUnit(u.id, 'angel_born_in_hell'));
                let leadB = $('.leader-badge', slot);
                if (isLeader) {
                    if (!leadB) {
                        leadB = document.createElement('div');
                        leadB.className = 'leader-badge';
                        leadB.innerText = 'LEADER';
                        slot.appendChild(leadB);
                    }
                } else {
                    leadB?.remove();
                }

                const isFern = isUnit(u.id, 'prodigy_mage');
                let fernBtn = $('.fern-target-btn', slot);
                if (isFern) {
                    if (!fernBtn) {
                        fernBtn = document.createElement('div');
                        fernBtn.className = 'fern-target-btn';
                        fernBtn.innerHTML = `<i class="fas fa-bullseye"></i> TARGETS`;
                        slot.appendChild(fernBtn);
                    }
                    fernBtn.onclick = (e) => { e.stopPropagation(); openFernTargetMenu(); };
                } else {
                    fernBtn?.remove();
                }

                slot.style.borderColor = hotbarState.fernTargets.includes(i) ? '#8b5cf6' : '';
                slot.style.boxShadow = hotbarState.fernTargets.includes(i) ? '0 0 10px rgba(139, 92, 246, 0.3)' : '';
                $('.fern-target-badge', slot)?.remove();

                let statsOverlay = $('.slot-stats-overlay', slot);
                if (!statsOverlay) {
                    statsOverlay = document.createElement('div');
                    statsOverlay.className = 'slot-stats-overlay';
                    slot.appendChild(statsOverlay);
                }

                const activeTrait = window.unitTraits?.[u.id] || 'DEFAULT';
                const traitBtn = `<div class="stats-trait-btn interactive" title="Active Trait: ${activeTrait}. Click to change!" onclick="event.stopPropagation(); window.openTraitBestList('${u.id}');">TRAIT</div>`;
                if (u.id === 'miku') {
                    statsOverlay.innerHTML = traitBtn;
                } else {
                    const s = getStats(u.id);
                    statsOverlay.innerHTML = `
                        <div class="stat-mini dmg"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M14.5 17.5L3 6V3h3l11.5 11.5"></path><path d="M13 19l6-6"></path><path d="M16 16l4 4"></path><path d="M19 13l2 2"></path></svg><span class="dmg-val">${formatVal(s.dmg)}</span></div>
                        <div class="stat-mini dps"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg><span class="dps-val">${formatVal(s.dps)}</span></div>
                        <div class="stat-mini boss-dps" title="Boss DPS"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M13 2L3 14h9l-1 8 10-13h-9l1-7z"></path></svg><span class="boss-dps-val">${formatVal(s.bossDps)}</span></div>
                        ${traitBtn}
                    `;
                }
            } else {
                slot.classList.remove('filled', 'fused-slot');
                slot.style.borderColor = ''; slot.style.boxShadow = '';
                ['.leader-badge', '.mark-badge', '.fern-target-btn', '.modes-badge', '.fusion-badge', '.slot-stats-overlay', '.remove-btn', 'img', '.fern-target-badge'].forEach(sel => $(sel, slot)?.remove());
            }
        });
    }

    function toggleFernTarget(index) {
        const idx = hotbarState.fernTargets.indexOf(index);
        if (idx === -1) {
            if (hotbarState.fernTargets.length >= 3) hotbarState.fernTargets.shift();
            hotbarState.fernTargets.push(index);
        } else {
            hotbarState.fernTargets.splice(idx, 1);
        }
        recalculateHotbarTeam();
        updateHotbarUI();
    }

    function openFernTargetMenu() {
        const idx = hotbarState.slots.findIndex(s => s && (isUnit(s.id, 'prodigy_mage') || isUnit(s.id, 'ancient_mage')));
        if (idx === -1) return alert("Prodigy Mage must be in your hotbar to select targets!");

        let html = `
            <div class="fern-menu-container" style="display: flex; flex-direction: column; gap: 15px; padding: 10px;">
                <div style="font-size: 0.85rem; color: #94a3b8; line-height: 1.4;">Select up to <b style="color: #8b5cf6;">3</b> team members to receive tactical support from Fern.</div>
                <div class="fern-slots-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
        `;

        hotbarState.slots.forEach((s, i) => {
            if (!s) return;
            const isTargeted = hotbarState.fernTargets.includes(i);
            html += `
                <div class="fern-menu-item" onclick="toggleFernTarget(${i}); openFernTargetMenu();" style="background: #1e293b; border: 2px solid ${isTargeted ? '#8b5cf6' : 'rgba(255,255,255,0.05)'}; border-radius: 12px; padding: 10px; cursor: pointer; transition: 0.2s; display: flex; flex-direction: column; align-items: center; gap: 8px; ${isTargeted ? 'box-shadow: 0 0 15px rgba(139, 92, 246, 0.2);' : ''}">
                    <img src="${s.img}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
                    <div style="font-size: 0.65rem; font-weight: 800; color: ${isTargeted ? 'white' : '#64748b'}; text-align: center; text-transform: uppercase;">${s.name}</div>
                </div>
            `;
        });

        html += `</div></div>`;
        if (typeof showUniversalModal === 'function') {
            showUniversalModal({ title: '<i class="fas fa-magic" style="color: #8b5cf6;"></i> PARTY TACTICIAN', content: html, size: 'modal-md' });
        }
    }

    // --- ATTACH EXPORTS TO GLOBAL SCOPE ---
    window.hotbarState = hotbarState;
    window.recalculateHotbarTeam = recalculateHotbarTeam;
    window.addUnitToHotbar = addUnitToHotbar;
    window.clearHotbarSlot = clearHotbarSlot;
    window.initHotbar = initHotbar;
    window.updateHotbarUI = updateHotbarUI;
    window.openTeamSummary = openTeamSummary;
    window.handleHotbarBuffToggle = handleHotbarBuffToggle;
    window.getHotbarState = () => hotbarState;
    window.getActiveFusions = getActiveFusions;
    window.getAvailableFusions = getAvailableFusions;
    window.toggleFusion = toggleFusion;
    window.showFusionImages = showFusionImages;
    window.toggleFernTarget = toggleFernTarget;
    window.openFernTargetMenu = openFernTargetMenu;
    window.toggleExtraMenu = toggleExtraMenu;
})();