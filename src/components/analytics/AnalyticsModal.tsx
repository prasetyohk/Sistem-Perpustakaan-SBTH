'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { LibraryAnalytics, Book } from '@/types';
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
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CIRCULATION' | 'PUBLISHERS_AUTHORS' | 'INSIGHTS'>('OVERVIEW');

  useEffect(() => {
    if (isOpen) {
      const data = libraryStore.getLibraryAnalytics();
      setAnalytics(data);
    }
  }, [isOpen]);

  if (!isOpen || !analytics) return null;

  const handleExportAnalyticsExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Profil Aset
    const summaryData = [
      { Indikator: 'Total Judul Buku Unik', Nilai: analytics.totalTitles },
      { Indikator: 'Total Eksemplar Fisik', Nilai: analytics.totalCopies },
      { Indikator: 'Estimasi Nilai Total Aset (Rp)', Nilai: analytics.totalAssetValue },
      { Indikator: 'Buku Tersedia di Rak', Nilai: analytics.totalAvailable },
      { Indikator: 'Buku Sedang Dipinjam Murid', Nilai: analytics.totalBorrowed },
      { Indikator: 'Buku Rusak / Hilang', Nilai: analytics.totalDamagedOrLost },
      { Indikator: 'Total Sirkulasi Peminjaman', Nilai: analytics.totalLoansAllTime },
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
    XLSX.writeFile(wb, `Laporan_Analitik_Aset_SBTH_${dateStr}.xlsx`);
    soundFx.playSuccessChime();
  };

  const books = libraryStore.getBooks();
  const maxPublisherBorrow = Math.max(1, ...analytics.topPublishers.map((p) => p.borrowCount));
  const maxAuthorBorrow = Math.max(1, ...analytics.topAuthors.map((a) => a.borrowCount));

  // Category counts
  const categoryStats = CATEGORIES.map((cat) => {
    const count = books.filter((b) => b.categoryId === cat.id).length;
    return { ...cat, count };
  });
  const maxCatCount = Math.max(1, ...categoryStats.map((c) => c.count));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-4xl bg-surface border-l border-border h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* 1. Neutral Header */}
        <div className="flex items-center justify-between border-b border-border p-5 bg-surface shrink-0">
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
                Audit inventaris, tren sirkulasi buku, penerbit/pengarang laris, dan rekomendasi strategis
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

        {/* 2. Underline Tab Navigation */}
        <div className="flex border-b border-border bg-surface px-5 gap-6 text-xs font-semibold shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'OVERVIEW', label: 'Nilai Aset & Ringkasan', icon: DollarSign },
            { id: 'CIRCULATION', label: 'Sirkulasi Buku', icon: TrendingUp },
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
                className={`py-3.5 flex items-center gap-2 whitespace-nowrap border-b-2 transition ${
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

        {/* 3. Drawer Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-text">
          
          {/* TAB 1: OVERVIEW & NILAI ASET */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Uniform KPI Cards without rainbow borders */}
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
                    <span className="text-xs font-semibold">Status Eksemplar</span>
                    <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-500">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-display text-emerald-500 tabular-nums">
                    {analytics.totalAvailable} <span className="text-xs font-normal text-text-muted">Rak</span>
                  </div>
                  <p className="text-[11px] text-amber-500 mt-1">
                    {analytics.totalBorrowed} buku sedang dipinjam
                  </p>
                </div>

                {/* All-Time Circulation */}
                <div className="rounded-2xl p-4 bg-surface-2 border border-border shadow-xs">
                  <div className="flex items-center justify-between text-text-muted mb-1.5">
                    <span className="text-xs font-semibold">Total Sirkulasi</span>
                    <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-500">
                      <Award className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-display text-text tabular-nums">
                    {analytics.totalLoansAllTime} <span className="text-xs font-normal text-text-muted">Pinjam</span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-1">
                    Akumulasi peminjaman siswa
                  </p>
                </div>
              </div>

              {/* Visual Breakdown Bar Chart: Category Distribution */}
              <div className="rounded-2xl bg-surface-2 border border-border p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-display text-text">
                    Distribusi Judul per Kategori Rak
                  </h3>
                  <span className="text-xs text-text-muted">
                    Total: {books.length} Judul Buku
                  </span>
                </div>

                <div className="space-y-3">
                  {categoryStats.map((cat) => {
                    const pct = Math.round((cat.count / Math.max(1, books.length)) * 100);

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

          {/* TAB 2: SIRKULASI BUKU (FAVORIT VS DEAD-STOCK) */}
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

          {/* TAB 3: PENERBIT & PENGARANG */}
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

          {/* TAB 4: REKOMENDASI STRATEGIS */}
          {activeTab === 'INSIGHTS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                  <Lightbulb className="h-4 w-4" />
                  <span>Rekomendasi Pengadaan Buku Baru:</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Buku dengan topik binatang, fabel cerdik, dan fonik dasar memiliki tingkat peminjaman tertinggi ({Math.round((analytics.totalBorrowed / Math.max(1, analytics.totalCopies)) * 100)}% aktif beredar). Prioritaskan penambahan varian seri ensiklopedia satwa dan dongeng bilingual Mandarin-Indonesia untuk tahun ajaran baru.
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
            className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text hover:bg-surface-2 transition"
          >
            Tutup Panel
          </button>

          <button
            type="button"
            onClick={handleExportAnalyticsExcel}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center gap-2 transition active:scale-95"
          >
            <Download className="h-4 w-4" />
            <span>Ekspor Laporan (.xlsx)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
