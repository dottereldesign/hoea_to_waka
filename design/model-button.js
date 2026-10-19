const storageKey = 'hoea-model-button-preview-v1';
const styles = ['Clean lift', 'Arrow disc', 'Rolling label', 'Quiet outline', 'Inset frame', 'Circular reveal', 'Split capsule', 'Cursor spotlight', 'Dot to arrow', 'Offset edge'];

export function setupModelButton(section) {
  const button = [...section.querySelectorAll('a[href]')].find(link => /\/about\/?$/.test(new URL(link.href).pathname));
  if (!button) return () => {};
  button.classList.remove('ds-button', 'ds-button-quiet', 'button', 'button-primary', 'button-secondary');
  button.classList.add('model-button');
  button.setAttribute('aria-label', 'Meet the model');
  button.innerHTML = `<span class="model-button__label"><span class="model-button__text model-button__text--main">Meet the model</span><span class="model-button__text model-button__text--alt" aria-hidden="true">Meet the model</span></span><span class="model-button__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span>`;
  const controls = document.createElement('div');
  controls.className = 'model-button-previews';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Preview Meet the model button styles');
  styles.forEach((name, index) => {
    const choice = document.createElement('button');
    choice.type = 'button';
    choice.textContent = String(index + 1);
    choice.dataset.modelStyleChoice = String(index + 1);
    choice.setAttribute('aria-label', `Style ${index + 1}: ${name}`);
    choice.title = name;
    controls.append(choice);
  });
  const status = document.createElement('span');
  status.className = 'model-button-status';
  status.setAttribute('aria-live', 'polite');
  controls.append(status);
  button.after(controls);
  function select(value, persist = true) {
    const selected = Number.isInteger(value) && value >= 1 && value <= 10 ? value : 1;
    button.dataset.modelStyle = String(selected);
    button.style.removeProperty('--model-dx');
    button.style.removeProperty('--model-dy');
    controls.querySelectorAll('button').forEach(choice => choice.setAttribute('aria-pressed', String(Number(choice.dataset.modelStyleChoice) === selected)));
    status.textContent = `Style ${selected}: ${styles[selected - 1]}`;
    if (persist) { try { localStorage.setItem(storageKey, String(selected)); } catch {} }
  }
  let initial = 1;
  try { initial = Number(localStorage.getItem(storageKey) || 1); } catch {}
  select(initial, false);
  const onChoice = event => {
    const choice = event.target.closest('[data-model-style-choice]');
    if (choice) select(Number(choice.dataset.modelStyleChoice));
  };
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const onMove = event => {
    if (reduced.matches || !['4', '8'].includes(button.dataset.modelStyle)) return;
    const bounds = button.getBoundingClientRect();
    const x = event.clientX - bounds.left, y = event.clientY - bounds.top;
    button.style.setProperty('--model-x', `${x}px`);
    button.style.setProperty('--model-y', `${y}px`);
    button.style.setProperty('--model-dx', `${((x / bounds.width - .5) * 7).toFixed(2)}px`);
    button.style.setProperty('--model-dy', `${((y / bounds.height - .5) * 5).toFixed(2)}px`);
  };
  const onLeave = () => {
    button.style.setProperty('--model-dx', '0px');
    button.style.setProperty('--model-dy', '0px');
  };
  controls.addEventListener('click', onChoice);
  button.addEventListener('pointermove', onMove);
  button.addEventListener('pointerleave', onLeave);
  return () => {
    controls.remove();
    button.removeEventListener('pointermove', onMove);
    button.removeEventListener('pointerleave', onLeave);
  };
}
