import downloads from '../assets/brand-downloads/manifest.json';

export function setupBrandDownloads() {
  document.querySelectorAll('[data-asset-download]').forEach(card => {
    const kind = card.dataset.assetDownload;
    const config = kind === 'favicon' ? downloads.favicon : downloads.artwork[kind];
    const fields = card.querySelector('.brand-download-fields');
    const format = card.querySelector('[data-asset-format]');
    const colour = card.querySelector('[data-asset-colour]');
    const size = card.querySelector('[data-asset-size]');
    const link = card.querySelector('[data-asset-link]');
    const update = () => {
      if (!config.formats.includes(format.value)) return;
      const raster = ['png', 'webp', 'jpg'].includes(format.value);
      card.querySelector('[data-asset-size-label]').hidden = !raster;
      const variant = colour ? '-' + colour.value : '';
      const file = `hoea-to-waka-${kind}${variant}${raster ? '-' + size.value : ''}.${format.value}`;
      link.href = '../../assets/brand-downloads/' + file;
      link.download = file;
      link.querySelector('span').textContent = `Download ${format.value.toUpperCase()}${raster ? ' · ' + size.value + 'px' : format.value === 'ico' ? ' · multi-size' : ''}`;
      link.setAttribute('aria-label', `${link.textContent.trim()} ${kind === 'favicon' ? 'website icon' : (colour.value + ' ' + kind + ' logo')}`);
    };
    fields.hidden = false;
    fields.addEventListener('change', update);
    update();
  });
}
