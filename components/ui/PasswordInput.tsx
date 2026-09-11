'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  toggleClassName?: string;
  wrapperClassName?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className = '',
      toggleClassName = '',
      wrapperClassName = '',
      disabled,
      autoComplete = 'current-password',
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
      if (!disabled) {
        setIsVisible((prev) => !prev);
      }
    };

    return (
      <div className={`relative flex items-center ${wrapperClassName}`}>
        <input
          {...props}
          ref={ref}
          type={isVisible ? 'text' : 'password'}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`w-full rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-10 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${className}`}
        />
        <button
          type="button"
          tabIndex={0}
          onClick={toggleVisibility}
          disabled={disabled}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
          className={`absolute right-2.5 flex h-7 w-7 items-center justify-center rounded text-slate-400 transition-colors hover:text-slate-700 focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 ${toggleClassName}`}
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
