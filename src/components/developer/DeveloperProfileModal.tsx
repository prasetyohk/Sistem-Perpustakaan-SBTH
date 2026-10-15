'use client';

import React from 'react';
import {
  X,
  Code2,
  Mail,
  Phone,
  Sparkles,
  ExternalLink,
  Award,
  Layers,
  Cpu,
  ShieldCheck,
  CheckCircle,
  MessageCircle,
} from 'lucide-react';
import { soundFx } from '@/lib/sound';

interface DeveloperProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperProfileModal: React.FC<DeveloperProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const email = 'Prasetyo.handy@gmail.com';
  const whatsappNumber = '+62 812-9125-5917';
  const waUrl =
    'https://wa.me/6281291255917?text=Halo%20Mas%20Prasetyo%2C%20saya%20tertarik%20konsultasi%20dan%20kerja%20sama%20pengembangan%20sistem%20aplikasi';
  const mailtoUrl = `mailto:${email}?subject=Konsultasi%20Pengembangan%20Sistem%20Aplikasi`;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-surface border border-border p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-2 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Developer Card Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="relative shrink-0">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 p-1 shadow-xl">
              <div className="h-full w-full rounded-[22px] bg-slate-950 flex items-center justify-center text-white">
                <Code2 className="h-10 w-10 text-amber-400" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-slate-950 shadow-md">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[11px] font-bold">
              <span>Lead Software Architect & Engineer</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display text-text">
              Prasetyo Handy Kurniawan
            </h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Full-Stack Application Architect • Cloud Systems & Automation Specialist
            </p>
          </div>
        </div>

        {/* Dedicated Purpose Statement */}
        <div className="p-4 rounded-2xl bg-surface-2 border border-border text-xs leading-relaxed text-text space-y-2">
          <p className="font-semibold text-amber-500 flex items-center gap-1.5">
            <Award className="h-4 w-4" />
            <span>Tentang Aplikasi Perpustakaan Digital SBTH:</span>
          </p>
          <p className="text-text-muted">
            Aplikasi ini dirancang khusus untuk mempermudah operasional perpustakaan KB-TK Bhakti Tunas Harapan (SBTH) Magelang dengan alur kerja minim ketik, scan barcode fisik, sirkulasi otomatis, dan pencatatan akuntabilitas sekolah.
          </p>
        </div>

        {/* Promotional / Cooperation Invitation */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-amber-500/10 to-transparent border border-emerald-500/30 text-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-500 font-bold">
            <Sparkles className="h-4 w-4" />
            <span>Konsultasi & Kerja Sama Pengembangan Sistem:</span>
          </div>
          <p className="text-text leading-relaxed">
            Tertarik membangun sistem aplikasi modern, digitalisasi sekolah, perpustakaan cerdas, manajemen inventaris, atau arsitektur web performa tinggi untuk institusi atau bisnis Anda? Silakan hubungi saya melalui jalur resmi di bawah:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* WhatsApp Card */}
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => soundFx.playSuccessChime()}
              className="p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-3 transition shadow-md group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-white/20">
                <Phone className="h-5 w-5" />
              </div>
              <div className="text-left min-w-0">
                <span className="text-[10px] uppercase tracking-wider block text-emerald-100 font-bold">
                  WhatsApp Konsultasi
                </span>
                <span className="text-xs font-bold font-mono truncate block">
                  {whatsappNumber}
                </span>
              </div>
            </a>

            {/* Email Card */}
            <a
              href={mailtoUrl}
              onClick={() => soundFx.playSuccessChime()}
              className="p-3.5 rounded-xl bg-surface border border-border hover:border-amber-500/50 text-text font-semibold flex items-center gap-3 transition shadow-xs group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-amber-500/15 text-amber-500">
                <Mail className="h-5 w-5" />
              </div>
              <div className="text-left min-w-0">
                <span className="text-[10px] uppercase tracking-wider block text-text-muted font-bold">
                  Email Penawaran
                </span>
                <span className="text-xs font-bold font-mono text-amber-500 truncate block">
                  {email}
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* System Capabilities Bullet Points */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-text-muted text-[11px] uppercase tracking-wider">
            Keunggulan Arsitektur Sistem Ini:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-text-muted">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Sirkulasi fisik minim ketik & scan barcode</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Label stiker otomatis (Tom & Jerry 107 & QR)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Template rak dinamis & klasifikasi warna</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Audit stock opname & berita acara resmi</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-border flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            Tutup Profil
          </button>
        </div>
      </div>
    </div>
  );
};
