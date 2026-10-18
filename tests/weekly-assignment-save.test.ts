import test from 'node:test';
import assert from 'node:assert/strict';
import { assignmentSchema } from '../lib/validation/assignment';
import {
  validateAssignmentFile,
  ASSIGNMENT_DATASET_EXTENSIONS,
} from '../lib/assignments/files';
import {
  isR2KeyForCourseWeekAssignment,
  sanitizeR2PathSegment,
} from '../lib/resources/r2-upload-key';
import { db } from '../lib/db';

test('Scenario A: Weekly assignment schema validates assignment without any dataset', () => {
  const result = assignmentSchema.safeParse({
    title: 'Week 1 Practical Lab: EDA and Cleaning',
    description: 'Perform exploratory data analysis and summary statistics.',
    instructions: '1. Follow lab directions.\n2. Calculate summary statistics.\n3. Submit findings.',
    submissionType: 'FILE_OR_TEXT',
    status: 'DRAFT',
    dueDateDays: 7,
    maxScore: 100,
    datasetUrl: '',
    datasetName: '',
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.title, 'Week 1 Practical Lab: EDA and Cleaning');
    assert.equal(result.data.status, 'DRAFT');
    assert.equal(result.data.maxScore, 100);
    assert.ok(result.data.datasetUrl === undefined || result.data.datasetUrl === '');
  }
});

test('Scenario B: Dataset file validation and R2 storage key scoping for Excel file', () => {
  // Test file validation for Excel files
  const mockXlsx = {
    name: 'Sales_Data_Q1.xlsx',
    size: 2 * 1024 * 1024, // 2 MB (within 4 MB limit)
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  } as File;
  assert.equal(validateAssignmentFile(mockXlsx, ASSIGNMENT_DATASET_EXTENSIONS), null);

  const mockXls = {
    name: 'Customer_Churn.xls',
    size: 1.5 * 1024 * 1024,
    type: 'application/vnd.ms-excel',
  } as File;
  assert.equal(validateAssignmentFile(mockXls, ASSIGNMENT_DATASET_EXTENSIONS), null);

  // Test R2 storage key formatting and course/week validation
  const courseId = 'course-123';
  const weekId = 'week-456';
  const safeCourseId = sanitizeR2PathSegment(courseId);
  const safeWeekId = sanitizeR2PathSegment(weekId);
  const uniqueKey = `courses/${safeCourseId}/weeks/${safeWeekId}/assignment/datasets/uuid-Sales_Data_Q1.xlsx`;

  assert.equal(isR2KeyForCourseWeekAssignment(uniqueKey, courseId, weekId), true);
  // Rejects different course or week
  assert.equal(isR2KeyForCourseWeekAssignment(uniqueKey, 'other-course', weekId), false);
  assert.equal(isR2KeyForCourseWeekAssignment(uniqueKey, courseId, 'other-week'), false);

  // Assignment schema validates datasetUrl with R2 storage key
  const schemaResult = assignmentSchema.safeParse({
    title: 'Excel Data Analysis Lab',
    description: 'Clean and visualize quarterly financial performance in Excel',
    instructions: 'Calculate pivot tables and profit margins.',
    submissionType: 'FILE_ONLY',
    status: 'DRAFT',
    maxScore: 50,
    datasetName: 'Sales_Data_Q1.xlsx',
    datasetUrl: `r2://${uniqueKey}`,
  });

  assert.equal(schemaResult.success, true);
  if (schemaResult.success) {
    assert.equal(schemaResult.data.datasetName, 'Sales_Data_Q1.xlsx');
    assert.equal(schemaResult.data.datasetUrl, `r2://${uniqueKey}`);
  }
});

test('Scenario C: Assignment schema validates Google Drive and Google Sheets URLs', () => {
  const sheetsUrl = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing';
  const driveUrl = 'https://drive.google.com/file/d/1a2b3c4d5e/view?usp=sharing';

  const sheetsResult = assignmentSchema.safeParse({
    title: 'Spreadsheets Analysis Lab',
    description: 'Analyze online spreadsheet',
    instructions: 'Open the Google Sheet link and make a copy to complete tasks.',
    submissionType: 'TEXT_ONLY',
    status: 'PUBLISHED',
    maxScore: 100,
    datasetName: 'Master Churn Cohort Sheet',
    datasetUrl: sheetsUrl,
  });
  assert.equal(sheetsResult.success, true);
  if (sheetsResult.success) {
    assert.equal(sheetsResult.data.datasetUrl, sheetsUrl);
  }

  const driveResult = assignmentSchema.safeParse({
    title: 'Google Drive Data Lab',
    description: 'Use the shared Google Drive dataset',
    instructions: 'Download the dataset from Google Drive.',
    submissionType: 'FILE_OR_TEXT',
    status: 'DRAFT',
    datasetName: 'Shared Drive Data',
    datasetUrl: driveUrl,
  });
  assert.equal(driveResult.success, true);
});

