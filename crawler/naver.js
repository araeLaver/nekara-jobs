const puppeteer = require('puppeteer');

async function crawlNaver() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
    
    // Enable Request Interception to catch JSON data directly
    await page.setRequestInterception(true);
    
    // Storage for captured jobs
    const capturedJobs = [];

    page.on('request', request => {
        request.continue();
    });

    page.on('response', async response => {
        const url = response.url();
        // Naver often sends data via POST to /rcrt/list.do or similar
        if (url.includes('/rcrt/list.do') && response.request().method() === 'POST') {
            try {
                // Naver returns HTML usually, but let's check content type
                const contentType = response.headers()['content-type'];
                // If it's HTML, we might need to parse it. 
                // However, Naver's new site might use pure JSON API.
                // Let's fallback to DOM parsing if interception is tricky for this specific site structure.
            } catch (e) {}
        }
    });

    console.log('네이버: 페이지 로딩 및 API 탐색...');
    
    // Naver's page load
    await page.goto('https://recruit.navercorp.com/rcrt/list.do', { waitUntil: 'networkidle0' });

    // Since interception of "list.do" returning HTML is complex (it's server-side rendered mostly),
    // We stick to DOM scraping but with a FORCEFUL approach: 
    // Execute a script to click "View More" until it disappears.
    
    await page.evaluate(async () => {
        await new Promise((resolve) => {
             let attempts = 0;
             const maxAttempts = 20; // Try more
             const timer = setInterval(() => {
                 attempts++;
                 window.scrollTo(0, document.body.scrollHeight);
                 
                 // Naver's "View More" button selector (needs precise verification)
                 // Based on inspection: <button type="button" class="btn_more">더보기</button>
                 const btn = document.querySelector('.btn_more');
                 if (btn && btn.offsetParent !== null) { // Check visibility
                     btn.click();
                 } else {
                     // If no button visible, we might be done OR it's loading.
                 }

                 if (attempts >= maxAttempts) {
                     clearInterval(timer);
                     resolve();
                 }
             }, 1000);
        });
    });

    // Wait a bit
    await new Promise(r => setTimeout(r, 2000));

    // Parse finally
    const jobs = await page.evaluate(() => {
        const list = [];
        const items = document.querySelectorAll('.card_item'); // Check this selector
        
        items.forEach(item => {
             try {
                 const titleEl = item.querySelector('.card_title');
                 if (!titleEl) return;
                 const title = titleEl.innerText.trim();
                 
                 // Onclick extraction for URL
                 const linkEl = item.querySelector('.card_link');
                 let url = '';
                 if (linkEl) {
                     const onclick = linkEl.getAttribute('onclick');
                     if (onclick && onclick.includes('show')) {
                         const id = onclick.match(/'(\d+)'/);
                         if (id) url = `https://recruit.navercorp.com/rcrt/view.do?annoId=${id[1]}`;
                     }
                 }
                 
                 const devKeywords = ['SW', 'Developer', '개발', 'Tech', 'Engineer', 'Data', 'AI', 'Cloud', 'Security'];
                 // Naver usually groups by 'Tech' category but let's filter by title
                 
                 if (devKeywords.some(k => title.includes(k))) {
                     list.push({
                         title,
                         originalUrl: url || 'https://recruit.navercorp.com/rcrt/list.do',
                         company: 'naver',
                         department: 'Tech',
                         postedAt: new Date().toISOString()
                     });
                 }
             } catch(e) {}
        });
        return list;
    });

    console.log(`네이버 최종 수집: ${jobs.length}개`);
    return jobs;

  } catch (error) {
    console.error('네이버 크롤링 중 심각한 오류 발생:', error.message);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { crawlNaver };