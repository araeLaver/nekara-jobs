# Scripts Directory

이 디렉토리에는 데이터베이스 관리 및 크롤링 유틸리티 스크립트가 포함되어 있습니다.

## 활성 스크립트 (사용 중)

### 데이터베이스 관리
- `verify-db.js` - 데이터베이스 연결 및 데이터 검증
- `clean-duplicate-companies.js` - 중복 회사 데이터 정리
- `remove-inactive-jobs.js` - 비활성 채용공고 삭제
- `init-community-data.js` - 커뮤니티 초기 데이터 생성

### 크롤링 유틸리티
- `test-single-crawler.js` - 개별 크롤러 테스트
- `crawl-naver-jobs.js` - 네이버 채용공고 크롤링
- `crawl-line-jobs.js` - LINE 채용공고 크롤링
- `crawl-krafton-jobs.js` - 크래프톤 채용공고 크롤링
- `crawl-nexon-jobs.js` - 넥슨 채용공고 크롤링

## 사용법

```bash
# 데이터베이스 검증
node scripts/verify-db.js

# 중복 회사 정리
node scripts/clean-duplicate-companies.js

# 비활성 채용공고 삭제
node scripts/remove-inactive-jobs.js

# 개별 크롤러 테스트
node scripts/test-single-crawler.js [회사명]
```

## 아카이브된 스크립트

나머지 스크립트들은 일회성 데이터 수정 용도로 사용되었으며, 현재는 사용되지 않습니다.
필요 시 Git 히스토리에서 복구할 수 있습니다.
