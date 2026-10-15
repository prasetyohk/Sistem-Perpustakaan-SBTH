'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Heart,
  Clock,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  QrCode,
  LogOut,
  Search,
  Calendar,
  Phone,
  Bookmark,
  Share2,
  ExternalLink,
  Lock,
  User,
  Star,
  Leaf,
  Layers,
  Plus,
  Key,
  Trash2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Member, Book, Loan, LoanRules } from '@/types';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';
import { SmartBookCover } from '@/components/common/SmartBookCover';

interface StudentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBookForWishlist?: (book: Book) => void;
}

export const StudentPortalModal: React.FC<StudentPortalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Portal tabs
  const [activeTab, setActiveTab] = useState<'WISHLIST' | 'ACTIVE_LOANS' | 'HISTORY' | 'FINES' | 'CATALOG'>('WISHLIST');
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogCategory, setCatalogCategory] = useState<string>('ALL');

  // Self-service modals
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [resetIdentifier, setResetIdentifier] = useState<string>('');
  const [resetResult, setResetResult] = useState<{
    newPassword: string;
    parentPhone: string;
    memberName: string;
    waUrl: string;
  } | null>(null);

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);
  const [newPasswordVal, setNewPasswordVal] = useState<string>('');
  const [changePasswordMsg, setChangePasswordMsg] = useState<string>('');

  const [isCloseAccountOpen, setIsCloseAccountOpen] = useState<boolean>(false);
  const [closeAccountError, setCloseAccountError] = useState<string>('');

  // Rules and data
  const [rules, setRules] = useState<LoanRules>(libraryStore.getLoanRules());
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState(libraryStore.getCategories());

  useEffect(() => {
    if (isOpen) {
      const session = libraryStore.getActiveStudentSession();
      setCurrentUser(session);
      setRules(libraryStore.getLoanRules());
      setAllBooks(libraryStore.getBooks());
      setCategories(libraryStore.getCategories());
      setLoginError('');
      setResetResult(null);
      setChangePasswordMsg('');
      setCloseAccountError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const user = libraryStore.studentLogin(usernameInput, passwordInput);
    if (user) {
      setCurrentUser(user);
      soundFx.playSuccessChime();
      setUsernameInput('');
      setPasswordInput('');
    } else {
      soundFx.playErrorBeep();
      setLoginError('Username atau Password belum sesuai. Silakan klik "Lupa Password? Reset Otomatis" untuk mereset.');
    }
  };

  const handleQuickDemoLogin = (username: string) => {
    setUsernameInput(username);
    setPasswordInput('123');
    setLoginError('');
    const user = libraryStore.studentLogin(username, '123');
    if (user) {
      setCurrentUser(user);
      soundFx.playSuccessChime();
    } else {
      // Fallback search
      const allM = libraryStore.getMembers();
      const fallback = allM.find(
        (m) =>
          (m.username || '').toLowerCase() === username.toLowerCase() ||
          m.name.toLowerCase().includes(username.toLowerCase())
      );
      if (fallback) {
        libraryStore.setActiveStudentSession(fallback);
        setCurrentUser(fallback);
        soundFx.playSuccessChime();
      }
    }
  };

  const handleLogout = () => {
    libraryStore.setActiveStudentSession(null);
    setCurrentUser(null);
    soundFx.playScanBeep();
  };

  // Direct Self-Service Password Reset
  const handlePerformReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier.trim()) return;

    const res = libraryStore.directResetStudentPassword(resetIdentifier);
    if (res && res.newPin && res.waUrl) {
      soundFx.playSuccessChime();
      setResetResult({
        newPassword: res.newPin,
        parentPhone: res.parentPhone,
        memberName: res.studentName,
        waUrl: res.waUrl,
      });
    } else {
      soundFx.playErrorBeep();
      alert('Data siswa dengan username/kode/nama tersebut tidak ditemukan.');
    }
  };

  // Self-Service Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (newPasswordVal.trim().length < 3) {
      alert('Password minimal 3 karakter.');
      return;
    }

    const updated = libraryStore.updateStudentPassword(currentUser.id, newPasswordVal.trim());
    if (updated) {
      currentUser.password = newPasswordVal.trim();
      setCurrentUser({ ...currentUser });
      soundFx.playSuccessChime();
      setChangePasswordMsg('✓ Password berhasil diubah!');
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setChangePasswordMsg('');
        setNewPasswordVal('');
      }, 1500);
    }
  };

  // Self-Service Account Closure
  const handleConfirmCloseAccount = () => {
    if (!currentUser) return;
    const res = libraryStore.closeStudentAccount(currentUser.id);

    if (res.success) {
      soundFx.playSuccessChime();
      alert('Akun perpustakaan ananda berhasil dinonaktifkan/ditutup dengan aman. Terima kasih telah menjadi bagian dari keluarga literasi SBTH!');
      setIsCloseAccountOpen(false);
      handleLogout();
    } else {
      soundFx.playErrorBeep();
      setCloseAccountError(res.message);
    }
  };

  const handleToggleWishlist = (bookId: string) => {
    if (!currentUser) return;
    libraryStore.toggleStudentWishlist(currentUser.id, bookId);
    soundFx.playScanBeep();
    setCurrentUser({ ...currentUser });
  };

  const userWishlistIds = currentUser ? libraryStore.getStudentWishlist(currentUser.id) : [];
  const wishlistBooks = allBooks.filter((b) => userWishlistIds.includes(b.id));
  const activeLoans = currentUser ? libraryStore.getStudentActiveLoans(currentUser.id) : [];
  const loanHistory = currentUser ? libraryStore.getStudentLoanHistory(currentUser.id) : [];
  const fineAmount = currentUser ? libraryStore.calculateStudentFineAmount(currentUser.id) : 0;

  const filteredCatalogBooks = allBooks.filter((b) => {
    if (catalogCategory !== 'ALL' && b.categoryId !== catalogCategory) return false;
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      const matchTitle = b.title.toLowerCase().includes(q);
      const matchAuthor = b.author.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-5 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-600/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Portal Mandiri Siswa & Orang Tua (Buku Impian & Riwayat)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                KB-TK Bhakti Tunas Harapan (SBTH) Magelang • &quot;Be Smart, Be Kind&quot;
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1. JIKA BELUM LOGIN: FORM LOGIN + RESET PASSWORD MANDIRI */}
        {!currentUser && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="max-w-md mx-auto space-y-5">
              <div className="text-center space-y-1">
                <span className="inline-block p-3 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 text-2xl mb-1">
                  🎒
                </span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                  Masuk ke Akun Perpustakaan Ananda
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Lihat buku impian yang ingin dipinjam, cek batas waktu buku di rumah, dan riwayat membaca ananda dari HP.
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Username / Kode Anggota Siswa
                  </label>
                  <div className="relative">
                    <User className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: alvaro / SBTH-M-0015"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3 py-2.5 text-xs outline-hidden focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsResetModalOpen(true)}
                      className="text-[11px] text-purple-600 hover:text-purple-700 font-bold hover:underline"
                    >
                      Lupa Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="Password ananda (default: 123)"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3 py-2.5 text-xs outline-hidden focus:border-purple-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  Masuk ke Akun Perpustakaan
                </button>
              </form>

              {/* Quick Demo Login */}
              <div className="pt-2 text-center">
                <span className="text-[11px] font-bold text-slate-400 block mb-2">
                  — Coba Cepat Akun Contoh Siswa (1-Klik) —
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    { user: 'alvaro', label: '👦 Alvaro (TK-A A)' },
                    { user: 'aisyah', label: '👧 Aisyah (TK-A B)' },
                    { user: 'rayyan', label: '👦 Rayyan (TK-B A)' },
                    { user: 'nayla', label: '👧 Nayla (TK-B B)' },
                    { user: 'kenzi', label: '👶 Kenzi (Toddler A)' },
                    { user: 'oliver', label: '🧒 Oliver (Nursery A)' },
                  ].map((s) => (
                    <button
                      key={s.user}
                      type="button"
                      onClick={() => handleQuickDemoLogin(s.user)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Self-service Reset Password direct button */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Lupa Password? Reset Otomatis Langsung ke WhatsApp Ortu (Tanpa Antri)
                </button>
                <p className="text-[10px] text-slate-400">
                  Password baru langsung terkirim ke WhatsApp Ayah/Bunda tanpa perlu menunggu konfirmasi pustakawan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. JIKA SUDAH LOGIN: DASHBOARD MANDIRI SISWA */}
        {currentUser && (
          <div>
            {/* Student Profile Banner */}
            <div className="p-5 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={currentUser.photoUrl}
                  alt={currentUser.name}
                  className="h-14 w-14 rounded-2xl object-cover border-2 border-purple-400 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                      Halo, {currentUser.name}! 👋
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                      {currentUser.classGroup}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Orang Tua/Wali: <strong>{currentUser.parentName || '-'}</strong> ({currentUser.parentPhone || '-'})
                  </p>
                </div>
              </div>

              {/* Action buttons: Change Password, Close Account, Logout */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition hover:bg-slate-100"
                  title="Ubah Password Akun Siswa"
                >
                  <Key className="h-3.5 w-3.5 text-amber-500" />
                  <span>Ubah Password</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCloseAccountError('');
                    setIsCloseAccountOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition hover:bg-rose-100"
                  title="Ajukan Penutupan / Penghapusan Akun"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Tutup Akun</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Keluar
                </button>
              </div>
            </div>

            {/* Portal Tab Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 gap-2 text-xs font-bold overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('WISHLIST')}
                className={`py-2 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
                  activeTab === 'WISHLIST'
                    ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Heart className="h-4 w-4 text-rose-500" />
                🌟 Buku Impianku ({wishlistBooks.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ACTIVE_LOANS')}
                className={`py-2 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
                  activeTab === 'ACTIVE_LOANS'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <BookOpen className="h-4 w-4 text-blue-500" />
                📖 Sedang Kupinjam ({activeLoans.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('HISTORY')}
                className={`py-2 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
                  activeTab === 'HISTORY'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                📜 Sudah Selesai Dibaca ({loanHistory.length})
              </button>
              {libraryStore.getFinanceModuleEnabled() && (
                <button
                  type="button"
                  onClick={() => setActiveTab('FINES')}
                  className={`py-2 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
                    activeTab === 'FINES'
                      ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <QrCode className="h-4 w-4 text-amber-500" />
                  💰 Kas Denda & QRIS {fineAmount > 0 ? `(Rp ${fineAmount.toLocaleString('id-ID')})` : ''}
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab('CATALOG')}
                className={`py-2 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
                  activeTab === 'CATALOG'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Search className="h-4 w-4 text-indigo-500" />
                🔍 Cari & Pilih Buku TK
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-6">
              {/* TAB 1: BUKU IMPIANKU */}
              {activeTab === 'WISHLIST' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Daftar Buku Impian yang Ingin Kupinjam Selanjutnya
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Tandai buku yang ananda sukai agar mudah ditemukan saat datang ke perpustakaan sekolah.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('CATALOG')}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      + Tambah Buku Impian
                    </button>
                  </div>

                  {wishlistBooks.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                      <Heart className="h-10 w-10 text-rose-300 mx-auto" />
                      <p className="text-xs text-slate-500">
                        Belum ada buku impian yang disimpan. Yuk, cari buku dongeng atau sains favorit ananda!
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('CATALOG')}
                        className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                      >
                        Buka Katalog Buku TK
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {wishlistBooks.map((book) => {
                        const cat = categories.find((c) => c.id === book.categoryId);
                        return (
                          <div
                            key={book.id}
                            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex gap-3 items-start relative group"
                          >
                            <div className="h-24 w-16 rounded-xl overflow-hidden shrink-0 shadow-xs">
                              <SmartBookCover
                                title={book.title}
                                author={book.author}
                                coverUrl={book.coverImage}
                                categoryId={book.categoryId}
                                aspectRatio="h-full w-full"
                              />
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <span
                                className="inline-block px-2 py-0.5 rounded-md text-[9px] font-bold text-white truncate max-w-full"
                                style={{ backgroundColor: cat?.colorHex || '#9333ea' }}
                              >
                                {cat?.name || 'Cerita Anak'}
                              </span>
                              <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-2">
                                {book.title}
                              </h5>
                              <p className="text-[10px] text-slate-400 truncate">{book.author}</p>
                              <button
                                type="button"
                                onClick={() => handleToggleWishlist(book.id)}
                                className="text-[10px] text-rose-600 hover:underline font-semibold block pt-1"
                              >
                                Hapus dari Impian
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SEDANG KUPINJAM */}
              {activeTab === 'ACTIVE_LOANS' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Buku yang Sedang Ada di Rumah Ananda
                  </h4>

                  {activeLoans.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                      <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Saat ini ananda tidak sedang meminjam buku dari perpustakaan.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeLoans.flatMap((loan) =>
                        loan.items.filter((item) => !item.returnDate).map((item, idx) => {
                          const isLate = new Date().toISOString().split('T')[0] > loan.dueDate;
                          return (
                            <div
                              key={`${loan.id}-${item.id || idx}`}
                              className={`p-4 rounded-2xl border ${
                                isLate
                                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                                  : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                              } space-y-3`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="text-[10px] font-mono text-slate-400 block">
                                    {item.itemBarcode}
                                  </span>
                                  <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100">
                                    {item.bookTitle}
                                  </h5>
                                </div>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isLate
                                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200'
                                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                  }`}
                                >
                                  {isLate ? '⚠️ Lewat Batas' : 'Sedang Dipinjam'}
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                                <p>Tanggal Pinjam: <strong>{loan.loanDate}</strong></p>
                                <p>Batas Pengembalian: <strong>{loan.dueDate}</strong></p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: RIWAYAT BACA */}
              {activeTab === 'HISTORY' && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Buku-Buku yang Telah Selesai Dibaca Ananda
                  </h4>

                  {loanHistory.length === 0 ? (
                    <div className="p-10 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                      <CheckCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Belum ada riwayat buku yang selesai dibaca.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                      {loanHistory.map((hist, idx) => (
                        <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <div className="flex items-center gap-3">
                            <span className="text-amber-500 text-base">⭐</span>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">
                                {hist.item.bookTitle}
                              </p>
                              <span className="text-[10px] text-slate-400">
                                Dipinjam: {hist.loan.loanDate} • Dikembalikan: {hist.item.returnDate || 'Selesai'}
                              </span>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Sudah Dibaca ✓
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: KAS DENDA & BAYAR QRIS */}
              {activeTab === 'FINES' && libraryStore.getFinanceModuleEnabled() && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="space-y-4">
                      {fineAmount === 0 ? (
                        <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-2">
                          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                          <h4 className="text-base font-extrabold">Tidak Ada Tunggakan Kas Denda!</h4>
                          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                            Ananda selalu tepat waktu mengembalikan buku perpustakaan. Terus pertahankan kedisiplinan membaca ya! ✨
                          </p>
                        </div>
                      ) : (
                        <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-3">
                          <AlertCircle className="h-8 w-8 text-amber-600" />
                          <div>
                            <span className="text-xs uppercase font-bold text-amber-700">Tunggakan Kas Keterlambatan:</span>
                            <h4 className="text-2xl font-black text-rose-600">Rp {fineAmount.toLocaleString('id-ID')}</h4>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            Tarif kas denda: <strong>Rp {rules.finePerDay.toLocaleString('id-ID')}</strong> per hari per buku. Seluruh kas denda 100% dikumpulkan sekolah untuk <strong>membeli buku cerita anak baru</strong>.
                          </p>
                        </div>
                      )}

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                        <span className="font-bold text-slate-700 dark:text-slate-200 block">Cara Pembayaran QRIS:</span>
                        <p className="text-slate-500">1. Buka Mobile Banking / Dompet Digital di HP Papa/Mama.</p>
                        <p className="text-slate-500">2. Scan gambar QRIS resmi di sebelah kanan.</p>
                        <p className="text-slate-500">3. Masukkan nominal dan tunjukkan bukti ke Pustakawan.</p>
                      </div>
                    </div>

                    {/* QRIS Card */}
                    <div className="bg-gradient-to-b from-rose-600 via-rose-700 to-slate-900 p-5 rounded-3xl text-white text-center shadow-lg space-y-3">
                      <div className="border-b border-rose-400/30 pb-2">
                        <span className="text-[9px] uppercase tracking-wider opacity-80">QRIS PERPUSTAKAAN RESMI</span>
                        <h5 className="text-xs font-black">{rules.qrisMerchantName}</h5>
                      </div>
                      <div className="bg-white p-2.5 rounded-2xl mx-auto w-40 h-40 shadow-inner flex items-center justify-center">
                        <img src={rules.qrisImageUrl} alt="QRIS SBTH" className="w-full h-full object-contain" />
                      </div>
                      <p className="text-[10px] text-rose-100">
                        BCA • Mandiri • BRI • BNI • GoPay • OVO • Bank Jateng
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CARI & PILIH BUKU TK */}
              {activeTab === 'CATALOG' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Ketik judul buku atau cerita (misal: Kancil, Dinosaurus)..."
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3 py-2 text-xs outline-hidden"
                      />
                    </div>
                    <select
                      value={catalogCategory}
                      onChange={(e) => setCatalogCategory(e.target.value)}
                      className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs outline-hidden"
                    >
                      <option value="ALL">Semua Kategori</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1">
                    {filteredCatalogBooks.map((book) => {
                      const isWish = userWishlistIds.includes(book.id);
                      const cat = categories.find((c) => c.id === book.categoryId);
                      return (
                        <div
                          key={book.id}
                          className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between space-y-2 group"
                        >
                          <div className="space-y-2">
                            <div className="relative h-32 w-full rounded-xl overflow-hidden bg-slate-900 shadow-xs">
                              <SmartBookCover
                                title={book.title}
                                author={book.author}
                                coverUrl={book.coverImage}
                                categoryId={book.categoryId}
                                aspectRatio="h-full w-full"
                              />
                              <span
                                className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[8px] font-bold text-white shadow-xs z-20"
                                style={{ backgroundColor: cat?.colorHex || '#9333ea' }}
                              >
                                {cat?.shortName || 'BUKU'}
                              </span>
                            </div>
                            <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-2">
                              {book.title}
                            </h5>
                            <p className="text-[10px] text-slate-400 truncate">{book.author}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleWishlist(book.id)}
                            className={`w-full py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition ${
                              isWish
                                ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 border border-rose-200 dark:border-rose-800'
                                : 'bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            }`}
                          >
                            <Heart className={`h-3.5 w-3.5 ${isWish ? 'fill-rose-500 text-rose-500' : ''}`} />
                            {isWish ? 'Tersimpan di Impianku' : '+ Buku Impianku'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SUB-MODAL 1: RESET PASSWORD LANGSUNG KE WA ORTU */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-emerald-500" />
                <span>Reset Password Siswa Mandiri</span>
              </h3>
              <button
                onClick={() => {
                  setIsResetModalOpen(false);
                  setResetResult(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!resetResult ? (
              <form onSubmit={handlePerformReset} className="space-y-4 text-xs">
                <p className="text-slate-500 leading-relaxed">
                  Masukkan Nama Siswa, Username, atau Kode Anggota SBTH. Sistem akan membuatkan PIN 4-digit baru dan mengirimkan tautan konfirmasi langsung ke WhatsApp nomor HP orang tua yang terdaftar.
                </p>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nama Siswa / Username / No. Anggota:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Alvaro / alvaro / SBTH-M-0015"
                    value={resetIdentifier}
                    onChange={(e) => setResetIdentifier(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md"
                  >
                    Reset & Buat Password Baru
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span>Password Baru Berhasil Dibuat!</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Siswa: <strong>{resetResult.memberName}</strong>
                  </p>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-center font-mono text-xl font-bold text-emerald-600">
                    {resetResult.newPassword}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    No. WhatsApp Terdaftar Ortu: <strong>{resetResult.parentPhone}</strong>
                  </p>
                </div>

                <a
                  href={resetResult.waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center gap-2 transition"
                >
                  <Phone className="h-4 w-4" />
                  <span>Kirim Password Baru ke WhatsApp Ortu (Buka WA)</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setResetResult(null);
                  }}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Selesai & Kembali ke Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: UBAH PASSWORD SENDIRI */}
      {isChangePasswordOpen && currentUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-500" />
                <span>Ubah Password Siswa</span>
              </h3>
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Password Baru Ananda:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ketik password baru (misal: 1234 atau kata sandi mudah)"
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-hidden focus:border-amber-500"
                />
              </div>

              {changePasswordMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  {changePasswordMsg}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 3: PENGAJUAN PENUTUPAN / PENGHAPUSAN AKUN MANDIRI */}
      {isCloseAccountOpen && currentUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-rose-500" />
                <span>Ajukan Penutupan Akun Perpustakaan</span>
              </h3>
              <button
                onClick={() => setIsCloseAccountOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <p>
                Fitur ini digunakan oleh Ayah/Bunda bila ananda telah <strong>lulus dari TK-B</strong> atau <strong>pindah sekolah</strong>, untuk menyelesaikan administrasi dan menutup akses akun perpustakaan.
              </p>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-1">
                <span className="font-bold block">Syarat Bebas Pustaka:</span>
                <p>• Tidak ada buku fisik yang sedang dipinjam (0 buku aktif).</p>
                <p>• Seluruh kewajiban buku dikembalikan dalam kondisi baik.</p>
              </div>

              {closeAccountError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{closeAccountError}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCloseAccountOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmCloseAccount}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                Konfirmasi Tutup Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
