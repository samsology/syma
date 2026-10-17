import test from 'node:test';
import assert from 'node:assert/strict';
import { canSubmitAssignment, normalizeAssignmentUrl, validateAssignmentScore } from '../lib/assignments/policy';
import { assignmentSchema } from '../lib/validation/assignment';
import {
  validateAssignmentFile,
  ASSIGNMENT_SUBMISSION_EXTENSIONS,
  ASSIGNMENT_DATASET_EXTENSIONS,
} from '../lib/assignments/files';

test('weekly assignment resubmission is permitted only after Needs Revision', () => {
  assert.equal(canSubmitAssignment(null), true);
  assert.equal(canSubmitAssignment('NEEDS_REVISION'), true);
  assert.equal(canSubmitAssignment('SUBMITTED'), false);
  assert.equal(canSubmitAssignment('REVIEWED'), false);
});

test('assignment URLs accept HTTP(S) and reject executable schemes', () => {
  assert.equal(normalizeAssignmentUrl('  https://example.com/work  '), 'https://example.com/work');
  assert.equal(normalizeAssignmentUrl('http://example.com/work'), 'http://example.com/work');
  assert.equal(normalizeAssignmentUrl('javascript:alert(1)'), null);
  assert.equal(normalizeAssignmentUrl('data:text/html,hi'), null);
  assert.equal(normalizeAssignmentUrl('not a URL'), null);
});

test('assignment scores are optional, nonnegative, and bounded when a maximum is configured', () => {
  assert.equal(validateAssignmentScore('', 10), null);
  assert.equal(validateAssignmentScore('0', 10), 0);
  assert.equal(validateAssignmentScore('9.5', 10), 9.5);
  assert.equal(validateAssignmentScore('-1', 10), undefined);
  assert.equal(validateAssignmentScore('10.1', 10), undefined);
  assert.equal(validateAssignmentScore('12', null), 12);
  assert.equal(validateAssignmentScore('NaN', null), undefined);
});

test('assignmentSchema handles optional fields with empty strings cleanly', () => {
  const result = assignmentSchema.safeParse({
    title: 'Week 1 Practical Lab',
    description: 'Practical data cleaning lab with pandas',
    instructions: '1. Download dataset. 2. Clean nulls. 3. Submit.',
    submissionType: 'FILE_OR_TEXT',
    maxScore: '',
    dueDateDays: '',
    dueAt: '',
    datasetUrl: '',
    datasetName: '',
    status: 'DRAFT',
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.maxScore, undefined);
    assert.equal(result.data.dueDateDays, undefined);
    assert.ok(result.data.dueAt === undefined || result.data.dueAt === '');
    assert.ok(result.data.datasetUrl === undefined || result.data.datasetUrl === '');
  }
});

test('assignmentSchema accepts Google Drive links and R2 storage keys', () => {
  const driveResult = assignmentSchema.safeParse({
    title: 'Week 2 Lab',
    description: 'Cohort analysis lab',
    instructions: 'Open the dataset in Google Drive and compute retention.',
    datasetUrl: 'https://drive.google.com/file/d/12345/view?usp=sharing',
    datasetName: 'Hospital_Visits.csv',
    maxScore: '100',
    dueDateDays: '7',
  });
  assert.equal(driveResult.success, true);
  if (driveResult.success) {
    assert.equal(driveResult.data.maxScore, 100);
    assert.equal(driveResult.data.dueDateDays, 7);
    assert.equal(
      driveResult.data.datasetUrl,
      'https://drive.google.com/file/d/12345/view?usp=sharing'
    );
  }

  const r2Result = assignmentSchema.safeParse({
    title: 'Week 3 Lab',
    description: 'Power BI report dashboard',
    instructions: 'Download the PBIX file starter and build the KPI cards.',
    datasetUrl: 'r2://courses/course-1/weeks/week-3/assignment/datasets/data.csv',
    datasetName: 'transactions.csv',
  });
  assert.equal(r2Result.success, true);
});

test('assignmentSchema rejects invalid titles and negative scores', () => {
  const badScore = assignmentSchema.safeParse({
    title: 'Week 4 Lab',
    description: 'Valid description',
    instructions: 'Valid instructions for week 4',
    maxScore: '-10',
  });
  assert.equal(badScore.success, false);

  const shortTitle = assignmentSchema.safeParse({
    title: 'A',
    description: 'Valid description',
    instructions: 'Valid instructions for week 4',
  });
  assert.equal(shortTitle.success, false);
});

test('validateAssignmentFile permits data formats including pbix, ipynb, and zip', () => {
  const pbixFile = new File([new Uint8Array(100)], 'report.pbix', {
    type: 'application/octet-stream',
  });
  assert.equal(validateAssignmentFile(pbixFile, ASSIGNMENT_SUBMISSION_EXTENSIONS), null);

  const ipynbFile = new File([new Uint8Array(100)], 'analysis.ipynb', {
    type: 'application/json',
  });
  assert.equal(validateAssignmentFile(ipynbFile, ASSIGNMENT_SUBMISSION_EXTENSIONS), null);

  const csvFile = new File([new Uint8Array(100)], 'dataset.csv', {
    type: 'text/csv',
  });
  assert.equal(validateAssignmentFile(csvFile, ASSIGNMENT_DATASET_EXTENSIONS), null);

  const exeFile = new File([new Uint8Array(100)], 'danger.exe', {
    type: 'application/x-msdownload',
  });
  assert.notEqual(validateAssignmentFile(exeFile, ASSIGNMENT_SUBMISSION_EXTENSIONS), null);
});

test('assignmentSchema handles null and empty string FormData inputs without error', () => {
  const result = assignmentSchema.safeParse({
    title: 'Week 1 Practical Lab',
    description: 'Clean and explore customer dataset',
    instructions: 'Download the dataset, calculate KPIs, and submit your spreadsheet.',
    submissionType: 'FILE_OR_TEXT',
    submissionRequirements: null,
    datasetUrl: null,
    datasetName: null,
    dueDateDays: null,
    dueAt: null,
    maxScore: null,
    status: 'DRAFT',
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.title, 'Week 1 Practical Lab');
    assert.equal(result.data.datasetUrl, undefined);
    assert.equal(result.data.datasetName, undefined);
    assert.equal(result.data.maxScore, undefined);
    assert.equal(result.data.status, 'DRAFT');
  }
});

test('assignmentSchema accepts Google Sheets URL and Excel dataset label', () => {
  const sheetsResult = assignmentSchema.safeParse({
    title: 'Spreadsheet Analytics Lab',
    description: 'Practical analysis using Google Sheets and Excel',
    instructions: 'Open the linked Google Sheet or use your local spreadsheet tool.',
    datasetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing',
    datasetName: 'Quarterly_Sales_Data.xlsx',
    status: 'DRAFT',
  });
  assert.equal(sheetsResult.success, true);
  if (sheetsResult.success) {
    assert.equal(sheetsResult.data.datasetName, 'Quarterly_Sales_Data.xlsx');
    assert.ok(sheetsResult.data.datasetUrl?.includes('docs.google.com/spreadsheets'));
  }
});

