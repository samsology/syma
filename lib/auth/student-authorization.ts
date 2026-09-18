import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getCurrentStudent, type StudentSessionUser } from './student-session';

const accessibleEnrollmentStatuses = ['ACTIVE', 'COMPLETED'] as const;

export async function requireStudent(): Promise<StudentSessionUser> {
  const student = await getCurrentStudent();

  if (!student) {
    redirect('/student/login');
  }

  return student;
}

export async function requireEnrollment(studentId: string, courseId: string) {
  const enrollment = await db.enrollment.findFirst({
    where: {
      studentId,
      courseId,
      status: {
        in: [...accessibleEnrollmentStatuses],
      },
      course: {
        status: 'PUBLISHED',
      },
      student: {
        status: 'ACTIVE',
      },
    },
    include: {
      course: {
        include: {
          weeks: {
            orderBy: [{ sortOrder: 'asc' }, { weekNumber: 'asc' }],
            include: {
              assignment: true,
              modules: {
                orderBy: { sortOrder: 'asc' },
                include: {
                  summary: true,
                  quiz: true,
                  lessons: {
                    where: { status: 'PUBLISHED' },
                    orderBy: { sortOrder: 'asc' },
                    include: {
                      resources: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!enrollment) {
    redirect('/student');
  }

  return enrollment;
}
