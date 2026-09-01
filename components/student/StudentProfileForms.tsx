'use client';

import { useActionState } from 'react';
import {
  changeStudentPasswordAction,
  updateStudentProfileAction,
  type StudentActionState,
} from '@/app/student/actions';

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-sm font-semibold text-error">{errors[0]}</p>;
}

export function StudentProfileForm({
  student,
}: {
  student: { firstName: string; lastName: string; email: string; phone: string | null };
}) {
  const [state, formAction, pending] = useActionState(updateStudentProfileAction, {} as StudentActionState);

  return (
    <form action={formAction} className="space-y-5">
      {state.success ? <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-semibold text-success">{state.success}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700">
          First name
          <input name="firstName" defaultValue={student.firstName} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" required />
          <FieldError errors={state.fieldErrors?.firstName} />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Last name
          <input name="lastName" defaultValue={student.lastName} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" required />
          <FieldError errors={state.fieldErrors?.lastName} />
        </label>
      </div>
      <label className="block text-sm font-semibold text-slate-700">
        Email
        <input value={student.email} readOnly className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500" />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Phone
        <input name="phone" defaultValue={student.phone ?? ''} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <FieldError errors={state.fieldErrors?.phone} />
      </label>
      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-5 py-3 text-sm font-black text-white hover:bg-primary/90 disabled:opacity-60">
        {pending ? 'Saving...' : 'Save profile'}
      </button>
    </form>
  );
}

export function StudentPasswordForm() {
  const [state, formAction, pending] = useActionState(changeStudentPasswordAction, {} as StudentActionState);

  return (
    <form action={formAction} className="space-y-5">
      {state.formError ? <p className="rounded-lg border border-error/30 bg-red-50 px-4 py-3 text-sm font-semibold text-error">{state.formError}</p> : null}
      <label className="block text-sm font-semibold text-slate-700">
        Current password
        <input name="currentPassword" type="password" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" required />
        <FieldError errors={state.fieldErrors?.currentPassword} />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        New password
        <input name="newPassword" type="password" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" required />
        <FieldError errors={state.fieldErrors?.newPassword} />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Confirm new password
        <input name="confirmPassword" type="password" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" required />
        <FieldError errors={state.fieldErrors?.confirmPassword} />
      </label>
      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-5 py-3 text-sm font-black text-white hover:bg-primary/90 disabled:opacity-60">
        {pending ? 'Updating...' : 'Change password'}
      </button>
    </form>
  );
}
