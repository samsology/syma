'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ModuleSummary, ModuleQuiz, WeeklyAssignment } from '@prisma/client';
import { ExternalLink, Presentation, Video, Award, BookOpen } from 'lucide-react';
import type { CurriculumFormState } from '@/app/admin/(protected)/courses/[id]/curriculum/actions';

const initialState: CurriculumFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.[0]) return null;
  return <p className="mt-1 text-xs font-semibold text-error">{errors[0]}</p>;
}

export function ModuleSummaryForm({
  action,
  summary,
  onDone,
}: {
  action: (state: CurriculumFormState, formData: FormData) => Promise<CurriculumFormState>;
  summary?: ModuleSummary | null;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialState);
  const [resourceType, setResourceType] = useState<'SLIDE' | 'VIDEO'>(summary?.resourceType ?? 'SLIDE');
  const [resourceUrl, setResourceUrl] = useState(summary?.resourceUrl ?? '');

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onDone?.();
    }
  }, [state.success, router, onDone]);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/40 p-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-indigo-100 pb-3">
        <Presentation className="h-5 w-5 text-indigo-600" />
        <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-900">
          {summary ? 'Edit Module Summary' : 'Add Module Summary (Slide / Video)'}
        </h4>
      </div>

      {state.formError && <p className="text-sm font-semibold text-error">{state.formError}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold uppercase text-slate-600">Summary Title</label>
          <input
            name="title"
            defaultValue={summary?.title ?? 'Module Summary & Key Takeaways'}
            placeholder="e.g. Module 1 Summary & Practical Highlights"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            required
          />
          <FieldError errors={state.fieldErrors?.title} />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600">Resource Delivery Format</label>
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={() => setResourceType('SLIDE')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                resourceType === 'SLIDE'
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Presentation className="h-4 w-4" /> Slide Deck
            </button>
            <button
              type="button"
              onClick={() => setResourceType('VIDEO')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                resourceType === 'VIDEO'
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Video className="h-4 w-4" /> Video Explainer
            </button>
          </div>
          <input type="hidden" name="resourceType" value={resourceType} />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600">Estimated Duration (Minutes)</label>
          <input
            name="duration"
            type="number"
            min={1}
            defaultValue={summary?.duration ?? 10}
            placeholder="e.g. 10"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-slate-600">
          {resourceType === 'SLIDE' ? 'Slide Embed or Presentation URL' : 'Video Explainer URL'}
        </label>
        <div className="mt-1 flex gap-2">
          <input
            name="resourceUrl"
            value={resourceUrl}
            onChange={(e) => setResourceUrl(e.target.value)}
            placeholder={
              resourceType === 'SLIDE'
                ? 'https://docs.google.com/presentation/d/... or Canva / slide URL'
                : 'https://www.youtube.com/watch?v=... or Vimeo URL'
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          {resourceUrl && (
            <a
              href={resourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Test
            </a>
          )}
        </div>
        <FieldError errors={state.fieldErrors?.resourceUrl} />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-slate-600">Summary Brief / Notes (Markdown supported)</label>
        <textarea
          name="content"
          defaultValue={summary?.content ?? ''}
          rows={3}
          placeholder="Concise takeaways, summary notes, or reference points for students..."
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-indigo-100 pt-3">
        {onDone && (
          <button type="button" onClick={onDone} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? 'Saving...' : 'Save Summary'}
        </button>
      </div>
    </form>
  );
}

export function ModuleQuizForm({
  action,
  quiz,
  onDone,
}: {
  action: (state: CurriculumFormState, formData: FormData) => Promise<CurriculumFormState>;
  quiz?: ModuleQuiz | null;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onDone?.();
    }
  }, [state.success, router, onDone]);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border-2 border-amber-200 bg-amber-50/40 p-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-amber-100 pb-3">
        <Award className="h-5 w-5 text-amber-600" />
        <h4 className="text-sm font-bold uppercase tracking-wider text-amber-900">
          {quiz ? 'Edit Module Quiz' : 'Add Module Quiz'}
        </h4>
      </div>

      {state.formError && <p className="text-sm font-semibold text-error">{state.formError}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold uppercase text-slate-600">Quiz Title</label>
          <input
            name="title"
            defaultValue={quiz?.title ?? 'Module Mastery Quiz'}
            placeholder="e.g. Data Literacy Module 1 Knowledge Check"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            required
          />
          <FieldError errors={state.fieldErrors?.title} />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600">Passing Score (%)</label>
          <input
            name="passingScore"
            type="number"
            min={1}
            max={100}
            defaultValue={quiz?.passingScore ?? 70}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            required
          />
          <p className="mt-1 text-[11px] text-slate-500">Benchmark requirement: default 70% threshold</p>
          <FieldError errors={state.fieldErrors?.passingScore} />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600">Max Attempts Allowed</label>
          <input
            name="maxAttempts"
            type="number"
            min={1}
            max={10}
            defaultValue={quiz?.maxAttempts ?? 2}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            required
          />
          <p className="mt-1 text-[11px] text-slate-500">Benchmark requirement: maximum 2 attempts</p>
          <FieldError errors={state.fieldErrors?.maxAttempts} />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600">Time Limit (Minutes, optional)</label>
          <input
            name="timeLimitMinutes"
            type="number"
            min={1}
            defaultValue={quiz?.timeLimitMinutes ?? ''}
            placeholder="e.g. 15 (leave blank for untimed)"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600">Status</label>
          <select
            name="status"
            defaultValue={quiz?.status ?? 'DRAFT'}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-slate-600">Instructions / Guidelines</label>
        <textarea
          name="instructions"
          defaultValue={quiz?.instructions ?? 'Complete this quiz to test your comprehension of this module. A score of 70% or higher is required to pass.'}
          rows={3}
          placeholder="Provide student guidelines, scoring rules, or focus topics..."
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-amber-100 pt-3">
        {onDone && (
          <button type="button" onClick={onDone} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-amber-700 disabled:opacity-60"
        >
          {pending ? 'Saving...' : 'Save Quiz'}
        </button>
      </div>
    </form>
  );
}

export function WeeklyAssignmentForm({
  action,
  assignment,
  onDone,
}: {
  action: (state: CurriculumFormState, formData: FormData) => Promise<CurriculumFormState>;
  assignment?: WeeklyAssignment | null;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, initialState);
  const [datasetUrl, setDatasetUrl] = useState(assignment?.datasetUrl ?? '');

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onDone?.();
    }
  }, [state.success, router, onDone]);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-emerald-100 pb-3">
        <BookOpen className="h-5 w-5 text-emerald-600" />
        <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-900">
          {assignment ? 'Edit Weekly Assignment' : 'Add Weekly Assignment (Capstone / Practical Lab)'}
        </h4>
      </div>

      {state.formError && <p className="text-sm font-semibold text-error">{state.formError}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold uppercase text-slate-600">Assignment Title</label>
          <input
            name="title"
            defaultValue={assignment?.title ?? 'Weekly Practical Assignment'}
            placeholder="e.g. Week 1 Practical Lab: Dataset Cleaning and Exploration"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            required
          />
          <FieldError errors={state.fieldErrors?.title} />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold uppercase text-slate-600">Brief Description</label>
          <input
            name="description"
            defaultValue={assignment?.description ?? ''}
            placeholder="Overview of practical scenario and learning goals..."
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            required
          />
          <FieldError errors={state.fieldErrors?.description} />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold uppercase text-slate-600">Detailed Instructions &amp; Tasks</label>
          <textarea
            name="instructions"
            defaultValue={assignment?.instructions ?? ''}
            rows={4}
            placeholder="Step 1: Download the dataset&#10;Step 2: Perform analysis&#10;Step 3: Document your conclusions..."
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            required
          />
          <FieldError errors={state.fieldErrors?.instructions} />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600">Submission Format</label>
          <select
            name="submissionType"
            defaultValue={assignment?.submissionType ?? 'FILE_OR_TEXT'}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="FILE_OR_TEXT">File Upload or Text Input</option>
            <option value="FILE_ONLY">File Upload Only (CSV, PBIX, PDF, ZIP)</option>
            <option value="TEXT_ONLY">Online Text / Link Only</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600">Due Date (Days from week start)</label>
          <input
            name="dueDateDays"
            type="number"
            min={1}
            defaultValue={assignment?.dueDateDays ?? 7}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600">Attached Dataset Name (optional)</label>
          <input
            name="datasetName"
            defaultValue={assignment?.datasetName ?? ''}
            placeholder="e.g. ecommerce_transactions_q1.csv"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600">Attached Dataset URL (optional)</label>
          <div className="mt-1 flex gap-2">
            <input
              name="datasetUrl"
              value={datasetUrl}
              onChange={(e) => setDatasetUrl(e.target.value)}
              placeholder="https://... or /assets/datasets/..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            {datasetUrl && (
              <a
                href={datasetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Test
              </a>
            )}
          </div>
          <FieldError errors={state.fieldErrors?.datasetUrl} />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600">Status</label>
          <select
            name="status"
            defaultValue={assignment?.status ?? 'DRAFT'}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-emerald-100 pt-3">
        {onDone && (
          <button type="button" onClick={onDone} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-60"
        >
          {pending ? 'Saving...' : 'Save Assignment'}
        </button>
      </div>
    </form>
  );
}
