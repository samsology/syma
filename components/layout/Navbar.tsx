'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/programs', label: 'Programs' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-[#f8fafc]/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
          <Image
            src="/logo/logo_2.webp"
            alt="Syma Tech Solutions logo"
            width={44}
            height={44}
            priority
            className="h-11 w-11 rounded-lg object-contain"
          />
          <span>
            <span className="block text-lg font-bold leading-none text-slate-950">Syma Tech</span>
            <span className="mt-1 block text-xs font-medium text-primary">Health & Research Intelligence</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-950'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/consultation" className="text-sm font-semibold text-slate-700 hover:text-primary">
            Consultation
          </Link>
          <Link
            href="/enroll"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary"
          >
            Apply
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {[...navLinks, { href: '/consultation', label: 'Consultation' }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'rounded-lg px-4 py-3 text-sm font-semibold',
                  pathname === link.href ? 'bg-primary/5 text-primary' : 'text-slate-700'
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/enroll"
              onClick={() => setIsOpen(false)}
              className="mt-2 inline-flex h-12 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white"
            >
              Apply now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
