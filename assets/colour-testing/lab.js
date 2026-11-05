(() => {
  const lab = document.querySelector('.colour-lab');
  if (!lab) return;

  const colour = lab.querySelector('#colour-choice');
  const enabled = lab.querySelector('#texture-enabled');
  const strength = lab.querySelector('#texture-strength');
  const status = lab.querySelector('#copy-status');
  const dialog = lab.querySelector('dialog');

  function updatePreview() {
    lab.toggleAttribute('data-solid', Boolean(colour.value));
    lab.style.setProperty('--selected-colour', colour.value || '#016C53');
    lab.toggleAttribute('data-flat', !enabled.checked);
    lab.style.setProperty('--texture-strength', Number(strength.value) / 100);
    lab.querySelector('#strength-value').value = strength.value + '%';
  }

  colour.addEventListener('change', updatePreview);
  enabled.addEventListener('change', updatePreview);
  strength.addEventListener('input', updatePreview);
  lab.querySelector('#reset-textures').addEventListener('click', () => {
    colour.value = '';
    enabled.checked = true;
    strength.value = '45';
    updatePreview();
  });

  lab.querySelectorAll('[data-copy]').forEach(button => {
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        status.textContent = 'Copied ' + button.dataset.copy;
      } catch {
        status.textContent = 'Select and copy this colour: ' + button.dataset.copy;
        const range = document.createRange();
        range.selectNodeContents(status);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });
  });

  lab.querySelectorAll('[data-enlarge]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      const card = button.closest('.lab-card');
      lab.querySelector('#preview-title').textContent = card.querySelector('h3').textContent;
      lab.querySelector('#preview-body').replaceChildren(
        card.querySelector('.lab-sample').cloneNode(true),
        card.querySelector('.lab-card-copy > p').cloneNode(true)
      );
      dialog.showModal();
    });
  });
  lab.querySelector('#close-preview').addEventListener('click', () => dialog.close());
  lab.querySelector('.lab-controls').hidden = false;
})();
