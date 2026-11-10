// Source for the inline, accessible-fallback artwork in About's story.
const line=(d,extra='')=>`<path d="${d}" fill="none" ${extra.includes('stroke=')?'':'stroke="currentColor"'} ${extra.includes('stroke-width=')?'':'stroke-width="1.4"'} stroke-linecap="round" stroke-linejoin="round" data-draw ${extra}/>`;
const paper=(d,fill='#fff',extra='')=>`<path d="${d}" fill="${fill}" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const floor=line('M18 354H502','opacity=".38"');
const leaf=(x,y,angle,scale=1)=>`<g data-leaf data-x="${x}" data-y="${y}" data-angle="${angle}" data-size="${scale}" transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">${paper('M0 0C8-31 40-39 60-34C52-10 27 5 0 0Z','#e4eade')}${line('M2-1Q27-16 52-29','stroke-width=".8"')}</g>`;
function art(index){
  let inside='';
  if(index===0){
    const source=require('fs').readFileSync(require('path').join(__dirname,'../assets/anna-youth-conversation.svg'),'utf8');
    const svg=source.replace(/id="([^"]+)"/g,'id="ay-$1"').replace(/url\(#([^)]*)\)/g,'url(#ay-$1)').replace(/href="#([^"]+)"/g,'href="#ay-$1"').replace('aria-labelledby="youth-title youth-description"','aria-hidden="true" focusable="false"').replace('width="1447" height="1087"','x="18" y="6" width="484" height="364" style="width:484px;height:364px" data-youth-arrival');
    return '<svg viewBox="0 0 520 400" width="520" height="400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">'+svg+'</svg>';
  }
  if(index===1)inside=`<g data-chair="left">${paper('M111 249Q111 238 122 238H177Q187 238 187 248V297H111Z','#edf1f5')}${line('M111 274H181M118 297l-6 57M175 297l8 57M106 279v18h82')}${paper('M108 224Q107 215 117 215H124V278H108Z','#fff')}</g><g data-chair="right">${paper('M333 249Q333 238 344 238H399Q409 238 409 248V297H333Z','#edf1f5')}${line('M339 274H409M345 297l-8 57M401 297l6 57M332 297h82v-18')}${paper('M396 224Q396 215 405 215H413V278H396Z','#fff')}</g>${line('M174 193C183 144 223 130 253 148C289 169 262 199 242 176C225 156 269 117 310 149Q337 169 344 193','stroke-width="1.2"')}`;
  if(index===2)inside=`${line('M260 172V347','opacity=".45"')}<g data-book="left">${paper('M260 199Q203 156 122 175V320Q199 304 260 347Z','#f4f0e5')}${paper('M260 199Q213 166 133 185V311Q204 304 260 337Z','#fff')}${line('M153 220Q196 211 238 232M153 240Q196 231 238 252M153 260Q191 254 225 270','opacity=".45"')}</g><g data-book="right">${paper('M260 199Q317 156 398 175V320Q321 304 260 347Z','#edf1f5')}${paper('M260 199Q307 166 387 185V311Q316 304 260 337Z','#fff')}${line('M283 249Q307 224 332 244T373 242M283 270Q307 245 332 265T373 263','stroke="#0d4687" opacity=".8"')}<circle cx="353" cy="212" r="10" fill="#e1e6ce"/></g>${line('M248 349Q260 356 272 349','stroke-width="2"')}`;
  if(index===3){
    inside=`${paper('M189 271H331L313 354H207Z','#f4f0e5')}${line('M184 271H336M210 354H310','stroke-width="2"')}${line('M260 271V175M260 237Q227 227 214 193M260 214Q294 198 305 166M260 249Q295 245 321 221M260 220Q241 189 247 158')}${leaf(214,193,180,.65)}${leaf(305,166,-15,.65)}${leaf(321,221,-5,.6)}${leaf(247,158,190,.53)}${leaf(260,175,-45,.62)}${line('M260 283v43M260 298l-22 15M260 306l22 16M238 313l-8 13M282 322l9 5','opacity=".45"')}`;
  }
  if(index===4)return `<svg viewBox="0 0 520 400" width="520" height="400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><image href="../assets/anna-lighthouse.webp" x="30" y="40" width="460" height="314" preserveAspectRatio="xMidYMax meet"/></svg>`;
  return `<svg viewBox="0 0 520 400" width="520" height="400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="color:#243a53">${floor}${inside}</svg>`;
}
module.exports=art;
