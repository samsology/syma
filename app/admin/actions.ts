'use server';

import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { adminLoginSchema } from '@/lib/validation/login';
import { createAdminSession, destroyAdminSession } from '@/lib/auth/session';
import { clearLoginAttempts, isLoginRateLimited, recordLoginAttempt } from '@/lib/auth/rate-limit';

export type AdminLoginState = {
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
  formError?: string;
  values?: {
    email?: string;
  };
};

const genericAuthError = 'Invalid email or password.';

async function loginRateLimitKey(email: string) {
  const headerStore = await headers();
  const forwardedFor = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = headerStore.get('x-real-ip')?.trim();
  const ip = forwardedFor || realIp || 'unknown';
  return `${email.toLowerCase()}:${ip}`;
}

export async function loginAdminAction(_previousState: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: {
        email: String(formData.get('email') ?? ''),
      },
    };
  }

  const { email, password } = parsed.data;
  const rateLimitKey = await loginRateLimitKey(email);

  if (await isLoginRateLimited(rateLimitKey)) {
    return {
      formError: 'Too many sign-in attempts. Please try again later.',
      values: { email },
    };
  }

  const admin = await db.admin.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });

  const isValidPassword = admin ? await bcrypt.compare(password, admin.passwordHash) : false;

  if (!admin || !admin.isActive || !isValidPassword) {
    await recordLoginAttempt(rateLimitKey);
    return {
      formError: genericAuthError,
      values: { email },
    };
  }

  await Promise.all([
    clearLoginAttempts(rateLimitKey),
    db.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    }),
  ]);

  await createAdminSession(admin.id);
  redirect('/admin/dashboard');
}

export async function logoutAdminAction() {
  await destroyAdminSession();
  redirect('/admin/login');
}
