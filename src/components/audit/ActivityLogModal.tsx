'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  Search,
  Filter,
  Download,
  Trash2,
  Calendar,
  CheckCircle,
  BookOpen,
  User,
  DollarSign,
  ShieldAlert,
  Clock,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { ActivityLogEntry, ActivityLogCategory } from '@/types';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';
import * as XLSX from 'xlsx';

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityLogModal: React.FC<ActivityLogModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ActivityLogCategory | 'ALL'>('ALL');
  const [selectedLibrarian, setSelectedLibrarian] = useState<string | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Date Filtering Modes
  const [dateFilterType, setDateFilterType] = useState<'PRESET' | 'RANGE' | 'MONTH' | 'YEAR'>('PRESET');
  const [presetFilter, setPresetFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // 0-11
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Extract distinct librarians for filter dropdown
  const distinctLibrarians = React.useMemo(() => {
    const set = new Set<string>();
    try {
      libraryStore.getLibrarians().forEach((l) => {
        if (l.name) set.add(l.name);
      });
    } catch {}
    logs.forEach((log) => {
      if (log.actor && !log.actor.toLowerCase().startsWith('siswa')) {
        set.add(log.actor);
      }
    });
    return Array.from(set);
  }, [logs]);

  useEffect(() => {
    if (isOpen) {
      setLogs(libraryStore.getActivityLogs());
      setSearchQuery('');
      setSelectedLibrarian('ALL');
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      setStartDate(today);
      setEndDate(today);
      setSelectedMonth(now.getMonth());
      setSelectedYear(now.getFullYear());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearLogs = () => {
    if (confirm('Yakin ingin mengosongkan seluruh riwayat log aktivitas? Arsip ini berguna untuk akuntabilitas sekolah.')) {
      libraryStore.clearActivityLogs();
      setLogs([]);
      soundFx.playScanBeep();
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (selectedCategory !== 'ALL' && log.category !== selectedCategory) return false;

    // Filter per Pustakawan / Petugas
    if (selectedLibrarian !== 'ALL') {
      const targetLib = selectedLibrarian.toLowerCase();
      if (!log.actor.toLowerCase().includes(targetLib)) return false;
    }

    const logDate = new Date(log.timestamp);

    // Apply specific Date Filter
    if (dateFilterType === 'PRESET') {
      if (presetFilter !== 'ALL') {
        const now = new Date();
        const diffMs = now.getTime() - logDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (presetFilter === 'TODAY' && diffDays > 1) return false;
        if (presetFilter === 'WEEK' && diffDays > 7) return false;
        if (presetFilter === 'MONTH' && diffDays > 30) return false;
      }
    } else if (dateFilterType === 'RANGE') {
      if (startDate) {
        const start = new Date(`${startDate}T00:00:00`);
        if (logDate < start) return false;
      }
      if (endDate) {
        const end = new Date(`${endDate}T23:59:59`);
        if (logDate > end) return false;
      }
    } else if (dateFilterType === 'MONTH') {
      if (logDate.getFullYear() !== selectedYear || logDate.getMonth() !== selectedMonth) {
        return false;
      }
    } else if (dateFilterType === 'YEAR') {
      if (logDate.getFullYear() !== selectedYear) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAction = log.action.toLowerCase().includes(q);
      const matchActor = log.actor.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchBarcode = log.targetBarcode?.toLowerCase().includes(q) || false;
      const matchTitle = log.targetTitle?.toLowerCase().includes(q) || false;
      const matchMember = log.targetMember?.toLowerCase().includes(q) || false;

      if (!matchAction && !matchActor && !matchDetails && !matchBarcode && !matchTitle && !matchMember) {
        return false;
      }
    }

    return true;
  });

  const getCategoryBadge = (cat: ActivityLogCategory) => {
    switch (cat) {
      case 'CIRCULATION':
        return {
          label: 'Sirkulasi Buku',
          cls: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
        };
      case 'CATALOG':
        return {
          label: 'Katalog & Rak',
          cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        };
      case 'AUTH':
        return {
          label: 'Otentikasi Akun',
          cls: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
        };
      case 'FINANCE':
        return {
          label: 'Kas & Denda',
          cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
        };
      case 'STOCK_OPNAME':
        return {
          label: 'Stock Opname',
          cls: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
        };
      case 'SYSTEM':
      default:
        return {
          label: 'Sistem & Profil',
          cls: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
        };
    }
  };

  const getExportFilename = (ext: 'csv' | 'xlsx') => {
    let tag = 'Semua';
    if (dateFilterType === 'RANGE') {
      tag = `${startDate}_sd_${endDate}`;
    } else if (dateFilterType === 'MONTH') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      tag = `Bulan_${monthNames[selectedMonth]}_${selectedYear}`;
    } else if (dateFilterType === 'YEAR') {
      tag = `Tahun_${selectedYear}`;
    } else if (presetFilter === 'TODAY') {
      tag = `Hari_Ini_${new Date().toISOString().split('T')[0]}`;
    } else if (presetFilter === 'WEEK') {
      tag = `7_Hari_Terakhir`;
    }
    return `Audit_Log_Perpus_SBTH_${tag}.${ext}`;
  };

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Kategori', 'Aksi', 'Aktor', 'Target', 'Barcode', 'Detail'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.category}"`,
      `"${l.action}"`,
      `"${l.actor}"`,
      `"${l.targetTitle || l.targetMember || '-'}"`,
      `"${l.targetBarcode || '-'}"`,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', getExportFilename('csv'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    soundFx.playSuccessChime();
  };

  const handleExportXLSX = () => {
    const wb = XLSX.utils.book_new();
    const data = filteredLogs.map((l) => ({
      'Waktu & Tanggal': new Date(l.timestamp).toLocaleString('id-ID'),
      'Kategori': l.category,
      'Aksi / Transaksi': l.action,
      'Aktor / Petugas': l.actor,
      'Target Buku / Siswa': l.targetTitle || l.targetMember || '-',
      'Barcode Eksemplar': l.targetBarcode || '-',
      'Keterangan Lengkap': l.details,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 22 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 35 }, { wch: 18 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Log_Aktivitas_Perpus');
    XLSX.writeFile(wb, getExportFilename('xlsx'));
    soundFx.playSuccessChime();
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-5xl rounded-3xl bg-surface border border-border p-6 shadow-2xl space-y-4 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xs">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-text">
                Log Riwayat & Audit Aktivitas SBTH
              </h3>
              <p className="text-xs text-text-muted">
                Pencatatan sirkulasi, penambahan koleksi buku, pengembalian, dan aktivitas sistem
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportXLSX}
              className="px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Unduh format Microsoft Excel .xlsx"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Export Excel</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Unduh format CSV"
            >
              <Download className="h-3.5 w-3.5 text-blue-500" />
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={handleClearLogs}
              className="p-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs transition cursor-pointer"
              title="Bersihkan Log Riwayat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-text-muted hover:bg-surface-2 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Date Filter & Range Selection Toolbar */}
        <div className="p-3.5 rounded-2xl bg-surface-2 border border-border space-y-3 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text">
              <Calendar className="h-4 w-4 text-amber-500" />
              <span>Pilih Rentang Waktu / Periode:</span>
            </div>

            {/* Filter Mode Selector */}
            <div className="flex p-1 rounded-xl bg-surface border border-border text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDateFilterType('PRESET')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  dateFilterType === 'PRESET' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-text-muted hover:text-text'
                }`}
              >
                Cepat
              </button>
              <button
                type="button"
                onClick={() => setDateFilterType('RANGE')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  dateFilterType === 'RANGE' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-text-muted hover:text-text'
                }`}
              >
                Rentang Tanggal
              </button>
              <button
                type="button"
                onClick={() => setDateFilterType('MONTH')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  dateFilterType === 'MONTH' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-text-muted hover:text-text'
                }`}
              >
                Bulanan
              </button>
              <button
                type="button"
                onClick={() => setDateFilterType('YEAR')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  dateFilterType === 'YEAR' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-text-muted hover:text-text'
                }`}
              >
                Tahunan
              </button>
            </div>
          </div>

          {/* Sub-inputs based on Filter Mode */}
          {dateFilterType === 'PRESET' && (
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { id: 'ALL', label: 'Semua Waktu' },
                { id: 'TODAY', label: 'Hari Ini' },
                { id: 'WEEK', label: '7 Hari Terakhir' },
                { id: 'MONTH', label: '30 Hari Terakhir' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPresetFilter(p.id as any)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                    presetFilter === p.id
                      ? 'bg-amber-500/20 text-amber-500 border-amber-500/40 font-bold'
                      : 'bg-surface text-text-muted border-border hover:text-text'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {dateFilterType === 'RANGE' && (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-text-muted font-medium">Dari Tanggal:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-muted font-medium">Sampai Tanggal:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          )}

          {dateFilterType === 'MONTH' && (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-text-muted font-medium">Pilih Bulan:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-text outline-hidden"
                >
                  {monthNames.map((m, idx) => (
                    <option key={idx} value={idx}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-text-muted font-medium">Tahun:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-text outline-hidden"
                >
                  {[2024, 2025, 2026, 2027, 2028].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {dateFilterType === 'YEAR' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-text-muted font-medium">Pilih Tahun Anggaran / Arsip:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-text outline-hidden font-bold text-amber-500"
              >
                {[2024, 2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>Tahun {y}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Search, Category, and Librarian Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 shrink-0">
          <div className="sm:col-span-5 relative">
            <Search className="h-4 w-4 text-text-muted absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari aksi, nama petugas, judul buku, barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-2 pl-10 pr-4 py-2 text-xs text-text placeholder-text-muted outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500"
            >
              <option value="ALL">Semua Kategori Aktivitas</option>
              <option value="CIRCULATION">🔄 Sirkulasi & Pinjam-Kembali</option>
              <option value="CATALOG">📚 Katalog & Eksemplar</option>
              <option value="AUTH">🔐 Otentikasi & Login</option>
              <option value="FINANCE">💵 Kas & Denda</option>
              <option value="STOCK_OPNAME">📋 Stock Opname Fisik</option>
              <option value="SYSTEM">⚙️ Sistem & Profil</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedLibrarian}
              onChange={(e) => setSelectedLibrarian(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text outline-hidden focus:ring-1 focus:ring-amber-500 font-medium"
            >
              <option value="ALL">👤 Semua Pustakawan</option>
              {distinctLibrarians.map((libName) => (
                <option key={libName} value={libName}>
                  👤 {libName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-between text-[11px] text-text-muted px-1 shrink-0">
          <span>
            Menampilkan <strong>{filteredLogs.length}</strong> riwayat transaksi yang cocok
          </span>
          {filteredLogs.length > 0 && (
            <span className="font-mono text-[10px]">
              Terbaru: {new Date(filteredLogs[0].timestamp).toLocaleString('id-ID')}
            </span>
          )}
        </div>

        {/* Log List */}
        <div className="space-y-2 overflow-y-auto pr-1 flex-1">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border-2 border-dashed border-border text-text-muted space-y-2">
              <History className="h-10 w-10 mx-auto opacity-40 text-amber-500" />
              <p className="text-xs font-semibold text-text">Tidak ada log aktivitas pada rentang waktu yang dipilih.</p>
              <p className="text-[11px]">Coba ubah filter rentang tanggal atau bersihkan kata kunci pencarian.</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const badge = getCategoryBadge(log.category);
              const dateStr = new Date(log.timestamp).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const timeStr = new Date(log.timestamp).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl border border-border bg-surface-2/60 hover:bg-surface-2 transition space-y-1.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${badge.cls}`}>
                        {badge.label}
                      </span>
                      <strong className="font-bold text-text text-xs">{log.action}</strong>
                      <span className="text-[11px] text-text-muted">oleh <strong>{log.actor}</strong></span>
                    </div>

                    <div className="text-[10px] text-text-muted shrink-0 text-right font-mono">
                      <span>{dateStr} • {timeStr}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-text-muted leading-relaxed pl-0.5">
                    {log.details}
                  </p>

                  {(log.targetTitle || log.targetBarcode || log.targetMember) && (
                    <div className="flex flex-wrap items-center gap-2 text-[10px] pt-1">
                      {log.targetTitle && (
                        <span className="px-2 py-0.5 rounded bg-surface border border-border text-text truncate max-w-xs">
                          📖 {log.targetTitle}
                        </span>
                      )}
                      {log.targetBarcode && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 font-mono font-bold">
                          {log.targetBarcode}
                        </span>
                      )}
                      {log.targetMember && (
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                          👤 {log.targetMember}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
