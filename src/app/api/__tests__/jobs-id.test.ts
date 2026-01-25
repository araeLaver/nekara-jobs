/**
 * Jobs [id] API Tests
 *
 * Tests for GET /api/jobs/[id] endpoint
 */

import { GET } from '../jobs/[id]/route';
import { prisma, resetAllMocks } from '../../../lib/__mocks__/prisma';
import { createMockRequest } from '../../../__tests__/helpers/request';

// Mock the prisma module
jest.mock('@/lib/prisma', () => require('../../../lib/__mocks__/prisma'));

describe('GET /api/jobs/[id]', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  const mockJob = {
    id: 'job-1',
    title: 'Software Engineer',
    description: 'Build amazing software',
    location: '서울',
    department: '개발',
    jobType: '정규직',
    experience: '경력 3년+',
    salary: '5000만원 ~ 7000만원',
    postedAt: new Date('2024-01-15'),
    deadline: new Date('2024-02-15'),
    originalUrl: 'https://example.com/job/1',
    isActive: true,
    companyId: 'c1',
    company: {
      id: 'c1',
      name: 'Tech Corp',
      nameEn: 'Tech Corp Inc.',
      logo: 'https://example.com/logo.png',
    },
    tags: [
      { tag: { name: 'JavaScript' } },
      { tag: { name: 'React' } },
    ],
  };

  it('should return job details', async () => {
    prisma.job.findUnique.mockResolvedValue(mockJob);
    prisma.jobView.create.mockResolvedValue({});

    const request = createMockRequest('http://localhost:3000/api/jobs/job-1');
    const response = await GET(request, { params: { id: 'job-1' } });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.id).toBe('job-1');
    expect(json.title).toBe('Software Engineer');
    expect(json.description).toBe('Build amazing software');
  });

  it('should format response correctly', async () => {
    prisma.job.findUnique.mockResolvedValue(mockJob);
    prisma.jobView.create.mockResolvedValue({});

    const request = createMockRequest('http://localhost:3000/api/jobs/job-1');
    const response = await GET(request, { params: { id: 'job-1' } });
    const json = await response.json();

    expect(json).toEqual({
      id: 'job-1',
      title: 'Software Engineer',
      description: 'Build amazing software',
      location: '서울',
      department: '개발',
      jobType: '정규직',
      experience: '경력 3년+',
      salary: '5000만원 ~ 7000만원',
      postedAt: '2024-01-15T00:00:00.000Z',
      deadline: '2024-02-15T00:00:00.000Z',
      isActive: true,
      originalUrl: 'https://example.com/job/1',
      company: {
        id: 'c1',
        name: 'Tech Corp',
        nameEn: 'Tech Corp Inc.',
        logo: 'https://example.com/logo.png',
      },
      tags: ['JavaScript', 'React'],
    });
  });

  it('should return 404 when job not found', async () => {
    prisma.job.findUnique.mockResolvedValue(null);

    const request = createMockRequest('http://localhost:3000/api/jobs/non-existent');
    const response = await GET(request, { params: { id: 'non-existent' } });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('채용공고를 찾을 수 없습니다.');
    expect(json.code).toBe('NOT_FOUND');
  });

  it('should record job view', async () => {
    prisma.job.findUnique.mockResolvedValue(mockJob);
    prisma.jobView.create.mockResolvedValue({});

    const request = createMockRequest('http://localhost:3000/api/jobs/job-1', {
      headers: {
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'Mozilla/5.0',
      },
    });
    await GET(request, { params: { id: 'job-1' } });

    // Wait for async view creation
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(prisma.jobView.create).toHaveBeenCalledWith({
      data: {
        jobId: 'job-1',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
    });
  });

  it('should use fallback values for missing headers', async () => {
    prisma.job.findUnique.mockResolvedValue(mockJob);
    prisma.jobView.create.mockResolvedValue({});

    const request = createMockRequest('http://localhost:3000/api/jobs/job-1');
    await GET(request, { params: { id: 'job-1' } });

    await new Promise(resolve => setTimeout(resolve, 10));

    expect(prisma.jobView.create).toHaveBeenCalledWith({
      data: {
        jobId: 'job-1',
        ipAddress: '0.0.0.0',
        userAgent: 'unknown',
      },
    });
  });

  it('should not fail if view recording fails', async () => {
    prisma.job.findUnique.mockResolvedValue(mockJob);
    prisma.jobView.create.mockRejectedValue(new Error('DB error'));

    const request = createMockRequest('http://localhost:3000/api/jobs/job-1');
    const response = await GET(request, { params: { id: 'job-1' } });

    expect(response.status).toBe(200);
  });

  it('should handle null optional fields', async () => {
    const jobWithNulls = {
      ...mockJob,
      description: null,
      location: null,
      department: null,
      experience: null,
      salary: null,
      deadline: null,
    };
    prisma.job.findUnique.mockResolvedValue(jobWithNulls);
    prisma.jobView.create.mockResolvedValue({});

    const request = createMockRequest('http://localhost:3000/api/jobs/job-1');
    const response = await GET(request, { params: { id: 'job-1' } });
    const json = await response.json();

    expect(json.description).toBe('');
    expect(json.location).toBe('');
    expect(json.department).toBe('');
    expect(json.experience).toBe('');
    expect(json.salary).toBe('');
    expect(json.deadline).toBeNull();
  });

  it('should handle null jobType with default value', async () => {
    const jobWithNullType = {
      ...mockJob,
      jobType: null,
    };
    prisma.job.findUnique.mockResolvedValue(jobWithNullType);
    prisma.jobView.create.mockResolvedValue({});

    const request = createMockRequest('http://localhost:3000/api/jobs/job-1');
    const response = await GET(request, { params: { id: 'job-1' } });
    const json = await response.json();

    expect(json.jobType).toBe('정규직');
  });

  it('should handle empty tags array', async () => {
    const jobWithNoTags = {
      ...mockJob,
      tags: [],
    };
    prisma.job.findUnique.mockResolvedValue(jobWithNoTags);
    prisma.jobView.create.mockResolvedValue({});

    const request = createMockRequest('http://localhost:3000/api/jobs/job-1');
    const response = await GET(request, { params: { id: 'job-1' } });
    const json = await response.json();

    expect(json.tags).toEqual([]);
  });

  it('should handle database errors', async () => {
    prisma.job.findUnique.mockRejectedValue(new Error('Database error'));

    const request = createMockRequest('http://localhost:3000/api/jobs/job-1');
    const response = await GET(request, { params: { id: 'job-1' } });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBeTruthy();
  });
});
