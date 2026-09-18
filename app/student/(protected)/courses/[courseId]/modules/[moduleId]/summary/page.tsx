import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Presentation, Video, ExternalLink } from 'lucide-react';
import { requireEnrollment, requireStudent } from '@/lib/auth/student-authorization';
import { db } from '@/lib/db';
import { setModuleSummaryProgressAction } from '@/app/student/progress-actions';

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

        {summary.resourceType === 'SLIDE' && summary.resourceUrl ? (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-600 p-2.5 text-white shrink-0">
                <Presentation className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-slate-950">Module Summary Slide Presentation</p>
                <p className="text-xs text-slate-500">Review structured deck highlights and key takeaways</p>
              </div>
            </div>
            <a
              href={summary.resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open Full Slide Deck
            </a>
          </div>
        ) : summary.resourceUrl ? (
          <div className="rounded-lg border border-sky-200 bg-sky-50/40 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-sky-600 p-2.5 text-white shrink-0">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-slate-950">Module Summary Video Explainer</p>
                <p className="text-xs text-slate-500">Watch instructor walkthrough of module highlights</p>
              </div>
            </div>
            <a
              href={summary.resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-700 transition"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Watch Video Explainer
            </a>
          </div>
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
