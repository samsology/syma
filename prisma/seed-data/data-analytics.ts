import { SeedCourse } from './types';

export const dataAnalyticsCourse: SeedCourse = {
  title: 'Introduction to Data Analytics',
  slug: 'introduction-to-data-analytics',
  shortDescription: 'Practical analytics foundations with SQL, reporting, and dashboards.',
  description:
    'A hands-on introduction to structured querying, clinical-style reporting, and practical dashboard thinking.',
  category: 'Healthcare Analytics',
  level: 'Beginner Friendly',
  duration: '8 Weeks',
  weeks: [
    {
      weekNumber: 1,
      title: 'Analytics Workflow Foundations',
      description: 'Understand how analysts scope questions, inspect data, and report outcomes.',
      modules: [
        {
          title: 'Analytics Project Setup',
          description: 'Move from problem statement to dataset requirements.',
          lessons: [
            {
              title: 'Defining Metrics and Outcomes',
              slug: 'defining-metrics-and-outcomes',
              content:
                'Map business or clinical questions to measurable indicators, dimensions, and reporting outputs.',
              duration: 35,
              isPreview: true,
            },
            {
              title: 'Data Quality Checks',
              slug: 'data-quality-checks',
              content:
                'Inspect missing values, duplicate records, inconsistent labels, and other issues that affect analysis quality.',
              duration: 45,
            },
          ],
        },
      ],
    },
    {
      weekNumber: 2,
      title: 'SQL and Dashboard Basics',
      description: 'Build the query and visualization habits used in the existing Syma analytics tracks.',
      modules: [
        {
          title: 'Structured Reporting',
          description: 'Use query logic and dashboard planning to summarize performance.',
          lessons: [
            {
              title: 'Introductory SQL Query Logic',
              slug: 'introductory-sql-query-logic',
              content:
                'Learn select, filter, group, and join concepts used in structured database reporting.',
              duration: 45,
            },
            {
              title: 'Dashboard Storyboarding',
              slug: 'dashboard-storyboarding',
              content:
                'Plan a simple reporting dashboard around KPIs, filters, and a clear insight narrative.',
              duration: 40,
            },
          ],
        },
      ],
    },
  ],
};
