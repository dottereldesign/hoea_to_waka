(() => {
  const study = document.querySelector('#community-study');
  if (!study) return;
  const asset = '../assets/colour-testing/';
  const colourChanges = new Map();
  const status = study.querySelector('#community-status');
  const choice = study.querySelector('#community-colour-part');
  const colour = study.querySelector('#community-colour');
  const texture = study.querySelector('#community-texture');
  const strength = study.querySelector('#community-strength');
  const overlay = study.querySelector('.community-overlay');
  const mode = study.querySelector('#community-compare-mode');
  const slider = study.querySelector('#community-compare-slider');
  const version = study.querySelector('#community-compare-version');
  const dialog = study.querySelector('#community-dialog');
  let serial = 0;
  function uniqueSVG(source) {
    const svg = source.cloneNode(true);
    const prefix = `community-${++serial}-`;
    const ids = new Map([...svg.querySelectorAll('[id]')].map(e => [e.id, prefix + e.id]));
    for (const node of [svg, ...svg.querySelectorAll('*')]) {
      for (const attr of [...node.attributes]) {
        let value = attr.value;
        if (attr.name === 'id' && ids.has(value)) value = ids.get(value);
        else if (attr.name === 'aria-labelledby' || attr.name === 'aria-describedby') value = value.split(' ').map(x => ids.get(x) || x).join(' ');
        else value = value.replace(/url\(#([^\)]+)\)/g, (_, id) => `url(#${ids.get(id) || id})`);
        node.setAttribute(attr.name, value);
      }
    }
    return svg;
  }
  function procedural() {
    const id = `community-grain-${++serial}`;
    return new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" class="community-procedural" viewBox="0 0 1086 1448" aria-hidden="true"><defs><filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3" seed="17" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter></defs><rect width="1086" height="1448" filter="url(#${id})"/></svg>`, 'image/svg+xml').documentElement;
  }
  function updateTexture() {
    study.style.setProperty('--community-grain-strength', Number(strength.value) / 100);
    study.querySelector('#community-strength-value').value = `${strength.value}%`;
    study.querySelectorAll('.community-procedural').forEach(e => e.remove());
    study.querySelectorAll('.community-grain').forEach(img => {
      img.hidden = texture.value === 'procedural';
      if (img.hidden) img.after(procedural());
      else img.src = asset + texture.value;
    });
  }
  function updateCompare() {
    overlay.dataset.mode = mode.value;
    overlay.dataset.version = version.value;
    study.style.setProperty('--community-compare', Number(slider.value) / 100);
    slider.disabled = mode.value === 'difference';
    study.querySelector('#community-compare-value').value = mode.value === 'difference' ? '—' : `${slider.value}%`;
    study.querySelector('#community-compare-note').textContent = mode.value === 'blend'
      ? '0% shows the reference; 100% shows the SVG. At 50% both are superimposed.'
      : mode.value === 'wipe' ? 'Reference on the left; SVG on the right. Move the join to compare a silhouette.'
      : 'Dark areas are similar. Bright edges reveal differences. The original grain also appears in this view.';
  }
  function clearActive() { study.querySelectorAll('[data-active]').forEach(e => e.removeAttribute('data-active')); }
  function previewLayer(name, host = study) {
    clearActive();
    host.querySelectorAll(`.community-interactive [data-layer="${name}"]`).forEach(e => e.setAttribute('data-active', ''));
  }
  function colourChoice() { colour.value = colourChanges.get(`--community-${choice.value}`) || choice.selectedOptions[0].dataset.colour; }
  function reset() {
    for (const key of colourChanges.keys()) study.style.removeProperty(key);
    colourChanges.clear();
    choice.selectedIndex = 0;
    colourChoice();
    texture.value = 'community-grain.webp';
    strength.value = '45';
    mode.value = 'blend';
    version.value = 'flat';
    slider.value = '50';
    study.querySelector('#community-motion').checked = true;
    study.dataset.motion = 'true';
    clearActive(); updateTexture(); updateCompare();
    status.textContent = 'Original colours, texture and comparison restored.';
  }
  async function dataURL(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Texture unavailable');
    const blob = await response.blob();
    return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); });
  }
  async function download(kind, link) {
    const svg = uniqueSVG(study.querySelector('[data-community-svg="flat"] > svg'));
    svg.querySelectorAll('[data-active]').forEach(e => e.removeAttribute('data-active'));
    for (const stop of svg.querySelectorAll('stop')) {
      stop.setAttribute('stop-color', stop.getAttribute('stop-color').replace(/var\((--[\w-]+),\s*([^)]+)\)/g, (_, key, fallback) => colourChanges.get(key) || fallback));
    }
    if (kind === 'textured') {
      if (texture.value === 'procedural') {
        const grain = procedural();
        grain.setAttribute('style', `mix-blend-mode:soft-light;opacity:${Number(strength.value)/100}`);
        svg.append(...grain.childNodes);
        svg.lastElementChild.setAttribute('style', grain.getAttribute('style'));
      } else {
        const grain = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        grain.setAttribute('href', await dataURL(asset + texture.value));
        grain.setAttribute('width', '1086'); grain.setAttribute('height', '1448');
        grain.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        grain.setAttribute('style', `mix-blend-mode:soft-light;opacity:${Number(strength.value)/100}`);
        svg.append(grain);
      }
    }
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
    const a = document.createElement('a'); a.href = url; a.download = `community-${kind}.svg`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    status.textContent = `Downloaded the ${kind} SVG with your current colours${kind === 'textured' ? ' and texture' : ''}.`;
  }
  async function init() {
    const response = await fetch(asset + 'community.svg');
    if (!response.ok) throw new Error('SVG unavailable');
    const source = new DOMParser().parseFromString(await response.text(), 'image/svg+xml').documentElement;
    if (source.localName !== 'svg') throw new Error('Invalid SVG');
    study.querySelectorAll('[data-community-svg]').forEach(host => {
      const svg = uniqueSVG(source);
      if (host.dataset.communitySvg === 'overlay') { svg.setAttribute('aria-hidden', 'true'); svg.removeAttribute('role'); }
      host.replaceChildren(svg);
    });
    study.querySelectorAll('[data-community-controls], [data-community-enlarge]').forEach(e => e.hidden = false);
    study.querySelectorAll('.community-interactive').forEach(art => {
      art.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse') return;
        const name = event.target.closest('[data-layer]')?.dataset.layer;
        if (name && name !== 'background') previewLayer(name, art.parentElement);
        else clearActive();
      });
      art.addEventListener('pointerleave', clearActive);
    });
    study.querySelectorAll('[data-preview-layer]').forEach(button => {
      for (const event of ['pointerenter', 'focus', 'click']) button.addEventListener(event, () => previewLayer(button.dataset.previewLayer));
      for (const event of ['pointerleave', 'blur']) button.addEventListener(event, clearActive);
    });
    choice.addEventListener('change', colourChoice);
    colour.addEventListener('input', () => {
      const variable = `--community-${choice.value}`;
      colourChanges.set(variable, colour.value); study.style.setProperty(variable, colour.value);
      status.textContent = `${choice.selectedOptions[0].textContent} changed to ${colour.value.toUpperCase()}.`;
    });
    study.querySelector('#community-motion').addEventListener('change', event => { study.dataset.motion = String(event.target.checked); clearActive(); });
    study.querySelector('#community-reset').addEventListener('click', reset);
    texture.addEventListener('change', updateTexture);
    strength.addEventListener('input', updateTexture);
    mode.addEventListener('change', updateCompare);
    slider.addEventListener('input', updateCompare);
    version.addEventListener('change', updateCompare);
    study.querySelectorAll('[data-community-download]').forEach(link => link.addEventListener('click', event => {
      event.preventDefault(); download(link.dataset.communityDownload, link).catch(() => { status.textContent = 'Could not export your changes. The original SVG is still available from the image link.'; });
    }));
    study.querySelectorAll('[data-community-enlarge]').forEach(button => button.addEventListener('click', () => {
      clearActive();
      const kind = button.dataset.communityEnlarge;
      const clone = study.querySelector(`[data-art="${kind}"]`).cloneNode(true);
      clone.classList.remove('community-interactive');
      clone.querySelectorAll('svg').forEach(svg => svg.replaceWith(uniqueSVG(svg)));
      study.querySelector('#community-dialog-body').replaceChildren(clone);
      study.querySelector('#community-dialog-title').textContent = { original: 'Original illustration', flat: 'Clean SVG', textured: 'SVG with grain' }[kind];
      dialog.showModal();
    }));
    study.querySelector('#community-dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
    dialog.addEventListener('close', () => study.querySelector('#community-dialog-body').replaceChildren());
  }
  init().catch(() => {
    status.textContent = 'The static artwork is available. Reload the page to retry the interactive controls.';
  });
})();
