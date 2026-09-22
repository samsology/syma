'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStudent } from '@/lib/auth/student-authorization';
import { db } from '@/lib/db';
import { getStudentLesson } from '@/lib/student-course/queries';
import { getQuizQuestions, evaluateQuizSubmission } from '@/lib/curriculum/quiz-engine';

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

  // Verify student is actively enrolled in this course
  const enrollment = await db.enrollment.findUnique({
    where: { studentId_courseId: { studentId: student.id, courseId } },
  });
  if (!enrollment || !['ACTIVE', 'COMPLETED'].includes(enrollment.status)) {
    redirect(`/student/courses/${courseId}`);
  }

  // Verify module summary exists and belongs to this course & module
  const summary = await db.moduleSummary.findFirst({
    where: { id: moduleSummaryId, moduleId, module: { week: { courseId } } },
  });
  if (!summary) redirect(`/student/courses/${courseId}`);

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

  if (!courseId || !moduleId || !quizId) redirect('/student');

  // Verify student is actively enrolled in this course
  const enrollment = await db.enrollment.findUnique({
    where: { studentId_courseId: { studentId: student.id, courseId } },
  });
  if (!enrollment || !['ACTIVE', 'COMPLETED'].includes(enrollment.status)) {
    redirect(`/student/courses/${courseId}`);
  }

  // Verify quiz exists and belongs to this module & course
  const quiz = await db.moduleQuiz.findFirst({
    where: { id: quizId, moduleId, status: 'PUBLISHED', module: { week: { courseId } } },
    include: {
      questions: {
        include: { options: true },
        orderBy: { order: 'asc' },
      },
    },
  });
  if (!quiz) redirect(`/student/courses/${courseId}`);

  const previousAttempts = await db.quizAttempt.count({
    where: { studentId: student.id, quizId },
  });

  if (previousAttempts >= quiz.maxAttempts) {
    redirect(`/student/courses/${courseId}/modules/${moduleId}/quiz`);
  }

  // Handle relational questions if present
  if (quiz.questions && quiz.questions.length > 0) {
    const submittedAnswers: Record<string, string> = {};
    for (const q of quiz.questions) {
      const rawVal = formData.get(`question_${q.id}`);
      if (rawVal !== null && rawVal !== '') {
        submittedAnswers[q.id] = String(rawVal);
      }
    }

    const { gradeRelationalQuizSubmission } = await import('@/lib/curriculum/quiz-engine');
    const result = gradeRelationalQuizSubmission(
      quiz.questions,
      submittedAnswers,
      quiz.passingScore
    );

    await db.quizAttempt.create({
      data: {
        studentId: student.id,
        quizId,
        attemptNumber: previousAttempts + 1,
        score: result.score,
        percentage: result.percentage,
        passed: result.passed,
        startedAt: new Date(),
        completedAt: new Date(),
        submittedAt: new Date(),
        answers: {
          create: result.answers.map((ans) => ({
            questionId: ans.questionId,
            selectedOptionId: ans.selectedOptionId,
            isCorrect: ans.isCorrect,
            pointsAwarded: ans.pointsAwarded,
          })),
        },
      },
    });
  } else {
    // Server-side scoring for legacy topic banks / embedded JSON
    const questions = getQuizQuestions(quiz);
    const submittedAnswers: Record<string, number> = {};

    for (const q of questions) {
      const rawVal = formData.get(`question_${q.id}`);
      if (rawVal !== null && rawVal !== '') {
        submittedAnswers[q.id] = Number(rawVal);
      }
    }

    // Purely server-evaluated score
    const { score, passed } = evaluateQuizSubmission(
      questions,
      submittedAnswers,
      quiz.passingScore
    );

    await db.quizAttempt.create({
      data: {
        studentId: student.id,
        quizId,
        attemptNumber: previousAttempts + 1,
        score,
        percentage: score,
        passed,
        startedAt: new Date(),
        completedAt: new Date(),
        submittedAt: new Date(),
      },
    });
  }

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

  // Verify student is actively enrolled in this course
  const enrollment = await db.enrollment.findUnique({
    where: { studentId_courseId: { studentId: student.id, courseId } },
  });
  if (!enrollment || !['ACTIVE', 'COMPLETED'].includes(enrollment.status)) {
    redirect(`/student/courses/${courseId}`);
  }

  // Verify assignment exists and belongs to this week & course
  const assignment = await db.weeklyAssignment.findFirst({
    where: { id: assignmentId, weekId, week: { courseId } },
  });
  if (!assignment) redirect(`/student/courses/${courseId}`);

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
