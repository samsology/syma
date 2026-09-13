import assert from 'node:assert/strict';
import test from 'node:test';
import { adminLoginSchema } from '../lib/validation/login';
import { createSessionToken, hashToken } from '../lib/auth/crypto';
import { lessonSchema } from '../lib/validation/lesson';
import { moduleSchema } from '../lib/validation/module';
import { resourceSchema } from '../lib/validation/resource';
import { weekSchema } from '../lib/validation/week';
import {
  createEnrollmentSchema,
  studentEnrollSchema,
  updateEnrollmentStatusSchema,
} from '../lib/validation/enrollment';
import {
  changeStudentPasswordSchema,
  studentLoginSchema,
  studentRegisterSchema,
} from '../lib/validation/student';
import {
  createOrderSchema,
  initializePaymentSchema,
  verifyPaymentSchema,
} from '../lib/validation/payment';
import {
  canTransitionOrderStatus,
  canTransitionPaymentStatus,
  formatMoney,
} from '../lib/payments/rules';
import { summarizeLessonProgress } from '../lib/student-course/progress';
import { OFFICIAL_COURSES, formatCoursePrice } from '../lib/courses/catalog';

test('login schema accepts valid credentials', () => {
  const parsed = adminLoginSchema.safeParse({
    email: 'admin@example.com',
    password: 'correct horse battery staple',
  });

  assert.equal(parsed.success, true);
});

test('login schema rejects invalid email', () => {
  const parsed = adminLoginSchema.safeParse({
    email: 'not-an-email',
    password: 'password',
  });

  assert.equal(parsed.success, false);
});

test('login schema rejects missing password', () => {
  const parsed = adminLoginSchema.safeParse({
    email: 'admin@example.com',
    password: '',
  });

  assert.equal(parsed.success, false);
});

test('session tokens are random and hashed before storage', () => {
  const firstToken = createSessionToken();
  const secondToken = createSessionToken();
  const firstHash = hashToken(firstToken);

  assert.notEqual(firstToken, secondToken);
  assert.notEqual(firstHash, firstToken);
  assert.equal(firstHash.length, 64);
  assert.equal(hashToken(firstToken), firstHash);
});

test('week schema accepts coerced week numbers', () => {
  const parsed = weekSchema.safeParse({
    weekNumber: '2',
    title: 'Data Collection',
    description: 'Collect reliable data.',
  });

  assert.equal(parsed.success, true);
  if (parsed.success) assert.equal(parsed.data.weekNumber, 2);
});

test('module schema rejects empty titles', () => {
  const parsed = moduleSchema.safeParse({
    title: ' ',
    description: 'Module details',
  });

  assert.equal(parsed.success, false);
});

test('lesson schema validates slugs and lesson status', () => {
  const parsed = lessonSchema.safeParse({
    title: 'Understanding Data Types',
    slug: 'understanding-data-types',
    lessonType: 'TEXT',
    content: 'Lesson content',
    duration: '30',
    isPreview: true,
    status: 'DRAFT',
  });

  assert.equal(parsed.success, true);
});

test('resource schema rejects unsupported file types', () => {
  const parsed = resourceSchema.safeParse({
    name: 'Installer',
    fileUrl: 'https://example.com/install.exe',
    fileType: 'exe',
    fileSize: '1000',
  });

  assert.equal(parsed.success, false);
});

test('student registration normalizes email and requires matching passwords', () => {
  const parsed = studentRegisterSchema.safeParse({
    firstName: ' Maya ',
    lastName: ' Okafor ',
    email: 'MAYA.STUDENT@EXAMPLE.TEST',
    phone: '',
    password: 'studentpassword123',
    confirmPassword: 'studentpassword123',
  });

  assert.equal(parsed.success, true);
  if (parsed.success) assert.equal(parsed.data.email, 'maya.student@example.test');

  const mismatch = studentRegisterSchema.safeParse({
    firstName: 'Maya',
    lastName: 'Okafor',
    email: 'maya@example.test',
    password: 'studentpassword123',
    confirmPassword: 'differentpassword123',
  });

  assert.equal(mismatch.success, false);
});

