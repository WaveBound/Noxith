// ComingSoon({ title, message }) -> HTMLElement
export function ComingSoon({ title = "Coming Soon", message = "This section is still being built." } = {}) {
  const wrap = document.createElement("div");
  wrap.className = "coming-soon";
  wrap.innerHTML = `
    <span class="coming-soon-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
    </span>
    <h2>${title}</h2>
    <p>${message}</p>
  `;
  return wrap;
}
