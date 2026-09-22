import test from 'node:test';
import assert from 'node:assert/strict';
import {
  quizSchema,
  quizQuestionSchema,
  quizOptionSchema,
} from '../lib/validation/quiz';
import {
  formatRelationalQuizQuestions,
  sanitizePublicRelationalQuestions,
  gradeRelationalQuizSubmission,
  type RelationalQuizQuestion,
} from '../lib/curriculum/quiz-engine';

// ---------------------------------------------------------------------------
// 1. Admin Quiz Builder: Behavior Configuration Flags
// ---------------------------------------------------------------------------
test('Phase 7.1: ModuleQuizForm handles toggles for randomization and feedback controls', () => {
  const formDataValues = {
    title: 'Data Fundamentals Mastery Assessment',
    description: 'Final benchmark evaluation for Module 1',
    instructions: 'Review all lesson materials before taking this benchmark.',
    passingScore: 75,
    maxAttempts: 3,
    timeLimitMinutes: 30,
    randomizeQuestions: true,
    randomizeOptions: true,
    showResults: true,
    showExplanations: false,
    status: 'PUBLISHED' as const,
  };

  const parsed = quizSchema.parse(formDataValues);
  assert.equal(parsed.title, 'Data Fundamentals Mastery Assessment');
  assert.equal(parsed.randomizeQuestions, true);
  assert.equal(parsed.randomizeOptions, true);
  assert.equal(parsed.showResults, true);
  assert.equal(parsed.showExplanations, false);
  assert.equal(parsed.timeLimitMinutes, 30);
});

test('Phase 7.2: QuizQuestionManager validates multi-choice options and single correct answer', () => {
  // 1. Valid 4-choice question
  const validQuestion = {
    questionText: 'Which command exports a Pandas DataFrame to a CSV file?',
    points: 2,
    hint: 'Starts with to_',
    explanation: 'df.to_csv("filename.csv") writes the DataFrame content to disk as comma-separated values.',
    order: 0,
    options: [
      { optionText: 'df.write_csv("filename.csv")', isCorrect: false, order: 0 },
      { optionText: 'df.to_csv("filename.csv")', isCorrect: true, order: 1 },
      { optionText: 'df.export("filename.csv")', isCorrect: false, order: 2 },
      { optionText: 'df.save_as_csv("filename.csv")', isCorrect: false, order: 3 },
    ],
  };

  const parsed = quizQuestionSchema.safeParse(validQuestion);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.points, 2);
    assert.equal(parsed.data.options.length, 4);
    assert.equal(parsed.data.options.filter((o) => o.isCorrect).length, 1);
  }

  // 2. Invalid: Options without correct answer
  const invalidNoCorrect = {
    ...validQuestion,
    options: validQuestion.options.map((o) => ({ ...o, isCorrect: false })),
  };
  const parsedNoCorrect = quizQuestionSchema.safeParse(invalidNoCorrect);
  assert.equal(parsedNoCorrect.success, false);

  // 3. Invalid: Options with ambiguous multiple correct answers
  const invalidMultipleCorrect = {
    ...validQuestion,
    options: validQuestion.options.map((o) => ({ ...o, isCorrect: true })),
  };
  const parsedMultiple = quizQuestionSchema.safeParse(invalidMultipleCorrect);
  assert.equal(parsedMultiple.success, false);

  // 4. Invalid: Empty option text
  const invalidEmptyOption = {
    ...validQuestion,
    options: [
      { optionText: 'df.to_csv()', isCorrect: true, order: 0 },
      { optionText: '', isCorrect: false, order: 1 },
    ],
  };
  const parsedEmptyOption = quizQuestionSchema.safeParse(invalidEmptyOption);
  assert.equal(parsedEmptyOption.success, false);
});

test('Phase 7.3: Quiz Question options builder maintains choice order and id preservation', () => {
  const options = [
    { id: 'opt_alpha', optionText: 'Linear Regression', isCorrect: false, order: 0 },
    { id: 'opt_beta', optionText: 'Logistic Regression', isCorrect: true, order: 1 },
    { id: 'opt_gamma', optionText: 'K-Means Clustering', isCorrect: false, order: 2 },
  ];

  for (let i = 0; i < options.length; i++) {
    const parsedOpt = quizOptionSchema.parse(options[i]);
    assert.equal(parsedOpt.id, options[i].id);
    assert.equal(parsedOpt.order, i);
  }
});

test('Phase 7.4: Relational questions integrate end-to-end with student grading engine', () => {
  const questions: RelationalQuizQuestion[] = [
    {
      id: 'q_py_1',
      questionText: 'What is the default return value of a Python function without an explicit return statement?',
      points: 1,
      order: 0,
      options: [
        { id: 'o1', optionText: '0', isCorrect: false, order: 0 },
        { id: 'o2', optionText: 'False', isCorrect: false, order: 1 },
        { id: 'o3', optionText: 'None', isCorrect: true, order: 2 },
        { id: 'o4', optionText: 'undefined', isCorrect: false, order: 3 },
      ],
    },
    {
      id: 'q_py_2',
      questionText: 'Which method adds an element to the end of a Python list?',
      points: 2,
      order: 1,
      options: [
        { id: 'o5', optionText: 'list.append(item)', isCorrect: true, order: 0 },
        { id: 'o6', optionText: 'list.push(item)', isCorrect: false, order: 1 },
        { id: 'o7', optionText: 'list.add(item)', isCorrect: false, order: 2 },
      ],
    },
  ];

  // 1. Verify question formatting and public sanitization for student UI
  const formatted = formatRelationalQuizQuestions(questions, { randomizeQuestions: false });
  assert.equal(formatted[0].id, 'q_py_1');
  assert.equal(formatted[1].id, 'q_py_2');

  const publicQs = sanitizePublicRelationalQuestions(formatted);
  assert.equal(publicQs.length, 2);
  for (const q of publicQs) {
    for (const opt of q.options) {
      assert.equal('isCorrect' in opt, false);
    }
  }

  // 2. Score submission with 100% correct answers
  const submissionPass = gradeRelationalQuizSubmission(
    questions,
    {
      q_py_1: 'o3',
      q_py_2: 'o5',
    },
    70
  );
  assert.equal(submissionPass.score, 100);
  assert.equal(submissionPass.passed, true);
  assert.equal(submissionPass.pointsAwarded, 3);
  assert.equal(submissionPass.totalPoints, 3);
  assert.equal(submissionPass.answers.length, 2);
  assert.equal(submissionPass.answers[0].isCorrect, true);
  assert.equal(submissionPass.answers[1].isCorrect, true);

  // 3. Score submission with partial answers: 1 point of 3 = 33% < 70%
  const submissionFail = gradeRelationalQuizSubmission(
    questions,
    {
      q_py_1: 'o3', // 1 pt
      q_py_2: 'o6', // wrong (0 pts)
    },
    70
  );
  assert.equal(submissionFail.score, 33);
  assert.equal(submissionFail.passed, false);
  assert.equal(submissionFail.pointsAwarded, 1);
  assert.equal(submissionFail.totalPoints, 3);
  assert.equal(submissionFail.answers[0].isCorrect, true);
  assert.equal(submissionFail.answers[1].isCorrect, false);
});
