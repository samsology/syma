export type CourseItemType = 'LESSON' | 'SUMMARY' | 'QUIZ' | 'ASSIGNMENT';

export type CourseItem = {
  id: string;
  type: CourseItemType;
  title: string;
  weekId: string;
  moduleId?: string;
  weekNumber: number;
};

export type CourseItemStatus = {
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  lockReason?: string;
};

export type StudentCompletions = {
  completedLessonIds: Set<string> | Iterable<string>;
  completedSummaryIds: Set<string> | Iterable<string>;
  passedQuizIds: Set<string> | Iterable<string>;
  submittedAssignmentIds: Set<string> | Iterable<string>;
};

/**
 * Builds a linear sequence of learning items for a course structure.
 * Order: Week (sortOrder) -> Module (sortOrder) -> Lessons (sortOrder) -> Summary -> Quiz -> Assignment
 */
export function buildCourseItemSequence(course: {
  weeks: Array<{
    id: string;
    weekNumber: number;
    sortOrder: number;
    assignment?: { id: string; title: string } | null;
    modules: Array<{
      id: string;
      sortOrder: number;
      lessons: Array<{ id: string; title: string; sortOrder: number }>;
      summary?: { id: string; title: string } | null;
      quiz?: { id: string; title: string; status: string } | null;
    }>;
  }>;
}): CourseItem[] {
  const sortedWeeks = [...course.weeks].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.weekNumber - b.weekNumber;
  });

  const sequence: CourseItem[] = [];

  for (const week of sortedWeeks) {
    const sortedModules = [...week.modules].sort((a, b) => a.sortOrder - b.sortOrder);

    for (const module of sortedModules) {
      // 1. Lessons
      const sortedLessons = [...module.lessons].sort((a, b) => a.sortOrder - b.sortOrder);
      for (const lesson of sortedLessons) {
        sequence.push({
          id: lesson.id,
          type: 'LESSON',
          title: lesson.title,
          weekId: week.id,
          moduleId: module.id,
          weekNumber: week.weekNumber,
        });
      }

      // 2. Module Summary (if present)
      if (module.summary) {
        sequence.push({
          id: module.summary.id,
          type: 'SUMMARY',
          title: module.summary.title,
          weekId: week.id,
          moduleId: module.id,
          weekNumber: week.weekNumber,
        });
      }

      // 3. Module Quiz (if present & published)
      if (module.quiz && module.quiz.status === 'PUBLISHED') {
        sequence.push({
          id: module.quiz.id,
          type: 'QUIZ',
          title: module.quiz.title,
          weekId: week.id,
          moduleId: module.id,
          weekNumber: week.weekNumber,
        });
      }
    }

    // 4. Weekly Assignment (at end of week)
    if (week.assignment) {
      sequence.push({
        id: week.assignment.id,
        type: 'ASSIGNMENT',
        title: week.assignment.title,
        weekId: week.id,
        weekNumber: week.weekNumber,
      });
    }
  }

  return sequence;
}

/**
 * Calculates unlock status for each item in the linear course sequence.
 * Item 0 is unlocked by default.
 * Item N (N > 0) is unlocked if Item N-1 is completed.
 */
export function calculateDripUnlockStatus(
  sequence: CourseItem[],
  completions: StudentCompletions
): Map<string, CourseItemStatus> {
  const lessonSet = new Set(completions.completedLessonIds);
  const summarySet = new Set(completions.completedSummaryIds);
  const quizSet = new Set(completions.passedQuizIds);
  const assignmentSet = new Set(completions.submittedAssignmentIds);

  const statusMap = new Map<string, CourseItemStatus>();

  let previousItemCompleted = true; // Item 0 is unlocked by default
  let currentFound = false;

  for (let i = 0; i < sequence.length; i++) {
    const item = sequence[i];

    // Determine completion for this item
    let isCompleted = false;
    if (item.type === 'LESSON') {
      isCompleted = lessonSet.has(item.id);
    } else if (item.type === 'SUMMARY') {
      isCompleted = summarySet.has(item.id);
    } else if (item.type === 'QUIZ') {
      isCompleted = quizSet.has(item.id);
    } else if (item.type === 'ASSIGNMENT') {
      isCompleted = assignmentSet.has(item.id);
    }

    const isUnlocked = i === 0 || previousItemCompleted;

    let isCurrent = false;
    if (isUnlocked && !isCompleted && !currentFound) {
      isCurrent = true;
      currentFound = true;
    }

    let lockReason: string | undefined;
    if (!isUnlocked && i > 0) {
      const prev = sequence[i - 1];
      lockReason = `Complete "${prev.title}" to unlock.`;
    }

    statusMap.set(item.id, {
      isUnlocked,
      isCompleted,
      isCurrent,
      lockReason,
    });

    previousItemCompleted = isCompleted;
  }

  return statusMap;
}

export function isItemUnlocked(
  course: Parameters<typeof buildCourseItemSequence>[0],
  itemId: string,
  completions: StudentCompletions
): boolean {
  const sequence = buildCourseItemSequence(course);
  const statusMap = calculateDripUnlockStatus(sequence, completions);
  return statusMap.get(itemId)?.isUnlocked ?? false;
}
