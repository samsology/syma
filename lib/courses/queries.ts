import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import type { CourseSort } from './options';

export const coursesPerPage = 20;

type CourseListParams = {
  search?: string;
  status?: string;
  category?: string;
  level?: string;
  sort?: CourseSort;
  page?: number;
};

export function getCourseOrderBy(sort: CourseSort | undefined): Prisma.CourseOrderByWithRelationInput {
  if (sort === 'oldest') return { updatedAt: 'asc' };
  if (sort === 'title-asc') return { title: 'asc' };
  if (sort === 'title-desc') return { title: 'desc' };
  return { updatedAt: 'desc' };
}

export function getCourseWhere(params: CourseListParams): Prisma.CourseWhereInput {
  const where: Prisma.CourseWhereInput = {};

  if (params.status && params.status !== 'ALL') where.status = params.status as Prisma.EnumCourseStatusFilter;
  if (params.category && params.category !== 'ALL') where.category = params.category;
  if (params.level && params.level !== 'ALL') where.level = params.level;

  if (params.search?.trim()) {
    const query = params.search.trim();
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { slug: { contains: query, mode: 'insensitive' } },
      { category: { contains: query, mode: 'insensitive' } },
    ];
  }

  return where;
}

export async function getAdminCourses(params: CourseListParams) {
  const page = Math.max(params.page ?? 1, 1);
  const where = getCourseWhere(params);

  const [courses, totalCount] = await Promise.all([
    db.course.findMany({
      where,
      orderBy: getCourseOrderBy(params.sort),
      skip: (page - 1) * coursesPerPage,
      take: coursesPerPage,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            weeks: true,
          },
        },
      },
    }),
    db.course.count({ where }),
  ]);

  return {
    courses,
    totalCount,
    totalPages: Math.max(Math.ceil(totalCount / coursesPerPage), 1),
    page,
  };
}
