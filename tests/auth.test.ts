import assert from 'node:assert/strict';
import test from 'node:test';
import { adminLoginSchema } from '../lib/validation/login';
import { createSessionToken, hashToken } from '../lib/auth/crypto';
import { lessonSchema } from '../lib/validation/lesson';
import { moduleSchema } from '../lib/validation/module';
import { resourceSchema } from '../lib/validation/resource';
import { weekSchema } from '../lib/validation/week';

test('login schema accepts valid credentials', () => {
  const parsed = adminLoginSchema.safeParse({
    email: 'admin@example.com',
    password: 'correct horse battery staple',
  });

  assert.equal(parsed.success, true);
});

test('login schema rejects invalid email', () => {
  const parsed = adminLoginSchema.safeParse({
    email: 'not-an-email',
    password: 'password',
  });

  assert.equal(parsed.success, false);
});

test('login schema rejects missing password', () => {
  const parsed = adminLoginSchema.safeParse({
    email: 'admin@example.com',
    password: '',
  });

  assert.equal(parsed.success, false);
});

test('session tokens are random and hashed before storage', () => {
  const firstToken = createSessionToken();
  const secondToken = createSessionToken();
  const firstHash = hashToken(firstToken);

  assert.notEqual(firstToken, secondToken);
  assert.notEqual(firstHash, firstToken);
  assert.equal(firstHash.length, 64);
  assert.equal(hashToken(firstToken), firstHash);
});

test('week schema accepts coerced week numbers', () => {
  const parsed = weekSchema.safeParse({
    weekNumber: '2',
    title: 'Data Collection',
    description: 'Collect reliable data.',
  });

  assert.equal(parsed.success, true);
  if (parsed.success) assert.equal(parsed.data.weekNumber, 2);
});

test('module schema rejects empty titles', () => {
  const parsed = moduleSchema.safeParse({
    title: ' ',
    description: 'Module details',
  });

  assert.equal(parsed.success, false);
});

test('lesson schema validates slugs and lesson status', () => {
  const parsed = lessonSchema.safeParse({
    title: 'Understanding Data Types',
    slug: 'understanding-data-types',
    lessonType: 'TEXT',
    content: 'Lesson content',
    duration: '30',
    isPreview: true,
    status: 'DRAFT',
  });

  assert.equal(parsed.success, true);
});

test('resource schema rejects unsupported file types', () => {
  const parsed = resourceSchema.safeParse({
    name: 'Installer',
    fileUrl: 'https://example.com/install.exe',
    fileType: 'exe',
    fileSize: '1000',
  });

  assert.equal(parsed.success, false);
});
