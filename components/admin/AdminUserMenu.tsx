'use client';

import { useState } from 'react';
import { ChevronDown, LogOut, UserCircle } from 'lucide-react';
import { logoutAdminAction } from '@/app/admin/actions';
import type { AdminSessionUser } from '@/lib/auth/session';

type AdminUserMenuProps = {
  admin: AdminSessionUser;
};

export function AdminUserMenu({ admin }: AdminUserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-accent/40"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <UserCircle className="h-8 w-8 text-primary" aria-hidden="true" />
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate text-sm font-semibold text-slate-900">{admin.name}</span>
          <span className="block text-xs text-slate-500">{admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Administrator'}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
        >
          <div className="border-b border-slate-100 px-2 pb-3">
            <p className="truncate text-sm font-semibold text-slate-900">{admin.name}</p>
            <p className="truncate text-xs text-slate-500">{admin.email}</p>
            <p className="mt-2 inline-flex rounded-full bg-surface-light px-2 py-1 text-xs font-semibold text-primary">
              {admin.role}
            </p>
          </div>
          <form action={logoutAdminAction} className="pt-2">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-error transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-error/30"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
