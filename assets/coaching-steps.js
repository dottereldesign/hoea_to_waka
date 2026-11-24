const coachingSteps = document.querySelector('.coaching-steps');

function enableCoachingMotion(section) {
  const steps = [...section.querySelectorAll('li')];
  const list = section.querySelector('ol');
  const stagger = 760;
  const total = (steps.length - 1) * stagger + 420;
  const animations = [];
  let previousY = window.scrollY;
  let direction = 0;

  function addAnimation(element, frames, delay, duration, easing) {
    // A common end time keeps the connectors and icons in sequence on reversal.
    const animation = element.animate(frames, {
      delay, duration, easing, endDelay: total - delay - duration, fill: 'both'
    });
    animation.pause();
    animation.currentTime = 0;
    animations.push(animation);
  }

  steps.forEach((step, index) => {
    const delay = index * stagger;
    addAnimation(step.querySelector('.step-icon'), [
      { opacity: 0, transform: 'translateY(6px) scale(.91)' },
      { opacity: 1, transform: 'none' }
    ], delay, 420, 'ease-out');
    const connector = step.querySelector('.step-connector');
    if (connector) {
      addAnimation(connector, [
        { clipPath: 'var(--start-clip, inset(0 100% 0 0))' },
        { clipPath: 'inset(0)' }
      ], delay + 260, 500, 'ease-in-out');
    }
  });

  function play(nextDirection) {
    if (direction === nextDirection) return;
    direction = nextDirection;
    for (const animation of animations) {
      animation.playbackRate = direction;
      animation.play();
    }
  }

  function update() {
    const y = window.scrollY;
    const bounds = list.getBoundingClientRect();
    const entryLine = window.innerHeight - steps[0].querySelector('.step-icon').offsetHeight * .7;
    if (bounds.bottom <= 0) {
      play(1);
    } else if (bounds.top > entryLine) {
      if (direction === 1) play(-1);
    } else if (y !== previousY || direction === 0) {
      play(y < previousY ? -1 : 1);
    }
    previousY = y;
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  return () => {
    window.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
    animations.forEach(animation => animation.cancel());
  };
}

if (coachingSteps && typeof Element.prototype.animate === 'function') {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let stopMotion;
  function syncMotion() {
    stopMotion?.();
    stopMotion = preference.matches ? null : enableCoachingMotion(coachingSteps);
  }
  syncMotion();
  preference.addEventListener('change', syncMotion);
}
