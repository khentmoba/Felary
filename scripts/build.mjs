import { readFile, mkdir, writeFile, copyFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { fetchReleases, applyReleases } from './releases.mjs';

export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 19 19 5M5 5h14v14"/></svg>';
const down = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 4v16m-6-6 6 6 6-6"/></svg>';
const base = p => 'https://github.com/khentmoba/' + encodeURIComponent(p.repo);
const slug = p => p.repo.toLowerCase().replaceAll('_','-');
const releaseAsset = (p,file) => base(p) + '/releases/download/' + encodeURIComponent(p.tag) + '/' + encodeURIComponent(file);
const download = p => releaseAsset(p,p.installer);
export const pageSlug = p => p.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const pageHref = p => '/apps/' + pageSlug(p) + '/';
const text = v => typeof v === 'string' && v.trim() !== '';
const reservedIds = ['main','overview','features','whats-new','download','more-apps'];
const day = new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
const released = p => p.released ? `<time datetime="${p.released}" data-released>${day.format(new Date(p.released+'T00:00:00Z'))}</time>` : '';
const validPattern = v => { try { return text(v) && !!new RegExp(v); } catch { return false; } };

function validatePage(p) {
  const g=p.page;
  if (!p.showcase) throw new Error('App pages need a showcase.');
  if (!text(g.summary)) throw new Error('Missing page summary.');
  if (!/^[a-z0-9-]+[.]png$/.test(g.icon) || ![g.iconWidth,g.iconHeight].every(v=>Number.isInteger(v) && v>0)) throw new Error('Add a safe app icon and its dimensions.');
  if (!Array.isArray(g.facts) || !g.facts.length || !g.facts.every(f=>f && text(f.label) && text(f.value))) throw new Error('Add app facts.');
  if (!Array.isArray(g.requirements) || !g.requirements.length || !g.requirements.every(text)) throw new Error('Add app requirements.');
  if (!Array.isArray(g.sections) || !g.sections.length) throw new Error('Add page sections.');
  const ids=new Set();
  for (const section of g.sections) {
    if (!/^[a-z0-9-]+$/.test(section.id || '') || ids.has(section.id) || reservedIds.includes(section.id) || !text(section.title)) throw new Error('Sections need a unique, safe id and a title.');
    ids.add(section.id);
    if (section.intro !== undefined && !text(section.intro)) throw new Error('Section introductions cannot be empty.');
    const items=Array.isArray(section.items) && section.items.length > 0 && section.items.every(i=>i && text(i.title) && text(i.text));
    const t=section.table;
    const table=!!t && Array.isArray(t.columns) && t.columns.length > 0 && t.columns.every(text) && Array.isArray(t.rows) && t.rows.length > 0 && t.rows.every(r=>Array.isArray(r) && r.length===t.columns.length && r.every(text));
    if (items === table) throw new Error('Each section needs either items or a complete table.');
  }
  if (g.extras !== undefined && (!p.installer || !Array.isArray(g.extras) || !g.extras.every(e=>e && text(e.label) && /^[a-zA-Z0-9_.-]+[.]exe$/.test(e.file)))) throw new Error('Extra downloads need a release, a label and an .exe asset.');
  if (g.note !== undefined && !text(g.note)) throw new Error('Page notes cannot be empty.');
}

export function validateProjects(projects) {
  if (!Array.isArray(projects) || !projects.length) throw new Error('Add at least one project.');
  const names = new Set();
  const pages = new Set();
  for (const p of projects) {
    for (const key of ['name', 'repo', 'description', 'category', 'language']) {
      if (typeof p[key] !== 'string' || !p[key].trim()) throw new Error('Missing project field: ' + key);
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(p.repo) || names.has(slug(p))) throw new Error('Invalid or duplicate repository.');
    names.add(slug(p));
    if ([p.installer,p.tag,p.version].some(v=>v !== undefined) && (![p.tag,p.version,p.installer].every(v=>typeof v === 'string' && v.trim()) || !p.installer.endsWith('.exe'))) throw new Error('Downloads need a tag, version and .exe asset.');
    if (p.release !== undefined && (!p.installer || !validPattern(p.release.installer))) throw new Error('Release rules need a download and a valid installer pattern.');
    if (p.released !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(p.released)) throw new Error('Release dates must be YYYY-MM-DD.');
    if (p.notes !== undefined && (!Array.isArray(p.notes) || !p.notes.every(text))) throw new Error('Release notes must be text.');
    if (p.showcase) {
      const s=p.showcase;
      for(const field of ['headline','intro','image','imageAlt','imageCaption','short']) {
        if(typeof s[field] !== 'string' || !s[field].trim()) throw new Error('Missing showcase field: '+field);
      }
      if (!/^[a-z0-9-]+[.]png$/.test(s.image) || !['forest','cobalt','plum','glacier'].includes(s.tone)) throw new Error('Invalid showcase image or tone.');
      if (!Array.isArray(s.features) || !s.features.length || !s.features.every(v=>typeof v==='string' && v.trim())) throw new Error('Add showcase features.');
      if (![s.imageWidth,s.imageHeight].every(v=>Number.isInteger(v) && v>0)) throw new Error('Add image dimensions.');
      if (s.video !== undefined) {
        const v=s.video;
        if (!v || !/^[a-z0-9-]+[.]mp4$/.test(v.file) || !/^[a-z0-9-]+[.](jpg|png)$/.test(v.poster) || ![v.width,v.height].every(n=>Number.isInteger(n) && n>0) || !text(v.label) || !text(v.caption)) throw new Error('Demo videos need a safe .mp4, a poster, dimensions, a label and a caption.');
      }
      if (s.scenes !== undefined) {
        if (!Array.isArray(s.scenes) || s.scenes.length !== s.features.length) throw new Error('Each feature needs one matching scene.');
        for (const scene of s.scenes) {
          if (!scene || !/^[a-z0-9-]+[.]png$/.test(scene.image) || !['imageAlt','imageCaption'].every(key=>typeof scene[key] === 'string' && scene[key].trim())) throw new Error('Add safe scene images and descriptions.');
          if (![scene.imageWidth,scene.imageHeight].every(v=>Number.isInteger(v) && v>0)) throw new Error('Add scene image dimensions.');
        }
      }
    }
    if (p.page !== undefined) {
      validatePage(p);
      if (!pageSlug(p) || pages.has(pageSlug(p))) throw new Error('Invalid or duplicate app page.');
      pages.add(pageSlug(p));
    }
  }
  return projects;
}
const imageAsset = (s,eager=false) => `<img src="/assets/${s.image}" alt="${escapeHtml(s.imageAlt)}" width="${s.imageWidth}" height="${s.imageHeight}" loading="${eager?'eager':'lazy'}" decoding="async"${eager?' fetchpriority="high"':''}>`;
const image = (p,eager=false) => imageAsset(p.showcase,eager);
// Demo videos play muted and looped like a moving plate; showcase.js adds pause and sound buttons and drops the native controls.
const demoVideo = v => `<div class="video-frame"><video class="demo-video" src="/assets/${v.file}" poster="/assets/${v.poster}" width="${v.width}" height="${v.height}" aria-label="${escapeHtml(v.label)}" autoplay muted loop playsinline controls preload="metadata"><a href="/assets/${v.file}">Watch the demo video</a></video></div>`;
const plate = (p,eager=false) => p.showcase.video ? demoVideo(p.showcase.video) : image(p,eager);
function renderStory(p,onPage=false) {
  const site=p.page && !onPage;
  const s=p.showcase;
  const frames=s.scenes ? [s,...s.scenes].map((scene,i)=>`<div class="feature-frame${i===0?' is-current':''}" data-frame="${i}" data-caption="${escapeHtml(scene.imageCaption)}" aria-hidden="${i!==0}">${imageAsset(scene)}</div>`).join('') : image(p);
  const features=s.features.map((feature,i)=>`<li data-feature-step="${i+1}"><span>${escapeHtml(feature)}</span>${s.scenes?`<figure class="feature-inline"><a href="/assets/${s.scenes[i].image}">${imageAsset(s.scenes[i])}</a><figcaption>${escapeHtml(s.scenes[i].imageCaption)}</figcaption></figure>`:''}</li>`).join('');
  return `<article class="app-story" id="app-${slug(p)}" aria-labelledby="title-${slug(p)}"><div class="app-title"><h3 id="title-${slug(p)}">${site?`<a href="${pageHref(p)}">${escapeHtml(p.name)}</a>`:escapeHtml(p.name)}</h3><span>${escapeHtml(p.category)} · Windows</span></div><div class="story-body"><figure class="story-figure"><div class="story-image ${s.tone}${s.artwork?' artwork':''}"${s.scenes?' data-feature-gallery':''}>${frames}</div><figcaption><span data-gallery-caption>${escapeHtml(s.imageCaption)}</span> <a data-gallery-link href="/assets/${s.image}">View full image ${arrow}</a></figcaption></figure><div class="story-copy"><h4>${escapeHtml(s.headline)}</h4><p>${escapeHtml(s.intro)}</p><ul>${features}</ul><div class="story-actions">${p.installer?`<a class="button" href="${download(p)}" aria-label="Download ${escapeHtml(p.name)} ${escapeHtml(p.version)} for Windows">Download for Windows ${down}</a>`:''}${site?`<a class="text-link" href="${pageHref(p)}">Explore ${escapeHtml(p.name)} ${arrow}</a>`:`<a class="text-link" href="${base(p)}">Explore the source ${arrow}</a>`}</div></div></div></article>`;
}

export function renderProjects(projects) {
  validateProjects(projects);
  const featured=projects.filter(p=>p.showcase);
  return {
    tabs: featured.map((p,i)=>`<a class="app-choice" id="choice-${slug(p)}" href="#app-${slug(p)}" data-panel="spotlight-${slug(p)}"><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.showcase.short)}</small>${arrow}</a>`).join('\n'),
    panels: featured.map((p,i)=>`<div class="spotlight-panel ${p.showcase.tone}${p.showcase.artwork?' artwork':''}" id="spotlight-${slug(p)}"${i?' hidden':''}>${p.page && !p.showcase.video?`<a class="spotlight-media" href="${pageHref(p)}" aria-label="Visit the ${escapeHtml(p.name)} site">${image(p,i===0)}</a>`:`<div class="spotlight-media">${plate(p,i===0)}</div>`}<div class="spotlight-caption"><h2>${escapeHtml(p.showcase.headline)}</h2><a href="${p.page?pageHref(p):'#app-'+slug(p)}">${p.page?'Visit the '+escapeHtml(p.name)+' site':'Explore '+escapeHtml(p.name)} ${arrow}</a></div><p class="media-note">${escapeHtml(p.showcase.video?.caption || p.showcase.imageCaption)}</p></div>`).join('\n'),
    stories: featured.map(p=>renderStory(p)).join('\n'),
    footer: footerApps(projects),
    work: projects.filter(p=>!p.showcase).map(p=>`<article class="project"><div><h3><a href="${base(p)}">${escapeHtml(p.name)} ${arrow}</a></h3><p>${escapeHtml(p.description)}</p></div><span class="project-meta">${escapeHtml(p.language)}</span></article>`).join('\n'),
    downloads: projects.filter(p=>p.installer).map(p=>`<article class="download"><div class="download-name">${p.page?appIcon(p.page,'download-row-icon'):''}<div><h3>${p.page?`<a href="${pageHref(p)}">${escapeHtml(p.name)}</a>`:escapeHtml(p.name)}</h3><p>v${escapeHtml(p.version)}${p.released?' · Released '+released(p):''} · Windows x64</p></div></div><div class="download-actions"><a class="button download-button" href="${download(p)}" aria-label="Download ${escapeHtml(p.name)} ${escapeHtml(p.version)} installer">Download .exe ${down}</a><a class="release-link" href="${p.page&&p.notes?.length?pageHref(p)+'#whats-new':base(p)+'/releases/latest'}" aria-label="${escapeHtml(p.name)} release notes">${p.page&&p.notes?.length?'What’s new':'Release notes'} ${arrow}</a></div></article>`).join('\n')
  };
}
const appIcon = (g,cls,eager=false) => `<img class="${cls}" src="/assets/${g.icon}" alt="" width="${g.iconWidth}" height="${g.iconHeight}" loading="${eager?'eager':'lazy'}" decoding="async">`;
function renderSection(s) {
  const body=s.items
    ? `<div class="detail-grid">${s.items.map(item=>`<article class="detail"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></article>`).join('')}</div>`
    : `<div class="table-wrap" role="region" aria-labelledby="${s.id}-title" tabindex="0"><table class="spec-table"><thead><tr>${s.table.columns.map(c=>`<th scope="col">${escapeHtml(c)}</th>`).join('')}</tr></thead><tbody>${s.table.rows.map(r=>`<tr>${r.map((c,i)=>i?`<td>${escapeHtml(c)}</td>`:`<th scope="row">${escapeHtml(c)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  return `<section id="${s.id}" class="wrap app-section" aria-labelledby="${s.id}-title"><div class="section-heading"><h2 id="${s.id}-title">${escapeHtml(s.title)}</h2>${s.intro?`<p>${escapeHtml(s.intro)}</p>`:''}</div>${body}</section>`;
}

export const footerApps = (projects,current) => `<nav class="footer-apps" aria-label="Applications">${projects.filter(p=>p.page).map(p=>p===current?`<span aria-current="page">${escapeHtml(p.name)}</span>`:`<a href="${pageHref(p)}">${escapeHtml(p.name)}</a>`).join('')}</nav>`;

export function renderAppPage(p, projects) {
  const s=p.showcase, g=p.page, name=escapeHtml(p.name);
  const title=p.name+' — '+s.headline;
  const version=p.installer?`<span>Version ${escapeHtml(p.version)}</span>`:'';
  const notes=p.notes?.length?`<section id="whats-new" class="wrap app-section release" aria-labelledby="whats-new-title"><div class="release-head"><h2 id="whats-new-title">What’s new<br>in ${escapeHtml(p.version)}.</h2><p>${p.released?'Released '+released(p)+'. ':''}From the release notes on GitHub.</p><a class="text-link" href="${base(p)}/releases/tag/${encodeURIComponent(p.tag)}">Full release notes ${arrow}</a></div><ul class="release-notes">${p.notes.map(n=>`<li>${escapeHtml(n)}</li>`).join('')}</ul></section>`:'';
  const others=projects.filter(o=>o.page && o!==p);
  const primary=label=>p.installer?`<a class="button" href="${download(p)}" aria-label="Download ${name} ${escapeHtml(p.version)} for Windows">${label} ${down}</a>`:'';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#08090b">
  <meta name="color-scheme" content="dark">
  <meta name="description" content="${escapeHtml(p.description+' '+s.intro)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(p.description)}">
  <meta property="og:type" content="website">
  <title>${escapeHtml(title)} · Felary</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/assets/fonts/barlow-condensed-600.ttf" as="font" type="font/ttf" crossorigin>
  <link rel="stylesheet" href="/style.css">
  <script type="module" src="/showcase.js"></script>
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="wrap site-header">
    <a class="wordmark" href="/" aria-label="Felary home">felary<span aria-hidden="true">.</span></a>
    <nav aria-label="${name} sections"><a href="#features">Features</a><a href="#download">Download</a><a href="/#work">All apps</a></nav>
    <a class="github-header" href="${base(p)}">Source on GitHub ${arrow}</a>
  </header>
  <main id="main">
    <section id="overview" class="wrap app-hero" aria-labelledby="app-name">
      <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Felary</a></li><li><a href="/#work">Applications</a></li><li aria-current="page">${name}</li></ol></nav>
      <div class="hero-top">
        <div class="hero-brand">${appIcon(g,'hero-icon',true)}<h1 id="app-name">${name}</h1><p class="hero-meta"><span>${escapeHtml(p.category)}</span><span>Windows</span>${version}${p.released?`<a href="#whats-new">Updated ${released(p)}</a>`:''}</p></div>
        <div class="hero-copy"><p class="hero-headline">${escapeHtml(s.headline)}</p><p class="hero-summary">${escapeHtml(g.summary)}</p><div class="story-actions">${primary('Download for Windows')}<a class="text-link" href="#features">See how it works ${down}</a></div></div>
      </div>
      <figure class="hero-plate"><div class="hero-image ${s.tone}">${plate(p,true)}</div><figcaption>${s.video?`${escapeHtml(s.video.caption)} <a href="/assets/${s.video.file}">Open the video ${arrow}</a>`:`${escapeHtml(s.imageCaption)} <a href="/assets/${s.image}">View full image ${arrow}</a>`}</figcaption></figure>
      <dl class="fact-row">${g.facts.map(f=>`<div><dt>${escapeHtml(f.label)}</dt><dd>${escapeHtml(f.value)}</dd></div>`).join('')}</dl>
    </section>
    <section id="features" class="wrap app-tour" aria-labelledby="features-title"><div class="section-heading"><h2 id="features-title">A closer look<br>at ${name}.</h2><p>The real interface, one feature at a time.</p></div><div class="app-stories">${renderStory(p,true)}</div></section>
    ${g.sections.map(renderSection).join('\n    ')}
    ${notes}
    <section id="download" class="downloads app-download" aria-labelledby="download-title">
      <div class="wrap download-grid">
        <div class="download-intro">${appIcon(g,'download-icon')}<h2 id="download-title">Get ${name}.</h2><p>${p.installer?`Version ${escapeHtml(p.version)}${p.released?' · '+released(p):''} · Windows x64 · Free`:'Free and open on GitHub'}</p></div>
        <div class="download-detail">
          <h3>What you need</h3>
          <ul class="requirements">${g.requirements.map(r=>`<li>${escapeHtml(r)}</li>`).join('')}</ul>
          <div class="download-actions">${primary('Download .exe')}${(g.extras||[]).map(e=>`<a class="release-link" href="${releaseAsset(p,e.file)}">${escapeHtml(e.label)} ${down}</a>`).join('')}<a class="release-link" href="${base(p)}/releases">All releases ${arrow}</a><a class="release-link" href="${base(p)}">Source ${arrow}</a></div>
          ${g.note?`<p class="download-note">${escapeHtml(g.note)}</p>`:''}
          <p class="download-note">Installers are hosted on GitHub Releases. Felary checks GitHub for new versions every few hours, so this button points to the newest release. Install only software you trust.</p>
        </div>
      </div>
    </section>
    ${others.length?`<nav id="more-apps" class="wrap more-apps" aria-labelledby="more-title"><h2 id="more-title">More from Felary.</h2><ul>${others.map(o=>`<li><a href="${pageHref(o)}">${appIcon(o.page,'more-icon')}<span><strong>${escapeHtml(o.name)}</strong><small>${escapeHtml(o.showcase.short)}</small></span>${arrow}</a></li>`).join('')}</ul></nav>`:''}
  </main>
  <footer class="wrap site-footer"><a class="wordmark" href="/">felary<span aria-hidden="true">.</span></a>${footerApps(projects,p)}<a href="#main">Back to top <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 20V4m-6 6 6-6 6 6"/></svg></a></footer>
</body>
</html>
`;
}

export async function build({ live = process.env.FELARY_RELEASES !== 'offline' } = {}) {
  const source = JSON.parse(await readFile('src/projects.json','utf8'));
  const saved = JSON.parse(await readFile('src/releases.json','utf8').catch(()=>'{}'));
  const fresh = live ? await fetchReleases(source,{ token: process.env.GITHUB_TOKEN }) : {};
  const projects = applyReleases(source, fresh, saved);
  const parts=renderProjects(projects);
  for(const p of projects.filter(p=>p.showcase)) {
    for(const scene of [p.showcase,...(p.showcase.scenes||[])]) await readFile('src/assets/'+scene.image);
    if (p.showcase.video) for (const file of [p.showcase.video.file,p.showcase.video.poster]) await readFile('src/assets/'+file);
    if (p.page) await readFile('src/assets/'+p.page.icon);
  }
  let html=await readFile('src/index.html','utf8');
  for(const [slot,key] of [['SPOTLIGHT TABS','tabs'],['SPOTLIGHT PANELS','panels'],['APP STORIES','stories'],['PROJECTS','work'],['DOWNLOADS','downloads'],['FOOTER APPS','footer']]) html=html.replace('<!-- '+slot+' -->',parts[key]);
  await rm('dist',{recursive:true,force:true});
  await mkdir('dist',{recursive:true});
  await writeFile('dist/index.html',html);
  for(const p of projects.filter(p=>p.page)) {
    await mkdir('dist/apps/'+pageSlug(p),{recursive:true});
    await writeFile('dist/apps/'+pageSlug(p)+'/index.html',renderAppPage(p,projects));
  }
  // Scheduled deploys compare this with the live copy and skip when nothing was released.
  const manifest=Object.fromEntries(projects.filter(p=>p.release).map(p=>[p.repo,{tag:p.tag,installer:p.installer,released:p.released||null}]));
  await writeFile('dist/releases.json',JSON.stringify(manifest,null,2)+'\n');
  for(const name of ['style.css','showcase.js','favicon.svg','_headers']) await copyFile('src/'+name,'dist/'+name);
  await cp('src/assets','dist/assets',{recursive:true});
  await writeFile('dist/404.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found · Felary</title><link rel="stylesheet" href="/style.css"><main class="wrap not-found"><h1>Nothing here.</h1><p>This page could not be found.</p><a href="/">Back to Felary</a></main></html>');
  console.log('Built Felary → dist/ ('+projects.filter(p=>p.release).map(p=>p.name+' '+p.tag).join(', ')+(live?'':', saved releases')+')');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