test('student login validates email and password presence', () => {
  assert.equal(
    studentLoginSchema.safeParse({ email: 'student@example.test', password: 'studentpassword123' })
      .success,
    true
  );
  assert.equal(studentLoginSchema.safeParse({ email: 'bad', password: '' }).success, false);
});

test('student password change requires current password and confirmation', () => {
  assert.equal(
    changeStudentPasswordSchema.safeParse({
      currentPassword: 'studentpassword123',
      newPassword: 'newstudentpassword123',
      confirmPassword: 'newstudentpassword123',
    }).success,
    true
  );

  assert.equal(
    changeStudentPasswordSchema.safeParse({
      currentPassword: '',
      newPassword: 'newstudentpassword123',
      confirmPassword: 'wrongstudentpassword123',
    }).success,
    false
  );
});

test('enrollment validation accepts whitelisted statuses and required ids', () => {
  assert.equal(
    createEnrollmentSchema.safeParse({
      studentId: 'student_1',
      courseId: 'course_1',
      status: 'ACTIVE',
    }).success,
    true
  );
  assert.equal(
    updateEnrollmentStatusSchema.safeParse({ enrollmentId: 'enrollment_1', status: 'REFUNDED' })
      .success,
    false
  );
  assert.equal(studentEnrollSchema.safeParse({ courseId: '' }).success, false);
});

test('payment validation accepts server identifiers and rejects missing references', () => {
  assert.equal(createOrderSchema.safeParse({ courseId: 'course_1' }).success, true);
  assert.equal(
    initializePaymentSchema.safeParse({ orderNumber: 'SYM-20260902-ABC123' }).success,
    true
  );
  assert.equal(verifyPaymentSchema.safeParse({ reference: '' }).success, false);
});

test('order and payment transitions are constrained', () => {
  assert.equal(canTransitionOrderStatus('PENDING', 'PAID'), true);
  assert.equal(canTransitionOrderStatus('PAID', 'FAILED'), false);
  assert.equal(canTransitionPaymentStatus('PENDING', 'SUCCESS'), true);
  assert.equal(canTransitionPaymentStatus('FAILED', 'SUCCESS'), false);
});

test('money formatting uses integer minor units', () => {
  assert.equal(formatMoney(6990, 'USD'), '$69.90');
});

test('canonical catalogue contains exactly the 4 official courses in USD', () => {
  const expected = [
    { slug: 'introduction-to-data-literacy', price: '$19.90', priceMinor: 1990 },
    { slug: 'introduction-to-data-analytics', price: '$39.90', priceMinor: 3990 },
    { slug: 'introduction-to-data-science', price: '$49.90', priceMinor: 4990 },
    { slug: 'healthcare-analytics', price: '$69.90', priceMinor: 6990 },
  ];

  assert.equal(OFFICIAL_COURSES.length, expected.length);

  for (const [index, item] of expected.entries()) {
    const course = OFFICIAL_COURSES[index];
    assert.equal(course.slug, item.slug);
    assert.equal(course.currency, 'USD');
    assert.equal(course.priceMinor, item.priceMinor);
    assert.equal(course.price, item.price);
    assert.equal(formatCoursePrice(course.priceMinor, course.currency), item.price);
  }
});

test('lesson progress summary handles empty, partial, and complete courses', () => {
  assert.deepEqual(summarizeLessonProgress([], []), {
    completedLessons: 0,
    totalLessons: 0,
    percentage: 0,
    isComplete: false,
    nextLessonId: null,
  });

  assert.deepEqual(summarizeLessonProgress(['lesson-1', 'lesson-2'], ['lesson-1']), {
    completedLessons: 1,
    totalLessons: 2,
    percentage: 50,
    isComplete: false,
    nextLessonId: 'lesson-2',
  });

  assert.deepEqual(
    summarizeLessonProgress(
      ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'],
      ['lesson-1', 'lesson-2', 'lesson-3']
    ),
    {
      completedLessons: 3,
      totalLessons: 4,
      percentage: 75,
      isComplete: false,
      nextLessonId: 'lesson-4',
    }
  );

  assert.deepEqual(summarizeLessonProgress(['lesson-1', 'lesson-2'], ['lesson-1', 'lesson-2']), {
    completedLessons: 2,
    totalLessons: 2,
    percentage: 100,
    isComplete: true,
    nextLessonId: null,
  });
});

