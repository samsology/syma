import Link from 'next/link';
import { notFound } from 'next/navigation';
import { enrollCurrentStudentAction } from '../../actions';
import { db } from '@/lib/db';

type StudentEnrollPageProps = {
  searchParams: Promise<{ courseId?: string }>;
};

export default async function StudentEnrollPage({ searchParams }: StudentEnrollPageProps) {
  const { courseId } = await searchParams;
  if (!courseId) notFound();

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, shortDescription: true, status: true },
  });

  if (!course || course.status !== 'PUBLISHED') notFound();

  return (
    <section className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-wide text-primary">Course Enrollment</p>
      <h1 className="mt-2 text-3xl font-black text-slate-950">{course.title}</h1>
      <p className="mt-3 text-slate-600">{course.shortDescription}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <form action={enrollCurrentStudentAction}>
          <input type="hidden" name="courseId" value={course.id} />
          <button className="rounded-lg bg-primary px-5 py-3 text-sm font-black text-white hover:bg-primary/90">Enroll Now</button>
        </form>
        <Link href="/programs" className="rounded-lg border border-slate-200 px-5 py-3 text-center text-sm font-black text-slate-700 hover:border-primary hover:text-primary">
          Back to Programs
        </Link>
      </div>
    </section>
  );
}
