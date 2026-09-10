'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import {
  sendConsultationConfirmation,
  sendContactConfirmation,
  sendEnrollmentConfirmation,
} from '@/lib/email/email';

import { enrollmentSchema, consultationSchema, contactSchema } from '@/lib/validation';

export type FormSubmissionData = {
  id: string;
  emailSent: boolean;
};

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

export async function submitEnrollmentAction(
  rawInput: unknown
): Promise<ServerActionResult<FormSubmissionData>> {
  try {
    const validated = enrollmentSchema.parse(rawInput);

    // Validate rate limits & spam honeypot
    const check = await checkRateLimitAndSpam(validated.honeypot);
    if (check) {
      if (check.success) {
        return { success: true, data: { id: 'spam-filtered', emailSent: false } };
      }
      return { success: false, error: check.error };
    }

    const supabase = await createClient();

    const enrollmentId = crypto.randomUUID();

    const { error } = await supabase
      .from('enrollments')
      .insert({
        id: enrollmentId,
        full_name: validated.fullName,
        email: validated.email,
        phone: validated.phone,
        program: validated.program,
        experience: validated.experience,
        motivation: validated.motivation,
      });

    if (error) {
      throw new Error(error.message);
    }

    let emailSent = false;
    try {
      const emailResult = await sendEnrollmentConfirmation({
        fullName: validated.fullName,
        email: validated.email,
        program: validated.program,
      });
      emailSent = emailResult.success;
    } catch (emailErr) {
      const emailError = emailErr as Error;
      console.error('Email provider unexpected error:', emailError.message);
      emailSent = false;
    }

    return {
      success: true,
      data: {
        id: enrollmentId,
        emailSent,
      },
    };
  } catch (err) {
    const error = err as Error;
    console.error('submitEnrollmentAction error:', error);
    return { success: false, error: error.message || 'Failed to submit enrollment' };
  }
}

export async function submitConsultationAction(
  rawInput: unknown
): Promise<ServerActionResult<FormSubmissionData>> {
  try {
    const validated = consultationSchema.parse(rawInput);

    // Validate rate limits & spam honeypot
    const check = await checkRateLimitAndSpam(validated.honeypot);
    if (check) {
      if (check.success) {
        return { success: true, data: { id: 'spam-filtered', emailSent: false } };
      }
      return { success: false, error: check.error };
    }

    const supabase = await createClient();

    const consultationId = crypto.randomUUID();

    const { error } = await supabase
      .from('consultations')
      .insert({
        id: consultationId,
        full_name: validated.fullName,
        email: validated.email,
        company_name: validated.companyName,
        consultation_type: validated.consultationType,
        message: validated.message,
        preferred_date: validated.preferredDate,
      });

    if (error) {
      throw new Error(error.message);
    }

    let emailSent = false;
    try {
      const emailResult = await sendConsultationConfirmation({
        fullName: validated.fullName,
        email: validated.email,
        consultationType: validated.consultationType,
      });
      emailSent = emailResult.success;
    } catch (emailErr) {
      const emailError = emailErr as Error;
      console.error('Email provider unexpected error:', emailError.message);
      emailSent = false;
    }

    return {
      success: true,
      data: {
        id: consultationId,
        emailSent,
      },
    };
  } catch (err) {
    const error = err as Error;
    console.error('submitConsultationAction error:', error);
    return { success: false, error: error.message || 'Failed to submit consultation request' };
  }
}

export async function submitContactAction(
  rawInput: unknown
): Promise<ServerActionResult<FormSubmissionData>> {
  try {
    const validated = contactSchema.parse(rawInput);

    // Validate rate limits & spam honeypot
    const check = await checkRateLimitAndSpam(validated.honeypot);
    if (check) {
      if (check.success) {
        return { success: true, data: { id: 'spam-filtered', emailSent: false } };
      }
      return { success: false, error: check.error };
    }

    const supabase = await createClient();

    const contactMessageId = crypto.randomUUID();

    const { error } = await supabase
      .from('contact_messages')
      .insert({
        id: contactMessageId,
        name: validated.name,
        email: validated.email,
        subject: validated.subject,
        message: validated.message,
      });

    if (error) {
      throw new Error(error.message);
    }

    let emailSent = false;
    try {
      const emailResult = await sendContactConfirmation({
        name: validated.name,
        email: validated.email,
        subject: validated.subject,
      });
      emailSent = emailResult.success;
    } catch (emailErr) {
      const emailError = emailErr as Error;
      console.error('Email provider unexpected error:', emailError.message);
      emailSent = false;
    }

    return {
      success: true,
      data: {
        id: contactMessageId,
        emailSent,
      },
    };
  } catch (err) {
    const error = err as Error;
    console.error('submitContactAction error:', error);
    return { success: false, error: error.message || 'Failed to submit contact message' };
  }
}
