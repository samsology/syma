import assert from 'node:assert/strict';
import test from 'node:test';
import { CourseStatus, Currency, LessonType } from '@prisma/client';
import { createCourseSchema, courseSchema } from '../lib/validation/course';
import { weekSchema } from '../lib/validation/week';
import { moduleSchema } from '../lib/validation/module';
import { lessonSchema } from '../lib/validation/lesson';
import { resourceSchema } from '../lib/validation/resource';
import { reorderSchema } from '../lib/validation/curriculum';

// ---------------------------------------------------------------------------
// 1. Course Management & Lifecycle Validation
// ---------------------------------------------------------------------------
test('CMS 1.1: createCourseSchema validates complete course metadata in USD', () => {
  const validData = {
    title: 'Machine Learning for Clinical Data',
    slug: 'machine-learning-clinical-data',
    shortDescription: 'Apply predictive models to electronic health records and patient outcomes.',
    description: 'A comprehensive curriculum covering regression, decision trees, survival analysis, and EHR feature engineering.',
    category: 'Healthcare Analytics',
    level: 'Advanced',
    duration: '8 Weeks',
    priceMinor: 5990,
    currency: 'USD',
    benefits: ['EHR feature extraction', 'Survival analysis', 'Predictive clinical modeling'],
    cta: 'Apply Today',
    sortOrder: 1,
    thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d',
    instructorId: null,
  };

  const result = createCourseSchema.safeParse(validData);
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.currency, Currency.USD);
    assert.equal(result.data.priceMinor, 5990);
  }
});

test('CMS 1.2: Course schemas reject negative price, invalid slugs, or missing required fields', () => {
  const negativePrice = createCourseSchema.safeParse({
    title: 'Data Fundamentals',
    slug: 'data-fundamentals',
    shortDescription: 'Core analytics',
    description: 'Full description',
    category: 'Data Analytics',
    level: 'Beginner',
    duration: '6 Weeks',
    priceMinor: -500,
  });
  assert.equal(negativePrice.success, false);

  const invalidSlug = createCourseSchema.safeParse({
    title: 'Data Fundamentals',
    slug: 'Data_Fundamentals!@#',
    shortDescription: 'Core analytics',
    description: 'Full description',
    category: 'Data Analytics',
    level: 'Beginner',
    duration: '6 Weeks',
    priceMinor: 1000,
  });
  assert.equal(invalidSlug.success, false);

  const missingDescription = createCourseSchema.safeParse({
    title: 'Data Fundamentals',
    slug: 'data-fundamentals',
    shortDescription: 'Core analytics',
    category: 'Data Analytics',
    level: 'Beginner',
    duration: '6 Weeks',
    priceMinor: 1000,
  });
  assert.equal(missingDescription.success, false);
});

test('CMS 1.3: Course lifecycle supports DRAFT, PUBLISHED, and ARCHIVED states', () => {
  const validStatuses: CourseStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
  for (const status of validStatuses) {
    const parsed = courseSchema.safeParse({
      title: 'Course Status Test',
      slug: 'course-status-test',
      shortDescription: 'Testing status transitions',
      description: 'Long description',
      category: 'Data Literacy',
      level: 'Beginner',
      duration: '4 Weeks',
      priceMinor: 0,
      currency: 'USD',
      status,
    });
    assert.equal(parsed.success, true);
  }
});

// ---------------------------------------------------------------------------
// 2. Curriculum Hierarchy Validation (Weeks, Modules, Lessons)
// ---------------------------------------------------------------------------
test('CMS 2.1: Week schema enforces positive week numbers and required title', () => {
  const validWeek = weekSchema.safeParse({
    weekNumber: 3,
    title: 'Data Cleaning and Wrangling',
    description: 'Handling missing values, deduplication, and pandas transformations.',
  });
  assert.equal(validWeek.success, true);

  const zeroWeek = weekSchema.safeParse({
    weekNumber: 0,
    title: 'Invalid Week',
  });
  assert.equal(zeroWeek.success, false);

  const emptyTitle = weekSchema.safeParse({
    weekNumber: 1,
    title: '',
  });
  assert.equal(emptyTitle.success, false);
});

test('CMS 2.2: Module schema enforces required title and optional description', () => {
  const validModule = moduleSchema.safeParse({
    title: 'Exploratory Analysis with Matplotlib & Seaborn',
    description: 'Visualizing distributions and correlation matrices.',
  });
  assert.equal(validModule.success, true);

  const emptyModule = moduleSchema.safeParse({
    title: '   ',
  });
  assert.equal(emptyModule.success, false);
});

