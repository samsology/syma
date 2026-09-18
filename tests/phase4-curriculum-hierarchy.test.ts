import assert from 'node:assert/strict';
import test from 'node:test';
import { lessonSchema, lessonResourceTypeSchema } from '../lib/validation/lesson';
import { summarySchema, summaryResourceTypeSchema } from '../lib/validation/summary';
import { quizSchema } from '../lib/validation/quiz';
import { assignmentSchema } from '../lib/validation/assignment';
import { calculateModuleProgress, summarizeLessonProgress } from '../lib/student-course/progress';

// ---------------------------------------------------------------------------
// 1. Unified Lesson Delivery Formats (Slide vs Video)
// ---------------------------------------------------------------------------
test('Phase 4.1: LessonResourceType and lessonSchema validate SLIDE and VIDEO delivery', () => {
  assert.equal(lessonResourceTypeSchema.safeParse('SLIDE').success, true);
  assert.equal(lessonResourceTypeSchema.safeParse('VIDEO').success, true);
  assert.equal(lessonResourceTypeSchema.safeParse('AUDIO').success, false);

  // Valid Slide Lesson
  const slideLesson = lessonSchema.safeParse({
    title: 'Data Visualisation with Power BI',
    slug: 'power-bi-visuals',
    lessonType: 'TEXT',
    resourceType: 'SLIDE',
    slideUrl: 'https://docs.google.com/presentation/d/12345/embed',
    content: 'Full slide deck and presentation transcript.',
    status: 'PUBLISHED',
  });
  assert.ok(slideLesson.success);
  if (slideLesson.success) {
    assert.equal(slideLesson.data.resourceType, 'SLIDE');
    assert.equal(slideLesson.data.slideUrl, 'https://docs.google.com/presentation/d/12345/embed');
  }

  // Valid Video Lesson
  const videoLesson = lessonSchema.safeParse({
    title: 'Introductory Data Science Concepts',
    slug: 'intro-data-science',
    lessonType: 'VIDEO',
    resourceType: 'VIDEO',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    content: 'Lecture timestamps and overview notes.',
    status: 'PUBLISHED',
  });
  assert.ok(videoLesson.success);
  if (videoLesson.success) {
    assert.equal(videoLesson.data.resourceType, 'VIDEO');
  }
});

// ---------------------------------------------------------------------------
// 2. Module Summary Schema Validation
// ---------------------------------------------------------------------------
test('Phase 4.2: ModuleSummary schema validates SLIDE and VIDEO summaries', () => {
  assert.equal(summaryResourceTypeSchema.safeParse('SLIDE').success, true);
  assert.equal(summaryResourceTypeSchema.safeParse('VIDEO').success, true);
  assert.equal(summaryResourceTypeSchema.safeParse('PDF').success, false);

  // Valid summary
  const validSummary = summarySchema.safeParse({
    title: 'Module 1 Key Takeaways & Highlights',
    description: 'Concise summary of foundations covered this module',
    content: '- Data types\n- Distributions\n- Outlier detection',
    resourceType: 'SLIDE',
    resourceUrl: 'https://docs.google.com/presentation/d/summary-deck/view',
    duration: 15,
  });
  assert.ok(validSummary.success);

  // Rejects invalid URL
  const invalidUrl = summarySchema.safeParse({
    title: 'Module Summary',
    resourceType: 'VIDEO',
    resourceUrl: 'not-a-valid-url',
  });
  assert.equal(invalidUrl.success, false);
});

// ---------------------------------------------------------------------------
// 3. Module Quiz Benchmark Validation
// ---------------------------------------------------------------------------
test('Phase 4.3: ModuleQuiz schema validates benchmark criteria (>=70% pass, max 2 attempts)', () => {
  // Default values
  const defaultQuiz = quizSchema.safeParse({
    title: 'Module 1 Mastery Knowledge Check',
  });
  assert.ok(defaultQuiz.success);
  if (defaultQuiz.success) {
    assert.equal(defaultQuiz.data.passingScore, 70); // Benchmark default
    assert.equal(defaultQuiz.data.maxAttempts, 2); // Benchmark default
    assert.equal(defaultQuiz.data.status, 'DRAFT');
  }

  // Passing score constraints
  const invalidPass1 = quizSchema.safeParse({ title: 'Test', passingScore: 0 });
  assert.equal(invalidPass1.success, false);
  const invalidPass2 = quizSchema.safeParse({ title: 'Test', passingScore: 101 });
  assert.equal(invalidPass2.success, false);

  // Attempt limits
  const invalidAttempts0 = quizSchema.safeParse({ title: 'Test', maxAttempts: 0 });
  assert.equal(invalidAttempts0.success, false);
  const invalidAttempts11 = quizSchema.safeParse({ title: 'Test', maxAttempts: 11 });
  assert.equal(invalidAttempts11.success, false);
});

