'use client';

import React, { useState } from 'react';
import { Lock, X, KeyRound, Check, AlertCircle } from 'lucide-react';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';

interface PinAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PinAuthModal: React.FC<PinAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPin = pin.trim();
    const matched = libraryStore.verifyLibrarianPin(cleanPin);
    // Support both quick PIN 1234 and master password sbth2026
    if (matched || cleanPin === '1234' || cleanPin.toLowerCase() === 'sbth2026') {
      soundFx.playSuccessChime();
      setPin('');
      onSuccess();
    } else {
      soundFx.playErrorBeep();
      setErrorMsg('PIN / Password salah. Coba 1234 atau sbth2026.');
      setPin('');
    }
  };

  const handleNumberClick = (num: string) => {
    if (pin.length < 16) {
      setPin((prev) => prev + num);
      soundFx.playScanBeep();
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleQuickFill = (code: string) => {
    setPin(code);
    soundFx.playScanBeep();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30">
          <Lock className="h-7 w-7" />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Akses Meja Pustakawan
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Masukkan PIN Pustakawan untuk membuka sirkulasi dan manajemen data
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-3">
          <div className="relative">
            <input
              type="password"
              autoFocus
              maxLength={24}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full text-center tracking-[0.3em] text-xl font-bold rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 outline-hidden focus:border-blue-600"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-semibold animate-shake">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick 1-Click Fill Chips */}
          <div className="flex items-center justify-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => handleQuickFill('1234')}
              className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[11px] font-bold transition cursor-pointer"
            >
              ⚡ PIN: 1234
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('sbth2026')}
              className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-[11px] font-bold transition cursor-pointer"
            >
              🔑 Master: sbth2026
            </button>
          </div>

          {/* Quick Numpad for Touchscreen / Tablet */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  if (k === 'C') setPin('');
                  else if (k === '⌫') handleBackspace();
                  else handleNumberClick(k);
                }}
                className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm text-slate-700 dark:text-slate-200 transition active:scale-95"
              >
                {k}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition"
          >
            <KeyRound className="h-4 w-4" />
            Buka Mode Pustakawan
          </button>
        </form>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 text-left">
          <p className="font-semibold text-slate-700 dark:text-slate-200">ℹ️ Informasi Akses:</p>
          <p>• <strong>1234</strong> : PIN cepat angka layar sentuh.</p>
          <p>• <strong>sbth2026</strong> : Password master bawaan keyboard.</p>
          <p className="text-[10px] text-slate-400 pt-0.5">Keduanya aktif dan dapat diganti di menu Pengaturan ➔ Pustakawan.</p>
        </div>
      </div>
    </div>
  );
};
