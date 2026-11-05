(() => {
  const section = document.querySelector('[data-component="home:3:services"]');
  if (!section) return;
  const grid = section.querySelector('.ds-service-editorial');
  const cards = [...grid.querySelectorAll('.ds-card')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  section.classList.remove('services-heading-reveal-pending');
  cards.forEach(card => card.classList.remove('service-card-reveal-pending'));
  let frame = 0;
  const update = () => {
    frame = 0;
    // Use the rendered columns so the behaviour follows both pages' breakpoints.
    const columns = cards.length > 1 && Math.abs(cards[1].offsetLeft - cards[0].offsetLeft) > 10;
    grid.classList.toggle('services-leveling', columns);
    const top = grid.getBoundingClientRect().top;
    const progress = reduced.matches || !columns ? 1 : Math.max(0, Math.min(1, (innerHeight * .9 - top) / (innerHeight * .6)));
    const eased = progress * progress * (3 - 2 * progress);
    grid.style.setProperty('--services-step', `${52 * (1 - eased)}px`);
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  reduced.addEventListener('change', schedule);
  new ResizeObserver(schedule).observe(section);
  document.fonts?.ready.then(schedule);
  update();
})();
