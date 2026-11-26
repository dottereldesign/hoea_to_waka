const tagline = document.querySelector('.site-footer .footer-tagline');
if (tagline) {
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = tagline.className;
  trigger.textContent = tagline.textContent;
  trigger.setAttribute('aria-haspopup', 'dialog');
  tagline.replaceWith(trigger);

  let clicks = 0;
  let game;
  trigger.addEventListener('blur', () => { clicks = 0; });
  document.addEventListener('click', event => {
    if (event.target !== trigger) clicks = 0;
  }, true);
  trigger.addEventListener('click', async () => {
    if (++clicks !== 3) return;
    clicks = 0;
    try {
      game ??= loadGame(trigger);
      const dialog = await game;
      if (!dialog.open) dialog.showModal();
    } catch {
      game = null;
      trigger.title = 'Game could not load. Click three times to try again.';
    }
  });
}

async function loadGame(trigger) {
  const sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = new URL('./resource-game.css', import.meta.url);
  const stylesReady = new Promise((resolve, reject) => {
    sheet.onload = resolve;
    sheet.onerror = reject;
  });
  document.head.append(sheet);

  try {
    const [markup, {setupGame}] = await Promise.all([
      fetch(new URL('./resource-game-section.html', import.meta.url)).then(response => {
        if (!response.ok) throw new Error('Game unavailable');
        return response.text();
      }),
      import('./resource-game.js'),
      import('./maori-wordle-core.js'),
      import('./maori-wordle-words.js'),
      stylesReady
    ]);
    const dialog = document.createElement('dialog');
    dialog.className = 'footer-game-dialog';
    dialog.setAttribute('aria-labelledby', 'resource-play-title');
    const section = new DOMParser().parseFromString(markup, 'text/html').getElementById('resource-play');
    if (!section) throw new Error('Game unavailable');
    dialog.append(section);
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'footer-game-close';
    close.setAttribute('aria-label', 'Close game');
    close.textContent = '×';
    dialog.prepend(close);
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => trigger.focus({preventScroll: true}));
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const {left, right, top, bottom} = dialog.getBoundingClientRect();
      if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) dialog.close();
    });
    setupGame(dialog.querySelector('#resource-play'));
    document.body.append(dialog);
    trigger.removeAttribute('title');
    return dialog;
  } catch (error) {
    sheet.remove();
    throw error;
  }
}
