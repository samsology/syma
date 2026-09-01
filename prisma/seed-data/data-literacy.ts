import { SeedCourse } from './types';

export const dataLiteracyCourse: SeedCourse = {
  title: 'Introduction to Data Literacy',
  slug: 'introduction-to-data-literacy',
  shortDescription: 'Foundational data thinking for evidence-led work.',
  description:
    'A beginner-friendly foundation for reading datasets, asking useful questions, and communicating insights with clarity.',
  category: 'Professional Education',
  level: 'Beginner Friendly',
  duration: '8 Weeks',
  weeks: [
    {
      weekNumber: 1,
      title: 'Data Thinking Foundations',
      description: 'Learn how organizations move from raw data to evidence-led decisions.',
      modules: [
        {
          title: 'What Data Literacy Means',
          description: 'Core vocabulary, workflows, and decision contexts.',
          lessons: [
            {
              title: 'Data, Information, and Insight',
              slug: 'data-information-and-insight',
              content:
                'Distinguish raw observations from organized information and actionable insight in business, health, and research settings.',
              duration: 30,
              isPreview: true,
            },
            {
              title: 'Asking Better Data Questions',
              slug: 'asking-better-data-questions',
              content:
                'Frame measurable questions that connect stakeholder needs with available data and practical next steps.',
              duration: 35,
            },
          ],
        },
      ],
    },
    {
      weekNumber: 2,
      title: 'Reading and Communicating Data',
      description: 'Build confidence interpreting tables, charts, and simple summaries.',
      modules: [
        {
          title: 'From Tables to Stories',
          description: 'Turn simple summaries into clear explanations.',
          lessons: [
            {
              title: 'Understanding Variables and Records',
              slug: 'understanding-variables-and-records',
              content:
                'Identify rows, columns, variables, and record-level meaning in operational and research datasets.',
              duration: 30,
            },
            {
              title: 'Communicating Findings Clearly',
              slug: 'communicating-findings-clearly',
              content:
                'Practice concise data communication that separates evidence, interpretation, and recommendation.',
              duration: 40,
            },
          ],
        },
      ],
    },
  ],
};
