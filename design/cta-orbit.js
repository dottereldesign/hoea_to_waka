export function setupCtaOrbit(section, paused = false) {
  const orbit = section.querySelector('[data-cta-orbit]');
  const button = section.querySelector('[data-orbit-pause]');
  if (!orbit || !button) return () => {};
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false, userPaused = false;
  const sync = () => {
    section.classList.toggle('is-orbit-running', active && !paused && !userPaused && !preference.matches && !document.hidden);
    button.hidden = paused || preference.matches;
  };
  const observer = new IntersectionObserver(entries => {
    active = entries.some(entry => entry.isIntersecting);
    sync();
  }, { rootMargin: '100px' });
  const toggle = () => {
    userPaused = !userPaused;
    button.textContent = userPaused ? 'Resume images' : 'Pause images';
    button.setAttribute('aria-pressed', String(userPaused));
    sync();
  };
  observer.observe(section);
  button.addEventListener('click', toggle);
  preference.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  sync();
  return () => {
    observer.disconnect();
    button.removeEventListener('click', toggle);
    preference.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
  };
}
