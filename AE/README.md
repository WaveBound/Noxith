# Anime TD Wiki — UI Foundation

A modular, data-driven foundation for an Anime Tower Defense wiki. Dark theme,
purple accents, glass cards — styled after the provided dashboard reference.
**No real game data yet** — everything renders from placeholder objects so you
can wire in your own data later without touching any HTML/CSS.

## Running it

Because components load their HTML templates with `fetch()` and the app uses
native ES modules, the site must be served over HTTP — it will not work by
double-clicking `index.html` (`file://` blocks both `fetch` and modules).

From this folder, run any static server, for example:

```bash
python3 -m http.server 8080
# or
npx serve .
```

Then open `http://localhost:8080`.

## Structure

```
index.html              # shell that mounts every component
css/                     # design tokens, resets, page layout
components/              # one folder per reusable UI piece (html + css + js)
  sidebar/               # fixed left nav
  page-header/           # top search bar + bell
  tabs/                  # persistent unit sub-tabs (localStorage)
  grid/                  # generic responsive grid renderer
  unit-card/             # UnitCard(data)
  trait-card/            # TraitCard(data)
  relic-card/            # RelicCard(data)
  unit-info/             # UnitHeader, BestTraitsPanel, UnitStatsPanel,
                          # composed together by unit-info-page.js
  coming-soon/           # "Coming Soon" placeholder used by Modes
pages/                   # one file per sidebar section, composes components
  units-page.js
  traits-page.js
  relics-page.js
  modes-page.js
data/                    # placeholder data objects — edit/replace these
  units.js
  traits.js
  relics.js
js/
  app.js                 # router: sidebar clicks, tabs, search, page swaps
  store.js                # localStorage helpers
assets/
  placeholder.svg         # stand-in image used everywhere
```

## Adding real data

Every card and panel is a pure function of a JS object — nothing is
hardcoded in HTML.

```js
// components/unit-card/unit-card.js
UnitCard({ id, name, image, trait })

// data/units.js
export const units = [
  {
    id: "shadow-slayer",
    name: "Shadow Slayer",
    image: "assets/units/shadow-slayer.png",
    trait: "Speed",
    preferredTrait: "Golden",
    description: "A fast melee attacker with high single-target burst.",
    stats: { damage: "1,240", spa: "0.8s", range: "6", critChance: "12%", critDamage: "150%" },
    recommendedRelics: [ /* three relic-shaped objects */ ],
    bestTraits: [ /* ranked trait entries, best first */ ],
  },
  // add more units here — no HTML changes required
];
```

The same pattern applies to `data/traits.js` and `data/relics.js`. Add an
entry, the corresponding grid picks it up automatically.

## Persistent unit tabs

Opening a unit from the Units grid creates a closable sub-tab next to the
main "Units" tab (`components/tabs/tabs.js`). Open tabs and the active tab
are saved to `localStorage` on every change, so they restore automatically
after a refresh or reopening the browser.

## Re-theming

All colors, radii, spacing and fonts are CSS variables in
`css/variables.css`. Changing `--purple`, `--background`, `--card`, etc. in
one place re-themes every component.
