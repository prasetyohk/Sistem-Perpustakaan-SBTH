'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, AlertCircle, ArrowRight, Sparkles, Check } from 'lucide-react';
import { soundFx } from '@/lib/sound';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (scannedText: string) => void;
  title?: string;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'Scan Barcode Kamera (Buku / Siswa)',
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [manualCode, setManualCode] = useState<string>('');
  const [isStarting, setIsStarting] = useState<boolean>(false);

  const scannerRef = useRef<any>(null);
  const isStoppingRef = useRef<boolean>(false);
  const hasScannedRef = useRef<boolean>(false);
  const readerElementId = 'sbth-html5-camera-reader';

  const safelyStopScanner = async () => {
    if (isStoppingRef.current || !scannerRef.current) return;
    isStoppingRef.current = true;
    try {
      const scanner = scannerRef.current;
      // Check if scanner is in a state that can be stopped
      if (typeof scanner.isScanning === 'boolean' ? scanner.isScanning : true) {
        await scanner.stop().catch(() => {});
      }
      await scanner.clear().catch(() => {});
    } catch {
      // Ignore transition error safely
    } finally {
      scannerRef.current = null;
      isStoppingRef.current = false;
    }
  };

  const handleClose = async () => {
    await safelyStopScanner();
    onClose();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    soundFx.playScanBeep();
    onScan(manualCode.trim());
    handleClose();
  };

  useEffect(() => {
    if (!isOpen) {
      safelyStopScanner();
      return;
    }

    let isMounted = true;
    hasScannedRef.current = false;
    isStoppingRef.current = false;

    async function initScanner() {
      setIsStarting(true);
      setErrorMsg(null);
      try {
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import('html5-qrcode');

        const devices = await Html5Qrcode.getCameras().catch(() => []);
        if (devices && devices.length > 0) {
          if (isMounted) {
            setCameras(devices);
            // Default to back camera on mobile or first camera
            const backCam = devices.find(
              (d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('belakang')
            );
            const camId = backCam ? backCam.id : devices[0].id;
            setSelectedCameraId(camId);
            await startCamera(camId, Html5Qrcode, Html5QrcodeSupportedFormats);
          }
        } else {
          if (isMounted) setErrorMsg('Kamera tidak terdeteksi di perangkat ini.');
        }
      } catch (err: any) {
        console.warn('Camera init error:', err);
        if (isMounted) setErrorMsg('Izin kamera ditolak atau tidak didukung browser ini.');
      } finally {
        if (isMounted) setIsStarting(false);
      }
    }

    async function startCamera(cameraId: string, Html5Qrcode: any, formats: any) {
      await safelyStopScanner();

      const scanner = new Html5Qrcode(readerElementId, {
        formatsToSupport: [
          formats.EAN_13,
          formats.CODE_128,
          formats.QR_CODE,
          formats.EAN_8,
          formats.CODE_39,
          formats.UPC_A,
          formats.UPC_E,
        ],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true, // Native fast multi-angle barcode decoding!
        },
        verbose: false,
      });

      scannerRef.current = scanner;

      try {
        await scanner.start(
          cameraId,
          {
            fps: 15,
            qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              return {
                width: Math.min(viewfinderWidth - 20, Math.max(260, minEdge * 0.9)),
                height: Math.min(viewfinderHeight - 20, Math.max(160, minEdge * 0.65)),
              };
            },
            aspectRatio: 1.3333,
          },
          async (decodedText: string) => {
            if (hasScannedRef.current) return;
            hasScannedRef.current = true;
            soundFx.playScanBeep();
            await safelyStopScanner();
            onScan(decodedText);
            onClose();
          },
          () => {
            // Frame search failure, safe to ignore
          }
        );
      } catch (startErr: any) {
        console.warn('Start camera stream error:', startErr);
        setErrorMsg('Gagal memulai streaming video kamera.');
      }
    }

    initScanner();

    return () => {
      isMounted = false;
      safelyStopScanner();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Arahkan barcode ke kotak merah. Bisa vertikal maupun horizontal.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Viewport */}
        <div className="relative bg-black min-h-[300px] flex items-center justify-center overflow-hidden">
          <div id={readerElementId} className="w-full" />

          {errorMsg && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/95 text-white">
              <AlertCircle className="h-10 w-10 text-rose-400 mb-2" />
              <p className="text-sm font-semibold">{errorMsg}</p>
              <p className="text-xs text-slate-400 mt-2 max-w-sm">
                Jika kamera tidak fokus atau terhalang izin browser, Anda tetap bisa memasukkan barcode secara manual di bawah ini.
              </p>
            </div>
          )}
        </div>

        {/* Backup / Fallback Manual Input */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>Kamera buram atau barcode silau? Ketik angka barcode manual:</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Bisa ISBN / SBTH-B</span>
          </label>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Contoh: 9789790060258 atau SBTH-B-00101"
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono font-bold outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
            >
              <span>Gunakan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Tip: Dekatkan buku sekitar 10-15 cm dari lensa kamera.</span>
          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
