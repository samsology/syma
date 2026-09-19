import { PrismaClient } from '@prisma/client';

const dbUrl = process.env.DATABASE_URL || "postgresql://postgres.qboaxloypjeqhdgumqun:Zm1AQDp0dQdKHZgV@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1";

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } },
});

async function main() {
  const summaries = await prisma.moduleSummary.findMany({
    select: { id: true, title: true, resourceUrl: true, resourceType: true }
  });
  console.log('SUMMARIES_COUNT:', summaries.length);
  for (const s of summaries) {
    console.log('SUMMARY:', s.title, '| URL:', s.resourceUrl, '| TYPE:', s.resourceType);
  }

  const resources = await prisma.lessonResource.findMany({
    select: { id: true, name: true, fileUrl: true, resourceType: true, sourceType: true }
  });
  console.log('RESOURCES_COUNT:', resources.length);
  for (const r of resources) {
    console.log('RESOURCE:', r.name, '| URL:', r.fileUrl, '| TYPE:', r.resourceType);
  }

  const lessons = await prisma.lesson.findMany({
    select: { id: true, title: true, videoUrl: true, slideUrl: true, resourceType: true }
  });
  console.log('LESSONS_COUNT:', lessons.length);
  for (const l of lessons) {
    if (l.videoUrl || l.slideUrl) {
      console.log('LESSON:', l.title, '| VIDEO:', l.videoUrl, '| SLIDE:', l.slideUrl);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
