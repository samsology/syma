'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import {
  completeStudentRegistrationAction,
  type ContinueRegistrationActionState,
} from '@/app/continue-registration/actions';

type ContinueRegistrationFormProps = {
  token: string;
  initialData: {
    fullName: string;
    email: string;
    phone: string;
    program: string;
  };
};

const initialState: ContinueRegistrationActionState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-sm font-semibold text-red-600">{errors[0]}</p>;
}

export function ContinueRegistrationForm({
  token,
  initialData,
}: ContinueRegistrationFormProps) {
  const [state, formAction, pending] = useActionState(
    completeStudentRegistrationAction,
    initialState
  );

  const nameParts = initialData.fullName.trim().split(/\s+/);
  const defaultFirstName = nameParts[0] || '';
  const defaultLastName = nameParts.slice(1).join(' ') || '';

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="token" value={token} />

      {/* Selected Program Display Banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Enrolling In
        </span>
        <p className="mt-1 text-lg font-black text-slate-900">
          {initialData.program}
        </p>
      </div>

      {/* Form Errors */}
      {state.formError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">{state.formError}</p>
          {state.alreadyUsed || state.existingAccount ? (
            <div className="mt-3">
              <Link
                href="/student/login"
                className="inline-flex items-center rounded-lg bg-red-700 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-800"
              >
                Sign In to Student Portal &rarr;
              </Link>
            </div>
          ) : null}
          {state.expired ? (
            <div className="mt-3">
              <Link
                href="/student/registration/resend"
                className="inline-flex items-center rounded-lg bg-red-700 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-red-800"
              >
                Request New Registration Link &rarr;
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Email (Read-only) */}
      <div>
        <label className="block text-sm font-semibold text-slate-700">
          Email Address
          <span className="ml-2 text-xs font-normal text-slate-500">(Verified from application)</span>
          <input
            type="email"
            value={initialData.email}
            disabled
            className="mt-2 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-slate-600 shadow-sm"
          />
        </label>
      </div>

      {/* Name Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700">
          First Name
          <input
            name="firstName"
            type="text"
            defaultValue={state.values?.firstName ?? defaultFirstName}
            required
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <FieldError errors={state.fieldErrors?.firstName} />
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Last Name
          <input
            name="lastName"
            type="text"
            defaultValue={state.values?.lastName ?? defaultLastName}
            required
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <FieldError errors={state.fieldErrors?.lastName} />
        </label>
      </div>

      {/* Phone Field */}
      <div>
        <label className="block text-sm font-semibold text-slate-700">
          Phone Number
          <input
            name="phone"
            type="tel"
            defaultValue={state.values?.phone ?? initialData.phone}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <FieldError errors={state.fieldErrors?.phone} />
        </label>
      </div>

      {/* Passwords */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <FieldError errors={state.fieldErrors?.password} />
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Confirm Password
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            placeholder="Re-enter password"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <FieldError errors={state.fieldErrors?.confirmPassword} />
        </label>
      </div>

      {/* Terms Agreement Checkbox */}
      <div className="pt-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            name="agreeTerms"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <span className="text-xs text-slate-600">
            I agree to the Syma Tech Solutions{' '}
            <Link href="/terms" className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        <FieldError errors={state.fieldErrors?.agreeTerms} />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary py-3.5 px-4 text-center text-sm font-black text-white shadow-md transition-all hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Completing Account Setup...' : 'Complete Registration & Access Portal'}
      </button>

      <p className="text-center text-xs text-slate-500">
        Already finished registration?{' '}
        <Link href="/student/login" className="font-bold text-primary hover:underline">
          Sign in here
        </Link>
      </p>
    </form>
  );
}
