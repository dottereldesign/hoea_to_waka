import svgpath from 'svgpath';

// Derive study 08 from 07, without changing either the approved master or 07.
export function auditOutline(paths) {
  const changes=[];
  const cleaned=paths.map(({source,d})=>{
    const segments=svgpath(d).abs().unshort().segments.map(s=>[...s]);
    for(let i=1;i<segments.length;i++) {
      const s=segments[i], previous=segments[i-1];
      if(!['C','L'].includes(s[0]))continue;
      const start=previous.slice(-2), points=[start];
      for(let k=1;k<s.length;k+=2)points.push([s[k],s[k+1]]);
      const length=points.slice(1).reduce((sum,p,k)=>sum+Math.hypot(p[0]-points[k][0],p[1]-points[k][1]),0);
      if(length>=.02)continue;
      previous.splice(previous.length-2,2,...s.slice(-2));
      segments.splice(i,1);i--;
      changes.push({source,fix:'remove microscopic join segment',length});
    }
    // Close near-coincident ends exactly, avoiding a tiny extra closing stroke.
    const first=segments[0].slice(-2), last=segments.at(-2);
    const gap=Math.hypot(last.at(-2)-first[0],last.at(-1)-first[1]);
    if(segments.at(-1)[0]==='Z' && gap>0 && gap<.02) {
      last.splice(last.length-2,2,...first);
      changes.push({source,fix:'snap microscopic closing gap',distance:gap});
    }
    // Only the gently flowing wave shoulder is adjusted, never a pointed tip.
    if(source===0) {
      const before=segments[9],after=segments[10];
      const join=before.slice(-2), a=[join[0]-before[3],join[1]-before[4]], b=[after[1]-join[0],after[2]-join[1]];
      const al=Math.hypot(...a),bl=Math.hypot(...b),v=[a[0]/al+b[0]/bl,a[1]/al+b[1]/bl],vl=Math.hypot(...v);
      const direction=v.map(n=>n/vl);
      before[3]=join[0]-direction[0]*al;before[4]=join[1]-direction[1]*al;
      after[1]=join[0]+direction[0]*bl;after[2]=join[1]+direction[1]*bl;
      changes.push({source,fix:'align wave shoulder tangents',anchor:join,angleBefore:Math.acos((a[0]*b[0]+a[1]*b[1])/(al*bl))*180/Math.PI,maxHandleMovement:Math.max(al,bl)*Math.hypot(direction[0]-a[0]/al,direction[1]-a[1]/al)});
    }
    return {source,d:segments.map(s=>s.map(n=>typeof n==='number'?Number(n.toFixed(6)):n).join(' ')).join(' ')};
  });
  return {paths:cleaned,changes};
}
