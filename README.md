# 네카라쿠배 채용 사이트

네이버, 카카오, 라인, 쿠팡, 배달의민족 등 주요 빅테크 기업의 채용 정보를 실시간으로 수집하고 제공하는 웹사이트

⚠️ **현재 상태**: 이 프로젝트는 개발 단계이며, 현재 샘플 데이터를 사용하고 있습니다. 실제 기업 채용 사이트에서의 실시간 크롤링은 기술적 제약으로 인해 제한적입니다.

## 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL, Prisma ORM
- **Crawler**: Puppeteer
- **Scheduler**: node-cron

## 프로젝트 구조

```
nekara-jobs/
├── src/                    # Next.js 프론트엔드
│   ├── app/               # App Router
│   ├── components/        # React 컴포넌트
│   └── lib/              # 유틸리티 함수
├── server/               # Express 백엔드 API
├── crawler/              # 채용정보 크롤러
├── prisma/              # 데이터베이스 스키마
├── scripts/             # 데이터베이스 관리 스크립트
└── public/              # 정적 파일
```

## 주요 기능

- 채용공고 표시 및 필터링
- 회사별/직무별/지역별 필터링
- 키워드 검색 및 정렬
- 실시간 통계 대시보드
- 모바일 반응형 디자인

## 개발 환경 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 데이터베이스 설정
PostgreSQL이 설치되어 있어야 합니다.
```bash
# 데이터베이스 마이그레이션
npx prisma migrate dev
# 기본 데이터 생성
npx prisma db seed
```

### 3. 서버 실행
```bash
npm run dev        # 프론트엔드 개발 서버 (http://localhost:3000)
npm run server     # 백엔드 API 서버 (http://localhost:3001)
```

### 4. 샘플 데이터 생성
```bash
node scripts/fix-final-jobs.js
```

## 크롤링 시도

여러 크롤링 방법이 구현되어 있습니다:
- `crawler/enhanced-direct-crawler.js` - 각 회사 사이트 직접 크롤링
- `crawler/real-working-crawler.js` - 채용 플랫폼을 통한 크롤링
- `crawler/direct-company-crawler.js` - 기본 회사 사이트 크롤링

각 크롤러는 기술적 제약(봇 감지, 동적 로딩 등)으로 인해 실제 운영에서는 제한적입니다.

## 현재 제한사항

- 실제 기업 채용 사이트의 봇 방지 시스템으로 인한 크롤링 어려움
- 동적 콘텐츠 로딩으로 인한 데이터 수집 제약
- 현재는 현실적인 샘플 데이터를 사용하여 UI/UX 시연

## API 엔드포인트

- `GET /api/jobs` - 채용공고 목록
- `GET /api/companies` - 회사 정보
- `GET /api/stats` - 통계 정보
- `POST /api/crawl` - 수동 크롤링 실행

## 브라우저 지원

- Chrome/Edge 최신 버전
- Firefox 최신 버전
- Safari 최신 버전