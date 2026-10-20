'use server';

import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import {
  changeStudentPasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  studentLoginSchema,
  studentRegisterSchema,
  updateStudentProfileSchema,
} from '@/lib/validation/student';
import { studentEnrollSchema } from '@/lib/validation/enrollment';
import { createStudentSession, destroyStudentSession } from '@/lib/auth/student-session';
import { PUBLIC_STUDENT_ROUTES } from '@/lib/auth/constants';
import { requireStudent } from '@/lib/auth/student-authorization';
import { createOrReuseOrder } from '@/lib/payments/service';
import {
  clearStudentLoginAttempts,
  isStudentLoginRateLimited,
  recordStudentLoginAttempt,
} from '@/lib/auth/rate-limit';
import {
  generatePasswordResetToken,
  getPasswordResetUrl,
  validatePasswordResetToken,
} from '@/lib/auth/password-reset-token';
import { sendPasswordResetEmail } from '@/lib/email/email';
import { isPaystackCurrencyEnabled } from '@/lib/payments/currency';

type FieldErrors = Record<string, string[] | undefined>;

export type StudentActionState = {
  fieldErrors?: FieldErrors;
  formError?: string;
  success?: string;
  values?: Record<string, string>;
};

const genericAuthError = 'Invalid email or password.';

async function rateLimitKey(email: string) {
  const headerStore = await headers();
  const forwardedFor = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = headerStore.get('x-real-ip')?.trim();
  const ip = forwardedFor || realIp || 'unknown';
  return `${email.toLowerCase()}:${ip}`;
}

