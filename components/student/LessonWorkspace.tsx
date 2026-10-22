'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  ListOrdered,
  Maximize2,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  X,
} from 'lucide-react';
import { ResourceStage } from '@/components/resources/ResourceStage';
import { WeeklyCurriculum, WeeklyCurriculumWeek, ItemDripStatus } from '@/components/student/WeeklyCurriculum';

interface LessonWorkspaceProps {
  courseId: string;
  courseTitle: string;
  lesson: {
    id: string;
    title: string;
    slug: string;
    content?: string | null;
    videoUrl?: string | null;
    slideUrl?: string | null;
    resourceType?: 'SLIDE' | 'VIDEO' | null;
    duration?: number | null;
    weekNumber: number;
    weekTitle: string;
    moduleTitle: string;
    resources: any[];
  };
  weeks: WeeklyCurriculumWeek[];
  previousLesson: { id: string; title: string } | null;
  nextLesson: { id: string; title: string } | null;
  isCompleted: boolean;
  progress: {
    totalLessons: number;
    completedLessons: number;
    percentage: number;
  };
  completedLessonIds: string[];
  completedSummaryIds: string[];
  submittedAssignmentIds: string[];
  dripStatusRecord: Record<string, ItemDripStatus>;
  quizAttempts: { quizId: string; passed: boolean; score: number }[];
  quizBestScores: Record<string, number>;
  quizOverrides: { quizId: string; additionalAttempts: number; progressionGranted: boolean }[];
  setLessonProgressAction: (formData: FormData) => Promise<any>;
}

export function LessonWorkspace({
  courseId,
  courseTitle,
  lesson,
  weeks,
  previousLesson,
  nextLesson,
  isCompleted,
  progress,
  completedLessonIds,
  completedSummaryIds,
  submittedAssignmentIds,
  dripStatusRecord,
  quizAttempts,
  quizBestScores,
  quizOverrides,
  setLessonProgressAction,
}: LessonWorkspaceProps) {
  const [isCurriculumDrawerOpen, setIsCurriculumDrawerOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* 1. Focused Top Workspace Header Bar */}
      <header className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Breadcrumb & Lesson Details */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Link
                href="/student"
                className="hover:text-primary transition"
              >
                Dashboard
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <Link
                href={`/student/courses/${courseId}`}
                className="text-primary font-bold hover:underline truncate max-w-[180px] sm:max-w-none"
              >
                {courseTitle}
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="font-semibold text-slate-700">
                Week {lesson.weekNumber} · {lesson.moduleTitle}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-950 font-heading">
                {lesson.title}
              </h1>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <Check className="h-3 w-3" />
                  Completed
                </span>
              )}
            </div>
          </div>

          {/* Action Controls & Progress Strip */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 border-t border-slate-100 lg:border-t-0">
            {/* Course progress indicator */}
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Course Progress
              </span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-black text-slate-700">{progress.percentage}%</span>
              </div>
            </div>

            {/* Toggle Curriculum Sidebar/Drawer */}
            <button
              type="button"
              onClick={() => setIsCurriculumDrawerOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cerulean transition"
              aria-label="Toggle curriculum navigation outline"
            >
              <ListOrdered className="h-4 w-4 text-brand-cerulean" />
              <span>Curriculum Outline</span>
            </button>

            {/* Mark Complete Form */}
            <form action={setLessonProgressAction}>
              <input type="hidden" name="courseId" value={courseId} />
              <input type="hidden" name="lessonId" value={lesson.id} />
              <input type="hidden" name="isCompleted" value={isCompleted ? 'false' : 'true'} />
              <button
                type="submit"
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold transition shadow-xs focus-visible:outline-none focus-visible:ring-2 ${
                  isCompleted
                    ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-slate-400'
                    : 'bg-primary text-white hover:bg-secondary focus-visible:ring-brand-cerulean'
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Mark Complete</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* 2. Workspace Body: Media Stage + Optional Slide-out Curriculum Drawer */}
      <div className="relative flex flex-col gap-5 xl:flex-row">
        {/* Main Learning Stage */}
        <main className="flex-1 min-w-0 space-y-5">
          {/* In-Portal Primary Stage */}
          <ResourceStage
            lessonTitle={lesson.title}
            primaryVideoUrl={lesson.videoUrl}
            primarySlideUrl={lesson.slideUrl}
            primaryResourceType={lesson.resourceType}
            resources={lesson.resources}
          />

          {/* Lesson Notes & Text Content */}
          {lesson.content && (
            <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="h-4 w-4 text-brand-cerulean" />
                <h2 className="text-sm sm:text-base font-bold text-slate-950 font-heading">
                  Lesson Notes &amp; Learning Guide
                </h2>
              </div>
              <div className="whitespace-pre-wrap text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                {lesson.content}
              </div>
            </section>
          )}

          {/* Bottom Lesson Navigation Strip */}
          <nav
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs"
            aria-label="Previous and Next Lesson Navigation"
          >
            {previousLesson ? (
              <Link
                href={`/student/courses/${courseId}/lessons/${previousLesson.id}`}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 p-2.5 sm:px-4 sm:py-2.5 text-slate-700 hover:border-brand-cerulean hover:bg-slate-50 transition"
              >
                <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-primary transition" />
                <div className="text-left">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Previous
                  </span>
                  <span className="block text-xs font-bold text-slate-900 group-hover:text-primary transition truncate max-w-[150px] sm:max-w-xs">
                    {previousLesson.title}
                  </span>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link
                href={`/student/courses/${courseId}/lessons/${nextLesson.id}`}
                className="group flex items-center justify-between sm:justify-end gap-3 rounded-xl bg-primary px-4 py-2.5 text-white hover:bg-secondary transition shadow-xs"
              >
                <div className="text-left sm:text-right">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-blue-200">
                    Next Lesson
                  </span>
                  <span className="block text-xs font-bold text-white truncate max-w-[180px] sm:max-w-xs">
                    {nextLesson.title}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-0.5 transition" />
              </Link>
            ) : (
              <Link
                href={`/student/courses/${courseId}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                <span>Curriculum Complete</span>
                <Check className="h-4 w-4" />
              </Link>
            )}
          </nav>
        </main>

        {/* 3. Collapsible Curriculum Drawer / Sidebar */}
        {isCurriculumDrawerOpen && (
          <aside
            className="w-full xl:w-96 shrink-0 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-4 animate-fade-in"
            aria-label="Course Curriculum Navigation"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-950 font-heading">
                  Course Outline
                </h3>
                <p className="text-[11px] text-slate-500">
                  {progress.completedLessons} of {progress.totalLessons} lessons finished
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCurriculumDrawerOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                title="Close outline"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto pr-1">
              <WeeklyCurriculum
                courseId={courseId}
                weeks={weeks}
                completedLessonIds={completedLessonIds}
                completedSummaryIds={completedSummaryIds}
                submittedAssignmentIds={submittedAssignmentIds}
                dripStatusRecord={dripStatusRecord}
                currentLessonId={lesson.id}
                quizAttempts={quizAttempts}
                quizBestScores={quizBestScores}
                quizOverrides={quizOverrides}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
