'use client';

import { useActionState } from 'react';
import { AlertCircle, LockKeyhole, Mail } from 'lucide-react';
import { loginAdminAction, type AdminLoginState } from '@/app/admin/actions';
import { Button } from '@/components/ui/Button';

const initialState: AdminLoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAdminAction, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5" noValidate>
      {state.formError && (
        <div
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-error"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{state.formError}</span>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
          Email
        </label>
        <div className="relative mt-2">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={state.values?.email}
            autoComplete="email"
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={state.fieldErrors?.email ? 'email-error' : undefined}
            className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm text-slate-900"
          />
        </div>
        {state.fieldErrors?.email && (
          <p id="email-error" className="mt-2 text-sm font-medium text-error">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
          Password
        </label>
        <div className="relative mt-2">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={Boolean(state.fieldErrors?.password)}
            aria-describedby={state.fieldErrors?.password ? 'password-error' : undefined}
            className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm text-slate-900"
          />
        </div>
        {state.fieldErrors?.password && (
          <p id="password-error" className="mt-2 text-sm font-medium text-error">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full rounded-lg" isLoading={pending} disabled={pending}>
        {pending ? 'Signing in...' : 'Login'}
      </Button>
    </form>
  );
}
