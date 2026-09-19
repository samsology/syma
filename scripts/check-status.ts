import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const dbUrl = process.env.DATABASE_URL || "postgresql://postgres.qboaxloypjeqhdgumqun:Zm1AQDp0dQdKHZgV@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1";

const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } },
});

async function main() {
  console.log('=== VERIFYING FINAL PRODUCTION STATE ===');
  
  const courses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, title: true, slug: true, status: true, priceMinor: true, currency: true },
  });

  const students = await prisma.student.findMany({
    select: { id: true, email: true, firstName: true, lastName: true, status: true, passwordHash: true, lastLoginAt: true },
  });

  const enrollments = await prisma.enrollment.findMany({
    select: { id: true, studentId: true, courseId: true, status: true, source: true, orderId: true, course: { select: { title: true } } },
  });

  const orders = await prisma.order.findMany({
    select: { id: true, orderNumber: true, status: true, amountMinor: true, currency: true },
  });

  const payments = await prisma.payment.findMany({
    select: { id: true, provider: true, providerReference: true, status: true, amountMinor: true, currency: true },
  });

  const applications = await prisma.studentApplication.findMany({
    select: { id: true, email: true, fullName: true, status: true, studentId: true },
  });

  const sessions = await prisma.studentSession.findMany({
    select: { id: true, studentId: true, expiresAt: true },
  });

  console.log('Published Courses (Count: ' + courses.length + '):', courses);
  console.log('Students (Count: ' + students.length + '):', students.map(s => ({ ...s, passwordHash: '[REDACTED]' })));
  console.log('Enrollments (Count: ' + enrollments.length + '):', enrollments);
  console.log('Orders (Count: ' + orders.length + '):', orders);
  console.log('Payments (Count: ' + payments.length + '):', payments);
  console.log('Applications (Count: ' + applications.length + '):', applications);
  console.log('Active Sessions (Count: ' + sessions.length + '):', sessions);

  // Verify Maya's credentials
  const maya = students.find(s => s.email === 'maya.student@example.test');
  if (!maya) throw new Error('Maya not found!');
  const passwordMatch = await bcrypt.compare('studentpassword123', maya.passwordHash);
  console.log('\n🔐 Maya Okafor password verification ("studentpassword123"):', passwordMatch ? 'PASS ✅' : 'FAIL ❌');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
