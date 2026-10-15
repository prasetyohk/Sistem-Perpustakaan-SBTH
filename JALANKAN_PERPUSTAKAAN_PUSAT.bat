@echo off
title PERPUSTAKAAN SBTH TK - SERVER PUSAT
color 0A

echo ========================================================
echo       SISTEM INFORMASI PERPUSTAKAAN DIGITAL SBTH TK
echo     Katalog Visual Anak, Sirkulasi, Label dan WhatsApp
echo ========================================================
echo.

:: Pindah ke direktori script ini
cd /d "%~dp0"

:: Periksa ketersediaan Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan!
    echo Silakan install Node.js versi 18+ terlebih dahulu dari https://nodejs.org/
    pause
    exit /b 1
)

:: Cek dependensi
if not exist "node_modules\" (
    echo [INFO] Memasang dependensi aplikasi pertama kali...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Gagal memasang dependensi!
        pause
        exit /b 1
    )
)

:: Deteksi alamat IP Lokal Komputer ini (untuk PC lain)
for /f "tokens=4" %%a in ('route print 0.0.0.0 2^>nul ^| findstr "0.0.0.0" ^| findstr /v "Default"') do (
    set SERVER_IP=%%a
)
if "%SERVER_IP%"=="" (
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" 2^>nul') do (
        for /f "tokens=1" %%b in ("%%a") do set SERVER_IP=%%b
    )
)

:: Simpan IP Pusat ke file agar PC klien mudah membaca
echo %SERVER_IP% > IP_SERVER_PUSAT.txt

echo ========================================================
echo  Aplikasi Perpustakaan SBTH siap diakses:
echo  1. Komputer Pusat ini : http://localhost:3000
if not "%SERVER_IP%"=="" (
echo  2. PC Lain / HP Guru  : http://%SERVER_IP%:3000
)
echo ========================================================
echo.
echo Membuka browser dalam 4 detik...

:: Buka browser secara otomatis
start "" cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:3000"

:: Jalankan server aplikasi
echo Menjalankan server aplikasi perpustakaan...
call npm run dev

pause
