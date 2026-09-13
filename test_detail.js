const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
  await page.goto('file:///Volumes/M/GitHub/setupod/detail_studio.html', { waitUntil: 'networkidle2', timeout: 5000 }).catch(e => console.error(e.message));
  console.log('Verified detail_studio.html');
  await browser.close();
})();
