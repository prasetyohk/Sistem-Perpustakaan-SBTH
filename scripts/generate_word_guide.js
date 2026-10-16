const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} = require('docx');
const fs = require('fs');
const path = require('path');

function createHeading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 280, after: 120 },
  });
}

function createParagraph(text, isBold = false) {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: isBold,
        size: 22, // 11pt
        font: 'Segoe UI',
      }),
    ],
    spacing: { after: 100 },
  });
}

function createBullet(title, desc) {
  return new Paragraph({
    children: [
      new TextRun({ text: '• ' + title + ': ', bold: true, size: 22, font: 'Segoe UI' }),
      new TextRun({ text: desc, size: 22, font: 'Segoe UI' }),
    ],
    spacing: { after: 80 },
    indent: { left: 360 },
  });
}

function createCallout(title, message, color = '0D9488') {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      left: { style: BorderStyle.SINGLE, size: 36, color: color },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: title + '\n', bold: true, color: color, size: 22, font: 'Segoe UI' }),
                  new TextRun({ text: message, size: 20, font: 'Segoe UI' }),
                ],
              }),
            ],
            shading: { fill: 'F0FDFA' },
            margins: { top: 140, bottom: 140, left: 200, right: 200 },
          }),
        ],
      }),
    ],
  });
}

function createTable(headers, data) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(
          h =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 20, font: 'Segoe UI' })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: { fill: '0F766E' },
              margins: { top: 120, bottom: 120, left: 140, right: 140 },
            })
        ),
      }),
      ...data.map(
        row =>
          new TableRow({
            children: row.map(
              cell =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: cell, size: 20, font: 'Segoe UI' })],
                    }),
                  ],
                  margins: { top: 100, bottom: 100, left: 140, right: 140 },
                })
            ),
          })
      ),
    ],
  });
}

