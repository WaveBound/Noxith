import { setActiveTab, openTab } from "../tabs/tabs.js";
import { openRelicModal } from "../relic-card/relic-card.js";
import { units } from "../../data/units.js";
import { relics } from "../../data/relics.js";
import { traits, IS_TRAITS_PUBLISHED } from "../../data/traits.js";
import { getItem, setItem } from "../../js/store.js";

const NOTIF_STORAGE_KEY = "notifications-read-state";

function generateDynamicNotifications() {
  const readState = getItem(NOTIF_STORAGE_KEY, {});

  const list = [
    {
      id: "update-mobile-dps-v12",
      icon: "✦",
      title: "DPS Breakdown & Mobile UI Updated",
      body: "Mobile touch scrolling, dynamic rank badges, and 1 decimal place DPS scaling have been added.",
      time: "Just now"
    },
    ...units.slice(0, 2).map(u => ({
      id: `unit-release-${u.id}`,
      icon: "✦",
      title: `Unit In Database: ${u.name}`,
      body: `Full stats, level scaling, and relic loadout options available for ${u.name}.`,
      time: "1d ago"
    })),
    ...relics.slice(0, 2).map(r => ({
      id: `relic-release-${r.id}`,
      icon: "⚔",
      title: `Relic Added: ${r.name}`,
      body: r.location || "Available in Relics database.",
      time: "2d ago"
    }))
  ];

  return list.map(item => ({
    ...item,
    unread: readState[item.id] === undefined ? true : !readState[item.id]
  }));
}

const ALL_MAIN_TABS = [
  {
    id: "home",
    name: "Home Dashboard",
    subtitle: "Wiki Overview & Highlights",
    badge: "Section",
    type: "main-tab",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>`,
  },
  {
    id: "units",
    name: "Units Catalog",
    subtitle: "Browse & Compare All Units",
    badge: "Section",
    type: "main-tab",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  },
  {
    id: "dps",
    name: "DPS Breakdown",
    subtitle: "Damage Scaling & DPS Calculator",
    badge: "Section",
    type: "main-tab",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  },
  {
    id: "traits",
    name: "Traits List",
    subtitle: "Unit Trait Modifiers & Rarity",
    badge: "Section",
    type: "main-tab",
    published: IS_TRAITS_PUBLISHED,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3c0 5 14 5 14 10s-14 5-14 10"/><path d="M19 3c0 5-14 5-14 10"/><path d="M7 7h10M7 17h10"/></svg>`,
  },
  {
    id: "relics",
    name: "Relics Database",
    subtitle: "Equipable Relics & Stat Boosts",
    badge: "Section",
    type: "main-tab",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l5 4-5 5-5-5z"/><path d="M7 6l5 5 5-5"/><path d="M12 11v9"/><path d="M8 14l4 3 4-3"/></svg>`,
  },
  {
    id: "modes",
    name: "Game Modes",
    subtitle: "Infinity & Challenge Modes",
    badge: "Section",
    type: "main-tab",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  },
];

