@echo off
title PERPUSTAKAAN SBTH TK - Sistem Otomatis
color 0A

echo ========================================================
echo        SISTEM INFORMASI PERPUSTAKAAN SBTH TK
echo      Katalog Visual Anak, Sirkulasi, Label dan Bot
echo ========================================================
echo.

:: Periksa ketersediaan Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan!
    echo Silakan install Node.js versi 18+ terlebih dahulu dari https://nodejs.org/
    pause
    exit /b 1
)

:: Pindah ke direktori script ini berada
cd /d "%~dp0"

:: Cek apakah dependencies sudah terpasang
if not exist "node_modules\" (
    echo [INFO] Memasang dependensi aplikasi pertama kali...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Gagal memasang dependensi!
        pause
        exit /b 1
    )
)

echo [INFO] Menyiapkan server perpustakaan...
echo.
echo ========================================================
echo  Aplikasi dapat diakses di:
echo  1. Komputer ini : http://localhost:3000
echo  2. HP Guru (WiFi): http://[IP-Komputer-Ini]:3000
echo ========================================================
echo.
echo Membuka browser dalam 4 detik...

:: Buka browser secara otomatis di background
start "" cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:3000"

:: Jalankan server Next.js
echo Menjalankan server aplikasi...
call npm run dev

pause
