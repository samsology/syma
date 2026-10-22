'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Lock,
  Presentation,
  Video,
} from 'lucide-react';
import type { CourseStatus } from '@prisma/client';

export interface WeeklyCurriculumLesson {
  id: string;
  title: string;
  slug: string;
  resourceType: 'SLIDE' | 'VIDEO' | null;
  status: CourseStatus;
  sortOrder: number;
}

export interface WeeklyCurriculumSummary {
  id: string;
  title: string;
  resourceType: 'SLIDE' | 'VIDEO' | null;
}

export interface WeeklyCurriculumQuiz {
  id: string;
  title: string;
  status: CourseStatus;
  passingScore: number;
  attemptPolicy: string;
  maxAttempts: number;
}

export interface WeeklyCurriculumModule {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  lessons: WeeklyCurriculumLesson[];
  summary: WeeklyCurriculumSummary | null;
  quiz: WeeklyCurriculumQuiz | null;
}

export interface WeeklyCurriculumAssignment {
  id: string;
  title: string;
  description: string;
  status: CourseStatus;
}

export interface WeeklyCurriculumWeek {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  sortOrder: number;
  modules: WeeklyCurriculumModule[];
  assignment: WeeklyCurriculumAssignment | null;
}

export interface ItemDripStatus {
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  lockReason?: string;
}

export interface WeeklyCurriculumProps {
  courseId: string;
  weeks: WeeklyCurriculumWeek[];
  completedLessonIds: string[];
  completedSummaryIds: string[];
  submittedAssignmentIds: string[];
  dripStatusRecord: Record<string, ItemDripStatus>;
  currentLessonId?: string | null;
  quizAttempts: { quizId: string; passed: boolean; score: number }[];
  quizBestScores: Record<string, number>;
  quizOverrides: { quizId: string; additionalAttempts: number; progressionGranted: boolean }[];
}

