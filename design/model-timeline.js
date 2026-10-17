import { animate } from 'motion';

export function setupModelTimeline(section, paused = false) {
  const path = section.querySelector('.ds-path-line');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  if (!path || paused || preference.matches) return () => {};
  const items = [...path.querySelectorAll('article')];
  let started = false, disposed = false, observer;
  const animations = [];
  path.classList.add('model-timeline');

  function finish() {
    path.classList.add('is-timeline-complete');
    items.forEach(item => {
      item.style.setProperty('--timeline-line', '1');
      item.querySelectorAll('i,.ds-number,h3,p').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    });
  }
  function reveal() {
    if (started || disposed) return;
    started = true;
    observer?.disconnect();
    path.dataset.timelineStarted = 'true';
    items.forEach((item, i) => {
      const start = i * 1.2;
      const icon = item.querySelector('i');
      animations.push(animate(icon, { opacity: [0, 1], scale: [.65, 1] }, {
        type: 'spring', stiffness: 200, damping: 20, mass: .9, delay: start,
      }));
      [['.ds-number', .16, .32], ['h3', .25, .5], ['p', .34, .5]].forEach(([selector, delay, duration]) => {
        animations.push(animate(item.querySelector(selector), { opacity: [0, 1], y: [10, 0] }, {
          duration, delay: start + delay, ease: [.22, 1, .36, 1],
        }));
      });
      // The line reaches the next icon just as that icon begins to appear.
      animations.push(animate(0, 1, {
        duration: .42, delay: start + .78, ease: [.45, 0, .2, 1],
        onUpdate: value => item.style.setProperty('--timeline-line', value.toFixed(4)),
        onComplete: () => { if (i === items.length - 1 && !disposed) finish(); },
      }));
    });
  }
  function watch() {
    observer?.disconnect();
    if (started || disposed) return;
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) reveal();
    }, { rootMargin: `0px 0px -${Math.round(innerHeight * .22)}px 0px` });
    observer.observe(path);
  }
  function onPreference() {
    if (!preference.matches) return;
    started = true;
    observer?.disconnect();
    animations.forEach(animation => animation.stop());
    finish();
  }
  watch();
  window.addEventListener('resize', watch, { passive: true });
  preference.addEventListener('change', onPreference);
  return () => {
    disposed = true;
    observer?.disconnect();
    animations.forEach(animation => animation.stop());
    window.removeEventListener('resize', watch);
    preference.removeEventListener('change', onPreference);
  };
}
