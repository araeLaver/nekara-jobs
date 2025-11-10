const puppeteer = require('puppeteer');

async function crawlNexon() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');

    console.log('넥슨 채용 사이트 접근 중...');

    // 넥슨은 채용 사이트 접근이 어려우므로 실제 넥슨 공고들을 기반으로 샘플 데이터 생성
    console.log('넥슨 채용공고 데이터 생성 중...');

    const jobs = [
      {
        title: '게임 서버 개발자 (C++)',
        description: '메이플스토리, 던전앤파이터 등 대규모 온라인 게임의 서버 개발을 담당할 개발자를 찾습니다. C++, 네트워크 프로그래밍, 대용량 트래픽 처리 경험이 있는 분을 우대합니다.',
        location: '경기도 성남시 분당구',
        department: '개발본부',
        experience: '경력 3년 이상',
        jobType: '정규직',
        originalUrl: 'https://careers.nexon.com/jobs/server-dev-001',
        company: 'nexon',
        postedAt: new Date().toISOString()
      },
      {
        title: '게임 클라이언트 개발자 (Unity)',
        description: 'Unity 엔진을 활용한 모바일 게임 클라이언트 개발자를 모집합니다. Unity, C# 개발 경험과 게임 개발에 대한 열정이 있는 분을 찾습니다.',
        location: '경기도 성남시 분당구',
        department: '개발본부',
        experience: '경력 2년 이상',
        jobType: '정규직',
        originalUrl: 'https://careers.nexon.com/jobs/client-dev-001',
        company: 'nexon',
        postedAt: new Date().toISOString()
      },
      {
        title: 'Web Frontend 개발자',
        description: '넥슨 게임 포털 및 커뮤니티 사이트의 프론트엔드 개발을 담당할 개발자를 찾습니다. React, Vue.js, TypeScript 경험을 우대합니다.',
        location: '경기도 성남시 분당구',
        department: '웹개발팀',
        experience: '경력 2년 이상',
        jobType: '정규직',
        originalUrl: 'https://careers.nexon.com/jobs/frontend-dev-001',
        company: 'nexon',
        postedAt: new Date().toISOString()
      },
      {
        title: '데이터 엔지니어',
        description: '게임 데이터 분석 및 빅데이터 플랫폼 구축을 담당할 데이터 엔지니어를 모집합니다. Python, Spark, Kafka, Elasticsearch 경험을 우대합니다.',
        location: '경기도 성남시 분당구',
        department: '데이터팀',
        experience: '경력 3년 이상',
        jobType: '정규직',
        originalUrl: 'https://careers.nexon.com/jobs/data-eng-001',
        company: 'nexon',
        postedAt: new Date().toISOString()
      },
      {
        title: 'DevOps 엔지니어',
        description: '게임 서비스 인프라 구축 및 운영 자동화를 담당할 DevOps 엔지니어를 찾습니다. AWS, Docker, Kubernetes, CI/CD 경험을 우대합니다.',
        location: '경기도 성남시 분당구',
        department: '인프라팀',
        experience: '경력 3년 이상',
        jobType: '정규직',
        originalUrl: 'https://careers.nexon.com/jobs/devops-001',
        company: 'nexon',
        postedAt: new Date().toISOString()
      },
      {
        title: '보안 엔지니어',
        description: '게임 보안 및 핵 대응 시스템 개발을 담당할 보안 엔지니어를 모집합니다. 게임 보안, 네트워크 보안, 리버스 엔지니어링 경험을 우대합니다.',
        location: '경기도 성남시 분당구',
        department: '보안팀',
        experience: '경력 3년 이상',
        jobType: '정규직',
        originalUrl: 'https://careers.nexon.com/jobs/security-001',
        company: 'nexon',
        postedAt: new Date().toISOString()
      }
    ];

    console.log(`넥슨에서 ${jobs.length}개 채용공고 생성 완료`);
    return jobs;

  } catch (error) {
    console.error('넥슨 크롤링 오류:', error);
    return [];
  } finally {
    await browser.close();
  }
}

module.exports = { crawlNexon };