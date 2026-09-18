import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// If TARGET_DATABASE_URL is provided, use it. Otherwise uses process.env.DATABASE_URL
const targetUrl = process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: targetUrl,
    },
  },
});

async function main() {
  const snapshotPath = path.resolve(process.cwd(), 'prisma', 'database-snapshot.json');

  if (!fs.existsSync(snapshotPath)) {
    console.error('❌ Snapshot file not found at:', snapshotPath);
    console.error('Please run: npm run db:export first to generate the snapshot.');
    process.exit(1);
  }

  const raw = fs.readFileSync(snapshotPath, 'utf8');
  const snapshot = JSON.parse(raw);
  const { data, counts } = snapshot;

  console.log(`🚀 Starting import into target database...`);
  console.log(`Target URL: ${targetUrl?.replace(/:[^:@]+@/, ':****@')}`);
  console.log(`Snapshot timestamp: ${snapshot.exportedAt}`);
  console.log(`Records to import:`, counts);

  try {
    // 1. Admins
    console.log(`\nImporting ${data.admins?.length || 0} Admins...`);
    for (const admin of data.admins || []) {
      await prisma.admin.upsert({
        where: { email: admin.email },
        update: {
          name: admin.name,
          passwordHash: admin.passwordHash,
          role: admin.role,
          isActive: admin.isActive,
          lastLoginAt: admin.lastLoginAt ? new Date(admin.lastLoginAt) : null,
        },
        create: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          passwordHash: admin.passwordHash,
          role: admin.role,
          isActive: admin.isActive,
          lastLoginAt: admin.lastLoginAt ? new Date(admin.lastLoginAt) : null,
          createdAt: new Date(admin.createdAt),
          updatedAt: new Date(admin.updatedAt),
        },
      });
    }

    // 2. Students
    console.log(`Importing ${data.students?.length || 0} Students (with login credentials)...`);
    for (const student of data.students || []) {
      await prisma.student.upsert({
        where: { email: student.email },
        update: {
          firstName: student.firstName,
          lastName: student.lastName,
          phone: student.phone,
          passwordHash: student.passwordHash,
          status: student.status,
          avatarUrl: student.avatarUrl,
        },
        create: {
          id: student.id,
          email: student.email,
          firstName: student.firstName,
          lastName: student.lastName,
          phone: student.phone,
          passwordHash: student.passwordHash,
          status: student.status,
          avatarUrl: student.avatarUrl,
          createdAt: new Date(student.createdAt),
          updatedAt: new Date(student.updatedAt),
        },
      });
    }

    // 3. Courses
    console.log(`Importing ${data.courses?.length || 0} Courses...`);
    const courseIdMap = new Map<string, string>();

    for (const course of data.courses || []) {
      const existing = await prisma.course.findFirst({
        where: {
          OR: [{ id: course.id }, { slug: course.slug }],
        },
      });

      if (existing) {
        courseIdMap.set(course.id, existing.id);
        await prisma.course.update({
          where: { id: existing.id },
          data: {
            title: course.title,
            slug: course.slug,
            shortDescription: course.shortDescription,
            description: course.description,
            category: course.category,
            level: course.level,
            duration: course.duration,
            priceMinor: course.priceMinor,
            currency: course.currency,
            benefits: course.benefits,
            cta: course.cta,
            sortOrder: course.sortOrder,
            thumbnailUrl: course.thumbnailUrl,
            status: course.status,
            publishedAt: course.publishedAt ? new Date(course.publishedAt) : null,
          },
        });
      } else {
        const created = await prisma.course.create({
          data: {
            id: course.id,
            title: course.title,
            slug: course.slug,
            shortDescription: course.shortDescription,
            description: course.description,
            category: course.category,
            level: course.level,
            duration: course.duration,
            priceMinor: course.priceMinor,
            currency: course.currency,
            benefits: course.benefits,
            cta: course.cta,
            sortOrder: course.sortOrder,
            thumbnailUrl: course.thumbnailUrl,
            status: course.status,
            publishedAt: course.publishedAt ? new Date(course.publishedAt) : null,
            createdAt: new Date(course.createdAt),
            updatedAt: new Date(course.updatedAt),
          },
        });
        courseIdMap.set(course.id, created.id);
      }
    }

    // 4. CourseWeeks
    console.log(`Importing ${data.weeks?.length || 0} Weeks...`);
    const weekIdMap = new Map<string, string>();

    for (const week of data.weeks || []) {
      const targetCourseId = courseIdMap.get(week.courseId) || week.courseId;
      const upsertedWeek = await prisma.courseWeek.upsert({
        where: {
          courseId_weekNumber: {
            courseId: targetCourseId,
            weekNumber: week.weekNumber,
          },
        },
        update: {
          title: week.title,
          description: week.description,
          sortOrder: week.sortOrder,
        },
        create: {
          id: week.id,
          courseId: targetCourseId,
          weekNumber: week.weekNumber,
          title: week.title,
          description: week.description,
          sortOrder: week.sortOrder,
          createdAt: new Date(week.createdAt),
          updatedAt: new Date(week.updatedAt),
        },
      });
      weekIdMap.set(week.id, upsertedWeek.id);
    }

    // 5. CourseModules
    console.log(`Importing ${data.modules?.length || 0} Modules...`);
    const moduleIdMap = new Map<string, string>();
    for (const mod of data.modules || []) {
      const targetWeekId = weekIdMap.get(mod.weekId) || mod.weekId;
      const upsertedMod = await prisma.courseModule.upsert({
        where: { id: mod.id },
        update: {
          title: mod.title,
          description: mod.description,
          sortOrder: mod.sortOrder,
          weekId: targetWeekId,
        },
        create: {
          id: mod.id,
          weekId: targetWeekId,
          title: mod.title,
          description: mod.description,
          sortOrder: mod.sortOrder,
          createdAt: new Date(mod.createdAt),
          updatedAt: new Date(mod.updatedAt),
        },
      });
      moduleIdMap.set(mod.id, upsertedMod.id);
    }

    // 6. Lessons
    console.log(`Importing ${data.lessons?.length || 0} Lessons...`);
    const lessonIdMap = new Map<string, string>();
    for (const lesson of data.lessons || []) {
      const targetModuleId = moduleIdMap.get(lesson.moduleId) || lesson.moduleId;
      const upsertedLesson = await prisma.lesson.upsert({
        where: { id: lesson.id },
        update: {
          title: lesson.title,
          slug: lesson.slug,
          lessonType: lesson.lessonType,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          duration: lesson.duration,
          sortOrder: lesson.sortOrder,
          isPreview: lesson.isPreview,
          moduleId: targetModuleId,
        },
        create: {
          id: lesson.id,
          moduleId: targetModuleId,
          title: lesson.title,
          slug: lesson.slug,
          lessonType: lesson.lessonType,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          duration: lesson.duration,
          sortOrder: lesson.sortOrder,
          isPreview: lesson.isPreview,
          createdAt: new Date(lesson.createdAt),
          updatedAt: new Date(lesson.updatedAt),
        },
      });
      lessonIdMap.set(lesson.id, upsertedLesson.id);
    }

    // 7. LessonResources
    console.log(`Importing ${data.lessonResources?.length || 0} Lesson Resources (In-Portal Viewer Media)...`);
    for (const res of data.lessonResources || []) {
      const targetLessonId = lessonIdMap.get(res.lessonId) || res.lessonId;
      await prisma.lessonResource.upsert({
        where: { id: res.id },
        update: {
          name: res.name,
          description: res.description,
          resourceType: res.resourceType,
          sourceType: res.sourceType,
          fileUrl: res.fileUrl,
          fileType: res.fileType,
          fileSize: res.fileSize,
          sortOrder: res.sortOrder,
          isDownloadable: res.isDownloadable,
          isActive: res.isActive,
          lessonId: targetLessonId,
        },
        create: {
          id: res.id,
          lessonId: targetLessonId,
          name: res.name,
          description: res.description,
          resourceType: res.resourceType,
          sourceType: res.sourceType,
          fileUrl: res.fileUrl,
          fileType: res.fileType,
          fileSize: res.fileSize,
          sortOrder: res.sortOrder,
          isDownloadable: res.isDownloadable,
          isActive: res.isActive,
          createdAt: new Date(res.createdAt),
          updatedAt: new Date(res.updatedAt),
        },
      });
    }

    // 8. Enrollments
    console.log(`Importing ${data.enrollments?.length || 0} Student Enrollments...`);
    for (const enr of data.enrollments || []) {
      const targetCourseId = courseIdMap.get(enr.courseId) || enr.courseId;
      await prisma.enrollment.upsert({
        where: { id: enr.id },
        update: {
          status: enr.status,
          source: enr.source,
          courseId: targetCourseId,
          completedAt: enr.completedAt ? new Date(enr.completedAt) : null,
        },
        create: {
          id: enr.id,
          studentId: enr.studentId,
          courseId: targetCourseId,
          status: enr.status,
          source: enr.source,
          enrolledAt: new Date(enr.enrolledAt),
          completedAt: enr.completedAt ? new Date(enr.completedAt) : null,
          createdAt: new Date(enr.createdAt),
          updatedAt: new Date(enr.updatedAt),
        },
      });
    }

    // 9. Orders & Payments
    console.log(`Importing ${data.orders?.length || 0} Orders & ${data.payments?.length || 0} Payments...`);
    for (const ord of data.orders || []) {
      const targetCourseId = courseIdMap.get(ord.courseId) || ord.courseId;
      await prisma.order.upsert({
        where: { id: ord.id },
        update: {
          status: ord.status,
          amountMinor: ord.amountMinor,
          currency: ord.currency,
          courseId: targetCourseId,
          paidAt: ord.paidAt ? new Date(ord.paidAt) : null,
        },
        create: {
          id: ord.id,
          orderNumber: ord.orderNumber,
          studentId: ord.studentId,
          courseId: targetCourseId,
          amountMinor: ord.amountMinor,
          currency: ord.currency,
          status: ord.status,
          paidAt: ord.paidAt ? new Date(ord.paidAt) : null,
          createdAt: new Date(ord.createdAt),
          updatedAt: new Date(ord.updatedAt),
        },
      });
    }

    for (const pay of data.payments || []) {
      await prisma.payment.upsert({
        where: { id: pay.id },
        update: {
          status: pay.status,
          amountMinor: pay.amountMinor,
          currency: pay.currency,
          paidAt: pay.paidAt ? new Date(pay.paidAt) : null,
          failureReason: pay.failureReason,
          providerEventId: pay.providerEventId,
          authorizationUrl: pay.authorizationUrl,
        },
        create: {
          id: pay.id,
          orderId: pay.orderId,
          providerReference: pay.providerReference,
          provider: pay.provider,
          amountMinor: pay.amountMinor,
          currency: pay.currency,
          status: pay.status,
          failureReason: pay.failureReason,
          providerEventId: pay.providerEventId,
          authorizationUrl: pay.authorizationUrl,
          paidAt: pay.paidAt ? new Date(pay.paidAt) : null,
          createdAt: new Date(pay.createdAt),
          updatedAt: new Date(pay.updatedAt),
        },
      });
    }

    // 10. Lesson Progress
    console.log(`Importing ${data.lessonProgress?.length || 0} Lesson Progress records...`);
    for (const prog of data.lessonProgress || []) {
      await prisma.lessonProgress.upsert({
        where: { id: prog.id },
        update: {
          isCompleted: prog.isCompleted,
          completedAt: prog.completedAt ? new Date(prog.completedAt) : null,
        },
        create: {
          id: prog.id,
          studentId: prog.studentId,
          lessonId: prog.lessonId,
          isCompleted: prog.isCompleted,
          completedAt: prog.completedAt ? new Date(prog.completedAt) : null,
          createdAt: new Date(prog.createdAt),
          updatedAt: new Date(prog.updatedAt),
        },
      });
    }

    console.log('\n🎉 ALL DATA IMPORTED SUCCESSFULLY TO TARGET DATABASE!');
    console.log('Students, active enrollments, curriculum, and in-portal resources are 100% in sync.');
  } catch (err) {
    console.error('❌ Error during import:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
