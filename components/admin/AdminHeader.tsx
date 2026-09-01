'use client';

import { Menu } from 'lucide-react';
import type { AdminSessionUser } from '@/lib/auth/session';
import { AdminUserMenu } from './AdminUserMenu';

type AdminHeaderProps = {
  admin: AdminSessionUser;
  title: string;
  onMenuClick: () => void;
};

export function AdminHeader({ admin, title, onMenuClick }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-accent/40 lg:hidden"
          aria-label="Open admin navigation"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin</p>
          <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">{title}</h1>
        </div>
      </div>
      <AdminUserMenu admin={admin} />
    </header>
  );
}
