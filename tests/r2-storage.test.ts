import assert from 'node:assert/strict';
import test from 'node:test';
import { storageService, r2Storage, googleDriveStorage, getR2BucketName } from '../lib/storage';

test('1. StorageService registers R2 and Google Drive providers', () => {
  const r2Provider = storageService.getProvider('r2');
  assert.equal(r2Provider.name, 'r2');

  const gdriveProvider = storageService.getProvider('google_drive');
  assert.equal(gdriveProvider.name, 'google_drive');

  assert.equal(storageService.name, 'storage_service');
});

test('2. GoogleDriveStorageProvider contracts and safety behavior', async () => {
  // Direct upload to Google Drive must throw an error suggesting R2
  await assert.rejects(
    async () => {
      await googleDriveStorage.upload('test.txt', Buffer.from('test'));
    },
    {
      name: 'Error',
      message: 'Direct file uploads to Google Drive are not supported. Use R2 storage for file uploads.',
    }
  );

  // Exists returns true for valid non-empty links
  const exists = await googleDriveStorage.exists('https://docs.google.com/presentation/d/123/edit');
  assert.equal(exists, true);

  // Signed URL returns original link unchanged
  const signedUrl = await googleDriveStorage.getSignedUrl('https://docs.google.com/presentation/d/123/edit');
  assert.equal(signedUrl, 'https://docs.google.com/presentation/d/123/edit');
});

test('3. R2StorageProvider configuration error checking when credentials missing', () => {
  const originalBucketName = process.env.R2_BUCKET_NAME;
  try {
    delete process.env.R2_BUCKET_NAME;
    assert.throws(
      () => {
        getR2BucketName();
      },
      {
        message: 'Missing R2_BUCKET_NAME in environment variables.',
      }
    );
  } finally {
    if (originalBucketName !== undefined) {
      process.env.R2_BUCKET_NAME = originalBucketName;
    }
  }
});
