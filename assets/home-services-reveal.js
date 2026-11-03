(() => {
  const section = document.querySelector('[data-component="home:3:services"]');
  if (!section) return;
  const cards = [...section.querySelectorAll('.ds-card')];
  const revealAll = () => {
    section.classList.remove('services-heading-reveal-pending');
    cards.forEach(card => card.classList.remove('service-card-reveal-pending'));
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    revealAll();
    return;
  }
  const headingObserver = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    headingObserver.disconnect();
    requestAnimationFrame(() => section.classList.remove('services-heading-reveal-pending'));
  }, {rootMargin:'0px 0px -10% 0px', threshold:0.05});
  headingObserver.observe(section.querySelector('.ds-section-heading'));

  let nextCardStart = 0;
  const cardObserver = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting)
      .sort((a, b) => cards.indexOf(a.target) - cards.indexOf(b.target));
    for (const entry of visible) {
      cardObserver.unobserve(entry.target);
      const start = Math.max(performance.now(), nextCardStart);
      nextCardStart = start + 1120;
      setTimeout(() => entry.target.classList.remove('service-card-reveal-pending'), Math.max(0, start - performance.now()));
    }
  }, {rootMargin:'0px 0px -8% 0px', threshold:0.08});
  cards.forEach(card => cardObserver.observe(card));
})();
