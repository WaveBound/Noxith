// Build GLOBAL_BUFF_DATA dynamically from unitBuffs.js and leaderBuffs.js definitions
const GLOBAL_BUFF_DATA = {
    miku: {
        id: 'miku',
        stateKey: 'mikuActive',
        name: 'Miku Buff',
        desc: "Apply Miku's +100% Damage Buff",
        color: '#4ade80',
        math: (uStats) => ({ dmg: (typeof GLOBAL_UNIT_BUFFS !== 'undefined') ? GLOBAL_UNIT_BUFFS.miku.stats.dmg : 100 }),
        renderLabel: "Active: +100% Damage",
        genType: 'boolean'
    },
    enlightenedGod: {
        id: 'enlightenedgod',
        stateKey: 'enlightenedGodActive',
        name: 'Enlightened God',
        desc: "Buffs allied unit's by 5% Attack, Attack Speed, and Range every 60 seconds. (Cap of 20%)",
        color: '#fbbf24',
        math: (uStats) => {
            const stats = (typeof GLOBAL_UNIT_BUFFS !== 'undefined') ? GLOBAL_UNIT_BUFFS.enlightened_god.stats : { dmg: 20, spa: 20 };
            return { dmg: stats.dmg, spa: stats.spa, range: 20 };
        },
        renderLabel: "Active: +20% Dmg, -20% SPA, +20% Range",
        genType: 'boolean'
    },
    bijuu: {
        id: 'bijuu',
        stateKey: 'bijuuActive',
        name: 'Bijuu Link',
        desc: "Apply Bijuu Link: +25% Dmg, +25% Range, -15% SPA",
        color: '#f87171',
        math: (uStats) => {
            const baseId = (uStats.id || "").split('-')[0];
            if (baseId === 'unparalleled_armor' || baseId === 'nutaru_beast' || baseId === 'ancient_shinob') return {};
            const stats = (typeof GLOBAL_UNIT_BUFFS !== 'undefined') ? GLOBAL_UNIT_BUFFS.bijuu_link.stats : { dmg: 25, range: 25, spa: 15 };
            return { dmg: stats.dmg, spa: stats.spa, range: stats.range };
        },
        renderLabel: "Active: +25% Dmg, +25% Range, -15% SPA",
        genType: 'boolean'
    },
    ancientMage: {
        id: 'amage',
        stateKey: 'ancientMageActive',
        name: 'Ancient Mage',
        desc: "Apply Ancient Mage Buff: +20% Crit Rate/Dmg",
        color: '#60a5fa',
        math: (uStats) => {
            if (window.isUnit(uStats.id, 'ancient_mage')) return {};
            const stats = (typeof GLOBAL_UNIT_BUFFS !== 'undefined') ? GLOBAL_UNIT_BUFFS.ancient_mage.stats : { cRate: 20, cDmg: 20 };
            return { crit: stats.cRate, cdmg: stats.cDmg };
        },
        renderLabel: "Active: +20% Crit Rate/Dmg",
        genType: 'boolean'
    },
    kingSailor: {
        id: 'ksailor',
        stateKey: 'kingSailorActive',
        name: 'King Sailor',
        desc: "Passive: King of his People. +10% Crit Rate, +25% Crit Damage.",
        color: '#a7f3d0',
        math: (uStats, context) => {
            const isPotential = (typeof window !== 'undefined' && window.CALCULATION_MODE !== undefined) ? (window.CALCULATION_MODE === 'potential') : true;

            const isLoadout = (typeof window !== 'undefined' && window.CALCULATION_MODE === 'loadout');
            if (isLoadout && (!context || !context.isHotbar)) return {};

            const hState = window.hotbarState || (typeof hotbarState !== 'undefined' ? hotbarState : null);
            const leader = hState?.slots ? hState.slots[0] : null;
            const isKsLeading = leader && window.isUnit(leader.id, 'king_sailor');

            const hotbarBuffActive = hState?.buffState?.kingSailor || hState?.buffState?.ksailor;
            const globalActive = window.kingSailorActive;
            const contextActive = context?.kingSailorActive;

            let isActive = globalActive || hotbarBuffActive || contextActive || isKsLeading;

            if (isPotential && window.isUnit(uStats.id, 'king_sailor')) {
                isActive = true;
            }

            if (!isActive) return {};

            if (window.isUnit(uStats.id, 'king_sailor')) return {};
            const stats = (typeof GLOBAL_UNIT_BUFFS !== 'undefined') ? GLOBAL_UNIT_BUFFS.king_sailor.stats : { cRate: 10, cDmg: 25 };
            return { crit: stats.cRate, cdmg: stats.cDmg };
        },
        renderLabel: "Leader: King of his People",
        genType: 'boolean'
    },
    unrivaledMark: {
        id: 'unrivaledmark',
        stateKey: 'unrivaledMarkActive',
        name: 'Unrivaled Mark',
        desc: "Leader Passive: Unrivaled Mark. Only activates if in Slot 1 (Works on self). Applies tag buffs based on the leader.",
        color: '#a7f3d0',
        hideButton: true,
        math: (uStats, context) => {
            const isPotential = (typeof window !== 'undefined' && window.CALCULATION_MODE !== undefined) ? (window.CALCULATION_MODE === 'potential') : true;

            if (!isPotential && (!context || !context.isHotbar)) return {};

            let isActive = false;
            let leaderId = null;

            if (isPotential) {
                isActive = (window.isUnit(uStats.id, 'triple_threat') || window.isUnit(uStats.id, 'king_sailor'));
                leaderId = uStats.id;
            } else {
                const hState = (typeof window !== 'undefined') ? window.hotbarState : null;
                const leader = hState?.slots ? hState.slots[0] : null;
                if (leader) {
                    const lId = leader.id;
                    if (window.isUnit(lId, 'triple_threat') || window.isUnit(lId, 'king_sailor')) {
                        isActive = true;
                        leaderId = lId;
                    }
                }
            }

            if (!isActive || !leaderId) return {};

            const tags = uStats.tags || [];
            const element = String(uStats.element || uStats.stats?.element || "").toLowerCase();
            let b = { dmg: 0, range: 0, crit: 0, spa: 0 };

            const unrivaled = (typeof LEADER_BUFFS !== 'undefined') ? LEADER_BUFFS.unrivaled_mark : null;
            if (unrivaled && unrivaled.subBuffs) {
                unrivaled.subBuffs.forEach(sub => {
                    if (window.isUnit(leaderId, 'triple_threat')) {
                        if (sub.type === 'tag' && tags.includes(sub.value)) {
                            b.dmg += sub.stats.dmg || 0;
                        } else if (sub.type === 'element' && element === sub.value.toLowerCase()) {
                            b.dmg += sub.stats.dmg || 0;
                            b.crit += sub.stats.cRate || 0;
                        }
                    }
                });
            } else {
                if (window.isUnit(leaderId, 'triple_threat')) {
                    if (tags.includes('Piece')) b.dmg = 50;
                    else if (tags.includes('Sword')) b.dmg = 25;
                    else if (element === 'wind') { b.dmg = 20; b.crit = 5; }
                }
            }

            if (window.isUnit(leaderId, 'king_sailor')) {
                if (tags.includes('Magi')) {
                    b.dmg = 50;
                    b.spa = 15;
                } else if (tags.includes('Uncontrollable Power')) {
                    b.dmg = 30;
                    b.spa = 10;
                } else if (element === 'water') {
                    b.dmg = 20;
                    b.spa = 10;
                }
            }

            if (b.spa === 0) delete b.spa;
            if (b.dmg === 0) delete b.dmg;
            if (b.crit === 0) delete b.crit;
            if (b.range === 0) delete b.range;

            return Object.keys(b).length > 0 ? b : {};
        },
        renderLabel: "Leader: Unrivaled Mark",
        genType: 'boolean'
    },
    mageHill: {
        id: 'magehill',
        stateKey: 'fernHillActive',
        name: 'Fern (Hill)',
        desc: "Apply Fern (Hill) Buff: -30% SPA (Hill Only)",
        color: '#fb923c',
        excludes: 'mageGround',
        math: (uStats, context) => {
            const uType = (uStats.placementType || 'Ground').toLowerCase();
            const isMatching = (uType === 'hill' || uType === 'hybrid');
            const isFernSelf = window.isUnit(uStats.id, 'prodigy_mage');
            if (!isMatching && !isFernSelf) return {};

            const stats = (typeof GLOBAL_UNIT_BUFFS !== 'undefined') ? GLOBAL_UNIT_BUFFS.fern_hill.stats : { spa: 30 };

            if (window.CALCULATION_MODE === 'potential') return { spa: stats.spa };

            if (context.isHotbar) {
                const hotbar = window.hotbarState;
                if (!hotbar || !hotbar.slots) return {};
                const targets = hotbar.fernTargets || [];
                if (targets.length === 0) return {};
                const isFernPresent = hotbar.slots.some(s => s && window.isUnit(s.id, 'prodigy_mage'));
                if (!isFernPresent) return {};

                if (isFernSelf) return { spa: stats.spa };

                const slotIdx = hotbar.slots.findIndex(s => s && (s.id === uStats.id || window.isUnit(s.id, uStats.id)));
                return (slotIdx !== -1 && targets.includes(slotIdx)) ? { spa: stats.spa } : {};
            }

            return { spa: stats.spa };
        },
        renderLabel: "Active: -30% SPA",
        genType: 'exclusive:fern'
    },
    mageGround: {
        id: 'mageground',
        stateKey: 'fernGroundActive',
        name: 'Fern (Ground)',
        desc: "Apply Fern (Ground) Buff: +45% Crit Rate (Ground Only)",
        color: '#f472b6',
        excludes: 'mageHill',
        math: (uStats, context) => {
            const uType = (uStats.placementType || 'Ground').toLowerCase();
            const isMatching = (uType === 'ground' || uType === 'hybrid');
            const isFernSelf = window.isUnit(uStats.id, 'prodigy_mage');
            if (!isMatching && !isFernSelf) return {};

            const stats = (typeof GLOBAL_UNIT_BUFFS !== 'undefined') ? GLOBAL_UNIT_BUFFS.fern_ground.stats : { cRate: 45 };

            if (window.CALCULATION_MODE === 'potential') return { crit: stats.cRate };

            if (context.isHotbar) {
                const hotbar = window.hotbarState;
                if (!hotbar || !hotbar.slots) return {};
                const targets = hotbar.fernTargets || [];
                if (targets.length === 0) return {};
                const isFernPresent = hotbar.slots.some(s => s && window.isUnit(s.id, 'prodigy_mage'));
                if (!isFernPresent) return {};

                if (isFernSelf) return { crit: stats.cRate };

                const slotIdx = hotbar.slots.findIndex(s => s && (s.id === uStats.id || window.isUnit(s.id, uStats.id)));
                return (slotIdx !== -1 && targets.includes(slotIdx)) ? { crit: stats.cRate } : {};
            }

            return { crit: stats.cRate };
        },
        renderLabel: "Active: +45% Crit Rate",
        genType: 'exclusive:fern'
    },
};

window.GLOBAL_BUFF_DATA = GLOBAL_BUFF_DATA;
