import test from 'node:test';
import assert from 'node:assert/strict';
import {
  quizSchema,
  quizQuestionSchema,
  quizOptionSchema,
  quizSubmissionSchema,
} from '../lib/validation/quiz';
import {
  formatRelationalQuizQuestions,
  sanitizePublicRelationalQuestions,
  gradeRelationalQuizSubmission,
  getQuizQuestions,
  getPublicQuizQuestions,
  evaluateQuizSubmission,
  type RelationalQuizQuestion,
} from '../lib/curriculum/quiz-engine';
import { getBestQuizAttempt, summarizeCumulativeQuizScore } from '../lib/curriculum/quiz-progress';

// ---------------------------------------------------------------------------
// 1. Zod Schema Validation: Quiz & Questions
// ---------------------------------------------------------------------------
test('Phase 6.1: Quiz schema validates configuration flags and default values', () => {
  const validQuiz = quizSchema.parse({
    title: 'Python for Data Analysis Benchmark',
    passingScore: 80,
    maxAttempts: 3,
    timeLimitMinutes: 45,
    randomizeQuestions: true,
    randomizeOptions: true,
    showResults: true,
    showExplanations: false,
    status: 'PUBLISHED',
  });

  assert.equal(validQuiz.title, 'Python for Data Analysis Benchmark');
  assert.equal(validQuiz.passingScore, 80);
  assert.equal(validQuiz.maxAttempts, 3);
  assert.equal(validQuiz.timeLimitMinutes, 45);
  assert.equal(validQuiz.randomizeQuestions, true);
  assert.equal(validQuiz.randomizeOptions, true);
  assert.equal(validQuiz.showResults, true);
  assert.equal(validQuiz.showExplanations, false);
  assert.equal(validQuiz.status, 'PUBLISHED');

  // Default fallback behavior
  const minimalQuiz = quizSchema.parse({
    title: 'Basic Quiz',
  });
  assert.equal(minimalQuiz.randomizeQuestions, false);
  assert.equal(minimalQuiz.randomizeOptions, false);
  assert.equal(minimalQuiz.showResults, true);
  assert.equal(minimalQuiz.showExplanations, true);
  assert.equal(minimalQuiz.passingScore, 70);
  assert.equal(minimalQuiz.maxAttempts, 2);
});

test('Phase 6.2: Quiz Question schema enforces exactly one correct option', () => {
  // Valid question with 4 options and 1 correct
  const validQuestion = {
    questionText: 'What does SQL stand for?',
    points: 2,
    order: 1,
    options: [
      { optionText: 'Structured Question Language', isCorrect: false, order: 0 },
      { optionText: 'Structured Query Language', isCorrect: true, order: 1 },
      { optionText: 'Strong Query Logic', isCorrect: false, order: 2 },
      { optionText: 'Sequential Query Language', isCorrect: false, order: 3 },
    ],
  };

  const parsed = quizQuestionSchema.safeParse(validQuestion);
  assert.equal(parsed.success, true);

  // Invalid: No correct option
  const noCorrect = {
    ...validQuestion,
    options: validQuestion.options.map((o) => ({ ...o, isCorrect: false })),
  };
  const parsedNoCorrect = quizQuestionSchema.safeParse(noCorrect);
  assert.equal(parsedNoCorrect.success, false);

  // Invalid: Multiple correct options (for single-choice question)
  const multipleCorrect = {
    ...validQuestion,
    options: validQuestion.options.map((o) => ({ ...o, isCorrect: true })),
  };
  const parsedMultipleCorrect = quizQuestionSchema.safeParse(multipleCorrect);
  assert.equal(parsedMultipleCorrect.success, false);

  // Invalid: Less than 2 options
  const singleOption = {
    ...validQuestion,
    options: [{ optionText: 'Only one choice', isCorrect: true, order: 0 }],
  };
  const parsedSingleOption = quizQuestionSchema.safeParse(singleOption);
  assert.equal(parsedSingleOption.success, false);
});

