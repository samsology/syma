'use server';

import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import {
  changeStudentPasswordSchema,
  studentLoginSchema,
  studentRegisterSchema,
  updateStudentProfileSchema,
} from '@/lib/validation/student';
import { studentEnrollSchema } from '@/lib/validation/enrollment';
import { createStudentSession, destroyStudentSession } from '@/lib/auth/student-session';
import { requireStudent } from '@/lib/auth/student-authorization';
import { createOrReuseOrder } from '@/lib/payments/service';
import {
  clearStudentLoginAttempts,
  isStudentLoginRateLimited,
  recordStudentLoginAttempt,
} from '@/lib/auth/rate-limit';

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
  const parsed = studentRegisterSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    courseId: formData.get('courseId'),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: Object.fromEntries(['firstName', 'lastName', 'email', 'phone'].map((key) => [key, String(formData.get(key) ?? '')])),
    };
  }

  const existingStudent = await db.student.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existingStudent) {
    return {
      formError: 'An account with this email already exists.',
      values: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        phone: parsed.data.phone ?? '',
      },
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const student = await db.student.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      passwordHash,
    },
  });

  await createStudentSession(student.id);

  if (parsed.data.courseId) {
    const result = await createOrReuseOrder(student.id, parsed.data.courseId);
    if ('alreadyEnrolled' in result || 'freeEnrollment' in result) redirect(`/student/courses/${parsed.data.courseId}`);
    if (result.order) redirect(`/checkout/${result.order.orderNumber}`);
  }

  redirect('/student');
}

export async function loginStudentAction(
  _previousState: StudentActionState,
  formData: FormData
): Promise<StudentActionState> {
  const parsed = studentLoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    courseId: formData.get('courseId'),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
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

  redirect('/student');
}

export async function logoutStudentAction() {
  await destroyStudentSession();
  redirect('/student/login');
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
  const parsed = studentEnrollSchema.safeParse({ courseId: formData.get('courseId') });

  if (!parsed.success) {
    redirect('/programs');
  }

  const result = await createOrReuseOrder(student.id, parsed.data.courseId);
  if ('alreadyEnrolled' in result) redirect(`/student/courses/${parsed.data.courseId}`);
  if ('freeEnrollment' in result) redirect(`/student/courses/${parsed.data.courseId}`);
  if (result.order) redirect(`/checkout/${result.order.orderNumber}`);
  redirect('/programs');
}
