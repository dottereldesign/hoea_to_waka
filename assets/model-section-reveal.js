(() => {
  const section = document.querySelector('[data-component="home:4:features"]');
  if (!section) return;
  const reveal = () => section.classList.remove('model-section-reveal-pending');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    reveal();
    return;
  }
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    requestAnimationFrame(reveal);
  }, {rootMargin:'0px 0px -12% 0px', threshold:0.12});
  observer.observe(section);
})();
