import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { escapeHtml, validateProjects, renderProjects, build } from '../scripts/build.mjs';
import { nextTabIndex, featureFrameIndex } from '../src/showcase.js';
const projects = JSON.parse(await readFile(new URL('../src/projects.json',import.meta.url),'utf8'));

test('projects retain source links and exact versioned download URLs', () => {
  assert.equal(validateProjects(projects).length,5);
  const parts=renderProjects(projects);
  assert.equal((parts.downloads.match(/class="download"/g)||[]).length,3);
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

test('spotlight has three matched choices and one visible initial panel', () => {
  const {tabs,panels,stories}=renderProjects(projects);
  assert.equal((tabs.match(/class="app-choice"/g)||[]).length,3);
  assert.equal((panels.match(/ hidden>/g)||[]).length,2);
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
  assert.equal((stories.match(/data-feature-step=/g)||[]).length,9);
  assert.equal((stories.match(/class="feature-frame is-current"/g)||[]).length,3);
  assert.equal((stories.match(/class="feature-inline"/g)||[]).length,9);
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
