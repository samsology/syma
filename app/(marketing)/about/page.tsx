import type { Metadata } from 'next';
import { AboutHero } from '@/components/sections/about/AboutHero';
import { AboutMissionVision } from '@/components/sections/about/AboutMissionVision';
import { AboutLeadership } from '@/components/sections/about/AboutLeadership';
import { AboutValues } from '@/components/sections/about/AboutValues';
import { AboutTimeline } from '@/components/sections/about/AboutTimeline';
import { AboutCta } from '@/components/sections/about/AboutCta';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Grounded in science, engineered for action. Learn about Syma Tech Solutions, our founding biostatisticians and software architects, our mission, values, and journey in healthcare data intelligence.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Syma Tech Solutions | Health & Research Intelligence',
    description:
      'Grounded in science, engineered for action. Bridging healthcare analytics, research intelligence, and professional data education.',
    url: '/about',
  },
};

export default function AboutPage() {
  return (
    <div className="bg-white text-slate-900 font-sans min-h-screen">
      <AboutHero />
      <AboutMissionVision />
      <AboutLeadership />
      <AboutValues />
      <AboutTimeline />
      <AboutCta />
    </div>
  );
}
