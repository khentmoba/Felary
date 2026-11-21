import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const isSafeName = v => typeof v === 'string' && /^[a-zA-Z0-9_.-]+$/.test(v) && v !== '.' && v !== '..';
const owner = 'khentmoba';

// Release notes are Markdown written for GitHub. Keep the readable lines and drop the plumbing.
export function releaseNotes(body) {
  if (typeof body !== 'string') return [];
  const lines = body.replaceAll('\r\n', '\n').split('\n').map(l => l.trim());
  const bullets = lines.filter(l => /^[-*+]\s+/.test(l)).map(l => l.replace(/^[-*+]\s+/, ''));
  const picked = bullets.length ? bullets : lines.filter(l => l && !/^(#|\*\*Full Changelog|<!--)/i.test(l)).slice(0, 1);
  return picked
    .map(l => l
      .replace(/\s+by @[\w-]+ in https?:\/\/\S+$/i, '')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/(\*\*|__|`)/g, '')
      .replace(/^(feat|fix|perf|chore|refactor|docs|build|ci|style|test)(\([^)]*\))?!?:\s*/i, '')
      .replace(/;\s*(feat|fix|perf|chore|refactor|docs)(\([^)]*\))?:\s*/gi, '; ')
      .trim())
    .filter(l => l.length > 2)
    .map(l => (l[0].toUpperCase() + l.slice(1)).replace(/([^.!?])$/, '$1.'))
    .slice(0, 8);
}

const matcher = pattern => new RegExp(pattern);

// Turn a GitHub "latest release" response into the fields the site renders, or null if it can't be trusted.
export function fromGitHub(p, json) {
  const rule = p.release;
  if (!rule || !json || json.draft || json.prerelease) return null;
  const tag = json.tag_name;
  const names = (json.assets || []).map(a => a.name).filter(isSafeName);
  const installer = names.find(n => n.endsWith('.exe') && matcher(rule.installer).test(n));
  const date = new Date(json.published_at);
  if (!isSafeName(tag) || !installer || Number.isNaN(date.getTime())) return null;
  const extras = (p.page?.extras || []).map(e => ({ ...e, file: names.find(n => n.endsWith('.exe') && matcher(e.pattern || '^' + e.file.replaceAll('.', '\\.') + '$').test(n)) })).filter(e => e.file);
  return { tag, version: tag.replace(/^v(?=\d)/, ''), installer, extras, released: date.toISOString().slice(0, 10), notes: releaseNotes(json.body) };
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function latest(p, { fetchImpl = fetch, token, retries = fetchImpl === fetch ? 2 : 0, retryDelayMs = 500 } = {}) {
  const headers = { accept: 'application/vnd.github+json', 'user-agent': 'felary-site-build' };
  if (token) headers.authorization = 'Bearer ' + token;
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchImpl(`https://api.github.com/repos/${owner}/${encodeURIComponent(p.repo)}/releases/latest`, { headers, signal: AbortSignal.timeout(10000) });
      if (!res.ok) {
        const err = new Error(`${p.repo}: GitHub answered ${res.status}`);
        if ((res.status >= 500 || res.status === 429) && attempt < retries) {
          lastError = err;
          if (retryDelayMs > 0) await sleep(retryDelayMs * (attempt + 1));
          continue;
        }
        throw err;
      }
      const release = fromGitHub(p, await res.json());
      if (!release) throw new Error(`${p.repo}: latest release has no matching installer`);
      return release;
    } catch (error) {
      if (error.message?.startsWith(`${p.repo}:`) || attempt >= retries) throw error;
      lastError = error;
      if (retryDelayMs > 0) await sleep(retryDelayMs * (attempt + 1));
    }
  }
  throw lastError;
}

// Ask GitHub for each app's newest release. In strict mode, fail on any error instead of falling back.
export async function fetchReleases(projects, options = {}) {
  const { strict = false } = options;
  const found = {};
  const failures = [];
  await Promise.all(projects.filter(p => p.release).map(async p => {
    try { found[p.repo] = await latest(p, options); }
    catch (error) {
      if (strict) failures.push(`${p.name}: ${error.message}`);
      else console.warn(`Releases: keeping the saved ${p.name} release (${error.message}).`);
    }
  }));
  if (failures.length) throw new Error('Release fetch failed in strict mode: ' + failures.join('; '));
  return found;
}

// Overlay release data onto projects without touching anything else.
export function applyReleases(projects, ...sources) {
  return projects.map(p => {
    const r = sources.map(s => s?.[p.repo]).find(Boolean);
    if (!r) return p;
    const extras = p.page?.extras && r.extras
      ? p.page.extras.flatMap(e => {
          const match = r.extras.find(x => x.label === e.label);
          return match ? [{ ...e, file: match.file }] : [];
        })
      : p.page?.extras;
    const page = p.page ? { ...p.page, ...(extras !== undefined ? { extras } : {}) } : undefined;
    return { ...p, tag: r.tag, version: r.version, installer: r.installer, released: r.released, notes: r.notes, ...(page ? { page } : {}) };
  });
}

// `npm run releases` refreshes the saved snapshot that offline builds fall back to.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const projects = JSON.parse(await readFile('src/projects.json', 'utf8'));
  const saved = JSON.parse(await readFile('src/releases.json', 'utf8').catch(() => '{}'));
  const found = await fetchReleases(projects, { token: process.env.GITHUB_TOKEN });
  await writeFile('src/releases.json', JSON.stringify(Object.fromEntries(Object.entries({ ...saved, ...found }).sort(([a], [b]) => a.localeCompare(b))), null, 2) + '\n');
  for (const [repo, r] of Object.entries(found)) console.log(`${repo} ${r.tag} (${r.released})`);
}
