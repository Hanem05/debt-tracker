'use client';

import type { HTMLAttributes } from 'react';
import { getAvatarColor } from '@/lib/utils/avatarColor';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  initials: string;
  id: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes: Record<string, string> = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-16 w-16 text-lg',
};

export function Avatar({ initials, id, size = 'md', className = '', ...props }: AvatarProps) {
  const [bg, color] = getAvatarColor(id);
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-semibold ${sizes[size]} ${className}`}
      style={{ backgroundColor: bg, color }}
      {...props}
    >
      {initials}
    </div>
  );
}
