(() => {
  const credit = document.querySelector('.brand-credit');
  const controls = document.querySelector('.brand-credit-controls');
  if (!credit || !controls) return;
  controls.hidden = false;
  controls.addEventListener('click', event => {
    const button = event.target.closest('[data-credit-choice]');
    if (!button) return;
    credit.dataset.creditStyle = button.dataset.creditChoice;
    controls.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  });
})();
