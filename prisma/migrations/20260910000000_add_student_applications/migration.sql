-- CreateTable
CREATE TABLE "StudentApplication" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "registrationTokenHash" TEXT,
    "registrationTokenExpiresAt" TIMESTAMP(3),
    "registrationTokenUsedAt" TIMESTAMP(3),
    "studentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentApplication_registrationTokenHash_key" ON "StudentApplication"("registrationTokenHash");

-- CreateIndex
CREATE INDEX "StudentApplication_email_idx" ON "StudentApplication"("email");

-- CreateIndex
CREATE INDEX "StudentApplication_studentId_idx" ON "StudentApplication"("studentId");

-- CreateIndex
CREATE INDEX "StudentApplication_registrationTokenHash_idx" ON "StudentApplication"("registrationTokenHash");

-- AddForeignKey
ALTER TABLE "StudentApplication" ADD CONSTRAINT "StudentApplication_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
