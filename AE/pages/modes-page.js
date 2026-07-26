import { ComingSoon } from "../components/coming-soon/coming-soon.js";

export async function ModesPage() {
  const page = document.createElement("div");
  page.className = "page";
  page.innerHTML = `
    <div class="page-title-row">
      <div>
        <h1>Modes</h1>
        <div class="page-subtitle">Future use</div>
      </div>
    </div>
  `;
  page.appendChild(ComingSoon({ title: "Coming Soon", message: "Game modes will appear here once they're ready." }));
  return page;
}
