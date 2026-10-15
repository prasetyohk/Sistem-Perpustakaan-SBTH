'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Printer,
  Sparkles,
  Info,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Book, BookItem, CategoryId } from '@/types';
import { CATEGORIES } from '@/lib/constants';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';

interface ExcelModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLabelPrinter?: (barcodes: string[]) => void;
  onDataImported?: () => void;
}

export const ExcelModuleModal: React.FC<ExcelModuleModalProps> = ({
  isOpen,
  onClose,
  onOpenLabelPrinter,
  onDataImported,
}) => {
  const [activeTab, setActiveTab] = useState<'IMPORT' | 'EXPORT'>('IMPORT');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const [importedBarcodes, setImportedBarcodes] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);

  if (!isOpen) return null;

  // 1. Download Master Template Excel (.xlsx)
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'ISBN (Opsional)': '9786022497653',
        'Judul Buku': 'Kancil dan Buaya yang Cerdik',
        'Pengarang': 'Kak Bambang',
        'Penerbit': 'Erlangga for Kids',
        'Kategori': 'DONGENG',
        'Lokasi Rak': 'Rak B-1',
        'Jumlah Buku': 3,
        'Sumber': 'BELI',
      },
      {
        'ISBN (Opsional)': '9786020524412',
        'Judul Buku': 'Seri Hewan Liar: Mengapa Jerapah Lehernya Panjang?',
        'Pengarang': 'dr. Satwa',
        'Penerbit': 'Gramedia Pustaka Utama',
        'Kategori': 'ALAM',
        'Lokasi Rak': 'Rak A-1',
        'Jumlah Buku': 2,
        'Sumber': 'HIBAH_ORTU',
      },
      {
        'ISBN (Opsional)': '9786230304561',
        'Judul Buku': '', // Kosong sengaja untuk demo Auto-fetch Google Books
        'Pengarang': '',
        'Penerbit': '',
        'Kategori': 'AKTIVITAS',
        'Lokasi Rak': 'Rak C-1',
        'Jumlah Buku': 2,
        'Sumber': 'BOS',
      },
      {
        'ISBN (Opsional)': '',
        'Judul Buku': 'Mengenal Adab Makan & Berdoa Bersama Mimi',
        'Pengarang': 'Bunda Hani',
        'Penerbit': 'Mizan Kids',
        'Kategori': 'KARAKTER',
        'Lokasi Rak': 'Rak D-1',
        'Jumlah Buku': 4,
        'Sumber': 'BELI',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set columns width
    ws['!cols'] = [
      { wch: 18 }, // ISBN
      { wch: 45 }, // Judul
      { wch: 22 }, // Pengarang
      { wch: 25 }, // Penerbit
      { wch: 14 }, // Kategori
      { wch: 14 }, // Rak
      { wch: 12 }, // Jumlah
      { wch: 12 }, // Sumber
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Buku_SBTH');

    XLSX.writeFile(wb, 'Template_Master_Impor_Buku_SBTH_TK.xlsx');
    soundFx.playScanBeep();
  };

  // 2. Handle File Upload & Smart Import
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportStatus('Membaca file Excel...');
    setImportedBarcodes([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      if (rows.length === 0) {
        alert('File Excel kosong atau format tabel tidak dikenali.');
        setIsProcessing(false);
        return;
      }

      setPreviewRows(rows);
      setImportStatus(`Ditemukan ${rows.length} judul buku. Sedang memproses & melengkapi metadata...`);

      const allNewBarcodes: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        let isbn = String(row['ISBN (Opsional)'] || row['ISBN'] || '').trim();
        let title = String(row['Judul Buku'] || row['Judul'] || '').trim();
        let author = String(row['Pengarang'] || row['Penulis'] || '').trim();
        let publisher = String(row['Penerbit'] || '').trim();
        let catCode = String(row['Kategori'] || 'DONGENG').toUpperCase().trim();
        let count = parseInt(row['Jumlah Buku'] || row['Jumlah'] || '1', 10) || 1;
        let source = String(row['Sumber'] || 'BELI').toUpperCase() as BookItem['source'];

        // Map category string to CategoryId
        let categoryId: CategoryId = 'cat-dongeng';
        if (catCode.includes('ALAM') || catCode.includes('SAINS')) categoryId = 'cat-alam';
        else if (catCode.includes('AKTIVITAS') || catCode.includes('BACA') || catCode.includes('HITUNG')) categoryId = 'cat-aktivitas';
        else if (catCode.includes('KARAKTER') || catCode.includes('AGAMA') || catCode.includes('BUDI')) categoryId = 'cat-karakter';

        // Auto-fetch via Google Books if title is empty but ISBN exists
        if (!title && isbn) {
          setImportStatus(`Mengambil data Google Books untuk ISBN: ${isbn}...`);
          try {
            const cleanIsbn = isbn.replace(/[-\s]/g, '');
            const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`);
            const gData = await res.json();
            if (gData.items?.[0]?.volumeInfo) {
              const info = gData.items[0].volumeInfo;
              title = info.title || `Buku ISBN ${isbn}`;
              author = info.authors ? info.authors.join(', ') : author || 'Penulis Buku';
              publisher = info.publisher || publisher || 'Penerbit';
            }
          } catch (e) {
            console.warn('Google Books fallback error:', e);
          }
        }

        if (!title) {
          title = isbn ? `Buku Tanpa Judul (${isbn})` : `Buku SBTH Baru Baris ${i + 1}`;
        }

        // Add to storage
        const { newItems } = libraryStore.addBook(
          {
            isbn: isbn || `EXCEL-${Date.now().toString().slice(-6)}-${i}`,
            title,
            author: author || 'Tim Guru SBTH',
            publisher: publisher || 'Penerbit SBTH',
            publicationYear: '2024',
            categoryId,
            ageGroup: 'TK_A',
            synopsis: `Buku impor dari batch Excel perpustakaan SBTH TK.`,
            coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
          },
          count,
          ['BELI', 'HIBAH_ORTU', 'BOS', 'YAYASAN'].includes(source) ? source : 'BELI'
        );

        newItems.forEach((it) => allNewBarcodes.push(it.itemBarcode));
      }

      setImportedBarcodes(allNewBarcodes);
      setImportStatus(`Sukses mengimpor ${rows.length} judul (${allNewBarcodes.length} eksemplar fisik diterbitkan)!`);
      soundFx.playSuccessChime();

      if (onDataImported) onDataImported();
    } catch (err: any) {
      console.error('Import error:', err);
      alert('Terjadi kesalahan saat memproses file Excel.');
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Export Comprehensive 5-Sheet Excel Backup
  const handleExportFullReport = () => {
    setIsProcessing(true);
    const wb = libraryStore.generate5SheetExcelWorkbook();
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Backup_Full_Perpus_SBTH_TK_${dateStr}.xlsx`);
    setIsProcessing(false);
    soundFx.playSuccessChime();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-5 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Modul Ekspor & Impor Excel (.xlsx)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Smart Bulk Import (1 Baris = 1 Judul + Jumlah) & Rekap Laporan Yayasan
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

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('IMPORT')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'IMPORT'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Upload className="h-4 w-4" />
            1. Impor Excel ("Smart Bulk Import")
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('EXPORT')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'EXPORT'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Download className="h-4 w-4" />
            2. Ekspor Laporan 3-Sheet (.xlsx)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {activeTab === 'IMPORT' && (
            <div className="space-y-5">
              {/* Step 1: Template Download */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Download className="h-4 w-4 text-emerald-600" />
                    Langkah 1: Unduh Format Template Excel SBTH TK
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Kolom sederhana: ISBN, Judul, Pengarang, Penerbit, Kategori, Lokasi Rak, Jumlah Buku.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-600 shadow-xs shrink-0 flex items-center gap-1.5 transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  Unduh Template (.xlsx)
                </button>
              </div>

              {/* Step 2: Upload File Box */}
              <div className="rounded-3xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 p-8 text-center flex flex-col items-center justify-center relative hover:border-emerald-500 transition">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 mb-3">
                  <Upload className="h-7 w-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Langkah 2: Tarik & Letakkan File Excel Di Sini
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Atau klik untuk memilih file dari komputer Anda (.xlsx / .csv).
                </p>

                {isProcessing && (
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{importStatus}</span>
                  </div>
                )}
              </div>

              {/* Status and Batch Print Trigger */}
              {importedBarcodes.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>{importStatus}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Kode barcode fisik berurutan telah di-generate untuk semua eksemplar. Anda dapat langsung mencetak seluruh stiker dalam satu klik!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenLabelPrinter) {
                        onOpenLabelPrinter(importedBarcodes);
                      }
                      onClose();
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/30 flex items-center justify-center gap-2 transition"
                  >
                    <Printer className="h-4 w-4" />
                    Cetak Semua Barcode dari Batch Impor Ini ({importedBarcodes.length} Stiker)
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'EXPORT' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-blue-500" />
                  Format Ekspor Excel 5-Sheet Standar Yayasan SBTH TK:
                </h4>
                <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1.5 list-disc list-inside">
                  <li>
                    <strong>Sheet 1 (Rekap_Bulanan):</strong> Buku masuk (beli vs sumbangan), sirkulasi, buku rusak/hilang, dan rekap kas denda keterlambatan masuk.
                  </li>
                  <li>
                    <strong>Sheet 2 (Master_Katalog):</strong> ISBN, judul, pengarang, penerbit, warna kategori, rak, total stok, dan ketersediaan.
                  </li>
                  <li>
                    <strong>Sheet 3 (Inventaris_Fisik_SBTH):</strong> Seluruh kode barcode fisik <code>SBTH-B-xxxxx</code>, sumber beli/sumbangan, nama penyumbang, dan harga nilai buku.
                  </li>
                  <li>
                    <strong>Sheet 4 (Sirkulasi_Pinjaman):</strong> Riwayat transaksi pinjaman siswa/kelas, tanggal jatuh tempo, dan tanggal kembali.
                  </li>
                  <li>
                    <strong>Sheet 5 (Data_Anggota_TK):</strong> Kode anggota siswa <code>SBTH-M-xxxx</code>, kelas, dan nomor WhatsApp orang tua.
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleExportFullReport}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition"
                >
                  <Download className="h-5 w-5" />
                  {isProcessing ? 'Sedang Mengompilasi File...' : 'Unduh Laporan Perpustakaan Lengkap (.xlsx)'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
