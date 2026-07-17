'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'animate'> {
  hoverEffect?: 'none' | 'lift' | 'glow';
  shouldAnimate?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      hoverEffect = 'none',
      shouldAnimate = false,
      initial,
      whileInView,
      viewport,
      transition,
      variants,
      ...props
    },
    ref
  ) => {
    const baseClass = cn(
      'rounded-3xl border border-slate-800/80 bg-neutral-dark/40 backdrop-blur-md p-6 overflow-hidden',
      hoverEffect === 'lift' && 'hover-lift',
      hoverEffect === 'glow' && 'hover-glow',
      className
    );

    if (shouldAnimate) {
      return (
        <motion.div
          ref={ref}
          initial={initial ?? { opacity: 0, y: 15 }}
          whileInView={whileInView ?? { opacity: 1, y: 0 }}
          viewport={viewport ?? { once: true, margin: '-40px' }}
          transition={transition ?? { duration: 0.4 }}
          variants={variants}
          className={baseClass}
          {...props}
        />
      );
    }

    return <div ref={ref} className={baseClass} {...props as React.HTMLAttributes<HTMLDivElement>} />;
  }
);

Card.displayName = 'Card';

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props} />
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-xl font-bold font-heading text-white leading-none tracking-tight', className)} {...props} />
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-slate-400 font-sans leading-relaxed', className)} {...props} />
);
CardDescription.displayName = 'CardDescription';

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('pt-0', className)} {...props} />
);
CardContent.displayName = 'CardContent';

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center pt-4 border-t border-slate-900/60 mt-6', className)} {...props} />
);
CardFooter.displayName = 'CardFooter';
