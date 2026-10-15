# 📚 Perpustakaan Digital KB-TK Bhakti Tunas Harapan (SBTH) Magelang
> **Sistem Informasi Manajemen Perpustakaan Terpadu Standar SLiMS 9 Bulian dengan Pengalaman Modern Child-Friendly**  
> *"Be Smart, Be Kind"* • 好好学习，天天向上

---

## 🌟 Ikhtisar Sistem & Keunggulan Dibanding SLiMS 9 Bulian

Aplikasi Perpustakaan Digital SBTH dirancang untuk menghadirkan seluruh kapabilitas standar perpustakaan profesional seperti **SLiMS (Senayan Library Management System 9 Bulian)**, namun dikemas dalam arsitektur modern (Next.js 16 + React 19 + TypeScript + Tailwind CSS) yang jauh **lebih ringan, instan, bebas instalasi server web rumit (Apache/PHP/MySQL)**, dan ramah anak usia dini (PAUD/TK).

### 📊 Tabel Matriks Perbandingan: Perpustakaan SBTH vs SLiMS 9 Bulian

| Fitur Utama | SLiMS 9 Bulian (Tradisional) | Perpustakaan Digital SBTH (Aplikasi Ini) |
|---|---|---|
| **Teknologi & Instalasi** | Wajib pasang XAMPP/Apache, PHP 8, MySQL/MariaDB. Sering kendala port tabrakan di Windows. | **Siap pakai 1-klik di Windows** (`start_server_lan.bat`). Ringan, tanpa database server terpisah. |
| **Katalogisasi Otomatis (ISBN)** | Butuh konfigurasi server P2P/Z39.50/SRU perpustakaan nasional yang sering *timeout*. | **Scan ISBN Instan** terhubung ke Google Books API & Open Library. Menarik judul, pengarang, penerbit & sinopsis dalam 1 detik. |
| **Sampul Buku Otomatis (Auto-Cover)** | Manual lewat DuckDuckGo atau perlu plugin pihak ketiga Google Books API. | **Otomatis Cover HD Resmi** + sistem *SmartBookCover* generatif 3D warna-warni jika buku belum memiliki cover digital. |
| **Pola Barcode Eksemplar (Pattern Generator)** | Menu Master File ➔ Pola Eksemplar (`B00001`, `00001/P/2026`). | **Preset SLiMS Lengkap**: Pilihan format SLiMS (`B00001`), format SBTH (`SBTH-B-00001`), Rak (`DNG-00001`), atau Kustom bebas dengan nomor auto-increment. |
| **Nomor Panggil 3-Baris (Call Number)** | Rumus: `[DDC] [3-HURUF PENGARANG] [1-huruf judul]`. | **Dihasilkan Otomatis**: Contoh `398.2 TIM d` lengkap dengan DDC ramah anak dan generator stiker label punggung buku siap cetak. |
| **Aturan Pinjam Fleksibel (Loan Rules)** | Pengaturan tipe anggota di database. | **Editable Penuh di Panel Pengaturan**: Kuota buku, durasi (Siswa: 2 buku/7 hari, Guru: 5 buku/14 hari, Pojok Baca: 15 buku/30 hari). |
| **Perpanjangan Pinjam (Renewal)** | Modul Sirkulasi SLiMS. | **Tab Khusus Perpanjangan**: Dilengkapi kuota perpanjangan (1x siswa, 2x guru), selektor durasi (+3, +7, +14 hari), dan audio feedback. |
| **Reservasi Buku (Booking Hold)** | Fitur modul reservasi sirkulasi. | **Booking Mandiri Siswa di OPAC**: Kunci buku yang sedang dipinjam orang lain. Dilengkapi batas hold **1x24 jam** & notifikasi otomatis saat buku kembali. |
| **Ekspor / Impor Data Koleksi** | Format CSV / Excel SLiMS. | **1-Klik Ekspor SLiMS CSV**: Kompatibel 100% dengan kolom impor bibliografi dan eksemplar SLiMS 9 Bulian. |
| **Antarmuka Anak (OPAC)** | Tampilan web katalog standar dewasa/umum. | **Kiosk Visual Anak Trilingual (ID/EN/ZH)**: Desain playful, tabbed carousel sorotan, horizontal category pills, anti-scroll fatigue, dan filter cerdas. |
| **Akses Jaringan Lokal (Multi-PC LAN)** | Harus setting `httpd-vhosts` dan IP binding Apache. | **Auto-detect IP LAN**: Mendukung laptop guru & tablet siswa bersamaan via Wi-Fi sekolah tanpa tabrakan. |