export function WeeklyCurriculum({
  courseId,
  weeks,
  completedLessonIds,
  completedSummaryIds,
  submittedAssignmentIds,
  dripStatusRecord,
  currentLessonId,
  quizAttempts,
  quizBestScores,
  quizOverrides,
}: WeeklyCurriculumProps) {
  const completedLessonSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds]);
  const completedSummarySet = useMemo(() => new Set(completedSummaryIds), [completedSummaryIds]);
  const submittedAssignmentSet = useMemo(() => new Set(submittedAssignmentIds), [submittedAssignmentIds]);

  const overrideMap = useMemo(() => {
    const map = new Map<string, (typeof quizOverrides)[number]>();
    for (const ov of quizOverrides) {
      map.set(ov.quizId, ov);
    }
    return map;
  }, [quizOverrides]);

  // Compute week summaries and determine the active week
  const weekMeta = useMemo(() => {
    return weeks.map((week) => {
      const allLessons = week.modules.flatMap((m) => m.lessons);
      const totalLessons = allLessons.length;
      const completedLessons = allLessons.filter((l) => completedLessonSet.has(l.id)).length;

      const hasCurrentLesson = allLessons.some(
        (l) => l.id === currentLessonId || dripStatusRecord[l.id]?.isCurrent
      );

      const hasUnlockedLesson = allLessons.some((l) => dripStatusRecord[l.id]?.isUnlocked);

      // Check if all lessons, summaries, quizzes, and assignment in this week are completed
      const allSummariesDone = week.modules.every((m) => {
        if (!m.summary) return true;
        return completedSummarySet.has(m.summary.id);
      });

      const allQuizzesDone = week.modules.every((m) => {
        if (!m.quiz || m.quiz.status !== 'PUBLISHED') return true;
        const attempts = quizAttempts.filter((a) => a.quizId === m.quiz?.id);
        const override = overrideMap.get(m.quiz.id);
        return attempts.some((a) => a.passed) || Boolean(override?.progressionGranted);
      });

      const assignmentDone =
        !week.assignment ||
        week.assignment.status !== 'PUBLISHED' ||
        submittedAssignmentSet.has(week.assignment.id);

      const isWeekComplete =
        totalLessons > 0 &&
        completedLessons === totalLessons &&
        allSummariesDone &&
        allQuizzesDone &&
        assignmentDone;

      return {
        weekId: week.id,
        weekNumber: week.weekNumber,
        totalLessons,
        completedLessons,
        hasCurrentLesson,
        hasUnlockedLesson,
        isWeekComplete,
      };
    });
  }, [
    weeks,
    completedLessonSet,
    completedSummarySet,
    submittedAssignmentSet,
    dripStatusRecord,
    currentLessonId,
    quizAttempts,
    overrideMap,
  ]);

  // Find the active week to auto-expand
  const defaultActiveWeekId = useMemo(() => {
    // 1. Week that contains the currently active/next lesson
    const currentWeek = weekMeta.find((wm) => wm.hasCurrentLesson);
    if (currentWeek) return currentWeek.weekId;

    // 2. First incomplete week with unlocked content
    const inProgressWeek = weekMeta.find((wm) => !wm.isWeekComplete && wm.hasUnlockedLesson);
    if (inProgressWeek) return inProgressWeek.weekId;

    // 3. Fallback to week 1 or first week
    return weeks[0]?.id || null;
  }, [weekMeta, weeks]);

  // State: Set of expanded week IDs
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (defaultActiveWeekId) {
      initial.add(defaultActiveWeekId);
    }
    return initial;
  });

  // Handle URL hash or param if a specific week is targeted
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#week-')) {
        const weekNum = parseInt(hash.replace('#week-', ''), 10);
        const target = weeks.find((w) => w.weekNumber === weekNum);
        if (target) {
          setExpandedWeeks((prev) => new Set([...prev, target.id]));
        }
      }
    }
  }, [weeks]);

  const toggleWeek = (weekId: string) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekId)) {
        next.delete(weekId);
      } else {
        next.add(weekId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedWeeks(new Set(weeks.map((w) => w.id)));
  };

  const collapseAll = () => {
    setExpandedWeeks(new Set());
  };

  const allExpanded = expandedWeeks.size === weeks.length && weeks.length > 0;

  return (
    <div className="space-y-4">
      {/* Quick Global Collapse / Expand Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 text-xs text-slate-500">
        <span>
          Showing {weeks.length} week{weeks.length === 1 ? '' : 's'} ·{' '}
          {expandedWeeks.size} expanded
        </span>
        <div className="flex items-center gap-2">
          {allExpanded ? (
            <button
              type="button"
              onClick={collapseAll}
              className="hover:text-primary inline-flex items-center gap-1 font-bold text-slate-600 transition cursor-pointer"
            >
              <ChevronUp className="h-3.5 w-3.5" />
              <span>Collapse All</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={expandAll}
              className="hover:text-primary inline-flex items-center gap-1 font-bold text-slate-600 transition cursor-pointer"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              <span>Expand All</span>
            </button>
          )}
        </div>
      </div>

      {/* Week Accordion Groups */}
      <div className="space-y-4">
        {weeks.map((week, idx) => {
          const meta = weekMeta[idx];
          const isExpanded = expandedWeeks.has(week.id);
          const isCurrentWeek = meta?.hasCurrentLesson;
          const isComplete = meta?.isWeekComplete;

          return (
            <div
              key={week.id}
              id={`week-${week.weekNumber}`}
              className={`rounded-xl border transition-all ${
                isCurrentWeek
                  ? 'border-primary/40 bg-white shadow-xs ring-1 ring-primary/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Accordion Header Button */}
              <button
                type="button"
                onClick={() => toggleWeek(week.id)}
                aria-expanded={isExpanded}
                aria-controls={`week-content-${week.id}`}
                className="flex w-full items-start justify-between gap-4 p-4 sm:p-5 text-left cursor-pointer transition select-none"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-primary text-[11px] sm:text-xs font-black tracking-wider uppercase">
                      Week {week.weekNumber}
                    </span>

                    {isCurrentWeek && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        <Clock className="h-3 w-3" />
                        <span>Active Week</span>
                      </span>
                    )}

                    {isComplete ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Completed</span>
                      </span>
                    ) : meta && meta.totalLessons > 0 ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {meta.completedLessons}/{meta.totalLessons} Lessons
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-1 text-base sm:text-lg font-black text-slate-950 truncate">
                    {week.title}
                  </h3>
                  {week.description && (
                    <p className="mt-1 text-xs text-slate-500 line-clamp-1 sm:line-clamp-2">
                      {week.description}
                    </p>
                  )}
                </div>

                {/* Right Side Chevron & Summary */}
                <div className="flex shrink-0 items-center gap-3 self-center sm:self-start mt-1">
                  <div className="hidden text-right sm:block">
                    {meta && meta.totalLessons > 0 && (
                      <div className="text-[11px] font-semibold text-slate-400">
                        {Math.round((meta.completedLessons / meta.totalLessons) * 100)}% done
                      </div>
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-1 text-slate-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 bg-slate-100 text-slate-700' : 'hover:bg-slate-50'
                    }`}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </div>
              </button>

              {/* Collapsible Content */}
              {isExpanded && (
                <div
                  id={`week-content-${week.id}`}
                  className="border-t border-slate-100 px-3.5 pb-5 pt-4 sm:px-5 sm:pb-6 space-y-6"
                >
                  {/* Modules */}
                  {week.modules.map((module, moduleIdx) => {
                    const visibleQuiz =
                      module.quiz?.status === 'PUBLISHED' ? module.quiz : null;
                    const moduleQuizAttempts = visibleQuiz
                      ? quizAttempts.filter((a) => a.quizId === visibleQuiz.id)
                      : [];
                    const isQuizPassed = moduleQuizAttempts.some((a) => a.passed);
                    const bestQuizScore = visibleQuiz ? quizBestScores[visibleQuiz.id] : null;

                    return (
                      <div
                        key={module.id}
                        className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/40 p-3.5 sm:p-4"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              Module {moduleIdx + 1}
                            </span>
                            <p className="text-sm font-black text-slate-800">{module.title}</p>
                          </div>
                        </div>

                        {/* Module Lessons */}
                        <div className="grid gap-2">
                          {module.lessons.length ? (
                            module.lessons.map((lesson) => {
                              const lessonStatus = dripStatusRecord[lesson.id] ?? {
                                isUnlocked: false,
                                isCompleted: false,
                                isCurrent: false,
                              };

                              if (!lessonStatus.isUnlocked) {
                                return (
                                  <div
                                    key={lesson.id}
                                    title={
                                      lessonStatus.lockReason || 'Complete previous lesson to unlock'
                                    }
                                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-100/70 px-4 py-3 text-sm font-semibold text-slate-400 cursor-not-allowed opacity-75"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                                      <span>{lesson.title}</span>
                                    </div>
                                    <span className="inline-flex items-center gap-1 rounded bg-slate-200 px-2 py-0.5 text-[10px] font-black tracking-wide text-slate-600 uppercase">
                                      Locked
                                    </span>
                                  </div>
                                );
                              }

                              const isCompleted = completedLessonSet.has(lesson.id);

                              return (
                                <Link
                                  key={lesson.id}
                                  href={`/student/courses/${courseId}/lessons/${lesson.id}`}
                                  className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                                    lessonStatus.isCurrent
                                      ? 'border-primary/50 bg-primary/5 text-primary shadow-xs'
                                      : 'border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    {lesson.resourceType === 'SLIDE' ? (
                                      <span className="text-indigo-600" title="Slide Lesson">
                                        <Presentation className="h-4 w-4" />
                                      </span>
                                    ) : (
                                      <span className="text-sky-600" title="Video Lesson">
                                        <Video className="h-4 w-4" />
                                      </span>
                                    )}
                                    <span>{lesson.title}</span>
                                  </div>
                                  <span
                                    className={
                                      isCompleted
                                        ? 'text-xs font-black tracking-wide text-emerald-700 uppercase'
                                        : lessonStatus.isCurrent
                                          ? 'text-xs font-black tracking-wide text-primary uppercase'
                                          : 'text-xs font-black tracking-wide text-slate-400 uppercase'
                                    }
                                  >
                                    {isCompleted
                                      ? 'Complete'
                                      : lessonStatus.isCurrent
                                        ? 'Up Next'
                                        : 'Unlocked'}
                                  </span>
                                </Link>
                              );
                            })
                          ) : (
                            <p className="py-1 text-xs text-slate-500">
                              No published lessons in this module.
                            </p>
                          )}
                        </div>

                        {/* Module Summary */}
                        {module.summary && (() => {
                          const summaryStatus = dripStatusRecord[module.summary.id] ?? {
                            isUnlocked: false,
                            isCompleted: false,
                            isCurrent: false,
                          };

                          if (!summaryStatus.isUnlocked) {
                            return (
                              <div
                                title={
                                  summaryStatus.lockReason || 'Complete module lessons to unlock'
                                }
                                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-100/70 px-4 py-2.5 text-sm font-semibold text-slate-400 cursor-not-allowed opacity-75"
                              >
                                <div className="flex items-center gap-2.5">
                                  <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                                  <div>
                                    <span className="block text-[10px] font-black tracking-wider text-slate-400 uppercase">
                                      Module Summary
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">
                                      {module.summary.title}
                                    </span>
                                  </div>
                                </div>
                                <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-black tracking-wide text-slate-600 uppercase">
                                  Locked
                                </span>
                              </div>
                            );
                          }

                          const isSummaryCompleted = completedSummarySet.has(module.summary.id);

                          return (
                            <Link
                              href={`/student/courses/${courseId}/modules/${module.id}/summary`}
                              className="flex items-center justify-between gap-3 rounded-lg border border-indigo-200 bg-indigo-50/60 px-4 py-2.5 text-sm font-semibold text-indigo-950 transition hover:bg-indigo-100/60"
                            >
                              <div className="flex items-center gap-2.5">
                                {module.summary.resourceType === 'SLIDE' ? (
                                  <Presentation className="h-4 w-4 shrink-0 text-indigo-700" />
                                ) : (
                                  <Video className="h-4 w-4 shrink-0 text-indigo-700" />
                                )}
                                <div>
                                  <span className="block text-[10px] font-black tracking-wider text-indigo-800 uppercase">
                                    Module Summary ·{' '}
                                    {module.summary.resourceType === 'SLIDE'
                                      ? 'Slide Deck'
                                      : 'Video Explainer'}
                                  </span>
                                  <span className="text-xs font-bold text-indigo-950">
                                    {module.summary.title}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={
                                  isSummaryCompleted
                                    ? 'text-xs font-black tracking-wide text-emerald-700 uppercase'
                                    : 'text-xs font-black tracking-wide text-indigo-700 uppercase'
                                }
                              >
                                {isSummaryCompleted ? 'Completed' : 'Review Summary'}
                              </span>
                            </Link>
                          );
                        })()}

                        {/* Module Quiz */}
                        {visibleQuiz && (() => {
                          const quizStatus = dripStatusRecord[visibleQuiz.id] ?? {
                            isUnlocked: false,
                            isCompleted: false,
                            isCurrent: false,
                          };

                          if (!quizStatus.isUnlocked) {
                            return (
                              <div
                                title={
                                  quizStatus.lockReason || 'Complete module content to unlock quiz'
                                }
                                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-100/70 px-4 py-2.5 text-sm font-semibold text-slate-400 cursor-not-allowed opacity-75"
                              >
                                <div className="flex items-center gap-2.5">
                                  <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                                  <div>
                                    <span className="block text-[10px] font-black tracking-wider text-slate-400 uppercase">
                                      Module Quiz · Pass Mark: {visibleQuiz.passingScore}%
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">
                                      {visibleQuiz.title}
                                    </span>
                                  </div>
                                </div>
                                <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-black tracking-wide text-slate-600 uppercase">
                                  Locked
                                </span>
                              </div>
                            );
                          }

                          const quizOverride = overrideMap.get(visibleQuiz.id);
                          const isUnlimitedQuiz = visibleQuiz.attemptPolicy === 'UNLIMITED';
                          const maxAllowed =
                            visibleQuiz.maxAttempts + (quizOverride?.additionalAttempts ?? 0);
                          const isExhausted =
                            !isQuizPassed &&
                            !isUnlimitedQuiz &&
                            moduleQuizAttempts.length >= maxAllowed;
                          const isOverridden = Boolean(quizOverride?.progressionGranted);

                          return (
                            <Link
                              href={`/student/courses/${courseId}/modules/${module.id}/quiz`}
                              className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-2.5 text-sm font-semibold text-amber-950 transition hover:bg-amber-100/60"
                            >
                              <div className="flex items-center gap-2.5">
                                <Award className="h-4 w-4 shrink-0 text-amber-700" />
                                <div>
                                  <span className="block text-[10px] font-black tracking-wider text-amber-800 uppercase">
                                    Module Quiz · Pass Mark: {visibleQuiz.passingScore}% ·{' '}
                                    {isUnlimitedQuiz
                                      ? 'Unlimited Attempts'
                                      : `Max ${maxAllowed} Attempts`}
                                  </span>
                                  <span className="text-xs font-bold text-amber-950">
                                    {visibleQuiz.title}
                                  </span>
                                  {bestQuizScore !== null && bestQuizScore !== undefined && (
                                    <span className="mt-0.5 block text-[11px] font-bold text-amber-800">
                                      Best score: {bestQuizScore}%
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span
                                className={
                                  isQuizPassed
                                    ? 'text-xs font-black tracking-wide text-emerald-700 uppercase'
                                    : isOverridden
                                      ? 'text-xs font-black tracking-wide text-indigo-700 uppercase'
                                      : isExhausted
                                        ? 'text-xs font-black tracking-wide text-red-700 uppercase'
                                        : moduleQuizAttempts.length > 0
                                          ? 'text-xs font-black tracking-wide text-amber-800 uppercase'
                                          : 'text-xs font-black tracking-wide text-amber-700 uppercase'
                                }
                              >
                                {isQuizPassed
                                  ? 'Passed'
                                  : isOverridden
                                    ? 'Progression Granted'
                                    : isExhausted
                                      ? 'Attempts Exhausted'
                                      : moduleQuizAttempts.length > 0
                                        ? isUnlimitedQuiz
                                          ? `${moduleQuizAttempts.length} Attempts (Unlimited)`
                                          : `${moduleQuizAttempts.length}/${maxAllowed} Attempts`
                                        : 'Take Quiz'}
                              </span>
                            </Link>
                          );
                        })()}
                      </div>
                    );
                  })}

                  {/* Weekly Assignment */}
                  {week.assignment?.status === 'PUBLISHED' && (() => {
                    const assignmentStatus = dripStatusRecord[week.assignment.id] ?? {
                      isUnlocked: false,
                      isCompleted: false,
                      isCurrent: false,
                    };

                    if (!assignmentStatus.isUnlocked) {
                      return (
                        <div
                          title={
                            assignmentStatus.lockReason ||
                            'Complete module quiz to unlock assignment'
                          }
                          className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-100/70 p-4 text-sm font-semibold text-slate-400 opacity-75 cursor-not-allowed sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 shrink-0 rounded-lg bg-slate-300 p-2 text-slate-600">
                              <Lock className="h-5 w-5" />
                            </div>
                            <div>
                              <span className="block text-[10px] font-black tracking-wider text-slate-400 uppercase">
                                Weekly Practical Assignment · Locked
                              </span>
                              <span className="text-sm font-black text-slate-500 sm:text-base">
                                {week.assignment.title}
                              </span>
                              <p className="mt-0.5 text-xs font-normal text-slate-400">
                                {week.assignment.description}
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0">
                            <span className="inline-block rounded-md bg-slate-200 px-3 py-1.5 text-xs font-black text-slate-600 uppercase">
                              Locked
                            </span>
                          </div>
                        </div>
                      );
                    }

                    const isSubmitted = submittedAssignmentSet.has(week.assignment.id);

                    return (
                      <Link
                        href={`/student/courses/${courseId}/weeks/${week.id}/assignment`}
                        className="flex flex-col gap-3 rounded-xl border-2 border-emerald-300 bg-emerald-50/70 p-4 text-sm font-semibold text-emerald-950 shadow-2xs transition hover:bg-emerald-100/70 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0 rounded-lg bg-emerald-600 p-2 text-white">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="block text-[10px] font-black tracking-wider text-emerald-800 uppercase">
                              Weekly Practical Assignment · Capstone / Lab
                            </span>
                            <span className="text-sm font-black text-slate-950 sm:text-base">
                              {week.assignment.title}
                            </span>
                            <p className="mt-0.5 text-xs font-normal text-slate-600">
                              {week.assignment.description}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0">
                          <span
                            className={
                              isSubmitted
                                ? 'inline-block rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-black text-white uppercase'
                                : 'inline-block rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-black text-white uppercase'
                            }
                          >
                            {isSubmitted ? 'Submitted' : 'Start Assignment'}
                          </span>
                        </div>
                      </Link>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
