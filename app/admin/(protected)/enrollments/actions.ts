'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/authorization';
import { db } from '@/lib/db';
import { createEnrollmentSchema, updateEnrollmentStatusSchema } from '@/lib/validation/enrollment';

export type EnrollmentActionState = {
  fieldErrors?: Record<string, string[] | undefined>;
  formError?: string;
};

export async function createEnrollmentAction(
  _previousState: EnrollmentActionState,
  formData: FormData
): Promise<EnrollmentActionState> {
  await requireAdmin();
  const parsed = createEnrollmentSchema.safeParse({
    studentId: formData.get('studentId'),
    courseId: formData.get('courseId'),
    status: formData.get('status') || 'ACTIVE',
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const [student, course, existing] = await Promise.all([
    db.student.findUnique({ where: { id: parsed.data.studentId }, select: { status: true } }),
    db.course.findUnique({ where: { id: parsed.data.courseId }, select: { status: true } }),
    db.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: parsed.data.studentId,
          courseId: parsed.data.courseId,
        },
      },
      select: { id: true },
    }),
  ]);

  if (!student || student.status !== 'ACTIVE') return { formError: 'Choose an active student.' };
  if (!course || course.status !== 'PUBLISHED') return { formError: 'Choose a published course.' };
  if (existing) return { formError: 'This student is already enrolled in that course.' };

  const enrollment = await db.enrollment.create({
    data: {
      studentId: parsed.data.studentId,
      courseId: parsed.data.courseId,
      status: parsed.data.status,
      startedAt: parsed.data.status === 'ACTIVE' ? new Date() : null,
      completedAt: parsed.data.status === 'COMPLETED' ? new Date() : null,
    },
  });

  revalidatePath('/admin/enrollments');
  redirect(`/admin/enrollments/${enrollment.id}`);
}

export async function updateEnrollmentStatusAction(formData: FormData) {
  await requireAdmin();
  const parsed = updateEnrollmentStatusSchema.safeParse({
    enrollmentId: formData.get('enrollmentId'),
    status: formData.get('status'),
  });

  if (!parsed.success) redirect('/admin/enrollments');

  const now = new Date();
  await db.enrollment.update({
    where: { id: parsed.data.enrollmentId },
    data: {
      status: parsed.data.status,
      startedAt: parsed.data.status === 'ACTIVE' ? now : undefined,
      completedAt: parsed.data.status === 'COMPLETED' ? now : parsed.data.status === 'ACTIVE' ? null : undefined,
    },
  });

  revalidatePath('/admin/enrollments');
  revalidatePath(`/admin/enrollments/${parsed.data.enrollmentId}`);
}
