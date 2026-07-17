import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, Phone } from 'lucide-react';

const footerLinks = [
  { href: '/solutions', label: 'Solutions' },
  { href: '/programs', label: 'Programs' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/about', label: 'About' },
  { href: '/consultation', label: 'Consultation' },
  { href: '/contact', label: 'Contact' },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 text-xl font-bold text-slate-950">
              <Image
                src="/logo/logo_2.png"
                alt="Syma Tech Solutions logo"
                width={46}
                height={46}
                className="h-11 w-11 rounded-lg object-contain"
              />
              <span>Syma Tech Solutions</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
              Transforming Healthcare and Business Through Data Intelligence.
            </p>
            <p className="mt-4 inline-flex rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              Health analytics, research intelligence, BI, and professional education.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-950">Explore</h2>
            <div className="mt-4 grid gap-3 text-sm">
              {footerLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-primary">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-950">Contact</h2>
            <div className="mt-4 space-y-3 text-sm">
              <p className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Kaduna State, Nigeria
              </p>
              <a href="tel:+2347026954912" className="flex gap-3 hover:text-primary">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                +234 702 695 4912
              </a>
              <a href="mailto:symatechsolutions@gmail.com" className="flex gap-3 hover:text-primary">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                symatechsolutions@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Syma Tech Solutions. All rights reserved.</p>
          <p>Evidence, intelligence, and technology for stronger decisions.</p>
        </div>
      </div>
    </footer>
  );
}
