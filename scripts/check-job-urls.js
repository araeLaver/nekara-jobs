const { PrismaClient } = require('@prisma/client')
const https = require('https')
const http = require('http')

const prisma = new PrismaClient()

async function checkUrl(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url)
    const client = urlObj.protocol === 'https:' ? https : http
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }

    const req = client.request(options, (res) => {
      resolve({
        status: res.statusCode,
        valid: res.statusCode >= 200 && res.statusCode < 400
      })
    })

    req.on('error', () => {
      resolve({ status: 0, valid: false })
    })

    req.on('timeout', () => {
      req.destroy()
      resolve({ status: 0, valid: false })
    })

    req.end()
  })
}

async function checkAllJobUrls() {
  console.log('🔍 모든 채용공고 URL 유효성 검사 시작...')
  
  try {
    const jobs = await prisma.job.findMany({
      include: {
        company: true
      },
      orderBy: {
        company: {
          name: 'asc'
        }
      }
    })

    console.log(`총 ${jobs.length}개의 채용공고 URL 검사 중...`)
    
    const results = []
    
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i]
      console.log(`\n[${i + 1}/${jobs.length}] 검사 중: ${job.company.name} - ${job.title}`)
      console.log(`URL: ${job.originalUrl}`)
      
      try {
        const result = await checkUrl(job.originalUrl)
        results.push({
          job: job,
          status: result.status,
          valid: result.valid
        })
        
        const statusText = result.valid ? '✅ 유효' : '❌ 무효'
        console.log(`결과: ${statusText} (HTTP ${result.status})`)
        
      } catch (error) {
        results.push({
          job: job,
          status: 0,
          valid: false
        })
        console.log(`결과: ❌ 오류 - ${error.message}`)
      }
      
      // 너무 빠른 요청 방지
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // 결과 요약
    console.log('\n📊 검사 결과 요약:')
    const validJobs = results.filter(r => r.valid)
    const invalidJobs = results.filter(r => !r.valid)
    
    console.log(`✅ 유효한 URL: ${validJobs.length}개`)
    console.log(`❌ 무효한 URL: ${invalidJobs.length}개`)
    
    if (invalidJobs.length > 0) {
      console.log('\n❌ 무효한 URL 목록:')
      invalidJobs.forEach((result, index) => {
        console.log(`${index + 1}. [${result.job.company.name}] ${result.job.title}`)
        console.log(`   URL: ${result.job.originalUrl}`)
        console.log(`   Status: ${result.status}`)
        console.log('')
      })
    }
    
    // 회사별 통계
    console.log('\n📈 회사별 URL 유효성:')
    const companyStats = {}
    results.forEach(result => {
      const companyName = result.job.company.name
      if (!companyStats[companyName]) {
        companyStats[companyName] = { valid: 0, invalid: 0, total: 0 }
      }
      companyStats[companyName].total++
      if (result.valid) {
        companyStats[companyName].valid++
      } else {
        companyStats[companyName].invalid++
      }
    })
    
    Object.entries(companyStats).forEach(([company, stats]) => {
      const percentage = ((stats.valid / stats.total) * 100).toFixed(1)
      console.log(`${company}: ${stats.valid}/${stats.total} (${percentage}%)`)
    })
    
    return { validJobs, invalidJobs, results }
    
  } catch (error) {
    console.error('❌ URL 검사 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  checkAllJobUrls().catch(console.error)
}

module.exports = { checkAllJobUrls, checkUrl }