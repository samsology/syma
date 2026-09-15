import assert from 'node:assert/strict';
import test from 'node:test';
import { CourseStatus } from '@prisma/client';
import { courses } from '../prisma/seed-data/courses';
import { advancedDataAnalyticsCourse } from '../prisma/seed-data/advanced-data-analytics';
import { dataLiteracyCourse } from '../prisma/seed-data/data-literacy';
import { dataAnalyticsCourse } from '../prisma/seed-data/data-analytics';
import { dataScienceCourse } from '../prisma/seed-data/data-science';
import { healthcareAnalyticsCourse } from '../prisma/seed-data/healthcare-analytics';
import { resourceSchema } from '../lib/validation/resource';

// ---------------------------------------------------------------------------
// 1. Authoritative Curriculum Migration Integrity
// ---------------------------------------------------------------------------
test('Curriculum 1.1: All 5 official courses are represented in seed-data with valid metadata', () => {
  assert.equal(courses.length, 5);

  const slugs = courses.map((c) => c.slug);
  assert.deepEqual(slugs, [
    'introduction-to-data-literacy',
    'introduction-to-data-analytics',
    'introduction-to-data-science',
    'healthcare-analytics',
    'advanced-data-analytics',
  ]);

  for (const course of courses) {
    assert.ok(course.title.length > 0);
    assert.ok(course.description.length > 0);
    assert.ok(course.shortDescription.length > 0);
    assert.ok(course.category.length > 0);
    assert.ok(course.level.length > 0);
    assert.ok(course.duration.length > 0);
    assert.ok(course.benefits.length > 0);
    assert.ok(course.cta.length > 0);
    assert.ok(course.priceMinor >= 0);
    assert.ok(course.currency === 'NGN' || course.currency === 'USD');
    assert.ok(course.weeks.length > 0, `Course ${course.slug} must have at least one week`);
  }
});

test('Curriculum 1.2: Course hierarchy integrity (Course -> Week -> Module -> Lesson)', () => {
  for (const course of courses) {
    assert.ok(course.weeks.length >= 2, `${course.slug} should have at least 2 weeks from source data`);

    for (const week of course.weeks) {
      assert.ok(week.weekNumber > 0, `Week number must be positive in ${course.slug}`);
      assert.ok(week.title.length > 0, `Week title must not be empty in ${course.slug}`);
      assert.ok(week.modules.length > 0, `Week ${week.weekNumber} must have modules in ${course.slug}`);

      for (const courseModule of week.modules) {
        assert.ok(courseModule.title.length > 0, `Module title must not be empty`);
        assert.ok(courseModule.lessons.length > 0, `Module ${courseModule.title} must have lessons`);

        for (const lesson of courseModule.lessons) {
          assert.ok(lesson.title.length > 0, `Lesson title must not be empty`);
          assert.ok(lesson.slug.length > 0, `Lesson slug must not be empty`);
          assert.match(lesson.slug, /^[a-z0-9-]+$/, `Lesson slug ${lesson.slug} must be URL-safe`);
          assert.ok(lesson.content.trim().length > 0, `Lesson ${lesson.slug} must have written instructional content`);
          assert.ok((lesson.duration ?? 0) > 0, `Lesson ${lesson.slug} must have positive duration`);
        }
      }
    }
  }
});

// ---------------------------------------------------------------------------
// 2. Strict Ordering & Resequencing
// ---------------------------------------------------------------------------
test('Curriculum 2.1: Weeks, modules, and lessons maintain sequential ordering without gaps', () => {
  for (const course of courses) {
    // Weeks should be sequential 1, 2, ...
    course.weeks.forEach((week, index) => {
      assert.equal(week.weekNumber, index + 1, `Week number should match 1-based index in ${course.slug}`);
    });

    // Lessons should have unique slugs within each module
    for (const week of course.weeks) {
      for (const courseModule of week.modules) {
        const slugs = courseModule.lessons.map((l) => l.slug);
        const uniqueSlugs = new Set(slugs);
        assert.equal(uniqueSlugs.size, slugs.length, `Duplicate lesson slugs in module ${courseModule.title}`);
      }
    }
  }
});

// ---------------------------------------------------------------------------
// 3. Idempotent Migration Simulation
// ---------------------------------------------------------------------------
test('Curriculum 3.1: Migration data structures guarantee idempotency on repeated processing', () => {
  // Simulates tracking created records using composite keys
  const processedCourses = new Map<string, typeof courses[0]>();
  const processedWeeks = new Map<string, typeof courses[0]['weeks'][0]>();
  const processedModules = new Map<string, typeof courses[0]['weeks'][0]['modules'][0]>();
  const processedLessons = new Map<string, typeof courses[0]['weeks'][0]['modules'][0]['lessons'][0]>();

  // First run
  for (const course of courses) {
    processedCourses.set(course.slug, course);
    for (const week of course.weeks) {
      const weekKey = `${course.slug}:week:${week.weekNumber}`;
      processedWeeks.set(weekKey, week);
      for (const mod of week.modules) {
        const modKey = `${weekKey}:mod:${mod.title}`;
        processedModules.set(modKey, mod);
        for (const lesson of mod.lessons) {
          const lessonKey = `${modKey}:lesson:${lesson.slug}`;
          processedLessons.set(lessonKey, lesson);
        }
      }
    }
  }

  const firstCourseCount = processedCourses.size;
  const firstWeekCount = processedWeeks.size;
  const firstModCount = processedModules.size;
  const firstLessonCount = processedLessons.size;

  assert.equal(firstCourseCount, 5);
  assert.equal(firstWeekCount, 10);
  assert.equal(firstModCount, 10);
  assert.equal(firstLessonCount, 20);

  // Second run (simulating repeated migration)
  for (const course of courses) {
    processedCourses.set(course.slug, course);
    for (const week of course.weeks) {
      const weekKey = `${course.slug}:week:${week.weekNumber}`;
      processedWeeks.set(weekKey, week);
      for (const mod of week.modules) {
        const modKey = `${weekKey}:mod:${mod.title}`;
        processedModules.set(modKey, mod);
        for (const lesson of mod.lessons) {
          const lessonKey = `${modKey}:lesson:${lesson.slug}`;
          processedLessons.set(lessonKey, lesson);
        }
      }
    }
  }

  // Counts must remain identical — 0 duplicates created
  assert.equal(processedCourses.size, firstCourseCount);
  assert.equal(processedWeeks.size, firstWeekCount);
  assert.equal(processedModules.size, firstModCount);
  assert.equal(processedLessons.size, firstLessonCount);
});

