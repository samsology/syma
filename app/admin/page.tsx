import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/auth/session';

export default async function AdminIndexPage() {
  const admin = await getCurrentAdmin();
  redirect(admin ? '/admin/dashboard' : '/admin/login');
}
