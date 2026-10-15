'use client';

import React, { useState } from 'react';

interface SmartBookCoverProps {
  title: string;
  author?: string;
  coverUrl?: string | null;
  categoryId?: string;
  categoryCode?: string; // 'ALAM' | 'DONGENG' | 'AKTIVITAS' | 'KARAKTER' | 'ENSIKLOPEDIA' | 'MANDARIN'
  className?: string;
  aspectRatio?: string; // e.g. "aspect-3/4"
}

interface ThemeConfig {
  bg: string;
  border: string;
  accent: string;
  icon: string;
  label: string;
}

const CATEGORY_THEMES: Record<string, ThemeConfig> = {
  // Category IDs & Codes
  'cat-alam': {
    bg: 'from-emerald-900 via-teal-950 to-slate-950',
    border: 'border-emerald-500/30',
    accent: 'text-emerald-300',
    icon: '🌿',
    label: 'Sains & Alam',
  },
  'ALAM': {
    bg: 'from-emerald-900 via-teal-950 to-slate-950',
    border: 'border-emerald-500/30',
    accent: 'text-emerald-300',
    icon: '🌿',
    label: 'Sains & Alam',
  },
  'cat-dongeng': {
    bg: 'from-amber-800 via-yellow-950 to-slate-950',
    border: 'border-amber-500/30',
    accent: 'text-amber-300',
    icon: '⭐',
    label: 'Dongeng Anak',
  },
  'DONGENG': {
    bg: 'from-amber-800 via-yellow-950 to-slate-950',
    border: 'border-amber-500/30',
    accent: 'text-amber-300',
    icon: '⭐',
    label: 'Dongeng Anak',
  },
  'cat-aktivitas': {
    bg: 'from-blue-900 via-indigo-950 to-slate-950',
    border: 'border-blue-500/30',
    accent: 'text-blue-300',
    icon: '📖',
    label: 'Aktivitas & Baca',
  },
  'AKTIVITAS': {
    bg: 'from-blue-900 via-indigo-950 to-slate-950',
    border: 'border-blue-500/30',
    accent: 'text-blue-300',
    icon: '📖',
    label: 'Aktivitas & Baca',
  },
  'cat-karakter': {
    bg: 'from-rose-900 via-red-950 to-slate-950',
    border: 'border-rose-500/30',
    accent: 'text-rose-300',
    icon: '❤️',
    label: 'Budi Pekerti',
  },
  'KARAKTER': {
    bg: 'from-rose-900 via-red-950 to-slate-950',
    border: 'border-rose-500/30',
    accent: 'text-rose-300',
    icon: '❤️',
    label: 'Budi Pekerti',
  },
  'cat-ensiklopedia': {
    bg: 'from-purple-900 via-violet-950 to-slate-950',
    border: 'border-purple-500/30',
    accent: 'text-purple-300',
    icon: '✨',
    label: 'Ensiklopedia',
  },
  'ENSIKLOPEDIA': {
    bg: 'from-purple-900 via-violet-950 to-slate-950',
    border: 'border-purple-500/30',
    accent: 'text-purple-300',
    icon: '✨',
    label: 'Ensiklopedia',
  },
  'cat-bahasa': {
    bg: 'from-pink-900 via-fuchsia-950 to-slate-950',
    border: 'border-pink-500/30',
    accent: 'text-pink-300',
    icon: '🈶',
    label: 'Trilingual SBTH',
  },
  'MANDARIN': {
    bg: 'from-pink-900 via-fuchsia-950 to-slate-950',
    border: 'border-pink-500/30',
    accent: 'text-pink-300',
    icon: '🈶',
    label: 'Trilingual SBTH',
  },
};

