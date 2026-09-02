import { Currency, LessonType } from '@prisma/client';

export type SeedLesson = {
  title: string;
  slug: string;
  lessonType?: LessonType;
  content: string;
  videoUrl?: string;
  duration?: number;
  isPreview?: boolean;
};

export type SeedModule = {
  title: string;
  description: string;
  lessons: SeedLesson[];
};

export type SeedWeek = {
  weekNumber: number;
  title: string;
  description: string;
  modules: SeedModule[];
};

export type SeedCourse = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  priceMinor: number;
  currency?: Currency;
  benefits: string[];
  cta: string;
  sortOrder?: number;
  thumbnailUrl?: string;
  weeks: SeedWeek[];
};
