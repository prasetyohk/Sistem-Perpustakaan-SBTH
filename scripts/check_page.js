const { chromium } = require('playwright-core');
const fs = require('fs');

async function check() {
  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    executablePath,
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGE ERROR:', err.message));

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  const title = await page.title();
  console.log('Page Title:', title);

  const html = await page.content();
  console.log('HTML length:', html.length);
  console.log('Body snippet:', html.substring(0, 500));

  await page.screenshot({ path: 'test_screenshot.png' });
  console.log('Screenshot saved to test_screenshot.png');

  await browser.close();
}

check().catch(console.error);
