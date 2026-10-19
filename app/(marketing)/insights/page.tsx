import type { Metadata } from 'next';
import { InsightsHero } from '@/components/sections/insights/InsightsHero';
import { InsightsContent } from '@/components/sections/insights/InsightsContent';

export const metadata: Metadata = {
  title: 'Insights & Technical Library',
  description:
    'In-depth technical guides, epidemiological biostatistics tutorials, SQL query optimizations, and healthcare analytics frameworks.',
  alternates: {
    canonical: '/insights',
  },
  openGraph: {
    title: 'Health & Research Intelligence Library | Syma Tech Solutions',
    description:
      'Explore actionable articles, research briefs, and data engineering walkthroughs.',
    url: '/insights',
  },
};

export default function InsightsPage() {
  return (
    <div className="bg-white text-slate-900 font-sans min-h-screen">
      <InsightsHero />
      <InsightsContent />
    </div>
  );
}
