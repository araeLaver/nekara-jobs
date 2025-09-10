// 프론트엔드 API 연결 테스트 스크립트

async function testFrontendAPI() {
  console.log('🧪 프론트엔드 API 연결 테스트 시작...')

  const baseURL = 'http://localhost:4001'
  
  try {
    // 1. API 서버 상태 확인
    console.log('1️⃣ API 서버 상태 확인...')
    const statusResponse = await fetch(`${baseURL}/api/status`)
    const statusData = await statusResponse.json()
    console.log('✅ API 서버 상태:', statusData)

    // 2. 채용공고 데이터 확인
    console.log('\n2️⃣ 채용공고 데이터 확인...')
    const jobsResponse = await fetch(`${baseURL}/api/jobs`)
    const jobsData = await jobsResponse.json()
    console.log('✅ 채용공고 수:', jobsData.jobs.length)
    
    if (jobsData.jobs.length > 0) {
      const sampleJob = jobsData.jobs[0]
      console.log('   📋 샘플 채용공고:')
      console.log(`      제목: ${sampleJob.title}`)
      console.log(`      회사: ${sampleJob.company.nameEn}`)
      console.log(`      위치: ${sampleJob.location}`)
      console.log(`      URL: ${sampleJob.originalUrl}`)
      console.log(`      태그: ${sampleJob.tags.join(', ')}`)
    }

    // 3. 통계 데이터 확인
    console.log('\n3️⃣ 통계 데이터 확인...')
    const statsResponse = await fetch(`${baseURL}/api/stats`)
    const statsData = await statsResponse.json()
    console.log('✅ 통계 데이터:', statsData)

    // 4. 회사 데이터 확인
    console.log('\n4️⃣ 회사 데이터 확인...')
    const companiesResponse = await fetch(`${baseURL}/api/companies`)
    const companiesData = await companiesResponse.json()
    console.log(`✅ 등록된 회사 수: ${companiesData.length}`)
    
    companiesData.forEach(company => {
      console.log(`   🏢 ${company.nameEn}: ${company.jobCount}개 채용공고`)
    })

    // 5. CORS 헤더 확인
    console.log('\n5️⃣ CORS 헤더 확인...')
    const corsHeaders = {
      'Access-Control-Allow-Origin': jobsResponse.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': jobsResponse.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': jobsResponse.headers.get('Access-Control-Allow-Headers')
    }
    console.log('✅ CORS 헤더:', corsHeaders)

    console.log('\n🎉 모든 테스트 통과!')
    console.log('\n📝 문제가 있다면:')
    console.log('   1. 브라우저 개발자 도구에서 네트워크 탭 확인')
    console.log('   2. Console 탭에서 에러 메시지 확인')
    console.log('   3. API 서버 포트 3001이 정상 작동하는지 확인')

  } catch (error) {
    console.error('❌ API 테스트 실패:', error)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 해결방법:')
      console.log('   1. API 서버가 실행 중인지 확인: npm run server')
      console.log('   2. 포트 3001이 사용 가능한지 확인')
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.log('\n💡 해결방법:')
      console.log('   1. Node.js 18+ 버전 사용 확인')
      console.log('   2. fetch polyfill 필요할 수 있음')
    }
  }
}

testFrontendAPI()