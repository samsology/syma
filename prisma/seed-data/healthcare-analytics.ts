import { SeedCourse } from './types';

export const healthcareAnalyticsCourse: SeedCourse = {
  title: 'Healthcare Analytics',
  slug: 'healthcare-analytics',
  shortDescription:
    'Apply data analytics to healthcare and solve real-world problems in the health industry.',
  description:
    'Apply data analytics to healthcare and solve real-world problems in the health industry.',
  category: 'Healthcare Analytics',
  level: 'Specialist',
  duration: '8 Weeks',
  priceMinor: 6990, // $69.90
  currency: 'USD',
  sortOrder: 4,
  cta: 'Specialize in Healthcare',
  benefits: [
    'Healthcare data fundamentals',
    'Patient & Operational analytics',
    'Healthcare dashboards',
    'Predictive analytics in health',
    'Capstone healthcare project',
    'Real healthcare case studies',
    'Certificate of completion',
    'Expert + Industry support',
  ],
  weeks: [
    {
      weekNumber: 1,
      title: 'Healthcare Data Foundations & Reporting',
      description:
        'Understand clinical records, diagnostic classifications, and hospital operations.',
      modules: [
        {
          title: 'Healthcare Data Ecosystems',
          description: 'EHR systems, clinical indicators, and hospital workflow data.',
          lessons: [
            {
              title: 'Clinical Data Structures & Standards',
              slug: 'clinical-data-structures-and-standards',
              content:
                'Explore electronic health records (EHR), patient admission logs, diagnostic codes, and healthcare metrics.',
              duration: 45,
              isPreview: true,
            },
            {
              title: 'Patient Flow & Hospital Operations Analytics',
              slug: 'patient-flow-hospital-operations-analytics',
              content:
                'Analyze hospital bed occupancy, average length of stay (ALOS), and outpatient clinic wait times.',
              duration: 50,
            },
          ],
        },
      ],
    },
    {
      weekNumber: 2,
      title: 'Clinical Dashboards & Health Outcomes',
      description: 'Design clinical decision support dashboards and epidemiological reports.',
      modules: [
        {
          title: 'Healthcare KPI Dashboards',
          description: 'Build operational and clinical dashboards with Power BI and SQL.',
          lessons: [
            {
              title: 'Clinical KPI Mapping & Visualization',
              slug: 'clinical-kpi-mapping-visualization',
              content:
                'Design executive dashboards that track mortality rates, readmissions, and treatment efficacy.',
              duration: 45,
            },
            {
              title: 'Healthcare Capstone Case Study',
              slug: 'healthcare-capstone-case-study',
              content:
                'Deliver a complete hospital admissions and clinical outcomes dashboard using real-world public health data.',
              duration: 60,
            },
          ],
        },
      ],
    },
  ],
};