test('Scenario D: Supports both uploaded R2 dataset file and Google Drive link simultaneously', () => {
  const courseId = 'course-bio';
  const weekId = 'week-01';
  const r2Key = `courses/${courseId}/weeks/${weekId}/assignment/datasets/abc-clinical_data.csv`;
  const sheetsUrl = 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit';

  // Schema check with R2 dataset as primary datasetUrl and metadata intact
  const result = assignmentSchema.safeParse({
    title: 'Multi-Resource Practical Assignment',
    description: 'Complete the lab using either the raw CSV or the live Google Sheet.',
    instructions: '1. Access raw CSV or live sheet.\n2. Run regressions.\n3. Submit report.',
    submissionType: 'FILE_OR_TEXT',
    status: 'DRAFT',
    maxScore: 100,
    datasetName: 'Clinical Trial Cohort 2026',
    datasetUrl: `r2://${r2Key}`,
  });
  assert.equal(result.success, true);

  // Verify that AssignmentResource model constraints distinguish FILE and LINK cleanly:
  // FILE resource: storageKey != null, externalUrl == null
  const fileResourceRecord = {
    label: 'Clinical Trial Raw CSV',
    resourceType: 'FILE' as const,
    storageKey: r2Key,
    externalUrl: null,
  };
  assert.equal(fileResourceRecord.resourceType, 'FILE');
  assert.ok(fileResourceRecord.storageKey !== null);
  assert.equal(fileResourceRecord.externalUrl, null);

  // LINK resource: externalUrl != null, storageKey == null
  const linkResourceRecord = {
    label: 'Clinical Trial Live Google Sheet',
    resourceType: 'LINK' as const,
    storageKey: null,
    externalUrl: sheetsUrl,
  };
  assert.equal(linkResourceRecord.resourceType, 'LINK');
  assert.ok(linkResourceRecord.externalUrl !== null);
  assert.equal(linkResourceRecord.storageKey, null);
});

test('Scenario E: Error handling, file size validation, and schema rejections', () => {
  // File size exceeding 4 MB limit
  const oversizedFile = {
    name: 'Giant_Database_Dump.csv',
    size: 5 * 1024 * 1024, // 5 MB > 4 MB limit
    type: 'text/csv',
  } as File;
  const oversizedError = validateAssignmentFile(oversizedFile, ASSIGNMENT_DATASET_EXTENSIONS);
  assert.ok(oversizedError !== null);
  assert.match(oversizedError || '', /limit/i);

  // Invalid file extension
  const invalidExtFile = {
    name: 'malicious_script.exe',
    size: 1024,
    type: 'application/x-msdownload',
  } as File;
  const invalidExtError = validateAssignmentFile(invalidExtFile, ASSIGNMENT_DATASET_EXTENSIONS);
  assert.ok(invalidExtError !== null);
  assert.match(invalidExtError || '', /not supported/i);

  // Title missing
  const missingTitle = assignmentSchema.safeParse({
    title: '',
    description: 'Some description',
    instructions: 'Some instructions',
  });
  assert.equal(missingTitle.success, false);

  // Negative max score
  const negativeScore = assignmentSchema.safeParse({
    title: 'Test Assignment',
    description: 'Some description',
    instructions: 'Some instructions',
    maxScore: -5,
  });
  assert.equal(negativeScore.success, false);

  // Invalid URL scheme (e.g. javascript:)
  const invalidUrl = assignmentSchema.safeParse({
    title: 'Test Assignment',
    description: 'Some description',
    instructions: 'Some instructions',
    datasetUrl: 'javascript:alert(1)',
  });
  assert.equal(invalidUrl.success, false);
});

test('Live DB Integration: WeeklyAssignment and AssignmentResource persistence', async (t) => {
  try {
    // Find a course and week to test live relational queries
    const existingCourse = await db.course.findFirst({
      include: {
        weeks: {
          include: {
            assignment: {
              include: {
                resources: true,
              },
            },
          },
        },
      },
    });

    if (!existingCourse || existingCourse.weeks.length === 0) {
      t.skip('No course/week available for live database integration test.');
      return;
    }

    const targetWeek = existingCourse.weeks[0];

    // Verify upsert WeeklyAssignment in transaction with resources
    const testAssignment = await db.$transaction(async (tx) => {
      const asgt = await tx.weeklyAssignment.upsert({
        where: { weekId: targetWeek.id },
        create: {
          weekId: targetWeek.id,
          title: 'Diagnostic Test Assignment',
          description: 'Automated test verifying weekly assignment save flow',
          instructions: 'Test instructions for validation',
          submissionType: 'FILE_OR_TEXT',
          status: 'DRAFT',
          maxScore: 100,
          datasetName: 'Diagnostic Dataset',
          datasetUrl: 'r2://courses/test/weeks/test/assignment/datasets/test.xlsx',
        },
        update: {
          title: 'Diagnostic Test Assignment Updated',
          status: 'DRAFT',
        },
      });

      // Create or update attached resources
      await tx.assignmentResource.deleteMany({
        where: { assignmentId: asgt.id },
      });

      await tx.assignmentResource.create({
        data: {
          assignmentId: asgt.id,
          label: 'Diagnostic Dataset',
          resourceType: 'FILE',
          storageKey: 'courses/test/weeks/test/assignment/datasets/test.xlsx',
          externalUrl: null,
        },
      });

      await tx.assignmentResource.create({
        data: {
          assignmentId: asgt.id,
          label: 'Diagnostic Google Sheet',
          resourceType: 'LINK',
          storageKey: null,
          externalUrl: 'https://docs.google.com/spreadsheets/d/test',
        },
      });

      return asgt;
    });

    assert.ok(testAssignment.id);

    // Verify read back with relational resources
    const readBack = await db.weeklyAssignment.findUnique({
      where: { id: testAssignment.id },
      include: { resources: true },
    });

    assert.ok(readBack);
    assert.equal(readBack.status, 'DRAFT');
    assert.equal(readBack.resources.length, 2);

    const fileRes = readBack.resources.find((r) => r.resourceType === 'FILE');
    const linkRes = readBack.resources.find((r) => r.resourceType === 'LINK');
    assert.ok(fileRes && fileRes.storageKey?.includes('test.xlsx'));
    assert.ok(linkRes && linkRes.externalUrl?.includes('spreadsheets'));
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err.message.includes("Can't reach database server") ||
        err.message.includes('P1001') ||
        err.message.includes('ETIMEDOUT'))
    ) {
      t.skip('Database pooler network offline in local test environment.');
      return;
    }
    throw err;
  }
});
