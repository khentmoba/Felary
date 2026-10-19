import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { escapeHtml, validateProjects, renderProjects, build } from '../scripts/build.mjs';
const projects = JSON.parse(await readFile(new URL('../src/projects.json',import.meta.url),'utf8'));
test('content has valid unique projects and verified release-shaped URLs', () => {
  assert.equal(validateProjects(projects).length,5);
  const parts=renderProjects(projects);
  assert.equal((parts.downloads.match(/class="download"/g)||[]).length,3);
  for(const p of projects.filter(p=>p.installer)) {
    assert.ok(parts.downloads.includes('/releases/download/'+encodeURIComponent(p.tag)+'/'+encodeURIComponent(p.installer)));
  }
});
test('unsafe text is escaped and malformed repository paths are rejected', () => {
  assert.equal(escapeHtml('<script>"&'), '&lt;script&gt;&quot;&amp;');
  assert.throws(()=>validateProjects([{...projects[0],repo:'../bad'}]));
  assert.throws(()=>validateProjects([projects[0],projects[0]]));
  assert.throws(()=>validateProjects([{...projects[0],tag:''}]));
  assert.throws(()=>validateProjects([]));
  assert.ok(renderProjects([{...projects[0],name:'<b>test</b>'}]).work.includes('&lt;b&gt;test&lt;/b&gt;'));
});
test('production build contains content, sections, and no unresolved slots', async () => {
  await build();
  const html=await readFile('dist/index.html','utf8');
  assert.ok(!html.includes('<!-- PROJECTS -->'));
  assert.ok(!html.includes('<!-- DOWNLOADS -->'));
  for (const id of ['work','downloads','about']) assert.ok(html.includes('id="'+id+'"'));
  for(const p of projects) assert.ok(html.includes(p.name));
});
