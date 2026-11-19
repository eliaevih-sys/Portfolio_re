/**
 * Contrôle automatique des règles de DESIGN.md.
 *
 * Usage : node tools/check-design.mjs
 * Sortie : une ligne par contrôle, puis le nombre total de violations.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceFiles = [
  "index.html",
  "style.css",
  "script.js",
  ...fs.readdirSync(root).filter((name) => name.endsWith(".html") && name !== "index.html").sort().map((name) => name),
  ...fs.readdirSync(path.join(root, "tools")).filter((name) => name.endsWith(".mjs") && name !== "check-design.mjs").sort().map((name) => path.join("tools", name)),
];
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const css = read("style.css");
const violations = [];

const add = (check, file, line, text) => {
  violations.push({ check, file, line, text });
};

/* ---------- 1. Jamais `ease-in` (mais `--ease-in-out` est autorisé) ---------- */
const easeIn = /\bease-in(?![\w-])/g;
for (const file of sourceFiles) {
  read(file).split("\n").forEach((text, i) => {
    if (easeIn.test(text)) add("ease-in", file, i + 1, text.trim());
    easeIn.lastIndex = 0;
  });
}

/* ---------- 2. Jamais `transition: all` ---------- */
const transitionAll = /\btransition(?:-property)?\s*:\s*[^;]*\ball\b/i;
for (const file of sourceFiles) {
  read(file).split("\n").forEach((text, i) => {
    if (transitionAll.test(text)) add("transition: all", file, i + 1, text.trim());
  });
}

/* ---------- 3. Aucun hex hors tokens et commentaires ---------- */
let cssForScan = css
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/:root\s*\{[\s\S]*?\n\}/g, "");
cssForScan.split("\n").forEach((text, i) => {
  const match = text.match(/#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/);
  if (match) add("hex hors token", "style.css", i + 1, text.trim());
});

/* ---------- 4. Durées UI < 300 ms (hors révélations et bandeaux) ---------- */
const withoutReveals = css
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/[^{}]*\[data-reveal\][^{}]*\{[\s\S]*?\}/g, "");
for (const [index, line] of withoutReveals.split("\n").entries()) {
  const declarations = line.match(/transition\s*:[^;]+;/g) || [];
  for (const declaration of declarations) {
    for (const match of declaration.matchAll(/(\d+(?:\.\d+)?)\s*(s|ms)\b/g)) {
      const ms = match[2] === "s" ? Number(match[1]) * 1000 : Number(match[1]);
      if (ms >= 300) {
        add("durée >= 300ms", "style.css", index + 1, declaration.trim());
      }
    }
  }
}

/* ---------- 5. Un seul coin arrondi ---------- */
css.split("\n").forEach((text, i) => {
  if (/border-radius:\s*0\s+clamp\(/.test(text)) {
    add("rayon en dur", "style.css", i + 1, text.trim());
  }
});

/* ---------- Rapport ---------- */
const checks = [
  "ease-in",
  "transition: all",
  "hex hors token",
  "durée >= 300ms",
  "rayon en dur",
];
for (const check of checks) {
  const found = violations.filter((item) => item.check === check);
  console.log(`${found.length === 0 ? "OK  " : "FAIL"} ${check}${found.length ? ` (${found.length})` : ""}`);
  for (const item of found) console.log(`     ${item.file}:${item.line} — ${item.text}`);
}
console.log(`\nViolations : ${violations.length}`);
process.exitCode = violations.length ? 1 : 0;
