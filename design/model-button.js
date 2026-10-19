export function setupModelButton(section) {
  const button = [...section.querySelectorAll('a[href]')].find(link => /\/about\/?$/.test(new URL(link.href).pathname));
  if (!button) return () => {};
  button.classList.remove('ds-button', 'ds-button-quiet', 'button', 'button-primary', 'button-secondary');
  button.classList.add('model-button');
  button.setAttribute('aria-label', 'Meet the model');
  button.innerHTML = '<span class="model-button__label">Meet the model</span><span class="model-button__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span>';
  return () => {};
}
