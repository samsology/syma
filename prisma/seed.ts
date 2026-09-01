import { PrismaClient, CourseStatus, LessonType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { courses } from './seed-data/courses';

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.info('Skipping admin seed: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are not both set.');
    return null;
  }

  if (password.length < 12) {
    console.warn('Skipping admin seed: SEED_ADMIN_PASSWORD must be at least 12 characters.');
    return null;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  return prisma.admin.upsert({
    where: { email },
    update: {
      passwordHash,
      isActive: true,
    },
    create: {
      name: process.env.SEED_ADMIN_NAME?.trim() || 'Syma Tech Admin',
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });
}

async function seedCourses(instructorId?: string) {
  for (const course of courses) {
    await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        title: course.title,
        shortDescription: course.shortDescription,
        description: course.description,
        category: course.category,
        level: course.level,
        duration: course.duration,
        thumbnailUrl: course.thumbnailUrl,
        instructorId,
        status: CourseStatus.DRAFT,
        publishedAt: null,
        weeks: {
          deleteMany: {},
          create: course.weeks.map((week, weekIndex) => ({
            weekNumber: week.weekNumber,
            title: week.title,
            description: week.description,
            sortOrder: weekIndex + 1,
            modules: {
              create: week.modules.map((module, moduleIndex) => ({
                title: module.title,
                description: module.description,
                sortOrder: moduleIndex + 1,
                lessons: {
                  create: module.lessons.map((lesson, lessonIndex) => ({
                    title: lesson.title,
                    slug: lesson.slug,
                    lessonType: lesson.lessonType ?? LessonType.TEXT,
                    content: lesson.content,
                    videoUrl: lesson.videoUrl ?? null,
                    duration: lesson.duration ?? 30,
                    isPreview: lesson.isPreview ?? false,
                    status: CourseStatus.DRAFT,
                    sortOrder: lessonIndex + 1,
                  })),
                },
              })),
            },
          })),
        },
      },
      create: {
        title: course.title,
        slug: course.slug,
        shortDescription: course.shortDescription,
        description: course.description,
        category: course.category,
        level: course.level,
        duration: course.duration,
        thumbnailUrl: course.thumbnailUrl,
        instructorId,
        status: CourseStatus.DRAFT,
        weeks: {
          create: course.weeks.map((week, weekIndex) => ({
            weekNumber: week.weekNumber,
            title: week.title,
            description: week.description,
            sortOrder: weekIndex + 1,
            modules: {
              create: week.modules.map((module, moduleIndex) => ({
                title: module.title,
                description: module.description,
                sortOrder: moduleIndex + 1,
                lessons: {
                  create: module.lessons.map((lesson, lessonIndex) => ({
                    title: lesson.title,
                    slug: lesson.slug,
                    lessonType: lesson.lessonType ?? LessonType.TEXT,
                    content: lesson.content,
                    videoUrl: lesson.videoUrl ?? null,
                    duration: lesson.duration ?? 30,
                    isPreview: lesson.isPreview ?? false,
                    status: CourseStatus.DRAFT,
                    sortOrder: lessonIndex + 1,
                  })),
                },
              })),
            },
          })),
        },
      },
    });
  }
}

async function main() {
  const admin = await seedAdmin();
  await seedCourses(admin?.id);

  const [courseCount, weekCount, moduleCount, lessonCount] = await Promise.all([
    prisma.course.count(),
    prisma.courseWeek.count(),
    prisma.courseModule.count(),
    prisma.lesson.count(),
  ]);

  console.info(
    `Seed complete: ${courseCount} courses, ${weekCount} weeks, ${moduleCount} modules, ${lessonCount} lessons.`
  );
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
