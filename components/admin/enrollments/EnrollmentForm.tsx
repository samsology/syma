'use client';

import { useActionState } from 'react';
import { createEnrollmentAction, type EnrollmentActionState } from '@/app/admin/(protected)/enrollments/actions';

type EnrollmentFormProps = {
  students: { id: string; firstName: string; lastName: string; email: string }[];
  courses: { id: string; title: string; slug: string }[];
  selectedStudentId?: string;
  selectedCourseId?: string;
};

export function EnrollmentForm({ students, courses, selectedStudentId, selectedCourseId }: EnrollmentFormProps) {
  const [state, formAction, pending] = useActionState(createEnrollmentAction, {} as EnrollmentActionState);

  return (
    <form action={formAction} className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      {state.formError ? <p className="rounded-lg border border-error/30 bg-red-50 px-4 py-3 text-sm font-semibold text-error">{state.formError}</p> : null}
      <label className="block text-sm font-semibold text-slate-700">
        Student
        <select name="studentId" defaultValue={selectedStudentId ?? ''} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" required>
          <option value="">Select student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>{student.firstName} {student.lastName} · {student.email}</option>
          ))}
        </select>
        {state.fieldErrors?.studentId?.[0] ? <p className="mt-1 text-sm font-semibold text-error">{state.fieldErrors.studentId[0]}</p> : null}
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Course
        <select name="courseId" defaultValue={selectedCourseId ?? ''} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" required>
          <option value="">Select course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>
        {state.fieldErrors?.courseId?.[0] ? <p className="mt-1 text-sm font-semibold text-error">{state.fieldErrors.courseId[0]}</p> : null}
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Status
        <select name="status" defaultValue="ACTIVE" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
          {['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'SUSPENDED'].map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </label>
      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-5 py-3 text-sm font-black text-white hover:bg-primary/90 disabled:opacity-60">
        {pending ? 'Creating...' : 'Create Enrollment'}
      </button>
    </form>
  );
}
