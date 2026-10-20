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
import { r2Storage } from '@/lib/storage/r2Storage';
import {
  ASSIGNMENT_DATASET_EXTENSIONS,
  ASSIGNMENT_MAX_FILE_SIZE,
  validateAssignmentFile,
} from '@/lib/assignments/files';
import { isR2KeyForCourseWeekAssignment } from '@/lib/resources/r2-upload-key';

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
  revalidatePath('/admin/assignments');
  revalidatePath(`/student/courses/${courseId}`);
}

function sanitizeUrl(val: unknown): string {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed) return '';
  // R2 storage key or r2:// URI: preserve clean storage reference without prepending https://
  if (trimmed.startsWith('r2://') || trimmed.startsWith('courses/')) {
    return trimmed;
  }
  if (/^https?:\/\/courses\//i.test(trimmed)) {
    return trimmed.replace(/^https?:\/\//i, '');
  }
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
    storageKey: formData.get('storageKey') || undefined,
    mimeType: formData.get('mimeType') || undefined,
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
        storageKey: parsed.data.storageKey || null,
        mimeType: parsed.data.mimeType || null,
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
    storageKey: formData.get('storageKey') || undefined,
    mimeType: formData.get('mimeType') || undefined,
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
        storageKey: parsed.data.storageKey ?? resource.storageKey,
        mimeType: parsed.data.mimeType ?? resource.mimeType,
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

  // Clean up R2 object if applicable
  if (resource.sourceType === 'R2' || resource.storageKey) {
    const key = resource.storageKey || resource.fileUrl.replace(/^r2:\/\//i, '');
    if (key) {
      const { storageService } = await import('@/lib/storage');
      await storageService.delete(key).catch((err) => {
        console.error(`Failed to delete R2 object for key ${key}:`, err);
      });
    }
  }

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
  const rawPolicy = formData.get('attemptPolicy');
  const rawTime = formData.get('timeLimitMinutes');
  const rawStatus = formData.get('status');

  const timeLimitMinutes = rawTime !== null && String(rawTime).trim() !== '' ? rawTime : undefined;

  const parsed = quizSchema.safeParse({
    title: rawTitle !== null && rawTitle !== undefined ? String(rawTitle) : undefined,
    description:
      rawDesc !== null && rawDesc !== undefined && String(rawDesc).trim() !== ''
        ? String(rawDesc)
        : undefined,
    instructions:
      rawInst !== null && rawInst !== undefined && String(rawInst).trim() !== ''
        ? String(rawInst)
        : undefined,
    passingScore:
      rawPass !== null && rawPass !== undefined && String(rawPass).trim() !== ''
        ? rawPass
        : undefined,
    maxAttempts:
      rawMax !== null && rawMax !== undefined && String(rawMax).trim() !== '' ? rawMax : undefined,
    attemptPolicy: rawPolicy === 'LIMITED' ? 'LIMITED' : 'UNLIMITED',
    requirePassingToProgress:
      formData.get('requirePassingToProgress') === 'true' ||
      formData.get('requirePassingToProgress') === 'on' ||
      formData.get('requirePassingToProgress') === null,
    allowLearningAfterExhausted:
      formData.get('allowLearningAfterExhausted') !== 'false' &&
      formData.get('allowLearningAfterExhausted') !== 'off',
    allowAttemptRequests:
      formData.get('allowAttemptRequests') !== 'false' &&
      formData.get('allowAttemptRequests') !== 'off',
    timeLimitMinutes,
    randomizeQuestions:
      formData.get('randomizeQuestions') === 'true' || formData.get('randomizeQuestions') === 'on',
    randomizeOptions:
      formData.get('randomizeOptions') === 'true' || formData.get('randomizeOptions') === 'on',
    showResults:
      formData.get('showResults') === 'true' ||
      formData.get('showResults') === 'on' ||
      (formData.get('showResults') !== 'false' &&
        formData.get('showResults') !== 'off' &&
        formData.get('showResults') !== null),
    showExplanations:
      formData.get('showExplanations') === 'true' ||
      formData.get('showExplanations') === 'on' ||
      (formData.get('showExplanations') !== 'false' &&
        formData.get('showExplanations') !== 'off' &&
        formData.get('showExplanations') !== null),
    status:
      rawStatus !== null && rawStatus !== undefined && String(rawStatus).trim() !== ''
        ? String(rawStatus)
        : 'DRAFT',
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
        attemptPolicy: parsed.data.attemptPolicy,
        requirePassingToProgress: parsed.data.requirePassingToProgress,
        allowLearningAfterExhausted: parsed.data.allowLearningAfterExhausted,
        allowAttemptRequests: parsed.data.allowAttemptRequests,
        timeLimitMinutes:
          parsed.data.timeLimitMinutes === '' ||
          parsed.data.timeLimitMinutes === undefined ||
          parsed.data.timeLimitMinutes === null
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
        attemptPolicy: parsed.data.attemptPolicy,
        requirePassingToProgress: parsed.data.requirePassingToProgress,
        allowLearningAfterExhausted: parsed.data.allowLearningAfterExhausted,
        allowAttemptRequests: parsed.data.allowAttemptRequests,
        timeLimitMinutes:
          parsed.data.timeLimitMinutes === '' ||
          parsed.data.timeLimitMinutes === undefined ||
          parsed.data.timeLimitMinutes === null
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

export async function grantQuizStudentOverrideAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const quizId = String(formData.get('quizId') ?? '');
  const studentId = String(formData.get('studentId') ?? '');
  const courseId = String(formData.get('courseId') ?? '');
  const additionalAttempts = Number(formData.get('additionalAttempts') ?? 1);
  const progressionGranted =
    formData.get('progressionGranted') === 'true' || formData.get('progressionGranted') === 'on';
  const reason = String(formData.get('reason') ?? 'Instructor grant');

  if (!quizId || !studentId) {
    return { success: false, error: 'Quiz and Student IDs are required.' };
  }

  try {
    await db.quizStudentOverride.upsert({
      where: { quizId_studentId: { quizId, studentId } },
      create: {
        quizId,
        studentId,
        additionalAttempts: Math.max(0, additionalAttempts),
        progressionGranted,
        isRequestPending: false,
        reason,
        grantedAt: new Date(),
      },
      update: {
        additionalAttempts: { increment: Math.max(0, additionalAttempts) },
        progressionGranted,
        isRequestPending: false,
        reason,
        grantedAt: new Date(),
      },
    });

    if (courseId) {
      refresh(courseId);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to grant override.' };
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
  courseIdOrState: string | CurriculumFormState,
  weekIdOrFormData: string | FormData,
  maybeState?: CurriculumFormState,
  maybeFormData?: FormData
): Promise<CurriculumFormState> {
  let courseId: string;
  let weekId: string;
  let formData: FormData;

  if (
    typeof courseIdOrState === 'string' &&
    typeof weekIdOrFormData === 'string' &&
    maybeFormData instanceof FormData
  ) {
    courseId = courseIdOrState;
    weekId = weekIdOrFormData;
    formData = maybeFormData;
  } else if (weekIdOrFormData instanceof FormData) {
    formData = weekIdOrFormData;
    courseId = String(formData.get('courseId') ?? (typeof courseIdOrState === 'string' ? courseIdOrState : ''));
    weekId = String(formData.get('weekId') ?? '');
  } else if (maybeFormData instanceof FormData) {
    formData = maybeFormData;
    courseId = String(formData.get('courseId') ?? (typeof courseIdOrState === 'string' ? courseIdOrState : ''));
    weekId = String(formData.get('weekId') ?? (typeof weekIdOrFormData === 'string' ? weekIdOrFormData : ''));
  } else {
    return { formError: 'Invalid request parameters.' };
  }

  if (!courseId || !weekId) {
    return { formError: 'Missing course or week reference.' };
  }

  let uploadedStorageKey: string | null = null;
  let datasetStorageKey: string | null = null;
  let assignmentPersisted = false;

  try {
    await requireCourse(courseId);
    await requireWeek(courseId, weekId);

    const rawTitle = formData.get('title');
    const rawDescription = formData.get('description');
    const rawInstructions = formData.get('instructions');
    const rawSubmissionType = formData.get('submissionType') || 'FILE_OR_TEXT';
    const rawSubmissionRequirements = formData.get('submissionRequirements');
    const rawDatasetUrl = formData.get('datasetUrl');
    const rawDatasetName = formData.get('datasetName');
    const rawDueDateDays = formData.get('dueDateDays');
    const rawDueAt = formData.get('dueAt');
    const rawMaxScore = formData.get('maxScore');
    const rawStatus = formData.get('status') || 'DRAFT';
    const removeDataset = formData.get('removeDataset') === 'true';

    const parsed = assignmentSchema.safeParse({
      title: rawTitle,
      description: rawDescription,
      instructions: rawInstructions,
      submissionType: rawSubmissionType,
      submissionRequirements: rawSubmissionRequirements,
      datasetUrl: rawDatasetUrl,
      datasetName: rawDatasetName,
      dueDateDays: rawDueDateDays || undefined,
      dueAt: rawDueAt || undefined,
      maxScore: rawMaxScore || undefined,
      status: rawStatus,
    });

    if (!parsed.success) {
      return {
        formError: 'Please check the form fields and correct the highlighted errors.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const existing = await db.weeklyAssignment.findUnique({
      where: { weekId },
      include: { resources: true },
    });
    const legacyStorageKey = existing?.datasetUrl?.startsWith('r2://')
      ? existing.datasetUrl.replace(/^r2:\/\//, '')
      : null;
    const datasetStoragePrefix = `courses/${courseId}/weeks/${weekId}/assignment/datasets/`;
    const existingDatasetFile = existing?.resources.find(
      (resource) =>
        resource.resourceType === 'FILE' &&
        (resource.storageKey === legacyStorageKey || resource.storageKey?.startsWith(datasetStoragePrefix))
    );
    const existingDatasetLink = existing?.resources.find(
      (resource) =>
        resource.resourceType === 'LINK' &&
        (resource.externalUrl === existing?.datasetUrl || !existing?.datasetUrl?.startsWith('r2://'))
    );
    const existingStorageKey = existing?.datasetUrl?.startsWith('r2://')
      ? legacyStorageKey
      : existingDatasetFile?.storageKey ?? null;
    const existingExternalUrl = existingDatasetLink?.externalUrl ??
      (existing?.datasetUrl && !existing.datasetUrl.startsWith('r2://') ? existing.datasetUrl : null);

    let finalDatasetUrl = existing?.datasetUrl ?? null;
    let finalDatasetName = existing?.datasetName ?? null;

    const uploadedDatasetKeyRaw = formData.get('uploadedDatasetKey');
    const uploadedDatasetKey = typeof uploadedDatasetKeyRaw === 'string' ? uploadedDatasetKeyRaw.trim() : '';

    const datasetFile = formData.get('datasetFile');
    const hasUploadedFile = datasetFile instanceof File && datasetFile.size > 0;

    if (removeDataset) {
      finalDatasetUrl = null;
      finalDatasetName = null;
    } else if (uploadedDatasetKey) {
      // Never trust a browser supplied object key without checking its course/week
      // scope and confirming the object exists and satisfies the dataset limit.
      const storageKey = uploadedDatasetKey.replace(/^r2:\/\//, '');
      if (!isR2KeyForCourseWeekAssignment(storageKey, courseId, weekId)) {
        return { formError: 'The uploaded dataset does not belong to this course week. Please upload it again.' };
      }
      const fileName = storageKey.split('/').pop() || '';
      const extension = fileName.split('.').pop()?.toLowerCase() || '';
      if (!ASSIGNMENT_DATASET_EXTENSIONS.has(extension)) {
        return { formError: 'The uploaded dataset type is not supported.' };
      }
      const metadata = await r2Storage.getMetadata(storageKey);
      if (!metadata || !metadata.size || metadata.size > ASSIGNMENT_MAX_FILE_SIZE) {
        return { formError: 'The uploaded dataset could not be verified in storage or exceeds the 4 MB limit.' };
      }
      datasetStorageKey = storageKey;
      if (existingStorageKey !== storageKey) uploadedStorageKey = storageKey;
      finalDatasetUrl = `r2://${storageKey}`;
      finalDatasetName = parsed.data.datasetName?.trim() || 'Uploaded Dataset File';
    } else if (hasUploadedFile) {
      // Fallback: binary upload streamed through server action
      const fileError = validateAssignmentFile(datasetFile, ASSIGNMENT_DATASET_EXTENSIONS);
      if (fileError) {
        return {
          formError: fileError,
          fieldErrors: { datasetUrl: [fileError] },
        };
      }

      const safeName = (datasetFile.name.split(/[\\/]/).pop() || 'dataset').replace(
        /[^a-zA-Z0-9_.-]/g,
        '_'
      );
      const storageKey = `courses/${courseId}/weeks/${weekId}/assignment/datasets/${crypto.randomUUID()}-${safeName}`;

      try {
        await r2Storage.upload(storageKey, Buffer.from(await datasetFile.arrayBuffer()), {
          contentType: datasetFile.type || 'application/octet-stream',
        });
        uploadedStorageKey = storageKey;
        datasetStorageKey = storageKey;
      } catch (uploadErr) {
        return {
          formError:
            uploadErr instanceof Error
              ? `Failed to upload dataset file to Cloudflare R2: ${uploadErr.message}`
              : 'Failed to upload dataset file to storage.',
        };
      }

      finalDatasetUrl = `r2://${storageKey}`;
      finalDatasetName = parsed.data.datasetName?.trim() || datasetFile.name;
    } else if (parsed.data.datasetUrl && parsed.data.datasetUrl.trim() !== '') {
      // User provided or updated an external link (e.g. Google Drive / Sheets)
      finalDatasetUrl = parsed.data.datasetUrl.trim();
      finalDatasetName = parsed.data.datasetName?.trim() || 'Google Drive / External Dataset';
    } else if (
      formData.has('datasetUrl') &&
      !parsed.data.datasetUrl &&
      !existing?.datasetUrl?.startsWith('r2://')
    ) {
      finalDatasetUrl = null;
      finalDatasetName = null;
    }

    await db.$transaction(async (tx) => {
      const savedAssignment = await tx.weeklyAssignment.upsert({
        where: { weekId },
        create: {
          weekId,
          title: parsed.data.title,
          description: parsed.data.description,
          instructions: parsed.data.instructions,
          submissionType: parsed.data.submissionType,
          submissionRequirements: parsed.data.submissionRequirements || null,
          datasetUrl: finalDatasetUrl,
          datasetName: finalDatasetName,
          dueDateDays: parsed.data.dueDateDays ?? null,
          dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
          maxScore: parsed.data.maxScore ?? null,
          status: parsed.data.status,
        },
        update: {
          title: parsed.data.title,
          description: parsed.data.description,
          instructions: parsed.data.instructions,
          submissionType: parsed.data.submissionType,
          submissionRequirements: parsed.data.submissionRequirements || null,
          datasetUrl: finalDatasetUrl,
          datasetName: finalDatasetName,
          dueDateDays: parsed.data.dueDateDays ?? null,
          dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
          maxScore: parsed.data.maxScore ?? null,
          status: parsed.data.status,
        },
      });
      if (datasetStorageKey && !removeDataset) {
        const existingFileResource = existing?.resources?.find(
          (r) => r.resourceType === 'FILE' && r.storageKey === datasetStorageKey
        );
        const resourceFileName = hasUploadedFile
          ? datasetFile.name
          : (finalDatasetName || 'dataset');
        if (existingFileResource) {
          await tx.assignmentResource.update({
            where: { id: existingFileResource.id },
            data: {
              label: finalDatasetName || existingFileResource.label,
            },
          });
        } else {
          await tx.assignmentResource.create({
            data: {
              assignmentId: savedAssignment.id,
              resourceType: 'FILE',
              label: finalDatasetName || resourceFileName,
              storageKey: datasetStorageKey,
              originalFilename: resourceFileName,
              mimeType: hasUploadedFile ? (datasetFile.type || null) : null,
              fileSize: hasUploadedFile ? datasetFile.size : null,
            },
          });
        }
      }

      const externalUrl = parsed.data.datasetUrl && !parsed.data.datasetUrl.startsWith('r2://')
        ? parsed.data.datasetUrl.trim()
        : null;

      if (externalUrl && !removeDataset) {
        const existingLink = existing?.resources?.find(
          (resource) => resource.resourceType === 'LINK' && resource.externalUrl === externalUrl
        );
        const linkLabel = (parsed.data.datasetUrl && parsed.data.datasetName?.trim() && !uploadedStorageKey)
          ? parsed.data.datasetName.trim()
          : (parsed.data.datasetName?.trim() || 'Google Drive / External Dataset');

        if (existingLink) {
          await tx.assignmentResource.update({
            where: { id: existingLink.id },
            data: { label: linkLabel },
          });
        } else {
          await tx.assignmentResource.create({
            data: {
              assignmentId: savedAssignment.id,
              resourceType: 'LINK',
              label: linkLabel,
              externalUrl,
            },
          });
        }
      }

      if (removeDataset) {
        if (existingDatasetFile) {
          await tx.assignmentResource.deleteMany({
            where: { id: existingDatasetFile.id, assignmentId: savedAssignment.id },
          });
        } else if (existingStorageKey) {
          await tx.assignmentResource.deleteMany({
            where: { assignmentId: savedAssignment.id, resourceType: 'FILE', storageKey: existingStorageKey },
          });
        }
        if (existingDatasetLink) {
          await tx.assignmentResource.deleteMany({
            where: { id: existingDatasetLink.id, assignmentId: savedAssignment.id },
          });
        } else if (existingExternalUrl) {
          await tx.assignmentResource.deleteMany({
            where: {
              assignmentId: savedAssignment.id,
              resourceType: 'LINK',
              externalUrl: existingExternalUrl,
            },
          });
        }
      } else {
        if (existingExternalUrl && existingExternalUrl !== externalUrl) {
          await tx.assignmentResource.deleteMany({
            where: {
              assignmentId: savedAssignment.id,
              resourceType: 'LINK',
              externalUrl: existingExternalUrl,
            },
          });
        }
        if (existingStorageKey && `r2://${existingStorageKey}` !== finalDatasetUrl) {
          await tx.assignmentResource.deleteMany({
            where: {
              assignmentId: savedAssignment.id,
              resourceType: 'FILE',
              storageKey: existingStorageKey,
            },
          });
        }
      }
      return savedAssignment;
    });
    assignmentPersisted = true;

    // Clean up previous R2 file if replaced or removed
    if (existingStorageKey && `r2://${existingStorageKey}` !== finalDatasetUrl) {
      await r2Storage.delete(existingStorageKey).catch((cleanupError: unknown) => {
        console.error('Assignment dataset cleanup pending after successful replacement.', {
          courseId,
          weekId,
          storageKey: existingStorageKey,
          errorName: cleanupError instanceof Error ? cleanupError.name : 'UnknownError',
        });
        return false;
      });
    }

    refresh(courseId);
    return { success: true };
  } catch (error) {
    if (uploadedStorageKey && !assignmentPersisted) {
      await r2Storage.delete(uploadedStorageKey).catch((cleanupError: unknown) => {
        console.error('Failed to clean up an unassociated assignment dataset after save failure.', {
          courseId,
          weekId,
          storageKey: uploadedStorageKey,
          errorName: cleanupError instanceof Error ? cleanupError.name : 'UnknownError',
        });
        return false;
      });
    }
    console.error('Error in upsertWeeklyAssignmentAction:', error);
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

  const existing = await db.weeklyAssignment.findUnique({
    where: { weekId },
    include: { resources: true },
  });

  if (existing) {
    if (existing.datasetUrl?.startsWith('r2://')) {
      const oldKey = existing.datasetUrl.replace(/^r2:\/\//, '');
      await r2Storage.delete(oldKey).catch(() => false);
    }
    for (const res of existing.resources) {
      if (res.storageKey) {
        await r2Storage.delete(res.storageKey).catch(() => false);
      }
    }
  }

  await db.weeklyAssignment.deleteMany({ where: { weekId } });
  refresh(courseId);
}
