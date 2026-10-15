'use client';

import React, { useState, useEffect } from 'react';
import {
  Send,
  X,
  ShieldCheck,
  Bot,
  Terminal,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  Download,
  Clock,
  Sparkles,
  RefreshCw,
  Edit3,
  Save,
  RotateCcw,
} from 'lucide-react';
import { TelegramConfig, TelegramCommandTemplate } from '@/types';
import { libraryStore } from '@/lib/storage';
import { testTelegramConnection, sendTelegramWeeklyBackup, handleSimulateCommand } from '@/lib/telegram';
import { soundFx } from '@/lib/sound';

interface TelegramBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramBackupModal: React.FC<TelegramBackupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'CONFIG' | 'REPORT_PREVIEW' | 'COMMANDS' | 'TEMPLATES' | 'LOGS'>('CONFIG');
  const [config, setConfig] = useState<TelegramConfig>(libraryStore.getTelegramConfig());
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSendingBackup, setIsSendingBackup] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);

  // Command console simulation
  const [selectedCommand, setSelectedCommand] = useState<string>('/rekap_mingguan');
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [previewReport, setPreviewReport] = useState<string>('');

  // Templates editor state
  const [templates, setTemplates] = useState<TelegramCommandTemplate[]>(libraryStore.getTelegramTemplates());
  const [editingCommand, setEditingCommand] = useState<string>('/rekap_mingguan');
  const [editingText, setEditingText] = useState<string>('');
  const [isTemplateSaved, setIsTemplateSaved] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setPreviewReport(libraryStore.generateWeeklyReportText());
      setConsoleOutput(handleSimulateCommand(selectedCommand));
      setConfig(libraryStore.getTelegramConfig());
      const tpls = libraryStore.getTelegramTemplates();
      setTemplates(tpls);
      const current = tpls.find((t) => t.command === editingCommand) || tpls[0];
      if (current) {
        setEditingText(current.template);
      }
    }
  }, [isOpen, selectedCommand]);

  const handleSelectTemplateCommand = (cmd: string) => {
    setEditingCommand(cmd);
    const found = templates.find((t) => t.command === cmd);
    if (found) {
      setEditingText(found.template);
    }
    setIsTemplateSaved(false);
  };

  const handleSaveCurrentTemplate = () => {
    const updated = templates.map((t) =>
      t.command === editingCommand ? { ...t, template: editingText } : t
    );
    setTemplates(updated);
    libraryStore.saveTelegramTemplates(updated);
    setIsTemplateSaved(true);
    soundFx.playSuccessChime();
    setTimeout(() => setIsTemplateSaved(false), 3000);
    // Refresh console simulation if on same command
    if (selectedCommand === editingCommand) {
      setConsoleOutput(handleSimulateCommand(editingCommand));
    }
  };

  const handleResetTemplatesToDefault = () => {
    if (confirm('Kembalikan seluruh format teks perintah Telegram ke standar pabrik SBTH?')) {
      libraryStore.resetToDefault();
      const fresh = libraryStore.getTelegramTemplates();
      setTemplates(fresh);
      const curr = fresh.find((t) => t.command === editingCommand) || fresh[0];
      if (curr) setEditingText(curr.template);
      soundFx.playScanBeep();
      alert('Format perintah Telegram berhasil dikembalikan ke default!');
    }
  };

  const handleInsertTag = (tag: string) => {
    setEditingText((prev) => prev + tag);
  };

  if (!isOpen) return null;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    libraryStore.saveTelegramConfig(config);
    soundFx.playScanBeep();
    alert('Pengaturan Bot Telegram berhasil disimpan!');
  };

  const handleTestConnection = async () => {
    if (!config.botToken || !config.chatId) {
      alert('Masukkan Bot Token dan Chat ID terlebih dahulu.');
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    const res = await testTelegramConnection(config.botToken, config.chatId);
    setIsTesting(false);
    if (res.success) {
      soundFx.playSuccessChime();
      setTestResult({ success: true, message: 'Koneksi ke Bot Telegram SBTH Berhasil!' });
    } else {
      soundFx.playErrorBeep();
      setTestResult({ success: false, message: res.error || 'Gagal terhubung ke Telegram.' });
    }
  };

  const handleSendBackupNow = async () => {
    if (!config.botToken || !config.chatId) {
      alert('Harap isi Bot Token dan Chat ID Telegram di tab Pengaturan terlebih dahulu.');
      setActiveTab('CONFIG');
      return;
    }
    setIsSendingBackup(true);
    const res = await sendTelegramWeeklyBackup(config.botToken, config.chatId);
    setIsSendingBackup(false);

    if (res.success) {
      soundFx.playSuccessChime();
      alert('🎉 Sukses! Laporan mingguan dan file 5-Sheet Excel backup telah terkirim ke Telegram.');
      setConfig(libraryStore.getTelegramConfig());
    } else {
      soundFx.playErrorBeep();
      alert(`Gagal mengirim ke Telegram: ${res.error}`);
    }
  };

  const handleRunCommand = (cmd: string) => {
    setSelectedCommand(cmd);
    const out = handleSimulateCommand(cmd);
    setConsoleOutput(out);
    soundFx.playScanBeep();
  };

  const backupLogs = libraryStore.getBackupLogs();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 my-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-5 bg-gradient-to-r from-blue-600/10 via-sky-500/10 to-emerald-500/10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Pusat Bot Telegram & Triple Auto-Backup
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Laporan Otomatis Mingguan/Bulanan ke HP Kepala Sekolah & Format Perintah Editable 100% Aman
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

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 gap-2 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('CONFIG')}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'CONFIG'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Bot className="h-4 w-4" />
            1. Pengaturan Bot & Token
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('REPORT_PREVIEW')}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'REPORT_PREVIEW'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            2. Pratinjau Laporan & Kirim Backup
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('COMMANDS')}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'COMMANDS'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Terminal className="h-4 w-4" />
            3. Simulasi Perintah Bot (HP)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TEMPLATES')}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'TEMPLATES'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Edit3 className="h-4 w-4" />
            4. ✏️ Edit Format & Bahasa Perintah
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LOGS')}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'LOGS'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="h-4 w-4" />
            5. Riwayat Backup ({backupLogs.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* TAB 1: BOT CONFIG */}
          {activeTab === 'CONFIG' && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Keunggulan Bot Telegram SBTH TK:</p>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                    100% Gratis selamanya, mendukung kirim file spreadsheet backup .xlsx hingga 50MB, dan Kepala Sekolah/Guru dapat mengetik perintah kapan saja dari HP.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Telegram Bot Token (dari @BotFather)
                  </label>
                  <input
                    type="password"
                    placeholder="Contoh: 1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    value={config.botToken}
                    onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-mono outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Telegram Chat ID / Group ID (HP Kepala Sekolah atau Grup Yayasan)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: -100123456789 atau 987654321"
                    value={config.chatId}
                    onChange={(e) => setConfig({ ...config, chatId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-mono outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Link Live Google Sheets (Arsip Cloud Sekunder)
                  </label>
                  <input
                    type="text"
                    value={config.googleSheetsUrl}
                    onChange={(e) => setConfig({ ...config, googleSheetsUrl: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs outline-hidden focus:border-blue-500"
                  />
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Tes Kirim Sinyal Bot
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition"
                  >
                    Simpan Pengaturan
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: REPORT PREVIEW & SEND BACKUP */}
          {activeTab === 'REPORT_PREVIEW' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Pratinjau Pesan Laporan Mingguan Telegram:
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Format rapi dengan rekap buku baru, perolehan beli vs sumbangan, sirkulasi, dan kas denda.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSendBackupNow}
                  disabled={isSendingBackup}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 transition"
                >
                  {isSendingBackup ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Kirim Laporan & File Excel ke Telegram Sekarang
                </button>
              </div>

              {/* Telegram Message Box Preview */}
              <div className="rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs p-5 shadow-inner leading-relaxed whitespace-pre-wrap border border-slate-800 max-h-96 overflow-y-auto">
                {previewReport || 'Memuat pratinjau laporan mingguan...'}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  File Terlampir: <strong>Backup_Full_Perpus_SBTH_TK.xlsx</strong> (5 Tab Sheet Standar)
                </span>
                <span className="text-emerald-600 font-semibold">Ukuran: ~45 KB</span>
              </div>
            </div>
          )}

          {/* TAB 3: COMMANDS CONSOLE */}
          {activeTab === 'COMMANDS' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Simulasi Perintah Bot Interaktif (On-Demand Commands)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Kepala Sekolah atau Guru dapat mengetik perintah berikut di chat Telegram dari smartphone:
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { cmd: '/rekap_hari_ini', desc: 'Statistik Hari Ini' },
                  { cmd: '/rekap_mingguan', desc: 'Laporan Mingguan Lengkap' },
                  { cmd: '/rekap_bulanan', desc: 'Laporan Bulanan Resmi' },
                  { cmd: '/cek_terlambat', desc: 'Daftar Siswa Telat + No WA' },
                  { cmd: '/backup_sekarang', desc: 'Kirim File Backup .xlsx' },
                ].map((item) => (
                  <button
                    key={item.cmd}
                    type="button"
                    onClick={() => handleRunCommand(item.cmd)}
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                      selectedCommand === item.cmd
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <span>{item.cmd}</span>
                    <span className="text-[10px] opacity-75 font-sans font-normal">
                      ({item.desc})
                    </span>
                  </button>
                ))}
              </div>

              {/* Virtual Telegram Screen */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 text-xs font-mono space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
                  <span>Chat dengan: @SBTH_Perpus_Bot</span>
                  <span className="text-emerald-400">Online</span>
                </div>
                <div className="space-y-2">
                  <div className="text-right">
                    <span className="inline-block px-3 py-1.5 rounded-2xl bg-blue-600 text-white text-xs">
                      {selectedCommand}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="inline-block px-4 py-3 rounded-2xl bg-slate-800 text-slate-100 text-xs whitespace-pre-wrap leading-relaxed max-w-xl">
                      {consoleOutput}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEMPLATES EDITOR (EDIT FORMAT & BAHASA PERINTAH) */}
          {activeTab === 'TEMPLATES' && (
            <div className="space-y-5">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Apakah Aman Mengedit Format & Tulisan Perintah Telegram?</p>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                    <strong>100% AMAN!</strong> Sistem menggunakan format text templating murni (mengganti tag seperti <code>{'{nama_sekolah}'}</code> atau <code>{'{denda_masuk}'}</code>). Pustakawan bebas mengganti bahasa (misal bahasa Indonesia lebih santai, formal, atau bilingual Mandarin/Inggris) tanpa resiko merusak database atau kode bot.
                  </p>
                </div>
              </div>

              {/* Command Selector Buttons */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Pilih Perintah Telegram yang Ingin Diedit Formatnya:
                </label>
                <div className="flex flex-wrap gap-2">
                  {templates.map((tpl) => (
                    <button
                      key={tpl.command}
                      type="button"
                      onClick={() => handleSelectTemplateCommand(tpl.command)}
                      className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                        editingCommand === tpl.command
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <span>{tpl.command}</span>
                      <span className="text-[10px] opacity-80 font-sans font-normal">
                        ({tpl.title})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Tags Chips */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 block">
                  💡 Klik Tag Variabel di bawah ini untuk disisipkan otomatis ke teks laporan:
                </span>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                  {[
                    '{nama_sekolah}',
                    '{tanggal}',
                    '{periode}',
                    '{bulan}',
                    '{pinjam_hari_ini}',
                    '{kembali_hari_ini}',
                    '{total_aktif}',
                    '{kas_masuk_hari_ini}',
                    '{tunggakan_hari_ini}',
                    '{buku_baru_count}',
                    '{beli_count}',
                    '{beli_nominal}',
                    '{sumbang_count}',
                    '{total_transaksi}',
                    '{sudah_kembali}',
                    '{masih_pinjam}',
                    '{terlambat_count}',
                    '{total_siap}',
                    '{nilai_inventaris}',
                    '{rusak_hilang}',
                    '{denda_masuk}',
                    '{ganti_masuk}',
                    '{sumbangan_kas}',
                    '{tunggakan}',
                    '{daftar_siswa_terlambat}',
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleInsertTag(tag)}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 transition"
                      title="Klik untuk menyisipkan"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea Editor */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Format Isi Pesan untuk Perintah <code>{editingCommand}</code>:
                </label>
                <textarea
                  rows={12}
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-950 text-emerald-400 font-mono text-xs p-4 leading-relaxed outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetTemplatesToDefault}
                  className="px-4 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Format Pabrik
                </button>

                <div className="flex items-center gap-3">
                  {isTemplateSaved && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" /> Format berhasil disimpan!
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveCurrentTemplate}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-2 transition"
                  >
                    <Save className="h-4 w-4" />
                    Simpan Format Pesan Ini
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BACKUP LOGS */}
          {activeTab === 'LOGS' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Log Riwayat Pengiriman & Backup Data
              </h3>

              {backupLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">Belum ada riwayat backup tercatat.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                  {backupLogs.map((log) => (
                    <div key={log.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            log.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {log.fileName}
                          </p>
                          <span className="text-[11px] text-slate-400">{log.details}</span>
                        </div>
                      </div>
                      <span className="font-mono text-slate-500 text-[11px]">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
