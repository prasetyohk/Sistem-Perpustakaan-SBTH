'use client';

import React from 'react';
import { Leaf, Star, BookOpen, Heart, Sparkles, LucideIcon } from 'lucide-react';
import { CategoryId } from '@/types';
import { CATEGORIES } from '@/lib/constants';

interface BookCoverPlaceholderProps {
  title: string;
  author?: string;
  categoryId?: CategoryId | string;
  className?: string;
  aspectRatio?: string;
}

const CATEGORY_STYLES: Record<
  string,
  {
    gradient: string;
    icon: LucideIcon;
    accent: string;
  }
> = {
  'cat-alam': {
    gradient: 'from-emerald-600 via-teal-700 to-emerald-900',
    icon: Leaf,
    accent: '#34d399',
  },
  'cat-dongeng': {
    gradient: 'from-amber-500 via-orange-600 to-amber-800',
    icon: Star,
    accent: '#fbbf24',
  },
  'cat-aktivitas': {
    gradient: 'from-sky-600 via-blue-700 to-indigo-900',
    icon: BookOpen,
    accent: '#60a5fa',
  },
  'cat-karakter': {
    gradient: 'from-rose-500 via-pink-600 to-rose-900',
    icon: Heart,
    accent: '#f472b6',
  },
  'cat-ensiklopedia': {
    gradient: 'from-purple-600 via-indigo-700 to-purple-950',
    icon: Sparkles,
    accent: '#c084fc',
  },
  'cat-bahasa': {
    gradient: 'from-pink-500 via-rose-600 to-pink-900',
    icon: BookOpen,
    accent: '#f472b6',
  },
};

export const BookCoverPlaceholder: React.FC<BookCoverPlaceholderProps> = ({
  title,
  author,
  categoryId = 'cat-dongeng',
  className = '',
  aspectRatio = 'aspect-3/4',
}) => {
  const style = CATEGORY_STYLES[categoryId] || CATEGORY_STYLES['cat-dongeng'];
  const Icon = style.icon;
  const category = CATEGORIES.find((c) => c.id === categoryId);

  return (
    <div
      className={`relative w-full ${aspectRatio} rounded-xl overflow-hidden bg-gradient-to-br ${style.gradient} p-3 text-white flex flex-col justify-between select-none shadow-md ${className}`}
      style={{
        // Book spine 3D effect on left edge
        boxShadow: 'inset 5px 0 8px rgba(0, 0, 0, 0.4), 0 4px 14px rgba(0,0,0,0.2)',
      }}
    >
      {/* Subtle spine line overlay */}
      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/25 pointer-events-none border-r border-white/10" />

      {/* Decorative top pattern */}
      <div className="pl-2 flex items-center justify-between">
        <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-xs">
          {category?.shortName || 'SBTH CERIA'}
        </span>
        <Icon className="h-4 w-4 opacity-75" />
      </div>

      {/* Center title in Fredoka display font */}
      <div className="pl-2 pr-1 py-1 text-center my-auto">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md mb-2 shadow-inner">
          <Icon className="h-5 w-5" style={{ color: style.accent }} />
        </div>
        <h4 className="font-display font-bold text-xs sm:text-sm leading-snug line-clamp-3 text-white drop-shadow-xs">
          {title}
        </h4>
      </div>

      {/* Footer author */}
      <div className="pl-2 pt-1 border-t border-white/20 flex items-center justify-between text-[9px] text-white/80">
        <span className="truncate max-w-[85px]">{author || 'Tim SBTH'}</span>
        <span className="font-mono text-[8px] opacity-70">SBTH</span>
      </div>
    </div>
  );
};
