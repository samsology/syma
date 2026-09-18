export type LessonProgressSummary = {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
  isComplete: boolean;
  nextLessonId: string | null;
};

export function summarizeLessonProgress(
  lessonIds: string[],
  completedLessonIds: Iterable<string>
): LessonProgressSummary {
  const completed = new Set(completedLessonIds);
  const completedLessons = lessonIds.filter((lessonId) => completed.has(lessonId)).length;
  const totalLessons = lessonIds.length;
  const percentage = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  const nextLessonId = lessonIds.find((lessonId) => !completed.has(lessonId)) ?? null;

  return {
    completedLessons,
    totalLessons,
    percentage,
    isComplete: totalLessons > 0 && completedLessons === totalLessons,
    nextLessonId,
  };
}

export type ModuleProgressSummary = {
  totalItems: number;
  completedItems: number;
  percentage: number;
  isComplete: boolean;
  lessonsComplete: boolean;
  summaryComplete: boolean;
  quizPassed: boolean;
};

export function calculateModuleProgress(params: {
  lessonIds: string[];
  completedLessonIds: Set<string> | Iterable<string>;
  hasSummary?: boolean;
  isSummaryCompleted?: boolean;
  hasQuiz?: boolean;
  isQuizPassed?: boolean;
}): ModuleProgressSummary {
  const completedSet = params.completedLessonIds instanceof Set ? params.completedLessonIds : new Set(params.completedLessonIds);
  const completedLessonsCount = params.lessonIds.filter((id) => completedSet.has(id)).length;
  const lessonsComplete = params.lessonIds.length === 0 || completedLessonsCount === params.lessonIds.length;

  let totalItems = params.lessonIds.length;
  let completedItems = completedLessonsCount;

  if (params.hasSummary) {
    totalItems += 1;
    if (params.isSummaryCompleted) completedItems += 1;
  }

  if (params.hasQuiz) {
    totalItems += 1;
    if (params.isQuizPassed) completedItems += 1;
  }

  const percentage = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  return {
    totalItems,
    completedItems,
    percentage,
    isComplete: totalItems > 0 && completedItems === totalItems,
    lessonsComplete,
    summaryComplete: params.hasSummary ? !!params.isSummaryCompleted : true,
    quizPassed: params.hasQuiz ? !!params.isQuizPassed : true,
  };
}

