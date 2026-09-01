import type { CourseStatus } from '@prisma/client';

const styles: Record<CourseStatus, string> = {
  DRAFT: 'bg-amber-50 text-amber-700 ring-amber-200',
  PUBLISHED: 'bg-green-50 text-green-700 ring-green-200',
  ARCHIVED: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const labels: Record<CourseStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
};

export function CourseStatusBadge({ status }: { status: CourseStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
