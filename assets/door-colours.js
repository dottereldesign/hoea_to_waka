(() => {
const stage=document.querySelector('.colour-stage');
const palettes=[
 ['Coastal mist','#A9C5CE','#607F9D','#D6BA83','#0C396B'],
 ['Soft sage','#B8C9B5','#6B916F','#D6BA83','#344A3A'],
 ['Lavender & plum','#D8CBDD','#806788','#FFFFFF','#281A2C'],
 ['Dusty rose','#C88F99','#806788','#D6BA83','#281A2C'],
 ['Ocean blue','#0C396B','#1A2B3D','#D6BA83','#A9C5CE'],
 ['Coastal mist · no outline','#A9C5CE','#607F9D','#D6BA83','#0C396B']
];
function select(index){const [name,...colours]=palettes[index];['panel','edge','hardware','plate'].forEach((key,i)=>stage.style.setProperty('--'+key,colours[i]));stage.dataset.outline=String(index!==5);document.querySelectorAll('[data-colour]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.colour)===index)));document.querySelector('.selection').textContent=String(index+1).padStart(2,'0')+' · '+name;document.querySelector('.swatches').innerHTML=colours.map((hex,i)=>`<span><i style="background:${hex}"></i>${['Door','Edge','Handle','Lock plate'][i]} ${hex}</span>`).join('');stage.querySelector('desc').textContent=`A ${name.toLowerCase()} arched door with coloured handle and lock hardware opens onto Matariki stars, a crescent moon and ocean waves.`;}
document.querySelectorAll('[data-colour]').forEach(button=>button.addEventListener('click',()=>select(Number(button.dataset.colour))));select(0);
})();
