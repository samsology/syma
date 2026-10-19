'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

import { springCard } from '@/lib/motion';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'animate'> {
  hoverEffect?: 'none' | 'lift' | 'glow' | 'spring';
  surface?: 'light' | 'dark' | 'glass';
  shouldAnimate?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      hoverEffect = 'none',
      surface = 'light',
      shouldAnimate = false,
      initial,
      whileInView,
      viewport,
      transition,
      variants,
      whileHover,
      ...props
    },
    ref
  ) => {
    const surfaceStyles = {
      light: 'border-slate-200 bg-white text-slate-900 shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_12px_24px_-10px_rgba(0,0,0,0.04)]',
      dark: 'border-white/10 bg-marketing-dark-surface text-white shadow-xl shadow-black/20',
      glass: 'border-white/20 bg-white/75 backdrop-blur-xl text-slate-900 shadow-lg',
    };

    const baseClass = cn(
      'rounded-3xl border p-6 overflow-hidden transition-all duration-300',
      surfaceStyles[surface],
      hoverEffect === 'lift' && 'hover-lift',
      hoverEffect === 'glow' && 'hover-glow',
      className
    );

    if (shouldAnimate || hoverEffect === 'spring') {
      return (
        <motion.div
          ref={ref}
          initial={initial ?? { opacity: 0, y: 15 }}
          whileInView={whileInView ?? { opacity: 1, y: 0 }}
          whileHover={hoverEffect === 'spring' ? (whileHover ?? { y: -4 }) : whileHover}
          viewport={viewport ?? { once: true, margin: '-40px' }}
          transition={transition ?? (hoverEffect === 'spring' ? springCard : { duration: 0.4 })}
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
  <h3 className={cn('text-xl font-bold font-heading text-inherit leading-none tracking-tight', className)} {...props} />
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-slate-500 font-sans leading-relaxed', className)} {...props} />
);
CardDescription.displayName = 'CardDescription';

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('pt-0', className)} {...props} />
);
CardContent.displayName = 'CardContent';

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center pt-4 border-t border-slate-200/60 mt-6', className)} {...props} />
);
CardFooter.displayName = 'CardFooter';

