import { z } from 'zod';

export const reorderItemSchema = z.object({
  id: z.string().min(1),
  sortOrder: z.coerce.number().int().min(1),
});

export const reorderSchema = z.object({
  direction: z.enum(['up', 'down']),
});

export type ReorderInput = z.infer<typeof reorderSchema>;
