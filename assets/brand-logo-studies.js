(() => {
  const section = document.querySelector('#brand-ai-images');
  if (!section) return;
  const chooser = section.querySelector('.logo-copy-studies');
  const stage = section.querySelector('.brand-ai__image-buttons');
  const buttons = [...stage.querySelectorAll('[data-ai-image]')];
  const choices = [...chooser.querySelectorAll('[data-logo-style-choice]')];
  const names = ['Tide pills', 'Quiet tiles', 'Editorial rows', 'Split postcard', 'Soft stack', 'Floating dock'];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const root = new URL('brand-previews/logo-hover/', document.currentScript.src);
  let style = 1;
  let visible = false;
  const counts = [0, 0];
  const warm = new Set();
  const animations = new Set();
  const imageURL = tile => new URL(`study-${style}-${tile}.webp`, root).href;
  const preload = href => {
    if (warm.has(href)) return;
    warm.add(href);
    const img = new Image(); img.src = href;
  };
  const photos = () => {
    if (!visible) return;
    buttons.forEach((button, i) => {
      const tile = (counts[i] * 2 + i) % 9 + 1;
      const href = imageURL(tile);
      button.style.setProperty('--logo-photo', `url("${href}")`);
      preload(href);
    });
  };
  buttons.forEach((button, i) => {
    // Keep one real copy action per artwork; changing studies never replaces it.
    const text = [...button.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
    const label = document.createElement('span');
    label.className = 'logo-copy__label'; label.textContent = text.textContent.trim();
    text.replaceWith(label);
    const wash = document.createElement('span');
    wash.className = 'logo-copy__wash'; wash.setAttribute('aria-hidden', 'true');
    button.prepend(wash);
    button.addEventListener('pointerleave', () => {
      // Switch the next photograph only after the wave has fully drained.
      clearTimeout(button.photoTimer);
      button.photoTimer = setTimeout(() => {
        if (button.matches(':hover,:focus-visible')) return;
        counts[i]++; photos();
      }, 1150);
    });
    button.addEventListener('pointerenter', () => clearTimeout(button.photoTimer));
  });
  const finish = () => { animations.forEach(animation => animation.cancel()); animations.clear(); };
  const reveal = () => {
    finish();
    if (reduced.matches) return;
    buttons.forEach((button, i) => {
      const starts = [
        {translate: '0 10px'}, {translate: '0 12px', scale: '.98'},
        {translate: '-12px 0'}, {translate: `${i ? 10 : -10}px 0`},
        {translate: '0 8px', rotate: `${i ? 1 : -1}deg`}, {scale: '.96', translate: '0 4px'}
      ];
      const animation = button.animate([
        {opacity: 0, ...starts[style - 1]},
        {opacity: 1, translate: '0 0', scale: '1', rotate: '0deg'}
      ], {duration: 700, delay: i * 85, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards'});
      animations.add(animation);
      animation.finished.then(() => animations.delete(animation), () => {});
    });
  };
  const choose = value => {
    buttons.forEach(button => clearTimeout(button.photoTimer));
    style = value;
    stage.dataset.logoStyle = value;
    choices.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.logoStyleChoice) === value)));
    chooser.querySelector('output').textContent = `0${value} · ${names[value - 1]}`;
    counts.fill(0); photos(); reveal();
  };
  choices.forEach(button => button.addEventListener('click', () => choose(Number(button.dataset.logoStyleChoice))));
  // Start consistently on reload: the six alternatives remain explicit user choices.
  photos(); chooser.hidden = false;
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    visible = true; photos(); reveal(); observer.disconnect();
  }, {threshold: .15});
  observer.observe(stage);
  buttons.forEach(button => button.addEventListener('pointerdown', finish));
  reduced.addEventListener('change', finish);
  addEventListener('pagehide', finish);
})();
