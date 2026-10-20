import { animate } from 'motion';

// Keep the authored words and artwork; open their spaces only when revealed.
export function setupStatementIcons(section) {
  const heading = section.querySelector('.statement-icon-copy');
  if (!heading) return () => {};
  const visual = heading.querySelector(':scope > span');
  const words = [...heading.querySelectorAll('.statement-icon-word')];
  const icons = [...heading.querySelectorAll('.statement-icon')];
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let animations = [];
  let revealed = false, disposed = false, frame = 0, width = heading.clientWidth, entranceObserver;

  function finish() {
    revealed = true;
    entranceObserver?.disconnect();
    animations.forEach(animation => animation.stop());
    icons.forEach(icon => icon.style.setProperty('--icon-reveal', '1'));
    section.dataset.statementRevealed = 'true';
    section.classList.add('statement-icons-ready');
  }
  function setRevealed(next) {
    if (revealed === next || disposed || preference.matches) return;
    revealed = next;
    animations.forEach(animation => animation.stop());
    animations = [];
    section.dataset.statementRevealed = String(next);
    icons.forEach((icon, i) => {
      const current = parseFloat(icon.style.getPropertyValue('--icon-reveal')) || 0;
      const target = next ? 1 : 0;
      animations.push(animate(current, target, {
        type: 'spring', stiffness: 180, damping: 18, mass: .8,
        delay: (next ? i : icons.length - 1 - i) * .065,
        onUpdate: value => icon.style.setProperty('--icon-reveal', value.toFixed(4)),
        onComplete: () => icon.style.setProperty('--icon-reveal', String(target)),
      }));
    });
  }
  function watchEntrance() {
    entranceObserver?.disconnect();
    if (disposed || preference.matches) return;
    entranceObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) setRevealed(true);
        // Close only when the heading drops below the entrance boundary as the
        // visitor returns upwards. Passing it on the way down keeps it open.
        else if (entry.rootBounds && entry.boundingClientRect.top >= entry.rootBounds.bottom) setRevealed(false);
      }
    }, { rootMargin: `0px 0px -${Math.round(innerHeight * .35)}px 0px` });
    entranceObserver.observe(heading);
  }
  function layout() {
    frame = 0;
    if (disposed || preference.matches) return;
    // Measure expanded wrapping synchronously, then close the slots again before
    // paint. Fixed line groups let words glide apart without jumping rows.
    heading.classList.add('is-measuring-icons');
    const flat = document.createDocumentFragment();
    words.forEach((word, i) => { if (i) flat.append(' ');flat.append(word); });
    visual.replaceChildren(flat);
    const lines = [];
    words.forEach(word => {
      const top = word.offsetTop;
      if (!lines.length || Math.abs(top - lines.at(-1).top) > 2) lines.push({top, words:[]});
      lines.at(-1).words.push(word);
    });
    const grouped = document.createDocumentFragment();
    lines.forEach(line => {
      const row = document.createElement('span');
      row.className = 'statement-icon-line';
      line.words.forEach((word, i) => {if (i) row.append(' ');row.append(word);});
      grouped.append(row);
    });
    visual.replaceChildren(grouped);
    heading.classList.remove('is-measuring-icons');
  }
  const resize = new ResizeObserver(() => {
    if (heading.clientWidth === width) return;
    width = heading.clientWidth;
    if (!frame) frame = requestAnimationFrame(layout);
  });
  document.fonts.ready.then(() => {
    if (disposed) return;
    if (preference.matches) finish();
    else {layout();section.classList.add('statement-icons-ready');resize.observe(heading);watchEntrance();}
  });
  const onPreference = () => {if (preference.matches) finish();else {layout();resize.observe(heading);watchEntrance();}};
  preference.addEventListener('change', onPreference);
  window.addEventListener('resize', watchEntrance, {passive:true});
  return () => {
    disposed = true;resize.disconnect();entranceObserver?.disconnect();
    cancelAnimationFrame(frame);animations.forEach(animation => animation.stop());
    preference.removeEventListener('change', onPreference);
    window.removeEventListener('resize', watchEntrance);
  };
}
