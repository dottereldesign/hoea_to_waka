"""Render the grouped brand palette and its optional tonal extensions."""
from pathlib import Path
import json,re,hashlib
p=Path('assets/colour-testing/palette.json')
d=json.loads(p.read_text(encoding='utf-8'))
lookup={c['name']:c for c in d['colours']+d['neutrals']}
def mix(a,b,amount):
 return '#'+''.join(f'{round(int(a[i:i+2],16)*(1-amount)+int(b[i:i+2],16)*amount):02X}' for i in (1,3,5))
def ink(h):
 rgb=[int(h[i:i+2],16)/255 for i in (1,3,5)]
 lum=sum((v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4)*w for v,w in zip(rgb,[.2126,.7152,.0722]))
 return '#191919' if (lum+.05)/(.009721+.05) >= (1.05/(lum+.05)) else '#FFFFFF'
def tile(name):
 h=lookup[name]['hex']
 return f'<button class="palette-swatch" type="button" data-copy="{h}" aria-label="Copy {name}, {h}"><span class="palette-swatch__colour" style="background:{h}" aria-hidden="true"></span><span class="palette-swatch__name">{name}</span><span class="palette-swatch__hex">{h}</span></button>'
def ramp(name):
 c=lookup[name];base=c['hex'];tones=[('100',mix(base,'#FFFFFF',.75)),('300',mix(base,'#FFFFFF',.4)),('500',base),('700',mix(base,'#191919',.25)),('900',mix(base,'#191919',.5))]
 c['tones']=[{'step':step,'hex':h,'base':step=='500'} for step,h in tones]
 return '<div class="palette-ramp"><h4>'+name+'</h4><div class="palette-ramp__tones">'+''.join(f'<button class="palette-tone{" palette-tone--base" if step=="500" else ""}" type="button" data-copy="{h}" style="background:{h};color:{ink(h)}" aria-label="Copy {name} {step}{", original" if step=="500" else ""}, {h}"><span>{step}{" · Original" if step=="500" else ""}</span><span>{h}</span></button>' for step,h in tones)+'</div></div>'
blocks=[]
for g in d['groups']:
 extended=g['id'] in ['core','supporting']
 content=''.join(ramp(n) if extended else tile(n) for n in g['colours'])
 blocks.append(f'<article class="brand-palette-group{" brand-palette-group--extended" if extended else ""}" id="{g["id"]}" aria-labelledby="{g["id"]}-title"><header><h3 id="{g["id"]}-title">{g["name"]}</h3><p>{g["purpose"]}</p></header><div class="{"palette-ramps" if extended else "brand-palette-swatches"}">{content}</div></article>')
section='<section id="palette" aria-labelledby="palette-title"><header class="palette-section-heading"><h2 id="palette-title">Brand colour palette</h2><p>500 is the original colour. Click any shade to copy its hex code.</p></header><div class="brand-palette-groups">'+''.join(blocks)+'</div></section>'
d['toneMethod']='100 and 300 mix the original with 75% and 40% Paper; 500 is the unchanged original; 700 and 900 mix with 25% and 50% Logo black. These tonal extensions do not replace existing site colours.'
p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=Path('colour-testing/index.html');s=p.read_text(encoding='utf-8');s=re.sub(r'<section id="palette".*?</section>',section,s,count=1,flags=re.S)
v=hashlib.sha256(Path('assets/colour-testing/palette-lab.css').read_bytes()).hexdigest()[:10]
s=re.sub(r'assets/colour-testing/palette-lab.css(?:\?v=[^"\s]+)?','assets/colour-testing/palette-lab.css?v='+v,s)
p.write_text(s,encoding='utf-8')
