import { z } from 'zod';

export const quizSchema = z.object({
  title: z.string().trim().min(2, 'Quiz title must be at least 2 characters').max(150, 'Keep title under 150 characters'),
  description: z.string().trim().optional().or(z.literal('')),
  instructions: z.string().trim().optional().or(z.literal('')),
  passingScore: z.coerce.number().int().min(1, 'Passing score must be at least 1%').max(100, 'Passing score cannot exceed 100%').default(70),
  maxAttempts: z.coerce.number().int().min(1, 'Must allow at least 1 attempt').max(10, 'Maximum attempts cannot exceed 10').default(2),
  timeLimitMinutes: z.coerce.number().int().positive('Time limit must be positive in minutes').optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
});

export type QuizInput = z.infer<typeof quizSchema>;
