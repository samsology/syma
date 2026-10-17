'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/authorization';
import { db } from '@/lib/db';
import { r2Storage } from '@/lib/storage/r2Storage';
import { validateAssignmentFile } from '@/lib/assignments/files';
import { normalizeAssignmentUrl, validateAssignmentScore } from '@/lib/assignments/policy';

function safeFilename(filename: string) {
  return (filename.split(/[\\/]/).pop() || 'assignment-file').replace(/[^a-zA-Z0-9_.-]/g, '_');
}

export async function addAssignmentResourceAction(formData: FormData) {
  await requireAdmin();
  const assignmentId = String(formData.get('assignmentId') ?? '');
  const label = String(formData.get('label') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const externalUrl = String(formData.get('externalUrl') ?? '').trim();
  const file = formData.get('file');
  const assignment = await db.weeklyAssignment.findUnique({ where: { id: assignmentId }, include: { week: true } });
  if (!assignment) redirect('/admin/assignments?error=not-found');
  if (!label || label.length > 120) redirect(`/admin/assignments/${assignmentId}?error=label`);

  if (file instanceof File && file.size > 0) {
    if (validateAssignmentFile(file)) {
      redirect(`/admin/assignments/${assignmentId}?error=file`);
    }
    const filename = safeFilename(file.name);
    const resourceId = crypto.randomUUID();
    const storageKey = `assignments/${assignmentId}/resources/${resourceId}/${filename}`;
    try {
      await r2Storage.upload(storageKey, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type || 'application/octet-stream',
      });
    } catch (error) {
      await r2Storage.delete(storageKey).catch(() => false);
      throw error;
    }
    try {
      await db.assignmentResource.create({
        data: {
          id: resourceId,
          assignmentId,
          resourceType: 'FILE',
          label,
          description: description || null,
          storageKey,
          originalFilename: filename,
          mimeType: file.type || null,
          fileSize: file.size,
        },
      });
    } catch (error) {
      await r2Storage.delete(storageKey).catch(() => false);
      throw error;
    }
  } else {
    const url = normalizeAssignmentUrl(externalUrl);
    if (!url) redirect(`/admin/assignments/${assignmentId}?error=url`);
    await db.assignmentResource.create({
      data: {
        assignmentId,
        resourceType: 'LINK',
        label,
        description: description || null,
        externalUrl: url,
      },
    });
  }

  revalidatePath(`/admin/assignments/${assignmentId}`);
  revalidatePath(`/student/courses/${assignment.week.courseId}`);
  redirect(`/admin/assignments/${assignmentId}`);
}

export async function deleteAssignmentResourceAction(formData: FormData) {
  await requireAdmin();
  const resourceId = String(formData.get('resourceId') ?? '');
  const resource = await db.assignmentResource.findUnique({
    where: { id: resourceId },
    include: { assignment: { include: { week: true } } },
  });
  if (!resource) redirect('/admin/assignments');
  await db.assignmentResource.delete({ where: { id: resourceId } });
  if (resource.storageKey) await r2Storage.delete(resource.storageKey);
  revalidatePath(`/admin/assignments/${resource.assignmentId}`);
  revalidatePath(`/student/courses/${resource.assignment.week.courseId}`);
  redirect(`/admin/assignments/${resource.assignmentId}`);
}

export async function reviewAssignmentSubmissionAction(formData: FormData) {
  const admin = await requireAdmin();
  const submissionId = String(formData.get('submissionId') ?? '');
  const status = String(formData.get('status') ?? '');
  const rawScore = String(formData.get('score') ?? '').trim();
  const feedback = String(formData.get('feedback') ?? '').trim();
  if (!['REVIEWED', 'NEEDS_REVISION'].includes(status)) redirect('/admin/assignments');

  const submission = await db.assignmentSubmission.findUnique({
    where: { id: submissionId },
    include: { assignment: { include: { week: true } } },
  });
  if (!submission) redirect('/admin/assignments');
  const score = validateAssignmentScore(rawScore, submission.assignment.maxScore);
  if (score === undefined) {
    redirect(`/admin/assignments/${submission.assignmentId}?error=score`);
  }

  await db.assignmentSubmission.update({
    where: { id: submission.id },
    data: {
      status,
      score,
      feedback: feedback || null,
      reviewerId: admin.id,
      reviewedAt: new Date(),
    },
  });
  revalidatePath(`/admin/assignments/${submission.assignmentId}`);
  revalidatePath('/admin/assignments');
  revalidatePath(`/student/courses/${submission.assignment.week.courseId}/weeks/${submission.assignment.weekId}/assignment`);
  revalidatePath(`/student/courses/${submission.assignment.week.courseId}`);
  revalidatePath('/student');
  redirect(`/admin/assignments/${submission.assignmentId}`);
}