export function renderHeader(mountEl) {
  const MAIN_TABS = ALL_MAIN_TABS.filter(t => t.id !== "traits" || IS_TRAITS_PUBLISHED);

  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform || "") ||
    /Mac/.test(navigator.userAgent || "");
  const kbdLabel = isMac ? "⌘K" : "Ctrl K";

  const notifications = generateDynamicNotifications();
  const unreadCount = notifications.filter((n) => n.unread).length;

  const header = document.createElement("header");
  header.className = "top-header";
  header.innerHTML = `
    <button type="button" class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Toggle navigation menu">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>

    <div class="header-breadcrumb" id="header-breadcrumb">
      <span class="breadcrumb-root breadcrumb-link" data-section="home" title="Go to Home">Home</span>
      <span class="breadcrumb-sep">/</span>
      <span class="breadcrumb-current" id="breadcrumb-current">Home</span>
    </div>

    <div class="header-search-container">
      <div class="header-search">
        <svg class="search-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <input type="text" placeholder="Search tabs, units, relics..." id="global-search" autocomplete="off" />
        <button type="button" class="search-clear-btn" id="search-clear-btn" title="Clear search" hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <span class="header-search-kbd">${kbdLabel}</span>
      </div>
      <div class="search-popdown" id="search-popdown" hidden>
        <div class="search-popdown-filter-bar" id="search-filter-bar">
          <button type="button" class="filter-tab active" data-filter="all">All</button>
          <button type="button" class="filter-tab" data-filter="tabs">Tabs</button>
          <button type="button" class="filter-tab" data-filter="units">Units</button>
          <button type="button" class="filter-tab" data-filter="relics">Relics</button>
          ${IS_TRAITS_PUBLISHED ? `<button type="button" class="filter-tab" data-filter="traits">Traits</button>` : ""}
        </div>
        <div class="search-popdown-results" id="search-popdown-results"></div>
        <div class="search-popdown-footer">
          <div class="footer-hint"><kbd>↑</kbd><kbd>↓</kbd> Navigate</div>
          <div class="footer-hint"><kbd>↵</kbd> Select & Open Tab</div>
          <div class="footer-hint"><kbd>esc</kbd> Dismiss</div>
        </div>
      </div>
    </div>

    <div class="header-actions">
      <div class="header-notif">
        <button class="header-icon-btn" type="button" id="notif-btn" aria-label="Notifications" aria-haspopup="true" aria-expanded="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg>
          ${unreadCount ? `<span class="notif-badge">${unreadCount}</span>` : ""}
        </button>
        <div class="notif-tray" id="notif-tray" role="menu" hidden>
          <div class="notif-tray-head">
            <span class="notif-tray-title">Notifications</span>
            <button class="notif-tray-clear" type="button" id="notif-clear">Mark all read</button>
          </div>
          <div class="notif-list">
            ${notifications.map((n, i) => `
              <div class="notif-item${n.unread ? " is-unread" : ""}" data-id="${n.id}" data-index="${i}">
                <span class="notif-item-icon">${n.icon}</span>
                <div class="notif-item-body">
                  <div class="notif-item-title">${n.title}</div>
                  <div class="notif-item-text">${n.body}</div>
                  <div class="notif-item-time">${n.time}</div>
                </div>
              </div>
            `).join("")}
          </div>
          <div class="notif-tray-foot">You're all caught up</div>
        </div>
      </div>
    </div>
  `;

  mountEl.appendChild(header);

  let backdrop = document.querySelector(".sidebar-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "sidebar-backdrop";
    document.body.appendChild(backdrop);
  }

  const mobileBtn = header.querySelector("#mobile-menu-btn");
  const getSidebar = () => document.getElementById("sidebar");

  const closeMobileSidebar = () => {
    const sidebar = getSidebar();
    if (sidebar) sidebar.classList.remove("open");
    backdrop.classList.remove("open");
  };

  const toggleMobileSidebar = () => {
    const sidebar = getSidebar();
    if (!sidebar) return;
    const isOpen = sidebar.classList.toggle("open");
    backdrop.classList.toggle("open", isOpen);
  };

  mobileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMobileSidebar();
  });

  backdrop.addEventListener("click", closeMobileSidebar);
  window.addEventListener("navigate", closeMobileSidebar);

  const input = header.querySelector("#global-search");
  const clearBtn = header.querySelector("#search-clear-btn");
  const popdown = header.querySelector("#search-popdown");
  const popdownResults = header.querySelector("#search-popdown-results");
  const filterBar = header.querySelector("#search-filter-bar");

  let selectedIndex = -1;
  let activeFilter = "all";

  clearBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    input.value = "";
    clearBtn.hidden = true;
    selectedIndex = -1;
    renderPopdown();
    input.focus();
  });

  filterBar.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-tab");
    if (!btn) return;
    filterBar.querySelectorAll(".filter-tab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    selectedIndex = -1;
    renderPopdown();
  });

  function getMatches(query) {
    const q = query.trim().toLowerCase();

    const mainMatches = MAIN_TABS.filter((t) => {
      if (activeFilter !== "all" && activeFilter !== "tabs") return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    }).map((t) => ({
      ...t,
      badge: "Tab",
      badgeClass: "badge-tab",
    }));

    const unitMatches = units.filter((u) => {
      if (activeFilter !== "all" && activeFilter !== "units") return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        (u.preferredTrait && u.preferredTrait.toLowerCase().includes(q)) ||
        (u.stats?.archetype && u.stats.archetype.toLowerCase().includes(q))
      );
    }).map((u) => ({
      id: u.id,
      name: u.name,
      subtitle: `${u.stats?.archetype || 'Unit'} • Preferred: ${u.preferredTrait || '—'}`,
      badge: "Unit",
      badgeClass: "badge-unit",
      type: "unit",
      image: u.image || "assets/placeholder.svg",
    }));

    const relicMatches = relics.filter((r) => {
      if (activeFilter !== "all" && activeFilter !== "relics") return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        (r.location && r.location.toLowerCase().includes(q)) ||
        (r.derivedStats && r.derivedStats.toLowerCase().includes(q))
      );
    }).map((r) => ({
      id: r.id,
      name: r.name,
      subtitle: r.location || "Relic Item",
      badge: "Relic",
      badgeClass: "badge-relic",
      type: "relic",
      image: r.image || "assets/placeholder.svg",
    }));

    const traitMatches = IS_TRAITS_PUBLISHED ? traits.filter((tr) => {
      if (activeFilter !== "all" && activeFilter !== "traits") return false;
      if (!q) return true;
      return (
        tr.name.toLowerCase().includes(q) ||
        (tr.rarity && tr.rarity.toLowerCase().includes(q))
      );
    }).map((tr) => ({
      id: tr.id,
      name: tr.name,
      subtitle: `${tr.rarity || 'Trait'} Rarity`,
      badge: "Trait",
      badgeClass: "badge-trait",
      type: "trait",
      image: tr.image || "assets/placeholder.svg",
    })) : [];

    return { mainMatches, unitMatches, relicMatches, traitMatches, q };
  }

  function renderPopdown() {
    const query = input.value;
    clearBtn.hidden = !query.length;
    const { mainMatches, unitMatches, relicMatches, traitMatches, q } = getMatches(query);

    let html = "";
    let itemIndex = 0;

    const renderItem = (item, isTab = false) => {
      const idx = itemIndex++;
      const iconHtml = isTab
        ? `<div class="search-item-icon tab-icon-box">${item.icon}</div>`
        : `<div class="search-item-icon media-box"><img src="${item.image}" alt="${item.name}" onerror="this.src='assets/placeholder.svg'" /></div>`;

      const actionText = isTab ? "Jump →" : "Open ↗";

      return `
        <div class="search-item${idx === selectedIndex ? " is-selected" : ""}" 
             data-index="${idx}"
             data-item-type="${item.type}" 
             data-item-id="${item.id}" 
             data-item-name="${item.name}">
          ${iconHtml}
          <div class="search-item-info">
            <div class="search-item-title">${escapeHtml(item.name)}</div>
            <div class="search-item-sub">${escapeHtml(item.subtitle)}</div>
          </div>
          <span class="search-item-badge ${item.badgeClass || 'badge-tab'}">${item.badge}</span>
          <span class="search-item-action">${actionText}</span>
        </div>
      `;
    };

    if (mainMatches.length > 0) {
      html += `
        <div class="search-group-header">
          <span class="search-group-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> Main Sections & Tabs</span>
          <span class="search-group-count">${mainMatches.length}</span>
        </div>
      `;
      mainMatches.forEach((tab) => {
        html += renderItem(tab, true);
      });
    }

    if (unitMatches.length > 0) {
      html += `
        <div class="search-group-header">
          <span class="search-group-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> Unit Pages</span>
          <span class="search-group-count">${unitMatches.length}</span>
        </div>
      `;
      unitMatches.forEach((unit) => {
        html += renderItem(unit, false);
      });
    }

    if (relicMatches.length > 0) {
      html += `
        <div class="search-group-header">
          <span class="search-group-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l5 4-5 5-5-5z"/><path d="M12 11v9"/></svg> Relics</span>
          <span class="search-group-count">${relicMatches.length}</span>
        </div>
      `;
      relicMatches.forEach((relic) => {
        html += renderItem(relic, false);
      });
    }

    if (traitMatches.length > 0) {
      html += `
        <div class="search-group-header">
          <span class="search-group-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> Traits</span>
          <span class="search-group-count">${traitMatches.length}</span>
        </div>
      `;
      traitMatches.forEach((trait) => {
        html += renderItem(trait, false);
      });
    }

    if (itemIndex === 0) {
      html = `
        <div class="search-no-results">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <div>No results found for "<strong>${escapeHtml(q)}</strong>"</div>
        </div>
      `;
    }

    popdownResults.innerHTML = html;

    popdownResults.querySelectorAll(".search-item").forEach((el) => {
      el.addEventListener("click", () => selectPopdownItem(el));
      el.addEventListener("mouseenter", () => {
        selectedIndex = Number(el.dataset.index);
        updateSelectionHighlight();
      });
    });
  }

  function updateSelectionHighlight() {
    const items = popdownResults.querySelectorAll(".search-item");
    items.forEach((el, i) => {
      const isSel = i === selectedIndex;
      el.classList.toggle("is-selected", isSel);
      if (isSel) {
        el.scrollIntoView({ block: "nearest" });
      }
    });
  }

  function selectPopdownItem(itemEl) {
    if (!itemEl) return;
    const type = itemEl.dataset.itemType;
    const id = itemEl.dataset.itemId;

    input.value = "";
    window.dispatchEvent(new CustomEvent("wiki-search", { detail: { query: "" } }));

    if (type === "main-tab") {
      if (id === "units") setActiveTab("main");
      window.dispatchEvent(new CustomEvent("navigate", { detail: { id } }));
    } else if (type === "unit") {
      openTab(id);
      window.dispatchEvent(new CustomEvent("navigate", { detail: { id: "units" } }));
    } else if (type === "relic") {
      window.dispatchEvent(new CustomEvent("navigate", { detail: { id: "relics" } }));
      const targetRelic = relics.find((r) => r.id === id);
      if (targetRelic) {
        setTimeout(() => openRelicModal(targetRelic), 50);
      }
    } else if (type === "trait" && IS_TRAITS_PUBLISHED) {
      window.dispatchEvent(new CustomEvent("navigate", { detail: { id: "traits" } }));
    }

    closePopdown();
    input.blur();
  }

  function openPopdown() {
    popdown.hidden = false;
    selectedIndex = -1;
    renderPopdown();
  }

  function closePopdown() {
    popdown.hidden = true;
    selectedIndex = -1;
  }

  input.addEventListener("focus", () => {
    openPopdown();
  });

  input.addEventListener("input", () => {
    if (popdown.hidden) openPopdown();
    else {
      selectedIndex = -1;
      renderPopdown();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (popdown.hidden) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        openPopdown();
        return;
      }
      return;
    }

    const items = popdownResults.querySelectorAll(".search-item");
    const count = items.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (count > 0) {
        selectedIndex = (selectedIndex + 1) % count;
        updateSelectionHighlight();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (count > 0) {
        selectedIndex = selectedIndex <= 0 ? count - 1 : selectedIndex - 1;
        updateSelectionHighlight();
      }
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && items[selectedIndex]) {
        e.preventDefault();
        selectPopdownItem(items[selectedIndex]);
      } else if (count > 0) {
        e.preventDefault();
        selectPopdownItem(items[0]);
      }
    } else if (e.key === "Escape") {
      closePopdown();
      input.blur();
    }
  });

  document.addEventListener("click", (e) => {
    const container = header.querySelector(".header-search-container");
    if (container && !container.contains(e.target)) {
      closePopdown();
    }
  });

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      input.focus();
      input.select();
      openPopdown();
    }
  });

  const breadcrumb = header.querySelector("#header-breadcrumb");
  breadcrumb.addEventListener("click", (e) => {
    const link = e.target.closest("[data-section]");
    if (!link) return;
    const section = link.dataset.section;
    if (section === "units") setActiveTab("main");
    window.dispatchEvent(new CustomEvent("navigate", { detail: { id: section } }));
  });

  const notifBtn = header.querySelector("#notif-btn");
  const notifTray = header.querySelector("#notif-tray");
  const notifClear = header.querySelector("#notif-clear");

  function openTray() {
    closePopdown();
    notifTray.hidden = false;
    notifBtn.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => notifTray.classList.add("is-open"));
    window.dispatchEvent(new CustomEvent("notif-tray-open"));
  }

  function closeTray() {
    notifTray.classList.remove("is-open");
    notifBtn.setAttribute("aria-pressed", "false");
    setTimeout(() => { notifTray.hidden = true; }, 160);
  }

  function toggleTray() {
    notifTray.hidden ? openTray() : closeTray();
  }

  notifBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleTray();
  });

  document.addEventListener("click", (e) => {
    if (notifTray.hidden) return;
    if (!notifTray.contains(e.target) && !notifBtn.contains(e.target)) closeTray();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !notifTray.hidden) closeTray();
  });

  function refreshBadge() {
    const currentNotifs = generateDynamicNotifications();
    const count = currentNotifs.filter((n) => n.unread).length;
    let badge = notifBtn.querySelector(".notif-badge");
    if (count > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "notif-badge";
        notifBtn.appendChild(badge);
      }
      badge.textContent = count;
    } else if (badge) {
      badge.remove();
    }
  }

  function markRead(id) {
    if (!id) return;
    const readState = getItem(NOTIF_STORAGE_KEY, {});
    readState[id] = true;
    setItem(NOTIF_STORAGE_KEY, readState);

    const item = notifTray.querySelector(`.notif-item[data-id="${id}"]`);
    if (item) item.classList.remove("is-unread");
    refreshBadge();
  }

  notifTray.querySelectorAll(".notif-item").forEach((item) => {
    item.addEventListener("mouseenter", () => markRead(item.dataset.id));
    item.addEventListener("click", () => markRead(item.dataset.id));
  });

  notifClear.addEventListener("click", (e) => {
    e.stopPropagation();
    const readState = getItem(NOTIF_STORAGE_KEY, {});
    generateDynamicNotifications().forEach((n) => {
      readState[n.id] = true;
    });
    setItem(NOTIF_STORAGE_KEY, readState);

    notifTray.querySelectorAll(".notif-item.is-unread").forEach((el) => el.classList.remove("is-unread"));
    refreshBadge();
  });
}

export function setBreadcrumb(section, unitName = null) {
  const el = document.getElementById("breadcrumb-current");
  if (!el) return;

  const onHome = section === "home" && !unitName;
  document.querySelector(".breadcrumb-root")?.classList.toggle("hidden", onHome);
  document.querySelector(".breadcrumb-sep")?.classList.toggle("hidden", onHome);

  if (unitName) {
    el.innerHTML = `<span class="breadcrumb-link" data-section="${section}">${capitalize(section)}</span><span class="breadcrumb-sep">/</span>${unitName}`;
  } else {
    el.textContent = capitalize(section);
  }
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, (m) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m];
  });
}