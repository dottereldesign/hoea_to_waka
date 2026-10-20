export function setupFooterVersions() {
  document.querySelectorAll('.site-footer[data-footer-version]').forEach(footer => {
    const controls = footer.querySelector('.footer-version-controls');
    if (!controls || controls.dataset.bound) return;
    controls.dataset.bound = 'true';
    let fade;
    controls.addEventListener('click', event => {
      const button = event.target.closest('[data-footer-choice]');
      if (!button || button.getAttribute('aria-pressed') === 'true') return;
      const version = button.dataset.footerChoice;
      if (!['01', '02', '03', '04'].includes(version)) return;
      footer.dataset.footerVersion = version;
      controls.querySelectorAll('button').forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
      controls.querySelector('[role="status"]').textContent = 'Footer ' + version + ': ' + button.title;
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        fade?.cancel();
        fade = footer.querySelector('.footer-grid').animate([{ opacity:.45 }, { opacity:1 }], { duration:260, easing:'ease-out' });
      }
    });
  });
}
