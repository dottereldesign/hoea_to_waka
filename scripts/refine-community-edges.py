"""Snap visible hand-authored boundaries to nearby reference colour edges.

No automatic segmentation of the illustration: layers and occlusion come from
the authored SVG. Searches at most 12 source pixels along each boundary normal,
rejects weak/conflicting edges, smooths offsets and simplifies to Bezier curves.
Inspect the saved overlay before accepting the output. Requires numpy/Pillow.
"""
from pathlib import Path
import json
import subprocess
import xml.etree.ElementTree as ET
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)
tree = ET.parse(ROOT / 'assets/colour-testing/community.svg')
root = tree.getroot()
shapes = [e for e in root.iter() if e.tag.split('}')[-1] in ('path', 'circle', 'ellipse') and e.get('fill') != 'none']
fills = [e.get('fill') for e in shapes]
def render(source, target):
    subprocess.run(['node', '-e', "require('sharp')(process.argv[1]).png().toFile(process.argv[2])", str(source), str(target)], cwd=ROOT, check=True)
render(ROOT / 'assets/colour-testing/community.svg', ROOT / 'tmp/community-before-edges.png')
for i, shape in enumerate(shapes): shape.set('fill', f'#{i+1:06x}')
tree.write(ROOT / 'tmp/community-mask.svg', encoding='unicode')
render(ROOT / 'tmp/community-mask.svg', ROOT / 'tmp/community-mask.png')
mask = np.asarray(Image.open(ROOT / 'tmp/community-mask.png').convert('RGB'), dtype=int)
ids = mask[:, :, 0]*65536 + mask[:, :, 1]*256 + mask[:, :, 2]
ref = np.asarray(Image.open(ROOT / 'assets/colour-testing/reference.png').convert('RGB').filter(ImageFilter.GaussianBlur(1.1)), float)
art = np.asarray(Image.open(ROOT / 'tmp/community-before-edges.png').convert('RGB').filter(ImageFilter.GaussianBlur(.7)), float)
contours = json.loads((ROOT / 'tmp/community-contours.json').read_text())
def sample(image, coords):
    xy = np.rint(coords).astype(int)
    return image[np.clip(xy[..., 1], 0, 1447), np.clip(xy[..., 0], 0, 1085)]
def simplify(points, tolerance=.65):
    if len(points) <= 2: return points
    a, b = points[0], points[-1]
    v = b-a
    projection = np.clip(((points-a) @ v) / max(v@v, 1e-9), 0, 1)
    distance = np.linalg.norm(points-a-projection[:, None]*v, axis=1)
    index = np.argmax(distance)
    if distance[index] <= tolerance: return points[[0, -1]]
    return np.concatenate((simplify(points[:index+1], tolerance)[:-1], simplify(points[index:], tolerance)))
report = []
for index, (shape, fill, points) in enumerate(zip(shapes, fills, contours)):
    shape.set('fill', fill)
    if index == 0: continue  # The rectangular artboard is intentionally fixed.
    p = np.array(points)
    tangent = np.roll(p, -1, 0)-np.roll(p, 1, 0)
    normal = np.stack([-tangent[:, 1], tangent[:, 0]], 1)
    normal /= np.maximum(np.linalg.norm(normal, axis=1, keepdims=True), .00001)
    plus, minus = sample(ids, p+normal*4), sample(ids, p-normal*4)
    visible = ((plus == index+1) | (minus == index+1)) & (plus != minus)
    # A later painted region is an occluder, not this path's own edge. Without
    # this rule a hidden sun ring can incorrectly snap to a shoulder or hand.
    visible &= (plus <= index+1) & (minus <= index+1)
    expected = sample(art, p+normal*4)-sample(art, p-normal*4)
    contrast = np.linalg.norm(expected, axis=1)
    direction = expected / np.maximum(contrast[:, None], 1)
    candidates = np.arange(-12, 12.01, .5)
    probe = p[:, None, :] + normal[:, None, :] * candidates[None, :, None]
    gradient = sample(ref, probe+normal[:, None, :]*1.5)-sample(ref, probe-normal[:, None, :]*1.5)
    score = np.sum(gradient*direction[:, None, :], axis=2)
    # Distance prior avoids snapping to a different adjacent contour.
    score -= np.abs(candidates)[None, :] * .16
    best = score.argmax(axis=1)
    offsets = candidates[best]
    accepted = visible & (contrast > 20) & (score[np.arange(len(p)), best] > 12)
    if accepted.sum() < 8: continue
    # Interpolate through occluded stretches. Resetting these offsets to zero
    # creates notches where a visible contour emerges from behind another layer.
    accepted_indices = np.flatnonzero(accepted)
    offsets = np.interp(np.arange(len(p)), np.concatenate([accepted_indices-len(p), accepted_indices, accepted_indices+len(p)]), np.tile(offsets[accepted], 3))
    offsets = np.median(np.stack([np.roll(offsets, i) for i in [-2,-1,0,1,2]]), axis=0)
    offsets = sum(np.roll(offsets, i)*(6-abs(i)) for i in range(-5,6))/36
    adjusted = p + normal*offsets[:, None]
    # Split the closed contour before RDP, then use conservative cubic tangents.
    mid = len(p)//2
    q = np.concatenate([simplify(adjusted[:mid+1])[:-1], simplify(np.concatenate([adjusted[mid:], adjusted[:1]]))[:-1]])
    segments = [f'M{q[0,0]:.2f} {q[0,1]:.2f}']
    for k in range(len(q)):
        a, b, c, d = q[(k-1)%len(q)], q[k], q[(k+1)%len(q)], q[(k+2)%len(q)]
        # Short handles avoid rounding off sharp joins and cloth corners.
        tangent1, tangent2 = c-a, d-b
        length = np.linalg.norm(c-b)
        first = b+tangent1/max(np.linalg.norm(tangent1), 1e-9)*length/3
        second = c-tangent2/max(np.linalg.norm(tangent2), 1e-9)*length/3
        segments.append('C'+' '.join(f'{v:.2f}' for v in [*first, *second, *c]))
    shape.tag = f'{{{NS}}}path'
    for attribute in ('cx','cy','r','rx','ry'): shape.attrib.pop(attribute, None)
    shape.set('d', ' '.join(segments)+'Z')
    report.append({'shape': index, 'adjustedSamples': int(accepted.sum()), 'maxShift': round(float(abs(offsets).max()), 2), 'curveSegments': len(q)})
ET.indent(tree, space='  ')
tree.write(ROOT / 'tmp/community-edge-refined.svg', encoding='unicode')
(ROOT / 'tmp/community-edge-refinement.json').write_text(json.dumps(report, indent=2))
print('Refined visible boundaries of', len(report), 'shapes. Review before adopting.')
