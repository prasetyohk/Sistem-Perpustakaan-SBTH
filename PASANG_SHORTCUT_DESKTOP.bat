@echo off
title Pasang Shortcut Desktop Perpustakaan SBTH
color 0B
cd /d "%~dp0"

echo ========================================================
echo   PASANG SHORTCUT RESMI PERPUSTAKAAN SBTH DI DESKTOP
echo ========================================================
echo.
echo Sedang membuat jalan pintas (shortcut) dengan ikon resmi...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; ^
   $desktop = [System.Environment]::GetFolderPath('Desktop'); ^
   $s1 = $ws.CreateShortcut(\"$desktop\Perpustakaan SBTH TK (Pusat).lnk\"); ^
   $s1.TargetPath = \"$((Get-Location).Path)\JALANKAN_PERPUSTAKAAN_PUSAT.bat\"; ^
   $s1.WorkingDirectory = \"$((Get-Location).Path)\"; ^
   $s1.IconLocation = \"$((Get-Location).Path)\public\app_icon.ico,0\"; ^
   $s1.Description = \"Aplikasi Perpustakaan SBTH Magelang - Mode Server Pusat\"; ^
   $s1.Save(); ^
   $s2 = $ws.CreateShortcut(\"$desktop\Perpustakaan SBTH (PC Klien).lnk\"); ^
   $s2.TargetPath = \"$((Get-Location).Path)\BUKA_PERPUSTAKAAN_KLIEN.bat\"; ^
   $s2.WorkingDirectory = \"$((Get-Location).Path)\"; ^
   $s2.IconLocation = \"$((Get-Location).Path)\public\app_icon.ico,0\"; ^
   $s2.Description = \"Aplikasi Perpustakaan SBTH Magelang - Mode Klien / PC Lain\"; ^
   $s2.Save();"

if %errorlevel% equ 0 (
    echo.
    echo [SUKSES] Shortcut berikon resmi berhasil dibuat di Desktop Windows:
    echo  1. "Perpustakaan SBTH TK (Pusat)" -> untuk Komputer Utama / Server
    echo  2. "Perpustakaan SBTH (PC Klien)"  -> untuk Komputer Klien / Guru Lain
    echo.
    echo Cukup klik 2x dari Desktop untuk langsung menjalankan aplikasi!
) else (
    echo [WARNING] Tidak dapat membuat shortcut otomatis, namun file .bat tetap dapat dijalankan langsung.
)

echo.
pause
