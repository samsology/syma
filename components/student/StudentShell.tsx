import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Receipt,
  Shield,
  User,
  ExternalLink,
} from 'lucide-react';
import { logoutStudentAction } from '@/app/student/actions';
import type { StudentSessionUser } from '@/lib/auth/student-session';

const links = [
  { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/programs', label: 'Programs', icon: BookOpen },
  { href: '/student/orders', label: 'Orders', icon: Receipt },
  { href: '/student/profile', label: 'Profile', icon: User },
  { href: '/student/profile/security', label: 'Security', icon: Shield },
];

export function StudentShell({
  student,
  children,
}: {
  student: StudentSessionUser;
  children: React.ReactNode;
}) {
  const initials = `${student.firstName?.[0] || 'S'}${student.lastName?.[0] || 'T'}`.toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          {/* Logo & Portal Identity */}
          <div className="flex items-center justify-between">
            <Link
              href="/student"
              className="flex items-center gap-3 rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cerulean"
            >
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
                <Image
                  src="/logo/logo.png"
                  alt="Syma Tech"
                  width={36}
                  height={36}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <span className="block text-sm font-extrabold tracking-tight text-slate-950 font-heading">
                  SYMA TECH
                </span>
                <span className="block text-[10px] font-black uppercase tracking-wider text-brand-cerulean">
                  Student Learning Portal
                </span>
              </div>
            </Link>

            {/* Mobile initials chip */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy text-xs font-black text-white shadow-xs">
                {initials}
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 lg:border-t-0 lg:pt-0">
            <nav className="flex flex-wrap items-center gap-1" aria-label="Student navigation">
              {links.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cerulean"
                >
                  <link.icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-3 pl-2">
              <div className="hidden lg:flex items-center gap-2.5 border-l border-slate-200 pl-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy text-xs font-black text-white shadow-xs">
                  {initials}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[140px]">
                    {student.email}
                  </p>
                </div>
              </div>

              <form action={logoutStudentAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-red-50 hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
                  title="Sign out of student account"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
