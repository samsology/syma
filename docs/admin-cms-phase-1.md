# Admin CMS Phase 1 Database Setup

This phase adds the backend foundation for the Syma Tech Admin CMS without replacing the existing public website or Supabase-backed lead forms.

## Existing Architecture

- Framework: Next.js App Router with React and TypeScript.
- Package manager: npm with `package-lock.json`.
- Public form storage: Supabase via `@supabase/ssr`.
- Validation: Zod.
- Styling: Tailwind CSS v4.
- CMS database foundation: PostgreSQL through Prisma ORM.

## Prisma Location

- Schema: `prisma/schema.prisma`
- Migration: `prisma/migrations/20260830000000_init_admin_cms/migration.sql`
- Seed runner: `prisma/seed.ts`
- Editable seed data: `prisma/seed-data/`
- App database client: `lib/db.ts`

## Models

The CMS curriculum hierarchy is:

```text
Admin
  -> Course
      -> CourseWeek
          -> CourseModule
              -> Lesson
                  -> LessonResource
```

Courses may reference an admin instructor. Curriculum records cascade downward when a parent is permanently deleted. Course instructor references are set to null if an admin is deleted.

## Environment Variables

Add these values to `.env.local` for local CMS database work:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/syma_tech?schema=public

SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
SEED_ADMIN_NAME="Syma Tech Admin"
```

`SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` are optional. If either is missing, the seed skips admin creation. Passwords are hashed with bcrypt before storage. Do not commit real credentials.

## Local Database Setup

1. Create a local PostgreSQL database named `syma_tech`.
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL`.
3. Install dependencies:

```bash
npm install
```

4. Generate the Prisma client:

```bash
npm run db:generate
```

5. Apply migrations:

```bash
npm run db:migrate
```

6. Seed development course data:

```bash
npm run db:seed
```

7. Inspect the database:

```bash
npm run db:studio
```

8. Start the site:

```bash
npm run dev
```

## Seed Data

The seed creates four draft courses:

- Introduction to Data Literacy
- Introduction to Data Analytics
- Advanced Data Analytics
- Introduction to Data Science

Each course includes weeks, modules, and lessons. The seed is idempotent for course slugs: existing seeded course curriculum is replaced with the current editable seed data while preserving the course identity.

## Safe Development Reset

For local development only, reset the database and rerun migrations plus seed:

```bash
npm run db:migrate -- --reset
npm run db:seed
```

Use this only against disposable development databases.
