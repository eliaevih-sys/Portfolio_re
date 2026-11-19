/** Vérifie liens, ancres et ressources locales de toutes les pages HTML. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlFiles = fs.readdirSync(root).filter((f) => f.endsWith('.html')).sort();
const ids = new Map();

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  ids.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}

const problems = [];
const external = (v) => /^(https?:|mailto:|tel:|data:|javascript:)/i.test(v);

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const refs = [...html.matchAll(/\b(?:href|src)="([^"]*)"/g)].map((m) => m[1]);

  for (const ref of refs) {
    if (!ref || external(ref)) continue;

    if (ref.startsWith('#')) {
      const anchor = ref.slice(1);
      const target = ids.get(file).has(anchor) ? file : (ids.get('index.html').has(anchor) ? 'index.html' : null);
      if (!target) problems.push(`[${file}] ancre introuvable : #${anchor}`);
      continue;
    }

    const [rawPath] = ref.split(/[?#]/);
    let decoded;
    try { decoded = decodeURIComponent(rawPath); } catch { decoded = rawPath; }
    const full = path.join(root, decoded);
    if (!fs.existsSync(full)) problems.push(`[${file}] fichier introuvable : ${ref}`);
  }
}

console.log(`Pages vérifiées : ${htmlFiles.length}`);
console.log(problems.length ? problems.join('\n') : 'Aucun lien ou fichier local manquant.');
