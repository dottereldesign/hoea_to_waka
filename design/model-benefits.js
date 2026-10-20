export function setupModelBenefits(section) {
  if (!section) return;
  const rows = [...section.querySelectorAll('[data-benefit-row]')];
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  function activate(selected) {
    rows.forEach(row => {
      const active = row === selected;
      row.classList.toggle('is-active', active);
      row.querySelector('.model-benefit-select').setAttribute('aria-pressed', String(active));
    });
  }
  rows.forEach(row => {
    const button = row.querySelector('.model-benefit-select');
    row.addEventListener('pointerenter', () => { if (hover.matches) activate(row); });
    button.addEventListener('focus', () => activate(row));
    button.addEventListener('click', () => activate(row));
  });
}
