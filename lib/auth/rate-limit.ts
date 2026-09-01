import { db } from '@/lib/db';
import { ADMIN_LOGIN_RATE_LIMIT, STUDENT_LOGIN_RATE_LIMIT } from './constants';

export async function isLoginRateLimited(key: string) {
  const since = new Date(Date.now() - ADMIN_LOGIN_RATE_LIMIT.windowMs);

  await db.adminLoginAttempt.deleteMany({
    where: {
      createdAt: {
        lt: since,
      },
    },
  });

  const attemptCount = await db.adminLoginAttempt.count({
    where: {
      key,
      createdAt: {
        gte: since,
      },
    },
  });

  return attemptCount >= ADMIN_LOGIN_RATE_LIMIT.maxAttempts;
}

export async function recordLoginAttempt(key: string) {
  await db.adminLoginAttempt.create({
    data: { key },
  });
}

export async function clearLoginAttempts(key: string) {
  await db.adminLoginAttempt.deleteMany({
    where: { key },
  });
}

export async function isStudentLoginRateLimited(key: string) {
  const since = new Date(Date.now() - STUDENT_LOGIN_RATE_LIMIT.windowMs);

  await db.studentLoginAttempt.deleteMany({
    where: {
      createdAt: {
        lt: since,
      },
    },
  });

  const attemptCount = await db.studentLoginAttempt.count({
    where: {
      key,
      createdAt: {
        gte: since,
      },
    },
  });

  return attemptCount >= STUDENT_LOGIN_RATE_LIMIT.maxAttempts;
}

export async function recordStudentLoginAttempt(key: string) {
  await db.studentLoginAttempt.create({
    data: { key },
  });
}

export async function clearStudentLoginAttempts(key: string) {
  await db.studentLoginAttempt.deleteMany({
    where: { key },
  });
}
