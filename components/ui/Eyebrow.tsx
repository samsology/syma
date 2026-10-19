import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'cerulean' | 'yellow' | 'coral' | 'navy' | 'default';
  children: React.ReactNode;
}

export function Eyebrow({
  className,
  variant = 'default',
  children,
  ...props
}: EyebrowProps) {
  const variantStyles = {
    default: 'border-brand-cerulean/20 bg-brand-cerulean/10 text-brand-cerulean',
    cerulean: 'border-brand-cerulean/30 bg-brand-cerulean/10 text-brand-cerulean',
    yellow: 'border-brand-yellow/30 bg-brand-yellow/10 text-yellow-600 dark:text-brand-yellow',
    coral: 'border-brand-coral/30 bg-brand-coral/10 text-brand-coral',
    navy: 'border-brand-navy/20 bg-brand-navy/10 text-brand-navy dark:text-brand-cerulean',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider select-none',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
