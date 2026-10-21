import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { escapeHtml, validateProjects, renderProjects, renderAppPage, pageHref, build } from '../scripts/build.mjs';
import { nextTabIndex, featureFrameIndex } from '../src/showcase.js';
const projects = JSON.parse(await readFile(new URL('../src/projects.json',import.meta.url),'utf8'));

test('projects retain source links and exact versioned download URLs', () => {
  assert.equal(validateProjects(projects).length,6);
  const parts=renderProjects(projects);
  assert.equal((parts.downloads.match(/class="download"/g)||[]).length,4);
  for(const p of projects.filter(p=>p.installer)) {
    const path='/releases/download/'+encodeURIComponent(p.tag)+'/'+encodeURIComponent(p.installer);
    assert.ok(parts.downloads.includes(path));
    assert.ok(parts.stories.includes(path));
  }
  assert.ok(parts.work.includes('LUNA EXPRESS'));
  assert.ok(parts.work.includes('SLSS'));
});

test('unsafe text is escaped and malformed content is rejected', () => {
  assert.equal(escapeHtml('<script>"&'), '&lt;script&gt;&quot;&amp;');
  for (const content of [[],[projects[0],projects[0]],[{...projects[0],repo:'../bad'}],[{...projects[0],tag:''}],[{...projects[0],installer:undefined}]]) assert.throws(()=>validateProjects(content));
  const unsafe=renderProjects([{...projects[0],name:'<b>test</b>'}]);
  assert.ok(unsafe.stories.includes('&lt;b&gt;test&lt;/b&gt;'));
  assert.ok(!unsafe.stories.includes('<b>test</b>'));
  for(const showcase of [{...projects[0].showcase,image:'../bad.png'},{...projects[0].showcase,tone:'" onmouseover="bad'},{...projects[0].showcase,features:[]},{...projects[0].showcase,imageWidth:0}]) assert.throws(()=>validateProjects([{...projects[0],showcase}]));
});

test('spotlight has four matched choices and one visible initial panel', () => {
  const {tabs,panels,stories}=renderProjects(projects);
  assert.equal((tabs.match(/class="app-choice"/g)||[]).length,4);
  assert.equal((panels.match(/ hidden>/g)||[]).length,3);
  for(const p of projects.filter(p=>p.showcase)) {
    const slug=p.repo.toLowerCase();
    assert.ok(tabs.includes('data-panel="spotlight-'+slug+'"'));
    assert.ok(panels.includes('id="spotlight-'+slug+'"'));
    assert.ok(stories.includes('id="app-'+slug+'"'));
    for(const f of p.showcase.features) assert.ok(stories.includes(escapeHtml(f)));
  }
  assert.ok(stories.includes('Actual Cinder interface · demo data, not personal usage.'));
  assert.equal(projects.find(p=>p.repo==='Cinder').showcase.artwork,undefined);
  assert.ok(!panels.includes('spotlight-panel cobalt artwork'));
  assert.ok(panels.includes('fetchpriority="high"'));
});

test('spotlight keyboard selection wraps and supports first and last', () => {
  assert.equal(nextTabIndex(0,'ArrowLeft',3),2);
  assert.equal(nextTabIndex(2,'ArrowRight',3),0);
  assert.equal(nextTabIndex(0,'ArrowUp',3),2);
  assert.equal(nextTabIndex(2,'ArrowDown',3),0);
  assert.equal(nextTabIndex(1,'Home',3),0);
  assert.equal(nextTabIndex(0,'End',3),2);
  assert.equal(nextTabIndex(1,'Tab',3),1);
  assert.equal(nextTabIndex(1,' ',3),1);
});