export const SmartBookCover: React.FC<SmartBookCoverProps> = ({
  title,
  author,
  coverUrl,
  categoryId,
  categoryCode = 'DONGENG',
  className = '',
  aspectRatio = 'aspect-3/4',
}) => {
  const [imgError, setImgError] = useState(false);

  // 1. Deteksi apakah URL gambar kosong atau merupakan placeholder "image not available" bawaan
  const lowerUrl = (coverUrl || '').toLowerCase();
  const isInvalidUrl =
    !coverUrl ||
    imgError ||
    coverUrl.trim() === '' ||
    lowerUrl.includes('not_available') ||
    lowerUrl.includes('no-cover') ||
    lowerUrl.includes('no-image') ||
    lowerUrl.includes('placeholder') ||
    lowerUrl.includes('default') ||
    lowerUrl.includes('vid=isbn') ||
    lowerUrl.includes('zweacaaj') ||
    lowerUrl.includes('7jxtzweacaaj') ||
    lowerUrl.includes('cbftzweacaaj') ||
    lowerUrl.includes('scfzzweacaaj') ||
    lowerUrl.includes('books.google.com/books/content?id=&') ||
    lowerUrl.includes('unsplash');

  // 2. Pilih tema warna berdasarkan categoryId atau categoryCode
  const lookupKey = categoryId || categoryCode;
  const theme =
    CATEGORY_THEMES[lookupKey] ||
    CATEGORY_THEMES[categoryCode.toUpperCase()] ||
    CATEGORY_THEMES['cat-dongeng'];

  if (!isInvalidUrl) {
    return (
      <div className={`relative w-full ${aspectRatio} overflow-hidden rounded-xl bg-slate-900 shadow-sm ${className}`}>
        <img
          src={coverUrl!}
          alt={title}
          onError={() => setImgError(true)}
          onLoad={(e) => {
            // Deteksi gambar placeholder 1x1 pixel atau gambar "image not available" Google Books
            const img = e.currentTarget;
            if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
              setImgError(true);
            }
          }}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Subtle spine line overlay for realistic book effect */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
      </div>
    );
  }

  // 3. Tampilan Auto-Generated Hardcover Dinamis berbasis Gradasi Kategori
  return (
    <div
      className={`relative w-full ${aspectRatio} rounded-xl overflow-hidden bg-gradient-to-br ${theme.bg} border ${theme.border} p-3 sm:p-3.5 flex flex-col justify-between select-none shadow-md group ${className}`}
      style={{
        boxShadow: 'inset 4px 0 8px rgba(0, 0, 0, 0.45), 0 4px 14px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Efek Tekstur Lipatan Jilid Hardcover di Sisi Kiri */}
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/60 via-white/10 to-transparent pointer-events-none border-r border-white/5" />

      {/* Watermark Ikon Besar Samar di Pojok Kanan Bawah */}
      <div className="absolute -right-2 -bottom-2 text-6xl opacity-15 pointer-events-none transform -rotate-12 group-hover:scale-110 transition-transform">
        {theme.icon}
      </div>

      {/* Bagian Atas: Label Kategori Kecil & Ikon */}
      <div className="pl-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-xs">{theme.icon}</span>
          <span
            className={`text-[9px] font-bold uppercase tracking-wider ${theme.accent} opacity-90`}
          >
            {theme.label}
          </span>
        </div>
        <span className="text-[8px] font-mono text-white/40 tracking-wider">SBTH</span>
      </div>

      {/* Bagian Tengah: Judul Buku Proporsional (Seperti Cetakan Hardcover Mewah) */}
      <div className="pl-2 my-auto py-1 z-10">
        <div className="w-6 h-0.5 bg-white/30 rounded-full mb-2" />
        <h4 className="font-display text-xs sm:text-sm font-bold text-white leading-snug line-clamp-3 drop-shadow-sm">
          {title}
        </h4>
      </div>

      {/* Bagian Bawah: Nama Pengarang & Footer Perpus */}
      <div className="pl-2 z-10 border-t border-white/15 pt-1.5 flex items-center justify-between text-[10px]">
        <span className="text-slate-300/90 truncate max-w-[85%] font-medium">
          {author || 'Koleksi SBTH TK'}
        </span>
        <span className="text-amber-400 font-bold text-[9px]">★</span>
      </div>
    </div>
  );
};
