const puppeteer = require('puppeteer');

async function crawlNexon() {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('넥슨 채용 사이트(실제) 접근 중...');
        // 넥슨 채용 공고 리스트 페이지 (개발 직군 필터링된 URL 권장하지만, 일단 전체에서 긁음)
        await page.goto('https://careers.nexon.com/careers/list', {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        // Wait for list to load - Hard wait for SPA
        console.log('넥슨: 페이지 로딩 대기 (5초)...');
        await new Promise(r => setTimeout(r, 5000));

        // Debug: Check HTML content length
        const contentLen = await page.evaluate(() => document.body.innerHTML.length);
        console.log(`넥슨: 로드된 HTML 길이: ${contentLen}`);

        // Parse Jobs
        const jobs = await page.evaluate(() => {
            const jobList = [];
            // Strategy: Nexon structure is usually a list of <a> tags inside a container.
            // We search for ANY link that looks like a detail page.
            const links = Array.from(document.querySelectorAll('a'));
            
            links.forEach(link => {
                const href = link.href;
                const title = link.innerText.trim();
                
                // Filter: Must have title, and URL must look like a view page
                if (title && title.length > 5 && href && href.includes('/careers/view')) {
                    
                    const devKeywords = ['개발', 'Engineer', 'Client', 'Server', 'Data', 'AI', 'Security', 'Frontend', 'Backend', '프로그래머', '엔지니어'];
                    const isDev = devKeywords.some(k => title.toLowerCase().includes(k.toLowerCase()));

                    if (isDev) {
                         // Avoid duplicates in this loop
                         if (!jobList.some(j => j.originalUrl === href)) {
                             jobList.push({
                                title: title.split('\n')[0], // Clean title
                                originalUrl: href,
                                company: 'nexon',
                                department: 'Nexon', 
                                jobType: '정규직',
                                postedAt: new Date().toISOString(),
                                location: '판교',
                                experience: '무관'
                            });
                         }
                    }
                }
            });
            return jobList;
        });

        // Filter duplicates based on URL
        const uniqueJobs = Array.from(new Map(jobs.map(item => [item.originalUrl, item])).values());

        console.log(`넥슨(실제)에서 ${uniqueJobs.length}개 개발 직군 공고 수집 완료`);
        return uniqueJobs;

    } catch (error) {
        console.error('넥슨 크롤링 중 오류:', error.message);
        return [];
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = { crawlNexon };
