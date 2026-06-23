'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon: Icon, error, className = '', ...props }, ref) => (
    <label className="block">
      <span className="mb-1.5 inline-block text-[11px] font-medium uppercase tracking-[0.22em] text-text/50">
        {label}
      </span>
      <div
        className={`relative overflow-hidden rounded-xl border transition-all duration-150 ${
          error
            ? 'border-red/40 bg-red/5 focus-within:border-red/60 focus-within:ring-2 focus-within:ring-red/10'
            : 'border-border bg-bg-2 focus-within:border-cyan/50 focus-within:ring-2 focus-within:ring-cyan/8'
        }`}
      >
        {Icon ? (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/30" />
        ) : null}
        <input
          ref={ref}
          className={`w-full bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-text/25 ${
            Icon ? 'pl-9 pr-3' : 'px-3'
          } ${className}`}
          {...props}
        />
      </div>
      {error ? <p className="mt-1 text-xs text-red/80">{error}</p> : null}
    </label>
  )
);

Input.displayName = 'Input';
