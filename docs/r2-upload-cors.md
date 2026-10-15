# Syma Tech R2 direct upload CORS

The admin uploader sends the file directly from the browser to R2 using a presigned `PUT`. Video and document bytes do not pass through a Vercel request body.

## Current request contract

- Bucket: `syma-tech-resources` (`R2_BUCKET_NAME`)
- Endpoint: `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com` unless `R2_ENDPOINT` overrides it
- Production browser origin: `https://syma-nine.vercel.app`
- Local browser origin: `http://localhost:3000`
- Method: `PUT`
- Explicit browser request header: `Content-Type`, set to the exact MIME type returned by the upload authorization endpoint
- The server signs `ContentType` with the same MIME type and returns the URL with a 900-second expiry
- Browser-managed `Content-Length` is not set by application code and is not needed in `AllowedHeaders`; the client does not send `Content-MD5` or `x-amz-checksum-*` headers
- The browser upload code does not read the `ETag` response header, but it remains exposed for upload clients that need it

For the request currently implemented, the preflight must permit the exact origin, `PUT`, and `Content-Type`. It must not use a wildcard origin. This policy does not make the bucket public; R2 objects continue to be reached through the app's authorized resource access flow.

## Repeatable configuration

`config/r2-cors.json` is the managed policy. `scripts/configure-r2-cors.mjs` uses Cloudflare's R2 bucket CORS API and preserves existing rules other than the managed rule. It first refuses to apply if an existing rule allows `*`.

Set `CLOUDFLARE_ACCOUNT_ID` (or reuse `R2_ACCOUNT_ID`) and `CLOUDFLARE_API_TOKEN` in the local shell. The token needs permission to read and edit R2 bucket CORS configuration. Do not place it in client-side environment variables or commit it.

```powershell
node scripts/configure-r2-cors.mjs
node scripts/configure-r2-cors.mjs --apply
```

The first command is read-only and prints the merged rules. The second sends the update. Cloudflare's API update replaces the bucket's rule list, so the script reads and preserves unrelated rules before writing. Re-run the check after applying to verify the saved result.

## Browser verification

From the production admin curriculum page, inspect DevTools **Network**. The upload should show an `OPTIONS` preflight, then a direct R2 `PUT` whose request headers include `Content-Type` matching the presign response. `Access-Control-Request-Headers` should reflect only that application-set header (browser-managed headers may vary by browser). Do not share the full presigned URL; its query string is a temporary credential.

The client can distinguish readable HTTP failures such as 403, 404, 413, and R2 5xx responses. A browser `XMLHttpRequest.onerror` does not reveal whether status 0 came from CORS, DNS, TLS, or a disconnected network, so the UI describes that ambiguity and directs the admin to inspect `OPTIONS` and `PUT` in Network instead of asserting that every such failure is CORS.

## Cloudflare references

- [Cloudflare API: update R2 bucket CORS](https://developers.cloudflare.com/api/resources/r2/subresources/buckets/subresources/cors/methods/update/)
- [Cloudflare API: get R2 bucket CORS](https://developers.cloudflare.com/api/resources/r2/subresources/buckets/subresources/cors/methods/get/)
