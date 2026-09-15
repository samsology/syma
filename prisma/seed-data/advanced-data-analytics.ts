import { CourseStatus } from '@prisma/client';
import { SeedCourse } from './types';

export const advancedDataAnalyticsCourse: SeedCourse = {
  title: 'Advanced Data Analytics',
  slug: 'advanced-data-analytics',
  shortDescription: 'Advanced BI modeling, KPI design, and executive analytics reporting.',
  description:
    'An advanced analytics track aligned with Syma Tech business intelligence outcomes, including KPI design and dashboard architecture.',
  category: 'Data Analytics',
  level: 'Advanced',
  duration: '6 Weeks',
  priceMinor: 7990000, // ₦79,900
  currency: 'NGN',
  sortOrder: 0,
  cta: 'Explore Advanced Analytics',
  status: CourseStatus.DRAFT,
  benefits: [
    'Advanced KPI modeling',
    'Executive dashboard patterns',
    'DAX & semantic modeling',
    'Business intelligence governance',
  ],
  weeks: [
    {
      weekNumber: 1,
      title: 'Advanced KPI Modeling',
      description: 'Translate organizational strategy into measurable performance models.',
      modules: [
        {
          title: 'KPI Framework Design',
          description: 'Define metric logic, ownership, and reporting cadence.',
          lessons: [
            {
              title: 'Designing Executive KPIs',
              slug: 'designing-executive-kpis',
              content:
                'Create KPI definitions that clarify numerator, denominator, grain, and decision owner.',
              duration: 45,
              isPreview: true,
            },
            {
              title: 'Governance for BI Reporting',
              slug: 'governance-for-bi-reporting',
              content:
                'Establish naming, refresh, and validation rules for reliable business intelligence reporting.',
              duration: 40,
            },
          ],
        },
      ],
    },
    {
      weekNumber: 2,
      title: 'Dashboard Architecture',
      description: 'Plan dashboard experiences that support scanning, comparison, and action.',
      modules: [
        {
          title: 'Executive Dashboard Patterns',
          description: 'Use layout, hierarchy, and visual logic for operational dashboards.',
          lessons: [
            {
              title: 'Dashboard Layout and Typography',
              slug: 'dashboard-layout-and-typography',
              content:
                'Design dashboards that keep key metrics readable and preserve context for repeated use.',
              duration: 35,
            },
            {
              title: 'DAX and Model Thinking',
              slug: 'dax-and-model-thinking',
              content:
                'Introduce measure design, relationships, and semantic modeling concepts for advanced BI work.',
              duration: 50,
            },
          ],
        },
      ],
    },
  ],
};
