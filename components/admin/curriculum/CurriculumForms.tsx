'use client';

import { useActionState, useEffect, useState } from 'react';
import type { CourseModule, CourseWeek, Lesson } from '@prisma/client';
import type { CurriculumFormState } from '@/app/admin/(protected)/courses/[id]/curriculum/actions';
import { slugifyCourseTitle } from '@/lib/courses/options';

const initialState: CurriculumFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.[0]) return null;
  return <p className="mt-1 text-xs font-semibold text-error">{errors[0]}</p>;
}

export function WeekForm({
  action,
  week,
  defaultWeekNumber,
  onDone,
}: {
  action: (state: CurriculumFormState, formData: FormData) => Promise<CurriculumFormState>;
  week?: CourseWeek;
  defaultWeekNumber?: number;
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      {state.formError && <p className="text-sm font-semibold text-error">{state.formError}</p>}
      <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
        <div>
          <label htmlFor={`week-number-${week?.id ?? 'new'}`} className="block text-xs font-bold uppercase text-slate-500">
            Week Number
          </label>
          <input id={`week-number-${week?.id ?? 'new'}`} name="weekNumber" type="number" min={1} defaultValue={week?.weekNumber ?? defaultWeekNumber ?? 1} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <FieldError errors={state.fieldErrors?.weekNumber} />
        </div>
        <div>
          <label htmlFor={`week-title-${week?.id ?? 'new'}`} className="block text-xs font-bold uppercase text-slate-500">
            Week Title
          </label>
          <input id={`week-title-${week?.id ?? 'new'}`} name="title" defaultValue={week?.title} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <FieldError errors={state.fieldErrors?.title} />
        </div>
      </div>
      <div>
        <label htmlFor={`week-description-${week?.id ?? 'new'}`} className="block text-xs font-bold uppercase text-slate-500">
          Description
        </label>
        <textarea id={`week-description-${week?.id ?? 'new'}`} name="description" defaultValue={week?.description} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div className="flex justify-end gap-2">
        {onDone && <button type="button" onClick={onDone} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>}
        <button type="submit" disabled={pending} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">{pending ? 'Saving...' : 'Save Week'}</button>
      </div>
    </form>
  );
}

export function ModuleForm({
  action,
  module,
  onDone,
}: {
  action: (state: CurriculumFormState, formData: FormData) => Promise<CurriculumFormState>;
  module?: CourseModule;
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      {state.formError && <p className="text-sm font-semibold text-error">{state.formError}</p>}
      <div>
        <label htmlFor={`module-title-${module?.id ?? 'new'}`} className="block text-xs font-bold uppercase text-slate-500">Module Title</label>
        <input id={`module-title-${module?.id ?? 'new'}`} name="title" defaultValue={module?.title} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <FieldError errors={state.fieldErrors?.title} />
      </div>
      <div>
        <label htmlFor={`module-description-${module?.id ?? 'new'}`} className="block text-xs font-bold uppercase text-slate-500">Description</label>
        <textarea id={`module-description-${module?.id ?? 'new'}`} name="description" defaultValue={module?.description} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div className="flex justify-end gap-2">
        {onDone && <button type="button" onClick={onDone} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>}
        <button type="submit" disabled={pending} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">{pending ? 'Saving...' : 'Save Module'}</button>
      </div>
    </form>
  );
}

export function InlineLessonForm({
  action,
  onDone,
}: {
  action: (state: CurriculumFormState, formData: FormData) => Promise<CurriculumFormState>;
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!slugTouched) setSlug(slugifyCourseTitle(title));
  }, [slugTouched, title]);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      {state.formError && <p className="text-sm font-semibold text-error">{state.formError}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="lesson-title-new" className="block text-xs font-bold uppercase text-slate-500">Lesson Title</label>
          <input id="lesson-title-new" name="title" value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <FieldError errors={state.fieldErrors?.title} />
        </div>
        <div>
          <label htmlFor="lesson-slug-new" className="block text-xs font-bold uppercase text-slate-500">Slug</label>
          <input id="lesson-slug-new" name="slug" value={slug} onChange={(event) => { setSlugTouched(true); setSlug(event.target.value.toLowerCase()); }} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <FieldError errors={state.fieldErrors?.slug} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <select name="lessonType" defaultValue="TEXT" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" aria-label="Lesson type">
          <option value="TEXT">Text</option>
          <option value="VIDEO">Video</option>
          <option value="ASSIGNMENT">Assignment</option>
        </select>
        <input name="duration" type="number" min={1} placeholder="Duration minutes" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <select name="status" defaultValue="DRAFT" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" aria-label="Lesson status">
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      <input name="videoUrl" placeholder="Video URL, if applicable" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <textarea name="content" rows={4} placeholder="Lesson content or instructions" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-600"><input name="isPreview" type="checkbox" className="h-4 w-4" /> Allow students to preview this lesson</label>
      <div className="flex justify-end gap-2">
        {onDone && <button type="button" onClick={onDone} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>}
        <button type="submit" disabled={pending} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">{pending ? 'Saving...' : 'Save Lesson'}</button>
      </div>
    </form>
  );
}

export function LessonForm({
  action,
  lesson,
}: {
  action: (state: CurriculumFormState, formData: FormData) => Promise<CurriculumFormState>;
  lesson: Lesson;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [title, setTitle] = useState(lesson.title);
  const [slug, setSlug] = useState(lesson.slug);

  return (
    <form action={formAction} className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      {state.formError && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-error">{state.formError}</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="lesson-title" className="block text-sm font-semibold text-slate-700">Lesson Title</label>
          <input id="lesson-title" name="title" value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
          <FieldError errors={state.fieldErrors?.title} />
        </div>
        <div>
          <label htmlFor="lesson-slug" className="block text-sm font-semibold text-slate-700">Slug</label>
          <input id="lesson-slug" name="slug" value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase())} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
          <FieldError errors={state.fieldErrors?.slug} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <select name="lessonType" defaultValue={lesson.lessonType} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm" aria-label="Lesson type">
          <option value="TEXT">Text</option>
          <option value="VIDEO">Video</option>
          <option value="ASSIGNMENT">Assignment</option>
        </select>
        <input name="duration" type="number" min={1} defaultValue={lesson.duration ?? ''} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm" placeholder="Duration minutes" />
        <select name="status" defaultValue={lesson.status} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm" aria-label="Lesson status">
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      <input name="videoUrl" defaultValue={lesson.videoUrl ?? ''} placeholder="Video URL, if applicable" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
      <div>
        <label htmlFor="lesson-content" className="block text-sm font-semibold text-slate-700">Content</label>
        <textarea id="lesson-content" name="content" defaultValue={lesson.content} rows={12} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
        <p className="mt-2 text-xs text-slate-500">Use plain text and line breaks. Public rendering escapes content by default.</p>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-600"><input name="isPreview" type="checkbox" defaultChecked={lesson.isPreview} className="h-4 w-4" /> Allow students to preview this lesson</label>
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{pending ? 'Saving...' : 'Save Lesson'}</button>
      </div>
    </form>
  );
}
