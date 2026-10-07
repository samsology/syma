'use server';

import { Prisma, QuizQuestion, QuizOption } from '@prisma/client';
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
import { quizSchema, quizQuestionSchema } from '@/lib/validation/quiz';
import { assignmentSchema } from '@/lib/validation/assignment';

export type CurriculumFormState = {
  success?: boolean;
  quizId?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  formError?: string;
  question?: QuizQuestion & { options: QuizOption[] };
};

function refresh(courseId: string) {
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/admin/courses/${courseId}/curriculum`);
  revalidatePath(`/admin/courses/${courseId}/curriculum`, 'page');
  revalidatePath('/admin/dashboard');
}

function sanitizeUrl(val: unknown): string {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
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

export async function createWeekAction(
  courseId: string,
  _state: CurriculumFormState,
  formData: FormData
): Promise<CurriculumFormState> {
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
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { fieldErrors: { weekNumber: ['A week with this number already exists.'] } };
    }
    return { formError: 'Unable to save week.' };
  }
}

export async function updateWeekAction(
  courseId: string,
  weekId: string,
  _state: CurriculumFormState,
  formData: FormData
): Promise<CurriculumFormState> {
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
    return { success: true };
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

export async function createModuleAction(
  courseId: string,
  weekId: string,
  _state: CurriculumFormState,
  formData: FormData
): Promise<CurriculumFormState> {
  await requireCourse(courseId);
  const parsed = moduleSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await requireWeek(courseId, weekId);
    const maxSort = await db.courseModule.aggregate({
      where: { weekId },
      _max: { sortOrder: true },
    });
    await db.courseModule.create({
      data: {
        weekId,
        title: parsed.data.title,
        description: parsed.data.description,
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      },
    });
    refresh(courseId);
    return { success: true };
  } catch (error) {
    return { formError: error instanceof Error ? error.message : 'Unable to save module.' };
  }
}

export async function updateModuleAction(
  courseId: string,
  moduleId: string,
  _state: CurriculumFormState,
  formData: FormData
): Promise<CurriculumFormState> {
  await requireCourse(courseId);
  const parsed = moduleSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await requireModule(courseId, moduleId);
    await db.courseModule.update({
      where: { id: moduleId },
      data: { title: parsed.data.title, description: parsed.data.description },
    });
    refresh(courseId);
    return { success: true };
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

export async function createLessonAction(
  courseId: string,
  moduleId: string,
  _state: CurriculumFormState,
  formData: FormData
): Promise<CurriculumFormState> {
  await requireCourse(courseId);
  const rawTitle = String(formData.get('title') ?? '').trim();
  const rawSlug = String(formData.get('slug') ?? '').trim();
  const rawContent = String(formData.get('content') ?? '').trim();
  const rawDuration = formData.get('duration');

  const baseSlug = slugifyCourseTitle(rawSlug || rawTitle || 'lesson') || 'lesson';

  const parsed = lessonSchema.safeParse({
    title: rawTitle,
    slug: baseSlug,
    lessonType: formData.get('lessonType') || 'TEXT',
    resourceType: formData.get('resourceType') || 'VIDEO',
    slideUrl: sanitizeUrl(formData.get('slideUrl')),
    content: rawContent || 'Lesson content',
    videoUrl: sanitizeUrl(formData.get('videoUrl')),
    duration: rawDuration === '' || rawDuration === null ? undefined : rawDuration,
    isPreview: formData.get('isPreview') === 'on' || formData.get('isPreview') === 'true',
    status: formData.get('status') || 'DRAFT',
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await requireModule(courseId, moduleId);

    // Auto-disambiguate slug if already exists in module
    let finalSlug = parsed.data.slug;
    let counter = 1;
    while (
      await db.lesson.findUnique({ where: { moduleId_slug: { moduleId, slug: finalSlug } } })
    ) {
      counter++;
      finalSlug = `${baseSlug}-${counter}`;
    }

    const maxSort = await db.lesson.aggregate({ where: { moduleId }, _max: { sortOrder: true } });
    await db.lesson.create({
      data: {
        moduleId,
        title: parsed.data.title,
        slug: finalSlug,
        lessonType: parsed.data.lessonType,
        resourceType: parsed.data.resourceType,
        slideUrl: parsed.data.slideUrl || null,
        content: parsed.data.content,
        videoUrl: parsed.data.videoUrl || null,
        duration: typeof parsed.data.duration === 'number' ? parsed.data.duration : null,
        isPreview: parsed.data.isPreview,
        status: parsed.data.status,
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      },
    });
    refresh(courseId);
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { fieldErrors: { slug: ['A lesson with this slug already exists in this module.'] } };
    }
    return { formError: error instanceof Error ? error.message : 'Unable to save lesson.' };
  }
}

export async function updateLessonAction(
  courseId: string,
  lessonId: string,
  _state: CurriculumFormState,
  formData: FormData
): Promise<CurriculumFormState> {
  await requireCourse(courseId);
  const rawTitle = String(formData.get('title') ?? '').trim();
  const rawSlug = String(formData.get('slug') ?? '').trim();
  const rawContent = String(formData.get('content') ?? '').trim();
  const rawDuration = formData.get('duration');

  const parsed = lessonSchema.safeParse({
    title: rawTitle,
    slug: rawSlug.toLowerCase(),
    lessonType: formData.get('lessonType') || 'TEXT',
    resourceType: formData.get('resourceType') || 'VIDEO',
    slideUrl: sanitizeUrl(formData.get('slideUrl')),
    content: rawContent || 'Lesson content',
    videoUrl: sanitizeUrl(formData.get('videoUrl')),
    duration: rawDuration === '' || rawDuration === null ? undefined : rawDuration,
    isPreview: formData.get('isPreview') === 'on' || formData.get('isPreview') === 'true',
    status: formData.get('status') || 'DRAFT',
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
        duration: typeof parsed.data.duration === 'number' ? parsed.data.duration : null,
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

export async function createResourceAction(
  courseId: string,
  lessonId: string,
  _state: CurriculumFormState,
  formData: FormData
): Promise<CurriculumFormState> {
  await requireCourse(courseId);
  const isDownloadableRaw = formData.get('isDownloadable');
  const isActiveRaw = formData.get('isActive');

  const parsed = resourceSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    resourceType: formData.get('resourceType') || 'FILE',
    sourceType: formData.get('sourceType') || 'EXTERNAL',
    fileUrl: formData.get('fileUrl'),
    fileType: formData.get('fileType'),
    fileSize: formData.get('fileSize') || undefined,
    sortOrder: formData.get('sortOrder') || undefined,
    isDownloadable:
      isDownloadableRaw !== null
        ? isDownloadableRaw === 'true' || isDownloadableRaw === 'on'
        : true,
    isActive: isActiveRaw !== null ? isActiveRaw === 'true' || isActiveRaw === 'on' : true,
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await requireLesson(courseId, lessonId);

    let sortOrder = parsed.data.sortOrder ?? 0;
    if (!formData.get('sortOrder')) {
      const count = await db.lessonResource.count({ where: { lessonId } });
      sortOrder = count;
    }

    await db.lessonResource.create({
      data: {
        lessonId,
        name: parsed.data.name,
        description: parsed.data.description || null,
        resourceType: parsed.data.resourceType,
        sourceType: parsed.data.sourceType,
        fileUrl: parsed.data.fileUrl,
        fileType: parsed.data.fileType.toLowerCase(),
        fileSize: parsed.data.fileSize === '' ? null : parsed.data.fileSize,
        sortOrder,
        isDownloadable: parsed.data.isDownloadable ?? true,
        isActive: parsed.data.isActive ?? true,
      },
    });
    refresh(courseId);
    return { success: true };
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
  const isDownloadableRaw = formData.get('isDownloadable');
  const isActiveRaw = formData.get('isActive');

  const parsed = resourceSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    resourceType: formData.get('resourceType') || 'FILE',
    sourceType: formData.get('sourceType') || 'EXTERNAL',
    fileUrl: formData.get('fileUrl'),
    fileType: formData.get('fileType'),
    fileSize: formData.get('fileSize') || undefined,
    sortOrder: formData.get('sortOrder') || undefined,
    isDownloadable:
      isDownloadableRaw !== null
        ? isDownloadableRaw === 'true' || isDownloadableRaw === 'on'
        : true,
    isActive: isActiveRaw !== null ? isActiveRaw === 'true' || isActiveRaw === 'on' : true,
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
        description: parsed.data.description || null,
        resourceType: parsed.data.resourceType,
        sourceType: parsed.data.sourceType,
        fileUrl: parsed.data.fileUrl,
        fileType: parsed.data.fileType.toLowerCase(),
        fileSize: parsed.data.fileSize === '' ? null : parsed.data.fileSize,
        sortOrder: parsed.data.sortOrder ?? resource.sortOrder,
        isDownloadable: parsed.data.isDownloadable ?? true,
        isActive: parsed.data.isActive ?? true,
      },
    });
    refresh(courseId);
    return { success: true };
  } catch (error) {
    return { formError: error instanceof Error ? error.message : 'Unable to update resource.' };
  }
}

export async function deleteResourceAction(formData: FormData) {
  const courseId = String(formData.get('courseId') ?? '');
  const resourceId = String(formData.get('resourceId') ?? '');
  await requireCourse(courseId);
  const resource = await db.lessonResource.findFirst({
    where: { id: resourceId, lesson: { module: { week: { courseId } } } },
  });
  if (!resource) throw new Error('Resource not found.');
  await db.lessonResource.delete({ where: { id: resourceId } });
  refresh(courseId);
}

export async function moveResourceAction(formData: FormData) {
  const courseId = String(formData.get('courseId') ?? '');
  const resourceId = String(formData.get('resourceId') ?? '');
  const parsed = reorderSchema.parse({ direction: formData.get('direction') });
  await requireCourse(courseId);
  const resource = await db.lessonResource.findFirst({
    where: { id: resourceId, lesson: { module: { week: { courseId } } } },
    select: { lessonId: true },
  });
  if (!resource) throw new Error('Resource not found.');
  const resources = await db.lessonResource.findMany({
    where: { lessonId: resource.lessonId },
    orderBy: { sortOrder: 'asc' },
  });
  const pair = await moveItem(resources, resourceId, parsed.direction);
  if (pair) {
    await db.$transaction(
      pair.map((item, index) =>
        db.lessonResource.update({
          where: { id: item.id },
          data: { sortOrder: pair[1 - index].sortOrder },
        })
      )
    );
  }
  refresh(courseId);
}

async function moveItem<T extends { id: string; sortOrder: number }>(
  items: T[],
  itemId: string,
  direction: 'up' | 'down'
) {
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
  const weeks = await db.courseWeek.findMany({
    where: { courseId },
    orderBy: { sortOrder: 'asc' },
  });
  const pair = await moveItem(weeks, weekId, parsed.direction);
  if (pair)
    await db.$transaction(
      pair.map((week, index) =>
        db.courseWeek.update({
          where: { id: week.id },
          data: { sortOrder: pair[1 - index].sortOrder },
        })
      )
    );
  refresh(courseId);
}

export async function moveModuleAction(formData: FormData) {
  const courseId = String(formData.get('courseId') ?? '');
  const moduleId = String(formData.get('moduleId') ?? '');
  const parsed = reorderSchema.parse({ direction: formData.get('direction') });
  await requireCourse(courseId);
  const courseModule = await requireModule(courseId, moduleId);
  const modules = await db.courseModule.findMany({
    where: { weekId: courseModule.weekId },
    orderBy: { sortOrder: 'asc' },
  });
  const pair = await moveItem(modules, moduleId, parsed.direction);
  if (pair)
    await db.$transaction(
      pair.map((item, index) =>
        db.courseModule.update({
          where: { id: item.id },
          data: { sortOrder: pair[1 - index].sortOrder },
        })
      )
    );
  refresh(courseId);
}

export async function moveLessonAction(formData: FormData) {
  const courseId = String(formData.get('courseId') ?? '');
  const lessonId = String(formData.get('lessonId') ?? '');
  const parsed = reorderSchema.parse({ direction: formData.get('direction') });
  await requireCourse(courseId);
  const lesson = await requireLesson(courseId, lessonId);
  const lessons = await db.lesson.findMany({
    where: { moduleId: lesson.moduleId },
    orderBy: { sortOrder: 'asc' },
  });
  const pair = await moveItem(lessons, lessonId, parsed.direction);
  if (pair)
    await db.$transaction(
      pair.map((item, index) =>
        db.lesson.update({ where: { id: item.id }, data: { sortOrder: pair[1 - index].sortOrder } })
      )
    );
  refresh(courseId);
}

export async function upsertModuleSummaryAction(
  courseId: string,
  moduleId: string,
  _state: CurriculumFormState,
  formData: FormData
): Promise<CurriculumFormState> {
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
    return { success: true };
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

export async function upsertModuleQuizAction(
  courseIdOrState: string | CurriculumFormState,
  moduleIdOrFormData: string | FormData,
  maybeState?: CurriculumFormState,
  maybeFormData?: FormData
): Promise<CurriculumFormState> {
  let courseId: string;
  let moduleId: string;
  let formData: FormData;

  if (
    typeof courseIdOrState === 'string' &&
    typeof moduleIdOrFormData === 'string' &&
    maybeFormData instanceof FormData
  ) {
    courseId = courseIdOrState;
    moduleId = moduleIdOrFormData;
    formData = maybeFormData;
  } else if (moduleIdOrFormData instanceof FormData) {
    formData = moduleIdOrFormData;
    courseId = String(formData.get('courseId') ?? '');
    moduleId = String(formData.get('moduleId') ?? '');
  } else {
    return { formError: 'Invalid request parameters.' };
  }

  if (!courseId || !moduleId) {
    return { formError: 'Missing course or module reference.' };
  }

  await requireCourse(courseId);

  const rawTitle = formData.get('title');
  const rawDesc = formData.get('description');
  const rawInst = formData.get('instructions');
  const rawPass = formData.get('passingScore');
  const rawMax = formData.get('maxAttempts');
  const rawTime = formData.get('timeLimitMinutes');
  const rawStatus = formData.get('status');

  const timeLimitMinutes =
    rawTime !== null && String(rawTime).trim() !== '' ? rawTime : undefined;

  const parsed = quizSchema.safeParse({
    title: rawTitle !== null && rawTitle !== undefined ? String(rawTitle) : undefined,
    description: rawDesc !== null && rawDesc !== undefined && String(rawDesc).trim() !== '' ? String(rawDesc) : undefined,
    instructions: rawInst !== null && rawInst !== undefined && String(rawInst).trim() !== '' ? String(rawInst) : undefined,
    passingScore: rawPass !== null && rawPass !== undefined && String(rawPass).trim() !== '' ? rawPass : undefined,
    maxAttempts: rawMax !== null && rawMax !== undefined && String(rawMax).trim() !== '' ? rawMax : undefined,
    timeLimitMinutes,
    randomizeQuestions:
      formData.get('randomizeQuestions') === 'true' || formData.get('randomizeQuestions') === 'on',
    randomizeOptions:
      formData.get('randomizeOptions') === 'true' || formData.get('randomizeOptions') === 'on',
    showResults:
      formData.get('showResults') === 'true' ||
      formData.get('showResults') === 'on' ||
      (formData.get('showResults') !== 'false' && formData.get('showResults') !== 'off' && formData.get('showResults') !== null),
    showExplanations:
      formData.get('showExplanations') === 'true' ||
      formData.get('showExplanations') === 'on' ||
      (formData.get('showExplanations') !== 'false' && formData.get('showExplanations') !== 'off' && formData.get('showExplanations') !== null),
    status: rawStatus !== null && rawStatus !== undefined && String(rawStatus).trim() !== '' ? String(rawStatus) : 'DRAFT',
  });

  if (!parsed.success) {
    return {
      formError: 'Unable to save quiz. Please correct the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await requireModule(courseId, moduleId);
    const savedQuiz = await db.moduleQuiz.upsert({
      where: { moduleId },
      create: {
        moduleId,
        title: parsed.data.title,
        description: parsed.data.description || null,
        instructions: parsed.data.instructions || null,
        passingScore: parsed.data.passingScore,
        maxAttempts: parsed.data.maxAttempts,
        timeLimitMinutes:
          parsed.data.timeLimitMinutes === '' || parsed.data.timeLimitMinutes === undefined || parsed.data.timeLimitMinutes === null
            ? null
            : Number(parsed.data.timeLimitMinutes),
        randomizeQuestions: parsed.data.randomizeQuestions,
        randomizeOptions: parsed.data.randomizeOptions,
        showResults: parsed.data.showResults,
        showExplanations: parsed.data.showExplanations,
        status: parsed.data.status,
      },
      update: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        instructions: parsed.data.instructions || null,
        passingScore: parsed.data.passingScore,
        maxAttempts: parsed.data.maxAttempts,
        timeLimitMinutes:
          parsed.data.timeLimitMinutes === '' || parsed.data.timeLimitMinutes === undefined || parsed.data.timeLimitMinutes === null
            ? null
            : Number(parsed.data.timeLimitMinutes),
        randomizeQuestions: parsed.data.randomizeQuestions,
        randomizeOptions: parsed.data.randomizeOptions,
        showResults: parsed.data.showResults,
        showExplanations: parsed.data.showExplanations,
        status: parsed.data.status,
      },
    });
    refresh(courseId);
    return { success: true, quizId: savedQuiz.id };
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

export async function saveQuizQuestionAction(
  courseId: string,
  quizId: string,
  questionId: string | null,
  _state: CurriculumFormState,
  formData: FormData
): Promise<CurriculumFormState> {
  await requireCourse(courseId);

  const questionText = String(formData.get('questionText') ?? '').trim();
  const points = Number(formData.get('points') ?? 1);
  const hint = String(formData.get('hint') ?? '').trim();
  const explanation = String(formData.get('explanation') ?? '').trim();
  const correctOptionIndex = Number(formData.get('correctOptionIndex') ?? 0);

  const rawOptionsJson = formData.get('optionsJson');
  let rawOptions: Array<{ id?: string; optionText: string; isCorrect: boolean; order: number }> =
    [];

  if (rawOptionsJson && typeof rawOptionsJson === 'string') {
    try {
      rawOptions = JSON.parse(rawOptionsJson);
    } catch {
      return { formError: 'Invalid options payload format.' };
    }
  } else {
    let i = 0;
    while (formData.has(`optionText_${i}`)) {
      const text = String(formData.get(`optionText_${i}`) ?? '').trim();
      const optId = formData.get(`optionId_${i}`)
        ? String(formData.get(`optionId_${i}`))
        : undefined;
      rawOptions.push({
        id: optId,
        optionText: text,
        isCorrect: i === correctOptionIndex,
        order: i,
      });
      i++;
    }
  }

  const parsed = quizQuestionSchema.safeParse({
    id: questionId || undefined,
    questionText,
    points,
    hint: hint || undefined,
    explanation: explanation || undefined,
    options: rawOptions,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const quiz = await db.moduleQuiz.findFirst({
      where: { id: quizId, module: { week: { courseId } } },
    });
    if (!quiz) return { formError: 'Quiz not found.' };

    let savedQuestionId = questionId;

    if (questionId) {
      await db.$transaction(async (tx) => {
        await tx.quizQuestion.update({
          where: { id: questionId },
          data: {
            questionText: parsed.data.questionText,
            points: parsed.data.points,
            hint: parsed.data.hint || null,
            explanation: parsed.data.explanation || null,
          },
        });

        await tx.quizOption.deleteMany({ where: { questionId } });
        await tx.quizOption.createMany({
          data: parsed.data.options.map((opt, idx) => ({
            questionId,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            order: idx,
          })),
        });
      });
    } else {
      const maxOrder = await db.quizQuestion.aggregate({
        where: { quizId },
        _max: { order: true },
      });
      const nextOrder = (maxOrder._max.order ?? -1) + 1;

      const created = await db.quizQuestion.create({
        data: {
          quizId,
          questionText: parsed.data.questionText,
          points: parsed.data.points,
          hint: parsed.data.hint || null,
          explanation: parsed.data.explanation || null,
          order: nextOrder,
          options: {
            create: parsed.data.options.map((opt, idx) => ({
              optionText: opt.optionText,
              isCorrect: opt.isCorrect,
              order: idx,
            })),
          },
        },
      });
      savedQuestionId = created.id;
    }

    const saved = savedQuestionId
      ? await db.quizQuestion.findUnique({
          where: { id: savedQuestionId },
          include: { options: { orderBy: { order: 'asc' } } },
        })
      : null;

    refresh(courseId);
    return {
      success: true,
      question: saved ? JSON.parse(JSON.stringify(saved)) : undefined,
    };
  } catch (error) {
    return { formError: error instanceof Error ? error.message : 'Unable to save question.' };
  }
}

export async function deleteQuizQuestionAction(courseId: string, questionId: string) {
  await requireCourse(courseId);
  const question = await db.quizQuestion.findFirst({
    where: { id: questionId, quiz: { module: { week: { courseId } } } },
  });
  if (!question) throw new Error('Question not found.');

  await db.quizQuestion.delete({ where: { id: questionId } });
  refresh(courseId);
}

export async function moveQuizQuestionAction(formData: FormData) {
  const courseId = String(formData.get('courseId') ?? '');
  const quizId = String(formData.get('quizId') ?? '');
  const questionId = String(formData.get('questionId') ?? '');
  const direction = String(formData.get('direction') ?? '').toLowerCase() === 'up' ? 'up' : 'down';

  await requireCourse(courseId);
  const quiz = await db.moduleQuiz.findFirst({
    where: { id: quizId, module: { week: { courseId } } },
  });
  if (!quiz) throw new Error('Quiz not found.');

  const questions = await db.quizQuestion.findMany({
    where: { quizId },
    orderBy: { order: 'asc' },
  });

  const currentIndex = questions.findIndex((q) => q.id === questionId);
  if (currentIndex === -1) throw new Error('Question not found.');

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= questions.length) return;

  const currentItem = questions[currentIndex];
  const targetItem = questions[targetIndex];

  await db.$transaction([
    db.quizQuestion.update({
      where: { id: currentItem.id },
      data: { order: targetItem.order },
    }),
    db.quizQuestion.update({
      where: { id: targetItem.id },
      data: { order: currentItem.order },
    }),
  ]);

  refresh(courseId);
}

export async function upsertWeeklyAssignmentAction(
  courseId: string,
  weekId: string,
  _state: CurriculumFormState,
  formData: FormData
): Promise<CurriculumFormState> {
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
    return { success: true };
  } catch (error) {
    return {
      formError: error instanceof Error ? error.message : 'Unable to save weekly assignment.',
    };
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
