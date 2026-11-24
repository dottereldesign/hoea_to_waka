(() => {
  const section = document.querySelector('#workshop-support');
  const cards = [...section.querySelectorAll('.workshop-slide')];
  const dots = [...section.querySelectorAll('[data-slide]')];
  const slides = section.querySelector('.workshop-slides');
  let drag = null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let paused = reduced.matches;
  let visible = false;
  let timer;

  function schedule() {
    clearTimeout(timer);
    if (!paused && !drag && visible && !document.hidden && !section.matches(':hover')) {
      timer = setTimeout(() => show(index + 1, 1), 6000);
    }
  }

  function show(target, direction, offset = 0) {
    const previous = index;
    index = (target + cards.length) % cards.length;
    cards.forEach((card, i) => {
      card.getAnimations().forEach(animation => animation.cancel());
      card.classList.toggle('is-active', i === index);
      card.setAttribute('aria-hidden', String(i !== index));
      dots[i].setAttribute('aria-current', String(i === index));
    });
    if (previous !== index && !reduced.matches) {
      const timing = {duration: 720 * (1 - Math.min(1, Math.abs(offset) / 100)), easing: 'cubic-bezier(.45,0,.2,1)'};
      const position = x => ({transform: 'translateX(' + x + '%)', visibility: 'visible'});
      cards[previous].animate([position(offset), position(-direction * 100)], timing);
      cards[index].animate([position(direction * 100 + offset), position(0)], timing);
    }
    section.dispatchEvent(new CustomEvent('workshop:slidechange', {detail:{index, changed:previous !== index}}));
    schedule();
  }

  function navigate(target, direction) {
    paused = true;
    show(target, direction);
  }

  section.querySelector('.workshop-prev').onclick = () => navigate(index - 1, -1);
  section.querySelector('.workshop-next').onclick = () => navigate(index + 1, 1);
  dots.forEach((dot, i) => dot.onclick = () => navigate(i, i < index ? -1 : 1));
  function clearPreview() {
    for (const card of cards) {
      card.style.removeProperty('transform');
      card.style.removeProperty('visibility');
    }
  }

  slides.addEventListener('dragstart', event => event.preventDefault());
  slides.addEventListener('pointerdown', event => {
    if (drag || !event.isPrimary || event.button !== 0) return;
    drag = {id: event.pointerId, x: event.clientX, y: event.clientY, offset: 0};
    slides.setPointerCapture(event.pointerId);
    clearTimeout(timer);
  });

  slides.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!slides.hasAttribute('data-dragging')) {
      if (Math.abs(dx) < 6 || Math.abs(dx) <= Math.abs(dy)) return;
      slides.setAttribute('data-dragging', '');
      cards.forEach(card => card.getAnimations().forEach(animation => animation.cancel()));
    }
    const offset = Math.max(-100, Math.min(100, dx / slides.clientWidth * 100));
    drag.offset = offset;
    const direction = dx < 0 ? 1 : -1;
    const neighbour = cards[(index + direction + cards.length) % cards.length];
    clearPreview();
    cards[index].style.transform = 'translateX(' + offset + '%)';
    neighbour.style.visibility = 'visible';
    neighbour.style.transform = 'translateX(' + (direction * 100 + offset) + '%)';
  });

  function finishDrag(event) {
    if (drag?.id !== event.pointerId) return;
    const {offset} = drag;
    drag = null;
    slides.removeAttribute('data-dragging');
    clearPreview();
    if (event.type === 'pointerup' && Math.abs(offset) * slides.clientWidth / 100 >= Math.min(48, slides.clientWidth * .15)) {
      const direction = offset < 0 ? 1 : -1;
      paused = true;
      show(index + direction, direction, offset);
    } else {
      if (offset && !reduced.matches) {
        cards[index].animate([{transform: 'translateX(' + offset + '%)'}, {transform: 'none'}], {duration: 180, easing: 'ease-out'});
      }
      schedule();
    }
  }

  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    slides.addEventListener(event, finishDrag);
  }
  section.addEventListener('focusin', event => {
    if (!section.contains(event.relatedTarget) && event.target.matches(':focus-visible')) {
      paused = true;
      schedule();
    }
  });
  section.addEventListener('mouseenter', schedule);
  section.addEventListener('mouseleave', schedule);
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => { paused = reduced.matches; schedule(); });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }, {threshold: 0.15}).observe(section.querySelector('.workshop-slides'));
  section.querySelectorAll('[hidden]').forEach(element => { element.hidden = false; });
  section.dataset.ready = '';
  show(0, 1);
})();
