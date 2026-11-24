(() => {
  const art = document.querySelector('[data-youth-arrival]');
  if (!art) return;
  const milestone = art.closest('.anna-milestone');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let animations = [];
  let wasReached = false;
  const sync = () => {
    const reached = milestone.classList.contains('river-node-hit');
    if (reached === wasReached) return;
    wasReached = reached;
    for (const animation of animations) {
      animation.playbackRate = reached ? 1 : -1;
      if ((reached && animation.currentTime < animation.effect.getComputedTiming().endTime) ||
          (!reached && animation.currentTime > 0)) {
        animation.play();
      } else {
        animation.pause();
      }
    }
  };
  const build = () => {
    animations.forEach(animation => animation.cancel());
    animations = [];
    wasReached = false;
    if (reduced.matches) return;
    const steps = [
      ['warm-backdrop', 'scale(.94)', 0, 1000],
      ['garden', 'translateY(28px)', 100, 850],
      ['left-person', 'translateY(34px)', 260, 850],
      ['young-person', 'translateY(34px)', 420, 850],
      ['speech-bubbles', 'translateY(22px)', 700, 850],
      ['floating-pieces', 'scale(.9)', 1000, 850]
    ];
    const sequenceEnd = Math.max(...steps.map(([, , delay, duration]) => delay + duration));
    steps.forEach(([id, transform, delay, duration]) => {
      const element = art.querySelector('#ay-' + id);
      element.style.transformBox = 'fill-box';
      element.style.transformOrigin = 'center';
      const animation = element.animate([
        { opacity: 0, transform },
        { opacity: 1, transform: 'none' }
      ], { duration, delay, endDelay: sequenceEnd - delay - duration, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
      animation.pause();
      animation.currentTime = 0;
      animations.push(animation);
    });
    sync();
  };
  new MutationObserver(sync).observe(milestone, { attributes: true, attributeFilter: ['class'] });
  reduced.addEventListener('change', build);
  build();
})();
