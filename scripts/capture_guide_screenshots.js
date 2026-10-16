const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

async function captureScreenshots() {
  console.log('📸 Starting automated screenshot capture for User Manual...');

  const imgDir = path.resolve(__dirname, '../guide_images');
  if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    executablePath,
    headless: false,
    args: ['--disable-gpu', '--no-sandbox', '--window-size=1366,768'],
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const wait = (ms) => page.waitForTimeout(ms);

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await wait(3000);

  // 1. Workflow 1: OPAC
  console.log('Capturing: workflow_1_opac.png');
  await page.screenshot({ path: path.join(imgDir, 'workflow_1_opac.png') });
  await wait(1000);

  // 2. Workflow 2: Detail Buku Modal
  console.log('Capturing: workflow_2_book_detail.png');
  const bookCard = page.locator('div[class*="group cursor-pointer"]').first();
  if (await bookCard.isVisible()) {
    await bookCard.click();
    await wait(1500);
    await page.screenshot({ path: path.join(imgDir, 'workflow_2_book_detail.png') });
    // close
    const closeBtn = page.locator('button:has(.lucide-x)').first();
    if (await closeBtn.isVisible()) await closeBtn.click();
    await wait(1000);
  }

  // 3. Workflow 3: Portal Siswa
  console.log('Capturing: workflow_3_portal_siswa.png');
  const portalBtn = page.locator('button:has-text("Portal Siswa"), button:has-text("Kiosk Anak")').first();
  if (await portalBtn.isVisible()) {
    await portalBtn.click();
    await wait(1500);
    await page.screenshot({ path: path.join(imgDir, 'workflow_3_portal_siswa.png') });
    const closePortal = page.locator('button:has(.lucide-x)').first();
    if (await closePortal.isVisible()) await closePortal.click();
    await wait(1000);
  }

  // 4. Workflow 4: Meja Sirkulasi
  console.log('Capturing: workflow_4_sirkulasi.png');
  const sirkulasiTab = page.locator('button:has-text("Sirkulasi")').first();
  if (await sirkulasiTab.isVisible()) {
    await sirkulasiTab.click();
    await wait(2000);
    await page.screenshot({ path: path.join(imgDir, 'workflow_4_sirkulasi.png') });
    await wait(1000);
  }

  // 5. Workflow 5: Koleksi & Scan ISBN
  console.log('Capturing: workflow_5_scan_isbn.png');
  const koleksiTab = page.locator('button:has-text("Koleksi & Eksemplar")').first();
  if (await koleksiTab.isVisible()) {
    await koleksiTab.click();
    await wait(1500);

    const scanIsbnBtn = page.locator('button:has-text("Scan ISBN"), button:has-text("Tambah Buku")').first();
    if (await scanIsbnBtn.isVisible()) {
      await scanIsbnBtn.click();
      await wait(1500);

      const isbnInput = page.locator('input[placeholder*="13 digit"], input[placeholder*="ISBN"]').first();
      if (await isbnInput.isVisible()) {
        await isbnInput.fill('9786238767731');
        await wait(800);
        const autoFillBtn = page.locator('button:has-text("Auto-Fill")').first();
        if (await autoFillBtn.isVisible()) await autoFillBtn.click();
        await wait(2000);

        const autoCoverBtn = page.locator('button:has-text("Auto Cari Sampul Google")').first();
        if (await autoCoverBtn.isVisible()) await autoCoverBtn.click();
        await wait(2000);
      }

      await page.screenshot({ path: path.join(imgDir, 'workflow_5_scan_isbn.png') });
      const closeIsbn = page.locator('button:has(.lucide-x)').first();
      if (await closeIsbn.isVisible()) await closeIsbn.click();
      await wait(1000);
    }

    // 6. Workflow 6: Cetak Label Presisi
    console.log('Capturing: workflow_6_label_printer.png');
    const cetakLabelBtn = page.locator('button:has-text("Cetak Label")').first();
    if (await cetakLabelBtn.isVisible()) {
      await cetakLabelBtn.click();
      await wait(2000);

      // Select multiple checkboxes
      const labelBoxes = page.locator('div[class*="max-h-56"] button');
      const boxCount = await labelBoxes.count();
      if (boxCount >= 3) {
        await labelBoxes.nth(0).click();
        await wait(400);
        await labelBoxes.nth(1).click();
        await wait(400);
        await labelBoxes.nth(2).click();
        await wait(800);
      }

      await page.screenshot({ path: path.join(imgDir, 'workflow_6_label_printer.png') });
      const closeLabel = page.locator('button:has(.lucide-x)').first();
      if (await closeLabel.isVisible()) await closeLabel.click();
      await wait(1000);
    }

    // 7. Workflow 7: Atur Rak
    console.log('Capturing: workflow_7_shelf_management.png');
    const aturRakBtn = page.locator('button:has-text("Atur Rak")').first();
    if (await aturRakBtn.isVisible()) {
      await aturRakBtn.click();
      await wait(1500);
      await page.screenshot({ path: path.join(imgDir, 'workflow_7_shelf_management.png') });
      const closeRak = page.locator('button:has(.lucide-x)').first();
      if (await closeRak.isVisible()) await closeRak.click();
      await wait(1000);
    }
  }

  // 8. Workflow 8: Data Anggota & Alumni
  console.log('Capturing: workflow_8_data_anggota.png');
  const anggotaTab = page.locator('button:has-text("Data Anggota & Kelas")').first();
  if (await anggotaTab.isVisible()) {
    await anggotaTab.click();
    await wait(1500);

    const alumniBtn = page.locator('button:has-text("Alumni")').first();
    if (await alumniBtn.isVisible()) {
      await alumniBtn.click();
      await wait(1500);
    }
    await page.screenshot({ path: path.join(imgDir, 'workflow_8_data_anggota.png') });
    await wait(1000);
  }

  // 9. Workflow 9: Pengaturan Sistem
  console.log('Capturing: workflow_9_pengaturan.png');
  const menuLainnya = page.locator('button:has-text("Lainnya")').first();
  if (await menuLainnya.isVisible()) {
    await menuLainnya.click();
    await wait(800);
    const pengaturanOpt = page.locator('button:has-text("Pengaturan Sistem"), button:has-text("Pengaturan")').first();
    if (await pengaturanOpt.isVisible()) {
      await pengaturanOpt.click();
      await wait(1000);

      // quick admin login if asked
      const quickAdmin = page.locator('button:has-text("Pustakawan Utama"), button:has-text("Admin")').first();
      if (await quickAdmin.isVisible()) {
        await quickAdmin.click();
        await wait(500);
        const submitAdmin = page.locator('button:has-text("Buka Pengaturan"), button:has-text("Masuk")').first();
        if (await submitAdmin.isVisible()) await submitAdmin.click();
        await wait(1500);
      }
      await page.screenshot({ path: path.join(imgDir, 'workflow_9_pengaturan.png') });
      const closeSettings = page.locator('button:has(.lucide-x)').first();
      if (await closeSettings.isVisible()) await closeSettings.click();
      await wait(1000);
    }
  }

  await browser.close();
  console.log('🎉 All guide screenshots captured successfully in guide_images folder!');
}

captureScreenshots().catch(console.error);
