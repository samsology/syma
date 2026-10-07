import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCourseItemSequence,
  calculateDripUnlockStatus,
  type CourseItem,
} from '../lib/student-course/drip-progression';

const mockCourse = {
  weeks: [
    {
      id: 'w1',
      weekNumber: 1,
      sortOrder: 1,
      assignment: { id: 'assign_w1', title: 'Week 1 Practical Lab' },
      modules: [
        {
          id: 'm1',
          sortOrder: 1,
          lessons: [
            { id: 'l1', title: 'Lesson 1.1 Intro', sortOrder: 1 },
            { id: 'l2', title: 'Lesson 1.2 Deep Dive', sortOrder: 2 },
          ],
          summary: { id: 'sum_m1', title: 'Module 1 Summary' },
          quiz: { id: 'quiz_m1', title: 'Module 1 Mastery Quiz', status: 'PUBLISHED' },
        },
      ],
    },
    {
      id: 'w2',
      weekNumber: 2,
      sortOrder: 2,
      assignment: null,
      modules: [
        {
          id: 'm2',
          sortOrder: 1,
          lessons: [{ id: 'l3', title: 'Lesson 2.1 Next Steps', sortOrder: 1 }],
          summary: null,
          quiz: null,
        },
      ],
    },
  ],
};

test('Drip Progression: Sequence builder orders course items linearly', () => {
  const sequence = buildCourseItemSequence(mockCourse);
  assert.equal(sequence.length, 6);
  assert.equal(sequence[0].id, 'l1');
  assert.equal(sequence[0].type, 'LESSON');
  assert.equal(sequence[1].id, 'l2');
  assert.equal(sequence[1].type, 'LESSON');
  assert.equal(sequence[2].id, 'sum_m1');
  assert.equal(sequence[2].type, 'SUMMARY');
  assert.equal(sequence[3].id, 'quiz_m1');
  assert.equal(sequence[3].type, 'QUIZ');
  assert.equal(sequence[4].id, 'assign_w1');
  assert.equal(sequence[4].type, 'ASSIGNMENT');
  assert.equal(sequence[5].id, 'l3');
  assert.equal(sequence[5].type, 'LESSON');
});

test('Drip Progression: Fresh enrollment unlocks only the first item', () => {
  const sequence = buildCourseItemSequence(mockCourse);
  const statusMap = calculateDripUnlockStatus(sequence, {
    completedLessonIds: new Set(),
    completedSummaryIds: new Set(),
    passedQuizIds: new Set(),
    submittedAssignmentIds: new Set(),
  });

  assert.equal(statusMap.get('l1')?.isUnlocked, true);
  assert.equal(statusMap.get('l1')?.isCurrent, true);

  assert.equal(statusMap.get('l2')?.isUnlocked, false);
  assert.equal(statusMap.get('sum_m1')?.isUnlocked, false);
  assert.equal(statusMap.get('quiz_m1')?.isUnlocked, false);
  assert.equal(statusMap.get('assign_w1')?.isUnlocked, false);
  assert.equal(statusMap.get('l3')?.isUnlocked, false);
});

test('Drip Progression: Completing Lesson 1 unlocks Lesson 2', () => {
  const sequence = buildCourseItemSequence(mockCourse);
  const statusMap = calculateDripUnlockStatus(sequence, {
    completedLessonIds: new Set(['l1']),
    completedSummaryIds: new Set(),
    passedQuizIds: new Set(),
    submittedAssignmentIds: new Set(),
  });

  assert.equal(statusMap.get('l1')?.isUnlocked, true);
  assert.equal(statusMap.get('l1')?.isCompleted, true);

  assert.equal(statusMap.get('l2')?.isUnlocked, true);
  assert.equal(statusMap.get('l2')?.isCurrent, true);
  assert.equal(statusMap.get('sum_m1')?.isUnlocked, false);
});

test('Drip Progression: Passing Module Quiz unlocks Weekly Assignment', () => {
  const sequence = buildCourseItemSequence(mockCourse);
  const statusMap = calculateDripUnlockStatus(sequence, {
    completedLessonIds: new Set(['l1', 'l2']),
    completedSummaryIds: new Set(['sum_m1']),
    passedQuizIds: new Set(['quiz_m1']),
    submittedAssignmentIds: new Set(),
  });

  assert.equal(statusMap.get('quiz_m1')?.isUnlocked, true);
  assert.equal(statusMap.get('quiz_m1')?.isCompleted, true);

  assert.equal(statusMap.get('assign_w1')?.isUnlocked, true);
  assert.equal(statusMap.get('assign_w1')?.isCurrent, true);

  assert.equal(statusMap.get('l3')?.isUnlocked, false);
});
