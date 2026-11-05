"""Build the second colour study from measured reference texture statistics.

Requires numpy, Pillow and the project's sharp dependency. No patches are tiled
or pasted into the new artwork: smoothed frequency power is given new random
phases over each full surface. The reference is only read, never changed.
"""
from pathlib import Path
import json
import re
import subprocess
import tempfile

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'assets/colour-testing'
reference = np.asarray(Image.open(DEST / 'reference.png').convert('RGB'), dtype=float)
palette = json.loads((DEST / 'palette.json').read_text())['colours']
# Centres of clean interior areas, checked enlarged against the reference.
centres = [(72, 72), (240, 467), (187, 867), (212, 582), (847, 557),
           (300, 1080), (432, 812), (940, 980), (820, 1140), (950, 780),
           (542, 256), (540, 332), (545, 405), (550, 476)]


def normalise(a):
    return (a - a.mean()) / max(a.std(), 1e-8)


def blur(a, radius):
    fy = np.fft.fftfreq(a.shape[0])[:, None]
    fx = np.fft.fftfreq(a.shape[1])[None, :]
    return np.fft.ifft2(np.fft.fft2(a) * np.exp(-2 * np.pi**2 * radius**2 * (fx*fx + fy*fy))).real


def measure(centre, size=64):
    x, y = centre
    half = size // 2
    patch = reference[y-half:y+half, x-half:x+half]
    yy, xx = np.meshgrid(np.linspace(-1, 1, size), np.linspace(-1, 1, size), indexing='ij')
    plane = np.stack([np.ones_like(xx), xx, yy], axis=-1).reshape(-1, 3)
    residual = patch.reshape(-1, 3) - plane @ np.linalg.lstsq(plane, patch.reshape(-1, 3), rcond=None)[0]
    eigenvalues, eigenvectors = np.linalg.eigh(np.cov(residual.T))
    direction = eigenvectors[:, -1]
    if direction.sum() < 0:
        direction *= -1
    pigment = (residual @ direction).reshape(size, size)
    assert np.max(np.std(residual, axis=0)) < 7, 'Sample contains a shape boundary; choose a clean interior.'
    window = np.outer(np.hanning(size), np.hanning(size))
    power = np.abs(np.fft.fft2(normalise(pigment) * window))**2
    # Smooth the estimate so the small sample cannot imprint a repeating motif.
    power = np.maximum(blur(power, 1.1), 1e-6)
    return power, direction * np.sqrt(eigenvalues[-1]), patch.mean(axis=(0, 1)), pigment


def synthesize(power, shape, seed):
    rng = np.random.default_rng(seed)
    frequencies = np.linspace(-.5, .5, power.shape[0] + 1)
    extended = np.pad(np.fft.fftshift(power), ((0, 1), (0, 1)), mode='wrap')
    xfreq = np.fft.fftshift(np.fft.fftfreq(shape[1]))
    yfreq = np.fft.fftshift(np.fft.fftfreq(shape[0]))
    along_x = np.array([np.interp(xfreq, frequencies, row) for row in extended])
    interpolated = np.array([np.interp(yfreq, frequencies, column) for column in along_x.T]).T
    spectrum = np.fft.fft2(rng.normal(size=shape))
    field = np.fft.ifft2(spectrum * np.sqrt(np.fft.ifftshift(interpolated))).real
    # Slowly changing density produces quieter and busier pigment patches.
    density = np.clip(1 + .13 * normalise(blur(rng.normal(size=shape), 19)), .65, 1.35)
    return normalise(normalise(field) * density)


def tint(field, colour, weights):
    return np.clip(np.array(colour) + field[..., None] * weights, 0, 255)


def save(pixels, name):
    Image.fromarray(np.rint(pixels).astype('uint8')).save(DEST / name, lossless=True, method=6)


def correlation(field):
    return float(np.corrcoef(field[:, :-1].ravel(), field[:, 1:].ravel())[0, 1])


html = (ROOT / 'colour-testing/index.html').read_text(encoding='utf-8')
first_card = html.split('id="texture-01"', 1)[1]
scene_svg = re.search(r'<svg viewBox="0 0 600 360".*?</svg>', first_card).group(0)
scene_svg = scene_svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" ', 1)
with tempfile.TemporaryDirectory() as temp:
    source = Path(temp) / 'scene.svg'
    target = Path(temp) / 'scene.png'
    source.write_text(scene_svg, encoding='utf-8')
    subprocess.run(['node', '-e', "require('sharp')(process.argv[1]).removeAlpha().png().toFile(process.argv[2])", str(source), str(target)], cwd=ROOT, check=True)
    base = np.asarray(Image.open(target).convert('RGB'), dtype=float)

scene = base.copy()
metadata = []
for index, (colour, centre) in enumerate(zip(palette, centres)):
    slug = colour['name'].lower().replace(' ', '-')
    rgb = [int(colour['hex'][j:j+2], 16) for j in (1, 3, 5)]
    power, weights, local_mean, measured = measure(centre, 48 if index >= 12 else 64)
    field = synthesize(power, (720, 1200), 20261106 + index * 307)
    selected = np.all(base == rgb, axis=-1)
    tinted = tint(field, rgb, weights)
    scene[selected] = tinted[selected]
    # Every swatch contains a different continuous part of its own full field.
    save(tinted[104:616, 344:856], f'refined-{slug}.webp')
    # Six controlled comparison samples use the reference patch's mean colour
    # so a small palette-sampling difference does not distract from the grain.
    if index in (0, 2, 3, 4, 6, 10):
        save(tint(field[104:616, 344:856], local_mean, weights), f'comparison-{slug}.webp')
        metadata.append({'name': colour['name'], 'slug': slug, 'centre': centre,
                         'mean': np.round(local_mean, 3).tolist(),
                         'referenceCorrelation': round(correlation(measured), 3),
                         'generatedCorrelation': round(correlation(field), 3)})
    if index == 2:
        # Full-size neutral grain for reuse as a soft-light texture layer.
        save(np.clip(128 + field * 24, 0, 255), 'refined-grain.webp')
save(scene, 'refined-scene.webp')
(DEST / 'refinement.json').write_text(json.dumps({
    'method': 'Smoothed reference frequency power, new random phases, gently varying pigment density. Full-size surfaces; no repeated tiles.',
    'comparisons': metadata
}, indent=2) + '\n', encoding='utf-8')
print('Built the full scene, 14 colour surfaces, 6 comparison samples and a reusable grain layer.')
for item in metadata:
    print(f"{item['name']}: adjacent-pixel correlation reference={item['referenceCorrelation']}, new={item['generatedCorrelation']}")
