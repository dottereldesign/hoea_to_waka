const http=require('http');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.jpg':'image/jpeg','.mp4':'video/mp4','.webm':'video/webm','.md':'text/plain; charset=utf-8'};
function serve(port=8766){return http.createServer((req,res)=>{let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/hoea_to_waka\//,'/');}catch{res.writeHead(400).end();return;}let file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');}catch{}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(data);});}).listen(port,'127.0.0.1');}
module.exports=serve;
if(require.main===module){serve();console.log('Preview: http://127.0.0.1:8766/hoea_to_waka/');}
