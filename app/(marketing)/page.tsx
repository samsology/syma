import type { Metadata } from 'next';
import { HeroSection } from '@/components/sections/home/HeroSection';
import { TrustSection } from '@/components/sections/home/TrustSection';
import { ProblemsSection } from '@/components/sections/home/ProblemsSection';
import { SolutionsSection } from '@/components/sections/home/SolutionsSection';
import { ProcessSection } from '@/components/sections/home/ProcessSection';
import { CaseStudiesSection } from '@/components/sections/home/CaseStudiesSection';
import { AcademySection } from '@/components/sections/home/AcademySection';
import { InsightsSection } from '@/components/sections/home/InsightsSection';
import { CtaSection } from '@/components/sections/home/CtaSection';

export const metadata: Metadata = {
  title: {
    absolute: 'Syma Tech Solutions | Health & Research Intelligence Systems',
  },
  description:
    'Syma Tech helps healthcare teams, researchers, and businesses make better use of complex data through analytics, reporting, and practical data systems.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. Dark Immersive Hero with Dual CTAs & Telemetry Preview */}
      <HeroSection />

      {/* 2. Trust & Credibility: Institutional Domains */}
      <TrustSection />

      {/* 3. Problems Syma Tech Solves: Operational Bottlenecks */}
      <ProblemsSection />

      {/* 4. Core Services & Solutions: Verified Offerings */}
      <SolutionsSection />

      {/* 5. How We Work: 4-Stage Engagement Methodology */}
      <ProcessSection />

      {/* 6. Selected Work: Verified Case Studies from Portfolio */}
      <CaseStudiesSection />

      {/* 7. Practical Analytics Academy: Dark Focus Section with Official Catalog */}
      <AcademySection />

      {/* 8. Insights & Thought Leadership: Real Technical Articles */}
      <InsightsSection />

      {/* 9. Final Strategic Conversion Banner: Discuss a Project */}
      <CtaSection />
    </div>
  );
}
