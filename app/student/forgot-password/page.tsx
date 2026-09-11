import { redirect } from 'next/navigation';
import { StudentForgotPasswordForm } from '@/components/student/StudentAuthForms';
import { getCurrentStudent } from '@/lib/auth/student-session';

export const metadata = {
  title: 'Forgot Password | Syma Tech Solutions',
  description: 'Reset your Syma Tech student account password',
};

export default async function StudentForgotPasswordPage() {
  const student = await getCurrentStudent();
  if (student) {
    redirect('/student');
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black text-slate-950">Forgot password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your registered email address and we will send you a link to reset your password.
        </p>
        <div className="mt-6">
          <StudentForgotPasswordForm />
        </div>
      </section>
    </main>
  );
}
