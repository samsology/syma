import { PrismaClient, CourseStatus, LessonType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { courses } from './seed-data/courses';

const dbUrl = process.env.DATABASE_URL;
const prisma = new PrismaClient(
  dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined
);

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

function createSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.info('Skipping admin seed: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are not both set.');
    return null;
  }

  if (password.length < 12) {
    console.warn('Skipping admin seed: SEED_ADMIN_PASSWORD must be at least 12 characters.');
    return null;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  return prisma.admin.upsert({
    where: { email },
    update: {
      passwordHash,
      isActive: true,
    },
    create: {
      name: process.env.SEED_ADMIN_NAME?.trim() || 'Syma Tech Admin',
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });
}

async function seedCourses(instructorId?: string) {
  // Narrow production to single course (Introduction to Data Literacy); add more slugs to scale later
  const targetCourseSlugs = ['introduction-to-data-literacy'];
  const activeCourses = courses.filter((c) => targetCourseSlugs.includes(c.slug));

  await prisma.course.updateMany({
    where: { slug: { notIn: targetCourseSlugs } },
    data: { status: CourseStatus.ARCHIVED },
  });

  for (const [courseIndex, course] of activeCourses.entries()) {
    const courseStatus = course.status ?? CourseStatus.PUBLISHED;
    const upsertedCourse = await prisma.course.upsert({
      where: { slug: course.slug },
      update: {
        title: course.title,
        shortDescription: course.shortDescription,
        description: course.description,
        category: course.category,
        level: course.level,
        duration: course.duration,
        priceMinor: course.priceMinor,
        currency: course.currency ?? 'USD',
        benefits: course.benefits,
        cta: course.cta,
        sortOrder: course.sortOrder ?? courseIndex + 1,
        thumbnailUrl: course.thumbnailUrl,
        instructorId,
        status: courseStatus,
        publishedAt: courseStatus === CourseStatus.PUBLISHED ? new Date() : null,
      },
      create: {
        title: course.title,
        slug: course.slug,
        shortDescription: course.shortDescription,
        description: course.description,
        category: course.category,
        level: course.level,
        duration: course.duration,
        priceMinor: course.priceMinor,
        currency: course.currency ?? 'USD',
        benefits: course.benefits,
        cta: course.cta,
        sortOrder: course.sortOrder ?? courseIndex + 1,
        thumbnailUrl: course.thumbnailUrl,
        instructorId,
        status: courseStatus,
        publishedAt: courseStatus === CourseStatus.PUBLISHED ? new Date() : null,
      },
    });

    // Clean up existing curriculum weeks to ensure exact alignment with seed data
    await prisma.courseWeek.deleteMany({
      where: { courseId: upsertedCourse.id },
    });

    for (const [weekIndex, week] of course.weeks.entries()) {
      const upsertedWeek = await prisma.courseWeek.upsert({
        where: {
          courseId_weekNumber: {
            courseId: upsertedCourse.id,
            weekNumber: week.weekNumber,
          },
        },
        update: {
          title: week.title,
          description: week.description,
          sortOrder: weekIndex + 1,
        },
        create: {
          courseId: upsertedCourse.id,
          weekNumber: week.weekNumber,
          title: week.title,
          description: week.description,
          sortOrder: weekIndex + 1,
        },
      });

      for (const [moduleIndex, moduleData] of week.modules.entries()) {
        let existingModule = await prisma.courseModule.findFirst({
          where: {
            weekId: upsertedWeek.id,
            OR: [
              { sortOrder: moduleIndex + 1 },
              { title: moduleData.title },
            ],
          },
        });

        if (existingModule) {
          existingModule = await prisma.courseModule.update({
            where: { id: existingModule.id },
            data: {
              title: moduleData.title,
              description: moduleData.description,
              sortOrder: moduleIndex + 1,
            },
          });
        } else {
          existingModule = await prisma.courseModule.create({
            data: {
              weekId: upsertedWeek.id,
              title: moduleData.title,
              description: moduleData.description,
              sortOrder: moduleIndex + 1,
            },
          });
        }

        for (const [lessonIndex, lesson] of moduleData.lessons.entries()) {
          const upsertedLesson = await prisma.lesson.upsert({
            where: {
              moduleId_slug: {
                moduleId: existingModule.id,
                slug: lesson.slug,
              },
            },
            update: {
              title: lesson.title,
              lessonType: lesson.lessonType ?? LessonType.TEXT,
              content: lesson.content,
              videoUrl: lesson.videoUrl ?? null,
              duration: lesson.duration ?? 30,
              isPreview: lesson.isPreview ?? false,
              status: courseStatus,
              sortOrder: lessonIndex + 1,
            },
            create: {
              moduleId: existingModule.id,
              title: lesson.title,
              slug: lesson.slug,
              lessonType: lesson.lessonType ?? LessonType.TEXT,
              content: lesson.content,
              videoUrl: lesson.videoUrl ?? null,
              duration: lesson.duration ?? 30,
              isPreview: lesson.isPreview ?? false,
              status: courseStatus,
              sortOrder: lessonIndex + 1,
            },
          });

          if (lesson.resources && lesson.resources.length > 0) {
            for (const res of lesson.resources) {
              const existingRes = await prisma.lessonResource.findFirst({
                where: {
                  lessonId: upsertedLesson.id,
                  name: res.name,
                },
              });

              if (existingRes) {
                await prisma.lessonResource.update({
                  where: { id: existingRes.id },
                  data: {
                    fileUrl: res.fileUrl,
                    fileType: res.fileType,
                    fileSize: res.fileSize ?? null,
                  },
                });
              } else {
                await prisma.lessonResource.create({
                  data: {
                    lessonId: upsertedLesson.id,
                    name: res.name,
                    fileUrl: res.fileUrl,
                    fileType: res.fileType,
                    fileSize: res.fileSize ?? null,
                  },
                });
              }
            }
          }
        }
      }
    }
  }
}

async function seedStudentsAndEnrollments() {
  const passwordHash = await bcrypt.hash('studentpassword123', 12);

  const student = await prisma.student.upsert({
    where: { email: 'maya.student@example.test' },
    update: {
      firstName: 'Maya',
      lastName: 'Okafor',
      phone: '+234 800 000 0101',
      passwordHash,
      status: 'ACTIVE',
      lastLoginAt: new Date(),
    },
    create: {
      firstName: 'Maya',
      lastName: 'Okafor',
      email: 'maya.student@example.test',
      phone: '+234 800 000 0101',
      passwordHash,
      status: 'ACTIVE',
      lastLoginAt: new Date(),
    },
  });

  // Complete application record
  const existingApp = await prisma.studentApplication.findFirst({
    where: { email: 'maya.student@example.test' },
  });

  if (existingApp) {
    await prisma.studentApplication.update({
      where: { id: existingApp.id },
      data: {
        fullName: 'Maya Okafor',
        phone: '+234 800 000 0101',
        program: 'Introduction to Data Literacy',
        experience: 'Beginner',
        motivation: 'Building foundational data literacy for career development',
        status: 'REGISTERED',
        studentId: student.id,
        registrationTokenUsedAt: new Date(),
      },
    });
  } else {
    await prisma.studentApplication.create({
      data: {
        fullName: 'Maya Okafor',
        email: 'maya.student@example.test',
        phone: '+234 800 000 0101',
        program: 'Introduction to Data Literacy',
        experience: 'Beginner',
        motivation: 'Building foundational data literacy for career development',
        status: 'REGISTERED',
        studentId: student.id,
        registrationTokenUsedAt: new Date(),
      },
    });
  }

  // Active student session for login
  const token = createSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.studentSession.deleteMany({
    where: { studentId: student.id },
  });

  await prisma.studentSession.create({
    data: {
      studentId: student.id,
      tokenHash,
      expiresAt,
    },
  });

  return student;
}

async function seedOrdersAndPayments(student?: { id: string }) {
  const course = await prisma.course.findFirst({
    where: { slug: 'introduction-to-data-literacy' },
  });
  const maya = student ?? (await prisma.student.findUnique({ where: { email: 'maya.student@example.test' } }));

  if (!course || !maya) return;

  const orderNumber = 'SYM-DL101-MAYA';
  const order = await prisma.order.upsert({
    where: { orderNumber },
    update: {
      studentId: maya.id,
      courseId: course.id,
      amountMinor: course.priceMinor,
      currency: course.currency,
      status: 'PAID',
      paidAt: new Date(),
    },
    create: {
      orderNumber,
      studentId: maya.id,
      courseId: course.id,
      amountMinor: course.priceMinor,
      currency: course.currency,
      status: 'PAID',
      paidAt: new Date(),
    },
  });

  await prisma.payment.upsert({
    where: {
      provider_providerReference: {
        provider: 'PAYSTACK',
        providerReference: 'PAYSTACK-DL101-MAYA',
      },
    },
    update: {
      orderId: order.id,
      status: 'SUCCESS',
      paidAt: new Date(),
    },
    create: {
      orderId: order.id,
      provider: 'PAYSTACK',
      providerReference: 'PAYSTACK-DL101-MAYA',
      amountMinor: order.amountMinor,
      currency: order.currency,
      status: 'SUCCESS',
      paidAt: new Date(),
    },
  });

  await prisma.enrollment.upsert({
    where: {
      studentId_courseId: {
        studentId: maya.id,
        courseId: course.id,
      },
    },
    update: {
      status: 'ACTIVE',
      source: 'PAYMENT',
      orderId: order.id,
      startedAt: new Date(),
    },
    create: {
      studentId: maya.id,
      courseId: course.id,
      status: 'ACTIVE',
      source: 'PAYMENT',
      orderId: order.id,
      startedAt: new Date(),
    },
  });
}

async function main() {
  const admin = await seedAdmin();
  await seedCourses(admin?.id);
  await seedStudentsAndEnrollments();
  await seedOrdersAndPayments();

  const [
    courseCount,
    weekCount,
    moduleCount,
    lessonCount,
    studentCount,
    enrollmentCount,
    orderCount,
    paymentCount,
  ] = await Promise.all([
    prisma.course.count(),
    prisma.courseWeek.count(),
    prisma.courseModule.count(),
    prisma.lesson.count(),
    prisma.student.count(),
    prisma.enrollment.count(),
    prisma.order.count(),
    prisma.payment.count(),
  ]);

  console.info(
    `Seed complete: ${courseCount} courses, ${weekCount} weeks, ${moduleCount} modules, ${lessonCount} lessons, ${studentCount} students, ${enrollmentCount} enrollments, ${orderCount} orders, ${paymentCount} payments.`
  );
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
