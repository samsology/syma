import { z } from 'zod';
import { CourseStatus } from '@prisma/client';
import { courseCategories, courseLevels } from '@/lib/courses/options';

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === '' || /^https?:\/\/.+/i.test(value) || value.startsWith('/'), {
    message: 'Enter a valid URL or site-relative image path.',
  });

const editableCourseFields = {
  title: z.string().trim().min(1, 'Course title is required.').max(120, 'Keep the title under 120 characters.'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required.')
    .max(160, 'Keep the slug under 160 characters.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and single hyphens only.'),
  shortDescription: z
    .string()
    .trim()
    .min(1, 'Short description is required.')
    .max(280, 'Keep the short description under 280 characters.'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(courseCategories, { message: 'Select a valid category.' }),
  level: z.enum(courseLevels, { message: 'Select a valid level.' }),
  duration: z.string().trim().min(1, 'Duration is required.').max(40, 'Keep the duration concise.'),
  thumbnailUrl: optionalUrl.optional().default(''),
  instructorId: z.string().trim().optional().nullable(),
};

export const courseSchema = z.object({
  ...editableCourseFields,
  status: z.nativeEnum(CourseStatus).optional(),
});

export type CourseInput = z.infer<typeof courseSchema>;

export const createCourseSchema = z.object(editableCourseFields);
export const updateCourseSchema = z.object(editableCourseFields);

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
