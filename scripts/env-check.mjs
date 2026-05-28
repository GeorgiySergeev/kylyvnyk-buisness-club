#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { exit } from 'node:process';

const ROOT = process.cwd();
const ENV_EXAMPLE = join(ROOT, '.env.example');
const ENV_DOC = join(ROOT, 'docs', 'ENV.md');
const SOURCE_FILES = [
  'src/lib/env.ts',
  '.env.example',
  'docs/ENV.md',
];

function read(path) {
  return readFileSync(path, 'utf8');
}

function parseExampleKeys() {
  return read(ENV_EXAMPLE)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && line.includes('='))
    .map((line) => line.replace(/^#\s*/, '').split('=')[0].trim())
    .filter(Boolean)
    .sort();
}

function parseEnvSchemaKeys() {
  const envSource = read(join(ROOT, 'src', 'lib', 'env.ts'));
  const schemaBody = envSource.match(/const envSchema = z\.object\(\{([\s\S]*?)\n\}\);/);
  if (!schemaBody) {
    throw new Error('Could not locate envSchema in src/lib/env.ts');
  }

  return [...schemaBody[1].matchAll(/^\s{2}([A-Z0-9_]+):/gm)]
    .map((match) => match[1])
    .sort();
}

function findMissingDocKeys(keys) {
  const doc = read(ENV_DOC);
  return keys.filter((key) => !doc.includes(`#### \`${key}\``));
}

const exampleKeys = parseExampleKeys();
const schemaKeys = parseEnvSchemaKeys();
const missingFromExample = schemaKeys.filter((key) => !exampleKeys.includes(key));
const missingFromSchema = exampleKeys.filter((key) => !schemaKeys.includes(key));
const missingFromDocs = findMissingDocKeys(exampleKeys);

const issues = [];
if (missingFromExample.length > 0) {
  issues.push(`Missing from .env.example: ${missingFromExample.join(', ')}`);
}
if (missingFromSchema.length > 0) {
  issues.push(`Missing from src/lib/env.ts envSchema: ${missingFromSchema.join(', ')}`);
}
if (missingFromDocs.length > 0) {
  issues.push(`Missing docs/ENV.md sections: ${missingFromDocs.join(', ')}`);
}

for (const path of SOURCE_FILES) {
  read(join(ROOT, path));
}

if (issues.length > 0) {
  console.error('env:check failed');
  console.error(issues.join('\n'));
  exit(1);
}

console.log(`env:check passed (${exampleKeys.length} env vars)`);
