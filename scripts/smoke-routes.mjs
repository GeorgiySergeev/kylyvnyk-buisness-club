#!/usr/bin/env node
import { exit } from 'node:process';

const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3000';
const routes = [
  { path: '/en', expected: [200] },
  { path: '/ru', expected: [200] },
  { path: '/uk', expected: [200] },
  { path: '/en/sign-in', expected: [200] },
  { path: '/en/sign-up', expected: [200] },
  { path: '/en/verify-card', expected: [200] },
  { path: '/en/verify-card/VIP-US-NOTFOUND1', expected: [200, 429] },
  { path: '/en/directory', expected: [200] },
  { path: '/en/m/dashboard', expected: [307, 308] },
  { path: '/en/admin', expected: [307, 308] },
];

const failures = [];

for (const route of routes) {
  const url = new URL(route.path, baseUrl);
  try {
    const response = await fetch(url, { redirect: 'manual' });
    const ok = route.expected.includes(response.status);
    const location = response.headers.get('location');
    console.log(`${ok ? 'ok' : 'not ok'} ${route.path} -> ${response.status}${location ? ` ${location}` : ''}`);
    if (!ok) {
      failures.push(`${route.path}: expected ${route.expected.join('/')} got ${response.status}`);
    }
  } catch (error) {
    failures.push(`${route.path}: ${(error instanceof Error ? error.message : String(error))}`);
  }
}

if (failures.length > 0) {
  console.error('smoke:routes failed');
  console.error(failures.join('\n'));
  exit(1);
}

console.log('smoke:routes passed');
