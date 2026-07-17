'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SectionHeadingProps extends Omit<HTMLMotionProps<'div'>, 'title'> {
  title: string;
  badge?: string;
  description?: string;
  align?: 'left' | 'center';
  animate?: boolean;
}

export const SectionHeading = React.forwardRef<HTMLDivElement, SectionHeadingProps>(
  (
    {
      className,
      title,
      badge,
      description,
      align = 'center',
      animate = true,
      initial,
      whileInView,
      viewport,
      variants,
      transition,
      ...props
    },
    ref
  ) => {
    const wrapperClass = cn(
      'max-w-3xl space-y-4 mb-12 sm:mb-16',
      align === 'center' ? 'mx-auto text-center' : 'text-left',
      className
    );

    const content = (
      <>
        {badge && (
          <div
            className={cn(
              'inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wider',
              align === 'center' ? 'mx-auto' : '',
              'border-primary/20 bg-primary/5 text-accent shadow-sm shadow-primary/5'
            )}
          >
            {badge}
          </div>
        )}

        <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white leading-tight tracking-tight">
          {title}
        </h2>

        {description && (
          <p className="text-base sm:text-lg text-slate-400 font-sans leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </>
    );

    if (animate) {
      return (
        <motion.div
          ref={ref}
          initial={initial ?? 'hidden'}
          whileInView={whileInView ?? 'visible'}
          viewport={viewport ?? { once: true, margin: '-60px' }}
          variants={
            variants ?? {
              hidden: { opacity: 0, y: 15 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.5,
                  staggerChildren: 0.1,
                },
              },
            }
          }
          transition={transition}
          className={wrapperClass}
          {...props}
        >
          {content}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={wrapperClass} {...props as React.HTMLAttributes<HTMLDivElement>}>
        {content}
      </div>
    );
  }
);

SectionHeading.displayName = 'SectionHeading';
