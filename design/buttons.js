const arrow = external => `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${external ? '<path d="M7 7h10v10M7 17 17 7"/>' : '<path d="M5 12h14m-6-6 6 6-6 6"/>'}</svg>`;

// Apply the same hierarchy to native markup and the saved component layouts.
export function setupButtons(scope = document) {
  scope.querySelectorAll('.button,.ds-button').forEach(button => {
    const secondary = button.matches('.ds-button-quiet,.button-ghost,.button-light,.button-secondary') || Boolean(button.closest('.ds-card,.service-card,.ex-item'));
    button.dataset.buttonStyle = secondary ? 'secondary' : 'primary';
    if (!button.matches('a[href]')) return;
    const destination = new URL(button.href, location.href);
    const internal = destination.origin === location.origin;
    const contact = /\/contact\/?$/.test(destination.pathname) || /^(mailto:|tel:)/.test(destination.protocol);
    const navigation = internal && !contact && (!secondary || Boolean(button.closest('.ds-card,.service-card,.ex-item')));
    // Preserve meaningful action icons (play, download, mail); replace directional arrows.
    button.querySelectorAll('svg').forEach(svg => {
      if (svg.hasAttribute('data-button-icon') || svg.querySelector('path[d="M7 7h10v10"],path[d="M5 12h14"]')) svg.remove();
    });
    if (!button.querySelector('svg') && (navigation || (!internal && /^https?:$/.test(destination.protocol)))) {
      button.insertAdjacentHTML('beforeend', arrow(!internal));
      button.lastElementChild.dataset.buttonIcon = internal ? 'next' : 'external';
    }
  });
  // Internal shortcut links in editorial layouts use the same navigation cue.
  scope.querySelectorAll('a[href]').forEach(link => {
    if (new URL(link.href, location.href).origin !== location.origin) return;
    link.querySelectorAll('svg').forEach(svg => {
      if (svg.querySelector('path[d="M7 7h10v10"]')) svg.outerHTML = arrow(false);
    });
  });
}
