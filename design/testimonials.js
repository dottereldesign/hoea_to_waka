// Allow 200 words per minute plus settling time; rotate only while in view.
export function setupTestimonials(carousel) {
  const slides = [...carousel.querySelectorAll('figure')];
  const pause = carousel.querySelector('[data-testimonial-pause]');
  if (slides.length < 2 || !pause) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const status = carousel.querySelector('[aria-live]');
  let index = 0, paused = preference.matches, visible = false, hovered = false, focused = false;
  let timer = 0, deadline = 0, transitions = [], generation = 0;
  const readingTime = () => Math.max(9000, slides[index].querySelector('blockquote').textContent.trim().split(/\s+/).length * 300 + 3000);
  let remaining = readingTime();
  const running = () => !paused && visible && !document.hidden && !hovered && !focused;
  function stopTimer() {
    if (!timer) return;
    clearTimeout(timer);timer = 0;
    remaining = Math.max(0, deadline - performance.now());
  }
  function schedule() {
    stopTimer();
    if (!running()) return;
    deadline = performance.now() + remaining;
    timer = setTimeout(() => {timer = 0;move(1, false);}, remaining);
  }
  function updatePause() {
    pause.setAttribute('aria-pressed', String(paused));
    pause.setAttribute('aria-label', paused ? 'Resume testimonials' : 'Pause testimonials');
    pause.title = paused ? 'Resume testimonials' : 'Pause testimonials';
    pause.querySelector('[data-pause-icon]').toggleAttribute('hidden', paused);
    pause.querySelector('[data-play-icon]').toggleAttribute('hidden', !paused);
    // Avoid announcements on every automatic change; manual navigation remains announced.
    if (status) status.setAttribute('aria-live', paused ? 'polite' : 'off');
  }
  function move(direction, manual) {
    stopTimer();
    const token = ++generation;
    transitions.forEach(animation => animation.cancel());transitions = [];
    slides.forEach(slide => slide.classList.remove('is-leaving'));
    const outgoing = slides[index];
    index = (index + direction + slides.length) % slides.length;
    const incoming = slides[index];
    slides.forEach((slide, i) => {slide.hidden = i !== index;slide.setAttribute('aria-hidden', String(i !== index));});
    if (!preference.matches) {
      outgoing.classList.add('is-leaving');
      const options = {duration:650, easing:'cubic-bezier(.22,1,.36,1)'};
      transitions = [outgoing.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-4px)'}],options),incoming.animate([{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],options)];
      Promise.all(transitions.map(animation => animation.finished)).then(() => {if (generation === token) outgoing.classList.remove('is-leaving');}).catch(() => {});
    }
    if (status) {status.setAttribute('aria-live', manual ? 'polite' : 'off');status.textContent = `${index + 1} / ${slides.length}`;}
    remaining = readingTime();schedule();
  }
  pause.hidden = false;carousel.classList.add('is-carousel-ready');updatePause();
  pause.addEventListener('click', () => {paused = !paused;updatePause();schedule();});
  carousel.querySelector('[data-next]')?.addEventListener('click', () => move(1, true));
  carousel.querySelector('[data-prev]')?.addEventListener('click', () => move(-1, true));
  carousel.addEventListener('pointerenter', event => {if (event.pointerType === 'mouse') {hovered = true;schedule();}});
  carousel.addEventListener('pointerleave', () => {hovered = false;schedule();});
  carousel.addEventListener('focusin', () => {focused = true;schedule();});
  carousel.addEventListener('focusout', event => {if (!carousel.contains(event.relatedTarget)) {focused = false;schedule();}});
  document.addEventListener('visibilitychange', schedule);
  preference.addEventListener('change', () => {if (preference.matches) {paused = true;transitions.forEach(animation => animation.cancel());slides.forEach(slide => slide.classList.remove('is-leaving'));updatePause();schedule();}});
  new IntersectionObserver(entries => {visible = entries[0].isIntersecting;schedule();}, {threshold:.2}).observe(carousel);
}
