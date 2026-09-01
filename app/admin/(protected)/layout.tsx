import { requireAdmin } from '@/lib/auth/authorization';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return <AdminShell admin={admin}>{children}</AdminShell>;
}
