import { units } from "../data/units.js";
import { traits } from "../data/traits.js";
import { relics } from "../data/relics.js";
import { setActiveTab } from "../components/tabs/tabs.js";

const NAV_CARDS = [
  {
    id: "units",
    title: "Units",
    desc: "Browse every unit, their stats, traits, and best builds.",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    gradient: "linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.15) 100%)",
  },
  {
    id: "traits",
    title: "Traits",
    desc: "See how traits modify units and what to reroll for.",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.5" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.5" fill="currentColor"/></svg>`,
    gradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(219, 39, 119, 0.15) 100%)",
  },
  {
    id: "relics",
    title: "Relics",
    desc: "Discover relics and the bonuses they grant your team.",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    gradient: "linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%)",
  },
  {
    id: "modes",
    title: "Modes",
    desc: "Game modes and how they change the way you play.",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
    badge: "soon",
    gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.15) 100%)",
  },
];

export async function HomePage() {
  const page = document.createElement("div");
  page.className = "page home-page";

  page.innerHTML = `
    <section class="home-hero">
      <div class="home-hero-eyebrow">Anime Expedition Wiki (Unofficial)</div>
      <h1 class="home-hero-title">Your complete database for the game.</h1>
      <p class="home-hero-sub">Look up units, traits, relics, and game modes. Everything is organized so you can find what you need and get back to playing.</p>
      <div class="home-stats">
        ${statCard(units.length, "Units")}
        ${statCard(traits.length, "Traits")}
        ${statCard(relics.length, "Relics")}
      </div>
    </section>

    <section class="home-nav">
      <div class="home-section-head">
        <h2 class="home-section-title">Explore the wiki</h2>
        <p class="home-section-sub">Pick a section to dive in.</p>
      </div>
      <div class="home-nav-grid">
        ${NAV_CARDS.map(navCard).join("")}
      </div>
    </section>
  `;

  page.querySelectorAll(".home-nav-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.section;
      if (id === "units") setActiveTab("main");
      window.dispatchEvent(new CustomEvent("navigate", { detail: { id } }));
    });
  });

  return page;
}

function statCard(value, label) {
  return `
    <div class="home-stat glass-card">
      <span class="home-stat-value">${value}</span>
      <span class="home-stat-label">${label}</span>
    </div>`;
}

function navCard(c) {
  return `
    <button class="home-nav-card" type="button" data-section="${c.id}" aria-label="Go to ${c.title}">
      <span class="home-nav-card-bg" style="background: ${c.gradient}"></span>
      <span class="home-nav-card-overlay"></span>
      <span class="home-nav-card-content">
        <span class="home-nav-card-icon">${c.icon}</span>
        <span class="home-nav-card-text">
          <span class="home-nav-card-title">${c.title}${c.badge ? `<span class="home-nav-card-badge">${c.badge}</span>` : ""}</span>
          <span class="home-nav-card-desc">${c.desc}</span>
        </span>
        <span class="home-nav-card-cta">
          Explore
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </span>
      </span>
    </button>`;
}