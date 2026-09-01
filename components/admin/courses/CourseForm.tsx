'use client';

import Link from 'next/link';
import { useActionState, useEffect, useMemo, useState } from 'react';
import type { Admin, Course } from '@prisma/client';
import { Save } from 'lucide-react';
import type { CourseFormState } from '@/app/admin/(protected)/courses/actions';
import { courseCategories, courseLevels, slugifyCourseTitle } from '@/lib/courses/options';
import { Button } from '@/components/ui/Button';

type CourseFormProps = {
  action: (state: CourseFormState, formData: FormData) => Promise<CourseFormState>;
  course?: Course;
  admins: Pick<Admin, 'id' | 'name' | 'email'>[];
};

const initialState: CourseFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.[0]) return null;
  return <p className="mt-2 text-sm font-medium text-error">{errors[0]}</p>;
}

export function CourseForm({ action, course, admins }: CourseFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [title, setTitle] = useState(course?.title ?? '');
  const [slug, setSlug] = useState(course?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(course));
  const originalSlug = course?.slug;
  const showSlugWarning = course?.status === 'PUBLISHED' && originalSlug && slug !== originalSlug;

  useEffect(() => {
    if (!slugTouched) setSlug(slugifyCourseTitle(title));
  }, [slugTouched, title]);

  const descriptionId = useMemo(() => `description-${course?.id ?? 'new'}`, [course?.id]);

  return (
    <form action={formAction} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      {state.formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-error" role="alert">
          {state.formError}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-slate-700">
            Course Title
          </label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            required
          />
          <FieldError errors={state.fieldErrors?.title} />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-semibold text-slate-700">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value.toLowerCase());
            }}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            required
          />
          <FieldError errors={state.fieldErrors?.slug} />
          {showSlugWarning && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              Changing this slug may affect existing links to this course.
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="shortDescription" className="block text-sm font-semibold text-slate-700">
          Short Description
        </label>
        <textarea
          id="shortDescription"
          name="shortDescription"
          defaultValue={course?.shortDescription}
          rows={3}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          required
        />
        <FieldError errors={state.fieldErrors?.shortDescription} />
      </div>

      <div>
        <label htmlFor={descriptionId} className="block text-sm font-semibold text-slate-700">
          Description
        </label>
        <textarea
          id={descriptionId}
          name="description"
          defaultValue={course?.description}
          rows={8}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          required
        />
        <p className="mt-2 text-xs text-slate-500">Supports plain paragraphs and line breaks for this phase.</p>
        <FieldError errors={state.fieldErrors?.description} />
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-slate-700">
            Category
          </label>
          <select id="category" name="category" defaultValue={course?.category ?? ''} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" required>
            <option value="">Select category</option>
            {courseCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.category} />
        </div>

        <div>
          <label htmlFor="level" className="block text-sm font-semibold text-slate-700">
            Level
          </label>
          <select id="level" name="level" defaultValue={course?.level ?? ''} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" required>
            <option value="">Select level</option>
            {courseLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.level} />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-semibold text-slate-700">
            Duration
          </label>
          <input id="duration" name="duration" defaultValue={course?.duration} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" placeholder="8 Weeks" required />
          <FieldError errors={state.fieldErrors?.duration} />
        </div>

        <div>
          <label htmlFor="instructorId" className="block text-sm font-semibold text-slate-700">
            Instructor
          </label>
          <select id="instructorId" name="instructorId" defaultValue={course?.instructorId ?? ''} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
            <option value="">No instructor</option>
            {admins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.name} ({admin.email})
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.instructorId} />
        </div>
      </div>

      <div>
        <label htmlFor="thumbnailUrl" className="block text-sm font-semibold text-slate-700">
          Thumbnail URL
        </label>
        <input
          id="thumbnailUrl"
          name="thumbnailUrl"
          defaultValue={course?.thumbnailUrl ?? ''}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          placeholder="/images/course-thumbnail.webp"
        />
        <FieldError errors={state.fieldErrors?.thumbnailUrl} />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <Link href={course ? `/admin/courses/${course.id}` : '/admin/courses'} className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Cancel
        </Link>
        <Button type="submit" isLoading={pending} leftIcon={<Save className="h-4 w-4" />}>
          Save Draft
        </Button>
      </div>
    </form>
  );
}
