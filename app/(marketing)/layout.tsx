import * as React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { MarketingMotion } from '@/components/layout/MarketingMotion';

/**
 * MarketingLayout
 * Scopes the public marketing navigation and footer strictly to the public routes.
 * Completely isolates marketing layout and styles from protected /admin and /student surfaces.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketingMotion>
      <div className="flex min-h-screen flex-col bg-white selection:bg-brand-cerulean/20 selection:text-brand-navy">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </MarketingMotion>
  );
}
