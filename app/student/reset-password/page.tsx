import Link from 'next/link';
import { redirect } from 'next/navigation';
import { StudentResetPasswordForm } from '@/components/student/StudentAuthForms';
import { getCurrentStudent } from '@/lib/auth/student-session';
import { validatePasswordResetToken } from '@/lib/auth/password-reset-token';

export const metadata = {
  title: 'Reset Password | Syma Tech Solutions',
  description: 'Create a new password for your Syma Tech student account',
};

type StudentResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function StudentResetPasswordPage({ searchParams }: StudentResetPasswordPageProps) {
  const [params, student] = await Promise.all([searchParams, getCurrentStudent()]);

  if (student) {
    redirect('/student');
  }

  const rawToken = params.token?.trim();

  if (!rawToken) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm text-center">
          <h1 className="text-2xl font-black text-slate-950">Invalid Reset Link</h1>
          <p className="mt-3 text-sm text-slate-600">
            No password reset token was provided. If you requested a reset, please click the link in your email.
          </p>
          <div className="mt-6">
            <Link
              href="/student/forgot-password"
              className="inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90"
            >
              Request a new reset link
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const validation = await validatePasswordResetToken(rawToken);

  if (!validation.valid) {
    const errorDescriptions: Record<string, string> = {
      expired: 'This password reset link has expired (links are valid for 1 hour). Please request a new one.',
      used: 'This password reset link has already been used. Each link can only be used once.',
      inactive_student: 'This student account is not currently active. Please contact support.',
      invalid: 'This password reset link is invalid or has expired.',
    };

    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm text-center">
          <h1 className="text-2xl font-black text-slate-950">Reset Link Expired or Invalid</h1>
          <p className="mt-3 text-sm text-slate-600">
            {errorDescriptions[validation.reason] || 'This password reset link is invalid or has expired.'}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/student/forgot-password"
              className="inline-flex justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90"
            >
              Request a new link
            </Link>
            <Link
              href="/student/login"
              className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Back to sign in
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black text-slate-950">Create new password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Hi {validation.student.firstName}, choose a new secure password for your account.
        </p>
        <div className="mt-6">
          <StudentResetPasswordForm token={rawToken} />
        </div>
      </section>
    </main>
  );
}
