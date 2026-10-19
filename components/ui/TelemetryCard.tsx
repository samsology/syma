'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Activity, ArrowUpRight, TrendingUp, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { springCard } from '@/lib/motion';

export interface TelemetryCardProps {
  title: string;
  metric: string;
  trend?: string;
  category?: string;
  theme?: 'light' | 'dark';
  className?: string;
  sparklineData?: number[];
}

/**
 * TelemetryCard
 * Lightweight, illustrative SVG & metric card for marketing teasers.
 * Note: Clearly labelled as SAMPLE / SIMULATED DATA for compliance and transparency.
 */
export function TelemetryCard({
  title,
  metric,
  trend = '+14.2%',
  category = 'Clinical Telemetry',
  theme = 'light',
  className,
  sparklineData = [12, 18, 14, 22, 28, 25, 34, 40],
}: TelemetryCardProps) {
  const isDark = theme === 'dark';

  // Compute SVG polyline points normalized to 100x32 viewbox
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min || 1;
  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * 96 + 2;
      const y = 30 - ((val - min) / range) * 24;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={springCard}
      className={cn(
        'relative rounded-2xl p-5 border transition-all duration-300 overflow-hidden',
        isDark
          ? 'bg-marketing-dark-surface/90 border-white/10 text-white shadow-xl shadow-black/20'
          : 'bg-white border-slate-200/90 text-slate-900 shadow-sm shadow-slate-200/50',
        className
      )}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider',
            isDark ? 'text-brand-cerulean' : 'text-primary'
          )}
        >
          <Activity className="h-3 w-3" />
          {category}
        </span>
        <span
          className={cn(
            'px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider border',
            isDark
              ? 'border-white/10 bg-white/5 text-slate-400'
              : 'border-slate-200 bg-slate-50 text-slate-500'
          )}
          title="Illustrative telemetry visualization"
        >
          Sample Model
        </span>
      </div>

      {/* Main Metric */}
      <div className="mt-3 flex items-baseline justify-between">
        <div>
          <p className="text-2xl font-extrabold font-heading tracking-tight leading-none">
            {metric}
          </p>
          <p
            className={cn(
              'mt-1 text-xs font-medium',
              isDark ? 'text-slate-400' : 'text-slate-500'
            )}
          >
            {title}
          </p>
        </div>
        <div
          className={cn(
            'inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full',
            isDark
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-emerald-50 text-emerald-700'
          )}
        >
          <TrendingUp className="h-3 w-3" />
          {trend}
        </div>
      </div>

      {/* Illustrative Sparkline SVG */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
        <svg
          viewBox="0 0 100 32"
          className="h-8 w-full overflow-visible"
          aria-hidden="true"
        >
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isDark ? 'text-brand-cerulean' : 'text-primary'}
            points={points}
          />
        </svg>
      </div>

      {/* Compliance Disclaimer Footer */}
      <p
        className={cn(
          'mt-2 text-[9px] font-medium leading-tight opacity-75',
          isDark ? 'text-slate-500' : 'text-slate-400'
        )}
      >
        *Illustrative dashboard preview for analytics architecture demonstrations.
      </p>
    </motion.div>
  );
}
