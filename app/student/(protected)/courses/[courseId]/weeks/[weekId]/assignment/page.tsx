import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Download, FileText, Send } from 'lucide-react';
import { requireEnrollment, requireStudent } from '@/lib/auth/student-authorization';
import { db } from '@/lib/db';
import { submitWeeklyAssignmentAction } from '@/app/student/progress-actions';

type WeeklyAssignmentPageProps = {
  params: Promise<{ courseId: string; weekId: string }>;
};

export default async function StudentWeeklyAssignmentPage({ params }: WeeklyAssignmentPageProps) {
  const [{ courseId, weekId }, student] = await Promise.all([params, requireStudent()]);
  await requireEnrollment(student.id, courseId);

  const week = await db.courseWeek.findFirst({
    where: { id: weekId, courseId },
    include: {
      assignment: true,
    },
  });

  if (!week || !week.assignment) {
    redirect(`/student/courses/${courseId}`);
  }

  const assignment = week.assignment;

  const submission = await db.assignmentSubmission.findUnique({
    where: {
      studentId_assignmentId: {
        studentId: student.id,
        assignmentId: assignment.id,
      },
    },
  });

  const isSubmitted = !!submission;

  return (
    <article className="space-y-6">
      <Link
        href={`/student/courses/${courseId}`}
        className="text-primary inline-flex items-center gap-2 text-sm font-black"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Curriculum
      </Link>

      <header className="rounded-xl border border-emerald-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 border border-emerald-100">
            Week {week.weekNumber} · Weekly Assignment
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            Format: {assignment.submissionType}
          </span>
          {assignment.dueDateDays && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              Due: {assignment.dueDateDays} days from week start
            </span>
          )}
        </div>

        <h1 className="mt-4 text-3xl font-black text-slate-950">{assignment.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{assignment.description}</p>
      </header>

      {/* Dataset & Practical Files (if attached) */}
      {assignment.datasetUrl && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">Assignment Dataset &amp; Lab Data</h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-emerald-100 p-2 text-emerald-700">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">{assignment.datasetName || 'Lab Dataset File'}</p>
                <p className="text-xs text-slate-500">Official practical dataset provided for this assignment</p>
              </div>
            </div>
            <a
              href={assignment.datasetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              <Download className="h-3.5 w-3.5" /> Download Dataset
            </a>
          </div>
        </section>
      )}

      {/* Instructions */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-950">Assignment Tasks &amp; Instructions</h2>
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {assignment.instructions}
        </div>

        {assignment.submissionRequirements && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Submission Requirements</h3>
            <p className="text-sm text-slate-600">{assignment.submissionRequirements}</p>
          </div>
        )}
      </section>

      {/* Submission Status */}
      {isSubmitted && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
          <div>
            <h3 className="font-bold text-emerald-950">Assignment Submitted</h3>
            <p className="text-xs text-emerald-800">
              Submitted on {new Date(submission.submittedAt).toLocaleDateString()} at {new Date(submission.submittedAt).toLocaleTimeString()}.
            </p>
          </div>
        </div>
      )}

      {/* Submission Form */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-950">
          {isSubmitted ? 'Update Your Submission' : 'Submit Assignment'}
        </h2>

        <form action={submitWeeklyAssignmentAction} className="space-y-4">
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="weekId" value={weekId} />
          <input type="hidden" name="assignmentId" value={assignment.id} />

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              Submission Text, Deliverable Notes, or Cloud Drive Link
            </label>
            <textarea
              name="content"
              defaultValue={submission?.content ?? ''}
              rows={5}
              placeholder="Paste your analysis summary, report text, or shareable link (e.g. Google Drive, GitHub repository, Tableau Public)..."
              className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
              File Attachment URL (optional)
            </label>
            <input
              name="fileUrl"
              defaultValue={submission?.fileUrl ?? ''}
              placeholder="https://... or direct link to your submitted file"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-black text-white hover:bg-emerald-700 transition"
            >
              <Send className="h-4 w-4" />
              {isSubmitted ? 'Resubmit Assignment' : 'Submit Assignment'}
            </button>
          </div>
        </form>
      </section>
    </article>
  );
}
