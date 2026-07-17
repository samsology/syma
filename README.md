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

Copy `.env.example` to `.env.local` for local development:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`RESEND_API_KEY` is optional during local development. If it is missing, confirmation emails are skipped and the form submissions still work.

For production, configure these values in your hosting provider and GitHub repository settings:

| Name | Type | Required | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Variable | Yes | Public site URL used for metadata, sitemap, robots, and payment callbacks. |
| `NEXT_PUBLIC_SUPABASE_URL` | Secret | Yes | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Secret | Yes | Supabase anon key used by browser and server clients. |
| `PAYSTACK_SECRET_KEY` | Secret | Yes | Live Paystack secret key for payment initialization and verification. |
| `RESEND_API_KEY` | Secret | No | Enables transactional email sending. |
| `RESEND_FROM_EMAIL` | Variable | No | Defaults to the Resend onboarding sender if unset. Use a verified production sender. |
| `SYMA_REPLY_TO_EMAIL` | Variable | No | Reply-to address for contact confirmations. |
| `NEXT_PUBLIC_GA_ID` | Variable | No | Google Analytics measurement ID. |
| `NEXT_PUBLIC_CLARITY_ID` | Variable | No | Microsoft Clarity project ID. |

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

## Deploying from GitHub

This app uses Next.js server features and API routes, so deploy it to Vercel or another Node.js host rather than GitHub Pages.

1. Push the repository to GitHub.
2. Add the required secrets and variables listed above in GitHub and in the hosting provider.
3. Connect the GitHub repository to Vercel, or deploy on a Node.js platform that runs `npm ci`, `npm run build`, and `npm run start`.
4. Confirm the `Deployment Readiness` GitHub Action passes on `main` or `master`.

The project requires Node.js `>=20.9.0`, matching the installed Next.js version.
