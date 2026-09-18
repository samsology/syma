'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/authorization';
import { db } from '@/lib/db';
import { slugifyCourseTitle } from '@/lib/courses/options';
import { reorderSchema } from '@/lib/validation/curriculum';
import { lessonSchema } from '@/lib/validation/lesson';
import { moduleSchema } from '@/lib/validation/module';
import { resourceSchema } from '@/lib/validation/resource';
import { weekSchema } from '@/lib/validation/week';
import { summarySchema } from '@/lib/validation/summary';
import { quizSchema } from '@/lib/validation/quiz';
import { assignmentSchema } from '@/lib/validation/assignment';

export type CurriculumFormState = {
  fieldErrors?: Record<string, string[] | undefined>;
  formError?: string;
};

function refresh(courseId: string) {
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/admin/courses/${courseId}/curriculum`);
  revalidatePath('/admin/dashboard');
}

async function requireCourse(courseId: string) {
  await requireAdmin();
  const course = await db.course.findUnique({ where: { id: courseId }, select: { id: true } });
  if (!course) redirect('/admin/courses?error=not-found');
  return course;
}

async function requireWeek(courseId: string, weekId: string) {
  const week = await db.courseWeek.findFirst({ where: { id: weekId, courseId } });
  if (!week) throw new Error('Week not found.');
  return week;
}

async function requireModule(courseId: string, moduleId: string) {
  const courseModule = await db.courseModule.findFirst({
    where: { id: moduleId, week: { courseId } },
    include: { week: { select: { courseId: true } } },
  });
  if (!courseModule) throw new Error('Module not found.');
  return courseModule;
}

async function requireLesson(courseId: string, lessonId: string) {
  const lesson = await db.lesson.findFirst({
    where: { id: lessonId, module: { week: { courseId } } },
  });
  if (!lesson) throw new Error('Lesson not found.');
  return lesson;
}

export async function createWeekAction(courseId: string, _state: CurriculumFormState, formData: FormData): Promise<CurriculumFormState> {
  await requireCourse(courseId);
  const parsed = weekSchema.safeParse({
    weekNumber: formData.get('weekNumber'),
    title: formData.get('title'),
    description: formData.get('description'),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const maxSort = await db.courseWeek.aggregate({ where: { courseId }, _max: { sortOrder: true } });
  try {
    await db.courseWeek.create({
      data: {
        courseId,
        weekNumber: parsed.data.weekNumber,
        title: parsed.data.title,
        description: parsed.data.description,
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      },
    });
    refresh(courseId);
    return {};
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { fieldErrors: { weekNumber: ['A week with this number already exists.'] } };
    }
    return { formError: 'Unable to save week.' };
  }
}

export async function updateWeekAction(courseId: string, weekId: string, _state: CurriculumFormState, formData: FormData): Promise<CurriculumFormState> {
  await requireCourse(courseId);
  const parsed = weekSchema.safeParse({
    weekNumber: formData.get('weekNumber'),
    title: formData.get('title'),
    description: formData.get('description'),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await requireWeek(courseId, weekId);
    await db.courseWeek.update({
      where: { id: weekId },
      data: {
        weekNumber: parsed.data.weekNumber,
        title: parsed.data.title,
        description: parsed.data.description,
      },
    });
    refresh(courseId);
    return {};
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { fieldErrors: { weekNumber: ['A week with this number already exists.'] } };
    }
    return { formError: error instanceof Error ? error.message : 'Unable to update week.' };
  }
}

export async function deleteWeekAction(formData: FormData) {
  const courseId = String(formData.get('courseId') ?? '');
  const weekId = String(formData.get('weekId') ?? '');
  await requireCourse(courseId);
  await requireWeek(courseId, weekId);

  await db.$transaction(async (tx) => {
    await tx.courseWeek.delete({ where: { id: weekId } });
    const remainingWeeks = await tx.courseWeek.findMany({
      where: { courseId },
      orderBy: { sortOrder: 'asc' },
    });
    for (let i = 0; i < remainingWeeks.length; i++) {
      if (remainingWeeks[i].sortOrder !== i + 1) {
        await tx.courseWeek.update({
          where: { id: remainingWeeks[i].id },
          data: { sortOrder: i + 1 },
        });
      }
    }
  });

  refresh(courseId);
}

export async function createModuleAction(courseId: string, weekId: string, _state: CurriculumFormState, formData: FormData): Promise<CurriculumFormState> {
  await requireCourse(courseId);
  const parsed = moduleSchema.safeParse({ title: formData.get('title'), description: formData.get('description') });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await requireWeek(courseId, weekId);
    const maxSort = await db.courseModule.aggregate({ where: { weekId }, _max: { sortOrder: true } });
    await db.courseModule.create({
      data: { weekId, title: parsed.data.title, description: parsed.data.description, sortOrder: (maxSort._max.sortOrder ?? 0) + 1 },
    });
    refresh(courseId);
    return {};
  } catch (error) {
    return { formError: error instanceof Error ? error.message : 'Unable to save module.' };
  }
}

export async function updateModuleAction(courseId: string, moduleId: string, _state: CurriculumFormState, formData: FormData): Promise<CurriculumFormState> {
  await requireCourse(courseId);
  const parsed = moduleSchema.safeParse({ title: formData.get('title'), description: formData.get('description') });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await requireModule(courseId, moduleId);
    await db.courseModule.update({ where: { id: moduleId }, data: { title: parsed.data.title, description: parsed.data.description } });
    refresh(courseId);
    return {};
  } catch (error) {
    return { formError: error instanceof Error ? error.message : 'Unable to update module.' };
  }
}

export async function deleteModuleAction(formData: FormData) {
  const courseId = String(formData.get('courseId') ?? '');
  const moduleId = String(formData.get('moduleId') ?? '');
  await requireCourse(courseId);
  const targetModule = await requireModule(courseId, moduleId);

  await db.$transaction(async (tx) => {
    await tx.courseModule.delete({ where: { id: moduleId } });
    const remaining = await tx.courseModule.findMany({
      where: { weekId: targetModule.weekId },
      orderBy: { sortOrder: 'asc' },
    });
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].sortOrder !== i + 1) {
        await tx.courseModule.update({
          where: { id: remaining[i].id },
          data: { sortOrder: i + 1 },
        });
      }
    }
  });

  refresh(courseId);
}

export async function createLessonAction(courseId: string, moduleId: string, _state: CurriculumFormState, formData: FormData): Promise<CurriculumFormState> {
  await requireCourse(courseId);
  const parsed = lessonSchema.safeParse({
    title: formData.get('title'),
    slug: String(formData.get('slug') || slugifyCourseTitle(String(formData.get('title') ?? ''))).toLowerCase(),
    lessonType: formData.get('lessonType'),
    resourceType: formData.get('resourceType') || 'VIDEO',
    slideUrl: formData.get('slideUrl') || '',
    content: formData.get('content') || 'Lesson content',
    videoUrl: formData.get('videoUrl'),
    duration: formData.get('duration') || undefined,
    isPreview: formData.get('isPreview') === 'on',
    status: formData.get('status'),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await requireModule(courseId, moduleId);
    const maxSort = await db.lesson.aggregate({ where: { moduleId }, _max: { sortOrder: true } });
    await db.lesson.create({
      data: {
        moduleId,
        title: parsed.data.title,
        slug: parsed.data.slug,
        lessonType: parsed.data.lessonType,
        resourceType: parsed.data.resourceType,
        slideUrl: parsed.data.slideUrl || null,
        content: parsed.data.content,
        videoUrl: parsed.data.videoUrl || null,
        duration: parsed.data.duration === '' ? null : parsed.data.duration,
        isPreview: parsed.data.isPreview,
        status: parsed.data.status,
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      },
    });
    refresh(courseId);
    return {};
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { fieldErrors: { slug: ['A lesson with this slug already exists in this module.'] } };
    }
    return { formError: error instanceof Error ? error.message : 'Unable to save lesson.' };
  }
}

export async function updateLessonAction(courseId: string, lessonId: string, _state: CurriculumFormState, formData: FormData): Promise<CurriculumFormState> {
  await requireCourse(courseId);
  const parsed = lessonSchema.safeParse({
    title: formData.get('title'),
    slug: String(formData.get('slug') ?? '').toLowerCase(),
    lessonType: formData.get('lessonType'),
    resourceType: formData.get('resourceType') || 'VIDEO',
    slideUrl: formData.get('slideUrl') || '',
    content: formData.get('content'),
    videoUrl: formData.get('videoUrl'),
    duration: formData.get('duration') || undefined,
    isPreview: formData.get('isPreview') === 'on',
    status: formData.get('status'),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await requireLesson(courseId, lessonId);
    await db.lesson.update({
      where: { id: lessonId },
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        lessonType: parsed.data.lessonType,
        resourceType: parsed.data.resourceType,
        slideUrl: parsed.data.slideUrl || null,
        content: parsed.data.content,
        videoUrl: parsed.data.videoUrl || null,
        duration: parsed.data.duration === '' ? null : parsed.data.duration,
        isPreview: parsed.data.isPreview,
        status: parsed.data.status,
      },
    });
    refresh(courseId);
    redirect(`/admin/courses/${courseId}/curriculum?success=lesson-updated`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { fieldErrors: { slug: ['A lesson with this slug already exists in this module.'] } };
    }
    return { formError: error instanceof Error ? error.message : 'Unable to update lesson.' };
  }
}

export async function deleteLessonAction(formData: FormData) {
  const courseId = String(formData.get('courseId') ?? '');
  const lessonId = String(formData.get('lessonId') ?? '');
  await requireCourse(courseId);
  const targetLesson = await requireLesson(courseId, lessonId);

  await db.$transaction(async (tx) => {
    await tx.lesson.delete({ where: { id: lessonId } });
    const remaining = await tx.lesson.findMany({
      where: { moduleId: targetLesson.moduleId },
      orderBy: { sortOrder: 'asc' },
    });
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].sortOrder !== i + 1) {
        await tx.lesson.update({
          where: { id: remaining[i].id },
          data: { sortOrder: i + 1 },
        });
      }
    }
  });

  refresh(courseId);
}

export async function createResourceAction(courseId: string, lessonId: string, _state: CurriculumFormState, formData: FormData): Promise<CurriculumFormState> {
  await requireCourse(courseId);
  const parsed = resourceSchema.safeParse({
    name: formData.get('name'),
    fileUrl: formData.get('fileUrl'),
    fileType: formData.get('fileType'),
    fileSize: formData.get('fileSize') || undefined,
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await requireLesson(courseId, lessonId);
    await db.lessonResource.create({
      data: {
        lessonId,
        name: parsed.data.name,
        fileUrl: parsed.data.fileUrl,
        fileType: parsed.data.fileType.toLowerCase(),
        fileSize: parsed.data.fileSize === '' ? null : parsed.data.fileSize,
      },
    });
    refresh(courseId);
    return {};
  } catch (error) {
    return { formError: error instanceof Error ? error.message : 'Unable to save resource.' };
  }
}

export async function updateResourceAction(
  courseId: string,
  resourceId: string,
  _state: CurriculumFormState,
  formData: FormData
): Promise<CurriculumFormState> {
  await requireCourse(courseId);
  const parsed = resourceSchema.safeParse({
    name: formData.get('name'),
    fileUrl: formData.get('fileUrl'),
    fileType: formData.get('fileType'),
    fileSize: formData.get('fileSize') || undefined,
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    const resource = await db.lessonResource.findFirst({
      where: { id: resourceId, lesson: { module: { week: { courseId } } } },
    });
    if (!resource) throw new Error('Resource not found.');

    await db.lessonResource.update({
      where: { id: resourceId },
      data: {
        name: parsed.data.name,
        fileUrl: parsed.data.fileUrl,
        fileType: parsed.data.fileType.toLowerCase(),
        fileSize: parsed.data.fileSize === '' ? null : parsed.data.fileSize,
      },
    });
    refresh(courseId);
    return {};
  } catch (error) {
    return { formError: error instanceof Error ? error.message : 'Unable to update resource.' };
  }
}

export async function deleteResourceAction(formData: FormData) {
  const courseId = String(formData.get('courseId') ?? '');
  const resourceId = String(formData.get('resourceId') ?? '');
  await requireCourse(courseId);
  const resource = await db.lessonResource.findFirst({ where: { id: resourceId, lesson: { module: { week: { courseId } } } } });
  if (!resource) throw new Error('Resource not found.');
  await db.lessonResource.delete({ where: { id: resourceId } });
  refresh(courseId);
}

async function moveItem<T extends { id: string; sortOrder: number }>(items: T[], itemId: string, direction: 'up' | 'down') {
  const index = items.findIndex((item) => item.id === itemId);
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || swapIndex < 0 || swapIndex >= items.length) return null;
  return [items[index], items[swapIndex]] as const;
}

export async function moveWeekAction(formData: FormData) {
  const courseId = String(formData.get('courseId') ?? '');
  const weekId = String(formData.get('weekId') ?? '');
  const parsed = reorderSchema.parse({ direction: formData.get('direction') });
  await requireCourse(courseId);
  const weeks = await db.courseWeek.findMany({ where: { courseId }, orderBy: { sortOrder: 'asc' } });
  const pair = await moveItem(weeks, weekId, parsed.direction);
  if (pair) await db.$transaction(pair.map((week, index) => db.courseWeek.update({ where: { id: week.id }, data: { sortOrder: pair[1 - index].sortOrder } })));
  refresh(courseId);
}

export async function moveModuleAction(formData: FormData) {
  const courseId = String(formData.get('courseId') ?? '');
  const moduleId = String(formData.get('moduleId') ?? '');
  const parsed = reorderSchema.parse({ direction: formData.get('direction') });
  await requireCourse(courseId);
  const courseModule = await requireModule(courseId, moduleId);
  const modules = await db.courseModule.findMany({ where: { weekId: courseModule.weekId }, orderBy: { sortOrder: 'asc' } });
  const pair = await moveItem(modules, moduleId, parsed.direction);
  if (pair) await db.$transaction(pair.map((item, index) => db.courseModule.update({ where: { id: item.id }, data: { sortOrder: pair[1 - index].sortOrder } })));
  refresh(courseId);
}

export async function moveLessonAction(formData: FormData) {
  const courseId = String(formData.get('courseId') ?? '');
  const lessonId = String(formData.get('lessonId') ?? '');
  const parsed = reorderSchema.parse({ direction: formData.get('direction') });
  await requireCourse(courseId);
  const lesson = await requireLesson(courseId, lessonId);
  const lessons = await db.lesson.findMany({ where: { moduleId: lesson.moduleId }, orderBy: { sortOrder: 'asc' } });
  const pair = await moveItem(lessons, lessonId, parsed.direction);
  if (pair) await db.$transaction(pair.map((item, index) => db.lesson.update({ where: { id: item.id }, data: { sortOrder: pair[1 - index].sortOrder } })));
  refresh(courseId);
}

export async function upsertModuleSummaryAction(courseId: string, moduleId: string, _state: CurriculumFormState, formData: FormData): Promise<CurriculumFormState> {
  await requireCourse(courseId);
  const parsed = summarySchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    content: formData.get('content'),
    resourceType: formData.get('resourceType') || 'SLIDE',
    resourceUrl: formData.get('resourceUrl'),
    duration: formData.get('duration') || undefined,
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await requireModule(courseId, moduleId);
    await db.moduleSummary.upsert({
      where: { moduleId },
      create: {
        moduleId,
        title: parsed.data.title,
        description: parsed.data.description || null,
        content: parsed.data.content || null,
        resourceType: parsed.data.resourceType,
        resourceUrl: parsed.data.resourceUrl || null,
        duration: parsed.data.duration === '' ? null : parsed.data.duration,
      },
      update: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        content: parsed.data.content || null,
        resourceType: parsed.data.resourceType,
        resourceUrl: parsed.data.resourceUrl || null,
        duration: parsed.data.duration === '' ? null : parsed.data.duration,
      },
    });
    refresh(courseId);
    return {};
  } catch (error) {
    return { formError: error instanceof Error ? error.message : 'Unable to save module summary.' };
  }
}

export async function deleteModuleSummaryAction(formData: FormData) {
  const courseId = String(formData.get('courseId') ?? '');
  const moduleId = String(formData.get('moduleId') ?? '');
  await requireCourse(courseId);
  await requireModule(courseId, moduleId);
  await db.moduleSummary.deleteMany({ where: { moduleId } });
  refresh(courseId);
}

export async function upsertModuleQuizAction(courseId: string, moduleId: string, _state: CurriculumFormState, formData: FormData): Promise<CurriculumFormState> {
  await requireCourse(courseId);
  const parsed = quizSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    instructions: formData.get('instructions'),
    passingScore: formData.get('passingScore'),
    maxAttempts: formData.get('maxAttempts'),
    timeLimitMinutes: formData.get('timeLimitMinutes') || undefined,
    status: formData.get('status'),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await requireModule(courseId, moduleId);
    await db.moduleQuiz.upsert({
      where: { moduleId },
      create: {
        moduleId,
        title: parsed.data.title,
        description: parsed.data.description || null,
        instructions: parsed.data.instructions || null,
        passingScore: parsed.data.passingScore,
        maxAttempts: parsed.data.maxAttempts,
        timeLimitMinutes: parsed.data.timeLimitMinutes === '' ? null : parsed.data.timeLimitMinutes,
        status: parsed.data.status,
      },
      update: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        instructions: parsed.data.instructions || null,
        passingScore: parsed.data.passingScore,
        maxAttempts: parsed.data.maxAttempts,
        timeLimitMinutes: parsed.data.timeLimitMinutes === '' ? null : parsed.data.timeLimitMinutes,
        status: parsed.data.status,
      },
    });
    refresh(courseId);
    return {};
  } catch (error) {
    return { formError: error instanceof Error ? error.message : 'Unable to save module quiz.' };
  }
}

export async function deleteModuleQuizAction(formData: FormData) {
  const courseId = String(formData.get('courseId') ?? '');
  const moduleId = String(formData.get('moduleId') ?? '');
  await requireCourse(courseId);
  await requireModule(courseId, moduleId);
  await db.moduleQuiz.deleteMany({ where: { moduleId } });
  refresh(courseId);
}

export async function upsertWeeklyAssignmentAction(courseId: string, weekId: string, _state: CurriculumFormState, formData: FormData): Promise<CurriculumFormState> {
  await requireCourse(courseId);
  const parsed = assignmentSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    instructions: formData.get('instructions'),
    submissionType: formData.get('submissionType') || 'FILE_OR_TEXT',
    submissionRequirements: formData.get('submissionRequirements'),
    datasetUrl: formData.get('datasetUrl'),
    datasetName: formData.get('datasetName'),
    dueDateDays: formData.get('dueDateDays') || undefined,
    status: formData.get('status'),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await requireWeek(courseId, weekId);
    await db.weeklyAssignment.upsert({
      where: { weekId },
      create: {
        weekId,
        title: parsed.data.title,
        description: parsed.data.description,
        instructions: parsed.data.instructions,
        submissionType: parsed.data.submissionType,
        submissionRequirements: parsed.data.submissionRequirements || null,
        datasetUrl: parsed.data.datasetUrl || null,
        datasetName: parsed.data.datasetName || null,
        dueDateDays: parsed.data.dueDateDays === '' ? null : parsed.data.dueDateDays,
        status: parsed.data.status,
      },
      update: {
        title: parsed.data.title,
        description: parsed.data.description,
        instructions: parsed.data.instructions,
        submissionType: parsed.data.submissionType,
        submissionRequirements: parsed.data.submissionRequirements || null,
        datasetUrl: parsed.data.datasetUrl || null,
        datasetName: parsed.data.datasetName || null,
        dueDateDays: parsed.data.dueDateDays === '' ? null : parsed.data.dueDateDays,
        status: parsed.data.status,
      },
    });
    refresh(courseId);
    return {};
  } catch (error) {
    return { formError: error instanceof Error ? error.message : 'Unable to save weekly assignment.' };
  }
}

export async function deleteWeeklyAssignmentAction(formData: FormData) {
  const courseId = String(formData.get('courseId') ?? '');
  const weekId = String(formData.get('weekId') ?? '');
  await requireCourse(courseId);
  await requireWeek(courseId, weekId);
  await db.weeklyAssignment.deleteMany({ where: { weekId } });
  refresh(courseId);
}

