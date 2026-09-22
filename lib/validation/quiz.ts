import { z } from 'zod';

export const quizOptionSchema = z.object({
  id: z.string().optional(),
  optionText: z.string().trim().min(1, 'Option text is required'),
  isCorrect: z.boolean().default(false),
  order: z.number().int().default(0),
});

export const quizQuestionSchema = z.object({
  id: z.string().optional(),
  questionText: z.string().trim().min(2, 'Question text must be at least 2 characters'),
  explanation: z.string().trim().optional().or(z.literal('')),
  hint: z.string().trim().optional().or(z.literal('')),
  points: z.coerce.number().positive('Points must be greater than 0').default(1),
  order: z.number().int().default(0),
  options: z
    .array(quizOptionSchema)
    .min(2, 'At least 2 options are required')
    .refine(
      (opts) => opts.filter((o) => o.isCorrect).length === 1,
      'Exactly one option must be marked as correct'
    ),
});

export const quizSchema = z.object({
  title: z.string().trim().min(2, 'Quiz title must be at least 2 characters').max(150, 'Keep title under 150 characters'),
  description: z.string().trim().optional().or(z.literal('')),
  instructions: z.string().trim().optional().or(z.literal('')),
  passingScore: z.coerce.number().int().min(1, 'Passing score must be at least 1%').max(100, 'Passing score cannot exceed 100%').default(70),
  maxAttempts: z.coerce.number().int().min(1, 'Must allow at least 1 attempt').max(10, 'Maximum attempts cannot exceed 10').default(2),
  timeLimitMinutes: z.coerce.number().int().positive('Time limit must be positive in minutes').optional().or(z.literal('')),
  randomizeQuestions: z.boolean().default(false),
  randomizeOptions: z.boolean().default(false),
  showResults: z.boolean().default(true),
  showExplanations: z.boolean().default(true),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  questions: z.array(quizQuestionSchema).optional(),
});

export const quizSubmissionSchema = z.object({
  quizId: z.string().min(1, 'Quiz ID is required'),
  answers: z.record(z.string(), z.string()), // questionId -> selectedOptionId
  timeSpent: z.number().int().nonnegative().optional(),
});

export type QuizInput = z.infer<typeof quizSchema>;
export type QuizQuestionInput = z.infer<typeof quizQuestionSchema>;
export type QuizOptionInput = z.infer<typeof quizOptionSchema>;
export type QuizSubmissionInput = z.infer<typeof quizSubmissionSchema>;

