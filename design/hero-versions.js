export function setupHeroVersions() {
  const hero = document.querySelector('.page-home .home-hero[data-hero-version]');
  if (!hero) return;
  const controls = hero.querySelector('.hero-version-controls');
  if (!controls || controls.dataset.bound) return;
  controls.dataset.bound = 'true';
  controls.hidden = false;
  controls.addEventListener('click', event => {
    const choice = event.target.closest('[data-hero-choice]');
    if (!choice) return;
    const version = choice.dataset.heroChoice;
    if (!['01', '02'].includes(version)) return;
    hero.dataset.heroVersion = version;
    controls.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button === choice)));
    controls.querySelector('.hero-version-status').textContent = 'Hero version ' + version + ': ' + (version === '01' ? 'solid background' : 'original photo hero');
  });
}
