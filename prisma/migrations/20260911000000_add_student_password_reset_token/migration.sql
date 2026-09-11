-- CreateTable
CREATE TABLE "StudentPasswordResetToken" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentPasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentPasswordResetToken_tokenHash_key" ON "StudentPasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "StudentPasswordResetToken_studentId_idx" ON "StudentPasswordResetToken"("studentId");

-- CreateIndex
CREATE INDEX "StudentPasswordResetToken_tokenHash_idx" ON "StudentPasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "StudentPasswordResetToken_expiresAt_idx" ON "StudentPasswordResetToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "StudentPasswordResetToken" ADD CONSTRAINT "StudentPasswordResetToken_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
