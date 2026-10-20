# Student checkout and Paystack operations

## Configuration

Set `PAYSTACK_SECRET_KEY` as a server-only Vercel environment variable for each deployment environment. Use test credentials for Preview and local development. `APP_URL` must be the canonical HTTPS origin used to build callbacks; `NEXT_PUBLIC_APP_URL` and the existing `NEXT_PUBLIC_SITE_URL` remain compatible fallbacks. Do not derive callback origins from request headers.

Set `PAYSTACK_SUPPORTED_CURRENCIES` to an explicit comma-separated allowlist. The safe example is `NGN`. Add `USD` only after confirming that the merchant account, country, and Paystack transaction configuration accept USD. The application currently stores NGN and USD prices in minor units (kobo and cents); it does not convert currencies.

The optional `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is not used for hosted checkout. The secret key must never use a `NEXT_PUBLIC_` name.

## Checkout and verification

The student registers/signs in, selects an individual published course, and the server loads price, currency, and eligibility from Prisma. The app stores a pending Order and Payment before asking Paystack to initialize hosted checkout. Return URLs are built from the canonical app URL. A browser return only triggers server-side verification; only a verified reference, amount, currency, and purchase association can activate enrollment. Temporary provider errors leave payment pending.

Configure the Paystack webhook URL as `https://<canonical-domain>/api/payments/webhook/paystack` in the Paystack dashboard. Successful webhook events are signature checked and independently verified against Paystack. No dashboard configuration was made as part of this code change.

## Database rollout

A non-destructive Prisma migration is present at `prisma/migrations/20261020000000_harden_course_payments/migration.sql`. It adds an explicit free-course flag, a FREE enrollment source, and verified provider transaction fields/uniqueness. It has **not** been applied to Supabase.

Before rollout, take a database backup and apply through the configured direct migration connection (not the pooled runtime URL if the project separates them):

```powershell
npx prisma migrate deploy
npx prisma generate
```

Review the migration output and verify the new columns, enum value, and unique index in the target database before enabling checkout. Do not use `db push` or reset for production.

## Vercel and safe testing

Configure the canonical app URL, supported currency allowlist, and Paystack test credentials in Preview. Configure live credentials and confirmed currency support only in Production. Never put secret values in source control or client variables.

Use Paystack test mode and deterministic mocks for automated tests. Do not use real charges as a deployment check. Inspect the Orders and Payments admin views for stored statuses and references. For a transaction that remains pending, retry the student status check; inspect Paystack's transaction verification and webhook delivery records, then review the matching Payment row by reference. Temporary network/provider errors return a retryable state. The application does not log payment references from webhook requests.
