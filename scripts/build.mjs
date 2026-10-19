import { readFile, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function validateProjects(projects) {
  if (!Array.isArray(projects) || !projects.length) throw new Error('Add at least one project.');
  const names = new Set();
  for (const p of projects) {
    for (const key of ['name', 'repo', 'description', 'category', 'language']) {
      if (typeof p[key] !== 'string' || !p[key].trim()) throw new Error('Missing project field: ' + key);
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(p.repo) || names.has(p.repo)) throw new Error('Invalid or duplicate repository.');
    names.add(p.repo);
    if (p.installer && (![p.tag, p.version, p.installer].every(v => typeof v === 'string' && v.length) || !p.installer.endsWith('.exe'))) throw new Error('Downloads need a tag, version and .exe asset.');
  }
  return projects;
}
export function renderProjects(projects) {
  validateProjects(projects);
  const arrow = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 19 19 5M5 5h14v14"/></svg>';
  const base = p => 'https://github.com/khentmoba/' + encodeURIComponent(p.repo);
  return {
    work: projects.map((p,i) => `<article class="project"><span class="project-number">${String(i+1).padStart(2,'0')}</span><div><h3><a href="${base(p)}">${escapeHtml(p.name)} ${arrow}</a></h3><p>${escapeHtml(p.description)}</p></div><div class="project-meta"><span>${escapeHtml(p.category)}</span><span>${escapeHtml(p.language)}</span></div></article>`).join('\n'),
    downloads: projects.filter(p=>p.installer).map(p => `<article class="download"><div><h3>${escapeHtml(p.name)}</h3><p>Windows · x64 · v${escapeHtml(p.version)}</p></div><div class="download-actions"><a class="download-button" href="${base(p)}/releases/download/${encodeURIComponent(p.tag)}/${encodeURIComponent(p.installer)}">Download .exe <span aria-hidden="true">↓</span></a><a class="release-link" href="${base(p)}/releases/latest">Latest release &amp; notes ${arrow}</a></div></article>`).join('\n')
  };
}
export async function build() {
  const projects = JSON.parse(await readFile('src/projects.json','utf8'));
  const parts = renderProjects(projects);
  const template = await readFile('src/index.html','utf8');
  await mkdir('dist',{recursive:true});
  await writeFile('dist/index.html',template.replace('<!-- PROJECTS -->',parts.work).replace('<!-- DOWNLOADS -->',parts.downloads));
  for (const name of ['style.css','favicon.svg','_headers']) await copyFile('src/'+name,'dist/'+name);
  await writeFile('dist/404.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found · Felary</title><link rel="stylesheet" href="/style.css"><main class="wrap"><h1>Nothing here.</h1><p>This page could not be found.</p><a href="/">Back to Felary</a></main></html>');
  console.log('Built Felary → dist/');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
