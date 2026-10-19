'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { springDrawer } from '@/lib/motion';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/solutions', label: 'Solutions' },
  { href: '/programs', label: 'Programs' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/insights', label: 'Insights' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Determine if the navbar is currently over the dark homepage hero
  const isDarkHero = pathname === '/' && !scrolled;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-sm text-slate-900'
          : isDarkHero
          ? 'border-b border-white/10 bg-marketing-dark-bg/85 backdrop-blur-md text-white'
          : 'border-b border-transparent bg-transparent text-slate-900'
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cerulean rounded-lg"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-white/10 p-1 shadow-sm">
            <Image
              src="/logo/logo.png"
              alt="Syma Tech Solutions logo"
              width={40}
              height={40}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <span className="flex flex-col">
            <span
              className={cn(
                'text-base font-extrabold tracking-tight leading-none font-heading',
                isDarkHero ? 'text-white' : 'text-slate-950'
              )}
            >
              SYMA TECH
            </span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-brand-cerulean">
              INTELLIGENCE
            </span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cerulean',
                  isDarkHero
                    ? isActive
                      ? 'bg-white/15 text-white font-bold shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                    : isActive
                    ? 'bg-slate-100 text-slate-950 font-bold'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/student/login"
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cerulean',
              isDarkHero
                ? 'text-slate-300 hover:text-white hover:bg-white/10'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            )}
          >
            Student Login
          </Link>
          <Link href="/consultation">
            <Button
              variant="cerulean"
              size="sm"
              className="rounded-full shadow-sm hover:shadow-cerulean-glow"
            >
              Discuss a Project
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            'inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-colors lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cerulean',
            isDarkHero
              ? 'border-white/15 bg-white/10 text-white hover:bg-white/20'
              : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
          )}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={springDrawer}
            className="border-t border-slate-200/80 bg-white px-4 py-6 shadow-2xl lg:hidden overflow-hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'rounded-xl px-4 py-3 text-base font-semibold transition-colors flex items-center justify-between',
                      isActive
                        ? 'bg-brand-cerulean/10 text-brand-cerulean font-bold'
                        : 'text-slate-800 hover:bg-slate-100'
                    )}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-cerulean" />
                    )}
                  </Link>
                );
              })}

              <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-5">
                <Link
                  href="/student/login"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
                >
                  Student Portal Login
                </Link>
                <Link
                  href="/consultation"
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  <Button
                    variant="cerulean"
                    size="lg"
                    className="w-full rounded-xl text-center"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Discuss a Project
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
