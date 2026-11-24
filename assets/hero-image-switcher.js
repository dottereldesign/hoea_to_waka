const heroImageControls = document.querySelector('.hero-image-controls');
if (heroImageControls) {
  const image = heroImageControls.parentElement.querySelector('img');
  const illustrations = [
    { src: image.getAttribute('src'), alt: image.alt, name: 'Community conversation' },
    { src: 'assets/river-within.svg?v=2', alt: 'A bowed silhouette filled with sunlit hills and a winding blue river.', name: 'River within' }
  ];
  let index = 0;
  heroImageControls.hidden = false;
  heroImageControls.addEventListener('click', event => {
    const button = event.target.closest('[data-image-step]');
    if (!button) return;
    index = (index + Number(button.dataset.imageStep) + illustrations.length) % illustrations.length;
    const illustration = illustrations[index];
    image.alt = illustration.alt;
    image.src = illustration.src;
    heroImageControls.querySelector('[aria-live]').textContent = illustration.name;
  });
}
