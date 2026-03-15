const { getBrowser } = require('./browser');

const DEV_KEYWORDS = [
  '개발', 'Engineer', 'Client', 'Server', 'Data', 'AI', 'Security',
  'Frontend', 'Backend', '프로그래머', '엔지니어', 'Programming',
  'DevOps', 'Infrastructure', 'Platform', 'Software', 'Mobile',
];

async function crawlNexon(sharedBrowser) {
    const browser = sharedBrowser || await getBrowser();

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('넥슨 채용 사이트 접근 중...');

        // API 응답 캡처
        const allJobPosts = [];

        page.on('response', async (res) => {
            const url = res.url();
            if (url.includes('career-gateway.nexon.com') &&
                url.includes('job-posts') &&
                url.indexOf('count') === -1) {
                const ct = res.headers()['content-type'] || '';
                if (ct.includes('json')) {
                    try {
                        const body = await res.json();
                        if (body.list && Array.isArray(body.list)) {
                            allJobPosts.push(...body.list);
                        }
                    } catch(e) {}
                }
            }
        });

        await page.goto('https://careers.nexon.com/recruit', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // SPA 로딩 대기
        await new Promise(r => setTimeout(r, 5000));

        // 스크롤 + 더 보기 (페이지네이션을 트리거하기 위해)
        let prevCount = 0;
        for (let attempt = 0; attempt < 25; attempt++) {
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await new Promise(r => setTimeout(r, 1500));

            // 더 이상 새 데이터가 없으면 중단
            if (allJobPosts.length === prevCount && attempt > 2) break;
            prevCount = allJobPosts.length;
        }

        // DOM에서도 직접 추출 (API 캡처 실패 시 폴백)
        if (allJobPosts.length === 0) {
            console.log('넥슨: API 캡처 실패, DOM에서 추출 시도...');
            const domJobs = await page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('a'));
                return links
                    .filter(l => l.href && l.href.includes('/recruit/') && l.href.match(/\/recruit\/\d+$/))
                    .map(l => ({
                        title: l.innerText.trim().split('\n').find(line => line.startsWith('[')) || l.innerText.trim().split('\n')[0],
                        jobPostNo: l.href.match(/\/recruit\/(\d+)$/)?.[1],
                        href: l.href,
                    }))
                    .filter(j => j.title && j.title.length > 5);
            });

            // DOM 추출 결과를 API 형식으로 변환
            for (const dj of domJobs) {
                allJobPosts.push({
                    title: dj.title,
                    jobPostNo: dj.jobPostNo,
                    corpName: '넥슨',
                });
            }
        }

        // 개발 직군 필터링
        const devJobs = [];
        const seen = new Set();

        for (const item of allJobPosts) {
            const title = item.title || '';
            const id = item.jobPostNo || '';

            if (seen.has(id)) continue;
            seen.add(id);

            const isDev = DEV_KEYWORDS.some(k =>
                title.toLowerCase().includes(k.toLowerCase())
            );

            if (isDev && title) {
                devJobs.push({
                    title: title.replace(/<[^>]*>/g, '').trim(),
                    originalUrl: id
                        ? `https://careers.nexon.com/recruit/${id}`
                        : 'https://careers.nexon.com/recruit',
                    company: 'nexon',
                    department: item.corpName || 'NEXON',
                    jobType: item.employmentType || '정규직',
                    postedAt: item.startDate || new Date().toISOString(),
                    location: item.workingArea || '판교',
                    experience: item.careerType || '무관',
                });
            }
        }

        console.log(`넥슨에서 ${devJobs.length}개 개발 직군 공고 수집 완료 (전체 ${allJobPosts.length}개 중)`);
        return devJobs;

    } catch (error) {
        console.error('넥슨 크롤링 중 오류:', error.message);
        return [];
    } finally {
        if (!sharedBrowser) await browser.close();
    }
}

module.exports = { crawlNexon };
