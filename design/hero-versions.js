export function setupCoachingHeroVersions() {
  const hero = document.querySelector('[data-coaching-version]');
  const controls = hero?.querySelector('.coaching-hero__controls');
  if (!controls) return;
  const names = Object.fromEntries([...controls.querySelectorAll('[data-coaching-choice]')].map(button => [button.dataset.coachingChoice, button.title]));
  controls.hidden = false;
  controls.addEventListener('click', event => {
    const button = event.target.closest('[data-coaching-choice]');
    if (!button || !names[button.dataset.coachingChoice]) return;
    hero.dataset.coachingVersion = button.dataset.coachingChoice;
    controls.querySelectorAll('button').forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
    hero.querySelector('[data-coaching-status]').textContent = 'Background ' + button.dataset.coachingChoice + ': ' + names[button.dataset.coachingChoice];
  });
}
