/**
 * 크롤러 데이터 검증 유틸리티
 *
 * 크롤링된 데이터의 품질을 보장하기 위한 검증 함수들
 */

const MIN_VALID_RATIO = Number(process.env.CRAWL_MIN_VALID_RATIO || '0.7');
const MIN_DESCRIPTION_LENGTH = Number(process.env.CRAWL_MIN_DESCRIPTION_LENGTH || '50');

let COMPANY_THRESHOLDS = {};

if (process.env.CRAWL_COMPANY_THRESHOLDS) {
  try {
    COMPANY_THRESHOLDS = JSON.parse(process.env.CRAWL_COMPANY_THRESHOLDS);
  } catch (error) {
    console.warn('[??] CRAWL_COMPANY_THRESHOLDS JSON ?? ??:', error.message);
  }
}

function getCompanyThresholds(companyName, overrides = {}) {
  if (!companyName) {
    return {
      minValidRatio: MIN_VALID_RATIO,
      minDescriptionLength: MIN_DESCRIPTION_LENGTH
    };
  }

  const normalized = companyName.toLowerCase();
  const entry = COMPANY_THRESHOLDS[companyName] || COMPANY_THRESHOLDS[normalized];

  return {
    minValidRatio: Number(overrides.minValidRatio || entry?.minValidRatio || MIN_VALID_RATIO),
    minDescriptionLength: Number(overrides.minDescriptionLength || entry?.minDescriptionLength || MIN_DESCRIPTION_LENGTH)
  };
}



/**
 * 채용공고 데이터 검증
 * @param {Object} jobData - 검증할 채용공고 데이터
 * @returns {Object} { isValid: boolean, errors: string[], sanitizedData: Object }
 */
