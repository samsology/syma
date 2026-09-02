# Phase 6: Orders, Payments, and Enrollment Billing

## Architecture

Phase 6 adds a commerce layer between public course interest and student course access:

```text
Student
  -> Course
  -> Order
  -> Payment
  -> Provider Verification
  -> Order = PAID
  -> Enrollment = ACTIVE
```

Courses define the product and current price. Orders snapshot the purchase amount. Payments represent provider transaction attempts. Enrollments represent learning access.

## Database

New enums:

- `Currency`: `USD`, `NGN`
- `OrderStatus`: `PENDING`, `PAID`, `FAILED`, `CANCELLED`, `REFUNDED`, `EXPIRED`
- `PaymentStatus`: `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`, `REFUNDED`
- `PaymentProvider`: `PAYSTACK`
- `EnrollmentSource`: `MANUAL`, `PAYMENT`

New models:

- `Order`: unique public `orderNumber`, student, course, amount snapshot, currency, status, expiration, and paid timestamp.
- `Payment`: order attempt, provider, provider reference, provider checkout URL, amount snapshot, currency, status, and safe failure metadata.

Updated models:

- `Course`: `priceMinor`, `currency`, `benefits`, `cta`, and `sortOrder`.
- `Enrollment`: `source` and optional `orderId`.

Important constraints:

- `Order.orderNumber` is unique and safe to display.
- `Payment.provider + providerReference` is unique for idempotency.
- `Enrollment.orderId` is unique.
- `Enrollment.studentId + courseId` still prevents duplicate course access records.

## Provider

The implemented provider is **Paystack**.

Provider-specific code is isolated under:

```text
lib/payments/providers/paystack.ts
```

The generic application layer uses:

```text
lib/payments/types.ts
lib/payments/provider.ts
lib/payments/service.ts
lib/payments/rules.ts
```

## Checkout Flow

Student enrollment now follows this path for paid courses:

```text
/programs
  -> /student/enroll?courseId=...
  -> create or reuse Order
  -> /checkout/[orderNumber]
  -> initialize Paystack payment
  -> Paystack hosted checkout
  -> /checkout/[orderNumber]/status?reference=...
  -> server verifies provider transaction
  -> Order = PAID
  -> Enrollment = ACTIVE
```

Free courses use the same order service and create a zero-amount paid order plus active enrollment without contacting Paystack.

## Security

Price integrity:

- The browser submits only `courseId` or `orderNumber`.
- Amount and currency come from the database.
- `Order.amountMinor` preserves the price snapshot at purchase time.
- Payment verification compares provider amount and currency against the order snapshot.

Payment verification:

- The checkout return page does not trust query parameters as success.
- Paystack verification is called server-side using `PAYSTACK_SECRET_KEY`.
- A payment only becomes `SUCCESS` after provider verification.
- An order only becomes `PAID` after a successful verified payment.

Webhook security:

- `/api/payments/webhook/paystack` verifies `x-paystack-signature`.
- Invalid signatures are rejected.
- Duplicate success events are safe because payment provider references and enrollment constraints are unique.

Ownership:

- Students can only view and pay their own orders.
- Admin order and payment pages are behind the existing admin route protection.

## Environment

Required for real Paystack test/live initialization and verification:

```text
PAYSTACK_SECRET_KEY=
```

Do not commit real keys. Use Paystack test keys locally.

## Admin

New admin routes:

- `/admin/orders`
- `/admin/orders/[id]`
- `/admin/payments`
- `/admin/payments/[id]`

Dashboard additions:

- Revenue from `PAID` orders.
- Paid order count.
- Pending order count.
- Failed payment count.

Revenue definition for this phase:

```text
sum(Order.amountMinor where Order.status = PAID)
```

Refund support is represented in statuses, but no gateway refund API is implemented in Phase 6.

## Student

New student route:

- `/student/orders`

Existing student enrollment flow now creates/reuses orders for paid courses. Student navigation includes Orders.

## Seed Data

Seed records include development orders and payments for:

- `PAID`
- `FAILED`
- `PENDING`
- `CANCELLED`
- `REFUNDED`

These records use fake development references such as `DEV-PAID`; they are not real payment-provider transactions.

## Verification

Run:

```bash
npm run db:generate
npx prisma migrate deploy
npm run db:seed
npm test
npx prisma validate
npx prisma migrate status
npm run build
```

If the default `.next/turbopack` cache is locked on Windows, close any running Next dev server and retry. The project also supports `NEXT_DIST_DIR=.next-phase6 npm run build` for a temporary alternate build directory.

ESLint has previously hung in this workspace, so do not report lint as verified unless it completes successfully.
