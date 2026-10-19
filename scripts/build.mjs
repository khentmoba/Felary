import { readFile, mkdir, writeFile, copyFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 19 19 5M5 5h14v14"/></svg>';
const down = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 4v16m-6-6 6 6 6-6"/></svg>';
const base = p => 'https://github.com/khentmoba/' + encodeURIComponent(p.repo);
const slug = p => p.repo.toLowerCase().replaceAll('_','-');
const download = p => base(p) + '/releases/download/' + encodeURIComponent(p.tag) + '/' + encodeURIComponent(p.installer);

export function validateProjects(projects) {
  if (!Array.isArray(projects) || !projects.length) throw new Error('Add at least one project.');
  const names = new Set();
  for (const p of projects) {
    for (const key of ['name', 'repo', 'description', 'category', 'language']) {
      if (typeof p[key] !== 'string' || !p[key].trim()) throw new Error('Missing project field: ' + key);
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(p.repo) || names.has(slug(p))) throw new Error('Invalid or duplicate repository.');
    names.add(slug(p));
    if ([p.installer,p.tag,p.version].some(v=>v !== undefined) && (![p.tag,p.version,p.installer].every(v=>typeof v === 'string' && v.trim()) || !p.installer.endsWith('.exe'))) throw new Error('Downloads need a tag, version and .exe asset.');
    if (p.showcase) {
      const s=p.showcase;
      for(const field of ['headline','intro','image','imageAlt','imageCaption','short']) {
        if(typeof s[field] !== 'string' || !s[field].trim()) throw new Error('Missing showcase field: '+field);
      }
      if (!/^[a-z0-9-]+[.]png$/.test(s.image) || !['forest','cobalt','plum'].includes(s.tone)) throw new Error('Invalid showcase image or tone.');
      if (!Array.isArray(s.features) || !s.features.length || !s.features.every(v=>typeof v==='string' && v.trim())) throw new Error('Add showcase features.');
      if (![s.imageWidth,s.imageHeight].every(v=>Number.isInteger(v) && v>0)) throw new Error('Add image dimensions.');
    }
  }
  return projects;
}
const image = (p,eager=false) => `<img src="/assets/${p.showcase.image}" alt="${escapeHtml(p.showcase.imageAlt)}" width="${p.showcase.imageWidth}" height="${p.showcase.imageHeight}" loading="${eager?'eager':'lazy'}" decoding="async"${eager?' fetchpriority="high"':''}>`;

export function renderProjects(projects) {
  validateProjects(projects);
  const featured=projects.filter(p=>p.showcase);
  return {
    tabs: featured.map((p,i)=>`<a class="app-choice" id="choice-${slug(p)}" href="#app-${slug(p)}" data-panel="spotlight-${slug(p)}"><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.showcase.short)}</small>${arrow}</a>`).join('\n'),
    panels: featured.map((p,i)=>`<div class="spotlight-panel ${p.showcase.tone}${p.showcase.artwork?' artwork':''}" id="spotlight-${slug(p)}"${i?' hidden':''}><div class="spotlight-media">${image(p,i===0)}</div><div class="spotlight-caption"><h2>${escapeHtml(p.showcase.headline)}</h2><a href="#app-${slug(p)}">Explore ${escapeHtml(p.name)} ${arrow}</a></div><p class="media-note">${escapeHtml(p.showcase.imageCaption)}</p></div>`).join('\n'),
    stories: featured.map(p=>`<article class="app-story" id="app-${slug(p)}" aria-labelledby="title-${slug(p)}"><div class="app-title"><h3 id="title-${slug(p)}">${escapeHtml(p.name)}</h3><span>${escapeHtml(p.category)} · Windows</span></div><div class="story-body"><figure class="story-figure"><div class="story-image ${p.showcase.tone}${p.showcase.artwork?' artwork':''}">${image(p)}</div><figcaption>${escapeHtml(p.showcase.imageCaption)} <a href="/assets/${p.showcase.image}">View full image ${arrow}</a></figcaption></figure><div class="story-copy"><h4>${escapeHtml(p.showcase.headline)}</h4><p>${escapeHtml(p.showcase.intro)}</p><ul>${p.showcase.features.map(f=>'<li>'+escapeHtml(f)+'</li>').join('')}</ul><div class="story-actions">${p.installer?`<a class="button" href="${download(p)}" aria-label="Download ${escapeHtml(p.name)} ${escapeHtml(p.version)} for Windows">Download for Windows ${down}</a>`:''}<a class="text-link" href="${base(p)}">Explore the source ${arrow}</a></div></div></div></article>`).join('\n'),
    work: projects.filter(p=>!p.showcase).map(p=>`<article class="project"><div><h3><a href="${base(p)}">${escapeHtml(p.name)} ${arrow}</a></h3><p>${escapeHtml(p.description)}</p></div><span class="project-meta">${escapeHtml(p.language)}</span></article>`).join('\n'),
    downloads: projects.filter(p=>p.installer).map(p=>`<article class="download"><div><h3>${escapeHtml(p.name)}</h3><p>Windows · x64 · v${escapeHtml(p.version)}</p></div><div class="download-actions"><a class="button download-button" href="${download(p)}" aria-label="Download ${escapeHtml(p.name)} ${escapeHtml(p.version)} installer">Download .exe ${down}</a><a class="release-link" href="${base(p)}/releases/latest" aria-label="${escapeHtml(p.name)} latest release and notes">Latest release &amp; notes ${arrow}</a></div></article>`).join('\n')
  };
}
export async function build() {
  const projects = JSON.parse(await readFile('src/projects.json','utf8'));
  const parts=renderProjects(projects);
  for(const p of projects.filter(p=>p.showcase)) await readFile('src/assets/'+p.showcase.image);
  let html=await readFile('src/index.html','utf8');
  for(const [slot,key] of [['SPOTLIGHT TABS','tabs'],['SPOTLIGHT PANELS','panels'],['APP STORIES','stories'],['PROJECTS','work'],['DOWNLOADS','downloads']]) html=html.replace('<!-- '+slot+' -->',parts[key]);
  await rm('dist',{recursive:true,force:true});
  await mkdir('dist',{recursive:true});
  await writeFile('dist/index.html',html);
  for(const name of ['style.css','showcase.js','favicon.svg','_headers']) await copyFile('src/'+name,'dist/'+name);
  await cp('src/assets','dist/assets',{recursive:true});
  await writeFile('dist/404.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found · Felary</title><link rel="stylesheet" href="/style.css"><main class="wrap not-found"><h1>Nothing here.</h1><p>This page could not be found.</p><a href="/">Back to Felary</a></main></html>');
  console.log('Built Felary → dist/');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
