@echo off
title PERPUSTAKAAN DIGITAL SBTH - SERVER LAN & WINDOWS APP
color 0A
cls

echo ======================================================================
echo    PERPUSTAKAAN DIGITAL KB-TK BHAKTI TUNAS HARAPAN (SBTH)
echo    Aplikasi Siap Pakai & Server Jaringan Lokal (Multi-PC LAN)
echo ======================================================================
echo.

:: Cek apakah Node.js terpasang
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js belum terpasang di komputer ini!
    echo Silakan unduh dan pasang Node.js LTS dari https://nodejs.org/
    echo Setelah itu, jalankan kembali file ini.
    echo.
    pause
    exit /b
)

:: Deteksi Alamat IP Lokal (IPv4)
set LOCAL_IP=127.0.0.1
for /f "tokens=4" %%a in ('route print^|findstr 0.0.0.0.*0.0.0.0') do (
    set LOCAL_IP=%%a
)

echo [1/3] Menyiapkan modul dan dependensi aplikasi...
if not exist "node_modules" (
    echo Menginstal dependensi pertama kali (harap tunggu sebentar)...
    call npm install
)

echo [2/3] Alamat Akses Perpustakaan Berhasil Diaktifkan:
echo ----------------------------------------------------------------------
echo  * Akses di PC Server ini:  http://localhost:3000
echo  * Akses dari PC / Tablet Lain (Wi-Fi): http://%LOCAL_IP%:3000
echo ----------------------------------------------------------------------
echo.
echo [TIPS MULTI-PC LAN]:
echo - Pastikan laptop guru atau tablet siswa terhubung ke Wi-Fi yang SAMA.
echo - Buka browser Google Chrome / Edge di laptop lain, lalu ketik:
echo   http://%LOCAL_IP%:3000
echo.
echo [3/3] Membuka browser otomatis dan menyalakan server...
start http://localhost:3000

:: Menjalankan Next.js server bind ke 0.0.0.0 agar bisa diakses dari jaringan lokal
npm run dev -- -H 0.0.0.0 -p 3000
pause
