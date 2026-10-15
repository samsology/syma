export function sanitizeR2PathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_');
}

export function isR2KeyForCourseLesson(key: string, courseId: string, lessonId: string): boolean {
  const prefix = `courses/${sanitizeR2PathSegment(courseId)}/lessons/${sanitizeR2PathSegment(lessonId)}/`;
  return key.startsWith(prefix) && !key.includes('..');
}
