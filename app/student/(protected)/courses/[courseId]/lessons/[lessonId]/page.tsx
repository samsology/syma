import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ArrowRight, Download, FileText, Presentation, Video } from 'lucide-react';
import { requireStudent } from '@/lib/auth/student-authorization';
import { getStudentLesson } from '@/lib/student-course/queries';
import { setLessonProgressAction } from '@/app/student/progress-actions';

function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type StudentLessonPageProps = {
  params: Promise<{ courseId: string; lessonId: string }>;
};

export default async function StudentLessonPage({ params }: StudentLessonPageProps) {
  const [{ courseId, lessonId }, student] = await Promise.all([params, requireStudent()]);
  const result = await getStudentLesson(student.id, courseId, lessonId);

  if (!result) redirect(`/student/courses/${courseId}`);

  const { enrollment, lesson, previousLesson, nextLesson, isCompleted, progress } = result;

  return (
    <article className="space-y-6">
      <Link
        href={`/student/courses/${courseId}`}
        className="text-primary inline-flex items-center gap-2 text-sm font-black"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Curriculum
      </Link>
      <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-primary text-sm font-bold tracking-wide uppercase">
          {enrollment.course.title} · Week {lesson.weekNumber} · {lesson.moduleTitle}
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{lesson.title}</h1>
        <div className="mt-5 max-w-xl">
          <div className="flex items-center justify-between text-xs font-black tracking-wide text-slate-500 uppercase">
            <span>{progress.percentage}% complete</span>
            <span>
              {progress.completedLessons}/{progress.totalLessons} lessons
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div
              className="bg-primary h-2 rounded-full"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </header>
      <section className="rounded-lg border border-slate-200 bg-white p-6 leading-7 text-slate-700 shadow-sm space-y-4">
        <div className="whitespace-pre-wrap">{lesson.content}</div>

        {lesson.resourceType === 'SLIDE' && lesson.slideUrl ? (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-indigo-600 p-2 text-white">
                <Presentation className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Interactive Slide Presentation</p>
                <p className="text-xs text-slate-500">Access full presentation deck for this lesson</p>
              </div>
            </div>
            <a
              href={lesson.slideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition"
            >
              Open Slide Deck
            </a>
          </div>
        ) : null}

        {lesson.videoUrl ? (
          <div className="rounded-lg border border-sky-200 bg-sky-50/50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-sky-600 p-2 text-white">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Video Lecture Explainer</p>
                <p className="text-xs text-slate-500">Watch instructor walkthrough</p>
              </div>
            </div>
            <a
              href={lesson.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-700 transition"
            >
              Watch Video
            </a>
          </div>
        ) : null}
      </section>
      {lesson.resources && lesson.resources.length > 0 ? (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Lesson Resources &amp; Materials</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {lesson.resources.map((resource) => (
              <div
                key={resource.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-slate-100 p-2 text-slate-600">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{resource.name}</p>
                    <p className="text-xs text-slate-500 uppercase">
                      {resource.fileType}
                      {resource.fileSize ? ` · ${formatFileSize(resource.fileSize)}` : ''}
                    </p>
                  </div>
                </div>
                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary inline-flex items-center gap-1.5 text-sm font-black hover:underline"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download
                </a>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      <form
        action={setLessonProgressAction}
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="lessonId" value={lessonId} />
        <input type="hidden" name="isCompleted" value={isCompleted ? 'false' : 'true'} />
        <button
          className={
            isCompleted
              ? 'hover:border-primary hover:text-primary rounded-lg border border-slate-200 px-4 py-2 text-sm font-black text-slate-700'
              : 'bg-primary hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-black text-white'
          }
        >
          {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
        </button>
      </form>
      <nav
        className="flex flex-col gap-3 sm:flex-row sm:justify-between"
        aria-label="Lesson navigation"
      >
        {previousLesson ? (
          <Link
            href={`/student/courses/${courseId}/lessons/${previousLesson.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Previous Lesson
          </Link>
        ) : (
          <span />
        )}
        {nextLesson ? (
          <Link
            href={`/student/courses/${courseId}/lessons/${nextLesson.id}`}
            className="bg-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-black text-white"
          >
            Next Lesson
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
