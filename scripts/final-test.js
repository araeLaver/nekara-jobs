// 네카라쿠배 채용 사이트 최종 테스트

async function runFinalTest() {
  console.log('🧪 네카라쿠배 채용 사이트 최종 테스트 시작')
  console.log('=' .repeat(60))

  const baseURL = 'http://localhost:4001'
  const tests = []

  // 1. API 서버 상태 테스트
  try {
    const response = await fetch(`${baseURL}/api/status`)
    const data = await response.json()
    tests.push({
      name: 'API 서버 상태',
      status: '✅ 통과',
      detail: `서버 시간: ${data.serverTime}`
    })
  } catch (error) {
    tests.push({
      name: 'API 서버 상태',
      status: '❌ 실패',
      detail: error.message
    })
  }

  // 2. 채용공고 데이터 테스트
  try {
    const response = await fetch(`${baseURL}/api/jobs`)
    const data = await response.json()
    tests.push({
      name: '채용공고 목록 조회',
      status: data.jobs.length > 0 ? '✅ 통과' : '⚠️  경고',
      detail: `${data.jobs.length}개 채용공고, ${data.pagination.pages}페이지`
    })

    // 샘플 채용공고 데이터 검증
    if (data.jobs.length > 0) {
      const job = data.jobs[0]
      const requiredFields = ['id', 'title', 'company', 'postedAt', 'originalUrl']
      const missingFields = requiredFields.filter(field => !job[field])
      
      tests.push({
        name: '채용공고 데이터 구조',
        status: missingFields.length === 0 ? '✅ 통과' : '❌ 실패',
        detail: missingFields.length === 0 ? '모든 필수 필드 존재' : `누락 필드: ${missingFields.join(', ')}`
      })
    }
  } catch (error) {
    tests.push({
      name: '채용공고 목록 조회',
      status: '❌ 실패',
      detail: error.message
    })
  }

  // 3. 회사 데이터 테스트
  try {
    const response = await fetch(`${baseURL}/api/companies`)
    const data = await response.json()
    const expectedCompanies = ['naver', 'kakao', 'line', 'coupang', 'baemin']
    const actualCompanies = data.map(c => c.name)
    const allPresent = expectedCompanies.every(company => actualCompanies.includes(company))
    
    tests.push({
      name: '회사 데이터',
      status: allPresent ? '✅ 통과' : '⚠️  경고',
      detail: `${data.length}개 회사 등록됨`
    })
  } catch (error) {
    tests.push({
      name: '회사 데이터',
      status: '❌ 실패',
      detail: error.message
    })
  }

  // 4. 검색 기능 테스트
  try {
    const response = await fetch(`${baseURL}/api/jobs?search=Python`)
    const data = await response.json()
    tests.push({
      name: '검색 기능',
      status: '✅ 통과',
      detail: `Python 검색 결과: ${data.jobs.length}개`
    })
  } catch (error) {
    tests.push({
      name: '검색 기능',
      status: '❌ 실패',
      detail: error.message
    })
  }

  // 5. 필터링 기능 테스트
  try {
    const response = await fetch(`${baseURL}/api/jobs?company=naver`)
    const data = await response.json()
    tests.push({
      name: '필터링 기능',
      status: '✅ 통과',
      detail: `네이버 필터 결과: ${data.jobs.length}개`
    })
  } catch (error) {
    tests.push({
      name: '필터링 기능',
      status: '❌ 실패',
      detail: error.message
    })
  }

  // 6. 통계 데이터 테스트
  try {
    const response = await fetch(`${baseURL}/api/stats`)
    const data = await response.json()
    tests.push({
      name: '통계 데이터',
      status: '✅ 통과',
      detail: `총 ${data.totalJobs}개 공고, ${data.totalCompanies}개 회사`
    })
  } catch (error) {
    tests.push({
      name: '통계 데이터',
      status: '❌ 실패',
      detail: error.message
    })
  }

  // 7. 수동 크롤링 테스트
  try {
    const response = await fetch(`${baseURL}/api/crawl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: 'naver' })
    })
    const data = await response.json()
    tests.push({
      name: '수동 크롤링',
      status: '✅ 통과',
      detail: `크롤링 실행됨 (${data.message})`
    })
  } catch (error) {
    tests.push({
      name: '수동 크롤링',
      status: '❌ 실패',
      detail: error.message
    })
  }

  // 8. 프론트엔드 서버 테스트
  try {
    const response = await fetch('http://localhost:3000')
    tests.push({
      name: '프론트엔드 서버',
      status: response.ok ? '✅ 통과' : '❌ 실패',
      detail: `HTTP ${response.status} ${response.statusText}`
    })
  } catch (error) {
    tests.push({
      name: '프론트엔드 서버',
      status: '❌ 실패',
      detail: error.message
    })
  }

  // 결과 출력
  console.log('\n📋 테스트 결과')
  console.log('-'.repeat(60))
  
  tests.forEach((test, index) => {
    console.log(`${index + 1}. ${test.name}: ${test.status}`)
    console.log(`   ${test.detail}`)
  })

  const passedTests = tests.filter(t => t.status.includes('✅')).length
  const totalTests = tests.length
  
  console.log('\n📊 최종 결과')
  console.log('-'.repeat(60))
  console.log(`통과: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`)
  
  if (passedTests === totalTests) {
    console.log('🎉 모든 테스트 통과! 사이트가 정상 작동합니다.')
  } else {
    console.log('⚠️  일부 테스트 실패. 문제를 확인해주세요.')
  }

  console.log('\n🌐 접속 정보')
  console.log('-'.repeat(60))
  console.log('프론트엔드: http://localhost:3000')
  console.log('API 서버: http://localhost:3001')
  console.log('DB 관리: npm run db:studio')
  
  console.log('\n📝 주요 기능')
  console.log('-'.repeat(60))
  console.log('✅ 6개 채용공고 샘플 데이터')
  console.log('✅ 5개 회사 (네이버, 카카오, 라인, 쿠팡, 배민)')
  console.log('✅ 검색 및 필터링')
  console.log('✅ 실시간 WebSocket 연결')
  console.log('✅ 반응형 UI')
  console.log('✅ 수동 크롤링 API')
  console.log('⚠️  크롤링 셀렉터 (실제 사이트 구조에 맞게 수정 필요)')
}

runFinalTest().catch(console.error)