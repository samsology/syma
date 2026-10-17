ALTER TABLE "WeeklyAssignment"
  ADD COLUMN "dueAt" TIMESTAMP(3),
  ADD COLUMN "maxScore" DOUBLE PRECISION;

CREATE TABLE "AssignmentResource" (
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
  CONSTRAINT "AssignmentResource_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AssignmentResource_valid_storage" CHECK (
    ("resourceType" = 'FILE' AND "storageKey" IS NOT NULL AND "externalUrl" IS NULL)
    OR ("resourceType" = 'LINK' AND "externalUrl" IS NOT NULL AND "storageKey" IS NULL)
  )
);

ALTER TABLE "AssignmentSubmission"
  ADD COLUMN "method" TEXT NOT NULL DEFAULT 'LINK',
  ADD COLUMN "attemptNumber" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "originalFilename" TEXT,
  ADD COLUMN "mimeType" TEXT,
  ADD COLUMN "fileSize" INTEGER,
  ADD COLUMN "score" DOUBLE PRECISION,
  ADD COLUMN "feedback" TEXT,
  ADD COLUMN "reviewerId" TEXT,
  ADD COLUMN "reviewedAt" TIMESTAMP(3);

ALTER TABLE "WeeklyAssignment"
  ADD CONSTRAINT "WeeklyAssignment_maxScore_nonnegative" CHECK ("maxScore" IS NULL OR "maxScore" > 0);
ALTER TABLE "AssignmentSubmission"
  ADD CONSTRAINT "AssignmentSubmission_attempt_positive" CHECK ("attemptNumber" > 0),
  ADD CONSTRAINT "AssignmentSubmission_score_nonnegative" CHECK ("score" IS NULL OR "score" >= 0),
  ADD CONSTRAINT "AssignmentSubmission_status_valid" CHECK ("status" IN ('SUBMITTED', 'REVIEWED', 'NEEDS_REVISION')),
  ADD CONSTRAINT "AssignmentSubmission_method_valid" CHECK ("method" IN ('FILE', 'LINK'));

DROP INDEX IF EXISTS "AssignmentSubmission_studentId_assignmentId_key";
CREATE UNIQUE INDEX "AssignmentSubmission_studentId_assignmentId_attemptNumber_key"
  ON "AssignmentSubmission"("studentId", "assignmentId", "attemptNumber");
CREATE INDEX "AssignmentSubmission_studentId_assignmentId_submittedAt_idx"
  ON "AssignmentSubmission"("studentId", "assignmentId", "submittedAt");
CREATE INDEX "AssignmentSubmission_status_idx" ON "AssignmentSubmission"("status");
CREATE INDEX "AssignmentResource_assignmentId_idx" ON "AssignmentResource"("assignmentId");

ALTER TABLE "AssignmentResource"
  ADD CONSTRAINT "AssignmentResource_assignmentId_fkey"
  FOREIGN KEY ("assignmentId") REFERENCES "WeeklyAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssignmentSubmission"
  ADD CONSTRAINT "AssignmentSubmission_reviewerId_fkey"
  FOREIGN KEY ("reviewerId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
