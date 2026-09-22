'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Plus,
  Trash2,
  Presentation,
  Video,
  Award,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import type {
  Course,
  CourseModule,
  CourseWeek,
  Lesson,
  LessonResource,
  ModuleSummary,
  ModuleQuiz,
  WeeklyAssignment,
  QuizQuestion,
  QuizOption,
} from '@prisma/client';
import {
  createLessonAction,
  createModuleAction,
  createWeekAction,
  deleteLessonAction,
  deleteModuleAction,
  deleteWeekAction,
  moveLessonAction,
  moveModuleAction,
  moveWeekAction,
  updateModuleAction,
  updateWeekAction,
  upsertModuleSummaryAction,
  deleteModuleSummaryAction,
  upsertModuleQuizAction,
  deleteModuleQuizAction,
  upsertWeeklyAssignmentAction,
  deleteWeeklyAssignmentAction,
} from '@/app/admin/(protected)/courses/[id]/curriculum/actions';
import { CourseStatusBadge } from '@/components/admin/courses/CourseStatusBadge';
import { InlineLessonForm, ModuleForm, WeekForm } from './CurriculumForms';
import {
  ModuleSummaryForm,
  ModuleQuizForm,
  WeeklyAssignmentForm,
  QuizQuestionManager,
} from './CurriculumExtendedForms';
import { ReorderButton } from './ReorderButton';
import { ResourceManager } from './ResourceManager';

type LessonWithResources = Lesson & { resources: LessonResource[] };
type QuizWithQuestions = ModuleQuiz & {
  questions: Array<QuizQuestion & { options: QuizOption[] }>;
};
type ModuleWithLessons = CourseModule & {
  lessons: LessonWithResources[];
  summary: ModuleSummary | null;
  quiz: QuizWithQuestions | null;
};
type WeekWithModules = CourseWeek & {
  modules: ModuleWithLessons[];
  assignment: WeeklyAssignment | null;
};
type CourseWithCurriculum = Course & { weeks: WeekWithModules[] };

