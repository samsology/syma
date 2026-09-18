import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Exporting full database snapshot (Curriculum + Resources + Students + Orders)...');

  try {
    const admins = await prisma.admin.findMany();
    const courses = await prisma.course.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    const weeks = await prisma.courseWeek.findMany({
      orderBy: [{ courseId: 'asc' }, { sortOrder: 'asc' }, { weekNumber: 'asc' }],
    });
    const modules = await prisma.courseModule.findMany({
      orderBy: [{ weekId: 'asc' }, { sortOrder: 'asc' }],
    });
    const lessons = await prisma.lesson.findMany({
      orderBy: [{ moduleId: 'asc' }, { sortOrder: 'asc' }],
    });
    const lessonResources = await prisma.lessonResource.findMany({
      orderBy: [{ lessonId: 'asc' }, { sortOrder: 'asc' }],
    });
    const students = await prisma.student.findMany();
    const enrollments = await prisma.enrollment.findMany();
    const orders = await prisma.order.findMany();
    const payments = await prisma.payment.findMany();
    const lessonProgress = await prisma.lessonProgress.findMany();
    const moduleSummaries = await prisma.moduleSummary.findMany();
    const moduleQuizzes = await prisma.moduleQuiz.findMany();
    const weeklyAssignments = await prisma.weeklyAssignment.findMany();

    const snapshot = {
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      data: {
        admins,
        courses,
        weeks,
        modules,
        lessons,
        lessonResources,
        students,
        enrollments,
        orders,
        payments,
        lessonProgress,
        moduleSummaries,
        moduleQuizzes,
        weeklyAssignments,
      },
      counts: {
        admins: admins.length,
        courses: courses.length,
        weeks: weeks.length,
        modules: modules.length,
        lessons: lessons.length,
        lessonResources: lessonResources.length,
        students: students.length,
        enrollments: enrollments.length,
        orders: orders.length,
        payments: payments.length,
        lessonProgress: lessonProgress.length,
      },
    };

    const outDir = path.resolve(process.cwd(), 'prisma');
    const outFile = path.join(outDir, 'database-snapshot.json');

    fs.writeFileSync(outFile, JSON.stringify(snapshot, null, 2), 'utf8');

    console.log('✅ Export complete! Saved to:', outFile);
    console.log('📊 Export summary:', snapshot.counts);
  } catch (err) {
    console.error('❌ Failed to export database:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