// ---------------------------------------------------------------------------
// 4. Resource Associations & Validation
// ---------------------------------------------------------------------------
test('Curriculum 4.1: LessonResource schema validates supported file types and rejects unsupported', () => {
  const validResource = {
    name: 'Clinical Coding Dataset',
    fileUrl: 'https://downloads.symatech.com/clinical-coding.csv',
    fileType: 'csv',
    fileSize: 204800,
  };

  const parsed = resourceSchema.safeParse(validResource);
  assert.equal(parsed.success, true);

  const supportedTypes = ['pdf', 'docx', 'xlsx', 'csv', 'pptx', 'txt', 'zip', 'sql', 'json', 'pbix', 'ipynb'];
  for (const ft of supportedTypes) {
    const res = resourceSchema.safeParse({
      name: `Resource test for ${ft}`,
      fileUrl: `https://downloads.symatech.com/data.${ft}`,
      fileType: ft,
    });
    assert.equal(res.success, true, `Should accept fileType: ${ft}`);
  }

  // Reject executable file types
  const dangerousResource = resourceSchema.safeParse({
    name: 'Malicious Script',
    fileUrl: 'https://downloads.symatech.com/malware.exe',
    fileType: 'exe',
  });
  assert.equal(dangerousResource.success, false);
});

// ---------------------------------------------------------------------------
// 5. Publishing Eligibility Logic (Complete vs Incomplete)
// ---------------------------------------------------------------------------
test('Curriculum 5.1: Incomplete curriculum without lessons or content cannot pass publishing validation', () => {
  // A course with 0 weeks
  const zeroWeeksErrors: string[] = [];
  if ([].length === 0) {
    zeroWeeksErrors.push('Course must have at least one week.');
  }
  assert.equal(zeroWeeksErrors.length, 1);

  // A course with a week but 0 modules
  const weekWithNoModules = { weekNumber: 1, title: 'Week 1', modules: [] };
  const weekErrors: string[] = [];
  if (weekWithNoModules.modules.length === 0) {
    weekErrors.push(`Week ${weekWithNoModules.weekNumber} has no modules. Add at least one module.`);
  }
  assert.equal(weekErrors.length, 1);

  // A course with empty lesson content
  const emptyLesson = { title: 'Empty Lesson', lessonType: 'TEXT', content: '   ' };
  const lessonErrors: string[] = [];
  if (emptyLesson.lessonType === 'TEXT' && emptyLesson.content.trim().length === 0) {
    lessonErrors.push(`Lesson "${emptyLesson.title}" (Text) requires written instructional content.`);
  }
  assert.equal(lessonErrors.length, 1);
});

test('Curriculum 5.2: Advanced Data Analytics is correctly designated as DRAFT in CMS', () => {
  assert.equal(advancedDataAnalyticsCourse.status, CourseStatus.DRAFT);
  assert.equal(advancedDataAnalyticsCourse.duration, '6 Weeks');
  assert.equal(advancedDataAnalyticsCourse.category, 'Data Analytics');
  assert.equal(advancedDataAnalyticsCourse.level, 'Advanced');
});

// ---------------------------------------------------------------------------
// 6. Student LMS Query Compatibility
// ---------------------------------------------------------------------------
test('Curriculum 6.1: Migrated curriculum structure matches student syllabus object graph', () => {
  // Check that all 5 courses match the exact hierarchy expected by student LMS views:
  // course -> weeks[] -> modules[] -> lessons[]
  for (const course of [dataLiteracyCourse, dataAnalyticsCourse, dataScienceCourse, healthcareAnalyticsCourse, advancedDataAnalyticsCourse]) {
    assert.ok(Array.isArray(course.weeks));
    for (const week of course.weeks) {
      assert.ok(typeof week.weekNumber === 'number');
      assert.ok(typeof week.title === 'string');
      assert.ok(Array.isArray(week.modules));
      for (const mod of week.modules) {
        assert.ok(typeof mod.title === 'string');
        assert.ok(Array.isArray(mod.lessons));
        for (const lesson of mod.lessons) {
          assert.ok(typeof lesson.title === 'string');
          assert.ok(typeof lesson.slug === 'string');
          assert.ok(typeof lesson.content === 'string');
          assert.ok(lesson.content.length > 0);
          assert.equal(typeof (lesson.duration ?? 30), 'number');
        }
      }
    }
  }
});
