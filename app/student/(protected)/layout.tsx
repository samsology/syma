import { StudentShell } from '@/components/student/StudentShell';
import { requireStudent } from '@/lib/auth/student-authorization';

export default async function StudentProtectedLayout({ children }: { children: React.ReactNode }) {
  const student = await requireStudent();
  return <StudentShell student={student}>{children}</StudentShell>;
}
