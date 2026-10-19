import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { build } from './build.mjs';
await build();
const types = {html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',svg:'image/svg+xml',png:'image/png',ttf:'font/ttf'};
const files = new Map((await readdir('dist',{recursive:true})).filter(name=>types[name.split('.').pop()]).map(name=>['/'+name.replaceAll('\\','/'),name]));
files.set('/','index.html');
const headers = Object.fromEntries((await readFile('dist/_headers','utf8')).split('\n').map(line=>line.trim().match(/^([\w-]+):\s*(.+)$/)).filter(Boolean).map(([,key,value])=>[key,value]));
const port=Number(process.env.PORT || 4321);
createServer(async (req,res) => {
  const pathname = new URL(req.url,'http://localhost').pathname;
  const file = files.get(pathname) || '404.html';
  try {
    const content = await readFile('dist/'+file);
    res.writeHead(files.has(pathname) ? 200 : 404,{...headers,'Content-Type':types[file.split('.').pop()]});
    res.end(content);
  } catch { res.writeHead(500); res.end('Run npm run build and try again.'); }
}).listen(port,'0.0.0.0',()=>console.log('Felary → http://localhost:'+port));
