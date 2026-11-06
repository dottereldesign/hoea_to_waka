/* A single scroll-driven leap: retraces naturally when scrolling upwards. */
(() => {
  const carousel = document.querySelector('[data-testimonial-autoplay]');
  if (!carousel) return;
  const marks = [...carousel.querySelectorAll('.testimonial-quote-mark')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let animations = [], frame = 0;
  function update() {
    frame = 0;
    if (!animations.length) return;
    const progress = Math.max(0, Math.min(1,
      (innerHeight * .96 - carousel.getBoundingClientRect().top) / (innerHeight * .52)));
    animations.forEach(animation => { animation.currentTime = progress * 1000; });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  function setup() {
    animations.forEach(animation => animation.cancel());
    animations = [];
    if (reduced.matches) return;
    const distance = Math.min(110, innerWidth * .15);
    const pose = (x, y, angle, sx = 1, sy = 1) =>
      `translateY(-91.6667%) translate(${x}px, ${y}px) rotate(${angle}deg) scale(${sx}, ${sy})`;
    animations = marks.map(mark => {
      mark.style.transformOrigin = '50% 90%';
      const animation = mark.animate([
        {offset:0, transform:pose(-distance,38,-12), opacity:0, easing:'cubic-bezier(.2,.65,.35,1)'},
        {offset:.16, transform:pose(-distance*.8,-20,-10), opacity:1, easing:'cubic-bezier(.2,.65,.45,1)'},
        {offset:.43, transform:pose(-distance*.4,-65,-4), opacity:1, easing:'cubic-bezier(.55,0,.8,.4)'},
        {offset:.73, transform:pose(0,2,5,1.035,.965), opacity:1, easing:'cubic-bezier(.2,.7,.3,1)'},
        {offset:.85, transform:pose(2,-5,-2), opacity:1, easing:'ease-in-out'},
        {offset:1, transform:pose(0,0,0), opacity:1}
      ], {duration:1000, fill:'both'});
      animation.pause();
      return animation;
    });
    update();
  }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', setup);
  reduced.addEventListener('change', setup);
  new ResizeObserver(schedule).observe(carousel);
  setup();
})();
