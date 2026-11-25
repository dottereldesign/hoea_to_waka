(() => {
  const section = document.querySelector('#home-sponsors');
  const track = section.querySelector('.sponsor-track');
  const repeat = track.firstElementChild.cloneNode(true);
  repeat.setAttribute('aria-hidden', 'true');

  track.append(repeat);

  const motion = section.querySelector('.sponsor-motion');
  motion.addEventListener('click', () => {
    const paused = section.toggleAttribute('data-paused');
    motion.textContent = paused ? '▶' : 'Ⅱ';
    motion.setAttribute('aria-label', paused ? 'Resume carousel' : 'Pause carousel');
  });
  new IntersectionObserver(([entry]) => section.toggleAttribute('data-away', !entry.isIntersecting)).observe(section);
})();