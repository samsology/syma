import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/session';
import { LoginForm } from './LoginForm';

export const metadata = {
  title: 'Admin Login',
};

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();

  if (admin) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-light px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-primary">Syma Tech Solutions</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to manage the Syma Tech admin workspace.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
