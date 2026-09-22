export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export type PublicQuizQuestion = Omit<QuizQuestion, 'correctIndex'>;

export interface RelationalQuizOption {
  id: string;
  optionText: string;
  isCorrect: boolean;
  order: number;
}

export interface RelationalQuizQuestion {
  id: string;
  questionText: string;
  explanation?: string | null;
  hint?: string | null;
  points: number;
  order: number;
  options: RelationalQuizOption[];
}

export interface PublicRelationalOption {
  id: string;
  optionText: string;
  order: number;
}

export interface PublicRelationalQuestion {
  id: string;
  questionText: string;
  hint?: string | null;
  explanation?: string | null;
  points: number;
  order: number;
  options: PublicRelationalOption[];
}

/**
 * Shuffles array items using Fisher-Yates algorithm.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const cloned = [...array];
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = cloned[i];
    cloned[i] = cloned[j]!;
    cloned[j] = temp!;
  }
  return cloned;
}

/**
 * Formats database quiz questions with optional question and option randomization.
 */
export function formatRelationalQuizQuestions(
  questions: RelationalQuizQuestion[],
  options?: { randomizeQuestions?: boolean; randomizeOptions?: boolean }
): RelationalQuizQuestion[] {
  let processed = questions.map((q) => ({
    ...q,
    options: options?.randomizeOptions ? shuffleArray(q.options) : [...q.options].sort((a, b) => a.order - b.order),
  }));

  if (options?.randomizeQuestions) {
    processed = shuffleArray(processed);
  } else {
    processed.sort((a, b) => a.order - b.order);
  }

  return processed;
}

/**
 * Strips out answer keys (isCorrect) and sensitive fields before sending questions to student clients.
 */
export function sanitizePublicRelationalQuestions(
  questions: RelationalQuizQuestion[],
  options?: { includeExplanations?: boolean }
): PublicRelationalQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    hint: q.hint,
    explanation: options?.includeExplanations ? q.explanation : undefined,
    points: q.points,
    order: q.order,
    options: q.options.map((opt) => ({
      id: opt.id,
      optionText: opt.optionText,
      order: opt.order,
    })),
  }));
}

export interface RelationalGradingResult {
  score: number; // 0 - 100 percentage
  percentage: number;
  totalPoints: number;
  pointsAwarded: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  answers: Array<{
    questionId: string;
    selectedOptionId: string | null;
    isCorrect: boolean;
    pointsAwarded: number;
  }>;
}

/**
 * Authoritative server-side grading for relational quiz submissions.
 */
export function gradeRelationalQuizSubmission(
  questions: RelationalQuizQuestion[],
  submittedAnswers: Record<string, string | null | undefined>,
  passingScore: number
): RelationalGradingResult {
  const totalQuestions = questions.length;
  if (totalQuestions === 0) {
    return {
      score: 100,
      percentage: 100,
      totalPoints: 0,
      pointsAwarded: 0,
      passed: true,
      correctCount: 0,
      totalQuestions: 0,
      answers: [],
    };
  }

  let totalPoints = 0;
  let pointsAwarded = 0;
  let correctCount = 0;

  const answers: RelationalGradingResult['answers'] = [];

  for (const q of questions) {
    const qPoints = q.points > 0 ? q.points : 1;
    totalPoints += qPoints;

    const selectedOptionId = submittedAnswers[q.id] || null;
    const correctOption = q.options.find((o) => o.isCorrect);
    const isCorrect = !!(selectedOptionId && correctOption && selectedOptionId === correctOption.id);

    const questionPointsEarned = isCorrect ? qPoints : 0;
    if (isCorrect) {
      correctCount += 1;
      pointsAwarded += questionPointsEarned;
    }

    answers.push({
      questionId: q.id,
      selectedOptionId,
      isCorrect,
      pointsAwarded: questionPointsEarned,
    });
  }

  const percentage = totalPoints > 0 ? Math.round((pointsAwarded / totalPoints) * 100) : 0;
  const passed = percentage >= passingScore;

  return {
    score: percentage,
    percentage,
    totalPoints,
    pointsAwarded,
    passed,
    correctCount,
    totalQuestions,
    answers,
  };
}

