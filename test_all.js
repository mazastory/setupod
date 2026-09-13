const puppeteer = require('puppeteer');
const fs = require('fs');
const files = [
  'link.html',
  'profile_studio.html',
  'product_studio.html',
  'maker.html',
  'roi_calculator.html',
  'proposal_maker.html',
  'proof.html',
];

(async () => {
  const browser = await puppeteer.launch();
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const page = await browser.newPage();
    page.on('pageerror', error => console.error(`PAGE ERROR in ${file}:`, error.message));
    try {
      await page.goto(`file:///Volumes/M/GitHub/setupod/${file}`, { waitUntil: 'networkidle2', timeout: 5000 });
      console.log(`Verified ${file}`);
    } catch(e) {
      console.error(`Error loading ${file}:`, e.message);
    }
    await page.close();
  }
  await browser.close();
})();
