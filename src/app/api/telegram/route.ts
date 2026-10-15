import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let botToken = '';
    let chatId = '';
    let message = '';
    let action = '';
    let file: File | null = null;

    if (contentType.includes('application/json')) {
      const body = await req.json();
      botToken = body.botToken || '';
      chatId = body.chatId || '';
      message = body.message || '';
      action = body.action || '';
    } else {
      const formData = await req.formData();
      botToken = (formData.get('botToken') as string) || '';
      chatId = (formData.get('chatId') as string) || '';
      message = (formData.get('message') as string) || '';
      action = (formData.get('action') as string) || '';
      file = formData.get('file') as File | null;
    }

    if (!botToken || !chatId) {
      return NextResponse.json(
        { success: false, error: 'Bot Token dan Chat ID wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Action: Test Connection
    if (action === 'TEST') {
      const testUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const res = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🤖 *Koneksi Bot Perpustakaan SBTH TK Berhasil!* ✅\n\nBot siap menerima pengiriman laporan mingguan, bulanan, dan file backup otomatis (.xlsx & database).`,
          parse_mode: 'Markdown',
        }),
      });

      const data = await res.json();
      if (!data.ok) {
        return NextResponse.json({ success: false, error: data.description || 'Gagal mengirim pesan test ke Telegram.' });
      }
      return NextResponse.json({ success: true, message: 'Koneksi Telegram berhasil terhubung!' });
    }

    // 2. Action: Send Document + Caption
    if (file) {
      const docUrl = `https://api.telegram.org/bot${botToken}/sendDocument`;
      const docForm = new FormData();
      docForm.append('chat_id', chatId);
      docForm.append('document', file, file.name);
      if (message) {
        docForm.append('caption', message.slice(0, 1024)); // Telegram caption limit 1024 chars
      }

      const res = await fetch(docUrl, {
        method: 'POST',
        body: docForm,
      });

      const data = await res.json();
      if (!data.ok) {
        return NextResponse.json({ success: false, error: data.description || 'Gagal mengirim file dokumen ke Telegram.' });
      }

      // If message is longer than 1024 characters, send the full message as a separate text message
      if (message && message.length > 1024) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
          }),
        });
      }

      return NextResponse.json({ success: true, message: 'Laporan dan file Excel backup berhasil dikirim ke Telegram!' });
    }

    // 3. Action: Send Text Message only
    const sendUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(sendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      return NextResponse.json({ success: false, error: data.description || 'Gagal mengirim pesan ke Telegram.' });
    }

    return NextResponse.json({ success: true, message: 'Laporan berhasil dikirim ke Telegram!' });
  } catch (err: any) {
    console.error('Telegram API Route Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Terjadi kesalahan pada server saat menghubungi Telegram.' },
      { status: 500 }
    );
  }
}
