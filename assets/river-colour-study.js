/* Swatches are sampled from the community hero and the brand colour ramps. */
const riverPalettes = [
  // Name, backdrop, darkest tone, sky, sun, far ridge, warm slope, shadow, meadow, near ridge.
  ['Community',    '#FCD8B2', '#281A2C', '#016C54', '#FDC78C', '#FC964B', '#FA94A0', '#53263C', '#A4B57A', '#21614D'],
  ['Sage hills',   '#F1F5F0', '#24362A', '#48705A', '#FCD8B2', '#B7C28C', '#8DA467', '#344A3A', '#CBDBCD', '#6B916F'],
  ['Apricot sun',  '#F1EAF2', '#53263C', '#B85B21', '#FDD8B1', '#FDB069', '#F78C5B', '#CA5020', '#FDC78C', '#66334C'],
  ['Plum dusk',    '#F1EAF2', '#281A2C', '#53263C', '#FDB9BC', '#D37685', '#FA94A0', '#66334C', '#D6BA83', '#B7555A'],
  ['Tidal flats',  '#E8F1F5', '#02364A', '#1D747F', '#FCD4AC', '#A9C5CE', '#297F88', '#105A67', '#B7C28C', '#21614D'],
  ['Coral light',  '#FDCDC8', '#592941', '#B7555A', '#FDD8B1', '#FDA7B0', '#E88484', '#53263C', '#FDB275', '#D66C6B'],
  ['Golden grass', '#FCD8B2', '#3D2031', '#808F6C', '#FDC78E', '#D6BA83', '#A6B27F', '#195947', '#FDB46F', '#869570'],
  ['Evening sky',  '#C8D5E0', '#281A2C', '#0C396B', '#FDC7C2', '#FDA9B0', '#D17484', '#4C243C', '#A9C5CE', '#3F5B78'],
  ['Forest ember', '#CBDBCD', '#114D41', '#016D54', '#FD9E57', '#F99056', '#D26723', '#3B1E2F', '#8EA469', '#195947'],
  ['Clay coast',   '#FCD6AD', '#3B1E2F', '#C8621E', '#FDC78C', '#F78C5B', '#D66C6B', '#53263C', '#A9C5CE', '#1D747F']
];

const riverStudy = document.getElementById('river-within');
const artwork = riverStudy.querySelector('object');
const controls = riverStudy.querySelector('figcaption');
let paletteIndex = 0;

function paintRiverLandscape() {
  const svg = artwork.contentDocument;
  if (!svg?.getElementById('hills')) return;
  const [name, backdrop, deep, sky, sun, ridge, slope, shadow, meadow, near] = riverPalettes[paletteIndex];
  const stops = svg.querySelectorAll('#dusk stop');
  [deep, shadow, sky, sky].forEach((colour, i) => stops[i].setAttribute('stop-color', colour));
  svg.querySelector('use[href="#portrait"][fill]').setAttribute('fill', sky);
  svg.querySelector('circle').setAttribute('fill', sun);
  const hills = svg.querySelectorAll('#hills path');
  [ridge, slope, near, shadow, sky, slope, shadow, meadow, near, deep, ridge]
    .forEach((colour, i) => hills[i].setAttribute('fill', colour));
  riverStudy.style.backgroundColor = backdrop;
  controls.querySelector('strong').textContent = name;
  controls.querySelector('[data-count]').textContent = String(paletteIndex + 1).padStart(2, '0') + ' / 10';
  controls.hidden = false;
}

controls.addEventListener('click', event => {
  const button = event.target.closest('[data-step]');
  if (!button) return;
  paletteIndex = (paletteIndex + Number(button.dataset.step) + riverPalettes.length) % riverPalettes.length;
  paintRiverLandscape();
});
artwork.addEventListener('load', paintRiverLandscape);
paintRiverLandscape();