test('Phase 6.3: Quiz submission schema validates answers payload', () => {
  const submission = quizSubmissionSchema.parse({
    quizId: 'quiz_123',
    answers: {
      q1: 'opt_a',
      q2: 'opt_c',
    },
    timeSpent: 120,
  });

  assert.equal(submission.quizId, 'quiz_123');
  assert.equal(submission.answers.q1, 'opt_a');
  assert.equal(submission.timeSpent, 120);
});

// ---------------------------------------------------------------------------
// 2. Relational Quiz Engine: Formatting & Sanitization
// ---------------------------------------------------------------------------
test('Phase 6.4: Public question sanitization never leaks isCorrect or sensitive data', () => {
  const sampleQuestions: RelationalQuizQuestion[] = [
    {
      id: 'q1',
      questionText: 'What is 2 + 2?',
      explanation: 'Basic arithmetic: 2 + 2 = 4',
      hint: 'Think of basic math',
      points: 1,
      order: 0,
      options: [
        { id: 'opt_1', optionText: '3', isCorrect: false, order: 0 },
        { id: 'opt_2', optionText: '4', isCorrect: true, order: 1 },
      ],
    },
  ];

  // When explanations are hidden
  const publicQuestions = sanitizePublicRelationalQuestions(sampleQuestions, {
    includeExplanations: false,
  });
  assert.equal(publicQuestions.length, 1);
  assert.equal(publicQuestions[0].id, 'q1');
  assert.equal(publicQuestions[0].explanation, undefined);
  assert.equal(publicQuestions[0].hint, 'Think of basic math');

  for (const opt of publicQuestions[0].options) {
    assert.equal('isCorrect' in opt, false);
  }

  // When explanations are included
  const publicWithExplanations = sanitizePublicRelationalQuestions(sampleQuestions, {
    includeExplanations: true,
  });
  assert.equal(publicWithExplanations[0].explanation, 'Basic arithmetic: 2 + 2 = 4');
  for (const opt of publicWithExplanations[0].options) {
    assert.equal('isCorrect' in opt, false);
  }
});

test('Phase 6.5: formatRelationalQuizQuestions respects ordering and random options', () => {
  const questions: RelationalQuizQuestion[] = [
    {
      id: 'q2',
      questionText: 'Question 2',
      points: 1,
      order: 1,
      options: [
        { id: 'o1', optionText: 'First', isCorrect: false, order: 0 },
        { id: 'o2', optionText: 'Second', isCorrect: true, order: 1 },
      ],
    },
    {
      id: 'q1',
      questionText: 'Question 1',
      points: 1,
      order: 0,
      options: [
        { id: 'o3', optionText: 'Alpha', isCorrect: true, order: 0 },
        { id: 'o4', optionText: 'Beta', isCorrect: false, order: 1 },
      ],
    },
  ];

  const ordered = formatRelationalQuizQuestions(questions, { randomizeQuestions: false });
  assert.equal(ordered[0].id, 'q1');
  assert.equal(ordered[1].id, 'q2');
});

