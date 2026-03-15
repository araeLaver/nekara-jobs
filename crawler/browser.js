const IS_VERCEL = !!process.env.VERCEL;

async function getBrowser() {
  if (IS_VERCEL) {
    const chromium = require('@sparticuz/chromium');
    const puppeteer = require('puppeteer-core');

    const executablePath = await chromium.executablePath();

    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
  }

  // Local: use full puppeteer (devDependency)
  const puppeteer = require('puppeteer');
  return puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-blink-features=AutomationControlled',
    ],
  });
}

module.exports = { getBrowser, IS_VERCEL };
