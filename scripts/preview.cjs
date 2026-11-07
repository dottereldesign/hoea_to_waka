const http=require('http');
const fs=require('fs');
const path=require('path');
const defaultRoot=path.resolve(__dirname,'..');
const zlib=require('zlib');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.jpg':'image/jpeg','.mp3':'audio/mpeg','.mp4':'video/mp4','.webm':'video/webm','.md':'text/plain; charset=utf-8'};
function serve(port=8766,options={}){const root=options.root?path.resolve(options.root):defaultRoot;return http.createServer((req,res)=>{if(req.url==='/hoea_to_waka'){res.writeHead(302,{Location:'/hoea_to_waka/'}).end();return;}let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/hoea_to_waka\//,'/');}catch{res.writeHead(400).end();return;}let file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');}catch{}fs.readFile(file,(err,data)=>{if(err){
  if(path.extname(name) && path.extname(name)!=='.html'){
    res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Not found');
    return;
  }
  fs.readFile(path.join(root,'404.html'),(error,page)=>{
    res.writeHead(404,{'Content-Type':error?'text/plain; charset=utf-8':types['.html']});
    res.end(error?'Not found':page);
  });
  return;
}const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes'};
// Media elements request byte ranges when seeking, including before a file is cached.
if(req.headers.range){
 const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
 let start,end;
 if(match&&(match[1]||match[2])){
  start=match[1]?Number(match[1]):Math.max(0,data.length-Number(match[2]));
  end=match[1]?(match[2]?Math.min(Number(match[2]),data.length-1):data.length-1):data.length-1;
 }
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=data.length){res.writeHead(416,{...headers,'Content-Range':'bytes */'+data.length}).end();return;}
 headers['Content-Range']='bytes '+start+'-'+end+'/'+data.length;
 headers['Content-Length']=end-start+1;
 res.writeHead(206,headers).end(req.method==='HEAD'?undefined:data.subarray(start,end+1));return;
}
if(options.compress){headers['Cache-Control']='max-age=600';if(/\bgzip\b/.test(req.headers['accept-encoding']||'')&&/\.(?:html|css|js|svg|json|md)$/.test(file)){data=zlib.gzipSync(data);headers['Content-Encoding']='gzip';headers.Vary='Accept-Encoding';}}headers['Content-Length']=data.length;res.writeHead(200,headers).end(req.method==='HEAD'?undefined:data);});}).listen(port,'127.0.0.1');}
module.exports=serve;
if(require.main===module){serve();console.log('Preview: http://127.0.0.1:8766/hoea_to_waka/');}
