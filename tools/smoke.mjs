/** Smoke test HTTP : toutes les pages et ressources locales doivent répondre 200. */
import fs from 'node:fs';

const base = 'http://127.0.0.1:8765/';
const files = fs.readdirSync('.').filter((f) => f.endsWith('.html')).sort();
const urls = new Set();

for (const file of files) {
  urls.add(file);
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
    const ref = m[1].split('#')[0];
    if (!ref || /^(https?:|mailto:|tel:|data:|javascript:)/i.test(ref)) continue;
    urls.add(ref);
  }
}

const failures = [];
for (const url of urls) {
  try {
    const res = await fetch(base + url, { redirect: 'manual' });
    if (res.status !== 200) failures.push(`${res.status}  ${url}`);
    await res.arrayBuffer();
  } catch (e) {
    failures.push(`ERR   ${url} — ${e.message}`);
  }
}

console.log(`Ressources testées : ${urls.size}`);
console.log(failures.length ? failures.join('\n') : 'Toutes les ressources répondent 200.');
