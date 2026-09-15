'use client';

import { useActionState, useState } from 'react';
import { Edit2, ExternalLink, FileText, Trash2, X } from 'lucide-react';
import type { LessonResource } from '@prisma/client';
import type { CurriculumFormState } from '@/app/admin/(protected)/courses/[id]/curriculum/actions';
import {
  createResourceAction,
  deleteResourceAction,
  updateResourceAction,
} from '@/app/admin/(protected)/courses/[id]/curriculum/actions';

const initialState: CurriculumFormState = {};

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ResourceEditRow({
  courseId,
  resource,
  onDone,
}: {
  courseId: string;
  resource: LessonResource;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    updateResourceAction.bind(null, courseId, resource.id),
    initialState
  );

  return (
    <form action={formAction} className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-primary uppercase">Edit Resource</span>
        <button type="button" onClick={onDone} className="text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_90px_110px_auto]">
        <input
          name="name"
          defaultValue={resource.name}
          placeholder="Resource name"
          required
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
        />
        <input
          name="fileUrl"
          defaultValue={resource.fileUrl}
          placeholder="https://... or /assets/..."
          required
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
        />
        <input
          name="fileType"
          defaultValue={resource.fileType}
          placeholder="pdf"
          required
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs uppercase"
        />
        <input
          name="fileSize"
          type="number"
          min={0}
          defaultValue={resource.fileSize ?? ''}
          placeholder="Size (bytes)"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
        />
        <div className="flex gap-1.5">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {pending ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
        </div>
      </div>
      {state.formError && <p className="text-xs font-semibold text-error">{state.formError}</p>}
      {Object.values(state.fieldErrors ?? {}).flat()[0] && (
        <p className="text-xs font-semibold text-error">{Object.values(state.fieldErrors ?? {}).flat()[0]}</p>
      )}
    </form>
  );
}

export function ResourceManager({
  courseId,
  lessonId,
  resources,
}: {
  courseId: string;
  lessonId: string;
  resources: LessonResource[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    createResourceAction.bind(null, courseId, lessonId),
    initialState
  );

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <h5 className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Lesson Resources &amp; Materials ({resources.length})
        </h5>
        <span className="text-[11px] text-slate-400">PDF, DOCX, CSV, ZIP, PBIX, IPYNB</span>
      </div>

      <div className="mt-2 space-y-2">
        {resources.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-200 bg-white p-3 text-center text-xs text-slate-500">
            No resources attached yet. Add a reference guide, dataset, or notebook below.
          </p>
        )}

        {resources.map((resource) =>
          editingId === resource.id ? (
            <ResourceEditRow
              key={resource.id}
              courseId={courseId}
              resource={resource}
              onDone={() => setEditingId(null)}
            />
          ) : (
            <div
              key={resource.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-xs"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <FileText className="text-primary h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <a
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-slate-800 hover:text-primary"
                  >
                    <span className="truncate">{resource.name}</span>
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </a>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="rounded bg-slate-100 px-1.5 py-0.2 font-bold uppercase text-slate-600">
                      {resource.fileType}
                    </span>
                    {resource.fileSize ? <span>{formatBytes(resource.fileSize)}</span> : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEditingId(resource.id)}
                  aria-label={`Edit ${resource.name}`}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <form
                  action={deleteResourceAction}
                  onSubmit={(event) => {
                    if (!window.confirm(`Remove resource "${resource.name}"? This action cannot be undone.`)) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="courseId" value={courseId} />
                  <input type="hidden" name="resourceId" value={resource.id} />
                  <button
                    type="submit"
                    aria-label={`Remove ${resource.name}`}
                    className="rounded-md p-1.5 text-error hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )
        )}
      </div>

      <form action={formAction} className="mt-3 grid gap-2 lg:grid-cols-[1fr_1fr_90px_110px_auto]">
        <input
          name="name"
          placeholder="Resource name (e.g. Cheat Sheet)"
          required
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
        />
        <input
          name="fileUrl"
          placeholder="https://... or /assets/..."
          required
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
        />
        <input
          name="fileType"
          placeholder="pdf"
          required
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs uppercase"
        />
        <input
          name="fileSize"
          type="number"
          min={0}
          placeholder="Size (bytes)"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {pending ? 'Adding...' : 'Add Resource'}
        </button>
      </form>

      {state.formError && <p className="mt-2 text-xs font-semibold text-error">{state.formError}</p>}
      {Object.values(state.fieldErrors ?? {}).flat()[0] && (
        <p className="mt-2 text-xs font-semibold text-error">
          {Object.values(state.fieldErrors ?? {}).flat()[0]}
        </p>
      )}
    </div>
  );
}
