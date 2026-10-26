export function setupCardStudy() {
  document.querySelectorAll('[data-card-study]').forEach(study => {
    const initialise=()=>{
    if(study.dataset.cardBound)return;
    study.dataset.cardBound='true';
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let animations = [], active = false, frame;
    const start = () => {
      animations.forEach(animation => animation.cancel());
      animations = [];
      if (preference.matches) { study.dataset.cardState = 'complete';return; }
      // Read styles together before creating animations to avoid repeated layout work.
      const opacities = new Map([...study.querySelectorAll('[data-bc-draw], [data-bc-pencil]')]
        .map(element => [element, getComputedStyle(element).opacity]));
      const drawings = [...study.querySelectorAll('[data-bc-draw]')];
      drawings.forEach((element, index) => {
        // CSS retains the dashed safe-area line; animate its opacity instead of its dash pattern.
        const dashed = element.classList.contains('bc-safe');
        const opacity = opacities.get(element);
        const animation = element.animate(dashed ? [{ opacity: 0 }, { opacity }] : [
          { strokeDasharray: '1', strokeDashoffset: '1', opacity: 0 },
          { strokeDasharray: '1', strokeDashoffset: '0', opacity }
        ], { duration: 1200, delay: index * 110, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
        animation.pause();animation.currentTime = 0;animations.push(animation);
      });
      // Trace contours and shade with actual pencil strokes, on the same reversible clock.
      study.querySelectorAll('[data-bc-pencil]').forEach(element => {
        const opacity = opacities.get(element);
        const animation = element.animate([
          { strokeDasharray: '1', strokeDashoffset: '1', opacity: 0 },
          { strokeDasharray: '1', strokeDashoffset: '0', opacity }
        ], {
          duration: Number(element.dataset.pencilDuration), delay: Number(element.dataset.pencilDelay),
          easing: element.dataset.pencilPass === 'shade' ? 'linear' : 'cubic-bezier(.37,0,.63,1)', fill: 'both'
        });
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
    };
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    if(preference.matches)initialise();
    else{
      const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();initialise();}},{rootMargin:'800px 0px'});
      observer.observe(study);
      preference.addEventListener('change',()=>{if(preference.matches){observer.disconnect();initialise();}},{once:true});
    }
  });
}
