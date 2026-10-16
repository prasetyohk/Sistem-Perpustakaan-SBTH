'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  BookOpen,
  Award,
  Lightbulb,
  X,
  Download,
  Building,
  CheckCircle,
  Clock,
  HeartHandshake,
  ShoppingBag,
  Calendar,
  Users,
  AlertTriangle,
  Archive,
  ArrowUpRight,
} from 'lucide-react';
import { LibraryAnalytics, Book, Loan, BookItem, Member } from '@/types';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';
import { CATEGORIES } from '@/lib/constants';
import * as XLSX from 'xlsx';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBookDetail?: (book: Book) => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  onOpenBookDetail,
}) => {
  const [analytics, setAnalytics] = useState<LibraryAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CIRCULATION' | 'PUBLISHERS_AUTHORS' | 'MEMBERS' | 'INSIGHTS'>('OVERVIEW');
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | 'SEMESTER' | 'ALL'>('30D');

  const [allLoans, setAllLoans] = useState<Loan[]>([]);
  const [allItems, setAllItems] = useState<BookItem[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [filterCutoff, setFilterCutoff] = useState<Date>(() => new Date(0));
  const [chartPoints, setChartPoints] = useState<Array<{ label: string; loanCount: number; returnCount: number }>>([]);

  useEffect(() => {
    if (!isOpen) return;

    setAnalytics(libraryStore.getLibraryAnalytics());
    const loans = libraryStore.getLoans();
    setAllLoans(loans);
    setAllItems(libraryStore.getBookItems());
    setAllBooks(libraryStore.getBooks());
    setAllMembers(libraryStore.getMembers());

    const now = new Date();
    let cutoff = new Date(0);
    if (timeRange === '7D') {
      cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 7);
    } else if (timeRange === '30D') {
      cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 30);
    } else if (timeRange === 'SEMESTER') {
      cutoff = new Date(now);
      cutoff.setMonth(cutoff.getMonth() - 6);
    }
    setFilterCutoff(cutoff);

    // Compute chartPoints
    if (timeRange === '7D') {
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const points = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const iso = d.toISOString().split('T')[0];
        const dayLabel = `${days[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
        const loanCount = loans.filter((l) => l.loanDate.startsWith(iso)).length;
        const returnCount = loans.reduce((acc, l) => {
          return acc + l.items.filter((item) => item.returnDate && item.returnDate.startsWith(iso)).length;
        }, 0);
        points.push({ label: dayLabel, loanCount, returnCount });
      }
      setChartPoints(points);
    } else {
      const points = [];
      for (let w = 3; w >= 0; w--) {
        const endD = new Date();
        endD.setDate(endD.getDate() - w * 7);
        const startD = new Date(endD);
        startD.setDate(startD.getDate() - 7);

        const label = `Mg ${4 - w} (${startD.getDate()}/${startD.getMonth() + 1})`;
        const loanCount = loans.filter((l) => {
          const ld = new Date(l.loanDate);
          return ld >= startD && ld <= endD;
        }).length;
        const returnCount = loans.reduce((acc, l) => {
          return acc + l.items.filter((item) => {
            if (!item.returnDate) return false;
            const rd = new Date(item.returnDate);
            return rd >= startD && rd <= endD;
          }).length;
        }, 0);
        points.push({ label, loanCount, returnCount });
      }
      setChartPoints(points);
    }
  }, [isOpen, timeRange]);

  // Loans in range
  const filteredLoans = useMemo(() => {
    return allLoans.filter((l) => new Date(l.loanDate) >= filterCutoff);
  }, [allLoans, filterCutoff]);

  // Active members in range
  const activeMemberIds = useMemo(() => {
    return new Set(filteredLoans.map((l) => l.memberId));
  }, [filteredLoans]);

  // Condition counts
  const availableCopies = allItems.filter((i) => i.status === 'AVAILABLE').length;
  const borrowedCopies = allItems.filter((i) => i.status === 'BORROWED').length;
  const damagedCopies = allItems.filter((i) => i.status === 'DAMAGED' || i.status === 'IN_REPAIR').length;
  const lostCopies = allItems.filter((i) => i.status === 'LOST').length;
  const disposedCopies = allItems.filter((i) => i.status === 'DISPOSED').length;

  const maxChartVal = Math.max(1, ...chartPoints.map((p) => Math.max(p.loanCount, p.returnCount)));

  // Class grade distribution of members
  const membersByClass = useMemo(() => {
    const map: Record<string, number> = {};
    allMembers.forEach((s) => {
      const cls = s.classGroup || 'Umum';
      map[cls] = (map[cls] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [allMembers]);

  if (!isOpen || !analytics) return null;

  const handleExportAnalyticsExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Profil Aset
    const summaryData = [
      { Indikator: 'Rentang Waktu Laporan', Nilai: timeRange },
      { Indikator: 'Total Judul Buku Unik', Nilai: analytics.totalTitles },
      { Indikator: 'Total Eksemplar Fisik', Nilai: analytics.totalCopies },
      { Indikator: 'Estimasi Nilai Total Aset (Rp)', Nilai: analytics.totalAssetValue },
      { Indikator: 'Buku Tersedia di Rak', Nilai: availableCopies },
      { Indikator: 'Buku Sedang Dipinjam Murid', Nilai: borrowedCopies },
      { Indikator: 'Buku Rusak / Perbaikan', Nilai: damagedCopies },
      { Indikator: 'Buku Hilang', Nilai: lostCopies },
      { Indikator: 'Total Sirkulasi dalam Rentang Waktu', Nilai: filteredLoans.length },
      { Indikator: 'Total Anggota Siswa Terdaftar', Nilai: allMembers.length },
      { Indikator: 'Siswa Aktif Meminjam', Nilai: activeMemberIds.size },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan_Aset');

    // Sheet 2: Top Penerbit
    const wsPublishers = XLSX.utils.json_to_sheet(
      analytics.topPublishers.map((p) => ({
        'Nama Penerbit': p.name,
        'Jumlah Judul': p.titleCount,
        'Total Kali Dipinjam': p.borrowCount,
        'Porsi Sirkulasi (%)': `${p.percentage}%`,
      }))
    );
    XLSX.utils.book_append_sheet(wb, wsPublishers, 'Analisis_Penerbit');

    // Sheet 3: Top Pengarang
    const wsAuthors = XLSX.utils.json_to_sheet(
      analytics.topAuthors.map((a) => ({
        'Nama Pengarang': a.name,
        'Jumlah Judul': a.titleCount,
        'Total Kali Dipinjam': a.borrowCount,
      }))
    );
    XLSX.utils.book_append_sheet(wb, wsAuthors, 'Analisis_Pengarang');

    // Sheet 4: Sering Dipinjam vs Dead Stock
    const wsCirculation = XLSX.utils.json_to_sheet([
      ...analytics.mostBorrowedBooks.map((x) => ({
        Kategori: 'FAVORIT / SERING DIPINJAM',
        'Judul Buku': x.book.title,
        Pengarang: x.book.author,
        Penerbit: x.book.publisher,
        'Kali Dipinjam': x.borrowCount,
      })),
      ...analytics.rarelyBorrowedBooks.map((x) => ({
        Kategori: 'JARANG / BELUM DIPINJAM',
        'Judul Buku': x.book.title,
        Pengarang: x.book.author,
        Penerbit: x.book.publisher,
        'Kali Dipinjam': x.borrowCount,
      })),
    ]);
    XLSX.utils.book_append_sheet(wb, wsCirculation, 'Sirkulasi_Buku');

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Laporan_Analitik_Aset_SBTH_${timeRange}_${dateStr}.xlsx`);
    soundFx.playSuccessChime();
  };

  const maxPublisherBorrow = Math.max(1, ...analytics.topPublishers.map((p) => p.borrowCount));
  const maxAuthorBorrow = Math.max(1, ...analytics.topAuthors.map((a) => a.borrowCount));

  // Category counts
  const categoryStats = CATEGORIES.map((cat) => {
    const count = allBooks.filter((b) => b.categoryId === cat.id).length;
    return { ...cat, count };
  });
  const maxCatCount = Math.max(1, ...categoryStats.map((c) => c.count));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-4xl bg-surface border-l border-border h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* 1. Header with Time Range Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border p-5 bg-surface shrink-0 gap-3">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 border border-border shrink-0 shadow-2xs">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display text-text">
                  Analitik Perpustakaan & Profil Nilai Aset
                </h2>
                <span className="bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  SBTH Smart Analytics
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Audit inventaris, tren sirkulasi buku mingguan/bulanan, kondisi eksemplar & pertumbuhan anggota
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Rentang Waktu Pill Toggle */}
            <div className="flex items-center bg-surface-2 p-1 rounded-xl border border-border text-xs">
              {[
                { id: '7D', label: '7 Hari' },
                { id: '30D', label: '30 Hari' },
                { id: 'SEMESTER', label: 'Semester' },
                { id: 'ALL', label: 'Semua' },
              ].map((rt) => (
                <button
                  key={rt.id}
                  type="button"
                  onClick={() => {
                    setTimeRange(rt.id as any);
                    soundFx.playScanBeep();
                  }}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    timeRange === rt.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  {rt.label}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-text-muted hover:text-text hover:bg-surface-2 transition cursor-pointer"
              title="Tutup Panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 2. Tab Navigation */}
        <div className="flex border-b border-border bg-surface px-5 gap-6 text-xs font-semibold shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'OVERVIEW', label: 'Nilai Aset & Tren Grafik', icon: DollarSign },
            { id: 'CIRCULATION', label: 'Sirkulasi & Kondisi Buku', icon: TrendingUp },
            { id: 'MEMBERS', label: 'Pertumbuhan Anggota Murid', icon: Users },
            { id: 'PUBLISHERS_AUTHORS', label: 'Penerbit & Pengarang', icon: Building },
            { id: 'INSIGHTS', label: 'Rekomendasi Strategis', icon: Lightbulb },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  soundFx.playScanBeep();
                }}
                className={`py-3.5 flex items-center gap-2 whitespace-nowrap border-b-2 transition cursor-pointer ${
                  isActive
                    ? 'border-amber-500 text-amber-500 font-bold'
                    : 'border-transparent text-text-muted hover:text-text'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Drawer Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-text">
          
          {/* TAB 1: OVERVIEW & TREN GRAFIK MINGGUAN / BULANAN */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* 4 KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Total Asset Valuation */}
                <div className="rounded-2xl p-4 bg-surface-2 border border-border shadow-xs">
                  <div className="flex items-center justify-between text-text-muted mb-1.5">
                    <span className="text-xs font-semibold">Total Nilai Aset</span>
                    <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500">
                      <DollarSign className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-display text-text tabular-nums">
                    Rp {analytics.totalAssetValue.toLocaleString('id-ID')}
                  </div>
                  <p className="text-[11px] text-text-muted mt-1">
                    Kekayaan fisik {analytics.totalCopies} buku
                  </p>
                </div>

                {/* Total Titles & Copies */}
                <div className="rounded-2xl p-4 bg-surface-2 border border-border shadow-xs">
                  <div className="flex items-center justify-between text-text-muted mb-1.5">
                    <span className="text-xs font-semibold">Judul & Eksemplar</span>
                    <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
                      <BookOpen className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-display text-text tabular-nums">
                    {analytics.totalTitles} <span className="text-xs font-normal text-text-muted">Judul</span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-1">
                    Total {analytics.totalCopies} eksemplar fisik
                  </p>
                </div>

                {/* Available vs Borrowed */}
                <div className="rounded-2xl p-4 bg-surface-2 border border-border shadow-xs">
                  <div className="flex items-center justify-between text-text-muted mb-1.5">
                    <span className="text-xs font-semibold">Koleksi di Rak</span>
                    <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-500">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-display text-emerald-500 tabular-nums">
                    {availableCopies} <span className="text-xs font-normal text-text-muted">Ada di Rak</span>
                  </div>
                  <p className="text-[11px] text-amber-500 mt-1">
                    {borrowedCopies} buku sedang dipinjam
                  </p>
                </div>

                {/* All-Time Circulation */}
                <div className="rounded-2xl p-4 bg-surface-2 border border-border shadow-xs">
                  <div className="flex items-center justify-between text-text-muted mb-1.5">
                    <span className="text-xs font-semibold">Sirkulasi ({timeRange})</span>
                    <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-500">
                      <Award className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-display text-text tabular-nums">
                    {filteredLoans.length} <span className="text-xs font-normal text-text-muted">Transaksi</span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-1">
                    {activeMemberIds.size} siswa aktif membaca
                  </p>
                </div>
              </div>

              {/* TREN GRAFIK BAR SIRKULASI MINGGUAN / BULANAN */}
              <div className="rounded-2xl bg-surface-2 border border-border p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <h3 className="text-sm font-bold font-display text-text flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-amber-500" />
                      <span>Grafik Tren Aktivitas Peminjaman & Pengembalian</span>
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Visualisasi sirkulasi buku pada periode {timeRange === '7D' ? '7 Hari Terakhir (Harian)' : timeRange === '30D' ? '30 Hari Terakhir (Mingguan)' : timeRange === 'SEMESTER' ? 'Semester Ini' : 'Seluruh Waktu'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-sm bg-amber-500" />
                      <span className="text-text-muted">Peminjaman Buku</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-sm bg-emerald-500" />
                      <span className="text-text-muted">Pengembalian Buku</span>
                    </div>
                  </div>
                </div>

                {/* SVG/CSS Bar Chart Columns */}
                <div className="pt-4 pb-2">
                  <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2">
                    {chartPoints.map((pt, idx) => {
                      const loanHeight = Math.max(8, Math.round((pt.loanCount / maxChartVal) * 100));
                      const returnHeight = Math.max(8, Math.round((pt.returnCount / maxChartVal) * 100));

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                          {/* Bars container */}
                          <div className="w-full max-w-[48px] flex items-end justify-center gap-1 h-36">
                            {/* Loan bar */}
                            <div
                              style={{ height: `${pt.loanCount === 0 ? 4 : loanHeight}%` }}
                              className={`w-1/2 rounded-t-md transition-all duration-300 relative ${
                                pt.loanCount > 0 ? 'bg-amber-500 hover:bg-amber-400' : 'bg-surface-3 opacity-40'
                              }`}
                            >
                              {pt.loanCount > 0 && (
                                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-amber-400 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                                  {pt.loanCount}
                                </span>
                              )}
                            </div>

                            {/* Return bar */}
                            <div
                              style={{ height: `${pt.returnCount === 0 ? 4 : returnHeight}%` }}
                              className={`w-1/2 rounded-t-md transition-all duration-300 relative ${
                                pt.returnCount > 0 ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-surface-3 opacity-40'
                              }`}
                            >
                              {pt.returnCount > 0 && (
                                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                                  {pt.returnCount}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Label below bar */}
                          <span className="text-[10px] font-semibold text-text-muted mt-2 truncate w-full text-center">
                            {pt.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* PERGERAKAN FISIK: TERSEDIA, DIPINJAM, RUSAK, HILANG */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[11px] font-semibold text-emerald-500">Tersedia di Rak</span>
                  <div className="text-xl font-bold font-display text-emerald-500 mt-1">{availableCopies} Eks</div>
                  <span className="text-[10px] text-text-muted">Siap dibaca anak</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[11px] font-semibold text-amber-500">Sedang Dipinjam</span>
                  <div className="text-xl font-bold font-display text-amber-500 mt-1">{borrowedCopies} Eks</div>
                  <span className="text-[10px] text-text-muted">Di tangan siswa</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <span className="text-[11px] font-semibold text-rose-500">Rusak / Perbaikan</span>
                  <div className="text-xl font-bold font-display text-rose-500 mt-1">{damagedCopies} Eks</div>
                  <span className="text-[10px] text-text-muted">Perlu perbaikan fisik</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                  <span className="text-[11px] font-semibold text-purple-500">Buku Hilang</span>
                  <div className="text-xl font-bold font-display text-purple-500 mt-1">{lostCopies} Eks</div>
                  <span className="text-[10px] text-text-muted">Audit selisih fisik</span>
                </div>
              </div>

              {/* Visual Breakdown Bar Chart: Category Distribution */}
              <div className="rounded-2xl bg-surface-2 border border-border p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-display text-text">
                    Distribusi Koleksi per Kategori Rak
                  </h3>
                  <span className="text-xs text-text-muted">
                    Total: {allBooks.length} Judul Buku
                  </span>
                </div>

                <div className="space-y-3">
                  {categoryStats.map((cat) => {
                    const pct = Math.round((cat.count / Math.max(1, allBooks.length)) * 100);

                    return (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-text flex items-center gap-1.5">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: cat.colorHex }}
                            />
                            {cat.name}
                          </span>
                          <span className="text-text-muted tabular-nums font-mono text-[11px]">
                            {cat.count} Judul ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${(cat.count / maxCatCount) * 100}%`,
                              backgroundColor: cat.colorHex,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Source of Acquisition: Beli Sekolah vs Sumbangan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
                    <ShoppingBag className="h-4 w-4 text-amber-500" />
                    <span>Pembelian Anggaran Sekolah</span>
                  </div>
                  <div className="text-2xl font-bold font-display text-text tabular-nums">
                    {analytics.totalBought} <span className="text-xs font-normal text-text-muted">Eksemplar</span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Buku resmi yang dibeli melalui anggaran BOS / Yayasan Bhakti Tunas Harapan.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
                    <HeartHandshake className="h-4 w-4 text-rose-500" />
                    <span>Sumbangan Orang Tua / Wali</span>
                  </div>
                  <div className="text-2xl font-bold font-display text-text tabular-nums">
                    {analytics.totalDonated} <span className="text-xs font-normal text-text-muted">Eksemplar</span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Buku hibah sukarela saat kelulusan atau perayaan Hari Buku Nasional.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SIRKULASI & KONDISI BUKU */}
          {activeTab === 'CIRCULATION' && (
            <div className="space-y-6">
              {/* Most Borrowed */}
              <div className="rounded-2xl bg-surface-2 border border-border p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-sm font-bold font-display text-text flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span>Buku Paling Sering Dipinjam (Favorit Anak)</span>
                  </h3>
                  <span className="text-xs text-emerald-500 font-semibold">Tingkat Sirkulasi Tinggi</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-text-muted border-b border-border">
                      <tr>
                        <th className="py-2.5 px-3">Judul Buku</th>
                        <th className="py-2.5 px-3">Pengarang & Penerbit</th>
                        <th className="py-2.5 px-3 text-right">Frekuensi Pinjam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {analytics.mostBorrowedBooks.map((item, idx) => (
                        <tr key={`mb-${idx}`} className="hover:bg-surface/50">
                          <td className="py-2.5 px-3 font-semibold text-text">
                            {item.book.title}
                          </td>
                          <td className="py-2.5 px-3 text-text-muted">
                            {item.book.author} ({item.book.publisher})
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-500 font-mono tabular-nums">
                            {item.borrowCount}x Pinjam
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rarely Borrowed / Dead-stock */}
              <div className="rounded-2xl bg-surface-2 border border-border p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-sm font-bold font-display text-text flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>Buku Belum / Jarang Dipinjam (Dead-Stock)</span>
                  </h3>
                  <span className="text-xs text-amber-500 font-semibold">Perlu Promosi Display</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-text-muted border-b border-border">
                      <tr>
                        <th className="py-2.5 px-3">Judul Buku</th>
                        <th className="py-2.5 px-3">Pengarang & Penerbit</th>
                        <th className="py-2.5 px-3 text-right">Frekuensi Pinjam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {analytics.rarelyBorrowedBooks.map((item, idx) => (
                        <tr key={`rb-${idx}`} className="hover:bg-surface/50">
                          <td className="py-2.5 px-3 font-semibold text-text">
                            {item.book.title}
                          </td>
                          <td className="py-2.5 px-3 text-text-muted">
                            {item.book.author} ({item.book.publisher})
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-text-muted font-mono tabular-nums">
                            {item.borrowCount}x
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PERTUMBUHAN ANGGOTA MURID */}
          {activeTab === 'MEMBERS' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-surface-2 border border-border">
                  <span className="text-xs font-semibold text-text-muted">Total Anggota Terdaftar</span>
                  <div className="text-2xl font-bold font-display text-text mt-1">{allMembers.length} Siswa</div>
                  <p className="text-[11px] text-text-muted mt-1">KB, TK-A, dan TK-B</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-xs font-semibold text-emerald-500">Siswa Aktif Meminjam ({timeRange})</span>
                  <div className="text-2xl font-bold font-display text-emerald-500 mt-1">{activeMemberIds.size} Siswa</div>
                  <p className="text-[11px] text-text-muted mt-1">
                    {Math.round((activeMemberIds.size / Math.max(1, allMembers.length)) * 100)}% dari total siswa
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-surface-2 border border-border">
                  <span className="text-xs font-semibold text-text-muted">Belum Pernah Meminjam</span>
                  <div className="text-2xl font-bold font-display text-text mt-1">
                    {Math.max(0, allMembers.length - activeMemberIds.size)} Siswa
                  </div>
                  <p className="text-[11px] text-amber-500 mt-1">Perlu dorongan literasi kelas</p>
                </div>
              </div>

              <div className="rounded-2xl bg-surface-2 border border-border p-5 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold font-display text-text flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-500" />
                  <span>Distribusi Anggota per Rombel / Kelas</span>
                </h3>

                <div className="space-y-3">
                  {membersByClass.map((cls) => {
                    const pct = Math.round((cls.count / Math.max(1, allMembers.length)) * 100);

                    return (
                      <div key={cls.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-text">Kelas {cls.name}</span>
                          <span className="text-text-muted font-mono tabular-nums text-[11px]">
                            {cls.count} Siswa ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-300"
                            style={{
                              width: `${pct}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PENERBIT & PENGARANG */}
          {activeTab === 'PUBLISHERS_AUTHORS' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-surface-2 border border-border p-5 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold font-display text-text flex items-center gap-2">
                  <Building className="h-4 w-4 text-amber-500" />
                  <span>Penerbit Paling Populer di SBTH</span>
                </h3>

                <div className="space-y-3">
                  {analytics.topPublishers.map((pub, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-text">{pub.name}</span>
                        <span className="text-text-muted font-mono tabular-nums text-[11px]">
                          {pub.titleCount} Judul • {pub.borrowCount}x Dipinjam
                        </span>
                      </div>
                      <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${(pub.borrowCount / maxPublisherBorrow) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-surface-2 border border-border p-5 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold font-display text-text flex items-center gap-2">
                  <Award className="h-4 w-4 text-sky-500" />
                  <span>Pengarang Terfavorit Anak</span>
                </h3>

                <div className="space-y-3">
                  {analytics.topAuthors.map((author, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-text">{author.name}</span>
                        <span className="text-text-muted font-mono tabular-nums text-[11px]">
                          {author.titleCount} Judul • {author.borrowCount}x Dipinjam
                        </span>
                      </div>
                      <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border">
                        <div
                          className="h-full bg-sky-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${(author.borrowCount / maxAuthorBorrow) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: REKOMENDASI STRATEGIS */}
          {activeTab === 'INSIGHTS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                  <Lightbulb className="h-4 w-4" />
                  <span>Rekomendasi Pengadaan Buku Baru:</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Buku dengan topik binatang, fabel cerdik, dan fonik dasar memiliki tingkat peminjaman tertinggi ({Math.round((borrowedCopies / Math.max(1, allItems.length)) * 100)}% aktif beredar). Prioritaskan penambahan varian seri ensiklopedia satwa dan dongeng bilingual Mandarin-Indonesia untuk tahun ajaran baru.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-500">
                  <TrendingUp className="h-4 w-4" />
                  <span>Saran Display Rak Perpustakaan:</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Buku yang belum pernah dipinjam disarankan untuk dipindahkan ke rak depan setinggi pandangan mata anak (eye-level display) dengan sampul menghadap ke depan (cover-facing), bukan hanya punggung buku, untuk menarik rasa ingin tahu anak saat kegiatan literasi kelas.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 4. Sticky Footer with Single Amber Action */}
        <div className="p-4 border-t border-border bg-surface flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-2 transition cursor-pointer"
          >
            Tutup Panel
          </button>

          <button
            type="button"
            onClick={handleExportAnalyticsExcel}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Ekspor Laporan (.xlsx)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
