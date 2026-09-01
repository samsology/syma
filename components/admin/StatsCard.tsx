import type { LucideIcon } from 'lucide-react';

type StatsCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
};

export function StatsCard({ label, value, icon: Icon }: StatsCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-surface-light text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-950">{value.toLocaleString()}</p>
    </div>
  );
}
