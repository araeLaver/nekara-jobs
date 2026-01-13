const puppeteer = require('puppeteer');
const { crawlNaver } = require('../crawler/naver');
const { crawlKakao } = require('../crawler/kakao');
const { crawlLine } = require('../crawler/line');
const { crawlCoupang } = require('../crawler/coupang');
const { crawlBaemin } = require('../crawler/baemin');
const { crawlToss } = require('../crawler/toss');
const { crawlNexon } = require('../crawler/nexon');

const CRAWLERS = {
    'naver': crawlNaver,
    'kakao': crawlKakao,
    'line': crawlLine,
    'coupang': crawlCoupang,
    'baemin': crawlBaemin,
    'toss': crawlToss,
    'nexon': crawlNexon
};

async function testSingleCrawler() {
    const target = process.argv[2];
    
    if (!target || !CRAWLERS[target]) {
        console.error(`Usage: node test-single-crawler.js <company>`);
        console.error(`Available companies: ${Object.keys(CRAWLERS).join(', ')}`);
        process.exit(1);
    }

    console.log(`[TEST] Running crawler for: ${target}`);
    const crawlerFn = CRAWLERS[target];
    
    const startTime = Date.now();
    try {
        const jobs = await crawlerFn();
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log(`
[RESULT] ${target}: ${jobs.length} jobs found in ${duration}s`);
        if (jobs.length > 0) {
            console.log('Sample Job:', JSON.stringify(jobs[0], null, 2));
        } else {
            console.log('WARNING: No jobs found. Check selectors or blocking.');
        }

    } catch (error) {
        console.error(`[ERROR] Crawler failed: ${error.message}`);
        console.error(error);
    }
}

testSingleCrawler();
