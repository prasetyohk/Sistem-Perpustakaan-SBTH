@echo off
title Merekam Video Demo Otomatis Perpustakaan SBTH TK
color 0A
echo ==============================================================
echo    PERPUSTAKAAN SBTH TK - PEREKAM VIDEO DEMO OTOMATIS
echo ==============================================================
echo.
echo Pastikan server lokal sudah berjalan di http://localhost:3000
echo Memulai perekaman video menggunakan Playwright dan Google Chrome...
echo.

node scripts/record_demo_playwright.js

echo.
echo ==============================================================
echo  Video telah berhasil disimpan di folder: demo_videos
echo ==============================================================
pause
