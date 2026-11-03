const http=require('http');
const fs=require('fs');
const path=require('path');
const defaultRoot=path.resolve(__dirname,'..');
const zlib=require('zlib');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.jpg':'image/jpeg','.mp4':'video/mp4','.webm':'video/webm','.md':'text/plain; charset=utf-8'};
function serve(port=8766,options={}){const root=options.root?path.resolve(options.root):defaultRoot;return http.createServer((req,res)=>{let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/hoea_to_waka\//,'/');}catch{res.writeHead(400).end();return;}let file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');}catch{}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end('Not found');return;}const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream'};if(options.compress){headers['Cache-Control']='max-age=600';if(/\bgzip\b/.test(req.headers['accept-encoding']||'')&&/\.(?:html|css|js|svg|json|md)$/.test(file)){data=zlib.gzipSync(data);headers['Content-Encoding']='gzip';headers.Vary='Accept-Encoding';}}headers['Content-Length']=data.length;res.writeHead(200,headers).end(data);});}).listen(port,'127.0.0.1');}
module.exports=serve;
if(require.main===module){serve();console.log('Preview: http://127.0.0.1:8766/hoea_to_waka/');}
