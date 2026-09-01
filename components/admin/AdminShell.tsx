'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import type { AdminSessionUser } from '@/lib/auth/session';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

const titles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/courses': 'Courses',
  '/admin/resources': 'Resources',
  '/admin/settings': 'Settings',
};

function titleFromPath(pathname: string) {
  const match = Object.entries(titles).find(([path]) => pathname === path || pathname.startsWith(`${path}/`));
  return match?.[1] ?? 'Admin';
}

type AdminShellProps = {
  admin: AdminSessionUser;
  children: React.ReactNode;
};

export function AdminShell({ admin, children }: AdminShellProps) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const title = useMemo(() => titleFromPath(pathname), [pathname]);

  return (
    <div className="min-h-screen bg-neutral-light text-slate-900">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">
        <AdminSidebar />
      </div>

      {isMobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Close admin navigation"
          />
          <div className="relative h-full w-72 max-w-[85vw] bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(false)}
              className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-accent/40"
              aria-label="Close admin navigation"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <AdminSidebar onNavigate={() => setIsMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-72">
        <AdminHeader admin={admin} title={title} onMenuClick={() => setIsMobileNavOpen(true)} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
