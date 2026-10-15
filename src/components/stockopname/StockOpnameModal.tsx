'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ClipboardCheck,
  Barcode,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Printer,
  Calendar,
  Save,
  Search,
  Check,
  FileText,
  Clock,
  Sparkles,
  MapPin,
  Tag,
} from 'lucide-react';
import { BookItem, Book, StockOpnameRecord } from '@/types';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';

interface StockOpnameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinished?: () => void;
}

export const StockOpnameModal: React.FC<StockOpnameModalProps> = ({
  isOpen,
  onClose,
  onFinished,
}) => {
  const [items, setItems] = useState<BookItem[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [schoolProfile, setSchoolProfile] = useState(libraryStore.getSchoolProfile());
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [scanInput, setScanInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('Stock opname fisik berkala koleksi perpustakaan KB-TK SBTH Magelang.');
  const [filterMode, setFilterMode] = useState<'ALL' | 'CHECKED' | 'UNCHECKED' | 'DAMAGED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPrintPreview, setIsPrintPreview] = useState<boolean>(false);
  const [historyRecords, setHistoryRecords] = useState<StockOpnameRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      const allItems = libraryStore.getBookItems();
      const allBooks = libraryStore.getBooks();
      setItems(allItems);
      setBooks(allBooks);
      setSchoolProfile(libraryStore.getSchoolProfile());
      setHistoryRecords(libraryStore.getStockOpnameRecords());

      // Pre-check AVAILABLE items as initially unchecked for active session
      const initialChecked: Record<string, boolean> = {};
      setCheckedMap(initialChecked);
      setIsPrintPreview(false);
      setScanInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const total = items.length;
  const verifiedCount = Object.values(checkedMap).filter(Boolean).length;
  const unverifiedCount = Math.max(0, total - verifiedCount);
  const matchPercentage = total > 0 ? Math.round((verifiedCount / total) * 100) : 100;
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const getBookForCopy = (bookId: string) => books.find((b) => b.id === bookId);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const barcode = scanInput.trim().toUpperCase();
    if (!barcode) return;

    const matched = items.find((i) => i.itemBarcode.toUpperCase() === barcode);
    if (matched) {
      setCheckedMap((prev) => ({
        ...prev,
        [matched.itemBarcode]: true,
      }));
      soundFx.playSuccessChime();
      setScanInput('');
    } else {
      soundFx.playScanBeep();
      alert(`Barcode [${barcode}] tidak ditemukan dalam basis data eksemplar perpustakaan.`);
    }
  };

  const handleToggleCheck = (barcode: string) => {
    setCheckedMap((prev) => {
      const next = !prev[barcode];
      if (next) soundFx.playSuccessChime();
      else soundFx.playScanBeep();
      return { ...prev, [barcode]: next };
    });
  };

  const handleCheckAll = () => {
    const allChecked: Record<string, boolean> = {};
    items.forEach((i) => {
      allChecked[i.itemBarcode] = true;
    });
    setCheckedMap(allChecked);
    soundFx.playSuccessChime();
  };

  const handleResetCheck = () => {
    if (confirm('Reset seluruh tanda centang pemeriksaan fisik?')) {
      setCheckedMap({});
      soundFx.playScanBeep();
    }
  };

  const handleSaveAndPrintBeritaAcara = () => {
    const todayIso = new Date().toISOString().split('T')[0];
    const record: StockOpnameRecord = {
      id: `opname-${Date.now().toString(36)}`,
      date: todayIso,
      totalBooksAudited: total,
      matchedCount: verifiedCount,
      missingCount: unverifiedCount,
      auditedBy: schoolProfile.librarianName || 'Pustakawan SBTH',
      notes: notesInput.trim(),
    };

    libraryStore.saveStockOpnameRecord(record);
    setSchoolProfile(libraryStore.getSchoolProfile());
    soundFx.playSuccessChime();
    setIsPrintPreview(true);
    if (onFinished) onFinished();
  };

  const filteredItems = items.filter((item) => {
    const isChecked = !!checkedMap[item.itemBarcode];
    if (filterMode === 'CHECKED' && !isChecked) return false;
    if (filterMode === 'UNCHECKED' && isChecked) return false;
    if (filterMode === 'DAMAGED' && item.status !== 'DAMAGED' && item.status !== 'IN_REPAIR')
      return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const book = getBookForCopy(item.bookId);
      const matchBarcode = item.itemBarcode.toLowerCase().includes(q);
      const matchTitle = book?.title.toLowerCase().includes(q) || false;
      const matchShelf = item.shelfLocation?.toLowerCase().includes(q) || false;
      if (!matchBarcode && !matchTitle && !matchShelf) return false;
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-5xl rounded-3xl bg-surface border border-border p-6 shadow-2xl space-y-5 max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xs">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-text">
                Stock Opname & Audit Fisik Buku SBTH
              </h3>
              <p className="text-xs text-text-muted">
                Pemeriksaan fisik barcode buku di rak, pencatatan tanggal resmi & cetak Berita Acara
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isPrintPreview ? (
              <button
                type="button"
                onClick={() => setIsPrintPreview(true)}
                className="px-3 py-1.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5 text-amber-500" />
                <span>Lihat Berita Acara</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsPrintPreview(false)}
                className="px-3 py-1.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Kembali ke Audit Fisik</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-text-muted hover:text-text hover:bg-surface-2 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!isPrintPreview ? (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            {/* 4 Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-surface-2 border border-border">
                <span className="text-[11px] font-semibold text-text-muted">Total Terdaftar</span>
                <div className="text-2xl font-bold font-display text-text mt-1">{total} Eks</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[11px] font-semibold text-emerald-500">Terverifikasi Ada</span>
                <div className="text-2xl font-bold font-display text-emerald-500 mt-1">
                  {verifiedCount} Eks
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-[11px] font-semibold text-amber-500">Belum Diperiksa</span>
                <div className="text-2xl font-bold font-display text-amber-500 mt-1">
                  {unverifiedCount} Eks
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-2 border border-border">
                <span className="text-[11px] font-semibold text-text-muted">Kesesuaian Fisik</span>
                <div className="text-2xl font-bold font-display text-text mt-1">
                  {matchPercentage}%
                </div>
              </div>
            </div>

            {/* Barcode Scanner Bar */}
            <form
              onSubmit={handleScanSubmit}
              className="p-4 rounded-2xl bg-surface-2 border border-amber-500/40 shadow-xs flex flex-col sm:flex-row items-center gap-3"
            >
              <div className="flex items-center gap-2 text-amber-500 shrink-0 font-bold">
                <Barcode className="h-5 w-5" />
                <span>Scan Barcode Fisik:</span>
              </div>
              <input
                type="text"
                autoFocus
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="Arahkan scanner ke stiker buku atau ketik kode barcode (e.g. SBTH-B-00141) lalu Tekan Enter..."
                className="flex-1 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text font-mono font-bold outline-hidden focus:border-amber-500"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition active:scale-95 shrink-0"
              >
                Tandai Ada
              </button>
            </form>

            {/* Filter & Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-surface-2 border border-border">
              <div className="flex flex-wrap items-center gap-1.5 font-semibold">
                <button
                  type="button"
                  onClick={() => setFilterMode('ALL')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    filterMode === 'ALL'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-surface text-text-muted hover:text-text'
                  }`}
                >
                  Semua ({total})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('CHECKED')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    filterMode === 'CHECKED'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-surface text-emerald-500'
                  }`}
                >
                  Terverifikasi Ada ({verifiedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('UNCHECKED')}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    filterMode === 'UNCHECKED'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-surface text-amber-500'
                  }`}
                >
                  Belum Dicek ({unverifiedCount})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCheckAll}
                  className="px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-2 text-text text-xs font-semibold transition"
                >
                  Tandai Semua Ada
                </button>
                <button
                  type="button"
                  onClick={handleResetCheck}
                  className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs font-semibold transition"
                >
                  Reset Checklist
                </button>
              </div>
            </div>

            {/* Table of Items */}
            <div className="rounded-2xl border border-border overflow-hidden bg-surface shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-2 text-text-muted border-b border-border font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">Status</th>
                    <th className="py-2.5 px-3">Kode Barcode</th>
                    <th className="py-2.5 px-3">Judul Buku & Kategori</th>
                    <th className="py-2.5 px-3">Posisi Rak Fisik</th>
                    <th className="py-2.5 px-3">Kondisi Buku</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.map((item) => {
                    const book = getBookForCopy(item.bookId);
                    const isChecked = !!checkedMap[item.itemBarcode];

                    return (
                      <tr
                        key={item.id}
                        className={`transition cursor-pointer ${
                          isChecked ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : 'hover:bg-surface-2'
                        }`}
                        onClick={() => handleToggleCheck(item.itemBarcode)}
                      >
                        <td className="py-2.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleCheck(item.itemBarcode)}
                            className="h-4 w-4 rounded-md accent-amber-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-text">
                          {item.itemBarcode}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-text line-clamp-1">
                            {book?.title || 'Judul Buku'}
                          </div>
                          <div className="text-[10px] text-text-muted">{book?.author}</div>
                        </td>
                        <td className="py-2.5 px-3 text-text-muted">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-amber-500" />
                            <span>{item.shelfLocation || book?.shelfLocation || 'Rak Utama'}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              item.status === 'AVAILABLE'
                                ? 'bg-emerald-500/15 text-emerald-500'
                                : item.status === 'BORROWED'
                                ? 'bg-amber-500/15 text-amber-500'
                                : 'bg-rose-500/15 text-rose-500'
                            }`}
                          >
                            {item.status === 'AVAILABLE'
                              ? 'Prima / Ada di Rak'
                              : item.status === 'BORROWED'
                              ? 'Sedang Dipinjam'
                              : 'Perlu Perbaikan'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleCheck(item.itemBarcode);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              isChecked
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-surface-2 border border-border text-text-muted hover:text-text'
                            }`}
                          >
                            {isChecked ? 'Sudah Ada ✓' : 'Tandai Ada'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Notes & Execution Bar */}
            <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-3">
              <label className="font-bold text-text block">
                Catatan Berita Acara Hasil Audit Fisik:
              </label>
              <textarea
                rows={2}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Catatan hasil stock opname, temuan buku rusak atau hilang..."
                className="w-full rounded-xl border border-border bg-surface p-3 text-xs text-text outline-hidden"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleSaveAndPrintBeritaAcara}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  <span>Selesaikan Audit & Buat Berita Acara Resmi</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             OFFICIAL PRINTABLE BERITA ACARA STOCK OPNAME
             ========================================================================= */
          <div className="flex-1 overflow-y-auto space-y-6 pr-1 text-xs">
            <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-lg border border-slate-200 max-w-3xl mx-auto print:shadow-none print:border-none print:p-0">
              {/* Kop Surat Resmi */}
              <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                <h2 className="text-base font-extrabold tracking-wider uppercase">
                  {schoolProfile.name}
                </h2>
                <p className="text-[11px] text-slate-600">
                  {schoolProfile.tagline} • {schoolProfile.address}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Telepon: {schoolProfile.phone} | Instagram: {schoolProfile.instagram}
                </p>
              </div>

              {/* Judul Berita Acara */}
              <div className="text-center py-5 space-y-1">
                <h3 className="text-sm font-bold uppercase underline tracking-wide">
                  BERITA ACARA STOCK OPNAME FISIK PERPUSTAKAAN
                </h3>
                <p className="text-xs text-slate-600">
                  Nomor: BA-SO/SBTH/{new Date().getFullYear()}/
                  {String(new Date().getMonth() + 1).padStart(2, '0')}/001
                </p>
              </div>

              {/* Paragraf Pembuka */}
              <div className="text-xs text-slate-700 leading-relaxed space-y-2">
                <p>
                  Pada hari ini, <strong>{todayFormatted}</strong>, telah dilaksanakan kegiatan inventarisasi fisik (Stock Opname) menyeluruh terhadap seluruh koleksi buku dan bahan pustaka pada perpustakaan {schoolProfile.name} dengan rincian akuntabilitas sebagai berikut:
                </p>
              </div>

              {/* Rekapitulasi Tabel */}
              <div className="py-4">
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300">
                    <tr>
                      <th className="py-2 px-3 border-r border-slate-300">Uraian Parameter Audit</th>
                      <th className="py-2 px-3 text-right">Jumlah / Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    <tr>
                      <td className="py-2 px-3 border-r border-slate-300">Total Eksemplar Terdaftar di Basis Data</td>
                      <td className="py-2 px-3 text-right font-bold">{total} Eksemplar</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border-r border-slate-300">Fisik Terverifikasi Ada & Siap Layanan</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700">{verifiedCount} Eksemplar</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border-r border-slate-300">Eksemplar Belum Ditemukan / Selisih Fisik</td>
                      <td className="py-2 px-3 text-right font-bold text-rose-700">{unverifiedCount} Eksemplar</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border-r border-slate-300">Persentase Tingkat Kesesuaian Fisik</td>
                      <td className="py-2 px-3 text-right font-bold text-indigo-700">{matchPercentage}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Catatan Khusus */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-1">
                <strong className="block">Catatan Hasil Pelaksanaan:</strong>
                <p>{notesInput || 'Seluruh eksemplar fisik berada dalam kondisi baik dan penataan rak terorganisir.'}</p>
              </div>

              {/* Kolom Tanda Tangan Resmi (Editable Headmaster & Librarian) */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <p className="text-slate-600">Mengetahui,</p>
                  <p className="font-bold text-slate-900 mt-0.5">Kepala Sekolah KB-TK SBTH</p>
                  <div className="h-16" />
                  <p className="font-bold underline text-slate-900">
                    ( {schoolProfile.headmasterName || 'Kepala Sekolah KB-TK SBTH'} )
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {schoolProfile.headmasterNip ? `NIP. ${schoolProfile.headmasterNip}` : 'NIP. -'}
                  </p>
                </div>

                <div>
                  <p className="text-slate-600">Dibuat oleh,</p>
                  <p className="font-bold text-slate-900 mt-0.5">Penanggung Jawab Perpustakaan</p>
                  <div className="h-16" />
                  <p className="font-bold underline text-slate-900">
                    ( {schoolProfile.librarianName || 'Pustakawan SBTH'} )
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {schoolProfile.librarianNip || 'Perpustakaan SBTH Magelang'}
                  </p>
                </div>
              </div>
            </div>

            {/* Print Trigger Button */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Berita Acara Sekarang (Print / PDF)</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-surface-2 hover:bg-surface text-text font-bold text-xs border border-border transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
