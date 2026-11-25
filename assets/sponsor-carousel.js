(() => {
  const section = document.querySelector('#home-sponsors');
  const track = section.querySelector('.sponsor-track');
  const repeat = track.firstElementChild.cloneNode(true);
  repeat.setAttribute('aria-hidden', 'true');
  repeat.querySelectorAll('button').forEach(button => { button.tabIndex = -1; });
  track.append(repeat);

  const motion = section.querySelector('.sponsor-motion');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  function syncMotion() {
    const manual = section.hasAttribute('data-paused') || preference.matches;
    motion.hidden = preference.matches;
    motion.textContent = manual ? '▶' : 'Ⅱ';
    motion.setAttribute('aria-label', manual ? 'Resume carousel' : 'Pause carousel');
    section.toggleAttribute('data-manual', preference.matches || track.matches(':has(:focus-visible)'));
  }
  motion.onclick = () => { section.toggleAttribute('data-paused'); syncMotion(); };
  track.addEventListener('focusin', syncMotion);
  track.addEventListener('focusout', () => requestAnimationFrame(syncMotion));
  preference.addEventListener('change', syncMotion);
  syncMotion();

  track.onclick = event => {
    const mark = event.target.closest('[data-logo]');
    if (!mark) return;
    const select = mark.getAttribute('aria-pressed') !== 'true';
    section.toggleAttribute('data-selected', select);
    track.querySelectorAll('[data-logo]').forEach(button =>
      button.setAttribute('aria-pressed', String(select && button.dataset.logo === mark.dataset.logo)));
  };
  const styles = ['Fine rule','Lilac columns','Paper cards','Coastal fade','Stitched pills','Apricot double rule','Ink gallery','Sage tiles','Offset print','Inset ribbon'];
  const controls = section.querySelector('.sponsor-styles');
  controls.querySelectorAll('button').forEach((button, index) => {
    button.onclick = () => {
      const next = (Number(section.dataset.style) - 1 + (index ? 1 : -1) + styles.length) % styles.length;
      section.dataset.style = next + 1;
      controls.querySelector('span').textContent = String(next + 1).padStart(2,'0') + ' / 10 · ' + styles[next];
    };
  });
  new IntersectionObserver(([entry]) => section.toggleAttribute('data-away', !entry.isIntersecting)).observe(section);
})();
