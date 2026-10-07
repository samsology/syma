import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const student = await prisma.student.findFirst({
    where: {
      OR: [
        { firstName: { contains: 'Maya', mode: 'insensitive' } },
        { lastName: { contains: 'Okafor', mode: 'insensitive' } },
        { email: { contains: 'maya', mode: 'insensitive' } },
      ],
    },
  });

  if (!student) {
    console.log('Student Maya Okafor not found in database.');
    const allStudents = await prisma.student.findMany({
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    console.log('Available students:', JSON.stringify(allStudents, null, 2));
    return;
  }

  console.log(`Found student: ${student.firstName} ${student.lastName} (${student.email}), ID: ${student.id}`);

  const [lessonRes, summaryRes, quizRes, assignmentRes] = await Promise.all([
    prisma.lessonProgress.deleteMany({ where: { studentId: student.id } }),
    prisma.moduleSummaryProgress.deleteMany({ where: { studentId: student.id } }),
    prisma.quizAttempt.deleteMany({ where: { studentId: student.id } }),
    prisma.assignmentSubmission.deleteMany({ where: { studentId: student.id } }),
  ]);

  console.log(`Progress reset successfully for ${student.firstName} ${student.lastName}:`);
  console.log(`- Deleted ${lessonRes.count} lesson progress records.`);
  console.log(`- Deleted ${summaryRes.count} module summary progress records.`);
  console.log(`- Deleted ${quizRes.count} quiz attempt records.`);
  console.log(`- Deleted ${assignmentRes.count} assignment submission records.`);
}

main()
  .catch((err) => {
    console.error('Error resetting progress:', err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
