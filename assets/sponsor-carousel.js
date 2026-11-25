(() => {
  const section = document.querySelector('#home-sponsors');
  const track = section.querySelector('.sponsor-track');
  const repeat = track.firstElementChild.cloneNode(true);
  repeat.setAttribute('aria-hidden', 'true');

  track.append(repeat);

  new IntersectionObserver(([entry]) => section.toggleAttribute('data-away', !entry.isIntersecting)).observe(section);
})();