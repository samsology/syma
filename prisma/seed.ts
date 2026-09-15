import { PrismaClient, CourseStatus, LessonType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { courses } from './seed-data/courses';

const prisma = new PrismaClient();

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
  const activeSlugs = courses.map((c) => c.slug);
  await prisma.course.updateMany({
    where: { slug: { notIn: activeSlugs } },
    data: { status: CourseStatus.ARCHIVED },
  });

  for (const [courseIndex, course] of courses.entries()) {
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
  const studentSeeds = [
    {
      firstName: 'Maya',
      lastName: 'Okafor',
      email: 'maya.student@example.test',
      phone: '+234 800 000 0101',
    },
    {
      firstName: 'Tunde',
      lastName: 'Adebayo',
      email: 'tunde.student@example.test',
      phone: '+234 800 000 0102',
    },
    {
      firstName: 'Amina',
      lastName: 'Bello',
      email: 'amina.student@example.test',
      phone: '+234 800 000 0103',
    },
  ];

  const students = await Promise.all(
    studentSeeds.map((student) =>
      prisma.student.upsert({
        where: { email: student.email },
        update: {
          firstName: student.firstName,
          lastName: student.lastName,
          phone: student.phone,
          passwordHash,
          status: 'ACTIVE',
        },
        create: {
          ...student,
          passwordHash,
          status: 'ACTIVE',
        },
      })
    )
  );

  const publishedCourses = await prisma.course.findMany({
    where: { status: CourseStatus.PUBLISHED },
    orderBy: { createdAt: 'asc' },
    take: 2,
  });

  if (publishedCourses.length === 0) return;

  const enrollmentSeeds = [
    { student: students[0], course: publishedCourses[0], status: 'ACTIVE' as const },
    { student: students[1], course: publishedCourses[0], status: 'ACTIVE' as const },
    {
      student: students[2],
      course: publishedCourses[1] ?? publishedCourses[0],
      status: 'COMPLETED' as const,
    },
  ];

  await Promise.all(
    enrollmentSeeds.map((seed) =>
      prisma.enrollment.upsert({
        where: {
          studentId_courseId: {
            studentId: seed.student.id,
            courseId: seed.course.id,
          },
        },
        update: {
          status: seed.status,
          source: 'MANUAL',
          startedAt: new Date(),
          completedAt: seed.status === 'COMPLETED' ? new Date() : null,
        },
        create: {
          studentId: seed.student.id,
          courseId: seed.course.id,
          status: seed.status,
          source: 'MANUAL',
          startedAt: new Date(),
          completedAt: seed.status === 'COMPLETED' ? new Date() : null,
        },
      })
    )
  );
}

async function seedOrdersAndPayments() {
  const [students, courseList] = await Promise.all([
    prisma.student.findMany({ orderBy: { createdAt: 'asc' }, take: 3 }),
    prisma.course.findMany({ orderBy: { sortOrder: 'asc' }, take: 3 }),
  ]);

  if (students.length < 3 || courseList.length < 2) return;

  const orderSeeds = [
    {
      student: students[0],
      course: courseList[0],
      status: 'PAID' as const,
      paymentStatus: 'SUCCESS' as const,
      suffix: 'PAID',
    },
    {
      student: students[1],
      course: courseList[1],
      status: 'FAILED' as const,
      paymentStatus: 'FAILED' as const,
      suffix: 'FAILED',
    },
    {
      student: students[2],
      course: courseList[1],
      status: 'PENDING' as const,
      paymentStatus: 'PENDING' as const,
      suffix: 'PENDING',
    },
    {
      student: students[0],
      course: courseList[1],
      status: 'CANCELLED' as const,
      paymentStatus: 'CANCELLED' as const,
      suffix: 'CANCELLED',
    },
    {
      student: students[1],
      course: courseList[0],
      status: 'REFUNDED' as const,
      paymentStatus: 'REFUNDED' as const,
      suffix: 'REFUNDED',
    },
  ];

  for (const seed of orderSeeds) {
    const orderNumber = `SYM-DEV-${seed.suffix}`;
    const order = await prisma.order.upsert({
      where: { orderNumber },
      update: {
        studentId: seed.student.id,
        courseId: seed.course.id,
        status: seed.status,
        paidAt: seed.status === 'PAID' || seed.status === 'REFUNDED' ? new Date() : null,
      },
      create: {
        orderNumber,
        studentId: seed.student.id,
        courseId: seed.course.id,
        amountMinor: seed.course.priceMinor,
        currency: seed.course.currency,
        status: seed.status,
        paidAt: seed.status === 'PAID' || seed.status === 'REFUNDED' ? new Date() : null,
      },
    });

    await prisma.payment.upsert({
      where: {
        provider_providerReference: {
          provider: 'PAYSTACK',
          providerReference: `DEV-${seed.suffix}`,
        },
      },
      update: {
        orderId: order.id,
        status: seed.paymentStatus,
        paidAt:
          seed.paymentStatus === 'SUCCESS' || seed.paymentStatus === 'REFUNDED' ? new Date() : null,
      },
      create: {
        orderId: order.id,
        provider: 'PAYSTACK',
        providerReference: `DEV-${seed.suffix}`,
        amountMinor: order.amountMinor,
        currency: order.currency,
        status: seed.paymentStatus,
        paidAt:
          seed.paymentStatus === 'SUCCESS' || seed.paymentStatus === 'REFUNDED' ? new Date() : null,
      },
    });

    if (seed.status === 'PAID') {
      const existingOrderByEnrollment = await prisma.enrollment.findUnique({
        where: { orderId: order.id },
      });

      if (existingOrderByEnrollment) {
        if (
          existingOrderByEnrollment.studentId === seed.student.id &&
          existingOrderByEnrollment.courseId === seed.course.id
        ) {
          await prisma.enrollment.update({
            where: { id: existingOrderByEnrollment.id },
            data: {
              status: 'ACTIVE',
              source: 'PAYMENT',
              startedAt: existingOrderByEnrollment.startedAt ?? new Date(),
            },
          });
        } else {
          await prisma.enrollment.update({
            where: { id: existingOrderByEnrollment.id },
            data: { orderId: null },
          });
          await prisma.enrollment.upsert({
            where: { studentId_courseId: { studentId: seed.student.id, courseId: seed.course.id } },
            update: { status: 'ACTIVE', source: 'PAYMENT', orderId: order.id, startedAt: new Date() },
            create: {
              studentId: seed.student.id,
              courseId: seed.course.id,
              status: 'ACTIVE',
              source: 'PAYMENT',
              orderId: order.id,
              startedAt: new Date(),
            },
          });
        }
      } else {
        await prisma.enrollment.upsert({
          where: { studentId_courseId: { studentId: seed.student.id, courseId: seed.course.id } },
          update: { status: 'ACTIVE', source: 'PAYMENT', orderId: order.id, startedAt: new Date() },
          create: {
            studentId: seed.student.id,
            courseId: seed.course.id,
            status: 'ACTIVE',
            source: 'PAYMENT',
            orderId: order.id,
            startedAt: new Date(),
          },
        });
      }
    }
  }
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
