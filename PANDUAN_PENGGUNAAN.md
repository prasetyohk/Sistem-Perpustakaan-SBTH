# 📚 Panduan Penggunaan Sistem Perpustakaan KB-TK Bhakti Tunas Harapan (SBTH) Magelang

Sistem Informasi Manajemen Perpustakaan Terpadu yang dirancang khusus untuk **KB-TK Bhakti Tunas Harapan (SBTH) Magelang** dengan pendekatan **Playful, Child-Friendly, dan Cepat**.

---

## 🌟 Daftar Isi
1. [Tentang Sistem](#tentang-sistem)
2. [Cara Menjalankan Aplikasi](#cara-menjalankan-aplikasi)
3. [Mode Akses Pengguna](#mode-akses-pengguna)
   - [A. Kiosk Katalog Visual Anak (OPAC)](#a-kiosk-katalog-visual-anak-opac)
   - [B. Portal Mandiri Siswa & Orang Tua](#b-portal-mandiri-siswa--orang-tua)
   - [C. Meja Kerja Pustakawan](#c-meja-kerja-pustakawan)
4. [Panduan Operasional Pustakawan](#panduan-operasional-pustakawan)
   - [1. Sirkulasi Peminjaman & Pengembalian Cepat](#1-sirkulasi-peminjaman--pengembalian-cepat)
   - [2. Input Buku Baru (Scan ISBN Otomatis)](#2-input-buku-baru-scan-isbn-otomatis)
   - [3. Manajemen Eksemplar & Cetak Label Barcode](#3-manajemen-eksemplar--cetak-label-barcode)
   - [4. Kelola Anggota & Kenaikan Kelas Massal](#4-kelola-anggota--kenaikan-kelas-massal)
   - [5. Kas Keuangan & Pembayaran Denda QRIS](#5-kas-keuangan--pembayaran-denda-qris)
   - [6. Analitik Koleksi & Ekspor Excel](#6-analitik-koleksi--ekspor-excel)
   - [7. Integrasi Bot Telegram & Pengingat Rutin](#7-integrasi-bot-telegram--pengingat-rutin)
5. [Dukungan Perangkat Keras (Hardware)](#dukungan-perangkat-keras-hardware)
6. [Kontak & Bantuan Pengembang](#kontak--bantuan-pengembang)

---

## 🏫 Tentang Sistem
- **Nama Sekolah**: KB-TK Bhakti Tunas Harapan (SBTH) Magelang
- **Slogan**: *"Be Smart, Be Kind"* (好好学习，天天向上)
- **Alamat**: Jl. Jendral Sudirman No. 68A, Magersari, Magelang Selatan, Kota Magelang
- **Karakter UI**: Hangat, playful, font rounded ramah anak (*Fredoka* & *Plus Jakarta Sans*), dukungan 3 Bahasa (Indonesia, English, 中文), serta dark/light mode otomatis.

---

## 🚀 Cara Menjalankan Aplikasi

### Opsi 1: Menjalankan di Komputer Sekolah (Windows)
1. Cukup klik ganda file **`start_perpus_sbth.bat`** di folder aplikasi.
2. Aplikasi otomatis membuka browser di alamat: `http://localhost:3000`.

### Opsi 2: Perintah Manual (Terminal)
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## 👥 Mode Akses Pengguna

### A. Kiosk Katalog Visual Anak (OPAC)
Ditujukan untuk anak-anak, orang tua murid, dan pengunjung perpus di layar sentuh atau dari rumah:
- **Pencarian Cepat & Topik Ramah Anak**: Tombol chip topik instan (`🦒 Hewan`, `🦖 Dinosaurus`, `🌙 Dongeng Tidur`, `🔤 Belajar Huruf`).
- **Pilihan 3 Bahasa**: Klik tombol **ID**, **EN**, atau **中文** di pojok kanan atas untuk mengganti bahasa antarmuka secara instan.
- **Koleksi Buku Baru (New Arrivals)**: Tampilan carousel interaktif bersnap horizontal dengan tombol panah navigasi.
- **Paling Sering Dipinjam**: Peringkat 1–5 buku terfavorit lengkap dengan medali emas, perak, dan perunggu.
- **Pilihan Sesuai Usia**: Tab kategori usia (Toddler, Nursery, TK-A, TK-B).
- **Sampul Buku Artistik**: Komponen *Book Cover Placeholder* dengan gradien punggung buku 3D warna-warni yang rapi dan seragam.

### B. Portal Mandiri Siswa & Orang Tua
- Siswa atau wali murid dapat masuk menggunakan kode anggota / nomor telepon.
- Melihat daftar buku yang sedang dipinjam beserta tanggal jatuh tempo.
- Menandai buku impian (*Wishlist / Buku Impianku*).

### C. Meja Kerja Pustakawan
Klik tombol **"Mode Pustakawan"** di pojok kanan atas (dilindungi PIN keamanan). Membuka akses menu lengkap:
1. **Sirkulasi & Pinjam-Kembali**
2. **Koleksi & Eksemplar Fisik**
3. **Data Anggota & Kelas**
4. **Drawer Menu Lainnya**: Analitik, Kas & Denda, Pengaturan Sistem.

---

## 📖 Panduan Operasional Pustakawan

### 1. Sirkulasi Peminjaman & Pengembalian Cepat
Sistem sirkulasi menggunakan alur 2 langkah sederhana:
- **Langkah 1: Pilih Anggota**
  - Tembak barcode kartu siswa dengan scanner barcode USB, atau ketik nama siswa di pencarian cepat.
  - Kartu siswa terpilih akan tampil bersama kuota peminjaman yang tersisa.
- **Langkah 2: Tembak Barcode Buku**
  - Tembak stiker barcode unik buku (contoh: `SBTH-B-00101`). Buku langsung masuk ke keranjang pinjam dengan suara bip sukses.
  - Klik **"Konfirmasi Peminjaman"** (tombol amber utama).
- **Pengembalian Cepat (Fast Return)**:
  - Cukup tembak barcode buku pada kotak pengembalian di tab "Pengembalian Cepat". Sistem otomatis menyelesaikan pinjaman dan memperbarui status eksemplar menjadi *Tersedia di Rak*.
  - Jika buku rusak atau hilang, pilih kondisi buku untuk mencatat denda/ganti rugi otomatis.

### 2. Input Buku Baru (Scan ISBN Otomatis)
1. Buka tab **"Koleksi & Eksemplar"** lalu klik **"+ Input Buku (Scan ISBN)"**.
2. Tembak barcode ISBN buku terbitan resmi, atau ketik judul buku.
3. Sistem otomatis menarik judul, pengarang, penerbit, tahun terbit, dan sinopsis dari Google Books API.
4. Tentukan kategori buku, rak penyimpanan, dan jumlah eksemplar fisik yang ingin dicetak.
5. Klik **"Simpan Koleksi & Buat Barcode"**.

### 3. Manajemen Eksemplar & Cetak Label Barcode
- Setiap judul buku dapat memiliki banyak eksemplar fisik dengan nomor barcode tersendiri.
- **Aksen Status Cepat**: Eksemplar memiliki indikator warna kiri (*Hijau = Tersedia*, *Kuning = Dipinjam*, *Merah = Rusak/Hilang*).
- **Cetak Label Barcode & Punggung Buku**: Klik tombol **"Cetak Label"** untuk mencetak stiker barcode label buku siap tempel yang sudah disesuaikan dengan ukuran standar rak SBTH.

### 4. Kelola Anggota & Kenaikan Kelas Massal
- **Tambah Anggota Baru**: Klik tombol amber **"Tambah Anggota"**, masukkan nama anak, tingkat kelas (Toddler, Nursery, TK-A, TK-B), angkatan/tahun ajaran, serta nama dan nomor WhatsApp orang tua.
- **Cetak Kartu Pustaka Anak**: Klik tombol **"Kartu"** pada baris siswa untuk menampilkan kartu ID perpustakaan anak yang ramah anak, lengkap dengan barcode dan nama kelas siap cetak.
- **Naik Kelas Massal Tiap Tahun Ajaran**:
  - Klik **"Naik Kelas Massal"**.
  - Pilih tahun ajaran asal (misal `2025/2026`) dan tahun ajaran baru (misal `2026/2027`).
  - Sistem otomatis menaikkan jenjang: Toddler ➔ Nursery ➔ TK-A ➔ TK-B, dan siswa TK-B otomatis dialihkan statusnya menjadi *Alumni* (tanpa menghapus riwayat bacaan historisnya).

### 5. Kas Keuangan & Pembayaran Denda QRIS
- Buka menu **Lainnya ➔ Kas & Denda** (terbuka dalam Drawer kanan yang lapang).
- **Pencatatan Denda Otomatis**: Keterlambatan dihitung otomatis sesuai pengaturan (standar Rp 500/hari/buku).
- **Pembayaran Denda via QRIS**: Menampilkan kartu QRIS sekolah bersih. Orang tua dapat langsung memindai QRIS dari ponsel mereka. Setelah konfirmasi, pustakawan cukup klik "Tandai Lunas".
- **Laporan Keuangan Kas**: Menampilkan total penerimaan kas denda, penggantian buku rusak, dan sumbangan sukarela.

### 6. Analitik Koleksi & Ekspor Excel
- Buka menu **Lainnya ➔ Analitik Perpustakaan**.
- **Ringkasan Nilai Aset**: Total eksemplar, nilai estimasi investasi buku (Rp), perbandingan buku beli sekolah vs sumbangan orang tua.
- **Buku Terpopuler vs Dead Stock**: Mengidentifikasi buku yang paling sering dibaca anak serta buku yang belum pernah dipinjam (untuk rotasi rak pajangan).
- **Ekspor Excel**: Klik **"Ekspor Analitik ke Excel (.xlsx)"** untuk mengunduh rekap aset lengkap 4-sheet siap cetak untuk laporan Yayasan atau akreditasi sekolah.

### 7. Integrasi Bot Telegram & Pengingat Rutin
- Buka menu **Lainnya ➔ Pengaturan ➔ Integrasi Telegram**.
- Masukkan *Bot Token* dan *Chat ID* grup pengurus/guru.
- **Laporan Otomatis**: Menerima ringkasan sirkulasi mingguan otomatis.
- **Backup File Otomatis**: Database lokal dapat dikirim secara berkala ke Telegram tanpa biaya server tambahan.

---

## 🔌 Dukungan Perangkat Keras (Hardware)
1. **Barcode Scanner**: Mendukung semua jenis scanner barcode USB / 2.4GHz Wireless (plug-and-play seperti keyboard).
2. **Kamera Web / HP**: Terintegrasi modal scanner kamera berbasis HTML5 untuk pemindaian instan tanpa alat tambahan.
3. **Printer**: Kompatibel dengan printer inkjet/laser standar (A4 / F4) serta printer label thermal stiker.

---

## 📞 Kontak & Bantuan Pengembang

Aplikasi ini dikembangkan khusus dengan penuh dedikasi untuk menunjang budaya literasi sejak dini di **KB-TK Bhakti Tunas Harapan (SBTH) Magelang**.

- **Pengembang**: Prasetyo Handy Kurniawan
- **WhatsApp**: [+62 812-9125-5917](https://wa.me/6281291255917)
- **Email**: prasetyo.handy@gmail.com

*Jika memerlukan pendampingan konfigurasi awal, kustomisasi format barcode, atau penambahan fitur baru, silakan menghubungi kontak di atas.*
