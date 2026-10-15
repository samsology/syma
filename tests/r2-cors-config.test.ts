import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const configPath = resolve(fileURLToPath(new URL('..', import.meta.url)), 'config/r2-cors.json');

test('R2 direct upload CORS allows the production origin with the minimum browser headers', async () => {
  const policy = JSON.parse(await readFile(configPath, 'utf8'));

  assert.ok(policy.allowed.origins.includes('https://syma-nine.vercel.app'));
  assert.ok(policy.allowed.origins.includes('http://localhost:3000'));
  assert.deepEqual(policy.allowed.methods, ['PUT']);
  assert.deepEqual(policy.allowed.headers, ['Content-Type']);
  assert.deepEqual(policy.exposeHeaders, ['ETag']);
  assert.equal(policy.maxAgeSeconds, 3600);
  assert.ok(!policy.allowed.origins.includes('*'));
});
