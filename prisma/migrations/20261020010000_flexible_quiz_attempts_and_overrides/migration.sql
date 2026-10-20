-- AlterTable ModuleQuiz: Add flexible attempt policy and progression controls
ALTER TABLE "ModuleQuiz"
  ADD COLUMN IF NOT EXISTS "attemptPolicy" TEXT NOT NULL DEFAULT 'UNLIMITED',
  ADD COLUMN IF NOT EXISTS "requirePassingToProgress" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "allowLearningAfterExhausted" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "allowAttemptRequests" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable QuizStudentOverride
CREATE TABLE IF NOT EXISTS "QuizStudentOverride" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "additionalAttempts" INTEGER NOT NULL DEFAULT 0,
    "progressionGranted" BOOLEAN NOT NULL DEFAULT false,
    "isRequestPending" BOOLEAN NOT NULL DEFAULT false,
    "requestNote" TEXT,
    "reason" TEXT,
    "grantedById" TEXT,
    "grantedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizStudentOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "QuizStudentOverride_quizId_studentId_key" ON "QuizStudentOverride"("quizId", "studentId");
CREATE INDEX IF NOT EXISTS "QuizStudentOverride_studentId_idx" ON "QuizStudentOverride"("studentId");
CREATE INDEX IF NOT EXISTS "QuizStudentOverride_quizId_idx" ON "QuizStudentOverride"("quizId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'QuizStudentOverride_quizId_fkey'
  ) THEN
    ALTER TABLE "QuizStudentOverride"
      ADD CONSTRAINT "QuizStudentOverride_quizId_fkey"
      FOREIGN KEY ("quizId") REFERENCES "ModuleQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'QuizStudentOverride_studentId_fkey'
  ) THEN
    ALTER TABLE "QuizStudentOverride"
      ADD CONSTRAINT "QuizStudentOverride_studentId_fkey"
      FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
