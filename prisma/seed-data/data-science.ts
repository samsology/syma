import { SeedCourse } from './types';

export const dataScienceCourse: SeedCourse = {
  title: 'Introduction to Data Science',
  slug: 'introduction-to-data-science',
  shortDescription:
    'Build the foundations of data science, machine learning and predictive analytics using Python.',
  description:
    'Build the foundations of data science, machine learning and predictive analytics using Python.',
  category: 'Data Science',
  level: 'Intermediate',
  duration: '8 Weeks',
  priceMinor: 6900000, // ₦69,000
  currency: 'NGN',
  sortOrder: 3,
  cta: 'Build Data Science Skills',
  benefits: [
    'Python programming basics',
    'Statistics & probability',
    'Data wrangling & EDA',
    'Machine learning foundations',
    'Model building projects',
    'Real-world datasets',
    'Certificate of completion',
    'Community + mentor support',
  ],
  weeks: [
    {
      weekNumber: 1,
      title: 'Python Data Workflow',
      description: 'Build practical habits for loading, cleaning, and inspecting datasets.',
      modules: [
        {
          title: 'Pandas Foundations',
          description: 'Use Python dataframes for repeatable analysis work.',
          lessons: [
            {
              title: 'Loading and Inspecting Data',
              slug: 'loading-and-inspecting-data',
              content:
                'Use Python and Pandas to load datasets, inspect structure, and identify early quality issues.',
              duration: 45,
              isPreview: true,
            },
            {
              title: 'Cleaning Research Datasets',
              slug: 'cleaning-research-datasets',
              content:
                'Apply practical cleaning steps for missing values, labels, data types, and derived columns.',
              duration: 50,
            },
          ],
        },
      ],
    },
    {
      weekNumber: 2,
      title: 'Exploration and Automation',
      description: 'Use scripts and notebooks to automate recurring data analysis tasks.',
      modules: [
        {
          title: 'Research Pipeline Basics',
          description: 'Move from cleaned data to reproducible analysis outputs.',
          lessons: [
            {
              title: 'Exploratory Data Analysis',
              slug: 'exploratory-data-analysis',
              content:
                'Summarize distributions, relationships, and anomalies before formal modeling.',
              duration: 45,
            },
            {
              title: 'API Query Automation',
              slug: 'api-query-automation',
              content:
                'Introduce repeatable scripts for collecting or refreshing data from API-style sources.',
              duration: 40,
            },
          ],
        },
      ],
    },
  ],
};
