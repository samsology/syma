import { z } from 'zod';

export const lessonTypeSchema = z.enum(['TEXT', 'VIDEO', 'ASSIGNMENT']);

export const lessonSchema = z.object({
  title: z.string().trim().min(2, 'Lesson title must be at least 2 characters'),
  slug: z
    .string()
    .trim()
    .min(2, 'Lesson slug must be at least 2 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase URL slug, for example intro-to-sql'),
  lessonType: lessonTypeSchema.default('TEXT'),
  content: z.string().trim().min(1, 'Lesson content is required'),
  videoUrl: z.string().trim().url('Video URL must be valid').optional().or(z.literal('')),
  duration: z.coerce.number().int().positive('Duration must be positive').optional().or(z.literal('')),
  isPreview: z.coerce.boolean().default(false),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  sortOrder: z.number().int().positive('Sort order must be positive').optional(),
});

export type LessonInput = z.infer<typeof lessonSchema>;
