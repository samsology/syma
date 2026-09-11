import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { STUDENT_SESSION_COOKIE, STUDENT_SESSION_MAX_AGE_MS, STUDENT_SESSION_MAX_AGE_SECONDS } from './constants';
import { createSessionToken, hashToken } from './crypto';

export type StudentSessionUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
};

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: STUDENT_SESSION_MAX_AGE_SECONDS,
};

export async function createStudentSession(studentId: string) {
  // Clean up any existing sessions for this student and expired sessions
  await db.studentSession.deleteMany({
    where: {
      OR: [
        { studentId },
        { expiresAt: { lte: new Date() } },
      ],
    },
  });

  const token = createSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + STUDENT_SESSION_MAX_AGE_MS);

  await db.studentSession.create({
    data: {
      studentId,
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(STUDENT_SESSION_COOKIE, token, cookieOptions);
}

export async function destroyStudentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;

  if (token) {
    await db.studentSession.deleteMany({
      where: {
        tokenHash: hashToken(token),
      },
    });
  }

  // Explicitly expire the cookie with matching attributes to prevent browser rejection
  cookieStore.set(STUDENT_SESSION_COOKIE, '', {
    ...cookieOptions,
    maxAge: 0,
  });
}

export async function getCurrentStudent(): Promise<StudentSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;

  if (!token) return null;

  const session = await db.studentSession.findUnique({
    where: {
      tokenHash: hashToken(token),
    },
    include: {
      student: true,
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await db.studentSession.delete({ where: { id: session.id } });
    }
    // Clear dead or expired cookie from browser
    cookieStore.set(STUDENT_SESSION_COOKIE, '', {
      ...cookieOptions,
      maxAge: 0,
    });
    return null;
  }

  if (session.student.status !== 'ACTIVE') {
    await db.studentSession.delete({ where: { id: session.id } });
    cookieStore.set(STUDENT_SESSION_COOKIE, '', {
      ...cookieOptions,
      maxAge: 0,
    });
    return null;
  }

  return {
    id: session.student.id,
    firstName: session.student.firstName,
    lastName: session.student.lastName,
    email: session.student.email,
    phone: session.student.phone,
    status: session.student.status,
  };
}
