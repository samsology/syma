import Link from 'next/link';
import { BookOpen, LayoutDashboard, LogOut, Receipt, Shield, User } from 'lucide-react';
import { logoutStudentAction } from '@/app/student/actions';
import type { StudentSessionUser } from '@/lib/auth/student-session';

const links = [
  { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student', label: 'My Courses', icon: BookOpen },
  { href: '/student/orders', label: 'Orders', icon: Receipt },
  { href: '/student/profile', label: 'Profile', icon: User },
  { href: '/student/profile/security', label: 'Security', icon: Shield },
];

export function StudentShell({ student, children }: { student: StudentSessionUser; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link href="/student" className="text-sm font-black uppercase tracking-wide text-primary">
              Syma Tech Student
            </Link>
            <p className="text-xs font-semibold text-slate-500">{student.firstName} {student.lastName}</p>
          </div>
          <nav className="flex flex-wrap items-center gap-2" aria-label="Student navigation">
            {links.map((link) => (
              <Link key={link.href + link.label} href={link.href} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">
                <link.icon className="h-4 w-4" aria-hidden="true" />
                {link.label}
              </Link>
            ))}
            <form action={logoutStudentAction}>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-error hover:bg-red-50">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
