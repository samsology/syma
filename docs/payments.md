# Student checkout and Paystack operations

## Configuration

Set `PAYSTACK_SECRET_KEY` as a server-only Vercel environment variable for each deployment environment. Use test credentials for Preview and local development. `APP_URL` must be the canonical HTTPS origin used to build callbacks; `NEXT_PUBLIC_APP_URL` and the existing `NEXT_PUBLIC_SITE_URL` remain compatible fallbacks. Do not derive callback origins from request headers.

Set `PAYSTACK_SUPPORTED_CURRENCIES` to an explicit comma-separated allowlist. The safe example is `NGN`. Add `USD` only after confirming that the merchant account, country, and Paystack transaction configuration accept USD. The application currently stores NGN and USD prices in minor units (kobo and cents); it does not convert currencies.

The optional `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is not used for hosted checkout. The secret key must never use a `NEXT_PUBLIC_` name.

## Checkout and verification

The student registers/signs in, selects an individual published course, and the server loads price, currency, and eligibility from Prisma. The app stores a pending Order and Payment before asking Paystack to initialize hosted checkout. Return URLs are built from the canonical app URL. A browser return only triggers server-side verification; only a verified reference, amount, currency, and purchase association can activate enrollment. Temporary provider errors leave payment pending.

Configure the Paystack webhook URL as `https://<canonical-domain>/api/payments/webhook/paystack` in the Paystack dashboard. Successful webhook events are signature checked and independently verified against Paystack. No dashboard configuration was made as part of this code change.

## Database rollout

A non-destructive Prisma migration is present at `prisma/migrations/20261020000000_harden_course_payments/migration.sql`. It adds an explicit free-course flag, a FREE enrollment source, and verified provider transaction fields/uniqueness. This migration has been deployed and verified against the production database schema.

Before any future schema rollout, take a database backup and apply through the configured direct migration connection (not the pooled runtime URL if the project separates them):

```powershell
npx prisma migrate deploy
npx prisma generate
```

## International payments and Paystack Dashboard configuration

The Syma Tech Solutions LMS catalogues and charges all courses natively in Nigerian Naira (NGN). International students can enroll and pay using cards issued anywhere in the world through Paystack's international payment processing.

### How international cards work with NGN pricing

1. **Transaction currency**: The course price is billed in NGN (e.g. `₦19,900` = `1,990,000` kobo).
2. **Cardholder conversion**: When an international customer enters their foreign Visa, Mastercard, or American Express card on the hosted Paystack checkout page, their card issuer / bank automatically performs the currency conversion at their bank's daily exchange rate.
3. **No cosmetic conversion**: The website and LMS never perform fake client-side currency conversions or label NGN transactions as USD. The price shown is the exact legal price charged to the payment gateway.

### Enabling international payments in Paystack Dashboard

To accept payments from students outside Nigeria:

1. Log in to your live [Paystack Dashboard](https://dashboard.paystack.com).
2. Go to **Settings** $\rightarrow$ **Preferences**.
3. Under the **Payment Channels & Cards** section, ensure **Accept International Cards** is checked/enabled.
4. If this toggle is locked or disabled, submit the required business compliance documents via **Settings** $\rightarrow$ **Compliance** to complete KYC verification for international card processing.
5. In your Vercel deployment environment variables, ensure `PAYSTACK_SUPPORTED_CURRENCIES` includes `NGN` (e.g. `PAYSTACK_SUPPORTED_CURRENCIES="NGN"`).

### USD Multi-Currency (Optional Future Configuration)

Paystack allows USD transactions only for businesses with an approved USD domiciliary account or US corporate entity. If enabled by Paystack in the future, courses can be individually configured in USD via the Admin CMS without altering existing NGN courses. The application strictly checks that the transaction currency matches the course's configured currency at both initialization and verification.

## Vercel and safe testing

Configure the canonical app URL, supported currency allowlist, and Paystack test credentials in Preview. Configure live credentials and confirmed currency support only in Production. Never put secret values in source control or client variables.

Use Paystack test mode and deterministic mocks for automated tests. Do not use real charges as a deployment check. Inspect the Orders and Payments admin views for stored statuses and references. For a transaction that remains pending, retry the student status check; inspect Paystack's transaction verification and webhook delivery records, then review the matching Payment row by reference. Temporary network/provider errors return a retryable state. The application does not log payment references from webhook requests.
