# 📚 Perpustakaan Digital KB-TK Bhakti Tunas Harapan (SBTH) Magelang

Sistem Informasi Manajemen Perpustakaan Terpadu untuk **KB-TK Bhakti Tunas Harapan (SBTH) Magelang** (*"Be Smart, Be Kind"* 好好学习，天天向上).

---

## ✨ Fitur Unggulan
- **Kiosk Katalog Visual Anak (OPAC)**: Desain playful ramah anak usia dini (TK & PAUD) dengan dukungan trilingual (Indonesia, English, 中文), pencarian topik cepat (Hewan, Dinosaurus, Dongeng), carousel buku baru, dan peringkat buku terpopuler.
- **Sirkulasi Cepat Meja Pustakawan**: Alur 2-langkah dengan audio feedback (bip scanner & chime sukses), pemindaian barcode USB, pengembalian buku 1-detik, dan deteksi denda otomatis.
- **Manajemen Koleksi & ISBN**: Input otomatis metadata buku via Google Books API, kelola multi-eksemplar fisik, catatan kondisi buku (tersedia, rusak, hilang, dimusnahkan), dan generator cetak label stiker barcode rak.
- **Data Anggota & Transisi Kelas Massal**: Kelola anggota Toddler, Nursery, TK-A, TK-B, Guru, dan Pojok Baca Kelas. Fitur satu klik kenaikan kelas tahun ajaran baru serta cetak kartu anggota pustaka anak.
- **Kas Keuangan & Denda QRIS**: Drawer kas yang lapang, pencatatan otomatis denda keterlambatan (Rp 500/hari), serta kartu pembayaran QRIS bersih.
- **Analitik & Ekspor Excel**: Rekap profil nilai total aset buku, buku dead-stock vs favorit, analisis penerbit & pengarang, serta ekspor format Excel (.xlsx) siap laporan Yayasan / akreditasi.
- **Backup & Pengingat Telegram**: Laporan berkala dan auto-backup database tanpa biaya langganan server.

---

## 🚀 Menjalankan Aplikasi

### Di Komputer Sekolah (Windows)
Cukup klik ganda:
```text
start_perpus_sbth.bat
```

### Melalui Perintah Terminal
```bash
# Pasang dependensi (jika baru diinstal)
npm install

# Jalankan server lokal
npm run dev

# Buat berkas build produksi
npm run build
```
Buka peramban di `http://localhost:3000`.

---

## 📖 Dokumentasi Lengkap
Panduan langkah demi langkah penggunaan sistem untuk Pustakawan, Guru, dan Orang Tua tersedia di berkas:
👉 **[PANDUAN_PENGGUNAAN.md](./PANDUAN_PENGGUNAAN.md)**

---

## 👨‍💻 Pengembang & Bantuan Teknis
- **Pengembang**: Prasetyo Handy Kurniawan
- **WhatsApp**: [+62 812-9125-5917](https://wa.me/6281291255917)
- **Email**: prasetyo.handy@gmail.com
- **Lokasi**: Kota Magelang, Jawa Tengah
