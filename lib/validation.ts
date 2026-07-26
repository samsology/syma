import { z } from 'zod';

export const enrollmentSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number (at least 10 digits)'),
  program: z.string().min(1, 'Please select a program'),
  experience: z.string().min(1, 'Please select your experience level'),
  motivation: z.string().min(15, 'Motivation statement must be at least 15 characters'),
  honeypot: z.string().optional(),
});

export const consultationSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  companyName: z.string().min(2, 'Organization Name must be at least 2 characters'),
  consultationType: z.string().min(1, 'Please select a consultation type'),
  message: z.string().min(15, 'Message must be at least 15 characters'),
  preferredDate: z.string().min(1, 'Please select a preferred date'),
  honeypot: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  honeypot: z.string().optional(),
});
