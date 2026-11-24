(() => {
  const section = document.querySelector('[data-component="home:4:features"]');
  if (!section) return;
  const reveal = () => section.classList.remove('model-section-reveal-pending');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    reveal();
    return;
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) reveal();
      else if (entry.boundingClientRect.top >= entry.rootBounds.bottom) {
        section.classList.add('model-section-reveal-pending');
      }
    }
  }, {rootMargin:'0px 0px -12% 0px', threshold:0});
  observer.observe(section);
})();
