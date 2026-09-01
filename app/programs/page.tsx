import type { Metadata } from 'next';
import ProgramsPageContent from './ProgramsPageContent';
import { db } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Programs & Pricing',
  description:
    'Outcome-focused analytics training for students, professionals, and institutional teams. Compare healthcare analytics, Python for data science, and business intelligence programs.',
};

export default async function ProgramsPage() {
  const courses = await db.course.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      category: true,
      level: true,
      duration: true,
    },
  });

  return <ProgramsPageContent publishedCourses={courses} />;
}
