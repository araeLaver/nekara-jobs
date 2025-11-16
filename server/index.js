const express = require('express');
const cors = require('cors');
const http = require('http');
const { PrismaClient } = require('@prisma/client');
const WebSocketServer = require('./websocket');
const JobScheduler = require('./scheduler');

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

// WebSocket 서버 초기화
const wsServer = new WebSocketServer(server);

// 스케줄러 초기화
const scheduler = new JobScheduler(wsServer);

// CORS 설정 - 보안 강화
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:4000', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request body 크기 제한 (DoS 방지)
app.use(express.json({ limit: '10mb' }));

// 채용공고 목록 조회 (페이지네이션, 필터링, 검색)
app.get('/api/jobs', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      company,
      location,
      jobType,
      search,
      sortBy = 'postedAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      isActive: true,
      ...(company && { company: { name: company } }),
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
      ...(jobType && { jobType: { contains: jobType, mode: 'insensitive' } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { department: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: true,
          tags: {
            include: { tag: true }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: parseInt(limit)
      }),
      prisma.job.count({ where })
    ]);

    res.json({
      jobs: jobs.map(job => ({
        ...job,
        tags: job.tags.map(jt => jt.tag.name)
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('채용공고 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 특정 채용공고 상세 조회
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        tags: {
          include: { tag: true }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: '채용공고를 찾을 수 없습니다.' });
    }

    res.json({
      ...job,
      tags: job.tags.map(jt => jt.tag.name)
    });
  } catch (error) {
    console.error('채용공고 상세 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 회사 목록 조회
app.get('/api/companies', async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { jobs: { where: { isActive: true } } }
        }
      }
    });

    res.json(companies.map(company => ({
      ...company,
      jobCount: company._count.jobs
    })));
  } catch (error) {
    console.error('회사 목록 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 통계 데이터 조회
app.get('/api/stats', async (req, res) => {
  try {
    const [totalJobs, companiesWithJobs, recentJobs] = await Promise.all([
      prisma.job.count({ where: { isActive: true } }),
      prisma.company.count({
        where: { jobs: { some: { isActive: true } } }
      }),
      prisma.job.count({
        where: {
          isActive: true,
          postedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    const jobsByCompany = await prisma.company.findMany({
      select: {
        name: true,
        _count: {
          select: { jobs: { where: { isActive: true } } }
        }
      }
    });

    res.json({
      totalJobs,
      totalCompanies: companiesWithJobs,
      recentJobs,
      jobsByCompany: jobsByCompany.map(c => ({
        company: c.name,
        count: c._count.jobs
      }))
    });
  } catch (error) {
    console.error('통계 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 크롤링 수동 실행
app.post('/api/crawl', async (req, res) => {
  try {
    const { company } = req.body;
    
    const result = await scheduler.runManualCrawling(company);
    
    res.json({
      message: '크롤링이 완료되었습니다.',
      ...result
    });
  } catch (error) {
    console.error('크롤링 실행 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// WebSocket 클라이언트 수 조회
app.get('/api/status', (req, res) => {
  res.json({
    connectedClients: wsServer.getClientCount(),
    serverTime: new Date().toISOString()
  });
});

// DEPRECATED: 크롤링 결과를 데이터베이스에 저장하는 함수
// 이 함수는 N+1 쿼리 문제가 있어 사용되지 않습니다.
// crawler/main-crawler.js의 bulk operation을 사용하세요.
async function saveJobsToDatabase_DEPRECATED(jobs, companyName) {
  try {
    // 회사 정보 확인/생성
    let company = await prisma.company.findUnique({
      where: { name: companyName }
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: companyName,
          nameEn: companyName
        }
      });
    }

    // 채용공고 저장
    for (const job of jobs) {
      const existingJob = await prisma.job.findFirst({
        where: {
          title: job.title,
          companyId: company.id,
          originalUrl: job.originalUrl
        }
      });

      if (!existingJob) {
        await prisma.job.create({
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
      } else {
        // 기존 채용공고 업데이트
        await prisma.job.update({
          where: { id: existingJob.id },
          data: {
            description: job.description || existingJob.description,
            location: job.location || existingJob.location,
            department: job.department || existingJob.department,
            jobType: job.jobType || existingJob.jobType,
            updatedAt: new Date()
          }
        });
      }
    }

    console.log(`✅ ${companyName}: ${jobs.length}개 채용공고 데이터베이스 저장 완료`);
  } catch (error) {
    console.error(`❌ ${companyName} 데이터베이스 저장 오류:`, error);
  }
}

// 서버 시작
const PORT = process.env.PORT || 4001;
server.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📡 WebSocket 서버 실행 중: ws://localhost:${PORT}/ws`);
  
  // 서버 시작 시 크롤링 스케줄러 시작
  scheduler.startScheduledCrawling();
});

// 프로세스 종료 시 정리
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});