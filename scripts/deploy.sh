#!/bin/bash

# 네카라쿠배 채용 사이트 배포 스크립트

set -e

echo "🚀 네카라쿠배 채용 사이트 배포 시작..."

# 환경 변수 확인
if [ ! -f .env ]; then
    echo "❌ .env 파일이 없습니다. .env.example을 참고하여 .env 파일을 생성해주세요."
    exit 1
fi

# Docker 및 Docker Compose 확인
if ! command -v docker &> /dev/null; then
    echo "❌ Docker가 설치되어 있지 않습니다."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose가 설치되어 있지 않습니다."
    exit 1
fi

# 기존 컨테이너 중지 및 제거
echo "🛑 기존 컨테이너 중지 중..."
docker-compose down

# 이미지 빌드
echo "🔨 Docker 이미지 빌드 중..."
docker-compose build --no-cache

# 데이터베이스 마이그레이션 (첫 실행시)
echo "🗄️ 데이터베이스 초기화 중..."
docker-compose up -d postgres redis
sleep 10

# 애플리케이션 시작
echo "🚀 애플리케이션 시작 중..."
docker-compose up -d

# 헬스 체크
echo "🏥 헬스 체크 중..."
sleep 30

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ 프론트엔드 서버가 정상적으로 실행되었습니다."
else
    echo "❌ 프론트엔드 서버 시작 실패"
fi

if curl -f http://localhost:3001/api/status > /dev/null 2>&1; then
    echo "✅ API 서버가 정상적으로 실행되었습니다."
else
    echo "❌ API 서버 시작 실패"
fi

echo "🎉 배포 완료!"
echo "📱 웹사이트: http://localhost"
echo "🔧 API: http://localhost/api"
echo "📊 로그 확인: docker-compose logs -f"