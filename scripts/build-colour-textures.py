"""Build repeatable, seamless texture tiles for the Colour Testing page.

Requires numpy and Pillow. Run from the repository root.
"""
from pathlib import Path
import numpy as np
from PIL import Image

size = 320
destination = Path('assets/colour-testing')
destination.mkdir(exist_ok=True)
rng = np.random.default_rng(20261105)
noise = rng.normal(size=(size, size))
fy, fx = np.meshgrid(np.fft.fftfreq(size), np.fft.fftfreq(size), indexing='ij')


def soften(field, horizontal, vertical=None):
    vertical = horizontal if vertical is None else vertical
    kernel = np.exp(-2 * np.pi**2 * ((fx * horizontal)**2 + (fy * vertical)**2))
    return np.fft.ifft2(np.fft.fft2(field) * kernel).real


def normalise(field):
    return (field - field.mean()) / max(field.std(), .0001)


fine = normalise(noise)
grain = normalise(soften(noise, .7))
paper = normalise(soften(noise, 2))
cloud = normalise(soften(noise, 14))
bloom = normalise(soften(noise, 32))
fibres = normalise(soften(noise, .5, 6))
horizontal = normalise(soften(noise, 8, .4))
speckles = (rng.random((size, size)) > .967).astype(float)
speckles = normalise(soften(speckles, .5))
yy, xx = np.mgrid[:size, :size]
linen = (np.sin(xx * np.pi / 3.2) + np.sin(yy * np.pi / 3.2)) / 2
diagonal = np.sin((xx + yy) * np.pi / 8)
fields = [
    fine * 13,
    grain * 21,
    grain * 20 + cloud * 13,
    paper * 28 + fine * 7,
    paper * 28 + cloud * 20,
    grain * 17 + cloud * 24 + bloom * 10,
    fibres * 30 + fine * 11,
    horizontal * 26 + grain * 11,
    speckles * -28 + cloud * 7,
    speckles * 29 + grain * 10,
    linen * 30 + fine * 14,
    diagonal * 17 + grain * 14,
    bloom * 34 + cloud * 10,
    np.abs(paper) * -35 + grain * 12,
    normalise(np.maximum(paper, .7)) * -30 + cloud * 9,
    (grain - normalise(soften(noise, 3))) * 32 + cloud * 15,
    paper * 16 + cloud * 18 + fine * 9,
    fibres * 17 + cloud * 13 + fine * 16,
    grain * 13 + cloud * 8,
    grain * 25 + cloud * 18 + bloom * 7,
]
for number, field in enumerate(fields, 1):
    pixels = np.clip(128 + field, 0, 255).astype('uint8')
    Image.fromarray(pixels).save(destination / f'texture-{number:02}.webp', lossless=True)
print(f'Built {len(fields)} seamless texture tiles.')
