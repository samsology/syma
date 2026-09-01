import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE_MS, ADMIN_SESSION_MAX_AGE_SECONDS } from './constants';
import { createSessionToken, hashToken } from './crypto';

export type AdminSessionUser = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
};

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
};

export async function createAdminSession(adminId: string) {
  const token = createSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_MAX_AGE_MS);

  await db.adminSession.create({
    data: {
      adminId,
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, cookieOptions);
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (token) {
    await db.adminSession.deleteMany({
      where: {
        tokenHash: hashToken(token),
      },
    });
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function getCurrentAdmin(): Promise<AdminSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) return null;

  const session = await db.adminSession.findUnique({
    where: {
      tokenHash: hashToken(token),
    },
    include: {
      admin: true,
    },
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await db.adminSession.delete({ where: { id: session.id } });
    }
    return null;
  }

  if (!session.admin.isActive) return null;
  if (session.admin.role !== 'ADMIN' && session.admin.role !== 'SUPER_ADMIN') return null;

  return {
    id: session.admin.id,
    name: session.admin.name,
    email: session.admin.email,
    role: session.admin.role,
  };
}
