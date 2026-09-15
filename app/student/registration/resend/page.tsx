import { ResendRegistrationForm } from '@/components/student/ResendRegistrationForm';

export const metadata = {
  title: 'Request Registration Link | Syma Tech Solutions',
  description: 'Request a fresh registration continuation link for your Syma Tech application.',
};

export default function ResendRegistrationPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black text-slate-900">
              Resend Registration Link
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Expired or lost your continuation link? Enter your application email to receive a new one.
            </p>
          </div>

          <ResendRegistrationForm />
        </div>
      </div>
    </main>
  );
}
