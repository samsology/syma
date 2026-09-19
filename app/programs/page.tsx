import type { Metadata } from 'next';
import ProgramsPageContent from './ProgramsPageContent';
import { db } from '@/lib/db';
import { getCurrentStudent } from '@/lib/auth/student-session';

export const metadata: Metadata = {
  title: 'Practical-Based Data Programs | Syma Tech Solutions',
  description:
    'LEARN. PRACTICE. BUILD. APPLY. Practical-based data programs built to take you from beginners to specialist across Data Literacy, Data Analytics, Data Science, and Healthcare Analytics.',
};

export default async function ProgramsPage() {
  const student = await getCurrentStudent();
  const [courses, enrolledCourseIds] = await Promise.all([
    db.course
      .findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          description: true,
          category: true,
          level: true,
          duration: true,
          priceMinor: true,
          currency: true,
          benefits: true,
          cta: true,
          sortOrder: true,
          thumbnailUrl: true,
        },
      })
      .catch(() => []),
    student
      ? db.enrollment
          .findMany({
            where: {
              studentId: student.id,
              status: { in: ['ACTIVE', 'COMPLETED'] },
            },
            select: { courseId: true },
          })
          .then((enrollments) => enrollments.map((enrollment) => enrollment.courseId))
          .catch(() => [])
      : Promise.resolve([]),
  ]);

  return (
    <ProgramsPageContent
      publishedCourses={courses}
      enrolledCourseIds={enrolledCourseIds}
      isStudentSignedIn={Boolean(student)}
    />
  );
}
