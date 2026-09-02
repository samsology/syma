import { BookOpen, ClipboardList, CreditCard, FolderOpen, LayoutDashboard, LogOut, Receipt, Settings, Users } from 'lucide-react';
import { logoutAdminAction } from '@/app/admin/actions';
import { AdminNavLink } from './AdminNavLink';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/enrollments', label: 'Enrollments', icon: ClipboardList },
  { href: '/admin/orders', label: 'Orders', icon: Receipt },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/resources', label: 'Resources', icon: FolderOpen },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

type AdminSidebarProps = {
  onNavigate?: () => void;
};

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-sm font-black uppercase tracking-wide text-primary">Syma Tech</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">Admin CMS</p>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-5" aria-label="Admin navigation">
        {navItems.map((item) => (
          <AdminNavLink key={item.href} {...item} onNavigate={onNavigate} />
        ))}
      </nav>
      <form action={logoutAdminAction} className="border-t border-slate-200 p-4">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-error transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-error/30"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
      </form>
    </aside>
  );
}
