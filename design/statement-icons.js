import { createElement, Sprout, Building2, HandHeart } from 'lucide';
import { animate } from 'motion';

const illustrations = new Map([
  ['Resilience', Sprout], ['Aotearoa’s', 'kiwi'], ['workplaces,', Building2],
  ['professionals.', HandHeart],
]);

function kiwiIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 32 32');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.dataset.icon = 'kiwi';
  svg.innerHTML = '<path d="M18 11C19 7 23 6 25 8C28 10 26 13 23 13L20 15C18 22 9 24 5 20C1 17 3 11 8 10C12 8 16 9 18 11Z"/><path d="m26 11 5 12M10 22l-1 6H6m10-6 1 6h3"/><circle cx="23" cy="9.5" r=".7" fill="currentColor" stroke="none"/>';
  return svg;
}

export function setupStatementIcons(section, paused = false) {
  const copy = 'Resilience training set in Aotearoa’s unique cultural context, made practical for workplaces, leaders, and support professionals.';
  const heading = [...section.querySelectorAll('h2,p')].find(el =>
    (el.getAttribute('aria-label') || el.textContent).replace(/\s+/g, ' ').trim() === copy);
  if (!heading) { section.classList.add('statement-icons-ready'); return () => {}; }
  heading.removeAttribute('data-text-motion');
  heading.classList.add('statement-icon-copy');
  heading.setAttribute('aria-label', copy);
  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');
  const icons = [];
  const words = copy.split(' ').map(text => {
    const word = document.createElement('span');
    word.className = 'statement-icon-word';
    word.textContent = text;
    if (illustrations.has(text)) {
      const slot = document.createElement('span');
      slot.className = 'statement-icon';
      slot.style.setProperty('--icon-reveal', '0');
      slot.dataset.statementIcon = text.replace(/[,.]/g, '');
      const illustration = illustrations.get(text);
      const svg = illustration === 'kiwi' ? kiwiIcon() : createElement(illustration);
      svg.setAttribute('stroke-width', '1.5');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      slot.append(svg);
      word.append(slot);
      icons.push(slot);
    }
    return word;
  });
  heading.replaceChildren(visual);
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let layoutFrame = 0, disposed = false, started = false, entranceObserver;
  const animations = [];
  let width = heading.clientWidth;

  function revealImmediately() {
    started = true;
    entranceObserver?.disconnect();
    animations.forEach(animation => animation.stop());
    icons.forEach(icon => icon.style.setProperty('--icon-reveal', '1'));
    section.dataset.statementRevealed = 'true';
  }
  function reveal() {
    if (started || disposed) return;
    started = true;
    entranceObserver?.disconnect();
    section.dataset.statementRevealed = 'true';
    // A short stagger and gently underdamped spring finish on their own;
    // scroll position never drives an icon's size or reverses its animation.
    icons.forEach((icon, i) => {
      animations.push(animate(0, 1, {
        type: 'spring', stiffness: 180, damping: 18, mass: .8, delay: i * .065,
        onUpdate: value => icon.style.setProperty('--icon-reveal', value.toFixed(4)),
        onComplete: () => icon.style.setProperty('--icon-reveal', '1'),
      }));
    });
  }
  function watchEntrance() {
    entranceObserver?.disconnect();
    if (started || disposed) return;
    entranceObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) reveal();
    }, { rootMargin: `0px 0px -${Math.round(innerHeight * .35)}px 0px` });
    entranceObserver.observe(heading);
  }
  function layout() {
    layoutFrame = 0;
    if (disposed) return;
    // Measure at full icon width, then keep each resulting line together while
    // icons expand. This lets words move apart without jumping between lines.
    heading.classList.add('is-measuring-icons');
    visual.replaceChildren();
    words.forEach((word, i) => { if (i) visual.append(' '); visual.append(word); });
    const lines = [];
    words.forEach(word => {
      const top = word.offsetTop;
      if (!lines.length || Math.abs(top - lines.at(-1).top) > 2) lines.push({ top, words: [] });
      lines.at(-1).words.push(word);
    });
    const rows = lines.map(line => {
      const row = document.createElement('span');
      row.className = 'statement-icon-line';
      line.words.forEach((word, i) => { if (i) row.append(' '); row.append(word); });
      return row;
    });
    visual.replaceChildren(...rows);
    heading.classList.remove('is-measuring-icons');
  }
  const observer = new ResizeObserver(() => {
    if (heading.clientWidth === width) return;
    width = heading.clientWidth;
    if (!layoutFrame) layoutFrame = requestAnimationFrame(layout);
  });
  layout();
  observer.observe(heading);
  document.fonts.ready.then(() => {
    if (disposed) return;
    layout();
    section.classList.add('statement-icons-ready');
    if (!paused && !preference.matches) watchEntrance();
  });
  const onPreferenceChange = () => { if (preference.matches) revealImmediately(); };
  if (paused || preference.matches) revealImmediately();

  window.addEventListener('resize', watchEntrance, { passive: true });
  preference.addEventListener('change', onPreferenceChange);
  return () => {
    disposed = true;
    observer.disconnect();
    entranceObserver?.disconnect();
    animations.forEach(animation => animation.stop());
    cancelAnimationFrame(layoutFrame);
    window.removeEventListener('resize', watchEntrance);
    preference.removeEventListener('change', onPreferenceChange);
  };
}