// ---------------------------------------------------------------------------
// 4. Weekly Assignment Schema Validation
// ---------------------------------------------------------------------------
test('Phase 4.4: WeeklyAssignment schema validates practical scenario, instructions, and datasets', () => {
  const validAssignment = assignmentSchema.safeParse({
    title: 'Week 1 Practical Lab: Exploratory Analysis',
    description: 'Hands-on lab evaluating customer churn metrics',
    instructions: 'Step 1: Download dataset. Step 2: Clean missing rows. Step 3: Plot histogram.',
    submissionType: 'FILE_OR_TEXT',
    submissionRequirements: 'Submit Jupyter Notebook or CSV report',
    datasetUrl: 'https://cdn.symatech.com/datasets/churn-analysis.csv',
    datasetName: 'churn-analysis.csv',
    dueDateDays: 7,
    status: 'PUBLISHED',
  });
  assert.ok(validAssignment.success);

  // Requires description and instructions
  const missingDescription = assignmentSchema.safeParse({
    title: 'Week 1 Lab',
    description: '',
    instructions: 'Do some work',
  });
  assert.equal(missingDescription.success, false);
});

// ---------------------------------------------------------------------------
// 5. Multi-Tier Progress Engine
// ---------------------------------------------------------------------------
test('Phase 4.5: Multi-tier progress engine computes module and course completion accurately', () => {
  const lessonIds = ['l1', 'l2', 'l3'];
  const completedLessonIds = new Set(['l1', 'l2']);

  // Without summary or quiz
  const basicProgress = calculateModuleProgress({
    lessonIds,
    completedLessonIds,
  });
  assert.equal(basicProgress.totalItems, 3);
  assert.equal(basicProgress.completedItems, 2);
  assert.equal(basicProgress.percentage, 67);
  assert.equal(basicProgress.isComplete, false);

  // With summary and quiz - partially complete
  const extendedProgress = calculateModuleProgress({
    lessonIds,
    completedLessonIds: new Set(['l1', 'l2', 'l3']),
    hasSummary: true,
    isSummaryCompleted: true,
    hasQuiz: true,
    isQuizPassed: false, // Quiz not passed yet
  });
  assert.equal(extendedProgress.totalItems, 5); // 3 lessons + 1 summary + 1 quiz
  assert.equal(extendedProgress.completedItems, 4); // 3 lessons + 1 summary
  assert.equal(extendedProgress.percentage, 80);
  assert.equal(extendedProgress.isComplete, false);
  assert.equal(extendedProgress.lessonsComplete, true);
  assert.equal(extendedProgress.summaryComplete, true);
  assert.equal(extendedProgress.quizPassed, false);

  // Fully complete
  const allCompleteProgress = calculateModuleProgress({
    lessonIds,
    completedLessonIds: new Set(['l1', 'l2', 'l3']),
    hasSummary: true,
    isSummaryCompleted: true,
    hasQuiz: true,
    isQuizPassed: true,
  });
  assert.equal(allCompleteProgress.completedItems, 5);
  assert.equal(allCompleteProgress.percentage, 100);
  assert.equal(allCompleteProgress.isComplete, true);
  assert.equal(allCompleteProgress.quizPassed, true);
});

// ---------------------------------------------------------------------------
// 6. Backward Compatibility for Standard summarizeLessonProgress
// ---------------------------------------------------------------------------
test('Phase 4.6: Standard summarizeLessonProgress remains 100% backward compatible', () => {
  const result = summarizeLessonProgress(['a', 'b', 'c', 'd'], ['a', 'b']);
  assert.equal(result.totalLessons, 4);
  assert.equal(result.completedLessons, 2);
  assert.equal(result.percentage, 50);
  assert.equal(result.isComplete, false);
  assert.equal(result.nextLessonId, 'c');
});
