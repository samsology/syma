'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/authorization';
import { db } from '@/lib/db';
import { createCourseSchema, updateCourseSchema } from '@/lib/validation/course';
import { validateCourseForPublishing } from '@/lib/courses/publishing';

export type CourseFormState = {
  fieldErrors?: Record<string, string[] | undefined>;
  formError?: string;
};

const duplicateSlugMessage = 'A course with this slug already exists.';

function courseDataFromForm(formData: FormData) {
  const instructorId = String(formData.get('instructorId') ?? '').trim();
  const rawPrice = formData.get('price');
  let priceMinor = 0;
  if (rawPrice !== null && rawPrice !== '') {
    const num = parseFloat(String(rawPrice));
    if (!isNaN(num)) {
      priceMinor = Math.round(num * 100);
    }
  } else if (formData.get('priceMinor')) {
    priceMinor = parseInt(String(formData.get('priceMinor')), 10) || 0;
  }

  const rawBenefits = String(formData.get('benefits') ?? '');
  const benefits = rawBenefits
    .split('\n')
    .map((b) => b.trim())
    .filter(Boolean);

  return {
    title: formData.get('title'),
    slug: String(formData.get('slug') ?? '').toLowerCase(),
    shortDescription: formData.get('shortDescription'),
    description: formData.get('description'),
    category: formData.get('category'),
    level: formData.get('level'),
    duration: formData.get('duration'),
    priceMinor,
    currency: (String(formData.get('currency') ?? '').toUpperCase() === 'USD' ? 'USD' : 'NGN') as 'USD' | 'NGN',
    benefits,
    cta: String(formData.get('cta') ?? 'Apply Today').trim() || 'Apply Today',
    sortOrder: parseInt(String(formData.get('sortOrder') ?? '0'), 10) || 0,
    thumbnailUrl: formData.get('thumbnailUrl'),
    instructorId: instructorId || null,
  };
}

function isDuplicateSlugError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

export async function createCourseAction(
  _state: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  await requireAdmin();

  const parsed = createCourseSchema.safeParse(courseDataFromForm(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const course = await db.course.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        shortDescription: parsed.data.shortDescription,
        description: parsed.data.description,
        category: parsed.data.category,
        level: parsed.data.level,
        duration: parsed.data.duration,
        priceMinor: parsed.data.priceMinor,
        currency: parsed.data.currency,
        benefits: parsed.data.benefits,
        cta: parsed.data.cta,
        sortOrder: parsed.data.sortOrder,
        thumbnailUrl: parsed.data.thumbnailUrl || null,
        instructorId: parsed.data.instructorId || null,
        status: 'DRAFT',
      },
      select: { id: true },
    });

    revalidatePath('/admin/courses');
    redirect(`/admin/courses/${course.id}?success=created`);
  } catch (error) {
    if (isDuplicateSlugError(error)) {
      return { fieldErrors: { slug: [duplicateSlugMessage] } };
    }
    return { formError: 'Unable to create course. Please try again.' };
  }
}

export async function updateCourseAction(
  courseId: string,
  _state: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  await requireAdmin();

  const parsed = updateCourseSchema.safeParse(courseDataFromForm(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existingCourse = await db.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  });

  if (!existingCourse) return { formError: 'Course not found.' };

  try {
    await db.course.update({
      where: { id: courseId },
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        shortDescription: parsed.data.shortDescription,
        description: parsed.data.description,
        category: parsed.data.category,
        level: parsed.data.level,
        duration: parsed.data.duration,
        priceMinor: parsed.data.priceMinor,
        currency: parsed.data.currency,
        benefits: parsed.data.benefits,
        cta: parsed.data.cta,
        sortOrder: parsed.data.sortOrder,
        thumbnailUrl: parsed.data.thumbnailUrl || null,
        instructorId: parsed.data.instructorId || null,
      },
    });

    revalidatePath('/admin/courses');
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath('/programs');
    redirect(`/admin/courses/${courseId}?success=updated`);
  } catch (error) {
    if (isDuplicateSlugError(error)) {
      return { fieldErrors: { slug: [duplicateSlugMessage] } };
    }
    return { formError: 'Unable to update course. Please try again.' };
  }
}

export async function publishCourseAction(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get('courseId') ?? '');

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) redirect('/admin/courses?error=not-found');

  const validation = await validateCourseForPublishing(courseId);
  if (!validation.valid) {
    const errorParam = encodeURIComponent(validation.errors.join('; '));
    redirect(`/admin/courses/${courseId}?error=publish-failed&details=${errorParam}`);
  }

  await db.course.update({
    where: { id: courseId },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  revalidatePath('/admin/courses');
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/programs');
  redirect(`/admin/courses/${courseId}?success=published`);
}

export async function unpublishCourseAction(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get('courseId') ?? '');

  await db.course.update({
    where: { id: courseId },
    data: { status: 'DRAFT' },
  });

  revalidatePath('/admin/courses');
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/programs');
  redirect(`/admin/courses/${courseId}?success=draft`);
}

export async function archiveCourseAction(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get('courseId') ?? '');

  await db.course.update({
    where: { id: courseId },
    data: { status: 'ARCHIVED' },
  });

  revalidatePath('/admin/courses');
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath('/programs');
  redirect('/admin/courses?success=archived');
}

export async function restoreCourseAction(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get('courseId') ?? '');

  await db.course.update({
    where: { id: courseId },
    data: { status: 'DRAFT' },
  });

  revalidatePath('/admin/courses');
  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}?success=restored`);
}

export async function deleteCourseAction(formData: FormData) {
  await requireAdmin();
  const courseId = String(formData.get('courseId') ?? '');

  const [enrollmentCount, orderCount] = await Promise.all([
    db.enrollment.count({ where: { courseId } }),
    db.order.count({ where: { courseId } }),
  ]);

  if (enrollmentCount > 0 || orderCount > 0) {
    redirect(`/admin/courses/${courseId}?error=delete-restricted`);
  }

  await db.course.delete({ where: { id: courseId } });

  revalidatePath('/admin/courses');
  revalidatePath('/admin/dashboard');
  revalidatePath('/programs');
  redirect('/admin/courses?success=deleted');
}

