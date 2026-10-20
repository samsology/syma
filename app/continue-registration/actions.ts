'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';
import { continueRegistrationSchema } from '@/lib/validation/student';
import {
  generateRegistrationToken,
  getContinuationUrl,
  hashRegistrationToken,
} from '@/lib/auth/registration-token';
import { createStudentSession } from '@/lib/auth/student-session';
import { sendEnrollmentConfirmation } from '@/lib/email/email';

type FieldErrors = Record<string, string[] | undefined>;

export type ContinueRegistrationActionState = {
  fieldErrors?: FieldErrors;
  formError?: string;
  success?: string;
  alreadyUsed?: boolean;
  expired?: boolean;
  existingAccount?: boolean;
  values?: Record<string, string>;
};

export async function completeStudentRegistrationAction(
  _previousState: ContinueRegistrationActionState,
  formData: FormData
): Promise<ContinueRegistrationActionState> {
  const rawValues = {
    token: String(formData.get('token') ?? ''),
    firstName: String(formData.get('firstName') ?? ''),
    lastName: String(formData.get('lastName') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    password: String(formData.get('password') ?? ''),
    confirmPassword: String(formData.get('confirmPassword') ?? ''),
    agreeTerms: formData.get('agreeTerms'),
  };

  const parsed = continueRegistrationSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: {
        firstName: rawValues.firstName,
        lastName: rawValues.lastName,
        phone: rawValues.phone,
      },
    };
  }

  const tokenHash = hashRegistrationToken(parsed.data.token);

  // Retrieve the application by its token hash
  const application = await db.studentApplication.findUnique({
    where: { registrationTokenHash: tokenHash },
  });

  if (!application) {
    return {
      formError: 'This registration link is invalid or has expired.',
      expired: true,
    };
  }

  if (application.registrationTokenUsedAt) {
    return {
      formError: 'This registration link has already been used. Please sign in to access your student portal.',
      alreadyUsed: true,
    };
  }

  if (application.registrationTokenExpiresAt && application.registrationTokenExpiresAt <= new Date()) {
    return {
      formError: 'This registration link has expired. Please request a new link to continue.',
      expired: true,
    };
  }

  // Check if an active student account already exists with this email
  const existingStudent = await db.student.findUnique({
    where: { email: application.email.toLowerCase() },
    select: { id: true, status: true },
  });

  if (existingStudent && existingStudent.status === 'ACTIVE') {
    // Link the application and mark the token as used
    await db.studentApplication.update({
      where: { id: application.id },
      data: {
        studentId: existingStudent.id,
        registrationTokenUsedAt: new Date(),
      },
    });

    return {
      formError: 'An account with this email address already exists. Please sign in with your credentials.',
      existingAccount: true,
    };
  }

  // Create student account and link application atomically
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  let newStudentId: string;
  let enrolledCourseId: string | null = null;

  try {
    const createdStudent = await db.$transaction(async (tx) => {
      // 1. Create or Activate Student account
      let student: { id: string };
      if (existingStudent) {
        student = await tx.student.update({
          where: { id: existingStudent.id },
          data: {
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            phone: parsed.data.phone || application.phone || null,
            passwordHash,
            status: 'ACTIVE',
          },
          select: { id: true },
        });
      } else {
        student = await tx.student.create({
          data: {
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            email: application.email.toLowerCase(),
            phone: parsed.data.phone || application.phone || null,
            passwordHash,
            status: 'ACTIVE',
          },
          select: { id: true },
        });
      }

      // 2. Mark StudentApplication as used and link to student
      await tx.studentApplication.update({
        where: { id: application.id },
        data: {
          studentId: student.id,
          registrationTokenUsedAt: new Date(),
          status: 'REGISTERED',
        },
      });

      // 3. Check for matching course by ID, slug, or title
      const course = await tx.course.findFirst({
        where: {
          OR: [
            { id: application.program },
            { slug: application.program },
            { title: { equals: application.program, mode: 'insensitive' } },
          ],
          status: 'PUBLISHED',
        },
        select: { id: true },
      });

      if (course) {
        enrolledCourseId = course.id;
        const existingEnrollment = await tx.enrollment.findUnique({
          where: {
            studentId_courseId: {
              studentId: student.id,
              courseId: course.id,
            },
          },
        });

        if (!existingEnrollment) {
          await tx.enrollment.create({
            data: {
              studentId: student.id,
              courseId: course.id,
              status: 'PENDING',
            },
          });
        }
      }

      return student;
    });

    newStudentId = createdStudent.id;
  } catch (error) {
    console.error('Failed to complete student onboarding transaction:', error);
    return {
      formError: 'An unexpected error occurred while creating your account. Please try again.',
      values: {
        firstName: rawValues.firstName,
        lastName: rawValues.lastName,
        phone: rawValues.phone,
      },
    };
  }

  // Automatically authenticate new student and establish session
  await createStudentSession(newStudentId);

  // If a course is associated, redirect straight to course enrollment & payment
  if (enrolledCourseId) {
    redirect(`/student/enroll?courseId=${enrolledCourseId}`);
  }

  // Otherwise redirect to courses catalog
  redirect('/programs');
}

const resendSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.'),
});

export type ResendTokenActionState = {
  formError?: string;
  success?: string;
};

export async function resendRegistrationTokenAction(
  _previousState: ResendTokenActionState,
  formData: FormData
): Promise<ResendTokenActionState> {
  const rawEmail = String(formData.get('email') ?? '');
  const parsed = resendSchema.safeParse({ email: rawEmail });

  if (!parsed.success) {
    return {
      formError: parsed.error.flatten().fieldErrors.email?.[0] || 'Please enter a valid email address.',
    };
  }

  const email = parsed.data.email;

  try {
    // Find the latest pending application for this email that hasn't completed registration
    const application = await db.studentApplication.findFirst({
      where: {
        email,
        registrationTokenUsedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (application) {
      const { rawToken, tokenHash, expiresAt } = generateRegistrationToken();

      await db.studentApplication.update({
        where: { id: application.id },
        data: {
          registrationTokenHash: tokenHash,
          registrationTokenExpiresAt: expiresAt,
        },
      });

      const continuationUrl = getContinuationUrl(rawToken);

      await sendEnrollmentConfirmation({
        fullName: application.fullName,
        email: application.email,
        program: application.program,
        continuationUrl,
      });
    }

    // Always return a neutral success message to prevent email enumeration
    return {
      success: 'If an active application was found for that email address, a new continuation link has been sent to your inbox.',
    };
  } catch (error) {
    console.error('Error during resendRegistrationTokenAction:', error);
    return {
      formError: 'Failed to process your request at this time. Please try again later.',
    };
  }
}
