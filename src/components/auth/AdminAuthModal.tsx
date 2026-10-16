'use client';

import React, { useState } from 'react';
import { ShieldCheck, X, KeyRound, AlertCircle, UserCheck } from 'lucide-react';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState<string>('ms_kriss');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    const isAdmin = libraryStore.verifyAdminAccess(cleanUser, cleanPass);

    if (isAdmin) {
      soundFx.playSuccessChime();
      setPassword('');
      onSuccess();
    } else {
      soundFx.playErrorBeep();
      setErrorMsg('Akses ditolak. Username atau Password Administrator salah.');
      setPassword('');
    }
  };

  const handleQuickFillAdmin = () => {
    setUsername('ms_kriss');
    setPassword('sbth2026');
    soundFx.playScanBeep();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-surface border-2 border-amber-500/40 shadow-2xl p-6 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-text-muted hover:bg-surface-2 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-text">
              Verifikasi Administrator Perpustakaan
            </h3>
            <p className="text-xs text-text-muted">
              Pengaturan Sistem berisi konfigurasi kritis (Aturan Pinjam, Format SLiMS, Reset Database).
            </p>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-3 pt-2">
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-text">
              Username Administrator:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@ms_kriss"
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-medium text-text placeholder-text-muted outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-text">
              Password / PIN Admin:
            </label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password admin (sbth2026)..."
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-medium text-text placeholder-text-muted outline-hidden focus:ring-1 focus:ring-amber-500 font-mono tracking-wider"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick chip for developer/owner convenience */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleQuickFillAdmin}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[11px] font-bold transition cursor-pointer"
            >
              ⚡ Isi Akun Admin (@ms_kriss / sbth2026)
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text text-xs font-semibold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <KeyRound className="h-4 w-4" />
              Buka Pengaturan
            </button>
          </div>
        </form>

        <div className="p-3 rounded-xl bg-surface-2 border border-border text-[11px] text-text-muted space-y-1 text-left">
          <p className="font-semibold text-text">ℹ️ Hak Akses Admin:</p>
          <p>
            Akun bawaan: <strong>@ms_kriss</strong> • Password: <strong>sbth2026</strong>. Anda dapat mengubah password atau menambah admin lain di menu Pengaturan ➔ Tab Pustakawan.
          </p>
        </div>
      </div>
    </div>
  );
};
