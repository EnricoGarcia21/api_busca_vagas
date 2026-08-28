const puppeteer = require('puppeteer');

async function launchBrowser() {
  const launchOptions = {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  };
  return await puppeteer.launch(launchOptions);
}

module.exports = { launchBrowser };