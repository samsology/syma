'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import {
  sendConsultationConfirmation,
  sendContactConfirmation,
  sendEnrollmentConfirmation,
} from '@/lib/email/email';

// Validation Schemas
const enrollmentSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number (at least 10 digits)'),
  program: z.string().min(1, 'Please select a program'),
  experience: z.string().min(1, 'Please select your experience level'),
  motivation: z.string().min(15, 'Motivation statement must be at least 15 characters'),
  honeypot: z.string().optional(),
});

const consultationSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  consultationType: z.string().min(1, 'Please select a consultation type'),
  message: z.string().min(15, 'Message must be at least 15 characters'),
  preferredDate: z.string().min(1, 'Please select a preferred date'),
  honeypot: z.string().optional(),
});

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  honeypot: z.string().optional(),
});

export type ServerActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function checkRateLimitAndSpam(honeypot?: string): Promise<ServerActionResult<null> | null> {
  // 1. Honeypot Spam detection
  if (honeypot && honeypot.trim() !== '') {
    console.warn('Spam submission detected via honeypot field:', honeypot);
    // Return dummy success so the spammer/bot doesn't realize it failed
    return { success: true, data: null };
  }

  // 2. Cookie-based Rate Limiting (30-second throttle)
  try {
    const cookieStore = await cookies();
    const lastSubmission = cookieStore.get('last_submission_time')?.value;

    if (lastSubmission) {
      const diff = Date.now() - parseInt(lastSubmission, 10);
      const limitMs = 30000;
      if (diff < limitMs) {
        const remainingSeconds = Math.ceil((limitMs - diff) / 1000);
        return {
          success: false,
          error: `Too many submissions. Please wait ${remainingSeconds}s before trying again.`,
        };
      }
    }

    // Write throttle cookie
    cookieStore.set('last_submission_time', Date.now().toString(), {
      maxAge: 30, // 30 seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  } catch (err) {
    console.error('Anti-spam cookie error:', err);
  }

  return null;
}

async function sendBestEffortEmail(sendEmail: () => Promise<unknown>) {
  try {
    await sendEmail();
  } catch (err) {
    console.error('Confirmation email error:', err);
  }
}

export async function submitEnrollmentAction(
  rawInput: unknown
): Promise<ServerActionResult<{ id: string }>> {
  try {
    const validated = enrollmentSchema.parse(rawInput);

    // Validate rate limits & spam honeypot
    const check = await checkRateLimitAndSpam(validated.honeypot);
    if (check) {
      if (check.success) {
        return { success: true, data: { id: 'spam-filtered' } };
      }
      return { success: false, error: check.error };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        full_name: validated.fullName,
        email: validated.email,
        phone: validated.phone,
        program: validated.program,
        experience: validated.experience,
        motivation: validated.motivation,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Failed to retrieve inserted enrollment ID');
    }

    await sendBestEffortEmail(() =>
      sendEnrollmentConfirmation({
        fullName: validated.fullName,
        email: validated.email,
        program: validated.program,
      })
    );

    return { success: true, data: { id: data.id } };
  } catch (err) {
    const error = err as Error;
    console.error('submitEnrollmentAction error:', error);
    return { success: false, error: error.message || 'Failed to submit enrollment' };
  }
}

export async function submitConsultationAction(
  rawInput: unknown
): Promise<ServerActionResult<{ id: string }>> {
  try {
    const validated = consultationSchema.parse(rawInput);

    // Validate rate limits & spam honeypot
    const check = await checkRateLimitAndSpam(validated.honeypot);
    if (check) {
      if (check.success) {
        return { success: true, data: { id: 'spam-filtered' } };
      }
      return { success: false, error: check.error };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('consultations')
      .insert({
        full_name: validated.fullName,
        email: validated.email,
        company_name: validated.companyName,
        consultation_type: validated.consultationType,
        message: validated.message,
        preferred_date: validated.preferredDate,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Failed to retrieve inserted consultation ID');
    }

    await sendBestEffortEmail(() =>
      sendConsultationConfirmation({
        fullName: validated.fullName,
        email: validated.email,
        consultationType: validated.consultationType,
      })
    );

    return { success: true, data: { id: data.id } };
  } catch (err) {
    const error = err as Error;
    console.error('submitConsultationAction error:', error);
    return { success: false, error: error.message || 'Failed to submit consultation request' };
  }
}

export async function submitContactAction(
  rawInput: unknown
): Promise<ServerActionResult<{ id: string }>> {
  try {
    const validated = contactSchema.parse(rawInput);

    // Validate rate limits & spam honeypot
    const check = await checkRateLimitAndSpam(validated.honeypot);
    if (check) {
      if (check.success) {
        return { success: true, data: { id: 'spam-filtered' } };
      }
      return { success: false, error: check.error };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name: validated.name,
        email: validated.email,
        subject: validated.subject,
        message: validated.message,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Failed to retrieve inserted contact message ID');
    }

    await sendBestEffortEmail(() =>
      sendContactConfirmation({
        name: validated.name,
        email: validated.email,
        subject: validated.subject,
      })
    );

    return { success: true, data: { id: data.id } };
  } catch (err) {
    const error = err as Error;
    console.error('submitContactAction error:', error);
    return { success: false, error: error.message || 'Failed to submit contact message' };
  }
}
