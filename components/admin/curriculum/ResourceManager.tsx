'use client';

import { useActionState } from 'react';
import { FileText, Trash2 } from 'lucide-react';
import type { LessonResource } from '@prisma/client';
import type { CurriculumFormState } from '@/app/admin/(protected)/courses/[id]/curriculum/actions';
import { createResourceAction, deleteResourceAction } from '@/app/admin/(protected)/courses/[id]/curriculum/actions';

const initialState: CurriculumFormState = {};

export function ResourceManager({ courseId, lessonId, resources }: { courseId: string; lessonId: string; resources: LessonResource[] }) {
  const [state, formAction, pending] = useActionState(createResourceAction.bind(null, courseId, lessonId), initialState);

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <h5 className="text-xs font-bold uppercase tracking-wide text-slate-500">Resources</h5>
      <div className="mt-2 space-y-2">
        {resources.length === 0 && <p className="text-xs text-slate-500">No resources attached.</p>}
        {resources.map((resource) => (
          <div key={resource.id} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm">
            <a href={resource.fileUrl} target="_blank" rel="noreferrer" className="inline-flex min-w-0 items-center gap-2 font-semibold text-slate-700 hover:text-primary">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{resource.name}</span>
            </a>
            <form
              action={deleteResourceAction}
              onSubmit={(event) => {
                if (!window.confirm('Remove this resource?')) event.preventDefault();
              }}
            >
              <input type="hidden" name="courseId" value={courseId} />
              <input type="hidden" name="resourceId" value={resource.id} />
              <button type="submit" aria-label={`Remove ${resource.name}`} className="rounded-md p-1.5 text-error hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </form>
          </div>
        ))}
      </div>
      <form action={formAction} className="mt-3 grid gap-2 lg:grid-cols-[1fr_1fr_90px_120px_auto]">
        <input name="name" placeholder="Resource name" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="fileUrl" placeholder="https://..." className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="fileType" placeholder="pdf" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input name="fileSize" type="number" min={0} placeholder="Size bytes" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <button type="submit" disabled={pending} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? 'Adding...' : 'Add'}
        </button>
      </form>
      {state.formError && <p className="mt-2 text-xs font-semibold text-error">{state.formError}</p>}
      {Object.values(state.fieldErrors ?? {}).flat()[0] && <p className="mt-2 text-xs font-semibold text-error">{Object.values(state.fieldErrors ?? {}).flat()[0]}</p>}
    </div>
  );
}
