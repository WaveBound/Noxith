import { traits } from "../data/traits.js";
import { units } from "../data/units.js";
import { toAbsoluteUrl } from "../icons/icons.js";

export async function TraitsPage() {
  const page = document.createElement("div");
  page.className = "page trait-reroll-page";

  let selectedUnit = null;
  let isIndexOpen = true;
  let rollCount = 0;
  let pityTracker = { unbound: 0, primordial: 0, forsaken: 0, draconic: 0 };

  const bgFrameUrl = toAbsoluteUrl("assets/Traits Roll Ui/Trait_Roll_Bg.png");
  const rollBtnUrl = toAbsoluteUrl("assets/Traits Roll Ui/Trait_Roll_Button.png");
  const indexBtnUrl = toAbsoluteUrl("assets/Traits Roll Ui/Trait_Index_Button.png");
  const filtersBtnUrl = toAbsoluteUrl("assets/Traits Roll Ui/Trait_Filters_Button.png");

  page.innerHTML = `
    <div class="tr-wrapper">
      
      <!-- LEFT SIDE: Borderless Scrollable Trait Index -->
      <div class="tr-index-sidebar ${isIndexOpen ? '' : 'closed'}" id="index-sidebar">
        <div class="tr-sidebar-scroll">
          ${traits.map(renderIndexCard).join("")}
        </div>
      </div>

      <!-- RIGHT SIDE: Trait Reroll UI Frame -->
      <div class="tr-game-frame-container">
        <!-- Main UI Background Frame Image -->
        <img class="tr-bg-frame-img" src="${bgFrameUrl}" alt="Trait Reroll UI" />

        <!-- Central Unit Slot Overlay -->
        <div class="tr-overlay-unit-slot" id="unit-slot-trigger">
          <div class="tr-slot-content">
            <!-- Prompt Pill (Shown when NO unit is selected) -->
            <span class="tr-prompt-pill" id="prompt-pill">Select a unit to begin rerolling</span>
            
            <!-- Unit Preview Box -->
            <div class="tr-unit-preview-box">
              <img id="unit-avatar-img" src="" alt="" class="tr-unit-avatar hidden" />
            </div>

            <!-- Static Size Equipped Trait Badge (No Description) -->
            <div class="tr-equipped-trait-badge hidden" id="equipped-trait-badge">
              <span class="tr-eq-name" id="eq-name">No Trait</span>
            </div>
          </div>
        </div>

        <!-- Bottom Toolbar Buttons -->
        <div class="tr-bottom-btn-group">
          <button type="button" class="tr-img-btn tr-btn-index" id="btn-toggle-index" title="Toggle Index List">
            <img src="${indexBtnUrl}" alt="Index" />
          </button>

          <button type="button" class="tr-img-btn tr-btn-reroll" id="btn-do-reroll" title="Reroll Trait">
            <img src="${rollBtnUrl}" alt="Reroll" />
          </button>

          <button type="button" class="tr-img-btn tr-btn-filters" id="btn-open-filters" title="Filters">
            <img src="${filtersBtnUrl}" alt="Filters" />
          </button>
        </div>

      </div>
    </div>

    <!-- Unit Picker Modal -->
    <div class="tr-modal-overlay hidden" id="unit-picker-modal">
      <div class="tr-modal-box">
        <div class="tr-modal-header">
          <span>Select Unit to Reroll</span>
          <button type="button" class="tr-modal-close-btn" id="close-picker">&times;</button>
        </div>
        <div class="tr-unit-grid">
          ${units.map(u => `
            <button type="button" class="tr-unit-card-btn" data-unit-id="${u.id}">
              <img src="${toAbsoluteUrl(u.image || 'assets/placeholder.svg')}" alt="${u.name}" onerror="this.src='assets/placeholder.svg'" />
              <span>${u.name}</span>
            </button>
          `).join("")}
        </div>
      </div>
    </div>
  `;

  // Refs
  const sidebar = page.querySelector("#index-sidebar");
  const promptPill = page.querySelector("#prompt-pill");
  const unitAvatarImg = page.querySelector("#unit-avatar-img");
  const equippedBadge = page.querySelector("#equipped-trait-badge");
  const eqName = page.querySelector("#eq-name");
  const btnReroll = page.querySelector("#btn-do-reroll");
  const btnToggleIndex = page.querySelector("#btn-toggle-index");
  const unitPickerModal = page.querySelector("#unit-picker-modal");

  function renderIndexCard(t) {
    const titleClass = t.rainbowClass ? t.rainbowClass : "";
    const styleAttr = t.color ? `style="color:${t.color};"` : "";

    const pityHtml = t.pity
      ? `<div class="tr-pity-row">
           <span class="tr-pity-lbl">Pity</span>
           <div class="tr-pity-track"><div class="tr-pity-bar-fill" id="pity-fill-${t.id}" style="width:0%"></div></div>
           <span class="tr-pity-val"><span id="pity-num-${t.id}">0</span>/${t.pity.toLocaleString()}</span>
         </div>`
      : "";

    return `
      <div class="tr-index-card">
        <div class="tr-card-icon-area">
          <div class="tr-card-icon-blank">
            ${t.image && t.image !== 'assets/placeholder.svg' ? `<img src="${toAbsoluteUrl(t.image)}" alt="" />` : ''}
          </div>
          <span class="tr-card-rate-lbl">${t.dropRate}</span>
        </div>
        <div class="tr-card-body">
          <div class="tr-card-title ${titleClass}" ${styleAttr}>${t.name}</div>
          <div class="tr-card-desc">${t.description}</div>
          ${pityHtml}
        </div>
      </div>
    `;
  }

  function updatePityUI() {
    traits.forEach(t => {
      if (t.pity) {
        const currentPity = pityTracker[t.id] || 0;
        const pct = Math.min(100, (currentPity / t.pity) * 100);
        const numEl = page.querySelector(`#pity-num-${t.id}`);
        const fillEl = page.querySelector(`#pity-fill-${t.id}`);
        if (numEl) numEl.textContent = currentPity.toLocaleString();
        if (fillEl) fillEl.style.width = `${pct}%`;
      }
    });
  }

  function applyEquippedTraitUI(trait) {
    promptPill.classList.add("hidden");
    equippedBadge.classList.remove("hidden");
    eqName.textContent = trait.name;
    eqName.className = "tr-eq-name " + (trait.rainbowClass || "");
    eqName.style.color = trait.color || "";
  }

  function selectUnit(unit) {
    selectedUnit = unit;
    unitAvatarImg.src = toAbsoluteUrl(unit.image || "assets/placeholder.svg");
    unitAvatarImg.classList.remove("hidden");

    if (unit.equippedTrait) {
      applyEquippedTraitUI(unit.equippedTrait);
    } else {
      promptPill.classList.add("hidden");
      equippedBadge.classList.remove("hidden");
      eqName.textContent = "No Trait";
      eqName.className = "tr-eq-name";
      eqName.style.color = "#a1a1aa";
    }

    unitPickerModal.classList.add("hidden");
  }

  function performRoll() {
    rollCount++;

    for (const t of traits) {
      if (t.pity) pityTracker[t.id] = (pityTracker[t.id] || 0) + 1;
    }

    let wonTrait = null;

    if (pityTracker.unbound >= 1500) wonTrait = traits.find(t => t.id === "unbound");
    else if (pityTracker.primordial >= 750) wonTrait = traits.find(t => t.id === "primordial");
    else if (pityTracker.forsaken >= 500) wonTrait = traits.find(t => t.id === "forsaken");
    else if (pityTracker.draconic >= 300) wonTrait = traits.find(t => t.id === "draconic");

    if (!wonTrait) {
      const rand = Math.random() * 100;
      let cumulative = 0;
      for (const t of traits) {
        cumulative += t.rateNum;
        if (rand <= cumulative) {
          wonTrait = t;
          break;
        }
      }
    }

    if (!wonTrait) wonTrait = traits[traits.length - 1];

    if (wonTrait.rarity === "Mythic") {
      pityTracker[wonTrait.id] = 0;
    }

    updatePityUI();
    return wonTrait;
  }

  // Instant Roll
  function triggerReroll() {
    if (!selectedUnit) {
      unitPickerModal.classList.remove("hidden");
      return;
    }

    promptPill.classList.add("hidden");
    equippedBadge.classList.remove("hidden");

    const result = performRoll();
    selectedUnit.equippedTrait = result;
    applyEquippedTraitUI(result);
  }

  btnToggleIndex.addEventListener("click", () => {
    isIndexOpen = !isIndexOpen;
    sidebar.classList.toggle("closed", !isIndexOpen);
  });

  page.querySelector("#unit-slot-trigger").addEventListener("click", () => {
    unitPickerModal.classList.remove("hidden");
  });

  page.querySelector("#close-picker").addEventListener("click", () => {
    unitPickerModal.classList.add("hidden");
  });

  btnReroll.addEventListener("click", triggerReroll);

  page.querySelectorAll(".tr-unit-card-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const uId = btn.dataset.unitId;
      const found = units.find(u => u.id === uId);
      if (found) selectUnit(found);
    });
  });

  if (units.length > 0) {
    selectUnit(units[0]);
  }

  updatePityUI();
  return page;
}