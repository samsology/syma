import { db } from '@/lib/db';

export async function getCourseWithCurriculum(idOrSlug: string) {
  const decodedId = decodeURIComponent(idOrSlug);

  // Step 1: Find course by id or slug
  const course = await db.course.findFirst({
    where: { OR: [{ id: decodedId }, { slug: decodedId }] },
    include: {
      instructor: { select: { id: true, name: true, email: true } },
    },
  });

  if (!course) return null;

  // Step 2: Fetch weeks with weekly assignment
  const weeks = await db.courseWeek.findMany({
    where: { courseId: course.id },
    orderBy: [{ sortOrder: 'asc' }, { weekNumber: 'asc' }],
    include: { assignment: true },
  });

  const weekIds = weeks.map((w) => w.id);
  if (weekIds.length === 0) {
    return { ...course, weeks: [] };
  }

  // Step 3: Fetch modules with summary
  const modules = await db.courseModule.findMany({
    where: { weekId: { in: weekIds } },
    orderBy: { sortOrder: 'asc' },
    include: { summary: true },
  });

  const moduleIds = modules.map((m) => m.id);
  if (moduleIds.length === 0) {
    const emptyWeeks = weeks.map((w) => ({ ...w, modules: [] }));
    return { ...course, weeks: emptyWeeks };
  }

  // Step 4: Parallel query for lessons + resources and module quizzes + questions + options
  const [lessons, quizzes] = await Promise.all([
    db.lesson.findMany({
      where: { moduleId: { in: moduleIds } },
      orderBy: { sortOrder: 'asc' },
      include: { resources: { orderBy: { createdAt: 'asc' } } },
    }),
    db.moduleQuiz.findMany({
      where: { moduleId: { in: moduleIds } },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: { options: { orderBy: { order: 'asc' } } },
        },
      },
    }),
  ]);

  // Step 5: Map relations cleanly in memory
  const lessonsByModule = new Map<string, typeof lessons>();
  for (const lesson of lessons) {
    const list = lessonsByModule.get(lesson.moduleId) || [];
    list.push(lesson);
    lessonsByModule.set(lesson.moduleId, list);
  }

  const quizzesByModule = new Map<string, (typeof quizzes)[0]>();
  for (const quiz of quizzes) {
    quizzesByModule.set(quiz.moduleId, quiz);
  }

  const modulesByWeek = new Map<string, any[]>();
  for (const mod of modules) {
    const fullModule = {
      ...mod,
      lessons: lessonsByModule.get(mod.id) || [],
      quiz: quizzesByModule.get(mod.id) || null,
    };
    const list = modulesByWeek.get(mod.weekId) || [];
    list.push(fullModule);
    modulesByWeek.set(mod.weekId, list);
  }

  const fullWeeks = weeks.map((w) => ({
    ...w,
    modules: modulesByWeek.get(w.id) || [],
  }));

  return { ...course, weeks: fullWeeks };
}
