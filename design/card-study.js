export function setupCardStudy() {
  document.querySelectorAll('[data-card-study]').forEach(study => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let animations = [], active = false, frame;
    const start = () => {
      animations.forEach(animation => animation.cancel());
      animations = [];
      if (preference.matches) { study.dataset.cardState = 'complete';return; }
      const drawings = [...study.querySelectorAll('[data-bc-draw]')];
      drawings.forEach((element, index) => {
        // CSS retains the dashed safe-area line; animate its opacity instead of its dash pattern.
        const dashed = element.classList.contains('bc-safe');
        const opacity = getComputedStyle(element).opacity;
        const animation = element.animate(dashed ? [{ opacity: 0 }, { opacity }] : [
          { strokeDasharray: '1', strokeDashoffset: '1', opacity: 0 },
          { strokeDasharray: '1', strokeDashoffset: '0', opacity }
        ], { duration: 1200, delay: index * 110, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
        animation.pause();animation.currentTime = 0;animations.push(animation);
      });
      study.querySelectorAll('[data-bc-reveal]').forEach((element, index) => {
        const animation = element.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 800, delay: index === 0 ? 0 : 850 + index * 140, easing: 'ease-out', fill: 'both'
        });
        animation.pause();animation.currentTime = 0;animations.push(animation);
      });
      active = false;sync();
    };
    const sync = () => {
      frame = null;
      if (preference.matches) { study.dataset.cardState = 'complete';return; }
      const next = study.getBoundingClientRect().top < innerHeight * .82;
      if (next === active) return;
      active = next;study.dataset.cardState = active ? 'drawing' : 'reversing';
      animations.forEach(animation => {animation.updatePlaybackRate(active ? 1 : -1);animation.play();});
    };
    const requestSync = () => { if (!frame) frame = requestAnimationFrame(sync); };
    addEventListener('scroll', requestSync, { passive: true });
    addEventListener('resize', requestSync, { passive: true });
    preference.addEventListener('change', start);
    start();
  });
}
