# Syma Tech Solutions

Next.js website for Syma Tech Solutions, a Health & Research Intelligence company.

## Phase 1 MVP Flow

This phase intentionally has no user accounts and no applicant portal.

Applicants can:

- Browse programs
- Submit an application
- Pay for paid programs through Paystack
- Book a consultation
- Contact Syma Tech Solutions
- Receive confirmation emails

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key

RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=Syma Tech Solutions <onboarding@yourdomain.com>
SYMA_REPLY_TO_EMAIL=symatechsolutions@gmail.com
```

`RESEND_API_KEY` is optional during local development. If it is missing, confirmation emails are skipped and the form submissions still work.

## Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run build
```

