import { formatMoney } from '@/lib/payments/rules';

export type OfficialCourse = {
  number: string;
  order: number;
  title: string;
  slug: string;
  duration: string;
  price: string;
  priceMinor: number;
  currency: 'NGN' | 'USD';
  description: string;
  shortDescription: string;
  category: 'Data Literacy' | 'Data Analytics' | 'Data Science' | 'Healthcare Analytics';
  level: 'Foundation' | 'Beginner' | 'Intermediate' | 'Specialist';
  badge: string;
  cta: string;
  support: string;
  benefits: string[];
  iconName: 'BookOpen' | 'BarChart3' | 'Code2' | 'Activity';
};

export const OFFICIAL_COURSES: OfficialCourse[] = [
  {
    number: '01',
    order: 1,
    title: 'Introduction to Data Literacy',
    slug: 'introduction-to-data-literacy',
    duration: '8 Weeks',
    price: '₦19,900',
    priceMinor: 1990000,
    currency: 'NGN',
    description:
      'Build the confidence to understand, interpret and communicate data in everyday decisions.',
    shortDescription:
      'Build the confidence to understand, interpret and communicate data in everyday decisions.',
    category: 'Data Literacy',
    level: 'Foundation',
    badge: 'Foundational Track',
    cta: 'Start Your Data Journey',
    support: 'Instructor guidance',
    iconName: 'BookOpen',
    benefits: [
      'Beginner-friendly curriculum',
      'Understand & interpret data',
      'Practical exercises',
      'Real-world examples',
      'Learning materials',
      'Certificate of completion',
      'Community access',
      'Instructor guidance',
    ],
  },
  {
    number: '02',
    order: 2,
    title: 'Introduction to Data Analytics',
    slug: 'introduction-to-data-analytics',
    duration: '8 Weeks',
    price: '₦39,900',
    priceMinor: 3990000,
    currency: 'NGN',
    description:
      'Learn how to turn raw data into meaningful insights and solve real-world problems.',
    shortDescription:
      'Learn how to turn raw data into meaningful insights and solve real-world problems.',
    category: 'Data Analytics',
    level: 'Beginner',
    badge: 'Core Analytics Track',
    cta: 'Become a Data Analyst',
    support: 'Community + Instructor support',
    iconName: 'BarChart3',
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
  },
  {
    number: '03',
    order: 3,
    title: 'Introduction to Data Science',
    slug: 'introduction-to-data-science',
    duration: '8 Weeks',
    price: '₦49,900',
    priceMinor: 4990000,
    currency: 'NGN',
    description:
      'Build the foundations of data science, machine learning and predictive analytics using Python.',
    shortDescription:
      'Build the foundations of data science, machine learning and predictive analytics using Python.',
    category: 'Data Science',
    level: 'Intermediate',
    badge: 'Machine Learning Track',
    cta: 'Build Data Science Skills',
    support: 'Community + mentor support',
    iconName: 'Code2',
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
  },
  {
    number: '04',
    order: 4,
    title: 'Healthcare Analytics',
    slug: 'healthcare-analytics',
    duration: '8 Weeks',
    price: '₦69,900',
    priceMinor: 6990000,
    currency: 'NGN',
    description:
      'Apply data analytics to healthcare and solve real-world problems in the health industry.',
    shortDescription:
      'Apply data analytics to healthcare and solve real-world problems in the health industry.',
    category: 'Healthcare Analytics',
    level: 'Specialist',
    badge: 'Specialist Pathway',
    cta: 'Specialize in Healthcare',
    support: 'Expert + Industry support',
    iconName: 'Activity',
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
  },
];

export const GLOBAL_COURSE_INCLUSIONS = [
  'Live & Recorded Lesson',
  'Course Materials & Resources',
  'Community Access',
  'Certificate of Completion',
  'Career Guidance & Support',
];

export const VALUE_PROPOSITION = {
  mainHeadline: 'LEARN. PRACTICE. BUILD. APPLY.',
  supportingHeadline:
    'Practical-based data programs built to take you from beginners to specialist.',
};

export const COURSE_PROGRESSION = [
  {
    step: '01',
    title: 'Data Literacy',
    slug: 'introduction-to-data-literacy',
    subtitle:
      'Build confidence reading, interpreting, and communicating data in everyday decisions.',
  },
  {
    step: '02',
    title: 'Data Analytics',
    slug: 'introduction-to-data-analytics',
    subtitle: 'Master SQL, data cleaning, visualization, and insight storytelling.',
  },
  {
    step: '03',
    title: 'Data Science',
    slug: 'introduction-to-data-science',
    subtitle: 'Python foundations, EDA, statistics, and machine learning models.',
  },
  {
    step: '04',
    title: 'Healthcare Analytics',
    slug: 'healthcare-analytics',
    subtitle:
      'Specialist pathway for clinical metrics, hospital operations, and healthcare dashboards.',
  },
];

export function getCourseBySlug(slug: string): OfficialCourse | undefined {
  return OFFICIAL_COURSES.find((course) => course.slug === slug);
}

export function formatCoursePrice(
  priceMinor: number,
  currency: 'NGN' | 'USD' | string = 'NGN',
  options?: { showDecimals?: boolean }
): string {
  if (currency === 'USD') {
    return options?.showDecimals === false && priceMinor % 100 === 0
      ? `$${(priceMinor / 100).toLocaleString('en-US')}`
      : `$${(priceMinor / 100).toFixed(2)}`;
  }
  if (currency === 'NGN') {
    return formatMoney(priceMinor, 'NGN', options);
  }
  throw new Error('Unsupported launch catalogue currency.');
}
