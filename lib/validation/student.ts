import { z } from 'zod';

const nameSchema = z.string().trim().min(1, 'Required.').max(80, 'Must be 80 characters or fewer.');
const phoneSchema = z.string().trim().max(40, 'Must be 40 characters or fewer.').optional().or(z.literal(''));
const passwordSchema = z.string().min(12, 'Password must be at least 12 characters.');

export const studentStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']);

export const studentRegisterSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    courseId: z.string().trim().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export const studentLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Required.'),
  courseId: z.string().trim().optional(),
});

export const updateStudentProfileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
});

export const changeStudentPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required.'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export const adminUpdateStudentStatusSchema = z.object({
  studentId: z.string().trim().min(1, 'Student is required.'),
  status: studentStatusSchema,
});
