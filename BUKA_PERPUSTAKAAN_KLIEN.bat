@echo off
title PERPUSTAKAAN SBTH TK - MODE PC KLIEN
color 0E

echo ========================================================
echo       KONEKSI PERPUSTAKAAN SBTH TK (MODE PC KLIEN)
echo ========================================================
echo.

cd /d "%~dp0"

set SAVED_IP=
if exist "IP_SERVER_PUSAT.txt" (
    set /p SAVED_IP=<IP_SERVER_PUSAT.txt
)

:: Bersihkan spasi
if not "%SAVED_IP%"=="" (
    for /f "tokens=1" %%i in ("%SAVED_IP%") do set SAVED_IP=%%i
)

if not "%SAVED_IP%"=="" (
    echo Ditemukan alamat Server Pusat terakhir: %SAVED_IP%
    echo.
    echo Tekan ENTER langsung untuk membuka: http://%SAVED_IP%:3000
    echo Atau ketik IP baru jika alamat IP server pusat berubah:
    set /p INPUT_IP=IP Server [default: %SAVED_IP%]: 
) else (
    echo Masukkan alamat IP komputer Server Pusat
    echo (Lihat tulisan di layar Komputer Pusat, contoh: 192.168.1.13):
    set /p INPUT_IP=IP Server Pusat: 
)

if "%INPUT_IP%"=="" (
    set TARGET_IP=%SAVED_IP%
) else (
    set TARGET_IP=%INPUT_IP%
    echo %INPUT_IP% > IP_SERVER_PUSAT.txt
)

if "%TARGET_IP%"=="" (
    echo [ERROR] IP Server belum ditentukan!
    pause
    exit /b 1
)

echo.
echo [INFO] Menghubungkan ke Perpustakaan SBTH: http://%TARGET_IP%:3000 ...
start http://%TARGET_IP%:3000

timeout /t 3 /nobreak >nul
