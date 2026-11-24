/* Keep each header’s preview order stable for saved selections. */
const headerColourSets = {
  resources: [
    ['Book paper','#FBF4E6'], ['Apricot','#FDC78C'], ['Petal','#FDC7C2'],
    ['Rainwashed blue','#C8D5E0'], ['Oat','#D6C9AB'], ['Dusty rose','#C88F99'],
    ['Moss','#728365'], ['Mulberry','#713C55'], ['Ocean ink','#183E66'], ['Dark olive','#354638'],
    ['Lilac paper','#F1EAFA'], ['Glacier blue','#CEE8F7'], ['Sea foam','#D2EBE3'],
    ['Flax shoot','#E3E8BA'], ['Butter yellow','#F8EBBD'], ['Peach milk','#FFE3CF'],
    ['Rose quartz','#F2D6DA'], ['Bluebell','#D8D9F2'], ['Pumice','#E6E2DD'],
    ['Pale sage','#DFE9DA'], ['Golden flax','#E4C373'], ['Coral clay','#E99E85'],
    ['Heather mauve','#C4A6BE'], ['Kingfisher blue','#79AEC4'], ['Eucalyptus','#93B4A5'],
    ['Burnished copper','#89482F'], ['Wineberry','#67394D'], ['Deep teal','#205C60'],
    ['Twilight violet','#51476E'], ['Graphite','#34383D']
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
