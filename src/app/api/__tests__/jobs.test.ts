/**
 * Jobs API Tests
 *
 * Tests for GET /api/jobs endpoint
 */

import { GET } from '../jobs/route';
import { prisma, resetAllMocks } from '../../../lib/__mocks__/prisma';
import { createMockRequest } from '../../../__tests__/helpers/request';

// Mock the prisma module
jest.mock('@/lib/prisma', () => require('../../../lib/__mocks__/prisma'));

// Mock rate limit to avoid interference
jest.mock('@/lib/rate-limit', () => ({
  rateLimit: () => () => Promise.resolve(null),
  apiRateLimits: { jobs: { interval: 60000, limit: 100 } },
}));

describe('GET /api/jobs', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  const mockJobs = [
    {
      id: 'job-1',
      title: 'Software Engineer',
      description: 'Build software',
      location: '서울',
      department: '개발',
      jobType: '정규직',
      experience: '경력 3년+',
      salary: '5000만원',
      postedAt: new Date('2024-01-15'),
      deadline: null,
      originalUrl: 'https://example.com/job/1',
      isActive: true,
      companyId: 'c1',
      company: {
        id: 'c1',
        name: 'Tech Corp',
        nameEn: 'Tech Corp Inc.',
        logo: 'https://example.com/logo.png',
      },
    },
  ];

  it('should return jobs with pagination', async () => {
    prisma.job.findMany.mockResolvedValue(mockJobs);
    prisma.job.count.mockResolvedValue(1);

    const request = createMockRequest('http://localhost:3000/api/jobs');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.jobs).toHaveLength(1);
    expect(json.jobs[0].id).toBe('job-1');
    expect(json.jobs[0].title).toBe('Software Engineer');
    expect(json.jobs[0].company.name).toBe('Tech Corp');
    expect(json.pagination).toBeTruthy();
  });

  it('should format job response correctly', async () => {
    prisma.job.findMany.mockResolvedValue(mockJobs);
    prisma.job.count.mockResolvedValue(1);

    const request = createMockRequest('http://localhost:3000/api/jobs');
    const response = await GET(request);
    const json = await response.json();

    const job = json.jobs[0];
    expect(job).toEqual({
      id: 'job-1',
      title: 'Software Engineer',
      location: '서울',
      department: '개발',
      jobType: '정규직',
      experience: '경력 3년+',
      postedAt: '2024-01-15T00:00:00.000Z',
      deadline: null,
      originalUrl: 'https://example.com/job/1',
      company: {
        id: 'c1',
        name: 'Tech Corp',
        nameEn: 'Tech Corp Inc.',
        logo: 'https://example.com/logo.png',
      },
      tags: [],
    });
  });

  it('should parse page query parameter', async () => {
    prisma.job.findMany.mockResolvedValue([]);
    prisma.job.count.mockResolvedValue(0);

    const request = createMockRequest('http://localhost:3000/api/jobs', {
      searchParams: { page: '2' },
    });
    await GET(request);

    expect(prisma.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20, // (page 2 - 1) * limit 20
      })
    );
  });

  it('should parse limit query parameter', async () => {
    prisma.job.findMany.mockResolvedValue([]);
    prisma.job.count.mockResolvedValue(0);

    const request = createMockRequest('http://localhost:3000/api/jobs', {
      searchParams: { limit: '50' },
    });
    await GET(request);

    expect(prisma.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 50,
      })
    );
  });

  it('should parse company filter', async () => {
    prisma.job.findMany.mockResolvedValue([]);
    prisma.job.count.mockResolvedValue(0);

    const request = createMockRequest('http://localhost:3000/api/jobs', {
      searchParams: { company: 'Tech Corp' },
    });
    await GET(request);

    expect(prisma.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          company: {
            name: { equals: 'Tech Corp', mode: 'insensitive' },
          },
        }),
      })
    );
  });

  it('should parse location filter', async () => {
    prisma.job.findMany.mockResolvedValue([]);
    prisma.job.count.mockResolvedValue(0);

    const request = createMockRequest('http://localhost:3000/api/jobs', {
      searchParams: { location: '서울' },
    });
    await GET(request);

    expect(prisma.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          location: { contains: '서울', mode: 'insensitive' },
        }),
      })
    );
  });

  it('should parse department filter', async () => {
    prisma.job.findMany.mockResolvedValue([]);
    prisma.job.count.mockResolvedValue(0);

    const request = createMockRequest('http://localhost:3000/api/jobs', {
      searchParams: { department: '개발' },
    });
    await GET(request);

    expect(prisma.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          department: { contains: '개발', mode: 'insensitive' },
        }),
      })
    );
  });

  it('should parse search filter', async () => {
    prisma.job.findMany.mockResolvedValue([]);
    prisma.job.count.mockResolvedValue(0);

    const request = createMockRequest('http://localhost:3000/api/jobs', {
      searchParams: { search: 'engineer' },
    });
    await GET(request);

    expect(prisma.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: { contains: 'engineer', mode: 'insensitive' } },
            { description: { contains: 'engineer', mode: 'insensitive' } },
          ],
        }),
      })
    );
  });

  it('should handle multiple filters', async () => {
    prisma.job.findMany.mockResolvedValue([]);
    prisma.job.count.mockResolvedValue(0);

    const request = createMockRequest('http://localhost:3000/api/jobs', {
      searchParams: {
        company: 'Tech',
        location: '서울',
        department: '개발',
      },
    });
    await GET(request);

    const whereClause = prisma.job.findMany.mock.calls[0][0].where;
    expect(whereClause.company).toBeTruthy();
    expect(whereClause.location).toBeTruthy();
    expect(whereClause.department).toBeTruthy();
  });

  it('should return pagination info in response', async () => {
    prisma.job.findMany.mockResolvedValue(mockJobs);
    prisma.job.count.mockResolvedValue(100);

    const request = createMockRequest('http://localhost:3000/api/jobs', {
      searchParams: { page: '3', limit: '10' },
    });
    const response = await GET(request);
    const json = await response.json();

    expect(json.pagination).toEqual({
      current: 3,
      total: 100,
      pages: 10,
      limit: 10,
    });
  });

  it('should handle empty results', async () => {
    prisma.job.findMany.mockResolvedValue([]);
    prisma.job.count.mockResolvedValue(0);

    const request = createMockRequest('http://localhost:3000/api/jobs');
    const response = await GET(request);
    const json = await response.json();

    expect(json.jobs).toHaveLength(0);
    expect(json.pagination.total).toBe(0);
    expect(json.pagination.pages).toBe(0);
  });

  it('should handle database errors', async () => {
    prisma.job.findMany.mockRejectedValue(new Error('Database error'));

    const request = createMockRequest('http://localhost:3000/api/jobs');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBeTruthy();
  });

  it('should handle null/empty optional fields', async () => {
    const jobWithNulls = {
      ...mockJobs[0],
      location: null,
      department: null,
      jobType: null,
      experience: null,
      deadline: null,
    };
    prisma.job.findMany.mockResolvedValue([jobWithNulls]);
    prisma.job.count.mockResolvedValue(1);

    const request = createMockRequest('http://localhost:3000/api/jobs');
    const response = await GET(request);
    const json = await response.json();

    expect(json.jobs[0].location).toBe('');
    expect(json.jobs[0].department).toBe('');
    expect(json.jobs[0].jobType).toBe('');
    expect(json.jobs[0].experience).toBe('');
    expect(json.jobs[0].deadline).toBeNull();
  });
});
