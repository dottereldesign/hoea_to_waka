export function setupCtaOrbit(section, paused = false) {
  const orbit = section.querySelector('[data-cta-orbit]');
  if (!orbit) return () => {};
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false, menuBlocked = false;
  const sync = () => {
    section.classList.toggle('is-orbit-running', active && !paused && !preference.matches && !document.hidden && !menuBlocked);
  };
  const observer = new IntersectionObserver(entries => {
    active = entries.some(entry => entry.isIntersecting);
    sync();
  }, { rootMargin: '100px' });
  observer.observe(section);
  preference.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  const menu = event => {menuBlocked = event.detail.open;sync();};
  document.addEventListener('hoea:site-menu', menu);
  sync();
  return () => {
    observer.disconnect();
    preference.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
    document.removeEventListener('hoea:site-menu', menu);
  };
}
