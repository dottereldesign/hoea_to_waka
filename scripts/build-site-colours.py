from pathlib import Path
import json,collections,colorsys,html,urllib.parse,re
pages=json.loads(Path('tmp/other-site-colours-audit.json').read_text(encoding='utf-8'));pal=json.loads(Path('assets/colour-testing/palette.json').read_text());exclude={c['hex'].upper() for c in pal['colours']+pal['neutrals']}|{'#EDF1F3','#605E5E','#F5F3EE','#F8F8F6','#202020','#202329'}
found={}
for page in pages:
 for row in page['rows']:
  h=row['hex']
  if h in exclude:continue
  c=found.setdefault(h,{'hex':h,'interface':False,'uses':[]});c['interface']|=row['kind']=='Interface'
  heading=row['heading'];anchor=row['id']
  if heading=='Navigation':fragment='#page-top'
  elif anchor and anchor not in ['main-content','page-top']:fragment='#'+urllib.parse.quote(anchor)
  else:fragment='#:~:text='+urllib.parse.quote(heading,safe='')
  loc={'page':page['label'],'section':heading,'href':'../'+page['route']+fragment,'kind':row['kind']}
  if loc not in c['uses']:c['uses'].append(loc)
named={'#1C5C49':'FAQ green','#E8E0FF':'Resources lavender','#F1EAFA':'Announcement lavender','#061628':'Night-sky navy','#0D4687':'Ocean blue','#7FAF9C':'FAQ divider green','#181818':'Navigation black','#666666':'Homepage grey','#E0E0E0':'Homepage divider grey','#514656':'Muted plum','#243A53':'Brand ocean','#E6DBE9':'Pale lavender','#D8CBDD':'Lavender','#033D4F':'Deep blue'}
families=['Neutrals','Warm colours','Greens','Teals','Blues','Purples & pinks']
def family(h):
 r,g,b=[int(h[i:i+2],16)/255 for i in (1,3,5)];hue,s,v=colorsys.rgb_to_hsv(r,g,b);hue*=360
 if s<.035:return 'Neutrals'
 if hue<70 or hue>=345:return 'Warm colours'
 if hue<165:return 'Greens'
 if hue<200:return 'Teals'
 if hue<255:return 'Blues'
 return 'Purples & pinks'
def lightness(h):
 rgb=[int(h[i:i+2],16)/255 for i in (1,3,5)];rgb=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb];return sum(v*w for v,w in zip(rgb,[.2126,.7152,.0722]))
def colourname(h):
 if h in named:return named[h]
 f=family(h);L=lightness(h)
 if f=='Neutrals':return 'Light grey' if L>.5 else 'Mid grey' if L>.15 else 'Dark grey'
 hue,s,v=colorsys.rgb_to_hsv(*[int(h[i:i+2],16)/255 for i in (1,3,5)])
 name={'Warm colours':'Coral' if hue<.05 or hue>.95 else 'Gold' if hue>.12 else 'Orange','Greens':'Green','Teals':'Teal','Blues':'Blue','Purples & pinks':'Pink' if hue>.84 else 'Purple'}[f]
 return ('Deep '+name.lower()) if L<.08 else ('Pale '+name.lower()) if L>.65 else ('Soft '+name.lower()) if s<.35 else name
for c in found.values():c['name']=colourname(c['hex']);c['family']=family(c['hex']);c['group']='Interface' if c.pop('interface') else 'Artwork'
for c in found.values():
 if c['hex'] in {'#DB6F09','#FFD814'}:c['group']='External';c['brand']='Amazon'
