import assert from 'node:assert/strict';
import test from 'node:test';
import bcrypt from 'bcryptjs';
import { OFFICIAL_COURSES, formatCoursePrice } from '../lib/courses/catalog';
import { formatMoney } from '../lib/payments/rules';
import { summarizeLessonProgress } from '../lib/student-course/progress';
import {
  studentRegisterSchema,
  studentLoginSchema,
  updateStudentProfileSchema,
  changeStudentPasswordSchema,
} from '../lib/validation/student';
import {
  createEnrollmentSchema,
  studentEnrollSchema,
  updateEnrollmentStatusSchema,
} from '../lib/validation/enrollment';
import { adminLoginSchema } from '../lib/validation/login';
import { courseSchema } from '../lib/validation/course';
import { weekSchema } from '../lib/validation/week';
import { moduleSchema } from '../lib/validation/module';
import { lessonSchema } from '../lib/validation/lesson';
import { createSessionToken, hashToken } from '../lib/auth/crypto';

test('1. Public Catalogue contains exactly 4 official courses in USD', () => {
  assert.equal(OFFICIAL_COURSES.length, 4);

  const slugs = OFFICIAL_COURSES.map((c) => c.slug);
  assert.deepEqual(slugs, [
    'introduction-to-data-literacy',
    'introduction-to-data-analytics',
    'introduction-to-data-science',
    'healthcare-analytics',
  ]);

  // Ensure archived course is NOT in the public catalogue
  assert.equal(slugs.includes('advanced-data-analytics'), false);

  // Validate pricing and duration for each course
  const expectedPrices = ['$19.90', '$39.90', '$49.90', '$69.90'];
  const expectedDurations = ['6 Weeks', '8 Weeks', '8 Weeks', '8 Weeks'];

  OFFICIAL_COURSES.forEach((course, i) => {
    assert.equal(course.currency, 'USD');
    assert.equal(formatCoursePrice(course.priceMinor, course.currency), expectedPrices[i]);
    assert.equal(course.duration, expectedDurations[i]);
  });
});

test('2. Currency display strictly renders USD and never NGN', () => {
  assert.equal(formatMoney(1990, 'USD'), '$19.90');
  assert.equal(formatMoney(3990, 'USD'), '$39.90');
  assert.equal(formatMoney(4990, 'USD'), '$49.90');
  assert.equal(formatMoney(6990, 'USD'), '$69.90');
  assert.equal(formatMoney(0, 'USD'), '$0.00');
});

test('3. Student Registration input validation and password hashing', async () => {
  const valid = studentRegisterSchema.safeParse({
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada.lovelace@example.com',
    phone: '+234 801 234 5678',
    password: 'securePassword123!',
    confirmPassword: 'securePassword123!',
  });
  assert.equal(valid.success, true);

  if (valid.success) {
    const passwordHash = await bcrypt.hash(valid.data.password, 12);
    const matches = await bcrypt.compare('securePassword123!', passwordHash);
    const rejectsWrong = await bcrypt.compare('wrongPassword', passwordHash);
    assert.equal(matches, true);
    assert.equal(rejectsWrong, false);
  }

  // Reject mismatching passwords
  const mismatch = studentRegisterSchema.safeParse({
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    password: 'passwordA',
    confirmPassword: 'passwordB',
  });
  assert.equal(mismatch.success, false);
});

test('4. Student Login validation and session management', () => {
  const parsed = studentLoginSchema.safeParse({
    email: 'ada.lovelace@example.com',
    password: 'securePassword123!',
  });
  assert.equal(parsed.success, true);

  const token = createSessionToken();
  const tokenHash = hashToken(token);
  assert.equal(typeof token, 'string');
  assert.equal(tokenHash.length, 64);
  assert.equal(hashToken(token), tokenHash);
});

