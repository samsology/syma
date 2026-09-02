import { redirect } from 'next/navigation';
import { StudentLoginForm } from '@/components/student/StudentAuthForms';
import { getCurrentStudent } from '@/lib/auth/student-session';

type StudentLoginPageProps = {
  searchParams: Promise<{ courseId?: string; passwordChanged?: string }>;
};

export default async function StudentLoginPage({ searchParams }: StudentLoginPageProps) {
  const [params, student] = await Promise.all([searchParams, getCurrentStudent()]);

  if (student) redirect(params.courseId ? `/student/enroll?courseId=${params.courseId}` : '/student');

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black text-slate-950">Student sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Access your enrolled Syma Tech courses.</p>
        <div className="mt-6">
          <StudentLoginForm courseId={params.courseId} passwordChanged={params.passwordChanged === '1'} />
        </div>
      </section>
    </main>
  );
}