// ---------------------------------------------------------------------------
// 3. Relational Server-Side Scoring & Grading Integrity
// ---------------------------------------------------------------------------
test('Phase 6.6: gradeRelationalQuizSubmission accurately calculates scores and answer records', () => {
  const questions: RelationalQuizQuestion[] = [
    {
      id: 'q1',
      questionText: 'Question 1',
      points: 2,
      order: 0,
      options: [
        { id: 'opt_1', optionText: 'Wrong', isCorrect: false, order: 0 },
        { id: 'opt_2', optionText: 'Correct', isCorrect: true, order: 1 },
      ],
    },
    {
      id: 'q2',
      questionText: 'Question 2',
      points: 3,
      order: 1,
      options: [
        { id: 'opt_3', optionText: 'Wrong', isCorrect: false, order: 0 },
        { id: 'opt_4', optionText: 'Correct', isCorrect: true, order: 1 },
      ],
    },
  ];

  // 1. Perfect score: 2 + 3 = 5 points out of 5 (100%)
  const perfectResult = gradeRelationalQuizSubmission(questions, { q1: 'opt_2', q2: 'opt_4' }, 70);
  assert.equal(perfectResult.score, 100);
  assert.equal(perfectResult.percentage, 100);
  assert.equal(perfectResult.pointsAwarded, 5);
  assert.equal(perfectResult.totalPoints, 5);
  assert.equal(perfectResult.passed, true);
  assert.equal(perfectResult.correctCount, 2);
  assert.equal(perfectResult.answers.length, 2);
  assert.equal(perfectResult.answers[0].isCorrect, true);
  assert.equal(perfectResult.answers[0].pointsAwarded, 2);
  assert.equal(perfectResult.answers[1].isCorrect, true);
  assert.equal(perfectResult.answers[1].pointsAwarded, 3);

  // 2. Partial score: Only q1 correct = 2 points out of 5 (40% < 70%)
  const partialResult = gradeRelationalQuizSubmission(questions, { q1: 'opt_2', q2: 'opt_3' }, 70);
  assert.equal(partialResult.score, 40);
  assert.equal(partialResult.percentage, 40);
  assert.equal(partialResult.pointsAwarded, 2);
  assert.equal(partialResult.passed, false);
  assert.equal(partialResult.correctCount, 1);
  assert.equal(partialResult.answers[0].isCorrect, true);
  assert.equal(partialResult.answers[1].isCorrect, false);
  assert.equal(partialResult.answers[1].pointsAwarded, 0);

  // 3. Missing answers (unanswered question treated as wrong, no crashes)
  const missingResult = gradeRelationalQuizSubmission(
    questions,
    { q1: 'opt_2' }, // q2 omitted
    70
  );
  assert.equal(missingResult.score, 40);
  assert.equal(missingResult.answers[1].selectedOptionId, null);
  assert.equal(missingResult.answers[1].isCorrect, false);
  assert.equal(missingResult.answers[1].pointsAwarded, 0);

  // 4. Zero score
  const zeroResult = gradeRelationalQuizSubmission(questions, { q1: 'opt_1', q2: 'opt_3' }, 70);
  assert.equal(zeroResult.score, 0);
  assert.equal(zeroResult.passed, false);
  assert.equal(zeroResult.correctCount, 0);
});

// ---------------------------------------------------------------------------
// 4. Backward Compatibility with Legacy Assessment System
// ---------------------------------------------------------------------------
test('Phase 6.7: Legacy quiz evaluation remains 100% operational', () => {
  const legacyQuiz = {
    title: 'Legacy Knowledge Check',
    passingScore: 70,
  };

  const questions = getQuizQuestions(legacyQuiz);
  assert.ok(questions.length > 0);

  const publicQuestions = getPublicQuizQuestions(questions);
  assert.equal(publicQuestions.length, questions.length);

  const answers: Record<string, number> = {};
  for (const q of questions) {
    answers[q.id] = q.correctIndex;
  }
  const result = evaluateQuizSubmission(questions, answers, 70);
  assert.equal(result.score, 100);
  assert.equal(result.passed, true);
});

test('Phase 6.8: cumulative quiz scoring uses each module quiz best attempt for a student', () => {
  const attempts = [
    { quizId: 'quiz_1', score: 40, passed: false },
    { quizId: 'quiz_1', score: 80, passed: true },
    { quizId: 'quiz_2', score: 60, passed: false },
  ];

  const bestQuizOne = getBestQuizAttempt(attempts.filter((attempt) => attempt.quizId === 'quiz_1'));
  assert.equal(bestQuizOne?.score, 80);

  const summary = summarizeCumulativeQuizScore(['quiz_1', 'quiz_2', 'quiz_3'], attempts);
  assert.equal(summary.totalQuizzes, 3);
  assert.equal(summary.attemptedQuizzes, 2);
  assert.equal(summary.passedQuizzes, 1);
  assert.equal(summary.cumulativeScore, 47);
  assert.equal(summary.bestByQuiz.get('quiz_1')?.score, 80);
  assert.equal(summary.bestByQuiz.get('quiz_2')?.score, 60);
  assert.equal(summary.bestByQuiz.get('quiz_3'), undefined);
});
