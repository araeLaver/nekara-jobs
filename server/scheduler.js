const cron = require('node-cron');
const { ImprovedCrawler } = require('../crawler/improved-crawlers');
const { PrismaClient } = require('@prisma/client');

class JobScheduler {
  constructor(wsServer) {
    this.crawler = new ImprovedCrawler();
    this.prisma = new PrismaClient();
    this.wsServer = wsServer;
    this.isRunning = false;
  }

  // 스케줄된 크롤링 시작
  startScheduledCrawling() {
    // 매일 오전 9시와 오후 6시에 실행
    cron.schedule('0 9,18 * * *', async () => {
      if (!this.isRunning) {
        await this.runFullCrawling();
      }
    });

    // 매 시간마다 빠른 업데이트 체크
    cron.schedule('0 * * * *', async () => {
      if (!this.isRunning) {
        await this.runQuickUpdate();
      }
    });

    console.log('⏰ 채용공고 크롤링 스케줄러 시작됨');
    console.log('  - 전체 크롤링: 매일 09:00, 18:00');
    console.log('  - 빠른 업데이트: 매시간');
  }

  // 전체 크롤링 실행
  async runFullCrawling() {
    this.isRunning = true;
    
    try {
      console.log('🔄 스케줄된 전체 크롤링 시작');
      
      // 크롤링 시작 알림
      this.wsServer?.notifyCrawlingStatus({
        status: 'started',
        type: 'full',
        timestamp: new Date().toISOString()
      });

      const results = await this.crawler.crawlAll();
      let totalNewJobs = 0;
      let totalUpdatedJobs = 0;

      // 각 회사별 결과 처리
      for (const [company, jobs] of Object.entries(results)) {
        if (jobs && jobs.length > 0) {
          const { newJobs, updatedJobs } = await this.saveJobsToDatabase(jobs, company);
          totalNewJobs += newJobs;
          totalUpdatedJobs += updatedJobs;
        }
      }

      // 통계 업데이트
      const stats = await this.updateStats();
      
      // 완료 알림
      this.wsServer?.notifyCrawlingStatus({
        status: 'completed',
        type: 'full',
        results: {
          totalNewJobs,
          totalUpdatedJobs,
          companies: Object.keys(results).length
        },
        timestamp: new Date().toISOString()
      });

      // 통계 업데이트 알림
      this.wsServer?.notifyStatsUpdated(stats);

      console.log(`✅ 전체 크롤링 완료: 신규 ${totalNewJobs}개, 업데이트 ${totalUpdatedJobs}개`);
      
    } catch (error) {
      console.error('❌ 스케줄된 크롤링 실패:', error);
      
      this.wsServer?.notifyCrawlingStatus({
        status: 'failed',
        type: 'full',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      this.isRunning = false;
    }
  }

  // 빠른 업데이트 (최근 채용공고만)
  async runQuickUpdate() {
    try {
      console.log('⚡ 빠른 업데이트 시작');
      
      this.wsServer?.notifyCrawlingStatus({
        status: 'started',
        type: 'quick',
        timestamp: new Date().toISOString()
      });

      // 랜덤하게 1-2개 회사만 크롤링
      const companies = ['naver', 'kakao', 'line', 'coupang', 'baemin'];
      const selectedCompanies = companies.sort(() => 0.5 - Math.random()).slice(0, 2);
      
      let totalNewJobs = 0;
      
      for (const company of selectedCompanies) {
        try {
          const jobs = await this.crawler.crawlSingle(company);
          const { newJobs } = await this.saveJobsToDatabase(jobs, company);
          totalNewJobs += newJobs;
          
          // 새로운 채용공고가 있으면 알림
          if (newJobs > 0) {
            const recentJobs = await this.getRecentJobs(company, newJobs);
            recentJobs.forEach(job => {
              this.wsServer?.notifyJobAdded(job);
            });
          }
        } catch (error) {
          console.error(`${company} 빠른 업데이트 실패:`, error.message);
        }
      }

      this.wsServer?.notifyCrawlingStatus({
        status: 'completed',
        type: 'quick',
        results: { totalNewJobs },
        timestamp: new Date().toISOString()
      });

      if (totalNewJobs > 0) {
        console.log(`⚡ 빠른 업데이트 완료: 신규 ${totalNewJobs}개`);
      }
      
    } catch (error) {
      console.error('❌ 빠른 업데이트 실패:', error);
    }
  }

  // 데이터베이스에 채용공고 저장 (중복 체크)
  async saveJobsToDatabase(jobs, companyName) {
    let newJobs = 0;
    let updatedJobs = 0;

    try {
      // 회사 정보 확인/생성
      let company = await this.prisma.company.findUnique({
        where: { name: companyName }
      });

      if (!company) {
        company = await this.prisma.company.create({
          data: {
            name: companyName,
            nameEn: companyName
          }
        });
      }

      // 채용공고 저장/업데이트
      for (const job of jobs) {
        const existingJob = await this.prisma.job.findFirst({
          where: {
            title: job.title,
            companyId: company.id,
            originalUrl: job.originalUrl
          }
        });

        if (!existingJob) {
          await this.prisma.job.create({
            data: {
              title: job.title,
              description: job.description || '',
              location: job.location || '',
              department: job.department || '',
              jobType: job.jobType || '',
              experience: job.experience || '',
              salary: job.salary || '',
              originalUrl: job.originalUrl,
              postedAt: new Date(job.postedAt),
              companyId: company.id
            }
          });
          newJobs++;
        } else {
          // 내용이 변경된 경우만 업데이트
          const hasChanges = 
            existingJob.description !== (job.description || '') ||
            existingJob.location !== (job.location || '') ||
            existingJob.department !== (job.department || '') ||
            existingJob.jobType !== (job.jobType || '');

          if (hasChanges) {
            await this.prisma.job.update({
              where: { id: existingJob.id },
              data: {
                description: job.description || existingJob.description,
                location: job.location || existingJob.location,
                department: job.department || existingJob.department,
                jobType: job.jobType || existingJob.jobType,
                updatedAt: new Date()
              }
            });
            updatedJobs++;
          }
        }
      }

      return { newJobs, updatedJobs };
    } catch (error) {
      console.error(`${companyName} 데이터베이스 저장 오류:`, error);
      return { newJobs: 0, updatedJobs: 0 };
    }
  }

  // 최근 채용공고 조회
  async getRecentJobs(companyName, limit = 5) {
    try {
      return await this.prisma.job.findMany({
        where: {
          company: { name: companyName },
          isActive: true
        },
        include: {
          company: true,
          tags: {
            include: { tag: true }
          }
        },
        orderBy: { postedAt: 'desc' },
        take: limit
      });
    } catch (error) {
      console.error('최근 채용공고 조회 오류:', error);
      return [];
    }
  }

  // 통계 업데이트
  async updateStats() {
    try {
      const [totalJobs, companiesWithJobs, recentJobs] = await Promise.all([
        this.prisma.job.count({ where: { isActive: true } }),
        this.prisma.company.count({
          where: { jobs: { some: { isActive: true } } }
        }),
        this.prisma.job.count({
          where: {
            isActive: true,
            postedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        })
      ]);

      const jobsByCompany = await this.prisma.company.findMany({
        select: {
          name: true,
          _count: {
            select: { jobs: { where: { isActive: true } } }
          }
        }
      });

      return {
        totalJobs,
        totalCompanies: companiesWithJobs,
        recentJobs,
        jobsByCompany: jobsByCompany.map(c => ({
          company: c.name,
          count: c._count.jobs
        }))
      };
    } catch (error) {
      console.error('통계 업데이트 오류:', error);
      return null;
    }
  }

  // 수동 크롤링 실행
  async runManualCrawling(company = null) {
    if (this.isRunning) {
      throw new Error('크롤링이 이미 실행 중입니다');
    }

    this.isRunning = true;

    try {
      let results;
      if (company) {
        const jobs = await this.crawler.crawlSingle(company);
        results = { [company]: jobs };
      } else {
        results = await this.crawler.crawlAll();
      }

      let totalNewJobs = 0;
      let totalUpdatedJobs = 0;

      for (const [companyName, jobs] of Object.entries(results)) {
        if (jobs && jobs.length > 0) {
          const { newJobs, updatedJobs } = await this.saveJobsToDatabase(jobs, companyName);
          totalNewJobs += newJobs;
          totalUpdatedJobs += updatedJobs;
        }
      }

      const stats = await this.updateStats();
      this.wsServer?.notifyStatsUpdated(stats);

      return {
        totalNewJobs,
        totalUpdatedJobs,
        results: Object.entries(results).map(([companyName, jobs]) => ({
          company: companyName,
          count: jobs ? jobs.length : 0,
          error: jobs ? null : 'No jobs found'
        }))
      };
    } finally {
      this.isRunning = false;
    }
  }
}

module.exports = JobScheduler;