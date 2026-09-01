import { z } from 'zod';

export const enrollmentStatusSchema = z.enum(['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'SUSPENDED']);

export const createEnrollmentSchema = z.object({
  studentId: z.string().trim().min(1, 'Student is required.'),
  courseId: z.string().trim().min(1, 'Course is required.'),
  status: enrollmentStatusSchema.default('ACTIVE'),
});

export const updateEnrollmentStatusSchema = z.object({
  enrollmentId: z.string().trim().min(1, 'Enrollment is required.'),
  status: enrollmentStatusSchema,
});

export const studentEnrollSchema = z.object({
  courseId: z.string().trim().min(1, 'Course is required.'),
});
