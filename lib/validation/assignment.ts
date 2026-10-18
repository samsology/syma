import { z } from 'zod';

const optionalCleanString = z.preprocess((val) => {
  if (val === null || val === undefined) return undefined;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed === '' ? undefined : trimmed;
  }
  return val;
}, z.string().optional());

export const assignmentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Assignment title must be at least 2 characters')
    .max(150, 'Keep title under 150 characters'),
  description: z.string().trim().min(5, 'Assignment description must be at least 5 characters'),
  instructions: z.string().trim().min(10, 'Assignment instructions must be at least 10 characters'),
  submissionType: z.preprocess(
    (val) => {
      if (!val || typeof val !== 'string') return 'FILE_OR_TEXT';
      const trimmed = val.trim();
      return ['FILE_OR_TEXT', 'FILE_ONLY', 'TEXT_ONLY'].includes(trimmed)
        ? trimmed
        : 'FILE_OR_TEXT';
    },
    z.enum(['FILE_OR_TEXT', 'FILE_ONLY', 'TEXT_ONLY']).default('FILE_OR_TEXT')
  ),
  submissionRequirements: optionalCleanString,
  datasetUrl: z.preprocess(
    (val) => {
      if (val === null || val === undefined) return undefined;
      if (typeof val === 'string') {
        const trimmed = val.trim();
        return trimmed === '' ? undefined : trimmed;
      }
      return val;
    },
    z
      .string()
      .refine((val) => {
        if (!val) return true;
        if (val.startsWith('r2://') || val.startsWith('/')) return true;
        try {
          const u = new URL(val);
          return (
            ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password
          );
        } catch {
          return false;
        }
      }, 'Dataset URL must be a valid HTTP(S) link or Google Drive link')
      .optional()
  ),
  datasetName: optionalCleanString,
  dueDateDays: z.preprocess((val) => {
    if (val === null || val === undefined || val === '') return undefined;
    const n = Number(val);
    return Number.isFinite(n) ? n : val;
  }, z.number().int('Due date days must be a whole number').positive('Due date days must be positive').optional()),
  dueAt: z.preprocess(
    (val) => {
      if (val === null || val === undefined) return undefined;
      if (typeof val === 'string') {
        const trimmed = val.trim();
        return trimmed === '' ? undefined : trimmed;
      }
      return val;
    },
    z
      .string()
      .refine(
        (value) => !value || !Number.isNaN(Date.parse(value)),
        'Enter a valid due date and time'
      )
      .optional()
  ),
  maxScore: z.preprocess((val) => {
    if (val === null || val === undefined || val === '') return undefined;
    const n = Number(val);
    return Number.isFinite(n) ? n : val;
  }, z.number().positive('Maximum score must be greater than zero').optional()),
  status: z.preprocess(
    (val) => {
      if (!val || typeof val !== 'string') return 'DRAFT';
      const upper = val.trim().toUpperCase();
      return ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(upper) ? upper : 'DRAFT';
    },
    z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT')
  ),
});

export type AssignmentInput = z.infer<typeof assignmentSchema>;
