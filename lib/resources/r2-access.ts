import { db } from '@/lib/db';
import { r2ReferenceMatchesKey } from './r2-key';

/** Resolve only records whose normalized stored reference exactly matches the requested key. */
export async function getStudentResourceCourseIds(key: string): Promise<string[]> {
  const [resources, lessons] = await Promise.all([
    db.lessonResource.findMany({
      where: {
        isActive: true,
        lesson: { status: 'PUBLISHED' },
        OR: [
          { storageKey: key },
          { storageKey: { endsWith: key } },
          { fileUrl: key },
          { fileUrl: { endsWith: key } },
        ],
      },
      select: {
        storageKey: true,
        fileUrl: true,
        lesson: { select: { module: { select: { week: { select: { courseId: true } } } } } },
      },
    }),
    db.lesson.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { videoUrl: key },
          { videoUrl: { endsWith: key } },
          { slideUrl: key },
          { slideUrl: { endsWith: key } },
        ],
      },
      select: {
        videoUrl: true,
        slideUrl: true,
        module: { select: { week: { select: { courseId: true } } } },
      },
    }),
  ]);

  const courseIds = new Set<string>();
  for (const resource of resources) {
    const matches = [resource.storageKey, resource.fileUrl].some((reference) => r2ReferenceMatchesKey(reference, key));
    const courseId = resource.lesson.module.week.courseId;
    if (matches && courseId) courseIds.add(courseId);
  }
  for (const lesson of lessons) {
    const matches = [lesson.videoUrl, lesson.slideUrl].some((reference) => r2ReferenceMatchesKey(reference, key));
    const courseId = lesson.module.week.courseId;
    if (matches && courseId) courseIds.add(courseId);
  }
  return [...courseIds];
}