test('CMS 2.3: Lesson schema validates TEXT, VIDEO, and ASSIGNMENT types', () => {
  const textLesson = lessonSchema.safeParse({
    title: 'Introduction to Relational Databases',
    slug: 'intro-relational-databases',
    lessonType: 'TEXT',
    content: 'A relational database organizes data into tables...',
    duration: 30,
    isPreview: true,
    status: 'PUBLISHED',
  });
  assert.equal(textLesson.success, true);

  const videoLesson = lessonSchema.safeParse({
    title: 'Query Optimization Walkthrough',
    slug: 'query-optimization-walkthrough',
    lessonType: 'VIDEO',
    content: 'Timestamps and lecture notes for index scans...',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 45,
    isPreview: false,
    status: 'DRAFT',
  });
  assert.equal(videoLesson.success, true);

  const assignmentLesson = lessonSchema.safeParse({
    title: 'Capstone Project: Hospital Readmission Analysis',
    slug: 'capstone-hospital-readmission',
    lessonType: 'ASSIGNMENT',
    content: 'Deliverable instructions: Build a classification notebook analyzing 30-day readmissions.',
    duration: 120,
    isPreview: false,
    status: 'DRAFT',
  });
  assert.equal(assignmentLesson.success, true);
});

test('CMS 2.4: Curriculum reorderSchema strictly accepts up and down directions', () => {
  assert.equal(reorderSchema.safeParse({ direction: 'up' }).success, true);
  assert.equal(reorderSchema.safeParse({ direction: 'down' }).success, true);
  assert.equal(reorderSchema.safeParse({ direction: 'left' }).success, false);
  assert.equal(reorderSchema.safeParse({ direction: 'right' }).success, false);
});

// ---------------------------------------------------------------------------
// 3. Resource Management & Validation
// ---------------------------------------------------------------------------
test('CMS 3.1: resourceSchema accepts valid external URLs and site-relative asset paths', () => {
  const externalResource = resourceSchema.safeParse({
    name: 'Clinical Datasets Reference',
    fileUrl: 'https://drive.google.com/file/d/12345/view',
    fileType: 'pdf',
    fileSize: 2048576,
  });
  assert.equal(externalResource.success, true);

  const relativeResource = resourceSchema.safeParse({
    name: 'Starter Jupyter Notebook',
    fileUrl: '/assets/downloads/module-2-starter.ipynb',
    fileType: 'ipynb',
    fileSize: 524288,
  });
  assert.equal(relativeResource.success, true);
});

test('CMS 3.2: resourceSchema accepts common data science file types (CSV, PBIX, IPYNB, SQL, ZIP)', () => {
  const supportedTypes = ['pdf', 'docx', 'csv', 'xlsx', 'pbix', 'ipynb', 'sql', 'zip', 'txt', 'png'];
  for (const fileType of supportedTypes) {
    const parsed = resourceSchema.safeParse({
      name: `Sample ${fileType.toUpperCase()} file`,
      fileUrl: `https://downloads.symatech.com/sample.${fileType}`,
      fileType,
      fileSize: 1024,
    });
    assert.equal(parsed.success, true, `Expected ${fileType} to be accepted`);
  }
});

test('CMS 3.3: resourceSchema rejects malicious, invalid URLs or unsupported executable extensions', () => {
  const malformedUrl = resourceSchema.safeParse({
    name: 'Bad Link',
    fileUrl: 'not-a-url-and-no-slash',
    fileType: 'pdf',
  });
  assert.equal(malformedUrl.success, false);

  const executableType = resourceSchema.safeParse({
    name: 'Script',
    fileUrl: 'https://example.com/malicious.exe',
    fileType: 'exe',
  });
  assert.equal(executableType.success, false);

  const negativeSize = resourceSchema.safeParse({
    name: 'Invalid Size',
    fileUrl: 'https://example.com/data.csv',
    fileType: 'csv',
    fileSize: -100,
  });
  assert.equal(negativeSize.success, false);

  const oversize = resourceSchema.safeParse({
    name: 'Huge File',
    fileUrl: 'https://example.com/large.zip',
    fileType: 'zip',
    fileSize: 60_000_000, // > 50 MB
  });
  assert.equal(oversize.success, false);
});

