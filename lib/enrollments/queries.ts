import type { EnrollmentStatus, Prisma } from '@prisma/client';
import { db } from '@/lib/db';

export const enrollmentsPerPage = 20;
export type EnrollmentSort = 'newest' | 'oldest' | 'student-asc' | 'course-asc';

type EnrollmentListParams = {
  search?: string;
  status?: string;
  sort?: EnrollmentSort;
  page?: number;
};

function getOrderBy(sort?: EnrollmentSort): Prisma.EnrollmentOrderByWithRelationInput[] {
  if (sort === 'oldest') return [{ enrolledAt: 'asc' }];
  if (sort === 'student-asc') return [{ student: { firstName: 'asc' } }, { student: { lastName: 'asc' } }];
  if (sort === 'course-asc') return [{ course: { title: 'asc' } }];
  return [{ enrolledAt: 'desc' }];
}

export function getEnrollmentWhere(params: EnrollmentListParams): Prisma.EnrollmentWhereInput {
  const where: Prisma.EnrollmentWhereInput = {};

  if (params.status && params.status !== 'ALL') where.status = params.status as EnrollmentStatus;

  if (params.search?.trim()) {
    const query = params.search.trim();
    where.OR = [
      { student: { firstName: { contains: query, mode: 'insensitive' } } },
      { student: { lastName: { contains: query, mode: 'insensitive' } } },
      { student: { email: { contains: query, mode: 'insensitive' } } },
      { course: { title: { contains: query, mode: 'insensitive' } } },
    ];
  }

  return where;
}

export async function getAdminEnrollments(params: EnrollmentListParams) {
  const page = Math.max(params.page ?? 1, 1);
  const where = getEnrollmentWhere(params);

  const [enrollments, totalCount] = await Promise.all([
    db.enrollment.findMany({
      where,
      orderBy: getOrderBy(params.sort),
      skip: (page - 1) * enrollmentsPerPage,
      take: enrollmentsPerPage,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    }),
    db.enrollment.count({ where }),
  ]);

  return {
    enrollments,
    totalCount,
    totalPages: Math.max(Math.ceil(totalCount / enrollmentsPerPage), 1),
    page,
  };
}

export async function getAdminEnrollmentDetail(id: string) {
  const enrollment = await db.enrollment.findUnique({
    where: { id },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          weeks: {
            select: {
              modules: {
                select: {
                  lessons: {
                    where: { status: 'PUBLISHED' },
                    select: {
                      id: true,
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

  if (!enrollment) return null;

  const lessonIds = enrollment.course.weeks.flatMap((week) =>
    week.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id))
  );

  const completedProgress = lessonIds.length
    ? await db.lessonProgress.findMany({
        where: {
          studentId: enrollment.studentId,
          lessonId: { in: lessonIds },
          isCompleted: true,
        },
        select: { lessonId: true },
      })
    : [];

  const completedCount = completedProgress.length;
  const totalCount = lessonIds.length;
  const progressPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return {
    ...enrollment,
    progressSummary: {
      completedCount,
      totalCount,
      progressPercentage,
      isComplete: totalCount > 0 && completedCount === totalCount,
    },
  };
}

export async function getEnrollmentCreateOptions() {
  const [students, courses] = await Promise.all([
    db.student.findMany({
      where: { status: 'ACTIVE' },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      select: { id: true, firstName: true, lastName: true, email: true },
      take: 200,
    }),
    db.course.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { title: 'asc' },
      select: { id: true, title: true, slug: true },
      take: 200,
    }),
  ]);

  return { students, courses };
}
