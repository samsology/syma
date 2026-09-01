export const courseCategories = ['Data Literacy', 'Data Analytics', 'Data Science', 'Healthcare Analytics'] as const;
export const courseLevels = ['Beginner', 'Intermediate', 'Advanced'] as const;

export type CourseCategory = (typeof courseCategories)[number];
export type CourseLevel = (typeof courseLevels)[number];

export const courseSortOptions = [
  { value: 'recent', label: 'Recently Updated' },
  { value: 'oldest', label: 'Oldest Updated' },
  { value: 'title-asc', label: 'Title A-Z' },
  { value: 'title-desc', label: 'Title Z-A' },
] as const;

export type CourseSort = (typeof courseSortOptions)[number]['value'];

export function slugifyCourseTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
