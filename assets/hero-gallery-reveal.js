(() => {
  const gallery = document.querySelector('.home-hero-gallery');
  const copy = document.querySelector('.home-hero-copy');
  // The current illustration hero has copy but no legacy gallery.
  if (!gallery && !copy) return;
  const root = document.documentElement;
  const header = document.querySelector('[data-header-entrance]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let started = false;
  function reveal() {
    if (started) return;
    started = true;
    requestAnimationFrame(() => {
      gallery?.classList.remove('gallery-motion-pending');
      copy?.classList.remove('home-hero-motion-pending');
    });
  }
  if (reduced.matches) { reveal(); return; }
  document.addEventListener('header-entrance-started', reveal, {once:true});
  document.addEventListener('header-entrance-finished', reveal, {once:true});
  if (header?.dataset.entranceState === 'playing' || !root.classList.contains('header-entrance-pending')) reveal();
  // Keep the images visible if a browser does not complete the header entrance.
  setTimeout(reveal, 2500);
})();