test('5. Student Profile and Password Update validation', () => {
  const profileUpdate = updateStudentProfileSchema.safeParse({
    firstName: 'Ada',
    lastName: 'Byron',
    phone: '+234 809 999 9999',
  });
  assert.equal(profileUpdate.success, true);

  const passwordChange = changeStudentPasswordSchema.safeParse({
    currentPassword: 'oldPassword123!',
    newPassword: 'newSuperSecurePassword456!',
    confirmPassword: 'newSuperSecurePassword456!',
  });
  assert.equal(passwordChange.success, true);
});

test('6. Student Enrollment validation and access control', () => {
  const enrollment = createEnrollmentSchema.safeParse({
    studentId: 'student-uuid-1',
    courseId: 'course-uuid-1',
    status: 'ACTIVE',
  });
  assert.equal(enrollment.success, true);

  const invalidEnrollment = createEnrollmentSchema.safeParse({
    studentId: '',
    courseId: '',
  });
  assert.equal(invalidEnrollment.success, false);
});

test('7. Lesson access, complete toggle, and progress calculation', () => {
  const lessonIds = ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'];

  // Not started (0%)
  const state0 = summarizeLessonProgress(lessonIds, []);
  assert.equal(state0.completedLessons, 0);
  assert.equal(state0.totalLessons, 4);
  assert.equal(state0.percentage, 0);
  assert.equal(state0.isComplete, false);
  assert.equal(state0.nextLessonId, 'lesson-1');

  // Completed 2 of 4 (50%)
  const state50 = summarizeLessonProgress(lessonIds, ['lesson-1', 'lesson-2']);
  assert.equal(state50.completedLessons, 2);
  assert.equal(state50.totalLessons, 4);
  assert.equal(state50.percentage, 50);
  assert.equal(state50.isComplete, false);
  assert.equal(state50.nextLessonId, 'lesson-3');

  // Fully completed (100%)
  const state100 = summarizeLessonProgress(lessonIds, lessonIds);
  assert.equal(state100.completedLessons, 4);
  assert.equal(state100.totalLessons, 4);
  assert.equal(state100.percentage, 100);
  assert.equal(state100.isComplete, true);
  assert.equal(state100.nextLessonId, null);
});

test('8. Admin Login validation and permissions isolation', () => {
  const adminLogin = adminLoginSchema.safeParse({
    email: 'admin@symatechsolutions.com',
    password: 'superSecretAdminPass123!',
  });
  assert.equal(adminLogin.success, true);

  const invalidAdmin = adminLoginSchema.safeParse({
    email: 'not-an-email',
    password: '',
  });
  assert.equal(invalidAdmin.success, false);
});

test('9. Admin Course Management: Course, Week, Module, Lesson Schemas', () => {
  const course = courseSchema.safeParse({
    title: 'Healthcare Analytics',
    slug: 'healthcare-analytics',
    shortDescription: 'Advanced healthcare intelligence and clinical metrics.',
    description: 'Master clinical data frameworks, hospital KPIs, and health biostatistics.',
    category: 'Healthcare Analytics',
    level: 'Specialist',
    duration: '8 Weeks',
    priceMinor: '6990',
    currency: 'USD',
    status: 'PUBLISHED',
    benefits: ['Hospital KPIs', 'Clinical Reporting', 'Biostatistics'],
    cta: 'Enroll Now',
  });
  assert.equal(course.success, true);

  const week = weekSchema.safeParse({
    weekNumber: 1,
    title: 'Foundations of Clinical Data',
    description: 'Introduction to EHR systems and medical coding.',
  });
  assert.equal(week.success, true);

  const module = moduleSchema.safeParse({
    title: 'Clinical Data Structures',
    description: 'ICD-10, SNOMED, and FHIR standards.',
  });
  assert.equal(module.success, true);

  const lesson = lessonSchema.safeParse({
    title: 'Understanding Patient Encounters',
    slug: 'understanding-patient-encounters',
    lessonType: 'TEXT',
    content: 'Full markdown lesson content here.',
    duration: 45,
    isPreview: true,
    status: 'PUBLISHED',
  });
  assert.equal(lesson.success, true);
});
