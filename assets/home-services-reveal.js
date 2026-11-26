(() => {
  const section = document.querySelector('[data-component="home:3:services"]');
  if (!section) return;
  const grid = section.querySelector('.ds-service-editorial');
  const cards = [...grid.querySelectorAll('.ds-card')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  section.classList.remove('services-heading-reveal-pending');
  cards.forEach(card => card.classList.remove('service-card-reveal-pending'));
  let frame = 0, columns = false, near = false;
  const update = () => {
    frame = 0;
    const top = columns && !reduced.matches ? grid.getBoundingClientRect().top : 0;
    const progress = reduced.matches || !columns ? 1 : Math.max(0, Math.min(1, (innerHeight * .9 - top) / (innerHeight * .6)));
    const eased = progress * progress * (3 - 2 * progress);
    grid.style.setProperty('--services-step', `${104 * (1 - eased)}px`);
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const refresh = () => {
    columns = cards.length > 1 && Math.abs(cards[1].offsetLeft - cards[0].offsetLeft) > 10;
    grid.classList.toggle('services-leveling', columns);
    if (near && columns && !reduced.matches) window.addEventListener('scroll', schedule, {passive:true});
    else window.removeEventListener('scroll', schedule);
    schedule();
  };
  new IntersectionObserver(([entry]) => {
    near = entry.isIntersecting;
    refresh();
  }, {rootMargin:'150px 0px'}).observe(grid);
  new ResizeObserver(refresh).observe(grid);
  window.addEventListener('resize', refresh);
  window.addEventListener('pageshow', refresh);
  reduced.addEventListener('change', refresh);
})();
