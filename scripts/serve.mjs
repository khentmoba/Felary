import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { build } from './build.mjs';
await build();
const files = {'/':'index.html','/index.html':'index.html','/style.css':'style.css','/favicon.svg':'favicon.svg'};
const types = {html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',svg:'image/svg+xml'};
createServer(async (req,res) => {
  const pathname = new URL(req.url,'http://localhost').pathname;
  const file = Object.hasOwn(files,pathname) ? files[pathname] : '404.html';
  try {
    res.writeHead(file === '404.html' ? 404 : 200,{'Content-Type':types[file.split('.').pop()]});
    res.end(await readFile('dist/'+file));
  } catch { res.writeHead(500); res.end('Run npm run build and try again.'); }
}).listen(4321,'0.0.0.0',()=>console.log('Felary → http://localhost:4321'));
