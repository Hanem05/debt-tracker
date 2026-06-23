'use client';

import { ButtonHTMLAttributes, ElementType, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variantStyles: Record<string, string> = {
  primary:
    'bg-gradient-to-r from-cyan to-cyan/80 text-bg font-semibold shadow-glow-sm hover:from-cyan/90 hover:to-cyan/70 active:scale-[0.98]',
  ghost:
    'border border-border bg-white/[0.03] text-text/80 hover:bg-white/[0.07] hover:text-white hover:border-border-2',
  danger:
    'bg-gradient-to-r from-red to-red/80 text-white font-semibold hover:from-red/90 hover:to-red/70 active:scale-[0.98]',
  outline:
    'border border-border-2 bg-transparent text-text/70 hover:bg-white/[0.04] hover:text-white hover:border-border-2',
};

const sizeStyles: Record<string, string> = {
  sm: 'h-8 px-3 text-xs rounded-lg',
  md: 'h-10 px-4 text-sm rounded-xl',
  lg: 'h-11 px-5 text-sm rounded-xl',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ElementType;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading, icon: Icon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
