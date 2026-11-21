import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { build } from './build.mjs';

const types = {
  html: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  mp4: 'video/mp4',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
};

export function parseHeaders(text) {
  const rules = [];
  let current = null;
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim() || raw.trimStart().startsWith('#')) continue;
    if (!/^\s/.test(raw)) {
      current = { pattern: raw.trim(), headers: {} };
      rules.push(current);
      continue;
    }
    const match = current && raw.trim().match(/^([\w-]+):\s*(.+)$/);
    if (match) current.headers[match[1]] = match[2];
  }
  return rules;
}

export function headersFor(pathname, rules) {
  const out = {};
  for (const rule of rules) {
    const matches = rule.pattern.endsWith('*')
      ? pathname.startsWith(rule.pattern.slice(0, -1))
      : pathname === rule.pattern;
    if (matches) Object.assign(out, rule.headers);
  }
  if (out['Content-Security-Policy']) {
    out['Content-Security-Policy'] = out['Content-Security-Policy'].replace(/;\s*upgrade-insecure-requests\b/g, '');
  }
  return out;
}

export async function startServer({ port = Number(process.env.PORT || 4321), host = process.env.HOST || '127.0.0.1', rebuild = true } = {}) {
  if (rebuild) await build();
  const files = new Map(
    (await readdir('dist', { recursive: true }))
      .filter(name => types[name.split('.').pop()])
      .map(name => ['/' + name.replaceAll('\\', '/'), name])
  );
  files.set('/', 'index.html');
  for (const [path, name] of [...files]) {
    if (path.endsWith('/index.html')) files.set(path.slice(0, -'index.html'.length), name);
  }
  const rules = parseHeaders(await readFile('dist/_headers', 'utf8'));

  const server = createServer(async (req, res) => {
    let pathname;
    try {
      pathname = new URL(req.url || '/', 'http://localhost').pathname;
    } catch {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Bad Request');
    }
    if (!pathname.endsWith('/') && files.has(pathname + '/')) {
      res.writeHead(308, { Location: pathname + '/' });
      return res.end();
    }
    const found = files.has(pathname);
    const file = found ? files.get(pathname) : '404.html';
    const filePath = 'dist/' + file;
    const baseHeaders = {
      ...headersFor(pathname, rules),
      'Content-Type': types[file.split('.').pop()],
      'Accept-Ranges': 'bytes',
    };
    try {
      const info = await stat(filePath);
      const range = found && req.headers.range;
      if (range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
        if (!match || (!match[1] && !match[2])) {
          res.writeHead(416, { ...baseHeaders, 'Content-Range': `bytes */${info.size}` });
          return res.end();
        }
        let start = match[1] ? Number(match[1]) : Math.max(0, info.size - Number(match[2]));
        let end = match[2] && match[1] ? Number(match[2]) : info.size - 1;
        if (start >= info.size || end < start) {
          res.writeHead(416, { ...baseHeaders, 'Content-Range': `bytes */${info.size}` });
          return res.end();
        }
        end = Math.min(end, info.size - 1);
        res.writeHead(206, {
          ...baseHeaders,
          'Content-Range': `bytes ${start}-${end}/${info.size}`,
          'Content-Length': String(end - start + 1),
        });
        if (req.method === 'HEAD') return res.end();
        return createReadStream(filePath, { start, end }).pipe(res);
      }
      res.writeHead(found ? 200 : 404, { ...baseHeaders, 'Content-Length': String(info.size) });
      if (req.method === 'HEAD') return res.end();
      createReadStream(filePath).pipe(res);
    } catch {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Run npm run build and try again.');
    }
  });

  await new Promise(resolveListen => server.listen(port, host, resolveListen));
  return server;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = await startServer();
  const addr = server.address();
  console.log(`Felary → http://${addr.address}:${addr.port}`);
}
