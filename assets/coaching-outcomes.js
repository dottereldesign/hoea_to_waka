(() => {
  const section = document.querySelector('#coaching-outcomes');
  const panel = section.querySelector('.outcome-panel');
  const entries = [...section.querySelectorAll('.outcome-number')];
  let frame = 0;

  function update() {
    frame = 0;
    if (!panel.offsetHeight) return;
    const trigger = panel.getBoundingClientRect().bottom + 24;
    const index = entries.reduce((active, entry, i) =>
      entry.getBoundingClientRect().top <= trigger ? i : active, 0);
    section.dataset.outcome = String(index);
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', schedule);
  new ResizeObserver(schedule).observe(section);
  update();
})();
