import { readFile } from 'node:fs/promises';

const bucket = process.env.R2_BUCKET_NAME || 'syma-tech-resources';
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
const apply = process.argv.includes('--apply');
const policy = JSON.parse(await readFile(new URL('../config/r2-cors.json', import.meta.url), 'utf8'));

if (!accountId || !token) {
  throw new Error('Set CLOUDFLARE_ACCOUNT_ID (or R2_ACCOUNT_ID) and CLOUDFLARE_API_TOKEN.');
}

const endpoint = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/r2/buckets/${encodeURIComponent(bucket)}/cors`;
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

const currentResponse = await fetch(endpoint, { headers });
const currentBody = await currentResponse.json();
if (!currentResponse.ok || !currentBody.success) {
  throw new Error(`Unable to read current R2 CORS configuration (${currentResponse.status}). Check token permissions.`);
}

const existingRules = currentBody.result?.rules || [];
if (existingRules.some((rule) => rule.allowed?.origins?.includes('*'))) {
  throw new Error('An existing R2 CORS rule allows every origin. Review it manually before applying the scoped Syma rule.');
}

const rules = [
  ...existingRules.filter((rule) => rule.id !== policy.id),
  policy,
];

if (!apply) {
  console.log(JSON.stringify({ bucket, currentRuleCount: existingRules.length, proposedRules: rules }, null, 2));
  console.log('Read-only check complete. Add --apply to replace the bucket CORS rules with the displayed merged rules.');
  process.exit(0);
}

const updateResponse = await fetch(endpoint, {
  method: 'PUT',
  headers,
  body: JSON.stringify({ rules }),
});
const updateBody = await updateResponse.json();
if (!updateResponse.ok || !updateBody.success) {
  throw new Error(`Cloudflare rejected the R2 CORS update (${updateResponse.status}).`);
}

console.log(`Applied ${policy.id} to bucket ${bucket}; preserved ${existingRules.length} existing non-wildcard rule(s).`);
