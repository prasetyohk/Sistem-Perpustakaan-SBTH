'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { soundFx } from '@/lib/sound';

export type BarcodeType = 'ISBN' | 'BOOK_ITEM' | 'MEMBER' | 'UNKNOWN';

export interface ScanResult {
  raw: string;
  type: BarcodeType;
  timestamp: number;
}

interface UseBarcodeScannerProps {
  onScanISBN?: (isbn: string) => void;
  onScanBookItem?: (barcode: string) => void;
  onScanMember?: (code: string) => void;
  onAnyScan?: (result: ScanResult) => void;
  enabled?: boolean;
}

export function classifyBarcode(raw: string): { type: BarcodeType; clean: string } {
  const clean = raw.trim();

  // 1. ISBN-13: 13 digits starting with 978 or 979 (or ISBN-10 fallback)
  const cleanIsbnDigits = clean.replace(/[-\s]/g, '');
  if (/^(978|979)\d{10}$/.test(cleanIsbnDigits)) {
    return { type: 'ISBN', clean: cleanIsbnDigits };
  }

  // 2. SBTH Book Item: e.g., SBTH-B-00101
  if (/^SBTH-B-\d{3,6}$/i.test(clean)) {
    return { type: 'BOOK_ITEM', clean: clean.toUpperCase() };
  }

  // 3. SBTH Member / Classroom: e.g. SBTH-M-0015, SBTH-C-TKA1, SBTH-T-0001
  if (/^SBTH-[MCT]-.+$/i.test(clean)) {
    return { type: 'MEMBER', clean: clean.toUpperCase() };
  }

  return { type: 'UNKNOWN', clean };
}

export function useBarcodeScanner({
  onScanISBN,
  onScanBookItem,
  onScanMember,
  onAnyScan,
  enabled = true,
}: UseBarcodeScannerProps) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [isScannerActive, setIsScannerActive] = useState<boolean>(true);

  const handleScanComplete = useCallback(
    (scannedString: string) => {
      const { type, clean } = classifyBarcode(scannedString);
      soundFx.playScanBeep();

      const result: ScanResult = {
        raw: clean,
        type,
        timestamp: Date.now(),
      };

      setLastScan(result);

      if (onAnyScan) onAnyScan(result);

      switch (type) {
        case 'ISBN':
          if (onScanISBN) onScanISBN(clean);
          break;
        case 'BOOK_ITEM':
          if (onScanBookItem) onScanBookItem(clean);
          break;
        case 'MEMBER':
          if (onScanMember) onScanMember(clean);
          break;
      }
    },
    [onAnyScan, onScanISBN, onScanBookItem, onScanMember]
  );

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Ignore modifier keys
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
        return;
      }

      // If user presses Enter
      if (e.key === 'Enter') {
        const buffer = bufferRef.current.trim();
        bufferRef.current = '';

        // If buffer has meaningful content
        if (buffer.length >= 3) {
          // If the target is an input field and the user was typing slowly (>100ms per char),
          // let normal input behaviour handle it unless buffer matches our specific barcode pattern.
          const target = e.target as HTMLElement | null;
          const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

          // If it's a barcode pattern or timing was super fast (scanner)
          const isBarcodePattern =
            /^(978|979)\d{10}$/.test(buffer.replace(/[-\s]/g, '')) ||
            /^SBTH-[BMC]-.+$/i.test(buffer);

          if (isBarcodePattern || !isInput) {
            e.preventDefault();
            handleScanComplete(buffer);
          }
        }
        return;
      }

      // Regular single character
      if (e.key.length === 1) {
        // Hardware barcode scanners send characters rapidly (< 60ms between chars)
        // If there was a long pause (> 300ms) between keys, reset the scanner buffer
        if (timeDiff > 250) {
          bufferRef.current = '';
        }

        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleScanComplete]);

  // Method to manually dispatch a simulated barcode scan (useful for UI test buttons)
  const simulateScan = (barcode: string) => {
    handleScanComplete(barcode);
  };

  return {
    lastScan,
    simulateScan,
    isScannerActive,
    setIsScannerActive,
  };
}
