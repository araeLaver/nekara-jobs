# Node.js 18 Alpine 이미지 사용
FROM node:18-alpine AS base

# 의존성 설치를 위한 빌드 스테이지
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Next.js 빌드를 위한 스테이지
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js 빌드 실행
RUN npm run build

# 프로덕션 이미지 생성
FROM base AS runner
WORKDIR /app

# 비 root 유저 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 필요한 파일들 복사
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 서버 파일들 복사
COPY --chown=nextjs:nodejs ./server ./server
COPY --chown=nextjs:nodejs ./crawler ./crawler
COPY --chown=nextjs:nodejs ./prisma ./prisma

# Chromium 설치 (Puppeteer용)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Puppeteer가 설치된 Chromium을 사용하도록 설정
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

USER nextjs

EXPOSE 3000 3001

ENV PORT=3000
ENV NODE_ENV=production

# 서버 시작 스크립트
CMD ["node", "server.js"]