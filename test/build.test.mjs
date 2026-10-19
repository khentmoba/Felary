import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { escapeHtml, validateProjects, renderProjects, build } from '../scripts/build.mjs';
import { nextTabIndex } from '../src/showcase.js';
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
  assert.ok(stories.includes('Official application artwork'));
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
    const png=await readFile('dist/assets/'+p.showcase.image);
    assert.equal(png.subarray(1,4).toString(),'PNG');
    assert.equal(png.readUInt32BE(16),p.showcase.imageWidth);
    assert.equal(png.readUInt32BE(20),p.showcase.imageHeight);
  }
  for(const font of ['barlow-condensed-600','manrope-400','manrope-600']) assert.ok((await readFile('dist/assets/fonts/'+font+'.ttf')).length>10000);
  assert.ok((await readFile('dist/_headers','utf8')).includes("script-src 'self'"));
  assert.ok((await readFile('dist/showcase.js','utf8')).includes('aria-selected'));
});
