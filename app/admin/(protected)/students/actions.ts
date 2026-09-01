'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/authorization';
import { db } from '@/lib/db';
import { adminUpdateStudentStatusSchema } from '@/lib/validation/student';

export async function updateStudentStatusAction(formData: FormData) {
  await requireAdmin();
  const parsed = adminUpdateStudentStatusSchema.safeParse({
    studentId: formData.get('studentId'),
    status: formData.get('status'),
  });

  if (!parsed.success) redirect('/admin/students');

  await db.student.update({
    where: { id: parsed.data.studentId },
    data: { status: parsed.data.status },
  });

  if (parsed.data.status !== 'ACTIVE') {
    await db.studentSession.deleteMany({ where: { studentId: parsed.data.studentId } });
  }

  revalidatePath('/admin/students');
  revalidatePath(`/admin/students/${parsed.data.studentId}`);
}
