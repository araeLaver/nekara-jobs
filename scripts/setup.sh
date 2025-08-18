#!/bin/bash

# 네카라쿠배 채용 사이트 개발 환경 설정 스크립트

set -e

echo "🔧 네카라쿠배 채용 사이트 개발 환경 설정 시작..."

# Node.js 버전 확인
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되어 있지 않습니다. Node.js 18+ 버전을 설치해주세요."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ 버전이 필요합니다. 현재 버전: $(node -v)"
    exit 1
fi

echo "✅ Node.js 버전 확인 완료: $(node -v)"

# 패키지 설치
echo "📦 패키지 설치 중..."
npm install

# 환경 변수 파일 생성
if [ ! -f .env ]; then
    echo "📝 환경 변수 파일 생성 중..."
    cp .env.example .env
    echo "⚠️  .env 파일을 수정하여 데이터베이스 연결 정보를 설정해주세요."
fi

# 데이터베이스 설정 (PostgreSQL이 실행 중인 경우)
if command -v psql &> /dev/null; then
    echo "🗄️ 데이터베이스 마이그레이션 실행 중..."
    npx prisma migrate dev --name init
    npx prisma generate
else
    echo "⚠️  PostgreSQL이 설치되어 있지 않습니다. Docker Compose를 사용하거나 PostgreSQL을 설치해주세요."
fi

# Git hooks 설정
if [ -d .git ]; then
    echo "🔗 Git hooks 설정 중..."
    npx husky install
fi

# 빌드 테스트
echo "🔨 빌드 테스트 중..."
npm run build

# 권한 설정 (Linux/Mac)
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    chmod +x scripts/*.sh
fi

echo "🎉 개발 환경 설정 완료!"
echo ""
echo "🚀 개발 서버 시작 명령어:"
echo "  npm run dev        # 프론트엔드 개발 서버"
echo "  npm run server     # 백엔드 API 서버"
echo "  npm run crawler    # 크롤러 실행"
echo ""
echo "🐳 Docker로 실행:"
echo "  docker-compose up -d"
echo ""
echo "📚 추가 설정이 필요한 항목:"
echo "  1. .env 파일의 DATABASE_URL 수정"
echo "  2. PostgreSQL 데이터베이스 생성"
echo "  3. SSL 인증서 설정 (프로덕션 환경)"