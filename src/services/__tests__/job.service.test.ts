/**
 * Job Service Tests
 *
 * Tests for JobService: getJobs, getJobById, getOverallStats, getFilterOptions
 */

import { JobService } from '../job.service';
import { prisma, resetAllMocks } from '../../lib/__mocks__/prisma';
import { NotFoundError } from '../../lib/errors';

// Mock the prisma module
jest.mock('../../lib/prisma', () => require('../../lib/__mocks__/prisma'));

describe('JobService', () => {
  let jobService: JobService;

  beforeEach(() => {
    resetAllMocks();
    jobService = new JobService();
  });

  describe('getJobs', () => {
    const mockJobs = [
      {
        id: 'job-1',
        title: 'Software Engineer',
        location: '서울',
        department: '개발',
        jobType: '정규직',
        experience: '경력 3년+',
        postedAt: new Date('2024-01-15'),
        deadline: null,
        originalUrl: 'https://example.com/job/1',
        isActive: true,
        company: { id: 'company-1', name: 'Tech Corp', nameEn: 'Tech Corp', logo: null },
      },
      {
        id: 'job-2',
        title: 'Frontend Developer',
        location: '경기',
        department: '개발',
        jobType: '정규직',
        experience: '신입',
        postedAt: new Date('2024-01-16'),
        deadline: null,
        originalUrl: 'https://example.com/job/2',
        isActive: true,
        company: { id: 'company-2', name: 'Web Inc', nameEn: null, logo: null },
      },
    ];

    it('should return jobs with pagination info', async () => {
      prisma.job.findMany.mockResolvedValue(mockJobs);
      prisma.job.count.mockResolvedValue(2);

      const result = await jobService.getJobs();

      expect(result.jobs).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        pages: 1,
      });
    });

    it('should apply pagination correctly', async () => {
      prisma.job.findMany.mockResolvedValue([mockJobs[0]]);
      prisma.job.count.mockResolvedValue(50);

      const result = await jobService.getJobs({}, { page: 2, limit: 10 });

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 50,
        pages: 5,
      });
    });

    it('should limit maximum page size to 100', async () => {
      prisma.job.findMany.mockResolvedValue([]);
      prisma.job.count.mockResolvedValue(0);

      await jobService.getJobs({}, { limit: 500 });

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      );
    });

    it('should enforce minimum page size of 1', async () => {
      prisma.job.findMany.mockResolvedValue([]);
      prisma.job.count.mockResolvedValue(0);

      await jobService.getJobs({}, { limit: -5 });

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 1,
        })
      );
    });

    it('should enforce minimum page number of 1', async () => {
      prisma.job.findMany.mockResolvedValue([]);
      prisma.job.count.mockResolvedValue(0);

      await jobService.getJobs({}, { page: -1 });

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
        })
      );
    });

    it('should filter by company name', async () => {
      prisma.job.findMany.mockResolvedValue([mockJobs[0]]);
      prisma.job.count.mockResolvedValue(1);

      await jobService.getJobs({ company: 'Tech Corp' });

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            company: {
              name: {
                equals: 'Tech Corp',
                mode: 'insensitive',
              },
            },
          }),
        })
      );
    });

    it('should filter by location', async () => {
      prisma.job.findMany.mockResolvedValue([mockJobs[0]]);
      prisma.job.count.mockResolvedValue(1);

      await jobService.getJobs({ location: '서울' });

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            location: {
              contains: '서울',
              mode: 'insensitive',
            },
          }),
        })
      );
    });

    it('should filter by department', async () => {
      prisma.job.findMany.mockResolvedValue([mockJobs[0]]);
      prisma.job.count.mockResolvedValue(1);

      await jobService.getJobs({ department: '개발' });

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            department: {
              contains: '개발',
              mode: 'insensitive',
            },
          }),
        })
      );
    });

    it('should filter by search term in title and description', async () => {
      prisma.job.findMany.mockResolvedValue([mockJobs[0]]);
      prisma.job.count.mockResolvedValue(1);

      await jobService.getJobs({ search: 'Engineer' });

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'Engineer', mode: 'insensitive' } },
              { description: { contains: 'Engineer', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('should filter by isActive', async () => {
      prisma.job.findMany.mockResolvedValue([]);
      prisma.job.count.mockResolvedValue(0);

      await jobService.getJobs({ isActive: false });

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: false,
          }),
        })
      );
    });

    it('should default isActive to true', async () => {
      prisma.job.findMany.mockResolvedValue([]);
      prisma.job.count.mockResolvedValue(0);

      await jobService.getJobs({});

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });

    it('should order by postedAt descending', async () => {
      prisma.job.findMany.mockResolvedValue([]);
      prisma.job.count.mockResolvedValue(0);

      await jobService.getJobs();

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ postedAt: 'desc' }],
        })
      );
    });

    it('should include company select fields', async () => {
      prisma.job.findMany.mockResolvedValue([]);
      prisma.job.count.mockResolvedValue(0);

      await jobService.getJobs();

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            company: {
              select: {
                id: true,
                name: true,
                nameEn: true,
                logo: true,
              },
            },
          },
        })
      );
    });
  });

  describe('getJobById', () => {
    const mockJob = {
      id: 'job-1',
      title: 'Software Engineer',
      description: 'A great job',
      location: '서울',
      department: '개발',
      jobType: '정규직',
      experience: '경력 3년+',
      salary: '5000만원',
      originalUrl: 'https://example.com/job/1',
      isActive: true,
      postedAt: new Date(),
      deadline: null,
      companyId: 'company-1',
      company: {
        id: 'company-1',
        name: 'Tech Corp',
        nameEn: 'Tech Corp',
        logo: null,
        website: 'https://techcorp.com',
      },
      tags: [
        { tag: { id: 'tag-1', name: 'JavaScript' } },
        { tag: { id: 'tag-2', name: 'React' } },
      ],
    };

    it('should return job with company and tags', async () => {
      prisma.job.findUnique.mockResolvedValue(mockJob);
      prisma.jobView.create.mockResolvedValue({});

      const result = await jobService.getJobById('job-1');

      expect(result).toEqual(mockJob);
      expect(prisma.job.findUnique).toHaveBeenCalledWith({
        where: { id: 'job-1' },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              nameEn: true,
              logo: true,
              website: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundError when job does not exist', async () => {
      prisma.job.findUnique.mockResolvedValue(null);

      await expect(jobService.getJobById('non-existent')).rejects.toThrow(NotFoundError);
      await expect(jobService.getJobById('non-existent')).rejects.toThrow('채용공고를 찾을 수 없습니다');
    });

    it('should increment view count when job is found', async () => {
      prisma.job.findUnique.mockResolvedValue(mockJob);
      prisma.jobView.create.mockResolvedValue({});

      await jobService.getJobById('job-1');

      // Wait for async view count increment
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(prisma.jobView.create).toHaveBeenCalledWith({
        data: {
          jobId: 'job-1',
          ipAddress: '0.0.0.0',
          userAgent: 'web',
        },
      });
    });

    it('should not throw if view count increment fails', async () => {
      prisma.job.findUnique.mockResolvedValue(mockJob);
      prisma.jobView.create.mockRejectedValue(new Error('DB error'));

      const result = await jobService.getJobById('job-1');
      expect(result).toEqual(mockJob);
    });
  });

  describe('getOverallStats', () => {
    it('should return totalJobs, jobsByCompany, and recentJobs', async () => {
      prisma.job.count.mockResolvedValueOnce(100); // totalJobs
      prisma.job.count.mockResolvedValueOnce(25); // recentJobs
      prisma.job.groupBy.mockResolvedValue([
        { companyId: 'c1', _count: { id: 50 } },
        { companyId: 'c2', _count: { id: 50 } },
      ]);
      prisma.company.findMany.mockResolvedValue([
        { id: 'c1', name: 'Company A' },
        { id: 'c2', name: 'Company B' },
      ]);

      const result = await jobService.getOverallStats();

      expect(result.totalJobs).toBe(100);
      expect(result.recentJobs).toBe(25);
      expect(result.jobsByCompany).toHaveLength(2);
      expect(result.jobsByCompany[0]).toEqual({ company: 'Company A', count: 50 });
    });

    it('should count only active jobs for totalJobs', async () => {
      prisma.job.count.mockResolvedValue(0);
      prisma.job.groupBy.mockResolvedValue([]);
      prisma.company.findMany.mockResolvedValue([]);

      await jobService.getOverallStats();

      expect(prisma.job.count).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });

    it('should count recent jobs from last 7 days', async () => {
      prisma.job.count.mockResolvedValue(0);
      prisma.job.groupBy.mockResolvedValue([]);
      prisma.company.findMany.mockResolvedValue([]);

      await jobService.getOverallStats();

      const calls = prisma.job.count.mock.calls;
      const recentJobsCall = calls.find(call =>
        call[0]?.where?.postedAt?.gte
      );

      expect(recentJobsCall).toBeTruthy();
      const gteDate = recentJobsCall[0].where.postedAt.gte;
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Allow 1 second tolerance
      expect(Math.abs(gteDate.getTime() - sevenDaysAgo.getTime())).toBeLessThan(1000);
    });
  });

  describe('getFilterOptions', () => {
    it('should return unique departments, locations, jobTypes, and experiences', async () => {
      prisma.job.findMany.mockImplementation((args: any) => {
        if (args.select.department) return Promise.resolve([{ department: '개발' }, { department: '디자인' }]);
        if (args.select.location) return Promise.resolve([{ location: '서울' }, { location: '경기' }]);
        if (args.select.jobType) return Promise.resolve([{ jobType: '정규직' }, { jobType: '계약직' }]);
        if (args.select.experience) return Promise.resolve([{ experience: '신입' }, { experience: '경력' }]);
        return Promise.resolve([]);
      });

      const result = await jobService.getFilterOptions();

      expect(result.departments).toContain('전체');
      expect(result.departments).toContain('개발');
      expect(result.departments).toContain('디자인');

      expect(result.locations).toContain('전체');
      expect(result.locations).toContain('서울');
      expect(result.locations).toContain('경기');

      expect(result.jobTypes).toContain('전체');
      expect(result.jobTypes).toContain('정규직');

      expect(result.experiences).toContain('전체');
      expect(result.experiences).toContain('신입');
    });

    it('should include "전체" as the first option', async () => {
      prisma.job.findMany.mockResolvedValue([{ department: '개발' }]);

      const result = await jobService.getFilterOptions();

      expect(result.departments[0]).toBe('전체');
      expect(result.locations[0]).toBe('전체');
      expect(result.jobTypes[0]).toBe('전체');
      expect(result.experiences[0]).toBe('전체');
    });

    it('should exclude null values', async () => {
      prisma.job.findMany.mockImplementation((args: any) => {
        if (args.select.department) {
          return Promise.resolve([
            { department: '개발' },
            { department: null },
            { department: '' },
          ]);
        }
        return Promise.resolve([]);
      });

      const result = await jobService.getFilterOptions();

      expect(result.departments).not.toContain(null);
      expect(result.departments).not.toContain('');
      expect(result.departments).toContain('개발');
    });

    it('should only query active jobs', async () => {
      prisma.job.findMany.mockResolvedValue([]);

      await jobService.getFilterOptions();

      const calls = prisma.job.findMany.mock.calls;
      calls.forEach(call => {
        expect(call[0].where.isActive).toBe(true);
      });
    });

    it('should sort options alphabetically', async () => {
      prisma.job.findMany.mockImplementation((args: any) => {
        if (args.select.location) {
          return Promise.resolve([
            { location: '서울' },
            { location: '경기' },
            { location: '부산' },
          ]);
        }
        return Promise.resolve([]);
      });

      const result = await jobService.getFilterOptions();

      // After "전체", should be sorted
      const locationsWithoutAll = result.locations.slice(1);
      const sorted = [...locationsWithoutAll].sort();
      expect(locationsWithoutAll).toEqual(sorted);
    });
  });
});
