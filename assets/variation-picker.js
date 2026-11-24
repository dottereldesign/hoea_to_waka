document.querySelectorAll('[data-variation-target]').forEach(picker => {
  const target = document.getElementById(picker.dataset.variationTarget);
  const attribute = picker.dataset.variationAttribute;
  const names = picker.dataset.variationNames.split('|');
  if (!target || !attribute || !names.length) return;

  function show(index) {
    const number = String(index + 1).padStart(2, '0');
    target.setAttribute(attribute, number);
    picker.querySelector('[data-variation-name]').textContent = names[index];
    picker.querySelector('[data-variation-count]').textContent = number + ' / ' + names.length;
  }

  picker.addEventListener('click', event => {
    const button = event.target.closest('[data-variation-step]');
    if (!button) return;
    const current = Number(target.getAttribute(attribute)) - 1;
    show((current + Number(button.dataset.variationStep) + names.length) % names.length);
  });
  show(0);
  if (picker.hasAttribute('data-show-with-target')) {
    new IntersectionObserver(([entry]) => {
      picker.hidden = !entry.isIntersecting;
    }).observe(target);
  } else {
    picker.hidden = false;
  }
});