colours=sorted(found.values(),key=lambda c:(c['group']!='Interface',families.index(c['family']),-lightness(c['hex'])))
Path('assets/colour-testing/site-colours.json').write_text(json.dumps({'scope':'Rendered default desktop pages, including inline and image-based SVG colours. Excludes photo pixels, transparency blends, and colours already in the illustration or neutral palettes.','colours':colours},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def tile(c):
 h=c['hex'];links=[];seen=set()
 for u in c['uses']:
  if u['href'] in seen:continue
  seen.add(u['href']);label=u['page']+' · '+u['section'];short=label if len(label)<=42 else label[:39]+'…';links.append('<a href="'+html.escape(u['href'])+'" title="'+html.escape(label)+'">'+html.escape(short)+'</a>')
 return '<article class="site-colour-card"><button class="palette-swatch" type="button" data-copy="'+h+'" aria-label="Copy '+html.escape(c['name'])+', '+h+'"><span class="palette-swatch__colour" style="background:'+h+'" aria-hidden="true"></span><span class="palette-swatch__name">'+html.escape(c['name'])+'</span><span class="palette-swatch__hex">'+h+'</span></button><div class="site-colour-uses"><span>Used in</span>'+''.join(links[:2])+('<details><summary>'+str(len(links)-2)+' more locations</summary>'+''.join(links[2:])+'</details>' if len(links)>2 else '')+'</div></article>'
ui=[c for c in colours if c['group']=='Interface'];art=[c for c in colours if c['group']=='Artwork'];external=[c for c in colours if c['group']=='External']
external_section='<section id="external-colours" aria-labelledby="external-colours-title"><h3 class="site-colours-subheading" id="external-colours-title">External colours</h3><p>Third-party button colours, separate from the Hoea tō Waka brand palette and excluded from the interface colour total.</p><div class="site-colour-family"><h4>Amazon</h4><div class="palette-grid site-colour-grid">'+''.join(tile(c) for c in external)+'</div></div></section>' if external else ''
def groups(items,prefix):
 return ''.join('<div class="site-colour-family" id="'+prefix+'-'+str(i)+'"><h4>'+html.escape(f)+'</h4><div class="palette-grid site-colour-grid">'+''.join(tile(c) for c in items if c['family']==f)+'</div></div>' for i,f in enumerate(families) if any(c['family']==f for c in items))
merges=json.loads(Path('design/colour-consolidation.json').read_text())['replacements']
merge_list='<details class="site-colour-merges"><summary>'+str(len(merges))+' close colours consolidated</summary><p>These replacements have been applied across the website.</p><ul>'+''.join('<li><span class="merge-dot" style="background:'+old+'"></span><code>'+old+'</code><span aria-label="replaced with"> → </span><span class="merge-dot" style="background:'+new+'"></span><code>'+new+'</code></li>' for old,new in merges.items())+'</ul></details>'
section='<section id="other-site-colours" aria-labelledby="other-colours-title"><header class="palette-section-heading"><div><p class="palette-eyebrow">Also on the website</p><h2 id="other-colours-title">Other colours in use</h2></div><p>Grouped by colour family, from light to dark.</p></header><p class="palette-note site-colours-intro">Additional colours from the main pages, excluding your illustration and neutral palettes. Follow the small links to see each colour in use.</p>'+merge_list+'<h3 class="site-colours-subheading">Interface colours <span>'+str(len(ui))+'</span></h3><nav class="colour-family-nav" aria-label="Interface colour families">'+''.join('<a href="#site-ui-'+str(i)+'">'+html.escape(f)+'</a>' for i,f in enumerate(families) if any(c['family']==f for c in ui))+'</nav>'+groups(ui,'site-ui')+external_section+'<details class="site-artwork-colours"><summary>SVG artwork shades <span>'+str(len(art))+'</span></summary><p>Additional fills and gradient stops, also grouped by family and ordered light to dark. Photo pixels and transparency blends are excluded.</p>'+groups(art,'site-art')+'</details></section>'
p=Path('colour-testing/index.html');s=p.read_text(encoding='utf-8');start=s.index('<section id="other-site-colours"');end=s.index('<section id="neutrals"',start);s=s[:start]+section+'\n'+s[end:];s=s.replace('excluding the illustration palette and neutrals above.','excluding the colours already listed in your illustration and neutral palettes.');p.write_text(s,encoding='utf-8');print('Added',len(ui),'interface colours and',len(art),'artwork colours')