test('feature scenes match every statement and use safe, complete image metadata', () => {
  const {stories}=renderProjects(projects);
  assert.equal((stories.match(/data-feature-step=/g)||[]).length,12);
  assert.equal((stories.match(/class="feature-frame is-current"/g)||[]).length,4);
  assert.equal((stories.match(/class="feature-inline"/g)||[]).length,12);
  for(const p of projects.filter(p=>p.showcase)) {
    assert.equal(p.showcase.scenes.length,p.showcase.features.length);
    for(const scene of p.showcase.scenes) assert.ok(stories.includes('/assets/'+scene.image));
  }
  const first=projects[0];
  assert.throws(()=>validateProjects([{...first,showcase:{...first.showcase,scenes:[]}}]));
  for(const invalid of [{...first.showcase.scenes[0],image:'../private.png'},{...first.showcase.scenes[0],imageAlt:''},{...first.showcase.scenes[0],imageWidth:0}]) {
    assert.throws(()=>validateProjects([{...first,showcase:{...first.showcase,scenes:[invalid,...first.showcase.scenes.slice(1)]}}]));
  }
});

test('feature frames wait for the pinned, introduction-cleared reading phase', () => {
  assert.equal(featureFrameIndex([-20,196,412],48,false),0);
  assert.equal(featureFrameIndex([75,291,507],48,true),0);
  assert.equal(featureFrameIndex([48,264,480],48,true),1);
  assert.equal(featureFrameIndex([-168,48,264],48,true),2);
  assert.equal(featureFrameIndex([-384,-168,48],48,true),3);
  assert.equal(featureFrameIndex([-100,116,332],48,true),1);
  assert.equal(featureFrameIndex([-20,196,412],48,false),0);
});

test('scroll position selects the matching frame and restores it in reverse', () => {
  assert.equal(featureFrameIndex([600,800,1000],450),0);
  assert.equal(featureFrameIndex([400,600,800],450),1);
  assert.equal(featureFrameIndex([200,400,600],450),2);
  assert.equal(featureFrameIndex([0,200,400],450),3);
  assert.equal(featureFrameIndex([200,400,600],450),2);
  assert.equal(featureFrameIndex([600,800,1000],450),0);
  assert.equal(featureFrameIndex([],450),0);
});

test('Everglow introduces only the public media sections', () => {
  const p=projects.find(p=>p.repo==='Everglow-Desktop');
  const publicCopy=[p.description,p.showcase.headline,p.showcase.intro,...p.showcase.features].join(' ').toLowerCase();
  for(const section of ['cinema','anime','books','manga','manhwa']) assert.ok(publicCopy.includes(section));
  assert.ok(!/khent|clair|private world|sign-in profile/.test(publicCopy));
  assert.ok(!JSON.stringify(p).includes('everglow.png'));
});

