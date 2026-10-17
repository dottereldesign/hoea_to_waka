export function setupTopicMarquee(section, paused = false) {
  if (!section) return () => {};
  const terms = [...section.querySelectorAll('.kinetic-topics__list li')].map(el => el.textContent);
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const visual = document.createElement('div');
  visual.className = 'kinetic-topics__rows';
  visual.setAttribute('aria-hidden', 'true');
  section.append(visual);
  const rows = [terms.slice(0, 4), terms.slice(4, 8), terms.slice(8)].map((words, i) => {
    const row = document.createElement('div');
    row.className = `kinetic-topics__row${i === 1 ? ' kinetic-topics__row--reverse' : ''}`;
    const track = document.createElement('div');
    track.className = 'kinetic-topics__track';
    row.append(track);
    visual.append(row);
    return { row, track, words, index: i, speed: [.75, 1, 1.3][i], direction: i === 1 ? -1 : 1, cycle: 0, offset: 0 };
  });
  let frame = 0, layoutFrame = 0, active = false, ready = false, disposed = false;
  let previousY = scrollY, previousScrollTime = performance.now(), lastFrameTime = 0;
  let velocity = 0, targetVelocity = 0, observedWidth = section.clientWidth;
  const allowed = () => !paused && !preference.matches && !document.hidden;
  const modulo = (value, size) => ((value % size) + size) % size;

  function paint(row) {
    row.track.style.transform = `translate3d(${-row.cycle + row.offset}px,0,0)`;
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    velocity = targetVelocity = 0;
  }
  function layout() {
    layoutFrame = 0;
    if (disposed) return;
    if (paused || preference.matches) {
      stop();
      section.classList.remove('is-kinetic-ready', 'is-kinetic-measuring');
      return;
    }
    section.classList.add('is-kinetic-measuring');
    for (const row of rows) {
      const group = document.createElement('div');
      group.className = 'kinetic-topics__group';
      function appendWords() {
        row.words.forEach((word, i) => {
          const label = document.createElement('span');
          label.className = row.index < 2 && (i + row.index) % 2 ? 'kinetic-topics__outline' : '';
          label.textContent = word;
          group.append(label);
          if (row.index === 2) {
            const dot = document.createElement('span');
            dot.className = 'kinetic-topics__dot';
            group.append(dot);
          }
        });
      }
      appendWords();
      row.track.replaceChildren(group);
      // Every repeat covers the viewport; three identical copies allow either
      // direction to wrap forever without revealing an empty edge.
      for (let repeat = 1; group.getBoundingClientRect().width < section.clientWidth + 32 && repeat < 16; repeat++) {
        const before = group.getBoundingClientRect().width;
        appendWords();
        if (group.getBoundingClientRect().width <= before) {
          // If layout styles have not loaded, retain the readable static list.
          stop();
          ready = false;
          section.classList.remove('is-kinetic-ready', 'is-kinetic-measuring');
          return;
        }
      }
      const fraction = row.cycle ? row.offset / row.cycle : row.index * .17;
      row.cycle = group.getBoundingClientRect().width;
      row.offset = modulo(fraction * row.cycle, row.cycle);
      row.track.append(group.cloneNode(true), group.cloneNode(true));
      paint(row);
    }
    section.classList.add('is-kinetic-ready');
    section.classList.remove('is-kinetic-measuring');
    ready = true;
  }
  function update(now) {
    frame = 0;
    if (!active || !allowed() || !ready) { stop(); return; }
    const dt = Math.min((now - lastFrameTime) / 1000, .05);
    lastFrameTime = now;
    // Time-based damping keeps the same feel on 60 Hz and high-refresh screens.
    velocity += (targetVelocity - velocity) * (1 - Math.exp(-14 * dt));
    targetVelocity *= Math.exp(-8 * dt);
    rows.forEach(row => {
      row.offset = modulo(row.offset + velocity * dt * .55 * row.speed * row.direction, row.cycle);
      paint(row);
    });
    if (Math.abs(velocity) > 1 || Math.abs(targetVelocity) > 1) frame = requestAnimationFrame(update);
  }
  function requestTick() {
    if (frame || !active || !allowed() || !ready) return;
    lastFrameTime = performance.now();
    frame = requestAnimationFrame(update);
  }
  function onScroll() {
    const now = performance.now(), currentY = scrollY;
    const delta = currentY - previousY;
    const elapsed = Math.max(16, now - previousScrollTime);
    previousY = currentY;
    previousScrollTime = now;
    if (!active || !allowed()) return;
    targetVelocity = Math.max(-2400, Math.min(2400, delta / elapsed * 1000));
    requestTick();
  }
  const observer = new IntersectionObserver(entries => {
    active = entries.some(entry => entry.isIntersecting);
    previousY = scrollY;
    previousScrollTime = performance.now();
    if (!active) stop();
  }, { rootMargin: '150px 0px' });
  const resize = new ResizeObserver(() => {
    if (section.clientWidth === observedWidth) return;
    observedWidth = section.clientWidth;
    if (!layoutFrame && ready) layoutFrame = requestAnimationFrame(layout);
  });
  observer.observe(section);
  resize.observe(section);
  document.fonts.ready.then(() => { if (!disposed) layout(); });
  const onVisibility = () => { if (document.hidden) stop(); };
  window.addEventListener('scroll', onScroll, { passive: true });
  preference.addEventListener('change', layout);
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    disposed = true;
    stop();
    cancelAnimationFrame(layoutFrame);
    observer.disconnect();
    resize.disconnect();
    window.removeEventListener('scroll', onScroll);
    preference.removeEventListener('change', layout);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