export async function registerStudentAction(
  _previousState: StudentActionState,
  formData: FormData
): Promise<StudentActionState> {
  const courseIdRaw = formData.get('courseId');
  const courseId = typeof courseIdRaw === 'string' && courseIdRaw.trim() ? courseIdRaw.trim() : undefined;
  const phoneRaw = formData.get('phone');
  const phone = typeof phoneRaw === 'string' && phoneRaw.trim() ? phoneRaw.trim() : undefined;

  const parsed = studentRegisterSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    phone,
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    courseId,
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const recognizedKeys = new Set(['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword']);
    const unhandledErrors = Object.entries(fieldErrors)
      .filter(([key]) => !recognizedKeys.has(key))
      .flatMap(([, errors]) => errors || []);

    return {
      fieldErrors,
      formError: unhandledErrors.length > 0 ? unhandledErrors[0] : undefined,
      values: Object.fromEntries(['firstName', 'lastName', 'email', 'phone'].map((key) => [key, String(formData.get(key) ?? '')])),
    };
  }

  const registrationKey = `register:${await rateLimitKey(parsed.data.email)}`;
  if (await isStudentLoginRateLimited(registrationKey)) {
    return { formError: 'Too many registration attempts. Please try again later.', values: { firstName: parsed.data.firstName, lastName: parsed.data.lastName, email: parsed.data.email, phone: parsed.data.phone ?? '' } };
  }
  await recordStudentLoginAttempt(registrationKey);

  let selectedCourse: { id: string; title: string; slug: string; status: string; isFree: boolean; priceMinor: number; currency: any } | null = null;
  if (parsed.data.courseId) {
    selectedCourse = await db.course.findFirst({
      where: {
        OR: [{ id: parsed.data.courseId }, { slug: parsed.data.courseId }],
        status: 'PUBLISHED',
      },
      select: { id: true, title: true, slug: true, status: true, isFree: true, priceMinor: true, currency: true },
    });
    if (!selectedCourse || (!selectedCourse.isFree && (selectedCourse.priceMinor <= 0 || !isPaystackCurrencyEnabled(selectedCourse.currency)))) {
      return { formError: 'That course is unavailable. Your details have not been submitted.', values: { firstName: parsed.data.firstName, lastName: parsed.data.lastName, email: parsed.data.email, phone: parsed.data.phone ?? '' } };
    }
  }

  const existingStudent = await db.student.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, status: true },
  });

  if (existingStudent && existingStudent.status === 'ACTIVE') {
    return {
      formError: 'An account with this email already exists. Please sign in.',
      values: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        phone: parsed.data.phone ?? '',
      },
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const { generateRegistrationToken, getContinuationUrl } = await import('@/lib/auth/registration-token');
  const { rawToken, tokenHash, expiresAt } = generateRegistrationToken();
  const continuationUrl = getContinuationUrl(rawToken);

  let studentId: string;
  try {
    if (existingStudent) {
      const updated = await db.student.update({
        where: { id: existingStudent.id },
        data: {
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          phone: parsed.data.phone || null,
          passwordHash,
          status: 'INACTIVE',
        },
        select: { id: true },
      });
      studentId = updated.id;
    } else {
      const created = await db.student.create({
        data: {
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          email: parsed.data.email,
          phone: parsed.data.phone || null,
          passwordHash,
          status: 'INACTIVE',
        },
        select: { id: true },
      });
      studentId = created.id;
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { formError: 'An account with this email already exists.', values: { firstName: parsed.data.firstName, lastName: parsed.data.lastName, email: parsed.data.email, phone: parsed.data.phone ?? '' } };
    }
    throw error;
  }

  // Record/update StudentApplication with continuation token
  const programValue = selectedCourse ? selectedCourse.id : 'General Enrollment';
  try {
    const existingApp = await db.studentApplication.findFirst({
      where: {
        OR: [
          { email: parsed.data.email },
          ...(studentId ? [{ studentId }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    if (existingApp) {
      await db.studentApplication.update({
        where: { id: existingApp.id },
        data: {
          fullName: `${parsed.data.firstName} ${parsed.data.lastName}`.trim(),
          phone: parsed.data.phone || '',
          program: programValue,
          registrationTokenHash: tokenHash,
          registrationTokenExpiresAt: expiresAt,
          registrationTokenUsedAt: null,
          status: 'PENDING',
          studentId,
        },
      });
    } else {
      await db.studentApplication.create({
        data: {
          fullName: `${parsed.data.firstName} ${parsed.data.lastName}`.trim(),
          email: parsed.data.email,
          phone: parsed.data.phone || '',
          program: programValue,
          experience: 'Portal Account Creation',
          motivation: 'Student Registration',
          registrationTokenHash: tokenHash,
          registrationTokenExpiresAt: expiresAt,
          status: 'PENDING',
          studentId,
        },
      });
    }
  } catch (appErr) {
    console.error('Failed to save StudentApplication for registration:', appErr);
  }

  await clearStudentLoginAttempts(registrationKey);

  // Send registration confirmation email with continuation link
  try {
    const { sendEnrollmentConfirmation } = await import('@/lib/email/email');
    await sendEnrollmentConfirmation({
      fullName: `${parsed.data.firstName} ${parsed.data.lastName}`.trim(),
      email: parsed.data.email,
      program: selectedCourse ? selectedCourse.title : 'Syma Tech Solutions',
      continuationUrl,
    });
  } catch (emailErr) {
    console.error('Failed to send registration confirmation email:', emailErr);
  }

  return {
    success: `We have sent a verification link to ${parsed.data.email}. Please check your inbox and click the link to continue your registration.`,
    values: { email: parsed.data.email },
  };
}

export async function loginStudentAction(
  _previousState: StudentActionState,
  formData: FormData
): Promise<StudentActionState> {
  const emailRaw = formData.get('email');
  const passwordRaw = formData.get('password');
  const courseIdRaw = formData.get('courseId');

  const parsed = studentLoginSchema.safeParse({
    email: typeof emailRaw === 'string' ? emailRaw.trim() : emailRaw,
    password: passwordRaw,
    courseId: typeof courseIdRaw === 'string' && courseIdRaw.trim() ? courseIdRaw.trim() : undefined,
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const unhandledErrors = Object.entries(fieldErrors)
      .filter(([key]) => key !== 'email' && key !== 'password')
      .flatMap(([, errors]) => errors || []);

    return {
      fieldErrors,
      formError: unhandledErrors.length > 0 ? unhandledErrors[0] : undefined,
      values: { email: String(formData.get('email') ?? '') },
    };
  }

  const key = await rateLimitKey(parsed.data.email);

  if (await isStudentLoginRateLimited(key)) {
    return {
      formError: 'Too many sign-in attempts. Please try again later.',
      values: { email: parsed.data.email },
    };
  }

  const student = await db.student.findUnique({
    where: { email: parsed.data.email },
  });
  const passwordMatches = student ? await bcrypt.compare(parsed.data.password, student.passwordHash) : false;

  if (!student || student.status !== 'ACTIVE' || !passwordMatches) {
    await recordStudentLoginAttempt(key);
    return {
      formError: genericAuthError,
      values: { email: parsed.data.email },
    };
  }

  await Promise.all([
    clearStudentLoginAttempts(key),
    db.student.update({ where: { id: student.id }, data: { lastLoginAt: new Date() } }),
  ]);
  await createStudentSession(student.id);

  if (parsed.data.courseId) {
    const result = await createOrReuseOrder(student.id, parsed.data.courseId);
    if ('alreadyEnrolled' in result || 'freeEnrollment' in result) redirect(`/student/courses/${parsed.data.courseId}`);
    if (result.order) redirect(`/checkout/${result.order.orderNumber}`);
  }

  const nextParam = formData.get('next')?.toString().trim();
  const isPublicRoute = nextParam && PUBLIC_STUDENT_ROUTES.some((route) => nextParam === route || nextParam.startsWith(`${route}/`));
  if (nextParam && nextParam.startsWith('/student') && !nextParam.startsWith('//') && !isPublicRoute) {
    redirect(nextParam);
  }

  redirect('/student');
}

export async function logoutStudentAction() {
  await destroyStudentSession();
  redirect('/student/login');
}

export async function requestPasswordResetAction(
  _previousState: StudentActionState,
  formData: FormData
): Promise<StudentActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: { email: String(formData.get('email') ?? '') },
    };
  }

  const key = `reset:${await rateLimitKey(parsed.data.email)}`;
  if (await isStudentLoginRateLimited(key)) {
    return {
      formError: 'Too many requests. Please try again in a few minutes.',
      values: { email: parsed.data.email },
    };
  }

  await recordStudentLoginAttempt(key);

  const genericSuccess = 'If an account exists for this email address, you will receive a password reset link.';

  const student = await db.student.findUnique({
    where: { email: parsed.data.email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
    },
  });

  if (!student || student.status !== 'ACTIVE') {
    return {
      success: genericSuccess,
    };
  }

  // Invalidate any existing unused reset tokens for this student
  await db.studentPasswordResetToken.deleteMany({
    where: {
      studentId: student.id,
      usedAt: null,
    },
  });

  const { rawToken, tokenHash, expiresAt } = generatePasswordResetToken();

  await db.studentPasswordResetToken.create({
    data: {
      studentId: student.id,
      tokenHash,
      expiresAt,
    },
  });

  const resetUrl = getPasswordResetUrl(rawToken);

  await sendPasswordResetEmail({
    fullName: `${student.firstName} ${student.lastName}`.trim(),
    email: student.email,
    resetUrl,
  });

  return {
    success: genericSuccess,
  };
}

export async function resetStudentPasswordAction(
  _previousState: StudentActionState,
  formData: FormData
): Promise<StudentActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const validation = await validatePasswordResetToken(parsed.data.token);

  if (!validation.valid) {
    const errorMessages: Record<string, string> = {
      expired: 'This password reset link has expired. Please request a new one.',
      used: 'This password reset link has already been used. Please request a new one.',
      inactive_student: 'This account is not active. Please contact support.',
      invalid: 'Invalid or expired password reset link.',
    };
    return {
      formError: errorMessages[validation.reason] || 'Invalid or expired password reset link.',
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await db.student.update({
    where: { id: validation.student.id },
    data: { passwordHash },
  });

  await db.studentPasswordResetToken.update({
    where: { id: validation.tokenRecord.id },
    data: { usedAt: new Date() },
  });

  // Invalidate all existing student sessions
  await db.studentSession.deleteMany({
    where: { studentId: validation.student.id },
  });

  await destroyStudentSession();
  redirect('/student/login?passwordReset=1');
}

export async function updateStudentProfileAction(
  _previousState: StudentActionState,
  formData: FormData
): Promise<StudentActionState> {
  const student = await requireStudent();
  const parsed = updateStudentProfileSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    phone: formData.get('phone'),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await db.student.update({
    where: { id: student.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone || null,
    },
  });

  revalidatePath('/student/profile');
  return { success: 'Profile updated successfully.' };
}

export async function changeStudentPasswordAction(
  _previousState: StudentActionState,
  formData: FormData
): Promise<StudentActionState> {
  const student = await requireStudent();
  const parsed = changeStudentPasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const record = await db.student.findUnique({
    where: { id: student.id },
    select: { passwordHash: true },
  });
  const matches = record ? await bcrypt.compare(parsed.data.currentPassword, record.passwordHash) : false;

  if (!matches) {
    return { formError: 'Current password is incorrect.' };
  }

  await db.student.update({
    where: { id: student.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12) },
  });
  await db.studentSession.deleteMany({ where: { studentId: student.id } });
  await destroyStudentSession();
  redirect('/student/login?passwordChanged=1');
}

export async function enrollCurrentStudentAction(formData: FormData) {
  const student = await requireStudent();
  const rawCourseId = String(formData.get('courseId') ?? '').trim();

  if (!rawCourseId) {
    redirect('/programs');
  }

  const course = await db.course.findFirst({
    where: {
      OR: [{ id: rawCourseId }, { slug: rawCourseId }],
      status: 'PUBLISHED',
    },
    select: { id: true, isFree: true, priceMinor: true },
  });

  if (!course) {
    redirect('/programs');
  }

  const result = await createOrReuseOrder(student.id, course.id);
  if ('alreadyEnrolled' in result || 'freeEnrollment' in result) {
    redirect(`/student/courses/${course.id}`);
  }

  if (result.order) {
    const { initializeOrderPayment } = await import('@/lib/payments/service');
    const paymentInit = await initializeOrderPayment(student.id, result.order.orderNumber);
    if (paymentInit.redirectUrl) {
      redirect(paymentInit.redirectUrl);
    }
    redirect(
      `/checkout/${result.order.orderNumber}?error=${encodeURIComponent(paymentInit.error || 'provider')}`
    );
  }

  redirect('/programs');
}
