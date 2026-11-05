"""Portrait-sized continuation of the existing refined pigment experiment.

Uses the same spectral synthesis method as build-colour-refinement.py, with a
new seed and a full 1086 by 1448 field so it is not stretched or tiled.
"""
from pathlib import Path
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1]
reference = np.asarray(Image.open(root / 'assets/colour-testing/reference.png').convert('RGB'), float)
sample = reference[835:899, 155:219].mean(axis=2)
def normal(a): return (a-a.mean())/max(a.std(), 1e-8)
def blur(a, radius):
    fy, fx = np.fft.fftfreq(a.shape[0])[:,None], np.fft.fftfreq(a.shape[1])[None,:]
    return np.fft.ifft2(np.fft.fft2(a)*np.exp(-2*np.pi**2*radius**2*(fx*fx+fy*fy))).real
power = abs(np.fft.fft2(normal(sample)*np.outer(np.hanning(64),np.hanning(64))))**2
power = np.maximum(blur(power,1.1),1e-6)
extended = np.pad(np.fft.fftshift(power),((0,1),(0,1)),mode='wrap')
frequencies = np.linspace(-.5,.5,65)
along = np.array([np.interp(np.fft.fftshift(np.fft.fftfreq(1086)),frequencies,row) for row in extended])
interpolated = np.array([np.interp(np.fft.fftshift(np.fft.fftfreq(1448)),frequencies,col) for col in along.T]).T
rng = np.random.default_rng(20261106)
field = np.fft.ifft2(np.fft.fft2(rng.normal(size=(1448,1086)))*np.sqrt(np.fft.ifftshift(interpolated))).real
density = np.clip(1+.13*normal(blur(rng.normal(size=field.shape),19)),.65,1.35)
pixels = np.rint(np.clip(128+normal(normal(field)*density)*24,0,255)).astype('uint8')
Image.fromarray(pixels).save(root / 'assets/colour-testing/community-grain.webp',lossless=True,method=6)
print('Created full-size portrait grain with new phases and no repeated tiles.')
