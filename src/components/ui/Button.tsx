'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'ghost';
}

/**
 * Apple-style CTA. `gold` = filled Apple-blue pill (like apple.com "Buy"),
 * `ghost` = quiet outline pill. No uppercase, no wide tracking — just the
 * clean SF pill language.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'gold', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'group relative inline-flex items-center justify-center overflow-hidden rounded-full px-6 py-3 font-sans text-sm font-medium transition-all duration-300',
          variant === 'gold' &&
            'bg-champagne-deep text-white hover:bg-champagne',
          variant === 'ghost' &&
            'border border-champagne/60 text-champagne hover:border-champagne hover:bg-champagne/10',
          className
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
