import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'vitest';

const LOCALES = ['ru', 'uk'] as const;
const MESSAGES_DIR = join(process.cwd(), 'messages');

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8')) as unknown;
}

function collectKeys(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, child]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    return collectKeys(child, nextPrefix);
  });
}

describe('message key parity', () => {
  const namespaces = readdirSync(join(MESSAGES_DIR, 'en')).filter((file) => file.endsWith('.json'));

  for (const namespace of namespaces) {
    const enKeys = collectKeys(readJson(join(MESSAGES_DIR, 'en', namespace))).sort();

    for (const locale of LOCALES) {
      it(`${locale}/${namespace} matches en keys`, () => {
        const localeKeys = collectKeys(readJson(join(MESSAGES_DIR, locale, namespace))).sort();
        assert.deepEqual(localeKeys, enKeys);
      });
    }
  }
});
