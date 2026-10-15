'use client';

import * as XLSX from 'xlsx';
import { libraryStore } from './storage';

export async function testTelegramConnection(botToken: string, chatId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('botToken', botToken.trim());
    formData.append('chatId', chatId.trim());
    formData.append('action', 'TEST');

    const res = await fetch('/api/telegram', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function sendTelegramWeeklyBackup(
  botToken: string,
  chatId: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const reportText = libraryStore.generateWeeklyReportText();
    const wb = libraryStore.generate5SheetExcelWorkbook();

    // Write workbook to array buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Backup_Full_Perpus_SBTH_TK_${dateStr}.xlsx`;
    const excelBlob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const file = new File([excelBlob], fileName, { type: excelBlob.type });

    const formData = new FormData();
    formData.append('botToken', botToken.trim());
    formData.append('chatId', chatId.trim());
    formData.append('message', reportText);
    formData.append('file', file);

    const res = await fetch('/api/telegram', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      libraryStore.addBackupLog({
        type: 'TELEGRAM',
        status: 'SUCCESS',
        fileName,
        details: 'Laporan mingguan + 5-Sheet Excel terkirim ke Telegram',
      });
      const cfg = libraryStore.getTelegramConfig();
      libraryStore.saveTelegramConfig({
        ...cfg,
        lastBackupAt: new Date().toLocaleString('id-ID'),
        lastStatus: 'Sukses Terkirim',
      });
    } else {
      libraryStore.addBackupLog({
        type: 'TELEGRAM',
        status: 'FAILED',
        fileName,
        details: data.error || 'Gagal mengirim backup',
      });
    }
    return data;
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export function handleSimulateCommand(command: string): string {
  const cleanCmd = command.trim().toLowerCase();
  if (cleanCmd === '/backup_sekarang') {
    return `🚀 Perintah Backup Diterima!\nFile database 'sbth_library.db' dan 'Backup_Full_SBTH_TK.xlsx' (5 Tab Sheet Master) sedang dikirimkan ke grup ini...`;
  }

  // Use dynamic editable template if available
  const templates = libraryStore.getTelegramTemplates();
  const matched = templates.find((t) => t.command.toLowerCase() === cleanCmd);
  if (matched) {
    return libraryStore.renderTelegramTemplate(cleanCmd);
  }

  return `❓ Perintah tidak dikenali. Gunakan perintah berikut:\n${templates
    .map((t) => `${t.command} (${t.title})`)
    .join('\n')}\n/backup_sekarang (Kirim File Backup .xlsx)`;
}
