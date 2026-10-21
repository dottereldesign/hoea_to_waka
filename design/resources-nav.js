export function setupResourcesNav(browser) {
  if (!browser) return;
  const sidebar = browser.querySelector('.resources-browser__sidebar');
  const strip = browser.querySelector('.resources-browser__nav');
  const track = browser.querySelector('.resources-browser__links');
  const links = [...track.querySelectorAll('a')];
  const sections = links.map(link => document.getElementById(link.hash.slice(1)));
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const mobile = matchMedia('(max-width:760px)');
  let current = -1, frame = 0, locked = false, releaseTimer;
  const offset = () => mobile.matches ? 76 + sidebar.offsetHeight + 24 : 120;
  function setActive(index) {
    if (index === current) return;
    current = index;
    links.forEach((link, i) => i === index ? link.setAttribute('aria-current', 'location') : link.removeAttribute('aria-current'));
    updateUnderline();
    if (mobile.matches) {
      const link = links[index];
      strip.scrollTo({left: link.offsetLeft - (strip.clientWidth - link.offsetWidth) / 2 + 22, behavior: reduced.matches ? 'instant' : 'smooth'});
    }
  }
  function updateUnderline() {
    const link = links[Math.max(current, 0)];
    track.style.setProperty('--resource-tab-left', `${link.offsetLeft}px`);
    track.style.setProperty('--resource-tab-width', `${link.offsetWidth}px`);
  }
  function sync() {
    frame = 0;
    if (locked) return;
    let index = 0;
    sections.forEach((section, i) => {if (section.getBoundingClientRect().top <= offset() + 80) index = i;});
    setActive(index);
  }
  const requestSync = () => {if (!frame) frame = requestAnimationFrame(sync);};
  const unlock = () => {locked = false;clearTimeout(releaseTimer);requestSync();};
  function resize() {
    browser.style.setProperty('--resources-scroll-offset', `${offset()}px`);
    updateUnderline();requestSync();
  }
  links.forEach((link, index) => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    locked = true;clearTimeout(releaseTimer);
    setActive(index);
    history.pushState(null, '', link.hash);
    window.scrollTo({top: sections[index].getBoundingClientRect().top + scrollY - offset(), behavior: reduced.matches ? 'instant' : 'smooth'});
    releaseTimer = setTimeout(unlock, reduced.matches ? 60 : 1400);
  }));
  window.addEventListener('scroll', requestSync, {passive:true});
  window.addEventListener('scrollend', () => {if (locked) unlock();});
  window.addEventListener('wheel', unlock, {passive:true});
  window.addEventListener('touchstart', unlock, {passive:true});
  window.addEventListener('resize', resize, {passive:true});
  window.addEventListener('hashchange', unlock);
  new ResizeObserver(resize).observe(sidebar);
  document.fonts.ready.then(resize);
  resize();sync();
}
