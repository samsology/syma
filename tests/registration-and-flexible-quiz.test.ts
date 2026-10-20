import test from 'node:test';
import assert from 'node:assert/strict';
import { quizSchema } from '../lib/validation/quiz';
import {
  calculateDripUnlockStatus,
  buildCourseItemSequence,
  type StudentCompletions,
} from '../lib/student-course/drip-progression';
import {
  generateRegistrationToken,
  hashRegistrationToken,
  getContinuationUrl,
} from '../lib/auth/registration-token';
import { getCanonicalAppUrl } from '../lib/payments/service';
import { formatMoney } from '../lib/payments/rules';

test('1. Quiz Schema validates flexible attempt policies and progression settings', () => {
  const unlimitedQuiz = quizSchema.safeParse({
    title: 'Biostatistics Assessment',
    attemptPolicy: 'UNLIMITED',
    requirePassingToProgress: false,
    allowLearningAfterExhausted: true,
    allowAttemptRequests: true,
  });
  assert.equal(unlimitedQuiz.success, true);
  if (unlimitedQuiz.success) {
    assert.equal(unlimitedQuiz.data.attemptPolicy, 'UNLIMITED');
    assert.equal(unlimitedQuiz.data.requirePassingToProgress, false);
    assert.equal(unlimitedQuiz.data.allowLearningAfterExhausted, true);
    assert.equal(unlimitedQuiz.data.allowAttemptRequests, true);
  }

  const limitedQuiz = quizSchema.safeParse({
    title: 'Clinical Data Assessment',
    attemptPolicy: 'LIMITED',
    maxAttempts: 5,
    requirePassingToProgress: true,
  });
  assert.equal(limitedQuiz.success, true);
  if (limitedQuiz.success) {
    assert.equal(limitedQuiz.data.attemptPolicy, 'LIMITED');
    assert.equal(limitedQuiz.data.maxAttempts, 5);
    assert.equal(limitedQuiz.data.requirePassingToProgress, true);
  }
});

test('2. Drip Progression unlocks next module when progression override is granted', () => {
  const dummyCourse = {
    weeks: [
      {
        id: 'week-1',
        weekNumber: 1,
        sortOrder: 1,
        modules: [
          {
            id: 'mod-1',
            sortOrder: 1,
            lessons: [{ id: 'lesson-1', title: 'Lesson 1', sortOrder: 1 }],
            quiz: {
              id: 'quiz-1',
              title: 'Module 1 Quiz',
              status: 'PUBLISHED',
              requirePassingToProgress: true,
              allowLearningAfterExhausted: true,
            },
          },
          {
            id: 'mod-2',
            sortOrder: 2,
            lessons: [{ id: 'lesson-2', title: 'Lesson 2', sortOrder: 1 }],
          },
        ],
      },
    ],
  };

  const sequence = buildCourseItemSequence(dummyCourse);

  // Case A: Student completed lesson-1, but failed quiz-1 (no override)
  const completionsFailed: StudentCompletions = {
    completedLessonIds: ['lesson-1'],
    completedSummaryIds: [],
    passedQuizIds: [],
    submittedAssignmentIds: [],
    progressionGrantedQuizIds: [],
  };
  const statusFailed = calculateDripUnlockStatus(sequence, completionsFailed);
  assert.equal(statusFailed.get('lesson-1')?.isUnlocked, true);
  assert.equal(statusFailed.get('quiz-1')?.isUnlocked, true);
  assert.equal(statusFailed.get('lesson-2')?.isUnlocked, false); // Locked because quiz not passed

  // Case B: Student has progressionGrantedQuizIds override
  const completionsOverridden: StudentCompletions = {
    completedLessonIds: ['lesson-1'],
    completedSummaryIds: [],
    passedQuizIds: [],
    submittedAssignmentIds: [],
    progressionGrantedQuizIds: ['quiz-1'],
  };
  const statusOverridden = calculateDripUnlockStatus(sequence, completionsOverridden);
  assert.equal(statusOverridden.get('lesson-1')?.isUnlocked, true);
  assert.equal(statusOverridden.get('quiz-1')?.isUnlocked, true);
  assert.equal(statusOverridden.get('quiz-1')?.isCompleted, true);
  assert.equal(statusOverridden.get('lesson-2')?.isUnlocked, true); // Unlocked via override!
});

test('3. Drip Progression unlocks when requirePassingToProgress is false and quiz is attempted', () => {
  const dummyCourse = {
    weeks: [
      {
        id: 'week-1',
        weekNumber: 1,
        sortOrder: 1,
        modules: [
          {
            id: 'mod-1',
            sortOrder: 1,
            lessons: [{ id: 'lesson-1', title: 'Lesson 1', sortOrder: 1 }],
            quiz: {
              id: 'quiz-1',
              title: 'Module 1 Quiz',
              status: 'PUBLISHED',
              requirePassingToProgress: false, // Optional quiz
            },
          },
          {
            id: 'mod-2',
            sortOrder: 2,
            lessons: [{ id: 'lesson-2', title: 'Lesson 2', sortOrder: 1 }],
          },
        ],
      },
    ],
  };

  const sequence = buildCourseItemSequence(dummyCourse);
  const completions: StudentCompletions = {
    completedLessonIds: ['lesson-1'],
    completedSummaryIds: [],
    passedQuizIds: [],
    submittedAssignmentIds: [],
    attemptedQuizIds: ['quiz-1'],
  };

  const status = calculateDripUnlockStatus(sequence, completions);
  assert.equal(status.get('lesson-2')?.isUnlocked, true);
});

test('4. Registration continuation token generation, hashing, and canonical URL formation', () => {
  const { rawToken, tokenHash, expiresAt } = generateRegistrationToken();
  assert.ok(rawToken && rawToken.length >= 32);
  assert.ok(tokenHash && tokenHash.length === 64);
  assert.ok(expiresAt > new Date());

  const computedHash = hashRegistrationToken(rawToken);
  assert.equal(computedHash, tokenHash);

  const continuationUrl = getContinuationUrl(rawToken);
  assert.ok(continuationUrl.includes('/continue-registration/'));
  assert.ok(continuationUrl.includes(rawToken));
});

test('5. Canonical App URL handles Vercel URLs safely without throwing unconfigured error', () => {
  const originalAppUrl = process.env.APP_URL;
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const originalVercelUrl = process.env.VERCEL_URL;

  delete process.env.APP_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.NEXT_PUBLIC_APP_URL;
  process.env.VERCEL_URL = 'syma-nine.vercel.app';

  try {
    const url = getCanonicalAppUrl();
    assert.equal(url.protocol, 'https:');
    assert.equal(url.hostname, 'syma-nine.vercel.app');
  } finally {
    if (originalAppUrl) process.env.APP_URL = originalAppUrl;
    if (originalSiteUrl) process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    if (originalVercelUrl) process.env.VERCEL_URL = originalVercelUrl;
    else delete process.env.VERCEL_URL;
  }
});

test('6. Currency formatting renders Nigerian Naira exclusively in LMS tuition displays', () => {
  const n19900 = formatMoney(1990000, 'NGN', { showDecimals: false });
  assert.equal(n19900, '₦19,900');
  assert.equal(n19900.includes('USD'), false);

  const n29900 = formatMoney(2990000, 'NGN', { showDecimals: false });
  assert.equal(n29900, '₦29,900');
  assert.equal(n29900.includes('USD'), false);
});
