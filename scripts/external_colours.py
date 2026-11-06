from pathlib import Path
import json,html,colorsys

def render_external_colours():
 data=json.loads(Path('assets/colour-testing/external-colours.json').read_text(encoding='utf-8'))
 groups=[]
 for group in data['groups']:
  colours=sorted(group['colours'],key=lambda c:sum(int(c['hex'][i:i+2],16)*w for i,w in zip((1,3,5),(.2126,.7152,.0722))),reverse=True)
  tiles=[]
  for c in colours:
   h=c['hex'];name=c['name']
   if name=='Example interface colour':
    r,g,b=[int(h[i:i+2],16)/255 for i in (1,3,5)];hue,s,v=colorsys.rgb_to_hsv(r,g,b)
    name=('Light grey' if v>.65 else 'Dark grey') if s<.12 else ['Red','Orange','Yellow','Green','Green','Teal','Cyan','Blue','Blue','Purple','Pink','Red'][min(11,int(hue*12))]
   tiles.append(f'<article class="site-colour-card"><button class="palette-swatch" type="button" data-copy="{h}" aria-label="Copy {html.escape(group["name"])} {html.escape(name)}, {h}"><span class="palette-swatch__colour" style="background:{h}" aria-hidden="true"></span><span class="palette-swatch__name">{html.escape(name)}</span><span class="palette-swatch__hex">{h}</span></button></article>')
  groups.append(f'<details class="external-colour-group"><summary>{html.escape(group["name"])} <span>{len(colours)} colours</span></summary><a class="external-colour-location" href="{html.escape(group["anchor"])}">{html.escape(group["label"])}</a><div class="palette-grid site-colour-grid">'+''.join(tiles)+'</div></details>')
 return '<section id="external-colours" aria-labelledby="external-colours-title"><h3 class="site-colours-subheading" id="external-colours-title">External colours</h3><p>Colours used in the Amazon button and the browser, email and social examples. Separate from our brand palette and excluded from the interface colour total. Shared brand colours and transparency blends are omitted. These document our mockups, not official platform colour specifications.</p>'+''.join(groups)+'</section>'

if __name__=='__main__':
 import re
 p=Path('design/brand-palette-content.html');s=p.read_text(encoding='utf-8');s=re.sub(r'<section id="external-colours"[\s\S]*?</section>',lambda _:render_external_colours(),s,count=1);p.write_text(s,encoding='utf-8')
