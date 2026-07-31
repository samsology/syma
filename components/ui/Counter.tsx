'use client';

import { useEffect, useRef } from 'react';
import { useMotionValue, useTransform, animate, useInView } from 'framer-motion';

interface CounterProps {
  value: string;
  duration?: number;
}

export function Counter({ value, duration = 1.5 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  // Extract number and any non-numeric suffix (e.g. '+', '%')
  const numericValue = parseInt(value.replace(/\D/g, ''), 10) || 0;
  const suffix = value.replace(/\d/g, '');
  const inView = useInView(ref, { once: true, margin: '-50px' });

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (inView) {
      const controls = animate(count, numericValue, { duration, ease: 'easeOut' });
      return controls.stop;
    }
  }, [inView, count, numericValue, duration]);

  useEffect(() => {
    return rounded.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = latest.toLocaleString() + suffix;
      }
    });
  }, [rounded, suffix]);

  return <span ref={ref} className="tabular-nums font-extrabold text-slate-900">0{suffix}</span>;
}
