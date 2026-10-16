'use client';

import React, { useState, useEffect } from 'react';
import { Lock, X, KeyRound, Check, AlertCircle, User } from 'lucide-react';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';
import { Librarian } from '@/types';

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
  const [librarians, setLibrarians] = useState<Librarian[]>([]);
  const [authMode, setAuthMode] = useState<'PIN_QUICK' | 'USERNAME_PASS'>('USERNAME_PASS');
  const [selectedUsername, setSelectedUsername] = useState<string>('ms_kriss');
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const list = libraryStore.getLibrarians();
      setLibrarians(list);
      if (list.length > 0) {
        setSelectedUsername(list[0].username);
      }
      setPin('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPin = pin.trim();

    if (authMode === 'PIN_QUICK') {
      const matched = libraryStore.verifyLibrarianPin(cleanPin);
      if (matched || cleanPin === '1234' || cleanPin.toLowerCase() === 'sbth2026') {
        const activeLib = matched || librarians[0] || {
          id: 'admin',
          name: 'Ms. Kriss (Admin)',
          username: 'ms_kriss',
          role: 'ADMIN' as const,
          pin: cleanPin,
          createdAt: new Date().toISOString(),
        };
        libraryStore.setCurrentLibrarian(activeLib);
        libraryStore.addActivityLog({
          category: 'AUTH',
          action: 'LOGIN_PUSTAKAWAN',
          actor: activeLib.name,
          details: `Pustakawan ${activeLib.name} (@${activeLib.username}) berhasil masuk ke Meja Pustakawan via PIN cepat.`,
        });

        soundFx.playSuccessChime();
        setPin('');
        onSuccess();
        return;
      }
    } else {
      const authenticated = libraryStore.authenticateLibrarian(selectedUsername, cleanPin);
      if (authenticated || cleanPin === '1234' || cleanPin.toLowerCase() === 'sbth2026') {
        const activeLib = authenticated || librarians.find((l) => l.username === selectedUsername) || librarians[0];
        if (activeLib) {
          libraryStore.setCurrentLibrarian(activeLib);
          libraryStore.addActivityLog({
            category: 'AUTH',
            action: 'LOGIN_PUSTAKAWAN',
            actor: activeLib.name,
            details: `Pustakawan ${activeLib.name} (@${activeLib.username}) berhasil masuk ke Meja Pustakawan via username & password.`,
          });
        }

        soundFx.playSuccessChime();
        setPin('');
        onSuccess();
        return;
      }
    }

    soundFx.playErrorBeep();
    setErrorMsg(
      authMode === 'USERNAME_PASS'
        ? `Password/PIN untuk @${selectedUsername} belum sesuai.`
        : 'PIN salah. Coba 1234 atau sbth2026.'
    );
    setPin('');
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

  const handleQuickFill = (user: string, code: string) => {
    setSelectedUsername(user);
    setPin(code);
    soundFx.playScanBeep();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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
            Masuk untuk membuka sirkulasi, manajemen eksemplar, dan pencatatan buku
          </p>
        </div>

        {/* Tab switch: Username & PIN vs PIN Cepat Touchscreen */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('USERNAME_PASS');
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
              authMode === 'USERNAME_PASS'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Username & PIN
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('PIN_QUICK');
              setErrorMsg('');
            }}
            className={`flex-1 py-1.5 rounded-lg transition cursor-pointer ${
              authMode === 'PIN_QUICK'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Keypad Layar Sentuh
          </button>
        </div>

        <form onSubmit={handleVerify} className="space-y-3">
          {authMode === 'USERNAME_PASS' ? (
            <div className="space-y-2.5 text-left">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                  <User className="h-3.5 w-3.5 text-blue-500" />
                  <span>Pilih Akun Pustakawan:</span>
                </label>
                <select
                  value={selectedUsername}
                  onChange={(e) => setSelectedUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 outline-hidden focus:border-blue-600"
                >
                  {librarians.map((lib) => (
                    <option key={lib.id} value={lib.username}>
                      {lib.name} (@{lib.username}) • {lib.role}
                    </option>
                  ))}
                  <option value="ms_kriss">Ms. Kriss (Pustakawan Utama) • ADMIN</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  PIN / Password Pustakawan:
                </label>
                <input
                  type="password"
                  autoFocus
                  maxLength={24}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Ketik PIN (1234 atau sbth2026)..."
                  className="w-full text-center tracking-[0.2em] text-lg font-bold rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 outline-hidden focus:border-blue-600"
                />
              </div>
            </div>
          ) : (
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
          )}

          {errorMsg && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-semibold animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick 1-Click Fill Chips */}
          <div className="flex items-center justify-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => handleQuickFill('ms_kriss', '1234')}
              className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[11px] font-bold transition cursor-pointer"
            >
              ⚡ PIN Cepat: 1234
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('ms_kriss', 'sbth2026')}
              className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-[11px] font-bold transition cursor-pointer"
            >
              🔑 Master: @ms_kriss / sbth2026
            </button>
          </div>

          {/* Quick Numpad for Touchscreen / Tablet */}
          {authMode === 'PIN_QUICK' && (
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
                  className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm text-slate-700 dark:text-slate-200 transition active:scale-95 cursor-pointer"
                >
                  {k}
                </button>
              ))}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <KeyRound className="h-4 w-4" />
            Buka Mode Pustakawan
          </button>
        </form>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 text-left">
          <p className="font-semibold text-slate-700 dark:text-slate-200">ℹ️ Informasi Akses:</p>
          <p>• <strong>Username:</strong> @ms_kriss (Pustakawan Utama / Admin)</p>
          <p>• <strong>PIN:</strong> 1234 atau <strong>sbth2026</strong></p>
          <p className="text-[10px] text-slate-400 pt-0.5">Pengaturan sistem dilindungi khusus dengan verifikasi Akun Admin.</p>
        </div>
      </div>
    </div>
  );
};
