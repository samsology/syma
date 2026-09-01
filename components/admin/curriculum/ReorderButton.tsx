'use client';

import { useFormStatus } from 'react-dom';
import { ArrowDown, ArrowUp } from 'lucide-react';

export function ReorderButton({ direction, disabled }: { direction: 'up' | 'down'; disabled?: boolean }) {
  const { pending } = useFormStatus();
  const Icon = direction === 'up' ? ArrowUp : ArrowDown;

  return (
    <button
      type="submit"
      name="direction"
      value={direction}
      disabled={disabled || pending}
      aria-label={`Move ${direction}`}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
