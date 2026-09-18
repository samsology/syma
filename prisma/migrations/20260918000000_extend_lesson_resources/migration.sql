-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('VIDEO', 'DOCUMENT', 'FILE', 'LINK');

-- CreateEnum
CREATE TYPE "ResourceSource" AS ENUM ('YOUTUBE', 'GOOGLE_DRIVE', 'UPLOAD', 'EXTERNAL');

-- AlterTable
ALTER TABLE "LessonResource"
ADD COLUMN "resourceType" "ResourceType" NOT NULL DEFAULT 'FILE',
ADD COLUMN "sourceType" "ResourceSource" NOT NULL DEFAULT 'EXTERNAL',
ADD COLUMN "description" TEXT,
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "isDownloadable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "LessonResource_resourceType_idx" ON "LessonResource"("resourceType");

-- CreateIndex
CREATE INDEX "LessonResource_sortOrder_idx" ON "LessonResource"("sortOrder");

-- CreateIndex
CREATE INDEX "LessonResource_isActive_idx" ON "LessonResource"("isActive");
