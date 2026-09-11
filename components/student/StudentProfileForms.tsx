'use client';

import { useActionState } from 'react';
import {
  changeStudentPasswordAction,
  updateStudentProfileAction,
  type StudentActionState,
} from '@/app/student/actions';
import { PasswordInput } from '@/components/ui/PasswordInput';

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
      <div>
        <label htmlFor="current-password" className="block text-sm font-semibold text-slate-700">
          Current password
        </label>
        <PasswordInput
          id="current-password"
          name="currentPassword"
          autoComplete="current-password"
          required
          placeholder="Enter current password"
          className="mt-2"
        />
        <FieldError errors={state.fieldErrors?.currentPassword} />
      </div>
      <div>
        <label htmlFor="profile-new-password" className="block text-sm font-semibold text-slate-700">
          New password
        </label>
        <PasswordInput
          id="profile-new-password"
          name="newPassword"
          autoComplete="new-password"
          required
          placeholder="At least 12 characters"
          className="mt-2"
        />
        <FieldError errors={state.fieldErrors?.newPassword} />
      </div>
      <div>
        <label htmlFor="profile-confirm-password" className="block text-sm font-semibold text-slate-700">
          Confirm new password
        </label>
        <PasswordInput
          id="profile-confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          required
          placeholder="Re-enter new password"
          className="mt-2"
        />
        <FieldError errors={state.fieldErrors?.confirmPassword} />
      </div>
      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-5 py-3 text-sm font-black text-white hover:bg-primary/90 disabled:opacity-60">
        {pending ? 'Updating...' : 'Change password'}
      </button>
    </form>
  );
}
