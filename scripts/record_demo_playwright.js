const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function runDemo() {
  console.log('🚀 Starting SBTH Library Demo Recording (Headed Mode for True Pixels)...');

  const videoDir = path.resolve(__dirname, '../demo_videos');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  // Clear previous videos in folder
  fs.readdirSync(videoDir).forEach(f => {
    try { fs.unlinkSync(path.join(videoDir, f)); } catch {}
  });

  // Find Chrome or Edge executable
  let executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (!fs.existsSync(executablePath)) {
    executablePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  }
  console.log('Using browser executable:', executablePath);

  // MUST use headless: false so Windows GPU/Compositor doesn't blank the video frames!
  const browser = await chromium.launch({
    executablePath,
    headless: false,
    args: [
      '--disable-gpu',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1280,720',
      '--start-maximized',
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();
  const wait = (ms) => page.waitForTimeout(ms);

  console.log('📍 1. Membuka http://localhost:3000');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await wait(2500);

  // 1. Theme Toggle (Matahari / Bulan)
  console.log('🎨 Menguji Toggle Tema (Dark / Light Mode)...');
  const themeBtn = page.locator('button:has(.lucide-sun), button:has(.lucide-moon)').first();
  if (await themeBtn.isVisible()) {
    await themeBtn.click();
    await wait(1800);
    await themeBtn.click();
    await wait(1800);
  }

  // 2. Language Switcher (Trilingual)
  console.log('🌐 Menguji Bahasa Trilingual (ID / EN / ZH)...');
  const enLangBtn = page.locator('button:has-text("EN")').first();
  if (await enLangBtn.isVisible()) {
    await enLangBtn.click();
    await wait(2000);
  }
  const idLangBtn = page.locator('button:has-text("ID")').first();
  if (await idLangBtn.isVisible()) {
    await idLangBtn.click();
    await wait(1800);
  }

  // 3. OPAC Kategori & Live Search
  console.log('📚 Menguji Filter Kategori & Pencarian Buku...');
  const catBtns = page.locator('button:has-text("Hewan"), button:has-text("Dongeng"), button:has-text("Sains")');
  const catCount = await catBtns.count();
  if (catCount > 0) {
    await catBtns.first().click();
    await wait(2000);
  }

  // Search input
  const searchInput = page.locator('input[placeholder*="Cari judul cerita"], input[placeholder*="Cari"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.fill('Afrika');
    await wait(2000);
    await searchInput.fill('');
    await wait(1500);
  }

  // Klik kartu buku untuk detail
  console.log('📖 Membuka Detail Buku...');
  const firstBook = page.locator('div[class*="group cursor-pointer"]').first();
  if (await firstBook.isVisible()) {
    await firstBook.click();
    await wait(2500);
    // Tutup modal detail
    const closeBtn = page.locator('button:has(.lucide-x)').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await wait(1500);
    }
  }

  // 4. Tab Sirkulasi (Peminjaman & Pengembalian Kilat)
  console.log('⚡ Menguji Meja Sirkulasi...');
  const sirkulasiTab = page.locator('button:has-text("Sirkulasi")').first();
  if (await sirkulasiTab.isVisible()) {
    await sirkulasiTab.click();
    await wait(2500);

    // Buka sub-tab Pengembalian
    const returnTab = page.locator('button:has-text("PENGEMBALIAN"), button:has-text("Pengembalian")').first();
    if (await returnTab.isVisible()) {
      await returnTab.click();
      await wait(2000);
    }

    // Kembali ke Peminjaman
    const borrowTab = page.locator('button:has-text("PEMINJAMAN"), button:has-text("Peminjaman")').first();
    if (await borrowTab.isVisible()) {
      await borrowTab.click();
      await wait(1500);
    }
  }

  // 5. Tab Koleksi & Eksemplar (+ Scan ISBN & Auto Sampul Google)
  console.log('📦 Menguji Tab Koleksi & Scan ISBN...');
  const koleksiTab = page.locator('button:has-text("Koleksi & Eksemplar")').first();
  if (await koleksiTab.isVisible()) {
    await koleksiTab.click();
    await wait(2000);

    // Klik Scan ISBN
    const scanIsbnBtn = page.locator('button:has-text("Scan ISBN"), button:has-text("Tambah Buku")').first();
    if (await scanIsbnBtn.isVisible()) {
      await scanIsbnBtn.click();
      await wait(2000);

      // Isi ISBN
      const isbnInput = page.locator('input[placeholder*="13 digit"], input[placeholder*="ISBN"]').first();
      if (await isbnInput.isVisible()) {
        await isbnInput.fill('9786238767731');
        await wait(1200);

        // Klik Auto-Fill
        const autofillBtn = page.locator('button:has-text("Auto-Fill")').first();
        if (await autofillBtn.isVisible()) {
          await autofillBtn.click();
          await wait(2500);
        }

        // Klik Auto Cari Sampul Google
        const autoCoverBtn = page.locator('button:has-text("Auto Cari Sampul Google")').first();
        if (await autoCoverBtn.isVisible()) {
          await autoCoverBtn.click();
          await wait(3000);
        }
      }

      // Tutup modal scan ISBN
      const closeIsbn = page.locator('button:has(.lucide-x)').first();
      if (await closeIsbn.isVisible()) {
        await closeIsbn.click();
        await wait(1500);
      }
    }

    // 6. Generator Cetak Label Presisi
    console.log('🏷️ Menguji Generator Cetak Label Presisi...');
    const cetakLabelBtn = page.locator('button:has-text("Cetak Label")').first();
    if (await cetakLabelBtn.isVisible()) {
      await cetakLabelBtn.click();
      await wait(2500);

      // Coba ubah posisi stiker mulai cetak
      const pos2 = page.locator('button:has-text("#2")').first();
      if (await pos2.isVisible()) {
        await pos2.click();
        await wait(1000);
      }
      const pos1 = page.locator('button:has-text("#1")').first();
      if (await pos1.isVisible()) {
        await pos1.click();
        await wait(1000);
      }

      // UJI CENTANG GANDA (Multi-select)
      const labelBoxes = page.locator('div[class*="max-h-56"] button');
      const boxCount = await labelBoxes.count();
      if (boxCount >= 3) {
        await labelBoxes.nth(0).click();
        await wait(600);
        await labelBoxes.nth(1).click();
        await wait(600);
        await labelBoxes.nth(2).click();
        await wait(1500);
      }

      // Klik tombol Pilih Belum Dicetak
      const unprintedBtn = page.locator('button:has-text("Pilih Belum Dicetak")').first();
      if (await unprintedBtn.isVisible()) {
        await unprintedBtn.click();
        await wait(1500);
      }

      // Tutup modal label
      const closeLabel = page.locator('button:has(.lucide-x)').first();
      if (await closeLabel.isVisible()) {
        await closeLabel.click();
        await wait(1500);
      }
    }

    // 7. Atur Rak Buku (Shelf Management)
    console.log('🗄️ Menguji Manajemen Rak Buku...');
    const aturRakBtn = page.locator('button:has-text("Atur Rak")').first();
    if (await aturRakBtn.isVisible()) {
      await aturRakBtn.click();
      await wait(2500);
      const closeRak = page.locator('button:has(.lucide-x)').first();
      if (await closeRak.isVisible()) {
        await closeRak.click();
        await wait(1500);
      }
    }
  }

  // 8. Tab Data Anggota & Kelas (Filter Alumni & Hapus Massal)
  console.log('👥 Menguji Data Anggota & Filter Alumni...');
  const anggotaTab = page.locator('button:has-text("Data Anggota & Kelas")').first();
  if (await anggotaTab.isVisible()) {
    await anggotaTab.click();
    await wait(2000);

    const tkaBtn = page.locator('button:has-text("TK-A")').first();
    if (await tkaBtn.isVisible()) {
      await tkaBtn.click();
      await wait(1200);
    }

    const tkbBtn = page.locator('button:has-text("TK-B")').first();
    if (await tkbBtn.isVisible()) {
      await tkbBtn.click();
      await wait(1200);
    }

    const alumniBtn = page.locator('button:has-text("Alumni")').first();
    if (await alumniBtn.isVisible()) {
      await alumniBtn.click();
      await wait(2000);
    }

    const semuaAnggota = page.locator('button:has-text("Semua")').first();
    if (await semuaAnggota.isVisible()) {
      await semuaAnggota.click();
      await wait(1500);
    }
  }

  // 9. Menu Lainnya (Pengaturan, Analisis, Kiosk Anak)
  console.log('⚙️ Menguji Menu Lainnya & Pengaturan...');
  const menuLainnya = page.locator('button:has-text("Lainnya")').first();
  if (await menuLainnya.isVisible()) {
    await menuLainnya.click();
    await wait(1200);

    const pengaturanOpt = page.locator('button:has-text("Pengaturan Sistem"), button:has-text("Pengaturan")').first();
    if (await pengaturanOpt.isVisible()) {
      await pengaturanOpt.click();
      await wait(1200);

      // Coba login admin cepat jika muncul prompt
      const quickLogin = page.locator('button:has-text("Pustakawan Utama"), button:has-text("Admin")').first();
      if (await quickLogin.isVisible()) {
        await quickLogin.click();
        await wait(600);
        const loginSubmit = page.locator('button:has-text("Buka Pengaturan"), button:has-text("Masuk")').first();
        if (await loginSubmit.isVisible()) await loginSubmit.click();
        await wait(1500);
      }

      // Tutup pengaturan
      const closeSettings = page.locator('button:has(.lucide-x)').first();
      if (await closeSettings.isVisible()) {
        await closeSettings.click();
        await wait(1500);
      }
    }
  }

  // 10. Kembali ke Katalog Visual Anak
  console.log('✨ Selesai! Kembali ke beranda OPAC...');
  const opacTab = page.locator('button:has-text("Katalog Visual Anak")').first();
  if (await opacTab.isVisible()) {
    await opacTab.click();
    await wait(2500);
  }

  // Final pause to ensure all video frames flush
  await wait(2000);

  console.log('🎬 Menutup browser dan menyimpan file video...');
  await page.close();
  await context.close();
  await browser.close();

  // Find generated video
  const videoFiles = fs.readdirSync(videoDir).filter(f => f.endsWith('.webm'));
  if (videoFiles.length > 0) {
    const rawVideoPath = path.join(videoDir, videoFiles[0]);
    const finalVideoPath = path.join(videoDir, 'VIDEO_DEMO_PERPUSTAKAAN_SBTH_TK.webm');
    if (rawVideoPath !== finalVideoPath) {
      fs.copyFileSync(rawVideoPath, finalVideoPath);
    }
    console.log('✅ Video Demo Berhasil Direkam & Disimpan di:', finalVideoPath);

    // Copy to artifact directory
    const artifactPath = 'C:\\Users\\prase\\.gemini\\antigravity-ide\\brain\\62ddfd95-a89c-4079-82d0-57d033ab429a\\VIDEO_DEMO_PERPUSTAKAAN_SBTH_TK.webm';
    fs.copyFileSync(finalVideoPath, artifactPath);
    console.log('✅ Video disalin ke Artifact:', artifactPath);

    // Verify frame with ffmpeg
    try {
      const ffmpegPath = 'C:\\Users\\prase\\AppData\\Local\\ms-playwright\\ffmpeg-1013\\ffmpeg-win64.exe';
      const testThumb = path.join(__dirname, '../video_thumbnail_check.png');
      execSync(`"${ffmpegPath}" -i "${finalVideoPath}" -ss 00:00:05 -vframes 1 "${testThumb}" -y`);
      console.log('✅ Thumbnail verifikasi diekstrak di:', testThumb);
    } catch (e) {
      console.warn('Could not extract thumbnail:', e.message);
    }
  }

  console.log('🎉 Perekaman Selesai 100%!');
}

runDemo().catch(err => {
  console.error('❌ Gagal merekam demo:', err);
});
