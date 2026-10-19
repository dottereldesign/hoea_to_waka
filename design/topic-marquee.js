export function setupTopicMarquee(section, paused = false) {
  if (!section) return () => {};
  const terms = [...section.querySelectorAll('.kinetic-topics__list li')].map(el => el.textContent);
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = preference.matches;
  const visual = document.createElement('div');
  visual.className = 'kinetic-topics__rows';
  visual.setAttribute('aria-hidden', 'true');
  section.append(visual);
  const pauseButton = document.createElement('button');
  pauseButton.type = 'button';
  pauseButton.className = 'kinetic-topics__pause';
  pauseButton.textContent = 'Pause animation';
  pauseButton.setAttribute('aria-pressed', 'false');
  const controls = document.createElement('div');
  controls.className = 'kinetic-topics__controls';
  controls.append(pauseButton);
  section.append(controls);
  const previousSection = () => document.getElementById('home-previous-uses');
  const previousButton = document.createElement('button');
  previousButton.type = 'button';
  previousButton.className = 'kinetic-topics__previous';
  previousButton.dataset.previousVersion = '';
  previousButton.textContent = 'Previous Version';
  previousButton.setAttribute('aria-controls', 'home-previous-uses');
  previousButton.setAttribute('aria-expanded', 'false');
  if (previousSection()) controls.append(previousButton);
  function onPrevious() {
    const target = previousSection();
    if (!target) return;
    target.hidden = !target.hidden;
    previousButton.setAttribute('aria-expanded', String(!target.hidden));
    previousButton.textContent = target.hidden ? 'Previous Version' : 'Hide Previous Version';
  }
  previousButton.addEventListener('click', onPrevious);
  const rows = [terms.slice(0, 4), terms.slice(4, 8), terms.slice(8)].map((words, i) => {
    const row = document.createElement('div');
    row.className = `kinetic-topics__row${i === 1 ? ' kinetic-topics__row--reverse' : ''}`;
    const track = document.createElement('div');
    track.className = 'kinetic-topics__track';
    row.append(track);
    visual.append(row);
    return { row, track, words, index: i, speed: [38, 44, 40][i], direction: i === 1 ? -1 : 1, cycle: 0, offset: 0 };
  });
  let frame = 0, layoutFrame = 0, active = false, ready = false, disposed = false;
  let lastFrameTime = 0, userPaused = false, observedWidth = section.clientWidth;
  const allowed = () => !paused && !userPaused && !reducedMotion && !document.hidden;
  const modulo = (value, size) => ((value % size) + size) % size;

  function paint(row) {
    row.track.style.transform = `translate3d(${-row.cycle + row.offset}px,0,0)`;
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }
  function layout() {
    layoutFrame = 0;
    if (disposed) return;
    if (paused || reducedMotion) {
      stop();
      section.classList.remove('is-kinetic-ready', 'is-kinetic-measuring');
      return;
    }
    const title = document.querySelector('main h1');
    if (title) section.style.setProperty('--marquee-font-size', getComputedStyle(title).fontSize);
    section.classList.add('is-kinetic-measuring');
    for (const row of rows) {
      const group = document.createElement('div');
      group.className = 'kinetic-topics__group';
      function appendWords() {
        const start = group.childElementCount;
        row.words.forEach((word, i) => {
          const label = document.createElement('span');
          label.className = (start + i + row.index) % 2 ? 'kinetic-topics__outline' : '';
          label.textContent = word;
          group.append(label);
        });
      }
      appendWords();
      // An even word count keeps fill/outline alternation intact at the loop seam.
      if (row.words.length % 2) appendWords();
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
    requestTick();
  }
  function update(now) {
    frame = 0;
    if (!active || !allowed() || !ready) { stop(); return; }
    const dt = Math.min((now - lastFrameTime) / 1000, .05);
    lastFrameTime = now;
    // Constant pixels per second: independent of scroll and display refresh rate.
    rows.forEach(row => {
      row.offset = modulo(row.offset + dt * row.speed * row.direction, row.cycle);
      paint(row);
    });
    frame = requestAnimationFrame(update);
  }
  function requestTick() {
    if (frame || !active || !allowed() || !ready) return;
    lastFrameTime = performance.now();
    frame = requestAnimationFrame(update);
  }
  function onPause() {
    userPaused = !userPaused;
    pauseButton.textContent = userPaused ? 'Resume animation' : 'Pause animation';
    pauseButton.setAttribute('aria-pressed', String(userPaused));
    if (userPaused) stop();
    else requestTick();
  }
  const observer = new IntersectionObserver(entries => {
    active = entries.some(entry => entry.isIntersecting);
    if (!active) stop();
    else requestTick();
  }, { rootMargin: '150px 0px' });
  const resize = new ResizeObserver(() => {
    if (section.clientWidth === observedWidth) return;
    observedWidth = section.clientWidth;
    if (!layoutFrame && ready) layoutFrame = requestAnimationFrame(layout);
  });
  observer.observe(section);
  resize.observe(section);
  document.fonts.ready.then(() => { if (!disposed) layout(); });
  const onVisibility = () => { if (document.hidden) stop(); else requestTick(); };
  const onMotionChange = event => {
    reducedMotion = event.matches;
    if (reducedMotion) {
      stop();
      ready = false;
      section.classList.remove('is-kinetic-ready', 'is-kinetic-measuring');
    } else layout();
  };
  pauseButton.addEventListener('click', onPause);
  preference.addEventListener('change', onMotionChange);
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    disposed = true;
    stop();
    cancelAnimationFrame(layoutFrame);
    observer.disconnect();
    resize.disconnect();
    pauseButton.removeEventListener('click', onPause);
    previousButton.removeEventListener('click', onPrevious);
    preference.removeEventListener('change', onMotionChange);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
