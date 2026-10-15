'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Zap,
  Printer,
  FileSpreadsheet,
  Users,
  Camera,
  Volume2,
  VolumeX,
  Layers,
  Search,
  Scan,
  RefreshCw,
  Info,
  CheckCircle2,
  Clock,
  Coins,
  Bot,
  Settings,
  Lock,
  Monitor,
  Sun,
  Moon,
  BarChart3,
  ChevronDown,
  LayoutGrid,
  Globe,
  MessageSquare,
} from 'lucide-react';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { KidsVisualOpac } from '@/components/opac/KidsVisualOpac';
import { CirculationDesk } from '@/components/circulation/CirculationDesk';
import { BookManagement } from '@/components/books/BookManagement';
import { MemberManagement } from '@/components/members/MemberManagement';
import { ScanIsbnModal } from '@/components/books/ScanIsbnModal';
import { LabelPrintGenerator } from '@/components/labels/LabelPrintGenerator';
import { ExcelModuleModal } from '@/components/excel/ExcelModuleModal';
import { CameraScannerModal } from '@/components/scanner/CameraScannerModal';
import { FinanceAndFinesModal } from '@/components/finance/FinanceAndFinesModal';
import { TelegramBackupModal } from '@/components/backup/TelegramBackupModal';
import { WhatsAppCenterModal } from '@/components/whatsapp/WhatsAppCenterModal';
import { DeveloperProfileModal } from '@/components/developer/DeveloperProfileModal';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { PinAuthModal } from '@/components/auth/PinAuthModal';
import { AnalyticsModal } from '@/components/analytics/AnalyticsModal';
import { StudentPortalModal } from '@/components/portal/StudentPortalModal';
import { soundFx } from '@/lib/sound';
import { libraryStore } from '@/lib/storage';
import { SchoolProfile, AppMode, Language } from '@/types';
import { DEFAULT_SCHOOL_PROFILE } from '@/lib/constants';
import { DICTIONARY } from '@/lib/i18n';

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    'OPAC' | 'CIRCULATION' | 'BOOKS' | 'MEMBERS'
  >('OPAC');

  // Modals state
  const [isScanIsbnOpen, setIsScanIsbnOpen] = useState<boolean>(false);
  const [scannedIsbnToLookup, setScannedIsbnToLookup] = useState<string>('');

  const [isLabelPrinterOpen, setIsLabelPrinterOpen] = useState<boolean>(false);
  const [preSelectedBarcodes, setPreSelectedBarcodes] = useState<string[]>([]);

  const [isExcelModalOpen, setIsExcelModalOpen] = useState<boolean>(false);
  const [isFinanceOpen, setIsFinanceOpen] = useState<boolean>(false);
  const [isTelegramOpen, setIsTelegramOpen] = useState<boolean>(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isStudentPortalOpen, setIsStudentPortalOpen] = useState<boolean>(false);
  const [isDevCreditOpen, setIsDevCreditOpen] = useState<boolean>(false);
  const [cameraTitle, setCameraTitle] = useState<string>('Scan Barcode');

  // Dropdown states for neat header
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState<boolean>(false);

  // Language & Trilingual Dictionary
  const [language, setLanguage] = useState<Language>('id');
  const t = DICTIONARY[language];

  // Theme (Dark / Light Mode)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // App Mode & School Branding
  const [appMode, setAppMode] = useState<AppMode>('PUSTAKAWAN');
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(DEFAULT_SCHOOL_PROFILE);

  // Sound FX toggle
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);

  // Active circulation scanned code pipeline
  const [activeCirculationScan, setActiveCirculationScan] = useState<string>('');

  // Quick scanner simulation drawer toggle (Default FALSE / Collapsed)
  const [showSimulator, setShowSimulator] = useState<boolean>(false);

  // Initialize storage & date
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [dataVersion, setDataVersion] = useState<number>(0);

  useEffect(() => {
    const d = new Date();
    setCurrentDateStr(
      d.toLocaleDateString(language === 'zh' ? 'zh-CN' : language === 'en' ? 'en-US' : 'id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
    setAppMode(libraryStore.getAppMode());
    setSchoolProfile(libraryStore.getSchoolProfile());
    setLanguage(libraryStore.getLanguage());
    
    // Theme init: sync HTML class and data-theme attribute
    const currentTheme = libraryStore.getTheme();
    setTheme(currentTheme);
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [dataVersion, language]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    libraryStore.setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    soundFx.playScanBeep();
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    libraryStore.setLanguage(lang);
    setDataVersion((v) => v + 1);
    soundFx.playScanBeep();
  };

  // GLOBAL HARDWARE BARCODE SCANNER ROUTER (USB Keystrokes < 50ms)
  const { lastScan, simulateScan, isScannerActive } = useBarcodeScanner({
    onScanISBN: (isbn) => {
      // 1. ISBN-13 scanned -> Open Scan ISBN Modal with Waterfall Lookup
      setScannedIsbnToLookup(isbn);
      setIsScanIsbnOpen(true);
    },
    onScanBookItem: (barcode) => {
      // 2. Physical Book Barcode scanned -> Route to Circulation desk
      setActiveTab('CIRCULATION');
      setActiveCirculationScan(barcode);
    },
    onScanMember: (memberCode) => {
      // 3. Member / Classroom Card scanned -> Route to Circulation desk
      setActiveTab('CIRCULATION');
      setActiveCirculationScan(memberCode);
    },
  });

  const toggleSound = () => {
    const next = !isSoundOn;
    setIsSoundOn(next);
    soundFx.setSoundEnabled(next);
  };

  const handleOpenLabelPrinterWithBarcodes = (barcodes: string[]) => {
    setPreSelectedBarcodes(barcodes);
    setIsLabelPrinterOpen(true);
  };

  const handleRefreshData = () => {
    setDataVersion((v) => v + 1);
  };

  const handleCameraScanResult = (code: string) => {
    simulateScan(code);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* 1. TOP HEADER & LOGO (Max 64px, Sticky, Unified Surface Style) */}
      <header className="print:hidden sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Left: Logo 36px + Single-line School Name + Role Pill */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg overflow-hidden border border-border bg-surface-2 shadow-xs flex items-center justify-center shrink-0">
              <img
                src={schoolProfile.logoUrl}
                alt="Logo Sekolah"
                className="h-full w-full object-contain p-0.5"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo_sbth.png';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold tracking-tight text-text">
                  SBTH Magelang
                </span>
                {appMode === 'KIOSK_ANAK' ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[10px] font-bold">
                    Kiosk Anak
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[10px] font-medium">
                    Meja Pustakawan
                  </span>
                )}
              </div>
              <p
                className="text-[11px] text-text-muted hidden sm:block truncate max-w-[200px] md:max-w-[320px]"
                title={schoolProfile.name}
              >
                KB-TK Bhakti Tunas Harapan
              </p>
            </div>
          </div>

          {/* Right: Max 4 Actions + Secondary in "Lainnya" Dropdown */}
          <div className="flex items-center gap-2">
            {appMode === 'KIOSK_ANAK' ? (
              /* KIOSK MODE CONTROLS */
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsStudentPortalOpen(true)}
                  className="h-9 px-3.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                  title="Masuk ke Akun Pribadi Siswa / Orang Tua"
                >
                  <Sparkles className="h-3.5 w-3.5 text-slate-950" />
                  <span>Portal Siswa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(true)}
                  className="h-9 px-3 rounded-lg bg-surface-2 border border-border hover:bg-surface text-text text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                  title="Masuk ke Meja Pustakawan"
                >
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Mode Pustakawan</span>
                </button>
              </div>
            ) : (
              /* PUSTAKAWAN MODE: Clean, Unified Neutral Secondary Actions */
              <>
                {/* 1. USB Scanner Status Dot (Compact Pill) */}
                <div
                  className="hidden md:flex items-center gap-2 px-2.5 h-9 rounded-lg bg-surface-2 border border-border text-[11px] text-text-muted"
                  title="Scanner USB otomatis mendeteksi ISBN, Barcode Buku SBTH-B, dan Kartu Siswa"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-medium">Scanner terhubung</span>
                </div>

                {/* 2. Camera Scan Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setCameraTitle('Scan Barcode via Kamera HP / Laptop');
                    setIsCameraOpen(true);
                  }}
                  className="h-9 px-3 rounded-lg border border-border bg-surface hover:bg-surface-2 text-text text-xs font-medium flex items-center gap-1.5 transition"
                  title="Gunakan Kamera HP atau Webcam"
                >
                  <Camera className="h-3.5 w-3.5 text-text-muted" />
                  <span className="hidden sm:inline">Kamera</span>
                </button>

                {/* 3. Switch to Kiosk Anak */}
                <button
                  type="button"
                  onClick={() => {
                    setAppMode('KIOSK_ANAK');
                    setActiveTab('OPAC');
                    libraryStore.saveAppMode('KIOSK_ANAK');
                    soundFx.playScanBeep();
                  }}
                  className="h-9 px-3 rounded-lg border border-border bg-surface hover:bg-surface-2 text-text text-xs font-medium flex items-center gap-1.5 transition"
                  title="Kunci ke Mode Pencarian Anak (Kiosk Tablet/PC Ruang Baca)"
                >
                  <Monitor className="h-3.5 w-3.5 text-text-muted" />
                  <span className="hidden lg:inline">Kiosk Anak</span>
                </button>

                {/* 4. Dropdown "Lainnya" (Excel, Kas, Telegram, Analitik, Portal Siswa, Pengaturan) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                    className="h-9 px-3 rounded-lg border border-border bg-surface hover:bg-surface-2 text-text text-xs font-medium flex items-center gap-1.5 transition"
                    title="Menu Administrasi Lainnya"
                  >
                    <LayoutGrid className="h-3.5 w-3.5 text-amber-500" />
                    <span>Lainnya</span>
                    <ChevronDown className="h-3.5 w-3.5 text-text-muted" />
                  </button>

                  {isMoreMenuOpen && (
                    <div
                      className="absolute right-0 top-11 w-56 rounded-xl bg-surface border border-border shadow-xl p-1.5 z-50 space-y-0.5 animate-in fade-in"
                      onMouseLeave={() => setIsMoreMenuOpen(false)}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsExcelModalOpen(true);
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left rounded-lg text-xs font-medium text-text hover:bg-surface-2 flex items-center gap-2.5 transition"
                      >
                        <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                        <span>Impor / Ekspor Excel</span>
                      </button>

                      {libraryStore.getFinanceModuleEnabled() && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsFinanceOpen(true);
                            setIsMoreMenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left rounded-lg text-xs font-medium text-text hover:bg-surface-2 flex items-center gap-2.5 transition"
                        >
                          <Coins className="h-4 w-4 text-amber-500" />
                          <span>Kas Perpustakaan & Denda</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIsTelegramOpen(true);
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left rounded-lg text-xs font-medium text-text hover:bg-surface-2 flex items-center gap-2.5 transition"
                      >
                        <Bot className="h-4 w-4 text-sky-500" />
                        <span>Telegram Bot & Backup</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsWhatsAppOpen(true);
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left rounded-lg text-xs font-medium text-text hover:bg-surface-2 flex items-center gap-2.5 transition"
                      >
                        <MessageSquare className="h-4 w-4 text-emerald-500" />
                        <span>Pusat WhatsApp & Reminder</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAnalyticsOpen(true);
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left rounded-lg text-xs font-medium text-text hover:bg-surface-2 flex items-center gap-2.5 transition"
                      >
                        <BarChart3 className="h-4 w-4 text-indigo-500" />
                        <span>Analitik & Profil Aset</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsStudentPortalOpen(true);
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left rounded-lg text-xs font-medium text-text hover:bg-surface-2 flex items-center gap-2.5 transition"
                      >
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span>Portal Mandiri Siswa</span>
                      </button>

                      <div className="border-t border-border/60 my-1"></div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsSettingsOpen(true);
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left rounded-lg text-xs font-medium text-text hover:bg-surface-2 flex items-center gap-2.5 transition"
                      >
                        <Settings className="h-4 w-4 text-text-muted" />
                        <span>Pengaturan Sistem</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Language Selector (🌐 ID ▾ Compact Dropdown / Pill) */}
            <div className="flex items-center h-9 p-0.5 rounded-lg bg-surface-2 border border-border text-xs font-medium">
              <button
                type="button"
                onClick={() => handleLanguageChange('id')}
                className={`px-2 py-1 rounded-md transition text-[11px] font-semibold ${
                  language === 'id'
                    ? 'bg-surface text-amber-500 shadow-xs'
                    : 'text-text-muted hover:text-text'
                }`}
                title="Bahasa Indonesia"
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`px-2 py-1 rounded-md transition text-[11px] font-semibold ${
                  language === 'en'
                    ? 'bg-surface text-amber-500 shadow-xs'
                    : 'text-text-muted hover:text-text'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('zh')}
                className={`px-2 py-1 rounded-md transition text-[11px] font-semibold ${
                  language === 'zh'
                    ? 'bg-surface text-amber-500 shadow-xs'
                    : 'text-text-muted hover:text-text'
                }`}
                title="中文"
              >
                中文
              </button>
            </div>

            {/* Dark / Light Mode 36px Icon Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-lg border border-border bg-surface text-text hover:bg-surface-2 flex items-center justify-center transition"
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </button>

            {/* Sound FX 36px Icon Button */}
            <button
              type="button"
              onClick={toggleSound}
              className={`h-9 w-9 rounded-lg border flex items-center justify-center transition ${
                isSoundOn
                  ? 'border-border bg-surface text-amber-400 hover:bg-surface-2'
                  : 'border-border bg-surface text-text-muted hover:bg-surface-2'
              }`}
              title={isSoundOn ? 'Suara Feedback Aktif' : 'Suara Dimatikan'}
            >
              {isSoundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* 2. NAVIGATION BAR (Hanya Tampil di Mode Pustakawan - Underline Style, No Duplicate Icons) */}
        {appMode === 'PUSTAKAWAN' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto text-xs font-medium border-t border-border/40">
            <button
              type="button"
              onClick={() => setActiveTab('OPAC')}
              className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'OPAC'
                  ? 'border-amber-500 text-text font-semibold'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>{t.catalog}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('CIRCULATION')}
              className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'CIRCULATION'
                  ? 'border-amber-500 text-text font-semibold'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              <Zap className="h-4 w-4 text-amber-500" />
              <span>{t.circulation}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('BOOKS')}
              className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'BOOKS'
                  ? 'border-amber-500 text-text font-semibold'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              <Layers className="h-4 w-4 text-amber-500" />
              <span>{t.booksTab}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('MEMBERS')}
              className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'MEMBERS'
                  ? 'border-amber-500 text-text font-semibold'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              <Users className="h-4 w-4 text-amber-500" />
              <span>{t.members}</span>
            </button>
          </div>
        )}
      </header>

      {/* 3. QUICK SCANNER BAR (Ringkas 40px, Toggle Mode Uji) */}
      {appMode === 'PUSTAKAWAN' && (
        <section className="print:hidden bg-surface-2 border-b border-border text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-text">
                {t.smartBarcodeRouter}
              </span>
              <span className="text-text-muted hidden md:inline text-[11px]">
                {t.smartBarcodeRouterDesc}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowSimulator(!showSimulator)}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-surface border border-border text-text hover:border-amber-500/50 transition flex items-center gap-1.5"
            >
              <span>{t.testMode}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-text-muted transition-transform duration-200 ${
                  showSimulator ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Collapsible Simulation Chips */}
          {showSimulator && (
            <div className="border-t border-border/60 px-4 sm:px-6 py-2 bg-surface/50">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-text-muted font-medium mr-1">
                  Simulasi Tembak Barcode:
                </span>
                <button
                  type="button"
                  onClick={() => simulateScan('9786022497653')}
                  className="px-2.5 py-1 rounded-md bg-surface-2 hover:bg-surface border border-border hover:border-amber-500/60 text-text text-[11px] font-mono transition"
                >
                  ISBN: Kancil (9786022497653)
                </button>
                <button
                  type="button"
                  onClick={() => simulateScan('9786020524412')}
                  className="px-2.5 py-1 rounded-md bg-surface-2 hover:bg-surface border border-border hover:border-amber-500/60 text-text text-[11px] font-mono transition"
                >
                  ISBN: Jerapah (9786020524412)
                </button>
                <button
                  type="button"
                  onClick={() => simulateScan('SBTH-M-0015')}
                  className="px-2.5 py-1 rounded-md bg-surface-2 hover:bg-surface border border-border hover:border-amber-500/60 text-text text-[11px] font-mono transition"
                >
                  Siswa: Alvaro (SBTH-M-0015)
                </button>
                <button
                  type="button"
                  onClick={() => simulateScan('SBTH-B-00101')}
                  className="px-2.5 py-1 rounded-md bg-surface-2 hover:bg-surface border border-border hover:border-amber-500/60 text-text text-[11px] font-mono transition"
                >
                  Buku: SBTH-B-00101
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 4. MAIN WORKSPACE CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'OPAC' && (
          <KidsVisualOpac
            onSelectBookForLoan={(book) => {
              setActiveTab('CIRCULATION');
            }}
            onOpenScanIsbn={() => setIsScanIsbnOpen(true)}
          />
        )}

        {activeTab === 'CIRCULATION' && (
          <CirculationDesk
            scannedCode={activeCirculationScan}
            onClearScannedCode={() => setActiveCirculationScan('')}
            onOpenScannerCamera={(title) => {
              setCameraTitle(title);
              setIsCameraOpen(true);
            }}
          />
        )}

        {activeTab === 'BOOKS' && (
          <BookManagement
            language={language}
            onOpenScanIsbn={() => {
              setScannedIsbnToLookup('');
              setIsScanIsbnOpen(true);
            }}
            onOpenLabelPrinter={handleOpenLabelPrinterWithBarcodes}
          />
        )}

        {activeTab === 'MEMBERS' && <MemberManagement />}
      </main>

      {/* 5. UNIFIED CLEAN FOOTER */}
      {/* 5. UNIFIED SLEEK FOOTER (SINGLE COHESIVE BAR) */}
      <footer className="print:hidden border-t border-border bg-surface py-5 text-xs text-text-muted mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <p className="font-bold text-text">
              © 2026 {schoolProfile.name} — Sistem Informasi Perpustakaan Digital
            </p>
            <p className="text-[11px] text-text-muted">
              {schoolProfile.tagline} • {schoolProfile.address} • 📞 {schoolProfile.phone} ({schoolProfile.librarianName})
            </p>
            <p className="text-[11px] text-text-muted pt-0.5">
              Designed & Engineered by <strong className="text-text font-semibold">Prasetyo Handy Kurniawan</strong> •{' '}
              <button
                type="button"
                onClick={() => setIsDevCreditOpen(true)}
                className="text-amber-500 font-semibold hover:underline cursor-pointer"
              >
                Profil Pengembang
              </button>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-xs font-medium shrink-0">
            <a
              href="https://www.instagram.com/sbth.kbtk/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-amber-500 transition"
            >
              Instagram: @sbth.kbtk
            </a>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset database ke data demo bawaan SBTH TK?')) {
                  libraryStore.resetToDefault();
                  window.location.reload();
                }
              }}
              className="text-text-muted hover:text-rose-500 transition cursor-pointer"
            >
              Reset Data Demo
            </button>
          </div>
        </div>
      </footer>

      {/* 6. MODALS */}
      <ScanIsbnModal
        isOpen={isScanIsbnOpen}
        onClose={() => setIsScanIsbnOpen(false)}
        initialIsbn={scannedIsbnToLookup}
        onBookAdded={() => handleRefreshData()}
        onOpenLabelPrinter={handleOpenLabelPrinterWithBarcodes}
      />

      <LabelPrintGenerator
        isOpen={isLabelPrinterOpen}
        onClose={() => setIsLabelPrinterOpen(false)}
        preSelectedBarcodes={preSelectedBarcodes}
      />

      <ExcelModuleModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onOpenLabelPrinter={handleOpenLabelPrinterWithBarcodes}
        onDataImported={() => handleRefreshData()}
      />

      <CameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScan={handleCameraScanResult}
        title={cameraTitle}
      />

      <FinanceAndFinesModal
        isOpen={isFinanceOpen}
        onClose={() => setIsFinanceOpen(false)}
        onDataChanged={() => handleRefreshData()}
      />

      <TelegramBackupModal
        isOpen={isTelegramOpen}
        onClose={() => setIsTelegramOpen(false)}
      />

      <WhatsAppCenterModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onProfileUpdated={() => handleRefreshData()}
      />

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      <StudentPortalModal
        isOpen={isStudentPortalOpen}
        onClose={() => {
          setIsStudentPortalOpen(false);
          handleRefreshData();
        }}
      />

      <PinAuthModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          setAppMode('PUSTAKAWAN');
          libraryStore.saveAppMode('PUSTAKAWAN');
          setIsPinModalOpen(false);
          soundFx.playSuccessChime();
        }}
      />

      {/* DEDICATED PROMOTIONAL & ARCHITECT PROFILE MODAL */}
      <DeveloperProfileModal
        isOpen={isDevCreditOpen}
        onClose={() => setIsDevCreditOpen(false)}
      />
    </div>
  );
}
