import assert from 'node:assert/strict';
import test from 'node:test';
import { readPdfResponse, validatePdfSignature } from '../lib/resources/pdf-buffer';

function responseFromChunks(chunks: Uint8Array[], contentLength?: number): Response {
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk);
        controller.close();
      },
    }),
    contentLength === undefined ? undefined : { headers: { 'Content-Length': String(contentLength) } }
  );
}

test('PDF buffered reader preserves a single response chunk exactly', async () => {
  const expected = new Uint8Array([37, 80, 68, 70, 45, 65, 66]);
  const actual = await readPdfResponse(responseFromChunks([expected], expected.length), new AbortController().signal, () => {});
  assert.deepEqual(actual, expected);
  assert.equal(actual.byteLength, expected.byteLength);
});

test('PDF buffered reader preserves varied chunks without gaps or duplication', async () => {
  const chunks = [new Uint8Array([37, 80]), new Uint8Array([68, 70, 45]), new Uint8Array([0, 1, 2, 255])];
  const expected = new Uint8Array([37, 80, 68, 70, 45, 0, 1, 2, 255]);
  let lastProgress = 0;
  const actual = await readPdfResponse(responseFromChunks(chunks), new AbortController().signal, (loaded) => {
    lastProgress = loaded;
  });
  assert.deepEqual(actual, expected);
  assert.equal(actual.byteLength, expected.byteLength);
  assert.equal(lastProgress, expected.byteLength);
});

test('PDF buffered reader handles an empty response and retains signature validation', async () => {
  const actual = await readPdfResponse(responseFromChunks([], 0), new AbortController().signal, () => {});
  assert.equal(actual.byteLength, 0);
  assert.throws(() => validatePdfSignature(actual), /not a valid PDF/);
});

test('PDF buffered reader rejects truncated content-length responses', async () => {
  await assert.rejects(
    readPdfResponse(responseFromChunks([new Uint8Array([37, 80, 68])], 5), new AbortController().signal, () => {}),
    /ended before all bytes arrived/
  );
});

test('PDF buffered reader propagates stream read errors', async () => {
  const response = new Response(new ReadableStream<Uint8Array>({
    pull(controller) {
      controller.error(new Error('stream read failed'));
    },
  }));
  await assert.rejects(readPdfResponse(response, new AbortController().signal, () => {}), /stream read failed/);
});

test('PDF signature validation rejects invalid and truncated headers', () => {
  assert.doesNotThrow(() => validatePdfSignature(new Uint8Array([37, 80, 68, 70, 45])));
  assert.throws(() => validatePdfSignature(new Uint8Array([0, 1, 2, 3, 4])), /not a valid PDF/);
  assert.throws(() => validatePdfSignature(new Uint8Array([37, 80, 68])), /not a valid PDF/);
});
