import { db } from '@/lib/db';
import { summarizeLessonProgress } from './progress';

export async function getStudentDashboard(studentId: string) {
  const enrollments = await db.enrollment.findMany({
    where: {
      studentId,
      status: { in: ['ACTIVE', 'COMPLETED'] },
      course: { status: 'PUBLISHED' },
    },
    orderBy: { enrolledAt: 'desc' },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          category: true,
          level: true,
          duration: true,
          weeks: {
            orderBy: [{ sortOrder: 'asc' }, { weekNumber: 'asc' }],
            select: {
              modules: {
                orderBy: { sortOrder: 'asc' },
                select: {
                  lessons: {
                    where: { status: 'PUBLISHED' },
                    orderBy: { sortOrder: 'asc' },
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const lessonIds = enrollments.flatMap((enrollment) =>
    enrollment.course.weeks.flatMap((week) =>
      week.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id))
    )
  );
  const completedProgress = lessonIds.length
    ? await db.lessonProgress.findMany({
        where: { studentId, lessonId: { in: lessonIds }, isCompleted: true },
        select: { lessonId: true },
      })
    : [];
  const completedLessonIds = new Set(completedProgress.map((progress) => progress.lessonId));

  return enrollments.map((enrollment) => {
    const courseLessonIds = enrollment.course.weeks.flatMap((week) =>
      week.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id))
    );

    return {
      ...enrollment,
      progress: summarizeLessonProgress(courseLessonIds, completedLessonIds),
    };
  });
}

export async function getStudentLesson(studentId: string, courseId: string, lessonId: string) {
  const enrollment = await db.enrollment.findFirst({
    where: {
      studentId,
      courseId,
      status: { in: ['ACTIVE', 'COMPLETED'] },
      course: {
        status: 'PUBLISHED',
        weeks: {
          some: {
            modules: {
              some: {
                lessons: {
                  some: {
                    id: lessonId,
                    status: 'PUBLISHED',
                  },
                },
              },
            },
          },
        },
      },
    },
    include: {
      course: {
        include: {
          weeks: {
            orderBy: [{ sortOrder: 'asc' }, { weekNumber: 'asc' }],
            include: {
              modules: {
                orderBy: { sortOrder: 'asc' },
                include: {
                  lessons: {
                    where: { status: 'PUBLISHED' },
                    orderBy: { sortOrder: 'asc' },
                    include: { resources: true },
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

  const lessons = enrollment.course.weeks.flatMap((week) =>
    week.modules.flatMap((module) =>
      module.lessons.map((lesson) => ({
        ...lesson,
        weekTitle: week.title,
        weekNumber: week.weekNumber,
        moduleTitle: module.title,
      }))
    )
  );

  const lessonIndex = lessons.findIndex((lesson) => lesson.id === lessonId);
  if (lessonIndex < 0) return null;

  const completedProgress = await db.lessonProgress.findMany({
    where: { studentId, lessonId: { in: lessons.map((lesson) => lesson.id) }, isCompleted: true },
    select: { lessonId: true },
  });
  const completedLessonIds = new Set(completedProgress.map((progress) => progress.lessonId));

  return {
    enrollment,
    lesson: lessons[lessonIndex],
    previousLesson: lessons[lessonIndex - 1] ?? null,
    nextLesson: lessons[lessonIndex + 1] ?? null,
    isCompleted: completedLessonIds.has(lessonId),
    progress: summarizeLessonProgress(
      lessons.map((lesson) => lesson.id),
      completedLessonIds
    ),
  };
}
