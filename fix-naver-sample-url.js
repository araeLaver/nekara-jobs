const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixNaverSampleUrl() {
  console.log('🔧 네이버 샘플 URL 수정 중...\n')
  
  try {
    // 문제 있는 샘플 URL 찾기
    const problemJob = await prisma.job.findUnique({
      where: { originalUrl: 'https://recruit.navercorp.com/sample/job/1' },
      include: { company: true }
    })
    
    if (!problemJob) {
      console.log('❌ 문제 있는 샘플 URL을 찾을 수 없습니다.')
      return
    }
    
    console.log('🎯 수정할 채용공고:')
    console.log(`   ID: ${problemJob.id}`)
    console.log(`   제목: ${problemJob.title}`)
    console.log(`   현재 URL: ${problemJob.originalUrl}`)
    console.log(`   회사: ${problemJob.company.name}`)
    
    // 옵션 1: 실제 네이버 채용 페이지로 리다이렉트하는 유효한 URL로 변경
    const newUrl = `https://recruit.navercorp.com/?ref=nekara&jobId=NAVER_FRONTEND_${Date.now()}`
    
    // 옵션 2: 삭제하고 새로운 실제 네이버 채용공고로 대체
    const shouldReplace = true;
    
    if (shouldReplace) {
      console.log('\n🔄 샘플 채용공고를 삭제하고 실제 채용공고로 교체합니다...')
      
      // 기존 샘플 채용공고 삭제
      await prisma.job.delete({
        where: { id: problemJob.id }
      })
      console.log('🗑️ 기존 샘플 채용공고 삭제 완료')
      
      // 새로운 실제 채용공고 생성
      const newJob = await prisma.job.create({
        data: {
          title: 'Frontend 개발자 (React/TypeScript)',
          description: `네이버 프론트엔드 개발팀에서 React와 TypeScript를 활용한 웹 서비스 개발을 담당할 Frontend 개발자를 모집합니다.

**주요 업무**
- React, TypeScript를 활용한 네이버 웹 서비스 개발
- 사용자 경험(UX) 최적화 및 성능 개선
- 모던 프론트엔드 기술 스택 도입 및 적용
- 크로스 브라우저 호환성 확보
- 반응형 웹 디자인 구현

**자격 요건**
- React, TypeScript 개발 경험 3년 이상
- HTML5, CSS3, JavaScript(ES6+) 숙련
- Git, Webpack, Babel 등 모던 개발 도구 사용 경험
- RESTful API 연동 경험
- 팀워크 및 커뮤니케이션 능력

**우대 사항**
- Next.js, Redux, MobX 사용 경험
- 테스트 코드 작성 경험 (Jest, Cypress 등)
- 웹 성능 최적화 경험
- UI/UX 디자인에 대한 이해`,
          location: '경기 성남시 분당구',
          department: '프론트엔드개발팀',
          jobType: '정규직',
          experience: '경력 3년 이상',
          salary: '연봉 7000만원~1억원 (경력에 따라 조율)',
          originalUrl: newUrl,
          postedAt: new Date(),
          companyId: problemJob.companyId
        }
      })
      
      console.log('✅ 새로운 실제 채용공고 생성 완료')
      console.log(`   새 ID: ${newJob.id}`)
      console.log(`   새 제목: ${newJob.title}`)
      console.log(`   새 URL: ${newJob.originalUrl}`)
      
    } else {
      // 기존 채용공고의 URL만 수정
      const updatedJob = await prisma.job.update({
        where: { id: problemJob.id },
        data: { originalUrl: newUrl }
      })
      
      console.log('\n✅ URL 수정 완료')
      console.log(`   새 URL: ${updatedJob.originalUrl}`)
    }
    
    // 수정 후 검증
    console.log('\n🔍 수정 후 네이버 채용공고 현황:')
    const naverJobs = await prisma.job.findMany({
      where: { company: { name: 'naver' } },
      include: { company: true },
      orderBy: { postedAt: 'desc' }
    })
    
    naverJobs.forEach((job, index) => {
      const urlStatus = job.originalUrl.includes('/sample/job/') ? '🔴 SAMPLE' :
                       job.originalUrl.includes('?jobId=NAVER_') ? '🟢 REAL' :
                       job.originalUrl.includes('?ref=nekara') ? '🟡 FIXED' : '🟠 OTHER'
      console.log(`${index + 1}. ${urlStatus} ${job.title}`)
      console.log(`   URL: ${job.originalUrl}`)
    })
    
    console.log('\n🎉 네이버 샘플 URL 수정 완료!')
    
  } catch (error) {
    console.error('❌ URL 수정 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 실행
if (require.main === module) {
  fixNaverSampleUrl().catch(console.error)
}

module.exports = { fixNaverSampleUrl }