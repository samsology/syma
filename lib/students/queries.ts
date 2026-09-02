import type { Prisma, StudentStatus } from '@prisma/client';
import { db } from '@/lib/db';

export const studentsPerPage = 20;

export type StudentSort = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

type StudentListParams = {
  search?: string;
  status?: string;
  sort?: StudentSort;
  page?: number;
};

function getOrderBy(sort?: StudentSort): Prisma.StudentOrderByWithRelationInput[] {
  if (sort === 'oldest') return [{ createdAt: 'asc' }];
  if (sort === 'name-asc') return [{ firstName: 'asc' }, { lastName: 'asc' }];
  if (sort === 'name-desc') return [{ firstName: 'desc' }, { lastName: 'desc' }];
  return [{ createdAt: 'desc' }];
}

export function getStudentWhere(params: StudentListParams): Prisma.StudentWhereInput {
  const where: Prisma.StudentWhereInput = {};

  if (params.status && params.status !== 'ALL') where.status = params.status as StudentStatus;

  if (params.search?.trim()) {
    const query = params.search.trim();
    where.OR = [
      { firstName: { contains: query, mode: 'insensitive' } },
      { lastName: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
    ];
  }

  return where;
}

export async function getAdminStudents(params: StudentListParams) {
  const page = Math.max(params.page ?? 1, 1);
  const where = getStudentWhere(params);

  const [students, totalCount] = await Promise.all([
    db.student.findMany({
      where,
      orderBy: getOrderBy(params.sort),
      skip: (page - 1) * studentsPerPage,
      take: studentsPerPage,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    }),
    db.student.count({ where }),
  ]);

  return {
    students,
    totalCount,
    totalPages: Math.max(Math.ceil(totalCount / studentsPerPage), 1),
    page,
  };
}

export async function getAdminStudentDetail(id: string) {
  return db.student.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      enrollments: {
        orderBy: { enrolledAt: 'desc' },
        include: {
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
                          progress: {
                            where: { studentId: id, isCompleted: true },
                            select: { id: true },
                          },
                        },
                      },
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
}
