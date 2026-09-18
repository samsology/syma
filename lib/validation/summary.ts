import { z } from 'zod';

export const summaryResourceTypeSchema = z.enum(['SLIDE', 'VIDEO']);

export const summarySchema = z.object({
  title: z.string().trim().min(2, 'Summary title must be at least 2 characters').max(150, 'Keep title under 150 characters'),
  description: z.string().trim().optional().or(z.literal('')),
  content: z.string().trim().optional().or(z.literal('')),
  resourceType: summaryResourceTypeSchema.default('SLIDE'),
  resourceUrl: z.string().trim().url('Resource URL must be a valid URL').optional().or(z.literal('')),
  duration: z.coerce.number().int().positive('Duration must be positive in minutes').optional().or(z.literal('')),
});

export type SummaryInput = z.infer<typeof summarySchema>;
