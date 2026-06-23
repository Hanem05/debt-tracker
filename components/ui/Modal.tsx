'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  footer?: ReactNode;
}

const sizeStyles: Record<string, string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
};

export function Modal({ isOpen, onClose, title, subtitle, size = 'md', children, footer }: ModalProps) {
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6">
      <div className="absolute inset-0" onClick={onClose} />
      <div className={`relative w-full ${sizeStyles[size]} overflow-hidden rounded-[18px] border border-border bg-bg p-6 shadow-card`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            {title ? <h2 className="text-xl font-semibold text-white">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm text-text/70">{subtitle}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-text/70 transition hover:bg-white/5 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer ? <div className="mt-6 border-t border-border pt-4">{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}
