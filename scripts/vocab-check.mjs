#!/usr/bin/env node
import { readFileSync, statSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { argv, cwd, env, exit } from 'node:process';
import { execFileSync } from 'node:child_process';

const ROOT = cwd();
const SCAN_ROOTS = ['src', 'messages', 'docs'];
const DOC_ALLOWLIST = new Set([
  'docs/CONTEXT.md',
  'docs/DESIGN.md',
  'docs/GUARDRAILS.md',
  'docs/RUNBOOK.md',
  'docs/SPEC.md',
  'docs/STACK-DECISION.md',
  'docs/sprints/kclub--mvp--sprint-3.md',
  'docs/sprints/kclub--mvp--sprint-4.md',
  'docs/sprints/kclub--mvp--sptint-1.md',
  'docs/sprints/kclub--mvp--sptint-2.md',
]);

const TERMS = [
  'M' + 'LM',
  'multi-' + 'level',
  'aff' + 'iliate',
  'ref' + 'erral commission',
  'ref' + 'erral bonus',
  'passive income',
  'passive_income',
  'earn' + 'ings',
  'income guarantee',
  'bonus per user',
  'wall' + 'et',
  'invest' + 'ment',
  'guaranteed savings',
  'ROI promise',
  'cryp' + 'to',
  'gam' + 'bling',
  'cas' + 'ino',
  'bet' + 'ting',
  'ad' + 'ult',
  'fire' + 'arms',
];

const TERM_RE = new RegExp(TERMS.map(escapeRegExp).join('|'), 'i');

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toPosix(path) {
  return path.split(sep).join('/');
}

function getFilesRecursive(dir) {
  const results = [];
  let list;
  try {
    list = readdirSync(dir);
  } catch (err) {
    return results;
  }
  for (const file of list) {
    const filePath = join(dir, file);
    let stat;
    try {
      stat = statSync(filePath);
    } catch (err) {
      continue;
    }
    if (stat && stat.isDirectory()) {
      results.push(...getFilesRecursive(filePath));
    } else {
      results.push(filePath);
    }
  }
  return results;
}

function listFiles() {
  try {
    const args = ['--files', ...SCAN_ROOTS];
    return execFileSync('rg', args, { cwd: ROOT, encoding: 'utf8' })
      .split(/\r?\n/)
      .filter(Boolean)
      .map(toPosix)
      .filter((path) => !DOC_ALLOWLIST.has(path))
      .filter((path) => /\.(ts|tsx|js|jsx|json|md|mdx|css|html)$/.test(path));
  } catch (e) {
    const allFiles = [];
    for (const root of SCAN_ROOTS) {
      const fullRoot = join(ROOT, root);
      allFiles.push(...getFilesRecursive(fullRoot));
    }
    return allFiles
      .map((p) => relative(ROOT, p))
      .map(toPosix)
      .filter((path) => !DOC_ALLOWLIST.has(path))
      .filter((path) => /\.(ts|tsx|js|jsx|json|md|mdx|css|html)$/.test(path));
  }
}

function formatHit(path, lineNumber, line) {
  return `${path}:${lineNumber}:${line.trim()}`;
}

const allowLocalBypass = argv.includes('--allow-local-bypass') && env.DISABLE_VOCAB_GREP === '1';
if (allowLocalBypass && env.CI !== 'true') {
  console.warn('vocab:check skipped by DISABLE_VOCAB_GREP=1 outside CI.');
  exit(0);
}

const hits = [];
for (const path of listFiles()) {
  const absolutePath = join(ROOT, path);
  if (!statSync(absolutePath).isFile()) continue;
  const lines = readFileSync(absolutePath, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    if (TERM_RE.test(line)) {
      hits.push(formatHit(relative(ROOT, absolutePath), index + 1, line));
    }
  });
}

if (hits.length > 0) {
  console.error('Forbidden vocabulary found in shipped code/copy scope:');
  console.error(hits.join('\n'));
  exit(1);
}

console.log('vocab:check passed');
