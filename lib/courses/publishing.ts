import { db } from '@/lib/db';
import { updateCourseSchema } from '@/lib/validation/course';

export type PublishingValidationResult = {
  valid: boolean;
  errors: string[];
};

/**
 * Validates whether a course meets all curriculum and metadata criteria to be published.
 * Minimum curriculum requirement:
 * Course
 *  └── ≥ 1 Week
 *       └── ≥ 1 Module
 *            └── ≥ 1 Lesson (with valid content)
 */
export async function validateCourseForPublishing(courseId: string): Promise<PublishingValidationResult> {
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      weeks: {
        orderBy: [{ sortOrder: 'asc' }, { weekNumber: 'asc' }],
        include: {
          modules: {
            orderBy: { sortOrder: 'asc' },
            include: {
              lessons: {
                orderBy: { sortOrder: 'asc' },
                include: { resources: true },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    return { valid: false, errors: ['Course not found.'] };
  }

  const errors: string[] = [];

  // 1. Validate core course metadata using schema
  const metadataValidation = updateCourseSchema.safeParse(course);
  if (!metadataValidation.success) {
    const fieldErrors = metadataValidation.error.flatten().fieldErrors;
    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (messages && messages.length > 0) {
        errors.push(`Course ${field}: ${messages[0]}`);
      }
    }
  }

  // 2. Pricing sanity check
  if (course.priceMinor < 0) {
    errors.push('Course price cannot be negative.');
  }

  // 3. Minimum curriculum hierarchy checks
  if (course.weeks.length === 0) {
    errors.push('Course must have at least one week.');
    return { valid: false, errors };
  }

  let totalModules = 0;
  let totalLessons = 0;

  for (const week of course.weeks) {
    if (week.modules.length === 0) {
      errors.push(`Week ${week.weekNumber} ("${week.title}") has no modules. Add at least one module.`);
    }

    for (const courseModule of week.modules) {
      totalModules++;

      if (courseModule.lessons.length === 0) {
        errors.push(`Module "${courseModule.title}" in Week ${week.weekNumber} has no lessons. Add at least one lesson.`);
      }

      for (const lesson of courseModule.lessons) {
        totalLessons++;

        // Validate content according to lesson type
        const trimmedContent = lesson.content?.trim() ?? '';
        if (lesson.lessonType === 'TEXT' && trimmedContent.length === 0) {
          errors.push(`Lesson "${lesson.title}" (Text) requires written instructional content.`);
        } else if (lesson.lessonType === 'VIDEO') {
          const hasVideoUrl = Boolean(lesson.videoUrl?.trim());
          if (!hasVideoUrl && trimmedContent.length === 0) {
            errors.push(`Lesson "${lesson.title}" (Video) requires a video URL or lesson content.`);
          }
        } else if (lesson.lessonType === 'ASSIGNMENT' && trimmedContent.length === 0) {
          errors.push(`Lesson "${lesson.title}" (Assignment) requires prompt or assignment instructions in content.`);
        }
      }
    }
  }

  if (totalModules === 0) {
    errors.push('Course must contain at least one module.');
  }

  if (totalLessons === 0) {
    errors.push('Course must contain at least one lesson.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