async function generateDocx() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header / Title
          new Paragraph({
            children: [
              new TextRun({
                text: 'PANDUAN LENGKAP INSTALASI & CARA MEMBUKA',
                bold: true,
                size: 32, // 16pt
                color: '0F766E',
                font: 'Segoe UI',
              }),
            ],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Sistem Informasi Perpustakaan Digital SBTH TK (Sekolah Bina Tunas Harapan)',
                bold: true,
                size: 24,
                color: '64748B',
                font: 'Segoe UI',
              }),
            ],
            spacing: { after: 200 },
          }),

          createCallout(
            '💡 PETUNJUK RINGKAS (ONE-CLICK LAUNCHER)',
            'Untuk langsung menggunakan aplikasi, cukup klik ganda file "JALANKAN_PERPUSTAKAAN_PUSAT.bat" di komputer utama perpustakaan. Browser akan otomatis terbuka di http://localhost:3000.'
          ),

          new Paragraph({ text: '', spacing: { after: 180 } }),

          // Bagian 1
          createHeading('1. Kebutuhan Sistem & Persiapan Awal'),
          createParagraph(
            'Sebelum menjalankan sistem perpustakaan, pastikan komputer telah memenuhi persyaratan berikut:'
          ),
          createBullet('Sistem Operasi', 'Windows 10 atau Windows 11 (64-bit).'),
          createBullet(
            'Node.js (Wajib, 1x Install)',
            'Node.js versi 18 atau versi terbaru (LTS). Download gratis di: https://nodejs.org/'
          ),
          createBullet('Peramban Web Rekomendasi', 'Google Chrome atau Microsoft Edge versi terbaru.'),
          createBullet('Hardware Tambahan (Opsional)', 'Barcode scanner USB (Plug & Play) dan printer biasa untuk label stiker Tom & Jerry 103 atau Thermal Roll 40x30mm.'),

          // Bagian 2
          createHeading('2. Cara Instalasi Pertama Kali'),
          createParagraph('Instalasi aplikasi sangat praktis tanpa perlu konfigurasi server rumit:'),
          createBullet('Langkah 1', 'Buka folder utama aplikasi: "APLIKASI PERPUSTAKAAN SBTH".'),
          createBullet(
            'Langkah 2 (Buat Shortcut Desktop)',
            'Klik ganda file "PASANG_SHORTCUT_DESKTOP.bat". Ikon jalan pintas resmi otomatis terpasang di Desktop.'
          ),
          createBullet(
            'Langkah 3 (Pemasangan Otomatis)',
            'Seluruh pustaka dan database lokal otomatis dikonfigurasi saat pertama kali menjalankan server.'
          ),

          // Bagian 3
          createHeading('3. Cara Membuka & Menjalankan Aplikasi'),
          createParagraph('A. DI KOMPUTER UTAMA PERPUSTAKAAN (SERVER PUSAT):', true),
          createBullet('Langkah A1', 'Klik ganda file "JALANKAN_PERPUSTAKAAN_PUSAT.bat" (atau klik shortcut di Desktop).'),
          createBullet('Langkah A2', 'Jendela hitam Command Prompt akan terbuka memuat server.'),
          createBullet(
            'Langkah A3',
            'Browser Chrome/Edge otomatis terbuka ke alamat: http://localhost:3000 dalam 3-5 detik.'
          ),
          createBullet(
            'Perhatian Penting',
            'Biarkan jendela hitam server tetap terbuka selama perpustakaan beroperasi. Jangan ditutup tanda silang (X) sebelum jam kerja selesai.'
          ),

          new Paragraph({ text: '', spacing: { after: 100 } }),
          createParagraph('B. DI KOMPUTER LAIN / LAPTOP GURU / TABLET (JARINGAN WI-FI SEKOLAH):', true),
          createBullet(
            'Koneksi Wi-Fi',
            'Pastikan laptop/tablet guru terhubung ke Wi-Fi yang sama dengan komputer utama perpustakaan.'
          ),
          createBullet(
            'Akses Klien',
            'Klik ganda file "BUKA_PERPUSTAKAAN_KLIEN.bat", atau buka Google Chrome lalu ketik alamat IP Komputer Pusat (misal: http://192.168.1.13:3000).'
          ),

          // Bagian 4: Kredensial Login
          createHeading('4. Informasi Kredensial & Akun Default'),
          createTable(
            ['Peran / Akun', 'Username', 'Kata Sandi / PIN', 'Keterangan'],
            [
              ['Siswa / Kiosk Anak', '-', 'Tanpa Password', 'Bebas akses katalog visual & pencarian'],
              ['Pustakawan Utama', 'ms_kriss', 'sbth2026 / PIN: 1234', 'Akses penuh sirkulasi, buku, & pengaturan'],
            ]
          ),

          // Bagian 5: Panduan Fitur Utama
          createHeading('5. Panduan Fitur Operasional Utama'),
          createBullet(
            'Input Buku Baru (Scan ISBN)',
            'Masuk ke tab Koleksi & Eksemplar -> klik "+ Scan ISBN". Scan nomor barcode di belakang buku -> klik "Auto-Fill" -> klik "✨ Auto Cari Sampul Google" -> simpan buku.'
          ),
          createBullet(
            'Cetak Label Tom & Jerry 103',
            'Klik "Cetak Label". Pilih format T&J 103 (32x64mm) atau Thermal Roll. Centang beberapa stiker sekaligus (multi-select stabil). Pilih nomor stiker awal (#1, #2, #3) agar stiker bekas tidak terbuang. Tekan Cetak Sekarang (Ctrl+P).'
          ),
          createBullet(
            'Sirkulasi Pinjam & Kembali',
            'Di tab Sirkulasi: Pilih siswa & scan barcode buku untuk meminjam. Di sub-tab Pengembalian: scan barcode buku untuk pengembalian kilat instan.'
          ),
          createBullet(
            'Filter Alumni & Hapus Massal',
            'Di tab Data Anggota: filter siswa kelas TK-A/TK-B. Saat tahun ajaran baru, klik filter "🎓 Alumni", centang semua, dan klik "Hapus Massal Alumni" dalam 1 detik.'
          ),
          createBullet(
            'Pencadangan Data (Backup)',
            'Di menu Pengaturan -> Backup & Restore: simpan cadangan database JSON lokal atau ekspor ke Microsoft Excel secara berkala.'
          ),

          // Bagian 6: Troubleshooting
          createHeading('6. Solusi Jika Mengalami Kendala (Troubleshooting)'),
          createTable(
            ['Kendala yang Dialami', 'Penyebab', 'Langkah Solusi'],
            [
              [
                'Halaman web tidak bisa dibuka ("This site can’t be reached")',
                'Jendela hitam server pusat belum dijalankan / tertutup',
                'Buka kembali file "JALANKAN_PERPUSTAKAAN_PUSAT.bat" dan tunggu browser terbuka.',
              ],
              [
                'Tulisan "node tidak dikenali" saat pertama kali buka .bat',
                'Node.js belum terpasang di komputer',
                'Download dan pasang Node.js LTS dari https://nodejs.org/ lalu restart komputer.',
              ],
              [
                'Scanner barcode USB tidak merespons',
                'Kursor belum berada di dalam kotak pencarian / scan',
                'Pastikan klik kotak teks terlebih dahulu sebelum mengarahkan sinar scanner.',
              ],
              [
                'Video demo layar putih saat diputar di Windows',
                'Pemutar bawaan Windows tidak memiliki codec VP9',
                'Klik ganda file "BUKA_VIDEO_DEMO.html" untuk memutar video langsung di Google Chrome.',
              ],
            ]
          ),

          new Paragraph({ text: '', spacing: { after: 200 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Sekolah Bina Tunas Harapan (SBTH) TK Magelang • Sistem Perpustakaan Modern 2026',
                italics: true,
                size: 18,
                color: '94A3B8',
                font: 'Segoe UI',
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.resolve(__dirname, '../PANDUAN_CARA_INSTAL_DAN_BUKA.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('✅ Berhasil membuat file Word di:', outPath);
}

generateDocx().catch(console.error);
