import type { Metadata } from 'next';
import ProgramsPageContent from './ProgramsPageContent';

export const metadata: Metadata = {
  title: 'Programs & Pricing',
  description:
    'Outcome-focused analytics training for students, professionals, and institutional teams. Compare healthcare analytics, Python for data science, and business intelligence programs.',
};

export default function ProgramsPage() {
  return <ProgramsPageContent />;
}
