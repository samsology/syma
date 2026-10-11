import assert from 'node:assert/strict';
import test from 'node:test';
import { r2Storage, storageService } from '../lib/storage';
import { resourceSchema } from '../lib/validation/resource';

test('Phase 2.1: Resource Validation Schema supports R2, storageKey, and mimeType', () => {
  const validR2 = resourceSchema.safeParse({
    name: 'Sample R2 Lecture Video',
    description: 'Introduction to Data Analytics video lecture.',
    resourceType: 'VIDEO',
    sourceType: 'R2',
    fileUrl: 'courses/c1/lessons/l1/video/1234-intro.mp4',
    fileType: 'mp4',
    fileSize: '15000000',
    storageKey: 'courses/c1/lessons/l1/video/1234-intro.mp4',
    mimeType: 'video/mp4',
    isDownloadable: 'false',
    isActive: 'true',
  });

  assert.equal(validR2.success, true);
  if (validR2.success) {
    assert.equal(validR2.data.sourceType, 'R2');
    assert.equal(validR2.data.storageKey, 'courses/c1/lessons/l1/video/1234-intro.mp4');
    assert.equal(validR2.data.mimeType, 'video/mp4');
  }
});

test('Phase 2.2: R2 Storage lifecycle (Upload -> Exists -> Signed URL -> Delete)', async (t) => {
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    t.skip('Skipping live R2 bucket test: R2 credentials not present in test environment.');
    return;
  }

  const testKey = `__system-tests__/phase2-test-${Date.now()}.txt`;
  const testContent = Buffer.from('Syma Tech Phase 2 automated test payload.', 'utf-8');

  // 1. Upload
  const uploadRes = await r2Storage.upload(testKey, testContent, {
    contentType: 'text/plain; charset=utf-8',
  });
  assert.equal(uploadRes.key, testKey);

  // 2. Confirm object exists
  const exists = await r2Storage.exists(testKey);
  assert.equal(exists, true);

  // 3. Confirm signed URL generation
  const signedUrl = await r2Storage.getSignedUrl(testKey, 3600);
  assert.ok(signedUrl.includes(encodeURIComponent(testKey)) || signedUrl.includes(testKey));
  assert.ok(signedUrl.startsWith('https://'));

  // 4. Delete object
  const deleted = await r2Storage.delete(testKey);
  assert.equal(deleted, true);

  // 5. Confirm deletion
  const existsAfter = await r2Storage.exists(testKey);
  assert.equal(existsAfter, false);
});

test('Phase 2.3: StorageService routes provider operations cleanly', async () => {
  const r2Provider = storageService.getProvider('r2');
  const gdriveProvider = storageService.getProvider('google_drive');

  assert.equal(r2Provider.name, 'r2');
  assert.equal(gdriveProvider.name, 'google_drive');

  // Legacy Google Drive signed URL returns URL unchanged
  const gdriveUrl = 'https://docs.google.com/presentation/d/12345/embed';
  const resolvedUrl = await gdriveProvider.getSignedUrl(gdriveUrl);
  assert.equal(resolvedUrl, gdriveUrl);
});
