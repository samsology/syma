'use client';

import { useActionState, useState } from 'react';
import type { CourseModule, CourseWeek, Lesson } from '@prisma/client';
import { ExternalLink, Video, Presentation } from 'lucide-react';
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
          <input
            id={`week-number-${week?.id ?? 'new'}`}
            name="weekNumber"
            type="number"
            min={1}
            defaultValue={week?.weekNumber ?? defaultWeekNumber ?? 1}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <FieldError errors={state.fieldErrors?.weekNumber} />
        </div>
        <div>
          <label htmlFor={`week-title-${week?.id ?? 'new'}`} className="block text-xs font-bold uppercase text-slate-500">
            Week Title
          </label>
          <input
            id={`week-title-${week?.id ?? 'new'}`}
            name="title"
            defaultValue={week?.title}
            placeholder="e.g. Foundations &amp; Core Concepts"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <FieldError errors={state.fieldErrors?.title} />
        </div>
      </div>
      <div>
        <label htmlFor={`week-description-${week?.id ?? 'new'}`} className="block text-xs font-bold uppercase text-slate-500">
          Description
        </label>
        <textarea
          id={`week-description-${week?.id ?? 'new'}`}
          name="description"
          defaultValue={week?.description}
          rows={2}
          placeholder="Summary of topics and goals covered during this week"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex justify-end gap-2">
        {onDone && (
          <button type="button" onClick={onDone} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
        )}
        <button type="submit" disabled={pending} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? 'Saving...' : 'Save Week'}
        </button>
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
        <label htmlFor={`module-title-${module?.id ?? 'new'}`} className="block text-xs font-bold uppercase text-slate-500">
          Module Title
        </label>
        <input
          id={`module-title-${module?.id ?? 'new'}`}
          name="title"
          defaultValue={module?.title}
          placeholder="e.g. Exploratory Data Analysis &amp; Visuals"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <FieldError errors={state.fieldErrors?.title} />
      </div>
      <div>
        <label htmlFor={`module-description-${module?.id ?? 'new'}`} className="block text-xs font-bold uppercase text-slate-500">
          Description
        </label>
        <textarea
          id={`module-description-${module?.id ?? 'new'}`}
          name="description"
          defaultValue={module?.description}
          rows={2}
          placeholder="Brief overview of module competencies"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex justify-end gap-2">
        {onDone && (
          <button type="button" onClick={onDone} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
        )}
        <button type="submit" disabled={pending} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? 'Saving...' : 'Save Module'}
        </button>
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
  const [lessonType, setLessonType] = useState('TEXT');
  const [resourceType, setResourceType] = useState<'SLIDE' | 'VIDEO'>('VIDEO');
  const [slideUrl, setSlideUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!slugTouched) {
      setSlug(slugifyCourseTitle(newTitle));
    }
  };

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      {state.formError && <p className="text-sm font-semibold text-error">{state.formError}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="lesson-title-new" className="block text-xs font-bold uppercase text-slate-500">
            Lesson Title
          </label>
          <input
            id="lesson-title-new"
            name="title"
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            placeholder="e.g. Statistical Significance in Clinical Trials"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <FieldError errors={state.fieldErrors?.title} />
        </div>
        <div>
          <label htmlFor="lesson-slug-new" className="block text-xs font-bold uppercase text-slate-500">
            Slug
          </label>
          <input
            id="lesson-slug-new"
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value.toLowerCase());
            }}
            placeholder="statistical-significance"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <FieldError errors={state.fieldErrors?.slug} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500">Lesson Type</label>
          <select
            name="lessonType"
            value={lessonType}
            onChange={(e) => setLessonType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="TEXT">Text</option>
            <option value="VIDEO">Video</option>
            <option value="ASSIGNMENT">Assignment</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500">Duration (Minutes)</label>
          <input
            name="duration"
            type="number"
            min={1}
            placeholder="45"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500">Status</label>
          <select name="status" defaultValue="DRAFT" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Delivery Format</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setResourceType('VIDEO')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-semibold ${
              resourceType === 'VIDEO' ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white text-slate-700'
            }`}
          >
            <Video className="h-3.5 w-3.5" /> Video Explainer
          </button>
          <button
            type="button"
            onClick={() => setResourceType('SLIDE')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-semibold ${
              resourceType === 'SLIDE' ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white text-slate-700'
            }`}
          >
            <Presentation className="h-3.5 w-3.5" /> Slide Deck
          </button>
        </div>
        <input type="hidden" name="resourceType" value={resourceType} />
      </div>

      {resourceType === 'SLIDE' ? (
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500">Slide Presentation URL</label>
          <div className="mt-1 flex gap-2">
            <input
              name="slideUrl"
              value={slideUrl}
              onChange={(e) => setSlideUrl(e.target.value)}
              placeholder="https://docs.google.com/presentation/d/... or Canva / slide URL"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            {slideUrl && (
              <a
                href={slideUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Test
              </a>
            )}
          </div>
          <FieldError errors={state.fieldErrors?.slideUrl} />
        </div>
      ) : (
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500">
            Video URL {lessonType === 'VIDEO' ? <span className="text-primary">(Recommended for Video)</span> : '(Optional)'}
          </label>
          <div className="mt-1 flex gap-2">
            <input
              name="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            {videoUrl && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Test
              </a>
            )}
          </div>
          <FieldError errors={state.fieldErrors?.videoUrl} />
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase text-slate-500">Instructional Content</label>
        <textarea
          name="content"
          rows={4}
          placeholder={
            lessonType === 'ASSIGNMENT'
              ? 'Enter assignment instructions, deliverables, and requirements...'
              : lessonType === 'VIDEO'
              ? 'Enter supplementary lecture notes, timestamps, or summary...'
              : 'Enter complete lesson text or tutorial instructions...'
          }
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <FieldError errors={state.fieldErrors?.content} />
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
        <input name="isPreview" type="checkbox" className="h-4 w-4 rounded text-primary" />
        Allow enrolled &amp; prospective students to preview this lesson for free
      </label>

      <div className="flex justify-end gap-2">
        {onDone && (
          <button type="button" onClick={onDone} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
        )}
        <button type="submit" disabled={pending} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? 'Saving...' : 'Save Lesson'}
        </button>
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
  const [lessonType, setLessonType] = useState(lesson.lessonType);
  const [resourceType, setResourceType] = useState<'SLIDE' | 'VIDEO'>(lesson.resourceType ?? 'VIDEO');
  const [slideUrl, setSlideUrl] = useState(lesson.slideUrl ?? '');
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl ?? '');

  return (
    <form action={formAction} className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      {state.formError && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-error">{state.formError}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="lesson-title" className="block text-sm font-semibold text-slate-700">
            Lesson Title
          </label>
          <input
            id="lesson-title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />
          <FieldError errors={state.fieldErrors?.title} />
        </div>
        <div>
          <label htmlFor="lesson-slug" className="block text-sm font-semibold text-slate-700">
            Slug
          </label>
          <input
            id="lesson-slug"
            name="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value.toLowerCase())}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />
          <FieldError errors={state.fieldErrors?.slug} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500">Lesson Type</label>
          <select
            name="lessonType"
            value={lessonType}
            onChange={(e) => setLessonType(e.target.value as Lesson['lessonType'])}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          >
            <option value="TEXT">Text</option>
            <option value="VIDEO">Video</option>
            <option value="ASSIGNMENT">Assignment</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500">Estimated Duration (Minutes)</label>
          <input
            name="duration"
            type="number"
            min={1}
            defaultValue={lesson.duration ?? ''}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            placeholder="e.g. 45"
          />
          <FieldError errors={state.fieldErrors?.duration} />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500">Publishing Status</label>
          <select name="status" defaultValue={lesson.status} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <label className="block text-xs font-bold uppercase text-slate-600 mb-2">Delivery Format</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setResourceType('VIDEO')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-sm font-semibold transition ${
              resourceType === 'VIDEO' ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Video className="h-4 w-4" /> Video Explainer
          </button>
          <button
            type="button"
            onClick={() => setResourceType('SLIDE')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-sm font-semibold transition ${
              resourceType === 'SLIDE' ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Presentation className="h-4 w-4" /> Slide Deck
          </button>
        </div>
        <input type="hidden" name="resourceType" value={resourceType} />
      </div>

      {resourceType === 'SLIDE' ? (
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="lesson-slideUrl" className="block text-sm font-semibold text-slate-700">
              Slide Presentation URL
            </label>
            {slideUrl && (
              <div className="flex items-center gap-2">
                <a
                  href={slideUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Test Slide Link
                </a>
                <button
                  type="button"
                  onClick={() => setSlideUrl('')}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          <input
            id="lesson-slideUrl"
            name="slideUrl"
            value={slideUrl}
            onChange={(e) => setSlideUrl(e.target.value)}
            placeholder="https://docs.google.com/presentation/d/... or Canva presentation URL"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />
          <FieldError errors={state.fieldErrors?.slideUrl} />
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="lesson-videoUrl" className="block text-sm font-semibold text-slate-700">
              Video URL
            </label>
            {videoUrl && (
              <div className="flex items-center gap-2">
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Test Video Link
                </a>
                <button
                  type="button"
                  onClick={() => setVideoUrl('')}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          <input
            id="lesson-videoUrl"
            name="videoUrl"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          />
          <FieldError errors={state.fieldErrors?.videoUrl} />
        </div>
      )}

      <div>
        <label htmlFor="lesson-content" className="block text-sm font-semibold text-slate-700">
          Lesson Content &amp; Instructions
        </label>
        <textarea
          id="lesson-content"
          name="content"
          defaultValue={lesson.content}
          rows={12}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          placeholder={
            lessonType === 'ASSIGNMENT'
              ? 'Enter detailed assignment instructions, rubric, and submission requirements...'
              : 'Enter instructional lesson text, markdown, or reading material...'
          }
        />
        <FieldError errors={state.fieldErrors?.content} />
        <p className="mt-2 text-xs text-slate-500">
          Instructional material. Attached files, datasets, and slides should be uploaded in the Lesson Resources section.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
        <input name="isPreview" type="checkbox" defaultChecked={lesson.isPreview} className="h-4 w-4 rounded text-primary" />
        Allow students to preview this lesson before enrolling
      </label>

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? 'Saving...' : 'Save Lesson'}
        </button>
      </div>
    </form>
  );
}