test('scroll motion is native, opt-in, and leaves the static fallback intact', async () => {
  const css=await readFile('src/style.css','utf8');
  const motion=css.slice(css.indexOf('@supports (animation-timeline: view())'));
  assert.ok(motion.startsWith('@supports (animation-timeline: view())'));
  assert.ok(motion.includes('@media (prefers-reduced-motion: no-preference)'), 'scroll animation must not be restricted to wide desktop viewports');
  assert.ok(motion.includes('@media (min-width: 900px) and (min-height: 700px)'), 'only the sticky layout is desktop-specific');
  assert.ok(motion.includes('position: sticky;'));
  assert.ok(motion.includes('animation-timeline: --exhibition;'));
  assert.ok(motion.includes('animation-timeline: view();'));
  assert.ok(!motion.includes('opacity: 0'));
  assert.ok(!motion.includes('display: none'));
  const js=await readFile('src/showcase.js','utf8');
  assert.ok(!/addEventListener\(['"](?:scroll|wheel|touchmove)['"]/.test(js));
});

test('production includes complete stories, local assets, unique IDs and valid anchors', async () => {
  await build();
  const html=await readFile('dist/index.html','utf8');
  assert.ok(!/<!-- (PROJECTS|DOWNLOADS|APP STORIES|SPOTLIGHT)/.test(html));
  for(const id of ['work','downloads','about']) assert.ok(html.includes('id="'+id+'"'));
  for(const p of projects) assert.ok(html.includes(p.name));
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length);
  for(const [,id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(id),'Missing anchor: '+id);
  for(const p of projects.filter(p=>p.showcase)) {
    for(const scene of [p.showcase,...p.showcase.scenes]) {
      const png=await readFile('dist/assets/'+scene.image);
      assert.equal(png.subarray(1,4).toString(),'PNG');
      assert.equal(png.readUInt32BE(16),scene.imageWidth);
      assert.equal(png.readUInt32BE(20),scene.imageHeight);
    }
  }
  await assert.rejects(readFile('dist/assets/everglow.png'));
  for(const font of ['barlow-condensed-600','manrope-400','manrope-600']) assert.ok((await readFile('dist/assets/fonts/'+font+'.ttf')).length>10000);
  assert.ok((await readFile('dist/_headers','utf8')).includes("script-src 'self'"));
  assert.ok((await readFile('dist/showcase.js','utf8')).includes('aria-selected'));
});

test('every featured app gets a dedicated page with its own hero, details and download', () => {
  const featured=projects.filter(p=>p.showcase);
  assert.deepEqual(featured.map(p=>pageHref(p)),['/apps/felaris/','/apps/speakflow/','/apps/cinder/','/apps/everglow/']);
  const {panels,stories,downloads}=renderProjects(projects);
  for(const p of featured) {
    for(const part of [panels,stories,downloads]) assert.ok(part.includes('href="'+pageHref(p)+'"'),'Home links to '+p.name);
    const html=renderAppPage(p,projects);
    assert.ok(html.includes('<h1 id="app-name">'+escapeHtml(p.name)+'</h1>'));
    assert.ok(html.includes(escapeHtml(p.page.summary)));
    assert.ok(html.includes('/releases/download/'+encodeURIComponent(p.tag)+'/'+encodeURIComponent(p.installer)));
    for(const s of p.page.sections) assert.ok(html.includes('id="'+s.id+'"'));
    for(const o of featured.filter(o=>o!==p)) assert.ok(html.includes('href="'+pageHref(o)+'"'));
    assert.ok(!html.includes('href="'+pageHref(p)+'"'),'A page does not link to itself');
  }
  assert.ok(renderAppPage(featured[0],projects).includes('/releases/download/v0.3.1/felaris.exe'));
});

test('app page content is validated and escaped', () => {
  const p=projects.find(p=>p.page);
  const page=section=>[{...p,page:{...p.page,sections:[section]}}];
  for(const bad of [{id:'x',title:'T'},{id:'x',title:'T',items:[{title:'a',text:'b'}],table:{columns:['a'],rows:[['b']]}},{id:'x',title:'T',table:{columns:['a','b'],rows:[['only one']]}},{id:'features',title:'T',items:[{title:'a',text:'b'}]},{id:'<x>',title:'T',items:[{title:'a',text:'b'}]}]) assert.throws(()=>validateProjects(page(bad)));
  for(const g of [{...p.page,icon:'../x.png'},{...p.page,facts:[]},{...p.page,requirements:[]},{...p.page,extras:[{label:'x',file:'x.zip'}]}]) assert.throws(()=>validateProjects([{...p,page:g}]));
  assert.throws(()=>validateProjects([{...p,showcase:undefined}]));
  assert.throws(()=>validateProjects([p,{...p,repo:'Other'}]));
  const html=renderAppPage({...p,page:{...p.page,summary:'<img src=x onerror=alert(1)>'}},projects);
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
});

test('built app pages have unique IDs, valid anchors and existing local assets', async () => {
  await build();
  for(const p of projects.filter(p=>p.page)) {
    const html=await readFile('dist'+pageHref(p)+'index.html','utf8');
    const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(new Set(ids).size,ids.length);
    for(const [,id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(id),p.name+' missing anchor: '+id);
    for(const [,asset] of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) await readFile('dist'+asset);
    const icon=await readFile('dist/assets/'+p.page.icon);
    assert.equal(icon.readUInt32BE(16),p.page.iconWidth);
    assert.equal(icon.readUInt32BE(20),p.page.iconHeight);
  }
});