/**
 * Fallback question banks mapped by topic keywords if questions are not provided via JSON in instructions.
 */
const DEFAULT_QUESTIONS_BY_TOPIC: Record<string, QuizQuestion[]> = {
  default: [
    {
      id: 'q1',
      question: 'Which of the following best describes the primary goal of data analysis?',
      options: [
        'Collecting as much raw data as possible regardless of quality',
        'Extracting actionable insights to support informed decision-making',
        'Writing complex formulas without validating source inputs',
        'Replacing human judgment completely with automated scripts',
      ],
      correctIndex: 1,
      explanation: 'Data analysis aims to clean, analyze, and transform data into actionable insights for decision-making.',
    },
    {
      id: 'q2',
      question: 'Why is data cleaning and validation essential prior to exploratory analysis?',
      options: [
        'It is an optional step that only applies to financial modeling',
        'Raw data rarely contains inconsistencies or missing values',
        'Errors and missing entries directly compromise the accuracy and reliability of downstream conclusions',
        'It increases the file size of the database',
      ],
      correctIndex: 2,
      explanation: 'Inaccurate or dirty data leads to invalid analytics and faulty decisions (Garbage In, Garbage Out).',
    },
    {
      id: 'q3',
      question: 'What is the key difference between descriptive and prescriptive analytics?',
      options: [
        'Descriptive explains what happened; prescriptive recommends what action to take',
        'Descriptive predicts future outcomes; prescriptive reviews historical events',
        'Descriptive only applies to numbers; prescriptive only applies to text',
        'There is no functional difference between them',
      ],
      correctIndex: 0,
      explanation: 'Descriptive analytics summarizes past occurrences, whereas prescriptive analytics recommends specific courses of action.',
    },
    {
      id: 'q4',
      question: 'When presenting data insights to executive stakeholders, what is most important?',
      options: [
        'Including every raw query and intermediate calculation in the slide deck',
        'Using technical jargon to demonstrate computational difficulty',
        'Communicating clear business implications and visual summaries aligned with core objectives',
        'Omitting data sources entirely to avoid scrutiny',
      ],
      correctIndex: 2,
      explanation: 'Stakeholders need clear, high-impact summaries that translate data metrics into strategic decisions.',
    },
  ],
};

/**
 * Extracts questions from instructions if formatted as embedded JSON,
 * or returns standard curriculum knowledge check questions.
 */
export function getQuizQuestions(quiz: {
  title?: string | null;
  instructions?: string | null;
  description?: string | null;
}): QuizQuestion[] {
  if (quiz.instructions) {
    try {
      const match = quiz.instructions.match(/```json([\s\S]*?)```/) || quiz.instructions.match(/(\{[\s\S]*"questions"[\s\S]*\})/);
      const jsonStr = match ? match[1] ?? match[0] : null;
      if (jsonStr) {
        const parsed = JSON.parse(jsonStr.trim());
        if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return parsed.questions as QuizQuestion[];
        }
      }
    } catch {
      // Fallback to topic bank if custom JSON parsing fails
    }
  }

  return DEFAULT_QUESTIONS_BY_TOPIC.default;
}

/**
 * Strips out the answer key (correctIndex) so student clients cannot inspect the answers.
 */
export function getPublicQuizQuestions(questions: QuizQuestion[]): PublicQuizQuestion[] {
  return questions.map(({ id, question, options, explanation }) => ({
    id,
    question,
    options,
    explanation,
  }));
}

/**
 * Server-side evaluation of submitted student answers against the question key.
 */
export function evaluateQuizSubmission(
  questions: QuizQuestion[],
  submittedAnswers: Record<string, number>,
  passingScore: number
): {
  score: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
} {
  const totalQuestions = questions.length;
  if (totalQuestions === 0) {
    return { score: 100, passed: true, correctCount: 0, totalQuestions: 0 };
  }

  let correctCount = 0;
  for (const q of questions) {
    const studentChoice = submittedAnswers[q.id];
    if (studentChoice !== undefined && studentChoice === q.correctIndex) {
      correctCount += 1;
    }
  }

  const score = Math.round((correctCount / totalQuestions) * 100);
  const passed = score >= passingScore;

  return {
    score,
    passed,
    correctCount,
    totalQuestions,
  };
}

