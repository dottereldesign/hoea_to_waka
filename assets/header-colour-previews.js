/* Each header has its own set of backgrounds, ordered from lighter to deeper colours. */
const headerColourSets = {
  model: [
    ['Lilac paper','#F1EAFA'], ['River mist','#D9E9EE'], ['Fresh sage','#CBDBCD'],
    ['Warm sand','#EBD6AD'], ['Clay rose','#D6A3A9'], ['Heather','#B9A9C0'],
    ['Willow','#87A78C'], ['Plum','#58415F'], ['Estuary','#245568'], ['Midnight plum','#35283E']
  ],
  contact: [
    ['Soft blush','#FBEBEE'], ['Peach wash','#FCD8B2'], ['Lilac mist','#ECE2EF'],
    ['Sea glass','#C0DAD6'], ['Rosewater','#E8BCC5'], ['Honey','#E3BE83'],
    ['Coastal blue','#819EB4'], ['Berry','#804B61'], ['Harbour teal','#23616A'], ['Aubergine','#472B43']
  ]
};

const header = document.querySelector('[data-header-colours]');
const options = headerColourSets[header.dataset.headerColours];
const picker = document.createElement('aside');
picker.className = 'variation-picker header-colour-picker';
picker.setAttribute('aria-label', 'Page header colours');
picker.hidden = true;
picker.innerHTML = `<strong aria-live="polite"></strong>
  <div class="variation-picker__controls">
    <button type="button" data-step="-1" aria-label="Previous header colour">&#8592;</button>
    <span data-count></span>
    <button type="button" data-step="1" aria-label="Next header colour">&#8594;</button>
  </div>`;
document.body.append(picker);
const storageKey = 'header-colour-preview-' + header.dataset.headerColours;
let index = 0;
try {
  const saved = Number(sessionStorage.getItem(storageKey));
  if (Number.isInteger(saved) && saved >= 0 && saved < options.length) index = saved;
} catch { /* Preview navigation also works without storage. */ }

function showColour() {
  const [name, background] = options[index];
  const [r,g,b] = background.slice(1).match(/../g).map(hex => {
    const v = parseInt(hex,16) / 255;
    return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
  });
  const luminance = .2126*r + .7152*g + .0722*b;
  const inkContrast = (luminance + .05) / (.00972 + .05);
  const whiteContrast = 1.05 / (luminance + .05);
  // A few midtones need pure black to reach 4.5:1.
  const ink = whiteContrast >= inkContrast && whiteContrast >= 4.5 ? '#FFFFFF'
    : inkContrast >= 4.5 ? '#191919' : '#000000';
  header.style.setProperty('--header-preview-bg', background);
  header.style.setProperty('--header-preview-ink', ink);
  picker.querySelector('strong').textContent = name;
  picker.querySelector('[data-count]').textContent = String(index + 1).padStart(2,'0') + ' / ' + options.length;
}

picker.addEventListener('click', event => {
  const button = event.target.closest('[data-step]');
  if (!button) return;
  index = (index + Number(button.dataset.step) + options.length) % options.length;
  showColour();
  try { sessionStorage.setItem(storageKey, String(index)); } catch { /* Storage is optional. */ }
});
showColour();
new IntersectionObserver(([entry]) => {
  picker.hidden = !entry.isIntersecting;
  document.body.classList.toggle('previewing-header', entry.isIntersecting);
}).observe(header);
