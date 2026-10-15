import assert from 'node:assert/strict';
import test from 'node:test';
import { isR2KeyForCourseLesson, sanitizeR2PathSegment } from '../lib/resources/r2-upload-key';

test('R2 upload key validation supports pre-save draft lesson uploads scoped to a real course', () => {
  assert.equal(
    isR2KeyForCourseLesson('courses/course_1/lessons/draft/video/abc-lecture.mp4', 'course_1', 'draft'),
    true
  );
});

test('R2 upload key validation rejects another course, lesson, or traversal path', () => {
  assert.equal(
    isR2KeyForCourseLesson('courses/course_2/lessons/draft/video/abc-lecture.mp4', 'course_1', 'draft'),
    false
  );
  assert.equal(
    isR2KeyForCourseLesson('courses/course_1/lessons/other/video/abc-lecture.mp4', 'course_1', 'draft'),
    false
  );
  assert.equal(
    isR2KeyForCourseLesson('courses/course_1/lessons/draft/../secret.mp4', 'course_1', 'draft'),
    false
  );
  assert.equal(sanitizeR2PathSegment('draft/../x'), 'draft____x');
});
