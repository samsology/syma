# Phase 5: Student and Enrollment Management

## Student Architecture

Phase 5 adds a learner domain that is intentionally separate from the admin domain:

```text
Student
  -> Enrollment
    -> Course
      -> CourseWeek
        -> CourseModule
          -> Lesson
```

Admins remain platform operators. Students are learners. The `Admin` model is not reused for students, and students never receive admin roles.

## Database

New Prisma enums:

- `StudentStatus`: `ACTIVE`, `INACTIVE`, `SUSPENDED`
- `EnrollmentStatus`: `PENDING`, `ACTIVE`, `COMPLETED`, `CANCELLED`, `SUSPENDED`

New Prisma models:

- `Student`: learner profile, normalized unique email, bcrypt password hash, explicit lifecycle status.
- `StudentSession`: opaque server-side student sessions, separate from `AdminSession`.
- `StudentLoginAttempt`: student login rate-limit tracking, separate from `AdminLoginAttempt`.
- `Enrollment`: joins `Student` to `Course` with status and audit-friendly dates.

Integrity rules:

- `Student.email` is unique.
- `Enrollment.studentId` references `Student`.
- `Enrollment.courseId` references `Course`.
- `Enrollment.studentId + courseId` is unique for the current business model.
- Student and course deletion are restricted when enrollment history exists.

## Authentication

Admin and student sessions are isolated:

- Admin cookie: `syma_admin_session`
- Student cookie: `syma_student_session`
- Admin session table: `AdminSession`
- Student session table: `StudentSession`

Both systems use HTTP-only cookies, secure cookies in production, opaque random tokens, and SHA-256 token hashes in the database. Student passwords use bcrypt with the same standard used by admin authentication.

Student helpers:

- `getCurrentStudent()`
- `requireStudent()`
- `requireEnrollment(studentId, courseId)`

`requireEnrollment` verifies active student status, an accessible enrollment status, published course status, and the course ownership chain before protected content is shown.

## Enrollment Access Rules

Students can access course content only when:

- they are authenticated as a student,
- their student account is `ACTIVE`,
- the course is `PUBLISHED`,
- an enrollment exists for that student and course,
- the enrollment status is `ACTIVE` or `COMPLETED`,
- the lesson belongs to that course and is `PUBLISHED`.

`PENDING`, `CANCELLED`, and `SUSPENDED` enrollments do not grant course access.

## Routes

Student routes:

- `/student`
- `/student/login`
- `/student/register`
- `/student/enroll?courseId=...`
- `/student/profile`
- `/student/profile/security`
- `/student/courses/[courseId]`
- `/student/courses/[courseId]/lessons/[lessonId]`

Admin routes:

- `/admin/students`
- `/admin/students/[id]`
- `/admin/enrollments`
- `/admin/enrollments/new`
- `/admin/enrollments/[id]`
- `/admin/courses/[id]/students`

## Public Programs

Public `/programs` still exposes only published course data. It does not return student, enrollment, admin, password, or session information.

Course cards now show:

- `Enroll Now` for unauthenticated visitors.
- `Enroll Now` for signed-in students without enrollment.
- `Continue Learning` for signed-in students already enrolled.

Phase 5 does not implement payments. Enrollment is a non-payment pathway that Phase 6 can extend with order and payment checks.

## Development Seed Data

The seed creates development-only student accounts:

```text
maya.student@example.test / studentpassword123
tunde.student@example.test / studentpassword123
amina.student@example.test / studentpassword123
```

The first seeded courses are published so seed enrollments can be attached to real published courses.

## Local Testing Workflow

Run:

```bash
npm run db:generate
npx prisma migrate deploy
npm run db:seed
npm test
npx prisma validate
npx prisma migrate status
npm run build
```

Manual QA targets:

- Register a student from `/student/register`.
- Sign in at `/student/login`.
- Visit `/programs`, enroll in a published course, and continue learning.
- Confirm `/student/courses/[courseId]` shows only published lessons.
- Confirm arbitrary lesson IDs from other courses redirect back to the authorized course.
- Confirm `/admin/students` and `/admin/enrollments` require admin auth.
- As admin, update student status and enrollment status.
- As admin, create a manual enrollment from `/admin/enrollments/new`.

ESLint has previously hung in this workspace, so do not report lint as verified unless it completes successfully.
