'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { springTactile } from '@/lib/motion';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'cerulean' | 'navy' | 'yellow' | 'coral';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
  theme?: 'light' | 'dark';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, theme = 'light', ...props }, ref) => {
    
    const baseStyles = 'inline-flex items-center justify-center font-sans font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cerulean focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';
    
    const isDark = theme === 'dark';

    const variants = {
      primary: 'bg-primary text-white hover:bg-secondary hover:shadow-primary-glow',
      secondary: 'bg-white border-2 border-primary text-primary hover:bg-surface-light',
      accent: 'bg-accent text-neutral-dark hover:bg-accent/80 hover:shadow-accent',
      cerulean: 'bg-brand-cerulean text-white hover:bg-brand-cerulean/90 hover:shadow-cerulean-glow font-bold',
      navy: 'bg-brand-navy text-white hover:bg-brand-navy/90 hover:shadow-primary-glow font-bold',
      yellow: 'bg-brand-yellow text-slate-950 hover:bg-brand-yellow/90 hover:shadow-yellow-glow font-bold',
      coral: 'bg-brand-coral text-white hover:bg-brand-coral/90 hover:shadow-coral-glow font-bold',
      outline: isDark
        ? 'bg-transparent border-2 border-slate-700 text-white hover:bg-slate-800 hover:border-slate-500'
        : 'bg-transparent border-2 border-slate-300 text-slate-800 hover:bg-slate-50 hover:border-slate-400',
      ghost: isDark
        ? 'bg-transparent text-slate-300 hover:bg-slate-900 hover:text-white'
        : 'bg-transparent text-slate-600 hover:bg-surface-light hover:text-primary',
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        transition={springTactile}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="mr-2 inline-flex shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2 inline-flex shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
