import { CourseStatus, Currency, LessonType } from '@prisma/client';

export type SeedResource = {
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
};

export type SeedLesson = {
  title: string;
  slug: string;
  lessonType?: LessonType;
  content: string;
  videoUrl?: string;
  duration?: number;
  isPreview?: boolean;
  resources?: SeedResource[];
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
  status?: CourseStatus;
  weeks: SeedWeek[];
};

