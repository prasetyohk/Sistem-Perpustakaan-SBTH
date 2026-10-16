@echo off
title Hentikan Server Perpustakaan SBTH
color 0C
cd /d "%~dp0"

echo ========================================================
echo        HENTIKAN SERVER PERPUSTAKAAN SBTH TK
echo ========================================================
echo.
echo Sedang menghentikan proses server Node.js di latar belakang...

taskkill /F /IM node.exe >nul 2>nul

echo [SUKSES] Server perpustakaan di latar belakang telah dihentikan.
echo.
timeout /t 3 >nul
exit /b 0
