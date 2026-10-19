import { Metadata } from 'next';
import { SolutionsHero } from '@/components/sections/solutions/SolutionsHero';
import { SolutionsChallenges } from '@/components/sections/solutions/SolutionsChallenges';
import { SolutionsPillars } from '@/components/sections/solutions/SolutionsPillars';
import { SolutionsProcess } from '@/components/sections/solutions/SolutionsProcess';
import { SolutionsSecurity } from '@/components/sections/solutions/SolutionsSecurity';
import { SolutionsCta } from '@/components/sections/solutions/SolutionsCta';

export const metadata: Metadata = {
  title: 'Solutions & Consulting',
  description:
    'Production-grade health analytics, clinical BI dashboards, biostatistical research intelligence, and bespoke digital health tooling for hospital systems, clinical trials, and life sciences.',
  alternates: {
    canonical: '/solutions',
  },
  openGraph: {
    title: 'Health & Research Intelligence Solutions | Syma Tech Solutions',
    description:
      'Turn fragmented clinical data and complex research registries into compliant, audit-ready data pipelines and decision-support systems.',
    url: '/solutions',
  },
};

export default function SolutionsPage() {
  return (
    <div className="bg-white text-slate-900 font-sans min-h-screen">
      <SolutionsHero />
      <SolutionsChallenges />
      <SolutionsPillars />
      <SolutionsProcess />
      <SolutionsSecurity />
      <SolutionsCta />
    </div>
  );
}
