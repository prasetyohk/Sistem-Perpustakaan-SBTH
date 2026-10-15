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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');

  useEffect(() => {
    if (isOpen) {
      setLogs(libraryStore.getActivityLogs());
      setSearchQuery('');
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

    if (dateFilter !== 'ALL') {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      const diffMs = now.getTime() - logDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (dateFilter === 'TODAY' && diffDays > 1) return false;
      if (dateFilter === 'WEEK' && diffDays > 7) return false;
      if (dateFilter === 'MONTH' && diffDays > 30) return false;
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
      case 'SYSTEM':
      default:
        return {
          label: 'Sistem & Profil',
          cls: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
        };
    }
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
    link.setAttribute('download', `Audit_Log_SBTH_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    soundFx.playSuccessChime();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-5xl rounded-3xl bg-surface border border-border p-6 shadow-2xl space-y-5 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xs">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-text">
                Log Riwayat Besar & Audit Aktivitas SBTH
              </h3>
              <p className="text-xs text-text-muted">
                Pencatatan akuntabilitas transaksi, sirkulasi, penambahan buku, login siswa, dan pengaturan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Unduh file CSV untuk arsip audit yayasan"
            >
              <Download className="h-3.5 w-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Export CSV</span>
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
              className="p-1.5 rounded-xl text-text-muted hover:text-text hover:bg-surface-2 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-3.5 rounded-2xl bg-surface-2 border border-border space-y-3 shrink-0 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-text-muted absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari aktivitas, nama siswa, pustakawan, barcode, atau judul buku..."
                className="w-full rounded-xl border border-border bg-surface pl-9 pr-3 py-2 text-xs text-text outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-text-muted" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text outline-hidden cursor-pointer"
              >
                <option value="ALL">Semua Waktu</option>
                <option value="TODAY">Hari Ini (24 Jam)</option>
                <option value="WEEK">7 Hari Terakhir</option>
                <option value="MONTH">30 Hari Terakhir</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5 font-semibold">
            <span className="text-[11px] text-text-muted mr-1">Kategori:</span>
            {[
              { id: 'ALL', label: 'Semua Kategori' },
              { id: 'CIRCULATION', label: 'Sirkulasi (Pinjam/Kembali)' },
              { id: 'CATALOG', label: 'Katalog & Rak Buku' },
              { id: 'AUTH', label: 'Akun & Otentikasi' },
              { id: 'FINANCE', label: 'Kas & Denda' },
              { id: 'SYSTEM', label: 'Sistem & Backup' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1 rounded-xl transition ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-surface text-text-muted hover:text-text'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="flex-1 overflow-y-auto pr-1 text-xs">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-2xl text-text-muted space-y-2">
              <Clock className="h-10 w-10 mx-auto opacity-40 text-text-muted" />
              <p className="font-semibold text-text">Belum Ada Catatan Log yang Sesuai</p>
              <p className="text-[11px]">Setiap aktivitas peminjaman, pengembalian, dan scan buku otomatis tercatat di sini.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border overflow-hidden bg-surface shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-2 text-text-muted border-b border-border font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">Waktu & Tanggal</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Aksi</th>
                    <th className="py-2.5 px-3">Aktor</th>
                    <th className="py-2.5 px-3">Detail Lengkap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLogs.map((log) => {
                    const badge = getCategoryBadge(log.category);
                    const formattedDate = new Intl.DateTimeFormat('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    }).format(new Date(log.timestamp));

                    return (
                      <tr key={log.id} className="hover:bg-surface-2/60 transition">
                        <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-text-muted">
                          {formattedDate}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-text whitespace-nowrap">
                          {log.action}
                        </td>
                        <td className="py-3 px-3 font-semibold text-amber-500 whitespace-nowrap">
                          {log.actor}
                        </td>
                        <td className="py-3 px-3 text-text leading-relaxed">
                          <div>{log.details}</div>
                          {(log.targetTitle || log.targetBarcode || log.targetMember) && (
                            <div className="flex flex-wrap gap-2 text-[10px] text-text-muted mt-1 font-mono">
                              {log.targetTitle && <span>📘 {log.targetTitle}</span>}
                              {log.targetBarcode && <span>🏷️ {log.targetBarcode}</span>}
                              {log.targetMember && <span>👤 {log.targetMember}</span>}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted shrink-0">
          <span>Menampilkan <strong>{filteredLogs.length}</strong> catatan aktivitas</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            Tutup Log Riwayat
          </button>
        </div>
      </div>
    </div>
  );
};
