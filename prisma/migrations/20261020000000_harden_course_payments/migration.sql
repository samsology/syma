ALTER TYPE "EnrollmentSource" ADD VALUE IF NOT EXISTS 'FREE';

ALTER TABLE "Course"
  ADD COLUMN "isFree" BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE "Payment"
  ADD COLUMN "providerTransactionId" TEXT,
  ADD COLUMN "verifiedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Payment_provider_providerTransactionId_key"
  ON "Payment"("provider", "providerTransactionId");
