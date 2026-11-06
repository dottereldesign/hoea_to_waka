(() => {
  const palette = document.querySelector('#colours');
  if (!palette) return;
  palette.addEventListener('click', async event => {
    const button = event.target.closest('[data-copy]');
    if (!button) return;
    const status = document.querySelector('#guide-palette-status');
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      status.textContent = `${button.dataset.copy} copied.`;
    } catch {
      status.textContent = `Colour code: ${button.dataset.copy}`;
    }
  });
})();
