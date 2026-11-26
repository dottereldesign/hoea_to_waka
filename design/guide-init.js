import { setupBrandInfo } from './brand-info';
import { setupEmailPreviews } from './email-preview';
import { setupCardStudy } from './card-study';
import { setupSocialPreviews } from './social-previews';
import { setupBrandEditor } from './brand-colours';
import { setupStatementCopy } from './statement-copy';
import { setupTypographyStudies } from './typography-studies';
import { setupBrandDownloads } from './brand-assets';
function whenNear(selector, setup) {
  const target = document.querySelector(selector);
  if (!target) return;
  let ready = false;
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) initialise();
  }, {rootMargin:'700px 0px'});
  function initialise() {
    if (ready) return;
    ready = true;
    observer.disconnect();
    target.removeEventListener('focusin', initialise);
    target.removeEventListener('pointerdown', initialise, true);
    setup();
  }
  observer.observe(target);
  target.addEventListener('focusin', initialise);
  target.addEventListener('pointerdown', initialise, true);
}
document.addEventListener('DOMContentLoaded',() => {
  setupBrandDownloads();
  setupStatementCopy();
  setupBrandInfo();
  setupCardStudy();
  whenNear('[data-brand-editor]', setupBrandEditor);
  whenNear('[data-type-study]', setupTypographyStudies);
  whenNear('[data-email-gallery]', setupEmailPreviews);
  whenNear('[data-social-gallery]', setupSocialPreviews);
  for (const template of document.querySelectorAll('.spacing-inventory .spacing-table')) {
    const disclosure = template.closest('details');
    const materialise = () => {
      if (!disclosure.open) return;
      template.insertAdjacentHTML('afterend', template.textContent);
      template.remove();
      disclosure.removeEventListener('toggle', materialise);
    };
    disclosure.addEventListener('toggle', materialise);
    materialise();
  }
},{once:true});
