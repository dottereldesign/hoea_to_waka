(() => {
  const gallery = document.querySelector('.home-hero-gallery');
  if (!gallery) return;
  const root = document.documentElement;
  const header = document.querySelector('[data-header-entrance]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let started = false;
  function reveal() {
    if (started) return;
    started = true;
    requestAnimationFrame(() => gallery.classList.remove('gallery-motion-pending'));
  }
  if (reduced.matches) { reveal(); return; }
  document.addEventListener('header-entrance-finished', reveal, {once:true});
  if (!root.classList.contains('header-entrance-pending') && header?.dataset.entranceState !== 'playing') reveal();
  // Keep the images visible if a browser does not complete the header entrance.
  setTimeout(reveal, 2500);
})();
