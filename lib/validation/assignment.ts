import { z } from 'zod';

export const assignmentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Assignment title must be at least 2 characters')
    .max(150, 'Keep title under 150 characters'),
  description: z.string().trim().min(5, 'Assignment description is required'),
  instructions: z.string().trim().min(10, 'Assignment instructions are required'),
  submissionType: z.string().trim().default('FILE_OR_TEXT'),
  submissionRequirements: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  datasetUrl: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        if (val.startsWith('r2://') || val.startsWith('/')) return true;
        try {
          const u = new URL(val);
          return ['https:', 'http:'].includes(u.protocol);
        } catch {
          return false;
        }
      },
      'Dataset URL must be a valid HTTP(S) link or Google Drive link'
    )
    .optional()
    .or(z.literal('')),
  datasetName: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  dueDateDays: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return undefined;
    const n = Number(val);
    return Number.isFinite(n) ? n : val;
  }, z.number().int('Due date days must be a whole number').positive('Due date days must be positive').optional()),
  dueAt: z
    .string()
    .trim()
    .refine(
      (value) => !value || !Number.isNaN(Date.parse(value)),
      'Enter a valid due date'
    )
    .optional()
    .or(z.literal('')),
  maxScore: z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return undefined;
    const n = Number(val);
    return Number.isFinite(n) ? n : val;
  }, z.number().positive('Maximum score must be greater than zero').optional()),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
});

export type AssignmentInput = z.infer<typeof assignmentSchema>;
