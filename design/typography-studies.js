export function setupTypographyStudies() {
  const study = document.querySelector('[data-type-study]');
  if (!study) return;
  const controls = study.querySelector('.bt-switcher');
  const panels = [...study.querySelectorAll('[data-type-panel]')];
  let fade;
  controls.hidden = false;
  controls.addEventListener('click', event => {
    const button = event.target.closest('[data-type-choice]');
    if (!button || button.getAttribute('aria-pressed') === 'true') return;
    const panel = panels.find(panel => panel.dataset.typePanel === button.dataset.typeChoice);
    if (!panel) return;
    // Preserve the reader's position when the alternative is taller or shorter.
    const oldTop = controls.getBoundingClientRect().top;
    fade?.cancel();
    panels.forEach(item => { item.hidden = item !== panel; });
    controls.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    controls.querySelector('[role="status"]').textContent = button.getAttribute('aria-label');
    const shift = controls.getBoundingClientRect().top - oldTop;
    window.scrollBy({ top: shift, behavior: 'instant' });
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fade = panel.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
    }
  });
}
