'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Edit, Plus, Trash2 } from 'lucide-react';
import type { Course, CourseModule, CourseWeek, Lesson, LessonResource } from '@prisma/client';
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
} from '@/app/admin/(protected)/courses/[id]/curriculum/actions';
import { CourseStatusBadge } from '@/components/admin/courses/CourseStatusBadge';
import { InlineLessonForm, ModuleForm, WeekForm } from './CurriculumForms';
import { ReorderButton } from './ReorderButton';
import { ResourceManager } from './ResourceManager';

type LessonWithResources = Lesson & { resources: LessonResource[] };
type ModuleWithLessons = CourseModule & { lessons: LessonWithResources[] };
type WeekWithModules = CourseWeek & { modules: ModuleWithLessons[] };
type CourseWithCurriculum = Course & { weeks: WeekWithModules[] };

export function CurriculumBuilder({ course }: { course: CourseWithCurriculum }) {
  const [addingWeek, setAddingWeek] = useState(false);
  const [editingWeek, setEditingWeek] = useState<string | null>(null);
  const [addingModule, setAddingModule] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [addingLesson, setAddingLesson] = useState<string | null>(null);
  const [openWeeks, setOpenWeeks] = useState(() => new Set(course.weeks.map((week) => week.id)));
  const [openModules, setOpenModules] = useState(() => new Set(course.weeks.flatMap((week) => week.modules.map((module) => module.id))));

  const counts = useMemo(() => {
    const modules = course.weeks.reduce((sum, week) => sum + week.modules.length, 0);
    const lessons = course.weeks.reduce((sum, week) => sum + week.modules.reduce((inner, module) => inner + module.lessons.length, 0), 0);
    return { weeks: course.weeks.length, modules, lessons };
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
              <span className="rounded-full bg-surface-light px-2.5 py-1 text-xs font-bold text-primary">{course.category}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{course.level}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{course.duration}</span>
            </div>
            <h2 className="mt-4 text-3xl font-bold text-slate-950">{course.title}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {course.status === 'PUBLISHED' ? 'This course is currently published. Changes may affect the live course.' : 'Changes will not be visible publicly until the course is published.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/courses/${course.id}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Course Overview</Link>
            <Link href={`/admin/courses/${course.id}/edit`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Edit Course</Link>
            <Link href={`/admin/courses/${course.id}/preview`} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-secondary">Preview</Link>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-neutral-light p-4"><p className="text-2xl font-bold text-slate-950">{counts.weeks}</p><p className="text-xs font-semibold text-slate-500">Weeks</p></div>
          <div className="rounded-lg bg-neutral-light p-4"><p className="text-2xl font-bold text-slate-950">{counts.modules}</p><p className="text-xs font-semibold text-slate-500">Modules</p></div>
          <div className="rounded-lg bg-neutral-light p-4"><p className="text-2xl font-bold text-slate-950">{counts.lessons}</p><p className="text-xs font-semibold text-slate-500">Lessons</p></div>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-bold text-slate-950">Curriculum</h3>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => { setOpenWeeks(new Set(course.weeks.map((week) => week.id))); setOpenModules(new Set(course.weeks.flatMap((week) => week.modules.map((module) => module.id)))); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white">Expand All</button>
          <button type="button" onClick={() => { setOpenWeeks(new Set()); setOpenModules(new Set()); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white">Collapse All</button>
          <button type="button" onClick={() => setAddingWeek(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-secondary"><Plus className="h-4 w-4" /> Add Week</button>
        </div>
      </div>

      {addingWeek && <WeekForm action={createWeekAction.bind(null, course.id)} defaultWeekNumber={nextWeekNumber} onDone={() => setAddingWeek(false)} />}

      {course.weeks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <h3 className="text-lg font-bold text-slate-950">This course has no curriculum yet.</h3>
          <p className="mt-2 text-sm text-slate-500">Start building your course by adding the first week.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {course.weeks.map((week, weekIndex) => {
            const weekOpen = openWeeks.has(week.id);
            return (
              <section key={week.id} className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <button type="button" onClick={() => toggleWeek(week.id)} className="flex min-w-0 items-start gap-2 text-left">
                    {weekOpen ? <ChevronDown className="mt-1 h-4 w-4 shrink-0" /> : <ChevronRight className="mt-1 h-4 w-4 shrink-0" />}
                    <span><span className="block text-xs font-bold uppercase text-primary">Week {week.weekNumber}</span><span className="block font-bold text-slate-950">{week.title}</span><span className="block text-sm text-slate-500">{week.description}</span></span>
                  </button>
                  <div className="flex flex-wrap gap-2">
                    <form action={moveWeekAction}><input type="hidden" name="courseId" value={course.id} /><input type="hidden" name="weekId" value={week.id} /><ReorderButton direction="up" disabled={weekIndex === 0} /></form>
                    <form action={moveWeekAction}><input type="hidden" name="courseId" value={course.id} /><input type="hidden" name="weekId" value={week.id} /><ReorderButton direction="down" disabled={weekIndex === course.weeks.length - 1} /></form>
                    <button type="button" onClick={() => setEditingWeek(editingWeek === week.id ? null : week.id)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100" aria-label="Edit week"><Edit className="h-4 w-4" /></button>
                    <form action={deleteWeekAction} onSubmit={(event) => { if (!window.confirm('Delete Week? Deleting this week will also delete all modules, lessons, and resources inside it. This action cannot be undone.')) event.preventDefault(); }}><input type="hidden" name="courseId" value={course.id} /><input type="hidden" name="weekId" value={week.id} /><button type="submit" className="rounded-lg border border-red-200 p-2 text-error hover:bg-red-50" aria-label="Delete week"><Trash2 className="h-4 w-4" /></button></form>
                  </div>
                </div>
                {editingWeek === week.id && <div className="p-4"><WeekForm action={updateWeekAction.bind(null, course.id, week.id)} week={week} onDone={() => setEditingWeek(null)} /></div>}
                {weekOpen && (
                  <div className="space-y-3 p-4">
                    {week.modules.length === 0 && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No modules in this week.</p>}
                    {week.modules.map((module, moduleIndex) => {
                      const moduleOpen = openModules.has(module.id);
                      return (
                        <div key={module.id} className="rounded-lg border border-slate-200 bg-slate-50">
                          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                            <button type="button" onClick={() => toggleModule(module.id)} className="flex min-w-0 items-start gap-2 text-left">
                              {moduleOpen ? <ChevronDown className="mt-1 h-4 w-4 shrink-0" /> : <ChevronRight className="mt-1 h-4 w-4 shrink-0" />}
                              <span><span className="block text-xs font-bold uppercase text-slate-500">Module {moduleIndex + 1}</span><span className="block font-bold text-slate-950">{module.title}</span><span className="block text-sm text-slate-500">{module.description}</span></span>
                            </button>
                            <div className="flex flex-wrap gap-2">
                              <form action={moveModuleAction}><input type="hidden" name="courseId" value={course.id} /><input type="hidden" name="moduleId" value={module.id} /><ReorderButton direction="up" disabled={moduleIndex === 0} /></form>
                              <form action={moveModuleAction}><input type="hidden" name="courseId" value={course.id} /><input type="hidden" name="moduleId" value={module.id} /><ReorderButton direction="down" disabled={moduleIndex === week.modules.length - 1} /></form>
                              <button type="button" onClick={() => setEditingModule(editingModule === module.id ? null : module.id)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-white" aria-label="Edit module"><Edit className="h-4 w-4" /></button>
                              <form action={deleteModuleAction} onSubmit={(event) => { if (!window.confirm('Delete Module? This will also remove all lessons and resources contained in this module.')) event.preventDefault(); }}><input type="hidden" name="courseId" value={course.id} /><input type="hidden" name="moduleId" value={module.id} /><button type="submit" className="rounded-lg border border-red-200 p-2 text-error hover:bg-red-50" aria-label="Delete module"><Trash2 className="h-4 w-4" /></button></form>
                            </div>
                          </div>
                          {editingModule === module.id && <div className="px-4 pb-4"><ModuleForm action={updateModuleAction.bind(null, course.id, module.id)} module={module} onDone={() => setEditingModule(null)} /></div>}
                          {moduleOpen && (
                            <div className="space-y-3 px-4 pb-4">
                              {module.lessons.length === 0 && <p className="rounded-lg bg-white p-4 text-sm text-slate-500">No lessons in this module.</p>}
                              {module.lessons.map((lesson, lessonIndex) => (
                                <div key={lesson.id} className="rounded-lg bg-white p-4">
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div><p className="font-bold text-slate-950">{lesson.title}</p><p className="text-xs font-semibold text-slate-500">{lesson.lessonType} · {lesson.duration ?? 0} min · {lesson.status}{lesson.isPreview ? ' · Preview' : ''}</p></div>
                                    <div className="flex flex-wrap gap-2">
                                      <form action={moveLessonAction}><input type="hidden" name="courseId" value={course.id} /><input type="hidden" name="lessonId" value={lesson.id} /><ReorderButton direction="up" disabled={lessonIndex === 0} /></form>
                                      <form action={moveLessonAction}><input type="hidden" name="courseId" value={course.id} /><input type="hidden" name="lessonId" value={lesson.id} /><ReorderButton direction="down" disabled={lessonIndex === module.lessons.length - 1} /></form>
                                      <Link href={`/admin/courses/${course.id}/lessons/${lesson.id}/edit`} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Edit</Link>
                                      <form action={deleteLessonAction} onSubmit={(event) => { if (!window.confirm('Delete Lesson? This lesson and its attached resources will be permanently removed.')) event.preventDefault(); }}><input type="hidden" name="courseId" value={course.id} /><input type="hidden" name="lessonId" value={lesson.id} /><button type="submit" className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-error hover:bg-red-50">Delete</button></form>
                                    </div>
                                  </div>
                                  <ResourceManager courseId={course.id} lessonId={lesson.id} resources={lesson.resources} />
                                </div>
                              ))}
                              {addingLesson === module.id ? <InlineLessonForm action={createLessonAction.bind(null, course.id, module.id)} onDone={() => setAddingLesson(null)} /> : <button type="button" onClick={() => setAddingLesson(module.id)} className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-primary hover:bg-surface-light">+ Add Lesson</button>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {addingModule === week.id ? <ModuleForm action={createModuleAction.bind(null, course.id, week.id)} onDone={() => setAddingModule(null)} /> : <button type="button" onClick={() => setAddingModule(week.id)} className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-semibold text-primary hover:bg-surface-light">+ Add Module</button>}
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