function validateJobData(jobData, options = {}) {
  const errors = [];
  const sanitizedData = { ...jobData };

  // 1. 필수 필드 검증
  const requiredFields = ['title', 'originalUrl', 'companyId', 'postedAt'];
  for (const field of requiredFields) {
    if (!jobData[field] || jobData[field].toString().trim() === '') {
      errors.push(`필수 필드 누락: ${field}`);
    }
  }

  // 2. 제목 검증
  if (jobData.title) {
    sanitizedData.title = jobData.title.trim();

    if (sanitizedData.title.length === 0) {
      errors.push('제목이 비어있습니다');
    } else if (sanitizedData.title.length > 200) {
      errors.push(`제목이 너무 깁니다 (${sanitizedData.title.length}자, 최대 200자)`);
      sanitizedData.title = sanitizedData.title.substring(0, 200);
    }

    // 의미없는 제목 패턴 체크
    const invalidTitlePatterns = [
      /^[\s\-_\.]+$/,  // 특수문자만
      /^제목없음$/i,
      /^untitled$/i,
      /^no title$/i
    ];

    if (invalidTitlePatterns.some(pattern => pattern.test(sanitizedData.title))) {
      errors.push('유효하지 않은 제목 형식');
    }
  }

  // 3. URL 검증
  if (jobData.originalUrl) {
    sanitizedData.originalUrl = jobData.originalUrl.trim();

    try {
      new URL(sanitizedData.originalUrl);
    } catch (e) {
      errors.push(`유효하지 않은 URL: ${sanitizedData.originalUrl}`);
    }

    // HTTPS 권장
    if (sanitizedData.originalUrl.startsWith('http://')) {
      console.warn(`[경고] HTTP URL 사용 중: ${sanitizedData.originalUrl}`);
    }
  }

  // 4. 날짜 검증
  if (jobData.postedAt) {
    const postedDate = new Date(jobData.postedAt);

    if (isNaN(postedDate.getTime())) {
      errors.push(`유효하지 않은 게시일: ${jobData.postedAt}`);
    } else {
      // 미래 날짜 체크
      if (postedDate > new Date()) {
        console.warn(`[경고] 미래 날짜: ${jobData.postedAt}`);
      }

      // 너무 오래된 날짜 체크 (2년 이상)
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      if (postedDate < twoYearsAgo) {
        console.warn(`[경고] 매우 오래된 공고: ${jobData.postedAt}`);
      }
    }
  }

  if (jobData.deadline) {
    const deadlineDate = new Date(jobData.deadline);

    if (isNaN(deadlineDate.getTime())) {
      errors.push(`유효하지 않은 마감일: ${jobData.deadline}`);
    } else if (deadlineDate < new Date()) {
      // 마감일이 지난 경우 자동으로 isActive를 false로 설정
      sanitizedData.isActive = false;
      console.warn(`[경고] 마감일 지남, isActive=false 설정: ${jobData.deadline}`);
    }
  }

  // 5. 텍스트 필드 길이 검증
  const textFields = {
    description: 10000,
    location: 100,
    experience: 100,
    salary: 100,
    jobType: 50,
    department: 100
  };

  for (const [field, maxLength] of Object.entries(textFields)) {
    if (jobData[field] && typeof jobData[field] === 'string') {
      sanitizedData[field] = jobData[field].trim();

      if (sanitizedData[field].length > maxLength) {
        console.warn(`[경고] ${field} 길이 초과 (${sanitizedData[field].length}자, 최대 ${maxLength}자), 자동 절삭`);
        sanitizedData[field] = sanitizedData[field].substring(0, maxLength);
      }
    }
  }

  // 6. 데이터 정규화
  // location 정규화
  if (sanitizedData.location) {
    sanitizedData.location = normalizeLocation(sanitizedData.location);
  }

  // department 정규화
  if (sanitizedData.department) {
    sanitizedData.department = normalizeDepartment(sanitizedData.department);
  }

  // experience 정규화
  if (sanitizedData.experience) {
    sanitizedData.experience = normalizeExperience(sanitizedData.experience);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

/**
 * 지역명 정규화
 */
function normalizeLocation(location) {
  const locationMap = {
    '서울': '서울',
    '서울시': '서울',
    '서울특별시': '서울',
    '경기': '경기',
    '경기도': '경기',
    '판교': '경기',
    '성남': '경기',
    '분당': '경기',
    '부산': '부산',
    '부산시': '부산',
    '부산광역시': '부산',
    '대구': '대구',
    '인천': '인천',
    '광주': '광주',
    '대전': '대전',
    '울산': '울산',
    '세종': '세종',
    '제주': '제주'
  };

  let normalized = location.trim();

  // 매핑 테이블에서 찾기
  for (const [key, value] of Object.entries(locationMap)) {
    if (normalized.includes(key)) {
      return value;
    }
  }

  // 원격 근무 패턴
  if (/원격|재택|리모트|remote/i.test(normalized)) {
    return '원격';
  }

  return normalized;
}

/**
 * 부서명 정규화
 */
function normalizeDepartment(department) {
  const departmentMap = {
    '개발': ['개발', 'Development', 'Engineer', 'Software'],
    '기획': ['기획', 'Planning', 'Product'],
    '디자인': ['디자인', 'Design', 'UX', 'UI'],
    '마케팅': ['마케팅', 'Marketing'],
    '영업': ['영업', 'Sales'],
    '인사': ['인사', 'HR', 'Human Resources'],
    '재무': ['재무', 'Finance'],
    '경영': ['경영', 'Management'],
    '기타': ['기타', 'Others', 'ETC']
  };

  const normalized = department.trim();

  for (const [key, patterns] of Object.entries(departmentMap)) {
    if (patterns.some(pattern => normalized.includes(pattern))) {
      return key;
    }
  }

  return normalized;
}

/**
 * 경력 정보 정규화
 */
function normalizeExperience(experience) {
  const normalized = experience.trim();

  // 신입 패턴
  if (/신입|신규|new|entry|junior|0년|0\s*year/i.test(normalized)) {
    return '신입';
  }

  // 경력 패턴
  if (/경력|경력자|experienced|senior/i.test(normalized)) {
    // 년수 추출 시도
    const yearMatch = normalized.match(/(\d+)\s*년|\d+\s*year/i);
    if (yearMatch) {
      return `경력 ${yearMatch[1]}년+`;
    }
    return '경력';
  }

  // 무관 패턴
  if (/무관|상관없음|any|all/i.test(normalized)) {
    return '무관';
  }

  return normalized;
}

/**
 * 배치 검증 - 여러 채용공고를 한번에 검증
 * @param {Array} jobsArray - 채용공고 배열
 * @returns {Object} { valid: Array, invalid: Array, stats: Object }
 */
function validateJobBatch(jobsArray, options = {}) {
  const valid = [];
  const invalid = [];
  const stats = {
    total: jobsArray.length,
    validCount: 0,
    invalidCount: 0,
    warningCount: 0,
    errorsByType: {}
  };


  for (const job of jobsArray) {
    const result = validateJobData(job, options);

    if (result.isValid) {
      valid.push(result.sanitizedData);
      stats.validCount++;
    } else {
      invalid.push({
        originalData: job,
        errors: result.errors,
        sanitizedData: result.sanitizedData
      });
      stats.invalidCount++;

      // 에러 타입별 집계
      for (const error of result.errors) {
        const errorType = error.split(':')[0];
        stats.errorsByType[errorType] = (stats.errorsByType[errorType] || 0) + 1;
      }
    }
  }

  stats.validRatio = stats.total > 0 ? (stats.validCount / stats.total) : 0;
  stats.qualityScore = stats.validRatio * 100;

  return { valid, invalid, stats };
}

/**
 * 크롤링 결과 품질 보고서 생성
 */
function generateQualityReport(validationResult, options = {}) {
  const { valid, invalid, stats } = validationResult;
  const thresholds = getCompanyThresholds(options.companyName, options);
  const minValidRatio = thresholds.minValidRatio;
  const meetsThreshold = stats.validRatio >= minValidRatio && stats.total > 0;

  console.log('
=== ??? ?? ??? ===');
  console.log(`?? ??? ${stats.total}?`);
  console.log(`?? ??? ${stats.validCount}?(${(stats.validRatio * 100).toFixed(1)}%)`);
  console.log(`?? ??? ${stats.invalidCount}?(${((stats.invalidCount / stats.total) * 100).toFixed(1)}%)`);
  console.log(`?? ?? ?? ??: ${(minValidRatio * 100).toFixed(0)}%`);

  if (stats.invalidCount > 0) {
    console.log('
?? ??? ??:');
    for (const [errorType, count] of Object.entries(stats.errorsByType)) {
      console.log(`  - ${errorType}: ${count}?`);
    }

    console.log('
?? 5?? ?? ??? ??:');
    invalid.slice(0, 5).forEach((item, index) => {
      console.log(`  ${index + 1}. ??: ${item.originalData.title || '(??)'}`);
      console.log(`     ??: ${item.errors.join(', ')}`);
    });
  }

  console.log('========================
');

  return {
    passed: stats.invalidCount === 0,
    qualityScore: stats.qualityScore,
    validRatio: stats.validRatio,
    minValidRatio,
    meetsThreshold,
    report: stats
  };
}

module.exports = {
  validateJobData,
  validateJobBatch,
  generateQualityReport,
  normalizeLocation,
  normalizeDepartment,
  normalizeExperience
};
