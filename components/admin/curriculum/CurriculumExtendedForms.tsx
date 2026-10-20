'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  ModuleSummary,
  ModuleQuiz,
  WeeklyAssignment,
  QuizQuestion,
  QuizOption,
  AssignmentResource,
} from '@prisma/client';
import {
  ExternalLink,
  Presentation,
  Video,
  Award,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  HelpCircle,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Upload,
  Link2,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { CurriculumFormState } from '@/app/admin/(protected)/courses/[id]/curriculum/actions';
import {
  deleteQuizQuestionAction,
  saveQuizQuestionAction,
  moveQuizQuestionAction,
  upsertModuleQuizAction,
} from '@/app/admin/(protected)/courses/[id]/curriculum/actions';
import { uploadFileDirectToR2 } from '@/lib/resources/r2-uploader';

const initialState: CurriculumFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.[0]) return null;
  return <p className="text-error mt-1 text-xs font-semibold">{errors[0]}</p>;
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
  const [resourceType, setResourceType] = useState<'SLIDE' | 'VIDEO'>(
    summary?.resourceType ?? 'SLIDE'
  );
  const [resourceUrl, setResourceUrl] = useState(summary?.resourceUrl ?? '');

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onDone?.();
    }
  }, [state.success, router, onDone]);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/40 p-5 shadow-xs"
    >
      <div className="flex items-center gap-2 border-b border-indigo-100 pb-3">
        <Presentation className="h-5 w-5 text-indigo-600" />
        <h4 className="text-sm font-bold tracking-wider text-indigo-900 uppercase">
          {summary ? 'Edit Module Summary' : 'Add Module Summary (Slide / Video)'}
        </h4>
      </div>

      {state.formError && <p className="text-error text-sm font-semibold">{state.formError}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-600 uppercase">Summary Title</label>
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
          <label className="block text-xs font-bold text-slate-600 uppercase">
            Resource Delivery Format
          </label>
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
          <label className="block text-xs font-bold text-slate-600 uppercase">
            Estimated Duration (Minutes)
          </label>
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
        <label className="block text-xs font-bold text-slate-600 uppercase">
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
        <label className="block text-xs font-bold text-slate-600 uppercase">
          Summary Brief / Notes (Markdown supported)
        </label>
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
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
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

export type QuestionWithOptions = QuizQuestion & {
  options: QuizOption[];
};

export function ModuleQuizForm({
  courseId,
  moduleId,
  action,
  quiz,
  questions = [],
  onDone,
}: {
  courseId: string;
  moduleId?: string;
  action?: (state: CurriculumFormState, formData: FormData) => Promise<CurriculumFormState>;
  quiz?: ModuleQuiz | null;
  questions?: QuestionWithOptions[];
  onDone?: () => void;
}) {
  const router = useRouter();
  const serverAction = action ?? upsertModuleQuizAction;
  const [state, formAction, pending] = useActionState(serverAction, initialState);
  const activeQuizId = state.quizId ?? quiz?.id ?? null;

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  const handleDone = () => {
    router.refresh();
    onDone?.();
  };

  const targetModuleId = moduleId ?? quiz?.moduleId ?? '';

  return (
    <div className="space-y-4">
      <form
        action={formAction}
        className="space-y-4 rounded-xl border-2 border-amber-200 bg-amber-50/40 p-5 shadow-xs"
      >
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="moduleId" value={targetModuleId} />

        <div className="flex items-center gap-2 border-b border-amber-100 pb-3">
          <Award className="h-5 w-5 text-amber-600" />
          <h4 className="text-sm font-bold tracking-wider text-amber-900 uppercase">
            {quiz || activeQuizId ? 'Edit Module Quiz' : 'Add Module Quiz'}
          </h4>
        </div>

        {state.formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            {state.formError}
          </div>
        )}
        {state.success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
            Quiz saved. You can now add questions below.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-600 uppercase">Quiz Title</label>
            <input
              name="title"
              defaultValue={quiz?.title ?? 'Module Mastery Quiz'}
              placeholder="e.g. Data Literacy Module 1 Knowledge Check"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              required
            />
            <FieldError errors={state.fieldErrors?.title} />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-600 uppercase">
              Quiz Description (Optional)
            </label>
            <textarea
              name="description"
              defaultValue={quiz?.description ?? ''}
              rows={2}
              placeholder="Short overview or summary of what this quiz covers..."
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />
            <FieldError errors={state.fieldErrors?.description} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase">
              Passing Score (%)
            </label>
            <input
              name="passingScore"
              type="number"
              min={1}
              max={100}
              defaultValue={quiz?.passingScore ?? 70}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              required
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Benchmark requirement: default 70% threshold
            </p>
            <FieldError errors={state.fieldErrors?.passingScore} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase">
              Attempt Policy
            </label>
            <select
              name="attemptPolicy"
              defaultValue={(quiz as any)?.attemptPolicy ?? 'UNLIMITED'}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            >
              <option value="UNLIMITED">Unlimited Attempts (Recommended)</option>
              <option value="LIMITED">Limited Attempts (Custom Max)</option>
            </select>
            <p className="mt-1 text-[11px] text-slate-500">
              Control student retry allowances
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase">
              Max Attempts (If Limited)
            </label>
            <input
              name="maxAttempts"
              type="number"
              min={1}
              max={50}
              defaultValue={quiz?.maxAttempts ?? 2}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              required
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Enforced only when policy is Limited Attempts
            </p>
            <FieldError errors={state.fieldErrors?.maxAttempts} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase">
              Time Limit (Minutes, optional)
            </label>
            <input
              name="timeLimitMinutes"
              type="number"
              min={1}
              defaultValue={quiz?.timeLimitMinutes ?? ''}
              placeholder="e.g. 15 (leave blank for untimed)"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            />
            <FieldError errors={state.fieldErrors?.timeLimitMinutes} />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase">Status</label>
            <select
              name="status"
              defaultValue={quiz?.status ?? 'DRAFT'}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <FieldError errors={state.fieldErrors?.status} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase">
            Instructions / Guidelines
          </label>
          <textarea
            name="instructions"
            defaultValue={
              quiz?.instructions ??
              'Complete this quiz to test your comprehension of this module. A score of 70% or higher is required to pass.'
            }
            rows={3}
            placeholder="Provide student guidelines, scoring rules, or focus topics..."
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
          <FieldError errors={state.fieldErrors?.instructions} />
        </div>

        <div className="space-y-3 rounded-lg border border-amber-200 bg-white/80 p-4">
          <h5 className="text-xs font-bold tracking-wider text-amber-900 uppercase">
            Assessment Behavior &amp; Display
          </h5>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                name="randomizeQuestions"
                defaultChecked={quiz?.randomizeQuestions ?? false}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span>Randomize Question Order</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                name="randomizeOptions"
                defaultChecked={quiz?.randomizeOptions ?? false}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span>Randomize Option Order</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                name="showResults"
                defaultChecked={quiz?.showResults ?? true}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span>Display Score Immediately</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                name="showExplanations"
                defaultChecked={quiz?.showExplanations ?? true}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span>Show Explanations to Students</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                name="requirePassingToProgress"
                value="true"
                defaultChecked={(quiz as any)?.requirePassingToProgress ?? true}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span>Require Passing Score to Unlock Next Module</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                name="allowLearningAfterExhausted"
                value="true"
                defaultChecked={(quiz as any)?.allowLearningAfterExhausted ?? true}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span>Allow Lesson Reviews After Attempts Exhausted</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                name="allowAttemptRequests"
                value="true"
                defaultChecked={(quiz as any)?.allowAttemptRequests ?? true}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span>Allow Students to Request Extra Attempts</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-amber-100 pt-3">
          {onDone && (
            <button
              type="button"
              onClick={handleDone}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Done
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

        {!activeQuizId && (
          <div className="space-y-3 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/40 p-6 text-center shadow-xs">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h5 className="text-sm font-bold text-amber-950">
                Quiz Questions &amp; Answer Choices
              </h5>
              <p className="mx-auto max-w-md text-xs text-slate-600">
                Save the quiz configuration above to start adding questions. Once saved, the
                question authoring builder will immediately unlock right here.
              </p>
            </div>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-amber-700 disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />
              {pending ? 'Saving Quiz...' : 'Save Quiz to Add Questions'}
            </button>
          </div>
        )}
      </form>

      {activeQuizId && (
        <QuizQuestionManager courseId={courseId} quizId={activeQuizId} questions={questions} />
      )}
    </div>
  );
}

export function QuizQuestionManager({
  courseId,
  quizId,
  questions = [],
}: {
  courseId: string;
  quizId: string;
  questions: QuestionWithOptions[];
}) {
  const router = useRouter();
  const [prevQuestions, setPrevQuestions] = useState<QuestionWithOptions[]>(questions);
  const [questionList, setQuestionList] = useState<QuestionWithOptions[]>(questions);
  const [editingQuestion, setEditingQuestion] = useState<QuestionWithOptions | 'new' | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (questions !== prevQuestions) {
    setPrevQuestions(questions);
    setQuestionList(questions);
  }

  const handleQuestionSaved = (saved: QuestionWithOptions) => {
    setQuestionList((prev) => {
      const idx = prev.findIndex((q) => q.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    setEditingQuestion(null);
  };

  const handleDelete = async (questionId: string) => {
    if (!window.confirm('Delete this question and all its choices?')) return;
    setDeletingId(questionId);
    setActionError(null);
    try {
      await deleteQuizQuestionAction(courseId, questionId);
      setQuestionList((prev) => prev.filter((q) => q.id !== questionId));
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete question.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleMove = async (questionId: string, direction: 'UP' | 'DOWN') => {
    setReorderingId(questionId);
    setActionError(null);
    try {
      const formData = new FormData();
      formData.set('courseId', courseId);
      formData.set('quizId', quizId);
      formData.set('questionId', questionId);
      formData.set('direction', direction.toLowerCase());

      await moveQuizQuestionAction(formData);
      // Optimistic swap
      setQuestionList((prev) => {
        const idx = prev.findIndex((q) => q.id === questionId);
        if (idx === -1) return prev;
        const targetIdx = direction === 'UP' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= prev.length) return prev;
        const copy = [...prev];
        const temp = copy[idx];
        copy[idx] = copy[targetIdx];
        copy[targetIdx] = temp;
        return copy;
      });
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reorder question.');
    } finally {
      setReorderingId(null);
    }
  };

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-amber-200 bg-amber-50/20 p-4">
      <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-amber-600" />
          <h5 className="text-xs font-bold tracking-wider text-amber-950 uppercase">
            Quiz Questions ({questionList.length})
          </h5>
        </div>
        {editingQuestion === null && (
          <button
            type="button"
            onClick={() => {
              setActionError(null);
              setEditingQuestion('new');
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-amber-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Question
          </button>
        )}
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-600">
          {actionError}
        </div>
      )}

      {editingQuestion !== null ? (
        <QuizQuestionEditor
          courseId={courseId}
          quizId={quizId}
          question={editingQuestion === 'new' ? null : editingQuestion}
          onSaved={handleQuestionSaved}
          onDone={() => setEditingQuestion(null)}
        />
      ) : questionList.length === 0 ? (
        <div className="rounded-lg border border-dashed border-amber-300 bg-white/70 p-6 text-center">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <HelpCircle className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold text-slate-800">No questions added yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Add questions with multiple-choice options to test student comprehension.
          </p>
          <button
            type="button"
            onClick={() => setEditingQuestion('new')}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-amber-700"
          >
            <Plus className="h-3.5 w-3.5" /> Create First Question
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {questionList.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs transition hover:border-amber-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      Q{idx + 1}
                    </span>
                    <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      {q.points} pt{q.points !== 1 ? 's' : ''}
                    </span>
                    {q.hint && (
                      <span className="text-[11px] text-slate-400 italic">Hint: {q.hint}</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{q.questionText}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(q.id, 'UP')}
                    disabled={idx === 0 || reorderingId !== null}
                    className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(q.id, 'DOWN')}
                    disabled={idx === questionList.length - 1 || reorderingId !== null}
                    className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingQuestion(q)}
                    className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    title="Edit question"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(q.id)}
                    disabled={deletingId === q.id}
                    className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                    title="Delete question"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {q.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs ${
                      opt.isCorrect
                        ? 'border-emerald-300 bg-emerald-50/70 font-semibold text-emerald-900'
                        : 'border-slate-200 bg-slate-50/50 text-slate-700'
                    }`}
                  >
                    {opt.isCorrect ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    ) : (
                      <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-300" />
                    )}
                    <span className="truncate">{opt.optionText}</span>
                  </div>
                ))}
              </div>

              {q.explanation && (
                <p className="mt-2 border-t border-slate-100 pt-1.5 text-xs text-slate-500">
                  <strong>Explanation:</strong> {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function QuizQuestionEditor({
  courseId,
  quizId,
  question,
  onSaved,
  onDone,
}: {
  courseId: string;
  quizId: string;
  question: QuestionWithOptions | null;
  onSaved?: (saved: QuestionWithOptions) => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const [options, setOptions] = useState<Array<{ id?: string; optionText: string }>>(
    question?.options && question.options.length > 0
      ? question.options.map((o) => ({ id: o.id, optionText: o.optionText }))
      : [{ optionText: '' }, { optionText: '' }, { optionText: '' }, { optionText: '' }]
  );
  const initialCorrectIndex = question?.options
    ? Math.max(
        0,
        question.options.findIndex((o) => o.isCorrect)
      )
    : 0;
  const [correctIndex, setCorrectIndex] = useState<number>(
    initialCorrectIndex >= 0 ? initialCorrectIndex : 0
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOptionChange = (idx: number, text: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], optionText: text };
      return next;
    });
  };

  const handleAddOption = () => {
    if (options.length >= 6) return;
    setOptions((prev) => [...prev, { optionText: '' }]);
  };

  const handleRemoveOption = (idx: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== idx));
    if (correctIndex === idx) {
      setCorrectIndex(0);
    } else if (correctIndex > idx) {
      setCorrectIndex((c) => c - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('correctOptionIndex', String(correctIndex));

    const optionsPayload = options.map((opt, i) => ({
      id: opt.id,
      optionText: opt.optionText.trim(),
      isCorrect: i === correctIndex,
      order: i,
    }));

    if (optionsPayload.some((o) => !o.optionText)) {
      setError('All option choices must have non-empty text.');
      setIsSubmitting(false);
      return;
    }

    if (optionsPayload.length < 2) {
      setError('Quiz questions must provide at least 2 answer choices.');
      setIsSubmitting(false);
      return;
    }

    formData.set('optionsJson', JSON.stringify(optionsPayload));

    try {
      const res = await saveQuizQuestionAction(
        courseId,
        quizId,
        question?.id || null,
        {},
        formData
      );
      if (res.formError) {
        setError(res.formError);
      } else if (res.fieldErrors) {
        const firstErr = Object.values(res.fieldErrors)[0]?.[0];
        setError(firstErr || 'Validation failed.');
      } else {
        if (res.question && onSaved) {
          onSaved(res.question);
        }
        router.refresh();
        onDone();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-amber-300 bg-white p-4 shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-amber-100 pb-2">
        <h5 className="text-xs font-bold tracking-wider text-amber-900 uppercase">
          {question ? 'Edit Question' : 'New Question'}
        </h5>
        <button type="button" onClick={onDone} className="text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-3">
          <label className="block text-xs font-bold text-slate-600 uppercase">
            Question Prompt / Text
          </label>
          <textarea
            name="questionText"
            defaultValue={question?.questionText ?? ''}
            rows={2}
            placeholder="e.g. Which metric measures linear relationship between two continuous variables?"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase">Points</label>
          <input
            name="points"
            type="number"
            min={0.5}
            step={0.5}
            defaultValue={question?.points ?? 1}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-600 uppercase">
            Answer Choices (Select the correct option)
          </label>
          {options.length < 6 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              + Add Choice
            </button>
          )}
        </div>

        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <label
                className={`flex cursor-pointer items-center justify-center rounded-lg border p-2 transition ${
                  correctIndex === idx
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
                title="Mark this option as correct"
              >
                <input
                  type="radio"
                  name="correctSelector"
                  checked={correctIndex === idx}
                  onChange={() => setCorrectIndex(idx)}
                  className="sr-only"
                />
                <Check
                  className={`h-4 w-4 ${correctIndex === idx ? 'opacity-100' : 'opacity-20'}`}
                />
              </label>

              <input
                name={`optionText_${idx}`}
                type="text"
                value={opt.optionText}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                placeholder={`Option ${idx + 1}`}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                  correctIndex === idx
                    ? 'border-emerald-400 bg-emerald-50/20 focus:border-emerald-600'
                    : 'border-slate-300 bg-white focus:border-amber-500'
                }`}
                required
              />
              {opt.id && <input type="hidden" name={`optionId_${idx}`} value={opt.id} />}

              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(idx)}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  title="Remove option"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 pt-1 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase">
            Hint (Optional)
          </label>
          <input
            name="hint"
            defaultValue={question?.hint ?? ''}
            placeholder="e.g. Think of Pearson..."
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase">
            Explanation (Optional)
          </label>
          <input
            name="explanation"
            defaultValue={question?.explanation ?? ''}
            placeholder="Shown after student submits quiz..."
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-amber-100 pt-3">
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-amber-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Saving Question...' : 'Save Question'}
        </button>
      </div>
    </form>
  );
}

export function WeeklyAssignmentForm({
  action,
  assignment,
  courseId,
  weekId,
  onDone,
}: {
  action: (state: CurriculumFormState, formData: FormData) => Promise<CurriculumFormState>;
  assignment?: (WeeklyAssignment & { resources?: AssignmentResource[] }) | null;
  courseId?: string;
  weekId?: string;
  onDone?: () => void;
}) {
  const router = useRouter();

  // Controlled form values so inputs never clear on error
  const [title, setTitle] = useState(assignment?.title ?? 'Weekly Practical Assignment');
  const [description, setDescription] = useState(assignment?.description ?? '');
  const [instructions, setInstructions] = useState(assignment?.instructions ?? '');
  const [submissionType, setSubmissionType] = useState<string>(
    assignment?.submissionType ?? 'FILE_OR_TEXT'
  );
  const [dueDateDays, setDueDateDays] = useState<string | number>(assignment?.dueDateDays ?? 7);
  const [dueAt, setDueAt] = useState(
    assignment?.dueAt ? new Date(assignment.dueAt).toISOString().slice(0, 16) : ''
  );
  const [maxScore, setMaxScore] = useState<string | number>(assignment?.maxScore ?? '');
  const [status, setStatus] = useState<string>(assignment?.status ?? 'DRAFT');

  // Existing resources if present
  const existingFileResource = assignment?.resources?.find((r) => r.resourceType === 'FILE');
  const existingLinkResource = assignment?.resources?.find((r) => r.resourceType === 'LINK');

  const isExistingR2 =
    assignment?.datasetUrl?.startsWith('r2://') || Boolean(existingFileResource?.storageKey);
  const existingR2Key =
    existingFileResource?.storageKey ||
    (assignment?.datasetUrl?.startsWith('r2://') ? assignment.datasetUrl.slice(5) : null);
  const existingExternalUrl =
    existingLinkResource?.externalUrl || (!isExistingR2 ? (assignment?.datasetUrl ?? '') : '');

  // Dataset attachment state
  const [datasetUrl, setDatasetUrl] = useState(existingExternalUrl);
  const [datasetName, setDatasetName] = useState(
    assignment?.datasetName ?? existingFileResource?.label ?? existingLinkResource?.label ?? ''
  );
  const [removeDataset, setRemoveDataset] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [uploadedDatasetKey, setUploadedDatasetKey] = useState<string | null>(existingR2Key);

  // Submission & diagnostic state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const submitLock = useRef(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitLock.current) return;
    submitLock.current = true;

    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    setSaveSuccess(false);
    setUploadStatusText(null);
    setUploadProgress(0);

    // Client-side quick validation
    const errs: Record<string, string[]> = {};
    if (!title.trim()) {
      errs.title = ['Assignment title is required.'];
    }
    if (!description.trim()) {
      errs.description = ['Brief description is required.'];
    }
    if (!instructions.trim()) {
      errs.instructions = ['Detailed instructions are required.'];
    }
    if (selectedFile && selectedFile.size > 4 * 1024 * 1024) {
      errs.datasetFile = ['Dataset file exceeds the 4 MB maximum limit.'];
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setFormError(Object.values(errs).flat()[0] || 'Please fix the errors below.');
      setIsSubmitting(false);
      submitLock.current = false;
      return;
    }

    let finalUploadedKey = uploadedDatasetKey;

    try {
      // 1. Direct R2 upload if a new local file was selected and not yet uploaded
      if (selectedFile && !finalUploadedKey && courseId) {
        setUploadStatusText('Uploading dataset directly to Cloudflare R2...');
        try {
          const uploadRes = await uploadFileDirectToR2({
            file: selectedFile,
            courseId,
            weekId,
            resourceType: 'DATASET',
            onStorageKey: (storageKey) => {
              finalUploadedKey = storageKey;
              setUploadedDatasetKey(storageKey);
            },
            onProgress: (percent) => {
              setUploadProgress(percent);
              setUploadStatusText(`Uploading dataset to Cloudflare R2 (${percent}%)...`);
            },
          });
          finalUploadedKey = uploadRes.storageKey;
          setUploadedDatasetKey(finalUploadedKey);
          setUploadStatusText('Dataset uploaded to R2. Persisting assignment in database...');
        } catch (uploadErr) {
          console.error('Direct R2 upload error:', uploadErr);
          throw new Error(
            uploadErr instanceof Error
              ? `Cloudflare R2 Upload Failed: ${uploadErr.message}`
              : 'Failed to upload dataset to Cloudflare R2.'
          );
        }
      }

      // 2. Prepare payload
      const formData = new FormData();
      if (courseId) formData.set('courseId', courseId);
      if (weekId) formData.set('weekId', weekId);
      formData.set('title', title.trim());
      formData.set('description', description.trim());
      formData.set('instructions', instructions.trim());
      formData.set('submissionType', submissionType);
      formData.set('status', status);
      if (dueDateDays) formData.set('dueDateDays', String(dueDateDays));
      if (dueAt) formData.set('dueAt', dueAt);
      if (maxScore !== '' && maxScore !== null && maxScore !== undefined) {
        formData.set('maxScore', String(maxScore));
      }
      if (datasetName) formData.set('datasetName', datasetName.trim());
      if (datasetUrl) formData.set('datasetUrl', datasetUrl.trim());
      if (removeDataset) formData.set('removeDataset', 'true');
      formData.set('submissionRequirements', '');

      if (finalUploadedKey) {
        formData.set('uploadedDatasetKey', finalUploadedKey);
      } else if (selectedFile && !finalUploadedKey) {
        // Fallback for cases where direct upload wasn't used
        formData.set('datasetFile', selectedFile);
      }

      // Let the Server Action response determine save success. A client timer
      // race can report failure while the database transaction later commits.
      const res = await action({}, formData);

      if (res.formError) {
        setFormError(res.formError);
        if (res.formError.includes('could not be verified in storage')) {
          setUploadedDatasetKey(null);
        }
      } else if (res.fieldErrors && Object.keys(res.fieldErrors).length > 0) {
        setFieldErrors(res.fieldErrors);
        const firstMsg = Object.values(res.fieldErrors).flat()[0];
        setFormError(firstMsg || 'Validation error while saving assignment.');
      } else if (res.success) {
        setSaveSuccess(true);
        router.refresh();
        onDone?.();
      } else {
        setFormError('Failed to save assignment. Please check entered fields and try again.');
      }
    } catch (err: unknown) {
      console.error('Weekly assignment save failure:', err);
      setFormError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while saving the assignment.'
      );
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
      setUploadStatusText(null);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-5 shadow-xs"
    >
      <input type="hidden" name="removeDataset" value={removeDataset ? 'true' : 'false'} />
      <input type="hidden" name="submissionRequirements" value="" />
      {courseId && <input type="hidden" name="courseId" value={courseId} />}
      {weekId && <input type="hidden" name="weekId" value={weekId} />}

      <div className="flex items-center gap-2 border-b border-emerald-100 pb-3">
        <BookOpen className="h-5 w-5 text-emerald-600" />
        <h4 className="text-sm font-bold tracking-wider text-emerald-900 uppercase">
          {assignment
            ? 'Edit Weekly Assignment'
            : 'Add Weekly Assignment (Capstone / Practical Lab)'}
        </h4>
      </div>

      {formError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div>
            <span className="font-bold">Error saving assignment: </span>
            <span>{formError}</span>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
          Assignment saved successfully!
        </div>
      )}

      {uploadStatusText && (
        <div className="space-y-1.5 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900">
          <div className="flex items-center justify-between font-bold">
            <span>{uploadStatusText}</span>
            {uploadProgress > 0 && <span>{uploadProgress}%</span>}
          </div>
          {uploadProgress > 0 && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-emerald-200">
              <div
                className="h-full bg-emerald-600 transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-600 uppercase">
            Assignment Title <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Week 1 Practical Lab: Dataset Cleaning and Exploration"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            required
          />
          <FieldError errors={fieldErrors.title} />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-600 uppercase">
            Brief Description <span className="text-red-500">*</span>
          </label>
          <input
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Overview of practical scenario and learning goals..."
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            required
          />
          <FieldError errors={fieldErrors.description} />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-600 uppercase">
            Detailed Instructions &amp; Tasks <span className="text-red-500">*</span>
          </label>
          <textarea
            name="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={4}
            placeholder="Step 1: Download the dataset&#10;Step 2: Perform analysis in Excel/Power BI/Python&#10;Step 3: Document your conclusions and submit..."
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            required
          />
          <FieldError errors={fieldErrors.instructions} />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase">
            Submission Format
          </label>
          <select
            name="submissionType"
            value={submissionType}
            onChange={(e) => setSubmissionType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="FILE_OR_TEXT">File Upload or Document Link</option>
            <option value="FILE_ONLY">File Upload Only (CSV, PBIX, Excel, PDF, ZIP)</option>
            <option value="TEXT_ONLY">Online Link Only (Google Drive, Sheets)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase">Status</label>
          <select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="DRAFT">Draft (Admin only)</option>
            <option value="PUBLISHED">Published (Visible to students)</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase">
            Due Date (Days from week unlock)
          </label>
          <input
            name="dueDateDays"
            type="number"
            min={1}
            value={dueDateDays}
            onChange={(e) => setDueDateDays(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <FieldError errors={fieldErrors.dueDateDays} />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase">
            Exact Due Date &amp; Time (optional)
          </label>
          <input
            name="dueAt"
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <FieldError errors={fieldErrors.dueAt} />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase">
            Maximum Score / Points (optional)
          </label>
          <input
            name="maxScore"
            type="number"
            min="0.01"
            step="0.01"
            value={maxScore}
            onChange={(e) => setMaxScore(e.target.value)}
            placeholder="e.g. 100 or 10 (leave blank for unranked feedback)"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
          <FieldError errors={fieldErrors.maxScore} />
        </div>
      </div>

      {/* DATASET & PRACTICAL STARTER RESOURCES SECTION */}
      <div className="space-y-4 rounded-xl border border-emerald-300 bg-white/90 p-4 shadow-2xs">
        <div className="border-b border-emerald-100 pb-2.5">
          <h5 className="text-xs font-bold tracking-wider text-emerald-950 uppercase">
            Assignment Dataset &amp; Resources (Upload File, External Link, or Both)
          </h5>
          <p className="mt-0.5 text-xs text-slate-500">
            Attach supporting materials for this assignment. You can upload a starter file to
            Cloudflare R2, provide a Google Drive / Sheets link, or attach both.
          </p>
        </div>

        {/* Existing Dataset Notice */}
        {((isExistingR2 && uploadedDatasetKey) || existingExternalUrl) && !removeDataset && (
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-emerald-700" />
              <div>
                <span className="font-bold text-emerald-900">
                  Current Resource: {datasetName || 'Attached Dataset'}
                </span>
                <span className="ml-2 text-slate-500">
                  (
                  {uploadedDatasetKey ? 'File in Cloudflare R2' : 'Google Drive / External link'}
                  )
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setRemoveDataset(true);
                setDatasetUrl('');
                setDatasetName('');
                setSelectedFile(null);
                setSelectedFileName(null);
                setUploadedDatasetKey(null);
              }}
              className="font-bold text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        )}

        {removeDataset && (
          <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
            <span>Attached dataset will be removed upon saving.</span>
            <button
              type="button"
              onClick={() => setRemoveDataset(false)}
              className="text-emerald-800 underline hover:text-emerald-950"
            >
              Undo
            </button>
          </div>
        )}

        {!removeDataset && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase">
                Resource Display Label (Optional)
              </label>
              <input
                name="datasetName"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="e.g. Sales_Data_Q1.xlsx or Patient Cohort Dataset"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
              <FieldError errors={fieldErrors.datasetName} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Option A: Upload file directly */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase">
                  <Upload className="h-3.5 w-3.5 text-emerald-600" />
                  Option A: Upload Dataset File (Cloudflare R2)
                </label>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Supports .csv, .xlsx, .xls, .zip, .json, .pdf, .pbix, .ipynb, .txt (Max 4 MB)
                </p>
                <input
                  name="datasetFile"
                  type="file"
                  accept=".csv,.xlsx,.xls,.zip,.json,.pdf,.pbix,.ipynb,.txt,.parquet"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setSelectedFile(f);
                    setSelectedFileName(
                      f ? `${f.name} (${(f.size / (1024 * 1024)).toFixed(2)} MB)` : null
                    );
                    setUploadedDatasetKey(null);
                    if (f && !datasetName) {
                      setDatasetName(f.name);
                    }
                  }}
                  className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs file:mr-2 file:rounded-md file:border-0 file:bg-emerald-600 file:px-2.5 file:py-1 file:text-xs file:font-bold file:text-white hover:file:bg-emerald-700"
                />
                {selectedFileName && (
                  <div className="mt-1.5 flex items-center justify-between text-xs font-semibold text-emerald-700">
                    <span>Selected: {selectedFileName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setSelectedFileName(null);
                        setUploadedDatasetKey(null);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Clear
                    </button>
                  </div>
                )}
                <FieldError errors={fieldErrors.datasetFile} />
              </div>

              {/* Option B: External Google Drive / Sheets Link */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase">
                  <Link2 className="h-3.5 w-3.5 text-emerald-600" />
                  Option B: Google Drive / Sheets / External URL
                </label>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Paste a shareable Google Sheets or Drive dataset link
                </p>
                <div className="mt-2 flex gap-2">
                  <input
                    name="datasetUrl"
                    value={datasetUrl}
                    onChange={(e) => setDatasetUrl(e.target.value)}
                    placeholder="https://drive.google.com/... or docs.google.com/spreadsheets/..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                  {datasetUrl && (
                    <a
                      href={datasetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                    >
                      <ExternalLink className="h-3 w-3" /> Test Link
                    </a>
                  )}
                </div>
                <FieldError errors={fieldErrors.datasetUrl} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t border-emerald-100 pt-3">
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting
            ? uploadStatusText
              ? 'Uploading & Saving...'
              : 'Saving Assignment...'
            : 'Save Assignment'}
        </button>
      </div>
    </form>
  );
}
