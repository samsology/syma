import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { r2Storage } from '@/lib/storage/r2Storage';
import { normalizeAssignmentUrl } from '@/lib/assignments/policy';
import { addAssignmentResourceAction, deleteAssignmentResourceAction, reviewAssignmentSubmissionAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function AssignmentReviewPage({ params, searchParams }: { params: Promise<{ assignmentId: string }>; searchParams: Promise<{ error?: string }> }) {
  const [{ assignmentId }, query] = await Promise.all([params, searchParams]);
  const assignment = await db.weeklyAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      week: { include: { course: { select: { id: true, title: true } } } },
      resources: { orderBy: { createdAt: 'asc' } },
      submissions: {
        orderBy: [{ studentId: 'asc' }, { attemptNumber: 'desc' }],
        include: {
          student: { select: { firstName: true, lastName: true, email: true } },
          reviewer: { select: { name: true } },
        },
      },
    },
  });
  if (!assignment) notFound();

  const datasetDownloadUrl = assignment.datasetUrl?.startsWith('r2://')
    ? await r2Storage.getSignedUrl(assignment.datasetUrl.replace(/^r2:\/\//, ''), 900).catch(() => null)
    : null;
  const datasetExternalUrl =
    assignment.datasetUrl && !assignment.datasetUrl.startsWith('r2://')
      ? normalizeAssignmentUrl(assignment.datasetUrl)
      : null;

  const resources = await Promise.all(assignment.resources.map(async (resource) => ({
    ...resource,
    externalUrl: resource.externalUrl ? normalizeAssignmentUrl(resource.externalUrl) : null,
    signedUrl: resource.storageKey ? await r2Storage.getSignedUrl(resource.storageKey, 900).catch(() => null) : null,
  })));
  const submissions = await Promise.all(assignment.submissions.map(async (submission) => ({
    ...submission,
    safeSubmittedUrl: submission.method === 'LINK' && submission.content ? normalizeAssignmentUrl(submission.content) : null,
    safeLegacyFileUrl: submission.fileUrl?.startsWith('http') ? normalizeAssignmentUrl(submission.fileUrl) : null,
    legacyR2Download: submission.method === 'LINK' && submission.fileUrl?.startsWith('r2://')
      ? await r2Storage.getSignedUrl(submission.fileUrl.replace(/^r2:\/\//, ''), 900).catch(() => null)
      : null,
    fileDownload: submission.method === 'FILE' && submission.fileUrl
      ? await r2Storage.getSignedUrl(submission.fileUrl.replace(/^r2:\/\//, ''), 900).catch(() => null)
      : null,
  })));

  return (
    <div className="space-y-6">
      <Link href="/admin/assignments" className="text-sm font-semibold text-primary hover:underline">← All assignments</Link>
      <header className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{assignment.week.course.title} · Week {assignment.week.weekNumber}</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">{assignment.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{assignment.status === 'PUBLISHED' ? 'Published' : 'Draft'}{assignment.maxScore != null ? ` · Maximum score: ${assignment.maxScore}` : ''}</p>
        
        {(datasetDownloadUrl || datasetExternalUrl) && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-sm">
            <div>
              <p className="font-bold text-emerald-950">
                Primary Dataset: {assignment.datasetName || 'Lab Dataset'}
              </p>
              <p className="text-xs text-slate-500">
                {datasetDownloadUrl
                  ? 'Uploaded file stored in Cloudflare R2'
                  : 'Google Drive / external dataset link'}
              </p>
            </div>
            {datasetDownloadUrl ? (
              <a
                href={datasetDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Download Dataset File
              </a>
            ) : (
              <a
                href={datasetExternalUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Open Google Drive Link ↗
              </a>
            )}
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <Link href={`/admin/courses/${assignment.week.course.id}/curriculum`} className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Edit curriculum details</Link>
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-950">Instructor resources</h2>
        <div className="mt-4 space-y-2">
          {resources.map((resource) => (
            <div key={resource.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 text-sm">
              <div><p className="font-semibold text-slate-900">{resource.label}</p><p className="text-xs text-slate-500">{resource.originalFilename ?? resource.externalUrl ?? 'Resource'}</p></div>
              <div className="flex gap-2">
                {resource.signedUrl && <a href={resource.signedUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary">Open file</a>}
                {resource.externalUrl && <a href={resource.externalUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary">Open link</a>}
                <form action={deleteAssignmentResourceAction}><input type="hidden" name="resourceId" value={resource.id} /><button className="font-semibold text-red-700">Remove</button></form>
              </div>
            </div>
          ))}
          {resources.length === 0 && <p className="text-sm text-slate-500">No attached resources.</p>}
        </div>
        <form action={addAssignmentResourceAction} encType="multipart/form-data" className="mt-5 grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
          <input type="hidden" name="assignmentId" value={assignment.id} />
          <label className="text-xs font-bold text-slate-600">Display label<input name="label" required maxLength={120} className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-normal" /></label>
          <label className="text-xs font-bold text-slate-600">Short description (optional)<input name="description" className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-normal" /></label>
          <label className="text-xs font-bold text-slate-600">External URL (HTTPS or HTTP)<input name="externalUrl" type="url" placeholder="https://…" className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-normal" /></label>
          <label className="text-xs font-bold text-slate-600">Or upload a file (max 4 MB)<input name="file" type="file" accept=".pdf,.csv,.xlsx,.xls,.docx,.doc,.pptx,.ppt,.zip" className="mt-1 block w-full text-sm font-normal" /></label>
          {query.error && <p className="sm:col-span-2 text-sm font-semibold text-red-700">{query.error === 'url' ? 'Enter a valid HTTP or HTTPS resource URL.' : query.error === 'file' ? 'File type is not supported or file is larger than 4 MB.' : query.error === 'label' ? 'A resource label is required.' : 'Unable to save resource.'}</p>}
          <button className="w-fit rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">Add resource</button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-black text-slate-950">Student submissions ({submissions.length})</h2>
        {submissions.length === 0 ? <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">No submissions yet.</p> : submissions.map((submission) => (
          <article key={submission.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-950">
                  {submission.student.firstName} {submission.student.lastName}
                </h3>
                <p className="text-xs text-slate-500">
                  {submission.student.email} · Attempt {submission.attemptNumber} ·{' '}
                  {submission.submittedAt.toLocaleString()}
                </p>
                {submission.reviewedAt && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Reviewed by {submission.reviewer?.name ?? 'Admin'} on{' '}
                    {new Date(submission.reviewedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {submission.score != null && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
                    Score: {submission.score}
                    {assignment.maxScore != null ? ` / ${assignment.maxScore}` : ''}
                  </span>
                )}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    submission.status === 'REVIEWED'
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                      : submission.status === 'NEEDS_REVISION'
                      ? 'border border-amber-200 bg-amber-50 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {submission.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="mt-3 text-sm text-slate-700">
              {submission.method === 'FILE' ? (submission.fileDownload ? <a href={submission.fileDownload} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary">Download {submission.originalFilename ?? 'submitted file'}</a> : <p>File unavailable or storage credentials are not configured.</p>) : submission.safeSubmittedUrl ? <a href={submission.safeSubmittedUrl} target="_blank" rel="noopener noreferrer" className="break-all font-semibold text-primary">Open submitted link</a> : <div className="space-y-2"><p className="whitespace-pre-wrap">{submission.content || 'Submission link unavailable or invalid.'}</p>{submission.safeLegacyFileUrl && <a href={submission.safeLegacyFileUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary">Open legacy attached file</a>}{submission.legacyR2Download && <a href={submission.legacyR2Download} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary">Open previous private file</a>}</div>}
            </div>
            <form action={reviewAssignmentSubmissionAction} className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
              <input type="hidden" name="submissionId" value={submission.id} />
              <label className="text-xs font-bold text-slate-600">Review status<select name="status" defaultValue={submission.status === 'NEEDS_REVISION' ? 'NEEDS_REVISION' : 'REVIEWED'} className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-normal"><option value="REVIEWED">Reviewed</option><option value="NEEDS_REVISION">Needs Revision</option></select></label>
              <label className="text-xs font-bold text-slate-600">Score {assignment.maxScore != null ? `(0–${assignment.maxScore})` : '(optional, zero or higher)'}<input name="score" type="number" min="0" step="0.01" max={assignment.maxScore ?? undefined} defaultValue={submission.score ?? ''} className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-normal" /></label>
              <label className="text-xs font-bold text-slate-600 sm:col-span-2">Written feedback<textarea name="feedback" rows={3} defaultValue={submission.feedback ?? ''} className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-normal" /></label>
              <button className="w-fit rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">Save review</button>
              {query.error === 'score' && <p className="self-center text-sm font-semibold text-red-700">Score must be zero or higher and cannot exceed the maximum configured score.</p>}
            </form>
          </article>
        ))}
      </section>
    </div>
  );
}
