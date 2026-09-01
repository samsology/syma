'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginStudentAction, registerStudentAction, type StudentActionState } from '@/app/student/actions';

const initialState: StudentActionState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-sm font-semibold text-error">{errors[0]}</p>;
}

export function StudentLoginForm({ courseId, passwordChanged }: { courseId?: string; passwordChanged?: boolean }) {
  const [state, formAction, pending] = useActionState(loginStudentAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {courseId ? <input type="hidden" name="courseId" value={courseId} /> : null}
      {passwordChanged ? (
        <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-semibold text-success">
          Password changed successfully. Please sign in again.
        </p>
      ) : null}
      {state.formError ? <p className="rounded-lg border border-error/30 bg-red-50 px-4 py-3 text-sm font-semibold text-error">{state.formError}</p> : null}
      <label className="block text-sm font-semibold text-slate-700">
        Email
        <input
          name="email"
          type="email"
          defaultValue={state.values?.email}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          required
        />
        <FieldError errors={state.fieldErrors?.email} />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Password
        <input
          name="password"
          type="password"
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          required
        />
        <FieldError errors={state.fieldErrors?.password} />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-black text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Signing in...' : 'Sign in'}
      </button>
      <p className="text-center text-sm text-slate-600">
        New student?{' '}
        <Link className="font-black text-primary" href={courseId ? `/student/register?courseId=${courseId}` : '/student/register'}>
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function StudentRegisterForm({ courseId }: { courseId?: string }) {
  const [state, formAction, pending] = useActionState(registerStudentAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {courseId ? <input type="hidden" name="courseId" value={courseId} /> : null}
      {state.formError ? <p className="rounded-lg border border-error/30 bg-red-50 px-4 py-3 text-sm font-semibold text-error">{state.formError}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700">
          First name
          <input name="firstName" defaultValue={state.values?.firstName} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" required />
          <FieldError errors={state.fieldErrors?.firstName} />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Last name
          <input name="lastName" defaultValue={state.values?.lastName} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" required />
          <FieldError errors={state.fieldErrors?.lastName} />
        </label>
      </div>
      <label className="block text-sm font-semibold text-slate-700">
        Email
        <input name="email" type="email" defaultValue={state.values?.email} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" required />
        <FieldError errors={state.fieldErrors?.email} />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Phone
        <input name="phone" defaultValue={state.values?.phone} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        <FieldError errors={state.fieldErrors?.phone} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700">
          Password
          <input name="password" type="password" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" required />
          <FieldError errors={state.fieldErrors?.password} />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Confirm password
          <input name="confirmPassword" type="password" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" required />
          <FieldError errors={state.fieldErrors?.confirmPassword} />
        </label>
      </div>
      <button type="submit" disabled={pending} className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-black text-white hover:bg-primary/90 disabled:opacity-60">
        {pending ? 'Creating account...' : 'Create account'}
      </button>
      <p className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link className="font-black text-primary" href={courseId ? `/student/login?courseId=${courseId}` : '/student/login'}>
          Sign in
        </Link>
      </p>
    </form>
  );
}
