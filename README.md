# 네카라쿠배 채용 사이트

네이버, 카카오, 라인, 쿠팡, 배달의민족, 토스, 넥슨 등 주요 빅테크 기업의 채용 정보를 실시간으로 수집하고 제공하는 웹사이트입니다.

✅ **실제 데이터 사용 중**: 검증된 크롤러를 통해 실제 채용 공고를 수집하여 제공합니다.

## 주요 기능

- **채용공고**: 실시간 크롤링, 필터링(회사/직무/지역), 키워드 검색
- **커뮤니티**: 게시글 작성/조회, 댓글, '좋아요' 기능
- **사용자 인증**: 간단한 로그인/로그아웃 기능
- **자동화**: 매일 주기적으로 채용 공고를 자동 업데이트

## 기술 스택

- **Frontend**: Next.js 14 (App Router, SSR), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Express.js
- **Database**: PostgreSQL, Prisma ORM
- **Crawler**: Puppeteer
- **Testing**: Jest, React Testing Library
- **CI/CD**: GitHub Actions

## 프로젝트 구조

```
nekara-jobs/
├── .github/workflows/      # GitHub Actions CI 워크플로우
├── src/                    # Next.js 프론트엔드
│   ├── app/               # App Router (API 라우트 포함)
│   ├── components/        # React 컴포넌트
│   └── context/           # React Context (인증 등)
├── crawler/              # 채용정보 크롤러
├── prisma/               # 데이터베이스 스키마 및 마이그레이션
└── ...
```

## 개발 환경 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 데이터베이스 설정
PostgreSQL이 설치되어 있어야 합니다. `.env` 파일에 `DATABASE_URL`을 설정하세요.

```bash
# 데이터베이스 마이그레이션 및 시드 데이터 생성 (최초 1회)
# 경고: 이 명령어는 데이터베이스를 초기화합니다.
npm run db:reset -- --force
```

### 3. 환경 변수 설정
`.env.example` 파일을 복사하여 `.env` 파일을 만들고 다음 내용을 설정하세요:
```env
# PostgreSQL 연결 URL
DATABASE_URL="postgresql://user:password@host:port/database"

# Vercel Cron Job 실행을 위한 시크릿 키 (임의의 문자열)
CRON_SECRET="your-super-secret-key"
```

### 4. 개발 서버 실행
```bash
npm run dev
```
프론트엔드 및 API 서버가 `http://localhost:4000`에서 실행됩니다.

## 테스트 및 크롤링

```bash
# 단위 테스트 실행
npm test

# 수동으로 모든 크롤러 실행 및 DB 저장
npm run crawler
```

## CI/CD 및 배포

이 프로젝트는 GitHub Actions를 사용한 CI(Continuous Integration) 파이프라인이 설정되어 있습니다. `main` 브랜치에 코드가 푸시되거나 풀 리퀘스트가 생성되면, 다음 작업이 자동으로 실행됩니다.

1.  **Lint**: 코드 스타일 검사
2.  **Test**: 단위 테스트 실행
3.  **Build**: Next.js 프로젝트 빌드

### Vercel 자동 배포 설정 방법

CI 파이프라인이 성공적으로 완료된 후 Vercel에 자동으로 배포하려면 다음 단계를 따르세요.

**1. Vercel 인증 정보 준비**

- **`VERCEL_TOKEN`**: Vercel 계정 설정의 [Tokens](https://vercel.com/account/tokens) 페이지에서 새로운 토큰을 생성합니다.
- **`VERCEL_PROJECT_ID`**: 프로젝트의 `.vercel/project.json` 파일에서 `projectId` 값을 확인합니다.
- **`VERCEL_ORG_ID`**: 프로젝트의 `.vercel/project.json` 파일에서 `orgId` 값을 확인합니다.

**2. GitHub 저장소에 Secrets 추가**

- 프로젝트의 GitHub 저장소에서 `Settings` > `Secrets and variables` > `Actions`로 이동합니다.
- `New repository secret` 버튼을 클릭하여 위에서 준비한 3개의 값(`VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_ORG_ID`)을 각각 추가합니다.

**3. 배포 워크플로우 추가**

- `.github/workflows/ci.yml` 파일에 다음 `deploy` 잡을 추가합니다. 이 잡은 `build-and-test` 잡이 성공해야만 실행됩니다.

```yaml
# .github/workflows/ci.yml 파일에 추가

# (기존 build-and-test 잡 아래에 추가)
  deploy:
    needs: build-and-test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod' # 프로덕션 환경에 배포
```

위 단계를 완료하면, `main` 브랜치에 푸시할 때마다 자동으로 테스트, 빌드, 배포가 모두 이루어집니다.
