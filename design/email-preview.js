export function setupEmailPreviews() {
  document.querySelectorAll('[data-email-gallery]').forEach(gallery => {
    const tabs = [...gallery.querySelectorAll('[data-email-app]')];
    const modes = [...gallery.querySelectorAll('[data-email-mode]')];
    const panel = gallery.querySelector('#email-preview');
    const remembered = {gmail: 'light', outlook: 'light'};
    let app = 'gmail';
    const select = (next, mode = remembered[next], focus = false) => {
      app = next;
      remembered[app] = mode;
      const name = app === 'gmail' ? 'Gmail' : 'Outlook';
      panel.dataset.emailClient = app;
      panel.dataset.emailAppearance = mode;
      panel.setAttribute('aria-labelledby', `email-app-${app}`);
      tabs.forEach(tab => {
        const active = tab.dataset.emailApp === app;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      modes.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.emailMode === remembered[button.dataset.emailFor])));
      const mark = panel.querySelector('.email-client-brand img');
      mark.src = `../../assets/email-icons/${app}.${app === 'gmail' ? 'png' : 'svg'}`;
      panel.querySelector('[data-email-client-name]').textContent = name;
      panel.querySelector('[data-email-search]').textContent = app === 'gmail' ? 'Search mail' : 'Search';
      panel.querySelector('[data-email-compose-title]').textContent = app === 'gmail' ? 'New message' : 'New mail';
      panel.querySelector('.email-outlook-ribbon').hidden = app !== 'outlook';
      panel.querySelector('.sig-mark').src = `../../assets/logo-${mode === 'dark' ? 'white' : 'black'}.svg`;
      gallery.querySelector('[data-email-status]').textContent = `${name}, ${mode} appearance`;
      if (focus) tabs.find(tab => tab.dataset.emailApp === app).focus();
    };
    tabs.forEach(tab => tab.addEventListener('click', () => select(tab.dataset.emailApp)));
    modes.forEach(button => button.addEventListener('click', () => select(button.dataset.emailFor, button.dataset.emailMode)));
    gallery.querySelector('[role="tablist"]').addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const current = event.target.closest('[data-email-app]')?.dataset.emailApp || app;
      const next = event.key === 'Home' ? 'gmail' : event.key === 'End' ? 'outlook' : current === 'gmail' ? 'outlook' : 'gmail';
      select(next, remembered[next], true);
    });
    select('gmail');
    gallery.querySelector('.email-preview-controls').hidden = false;
  });
}
