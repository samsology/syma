import Link from 'next/link';
import { requireEnrollment, requireStudent } from '@/lib/auth/student-authorization';

type StudentCoursePageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function StudentCoursePage({ params }: StudentCoursePageProps) {
  const [{ courseId }, student] = await Promise.all([params, requireStudent()]);
  const enrollment = await requireEnrollment(student.id, courseId);
  const course = enrollment.course;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-bold uppercase tracking-wide text-primary">{course.category} · {course.level}</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{course.title}</h1>
        <p className="mt-3 max-w-3xl text-slate-600">{course.description}</p>
      </header>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">Curriculum</h2>
        <div className="mt-5 space-y-6">
          {course.weeks.map((week) => (
            <div key={week.id} className="border-t border-slate-100 pt-5 first:border-t-0 first:pt-0">
              <h3 className="font-black text-slate-950">Week {week.weekNumber}: {week.title}</h3>
              <div className="mt-3 space-y-4">
                {week.modules.map((module) => (
                  <div key={module.id}>
                    <p className="text-sm font-black text-slate-700">{module.title}</p>
                    <div className="mt-2 grid gap-2">
                      {module.lessons.length ? module.lessons.map((lesson) => (
                        <Link key={lesson.id} href={`/student/courses/${course.id}/lessons/${lesson.id}`} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary">
                          {lesson.title}
                        </Link>
                      )) : <p className="text-sm text-slate-500">No published lessons yet.</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
