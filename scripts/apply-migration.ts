import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Connecting to database and applying migration...');

  const statements = [
    // 1. Add missing columns to WeeklyAssignment
    `ALTER TABLE "WeeklyAssignment" ADD COLUMN IF NOT EXISTS "dueAt" TIMESTAMP(3);`,
    `ALTER TABLE "WeeklyAssignment" ADD COLUMN IF NOT EXISTS "maxScore" DOUBLE PRECISION;`,

    // 2. Create AssignmentResource table if not exists
    `CREATE TABLE IF NOT EXISTS "AssignmentResource" (
      "id" TEXT NOT NULL,
      "assignmentId" TEXT NOT NULL,
      "resourceType" TEXT NOT NULL,
      "label" TEXT NOT NULL,
      "description" TEXT,
      "storageKey" TEXT,
      "originalFilename" TEXT,
      "mimeType" TEXT,
      "fileSize" INTEGER,
      "externalUrl" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "AssignmentResource_pkey" PRIMARY KEY ("id")
    );`,

    // Check constraint for AssignmentResource
    `DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'AssignmentResource_valid_storage'
      ) THEN
        ALTER TABLE "AssignmentResource"
          ADD CONSTRAINT "AssignmentResource_valid_storage" CHECK (
            ("resourceType" = 'FILE' AND "storageKey" IS NOT NULL AND "externalUrl" IS NULL)
            OR ("resourceType" = 'LINK' AND "externalUrl" IS NOT NULL AND "storageKey" IS NULL)
          );
      END IF;
    END $$;`,

    // 3. Add columns to AssignmentSubmission
    `ALTER TABLE "AssignmentSubmission" ADD COLUMN IF NOT EXISTS "method" TEXT NOT NULL DEFAULT 'LINK';`,
    `ALTER TABLE "AssignmentSubmission" ADD COLUMN IF NOT EXISTS "attemptNumber" INTEGER NOT NULL DEFAULT 1;`,
    `ALTER TABLE "AssignmentSubmission" ADD COLUMN IF NOT EXISTS "originalFilename" TEXT;`,
    `ALTER TABLE "AssignmentSubmission" ADD COLUMN IF NOT EXISTS "mimeType" TEXT;`,
    `ALTER TABLE "AssignmentSubmission" ADD COLUMN IF NOT EXISTS "fileSize" INTEGER;`,
    `ALTER TABLE "AssignmentSubmission" ADD COLUMN IF NOT EXISTS "score" DOUBLE PRECISION;`,
    `ALTER TABLE "AssignmentSubmission" ADD COLUMN IF NOT EXISTS "feedback" TEXT;`,
    `ALTER TABLE "AssignmentSubmission" ADD COLUMN IF NOT EXISTS "reviewerId" TEXT;`,
    `ALTER TABLE "AssignmentSubmission" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);`,

    // 4. Add constraints safely
    `DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'WeeklyAssignment_maxScore_nonnegative'
      ) THEN
        ALTER TABLE "WeeklyAssignment"
          ADD CONSTRAINT "WeeklyAssignment_maxScore_nonnegative" CHECK ("maxScore" IS NULL OR "maxScore" > 0);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'AssignmentSubmission_attempt_positive'
      ) THEN
        ALTER TABLE "AssignmentSubmission"
          ADD CONSTRAINT "AssignmentSubmission_attempt_positive" CHECK ("attemptNumber" > 0);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'AssignmentSubmission_score_nonnegative'
      ) THEN
        ALTER TABLE "AssignmentSubmission"
          ADD CONSTRAINT "AssignmentSubmission_score_nonnegative" CHECK ("score" IS NULL OR "score" >= 0);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'AssignmentSubmission_status_valid'
      ) THEN
        ALTER TABLE "AssignmentSubmission"
          ADD CONSTRAINT "AssignmentSubmission_status_valid" CHECK ("status" IN ('SUBMITTED', 'REVIEWED', 'NEEDS_REVISION'));
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'AssignmentSubmission_method_valid'
      ) THEN
        ALTER TABLE "AssignmentSubmission"
          ADD CONSTRAINT "AssignmentSubmission_method_valid" CHECK ("method" IN ('FILE', 'LINK'));
      END IF;
    END $$;`,

    // 5. Indexes
    `DROP INDEX IF EXISTS "AssignmentSubmission_studentId_assignmentId_key";`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "AssignmentSubmission_studentId_assignmentId_attemptNumber_key"
      ON "AssignmentSubmission"("studentId", "assignmentId", "attemptNumber");`,
    `CREATE INDEX IF NOT EXISTS "AssignmentSubmission_studentId_assignmentId_submittedAt_idx"
      ON "AssignmentSubmission"("studentId", "assignmentId", "submittedAt");`,
    `CREATE INDEX IF NOT EXISTS "AssignmentSubmission_status_idx"
      ON "AssignmentSubmission"("status");`,
    `CREATE INDEX IF NOT EXISTS "AssignmentResource_assignmentId_idx"
      ON "AssignmentResource"("assignmentId");`,

    // 6. Foreign Keys
    `DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'AssignmentResource_assignmentId_fkey'
      ) THEN
        ALTER TABLE "AssignmentResource"
          ADD CONSTRAINT "AssignmentResource_assignmentId_fkey"
          FOREIGN KEY ("assignmentId") REFERENCES "WeeklyAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'AssignmentSubmission_reviewerId_fkey'
      ) THEN
        ALTER TABLE "AssignmentSubmission"
          ADD CONSTRAINT "AssignmentSubmission_reviewerId_fkey"
          FOREIGN KEY ("reviewerId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      END IF;
    END $$;`,

    // 7. Track in _prisma_migrations if table exists
    `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
    SELECT 
      md5(random()::text || clock_timestamp()::text),
      '120c1598555e105e46be9f268a730e15b130761e3cbdb13ba4f40ef468e82a61',
      NOW(),
      '20261017000000_extend_weekly_assignments',
      NULL,
      NULL,
      NOW(),
      1
    WHERE EXISTS (
      SELECT 1 FROM information_schema.tables WHERE table_name = '_prisma_migrations'
    ) AND NOT EXISTS (
      SELECT 1 FROM "_prisma_migrations" WHERE migration_name = '20261017000000_extend_weekly_assignments'
    );`
  ];

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    console.log(`Executing step ${i + 1}/${statements.length}...`);
    await prisma.$executeRawUnsafe(stmt);
  }

  console.log('✅ Migration executed successfully!');

  // Verify that courseWeek.findMany works
  console.log('🔍 Verifying prisma.courseWeek.findMany() query...');
  const sample = await prisma.courseWeek.findMany({
    take: 1,
    include: {
      assignment: true,
    },
  });
  console.log('✅ Verification successful! Found sample weeks:', sample.length);
}

main()
  .catch((err) => {
    console.error('❌ Error executing migration:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