---

## 🚀 Cara Menjalankan Aplikasi di Windows

### 1. Mode Server Jaringan Sekolah (Multi-PC LAN & Tablet)
Untuk mengaktifkan aplikasi agar bisa dibuka di komputer server perpustakaan **sekaligus dapat diakses oleh laptop guru di kelas atau tablet siswa di pojok baca**:

Cukup **klik ganda (double click)** file:
```text
start_server_lan.bat
```
Script otomatis akan:
1. Mendeteksi alamat IP lokal komputer server (misal: `192.168.1.50`).
2. Menyalakan server perpustakaan yang dapat menerima koneksi dari perangkat lain.
3. Membuka browser lokal ke `http://localhost:3000`.
4. Menampilkan alamat yang dapat diketik oleh laptop/tablet lain di jaringan Wi-Fi sekolah:
   ```text
   http://192.168.1.xxx:3000
   ```

### 2. Menjalankan via Terminal (Developer)
```bash
# Pasang dependensi
npm install

# Jalankan server pengembangan
npm run dev

# Jalankan server LAN (bind all interfaces)
npm run dev -- -H 0.0.0.0 -p 3000

# Validasi build produksi
npm run build
```

---

## 🛠️ Ringkasan Fitur Unggulan Terbaru

1. **Anti-Scroll Fatigue Tabbed OPAC**:
   - Menggabungkan *Buku Baru*, *Buku Terfavorit*, dan *Pilihan Usia* menjadi 1 blok Tabbed Carousel yang rapi.
   - Tombol akordeon `[ Sembunyikan Sorotan ▲ ]` dan `[ Buka Sorotan ▼ ]`.
   - Statistik koleksi terintegrasi sebagai badge transparan di bawah hero banner.
   - Kategori rak model kapsul horizontal (*Pills*) langsung di atas katalog.
   - Auto-minimize saat mengetik di search bar atau saat berganti ke **Mode Daftar List**.
   - Mode Daftar List menggunakan cover mini-thumbnail (`48x64 px`, rasio 3:4) dengan stiker Call Number 3-baris SLiMS.

2. **Sirkulasi Cepat & Modul Perpanjangan (Renewal)**:
   - Tab sirkulasi ke-5: **Perpanjangan Pinjam** dengan pencarian peminjam aktif.
   - Pilihan durasi cepat saat checkout: `3 Hari (Kilat)`, `7 Hari (1 Minggu)`, `14 Hari (2 Minggu)`, `30 Hari (1 Bulan)`.
   - Alert peringatan instan jika buku yang dikembalikan memiliki antrean reservasi aktif.

3. **Reservasi Buku (Booking System)**:
   - Tombol `[ Booking Buku Ini ]` muncul otomatis di katalog jika stok buku sedang kosong/dipinjam.
   - Sistem hold otomatis **1x24 jam** saat buku dikembalikan ke perpustakaan.

4. **Konfigurasi Standar SLiMS & Master File**:
   - Tab pengaturan pola kode eksemplar (`B00001`, `SBTH-B-00001`, dll.) dengan pratinjau real-time.
   - Penjelasan visual etiket nomor panggil DDC 3-baris (`398.2 TIM d`).
   - Ekspor seluruh koleksi ke format CSV SLiMS kompatibel 100%.

5. **Sistem Manajemen Konten (CMS Warta Perpustakaan)**:
   - Tambah dan kelola pengumuman libur, jadwal stock opname, acara mendongeng, atau info buku baru.
   - Warta aktif langsung tampil di banner atas portal OPAC anak.

---

## 📖 Panduan Penggunaan Lengkap
Panduan langkah demi langkah untuk Pustakawan, Guru, dan Siswa tersedia di:  
👉 **[PANDUAN_PENGGUNAAN.md](./PANDUAN_PENGGUNAAN.md)**

---

## 👨‍💻 Profil Pengembang & Dukungan Teknis
- **Pengembang**: Prasetyo Handy Kurniawan
- **WhatsApp**: [+62 812-9125-5917](https://wa.me/6281291255917)
- **Email**: prasetyo.handy@gmail.com
- **Lokasi**: Kota Magelang, Jawa Tengah  
*Aplikasi ini didesain dan direkayasa secara khusus untuk memajukan literasi anak usia dini di KB-TK Bhakti Tunas Harapan (SBTH).*
