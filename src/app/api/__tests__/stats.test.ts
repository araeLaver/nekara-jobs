/**
 * Stats API Tests
 *
 * Tests for GET /api/stats endpoint
 */

import { GET } from '../stats/route';
import { prisma, resetAllMocks } from '../../../lib/__mocks__/prisma';

// Mock the prisma module
jest.mock('@/lib/prisma', () => require('../../../lib/__mocks__/prisma'));

describe('GET /api/stats', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it('should return all stats', async () => {
    prisma.job.count.mockResolvedValueOnce(500); // totalJobs
    prisma.job.count.mockResolvedValueOnce(50);  // recentJobs
    prisma.company.count.mockResolvedValue(10);
    prisma.company.findMany.mockResolvedValue([
      { id: 'c1', name: 'Company A', _count: { jobs: 200 } },
      { id: 'c2', name: 'Company B', _count: { jobs: 150 } },
      { id: 'c3', name: 'Company C', _count: { jobs: 0 } },
    ]);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.totalJobs).toBe(500);
    expect(json.totalCompanies).toBe(10);
    expect(json.recentJobs).toBe(50);
    expect(json.jobsByCompany).toHaveLength(2); // Excludes company with 0 jobs
  });

  it('should filter out companies with no jobs', async () => {
    prisma.job.count.mockResolvedValue(100);
    prisma.company.count.mockResolvedValue(5);
    prisma.company.findMany.mockResolvedValue([
      { id: 'c1', name: 'Active Company', _count: { jobs: 50 } },
      { id: 'c2', name: 'Inactive Company', _count: { jobs: 0 } },
    ]);

    const response = await GET();
    const json = await response.json();

    expect(json.jobsByCompany).toHaveLength(1);
    expect(json.jobsByCompany[0].company).toBe('Active Company');
    expect(json.jobsByCompany[0].count).toBe(50);
  });

  it('should include Cache-Control header', async () => {
    prisma.job.count.mockResolvedValue(0);
    prisma.company.count.mockResolvedValue(0);
    prisma.company.findMany.mockResolvedValue([]);

    const response = await GET();
    const cacheControl = response.headers.get('Cache-Control');

    expect(cacheControl).toBe('public, s-maxage=300, stale-while-revalidate=600');
  });

  it('should handle database errors', async () => {
    prisma.job.count.mockRejectedValue(new Error('Database error'));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBeTruthy();
  });

  it('should count only active jobs', async () => {
    prisma.job.count.mockResolvedValue(0);
    prisma.company.count.mockResolvedValue(0);
    prisma.company.findMany.mockResolvedValue([]);

    await GET();

    expect(prisma.job.count).toHaveBeenCalledWith({
      where: { isActive: true },
    });
  });

  it('should count recent jobs from last 7 days', async () => {
    prisma.job.count.mockResolvedValue(0);
    prisma.company.count.mockResolvedValue(0);
    prisma.company.findMany.mockResolvedValue([]);

    await GET();

    // Find the call with postedAt filter
    const calls = prisma.job.count.mock.calls;
    const recentCall = calls.find(call => call[0]?.where?.postedAt?.gte);

    expect(recentCall).toBeTruthy();
    const gteDate = recentCall[0].where.postedAt.gte;
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Allow some tolerance for test execution time
    expect(Math.abs(gteDate.getTime() - sevenDaysAgo.getTime())).toBeLessThan(5000);
  });
});
