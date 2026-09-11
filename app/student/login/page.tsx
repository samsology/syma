import { redirect } from 'next/navigation';
import { StudentLoginForm } from '@/components/student/StudentAuthForms';
import { getCurrentStudent } from '@/lib/auth/student-session';
import { PUBLIC_STUDENT_ROUTES } from '@/lib/auth/constants';

type StudentLoginPageProps = {
  searchParams: Promise<{ courseId?: string; passwordChanged?: string; passwordReset?: string; next?: string }>;
};

export default async function StudentLoginPage({ searchParams }: StudentLoginPageProps) {
  const [params, student] = await Promise.all([searchParams, getCurrentStudent()]);

  if (student) {
    const isPublicRoute =
      params.next &&
      PUBLIC_STUDENT_ROUTES.some((route) => params.next === route || params.next?.startsWith(`${route}/`));

    if (params.next && params.next.startsWith('/student') && !params.next.startsWith('//') && !isPublicRoute) {
      redirect(params.next);
    }
    redirect(params.courseId ? `/student/enroll?courseId=${params.courseId}` : '/student');
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <section className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-black text-slate-950">Student sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Access your enrolled Syma Tech courses.</p>
        <div className="mt-6">
          <StudentLoginForm
            courseId={params.courseId}
            passwordChanged={params.passwordChanged === '1'}
            passwordReset={params.passwordReset === '1'}
            next={params.next}
          />
        </div>
      </section>
    </main>
  );
}
