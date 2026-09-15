import { SeedCourse } from './types';

export const dataAnalyticsCourse: SeedCourse = {
  title: 'Introduction to Data Analytics',
  slug: 'introduction-to-data-analytics',
  shortDescription: 'Learn how to turn raw data into meaningful insights and solve real-world problems.',
  description:
    'Learn how to turn raw data into meaningful insights and solve real-world problems.',
  category: 'Data Analytics',
  level: 'Beginner',
  duration: '8 Weeks',
  priceMinor: 5990000, // ₦59,900
  currency: 'NGN',
  sortOrder: 2,
  cta: 'Become a Data Analyst',
  benefits: [
    'Data analysis fundamentals',
    'Excel, SQL & Data cleaning',
    'Data visualization',
    'Insights & Storytelling',
    'Hands-on analytics project',
    'Industry case studies',
    'Certificate of completion',
    'Community + Instructor support',
  ],
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
      description: 'Build the query and visualization habits used in modern analytics workflows.',
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
