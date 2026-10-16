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
  Layers,
  FolderCheck,
  CheckSquare,
  Square,
  ArrowRight,
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
  const [finishedShelves, setFinishedShelves] = useState<string[]>([]);
  const [selectedShelf, setSelectedShelf] = useState<string>('ALL');
  const [scanInput, setScanInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>(
    'Stock opname fisik berkala koleksi perpustakaan KB-TK SBTH Magelang.'
  );
  const [filterMode, setFilterMode] = useState<'ALL' | 'CHECKED' | 'UNCHECKED' | 'DAMAGED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPrintPreview, setIsPrintPreview] = useState<boolean>(false);
  const [historyRecords, setHistoryRecords] = useState<StockOpnameRecord[]>([]);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const allItems = libraryStore.getBookItems();
      const allBooks = libraryStore.getBooks();
      setItems(allItems);
      setBooks(allBooks);
      setSchoolProfile(libraryStore.getSchoolProfile());
      setHistoryRecords(libraryStore.getStockOpnameRecords());

      // Restore saved batch draft if exists
      const draft = libraryStore.getStockOpnameDraft();
      if (draft && draft.checkedMap && Object.keys(draft.checkedMap).length > 0) {
        setCheckedMap(draft.checkedMap);
        setFinishedShelves(draft.finishedShelves || []);
        if (draft.notes) setNotesInput(draft.notes);
        setDraftNotice(
          `Draft audit bertahap dimuat (Terakhir disimpan: ${new Date(
            draft.lastUpdated || draft.lastSavedDate || Date.now()
          ).toLocaleTimeString('id-ID')})`
        );
      } else {
        setCheckedMap({});
        setFinishedShelves([]);
        setDraftNotice(null);
      }

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

  // Compute unique shelves
  const systemShelves = libraryStore.getShelves();
  const uniqueShelves = Array.from(
    new Set([
      ...items.map((i) => i.shelfLocation).filter(Boolean),
      ...books.map((b) => b.shelfLocation).filter(Boolean),
      ...systemShelves.map((s) => `${s.name} - Baris 1`),
    ])
  ) as string[];

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const barcode = scanInput.trim().toUpperCase();
    if (!barcode) return;

    const matched = items.find((i) => i.itemBarcode.toUpperCase() === barcode);
    if (matched) {
      setCheckedMap((prev) => {
        const next = { ...prev, [matched.itemBarcode]: true };
        // Auto save to draft
        libraryStore.saveStockOpnameDraft({
          checkedMap: next,
          finishedShelves,
          notes: notesInput,
          lastUpdated: new Date().toISOString(),
        });
        return next;
      });
      soundFx.playSuccessChime();
      setScanInput('');
    } else {
      soundFx.playScanBeep();
      alert(`Barcode [${barcode}] tidak ditemukan dalam basis data eksemplar perpustakaan.`);
    }
  };

  const handleToggleCheck = (barcode: string) => {
    setCheckedMap((prev) => {
      const nextVal = !prev[barcode];
      const nextMap = { ...prev, [barcode]: nextVal };
      if (nextVal) soundFx.playSuccessChime();
      else soundFx.playScanBeep();

      // Auto save to draft
      libraryStore.saveStockOpnameDraft({
        checkedMap: nextMap,
        finishedShelves,
        notes: notesInput,
        lastUpdated: new Date().toISOString(),
      });
      return nextMap;
    });
  };

  const handleSaveDraft = () => {
    libraryStore.saveStockOpnameDraft({
      checkedMap,
      finishedShelves,
      notes: notesInput,
      lastUpdated: new Date().toISOString(),
    });
    soundFx.playSuccessChime();
    setDraftNotice(
      `Draft batch tersimpan aman pada ${new Date().toLocaleTimeString('id-ID')}`
    );
  };

  const handleToggleShelfFinished = (shelf: string) => {
    const isDone = finishedShelves.includes(shelf);
    let next: string[];
    if (isDone) {
      next = finishedShelves.filter((s) => s !== shelf);
    } else {
      next = [...finishedShelves, shelf];
      soundFx.playSuccessChime();
    }
    setFinishedShelves(next);
    libraryStore.saveStockOpnameDraft({
      checkedMap,
      finishedShelves: next,
      notes: notesInput,
      lastUpdated: new Date().toISOString(),
    });
  };

  const handleCheckAllCurrentView = () => {
    const nextMap = { ...checkedMap };
    filteredItems.forEach((i) => {
      nextMap[i.itemBarcode] = true;
    });
    setCheckedMap(nextMap);
    libraryStore.saveStockOpnameDraft({
      checkedMap: nextMap,
      finishedShelves,
      notes: notesInput,
      lastUpdated: new Date().toISOString(),
    });
    soundFx.playSuccessChime();
  };

  const handleResetCheck = () => {
    if (confirm('Reset seluruh tanda centang pemeriksaan fisik dan hapus draft batch?')) {
      setCheckedMap({});
      setFinishedShelves([]);
      libraryStore.clearStockOpnameDraft();
      setDraftNotice(null);
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
    libraryStore.clearStockOpnameDraft();
    setDraftNotice(null);
    setSchoolProfile(libraryStore.getSchoolProfile());
    soundFx.playSuccessChime();
    setIsPrintPreview(true);
    if (onFinished) onFinished();
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const isChecked = !!checkedMap[item.itemBarcode];
    if (filterMode === 'CHECKED' && !isChecked) return false;
    if (filterMode === 'UNCHECKED' && isChecked) return false;
    if (filterMode === 'DAMAGED' && item.status !== 'DAMAGED' && item.status !== 'IN_REPAIR')
      return false;

    // Filter per shelf
    if (selectedShelf !== 'ALL') {
      const book = getBookForCopy(item.bookId);
      const itemShelf = item.shelfLocation || book?.shelfLocation || '';
      if (itemShelf !== selectedShelf) return false;
    }

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
              <h3 className="text-base sm:text-lg font-bold font-display text-text flex items-center gap-2">
                <span>Stock Opname & Audit Fisik Buku SBTH</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Mode Bertahap / Per Rak
                </span>
              </h3>
              <p className="text-xs text-text-muted">
                Audit fisik barcode di rak, simpan per-batch/rak, tandai mapping rak selesai, dan buat Berita Acara global.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isPrintPreview ? (
              <>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  title="Simpan progres audit saat ini agar tidak hilang saat ditutup"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Simpan Draft</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintPreview(true)}
                  className="px-3 py-1.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 text-amber-500" />
                  <span>Lihat Berita Acara</span>
                </button>
              </>
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
            {/* Draft Banner Notice if any */}
            {draftNotice && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-500 animate-in fade-in">
                <div className="flex items-center gap-2 font-medium">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>{draftNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-600 transition"
                >
                  Simpan Progres Lagi
                </button>
              </div>
            )}

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

            {/* MAPPING RAK & PROGRESS PER BATCH */}
            <div className="p-4 rounded-2xl bg-surface-2 border border-border space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-text">
                  <Layers className="h-4 w-4 text-amber-500" />
                  <span>Mapping Progres Audit per Rak Fisik ({uniqueShelves.length} Rak)</span>
                </div>
                <div className="text-[11px] text-text-muted">
                  Klik rak untuk memfilter & mengaudit per batch
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <div
                  onClick={() => setSelectedShelf('ALL')}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    selectedShelf === 'ALL'
                      ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                      : 'border-border bg-surface hover:bg-surface-2'
                  }`}
                >
                  <div>
                    <div className="font-bold text-text">Semua Rak Perpustakaan</div>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      {verifiedCount} dari {total} eksemplar terverifikasi
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-500">
                    {matchPercentage}%
                  </span>
                </div>

                {uniqueShelves.map((shelf) => {
                  const shelfItems = items.filter((i) => {
                    const book = getBookForCopy(i.bookId);
                    return (i.shelfLocation || book?.shelfLocation || '') === shelf;
                  });
                  const shelfVerified = shelfItems.filter((i) => checkedMap[i.itemBarcode]).length;
                  const isDone =
                    finishedShelves.includes(shelf) ||
                    (shelfItems.length > 0 && shelfVerified === shelfItems.length);
                  const isStarted = shelfVerified > 0;
                  const isSelected = selectedShelf === shelf;

                  return (
                    <div
                      key={shelf}
                      onClick={() => setSelectedShelf(shelf)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                          : 'border-border bg-surface hover:bg-surface-2'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-text line-clamp-1 flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                          <span title={shelf}>{shelf}</span>
                        </div>
                        {isDone ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-500 text-[10px] font-bold shrink-0">
                            ✓ Selesai
                          </span>
                        ) : isStarted ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-500 text-[10px] font-bold shrink-0">
                            Dalam Proses
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-slate-500/20 text-slate-400 text-[10px] font-semibold shrink-0">
                            Belum
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-text-muted">
                        <span>
                          {shelfVerified} / {shelfItems.length} Buku Ada
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleShelfFinished(shelf);
                          }}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${
                            isDone
                              ? 'text-rose-400 hover:bg-rose-500/10'
                              : 'text-emerald-500 hover:bg-emerald-500/10'
                          }`}
                        >
                          {isDone ? 'Batal Selesai' : 'Tandai Selesai'}
                        </button>
                      </div>
                    </div>
                  );
                })}
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
                placeholder="Arahkan scanner ke stiker buku atau ketik kode barcode (e.g. B00001/2026) lalu Tekan Enter..."
                className="flex-1 w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-text font-mono font-bold outline-hidden focus:border-amber-500"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
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
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    filterMode === 'ALL'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-surface text-text-muted hover:text-text'
                  }`}
                >
                  Semua ({filteredItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('CHECKED')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    filterMode === 'CHECKED'
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-surface text-emerald-500'
                  }`}
                >
                  Terverifikasi Ada
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('UNCHECKED')}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    filterMode === 'UNCHECKED'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-surface text-amber-500'
                  }`}
                >
                  Belum Dicek
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCheckAllCurrentView}
                  className="px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-2 text-text text-xs font-semibold transition cursor-pointer"
                  title="Tandai semua buku pada tampilan/filter ini sebagai ada"
                >
                  Tandai Tampilan Ini Ada
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Simpan Batch</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetCheck}
                  className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs font-semibold transition cursor-pointer"
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
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface border border-border hover:bg-surface-3 text-text font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Save className="h-4 w-4 text-amber-500" />
                  <span>Simpan Progres Batch (Lanjut Nanti)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndPrintBeritaAcara}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
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
                <p className="text-xs text-slate-600 font-mono">
                  Nomor: BA-SO/SBTH/{new Date().getFullYear()}/
                  {String(new Date().getMonth() + 1).padStart(2, '0')}/001
                </p>
              </div>

              {/* Paragraf Pembuka */}
              <div className="text-xs text-slate-700 leading-relaxed space-y-2">
                <p>
                  Pada hari ini, <strong>{todayFormatted}</strong>, telah dilaksanakan kegiatan inventarisasi fisik (Stock Opname) menyeluruh dan bertahap terhadap seluruh koleksi buku dan bahan pustaka pada perpustakaan {schoolProfile.name} dengan rincian akuntabilitas sebagai berikut:
                </p>
              </div>

              {/* Rekapitulasi Tabel Global */}
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

              {/* Breakdown per Rak Fisik */}
              <div className="py-2 space-y-2">
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Rincian Hasil Pengecekan per Rak Fisik:
                </h4>
                <table className="w-full text-left text-[11px] border border-slate-300">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300">
                    <tr>
                      <th className="py-1.5 px-2 border-r border-slate-300">Lokasi / Nama Rak</th>
                      <th className="py-1.5 px-2 text-center border-r border-slate-300">Total Buku</th>
                      <th className="py-1.5 px-2 text-center border-r border-slate-300 text-emerald-700">Ada</th>
                      <th className="py-1.5 px-2 text-center border-r border-slate-300 text-rose-700">Selisih</th>
                      <th className="py-1.5 px-2 text-center">Status Rak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {uniqueShelves.map((shelf) => {
                      const shelfItems = items.filter((i) => {
                        const book = getBookForCopy(i.bookId);
                        return (i.shelfLocation || book?.shelfLocation || '') === shelf;
                      });
                      const shelfVerified = shelfItems.filter((i) => checkedMap[i.itemBarcode]).length;
                      const diff = shelfItems.length - shelfVerified;
                      const isDone =
                        finishedShelves.includes(shelf) ||
                        (shelfItems.length > 0 && shelfVerified === shelfItems.length);

                      return (
                        <tr key={shelf}>
                          <td className="py-1.5 px-2 border-r border-slate-300 font-medium">{shelf}</td>
                          <td className="py-1.5 px-2 text-center border-r border-slate-300">{shelfItems.length}</td>
                          <td className="py-1.5 px-2 text-center border-r border-slate-300 text-emerald-700 font-semibold">{shelfVerified}</td>
                          <td className="py-1.5 px-2 text-center border-r border-slate-300 text-rose-700 font-semibold">{diff}</td>
                          <td className="py-1.5 px-2 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                              {isDone ? 'Selesai ✓' : 'Belum'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Catatan Khusus */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-1">
                <strong className="block">Catatan Hasil Pelaksanaan:</strong>
                <p>{notesInput || 'Seluruh eksemplar fisik berada dalam kondisi baik dan penataan rak terorganisir.'}</p>
              </div>

              {/* Kolom Tanda Tangan Resmi */}
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
        <div className="pt-3 border-t border-border flex items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-text-muted">
            {verifiedCount > 0 && (
              <span>✓ {verifiedCount} dari {total} eksemplar terverifikasi fisik</span>
            )}
          </div>
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
