import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Download, ExternalLink, FileText, Send } from 'lucide-react';
import { requireEnrollment, requireStudent } from '@/lib/auth/student-authorization';
import { db } from '@/lib/db';
import { submitWeeklyAssignmentAction } from '@/app/student/progress-actions';
import { r2Storage } from '@/lib/storage/r2Storage';
import { normalizeAssignmentUrl } from '@/lib/assignments/policy';

type WeeklyAssignmentPageProps = {
  params: Promise<{ courseId: string; weekId: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function StudentWeeklyAssignmentPage({
  params,
  searchParams,
}: WeeklyAssignmentPageProps) {
  const [{ courseId, weekId }, query, student] = await Promise.all([
    params,
    searchParams,
    requireStudent(),
  ]);
  const enrollment = await requireEnrollment(student.id, courseId);

  const week = await db.courseWeek.findFirst({
    where: { id: weekId, courseId },
    include: {
      assignment: true,
    },
  });

  if (!week || !week.assignment || week.assignment.status !== 'PUBLISHED') {
    redirect(`/student/courses/${courseId}`);
  }

  const assignment = week.assignment;
  const datasetDownloadUrl = assignment.datasetUrl?.startsWith('r2://')
    ? await r2Storage
        .getSignedUrl(assignment.datasetUrl.replace(/^r2:\/\//, ''), 900)
        .catch(() => null)
    : null;
  const datasetExternalUrl =
    assignment.datasetUrl && !assignment.datasetUrl.startsWith('r2://')
      ? normalizeAssignmentUrl(assignment.datasetUrl)
      : null;

  const [completedLessonProgress, completedSummaryProgress, passedAttempts, assignmentSubmissions] =
    await Promise.all([
      db.lessonProgress.findMany({
        where: { studentId: student.id, isCompleted: true },
        select: { lessonId: true },
      }),
      db.moduleSummaryProgress.findMany({
        where: { studentId: student.id, isCompleted: true },
        select: { moduleSummaryId: true },
      }),
      db.quizAttempt.findMany({
        where: { studentId: student.id, passed: true },
        select: { quizId: true },
      }),
      db.assignmentSubmission.findMany({
        where: { studentId: student.id },
        select: { assignmentId: true },
      }),
    ]);

  const { isItemUnlocked } = await import('@/lib/student-course/drip-progression');
  const unlocked = isItemUnlocked(enrollment.course, assignment.id, {
    completedLessonIds: completedLessonProgress.map((p) => p.lessonId),
    completedSummaryIds: completedSummaryProgress.map((p) => p.moduleSummaryId),
    passedQuizIds: passedAttempts.map((a) => a.quizId),
    submittedAssignmentIds: assignmentSubmissions.map((a) => a.assignmentId),
  });

  if (!unlocked) {
    redirect(`/student/courses/${courseId}`);
  }

  const submissions = await db.assignmentSubmission.findMany({
    where: { studentId: student.id, assignmentId: assignment.id },
    orderBy: { attemptNumber: 'desc' },
  });
  const submission = submissions[0] ?? null;
  const isSubmitted = !!submission;
  const resources = await db.assignmentResource
    .findMany({
      where: { assignmentId: assignment.id },
      orderBy: { createdAt: 'asc' },
    })
    .then((items) =>
      Promise.all(
        items
          .filter((resource) => {
            const primaryStorageKey = assignment.datasetUrl?.startsWith('r2://')
              ? assignment.datasetUrl.replace(/^r2:\/\//, '')
              : null;
            return !(
              (primaryStorageKey && resource.storageKey === primaryStorageKey) ||
              (assignment.datasetUrl && resource.externalUrl === assignment.datasetUrl)
            );
          })
          .map(async (resource) => ({
            ...resource,
            externalUrl: resource.externalUrl ? normalizeAssignmentUrl(resource.externalUrl) : null,
            signedUrl: resource.storageKey
              ? await r2Storage.getSignedUrl(resource.storageKey, 900).catch(() => null)
              : null,
          }))
      )
    );
  const submissionHistory = await Promise.all(
    submissions.map(async (attempt) => ({
      ...attempt,
      safeSubmittedUrl:
        attempt.method === 'LINK' && attempt.content
          ? normalizeAssignmentUrl(attempt.content)
          : null,
      safeLegacyFileUrl:
        attempt.method === 'LINK' && attempt.fileUrl?.startsWith('http')
          ? normalizeAssignmentUrl(attempt.fileUrl)
          : null,
      legacyR2Download:
        attempt.method === 'LINK' && attempt.fileUrl?.startsWith('r2://')
          ? await r2Storage
              .getSignedUrl(attempt.fileUrl.replace(/^r2:\/\//, ''), 900)
              .catch(() => null)
          : null,
      downloadUrl:
        attempt.method === 'FILE' && attempt.fileUrl
          ? await r2Storage
              .getSignedUrl(attempt.fileUrl.replace(/^r2:\/\//, ''), 900)
              .catch(() => null)
          : null,
    }))
  );
  const latestSubmission = submissionHistory[0] ?? null;

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
          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold tracking-wider text-emerald-700 uppercase">
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
          {assignment.dueAt && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              Due: {assignment.dueAt.toLocaleString()}
            </span>
          )}
        </div>

        <h1 className="mt-4 text-3xl font-black text-slate-950">{assignment.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{assignment.description}</p>
        {assignment.maxScore != null && (
          <p className="mt-2 text-xs font-semibold text-slate-600">
            Maximum score: {assignment.maxScore}
          </p>
        )}
      </header>

      {/* Dataset & Practical Files (if attached) */}
      {(datasetDownloadUrl || datasetExternalUrl || resources.length > 0) && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm">
          <h2 className="mb-2 text-xs font-bold tracking-wider text-emerald-800 uppercase">
            Assignment Dataset &amp; Lab Data
          </h2>
          <div className="space-y-3">
            {(datasetDownloadUrl || datasetExternalUrl) && (
              <div className="flex flex-col gap-3 rounded-lg border border-emerald-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-emerald-100 p-2 text-emerald-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {assignment.datasetName || 'Practical Lab Dataset'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {datasetDownloadUrl
                        ? 'Official practical dataset provided for this assignment'
                        : 'Google Drive / external dataset document provided for this assignment'}
                    </p>
                  </div>
                </div>
                {datasetDownloadUrl ? (
                  <a
                    href={datasetDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                  >
                    <Download className="h-3.5 w-3.5" /> Download Dataset
                  </a>
                ) : (
                  <a
                    href={datasetExternalUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open Dataset (Google Drive) ↗
                  </a>
                )}
              </div>
            )}
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="flex flex-col gap-2 rounded-lg border border-emerald-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">{resource.label}</p>
                  {resource.description && (
                    <p className="text-xs text-slate-600">{resource.description}</p>
                  )}
                </div>
                {resource.externalUrl ? (
                  <a
                    href={resource.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" /> Open resource ↗
                  </a>
                ) : resource.signedUrl ? (
                  <a
                    href={resource.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" /> Download{' '}
                    {resource.originalFilename ?? 'file'}
                  </a>
                ) : (
                  <span className="text-xs text-slate-500">File unavailable</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Instructions */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Assignment Tasks &amp; Instructions</h2>
        <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
          {assignment.instructions}
        </div>

        {assignment.submissionRequirements && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <h3 className="mb-1.5 text-xs font-bold tracking-wider text-slate-600 uppercase">
              Submission Requirements
            </h3>
            <p className="text-sm text-slate-600">{assignment.submissionRequirements}</p>
          </div>
        )}
      </section>

      {/* Submission Status */}
      {isSubmitted && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
            <div>
              <h3 className="font-bold text-emerald-950">{submission.status.replace('_', ' ')}</h3>
              <p className="text-xs text-emerald-800">
                Attempt {submission.attemptNumber} · Submitted{' '}
                {submission.submittedAt.toLocaleString()}
              </p>
            </div>
          </div>
          {latestSubmission?.downloadUrl && (
            <a
              className="mt-3 inline-block text-sm font-semibold text-emerald-800 underline"
              href={latestSubmission.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open your submitted file: {submission.originalFilename}
            </a>
          )}
          {latestSubmission?.safeSubmittedUrl && (
            <a
              className="mt-3 inline-block text-sm font-semibold text-emerald-800 underline"
              href={latestSubmission.safeSubmittedUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open your submitted link ↗
            </a>
          )}
          {submission.method === 'LINK' &&
            !latestSubmission?.safeSubmittedUrl &&
            submission.content && (
              <p className="mt-3 text-sm whitespace-pre-wrap text-slate-700">
                {submission.content}
              </p>
            )}
          {latestSubmission?.safeLegacyFileUrl && (
            <a
              className="mt-2 inline-block text-sm font-semibold text-emerald-800 underline"
              href={latestSubmission.safeLegacyFileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open previously attached file
            </a>
          )}
          {latestSubmission?.legacyR2Download && (
            <a
              className="mt-2 inline-block text-sm font-semibold text-emerald-800 underline"
              href={latestSubmission.legacyR2Download}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open previous private file
            </a>
          )}
          {submission.status === 'NEEDS_REVISION' && (
            <p className="mt-3 text-sm font-semibold text-amber-800">
              Your instructor requested a revision. You can submit a new attempt below.
            </p>
          )}
          {submission.status === 'REVIEWED' && submission.score != null && (
            <p className="mt-3 text-sm font-bold text-emerald-900">
              Score: {submission.score}
              {assignment.maxScore != null ? ` / ${assignment.maxScore}` : ''}
            </p>
          )}
          {submission.status !== 'SUBMITTED' && submission.feedback && (
            <div className="mt-3 rounded-lg bg-white p-3">
              <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                Instructor feedback
              </p>
              <p className="mt-1 text-sm whitespace-pre-wrap text-slate-700">
                {submission.feedback}
              </p>
            </div>
          )}
          {submissions.length > 1 && (
            <div className="mt-4 border-t border-emerald-200 pt-3">
              <h4 className="text-xs font-bold tracking-wide text-emerald-900 uppercase">
                Attempt history
              </h4>
              <ul className="mt-2 space-y-2">
                {submissionHistory.map((attempt) => (
                  <li key={attempt.id} className="text-xs text-slate-700">
                    Attempt {attempt.attemptNumber}: {attempt.status.replace('_', ' ')} ·{' '}
                    {attempt.submittedAt.toLocaleString()}
                    {attempt.score != null ? ` · Score ${attempt.score}` : ''}
                    {attempt.feedback && (
                      <p className="mt-1 whitespace-pre-wrap">Feedback: {attempt.feedback}</p>
                    )}
                    {attempt.downloadUrl && (
                      <a
                        className="text-primary ml-1 font-semibold underline"
                        href={attempt.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open submitted file
                      </a>
                    )}
                    {attempt.safeSubmittedUrl && (
                      <a
                        className="text-primary ml-1 font-semibold underline"
                        href={attempt.safeSubmittedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open submitted link
                      </a>
                    )}
                    {!attempt.safeSubmittedUrl && attempt.method === 'LINK' && attempt.content && (
                      <p className="mt-1 whitespace-pre-wrap">{attempt.content}</p>
                    )}
                    {attempt.safeLegacyFileUrl && (
                      <a
                        className="text-primary ml-1 font-semibold underline"
                        href={attempt.safeLegacyFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open prior attachment
                      </a>
                    )}
                    {attempt.legacyR2Download && (
                      <a
                        className="text-primary ml-1 font-semibold underline"
                        href={attempt.legacyR2Download}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open prior private file
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Submission Form */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          {submission?.status === 'NEEDS_REVISION'
            ? 'Submit a revision'
            : isSubmitted
              ? 'Submission received'
              : 'Submit Assignment'}
        </h2>
        {query.error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">
            {query.error === 'resubmit'
              ? 'You can submit again only after your instructor requests a revision.'
              : query.error === 'file'
                ? 'Choose a permitted file under the configured size limit.'
                : query.error === 'url'
                  ? 'Enter a valid HTTP or HTTPS URL.'
                  : 'Choose exactly one submission method and provide the required file or link.'}
          </p>
        )}
        {submission && submission.status !== 'NEEDS_REVISION' ? (
          <p className="text-sm text-slate-600">
            Resubmission is available only after your instructor marks your work as Needs Revision.
          </p>
        ) : (
          <form
            action={submitWeeklyAssignmentAction}
            encType="multipart/form-data"
            className="space-y-4"
          >
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="weekId" value={weekId} />
            <input type="hidden" name="assignmentId" value={assignment.id} />

            <fieldset className="space-y-3">
              <legend className="text-xs font-bold text-slate-600 uppercase">
                Choose one submission method
              </legend>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <input type="radio" name="method" value="FILE" required /> Upload a completed
                assignment file (PDF, CSV, Excel, Word, Power BI, or ZIP; max 4 MB)
              </label>
              <input
                name="file"
                type="file"
                accept=".pdf,.csv,.xlsx,.xls,.docx,.doc,.zip,.pbix,.ipynb,.json,.txt"
                className="block w-full text-sm"
              />
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <input type="radio" name="method" value="LINK" required /> Submit a document link
              </label>
              <input
                name="submissionUrl"
                type="url"
                placeholder="https://…"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <p className="text-xs text-slate-500">
                For Google Drive, Sheets, or other external documents, grant your instructor access
                in the provider’s sharing settings. We cannot verify external permissions.
              </p>
            </fieldset>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700"
              >
                <Send className="h-4 w-4" />
                {isSubmitted ? 'Resubmit Assignment' : 'Submit Assignment'}
              </button>
            </div>
          </form>
        )}
      </section>
    </article>
  );
}
