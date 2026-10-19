import type { Metadata } from 'next';
import { PortfolioHero } from '@/components/sections/portfolio/PortfolioHero';
import { PortfolioShowcaseBlock } from '@/components/sections/portfolio/PortfolioShowcaseBlock';
import { PortfolioCaseStudies } from '@/components/sections/portfolio/PortfolioCaseStudies';
import { PortfolioGraduates } from '@/components/sections/portfolio/PortfolioGraduates';
import { PortfolioCta } from '@/components/sections/portfolio/PortfolioCta';

export const metadata: Metadata = {
  title: 'Portfolio & Case Studies',
  description:
    'Explore deployed healthcare operations dashboards, biostatistical data pipelines, and graduate capstones engineered for health systems and clinical research partners.',
  alternates: {
    canonical: '/portfolio',
  },
  openGraph: {
    title: 'Evidence-Driven Implementations | Syma Tech Solutions',
    description:
      'Production clinical data pipelines, real-time BI dashboards, and publication-ready models.',
    url: '/portfolio',
  },
};

export default function PortfolioPage() {
  return (
    <div className="bg-white text-slate-900 font-sans min-h-screen">
      <PortfolioHero />
      <PortfolioShowcaseBlock />
      <PortfolioCaseStudies />
      <PortfolioGraduates />
      <PortfolioCta />
    </div>
  );
}
