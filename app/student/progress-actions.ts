'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStudent } from '@/lib/auth/student-authorization';
import { db } from '@/lib/db';
import { getStudentLesson } from '@/lib/student-course/queries';

export async function setLessonProgressAction(formData: FormData) {
  const student = await requireStudent();
  const courseId = String(formData.get('courseId') ?? '');
  const lessonId = String(formData.get('lessonId') ?? '');
  const isCompleted = formData.get('isCompleted') === 'true';

  if (!courseId || !lessonId) redirect('/student');

  const lessonAccess = await getStudentLesson(student.id, courseId, lessonId);
  if (!lessonAccess) redirect(`/student/courses/${courseId}`);

  await db.lessonProgress.upsert({
    where: {
      studentId_lessonId: {
        studentId: student.id,
        lessonId,
      },
    },
    update: {
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
    create: {
      studentId: student.id,
      lessonId,
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
  });

  revalidatePath('/student');
  revalidatePath(`/student/courses/${courseId}`);
  revalidatePath(`/student/courses/${courseId}/lessons/${lessonId}`);
  redirect(`/student/courses/${courseId}/lessons/${lessonId}`);
}
