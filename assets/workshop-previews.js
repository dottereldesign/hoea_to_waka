const workshopPreviews = document.querySelector('.workshop-previews');
const previewChoice = workshopPreviews.querySelector('select');
function showPreview(scroll) {
  const kind = previewChoice.value;
  workshopPreviews.dataset.active = kind;
  if (scroll) {
    const destinations = { cards: 'support-features', roles: 'support-roles', text: 'support-research' };
    document.getElementById(destinations[kind]).scrollIntoView({ block: 'start' });
  }
}
if (location.hash === '#support-features') previewChoice.value = 'cards';
if (location.hash === '#support-research') previewChoice.value = 'text';
showPreview(false);
workshopPreviews.hidden = false;
previewChoice.addEventListener('change', () => showPreview(true));
