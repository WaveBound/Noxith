// ============================================================================
// SUMMON-FRONTEND.JS - UI State & Interaction Logic for Unit Custom Summons
// ============================================================================

window.toggleSummonDesc = (btn) => {
    const headerRow = btn.closest('tr');
    const descRow = headerRow.nextElementSibling;
    if (!descRow) return;

    if (descRow.classList.contains('hidden')) {
        descRow.classList.remove('hidden');
        btn.textContent = 'HIDE INFO';
        btn.style.background = 'rgba(96, 165, 250, 0.2)';
    } else {
        descRow.classList.add('hidden');
        btn.textContent = 'VIEW INFO';
        btn.style.background = '';
    }
};
