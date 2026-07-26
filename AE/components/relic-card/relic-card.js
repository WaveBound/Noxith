import { STAT_ICONS, STATUS_ICONS, iconImg, formatPassiveText } from "../../icons/icons.js";

let templatePromise = null;

async function loadTemplate() {
  if (!templatePromise) {
    templatePromise = fetch("components/relic-card/relic-card.html?v=" + Date.now())
      .then((r) => r.text())
      .then((html) => {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        return wrapper.querySelector("#tpl-relic-card");
      });
  }
  return templatePromise;
}

// Format a stat value: plain string, or { min, max } range object.
function formatStatValue(v) {
  if (v == null || v === "") return "";
  if (typeof v === "object") {
    const lo = v.min || "";
    const hi = v.max || "";
    if (!lo && !hi) return "";
    if (lo && hi) return `${lo} - ${hi}`;
    return lo || hi;
  }
  return String(v);
}

// Full, readable stat labels
const LABELS = {
  damage: "Damage",
  spa: "SPA",
  critChance: "Crit Rate",
  critDamage: "Crit Dmg",
  magicdamage: "Magical Dmg",
  physicaldamage: "Physical Dmg",
  range: "Range",
};

// Build the stats grid markup (used inside the modal)
function buildStatsHtml(data) {
  if (!data.stats || !Array.isArray(data.stats)) return "";
  const boxes = [];
  data.stats.forEach(block => {
    Object.entries(block).forEach(([key, val]) => {
      const formatted = formatStatValue(val);
      if (!formatted) return;
      const iconKey = key === "critChance" || key === "critDamage" ? "critChance"
        : key === "magicdamage" ? "magicmagic"
          : key === "physicaldamage" ? "physicaldamage"
            : key;
      const displayLabel = LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
      boxes.push(`
        <div class="relic-modal-stat-box">
          <span class="relic-modal-stat-icon">${STAT_ICONS[iconKey] || STAT_ICONS.damage}</span>
          <span class="relic-modal-stat-body">
            <span class="relic-modal-stat-label">${displayLabel}</span>
            <span class="relic-modal-stat-value">${formatted}</span>
          </span>
        </div>`);
    });
  });
  if (!boxes.length) return "";
  return `<div class="relic-modal-stats">${boxes.join("")}</div>`;
}

// Build the passive block markup (used inside the modal)
function buildPassiveHtml(data) {
  if (!data.passive) return "";
  const p = data.passive;
  const formattedDesc = formatPassiveText(p.desc); // Utilizing centralized formatter from icons.js
  return `
    <div class="relic-modal-passive">
      <div class="relic-modal-passive-header">
        <span class="relic-modal-passive-tag">PASSIVE</span>
        <span class="relic-modal-passive-title">${p.name}</span>
      </div>
      <div class="relic-modal-passive-text">${formattedDesc}</div>
    </div>`;
}

// Open a modal overlay showing the relic's stats + passive.
export function openRelicModal(data) {
  // Remove any existing modal first
  const existing = document.querySelector(".relic-modal-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.className = "relic-modal-overlay";

  const modal = document.createElement("div");
  modal.className = "relic-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");

  const slotLabel = data.unitEquip ? "Unit Equip" : "Relic";
  const imgSrc = data.image || "assets/placeholder.svg";

  modal.innerHTML = `
    <button class="relic-modal-close" aria-label="Close">&times;</button>
    <div class="relic-modal-head">
      <div class="relic-modal-art">
        <img src="${imgSrc}" alt="${data.name || "Relic"}" />
      </div>
      <div class="relic-modal-title">
        <span class="relic-modal-slot">${slotLabel}</span>
        <span class="relic-modal-name">${data.name || "---"}</span>
      </div>
    </div>
    ${buildStatsHtml(data)}
    ${buildPassiveHtml(data)}
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close handlers
  const close = (e) => {
    if (e) e.stopPropagation();
    document.removeEventListener("keydown", onKey);
    overlay.remove();
  };
  function onKey(e) {
    if (e.key === "Escape") close(e);
  }

  modal.querySelector(".relic-modal-close").addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close(e);
  });
  document.addEventListener("keydown", onKey);
}

export async function RelicCard(data) {
  const template = await loadTemplate();
  const node = template.content.cloneNode(true);
  const card = node.querySelector(".relic-card-container");

  const img = card.querySelector('[data-role="image"]');
  img.src = data.image || "assets/placeholder.svg";
  img.alt = data.name || "Relic placeholder";

  card.querySelector('[data-role="name"]').textContent = data.name || "---";

  // Clicking anywhere on the entire relic card container now opens the detail popup modal.
  const open = () => openRelicModal(data);
  card.addEventListener("click", (e) => {
    e.stopPropagation();
    open();
  });
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  });

  return card;
}