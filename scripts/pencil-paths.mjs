import {createRequire} from 'node:module';
const svgpath=createRequire(import.meta.url)('svgpath');
export function bounds(d){
 let x=0,y=0,xs=[],ys=[];
 for(const [command,...v] of svgpath(d).abs().unshort().unarc().segments){
  if(command==='Z')continue;
  if(command==='H'){x=v[0];xs.push(x);ys.push(y);continue;}
  if(command==='V'){y=v[0];xs.push(x);ys.push(y);continue;}
  for(let i=0;i<v.length;i+=2){xs.push(v[i]);ys.push(v[i+1]);}
  [x,y]=v.slice(-2);
 }
 return {x:Math.min(...xs),y:Math.min(...ys),right:Math.max(...xs),bottom:Math.max(...ys)};
}
const fixed=n=>n.toFixed(2);
export function hatch(d,seed){
 const b=bounds(d);
 let lines=[];
 // Alternating passes follow the way a pencil shades a small shape by hand.
 const left=b.x-2,right=b.right+2,rise=(right-left)*.23;
 for(let y=b.y-1,i=0;y<b.bottom+rise+2;y+=1.65,i++){
  const jitter=Math.sin(i*2.17+seed)*.26;
  const a=i%2?right:left,z=i%2?left:right;
  const start=i%2?y-rise:y,end=i%2?y:y-rise;
  lines.push(`${i ? 'L' : 'M'}${fixed(a)} ${fixed(start+jitter)}Q${fixed((left+right)/2)} ${fixed(y-rise/2-.35)} ${fixed(z)} ${fixed(end+.18)}`);
 }
 return lines.join('');
}
