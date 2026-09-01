import { advancedDataAnalyticsCourse } from './advanced-data-analytics';
import { dataAnalyticsCourse } from './data-analytics';
import { dataLiteracyCourse } from './data-literacy';
import { dataScienceCourse } from './data-science';
import { SeedCourse } from './types';

export const courses: SeedCourse[] = [
  dataLiteracyCourse,
  dataAnalyticsCourse,
  advancedDataAnalyticsCourse,
  dataScienceCourse,
];
