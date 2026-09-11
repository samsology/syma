import Link from 'next/link';
import { db } from '@/lib/db';
import { hashRegistrationToken } from '@/lib/auth/registration-token';
import { ContinueRegistrationForm } from '@/components/student/ContinueRegistrationForm';

type PageProps = {
  params: Promise<{ token: string }>;
};

export const metadata = {
  title: 'Complete Student Registration | Syma Tech Solutions',
  description: 'Complete your registration and activate your student account to access the learning portal.',
};

export default async function ContinueRegistrationPage({ params }: PageProps) {
  const { token } = await params;

  if (!token || typeof token !== 'string') {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16 flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Invalid Registration Link</h1>
          <p className="mt-2 text-sm text-slate-600">
            This registration link is invalid or incomplete. Please check the link in your email or request a new one.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/student/registration/resend"
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90"
            >
              Request New Link
            </Link>
            <Link
              href="/contact"
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Need help? Contact Support
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const tokenHash = hashRegistrationToken(token);

  const application = await db.studentApplication.findUnique({
    where: { registrationTokenHash: tokenHash },
  });

  // 1. Invalid / Not Found
  if (!application) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16 flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Registration Link Not Found</h1>
          <p className="mt-2 text-sm text-slate-600">
            We couldn&apos;t find an active application associated with this link. It may have already been used or expired.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/student/registration/resend"
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90"
            >
              Request New Registration Link
            </Link>
            <Link
              href="/student/login"
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 2. Already Used
  if (application.registrationTokenUsedAt) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16 flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Registration Already Completed</h1>
          <p className="mt-2 text-sm text-slate-600">
            You have already activated your student account for <strong>{application.program}</strong>. Please sign in with your email and password to access your dashboard.
          </p>
          <div className="mt-6">
            <Link
              href="/student/login"
              className="inline-flex w-full items-center justify-center rounded-xl bg-primary py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90"
            >
              Sign In to Student Portal &rarr;
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 3. Expired
  if (application.registrationTokenExpiresAt && application.registrationTokenExpiresAt <= new Date()) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16 flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Registration Link Expired</h1>
          <p className="mt-2 text-sm text-slate-600">
            For your security, registration links expire after 48 hours. You can easily request a fresh link using the email from your application.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/student/registration/resend"
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90"
            >
              Request New Registration Link
            </Link>
            <Link
              href="/contact"
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Need assistance? Contact support
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 4. Valid Token: Render Onboarding Form
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              Step 2: Account Onboarding
            </span>
            <h1 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
              Complete Your Registration
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Welcome, <strong className="text-slate-800">{application.fullName}</strong>! Choose your password to finalize your student account and access your learning dashboard.
            </p>
          </div>

          <ContinueRegistrationForm
            token={token}
            initialData={{
              fullName: application.fullName,
              email: application.email,
              phone: application.phone,
              program: application.program,
            }}
          />
        </div>
      </div>
    </main>
  );
}
