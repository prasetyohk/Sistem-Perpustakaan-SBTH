'use client';

import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  shape?: 'circle' | 'rounded';
}

const PALETTE = [
  { bg: 'bg-amber-500/15', text: 'text-amber-500', border: 'border-amber-500/30' },
  { bg: 'bg-emerald-500/15', text: 'text-emerald-500', border: 'border-emerald-500/30' },
  { bg: 'bg-sky-500/15', text: 'text-sky-500', border: 'border-sky-500/30' },
  { bg: 'bg-purple-500/15', text: 'text-purple-500', border: 'border-purple-500/30' },
  { bg: 'bg-rose-500/15', text: 'text-rose-500', border: 'border-rose-500/30' },
  { bg: 'bg-indigo-500/15', text: 'text-indigo-500', border: 'border-indigo-500/30' },
  { bg: 'bg-teal-500/15', text: 'text-teal-500', border: 'border-teal-500/30' },
  { bg: 'bg-orange-500/15', text: 'text-orange-500', border: 'border-orange-500/30' },
];

function getInitials(name: string): string {
  if (!name) return '?';
  const clean = name.trim().replace(/^(ananda|adik|kak|ibu|pak|ms\.|mr\.)\s+/i, '');
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getColorIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % PALETTE.length;
}

const SIZE_MAP = {
  xs: 'h-7 w-7 text-[11px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base font-bold',
  xl: 'h-20 w-20 text-xl font-bold',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
  shape = 'circle',
}) => {
  const [hasError, setHasError] = useState<boolean>(false);
  const color = PALETTE[getColorIndex(name || 'SBTH')];
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;
  const radiusClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';

  const shouldShowImage = src && !hasError && !src.includes('broken');

  if (shouldShowImage) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden border border-border bg-surface-2 ${sizeClasses} ${radiusClass} ${className}`}
      >
        <img
          src={src}
          alt=""
          aria-hidden="true"
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // Graceful colorful initials fallback
  return (
    <div
      className={`relative shrink-0 flex items-center justify-center font-bold select-none border ${color.bg} ${color.text} ${color.border} ${sizeClasses} ${radiusClass} ${className}`}
      title={name}
      aria-label={name}
    >
      <span>{getInitials(name)}</span>
    </div>
  );
};
