(() => {
  const root = document.documentElement;
  const stage = document.querySelector('.home-hero-stage');
  if (!stage) return;
  const controls = stage.querySelector('.hero-variation-switch');
  const status = stage.querySelector('.hero-variation-status');
  const key = 'hoea-home-hero-choice-v2';
  const choices = ['01', '02', '03'];

  function select(value, save = false) {
    const version = choices.includes(value) ? value : '03';
    root.dataset.homeHero = version;
    // Keep the legacy hero skin at 01; its other values belong to retired
    // experiments. The root attribute controls these three new choices.
    for (const button of controls.querySelectorAll('button')) {
      button.setAttribute('aria-pressed', String(button.dataset.heroChoice === version));
    }
    if (save) {
      try { localStorage.setItem(key, version); } catch { /* Switching still works without storage. */ }
      status.textContent = `Hero ${version} selected`;
    }
  }

  controls.addEventListener('click', event => {
    const button = event.target.closest('button[data-hero-choice]');
    if (button) select(button.dataset.heroChoice, true);
  });
  // Synchronise another open homepage without moving keyboard focus.
  window.addEventListener('storage', event => {
    if (event.key === key) select(event.newValue);
  });
  select(root.dataset.homeHero);
  controls.hidden = false;
})();