export function CurriculumBuilder({ course }: { course: CourseWithCurriculum }) {
  const [addingWeek, setAddingWeek] = useState(false);
  const [editingWeek, setEditingWeek] = useState<string | null>(null);
  const [addingModule, setAddingModule] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [addingLesson, setAddingLesson] = useState<string | null>(null);
  const [editingSummary, setEditingSummary] = useState<string | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<string | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<string | null>(null);

  const [openWeeks, setOpenWeeks] = useState(() => new Set(course.weeks.map((week) => week.id)));
  const [openModules, setOpenModules] = useState(
    () => new Set(course.weeks.flatMap((week) => week.modules.map((module) => module.id)))
  );

  const counts = useMemo(() => {
    const modules = course.weeks.reduce((sum, week) => sum + week.modules.length, 0);
    const lessons = course.weeks.reduce(
      (sum, week) => sum + week.modules.reduce((inner, module) => inner + module.lessons.length, 0),
      0
    );
    const summaries = course.weeks.reduce(
      (sum, week) => sum + week.modules.filter((m) => !!m.summary).length,
      0
    );
    const quizzes = course.weeks.reduce(
      (sum, week) => sum + week.modules.filter((m) => !!m.quiz).length,
      0
    );
    const assignments = course.weeks.filter((w) => !!w.assignment).length;
    return { weeks: course.weeks.length, modules, lessons, summaries, quizzes, assignments };
  }, [course.weeks]);

  const nextWeekNumber = Math.max(0, ...course.weeks.map((week) => week.weekNumber)) + 1;

  function toggleWeek(id: string) {
    setOpenWeeks((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleModule(id: string) {
    setOpenModules((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CourseStatusBadge status={course.status} />
              <span className="bg-surface-light text-primary rounded-full px-2.5 py-1 text-xs font-bold">
                {course.category}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                {course.level}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                {course.duration}
              </span>
            </div>
            <h2 className="mt-4 text-3xl font-bold text-slate-950">{course.title}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {course.status === 'PUBLISHED'
                ? 'This course is currently published. Changes will directly update the syllabus hierarchy.'
                : 'Changes will not be visible publicly until the course is published.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/courses/${course.id}`}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Course Overview
            </Link>
            <Link
              href={`/admin/courses/${course.id}/edit`}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Edit Course
            </Link>
            <Link
              href={`/admin/courses/${course.id}/preview`}
              className="bg-primary hover:bg-secondary rounded-lg px-3 py-2 text-sm font-semibold text-white"
            >
              Preview
            </Link>
          </div>
        </div>

        {/* 7-part curriculum summary stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="bg-neutral-light rounded-lg p-3">
            <p className="text-xl font-bold text-slate-950">{counts.weeks}</p>
            <p className="text-xs font-semibold text-slate-500">Weeks</p>
          </div>
          <div className="bg-neutral-light rounded-lg p-3">
            <p className="text-xl font-bold text-slate-950">{counts.modules}</p>
            <p className="text-xs font-semibold text-slate-500">Modules</p>
          </div>
          <div className="bg-neutral-light rounded-lg p-3">
            <p className="text-xl font-bold text-slate-950">{counts.lessons}</p>
            <p className="text-xs font-semibold text-slate-500">Lessons</p>
          </div>
          <div className="rounded-lg bg-indigo-50/60 p-3">
            <p className="text-xl font-bold text-indigo-900">{counts.summaries}</p>
            <p className="text-xs font-semibold text-indigo-700">Summaries</p>
          </div>
          <div className="rounded-lg bg-amber-50/60 p-3">
            <p className="text-xl font-bold text-amber-900">{counts.quizzes}</p>
            <p className="text-xs font-semibold text-amber-700">Quizzes</p>
          </div>
          <div className="rounded-lg bg-emerald-50/60 p-3">
            <p className="text-xl font-bold text-emerald-900">{counts.assignments}</p>
            <p className="text-xs font-semibold text-emerald-700">Assignments</p>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-950">
            Curriculum Structure &amp; Learning Flow
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Structured as: Week → Module → Lessons (Slide/Video) → Module Summary → Module Quiz →
            Weekly Assignment
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setOpenWeeks(new Set(course.weeks.map((week) => week.id)));
              setOpenModules(
                new Set(course.weeks.flatMap((week) => week.modules.map((module) => module.id)))
              );
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={() => {
              setOpenWeeks(new Set());
              setOpenModules(new Set());
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
          >
            Collapse All
          </button>
          <button
            type="button"
            onClick={() => setAddingWeek(true)}
            className="bg-primary hover:bg-secondary inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" /> Add Week
          </button>
        </div>
      </div>

      {addingWeek && (
        <WeekForm
          action={createWeekAction.bind(null, course.id)}
          defaultWeekNumber={nextWeekNumber}
          onDone={() => setAddingWeek(false)}
        />
      )}

      {course.weeks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h3 className="text-lg font-bold text-slate-950">This course has no curriculum yet.</h3>
          <p className="mt-2 text-sm text-slate-500">
            Start building your course by adding your first week.
          </p>
          <button
            type="button"
            onClick={() => setAddingWeek(true)}
            className="bg-primary hover:bg-secondary mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" /> Add your first week
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {course.weeks.map((week, weekIndex) => {
            const weekOpen = openWeeks.has(week.id);
            return (
              <section
                key={week.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                {/* Week Header */}
                <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <button
                    type="button"
                    onClick={() => toggleWeek(week.id)}
                    className="flex min-w-0 items-start gap-2 text-left"
                  >
                    {weekOpen ? (
                      <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-slate-600" />
                    ) : (
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-600" />
                    )}
                    <span>
                      <span className="text-primary block text-xs font-bold tracking-wider uppercase">
                        Week {week.weekNumber}
                      </span>
                      <span className="block text-base font-bold text-slate-950">{week.title}</span>
                      <span className="block text-xs text-slate-500">{week.description}</span>
                    </span>
                  </button>
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={moveWeekAction}>
                      <input type="hidden" name="courseId" value={course.id} />
                      <input type="hidden" name="weekId" value={week.id} />
                      <ReorderButton direction="up" disabled={weekIndex === 0} />
                    </form>
                    <form action={moveWeekAction}>
                      <input type="hidden" name="courseId" value={course.id} />
                      <input type="hidden" name="weekId" value={week.id} />
                      <ReorderButton
                        direction="down"
                        disabled={weekIndex === course.weeks.length - 1}
                      />
                    </form>
                    <button
                      type="button"
                      onClick={() => setEditingWeek(editingWeek === week.id ? null : week.id)}
                      className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                      aria-label="Edit week"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <form
                      action={deleteWeekAction}
                      onSubmit={(event) => {
                        if (
                          !window.confirm(
                            `Delete Week ${week.weekNumber}? This will permanently delete all modules, lessons, assignments, and quizzes inside it.`
                          )
                        )
                          event.preventDefault();
                      }}
                    >
                      <input type="hidden" name="courseId" value={course.id} />
                      <input type="hidden" name="weekId" value={week.id} />
                      <button
                        type="submit"
                        className="text-error rounded-lg border border-red-200 p-2 hover:bg-red-50"
                        aria-label="Delete week"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>

                {editingWeek === week.id && (
                  <div className="border-b border-slate-100 p-4">
                    <WeekForm
                      action={updateWeekAction.bind(null, course.id, week.id)}
                      week={week}
                      onDone={() => setEditingWeek(null)}
                    />
                  </div>
                )}

                {weekOpen && (
                  <div className="space-y-4 p-4">
                    {week.modules.length === 0 && (
                      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                        <p className="text-sm text-slate-500">No modules in this week yet.</p>
                        <button
                          type="button"
                          onClick={() => setAddingModule(week.id)}
                          className="text-primary mt-2 inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add module
                        </button>
                      </div>
                    )}

                    {/* Modules Loop */}
                    {week.modules.map((module, moduleIndex) => {
                      const moduleOpen = openModules.has(module.id);
                      return (
                        <div
                          key={module.id}
                          className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50"
                        >
                          {/* Module Header */}
                          <div className="flex flex-col gap-3 border-b border-slate-100 bg-white p-4 sm:flex-row sm:items-start sm:justify-between">
                            <button
                              type="button"
                              onClick={() => toggleModule(module.id)}
                              className="flex min-w-0 items-start gap-2 text-left"
                            >
                              {moduleOpen ? (
                                <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
                              ) : (
                                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
                              )}
                              <span>
                                <span className="block text-xs font-bold text-slate-500 uppercase">
                                  Module {moduleIndex + 1}
                                </span>
                                <span className="block font-bold text-slate-950">
                                  {module.title}
                                </span>
                                <span className="block text-xs text-slate-500">
                                  {module.description}
                                </span>
                              </span>
                            </button>
                            <div className="flex flex-wrap items-center gap-2">
                              <form action={moveModuleAction}>
                                <input type="hidden" name="courseId" value={course.id} />
                                <input type="hidden" name="moduleId" value={module.id} />
                                <ReorderButton direction="up" disabled={moduleIndex === 0} />
                              </form>
                              <form action={moveModuleAction}>
                                <input type="hidden" name="courseId" value={course.id} />
                                <input type="hidden" name="moduleId" value={module.id} />
                                <ReorderButton
                                  direction="down"
                                  disabled={moduleIndex === week.modules.length - 1}
                                />
                              </form>
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingModule(editingModule === module.id ? null : module.id)
                                }
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                                aria-label="Edit module"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <form
                                action={deleteModuleAction}
                                onSubmit={(event) => {
                                  if (
                                    !window.confirm(
                                      `Delete Module "${module.title}"? This will permanently remove all lessons, summary, and quiz inside it.`
                                    )
                                  )
                                    event.preventDefault();
                                }}
                              >
                                <input type="hidden" name="courseId" value={course.id} />
                                <input type="hidden" name="moduleId" value={module.id} />
                                <button
                                  type="submit"
                                  className="text-error rounded-lg border border-red-200 p-2 hover:bg-red-50"
                                  aria-label="Delete module"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </form>
                            </div>
                          </div>

                          {editingModule === module.id && (
                            <div className="border-b border-slate-100 bg-white p-4">
                              <ModuleForm
                                action={updateModuleAction.bind(null, course.id, module.id)}
                                module={module}
                                onDone={() => setEditingModule(null)}
                              />
                            </div>
                          )}

                          {moduleOpen && (
                            <div className="space-y-3 p-4">
                              {/* Lessons list */}
                              {module.lessons.length === 0 && (
                                <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center">
                                  <p className="text-sm text-slate-500">
                                    No lessons in this module yet.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => setAddingLesson(module.id)}
                                    className="text-primary mt-2 inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
                                  >
                                    <Plus className="h-3.5 w-3.5" /> Add lesson
                                  </button>
                                </div>
                              )}

                              {module.lessons.map((lesson, lessonIndex) => (
                                <div
                                  key={lesson.id}
                                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs"
                                >
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        {lesson.resourceType === 'SLIDE' ? (
                                          <span className="inline-flex items-center gap-1 rounded border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                                            <Presentation className="h-3 w-3" /> Slide
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 rounded border border-sky-100 bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700">
                                            <Video className="h-3 w-3" /> Video
                                          </span>
                                        )}
                                        <p className="text-sm font-bold text-slate-950">
                                          {lesson.title}
                                        </p>
                                      </div>
                                      <p className="text-xs font-medium text-slate-500">
                                        {lesson.lessonType} · {lesson.duration ?? 0} min ·{' '}
                                        {lesson.status}
                                        {lesson.isPreview ? ' · Preview Eligible' : ''}
                                      </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <form action={moveLessonAction}>
                                        <input type="hidden" name="courseId" value={course.id} />
                                        <input type="hidden" name="lessonId" value={lesson.id} />
                                        <ReorderButton
                                          direction="up"
                                          disabled={lessonIndex === 0}
                                        />
                                      </form>
                                      <form action={moveLessonAction}>
                                        <input type="hidden" name="courseId" value={course.id} />
                                        <input type="hidden" name="lessonId" value={lesson.id} />
                                        <ReorderButton
                                          direction="down"
                                          disabled={lessonIndex === module.lessons.length - 1}
                                        />
                                      </form>
                                      <Link
                                        href={`/admin/courses/${course.id}/lessons/${lesson.id}/edit`}
                                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                      >
                                        Edit
                                      </Link>
                                      <form
                                        action={deleteLessonAction}
                                        onSubmit={(event) => {
                                          if (
                                            !window.confirm(
                                              `Delete Lesson "${lesson.title}"? This lesson and its attached resources will be permanently removed.`
                                            )
                                          )
                                            event.preventDefault();
                                        }}
                                      >
                                        <input type="hidden" name="courseId" value={course.id} />
                                        <input type="hidden" name="lessonId" value={lesson.id} />
                                        <button
                                          type="submit"
                                          className="text-error rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold hover:bg-red-50"
                                        >
                                          Delete
                                        </button>
                                      </form>
                                    </div>
                                  </div>
                                  <ResourceManager
                                    courseId={course.id}
                                    lessonId={lesson.id}
                                    resources={lesson.resources}
                                  />
                                </div>
                              ))}

                              {addingLesson === module.id ? (
                                <InlineLessonForm
                                  action={createLessonAction.bind(null, course.id, module.id)}
                                  onDone={() => setAddingLesson(null)}
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setAddingLesson(module.id)}
                                  className="text-primary hover:bg-surface-light rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
                                >
                                  + Add Lesson
                                </button>
                              )}

                              {/* MODULE SUMMARY SECTION */}
                              <div className="pt-2">
                                {editingSummary === module.id ? (
                                  <ModuleSummaryForm
                                    action={upsertModuleSummaryAction.bind(
                                      null,
                                      course.id,
                                      module.id
                                    )}
                                    summary={module.summary}
                                    onDone={() => setEditingSummary(null)}
                                  />
                                ) : module.summary ? (
                                  <div className="flex flex-col gap-3 rounded-lg border border-indigo-200 bg-indigo-50/50 p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-3">
                                      <div className="mt-0.5 shrink-0 rounded-lg bg-indigo-600 p-2 text-white">
                                        {module.summary.resourceType === 'SLIDE' ? (
                                          <Presentation className="h-4 w-4" />
                                        ) : (
                                          <Video className="h-4 w-4" />
                                        )}
                                      </div>
                                      <div>
                                        <span className="inline-block rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-indigo-800 uppercase">
                                          Module Summary ·{' '}
                                          {module.summary.resourceType === 'SLIDE'
                                            ? 'Slide Deck'
                                            : 'Video Explainer'}
                                        </span>
                                        <h5 className="text-sm font-bold text-slate-950">
                                          {module.summary.title}
                                        </h5>
                                        <p className="text-xs text-slate-500">
                                          {module.summary.duration
                                            ? `${module.summary.duration} min duration`
                                            : 'Self-paced'}
                                          {module.summary.resourceUrl && (
                                            <>
                                              {' · '}
                                              <a
                                                href={module.summary.resourceUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 font-semibold text-indigo-700 hover:underline"
                                              >
                                                <ExternalLink className="h-3 w-3" /> View Deck/Video
                                              </a>
                                            </>
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setEditingSummary(module.id)}
                                        className="rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-800 hover:bg-indigo-50"
                                      >
                                        Edit Summary
                                      </button>
                                      <form
                                        action={deleteModuleSummaryAction}
                                        onSubmit={(e) => {
                                          if (!window.confirm('Delete this Module Summary?'))
                                            e.preventDefault();
                                        }}
                                      >
                                        <input type="hidden" name="courseId" value={course.id} />
                                        <input type="hidden" name="moduleId" value={module.id} />
                                        <button
                                          type="submit"
                                          className="text-error rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold hover:bg-red-50"
                                        >
                                          Delete
                                        </button>
                                      </form>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setEditingSummary(module.id)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-indigo-300 bg-indigo-50/30 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                                  >
                                    <Presentation className="h-3.5 w-3.5" /> + Add Module Summary
                                    (Slide / Video)
                                  </button>
                                )}
                              </div>

                              {/* MODULE QUIZ SECTION */}
                              <div className="pt-1">
                                {editingQuiz === module.id ? (
                                  <ModuleQuizForm
                                    courseId={course.id}
                                    action={upsertModuleQuizAction.bind(null, course.id, module.id)}
                                    quiz={module.quiz}
                                    questions={module.quiz?.questions ?? []}
                                    onDone={() => setEditingQuiz(null)}
                                  />
                                ) : module.quiz ? (
                                  <div className="space-y-2">
                                    <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
                                      <div className="flex items-start gap-3">
                                        <div className="mt-0.5 shrink-0 rounded-lg bg-amber-600 p-2 text-white">
                                          <Award className="h-4 w-4" />
                                        </div>
                                        <div>
                                          <div className="mb-1 flex flex-wrap items-center gap-1.5">
                                            <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-800 uppercase">
                                              Module Quiz · Benchmark Check
                                            </span>
                                            {module.quiz.randomizeQuestions && (
                                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                                                Random Qs
                                              </span>
                                            )}
                                            {module.quiz.randomizeOptions && (
                                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                                                Random Choices
                                              </span>
                                            )}
                                          </div>
                                          <h5 className="text-sm font-bold text-slate-950">
                                            {module.quiz.title}
                                          </h5>
                                          <p className="text-xs text-slate-500">
                                            Passing score:{' '}
                                            <span className="font-bold text-amber-900">
                                              {module.quiz.passingScore}%
                                            </span>
                                            {' · '}Max attempts:{' '}
                                            <span className="font-bold text-amber-900">
                                              {module.quiz.maxAttempts}
                                            </span>
                                            {module.quiz.timeLimitMinutes
                                              ? ` · ${module.quiz.timeLimitMinutes} min limit`
                                              : ' · Untimed'}
                                            {' · '}
                                            <span className="font-semibold text-slate-700">
                                              {module.quiz.status}
                                            </span>
                                            {' · '}
                                            <span className="font-bold text-amber-900">
                                              {module.quiz.questions?.length ?? 0} Question
                                              {(module.quiz.questions?.length ?? 0) !== 1
                                                ? 's'
                                                : ''}
                                            </span>
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex shrink-0 items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setEditingQuiz(module.id)}
                                          className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-50"
                                        >
                                          Edit Settings
                                        </button>
                                        <form
                                          action={deleteModuleQuizAction}
                                          onSubmit={(e) => {
                                            if (!window.confirm('Delete this Module Quiz?'))
                                              e.preventDefault();
                                          }}
                                        >
                                          <input type="hidden" name="courseId" value={course.id} />
                                          <input type="hidden" name="moduleId" value={module.id} />
                                          <button
                                            type="submit"
                                            className="text-error rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold transition hover:bg-red-50"
                                          >
                                            Delete
                                          </button>
                                        </form>
                                      </div>
                                    </div>

                                    {/* Question & Option Builder */}
                                    <QuizQuestionManager
                                      courseId={course.id}
                                      quizId={module.quiz.id}
                                      questions={module.quiz.questions ?? []}
                                    />
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setEditingQuiz(module.id)}
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-amber-300 bg-amber-50/30 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50"
                                  >
                                    <Award className="h-3.5 w-3.5" /> + Add Module Quiz
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {addingModule === week.id ? (
                      <ModuleForm
                        action={createModuleAction.bind(null, course.id, week.id)}
                        onDone={() => setAddingModule(null)}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAddingModule(week.id)}
                        className="text-primary hover:bg-surface-light rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold"
                      >
                        + Add Module
                      </button>
                    )}

                    {/* WEEKLY ASSIGNMENT (at bottom of week) */}
                    <div className="border-t border-slate-200 pt-2">
                      {editingAssignment === week.id ? (
                        <WeeklyAssignmentForm
                          action={upsertWeeklyAssignmentAction.bind(null, course.id, week.id)}
                          assignment={week.assignment}
                          onDone={() => setEditingAssignment(null)}
                        />
                      ) : week.assignment ? (
                        <div className="flex flex-col gap-3 rounded-xl border-2 border-emerald-300 bg-emerald-50/60 p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 shrink-0 rounded-lg bg-emerald-600 p-2.5 text-white">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                              <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-800 uppercase">
                                Weekly Assignment · Capstone / Practical Lab
                              </span>
                              <h5 className="text-base font-bold text-slate-950">
                                {week.assignment.title}
                              </h5>
                              <p className="mt-0.5 text-xs text-slate-600">
                                {week.assignment.description}
                              </p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span className="rounded border border-emerald-200 bg-white px-2 py-0.5 font-medium text-emerald-900">
                                  {week.assignment.submissionType}
                                </span>
                                <span>Due: {week.assignment.dueDateDays ?? 7} days</span>
                                <span>
                                  · Status:{' '}
                                  <span className="font-semibold text-slate-800">
                                    {week.assignment.status}
                                  </span>
                                </span>
                                {week.assignment.datasetUrl && (
                                  <a
                                    href={week.assignment.datasetUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Dataset: {week.assignment.datasetName || 'Download File'}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingAssignment(week.id)}
                              className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                            >
                              Edit Assignment
                            </button>
                            <form
                              action={deleteWeeklyAssignmentAction}
                              onSubmit={(e) => {
                                if (!window.confirm('Delete this Weekly Assignment?'))
                                  e.preventDefault();
                              }}
                            >
                              <input type="hidden" name="courseId" value={course.id} />
                              <input type="hidden" name="weekId" value={week.id} />
                              <button
                                type="submit"
                                className="text-error rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </form>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingAssignment(week.id)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/30 py-3 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50"
                        >
                          <BookOpen className="h-4 w-4" /> + Add Weekly Assignment (Practical Lab /
                          Capstone)
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
