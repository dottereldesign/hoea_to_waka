"""One-time colour fitting for the hand-drawn community SVG.

Run with an input SVG and an output SVG. Never traces geometry: visible region
masks come from the hand-authored paths. Requires numpy, Pillow and sharp.
Excludes boundaries and colour outliers before fitting gentle linear gradients.
"""
from pathlib import Path
import json
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
(ROOT / 'tmp').mkdir(exist_ok=True)
source = ROOT / (sys.argv[1] if len(sys.argv) > 1 else 'assets/colour-testing/community.svg')
output = ROOT / (sys.argv[2] if len(sys.argv) > 2 else 'tmp/community-fitted.svg')
NS = 'http://www.w3.org/2000/svg'
ET.register_namespace('', NS)
tree = ET.parse(source)
root = tree.getroot()
shapes = [e for e in root.iter() if e.tag.split('}')[-1] in ('path', 'circle', 'ellipse') and e.get('fill') != 'none']
old_fills = [s.get('fill') for s in shapes]
for i, shape in enumerate(shapes):
    shape.set('fill', f'#{i+1:06x}')
with tempfile.TemporaryDirectory() as temporary:
    mask_svg, mask_png = Path(temporary) / 'mask.svg', Path(temporary) / 'mask.png'
    tree.write(mask_svg, encoding='unicode')
    subprocess.run(['node', '-e', "require('sharp')(process.argv[1]).png().toFile(process.argv[2])", str(mask_svg), str(mask_png)], cwd=ROOT, check=True)
    rgb = np.asarray(Image.open(mask_png).convert('RGB'), dtype=int)
    ids = rgb[:, :, 0]*65536 + rgb[:, :, 1]*256 + rgb[:, :, 2]
reference = np.asarray(Image.open(ROOT / 'assets/colour-testing/reference.png').convert('RGB'), dtype=float)
defs = root.find(f'{{{NS}}}defs')
report = []
parents = {child: parent for parent in root.iter() for child in parent}
for index, (shape, old_fill) in enumerate(zip(shapes, old_fills)):
    shape.set('fill', old_fill)
    mask = ids == index+1
    for _ in range(5):
        mask[0, :] = mask[-1, :] = False
        mask[:, 0] = mask[:, -1] = False
        mask = mask & np.roll(mask, 1, 0) & np.roll(mask, -1, 0) & np.roll(mask, 1, 1) & np.roll(mask, -1, 1)
    y, x = np.nonzero(mask)
    if len(x) < 80:
        continue
    colours = reference[y, x]
    median = np.median(colours, axis=0)
    keep = np.max(np.abs(colours - median), axis=1) < 24
    x, y, colours = x[keep], y[keep], colours[keep]
    if len(x) < 80:
        continue
    cx, cy = x.mean(), y.mean()
    coords = np.stack([np.ones(len(x)), (x-cx)/1086, (y-cy)/1448], axis=1)
    fit = np.linalg.lstsq(coords, colours, rcond=None)[0]
    # A single linear gradient captures the dominant broad colour change.
    u, singular, vh = np.linalg.svd(fit[1:])
    direction = u[:, 0]
    projection = coords[:, 1:] @ direction
    low, high = np.quantile(projection, [.01, .99])
    stops = np.clip(np.array([fit[0] + p * singular[0] * vh[0] for p in (low, high)]), 0, 255).round().astype(int)
    layer, part = '', shape.get('data-part', '')
    node = shape
    while node in parents:
        node = parents[node]
        layer = node.get('data-layer', layer)
        part = node.get('data-part', part)
    variable = '--community-' + shape.get('data-colour', f'{layer}-{part}'.rstrip('-'))
    gradient_id = f'paint-{index:02}'
    # Convert the gradient direction to isotropic user coordinates.
    axis = direction / np.array([1086, 1448])
    scale = axis @ axis
    start = np.array([cx, cy]) + low * axis / scale
    end = np.array([cx, cy]) + high * axis / scale
    gradient = ET.SubElement(defs, f'{{{NS}}}linearGradient', {
        'id': gradient_id, 'gradientUnits': 'userSpaceOnUse',
        'x1': f'{start[0]:.2f}', 'y1': f'{start[1]:.2f}',
        'x2': f'{end[0]:.2f}', 'y2': f'{end[1]:.2f}',
    })
    for offset, colour in zip(('0', '1'), stops):
        hex_colour = '#' + ''.join(f'{int(v):02X}' for v in colour)
        ET.SubElement(gradient, f'{{{NS}}}stop', {'offset': offset, 'stop-color': f'var({variable}, {hex_colour})'})
    shape.set('fill', f'url(#{gradient_id})')
    report.append({'shape': index, 'layer': layer, 'part': part, 'pixels': len(x), 'stops': stops.tolist()})
# Remove unused authored gradients; named groups and all paths remain intact.
used = {e.get('fill') for e in shapes}
seen = set()
for gradient in reversed(list(defs)):
    identifier = gradient.get('id')
    if f"url(#{identifier})" not in used or identifier in seen:
        defs.remove(gradient)
    seen.add(identifier)
ET.indent(tree, space='  ')
tree.write(output, encoding='unicode', xml_declaration=False)
(ROOT / 'tmp/community-colour-fit.json').write_text(json.dumps(report, indent=2))
print(f'Fitted {len(report)} colour regions; geometry unchanged. Wrote {output.name}.')
