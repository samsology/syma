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
