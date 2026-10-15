# 📚 Panduan Lengkap Penggunaan Perpustakaan Digital SBTH Magelang
> **Sistem Informasi Perpustakaan Modern Kompatibel SLiMS 9 Bulian untuk KB-TK Bhakti Tunas Harapan**  
> *"Be Smart, Be Kind"* • 好好学习，天天向上

---

## 📑 Daftar Isi
1. [Tentang Sistem & Arsitektur](#1-tentang-sistem--arsitektur)
2. [Instalasi Cepat & Penggunaan Multi-PC LAN Jaringan Sekolah](#2-instalasi-cepat--penggunaan-multi-pc-lan-jaringan-sekolah)
3. [Katalog Visual Anak (OPAC) & Fitur Anti-Scroll Fatigue](#3-katalog-visual-anak-opac--fitur-anti-scroll-fatigue)
4. [Sistem Reservasi / Booking Buku (Hold 1x24 Jam)](#4-sistem-reservasi--booking-buku-hold-1x24-jam)
5. [Sirkulasi & Modul Perpanjangan Masa Pinjam (Renewal)](#5-sirkulasi--modul-perpanjangan-masa-pinjam-renewal)
6. [Aturan Peminjaman Fleksibel (Loan Rules)](#6-aturan-peminjaman-fleksibel-loan-rules)
7. [Standarisasi Penamaan SLiMS: Barcode & Call Number 3-Baris](#7-standarisasi-penamaan-slims-barcode--call-number-3-baris)
8. [Ekspor Koleksi Format SLiMS CSV & Excel](#8-ekspor-koleksi-format-slims-csv--excel)
9. [Sistem Manajemen Konten (CMS Warta & Pengumuman)](#9-sistem-manajemen-konten-cms-warta--pengumuman)
10. [Stock Opname (Cacah Ulang Koleksi Fisik Rak)](#10-stock-opname-cacah-ulang-koleksi-fisik-rak)
11. [Dukungan Perangkat Keras & Kontak Pengembang](#11-dukungan-perangkat-keras--kontak-pengembang)

---

## 1. Tentang Sistem & Arsitektur

Perpustakaan Digital KB-TK Bhakti Tunas Harapan (SBTH) adalah sistem informasi manajemen perpustakaan modern yang menggabungkan:
- Standarisasi kepustakawanan nasional dan **SLiMS (Senayan Library Management System 9 Bulian)**.
- Antarmuka visual yang menyenangkan (*playful child-friendly*), trilingual (Indonesia, Inggris, Mandarin), dan responsif.
- Arsitektur modern berbasis web lokal (Next.js 16 PWA) tanpa ketergantungan pada database SQL tradisional yang berat, sehingga tidak rentan rusak (*corrupt*) dan siap digunakan tanpa konfigurasi server yang rumit.

---

## 2. Instalasi Cepat & Penggunaan Multi-PC LAN Jaringan Sekolah

### Cara Menjalankan di Komputer Utama (PC Server Perpustakaan)
1. Buka folder aplikasi di Windows Explorer.
2. Klik ganda file:
   ```text
   start_server_lan.bat
   ```
3. Jendela hitam command prompt akan otomatis mendeteksi alamat IP komputer Anda dan menyalakan server.
4. Browser akan otomatis terbuka menampilkan aplikasi di alamat:
   ```text
   http://localhost:3000
   ```

### Cara Membuka dari PC Lain / Laptop Guru / Tablet Siswa (Multi-PC LAN)
Agar guru di ruang kelas atau siswa di pojok baca bisa membuka katalog bersamaan:
1. Pastikan komputer server dan laptop/tablet lain terhubung ke **jaringan Wi-Fi / LAN yang sama**.
2. Pada laptop/tablet lain, buka Google Chrome, Microsoft Edge, atau Safari.
3. Ketik alamat IP komputer server yang tertera di layar `start_server_lan.bat`, contohnya:
   ```text
   http://192.168.1.50:3000
   ```
4. Aplikasi langsung terbuka dengan kecepatan maksimal tanpa hambatan!

### 🛡️ Cara Mencegah Tabrakan Data (Concurrency & Collision-Free)
- Setiap transaksi peminjaman, perpanjangan, pengembalian, dan reservasi dilengkapi dengan ID unik bertimestamp mikrodetik (`res-timestamp`, `loan-timestamp`).
- Penomoran eksemplar otomatis (*Pattern Generator*) menggunakan nomor urut terpusat (*auto-increment*), sehingga tidak akan menghasilkan barcode ganda.
- Setiap aktivitas tercatat secara kronologis di **Audit Activity Log** yang dapat dipantau oleh Pustakawan Utama.

---

## 3. Katalog Visual Anak (OPAC) & Fitur Anti-Scroll Fatigue

Tata letak katalog telah direkayasa ulang agar memangkas jarak gulir vertikal (*scroll fatigue*) sehingga anak dan orang tua langsung menemukan buku yang dicari:

### 1. Blok Sorotan Tabbed Carousel (Hemat 65% Ruang Layar)
Tiga baris kartu vertikal (*Buku Baru*, *Paling Sering Dipinjam*, dan *Rekomendasi Usia*) disatukan menjadi **1 Blok Tabbed Carousel**:
- `[ ✨ Baru Masuk ]`: Menampilkan buku-buku cerita terbaru.
- `[ 🏆 Paling Sering Dipinjam ]`: Menampilkan buku paling diminati anak lengkap dengan medali peringkat.
- `[ 👶 Sesuai Usia ]`: Rekomendasi buku terbagi untuk Toddler, Nursery, TK-A, dan TK-B.
- **Tombol Akordeon `[ Sembunyikan Sorotan ▲ ]`**: Dapat diklik untuk menutup blok sorotan menjadi baris tipis ringkas.

### 2. Kategori Rak Buku Model Pills (Kapsul Horizontal)
Kategori rak kini berbentuk kapsul horizontal tepat di atas katalog buku. Klik salah satu kategori (misal: *🌿 Alam & Sains* atau *⭐ Dongeng & Fabel*) untuk menyaring buku secara instan.

### 3. Perilaku Pintar Saat Mencari & Mode Daftar List
- **Auto-Collapse saat Mengetik:** Begitu mengetik di kolom pencarian atau mengeklik chip topik, seluruh sorotan atas otomatis ter-minimize sehingga hasil buku langsung naik ke hadapan pengguna.
- **Mode Daftar List (Compact Row):**
  - Menggantikan ikon emoji lama dengan **Mini-Thumbnail Cover Asli (48x64 px, rasio 3:4)**.
  - Menampilkan badge **Nomor Panggil SLiMS** (`398.2 TIM d`).
  - Baris buku padat (tinggi 75-85px) sehingga satu layar dapat memuat 6-8 judul sekaligus.
  - Ketika beralih ke Mode List, blok sorotan atas otomatis ter-minimize menjadi baris akordeon rapi.

---

## 4. Sistem Reservasi / Booking Buku (Hold 1x24 Jam)

Jika seluruh eksemplar suatu buku sedang dipinjam:
1. Tombol **`[ 📌 Booking / Reservasi Buku ]`** akan otomatis muncul pada kartu dan baris detail buku.
2. Pengunjung/siswa cukup mengeklik tombol tersebut dan memilih nama anggota.
3. Buku langsung masuk ke antrean reservasi dengan status **PENDING**.
4. **Saat Buku Dikembalikan di Meja Sirkulasi:**
   - Sistem membunyikan nada perhatian dan memunculkan banner peringatan:  
     `🔔 BUKU TELAH DI-RESERVASI OLEH: [Nama Siswa] ([Kelas])`.
   - Buku tersebut otomatis diamankan dengan status **READY_FOR_PICKUP** selama **1x24 Jam** (dapat diatur di panel pengaturan).
   - Buku tidak akan dapat dipinjam oleh siswa lain selama masa tunggu tersebut.

---

## 5. Sirkulasi & Modul Perpanjangan Masa Pinjam (Renewal)

Meja Sirkulasi Pustakawan kini memiliki **5 Tab Utama**:
1. **Peminjaman Baru:**
   - Pilih anggota (Scan barcode kartu atau cari nama).
   - Scan barcode buku fisik (contoh: `SBTH-B-00101` atau `B00101`).
   - **Pilihan Durasi Fleksibel:** Dropdown durasi peminjaman:
     - `3 Hari (Kilat)`
     - `7 Hari (1 Minggu)` — *Default Siswa*
     - `14 Hari (2 Minggu)` — *Default Guru*
     - `30 Hari (1 Bulan)` — *Default Pojok Baca*
2. **Pengembalian Kilat:** Tembak barcode buku untuk pengembalian 1-detik. Otomatis mengecek antrean reservasi.
3. **Buku Terlambat:** Menampilkan siswa yang melewati jatuh tempo beserta tombol salin pesan tagihan WhatsApp orang tua.
4. **Perpanjangan Pinjam (Tab Baru ✨):**
   - Masukkan ID/Barcode peminjaman atau cari nama siswa.
   - Pilih opsi penambahan waktu: `+3 Hari`, `+7 Hari`, atau `+14 Hari`.
   - Sistem memvalidasi kuota perpanjangan (Siswa: maks 1x, Guru: maks 2x). Jika kuota habis, sistem menolak perpanjangan agar buku dapat bergantian dibaca oleh siswa lain.
5. **Cek Riwayat Buku:** Pelacakan jejak riwayat peminjaman masa lalu per eksemplar.

---

## 6. Aturan Peminjaman Fleksibel (Loan Rules)

Buka menu **Lainnya ➔ Pengaturan ➔ Tab "Aturan Pinjam"** untuk mengatur kebijakan operasional:
- **Aturan per Tipe Anggota:**
  - **Siswa / Murid TK:** Maksimal 2 buku, durasi 7 hari, batas perpanjangan 1 kali.
  - **Guru & Tenaga Pendidik:** Maksimal 5 buku, durasi 14 hari, batas perpanjangan 2 kali.
  - **Pojok Baca Sentra / Kelas:** Maksimal 15 buku, durasi 30 hari, batas perpanjangan 3 kali.
- **Pilihan Durasi Cepat di Kasir:** Aktifkan/nonaktifkan tombol pilihan hari di meja kasir sirkulasi.
- **Masa Hold Reservasi:** Atur durasi penguncian buku booking (default: 24 jam).
- **Infaq Denda Keterlambatan:** Atur tarif denda per hari (default: Rp 500 / hari / buku).

---

## 7. Standarisasi Penamaan SLiMS: Barcode & Call Number 3-Baris

Buka menu **Lainnya ➔ Pengaturan ➔ Tab "Pola SLiMS & Barcode"**:

### A. Generator Pola Kode Eksemplar Otomatis
Sistem menyediakan 4 pilihan pola penomoran:
1. **Standar SBTH TK:** `SBTH-B-00101`, `SBTH-B-00102`, dst.
2. **SLiMS 9 Bulian Bawaan:** `B00001`, `B00002`, dst.
3. **Kode Kategori Rak:** `DNG-00001` (Dongeng), `SAI-00001` (Sains), dll.
4. **Kustom Sekolah:** Bebas menentukan awalan (prefix), panjang nomor seri (digit), dan akhiran (suffix, misal: `/2026`).

### B. Standar Nomor Panggil Buku (Call Number 3-Baris)
Format stiker etiket punggung buku standar Perpusnas & SLiMS:
```text
┌──────────────┐
│   398.2      │  <- Baris 1: Kode Klasifikasi DDC Subjek Buku
│    TIM       │  <- Baris 2: 3 Huruf Pertama Nama Belakang/Pengarang (KAPITAL)
│     d        │  <- Baris 3: 1 Huruf Pertama Judul Buku (huruf kecil)
└──────────────┘
Hasil: 398.2 TIM d
```

---

## 8. Ekspor Koleksi Format SLiMS CSV & Excel

Untuk kebutuhan migrasi data massal, pencadangan berkala, atau sinkronisasi dengan aplikasi lain:
1. Buka menu **Koleksi & Eksemplar**.
2. Klik tombol **`[ 📥 Ekspor SLiMS ]`** di bagian atas.
3. File `Koleksi_Buku_Format_SLIMS.csv` otomatis terunduh dengan format header standar SLiMS:
   ```csv
   item_code,title,author,publisher,publish_year,isbn,call_number,classification,location,status,source,price_value
   ```
4. File ini dapat langsung diimpor ke SLiMS 9 Bulian melalui menu **Bibliografi ➔ Impor Data**.

---

## 9. Sistem Manajemen Konten (CMS Warta & Pengumuman)

Pustakawan dapat menerbitkan warta informasi yang akan tampil langsung di banner berjalan pada halaman utama OPAC anak:
1. Buka menu **Lainnya ➔ Pengaturan ➔ Tab "Warta Perpus (CMS)"**.
2. Klik tombol **`[ + Terbitkan Warta Baru ]`**.
3. Isi Judul, Kategori (*Pengumuman, Libur Sekolah, Stock Opname, Agenda Dongeng, Buku Baru*), Ringkasan Banner, dan Isi Lengkap.
4. Aktifkan opsi **"📌 Sematkan di urutan paling atas"** jika merupakan informasi penting darurat.
5. Pustakawan dapat menonaktifkan atau mengaktifkan kembali warta kapan saja menggunakan tombol ikon mata (`Eye`).

---

## 10. Stock Opname (Cacah Ulang Koleksi Fisik Rak)

Sistem audit inventaris fisik rak buku yang mudah (*"As easy as ABC"*):
1. **Tahap Persiapan:**
   - Rapikan buku di rak (*shelving*) sesuai nomor klasifikasi DDC.
   - Buka menu **Koleksi ➔ Stock Opname**.
2. **Tahap Eksekusi (Scanning Fisik):**
   - Bawa laptop dan scanner barcode USB ke lorong rak buku.
   - Arahkan scanner ke stiker barcode di sampul belakang setiap buku.
   - Sistem berbunyi bip hijau untuk setiap buku yang cocok dan mencatat statusnya sebagai **FOUND**.
3. **Tahap Rekonsiliasi & Berita Acara:**
   - Sistem otomatis mengelompokkan buku yang *Cocok*, *Hilang (Missing)*, dan *Rusak (Damaged)*.
   - Klik **"Cetak Berita Acara Stock Opname"** untuk menghasilkan dokumen formal ber-KOP resmi sekolah lengkap dengan tanda tangan elektronik Kepala Sekolah dan Pustakawan Utama.

---

## 11. Dukungan Perangkat Keras & Kontak Pengembang

- **Scanner Barcode:** Kompatibel 100% dengan seluruh merk scanner barcode USB dan Wireless 2.4GHz (Honeywell, Eyoyo, Netum, Kassen, dll.).
- **Printer:** Kompatibel dengan printer thermal stiker barcode (Xprinter, Blueprint, Epson) dan printer inkjet/laser warna (Canon, Epson, HP).
- **Perangkat Akses:** Mendukung PC Windows, Mac, iPad, Android Tablet, dan Smartphone.

---

### 👨‍💻 Pengembang & Bantuan Teknis
Aplikasi ini dikembangkan dan dipelihara secara berkesinambungan oleh:
- **Nama**: Prasetyo Handy Kurniawan
- **WhatsApp**: [+62 812-9125-5917](https://wa.me/6281291255917)
- **Email**: prasetyo.handy@gmail.com
- **Lokasi**: Kota Magelang, Jawa Tengah, Indonesia

*Untuk penambahan fitur lanjutan, integrasi server sekolah, atau pendampingan operasional, silakan hubungi kontak di atas.*
