import { units } from "../data/units.js";
import { traits } from "../data/traits.js";
import { relics } from "../data/relics.js";
import { setActiveTab } from "../components/tabs/tabs.js";

// Navigation cards shown on the landing page. Each one darkens a placeholder
// image and overlays clean wording; clicking dispatches a "navigate" event
// (same mechanism the sidebar uses) to jump to that section's tab.
const NAV_CARDS = [
    {
        id: "units",
        title: "Units",
        desc: "Browse every unit, their stats, traits, and best builds.",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    },
    {
        id: "traits",
        title: "Traits",
        desc: "See how traits modify units and what to reroll for.",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l2.6 6.2 6.7.5-5.1 4.4 1.6 6.6L12 16.9 6.2 19.7l1.6-6.6-5.1-4.4 6.7-.5z"/></svg>`,
    },
    {
        id: "relics",
        title: "Relics",
        desc: "Discover relics and the bonuses they grant your team.",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l7 4v6c0 5-3.2 8.5-7 10-3.8-1.5-7-5-7-10V6z"/></svg>`,
    },
    {
        id: "modes",
        title: "Modes",
        desc: "Game modes and how they change the way you play.",
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
        badge: "soon",
    },
];

// HomePage() -> HTMLElement
// The base/landing page a visitor starts on. Pure render (no internal state).
export async function HomePage() {
    const page = document.createElement("div");
    page.className = "page home-page";

    page.innerHTML = `
    <section class="home-hero">
      <div class="home-hero-eyebrow">Anime TD Wiki</div>
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
            // Returning to Units should land on the grid, not a previously open unit.
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
      <img class="home-nav-card-img" src="assets/placeholder.svg" alt="" aria-hidden="true" />
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
