# Syma Tech Solutions
## Health & Research Intelligence Portal

Welcome to the official repository for **Syma Tech Solutions**—a Health & Research Intelligence company advancing data-informed systems, business intelligence (BI) dashboards, public health reporting, and professional data education across Africa.

This website is built with the modern web stack, featuring Next.js 15+ App Router, React 19, Tailwind CSS v4, Framer Motion, and a Supabase backend. It follows a highly performant, SEO-optimized, and clean Server-Client component architecture.

---

## 🚀 Key Features (Phase 1 MVP)

This MVP focuses on outcome-driven, lead-generation workflows with strict validation, anti-spam mechanisms, and automated confirmation emails.

* **Programs & Pricing**: Interactive comparison of professional education tracks (Healthcare Data Analytics, Python for Data Science, Business Intelligence) with animated learning journeys and features.
* **Consultation Booking**: Advanced scheduling form built with React Hook Form and Zod validation.
* **Contact Channel**: Client-side validated contact form with real-time feedback.
* **Database Synced Forms**: Direct storage of form submissions to Supabase tables.
* **Automated Confirmations**: Instant transactional email receipt generation for users via the Brevo API.
* **Spam & Abuse Protection**: Integrated rate-limiting controls and honeypot traps on all public endpoints.
* **SEO Optimized**: Standard structural JSON-LD schemas, descriptive layouts, custom metadata, and sitemaps.

---

## 🛠️ Architecture & Tech Stack

The application is structured to enforce clear boundaries between **Server Components** (SEO, metadata, static markup) and **Client Components** (interactive forms, animations).

* **Framework**: [Next.js 15+ (App Router)](https://nextjs.org/)
* **Runtime / Engine**: Node.js `>= 20.9.0`
* **Language**: TypeScript
* **Database & Auth**: [Supabase](https://supabase.com/) with `@supabase/ssr` (cookies-based client connection)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & PostCSS
* **Animations**: [Framer Motion](https://www.framer.com/motion/) (Isolated in Client Components to avoid prerendering violations)
* **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod Schema Validation](https://zod.dev/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Emails**: [Brevo API (formerly Sendinblue)](https://www.brevo.com/)

---

## 📁 Project Structure

```text
├── app/
│   ├── about/            # About Us and founder story page
│   ├── actions/          # Next.js Server Actions (database operations, Brevo emails)
│   ├── api/              # API Route Handlers (consultations, contact, enrollments)
│   ├── consultation/     # Consultation scheduling page
│   ├── contact/          # Contact details and message form
│   ├── enroll/           # Professional education application form
│   ├── portfolio/        # Case studies & student project showcase
│   ├── programs/         # Programs, pricing, and recommended tracks
│   ├── solutions/        # Enterprise solutions & services
│   ├── globals.css       # Core Tailwind CSS configuration and themes
│   ├── layout.tsx        # Global Layout (Navbar, Footer, SEO Meta, GA script, Clarity)
│   └── page.tsx          # Homepage
├── components/
│   ├── forms/            # Client Form Components (ConsultationForm, ContactForm, etc.)
│   ├── layout/           # Shared Navigation & Footer
│   ├── sections/         # Page layout sections (FAQ, timeline, portfolios)
│   └── ui/               # Core design system elements (Button, Card, Container)
├── lib/
│   ├── email/            # Brevo template configuration & email sending logic
│   ├── supabase/         # SSR Supabase client & server instances
│   ├── validation.ts     # Zod Schemas for inputs
│   └── utils.ts          # Tailwind styling merges (clsx + tailwind-merge)
├── types/                # Supabase database TypeScript definitions
└── public/               # Static assets (images, profile pictures, logo)
```

---

## ⚙️ Local Development Setup

Follow these steps to run the project locally on your machine.

### 1. Prerequisites
Ensure you have Node.js version `20.9.0` or higher installed.
```bash
node -v
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory by copying the `.env.example` file:
```bash
cp .env.example .env.local
```

Fill in the environment variables:
```env
# Public Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase Configurations
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-public-anon-key

# Transactional Email (Brevo) Configuration (Optional in Dev)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=symatechsolutions@gmail.com
BREVO_SENDER_NAME="Syma Tech Solutions"
SYMA_REPLY_TO_EMAIL=symatechsolutions@gmail.com

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_CLARITY_ID=
```
*Note: If `BREVO_API_KEY` is omitted in development, email sending steps will fail silently but database actions will still succeed.*

### 4. Running the Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🗄️ Database & Row Level Security (RLS) Setup

This project uses Supabase as a database. Because the application interacts with Supabase using the public anonymous API key (role: `anon`), you must set up the database tables and enable Row-Level Security (RLS) policies for write permissions to succeed.

Execute the following script in the **SQL Editor** of your Supabase Dashboard:

```sql
-- 1. Create enrollments table
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  full_name text not null,
  email text not null,
  phone text not null,
  program text not null,
  experience text not null,
  motivation text not null
);

-- 2. Create consultations table
create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  full_name text not null,
  email text not null,
  company_name text not null,
  consultation_type text not null,
  message text not null,
  preferred_date text not null
);

-- 3. Create contact_messages table
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  name text not null,
  email text not null,
  subject text not null,
  message text not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.enrollments enable row level security;
alter table public.consultations enable row level security;
alter table public.contact_messages enable row level security;

-- 5. Create RLS Policies to allow public write access (insert submissions)
drop policy if exists "Allow public enrollment submissions" on public.enrollments;
create policy "Allow public enrollment submissions"
on public.enrollments for insert to anon, authenticated with check (true);

drop policy if exists "Allow public consultation submissions" on public.consultations;
create policy "Allow public consultation submissions"
on public.consultations for insert to anon, authenticated with check (true);

drop policy if exists "Allow public contact submissions" on public.contact_messages;
create policy "Allow public contact submissions"
on public.contact_messages for insert to anon, authenticated with check (true);
```

---

## 🧪 Production Compilation & Verification

Before merging changes, verify that the application builds without any TypeScript, ESLint, or boundary violations.

Run the linter:
```bash
npm run lint
```

Build the production package:
```bash
npm run build
```

---

## ☁️ Deployment

Since the application utilizes server-side rendering, cookies access via Server Actions, and API endpoints, it must be deployed to a environment that supports Node.js server runtimes.

### Vercel Deployment (Recommended)
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New Project**.
3. Import your repository.
4. Add all environment variables listed in your `.env.local` to the Vercel **Environment Variables** configuration panel.
5. Deploy. Vercel will automatically configure the building process (`npm run build`).
