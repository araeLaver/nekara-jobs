# 네카라쿠배 채용 사이트

네이버, 카카오, 라인, 쿠팡, 배달의민족, 토스, 넥슨 등 주요 빅테크 기업의 채용 정보를 실시간으로 수집하고 제공하는 웹사이트

✅ **실제 데이터 사용 중**: 검증된 크롤러를 통해 실제 채용 공고를 수집하여 제공합니다.

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
npm run db:migrate

# Prisma Client 생성
npm run db:generate
```

### 3. 환경 변수 설정
`.env` 파일에 다음 내용을 설정하세요:
```env
DATABASE_URL="postgresql://user:password@host:port/database"
PORT=3001
CRAWL_INTERVAL_HOURS=12
NEXTAUTH_SECRET="your-secret-key"
CRON_SECRET="your-cron-secret"
```

### 4. 서버 실행
```bash
npm run dev        # 프론트엔드 개발 서버 (http://localhost:4000)
npm run server     # 백엔드 API 서버 (http://localhost:4001)
```

### 5. 실제 데이터 크롤링
```bash
# 실제 채용 공고 크롤링 및 DB 저장
npm run crawler

# 크롤링 테스트만 (DB 저장 안 함)
npm run crawler:test
```

## 크롤링 시스템

검증된 크롤러만 사용하여 실제 채용 공고를 수집합니다:

### 지원 회사
- ✅ **카카오** - 실시간 크롤링 가능
- ✅ **토스** - 실시간 크롤링 가능 (218개 공고)
- ✅ **배달의민족** - 실시간 크롤링 가능
- ✅ **넥슨** - 실시간 크롤링 가능
- ⚠️ **네이버** - 제한적 크롤링
- ⚠️ **라인** - 제한적 크롤링

### 크롤링 스케줄
- **전체 크롤링**: 매일 오전 9시, 오후 6시
- **빠른 업데이트**: 매시간

### 수동 크롤링
```bash
# 모든 회사 크롤링
npm run crawler

# 데이터베이스 정리
npm run db:clean-companies  # 중복 회사 제거
npm run db:clean-jobs       # 비활성 채용공고 제거
```

## 크롤링 아키텍처

```
crawler/
├── working-crawlers.js    # 검증된 크롤러 관리자
├── main-crawler.js        # 메인 크롤링 + DB 저장
├── kakao.js              # 카카오 크롤러
├── toss.js               # 토스 크롤러
├── baemin.js             # 배민 크롤러
├── naver.js              # 네이버 크롤러
├── line.js               # 라인 크롤러
└── nexon.js              # 넥슨 크롤러
```

## API 엔드포인트

- `GET /api/jobs` - 채용공고 목록
- `GET /api/companies` - 회사 정보
- `GET /api/stats` - 통계 정보
- `POST /api/crawl` - 수동 크롤링 실행

## 브라우저 지원

- Chrome/Edge 최신 버전
- Firefox 최신 버전
- Safari 최신 버전