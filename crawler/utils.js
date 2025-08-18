const fs = require('fs').promises;
const path = require('path');

// 크롤링 결과를 JSON 파일로 저장
async function saveJobsToFile(jobs, company, timestamp = new Date()) {
  const fileName = `${company}_jobs_${timestamp.getTime()}.json`;
  const filePath = path.join(__dirname, '../data', fileName);
  
  try {
    // data 디렉토리가 없으면 생성
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    const data = {
      company,
      timestamp: timestamp.toISOString(),
      count: jobs.length,
      jobs
    };
    
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ ${company} 채용정보 저장 완료: ${filePath}`);
    
    return filePath;
  } catch (error) {
    console.error(`❌ ${company} 채용정보 저장 실패:`, error);
    throw error;
  }
}

// 중복 제거 함수
function removeDuplicateJobs(jobs) {
  const seen = new Set();
  return jobs.filter(job => {
    const key = `${job.company}_${job.title}_${job.originalUrl}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// 채용공고 데이터 정제
function cleanJobData(job) {
  return {
    title: job.title.replace(/\s+/g, ' ').trim(),
    description: job.description ? job.description.replace(/\s+/g, ' ').trim() : '',
    location: job.location ? job.location.replace(/\s+/g, ' ').trim() : '',
    department: job.department ? job.department.replace(/\s+/g, ' ').trim() : '',
    jobType: job.jobType ? job.jobType.replace(/\s+/g, ' ').trim() : '',
    experience: job.experience ? job.experience.replace(/\s+/g, ' ').trim() : '',
    salary: job.salary ? job.salary.replace(/\s+/g, ' ').trim() : '',
    originalUrl: job.originalUrl,
    company: job.company,
    postedAt: job.postedAt || new Date().toISOString()
  };
}

// 키워드로 개발 관련 채용공고 필터링
function filterDevelopmentJobs(jobs) {
  const devKeywords = [
    '개발', '프로그래머', '엔지니어', 'developer', 'engineer', 'programmer',
    'frontend', 'backend', 'fullstack', '프론트엔드', '백엔드', '풀스택',
    'javascript', 'python', 'java', 'react', 'vue', 'node', 'spring',
    '웹개발', '앱개발', '서버개발', 'api', 'database', '데이터베이스',
    'devops', 'sre', '인프라', 'cloud', '클라우드', 'aws', 'gcp', 'azure'
  ];

  return jobs.filter(job => {
    const searchText = `${job.title} ${job.description} ${job.department}`.toLowerCase();
    return devKeywords.some(keyword => searchText.includes(keyword.toLowerCase()));
  });
}

// 회사별 브랜드 컬러 가져오기
function getCompanyColor(company) {
  const colors = {
    naver: '#03C75A',
    kakao: '#FEE500',
    line: '#00B900',
    coupang: '#FA622F',
    baemin: '#2AC1BC'
  };
  return colors[company] || '#6B7280';
}

module.exports = {
  saveJobsToFile,
  removeDuplicateJobs,
  cleanJobData,
  filterDevelopmentJobs,
  getCompanyColor
};