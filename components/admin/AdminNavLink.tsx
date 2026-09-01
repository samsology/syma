'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type AdminNavLinkProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  onNavigate?: () => void;
};

export function AdminNavLink({ href, label, icon: Icon, onNavigate }: AdminNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40',
        isActive ? 'bg-primary text-white shadow-primary-glow' : 'text-slate-600 hover:bg-surface-light hover:text-primary'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}
