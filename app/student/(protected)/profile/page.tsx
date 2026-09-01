import { StudentProfileForm } from '@/components/student/StudentProfileForms';
import { requireStudent } from '@/lib/auth/student-authorization';

export default async function StudentProfilePage() {
  const student = await requireStudent();

  return (
    <section className="max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-black text-slate-950">Profile</h1>
      <p className="mt-2 text-sm text-slate-600">Keep your learner profile up to date.</p>
      <div className="mt-6">
        <StudentProfileForm student={student} />
      </div>
    </section>
  );
}
