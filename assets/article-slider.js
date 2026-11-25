(() => {
  const track = document.querySelector('#article-track');
  const nav = document.querySelector('.journal-navigation');
  const [previous, next] = nav.querySelectorAll('button');
  const cards = Array.from(track.children);
  const status = nav.querySelector('[role="status"]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let stops = [];
  let drag;

  function measure() {
    const origin = cards[0].getBoundingClientRect().left;
    const end = track.scrollWidth - track.clientWidth;
    stops = [...new Set(cards.map(card => Math.min(end, Math.round(card.getBoundingClientRect().left - origin))))];
    sync();
  }

  function sync() {
    previous.setAttribute('aria-disabled', track.scrollLeft <= 1);
    next.setAttribute('aria-disabled', track.scrollLeft >= stops.at(-1) - 1);
  }

  function moveTo(left) {
    track.scrollTo({left, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  }

  function step(direction) {
    const target = direction > 0
      ? stops.find(left => left > track.scrollLeft + 2)
      : stops.findLast(left => left < track.scrollLeft - 2);
    if (target !== undefined) moveTo(target);
  }

  previous.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  track.addEventListener('keydown', event => {
    if (event.target !== track || !['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
    event.preventDefault();
    step(event.key === 'ArrowRight' ? 1 : -1);
  });
  track.addEventListener('scroll', sync, { passive: true });
  track.addEventListener('scrollend', () => {
    const bounds = track.getBoundingClientRect();
    const visible = cards.filter(card => {
      const box = card.getBoundingClientRect();
      return box.left >= bounds.left - 1 && box.right <= bounds.right + 1;
    });
    if (visible.length) status.textContent = 'Showing articles ' + (cards.indexOf(visible[0]) + 1) + ' to ' + (cards.indexOf(visible.at(-1)) + 1) + ' of ' + cards.length;
  });

  // Touch and trackpad scrolling stay native. Mouse dragging follows the pointer.
  track.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('a, button')) return;
    drag = { id: event.pointerId, x: event.clientX, left: track.scrollLeft };
    track.setPointerCapture(event.pointerId);
  });
  track.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return;
    const distance = drag.x - event.clientX;
    if (Math.abs(distance) < 5 && !track.classList.contains('is-dragging')) return;
    track.classList.add('is-dragging');
    track.scrollLeft = drag.left + distance;
  });
  track.addEventListener('lostpointercapture', () => {
    if (!drag) return;
    const offset = track.scrollLeft;
    const distance = offset - drag.left;
    drag = null;
    if (!track.classList.contains('is-dragging')) return;
    const nearest = stops.reduce((best, pos) => Math.abs(pos - offset) < Math.abs(best - offset) ? pos : best);
    const target = Math.abs(distance) > 35 && Math.abs(nearest - (offset - distance)) < 2
      ? (distance > 0 ? stops.find(pos => pos > nearest) : stops.findLast(pos => pos < nearest)) : nearest;
    track.classList.remove('is-dragging');
    moveTo(target ?? nearest);
  });
  measure();
  new ResizeObserver(measure).observe(track);
  track.classList.add('is-draggable');
  nav.hidden = false;
})();
