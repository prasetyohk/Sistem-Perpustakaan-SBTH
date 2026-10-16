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

function createCodeBlock(codeText) {
  const lines = codeText.split('\n');
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 24, color: 'F59E0B' },
      right: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: lines.map(
              (line) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: line,
                      font: 'Consolas',
                      size: 19, // 9.5pt
                      color: '0F172A',
                    }),
                  ],
                  spacing: { before: 20, after: 20 },
                })
            ),
            shading: { fill: 'F8FAFC' },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
          }),
        ],
      }),
    ],
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

async function generateDocx() {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }, // 1 inch margins
          },
        },
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: 'PANDUAN LENGKAP DEPLOY VPS ONLINE',
                bold: true,
                size: 36,
                color: 'D97706',
                font: 'Segoe UI',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Sistem Informasi Perpustakaan Digital SBTH TK',
                bold: true,
                size: 26,
                color: '0F172A',
                font: 'Segoe UI',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Akses Online 24/7 • Domain / Subdomain Sekolah • SSL HTTPS Gratis • Auto-Restart PM2',
                italics: true,
                size: 20,
                color: '64748B',
                font: 'Segoe UI',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 360 },
          }),

          createCallout(
            '🌟 MANFAAT ONLINE VIA VPS CLOUD',
            'Dengan online di VPS, orang tua murid dapat membuka katalog buku & reservasi dari smartphone di rumah tanpa harus berada di jaringan WiFi sekolah. Guru dan pustakawan juga dapat memantau inventaris dan mengelola buku kapan saja.',
            'D97706'
          ),

          createHeading('1. SPESIFIKASI VPS & REKOMENDASI CLOUD', HeadingLevel.HEADING_1),
          createParagraph('Aplikasi Perpustakaan SBTH dirancang sangat ringan (Next.js Standalone). Anda cukup menyewa VPS kelas hemat dengan spesifikasi:'),
          createBullet('Sistem Operasi', 'Ubuntu 22.04 LTS atau Ubuntu 24.04 LTS (64-bit)'),
          createBullet('RAM Memory', '1 GB (Minimal) atau 2 GB (Rekomendasi untuk kecepatan maksimal)'),
          createBullet('Processor / vCPU', '1 Core vCPU'),
          createBullet('Penyimpanan (Disk)', '20 GB - 30 GB SSD / NVMe'),
          createBullet('Rekomendasi Provider', 'IdCloudHost, Niagahoster, DomaiNesia, Biznet GIO, DigitalOcean, Hetzner, atau Linode (biaya mulai Rp 40.000 - Rp 100.000 / bulan).'),

          createHeading('2. PENGATURAN DOMAIN / SUBDOMAIN SEKOLAH', HeadingLevel.HEADING_1),
          createParagraph('Agar alamat perpustakaan mudah diingat (misal: perpus.sbth.sch.id), atur DNS pada panel domain sekolah Anda:'),
          createBullet('Tipe Record', 'A Record'),
          createBullet('Host / Nama Subdomain', 'perpus (atau perpustakaan)'),
          createBullet('Nilai / Target IP', 'Masukkan IP Public VPS Anda (Contoh: 103.187.145.22)'),
          createBullet('TTL', 'Automatic atau 3600 detik (1 jam)'),

          createHeading('3. LANGKAH-LANGKAH INSTALASI DI VPS UBUNTU', HeadingLevel.HEADING_1),
          
          createHeading('Langkah 3.1: Login ke Server VPS via SSH', HeadingLevel.HEADING_2),
          createParagraph('Buka terminal (PowerShell di Windows atau Terminal di Mac/Linux), lalu ketik:'),
          createCodeBlock('ssh root@IP_PUBLIC_VPS_ANDA\n# Masukkan password VPS Anda saat diminta'),

          createHeading('Langkah 3.2: Update Paket Sistem Ubuntu', HeadingLevel.HEADING_2),
          createParagraph('Perbarui repository dan paket bawaan server:'),
          createCodeBlock('apt update && apt upgrade -y\napt install -y curl git ufw nginx certbot python3-certbot-nginx build-essential'),

          createHeading('Langkah 3.3: Install Node.js v22 LTS & PM2', HeadingLevel.HEADING_2),
          createParagraph('Pasang runtime Node.js resmi versi LTS dan PM2 (Process Manager agar aplikasi menyala 24 jam nonstop):'),
          createCodeBlock('curl -fsSL https://deb.nodesource.com/setup_22.x | bash -\napt install -y nodejs\n\n# Cek versi yang terpasang\nnode -v\nnpm -v\n\n# Pasang PM2 secara global\nnpm install -g pm2'),

          createHeading('Langkah 3.4: Salin / Unggah Project ke Server', HeadingLevel.HEADING_2),
          createParagraph('Buat direktori kerja di server, lalu salin folder aplikasi (bisa via Git clone atau FileZilla SFTP):'),
          createCodeBlock('mkdir -p /var/www/perpustakaan-sbth\ncd /var/www/perpustakaan-sbth\n\n# Jika menggunakan Git repository Anda:\ngit clone https://github.com/prasetyohk/Sistem-Perpustakaan-SBTH.git .\n\n# ATAU jika upload manual via FileZilla SFTP, taruh seluruh file di /var/www/perpustakaan-sbth'),

          createHeading('Langkah 3.5: Install Dependensi & Build Next.js', HeadingLevel.HEADING_2),
          createParagraph('Jalankan instalasi pustaka dan compile bundle produksi:'),
          createCodeBlock('cd /var/www/perpustakaan-sbth\nnpm install\nnpm run build'),

          createHeading('Langkah 3.6: Jalankan Aplikasi dengan PM2 Auto-Restart', HeadingLevel.HEADING_2),
          createParagraph('Gunakan PM2 agar jika server mati mendadak atau reboot, aplikasi otomatis hidup kembali:'),
          createCodeBlock('cd /var/www/perpustakaan-sbth\npm2 start npm --name "perpus-sbth" -- start\n\n# Simpan daftar proses agar hidup saat VPS reboot\npm2 save\npm2 startup\n# (Jalankan baris perintah "sudo env PATH=..." yang dimunculkan di layar)'),

          createHeading('4. KONFIGURASI NGINX REVERSE PROXY', HeadingLevel.HEADING_1),
          createParagraph('Agar pengguna dapat mengakses aplikasi cukup dengan mengetik nama domain (tanpa perlu mengetik nomor port :3000), konfigurasikan Nginx sebagai web server utama:'),
          createParagraph('1. Buat file konfigurasi baru di Nginx:'),
          createCodeBlock('nano /etc/nginx/sites-available/perpus-sbth'),
          createParagraph('2. Tempelkan isi konfigurasi berikut (ganti perpus.sbth.sch.id dengan domain Anda):'),
          createCodeBlock('server {\n    listen 80;\n    server_name perpus.sbth.sch.id;\n\n    client_max_body_size 50M;\n\n    location / {\n        proxy_pass http://localhost:3000;\n        proxy_http_version 1.1;\n        proxy_set_header Upgrade $http_upgrade;\n        proxy_set_header Connection \'upgrade\';\n        proxy_set_header Host $host;\n        proxy_cache_bypass $http_upgrade;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n    }\n}'),
          createParagraph('3. Aktifkan konfigurasi dan periksa sintaks Nginx:'),
          createCodeBlock('ln -s /etc/nginx/sites-available/perpus-sbth /etc/nginx/sites-enabled/\nnginx -t\nsystemctl reload nginx'),

          createHeading('5. PASANG SERTIFIKAT SSL GRATIS (HTTPS)', HeadingLevel.HEADING_1),
          createParagraph('Agar domain berstatus aman (gembok hijau HTTPS) dan data transaksi anak aman terenkripsi:'),
          createCodeBlock('certbot --nginx -d perpus.sbth.sch.id\n# Masukkan email Anda saat diminta, setujui ToS (ketik Y), lalu pilih opsi auto-redirect HTTP ke HTTPS.'),
          createCallout(
            '🔒 AUTO-RENEWAL SSL',
            'Sertifikat SSL Let\'s Encrypt diperbarui secara otomatis setiap 90 hari oleh layanan background Certbot. Anda tidak perlu repot memperpanjangnya secara manual!',
            '10B981'
          ),

          createHeading('6. PENGATURAN FIREWALL KEAMANAN (UFW)', HeadingLevel.HEADING_1),
          createParagraph('Kunci akses port lain agar server aman dari serangan peretas:'),
          createCodeBlock('ufw default deny incoming\nufw default allow outgoing\nufw allow OpenSSH\nufw allow \'Nginx Full\'\nufw enable\n# Tekan y untuk mengonfirmasi pengaktifan firewall'),

          createHeading('7. CARA UPDATE DAN PEMELIHARAAN DI MASA DEPAN', HeadingLevel.HEADING_1),
          createParagraph('Jika ada pembaruan kode aplikasi di GitHub, cukup login SSH ke VPS dan ketik 4 perintah berikut:'),
          createCodeBlock('cd /var/www/perpustakaan-sbth\ngit pull\nnpm install\nnpm run build\npm2 reload perpus-sbth'),
          createParagraph('Selesai! Aplikasi akan terupdate secara instan (zero-downtime) tanpa memutus koneksi pengguna yang sedang aktif membaca buku.'),

          createHeading('8. JADWAL BACKUP OTOMATIS DATA PERPUSTAKAAN', HeadingLevel.HEADING_1),
          createParagraph('Untuk memastikan keamanan data, buat jadwal backup otomatis setiap malam pukul 02:00:'),
          createCodeBlock('crontab -e\n# Tambahkan baris berikut di paling bawah:\n0 2 * * * tar -czf /root/backup-perpus-$(date +\\%Y\\%m\\%d).tar.gz /var/www/perpustakaan-sbth'),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '..', 'PANDUAN_DEPLOY_VPS_ONLINE_PERPUSTAKAAN_SBTH.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('✅ Berhasil membuat dokumen Word:', outPath);
}

generateDocx().catch((err) => {
  console.error('Error generating docx:', err);
});