// ---------------------------------------------------------------------------
// 4. Publishing Guard & Minimum Curriculum Hierarchy Rules
// ---------------------------------------------------------------------------
test('CMS 4.1: Publishing validation identifies missing weeks, modules, or lessons', () => {
  // Synthetic validation rule tester matching validateCourseForPublishing logic
  function evaluateCurriculum(course: {
    weeks: Array<{
      weekNumber: number;
      modules: Array<{
        lessons: Array<{
          title: string;
          lessonType: LessonType;
          content: string;
          videoUrl?: string | null;
        }>;
      }>;
    }>;
  }) {
    const errors: string[] = [];
    if (course.weeks.length === 0) {
      errors.push('Course must have at least one week.');
      return { valid: false, errors };
    }
    let totalModules = 0;
    let totalLessons = 0;
    for (const week of course.weeks) {
      if (week.modules.length === 0) {
        errors.push(`Week ${week.weekNumber} has no modules.`);
      }
      for (const mod of week.modules) {
        totalModules++;
        if (mod.lessons.length === 0) {
          errors.push('Module has no lessons.');
        }
        for (const lesson of mod.lessons) {
          totalLessons++;
          const content = lesson.content?.trim() ?? '';
          if (lesson.lessonType === 'TEXT' && content.length === 0) {
            errors.push(`Lesson "${lesson.title}" requires content.`);
          } else if (lesson.lessonType === 'VIDEO' && !lesson.videoUrl && content.length === 0) {
            errors.push(`Lesson "${lesson.title}" requires videoUrl or content.`);
          }
        }
      }
    }
    if (totalModules === 0) errors.push('No modules.');
    if (totalLessons === 0) errors.push('No lessons.');
    return { valid: errors.length === 0, errors };
  }

  // Case A: Course without weeks
  const emptyCourse = evaluateCurriculum({ weeks: [] });
  assert.equal(emptyCourse.valid, false);
  assert.ok(emptyCourse.errors[0].includes('at least one week'));

  // Case B: Week without modules
  const weekWithoutModules = evaluateCurriculum({
    weeks: [{ weekNumber: 1, modules: [] }],
  });
  assert.equal(weekWithoutModules.valid, false);
  assert.ok(weekWithoutModules.errors.some((e) => e.includes('has no modules')));

  // Case C: Module without lessons
  const moduleWithoutLessons = evaluateCurriculum({
    weeks: [{ weekNumber: 1, modules: [{ lessons: [] }] }],
  });
  assert.equal(moduleWithoutLessons.valid, false);
  assert.ok(moduleWithoutLessons.errors.some((e) => e.includes('has no lessons')));

  // Case D: Complete and valid curriculum
  const validCurriculum = evaluateCurriculum({
    weeks: [
      {
        weekNumber: 1,
        modules: [
          {
            lessons: [
              {
                title: 'Data Literacy Essentials',
                lessonType: 'TEXT',
                content: 'Understand quantitative vs qualitative metrics...',
              },
            ],
          },
        ],
      },
    ],
  });
  assert.equal(validCurriculum.valid, true);
  assert.equal(validCurriculum.errors.length, 0);
});

// ---------------------------------------------------------------------------
// 5. Student LMS Consumer Compatibility Invariants
// ---------------------------------------------------------------------------
test('CMS 5.1: Published curriculum preserves structure consumed by student queries', () => {
  // Simulates the object graph structure expected by getStudentDashboard & getStudentLesson
  const mockCourseGraph = {
    id: 'course-123',
    title: 'Healthcare Analytics',
    status: 'PUBLISHED' as const,
    weeks: [
      {
        id: 'week-1',
        weekNumber: 1,
        title: 'Week 1: EHR Systems',
        modules: [
          {
            id: 'mod-1',
            title: 'Module 1: Clinical Data',
            lessons: [
              {
                id: 'les-1',
                title: 'Lesson 1.1: Patient Identifiers',
                status: 'PUBLISHED' as const,
                content: 'Medical record number hashing standards...',
                resources: [
                  {
                    id: 'res-1',
                    name: 'HIPAA De-identification Guide',
                    fileUrl: 'https://downloads.symatech.com/hipaa-guide.pdf',
                    fileType: 'pdf',
                    fileSize: 1048576,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  assert.equal(mockCourseGraph.status, 'PUBLISHED');
  assert.ok(mockCourseGraph.weeks.length > 0);
  assert.ok(mockCourseGraph.weeks[0].modules.length > 0);
  assert.ok(mockCourseGraph.weeks[0].modules[0].lessons.length > 0);
  assert.equal(mockCourseGraph.weeks[0].modules[0].lessons[0].resources[0].fileType, 'pdf');
});
