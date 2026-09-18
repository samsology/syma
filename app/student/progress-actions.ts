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

export async function setModuleSummaryProgressAction(formData: FormData) {
  const student = await requireStudent();
  const courseId = String(formData.get('courseId') ?? '');
  const moduleId = String(formData.get('moduleId') ?? '');
  const moduleSummaryId = String(formData.get('moduleSummaryId') ?? '');
  const isCompleted = formData.get('isCompleted') === 'true';

  if (!courseId || !moduleId || !moduleSummaryId) redirect('/student');

  await db.moduleSummaryProgress.upsert({
    where: {
      studentId_moduleSummaryId: {
        studentId: student.id,
        moduleSummaryId,
      },
    },
    update: {
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
    create: {
      studentId: student.id,
      moduleSummaryId,
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
  });

  revalidatePath('/student');
  revalidatePath(`/student/courses/${courseId}`);
  revalidatePath(`/student/courses/${courseId}/modules/${moduleId}/summary`);
  redirect(`/student/courses/${courseId}/modules/${moduleId}/summary`);
}

export async function recordQuizAttemptAction(formData: FormData) {
  const student = await requireStudent();
  const courseId = String(formData.get('courseId') ?? '');
  const moduleId = String(formData.get('moduleId') ?? '');
  const quizId = String(formData.get('quizId') ?? '');
  const score = Number(formData.get('score') ?? 100);

  if (!courseId || !moduleId || !quizId) redirect('/student');

  const quiz = await db.moduleQuiz.findUnique({ where: { id: quizId } });
  if (!quiz) redirect(`/student/courses/${courseId}`);

  const previousAttempts = await db.quizAttempt.count({
    where: { studentId: student.id, quizId },
  });

  if (previousAttempts >= quiz.maxAttempts) {
    redirect(`/student/courses/${courseId}/modules/${moduleId}/quiz`);
  }

  const passed = score >= quiz.passingScore;

  await db.quizAttempt.create({
    data: {
      studentId: student.id,
      quizId,
      attemptNumber: previousAttempts + 1,
      score,
      passed,
      completedAt: new Date(),
    },
  });

  revalidatePath('/student');
  revalidatePath(`/student/courses/${courseId}`);
  revalidatePath(`/student/courses/${courseId}/modules/${moduleId}/quiz`);
  redirect(`/student/courses/${courseId}/modules/${moduleId}/quiz`);
}

export async function submitWeeklyAssignmentAction(formData: FormData) {
  const student = await requireStudent();
  const courseId = String(formData.get('courseId') ?? '');
  const weekId = String(formData.get('weekId') ?? '');
  const assignmentId = String(formData.get('assignmentId') ?? '');
  const content = String(formData.get('content') ?? '');
  const fileUrl = String(formData.get('fileUrl') ?? '');

  if (!courseId || !weekId || !assignmentId) redirect('/student');

  await db.assignmentSubmission.upsert({
    where: {
      studentId_assignmentId: {
        studentId: student.id,
        assignmentId,
      },
    },
    update: {
      content: content || null,
      fileUrl: fileUrl || null,
      status: 'SUBMITTED',
      submittedAt: new Date(),
    },
    create: {
      studentId: student.id,
      assignmentId,
      content: content || null,
      fileUrl: fileUrl || null,
      status: 'SUBMITTED',
      submittedAt: new Date(),
    },
  });

  revalidatePath('/student');
  revalidatePath(`/student/courses/${courseId}`);
  revalidatePath(`/student/courses/${courseId}/weeks/${weekId}/assignment`);
  redirect(`/student/courses/${courseId}/weeks/${weekId}/assignment`);
}

