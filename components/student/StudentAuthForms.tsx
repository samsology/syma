'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import {
  loginStudentAction,
  registerStudentAction,
  requestPasswordResetAction,
  resetStudentPasswordAction,
  type StudentActionState,
} from '@/app/student/actions';
import { PasswordInput } from '@/components/ui/PasswordInput';

const initialState: StudentActionState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-sm font-semibold text-error">{errors[0]}</p>;
}

export function StudentLoginForm({
  courseId,
  passwordChanged,
  passwordReset,
  next,
}: {
  courseId?: string;
  passwordChanged?: boolean;
  passwordReset?: boolean;
  next?: string;
}) {
  const [state, formAction, pending] = useActionState(loginStudentAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {courseId ? <input type="hidden" name="courseId" value={courseId} /> : null}
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {passwordChanged ? (
        <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-semibold text-success">
          Password changed successfully. Please sign in again.
        </p>
      ) : null}
      {passwordReset ? (
        <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-semibold text-success">
          Your password has been reset successfully. Please sign in with your new password.
        </p>
      ) : null}
      {state.formError ? (
        <p className="rounded-lg border border-error/30 bg-red-50 px-4 py-3 text-sm font-semibold text-error">
          {state.formError}
        </p>
      ) : null}
      <label className="block text-sm font-semibold text-slate-700">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.values?.email}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          required
        />
        <FieldError errors={state.fieldErrors?.email} />
      </label>
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="text-sm font-semibold text-slate-700">
            Password
          </label>
          <Link
            href="/student/forgot-password"
            className="text-xs font-semibold text-primary transition-colors hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="login-password"
          name="password"
          autoComplete="current-password"
          required
          className="mt-2"
        />
        <FieldError errors={state.fieldErrors?.password} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-black text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Signing in...' : 'Sign in'}
      </button>
      <p className="text-center text-sm text-slate-600">
        New student?{' '}
        <Link
          className="font-black text-primary"
          href={courseId ? `/student/register?courseId=${courseId}` : '/student/register'}
        >
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
      {state.formError ? (
        <p className="rounded-lg border border-error/30 bg-red-50 px-4 py-3 text-sm font-semibold text-error">
          {state.formError}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700">
          First name
          <input
            name="firstName"
            type="text"
            autoComplete="given-name"
            defaultValue={state.values?.firstName}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
          <FieldError errors={state.fieldErrors?.firstName} />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Last name
          <input
            name="lastName"
            type="text"
            autoComplete="family-name"
            defaultValue={state.values?.lastName}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            required
          />
          <FieldError errors={state.fieldErrors?.lastName} />
        </label>
      </div>
      <label className="block text-sm font-semibold text-slate-700">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.values?.email}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          required
        />
        <FieldError errors={state.fieldErrors?.email} />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Phone
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={state.values?.phone}
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <FieldError errors={state.fieldErrors?.phone} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-700">
            Password
          </label>
          <PasswordInput
            id="reg-password"
            name="password"
            autoComplete="new-password"
            required
            placeholder="Min. 12 characters"
            className="mt-2"
          />
          <FieldError errors={state.fieldErrors?.password} />
        </div>
        <div>
          <label htmlFor="reg-confirm-password" className="block text-sm font-semibold text-slate-700">
            Confirm password
          </label>
          <PasswordInput
            id="reg-confirm-password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            placeholder="Re-enter password"
            className="mt-2"
          />
          <FieldError errors={state.fieldErrors?.confirmPassword} />
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-black text-white hover:bg-primary/90 disabled:opacity-60"
      >
        {pending ? 'Creating account...' : 'Create account'}
      </button>
      <p className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link
          className="font-black text-primary"
          href={courseId ? `/student/login?courseId=${courseId}` : '/student/login'}
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function StudentForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

  return (
    <div className="space-y-5">
      {state.success ? (
        <div className="space-y-4">
          <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-semibold text-success">
            {state.success}
          </p>
          <p className="text-sm text-slate-600">
            Please check your inbox (and spam folder) for the password reset email. The link will expire in 1 hour.
          </p>
          <div className="pt-2 text-center">
            <Link
              href="/student/login"
              className="inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90"
            >
              Return to sign in
            </Link>
          </div>
        </div>
      ) : (
        <form action={formAction} className="space-y-5">
          {state.formError ? (
            <p className="rounded-lg border border-error/30 bg-red-50 px-4 py-3 text-sm font-semibold text-error">
              {state.formError}
            </p>
          ) : null}
          <label className="block text-sm font-semibold text-slate-700">
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={state.values?.email}
              placeholder="name@example.com"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            />
            <FieldError errors={state.fieldErrors?.email} />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-black text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Sending reset link...' : 'Send reset link'}
          </button>
          <p className="text-center text-sm text-slate-600">
            Remembered your password?{' '}
            <Link className="font-black text-primary hover:underline" href="/student/login">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}

export function StudentResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetStudentPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      {state.formError ? (
        <p className="rounded-lg border border-error/30 bg-red-50 px-4 py-3 text-sm font-semibold text-error">
          {state.formError}
        </p>
      ) : null}
      <div>
        <label htmlFor="reset-password" className="block text-sm font-semibold text-slate-700">
          New password
        </label>
        <PasswordInput
          id="reset-password"
          name="password"
          autoComplete="new-password"
          required
          placeholder="At least 12 characters"
          className="mt-2"
        />
        <FieldError errors={state.fieldErrors?.password} />
      </div>
      <div>
        <label htmlFor="reset-confirm-password" className="block text-sm font-semibold text-slate-700">
          Confirm new password
        </label>
        <PasswordInput
          id="reset-confirm-password"
          name="confirmPassword"
          autoComplete="new-password"
          required
          placeholder="Re-enter new password"
          className="mt-2"
        />
        <FieldError errors={state.fieldErrors?.confirmPassword} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-black text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Resetting password...' : 'Reset password'}
      </button>
      <p className="text-center text-sm text-slate-600">
        <Link className="font-black text-primary hover:underline" href="/student/login">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
