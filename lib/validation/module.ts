import { z } from 'zod';

export const moduleSchema = z.object({
  title: z.string().trim().min(1, 'Module title is required.').max(120, 'Keep the module title under 120 characters.'),
  description: z.string().trim().optional().default(''),
  sortOrder: z.number().int().min(0).optional(),
});

export type ModuleInput = z.infer<typeof moduleSchema>;
