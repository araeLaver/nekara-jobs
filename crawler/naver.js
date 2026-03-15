const axios = require('axios');

const DEV_KEYWORDS = [
  'SW', 'Developer', '개발', 'Tech', 'Engineer', 'Data', 'AI',
  'Cloud', 'Security', 'Frontend', 'Backend', 'Server', 'Platform',
  'Infrastructure', 'DevOps', 'Mobile', 'Android', 'iOS', 'Web',
  '소프트웨어', '엔지니어', 'Software', 'Machine Learning',
];

async function crawlNaver() {
  console.log('네이버: API 기반 채용공고 수집 시작...');

  try {
    // 1) list.do 페이지에 접근하여 세션 쿠키 + XSRF 토큰 획득
    const listRes = await axios.get('https://recruit.navercorp.com/rcrt/list.do', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    });

    const setCookies = listRes.headers['set-cookie'] || [];
    const cookieStr = setCookies.map(c => c.split(';')[0]).join('; ');

    const xsrfCookie = setCookies.find(c => c.startsWith('XSRF-TOKEN='));
    const xsrfToken = xsrfCookie ? xsrfCookie.split('=')[1].split(';')[0] : '';

    if (!xsrfToken) {
      console.warn('네이버: XSRF 토큰을 찾을 수 없습니다');
    }

    // 2) loadJobList.do API로 채용공고 수집
    const allJobs = [];
    let page = 1;
    const pageSize = 20;
    let hasMore = true;

    while (hasMore) {
      const response = await axios.post(
        'https://recruit.navercorp.com/rcrt/loadJobList.do',
        new URLSearchParams({
          sysCompanyCdArr: '',
          empTypeCdArr: '',
          jobCdArr: '',
          entTypeCdArr: '',
          workAreaCdArr: '',
          sw: '',
          subJobCdArr: '',
          sttDateCode: '',
          page: String(page),
          pageSize: String(pageSize),
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Referer': 'https://recruit.navercorp.com/rcrt/list.do',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': xsrfToken,
            'Cookie': cookieStr,
          },
          timeout: 15000,
        }
      );

      const data = response.data;
      if (!data || data.result !== 'Y') {
        console.warn('네이버: API 응답 이상 —', typeof data === 'string' ? data.substring(0, 100) : data?.result);
        break;
      }

      const list = data.list || [];
      if (list.length === 0) {
        hasMore = false;
        break;
      }

      for (const item of list) {
        const title = item.annoSubject || '';
        const annoId = item.annoId || '';

        const isDev = DEV_KEYWORDS.some(k =>
          title.toLowerCase().includes(k.toLowerCase())
        );

        if (isDev && title) {
          allJobs.push({
            title,
            originalUrl: item.jobDetailLink || (annoId
              ? `https://recruit.navercorp.com/rcrt/view.do?annoId=${annoId}`
              : 'https://recruit.navercorp.com/rcrt/list.do'),
            company: 'naver',
            department: item.sysCompanyCdNm || 'NAVER',
            jobType: item.empTypeCdNm || '정규직',
            location: item.workAreaCd === '0010' ? '판교' : (item.workAreaCd || '판교'),
            experience: item.entTypeCdNm || '',
            postedAt: item.staYmd
              ? `${item.staYmd.substring(0, 4)}-${item.staYmd.substring(4, 6)}-${item.staYmd.substring(6, 8)}`
              : new Date().toISOString(),
          });
        }
      }

      if (list.length < pageSize) {
        hasMore = false;
      } else {
        page++;
        if (page > 10) hasMore = false;
      }
    }

    console.log(`네이버 API 수집 완료: ${allJobs.length}개 개발 직군 공고`);
    return allJobs;

  } catch (error) {
    console.error('네이버 API 크롤링 오류:', error.message);
    return [];
  }
}

module.exports = { crawlNaver };
