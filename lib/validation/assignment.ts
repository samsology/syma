import { z } from 'zod';

export const assignmentSchema = z.object({
  title: z.string().trim().min(2, 'Assignment title must be at least 2 characters').max(150, 'Keep title under 150 characters'),
  description: z.string().trim().min(5, 'Assignment description is required'),
  instructions: z.string().trim().min(10, 'Assignment instructions are required'),
  submissionType: z.string().trim().default('FILE_OR_TEXT'),
  submissionRequirements: z.string().trim().optional().or(z.literal('')),
  datasetUrl: z.string().trim().url('Dataset URL must be a valid URL').optional().or(z.literal('')),
  datasetName: z.string().trim().optional().or(z.literal('')),
  dueDateDays: z.coerce.number().int().positive('Due date days must be positive').optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
});

export type AssignmentInput = z.infer<typeof assignmentSchema>;