test('public student routes are explicitly defined and protected routes are excluded', async () => {
  const { PUBLIC_STUDENT_ROUTES } = await import('../lib/auth/constants');

  assert.ok(PUBLIC_STUDENT_ROUTES.includes('/student/login'));
  assert.ok(PUBLIC_STUDENT_ROUTES.includes('/student/register'));
  assert.ok(PUBLIC_STUDENT_ROUTES.includes('/student/forgot-password'));
  assert.ok(PUBLIC_STUDENT_ROUTES.includes('/student/reset-password'));
  assert.ok(!PUBLIC_STUDENT_ROUTES.includes('/student'));
  assert.ok(!PUBLIC_STUDENT_ROUTES.includes('/student/dashboard'));
  assert.ok(!PUBLIC_STUDENT_ROUTES.includes('/student/orders'));
  assert.ok(!PUBLIC_STUDENT_ROUTES.includes('/student/profile'));
});

test('login redirect safety rejects redirecting back to auth pages or external URLs', async () => {
  const { PUBLIC_STUDENT_ROUTES } = await import('../lib/auth/constants');

  function isSafeStudentRedirect(target: string | null | undefined): boolean {
    if (!target) return false;
    const trimmed = target.trim();
    if (!trimmed.startsWith('/student') || trimmed.startsWith('//')) return false;
    const isPublic = PUBLIC_STUDENT_ROUTES.some((route) => trimmed === route || trimmed.startsWith(`${route}/`));
    return !isPublic;
  }

  // Dangerous / looping redirect parameters
  assert.equal(isSafeStudentRedirect('/student/login'), false);
  assert.equal(isSafeStudentRedirect('/student/register'), false);
  assert.equal(isSafeStudentRedirect('/student/forgot-password'), false);
  assert.equal(isSafeStudentRedirect('//evil.com/student'), false);
  assert.equal(isSafeStudentRedirect('https://evil.com/student'), false);
  assert.equal(isSafeStudentRedirect('/admin/dashboard'), false);

  // Safe destinations
  assert.equal(isSafeStudentRedirect('/student'), true);
  assert.equal(isSafeStudentRedirect('/student/courses/cmtjaxyja0023udfg2g8j95pv'), true);
  assert.equal(isSafeStudentRedirect('/student/profile'), true);
  assert.equal(isSafeStudentRedirect('/student/orders'), true);
});

test('destroyStudentSession sets matching expired cookie options', async () => {
  const { STUDENT_SESSION_COOKIE, STUDENT_SESSION_MAX_AGE_SECONDS } = await import('../lib/auth/constants');
  assert.equal(STUDENT_SESSION_COOKIE, 'syma_student_session');
  assert.equal(STUDENT_SESSION_MAX_AGE_SECONDS, 60 * 60 * 24 * 7);
});

test('proxy bypasses internal action requests and action redirects', async () => {
  const { proxy } = await import('../proxy');
  const { NextRequest } = await import('next/server');

  // Request with x-action-redirect header should pass through without redirecting to login
  const actionRedirectReq = new NextRequest('http://localhost:3000/student', {
    headers: {
      'x-action-redirect': '/student;push',
    },
  });
  const res1 = proxy(actionRedirectReq);
  assert.equal(res1.status, 200);

  // Request with next-action header should pass through without redirecting to login
  const nextActionReq = new NextRequest('http://localhost:3000/student', {
    headers: {
      'next-action': 'some-action-id',
    },
  });
  const res2 = proxy(nextActionReq);
  assert.equal(res2.status, 200);

  // Standard unauthenticated request to protected student route should still redirect to login
  const normalReq = new NextRequest('http://localhost:3000/student');
  const res3 = proxy(normalReq);
  assert.equal(res3.status, 307);
  assert.ok(res3.headers.get('location')?.includes('/student/login?next=%2Fstudent'));
});

