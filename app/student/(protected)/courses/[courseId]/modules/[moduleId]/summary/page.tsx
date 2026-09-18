import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { requireEnrollment, requireStudent } from '@/lib/auth/student-authorization';
import { db } from '@/lib/db';
import { setModuleSummaryProgressAction } from '@/app/student/progress-actions';
import { ResourceRenderer } from '@/components/resources/ResourceRenderer';

type ModuleSummaryPageProps = {
  params: Promise<{ courseId: string; moduleId: string }>;
};

export default async function StudentModuleSummaryPage({ params }: ModuleSummaryPageProps) {
  const [{ courseId, moduleId }, student] = await Promise.all([params, requireStudent()]);
  await requireEnrollment(student.id, courseId);

  const courseModule = await db.courseModule.findFirst({
    where: { id: moduleId, week: { courseId } },
    include: {
      week: true,
      summary: true,
    },
  });

  if (!courseModule || !courseModule.summary) {
    redirect(`/student/courses/${courseId}`);
  }

  const summary = courseModule.summary;

  const progress = await db.moduleSummaryProgress.findUnique({
    where: {
      studentId_moduleSummaryId: {
        studentId: student.id,
        moduleSummaryId: summary.id,
      },
    },
  });

  const isCompleted = progress?.isCompleted ?? false;

  return (
    <article className="space-y-6">
      <Link
        href={`/student/courses/${courseId}`}
        className="text-primary inline-flex items-center gap-2 text-sm font-black"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Curriculum
      </Link>

      <header className="rounded-xl border border-indigo-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 border border-indigo-100">
            Week {courseModule.week.weekNumber} · {courseModule.title}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {summary.resourceType === 'SLIDE' ? 'Slide Deck Explainer' : 'Video Explainer'}
          </span>
          {summary.duration && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {summary.duration} mins
            </span>
          )}
        </div>

        <h1 className="mt-4 text-3xl font-black text-slate-950">{summary.title}</h1>
        {summary.description && <p className="mt-2 text-sm text-slate-600">{summary.description}</p>}
      </header>

      {/* Resource Delivery Deck or Video */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-950">Summary Presentation &amp; Material</h2>

        {summary.resourceUrl ? (
          <ResourceRenderer
            title={summary.title}
            fileUrl={summary.resourceUrl}
            resourceType={summary.resourceType === 'SLIDE' ? 'DOCUMENT' : 'VIDEO'}
            sourceType={summary.resourceType === 'SLIDE' ? 'GOOGLE_DRIVE' : undefined}
            description={summary.description}
          />
        ) : (
          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            Slide deck or video explainer material for this summary is delivered inline below.
          </div>
        )}

        {summary.content && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-2">Key Takeaways &amp; Notes</h3>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{summary.content}</div>
          </div>
        )}
      </section>

      {/* Completion toggle form */}
      <form action={setModuleSummaryProgressAction} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="moduleId" value={moduleId} />
        <input type="hidden" name="moduleSummaryId" value={summary.id} />
        <input type="hidden" name="isCompleted" value={isCompleted ? 'false' : 'true'} />

        <div className="flex items-center gap-2">
          {isCompleted ? (
            <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-700">
              <CheckCircle2 className="h-5 w-5" /> You have completed this module summary.
            </span>
          ) : (
            <span className="text-sm font-medium text-slate-600">
              Review all key takeaways, then mark this summary as completed.
            </span>
          )}
        </div>

        <button
          type="submit"
          className={`rounded-lg px-4 py-2.5 text-xs font-black uppercase tracking-wider transition ${
            isCompleted
              ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isCompleted ? 'Mark as Incomplete' : 'Mark Summary as Complete'}
        </button>
      </form>
    </article>
  );
}
