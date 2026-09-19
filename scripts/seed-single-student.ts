import { PrismaClient, CourseStatus, LessonType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { dataLiteracyCourse } from '../prisma/seed-data/data-literacy';

const dbUrl = "postgresql://postgres.qboaxloypjeqhdgumqun:Zm1AQDp0dQdKHZgV@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1&connect_timeout=30&pool_timeout=30";

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

function createSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function withRetry<T>(fn: (p: PrismaClient) => Promise<T>, maxRetries = 5, delayMs = 3000): Promise<T> {
  let lastError: any;
  for (let i = 1; i <= maxRetries; i++) {
    const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
    try {
      const result = await fn(prisma);
      await prisma.$disconnect();
      return result;
    } catch (err: any) {
      lastError = err;
      await prisma.$disconnect();
      console.warn(`[Attempt ${i}/${maxRetries}] Operation failed (${err.message?.slice(0, 80)}...). Retrying in ${delayMs / 1000}s...`);
      if (i < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}

async function main() {
  console.log('🚀 Seeding single student and single course: Maya Okafor & Introduction to Data Literacy...');

  // 1. Seed/Publish Course: Introduction to Data Literacy
  console.log('📘 Upserting course: Introduction to Data Literacy...');
  const course = await withRetry(async (prisma) => {
    return prisma.course.upsert({
      where: { slug: dataLiteracyCourse.slug },
      update: {
        title: dataLiteracyCourse.title,
        shortDescription: dataLiteracyCourse.shortDescription,
        description: dataLiteracyCourse.description,
        category: dataLiteracyCourse.category,
        level: dataLiteracyCourse.level,
        duration: dataLiteracyCourse.duration,
        priceMinor: dataLiteracyCourse.priceMinor,
        currency: dataLiteracyCourse.currency ?? 'NGN',
        benefits: dataLiteracyCourse.benefits,
        cta: dataLiteracyCourse.cta,
        sortOrder: 1,
        status: CourseStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      create: {
        title: dataLiteracyCourse.title,
        slug: dataLiteracyCourse.slug,
        shortDescription: dataLiteracyCourse.shortDescription,
        description: dataLiteracyCourse.description,
        category: dataLiteracyCourse.category,
        level: dataLiteracyCourse.level,
        duration: dataLiteracyCourse.duration,
        priceMinor: dataLiteracyCourse.priceMinor,
        currency: dataLiteracyCourse.currency ?? 'NGN',
        benefits: dataLiteracyCourse.benefits,
        cta: dataLiteracyCourse.cta,
        sortOrder: 1,
        status: CourseStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  });

  // Archive any other courses to ensure single-course production scope
  await withRetry(async (prisma) => {
    return prisma.course.updateMany({
      where: { id: { not: course.id } },
      data: { status: CourseStatus.ARCHIVED },
    });
  });

  // Ensure lessons for this course are PUBLISHED so Maya can access them
  await withRetry(async (prisma) => {
    return prisma.lesson.updateMany({
      where: {
        module: {
          week: {
            courseId: course.id,
          },
        },
      },
      data: {
        status: CourseStatus.PUBLISHED,
      },
    });
  });

  // 2. Seed Student: Maya Okafor
  console.log('👤 Upserting student: Maya Okafor (maya.student@example.test)...');
  const passwordHash = await bcrypt.hash('studentpassword123', 12);
  const student = await withRetry(async (prisma) => {
    return prisma.student.upsert({
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
  });

  // 3. Complete Signup: StudentApplication record linked to Maya
  console.log('📝 Creating / linking StudentApplication for Maya...');
  await withRetry(async (prisma) => {
    const existingApp = await prisma.studentApplication.findFirst({
      where: { email: 'maya.student@example.test' },
    });

    if (existingApp) {
      return prisma.studentApplication.update({
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
      return prisma.studentApplication.create({
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
  });

  // 4. Complete Payment: Order (PAID) and Payment (SUCCESS)
  console.log('💳 Creating Order and Payment records for Introduction to Data Literacy...');
  const orderNumber = 'SYM-DL101-MAYA';
  const order = await withRetry(async (prisma) => {
    return prisma.order.upsert({
      where: { orderNumber },
      update: {
        studentId: student.id,
        courseId: course.id,
        amountMinor: course.priceMinor,
        currency: course.currency,
        status: 'PAID',
        paidAt: new Date(),
      },
      create: {
        orderNumber,
        studentId: student.id,
        courseId: course.id,
        amountMinor: course.priceMinor,
        currency: course.currency,
        status: 'PAID',
        paidAt: new Date(),
      },
    });
  });

  await withRetry(async (prisma) => {
    return prisma.payment.upsert({
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
  });

  // 5. Complete Enrollment: ACTIVE enrollment linked to Order
  console.log('🎓 Enrolling Maya in Introduction to Data Literacy...');
  // Clean up any old enrollments in other courses
  await withRetry(async (prisma) => {
    return prisma.enrollment.deleteMany({
      where: {
        studentId: student.id,
        courseId: { not: course.id },
      },
    });
  });

  await withRetry(async (prisma) => {
    return prisma.enrollment.upsert({
      where: {
        studentId_courseId: {
          studentId: student.id,
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
        studentId: student.id,
        courseId: course.id,
        status: 'ACTIVE',
        source: 'PAYMENT',
        orderId: order.id,
        startedAt: new Date(),
      },
    });
  });

  // Clean up any dummy/old orders for other courses for Maya
  await withRetry(async (prisma) => {
    await prisma.payment.deleteMany({
      where: {
        order: {
          studentId: student.id,
          id: { not: order.id },
        },
      },
    });
    return prisma.order.deleteMany({
      where: {
        studentId: student.id,
        id: { not: order.id },
      },
    });
  });

  // 6. Complete Login: StudentSession
  console.log('🔑 Creating valid active StudentSession...');
  const token = createSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await withRetry(async (prisma) => {
    await prisma.studentSession.deleteMany({
      where: { studentId: student.id },
    });

    return prisma.studentSession.create({
      data: {
        studentId: student.id,
        tokenHash,
        expiresAt,
      },
    });
  });

  console.log('\n✅ SEED COMPLETED SUCCESSFULLY:');
  console.log('----------------------------------------------------');
  console.log(`Student:    ${student.firstName} ${student.lastName} (${student.email})`);
  console.log(`Status:     ${student.status} (Verified login with password 'studentpassword123')`);
  console.log(`Course:     ${course.title} (${course.slug}) [Status: ${course.status}]`);
  console.log(`Enrollment: Active (Source: PAYMENT, Course: ${course.title})`);
  console.log(`Order:      ${order.orderNumber} [Status: ${order.status}, Amount: ${order.currency} ${order.amountMinor / 100}]`);
  console.log(`Payment:    PAYSTACK-DL101-MAYA [Status: SUCCESS]`);
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Seed execution error:', e);
    process.exit(1);
  });
