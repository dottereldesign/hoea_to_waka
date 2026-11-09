(() => {
  const palette = document.querySelector('#colours');
  if (!palette) return;
  let feedback;
  let feedbackTimer;
  palette.addEventListener('click', async event => {
    const button = event.target.closest('[data-copy]');
    if (!button) return;
    const status = document.querySelector('#guide-palette-status');
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      status.textContent = `${button.dataset.copy} copied to clipboard.`;
      clearTimeout(feedbackTimer);
      feedback?.remove();
      feedback = document.createElement('span');
      feedback.className = 'palette-copy-feedback';
      feedback.setAttribute('aria-hidden', 'true');
      feedback.textContent = 'Copied to clipboard';
      button.append(feedback);
      feedbackTimer = setTimeout(() => feedback.remove(), 1600);
    } catch {
      status.textContent = `Colour code: ${button.dataset.copy}`;
    }
  });
})();
