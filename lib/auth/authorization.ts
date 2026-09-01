import { redirect } from 'next/navigation';
import { getCurrentAdmin, type AdminSessionUser } from './session';

export async function requireAdmin(): Promise<AdminSessionUser> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect('/admin/login');
  }

  return admin;
}

export async function requireRole(roles: AdminSessionUser['role'][]): Promise<AdminSessionUser> {
  const admin = await requireAdmin();

  if (!roles.includes(admin.role)) {
    redirect('/admin/dashboard');
  }

  return admin;
}
