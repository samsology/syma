'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import {
  resendRegistrationTokenAction,
  type ResendTokenActionState,
} from '@/app/continue-registration/actions';

const initialState: ResendTokenActionState = {};

export function ResendRegistrationForm() {
  const [state, formAction, pending] = useActionState(
    resendRegistrationTokenAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <div className="flex items-center gap-2 font-bold">
            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Request Sent
          </div>
          <p className="mt-1">{state.success}</p>
        </div>
      ) : null}

      {state.formError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {state.formError}
        </div>
      ) : null}

      <div>
        <label className="block text-sm font-semibold text-slate-700">
          Application Email Address
          <input
            name="email"
            type="email"
            required
            placeholder="samuel@example.com"
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <p className="mt-1.5 text-xs text-slate-500">
          Enter the exact email address you submitted on your Syma Tech application form.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary py-3.5 px-4 text-center text-sm font-black text-white shadow-md transition-all hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Generating Link...' : 'Send New Registration Link'}
      </button>

      <div className="flex flex-col gap-2 pt-2 text-center text-xs text-slate-500">
        <p>
          Already completed account onboarding?{' '}
          <Link href="/student/login" className="font-bold text-primary hover:underline">
            Sign in to your portal
          </Link>
        </p>
        <p>
          Haven&apos;t applied yet?{' '}
          <Link href="/enroll" className="font-bold text-primary hover:underline">
            Submit an application
          </Link>
        </p>
      </div>
    </form>
  );
}
