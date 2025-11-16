# 🚀 프로덕션 배포 가이드

## ✅ 배포 전 체크리스트

### 1. 환경변수 설정 (필수)

Vercel 대시보드 또는 배포 환경에 다음 환경변수를 설정하세요:

```bash
# 필수 환경변수
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
CRON_SECRET="your-secure-random-secret"  # openssl rand -base64 32로 생성

# 선택 환경변수 (프로덕션에서 권장)
NEXTAUTH_SECRET="your-nextauth-secret"
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
NODE_ENV="production"

# Google Analytics (선택)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

### 2. 데이터베이스 설정

**중요**: 프로덕션 데이터베이스는 반드시 SSL을 사용해야 합니다.

```bash
# ✅ 올바른 예시
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# ❌ 잘못된 예시 (SSL 없음)
DATABASE_URL="postgresql://user:pass@host:5432/db"
```

### 3. 마이그레이션 실행

```bash
# 프로덕션 데이터베이스에 스키마 적용
npx prisma migrate deploy

# Prisma Client 생성
npx prisma generate
```

### 4. 크론 작업 설정 (Vercel)

`vercel.json`에 이미 설정되어 있습니다:
- 매일 오전 9시 KST에 채용공고 업데이트
- `/api/cron/update-jobs` 엔드포인트 호출
- `CRON_SECRET`으로 보호됨

### 5. CORS 설정 확인

Express 서버를 사용하는 경우 `ALLOWED_ORIGINS` 환경변수 설정:

```bash
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

---

## 🔒 보안 체크리스트

### ✅ 완료된 보안 강화 사항

1. **CRON Secret 검증 강화**
   - Fail-closed 방식 적용
   - 환경변수 없으면 500 에러 반환

2. **CORS 정책 강화**
   - 허용된 도메인만 접근 가능
   - Credentials 지원
   - 메서드 제한 (GET, POST, PUT, DELETE)

3. **Rate Limiting 적용**
   - Jobs API: 1분 100회
   - Community API: 1분 30회
   - POST 요청: 1분 10회

4. **Request Body 크기 제한**
   - 최대 10MB로 제한 (DoS 방지)

5. **환경변수 검증**
   - 서버 시작 시 필수 변수 체크
   - 프로덕션 환경 추가 검증

6. **하드코딩 데이터 제거**
   - 가짜 fallback 데이터 완전 제거
   - 실제 데이터베이스만 사용

7. **Health Check 엔드포인트**
   - `/api/health` - 서버 및 DB 상태 확인

---

## 📊 성능 최적화

### 캐싱 전략

1. **Stats API**
   - CDN 캐싱: 5분
   - Stale-while-revalidate: 10분

2. **Filter Options API**
   - CDN 캐싱: 1시간
   - 동적으로 DB에서 로드

### 데이터베이스 인덱스

이미 최적화된 인덱스가 적용되어 있습니다:
- `companyId`, `postedAt`, `isActive`, `title`
- Composite index: `(isActive, postedAt)`

---

## 🚀 Vercel 배포

### 1. Vercel CLI 설치 (선택)

```bash
npm install -g vercel
```

### 2. 배포

```bash
# 프로덕션 배포
vercel --prod

# 또는 GitHub 연동으로 자동 배포
# main 브랜치에 push하면 자동으로 배포됩니다
```

### 3. 환경변수 설정

```bash
# Vercel 대시보드에서 설정
# Project Settings > Environment Variables

# 또는 CLI로 설정
vercel env add DATABASE_URL production
vercel env add CRON_SECRET production
```

---

## 🔍 모니터링

### Health Check

```bash
# 서버 상태 확인
curl https://yourdomain.com/api/health
```

**응답 예시**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "services": {
    "jobs": "ok"
  }
}
```

### Rate Limit 헤더

API 응답에 포함된 헤더:
- `X-RateLimit-Limit`: 최대 요청 수
- `X-RateLimit-Remaining`: 남은 요청 수
- `X-RateLimit-Reset`: 리셋 시간

### 에러 모니터링 (권장)

프로덕션 환경에서는 에러 모니터링 서비스 사용을 권장합니다:
- Sentry
- LogRocket
- Datadog

---

## 🐛 트러블슈팅

### 1. "Missing required environment variable" 에러

```bash
# 필수 환경변수 확인
- DATABASE_URL
- CRON_SECRET
```

### 2. "Database connection failed"

```bash
# DATABASE_URL이 올바른지 확인
# SSL 설정 확인: ?sslmode=require
# 데이터베이스 방화벽 설정 확인
```

### 3. "Too many requests" (429 에러)

Rate Limit에 걸렸습니다. 응답 헤더의 `Retry-After` 확인 후 재시도하세요.

### 4. CORS 에러

```bash
# ALLOWED_ORIGINS 환경변수에 도메인이 포함되어 있는지 확인
ALLOWED_ORIGINS="https://yourdomain.com"
```

---

## 📝 배포 후 확인사항

### 1. Health Check
```bash
curl https://yourdomain.com/api/health
```

### 2. Jobs API
```bash
curl https://yourdomain.com/api/jobs?limit=5
```

### 3. Stats API
```bash
curl https://yourdomain.com/api/stats
```

### 4. Cron Job (Vercel 대시보드에서 확인)
- Vercel Dashboard > Deployments > Cron Jobs
- 로그 확인

---

## 🎯 성능 목표

- **API 응답 시간**: < 200ms
- **페이지 로드 시간**: < 1초
- **크롤러 실행 시간**: < 5분
- **데이터베이스 쿼리**: < 100ms

---

## 📞 문제 발생 시

1. Vercel 로그 확인
2. `/api/health` 엔드포인트 확인
3. 데이터베이스 연결 상태 확인
4. 환경변수 설정 재확인

---

## 🔄 롤백 방법

Vercel 대시보드에서:
1. Deployments 탭으로 이동
2. 이전 배포 선택
3. "Promote to Production" 클릭

---

## ✨ 추가 개선 권장사항

### 1. 인증 시스템 강화
현재 간단한 localStorage 기반 인증을 사용 중입니다.
프로덕션에서는 NextAuth.js + JWT 구현을 권장합니다.

### 2. Redis 캐싱
대용량 트래픽 처리를 위해 Redis 캐싱 레이어 추가를 고려하세요.

### 3. CDN 설정
정적 파일 및 이미지는 CDN을 통해 제공하세요 (Vercel은 자동 제공).

### 4. Error Monitoring
Sentry 등의 에러 모니터링 서비스 통합을 권장합니다.

---

**배포 완료! 🎉**
