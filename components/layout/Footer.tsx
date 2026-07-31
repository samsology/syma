'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, Phone } from 'lucide-react';

const services = [
  { href: '/solutions', label: 'Healthcare Analytics' },
  { href: '/solutions', label: 'Business Intelligence' },
  { href: '/solutions', label: 'Research Intelligence' },
  { href: '/solutions', label: 'Data Strategy' },
];

const programs = [
  { href: '/programs', label: 'Healthcare Analytics Program' },
  { href: '/programs', label: 'Python for Data Science' },
  { href: '/programs', label: 'Business Intelligence Track' },
  { href: '/programs', label: 'Institutional Capacity Building' },
];

const companyLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/portfolio', label: 'Portfolio & Cases' },
  { href: '/insights', label: 'Insights & Blog' },
  { href: '/contact', label: 'Contact Support' },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white text-slate-500 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4 md:grid-cols-2">
          {/* Column 1: Info & Socials */}
          <div className="space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 text-lg font-bold text-slate-900">
              <Image
                src="/logo/logo_2.webp"
                alt="Syma Tech Solutions logo"
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg object-contain"
              />
              <span>Syma Tech Solutions</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
              Empowering organizations and research teams across Africa through healthcare analytics, data strategy, and professional education.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.linkedin.com/company/syma-tech/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="https://twitter.com/Symatech"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter Profile"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Services */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Solutions</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {services.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Programs */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Programs</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {programs.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter & Contact */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Newsletter</h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Receive the latest insights in healthcare analytics, bioinformatics, and data tools.
              </p>
              <form className="mt-3 flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter email"
                  className="w-full min-h-[38px] rounded-lg border border-slate-200 px-3 text-xs focus:border-primary focus:outline-none bg-slate-50"
                  required
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-3 text-xs font-bold text-white transition-colors hover:bg-primary/95"
                >
                  Subscribe
                </button>
              </form>
            </div>
            <div className="space-y-2 text-xs border-t border-slate-100 pt-4">
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                Nigeria (Kaduna State / Online)
              </p>
              <a href="mailto:symatechsolutions@gmail.com" className="flex items-center gap-2 hover:text-primary">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                symatechsolutions@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-100 pt-8 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Syma Tech Solutions. All rights reserved.</p>
          <div className="flex gap-4">
            {companyLinks.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-slate-900 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
