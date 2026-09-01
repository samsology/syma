const styles = {
  ACTIVE: 'bg-success/10 text-success',
  PUBLISHED: 'bg-success/10 text-success',
  COMPLETED: 'bg-primary/10 text-primary',
  PENDING: 'bg-warning/10 text-warning',
  DRAFT: 'bg-warning/10 text-warning',
  INACTIVE: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-slate-100 text-slate-600',
  SUSPENDED: 'bg-error/10 text-error',
  ARCHIVED: 'bg-slate-900/10 text-slate-700',
} as const;

export function StatusPill({ status }: { status: keyof typeof styles | string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide ${styles[status as keyof typeof styles] ?? 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}
