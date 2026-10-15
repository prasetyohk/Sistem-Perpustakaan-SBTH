'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  School,
  UserCheck,
  User,
  Phone,
  MapPin,
  Save,
  CheckCircle2,
  DollarSign,
  QrCode,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { SchoolProfile } from '@/types';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';

interface SchoolProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const SchoolProfileModal: React.FC<SchoolProfileModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [profile, setProfile] = useState<SchoolProfile>(libraryStore.getSchoolProfile());
  const [financeEnabled, setFinanceEnabled] = useState<boolean>(
    libraryStore.getFinanceModuleEnabled()
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setProfile(libraryStore.getSchoolProfile());
      setFinanceEnabled(libraryStore.getFinanceModuleEnabled());
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    libraryStore.saveSchoolProfile({
      ...profile,
      enableFinanceModule: financeEnabled,
    });
    libraryStore.setFinanceModuleEnabled(financeEnabled);
    libraryStore.addActivityLog({
      category: 'SYSTEM',
      action: 'UPDATE_PROFIL_SEKOLAH',
      actor: profile.librarianName || 'Pustakawan',
      details: `Memperbarui profil sekolah & pejabat penandatangan: ${profile.headmasterName || 'Kepala Sekolah'} & ${profile.librarianName || 'Pustakawan'}. Status Kas/Denda: ${financeEnabled ? 'AKTIF' : 'NONAKTIF'}.`,
    });

    soundFx.playSuccessChime();
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onSaved?.();
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-surface border border-border p-6 shadow-2xl space-y-6 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <School className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text">
                Pengaturan Profil Sekolah & Pejabat
              </h2>
              <p className="text-xs text-text-muted">
                Atur nama Kepala Sekolah, Pustakawan, kop laporan, dan opsi aktivasi denda/QRIS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-text-muted hover:bg-surface-2 hover:text-text transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-5">
          {/* Section 1: Pejabat Penandatangan Laporan Resmi */}
          <div className="p-4 rounded-2xl bg-surface-2/60 border border-border space-y-3">
            <h3 className="text-xs font-bold text-amber-500 flex items-center gap-1.5 uppercase tracking-wider">
              <UserCheck className="h-4 w-4" />
              Pejabat Penandatangan (Berita Acara & Laporan Aset)
            </h3>
            <p className="text-[11px] text-text-muted">
              Nama yang diisi di sini akan otomatis tercetak pada seluruh dokumen resmi, Berita Acara Rekapitulasi Aset, dan Stock Opname perpustakaan.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Nama Kepala Sekolah:
                </label>
                <input
                  type="text"
                  value={profile.headmasterName || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, headmasterName: e.target.value })
                  }
                  placeholder="Contoh: Dra. Siti Rahmawati, M.Pd."
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs text-text outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  NIP / NUPTK Kepala Sekolah:
                </label>
                <input
                  type="text"
                  value={profile.headmasterNip || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, headmasterNip: e.target.value })
                  }
                  placeholder="NIP. 19780512 200312 2 001"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs text-text font-mono outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Nama Pustakawan / Petugas:
                </label>
                <input
                  type="text"
                  value={profile.librarianName || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, librarianName: e.target.value })
                  }
                  placeholder="Contoh: Pustakawan KB-TK SBTH"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs text-text outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Jabatan / Unit Pustakawan:
                </label>
                <input
                  type="text"
                  value={profile.librarianNip || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, librarianNip: e.target.value })
                  }
                  placeholder="Perpustakaan SBTH Magelang"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs text-text outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Saklar ON/OFF Modul Denda & QRIS */}
          <div className="p-4 rounded-2xl bg-surface-2/60 border border-border space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    financeEnabled
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text">
                    Fitur Denda Keterlambatan & Pembayaran QRIS
                  </h4>
                  <p className="text-[11px] text-text-muted">
                    {financeEnabled
                      ? 'Status: AKTIF (Denda dihitung, menu Kas/Denda & QRIS muncul di portal siswa)'
                      : 'Status: NONAKTIF (Sekolah bebas denda, seluruh menu denda & QRIS disembunyikan)'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFinanceEnabled(!financeEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  financeEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    financeEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 3: Data Sekolah & Kop Laporan */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Nama Resmi Sekolah:
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-xs text-text outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Semboyan / Tagline Sekolah:
              </label>
              <input
                type="text"
                value={profile.tagline}
                onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-xs text-text outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">
                Alamat Lengkap Sekolah:
              </label>
              <textarea
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                rows={2}
                className="w-full px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-xs text-text outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Kontak Telepon / WhatsApp:
                </label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-xs text-text outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text mb-1">
                  Instagram Sekolah:
                </label>
                <input
                  type="text"
                  value={profile.instagram || ''}
                  onChange={(e) =>
                    setProfile({ ...profile, instagram: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-xs text-text outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:bg-surface-2 hover:text-text transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaved}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-slate-950" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
