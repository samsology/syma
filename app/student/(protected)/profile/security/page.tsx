import { StudentPasswordForm } from '@/components/student/StudentProfileForms';

export default function StudentSecurityPage() {
  return (
    <section className="max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-black text-slate-950">Security</h1>
      <p className="mt-2 text-sm text-slate-600">Change your password. Existing student sessions are invalidated afterward.</p>
      <div className="mt-6">
        <StudentPasswordForm />
      </div>
    </section>
  );
}
