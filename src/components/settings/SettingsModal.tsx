'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  School,
  Users,
  Bell,
  Upload,
  ShieldCheck,
  Key,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  UserPlus,
  Tags,
  Download,
  Plus,
  Globe,
  Save,
  Wallet,
} from 'lucide-react';
import {
  SchoolProfile,
  Librarian,
  ReminderSchedule,
  StaffRole,
  ReminderDay,
  ReminderChannel,
  Category,
} from '@/types';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';
import * as XLSX from 'xlsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'SCHOOL' | 'LIBRARIANS' | 'REMINDERS' | 'CATEGORIES'>('SCHOOL');
  const [toastMessage, setToastMessage] = useState<string>('');

  // School Profile state
  const [profile, setProfile] = useState<SchoolProfile>(libraryStore.getSchoolProfile());
  const [logoPreview, setLogoPreview] = useState<string>(profile.logoUrl);

  // Librarians state
  const [librarians, setLibrarians] = useState<Librarian[]>(libraryStore.getLibrarians());
  const [newLibName, setNewLibName] = useState<string>('');
  const [newLibUsername, setNewLibUsername] = useState<string>('');
  const [newLibRole, setNewLibRole] = useState<StaffRole>('LIBRARIAN');
  const [newLibPin, setNewLibPin] = useState<string>('');
  const [newLibPhone, setNewLibPhone] = useState<string>('');
  const [isAddLibOpen, setIsAddLibOpen] = useState<boolean>(false);

  // Categories state
  const [categories, setCategories] = useState<Category[]>(libraryStore.getCategories());
  const [isAddCatOpen, setIsAddCatOpen] = useState<boolean>(false);
  const [catName, setCatName] = useState<string>('');
  const [catShort, setCatShort] = useState<string>('');
  const [catColor, setCatColor] = useState<string>('#10B981');
  const [catShelf, setCatShelf] = useState<string>('');
  const [catDesc, setCatDesc] = useState<string>('');
  const [catIcon, setCatIcon] = useState<string>('Star');

  // Reminders state
  const [schedule, setSchedule] = useState<ReminderSchedule>(libraryStore.getReminderSchedule());

  useEffect(() => {
    if (isOpen) {
      const p = libraryStore.getSchoolProfile();
      setProfile(p);
      setLogoPreview(p.logoUrl);
      setLibrarians(libraryStore.getLibrarians());
      setSchedule(libraryStore.getReminderSchedule());
      setCategories(libraryStore.getCategories());
      setToastMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Handle Logo Upload (Base64 file reader)
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file logo maksimal 2 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setLogoPreview(result);
        setProfile((prev) => ({ ...prev, logoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...profile,
      logoUrl: logoPreview,
    };
    libraryStore.saveSchoolProfile(updated);
    if (updated.enableFinanceModule !== undefined) {
      libraryStore.setFinanceModuleEnabled(updated.enableFinanceModule);
    }
    soundFx.playSuccessChime();
    showToast('✓ Profil, Tanda Tangan & Konfigurasi Sekolah berhasil disimpan!');
    if (onProfileUpdated) onProfileUpdated();
  };

  const handleAddLibrarian = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLibName || !newLibUsername || !newLibPin) {
      alert('Lengkapi nama, username, dan PIN/password pustakawan.');
      return;
    }

    const created = libraryStore.addLibrarian({
      name: newLibName.trim(),
      username: newLibUsername.trim().toLowerCase(),
      role: newLibRole,
      pin: newLibPin.trim(),
      phone: newLibPhone.trim(),
    });

    setLibrarians(libraryStore.getLibrarians());
    setIsAddLibOpen(false);
    setNewLibName('');
    setNewLibUsername('');
    setNewLibPin('');
    setNewLibPhone('');
    soundFx.playSuccessChime();
    showToast(`✓ Pustakawan ${created.name} berhasil ditambahkan! PIN: ${created.pin}`);
  };

  const handleDeleteLibrarian = (id: string, name: string) => {
    try {
      if (librarians.length <= 1) {
        alert('Minimal harus ada 1 akun pustakawan / admin di sistem.');
        return;
      }
      const target = librarians.find((l) => l.id === id);
      if (target?.username === 'ms_kriss') {
        const otherAdmin = librarians.some((l) => l.id !== id && l.role === 'ADMIN');
        if (!otherAdmin) {
          alert('Akun Admin Utama "Ms. Kriss" tidak dapat dihapus agar sistem tidak terkunci.');
          return;
        }
      }
      if (confirm(`Yakin ingin menghapus akun pustakawan "${name}"?`)) {
        libraryStore.deleteLibrarian(id);
        setLibrarians(libraryStore.getLibrarians());
        soundFx.playScanBeep();
        showToast(`Pustakawan ${name} telah dihapus.`);
      }
    } catch (err) {
      console.error('Error deleting librarian:', err);
      alert('Terjadi kesalahan saat menghapus akun pustakawan.');
    }
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    libraryStore.saveReminderSchedule(schedule);
    soundFx.playSuccessChime();
    showToast('✓ Jadwal pengingat rutin berhasil disimpan!');
  };

  // Category handlers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      alert('Nama kategori wajib diisi.');
      return;
    }
    const created = libraryStore.addCategory({
      name: catName.trim(),
      shortName: catShort.trim() || catName.trim().slice(0, 10).toUpperCase(),
      colorHex: catColor,
      shelfLocation: catShelf.trim() || `Rak ${catShort.trim() || 'Umum'}`,
      description: catDesc.trim(),
      iconName: catIcon,
    });
    setCategories(libraryStore.getCategories());
    setIsAddCatOpen(false);
    setCatName('');
    setCatShort('');
    setCatShelf('');
    setCatDesc('');
    soundFx.playSuccessChime();
    showToast(`✓ Kategori "${created.name}" berhasil ditambahkan!`);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (categories.length <= 1) {
      alert('Minimal harus tersisa 1 kategori di perpustakaan.');
      return;
    }
    if (confirm(`Hapus kategori "${name}"? Buku yang berkategori ini akan tetap ada di katalog.`)) {
      libraryStore.deleteCategory(id);
      setCategories(libraryStore.getCategories());
      soundFx.playScanBeep();
      showToast(`Kategori ${name} telah dihapus.`);
    }
  };

  const handleExportCategoryExcel = () => {
    const wb = libraryStore.exportCategoriesWorkbook();
    XLSX.writeFile(wb, `Master_Kategori_Perpus_SBTH.xlsx`);
    soundFx.playSuccessChime();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-surface border-l border-border h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* 1. Neutral Header */}
        <div className="flex items-center justify-between border-b border-border p-5 bg-surface shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 border border-border shrink-0 shadow-2xs">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display text-text">
                  Pengaturan Perpustakaan SBTH
                </h2>
                <span className="bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Konfigurasi Sistem
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Profil sekolah, akun pustakawan, pengingat rutin, dan master kategori buku
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-text-muted hover:text-text hover:bg-surface-2 transition"
            title="Tutup Panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 font-semibold text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 2. Main Layout: Vertical Navigation on Left + Content on Right */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Vertical Navigation Bar on Left */}
          <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-border bg-surface-2/40 p-3 space-y-1 shrink-0 overflow-x-auto md:overflow-visible flex md:flex-col">
            {[
              { id: 'SCHOOL', label: 'Profil Sekolah', icon: School, desc: 'Nama, Logo & Kontak' },
              { id: 'LIBRARIANS', label: 'Pustakawan', icon: Users, desc: 'Akun & PIN Akses' },
              { id: 'REMINDERS', label: 'Pengingat Rutin', icon: Bell, desc: 'Jadwal WA & Telegram' },
              { id: 'CATEGORIES', label: 'Kategori Rak', icon: Tags, desc: 'Rak & Topik Buku' },
            ].map((nav) => {
              const Icon = nav.icon;
              const isActive = activeTab === nav.id;

              return (
                <button
                  key={nav.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(nav.id as any);
                    soundFx.playScanBeep();
                  }}
                  className={`w-full p-3 rounded-xl text-left transition flex items-center gap-3 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-text-muted hover:text-text hover:bg-surface'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-500'}`} />
                  <div className="min-w-0">
                    <div className="text-xs truncate">{nav.label}</div>
                    <div
                      className={`text-[10px] truncate hidden md:block ${
                        isActive ? 'text-slate-900/80' : 'text-text-muted/70'
                      }`}
                    >
                      {nav.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Content Area (Scrollable 2-Column Form with 44px Inputs) */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            
            {/* TAB 1: PROFIL SEKOLAH */}
            {activeTab === 'SCHOOL' && (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold font-display text-text">
                    Identitas Resmi Sekolah & Perpustakaan
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Nama dan logo ini otomatis dicantumkan di header aplikasi dan kop cetak laporan
                  </p>
                </div>

                {/* Logo Upload Box */}
                <div className="p-4 rounded-2xl bg-surface-2 border border-border flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl border border-border bg-surface p-1.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                    <img
                      src={logoPreview || '/logo_sbth.png'}
                      alt="Logo Sekolah"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="space-y-1.5 flex-1 text-center sm:text-left">
                    <span className="text-xs font-semibold text-text block">
                      Ganti Logo Sekolah (.png / .jpg)
                    </span>
                    <p className="text-[11px] text-text-muted">
                      Rekomendasi rasio 1:1 transparan PNG, maksimal ukuran 2 MB.
                    </p>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-surface-2 text-text text-xs font-semibold cursor-pointer transition">
                      <Upload className="h-3.5 w-3.5 text-amber-500" />
                      <span>Pilih File Gambar</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* 2-Column Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">
                      Nama Lengkap Lembaga:
                    </label>
                    <input
                      type="text"
                      required
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full h-11 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-[10px] text-text-muted mt-1 block">Contoh: KB-TK Bhakti Tunas Harapan (SBTH)</span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">
                      Slogan / Motto Sekolah:
                    </label>
                    <input
                      type="text"
                      required
                      value={profile.tagline}
                      onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                      className="w-full h-11 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-[10px] text-text-muted mt-1 block">"Be Smart, Be Kind" • 好好学习，天天向上</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Alamat Lengkap Sekolah:
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full h-11 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-text-muted mt-1 block">Jl. Jendral Sudirman No. 68A, Magelang Selatan, Kota Magelang</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">
                      Nomor WhatsApp Sekolah / Pustakawan:
                    </label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full h-11 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-[10px] text-text-muted mt-1 block">0815-7773-256 (Ms. Kriss)</span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">
                      Akun Instagram:
                    </label>
                    <input
                      type="text"
                      value={profile.instagram}
                      onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                      className="w-full h-11 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                    <span className="text-[10px] text-text-muted mt-1 block">@sbth.kbtk</span>
                  </div>
                </div>

                {/* Editable Penandatangan Laporan / Berita Acara Resmi */}
                <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-text flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <span>Pejabat Penandatangan Laporan & Berita Acara</span>
                    </h4>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      Nama dan NIP/NIK ini otomatis dicantumkan pada Berita Acara Stock Opname, Laporan Sirkulasi, dan Sertifikat Donatur
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-text block mb-1">
                        Nama Kepala Sekolah:
                      </label>
                      <input
                        type="text"
                        required
                        value={profile.headmasterName || ''}
                        onChange={(e) => setProfile({ ...profile, headmasterName: e.target.value })}
                        placeholder="Contoh: Kepala Sekolah KB-TK SBTH"
                        className="w-full h-11 rounded-xl border border-border bg-surface px-3 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text block mb-1">
                        NIP / Identitas Kepala Sekolah:
                      </label>
                      <input
                        type="text"
                        value={profile.headmasterNip || ''}
                        onChange={(e) => setProfile({ ...profile, headmasterNip: e.target.value })}
                        placeholder="Contoh: - atau NIP. 1980xxxx"
                        className="w-full h-11 rounded-xl border border-border bg-surface px-3 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text block mb-1">
                        Nama Penanggung Jawab Perpustakaan:
                      </label>
                      <input
                        type="text"
                        required
                        value={profile.librarianName || ''}
                        onChange={(e) => setProfile({ ...profile, librarianName: e.target.value })}
                        placeholder="Contoh: Pustakawan KB-TK SBTH"
                        className="w-full h-11 rounded-xl border border-border bg-surface px-3 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-text block mb-1">
                        NIP / Identitas Pustakawan:
                      </label>
                      <input
                        type="text"
                        value={profile.librarianNip || ''}
                        onChange={(e) => setProfile({ ...profile, librarianNip: e.target.value })}
                        placeholder="Contoh: - atau Perpustakaan SBTH"
                        className="w-full h-11 rounded-xl border border-border bg-surface px-3 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Feature Toggle: Modul Kas & Denda */}
                <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-text flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-amber-500" />
                        <span>Modul Kas & Denda Perpustakaan</span>
                      </h4>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Opsional sekolah: Aktifkan atau nonaktifkan sistem kas, denda & pembayaran QRIS
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.enableFinanceModule ?? true}
                        onChange={(e) =>
                          setProfile({ ...profile, enableFinanceModule: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 border border-border"></div>
                    </label>
                  </div>
                  <p className="text-[10px] text-text-muted/80">
                    💡 <em>Catatan:</em> Jika toggle ini dimatikan (OFF), tombol dan menu Kas & Denda akan disembunyikan sepenuhnya dari aplikasi agar operasional berjalan bebas tanpa sistem denda uang.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-2 transition active:scale-95"
                  >
                    <Save className="h-4 w-4" />
                    <span>Simpan Perubahan Profil</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: PUSTAKAWAN */}
            {activeTab === 'LIBRARIANS' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold font-display text-text">
                      Kelola Pustakawan & Kunci PIN Akses
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Pustakawan dapat mengakses meja sirkulasi, manajemen eksemplar, dan kas
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddLibOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-1.5 transition active:scale-95"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Tambah Pustakawan</span>
                  </button>
                </div>

                <div className="divide-y divide-border border border-border rounded-2xl bg-surface overflow-hidden">
                  {librarians.map((lib) => (
                    <div key={lib.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold text-xs">
                          {lib.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-text">{lib.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-2 text-text-muted font-mono">
                              {lib.role}
                            </span>
                          </div>
                          <span className="text-[11px] text-text-muted font-mono">
                            Username: @{lib.username} • PIN: {lib.pin}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteLibrarian(lib.id, lib.name)}
                        className="p-1.5 text-text-muted hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition"
                        title="Hapus akun"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PENGINGAT RUTIN */}
            {activeTab === 'REMINDERS' && (
              <form onSubmit={handleSaveReminder} className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold font-display text-text">
                    Jadwal Pengingat Rutin Sirkulasi Buku
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Kirim ringkasan buku jatuh tempo secara otomatis ke grup WA wali murid atau bot Telegram
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">
                      Hari Pengingat Rutin:
                    </label>
                    <select
                      value={schedule.dayOfWeek}
                      onChange={(e) => setSchedule({ ...schedule, dayOfWeek: e.target.value as any })}
                      className="w-full h-11 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden"
                    >
                      <option value="SENIN">Setiap Senin</option>
                      <option value="KAMIS">Setiap Kamis</option>
                      <option value="JUMAT">Setiap Jumat</option>
                      <option value="SABTU">Setiap Sabtu</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">
                      Jam Pengiriman (WIB):
                    </label>
                    <input
                      type="time"
                      value={schedule.timeStr}
                      onChange={(e) => setSchedule({ ...schedule, timeStr: e.target.value })}
                      className="w-full h-11 rounded-xl border border-border bg-surface-2 px-3 text-xs font-bold text-text outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Saluran Notifikasi:
                  </label>
                  <select
                    value={schedule.targetChannel}
                    onChange={(e) => setSchedule({ ...schedule, targetChannel: e.target.value as any })}
                    className="w-full h-11 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden"
                  >
                    <option value="WHATSAPP">WhatsApp Broadcast Orang Tua</option>
                    <option value="TELEGRAM">Telegram Bot Perpustakaan</option>
                    <option value="BOTH">Keduanya (WhatsApp & Telegram)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-2 transition active:scale-95"
                  >
                    <Save className="h-4 w-4" />
                    <span>Simpan Jadwal Pengingat</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 4: KATEGORI RAK */}
            {activeTab === 'CATEGORIES' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold font-display text-text">
                      Master Kategori & Lokasi Rak Buku
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Sesuaikan kode warna, nama rak, dan topik cerita buku
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportCategoryExcel}
                      className="px-3 py-1.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text font-semibold text-xs flex items-center gap-1.5 transition"
                    >
                      <Download className="h-3.5 w-3.5 text-text-muted" />
                      <span>Ekspor Excel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddCatOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah Kategori</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-3.5 rounded-2xl bg-surface border border-border flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ backgroundColor: `${cat.colorHex}25`, color: cat.colorHex }}
                        >
                          {cat.shortName.slice(0, 3)}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-text">{cat.name}</h4>
                          <span className="text-[11px] text-text-muted block">
                            📍 {cat.shelfLocation}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 text-text-muted hover:text-rose-500 rounded-lg transition"
                        title="Hapus kategori"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Sticky Drawer Footer */}
        <div className="p-4 border-t border-border bg-surface flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-2 transition"
          >
            Tutup Panel
          </button>

          <span className="text-[11px] text-text-muted">
            Konfigurasi langsung disimpan ke local storage browser
          </span>
        </div>
      </div>

      {/* Add Librarian Sub-Modal */}
      {isAddLibOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-surface border border-border p-6 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-text">Tambah Akun Pustakawan</h4>
            <form onSubmit={handleAddLibrarian} className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Nama Pustakawan:</label>
                <input
                  type="text"
                  required
                  value={newLibName}
                  onChange={(e) => setNewLibName(e.target.value)}
                  placeholder="Ms. Kriss"
                  className="w-full h-10 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Username Login:</label>
                <input
                  type="text"
                  required
                  value={newLibUsername}
                  onChange={(e) => setNewLibUsername(e.target.value)}
                  placeholder="kriss"
                  className="w-full h-10 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text block mb-1">PIN / Password (4-6 angka):</label>
                <input
                  type="password"
                  required
                  value={newLibPin}
                  onChange={(e) => setNewLibPin(e.target.value)}
                  placeholder="1234"
                  className="w-full h-10 rounded-xl border border-border bg-surface-2 px-3 text-xs font-mono text-text outline-hidden"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddLibOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-text-muted hover:bg-surface-2 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Sub-Modal */}
      {isAddCatOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-surface border border-border p-6 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-text">Tambah Kategori Rak Buku</h4>
            <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Nama Kategori:</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Dongeng Fabel & Cerita"
                  className="w-full h-10 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Label Singkat (Badge):</label>
                <input
                  type="text"
                  value={catShort}
                  onChange={(e) => setCatShort(e.target.value)}
                  placeholder="DONGENG"
                  className="w-full h-10 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Lokasi Rak:</label>
                <input
                  type="text"
                  value={catShelf}
                  onChange={(e) => setCatShelf(e.target.value)}
                  placeholder="Rak Kuning A"
                  className="w-full h-10 rounded-xl border border-border bg-surface-2 px-3 text-xs text-text outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Warna Aksen:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={catColor}
                    onChange={(e) => setCatColor(e.target.value)}
                    className="h-10 w-14 rounded-xl border border-border cursor-pointer bg-surface p-1"
                  />
                  <span className="font-mono text-xs text-text-muted">{catColor}</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddCatOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-text-muted hover:bg-surface-2 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
