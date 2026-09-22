# Syma Tech Solutions
## Health & Research Intelligence — Learning Management & Enterprise Portal

Welcome to the official repository for **Syma Tech Solutions**—a Health & Research Intelligence company delivering professional data education, advanced business intelligence (BI) systems, and public health analytics across Africa and globally.

The platform combines an SEO-optimized public marketing portal, a full-featured Learning Management System (LMS), Paystack payment checkout, and an Administrative Content Management System (CMS).

---

## 🚀 Key Platform Features

### 1. Public Portal & Course Catalogue
* **Interactive Programs**: 4 official programs (Data Literacy, Data Analytics, Data Science, Healthcare Analytics) displayed in USD with curriculum syllabi and course inclusions.
* **Enrollment Application Flow**: Multi-step student onboarding with 48-hour cryptographically hashed continuation tokens.
* **Lead Generation**: Enterprise consultation scheduling and contact inquiries with anti-spam honeypot and rate-limiting.
* **SEO & Metadata**: JSON-LD schemas, OpenGraph tags, dynamic sitemap (`sitemap.xml`), and robots rules.

### 2. Student Learning Portal (LMS)
* **4-Tier Curriculum Hierarchy**:
  ```text
  Course → Week → Module → Lessons (Slide / Video) → Module Summary → Module Quiz → Weekly Assignment
  ```
* **Resource Viewing System**:
  * **Video**: In-portal YouTube embedded player with playlist and timestamp support (`strict-origin-when-cross-origin` policy).
  * **Slides / PPTX**: In-portal Google Slides/Drive presentation viewer.
  * **Datasets**: Dedicated `[ Download Dataset ]` action, strictly separated from iframe viewers.
  * **External Links**: Safe new-tab navigation.
* **Assessment & Evaluation**:
  * **Module Summary**: In-portal explainer deck/video, key takeaways, and progress toggle.
  * **Module Quiz**: Interactive knowledge checks with server-evaluated scoring, benchmark passing score (>=70%), attempt limits, and attempt history.
  * **Weekly Assignments**: Practical scenario briefs, dataset downloads, and student text/link submission portal.
  * **Multi-Tier Progress Engine**: Automatic percentage completion calculation tracking lessons, summaries, and quizzes.

### 3. Payment & Checkout Processing
* **Paystack Integration**: Secure checkout with order creation, 24-hour pending expiration, and payment initialization.
* **Webhook Security**: `/api/payments/webhook/paystack` with HMAC-SHA512 signature verification (`x-paystack-signature`).
* **Terminal State Machine**: Immutability guarantees preventing resurrection of `PAID`, `FAILED`, or `CANCELLED` payments.
* **Automatic Enrollment**: Instant activation of course access upon verified payment settlement.

### 4. Admin CMS Suite
* **Interactive Curriculum Builder**: Complete week/module/lesson manager with live reordering, status controls, and resource attachment manager.
* **Course Lifecycle**: Publishing gates, status transitions (`DRAFT` → `PUBLISHED` → `ARCHIVED`), and deletion protections for active enrollments.
* **Student & Enrollment Operations**: Student directory, account status toggles (`ACTIVE` / `SUSPENDED`), and manual enrollment provisioning.
* **Orders & Payments Dashboard**: Financial metrics, grouped query analytics, and recent activity monitoring.

---

## 🛠️ Architecture & Tech Stack

* **Framework**: [Next.js 16 (App Router with Turbopack)](https://nextjs.org/)
* **Runtime / Engine**: Node.js `>= 20.9.0`
* **Language**: TypeScript 5
* **Database & ORM**: PostgreSQL with [Prisma ORM (v6)](https://www.prisma.io/) and Supabase Session/Transaction Pooler
* **Authentication**: HTTP-only session cookies (`student_session`, `admin_session`), bcrypt password hashing, and single-use reset tokens
* **Payments**: [Paystack](https://paystack.com/) with server verification and HMAC webhooks
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & PostCSS
* **UI & Animation**: [Framer Motion](https://www.framer.com/motion/) & [Lucide React](https://lucide.dev/)
* **Validation**: [Zod](https://zod.dev/) & React Hook Form
* **Emails**: [Brevo Transactional API](https://www.brevo.com/)

---

## 📁 Project Structure

```text
├── app/
│   ├── (public)/                 # Public marketing pages (/, /about, /programs, /contact, etc.)
│   ├── actions/                  # Public lead capture server actions
│   ├── admin/                    # Admin CMS portal
│   │   ├── (protected)/          # Protected admin routes (dashboard, courses, students, payments)
│   │   └── login/                # Admin authentication
│   ├── api/                      # Route handlers (Paystack webhook, admin APIs)
│   ├── checkout/                 # Order checkout & Paystack payment redirect
│   ├── continue-registration/    # Student token-based registration completion
│   └── student/                  # Student LMS learning portal
│       ├── (protected)/          # Protected student routes (dashboard, courses, lessons, quizzes)
│       └── login / register / reset-password
├── components/
│   ├── admin/                    # Admin CMS components & CurriculumBuilder
│   ├── resources/                # In-portal ResourceStage & ResourceRenderer
│   ├── student/                  # Student LMS UI shell & syllabus components
│   └── ui/                       # Design system components (Card, Button, Container)
├── lib/
│   ├── auth/                     # Session management, authorization guards, token hashing
│   ├── courses/                  # Course catalog & pricing definitions
│   ├── curriculum/               # Quiz engine & question evaluation
│   ├── db.ts                     # Prisma client with dynamic connection pool tuning
│   ├── email/                    # Brevo transactional email dispatchers
│   ├── payments/                 # Paystack provider, rules, and settlement engine
│   ├── resources/                # Embed URL parsers & security classifiers
│   └── validation/               # Zod schemas for forms, curriculum, and quizzes
├── prisma/
│   ├── schema.prisma             # Comprehensive database schema
│   └── seed.ts                   # Database seeder
└── tests/                        # 115 automated test suites
```

---

## 🚀 Getting Started

### 1. Prerequisites
* Node.js `>= 20.9.0`
* PostgreSQL database (e.g. Supabase connection pooler on port 6543)

### 2. Environment Configuration
Copy `.env.example` to `.env` and fill in required secrets:
```bash
cp .env.example .env
```

Key environment variables:
* `DATABASE_URL`: PostgreSQL connection string with `pgbouncer=true&connection_limit=10&pool_timeout=30`
* `DIRECT_URL`: Direct database connection for Prisma migrations
* `PAYSTACK_SECRET_KEY`: Paystack secret key for payments and webhook HMAC
* `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: Paystack public key for frontend reference
* `BREVO_API_KEY`: Brevo API key for transactional emails
* `NEXT_PUBLIC_SITE_URL`: Base domain (e.g., `https://symatechs.com`)

### 3. Database Setup
```bash
npx prisma generate
npx prisma db push # or npx prisma migrate deploy
npm run db:seed
```

### 4. Running the Development Server
```bash
npm run dev
```

### 5. Running Quality Checks & Tests
```bash
npm test              # Runs all 115 test suites
npm run lint          # ESLint check
npx tsc --noEmit      # TypeScript type checking
npm run build         # Next.js production build verification
```
