(() => {
  const section = document.querySelector('#workshop-support');
  const cards = [...section.querySelectorAll('.workshop-slide')];
  const dots = [...section.querySelectorAll('[data-slide]')];
  const play = section.querySelector('.workshop-play');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let paused = reduced.matches;
  let visible = false;
  let timer;

  function schedule() {
    clearTimeout(timer);
    play.textContent = paused ? 'Play' : 'Pause';
    play.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
    if (!paused && visible && !document.hidden && !section.matches(':hover')) {
      timer = setTimeout(() => show(index + 1, 1), 6000);
    }
  }

  function show(target, direction) {
    const previous = index;
    index = (target + cards.length) % cards.length;
    cards.forEach((card, i) => {
      card.getAnimations().forEach(animation => animation.cancel());
      card.classList.toggle('is-active', i === index);
      card.setAttribute('aria-hidden', String(i !== index));
      dots[i].setAttribute('aria-current', String(i === index));
    });
    if (previous !== index && !reduced.matches) {
      const timing = {duration: 720, easing: 'cubic-bezier(.45,0,.2,1)'};
      const position = x => ({transform: 'translateX(' + x + '%)', visibility: 'visible'});
      cards[previous].animate([position(0), position(-direction * 100)], timing);
      cards[index].animate([position(direction * 100), position(0)], timing);
    }
    schedule();
  }

  function navigate(target, direction) {
    paused = true;
    show(target, direction);
  }

  section.querySelector('.workshop-prev').onclick = () => navigate(index - 1, -1);
  section.querySelector('.workshop-next').onclick = () => navigate(index + 1, 1);
  dots.forEach((dot, i) => dot.onclick = () => navigate(i, i < index ? -1 : 1));
  play.onclick = () => { paused = !paused; schedule(); };
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
