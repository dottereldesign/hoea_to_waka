import { createElement, Sprout, Mountain, Building2, Compass, HandHeart } from 'lucide';

const illustrations = new Map([
  ['Resilience', Sprout], ['Aotearoa’s', Mountain], ['workplaces,', Building2],
  ['leaders,', Compass], ['professionals.', HandHeart],
]);

export function setupStatementIcons(section, paused = false) {
  const copy = 'Resilience training set in Aotearoa’s unique cultural context, made practical for workplaces, leaders, and support professionals.';
  const heading = [...section.querySelectorAll('h2,p')].find(el =>
    (el.getAttribute('aria-label') || el.textContent).replace(/\s+/g, ' ').trim() === copy);
  if (!heading) return () => {};
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
      slot.dataset.statementIcon = text.replace(/[,.]/g, '');
      const svg = createElement(illustrations.get(text));
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
  const clamp = n => Math.max(0, Math.min(1, n));
  let frame = 0, layoutFrame = 0, disposed = false;
  let width = heading.clientWidth;

  function paint() {
    frame = 0;
    const progress = paused || preference.matches ? 1 :
      clamp((innerHeight * .8 - section.getBoundingClientRect().top) / (innerHeight * .62));
    icons.forEach((icon, i) => {
      const t = clamp((progress - i * .12) / .45);
      icon.style.setProperty('--icon-reveal', (t * t * (3 - 2 * t)).toFixed(4));
    });
  }
  function schedulePaint() {
    if (!frame) frame = requestAnimationFrame(paint);
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
    paint();
  }
  const observer = new ResizeObserver(() => {
    if (heading.clientWidth === width) return;
    width = heading.clientWidth;
    if (!layoutFrame) layoutFrame = requestAnimationFrame(layout);
  });
  layout();
  observer.observe(heading);
  document.fonts.ready.then(() => { if (!disposed) layout(); });
  window.addEventListener('scroll', schedulePaint, { passive: true });
  window.addEventListener('resize', schedulePaint, { passive: true });
  preference.addEventListener('change', schedulePaint);
  return () => {
    disposed = true;
    observer.disconnect();
    cancelAnimationFrame(frame);
    cancelAnimationFrame(layoutFrame);
    window.removeEventListener('scroll', schedulePaint);
    window.removeEventListener('resize', schedulePaint);
    preference.removeEventListener('change', schedulePaint);
  };
}
