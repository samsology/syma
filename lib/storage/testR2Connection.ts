import { r2Storage } from './r2Storage';

export interface R2TestResult {
  success: boolean;
  message: string;
  details: {
    step1Upload: boolean;
    step2Exists: boolean;
    step3Metadata: boolean;
    step4Delete: boolean;
    step5ConfirmDeleted: boolean;
  };
  error?: string;
}

export async function verifyR2Connection(): Promise<R2TestResult> {
  const testKey = '__system-tests__/r2-connection-test.txt';
  const testContent = Buffer.from('Syma Tech R2 connection test.', 'utf-8');

  const details = {
    step1Upload: false,
    step2Exists: false,
    step3Metadata: false,
    step4Delete: false,
    step5ConfirmDeleted: false,
  };

  try {
    // 1. Upload test object
    const uploadRes = await r2Storage.upload(testKey, testContent, {
      contentType: 'text/plain; charset=utf-8',
    });
    if (!uploadRes.key) {
      throw new Error('Upload succeeded but no object key returned.');
    }
    details.step1Upload = true;

    // 2. Confirm object exists
    const exists = await r2Storage.exists(testKey);
    if (!exists) {
      throw new Error('Object upload appeared to succeed, but object does not exist in bucket.');
    }
    details.step2Exists = true;

    // 3. Confirm metadata can be fetched
    const meta = await r2Storage.getMetadata(testKey);
    if (!meta) {
      throw new Error('Failed to retrieve metadata for uploaded object.');
    }
    details.step3Metadata = true;

    // 4. Delete test object
    const deleted = await r2Storage.delete(testKey);
    if (!deleted) {
      throw new Error('Failed to issue delete command for test object.');
    }
    details.step4Delete = true;

    // 5. Confirm object deletion
    const existsAfterDelete = await r2Storage.exists(testKey);
    if (existsAfterDelete) {
      throw new Error('Delete command issued, but object still exists in bucket.');
    }
    details.step5ConfirmDeleted = true;

    return {
      success: true,
      message: 'R2 connection test completed successfully. Object written, verified, and cleaned up.',
      details,
    };
  } catch (err: unknown) {
    const error = err as Error;
    return {
      success: false,
      message: `R2 connection test failed: ${error.message || 'Unknown error'}`,
      details,
      error: error.message || String(err),
    };
  }
}
