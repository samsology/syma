-- AlterTable ModuleQuiz
ALTER TABLE "ModuleQuiz"
ADD COLUMN IF NOT EXISTS "randomizeQuestions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "randomizeOptions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "showResults" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "showExplanations" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable QuizAttempt
ALTER TABLE "QuizAttempt"
ADD COLUMN IF NOT EXISTS "percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "timeSpent" INTEGER;

-- CreateTable QuizQuestion
CREATE TABLE IF NOT EXISTS "QuizQuestion" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "explanation" TEXT,
    "hint" TEXT,
    "points" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable QuizOption
CREATE TABLE IF NOT EXISTS "QuizOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable QuizAnswer
CREATE TABLE IF NOT EXISTS "QuizAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionId" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "pointsAwarded" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "QuizQuestion_quizId_idx" ON "QuizQuestion"("quizId");
CREATE INDEX IF NOT EXISTS "QuizQuestion_order_idx" ON "QuizQuestion"("order");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "QuizOption_questionId_idx" ON "QuizOption"("questionId");
CREATE INDEX IF NOT EXISTS "QuizOption_order_idx" ON "QuizOption"("order");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "QuizAnswer_attemptId_questionId_key" ON "QuizAnswer"("attemptId", "questionId");
CREATE INDEX IF NOT EXISTS "QuizAnswer_attemptId_idx" ON "QuizAnswer"("attemptId");
CREATE INDEX IF NOT EXISTS "QuizAnswer_questionId_idx" ON "QuizAnswer"("questionId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'QuizQuestion_quizId_fkey'
    ) THEN
        ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "ModuleQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'QuizOption_questionId_fkey'
    ) THEN
        ALTER TABLE "QuizOption" ADD CONSTRAINT "QuizOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'QuizAnswer_attemptId_fkey'
    ) THEN
        ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "QuizAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'QuizAnswer_questionId_fkey'
    ) THEN
        ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'QuizAnswer_selectedOptionId_fkey'
    ) THEN
        ALTER TABLE "QuizAnswer" ADD CONSTRAINT "QuizAnswer_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "QuizOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
