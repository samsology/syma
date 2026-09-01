import { redirect } from 'next/navigation';
import { StudentRegisterForm } from '@/components/student/StudentAuthForms';
import { getCurrentStudent } from '@/lib/auth/student-session';

type StudentRegisterPageProps = {
  searchParams: Promise<{ courseId?: string }>;
};

export default async function StudentRegisterPage({ searchParams }: StudentRegisterPageProps) {
  const [params, student] = await Promise.all([searchParams, getCurrentStudent()]);

  if (student) redirect(params.courseId ? `/student/courses/${params.courseId}` : '/student');

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <section className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black text-slate-950">Create student account</h1>
        <p className="mt-2 text-sm text-slate-600">Join Syma Tech and start learning from your enrolled courses.</p>
        <div className="mt-6">
          <StudentRegisterForm courseId={params.courseId} />
        </div>
      </section>
    </main>
  );
}
