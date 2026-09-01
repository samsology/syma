import { z } from 'zod';

export const weekSchema = z.object({
  weekNumber: z.coerce.number().int().min(1, 'Week number must be at least 1'),
  title: z.string().trim().min(1, 'Week title is required.').max(120, 'Keep the week title under 120 characters.'),
  description: z.string().trim().optional().default(''),
  sortOrder: z.number().int().min(0).optional(),
});

export type WeekInput = z.infer<typeof weekSchema>;
